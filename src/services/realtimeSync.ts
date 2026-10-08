import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Transaction } from '../types/database';

export interface RealtimeSyncCallbacks {
  onInsert?: (tx: Transaction) => void;
  onUpdate?: (tx: Transaction) => void;
  onDelete?: (txId: string) => void;
  onStatusChange?: (status: string) => void;
}

let activeChannel: RealtimeChannel | null = null;

/**
 * KHỞI TẠO REALTIME SUBSCRIPTION ĐỒNG BỘ 2 CHIỀU CHO GIAO DỊCH
 * Tự động lắng nghe INSERT / UPDATE / DELETE từ Supabase Realtime Engine
 * 
 * NGUYÊN TẮC BẢO MẬT & CHI PHÍ:
 * - Chế độ Khách (Guest) và Demo tuyệt đối KHÔNG khởi tạo Realtime WebSocket để tránh tốn kết nối máy chủ.
 * - Chỉ đăng ký lắng nghe dữ liệu thuộc về chính `user_id` của phiên đăng nhập thật.
 */
export function initRealtimeTransactionSync(
  userId: string,
  callbacks: RealtimeSyncCallbacks
): () => void {
  // 1. GUEST SYNC GUARD: Bỏ qua hoàn toàn đối với Khách hoặc Demo
  if (
    !userId ||
    userId.startsWith('guest') ||
    userId.startsWith('demo') ||
    userId === 'seed-user'
  ) {
    return () => {};
  }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured =
    Boolean(supabaseUrl) && !supabaseUrl?.includes('placeholder');

  if (!isSupabaseConfigured) {
    return () => {};
  }

  // 2. Dọn dẹp kênh cũ nếu đang tồn tại
  if (activeChannel) {
    supabase.removeChannel(activeChannel).catch(() => {});
    activeChannel = null;
  }

  try {
    const channelName = `kepi-transactions-${userId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && callbacks.onInsert) {
            callbacks.onInsert(payload.new as Transaction);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && callbacks.onUpdate) {
            callbacks.onUpdate(payload.new as Transaction);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.old && payload.old.id && callbacks.onDelete) {
            callbacks.onDelete(payload.old.id);
          }
        }
      )
      .subscribe((status) => {
        if (callbacks.onStatusChange) {
          callbacks.onStatusChange(status);
        }
      });

    activeChannel = channel;

    // Trả về hàm hủy đăng ký (unsubscribe cleanup)
    return () => {
      if (activeChannel === channel) {
        supabase.removeChannel(channel).catch(() => {});
        activeChannel = null;
      }
    };
  } catch (error) {
    console.warn('[RealtimeSync] Failed to initialize Realtime subscription:', error);
    return () => {};
  }
}

/**
 * Hủy đăng ký thủ công toàn bộ kênh Realtime đang hoạt động
 */
export function teardownRealtimeTransactionSync(): void {
  if (activeChannel) {
    supabase.removeChannel(activeChannel).catch(() => {});
    activeChannel = null;
  }
}
