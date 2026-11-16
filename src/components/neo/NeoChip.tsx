import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { NeoShadow } from './NeoShadow';

interface NeoChipProps {
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const NeoChip: React.FC<NeoChipProps> = ({
  label,
  subLabel,
  icon,
  onPress,
  style,
  containerStyle,
}) => {
  const { tokens } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const depth = isPressed ? 1 : 3;
  const translateY = isPressed ? 2 : 0;

  return (
    <Pressable
      onPressIn={() => {
        setIsPressed(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }}
      onPressOut={() => setIsPressed(false)}
      onPress={onPress}
      style={containerStyle}
    >
      <NeoShadow depth={depth} radius={18} color={tokens.border || '#2B2118'}>
        <View
          style={[
            styles.chip,
            {
              backgroundColor: tokens.surface || '#FFFBF1',
              borderColor: tokens.border || '#2B2118',
              transform: [{ translateY }],
            },
            style,
          ]}
        >
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <View style={styles.textContainer}>
            <Text style={[styles.label, { color: tokens.text || '#2B2118' }]}>
              {label}
            </Text>
            {subLabel ? (
              <Text
                style={[
                  styles.subLabel,
                  { color: tokens.textMuted || '#7A6852' },
                ]}
              >
                {subLabel}
              </Text>
            ) : null}
          </View>
        </View>
      </NeoShadow>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderWidth: 3,
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    zIndex: 1,
  },
  iconContainer: {
    marginRight: 6,
  },
  textContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: Platform.select({
      ios: 'Nunito-ExtraBold',
      android: 'Nunito_800ExtraBold',
      default: 'system-ui',
    }),
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'Nunito-Bold',
      android: 'Nunito_700Bold',
      default: 'system-ui',
    }),
    fontVariant: ['tabular-nums'],
  },
});
