import React, { useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

export type PixelPigMood = 'idle' | 'happy' | 'sad' | 'blink' | 'sleep';

export interface PixelPigAvatarProps {
  size?: number;
  mood?: PixelPigMood;
  onPress?: () => void;
  style?: ViewStyle;
  borderless?: boolean;
}

// Bảng màu chuẩn từ prototype/Ví Heo Con.html
const PAL = {
  o: '#4B2B21', // Viền nâu mực
  p: '#F9B8C4', // Thịt heo hồng phấn
  s: '#EE90A6', // Má hồng ửng
  n: '#F08DA4', // Mõm heo
  k: '#2B2118', // Mắt & lỗ mũi
  w: '#FFFFFF', // Tròng trắng phản chiếu
  tear: '#7EC8F0', // Giọt lệ buồn
};

/**
 * Sinh lưới pixel 16×16 dựa trên hàm drawFace(c) nguyên bản của prototype
 */
function getFaceMatrix(mood: PixelPigMood = 'idle'): (string | null)[][] {
  // Lưới ma trận nền 16x16 trích xuất 1:1 từ prototype algorithm
  const grid: (string | null)[][] = [
    [null, null, PAL.o, PAL.o, PAL.o, null, null, null, null, null, null, PAL.o, PAL.o, PAL.o, null, null],
    [null, PAL.o, PAL.p, PAL.p, PAL.p, PAL.o, null, null, null, null, PAL.o, PAL.p, PAL.p, PAL.p, PAL.o, null],
    [null, PAL.o, PAL.p, PAL.p, PAL.p, PAL.p, PAL.o, PAL.o, PAL.o, PAL.o, PAL.p, PAL.p, PAL.p, PAL.p, PAL.o, null],
    [null, null, PAL.o, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.o, null, null],
    [null, PAL.o, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.o, null],
    // Dòng 5 (mắt trên):
    [null, PAL.o, PAL.p, PAL.p, PAL.w, PAL.k, PAL.p, PAL.p, PAL.p, PAL.p, PAL.w, PAL.k, PAL.p, PAL.p, PAL.o, null],
    // Dòng 6 (mắt dưới):
    [null, PAL.o, PAL.p, PAL.p, PAL.k, PAL.k, PAL.p, PAL.p, PAL.p, PAL.p, PAL.k, PAL.k, PAL.p, PAL.p, PAL.o, null],
    [null, PAL.o, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.o, null],
    [null, PAL.o, PAL.p, PAL.s, PAL.p, PAL.n, PAL.n, PAL.n, PAL.n, PAL.n, PAL.n, PAL.p, PAL.s, PAL.p, PAL.o, null],
    [null, PAL.o, PAL.p, PAL.p, PAL.p, PAL.n, PAL.k, PAL.n, PAL.n, PAL.k, PAL.n, PAL.p, PAL.p, PAL.p, PAL.o, null],
    [null, null, PAL.o, PAL.p, PAL.p, PAL.n, PAL.n, PAL.n, PAL.n, PAL.n, PAL.n, PAL.p, PAL.p, PAL.o, null, null],
    [null, null, null, PAL.o, PAL.p, PAL.p, PAL.n, PAL.n, PAL.n, PAL.n, PAL.p, PAL.p, PAL.o, null, null, null],
    [null, null, null, null, PAL.o, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.p, PAL.o, null, null, null, null],
    [null, null, null, null, null, PAL.o, PAL.o, PAL.o, PAL.o, PAL.o, PAL.o, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  ];

  // Điều chỉnh biểu cảm mắt
  if (mood === 'happy') {
    // Mắt cười cong híp ^ ^
    grid[5][4] = PAL.k; grid[5][5] = PAL.k;
    grid[6][4] = PAL.p; grid[6][5] = PAL.p;
    grid[6][3] = PAL.k; grid[6][6] = PAL.k;

    grid[5][10] = PAL.k; grid[5][11] = PAL.k;
    grid[6][10] = PAL.p; grid[6][11] = PAL.p;
    grid[6][9] = PAL.k; grid[6][12] = PAL.k;
  } else if (mood === 'sad') {
    // Mắt buồn rưng lệ
    grid[5][4] = PAL.k; grid[5][5] = PAL.k;
    grid[6][4] = PAL.tear; grid[6][5] = PAL.tear;

    grid[5][10] = PAL.k; grid[5][11] = PAL.k;
    grid[6][10] = PAL.tear; grid[6][11] = PAL.tear;
  } else if (mood === 'blink') {
    // Nháy mắt trái nhắm, mắt phải mở
    grid[5][4] = PAL.p; grid[5][5] = PAL.p;
    grid[6][4] = PAL.k; grid[6][5] = PAL.k;
  } else if (mood === 'sleep') {
    // Nhắm 2 mắt thư thái
    grid[5][4] = PAL.p; grid[5][5] = PAL.p;
    grid[6][4] = PAL.k; grid[6][5] = PAL.k;

    grid[5][10] = PAL.p; grid[5][11] = PAL.p;
    grid[6][10] = PAL.k; grid[6][11] = PAL.k;
  }

  return grid;
}

/**
 * PixelPigAvatar — Linh vật chú heo Neo-Brutalist Pixel 16×16
 * - Port 1:1 từ drawFace trong prototype/Ví Heo Con.html
 * - 100% SVG Vector pixel, siêu nhẹ, nét căng tuyệt đối (crisp edges)
 * - Tương tác xúc giác nhún tưng tưng khi bấm
 */
export const PixelPigAvatar: React.FC<PixelPigAvatarProps> = ({
  size = 36,
  mood = 'idle',
  onPress,
  style,
  borderless = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const matrix = getFaceMatrix(mood);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3.5,
        tension: 180,
        useNativeDriver: true,
      }),
    ]).start();

    if (onPress) onPress();
  };

  const Content = (
    <Animated.View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        !borderless && styles.avatarBorder,
        style,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Svg width={size * 0.86} height={size * 0.86} viewBox="0 0 16 16">
        {matrix.map((row, y) =>
          row.map((col, x) => {
            if (!col) return null;
            return (
              <Rect
                key={`${y}-${x}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill={col}
              />
            );
          })
        )}
      </Svg>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
};

const styles = StyleSheet.create({
  avatarContainer: {
    backgroundColor: '#FFF4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarBorder: {
    borderWidth: 2,
    borderColor: '#4B2B21',
  },
});
