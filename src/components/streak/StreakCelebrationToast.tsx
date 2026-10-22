import React, { useEffect } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Flame, Sparkles, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

export interface StreakCelebrationToastProps {
  visible: boolean;
  streakCount: number;
  onDismiss: () => void;
}

export const StreakCelebrationToast: React.FC<StreakCelebrationToastProps> = ({
  visible,
  streakCount,
  onDismiss,
}) => {
  const { tokens, isDark } = useTheme();
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 60,
          friction: 9,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Tự động đóng sau 4 giây
      const timer = setTimeout(() => {
        handleDismiss();
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(-100);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View
        style={[
          styles.toastCard,
          {
            backgroundColor: isDark ? '#1E293B' : '#FAF6EC',
            borderColor: tokens.primary,
          },
        ]}
      >
        <View style={styles.iconBox}>
          <Flame size={24} color={tokens.primary} strokeWidth={2.4} />
        </View>

        <View style={styles.textBox}>
          <View style={styles.titleRow}>
            <Sparkles size={14} color={tokens.primary} strokeWidth={2.4} />
            <Text style={[styles.title, { color: tokens.text }]}>
              Điểm Danh Thành Công!
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: tokens.textMuted }]}>
            Bạn đã đạt chuỗi{' '}
            <Text style={{ fontWeight: '800', color: tokens.primary }}>
              {streakCount} ngày
            </Text>{' '}
            liên tiếp 🔥
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleDismiss}
          style={styles.closeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={16} color={tokens.textMuted} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastCard: {
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    gap: 12,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(229, 152, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  title: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
  },
});
