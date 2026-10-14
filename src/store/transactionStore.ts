import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, CalendarDaySummary, TransactionType, PaymentMethod, TransactionSource } from '../types/database';
import { useBudgetStore } from './budgetStore';
import { enqueueMutation, flushSyncQueue, syncDownTransactions } from '../services/offlineSync';
import { initRealtimeTransactionSync, teardownRealtimeTransactionSync } from '../services/realtimeSync';
import { syncBudgetToLockScreen } from '../services/lockScreenService';


const STORAGE_KEY = 'vi_locket_transactions_data';

// Dữ liệu mẫu mang đậm chất thu đông Hà Nội với hình ảnh đẹp mắt
const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-seed-1',
    user_id: 'seed-user',
    type: 'EXPENSE',
    amount: 45000,
    category: 'Ăn uống',
    description: 'Cà phê trứng Giảng phố Yên Phụ',
    photo_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    payment_method: 'BANK',
    source: 'PHOTO',
    status: 'CONFIRMED',
    occurred_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 'tx-seed-2',
    user_id: 'seed-user',
    type: 'EXPENSE',
    amount: 65000,
    category: 'Ăn uống',
    description: 'Phở bò tái lăn Lý Quốc Sư',
    photo_url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=80',
    payment_method: 'CASH',
    source: 'MANUAL',
    status: 'CONFIRMED',
    occurred_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
    created_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(),
  },
  {
    id: 'tx-seed-3',
    user_id: 'seed-user',
    type: 'EXPENSE',
    amount: 35000,
    category: 'Ăn vặt',
    description: 'Bánh rán mật Hàng Chiếu',
    photo_url: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80',
    payment_method: 'CASH',
    source: 'PHOTO',
    status: 'CONFIRMED',
    occurred_at: new Date(Date.now() - 3600 * 1000 * 26).toISOString(), // Hôm qua
    created_at: new Date(Date.now() - 3600 * 1000 * 26).toISOString(),
  },
  {
    id: 'tx-seed-4',
    user_id: 'seed-user',
    type: 'EXPENSE',
    amount: 280000,
    category: 'Mua sắm',
    description: 'Khăn len cashmere ấm áp phố Chả Cá',
    photo_url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&auto=format&fit=crop&q=80',
    payment_method: 'BANK',
    source: 'MANUAL',
    status: 'CONFIRMED',
    occurred_at: new Date(Date.now() - 3600 * 1000 * 50).toISOString(), // 2 ngày trước
    created_at: new Date(Date.now() - 3600 * 1000 * 50).toISOString(),
  },
  {
    id: 'tx-seed-5',
    user_id: 'seed-user',
    type: 'EXPENSE',
    amount: 50000,
    category: 'Ăn uống',
    description: 'Cốm non xào dừa Mễ Trì',
    photo_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
    payment_method: 'CASH',
    source: 'PHOTO',
    status: 'CONFIRMED',
    occurred_at: new Date(Date.now() - 3600 * 1000 * 74).toISOString(), // 3 ngày trước
    created_at: new Date(Date.now() - 3600 * 1000 * 74).toISOString(),
  },
  {
    id: 'tx-seed-6',
    user_id: 'seed-user',
    type: 'EXPENSE',
    amount: 120000,
    category: 'Đọc sách',
    description: 'Sách thơ Nguyễn Bính phố Đinh Lễ',
    photo_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    payment_method: 'BANK',
    source: 'MANUAL',
    status: 'CONFIRMED',
    occurred_at: new Date(Date.now() - 3600 * 1000 * 98).toISOString(), // 4 ngày trước
    created_at: new Date(Date.now() - 3600 * 1000 * 98).toISOString(),
  },
  {
    id: 'tx-seed-7',
    user_id: 'seed-user',
    type: 'INCOME',
    amount: 2500000,
    category: 'Thu nhập',
    description: 'Nhuận bút dự án thiết kế mùa thu',
    photo_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    payment_method: 'BANK',
    source: 'MANUAL',
    status: 'CONFIRMED',
    occurred_at: new Date(Date.now() - 3600 * 1000 * 120).toISOString(), // 5 ngày trước
    created_at: new Date(Date.now() - 3600 * 1000 * 120).toISOString(),
  },
];

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
    payment_method: PaymentMethod;
    source: TransactionSource;
    status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    payee_name?: string | null;
    bank_bin?: string | null;
    qr_kind?: 'STATIC' | 'DYNAMIC' | null;
    pending_expires_at?: string | null;
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

    loadTransactions: async (userId: string) => {
      set({ isLoading: true });
      const isRealUser =
        Boolean(userId) &&
        !userId.startsWith('guest') &&
        !userId.startsWith('demo') &&
        userId !== 'seed-user';

      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed: Transaction[] = JSON.parse(cached);
          // Loại bỏ toàn bộ dữ liệu seed mẫu cũ nếu còn sót lại trong cache
          const finalTxs = parsed.filter(
            (t) => !t.id.startsWith('tx-seed-') && t.user_id !== 'seed-user'
          );
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

      // GUEST GUARD: Chỉ đồng bộ với Supabase khi là người dùng thật
      if (isRealUser) {
        syncDownTransactions(userId)
          .then(async (remoteTxs) => {
            if (remoteTxs && remoteTxs.length > 0) {
              const local = get().transactions;
              const existingIds = new Set(local.map((t) => t.id));
              const newFromRemote = remoteTxs.filter((t) => !existingIds.has(t.id));
              if (newFromRemote.length > 0) {
                const merged = [...newFromRemote, ...local];
                set({ transactions: merged });
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                useBudgetStore.getState().recalculateFromTransactions(merged);
              }
            }
          })
          .catch(() => {});

        // Đẩy các mutation hợp lệ còn tồn đọng
        flushSyncQueue().catch(() => {});

        // KHỞI ĐỘNG KÊNH REALTIME WEBSOCKET 2 CHIỀU:
        initRealtimeTransactionSync(userId, {
          onInsert: (newTx) => {
            const current = get().transactions;
            if (!current.some((t) => t.id === newTx.id)) {
              const updated = [newTx, ...current];
              set({ transactions: updated });
              AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
              if (newTx.status === 'CONFIRMED') {
                const budgetStore = useBudgetStore.getState();
                if (newTx.type === 'EXPENSE') budgetStore.recordExpense(newTx.amount);
                else if (newTx.type === 'INCOME') budgetStore.recordIncome(newTx.amount);
              }
            }
          },
          onUpdate: (updatedTx) => {
            const current = get().transactions;
            const updated = current.map((t) => (t.id === updatedTx.id ? updatedTx : t));
            set({ transactions: updated });
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
          },
          onDelete: (deletedId) => {
            const current = get().transactions;
            const updated = current.filter((t) => t.id !== deletedId);
            set({ transactions: updated });
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
          },
        });
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
        payment_method: data.payment_method,
        source: data.source,
        status: txStatus,
        payee_name: data.payee_name || null,
        bank_bin: data.bank_bin || null,
        qr_kind: data.qr_kind || null,
        pending_expires_at: data.pending_expires_at || null,
        occurred_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      const updated = [newTx, ...get().transactions];
      set({ transactions: updated });

      // Lưu offline tức thì (0ms UI lag)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // GUEST GUARD: Chỉ đưa vào hàng đợi đồng bộ ngoại tuyến nếu là người dùng thật
      const isGuestOrDemo =
        !data.userId ||
        data.userId.startsWith('guest') ||
        data.userId.startsWith('demo') ||
        data.userId === 'seed-user';

      if (!isGuestOrDemo) {
        await enqueueMutation('ADD_TRANSACTION', newTx);
        flushSyncQueue().catch(() => {});
      }

      // QUY TẮC CÁCH LY PHÉP TÍNH BẤT DI BẤT DỊCH (SINGLE SOURCE OF TRUTH):
      // Tự động tính toán lại ngân sách trực tiếp từ mảng giao dịch
      if (txStatus === 'CONFIRMED') {
        useBudgetStore.getState().recalculateFromTransactions(updated);
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

      await enqueueMutation('UPDATE_TRANSACTION', { id, ...updates });
      flushSyncQueue().catch(() => {});

      // SINGLE SOURCE OF TRUTH: Tự động đồng bộ toàn bộ ngân sách và số dư
      useBudgetStore.getState().recalculateFromTransactions(updated);
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

      await enqueueMutation('UPDATE_TRANSACTION', { id, ...updates });
      flushSyncQueue().catch(() => {});

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
      const existing = get().transactions.find((t) => t.id === id);
      const updated = get().transactions.map((t) => (t.id === id ? { ...t, ...updates } : t));
      set({ transactions: updated });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // SINGLE SOURCE OF TRUTH: Cập nhật lại toàn bộ ngân sách khi sửa số tiền / ngày
      useBudgetStore.getState().recalculateFromTransactions(updated);
      syncBudgetToLockScreen().catch(() => {});

      const isGuestOrDemo =
        !existing?.user_id ||
        existing.user_id.startsWith('guest') ||
        existing.user_id.startsWith('demo') ||
        existing.user_id === 'seed-user';

      if (!isGuestOrDemo) {
        await enqueueMutation('UPDATE_TRANSACTION', { id, ...updates });
        flushSyncQueue().catch(() => {});
      }
    },

    deleteTransaction: async (id: string) => {
      const existing = get().transactions.find((t) => t.id === id);
      const updated = get().transactions.filter((t) => t.id !== id);
      set({ transactions: updated });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // SINGLE SOURCE OF TRUTH: Hoàn lại tiền vào ngân sách và số dư khi xóa khoản chi
      useBudgetStore.getState().recalculateFromTransactions(updated);
      syncBudgetToLockScreen().catch(() => {});

      const isGuestOrDemo =
        !existing?.user_id ||
        existing.user_id.startsWith('guest') ||
        existing.user_id.startsWith('demo') ||
        existing.user_id === 'seed-user';

      if (!isGuestOrDemo) {
        // Đưa vào hàng đợi xóa trên Supabase
        await enqueueMutation('DELETE_TRANSACTION', { id });
        flushSyncQueue().catch(() => {});
      }
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
      teardownRealtimeTransactionSync();
    },
  };
});
