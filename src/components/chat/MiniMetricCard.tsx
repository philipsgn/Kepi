import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ArrowRight, PieChart } from 'lucide-react-native';
import { Strings } from '../../constants/strings';
import { formatVND } from '../../utils/currency';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

interface MiniMetricCardProps {
  title: string;
  amount: number;
  percentage?: number;
  category?: string;
  onPress: () => void;
}

/**
 * Thẻ số liệu mini hiển thị trong bong bóng chat của Anh Minh — Phong cách "Ấm, tĩnh, sang"
 * Tuân thủ mục 2.1 của đặc tả docs/screens/CHAT.md:
 * - Bo góc 12px mềm mại, viền hairline 1px tokens.border.
 * - Chạm thẻ nhảy sang trang Thống kê đúng danh mục.
 */
export const MiniMetricCard: React.FC<MiniMetricCardProps> = ({
  title,
  amount,
  percentage,
  category,
  onPress,
}) => {
  const { tokens } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[
        styles.card,
        {
          backgroundColor: tokens.surfaceAlt,
          borderColor: tokens.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.titleWithIcon}>
          <PieChart size={14} color={tokens.primary} strokeWidth={2.2} />
          <Text style={[styles.titleText, { color: tokens.text }]}>{title}</Text>
        </View>
        {percentage !== undefined && (
          <View style={[styles.percentBadge, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
            <Text style={[styles.percentText, { color: tokens.primary }]}>{percentage}% chi tháng</Text>
          </View>
        )}
      </View>

      <Text style={[styles.amountText, { color: tokens.text }]}>{formatVND(amount)}</Text>

      <View style={[styles.footerRow, { borderTopColor: tokens.border }]}>
        <Text style={[styles.footerLinkText, { color: tokens.primary }]}>{Strings.chat.viewInStats}</Text>
        <ArrowRight size={13} color={tokens.primary} strokeWidth={2.4} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  percentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  percentText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginVertical: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  footerLinkText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
});
