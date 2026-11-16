import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface DongMarkProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const DongMark: React.FC<DongMarkProps> = ({
  size = 22,
  color,
  style,
  textStyle,
}) => {
  const { tokens } = useTheme();
  const markColor = color || tokens.text || '#2B2118';

  return (
    <View style={[styles.container, style]}>
      <Text
        style={[
          styles.text,
          {
            fontSize: size,
            color: markColor,
          },
          textStyle,
        ]}
      >
        đ
      </Text>
      <View
        style={[
          styles.underline,
          {
            backgroundColor: markColor,
            height: Math.max(2, Math.round(size * 0.12)),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 3,
    marginBottom: 4,
  },
  text: {
    fontWeight: '800',
    fontFamily: Platform.select({
      ios: 'Nunito-ExtraBold',
      android: 'Nunito_800ExtraBold',
      default: 'system-ui',
    }),
    lineHeight: undefined,
  },
  underline: {
    width: '100%',
    marginTop: 1,
    borderRadius: 1,
  },
});
