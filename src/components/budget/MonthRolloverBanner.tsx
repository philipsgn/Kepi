import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Sparkles, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { radii, spacing } from '../../theme/tokens';
import { formatVND } from '../../utils/currency';

interface MonthRolloverBannerProps {
  visible: boolean;
  month: string;
  carriedBalance: number;
  onDismiss: () => void;
}

export const MonthRolloverBanner: React.FC<MonthRolloverBannerProps> = ({
  visible,
  month,
  carriedBalance,
  onDismiss,
}) => {
  const { tokens } = useTheme();

  if (!visible) return null;

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  return (
    <View
      style={[
        styles.bannerContainer,
        {
          backgroundColor: tokens.surfaceAlt,
          borderColor: tokens.primary,
        },
      ]}
    >
      <View style={styles.iconBox}>
        <Sparkles size={20} color={tokens.primary} strokeWidth={2.6} />
      </View>

      <View style={styles.textCol}>
        <Text style={[styles.title, { color: tokens.text }]}>
          Chào Tháng {month}! 🍂
        </Text>
        <Text style={[styles.description, { color: tokens.textSub }]}>
          Số dư{' '}
          <Text style={[styles.highlightAmount, { color: tokens.primary }]}>
            {formatVND(carriedBalance)}
          </Text>{' '}
          từ tháng trước đã được kết chuyển trọn vẹn.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.closeBtn}
        onPress={handleDismiss}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <X size={18} color={tokens.textMuted} strokeWidth={2.6} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: 10,
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: 11,
    lineHeight: 16,
  },
  highlightAmount: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
