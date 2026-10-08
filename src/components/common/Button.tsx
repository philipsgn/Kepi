import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { Radii } from '../../theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'cream';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children?: React.ReactNode;
  title?: string;
  label?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

/**
 * Nút bấm — Phiên bản "Ấm, tĩnh, sang"
 * Tuân thủ mục 3 & 4 của đặc tả:
 * - Bo góc 16px (Radii.lg)
 * - Nút chính: vàng tươi ấm áp, chữ đen xanh trầm #1B2733
 * - Nút phụ: nền bề mặt, viền mảnh hairline 1px, chữ chính
 * - Nút chữ: không viền, chữ xanh trầm
 * - Nút cảnh báo: nền đỏ gạch ngói trầm, chữ đỏ
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  title,
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { tokens, isDark } = useTheme();
  const displayTitle = label || title || (typeof children === 'string' ? children : undefined);


  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getButtonStyles = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
      case 'cream':
        return {
          backgroundColor: tokens.surface,
          borderWidth: 1,
          borderColor: tokens.border,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'danger':
        return {
          backgroundColor: isDark ? 'rgba(229, 120, 106, 0.15)' : '#FDEEEC',
          borderWidth: 1,
          borderColor: tokens.danger,
        };
      case 'primary':
      default:
        return {
          backgroundColor: tokens.primary,
          borderWidth: 0,
          shadowColor: isDark ? 'transparent' : tokens.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0 : 0.2,
          shadowRadius: 10,
          elevation: isDark ? 0 : 2,
        };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return tokens.textOnPrimary; // #1B2733
      case 'secondary':
      case 'cream':
        return tokens.text;
      case 'ghost':
        return tokens.accent;
      case 'danger':
        return tokens.danger;
      default:
        return tokens.textOnPrimary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 7,
          paddingHorizontal: 12,
          fontSize: 12.5,
          iconGap: 6,
        };
      case 'lg':
        return {
          paddingVertical: 14,
          paddingHorizontal: 22,
          fontSize: 16,
          iconGap: 10,
        };
      case 'md':
      default:
        return {
          paddingVertical: 11,
          paddingHorizontal: 18,
          fontSize: 14,
          iconGap: 8,
        };
    }
  };

  const sizeConfig = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.base,
        getButtonStyles(),
        {
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
        },
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getTextColor()}
          style={styles.spinner}
        />
      ) : (
        <View style={[styles.innerRow, { gap: sizeConfig.iconGap }]}>
          {icon}
          {displayTitle ? (
            <Text
              style={[
                styles.text,
                {
                  color: getTextColor(),
                  fontSize: sizeConfig.fontSize,
                },
                textStyle,
              ]}
            >
              {displayTitle}
            </Text>
          ) : (
            children || null
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.lg, // 16px
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  spinner: {
    paddingVertical: 2,
  },
});
