import React from 'react';
import { ViewStyle } from 'react-native';
import { Chip } from './Chip';

interface BlockChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: 'yellow' | 'dark' | 'cream' | 'green' | 'red' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

/**
 * BlockChip — Chuyển tiếp mượt sang Chip chuẩn "Ấm, tĩnh, sang"
 */
export const BlockChip: React.FC<BlockChipProps> = ({
  label,
  selected = false,
  onPress,
  color,
  size = 'md',
  style,
}) => {
  const getStatusDot = () => {
    if (color === 'green') return 'success';
    if (color === 'red') return 'danger';
    if (color === 'yellow') return 'primary';
    return undefined;
  };

  return (
    <Chip
      label={label}
      selected={selected}
      onPress={onPress}
      size={size}
      statusDot={getStatusDot()}
      style={style}
    />
  );
};
