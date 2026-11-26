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
import { buildSaigonPanoramaArtScript } from './hub/saigonPanoramaArt';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface EntertainmentBannerWebViewProps {
  onPressBanner?: () => void;
  onEnterCafe?: () => void;
  onEnterMarket?: () => void;
  onEnterCathedral?: () => void;
  onEnterPagoda?: () => void;
}

/**
 * Banner Panorama Đại Lộ Sài Gòn & Bến Bạch Đằng (1160×128 trên khung nhìn 224×108 — Quyết định 221)
 * - 1 Offscreen Canvas duy nhất (0 vết cắt ghép): Skyline xa Bitexco & Landmark 81 + 7 công trình mặt tiền + Đại lộ 2 làn 6 loại xe & CSGT áo vàng + Bến Bạch Đằng (Cầu Đi Bộ, Cầu Ba Son, tàu thuyền lớn).
 * - Tự động đổi 3 sắc trời theo giờ thực tế (Sáng nắng xanh tươi / Chiều hoàng hôn / Tối đèn phố).
 * - Tích hợp pixelOpenRoomEngine 2D (Tap-to-Walk + Drag-to-Pan + 8 Hotspot Actions, giữ nguyên 4 cổng nội thất fastDash).
 */
export const EntertainmentBannerWebView: React.FC<EntertainmentBannerWebViewProps> = ({
  onPressBanner,
  onEnterCafe,
  onEnterMarket,
  onEnterCathedral,
  onEnterPagoda,
}) => {
  const { tokens } = useTheme();
  const webViewRef = useRef<any>(null);
  const { gameTickets, pigFood, streakDays } = useGamificationStore();
  const [roomToast, setRoomToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enterPortalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showRoomToast = (text: string) => {
    setRoomToast(text);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setRoomToast(null), 2600);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (enterPortalTimerRef.current) clearTimeout(enterPortalTimerRef.current);
    };
  }, []);

  const handleRoomPayload = (d: any) => {
    if (!d) return;
    if (d.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (d.type === 'ROOM_ACTION') {
      if (d.text) showRoomToast(String(d.text));
      const triggerPortal = (cb?: () => void) => {
        if (!cb) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (enterPortalTimerRef.current) clearTimeout(enterPortalTimerRef.current);
        enterPortalTimerRef.current = setTimeout(() => cb(), 120);
      };
      if (d.id === 'saigon_cafe' && d.userTriggered && onEnterCafe) triggerPortal(onEnterCafe);
      else if (d.id === 'ben_thanh_notre' && d.userTriggered && onEnterMarket) triggerPortal(onEnterMarket);
      else if (d.id === 'notre_dame_gate' && d.userTriggered && onEnterCathedral) triggerPortal(onEnterCathedral);
      else if (d.id === 'pagoda_gate' && d.userTriggered && onEnterPagoda) triggerPortal(onEnterPagoda);
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
  }, [onEnterCafe, onEnterMarket, onEnterCathedral, onEnterPagoda]);

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
        worldWidth: 1360,
        worldHeight: 164,
        viewWidth: 224,
        viewHeight: 116,
        walkBounds: { minX: 20, maxX: 1340, minY: 66, maxY: 146 },
        initialX: 468,
        initialY: 112,
        initialCamX: 356,
        initialCamY: 28,
        speed: 62,
        hotspots: [
          {
            id: 'pho_old_quarter',
            x: 8,
            y: 18,
            w: 88,
            h: 56,
            standX: 52,
            standY: 82,
            standFace: -1,
            actionType: 'eat_snack',
            bubbleText: `Quán Phở Bò nóng hổi · Kho cám: ${pigFood} cám`,
          },
          {
            id: 'saigon_cafe',
            x: 106,
            y: 16,
            w: 98,
            h: 58,
            standX: 155,
            standY: 82,
            standFace: 1,
            actionType: 'sip_coffee',
            fastDash: true,
            bubbleText: 'Đang bước vào Tiệm CAFE...',
          },
          {
            id: 'adidas_store',
            x: 214,
            y: 18,
            w: 100,
            h: 56,
            standX: 264,
            standY: 82,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: 'Cửa hàng Adidas 3 sọc · Diện đồ thể thao cực chất!',
          },
          {
            id: 'notre_dame_gate',
            x: 324,
            y: 6,
            w: 80,
            h: 68,
            standX: 362,
            standY: 82,
            standFace: 1,
            actionType: 'look_window',
            fastDash: true,
            bubbleText: 'Đang bước vào Nhà Thờ Đức Bà...',
          },
          {
            id: 'ben_thanh_notre',
            x: 414,
            y: 8,
            w: 112,
            h: 66,
            standX: 470,
            standY: 82,
            standFace: 1,
            actionType: 'look_window',
            fastDash: true,
            bubbleText: 'Đang bước vào Chợ Bến Thành...',
          },
          {
            id: 'thong_nhat_stadium',
            x: 536,
            y: 8,
            w: 150,
            h: 66,
            standX: 611,
            standY: 82,
            standFace: 1,
            actionType: 'jump_joy',
            bubbleText: `SVĐ Thống Nhất rực đèn · Chuỗi ${streakDays} ngày cực sung!`,
          },
          {
            id: 'pagoda_gate',
            x: 696,
            y: 8,
            w: 144,
            h: 66,
            standX: 797,
            standY: 82,
            standFace: 1,
            actionType: 'look_window',
            fastDash: true,
            bubbleText: 'Đang bước vào Ngôi Chùa cổ kính...',
          },
          {
            id: 'bach_dang_wharf',
            x: 856,
            y: 44,
            w: 36,
            h: 48,
            standX: 874,
            standY: 82,
            standFace: 1,
            actionType: 'play_arcade',
            bubbleText: `Bến Bạch Đằng · Trạm Waterbus · ${gameTickets} vé`,
          },
          {
            id: 'pedestrian_bridge',
            x: 892,
            y: 48,
            w: 374,
            h: 34,
            standX: 1080,
            standY: 70,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: 'Cầu Đi Bộ qua sông Sài Gòn · Chỉ dành cho người đi bộ!',
          },
          {
            id: 'ba_son_bridge',
            x: 892,
            y: 94,
            w: 374,
            h: 44,
            standX: 1080,
            standY: 112,
            standFace: 1,
            actionType: 'jump_joy',
            bubbleText: 'Cầu Ba Son dây văng · Chú Heo vi vu xe máy sang Thủ Thiêm!',
          },
          {
            id: 'thu_thiem_park',
            x: 1268,
            y: 44,
            w: 90,
            h: 110,
            standX: 1310,
            standY: 78,
            standFace: -1,
            actionType: 'jump_joy',
            bubbleText: 'Công viên Thủ Thiêm bên kia sông · Gió mát quá!',
          },
        ],
      }),
    [pigFood, streakDays, gameTickets]
  );

  const artScript = useMemo(() => buildSaigonPanoramaArtScript(), []);

  const htmlContent = useMemo(() => `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #2B2118; }
  canvas {
    display: block; width: 100%; height: 100%;
    image-rendering: pixelated;
    image-rendering: -webkit-crisp-edges;
    image-rendering: crisp-edges;
    touch-action: none;
    cursor: grab;
  }
  canvas:active { cursor: grabbing; }
</style>
</head>
<body>
<canvas id="funCv" width="224" height="116"></canvas>
<script>
(function(){
var VW = 224, VH = 116, W = 1360, H = 164;

var PAL = {
  ink: '#2B2118', k: '#2B2118', p: '#F596A8', pig: '#F596A8',
  h: '#FDBAC7', pigHi: '#FDBAC7', s: '#D96D85', pigSh: '#D96D85',
  pigDk: '#B84E68', n: '#FBC2CE', snout: '#FBC2CE', ear: '#DE7A90',
  cheek: '#F06A86', w: '#FFFFFF', coin: '#F4B93B', coinHi: '#FBE08A'
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
  var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  var x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
  if (fn) fn(x);
  return cv;
}
function shape4(c, draw, ink) {
  var b = mk(c.canvas.width, c.canvas.height);
  var bc = b.getContext('2d'); bc.imageSmoothingEnabled = false;
  draw(bc);
  var d = bc.getImageData(0, 0, b.width, b.height).data;
  var bw = b.width, bh = b.height;
  var hit = function(x, y) { return x >= 0 && y >= 0 && x < bw && y < bh && d[(y * bw + x) * 4 + 3] > 20; };
  c.fillStyle = ink || PAL.ink;
  for (var y = 0; y < bh; y++) {
    for (var x = 0; x < bw; x++) {
      if (!hit(x, y) && (hit(x - 1, y) || hit(x + 1, y) || hit(x, y - 1) || hit(x, y + 1))) {
        c.fillRect(x, y, 1, 1);
      }
    }
  }
  c.drawImage(b, 0, 0);
}

/* Port 1:1 hàm shape() & drawPigSprite() chuẩn Tab Vườn (PixelGardenWebView.tsx — thanh thoát, hết múp) */
function shape(c, rows, fill, ox, oy) {
  ox = ox || 0; oy = oy || 0;
  var pts = {}, i, r, x;
  for (i = 0; i < rows.length; i++) {
    r = rows[i];
    for (x = r[1]; x <= r[2]; x++) pts[x + ',' + r[0]] = 1;
  }
  c.fillStyle = PAL.k;
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

function drawPigSprite(c, o) {
  var ox = 1, oy = 3;
  var walk = !!(o.step && o.step > 0);
  var frame = o.step === 1 ? 0 : 1;
  var bob = (walk && frame === 1) ? -1 : 0;
  var bodyDy = bob, headDy = bob, headDx = 0;
  // 4 chân mảnh chuẩn Tab Vườn
  var raised = function(i) { return walk && (frame === 0 ? (i === 1 || i === 2) : (i === 0 || i === 3)); };
  var legs = [[3, PAL.p], [9, PAL.p], [6, PAL.s], [12, PAL.s]];
  var order = [2, 3, 0, 1];
  for (var li = 0; li < order.length; li++) {
    var idx = order[li], lx = legs[idx][0];
    var rows = [[11, lx, lx + 1], [12, lx, lx + 1], [13, lx, lx + 1]];
    if (!raised(idx)) rows.push([14, lx, lx + 1]);
    shape(c, rows, legs[idx][1], ox, oy);
  }
  // Đuôi & thân heo thon gọn 1:1 Tab Vườn
  shape(c, [[4,0,1],[5,0,0],[6,0,1]], PAL.p, ox, oy + bodyDy);
  shape(c, [[4,4,12],[5,3,13],[6,2,14],[7,2,14],[8,2,14],[9,2,14],[10,2,14],[11,3,13]], PAL.p, ox, oy + bodyDy);
  R(c, ox + 5, oy + bodyDy + 5, 3, 1, PAL.h);
  R(c, ox + 7, oy + bodyDy + 4, 3, 1, PAL.coin); // Khe tiền vàng trên lưng
  // Đầu tròn tách biệt + tai vểnh + mõm nhô
  var hx = ox + headDx, hy = oy + headDy;
  var hp = function(x, y, col) { R(c, hx + x, hy + y, 1, 1, col); };
  shape(c, [[6,20,21],[7,20,21],[8,20,21]], PAL.n, hx, hy);
  shape(c, [[3,14,18],[4,13,19],[5,13,19],[6,13,19],[7,13,19],[8,13,19],[9,14,18]], PAL.p, hx, hy);
  shape(c, [[1,15,16],[2,14,17]], PAL.p, hx, hy);
  R(c, hx + 14, hy + 3, 5, 1, PAL.p);
  hp(16, 2, PAL.s);
  R(c, hx + 14, hy + 4, 2, 1, PAL.h);
  hp(21, 6, PAL.k); hp(21, 8, PAL.k);
  if (o.blink) {
    hp(16, 6, PAL.k); hp(17, 6, PAL.k);
  } else {
    R(c, hx + 16, hy + 5, 2, 2, PAL.k);
    hp(16, 5, PAL.w);
  }
}

${artScript}

function fbSky(c, pal) {
  var bandH = Math.ceil(66 / pal.sky.length);
  for (var i = 0; i < pal.sky.length; i++) {
    R(c, 0, i * bandH, W, bandH + 1, pal.sky[i]);
  }
  if (pal.mode === 'night') {
    for (var s = 0; s < 36; s++) {
      var sx = (s * 97 + 19) % W, sy = 3 + ((s * 31) % 28);
      R(c, sx, sy, 1, 1, s % 3 === 0 ? '#FFE891' : '#FFFFFF');
    }
  }
}

function fbStatic(pal) {
  return mk(W, H, function(c) {
    fbSky(c, pal);
    drawFarSkyline(c, pal, W);
    drawSaigonLandmarks(c, pal);
    drawAvenueAndSidewalk(c, pal);
    drawBachDangRiverStatic(c, pal);
  });
}

function fbPlane(c, x, y, pal) {
  x = Math.round(x); y = Math.round(y);
  R(c, x, y + 2, 11, 2, '#FFFFFF');
  R(c, x + 2, y, 2, 2, '#1D5AA6');
  R(c, x + 3, y + 1, 1, 1, '#F4B93B');
  R(c, x + 5, y + 3, 3, 1, '#CBD5E1');
  if (pal.mode !== 'day') R(c, x + 11, y + 2, 1, 1, '#EF4444');
}

function fbBird(c, x, y, t) {
  var flap = Math.sin(t * 7 + x * 0.2) > 0 ? 1 : 0;
  R(c, x, y, 1, 1, '#2B2118');
  R(c, x - 2, y - flap, 2, 1, '#2B2118');
  R(c, x + 1, y - flap, 2, 1, '#2B2118');
}

function fbRider(c, x, y, col) {
  R(c, x, y, 3, 3, col || '#8EC9E8');
}

function fbSpark(c, x, y, t) {
  if (Math.sin(t * 5 + x) > 0.3) R(c, x, y, 2, 2, '#FFF7CC');
}

var FB = {
  t: 0, last: 0, boost: 0, hour: new Date().getHours(), pal: null, bg: null,
  pigSprites: null,
  planeX: 40,
  clouds: [
    { x: 40, y: 8, w: 26, sp: 3.5 },
    { x: 220, y: 12, w: 32, sp: 2.8 },
    { x: 440, y: 7, w: 28, sp: 3.2 },
    { x: 690, y: 11, w: 30, sp: 2.5 },
    { x: 980, y: 9, w: 28, sp: 3.0 },
    { x: 1240, y: 12, w: 28, sp: 2.6 }
  ],
  pedestrians: [
    { x: 920, dir: 1, sp: 8, shirt: '#E0452B', hair: '#2B2118' },
    { x: 990, dir: -1, sp: 7, shirt: '#2563EB', hair: '#4A3222' },
    { x: 1050, dir: 1, sp: 9, shirt: '#F4B93B', hair: '#2B2118' },
    { x: 1120, dir: -1, sp: 8.5, shirt: '#EC4899', hair: '#1E293B' },
    { x: 1185, dir: 1, sp: 7.5, shirt: '#16A34A', hair: '#2B2118' },
    { x: 1240, dir: -1, sp: 9, shirt: '#8B5CF6', hair: '#3B2618' }
  ],
  vehicles: [
    // Làn 0 (trên, đi sang trái dir: -1). Xe máy/xe hơi/xe tải chạy xuyên qua Cầu Ba Son sang Thủ Thiêm (canBridge: true)
    { kind: 'moto', lane: 0, dir: -1, x: 1280, y: 101, w: 22, h: 16, sp: 34, canBridge: true, col: '#E0452B', riderCol: '#2563EB', helmCol: '#FFFFFF' },
    { kind: 'car', lane: 0, dir: -1, x: 1120, y: 98, w: 40, h: 20, sp: 30, canBridge: true, col: '#F8FAFC' },
    { kind: 'truck', lane: 0, dir: -1, x: 950, y: 96, w: 52, h: 24, sp: 24, canBridge: true, col: '#0284C7' },
    { kind: 'police', lane: 0, dir: -1, x: 760, y: 101, w: 40, h: 20, sp: 34, canBridge: false, col: '#FFFFFF' },
    { kind: 'bus', lane: 0, dir: -1, x: 580, y: 97, w: 66, h: 25, sp: 24, canBridge: false, col: '#2563EB' },
    { kind: 'moto', lane: 0, dir: -1, x: 360, y: 104, w: 22, h: 16, sp: 36, canBridge: true, col: '#16A34A', riderCol: '#F4B93B', helmCol: '#1E293B' },
    { kind: 'car', lane: 0, dir: -1, x: 170, y: 101, w: 40, h: 20, sp: 32, canBridge: true, col: '#DC2626' },
    // Làn 1 (dưới, đi sang phải dir: 1). Xe máy/xe hơi/xe tải chạy qua Cầu Ba Son (canBridge: true), Container/Bus chạy Đại lộ
    { kind: 'container', lane: 1, dir: 1, x: 30, y: 132, w: 82, h: 28, sp: 20, canBridge: false, col: '#EA580C' },
    { kind: 'moto', lane: 1, dir: 1, x: 210, y: 136, w: 22, h: 16, sp: 36, canBridge: true, col: '#2563EB', riderCol: '#E0452B', helmCol: '#F4B93B' },
    { kind: 'car', lane: 1, dir: 1, x: 340, y: 134, w: 40, h: 20, sp: 32, canBridge: true, col: '#1E3A8A' },
    { kind: 'police', lane: 1, dir: 1, x: 530, y: 136, w: 40, h: 20, sp: 36, canBridge: false, col: '#FFFFFF' },
    { kind: 'bus', lane: 1, dir: 1, x: 680, y: 134, w: 66, h: 25, sp: 24, canBridge: false, col: '#2563EB' },
    { kind: 'truck', lane: 1, dir: 1, x: 960, y: 118, w: 52, h: 24, sp: 25, canBridge: true, col: '#16A34A' },
    { kind: 'car', lane: 1, dir: 1, x: 1140, y: 119, w: 40, h: 20, sp: 31, canBridge: true, col: '#94A3B8' }
  ],
  boats: [
    { kind: 'cruise', dir: 1, x: 920, y: 139, w: 68, h: 22, sp: 10.5, phase: 0.4 },
    { kind: 'waterbus', dir: -1, x: 1150, y: 142, w: 54, h: 20, sp: 14.5, phase: 1.8 },
    { kind: 'barge', dir: 1, x: 1040, y: 140, w: 78, h: 24, sp: 7.2, phase: 3.1 }
  ]
};

function buildPigSpriteSet() {
  return {
    idle: mk(24, 20, function(g) { drawPigSprite(g, { step: 0, blink: false, mood: 'happy' }); }),
    step1: mk(24, 20, function(g) { drawPigSprite(g, { step: 1, blink: false, mood: 'happy' }); }),
    step2: mk(24, 20, function(g) { drawPigSprite(g, { step: 2, blink: false, mood: 'happy' }); }),
    blink: mk(24, 20, function(g) { drawPigSprite(g, { step: 0, blink: true, mood: 'happy' }); })
  };
}

function drawMascotPig(ctx, st, t) {
  if (!FB.pigSprites) return;
  var px = Math.round(st.x);
  var py = Math.round(st.y);
  var bounce = st.walking
    ? Math.round(Math.abs(Math.sin(t * 11)) * 1.5)
    : (st.action ? Math.round(Math.abs(Math.sin(t * 7)) * 2.5) : 0);
  var sp = FB.pigSprites.idle;
  if (st.walking) {
    sp = (Math.floor(t * 10) % 2 === 0) ? FB.pigSprites.step1 : FB.pigSprites.step2;
  } else if ((t % 3.6) < 0.14) {
    sp = FB.pigSprites.blink;
  }
  E(ctx, px, py + 1, 7.5, 2.2, 'rgba(43,33,24,0.30)');
  ctx.save();
  ctx.translate(px, py - 17 - bounce);
  if (st.facing < 0) ctx.scale(-1, 1);
  ctx.drawImage(sp, -12, 0);
  ctx.restore();
}

/* Chú Heo 1:1 Tab Vườn đội mũ bảo hiểm vàng-trắng lái xe máy chạy trên phố & Cầu Ba Son */
function drawPigOnMoto(ctx, st, t, isDark) {
  if (!FB.pigSprites) return;
  var px = Math.round(st.x);
  var py = Math.round(st.y);
  var vib = st.walking ? (Math.floor(t * 16) % 2) : 0;
  var sp = ((t % 3.6) < 0.14) ? FB.pigSprites.blink : FB.pigSprites.idle;

  // Bóng xe máy trên mặt đường
  R(ctx, px - 13, py + 1, 26, 3, 'rgba(18,14,10,0.42)');

  ctx.save();
  ctx.translate(px, py + vib);
  if (st.facing < 0) ctx.scale(-1, 1);

  // Khói ống pô trắng mini khi đang chạy
  if (st.walking) {
    var puff = (t * 4) % 1;
    ctx.globalAlpha = (1 - puff) * 0.55;
    E(ctx, -14 - puff * 9, -2 - puff * 4, 2.2, 1.8, '#FFFDF7');
    ctx.globalAlpha = 1;
  }

  // 2 Bánh xe máy có vành bạc
  drawWheel(ctx, -8, -2, 3.6);
  drawWheel(ctx, 9, -2, 3.6);

  // Khung & yếm xe máy Việt Nam (đỏ-kem nổi bật)
  R(ctx, -11, -8, 22, 6, '#2B2118');
  R(ctx, -10, -7, 20, 4, '#E0452B');
  R(ctx, -10, -7, 11, 2, '#2B2118'); // Yên da đen
  R(ctx, 6, -12, 5, 8, '#2B2118');
  R(ctx, 7, -11, 3, 6, '#FFF6E5'); // Yếm trước màu kem
  R(ctx, 8, -14, 3, 3, '#3B424C'); // Ghi-đông & gương
  R(ctx, 11, -10, 2, 3, '#FEF08A'); // Đèn pha
  R(ctx, -12, -7, 2, 2, '#EF4444'); // Đèn hậu
  if (isDark) R(ctx, 13, -11, 10, 5, 'rgba(255,232,140,0.36)');

  // Chú Heo Mascot 1:1 chuẩn Tab Vườn ngồi trên yên xe
  ctx.drawImage(sp, -13, -22);

  // Mũ bảo hiểm vàng-trắng có kính chắn gió đội ngay trên đầu chú Heo
  R(ctx, 0, -21, 10, 5, '#2B2118');
  R(ctx, 1, -20, 8, 4, '#F4B93B'); // Nón bảo hiểm vàng rực
  R(ctx, 2, -20, 6, 1, '#FFE891'); // Highlight sáng
  R(ctx, 1, -18, 8, 1, '#FFFFFF'); // Sọc trắng thể thao
  R(ctx, 7, -18, 4, 3, '#BAE6FD'); // Kính chắn gió trong xanh

  ctx.restore();
}

/* Thuật toán Tránh Va Chạm 2 Lớp (0% va chạm giữa các xe & chú Heo lái xe máy) */
function stepTrafficSafe(dt, pigSt) {
  var pigRiding = !!(pigSt && pigSt.y >= 94);
  var pigX = pigSt ? pigSt.x : -999;
  var pigY = pigSt ? pigSt.y : -999;

  // Lớp 1: Các xe cộ trên Đại lộ & Cầu Ba Son tự giữ khoảng cách an toàn, không bao giờ đâm/đè nhau hay đụng chú Heo
  for (var i = 0; i < FB.vehicles.length; i++) {
    var v = FB.vehicles[i];
    // Tự điều chỉnh y mượt khi chạy vào mặt Cầu Ba Son (x: 880..1270)
    if (v.canBridge) {
      var targetY = (v.x > 870 && v.x < 1275)
        ? (v.lane === 0 ? 97 : 118)
        : (v.lane === 0 ? 100 : 134);
      v.y += (targetY - v.y) * Math.min(1, dt * 6);
    }

    var curSp = v.sp * (1 + FB.boost * 0.35);
    var safeGap = 24;

    // Tránh va chạm với các xe khác cùng làn
    for (var j = 0; j < FB.vehicles.length; j++) {
      if (i === j) continue;
      var o = FB.vehicles[j];
      if (o.lane !== v.lane) continue;
      var distAhead = v.dir > 0 ? (o.x - (v.x + v.w)) : (v.x - (o.x + o.w));
      if (distAhead >= -4 && distAhead < safeGap) {
        curSp = Math.min(curSp, Math.max(0, (distAhead / safeGap) * o.sp * 0.7));
      }
    }

    // Tránh va chạm với chú Heo đang lái xe máy (nhường đường 100%)
    if (pigRiding) {
      var pigLeft = pigX - 16, pigRight = pigX + 16;
      var sameBand = Math.abs((v.y + v.h * 0.6) - pigY) < 18;
      if (sameBand) {
        var gapToPig = v.dir > 0 ? (pigLeft - (v.x + v.w)) : (v.x - pigRight);
        if (gapToPig >= -6 && gapToPig < 34) {
          curSp = 0; // Phanh dừng lịch sự nhường chú Heo
        }
      }
    }

    v.x += v.dir * curSp * dt;
    var maxRight = v.canBridge ? 1390 : 875;
    if (v.dir > 0 && v.x > maxRight) v.x = -v.w - 24;
    if (v.dir < 0 && v.x < -v.w - 24) v.x = maxRight;
  }

  // Lớp 2: Chú Heo chủ động lách khe an toàn trong lòng đường nếu đang chạy sát 1 xe cùng làn
  if (pigRiding && pigSt) {
    for (var k = 0; k < FB.vehicles.length; k++) {
      var veh = FB.vehicles[k];
      var overlapX = (pigSt.x + 15 > veh.x) && (pigSt.x - 15 < veh.x + veh.w);
      var vehCenterY = veh.y + veh.h * 0.65;
      var dy = pigSt.y - vehCenterY;
      if (overlapX && Math.abs(dy) < 18) {
        var pushDir = dy >= 0 ? 1 : -1;
        pigSt.y = Math.max(96, Math.min(148, pigSt.y + pushDir * 48 * dt));
      }
    }
  }
}

function fbFrame(now) {
  var dt = Math.min(0.05, (now - FB.last) / 1000);
  FB.last = now;
  FB.t += dt * (1 + FB.boost * 1.1);
  FB.boost = Math.max(0, FB.boost - dt * 1.4);

  // Cập nhật mây & máy bay
  FB.planeX += dt * 16;
  if (FB.planeX > W + 30) FB.planeX = -30;
  for (var ci = 0; ci < FB.clouds.length; ci++) {
    FB.clouds[ci].x += FB.clouds[ci].sp * dt;
    if (FB.clouds[ci].x > W + 40) FB.clouds[ci].x = -40;
  }

  // Cập nhật 6 người đi bộ tản bộ trên Cầu Đi Bộ (x: 896..1260)
  for (var pi = 0; pi < FB.pedestrians.length; pi++) {
    var pd = FB.pedestrians[pi];
    pd.x += pd.dir * pd.sp * dt;
    if (pd.x > 1258) { pd.x = 1258; pd.dir = -1; }
    if (pd.x < 896) { pd.x = 896; pd.dir = 1; }
  }

  // Cập nhật 3 tàu thuyền khổng lồ chạy dưới gầm Cầu Ba Son (x: 880..1270)
  for (var bi = 0; bi < FB.boats.length; bi++) {
    var b = FB.boats[bi];
    b.x += b.dir * b.sp * dt;
    if (b.dir > 0 && b.x > 1272) b.x = 890 - b.w;
    if (b.dir < 0 && b.x < 888 - b.w) b.x = 1268;
  }

  var eng = window.__openRoom;
  var cv = document.getElementById('funCv');
  if (!cv || !FB.bg) { requestAnimationFrame(fbFrame); return; }
  var ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  if (eng) eng.step(dt, now);
  // Cập nhật giao thông tránh va chạm 0% với chú Heo
  stepTrafficSafe(dt, eng ? eng.state : null);

  var camX = eng ? Math.round(eng.state.camX) : 356;
  var camY = eng ? Math.round(eng.state.camY) : 28;
  var isDark = FB.pal.mode !== 'day';

  ctx.save();
  ctx.translate(-camX, -camY);

  // 1. Nền tĩnh 1360×164
  ctx.drawImage(FB.bg, 0, 0);

  // 2. Mây trôi, máy bay & đàn chim
  for (var c2 = 0; c2 < FB.clouds.length; c2++) {
    var cl = FB.clouds[c2];
    E(ctx, cl.x, cl.y, cl.w * 0.45, 4, FB.pal.cloud);
    E(ctx, cl.x + 6, cl.y + 1, cl.w * 0.35, 3, FB.pal.cloudSh);
  }
  fbPlane(ctx, FB.planeX, 7, FB.pal);
  fbBird(ctx, (FB.t * 14 + 120) % W, 16 + Math.sin(FB.t * 2) * 2, FB.t);
  fbBird(ctx, (FB.t * 14 + 132) % W, 19 + Math.cos(FB.t * 2) * 2, FB.t + 0.5);
  fbSpark(ctx, 251, 3, FB.t);
  fbSpark(ctx, 797, 1, FB.t + 1.2);

  // 3. Giao thông 2 làn + Cầu Ba Son + Cầu Đi Bộ + Chú Heo (tự động chuyển Lái xe máy / Đi bộ) + Tàu thuyền
  var drawPigSmart = function() {
    if (!eng) return;
    if (eng.state.y >= 94) {
      drawPigOnMoto(ctx, eng.state, FB.t, isDark);
    } else {
      drawMascotPig(ctx, eng.state, FB.t);
    }
  };
  drawSaigonLiveTrafficAndRiver(
    ctx,
    FB.t,
    FB.pal,
    FB.vehicles,
    FB.boats,
    FB.pedestrians,
    eng ? eng.state : null,
    drawPigSmart
  );

  // 4. Vòng chạm, bong bóng lời thoại & 4 mũi tên chỉ thị biên
  ctx.restore();
  if (eng) {
    eng.drawOverlays(ctx, now);
  }

  requestAnimationFrame(fbFrame);
}

function funBanStart() {
  FB.hour = new Date().getHours();
  FB.pal = fbTimePalette(FB.hour);
  FB.bg = fbStatic(FB.pal);
  FB.pigSprites = buildPigSpriteSet();
  var cv = document.getElementById('funCv');
  if (cv) {
    cv.addEventListener('pointerdown', function() { FB.boost = 1; }, { passive: true });
  }
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
</html>`, [openRoomScript, artScript]);

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
    aspectRatio: 224 / 116,
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
