import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, Transaction } from '../types/database';

export interface UserSession {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

const STORAGE_TRANSACTIONS_KEY = 'vi_locket_transactions_data';
const STORAGE_USER_KEY = 'vi_locket_cached_user';
const STORAGE_IS_GUEST_KEY = 'vi_locket_is_guest';
const STORAGE_BUDGET_SETUP_KEY = 'vi_locket_budget_setup';

/**
 * KIỂM TRA DỮ LIỆU CŨ (LOCAL-FIRST SAFE STUB)
 */
export async function checkHasCloudTransactions(_userId: string): Promise<boolean> {
  return false;
}

/**
 * DỌN DẸP DỮ LIỆU DEMO VÀ CHUYỂN GIAO DỊCH SANG TÀI KHOẢN MỚI 100% LOCAL:
 * 1. Xóa sạch mọi khoản seed demo cũ ('tx-seed-*', 'seed-user') để số liệu bắt đầu từ 0.
 * 2. Cập nhật user_id của các giao dịch đã tạo lúc 'Vào ngay' sang user_id mới trong AsyncStorage.
 */
export async function cleanSeedDataAndMigrate(
  newUserId: string,
  option: 'MERGE' | 'RESTORE' = 'MERGE'
) {
  try {
    const rawTxs = await AsyncStorage.getItem(STORAGE_TRANSACTIONS_KEY);
    if (!rawTxs) return;

    const txs: Transaction[] = JSON.parse(rawTxs);

    // Lọc bỏ toàn bộ seed demo
    const realTransactions = txs.filter(
      (t) => !t.id.startsWith('tx-seed-') && t.user_id !== 'seed-user'
    );

    if (option === 'RESTORE') {
      const nonGuestTxs = realTransactions.filter((t) => !t.user_id.startsWith('guest-'));
      await AsyncStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(nonGuestTxs));
      return;
    }

    // Cập nhật user_id cho các giao dịch cục bộ
    const updated = realTransactions.map((t) => {
      if (t.user_id.startsWith('guest-') || t.user_id.startsWith('demo-')) {
        return { ...t, user_id: newUserId };
      }
      return t;
    });

    await AsyncStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('[AuthStore] Error during seed clean and migration:', err);
  }
}

/**
 * ĐỒNG BỘ KHẢO SÁT ĐỘ TUỔI CỤC BỘ (100% OFFLINE)
 */
export async function syncAgeSurveyToCloud(
  _deviceId: string,
  _nickname: string,
  _birthYear?: number | null,
  _birthdateStr?: string | null
): Promise<void> {
  // 100% Local-First Engine: Lưu trữ an toàn trong AsyncStorage của thiết bị
}

interface AuthState {
  user: UserSession | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  hasCompletedBudgetSetup: boolean;
  error: string | null;

  // Trạng thái xác thực OTP (Tương thích ngược)
  otpSent: boolean;
  otpEmail: string;

  // Actions
  initializeAuth: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmailOtp: (token: string) => Promise<{ success: boolean; error?: string }>;
  resetOtpState: () => void;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithNickname: (nickname: string, birthYear?: number | null) => Promise<{ success: boolean; error?: string }>;
  checkNicknameAvailable: (nickname: string) => Promise<boolean>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  setHasCompletedBudgetSetup: (completed: boolean) => void;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  checkCloudConflict: (newUserId: string) => Promise<boolean>;
  migrateGuestDataToCloud: (newUserId: string, choice?: 'MERGE' | 'RESTORE') => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: true,
  hasCompletedBudgetSetup: false,
  error: null,
  otpSent: false,
  otpEmail: '',

