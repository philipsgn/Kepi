import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Plus,
  Target,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Strings } from '../../constants/strings';
import {
  calculateMonthlyLockedSavings,
  calculateWaterfallGoals,
  formatMaskedCurrency,
  GoalItem,
  GoalWaterfallProgress,
} from '../../utils/profileUtils';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { ProgressBar } from '../common/ProgressBar';
import { FavoriteUnit, Transaction } from '../../types/database';

export interface GoalSectionCardProps {
  goalName?: string;
  goalTargetAmount?: number;
  savedMoney: number;
  goals?: GoalItem[];
  isMasked?: boolean;
  onPressCard: () => void;
  onPressAddGoal?: () => void;
  onPressEdit?: () => void;
  monthlyIncome?: number;
  monthlyFixedCosts?: number;
  savingsRatio?: number;
  baseDailyBudget?: number;
  todayBudget?: number;
  todaySpent?: number;
  transactions?: Transaction[];
  currentMonthKey?: string;
  currentMonthSpent?: number;
  favUnit?: FavoriteUnit;
  goalDeadline?: string | null;
  goalReason?: string | null;
}

/**
 * Rút gọn số tiền hiển thị (ví dụ 30.000.000 -> 30tr, 700.000 -> 700k)
 */
function formatCompactVND(amount: number): string {
  if (amount <= 0) return '0đ';
  if (amount >= 1000000000) {
    const ty = amount / 1000000000;
    return `${Number(ty.toFixed(1))} tỷ`;
  }
  if (amount >= 1000000) {
    const tr = amount / 1000000;
    return `${Number(tr.toFixed(1))}tr`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `${Number(k.toFixed(0))}k`;
  }
  return `${amount}đ`;
}

/**
 * Khối Mục Tiêu Của Bạn (GoalSectionCard) — Luôn Hiện Diện (Always Active)
 * - Tối giản & Tinh tế chuẩn Senior UI/UX Designer:
 *   + Luôn hiện diện đầy đủ, không bao giờ ẩn thành thẻ rỗng vì có Tích Lũy Tháng mặc định.
 *   + Sub-tiêu đề 1 (Mặc định ở trên): Mục tiêu tích lũy tháng (%) theo Cân bằng ngân sách.
 *   + Sub-tiêu đề 2 (Ở dưới): Mục tiêu dài hạn ưu tiên số 1 (Priority #1) theo phân bổ Waterfall.
 *   + Chạm thân thẻ: Mở Sheet Chi Tiết Mục Tiêu (GoalDetailModal).
 *   + Chạm '+ Thêm mục tiêu' hoặc icon [✏️]: Mở Sheet Nhập/Sửa Mục Tiêu (GoalEditModal).
 */
