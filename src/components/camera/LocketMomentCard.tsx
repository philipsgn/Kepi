import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radii, spacing } from '../../theme/tokens';
import { Transaction } from '../../types/database';
import { formatCompactVND, formatVND, maskMoney } from '../../utils/currency';
import { renderCategoryMonochromeIcon } from '../../constants/categories';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LocketMomentCardProps {
  item: Transaction;
  isMasked?: boolean;
  onPress?: (item: Transaction) => void;
}

/**
 * Thẻ Khoảnh Khắc Lớn Chuẩn Ứng Dụng Locket (Hình #3)
 * - Tỉ lệ 4:5, bo góc tròn mềm 26px, viền mảnh hairline
 * - Tràn viền rộng rãi, đè nhẹ nhãn giá tiền & thời gian
 * - Món không ảnh: Hiển thị icon danh mục đơn sắc ở trung tâm trên nền màu ấm
 */
export const LocketMomentCard: React.FC<LocketMomentCardProps> = ({
  item,
  isMasked = false,
  onPress,
}) => {
  const { tokens, isDark } = useTheme();
  const hasPhoto = Boolean(item.photo_url || item.thumbnail_url);
  const isIncome = item.type === 'INCOME';
  const isSkipped = (item as any).is_skipped || item.category === 'Cứu ví';

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(item);
    }
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffHours < 1) {
        const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
        return `${diffMins} phút trước`;
      }
      if (diffHours < 24) {
        return `${diffHours}h trước`;
      }
      const days = Math.floor(diffHours / 24);
      if (days === 1) return 'Hôm qua';
      if (days < 7) return `${days} ngày trước`;
      return `${d.getDate()}/${d.getMonth() + 1}`;
    } catch {
      return '';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handlePress}
      style={[
        styles.cardContainer,
        {
          backgroundColor: isDark ? '#141E2B' : '#F5EFE6',
          borderColor: tokens.border,
        },
      ]}
    >
      {hasPhoto ? (
        <Image
          source={{ uri: (item.photo_url || item.thumbnail_url) ?? undefined }}
          style={styles.imageBackground}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
        />
      ) : (
        <View style={styles.noPhotoCenterBox}>
          {renderCategoryMonochromeIcon({
            categoryId: item.category,
            isIncome,
            size: 54,
            color: isIncome ? tokens.success : tokens.primary,
            strokeWidth: 1.8,
          })}
        </View>
      )}

      {/* Lớp gradient/vignette mờ dưới chân thẻ */}
      <View style={styles.bottomVignette} />

      {/* Nhãn giá góc dưới trái (Viên thuốc nổi mờ tối) */}
      <View
        style={[
          styles.pricePill,
          {
            backgroundColor: isDark ? 'rgba(14, 22, 32, 0.82)' : 'rgba(250, 246, 236, 0.88)',
            borderColor: tokens.border,
          },
        ]}
      >
        {renderCategoryMonochromeIcon({
          categoryId: item.category,
          isIncome,
          size: 15,
          color: isIncome ? tokens.success : tokens.primary,
          strokeWidth: 2,
        })}
        <Text
          style={[
            styles.priceText,
            { color: isIncome ? tokens.success : tokens.text },
          ]}
        >
          {isIncome ? '+' : ''}
          {maskMoney(formatVND(item.amount), isMasked)}
        </Text>
      </View>

      {/* Thời gian góc dưới phải */}
      <View style={styles.timeTag}>
        <Text style={styles.timeText}>{formatRelativeTime(item.created_at)}</Text>
      </View>

      {/* Badge Không mua (Cứu ví) nếu có */}
      {isSkipped && (
        <View style={[styles.skippedTag, { backgroundColor: tokens.primary }]}>
          <ShieldCheck size={14} color="#1B2733" strokeWidth={2.4} />
          <Text style={styles.skippedText}>Cứu ví</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: SCREEN_WIDTH - 28,
    aspectRatio: 4 / 5,
    borderRadius: 38,
    overflow: 'hidden',
    alignSelf: 'center',
    marginVertical: 14,
    borderWidth: 0,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 6,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  noPhotoCenterBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  pricePill: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 0,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  timeTag: {
    position: 'absolute',
    bottom: 18,
    right: 16,
  },
  timeText: {
    color: '#FAF6EC',
    fontSize: 12,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  skippedTag: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  skippedText: {
    color: '#1B2733',
    fontSize: 11,
    fontWeight: '700',
  },
});
