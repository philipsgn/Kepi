import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
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
  const isPink = mode === 'pink';
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
    { id: 'chat', icon: Gamepad2, label: 'Khám phá', activeBg: '#F4B93B', activeFg: '#2B2118' },
    { id: 'profile', icon: User, label: 'Hồ sơ', activeBg: '#2B2118', activeFg: '#FFFBF1' },
  ];

  const getTabActiveStyle = (tab: (typeof tabs)[0]) => {
    if (isPink) {
      if (tab.isCamera) {
        return { bg: '#E11D48', fg: '#FFFFFF' };
      }
      if (tab.id === 'chat') {
        return { bg: '#F43F5E', fg: '#FFFFFF' };
      }
      return { bg: '#3B0713', fg: '#FFFFFF' };
    }
    // heocon (Vàng Nâu)
    return { bg: tab.activeBg, fg: tab.activeFg };
  };

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
            shadowColor: tokens.shadowColor || '#2B2118',
            shadowOpacity: 1,
            shadowRadius: 0,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          },
        ]}
      >
        {/* 5 NÚT TAB (ICON 20px + CHỮ NHÃN 11px) THEO CHUẨN NEO-BRUTALIST ĐỒNG BỘ THEO THEME */}
        <View style={styles.tabIconsRow}>
          {tabs.map((tab, idx) => {
            const IconComponent = tab.icon;
            const isSelected = activeIndex === idx;
            const activeStyle = getTabActiveStyle(tab);

            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabButton,
                  { width: tabWidth },
                  isSelected && {
                    backgroundColor: activeStyle.bg,
                    borderRadius: 22,
                    borderWidth: isPink ? 1.5 : 0,
                    borderColor: isPink ? tokens.border : 'transparent',
                  },
                ]}
                onPress={() => handleTabPress(idx)}
                activeOpacity={0.75}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <IconComponent
                  size={tab.isCamera ? 21 : 20}
                  color={
                    isSelected
                      ? activeStyle.fg
                      : (tokens.text || '#2B2118')
                  }
                  strokeWidth={tab.isCamera ? 2.6 : 2.4}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isSelected
                        ? activeStyle.fg
                        : (tokens.text || '#2B2118'),
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
