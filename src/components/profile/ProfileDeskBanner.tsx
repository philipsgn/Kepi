import React, { useMemo } from 'react';
import {
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { useBudgetStore } from '../../store/budgetStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { useTransactionStore } from '../../store/transactionStore';
import { formatVND } from '../../utils/currency';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface ProfileDeskBannerProps {
  onScrollToSection?: (section: string) => void;
}

/**
 * Banner Pixel Art "Góc làm việc của heo" (176×80)
 * Nâng cấp chuẩn 1:1 theo prototype/Ví Heo Con 21_11.html (dòng 2684–2782) & Quyết định 155:
 * - Chú heo chuẩn Pixel-Art-Mascot 24×20 (drawPigSprite: chớp mắt, vẫy đuôi, nhảy cẫng)
 * - Cửa sổ ngắm danh thắng Việt Nam: Tòa nhà Bitexco (sân đỗ trực thăng tầng 52, đèn beacon)
 * - Tự động đổi cảnh Ngày / Hoàng hôn / Đêm theo giờ thực tế
 * - 6 Hotspots tương tác có bong bóng thoại 3s & xúc giác Haptics
 */
export const ProfileDeskBanner: React.FC<ProfileDeskBannerProps> = ({
  onScrollToSection,
}) => {
  const { mode } = useTheme();
  const isPink = mode === 'pink';
  const { todayBudget, todaySpent } = useBudgetStore();
  const { streakDays } = useGamificationStore();
  const { transactions } = useTransactionStore();

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'HAPTIC_LIGHT') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (data.type === 'SCROLL_TO_CATS') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onScrollToSection?.('cats');
      }
    } catch (e) {
      // Ignored
    }
  };

  const todayNum = new Date().getDate();
  const savedCount = transactions.length;
  const streakVal = streakDays || 1;

  const htmlContent = useMemo(() => `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<style>
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: ${isPink ? '#FFF5F7' : '#F9E6C9'};
  display: flex;
  align-items: center;
  justify-content: center;
}
#meCv {
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
  image-rendering: -webkit-crisp-edges;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  touch-action: manipulation;
  cursor: pointer;
}
.flytoast {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  background: #2B2118;
  color: #FFFBF1;
  border-radius: 14px;
  padding: 5px 12px;
  font: 800 11px/1.3 system-ui, -apple-system, sans-serif;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 10;
  white-space: nowrap;
  max-width: 90%;
  text-overflow: ellipsis;
  overflow: hidden;
  box-shadow: 0 3px 0 rgba(0,0,0,0.25);
}
.flytoast.on {
  opacity: 1;
  transform: translateX(-50%) translateY(2px);
}
</style>
<script>
window.onerror = function (msg, src, line, col) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CONSOLE_ERROR', error: msg, line: line }));
  }
  return false;
};
</script>
</head>
<body>
<canvas id="meCv" width="176" height="80" role="img" aria-label="Góc làm việc của heo: cửa sổ ngắm tòa nhà Bitexco, lịch nhảy ngày thực tế, heo 24x20 chớp mắt vẫy đuôi"></canvas>
<div class="flytoast bubbleToast bubbleText" id="meBub" role="status" aria-live="polite"></div>

<script>
(function(){
'use strict';

function notify(type, payload) {
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
  }
}

var INK = '#2B2118';
var PAL = {
  o: '#4B2B21', p: '#F9B8C4', s: '#EE90A6', n: '#F08DA4',
  h: '#FFE3E8', k: '#2B2118', g: '#F4B93B', G: '#B97A14', w: '#FFFFFF'
};

var DIG = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111',
  '3': '111001111001111', '4': '101101111001001', '5': '111100111001111',
  '6': '111100111101111', '7': '111001001001001', '8': '111101111101111',
  '9': '111101111001111'
};

function R(c, x, y, w, h, col) {
  c.fillStyle = col;
  c.fillRect(x, y, w, h);
}

function E(c, cx, cy, rx, ry, col) {
  c.fillStyle = col;
  for (var y = -ry; y <= ry; y++) {
    for (var x = -rx; x <= rx; x++) {
      if (x * x / (rx * rx) + y * y / (ry * ry) <= 1) {
        c.fillRect(cx + x, cy + y, 1, 1);
      }
    }
  }
}

function shape(c, rows, fill, ox, oy, outline) {
  if (outline === undefined) outline = true;
  if (outline) {
    c.fillStyle = PAL.o;
    var deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (var d = 0; d < deltas.length; d++) {
      var ax = deltas[d][0], ay = deltas[d][1];
      for (var r = 0; r < rows.length; r++) {
        var row = rows[r];
        c.fillRect(ox + row[1] + ax, oy + row[0] + ay, row[2] - row[1] + 1, 1);
      }
    }
  }
  c.fillStyle = fill;
  for (var r2 = 0; r2 < rows.length; r2++) {
    var row2 = rows[r2];
    c.fillRect(ox + row2[1], oy + row2[0], row2[2] - row2[1] + 1, 1);
  }
}

function stamp(c, str, sx, sy, col) {
  for (var k = 0; k < str.length; k++) {
    var p = DIG[str[k]];
    if (!p) continue;
    c.fillStyle = col;
    for (var i = 0; i < 15; i++) {
      if (p[i] === '1') {
        c.fillRect(sx + k * 4 + (i % 3), sy + Math.floor(i / 3), 1, 1);
      }
    }
  }
}

/**
 * Vẽ chú heo 24×20 sprite 1:1 từ prototype
 */
function drawPigSprite(c, o) {
  var ox = 1, oy = 3;
  var bob = 0;
  var bodyDy = bob, headDy = bob, headDx = 0;

  var legs = [[3, PAL.p], [9, PAL.p], [6, PAL.s], [12, PAL.s]];
  for (var i = 0; i < 4; i++) {
    var x = legs[i][0];
    var rows = [[11, x, x + 1], [12, x, x + 1], [13, x, x + 1], [14, x, x + 1]];
    shape(c, rows, legs[i][1], ox, oy);
  }

  shape(c, [[4, 0, 1], [5, 0, 0], [6, 0, 1]], PAL.p, ox, oy + bodyDy + (o.tail ? 1 : 0));
  shape(c, [[4, 4, 12], [5, 3, 13], [6, 2, 14], [7, 2, 14], [8, 2, 14], [9, 2, 14], [10, 2, 14], [11, 3, 13]], PAL.p, ox, oy + bodyDy);
  R(c, ox + 5, oy + bodyDy + 5, 3, 1, PAL.h);

  var hx = ox + headDx, hy = oy + headDy;
  var hp = function(x, y, col) { R(c, hx + x, hy + y, 1, 1, col); };

  shape(c, [[6, 20, 21], [7, 20, 21], [8, 20, 21]], PAL.n, hx, hy);
  shape(c, [[3, 14, 18], [4, 13, 19], [5, 13, 19], [6, 13, 19], [7, 13, 19], [8, 13, 19], [9, 14, 18]], PAL.p, hx, hy);
  shape(c, [[1, 15, 16], [2, 14, 17]], PAL.p, hx, hy);
  R(c, hx + 14, hy + 3, 5, 1, PAL.p);
  hp(16, 2, PAL.s);
  R(c, hx + 14, hy + 4, 2, 1, PAL.h);
  hp(21, 6, PAL.k);
  hp(21, 8, PAL.k);

  if (o.happy) {
    hp(16, 6, PAL.k); hp(17, 5, PAL.k); hp(18, 6, PAL.k);
  } else if (o.blink) {
    hp(16, 6, PAL.k); hp(17, 6, PAL.k);
  } else {
    R(c, hx + 16, hy + 5, 2, 2, PAL.k);
    hp(16, 5, PAL.w);
  }
  hp(17, 8, PAL.s); hp(18, 8, PAL.s);
  R(c, ox + 11, oy + bodyDy + 9, 2, 1, PAL.g);
  R(c, ox + 11, oy + bodyDy + 10, 2, 1, PAL.G);
}

// Sparkle pháo hoa khi heo nhảy
var SPARKS = [];
function addSpark(x, y) {
  for (var i = 0; i < 8; i++) {
    var ang = (i / 8) * Math.PI * 2;
    SPARKS.push({
      x: x, y: y,
      vx: Math.cos(ang) * 28,
      vy: Math.sin(ang) * 28,
      life: 0.5,
      col: i % 2 === 0 ? '#F4B93B' : '#FFFBF1'
    });
  }
}

// Dữ liệu ứng dụng từ Props
var APP_DATA = {
  todayBudget: ${todayBudget},
  todaySpent: ${todaySpent},
  streakDays: ${streakVal},
  savedCount: ${savedCount},
  todayStr: '${String(todayNum).padStart(2, '0')}'
};

var MB = {
  W: 176, H: 80,
  t: 0, last: 0,
  bump: 0,
  coin: null, coinT: 3.2,
  squish: 0,
  burst: [],
  drops: [],
  water: 0,
  flame: 0,
  mode: 'auto',
  bubT: 0
};

function mbHour() {
  if (MB.mode === 'day') return 12;
  if (MB.mode === 'night') return 22;
  return new Date().getHours();
}

/**
 * Cửa sổ ngắm Tòa nhà Bitexco (Việt Nam) theo giờ thực tế
 */
function mbSky(c, h) {
  var isDay = (h >= 6 && h < 17);
  var isDusk = (h >= 17 && h < 19) || (h >= 5 && h < 6);

  // Khung viền ngoài cửa sổ
  R(c, 8, 6, 34, 30, INK);

  // Bầu trời
  var skyCol = isDay ? '#BFE6F6' : (isDusk ? '#F8A6B0' : '#2B2A5E');
  R(c, 10, 8, 30, 26, skyCol);

  if (!isDay && !isDusk) {
    // Ban đêm: Sao lấp lánh & trăng
    for (var s = 0; s < 5; s++) {
      if (((Math.floor(MB.t * 2) + s) % 3) < 2) {
        R(c, 12 + (s * 11) % 24, 10 + (s * 7) % 10, 1, 1, '#FFFBF1');
      }
    }
    E(c, 33, 14, 3, 3, '#FFF6CF');
    E(c, 34, 13, 2, 2, skyCol);
  } else {
    // Ban ngày hoặc hoàng hôn: Mặt trời & Mây
    var sx = isDay ? 31 : 29;
    var sy = isDay ? 13 : 16;
    E(c, sx, sy, 3, 3, '#FFE08A');
    E(c, sx, sy, 2, 2, '#FFF6CF');

    // Mây trôi ngang tháp
    var cx = 10 + ((Math.floor(MB.t * 4)) % 40) - 8;
    if (cx > 6 && cx < 36) {
      R(c, Math.max(10, cx), 14, Math.min(8, 38 - cx), 2, isDay ? '#FFFFFF' : '#FFE6EE');
    }
  }

  // ================= TÒA NHÀ BITEXCO (BITEXCO FINANCIAL TOWER) =================
  // Tháp Bitexco dáng búp sen vuốt thon lên cao
  var towerCol = isDay ? '#82B7CE' : (isDusk ? '#9E7287' : '#1A1830');
  var highlightCol = isDay ? '#D4EEF8' : (isDusk ? '#FFD4C2' : '#2B2852');
  var windowGlow = isDay ? '#B2DEF0' : (isDusk ? '#FFA87D' : '#F4B93B');

  // Thân tháp (y từ 32 lên 12)
  // Tầng đế (y: 28..32, x: 23..29)
  R(c, 23, 28, 7, 5, towerCol);
  R(c, 24, 28, 1, 5, highlightCol);

  // Tầng giữa (y: 23..27, x: 24..29)
  R(c, 24, 23, 6, 5, towerCol);
  R(c, 25, 23, 1, 5, highlightCol);

  // Vạch kính phản chiếu
  R(c, 27, 24, 1, 3, windowGlow);
  R(c, 27, 29, 1, 3, windowGlow);

  // BÃI ĐÁP TRỰC THĂNG TẦNG 52 (CANTILEVER HELIPAD ĐẶC TRƯNG)
  // Vươn ngang nhô ra mép trái tại y = 20, 21
  R(c, 19, 20, 6, 2, INK);
  R(c, 19, 20, 5, 1, isDay ? '#D8EDF5' : '#4E7E94');
  // Chân chống bãi đáp vát xuống thân tháp
  R(c, 21, 22, 3, 1, isDay ? '#6894A8' : '#1A1830');
  // Đèn tín hiệu bãi đáp trực thăng
  R(c, 19, 19, 1, 1, isDay ? '#F4B93B' : (Math.floor(MB.t * 3) % 2 === 0 ? '#F4B93B' : '#E0452B'));

  // Tầng trên (y: 16..22, x: 24..28)
  R(c, 24, 16, 5, 7, towerCol);
  R(c, 25, 16, 1, 7, highlightCol);

  // Tầng đỉnh thu nhỏ (y: 12..15, x: 25..27)
  R(c, 25, 12, 3, 4, towerCol);

  // Cột ăng-ten đỉnh & Đèn Beacon hàng không nhấp nháy đỏ
  R(c, 26, 10, 1, 2, INK);
  var beaconRed = (Math.floor(MB.t * 2) % 2 === 0);
  R(c, 26, 9, 1, 1, beaconRed ? '#E0452B' : '#6A1A12');

  // Khung chia ô cửa sổ
  R(c, 24, 8, 2, 26, INK);
  R(c, 10, 20, 30, 2, INK);
}

// Canvas đệm chú heo
var hp = document.createElement('canvas');
hp.width = 24; hp.height = 20;
var hpx = hp.getContext('2d');

function mbSay(text) {
  var b = document.getElementById('meBub');
  b.textContent = text;
  b.classList.add('on');
  clearTimeout(MB.bubT);
  MB.bubT = setTimeout(function(){
    b.classList.remove('on');
  }, 3000);
}

function handleTouchHotspot(k) {
  notify('HAPTIC_LIGHT');
  if (k === 'pig') {
    MB.bump = 0.8;
    addSpark(84, 30);
    var left = APP_DATA.todayBudget - APP_DATA.todaySpent;
    if (left >= 0) {
      mbSay('Hôm nay còn chi được ' + formatMoney(left) + '. Heo vui vẻ!');
    } else {
      mbSay('Hôm nay lố ' + formatMoney(-left) + ', heo hơi lo xíu.');
    }
  } else if (k === 'bank') {
    MB.squish = 0.25;
    for (var i = 0; i < 8; i++) {
      var a = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      MB.burst.push({
        x: 128, y: 44,
        vx: Math.cos(a) * 55,
        vy: Math.sin(a) * 65,
        life: 1.0
      });
    }
    mbSay('Đã tích lũy vào heo đất. Heo đất luôn đồng hành cùng bạn!');
  } else if (k === 'cal') {
    MB.flame = 0.8;
    var s = APP_DATA.streakDays;
    mbSay(s >= 2 ? 'Chuỗi ' + s + ' ngày liền. Giữ lửa mỗi ngày nhé!' : 'Chuỗi 1 ngày. Mai tiếp tục giữ chuỗi!');
  } else if (k === 'plant') {
    MB.water = 1.2;
    for (var w = 0; w < 6; w++) {
      MB.drops.push({
        x: 18 + Math.random() * 10,
        y: 12 + Math.random() * 6,
        vy: 12,
        life: 1.2
      });
    }
    var sg = Math.min(3, Math.floor(APP_DATA.savedCount / 3));
    mbSay(sg >= 3 ? 'Hoa hồng nở rực rỡ! Nhờ bạn ghi chép đều tay.' : 'Cây lớn thêm mỗi 3 món lưu. Đã ghi ' + APP_DATA.savedCount + ' món.');
  } else if (k === 'notes') {
    mbSay('Danh mục thu chi của bạn ở bên dưới.');
    notify('SCROLL_TO_CATS');
  }
}

function formatMoney(n) {
  return String(Math.round(n)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.') + 'đ';
}

function mbStep(dt) {
  MB.t += dt;
  if (MB.bump > 0) MB.bump = Math.max(0, MB.bump - dt);
  if (MB.squish > 0) MB.squish = Math.max(0, MB.squish - dt);
  if (MB.flame > 0) MB.flame = Math.max(0, MB.flame - dt);
  if (MB.water > 0) MB.water = Math.max(0, MB.water - dt);

  // Xu rơi vào heo đất
  MB.coinT -= dt;
  if (MB.coinT <= 0 && !MB.coin) {
    MB.coin = { x: 130, y: -4, vy: 0 };
    MB.coinT = 3.6;
  }
  if (MB.coin) {
    MB.coin.vy += 220 * dt;
    MB.coin.y += MB.coin.vy * dt;
    if (MB.coin.y >= 43) {
      MB.coin = null;
      MB.squish = 0.2;
    }
  }

  // Hạt vàng tung ra
  for (var b = 0; b < MB.burst.length; b++) {
    var bi = MB.burst[b];
    bi.vy += 240 * dt;
    bi.x += bi.vx * dt;
    bi.y += bi.vy * dt;
    bi.life -= dt;
  }
  MB.burst = MB.burst.filter(function(item){ return item.life > 0 && item.y < 58; });

  // Giọt nước tưới cây
  for (var d = 0; d < MB.drops.length; d++) {
    var di = MB.drops[d];
    di.vy += 180 * dt;
    di.y += di.vy * dt;
    di.life -= dt;
  }
  MB.drops = MB.drops.filter(function(item){ return item.life > 0 && item.y < 54; });

  // Pháo hoa sao của heo
  for (var p = 0; p < SPARKS.length; p++) {
    var pi = SPARKS[p];
    pi.x += pi.vx * dt;
    pi.y += pi.vy * dt;
    pi.life -= dt;
  }
  SPARKS = SPARKS.filter(function(item){ return item.life > 0; });
}

function mbDraw() {
  var cv = document.getElementById('meCv');
  if (!cv) return;
  var c = cv.getContext('2d');
  c.imageSmoothingEnabled = false;

  var t = MB.t;
  var d = APP_DATA.todayStr;

  // 1. Tường kem sọc
  R(c, 0, 0, MB.W, MB.H, '#F9E6C9');
  for (var x = 0; x < MB.W; x += 8) {
    R(c, x, 0, 1, 56, 'rgba(160,110,60,.10)');
  }

  // 2. Cửa sổ nhìn ra tháp Bitexco
  mbSky(c, mbHour());

  // 3. Giấy dán ghi chú trên tường
  var noteY = 8 + Math.round(Math.sin(t * 1.6) * 1);
  R(c, 58, noteY, 16, 14, INK);
  R(c, 59, noteY + 1, 14, 12, '#FFE8D6');
  R(c, 64, noteY - 2, 4, 3, '#FFFBF1');
  R(c, 61, noteY + 4, 10, 1, INK);
  R(c, 61, noteY + 7, 8, 1, INK);
  R(c, 61, noteY + 10, 5, 1, INK);

  // 4. Tờ lịch xé hiển thị đúng ngày thực tế
  R(c, 130, 6, 30, 32, INK);
  R(c, 132, 8, 26, 28, '#FFFBF1');
  R(c, 132, 8, 26, 7, '#E0452B');
  R(c, 136, 4, 2, 6, INK);
  R(c, 152, 4, 2, 6, INK);
  stamp(c, d, 138, 19, INK);
  stamp(c, d, 139, 19, INK);

  // Ngọn lửa chuỗi ngày trên lịch
  var st = Math.min(7, Math.max(1, APP_DATA.streakDays));
  var fl = Math.round(Math.sin(t * 9) * 1);
  var big = MB.flame > 0 ? 3 : 0;
  R(c, 143, 26 - big, 8, 9 + big, INK);
  R(c, 144, 27 - big, 6, 8 + big, '#E0452B');
  R(c, 145, 29 - big + fl, 4, 6 + big, '#F4B93B');
  R(c, 146, 31, 2, 4, '#FFF6CF');

  // 5. Bàn làm việc & Sàn gỗ
  R(c, 0, 54, MB.W, 4, '#B8805A');
  R(c, 0, 54, MB.W, 1, INK);
  R(c, 4, 58, 168, 4, INK);
  R(c, 5, 59, 166, 2, '#B8805A');
  R(c, 6, 62, 164, 18, INK);
  R(c, 7, 63, 162, 17, '#8A5A34');
  R(c, 58, 63, 1, 17, INK);
  R(c, 118, 63, 1, 17, INK);
  // Tay nắm ngăn kéo
  [[28], [88], [144]].forEach(function(h){
    R(c, h[0] - 4, 69, 8, 3, INK);
    R(c, h[0] - 3, 70, 6, 1, '#F4B93B');
  });

  // 6. Chậu cây hoa hồng lớn theo số món đã lưu
  R(c, 16, 50, 12, 8, INK);
  R(c, 17, 51, 10, 7, '#C4603A');
  var sg = Math.min(3, Math.floor(APP_DATA.savedCount / 3));
  var sw = Math.round(Math.sin(t * 1.5 + MB.water * 6) * 1);
  var gy = 50, hh = 5 + sg * 4 + (MB.water > 0 ? 2 : 0);
  R(c, 21, gy - hh, 2, hh, '#3E7A3A');
  E(c, 18 + sw, gy - hh + 2, 4, 2, '#5E9A57');
  E(c, 26 + sw, gy - hh, 4, 2, '#78B65C');
  if (sg >= 1) E(c, 22 + sw, gy - hh - 2, 3, 3, '#5E9A57');
  if (sg >= 3) {
    R(c, 20 + sw, gy - hh - 6, 5, 5, INK);
    R(c, 21 + sw, gy - hh - 5, 3, 3, '#E0452B');
  }

  // Giọt nước tưới cây
  MB.drops.forEach(function(di){
    R(c, Math.round(di.x), Math.round(di.y), 1, 2, '#6DA9D9');
  });

  // Ly nước nóng có khói
  R(c, 48, 50, 8, 8, INK);
  R(c, 49, 51, 6, 6, '#FFFBF1');
  R(c, 56, 52, 2, 4, INK);
  for (var k = 0; k < 2; k++) {
    var sy = 48 - ((Math.floor(t * 8) + k * 6) % 10);
    R(c, 51 + k * 2 + Math.round(Math.sin(t * 3 + k)), sy, 1, 2, 'rgba(255,255,255,.8)');
  }

  // 7. Chú heo con đứng cạnh bàn (Sprite 24×20 phóng 2× = 48×40)
  var bo = (MB.bump > 0);
  var jy = bo ? -Math.abs(Math.sin(MB.bump * 14)) * 6 : 0;
  hpx.clearRect(0, 0, 24, 20);
  drawPigSprite(hpx, {
    pose: 'stand',
    frame: (Math.floor(t * 2)) % 2,
    mood: 'ok',
    happy: bo || (APP_DATA.savedCount > 0 && (t % 6) < 1.2),
    blink: (t % 4) < 0.15,
    tail: (Math.floor(t * 3) % 2 === 0)
  });
  c.drawImage(hp, 0, 0, 24, 20, 62, Math.round(19 + jy), 48, 40);

  // Pháo hoa sao của chú heo
  SPARKS.forEach(function(sp){
    R(c, Math.round(sp.x), Math.round(sp.y), 2, 2, sp.col);
  });

  // 8. Heo đất & Xu rơi (Đặt vững vàng trên mặt bàn gỗ y=54, đáy heo y=48+6=54)
  var sq = MB.squish > 0 ? 1 : 0;
  // Vẽ Heo đất mini vững trên mặt bàn
  E(c, 126, 48 + sq, 8, 6, INK);
  E(c, 126, 48 + sq, 7, 5, '#F9B8C4');
  R(c, 123, 43 + sq, 6, 2, INK);
  R(c, 121, 48 + sq, 10, 3, '#F4B93B');
  R(c, 131, 47 + sq, 3, 3, INK);
  R(c, 132, 48 + sq, 1.5, 1.5, '#EE90A6');

  // Xu rơi
  if (MB.coin) {
    E(c, MB.coin.x, MB.coin.y, 3, 3, INK);
    E(c, MB.coin.x, MB.coin.y, 2, 2, '#F4B93B');
  }

  // Hạt vàng tung ra từ heo đất
  MB.burst.forEach(function(bi){
    E(c, Math.round(bi.x), Math.round(bi.y), 2, 2, INK);
    R(c, Math.round(bi.x) - 1, Math.round(bi.y) - 1, 2, 2, '#F4B93B');
  });
}

function loop(now) {
  var dt = Math.min(0.05, (now - MB.last) / 1000);
  MB.last = now;
  mbStep(dt);
  mbDraw();
  requestAnimationFrame(loop);
}

// Bắt sự kiện chạm trực tiếp trên canvas tương ứng 6 hotspots tương tác (Đa kênh pointerdown, touchstart, click)
var cv = document.getElementById('meCv');
var lastTapTime = 0;

function handleInteraction(e) {
  var now = performance.now();
  if (now - lastTapTime < 200) return;
  lastTapTime = now;

  var clientX, clientY;
  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  if (clientX === undefined || clientY === undefined) return;
  if (e.type === 'touchstart' && e.cancelable) {
    e.preventDefault();
  }

  var rect = cv.getBoundingClientRect();
  var scaleX = MB.W / rect.width;
  var scaleY = MB.H / rect.height;
  var px = (clientX - rect.left) * scaleX;
  var py = (clientY - rect.top) * scaleY;

  // 1. Chú Heo: x = 58..110, y = 16..58
  if (px >= 58 && px <= 110 && py >= 16 && py <= 58) {
    handleTouchHotspot('pig');
  }
  // 2. Heo đất (trên bàn): x = 112..146, y = 36..58
  else if (px >= 112 && px <= 146 && py >= 36 && py <= 58) {
    handleTouchHotspot('bank');
  }
  // 3. Lịch xé: x = 126..162, y = 4..38
  else if (px >= 126 && px <= 162 && py >= 4 && py <= 38) {
    handleTouchHotspot('cal');
  }
  // 4. Cây hoa: x = 10..36, y = 36..64
  else if (px >= 10 && px <= 36 && py >= 36 && py <= 64) {
    handleTouchHotspot('plant');
  }
  // 5. Giấy dán: x = 54..78, y = 4..24
  else if (px >= 54 && px <= 78 && py >= 4 && py <= 24) {
    handleTouchHotspot('notes');
  }
}

cv.addEventListener('pointerdown', handleInteraction);
cv.addEventListener('touchstart', handleInteraction, { passive: false });
cv.addEventListener('click', handleInteraction);

MB.last = performance.now();
requestAnimationFrame(loop);

})();
</script>
</body>
</html>`, [todayBudget, todaySpent, streakVal, savedCount, todayNum]);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: isPink ? '#3B0713' : '#2B2118',
          shadowColor: isPink ? '#3B0713' : '#2B2118',
          backgroundColor: isPink ? '#FFF5F7' : '#F9E6C9',
        },
      ]}
    >
      {Platform.OS === 'web' ? (
        <iframe
          srcDoc={htmlContent}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: isPink ? '#FFF5F7' : '#F9E6C9',
          } as any}
        />
      ) : (
        <SafeWebView
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          containerStyle={[styles.webContainer, { backgroundColor: isPink ? '#FFF5F7' : '#F9E6C9' }]}
          style={[styles.webView, { backgroundColor: isPink ? '#FFF5F7' : '#F9E6C9' }]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 176 / 80,
    backgroundColor: '#F9E6C9',
    borderColor: '#2B2118',
    borderWidth: 3,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 14,
  },
  webContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F9E6C9',
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F9E6C9',
  },
});
