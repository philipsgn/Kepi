import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ShutterButtonProps {
  onCapturePhoto: () => Promise<void> | void;
  onStartRecordingVideo?: () => void;
  onStopRecordingVideo?: (completed: boolean) => void;
  isRecording?: boolean;
  disabled?: boolean;
}

const CIRCLE_RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ≈ 238.76

/**
 * Nút chụp Shutter Đa Năng (Hybrid Shutter Button) — Kepi v5.0
 * - Chạm 1 lần: Chụp ảnh tĩnh tức thì (kèm xúc giác Heavy Haptic)
 * - Giữ đè (Long Press): Quay video 3 giây (kèm vòng tròn tiến độ SVG Vàng Hổ Phách chạy đủ 360 độ)
 * - Tự động dừng và lưu khi chạm mốc 3.0 giây
 */
export const ShutterButton: React.FC<ShutterButtonProps> = ({
  onCapturePhoto,
  onStartRecordingVideo,
  onStopRecordingVideo,
  isRecording = false,
  disabled = false,
}) => {
  const { tokens } = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const [recordingActive, setRecordingActive] = useState(false);
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const longPressTimer = useRef<any>(null);
  const recordingTimer = useRef<any>(null);

  // Tính strokeDashoffset từ Animated.Value
  const strokeDashoffset = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const stopRecordingInternal = (completed: boolean) => {
    if (recordingTimer.current) {
      clearTimeout(recordingTimer.current);
      recordingTimer.current = null;
    }
    animatedProgress.stopAnimation();
    animatedProgress.setValue(0);
    setRecordingActive(false);
    if (onStopRecordingVideo) {
      onStopRecordingVideo(completed);
    }
  };

  const startRecordingInternal = () => {
    setRecordingActive(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onStartRecordingVideo) {
      onStartRecordingVideo();
    }

    animatedProgress.setValue(0);
    Animated.timing(animatedProgress, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        stopRecordingInternal(true);
      }
    });

    // An toàn: Hết 3000ms tự dừng nếu animation chưa trigger
    recordingTimer.current = setTimeout(() => {
      stopRecordingInternal(true);
    }, 3050);
  };

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);

    // Đặt hẹn giờ 400ms: nếu vẫn giữ tay thì chuyển sang chế độ quay video 3s
    longPressTimer.current = setTimeout(() => {
      startRecordingInternal();
    }, 400);
  };

  const handlePressOut = () => {
    setIsPressed(false);

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (recordingActive) {
      // Người dùng thả tay sớm
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      stopRecordingInternal(false);
    }
  };

  const handlePress = async () => {
    if (disabled || recordingActive) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await onCapturePhoto();
    } catch (err) {
      console.log('Lỗi chụp ảnh Shutter:', err);
    }
  };

  // Đồng bộ props isRecording nếu parent điều khiển
  useEffect(() => {
    if (isRecording && !recordingActive) {
      startRecordingInternal();
    } else if (!isRecording && recordingActive) {
      stopRecordingInternal(false);
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (recordingTimer.current) clearTimeout(recordingTimer.current);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* VÒNG TRÒN TIẾN ĐỘ QUAY VIDEO 3 GIÂY (SVG AMBER GOLD) */}
      <View style={styles.svgOverlay} pointerEvents="none">
        <Svg width={92} height={92} viewBox="0 0 92 92">
          {/* Vòng nền mờ tĩnh */}
          <Circle
            cx="46"
            cy="46"
            r={CIRCLE_RADIUS}
            stroke={recordingActive ? 'rgba(229, 152, 68, 0.25)' : 'rgba(246, 184, 0, 0.35)'}
            strokeWidth="3.5"
            fill="none"
          />
          {/* Vòng tiến độ động khi đang quay video 3s */}
          {recordingActive && (
            <AnimatedCircle
              cx="46"
              cy="46"
              r={CIRCLE_RADIUS}
              stroke="#E59844"
              strokeWidth="4"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              rotation="-90"
              origin="46, 46"
            />
          )}
        </Svg>
      </View>

      {/* NÚT BẤM SHUTTER CHÍNH */}
      <TouchableOpacity
        activeOpacity={0.9}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.shutterInner,
          {
            backgroundColor: recordingActive ? '#C86D51' : tokens.primary,
            shadowColor: recordingActive ? '#C86D51' : tokens.primary,
          },
          (isPressed || recordingActive) && styles.shutterPressed,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 92,
    height: 92,
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 66,
    height: 66,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 6,
  },
  shutterPressed: {
    transform: [{ scale: 0.9 }],
  },
});
