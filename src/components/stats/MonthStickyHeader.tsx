import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { AlertCircle, ChevronRight } from 'lucide-react-native';
import { Strings } from '../../constants/strings';
import { MonthSummary } from '../../utils/statsUtils';
import { formatVND, maskMoney } from '../../utils/currency';
import { RollingNumber } from '../common/RollingNumber';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

interface MonthStickyHeaderProps {
  summary: MonthSummary;
  isMasked: boolean;
  onOpenDetail: () => void;
  onUnpricedChipPress?: () => void;
}

/**
 * Tiêu đề dính đầu màn hình cho từng khối tháng trong Thống kê — Phong cách "Ấm, tĩnh, sang"
 * Tuân thủ mục 2.4 của đặc tả docs/screens/STATS.md:
 * - Tên tháng + năm; tháng hiện tại có nhãn "Đang diễn ra"
 * - Số tiền Đã chi to rõ, dùng hiệu ứng RollingNumber
 * - Dòng phụ: số khoản, Thu, Đã giữ lại
 * - So với tháng trước: ▲ / ▼ % màu trung tính
 * - Chip cảnh báo "N chưa có giá" nếu có khoản thiếu giá
 * - Chạm mở màn "Chi tiết tháng"
 */
export const MonthStickyHeader: React.FC<MonthStickyHeaderProps> = ({
  summary,
  isMasked,
  onOpenDetail,
  onUnpricedChipPress,
}) => {
  const { tokens } = useTheme();
  const {
    monthLabel,
    isCurrentMonth,
    totalSpent,
    totalIncome,
    totalSaved,
    transactionCount,
    unpricedCount,
    previousMonthDiffPercent,
  } = summary;

  const handleOpenDetail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenDetail();
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg, borderBottomColor: tokens.border }]}>
      {/* 1. HÀNG TIÊU ĐỀ THÁNG & NÚT CHI TIẾT */}
      <View style={styles.topRow}>
        <View style={styles.titleWithBadge}>
          <Text style={[styles.monthTitle, { color: tokens.text }]}>{monthLabel}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleOpenDetail}
          style={[styles.detailButton, { backgroundColor: tokens.primary }]}
        >
          <Text style={styles.detailButtonText}>{Strings.stats.detailBtn}</Text>
          <ChevronRight size={13} color="#1B2733" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* 2. SỐ TIỀN ĐÃ CHI & TỶ LỆ SO SÁNH */}
      <View style={styles.amountRow}>
        <View style={styles.spentAmountBox}>
          <Text style={[styles.spentPrefix, { color: tokens.textMuted }]}>{Strings.stats.spentPrefix}</Text>
          {isMasked ? (
            <Text style={[styles.spentValueMasked, { color: tokens.text }]}>••••</Text>
          ) : (
            <RollingNumber
              value={totalSpent}
              format="full"
              style={[styles.spentValue, { color: tokens.text }]}
            />
          )}
        </View>

        {previousMonthDiffPercent !== undefined && (
          <View style={[styles.diffBadge, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
            <Text style={[styles.diffText, { color: tokens.textSub }]}>
              {previousMonthDiffPercent >= 0
                ? `▲ ${previousMonthDiffPercent}%`
                : `▼ ${Math.abs(previousMonthDiffPercent)}%`}
            </Text>
          </View>
        )}
      </View>

      {/* 3. DÒNG THÔNG SỐ PHỤ */}
      <View style={styles.subStatsRow}>
        <Text style={[styles.subStatText, { color: tokens.textMuted }]}>
          {Strings.stats.itemsCount(transactionCount)}
        </Text>
        <Text style={[styles.subStatDot, { color: tokens.textMuted }]}>·</Text>
        <Text style={[styles.subStatText, { color: tokens.textMuted }]}>
          {Strings.stats.incomePrefix}
          {maskMoney(formatVND(totalIncome), isMasked)}
        </Text>
        <Text style={[styles.subStatDot, { color: tokens.textMuted }]}>·</Text>
        <Text style={[styles.subStatSaved, { color: tokens.success }]}>
          {Strings.stats.savedPrefix}
          {maskMoney(formatVND(totalSaved), isMasked)}
        </Text>
      </View>

      {/* 4. CHIP NHẮC KHOẢN CHƯA CÓ GIÁ (NẾU CÓ) */}
      {unpricedCount > 0 && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onUnpricedChipPress}
          style={[styles.unpricedWarningRow, { backgroundColor: tokens.warning + '18', borderColor: tokens.warning + '40' }]}
        >
          <AlertCircle size={13} color={tokens.warning} strokeWidth={2.2} />
          <Text style={[styles.unpricedWarningText, { color: tokens.warning }]}>
            {Strings.stats.unpricedChip(unpricedCount)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    marginBottom: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  ongoingBadge: {
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  ongoingText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    gap: 2,
  },
  detailButtonText: {
    color: '#1B2733',
    fontSize: 11.5,
    fontWeight: '700',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  spentAmountBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  spentPrefix: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 5,
  },
  spentValue: {
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  spentValueMasked: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  subStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  subStatText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  subStatSaved: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  subStatDot: {
    marginHorizontal: 5,
    fontSize: 12,
  },
  unpricedWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  unpricedWarningText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
});
