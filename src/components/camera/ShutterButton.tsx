import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ShutterButtonProps {
  onCapturePhoto: () => Promise<void> | void;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
  isVoiceActive?: boolean;
  onStartRecordingVideo?: () => void;
  onStopRecordingVideo?: (completed: boolean) => void;
  isRecording?: boolean;
  disabled?: boolean;
}

const CIRCLE_RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS; // ≈ 238.76

/**
 * Nút chụp Shutter 2-in-1 Neo-Brutalist — Kepi & PigFly
 * - Chạm 1 lần: Chụp ảnh tĩnh tức thì (kèm rung Heavy Haptic)
 * - Nhấn giữ (>350ms): Ghi âm giọng nói (kèm vòng sóng âm SVG bừng sáng)
 * - Thả tay: Dừng ghi âm và gọi AI NLP bóc tách
 */
export const ShutterButton: React.FC<ShutterButtonProps> = ({
  onCapturePhoto,
  onVoiceStart,
  onVoiceEnd,
  isVoiceActive = false,
  onStartRecordingVideo,
  onStopRecordingVideo,
  isRecording = false,
  disabled = false,
}) => {
  const { tokens, mode } = useTheme();
  const isHeocon = mode === 'heocon' || !mode;
  const [isPressed, setIsPressed] = useState(false);
  const [voiceRecordingInternal, setVoiceRecordingInternal] = useState(false);
  const [recordingActive, setRecordingActive] = useState(false);
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const longPressTimer = useRef<any>(null);
  const recordingTimer = useRef<any>(null);

  const isAnyVoiceActive = isVoiceActive || voiceRecordingInternal;

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

    // Đặt hẹn giờ 350ms: nếu giữ đè thì kích hoạt chế độ Voice hoặc quay video
    longPressTimer.current = setTimeout(() => {
      if (onVoiceStart) {
        setVoiceRecordingInternal(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onVoiceStart();
      } else {
        startRecordingInternal();
      }
    }, 350);
  };

  const handlePressOut = () => {
    setIsPressed(false);

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (voiceRecordingInternal) {
      setVoiceRecordingInternal(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (onVoiceEnd) {
        onVoiceEnd();
      }
    } else if (recordingActive) {
      // Người dùng thả tay sớm
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      stopRecordingInternal(false);
    }
  };

  const handlePress = async () => {
    if (disabled || recordingActive || isAnyVoiceActive) return;
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
            stroke={isAnyVoiceActive ? 'rgba(224, 69, 43, 0.45)' : recordingActive ? 'rgba(229, 152, 68, 0.25)' : 'rgba(246, 184, 0, 0.35)'}
            strokeWidth="3.5"
            fill="none"
          />
          {/* Vòng tiến độ động khi đang quay video 3s hoặc đang voice */}
          {(recordingActive || isAnyVoiceActive) && (
            <AnimatedCircle
              cx="46"
              cy="46"
              r={CIRCLE_RADIUS}
              stroke={isAnyVoiceActive ? '#E0452B' : '#E59844'}
              strokeWidth="4"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={isAnyVoiceActive ? 0 : strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              rotation="-90"
              origin="46, 46"
            />
          )}
        </Svg>
      </View>

      {/* NÚT BẤM SHUTTER CHÍNH (THEO PROTOTYPE CAMERA_HEO_CON NEO-BRUTALIST ĐỎ-VÀNG-MỰC) */}
      <TouchableOpacity
        activeOpacity={0.92}
        disabled={disabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.shutterOuterRing,
          isHeocon
            ? {
                borderColor: '#2B2118',
                backgroundColor: '#F4B93B',
                shadowColor: '#2B2118',
                shadowOffset: { width: 0, height: isPressed ? 4 : 8 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: isPressed ? 3 : 8,
                transform: [{ translateY: isPressed ? 4 : 0 }],
              }
            : {
                borderColor: tokens.primary,
                backgroundColor: 'rgba(255,255,255,0.2)',
                shadowColor: tokens.primary,
                transform: [{ scale: isPressed ? 0.92 : 1 }],
              },
        ]}
      >
        <View
          style={[
            styles.shutterCenterCore,
            isHeocon
              ? {
                  backgroundColor: (recordingActive || isAnyVoiceActive) ? '#B93220' : '#E0452B',
                  borderColor: '#2B2118',
                  borderWidth: 3.5,
                }
              : {
                  backgroundColor: (recordingActive || isAnyVoiceActive) ? '#C86D51' : tokens.primary,
                },
            (recordingActive || isAnyVoiceActive) && { borderRadius: 18, width: 44, height: 44 },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 96,
    height: 96,
  },
  svgOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  shutterOuterRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  shutterCenterCore: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterPressed: {
    transform: [{ scale: 0.9 }],
  },
});
