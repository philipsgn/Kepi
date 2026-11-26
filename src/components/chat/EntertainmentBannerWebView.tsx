import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { useGamificationStore } from '../../store/gamificationStore';
import { buildOpenRoomEngineScript } from '../pixel/pixelOpenRoomEngine';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface EntertainmentBannerWebViewProps {
  onPressBanner?: () => void;
  onEnterCafe?: () => void;
  onEnterMarket?: () => void;
  onEnterCathedral?: () => void;
}

/**
 * Banner Panorama 16-Bit Việt Nam Liền Mạch 100% (540×112 trên khung nhìn 192×88 — Quyết định 202)
 * - 1 Offscreen Canvas duy nhất (0 vết cắt ghép): 1 dải trời, 1 skyline, 1 vỉa hè lát gạch & 1 đại lộ 2 làn xuyên suốt 540px.
 * - Tự động đổi 3 sắc trời theo giờ thực tế (Sáng nắng xanh tươi / Chiều hoàng hôn / Tối đèn phố).
 * - 5 khu phố Việt Nam liên thông: Phố Cổ Phở ➔ Tiệm CAFE Mái Sọc & Bánh Mì ➔ Chợ Bến Thành & Nhà Thờ Đức Bà ➔ Bitexco & Landmark 81 ➔ Nhà Sàn & Bến Sông.
 * - Tích hợp pixelOpenRoomEngine 2D (Tap-to-Walk + Drag-to-Pan + 5 Hotspot Actions gắn dữ liệu thật từ Store).
 */
