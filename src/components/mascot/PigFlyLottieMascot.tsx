import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import Svg, { Circle, Ellipse, Path, G } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { MascotMood } from '../../utils/gamification/rulesEngine';
import { useGamificationStore, SKINS_CATALOG } from '../../store/gamificationStore';

export interface PigFlyLottieMascotProps {
  mood?: MascotMood;
  size?: number;
  showBadge?: boolean;
  onPress?: () => void;
  style?: any;
}

/**
 * PIGFLY LOTTIE/VECTOR MASCOT (v4.0 Pop-Anime Edition)
 * - 4 Trạng Thái Cảm Xúc: FLYING_HIGH, CHILL, PANIC, STARVING
 * - Hiệu ứng Squishy Spring Physics nảy tưng khi chạm
 * - Đồng bộ trang phục Skin Cosmetics từ gamificationStore
 */
export const PigFlyLottieMascot: React.FC<PigFlyLottieMascotProps> = ({
  mood,
  size = 68,
  showBadge = false,
  onPress,
  style,
}) => {
  const storeMood = useGamificationStore((s) => s.mascotMood);
  const equippedSkinId = useGamificationStore((s) => s.equippedSkinId);
  const currentMood = mood || storeMood || 'CHILL';

  const equippedSkin = SKINS_CATALOG.find((s) => s.id === equippedSkinId);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Hiệu ứng bay bổng nhẹ nhàng lơ lửng (Floating Easing)
  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, [floatAnim]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3.2,
        tension: 180,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) onPress();
  };

  // Màu sắc & Biểu cảm theo Mood
  const isPanic = currentMood === 'PANIC';
  const isFlyingHigh = currentMood === 'FLYING_HIGH';
  const isStarving = currentMood === 'STARVING';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      style={[styles.container, style]}
    >
      <Animated.View
        style={{
          transform: [{ translateY: floatAnim }, { scale: scaleAnim }],
          alignItems: 'center',
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {/* 1. BÓNG ĐỔ DƯỚI ĐÁY */}
          <Ellipse cx="50" cy="88" rx="32" ry="6" fill="rgba(0, 0, 0, 0.12)" />

          {/* 2. CÁNH THIÊN THẦN VỖ BAY */}
          {/* Cánh Trái */}
          <Path
            d={
              isFlyingHigh
                ? 'M20 46 C6 30 10 18 26 34 Z'
                : 'M22 50 C12 40 14 32 26 42 Z'
            }
            fill={isFlyingHigh ? '#FDE047' : '#FFFFFF'}
            stroke="#F43F5E"
            strokeWidth="2"
          />
          {/* Cánh Phải */}
          <Path
            d={
              isFlyingHigh
                ? 'M80 46 C94 30 90 18 74 34 Z'
                : 'M78 50 C88 40 86 32 74 42 Z'
            }
            fill={isFlyingHigh ? '#FDE047' : '#FFFFFF'}
            stroke="#F43F5E"
            strokeWidth="2"
          />

          {/* 3. THÂN HEO BÉO TRÒN TRẮNG SỨ */}
          <Circle
            cx="50"
            cy="52"
            r="34"
            fill={isPanic ? '#FFF1F2' : isStarving ? '#F1F5F9' : '#FFFFFF'}
            stroke={isPanic ? '#E11D48' : '#F43F5E'}
            strokeWidth="2.5"
          />

          {/* 4. TAI HEO HỒNG PHẤN */}
          <Path d="M26 28 C18 16 32 10 38 22 Z" fill="#FDA4AF" stroke="#F43F5E" strokeWidth="2" />
          <Path d="M74 28 C82 16 68 10 62 22 Z" fill="#FDA4AF" stroke="#F43F5E" strokeWidth="2" />

          {/* 5. MŨI HEO TRÒN DỄ THƯƠNG */}
          <Ellipse cx="50" cy="56" rx="13" ry="9" fill="#FB7185" />
          <Circle cx="45" cy="56" r="2.2" fill="#881337" />
          <Circle cx="55" cy="56" r="2.2" fill="#881337" />

          {/* 6. MẮT HEO THEO TỪNG CẢM XÚC */}
          {isPanic ? (
            // Mắt hoảng hốt (X X)
            <G stroke="#E11D48" strokeWidth="2.4" strokeLinecap="round">
              <Path d="M35 40 L43 48" />
              <Path d="M43 40 L35 48" />
              <Path d="M57 40 L65 48" />
              <Path d="M65 40 L57 48" />
            </G>
          ) : isStarving ? (
            // Mắt đói bụng nhắm nghiền
            <G stroke="#64748B" strokeWidth="2.4" strokeLinecap="round">
              <Path d="M35 44 C38 48 42 48 45 44" fill="none" />
              <Path d="M55 44 C58 48 62 48 65 44" fill="none" />
            </G>
          ) : isFlyingHigh ? (
            // Mắt lấp lánh sao
            <G fill="#F59E0B">
              <Circle cx="40" cy="42" r="4" fill="#3B0713" />
              <Circle cx="38" cy="40" r="1.5" fill="#FFFFFF" />
              <Circle cx="60" cy="42" r="4" fill="#3B0713" />
              <Circle cx="58" cy="40" r="1.5" fill="#FFFFFF" />
            </G>
          ) : (
            // Mắt tròn xoe thư thái (CHILL)
            <G fill="#3B0713">
              <Circle cx="40" cy="44" r="3.2" />
              <Circle cx="60" cy="44" r="3.2" />
            </G>
          )}

          {/* 7. MÁ HỒNG CHIBI */}
          <Circle cx="30" cy="54" r="5" fill="rgba(251, 113, 133, 0.45)" />
          <Circle cx="70" cy="54" r="5" fill="rgba(251, 113, 133, 0.45)" />

          {/* 8. GIỌT MỒ HÔI KHI PANIC */}
          {isPanic ? (
            <Path
              d="M72 32 C74 28 78 30 76 35 C74 37 70 36 72 32 Z"
              fill="#38BDF8"
            />
          ) : null}

          {/* 9. HÀO QUANG KHI FLYING HIGH */}
          {isFlyingHigh ? (
            <Ellipse
              cx="50"
              cy="16"
              rx="16"
              ry="4"
              fill="none"
              stroke="#FACC15"
              strokeWidth="2.2"
            />
          ) : null}
        </Svg>

        {/* Skin Icon Badge if equipped non-default */}
        {equippedSkin && equippedSkin.id !== 'skin_default' ? (
          <View style={styles.skinBadge}>
            <Text style={styles.skinBadgeText}>{equippedSkin.icon}</Text>
          </View>
        ) : null}

        {/* Mood Label Badge */}
        {showBadge ? (
          <View
            style={[
              styles.moodBadge,
              isPanic
                ? styles.panicBadge
                : isFlyingHigh
                ? styles.highBadge
                : isStarving
                ? styles.starveBadge
                : styles.chillBadge,
            ]}
          >
            <Text style={styles.moodBadgeText}>
              {isPanic
                ? '🚨 Bội chi'
                : isFlyingHigh
                ? '✨ Bay cao'
                : isStarving
                ? '🍼 Đói bụng'
                : '🍃 Thư thái'}
            </Text>
          </View>
        ) : null}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  skinBadge: {
    position: 'absolute',
    top: -4,
    right: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
  },
  skinBadgeText: {
    fontSize: 14,
  },
  moodBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  panicBadge: {
    backgroundColor: '#FFE4E6',
  },
  highBadge: {
    backgroundColor: '#FEF3C7',
  },
  starveBadge: {
    backgroundColor: '#E2E8F0',
  },
  chillBadge: {
    backgroundColor: '#E0F2FE',
  },
  moodBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
});
