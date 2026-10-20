import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { Strings } from '../../constants/strings';
import { Transaction } from '../../types/database';
import { formatCompactVND, maskMoney } from '../../utils/currency';
import { renderCategoryMonochromeIcon } from '../../constants/categories';

interface TransactionPhotoCellProps {
  item: Transaction;
  isMasked: boolean;
  onPress: (item: Transaction) => void;
  onLongPress?: (item: Transaction) => void;
  onUnpricedPress?: (item: Transaction) => void;
}

/**
 * Ô ảnh giao dịch 3:4 trong Thống kê & Lịch sử Camera — Phiên bản "Ấm, tĩnh, sang"
 * Tuân thủ mục 2.4 của đặc tả:
 * - Tỉ lệ 3:4, góc bo mềm 10px, viền mảnh hairline 1px
 * - Nhãn giá dạng viên thuốc mờ tối (translucent dark pill) góc dưới trái
 * - Phông số bảng tabular-nums
 * - Món không ảnh: hiển thị duy nhất Icon danh mục đơn sắc ở chính giữa, tuyệt đối không có chữ
 */
export const TransactionPhotoCell: React.FC<TransactionPhotoCellProps> = ({
  item,
  isMasked,
  onPress,
  onLongPress,
  onUnpricedPress,
}) => {
  const { tokens, isDark } = useTheme();
  const isSkipped = (item as any).is_skipped || item.category === 'Cứu ví';
  const isUnpriced =
    (item as any).is_unpriced || (item.type === 'EXPENSE' && (item.amount === 0 || isNaN(item.amount)));
  const isIncome = item.type === 'INCOME';
  const hasPhoto = Boolean(item.photo_url || item.thumbnail_url);
  const extraPhotos = (item as any).additional_photos_count || 0;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isUnpriced && onUnpricedPress) {
      onUnpricedPress(item);
    } else {
      onPress(item);
    }
  };

  const handleLongPress = () => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress(item);
    }
  };

  const getPriceLabel = () => {
    if (isUnpriced) {
      return Strings.stats.unpricedLabel;
    }
    const formatted = formatCompactVND(Math.abs(item.amount));
    if (isIncome) {
      return `+${formatted}`;
    }
    return `-${formatted}`;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={300}
      style={[
        styles.cellContainer,
        { backgroundColor: isDark ? '#162231' : '#F5EFE6', borderColor: tokens.border },
        isSkipped && [styles.cellSkippedBorder, { borderColor: tokens.primary }],
      ]}
    >
      {hasPhoto ? (
        <Image
          source={{ uri: (item.thumbnail_url || item.photo_url) ?? undefined }}
          style={styles.imageBackground}
          contentFit="cover"
          cachePolicy="disk"
          transition={150}
        />
      ) : (
        <View style={[styles.noPhotoBox, { backgroundColor: isDark ? '#141E2B' : '#F5EFE6' }]}>
          {renderCategoryMonochromeIcon({
            categoryId: item.category,
            isIncome,
            size: 30,
            color: isIncome ? tokens.success : tokens.primary,
            strokeWidth: 1.8,
          })}
        </View>
      )}

      {/* Lớp gradient/vignette mờ dưới đáy */}
      <View style={styles.bottomVignette} />

      {/* Nhãn giá góc dưới trái (Viên thuốc mờ tối) */}
      <View
        style={[
          styles.priceBadge,
          isIncome && [styles.incomeBadge, { borderColor: tokens.success }],
          isUnpriced && [styles.unpricedBadge, { borderColor: tokens.primary }],
        ]}
      >
        <Text
          style={[
            styles.priceText,
            isIncome && { color: tokens.success },
            isUnpriced && { color: tokens.primary },
          ]}
        >
          {maskMoney(getPriceLabel(), isMasked)}
        </Text>
      </View>

      {/* Badge Không mua (Cứu ví) */}
      {isSkipped && (
        <View style={[styles.skippedTag, { backgroundColor: tokens.primary }]}>
          <ShieldCheck size={12} color="#1B2733" strokeWidth={2.4} />
        </View>
      )}

      {/* Badge số ảnh phụ (+N) */}
      {extraPhotos > 0 && (
        <View style={styles.extraBadge}>
          <Text style={styles.extraBadgeText}>+{extraPhotos}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cellContainer: {
    flex: 1,
    aspectRatio: 3 / 4,
    margin: 2.5,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#162231',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    position: 'relative',
  },
  cellSkippedBorder: {
    borderWidth: 2,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  noPhotoBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#182434',
    padding: 6,
  },
  noPhotoDesc: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 38,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  priceBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(14, 22, 32, 0.78)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  incomeBadge: {
    backgroundColor: 'rgba(20, 36, 24, 0.85)',
  },
  unpricedBadge: {
    backgroundColor: 'rgba(20, 20, 28, 0.85)',
    borderStyle: 'dashed',
  },
  priceText: {
    color: '#FAF6EC',
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  skippedTag: {
    position: 'absolute',
    top: 5,
    right: 5,
    borderRadius: radii.full,
    padding: 3,
  },
  extraBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(14, 22, 32, 0.8)',
    borderRadius: radii.full,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  extraBadgeText: {
    color: '#FAF6EC',
    fontSize: 9,
    fontWeight: '700',
  },
});
