import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Coffee,
  Eye,
  EyeOff,
  Flame,
  Settings,
  Sparkles,
  Utensils,
  Car,
  CupSoda,
  Landmark,
  Wallet,
  Coins,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Theme & Tokens
import { useTheme } from '../../theme/ThemeContext';
import { neoTokens } from '../../theme/tokens';

// Neo-Kit Components
import {
  NeoCard,
  NeoButton,
  NeoChip,
  SegmentBar10,
  OverlineLabel,
  DashedDivider,
  DongMark,
  NeoJar,
} from '../neo';

// Pixel Garden
import {
  PixelGardenWebView,
  PixelGardenWebViewRef,
} from '../pixel/PixelGardenWebView';

// Modals & Supporting Components
import { PigFlyMascot } from '../mascot/PigBoMascot';
import { WeekCalendarCarousel } from '../journal/WeekCalendarCarousel';
import { DayDetailBottomSheet } from '../journal/DayDetailBottomSheet';
import { QuickSettingsSheet } from '../profile/QuickSettingsSheet';
import { StreakCheckinModal } from '../streak/StreakCheckinModal';
import { StreakCelebrationToast } from '../streak/StreakCelebrationToast';
import { ConfirmationPillBanner, ConfirmationInboxModal } from '../inbox';
import { MonthRolloverBanner } from '../budget/MonthRolloverBanner';

// Hooks & Stores
import { useBottomInset } from '../../hooks/useBottomInset';
import { useConfirmationInbox } from '../../hooks/useConfirmationInbox';
import { useAuthStore } from '../../store/authStore';
import { useBudgetStore } from '../../store/budgetStore';
import { useTransactionStore } from '../../store/transactionStore';
import { formatVND, maskMoney } from '../../utils/currency';
import {
  DayCalendarCell,
  getVietnamDateString,
} from '../../utils/calendarUtils';
import { calculateStreakDays } from '../../utils/profileUtils';
import { Transaction } from '../../types/database';

const STORAGE_PREFS_KEY = '@vi_locket_home_preferences';

