import React from 'react';
import Svg, { Rect } from 'react-native-svg';

/**
 * Bảng màu pixel ICP trích xuất 1:1 từ prototype/Ví Heo Con-20-11.html
 */
const ICP: Record<string, string> = {
  '#': '#2B2118', // Nâu mực
  w: '#FFFBF1',   // Kem / trắng sữa
  p: '#F9B8C4',   // Hồng heo
  s: '#EE90A6',   // Má hồng
  n: '#8A5A34',   // Gỗ nâu / mõm
  k: '#D9A27A',   // Da / gỗ sáng
  g: '#5E9A57',   // Xanh lá
  y: '#F4B93B',   // Vàng cám
  r: '#E0452B',   // Đỏ cam
  b: '#6DA9D9',   // Xanh dương
  m: '#4A4658',   // Nhựa đường xám tím
};

interface PixelIconProps {
  size?: number;
  color?: string; // Optional tint for default lines
}

/**
 * Helper render ma trận chuỗi ký tự thành SVG Pixel
 */
function renderPixelMatrix(rows: string[], palette: Record<string, string>, size: number = 24) {
  const height = rows.length;
  const width = Math.max(...rows.map((r) => r.length), 16);
  const pixelSize = 1;

  const rects: React.ReactNode[] = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const fill = palette[ch];
      if (fill) {
        rects.push(
          <Rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={pixelSize}
            height={pixelSize}
            fill={fill}
          />
        );
      }
    }
  });

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: size, height: size }}
    >
      {rects}
    </Svg>
  );
}

/**
 * Icon Chat Pixel (Bong bóng thoại có dòng chữ pixel) - 1:1 prototype
 */
const CHAT_ROWS = [
  '................',
  '.##############.',
  '.#wwwwwwwwwwww#.',
  '.#wwbbwbbwbbww#.',
  '.#wwwwwwwwwwww#.',
  '.#wbbbbbbbbbww#.',
  '.#wwwwwwwwwwww#.',
  '.#wwwwwwwwwwww#.',
  '..#w##########..',
  '...#ww#.........',
  '....##..........',
];

export const PixelIconChat: React.FC<PixelIconProps> = ({ size = 24 }) =>
  renderPixelMatrix(CHAT_ROWS, ICP, size);

/**
 * Icon Map Pin Pixel (Ghim bản đồ pixel) - 1:1 prototype
 */
const PIN_ROWS = [
  '.....######.....',
  '...##gggggg##...',
  '..#gggggggggg#..',
  '..#ggg####ggg#..',
  '..#ggg#ww#ggg#..',
  '..#ggg####ggg#..',
  '..#gggggggggg#..',
  '...#gggggggg#...',
  '....#gggggg#....',
  '.....#gggg#.....',
  '......#gg#......',
  '.......##.......',
];

export const PixelIconMapPin: React.FC<PixelIconProps> = ({ size = 24 }) =>
  renderPixelMatrix(PIN_ROWS, ICP, size);

/**
 * Icon Gamepad Arcade Pixel - 1:1 prototype
 */
const PAD_ROWS = [
  '................',
  '..############..',
  '.#wwwwwwwwwwww#.',
  '.#wwbwwwwwwrww#.',
  '.#wbbbwwwwrwrw#.',
  '.#wwbwwwwwwrww#.',
  '..#wwwwwwwwww#..',
  '...###....###...',
];

export const PixelIconGamepad: React.FC<PixelIconProps> = ({ size = 24 }) =>
  renderPixelMatrix(PAD_ROWS, ICP, size);

/**
 * Icon Quay Lại (Back Arrow) 16×16 Pixel Art — Top-left highlight + 1px ink outline (Quyết định 172)
 */
const BACK_16_ROWS = [
  '................',
  '.......##.......',
  '......#w#.......',
  '.....#ww#.......',
  '....#wwy#.......',
  '...#wwyy######..',
  '..#wwyyyyyyyy#..',
  '..#wyyyyyyyyy#..',
  '..#yyynnnnnnn#..',
  '...#ynnn######..',
  '....#nn#........',
  '.....#n#........',
  '......##........',
  '................',
];

export const PixelIconBack: React.FC<PixelIconProps> = ({ size = 18 }) =>
  renderPixelMatrix(BACK_16_ROWS, ICP, size);

/**
 * Icon Tải Lại (Reload) 16×16 Pixel Art — Top-left highlight + 1px ink outline (Quyết định 172)
 */
