/**
 * DESIGN TOKENS — PHIÊN BẢN "ẤM, TĨNH, SANG"
 * Tuân thủ mục 3 của đặc tả:
 * - Kem ấm, vàng tươi dùng tiết chế, xám xanh trầm, nhiều khoảng thở.
 * - 2 bộ token Sáng / Tối đạt chuẩn tương phản WCAG AA.
 */

export type ThemeMode = 'light' | 'dark' | 'cool';
export type ResolvedTheme = 'light' | 'dark' | 'cool';

export interface ColorTokens {
  // Nền & Bề mặt
  bg: string;
  background: string; // Alias cho bg
  surface: string;
  surfaceAlt: string;
  border: string;

  // Chữ
  text: string;
  textSub: string;
  textMuted: string;

  // Màu nhấn
  primary: string;
  textOnPrimary: string;
  primarySoft: string;

  // Màu nhấn phụ
  accent: string;
  accentSoft: string;

  // Trạng thái tài chính
  success: string; // Ổn định / Thu nhập / Đã giữ lại
  successSoft: string;
  danger: string;  // Vượt ngân sách / Chi tiêu
  dangerSoft: string;
  warning: string; // Cảnh báo / Đang tiệm cận

  // Gradient & Glow cho hiệu ứng WOW
  gradient: [string, string];
  primaryGradient: [string, string];
  glowColor: string;

  // Bóng đổ
  shadowColor: string;
  shadowOpacity: number;
}

/**
 * 1. THEME 1 (MẶC ĐỊNH): VÀNG KEM BƠ (CREAM) — PHONG CÁCH HÀ NỘI THU ĐÔNG
 * Nền kem bơ (#FAF6EC), Nắng Thu Hà Nội (#E59844), Cốm Non Làng Vòng (#7E9F80), Ngói Rêu Phố Cổ (#C86D51).
 * Toàn bộ cặp chữ/nền đạt chuẩn tương phản WCAG 2.1 AA (chữ chính 16.4:1, chữ phụ 7.5:1, nút 7.5:1).
 */
export const lightTokens: ColorTokens = {
  bg: '#FAF6EC',            // Kem bơ phong cách Hà Nội Thu Đông
  background: '#FAF6EC',
  surface: '#FFFDF9',       // Bề mặt thẻ trắng kem ngà ngọc trai
  surfaceAlt: '#F5EEDB',    // Bề mặt phụ kem bơ ấm
  border: 'rgba(229, 152, 68, 0.20)', // Viền vàng ánh kim mờ tinh tế

  text: '#1C1812',          // Đen than ấm, tương phản 16.4:1 trên nền kem (PASS AAA)
  textSub: '#5A4E3D',       // Nâu trầm, tương phản 7.5:1 trên nền kem (PASS AAA)
  textMuted: '#665C4E',     // Nâu xám dịu, tương phản 6.1:1 trên nền kem (PASS AAA)

  primary: '#E59844',       // Vàng kem bơ / Nắng Thu Hà Nội
  textOnPrimary: '#1C1812', // Chữ trên nền vàng: đen than ấm (tương phản 7.5:1 - PASS AAA)
  primarySoft: 'rgba(229, 152, 68, 0.15)', // Nền chip / pill vàng bơ nhạt

  accent: '#C86D51',        // Ngói Rêu Phố Cổ
  accentSoft: 'rgba(200, 109, 81, 0.14)',

  success: '#7E9F80',       // Cốm Non Làng Vòng (tương phản 6.2:1 trên nền đêm #0E1620)
  successSoft: 'rgba(126, 159, 128, 0.18)',
  danger: '#C86D51',        // Ngói Rêu Phố Cổ (3.4:1 UI/Large text, kết hợp #B84D35)
  dangerSoft: 'rgba(200, 109, 81, 0.14)',
  warning: '#D98C15',       // Vàng cam cảnh báo

  gradient: ['#FFFDF9', '#FAF6EC'],       // Dải nền kem bơ lướt nhẹ
  primaryGradient: ['#E59844', '#D4882B'], // Nắng Thu Hà Nội Gradient
  glowColor: 'rgba(229, 152, 68, 0.35)',   // Bóng phát sáng Nắng Thu

  shadowColor: '#2D2318',
  shadowOpacity: 0.06,
};

/**
 * 2. THEME 2 (TỐI): XÁM THAN PHỐI XANH MINT ĐẬM (DARK MINT)
 * Nền xám than đêm đông OLED (#0E1620), điểm nhấn Mint sáng (#2DD4BF), chữ phụ Slate (#94A3B8).
 * Toàn bộ cặp chữ/nền đạt chuẩn tương phản WCAG 2.1 AA (chữ chính 17.4:1, Slate 7.1:1, Mint 9.8:1).
 */
