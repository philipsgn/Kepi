import React, { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronLeft, ChevronRight, Leaf, Calendar as CalendarIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/ThemeContext';
import { radii, spacing } from '../../theme/tokens';
import { Strings } from '../../constants/strings';
import { Button } from '../common/Button';
import { DayPhotoCell } from './DayPhotoCell';
import {
  DayCalendarCell,
  generateWeekDays,
  getWeekRangeText,
} from '../../utils/calendarUtils';
import { Transaction } from '../../types/database';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CALENDAR_PADDING = spacing.md * 2;
const GRID_WIDTH = SCREEN_WIDTH - CALENDAR_PADDING;
const CELL_WIDTH = Math.floor(GRID_WIDTH / 7);
const CELL_HEIGHT = CELL_WIDTH * 1.35;

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

interface WeekCalendarCarouselProps {
  transactions: Transaction[];
  onSelectDay: (cell: DayCalendarCell) => void;
  onLongPressDay: (cell: DayCalendarCell) => void;
  onOpenCamera: () => void;
  renderHeaderExtra?: React.ReactNode;
}

/**
 * Dải Lịch Tuần Carousel (Week Calendar Strip) — Dạng Carousel vuốt tuần
 * Tuân thủ yêu cầu:
 * - Hiển thị 1 hàng gồm 7 ngày (Thứ 2 đến Chủ Nhật)
 * - Vuốt ngang (PanResponder) hoặc bấm nút mũi tên để sang tuần trước / tuần kế tiếp
 * - Tái sử dụng DayPhotoCell hiển thị ảnh Locket hoặc icon đơn sắc
 * - Vibe Hà Nội Thu Đông ấm áp, tinh tế, sang trọng
 */
export const WeekCalendarCarousel: React.FC<WeekCalendarCarouselProps> = ({
  transactions,
  onSelectDay,
  onLongPressDay,
  onOpenCamera,
  renderHeaderExtra,
}) => {
  const { tokens } = useTheme();

  // Ngày tham chiếu để xác định tuần đang hiển thị (mặc định là hôm nay)
  const [currentWeekRef, setCurrentWeekRef] = useState<Date>(() => new Date());

  const handlePrevWeek = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentWeekRef((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentWeekRef((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const handleResetToCurrentWeek = () => {
    Haptics.selectionAsync();
    setCurrentWeekRef(new Date());
  };

  // Sinh 7 ngày của tuần
  const weekCells = useMemo(() => {
    return generateWeekDays(currentWeekRef, transactions);
  }, [currentWeekRef, transactions]);

  const weekRangeTitle = useMemo(() => {
    return getWeekRangeText(currentWeekRef);
  }, [currentWeekRef]);

  // Kiểm tra tuần này có phải tuần chứa ngày hôm nay không
  const isCurrentActiveWeek = useMemo(() => {
    return weekCells.some((c) => c.isToday);
  }, [weekCells]);

  // Kiểm tra tuần có giao dịch nào không
  const hasAnyItemsInWeek = useMemo(() => {
    return weekCells.some((c) => c.itemCount > 0);
  }, [weekCells]);

  // PanResponder để vuốt ngang chuyển tuần (Carousel swipe)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 30 && Math.abs(gestureState.dy) < 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 40) {
          handlePrevWeek();
        } else if (gestureState.dx < -40) {
          handleNextWeek();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* 1. THANH ĐIỀU HƯỚNG TUẦN */}
      <View style={styles.weekHeaderRow}>
        <TouchableOpacity
          onPress={handlePrevWeek}
          style={styles.navArrowBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Tuần trước"
        >
          <ChevronLeft size={20} color={tokens.text} strokeWidth={2.6} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResetToCurrentWeek}
          activeOpacity={0.7}
          style={styles.weekTitleWrapper}
        >
          <View
            style={[
              styles.weekTitleBadge,
              {
                backgroundColor: tokens.surfaceAlt,
                borderColor: tokens.border,
                borderWidth: 1,
              },
            ]}
          >
            <CalendarIcon size={14} color={tokens.primary} strokeWidth={2.4} />
            <Text style={[styles.weekTitleText, { color: tokens.text }]}>
              {weekRangeTitle}
            </Text>
          </View>
          {!isCurrentActiveWeek && (
            <Text style={[styles.resetWeekHint, { color: tokens.primary }]}>
              Chạm để về tuần này
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNextWeek}
          style={styles.navArrowBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Tuần sau"
        >
          <ChevronRight size={20} color={tokens.text} strokeWidth={2.6} />
        </TouchableOpacity>
      </View>

      {/* HEADER PHỤ (NẾU CÓ) */}
      {renderHeaderExtra && <View style={styles.headerExtraWrapper}>{renderHeaderExtra}</View>}

      {/* 2. DÒNG TIÊU ĐỀ THỨ (T2..CN) */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((day, idx) => (
          <View key={day} style={[styles.weekdayCell, { width: CELL_WIDTH }]}>
            <Text
              style={[
                styles.weekdayText,
                {
                  color: idx >= 5 ? tokens.primary : tokens.textMuted,
                  fontWeight: idx >= 5 ? '700' : '500',
                },
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* 3. DẢI 7 Ô NGÀY TUẦN (THẢ NỔI TỰ NHIÊN — BORDER-LESS) */}
      <View style={styles.weekCellsRowWrapper}>
        <View style={styles.cellsRow}>
          {weekCells.map((cell) => (
            <DayPhotoCell
              key={cell.dateStr}
              cell={cell}
              cellWidth={CELL_WIDTH}
              cellHeight={CELL_HEIGHT}
              onPress={onSelectDay}
              onLongPress={onLongPressDay}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  weekTitleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radii.full,
  },
  weekTitleText: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  resetWeekHint: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  navArrowBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  headerExtraWrapper: {
    marginBottom: spacing.xs,
  },
  weekdaysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekdayCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    fontSize: 12,
  },
  weekCellsRowWrapper: {
    paddingVertical: 2,
    overflow: 'visible',
  },
  cellsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyWeekCard: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyWeekText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyActionBtn: {
    marginTop: 4,
  },
});
