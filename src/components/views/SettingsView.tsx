import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Bell,
  Camera,
  Check,
  ChevronRight,
  Cloud,
  ExternalLink,
  EyeOff,
  LogOut,
  MapPin,
  Navigation,
  Palette,
  QrCode,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserX,
  X,
} from 'lucide-react-native';
import { Spacing } from '../../constants/layout';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { ThemeSettingsCard } from '../profile/ThemeSettingsCard';
import { DataBackupCard } from '../profile/DataBackupCard';
import { LockScreenSettingsCard } from '../profile/LockScreenSettingsCard';
import { BankNotificationSettingsCard } from '../profile/BankNotificationSettingsCard';
import { QRPaySettingsCard } from '../profile/QRPaySettingsCard';
import { useTheme } from '../../theme/ThemeContext';
import { useBottomInset } from '../../hooks/useBottomInset';
import { useAppPermissions } from '../../hooks/useCameraPermissions';
import {
  getLocationAppEnabled,
  getLocationPermissionStatusAsync,
  getLocationPinEnabled,
  requestLocationPermissionAsync,
  setLocationAppEnabled,
  setLocationPinEnabled,
  STORAGE_KEY_LOCATION_PIN,
} from '../../services/locationService';

const STORAGE_KEY_MASK_MONEY = 'vi_locket_mask_money';

export interface SettingsViewProps {
  onSignOut?: () => void;
}

type ActiveSheetType = 'BACKUP' | 'THEME' | 'WIDGET' | 'BANK' | 'QR' | null;

/**
 * Màn hình Cài Đặt Chuyên Biệt (SettingsView)
 * Thiết kế chuẩn Neo-Brutalist Pixel Art 100% PigFly v4.5:
 * - Viền 3px mực đặc, bóng cứng 0-blur 4px, font Baloo 2 + Nunito
 * - Nút Back [←] chuẩn Neo-Badge tròn 36×36px
 * - Nhãn Giao diện ngắn gọn 'Kem' / 'Hồng' (QĐ 164 & 165)
 * - Universal Modal Bottom Sheet bo 28px viền 3px mực
 */
