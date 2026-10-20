import React from 'react';
import {
  Utensils,
  Coffee,
  Pizza,
  Beer,
  ShoppingBag,
  ShoppingCart,
  Home,
  Zap,
  Droplets,
  Wifi,
  Phone,
  Car,
  Bike,
  Fuel,
  Plane,
  Train,
  Heart,
  Baby,
  Users,
  Gift,
  HeartPulse,
  Dumbbell,
  Pill,
  GraduationCap,
  BookOpen,
  Briefcase,
  Laptop,
  PawPrint,
  Trees,
  Flower2,
  Wallet,
  Coins,
  PiggyBank,
  TrendingUp,
  Award,
  Tag,
  Sparkles,
  MoreHorizontal,
} from 'lucide-react-native';
import { CategoryItem } from '../types/category';

export const CATEGORY_ICON_MAP: Record<string, React.ComponentType<any>> = {
  Utensils,
  Coffee,
  Pizza,
  Beer,
  ShoppingBag,
  ShoppingCart,
  Home,
  Zap,
  Droplets,
  Wifi,
  Phone,
  Car,
  Bike,
  Fuel,
  Plane,
  Train,
  Heart,
  Baby,
  Users,
  Gift,
  HeartPulse,
  Dumbbell,
  Pill,
  GraduationCap,
  BookOpen,
  Briefcase,
  Laptop,
  PawPrint,
  Trees,
  Flower2,
  Wallet,
  Coins,
  PiggyBank,
  TrendingUp,
  Award,
  Tag,
  Sparkles,
  MoreHorizontal,
};

export const AVAILABLE_CATEGORY_ICONS = [
  'Utensils',
  'Coffee',
  'Pizza',
  'ShoppingBag',
  'ShoppingCart',
  'Home',
  'Zap',
  'Droplets',
  'Wifi',
  'Car',
  'Fuel',
  'Plane',
  'Heart',
  'Baby',
  'Gift',
  'HeartPulse',
  'Dumbbell',
  'Pill',
  'GraduationCap',
  'BookOpen',
  'Laptop',
  'PawPrint',
  'Trees',
  'Flower2',
  'Wallet',
  'Coins',
  'PiggyBank',
  'TrendingUp',
  'Award',
  'Tag',
  'Sparkles',
  'MoreHorizontal',
] as const;

