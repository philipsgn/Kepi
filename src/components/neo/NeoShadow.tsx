import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface NeoShadowProps {
  depth?: 3 | 4 | 2 | 1;
  radius?: number;
  color?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const NeoShadow: React.FC<NeoShadowProps> = ({
  depth = 3,
  radius = 16,
  color,
  children,
  style,
  containerStyle,
}) => {
  const { tokens } = useTheme();
  const shadowColor = color || tokens.border || '#2B2118';

  if (Platform.OS === 'ios') {
    return (
      <View
        style={[
          {
            shadowColor,
            shadowOffset: { width: 0, height: depth },
            shadowRadius: 0,
            shadowOpacity: 1,
            borderRadius: radius,
          },
          containerStyle,
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // Android & Web: Fake shadow layer ensuring pixel-perfect 0-blur hard offset
  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.fakeShadow,
          {
            backgroundColor: shadowColor,
            borderRadius: radius,
            top: depth,
            bottom: -depth,
          },
        ]}
      />
      <View style={[{ borderRadius: radius }, style]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  fakeShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 0,
  },
});
