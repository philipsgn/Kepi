import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { DayCalendarCell, generateMonthGrid } from '../../utils/calendarUtils';
import { Transaction } from '../../types/database';
import { NeoCard } from '../neo/NeoCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

interface CompactMonthGridProps {
  transactions: Transaction[];
  onSelectDay: (cell: DayCalendarCell) => void;
  onOpenCamera?: () => void;
}

export const CompactMonthGrid: React.FC<CompactMonthGridProps> = ({
  transactions,
  onSelectDay,
}) => {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);

  const handlePrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const cells = useMemo(() => {
    return generateMonthGrid(currentYear, currentMonth, transactions);
  }, [currentYear, currentMonth, transactions]);

  return (
    <NeoCard radius={20} depth={3} style={styles.card}>
      {/* 1. Header Điều hướng Tháng */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Calendar size={15} color="#2B2118" strokeWidth={2.4} />
          <Text style={styles.monthTitleText}>
            Tháng {currentMonth}, {currentYear}
          </Text>
        </View>

        <View style={styles.navArrows}>
          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={handlePrevMonth}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <ChevronLeft size={16} color="#2B2118" strokeWidth={2.6} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.arrowBtn}
            onPress={handleNextMonth}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <ChevronRight size={16} color="#2B2118" strokeWidth={2.6} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Hàng Thứ (T2 -> CN) */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((wd) => (
          <View key={wd} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{wd}</Text>
          </View>
        ))}
      </View>

      {/* 3. Lưới các ô ngày (7 cột) */}
      <View style={styles.gridContainer}>
        {cells.map((cell, idx) => {
          const hasPhoto = Boolean(cell.photoThumbnails && cell.photoThumbnails.length > 0);
          const hasSpend = cell.itemCount > 0;

          return (
            <TouchableOpacity
              key={`${cell.dateStr}-${idx}`}
              style={[
                styles.dayCell,
                !cell.isCurrentMonth && styles.dayCellOutside,
                cell.isToday && styles.dayCellToday,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelectDay(cell);
              }}
              activeOpacity={0.75}
            >
              {hasPhoto ? (
                <View style={styles.photoThumbWrapper}>
                  <Image
                    source={{ uri: cell.photoThumbnails[0] }}
                    style={styles.photoThumb}
                    contentFit="cover"
                  />
                  <View style={styles.photoOverlayBadge}>
                    <Text style={styles.dayNumInPhoto}>{cell.dayNumber}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.dayNumWrapper}>
                  <Text
                    style={[
                      styles.dayNumText,
                      cell.isToday && styles.dayNumTextToday,
                      !cell.isCurrentMonth && styles.dayNumTextOutside,
                    ]}
                  >
                    {cell.dayNumber}
                  </Text>
                  {hasSpend && <View style={styles.spendDot} />}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </NeoCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 12,
    backgroundColor: '#FFFBF1',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthTitleText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 14,
    color: '#2B2118',
  },
  navArrows: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F6EEDC',
    borderWidth: 1.5,
    borderColor: '#2B2118',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(43, 33, 24, 0.12)',
    paddingBottom: 6,
    marginBottom: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    color: '#6E5D4F',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellOutside: {
    opacity: 0.35,
  },
  dayCellToday: {
    backgroundColor: 'rgba(244, 185, 59, 0.22)',
    borderWidth: 1.5,
    borderColor: '#F4B93B',
    borderRadius: 8,
  },
  dayNumWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#2B2118',
  },
  dayNumTextToday: {
    fontFamily: 'Nunito_800ExtraBold',
    color: '#2B2118',
  },
  dayNumTextOutside: {
    color: '#9E9484',
  },
  spendDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0452B',
    marginTop: 2,
  },
  photoThumbWrapper: {
    width: '92%',
    height: '92%',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#2B2118',
  },
  photoThumb: {
    width: '100%',
    height: '100%',
  },
  photoOverlayBadge: {
    position: 'absolute',
    top: 1,
    right: 1,
    backgroundColor: 'rgba(43, 33, 24, 0.65)',
    borderRadius: 3,
    paddingHorizontal: 2,
  },
  dayNumInPhoto: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 8.5,
    color: '#FFFFFF',
  },
});
