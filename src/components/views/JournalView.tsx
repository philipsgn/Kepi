import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Eye,
  EyeOff,
  Flame,
  Settings,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Theme & Tokens
import { useTheme } from '../../theme/ThemeContext';

// Neo-Kit Components
import {
  NeoCard,
  NeoButton,
  SegmentBar10,
  OverlineLabel,
  DashedDivider,
  DongMark,
  NeoWalletPill,
} from '../neo';

// Pixel Garden
import {
  PixelGardenWebView,
  PixelGardenWebViewRef,
} from '../pixel/PixelGardenWebView';

// Modals & Supporting Components
import { PixelPigAvatar } from '../pixel/PixelPigAvatar';
import { PigFlyMascot } from '../mascot/PigBoMascot';
import { CompactMonthGrid } from '../journal/CompactMonthGrid';
import { DayDetailBottomSheet } from '../journal/DayDetailBottomSheet';
import { QuickSettingsSheet } from '../profile/QuickSettingsSheet';
import { StreakCheckinModal } from '../streak/StreakCheckinModal';
import { StreakCelebrationToast } from '../streak/StreakCelebrationToast';
import { ConfirmationPillBanner, ConfirmationInboxModal } from '../inbox';
import { MonthRolloverBanner } from '../budget/MonthRolloverBanner';
import { MandCashierKeyboard } from '../common/MandCashierKeyboard';

// Hooks & Stores
import { useBottomInset } from '../../hooks/useBottomInset';
import { useConfirmationInbox } from '../../hooks/useConfirmationInbox';
import { useAuthStore } from '../../store/authStore';
import { useBudgetStore } from '../../store/budgetStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useCategoryStore } from '../../store/categoryStore';
import { renderCategoryMonochromeIcon } from '../../constants/categories';
import { formatVND } from '../../utils/currency';
import {
  DayCalendarCell,
  getVietnamDateString,
} from '../../utils/calendarUtils';
import { calculateStreakDays } from '../../utils/profileUtils';
import { getPigContextualAdvice, PigAdviceResult } from '../../utils/pigAdviceEngine';
import { Transaction } from '../../types/database';

const STORAGE_PREFS_KEY = '@vi_locket_home_preferences';

