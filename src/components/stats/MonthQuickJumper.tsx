import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

interface MonthQuickJumperProps {
  months: { key: string; label: string; year: number; month: number }[];
  activeMonthKey: string;
  onSelectMonth: (monthKey: string) => void;
}

/**
 * Thanh chọn tháng nhảy nhanh dạng chip cuộn ngang — Phong cách "Ấm, tĩnh, sang"
 * Tuân thủ mục 2.5 của đặc tả docs/screens/STATS.md:
 * - Dải chip cuộn ngang, sáng theo tháng đang xem
 * - Khi đổi năm hiển thị chỉ số năm nhỏ gọn
 */
export const MonthQuickJumper: React.FC<MonthQuickJumperProps> = ({
  months,
  activeMonthKey,
  onSelectMonth,
}) => {
  const { tokens } = useTheme();

  if (months.length <= 1) return null;

  return (
    <View style={[styles.wrapper, { backgroundColor: tokens.bg, borderBottomColor: tokens.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.prefixLabel, { color: tokens.textMuted }]}>Tháng:</Text>
        {months.map((m, index) => {
          const isActive = m.key === activeMonthKey;
          const prev = months[index - 1];
          const isYearChanged = prev && prev.year !== m.year;

          return (
            <React.Fragment key={m.key}>
              {isYearChanged && (
                <View style={[styles.yearDivider, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
                  <Text style={[styles.yearText, { color: tokens.textMuted }]}>'{String(m.year).slice(-2)}</Text>
                </View>
              )}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelectMonth(m.key);
                }}
                style={[
                  styles.chip,
                  { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
                  isActive && [styles.chipActive, { backgroundColor: tokens.primary }],
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isActive ? '#1B2733' : tokens.textMuted },
                  ]}
                >
                  T{m.month}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 7,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
    flexDirection: 'row',
  },
  prefixLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  yearDivider: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.sm,
    borderWidth: 1,
    marginRight: 6,
  },
  yearText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
    marginRight: 6,
    borderWidth: 1,
  },
  chipActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