const RELOAD_16_ROWS = [
  '................',
  '.....######.....',
  '...##wwyyyy##...',
  '..#wwyy##yyyn#..',
  '..#wy#....#yn##.',
  '..#w#......#y##.',
  '..##.......###..',
  '................',
  '..###.......##..',
  '.##y#......#n#..',
  '.##ny#....#nn#..',
  '..#nyyy##nnnm#..',
  '...##nnnnmm##...',
  '.....######.....',
];

export const PixelIconReload: React.FC<PixelIconProps> = ({ size = 18 }) =>
  renderPixelMatrix(RELOAD_16_ROWS, ICP, size);

/**
 * Icon Vé Chơi (Ticket) 16×16 Pixel Art — Vàng đồng có răng cưa & sao sáng (Quyết định 172)
 */
const TICKET_16_ROWS = [
  '................',
  '................',
  '..############..',
  '.#wwyyyyyyyyy#..',
  '.#wyyyywyyyyy#..',
  '..#yyyw#wyyy#...',
  '..#yyyywyyyy#...',
  '.#yyyyyyyyyyn#..',
  '.#ynnnnnnnnnn#..',
  '..############..',
  '................',
  '................',
];

export const PixelIconTicket: React.FC<PixelIconProps> = ({ size = 18 }) =>
  renderPixelMatrix(TICKET_16_ROWS, ICP, size);

/**
 * Icon Cánh Heo Bay (Wing) 16×16 Pixel Art — Top-left shading + 1px ink outline (Quyết định 172)
 */
const WING_16_ROWS = [
  '................',
  '.......###......',
  '.....##www#.....',
  '...##wwwww#.....',
  '..#wwwwwwp#.....',
  '.#wwwwppppp##...',
  '.#wwwpppppppw#..',
  '..#wpppppppp#...',
  '...#ppsssss#....',
  '....##ssss#.....',
  '......####......',
  '................',
];

export const PixelIconWing: React.FC<PixelIconProps> = ({ size = 20 }) =>
  renderPixelMatrix(WING_16_ROWS, ICP, size);

/**
 * Icon Đèn Giao Thông (Traffic Light / Crossroad) 16×16 Pixel Art (Quyết định 172)
 */
const TRAFFIC_16_ROWS = [
  '.....######.....',
  '....#wmmmm#.....',
  '....#m#rr#m#....',
  '....#m#rr#m#....',
  '....#mmmmmm#....',
  '....#m#yy#m#....',
  '....#m#yy#m#....',
  '....#mmmmmm#....',
  '....#m#gg#m#....',
  '....#m#gg#m#....',
  '....#mmmmmm#....',
  '.....######.....',
  '......#mm#......',
  '......#mm#......',
];

export const PixelIconTraffic: React.FC<PixelIconProps> = ({ size = 20 }) =>
  renderPixelMatrix(TRAFFIC_16_ROWS, ICP, size);

/**
 * Icon Heo-Coach Pixel (Mặt heo 16×16 viền mực, tai hồng, mõm cam hồng)
 */
const PIG_COACH_ROWS = [
  '..###......###..',
  '.#ppp#....#ppp#.',
  '.#pppp####pppp#.',
  '.#pppppppppppp#.',
  '.#pwkppppppwkpp#',
  '.#pkkppppppkkpp#',
  '.#pppppppppppp#.',
  '.#psppnnnnppsp#.',
  '.#ppppnkkkknpp#.',
  '..#pppnnnnpppp#.',
  '...#pppppppp#...',
  '....########....',
];

export const PixelIconPigCoach: React.FC<PixelIconProps> = ({ size = 24 }) =>
  renderPixelMatrix(PIG_COACH_ROWS, ICP, size);

/**
 * Icon Hội Bạn Thân (Squad) Pixel (Hai chú heo / bạn thân kề vai)
 */
const SQUAD_ROWS = [
  '..###......###..',
  '.#ppp#....#yyy#.',
  '.#pppp####yyyy#.',
  '.#ppwpp##yywyy#.',
  '.#ppkpp##yykyy#.',
  '.#psppnnnnppsp#.',
  '.#ppppnnnnppyy#.',
  '..#pppp##yyyy#..',
  '...##########...',
];

export const PixelIconSquad: React.FC<PixelIconProps> = ({ size = 24 }) =>
  renderPixelMatrix(SQUAD_ROWS, ICP, size);

/**
 * Icon Heo Có Cánh (Flappy Wing) Pixel - 1:1 prototype
 */
