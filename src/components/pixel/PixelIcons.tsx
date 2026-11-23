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
