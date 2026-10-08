import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { formatVND } from '../../utils/currency';

interface AutumnCelebrationProps {
  visible: boolean;
  savedAmount: number;
  onFinish?: () => void;
}

const PARTICLES = [
  { id: 1, char: '🍃', left: '15%', delay: 0 },
  { id: 2, char: '🌼', left: '35%', delay: 150 },
  { id: 3, char: '🍂', left: '55%', delay: 80 },
  { id: 4, char: '✨', left: '75%', delay: 200 },
  { id: 5, char: '🌼', left: '85%', delay: 300 },
  { id: 6, char: '🍃', left: '25%', delay: 250 },
];

export const AutumnCelebration: React.FC<AutumnCelebrationProps> = ({
  visible,
  savedAmount,
  onFinish,
}) => {
  const bannerOpacity = useSharedValue(0);
  const bannerScale = useSharedValue(0.7);

  useEffect(() => {
    if (visible) {
      bannerOpacity.value = withTiming(1, { duration: 300 });
      bannerScale.value = withTiming(1, { duration: 400 });

      const timer = setTimeout(() => {
        bannerOpacity.value = withTiming(0, { duration: 300 });
        if (onFinish) onFinish();
      }, 2500);

      return () => clearTimeout(timer);
    } else {
      bannerOpacity.value = 0;
      bannerScale.value = 0.7;
    }
  }, [visible]);

  const bannerAnimStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
    transform: [{ scale: bannerScale.value }],
  }));

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {/* Các hạt lá vàng và hoa cúc rơi */}
      {PARTICLES.map((p) => (
        <ParticleItem key={p.id} char={p.char} left={p.left} delay={p.delay} />
      ))}

      {/* Banner ăn mừng ở giữa màn hình */}
      <Animated.View style={[styles.banner, bannerAnimStyle]}>
        <Text style={styles.celebrateEmoji}>🎉 🍃</Text>
        <Text style={[Typography.heading2, styles.bannerTitle]}>
          Ví Vừa Thở Phào!
        </Text>
        <Text style={[Typography.heroDisplay, styles.savedAmountText]}>
          +{formatVND(savedAmount)}
        </Text>
        <Text style={[Typography.bodyPoetic, styles.bannerSubtitle]}>
          "Đã cộng vào Tiền Đã Cứu tháng này. Tỉnh táo lắm bạn ơi!"
        </Text>
      </Animated.View>
    </View>
  );
};

const ParticleItem = ({
  char,
  left,
  delay,
}: {
  char: string;
  left: string;
  delay: number;
}) => {
  const translateY = useSharedValue(-50);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(650, { duration: 2200 })
    );
    opacity.value = withDelay(
      delay + 1600,
      withTiming(0, { duration: 600 })
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        styles.particle,
        { left: left as any },
        animStyle,
      ]}
    >
      {char}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    top: 0,
    fontSize: 28,
  },
  banner: {
    backgroundColor: 'rgba(250, 246, 240, 0.96)',
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.incomeMint,
    shadowColor: '#232723',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    marginHorizontal: 32,
  },
  celebrateEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  bannerTitle: {
    color: Colors.textCharcoal,
  },
  savedAmountText: {
    color: Colors.incomeMint,
    marginVertical: 6,
  },
  bannerSubtitle: {
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
