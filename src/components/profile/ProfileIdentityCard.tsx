import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Cloud, Edit2, Flame, ShieldCheck, ShoppingBag } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { formatMaskedCurrency } from '../../utils/profileUtils';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { PixelPigAvatar } from '../pixel/PixelPigAvatar';

interface ProfileIdentityCardProps {
  name: string;
  email?: string | null;
  streakDays: number;
  savedMoney: number;
  entriesCount: number;
  isMasked?: boolean;
  isGuest?: boolean;
  onEditName?: () => void;
  onPressStreak?: () => void;
}

export const ProfileIdentityCard: React.FC<ProfileIdentityCardProps> = ({
  name,
  email,
  streakDays,
  savedMoney,
  entriesCount,
  isMasked = false,
  isGuest = false,
  onEditName,
  onPressStreak,
}) => {
  const { tokens, isDark, mode } = useTheme();
  const isHeocon = mode === 'heocon' || !mode;

  const handleEditName = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onEditName) onEditName();
  };

  const initialLetter = name ? name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <View
      style={[
        styles.container,
        isHeocon
          ? {
              backgroundColor: '#FFFBF1',
              borderColor: '#2B2118',
              borderWidth: 3,
              shadowColor: '#2B2118',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 4,
            }
          : { backgroundColor: tokens.surface, borderColor: tokens.border },
      ]}
    >
      {/* NÚT BÚT CHÌ ĐỔI TÊN NẰM SÁT GÓC TRÊN BÊN PHẢI */}
      {onEditName && (
        <TouchableOpacity
          onPress={handleEditName}
          style={styles.editIconBtnTopRight}
          activeOpacity={0.65}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Đổi tên người dùng"
        >
          <Edit2 size={15} color={isHeocon ? '#2B2118' : tokens.textMuted} strokeWidth={2.2} />
        </TouchableOpacity>
      )}

      {/* 1. HÀNG THÔNG TIN TÀI KHOẢN: AVATAR CHÚ HEO PIGFLY CHIBI */}
      <View style={styles.topRow}>
        <View style={styles.mascotAvatarWrapper}>
          <PixelPigAvatar size={48} mood="happy" />
        </View>

        <View style={styles.nameCol}>
          <Text
            style={[
              styles.nameText,
              { color: isHeocon ? '#2B2118' : tokens.text },
              isHeocon && { fontWeight: '800' },
            ]}
            numberOfLines={1}
          >
            {name || 'Người dùng Ví'}
          </Text>
        </View>
      </View>

      {/* 2. DẢI 3 CHỈ SỐ TÓM TẮT */}
      <View
        style={[
          styles.statsRow,
          isHeocon
            ? {
                backgroundColor: '#F6EEDC',
                borderColor: '#2B2118',
                borderWidth: 2,
              }
            : { backgroundColor: tokens.surfaceAlt },
        ]}
      >
        {/* Chỉ số 1: Chuỗi ngày (Bấm mở Modal Điểm Danh) */}
        <TouchableOpacity
          style={styles.statCell}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (onPressStreak) onPressStreak();
          }}
          activeOpacity={0.7}
          accessibilityLabel="Xem chi tiết điểm danh chuỗi ngày"
        >
          <View style={styles.statIconBadge}>
            <Flame size={16} color={isHeocon ? '#E0452B' : tokens.primary} strokeWidth={2.4} />
          </View>
          <Text
            style={[
              styles.statValue,
              { color: isHeocon ? '#2B2118' : tokens.text },
              isHeocon && { fontWeight: '800' },
            ]}
          >
            {streakDays} ngày
          </Text>
          <Text style={[styles.statLabel, { color: isHeocon ? '#6E5D4F' : tokens.textMuted }]}>
            Chuỗi ghi
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.statDivider,
            { backgroundColor: isHeocon ? '#2B2118' : tokens.border },
          ]}
        />

        {/* Chỉ số 2: Đã giữ lại */}
        <View style={styles.statCell}>
          <View style={styles.statIconBadge}>
            <ShieldCheck size={16} color={isHeocon ? '#5E9A57' : tokens.success} strokeWidth={2.4} />
          </View>
          <Text
            style={[
              styles.statValue,
              { color: isHeocon ? '#2B2118' : tokens.text },
              isHeocon && { fontWeight: '800' },
            ]}
          >
            {formatMaskedCurrency(savedMoney, isMasked, false)}
          </Text>
          <Text style={[styles.statLabel, { color: isHeocon ? '#6E5D4F' : tokens.textMuted }]}>
            Đã giữ lại
          </Text>
        </View>

        <View
          style={[
            styles.statDivider,
            { backgroundColor: isHeocon ? '#2B2118' : tokens.border },
          ]}
        />

        {/* Chỉ số 3: Món đã ghi */}
        <View style={styles.statCell}>
          <View style={styles.statIconBadge}>
            <ShoppingBag size={16} color={isHeocon ? '#F4B93B' : tokens.accent} strokeWidth={2.4} />
          </View>
          <Text
            style={[
              styles.statValue,
              { color: isHeocon ? '#2B2118' : tokens.text },
              isHeocon && { fontWeight: '800' },
            ]}
          >
            {entriesCount} món
          </Text>
          <Text style={[styles.statLabel, { color: isHeocon ? '#6E5D4F' : tokens.textMuted }]}>
            Đã lưu
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  mascotAvatarWrapper: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    color: '#1B2733',
    fontSize: 20,
    fontWeight: '800',
  },
  nameCol: {
    flex: 1,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
  },
  editIconBtnTopRight: {
    position: 'absolute',
    top: 14,
    right: 14,
    padding: 6,
    zIndex: 2,
  },
  localBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  localBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  emailText: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
});
