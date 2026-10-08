import React from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import { Radii } from '../../theme/tokens';

export interface ProgressBarProps {
  spent?: number;
  totalBudget?: number;
  progress?: number; // 0 to 1
  height?: number;
  style?: StyleProp<ViewStyle>;
  customColor?: string;
  isOverBudget?: boolean;
}

/**
 * Thanh tiến độ — Phiên bản "Ấm, tĩnh, sang"
 * Tuân thủ mục 3 & 4 của đặc tả:
 * - Mảnh 8px, bo tròn viên thuốc 999px (Radii.full)
 * - Màu vàng chính primary khi trong hạn mức
 * - Đổi sang đỏ trầm danger khi vượt ngân sách
 * - Thay thế hoàn toàn cho 10 ô đen khối cũ
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  spent = 0,
  totalBudget = 0,
  progress,
  height = 8,
  style,
  customColor,
  isOverBudget,
}) => {
  const { tokens } = useTheme();

  // Tính tỷ lệ tiến độ
  let ratio = 0;
  if (progress !== undefined) {
    ratio = Math.min(1, Math.max(0, progress));
  } else if (totalBudget > 0) {
    ratio = Math.min(1, Math.max(0, spent / totalBudget));
  }

  const isOver = isOverBudget !== undefined ? isOverBudget : totalBudget > 0 && spent > totalBudget;

  const getFillColor = () => {
    if (customColor) return customColor;
    if (isOver) return tokens.danger;
    return tokens.primary;
  };

  const percentage = Math.round(ratio * 100);

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: tokens.surfaceAlt,
          borderRadius: Radii.full,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${percentage}%`,
            backgroundColor: getFillColor(),
            borderRadius: Radii.full,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: {
    height: '100%',
  },
});
