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
  durationMs = 1800,
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
      if (timerRef.current) clearTimeout(timerRef.current);
      progressAnim.setValue(1);
      slideAnim.setValue(20);
      fadeAnim.setValue(0);

      // Animation xuất hiện mượt mà
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 9,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(progressAnim, {
          toValue: 0,
          duration: durationMs,
          useNativeDriver: false,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onExpire();
        });
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
      <View style={styles.toastCard}>
        <View style={styles.contentRow}>
          {/* Icon Checkmark / Mầm cây dễ thương */}
          <View style={styles.iconBadge}>
            <CheckCircle2 size={18} color="#5E9A57" strokeWidth={3} />
          </View>

          {/* Dòng thông báo nổi bật */}
          <Text style={styles.messageText} numberOfLines={1}>
            {message}
          </Text>

          {/* Nút Hoàn tác mini pill bo tròn Hồng Heo #F9B8C4 */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePressUndo}
            style={styles.undoBtn}
          >
            <RotateCcw size={12} color="#2B2118" strokeWidth={2.6} />
            <Text style={styles.undoBtnText}>
              Hoàn tác
            </Text>
          </TouchableOpacity>
        </View>

        {/* Thanh đếm ngược tiến trình siêu mảnh 2px */}
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
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
    backgroundColor: '#FFFBF1',
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    overflow: 'hidden',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 8,
  },
  iconBadge: {
    width: 22,
    height: 22,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    flex: 1,
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '800',
    color: '#2B2118',
    fontVariant: ['tabular-nums'],
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9B8C4',
    borderWidth: 2,
    borderColor: '#2B2118',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 2,
  },
  undoBtnText: {
    fontFamily: 'Nunito',
    fontSize: 12,
    fontWeight: '800',
    color: '#2B2118',
  },
  progressTrack: {
    height: 2,
    width: '100%',
    backgroundColor: 'rgba(43, 33, 24, 0.08)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#F4B93B',
  },
});