const FLY_WING_ROWS = [
  '.....##.........',
  '....#ww#........',
  '...#wwww#.......',
  '..#wwwwww#......',
  '..#pppppp#......',
  '...#pppp#.......',
  '....####........',
];

export const PixelIconFlyWing: React.FC<PixelIconProps> = ({ size = 24 }) =>
  renderPixelMatrix(FLY_WING_ROWS, ICP, size);

/**
 * Icon Heo Qua Đường (Crossroad) Pixel - 1:1 prototype ngày 22
 */
const CROSS_ROWS = [
  '................',
  '..############..',
  '.#mmmmmmmmmmmm#.',
  '.#mwwmmwwmmwwm#.',
  '.#mwwmmwwmmwwm#.',
  '.#mwwmmwwmmwwm#.',
  '.#mwwmmwwmmwwm#.',
  '.#mmmmmmmmmmmm#.',
  '..############..',
  '................',
];

export const PixelIconCrossRoad: React.FC<PixelIconProps> = ({ size = 24 }) =>
  renderPixelMatrix(CROSS_ROWS, ICP, size);

// ============================================================================
// BỘ ICON PIXEL ART 16×16 ĐỒNG BỘ 100% (QUYẾT ĐỊNH 185)
// Thay thế hoàn toàn Lucide & Emoji trong Tab Giải Trí, Quán Quen, Chat & Tab Bar
// ============================================================================

/** Icon Ngọn Lửa Chuỗi Ngày (Streak Flame) 16×16 Pixel */
const FLAME_16_ROWS = [
  '.......##.......',
  '......#rr#......',
  '.....#rrrr#.....',
  '....#rryrrr#....',
  '...#rryyyrrr#...',
  '..#rryyyyyyrr#..',
  '..#rryywwyyrr#..',
  '.#rryywwwwyyrr#.',
  '.#rryywwwwyyrr#.',
  '.#rryyyyyyyyrr#.',
  '..#rryyyyyyrr#..',
  '...#rrrrrrrr#...',
  '....########....',
  '................',
];
export const PixelIconFlame: React.FC<PixelIconProps> = ({ size = 16 }) =>
  renderPixelMatrix(FLAME_16_ROWS, ICP, size);

/** Icon Hạt / Bông Cám Vàng (Pig Food) 16×16 Pixel */
const GRAIN_16_ROWS = [
  '......####......',
  '.....#yyyy#.....',
  '....#yywwyy#....',
  '....#yyyyyy#....',
  '...#yynnnnyy#...',
  '..#yywwwwwwyy#..',
  '..#yyyyyyyyyy#..',
  '...#yynnnnyy#...',
  '....#yyyyyy#....',
  '.....##nn##.....',
  '......#nn#......',
  '......#nn#......',
  '.......##.......',
  '................',
];
export const PixelIconGrain: React.FC<PixelIconProps> = ({ size = 16 }) =>
  renderPixelMatrix(GRAIN_16_ROWS, ICP, size);

/** Icon Bát Cám Cho Ăn 16×16 Pixel */
const BOWL_16_ROWS = [
  '................',
  '....##....##....',
  '...#yy#..#yy#...',
  '..#yyyy##yyyy#..',
  '.##############.',
  '.#bbbbbbbbbbbb#.',
  '.#bbwwwwbbbbbb#.',
  '..#bbbbbbbbbb#..',
  '...#bbbbbbbb#...',
  '....########....',
  '................',
  '................',
];
export const PixelIconBowl: React.FC<PixelIconProps> = ({ size = 16 }) =>
  renderPixelMatrix(BOWL_16_ROWS, ICP, size);

/** Icon Cá Ao 16×16 Pixel */
const FISH_16_ROWS = [
  '................',
  '.....######.....',
  '...##rrrrrr##...',
  '..#rrwwrrryyr#..',
  '.#rrwkrrrrryyr#.',
  '#rrrrrrryyyyyrr#',
  '.#rrrrrrryyyyrr#',
  '..#rrrrrrrrrr#..',
  '...##rrrrrr##...',
  '.....######.....',
  '................',
  '................',
];
export const PixelIconFish: React.FC<PixelIconProps> = ({ size = 16 }) =>
  renderPixelMatrix(FISH_16_ROWS, ICP, size);

