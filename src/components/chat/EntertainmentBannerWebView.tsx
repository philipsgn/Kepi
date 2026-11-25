import React, { useMemo, useRef } from 'react';
import {
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface EntertainmentBannerWebViewProps {
  onPressBanner?: () => void;
}

export const EntertainmentBannerWebView: React.FC<EntertainmentBannerWebViewProps> = ({
  onPressBanner,
}) => {
  const { tokens } = useTheme();
  const webViewRef = useRef<any>(null);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'HAPTIC_LIGHT') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPressBanner?.();
      }
    } catch (e) {
      // Ignored
    }
  };

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
  background: #2B2118;
  display: flex;
  align-items: center;
  justify-content: center;
}
#funCv {
  width: 100%;
  height: 100%;
  display: block;
  image-rendering: pixelated;
  image-rendering: -webkit-crisp-edges;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  cursor: pointer;
  touch-action: manipulation;
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
<canvas id="funCv" width="192" height="88" role="img" aria-label="Banner Sài Gòn Hoàng Hôn: Chợ Bến Thành, Nhà thờ Đức Bà, Bitexco, Landmark 81, máy bay Vietnam Airlines và chú heo lái xe máy trên phố"></canvas>

<script>
(function(){
'use strict';

function notify(type, payload) {
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, payload: payload }));
  }
}

