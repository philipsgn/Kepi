import { create } from 'zustand';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { supabase } from '../services/supabase';
import { Profile, Transaction } from '../types/database';
import { enqueueMutation, flushSyncQueue } from '../services/offlineSync';
import { teardownRealtimeTransactionSync } from '../services/realtimeSync';
import { uploadExpensePhotoAsync } from '../services/storage';


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
 * KIỂM TRA TÀI KHOẢN GOOGLE ĐÃ CÓ DỮ LIỆU CŨ TRÊN CLOUD HAY CHƯA
 */
export async function checkHasCloudTransactions(userId: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    return Boolean(!error && typeof count === 'number' && count > 0);
  } catch {
    return false;
  }
}

/**
 * DỌN DẸP DỮ LIỆU DEMO, ĐỒNG BỘ ẢNH LOCAL LÊN CLOUD VÀ CHUYỂN GIAO DỊCH THỰC SANG TÀI KHOẢN THẬT:
 * 1. Xóa sạch mọi khoản seed demo cũ ('tx-seed-*', 'seed-user') để số liệu bắt đầu từ 0.
 * 2. Tự động đẩy toàn bộ ảnh chụp local (file://) lên Supabase Storage bucket receipt-photos.
 * 3. Chuyển user_id của các giao dịch đã tạo lúc 'Vào ngay' sang user_id mới và enqueueMutation lên Supabase.
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
      // Người dùng chọn phục hồi dữ liệu đám mây: Xóa các khoản tạm của khách
      const nonGuestTxs = realTransactions.filter((t) => !t.user_id.startsWith('guest-'));
      await AsyncStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(nonGuestTxs));
      return;
    }

    // Cập nhật user_id cho các giao dịch do khách tự tạo & upload ảnh local
    const updated: Transaction[] = [];
    for (const t of realTransactions) {
      if (t.user_id.startsWith('guest-') || t.user_id.startsWith('demo-')) {
        let photoUrl = t.photo_url;
        let thumbUrl = t.thumbnail_url;

        // Nếu ảnh đang là local URI, nén & upload lên Supabase Storage
        if (photoUrl && (photoUrl.startsWith('file://') || photoUrl.startsWith('/'))) {
          try {
            const uploadResult = await uploadExpensePhotoAsync({
              userId: newUserId,
              transactionId: t.id,
              fullPhotoUri: photoUrl,
              thumbnailUri: thumbUrl || undefined,
            });
            if (uploadResult.uploadedToCloud) {
              photoUrl = uploadResult.photoUrl;
              thumbUrl = uploadResult.thumbnailUrl;
            }
          } catch (uploadErr) {
            console.warn('[AuthStore] Failed to upload local photo during migration:', uploadErr);
          }
        }

        const migratedTx: Transaction = {
          ...t,
          user_id: newUserId,
          photo_url: photoUrl,
          thumbnail_url: thumbUrl,
        };
        updated.push(migratedTx);
        await enqueueMutation('ADD_TRANSACTION', migratedTx);
      } else {
        updated.push(t);
      }
    }

    await AsyncStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(updated));
    flushSyncQueue().catch(() => {});
  } catch (err) {
    console.warn('[AuthStore] Error during seed clean and migration:', err);
  }
}

/**
 * ĐỒNG BỘ KHẢO SÁT ĐỘ TUỔI LÊN SUPABASE CLOUD (NON-BLOCKING BACKGROUND TASK)
 * Chạy bất đồng bộ, bọc try-catch và timeout 2500ms
 * Đảm bảo tuyệt đối không làm gián đoạn hoặc chặn luồng đăng nhập cục bộ
 */