export const GoalSectionCard: React.FC<GoalSectionCardProps> = ({
  goalName = '',
  goalTargetAmount = 0,
  savedMoney = 0,
  goals = [],
  isMasked = false,
  onPressCard,
  onPressAddGoal,
  onPressEdit,
  monthlyIncome = 0,
  monthlyFixedCosts = 0,
  savingsRatio = 0.2,
  baseDailyBudget = 0,
  todayBudget = 0,
  todaySpent = 0,
  transactions = [],
  currentMonthKey,
  goalDeadline,
  goalReason,
}) => {
  const { tokens, isDark } = useTheme();

  // 1. Chuẩn hóa danh sách mục tiêu dài hạn (hỗ trợ cả goals array lẫn single goal fallback)
  const effectiveGoals = useMemo<GoalItem[]>(() => {
    if (goals && goals.length > 0) {
      return goals;
    }
    if (goalName && goalTargetAmount > 0) {
      return [
        {
          id: 'primary-goal',
          name: goalName,
          targetAmount: goalTargetAmount,
          deadline: goalDeadline,
          reason: goalReason,
          createdAt: new Date().toISOString(),
        },
      ];
    }
    return [];
  }, [goals, goalName, goalTargetAmount, goalDeadline, goalReason]);

  // 2. Tính toán phân bổ tiền tích lũy tuần tự (Waterfall Allocation)
  const waterfallGoals = useMemo<GoalWaterfallProgress[]>(() => {
    return calculateWaterfallGoals(effectiveGoals, savedMoney);
  }, [effectiveGoals, savedMoney]);

  const priorityGoal = waterfallGoals.length > 0 ? waterfallGoals[0] : null;
  const hasPriorityGoal = Boolean(priorityGoal && priorityGoal.goal.targetAmount > 0);

  // 3. Dòng tiền & Định mức tích lũy cam kết mỗi tháng (Nền tảng mặc định)
  const disposableIncome = Math.max(0, monthlyIncome - monthlyFixedCosts);
  const monthlySavingsGoal =
    disposableIncome > 0
      ? Math.round((disposableIncome * savingsRatio) / 100000) * 100000
      : 0;

  // 4. Tiến độ tích lũy tháng theo cơ chế khóa hạn mức ngày (Daily Allowance Lock-in)
  const monthlyLocked = useMemo(() => {
    const effectiveDaily =
      baseDailyBudget > 0
        ? baseDailyBudget
        : disposableIncome > 0
        ? Math.max(20000, Math.round((disposableIncome * (1 - savingsRatio)) / 30 / 1000) * 1000)
        : 0;

    return calculateMonthlyLockedSavings({
      monthlySavingsGoal,
      dailyBudget: effectiveDaily,
      todayBudget: todayBudget > 0 ? todayBudget : effectiveDaily,
      todaySpent,
      transactions,
      currentMonthKey,
      additionalSavedMoney: 0,
    });
  }, [
    monthlySavingsGoal,
    baseDailyBudget,
    disposableIncome,
    savingsRatio,
    todayBudget,
    todaySpent,
    transactions,
    currentMonthKey,
  ]);

  const monthPercentage = monthlyLocked.percentage;
  const isMonthAchieved = monthlyLocked.isAchieved;
  const actualSavedThisMonth = monthlyLocked.actualSavedThisMonth;

  // Điều hướng chạm
  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressCard();
  };

  const handleAddPress = (e: any) => {
    e.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPressAddGoal) {
      onPressAddGoal();
    } else if (onPressEdit) {
      onPressEdit();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: tokens.surface, borderColor: tokens.border },
      ]}
      onPress={handleCardPress}
      activeOpacity={0.88}
      accessibilityLabel="Khối mục tiêu của bạn"
    >
      {/* HEADER: TIÊU ĐỀ KHỐI & NÚT THÊM MỤC TIÊU [+] */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.targetIconBox}>
            <Target size={19} color={tokens.primary} strokeWidth={2.4} />
          </View>
          <Text style={[styles.sectionTitle, { color: tokens.text }]}>
            {Strings.profile.goalSectionTitle}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addIconBtn}
          onPress={handleAddPress}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Thêm mục tiêu mới"
        >
          <Plus size={20} color={tokens.primary} strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <View style={styles.contentBody}>
        {/* ================= TIÊU ĐỀ DUY NHẤT: MỤC TIÊU TÍCH LŨY THÁNG ================= */}
        <View style={styles.subSection}>
          <View style={styles.subHeaderRow}>
            <Text style={[styles.subTitleText, { color: tokens.text }]} numberOfLines={1}>
              Mục tiêu tích lũy tháng
            </Text>

            <Text
              style={[
                styles.subValueText,
                { color: isMonthAchieved ? '#7E9F80' : tokens.primary },
              ]}
            >
              {isMasked
                ? '••••'
                : `${formatCompactVND(actualSavedThisMonth)} / ${formatCompactVND(monthlySavingsGoal)}`}{' '}
              <Text style={styles.percentHighlight}>({monthPercentage}%)</Text>
            </Text>
          </View>

          <View style={styles.progressBarWrapper}>
            <ProgressBar
              progress={monthPercentage / 100}
              height={8}
              customColor={isMonthAchieved ? '#7E9F80' : tokens.primary}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  addIconBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentBody: {
    gap: 14,
  },

  // ================= SUB SECTION =================
  subSection: {
    gap: 6,
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  subTitleText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
    flex: 1,
  },
  subValueText: {
    fontSize: 12.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  percentHighlight: {
    fontWeight: '800',
  },
  progressBarWrapper: {
    marginVertical: 1,
  },
});
