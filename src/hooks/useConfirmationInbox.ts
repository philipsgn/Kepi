import { useMemo, useState, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useTransactionStore } from '../store/transactionStore';
import { useWaitBasketStore } from '../store/waitBasketStore';
import { useAuthStore } from '../store/authStore';
import { Transaction, TransactionType, WaitBasketItem } from '../types/database';
import { trackEvent } from '../services/analytics';

export type InboxItemSource = 'QR' | 'WAIT' | 'SCREENSHOT' | 'MANUAL';

export interface ConfirmationInboxItem {
  id: string;
  itemType: 'TRANSACTION_PENDING' | 'WAIT_BASKET_DUE';
  title: string;
  amount: number;
  category: string;
  description: string;
  photoUrl: string | null;
  bankBin: string | null;
  createdAt: string;
  source: InboxItemSource;
  isOverdue?: boolean; // true nếu là khoản QR quá 24h, hiển thị trong mục "Chưa xác nhận"
  originalData: Transaction | WaitBasketItem;
}

export interface LastInboxAction {
  id: string;
  type: 'CONFIRM' | 'DISMISS';
  item: ConfirmationInboxItem;
  timestamp: number;
}

export function useConfirmationInbox() {
  const transactions = useTransactionStore((state) => state.transactions);
  const confirmPendingTransaction = useTransactionStore((state) => state.confirmPendingTransaction);
  const cancelPendingTransaction = useTransactionStore((state) => state.cancelPendingTransaction);
  const updateTransaction = useTransactionStore((state) => state.updateTransaction);
  const addTransaction = useTransactionStore((state) => state.addTransaction);
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);

  const waitItems = useWaitBasketStore((state) => state.items);
  const resolveWaitItem = useWaitBasketStore((state) => state.resolveItem);
  const addWaitItem = useWaitBasketStore((state) => state.addItem);

  const user = useAuthStore((state) => state.user);

  // Optimistic exclusion IDs (when user taps Lưu or Bỏ, item disappears immediately)
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

  // 5-second Undo state
  const [lastAction, setLastAction] = useState<LastInboxAction | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Compute pending transactions (Luồng 1 QR giữ vô hạn/phân mục, Luồng 2 SCREENSHOT giữ 7 ngày) + deduplication
  const pendingTxs = useMemo(() => {
    const now = Date.now();
    const list = transactions.filter((t) => {
      if (t.status !== 'PENDING') return false;
      const createdTime = new Date(t.created_at).getTime();
      const ageMs = now - createdTime;

      // Luồng 2 (Upload nhiều ảnh SCREENSHOT): Giữ tối đa 7 ngày
      if (t.source === 'SCREENSHOT') {
        return ageMs <= 7 * 24 * 3600 * 1000;
      }

      // Luồng 1 (QR Pending): Giữ lại toàn bộ (không bao giờ tự động biến mất), phân loại quá 24h
      return true;
    });

    // Deduplication rule (Spec 3.3):
    // Nếu có 2 khoản cùng số tiền và cùng nơi nhận phát sinh trong vòng 5 phút, tự động gộp thành 1 thẻ duy nhất
    const deduplicated: Transaction[] = [];
    for (const tx of list) {
      const isDuplicate = deduplicated.some((existing) => {
        const sameAmount = existing.amount === tx.amount;
        const samePayee = (existing.payee_name || existing.description) === (tx.payee_name || tx.description);
        const timeDiff = Math.abs(new Date(existing.created_at).getTime() - new Date(tx.created_at).getTime());
        return sameAmount && samePayee && timeDiff <= 5 * 60 * 1000;
      });
      if (!isDuplicate) {
        deduplicated.push(tx);
      }
    }
    return deduplicated;
  }, [transactions]);

  // Compute due wait basket items (>= 24h)
  const dueWaitItems = useMemo(() => {
    const now = Date.now();
    return waitItems.filter((i) => {
      if (i.status !== 'WAITING') return false;
      const createdTime = new Date(i.created_at).getTime();
      const isOver24h = now - createdTime >= 24 * 3600 * 1000;
      const isRemindDue = i.next_remind_at ? new Date(i.next_remind_at).getTime() <= now : false;
      return isOver24h || isRemindDue;
    });
  }, [waitItems]);

  // Combine into unified ConfirmationInboxItem array
  const inboxItems = useMemo<ConfirmationInboxItem[]>(() => {
    const now = Date.now();
    const items: ConfirmationInboxItem[] = [];

    // From Pending Transactions
    for (const tx of pendingTxs) {
      if (excludedIds.has(tx.id)) continue;
      const createdTime = new Date(tx.created_at).getTime();
      const isOverdue = tx.source === 'QR' && now - createdTime > 24 * 3600 * 1000;

      items.push({
        id: tx.id,
        itemType: 'TRANSACTION_PENDING',
        title: tx.payee_name || tx.description || 'Khoản chi VietQR',
        amount: tx.amount,
        category: tx.category || 'Ăn uống',
        description: tx.description || '',
        photoUrl: tx.photo_url,
        bankBin: tx.bank_bin || null,
        createdAt: tx.created_at,
        source: (tx.source as InboxItemSource) || 'QR',
        isOverdue,
        originalData: tx,
      });
    }

    // From Due Wait Basket Items
    for (const wi of dueWaitItems) {
      if (excludedIds.has(wi.id)) continue;
      items.push({
        id: wi.id,
        itemType: 'WAIT_BASKET_DUE',
        title: wi.item_name,
        amount: wi.amount,
        category: wi.category || 'Mua sắm',
        description: 'Món đồ phân vân hôm qua',
        photoUrl: wi.photo_url,
        bankBin: null,
        createdAt: wi.created_at,
        source: 'WAIT',
        originalData: wi,
      });
    }

    // Sort newest first
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [pendingTxs, dueWaitItems, excludedIds]);

  // Clear undo timer helper
  const clearUndoTimer = useCallback(() => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }, []);

  // Confirm item (Lưu vào sổ)
  const confirmItem = useCallback(
    async (
      item: ConfirmationInboxItem,
      overrides?: { amount?: number; category?: string; note?: string }
    ) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      // Optimistically hide
      setExcludedIds((prev) => new Set([...prev, item.id]));

      // Set undo action
      clearUndoTimer();
      setLastAction({
        id: item.id,
        type: 'CONFIRM',
        item,
        timestamp: Date.now(),
      });

      // Start 5-second countdown to permanently commit
      undoTimerRef.current = setTimeout(async () => {
        setLastAction(null);
        setExcludedIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });

        const finalAmount = overrides?.amount !== undefined ? overrides.amount : item.amount;
        const finalCategory = overrides?.category || item.category;
        const finalNote = overrides?.note || item.description;

        if (item.itemType === 'TRANSACTION_PENDING') {
          await confirmPendingTransaction(item.id, finalAmount);
          if (overrides?.category || overrides?.note) {
            await updateTransaction(item.id, {
              category: finalCategory,
              description: finalNote,
            });
          }
        } else if (item.itemType === 'WAIT_BASKET_DUE') {
          await resolveWaitItem(item.id, 'BOUGHT');
          await addTransaction({
            userId: user?.id || 'demo-user',
            type: 'EXPENSE',
            amount: finalAmount,
            category: finalCategory,
            description: finalNote || item.title,
            photo_url: item.photoUrl,
            thumbnail_url: item.photoUrl,
            payment_method: 'CASH',
            source: 'MANUAL',
            status: 'CONFIRMED',
          });
        }
        trackEvent('inbox_item_confirmed', {
          item_type: item.itemType,
          source: item.source,
          category: finalCategory,
        });
      }, 5000);
    },
    [clearUndoTimer, confirmPendingTransaction, updateTransaction, resolveWaitItem, addTransaction, user?.id]
  );

  // Dismiss item (Bỏ qua)
  const dismissItem = useCallback(
    async (item: ConfirmationInboxItem) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

      // Optimistically hide
      setExcludedIds((prev) => new Set([...prev, item.id]));

      // Set undo action
      clearUndoTimer();
      setLastAction({
        id: item.id,
        type: 'DISMISS',
        item,
        timestamp: Date.now(),
      });

      // Start 5-second countdown to permanently commit
      undoTimerRef.current = setTimeout(async () => {
        setLastAction(null);
        setExcludedIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });

        if (item.itemType === 'TRANSACTION_PENDING') {
          await cancelPendingTransaction(item.id);
        } else if (item.itemType === 'WAIT_BASKET_DUE') {
          await resolveWaitItem(item.id, 'SKIPPED');
        }
        trackEvent('inbox_item_dismissed', {
          item_type: item.itemType,
          source: item.source,
        });
      }, 5000);
    },
    [clearUndoTimer, cancelPendingTransaction, resolveWaitItem]
  );

  // Undo last action
  const undoLastAction = useCallback(() => {
    if (!lastAction) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    clearUndoTimer();

    // Restore item back to list
    setExcludedIds((prev) => {
      const next = new Set(prev);
      next.delete(lastAction.id);
      return next;
    });

    trackEvent('inbox_undo_tapped', {
      action_type: lastAction.type,
      source: lastAction.item.source,
    });
    setLastAction(null);
  }, [lastAction, clearUndoTimer]);

  // Save direct receipt screenshot transaction (Luồng 2 - Cách 1)
  const saveReceiptTransaction = useCallback(
    async (params: {
      photoUri: string | null;
      amount: number;
      category: string;
      description: string;
      type?: TransactionType;
      occurredAt?: string;
    }) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      const userId = user?.id || 'demo-user';

      const tx = await addTransaction({
        userId,
        type: params.type || 'EXPENSE',
        amount: params.amount,
        category: params.category,
        description: params.description || (params.type === 'INCOME' ? 'Khoản thu nhập' : 'Biên lai chuyển khoản'),
        photo_url: params.photoUri,
        thumbnail_url: params.photoUri,
        payment_method: 'BANK',
        source: 'SCREENSHOT',
        status: 'CONFIRMED',
      });

      trackEvent('receipt_saved', {
        has_photo: !!params.photoUri,
        type: params.type || 'EXPENSE',
        category: params.category,
      });

      return tx;
    },
    [addTransaction, user?.id]
  );

  // Add batch uploaded receipt screenshots into Inbox (for multi-select 2-10 photos)
  const addBatchPendingReceipts = useCallback(
    async (items: {
      photoUri: string;
      amount: number;
      category: string;
      description: string;
      occurredAt?: string;
    }[]) => {
      const userId = user?.id || 'demo-user';
      for (const item of items) {
        await addTransaction({
          userId,
          type: 'EXPENSE',
          amount: item.amount,
          category: item.category,
          description: item.description,
          photo_url: item.photoUri,
          thumbnail_url: item.photoUri,
          payment_method: 'BANK',
          source: 'SCREENSHOT',
          status: 'PENDING',
          pending_expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        });
      }
    },
    [addTransaction, user?.id]
  );

  return {
    inboxItems,
    totalCount: inboxItems.length,
    confirmItem,
    dismissItem,
    lastAction,
    undoLastAction,
    saveReceiptTransaction,
    addBatchPendingReceipts,
  };
}
