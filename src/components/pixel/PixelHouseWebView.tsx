import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { WebView } from 'react-native-webview';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

export interface PixelHouseWebViewRef {
  selectRoom: (roomId: string) => void;
}

export interface RoomInfo {
  id: string;
  name: string;
  category: string;
  subtitle: string;
}

interface PixelHouseWebViewProps {
  currentMonth?: number;
  totalSpent?: number;
  onSelectRoom?: (room: RoomInfo) => void;
  onExitToGarden?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const PixelHouseWebView = forwardRef<
  PixelHouseWebViewRef,
  PixelHouseWebViewProps
>(({ currentMonth = new Date().getMonth() + 1, onSelectRoom, onExitToGarden, style }, ref) => {
  const webViewRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    selectRoom: (roomId: string) => {
      const code = `if (window.selectRoom) { window.selectRoom('${roomId}'); }`;
      webViewRef.current?.injectJavaScript(code);
    },
  }));

  const htmlSource = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
    html, body {
      width: 100%;
      height: 100%;
      background: #F6EEDC;
      overflow-x: hidden;
      overflow-y: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .house-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 10px 12px 16px;
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 360px;
      padding: 0 2px 2px;
    }
    .btn-garden {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FFFBF1;
      color: #2B2118;
      border: 2px solid #2B2118;
      border-radius: 999px;
      padding: 5px 12px;
      font-size: 12px;
      font-weight: 800;
      box-shadow: 0 2px 0 #2B2118;
      cursor: pointer;
    }
    .btn-garden:active {
      transform: translateY(1px);
      box-shadow: 0 1px 0 #2B2118;
    }
    .month-pill {
      font-size: 12px;
      font-weight: 800;
      color: #2B2118;
      background: #E8D6B4;
      padding: 4px 10px;
      border-radius: 999px;
      border: 1.5px solid #2B2118;
    }
    .scene-card {
      position: relative;
      width: 100%;
      max-width: 360px;
      border: 3px solid #2B2118;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 0 #2B2118;
      background: #CFE8D8;
      line-height: 0;
    }
    .scene-card.room {
      background: #F2DFA8;
    }
    canvas {
      display: block;
      width: 100%;
      height: auto;
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
      touch-action: manipulation;
    }
    .roomtag {
      position: absolute;
      left: 10px;
      top: 10px;
      background: #FFFBF1;
      border: 2px solid #2B2118;
      border-radius: 999px;
      padding: 4px 10px;
      font-weight: 800;
      font-size: 11px;
      line-height: 1.2;
      color: #2B2118;
      box-shadow: 0 2px 0 #2B2118;
      pointer-events: none;
      z-index: 5;
    }
    .bubble2 {
      position: absolute;
      transform: translate(-50%, -100%);
      background: #FFFBF1;
      border: 2.5px solid #2B2118;
      border-radius: 12px;
      padding: 5px 9px;
      font-size: 11px;
      font-weight: 800;
      line-height: 1.25;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity .15s ease-out;
      color: #2B2118;
      box-shadow: 0 2px 0 #2B2118;
      z-index: 10;
    }
    .bubble2.on { opacity: 1; }
    .bubble2::after {
      content: "";
      position: absolute;
      left: 50%;
      bottom: -6px;
      width: 8px;
      height: 8px;
      background: #FFFBF1;
      border-right: 2.5px solid #2B2118;
      border-bottom: 2.5px solid #2B2118;
      transform: translateX(-50%) rotate(45deg);
    }
    .chips-row {
      display: flex;
      gap: 6px;
      width: 100%;
      max-width: 360px;
      overflow-x: auto;
      scrollbar-width: none;
      padding: 2px 0;
    }
    .chips-row::-webkit-scrollbar { display: none; }
    .chip-btn {
      flex: none;
      border: 2px solid #2B2118;
      background: #FFFBF1;
      color: #2B2118;
      border-radius: 999px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 800;
      box-shadow: 0 2px 0 #2B2118;
      cursor: pointer;
    }
    .chip-btn.active {
      background: #F4B93B;
      transform: translateY(2px);
      box-shadow: 0 0 0 #2B2118;
    }
  </style>
</head>
<body>
  <div class="house-container">
    <div class="top-bar">
      <button class="btn-garden" id="btnGarden" type="button">🌱 Ra vườn chơi</button>
      <div class="month-pill">Tháng ${currentMonth} · Nhà Heo 🏠</div>
    </div>

    <!-- 1. MẶT CẮT NGÔI NHÀ 2 TẦNG 6 PHÒNG -->
    <div class="scene-card">
      <canvas id="map" width="176" height="108"></canvas>
    </div>

    <!-- 2. DẢI CHỌN PHÒNG CHIPS -->
    <div class="chips-row" id="roomChips"></div>

    <!-- 3. CHI TIẾT CĂN PHÒNG ĐANG CHỌN (ACTIONS TOUCH) -->
    <div class="scene-card room">
      <canvas id="room" width="176" height="96"></canvas>
      <div class="roomtag" id="roomTag">Sảnh · Tổng quan</div>
      <div class="bubble2" id="bubble2"></div>
    </div>
  </div>

