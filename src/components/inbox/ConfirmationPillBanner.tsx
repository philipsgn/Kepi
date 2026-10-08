import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Inbox, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeContext';

interface ConfirmationPillBannerProps {
  count: number;
  onPress: () => void;
  style?: object;
}

export const ConfirmationPillBanner: React.FC<ConfirmationPillBannerProps> = ({
  count,
  onPress,
  style,
}) => {
  const { isDark } = useTheme();

  if (count <= 0) return null;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[
        styles.pillContainer,
        {
          backgroundColor: isDark ? 'rgba(26, 36, 51, 0.92)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: isDark ? 'rgba(229, 152, 68, 0.40)' : 'rgba(229, 152, 68, 0.45)',
          shadowColor: Colors.primaryYellow,
        },
        style,
      ]}
    >
      {/* Icon with glowing notification dot */}
      <View style={styles.iconWrapper}>
        <Inbox size={16} color={Colors.primaryYellow} strokeWidth={2.4} />
        <View style={styles.glowDot} />
      </View>

      {/* Label with count */}
      <Text style={[styles.pillText, { color: isDark ? '#FAF6EC' : '#141D26' }]}>
        <Text style={styles.countText}>{count}</Text> khoản cần xác nhận
      </Text>

      {/* Trailing chevron */}
      <ChevronRight
        size={14}
        color={isDark ? '#8C9DAC' : '#65778B'}
        strokeWidth={2.2}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    marginVertical: 4,
  },
  iconWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  glowDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryYellow,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
    letterSpacing: -0.2,
  },
  countText: {
    color: Colors.primaryYellow,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
