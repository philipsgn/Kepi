import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Eye,
  EyeOff,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Theme & Tokens
import { useTheme } from '../../theme/ThemeContext';
import { radii, spacing } from '../../theme/tokens';
import { Strings } from '../../constants/strings';

// Base Components
import { Card } from '../common/Card';
import { Chip } from '../common/Chip';
import { ProgressBar } from '../common/ProgressBar';
import { EmptyState } from '../common/EmptyState';
import { RollingNumber } from '../common/RollingNumber';
import { PhotoCalendarGrid } from '../journal/PhotoCalendarGrid';
import { WeekCalendarCarousel } from '../journal/WeekCalendarCarousel';
import { DayDetailBottomSheet } from '../journal/DayDetailBottomSheet';
import { QuickSettingsSheet } from '../profile/QuickSettingsSheet';
import { StreakCheckinModal } from '../streak/StreakCheckinModal';
import { StreakCelebrationToast } from '../streak/StreakCelebrationToast';
import { ConfirmationPillBanner, ConfirmationInboxModal } from '../inbox';
import { MonthRolloverBanner } from '../budget/MonthRolloverBanner';
import { PigBoMascot } from '../mascot/PigBoMascot';


// Hooks & Stores
import { useBottomInset } from '../../hooks/useBottomInset';
import { useConfirmationInbox } from '../../hooks/useConfirmationInbox';
import { useAuthStore } from '../../store/authStore';
import { useBudgetStore } from '../../store/budgetStore';
import { useTransactionStore } from '../../store/transactionStore';
import { formatCompactVND, formatVND, maskMoney } from '../../utils/currency';
import {
  DayCalendarCell,
  getDayPeriod,
  getDaysRemainingInMonth,
  getGreetingByHour,
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
  const { tokens, isDark } = useTheme();
  const { contentBottomPadding } = useBottomInset();
  const { user, profile } = useAuthStore();
  const {
    monthlyIncome,
    monthlyFixedCosts,
    todayBudget,
    todaySpent,
    realBalance,
    savedMoney,
    goalTargetAmount,
    weeklyBudget,
    monthRolloverBanner,
    dismissRolloverBanner,
    checkAndApplyMonthRollover,
  } = useBudgetStore();
  const { transactions } = useTransactionStore();

  const monthlyBudget = useMemo(() => {
    return Math.max(0, monthlyIncome - monthlyFixedCosts);
  }, [monthlyIncome, monthlyFixedCosts]);

  // Kiểm tra kết chuyển tháng tự động khi JournalView mount
  useEffect(() => {
    checkAndApplyMonthRollover();
  }, [checkAndApplyMonthRollover]);

  // Month & Calendar Navigation State
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth() + 1); // 1-12

  // View Preferences State (Tuần này vs Tháng này)
  const [periodMode, setPeriodMode] = useState<'week' | 'month'>('week');
  const [isPrivacyHidden, setIsPrivacyHidden] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Sheet States
  const [selectedDayCell, setSelectedDayCell] = useState<DayCalendarCell | null>(null);
  const [isDaySheetOpen, setIsDaySheetOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isInboxOpen, setIsInboxOpen] = useState<boolean>(false);
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);
  const [showStreakCelebration, setShowStreakCelebration] = useState<boolean>(false);

  // Confirmation Inbox
  const { totalCount: inboxCount } = useConfirmationInbox();

  // Load Preferences from AsyncStorage
  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_PREFS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.preferredPeriod) setPeriodMode(parsed.preferredPeriod);
          if (typeof parsed.isPrivacyHidden === 'boolean') {
            setIsPrivacyHidden(parsed.isPrivacyHidden);
          }
        }
      } catch (err) {
        console.log('Error reading home prefs:', err);
      }
    };
    loadPrefs();
  }, []);

  const savePreferences = async (newPeriod: 'week' | 'month', newHidden: boolean) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_PREFS_KEY,
        JSON.stringify({ preferredPeriod: newPeriod, isPrivacyHidden: newHidden })
      );
    } catch (err) {
      console.log('Error saving home prefs:', err);
    }
  };

  const handleTogglePeriodMode = (mode: 'week' | 'month') => {
    Haptics.selectionAsync();
    setPeriodMode(mode);
    savePreferences(mode, isPrivacyHidden);
  };

  const handleTogglePrivacy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextHidden = !isPrivacyHidden;
    setIsPrivacyHidden(nextHidden);
    savePreferences(periodMode, nextHidden);
    if (profile) {
      useAuthStore.getState().updateProfile({ privacy_mode: nextHidden }).catch(() => {});
    }
  };

  // Tính chi tiêu và thu nhập tuần hiện tại (Thứ 2 đến Chủ Nhật)
  const weekStats = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0 = Mon
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    let expense = 0;
    let income = 0;
    transactions.forEach((tx) => {
      const isConfirmed = tx.status === 'CONFIRMED' || (!tx.status as any);
      if (!isConfirmed) return;
      const d = new Date(tx.created_at);
      if (d >= monday && d <= sunday) {
        if (tx.type === 'EXPENSE') expense += tx.amount;
        if (tx.type === 'INCOME') income += tx.amount;
      }
    });
    return { expense, income };
  }, [transactions]);


  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const remainingToday = Math.max(0, todayBudget - todaySpent);
  const isOverBudget = todayBudget > 0 && todaySpent > todayBudget;
  const spentRatio = todayBudget > 0 ? todaySpent / todayBudget : 0;
  const daysLeftInMonth = getDaysRemainingInMonth();
  const greeting = getGreetingByHour();
  const userName = profile?.full_name || user?.full_name || user?.email?.split('@')[0] || 'Bạn';

  // Tính chuỗi ngày liên tiếp ghi chép thực tế từ lịch sử giao dịch


  const currentStreak = useMemo(() => {
    const dates = transactions
      .filter((tx) => tx.status === 'CONFIRMED' || !tx.status)
      .map((tx) => tx.occurred_at.slice(0, 10));
    return calculateStreakDays(dates);
  }, [transactions]);

  // Định nghĩa danh mục: GỘP "Ăn uống" và "Cà Phê & Chill" thành "Ăn uống"
  const CATEGORIES = useMemo(() => [
    { key: 'all', label: 'Tất cả' },
    { key: 'an_uong', label: 'Ăn uống', matchKeys: ['an_uong', 'giai_tri', 'ca_phe'] },
    { key: 'di_chuyen', label: 'Di chuyển', matchKeys: ['di_chuyen'] },
    { key: 'mua_sam', label: 'Mua sắm', matchKeys: ['mua_sam'] },
    { key: 'co_dinh', label: 'Cố định', matchKeys: ['co_dinh'] },
    { key: 'chi_tieu_khac', label: 'Khác', matchKeys: ['chi_tieu_khac', 'other'] },
  ], []);

  // Lọc transactions theo tháng đang xem — CHỈ tính khoản đã CONFIRMED
  const monthTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const isConfirmed = tx.status === 'CONFIRMED' || (!tx.status as any);
      if (!isConfirmed) return false;

      const d = new Date(tx.created_at);
      const isMatchMonth =
        d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      if (!isMatchMonth) return false;

      if (selectedCategoryFilter === 'all') return true;
      const catConfig = CATEGORIES.find((c) => c.key === selectedCategoryFilter);
      if (catConfig?.matchKeys) {
        return catConfig.matchKeys.includes(tx.category);
      }
      return tx.category === selectedCategoryFilter;
    });
  }, [transactions, selectedMonth, selectedYear, selectedCategoryFilter, CATEGORIES]);

  // Tổng chi và thu trong tháng đang xem
  const totalMonthExpense = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalMonthIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  // Số dư tích luỹ thực tế toàn bộ tài khoản (Chỉ tính khoản CONFIRMED)
  const cumulativeStats = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach((tx) => {
      const isConfirmed = tx.status === 'CONFIRMED' || (!tx.status as any);
      if (!isConfirmed) return;
      if (tx.type === 'INCOME') inc += tx.amount;
      if (tx.type === 'EXPENSE') exp += tx.amount;
    });
    return { inc, exp, balance: inc - exp };
  }, [transactions]);

  // Số dư khả dụng như app ngân hàng:
  // Nếu có thu nhập: hiển thị Tổng Thu - Tổng Chi
  // Nếu chưa ghi thu nhập: hiển thị Ngân sách tháng còn lại
  const availableBalance = useMemo(() => {
    if (cumulativeStats.inc > 0) {
      return cumulativeStats.balance;
    }
    return Math.max(0, (monthlyBudget || 0) - totalMonthExpense);
  }, [cumulativeStats, monthlyBudget, totalMonthExpense]);

  // Ngân sách tháng còn lại sau khi trừ chi tiêu tháng này
  const monthRemainingBudget = Math.max(0, (monthlyBudget || 0) - totalMonthExpense);

  // Thống kê chu kỳ hiện tại (Tuần Này / Tháng Này)
  const currentPeriodExpense = periodMode === 'week' ? weekStats.expense : totalMonthExpense;
  const currentPeriodIncome = periodMode === 'week' ? weekStats.income : totalMonthIncome;
  const currentPeriodBudget = periodMode === 'week' ? weeklyBudget : monthlyBudget;
  const currentPeriodRatio = currentPeriodBudget > 0 ? Math.min(1, currentPeriodExpense / currentPeriodBudget) : 0;

  // Các khoản chi hôm nay (cho chế độ Ngày) — CHỈ tính khoản đã CONFIRMED
  const todayStr = getVietnamDateString(new Date());
  const todayTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const isConfirmed = tx.status === 'CONFIRMED' || (!tx.status as any);
      return isConfirmed && getVietnamDateString(tx.created_at) === todayStr;
    });
  }, [transactions, todayStr]);

  // Danh sách giao dịch của ngày đang chọn trong Sheet — CHỈ tính khoản đã CONFIRMED
  const selectedDayTransactions = useMemo(() => {
    if (!selectedDayCell) return [];
    return transactions.filter((tx) => {
      const isConfirmed = tx.status === 'CONFIRMED' || (!tx.status as any);
      return isConfirmed && getVietnamDateString(tx.created_at) === selectedDayCell.dateStr;
    });
  }, [transactions, selectedDayCell]);

  // Đồng hồ chạy thời gian thực (Real-time Clock & Icon buổi)
  const [realTime, setRealTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const weekdaysVi = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayOfWeekStr = weekdaysVi[realTime.getDay()];
  const padDigits = (n: number) => String(n).padStart(2, '0');
  const dateStrFormatted = `${dayOfWeekStr}, ${padDigits(realTime.getDate())}/${padDigits(realTime.getMonth() + 1)}/${realTime.getFullYear()}`;
  const timeStrFormatted = `${padDigits(realTime.getHours())}:${padDigits(realTime.getMinutes())}:${padDigits(realTime.getSeconds())}`;
  const currentPeriod = getDayPeriod(realTime);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.bg,
          paddingTop: insets.top + spacing.sm,
        },
      ]}
    >
      {/* 1. HEADER (ICON BUỔI, ĐỒNG HỒ REAL-TIME, TÊN, STREAK MINI & SỐ DƯ VÍ KHẢ DỤNG) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* DÒNG THỜI GIAN THỰC KÈM ICON BUỔI ĐẶC TRƯNG */}
          <View style={styles.realtimeHeaderRow}>
            {currentPeriod === 'MORNING' && <Sunrise size={14} color="#E59844" strokeWidth={2.6} />}
            {currentPeriod === 'NOON' && <Sun size={14} color="#E59844" strokeWidth={2.6} />}
            {currentPeriod === 'AFTERNOON' && <Sunset size={14} color="#C86D51" strokeWidth={2.6} />}
            {(currentPeriod === 'EVENING' || currentPeriod === 'NIGHT') && (
              <Moon size={14} color="#7E9F80" strokeWidth={2.6} />
            )}
            <Text style={[styles.realtimeDateText, { color: tokens.textMuted }]}>
              {dateStrFormatted} • {timeStrFormatted}
            </Text>
          </View>
          <View style={styles.userNameRow}>
            <Text style={[styles.userNameText, { color: tokens.text }]}>
              {userName}
            </Text>
            {/* STREAK MINI: CHỈ ICON & SỐ CHUỖI THỰC TẾ (SOFT TONAL) */}
            <TouchableOpacity
              style={[
                styles.streakMiniBadge,
                { backgroundColor: tokens.surfaceAlt },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowStreakModal(true);
              }}
              activeOpacity={0.7}
              accessibilityLabel="Xem chi tiết điểm danh chuỗi ngày"
            >
              <Sparkles size={12} color={tokens.primary} />
              <Text style={[styles.streakMiniText, { color: tokens.text }]}>{currentStreak}</Text>
            </TouchableOpacity>
          </View>

          {/* DÒNG TÓM TẮT SỐ DƯ KHẢ DỤNG TINH GỌN (NHƯ APP NGÂN HÀNG) */}
          <View style={styles.headerBalanceRow}>
            <Wallet size={13} color={tokens.primary} strokeWidth={2.2} />
            <Text style={[styles.headerBalanceLabel, { color: tokens.textMuted }]}>
              Ví:
            </Text>
            <Text style={[styles.headerBalanceAmount, { color: tokens.text }]}>
              {maskMoney(formatVND(availableBalance), isPrivacyHidden)}
            </Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* NÚT ẨN TIỀN (BẢO MẬT RIÊNG TƯ - ZERO BORDER FLOATING) */}
          <TouchableOpacity
            style={styles.headerBtnBorderless}
            onPress={handleTogglePrivacy}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Ẩn số tiền"
          >
            {isPrivacyHidden ? (
              <EyeOff size={20} color={tokens.primary} strokeWidth={2.6} />
            ) : (
              <Eye size={20} color={tokens.textMuted} strokeWidth={2.6} />
            )}
          </TouchableOpacity>

          {/* NÚT CÀI ĐẶT NHANH (ZERO BORDER FLOATING) */}
          <TouchableOpacity
            style={styles.headerBtnBorderless}
            onPress={() => setIsSettingsOpen(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Cài đặt"
          >
            <Settings size={20} color={tokens.text} strokeWidth={2.4} />
          </TouchableOpacity>

          {/* AVATAR CHẠM MỞ HỒ SƠ (ZERO BORDER FLOATING) */}
          <TouchableOpacity
            style={styles.headerBtnBorderless}
            onPress={onOpenProfile}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Hồ sơ cá nhân"
          >
            <User size={20} color={tokens.text} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottomPadding },
        ]}
      >
        {/* BANNER CHÀO THÁNG MỚI & ROLLOVER SỐ DƯ */}
        {monthRolloverBanner && monthRolloverBanner.visible && (
          <MonthRolloverBanner
            visible={monthRolloverBanner.visible}
            month={monthRolloverBanner.month}
            carriedBalance={monthRolloverBanner.carriedBalance}
            onDismiss={dismissRolloverBanner}
          />
        )}

        {/* DẢI THÔNG BÁO HỘP XÁC NHẬN */}
        {inboxCount > 0 && (
          <ConfirmationPillBanner
            count={inboxCount}
            onPress={() => setIsInboxOpen(true)}
            style={{ marginBottom: 6 }}
          />
        )}

        {/* 1. SECTION HERO: HẠN MỨC HÔM NAY TINH GỌN (TẬP TRUNG HÔM NAY TIÊU ĐƯỢC & ĐÃ CHI) */}
        <Card style={styles.allowanceCard} glow>
          {/* CHÚ HEO PIGBO NẰM GÁC MÉP THẺ NGÂN SÁCH */}
          <View style={styles.allowanceMascotWrapper}>
            <PigBoMascot pose="card" size={44} />
          </View>

          <View style={styles.todayAllowanceRow}>
            <View style={styles.todayAllowanceCol}>
              <Text style={[styles.todaySubTitle, { color: tokens.textMuted }]}>
                HÔM NAY TIÊU ĐƯỢC
              </Text>
              <RollingNumber
                value={remainingToday}
                isHidden={isPrivacyHidden}
                style={[
                  styles.todayAllowanceAmount,
                  { color: isOverBudget ? tokens.danger : tokens.text },
                ]}
              />
            </View>

            <View style={styles.todaySpentBadgeCol}>
              <Text style={[styles.todaySubTitle, { color: tokens.textMuted }]}>
                ĐÃ CHI HÔM NAY
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
                style={[
                  styles.todaySpentValue,
                  { color: todaySpent > 0 ? tokens.danger : tokens.textMuted },
                ]}
              >
                {maskMoney(todaySpent >= 1_000_000_000 ? formatCompactVND(todaySpent) : formatVND(todaySpent), isPrivacyHidden)}
              </Text>
            </View>
          </View>

          {/* THANH TIẾN ĐỘ DYNAMIC SMOOTHING HÔM NAY (MỎNG 6PX) */}
          <View style={styles.progressBarWrapper}>
            <ProgressBar progress={spentRatio} height={6} />
          </View>

          {/* FOOTER TINH GỌN: THÔNG BÁO VƯỢT HẠN MỨC HOẶC THÔNG TIN NGÂN SÁCH THÁNG */}
          <View style={styles.allowanceBottomRow}>
            {isOverBudget ? (
              <Text style={[styles.overBudgetNotice, { color: tokens.danger }]}>
                {Strings.budget.overBudgetAdvice(formatCompactVND(todaySpent - todayBudget))}
              </Text>
            ) : monthlyBudget > 0 ? (
              <Text style={[styles.subStatLabel, { color: tokens.textMuted }]}>
                Ngân sách tháng còn:{' '}
                <Text style={{ color: tokens.text, fontWeight: '600' }}>
                  {maskMoney(formatCompactVND(monthRemainingBudget), isPrivacyHidden)}
                </Text>
              </Text>
            ) : (
              <Text style={[styles.subStatLabel, { color: tokens.textMuted }]}>
                {Strings.budget.daysRemaining(daysLeftInMonth)}
              </Text>
            )}

            {savedMoney > 0 && (
              <Text style={[styles.subStatLabel, { color: tokens.textMuted }]}>
                Đã giữ lại:{' '}
                <Text style={{ color: tokens.success, fontWeight: '600' }}>
                  {maskMoney(formatCompactVND(savedMoney), isPrivacyHidden)}
                </Text>
              </Text>
            )}
          </View>
        </Card>

        {/* 2. DẢI DÒNG TIỀN THOÁNG ĐÃNG — BORDER-LESS (~46PX) */}
        <View style={styles.cashflowBarContainer}>
          {/* NÚT GẠT TUẦN / THÁNG MINI INLINE */}
          <View
            style={[
              styles.compactSegmentToggle,
              { backgroundColor: tokens.surfaceAlt },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.compactSegmentBtn,
                periodMode === 'week' && [
                  styles.compactSegmentBtnActive,
                  { backgroundColor: tokens.surface },
                ],
              ]}
              onPress={() => handleTogglePeriodMode('week')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.compactSegmentBtnText,
                  {
                    color: periodMode === 'week' ? tokens.text : tokens.textMuted,
                    fontWeight: periodMode === 'week' ? '700' : '500',
                  },
                ]}
              >
                Tuần
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.compactSegmentBtn,
                periodMode === 'month' && [
                  styles.compactSegmentBtnActive,
                  { backgroundColor: tokens.surface },
                ],
              ]}
              onPress={() => handleTogglePeriodMode('month')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.compactSegmentBtnText,
                  {
                    color: periodMode === 'month' ? tokens.text : tokens.textMuted,
                    fontWeight: periodMode === 'month' ? '700' : '500',
                  },
                ]}
              >
                Tháng
              </Text>
            </TouchableOpacity>
          </View>

          {/* 2 BADGE MÀU NỔI BẬT: CHI & THU (SOFT TONAL — KHÔNG VIỀN CỨNG) */}
          <View style={styles.cashflowBadgeRow}>
            {/* BADGE CHI */}
            <View
              style={[
                styles.cashflowPillBadge,
                { backgroundColor: tokens.dangerSoft },
              ]}
            >
              <TrendingDown size={14} color={tokens.danger} strokeWidth={2.4} />
              <Text style={[styles.pillBadgeLabel, { color: tokens.danger }]}>Chi</Text>
              <Text style={[styles.pillBadgeAmount, { color: tokens.danger }]}>
                {maskMoney(formatCompactVND(currentPeriodExpense), isPrivacyHidden)}
              </Text>
            </View>

            {/* BADGE THU */}
            <View
              style={[
                styles.cashflowPillBadge,
                { backgroundColor: tokens.successSoft },
              ]}
            >
              <TrendingUp size={14} color={tokens.success} strokeWidth={2.4} />
              <Text style={[styles.pillBadgeLabel, { color: tokens.success }]}>Thu</Text>
              <Text style={[styles.pillBadgeAmount, { color: tokens.success }]}>
                {maskMoney(formatCompactVND(currentPeriodIncome), isPrivacyHidden)}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. SECTION BỘ LỊCH THÍCH ỨNG: DẢI TUẦN CAROUSEL (TUẦN NÀY) HOẶC LƯỚI THÁNG (THÁNG NÀY) */}
        {periodMode === 'week' ? (
          <WeekCalendarCarousel
            transactions={transactions}
            onSelectDay={(cell) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedDayCell(cell);
              setIsDaySheetOpen(true);
            }}
            onLongPressDay={(cell) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setSelectedDayCell(cell);
              setIsDaySheetOpen(true);
            }}
            onOpenCamera={onOpenCamera || (() => {})}
            renderHeaderExtra={
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterChipScroll}
              >
                {CATEGORIES.map((cat) => (
                  <Chip
                    key={cat.key}
                    label={cat.label}
                    selected={selectedCategoryFilter === cat.key}
                    size="sm"
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedCategoryFilter(cat.key);
                    }}
                  />
                ))}
              </ScrollView>
            }
          />
        ) : (
          <PhotoCalendarGrid
            year={selectedYear}
            month={selectedMonth}
            transactions={monthTransactions}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            renderHeaderExtra={
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterChipScroll}
              >
                {CATEGORIES.map((cat) => (
                  <Chip
                    key={cat.key}
                    label={cat.label}
                    selected={selectedCategoryFilter === cat.key}
                    size="sm"
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedCategoryFilter(cat.key);
                    }}
                  />
                ))}
              </ScrollView>
            }
            onSelectDay={(cell) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedDayCell(cell);
              setIsDaySheetOpen(true);
            }}
            onLongPressDay={(cell) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setSelectedDayCell(cell);
              setIsDaySheetOpen(true);
            }}
            onOpenCamera={onOpenCamera || (() => {})}
          />
        )}

        {/* 4. THANH MINI PILL GỢI Ý CHỤP KHI CHƯA CÓ GIAO DỊCH HÔM NAY (~38PX) */}
        {todayTransactions.length === 0 && (
          <TouchableOpacity
            style={[
              styles.todayMiniPillBanner,
              {
                backgroundColor: tokens.surfaceAlt,
              },
            ]}
            onPress={onOpenCamera}
            activeOpacity={0.8}
          >
            <View style={styles.todayMiniPillContent}>
              <Sparkles size={14} color={tokens.primary} strokeWidth={2.2} />
              <Text style={[styles.todayMiniPillText, { color: tokens.textMuted }]}>
                Chưa ghi hôm nay —{' '}
                <Text style={{ color: tokens.primary, fontWeight: '600' }}>
                  Chạm để ghi
                </Text>
              </Text>
            </View>
            <ChevronRight size={14} color={tokens.textMuted} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* 8. SHEET ĐÁY CHI TIẾT KHOẢNH KHẮC NGÀY */}
      {/* 9. MODAL ĐIỂM DANH STREAK */}
      <StreakCheckinModal
        visible={showStreakModal}
        streakDays={currentStreak}
        hasCheckedInToday={todayTransactions.length > 0}
        onClose={() => setShowStreakModal(false)}
        onPressAction={onOpenCamera}
      />

      {/* 10. TOAST PHÁO HOA CHÚC MỪNG ĐIỂM DANH */}
      <StreakCelebrationToast
        visible={showStreakCelebration}
        streakCount={currentStreak}
        onDismiss={() => setShowStreakCelebration(false)}
      />

      <DayDetailBottomSheet
        visible={isDaySheetOpen}
        dateStr={selectedDayCell?.dateStr || ''}
        transactions={selectedDayTransactions}
        isPrivacyHidden={isPrivacyHidden}
        onClose={() => setIsDaySheetOpen(false)}
        onSelectTransaction={(tx) => {
          setIsDaySheetOpen(false);
          onOpenTransactionDetail?.(tx);
        }}
        onTakePhotoForDay={onOpenCamera || (() => {})}
      />

      {/* 9. SHEET CÀI ĐẶT NHANH (MỞ TỪ HEADER) */}
      <QuickSettingsSheet
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenProfile={onOpenProfile || (() => {})}
      />

      {/* 10. MODAL HỘP XÁC NHẬN */}
      <ConfirmationInboxModal
        visible={isInboxOpen}
        onClose={() => setIsInboxOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    gap: 2,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  streakMiniBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.full,
  },
  streakMiniText: {
    fontSize: 12.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  headerBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  headerBalanceLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  headerBalanceAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  realtimeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  realtimeDateText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
    fontVariant: ['tabular-nums'],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerBtnBorderless: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  scrollContent: {
    gap: spacing.sm + 2,
    paddingTop: spacing.xs,
  },
  allowanceCard: {
    width: '100%',
    padding: spacing.md,
    gap: 6,
    position: 'relative',
    overflow: 'visible',
  },
  allowanceMascotWrapper: {
    position: 'absolute',
    top: -16,
    right: 14,
    zIndex: 10,
  },
  todayAllowanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  todayAllowanceCol: {
    flex: 1,
  },
  todaySubTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  todayAllowanceAmount: {
    fontSize: 26,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.4,
    marginTop: 2,
  },
  todaySpentBadgeCol: {
    alignItems: 'flex-end',
  },
  todaySpentValue: {
    fontSize: 19.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
    marginTop: 2,
  },
  progressBarWrapper: {
    marginVertical: 2,
  },
  overBudgetNotice: {
    fontSize: 13,
    fontWeight: '600',
  },
  allowanceBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  subStatLabel: {
    fontSize: 12.5,
  },
  cashflowBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingHorizontal: 0,
  },
  compactSegmentToggle: {
    flexDirection: 'row',
    borderRadius: radii.full,
    padding: 2,
  },
  compactSegmentBtn: {
    paddingVertical: 4,
    paddingHorizontal: 11,
    borderRadius: radii.full,
  },
  compactSegmentBtnActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactSegmentBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  cashflowBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cashflowPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.full,
  },
  pillBadgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  pillBadgeAmount: {
    fontSize: 15.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  todayMiniPillBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
    borderRadius: radii.full,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  todayMiniPillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  todayMiniPillText: {
    fontSize: 13,
    letterSpacing: -0.1,
  },
  filterChipScroll: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: 2,
    marginBottom: spacing.xs,
  },
  dayViewSection: {
    gap: spacing.xs + 2,
    paddingTop: spacing.xs,
  },
  daySectionHeader: {
    marginBottom: spacing.xs,
  },
  daySectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 4,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  txTypeIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.sm + 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
    gap: 2,
  },
  txDesc: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  txCategory: {
    fontSize: 12,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
});
