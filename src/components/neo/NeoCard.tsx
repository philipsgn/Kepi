import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { NeoShadow } from './NeoShadow';

interface NeoCardProps {
  radius?: number;
  overlap?: boolean;
  isPressable?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  depth?: 3 | 4;
}

export const NeoCard: React.FC<NeoCardProps> = ({
  radius = 26,
  overlap = false,
  isPressable = false,
  onPress,
  children,
  style,
  containerStyle,
  depth = 4,
}) => {
  const { tokens } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const activeDepth = isPressed ? 1 : depth;
  const translateY = isPressed ? depth - 1 : 0;

  const cardContent = (
    <View
      style={[
        styles.cardBase,
        {
          borderRadius: radius,
          borderColor: tokens.border || '#2B2118',
          backgroundColor: tokens.surface || '#FFFBF1',
          transform: [{ translateY }],
        },
        overlap && styles.overlapCard,
        style,
      ]}
    >
      {children}
    </View>
  );

  const wrapped = (
    <NeoShadow
      depth={activeDepth as 3 | 4 | 2 | 1}
      radius={radius}
      color={tokens.border || '#2B2118'}
      containerStyle={[overlap && styles.overlapContainer, containerStyle]}
    >
      {cardContent}
    </NeoShadow>
  );

  if (isPressable && onPress) {
    return (
      <Pressable
        onPressIn={() => {
          setIsPressed(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }}
        onPressOut={() => setIsPressed(false)}
        onPress={onPress}
      >
        {wrapped}
      </Pressable>
    );
  }

  return wrapped;
};

const styles = StyleSheet.create({
  cardBase: {
    borderWidth: 3,
    overflow: 'hidden',
    zIndex: 1,
  },
  overlapContainer: {
    marginTop: -22,
    marginHorizontal: 8,
    zIndex: 2,
  },
  overlapCard: {
    // Styling specifics for card when overlapping
  },
});
