import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Camera, Search, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radii, spacing } from '../../theme/tokens';
import { Strings } from '../../constants/strings';

interface HistoryStickyHeaderProps {
  totalCount: number;
  onBackToCamera: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedFilter: string;
  onFilterChange: (f: string) => void;
  topInset?: number;
}

/**
 * Thanh tiêu đề dính đầu màn hình cho phần LỊCH SỬ của Camera — Phiên bản "Ấm, tĩnh, sang"
 * Tuân thủ mục 3.4 của đặc tả CAMERA.md:
 * - Nút quay về Camera dạng tròn vàng ấm
 * - Tiêu đề LỊCH SỬ và huy hiệu số đếm tabular-nums
 * - Ô tìm kiếm bo tròn mềm mại và dải chip lọc cuộn ngang dạng viên thuốc
 */
export const HistoryStickyHeader: React.FC<HistoryStickyHeaderProps> = ({
  totalCount,
  onBackToCamera,
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  topInset = 40,
}) => {
  const { tokens } = useTheme();

  const filterOptions = [
    { key: 'all', label: Strings.history.filterAll },
    { key: 'expense', label: 'Khoản chi' },
    { key: 'income', label: 'Thu nhập' },
    { key: 'an_uong', label: 'Ăn uống' },
    { key: 'mua_sam', label: 'Mua sắm' },
    { key: 'di_chuyen', label: 'Di chuyển' },
    { key: 'co_dinh', label: 'Cố định' },
    { key: 'chi_tieu_khac', label: 'Khác' },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.bg,
          borderBottomColor: tokens.border,
          paddingTop: topInset,
        },
      ]}
    >
      {/* 1. HÀNG TIÊU ĐỀ CHÍNH */}
      <View style={styles.titleRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBackToCamera();
          }}
          style={[styles.backCamBtn, { backgroundColor: tokens.primary }]}
        >
          <Camera size={18} color="#1B2733" strokeWidth={2.4} />
        </TouchableOpacity>

        <Text style={[styles.titleText, { color: tokens.text }]}>
          {Strings.history.title}
        </Text>

        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: tokens.surfaceAlt,
              borderColor: tokens.border,
            },
          ]}
        >
          <Text style={[styles.countText, { color: tokens.textMuted }]}>
            {Strings.history.itemsCount(totalCount)}
          </Text>
        </View>
      </View>

      {/* 2. Ô TÌM KIẾM BO TRÒN */}
      <View
        style={[
          styles.searchBox,
          {
            backgroundColor: tokens.surfaceAlt,
            borderColor: tokens.border,
          },
        ]}
      >
        <Search size={15} color={tokens.textMuted} strokeWidth={2.2} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder={Strings.history.searchPlaceholder}
          placeholderTextColor={tokens.textMuted}
          style={[styles.searchInput, { color: tokens.text }]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={15} color={tokens.textMuted} strokeWidth={2.2} />
          </TouchableOpacity>
        )}
      </View>

      {/* 3. DẢI CHIP LỌC CUỘN NGANG DẠNG VIÊN THUỐC */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {filterOptions.map((opt) => {
          const isActive = selectedFilter === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              activeOpacity={0.8}
              onPress={() => {
                Haptics.selectionAsync();
                onFilterChange(opt.key);
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? tokens.primarySoft : tokens.surface,
                  borderColor: isActive ? tokens.primary : tokens.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isActive ? tokens.text : tokens.textMuted,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs + 4,
  },
  backCamBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  countBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 38,
    marginBottom: spacing.xs + 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    marginLeft: 6,
  },
  filterScroll: {
    flexDirection: 'row',
    paddingVertical: 2,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    letterSpacing: -0.2,
  },
});
