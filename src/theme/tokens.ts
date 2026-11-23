/**
 * DESIGN TOKENS — PIGFLY (KAWAII NEO-BRUTALIST PIXEL — STYLE HEO CON 2.0 — QĐ 160)
 *
 * Hệ thống 2 Theme Hòa Quyện (Loại bỏ hoàn toàn Xanh Mint):
 * 1. "Heo Con Vàng Nâu" (`heocon` — MẶC ĐỊNH DUY NHẤT): Phong cách Neo-Brutalist Pixel viền 3px Nâu Mực, bóng cứng 0-blur, nền Kem Sàn #F6EEDC, Gradient Pastel Nhẹ Vàng Cám → Vàng Nâu Nướng.
 * 2. "Hồng Heo Pastel" (`pink`): Phong cách Locket Prototype linh vật Heo Hồng, nền Kem Dâu Sữa #FFF5F7, viền Nâu Socola Dâu #3B0713, Gradient Hồng Đào → San Hô.
 */

export type ThemeMode = 'heocon' | 'pink';
export type ResolvedTheme = 'heocon' | 'pink';

// Hỗ trợ tương thích ngược cho các import kiểu cũ nếu có
export type LegacyThemeMode = 'light' | 'dark' | 'cool' | 'pink' | 'heocon';

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
 * 0. THEME CHỦ ĐẠO MẶC ĐỊNH: "HEO CON" (`heocon`) — NEO-BRUTALIST PIXEL ART
 * Nền Kem Sàn (#F6EEDC), Thẻ Kem Trắng Ngọc (#FFFBF1), Viền Nâu Mực (#2B2118) 3px.
 * Điểm nhấn Vàng Cám (#F4B93B), Hồng Heo Phấn (#F9B8C4).
 * Chữ Nâu Mực (#2B2118) đạt chuẩn tương phản AAA 11.2:1 và 11.9:1.
 */
export const heoconTokens: ColorTokens = {
  bg: '#F6EEDC',              // Kem Sàn
  background: '#F6EEDC',
  surface: '#FFFBF1',         // Kem Trắng Ngọc (thẻ Card)
  surfaceAlt: '#F6EEDC',      // Track thanh tiến độ / nền ô trống
  border: '#2B2118',          // VIỀN ĐẶC 3px

  text: '#2B2118',            // Nâu Mực — chữ & số tài chính
  textSub: '#6E5C48',         // Nâu Vôi Đậm — chữ phụ ≥12px (tương phản 6.2:1 trên thẻ, PASS AA/AAA)
  textMuted: '#7A6852',       // Nâu Vôi Dịu — chú thích (5.2:1 trên thẻ, PASS AA)

  primary: '#F4B93B',         // Vàng Cám — nút hành động chính
  textOnPrimary: '#2B2118',   // CHỮ NÂU MỰC trên nút vàng (không phải trắng!) — tương phản 7.8:1 PASS AAA
  primarySoft: 'rgba(244, 185, 59, 0.18)',

  accent: '#F9B8C4',          // Hồng Heo Phấn (mascot, điểm nhấn ấm)
  accentSoft: 'rgba(249, 184, 196, 0.30)',

  success: '#5E9A57',         // Xanh Lá Vườn — đạt / dưới hạn mức
  successSoft: 'rgba(94, 154, 87, 0.16)',
  danger: '#E0452B',          // Đỏ Cam Lửa — lố hạn mức
  dangerSoft: 'rgba(224, 69, 43, 0.14)',
  warning: '#F4B93B',         // Tiệm cận hạn mức dùng chính vàng cám

  gradient: ['#FFFDF8', '#F8F1E2'],        // Kem Trắng Ngọc → Kem Nâu Ấm (Gradient Pastel Nhẹ)
  primaryGradient: ['#F7CA65', '#EEA828'], // Vàng Cám Nắng → Vàng Nâu Nướng (Gradient Pastel Nhẹ)
  glowColor: 'rgba(43, 33, 24, 0.25)',

  shadowColor: '#2B2118',
  shadowOpacity: 1,           // bóng CỨNG 0-blur
};

/**
 * 1. THEME HỖ TRỢ: "HỒNG HEO PASTEL" (`pink`) — SẮC HỒNG PASTEL LINH VẬT PIGFLY (PROTOTYPE)
 */
export const pinkTokens: ColorTokens = {
  bg: '#FFF5F7',            // Kem Dâu Sữa Heo dịu mắt
  background: '#FFF5F7',
  surface: '#FFFFFF',       // Bề mặt thẻ Trắng Ngọc Trai
  surfaceAlt: '#FCE7F3',    // Bề mặt phụ Hồng Phấn mềm mại cho input / chip
  border: '#3B0713',        // Viền đặc 3px Nâu Socola Dâu chuẩn Neo-Brutalist

  text: '#3B0713',          // Nâu Socola Dâu thẫm, tương phản 14.2:1 trên nền kem dâu (PASS AAA)
  textSub: '#881337',       // Đỏ mận thẫm thanh lịch, tương phản 7.6:1 (PASS AAA)
  textMuted: '#9F1239',     // Mận dịu chú thích, tương phản 6.2:1 (PASS AA)

  primary: '#F43F5E',       // Hồng Đào Heo Bay rực rỡ
  textOnPrimary: '#FFFFFF', // Chữ trắng tuyết trên nền hồng
  primarySoft: 'rgba(244, 63, 94, 0.12)',

  accent: '#FB7185',        // Hồng phấn pastel má hồng heo
  accentSoft: 'rgba(251, 113, 133, 0.15)',

  success: '#059669',       // Xanh Lộc Non giữ ví
  successSoft: 'rgba(5, 150, 105, 0.12)',
  danger: '#E11D48',        // Đỏ San Hô cảnh báo tiêu lố
  dangerSoft: 'rgba(225, 29, 72, 0.12)',
  warning: '#F59E0B',       // Hổ phách tươi sáng cảnh báo

  gradient: ['#FFFFFF', '#FFF0F3'],        // Trắng Ngọc → Kem Dâu Nhạt (Gradient Pastel Nhẹ)
  primaryGradient: ['#FB7185', '#F43F5E'], // Hồng Phấn Đào → Hồng San Hô Heo Bay (Gradient Pastel Nhẹ)
  glowColor: 'rgba(244, 63, 94, 0.35)',

  shadowColor: '#3B0713',
  shadowOpacity: 1,           // bóng CỨNG 0-blur
};

// Neo-Brutalist design tokens
export const neoTokens = {
  borderWidth: 3,
  borderWidthThin: 2,
  lineColor: '#D9C9A4',
  shadowColor: '#2B2118',
  fontBaloo: 'Baloo2_800ExtraBold',
  fontNunitoBold: 'Nunito_800ExtraBold',
  fontNunitoSemiBold: 'Nunito_600SemiBold',
};

// Aliases duy trì khả năng tương thích ngược
export const lightTokens: ColorTokens = heoconTokens;
export const darkTokens: ColorTokens = heoconTokens;
export const coolTokens: ColorTokens = pinkTokens;

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
  sm: 8,       // Ô tiến độ seg
  md: 14,      // Ô nhập, ảnh, bong bóng thoại
  lg: 18,      // Chip ghi nhanh 2 dòng
  xl: 20,      // Thẻ Hũ jar
  round: 28,   // Thẻ to (spend, scene vườn)
  full: 999,   // Viên thuốc pill, nút btn
} as const;

// Aliases for convenience
export const spacing = Spacing;
export const radii = Radii;
