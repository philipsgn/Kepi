import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { useTheme } from '../../theme';

interface OverlineLabelProps {
  text: string;
  style?: StyleProp<TextStyle>;
}

export const OverlineLabel: React.FC<OverlineLabelProps> = ({ text, style }) => {
  const { tokens } = useTheme();

  return (
    <Text
      style={[
        styles.label,
        { color: tokens.textMuted || '#7A6852' },
        style,
      ]}
    >
      {text.toUpperCase()}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2, // 0.16em tương đương
    fontFamily: Platform.select({
      ios: 'Nunito-ExtraBold',
      android: 'Nunito_800ExtraBold',
      default: 'system-ui',
    }),
    marginBottom: 6,
  },
});
