import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BarChart2, Camera, Home, MessageSquare, User } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { TAB_BAR_HEIGHT, useBottomInset } from '../../hooks/useBottomInset';

export interface FloatingPillTabBarProps {
  activeIndex: number;
  onSelectTab: (index: number) => void;
  scrollX?: SharedValue<number>;
  screenWidth: number;
  isDeepScrolled?: boolean;
}

const TAB_COUNT = 5;
const TAB_BAR_HORIZONTAL_MARGIN = 16;
const INNER_PADDING = 4;

/**
 * Thanh điều hướng nổi dạng viên thuốc (Floating Pill Tab Bar) — Phiên bản "Ấm, tĩnh, sang"
 * Tuân thủ mục 1 & 4 của đặc tả:
 * - Kính mờ thích ứng: Bản Sáng dùng kem ngà mờ, bản Tối dùng xám xanh trầm mờ.
 * - Viền mảnh hairline 1px tokens.border, không viền đen dày, không bóng đổ cứng.
 * - Nút Camera chính giữa dạng tròn mềm mại 44px vàng ấm sang trọng.
 * - Chỉ báo trượt viên thuốc animated spring theo vị trí cuộn trang.
 */
export const FloatingPillTabBar: React.FC<FloatingPillTabBarProps> = ({
  activeIndex,
  onSelectTab,
  scrollX,
  screenWidth,
  isDeepScrolled = false,
}) => {
  const { tokens, isDark } = useTheme();
  const { tabBarBottom } = useBottomInset();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Tính chiều rộng thanh tab và từng ô tab
  const barWidth = screenWidth - TAB_BAR_HORIZONTAL_MARGIN * 2;
  const tabWidth = (barWidth - INNER_PADDING * 2) / TAB_COUNT;

  // Hiệu ứng trượt của viên thuốc nội suy từ scrollX (ngang)
  const animatedPillStyle = useAnimatedStyle(() => {
    if (!scrollX || screenWidth === 0) {
      return {
        transform: [{ translateX: activeIndex * tabWidth }],
      };
    }
    const progress = scrollX.value / screenWidth;
    const clampedProgress = Math.max(0, Math.min(TAB_COUNT - 1, progress));
    return {
      transform: [{ translateX: clampedProgress * tabWidth }],
    };
  }, [screenWidth, tabWidth, activeIndex]);

  // Luôn đặt hooks trước điều kiện ẩn bàn phím
  if (isKeyboardVisible) {
    return null;
  }

  const handleTabPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onSelectTab(index);
  };

  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'stats', icon: BarChart2, label: 'Thống kê' },
    { id: 'camera', icon: Camera, label: 'Camera', isCenter: true },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Hồ sơ' },
  ];

  return (
    <View
      style={[
        styles.outerWrapper,
        {
          bottom: tabBarBottom,
          opacity: isDeepScrolled ? 0.9 : 1,
        },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.barContainer,
          {
            width: barWidth,
            borderColor: tokens.border || '#2B2118',
            backgroundColor: tokens.surface || '#FFFBF1',
            shadowColor: tokens.border || '#2B2118',
            shadowOpacity: 1,
            shadowRadius: 0,
            shadowOffset: { width: 0, height: 3 },
          },
        ]}
      >
        {/* VIÊN THUỐC TRƯỢT NỘI SUY (SLIDING PILL) - NEO BRUTALIST */}
        <Animated.View
          style={[
            styles.slidingPill,
            {
              width: tabWidth,
              backgroundColor: tokens.primarySoft || 'rgba(244, 185, 59, 0.3)',
              borderColor: tokens.border || '#2B2118',
            },
            animatedPillStyle,
          ]}
        />

        {/* 5 NÚT ICON VECTOR */}
        <View style={styles.tabIconsRow}>
          {tabs.map((tab, idx) => {
            const IconComponent = tab.icon;
            const isSelected = activeIndex === idx;

            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, { width: tabWidth }]}
                onPress={() => handleTabPress(idx)}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                {tab.isCenter ? (
                  <View
                    style={[
                      styles.centerCameraCircle,
                      {
                        backgroundColor: tokens.primary || '#F4B93B',
                        borderColor: tokens.border || '#2B2118',
                        shadowColor: tokens.border || '#2B2118',
                      },
                      isSelected && styles.centerCameraCircleActive,
                    ]}
                  >
                    <IconComponent
                      size={22}
                      color="#2B2118"
                      strokeWidth={2.6}
                    />
                  </View>
                ) : (
                  <IconComponent
                    size={20}
                    color={isSelected ? tokens.text || '#2B2118' : tokens.textMuted || '#7A6852'}
                    strokeWidth={isSelected ? 2.6 : 2.0}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    left: TAB_BAR_HORIZONTAL_MARGIN,
    right: TAB_BAR_HORIZONTAL_MARGIN,
    alignItems: 'center',
    zIndex: 999,
  },
  barContainer: {
    height: TAB_BAR_HEIGHT,
    borderRadius: radii.full,
    borderWidth: 3,
    padding: INNER_PADDING,
    justifyContent: 'center',
  },
  slidingPill: {
    position: 'absolute',
    top: INNER_PADDING,
    bottom: INNER_PADDING,
    left: INNER_PADDING,
    borderRadius: radii.full,
    borderWidth: 2,
  },
  tabIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  tabButton: {
    height: TAB_BAR_HEIGHT - INNER_PADDING * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCameraCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  centerCameraCircleActive: {
    transform: [{ scale: 1.04 }],
  },
});
