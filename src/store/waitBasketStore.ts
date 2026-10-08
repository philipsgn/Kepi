import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WaitBasketItem, WaitBasketStatus } from '../types/database';
import { enqueueMutation, flushSyncQueue } from '../services/offlineSync';

interface WaitBasketState {
  items: WaitBasketItem[];
  isLoading: boolean;

  // Actions
  addItem: (item: Omit<WaitBasketItem, 'id' | 'created_at' | 'status'>) => Promise<WaitBasketItem>;
  resolveItem: (id: string, outcome: 'BOUGHT' | 'SKIPPED') => Promise<void>;
  loadItems: (userId: string) => Promise<void>;
  getPendingTotalAmount: () => number;
}

export const useWaitBasketStore = create<WaitBasketState>((set, get) => ({
  items: [],
  isLoading: false,

  addItem: async (itemData) => {
    const newItem: WaitBasketItem = {
      ...itemData,
      id: `wait-${Date.now()}`,
      status: 'WAITING',
      created_at: new Date().toISOString(),
    };

    const updated = [newItem, ...get().items];
    set({ items: updated });
    await AsyncStorage.setItem('vi_locket_wait_basket', JSON.stringify(updated));

    return newItem;
  },

  resolveItem: async (id: string, outcome: 'BOUGHT' | 'SKIPPED') => {
    const updated = get().items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: outcome as WaitBasketStatus,
          decided_at: new Date().toISOString(),
        };
      }
      return item;
    });

    set({ items: updated });
    await AsyncStorage.setItem('vi_locket_wait_basket', JSON.stringify(updated));

    // Đưa vào hàng đợi đồng bộ trạng thái món lên mây
    await enqueueMutation('RESOLVE_WAIT_ITEM', { itemId: id, status: outcome });
    flushSyncQueue().catch(() => {});
  },

  loadItems: async (userId: string) => {
    try {
      const cached = await AsyncStorage.getItem('vi_locket_wait_basket');
      if (cached) {
        set({ items: JSON.parse(cached) });
      }
    } catch {
      // Bỏ qua lỗi
    }
  },

  getPendingTotalAmount: () => {
    return get()
      .items.filter((i) => i.status === 'WAITING')
      .reduce((sum, i) => sum + i.amount, 0);
  },
}));
