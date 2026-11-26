/**
 * Thư Viện Helper Pixel Art Chuẩn Việt Nam (Quyết định 224)
 * Chắt lọc từ:
 *  - Hugo-Dz/spritefusion-pixel-snapper (Khóa lưới integer 1px, ngân sách màu 24–32, Selective Outline)
 *  - shika-works/pixelium-design (Hệ màu vật liệu OKLab đồng đều 3 khung giờ, kiến trúc mô-đun)
 * Tài liệu gốc: docs/VIETNAM_PIXEL_ART_BIBLE.md
 */

export const VN_OKLAB_MATERIALS = {
  ink: '#2B2118',
  wallYellow: { hi: '#FFF1CC', mid: '#F2DBAE', sh: '#D9B982', dk: '#8F6E42' },
  roofTileRed: { hi: '#DE5D40', mid: '#C4452C', sh: '#942B1A', dk: '#5C190E' },
  brickMarseille: { hi: '#CE6046', mid: '#B54B34', sh: '#873321', dk: '#4E1E14' },
  tileIndochine: { cream: '#FFF8E6', sand: '#E8DCC0', teal: '#4A8A80', terracotta: '#C4603A' },
  woodLim: { hi: '#8A5634', mid: '#6B4226', sh: '#4A2C1A', dk: '#2B180E' },
  inox: { hi: '#F8FAFC', mid: '#CBD5E1', sh: '#94A3B8', dk: '#475569' },
  asphalt: { hi: '#52545E', mid: '#3B3C42', sh: '#2B2C32', dk: '#1C1D22' },
  pitchGrass: { hi: '#4CAF50', mid: '#388E3C', sh: '#2E7D32', dk: '#1B5E20' },
  modernGlass: { hi: '#E0F2FE', mid: '#93C5FD', sh: '#3B82F6', dk: '#1E293B' },
  csgtYellow: { hi: '#FFE484', mid: '#F4D059', sh: '#C7A23A', dk: '#7A4B2A' },
  plasticChair: { blue: '#2563EB', red: '#E0452B', green: '#16A34A' },
} as const;

export const VN_SCALE_STANDARDS = {
  PX_TO_CM: 4,
  PIG_W: 24,
  PIG_H: 20,
  PIG_MOTO_W: 26,
  PIG_MOTO_H: 24,
  HUMAN_STAND_W: 12,
  HUMAN_STAND_H: 22,
  HUMAN_SIT_W: 14,
  HUMAN_SIT_H: 18,
  MOTO_W: 22,
  MOTO_H: 16,
  CAR_W: 40,
  CAR_H: 20,
  TRUCK_W: 52,
  TRUCK_H: 24,
  BUS_W: 66,
  BUS_H: 25,
  CONTAINER_W: 82,
  CONTAINER_H: 28,
  MIN_AISLE_PX: 28,
  MIN_DOOR_H_PX: 26,
  LANE_HEIGHT_PX: 34,
  SAFE_TRAFFIC_GAP_PX: 24,
} as const;

/**
 * Sinh đoạn mã JavaScript nguyên thủy chuẩn khóa lưới 1px dùng chung cho mọi WebView Canvas
 * (Quán Phở, Quán Cà Phê, SVĐ Thống Nhất, Adidas Store, Chùa, Nhà Thờ, Chợ Bến Thành).
 */
