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
  const { tokens, mode } = useTheme();
  const isHeocon = mode === 'heocon' || !mode;

  return (
    <View
      style={[
        styles.card,
        isHeocon
          ? {
              backgroundColor: '#FAF6EC',
              borderColor: '#2B2118',
              borderWidth: 2.5,
              borderRadius: 14,
              shadowColor: '#2B2118',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 2,
            }
          : {
              backgroundColor: tokens.surfaceAlt,
              borderColor: tokens.border,
            },
      ]}
    >
      <View style={styles.infoRow}>
        <View style={styles.leftInfo}>
          <Text
            style={[
              styles.amountText,
              { color: isHeocon ? '#E0452B' : tokens.primary },
              isHeocon && { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800', fontSize: 18 },
            ]}
          >
            {formatVND(amount)}
          </Text>
          <Text
            style={[
              styles.descText,
              { color: isHeocon ? '#2B2118' : tokens.text },
              isHeocon && { fontFamily: 'Nunito', fontWeight: '700' },
            ]}
            numberOfLines={1}
          >
            {description}
          </Text>
        </View>

        <View
          style={[
            styles.categoryBadge,
            isHeocon
              ? { backgroundColor: '#F6EEDC', borderWidth: 1.5, borderColor: '#2B2118' }
              : { backgroundColor: tokens.surface, borderColor: tokens.border },
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              { color: isHeocon ? '#2B2118' : tokens.textMuted },
              isHeocon && { fontWeight: '800' },
            ]}
          >
            {category}
          </Text>
        </View>
      </View>

      {isSaved ? (
        <View
          style={[
            styles.savedBanner,
            isHeocon
              ? { backgroundColor: '#5E9A5722', borderColor: '#5E9A57', borderWidth: 1.5 }
              : { backgroundColor: tokens.success + '18', borderColor: tokens.success + '50' },
          ]}
        >
          <Check size={14} color={isHeocon ? '#5E9A57' : tokens.success} strokeWidth={2.4} />
          <Text
            style={[
              styles.savedBannerText,
              { color: isHeocon ? '#5E9A57' : tokens.success },
              isHeocon && { fontWeight: '800' },
            ]}
          >
            Đã lưu vào sổ chi tiêu
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.actionRow,
            { borderTopColor: isHeocon ? '#2B2118' : tokens.border },
            isHeocon && { borderTopWidth: 1.5 },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onCancel();
            }}
            style={[
              styles.cancelBtn,
              isHeocon
                ? {
                    backgroundColor: '#FFFBF1',
                    borderWidth: 2,
                    borderColor: '#2B2118',
                    borderRadius: radii.full,
                  }
                : { backgroundColor: tokens.surface, borderColor: tokens.border },
            ]}
          >
            <X size={13} color={isHeocon ? '#2B2118' : tokens.textMuted} strokeWidth={2.4} />
            <Text
              style={[
                styles.cancelText,
                { color: isHeocon ? '#2B2118' : tokens.textMuted },
                isHeocon && { fontWeight: '800' },
              ]}
            >
              Bỏ qua
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onConfirm();
            }}
            style={[
              styles.saveBtn,
              isHeocon
                ? {
                    backgroundColor: '#F4B93B',
                    borderWidth: 2,
                    borderColor: '#2B2118',
                    borderRadius: radii.full,
                    shadowColor: '#2B2118',
                    shadowOffset: { width: 0, height: 1.5 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 2,
                  }
                : { backgroundColor: tokens.primary },
            ]}
          >
            <Check size={14} color={isHeocon ? '#2B2118' : '#1B2733'} strokeWidth={2.6} />
            <Text
              style={[
                styles.saveText,
                isHeocon && { color: '#2B2118', fontWeight: '800' },
              ]}
            >
              Lưu vào sổ
            </Text>
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
