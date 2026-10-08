import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { Transaction } from '../types/database';

export type MutationType =
  | 'ADD_TRANSACTION'
  | 'UPDATE_TRANSACTION'
  | 'DELETE_TRANSACTION'
  | 'RESOLVE_WAIT_ITEM'
  | 'UPDATE_BUDGET';

export interface SyncMutation {
  id: string;
  type: MutationType;
  payload: any;
  createdAt: string;
  attempts: number;
}

const SYNC_QUEUE_KEY = 'vi_locket_offline_sync_queue';
let isSyncing = false;

/**
 * Đưa một thao tác mới vào hàng đợi ngoại tuyến
 */
export async function enqueueMutation(
  type: MutationType,
  payload: any
): Promise<SyncMutation> {
  const mutation: SyncMutation = {
    id: `mut-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };

  // GUEST SYNC GUARD: Tuyệt đối không lưu mutation của Guest / Demo để không tốn CSDL Supabase
  const targetUserId = payload?.user_id;
  if (
    targetUserId &&
    (targetUserId.startsWith('guest') ||
      targetUserId.startsWith('demo') ||
      targetUserId === 'seed-user')
  ) {
    return mutation;
  }

  try {
    const queueStr = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    const queue: SyncMutation[] = queueStr ? JSON.parse(queueStr) : [];
    queue.push(mutation);
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('[OfflineSync] Failed to enqueue mutation:', err);
  }

  return mutation;
}

/**
 * Lấy toàn bộ danh sách các thao tác chưa đồng bộ
 */
export async function getPendingMutations(): Promise<SyncMutation[]> {
  try {
    const queueStr = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return queueStr ? JSON.parse(queueStr) : [];
  } catch {
    return [];
  }
}

/**
 * Đẩy toàn bộ các thay đổi trong hàng đợi lên Supabase Database (Auto Flush Engine)
 */
export async function flushSyncQueue(): Promise<{
  successCount: number;
  remainingCount: number;
}> {
  if (isSyncing) {
    return { successCount: 0, remainingCount: 0 };
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured =
    Boolean(supabaseUrl) && !supabaseUrl?.includes('placeholder');

  if (!isSupabaseConfigured) {
    return { successCount: 0, remainingCount: 0 };
  }

  isSyncing = true;
  let successCount = 0;

  try {
    const queue = await getPendingMutations();
    if (queue.length === 0) {
      isSyncing = false;
      return { successCount: 0, remainingCount: 0 };
    }

    const remainingQueue: SyncMutation[] = [];

    for (const item of queue) {
      let isSuccess = false;

      try {
        switch (item.type) {
          case 'ADD_TRANSACTION': {
            const tx: Transaction = item.payload;
            const { error } = await supabase.from('transactions').upsert(
              {
                id: tx.id,
                user_id: tx.user_id,
                type: tx.type,
                amount: tx.amount,
                category: tx.category,
                description: tx.description,
                photo_url: tx.photo_url,
                payment_method: tx.payment_method,
                source: tx.source,
                status: tx.status || 'CONFIRMED',
                payee_name: tx.payee_name || null,
                bank_bin: tx.bank_bin || null,
                qr_kind: tx.qr_kind || null,
                pending_expires_at: tx.pending_expires_at || null,
                occurred_at: tx.occurred_at,
                created_at: tx.created_at,
              },
              { onConflict: 'id' }
            );
            if (!error) isSuccess = true;
            break;
          }

          case 'UPDATE_TRANSACTION': {
            const { id, ...updates } = item.payload;
            const { error } = await supabase
              .from('transactions')
              .update(updates)
              .eq('id', id);
            if (!error) isSuccess = true;
            break;
          }

          case 'DELETE_TRANSACTION': {
            const txId: string = item.payload.id;
            const { error } = await supabase
              .from('transactions')
              .delete()
              .eq('id', txId);
            if (!error) isSuccess = true;
            break;
          }

          case 'RESOLVE_WAIT_ITEM': {
            const { itemId, status } = item.payload;
            const { error } = await supabase
              .from('wait_basket')
              .update({
                status,
                decided_at: new Date().toISOString(),
              })
              .eq('id', itemId);
            if (!error) isSuccess = true;
            break;
          }

          case 'UPDATE_BUDGET': {
            const settings = item.payload;
            const { error } = await supabase
              .from('financial_settings')
              .upsert(settings, { onConflict: 'user_id' });
            if (!error) isSuccess = true;
            break;
          }
        }
      } catch (mutationErr) {
        console.warn(`[OfflineSync] Error processing mutation ${item.id}:`, mutationErr);
      }

      if (isSuccess) {
        successCount++;
      } else {
        // Tăng số lần thử và giữ lại trong queue
        item.attempts += 1;
        remainingQueue.push(item);
      }
    }

    // Cập nhật lại hàng đợi
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remainingQueue));
    isSyncing = false;
    return { successCount, remainingCount: remainingQueue.length };
  } catch (err) {
    console.warn('[OfflineSync] Flush queue encountered unexpected error:', err);
    isSyncing = false;
    return { successCount: 0, remainingCount: 0 };
  }
}

/**
 * Đồng bộ kéo từ Supabase về Client (Bidirectional Sync Down)
 */
export async function syncDownTransactions(
  userId: string
): Promise<Transaction[] | null> {
  // GUEST SYNC GUARD: Tài khoản Khách / Demo không query từ Supabase về
  if (
    !userId ||
    userId.startsWith('guest') ||
    userId.startsWith('demo') ||
    userId === 'seed-user'
  ) {
    return null;
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured =
    Boolean(supabaseUrl) && !supabaseUrl?.includes('placeholder');

  if (!isSupabaseConfigured) return null;


  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('occurred_at', { ascending: false })
      .limit(150);

    if (error || !data) return null;
    return data as Transaction[];
  } catch {
    return null;
  }
}
