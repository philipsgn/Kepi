import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, CalendarDaySummary, TransactionType, PaymentMethod, TransactionSource, MediaType } from '../types/database';
import { useBudgetStore } from './budgetStore';
import { useGamificationStore } from './gamificationStore';
import { syncBudgetToLockScreen } from '../services/lockScreenService';

const STORAGE_KEY = 'vi_locket_transactions_data';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  selectedDate: string; // 'YYYY-MM-DD'
  selectedMonth: { year: number; month: number }; // month is 1-12

  // Actions
  loadTransactions: (userId: string) => Promise<void>;
  addTransaction: (tx: {
    userId: string;
    type: TransactionType;
    amount: number;
    category: string;
    description: string | null;
    photo_url: string | null;
    thumbnail_url?: string | null;
    payment_method?: PaymentMethod;
    source: TransactionSource;
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    payee_name?: string | null;
    bank_bin?: string | null;
    qr_kind?: 'STATIC' | 'DYNAMIC' | null;
    pending_expires_at?: string | null;
    media_type?: MediaType;
    is_squad_private?: boolean;
    desc_position?: { x: number; y: number } | null;
  }) => Promise<Transaction>;
  confirmPendingTransaction: (id: string, updatedAmount?: number) => Promise<void>;
  cancelPendingTransaction: (id: string) => Promise<void>;
  getPendingTransactions: () => Transaction[];
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setSelectedDate: (dateStr: string) => void;
  setSelectedMonth: (year: number, month: number) => void;
  getTransactionsByDate: (dateStr: string) => Transaction[];
  getMonthCalendarSummaries: (year: number, month: number) => CalendarDaySummary[];
  stopRealtimeSync: () => void;
}

