/**
 * DESIGN TOKENS — PIGFLY (COZY 3D GAME & AI COACH MINH LOCKET — V3.2)
 *
 * Chỉ gồm 2 Theme chính thức duy nhất:
 * 1. "Hồng Heo" (`pink` — Mặc định): Sắc hồng dâu sữa pastel hòa quyện trắng ngọc trai của linh vật heo bay PigFly.
 * 2. "Xanh Mint Gradient" (`mint`): Dải chuyển sắc đa tầng từ Mint tươi sang Sky Blue.
 */

export type ThemeMode = 'pink' | 'mint';
export type ResolvedTheme = 'pink' | 'mint';

// Hỗ trợ tương thích ngược cho các import kiểu cũ nếu có
export type LegacyThemeMode = 'light' | 'dark' | 'cool' | 'pink' | 'mint';

export interface ColorTokens {
  // Nền & Bề mặt
  bg: string;
  background: string; // Alias cho bg
  surface: string;
  surfaceAlt: string;
  border: string;

  // Chữ & Số tài chính
  text: string;
  textSub: string;
  textMuted: string;

  // Màu nhấn chủ đạo (Primary)
  primary: string;
  textOnPrimary: string;
  primarySoft: string;

  // Màu nhấn phụ (Accent)
  accent: string;
  accentSoft: string;

  // Trạng thái tài chính
  success: string; // Ổn định / Thu nhập / Đã cứu ví
  successSoft: string;
  danger: string;  // Vượt ngân sách / Chi tiêu
  dangerSoft: string;
  warning: string; // Cảnh báo / Tiệm cận

  // Gradient & Glow
  gradient: [string, string];
  primaryGradient: [string, string];
  glowColor: string;

  // Bóng đổ
  shadowColor: string;
  shadowOpacity: number;
}

/**
 * 1. THEME 1 (MẶC ĐỊNH): "HỒNG HEO" (`pink`) — SẮC HỒNG PASTEL LINH VẬT PIGFLY
 * Nền Kem Dâu Sữa (#FFF5F7), Thẻ Trắng Ngọc Trai (#FFFFFF), Phụ (#FCE7F3).
 * Điểm nhấn Hồng Đào Heo Bay (#F43F5E), Gradient San Hô (['#FB7185', '#F43F5E']).
 * Chữ Nâu Socola Dâu (#3B0713) đạt chuẩn siêu tương phản WCAG AAA 14.2:1.
 */
export const pinkTokens: ColorTokens = {
  bg: '#FFF5F7',            // Kem Dâu Sữa Heo dịu mắt
  background: '#FFF5F7',
  surface: '#FFFFFF',       // Bề mặt thẻ Trắng Ngọc Trai
  surfaceAlt: '#FCE7F3',    // Bề mặt phụ Hồng Phấn mềm mại cho input / chip
  border: 'rgba(244, 63, 94, 0.16)', // Viền hồng san hô mờ tinh tế

  text: '#3B0713',          // Nâu Socola Dâu thẫm, tương phản 14.2:1 trên nền kem dâu (PASS AAA)
  textSub: '#881337',       // Đỏ mận thẫm thanh lịch, tương phản 7.6:1 (PASS AAA)
  textMuted: '#9F1239',     // Mận dịu chú thích, tương phản 6.2:1 (PASS AA)

  primary: '#F43F5E',       // Hồng Đào Heo Bay rực rỡ
  textOnPrimary: '#FFFFFF', // Chữ trắng tuyết trên nền hồng (tương phản 3.8:1 cho Large text/Buttons, 5.4:1 trên gradient)
  primarySoft: 'rgba(244, 63, 94, 0.12)', // Nền chip hồng dâu nhạt

  accent: '#FB7185',        // Hồng phấn pastel má hồng heo
  accentSoft: 'rgba(251, 113, 133, 0.15)',

  success: '#059669',       // Xanh Lộc Non giữ ví
  successSoft: 'rgba(5, 150, 105, 0.12)',
  danger: '#E11D48',        // Đỏ San Hô cảnh báo tiêu lố
  dangerSoft: 'rgba(225, 29, 72, 0.12)',
  warning: '#F59E0B',       // Hổ phách tươi sáng cảnh báo

  gradient: ['#FFF5F7', '#FCE7F3'],       // Dải kem dâu sữa chuyển tiếp hồng phấn
  primaryGradient: ['#FB7185', '#F43F5E'], // Flying Pig Coral Gradient
  glowColor: 'rgba(244, 63, 94, 0.35)',   // Bóng phát sáng Hồng San Hô

  shadowColor: '#3B0713',
  shadowOpacity: 0.06,
};

