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
            borderColor: tokens.border,
            shadowColor: isDark ? 'transparent' : tokens.shadowColor,
            shadowOpacity: isDark ? 0 : 0.08,
            shadowRadius: isDark ? 0 : 18,
            elevation: isDark ? 0 : 4,
          },
        ]}
      >
        {/* NỀN KÍNH MỜ THÍCH ỨNG THEME */}
        <BlurView
          intensity={65}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        >
          <View
            style={[
              styles.blurTintOverlay,
              {
                backgroundColor: isDark
                  ? 'rgba(22, 34, 49, 0.82)'
                  : 'rgba(255, 253, 248, 0.82)',
              },
            ]}
          />
        </BlurView>

        {/* VIÊN THUỐC TRƯỢT NỘI SUY (SLIDING PILL) */}
        <Animated.View
          style={[
            styles.slidingPill,
            {
              width: tabWidth,
              backgroundColor: tokens.primarySoft,
              borderColor: isDark ? 'rgba(255, 201, 60, 0.25)' : 'rgba(246, 184, 0, 0.25)',
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
                        backgroundColor: tokens.primary,
                        borderColor: 'rgba(0, 0, 0, 0.08)',
                      },
                      isSelected && styles.centerCameraCircleActive,
                    ]}
                  >
                    <IconComponent
                      size={21}
                      color="#1B2733"
                      strokeWidth={2.4}
                    />
                  </View>
                ) : (
                  <IconComponent
                    size={20}
                    color={isSelected ? tokens.primary : tokens.textMuted}
                    strokeWidth={isSelected ? 2.4 : 1.8}
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
    overflow: 'hidden',
    borderWidth: 1,
    padding: INNER_PADDING,
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
  },
  blurTintOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  slidingPill: {
    position: 'absolute',
    top: INNER_PADDING,
    bottom: INNER_PADDING,
    left: INNER_PADDING,
    borderRadius: radii.full,
    borderWidth: 1,
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
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  centerCameraCircleActive: {
    transform: [{ scale: 1.04 }],
  },
});
