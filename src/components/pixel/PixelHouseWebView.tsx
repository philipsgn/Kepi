import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { WebView } from 'react-native-webview';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

export interface PixelHouseWebViewRef {
  selectRoom: (roomId: string) => void;
  toggleTour: () => void;
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
  style?: StyleProp<ViewStyle>;
}

export const PixelHouseWebView = forwardRef<
  PixelHouseWebViewRef,
  PixelHouseWebViewProps
>(({ currentMonth = new Date().getMonth() + 1, totalSpent = 0, onSelectRoom, style }, ref) => {
  const webViewRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    selectRoom: (roomId: string) => {
      const code = `if (window.selectRoom) { window.selectRoom('${roomId}'); }`;
      webViewRef.current?.injectJavaScript(code);
    },
    toggleTour: () => {
      const code = `if (window.toggleTour) { window.toggleTour(); }`;
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
      font-family: -apple-system, system-ui, sans-serif;
    }
    .house-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      padding: 10px 12px 16px;
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
    }
    .bubble2 {
      position: absolute;
      transform: translate(-50%, -100%);
      background: #FFFBF1;
      border: 2px solid #2B2118;
      border-radius: 12px;
      padding: 4px 8px;
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity .15s;
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
      border-right: 2px solid #2B2118;
      border-bottom: 2px solid #2B2118;
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
    <!-- 1. MẶT CẮT NGÔI NHÀ 2 TẦNG 6 PHÒNG -->
    <div class="scene-card">
      <canvas id="map" width="176" height="108"></canvas>
    </div>

    <!-- 2. DẢI CHỌN PHÒNG CHIPS -->
    <div class="chips-row" id="roomChips"></div>

    <!-- 3. CHI TIẾT CĂN PHÒNG ĐANG CHỌN -->
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

function R(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }
function E(c, x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fill(); }
function ob(c, x, y, w, h, col) { R(c, x, y, w, h, '#2B2118'); R(c, x + 1, y + 1, w - 2, h - 2, col); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function mulberry32(a) { return function() { let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; } }

/* Vẽ chú heo sprite 24x20 */
function drawPigSprite(c, o) {
  const p = o.pose || 'stand', fr = o.frame || 0, tail = o.tail, blink = o.blink, sad = o.mood === 'sad';
  const PIG = '#F9B8C4', PIG_D = '#F48BA3', PIG_SH = '#D9758D', INK = '#2B2118';
  R(c, 4, 3, 14, 11, PIG);
  R(c, 6, 2, 10, 1, PIG);
  R(c, 4, 14, 14, 1, PIG_SH);
  // Tai
  R(c, 2, 2, 3, 4, PIG_D); R(c, 2, 1, 2, 1, INK);
  R(c, 9, 2, 3, 4, PIG_D); R(c, 9, 1, 2, 1, INK);
  // Mũi & Mõm
  R(c, 16, 7, 5, 5, PIG_D);
  R(c, 18, 9, 1, 1, INK); R(c, 20, 9, 1, 1, INK);
  // Mắt
  if (blink) {
    R(c, 13, 6, 2, 1, INK);
  } else if (sad) {
    R(c, 13, 7, 2, 1, INK); R(c, 12, 6, 1, 1, INK);
  } else {
    R(c, 13, 5, 2, 2, INK); R(c, 13, 5, 1, 1, '#FFF');
  }
  // Chân
  const ly = 14;
  if (p === 'walk') {
    const off = fr ? 1 : -1;
    R(c, 5 + off, ly, 2, 4, PIG_SH); R(c, 9 - off, ly, 2, 4, PIG_SH);
    R(c, 13 + off, ly, 2, 4, PIG_SH); R(c, 16 - off, ly, 2, 4, PIG_SH);
  } else {
    R(c, 5, ly, 2, 4, PIG_SH); R(c, 9, ly, 2, 4, PIG_SH);
    R(c, 13, ly, 2, 4, PIG_SH); R(c, 16, ly, 2, 4, PIG_SH);
  }
  // Đuôi
  if (tail) {
    R(c, 2, 8, 2, 1, PIG_D); R(c, 1, 7, 1, 2, PIG_D);
  } else {
    R(c, 2, 9, 2, 1, PIG_D); R(c, 1, 8, 1, 2, PIG_D);
  }
}

const mapC = document.getElementById('map'), mapX = mapC.getContext('2d');
const roomC = document.getElementById('room'), roomX = roomC.getContext('2d');
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
  bubble2.style.top = Math.max(22, (rp.y - 24 - rp.jump) / H_ROOM * 100) + '%';
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

  // Viền vàng nhấp nháy cho phòng đang chọn
  const s = HR[sel], g = (Math.floor(t * 2) % 2) ? '#F4B93B' : '#FFFBF1';
  R(c, s.x - 2, s.y - 2, s.w + 4, 2, g);
  R(c, s.x - 2, s.y + s.h, s.w + 4, 2, g);
  R(c, s.x - 2, s.y - 2, 2, s.h + 4, g);
  R(c, s.x + s.w, s.y - 2, 2, s.h + 4, g);
}

/* Nội thất bên trong từng phòng (176x96) */
const FURN = {
  sanh: (c, t) => {
    R(c, 6, 20, 28, 46, '#5E3A20'); R(c, 8, 22, 24, 44, '#8A5A34');
    for (let y = 26; y < 64; y += 6) R(c, 8, y, 24, 1, '#6B4426');
    R(c, 12, 26, 16, 10, '#BFE3E8'); R(c, 25, 46, 3, 3, '#F4B93B');
    R(c, 52, 76, 72, 14, '#C93A25'); R(c, 55, 79, 66, 8, '#F4D58A');
    ob(c, 132, 46, 36, 20, '#8A5A34');
  },
  bep: (c, t) => {
    ob(c, 6, 14, 24, 52, '#DDE6EE'); R(c, 8, 38, 20, 1, '#2B2118');
    ob(c, 118, 44, 58, 22, '#A8754A'); R(c, 118, 41, 58, 4, '#E8D6B4');
    ob(c, 132, 30, 16, 11, '#8B8B93');
    for (let i = 0; i < 3; i++) {
      const yy = 26 - ((t * 6 + i * 4) % 12);
      R(c, 136 + i * 5, Math.round(yy), 1, 3, 'rgba(255,255,255,.75)');
    }
  },
  lamviec: (c, t) => {
    ob(c, 6, 12, 24, 30, '#F7EFDA');
    R(c, 98, 48, 72, 4, '#B07A48'); R(c, 100, 52, 4, 14, '#8A5A34'); R(c, 164, 52, 4, 14, '#8A5A34');
    ob(c, 122, 36, 24, 12, '#2B2118'); R(c, 124, 38, 20, 8, '#7FD4E0');
  },
  khach: (c, t) => {
    ob(c, 92, 40, 76, 16, '#E86F8B'); ob(c, 88, 50, 84, 16, '#F08DA4');
    R(c, 96, 44, 12, 8, '#F4B93B'); R(c, 150, 44, 12, 8, '#8FC1E3');
    ob(c, 10, 50, 14, 14, '#B5603A'); E(c, 17, 42, 9, 8, '#5E9A57');
  },
  ngu: (c, t) => {
    ob(c, 4, 52, 64, 16, '#8A5A34'); R(c, 6, 44, 60, 10, '#FFFBF1');
    R(c, 8, 40, 16, 10, '#F9B8C4'); R(c, 26, 44, 38, 10, '#8FC1E3');
    ob(c, 128, 10, 34, 30, '#CFE8F2'); R(c, 144, 10, 2, 30, '#2B2118');
    E(c, 136, 18, 4, 4, '#FFF4B0');
  },
  anh: (c, t) => {
    ob(c, 10, 48, 60, 18, '#8A5A34');
    ['#E0452B', '#F4B93B', '#6DA9D9', '#5E9A57'].forEach((col, i) => {
      R(c, 13 + i * 7, 50, 5, 14, col); R(c, 41 + i * 7, 50, 5, 14, col);
    });
    R(c, 128, 38, 2, 28, '#8A5A34'); R(c, 150, 38, 2, 28, '#8A5A34');
    ob(c, 124, 34, 32, 24, '#FFFBF1');
  }
};

function drawRoom(c, id, t) {
  const r = HR[id];
  R(c, 0, 0, W_ROOM, H_ROOM, r.wall);
  R(c, 0, 64, W_ROOM, 32, '#C99A6B');
  for (let x = 0; x < W_ROOM; x += 16) R(c, x, 64, 1, 32, '#A87650');
  (FURN[id] || FURN.sanh)(c, t);
}

function pigBlit(c, x, y, face, o, jump) {
  c.save();
  if (face < 0) {
    c.translate(Math.round(x + 11), Math.round(y - 18 - (jump || 0)));
    c.scale(-1, 1);
    drawPigSprite(c, o);
  } else {
    c.translate(Math.round(x - 11), Math.round(y - 18 - (jump || 0)));
    drawPigSprite(c, o);
  }
  c.restore();
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
    khach: 'Phòng khách ấm cúng, ngồi sofa nghỉ xíu bạn ơi 🛋️',
    lamviec: 'Bàn làm việc gọn gàng, kiểm tra chi đi lại nào 💻',
    anh: 'Phòng lưu giữ kỷ niệm những bữa ăn & hóa đơn chụp được 📸',
    ngu: 'Phòng ngủ êm ái, tiền đã giữ lại được cất ở đây nè 🛏️'
  };
  say2(quotes[selRoom] || 'Ủn ỉn! Heo yêu ngôi nhà này lắm.', 3600);
}

function updRoom(dt) {
  if (!rp.present) return;
  rp.t += dt; rp.ft += dt;
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
  pigBlit(mapX, mp.x, mp.y, mp.face, { pose: mp.moving ? 'walk' : 'stand', frame: mp.frame, mood: 'ok', tail: Math.floor(t * 3) % 2 === 1 }, 0);

  drawRoom(roomX, selRoom, t);
  pigBlit(roomX, rp.x, rp.y, rp.face, { pose: rp.mode === 'walk' ? 'walk' : 'stand', frame: rp.frame, mood: 'ok', tail: Math.floor(t * 3) % 2 === 1 }, 0);
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

// Chạm phòng bên dưới để heo reo vui
roomC.addEventListener('pointerdown', () => {
  say2('Ủn ỉn! Heo đang ở ' + HR[selRoom].n + ' nè! ✨', 2000);
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
    height: 280,
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
