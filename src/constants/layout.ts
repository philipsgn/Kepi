import { ViewStyle } from 'react-native';

/**
 * HỆ THỐNG LAYOUT & SPACING — PHONG CÁCH KHỐI VUÔNG (BLOCKY)
 * Bội số của 4px, viền 3px, bóng cứng 4px 4px không blur
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BlockLayout = {
  borderWidth: 3,
  notchSize: 4,
  bevelWidth: 2,
  shadowOffset: 4,
  shadowOffsetPressed: 1,
  pressTranslation: 3,
  pressDurationMs: 80,
  shadowSm: {
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  } as ViewStyle,
  shadowBlock: {
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  } as ViewStyle,
};

export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  chunky: 16,
  full: 9999, // Dành riêng cho viên thuốc điều hướng nổi
} as const;

export const Shadows = {
  // Bóng cứng phong cách khối vuông (Hard Shadow - Không blur)
  hardBlock: {
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  } as ViewStyle,

  hardBlockPressed: {
    shadowColor: '#000000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  } as ViewStyle,

  // Aliases tương thích ngược
  chunky3D: {
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  } as ViewStyle,

  floating: {
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  } as ViewStyle,

  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 2,
  } as ViewStyle,

  paper: {
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  } as ViewStyle,
} as const;