export const EntertainmentBannerWebView: React.FC<EntertainmentBannerWebViewProps> = ({
  onPressBanner,
  onEnterCafe,
  onEnterMarket,
  onEnterCathedral,
}) => {
  const { tokens } = useTheme();
  const webViewRef = useRef<any>(null);
  const { gameTickets, pigFood, streakDays } = useGamificationStore();
  const [roomToast, setRoomToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterCafeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showRoomToast = (text: string) => {
    setRoomToast(text);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setRoomToast(null), 2600);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (enterCafeTimerRef.current) clearTimeout(enterCafeTimerRef.current);
    };
  }, []);

  const handleRoomPayload = (d: any) => {
    if (!d) return;
    if (d.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (d.type === 'ROOM_ACTION') {
      if (d.text) showRoomToast(String(d.text));
      if (d.id === 'saigon_cafe' && d.userTriggered && onEnterCafe) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (enterCafeTimerRef.current) clearTimeout(enterCafeTimerRef.current);
        enterCafeTimerRef.current = setTimeout(() => {
          onEnterCafe();
        }, 120);
      } else if (d.id === 'ben_thanh_notre' && d.userTriggered && onEnterMarket) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (enterCafeTimerRef.current) clearTimeout(enterCafeTimerRef.current);
        enterCafeTimerRef.current = setTimeout(() => {
          onEnterMarket();
        }, 120);
      } else if (d.id === 'notre_dame_gate' && d.userTriggered && onEnterCathedral) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (enterCafeTimerRef.current) clearTimeout(enterCafeTimerRef.current);
        enterCafeTimerRef.current = setTimeout(() => {
          onEnterCathedral();
        }, 120);
      }
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onWebMsg = (ev: MessageEvent) => {
      try {
        const d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
        handleRoomPayload(d);
      } catch (_e) {}
    };
    window.addEventListener('message', onWebMsg);
    return () => window.removeEventListener('message', onWebMsg);
  }, [onEnterCafe, onEnterMarket, onEnterCathedral]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleRoomPayload(data);
    } catch (_e) {
      // Ignored
    }
  };

  const openRoomScript = useMemo(
    () =>
      buildOpenRoomEngineScript({
        canvasId: 'funCv',
        worldWidth: 540,
        worldHeight: 112,
        viewWidth: 192,
        viewHeight: 88,
        walkBounds: { minX: 16, maxX: 524, minY: 66, maxY: 102 },
        initialX: 244,
        initialY: 74,
        initialCamX: 120,
        initialCamY: 0,
        speed: 40,
        hotspots: [
          {
            id: 'pho_old_quarter',
            x: 12,
            y: 20,
            w: 88,
            h: 46,
            standX: 56,
            standY: 74,
            standFace: -1,
            actionType: 'eat_snack',
            bubbleText: `Phố Cổ Quán Phở · Kho cám: ${pigFood} cám`,
          },
          {
            id: 'saigon_cafe',
            x: 112,
            y: 14,
            w: 108,
            h: 56,
            standX: 164,
            standY: 74,
            standFace: 1,
            actionType: 'sip_coffee',
            fastDash: true,
            bubbleText: `Đang bước vào Tiệm CAFE...`,
          },
          {
            id: 'notre_dame_gate',
            x: 224,
            y: 12,
            w: 38,
            h: 54,
            standX: 243,
            standY: 74,
            standFace: 1,
            actionType: 'look_window',
            fastDash: true,
            bubbleText: `Đang bước vào Nhà Thờ Đức Bà Sài Gòn...`,
          },
          {
            id: 'ben_thanh_notre',
            x: 264,
            y: 12,
            w: 60,
            h: 54,
            standX: 292,
            standY: 74,
            standFace: 1,
            actionType: 'look_window',
            fastDash: true,
            bubbleText: `Đang bước vào Chợ Bến Thành...`,
          },
          {
            id: 'bitexco_landmark',
            x: 332,
            y: 6,
            w: 98,
            h: 60,
            standX: 378,
            standY: 74,
            standFace: 1,
            actionType: 'play_arcade',
            bubbleText: `Bitexco & Landmark 81 · ${gameTickets} vé sẵn sàng!`,
          },
          {
            id: 'stilt_river',
            x: 444,
            y: 22,
            w: 88,
            h: 52,
            standX: 486,
            standY: 76,
            standFace: 1,
            actionType: 'jump_joy',
            bubbleText: `Nhà Sàn Bến Sông · ${pigFood} cám cho heo`,
          },
        ],
      }),
    [pigFood, streakDays, gameTickets]
  );

  const htmlContent = useMemo(() => `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<style>
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; user-select: none; }
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
  touch-action: none;
}
</style>
<script>
window.onerror = function (msg, src, line) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CONSOLE_ERROR', error: String(msg), line: line }));
  }
  return false;
};
</script>
</head>
<body>
<canvas id="funCv" width="192" height="88" role="img" aria-label="Panorama 16-bit Việt Nam liền mạch: Phố Cổ Phở, Tiệm CAFE Bánh Mì, Chợ Bến Thành, Nhà Thờ Đức Bà, Bitexco, Landmark 81 và Nhà Sàn Bến Sông"></canvas>

<script>
(function(){
'use strict';

var INK = '#2B2118';
var WORLD_W = 540;
var WORLD_H = 112;
var VW = 192;
var VH = 88;

function notify(type) {
  var msg = JSON.stringify({ type: type });
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(msg);
  } else if (window.parent && window.parent !== window) {
    window.parent.postMessage(msg, '*');
  }
}

function R(c, x, y, w, h, col) {
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function E(c, cx, cy, rx, ry, col) {
  c.fillStyle = col;
  for (var dy = -ry; dy <= ry; dy++) {
    for (var dx = -rx; dx <= rx; dx++) {
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
        c.fillRect(Math.round(cx + dx), Math.round(cy + dy), 1, 1);
      }
    }
  }
}

/* ========================================================
 * BẢNG MÀU TỰ ĐỘNG 3 KHUNG GIỜ (SÁNG / CHIỀU / TỐI)
 * ======================================================== */
function getTimePalette() {
  var h = new Date().getHours();
  if (h >= 6 && h < 16) {
    // SÁNG NẮNG XANH (Cảm hứng trực tiếp từ Hình 5 16-bit sáng rõ)
    return {
      mode: 'day',
      sky: ['#78B9F7', '#8BC6FA', '#A1D3FC', '#B7DEFF', '#CCE8FF'],
      cloudMain: '#FFFFFF',
      cloudShade: '#DCEEFF',
      skylineFar: '#7BA9DF',
      skylineHi: '#93BFEA',
      sun: '#FFF3B0',
      winGlow: '#DCEEFA',
      lampGlow: false,
      road: '#5C5B66',
      roadLine: '#FFFBF1',
      sidewalk: '#EADBC4',
      sidewalkLine: '#D1BC9B',
      grass: '#69AD5A',
      grassDark: '#4D8A43',
      water: '#4EA0D8',
      waterHi: '#8EC9E8'
    };
  }
  if (h >= 16 && h < 19) {
    // CHIỀU HOÀNG HÔN SÀI GÒN
    return {
      mode: 'sunset',
      sky: ['#6A55A3', '#966FA8', '#D38896', '#F4A282', '#FBE0A0'],
      cloudMain: '#FFF1DC',
      cloudShade: '#F6C6C8',
      skylineFar: '#6C548E',
      skylineHi: '#866AA6',
      sun: '#FFE89A',
      winGlow: '#FFE08A',
      lampGlow: true,
      road: '#4A434D',
      roadLine: '#FBE0A0',
      sidewalk: '#DFC5A6',
      sidewalkLine: '#BF9E7D',
      grass: '#598F4E',
      grassDark: '#3F6F39',
      water: '#4B78A8',
      waterHi: '#F4A282'
    };
  }
  // TỐI ĐÈN PHỐ SÀI GÒN
  return {
    mode: 'night',
    sky: ['#161A36', '#1F264D', '#2B3363', '#3A4278', '#4A5188'],
    cloudMain: '#475084',
    cloudShade: '#343C69',
    skylineFar: '#232952',
    skylineHi: '#343C70',
    sun: '#FFF8D6',
    winGlow: '#FFD966',
    lampGlow: true,
    road: '#34313D',
    roadLine: '#E6D6A8',
    sidewalk: '#A8947C',
    sidewalkLine: '#85715B',
    grass: '#35613B',
    grassDark: '#26482C',
    water: '#23426B',
    waterHi: '#5A84B8'
  };
}

var PAL_TIME = getTimePalette();

/* ========================================================
 * SPRITE HEO CON 24×20 CHUẨN PROTOTYPE
 * ======================================================== */
var PAL = { p: '#F9B8C4', s: '#E68FA2', n: '#F29AB0', h: '#FFDCE4', i: '#2B2118', g: '#F4B93B' };
var hp = document.createElement('canvas'); hp.width = 24; hp.height = 20;
var hpx = hp.getContext('2d'); hpx.imageSmoothingEnabled = false;

function drawPigSprite(c, o) {
  // 24x20 pig pixel shape
  o = o || {};
  var pose = o.pose || 'stand';
  var f = o.frame || 0;
  var I = PAL.i, P = PAL.p, S = PAL.s, N = PAL.n, H = PAL.h, G = PAL.g;
  var by = pose === 'walk' ? (f % 2 ? 0 : 1) : 0;
  var hx = pose === 'eat' ? 1 : 0, hy = pose === 'eat' ? 3 : by;

  if (o.tail) {
    R(c, 2, 10 + by, 2, 1, I); R(c, 1, 9 + by, 1, 2, I); R(c, 2, 8 + by, 1, 1, I);
  } else {
    R(c, 2, 11 + by, 2, 1, I); R(c, 1, 10 + by, 1, 1, I);
  }
  R(c, 4, 7 + by, 14, 9, I); R(c, 3, 8 + by, 16, 7, I);
  R(c, 5, 8 + by, 12, 7, P); R(c, 4, 9 + by, 14, 5, P);
  R(c, 6, 8 + by, 10, 2, H); R(c, 5, 13 + by, 12, 2, S);
  R(c, 9, 8 + by, 4, 1, I); R(c, 9, 9 + by, 4, 1, G);

  R(c, 14 + hx, 3 + hy, 3, 3, I); R(c, 15 + hx, 4 + hy, 1, 1, N);
  R(c, 12 + hx, 4 + hy, 9, 9, I); R(c, 11 + hx, 5 + hy, 11, 7, I);
  R(c, 13 + hx, 5 + hy, 7, 7, P); R(c, 12 + hx, 6 + hy, 9, 5, P);
  R(c, 13 + hx, 5 + hy, 5, 2, H); R(c, 13 + hx, 11 + hy, 6, 1, S);

  R(c, 19 + hx, 7 + hy, 4, 4, I); R(c, 20 + hx, 8 + hy, 2, 2, N);
  R(c, 20 + hx, 8 + hy, 1, 1, I); R(c, 21 + hx, 9 + hy, 1, 1, I);

  if (o.blink) {
    R(c, 16 + hx, 8 + hy, 2, 1, I);
  } else if (o.happy) {
    R(c, 16 + hx, 8 + hy, 1, 1, I); R(c, 17 + hx, 7 + hy, 1, 1, I); R(c, 18 + hx, 8 + hy, 1, 1, I);
  } else {
    R(c, 16 + hx, 7 + hy, 2, 2, I); R(c, 16 + hx, 7 + hy, 1, 1, '#FFFFFF');
  }
  R(c, 14 + hx, 10 + hy, 2, 1, '#F27D94');

  var L1 = pose === 'walk' ? (f % 2 ? 0 : -1) : 0;
  var L2 = pose === 'walk' ? (f % 2 ? -1 : 0) : 0;
  [[6, L1], [9, L2], [13, L2], [16, L1]].forEach(function(lg) {
    R(c, lg[0], 15 + by + lg[1], 2, 4, I);
    R(c, lg[0], 15 + by + lg[1], 1, 2, P);
    R(c, lg[0], 18 + by + lg[1], 2, 1, I);
  });
}

/* ========================================================
 * CÁC HÀM VẼ ĐỒ HỌA 16-BIT ĐỒNG NHẤT (0 VẾT GHÉP)
 * ======================================================== */
var FB = { w: VW, h: VH, t: 0, last: 0, spk: [], boost: 0 };

function fbSky(x) {
  var bands = PAL_TIME.sky;
  var bh = Math.ceil(66 / bands.length);
  for (var i = 0; i < bands.length; i++) {
    R(x, 0, i * bh, WORLD_W, bh + 1, bands[i]);
  }
  // Mặt trời / Mặt trăng đặt bên phải thoáng đãng
  if (PAL_TIME.mode === 'sunset') {
    E(x, 386, 42, 18, 18, '#FCE8A6');
    E(x, 386, 42, 14, 14, '#FFF8D6');
  } else if (PAL_TIME.mode === 'day') {
    E(x, 42, 14, 8, 8, PAL_TIME.sun);
  } else {
    E(x, 42, 14, 7, 7, '#FFF8D6');
    E(x, 45, 12, 5, 5, PAL_TIME.sky[0]); // trăng khuyết
  }
}

function drawTree16(c, cx, groundY, crownCol, hiCol, shCol, hasRedFlowers) {
  // Thân cây có viền nâu mực
  R(c, cx - 2, groundY - 12, 5, 12, INK);
  R(c, cx - 1, groundY - 11, 3, 11, '#8C5B36');
  R(c, cx - 1, groundY - 11, 1, 11, '#B37B4E');
  // Tán lá 3 tầng giống Hình 5
  E(c, cx, groundY - 19, 10, 10, INK);
  E(c, cx, groundY - 19, 9, 9, shCol);
  E(c, cx - 1, groundY - 21, 8, 7, crownCol);
  E(c, cx - 2, groundY - 24, 5, 4, hiCol);
  if (hasRedFlowers) {
    [[-5, -22], [3, -24], [0, -18], [5, -19], [-3, -15]].forEach(function(fl) {
      R(c, cx + fl[0], groundY + fl[1], 2, 2, '#E0452B');
      R(c, cx + fl[0], groundY + fl[1], 1, 1, '#FF8A65');
    });
  }
}

function drawLamp16(c, lx, groundY) {
  R(c, lx - 1, groundY - 20, 3, 20, INK);
  R(c, lx, groundY - 19, 1, 19, '#6C7385');
  R(c, lx - 2, groundY - 2, 5, 2, INK);
  // Đèn chóp cổ điển
  R(c, lx - 3, groundY - 25, 7, 5, INK);
  R(c, lx - 2, groundY - 24, 5, 3, PAL_TIME.lampGlow ? '#FFE08A' : '#FFFBF1');
  R(c, lx - 2, groundY - 26, 5, 1, INK);
  if (PAL_TIME.lampGlow) {
    c.save();
    c.globalAlpha = 0.22;
    E(c, lx, groundY - 22, 9, 8, '#FFE08A');
    c.restore();
  }
}

function drawPerson16(c, px, groundY, shirtCol, pantsCol, hasNonLa) {
  R(c, px, groundY - 4, 2, 4, pantsCol);
  R(c, px + 2, groundY - 4, 2, 4, pantsCol);
  R(c, px, groundY - 8, 4, 4, shirtCol);
  R(c, px + 1, groundY - 11, 2, 3, '#F4C9A0');
  if (hasNonLa) {
    R(c, px - 1, groundY - 12, 6, 1, '#E8C56E');
    R(c, px, groundY - 13, 4, 1, '#F7DF94');
    R(c, px + 1, groundY - 14, 2, 1, '#FFF1C2');
  } else {
    R(c, px + 1, groundY - 12, 2, 1, INK);
  }
}

function buildSeamlessPanorama(c) {
  // 1. BẦU TRỜI LIỀN MẠCH 540px
  fbSky(c);

  // 2. DÃY SKYLINE CAO ỐC XA LIỀN MẠCH 540px (Parallax depth chuẩn Hình 5)
  var skyBlocks = [
    [6, 30, 18], [26, 22, 14], [44, 34, 20], [68, 26, 16], [92, 32, 22],
    [122, 24, 18], [148, 28, 24], [180, 20, 16], [204, 30, 20], [234, 26, 18],
    [262, 32, 22], [296, 24, 18], [326, 28, 20], [362, 22, 16], [396, 26, 22],
    [432, 30, 18], [462, 24, 20], [492, 28, 22], [520, 32, 18]
  ];
  skyBlocks.forEach(function(b) {
    R(c, b[0], b[1], b[2], 66 - b[1], PAL_TIME.skylineFar);
    R(c, b[0], b[1], 2, 66 - b[1], PAL_TIME.skylineHi);
  });

  // 3. KHU 1 (x: 0..112): PHỐ CỔ & QUÁN PHỞ VIỆT NAM
  drawLamp16(c, 10, 66);
  // Nhà ống vàng cổ điển
  R(c, 20, 24, 66, 42, INK);
  R(c, 21, 25, 52, 41, '#F5C96B'); // mặt tiền vàng ấm
  R(c, 73, 25, 12, 41, '#D59C43'); // cạnh đổ bóng
  // Mái ngói đỏ Việt Nam
  R(c, 18, 20, 70, 5, INK);
  R(c, 19, 21, 68, 3, '#C94B38');
  R(c, 22, 17, 62, 4, '#DF644F');
  // Cửa sổ chớp xanh trên tầng 2
  [28, 52].forEach(function(wx) {
    R(c, wx, 29, 12, 10, INK);
    R(c, wx + 1, 30, 10, 8, '#4E8C57');
    R(c, wx + 4, 31, 4, 6, PAL_TIME.winGlow);
  });
  // Bảng hiệu PHỞ nền kem viền nâu mực
  R(c, 28, 41, 38, 8, INK);
  R(c, 29, 42, 36, 6, '#FFFBF1');
  R(c, 33, 44, 28, 2, '#C94B38');
  // Mái hiên sọc đỏ-kem
  R(c, 20, 49, 54, 5, INK);
  for (var ax = 21; ax < 73; ax += 6) {
    R(c, ax, 50, 3, 3, '#C94B38');
    R(c, ax + 3, 50, 3, 3, '#FFFBF1');
  }
  // Quầy phở & cửa tầng trệt
  R(c, 24, 54, 24, 12, INK); R(c, 25, 55, 22, 11, PAL_TIME.winGlow);
  R(c, 52, 54, 16, 12, INK); R(c, 53, 55, 14, 11, '#8A5A34');
  drawPerson16(c, 32, 66, '#FFFBF1', '#4B6FA5', true);
  drawTree16(c, 98, 66, '#5EA353', '#82C76E', '#3F7A3A', false);

  // 4. KHU 2 (x: 110..222): TIỆM CAFE TÁI HIỆN 1:1 THEO ẢNH 6 (CHUẨN SENIOR PIXEL ART)
  // Cột đèn đường cổ điển + 2 biển mũi tên chỉ hướng (x: 112)
  R(c, 111, 44, 2, 22, INK);
  R(c, 109, 39, 6, 5, INK); R(c, 110, 40, 4, 3, PAL_TIME.lampGlow ? '#FFE08A' : '#FFFBF1');
  R(c, 108, 47, 8, 3, '#FFFBF1'); R(c, 108, 47, 8, 1, INK); R(c, 115, 48, 1, 1, '#E0452B'); // biển chỉ hướng ->
  R(c, 108, 51, 7, 3, '#FFFBF1'); R(c, 108, 51, 7, 1, INK); R(c, 108, 52, 1, 1, '#4B6FA5'); // biển chỉ hướng <-
  // Bảng phấn menu chữ A vỉa hè (x: 116..122)
  R(c, 116, 59, 6, 7, INK); R(c, 117, 60, 4, 5, '#3E3546'); R(c, 118, 61, 2, 1, '#FFFBF1'); R(c, 118, 63, 2, 1, '#FFE08A');

  // Khối nhà chính Tiệm CAFE (x: 123..180, y: 20..66)
  R(c, 123, 23, 57, 43, INK);
  R(c, 124, 24, 50, 42, '#F7B267'); // mặt tiền kem cam ấm
  R(c, 174, 24, 5, 42, '#E69138');  // cạnh đổ bóng
  // Vương miện mái 2 tầng màu vàng kem
  R(c, 128, 19, 42, 5, INK); R(c, 129, 20, 40, 3, '#FDE18E');
  R(c, 136, 21, 26, 1, '#E69138');
  // Bảng hiệu CAFE nền trắng viền nâu đỏ sắc nét
  R(c, 130, 26, 38, 11, INK); R(c, 131, 27, 36, 9, '#FFFBF1');
  R(c, 132, 28, 34, 7, '#FFFFFF');
  // Chữ C-A-F-E pixel khối đỏ nâu (#8E3538)
  R(c, 134, 29, 5, 1, '#8E3538'); R(c, 134, 29, 1, 5, '#8E3538'); R(c, 134, 33, 5, 1, '#8E3538'); // C
  R(c, 141, 29, 5, 5, '#8E3538'); R(c, 142, 30, 3, 1, '#FFFFFF'); R(c, 142, 32, 3, 2, '#FFFFFF'); // A
  R(c, 148, 29, 5, 1, '#8E3538'); R(c, 148, 29, 1, 5, '#8E3538'); R(c, 148, 31, 4, 1, '#8E3538'); // F
  R(c, 155, 29, 5, 1, '#8E3538'); R(c, 155, 29, 1, 5, '#8E3538'); R(c, 155, 31, 4, 1, '#8E3538'); R(c, 155, 33, 5, 1, '#8E3538'); // E

  // Mái hiên sọc Canvas xanh pastel - trắng - cam đất (y: 38..44)
  R(c, 121, 38, 56, 6, INK);
  for (var cx = 122; cx < 176; cx += 6) {
    R(c, cx, 39, 3, 4, '#79A8DF');
    R(c, cx + 3, 39, 3, 4, '#FFFBF1');
  }
  R(c, 122, 43, 54, 1, '#E69138'); // viền đổ bóng dưới mái hiên

  // Cửa kính trưng bày lớn có vệt phản chiếu chéo (x: 126..155, y: 45..64)
  R(c, 126, 45, 29, 19, INK);
  R(c, 127, 46, 27, 17, '#A7D0F5');
  // 2 vệt phản chiếu ánh sáng chéo trên kính
  R(c, 131, 47, 5, 14, '#DCEEFF'); R(c, 136, 47, 2, 10, '#FFFFFF');
  R(c, 143, 48, 4, 12, '#DCEEFF');
  R(c, 140, 46, 1, 17, '#5B6B8C'); // thanh chia kính mảnh

  // Bàn tròn ngoài hiên + 2 bạn ngồi uống cà phê vỉa hè (x: 129..151)
  R(c, 135, 59, 10, 2, INK); R(c, 136, 59, 8, 1, '#FFFBF1'); // mặt bàn tròn
  R(c, 139, 61, 2, 5, INK); // chân bàn
  R(c, 137, 57, 2, 2, '#E69138'); R(c, 141, 57, 2, 2, '#E69138'); // 2 ly cà phê
  drawPerson16(c, 129, 66, '#E0452B', '#2B2118', false); // bạn trái ngồi uống
  drawPerson16(c, 146, 66, '#F4B93B', '#2B2118', false); // bạn phải ngồi uống

  // Cửa chính gỗ trắng 2 cánh có phào chỉ (x: 158..173, y: 46..66)
  R(c, 158, 46, 15, 20, INK);
  R(c, 159, 47, 13, 19, '#FFFBF1');
  R(c, 165, 47, 1, 19, '#8E7368'); // khe giữa 2 cánh
  R(c, 160, 49, 4, 6, '#E2D4CC'); R(c, 167, 49, 4, 6, '#E2D4CC');
  R(c, 160, 57, 4, 6, '#E2D4CC'); R(c, 167, 57, 4, 6, '#E2D4CC');

  // Gian phụ bên phải tường cam đất + cửa sổ vòm tròn (x: 180..204, y: 34..66)
  R(c, 180, 34, 24, 32, INK);
  R(c, 181, 35, 22, 31, '#F29B52');
  R(c, 180, 31, 24, 4, '#FDE18E'); // viền mái gian phụ
  E(c, 192, 48, 7, 7, INK); E(c, 192, 48, 6, 6, '#A7D0F5');
  R(c, 185, 48, 14, 10, '#A7D0F5'); R(c, 185, 58, 14, 1, INK);
  R(c, 192, 42, 1, 16, '#5B6B8C'); R(c, 186, 51, 12, 1, '#5B6B8C'); // nan cửa vòm
  // 2 bạn đứng trò chuyện trước cửa vòm
  drawPerson16(c, 184, 66, '#4B6FA5', '#2B2118', false);
  drawPerson16(c, 194, 66, '#E68FA2', '#2B2118', false);

  // Cây tùng xoắn ốc pastel trong bồn gạch cạnh tiệm (x: 213, y: 27..66)
  R(c, 207, 62, 12, 4, INK); R(c, 208, 63, 10, 3, '#A65434'); // bồn gạch
  R(c, 211, 51, 4, 11, INK); R(c, 212, 52, 2, 10, '#B37B4E'); // thân cây
  E(c, 213, 44, 7, 10, INK);
  E(c, 213, 44, 6, 9, '#8CA8DC');
  E(c, 212, 39, 5, 7, '#B8CCF2');
  R(c, 210, 37, 4, 2, '#E4EEFF'); R(c, 211, 44, 5, 2, '#E4EEFF'); // vân xoắn sáng

  // Nhãn nhỏ "[CAFE]" gợi ý chạm ở trên mái
  R(c, 143, 12, 22, 6, INK); R(c, 144, 13, 20, 4, '#FFE08A');
  R(c, 147, 14, 14, 2, '#2B2118');

  // 5. KHU 3 (x: 224..328): CHỢ BẾN THÀNH & NHÀ THỜ ĐỨC BÀ
  // Nhà Thờ Đức Bà tháp đôi gạch đỏ
  R(c, 228, 36, 30, 30, INK); R(c, 229, 37, 28, 29, '#B85346');
  R(c, 231, 20, 8, 17, INK); R(c, 232, 21, 6, 16, '#C96355');
  R(c, 247, 20, 8, 17, INK); R(c, 248, 21, 6, 16, '#C96355');
  // Chóp nhọn tháp đôi
  R(c, 233, 15, 4, 5, '#4A5568'); R(c, 234, 12, 2, 3, '#4A5568');
  R(c, 249, 15, 4, 5, '#4A5568'); R(c, 250, 12, 2, 3, '#4A5568');
  // Cửa vòm nhà thờ
  E(c, 243, 56, 5, 5, INK); R(c, 238, 56, 10, 10, '#6B312B');
  // Chợ Bến Thành Cửa Nam
  R(c, 266, 38, 54, 28, INK);
  R(c, 267, 39, 52, 27, '#F5E6C8');
  R(c, 264, 34, 58, 5, INK); R(c, 265, 35, 56, 3, '#C94B38'); // mái ngói đỏ chợ
  // Tháp đồng hồ trung tâm
  R(c, 284, 20, 18, 18, INK); R(c, 285, 21, 16, 17, '#F5E6C8');
  R(c, 287, 16, 12, 5, '#C94B38'); R(c, 292, 11, 2, 6, INK);
  R(c, 294, 11, 5, 3, '#E0452B'); R(c, 296, 12, 1, 1, '#F4B93B'); // cờ đỏ sao vàng
  E(c, 293, 29, 5, 5, INK); E(c, 293, 29, 4, 4, '#FFFBF1');
  R(c, 293, 26, 1, 3, INK); R(c, 293, 29, 3, 1, INK); // kim đồng hồ
  // 3 cổng vòm chợ
  [272, 289, 306].forEach(function(gx) {
    R(c, gx, 52, 9, 14, INK); R(c, gx + 1, 53, 7, 13, '#7A5438');
  });
  drawPerson16(c, 276, 66, '#F4B93B', '#2B2118', true);
  drawPerson16(c, 310, 66, '#5E9A57', '#2B2118', false);

  // 6. KHU 4 (x: 330..438): ĐẠI LỘ BITEXCO & LANDMARK 81
  drawLamp16(c, 336, 66);
  // Tháp Bitexco + sân đỗ trực thăng tầng 52
  R(c, 348, 16, 20, 50, INK);
  R(c, 349, 17, 18, 49, '#5F7AA3');
  R(c, 350, 18, 5, 48, '#8EC9E8'); // phản chiếu kính xanh
  for (var by = 22; by < 62; by += 4) {
    R(c, 350, by, 16, 1, PAL_TIME.winGlow);
  }
  R(c, 368, 30, 12, 3, INK); R(c, 368, 31, 11, 1, '#FFFBF1'); // sân đỗ trực thăng
  // Tòa tháp Landmark 81
  R(c, 392, 10, 14, 56, INK); R(c, 393, 11, 12, 55, '#4A6894');
  R(c, 386, 24, 6, 42, INK); R(c, 387, 25, 5, 41, '#5F7AA3');
  R(c, 406, 22, 6, 44, INK); R(c, 407, 23, 5, 43, '#3B5278');
  R(c, 398, 4, 2, 7, '#8EC9E8'); // ăng-ten đỉnh
  for (var ly = 16; ly < 62; ly += 4) {
    R(c, 395, ly, 8, 1, PAL_TIME.winGlow);
  }
  drawTree16(c, 428, 66, '#5EA353', '#82C76E', '#3F7A3A', false);

  // 7. KHU 5 (x: 440..540): NHÀ SÀN GỖ VIỆT NAM & CÂY PHƯỢNG VĨ VEN SÔNG
  // Nhà sàn gỗ truyền thống
  R(c, 452, 48, 4, 18, INK); R(c, 453, 49, 2, 17, '#6F4423');
  R(c, 498, 48, 4, 18, INK); R(c, 499, 49, 2, 17, '#6F4423');
  R(c, 474, 48, 4, 18, INK); R(c, 475, 49, 2, 17, '#6F4423');
  // Thân nhà sàn & lan can gỗ
  R(c, 448, 30, 58, 20, INK); R(c, 449, 31, 56, 18, '#B87B48');
  R(c, 452, 34, 14, 10, INK); R(c, 453, 35, 12, 8, PAL_TIME.winGlow);
  R(c, 472, 34, 16, 14, INK); R(c, 473, 35, 14, 13, '#6F4423');
  // Mái lá nhà sàn nhọn hai tầng
  R(c, 444, 25, 66, 6, INK); R(c, 445, 26, 64, 4, '#7D4E2B');
  R(c, 452, 20, 50, 5, INK); R(c, 453, 21, 48, 3, '#96613A');
  // Đèn lồng Hội An treo hiên nhà sàn
  E(c, 458, 33, 2, 2, '#E0452B'); E(c, 496, 33, 2, 2, '#F4B93B');
  // Cây phượng vĩ hoa đỏ rực rỡ
  drawTree16(c, 522, 66, '#4E8C47', '#6DB35E', '#356632', true);

  // 8. VỈA HÈ LÁT GẠCH THỐNG NHẤT XUYÊN SUỐT 540px (y: 66..78)
  R(c, 0, 66, WORLD_W, 1, INK);
  R(c, 0, 67, WORLD_W, 11, PAL_TIME.sidewalk);
  for (var sx = 0; sx < WORLD_W; sx += 12) {
    R(c, sx, 67, 1, 11, PAL_TIME.sidewalkLine);
  }
  R(c, 0, 77, WORLD_W, 1, INK);

  // 9. ĐẠI LỘ 2 LÀN XE XUYÊN SUỐT 540px (y: 78..97)
  R(c, 0, 78, WORLD_W, 19, PAL_TIME.road);
  for (var rx = 4; rx < WORLD_W; rx += 16) {
    R(c, rx, 87, 8, 1, PAL_TIME.roadLine);
  }
  R(c, 0, 97, WORLD_W, 1, INK);

  // 10. DẢI CỎ, LAN CAN BỜ SÔNG & MẶT NƯỚC SÀI GÒN XUYÊN SUỐT 540px (y: 98..112)
  R(c, 0, 98, WORLD_W, 5, PAL_TIME.grass);
  R(c, 0, 102, WORLD_W, 2, PAL_TIME.grassDark);
  // Lan can trắng ven sông
  R(c, 0, 99, WORLD_W, 1, '#FFFBF1');
  for (var px = 6; px < WORLD_W; px += 14) {
    R(c, px, 98, 2, 4, '#FFFBF1');
  }
  // Mặt sông Sài Gòn lấp lánh
  R(c, 0, 104, WORLD_W, 8, PAL_TIME.water);
  for (var wx = 8; wx < WORLD_W; wx += 22) {
    R(c, wx, 106, 7, 1, PAL_TIME.waterHi);
    R(c, wx + 10, 109, 5, 1, PAL_TIME.waterHi);
  }
}

function fbStatic() {
  var bg = document.createElement('canvas');
  bg.width = WORLD_W;
  bg.height = WORLD_H;
  var x = bg.getContext('2d');
  x.imageSmoothingEnabled = false;
  buildSeamlessPanorama(x);
  FB.bg = bg;
}

function fbSpark(x, cx, cy, r, col) {
  R(x, cx - r, cy, r * 2 + 1, 1, col);
  R(x, cx, cy - r, 1, r * 2 + 1, col);
}

function fbPlane(x, t) {
  var px = Math.round(((t * 18) % (WORLD_W + 90)) - 45);
  var py = 12 + Math.round(Math.sin(t * 0.9) * 2);
  R(x, px - 14, py + 1, 12, 1, 'rgba(255,255,255,0.55)');
  R(x, px, py, 16, 4, '#FFFFFF');
  R(x, px + 14, py + 1, 3, 2, '#FFFFFF');
  R(x, px, py - 3, 4, 4, '#0B5F8A');
  R(x, px + 1, py - 2, 2, 2, '#F4B93B'); // bông sen vàng Vietnam Airlines
  R(x, px + 6, py + 3, 6, 2, '#D0D6DC');
}

function fbBird(x, bx, by, t, ph) {
  var flap = Math.sin(t * 8 + ph) > 0;
  R(x, bx, by, 2, 1, INK);
  R(x, bx - 2, by + (flap ? -1 : 1), 2, 1, INK);
  R(x, bx + 2, by + (flap ? -1 : 1), 2, 1, INK);
}

function fbBus(x, bx, by, t, dir) {
  x.save();
  if (dir === -1) { x.translate(bx + 34, 0); x.scale(-1, 1); bx = 0; }
  R(x, bx, by - 11, 34, 11, INK);
  R(x, bx + 1, by - 10, 32, 9, '#2B8E6E'); // xe buýt xanh TP.HCM
  R(x, bx + 1, by - 5, 32, 2, '#FFFBF1');
  for (var i = 0; i < 4; i++) R(x, bx + 3 + i * 7, by - 9, 5, 4, '#DCEEFA');
  R(x, bx + 31, by - 4, 2, 2, '#FFE08A');
  E(x, bx + 7, by, 3, 3, INK); E(x, bx + 7, by, 1, 1, '#CFCFD8');
  E(x, bx + 26, by, 3, 3, INK); E(x, bx + 26, by, 1, 1, '#CFCFD8');
  x.restore();
}

function fbTaxi(x, bx, by, t, dir) {
  x.save();
  if (dir === -1) { x.translate(bx + 22, 0); x.scale(-1, 1); bx = 0; }
  R(x, bx, by - 7, 22, 7, INK);
  R(x, bx + 1, by - 6, 20, 5, '#FFFBF1');
  R(x, bx + 4, by - 10, 12, 4, INK);
  R(x, bx + 5, by - 9, 10, 3, '#DCEEFA');
  R(x, bx + 1, by - 3, 20, 1, '#2B8E6E');
  E(x, bx + 5, by, 2, 2, INK); E(x, bx + 17, by, 2, 2, INK);
  x.restore();
}

function fbRider(x, bx, by, t, pig, dir, hat) {
  x.save();
  if (dir === -1) { x.translate(bx + 14, 0); x.scale(-1, 1); bx = 0; }
  // Xe máy Việt Nam (ride) + người đội nón lá
  R(x, bx + 2, by - 4, 10, 3, '#E0452B');
  E(x, bx + 3, by, 2, 2, INK); E(x, bx + 11, by, 2, 2, INK);
  R(x, bx + 5, by - 9, 4, 5, '#4B6FA5');
  R(x, bx + 6, by - 11, 2, 2, '#F4C9A0');
  if (hat !== false) {
    R(x, bx + 4, by - 12, 6, 1, '#E8C56E'); // nón lá
    R(x, bx + 5, by - 13, 4, 1, '#F7DF94');
  }
  x.restore();
}

function fbDraw(t) {
  var x = FB.x;
  var dt = Math.min(0.05, FB.dt || 0.016);
  var rm = window.__openRoom ? window.__openRoom.state : null;
  if (window.__openRoom) {
    window.__openRoom.step(dt, performance.now());
  }
  var camX = rm ? Math.round(rm.camX) : 160;
  var camY = rm ? Math.round(rm.camY) : 0;

  x.save();
  x.translate(-camX, -camY);

  // 1. Vẽ toàn bộ Panorama liền mạch 540×112
  x.drawImage(FB.bg, 0, 0);

  // 2. Sao lấp lánh ban đêm
  if (PAL_TIME.mode === 'night') {
    for (var s = 0; s < 18; s++) {
      var sx = (s * 31 + 9) % WORLD_W;
      var sy = (s * 11 + 3) % 24;
      if (((t * 2 + s) % 3) < 2) R(x, sx, sy, 1, 1, '#FFFBF1');
    }
  }

  // 3. Mây trôi mượt xuyên suốt 540px (tạo hình tròn bồng bềnh giống Hình 5)
  var clouds = [
    [18, 12, 7], [95, 18, 10], [185, 10, 6], [275, 16, 9], [370, 11, 8], [465, 17, 11]
  ];
  clouds.forEach(function(cl) {
    var cx = ((cl[0] + t * cl[2]) % (WORLD_W + 40)) - 20;
    var cy = cl[1];
    R(x, cx, cy, 20, 4, PAL_TIME.cloudShade);
    R(x, cx + 2, cy - 3, 14, 5, PAL_TIME.cloudMain);
    R(x, cx + 5, cy - 5, 8, 3, PAL_TIME.cloudMain);
    R(x, cx + 12, cy - 2, 7, 3, PAL_TIME.cloudMain);
  });

  // 4. Máy bay Vietnam Airlines + Chim bay + Đèn chớp Landmark 81 & Bitexco
  fbPlane(x, t);
  fbBird(x, 290 + Math.round(Math.sin(t * 0.7) * 18), 16, t, 0);
  fbBird(x, 312 + Math.round(Math.cos(t * 0.6) * 14), 19, t, 1.5);
  if ((t * 1.6) % 1 < 0.55) {
    R(x, 398, 3, 2, 2, '#FF5A4D'); // Landmark 81 beacon
    R(x, 357, 15, 2, 2, '#FF5A4D'); // Bitexco beacon
  }

  // 5. Thuyền gỗ trôi êm trên sông Sài Gòn (y = 106)
  var boatX = Math.round(((t * 12) % (WORLD_W + 40)) - 20);
  R(x, boatX, 105, 18, 4, INK); R(x, boatX + 1, 106, 16, 2, '#8A5A34');
  R(x, boatX + 6, 102, 6, 3, '#FFFBF1');

  // 6. Giao thông Việt Nam chạy XUYÊN SUỐT 540px (không còn cắt cụt!)
  // Làn trên (đi sang Trái ←): Xe buýt xanh & Xe máy nón lá
  var busX = Math.round(WORLD_W + 40 - ((t * 24) % (WORLD_W + 90)));
  var motoX = Math.round(WORLD_W + 40 - (((t * 36) + 210) % (WORLD_W + 90)));
  fbBus(x, busX, 85, t, -1);
  fbRider(x, motoX, 86, t, false, -1, true);

  // Làn dưới (đi sang Phải →): Taxi & Xe máy nón lá 2
  var taxiX = Math.round(((t * 34 + 60) % (WORLD_W + 90)) - 40);
  var moto2X = Math.round(((t * 42 + 320) % (WORLD_W + 90)) - 40);
  fbTaxi(x, taxiX, 94, t, 1);
  fbRider(x, moto2X, 95, t, false, 1, true);

  // 7. Chú heo 24×20 đi dạo 2D trong Panorama
  if (rm) {
    var px = Math.round(rm.x - 12);
    var py = Math.round(rm.y - 20 + (rm.action === 'jump_joy' || rm.action === 'play_arcade' ? -Math.abs(Math.sin(t * 10)) * 4 : 0));
    hpx.clearRect(0, 0, 24, 20);
    drawPigSprite(hpx, {
      pose: rm.walking ? 'walk' : (rm.action === 'eat_snack' ? 'eat' : 'stand'),
      frame: rm.walking ? (((t * 6) | 0) % 2) : 0,
      happy: Boolean(rm.action) || FB.boost > 0,
      blink: (t % 4) < 0.15,
      tail: true
    });
    x.save();
    if (rm.facing < 0) {
      x.translate(px + 24, py);
      x.scale(-1, 1);
      x.drawImage(hp, 0, 0, 24, 20, 0, 0, 24, 20);
    } else {
      x.drawImage(hp, 0, 0, 24, 20, px, py, 24, 20);
    }
    x.restore();
  }

  // 8. Hạt lấp lánh khi chạm
  FB.spk = FB.spk.filter(function(s) { return (s.l -= 0.03) > 0; });
  FB.spk.forEach(function(s) {
    s.x += s.vx;
    s.y += s.vy;
    fbSpark(x, Math.round(s.x), Math.round(s.y), s.l > 0.5 ? 2 : 1, s.c);
  });
  if (FB.boost > 0) FB.boost = Math.max(0, FB.boost - dt);

  x.restore();

  if (window.__openRoom) {
    window.__openRoom.drawOverlays(x, performance.now());
  }

  R(x, 0, 0, FB.w, 1, INK);
  R(x, 0, FB.h - 1, FB.w, 1, INK);
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

  FB.c.addEventListener('pointerdown', function() {
    FB.boost = 1;
    var rm = window.__openRoom ? window.__openRoom.state : null;
    var sx = rm ? rm.x : 256;
    var sy = rm ? rm.y - 10 : 66;
    for (var i = 0; i < 10; i++) {
      var a = Math.random() * 6.28;
      FB.spk.push({
        x: sx,
        y: sy,
        vx: Math.cos(a) * 1.2,
        vy: Math.sin(a) * 1.2 - 0.3,
        l: 1,
        c: ['#FFFBF1', '#FFE08A', '#F9B8C4'][i % 3]
      });
    }
  });

  FB.last = performance.now();
  requestAnimationFrame(fbFrame);
}

${openRoomScript}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', funBanStart);
} else {
  funBanStart();
}

})();
</script>
</body>
</html>`, [openRoomScript]);

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
        {Boolean(roomToast) && (
          <View style={styles.roomToast} pointerEvents="none">
            <Text style={styles.roomToastText} numberOfLines={1}>
              {roomToast}
            </Text>
          </View>
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginBottom: 10,
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
  roomToast: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    backgroundColor: '#2B2118',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#F4B93B',
  },
  roomToastText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '800',
    fontSize: 11,
    color: '#FFFBF1',
  },
});