const getTodayDateStr = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const useTransactionStore = create<TransactionState>((set, get) => {
  const now = new Date();

  return {
    transactions: [],
    isLoading: false,
    selectedDate: getTodayDateStr(),
    selectedMonth: { year: now.getFullYear(), month: now.getMonth() + 1 },

    loadTransactions: async (_userId: string) => {
      set({ isLoading: true });

      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed: Transaction[] = JSON.parse(cached);
          const finalTxs = parsed;
          set({ transactions: finalTxs, isLoading: false });
          // Tự động tính toán lại ngân sách từ lịch sử giao dịch và kết chuyển ngày nếu sang ngày mới
          useBudgetStore.getState().recalculateFromTransactions(finalTxs);
          useBudgetStore.getState().checkAndApplyDailyRollover(finalTxs).catch(() => {});
        } else {
          // Bắt đầu từ số 0: 0 giao dịch giả, 0 hardcore numbers
          set({ transactions: [], isLoading: false });
          useBudgetStore.getState().recalculateFromTransactions([]);
          useBudgetStore.getState().checkAndApplyDailyRollover([]).catch(() => {});
        }
      } catch (err) {
        set({ transactions: [], isLoading: false });
      }
    },

    addTransaction: async (data) => {
      const txStatus = data.status || 'CONFIRMED';
      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        user_id: data.userId,
        type: data.type,
        amount: data.amount,
        category: data.category,
        description: data.description,
        photo_url: data.photo_url,
        thumbnail_url: data.thumbnail_url || data.photo_url,
        payment_method: data.payment_method || 'BANK',
        source: data.source,
        status: txStatus,
        payee_name: data.payee_name || null,
        bank_bin: data.bank_bin || null,
        qr_kind: data.qr_kind || null,
        pending_expires_at: data.pending_expires_at || null,
        media_type: data.media_type || 'PHOTO',
        is_squad_private: Boolean(data.is_squad_private),
        desc_position: data.desc_position || null,
        occurred_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const updated = [newTx, ...get().transactions];
      set({ transactions: updated });

      // Lưu 100% offline cục bộ (0ms UI lag)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // QUY TẮC CÁCH LY PHÉP TÍNH BẤT DI BẤT DỊCH (SINGLE SOURCE OF TRUTH):
      // Tự động tính toán lại ngân sách trực tiếp từ mảng giao dịch
      if (txStatus === 'CONFIRMED') {
        useBudgetStore.getState().recalculateFromTransactions(updated);
        useGamificationStore.getState().addGameTickets(1);
        syncBudgetToLockScreen().catch(() => {});
      }

      return newTx;
    },

    confirmPendingTransaction: async (id: string, updatedAmount?: number) => {
      const tx = get().transactions.find((t) => t.id === id);
      if (!tx) return;

      const finalAmount = updatedAmount !== undefined && updatedAmount > 0 ? updatedAmount : tx.amount;
      const updates: Partial<Transaction> = {
        status: 'CONFIRMED',
        amount: finalAmount,
      };

      const updated = get().transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      set({ transactions: updated });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // SINGLE SOURCE OF TRUTH: Tự động đồng bộ toàn bộ ngân sách và số dư
      useBudgetStore.getState().recalculateFromTransactions(updated);
      useGamificationStore.getState().addGameTickets(1);
      syncBudgetToLockScreen().catch(() => {});
    },

    cancelPendingTransaction: async (id: string) => {
      const updates: Partial<Transaction> = {
        status: 'CANCELLED',
      };
      const updated = get().transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      set({ transactions: updated });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      useBudgetStore.getState().recalculateFromTransactions(updated);
    },

    getPendingTransactions: () => {
      const now = Date.now();
      const SEVEN_DAYS_MS = 7 * 24 * 3600 * 1000;
      const currentList = get().transactions;

      // Tự động dọn dẹp: Các khoản PENDING quá 7 ngày tự động chuyển sang CANCELLED
      let hasExpired = false;
      const cleanedList = currentList.map((t) => {
        if (t.status === 'PENDING') {
          const createdTime = new Date(t.created_at).getTime();
          if (now - createdTime > SEVEN_DAYS_MS) {
            hasExpired = true;
            return { ...t, status: 'CANCELLED' as const };
          }
        }
        return t;
      });

      if (hasExpired) {
        set({ transactions: cleanedList });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedList)).catch(() => {});
      }

      // Giữ lại 100% các khoản PENDING (kể cả >24h) để người dùng chủ động xử lý
      return cleanedList.filter((t) => t.status === 'PENDING');
    },

    updateTransaction: async (id: string, updates: Partial<Transaction>) => {
      const updated = get().transactions.map((t) => (t.id === id ? { ...t, ...updates } : t));
      set({ transactions: updated });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // SINGLE SOURCE OF TRUTH: Cập nhật lại toàn bộ ngân sách khi sửa số tiền / ngày
      useBudgetStore.getState().recalculateFromTransactions(updated);
      syncBudgetToLockScreen().catch(() => {});
    },

    deleteTransaction: async (id: string) => {
      const updated = get().transactions.filter((t) => t.id !== id);
      set({ transactions: updated });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // SINGLE SOURCE OF TRUTH: Hoàn lại tiền vào ngân sách và số dư khi xóa khoản chi
      useBudgetStore.getState().recalculateFromTransactions(updated);
      syncBudgetToLockScreen().catch(() => {});
    },

    setSelectedDate: (dateStr: string) => {
      set({ selectedDate: dateStr });
    },

    setSelectedMonth: (year: number, month: number) => {
      set({ selectedMonth: { year, month } });
    },

    getTransactionsByDate: (dateStr: string) => {
      return get().transactions.filter((tx) => {
        const txDate = tx.occurred_at.split('T')[0];
        return txDate === dateStr;
      });
    },

    getMonthCalendarSummaries: (year: number, month: number) => {
      const { transactions } = get();
      const todayStr = getTodayDateStr();

      // Số ngày trong tháng đã chọn
      const daysInMonth = new Date(year, month, 0).getDate();
      const summaries: CalendarDaySummary[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = String(day).padStart(2, '0');
        const monthStr = String(month).padStart(2, '0');
        const dateKey = `${year}-${monthStr}-${dayStr}`;

        // Lọc giao dịch của ngày này — CHỈ tính các khoản đã xác nhận (CONFIRMED)
        const dayTxs = transactions.filter((tx) => {
          const matchDate = tx.occurred_at.split('T')[0] === dateKey;
          const isConfirmed = tx.status === 'CONFIRMED' || (!tx.status as any);
          return matchDate && isConfirmed;
        });

        let totalSpent = 0;
        let totalIncome = 0;
        let thumbnailUrl: string | null = null;

        dayTxs.forEach((tx) => {
          if (tx.type === 'EXPENSE') {
            totalSpent += tx.amount;
          } else if (tx.type === 'INCOME') {
            totalIncome += tx.amount;
          }
          if (!thumbnailUrl) {
            thumbnailUrl = tx.thumbnail_url || tx.photo_url;
          }
        });

        summaries.push({
          date: dateKey,
          dayNumber: day,
          thumbnailUrl,
          totalSpent,
          totalIncome,
          itemCount: dayTxs.length,
          isToday: dateKey === todayStr,
          hasSkippedItem: false,
        });
      }

      return summaries;
    },

    stopRealtimeSync: () => {
      // 100% Local-First Engine: No cloud WebSocket connection required
    },
  };
});
