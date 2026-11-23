import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit3,
  Plus,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { ProgressBar } from '../common/ProgressBar';
import { SegmentBar10 } from '../neo/SegmentBar10';
import {
  calculateWaterfallGoals,
  formatMaskedCurrency,
  GoalItem,
  GoalWaterfallProgress,
} from '../../utils/profileUtils';

export interface GoalDetailModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenEdit: (goal?: GoalItem) => void;
  onAddNewGoal?: () => void;
  onDeleteGoal?: (goalId: string) => void;
  goals?: GoalItem[];
  goalName?: string;
  goalTargetAmount?: number;
  savedMoney: number;
  monthlySavingsGoal: number;
  monthsRemaining?: number | null;
  actualSavedThisMonth: number;
  goalDeadline?: string | null;
  goalReason?: string | null;
  isMasked?: boolean;
}

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
 * Bottom Sheet Chi Tiết Mục Tiêu (GoalDetailModal)
 * - Mở khi chạm vào thân thẻ "Mục tiêu của bạn"
 * - Hiển thị chi tiết:
 *   + Nền tảng: Mục tiêu tích lũy tháng (%) theo Cân bằng ngân sách
 *   + Danh sách mục tiêu dài hạn (Waterfall Allocation) với Ngày có thể đạt (Runway ETA) riêng
 *   + Nút thêm mục tiêu dài hạn mới [+ Thêm mục tiêu dài hạn]
 */