export const CATEGORY_PALETTE = [
  '#E59844', // Vàng Thu
  '#7E9F80', // Cốm Non
  '#9B59B6', // Tím Tây Hồ
  '#C86D51', // Ngói Rêu
  '#E74C3C', // Đỏ San Hô
  '#F39C12', // Cam Ấm
  '#16A085', // Ngọc Bích
  '#2980B9', // Xanh Lam
  '#27AE60', // Xanh Lá
  '#3498DB', // Xanh Biển
];

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  // 1. CHI TIÊU (9 Mục mặc định)
  {
    id: 'an_uong',
    userId: null,
    type: 'EXPENSE',
    name: 'Ăn uống',
    icon: 'Utensils',
    color: '#E59844',
    isDefault: true,
    isActive: true,
    orderIndex: 0,
  },
  {
    id: 'di_chuyen',
    userId: null,
    type: 'EXPENSE',
    name: 'Đi lại & Xe cộ',
    icon: 'Car',
    color: '#7E9F80',
    isDefault: true,
    isActive: true,
    orderIndex: 1,
  },
  {
    id: 'nha_cua',
    userId: null,
    type: 'EXPENSE',
    name: 'Nhà cửa & Hóa đơn',
    icon: 'Home',
    color: '#9B59B6',
    isDefault: true,
    isActive: true,
    orderIndex: 2,
  },
  {
    id: 'mua_sam',
    userId: null,
    type: 'EXPENSE',
    name: 'Mua sắm & Quần áo',
    icon: 'ShoppingBag',
    color: '#C86D51',
    isDefault: true,
    isActive: true,
    orderIndex: 3,
  },
  {
    id: 'suc_khoe',
    userId: null,
    type: 'EXPENSE',
    name: 'Thuốc men & Sức khỏe',
    icon: 'HeartPulse',
    color: '#E74C3C',
    isDefault: true,
    isActive: true,
    orderIndex: 4,
  },
  {
    id: 'gia_dinh',
    userId: null,
    type: 'EXPENSE',
    name: 'Gia đình & Cho mẹ',
    icon: 'Heart',
    color: '#F39C12',
    isDefault: true,
    isActive: true,
    orderIndex: 5,
  },
  {
    id: 'thu_cung',
    userId: null,
    type: 'EXPENSE',
    name: 'Nuôi thú cưng',
    icon: 'PawPrint',
    color: '#16A085',
    isDefault: true,
    isActive: true,
    orderIndex: 6,
  },
  {
    id: 'hoc_tap',
    userId: null,
    type: 'EXPENSE',
    name: 'Học tập & Sách vở',
    icon: 'GraduationCap',
    color: '#2980B9',
    isDefault: true,
    isActive: true,
    orderIndex: 7,
  },
  {
    id: 'khac',
    userId: null,
    type: 'EXPENSE',
    name: 'Chi tiêu khác',
    icon: 'MoreHorizontal',
    color: '#95A5A6',
    isDefault: true,
    isActive: true,
    orderIndex: 8,
  },

  // 2. THU NHẬP (6 Mục mặc định)
  {
    id: 'luong',
    userId: null,
    type: 'INCOME',
    name: 'Tiền lương chính',
    icon: 'Wallet',
    color: '#27AE60',
    isDefault: true,
    isActive: true,
    orderIndex: 0,
  },
  {
    id: 'thuong',
    userId: null,
    type: 'INCOME',
    name: 'Tiền thưởng & Tip',
    icon: 'Award',
    color: '#F1C40F',
    isDefault: true,
    isActive: true,
    orderIndex: 1,
  },
  {
    id: 'duoc_cho',
    userId: null,
    type: 'INCOME',
    name: 'Được cho / Biếu tặng',
    icon: 'Gift',
    color: '#E67E22',
    isDefault: true,
    isActive: true,
    orderIndex: 2,
  },
  {
    id: 'dau_tu',
    userId: null,
    type: 'INCOME',
    name: 'Lợi nhuận đầu tư',
    icon: 'TrendingUp',
    color: '#2ECC71',
    isDefault: true,
    isActive: true,
    orderIndex: 3,
  },
  {
    id: 'ban_do',
    userId: null,
    type: 'INCOME',
    name: 'Thanh lý / Bán đồ cũ',
    icon: 'Tag',
    color: '#3498DB',
    isDefault: true,
    isActive: true,
    orderIndex: 4,
  },
  {
    id: 'thu_khac',
    userId: null,
    type: 'INCOME',
    name: 'Thu nhập khác',
    icon: 'Coins',
    color: '#1ABC9C',
    isDefault: true,
    isActive: true,
    orderIndex: 5,
  },
];

export const DEFAULT_EXPENSE_CATEGORIES = DEFAULT_CATEGORIES.filter((c) => c.type === 'EXPENSE');
export const DEFAULT_INCOME_CATEGORIES = DEFAULT_CATEGORIES.filter((c) => c.type === 'INCOME');

/**
 * Tra cứu và định dạng tên danh mục sang tiếng Việt chuẩn mực, không bao giờ để lọt raw ID (suc_khoe, di_chuyen...)
 */
export function formatCategoryName(rawCat?: string, customCats?: CategoryItem[]): string {
  if (!rawCat) return 'Chi tiêu khác';
  if (customCats && customCats.length > 0) {
    const customMatch = customCats.find((c) => c.id === rawCat || c.name.toLowerCase() === rawCat.toLowerCase());
    if (customMatch) return customMatch.name;
  }
  const defaultMatch = DEFAULT_CATEGORIES.find(
    (c) => c.id === rawCat || c.name.toLowerCase() === rawCat.toLowerCase()
  );
  if (defaultMatch) return defaultMatch.name;

  // Fallback map cho các ID đặc thù
  const fallbackMap: Record<string, string> = {
    an_uong: 'Ăn uống',
    cafe: 'Cà phê & Trà',
    di_chuyen: 'Đi lại & Xe cộ',
    nha_cua: 'Nhà cửa & Hóa đơn',
    mua_sam: 'Mua sắm & Quần áo',
    suc_khoe: 'Thuốc men & Sức khỏe',
    gia_dinh: 'Gia đình & Cho mẹ',
    giai_tri: 'Giải trí & Phim ảnh',
    hoc_tap: 'Học tập & Sách vở',
    chi_tieu_khac: 'Chi tiêu khác',
    luong: 'Tiền lương',
    thuong: 'Thưởng & Tip',
    phu_cap: 'Phụ cấp công việc',
    dau_tu: 'Lợi nhuận đầu tư',
    ban_do: 'Thanh lý / Bán đồ cũ',
    thu_khac: 'Thu nhập khác',
    cuu_vi: 'Cứu ví',
  };

  return fallbackMap[rawCat] || rawCat;
}

