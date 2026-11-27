import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildOpenRoomEngineScript } from '../pixel/pixelOpenRoomEngine';
import { buildVnPixelKitPrimitivesScript } from '../pixel/vnPixelArtKit';
import { buildAdidasInteriorArtScript } from './adidas/adidasInteriorArt';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface AdidasStoreBannerWebViewProps {
  onExitAdidas?: () => void;
}

/**
 * Cửa Hàng Adidas Hội An Heritage 2 Tầng Toàn Màn Hình (640 × 560 — Quyết định 228)
 * Dày đặc 80% không gian với đầy đủ: Khu Bóng Đá (thảm cỏ xanh, giày đinh Predator/F50, áo đấu, bóng đá),
 * Khu Chạy Bộ (giày Boost cong, áo thun, quần short), Khu Polo & Quần 3 sọc, Tường Originals & Dép Adilette,
 * Phụ kiện (Balo, Mũ, Hộp giày), 7 Mannequin dáng đẹp, 8 Đèn lồng Hội An & 2 Nhân viên Adidas.
 */
export const AdidasStoreBannerWebView: React.FC<AdidasStoreBannerWebViewProps> = ({
  onExitAdidas,
}) => {
  const webViewRef = useRef<any>(null);
  const [roomToast, setRoomToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showRoomToast = (text: string) => {
    setRoomToast(text);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setRoomToast(null), 2600);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const handleRoomPayload = (d: any) => {
    if (!d) return;
    if (d.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (d.type === 'ROOM_ACTION') {
      if (d.text) showRoomToast(String(d.text));
      if (d.id === 'exit_adidas' && d.userTriggered && onExitAdidas) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        exitTimerRef.current = setTimeout(() => onExitAdidas(), 140);
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
  }, [onExitAdidas]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleRoomPayload(data);
    } catch (_e) {}
  };

  const openRoomScript = useMemo(
    () =>
      buildOpenRoomEngineScript({
        canvasId: 'adidasCv',
        worldWidth: 640,
        worldHeight: 560,
        viewWidth: 260,
        viewHeight: 380,
        walkBounds: { minX: 28, maxX: 612, minY: 74, maxY: 544 },
        initialX: 320,
        initialY: 468,
        initialCamX: 190,
        initialCamY: 165,
        speed: 60,
        obstacles: [
          // Tầng 2 Trái (Khu Bóng Đá: 3 sào áo đấu/short/polo + giá bóng đá)
          { x: 24, y: 76, w: 152, h: 30 },
          { x: 180, y: 74, w: 56, h: 38 },
          { x: 24, y: 136, w: 152, h: 30 },
          { x: 24, y: 196, w: 152, h: 30 },
          // Tầng 2 Phải (Khu Chạy Bộ & Phòng thử đồ VIP)
          { x: 396, y: 76, w: 124, h: 30 },
          { x: 524, y: 72, w: 96, h: 76 },
          { x: 396, y: 136, w: 124, h: 30 },
          { x: 502, y: 156, w: 118, h: 48 },
          { x: 396, y: 196, w: 102, h: 30 },
          // Ban công gỗ chạm 2 bên cầu thang (mở lối cầu thang gỗ x: 266..374)
          { x: 14, y: 264, w: 252, h: 26 },
          { x: 374, y: 264, w: 252, h: 26 },
          // Tầng 1 Trái (Polo/Áo thun/Phụ kiện + Quầy Thu Ngân Hội An)
          { x: 22, y: 300, w: 152, h: 32 },
          { x: 178, y: 300, w: 70, h: 48 },
          { x: 22, y: 360, w: 152, h: 32 },
          { x: 178, y: 360, w: 70, h: 32 },
          { x: 22, y: 454, w: 168, h: 62 },
          // Tầng 1 Phải (Tường Originals, Dép Adilette, Bóng đá, Sào áo đấu & Kệ hộp giày)
          { x: 394, y: 296, w: 226, h: 64 },
          { x: 394, y: 364, w: 144, h: 60 },
          { x: 544, y: 374, w: 56, h: 38 },
          { x: 394, y: 430, w: 138, h: 30 },
          { x: 418, y: 488, w: 200, h: 48 },
        ],
        hotspots: [
          {
            id: 'adidas_football_zone',
            x: 20,
            y: 10,
            w: 220,
            h: 240,
            standX: 274,
            standY: 160,
            standFace: -1,
            actionType: 'jump_joy',
            bubbleText: 'Khu Bóng Đá thảm cỏ xanh · Giày đinh Predator & Áo đấu cực chất!',
          },
          {
            id: 'adidas_sneaker_wall',
            x: 396,
            y: 10,
            w: 222,
            h: 64,
            standX: 366,
            standY: 124,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: 'Khu Giày Chạy Bộ đế Boost & Dép Adilette 3 sọc đầy đủ mẫu!',
          },
          {
            id: 'adidas_fitting_mirror',
            x: 524,
            y: 74,
            w: 94,
            h: 74,
            standX: 376,
            standY: 184,
            standFace: 1,
            actionType: 'jump_joy',
            bubbleText: 'Phòng thử đồ Hội An VIP · Lên áo Polo 3 sọc cực bảnh bao!',
          },
          {
            id: 'adidas_checkout',
            x: 24,
            y: 454,
            w: 168,
            h: 62,
            standX: 272,
            standY: 484,
            standFace: -1,
            actionType: 'look_window',
            bubbleText: 'Nhân viên Adidas Hội An: Chào mừng bạn ghé chọn giày & áo 3 sọc!',
          },
          {
            id: 'exit_adidas',
            x: 260,
            y: 526,
            w: 120,
            h: 34,
            standX: 320,
            standY: 538,
            standFace: 1,
            actionType: 'jump_joy',
            fastDash: true,
            bubbleText: 'Bước ra lại Đại Lộ Sài Gòn thôi!',
          },
        ],
      }),
    []
  );

  const vnKitScript = useMemo(() => buildVnPixelKitPrimitivesScript(), []);
  const adidasArtScript = useMemo(() => buildAdidasInteriorArtScript(), []);

  const htmlContent = useMemo(
    () => `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #2B180E; }
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
<canvas id="adidasCv" width="260" height="380"></canvas>
<script>
(function(){
var W = 640, H = 560;
${vnKitScript}
${adidasArtScript}

var ADIDAS = {
  t: 0, last: 0, bg: null, pigSprites: null,
  // 2 Nhân viên Adidas đồng phục Polo đen 3 sọc (1 tại quầy thu ngân, 1 đi tuần 2 tầng dọc lối gạch bông)
  staff: [
    {
      x: 92, y: 450, moving: false, faceX: 0, faceY: 1,
      hair: '#1E242E', hairStyle: 1, phase: 0.2, patrol: null
    },
    {
      x: 320, y: 318, moving: true, faceX: 0, faceY: -1, sp: 28,
      hair: '#2B2118', hairStyle: 0, phase: 1.5, wpIdx: 0,
      patrol: [
        { x: 320, y: 318 }, { x: 320, y: 228 }, { x: 274, y: 228 },
        { x: 274, y: 150 }, { x: 366, y: 150 }, { x: 366, y: 228 },
        { x: 320, y: 228 }, { x: 320, y: 420 }, { x: 278, y: 420 }, { x: 366, y: 420 }
      ]
    }
  ],
  // 7 Khách hàng mua sắm dọc hành lang gạch bông & các khu hàng
  shoppers: [
    { x: 272, y: 184, sp: 18, shirt: '#3B82F6', hair: '#2B2118', hairStyle: 2, phase: 0.4, hasBag: false, wpIdx: 0, moving: true, faceX: -1, faceY: 0,
      patrol: [{ x: 272, y: 184 }, { x: 272, y: 124 }, { x: 362, y: 124 }, { x: 362, y: 184 }] },
    { x: 366, y: 236, sp: 16, shirt: '#EC4899', hair: '#3B2618', hairStyle: 1, phase: 1.3, hasBag: false, wpIdx: 0, moving: true, faceX: 1, faceY: 0,
      patrol: [{ x: 366, y: 236 }, { x: 366, y: 174 }, { x: 278, y: 174 }, { x: 278, y: 236 }] },
    { x: 294, y: 360, sp: 20, shirt: '#10B981', hair: '#1E293B', hairStyle: 3, phase: 2.1, hasBag: false, wpIdx: 0, moving: true, faceX: 0, faceY: -1,
      patrol: [{ x: 294, y: 360 }, { x: 358, y: 360 }, { x: 358, y: 468 }, { x: 294, y: 468 }] },
    { x: 276, y: 416, sp: 24, shirt: '#F59E0B', hair: '#2B2118', hairStyle: 0, phase: 0.8, hasBag: true, wpIdx: 0, moving: true, faceX: 1, faceY: 0,
      patrol: [{ x: 276, y: 416 }, { x: 352, y: 416 }, { x: 352, y: 524 }, { x: 276, y: 524 }] },
    { x: 374, y: 472, sp: 19, shirt: '#6366F1', hair: '#4A3222', hairStyle: 2, phase: 2.9, hasBag: true, wpIdx: 0, moving: true, faceX: -1, faceY: 0,
      patrol: [{ x: 374, y: 472 }, { x: 374, y: 334 }, { x: 276, y: 334 }, { x: 276, y: 472 }] },
    { x: 224, y: 486, sp: 0, shirt: '#EF4444', hair: '#2B2118', hairStyle: 1, phase: 3.4, hasBag: true, moving: false, faceX: -1, faceY: 0, patrol: null },
    { x: 320, y: 518, sp: 22, shirt: '#0EA5E9', hair: '#1E293B', hairStyle: 3, phase: 4.0, hasBag: false, wpIdx: 0, moving: true, faceX: 0, faceY: -1,
      patrol: [{ x: 320, y: 518 }, { x: 320, y: 350 }, { x: 274, y: 350 }, { x: 274, y: 518 }] }
  ]
};

function stepPatrol(ent, dt) {
  if (!ent.patrol || ent.patrol.length === 0) return;
  var wp = ent.patrol[ent.wpIdx];
  var dx = wp.x - ent.x, dy = wp.y - ent.y;
  var dist = Math.hypot(dx, dy);
  if (dist < 2.2) {
    ent.x = wp.x; ent.y = wp.y;
    ent.wpIdx = (ent.wpIdx + 1) % ent.patrol.length;
    return;
  }
  ent.moving = true;
  var step = Math.min(dist, ent.sp * dt);
  ent.x += (dx / dist) * step;
  ent.y += (dy / dist) * step;
  ent.faceX = Math.abs(dx) > 1 ? (dx > 0 ? 1 : -1) : 0;
  ent.faceY = Math.abs(dy) > 1 ? (dy > 0 ? 1 : -1) : 0;
}

function buildPigSet() {
  return {
    idle: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 0, blink: false }); }),
    step1: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 1, blink: false }); }),
    step2: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 2, blink: false }); }),
    blink: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 0, blink: true }); })
  };
}

function drawPigInAdidas(ctx, st, t) {
  if (!ADIDAS.pigSprites) return;
  var px = Math.round(st.x), py = Math.round(st.y);
  var bounce = st.walking
    ? Math.round(Math.abs(Math.sin(t * 11)) * 1.5)
    : (st.action ? Math.round(Math.abs(Math.sin(t * 7)) * 2.2) : 0);
  var sp = ADIDAS.pigSprites.idle;
  if (st.walking) sp = (Math.floor(t * 10) % 2 === 0) ? ADIDAS.pigSprites.step1 : ADIDAS.pigSprites.step2;
  else if ((t % 3.6) < 0.14) sp = ADIDAS.pigSprites.blink;
  drawContactShadow(ctx, px, py + 1, 7.5, 2.5);
  ctx.save();
  ctx.translate(px, py - 17 - bounce);
  if (st.facing < 0) ctx.scale(-1, 1);
  ctx.drawImage(sp, -12, 0);
  ctx.restore();
}

function syncViewport() {
  var cv = document.getElementById('adidasCv');
  if (!cv) return;
  var rect = cv.getBoundingClientRect();
  if (!rect || !rect.width || !rect.height) return;
  var aspect = rect.width / rect.height;
  var baseW = 280;
  var vh = Math.max(180, Math.min(560, Math.round(baseW / Math.max(0.45, Math.min(2.2, aspect)))));
  var vw = Math.max(200, Math.min(640, Math.round(vh * aspect)));
  if (cv.width !== vw || cv.height !== vh) {
    cv.width = vw;
    cv.height = vh;
    if (window.__openRoom && window.__openRoom.resize) {
      window.__openRoom.resize(vw, vh);
    }
  }
}

function adidasFrame(now) {
  var dt = Math.min(0.05, (now - ADIDAS.last) / 1000);
  ADIDAS.last = now;
  ADIDAS.t += dt;

  for (var si = 0; si < ADIDAS.staff.length; si++) stepPatrol(ADIDAS.staff[si], dt);
  for (var hi = 0; hi < ADIDAS.shoppers.length; hi++) stepPatrol(ADIDAS.shoppers[hi], dt);

  var eng = window.__openRoom;
  var cv = document.getElementById('adidasCv');
  if (!cv || !ADIDAS.bg) { requestAnimationFrame(adidasFrame); return; }
  var ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  if (eng) eng.step(dt, now);
  var camX = eng ? Math.round(eng.state.camX) : 180;
  var camY = eng ? Math.round(eng.state.camY) : 160;

  ctx.save();
  ctx.translate(-camX, -camY);
  ctx.drawImage(ADIDAS.bg, 0, 0);
  drawAdidasLiveEntities(
    ctx,
    ADIDAS.t,
    ADIDAS.staff,
    ADIDAS.shoppers,
    eng ? eng.state : null,
    function() { if (eng) drawPigInAdidas(ctx, eng.state, ADIDAS.t); }
  );
  ctx.restore();

  if (eng) eng.drawOverlays(ctx, now);
  requestAnimationFrame(adidasFrame);
}

function adidasStart() {
  ADIDAS.bg = mk(W, H, drawAdidasStaticBg);
  ADIDAS.pigSprites = buildPigSet();
  syncViewport();
  window.addEventListener('resize', syncViewport);
  ADIDAS.last = performance.now();
  requestAnimationFrame(adidasFrame);
}

${openRoomScript}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', adidasStart);
} else {
  adidasStart();
}
})();
</script>
</body>
</html>`,
    [vnKitScript, adidasArtScript, openRoomScript]
  );

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#2B180E' } as any}
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
          <Text style={styles.roomToastText} numberOfLines={2}>
            {roomToast}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#2B180E',
  },
  webView: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#2B180E',
  },
  roomToast: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    maxWidth: '86%',
    backgroundColor: '#2B180E',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#F4B93B',
  },
  roomToastText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '800',
    fontSize: 12,
    color: '#FFFBF1',
    textAlign: 'center',
  },
});
