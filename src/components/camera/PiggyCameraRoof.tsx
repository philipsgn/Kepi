import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

export interface PiggyCameraRoofProps {
  isShooting?: boolean;
  onPigTap?: () => void;
}

// Bảng màu chuẩn từ prototype Camera_heo_con.html
const PAL = {
  o: '#4B2B21', // Viền nâu mực
  p: '#F9B8C4', // Thân heo hồng phấn
  s: '#EE90A6', // Má hồng / bóng
  n: '#F08DA4', // Mõm heo
  h: '#FFE3E8', // Mảng sáng highlight
  k: '#2B2118', // Mắt & lỗ mũi
  g: '#F4B93B', // Vòng cổ chuông vàng
  w: '#FFFFFF', // Trắng
};

/**
 * Ma trận pixel 24x20 biểu diễn chú heo nằm ngủ hoặc đứng mừng (port 1:1 từ drawPigSprite prototype)
 */
function getPigBodyMatrix(isHappy: boolean): (string | null)[][] {
  const m: (string | null)[][] = Array(20).fill(null).map(() => Array(24).fill(null));

  const r = (x: number, y: number, w: number, h: number, col: string) => {
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        if (y + j >= 0 && y + j < 20 && x + i >= 0 && x + i < 24) {
          m[y + j][x + i] = col;
        }
      }
    }
  };

  if (!isHappy) {
    // === CHÚ HEO NẰM NGỦ NGOAN TRÊN NÓC MÁY ẢNH (POSE: SLEEP) ===
    r(3, 8, 14, 8, PAL.p);
    r(5, 7, 10, 1, PAL.p);
    r(4, 16, 12, 1, PAL.s);
    r(6, 10, 3, 1, PAL.h);

    r(1, 10, 2, 2, PAL.p);
    r(2, 9, 2, 1, PAL.o);

    r(4, 15, 3, 2, PAL.s);
    r(12, 15, 3, 2, PAL.s);

    r(13, 8, 8, 7, PAL.p);
    r(14, 7, 5, 1, PAL.p);
    r(15, 6, 3, 1, PAL.s);
    r(15, 7, 2, 1, PAL.p);

    r(20, 10, 3, 3, PAL.n);
    r(21, 11, 1, 1, PAL.k);

    r(17, 10, 2, 1, PAL.k);
    r(18, 12, 2, 1, PAL.s);

    r(13, 13, 2, 2, PAL.g);
  } else {
    // === CHÚ HEO NHẢY CẪNG VUI MỪNG KHI BẤM CHỤP (POSE: HAPPY JUMP) ===
    r(3, 14, 2, 4, PAL.p);
    r(7, 14, 2, 4, PAL.p);
    r(10, 14, 2, 4, PAL.s);
    r(14, 14, 2, 4, PAL.s);

    r(3, 6, 13, 8, PAL.p);
    r(5, 5, 9, 1, PAL.p);
    r(5, 8, 3, 1, PAL.h);

    r(1, 7, 2, 2, PAL.p);

    r(13, 5, 8, 8, PAL.p);
    r(14, 3, 3, 2, PAL.s);
    r(19, 7, 3, 3, PAL.n);
    r(20, 8, 1, 1, PAL.k);

    r(16, 7, 2, 1, PAL.k);
    r(15, 8, 1, 1, PAL.k);
    r(17, 8, 1, 1, PAL.k);
    r(17, 10, 2, 1, PAL.s);

    r(13, 12, 2, 2, PAL.g);
  }

  const bordered: (string | null)[][] = Array(20).fill(null).map(() => Array(24).fill(null));
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 24; x++) {
      if (m[y][x]) {
        bordered[y][x] = m[y][x];
      } else {
        const hasNeighbor =
          (x > 0 && m[y][x - 1]) ||
          (x < 23 && m[y][x + 1]) ||
          (y > 0 && m[y - 1][x]) ||
          (y < 19 && m[y + 1][x]);
        if (hasNeighbor) {
          bordered[y][x] = PAL.o;
        }
      }
    }
  }

  return bordered;
}

