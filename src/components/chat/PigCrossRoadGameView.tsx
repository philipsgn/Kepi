import React, { useEffect, useMemo, useRef } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import {
  PixelIconBack,
  PixelIconReload,
  PixelIconTicket,
  PixelIconTraffic,
  PixelIconWing,
} from '../pixel/PixelIcons';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface PigCrossRoadGameViewProps {
  onBack: () => void;
  onSwitchGame?: (game: 'fly' | 'cross') => void;
  tickets?: number;
  food?: number;
  hunger?: number;
  todayBudget?: number;
  todaySpent?: number;
  onFeedPig?: () => void;
  onUseTicket?: () => boolean;
  onBuyTicket?: () => boolean;
  onSaveStats?: (stats: { crossRoadStars?: number; crossRoadMaxLevel?: number; foodEarned?: number }) => void;
}

export const PigCrossRoadGameView: React.FC<PigCrossRoadGameViewProps> = ({
  onBack,
  onSwitchGame,
  tickets = 3,
  food = 10,
  hunger = 75,
  todayBudget = 200000,
  todaySpent = 0,
  onFeedPig,
  onUseTicket,
  onBuyTicket,
  onSaveStats,
}) => {
  const webViewRef = useRef<any>(null);
  const initialRef = useRef({ tickets, todayBudget, todaySpent });

  // Đồng bộ số vé hai chiều vào WebView đang chạy KHÔNG gây reload (Quyết định 174)
  useEffect(() => {
    if (webViewRef.current && typeof webViewRef.current.injectJavaScript === 'function') {
      webViewRef.current.injectJavaScript(
        `window.__syncTickets && window.__syncTickets(${Number(tickets) || 0}); true;`
      );
    }
  }, [tickets]);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  const handleReload = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    webViewRef.current?.reload();
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'HAPTIC_LIGHT') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (data.type === 'HAPTIC_SUCCESS') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (data.type === 'HAPTIC_FAIL') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else if (data.type === 'SWITCH_GAME') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (onSwitchGame) onSwitchGame(data.game);
      } else if (data.type === 'USE_TICKET') {
        if (onUseTicket) {
          onUseTicket();
        }
      } else if (data.type === 'BUY_TICKET') {
        if (onBuyTicket) {
          onBuyTicket();
        }
      } else if (data.type === 'FEED_PIG') {
        if (onFeedPig) {
          onFeedPig();
        }
      } else if (data.type === 'SAVE_STATS') {
        if (onSaveStats) {
          onSaveStats({
            crossRoadStars: data.crossRoadStars,
            crossRoadMaxLevel: data.crossRoadMaxLevel,
            foodEarned: data.foodEarned,
          });
        }
      } else if (data.type === 'GO_HOME') {
        handleBack();
      } else if (data.type === 'JS_ERROR') {
        // Quyết định 148: Cầu nối bắt lỗi JS trong WebView
        console.warn('[PigCrossRoadGameView] WebView JS error:', data.message, 'line', data.line, 'col', data.col);
      }
    } catch (e) {
      // ignore
    }
  };

  const htmlContent = useMemo(() => `
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<script>
window.onerror = function (msg, src, line, col) {
  try {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'JS_ERROR', message: String(msg), line: line || 0, col: col || 0 }));
    }
  } catch (e) {}
  return false;
};
</script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Nunito:wght@600;700;800&display=swap" media="print" onload="this.media='all'">
<style>
:root {
  --page: #F6EEDC;
  --screen: #F6EEDC;
  --card: #FFFBF1;
  --ink: #2B2118;
  --muted: #85735E;
  --pig: #F9B8C4;
  --green: #5E9A57;
  --red: #E0452B;
  --gold: #F4B93B;
  --line: #D9C9A4;
  --f-display: 'Baloo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --f-body: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  background: #CDEBF7;
  color: var(--ink);
  font: 600 13px/1.35 var(--f-body);
  user-select: none;
  -webkit-user-select: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Quy tắc bắt buộc Rule 4: chống kẹt popup */
[hidden] { display: none !important; }
.flyover[hidden] { display: none !important; }

/* Switcher giữa 3 game */
.switchbar {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  flex-shrink: 0;
}
.switch-btn {
  flex: 1;
  padding: 6px 4px;
  border: 3px solid var(--ink);
  border-radius: 12px;
  background: var(--card);
  color: var(--ink);
  font: 800 13px var(--f-display);
  text-align: center;
  box-shadow: 0 3px 0 var(--ink);
  cursor: pointer;
}
.switch-btn.active {
  background: var(--gold);
  transform: translateY(2px);
  box-shadow: 0 1px 0 var(--ink);
}

.flytop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  flex-shrink: 0;
}
.who {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 8px;
}
.who b {
  font: 800 17px var(--f-display);
  line-height: 1.1;
  color: var(--ink);
}
.who span {
  font-size: 12px;
  color: var(--muted);
  font-weight: 700;
}

.gbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 5px;
  flex-shrink: 0;
}
.crlv {
  display: flex;
  gap: 6px;
  flex: 1;
}
.crlv i {
  width: 24px;
  height: 12px;
  border: 3px solid var(--ink);
  border-radius: 5px;
  background: var(--card);
}
.crlv i.on {
  background: var(--gold);
}
.crlv i.done {
  background: var(--green);
}

.gtix {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--card);
  border: 3px solid var(--ink);
  border-radius: 999px;
  box-shadow: 0 2px 0 var(--ink);
  font: 800 13px var(--f-display);
}

.crhud {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
  font: 800 12px var(--f-body);
  flex-wrap: wrap;
  flex-shrink: 0;
}
.crhud span {
  padding: 4px 10px;
  background: var(--card);
  border: 3px solid var(--ink);
  border-radius: 999px;
  box-shadow: 0 2px 0 var(--ink);
  display: flex;
  align-items: center;
  gap: 4px;
}
.crhud b {
  font: 800 14px var(--f-display);
}

.hearts {
  display: inline-flex;
  gap: 4px;
  padding: 4px 8px !important;
}
.hearts i {
  display: inline-block;
  width: 14px;
  height: 14px;
  background: var(--red);
  border-radius: 3px;
  transform: rotate(45deg);
  position: relative;
}
.hearts i::before, .hearts i::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  background: var(--red);
  border-radius: 50%;
}
.hearts i::before { left: -7px; top: 0; }
.hearts i::after { top: -7px; left: 0; }
.hearts i.off {
  background: #C4B8A8;
}
.hearts i.off::before, .hearts i.off::after {
  background: #C4B8A8;
}

/* Scene canvas 192x340 pixelated — Full-bleed kéo dài sát đáy chuẩn iOS/Samsung (Quyết định 171) */
.scene {
  position: relative;
  flex: 1;
  min-height: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #CDEBF7;
  border: none;
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
}
.scene canvas {
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
  image-rendering: -webkit-crisp-edges;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  touch-action: none;
}
.cr-float-hud {
  position: absolute;
  top: 8px;
  left: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  pointer-events: none;
  z-index: 8;
}
.cr-pill {
  padding: 3px 10px;
  background: rgba(255, 251, 241, 0.92);
  border: 2.5px solid var(--ink);
  border-radius: 999px;
  box-shadow: 0 2px 0 var(--ink);
  font: 800 12px/1.2 var(--f-display);
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.cr-hand-fab {
  position: absolute;
  right: 16px;
  bottom: 20px;
  width: 62px;
  height: 62px;
  border-radius: 31px;
  border: 3px solid var(--ink);
  background: var(--pig);
  box-shadow: 0 4px 0 var(--ink);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 12;
  touch-action: manipulation;
}
.cr-hand-fab:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 var(--ink);
}
.cr-hand-fab:disabled {
  opacity: 0.45;
  filter: grayscale(0.6);
}
.cr-hand-fab span {
  font-size: 22px;
  line-height: 1;
}
.cr-hand-fab b {
  font: 800 11px/1.1 var(--f-display);
  color: var(--ink);
  margin-top: 2px;
}
.cr-tap-hint {
  position: absolute;
  left: 16px;
  bottom: 24px;
  padding: 5px 12px;
  background: rgba(255, 251, 241, 0.88);
  border: 2px solid var(--ink);
  border-radius: 999px;
  font: 800 11px/1.2 var(--f-body);
  color: var(--ink);
  pointer-events: none;
  z-index: 8;
}

.flytoast {
  position: absolute;
  top: 46px;
  left: 50%;
  transform: translateX(-50%) translateY(-30px);
  padding: 6px 14px;
  background: var(--card);
  border: 3px solid var(--ink);
  border-radius: 999px;
  box-shadow: 0 3px 0 var(--ink);
  font: 800 13px var(--f-display);
  color: var(--ink);
  opacity: 0;
  transition: transform .2s ease, opacity .2s ease;
  pointer-events: none;
  z-index: 20;
  white-space: nowrap;
}
.flytoast.on {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
}

.flyover {
  position: absolute;
  inset: 0;
  background: rgba(43, 33, 24, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 30;
}
.card {
  width: 100%;
  max-width: 320px;
  background: var(--card);
  border: 3px solid var(--ink);
  border-radius: 20px;
  box-shadow: 0 6px 0 var(--ink);
  padding: 16px;
  text-align: center;
}
.card .label {
  display: inline-block;
  padding: 3px 10px;
  background: var(--gold);
  border: 2px solid var(--ink);
  border-radius: 999px;
  font: 800 12px var(--f-display);
  margin-bottom: 6px;
}
.card b {
  display: block;
  font: 800 20px var(--f-display);
  color: var(--ink);
  margin-bottom: 6px;
}
.card p {
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.35;
  color: var(--ink);
}
.card ul {
  text-align: left;
  margin: 8px 0 12px;
  padding-left: 20px;
  font-size: 12px;
  color: var(--ink);
  line-height: 1.4;
}
.card .gain {
  font: 800 14px var(--f-display);
  color: #2F6F3A;
  background: #D9EAD3;
  padding: 6px 10px;
  border: 2px solid var(--ink);
  border-radius: 10px;
  margin: 8px 0;
}
.card .les {
  font-size: 12px;
  font-style: italic;
  color: var(--muted);
  margin-bottom: 12px;
}
.pact {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}
.btn {
  padding: 8px 16px;
  border: 3px solid var(--ink);
  border-radius: 12px;
  background: var(--card);
  color: var(--ink);
  font: 800 14px var(--f-display);
  box-shadow: 0 3px 0 var(--ink);
  cursor: pointer;
}
.btn.small {
  padding: 5px 10px;
  font-size: 11px;
  border-radius: 10px;
  min-height: 32px;
}
.btn.gold {
  background: var(--gold);
}
.btn:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 var(--ink);
}

/* Control Pad (Chuẩn Prototype: Grid 3x2 + Hand Button) */
.crpad {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 6px;
  flex-shrink: 0;
  user-select: none;
  -webkit-user-select: none;
}
.dpad {
  display: grid;
  grid-template-columns: repeat(3, 44px);
  grid-template-rows: repeat(2, 44px);
  gap: 6px;
  grid-template-areas: ". u ." "l d r";
  flex-shrink: 0;
}
.dpad button {
  width: 44px;
  height: 44px;
  border: 3px solid var(--ink);
  border-radius: 14px;
  background: var(--card);
  color: var(--ink);
  font: 800 18px var(--f-display);
  box-shadow: 0 3px 0 var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  touch-action: none;
}
.dpad button:active, .dpad button.held {
  transform: translateY(2px);
  box-shadow: 0 1px 0 var(--ink);
  background: var(--gold);
}
.dpad [data-d="u"] { grid-area: u; background: var(--gold); }
.dpad [data-d="l"] { grid-area: l; }
.dpad [data-d="d"] { grid-area: d; }
.dpad [data-d="r"] { grid-area: r; }

.handbtn {
  flex: 1;
  height: 94px;
  min-height: 80px;
  border: 3px solid var(--ink);
  border-radius: 20px;
  background: var(--pig);
  color: var(--ink);
  box-shadow: 0 4px 0 var(--ink);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px;
  touch-action: none;
}
.handbtn b {
  font: 800 19px var(--f-display);
}
.handbtn small {
  font-size: 11px;
  font-weight: 700;
  color: var(--ink);
}
.handbtn:disabled {
  opacity: .5;
}
.handbtn:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 var(--ink);
  background: #F4A2B2;
}

.privacy {
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.35;
  color: var(--muted);
  text-align: center;
  flex-shrink: 0;
}
.privacy b {
  color: var(--ink);
}
</style>
</head>
<body>

  <div class="scene crscene" id="crScene">
    <canvas id="crCv" width="192" height="342"></canvas>
    <div class="cr-float-hud">
      <div class="cr-pill"><span class="hearts" id="crHearts"></span><span id="crSub">Bưu điện TP</span></div>
      <div class="cr-pill"><span>🌾 <b id="crCam">0</b></span><div class="crlv" id="crLv"></div></div>
    </div>
    <div class="cr-tap-hint" id="crHint">Chạm tiến · Vuốt né xe</div>
    <button class="cr-hand-fab" type="button" id="crHand" aria-label="Giơ tay chặn ô tô">
      <span>✋</span>
      <b id="crHandN">2</b>
    </button>
    <div class="flytoast" id="crToast"></div>
    <div class="flyover" id="crOver"></div>
  </div>



<script>
(function(){
'use strict';

const LIMIT = ${Math.max(1000, initialRef.current.todayBudget)};
const SPENT = ${initialRef.current.todaySpent};
let G_TIX = ${initialRef.current.tickets};
let G_CROSS = [0, 0, 0, 0];
window.__syncTickets = function(n) {
  G_TIX = Math.max(0, Number(n) || 0);
  if (typeof crHud === 'function') crHud();
};

function post(obj) {
  try {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(obj));
    }
  } catch(e) {}
}

const $ = (id) => document.getElementById(id);
const INK = '#2B2118';
const R = (c,x,y,w,h,col) => { c.fillStyle=col; c.fillRect(x,y,w,h); };
const E = (c,cx,cy,rx,ry,col) => {
  c.fillStyle=col;
  for (let y=-ry; y<=ry; y++) {
    for (let x=-rx; x<=rx; x++) {
      if (x*x/(rx*rx) + y*y/(ry*ry) <= 1) c.fillRect(cx+x, cy+y, 1, 1);
    }
  }
};
function mk(w,h,fn) {
  const cv=document.createElement('canvas');
  cv.width=w; cv.height=h;
  fn(cv.getContext('2d'));
  return cv;
}
function mulberry32(a) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ====== HEO QUA ĐƯỜNG: 2.5D Toàn Màn Hình Dọc 9:16 (192×342), 4 địa danh Sài Gòn & 4 loại xe 16-bit (Quyết định 172) ====== */
const XW = 192, XH = 342, CTOP = 88, RD0 = 92, RD1 = 278;
const CLV = [
  { n: 'Bưu điện TP', s: 'Công xã Paris', dens: 0.75 },
  { n: 'Chợ Bến Thành', s: 'Lê Lợi', dens: 0.95 },
  { n: 'Nhà thờ Đức Bà', s: 'Quận 1', dens: 1.15 },
  { n: 'Dinh Độc Lập', s: 'Giờ cao điểm', dens: 1.35 }
];

const LN = [
  { y0: 92, h: 28, s: 0.65, d: -1, mix: [['bike', 0.45], ['car', 0.70], ['truck', 0.86], ['bus', 1]] },
  { y0: 120, h: 33, s: 0.74, d: 1, mix: [['bike', 0.72], ['car', 0.90], ['truck', 1]] },
  { y0: 153, h: 37, s: 0.83, d: -1, mix: [['bike', 0.55], ['truck', 0.72], ['bus', 0.84], ['car', 1]] },
  { y0: 190, h: 42, s: 0.92, d: 1, mix: [['bike', 0.78], ['car', 0.92], ['truck', 1]] },
  { y0: 232, h: 46, s: 1.0, d: -1, mix: [['bike', 0.85], ['car', 1]] }
];
LN.forEach(l => { l.g = Math.round(l.y0 + l.h * 0.64); });

const CVK = {
  bike: { W: 30, sp: [40, 58] },
  car: { W: 56, sp: [30, 42] },
  truck: { W: 70, sp: [24, 34] },
  bus: { W: 84, sp: [22, 30] }
};
const CSH = ['#E0452B', '#4B6FA5', '#2F8F83', '#F4B93B', '#8E5FA8', '#F4F0E6', '#3A3A4A', '#E8548C'];
const CBODY = ['#F4F0E6', '#E0452B', '#2B2B3A', '#4B6FA5', '#C9C9D4', '#2F8F83', '#F4B93B'];

const cr = {
  lv: 0, st: 'ready', t: 0, last: 0, run: false,
  pig: { x: 96, y: 238, step: 0, mv: 0, idle: 0, f: 1 },
  veh: [], lane: [], hearts: 3, hand: 0, handN: 2, inv: 0,
  coins: [], cam: 0, dodge: 0, hold: {}, bg: [null, null, null, null],
  toast: 0, paid: false, mul: 1, pct: 0
};

function crScale(y) {
  if (y < RD0) return LN[0].s;
  for (const l of LN) if (y < l.y0 + l.h) return l.s;
  return 1;
}

function crBrick(c, x0, y0, w, h, rd, k) {
  R(c, x0, y0, w, h, '#9E4632');
  const cols = ['#B5533C', '#A4472F', '#C4624A', '#B04D38'];
  let y = y0, row = 0;
  while (y < y0 + h) {
    const th = Math.max(3, Math.round(k * (1 + (y - y0) / h * 0.9) * 6)), tw = Math.round(th * 1.7);
    for (let x = x0 - (row % 2) * (tw >> 1); x < x0 + w; x += tw) {
      R(c, Math.max(x0, x + 1), y + 1, Math.min(tw - 1, x0 + w - Math.max(x0, x + 1)), th - 1, cols[(rd() * 4) | 0]);
    }
    y += th; row++;
  }
}

function crMiniBike(c, x, y) {
  const col = CBODY[(x * 7 + y) % CBODY.length];
  R(c, x, y - 5, 10, 2, INK);
  R(c, x + 1, y - 5, 8, 1, col);
  R(c, x + 3, y - 9, 3, 4, INK);
  R(c, x + 4, y - 8, 1, 3, '#E8B98A');
  E(c, x + 2, y - 2, 2, 2, INK);
  E(c, x + 8, y - 2, 2, 2, INK);
}

function crFacade(c, lv) {
  const tree = (x, y) => {
    E(c, x, y, 9, 7, INK);
    E(c, x, y, 8, 6, '#5E9A57');
    E(c, x - 3, y - 2, 3, 2, '#78B65C');
    R(c, x - 1, y + 5, 2, 5, '#6A4A2A');
  };

  if (lv === 0) {
    // Bưu điện TP HCM
    R(c, 0, 0, 192, 54, '#F0C24A');
    R(c, 0, 0, 192, 4, '#E8A93A');
    R(c, 0, 4, 192, 1, '#B8842A');
    [10, 48, 84, 106, 142, 180].forEach(x => {
      R(c, x, 5, 5, 49, '#FFFBF1');
      R(c, x + 4, 5, 1, 49, '#D9D0B8');
    });
    [[17, 13], [30, 13], [120, 13], [133, 13], [150, 13], [163, 13]].forEach(a => {
      R(c, a[0], 14, 10, 27, '#2B2118');
      R(c, a[0] + 1, 15, 8, 25, '#4E9A5A');
      for (let y = 17; y < 40; y += 3) R(c, a[0] + 1, y, 8, 1, '#2F6F3A');
    });
    E(c, 96, 26, 25, 17, '#8A2A22');
    E(c, 96, 27, 21, 14, '#B33A2A');
    R(c, 75, 26, 42, 28, '#B33A2A');
    E(c, 96, 28, 17, 12, INK);
    R(c, 79, 28, 34, 26, INK);
    E(c, 96, 9, 7, 7, INK);
    E(c, 96, 9, 6, 6, '#FFFBF1');
    R(c, 96, 4, 1, 6, INK);
    R(c, 96, 9, 4, 1, INK);
    R(c, 0, 46, 192, 8, '#D9B24A');
    R(c, 0, 46, 192, 1, '#B8842A');
  } else if (lv === 1) {
    // Chợ Bến Thành
    R(c, 0, 0, 192, 54, '#EBDDB0');
    R(c, 0, 0, 192, 5, '#B8604A');
    R(c, 0, 5, 192, 1, '#8A4560');
    for (let x = 6; x < 70; x += 12) {
      R(c, x, 16, 8, 12, INK); R(c, x + 1, 17, 6, 10, '#2F6F8F');
      R(c, x, 34, 8, 14, INK); R(c, x + 1, 35, 6, 12, '#2F6F8F');
    }
    for (let x = 126; x < 186; x += 12) {
      R(c, x, 16, 8, 12, INK); R(c, x + 1, 17, 6, 10, '#2F6F8F');
      R(c, x, 34, 8, 14, INK); R(c, x + 1, 35, 6, 12, '#2F6F8F');
    }
    R(c, 72, 0, 48, 54, '#E2CF98'); R(c, 72, 0, 48, 2, INK);
    R(c, 71, 0, 1, 54, '#B8A870'); R(c, 120, 0, 1, 54, '#B8A870');
    R(c, 86, 0, 20, 5, '#B8604A'); R(c, 92, 0, 8, 2, INK);
    E(c, 96, 16, 9, 9, INK); E(c, 96, 16, 8, 8, '#FFFBF1');
    R(c, 96, 9, 1, 8, INK); R(c, 96, 16, 5, 1, INK);
    R(c, 78, 30, 36, 24, INK); R(c, 80, 32, 32, 22, '#5A3A22');
    for (let x = 82; x < 112; x += 8) R(c, x, 32, 1, 22, INK);
    E(c, 96, 32, 15, 5, '#E2CF98'); R(c, 0, 48, 192, 6, '#D9C890');
  } else if (lv === 2) {
    // Nhà thờ Đức Bà
    R(c, 0, 0, 192, 54, '#B8604A');
    R(c, 0, 20, 192, 34, '#B8604A');
    [[24, 40], [128, 40]].forEach(a => {
      R(c, a[0], 0, a[1], 54, '#A4503A');
      R(c, a[0] + a[1] / 2 - 3, 0, 6, 2, INK);
      for (let y = 6; y < 50; y += 2) if (y % 4 === 0) R(c, a[0], y, a[1], 1, '#C4705A');
      R(c, a[0] + a[1] / 2 - 4, 4, 8, 22, INK);
      R(c, a[0] + a[1] / 2 - 3, 5, 6, 20, '#FFE08A');
      R(c, a[0] + a[1] / 2 - 1, 5, 2, 20, INK);
      R(c, a[0] + a[1] / 2 - 5, 32, 10, 18, INK);
      R(c, a[0] + a[1] / 2 - 4, 33, 8, 17, '#5A3A22');
    });
    R(c, 64, 18, 64, 36, '#B8604A'); R(c, 64, 18, 64, 2, '#D9A88E');
    E(c, 96, 32, 10, 10, INK); E(c, 96, 32, 9, 9, '#6DA9D9');
    R(c, 96, 23, 1, 19, INK); R(c, 87, 32, 19, 1, INK);
    R(c, 84, 40, 24, 14, INK); R(c, 86, 42, 20, 12, '#5A3A22');
    R(c, 0, 50, 192, 4, '#9E4632');
  } else {
    // Dinh Độc Lập
    R(c, 0, 0, 192, 54, '#EDE8DA');
    R(c, 16, 8, 160, 4, '#F3EEDD');
    R(c, 16, 12, 160, 42, '#F3EEDD');
    R(c, 16, 12, 160, 1, '#B8B2A2');
    for (let x = 22; x < 172; x += 8) {
      R(c, x, 16, 6, 30, '#9FB6C9');
      for (let y = 20; y < 44; y += 6) R(c, x + 2, y, 2, 2, '#F3EEDD');
    }
    R(c, 72, 12, 48, 42, '#F3EEDD');
    for (let x = 76; x < 118; x += 8) R(c, x, 14, 5, 36, '#D9D4C4');
    R(c, 84, 38, 24, 16, INK);
    R(c, 96, 0, 1, 10, INK); R(c, 97, 0, 10, 6, '#E0452B'); R(c, 100, 1, 4, 4, '#F4B93B');
    R(c, 16, 50, 160, 4, '#D9D4C4');
  }
  tree(8, 48); tree(184, 48);
}

function crBgBuild(lv) {
  return mk(XW, XH, c => {
    const rd = mulberry32(300 + lv);
    R(c, 0, 0, XW, XH, '#6BBBE8');
    R(c, 0, 12, XW, 18, '#9AD4F5');
    // Pixel dithering checkerboard sắc nét giữa 2 tầng trời 16-bit (zero smooth gradient)
    for (let dx = 0; dx < XW; dx += 2) {
      R(c, dx, 11, 1, 1, '#9AD4F5');
      R(c, dx + 1, 12, 1, 1, '#6BBBE8');
      R(c, dx, 22, 1, 1, '#CDEBF7');
    }
    R(c, 0, 23, XW, 10, '#CDEBF7');
    // Mây trời Sài Gòn phía trên địa danh
    [[28, 10], [116, 8], [164, 14]].forEach(([cx, cy]) => {
      E(c, cx, cy, 12, 3, '#FFFBF1');
      E(c, cx + 6, cy - 2, 7, 2, '#FFFBF1');
    });
    c.save();
    c.translate(0, 26);
    crFacade(c, lv);
    c.restore();
    crBrick(c, 0, 80, XW, 12, rd, 0.4);
    R(c, 0, 80, XW, 3, 'rgba(0,0,0,.18)');
    for (let i = 0; i < 9; i++) crMiniBike(c, 6 + i * 21 + ((rd() * 6) | 0), 90);
    R(c, 0, 91, XW, 1, INK);
    R(c, 0, 92, XW, 1, '#CFC6B6');
    const roadH = RD1 - RD0;
    R(c, 0, RD0, XW, roadH, '#4F4D5A');
    for (let i = 0; i < 150; i++) {
      R(c, (rd() * XW) | 0, RD0 + ((rd() * roadH) | 0), 1 + ((rd() * 3) | 0), 1, rd() < 0.5 ? '#5A5866' : '#46444F');
    }
    for (let i = 0; i < 4; i++) {
      const px = (rd() * 150) | 0, py = RD0 + 14 + ((rd() * (roadH - 28)) | 0);
      R(c, px, py, 20, 6, 'rgba(0,0,0,.18)');
    }
    const bnd = [LN[1].y0, LN[2].y0, LN[3].y0, LN[4].y0];
    bnd.forEach((y, i) => {
      const s = LN[i + 1].s, dl = Math.max(5, Math.round(12 * s)), gp = Math.max(4, Math.round(9 * s));
      if (i === 1) {
        R(c, 0, y - 1, XW, 1, '#F4C94A');
        R(c, 0, y + 1, XW, 1, '#F4C94A');
      } else {
        for (let x = 2; x < XW; x += dl + gp) R(c, x, y, dl, 1, '#DAD6E4');
      }
    });
    let y = RD0, k = 0;
    while (y < RD1) {
      const s = 0.62 + 0.38 * (y - RD0) / roadH, h = Math.max(2, Math.round(4.0 * s));
      if (k % 2 === 0) {
        for (let r = 0; r < h && y + r < RD1; r++) {
          const yy = y + r, hw = 24 + 24 * (yy - RD0) / roadH;
          R(c, Math.round(96 - hw), yy, Math.round(hw * 2), 1, '#E4E4EE');
        }
      }
      y += h; k++;
    }
    R(c, 0, RD1, XW, 1, INK);
    R(c, 0, RD1 + 1, XW, 2, '#CFC6B6');
    crBrick(c, 0, RD1 + 3, XW, XH - RD1 - 3, rd, 0.9);
    R(c, 78, RD1 + 3, 36, XH - RD1 - 3, '#BDBDC6');
    for (let yy = RD1 + 3; yy < XH; yy += 14) R(c, 78, yy, 36, 1, '#9A9AA6');
    R(c, 96, RD1 + 3, 1, XH - RD1 - 3, '#9A9AA6');
    R(c, 14, RD1 + 6, 2, 34, INK);
    R(c, 6, RD1 + 6, 18, 10, INK);
    R(c, 7, RD1 + 7, 16, 8, '#2F6F8F');
    R(c, 10, RD1 + 10, 10, 1, '#FFFBF1');
    [[148, RD1 + 38], [168, RD1 + 38]].forEach(a => {
      R(c, a[0], a[1], 14, 3, INK);
      R(c, a[0] + 1, a[1] - 12, 12, 12, INK);
      R(c, a[0] + 2, a[1] - 11, 10, 10, '#E0452B');
      R(c, a[0] + 1, a[1] + 3, 3, 10, INK);
      R(c, a[0] + 10, a[1] + 3, 3, 10, INK);
    });
  });
}

function crNew(lv) {
  cr.lv = lv; cr.st = 'ready'; cr.veh = []; cr.hearts = 3; cr.hand = 0; cr.inv = 0; cr.cam = 0; cr.dodge = 0; cr.paid = false; cr.hold = {};
  const pct = SPENT / LIMIT; cr.pct = pct;
  cr.mul = CLV[lv].dens * (pct < 0.5 ? 0.85 : pct > 1 ? 1.25 : 1);
  cr.handN = 2 + (pct < 0.5 ? 1 : 0);
  cr.pig = { x: 96, y: 312, step: 0, mv: 0, idle: 0, f: 1 };
  cr.lane = LN.map((l, i) => ({ timer: 0.2 + i * 0.35, last: null }));
  cr.coins = [0, 1, 2].map(i => ({
    x: 24 + Math.random() * 144,
    y: [LN[1].y0, LN[2].y0, LN[3].y0][i] + ((i % 2) ? 6 : -4),
    got: false
  }));
  if (!cr.bg[lv]) cr.bg[lv] = crBgBuild(lv);
  crHud(); crOver(); crDraw();
}

function crPick(l) {
  const r = Math.random();
  for (const m of l.mix) if (r <= m[1]) return m[0];
  return 'bike';
}

function crSpawn(i) {
  const L = LN[i], k = crPick(L), K = CVK[k], d = L.d, s = L.s;
  const sp = (K.sp[0] + Math.random() * (K.sp[1] - K.sp[0])) * (0.6 + s * 0.4), w = K.W * s;
  const R_ = a => a[(Math.random() * a.length) | 0], rr = Math.random;
  const v = {
    k, x: d > 0 ? -w - 4 : XW + 4, y: L.g, ly: L.g, ty: L.g, lane: i, W: K.W, w, d, sp, base: sp,
    body: R_(CBODY), sh: R_(CSH), sh2: R_(CSH), hm: R_(CSH), skin: rr() < 0.5 ? '#E8B98A' : '#D9A06A',
    two: rr() < 0.3, cargo: rr() < 0.15, mask: rr() < 0.28, hat: rr() < 0.12, sw: false, warn: false
  };
  cr.veh.push(v); return v;
}

function crToast(t) {
  const e = $('crToast');
  if (!e) return;
  e.textContent = t; e.classList.add('on');
  clearTimeout(cr.toast);
  cr.toast = setTimeout(() => e.classList.remove('on'), 1800);
}

function crHud() {
  const hEl = $('crHearts');
  if (hEl) {
    hEl.innerHTML = Array.from({ length: 3 }, (_, i) => '<i class="' + (i < cr.hearts ? '' : 'off') + '"></i>').join('');
  }
  const hnEl = $('crHandN'); if (hnEl) hnEl.textContent = String(cr.handN);
  const cmEl = $('crCam'); if (cmEl) cmEl.textContent = String(cr.cam);
  const sbEl = $('crSub'); if (sbEl) sbEl.textContent = CLV[cr.lv].n + ' · ' + CLV[cr.lv].s;
  const hBtn = $('crHand'); if (hBtn) hBtn.disabled = cr.st !== 'play' || cr.handN <= 0;
  const lvEl = $('crLv');
  if (lvEl) {
    lvEl.innerHTML = [0, 1, 2, 3].map(i => '<i class="' + (i === cr.lv ? 'on' : '') + (G_CROSS[i] ? ' done' : '') + '"></i>').join('');
  }
  const tixEl = $('uiTix');
  if (tixEl) tixEl.textContent = String(G_TIX);
}

function crOver(h) {
  const o = $('crOver');
  if (!o) return;
  if (cr.st === 'play' || cr.st === 'ready') {
    o.style.display = 'none';
    o.hidden = true;
    o.innerHTML = '';
    return;
  }
  o.style.display = 'flex';
  o.hidden = false;

  if (cr.st === 'win') {
    const s = h.stars || 1;
    o.innerHTML = '<div class="card"><div class="label">Qua đường thành công!</div><b>' + '★'.repeat(s) + '☆'.repeat(3 - s) + '</b><p>Bạn đã sang đường an toàn tới ' + CLV[cr.lv].n + '! Đã lách điệu nghệ ' + cr.dodge + ' lần.</p>' +
      '<p class="gain">+' + h.gain + ' cám (vượt ải ' + h.base + ', thưởng sao ' + h.bonus + ', nhặt ' + cr.cam + ')' + (h.fed ? ' · Heo no thêm 10%' : '') + '</p>' +
      '<p class="les">Đi đều thì xe tự lách. Chi tiêu kỷ luật cũng chiến thắng âu lo.</p>' +
      '<div class="pact">' + (cr.lv < 3 ? '<button class="btn gold" type="button" data-cr="next">Màn tiếp theo</button>' : '') +
      '<button class="btn" type="button" data-cr="again">Chơi lại</button>' +
      '<button class="btn" type="button" data-cr="home">Về khu giải trí</button></div></div>';
  } else {
    o.innerHTML = '<div class="card"><div class="label">Bị tông trúng rồi!</div><b>Ối, đau quá!</b><p>Khoản chi bất ngờ hay đến những lúc bạn chần chừ đứng yên.</p>' +
      '<p class="les">Lần sau giữ nhịp bước đều và bấm Giơ tay chặn xe hơi nhé.</p>' +
      '<div class="pact">' +
      (G_TIX <= 0
        ? '<button class="btn gold" type="button" data-cr="buy">10 cám = 1 vé</button>'
        : '<button class="btn gold" type="button" data-cr="again">Thử lại</button>') +
      '<button class="btn" type="button" data-cr="home">Về khu giải trí</button></div></div>';
  }
}

function crStart() {
  if (cr.st === 'play') return;
  if (!cr.paid) {
    if (G_TIX <= 0) {
      crToast('Hết vé chơi hôm nay rồi!');
      post({ type: 'HAPTIC_FAIL' });
      return;
    }
    G_TIX = Math.max(0, G_TIX - 1);
    post({ type: 'USE_TICKET' });
    cr.paid = true;
  }
  post({ type: 'HAPTIC_LIGHT' });
  cr.st = 'play';
  crOver();
  crHud();
}

function crFinish(win) {
  cr.st = win ? 'win' : 'lose';
  let h = {};
  if (win) {
    const stars = Math.max(1, cr.hearts), base = 6, bonus = stars * 3, gain = base + bonus + cr.cam;
    h = { stars, base, bonus, gain, fed: true };
    G_CROSS[cr.lv] = Math.max(G_CROSS[cr.lv] || 0, stars);
    post({ type: 'HAPTIC_SUCCESS' });
    post({
      type: 'SAVE_STATS',
      crossRoadStars: G_CROSS.reduce((a, b) => a + b, 0),
      crossRoadMaxLevel: Math.max(cr.lv + 1, 1),
      foodEarned: gain
    });
    post({ type: 'FEED_PIG' });
  } else {
    h = { lost: 1 };
    post({ type: 'HAPTIC_FAIL' });
  }
  crHud();
  crOver(h);
}

function crHit() {
  cr.hearts--;
  cr.inv = 1.5;
  crToast('Ối! Bị tông rồi!');
  post({ type: 'HAPTIC_LIGHT' });
  crHud();
  if (cr.hearts <= 0) {
    crFinish(false);
    return;
  }
  cr.pig.x = 96;
  cr.pig.y = 312;
}

function crStep(dt) {
  cr.t += dt;
  const p = cr.pig, hd = cr.hold;
  if (cr.inv > 0) cr.inv -= dt;
  if (cr.hand > 0) cr.hand -= dt;

  const spd = 20;
  let mx = (hd.r ? 1 : 0) - (hd.l ? 1 : 0);
  let my = (hd.d ? 1 : 0) - (hd.u ? 1 : 0);

  if (mx || my) {
    p.mv = 0.5; p.idle = 0; p.step += dt * 8;
    if (mx) p.f = mx;
    p.x = Math.max(8, Math.min(XW - 8, p.x + mx * spd * dt));
    p.y = Math.max(CTOP - 4, Math.min(XH - 6, p.y + my * spd * dt));
  } else {
    p.mv = Math.max(0, p.mv - dt);
    p.idle += dt;
  }

  cr.lane.forEach((l, i) => {
    l.timer -= dt;
    if (l.timer <= 0) {
      const L = LN[i], lv = l.last;
      const clear = !lv || (L.d > 0 ? lv.x > 12 : lv.x + lv.w < XW - 12);
      if (clear) {
        l.last = crSpawn(i);
        l.timer = (1 + Math.random() * 1.8) / cr.mul;
      } else {
        l.timer = 0.25;
      }
    }
  });

  cr.veh.forEach(v => {
    const L = LN[v.lane], vc = v.x + v.w / 2, dx = (p.x - vc) * v.d, dy = Math.abs(p.y - v.y), th = 3.5 * L.s + 3;
    if (v.k === 'bike') {
      if (dx > -2 && dx < 52 && dy < 14) {
        if (p.idle < 0.9) {
          const up = v.y >= p.y;
          v.ty = Math.max(L.y0 + 3, Math.min(L.y0 + L.h + 2, up ? p.y + th + 4 : p.y - th - 4));
          if (!v.sw) {
            v.sw = true; cr.dodge++;
            if (cr.dodge % 3 === 1) crToast('Lách! Xe máy tránh heo');
          }
        } else {
          v.ty = v.ly;
          if (!v.warn) { v.warn = true; crToast('Bíp bíp! Đừng đứng yên!'); }
        }
      } else if (v.ty !== v.ly && dx < -6) {
        v.ty = v.ly;
      }
    } else if (cr.hand > 0 && dx > -4 && dx < 64 && dy < 16) {
      v.sp += (v.base * 0.1 - v.sp) * Math.min(1, dt * 6);
      if (!v.warn) { v.warn = true; crToast('Xe hơi phanh lại rồi!'); }
    } else {
      v.sp += (v.base - v.sp) * Math.min(1, dt * 1.5);
    }

    v.x += v.d * v.sp * dt;
    v.y += Math.max(-45 * dt, Math.min(45 * dt, v.ty - v.y));

    if (cr.inv <= 0 && cr.st === 'play' && Math.abs(p.x - vc) < v.w / 2 + 4 && dy < th) {
      crHit();
    }
  });

  cr.veh = cr.veh.filter(v => v.x > -110 && v.x < XW + 110);
  cr.lane.forEach(l => { if (l.last && !cr.veh.includes(l.last)) l.last = null; });

  cr.coins.forEach(c => {
    if (!c.got && Math.hypot(c.x - p.x, (c.y - p.y) * 1.6) < 8) {
      c.got = true; cr.cam++; crHud();
      crToast('+1 cám!');
      post({ type: 'HAPTIC_LIGHT' });
    }
  });

  if (cr.st === 'play' && p.y <= CTOP) {
    crFinish(true);
  }
}

function crVeh(c, v) {
  const s = LN[v.lane].s, d = v.d, bx = Math.round(v.x), gy = Math.round(v.y), W = v.W, K = v.k, sp = ((cr.t * 14) | 0) % 2;
  const X = (dx, dy, w, h, col) => R(c, bx + Math.round((d > 0 ? dx : W - dx - w) * s), gy + Math.round(dy * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s)), col);
  const O = (cx, cy, r) => {
    const q = Math.max(2, Math.round(r * s)), x = bx + Math.round((d > 0 ? cx : W - cx) * s), y = gy + Math.round(cy * s);
    E(c, x, y, q, q, INK); E(c, x, y, q - 1, q - 1, '#4A4A55');
    if (q > 2) E(c, x, y, Math.max(1, q - 3), Math.max(1, q - 3), '#C7C7D2');
    R(c, x + (sp ? -1 : 0), y + (sp ? 0 : -1), 1, 1, '#FFFBF1');
  };

  c.fillStyle = 'rgba(0,0,0,.22)';
  c.fillRect(bx + Math.round(2 * s), gy - 1, Math.round((W - 4) * s), Math.max(2, Math.round(3 * s)));

  if (K === 'bike') {
    if (v.cargo) { X(-3, -24, 8, 9, INK); X(-2, -23, 6, 7, '#F3EEDD'); X(-2, -19, 6, 1, '#C49A6E'); }
    O(6, -5, 5); O(24, -5, 5);
    X(2, -15, 13, 8, INK); X(3, -14, 11, 6, v.body); X(10, -8, 12, 3, INK); X(11, -8, 10, 2, v.body);
    X(21, -18, 4, 12, INK); X(22, -17, 2, 10, v.body);
    X(25, -14, 2, 3, '#FFE08A'); X(0, -12, 2, 2, '#E0452B'); X(21, -21, 8, 2, INK); X(27, -24, 1, 3, INK);
    X(6, -16, 10, 2, '#2B2118'); X(13, -14, 4, 8, '#2B3A5A'); X(17, -9, 5, 2, INK);
    if (v.two) { X(3, -27, 6, 12, v.sh2); X(3, -27, 1, 12, INK); X(3, -33, 6, 6, v.skin); X(2, -35, 8, 3, v.hm); }
    X(9, -28, 8, 14, INK); X(10, -27, 6, 12, v.sh); X(15, -25, 9, 2, v.sh); X(23, -25, 3, 2, v.skin);
    X(15, -34, 7, 7, v.skin);
    if (v.hat) {
      X(11, -37, 15, 2, INK); X(12, -38, 13, 1, '#E8D49A'); X(14, -40, 9, 2, '#E8D49A'); X(16, -42, 5, 2, '#C9B070');
    } else {
      X(14, -36, 9, 4, INK); X(15, -36, 7, 3, v.hm); X(20, -33, 3, 2, INK);
    }
    if (v.mask) X(17, -31, 6, 3, '#F4F0E6');
    if (v.warn && cr.pig.idle > 0.9) { X(26, -42, 2, 5, '#E0452B'); X(26, -36, 2, 2, '#E0452B'); }
  } else if (K === 'car') {
    O(12, -6, 6); O(44, -6, 6);
    X(0, -15, 56, 10, INK); X(1, -14, 54, 8, v.body); X(1, -14, 54, 2, 'rgba(255,255,255,.25)');
    X(12, -25, 30, 11, INK); X(13, -24, 28, 10, v.body);
    X(15, -23, 11, 7, '#7EC8E8'); X(28, -23, 11, 7, '#7EC8E8'); X(26, -23, 2, 9, INK);
    // Phản sáng kính chắn gió chéo 1px 16-bit
    X(16, -22, 2, 1, '#FFFBF1'); X(17, -21, 2, 1, '#FFFBF1'); X(18, -20, 2, 1, '#FFFBF1');
    X(29, -22, 2, 1, '#FFFBF1'); X(30, -21, 2, 1, '#FFFBF1'); X(31, -20, 2, 1, '#FFFBF1');
    X(54, -12, 2, 3, '#FFE08A'); X(56, -12, 2, 2, 'rgba(255,224,138,.45)');
    X(0, -12, 2, 3, '#E0452B'); X(1, -8, 54, 2, 'rgba(0,0,0,.25)');
    if (v.body === '#2F8F83' || v.body === '#F4B93B') { X(22, -28, 12, 3, INK); X(23, -27, 10, 1, '#FFE08A'); }
  } else if (K === 'truck') {
    // Xe tải thùng hàng 16-bit (Cabin + thùng tôn sọc nổi + bánh mâm lớn + bóng bám nhựa)
    O(14, -6, 6); O(54, -6, 6);
    // Thùng hàng tôn sọc
    X(0, -30, 44, 22, INK); X(1, -29, 42, 20, '#F3EEDD'); X(1, -29, 42, 3, '#FFFBF1');
    for (let rx = 5; rx < 40; rx += 5) X(rx, -26, 1, 15, '#CFC6B6');
    X(1, -11, 42, 2, '#B9B0A0');
    // Cabin xe tải
    X(44, -24, 26, 16, INK); X(45, -23, 24, 14, v.body === '#2B2B3A' ? '#4B6FA5' : v.body);
    X(54, -22, 12, 8, INK); X(55, -21, 10, 6, '#7EC8E8');
    X(56, -20, 2, 1, '#FFFBF1'); X(57, -19, 2, 1, '#FFFBF1'); X(58, -18, 2, 1, '#FFFBF1');
    X(68, -13, 2, 3, '#FFE08A'); X(0, -12, 2, 3, '#E0452B');
    X(1, -9, 68, 2, 'rgba(0,0,0,.25)');
  } else {
    // Xe buýt xanh TP.HCM 16-bit có kính phản sáng & biển số tuyến vàng
    O(16, -6, 6); O(66, -6, 6);
    X(0, -29, 84, 24, INK); X(1, -28, 82, 22, '#E9F2EA'); X(1, -14, 82, 8, '#2F8F83');
    for (let i = 0; i < 7; i++) {
      X(5 + i * 11, -26, 8, 8, '#6DA9D9');
      X(6 + i * 11, -25, 2, 1, '#FFFBF1');
      X(7 + i * 11, -24, 2, 1, '#FFFBF1');
    }
    X(76, -26, 5, 3, '#F4B93B'); // Biển số tuyến
    X(80, -12, 4, 3, '#FFE08A'); X(0, -12, 2, 3, '#E0452B'); X(1, -7, 82, 2, 'rgba(0,0,0,.25)');
  }
}

function crPigDraw(c) {
  const p = cr.pig;
  if (cr.inv > 0 && ((cr.t * 14) | 0) % 2) return;
  const s = crScale(p.y), k = Math.max(0.8, s * 1.1), cx = Math.round(p.x), cy = Math.round(p.y);
  const f = p.f || 1, mv = p.mv > 0, st = mv ? Math.floor(p.step) % 2 : 0, bob = mv && st ? -1 : 0;
  const Q = (dx, dy, w, h, col) => R(c, cx + Math.round((f > 0 ? dx : -dx - w) * k), cy + Math.round((dy + 0) * k), Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k)), col);
  const B = (dx, dy, w, h, col) => Q(dx, dy + bob, w, h, col);

  for (let a = 0; a < 28; a++) {
    const ax = Math.cos(a / 28 * 6.283) * 13 * k, ay = Math.sin(a / 28 * 6.283) * 4.5 * k;
    R(c, Math.round(cx + ax), Math.round(cy + ay - 1), 1, 1, 'rgba(255,251,241,.85)');
  }
  c.fillStyle = 'rgba(0,0,0,.25)';
  c.fillRect(cx - Math.round(10 * k), cy - 1, Math.round(20 * k), Math.max(2, Math.round(3 * k)));

  const leg = (x, y, w, h, lift, far) => {
    const yy = y - (lift ? 2 : 0);
    Q(x, yy, w + 2, h + 1, INK); Q(x + 1, yy, w, h - 1, far ? '#EE90A6' : '#F9B8C4'); Q(x, yy + h, w + 2, 1, '#5A3A22');
  };

  leg(-4, -8, 3, 5, mv && st, 1);
  if (cr.hand > 0) {
    Q(5, -30, 5, 13, INK); Q(6, -29, 3, 11, '#F9B8C4'); Q(5, -31, 5, 2, '#5A3A22');
  } else {
    leg(3, -9, 3, 5, mv && !st, 1);
  }

  B(-8, -18, 16, 14, INK); B(-7, -17, 14, 12, '#F9B8C4'); B(-7, -17, 14, 7, '#D8402F');
  B(4, -17, 3, 7, '#B83325'); B(-5, -16, 2, 5, '#E8604A'); B(-3, -10, 8, 1, '#B83325');
  B(4, -9, 3, 4, '#F0A0B0'); B(0, -9, 2, 1, '#E080A0'); B(2, -10, 1, 2, '#E080A0');
  B(0, -12, 2, 1, '#E080A0'); B(-1, -11, 1, 1, '#E080A0');

  leg(-7, -6, 4, 6, mv && !st, 0); leg(2, -6, 4, 6, mv && st, 0);

  B(-6, -25, 12, 9, INK); B(-5, -24, 10, 7, '#F9B8C4');
  B(-8, -27, 4, 5, INK); B(-7, -26, 2, 3, '#EE90A6');
  B(5, -28, 4, 5, INK); B(6, -27, 2, 3, '#EE90A6');
  B(6, -22, 5, 5, INK); B(7, -21, 3, 3, '#EE90A6'); B(8, -20, 1, 1, INK);

  const rows = [
    [24, 0, '#E8D49A'], [20, 2, '#D9C27E'], [16, 4, '#E8D49A'], [12, 6, '#D9C27E'],
    [8, 8, '#E8D49A'], [5, 10, '#D9C27E'], [2, 12, '#E8D49A']
  ];
  rows.forEach(r => { const w = r[0], y = -24 - r[1] - 1; B(-(w >> 1) - 1 + 1, y, w + 2, 2, INK); });
  rows.forEach(r => { const w = r[0], y = -24 - r[1] - 1; B(-(w >> 1) + 1, y + 1, w, 1, r[2]); B(-(w >> 1) + 1, y, w, 1, r[2]); });
  B(-9, -23, 18, 1, '#C9B070'); B(-5, -29, 10, 1, '#C9B070'); B(-3, -33, 6, 1, '#C9B070');
  B(11, -24, 1, 6, '#D8402F'); B(-11, -24, 1, 6, '#D8402F');

  if (cr.hand > 0) {
    R(c, cx + Math.round((f > 0 ? 9 : -9) * k), cy + Math.round(-36 * k), 1, 1, '#FFE08A');
    R(c, cx + Math.round((f > 0 ? -12 : 12) * k), cy + Math.round(-34 * k), 1, 1, '#FFE08A');
  }
}

function crDraw() {
  const c = cr.c;
  if (!c || !cr.bg[cr.lv]) return;
  c.drawImage(cr.bg[cr.lv], 0, 0);

  cr.coins.forEach(k => {
    if (!k.got) {
      const b = Math.round(Math.sin(cr.t * 4 + k.x) * 1), sc = crScale(k.y), r = Math.max(2, Math.round(3.5 * sc));
      E(c, k.x, k.y + b, r, r, INK); E(c, k.x, k.y + b, r - 1, r - 1, '#F4B93B'); R(c, k.x, k.y + b - 1, 1, 2, '#FFF6CF');
    }
  });

  const items = cr.veh.map(v => ({ y: v.y, f: () => crVeh(c, v) }));
  items.push({ y: cr.pig.y, f: () => crPigDraw(c) });
  items.sort((a, b) => a.y - b.y).forEach(i => i.f());
}

function crFrame(now) {
  const dt = Math.min(0.05, (now - cr.last) / 1000);
  cr.last = now;
  if (cr.st === 'play') crStep(dt); else cr.t += dt;
  crDraw();
  requestAnimationFrame(crFrame);
}

function crHand() {
  if (cr.st !== 'play' || cr.handN <= 0 || cr.hand > 0) return;
  cr.hand = 1.6;
  cr.handN--;
  post({ type: 'HAPTIC_LIGHT' });
  crHud();
  cr.veh.forEach(v => { v.warn = false; });
}

// Khởi động
const cv = $('crCv');
cr.c = cv.getContext('2d');
cr.c.imageSmoothingEnabled = false;
crNew(0);
cr.last = performance.now();
requestAnimationFrame(crFrame);

// Switch game listeners (guarded vì đã hợp nhất lên 1-Row 16-bit RN TopBar — Chỉ 2 game dọc 9:16)
const swFlyEl = $('swFly'); if (swFlyEl) swFlyEl.addEventListener('click', () => post({ type: 'SWITCH_GAME', game: 'fly' }));

// Đổi vé bằng cám
function doBuyTicket() {
  post({ type: 'BUY_TICKET' });
  G_TIX += 1;
  crToast('+1 vé chơi!');
  crHud();
  crOver();
}

// Modal actions & hand button
document.addEventListener('click', e => {
  const b = e.target.closest('[data-cr]');
  if (b) {
    const a = b.dataset.cr;
    if (a === 'start') crStart();
    else if (a === 'buy') doBuyTicket();
    else if (a === 'again') { crNew(cr.lv); crStart(); }
    else if (a === 'next') { crNew(Math.min(3, cr.lv + 1)); crStart(); }
    else if (a === 'home') post({ type: 'GO_HOME' });
    return;
  }
  if (e.target.closest('#crGbuy')) doBuyTicket();
});

const handBtn = $('crHand');
if (handBtn) {
  handBtn.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); crHand(); });
  handBtn.addEventListener('touchstart', e => { e.stopPropagation(); if (e.cancelable) e.preventDefault(); crHand(); }, { passive: false });
}

// Điều khiển Chạm & Vuốt trực tiếp trên màn hình chuẩn Crossy Road iOS/Samsung (Quyết định 171)
// Chạm / giữ bất kỳ đâu trên màn hình -> Tiến thẳng (u); Vuốt Trái/Phải/Xuống -> Né ngang/Lùi (l/r/d)
let touchDown = false, startX = 0, startY = 0;
function onScreenStart(x, y) {
  touchDown = true;
  startX = x;
  startY = y;
  cr.hold = { u: true };
  const hint = $('crHint'); if (hint) hint.style.display = 'none';
  post({ type: 'HAPTIC_LIGHT' });
  if (cr.st === 'ready') crStart();
}
function onScreenMove(x, y) {
  if (!touchDown) return;
  const dx = x - startX, dy = y - startY;
  if (Math.abs(dx) > 18 || Math.abs(dy) > 18) {
    if (Math.abs(dx) > Math.abs(dy)) {
      cr.hold = dx > 0 ? { r: true } : { l: true };
    } else {
      cr.hold = dy > 0 ? { d: true } : { u: true };
    }
  }
}
function onScreenEnd() {
  touchDown = false;
  cr.hold = {};
}

cv.addEventListener('pointerdown', e => {
  if (e.target.closest('button')) return;
  e.preventDefault();
  onScreenStart(e.clientX, e.clientY);
});
cv.addEventListener('pointermove', e => {
  if (!touchDown) return;
  e.preventDefault();
  onScreenMove(e.clientX, e.clientY);
});
cv.addEventListener('touchstart', e => {
  if (e.target.closest('button')) return;
  if (e.cancelable) e.preventDefault();
  const t = e.touches && e.touches[0];
  if (t) onScreenStart(t.clientX, t.clientY);
}, { passive: false });
cv.addEventListener('touchmove', e => {
  if (!touchDown) return;
  if (e.cancelable) e.preventDefault();
  const t = e.touches && e.touches[0];
  if (t) onScreenMove(t.clientX, t.clientY);
}, { passive: false });

window.addEventListener('pointerup', onScreenEnd);
window.addEventListener('pointercancel', onScreenEnd);
window.addEventListener('touchend', onScreenEnd);
window.addEventListener('touchcancel', onScreenEnd);

})();
</script>

</body>
</html>
`, []);

  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  return (
    <View style={styles.container}>
      {/* 16-bit Warm Stone & Brass Beveled TopBar — Chỉ 2 game dọc 9:16 + 16×16 Pixel Icons (Quyết định 172) */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.bevelBtn}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Quay lại"
        >
          <PixelIconBack size={18} />
        </TouchableOpacity>

        <View style={styles.switchPill}>
          <TouchableOpacity
            style={styles.switchItem}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSwitchGame?.('fly');
            }}
            activeOpacity={0.75}
            accessibilityLabel="Heo bay"
          >
            <PixelIconWing size={18} />
          </TouchableOpacity>
          <View style={[styles.switchItem, styles.switchItemActive]}>
            <PixelIconTraffic size={18} />
          </View>
        </View>

        <View style={styles.rightControls}>
          <TouchableOpacity
            style={styles.ticketChip}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onBuyTicket?.();
            }}
            activeOpacity={0.8}
            accessibilityLabel="Đổi vé chơi"
          >
            <PixelIconTicket size={16} />
            <Text style={styles.ticketText}>{tickets}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bevelBtn}
            onPress={handleReload}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Tải lại"
          >
            <PixelIconReload size={16} />
          </TouchableOpacity>
        </View>
      </View>

      {/* SafeWebView Container */}
      <View style={styles.webViewContainer}>
        <SafeWebView
          ref={webViewRef}
          source={memoizedSource}
          style={styles.webView}
          containerStyle={styles.webView}
          scrollEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          onMessage={handleMessage}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#D9C9A4',
    borderTopWidth: 2,
    borderTopColor: '#FFFBF1',
    borderBottomWidth: 3,
    borderBottomColor: '#2B2118',
  },
  bevelBtn: {
    width: 34,
    height: 34,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderTopColor: '#FFFBF1',
    borderLeftColor: '#FFFBF1',
    borderBottomColor: '#85735E',
    borderRightColor: '#85735E',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  switchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#85735E',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 4,
    padding: 2,
    gap: 2,
  },
  switchItem: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 2,
    backgroundColor: '#F6EEDC',
  },
  switchItemActive: {
    backgroundColor: '#F4B93B',
    borderWidth: 1,
    borderColor: '#2B2118',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  ticketText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 13,
    color: '#2B2118',
  },
  webViewContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F6EEDC',
  },
});