function mulberry32(a){
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

var INK = '#2B2118';
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

function mk(w, h, fn) {
  var c = document.createElement('canvas');
  c.width = w; c.height = h;
  var x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  fn(x);
  return c;
}

var FBAND = [
  [0, '#6B5FC0'],
  [8, '#8F76CC'],
  [16, '#B685CB'],
  [24, '#E391BF'],
  [32, '#F8A6B0'],
  [40, '#FFC096'],
  [48, '#FFDA9C'],
  [56, '#FFEBB8']
];

function bcol(y) {
  for (var i = FBAND.length - 1; i >= 0; i--) {
    if (y >= FBAND[i][0]) return FBAND[i][1];
  }
  return FBAND[0][1];
}

var FB = {
  w: 192,
  h: 88,
  c: null,
  x: null,
  bg: null,
  t: 0,
  last: 0,
  dt: 0,
  run: false,
  spk: [],
  tapN: 0
};

var FBS = { mode: 'ride', x: -40, mt: 0, hop: 0 };

function fbSky(x) {
  for (var i = 0; i < FBAND.length; i++) {
    var y0 = FBAND[i][0];
    var y1 = i + 1 < FBAND.length ? FBAND[i + 1][0] : 68;
    R(x, 0, y0, FB.w, y1 - y0, FBAND[i][1]);
    if (i + 1 < FBAND.length) {
      for (var px = 0; px < FB.w; px += 2) {
        R(x, px + 1, y1 - 1, 1, 1, FBAND[i + 1][1]);
        R(x, px, y1, 1, 1, FBAND[i + 1][1]);
      }
    }
  }
}

function fbStatic() {
  FB.bg = mk(FB.w, FB.h, function(x) {
    fbSky(x);

    /* Mặt trời anime có vạch cắt */
    E(x, 118, 44, 17, 17, '#FFE9A8');
    E(x, 118, 44, 14, 14, '#FFF6CF');
    for (var k = 0; k < 5; k++) {
      var y = 44 + 3 + k * 3;
      R(x, 100, y, 38, k + 1, bcol(y));
    }

    /* Núi xa và phố xa */
    var rd = mulberry32(77);
    for (var px = 0; px < FB.w; px++) {
      var h = Math.round(8 + 4 * Math.sin(px / 17) + 3 * Math.sin(px / 6.3));
      R(x, px, 60 - h, 1, h + 8, '#B58FC4');
    }
    for (var px2 = 0; px2 < FB.w; px2++) {
      var h2 = Math.round(6 + 3 * Math.sin(px2 / 11 + 2));
      R(x, px2, 64 - h2, 1, h2 + 6, '#9B78B8');
    }

    var px3 = 0;
    while (px3 < FB.w) {
      var w = 6 + ((rd() * 8) | 0);
      var h3 = 8 + ((rd() * 14) | 0);
      R(x, px3, 66 - h3, w, h3 + 4, '#6E5A9E');
      for (var yy = 66 - h3 + 2; yy < 64; yy += 4) {
        for (var xx = px3 + 1; xx < px3 + w - 1; xx += 3) {
          if (rd() < 0.45) R(x, xx, yy, 1, 2, '#FFE08A');
        }
      }
      if (rd() < 0.4) R(x, px3 + ((w / 2) | 0), 66 - h3 - 3, 1, 3, '#6E5A9E');
      px3 += w + ((rd() * 3) | 0);
    }

    /* Địa danh TP.HCM: Chợ Bến Thành, Nhà thờ Đức Bà, Bitexco, Landmark 81, Dinh Độc Lập */
    var DK = '#4B3F86', BR = '#8A4560', GL = '#6A5FB5', LY = '#FFE08A';

    // 1. Chợ Bến Thành
    R(x, 4, 58, 26, 8, DK); R(x, 8, 56, 18, 2, DK);
    R(x, 13, 46, 8, 12, DK); R(x, 14, 44, 6, 2, DK);
    R(x, 15, 42, 4, 2, DK); R(x, 16, 40, 2, 2, DK);
    R(x, 14, 48, 6, 5, '#FFF6CF'); R(x, 16, 49, 1, 3, DK); R(x, 16, 51, 2, 1, DK);
    R(x, 14, 61, 6, 5, '#2B2A5E');
    for (var xx1 = 6; xx1 < 28; xx1 += 4) {
      if (xx1 < 12 || xx1 > 20) R(x, xx1, 60, 2, 2, LY);
    }

    // 2. Nhà thờ Đức Bà
    R(x, 36, 56, 22, 10, BR); R(x, 37, 54, 20, 2, BR);
    R(x, 38, 40, 5, 16, BR); R(x, 39, 37, 3, 3, BR); R(x, 40, 33, 1, 4, BR); R(x, 39, 34, 3, 1, BR);
    R(x, 51, 40, 5, 16, BR); R(x, 52, 37, 3, 3, BR); R(x, 53, 33, 1, 4, BR); R(x, 52, 34, 3, 1, BR);
    R(x, 44, 50, 6, 4, BR);
    R(x, 45, 59, 4, 4, LY); R(x, 40, 44, 1, 3, LY); R(x, 53, 44, 1, 3, LY);
    R(x, 40, 50, 1, 3, LY); R(x, 53, 50, 1, 3, LY); R(x, 43, 63, 8, 3, '#2B2A5E');

    // 3. Bitexco
    R(x, 66, 34, 9, 32, DK); R(x, 67, 30, 7, 4, DK); R(x, 68, 27, 5, 3, DK);
    R(x, 69, 24, 3, 3, DK); R(x, 70, 21, 1, 3, DK);
    R(x, 74, 38, 9, 2, DK); R(x, 76, 37, 5, 1, LY); R(x, 78, 36, 1, 2, '#FF8A6B');
    for (var yy1 = 36; yy1 < 64; yy1 += 3) R(x, 67, yy1, 7, 1, GL);

    // 4. Landmark 81
    R(x, 88, 40, 9, 26, DK); R(x, 89, 24, 7, 16, DK); R(x, 90, 14, 5, 10, DK);
    R(x, 91, 10, 3, 4, DK); R(x, 92, 4, 1, 6, DK);
    for (var yy2 = 16; yy2 < 64; yy2 += 3) R(x, 91, yy2, 1, 2, GL);
    R(x, 94, 18, 1, 2, GL);
    for (var yy3 = 19; yy3 < 64; yy3 += 4) {
      R(x, 90, yy3, 1, 1, LY); R(x, 94, yy3 + 1, 1, 1, LY);
    }

    // 5. Dinh Độc Lập
    R(x, 102, 58, 32, 8, DK); R(x, 104, 56, 28, 2, DK); R(x, 112, 52, 12, 4, DK);
    R(x, 114, 50, 8, 2, DK); R(x, 118, 43, 1, 7, DK); R(x, 119, 43, 4, 2, '#E0452B');
    for (var xx2 = 104; xx2 < 132; xx2 += 4) R(x, xx2, 59, 1, 7, GL);
    R(x, 116, 61, 4, 5, '#2B2A5E');

    /* Mặt đất */
    R(x, 0, 66, FB.w, 22, '#5E9A57'); R(x, 0, 66, FB.w, 2, '#8CC46F');
    for (var i = 0; i < 60; i++) {
      var gx = (rd() * FB.w) | 0;
      var gy = 69 + ((rd() * 17) | 0);
      R(x, gx, gy, 1, 2, '#3E7A3A');
    }
    R(x, 0, 78, FB.w, 1, '#4C8A47');
    for (var i2 = 0; i2 < 9; i2++) {
      var gx2 = 6 + i2 * 22 + ((rd() * 6) | 0);
      R(x, gx2, 80, 1, 3, '#F4B93B');
      R(x, gx2 - 1, 79, 3, 1, '#F9B8C4');
    }

    /* Đường phố */
    R(x, 0, 73, FB.w, 15, '#4A4658'); R(x, 0, 73, FB.w, 1, '#CFC6B6'); R(x, 0, 74, FB.w, 1, '#2B2118');
    for (var xx3 = 2; xx3 < FB.w; xx3 += 16) R(x, xx3, 80, 8, 1, '#F4E7A8');
    R(x, 0, 85, FB.w, 1, '#3A3648');

    /* Tháp ổ chim */
    var tx = 150;
    R(x, tx, 56, 4, 12, '#2B2118'); R(x, tx + 1, 57, 2, 10, '#C49A6E');
    R(x, tx + 20, 56, 4, 12, '#2B2118'); R(x, tx + 21, 57, 2, 10, '#C49A6E');
    R(x, tx - 2, 52, 28, 5, '#2B2118'); R(x, tx - 1, 53, 26, 3, '#C49A6E');
    R(x, tx + 6, 56, 12, 12, '#2B2118'); R(x, tx + 7, 57, 10, 10, '#8A5A34');
    R(x, tx + 10, 58, 1, 8, '#CFCFD8'); R(x, tx + 13, 58, 1, 8, '#CFCFD8');
  });
}

function fbSpark(x, cx, cy, sz, col) {
  R(x, cx - sz, cy, sz * 2 + 1, 1, col);
  R(x, cx, cy - sz, 1, sz * 2 + 1, col);
}

function fbBird(x, bx, by, t, ph) {
  var fl = ((t * 8 + ph) % 2) < 1 ? 0 : -1;
  R(x, bx, by + fl, 3, 3, '#E0452B');
  R(x, bx + 1, by + fl - 1, 2, 1, '#E0452B');
  R(x, bx + 3, by + fl + 1, 1, 1, '#F4B93B');
  R(x, bx - 1, by + fl + 1, 1, 1, '#B33A2A');
}

const PAL = { o: '#4B2B21', p: '#F9B8C4', s: '#EE90A6', n: '#F08DA4', h: '#FFE3E8', k: '#2B2118', g: '#F4B93B', G: '#B97A14', w: '#FFFFFF' };

function shape(c, rows, fill, ox, oy, outline) {
  if (outline !== false) {
    c.fillStyle = PAL.o;
    var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (var d = 0; d < dirs.length; d++) {
      var ax = dirs[d][0], ay = dirs[d][1];
      for (var i = 0; i < rows.length; i++) {
        c.fillRect(ox + rows[i][1] + ax, oy + rows[i][0] + ay, rows[i][2] - rows[i][1] + 1, 1);
      }
    }
  }
  c.fillStyle = fill;
  for (var j = 0; j < rows.length; j++) {
    c.fillRect(ox + rows[j][1], oy + rows[j][0], rows[j][2] - rows[j][1] + 1, 1);
  }
}

function drawPigSprite(c, o) {
  var ox = 1, oy = 3, sleep = o.pose === 'sleep', eat = o.pose === 'eat', walk = o.pose === 'walk', sad = o.mood === 'sad' && !o.happy;
  var bob = (walk && o.frame === 1) ? -1 : 0;
  var bodyDy = sleep ? 3 : bob, headDy = sleep ? 5 : eat ? 4 : sad ? 1 : bob, headDx = sleep ? -1 : eat ? 1 : 0;
  if (!sleep) {
    var raised = function(i) { return walk && (o.frame === 0 ? (i === 1 || i === 2) : (i === 0 || i === 3)); };
    var legs = [[3, PAL.p], [9, PAL.p], [6, PAL.s], [12, PAL.s]];
    var order = [2, 3, 0, 1];
    for (var k = 0; k < order.length; k++) {
      var idx = order[k], x = legs[idx][0];
      var rows = [[11, x, x + 1], [12, x, x + 1], [13, x, x + 1]];
      if (!raised(idx)) rows.push([14, x, x + 1]);
      shape(c, rows, legs[idx][1], ox, oy);
    }
  }
  shape(c, [[4, 0, 1], [5, 0, 0], [6, 0, 1]], PAL.p, ox, oy + bodyDy + (o.tail ? 1 : 0));
  shape(c, [[4, 4, 12], [5, 3, 13], [6, 2, 14], [7, 2, 14], [8, 2, 14], [9, 2, 14], [10, 2, 14], [11, 3, 13]], PAL.p, ox, oy + bodyDy);
  R(c, ox + 5, oy + bodyDy + 5, 3, 1, PAL.h);
  var hx = ox + headDx, hy = oy + headDy;
  var hp_px = function(x, y, col) { R(c, hx + x, hy + y, 1, 1, col); };
  shape(c, [[6, 20, 21], [7, 20, 21], [8, 20, 21]], PAL.n, hx, hy);
  shape(c, [[3, 14, 18], [4, 13, 19], [5, 13, 19], [6, 13, 19], [7, 13, 19], [8, 13, 19], [9, 14, 18]], PAL.p, hx, hy);
  shape(c, [[1, 15, 16], [2, 14, 17]], PAL.p, hx, hy);
  R(c, hx + 14, hy + 3, 5, 1, PAL.p);
  hp_px(16, 2, PAL.s);
  R(c, hx + 14, hy + 4, 2, 1, PAL.h);
  hp_px(21, 6, PAL.k); hp_px(21, 8, PAL.k);
  if (o.happy) { hp_px(16, 6, PAL.k); hp_px(17, 5, PAL.k); hp_px(18, 6, PAL.k); }
  else if (o.blink || sleep || eat) { hp_px(16, 6, PAL.k); hp_px(17, 6, PAL.k); }
  else { R(c, hx + 16, hy + 5, 2, 2, PAL.k); hp_px(16, 5, PAL.w); }
  if (sad) { hp_px(16, 4, PAL.k); hp_px(17, 3, PAL.k); hp_px(18, 7, '#7EC8F0'); hp_px(18, 8, '#7EC8F0'); }
  else { hp_px(17, 8, PAL.s); hp_px(18, 8, PAL.s); }
  R(c, ox + 11, oy + bodyDy + 9, 2, 1, PAL.g);
  R(c, ox + 11, oy + bodyDy + 10, 2, 1, PAL.G);
}

// Canvas phụ vẽ sprite heo 24x20 chuẩn prototype
var hp = document.createElement('canvas');
hp.width = 24; hp.height = 20;
var hpx = hp.getContext('2d');
hpx.imageSmoothingEnabled = false;

function fbPlane(x, t) {
  var planes = [
    [0, 11, 13, 1],
    [1, 22, 8, -1]
  ];
  planes.forEach(function(p) {
    var span = FB.w + 90, d = p[3];
    var px = d > 0 ? ((t * p[2] + p[0] * 70) % span) - 45 : FB.w + 45 - ((t * p[2] + p[0] * 50) % span);
    var py = p[1];
    for (var i = 0; i < 14; i++) {
      R(x, Math.round(px - d * (10 + i * 1.6)), py + 2, 2, 1, 'rgba(255,251,241,' + (0.6 - i * 0.04) + ')');
    }
    var X = function(dx, dy, w, h, c) { R(x, Math.round(d > 0 ? px + dx : px - dx - w + 1), py + dy, w, h, c); };
    X(0, 0, 17, 5, '#2B2118'); X(1, 1, 15, 3, '#FFFBF1'); X(15, 1, 2, 3, '#FFFBF1'); X(0, 3, 14, 1, '#CFD8E6');
    X(-1, -4, 5, 5, '#2B2118'); X(0, -3, 4, 4, '#0B5F8A'); X(1, -2, 2, 2, '#F4B93B');
    X(6, 4, 6, 3, '#2B2118'); X(7, 4, 4, 2, '#E4ECF5'); X(8, 6, 3, 2, '#2B2118');
    for (var j = 0; j < 5; j++) X(5 + j * 2, 2, 1, 1, '#6DA9D9');
    X(15, 2, 1, 1, '#2B2118');
  });
}

function fbRider(x, bx, by, t, pig, dir, hat) {
  var d = dir === -1 ? -1 : 1;
  x.save();
  if (d === -1) {
    x.translate(bx + 15, 0);
    x.scale(-1, 1);
    x.translate(-(bx + 15), 0);
  }
  var sp = Math.round(t * 14) % 2;
  var w = function(cx) {
    E(x, cx, by, 4, 4, '#2B2118');
    E(x, cx, by, 3, 3, '#6B6878');
    R(x, cx, by, 1, 1, '#CFCFD8');
    R(x, cx + (sp ? -2 : 0), by - (sp ? 0 : 2), 1, 2, '#CFCFD8');
  };
  // Khói xe luôn phụt ra phía sau đuôi xe (ngược chiều di chuyển)
  for (var i = 0; i < 3; i++) {
    E(x, bx - 9 - i * 4 - ((t * 20) % 4), by - 3 - (i % 2), 2 - (i > 1 ? 1 : 0), 2 - (i > 1 ? 1 : 0), 'rgba(255,251,241,.55)');
  }
  w(bx + 3); w(bx + 26);
  R(x, bx + 23, by - 12, 3, 12, '#2B2118');
  R(x, bx + 21, by - 14, 6, 3, '#2B2118');
  R(x, bx + 27, by - 11, 3, 2, '#FFE08A'); // Đèn pha luôn hướng phía trước
  R(x, bx + 2, by - 8, 2, 2, '#E0452B');   // Đèn hậu đỏ phía sau
  if (pig) {
    hpx.clearRect(0, 0, 24, 20);
    drawPigSprite(hpx, { pose: 'stand', frame: 0, mood: 'ok', happy: FBS.hop > 0, blink: (t % 4) < 0.15, tail: true });
    x.drawImage(hp, 0, 0, 24, 20, Math.round(bx + 3), Math.round(by - 29), 24, 20);
    E(x, bx + 17, by - 26, 7, 6, '#2B2118');
    E(x, bx + 17, by - 26, 6, 5, '#F4B93B');
    R(x, bx + 11, by - 25, 15, 1, '#2B2118');
    R(x, bx + 20, by - 24, 6, 5, '#2B2118');
    R(x, bx + 21, by - 23, 4, 3, '#8EC9E8');
    R(x, bx + 13, by - 28, 3, 1, '#FFF6CF');
  } else {
    E(x, bx + 13, by - 12, 4, 5, '#2B2118');
    E(x, bx + 13, by - 12, 3, 4, hat ? '#2F8F83' : '#6B6878');
    E(x, bx + 13, by - 18, 4, 4, '#2B2118');
    E(x, bx + 13, by - 18, 3, 3, hat ? '#E8B98A' : '#8EC9E8');
    if (hat) {
      // Nón lá Việt Nam 16-bit
      R(x, bx + 7, by - 21, 13, 2, '#2B2118');
      R(x, bx + 8, by - 22, 11, 2, '#E8D49A');
      R(x, bx + 10, by - 24, 7, 2, '#E8D49A');
      R(x, bx + 12, by - 25, 3, 1, '#C9B070');
    }
  }
  R(x, bx + 5, by - 9, 18, 2, '#2B2118');
  R(x, bx + 7, by - 8, 15, 5, '#2B2118');
  R(x, bx + 8, by - 7, 13, 3, pig ? '#E0452B' : '#4B6FA5');
  R(x, bx + 6, by - 10, 10, 2, '#2B2118');
  R(x, bx - 2, by - 4, 6, 2, '#8E8E9A');
  x.restore();
}

function fbBus(x, bx, by, t, dir) {
  var d = dir === -1 ? -1 : 1;
  x.save();
  if (d === -1) {
    x.translate(bx + 23, 0);
    x.scale(-1, 1);
    x.translate(-(bx + 23), 0);
  }
  // Bóng đổ bám đường nhựa + khói phụt đúng sau đuôi xe buýt
  R(x, bx + 2, by + 1, 42, 2, 'rgba(0,0,0,.25)');
  for (var i = 0; i < 2; i++) {
    E(x, bx - 5 - i * 4 - ((t * 16) % 4), by - 3 - i, 2 - i, 2 - i, 'rgba(255,251,241,.45)');
  }
  // Thân xe buýt xanh TP.HCM
  R(x, bx, by - 16, 46, 15, '#2B2118');
  R(x, bx + 1, by - 15, 44, 13, '#E9F2EA');
  R(x, bx + 1, by - 8, 44, 6, '#2F8F83');
  // 5 ô cửa kính phản sáng chéo
  for (var w = 0; w < 5; w++) {
    R(x, bx + 3 + w * 8, by - 14, 6, 5, '#6DA9D9');
    R(x, bx + 4 + w * 8, by - 13, 2, 1, '#FFFBF1');
  }
  R(x, bx + 42, by - 14, 3, 2, '#F4B93B'); // Biển số tuyến
  R(x, bx + 44, by - 6, 2, 3, '#FFE08A');  // Đèn pha trước
  R(x, bx, by - 6, 2, 3, '#E0452B');       // Đèn hậu sau
  // 2 bánh xe có mâm
  [bx + 9, bx + 36].forEach(function(wx) {
    E(x, wx, by, 4, 4, '#2B2118');
    E(x, wx, by, 2, 2, '#CFCFD8');
  });
  x.restore();
}

function fbTaxi(x, bx, by, t, dir) {
  var d = dir === -1 ? -1 : 1;
  x.save();
  if (d === -1) {
    x.translate(bx + 16, 0);
    x.scale(-1, 1);
    x.translate(-(bx + 16), 0);
  }
  R(x, bx + 2, by + 1, 28, 2, 'rgba(0,0,0,.22)');
  E(x, bx - 5 - ((t * 18) % 4), by - 2, 1, 1, 'rgba(255,251,241,.45)');
  R(x, bx, by - 8, 32, 7, '#2B2118');
  R(x, bx + 1, by - 7, 30, 5, '#FFFBF1');
  R(x, bx + 7, by - 13, 17, 6, '#2B2118');
  R(x, bx + 8, by - 12, 15, 5, '#FFFBF1');
  R(x, bx + 9, by - 11, 6, 4, '#7EC8E8');
  R(x, bx + 17, by - 11, 5, 4, '#7EC8E8');
  R(x, bx + 10, by - 10, 2, 1, '#FFFBF1');
  R(x, bx + 13, by - 15, 6, 2, '#2B2118');
  R(x, bx + 14, by - 14, 4, 1, '#F4B93B'); // Mào taxi vàng
  R(x, bx + 30, by - 6, 2, 2, '#FFE08A');  // Đèn pha
  R(x, bx, by - 6, 2, 2, '#E0452B');       // Đèn hậu
  [bx + 7, bx + 24].forEach(function(wx) {
    E(x, wx, by, 3, 3, '#2B2118');
    E(x, wx, by, 1, 1, '#CFCFD8');
  });
  x.restore();
}

function fbHero(x, t) {
  var dt = Math.min(0.05, FB.dt || 0.016);
  FBS.mt += dt;
  if (FBS.hop > 0) FBS.hop = Math.max(0, FBS.hop - dt);
  if (FBS.mt > 13) {
    FBS.mode = FBS.mode === 'ride' ? 'walk' : 'ride';
    FBS.mt = 0;
    FBS.x = -40;
  }
  FBS.x += (FBS.mode === 'ride' ? 58 : 16) * dt;
  if (FBS.x > FB.w + 30) FBS.x = -40;

  var jy = FBS.hop > 0 ? -Math.abs(Math.sin(FBS.hop * 10)) * 7 : 0;

  // Làn trên (đi sang Trái ←, dir = -1): Xe buýt xanh TP.HCM + Xe máy Việt Nam đội nón lá (đầu xe & khói đúng chiều!)
  var busX = Math.round(FB.w + 40 - ((t * 22) % (FB.w + 160)));
  var motoX = Math.round(FB.w + 40 - (((t * 32) + 95) % (FB.w + 150)));
  fbBus(x, busX, 75, t, -1);
  fbRider(x, motoX, 76, t, false, -1, true);

  // Làn dưới (đi sang Phải →, dir = 1): Ô tô Taxi Sài Gòn + Heo lái xe máy đỏ / đi bộ
  var taxiX = Math.round(((t * 38 + 110) % (FB.w + 160)) - 60);
  fbTaxi(x, taxiX, 81, t, 1);

  if (FBS.mode === 'ride') {
    fbRider(x, Math.round(FBS.x), 80 + Math.round(jy * 0.4), t, true, 1, false);
  } else {
    hpx.clearRect(0, 0, 24, 20);
    drawPigSprite(hpx, { pose: 'walk', frame: ((t * 5) | 0) % 2, mood: 'ok', happy: FBS.hop > 0, blink: (t % 4) < 0.15, tail: true });
    x.drawImage(hp, 0, 0, 24, 20, Math.round(FBS.x), Math.round(52 + jy), 24, 20);
  }
}

function fbDraw(t) {
  var x = FB.x;
  x.drawImage(FB.bg, 0, 0);

  /* Sao lấp lánh */
  for (var i = 0; i < 9; i++) {
    var sx = (i * 37 + 11) % 110;
    var sy = (i * 13 + 4) % 24;
    if (((t * 2 + i) % 3) < 2) R(x, sx, sy, 1, 1, '#FFFBF1');
    if (((t * 1.5 + i * 2) % 4) < 0.5) fbSpark(x, sx, sy, 2, '#FFFBF1');
  }

  /* Mây trôi 3 lớp */
  var clouds = [
    [0, 12, '#FFE6EE', 9],
    [1, 26, '#FFF3DA', 14],
    [2, 36, '#FFD6E2', 7]
  ];
  clouds.forEach(function(c) {
    var cx = ((t * c[3] + c[0] * 80) % (FB.w + 50)) - 25;
    var cy = c[1];
    R(x, cx, cy, 22, 4, c[2]);
    R(x, cx + 4, cy - 3, 12, 4, c[2]);
    R(x, cx + 14, cy - 2, 8, 3, c[2]);
  });

  /* Máy bay Vietnam Airlines */
  fbPlane(x, t);

  /* Đèn báo đỏ trên Landmark 81 và Bitexco nhấp nháy */
  if ((t * 1.5) % 1 < 0.55) {
    R(x, 92, 3, 1, 1, '#FF5A4D');
    R(x, 70, 20, 1, 1, '#FF5A4D');
  }

  /* Chim non trên tháp */
  fbBird(x, 158, 48, t, 0);
  fbBird(x, 172, 48, t, 1.7);

  /* Nhân vật Heo lái xe máy / đi bộ */
  fbHero(x, t);

  /* Hạt lấp lánh khi chạm */
  FB.spk = FB.spk.filter(function(s) { return (s.l -= 0.03) > 0; });
  FB.spk.forEach(function(s) {
    s.x += s.vx;
    s.y += s.vy;
    fbSpark(x, Math.round(s.x), Math.round(s.y), s.l > 0.5 ? 2 : 1, s.c);
  });

  /* Viền phim hoạt hình trên dưới 2px */
  R(x, 0, 0, FB.w, 2, '#2B2118');
  R(x, 0, FB.h - 2, FB.w, 2, '#2B2118');
}

function fbFrame(now) {
  var dt = Math.min(0.05, (now - FB.last) / 1000);
  FB.last = now;
  FB.dt = dt;
  FB.t += dt;
  fbDraw(FB.t);
  requestAnimationFrame(fbFrame);
}

function funBanStart() {
  FB.c = document.getElementById('funCv');
  FB.x = FB.c.getContext('2d');
  FB.x.imageSmoothingEnabled = false;
  fbStatic();

  function onBannerTap() {
    notify('HAPTIC_LIGHT');
    FB.boost = 1;
    FBS.hop = 0.7;
    FB.tapN = (FB.tapN || 0) + 1;
    if (FB.tapN % 3 === 0) {
      FBS.mode = FBS.mode === 'ride' ? 'walk' : 'ride';
      FBS.mt = 0;
      FBS.x = -40;
    }
    for (var i = 0; i < 14; i++) {
      var a = Math.random() * 6.28;
      FB.spk.push({
        x: Math.max(10, Math.min(180, FBS.x + 16)),
        y: 66,
        vx: Math.cos(a) * 1.4,
        vy: Math.sin(a) * 1.4 - 0.3,
        l: 1,
        c: ['#FFFBF1', '#FFE08A', '#F9B8C4'][i % 3]
      });
    }
  }

  FB.c.addEventListener('click', onBannerTap);
  FB.c.addEventListener('touchstart', function(e) {
    e.preventDefault();
    onBannerTap();
  }, { passive: false });

  FB.last = performance.now();
  requestAnimationFrame(fbFrame);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', funBanStart);
} else {
  funBanStart();
}

})();
</script>
</body>
</html>`, []);

  return (
    <View style={styles.container}>
      <View style={styles.webViewWrapper}>
        {Platform.OS === 'web' ? (
          <iframe
            srcDoc={htmlContent}
            style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#2B2118' } as any}
          />
        ) : (
          <SafeWebView
            ref={webViewRef}
            source={{ html: htmlContent }}
            style={styles.webView}
            containerStyle={styles.webView}
            scrollEnabled={false}
            bounces={false}
            overScrollMode="never"
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleMessage}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 192 / 88,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#2B2118',
    overflow: 'hidden',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 14,
  },
  webViewWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#2B2118',
  },
  webView: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#2B2118',
  },
});