export const GoalDetailModal: React.FC<GoalDetailModalProps> = ({
  visible,
  onClose,
  onOpenEdit,
  onAddNewGoal,
  onDeleteGoal,
  goals = [],
  goalName = '',
  goalTargetAmount = 0,
  savedMoney,
  monthlySavingsGoal,
  actualSavedThisMonth,
  goalDeadline,
  goalReason,
  isMasked = false,
}) => {
  const { tokens, isDark, mode } = useTheme();
  const isPink = mode === 'pink';
  const isHeocon = true; // Cả Heo Con và Pastel Pink đều chuẩn Neo-Brutalist Pixel Art 100%
  const cardBg = isPink ? '#FFFFFF' : '#FFFBF1';
  const cardBorder = isPink ? '#3B0713' : '#2B2118';
  const inkText = isPink ? '#3B0713' : '#2B2118';
  const inkMuted = isPink ? '#834758' : '#6E5D4F';
  const pageBg = isPink ? '#FFF5F7' : '#F6EEDC';
  const chipBg = isPink ? '#FCE7F3' : '#FFF4CC';
  const accentBtn = isPink ? '#F43F5E' : '#F4B93B';

  // 1. Chuẩn hóa danh sách mục tiêu
  const effectiveGoals = React.useMemo<GoalItem[]>(() => {
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

  // 2. Tính toán phân bổ Waterfall
  const waterfallGoals = React.useMemo<GoalWaterfallProgress[]>(() => {
    return calculateWaterfallGoals(effectiveGoals, savedMoney);
  }, [effectiveGoals, savedMoney]);

  // 3. Tiến độ tích lũy tháng
  const monthPercentage =
    monthlySavingsGoal > 0
      ? Math.min(100, Math.max(0, Math.round((actualSavedThisMonth / monthlySavingsGoal) * 100)))
      : 100;
  const isMonthAchieved = monthlySavingsGoal > 0 && actualSavedThisMonth >= monthlySavingsGoal;

  // 4. Tính toán ngày đạt được (ETA) lũy kế cho từng mục tiêu trong chuỗi Waterfall
  const goalEtas = React.useMemo(() => {
    const now = new Date();
    let cumulativeRemaining = 0;

    return waterfallGoals.map((item) => {
      if (item.isAchieved) {
        return 'Đã hoàn thành 100% 🎉';
      }
      if (monthlySavingsGoal <= 0) {
        return 'Chưa thiết lập tích lũy tháng';
      }

      cumulativeRemaining += item.remainingAmount;
      const monthsNeeded = Math.ceil(cumulativeRemaining / monthlySavingsGoal);

      if (monthsNeeded === 0) {
        return 'Có thể đạt ngay trong tháng này!';
      }

      const targetDate = new Date(now.getFullYear(), now.getMonth() + monthsNeeded, 1);
      const m = targetDate.getMonth() + 1;
      const y = targetDate.getFullYear();
      return `Tháng ${m}/${y} (~${monthsNeeded} tháng)`;
    });
  }, [waterfallGoals, monthlySavingsGoal]);

  const handleEditGoal = (goalItem: GoalItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => {
      onOpenEdit(goalItem);
    }, 200);
  };

  const handleAddGoal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    setTimeout(() => {
      if (onAddNewGoal) {
        onAddNewGoal();
      } else {
        onOpenEdit();
      }
    }, 200);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalSheet,
            isHeocon
              ? {
                  backgroundColor: pageBg,
                  borderColor: cardBorder,
                  borderTopWidth: 3,
                  borderLeftWidth: 3,
                  borderRightWidth: 3,
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                }
              : { backgroundColor: tokens.surface, borderColor: tokens.border },
          ]}
        >
          {/* DRAG HANDLE */}
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handleBar,
                { backgroundColor: isHeocon ? '#2B2118' : tokens.border },
              ]}
            />
          </View>

          {/* HEADER */}
          <View
            style={[
              styles.headerRow,
              {
                borderBottomColor: isHeocon ? '#2B2118' : tokens.border,
                borderBottomWidth: isHeocon ? 2 : 1,
              },
            ]}
          >
            <View style={styles.headerTitleGroup}>
              <View
                style={[
                  styles.iconBox,
                  isHeocon && {
                    backgroundColor: '#F4B93B',
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: cardBorder,
                  },
                ]}
              >
                <Target size={18} color={isHeocon ? '#2B2118' : tokens.primary} strokeWidth={2.6} />
              </View>
              <Text
                style={[
                  styles.sheetTitle,
                  { color: inkText },
                  isHeocon && { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800', fontSize: 18 },
                ]}
              >
                Chi Tiết Kế Hoạch Mục Tiêu
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.closeBtn,
                isHeocon
                  ? {
                      backgroundColor: '#FFF4CC',
                      borderWidth: 2.5,
                      borderColor: cardBorder,
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                    }
                  : null,
              ]}
              onPress={onClose}
              activeOpacity={0.75}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={18} color={isHeocon ? '#2B2118' : tokens.textMuted} strokeWidth={2.6} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* ================= KHỐI 1: NỀN TẢNG TÍCH LŨY THÁNG ================= */}
            <View
              style={[
                styles.cardBox,
                isHeocon
                  ? {
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      borderWidth: 3,
                      borderRadius: 20,
                      shadowColor: cardBorder,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 4,
                    }
                  : { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
              ]}
            >
              <View style={styles.cardHeaderBetween}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={16} color={isHeocon ? '#2B2118' : tokens.primary} strokeWidth={2.6} />
                  <Text
                    style={[
                      styles.sectionCaption,
                      { color: inkMuted },
                      { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                    ]}
                  >
                    NỀN TẢNG: TÍCH LŨY THÁNG HIỆN TẠI
                  </Text>
                </View>
                <Text
                  style={[
                    styles.percentBadge,
                    { color: isMonthAchieved ? (isHeocon ? '#2D7A4D' : '#7E9F80') : (isHeocon ? '#B85E1A' : tokens.primary) },
                    { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                  ]}
                >
                  {monthPercentage}%
                </Text>
              </View>

              <View style={styles.metricRow}>
                <Text
                  style={[
                    styles.metricMainAmount,
                    { color: inkText },
                    { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                  ]}
                >
                  {isMasked ? '••••' : formatCompactVND(actualSavedThisMonth)}
                  <Text
                    style={[
                      styles.metricTargetAmount,
                      { color: inkMuted },
                      { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                    ]}
                  >
                    {' '}/ {isMasked ? '••••' : formatCompactVND(monthlySavingsGoal)}
                  </Text>
                </Text>

                {isMonthAchieved ? (
                  <View
                    style={[
                      styles.achievedBadge,
                      isHeocon && {
                        backgroundColor: '#E8F5E9',
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: cardBorder,
                      },
                    ]}
                  >
                    <CheckCircle2 size={12} color={isHeocon ? '#2D7A4D' : '#7E9F80'} strokeWidth={2.4} />
                    <Text
                      style={[
                        styles.achievedText,
                        { color: isHeocon ? '#2D7A4D' : '#7E9F80' },
                        { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                      ]}
                    >
                      Đã đạt
                    </Text>
                  </View>
                ) : null}
              </View>

              {isHeocon ? (
                <SegmentBar10
                  spent={actualSavedThisMonth}
                  limit={monthlySavingsGoal}
                  style={{ marginVertical: 4 }}
                />
              ) : (
                <View style={styles.progressBarWrapper}>
                  <ProgressBar
                    progress={monthPercentage / 100}
                    height={8}
                    customColor={isMonthAchieved ? '#7E9F80' : tokens.primary}
                  />
                </View>
              )}

              <Text
                style={[
                  styles.cardNoteText,
                  { color: inkMuted },
                  { fontFamily: 'Nunito', fontWeight: '600' },
                ]}
              >
                Chốt theo cơ chế bảo toàn hạn mức ngày từ Cân bằng ngân sách. Đây là động cơ tạo tiền để nuôi các mục tiêu dài hạn.
              </Text>
            </View>

            {/* ================= KHỐI 2: DANH SÁCH MỤC TIÊU DÀI HẠN (WATERFALL) ================= */}
            <View style={styles.sectionHeaderRow}>
              <Text
                style={[
                  styles.sectionHeaderText,
                  { color: inkMuted },
                  { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                ]}
              >
                Mục tiêu dài hạn ({waterfallGoals.length})
              </Text>

              <TouchableOpacity
                style={[
                  styles.addSmallBtn,
                  isHeocon
                    ? {
                        backgroundColor: '#F4B93B',
                        borderWidth: 2,
                        borderColor: cardBorder,
                        shadowColor: cardBorder,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                        elevation: 2,
                      }
                    : { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
                ]}
                onPress={handleAddGoal}
                activeOpacity={0.8}
              >
                <Plus size={13} color={isHeocon ? '#2B2118' : tokens.primary} strokeWidth={2.6} />
                <Text
                  style={[
                    styles.addSmallBtnText,
                    isHeocon ? { color: '#2B2118', fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' } : { color: tokens.primary },
                  ]}
                >
                  Thêm
                </Text>
              </TouchableOpacity>
            </View>

            {waterfallGoals.length > 0 ? (
              waterfallGoals.map((item, index) => {
                const etaText = goalEtas[index];
                const cleanReason = item.goal.reason?.trim();
                const cleanDeadline = item.goal.deadline?.trim();

                return (
                  <View
                    key={item.goal.id || `goal-${index}`}
                    style={[
                      styles.goalCardItem,
                      isHeocon
                        ? {
                            backgroundColor: cardBg,
                            borderColor: cardBorder,
                            borderWidth: 3,
                            borderRadius: 20,
                            shadowColor: cardBorder,
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 1,
                            shadowRadius: 0,
                            elevation: 4,
                          }
                        : { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
                    ]}
                  >
                    {/* HÀNG TIÊU ĐỀ MỤC TIÊU & HÀNH ĐỘNG SỬA/XÓA */}
                    <View style={styles.goalItemHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View
                            style={[
                              styles.rankBadge,
                              isHeocon
                                ? {
                                    backgroundColor: '#F4B93B',
                                    borderWidth: 1.5,
                                    borderColor: cardBorder,
                                  }
                                : { backgroundColor: isDark ? 'rgba(229, 152, 68, 0.2)' : 'rgba(229, 152, 68, 0.12)' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.rankText,
                                { color: inkText },
                                { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                              ]}
                            >
                              #{index + 1}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.goalTitleLarge,
                              { color: inkText },
                              { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                            ]}
                            numberOfLines={1}
                          >
                            {item.goal.name}
                          </Text>
                        </View>
                        {cleanReason ? (
                          <Text
                            style={[
                              styles.goalReasonQuote,
                              { color: isHeocon ? '#6E5D4F' : tokens.textSub },
                              { fontFamily: 'Nunito', fontWeight: '600' },
                            ]}
                            numberOfLines={2}
                          >
                            “{cleanReason}”
                          </Text>
                        ) : null}
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <TouchableOpacity
                          style={[
                            styles.miniActionBtn,
                            isHeocon
                              ? {
                                  backgroundColor: '#FFF4CC',
                                  borderWidth: 2,
                                  borderColor: cardBorder,
                                }
                              : { borderColor: tokens.border },
                          ]}
                          onPress={() => handleEditGoal(item.goal)}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          accessibilityLabel="Chỉnh sửa mục tiêu này"
                        >
                          <Edit3 size={13} color={isHeocon ? '#2B2118' : tokens.textSub} />
                        </TouchableOpacity>

                        {onDeleteGoal && waterfallGoals.length > 1 && (
                          <TouchableOpacity
                            style={[
                              styles.miniActionBtn,
                              isHeocon
                                ? {
                                    backgroundColor: '#FEE2E2',
                                    borderWidth: 2,
                                    borderColor: cardBorder,
                                  }
                                : { borderColor: tokens.border },
                            ]}
                            onPress={() => {
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                              onDeleteGoal(item.goal.id);
                            }}
                            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                            accessibilityLabel="Xóa mục tiêu này"
                          >
                            <Trash2 size={13} color={tokens.danger} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* TIẾN ĐỘ WATERFALL */}
                    <View style={styles.waterfallProgressRow}>
                      <Text
                        style={[
                          styles.waterfallAmountText,
                          { color: inkText },
                          { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                        ]}
                      >
                        {formatMaskedCurrency(item.allocatedSavedMoney, isMasked, false)} /{' '}
                        {formatMaskedCurrency(item.goal.targetAmount, isMasked, false)}
                      </Text>
                      <Text
                        style={[
                          styles.waterfallPercentText,
                          { color: item.isAchieved ? (isHeocon ? '#2D7A4D' : tokens.success) : (isHeocon ? '#2B2118' : tokens.primary) },
                          { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                        ]}
                      >
                        {item.percentage}%
                      </Text>
                    </View>

                    {isHeocon ? (
                      <SegmentBar10
                        spent={item.allocatedSavedMoney}
                        limit={item.goal.targetAmount}
                        style={{ marginVertical: 4 }}
                      />
                    ) : (
                      <View style={styles.progressBarWrapper}>
                        <ProgressBar
                          progress={item.percentage / 100}
                          height={8}
                          customColor={item.isAchieved ? tokens.success : tokens.primary}
                        />
                      </View>
                    )}

                    {/* DÒNG NGÀY CÓ THỂ ĐẠT (ESTIMATED RUNWAY ETA) */}
                    <View
                      style={[
                        styles.etaBar,
                        isHeocon
                          ? {
                              backgroundColor: '#FFF4CC',
                              borderWidth: 2,
                              borderColor: cardBorder,
                              borderRadius: 12,
                            }
                          : {
                              backgroundColor: isDark
                                ? 'rgba(229, 152, 68, 0.08)'
                                : 'rgba(229, 152, 68, 0.06)',
                              borderColor: isDark
                                ? 'rgba(229, 152, 68, 0.2)'
                                : 'rgba(229, 152, 68, 0.15)',
                            },
                      ]}
                    >
                      <Clock size={12} color={isHeocon ? '#2B2118' : tokens.primary} strokeWidth={2.4} />
                      <Text
                        style={[
                          styles.etaLabel,
                          { color: inkMuted },
                          { fontFamily: 'Nunito', fontWeight: '700' },
                        ]}
                      >
                        Ngày có thể đạt:{' '}
                        <Text
                          style={[
                            { color: inkText, fontWeight: '700' },
                            { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                          ]}
                        >
                          {etaText}
                        </Text>
                      </Text>
                    </View>

                    {cleanDeadline ? (
                      <View style={styles.deadlineRow}>
                        <Calendar size={11} color={isHeocon ? '#6E5D4F' : tokens.textMuted} />
                        <Text
                          style={[
                            styles.deadlineText,
                            { color: inkMuted },
                            { fontFamily: 'Nunito', fontWeight: '600' },
                          ]}
                        >
                          Hạn chót mong muốn: {cleanDeadline}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })
            ) : (
              <View
                style={[
                  styles.emptyGoalsBox,
                  isHeocon
                    ? {
                        backgroundColor: cardBg,
                        borderColor: cardBorder,
                        borderWidth: 2.5,
                        borderRadius: 20,
                      }
                    : { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
                ]}
              >
                <Sparkles size={20} color={isHeocon ? '#2B2118' : tokens.primary} />
                <Text
                  style={[
                    styles.emptyGoalsTitle,
                    { color: inkText },
                    { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                  ]}
                >
                  Chưa có mục tiêu dài hạn nào
                </Text>
                <Text
                  style={[
                    styles.emptyGoalsSub,
                    { color: inkMuted },
                    { fontFamily: 'Nunito', fontWeight: '600' },
                  ]}
                >
                  Hãy đặt mục tiêu lớn như Xe, Laptop, Quỹ dự phòng để Kepi tự động tính ngày về đích cho bạn.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.addFirstGoalBtn,
                    isHeocon
                      ? {
                          backgroundColor: '#F4B93B',
                          borderWidth: 3,
                          borderColor: cardBorder,
                          borderRadius: 22,
                          shadowColor: cardBorder,
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 1,
                          shadowRadius: 0,
                          elevation: 4,
                        }
                      : { backgroundColor: tokens.primary },
                  ]}
                  onPress={handleAddGoal}
                  activeOpacity={0.85}
                >
                  <Plus size={14} color={isHeocon ? '#2B2118' : '#0E1620'} strokeWidth={2.8} />
                  <Text
                    style={[
                      styles.addFirstGoalBtnText,
                      isHeocon && { color: '#2B2118', fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                    ]}
                  >
                    + Thêm mục tiêu dài hạn
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* ACTIONS FOOTER */}
          <View
            style={[
              styles.footerRow,
              isHeocon
                ? {
                    backgroundColor: pageBg,
                    borderTopWidth: 2,
                    borderTopColor: cardBorder,
                  }
                : { borderTopColor: tokens.border },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.closeFooterBtn,
                isHeocon
                  ? {
                      backgroundColor: cardBg,
                      borderWidth: 2.5,
                      borderColor: cardBorder,
                      shadowColor: cardBorder,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }
                  : { borderColor: tokens.border },
              ]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.closeFooterBtnText,
                  { color: inkMuted },
                  { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                ]}
              >
                Đóng
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addFooterBtn,
                isHeocon
                  ? {
                      backgroundColor: '#F4B93B',
                      borderWidth: 3,
                      borderColor: cardBorder,
                      borderRadius: 22,
                      shadowColor: cardBorder,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 4,
                    }
                  : { backgroundColor: tokens.primary },
              ]}
              onPress={handleAddGoal}
              activeOpacity={0.85}
            >
              <Plus size={15} color={isHeocon ? '#2B2118' : '#0E1620'} strokeWidth={2.8} />
              <Text
                style={[
                  styles.addFooterBtnText,
                  isHeocon && { color: '#2B2118', fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                ]}
              >
                + Thêm mục tiêu khác
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 24,
    height: 24,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },

  // ================= BOX CHUNG =================
  cardBox: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  cardHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionCaption: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  percentBadge: {
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  metricMainAmount: {
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  metricTargetAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  achievedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  achievedText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarWrapper: {
    marginVertical: 2,
  },
  cardNoteText: {
    fontSize: 11.5,
    lineHeight: 16,
  },

  // ================= SECTION HEADER =================
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  addSmallBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },

  // ================= GOAL ITEM CARD =================
  goalCardItem: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  goalItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  rankBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '800',
  },
  goalTitleLarge: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
  },
  goalReasonQuote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 16,
  },
  miniActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterfallProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  waterfallAmountText: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  waterfallPercentText: {
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  etaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: 2,
  },
  etaLabel: {
    fontSize: 11.5,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 2,
  },
  deadlineText: {
    fontSize: 11,
  },

  // ================= EMPTY STATE =================
  emptyGoalsBox: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyGoalsTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyGoalsSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 280,
  },
  addFirstGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
    marginTop: 6,
  },
  addFirstGoalBtnText: {
    color: '#0E1620',
    fontSize: 13,
    fontWeight: '800',
  },

  // ================= FOOTER =================
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  closeFooterBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeFooterBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  addFooterBtn: {
    flex: 2,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addFooterBtnText: {
    color: '#0E1620',
    fontSize: 14,
    fontWeight: '800',
  },
});
