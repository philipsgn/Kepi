import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
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
  Check,
  ChevronRight,
  Cloud,
  EyeOff,
  LogOut,
  Palette,
  QrCode,
  Smartphone,
  Sparkles,
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
import { radii } from '../../theme/tokens';

const STORAGE_KEY_MASK_MONEY = 'vi_locket_mask_money';

export interface SettingsViewProps {
  onSignOut?: () => void;
}

type ActiveSheetType = 'BACKUP' | 'THEME' | 'WIDGET' | 'BANK' | 'QR' | null;

/**
 * Màn hình Cài Đặt Chuyên Biệt (SettingsView)
 * Thiết kế tinh gọn theo triết lý Progressive Disclosure & Apple Settings:
 * - Hàng tóm tắt cấu hình hiện tại (Grouped Inset Rows)
 * - Chạm vào từng đặc trưng mới mở Bottom Sheet chỉnh sửa chuyên sâu
 * - Loại bỏ hoàn toàn nguy cơ quẹt trúng hoặc bấm nhầm liên tục
 */
export const SettingsView: React.FC<SettingsViewProps> = ({ onSignOut }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tokens, isDark, themeMode } = useTheme();
  const { contentBottomPadding } = useBottomInset();

  const { user, updateProfile, signOut } = useAuthStore();
  const { loadTransactions } = useTransactionStore();

  const [isMasked, setIsMasked] = useState(false);
  const [activeSheet, setActiveSheet] = useState<ActiveSheetType>(null);

  // Load preferences from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const savedMask = await AsyncStorage.getItem(STORAGE_KEY_MASK_MONEY);
        if (savedMask !== null) setIsMasked(savedMask === 'true');
      } catch (err) {
        console.warn('Failed to load settings preferences:', err);
      }
    })();
  }, []);

  // Handler: Toggle Mask Money
  const handleToggleMask = async (val: boolean) => {
    setIsMasked(val);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_MASK_MONEY, String(val));
      await updateProfile({ privacy_mode: val });
    } catch {}
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

  // Text helpers
  const themeLabel =
    themeMode === 'dark' ? 'Tối' : themeMode === 'light' ? 'Sáng' : 'Tự động';

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg, paddingTop: insets.top + Spacing.sm }]}>
      {/* HEADER: NÚT BACK + TIÊU ĐỀ CÀI ĐẶT */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonBorderless}
          onPress={handleBack}
          activeOpacity={0.65}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Quay lại Hồ sơ"
        >
          <ArrowLeft size={22} color={tokens.text} strokeWidth={2.8} />
        </TouchableOpacity>

        <Text style={[styles.screenTitle, { color: tokens.text }]}>Cài đặt</Text>

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
          <Text style={[styles.sectionHeaderText, { color: tokens.textMuted }]}>
            Sao lưu & Đồng bộ
          </Text>
        </View>

        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: isDark ? '#162231' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(229, 152, 68, 0.16)',
            },
          ]}
        >
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
              <Text style={[styles.rowTitle, { color: tokens.text }]}>
                Sao lưu & Khôi phục
              </Text>
            </View>
            <View style={styles.rowRight}>
              <View
                style={[
                  styles.valueBadge,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FAF6EC' },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: '#10B981' },
                  ]}
                />
                <Text
                  style={[
                    styles.valueBadgeText,
                    { color: tokens.success },
                  ]}
                >
                  Khả dụng
                </Text>
              </View>
              <ChevronRight size={17} color={tokens.textMuted} strokeWidth={2.2} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= NHÓM 2: GIAO DIỆN & CÁ NHÂN HÓA ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderText, { color: tokens.textMuted }]}>
            Giao diện & Cá nhân hóa
          </Text>
        </View>

        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: isDark ? '#162231' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(229, 152, 68, 0.16)',
            },
          ]}
        >
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
              <Text style={[styles.rowTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                Giao diện
              </Text>
            </View>

            <View style={styles.rowRight}>
              <View
                style={[
                  styles.valueBadge,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FAF6EC' },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={[styles.valueBadgeText, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                  {themeLabel}
                </Text>
              </View>
              <ChevronRight size={17} color={tokens.textMuted} strokeWidth={2.2} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= NHÓM 3: BẢO MẬT & QUYỀN RIÊNG TƯ ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderText, { color: tokens.textMuted }]}>
            Bảo mật & Quyền riêng tư
          </Text>
        </View>

        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: isDark ? '#162231' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(229, 152, 68, 0.16)',
            },
          ]}
        >
          {/* Row 1: Ẩn số tiền */}
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <View style={styles.iconContainerFloating}>
                <EyeOff size={22} color={tokens.primary} strokeWidth={2.8} />
              </View>
              <Text style={[styles.rowTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                Ẩn số tiền
              </Text>
            </View>

            <Switch
              value={isMasked}
              onValueChange={(val) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleToggleMask(val);
              }}
              trackColor={{ false: isDark ? '#2A3644' : '#E2DCD5', true: tokens.primary }}
              thumbColor={isDark ? '#FAF6EC' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* ================= NHÓM 4: TIỆN ÍCH & TÍCH HỢP ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderText, { color: tokens.textMuted }]}>
            Tiện ích & Tích hợp
          </Text>
        </View>

        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: isDark ? '#162231' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(229, 152, 68, 0.16)',
            },
          ]}
        >
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
              <Text style={[styles.rowTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                Widget màn hình khóa
              </Text>
            </View>

            <View style={styles.rowRight}>
              <View
                style={[
                  styles.valueBadge,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FAF6EC' },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={[styles.valueBadgeText, { color: tokens.success }]}>
                  Khả dụng
                </Text>
              </View>
              <ChevronRight size={17} color={tokens.textMuted} strokeWidth={2.2} />
            </View>
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' }]} />

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
              <Text style={[styles.rowTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                Thông báo ngân hàng
              </Text>
            </View>

            <View style={styles.rowRight}>
              <View
                style={[
                  styles.valueBadge,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FAF6EC' },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={[styles.valueBadgeText, { color: tokens.success }]}>
                  Khả dụng
                </Text>
              </View>
              <ChevronRight size={17} color={tokens.textMuted} strokeWidth={2.2} />
            </View>
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' }]} />

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
              <Text style={[styles.rowTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                Quét mã VietQR
              </Text>
            </View>

            <View style={styles.rowRight}>
              <View
                style={[
                  styles.valueBadge,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FAF6EC' },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={[styles.valueBadgeText, { color: tokens.success }]}>
                  Khả dụng
                </Text>
              </View>
              <ChevronRight size={17} color={tokens.textMuted} strokeWidth={2.2} />
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= NHÓM 5: DỮ LIỆU & QUẢN TRỊ TÀI KHOẢN ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionHeaderText, { color: tokens.textMuted }]}>
            Dữ liệu & Tài khoản
          </Text>
        </View>

        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: isDark ? '#162231' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(229, 152, 68, 0.16)',
            },
          ]}
        >
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

            <ChevronRight size={17} color={tokens.textMuted} strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' }]} />

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

            <ChevronRight size={17} color={tokens.textMuted} strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={[styles.rowDivider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' }]} />

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
              <Text style={[styles.rowTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                Đăng xuất
              </Text>
            </View>

            <ChevronRight size={17} color={tokens.textMuted} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>


        {/* APP VERSION FOOTER */}
        <View style={styles.versionFooter}>
          <Text style={[styles.versionText, { color: tokens.textMuted }]}>
            Ví Locket v1.0.0 (Build 54) • Hà Nội Thu Đông
          </Text>
        </View>
      </ScrollView>

      {/* ================= UNIVERSAL MODAL BOTTOM SHEET ================= */}
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
                backgroundColor: isDark ? '#0E1620' : '#FAF6F0',
                borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
          >
            {/* DRAG HANDLE */}
            <View style={styles.dragHandleWrapper}>
              <View
                style={[
                  styles.dragHandle,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)' },
                ]}
              />
            </View>

            {/* SHEET HEADER */}
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
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
                style={styles.sheetCloseButtonBorderless}
                onPress={() => setActiveSheet(null)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Đóng"
              >
                <X size={20} color={isDark ? '#FAF6EC' : '#1B2733'} strokeWidth={2.6} />
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
                  backgroundColor: isDark ? '#0E1620' : '#FAF6F0',
                  borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                },
              ]}
            >
              <TouchableOpacity
                style={[styles.sheetDoneButton, { backgroundColor: tokens.primary }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveSheet(null);
                }}
                activeOpacity={0.85}
              >
                <Check size={18} color="#0E1620" strokeWidth={2.8} />
                <Text style={styles.sheetDoneButtonText}>Xong</Text>
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
  backButtonBorderless: {
    padding: 6,
    marginLeft: -6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 40,
    height: 40,
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
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  groupedCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12.5,
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
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  valueBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  rowDivider: {
    height: 1,
    marginLeft: 54,
  },
  versionFooter: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 11.5,
    fontWeight: '500',
  },

  // ================= MODAL & BOTTOM SHEET =================
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modalSheetContainer: {
    height: '75%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  dragHandleWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 4.5,
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
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sheetCloseButtonBorderless: {
    padding: 6,
    marginRight: -4,
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
    borderTopWidth: 1,
  },
  sheetDoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 24,
    shadowColor: '#E59844',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  sheetDoneButtonText: {
    color: '#0E1620',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
