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
import { formatVND, maskMoney } from '../../utils/currency';
import { renderCategoryMonochromeIcon } from '../../constants/categories';
import { formatCategoryName } from '../../constants/categoryDefaults';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LocketMomentCardProps {
  item: Transaction;
  isMasked?: boolean;
  onPress?: (item: Transaction) => void;
}

/**
 * Thẻ Khoảnh Khắc Locket Chuẩn Khung Ảnh Polaroid Pixel Hoài Niệm
 * - Khung ảnh Polaroid viền kem sữa #FFFBF1, viền 2.5px Nâu Mực #2B2118, bóng cứng 4px
 * - Miếng dán băng keo washi pixel art góc trên
 * - Lề đáy Polaroid dày 46px với tem dán giá tiền Vàng Cám + Dấu mộc thời gian hoài niệm
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
        return `${diffMins}m trước`;
      }
      if (diffHours < 24) {
        return `${diffHours}h trước`;
      }
      const days = Math.floor(diffHours / 24);
      if (days === 1) return 'Hôm qua';
      if (days < 7) return `${days}d trước`;
      return `${d.getDate()}/${d.getMonth() + 1}`;
    } catch {
      return '';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={handlePress}
      style={styles.polaroidFrame}
    >
      {/* 1. MIẾNG BĂNG KEO WASHI TAPE PIXEL DÁN GÓC TRÊN */}
      <View style={styles.washiTapeWrapper} pointerEvents="none">
        <View style={styles.washiTape} />
      </View>

      {/* 2. KHU VỰC BỨC ẢNH CHỤP (PHOTO APERTURE) */}
      <View style={styles.photoContainer}>
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
              color: isIncome ? '#5E9A57' : '#2B2118',
              strokeWidth: 2,
            })}
          </View>
        )}

        {/* Badge Không mua (Cứu ví) nếu có */}
        {isSkipped && (
          <View style={styles.skippedTag}>
            <ShieldCheck size={13} color="#2B2118" strokeWidth={2.6} />
            <Text style={styles.skippedText}>Cứu ví</Text>
          </View>
        )}

        {/* Ô MÔ TẢ KÍNH MỜ SÁT ĐÁY TRONG KHUNG ẢNH (CHỐNG CHE ẢNH) */}
        {Boolean(item.description && item.description.trim() !== '') && (
          <View style={styles.inPhotoDescPill}>
            <Text style={styles.inPhotoDescText} numberOfLines={1}>
              {item.description}
            </Text>
          </View>
        )}
      </View>

      {/* 3. LỀ ĐÁY DÀY KIỂU ẢNH POLAROID RỬA PHIM */}
      <View style={styles.polaroidBottomBar}>
        {/* Nhãn tem giá tiền (Price Stamp) */}
        <View
          style={[
            styles.priceStamp,
            { backgroundColor: isIncome ? '#5E9A57' : '#F4B93B' },
          ]}
        >
          {renderCategoryMonochromeIcon({
            categoryId: item.category,
            isIncome,
            size: 13,
            color: isIncome ? '#FFFBF1' : '#2B2118',
            strokeWidth: 2.4,
          })}
          <Text
            style={[
              styles.priceStampText,
              { color: isIncome ? '#FFFBF1' : '#2B2118' },
            ]}
          >
            {isIncome ? '+' : '−'}
            {maskMoney(formatVND(item.amount), isMasked)}
          </Text>
        </View>

        {/* Tên danh mục CÓ DẤU CHUẨN (Right ngoài khung ảnh) & Thời gian */}
        <View style={styles.photoInfoCol}>
          <Text style={styles.photoDescText} numberOfLines={1}>
            {formatCategoryName(item.category)}
          </Text>
          <View style={styles.stampDateBadge}>
            <Text style={styles.stampDateText}>
              • {formatRelativeTime(item.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  polaroidFrame: {
    width: SCREEN_WIDTH - 24,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 16,
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
    alignSelf: 'center',
    marginVertical: 14,
    position: 'relative',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  washiTapeWrapper: {
    position: 'absolute',
    top: -8,
    left: '42%',
    zIndex: 10,
    transform: [{ rotate: '-3deg' }],
  },
  washiTape: {
    width: 60,
    height: 16,
    backgroundColor: 'rgba(249, 184, 196, 0.92)',
    borderWidth: 1.5,
    borderColor: '#2B2118',
    borderRadius: 2,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#1E2836',
    position: 'relative',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  noPhotoCenterBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF6EC',
  },
  polaroidBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingHorizontal: 4,
    gap: 8,
  },
  priceStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2B2118',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  priceStampText: {
    fontFamily: 'Baloo2-Bold',
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  photoInfoCol: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  photoDescText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '800',
    color: '#2B2118',
    maxWidth: 150,
  },
  stampDateBadge: {
    marginTop: 2,
  },
  stampDateText: {
    fontFamily: 'Nunito',
    fontSize: 11,
    fontWeight: '700',
    color: '#85735E',
  },
  skippedTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F4B93B',
    borderWidth: 1.5,
    borderColor: '#2B2118',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  skippedText: {
    fontFamily: 'Nunito',
    fontSize: 11,
    fontWeight: '800',
    color: '#2B2118',
  },
  inPhotoDescPill: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inPhotoDescText: {
    fontFamily: 'Nunito',
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFBF1',
  },
});
