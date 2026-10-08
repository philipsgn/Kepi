import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Button, ButtonSize, ButtonVariant } from './Button';

interface BlockButtonProps {
  title?: string;
  label?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'cream' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

/**
 * BlockButton — Viết lại bên trong theo chuẩn mới "Ấm, tĩnh, sang"
 * Chuyển tiếp mượt mà sang component Button sang trọng bo góc 16px.
 */
export const BlockButton: React.FC<BlockButtonProps> = (props) => {
  return <Button {...props} />;
};
