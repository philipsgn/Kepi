import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import { Radii } from '../../theme/tokens';

export interface CardProps {
  children?: React.ReactNode;
  variant?: 'surface' | 'surfaceAlt' | 'primarySoft' | 'accentSoft' | 'alt';
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  isPressable?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  noBorder?: boolean;
  noPadding?: boolean;
  glow?: boolean;
}

/**
 * Thẻ Card — Phiên bản "Ấm, tĩnh, sang & WOW"
 * - Bề mặt phẳng, viền mảnh hairline 1px
 * - Góc bo mềm lớn 20px (Radii.xl)
 * - Hỗ trợ hiệu ứng glow (viền phát sáng đồng điệu theo theme: Vàng Kim, Titan hoặc Ngọc Bích)
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  style,
  contentStyle,
  isPressable = false,
  onPress,
  disabled = false,
  noBorder = false,
  noPadding = false,
  glow = false,
}) => {
  const { tokens, isDark } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'alt':
      case 'surfaceAlt':
        return tokens.surfaceAlt;
      case 'primarySoft':
        return tokens.primarySoft;
      case 'accentSoft':
        return tokens.accentSoft;
      case 'surface':
      default:
        return tokens.surface;
    }
  };

  const containerStyles = [
    styles.card,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: noBorder ? 'transparent' : glow ? tokens.primary : tokens.border,
      borderWidth: noBorder ? 0 : glow ? 1.2 : 1,
      // Đổ bóng theo glowColor nếu bật glow, hoặc bóng chuẩn theo theme
      shadowColor: glow ? tokens.glowColor : isDark ? 'transparent' : tokens.shadowColor,
      shadowOpacity: glow ? 0.35 : isDark ? 0 : tokens.shadowOpacity,
      shadowRadius: glow ? 16 : isDark ? 0 : 16,
      shadowOffset: glow ? { width: 0, height: 4 } : { width: 0, height: 6 },
      elevation: glow ? 4 : isDark ? 0 : 2,
    },
    !noPadding && styles.defaultPadding,
    style,
  ];

  if (isPressable && onPress) {
    return (
      <TouchableOpacity
        style={containerStyles}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
      >
        <View style={contentStyle}>{children}</View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyles}>
      <View style={contentStyle}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.xl, // 20px
    overflow: 'hidden',
  },
  defaultPadding: {
    padding: 16,
  },
});
