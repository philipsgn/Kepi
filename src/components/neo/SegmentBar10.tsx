import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface SegmentBar10Props {
  spent: number;
  limit: number;
  style?: StyleProp<ViewStyle>;
}

export const SegmentBar10: React.FC<SegmentBar10Props> = ({
  spent,
  limit,
  style,
}) => {
  const { tokens } = useTheme();

  const isOverspent = limit > 0 && spent > limit;
  // Số ô sáng = floor(spent / limit * 10) clamp 0-10
  const ratio = limit > 0 ? spent / limit : 0;
  const filledCount = Math.min(10, Math.max(0, Math.floor(ratio * 10)));

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: limit,
        now: spent,
      }}
    >
      {Array.from({ length: 10 }).map((_, index) => {
        let segColor = tokens.surfaceAlt || '#F6EEDC';

        if (isOverspent) {
          // Lố hạn mức: toàn bộ 10 ô chuyển màu đỏ cam lửa
          segColor = tokens.danger || '#E0452B';
        } else if (index < filledCount) {
          // Dưới hạn mức: các ô đã chi chuyển sang màu xanh lá vườn
          segColor = tokens.success || '#5E9A57';
        }

        return (
          <View
            key={index}
            style={[
              styles.segment,
              {
                backgroundColor: segColor,
                borderColor: tokens.border || '#2B2118',
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: 5,
    marginVertical: 10,
  },
  segment: {
    flex: 1,
    height: 20,
    borderRadius: 8,
    borderWidth: 2,
  },
});
