import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { Radii } from '../../theme/tokens';

export interface ChipProps {
  label: string;
  selected?: boolean;
  active?: boolean;
  onPress?: () => void;
  statusDot?: 'success' | 'warning' | 'danger' | 'primary';
  statusDotColor?: string;
  badgeCount?: number;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Chip — Phiên bản "Ấm, tĩnh, sang"
 * Tuân thủ mục 3 & 4 của đặc tả:
 * - Dạng viên thuốc bo tròn mềm mại 999px (Radii.full)
 * - Mặc định: viền mảnh 1px, nền bề mặt surface, chữ phụ textSub
 * - Khi chọn: nền vàng nhạt primarySoft, viền mảnh border, chữ chính text (không dùng vàng đậm kín)
 * - Hỗ trợ chấm trạng thái nhỏ (xanh ổn, vàng sắp tới, đỏ vượt)
 */
export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  active = false,
  onPress,
  statusDot,
  statusDotColor,
  badgeCount,
  size = 'md',
  icon,
  style,
}) => {
  const { tokens, isDark } = useTheme();
  const isSelected = selected || active;

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getDotColor = () => {
    if (statusDotColor) return statusDotColor;
    switch (statusDot) {
      case 'success':
        return tokens.success;
      case 'danger':
        return tokens.danger;
      case 'warning':
        return tokens.warning;
      case 'primary':
      default:
        return tokens.primary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 5,
          paddingHorizontal: 10,
          fontSize: 11.5,
          dotSize: 5,
        };
      case 'lg':
        return {
          paddingVertical: 9,
          paddingHorizontal: 16,
          fontSize: 14,
          dotSize: 7,
        };
      case 'md':
      default:
        return {
          paddingVertical: 7,
          paddingHorizontal: 13,
          fontSize: 12.5,
          dotSize: 6,
        };
    }
  };

  const sizeConfig = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={!onPress}
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? tokens.primarySoft : tokens.surface,
          borderColor: isSelected ? tokens.primary : tokens.border,
          borderWidth: 1,
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
        },
        style,
      ]}
    >
      <View style={styles.innerRow}>
        {statusDot && (
          <View
            style={[
              styles.statusDot,
              {
                width: sizeConfig.dotSize,
                height: sizeConfig.dotSize,
                borderRadius: sizeConfig.dotSize / 2,
                backgroundColor: getDotColor(),
              },
            ]}
          />
        )}
        {icon}
        <Text
          style={[
            styles.labelText,
            {
              color: isSelected ? tokens.text : tokens.textSub,
              fontSize: sizeConfig.fontSize,
              fontWeight: isSelected ? '700' : '500',
            },
          ]}
        >
          {label}
        </Text>
        {badgeCount !== undefined && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isSelected ? tokens.primary : tokens.surfaceAlt,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: isSelected ? tokens.textOnPrimary : tokens.textMuted,
                },
              ]}
            >
              {badgeCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: Radii.full, // 999px
    alignSelf: 'flex-start',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    marginRight: 1,
  },
  labelText: {
    letterSpacing: 0.1,
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 16,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