<script>
(function(){
'use strict';
const W_MAP = 176, H_MAP = 108;
const W_ROOM = 176, H_ROOM = 96;

const HR = {
  sanh: { n: 'Sảnh', sub: 'Tổng quan', col: 1, row: 1, wall: '#F2DFA8' },
  bep: { n: 'Bếp', sub: 'Ăn uống', col: 0, row: 1, wall: '#F6D9C0' },
  khach: { n: 'Phòng khách', sub: 'Mua sắm', col: 2, row: 1, wall: '#DCEBC9' },
  lamviec: { n: 'Phòng làm việc', sub: 'Đi lại', col: 0, row: 0, wall: '#D2E3F2' },
  anh: { n: 'Phòng ảnh', sub: 'Nhật ký ảnh', col: 1, row: 0, wall: '#E9DCF2' },
  ngu: { n: 'Phòng ngủ', sub: 'Tiết kiệm', col: 2, row: 0, wall: '#F8D6DF' }
};
const ROOM_ORDER = ['sanh', 'bep', 'khach', 'ngu', 'anh', 'lamviec'];
Object.values(HR).forEach(r => {
  r.x = 8 + r.col * 54;
  r.y = r.row ? 60 : 16;
  r.w = 52;
  r.h = 40;
  r.cx = r.x + 26;
});
const FLOOR_Y = [54, 98];
const STAIR = { x0: 76, y0: 98, x1: 108, y1: 54 };

let selRoom = 'sanh';
const mp = { x: 88, y: 98, face: 1, frame: 0, ft: 0, wp: [], room: 'sanh', target: null, moving: false };
const rp = { x: 90, y: 82, face: 1, mode: 'idle', t: 0, dur: 2, tx: 0, ty: 0, frame: 0, ft: 0, present: true, after: null, jump: 0 };

const PAL = {
  o: '#4B2B21',
  p: '#F9B8C4',
  s: '#EE90A6',
  n: '#F08DA4',
  h: '#FFE3E8',
  k: '#2B2118',
  g: '#F4B93B',
  G: '#B97A14',
  w: '#FFFFFF'
};

function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
function E(c, x, y, rx, ry, col) {
  c.fillStyle = col;
  for (let dy = -ry; dy <= ry; dy++) {
    for (let dx = -rx; dx <= rx; dx++) {
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
        c.fillRect(x + dx, y + dy, 1, 1);
      }
    }
  }
}
function ob(c, x, y, w, h, col) { R(c, x, y, w, h, '#2B2118'); R(c, x + 1, y + 1, w - 2, h - 2, col); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function mulberry32(a) { return function() { let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function shape(c, rows, fill, ox, oy, outline = true) {
  if (outline) {
    c.fillStyle = PAL.o;
    for (const [ax, ay] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      for (const [y, x0, x1] of rows) c.fillRect(ox + x0 + ax, oy + y + ay, x1 - x0 + 1, 1);
    }
  }
  c.fillStyle = fill;
  for (const [y, x0, x1] of rows) c.fillRect(ox + x0, oy + y, x1 - x0 + 1, 1);
}

const HEART = [[0,1,0,1,0], [1,1,1,1,1], [0,1,1,1,0], [0,0,1,0,0]];
function heart(c, x, y, col) {
  c.fillStyle = col;
  HEART.forEach((r, j) => r.forEach((v, i) => { if (v) c.fillRect(x + i, y + j, 1, 1); }));
}
function zGlyph(c, x, y) {
  [[0,0],[1,0],[2,0],[1,1],[0,2],[1,2],[2,2]].forEach(([a, b]) => {
    c.fillStyle = 'rgba(43,33,24,.5)'; c.fillRect(x + a + 1, y + b + 1, 1, 1);
    c.fillStyle = '#fff'; c.fillRect(x + a, y + b, 1, 1);
  });
}

/* PORT 1:1 SPRITE CHÚ HEO CON SIÊU CUTE (24x20) */
function drawPigSprite(c, o) {
  const ox = 1, oy = 3;
  const sleep = o.pose === 'sleep';
  const eat = o.pose === 'eat';
  const walk = o.pose === 'walk';
  const work = o.pose === 'work';
  const sad = o.mood === 'sad' && !o.happy;
  const bob = (walk && o.frame === 1) ? -1 : 0;
  const bodyDy = sleep ? 3 : bob;
  const headDy = sleep ? 5 : eat ? 4 : sad ? 1 : bob;
  const headDx = sleep ? -1 : eat ? 1 : 0;

  // 4 Chân cử động
  if (!sleep) {
    const raised = i => (walk && (o.frame === 0 ? (i === 1 || i === 2) : (i === 0 || i === 3))) || (work && o.frame === 1 && (i === 2 || i === 3));
    const legs = [[3, PAL.p], [9, PAL.p], [6, PAL.s], [12, PAL.s]];
    [2, 3, 0, 1].forEach(i => {
      const x = legs[i][0];
      const rows = [[11, x, x + 1], [12, x, x + 1], [13, x, x + 1]];
      if (!raised(i)) rows.push([14, x, x + 1]);
      shape(c, rows, legs[i][1], ox, oy);
    });
  }

  // Đuôi xoắn ngoe nguẩy
  shape(c, [[4, 0, 1], [5, 0, 0], [6, 0, 1]], PAL.p, ox, oy + bodyDy + (o.tail ? 1 : 0));

  // Thân mình mũm mĩm
  shape(c, [
    [4, 4, 12], [5, 3, 13], [6, 2, 14], [7, 2, 14],
    [8, 2, 14], [9, 2, 14], [10, 2, 14], [11, 3, 13]
  ], PAL.p, ox, oy + bodyDy);

  // Vệt sáng thân
  R(c, ox + 5, oy + bodyDy + 5, 3, 1, PAL.h);

  // Đầu và Mõm
  const hx = ox + headDx, hy = oy + headDy;
  const hp = (x, y, col) => R(c, hx + x, hy + y, 1, 1, col);

  shape(c, [[6, 20, 21], [7, 20, 21], [8, 20, 21]], PAL.n, hx, hy);
  shape(c, [[3, 14, 18], [4, 13, 19], [5, 13, 19], [6, 13, 19], [7, 13, 19], [8, 13, 19], [9, 14, 18]], PAL.p, hx, hy);
  shape(c, [[1, 15, 16], [2, 14, 17]], PAL.p, hx, hy);
  R(c, hx + 14, hy + 3, 5, 1, PAL.p);
  hp(16, 2, PAL.s);
  R(c, hx + 14, hy + 4, 2, 1, PAL.h);

  // Lỗ mũi
  hp(21, 6, PAL.k); hp(21, 8, PAL.k);

  // Mắt tròn lấp lánh & biểu cảm
  if (o.happy) {
    hp(16, 6, PAL.k); hp(17, 5, PAL.k); hp(18, 6, PAL.k);
  } else if (o.blink || sleep || eat) {
    hp(16, 6, PAL.k); hp(17, 6, PAL.k);
  } else {
    R(c, hx + 16, hy + 5, 2, 2, PAL.k);
    hp(16, 5, PAL.w); // Đốm sáng trắng lấp lánh
  }

  // Má hồng phúng phính
  if (sad) {
    hp(16, 4, PAL.k); hp(17, 3, PAL.k);
    hp(18, 7, '#7EC8F0'); hp(18, 8, '#7EC8F0');
  } else {
    hp(17, 8, PAL.s); hp(18, 8, PAL.s);
  }

  // Chuông cổ vàng
  R(c, ox + 11, oy + bodyDy + 9, 2, 1, PAL.g);
  R(c, ox + 11, oy + bodyDy + 10, 2, 1, PAL.G);
}

const mapC = document.getElementById('map'), mapX = mapC.getContext('2d');
const roomC = document.getElementById('room'), roomX = roomC.getContext('2d');
const hpCanvas = document.createElement('canvas'); hpCanvas.width = 24; hpCanvas.height = 20;
const hpx = hpCanvas.getContext('2d');

const bubble2 = document.getElementById('bubble2');
let b2Until = 0;

function say2(t, ms) {
  bubble2.textContent = t;
  bubble2.classList.add('on');
  b2Until = performance.now() + (ms || 3200);
}
function placeB2() {
  if (performance.now() > b2Until || !rp.present) {
    bubble2.classList.remove('on');
    return;
  }
  bubble2.style.left = clamp(rp.x / W_ROOM * 100, 26, 74) + '%';
  bubble2.style.top = Math.max(20, (rp.y - 24 - rp.jump) / H_ROOM * 100) + '%';
}

function mini(c, id, r) {
  const x = r.x, y = r.y;
  if (id === 'sanh') {
    R(c, x + 2, y + 10, 10, 26, '#5E3A20');
    R(c, x + 3, y + 11, 8, 25, '#8A5A34');
    R(c, x + 9, y + 24, 2, 2, '#F4B93B');
  } else if (id === 'bep') {
    R(c, x + 4, y + 8, 11, 28, '#DDE6EE');
    R(c, x + 4, y + 20, 11, 1, '#2B2118');
    R(c, x + 26, y + 26, 24, 10, '#A8754A');
    R(c, x + 32, y + 20, 10, 6, '#8B8B93');
  } else if (id === 'khach') {
    R(c, x + 22, y + 16, 26, 8, '#E86F8B');
    R(c, x + 18, y + 22, 34, 14, '#F08DA4');
    R(c, x + 4, y + 28, 7, 8, '#B5603A');
    E(c, x + 7, y + 24, 5, 5, '#5E9A57');
  } else if (id === 'lamviec') {
    R(c, x + 18, y + 26, 30, 3, '#B07A48');
    R(c, x + 20, y + 29, 3, 7, '#8A5A34');
    R(c, x + 44, y + 29, 3, 7, '#8A5A34');
    R(c, x + 27, y + 18, 12, 8, '#2B2118');
    R(c, x + 28, y + 19, 10, 6, '#7FD4E0');
  } else if (id === 'anh') {
    [['#F4B93B'], ['#F08DA4'], ['#6DA9D9']].forEach((a, i) => {
      R(c, x + 3 + i * 16, y + 5, 12, 12, '#4B2B21');
      R(c, x + 4 + i * 16, y + 6, 10, 10, a[0]);
    });
  } else if (id === 'ngu') {
    R(c, x + 3, y + 28, 30, 8, '#8FC1E3');
    R(c, x + 3, y + 22, 9, 7, '#F9B8C4');
    R(c, x + 38, y + 22, 9, 11, '#FFFFFF');
    R(c, x + 40, y + 27, 3, 2, '#F4B93B');
  }
}

function drawMap(c, t, sel) {
  const rd = mulberry32(5);
  R(c, 0, 0, 176, 108, '#CFE8D8');
  R(c, 0, 102, 176, 6, '#86B866');
  R(c, 76, 102, 16, 6, '#E4D6B0');
  // Mái ngói
  R(c, 2, 2, 172, 13, '#C94A29');
  for (let y = 4; y < 13; y += 3) {
    R(c, 2, y, 172, 1, '#8E2816');
    for (let x = (y % 2 ? 2 : 5); x < 174; x += 6) R(c, x, y + 1, 1, 2, '#8E2816');
  }
  R(c, 6, 16, 164, 87, '#4B2B21');

  // Vẽ 6 phòng
  Object.entries(HR).forEach(([id, r]) => {
    R(c, r.x, r.y, r.w, r.h, r.wall);
    R(c, r.x, r.y + r.h - 4, r.w, 4, '#C99A6B');
    R(c, r.x, r.y + r.h - 4, r.w, 1, '#A87650');
    mini(c, id, r);
  });
  // Dầm chia tầng
  R(c, 6, 56, 164, 4, '#8A5A34');
  R(c, 8, 56, 160, 1, '#B07A48');

  // Cầu thang
  for (let i = 0; i < 11; i++) {
    const x = 76 + i * 3, h = 4 * (i + 1);
    R(c, x, 98 - h, 3, h, '#A87650');
    R(c, x, 98 - h, 3, 1, '#D9A878');
  }

  // Viền vàng nhấp nháy phòng đang chọn
  const s = HR[sel], g = (Math.floor(t * 2) % 2) ? '#F4B93B' : '#FFFBF1';
  R(c, s.x - 2, s.y - 2, s.w + 4, 2, g);
  R(c, s.x - 2, s.y + s.h, s.w + 4, 2, g);
  R(c, s.x - 2, s.y - 2, 2, s.h + 4, g);
  R(c, s.x + s.w, s.y - 2, 2, s.h + 4, g);
}

/* NỘI THẤT CHI TIẾT 6 PHÒNG ĐẬM KHÔNG KHÍ NOEL (176x96) */
const FURN = {
  sanh: (c, t) => {
    // Cửa chính gỗ có vòng nguyệt quế Noel
    R(c, 6, 20, 28, 46, '#5E3A20'); R(c, 8, 22, 24, 44, '#8A5A34');
    for (let y = 26; y < 64; y += 6) R(c, 8, y, 24, 1, '#6B4426');
    R(c, 12, 26, 16, 10, '#BFE3E8'); R(c, 25, 46, 3, 3, '#F4B93B');
    // Vòng nguyệt quế Noel
    E(c, 20, 36, 5, 5, '#5E9A57');
    E(c, 20, 36, 2, 2, '#8A5A34');
    R(c, 19, 31, 3, 2, '#E0452B'); // nơ đỏ
    // Thảm đỏ hoa văn Giáng Sinh
    R(c, 50, 76, 76, 14, '#C93A25');
    R(c, 53, 79, 70, 8, '#F4D58A');
    R(c, 56, 82, 64, 2, '#E0452B');
    // Kệ tủ gỗ và Hũ tiết kiệm vàng
    ob(c, 132, 44, 36, 22, '#8A5A34');
    R(c, 134, 47, 32, 6, '#C99A6B');
    R(c, 134, 55, 32, 6, '#C99A6B');
    // Chú Heo Đất Tiết Kiệm Vàng trên nóc kệ
    R(c, 142, 36, 12, 8, '#F4B93B');
    R(c, 144, 34, 3, 2, '#B97A14'); // tai
    R(c, 153, 39, 2, 3, '#B97A14'); // mũi
    R(c, 146, 36, 4, 1, '#2B2118'); // khe thả tiền
  },
  bep: (c, t) => {
    // Tủ lạnh trắng với nam châm trái cây
    ob(c, 6, 14, 24, 52, '#DDE6EE');
    R(c, 8, 38, 20, 1, '#2B2118');
    R(c, 24, 22, 2, 10, '#8B8B93'); R(c, 24, 42, 2, 10, '#8B8B93');
    R(c, 12, 20, 4, 4, '#E0452B'); R(c, 17, 26, 4, 4, '#F4B93B');
    // Bếp nấu ăn gỗ & Mặt đá ấm
    ob(c, 116, 44, 60, 22, '#A8754A');
    R(c, 116, 41, 60, 4, '#E8D6B4');
    // Nồi súp đang sôi bốc 3 làn khói nghi ngút
    ob(c, 130, 30, 18, 12, '#8B8B93');
    R(c, 148, 33, 5, 2, '#6B6B73');
    for (let i = 0; i < 3; i++) {
      const yy = 26 - ((t * 6 + i * 4) % 12);
      R(c, 134 + i * 5, Math.round(yy), 1, 3, 'rgba(255,255,255,.85)');
    }
    // Dĩa bánh gừng Noel trên bàn
    R(c, 156, 38, 12, 4, '#F4B93B');
    R(c, 160, 36, 4, 2, '#A84A28');
    // Máy hút mùi phía trên
    R(c, 158, 12, 1, 6, '#4B2B21');
    ob(c, 155, 18, 8, 8, '#4B4B52');
  },
  lamviec: (c, t) => {
    // Bảng kế hoạch & Lịch Noel đỏ
    ob(c, 6, 12, 24, 30, '#F7EFDA');
    R(c, 10, 34, 6, 1, '#E0452B'); R(c, 15, 28, 1, 7, '#E0452B');
    R(c, 22, 22, 1, 7, '#E0452B'); R(c, 21, 19, 3, 3, '#E0452B');
    // Bàn làm việc & Ghế đỏ
    R(c, 96, 48, 74, 4, '#B07A48');
    R(c, 98, 52, 4, 14, '#8A5A34'); R(c, 164, 52, 4, 14, '#8A5A34');
    // Ghế đẩu đỏ
    R(c, 84, 50, 10, 3, '#E0452B'); R(c, 86, 53, 2, 11, '#C93A25'); R(c, 92, 53, 2, 11, '#C93A25');
    // Màn hình PC phát sáng Cyan nhấp nháy sinh động
    ob(c, 120, 34, 26, 14, '#2B2118');
    const pcTint = Math.sin(t * 4) > 0 ? '#7FD4E0' : '#69C5D1';
    R(c, 122, 36, 22, 10, pcTint);
    // Vệt code trên màn hình
    R(c, 124, 38, 8, 1, '#FFF'); R(c, 124, 41, 14, 1, '#FFF'); R(c, 124, 43, 10, 1, '#E0452B');
    // Bàn phím & Cốc cafe nóng
    R(c, 116, 48, 34, 2, '#CFC6B6');
    ob(c, 154, 42, 6, 6, '#FFFFFF');
    R(c, 156, 39, 1, 3, 'rgba(255,255,255,.7)');
  },
  khach: (c, t) => {
    // Ghế Sofa hồng êm ái cùng gối vàng & gối xanh
    ob(c, 90, 40, 82, 16, '#E86F8B');
    ob(c, 86, 50, 88, 16, '#F08DA4');
    R(c, 94, 44, 12, 8, '#F4B93B'); // Gối vàng
    R(c, 150, 44, 12, 8, '#8FC1E3'); // Gối xanh
    // CÂY THÔNG NOEL MINI NHẤP NHÁY ĐÈN LED (3 TẦNG)
    const tx = 16, ty = 34;
    R(c, tx + 6, ty + 24, 4, 8, '#6B4426'); // Gốc cây
    // Tầng 3
    E(c, tx + 8, ty + 20, 9, 5, '#3E8139');
    // Tầng 2
    E(c, tx + 8, ty + 13, 7, 4, '#4E9A47');
    // Tầng 1
    E(c, tx + 8, ty + 7, 5, 3, '#5E9A57');
    // Ngôi sao vàng đỉnh cây
    R(c, tx + 7, ty + 2, 3, 3, '#F4B93B');
    // Đèn LED Noel nhấp nháy 3 màu
    const ledCols = ['#E0452B', '#F4B93B', '#7FD4E0', '#FFFFFF'];
    const l1 = ledCols[Math.floor(t * 3) % 4];
    const l2 = ledCols[Math.floor(t * 3 + 1) % 4];
    const l3 = ledCols[Math.floor(t * 3 + 2) % 4];
    R(c, tx + 3, ty + 18, 2, 2, l1);
    R(c, tx + 11, ty + 19, 2, 2, l2);
    R(c, tx + 7, ty + 12, 2, 2, l3);
    R(c, tx + 12, ty + 13, 2, 2, l1);
    R(c, tx + 5, ty + 8, 2, 2, l2);

    // LÒ SƯỞI ẤM BẬP BÙNG LỬA ĐỎ
    ob(c, 40, 46, 30, 20, '#8A4A32');
    R(c, 44, 52, 22, 14, '#2B1A10');
    // Đốm lửa bập bùng
    const fH = Math.round((Math.sin(t * 12) + 1) * 2);
    R(c, 49, 62 - fH, 12, 4 + fH, '#E0452B');
    R(c, 52, 63 - fH, 6, 3 + fH, '#F4B93B');
  },
  ngu: (c, t) => {
    // Giường ngủ gỗ ấm áp
    ob(c, 4, 52, 66, 16, '#8A5A34');
    R(c, 6, 44, 62, 10, '#FFFBF1');
    R(c, 8, 40, 16, 10, '#F9B8C4'); // Gối hồng
    R(c, 26, 44, 40, 10, '#8FC1E3'); // Chăn xanh
    R(c, 26, 48, 40, 2, '#6DA9D9');
    // Bít tất Noel đỏ viền trắng treo đầu giường
    R(c, 4, 40, 3, 6, '#E0452B');
    R(c, 4, 39, 4, 2, '#FFF');
    R(c, 6, 44, 3, 2, '#E0452B'); // Mũi tất

    // Cửa sổ nhìn ra ngoài trời tuyết rơi
    ob(c, 126, 10, 36, 30, '#CFE8F2');
    R(c, 144, 10, 2, 30, '#2B2118');
    R(c, 126, 24, 36, 2, '#2B2118');
    // Bông tuyết rơi nhẹ lãng mạn
    for (let i = 0; i < 6; i++) {
      const sx = 128 + ((i * 19 + 7) % 32);
      const sy = 12 + Math.round((t * 10 + i * 6) % 24);
      R(c, sx, sy, 1, 1, '#FFFFFF');
    }

    // Đèn ngủ vàng ấm trên bàn cạnh giường
    R(c, 130, 52, 36, 3, '#8A5A34');
    ob(c, 140, 40, 16, 12, '#E9F4F6');
    E(c, 148, 34, 5, 5, '#FFF4B0'); // Chụp đèn sáng vàng
  },
  anh: (c, t) => {
    // Kệ gỗ trưng bày album
    ob(c, 10, 48, 60, 18, '#8A5A34');
    ['#E0452B', '#F4B93B', '#6DA9D9', '#5E9A57'].forEach((col, i) => {
      R(c, 13 + i * 7, 50, 5, 14, col); R(c, 41 + i * 7, 50, 5, 14, col);
    });
    // Giá vẽ gỗ & Tranh trái tim kỷ niệm có nơ đỏ
    R(c, 128, 38, 2, 28, '#8A5A34'); R(c, 150, 38, 2, 28, '#8A5A34');
    ob(c, 124, 34, 32, 24, '#FFFBF1');
    heart(c, 137, 42, '#E0452B');
    R(c, 137, 32, 6, 2, '#E0452B'); // Nơ đỏ xinh
    // 5 Khung ảnh pixel treo tường
    for (let i = 0; i < 5; i++) {
      const fx = 8 + i * 34, fy = 6;
      R(c, fx, fy, 28, 26, '#4B2B21');
      R(c, fx + 1, fy + 1, 26, 24, '#F2DFA8');
      // Tranh màu sắc
      const photoCols = ['#D9A45B', '#6B3F26', '#C0502B', '#8B5BB0', '#5EA04C'];
      R(c, fx + 3, fy + 3, 22, 20, photoCols[i % photoCols.length]);
      R(c, fx + 7, fy + 8, 14, 10, '#FFFBF1');
      R(c, fx + 11, fy + 11, 6, 4, '#F9B8C4');
    }
  }
};

function drawRoom(c, id, t) {
  const r = HR[id];
  R(c, 0, 0, W_ROOM, H_ROOM, r.wall);
  R(c, 0, 64, W_ROOM, 32, '#C99A6B');
  for (let x = 0; x < W_ROOM; x += 16) R(c, x, 64, 1, 32, '#A87650');
  (FURN[id] || FURN.sanh)(c, t);
}

function pigBlit(c, x, y, face, o, jump, t) {
  hpx.clearRect(0, 0, 24, 20);
  drawPigSprite(hpx, o);
  const sw = Math.round(8 - (jump || 0) * 0.5);
  R(c, Math.round(x) - sw, Math.round(y) - 1, sw * 2, 2, 'rgba(40,25,10,.22)');
  c.save();
  const py = Math.round(y - 18 - (jump || 0));
  if (face < 0) {
    c.translate(Math.round(x + 11), py);
    c.scale(-1, 1);
    c.drawImage(hpCanvas, 0, 0);
  } else {
    c.drawImage(hpCanvas, Math.round(x - 11), py);
  }
  c.restore();

  // Floating Zzz khi ngủ
  if (o.pose === 'sleep') {
    for (let i = 0; i < 3; i++) {
      const p = (t * 0.8 + i / 3) % 1;
      c.globalAlpha = 1 - p;
      zGlyph(c, Math.round(x + 6 + p * 8), Math.round(y - 18 - p * 12));
      c.globalAlpha = 1;
    }
  }
  // Floating Heart khi vui
  if (o.happy) {
    const p = (t * 1.5) % 1;
    c.globalAlpha = 1 - p * 0.5;
    heart(c, Math.round(x + 2), Math.round(y - 24 - p * 8), '#E0452B');
    c.globalAlpha = 1;
  }
}

function routeTo(id) {
  const r = HR[id], tx = r.cx + ((Math.random() * 14 - 7) | 0), ty = FLOOR_Y[r.row], lvl = mp.y >= 96 ? 1 : 0;
  const A = [STAIR.x0, STAIR.y0], B = [STAIR.x1, STAIR.y1];
  let wp;
  if (r.row === 1) wp = lvl === 1 ? [[tx, ty]] : [B, A, [tx, ty]];
  else wp = lvl === 0 ? [[tx, ty]] : [A, B, [tx, ty]];
  mp.target = id; mp.wp = wp; mp.moving = true;
}

function arrive() {
  mp.room = mp.target; mp.moving = false;
  enterRoomView();
}

function updMap(dt) {
  if (!mp.wp.length) { mp.moving = false; return; }
  mp.moving = true;
  const tx = mp.wp[0][0], ty = mp.wp[0][1], dx = tx - mp.x, dy = ty - mp.y, d = Math.hypot(dx, dy);
  if (d < 1.2) {
    mp.wp.shift();
    if (!mp.wp.length) arrive();
    return;
  }
  const st = Math.min(d, 40 * dt);
  mp.x += dx / d * st; mp.y += dy / d * st;
  if (Math.abs(dx) > 0.3) mp.face = dx > 0 ? 1 : -1;
  mp.ft += dt;
  if (mp.ft > 0.18) { mp.ft = 0; mp.frame ^= 1; }
}

function enterRoomView() {
  rp.present = true;
  rp.x = selRoom === 'sanh' ? 30 : 15;
  rp.y = 82;
  rp.face = 1;
  rp.mode = 'walk';
  rp.tx = 60 + Math.random() * 60;
  rp.ty = 82;
  rp.after = () => { rp.mode = 'idle'; rp.t = 0; rp.dur = 2; };

  const quotes = {
    sanh: 'Chào mừng bạn ghé thăm Nhà của Heo nha! 🚪✨',
    bep: 'Bếp thơm lừng món ngon! Tháng này ăn uống no nê nha 🍲',
    khach: 'Cây thông lung linh, ngồi sofa ngắm Noel bạn ơi 🎄🛋️',
    lamviec: 'Bàn làm việc gọn gàng, kiểm tra chi đi lại nào 💻',
    anh: 'Phòng lưu giữ kỷ niệm những bữa ăn & hóa đơn chụp được 📸',
    ngu: 'Phòng ngủ êm ái, bít tất Noel treo sẵn đón quà nè 🛏️🎁'
  };
  say2(quotes[selRoom] || 'Ủn ỉn! Heo yêu ngôi nhà này lắm.', 3600);
}

function updRoom(dt) {
  if (!rp.present) return;
  rp.t += dt; rp.ft += dt;
  if (rp.mode === 'happy') {
    rp.jump = Math.abs(Math.sin(rp.t * 10)) * 6;
    if (rp.t > rp.dur) {
      rp.jump = 0;
      const a = rp.after; rp.after = null;
      if (a) a(); else { rp.mode = 'idle'; rp.t = 0; rp.dur = 2; }
    }
    return;
  }
  if (rp.mode === 'sleep' || rp.mode === 'eat' || rp.mode === 'work') {
    if (rp.t > rp.dur) {
      const a = rp.after; rp.after = null;
      if (a) a(); else { rp.mode = 'idle'; rp.t = 0; rp.dur = 2; }
    }
    return;
  }
  if (rp.mode === 'idle') {
    if (rp.t > rp.dur) {
      rp.mode = 'walk';
      rp.tx = 20 + Math.random() * 130;
      rp.ty = 82;
      rp.after = () => { rp.mode = 'idle'; rp.t = 0; rp.dur = 2; };
    }
    return;
  }
  const dx = rp.tx - rp.x, dy = rp.ty - rp.y, d = Math.hypot(dx, dy);
  if (d < 1.5) {
    const a = rp.after; rp.after = null;
    if (a) a(); else { rp.mode = 'idle'; rp.t = 0; rp.dur = 2; }
    return;
  }
  const st = Math.min(d, 28 * dt);
  rp.x += dx / d * st; rp.y += dy / d * st;
  if (Math.abs(dx) > 0.4) rp.face = dx > 0 ? 1 : -1;
  if (rp.ft > 0.2) { rp.ft = 0; rp.frame ^= 1; }
}

let lastNow = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastNow) / 1000), t = now / 1000;
  lastNow = now;
  updMap(dt);
  updRoom(dt);
  drawMap(mapX, t, selRoom);
  pigBlit(mapX, mp.x, mp.y, mp.face, { pose: mp.moving ? 'walk' : 'stand', frame: mp.frame, mood: 'ok', blink: (t % 3.2) < 0.12, tail: Math.floor(t * 3) % 2 === 1 }, 0, t);

  drawRoom(roomX, selRoom, t);
  pigBlit(roomX, rp.x, rp.y, rp.face, { pose: rp.mode, frame: rp.frame, mood: 'ok', happy: rp.mode === 'happy', blink: (t % 3.2) < 0.12, tail: Math.floor(t * 3) % 2 === 1 }, rp.jump, t);
  placeB2();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function selectRoom(id) {
  if (!HR[id]) return;
  selRoom = id;
  document.querySelectorAll('#roomChips .chip-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.room === id);
  });
  document.getElementById('roomTag').textContent = HR[id].n + ' · ' + HR[id].sub;
  routeTo(id);

  try {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'ROOM_SELECTED',
        room: { id, name: HR[id].n, subtitle: HR[id].sub }
      }));
    }
  } catch(e) {}
}
window.selectRoom = selectRoom;

