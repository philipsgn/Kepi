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
import { formatCompactVND, formatVND, maskMoney } from '../../utils/currency';
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
 * Tiêu đề dính đầu màn hình cho từng khối tháng trong Thống kê — Tinh gọn, thanh thoát
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
      {/* 1. HÀNG CHÍNH: THÁNG & SỐ TIỀN ĐÃ CHI */}
      <View style={styles.mainRow}>
        <Text style={[styles.monthTitle, { color: tokens.text }]}>{monthLabel}</Text>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={handleOpenDetail}
          style={styles.spentActionGroup}
        >
          <Text style={[styles.spentPrefix, { color: tokens.textMuted }]}>{Strings.stats.spentPrefix}</Text>
          {isMasked ? (
            <Text style={[styles.spentValueMasked, { color: tokens.text }]}>••••</Text>
          ) : (
            <RollingNumber
              value={totalSpent}
              format="compact"
              style={[styles.spentValue, { color: tokens.text }]}
            />
          )}
          <ChevronRight size={13} color={tokens.textMuted} strokeWidth={2.4} style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>

      {/* 2. DÒNG THÔNG SỐ PHỤ & TỶ LỆ SO SÁNH */}
      <View style={styles.subStatsRow}>
        <View style={styles.subStatsLeft}>
          <Text style={[styles.subStatText, { color: tokens.textMuted }]}>
            {Strings.stats.itemsCount(transactionCount)}
          </Text>
          <Text style={[styles.subStatDot, { color: tokens.textMuted }]}>·</Text>
          <Text style={[styles.subStatText, { color: tokens.textMuted }]}>
            {Strings.stats.incomePrefix}
            {maskMoney(formatCompactVND(totalIncome), isMasked)}
          </Text>
          {totalSaved > 0 && (
            <>
              <Text style={[styles.subStatDot, { color: tokens.textMuted }]}>·</Text>
              <Text style={[styles.subStatSaved, { color: tokens.success }]}>
                {Strings.stats.savedPrefix}
                {maskMoney(formatCompactVND(totalSaved), isMasked)}
              </Text>
            </>
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

      {/* 3. CHIP NHẮC KHOẢN CHƯA CÓ GIÁ (NẾU CÓ) */}
      {unpricedCount > 0 && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onUnpricedChipPress}
          style={[styles.unpricedWarningRow, { backgroundColor: tokens.warning + '18', borderColor: tokens.warning + '40' }]}
        >
          <AlertCircle size={12} color={tokens.warning} strokeWidth={2.2} />
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
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  spentActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  spentPrefix: {
    fontSize: 12,
    fontWeight: '600',
  },
  spentValue: {
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  spentValueMasked: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  subStatsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subStatText: {
    fontSize: 11,
    fontWeight: '500',
  },
  subStatSaved: {
    fontSize: 11,
    fontWeight: '600',
  },
  subStatDot: {
    marginHorizontal: 4,
    fontSize: 11,
  },
  diffBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  diffText: {
    fontSize: 10,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  unpricedWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  unpricedWarningText: {
    fontSize: 10.5,
    fontWeight: '600',
    marginLeft: 4,
  },
});
