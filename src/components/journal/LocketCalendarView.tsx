import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { CalendarDaySummary, Transaction } from '../../types/database';
import { formatVND } from '../../utils/currency';

interface LocketCalendarViewProps {
  year: number;
  month: number; // 1-12
  summaries: CalendarDaySummary[];
  selectedDate: string;
  dayTransactions: Transaction[];
  onSelectDate: (dateStr: string) => void;
  onChangeMonth: (year: number, month: number) => void;
}

const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const LocketCalendarView: React.FC<LocketCalendarViewProps> = ({
  year,
  month,
  summaries,
  selectedDate,
  dayTransactions,
  onSelectDate,
  onChangeMonth,
}) => {
  // Tính thứ của ngày đầu tiên trong tháng (0: Chủ Nhật, 1: Thứ 2, ..., 6: Thứ 7)
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  // Chuyển về index từ 0 (T2) đến 6 (CN)
  const leadingBlanks = (firstDayOfWeek + 6) % 7;

  const handlePrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (month === 1) {
      onChangeMonth(year - 1, 12);
    } else {
      onChangeMonth(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (month === 12) {
      onChangeMonth(year + 1, 1);
    } else {
      onChangeMonth(year, month + 1);
    }
  };

  const handleDayPress = (dateStr: string) => {
    Haptics.selectionAsync();
    onSelectDate(dateStr);
  };

  // Tính tổng chi tiêu ngày được chọn
  const selectedDayTotalSpent = dayTransactions.reduce(
    (acc, cur) => (cur.type === 'EXPENSE' ? acc + cur.amount : acc),
    0
  );
  const selectedDayTotalIncome = dayTransactions.reduce(
    (acc, cur) => (cur.type === 'INCOME' ? acc + cur.amount : acc),
    0
  );

  return (
    <View style={styles.container}>
      {/* Month Navigator Header */}
      <View style={styles.monthHeaderRow}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={styles.monthNavButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={18} strokeWidth={1.4} color={Colors.textDark} />
        </TouchableOpacity>

        <View style={styles.monthTitleContainer}>
          <Text style={styles.monthTitleText}>
            Tháng {month}, {year}
          </Text>
          <Text style={styles.monthSubtitle}>Nhật ký chi tiêu mùa thu</Text>
        </View>

        <TouchableOpacity
          onPress={handleNextMonth}
          style={styles.monthNavButton}
          activeOpacity={0.7}
        >
          <ChevronRight size={18} strokeWidth={1.4} color={Colors.textDark} />
        </TouchableOpacity>
      </View>

      {/* Weekday labels */}
      <View style={styles.weekDaysRow}>
        {WEEK_DAYS.map((wd, index) => (
          <View key={wd} style={styles.weekDayCell}>
            <Text
              style={[
                styles.weekDayText,
                index >= 5 && styles.weekEndText,
              ]}
            >
              {wd}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.gridContainer}>
        {/* Leading empty cells */}
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <View key={`blank-${i}`} style={styles.calendarCellPlaceholder} />
        ))}

        {/* Days of month */}
        {summaries.map((day) => {
          const isSelected = day.date === selectedDate;
          const hasPhoto = Boolean(day.thumbnailUrl);

          return (
            <TouchableOpacity
              key={day.date}
              activeOpacity={0.8}
              onPress={() => handleDayPress(day.date)}
              style={[
                styles.calendarCell,
                isSelected && styles.selectedCell,
                day.isToday && styles.todayCellHighlight,
              ]}
            >
              {hasPhoto ? (
                <View style={styles.cellPhotoContainer}>
                  <Image
                    source={{ uri: day.thumbnailUrl! }}
                    style={styles.cellImage}
                    resizeMode="cover"
                  />
                  {/* Overlay mờ nhẹ trên ảnh */}
                  <View style={styles.photoOverlay} />

                  {/* Day number on photo */}
                  <View style={styles.photoDayBadge}>
                    <Text style={styles.photoDayNumber}>{day.dayNumber}</Text>
                  </View>

                  {/* Multiple items count badge (+1, +2...) */}
                  {day.itemCount > 1 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>
                        +{day.itemCount - 1}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.emptyCellContent}>
                  <Text
                    style={[
                      styles.plainDayNumber,
                      day.isToday && styles.todayNumber,
                      isSelected && styles.selectedDayNumber,
                    ]}
                  >
                    {day.dayNumber}
                  </Text>
                  {day.isToday && <View style={styles.todayDot} />}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Day Transactions Drawer/List */}
      <View style={styles.dayDetailsSection}>
        <View style={styles.dayDetailsHeader}>
          <View>
            <Text style={styles.dayDetailsDateText}>
              Chi tiết ngày {selectedDate.split('-')[2]}/{month}/{year}
            </Text>
            <Text style={styles.dayDetailsSummaryText}>
              {dayTransactions.length === 0
                ? 'Không có giao dịch nào trong ngày này'
                : `${dayTransactions.length} giao dịch • Chi: ${formatVND(selectedDayTotalSpent)}${
                    selectedDayTotalIncome > 0
                      ? ` • Thu: +${formatVND(selectedDayTotalIncome)}`
                      : ''
                  }`}
            </Text>
          </View>
        </View>

        {dayTransactions.length > 0 && (
          <View style={styles.transactionsList}>
            {dayTransactions.map((tx) => (
              <View key={tx.id} style={styles.txRowCard}>
                {tx.photo_url ? (
                  <Image source={{ uri: tx.photo_url }} style={styles.txThumb} />
                ) : (
                  <View style={styles.txThumbPlaceholder}>
                    {tx.type === 'INCOME' ? (
                      <ArrowDownLeft size={16} strokeWidth={1.4} color={Colors.comMint} />
                    ) : (
                      <ArrowUpRight size={16} strokeWidth={1.4} color={Colors.warningCoral} />
                    )}
                  </View>
                )}

                <View style={styles.txInfoCol}>
                  <Text style={styles.txDesc} numberOfLines={1}>
                    {tx.description || tx.category}
                  </Text>
                  <Text style={styles.txMeta}>
                    {tx.category} • {tx.payment_method === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.txAmount,
                    {
                      color:
                        tx.type === 'INCOME'
                          ? Colors.comMint
                          : Colors.warningCoral,
                    },
                  ]}
                >
                  {tx.type === 'INCOME' ? '+' : '-'}
                  {formatVND(tx.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  monthNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFE6D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavArrow: {
    fontSize: 22,
    color: Colors.textDark,
    fontWeight: '600',
    marginTop: -2,
  },
  monthTitleContainer: {
    alignItems: 'center',
  },
  monthTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.3,
  },
  monthSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  weekEndText: {
    color: Colors.accentAutumn,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCellPlaceholder: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 3,
  },
  calendarCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 3,
  },
  selectedCell: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.accentAutumn,
  },
  todayCellHighlight: {
    // Có thể viền mờ nhẹ
  },
  cellPhotoContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#DDD2C0',
  },
  cellImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  photoDayBadge: {
    position: 'absolute',
    top: 3,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  photoDayNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  countBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: Colors.accentAutumn,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  countBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emptyCellContent: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ECE4D4',
  },
  plainDayNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    fontVariant: ['tabular-nums'],
  },
  todayNumber: {
    color: Colors.comMint,
    fontWeight: '800',
  },
  selectedDayNumber: {
    color: Colors.accentAutumn,
    fontWeight: '800',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.comMint,
    marginTop: 2,
  },
  dayDetailsSection: {
    marginTop: 16,
    backgroundColor: '#F5EFE4',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7DCCB',
    marginBottom: 24,
  },
  dayDetailsHeader: {
    marginBottom: 10,
  },
  dayDetailsDateText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  dayDetailsSummaryText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  transactionsList: {
    marginTop: 6,
    gap: 8,
  },
  txRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ECE2D2',
  },
  txThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 10,
  },
  txThumbPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E6DCC8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  txThumbIcon: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  txInfoCol: {
    flex: 1,
  },
  txDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
  },
  txMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginLeft: 8,
  },
});
