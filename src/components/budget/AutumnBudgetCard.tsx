import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CalendarDays, CloudFog, Leaf, ShieldCheck, Sun } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { formatVND } from '../../utils/currency';
import { useBudgetStore } from '../../store/budgetStore';
import { useTheme } from '../../theme/ThemeContext';

interface AutumnBudgetCardProps {
  onPressDetails?: () => void;
}

export const AutumnBudgetCard: React.FC<AutumnBudgetCardProps> = ({ onPressDetails }) => {
  const { tokens } = useTheme();
  const {
    todayBudget,
    todaySpent,
    realBalance,
    baseDailyBudget,
    savedMoney,
    goalName,
    weeklyBudget,
    weeklySpent,
  } = useBudgetStore();

  const remainingToday = todayBudget - todaySpent;
  const spentPercent = todayBudget > 0 ? Math.min(100, Math.max(0, Math.round((todaySpent / todayBudget) * 100))) : 0;

  const weeklyRemaining = Math.max(0, weeklyBudget - weeklySpent);
  const weeklySpentPercent = weeklyBudget > 0 ? Math.min(100, Math.max(0, Math.round((weeklySpent / weeklyBudget) * 100))) : 0;

  // Quyết định màu thanh tiến độ mùa thu & icon trạng thái đơn sắc
  let progressColor: string = Colors.comMint;
  let statusText = 'Thu Vàng Dịu Êm';
  let StatusIcon = Sun;
  let statusIconColor = '#8A5319';

  if (spentPercent > 95 || remainingToday < 0) {
    progressColor = Colors.warningCoral;
    statusText = 'Khói Chiều Co Kéo';
    StatusIcon = CloudFog;
    statusIconColor = Colors.warningCoral;
  } else if (spentPercent > 70) {
    progressColor = Colors.accentAutumn;
    statusText = 'Nắng Thu Nhẹ Bước';
    StatusIcon = Sun;
    statusIconColor = Colors.accentAutumn;
  }

  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPressDetails) {
      onPressDetails();
    }
  };

  const isRolloverDeficit = todayBudget < baseDailyBudget;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handleCardPress}
      style={[
        styles.cardContainer,
        {
          backgroundColor: tokens.surface,
          borderColor: tokens.border,
        },
      ]}
    >
      {/* Vệt trang trí giấy dó cổ điển */}
      <View style={[styles.topPatternLine, { backgroundColor: tokens.primary }]} />

      {/* Header trạng thái */}
      <View style={styles.headerRow}>
        <View style={styles.statusPill}>
          <StatusIcon size={12} strokeWidth={1.4} color={statusIconColor} style={{ marginRight: 5 }} />
          <Text style={styles.statusPillText}>{statusText}</Text>
        </View>
        <Text style={[styles.goalHint, { color: tokens.textMuted }]}>
          Mục tiêu: <Text style={[styles.goalNameBold, { color: tokens.text }]}>{goalName || 'Tiết kiệm thu đông'}</Text>
        </Text>
      </View>

      {/* Chỉ số chính: Hôm nay còn */}
      <View style={styles.mainMetricRow}>
        <View>
          <Text style={[styles.mainMetricLabel, { color: tokens.textMuted }]}>Hôm nay còn lại</Text>
          <Text
            style={[
              styles.mainMetricValue,
              { color: remainingToday >= 0 ? tokens.text : Colors.warningCoral },
            ]}
          >
            {formatVND(remainingToday)}
          </Text>
        </View>
        <View style={[styles.percentBadge, { backgroundColor: tokens.surfaceAlt }]}>
          <Text style={[styles.percentBadgeText, { color: progressColor }]}>
            {spentPercent}% đã tiêu
          </Text>
        </View>
      </View>

      {/* Thanh tiến độ mùa thu (Autumn Progress Bar) */}
      <View style={[styles.progressTrack, { backgroundColor: tokens.surfaceAlt }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${spentPercent}%`, backgroundColor: progressColor },
          ]}
        />
      </View>

      {/* Thanh chỉ số Ngân Sách Tuần (Weekly Sub-Bar) */}
      <View style={[styles.weeklyMetricRow, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
        <View style={styles.weeklyHeader}>
          <View style={styles.weeklyTitleGroup}>
            <CalendarDays size={12} color={tokens.primary} strokeWidth={2} />
            <Text style={[styles.weeklyLabel, { color: tokens.textMuted }]}>Tuần này còn:</Text>
            <Text style={[styles.weeklyValue, { color: tokens.text }]}>{formatVND(weeklyRemaining)}</Text>
          </View>
          <Text style={[styles.weeklyTotalHint, { color: tokens.textMuted }]}>
            Hạn mức: {formatVND(weeklyBudget)}
          </Text>
        </View>
        <View style={[styles.weeklyTrack, { backgroundColor: tokens.border }]}>
          <View
            style={[
              styles.weeklyFill,
              {
                width: `${weeklySpentPercent}%`,
                backgroundColor: weeklySpentPercent > 90 ? Colors.warningCoral : tokens.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* 3 Chỉ số phụ: Số dư thực, Mỗi ngày chuẩn, Tiền đã cứu */}
      <View style={[styles.subMetricsGrid, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
        <View style={styles.subMetricItem}>
          <Text style={[styles.subMetricLabel, { color: tokens.textMuted }]}>Số dư thực</Text>
          <Text style={[styles.subMetricValue, { color: tokens.text }]}>{formatVND(realBalance)}</Text>
        </View>

        <View style={[styles.subMetricDivider, { backgroundColor: tokens.border }]} />

        <View style={styles.subMetricItem}>
          <Text style={[styles.subMetricLabel, { color: tokens.textMuted }]}>Hôm nay khuyên dùng</Text>
          <Text style={[styles.subMetricValue, { color: tokens.text }]}>{formatVND(todayBudget)}</Text>
        </View>

        <View style={[styles.subMetricDivider, { backgroundColor: tokens.border }]} />

        <View style={styles.subMetricItem}>
          <View style={styles.savedLabelRow}>
            <Text style={[styles.subMetricLabel, { color: tokens.textMuted }]}>Tiền đã cứu</Text>
            <ShieldCheck size={11} strokeWidth={1.4} color="#3F7A46" style={{ marginLeft: 3 }} />
          </View>
          <Text style={[styles.subMetricValue, styles.savedValueHighlight]}>
            {formatVND(savedMoney)}
          </Text>
        </View>
      </View>

      {/* Dòng ghi chú thuật toán tái phân bổ động */}
      <View style={[styles.rolloverNoteRow, isRolloverDeficit && styles.rolloverDeficitRow]}>
        <Leaf
          size={12}
          strokeWidth={1.4}
          color={isRolloverDeficit ? Colors.warningCoral : '#4B6B4C'}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.rolloverNoteText, isRolloverDeficit && styles.rolloverDeficitText]}>
          Tự động cân bằng động: Chi hôm nay được tái phân bổ đều cho những ngày còn lại.
        </Text>
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#F7F3EB', // Giấy dó mộc Hà Nội
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E8DEC8',
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  topPatternLine: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 3,
    backgroundColor: Colors.accentAutumn,
    opacity: 0.35,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 152, 68, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(229, 152, 68, 0.25)',
  },
  statusPillText: {
    fontSize: 12,
    color: '#8A5319',
    fontWeight: '600',
  },
  goalHint: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  goalNameBold: {
    fontWeight: '700',
    color: Colors.textDark,
  },
  mainMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  mainMetricLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  mainMetricValue: {
    fontSize: 28,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  percentBadge: {
    backgroundColor: '#ECE3D4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  percentBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E5DAC6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  weeklyMetricRow: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  weeklyTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  weeklyLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  weeklyValue: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  weeklyTotalHint: {
    fontSize: 10,
    fontVariant: ['tabular-nums'],
  },
  weeklyTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  weeklyFill: {
    height: '100%',
    borderRadius: 2,
  },
  subMetricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EFE6D8',
    marginBottom: 12,
  },
  subMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  subMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0D4C0',
  },
  subMetricLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  savedLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkleIcon: {
    fontSize: 10,
  },
  subMetricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    fontVariant: ['tabular-nums'],
  },
  savedValueHighlight: {
    color: '#3F7A46', // Cốm đậm đà kiêu hãnh
  },
  rolloverNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(126, 159, 128, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rolloverDeficitRow: {
    backgroundColor: 'rgba(200, 109, 81, 0.1)',
  },
  rolloverNoteText: {
    fontSize: 11,
    color: '#4B6B4C',
    fontWeight: '500',
    flex: 1,
  },
  rolloverDeficitText: {
    color: Colors.warningCoral,
  },
});
