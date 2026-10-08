import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';

import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { DayCalendarCell } from '../../utils/calendarUtils';
import { renderCategoryMonochromeIcon } from '../../constants/categories';

interface DayPhotoCellProps {
  cell: DayCalendarCell;
  cellWidth: number;
  cellHeight: number;
  onPress: (cell: DayCalendarCell) => void;
  onLongPress: (cell: DayCalendarCell) => void;
}

/**
 * Ô ngày lịch ảnh (Locket Visual Calendar Cell) — Phiên bản "Ấm, tĩnh, sang"
 * Tuân thủ mục 3.6 của đặc tả:
 * - Chồng tối đa 2 ảnh bo góc mềm 8px, viền mảnh hairline 1px
 * - Nhãn "+N" ở góc trên phải thanh thoát
 * - Ngày không ảnh: khối bo tròn hiện icon danh mục đơn sắc
 * - Hôm nay: số ngày được tô khối vàng ấm nhẹ
 */
export const DayPhotoCell: React.FC<DayPhotoCellProps> = ({
  cell,
  cellWidth,
  cellHeight,
  onPress,
  onLongPress,
}) => {
  const { tokens, isDark } = useTheme();
  const {
    dayNumber,
    isCurrentMonth,
    isToday,
    isFuture,
    itemCount,
    photoThumbnails,
    hasSkippedOnly,
    categories,
  } = cell;

  if (!isCurrentMonth) {
    // Ô ngày ngoài tháng hiện tại (làm mờ tối đa)
    return (
      <View style={[styles.container, { width: cellWidth, height: cellHeight, opacity: 0.18 }]}>
        <Text style={[styles.dayNumberMuted, { color: tokens.textMuted }]}>{dayNumber}</Text>
      </View>
    );
  }

  const hasPhotos = photoThumbnails && photoThumbnails.length > 0;
  const extraCount = itemCount > photoThumbnails.length ? itemCount - photoThumbnails.length : 0;

  const renderCategoryFallbackIcon = () => {
    return renderCategoryMonochromeIcon({
      categoryId: categories[0] || 'an_uong',
      size: 14,
      color: tokens.primary,
      strokeWidth: 2,
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={isFuture ? 1 : 0.75}
      disabled={isFuture}
      onPress={() => onPress(cell)}
      onLongPress={() => onLongPress(cell)}
      delayLongPress={350}
      style={[
        styles.container,
        { width: cellWidth, height: cellHeight },
        isFuture && styles.containerFuture,
        hasSkippedOnly && [styles.containerSkippedOnly, { borderColor: tokens.primary }],
      ]}
    >
      {/* 1. KHUNG ẢNH HOẶC ICON CHÍNH — HIỆU ỨNG XẾP CHỒNG 3D ĐA LỚP */}
      <View style={styles.photoStackWrapper}>
        {hasPhotos ? (
          <>
            {/* Lớp 3 (Lớp sâu nhất bên dưới nếu có >= 3 ảnh) */}
            {photoThumbnails.length >= 3 && (
              <View
                style={[
                  styles.photoUnderlayBase,
                  styles.photoLayer3,
                  {
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : '#FFFFFF',
                    backgroundColor: tokens.surfaceAlt,
                  },
                ]}
              >
                <Image
                  source={{ uri: photoThumbnails[2] }}
                  style={styles.imageFill}
                  contentFit="cover"
                  cachePolicy="disk"
                  transition={200}
                />
              </View>
            )}

            {/* Lớp 2 (Lớp ở giữa nếu có >= 2 ảnh) */}
            {photoThumbnails.length >= 2 && (
              <View
                style={[
                  styles.photoUnderlayBase,
                  photoThumbnails.length >= 3 ? styles.photoLayer2Triple : styles.photoLayer2Double,
                  {
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.22)' : '#FFFFFF',
                    backgroundColor: tokens.surfaceAlt,
                  },
                ]}
              >
                <Image
                  source={{ uri: photoThumbnails[1] }}
                  style={styles.imageFill}
                  contentFit="cover"
                  cachePolicy="disk"
                  transition={200}
                />
              </View>
            )}

            {/* Lớp 1 (Lớp ảnh chính trên cùng) */}
            <View
              style={[
                styles.photoOverlay,
                photoThumbnails.length >= 3
                  ? styles.photoLayer1Triple
                  : photoThumbnails.length === 2
                  ? styles.photoLayer1Double
                  : styles.photoLayerSingle,
                {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.28)' : '#FFFFFF',
                  backgroundColor: tokens.surfaceAlt,
                  shadowColor: isDark ? '#000000' : tokens.shadowColor,
                  shadowOpacity: isDark ? 0.35 : 0.15,
                },
              ]}
            >
              <Image
                source={{ uri: photoThumbnails[0] }}
                style={styles.imageFill}
                contentFit="cover"
                cachePolicy="disk"
                transition={200}
              />
            </View>

            {/* Badge số lượng ảnh nếu có nhiều hơn 1 ảnh */}
            {itemCount > 1 && (
              <View
                style={[
                  styles.badgeCount,
                  {
                    backgroundColor: tokens.primary,
                    borderColor: isDark ? 'rgba(0,0,0,0.4)' : '#FFFFFF',
                  },
                ]}
              >
                <Text style={styles.badgeCountText}>{itemCount}</Text>
              </View>
            )}
          </>
        ) : itemCount > 0 ? (
          // Có khoản chi nhưng không chụp ảnh
          <View
            style={[
              styles.fallbackIconBox,
              {
                backgroundColor: tokens.surfaceAlt,
                borderColor: tokens.border,
              },
            ]}
          >
            {renderCategoryFallbackIcon()}
            {itemCount > 1 && (
              <View
                style={[
                  styles.badgeCount,
                  {
                    backgroundColor: tokens.primary,
                    borderColor: 'rgba(0,0,0,0.08)',
                  },
                ]}
              >
                <Text style={styles.badgeCountText}>+{itemCount - 1}</Text>
              </View>
            )}
          </View>
        ) : (
          // Ngày không có dữ liệu
          <View
            style={[
              styles.emptyDayBox,
              {
                backgroundColor: tokens.surfaceAlt,
                borderColor: tokens.border,
              },
            ]}
          />
        )}
      </View>

      {/* 2. SỐ NGÀY & ĐIỂM HÔM NAY */}
      <View style={styles.dateLabelRow}>
        {isToday ? (
          <View style={[styles.todayPill, { backgroundColor: tokens.primary }]}>
            <Text style={styles.todayText}>{dayNumber}</Text>
          </View>
        ) : (
          <Text
            style={[
              styles.dayText,
              { color: tokens.text },
              isFuture && { color: tokens.textMuted },
            ]}
          >
            {dayNumber}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingHorizontal: 1,
  },
  containerFuture: {
    opacity: 0.35,
  },
  containerSkippedOnly: {
    borderWidth: 1,
    borderRadius: radii.sm,
  },
  photoStackWrapper: {
    width: '92%',
    aspectRatio: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoUnderlayBase: {
    position: 'absolute',
    width: '88%',
    height: '88%',
    borderRadius: radii.sm,
    overflow: 'hidden',
    borderWidth: 1,
  },
  photoLayer3: {
    transform: [{ rotate: '5deg' }, { translateY: -2 }, { translateX: 2 }],
    opacity: 0.85,
  },
  photoLayer2Triple: {
    transform: [{ rotate: '-4deg' }, { translateY: -1 }],
    opacity: 0.95,
  },
  photoLayer2Double: {
    transform: [{ rotate: '3.5deg' }, { translateY: -1 }],
  },
  photoOverlay: {
    width: '88%',
    height: '88%',
    borderRadius: radii.sm,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  photoLayer1Triple: {
    transform: [{ rotate: '0.8deg' }],
  },
  photoLayer1Double: {
    transform: [{ rotate: '-2.5deg' }],
  },
  photoLayerSingle: {
    transform: [{ rotate: '0deg' }],
  },
  imageFill: {
    width: '100%',
    height: '100%',
  },
  badgeCount: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
    zIndex: 10,
  },
  badgeCountText: {
    color: '#1B2733',
    fontSize: 10,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  fallbackIconBox: {
    width: '88%',
    height: '88%',
    borderRadius: radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyDayBox: {
    width: '84%',
    height: '84%',
    borderRadius: radii.sm - 2,
    borderWidth: 1,
    opacity: 0.5,
  },
  dateLabelRow: {
    marginTop: 2,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  dayNumberMuted: {
    fontSize: 11,
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
  },
  todayPill: {
    borderRadius: radii.full,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  todayText: {
    color: '#1B2733',
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
