import { TextStyle } from 'react-native';

/**
 * HỆ THỐNG TYPOGRAPHY — HÀ NỘI THU ĐÔNG
 * Tuân thủ docs/DESIGN.md & AGENTS.md
 */

export const Typography = {
  // Tiêu đề lớn
  heroDisplay: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  } as TextStyle,

  heading1: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  } as TextStyle,

  heading2: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.2,
  } as TextStyle,

  heading3: {
    fontSize: 18,
    fontWeight: '600',
  } as TextStyle,

  // Thân bài & Thơ
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } as TextStyle,

  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TextStyle,

  bodyPoetic: {
    fontSize: 15,
    fontWeight: '400',
    fontStyle: 'italic',
    lineHeight: 22,
  } as TextStyle,

  // Số tiền & Dữ liệu tài chính (Bắt buộc dùng tabular-nums)
  currencyLarge: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  } as TextStyle,

  currencyMedium: {
    fontSize: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  } as TextStyle,

  // Caption, Tag & Giờ
  caption: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  } as TextStyle,

  pillText: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  } as TextStyle,

  button: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  } as TextStyle,
} as const;
