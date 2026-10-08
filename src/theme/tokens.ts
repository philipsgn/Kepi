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
 * 1. TONE SÁNG: VÀNG HOÀNG GIA & KEM BƠ THƯỢNG HẠNG (WARM LUXURY GOLD)
 * Kem bơ thượng hạng, viền vàng kim tuyến thanh lịch, nút bấm Vàng Kim Gradient rực rỡ.
 */
export const lightTokens: ColorTokens = {
  bg: '#FAF7F0',            // Kem ngà bơ thượng hạng
  background: '#FAF7F0',
  surface: '#FFFDF9',       // Bề mặt thẻ trắng kem ngà ngọc trai
  surfaceAlt: '#F5EEDB',    // Bề mặt phụ kem bơ ấm
  border: 'rgba(217, 163, 39, 0.18)', // Viền vàng ánh kim mờ tinh tế

  text: '#1C1812',          // Đen than ấm, tương phản sắc sảo trên nền kem
  textSub: '#6E6252',       // Chữ phụ nâu xám dịu
  textMuted: '#9C8E7B',     // Chú thích mờ

  primary: '#E5A823',       // Vàng kim hoàng gia
  textOnPrimary: '#1C1812', // Chữ trên nền vàng: đen than ấm
  primarySoft: '#FEF3D6',   // Nền chip / pill vàng bơ nhạt

  accent: '#C98612',        // Hổ phách đậm
  accentSoft: '#FFF6E0',

  success: '#288C5E',       // Xanh an toàn dịu mắt
  successSoft: 'rgba(40, 140, 94, 0.12)',
  danger: '#C94636',        // Ngói trầm vượt ngân sách
  dangerSoft: 'rgba(201, 70, 54, 0.12)',
  warning: '#D98C15',       // Vàng cam cảnh báo

  gradient: ['#FFFDF8', '#F6EDD6'],       // Dải nền kem lướt sang vàng bơ
  primaryGradient: ['#F5B738', '#E29913'], // Gradient Vàng Hoàng Kim cho CTA & Highlight
  glowColor: 'rgba(229, 168, 35, 0.35)',   // Bóng phát sáng vàng kim tuyến

  shadowColor: '#2D2318',
  shadowOpacity: 0.06,
};

/**
 * 2. TONE TỐI: SPACE GRAY TITANIUM (APPLE LUXURY DARK)
 * Đen than chì sâu thẳm OLED, bề mặt Space Gray Titanium, viền kim loại bạc hairline và điểm nhấn Titan bóng mờ.
 */
export const darkTokens: ColorTokens = {
  bg: '#0E1013',            // Đen xám than chì sâu thẳm, dịu mắt OLED
  background: '#0E1013',
  surface: '#181A1F',       // Space Gray Titanium sâu lắng
  surfaceAlt: '#22252C',    // Xám bề mặt kim loại trung tính
  border: 'rgba(255, 255, 255, 0.08)', // Viền hairline kim loại bạc

  text: '#F7F8FA',          // Trắng bạc tinh khiết
  textSub: '#A2A8B5',       // Xám bạc titan phụ
  textMuted: '#666C7A',     // Xám khói mờ

  primary: '#F0F2F5',       // Bạc trắng kim loại sáng bóng
  textOnPrimary: '#0E1013', // Chữ đen tuyền sắc nét trên nền bạc
  primarySoft: 'rgba(240, 242, 245, 0.12)',

  accent: '#9CA3AF',        // Xám kim loại thanh lịch
  accentSoft: 'rgba(156, 163, 175, 0.15)',

  success: '#34D399',       // Xanh ngọc cyber sáng
  successSoft: 'rgba(52, 211, 153, 0.14)',
  danger: '#F87171',        // Đỏ neon dịu
  dangerSoft: 'rgba(248, 113, 113, 0.14)',
  warning: '#FBBF24',       // Hổ phách sáng

  gradient: ['#181A20', '#101115'],       // Dải xám titan lướt sang than chì
  primaryGradient: ['#F8FAFC', '#D1D5DB'], // Titanium Gradient cho CTA
  glowColor: 'rgba(240, 242, 245, 0.20)',   // Ánh sáng kim loại bạc

  shadowColor: '#000000',
  shadowOpacity: 0,
};

/**
 * 3. TONE MÁT: COOL MINT & AQUA JADE GRADIENT (FRESH BREEZE)
 * Bạc hà sương mai mát lạnh kết hợp Gradient kép rực rỡ từ Xanh Mint sang Xanh Ngọc Bích / Aqua.
 */
export const coolTokens: ColorTokens = {
  bg: '#EDF9F5',            // Bạc hà sương mai mát lạnh
  background: '#EDF9F5',
  surface: '#FFFFFF',       // Trắng tuyết ngọc trai thanh khiết
  surfaceAlt: '#DCF5EB',    // Bề mặt bạc hà mềm mại
  border: 'rgba(16, 185, 129, 0.18)', // Viền ngọc bích sương mai

  text: '#0B3326',          // Xanh ngọc rừng thẫm, tương phản sắc nét
  textSub: '#2D6A53',       // Chữ phụ xanh ngọc thanh lịch
  textMuted: '#629983',     // Chú thích xanh khói mờ

  primary: '#10B981',       // Xanh ngọc bích tươi tắn
  textOnPrimary: '#FFFFFF', // Chữ trắng tuyết tinh khôi
  primarySoft: '#D1FAE5',   // Nền chip xanh bạc hà mát dịu

  accent: '#06B6D4',        // Xanh ngọc lam Aqua rực rỡ
  accentSoft: 'rgba(6, 182, 212, 0.14)',

  success: '#10B981',       // Ngọc bích an toàn
  successSoft: 'rgba(16, 185, 129, 0.14)',
  danger: '#E15B4C',        // San hô trầm
  dangerSoft: 'rgba(225, 91, 76, 0.14)',
  warning: '#EAB308',       // Vàng nắng

  gradient: ['#EDF9F5', '#D1FAE5'],       // Dải bạc hà sương mai sang ngọc bích
  primaryGradient: ['#10B981', '#06B6D4'], // Gradient kép Mint sang Aqua Jade rực rỡ
  glowColor: 'rgba(16, 185, 129, 0.35)',   // Bóng phát sáng ngọc bích bừng sáng

  shadowColor: '#0B3326',
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

