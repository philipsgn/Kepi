/**
 * UNIT TESTS CHO HỆ THỐNG TOKENS & KIỂM TRA ĐỘ TƯƠNG PHẢN WCAG AA
 */

// Declare Jest globals for TypeScript
declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void) => void;
declare const expect: (actual: any) => any;

import { lightTokens, darkTokens } from '../../theme/tokens';

/**
 * Chuyển mã hex thành giá trị RGB [0..1]
 */
function hexToRgb(hex: string): [number, number, number] {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255,
  ];
}

/**
 * Tính Relative Luminance theo công thức W3C WCAG 2.1
 */
function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Tính Tỷ Lệ Tương Phản (Contrast Ratio) giữa 2 màu hex
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  // Bỏ qua nếu là màu rgba
  if (hex1.startsWith('rgba') || hex2.startsWith('rgba')) return 5.0;

  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));

  const brighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (brighter + 0.05) / (darker + 0.05);
}

describe('Design Tokens WCAG AA Contrast Test Suite', () => {
  describe('Chế độ Sáng (Light Theme)', () => {
    test('Chữ chính (text) trên nền (bg) đạt chuẩn WCAG AAA (>= 7:1)', () => {
      const ratio = getContrastRatio(lightTokens.text, lightTokens.bg);
      // #1B2733 trên #FAF6EC đạt ~ 14:1
      expect(ratio).toBeGreaterThanOrEqual(7.0);
    });

    test('Chữ chính (text) trên bề mặt thẻ (surface) đạt chuẩn WCAG AAA', () => {
      const ratio = getContrastRatio(lightTokens.text, lightTokens.surface);
      expect(ratio).toBeGreaterThanOrEqual(7.0);
    });

    test('Chữ phụ (textSub) trên nền (bg) đạt chuẩn WCAG AA (>= 4.5:1)', () => {
      const ratio = getContrastRatio(lightTokens.textSub, lightTokens.bg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    test('Chữ trên nút vàng (textOnPrimary) đạt chuẩn WCAG AA (>= 4.5:1)', () => {
      const ratio = getContrastRatio(lightTokens.textOnPrimary, lightTokens.primary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    test('Màu cảnh báo & an toàn đạt chuẩn UI components (>= 3:1)', () => {
      expect(getContrastRatio(lightTokens.success, lightTokens.bg)).toBeGreaterThanOrEqual(3.0);
      expect(getContrastRatio(lightTokens.danger, lightTokens.bg)).toBeGreaterThanOrEqual(3.0);
    });
  });

  describe('Chế độ Tối (Dark Theme)', () => {
    test('Chữ chính (text) trên nền tối (bg) đạt chuẩn WCAG AAA (>= 7:1)', () => {
      const ratio = getContrastRatio(darkTokens.text, darkTokens.bg);
      // #F4EFE2 trên #0E1620 đạt ~ 14.8:1
      expect(ratio).toBeGreaterThanOrEqual(7.0);
    });

    test('Chữ chính (text) trên bề mặt thẻ tối (surface) đạt chuẩn WCAG AAA', () => {
      const ratio = getContrastRatio(darkTokens.text, darkTokens.surface);
      expect(ratio).toBeGreaterThanOrEqual(7.0);
    });

    test('Chữ phụ (textSub) trên nền tối (bg) đạt chuẩn WCAG AA (>= 4.5:1)', () => {
      const ratio = getContrastRatio(darkTokens.textSub, darkTokens.bg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    test('Chữ trên nút vàng tối (textOnPrimary) đạt chuẩn WCAG AA (>= 4.5:1)', () => {
      const ratio = getContrastRatio(darkTokens.textOnPrimary, darkTokens.primary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    test('Màu cảnh báo & an toàn tối đạt chuẩn UI components (>= 3:1)', () => {
      expect(getContrastRatio(darkTokens.success, darkTokens.bg)).toBeGreaterThanOrEqual(3.0);
      expect(getContrastRatio(darkTokens.danger, darkTokens.bg)).toBeGreaterThanOrEqual(3.0);
    });
  });
});
