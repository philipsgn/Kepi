import React, { useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect, G } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

export type PigBoPose = 'welcome' | 'camera' | 'card' | 'wise' | 'happy';

interface PigBoMascotProps {
  pose?: PigBoPose;
  size?: number;
  onPress?: () => void;
  style?: any;
}

/**
 * LINH VẬT CHÚ HEO PIGBO (3D Clay Chibi Trắng Sứ / Tai Má Hồng Phấn)
 * - Phong cách: 3D Clay Chibi đất nặn mịn màng Pixar (Porcelain White & Pastel Pink)
 * - Hiệu ứng: Chạm vào nhún tưng tưng đàn hồi (Spring Animation) kèm Heavy Haptic
 * - Cực kỳ nhẹ (~15KB vector), 60fps mượt mà, không nóng máy, không hao pin
 */
export const PigBoMascot: React.FC<PigBoMascotProps> = ({
  pose = 'welcome',
  size = 64,
  onPress,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.86,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3.5,
        tension: 160,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[styles.container, style]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* 1. BÓNG ĐỔ DƯỚI ĐÁY */}
          <Ellipse cx="50" cy="88" rx="34" ry="7" fill="rgba(15, 47, 36, 0.12)" />

          {/* 2. THÂN HEO BÉO TRÒN TRẮNG SỨ */}
          <Circle cx="50" cy="52" r="36" fill="#FFFDF9" stroke="#E2E8F0" strokeWidth="2.5" />

          {/* 3. TAI HEO HỒNG PHẤN PASTEL DỄ THƯƠNG */}
          {/* Tai Trái */}
          <Path
            d="M26 28 C18 16 32 10 38 22 Z"
            fill="#FFD1DC"
            stroke="#FBCFE8"
            strokeWidth="2"
          />
          {/* Tai Phải */}
          <Path
            d="M74 28 C82 16 68 10 62 22 Z"
            fill="#FFD1DC"
            stroke="#FBCFE8"
            strokeWidth="2"
          />

          {/* 4. MŨI HEO HỒNG OVAL & 2 LỖ MŨI XINH */}
          <Ellipse cx="50" cy="58" rx="14" ry="10" fill="#FFB6C1" stroke="#F472B6" strokeWidth="1.8" />
          <Circle cx="45" cy="58" r="2.8" fill="#BE185D" />
          <Circle cx="55" cy="58" r="2.8" fill="#BE185D" />

          {/* 5. MẮT VÀ BIỂU CẢM THEO TỪNG POSE */}
          {pose === 'wise' ? (
            // Dáng Thông Thái: Đeo Kính Tròn Vàng
            <G>
              {/* Kính mắt tròn */}
              <Circle cx="36" cy="45" r="9" fill="rgba(255, 255, 255, 0.4)" stroke="#E59844" strokeWidth="2.2" />
              <Circle cx="64" cy="45" r="9" fill="rgba(255, 255, 255, 0.4)" stroke="#E59844" strokeWidth="2.2" />
              <Path d="M45 45 L55 45" stroke="#E59844" strokeWidth="2.2" />
              {/* Tròng mắt sáng thông tuệ */}
              <Circle cx="36" cy="45" r="3.2" fill="#0F2F24" />
              <Circle cx="64" cy="45" r="3.2" fill="#0F2F24" />
              <Circle cx="37" cy="43.5" r="1.2" fill="#FFFFFF" />
              <Circle cx="65" cy="43.5" r="1.2" fill="#FFFFFF" />
            </G>
          ) : pose === 'camera' ? (
            // Dáng Nằm Gác Cằm Trên Camera: Mắt Cười Cong Tít Tắp
            <G>
              <Path d="M30 46 Q36 39 42 46" stroke="#0F2F24" strokeWidth="3" strokeLinecap="round" fill="none" />
              <Path d="M58 46 Q64 39 70 46" stroke="#0F2F24" strokeWidth="3" strokeLinecap="round" fill="none" />
              {/* 2 Tay bé gác lên mép */}
              <Ellipse cx="32" cy="74" rx="8" ry="5" fill="#FFFDF9" stroke="#E2E8F0" strokeWidth="1.8" />
              <Ellipse cx="68" cy="74" rx="8" ry="5" fill="#FFFDF9" stroke="#E2E8F0" strokeWidth="1.8" />
            </G>
          ) : (
            // Dáng Vẫy Chào & Mặc Định: Mắt Tròn Long Lanh + Má Hồng
            <G>
              <Circle cx="36" cy="45" r="4.2" fill="#0F2F24" />
              <Circle cx="64" cy="45" r="4.2" fill="#0F2F24" />
              <Circle cx="37.5" cy="43.5" r="1.5" fill="#FFFFFF" />
              <Circle cx="65.5" cy="43.5" r="1.5" fill="#FFFFFF" />
              {/* Tay vẫy chào bên phải nếu là welcome */}
              {pose === 'welcome' && (
                <Path d="M80 50 Q92 36 84 30 Q76 34 76 44 Z" fill="#FFFDF9" stroke="#E2E8F0" strokeWidth="2" />
              )}
            </G>
          )}

          {/* 6. MÁ HỒNG PHẤN BLUSH NỞ NỤ CƯỜI */}
          <Ellipse cx="27" cy="54" rx="5" ry="3.5" fill="rgba(244, 114, 182, 0.45)" />
          <Ellipse cx="73" cy="54" rx="5" ry="3.5" fill="rgba(244, 114, 182, 0.45)" />

          {/* 7. KHE NHÉT TIỀN TRÊN LƯNG (ĐẶC TRƯNG HEO ĐẤT) */}
          <Rect x="44" y="20" width="12" height="3" rx="1.5" fill="#94A3B8" />
        </Svg>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
