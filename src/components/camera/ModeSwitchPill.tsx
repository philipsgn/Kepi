import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { Strings } from '../../constants/strings';

export type CameraMode = 'EXPENSE' | 'INCOME' | 'INTEND';

interface ModeSwitchPillProps {
  currentMode: CameraMode;
  onModeChange: (mode: CameraMode) => void;
}

const MODES: { key: CameraMode; label: string }[] = [
  { key: 'EXPENSE', label: Strings.camera.modeExpense },
  { key: 'INCOME', label: Strings.camera.modeIncome },
  { key: 'INTEND', label: Strings.camera.modeIntend },
];

const ITEM_WIDTH = 76;
const TRACK_PADDING = 3;
const TOTAL_MODES = MODES.length;

/**
 * Công tắc chuyển 3 chế độ [ Chi | Thu | Định mua ] trên khung ngắm Camera
 * Phiên bản Nút Nhấn Cố Định (Fixed Tap Selector) — Phong cách Photobooth Kính Mờ:
 * - 3 nút bấm cố định độc lập, chạm là phản hồi tức thì với rung Haptic Light
 * - Viên thuốc màu vàng ấm lướt mượt mà bằng hiệu ứng lò xo (Spring Physics) đến vị trí nút được bấm
 * - Loại bỏ hoàn toàn kéo trượt để đảm bảo độ ổn định 100%, không xung đột cử chỉ cuộn màn hình
 */
export const ModeSwitchPill: React.FC<ModeSwitchPillProps> = ({
  currentMode,
  onModeChange,
}) => {
  const { tokens } = useTheme();

  const getIndexFromMode = (mode: CameraMode) => {
    const idx = MODES.findIndex((m) => m.key === mode);
    return idx >= 0 ? idx : 0;
  };

  const activeIndex = getIndexFromMode(currentMode);
  const translateX = useRef(new Animated.Value(activeIndex * ITEM_WIDTH)).current;

  // Lướt viên thuốc sang nút được chọn bằng Spring animation
  useEffect(() => {
    Animated.spring(translateX, {
      toValue: activeIndex * ITEM_WIDTH,
      useNativeDriver: true,
      bounciness: 4,
      speed: 18,
    }).start();
  }, [activeIndex, translateX]);

  const handlePressMode = (mode: CameraMode) => {
    if (mode !== currentMode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onModeChange(mode);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.pillTrack}>
        {/* VIÊN THUỐC TRƯỢT MƯỢT MÀ ĐẾN NÚT ĐANG CHỌN */}
        <Animated.View
          style={[
            styles.slidingPill,
            {
              backgroundColor: tokens.primary,
              transform: [{ translateX }],
            },
          ]}
        />

        {/* 3 NÚT BẤM CỐ ĐỊNH NHẠY BÉN */}
        <View style={styles.buttonsRow}>
          {MODES.map((m, idx) => {
            const isActive = activeIndex === idx;
            return (
              <TouchableOpacity
                key={m.key}
                style={styles.modeButton}
                onPress={() => handlePressMode(m.key)}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text
                  style={[
                    styles.modeText,
                    {
                      color: isActive ? '#1B2733' : 'rgba(250, 246, 236, 0.72)',
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 6,
    zIndex: 30,
  },
  pillTrack: {
    width: ITEM_WIDTH * TOTAL_MODES + TRACK_PADDING * 2,
    height: 36,
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 26, 36, 0.68)',
    padding: TRACK_PADDING,
    borderRadius: radii.full,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
    alignItems: 'center',
  },
  slidingPill: {
    position: 'absolute',
    left: TRACK_PADDING,
    top: TRACK_PADDING,
    width: ITEM_WIDTH,
    height: 30,
    borderRadius: radii.full,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonsRow: {
    position: 'absolute',
    left: TRACK_PADDING,
    right: TRACK_PADDING,
    top: TRACK_PADDING,
    bottom: TRACK_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeButton: {
    width: ITEM_WIDTH,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeText: {
    fontSize: 12,
    letterSpacing: -0.2,
  },
});
