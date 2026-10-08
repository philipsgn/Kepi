import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Clock, ChevronUp } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radii, spacing } from '../../theme/tokens';
import { Strings } from '../../constants/strings';
import { Transaction } from '../../types/database';
import { formatTimeAgo } from '../../utils/cameraUtils';
import { PriceTag } from '../common/PriceTag';

interface RecentPhotoPreviewBannerProps {
  latestTransaction: Transaction | null;
  isMasked: boolean;
  onPress: () => void;
  onScrollToFullHistory: () => void;
}

/**
 * Khối hiển thị ảnh cũ gần nhất khi người dùng trượt tay lên — Phiên bản "Ấm, tĩnh, sang"
 * Tuân thủ yêu cầu CAMERA.md:
 * - Khi trượt lên và giữ ở khoảng 50%, nửa trên hiển thị camera, nửa dưới hiển thị ảnh cũ gần nhất
 * - Mốc thời gian thanh thoát, viền mảnh hairline 1px, price tag translucent pill
 */
export const RecentPhotoPreviewBanner: React.FC<RecentPhotoPreviewBannerProps> = ({
  latestTransaction,
  isMasked,
  onPress,
  onScrollToFullHistory,
}) => {
  const { tokens } = useTheme();

  if (!latestTransaction) {
    return null;
  }

  const timeAgoStr = formatTimeAgo(latestTransaction.occurred_at || latestTransaction.created_at);
  const photoUri = latestTransaction.thumbnail_url || latestTransaction.photo_url;
  const isIncome = latestTransaction.type === 'INCOME';

  return (
    <View style={[styles.container, { borderTopColor: 'rgba(255, 255, 255, 0.08)' }]}>
      {/* 1. DẢI TIÊU ĐỀ MỐC THỜI GIAN */}
      <View style={styles.headerRow}>
        <View style={styles.timeTag}>
          <Clock size={11} color={tokens.primary} strokeWidth={2.2} />
          <Text style={styles.timeTagText}>
            {Strings.camera.mostRecent} · {timeAgoStr}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onScrollToFullHistory}
          style={[styles.moreHistoryBtn, { backgroundColor: tokens.primary }]}
        >
          <Text style={styles.moreHistoryText}>{Strings.history.title}</Text>
          <ChevronUp size={13} color="#1B2733" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      {/* 2. CARD PREVIEW ẢNH GẦN NHẤT */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={[styles.previewCard, { borderColor: 'rgba(255, 255, 255, 0.15)' }]}
      >
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            style={styles.previewImage}
            contentFit="cover"
            cachePolicy="disk"
          />
        ) : (
          <View style={styles.noPhotoBlock}>
            <Text style={[styles.noPhotoCategory, { color: tokens.primary }]}>
              {latestTransaction.category}
            </Text>
          </View>
        )}

        {/* Lớp gradient/mờ tối dưới chân ảnh */}
        <View style={styles.overlayBottom}>
          <Text style={styles.descText} numberOfLines={1}>
            {latestTransaction.description || latestTransaction.category}
          </Text>

          <PriceTag
            amount={Math.abs(latestTransaction.amount)}
            variant={isIncome ? 'green' : 'dark'}
            size="sm"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs + 2,
    paddingBottom: spacing.sm + 4,
    backgroundColor: 'rgba(14, 22, 32, 0.95)',
    borderTopWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 2,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  timeTagText: {
    color: '#FAF6EC',
    fontSize: 10.5,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  moreHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  moreHistoryText: {
    color: '#1B2733',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 2,
  },
  previewCard: {
    height: 120,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: '#162231',
    borderWidth: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  noPhotoBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D2C3E',
  },
  noPhotoCategory: {
    fontSize: 14,
    fontWeight: '700',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 42,
    backgroundColor: 'rgba(14, 22, 32, 0.76)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  descText: {
    flex: 1,
    color: '#FAF6EC',
    fontSize: 12.5,
    fontWeight: '600',
    marginRight: 10,
  },
});
