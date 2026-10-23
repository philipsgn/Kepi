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
import { PigBoMascot } from '../mascot/PigBoMascot';

interface ProfileIdentityCardProps {
  name: string;
  email?: string | null;
  streakDays: number;
  savedMoney: number;
  entriesCount: number;
  isMasked?: boolean;
  isGuest?: boolean;
  onEditName?: () => void;
  onPressLogin?: () => void;
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
  onPressLogin,
  onPressStreak,
}) => {
  const { tokens, isDark } = useTheme();

  const handleEditName = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onEditName) onEditName();
  };

  const initialLetter = name ? name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <View style={[styles.container, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
      {/* NÚT BÚT CHÌ ĐỔI TÊN NẰM SÁT GÓC TRÊN BÊN PHẢI */}
      {onEditName && (
        <TouchableOpacity
          onPress={handleEditName}
          style={styles.editIconBtnTopRight}
          activeOpacity={0.65}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Đổi tên người dùng"
        >
          <Edit2 size={15} color={tokens.textMuted} strokeWidth={2.2} />
        </TouchableOpacity>
      )}

      {/* 1. HÀNG THÔNG TIN TÀI KHOẢN: AVATAR CHÚ HEO PIGFLY CHIBI */}
      <View style={styles.topRow}>
        <View style={styles.mascotAvatarWrapper}>
          <PigBoMascot pose="welcome" size={48} />
        </View>

        <View style={styles.nameCol}>
          <Text style={[styles.nameText, { color: tokens.text }]} numberOfLines={1}>
            {name || 'Người dùng Ví'}
          </Text>

          
        </View>
      </View>

      {/* 2. DẢI 3 CHỈ SỐ TÓM TẮT */}
      <View style={[styles.statsRow, { backgroundColor: tokens.surfaceAlt }]}>
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
            <Flame size={16} color={tokens.primary} strokeWidth={2.4} />
          </View>
          <Text style={[styles.statValue, { color: tokens.text }]}>{streakDays} ngày</Text>
          <Text style={[styles.statLabel, { color: tokens.textMuted }]}>Chuỗi ghi</Text>
        </TouchableOpacity>

        <View style={[styles.statDivider, { backgroundColor: tokens.border }]} />

        {/* Chỉ số 2: Đã giữ lại */}
        <View style={styles.statCell}>
          <View style={styles.statIconBadge}>
            <ShieldCheck size={16} color={tokens.success} strokeWidth={2.4} />
          </View>
          <Text style={[styles.statValue, { color: tokens.text }]}>
            {formatMaskedCurrency(savedMoney, isMasked, false)}
          </Text>
          <Text style={[styles.statLabel, { color: tokens.textMuted }]}>Đã giữ lại</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: tokens.border }]} />

        {/* Chỉ số 3: Món đã ghi */}
        <View style={styles.statCell}>
          <View style={styles.statIconBadge}>
            <ShoppingBag size={16} color={tokens.accent} strokeWidth={2.4} />
          </View>
          <Text style={[styles.statValue, { color: tokens.text }]}>{entriesCount} món</Text>
          <Text style={[styles.statLabel, { color: tokens.textMuted }]}>Đã lưu</Text>
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
  googlePillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  googlePillText: {
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
