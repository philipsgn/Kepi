import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check, X } from 'lucide-react-native';
import { formatVND } from '../../utils/currency';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

interface InlineConfirmationCardProps {
  amount: number;
  description: string;
  category: string;
  isSaved?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Thẻ xác nhận ghi sổ inline xuất hiện trong bong bóng chat của Anh Minh — Phong cách "Ấm, tĩnh, sang"
 * Tuân thủ mục 2.1 của đặc tả docs/screens/CHAT.md:
 * - Bo góc 12px, viền hairline 1px tokens.border.
 * - Thao tác Lưu / Bỏ qua trực quan với haptic feedback.
 */
export const InlineConfirmationCard: React.FC<InlineConfirmationCardProps> = ({
  amount,
  description,
  category,
  isSaved = false,
  onConfirm,
  onCancel,
}) => {
  const { tokens } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: tokens.surfaceAlt,
          borderColor: tokens.border,
        },
      ]}
    >
      <View style={styles.infoRow}>
        <View style={styles.leftInfo}>
          <Text style={[styles.amountText, { color: tokens.primary }]}>
            {formatVND(amount)}
          </Text>
          <Text style={[styles.descText, { color: tokens.text }]} numberOfLines={1}>
            {description}
          </Text>
        </View>

        <View style={[styles.categoryBadge, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <Text style={[styles.categoryText, { color: tokens.textMuted }]}>{category}</Text>
        </View>
      </View>

      {isSaved ? (
        <View style={[styles.savedBanner, { backgroundColor: tokens.success + '18', borderColor: tokens.success + '50' }]}>
          <Check size={14} color={tokens.success} strokeWidth={2.4} />
          <Text style={[styles.savedBannerText, { color: tokens.success }]}>Đã lưu vào sổ chi tiêu</Text>
        </View>
      ) : (
        <View style={[styles.actionRow, { borderTopColor: tokens.border }]}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onCancel();
            }}
            style={[styles.cancelBtn, { backgroundColor: tokens.surface, borderColor: tokens.border }]}
          >
            <X size={13} color={tokens.textMuted} strokeWidth={2} />
            <Text style={[styles.cancelText, { color: tokens.textMuted }]}>Bỏ qua</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onConfirm();
            }}
            style={[styles.saveBtn, { backgroundColor: tokens.primary }]}
          >
            <Check size={14} color="#1B2733" strokeWidth={2.6} />
            <Text style={styles.saveText}>Lưu vào sổ</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  leftInfo: {
    flex: 1,
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  descText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 5,
  },
  saveText: {
    color: '#1B2733',
    fontSize: 12,
    fontWeight: '700',
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  savedBannerText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
