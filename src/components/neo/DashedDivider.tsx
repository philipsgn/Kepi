import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface DashedDividerProps {
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const DashedDivider: React.FC<DashedDividerProps> = ({
  color = '#D9C9A4',
  style,
}) => {
  return (
    <View
      style={[
        styles.dashedLine,
        {
          borderColor: color,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dashedLine: {
    width: '100%',
    height: 1,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginVertical: 12,
  },
});
