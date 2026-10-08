/**
 * HỆ THỐNG MÀU SẮC KHỐI VUÔNG (BLOCKY DESIGN SYSTEM)
 * Tuân thủ nghiêm ngặt mục 4 của đặc tả giao diện mới
 */

export const Colors = {
  // Nền & Bề mặt Khối
  bgDark: '#0E0E10',            // Nền tối mặc định
  surfaceDark: '#1A1A1D',       // Bề mặt khối tối
  borderBlack: '#000000',       // Viền đen 3px chuẩn khối
  surfaceCream: '#FFF4CC',      // Kem (nền sáng, vùng nhấn nổi)
  surfaceWhite: '#FFFFFF',      // Trắng tinh khiết

  // Màu chủ đạo & Điểm nhấn
  primaryYellow: '#FFC800',     // Vàng chính (hành động, số tiền quan trọng, chữ trên nền vàng luôn đen)
  greenSafe: '#2BD05B',         // Xanh ổn (an toàn, thu nhập, đã giữ lại)
  redOver: '#FF4D4D',           // Đỏ vượt (vượt ngân sách, không mua, cảnh báo)
  blueInfo: '#3AA7FF',          // Xanh dương thông tin

  // Bevel Cạnh Nổi
  bevelLight: 'rgba(255, 255, 255, 0.45)', // Vạch sáng 2px cạnh trên-trái
  bevelDark: 'rgba(0, 0, 0, 0.35)',         // Vạch tối 2px cạnh dưới-phải

  // Điều hướng nổi (Floating Pill)
  navPillActive: 'rgba(255, 200, 0, 0.22)', // Nền viên thuốc vàng nhạt khi active
  navBlurOverlay: 'rgba(20, 20, 20, 0.55)', // Lớp phủ kính mờ

  // Văn bản & Nhãn
  textLight: '#FFFFFF',
  textSecondary: '#A0A0A5',
  textMuted: '#686870',
  textDark: '#000000',

  // Aliases tương thích ngược với các component cũ
  bgPrimary: '#0E0E10',
  bgCamera: '#0E0E10',
  surfacePaper: '#1A1A1D',
  surfaceGlass: 'rgba(20, 20, 20, 0.55)',
  surfaceGlassDark: 'rgba(20, 20, 20, 0.55)',
  accentGold: '#FFC800',
  accentGoldLight: 'rgba(255, 200, 0, 0.22)',
  incomeMint: '#2BD05B',
  incomeMintLight: 'rgba(43, 208, 91, 0.15)',
  expenseCoral: '#FF4D4D',
  expenseCoralLight: 'rgba(255, 77, 77, 0.15)',
  cautionAmber: '#FFC800',
  cautionAmberLight: '#FFF4CC',
  textCharcoal: '#FFFFFF',
  borderSoft: 'rgba(255, 255, 255, 0.12)',
  borderGold: '#FFC800',
  statusSafe: '#2BD05B',
  statusCaution: '#FFC800',
  statusOver: '#FF4D4D',
  gameYellow: '#FFC800',
  gameYellowLight: '#FFF4CC',
  cozyPurple: '#3AA7FF',
  cozyPurpleLight: 'rgba(58, 167, 255, 0.15)',
  borderTactile: '#000000',
  accentAutumn: '#FFC800',
  comMint: '#2BD05B',
  warningCoral: '#FF4D4D',
  accentOrange: '#E59844',
} as const;

export type ColorToken = keyof typeof Colors;
