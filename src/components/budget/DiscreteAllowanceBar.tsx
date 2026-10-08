import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface DiscreteAllowanceBarProps {
  spent: number;
  totalBudget: number;
  style?: ViewStyle;
}

/**
 * Thanh 10 ô dàn đều 100% bề ngang thẻ ngân sách
 * Tuân thủ mục 3.4 của đặc tả:
 * - Mỗi ô = 10% ngân sách ngày
 * - Ô còn lại: Nền ĐEN #000000 (độ tương phản 13.5:1 trên nền vàng, đạt chuẩn WCAG AA)
 * - Ô đã dùng: Viền đen rỗng (thấy nền vàng bên trong)
 * - Vượt ngân sách: Các ô chuyển sang ĐỎ #FF4D4D
 */
export const DiscreteAllowanceBar: React.FC<DiscreteAllowanceBarProps> = ({
  spent,
  totalBudget,
  style,
}) => {
  const isOver = totalBudget > 0 && spent > totalBudget;
  const ratio = totalBudget > 0 ? Math.min(1, Math.max(0, spent / totalBudget)) : 0;
  // Số ô đã chi (từ 0 đến 10)
  const spentCount = isOver ? 10 : Math.round(ratio * 10);

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: 10 }).map((_, index) => {
        const isSpent = index < spentCount;

        if (isOver) {
          // Vượt ngân sách: Toàn bộ ô đỏ rực cảnh báo
          return (
            <View
              key={index}
              style={[styles.block, styles.blockOver]}
            />
          );
        }

        if (isSpent) {
          // Ô đã tiêu: Viền đen rỗng
          return (
            <View
              key={index}
              style={[styles.block, styles.blockSpent]}
            />
          );
        }

        // Ô còn lại: Nền ĐEN đặc nguyên khối
        return (
          <View
            key={index}
            style={[styles.block, styles.blockRemaining]}
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
    width: '100%',
    gap: 4,
    marginVertical: 4,
  },
  block: {
    flex: 1,
    height: 18,
    borderRadius: 3,
  },
  blockRemaining: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#000000',
  },
  blockSpent: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#000000',
  },
  blockOver: {
    backgroundColor: Colors.redOver,
    borderWidth: 2,
    borderColor: '#000000',
  },
});