export interface JournalViewProps {
  onOpenTransactionDetail?: (tx: Transaction) => void;
  onOpenProfile?: () => void;
  onOpenCamera?: () => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  onOpenTransactionDetail,
  onOpenProfile,
  onOpenCamera,
}) => {
  const insets = useSafeAreaInsets();
  const { tokens } = useTheme();
  const { contentBottomPadding } = useBottomInset();
  const { user, profile } = useAuthStore();
  const {
    todayBudget,
    todaySpent,
    realBalance,
    recordExpense,
    monthRolloverBanner,
    dismissRolloverBanner,
    checkAndApplyMonthRollover,
  } = useBudgetStore();
  const { transactions, addTransaction } = useTransactionStore();

  const gardenRef = useRef<PixelGardenWebViewRef>(null);

  // Danh mục chuẩn cho Test 40: GỘP "Ăn uống" và "Cà Phê & Chill" thành "Ăn uống"
  const CATEGORIES = useMemo(() => [
    { key: 'all', label: 'Tất cả' },
    { key: 'an_uong', label: 'Ăn uống', matchKeys: ['an_uong', 'giai_tri', 'ca_phe'] },
    { key: 'di_chuyen', label: 'Di chuyển', matchKeys: ['di_chuyen'] },
    { key: 'mua_sam', label: 'Mua sắm', matchKeys: ['mua_sam'] },
    { key: 'co_dinh', label: 'Cố định', matchKeys: ['co_dinh'] },
    { key: 'chi_tieu_khac', label: 'Khác', matchKeys: ['chi_tieu_khac', 'other'] },
  ], []);

  // View state
  const [isPrivacyHidden, setIsPrivacyHidden] = useState<boolean>(false);
  const [pigQuote, setPigQuote] = useState<string>('Ủn ỉn! Heo đang giữ ví giúp bạn nè.');

  // Modals & Sheets
  const [selectedDayCell, setSelectedDayCell] = useState<DayCalendarCell | null>(null);
  const [isDaySheetOpen, setIsDaySheetOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState<boolean>(false);

  // Confirmation Inbox
  const { totalCount: inboxCount } = useConfirmationInbox();

  // Load preferences
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_PREFS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.isPrivacyHidden === 'boolean') {
            setIsPrivacyHidden(parsed.isPrivacyHidden);
          }
        }
      } catch (err) {}
    })();
  }, []);

  useEffect(() => {
    checkAndApplyMonthRollover();
  }, [checkAndApplyMonthRollover]);

  const handleTogglePrivacy = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const nextVal = !isPrivacyHidden;
    setIsPrivacyHidden(nextVal);
    try {
      await AsyncStorage.setItem(
        STORAGE_PREFS_KEY,
        JSON.stringify({ isPrivacyHidden: nextVal })
      );
    } catch (e) {}
  };

  const userName =
    profile?.full_name || user?.full_name || user?.email?.split('@')[0] || 'Bạn';

  // Streak
  const currentStreak = useMemo(() => {
    const dates = transactions
      .filter((tx) => tx.status === 'CONFIRMED' || !tx.status)
      .map((tx) => tx.occurred_at.slice(0, 10));
    return calculateStreakDays(dates);
  }, [transactions]);

  // Spending calculations
  const effectiveLimit = todayBudget > 0 ? todayBudget : 300000;
  const isOverBudget = todaySpent > effectiveLimit;
  const remainingToday = Math.max(0, effectiveLimit - todaySpent);
  const overspentAmount = Math.max(0, todaySpent - effectiveLimit);

  // Dynamic empathetic message
  const dynamicMessage = useMemo(() => {
    if (todaySpent === 0) {
      return 'Chưa chi đồng nào. Heo đang ngủ gật, đừng đánh thức nha.';
    }
    const ratio = todaySpent / effectiveLimit;
    if (ratio < 0.4) {
      return 'Chi nhẹ nhàng ghê. Heo ủn ỉn khen một cái!';
    }
    if (ratio < 0.75) {
      return 'Đang vừa vặn lắm. Heo vẫn để mắt canh chừng nha.';
    }
    if (ratio <= 1.0) {
      return 'Gần chạm hạn mức rồi đó. Heo bắt đầu hơi lo lo.';
    }
    return 'Lố hạn mức rồi... Heo buồn xíu. Mai mình chi gọn lại nha!';
  }, [todaySpent, effectiveLimit]);

  // Quick log chips handler
  const handleQuickExpense = async (name: string, amount: number, category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    try {
      // 1. Thêm vào transactionStore
      await addTransaction({
        userId: user?.id || 'local-user',
        type: 'EXPENSE',
        amount,
        category,
        description: name,
        photo_url: null,
        source: 'MANUAL',
        status: 'CONFIRMED',
      });

      // 2. Cập nhật budgetStore
      recordExpense(amount);

      // 3. Kích hoạt heo trong vườn chạy lại ăn cám
      gardenRef.current?.feedPig();
      gardenRef.current?.updateBudget(todaySpent + amount, effectiveLimit);

      setPigQuote(`${name} −${formatVND(amount)} đ! Heo đã ghi chép rồi.`);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể ghi nhận khoản chi');
    }
  };

  const handleFeedPig = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    gardenRef.current?.feedPig();
    setPigQuote('Ngon quá! Heo cảm ơn bạn nha 🌾');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.bg || '#F6EEDC',
          paddingTop: insets.top + 6,
        },
      ]}
    >
      {/* 1. NEO HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.avatarBox}
            activeOpacity={0.8}
            onPress={onOpenProfile}
          >
            <View style={styles.avatarInner}>
              <PigFlyMascot size={32} />
            </View>
          </TouchableOpacity>

          <View style={styles.headerUserInfo}>
            <Text style={[styles.userName, { color: tokens.text || '#2B2118' }]}>
              {userName}
            </Text>
            <TouchableOpacity
              style={styles.streakPill}
              activeOpacity={0.7}
              onPress={() => setShowStreakModal(true)}
            >
              <Flame size={12} color="#F4B93B" fill="#F4B93B" />
              <Text style={styles.streakText}>Chuỗi {currentStreak} ngày</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* Nút Ẩn/Hiện tiền */}
          <NeoButton
            variant="round"
            onPress={handleTogglePrivacy}
            icon={
              isPrivacyHidden ? (
                <EyeOff size={18} color="#2B2118" strokeWidth={2.6} />
              ) : (
                <Eye size={18} color="#2B2118" strokeWidth={2.6} />
              )
            }
          />

          {/* Nút Cài đặt */}
          <NeoButton
            variant="round"
            onPress={() => setIsSettingsOpen(true)}
            icon={<Settings size={18} color="#2B2118" strokeWidth={2.6} />}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottomPadding + 96 },
        ]}
      >
        {/* Banner Rollover nếu có */}
        {monthRolloverBanner && monthRolloverBanner.visible && (
          <MonthRolloverBanner
            visible={monthRolloverBanner.visible}
            month={monthRolloverBanner.month}
            carriedBalance={monthRolloverBanner.carriedBalance}
            onDismiss={dismissRolloverBanner}
          />
        )}

        {/* Hộp thư chờ duyệt */}
        {inboxCount > 0 && (
          <ConfirmationPillBanner
            count={inboxCount}
            onPress={() => setIsInboxOpen(true)}
            style={{ marginBottom: 10 }}
          />
        )}

        {/* 2. KHUNG VƯỜN PIXEL ART (CANVAS 176x132 4:3) */}
        <View style={styles.gardenWrapper}>
          <NeoCard radius={28} style={styles.gardenCard} depth={4}>
            <View style={styles.gardenInner}>
              <PixelGardenWebView
                ref={gardenRef}
                spent={todaySpent}
                limit={effectiveLimit}
                onPigTap={(quote) => setPigQuote(quote)}
              />
              {/* Badge trạng thái vườn */}
              <View style={styles.gardenStateBadge}>
                <Text style={styles.gardenStateText}>
                  {isOverBudget ? '🔥 Lố hạn mức · buồn' : '🌱 Sân vườn · đi dạo'}
                </Text>
              </View>
            </View>
          </NeoCard>
        </View>

        {/* 3. THẺ CHI HÔM NAY (ĐÈ −22px LÊN VƯỜN) */}
        <NeoCard overlap radius={26} depth={4} style={styles.spendCard}>
          <View style={styles.spendCardContent}>
            <OverlineLabel text="ĐÃ CHI HÔM NAY" />

            <View style={styles.spendRow}>
              {/* Số tiền lớn Baloo 2 */}
              <View style={styles.amountContainer}>
                <Text
                  style={[
                    styles.bigAmount,
                    { color: tokens.text || '#2B2118' },
                  ]}
                >
                  {isPrivacyHidden
                    ? '••••••'
                    : formatVND(todaySpent).replace(/ đ$/, '')}
                </Text>
                {!isPrivacyHidden && <DongMark size={22} />}
              </View>

              {/* Tình trạng hạn mức */}
              <View style={styles.statusCol}>
                <Text style={styles.limitTargetText}>
                  {isOverBudget
                    ? 'vượt hạn mức'
                    : `còn lại trên ${Math.round(effectiveLimit / 1000)}k đ`}
                </Text>
                <Text
                  style={[
                    styles.limitValText,
                    {
                      color: isOverBudget
                        ? tokens.danger || '#E0452B'
                        : tokens.text || '#2B2118',
                    },
                  ]}
                >
                  {isPrivacyHidden
                    ? '•••• đ'
                    : isOverBudget
                    ? `+${formatVND(overspentAmount)}`
                    : formatVND(remainingToday)}
                </Text>
              </View>
            </View>

            {/* Thanh tiến độ 10 ô chuẩn Neo-Kit */}
            <SegmentBar10 spent={todaySpent} limit={effectiveLimit} />

            {/* Test 46 phrase for zero spending today */}
            {todaySpent === 0 && (
              <View style={styles.emptyPromptRow}>
                <Text style={[styles.emptyPromptText, { color: tokens.textMuted || '#7A6852' }]}>
                  Chưa ghi hôm nay —{' '}
                  <Text
                    style={{ color: tokens.primary || '#F4B93B', fontWeight: '800' }}
                    onPress={onOpenCamera}
                  >
                    Chạm để ghi
                  </Text>
                </Text>
              </View>
            )}

            <DashedDivider />

            {/* Lời nhắn thoại của Heo */}
            <View style={styles.pigTalkRow}>
              <View style={styles.pigTalkAvatar}>
                <Text style={styles.pigTalkEmoji}>🐷</Text>
              </View>
              <Text
                style={[
                  styles.pigTalkText,
                  { color: tokens.text || '#2B2118' },
                ]}
              >
                {pigQuote || dynamicMessage}
              </Text>
            </View>
          </View>
        </NeoCard>

        {/* 4. KHU VỰC GHI NHANH (QUICK LOG CHIPS) */}
        <View style={styles.quickSection}>
          <OverlineLabel text="GHI NHANH" />
          <View style={styles.chipsRow}>
            <NeoChip
              label="Cà phê"
              subLabel="25k đ"
              icon={<Coffee size={16} color="#2B2118" strokeWidth={2.4} />}
              onPress={() => handleQuickExpense('Cà phê', 25000, 'an_uong')}
            />
            <NeoChip
              label="Bánh mì"
              subLabel="20k đ"
              icon={<Utensils size={16} color="#2B2118" strokeWidth={2.4} />}
              onPress={() => handleQuickExpense('Bánh mì', 20000, 'an_uong')}
            />
            <NeoChip
              label="Cơm trưa"
              subLabel="45k đ"
              icon={<Utensils size={16} color="#2B2118" strokeWidth={2.4} />}
              onPress={() => handleQuickExpense('Cơm trưa', 45000, 'an_uong')}
            />
            <NeoChip
              label="Đổ xăng"
              subLabel="50k đ"
              icon={<Car size={16} color="#2B2118" strokeWidth={2.4} />}
              onPress={() => handleQuickExpense('Đổ xăng', 50000, 'di_chuyen')}
            />
            <NeoChip
              label="Trà sữa"
              subLabel="35k đ"
              icon={<CupSoda size={16} color="#2B2118" strokeWidth={2.4} />}
              onPress={() => handleQuickExpense('Trà sữa', 35000, 'an_uong')}
            />
          </View>

          {/* Nút Cho heo ăn */}
          <View style={styles.feedActionRow}>
            <NeoButton
              variant="gold"
              title="Cho heo ăn 🌾"
              onPress={handleFeedPig}
            />
          </View>
        </View>

        {/* 5. KHU VỰC HŨ TIỀN (JARS) */}
        <View style={styles.jarsSection}>
          <OverlineLabel text="HŨ TIỀN" />
          <View style={styles.jarsGrid}>
            <NeoJar
              title="Ngân hàng"
              amount={
                isPrivacyHidden
                  ? '••••'
                  : `${Math.round(Math.max(0, realBalance) / 1000000 * 10) / 10}M`
              }
              iconBgColor="#BCD7F5"
              icon={<Landmark size={16} color="#2B2118" strokeWidth={2.4} />}
            />
            <NeoJar
              title="Ví điện tử"
              amount={isPrivacyHidden ? '••••' : '3.2M'}
              iconBgColor="#F9B8C4"
              icon={<Wallet size={16} color="#2B2118" strokeWidth={2.4} />}
            />
            <NeoJar
              title="Tiền mặt"
              amount={isPrivacyHidden ? '••••' : '1.5M'}
              iconBgColor="#CDE6BE"
              icon={<Coins size={16} color="#2B2118" strokeWidth={2.4} />}
            />
          </View>
        </View>

        {/* 6. LỊCH GIAO DỊCH LOCKET (TUẦN & ALBUM ẢNH) */}
        <View style={styles.calendarSection}>
          <OverlineLabel text="LỊCH GHI CHÉP" />
          <WeekCalendarCarousel
            transactions={transactions}
            onSelectDay={(day: DayCalendarCell) => {
              setSelectedDayCell(day);
              setIsDaySheetOpen(true);
            }}
            onLongPressDay={(day: DayCalendarCell) => {
              setSelectedDayCell(day);
              setIsDaySheetOpen(true);
            }}
            onOpenCamera={onOpenCamera || (() => {})}
          />
        </View>
      </ScrollView>

      {/* Sheets & Modals */}
      <QuickSettingsSheet
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenProfile={() => {
          setIsSettingsOpen(false);
          onOpenProfile?.();
        }}
      />

      <DayDetailBottomSheet
        visible={isDaySheetOpen}
        dateStr={selectedDayCell?.dateStr || ''}
        transactions={transactions.filter(
          (t) =>
            (t.status === 'CONFIRMED' || !t.status) &&
            getVietnamDateString(t.created_at) === selectedDayCell?.dateStr
        )}
        isPrivacyHidden={isPrivacyHidden}
        onClose={() => setIsDaySheetOpen(false)}
        onSelectTransaction={(tx) => onOpenTransactionDetail?.(tx)}
        onTakePhotoForDay={onOpenCamera || (() => {})}
      />

      <ConfirmationInboxModal
        visible={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
      />

      <StreakCheckinModal
        visible={showStreakModal}
        streakDays={currentStreak}
        hasCheckedInToday={true}
        onClose={() => setShowStreakModal(false)}
      />

      {showStreakCelebration && (
        <StreakCelebrationToast
          visible={showStreakCelebration}
          streakCount={currentStreak}
          onDismiss={() => setShowStreakCelebration(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#F9B8C4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFace: {
    fontSize: 26,
  },
  headerUserInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.select({
      ios: 'Baloo2-ExtraBold',
      android: 'Baloo2_800ExtraBold',
      default: 'system-ui',
    }),
    lineHeight: 22,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
    gap: 4,
    alignSelf: 'flex-start',
  },
  streakText: {
    color: '#F4B93B',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: Platform.select({
      ios: 'Nunito-ExtraBold',
      android: 'Nunito_800ExtraBold',
      default: 'system-ui',
    }),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  gardenWrapper: {
    width: '100%',
    marginBottom: 0,
  },
  gardenCard: {
    padding: 0,
    backgroundColor: '#86B866',
  },
  gardenInner: {
    position: 'relative',
    width: '100%',
  },
  gardenStateBadge: {
    position: 'absolute',
    left: 10,
    bottom: 32,
    backgroundColor: '#FFFBF1',
    borderWidth: 3,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 5,
  },
  gardenStateText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2B2118',
    fontFamily: Platform.select({
      ios: 'Nunito-ExtraBold',
      android: 'Nunito_800ExtraBold',
      default: 'system-ui',
    }),
  },
  spendCard: {
    padding: 16,
  },
  spendCardContent: {
    width: '100%',
  },
  spendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  bigAmount: {
    fontSize: 36,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    fontFamily: Platform.select({
      ios: 'Baloo2-ExtraBold',
      android: 'Baloo2_800ExtraBold',
      default: 'system-ui',
    }),
    lineHeight: 40,
  },
  statusCol: {
    alignItems: 'flex-end',
  },
  limitTargetText: {
    fontSize: 11,
    color: '#7A6852',
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'Nunito-Bold',
      android: 'Nunito_700Bold',
      default: 'system-ui',
    }),
  },
  limitValText: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    fontFamily: Platform.select({
      ios: 'Baloo2-ExtraBold',
      android: 'Baloo2_800ExtraBold',
      default: 'system-ui',
    }),
  },
  emptyPromptRow: {
    marginTop: 4,
    marginBottom: 4,
  },
  emptyPromptText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'Nunito-Bold',
      android: 'Nunito_700Bold',
      default: 'system-ui',
    }),
  },
  pigTalkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pigTalkAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#F9B8C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pigTalkEmoji: {
    fontSize: 20,
  },
  pigTalkText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    fontFamily: Platform.select({
      ios: 'Nunito-Bold',
      android: 'Nunito_700Bold',
      default: 'system-ui',
    }),
  },
  quickSection: {
    marginTop: 22,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  feedActionRow: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  jarsSection: {
    marginTop: 22,
  },
  jarsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  calendarSection: {
    marginTop: 22,
  },
});
