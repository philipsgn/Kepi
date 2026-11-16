import React from 'react';
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

interface NeoJarProps {
  title: string;
  amount: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export const NeoJar: React.FC<NeoJarProps> = ({
  title,
  amount,
  icon,
  iconBgColor = '#FCE7F3',
  onPress,
  style,
  containerStyle,
}) => {
  const { tokens } = useTheme();

  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onPress();
        }
      }}
      style={[{ flex: 1 }, containerStyle]}
    >
      <NeoShadow depth={3} radius={20} color={tokens.border || '#2B2118'}>
        <View
          style={[
            styles.jar,
            {
              backgroundColor: tokens.surface || '#FFFBF1',
              borderColor: tokens.border || '#2B2118',
            },
            style,
          ]}
        >
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: iconBgColor,
                borderColor: tokens.border || '#2B2118',
              },
            ]}
          >
            {icon}
          </View>
          <Text style={[styles.title, { color: tokens.textMuted || '#7A6852' }]}>
            {title}
          </Text>
          <Text style={[styles.amount, { color: tokens.text || '#2B2118' }]}>
            {amount}
          </Text>
        </View>
      </NeoShadow>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  jar: {
    borderWidth: 3,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    zIndex: 1,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.select({
      ios: 'Nunito-Bold',
      android: 'Nunito_700Bold',
      default: 'system-ui',
    }),
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    fontFamily: Platform.select({
      ios: 'Baloo2-ExtraBold',
      android: 'Baloo2_800ExtraBold',
      default: 'system-ui',
    }),
  },
});