/** Icon Hoa Hồng Đỏ 16×16 Pixel */
const ROSE_16_ROWS = [
  '.....######.....',
  '....#rrrrrr#....',
  '...#rrwwrrrr#...',
  '...#rrrrrrrr#...',
  '....#rrrrrr#....',
  '.....##rr##.....',
  '.......##.......',
  '...###.##.###...',
  '..#ggg#gg#ggg#..',
  '...###.##.###...',
  '.......##.......',
  '.......##.......',
];
export const PixelIconRose: React.FC<PixelIconProps> = ({ size = 16 }) =>
  renderPixelMatrix(ROSE_16_ROWS, ICP, size);

/** Icon Ngôi Sao Vàng 16×16 Pixel */
const STAR_16_ROWS = [
  '.......##.......',
  '......#yy#......',
  '......#yw#......',
  '..#####yy#####..',
  '.#wwyyyyyyyyyy#.',
  '..#yyyyyyyyyy#..',
  '...#yyyyyyyy#...',
  '...#yy#..#yy#...',
  '..#yy#....#yy#..',
  '..###......###..',
  '................',
];
export const PixelIconStar: React.FC<PixelIconProps> = ({ size = 16 }) =>
  renderPixelMatrix(STAR_16_ROWS, ICP, size);

/** Icon Đồng Xu Vàng 16×16 Pixel */
const COIN_16_ROWS = [
  '....########....',
  '..##wwyyyyyy##..',
  '.#wwyyyyyyyyyy#.',
  '.#wyyyy####yyy#.',
  '#yyyyy#yyyy#yyy#',
  '#yyyyy#yyyy#yyy#',
  '#yyyyy#yyyy#yyy#',
  '.#yyyyy####yyy#.',
  '.#yyyyyyyyyyyn#.',
  '..##yyyyyyyy##..',
  '....########....',
  '................',
];
export const PixelIconCoin: React.FC<PixelIconProps> = ({ size = 16 }) =>
  renderPixelMatrix(COIN_16_ROWS, ICP, size);

/** Icon Máy Ảnh Mini 16×16 Pixel */
const CAM_MINI_16_ROWS = [
  '.....######.....',
  '....#wwwwww#....',
  '.##############.',
  '.#wwwwwwwwwwww#.',
  '.#www######www#.',
  '.#ww#bbbbbb#ww#.',
  '.#ww#bbwwbb#ww#.',
  '.#ww#bbbbbb#ww#.',
  '.#www######www#.',
  '.#mmmmmmmmmmmm#.',
  '.##############.',
  '................',
];
export const PixelIconCameraMini: React.FC<PixelIconProps> = ({ size = 16 }) =>
  renderPixelMatrix(CAM_MINI_16_ROWS, ICP, size);

/** Icon Tâm Định Vị GPS 16×16 Pixel */
const CROSSHAIR_16_ROWS = [
  '.......##.......',
  '....###rr###....',
  '...#wwrrrrww#...',
  '..#wrr####rrw#..',
  '.#wr##....##rw#.',
  '##r#..#rr#..#r##',
  '##r#..#rr#..#r##',
  '.#wr##....##rw#.',
  '..#wrr####rrw#..',
  '...#wwrrrrww#...',
  '....###rr###....',
  '.......##.......',
];
export const PixelIconCrosshair: React.FC<PixelIconProps> = ({ size = 16 }) =>
  renderPixelMatrix(CROSSHAIR_16_ROWS, ICP, size);

/** Icon Gửi Tin Nhắn 16×16 Pixel */
const SEND_16_ROWS = [
  '................',
  '.##.............',
  '.#yy##..........',
  '.#yyyy##........',
  '.#yyyyyy##......',
  '.#wwwwwwww####..',
  '.#yyyyyy##......',
  '.#yyyy##........',
  '.#yy##..........',
  '.##.............',
  '................',
];
export const PixelIconSend: React.FC<PixelIconProps> = ({ size = 16 }) =>
  renderPixelMatrix(SEND_16_ROWS, ICP, size);

// ============================================================================
// 5 ICON PIXEL ART CHO THANH TAB BAR NỔI (FloatingPillTabBar)
// Hỗ trợ color prop để giữ tương phản tối đa khi chọn (nền đậm / đỏ / vàng)
// ============================================================================

function renderTabPixelMatrix(
  rows: string[],
  fg: string,
  accent: string,
  highlight: string,
  size: number = 20
) {
  const palette: Record<string, string> = {
    '#': fg,
    a: accent,
    h: highlight,
  };
  return renderPixelMatrix(rows, palette, size);
}

