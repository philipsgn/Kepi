import React from 'react';
import { ViewStyle } from 'react-native';
import { ProgressBar } from './ProgressBar';

interface DiscreteHealthBarProps {
  spent: number;
  totalBudget: number;
  style?: ViewStyle;
}

/**
 * DiscreteHealthBar — Chuyển tiếp mượt sang ProgressBar mảnh 8px chuẩn mới
 */
export const DiscreteHealthBar: React.FC<DiscreteHealthBarProps> = ({
  spent,
  totalBudget,
  style,
}) => {
  return (
    <ProgressBar
      spent={spent}
      totalBudget={totalBudget}
      height={8}
      style={style}
    />
  );
};
