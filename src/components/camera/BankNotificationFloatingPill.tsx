import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Camera, Check, Sparkles, X, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { BankNotificationEvent, bankNotificationService } from '../../services/bankNotificationService';
import { radii } from '../../theme/tokens';

interface Props {
  onPressAttach?: (event: BankNotificationEvent) => void;
  onDismiss?: () => void;
}

export const BankNotificationFloatingPill: React.FC<Props> = ({
  onPressAttach,
  onDismiss,
}) => {
  const [activeEvent, setActiveEvent] = useState<BankNotificationEvent | null>(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    // 1. Kiểm tra sự kiện mới nhất có sẵn
    const existing = bankNotificationService.getLatestEvent();
    if (existing) {
      showPill(existing);
    }

    // 2. Lắng nghe các sự kiện mới phát sinh
    const unsubscribe = bankNotificationService.subscribe((event) => {
      showPill(event);
    });

    return () => {
      unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const showPill = (event: BankNotificationEvent) => {
    setActiveEvent(event);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Slide xuống
    Animated.spring(slideAnim, {
      toValue: 0,
      bounciness: 6,
      speed: 12,
      useNativeDriver: true,
    }).start();

    // Tự động ẩn sau 15 giây
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      dismissPill();
    }, 15000);
  };

  const dismissPill = () => {
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setActiveEvent(null);
      bankNotificationService.clearLatestEvent();
      onDismiss?.();
    });
  };

  if (!activeEvent) return null;

  const { parsed } = activeEvent;
  const isExpense = parsed.type === 'EXPENSE';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.pillInner,
          {
            borderColor: parsed.brandColor,
          },
        ]}
      >
        {/* Badge Ngân Hàng */}
        <View style={[styles.bankBadge, { backgroundColor: parsed.brandColor }]}>
          <Text style={styles.bankBadgeText}>{parsed.bankCode}</Text>
        </View>

        {/* Nội Dung Thông Báo */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Zap size={13} color="#E59844" />
            <Text style={styles.titleText}>
              Đã ghi nhận{' '}
              <Text style={{ color: isExpense ? '#C86D51' : '#7E9F80', fontWeight: '800' }}>
                {isExpense ? '-' : '+'}
                {parsed.amount.toLocaleString('vi-VN')}đ
              </Text>
            </Text>
          </View>
          <Text style={styles.subtitleText} numberOfLines={1}>
            {parsed.categoryName} • Bấm nút Shutter để gắn ảnh món đồ
          </Text>
        </View>

        {/* Nút Đóng */}
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            dismissPill();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={15} color="rgba(255, 255, 255, 0.7)" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 54,
    left: 16,
    right: 16,
    zIndex: 999,
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 22, 32, 0.88)',
    borderRadius: radii.full,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  bankBadge: {
    width: 32,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  bankBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  textContainer: {
    flex: 1,
    marginRight: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  titleText: {
    color: '#FAF6EC',
    fontSize: 12,
    fontWeight: '700',
  },
  subtitleText: {
    color: 'rgba(250, 246, 236, 0.7)',
    fontSize: 10,
    marginTop: 1,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