export async function syncAgeSurveyToCloud(
  deviceId: string,
  nickname: string,
  birthYear?: number | null,
  birthdateStr?: string | null
): Promise<void> {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return;
  }

  try {
    const rpcPromise = supabase.rpc('submit_age_survey', {
      p_device_id: deviceId,
      p_nickname: nickname,
      p_birth_year: birthYear || null,
    });

    const tablePromise = (async () => {
      const { error } = await supabase.from('user_surveys').upsert(
        {
          device_id: deviceId,
          nickname,
          birth_year: birthYear || null,
          birthdate: birthdateStr || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'device_id' }
      );
      return !error;
    })();

    await Promise.race([
      Promise.any([rpcPromise, tablePromise]),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch (err) {
    console.warn('[AuthStore] syncAgeSurveyToCloud non-blocking catch:', err);
  }
}

/**
 * Đảm bảo người dùng luôn có 1 bản ghi hồ sơ trong bảng public.profiles
 * Tự động kế thừa ngày sinh / khảo sát độ tuổi từ bộ nhớ cục bộ nếu có
 */
async function ensureUserProfile(user: UserSession): Promise<Profile | null> {
  try {
    // 1. Kiểm tra xem profile đã tồn tại chưa
    const { data: existing, error: selectErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (existing && !selectErr) {
      return existing as Profile;
    }

    // 2. Kế thừa ngày sinh / biệt danh từ hồ sơ cục bộ (nếu có)
    let cachedBirthdate: string | null = null;
    let cachedFullName = user.full_name || '';
    try {
      const cachedProfileStr = await AsyncStorage.getItem('@vi_locket_guest_profile');
      if (cachedProfileStr) {
        const cachedP = JSON.parse(cachedProfileStr);
        if (cachedP?.birthdate) cachedBirthdate = cachedP.birthdate;
        if (!cachedFullName && cachedP?.full_name) cachedFullName = cachedP.full_name;
      }
    } catch {
      // Bỏ qua lỗi đọc cache
    }

    // 3. Nếu chưa có, tạo mới
    const newProfile: Partial<Profile> = {
      id: user.id,
      email: user.email,
      full_name: cachedFullName,
      birthdate: cachedBirthdate,
      fav_unit: 'tra_sua',
      hourly_rate: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('profiles')
      .upsert(newProfile)
      .select()
      .maybeSingle();

    if (insertErr) {
      console.warn('[AuthStore] Failed to upsert profile to Supabase:', insertErr.message);
      return newProfile as Profile;
    }

    return inserted as Profile;
  } catch (err) {
    console.warn('[AuthStore] ensureUserProfile exception:', err);
    return null;
  }
}

interface AuthState {
  user: UserSession | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  hasCompletedBudgetSetup: boolean;
  error: string | null;

  // Trạng thái xác thực OTP
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

  initializeAuth: async () => {
    try {
      set({ isLoading: true });

      // 1. Kiểm tra session thật từ Supabase Cloud
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user: UserSession = {
          id: session.user.id,
          email: session.user.email || '',
          full_name:
            session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            session.user.email?.split('@')[0] ||
            'Bạn',
          avatar_url: session.user.user_metadata?.avatar_url,
        };

        const profile = await ensureUserProfile(user);

        // Kiểm tra ngân sách
        const { data: settings } = await supabase
          .from('financial_settings')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        const cachedSetup = await AsyncStorage.getItem(STORAGE_BUDGET_SETUP_KEY);

        set({
          user,
          profile,
          isAuthenticated: true,
          isGuest: false,
          hasCompletedBudgetSetup: Boolean(settings || cachedSetup === 'true'),
          isLoading: false,
          error: null,
        });

        // Xử lý di chuyển dữ liệu từ phiên 'Vào ngay' (nếu có)
        try {
          const hasCloudData = await checkHasCloudTransactions(user.id);
          const rawTxs = await AsyncStorage.getItem(STORAGE_TRANSACTIONS_KEY);
          const hasGuestTxs = rawTxs
            ? JSON.parse(rawTxs).some((t: Transaction) => t.user_id.startsWith('guest-'))
            : false;

          if (hasGuestTxs && hasCloudData) {
            Alert.alert(
              'Đồng bộ tài khoản Google',
              'Tài khoản Google của bạn đã có dữ liệu trước đó trên đám mây. Bạn muốn gộp các khoản vừa ghi hay dùng lại dữ liệu cũ?',
              [
                {
                  text: 'Dùng dữ liệu đám mây',
                  style: 'cancel',
                  onPress: () => cleanSeedDataAndMigrate(user.id, 'RESTORE'),
                },
                {
                  text: 'Gộp dữ liệu',
                  onPress: () => cleanSeedDataAndMigrate(user.id, 'MERGE'),
                },
              ]
            );
          } else {
            cleanSeedDataAndMigrate(user.id, 'MERGE').catch(() => {});
          }
        } catch {
          cleanSeedDataAndMigrate(user.id, 'MERGE').catch(() => {});
        }
        return;
      }

      // 2. Không có session thật trên Supabase -> Kiểm tra xem có tài khoản cục bộ (Nickname hoặc Khách) không
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
          // JSON lỗi thì rơi vào reset
        }
      }

      // Chưa đăng nhập và chưa vào ngay: Hiển thị màn hình Chào mừng (Đăng nhập / Vào ngay)
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

  /**
   * BƯỚC 1: Gửi mã OTP 6 số đến email người dùng
   */
  signInWithEmail: async (email: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Địa chỉ email không hợp lệ.' };
      }

      set({ isLoading: true, error: null });

      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }

      set({
        otpSent: true,
        otpEmail: cleanEmail,
        isLoading: false,
        error: null,
      });

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi mã OTP lúc này.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  /**
   * BƯỚC 2: Xác thực mã OTP 6 số trực tiếp trong app
   */
  verifyEmailOtp: async (token: string) => {
    try {
      const cleanToken = token.trim();
      const email = get().otpEmail;

      if (!email) {
        return { success: false, error: 'Chưa có thông tin email. Vui lòng nhập lại email.' };
      }

      if (cleanToken.length !== 6) {
        return { success: false, error: 'Mã OTP phải gồm đủ 6 chữ số.' };
      }

      set({ isLoading: true, error: null });

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: cleanToken,
        type: 'email',
      });

      if (error || !data.session?.user) {
        const errorMsg = error?.message || 'Mã xác nhận không đúng hoặc đã hết hạn.';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }

      const sessionUser = data.session.user;
      const user: UserSession = {
        id: sessionUser.id,
        email: sessionUser.email || email,
        full_name:
          sessionUser.user_metadata?.full_name ||
          email.split('@')[0] ||
          '',
      };

      // Lưu cache user thật
      await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_IS_GUEST_KEY, 'false');

      const profile = await ensureUserProfile(user);

      set({
        user,
        profile,
        isAuthenticated: true,
        isGuest: false,
        otpSent: false,
        otpEmail: '',
        isLoading: false,
        error: null,
      });

      // Tự động xóa sạch 7 khoản seed demo và chuyển dữ liệu thật
      cleanSeedDataAndMigrate(user.id).catch(() => {});

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xác thực mã OTP.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  resetOtpState: () => {
    set({ otpSent: false, otpEmail: '', error: null });
  },

  /**
   * ĐĂNG NHẬP GOOGLE 1 CHẠM (Web Auth Session qua Supabase OAuth)
   */
  signInWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null });

      let redirectUrl = Linking.createURL('/(auth)/callback');
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        redirectUrl = `${window.location.origin}/(auth)/callback`;
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        set({ error: error.message, isLoading: false });
        return { success: false, error: error.message };
      }

      if (data?.url) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.href = data.url;
        } else {
          await Linking.openURL(data.url);
        }
      }

      set({ isLoading: false });
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể mở phiên đăng nhập Google.';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  /**
   * KIỂM TRA BIỆT DANH KHẢ DỤNG (REALTIME DEBOUNCE & FAIL-OPEN ENGINE)
   * Tuyệt đối không treo UI: Đua timeout 2000ms, nếu lỗi mạng/RLS thì fail-open an toàn
   */
  checkNicknameAvailable: async (nickname: string): Promise<boolean> => {
    const clean = (nickname || '').trim().toLowerCase();
    if (!clean) return true;

    // Fail-open nhanh nếu Supabase chưa cấu hình
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      return true;
    }

    try {
      // Đua timeout 2000ms đảm bảo UI không bao giờ bị đứng spinner
      const checkPromise = (async () => {
        // 1. Thử gọi RPC check_nickname_available (chạy SECURITY DEFINER)
        try {
          const { data: rpcAvailable, error: rpcErr } = await supabase.rpc(
            'check_nickname_available',
            { p_nickname: clean }
          );
          if (!rpcErr && typeof rpcAvailable === 'boolean') {
            return rpcAvailable;
          }
        } catch {
          // Bỏ qua nếu RPC chưa khởi tạo
        }

        // 2. Tra cứu trong bảng profiles
        try {
          const { data: profilesData, error: profileErr } = await supabase
            .from('profiles')
            .select('id')
            .ilike('full_name', clean)
            .limit(1);

          if (!profileErr && profilesData && profilesData.length > 0) {
            return false;
          }
        } catch {
          // Bỏ qua nếu RLS từ chối
        }

        // 3. Tra cứu trong bảng user_surveys
        try {
          const { data: surveyData, error: surveyErr } = await supabase
            .from('user_surveys')
            .select('id')
            .ilike('nickname', clean)
            .limit(1);

          if (!surveyErr && surveyData && surveyData.length > 0) {
            return false;
          }
        } catch {
          // Bỏ qua nếu bảng user_surveys chưa khởi tạo
        }

        return true;
      })();

      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(true), 2000);
      });

      return await Promise.race([checkPromise, timeoutPromise]);
    } catch {
      // Mọi ngoại lệ mạng đều fail-open an toàn (trả về true)
      return true;
    }
  },

  /**
   * ĐĂNG NHẬP 1-CHẠM BẰNG BIỆT DANH & KHẢO SÁT ĐỘ TUỔI (LOCAL-FIRST)
   * 1. Kiểm tra tính hợp lệ của Biệt danh và Năm sinh
   * 2. Lưu trữ định danh thiết bị và hồ sơ bền vững trong AsyncStorage
   * 3. Di chuyển giao dịch từ phiên Khách cũ sang tài khoản mới
   * 4. Đẩy khảo sát độ tuổi lên Cloud Supabase trong nền (non-blocking)
   */
  signInWithNickname: async (nickname: string, birthYear?: number | null) => {
    try {
      const cleanName = (nickname || '').trim();
      if (!cleanName) {
        return { success: false, error: 'Vui lòng nhập biệt danh của bạn.' };
      }

      // Xác thực và chuẩn hóa năm sinh hợp lệ (nếu có truyền vào)
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

      // 2. Tự động dọn dẹp seed demo và chuyển giao dịch cũ của khách sang tài khoản mới
      cleanSeedDataAndMigrate(user.id, 'MERGE').catch(() => {});

      // 3. Cập nhật state store tức thì
      set({
        user,
        profile,
        isAuthenticated: true,
        isGuest: false,
        hasCompletedBudgetSetup: true,
        isLoading: false,
        error: null,
      });

      // 4. Đồng bộ khảo sát độ tuổi lên Cloud Supabase trong nền (không chặn UI)
      syncAgeSurveyToCloud(storedDeviceId, cleanName, validBirthYear, birthdateStr).catch(() => {});

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
    try {
      await supabase.auth.signOut();
    } catch {
      // Bỏ qua lỗi mạng
    }
    await AsyncStorage.removeItem(STORAGE_USER_KEY);
    await AsyncStorage.removeItem(STORAGE_IS_GUEST_KEY);
    await AsyncStorage.removeItem(STORAGE_BUDGET_SETUP_KEY);
    await AsyncStorage.removeItem('@vi_locket_guest_profile');

    // Hủy đăng ký Realtime WebSocket
    teardownRealtimeTransactionSync();

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
    const { user, profile, isGuest } = get();
    if (!user) return;

    const updatedProfile = { ...(profile || {}), ...data } as Profile;
    set({ profile: updatedProfile });

    // Lưu bền vững offline cho cả Guest và User
    await AsyncStorage.setItem('@vi_locket_guest_profile', JSON.stringify(updatedProfile));

    // Nếu là Guest thì không đẩy lên Supabase
    if (isGuest) return;

    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        ...data,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Local first, sync sau
    }
  },

  checkCloudConflict: async (newUserId: string) => {
    return await checkHasCloudTransactions(newUserId);
  },

  migrateGuestDataToCloud: async (newUserId: string, choice: 'MERGE' | 'RESTORE' = 'MERGE') => {
    await cleanSeedDataAndMigrate(newUserId, choice);
  },
}));