  /**
   * KHỞI TẠO XÁC THỰC 100% LOCAL-FIRST (Tốc độ 0ms)
   */
  initializeAuth: async () => {
    try {
      set({ isLoading: true });

      const cachedIsGuest = await AsyncStorage.getItem(STORAGE_IS_GUEST_KEY);
      const cachedUserStr = await AsyncStorage.getItem(STORAGE_USER_KEY);
      const cachedSetup = await AsyncStorage.getItem(STORAGE_BUDGET_SETUP_KEY);
      const cachedGuestProfileStr = await AsyncStorage.getItem('@vi_locket_guest_profile');

      if (cachedUserStr) {
        try {
          const cachedUser: UserSession = JSON.parse(cachedUserStr);
          const cachedProfile: Profile | null = cachedGuestProfileStr ? JSON.parse(cachedGuestProfileStr) : null;
          const isGuest = cachedIsGuest === 'true';
          const isSetupDone = cachedSetup === 'true' && Boolean(cachedProfile?.full_name || cachedUser.full_name);

          set({
            user: cachedUser,
            profile: cachedProfile,
            isAuthenticated: true,
            isGuest,
            hasCompletedBudgetSetup: isSetupDone,
            isLoading: false,
            error: null,
          });
          return;
        } catch {
          // JSON lỗi thì tiếp tục reset
        }
      }

      // Chưa có dữ liệu: Hiển thị màn hình Login
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isGuest: false,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khởi tạo xác thực';
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isGuest: false,
        isLoading: false,
        error: msg,
      });
    }
  },

  signInWithEmail: async (email: string) => {
    return { success: false, error: 'Ứng dụng hoạt động 100% ngoại tuyến trên thiết bị.' };
  },

  verifyEmailOtp: async (_token: string) => {
    return { success: false, error: 'Ứng dụng hoạt động 100% ngoại tuyến trên thiết bị.' };
  },

  resetOtpState: () => {
    set({ otpSent: false, otpEmail: '', error: null });
  },

  signInWithGoogle: async () => {
    return { success: false, error: 'Ứng dụng hoạt động 100% ngoại tuyến trên thiết bị.' };
  },

  /**
   * KIỂM TRA BIỆT DANH KHẢ DỤNG 100% LOCAL (0ms phản hồi)
   */
  checkNicknameAvailable: async (nickname: string): Promise<boolean> => {
    const clean = (nickname || '').trim().toLowerCase();
    if (!clean) return true;
    return clean.length >= 2 && clean.length <= 30;
  },

  /**
   * ĐĂNG NHẬP 1-CHẠM BẰNG BIỆT DANH & KHẢO SÁT ĐỘ TUỔI (LOCAL-FIRST)
   */
  signInWithNickname: async (nickname: string, birthYear?: number | null) => {
    try {
      const cleanName = (nickname || '').trim();
      if (!cleanName) {
        return { success: false, error: 'Vui lòng nhập biệt danh của bạn.' };
      }

      // Xác thực năm sinh hợp lệ
      const currentYear = new Date().getFullYear();
      let validBirthYear: number | undefined = undefined;
      if (typeof birthYear === 'number' && !isNaN(birthYear)) {
        if (birthYear >= 1900 && birthYear <= currentYear) {
          validBirthYear = birthYear;
        }
      }

      const storedDeviceId = (await AsyncStorage.getItem('@vi_locket_device_id')) || 
        ('dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7));
      await AsyncStorage.setItem('@vi_locket_device_id', storedDeviceId);

      const user: UserSession = {
        id: `user-${storedDeviceId}`,
        email: '',
        full_name: cleanName,
      };

      const birthdateStr = validBirthYear ? `${validBirthYear}-01-01` : null;

      const profile: Profile = {
        id: user.id,
        full_name: cleanName,
        email: null,
        fav_unit: 'tra_sua',
        hourly_rate: 0,
        birthdate: birthdateStr,
        privacy_mode: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 1. Lưu bền vững vào AsyncStorage
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      await AsyncStorage.setItem('@vi_locket_guest_profile', JSON.stringify(profile));
      await AsyncStorage.setItem(STORAGE_IS_GUEST_KEY, 'false');
      await AsyncStorage.setItem(STORAGE_BUDGET_SETUP_KEY, 'true');

      // 2. Dọn dẹp seed demo và chuyển giao dịch của khách sang tài khoản mới
      cleanSeedDataAndMigrate(user.id, 'MERGE').catch(() => {});

      // 3. Cập nhật state tức thì
      set({
        user,
        profile,
        isAuthenticated: true,
        isGuest: false,
        hasCompletedBudgetSetup: true,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tạo định danh cục bộ.';
      return { success: false, error: msg };
    }
  },

  continueAsGuest: async () => {
    const cachedSetup = await AsyncStorage.getItem(STORAGE_BUDGET_SETUP_KEY);
    const cachedProfileStr = await AsyncStorage.getItem('@vi_locket_guest_profile');
    const cachedProfile: Profile | null = cachedProfileStr ? JSON.parse(cachedProfileStr) : null;
    const isSetupDone = cachedSetup === 'true' && Boolean(cachedProfile?.full_name);

    const guestUser: UserSession = {
      id: `guest-${Date.now()}`,
      email: '',
      full_name: cachedProfile?.full_name || '',
    };

    await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(guestUser));
    await AsyncStorage.setItem(STORAGE_IS_GUEST_KEY, 'true');

    set({
      user: guestUser,
      profile: cachedProfile,
      isAuthenticated: true,
      isGuest: true,
      hasCompletedBudgetSetup: isSetupDone,
      error: null,
      otpSent: false,
    });
  },

  signOut: async () => {
    await AsyncStorage.removeItem(STORAGE_USER_KEY);
    await AsyncStorage.removeItem(STORAGE_IS_GUEST_KEY);
    await AsyncStorage.removeItem(STORAGE_BUDGET_SETUP_KEY);
    await AsyncStorage.removeItem('@vi_locket_guest_profile');

    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      isGuest: false,
      hasCompletedBudgetSetup: false,
      otpSent: false,
      otpEmail: '',
    });
  },

  setHasCompletedBudgetSetup: (completed: boolean) => {
    AsyncStorage.setItem(STORAGE_BUDGET_SETUP_KEY, completed ? 'true' : 'false');
    set({ hasCompletedBudgetSetup: completed });
  },

  updateProfile: async (data: Partial<Profile>) => {
    const { user, profile } = get();
    if (!user) return;

    const updatedProfile = { ...(profile || {}), ...data } as Profile;
    set({ profile: updatedProfile });

    // Lưu bền vững 100% offline trong AsyncStorage
    await AsyncStorage.setItem('@vi_locket_guest_profile', JSON.stringify(updatedProfile));
  },

  checkCloudConflict: async (_newUserId: string) => {
    return false;
  },

  migrateGuestDataToCloud: async (newUserId: string, choice: 'MERGE' | 'RESTORE' = 'MERGE') => {
    await cleanSeedDataAndMigrate(newUserId, choice);
  },
}));
