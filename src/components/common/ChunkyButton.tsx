import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/layout';
import { Typography } from '../../constants/typography';

interface ChunkyButtonProps {
  title?: string;
  children?: React.ReactNode;
  onPress: () => void;
  variant?: 'gold' | 'mint' | 'coral' | 'purple' | 'neutral' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const ChunkyButton: React.FC<ChunkyButtonProps> = ({
  title,
  children,
  onPress,
  variant = 'gold',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  // Màu sắc theo biến thể
  const getColors = () => {
    switch (variant) {
      case 'mint':
        return {
          face: Colors.incomeMint,
          rim: '#5C7A5E',
          text: '#FFFFFF',
        };
      case 'coral':
        return {
          face: Colors.expenseCoral,
          rim: '#9B4E38',
          text: '#FFFFFF',
        };
      case 'purple':
        return {
          face: Colors.cozyPurple,
          rim: '#7D3C98',
          text: '#FFFFFF',
        };
      case 'neutral':
        return {
          face: '#FFFFFF',
          rim: 'rgba(0, 0, 0, 0.15)',
          text: Colors.textCharcoal,
        };
      case 'glass':
        return {
          face: 'rgba(255, 255, 255, 0.22)',
          rim: 'rgba(0, 0, 0, 0.25)',
          text: '#FFFFFF',
        };
      case 'gold':
      default:
        return {
          face: Colors.accentGold,
          rim: '#B87228',
          text: '#FFFFFF',
        };
    }
  };

  const colors = getColors();

  // Kích thước
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: Spacing.xs + 2,
          paddingHorizontal: Spacing.md,
          fontSize: 13,
          rimHeight: 3,
        };
      case 'lg':
        return {
          paddingVertical: Spacing.md + 2,
          paddingHorizontal: Spacing.xxl,
          fontSize: 16,
          rimHeight: 5,
        };
      case 'md':
      default:
        return {
          paddingVertical: Spacing.sm + 2,
          paddingHorizontal: Spacing.lg,
          fontSize: 14,
          rimHeight: 4,
        };
    }
  };

  const sizeStyle = getSizeStyles();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.outerContainer,
        {
          paddingBottom: isPressed ? 0 : sizeStyle.rimHeight,
          marginTop: isPressed ? sizeStyle.rimHeight : 0,
        },
        style,
      ]}
    >
      {/* Lớp Đáy / Gờ Nổi 3D (Rim Layer) */}
      <View
        style={[
          styles.rimBase,
          {
            backgroundColor: colors.rim,
            borderRadius: BorderRadius.chunky,
          },
        ]}
      />

      {/* Lớp Mặt Nổi 3D (Top Face Layer) */}
      <View
        style={[
          styles.faceLayer,
          {
            backgroundColor: colors.face,
            paddingVertical: sizeStyle.paddingVertical,
            paddingHorizontal: sizeStyle.paddingHorizontal,
            borderRadius: BorderRadius.chunky,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        {title ? (
          <Text
            style={[
              Typography.button,
              {
                color: colors.text,
                fontSize: sizeStyle.fontSize,
                fontWeight: '700',
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        ) : (
          children
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  rimBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  faceLayer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  iconWrapper: {
    marginRight: 6,
  },
});