export function buildVnPixelKitPrimitivesScript(): string {
  const matJson = JSON.stringify(VN_OKLAB_MATERIALS);
  return `
var VN_MAT = ${matJson};
var VN_PIG_PAL = {
  k: '#2B2118', p: '#F596A8', h: '#FDBAC7', s: '#D96D85',
  n: '#FBC2CE', w: '#FFFFFF', coin: '#F4B93B'
};

function R(c, x, y, w, h, col) {
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function E(c, cx, cy, rx, ry, col) {
  c.fillStyle = col;
  var x0 = Math.floor(cx - rx), x1 = Math.ceil(cx + rx);
  var y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
  for (var y = y0; y <= y1; y++) {
    for (var x = x0; x <= x1; x++) {
      var dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
      if (dx * dx + dy * dy <= 1) c.fillRect(x, y, 1, 1);
    }
  }
}

function mk(w, h, fn) {
  var cv = document.createElement('canvas');
  cv.width = Math.round(w);
  cv.height = Math.round(h);
  var x = cv.getContext('2d');
  x.imageSmoothingEnabled = false;
  if (fn) fn(x);
  return cv;
}

function mulberry32(seed) {
  return function() {
    var t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function linePx(c, x0, y0, x1, y1, col) {
  x0 = x0 | 0; y0 = y0 | 0; x1 = x1 | 0; y1 = y1 | 0;
  var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  var err = dx - dy;
  c.fillStyle = col;
  while (true) {
    c.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    var e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}

/* Khóa lưới 1px + viền ngoài #2B2118 (Selective Outline chuẩn spritefusion-pixel-snapper) */
function shape(c, rows, fill, ox, oy, ink) {
  ox = ox || 0; oy = oy || 0;
  var pts = {}, i, r, x;
  for (i = 0; i < rows.length; i++) {
    r = rows[i];
    for (x = r[1]; x <= r[2]; x++) pts[x + ',' + r[0]] = 1;
  }
  c.fillStyle = ink || VN_PIG_PAL.k;
  var dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  for (i = 0; i < rows.length; i++) {
    r = rows[i];
    for (x = r[1]; x <= r[2]; x++) {
      for (var d = 0; d < 4; d++) {
        var nx = x + dirs[d][0], ny = r[0] + dirs[d][1];
        if (!pts[nx + ',' + ny]) c.fillRect(ox + nx, oy + ny, 1, 1);
      }
    }
  }
  c.fillStyle = fill;
  for (i = 0; i < rows.length; i++) {
    r = rows[i];
    c.fillRect(ox + r[1], oy + r[0], r[2] - r[1] + 1, 1);
  }
}

/* Hệ màu OKLab Việt Nam tự động theo 3 khung giờ (pixelium-design) */
function getVnTimePalette(h) {
  if (h >= 6 && h < 16) {
    return {
      mode: 'day',
      sky: ['#69B1F6','#85C2FA','#A2D3FD','#BEE2FF','#D8EEFF','#EAF5FF'],
      ambientLight: 'rgba(255,248,220,0.08)',
      lampGlow: 0.08
    };
  }
  if (h >= 16 && h < 19) {
    return {
      mode: 'sunset',
      sky: ['#5C4B99','#8C5E9C','#C7778E','#EE9C7C','#F8BD82','#FCE0A4'],
      ambientLight: 'rgba(255,205,130,0.16)',
      lampGlow: 0.45
    };
  }
  return {
    mode: 'night',
    sky: ['#131730','#1A2044','#252C5A','#313970','#3E4682','#4D5490'],
    ambientLight: 'rgba(20,26,56,0.28)',
    lampGlow: 0.85
  };
}

function drawContactShadow(c, cx, cy, rx, ry) {
  E(c, cx, cy, rx, ry || 2.5, 'rgba(43,33,24,0.30)');
}

function drawWheel(c, cx, cy, r) {
  E(c, cx, cy, r, r, '#18181B');
  E(c, cx, cy, Math.max(1, r - 1.5), Math.max(1, r - 1.5), '#94A3B8');
  R(c, cx, cy, 1, 1, '#18181B');
}

/* Gạch bông Indochine 16×16 chuẩn Việt Nam (cho Quán Phở, Quán Cà Phê, Nhà Cổ) */
function drawTileFloorIndochine(c, x0, y0, w, h) {
  for (var ty = y0; ty < y0 + h; ty += 16) {
    for (var tx = x0; tx < x0 + w; tx += 16) {
      R(c, tx, ty, 16, 16, VN_MAT.tileIndochine.cream);
      R(c, tx, ty, 16, 1, 'rgba(43,33,24,0.12)');
      R(c, tx, ty, 1, 16, 'rgba(43,33,24,0.12)');
      R(c, tx + 6, ty + 6, 4, 4, VN_MAT.tileIndochine.teal);
      R(c, tx + 7, ty + 7, 2, 2, VN_MAT.tileIndochine.terracotta);
      R(c, tx + 2, ty + 2, 2, 2, VN_MAT.tileIndochine.sand);
      R(c, tx + 12, ty + 2, 2, 2, VN_MAT.tileIndochine.sand);
      R(c, tx + 2, ty + 12, 2, 2, VN_MAT.tileIndochine.sand);
      R(c, tx + 12, ty + 12, 2, 2, VN_MAT.tileIndochine.sand);
    }
  }
}

/* Hơi khói nóng bốc lên (Nồi Phở, Cà Phê Phin, Lư Hương) */
function drawSteamPuff(c, x, y, t, count) {
  count = count || 3;
  for (var i = 0; i < count; i++) {
    var st = (t * 0.85 + i / count) % 1;
    c.save();
    c.globalAlpha = (1 - st) * 0.55;
    R(c, x + Math.round(Math.sin(t * 2.4 + i * 1.7) * 2), Math.round(y - st * 14), 3, 2, '#FFFDF7');
    c.restore();
  }
}

/* Sprite Heo Con Mascot 24×20 chuẩn 1:1 Tab Vườn (PixelGardenWebView.tsx) */
function drawPigSpriteCanonical(c, o) {
  var ox = 1, oy = 3;
  var walk = !!(o && o.step && o.step > 0);
  var frame = (o && o.step === 1) ? 0 : 1;
  var bob = (walk && frame === 1) ? -1 : 0;
  var raised = function(i) { return walk && (frame === 0 ? (i === 1 || i === 2) : (i === 0 || i === 3)); };
  var legs = [[3, VN_PIG_PAL.p], [9, VN_PIG_PAL.p], [6, VN_PIG_PAL.s], [12, VN_PIG_PAL.s]];
  var order = [2, 3, 0, 1];
  for (var li = 0; li < order.length; li++) {
    var idx = order[li], lx = legs[idx][0];
    var rows = [[11, lx, lx + 1], [12, lx, lx + 1], [13, lx, lx + 1]];
    if (!raised(idx)) rows.push([14, lx, lx + 1]);
    shape(c, rows, legs[idx][1], ox, oy);
  }
  shape(c, [[4,0,1],[5,0,0],[6,0,1]], VN_PIG_PAL.p, ox, oy + bob);
  shape(c, [[4,4,12],[5,3,13],[6,2,14],[7,2,14],[8,2,14],[9,2,14],[10,2,14],[11,3,13]], VN_PIG_PAL.p, ox, oy + bob);
  R(c, ox + 5, oy + bob + 5, 3, 1, VN_PIG_PAL.h);
  R(c, ox + 7, oy + bob + 4, 3, 1, VN_PIG_PAL.coin);
  var hx = ox, hy = oy + bob;
  shape(c, [[6,20,21],[7,20,21],[8,20,21]], VN_PIG_PAL.n, hx, hy);
  shape(c, [[3,14,18],[4,13,19],[5,13,19],[6,13,19],[7,13,19],[8,13,19],[9,14,18]], VN_PIG_PAL.p, hx, hy);
  shape(c, [[1,15,16],[2,14,17]], VN_PIG_PAL.p, hx, hy);
  R(c, hx + 14, hy + 3, 5, 1, VN_PIG_PAL.p);
  R(c, hx + 16, hy + 2, 1, 1, VN_PIG_PAL.s);
  R(c, hx + 14, hy + 4, 2, 1, VN_PIG_PAL.h);
  R(c, hx + 21, hy + 6, 1, 1, VN_PIG_PAL.k);
  R(c, hx + 21, hy + 8, 1, 1, VN_PIG_PAL.k);
  if (o && o.blink) {
    R(c, hx + 16, hy + 6, 2, 1, VN_PIG_PAL.k);
  } else {
    R(c, hx + 16, hy + 5, 2, 2, VN_PIG_PAL.k);
    R(c, hx + 16, hy + 5, 1, 1, VN_PIG_PAL.w);
  }
}
`;
}
