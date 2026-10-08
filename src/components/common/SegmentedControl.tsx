import React from 'react';
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { radii, spacing } from '../../theme/tokens';

export interface SegmentItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps {
  items: (string | SegmentItem)[];
  selectedIndex: number;
  onChange: (index: number, key: string) => void;
  style?: ViewStyle;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  items,
  selectedIndex,
  onChange,
  style,
}) => {
  const { tokens, isDark } = useTheme();
  const [containerWidth, setContainerWidth] = React.useState<number>(0);
  const translateX = useSharedValue(0);

  const normalizedItems: SegmentItem[] = React.useMemo(() => {
    return items.map((item, idx) =>
      typeof item === 'string' ? { key: `item-${idx}`, label: item } : item
    );
  }, [items]);

  const count = normalizedItems.length;
  const padding = 3;
  const segmentWidth = count > 0 && containerWidth > 0 ? (containerWidth - padding * 2) / count : 0;

  React.useEffect(() => {
    if (segmentWidth > 0) {
      translateX.value = withSpring(selectedIndex * segmentWidth, {
        damping: 24,
        stiffness: 260,
      });
    }
  }, [selectedIndex, segmentWidth, translateX]);

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: segmentWidth,
    };
  });

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
      translateX.value = selectedIndex * ((width - padding * 2) / count);
    }
  };

  const handlePress = (index: number, key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onChange(index, key);
  };

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.container,
        {
          backgroundColor: tokens.surfaceAlt,
          borderColor: tokens.border,
        },
        style,
      ]}
    >
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            styles.activeIndicator,
            {
              left: padding,
              top: padding,
              bottom: padding,
              backgroundColor: isDark ? tokens.surface : '#FFFFFF',
              borderColor: tokens.border,
            },
            animatedPillStyle,
          ]}
        />
      )}

      {normalizedItems.map((item, index) => {
        const isSelected = index === selectedIndex;
        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => handlePress(index, item.key)}
            activeOpacity={0.7}
            style={styles.segment}
          >
            {item.icon && <View style={styles.iconWrapper}>{item.icon}</View>}
            <Text
              style={[
                styles.segmentText,
                {
                  color: isSelected ? tokens.text : tokens.textMuted,
                  fontWeight: isSelected ? '600' : '400',
                },
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    borderRadius: radii.full,
    borderWidth: 1,
    height: 40,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    borderRadius: radii.full,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    zIndex: 1,
  },
  iconWrapper: {
    marginRight: 4,
  },
  segmentText: {
    fontSize: 13,
    letterSpacing: -0.2,
  },
});
