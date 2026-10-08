import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { formatCompactVND } from '../../utils/currency';

export type PriceTagVariant = 'dark' | 'yellow' | 'green' | 'accent' | 'default' | 'surface';

export interface PriceTagProps {
  amountStr?: string;
  amount?: number;
  variant?: PriceTagVariant;
  color?: PriceTagVariant;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  amountStr,
  amount,
  variant,
  color,
  size = 'md',
  style,
}) => {
  const { tokens } = useTheme();
  const chosenVariant = color || variant || 'dark';
  const displayAmount = amountStr || (amount !== undefined ? formatCompactVND(amount) : '0đ');

  const getStyleForVariant = () => {
    switch (chosenVariant) {
      case 'yellow':
      case 'accent':
        return {
          backgroundColor: tokens.primary,
          borderColor: 'rgba(0, 0, 0, 0.1)',
          textColor: '#1B2733',
        };
      case 'green':
        return {
          backgroundColor: tokens.successSoft,
          borderColor: tokens.success,
          textColor: tokens.success,
        };
      case 'surface':
        return {
          backgroundColor: tokens.surfaceAlt,
          borderColor: tokens.border,
          textColor: tokens.text,
        };
      case 'dark':
      default:
        return {
          backgroundColor: 'rgba(14, 22, 32, 0.78)',
          borderColor: 'rgba(255, 255, 255, 0.18)',
          textColor: '#FAF6EC',
        };
    }
  };

  const { backgroundColor, borderColor, textColor } = getStyleForVariant();

  const getFontSize = () => {
    if (size === 'sm') return 11;
    if (size === 'lg') return 15;
    return 13;
  };

  const getPadding = () => {
    if (size === 'sm') return { paddingVertical: 2, paddingHorizontal: 7 };
    if (size === 'lg') return { paddingVertical: 6, paddingHorizontal: 12 };
    return { paddingVertical: 4, paddingHorizontal: 9 };
  };

  return (
    <View
      style={[
        styles.tagContainer,
        {
          backgroundColor,
          borderColor,
        },
        getPadding(),
        style,
      ]}
    >
      <Text
        style={[
          styles.amountText,
          {
            color: textColor,
            fontSize: getFontSize(),
          },
        ]}
      >
        {displayAmount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tagContainer: {
    borderRadius: radii.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountText: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
});