export const SettingsView: React.FC<SettingsViewProps> = ({ onSignOut }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tokens, mode } = useTheme();
  const isPink = mode === 'pink';
  const inkBorder = isPink ? '#3B0713' : '#2B2118';
  const cardBg = isPink ? '#FFFFFF' : '#FFFBF1';
  const badgeBg = isPink ? '#FCE7F3' : '#FFF4CC';
  const sheetBg = isPink ? '#FFF5F7' : '#F6EEDC';
  const textMutedColor = isPink ? '#881337' : '#6E5D4F';
  const accentColor = isPink ? '#F43F5E' : '#F4B93B';
  const accentTextColor = isPink ? '#FFFFFF' : '#2B2118';

  const { contentBottomPadding } = useBottomInset();

  const { user, updateProfile, signOut } = useAuthStore();
  const { loadTransactions } = useTransactionStore();

  const [isMasked, setIsMasked] = useState(false);
  const [isLocationPinEnabled, setIsLocationPinEnabledState] = useState(true);
  const [locationAppEnabled, setLocationAppEnabledState] = useState(true);
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationCanAsk, setLocationCanAsk] = useState(true);
  const [activeSheet, setActiveSheet] = useState<ActiveSheetType>(null);

  const {
    cameraGranted,
    cameraAppEnabled,
    setCameraAppEnabledState,
    canAskCameraAgain,
    requestCameraPermission,
    openAppSettings,
  } = useAppPermissions();

  const refreshLocationPermissions = useCallback(async () => {
    try {
      const [appLocEnabled, pinOptIn, locPerm] = await Promise.all([
        getLocationAppEnabled(),
        getLocationPinEnabled(),
        getLocationPermissionStatusAsync(),
      ]);
      setLocationAppEnabledState(appLocEnabled);
      setIsLocationPinEnabledState(pinOptIn);
      setLocationGranted(locPerm.granted);
      setLocationCanAsk(locPerm.canAskAgain);
    } catch (_e) {
      // ignore
    }
  }, []);

  // Load preferences & OS permission status on mount + when returning from OS Settings
  useEffect(() => {
    (async () => {
      try {
        const savedMask = await AsyncStorage.getItem(STORAGE_KEY_MASK_MONEY);
        if (savedMask !== null) setIsMasked(savedMask === 'true');
        await refreshLocationPermissions();
      } catch (err) {
        console.warn('Failed to load settings preferences:', err);
      }
    })();

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        refreshLocationPermissions();
      }
    });
    return () => sub.remove();
  }, [refreshLocationPermissions]);

  // Handler: Toggle Mask Money
  const handleToggleMask = async (val: boolean) => {
    setIsMasked(val);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_MASK_MONEY, String(val));
      await updateProfile({ privacy_mode: val });
    } catch {}
  };

  // Handler: Toggle Camera Permission (Bật/tắt thật cấp App + xin quyền OS khi bật — QĐ 198)
  const handleToggleCameraPermission = async (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!val) {
      await setCameraAppEnabledState(false);
      return;
    }

    await setCameraAppEnabledState(true);
    if (cameraGranted) return;

    if (canAskCameraAgain) {
      const res = await requestCameraPermission();
      if (!res?.granted) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('Trình duyệt đang chặn quyền Máy ảnh. Bấm vào biểu tượng ổ khóa cạnh thanh địa chỉ để cho phép nhé!');
        } else {
          Alert.alert(
            'Cần quyền Máy ảnh',
            'Bạn có thể bật quyền Máy ảnh trong Cài đặt điện thoại để chụp ảnh & quét VietQR.',
            [
              { text: 'Để sau', style: 'cancel' },
              { text: 'Mở Cài đặt', onPress: () => openAppSettings() },
            ]
          );
        }
      }
    } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert('Trình duyệt đang chặn quyền Máy ảnh. Bấm vào biểu tượng ổ khóa cạnh thanh địa chỉ để cho phép nhé!');
    } else {
      openAppSettings();
    }
  };

  // Handler: Toggle Location Permission (Bật/tắt thật cấp App + xin quyền OS khi bật — QĐ 198)
  const handleToggleLocationPermission = async (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!val) {
      setLocationAppEnabledState(false);
      await setLocationAppEnabled(false);
      setIsLocationPinEnabledState(false);
      await setLocationPinEnabled(false);
      return;
    }

    setLocationAppEnabledState(true);
    await setLocationAppEnabled(true);
    if (locationGranted) return;

    if (locationCanAsk || Platform.OS === 'web') {
      const res = await requestLocationPermissionAsync();
      setLocationGranted(res.granted);
      setLocationCanAsk(res.canAskAgain);
      if (!res.granted) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('Trình duyệt đang chặn quyền Vị trí. Bấm vào biểu tượng ổ khóa cạnh thanh địa chỉ (hoặc Cài đặt Safari) để cho phép nhé!');
        } else {
          Alert.alert(
            'Cần quyền Vị trí',
            'Bạn có thể bật quyền Vị trí trong Cài đặt điện thoại để lưu địa điểm quán thật.',
            [
              { text: 'Để sau', style: 'cancel' },
              { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
            ]
          );
        }
      }
    } else {
      Linking.openSettings();
    }
  };

  // Handler: Toggle Opt-in Location Pin when saving expenses (Quyết định 180 & 186)
  const handleToggleLocationPin = async (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (val && !locationGranted) {
      if (locationCanAsk) {
        const res = await requestLocationPermissionAsync();
        setLocationGranted(res.granted);
        setLocationCanAsk(res.canAskAgain);
        if (!res.granted) {
          setIsLocationPinEnabledState(false);
          await setLocationPinEnabled(false);
          Alert.alert(
            'Chưa có quyền Vị trí',
            'Vui lòng bật quyền Vị trí để tự gắn địa điểm khi lưu chi ở tab Chụp.',
            [
              { text: 'Đóng', style: 'cancel' },
              { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
      } else {
        Alert.alert(
          'Chưa có quyền Vị trí',
          'Quyền Vị trí đang bị tắt trên điện thoại. Mở Cài đặt để cấp quyền ngay nhé.',
          [
            { text: 'Đóng', style: 'cancel' },
            { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }
    setIsLocationPinEnabledState(val);
    await setLocationPinEnabled(val);
  };

  // Handler: Reset All Data
  const handleResetAllData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Dọn dẹp nhật ký chi tiêu',
      'Toàn bộ giao dịch và thiết lập ngân sách lưu trên thiết bị này sẽ được dọn sạch. Bạn có chắc chắn không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa dữ liệu',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'vi_locket_transactions_data',
                'vi_locket_budget_setup',
                'vi_locket_cached_user',
                STORAGE_KEY_MASK_MONEY,
              ]);

              if (user?.id) {
                await loadTransactions(user.id);
              }

              Alert.alert(
                'Đã dọn sạch dữ liệu',
                'Toàn bộ nhật ký chi tiêu trên máy đã được đặt lại thành công.'
              );
            } catch (err) {
              Alert.alert('Lỗi', 'Không thể xóa dữ liệu lúc này.');
            }
          },
        },
      ]
    );
  };

  // Handler: Delete Account
  const handleDeleteAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Xóa tài khoản vĩnh viễn',
      'Toàn bộ thông tin tài khoản, ảnh chụp đám mây và lịch sử chi tiêu sẽ bị xóa vĩnh viễn không thể khôi phục (Apple Store Review Guideline 5.1.1(v)).',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận xóa tài khoản',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              if (onSignOut) {
                onSignOut();
              } else {
                await signOut();
              }
              router.replace('/(auth)/login');
            } catch (err) {
              console.warn('Failed to delete account:', err);
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Text helpers: Siêu ngắn gọn Kem / Hồng (QĐ 164 & 165)
  const themeLabel = isPink ? 'Hồng' : 'Kem';

  const cardBgStyle = {
    backgroundColor: cardBg,
    borderColor: inkBorder,
    borderWidth: 3,
    borderRadius: 22,
    shadowColor: inkBorder,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg, paddingTop: insets.top + Spacing.sm }]}>
      {/* HEADER: NÚT BACK NEO-BADGE + TIÊU ĐỀ CÀI ĐẶT */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.backButtonNeo,
            {
              backgroundColor: badgeBg,
              borderColor: inkBorder,
            },
          ]}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Quay lại Hồ sơ"
        >
          <ArrowLeft size={18} color={inkBorder} strokeWidth={2.8} />
        </TouchableOpacity>

        <Text
          style={[
            styles.screenTitle,
            {
              color: inkBorder,
              fontFamily: 'Baloo2_800ExtraBold',
              fontWeight: '800',
            },
          ]}
        >
          Cài đặt
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottomPadding + 28 },
        ]}
      >
        {/* ================= NHÓM 1: SAO LƯU & ĐỒNG BỘ ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderText, { color: textMutedColor }]}>
            Sao lưu & Đồng bộ
          </Text>
        </View>

        <View style={[styles.groupedCard, cardBgStyle]}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveSheet('BACKUP');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconContainerFloating}>
                <Cloud size={22} color={tokens.primary} strokeWidth={2.8} />
              </View>
              <Text style={[styles.rowTitle, { color: inkBorder }]}>
                Sao lưu & Khôi phục
              </Text>
            </View>
            <View style={styles.rowRight}>
              <ChevronRight size={17} color={inkBorder} strokeWidth={2.4} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= NHÓM 2: GIAO DIỆN & CÁ NHÂN HÓA ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderText, { color: textMutedColor }]}>
            Giao diện & Cá nhân hóa
          </Text>
        </View>

        <View style={[styles.groupedCard, cardBgStyle]}>
          {/* Row: Theme */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveSheet('THEME');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconContainerFloating}>
                <Palette size={22} color={tokens.primary} strokeWidth={2.8} />
              </View>
              <Text style={[styles.rowTitle, { color: inkBorder }]}>
                Giao diện
              </Text>
            </View>

            <View style={styles.rowRight}>
              <Text style={[styles.valueBadgeText, { color: textMutedColor, marginRight: 6 }]}>
                {themeLabel}
              </Text>
              <ChevronRight size={17} color={inkBorder} strokeWidth={2.4} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= NHÓM 3: BẢO MẬT & QUYỀN TRUY CẬP ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderText, { color: textMutedColor }]}>
            Bảo mật & Quyền truy cập
          </Text>
        </View>

        <View style={[styles.groupedCard, cardBgStyle]}>
          {/* Row 1: Ẩn số tiền */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <View style={styles.iconContainerFloating}>
                <EyeOff size={22} color={tokens.primary} strokeWidth={2.8} />
              </View>
              <Text style={[styles.rowTitle, { color: inkBorder }]}>
                Ẩn số tiền
              </Text>
            </View>

            <Switch
              value={isMasked}
              onValueChange={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleToggleMask(val);
              }}
              trackColor={{ false: isPink ? '#FCE7F3' : '#E8DEC8', true: accentColor }}
              thumbColor={isMasked ? (isPink ? '#FFFFFF' : '#2B2118') : '#FFFFFF'}
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: isPink ? 'rgba(59, 7, 19, 0.08)' : 'rgba(43, 33, 24, 0.08)' }]} />

          {/* Row 2: Quyền Máy ảnh (Camera) */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <View style={styles.iconContainerFloating}>
                <Camera size={22} color={tokens.primary} strokeWidth={2.8} />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.rowTitle, { color: inkBorder }]}>
                  Cho phép Máy ảnh
                </Text>
                <Text style={{ fontSize: 11, color: textMutedColor, fontFamily: 'Nunito', fontWeight: '600' }} numberOfLines={1}>
                  {cameraAppEnabled && cameraGranted
                    ? 'Đang bật · Chụp món & quét QR'
                    : !cameraAppEnabled
                      ? 'Đã tắt trong App'
                      : 'Chưa cấp quyền trên máy'}
                </Text>
              </View>
            </View>

            <Switch
              value={cameraAppEnabled && cameraGranted}
              onValueChange={handleToggleCameraPermission}
              trackColor={{ false: isPink ? '#FCE7F3' : '#E8DEC8', true: accentColor }}
              thumbColor={cameraAppEnabled && cameraGranted ? (isPink ? '#FFFFFF' : '#2B2118') : '#FFFFFF'}
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: isPink ? 'rgba(59, 7, 19, 0.08)' : 'rgba(43, 33, 24, 0.08)' }]} />

          {/* Row 3: Quyền Vị trí hiện tại (GPS) */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <View style={styles.iconContainerFloating}>
                <Navigation size={22} color={tokens.primary} strokeWidth={2.8} />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.rowTitle, { color: inkBorder }]}>
                  Cho phép Vị trí hiện tại
                </Text>
                <Text style={{ fontSize: 11, color: textMutedColor, fontFamily: 'Nunito', fontWeight: '600' }} numberOfLines={1}>
                  {locationAppEnabled && locationGranted
                    ? 'Đang bật · Chỉ dùng khi mở app'
                    : !locationAppEnabled
                      ? 'Đã tắt trong App'
                      : 'Chưa cấp quyền trên máy'}
                </Text>
              </View>
            </View>

            <Switch
              value={locationAppEnabled && locationGranted}
              onValueChange={handleToggleLocationPermission}
              trackColor={{ false: isPink ? '#FCE7F3' : '#E8DEC8', true: accentColor }}
              thumbColor={locationAppEnabled && locationGranted ? (isPink ? '#FFFFFF' : '#2B2118') : '#FFFFFF'}
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: isPink ? 'rgba(59, 7, 19, 0.08)' : 'rgba(43, 33, 24, 0.08)' }]} />

          {/* Row 4: Tự gắn vị trí khi lưu chi ở tab Chụp (chuyển từ trang Quán Quen về đây — QĐ 186) */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <View style={styles.iconContainerFloating}>
                <MapPin size={22} color={tokens.primary} strokeWidth={2.8} />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.rowTitle, { color: inkBorder }]}>
                  Tự gắn vị trí khi lưu chi ở tab Chụp
                </Text>
                <Text style={{ fontSize: 11, color: textMutedColor, fontFamily: 'Nunito', fontWeight: '600' }} numberOfLines={1}>
                  Ghim vị trí chi tiêu · Lưu tên đường & quận thật vào Quán Quen
                </Text>
              </View>
            </View>

            <Switch
              value={isLocationPinEnabled && locationAppEnabled && locationGranted}
              onValueChange={handleToggleLocationPin}
              trackColor={{ false: isPink ? '#FCE7F3' : '#E8DEC8', true: accentColor }}
              thumbColor={isLocationPinEnabled && locationAppEnabled && locationGranted ? (isPink ? '#FFFFFF' : '#2B2118') : '#FFFFFF'}
            />
          </View>

          <View style={[styles.rowDivider, { backgroundColor: isPink ? 'rgba(59, 7, 19, 0.08)' : 'rgba(43, 33, 24, 0.08)' }]} />

          {/* Row 5: Mở Cài đặt điện thoại */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Linking.openSettings();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconContainerFloating}>
                <ExternalLink size={20} color={tokens.primary} strokeWidth={2.8} />
              </View>
              <Text style={[styles.rowTitle, { color: inkBorder }]}>
                Mở cài đặt quyền trên điện thoại
              </Text>
            </View>
            <View style={styles.rowRight}>
              <ChevronRight size={17} color={inkBorder} strokeWidth={2.4} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= NHÓM 4: TIỆN ÍCH & TÍCH HỢP ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderText, { color: textMutedColor }]}>
            Tiện ích & Tích hợp
          </Text>
        </View>

        <View style={[styles.groupedCard, cardBgStyle]}>
          {/* Row 1: Lock Screen Widget */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveSheet('WIDGET');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconContainerFloating}>
                <Smartphone size={22} color={tokens.primary} strokeWidth={2.8} />
              </View>
              <Text style={[styles.rowTitle, { color: inkBorder }]}>
                Widget màn hình khóa
              </Text>
            </View>

            <View style={styles.rowRight}>
              <ChevronRight size={17} color={inkBorder} strokeWidth={2.4} />
            </View>
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: isPink ? 'rgba(59, 7, 19, 0.08)' : 'rgba(43, 33, 24, 0.08)' }]} />

          {/* Row 2: Bank Notification */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveSheet('BANK');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconContainerFloating}>
                <Bell size={22} color={tokens.primary} strokeWidth={2.8} />
              </View>
              <Text style={[styles.rowTitle, { color: inkBorder }]}>
                Thông báo ngân hàng
              </Text>
            </View>

            <View style={styles.rowRight}>
              <ChevronRight size={17} color={inkBorder} strokeWidth={2.4} />
            </View>
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: isPink ? 'rgba(59, 7, 19, 0.08)' : 'rgba(43, 33, 24, 0.08)' }]} />

          {/* Row 3: VietQR Pay */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveSheet('QR');
            }}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconContainerFloating}>
                <QrCode size={22} color={tokens.primary} strokeWidth={2.8} />
              </View>
              <Text style={[styles.rowTitle, { color: inkBorder }]}>
                Quét mã VietQR
              </Text>
            </View>

            <View style={styles.rowRight}>
              <ChevronRight size={17} color={inkBorder} strokeWidth={2.4} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= NHÓM 5: DỮ LIỆU & QUẢN TRỊ TÀI KHOẢN ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderText, { color: textMutedColor }]}>
            Dữ liệu & Tài khoản
          </Text>
        </View>

        <View style={[styles.groupedCard, cardBgStyle]}>
          {/* Định danh thiết bị & Lưu trữ */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <View style={styles.iconContainerFloating}>
                <ShieldCheck size={22} color={tokens.primary} strokeWidth={2.8} />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={[styles.rowTitle, { color: inkBorder }]}>
                  Định danh thiết bị
                </Text>
                <Text style={{ fontSize: 12, color: textMutedColor, marginTop: 1, fontFamily: 'Nunito', fontWeight: '600' }} numberOfLines={1}>
                  {user?.full_name ? `Tên: ${user.full_name}` : 'Lưu trữ cục bộ trên máy'}
                </Text>
              </View>
            </View>

            <View style={styles.rowRight}>
              <View
                style={[
                  styles.valueBadge,
                  {
                    backgroundColor: isPink ? '#FCE7F3' : '#FFF4CC',
                    borderColor: inkBorder,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.valueBadgeText,
                    { color: inkBorder },
                  ]}
                >
                  Bảo mật
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.rowDivider, { backgroundColor: isPink ? 'rgba(59, 7, 19, 0.08)' : 'rgba(43, 33, 24, 0.08)' }]} />

          {/* Action 1: Reset Data */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleResetAllData}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconContainerFloating}>
                <Trash2 size={22} color={tokens.primary} strokeWidth={2.8} />
              </View>
              <Text style={[styles.rowTitle, { color: '#C86D51' }]}>
                Đặt lại dữ liệu
              </Text>
            </View>

            <ChevronRight size={17} color={inkBorder} strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: isPink ? 'rgba(59, 7, 19, 0.08)' : 'rgba(43, 33, 24, 0.08)' }]} />

          {/* Action 2: Delete Account */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconContainerFloating}>
                <UserX size={22} color={tokens.primary} strokeWidth={2.8} />
              </View>
              <Text style={[styles.rowTitle, { color: '#C86D51' }]}>
                Xóa tài khoản
              </Text>
            </View>

            <ChevronRight size={17} color={inkBorder} strokeWidth={2.4} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: isPink ? 'rgba(59, 7, 19, 0.08)' : 'rgba(43, 33, 24, 0.08)' }]} />

          {/* Action 3: Sign Out */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (onSignOut) {
                onSignOut();
              } else {
                signOut();
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconContainerFloating}>
                <LogOut size={22} color={tokens.primary} strokeWidth={2.8} />
              </View>
              <Text style={[styles.rowTitle, { color: inkBorder }]}>
                Đăng xuất
              </Text>
            </View>

            <ChevronRight size={17} color={inkBorder} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* APP VERSION FOOTER */}
        <View style={styles.versionFooter}>
          <Text
            style={[
              styles.versionText,
              {
                color: textMutedColor,
              },
            ]}
          >
            PigFly v4.5 (Build 54) • Heo Con Neo-Brutalist
          </Text>
        </View>
      </ScrollView>

      {/* ================= UNIVERSAL MODAL BOTTOM SHEET NEO-BRUTALIST ================= */}
      <Modal
        visible={activeSheet !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setActiveSheet(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setActiveSheet(null)}
          />

          <View
            style={[
              styles.modalSheetContainer,
              {
                backgroundColor: sheetBg,
                borderTopColor: inkBorder,
                borderTopWidth: 3,
              },
            ]}
          >
            {/* DRAG HANDLE */}
            <View style={styles.dragHandleWrapper}>
              <View
                style={[
                  styles.dragHandle,
                  { backgroundColor: inkBorder },
                ]}
              />
            </View>

            {/* SHEET HEADER */}
            <View style={styles.sheetHeader}>
              <Text
                style={[
                  styles.sheetTitle,
                  {
                    color: inkBorder,
                    fontFamily: 'Baloo2_800ExtraBold',
                    fontWeight: '800',
                  },
                ]}
              >
                {activeSheet === 'BACKUP'
                  ? 'Sao lưu & Khôi phục'
                  : activeSheet === 'THEME'
                  ? 'Giao diện ứng dụng'
                  : activeSheet === 'WIDGET'
                  ? 'Tiện ích Màn hình khóa'
                  : activeSheet === 'BANK'
                  ? 'Thông báo ngân hàng'
                  : 'Quét mã VietQR'}
              </Text>

              <TouchableOpacity
                style={[
                  styles.sheetCloseButtonNeo,
                  {
                    backgroundColor: badgeBg,
                    borderColor: inkBorder,
                  },
                ]}
                onPress={() => setActiveSheet(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
                accessibilityLabel="Đóng"
              >
                <X size={16} color={inkBorder} strokeWidth={2.8} />
              </TouchableOpacity>
            </View>

            {/* SHEET CONTENT */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetScrollContent}
            >
              {activeSheet === 'BACKUP' && <DataBackupCard />}
              {activeSheet === 'THEME' && <ThemeSettingsCard />}
              {activeSheet === 'WIDGET' && <LockScreenSettingsCard />}
              {activeSheet === 'BANK' && <BankNotificationSettingsCard />}
              {activeSheet === 'QR' && <QRPaySettingsCard />}
            </ScrollView>

            {/* STICKY BOTTOM ACTIONS */}
            <View
              style={[
                styles.sheetBottomBar,
                {
                  backgroundColor: sheetBg,
                  borderTopColor: inkBorder,
                  borderTopWidth: 2,
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.sheetDoneButton,
                  {
                    backgroundColor: accentColor,
                    borderColor: inkBorder,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveSheet(null);
                }}
                activeOpacity={0.85}
              >
                <Check size={18} color={accentTextColor} strokeWidth={2.8} />
                <Text
                  style={[
                    styles.sheetDoneButtonText,
                    {
                      color: accentTextColor,
                      fontFamily: 'Baloo2_800ExtraBold',
                      fontWeight: '800',
                    },
                  ]}
                >
                  Xong
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  backButtonNeo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Baloo2_800ExtraBold',
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
  scrollContent: {
    gap: Spacing.sm,
  },
  sectionHeaderRow: {
    paddingHorizontal: 4,
    marginTop: Spacing.xs,
    marginBottom: 4,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'Nunito',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  groupedCard: {
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainerFloating: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    fontFamily: 'Nunito',
    letterSpacing: -0.2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  valueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5.5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  valueBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Nunito',
  },
  rowDivider: {
    height: 1,
    marginLeft: 54,
  },
  versionFooter: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Nunito',
  },

  // ================= MODAL & BOTTOM SHEET =================
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalSheetContainer: {
    height: '75%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  dragHandleWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Baloo2_800ExtraBold',
    letterSpacing: -0.2,
  },
  sheetCloseButtonNeo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  sheetBottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sheetDoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 16,
    borderWidth: 2.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  sheetDoneButtonText: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'Baloo2_800ExtraBold',
    letterSpacing: 0.2,
  },
});
