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
        worldWidth: 1200,
        worldHeight: 164,
        viewWidth: 224,
        viewHeight: 116,
        walkBounds: { minX: 20, maxX: 892, minY: 74, maxY: 92 },
        initialX: 468,
        initialY: 84,
        initialCamX: 356,
        initialCamY: 24,
        speed: 52,
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
            y: 16,
            w: 340,
            h: 146,
            standX: 882,
            standY: 84,
            standFace: 1,
            actionType: 'play_arcade',
            bubbleText: `Bến Bạch Đằng · Cầu Ba Son & Cầu Đi Bộ · ${gameTickets} vé`,
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
var VW = 224, VH = 116, W = 1200, H = 164;

var PAL = {
  ink: '#2B2118', pig: '#F596A8', pigHi: '#FDBAC7', pigSh: '#D96D85',
  pigDk: '#B84E68', snout: '#FBC2CE', ear: '#DE7A90', cheek: '#F06A86',
  coin: '#F4B93B', coinHi: '#FBE08A'
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

function drawPigSprite(c, o) {
  var step = o.step || 0, blink = !!o.blink, mood = o.mood || 'happy', ear = o.ear || 0;
  var body = function(g) {
    R(g, 3, 12, 1, 2, PAL.pigSh); R(g, 2, 11, 1, 2, PAL.pig);
    R(g, 7, 15, 2, 3 - (step === 1 ? 1 : 0), PAL.pigSh);
    R(g, 14, 15, 2, 3 - (step === 2 ? 1 : 0), PAL.pigSh);
    E(g, 12, 12, 7.6, 5.2, PAL.pig);
    R(g, 7, 14, 10, 2, PAL.pigSh);
    R(g, 8, 8, 7, 2, PAL.pigHi);
    R(g, 9, 15, 2, 3 - (step === 2 ? 1 : 0), PAL.pig);
    R(g, 16, 15, 2, 3 - (step === 1 ? 1 : 0), PAL.pig);
    R(g, 10, 5 + ear, 3, 3, PAL.pig); R(g, 11, 6 + ear, 1, 2, PAL.ear);
    R(g, 15, 5 - ear, 3, 3, PAL.pig); R(g, 16, 6 - ear, 1, 2, PAL.ear);
    R(g, 18, 10, 4, 4, PAL.snout); R(g, 19, 10, 2, 1, PAL.pigHi);
    R(g, 11, 7, 4, 1, PAL.coin);
  };
  shape4(c, body, PAL.ink);
  R(c, 7, 17 - (step === 1 ? 1 : 0), 2, 1, PAL.ink);
  R(c, 9, 17 - (step === 2 ? 1 : 0), 2, 1, PAL.ink);
  R(c, 14, 17 - (step === 2 ? 1 : 0), 2, 1, PAL.ink);
  R(c, 16, 17 - (step === 1 ? 1 : 0), 2, 1, PAL.ink);
  R(c, 19, 11, 1, 2, PAL.pigDk); R(c, 21, 11, 1, 2, PAL.pigDk);
  R(c, 14, 12, 2, 1, PAL.cheek);
  if (blink) { R(c, 15, 10, 2, 1, PAL.ink); }
  else { R(c, 15, 9, 2, 2, PAL.ink); R(c, 15, 9, 1, 1, '#FFFFFF'); }
  if (mood === 'happy') { R(c, 16, 13, 2, 1, PAL.ink); }
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
    { x: 980, y: 9, w: 28, sp: 3.0 }
  ],
  vehicles: [
    // Làn 0 (trên, y ~ 97..106, đi sang trái dir: -1, xe to bự giãn cách thoáng)
    { kind: 'moto', lane: 0, dir: -1, x: 810, y: 104, w: 22, h: 16, sp: 36, col: '#E0452B', riderCol: '#2563EB', helmCol: '#FFFFFF' },
    { kind: 'police', lane: 0, dir: -1, x: 680, y: 101, w: 40, h: 20, sp: 38, col: '#FFFFFF' },
    { kind: 'bus', lane: 0, dir: -1, x: 520, y: 97, w: 66, h: 25, sp: 24, col: '#2563EB' },
    { kind: 'moto', lane: 0, dir: -1, x: 430, y: 105, w: 22, h: 16, sp: 40, col: '#16A34A', riderCol: '#F4B93B', helmCol: '#1E293B' },
    { kind: 'truck', lane: 0, dir: -1, x: 290, y: 98, w: 52, h: 24, sp: 26, col: '#0284C7' },
    { kind: 'car', lane: 0, dir: -1, x: 160, y: 101, w: 40, h: 20, sp: 34, col: '#DC2626' },
    { kind: 'moto', lane: 0, dir: -1, x: 50, y: 104, w: 22, h: 16, sp: 38, col: '#F4B93B', riderCol: '#EC4899', helmCol: '#FFFFFF' },
    // Làn 1 (dưới, y ~ 132..140, đi sang phải dir: 1, xe container & bus khổng lồ)
    { kind: 'container', lane: 1, dir: 1, x: 40, y: 132, w: 82, h: 28, sp: 20, col: '#EA580C' },
    { kind: 'moto', lane: 1, dir: 1, x: 175, y: 141, w: 22, h: 16, sp: 40, col: '#2563EB', riderCol: '#E0452B', helmCol: '#F4B93B' },
    { kind: 'car', lane: 1, dir: 1, x: 260, y: 138, w: 40, h: 20, sp: 34, col: '#1E3A8A' },
    { kind: 'truck', lane: 1, dir: 1, x: 390, y: 135, w: 52, h: 24, sp: 27, col: '#16A34A' },
    { kind: 'police', lane: 1, dir: 1, x: 520, y: 138, w: 40, h: 20, sp: 42, col: '#FFFFFF' },
    { kind: 'moto', lane: 1, dir: 1, x: 615, y: 141, w: 22, h: 16, sp: 42, col: '#FFFFFF', riderCol: '#16A34A', helmCol: '#E0452B' },
    { kind: 'bus', lane: 1, dir: 1, x: 700, y: 134, w: 66, h: 25, sp: 25, col: '#2563EB' }
  ],
  boats: [
    { kind: 'cruise', dir: 1, x: 910, y: 84, w: 68, h: 22, sp: 10.5, phase: 0.4 },
    { kind: 'waterbus', dir: -1, x: 1090, y: 112, w: 54, h: 20, sp: 14.5, phase: 1.8 },
    { kind: 'barge', dir: 1, x: 960, y: 134, w: 78, h: 24, sp: 7.2, phase: 3.1 }
  ]
};

