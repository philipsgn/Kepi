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
}) => {
  const { tokens } = useTheme();

  const handleEditName = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onEditName) onEditName();
  };

  const initialLetter = name ? name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <View style={[styles.container, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
      {/* 1. HÀNG THÔNG TIN TÀI KHOẢN */}
      <View style={styles.topRow}>
        <View style={[styles.avatarBox, { backgroundColor: tokens.primary, borderColor: tokens.border }]}>
          <Text style={styles.avatarLetter}>{initialLetter}</Text>
        </View>

        <View style={styles.nameCol}>
          <View style={styles.nameRow}>
            <Text style={[styles.nameText, { color: tokens.text }]} numberOfLines={1}>
              {name || (isGuest ? 'Khách Ghé Phố' : 'Người dùng Ví')}
            </Text>
            {onEditName && (
              <TouchableOpacity
                onPress={handleEditName}
                style={[styles.editIconBtn, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
                activeOpacity={0.7}
              >
                <Edit2 size={12} color={tokens.textSub} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.statusRow}>
            {isGuest && <View style={styles.guestDot} />}
            <Text style={[styles.emailText, { color: isGuest ? tokens.accent : tokens.textMuted }]} numberOfLines={1}>
              {isGuest ? 'Lưu trên máy này' : (email || 'Tài khoản đám mây')}
            </Text>
          </View>
        </View>

        {isGuest && onPressLogin && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPressLogin();
            }}
            style={styles.loginCloudBtn}
            activeOpacity={0.8}
          >
            <Cloud size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.loginCloudText}>Liên kết Google</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 1.1. NHẮC KHÉO TẾ NHỊ KHI LƯU TRÊN MÁY */}
      {isGuest && onPressLogin && (
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPressLogin();
          }}
          style={styles.nudgeBanner}
          activeOpacity={0.85}
        >
          <View style={styles.nudgeLeft}>
            <Cloud size={13} color="#E59844" />
            <Text style={[styles.nudgeText, { color: tokens.text }]} numberOfLines={1}>
              Sao lưu đám mây để không mất ảnh & số tiền khi xóa app
            </Text>
          </View>
          <Text style={styles.nudgeCta}>Sao lưu →</Text>
        </TouchableOpacity>
      )}

      {/* 2. DẢI 3 CHỈ SỐ TÓM TẮT */}
      <View style={[styles.statsRow, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
        {/* Chỉ số 1: Chuỗi ngày */}
        <View style={styles.statCell}>
          <View style={[styles.statIconBadge, { backgroundColor: tokens.surface }]}>
            <Flame size={13} color={tokens.primary} />
          </View>
          <Text style={[styles.statValue, { color: tokens.text }]}>{streakDays} ngày</Text>
          <Text style={[styles.statLabel, { color: tokens.textMuted }]}>Chuỗi ghi</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: tokens.border }]} />

        {/* Chỉ số 2: Đã giữ lại */}
        <View style={styles.statCell}>
          <View style={[styles.statIconBadge, { backgroundColor: tokens.surface }]}>
            <ShieldCheck size={13} color={tokens.success} />
          </View>
          <Text style={[styles.statValue, { color: tokens.text }]}>
            {formatMaskedCurrency(savedMoney, isMasked, false)}
          </Text>
          <Text style={[styles.statLabel, { color: tokens.textMuted }]}>Đã giữ lại</Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: tokens.border }]} />

        {/* Chỉ số 3: Món đã ghi */}
        <View style={styles.statCell}>
          <View style={[styles.statIconBadge, { backgroundColor: tokens.surface }]}>
            <ShoppingBag size={13} color={tokens.accent} />
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
    marginBottom: 14,
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
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
  },
  editIconBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
  loginCloudBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E59844',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
    marginLeft: 8,
  },
  loginCloudText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  guestDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E59844',
  },
  nudgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(229, 152, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(229, 152, 68, 0.22)',
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  nudgeLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  nudgeText: {
    fontSize: 11.5,
    fontWeight: '500',
    flex: 1,
  },
  nudgeCta: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#E59844',
  },
});
