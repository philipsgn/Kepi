import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

export interface ViewfinderCornerMascotProps {
  isHappy?: boolean;
  dateText?: string;
  onPigTap?: () => void;
}

const PAL = {
  o: '#4B2B21',
  p: '#F9B8C4',
  s: '#EE90A6',
  n: '#F08DA4',
  h: '#FFE3E8',
  k: '#2B2118',
  g: '#F4B93B',
  w: '#FFFFFF',
};

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
    // POSE: SLEEP (Heo ngủ ngoan góc khung hình)
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
    // POSE: HAPPY JUMP (Heo nhảy cẫng thả tim)
    r(3, 14, 2, 4, PAL.p);
    r(7, 14, 2, 4, PAL.p);
    r(10, 14, 2, 4, PAL.s);
    r(14, 14, 2, 4, PAL.s);
    r(2, 6, 15, 9, PAL.p);
    r(4, 4, 11, 2, PAL.p);
    r(3, 13, 13, 2, PAL.s);
    r(15, 5, 7, 8, PAL.p);
    r(16, 4, 5, 2, PAL.p);
    r(16, 3, 3, 1, PAL.s);
    r(20, 8, 3, 3, PAL.n);
    r(21, 9, 1, 1, PAL.k);
    r(17, 7, 2, 2, PAL.k);
    r(17, 7, 1, 1, PAL.w);
    r(18, 10, 2, 1, PAL.s);
    r(15, 11, 2, 2, PAL.g);
  }

  return m;
}

export const ViewfinderCornerMascot: React.FC<ViewfinderCornerMascotProps> = ({
  isHappy = false,
  dateText,
  onPigTap,
}) => {
  const flashAnim = useRef(new Animated.Value(1)).current;
  const zzzAnim = useRef(new Animated.Value(0)).current;
  const jumpAnim = useRef(new Animated.Value(0)).current;

  // Ngày mặc định YY.MM.DD
  const formattedDate = dateText || (() => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(d.getFullYear() % 100)}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
  })();

  // Chấm đỏ REC nhấp nháy
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 0.15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [flashAnim]);

  // Hiệu ứng chữ Zzz bay bổng
  useEffect(() => {
    if (!isHappy) {
      const zLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(zzzAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(zzzAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      zLoop.start();
      return () => zLoop.stop();
    }
  }, [isHappy, zzzAnim]);

  // Hiệu ứng heo nhảy cẫng lên khi chụp
  useEffect(() => {
    if (isHappy) {
      Animated.sequence([
        Animated.timing(jumpAnim, {
          toValue: -12,
          duration: 160,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(jumpAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.bounce,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isHappy, jumpAnim]);

  const matrix = getPigBodyMatrix(isHappy);
  const pixelSize = 1.8;

  const zzzTranslateY = zzzAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });
  const zzzOpacity = zzzAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 0.8, 0],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* 1. GÓC TRÊN TRÁI (TOP-LEFT): GÓC PIXEL TRẮNG + REC ĐỎ (BỎ NGÀY THÁNG) */}
      <View style={styles.cornerTopLeft}>
        <View style={styles.pixelCornerTL} />
        <View style={styles.recContainer}>
          <Animated.View style={[styles.recDot, { opacity: flashAnim }]} />
        </View>
      </View>

      {/* 2. GÓC TRÊN PHẢI (TOP-RIGHT): GÓC PIXEL + CHÚ HEO NGỦ / NHẢY */}
      <View style={styles.cornerTopRight}>
        <View style={styles.pixelCornerTR} />
        <TouchableOpacity
          style={styles.mascotTouch}
          activeOpacity={0.85}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPigTap?.();
          }}
        >
          {/* Chữ Zzz bay lượn khi ngủ */}
          {!isHappy && (
            <Animated.View
              style={[
                styles.zzzContainer,
                {
                  transform: [{ translateY: zzzTranslateY }],
                  opacity: zzzOpacity,
                },
              ]}
            >
              <Text style={styles.zzzText}>z</Text>
              <Text style={[styles.zzzText, { fontSize: 10, marginLeft: 2 }]}>z</Text>
            </Animated.View>
          )}

          {/* Tim đỏ bay lên khi vui mừng */}
          {isHappy && (
            <View style={styles.heartContainer}>
              <Text style={styles.heartText}>❤️</Text>
            </View>
          )}

          {/* Sprite chú heo */}
          <Animated.View style={{ transform: [{ translateY: jumpAnim }] }}>
            <Svg width={24 * pixelSize} height={20 * pixelSize} viewBox="0 0 24 20">
              {matrix.map((row, y) =>
                row.map((col, x) =>
                  col ? (
                    <Rect
                      key={`p-${x}-${y}`}
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
      </View>

      {/* 3. GÓC DƯỚI TRÁI (BOTTOM-LEFT): GÓC PIXEL TRẮNG */}
      <View style={styles.cornerBottomLeft}>
        <View style={styles.pixelCornerBL} />
      </View>

      {/* 4. GÓC DƯỚI PHẢI (BOTTOM-RIGHT): GÓC PIXEL TRẮNG */}
      <View style={styles.cornerBottomRight}>
        <View style={styles.pixelCornerBR} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cornerTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pixelCornerTL: {
    width: 14,
    height: 14,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  recContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#E0452B',
  },
  dateStamp: {
    fontFamily: 'Baloo2',
    fontWeight: '800',
    fontSize: 12,
    color: '#FFFBF1',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    alignItems: 'flex-end',
  },
  pixelCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  mascotTouch: {
    marginTop: 4,
    marginRight: 4,
    alignItems: 'center',
  },
  zzzContainer: {
    position: 'absolute',
    top: -10,
    right: 2,
    flexDirection: 'row',
  },
  zzzText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 8,
    color: '#FFFBF1',
  },
  heartContainer: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
  },
  heartText: {
    fontSize: 11,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  pixelCornerBL: {
    width: 14,
    height: 14,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  pixelCornerBR: {
    width: 14,
    height: 14,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
  },
});
