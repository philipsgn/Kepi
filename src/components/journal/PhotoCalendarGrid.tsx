import React, { useMemo, useRef } from 'react';
import {
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, ChevronLeft, ChevronRight, Leaf } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/ThemeContext';
import { radii, spacing } from '../../theme/tokens';
import { Strings } from '../../constants/strings';
import { Button } from '../common/Button';
import { DayPhotoCell } from './DayPhotoCell';
import { DayCalendarCell, generateMonthGrid } from '../../utils/calendarUtils';
import { Transaction } from '../../types/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CALENDAR_PADDING = spacing.md * 2;
const GRID_WIDTH = SCREEN_WIDTH - CALENDAR_PADDING;
const CELL_WIDTH = Math.floor(GRID_WIDTH / 7);
const CELL_HEIGHT = CELL_WIDTH * 1.25;

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

interface PhotoCalendarGridProps {
  year: number;
  month: number;
  transactions: Transaction[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (cell: DayCalendarCell) => void;
  onLongPressDay: (cell: DayCalendarCell) => void;
  onOpenCamera: () => void;
  renderHeaderExtra?: React.ReactNode;
}

/**
 * Lưới Lịch Ảnh Tháng (Photo Calendar Grid) — Phiên bản "Ấm, tĩnh, sang"
 * Tuân thủ mục 3.6 của đặc tả:
 * - Lưới 7 cột (T2..CN)
 * - Điều hướng tháng trước/sau bằng mũi tên hoặc vuốt ngang
 * - Khóa va chạm cử chỉ với Horizontal Pager
 */
export const PhotoCalendarGrid: React.FC<PhotoCalendarGridProps> = ({
  year,
  month,
  transactions,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
  onLongPressDay,
  onOpenCamera,
  renderHeaderExtra,
}) => {
  const { tokens } = useTheme();

  const cells = useMemo(() => {
    return generateMonthGrid(year, month, transactions);
  }, [year, month, transactions]);

  // Kiểm tra tháng hiện tại có giao dịch nào không
  const hasAnyItemsInMonth = useMemo(() => {
    return cells.some((c) => c.isCurrentMonth && c.itemCount > 0);
  }, [cells]);

  // PanResponder để vuốt ngang đổi tháng
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 30 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 40) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPrevMonth();
        } else if (gestureState.dx < -40) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onNextMonth();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* 1. THANH ĐIỀU HƯỚNG THÁNG */}
      <View style={styles.monthHeaderRow}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPrevMonth();
          }}
          style={styles.navArrowBtn}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={20} color={tokens.text} strokeWidth={2.6} />
        </TouchableOpacity>

        <View
          style={[
            styles.monthTitleBlock,
            { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border, borderWidth: 1 },
          ]}
        >
          <Calendar size={14} color={tokens.primary} strokeWidth={2.4} />
          <Text style={[styles.monthTitleText, { color: tokens.text }]}>
            Tháng {month}, {year}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onNextMonth();
          }}
          style={styles.navArrowBtn}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronRight size={20} color={tokens.text} strokeWidth={2.6} />
        </TouchableOpacity>
      </View>

      {/* TIỆN ÍCH HEADER MỞ RỘNG (CHIP LỌC DANH MỤC) */}
      {renderHeaderExtra}

      {/* 2. HÀNG TIÊU ĐỀ THỨ (T2 -> CN) */}
      <View style={[styles.weekdaysRow, { borderBottomColor: tokens.border }]}>
        {WEEKDAYS.map((day, idx) => (
          <View key={day} style={{ width: CELL_WIDTH, alignItems: 'center' }}>
            <Text
              style={[
                styles.weekdayText,
                { color: idx === 6 ? tokens.primary : tokens.textMuted },
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* 3. LƯỚI CÁC Ô NGÀY */}
      <View style={styles.gridContainer}>
        {cells.map((cell, index) => (
          <DayPhotoCell
            key={`${cell.dateStr}-${index}`}
            cell={cell}
            cellWidth={CELL_WIDTH}
            cellHeight={CELL_HEIGHT}
            onPress={onSelectDay}
            onLongPress={onLongPressDay}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: spacing.sm,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  navArrowBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  monthTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radii.full,
  },
  monthTitleText: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  weekdaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 6,
    marginBottom: 4,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 18,
  },
});