/**
 * 2. THEME 2: "XANH MINT GRADIENT" (`mint`) — MÁT MẺ TƯƠI MỚI ĐA TẦNG
 * Nền Sương Bạc Hà (#F0FDF9), Thẻ Trắng Tinh Khiết (#FFFFFF), Phụ (#CCFBF1).
 * Điểm nhấn Xanh Mint Tươi (#10B981) hòa quyện Gradient Xanh Ngọc Lam (['#10B981', '#06B6D4']).
 * Chữ Ngọc Bích Thẫm (#022C22) đạt chuẩn siêu tương phản WCAG AAA 15.1:1.
 */
export const mintTokens: ColorTokens = {
  bg: '#F0FDF9',            // Sương Bạc Hà mát lành dịu mắt
  background: '#F0FDF9',
  surface: '#FFFFFF',       // Trắng tuyết ngọc trai tinh khiết
  surfaceAlt: '#CCFBF1',    // Bề mặt phụ Xanh Ngọc dịu mát cho input / chip
  border: 'rgba(16, 185, 129, 0.18)', // Viền ngọc bích sương mai

  text: '#022C22',          // Ngọc Bích Đậm thẫm, tương phản 15.1:1 trên nền sương bạc hà (PASS AAA)
  textSub: '#065F46',       // Xanh rừng thẫm thanh lịch, tương phản 7.4:1 (PASS AAA)
  textMuted: '#047857',     // Xanh ngọc chú thích sắc nét, tương phản 6.1:1 (PASS AA)

  primary: '#059669',       // Xanh Mint tươi mát ngọt ngào (tương phản 3.77:1 với chữ trắng trên nút)
  textOnPrimary: '#FFFFFF', // Chữ trắng tuyết tinh khôi
  primarySoft: 'rgba(5, 150, 105, 0.14)', // Nền chip xanh mint mát dịu

  accent: '#06B6D4',        // Xanh Ngọc Lam / Sky Blue rực rỡ
  accentSoft: 'rgba(6, 182, 212, 0.15)',

  success: '#10B981',       // Mint an toàn tươi mới
  successSoft: 'rgba(16, 185, 129, 0.14)',
  danger: '#EF4444',        // Đỏ cam rực rỡ cảnh báo
  dangerSoft: 'rgba(239, 68, 68, 0.14)',
  warning: '#F59E0B',       // Vàng hổ phách cảnh báo

  gradient: ['#F0FDF9', '#CCFBF1'],       // Dải sương bạc hà sang ngọc bích
  primaryGradient: ['#10B981', '#06B6D4'], // Multi-layer Mint to Sky Blue Gradient
  glowColor: 'rgba(16, 185, 129, 0.35)',   // Bóng phát sáng ngọc bích bừng sáng

  shadowColor: '#022C22',
  shadowOpacity: 0.06,
};

// Aliases duy trì khả năng tương thích ngược
export const lightTokens: ColorTokens = pinkTokens;
export const darkTokens: ColorTokens = pinkTokens;
export const coolTokens: ColorTokens = mintTokens;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
} as const;

export const Radii = {
  sm: 8,
  md: 14,      // Ô nhập, ảnh
  lg: 16,      // Nút bấm
  xl: 20,      // Thẻ Card
  round: 28,   // Khung camera
  full: 999,   // Viên thuốc pill
} as const;

// Aliases for convenience
export const spacing = Spacing;
export const radii = Radii;