function buildPigSpriteSet() {
  return {
    idle: mk(24, 20, function(g) { drawPigSprite(g, { step: 0, blink: false, mood: 'happy', ear: 0 }); }),
    step1: mk(24, 20, function(g) { drawPigSprite(g, { step: 1, blink: false, mood: 'happy', ear: 1 }); }),
    step2: mk(24, 20, function(g) { drawPigSprite(g, { step: 2, blink: false, mood: 'happy', ear: 0 }); }),
    blink: mk(24, 20, function(g) { drawPigSprite(g, { step: 0, blink: true, mood: 'happy', ear: 0 }); })
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
  // Bóng tiếp xúc dưới chân Heo Mascot
  E(ctx, px, py + 1, 8, 2.5, 'rgba(43,33,24,0.30)');
  ctx.save();
  ctx.translate(px, py - 18 - bounce);
  if (st.facing < 0) {
    ctx.scale(-1, 1);
  }
  ctx.drawImage(sp, -12, 0);
  ctx.restore();
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

  // Cập nhật 6 loại xe to bự trên đại lộ (x: -95..880)
  for (var vi = 0; vi < FB.vehicles.length; vi++) {
    var v = FB.vehicles[vi];
    v.x += v.dir * v.sp * dt * (1 + FB.boost * 0.4);
    if (v.dir > 0 && v.x > 880) v.x = -v.w - 18;
    if (v.dir < 0 && v.x < -v.w - 20) v.x = 880;
  }

  // Cập nhật 3 tàu thuyền khổng lồ trên Sông Bạch Đằng (x: 860..1220)
  for (var bi = 0; bi < FB.boats.length; bi++) {
    var b = FB.boats[bi];
    b.x += b.dir * b.sp * dt;
    if (b.dir > 0 && b.x > 1215) b.x = 874 - b.w;
    if (b.dir < 0 && b.x < 874 - b.w) b.x = 1210;
  }

  var eng = window.__openRoom;
  var cv = document.getElementById('funCv');
  if (!cv || !FB.bg) { requestAnimationFrame(fbFrame); return; }
  var ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  if (eng) eng.step(dt, now);
  var camX = eng ? Math.round(eng.state.camX) : 356;
  var camY = eng ? Math.round(eng.state.camY) : 24;

  ctx.save();
  ctx.translate(-camX, -camY);

  // 1. Nền tĩnh 1200×164
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
  fbSpark(ctx, 251, 3, FB.t); // Đèn đỉnh Bitexco
  fbSpark(ctx, 797, 1, FB.t + 1.2); // Đèn đỉnh Landmark 81

  // 3. Chú Heo Mascot 24×20 đi dạo khám phá trên vỉa hè rộng (y: 74..92)
  if (eng) drawMascotPig(ctx, eng.state, FB.t);

  // 4. Giao thông 2 làn xe to bự + CSGT áo vàng 12×22 & Sông Bạch Đằng (3 tàu lớn)
  drawSaigonLiveTrafficAndRiver(ctx, FB.t, FB.pal, FB.vehicles, FB.boats);

  // 5. Vòng chạm, bong bóng lời thoại & 4 mũi tên chỉ thị biên
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
