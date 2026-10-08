import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

interface ShutterButtonProps {
  onCapturePhoto: () => Promise<void> | void;
  disabled?: boolean;
}

/**
 * Nút chụp Shutter — Phiên bản "Ấm, tĩnh, sang" (Tối ưu tốc độ <= 3s)
 * - Bấm 1 chạm chụp ảnh tức thì kèm Haptic nhún xúc giác
 * - Thiết kế Photobooth tối giản: Vòng tròn đồng tâm ánh vàng Kepi
 * - Đã loại bỏ hoàn toàn Voice & Audio để tối ưu độ trễ và bảo mật
 */
export const ShutterButton: React.FC<ShutterButtonProps> = ({
  onCapturePhoto,
  disabled = false,
}) => {
  const { tokens } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  const handlePress = async () => {
    if (disabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await onCapturePhoto();
    } catch (err) {
      console.log('Lỗi chụp ảnh Shutter:', err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Vòng tròn đồng tâm tỏa sáng chuẩn Photobooth */}
      <View
        style={[
          styles.outerRing,
          {
            borderColor: isPressed ? tokens.primary : 'rgba(246, 184, 0, 0.45)',
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={disabled}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          style={[
            styles.shutterInner,
            {
              backgroundColor: tokens.primary,
              shadowColor: tokens.primary,
            },
            isPressed && styles.shutterPressed,
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 84,
    height: 84,
  },
  outerRing: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: radii.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 12,
    elevation: 6,
  },
  shutterPressed: {
    transform: [{ scale: 0.92 }],
  },
});
