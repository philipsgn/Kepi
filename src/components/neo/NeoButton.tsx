import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { NeoShadow } from './NeoShadow';

type NeoButtonVariant = 'cream' | 'dark' | 'gold' | 'round';

interface NeoButtonProps {
  variant?: NeoButtonVariant;
  title?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const NeoButton: React.FC<NeoButtonProps> = ({
  variant = 'cream',
  title,
  icon,
  onPress,
  disabled = false,
  style,
  textStyle,
  children,
  containerStyle,
}) => {
  const { tokens } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const depth = isPressed ? 1 : 3;
  const translateY = isPressed ? 2 : 0;

  // Background and Text color mapping according to STYLE_HEOCON.md
  let backgroundColor = tokens.surface || '#FFFBF1';
  let textColor = tokens.text || '#2B2118';

  if (variant === 'dark') {
    backgroundColor = tokens.border || '#2B2118';
    textColor = tokens.bg || '#F6EEDC';
  } else if (variant === 'gold') {
    backgroundColor = tokens.primary || '#F4B93B';
    textColor = tokens.textOnPrimary || '#2B2118';
  }

  const isRound = variant === 'round';
  const radius = isRound ? 22 : 999;

  return (
    <Pressable
      disabled={disabled}
      onPressIn={() => {
        if (!disabled) {
          setIsPressed(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
      }}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      style={[{ opacity: disabled ? 0.5 : 1 }, containerStyle]}
    >
      <NeoShadow
        depth={depth}
        radius={radius}
        color={tokens.border || '#2B2118'}
      >
        <View
          style={[
            styles.base,
            isRound ? styles.round : styles.pill,
            {
              backgroundColor,
              borderColor: tokens.border || '#2B2118',
              borderRadius: radius,
              transform: [{ translateY }],
            },
            style,
          ]}
        >
          {icon}
          {title ? (
            <Text
              style={[
                styles.text,
                {
                  color: textColor,
                  marginLeft: icon ? 6 : 0,
                },
                textStyle,
              ]}
            >
              {title}
            </Text>
          ) : null}
          {children}
        </View>
      </NeoShadow>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  round: {
    width: 44,
    height: 44,
    padding: 0,
  },
  text: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Platform.select({
      ios: 'Nunito-ExtraBold',
      android: 'Nunito_800ExtraBold',
      default: 'system-ui',
    }),
  },
});
