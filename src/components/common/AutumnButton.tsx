import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';
import { Typography } from '../../constants/typography';

export type ButtonVariant = 'primary' | 'safe' | 'danger' | 'outline' | 'ghost';

interface AutumnButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AutumnButton: React.FC<AutumnButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const handlePress = async () => {
    if (disabled || loading) return;

    // Kích hoạt phản hồi xúc giác nhẹ nhàng
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics không khả dụng trên môi trường giả lập web
    }

    onPress();
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'safe':
        return {
          container: {
            backgroundColor: Colors.incomeMint,
            borderColor: Colors.incomeMint,
          },
          text: { color: '#FFFFFF' },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: Colors.expenseCoral,
            borderColor: Colors.expenseCoral,
          },
          text: { color: '#FFFFFF' },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: Colors.surfacePaper,
            borderColor: Colors.borderSoft,
            borderWidth: 1.5,
          },
          text: { color: Colors.textCharcoal },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
          },
          text: { color: Colors.accentGold },
        };
      case 'primary':
      default:
        return {
          container: {
            backgroundColor: Colors.accentGold,
            borderColor: Colors.accentGold,
          },
          text: { color: '#FFFFFF' },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: Spacing.xs + 2,
            paddingHorizontal: Spacing.md,
            borderRadius: BorderRadius.md,
          },
          text: { fontSize: 13 },
        };
      case 'lg':
        return {
          container: {
            paddingVertical: Spacing.md + 4,
            paddingHorizontal: Spacing.xxl,
            borderRadius: BorderRadius.xl,
          },
          text: { fontSize: 17, fontWeight: '700' },
        };
      case 'md':
      default:
        return {
          container: {
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.xl,
            borderRadius: BorderRadius.lg,
          },
          text: { fontSize: 15, fontWeight: '600' },
        };
    }
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.base,
        variantStyle.container,
        sizeStyle.container,
        variant !== 'ghost' && Shadows.soft,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text.color} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              Typography.bodyMedium,
              variantStyle.text,
              sizeStyle.text,
              icon ? { marginLeft: Spacing.sm } : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});
