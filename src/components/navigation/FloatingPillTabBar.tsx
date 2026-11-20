import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Camera, Gamepad2, Home, Trees, User } from 'lucide-react-native';
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
 * Thanh điều hướng nổi dạng viên thuốc (Floating Pill Tab Bar) — Chuẩn Prototype 20/11 & Style Heo Con
 * - Tone màu nền: Hồng phấn dâu sữa nhạt #FCECEF, viền 3px mực #2B2118, bóng cứng 4px 0-blur.
 * - Bố cục 5 Tabs (Icon 20px + Chữ nhãn 11px xếp dọc): Vườn — Nhà — Chụp — Giải trí — Hồ sơ.
 * - Hiệu ứng Active đa sắc theo từng tab:
 *   + Chụp: Nền Đỏ cam #E0452B, chữ/icon trắng #FFFFFF
 *   + Giải trí: Nền Vàng cám #F4B93B, chữ/icon mực #2B2118
 *   + Các tab khác (Vườn, Nhà, Hồ sơ): Nền Nâu mực #2B2118, chữ/icon kem trắng #FFFBF1
 */
export const FloatingPillTabBar: React.FC<FloatingPillTabBarProps> = ({
  activeIndex,
  onSelectTab,
  scrollX,
  screenWidth,
  isDeepScrolled = false,
}) => {
  const { tokens, isDark, mode } = useTheme();
  const isHeocon = mode === 'heocon' || !mode;
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

  // Hiệu ứng trượt của viên thuốc nội suy từ scrollX (ngang) cho theme non-heocon
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
    { id: 'home', icon: Trees, label: 'Vườn', activeBg: '#2B2118', activeFg: '#FFFBF1' },
    { id: 'stats', icon: Home, label: 'Nhà', activeBg: '#2B2118', activeFg: '#FFFBF1' },
    { id: 'camera', icon: Camera, label: 'Chụp', activeBg: '#E0452B', activeFg: '#FFFFFF', isCamera: true },
    { id: 'chat', icon: Gamepad2, label: 'Giải trí', activeBg: '#F4B93B', activeFg: '#2B2118' },
    { id: 'profile', icon: User, label: 'Hồ sơ', activeBg: '#2B2118', activeFg: '#FFFBF1' },
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
            borderColor: isHeocon ? '#2B2118' : tokens.border || '#2B2118',
            backgroundColor: isHeocon ? '#FCECEF' : tokens.surface || '#FFFBF1',
            shadowColor: '#2B2118',
            shadowOpacity: 1,
            shadowRadius: 0,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          },
        ]}
      >
        {/* VIÊN THUỐC TRƯỢT NỘI SUY (SLIDING PILL) - Cho chế độ non-heocon */}
        {!isHeocon && (
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
        )}

        {/* 5 NÚT TAB (ICON 20px + CHỮ NHÃN 11px) */}
        <View style={styles.tabIconsRow}>
          {tabs.map((tab, idx) => {
            const IconComponent = tab.icon;
            const isSelected = activeIndex === idx;

            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  { width: tabWidth },
                  isSelected && isHeocon && {
                    backgroundColor: tab.activeBg,
                    borderRadius: 22,
                  },
                ]}
                onPress={() => handleTabPress(idx)}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <IconComponent
                  size={20}
                  color={
                    isSelected
                      ? (isHeocon ? tab.activeFg : tokens.text || '#2B2118')
                      : (isHeocon ? '#2B2118' : tokens.textMuted || '#7A6852')
                  }
                  strokeWidth={isSelected ? 2.6 : 2.2}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isSelected
                        ? (isHeocon ? tab.activeFg : tokens.text || '#2B2118')
                        : (isHeocon ? '#2B2118' : tokens.textMuted || '#7A6852'),
                      opacity: isSelected ? 1 : 0.72,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  tabLabel: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 10.5,
    marginTop: 2,
    textAlign: 'center',
  },
});