/** Tab 0: Vườn (Chiếc lá pixel 16×16) */
const TAB_GARDEN_ROWS = [
  '................',
  '.........#####..',
  '.......##aaaaa#.',
  '.....##aaahaaa#.',
  '....#aaahhaaaa#.',
  '...#aaaahaa##a#.',
  '..#aaaaa##aa#...',
  '..#aaaa#aaa#....',
  '..#aaa#aaa#.....',
  '..#aa#aaa#......',
  '.##a#aa##.......',
  '#aa###..........',
  '##..............',
];
export const PixelIconTabGarden: React.FC<{ size?: number; color?: string; selected?: boolean }> = ({
  size = 20,
  color = '#2B2118',
  selected = false,
}) => renderTabPixelMatrix(TAB_GARDEN_ROWS, color, selected ? '#8CC46F' : '#5E9A57', '#FFFBF1', size);

/** Tab 1: Nhà (Ngôi nhà mái ấm pixel 16×16) */
const TAB_HOUSE_ROWS = [
  '.......##.......',
  '.....##aa##.....',
  '...##aaaaaa##...',
  '.##aaaaaaaaaa##.',
  '#aa##########aa#',
  '.#hhhhhhhhhhhh#.',
  '.#hh##hhhh##hh#.',
  '.#hhhhhhhhhhhh#.',
  '.#hhhh####hhhh#.',
  '.#hhhh#aa#hhhh#.',
  '.#hhhh#aa#hhhh#.',
  '.##############.',
];
export const PixelIconTabHouse: React.FC<{ size?: number; color?: string; selected?: boolean }> = ({
  size = 20,
  color = '#2B2118',
  selected = false,
}) => renderTabPixelMatrix(TAB_HOUSE_ROWS, color, selected ? '#F4B93B' : '#E0452B', selected && color !== '#2B2118' ? 'rgba(255,255,255,0.22)' : '#FFFBF1', size);

/** Tab 2: Chụp (Máy ảnh pixel 16×16) */
const TAB_CAMERA_ROWS = [
  '................',
  '.....######.....',
  '....#hhhhhh#....',
  '.##############.',
  '.#hhhhhhhhhhhh#.',
  '.#hhh######hhh#.',
  '.#hh#aaaaaa#hh#.',
  '.#hh#aahhaa#hh#.',
  '.#hh#aaaaaa#hh#.',
  '.#hhh######hhh#.',
  '.#hhhhhhhhhhhh#.',
  '.##############.',
];
export const PixelIconTabCamera: React.FC<{ size?: number; color?: string; selected?: boolean }> = ({
  size = 20,
  color = '#2B2118',
  selected = false,
}) => renderTabPixelMatrix(TAB_CAMERA_ROWS, color, selected ? '#F4B93B' : '#6DA9D9', selected ? 'rgba(255,255,255,0.22)' : '#FFFBF1', size);

/** Tab 3: Giải trí (Tay cầm game pixel 16×16) */
const TAB_FUN_ROWS = [
  '................',
  '................',
  '..############..',
  '.#hhhhhhhhhhhh#.',
  '.#hha#hhhha#hh#.',
  '.#hhaaa##h#ahh#.',
  '.#hha#hhhh#ahh#.',
  '..#hhhhhhhhhh#..',
  '...###....###...',
  '................',
];
export const PixelIconTabFun: React.FC<{ size?: number; color?: string; selected?: boolean }> = ({
  size = 20,
  color = '#2B2118',
  selected = false,
}) => renderTabPixelMatrix(TAB_FUN_ROWS, color, selected ? '#E0452B' : '#F4B93B', '#FFFBF1', size);

/** Tab 4: Hồ sơ (Chú heo/Người dùng pixel 16×16) */
const TAB_PROFILE_ROWS = [
  '................',
  '.....######.....',
  '....#aaaaaa#....',
  '...#aahhhhaa#...',
  '...#aa#aa#aa#...',
  '....#aaaaaa#....',
  '.....######.....',
  '...##########...',
  '..#hhhhhhhhhh#..',
  '..#hhhhhhhhhh#..',
  '..############..',
  '................',
];
export const PixelIconTabProfile: React.FC<{ size?: number; color?: string; selected?: boolean }> = ({
  size = 20,
  color = '#2B2118',
  selected = false,
}) => renderTabPixelMatrix(TAB_PROFILE_ROWS, color, '#F9B8C4', selected && color !== '#2B2118' ? 'rgba(255,255,255,0.22)' : '#FFFBF1', size);