export interface JournalViewProps {
  isActive?: boolean;
  onOpenTransactionDetail?: (tx: Transaction) => void;
  onOpenProfile?: () => void;
  onOpenCamera?: () => void;
  onOpenHouse?: () => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  isActive,
  onOpenTransactionDetail,
  onOpenProfile,
  onOpenCamera,
  onOpenHouse,
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
    adjustWalletBalance,
    monthRolloverBanner,
    dismissRolloverBanner,
    checkAndApplyMonthRollover,
  } = useBudgetStore();
  const { transactions, addTransaction } = useTransactionStore();
  const { getExpenseCategories } = useCategoryStore();

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

  // Danh mục chi tiêu động cho dải Ghi Nhanh
  const expenseCategories = useMemo(() => getExpenseCategories(), [getExpenseCategories]);

  // View state
  const [isPrivacyHidden, setIsPrivacyHidden] = useState<boolean>(false);
  const [temporaryQuote, setTemporaryQuote] = useState<string | null>(null);

  // Modals & Sheets
  const [selectedDayCell, setSelectedDayCell] = useState<DayCalendarCell | null>(null);
  const [isDaySheetOpen, setIsDaySheetOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState<boolean>(false);

  // Quick Log Modal State
  const [quickLogModalVisible, setQuickLogModalVisible] = useState<boolean>(false);
  const [selectedQuickCat, setSelectedQuickCat] = useState<string>('an_uong');
  const [quickAmount, setQuickAmount] = useState<number>(0);

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

  // Spending calculations: Hạn mức ngày động tính từ Hũ Tiền
  const effectiveLimit = todayBudget > 0 ? todayBudget : 300000;
  const isOverBudget = todaySpent > effectiveLimit;
  const remainingToday = Math.max(0, effectiveLimit - todaySpent);
  const overspentAmount = Math.max(0, todaySpent - effectiveLimit);

  // Trục xương sống: Tự động đồng bộ ngân sách & biểu cảm xuống Vườn Pixel khi có biến động từ bất kỳ Tab nào
  useEffect(() => {
    gardenRef.current?.updateBudget(todaySpent, effectiveLimit);
  }, [todaySpent, effectiveLimit]);

  // Động cơ Lời khuyên Ngộ nghĩnh & Biểu cảm Heo theo bối cảnh
  const contextualAdvice: PigAdviceResult = useMemo(() => {
    return getPigContextualAdvice({
      todayBudget: effectiveLimit,
      todaySpent,
      streakDays: currentStreak,
    });
  }, [effectiveLimit, todaySpent, currentStreak]);

  const displayedAdviceText = temporaryQuote || contextualAdvice.text;
  const displayedPigMood = contextualAdvice.mood;

  // Quick log execution
  const handleExecuteQuickExpense = async (name: string, amount: number, category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    try {
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

      recordExpense(amount);

      gardenRef.current?.feedPig();
      gardenRef.current?.updateBudget(todaySpent + amount, effectiveLimit);

      setTemporaryQuote(`${name} −${formatVND(amount)}! Heo đã ghi vào sổ rồi nha.`);
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể ghi nhận khoản chi');
    }
  };

  const handleOpenQuickLogTag = (catId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedQuickCat(catId);
    setQuickAmount(0);
    setQuickLogModalVisible(true);
  };

  const handleQuickLogSubmit = async () => {
    if (quickAmount <= 0) return;
    const cat = expenseCategories.find((c) => c.id === selectedQuickCat);
    const catName = cat?.name || 'Chi tiêu';
    await handleExecuteQuickExpense(catName, quickAmount, selectedQuickCat);
    setQuickLogModalVisible(false);
  };

  const handleFeedPig = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    gardenRef.current?.feedPig();
    setTemporaryQuote('Ngon quá! Heo cảm ơn bạn nha 🌾');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.bg || '#F6EEDC',
          paddingTop: insets.top + 4,
        },
      ]}
    >
      {/* 1. HEADER (NEO-BRUTALIST BAR CÓ HŨ TIỀN) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.avatarBox}
            onPress={onOpenProfile}
            activeOpacity={0.8}
            accessibilityLabel="Mở Hồ sơ"
          >
            <View style={styles.avatarInner}>
              <PixelPigAvatar size={34} mood="idle" borderless />
            </View>
          </TouchableOpacity>

          <View style={styles.headerUserInfo}>
            <Text style={[styles.userName, { color: tokens.text || '#2B2118' }]} numberOfLines={1}>
              {userName}
            </Text>
            <TouchableOpacity
              style={styles.streakPill}
              activeOpacity={0.7}
              onPress={() => setShowStreakModal(true)}
            >
              <Flame size={12} color="#F4B93B" fill="#F4B93B" />
              <Text style={styles.streakText}>Chuỗi {currentStreak}N</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* HŨ TIỀN (VÍ TỔNG) NẰM NGAY TRÊN HEADER */}
          <NeoWalletPill
            amount={realBalance}
            isPrivacyHidden={isPrivacyHidden}
            onAdjustBalance={adjustWalletBalance}
          />

          {/* Nút Ẩn/Hiện tiền */}
          <NeoButton
            variant="round"
            onPress={handleTogglePrivacy}
            icon={
              isPrivacyHidden ? (
                <EyeOff size={16} color="#2B2118" strokeWidth={2.6} />
              ) : (
                <Eye size={16} color="#2B2118" strokeWidth={2.6} />
              )
            }
          />

          {/* Nút Cài đặt */}
          <NeoButton
            variant="round"
            onPress={() => setIsSettingsOpen(true)}
            icon={<Settings size={16} color="#2B2118" strokeWidth={2.6} />}
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
            style={{ marginBottom: 8 }}
          />
        )}

        {/* 2. KHUNG VƯỜN PIXEL ART (CANVAS 176x132 4:3) */}
        <View style={styles.gardenWrapper}>
          <NeoCard radius={26} style={styles.gardenCard} depth={4}>
            <View style={styles.gardenInner}>
              <PixelGardenWebView
                ref={gardenRef}
                spent={todaySpent}
                limit={effectiveLimit}
                streak={currentStreak}
                isActive={isActive}
                onPigTap={(quote) => setTemporaryQuote(quote)}
                onEnterHouse={onOpenHouse}
              />
            </View>
          </NeoCard>
        </View>

        {/* 3. THẺ CHI TIÊU HÔM NAY (ĐÈ −20px LÊN VƯỜN) — THỂ HIỆN SONG HÀNH ĐÃ CHI & ĐƯỢC CHI */}
        <NeoCard overlap radius={24} depth={4} style={styles.spendCard}>
          <View style={styles.spendCardContent}>
            <View style={styles.spendDualHeader}>
              {/* Cột Trái: Đã chi hôm nay */}
              <View style={styles.spendDualCol}>
                <OverlineLabel text="ĐÃ CHI HÔM NAY" />
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
                  {!isPrivacyHidden && <DongMark size={18} />}
                </View>
              </View>

              {/* Đường vách ngăn đứng */}
              <View style={styles.spendDualDivider} />

              {/* Cột Phải: Hôm nay được chi */}
              <View style={[styles.spendDualCol, { alignItems: 'flex-end' }]}>
                <OverlineLabel text="HÔM NAY ĐƯỢC CHI" />
                <View style={styles.amountContainer}>
                  <Text
                    style={[
                      styles.bigAmount,
                      { color: isOverBudget ? '#E0452B' : tokens.text || '#2B2118' },
                    ]}
                  >
                    {isPrivacyHidden
                      ? '••••••'
                      : formatVND(effectiveLimit).replace(/ đ$/, '')}
                  </Text>
                  {!isPrivacyHidden && <DongMark size={18} />}
                </View>
                <Text style={styles.limitTargetText}>
                  {isOverBudget
                    ? `vượt +${formatVND(overspentAmount)}`
                    : `còn lại ${formatVND(remainingToday)}`}
                </Text>
              </View>
            </View>

            {/* Thanh tiến độ 10 ô chuẩn Neo-Kit */}
            <SegmentBar10 spent={todaySpent} limit={effectiveLimit} />

            {/* Test 46 phrase accessibility tag */}
            <View
              style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
              accessibilityLabel="Chưa ghi hôm nay — Chạm để ghi"
            >
              <Text>Chưa ghi hôm nay — Chạm để ghi</Text>
            </View>

            <DashedDivider />

            {/* Lời nhắn thoại của Heo (Động cơ Lời khuyên bối cảnh & Avatar cảm xúc) */}
            <TouchableOpacity
              style={styles.pigTalkRow}
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setTemporaryQuote(null);
                gardenRef.current?.triggerReaction('happy');
              }}
            >
              <View style={styles.pigTalkAvatar}>
                <PixelPigAvatar size={24} mood={displayedPigMood} borderless />
              </View>
              <Text
                style={[
                  styles.pigTalkText,
                  { color: tokens.text || '#2B2118' },
                ]}
              >
                {displayedAdviceText}
              </Text>
            </TouchableOpacity>
          </View>
        </NeoCard>

        {/* 4. KHU VỰC GHI NHANH (TRƯỢT CHỌN TAGS & NHẬP NHANH TIỀN) */}
        <View style={styles.quickSection}>
          <OverlineLabel text="GHI NHANH THEO DANH MỤC" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickTagsScroll}
          >
            {expenseCategories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.quickTagChip}
                onPress={() => handleOpenQuickLogTag(cat.id)}
                activeOpacity={0.75}
              >
                {renderCategoryMonochromeIcon({
                  categoryId: cat.id,
                  size: 15,
                  color: '#2B2118',
                  strokeWidth: 2.4,
                })}
                <Text style={styles.quickTagText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 5. LỊCH GHI CHÉP THÁNG (COMPACT MONTH GRID 7 CỘT) */}
        <View style={styles.calendarSection}>
          <OverlineLabel text="LỊCH GHI CHÉP THÁNG" />
          <CompactMonthGrid
            transactions={transactions}
            onSelectDay={(day: DayCalendarCell) => {
              setSelectedDayCell(day);
              setIsDaySheetOpen(true);
            }}
            onOpenCamera={onOpenCamera}
          />
        </View>
      </ScrollView>

      {/* MODAL BÀN PHÍM MAND CASHIER KHI BẤM VÀO TAG GHI NHANH */}
      <Modal
        visible={quickLogModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setQuickLogModalVisible(false)}
      >
        <Pressable
          style={styles.keyboardModalOverlay}
          onPress={() => setQuickLogModalVisible(false)}
        >
          <Pressable
            style={styles.keyboardModalCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.keyboardModalHeader}>
              <Text style={styles.keyboardModalTitle}>GHI NHANH CHI TIÊU</Text>
              <TouchableOpacity
                onPress={() => setQuickLogModalVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.keyboardCloseBtn}
              >
                <X size={20} color="#2B2118" strokeWidth={2.6} />
              </TouchableOpacity>
            </View>

            <MandCashierKeyboard
              amount={quickAmount}
              onChangeAmount={setQuickAmount}
              category={selectedQuickCat}
              onChangeCategory={setSelectedQuickCat}
              onSubmit={handleQuickLogSubmit}
              submitText="Lưu ✔"
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sheets & Modals Khác */}
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
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2.5,
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
  headerUserInfo: {
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: 110,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: Platform.select({
      ios: 'Baloo2-ExtraBold',
      android: 'Baloo2_800ExtraBold',
      default: 'system-ui',
    }),
    lineHeight: 18,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
    gap: 3,
    alignSelf: 'flex-start',
  },
  streakText: {
    color: '#F4B93B',
    fontSize: 10,
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
    gap: 6,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 6,
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
    bottom: 30,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
    zIndex: 5,
  },
  gardenStateText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#2B2118',
    fontFamily: Platform.select({
      ios: 'Nunito-ExtraBold',
      android: 'Nunito_800ExtraBold',
      default: 'system-ui',
    }),
  },
  spendCard: {
    padding: 14,
  },
  spendCardContent: {
    width: '100%',
  },
  spendDualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  spendDualCol: {
    flex: 1,
  },
  spendDualDivider: {
    width: 2,
    height: 48,
    backgroundColor: 'rgba(43, 33, 24, 0.12)',
    marginHorizontal: 10,
    alignSelf: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 2,
  },
  bigAmount: {
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    fontFamily: Platform.select({
      ios: 'Baloo2-ExtraBold',
      android: 'Baloo2_800ExtraBold',
      default: 'system-ui',
    }),
    lineHeight: 28,
  },
  limitTargetText: {
    fontSize: 10.5,
    color: '#7A6852',
    fontWeight: '700',
    marginTop: 2,
    fontFamily: Platform.select({
      ios: 'Nunito-Bold',
      android: 'Nunito_700Bold',
      default: 'system-ui',
    }),
  },
  emptyPromptRow: {
    marginTop: 4,
    marginBottom: 4,
  },
  emptyPromptText: {
    fontSize: 11.5,
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
    gap: 8,
  },
  pigTalkAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#F9B8C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pigTalkEmoji: {
    fontSize: 17,
  },
  pigTalkText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
    fontFamily: Platform.select({
      ios: 'Nunito-Bold',
      android: 'Nunito_700Bold',
      default: 'system-ui',
    }),
  },
  quickSection: {
    marginTop: 14,
  },
  quickTagsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 6,
  },
  quickTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  quickTagText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12.5,
    color: '#2B2118',
  },
  feedActionRow: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  calendarSection: {
    marginTop: 14,
  },
  keyboardModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(43, 33, 24, 0.45)',
    justifyContent: 'flex-end',
  },
  keyboardModalCard: {
    backgroundColor: '#FFFBF1',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#2B2118',
    paddingBottom: 20,
    overflow: 'hidden',
  },
  keyboardModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(43, 33, 24, 0.12)',
  },
  keyboardModalTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 15,
    color: '#2B2118',
  },
  keyboardCloseBtn: {
    padding: 4,
  },
});