// Setup Chips
const chipsContainer = document.getElementById('roomChips');
ROOM_ORDER.forEach(id => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'chip-btn' + (id === selRoom ? ' active' : '');
  btn.dataset.room = id;
  btn.textContent = HR[id].n;
  btn.addEventListener('click', () => selectRoom(id));
  chipsContainer.appendChild(btn);
});

// Chạm trực tiếp trên mặt cắt ngôi nhà
mapC.addEventListener('pointerdown', e => {
  const r = mapC.getBoundingClientRect(),
        x = (e.clientX - r.left) / r.width * W_MAP,
        y = (e.clientY - r.top) / r.height * H_MAP;
  for (const [id, room] of Object.entries(HR)) {
    if (x >= room.x && x <= room.x + room.w && y >= room.y && y <= room.y + room.h) {
      selectRoom(id);
      break;
    }
  }
});

// HỆ THỐNG TOUCH ACTIONS TƯƠNG TÁC ĐỒ VẬT TRONG PHÒNG
roomC.addEventListener('pointerdown', e => {
  const rect = roomC.getBoundingClientRect(),
        x = (e.clientX - rect.left) / rect.width * W_ROOM,
        y = (e.clientY - rect.top) / rect.height * H_ROOM;

  // 1. Chạm vào chính Chú Heo
  if (Math.hypot(x - rp.x, y - (rp.y - 10)) < 18) {
    rp.mode = 'happy';
    rp.t = 0;
    rp.dur = 1.6;
    rp.after = () => { rp.mode = 'idle'; rp.dur = 2; };
    say2('Ủn ỉn! Heo yêu bạn nhất trần đời! ❤️', 2500);
    return;
  }

  // 2. Chạm tương tác theo từng phòng
  if (selRoom === 'ngu') {
    // Chạm Giường ngủ hoặc Tất Noel
    if (x <= 74 && y >= 36) {
      rp.tx = 34; rp.ty = 82; rp.face = 1; rp.mode = 'walk';
      rp.after = () => {
        rp.mode = 'sleep'; rp.t = 0; rp.dur = 6.5;
        say2('Khò khò... Giường êm quá! Noel ngủ ngon lành 💤', 3500);
      };
      return;
    }
    // Chạm Cửa sổ tuyết rơi
    if (x >= 122 && y <= 45) {
      rp.tx = 138; rp.ty = 82; rp.face = 1; rp.mode = 'walk';
      rp.after = () => {
        rp.mode = 'happy'; rp.t = 0; rp.dur = 2.2;
        say2('Oa! Ngoài trời tuyết rơi đẹp và lãng mạn quá ❄️', 3000);
      };
      return;
    }
  } else if (selRoom === 'bep') {
    // Chạm Bếp nấu / Nồi súp
    if (x >= 110 && y >= 25) {
      rp.tx = 130; rp.ty = 82; rp.face = 1; rp.mode = 'walk';
      rp.after = () => {
        rp.mode = 'eat'; rp.t = 0; rp.dur = 4.5;
        say2('Thơm nức mũi! Nấu ăn tại nhà tiết kiệm được bao nhiêu tiền 🍲', 3800);
      };
      return;
    }
    // Chạm Tủ lạnh
    if (x <= 36) {
      rp.tx = 38; rp.ty = 82; rp.face = -1; rp.mode = 'walk';
      rp.after = () => {
        rp.mode = 'happy'; rp.t = 0; rp.dur = 2;
        say2('Mở tủ lạnh xem có món gì ngon ăn tráng miệng hông nè 🍰', 3000);
      };
      return;
    }
  } else if (selRoom === 'lamviec') {
    // Chạm Bàn máy tính
    if (x >= 90) {
      rp.tx = 112; rp.ty = 82; rp.face = 1; rp.mode = 'walk';
      rp.after = () => {
        rp.mode = 'work'; rp.t = 0; rp.dur = 4.5;
        say2('Cày deadline săn thưởng cuối năm sắm quà Noel nào! 💻', 3500);
      };
      return;
    }
    // Chạm Kệ sách / lịch Noel
    if (x <= 42) {
      rp.tx = 42; rp.ty = 82; rp.face = -1; rp.mode = 'walk';
      rp.after = () => {
        say2('Đếm ngược từng ngày đến giáng sinh và năm mới nè 📅', 3000);
      };
      return;
    }
  } else if (selRoom === 'khach') {
    // Chạm Cây thông Noel hoặc Lò sưởi
    if (x <= 72) {
      rp.tx = 36; rp.ty = 82; rp.face = -1; rp.mode = 'walk';
      rp.after = () => {
        rp.mode = 'happy'; rp.t = 0; rp.dur = 2.5;
        say2('Cây thông Noel lung linh quá! Lò sưởi ấm sực ghê 🎄🔥', 3500);
      };
      return;
    }
    // Chạm Ghế sofa
    if (x >= 85) {
      rp.tx = 120; rp.ty = 82; rp.face = 1; rp.mode = 'walk';
      rp.after = () => {
        rp.mode = 'happy'; rp.t = 0; rp.dur = 2;
        say2('Nằm sofa xem phim Noel thư giãn hết nấc 🛋️', 3000);
      };
      return;
    }
  } else if (selRoom === 'anh') {
    // Chạm Khung ảnh tường
    if (y <= 42) {
      rp.tx = clamp(x, 20, 150); rp.ty = 82; rp.mode = 'walk';
      rp.after = () => {
        rp.mode = 'happy'; rp.t = 0; rp.dur = 2;
        say2('Từng bức ảnh ghi dấu những bữa ăn ngon và kỷ niệm đẹp 📸', 3500);
      };
      return;
    }
  } else if (selRoom === 'sanh') {
    // Chạm Hũ tiết kiệm heo vàng
    if (x >= 125) {
      rp.tx = 138; rp.ty = 82; rp.face = 1; rp.mode = 'walk';
      rp.after = () => {
        rp.mode = 'happy'; rp.t = 0; rp.dur = 2;
        say2('Tích tiểu thành đại! Ví Heo Con luôn đồng hành cùng bạn 🪙', 3500);
      };
      return;
    }
  }

  // Chạm vào sàn nhà -> Heo đi dạo tới vị trí chạm
  if (y >= 64) {
    rp.tx = clamp(x, 18, 158);
    rp.ty = 82;
    rp.mode = 'walk';
    rp.after = () => { rp.mode = 'idle'; rp.dur = 2; };
  }
});

// Nút ra vườn chơi
document.getElementById('btnGarden').addEventListener('click', () => {
  try {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXIT_TO_GARDEN' }));
    }
  } catch(e) {}
});

})();
</script>
</body>
</html>
  `;

  return (
    <View style={[styles.container, style]}>
      <SafeWebView
        ref={webViewRef}
        source={{ html: htmlSource }}
        originWhitelist={['*']}
        style={styles.webView}
        scrollEnabled={false}
        javaScriptEnabled={true}
        onMessage={(event: any) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'ROOM_SELECTED' && onSelectRoom) {
              onSelectRoom({
                id: data.room.id,
                name: data.room.name,
                category: data.room.id === 'bep' ? 'an_uong' : data.room.id === 'khach' ? 'mua_sam' : data.room.id === 'lamviec' ? 'di_chuyen' : 'all',
                subtitle: data.room.subtitle,
              });
            } else if (data.type === 'EXIT_TO_GARDEN' && onExitToGarden) {
              onExitToGarden();
            }
          } catch (e) {}
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    backgroundColor: '#F6EEDC',
    borderRadius: 24,
    overflow: 'hidden',
  },
  webView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F6EEDC',
  },
});
