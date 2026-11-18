import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

export interface PixelSkySunCloudProps {
  style?: any;
}

/**
 * PixelSkySunCloud - Bầu trời mộng mơ với Mặt Trời Ánh Nắng & Mây Pixel Art
 * - Bảng màu: Vàng cám #F4B93B, Vàng nắng #FFE072, Trắng sữa #FFFBF1, Xanh mây #D0E4F5
 * - Hoạt họa mây pixel bồng bềnh êm dịu, không giật lag
 */
export const PixelSkySunCloud: React.FC<PixelSkySunCloudProps> = ({ style }) => {
  const cloudAnim1 = useRef(new Animated.Value(0)).current;
  const cloudAnim2 = useRef(new Animated.Value(0)).current;
  const sunPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Mây 1 trôi chậm từ trái qua phải
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudAnim1, {
          toValue: 12,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(cloudAnim1, {
          toValue: -8,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Mây 2 trôi ngược chiều nhẹ
    Animated.loop(
      Animated.sequence([
        Animated.timing(cloudAnim2, {
          toValue: -10,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(cloudAnim2, {
          toValue: 10,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Nắng mặt trời nhịp thở nhẹ nhàng
    Animated.loop(
      Animated.sequence([
        Animated.timing(sunPulse, {
          toValue: 1.06,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sunPulse, {
          toValue: 1.0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      {/* 1. MẶT TRỜI PIXEL ART GÓC TRÁI (16x16 pixel) */}
      <Animated.View
        style={[
          styles.sunWrapper,
          {
            transform: [{ scale: sunPulse }],
          },
        ]}
      >
        <Svg width={40} height={40} viewBox="0 0 16 16">
          {/* Tia nắng 4 phía */}
          <Rect x={7} y={0} width={2} height={2} fill="#F4B93B" />
          <Rect x={7} y={14} width={2} height={2} fill="#F4B93B" />
          <Rect x={0} y={7} width={2} height={2} fill="#F4B93B" />
          <Rect x={14} y={7} width={2} height={2} fill="#F4B93B" />

          {/* Tia nắng chéo */}
          <Rect x={2} y={2} width={2} height={2} fill="#FFE072" />
          <Rect x={12} y={2} width={2} height={2} fill="#FFE072" />
          <Rect x={2} y={12} width={2} height={2} fill="#FFE072" />
          <Rect x={12} y={12} width={2} height={2} fill="#FFE072" />

          {/* Thân mặt trời tròn pixel */}
          <Rect x={4} y={3} width={8} height={10} fill="#F4B93B" />
          <Rect x={3} y={4} width={10} height={8} fill="#F4B93B" />

          {/* Lớp sáng highlight bên trong */}
          <Rect x={5} y={4} width={6} height={7} fill="#FFF08A" />
          <Rect x={4} y={5} width={8} height={5} fill="#FFF08A" />

          {/* Điểm sáng trắng */}
          <Rect x={5} y={5} width={2} height={2} fill="#FFFFFF" />
        </Svg>
      </Animated.View>

      {/* 2. ĐÁM MÂY PIXEL LỚN (GÓC PHẢI) */}
      <Animated.View
        style={[
          styles.cloudBigWrapper,
          {
            transform: [{ translateX: cloudAnim1 }],
          },
        ]}
      >
        <Svg width={56} height={28} viewBox="0 0 28 14">
          {/* Bóng mây xanh nhạt dưới đáy */}
          <Rect x={2} y={10} width={24} height={4} fill="#C6DFF5" />
          <Rect x={4} y={12} width={20} height={2} fill="#AECFEA" />

          {/* Thân mây trắng sữa */}
          <Rect x={2} y={6} width={24} height={6} fill="#FFFBF1" />
          <Rect x={6} y={3} width={16} height={4} fill="#FFFBF1" />
          <Rect x={10} y={1} width={8} height={3} fill="#FFFBF1" />

          {/* Viền mực pixel nhẹ */}
          <Rect x={10} y={0} width={8} height={1} fill="#2B2118" opacity={0.65} />
          <Rect x={6} y={2} width={4} height={1} fill="#2B2118" opacity={0.65} />
          <Rect x={18} y={2} width={4} height={1} fill="#2B2118" opacity={0.65} />
          <Rect x={1} y={6} width={1} height={6} fill="#2B2118" opacity={0.65} />
          <Rect x={26} y={6} width={1} height={6} fill="#2B2118" opacity={0.65} />
          <Rect x={4} y={13} width={20} height={1} fill="#2B2118" opacity={0.65} />
        </Svg>
      </Animated.View>

      {/* 3. ĐÁM MÂY PIXEL NHỎ (TRUNG TÂM PHẢI) */}
      <Animated.View
        style={[
          styles.cloudSmallWrapper,
          {
            transform: [{ translateX: cloudAnim2 }],
          },
        ]}
      >
        <Svg width={36} height={18} viewBox="0 0 18 9">
          {/* Bóng mây */}
          <Rect x={2} y={7} width={14} height={2} fill="#C6DFF5" />

          {/* Thân mây */}
          <Rect x={2} y={4} width={14} height={4} fill="#FFFBF1" />
          <Rect x={5} y={2} width={8} height={3} fill="#FFFBF1" />
          <Rect x={7} y={1} width={4} height={2} fill="#FFFBF1" />

          {/* Viền pixel mờ */}
          <Rect x={7} y={0} width={4} height={1} fill="#2B2118" opacity={0.5} />
          <Rect x={1} y={4} width={1} height={4} fill="#2B2118" opacity={0.5} />
          <Rect x={16} y={4} width={1} height={4} fill="#2B2118" opacity={0.5} />
          <Rect x={3} y={8} width={12} height={1} fill="#2B2118" opacity={0.5} />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 12,
    right: 12,
    height: 54,
    zIndex: 1,
    overflow: 'visible',
  },
  sunWrapper: {
    position: 'absolute',
    left: 8,
    top: 2,
    shadowColor: '#F4B93B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  cloudBigWrapper: {
    position: 'absolute',
    right: 14,
    top: 4,
  },
  cloudSmallWrapper: {
    position: 'absolute',
    right: 80,
    top: 24,
  },
});