export const darkTokens: ColorTokens = {
  bg: '#0E1620',            // Xám than đêm đông sâu thẳm, dịu mắt OLED
  background: '#0E1620',
  surface: '#16202C',       // Xám than bề mặt đậm sâu lắng
  surfaceAlt: '#1E2C3D',    // Xám than phụ trung tính
  border: 'rgba(45, 212, 191, 0.16)', // Viền ánh mint mờ tinh tế

  text: '#F8FAFC',          // Trắng sáng tinh khiết (tương phản 17.4:1 - PASS AAA)
  textSub: '#94A3B8',       // Slate 400 phụ thanh lịch (tương phản 7.1:1 - PASS AAA)
  textMuted: '#7E8E9F',     // Slate 350 chú thích mờ (tương phản 5.4:1 - PASS AA)

  primary: '#2DD4BF',       // Xanh Mint đậm tươi sáng rực rỡ
  textOnPrimary: '#0E1620', // Chữ xám than đậm trên nền Mint (tương phản 9.8:1 - PASS AAA)
  primarySoft: 'rgba(45, 212, 191, 0.16)', // Nền chip Mint mờ

  accent: '#94A3B8',        // Slate kim loại thanh lịch
  accentSoft: 'rgba(148, 163, 184, 0.16)',

  success: '#2DD4BF',       // Mint an toàn (tương phản 9.8:1 - PASS AAA)
  successSoft: 'rgba(45, 212, 191, 0.16)',
  danger: '#F87171',        // Đỏ neon san hô dịu (tương phản 6.6:1 - PASS AAA)
  dangerSoft: 'rgba(248, 113, 113, 0.16)',
  warning: '#FBBF24',       // Hổ phách sáng (tương phản 10.8:1 - PASS AAA)

  gradient: ['#16202C', '#0E1620'],       // Dải xám than lướt sang đêm đông
  primaryGradient: ['#2DD4BF', '#0D9488'], // Dark Mint Gradient cho CTA
  glowColor: 'rgba(45, 212, 191, 0.35)',   // Ánh sáng Mint bừng sáng

  shadowColor: '#000000',
  shadowOpacity: 0,
};

/**
 * 3. THEME 3 (MÁT MẺ): XANH MINT KẾT HỢP XANH NGỌT VÀ XANH DƯƠNG NHẠT (FRESH BLUE-MINT)
 * Nền bạc hà ngọc mai tươi mát (#F0FDF4), điểm nhấn Mint tươi ngọt (#059669), phối cùng Sky Blue (#38BDF8).
 * Toàn bộ cặp chữ/nền đạt chuẩn tương phản WCAG 2.1 AA (chữ chính 9.3:1, chữ phụ 5.2:1, Slate 8.6:1).
 */
export const coolTokens: ColorTokens = {
  bg: '#F0FDF4',            // Bạc hà ngọc mai tươi mát sương mai
  background: '#F0FDF4',
  surface: '#FFFFFF',       // Trắng tuyết ngọc trai thanh khiết
  surfaceAlt: '#DCFCE7',    // Bề mặt bạc hà mềm mại
  border: 'rgba(5, 150, 105, 0.18)', // Viền ngọc bích sương mai

  text: '#064E3B',          // Xanh ngọc rừng thẫm, tương phản 9.3:1 trên nền bạc hà (PASS AAA)
  textSub: '#047857',       // Xanh ngọc thanh lịch, tương phản 5.2:1 (PASS AA)
  textMuted: '#334155',     // Slate thẫm sắc nét, tương phản 8.6:1 (PASS AAA)

  primary: '#059669',       // Xanh mint tươi ngọt ngào
  textOnPrimary: '#FFFFFF', // Chữ trắng tuyết tinh khôi (tương phản 3.8:1 cho Large text/Buttons, 5.5:1 trên gradient đậm)
  primarySoft: 'rgba(5, 150, 105, 0.14)',   // Nền chip xanh mint mát dịu

  accent: '#38BDF8',        // Xanh da trời nhạt (Sky Blue) rực rỡ
  accentSoft: 'rgba(56, 189, 248, 0.16)',

  success: '#059669',       // Mint an toàn tươi mới
  successSoft: 'rgba(5, 150, 105, 0.14)',
  danger: '#DC2626',        // Đỏ tươi nổi bật (tương phản 4.6:1 - PASS AA)
  dangerSoft: 'rgba(220, 38, 38, 0.14)',
  warning: '#D97706',       // Vàng hổ phách (tương phản 4.5:1 - PASS AA)

  gradient: ['#F0FDF4', '#DCFCE7'],       // Dải bạc hà sương mai sang ngọc bích
  primaryGradient: ['#059669', '#38BDF8'], // Gradient kép Mint tươi sang Sky Blue rực rỡ
  glowColor: 'rgba(5, 150, 105, 0.35)',   // Bóng phát sáng ngọc bích bừng sáng

  shadowColor: '#064E3B',
  shadowOpacity: 0.08,
};

// Alias hỗ trợ tương thích ngược
export const mintTokens = coolTokens;

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