export const PiggyCameraRoof: React.FC<PiggyCameraRoofProps> = ({
  isShooting = false,
  onPigTap,
}) => {
  const breathAnim = useRef(new Animated.Value(0)).current;
  const zzz1Anim = useRef(new Animated.Value(0)).current;
  const zzz2Anim = useRef(new Animated.Value(0)).current;
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: -2,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breathAnim]);

  useEffect(() => {
    const z1 = Animated.loop(
      Animated.timing(zzz1Anim, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const z2 = Animated.loop(
      Animated.sequence([
        Animated.delay(1100),
        Animated.timing(zzz2Anim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    z1.start();
    z2.start();
    return () => {
      z1.stop();
      z2.stop();
    };
  }, [zzz1Anim, zzz2Anim]);

  useEffect(() => {
    if (isShooting) {
      Animated.parallel([
        Animated.sequence([
          Animated.timing(jumpAnim, {
            toValue: -14,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(jumpAnim, {
            toValue: 0,
            duration: 350,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(heartAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(heartAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isShooting, jumpAnim, heartAnim]);

  const matrix = getPigBodyMatrix(isShooting);
  const PIXEL_SCALE = 2.4;

  const handleTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(jumpAnim, {
        toValue: -8,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(jumpAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
    ]).start();
    onPigTap?.();
  };

  return (
    <View style={styles.roofWrapper}>
      {!isShooting && (
        <View style={styles.zzzContainer} pointerEvents="none">
          <Animated.Text
            style={[
              styles.zzzText,
              {
                opacity: zzz1Anim.interpolate({
                  inputRange: [0, 0.2, 0.8, 1],
                  outputRange: [0, 0.9, 0.6, 0],
                }),
                transform: [
                  {
                    translateY: zzz1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -22],
                    }),
                  },
                  {
                    translateX: zzz1Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 8],
                    }),
                  },
                ],
              },
            ]}
          >
            z
          </Animated.Text>
          <Animated.Text
            style={[
              styles.zzzText,
              styles.zzzBig,
              {
                opacity: zzz2Anim.interpolate({
                  inputRange: [0, 0.2, 0.8, 1],
                  outputRange: [0, 1, 0.7, 0],
                }),
                transform: [
                  {
                    translateY: zzz2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -28],
                    }),
                  },
                  {
                    translateX: zzz2Anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 14],
                    }),
                  },
                ],
              },
            ]}
          >
            Z
          </Animated.Text>
        </View>
      )}

      <Animated.View
        style={[
          styles.heartFloating,
          {
            opacity: heartAnim,
            transform: [
              {
                translateY: heartAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -26],
                }),
              },
              {
                scale: heartAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.5, 1.2, 1],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={{ fontSize: 18 }}>❤️</Text>
      </Animated.View>

      <TouchableOpacity activeOpacity={0.85} onPress={handleTap} style={styles.pigTouch}>
        <Animated.View
          style={{
            transform: [
              { translateY: isShooting ? jumpAnim : breathAnim },
            ],
          }}
        >
          <Svg width={24 * PIXEL_SCALE} height={20 * PIXEL_SCALE} viewBox="0 0 24 20">
            {matrix.map((row, y) =>
              row.map((col, x) =>
                col ? (
                  <Rect
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    width={1}
                    height={1}
                    fill={col}
                  />
                ) : null
              )
            )}
          </Svg>
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.cameraTopPlate}>
        <View style={styles.flashBulb} />
        <View style={styles.dialGold}>
          <View style={styles.dialGroove} />
        </View>
        <View style={styles.filmWinder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  roofWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: -6,
    zIndex: 10,
  },
  pigTouch: {
    zIndex: 2,
  },
  zzzContainer: {
    position: 'absolute',
    top: -12,
    right: '32%',
    zIndex: 5,
  },
  zzzText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 13,
    color: '#FFFBF1',
    textShadowColor: '#2B2118',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
    position: 'absolute',
  },
  zzzBig: {
    fontSize: 16,
    color: '#F4B93B',
    right: -8,
    top: -6,
  },
  heartFloating: {
    position: 'absolute',
    top: -14,
    left: '46%',
    zIndex: 6,
  },
  cameraTopPlate: {
    width: 176,
    height: 8,
    backgroundColor: '#F9B8C4',
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#2B2118',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    zIndex: 1,
  },
  flashBulb: {
    width: 16,
    height: 5,
    backgroundColor: '#FFF08A',
    borderWidth: 1.5,
    borderColor: '#2B2118',
    borderRadius: 3,
  },
  dialGold: {
    width: 36,
    height: 5,
    backgroundColor: '#F4B93B',
    borderWidth: 1.5,
    borderColor: '#2B2118',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialGroove: {
    width: 18,
    height: 1.5,
    backgroundColor: '#2B2118',
  },
  filmWinder: {
    width: 14,
    height: 5,
    backgroundColor: '#E8D6B4',
    borderWidth: 1.5,
    borderColor: '#2B2118',
    borderRadius: 3,
  },
});
