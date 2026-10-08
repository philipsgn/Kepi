import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Car,
  Receipt,
  Film,
  BookOpen,
  HeartPulse,
  Sparkles,
  TrendingUp,
} from 'lucide-react-native';

export interface ExpenseCategoryItem {
  id: string;
  label: string;
  shortLabel: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}

export const EXPENSE_CATEGORIES: ExpenseCategoryItem[] = [
  { id: 'an_uong', label: 'Ăn uống & Cà phê', shortLabel: 'Ăn uống', Icon: Utensils },
  { id: 'mua_sam', label: 'Mua sắm', shortLabel: 'Mua sắm', Icon: ShoppingBag },
  { id: 'di_chuyen', label: 'Đi lại & Xe cộ', shortLabel: 'Đi lại', Icon: Car },
  { id: 'hoa_don', label: 'Hóa đơn & Cố định', shortLabel: 'Hóa đơn', Icon: Receipt },
  { id: 'giai_tri', label: 'Giải trí & Chill', shortLabel: 'Giải trí', Icon: Film },
  { id: 'hoc_tap', label: 'Học tập & Sách', shortLabel: 'Học tập', Icon: BookOpen },
  { id: 'suc_khoe', label: 'Sức khỏe & Thuốc', shortLabel: 'Sức khỏe', Icon: HeartPulse },
  { id: 'khac', label: 'Chi tiêu khác', shortLabel: 'Khác', Icon: Sparkles },
];

/**
 * Tìm cấu hình danh mục theo ID hoặc chuỗi tên
 */
export function getCategoryConfig(categoryIdOrName?: string | null): ExpenseCategoryItem {
  if (!categoryIdOrName) {
    return EXPENSE_CATEGORIES[0];
  }
  const clean = categoryIdOrName.toLowerCase().trim();

  // Match chính xác id
  const exact = EXPENSE_CATEGORIES.find((c) => c.id === clean);
  if (exact) return exact;

  // Match từ khóa
  if (
    clean.includes('ăn') ||
    clean.includes('uống') ||
    clean.includes('cà phê') ||
    clean.includes('food') ||
    clean.includes('coffee')
  ) {
    return EXPENSE_CATEGORIES[0];
  }
  if (
    clean.includes('mua') ||
    clean.includes('sắm') ||
    clean.includes('quần áo') ||
    clean.includes('shop')
  ) {
    return EXPENSE_CATEGORIES[1];
  }
  if (
    clean.includes('đi') ||
    clean.includes('xe') ||
    clean.includes('xăng') ||
    clean.includes('grab') ||
    clean.includes('bus')
  ) {
    return EXPENSE_CATEGORIES[2];
  }
  if (
    clean.includes('hóa đơn') ||
    clean.includes('tiền nhà') ||
    clean.includes('điện') ||
    clean.includes('nước') ||
    clean.includes('mạng') ||
    clean.includes('internet')
  ) {
    return EXPENSE_CATEGORIES[3];
  }
  if (
    clean.includes('chơi') ||
    clean.includes('phim') ||
    clean.includes('game') ||
    clean.includes('chill') ||
    clean.includes('giải trí')
  ) {
    return EXPENSE_CATEGORIES[4];
  }
  if (
    clean.includes('học') ||
    clean.includes('sách') ||
    clean.includes('khóa học') ||
    clean.includes('bút') ||
    clean.includes('vở')
  ) {
    return EXPENSE_CATEGORIES[5];
  }
  if (
    clean.includes('thuốc') ||
    clean.includes('khám') ||
    clean.includes('bệnh') ||
    clean.includes('sức khỏe') ||
    clean.includes('gym')
  ) {
    return EXPENSE_CATEGORIES[6];
  }

  return EXPENSE_CATEGORIES[7]; // Khác
}

/**
 * Render icon đơn sắc (Monochrome) tối giản, sang trọng chuẩn DESIGN.md
 * Hỗ trợ cả danh mục tùy biến mới và danh mục hệ thống cũ.
 */
export function renderCategoryMonochromeIcon({
  categoryId,
  isIncome,
  size = 24,
  color = '#E59844',
  strokeWidth = 1.8,
}: {
  categoryId?: string | null;
  isIncome?: boolean;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  if (isIncome) {
    return <TrendingUp size={size} color={color} strokeWidth={strokeWidth} />;
  }

  // 1. Kiểm tra trong store danh mục tùy biến mới nếu có
  try {
    const { useCategoryStore } = require('../store/categoryStore');
    const customCat = useCategoryStore.getState().getCategoryById(categoryId || '');
    if (customCat && customCat.icon) {
      const { CATEGORY_ICON_MAP } = require('./categoryDefaults');
      const IconComponent = CATEGORY_ICON_MAP[customCat.icon] || Sparkles;
      return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
    }
  } catch {}

  // 2. Fallback về cấu hình mặc định cũ
  const config = getCategoryConfig(categoryId);
  const IconComponent = config.Icon;
  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
}

/**
 * Render icon vector trực tiếp từ tên chuỗi icon
 */
export function renderDynamicCategoryIcon({
  iconName,
  size = 20,
  color = '#E59844',
  strokeWidth = 2,
}: {
  iconName: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const { CATEGORY_ICON_MAP } = require('./categoryDefaults');
  const IconComponent = CATEGORY_ICON_MAP[iconName] || Sparkles;
  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
}
