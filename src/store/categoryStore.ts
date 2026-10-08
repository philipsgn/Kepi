import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CategoryItem, CategoryType } from '../types/category';
import { DEFAULT_CATEGORIES } from '../constants/categoryDefaults';

const STORAGE_KEY_CATEGORIES = 'vi_locket_custom_categories';

interface CategoryState {
  categories: CategoryItem[];
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initializeCategories: () => Promise<void>;
  getExpenseCategories: () => CategoryItem[];
  getIncomeCategories: () => CategoryItem[];
  getCategoryById: (id: string) => CategoryItem | undefined;
  addCategory: (item: {
    type: CategoryType;
    name: string;
    icon: string;
    color: string;
    userId?: string | null;
  }) => Promise<CategoryItem>;
  updateCategory: (id: string, updates: Partial<CategoryItem>) => Promise<void>;
  toggleCategoryActive: (id: string) => Promise<void>;
  deleteCategory: (id: string, isUsedInTransactions?: boolean) => Promise<boolean>;
  resetToDefaults: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: DEFAULT_CATEGORIES,
  isLoading: false,
  isInitialized: false,

  initializeCategories: async () => {
    try {
      set({ isLoading: true });
      const raw = await AsyncStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (raw) {
        const parsed: CategoryItem[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Bảo đảm các default categories không bị mất nếu có cập nhật mới
          const existingIds = new Set(parsed.map((c) => c.id));
          const missingDefaults = DEFAULT_CATEGORIES.filter((d) => !existingIds.has(d.id));
          const merged = [...parsed, ...missingDefaults];
          set({ categories: merged, isInitialized: true, isLoading: false });
          return;
        }
      }
      // Nếu chưa có lưu trữ, dùng mặc định
      set({ categories: DEFAULT_CATEGORIES, isInitialized: true, isLoading: false });
      await AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    } catch (err) {
      console.warn('[categoryStore] Failed to initialize categories:', err);
      set({ categories: DEFAULT_CATEGORIES, isInitialized: true, isLoading: false });
    }
  },

  getExpenseCategories: () => {
    const { categories } = get();
    return categories
      .filter((c) => c.type === 'EXPENSE' && c.isActive !== false)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  },

  getIncomeCategories: () => {
    const { categories } = get();
    return categories
      .filter((c) => c.type === 'INCOME' && c.isActive !== false)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  },

  getCategoryById: (id: string) => {
    const clean = id.toLowerCase().trim();
    return get().categories.find((c) => c.id.toLowerCase() === clean);
  },

  addCategory: async (item) => {
    const { categories } = get();
    const newId = `cat_custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sameTypeCategories = categories.filter((c) => c.type === item.type);

    const newCategory: CategoryItem = {
      id: newId,
      userId: item.userId || null,
      type: item.type,
      name: item.name.trim(),
      icon: item.icon,
      color: item.color,
      isDefault: false,
      isActive: true,
      orderIndex: sameTypeCategories.length,
      createdAt: new Date().toISOString(),
    };

    const updated = [...categories, newCategory];
    set({ categories: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
    } catch (err) {
      console.warn('[categoryStore] Failed to save new category:', err);
    }
    return newCategory;
  },

  updateCategory: async (id, updates) => {
    const { categories } = get();
    const updated = categories.map((cat) => {
      if (cat.id === id) {
        return {
          ...cat,
          ...updates,
          name: updates.name !== undefined ? updates.name.trim() : cat.name,
        };
      }
      return cat;
    });

    set({ categories: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
    } catch (err) {
      console.warn('[categoryStore] Failed to update category:', err);
    }
  },

  toggleCategoryActive: async (id) => {
    const { categories } = get();
    const updated = categories.map((cat) => {
      if (cat.id === id) {
        return { ...cat, isActive: !cat.isActive };
      }
      return cat;
    });

    set({ categories: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
    } catch (err) {
      console.warn('[categoryStore] Failed to toggle category:', err);
    }
  },

  deleteCategory: async (id, isUsedInTransactions = false) => {
    const { categories } = get();
    const target = categories.find((c) => c.id === id);
    if (!target) return false;

    let updated: CategoryItem[];
    if (isUsedInTransactions || target.isDefault) {
      // Soft Delete Guard: Nếu đã có giao dịch hoặc là danh mục mặc định thì chỉ ẩn đi
      updated = categories.map((c) => (c.id === id ? { ...c, isActive: false } : c));
    } else {
      // Hard delete an toàn vì là danh mục tự tạo chưa có giao dịch
      updated = categories.filter((c) => c.id !== id);
    }

    set({ categories: updated });
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(updated));
    } catch (err) {
      console.warn('[categoryStore] Failed to delete category:', err);
    }
    return true;
  },

  resetToDefaults: async () => {
    set({ categories: DEFAULT_CATEGORIES });
    try {
      await AsyncStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
    } catch (err) {
      console.warn('[categoryStore] Failed to reset categories:', err);
    }
  },
}));
