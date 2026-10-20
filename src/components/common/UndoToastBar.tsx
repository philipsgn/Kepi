import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CheckCircle2, RotateCcw } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

interface UndoToastBarProps {
  visible: boolean;
  message: string;
  durationMs?: number;
  onUndo: () => void;
  onExpire: () => void;
  bottomOffset?: number;
}

/**
 * Thanh Toast Hoàn Tác Hiện Đại (Modern Floating Frosted Glass Pill)
 * - Tự động thích ứng giao diện Sáng / Tối (Hà Nội Thu Đông)
 * - Bo cong tròn 24px, kính mờ với viền phản chiếu ánh sáng nhẹ
 * - Icon Checkmark xanh cốm / vàng nắng thu nổi bật
 * - Nút mini pill Hoàn tác phản hồi xúc giác
 * - Thanh đếm ngược tiến trình siêu mảnh 2.5px
 */
export const UndoToastBar: React.FC<UndoToastBarProps> = ({
  visible,
  message,
  durationMs = 5000,
  onUndo,
  onExpire,
  bottomOffset = 85,
}) => {
  const { tokens, isDark } = useTheme();
  const progressAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      progressAnim.setValue(1);
      slideAnim.setValue(20);
      fadeAnim.setValue(0);

      // Animation xuất hiện mượt mà
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 9,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: durationMs,
          useNativeDriver: false,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        onExpire();
      }, durationMs);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [visible, durationMs]);

  if (!visible) return null;

  const handlePressUndo = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onUndo();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.toastCard,
          {
            backgroundColor: isDark ? 'rgba(22, 34, 49, 0.94)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.08)',
          },
        ]}
      >
        <View style={styles.contentRow}>
          {/* Icon Checkmark tinh tế nổi trần */}
          <View style={styles.iconBadge}>
            <CheckCircle2 size={20} color="#7E9F80" strokeWidth={2.6} />
          </View>

          {/* Dòng thông báo nổi bật */}
          <Text
            style={[
              styles.messageText,
              { color: isDark ? '#FAF6EC' : '#1B2733' },
            ]}
            numberOfLines={1}
          >
            {message}
          </Text>

          {/* Nút Hoàn tác mini pill viền mỏng */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handlePressUndo}
            style={[
              styles.undoBtn,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              },
            ]}
          >
            <RotateCcw size={12} color={isDark ? '#FAF6EC' : '#1B2733'} strokeWidth={2.4} />
            <Text
              style={[
                styles.undoBtnText,
                { color: isDark ? '#FAF6EC' : '#1B2733' },
              ]}
            >
              Hoàn tác
            </Text>
          </TouchableOpacity>
        </View>

        {/* Thanh đếm ngược tiến trình siêu mảnh 2.5px */}
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)' },
          ]}
        >
          <Animated.View
            style={[
              styles.progressBar,
              {
                backgroundColor: '#E59844',
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 9999,
  },
  toastCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  iconBadge: {
    width: 24,
    height: 24,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.2,
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    gap: 5,
  },
  undoBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 2.5,
    width: '100%',
  },
  progressBar: {
    height: '100%',
  },
});
