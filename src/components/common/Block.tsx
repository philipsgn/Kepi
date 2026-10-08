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

export type BlockVariant = 'yellow' | 'dark' | 'cream' | 'green' | 'red' | 'white';

interface BlockProps {
  children?: React.ReactNode;
  variant?: BlockVariant;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  isPressable?: boolean;
  onPress?: () => void;
  shadowColor?: string;
  disabled?: boolean;
}

/**
 * Block — Viết lại bên trong theo chuẩn "Ấm, tĩnh, sang"
 * Giữ nguyên interface để tương thích 100% với các trang hiện có:
 * - Bỏ hoàn toàn SVG notch góc cắt bậc thang
 * - Bỏ viền đen dày và bóng cứng
 * - Thay bằng bề mặt phẳng, viền hairline 1px, bo góc 20px
 * - Hỗ trợ cả 2 chế độ Sáng và Tối qua useTheme()
 */
export const Block: React.FC<BlockProps> = ({
  children,
  variant = 'dark',
  style,
  contentStyle,
  isPressable = false,
  onPress,
  disabled = false,
}) => {
  const { tokens, isDark } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'yellow':
        return tokens.primarySoft;
      case 'cream':
        return tokens.surfaceAlt;
      case 'green':
        return isDark ? 'rgba(76, 196, 154, 0.15)' : '#EAF7F1';
      case 'red':
        return isDark ? 'rgba(229, 120, 106, 0.15)' : '#FDEEEC';
      case 'white':
        return tokens.surface;
      case 'dark':
      default:
        return tokens.surface;
    }
  };

  const containerStyles = [
    styles.container,
    {
      backgroundColor: getBackgroundColor(),
      borderColor: tokens.border,
      borderWidth: 1,
      // Bóng nhẹ ở bản Sáng, bản Tối phẳng
      shadowColor: isDark ? 'transparent' : tokens.shadowColor,
      shadowOpacity: isDark ? 0 : tokens.shadowOpacity,
      shadowRadius: isDark ? 0 : 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: isDark ? 0 : 2,
    },
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
  container: {
    borderRadius: Radii.xl, // 20px
    overflow: 'hidden',
  },
});
