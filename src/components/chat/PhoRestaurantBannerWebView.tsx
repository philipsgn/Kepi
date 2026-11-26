import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildOpenRoomEngineScript } from '../pixel/pixelOpenRoomEngine';
import { buildVnPixelKitPrimitivesScript } from '../pixel/vnPixelArtKit';
import { buildPhoInteriorArtScript } from './pho/phoInteriorArt';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface PhoRestaurantBannerWebViewProps {
  onExitPho?: () => void;
}

/**
 * Quán Phở Cổ Truyền Việt Nam Toàn Màn Hình (640 × 440 — Quyết định 225)
 * Áp dụng 100% docs/VIETNAM_PIXEL_ART_BIBLE.md & vnPixelArtKit.ts:
 *  - Dynamic 1:1 Square Pixel viewport khớp tỷ lệ màn hình điện thoại/web
 *  - 1 Đầu bếp nấu phở, 2 nồi nước dùng sôi + khói nghi ngút, tủ kính thịt bò tươi & bánh phở
 *  - 2 Nhân viên phục vụ bưng tô phở, 8 bàn inox đầy đủ gia vị, khách ra vào, 3 quạt trần quay 60fps
 *  - 4 điểm tương tác cho Chú Heo 1:1 Tab Vườn + AABB obstacles + cổng exit_pho fastDash
 */
export const PhoRestaurantBannerWebView: React.FC<PhoRestaurantBannerWebViewProps> = ({
  onExitPho,
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
      if (d.id === 'exit_pho' && d.userTriggered && onExitPho) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        exitTimerRef.current = setTimeout(() => onExitPho(), 140);
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
  }, [onExitPho]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleRoomPayload(data);
    } catch (_e) {}
  };

  const openRoomScript = useMemo(
    () =>
      buildOpenRoomEngineScript({
        canvasId: 'phoCv',
        worldWidth: 640,
        worldHeight: 440,
        viewWidth: 260,
        viewHeight: 380,
        walkBounds: { minX: 28, maxX: 612, minY: 156, maxY: 424 },
        initialX: 320,
        initialY: 360,
        initialCamX: 190,
        initialCamY: 50,
        speed: 58,
        obstacles: [
          { x: 20, y: 64, w: 452, h: 86 },   // Khu bếp phở & 2 nồi nước dùng
          { x: 492, y: 64, w: 128, h: 86 },  // Góc trà đá, quẩy nóng & tủ lạnh
          { x: 44, y: 178, w: 90, h: 56 },   // Bàn trái trên 1
          { x: 160, y: 178, w: 90, h: 56 },  // Bàn trái trên 2
          { x: 44, y: 270, w: 90, h: 56 },   // Bàn trái dưới 1
          { x: 160, y: 270, w: 90, h: 56 },  // Bàn trái dưới 2
          { x: 388, y: 178, w: 90, h: 56 },  // Bàn Phở Đặc Biệt
          { x: 504, y: 178, w: 90, h: 56 },  // Bàn phải trên 2
          { x: 388, y: 270, w: 90, h: 56 },  // Bàn phải dưới 1
          { x: 504, y: 270, w: 90, h: 56 },  // Bàn phải dưới 2
          { x: 20, y: 364, w: 132, h: 56 },  // Quầy thu ngân & Bàn thờ Ông Địa
        ],
        hotspots: [
          {
            id: 'pho_kitchen',
            x: 28,
            y: 70,
            w: 440,
            h: 82,
            standX: 320,
            standY: 162,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: 'Nồi phở sôi sùng sục thơm lừng mùi quế hồi & xương hầm!',
          },
          {
            id: 'pho_special_table',
            x: 388,
            y: 176,
            w: 92,
            h: 60,
            standX: 374,
            standY: 212,
            standFace: 1,
            actionType: 'eat_snack',
            duration: 3600,
            bubbleText: 'Tô phở tái nạm gầu nóng hổi + quẩy giòn ngon hết sảy!',
          },
          {
            id: 'iced_tea_corner',
            x: 494,
            y: 70,
            w: 124,
            h: 82,
            standX: 540,
            standY: 162,
            standFace: 1,
            actionType: 'sip_coffee',
            bubbleText: 'Làm ly trà đá mát lạnh & rổ quẩy nóng giòn rụm!',
          },
          {
            id: 'exit_pho',
            x: 262,
            y: 400,
            w: 116,
            h: 40,
            standX: 320,
            standY: 418,
            standFace: 1,
            actionType: 'jump_joy',
            fastDash: true,
            bubbleText: 'No căng bụng rồi · Ra lại Đại Lộ Sài Gòn thôi!',
          },
        ],
      }),
    []
  );

  const vnKitScript = useMemo(() => buildVnPixelKitPrimitivesScript(), []);
  const phoArtScript = useMemo(() => buildPhoInteriorArtScript(), []);

  const htmlContent = useMemo(
    () => `<!doctype html>
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
<canvas id="phoCv" width="260" height="380"></canvas>
<script>
(function(){
var W = 640, H = 440;
${vnKitScript}
${phoArtScript}

var PHO = {
  t: 0, last: 0, bg: null, pigSprites: null,
  // 2 Nhân viên phục vụ bưng tô phở đi lại giữa khu bếp & 2 dãy bàn ăn
  waiters: [
    { x: 296, y: 170, dir: 1, sp: 24, minY: 164, maxY: 320, axis: 'y', shirt: '#38BDF8', phase: 0.2 },
    { x: 344, y: 310, dir: -1, sp: 26, minY: 164, maxY: 330, axis: 'y', shirt: '#FDE047', phase: 2.4 }
  ],
  // ~14 Thực khách ngồi ăn phở xì xụp tại 8 bàn inox
  seatedGuests: [
    { x: 66, y: 185, shirt: '#3B82F6', hair: '#2B2118', phase: 0.3 },
    { x: 106, y: 230, shirt: '#EC4899', hair: '#4A3222', phase: 1.1 },
    { x: 184, y: 185, shirt: '#16A34A', hair: '#1E293B', phase: 2.0 },
    { x: 224, y: 230, shirt: '#F59E0B', hair: '#2B2118', phase: 2.8 },
    { x: 66, y: 277, shirt: '#8B5CF6', hair: '#3B2618', phase: 0.7 },
    { x: 106, y: 277, shirt: '#EF4444', hair: '#2B2118', phase: 1.9 },
    { x: 184, y: 322, shirt: '#0EA5E9', hair: '#1E293B', phase: 3.2 },
    { x: 224, y: 277, shirt: '#D97706', hair: '#4A3222', phase: 4.1 },
    { x: 452, y: 185, shirt: '#10B981', hair: '#2B2118', phase: 1.4 },
    { x: 526, y: 185, shirt: '#6366F1', hair: '#1E293B', phase: 2.5 },
    { x: 568, y: 230, shirt: '#F43F5E', hair: '#3B2618', phase: 0.9 },
    { x: 412, y: 322, shirt: '#14B8A6', hair: '#2B2118', phase: 3.6 },
    { x: 526, y: 277, shirt: '#EAB308', hair: '#4A3222', phase: 1.7 },
    { x: 568, y: 322, shirt: '#EC4899', hair: '#2B2118', phase: 2.9 }
  ],
  // 4 Khách hàng đi vào / đi ra liên tục qua cửa chính
  walkGuests: [
    { x: 288, y: 416, dir: -1, sp: 18, minY: 342, maxY: 426, shirt: '#0284C7', hair: '#2B2118', phase: 0.5 },
    { x: 354, y: 356, dir: 1, sp: 16, minY: 342, maxY: 426, shirt: '#EA580C', hair: '#3B2618', phase: 1.9 },
    { x: 312, y: 256, dir: 1, sp: 14, minY: 238, maxY: 365, shirt: '#16A34A', hair: '#1E293B', phase: 3.1 },
    { x: 332, y: 392, dir: -1, sp: 17, minY: 346, maxY: 426, shirt: '#A855F7', hair: '#2B2118', phase: 4.2 }
  ]
};

function buildPigSet() {
  return {
    idle: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 0, blink: false }); }),
    step1: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 1, blink: false }); }),
    step2: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 2, blink: false }); }),
    blink: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 0, blink: true }); })
  };
}

function drawPigInPho(ctx, st, t) {
  if (!PHO.pigSprites) return;
  var px = Math.round(st.x), py = Math.round(st.y);
  var bounce = st.walking
    ? Math.round(Math.abs(Math.sin(t * 11)) * 1.5)
    : (st.action ? Math.round(Math.abs(Math.sin(t * 7)) * 2.2) : 0);
  var sp = PHO.pigSprites.idle;
  if (st.walking) sp = (Math.floor(t * 10) % 2 === 0) ? PHO.pigSprites.step1 : PHO.pigSprites.step2;
  else if ((t % 3.6) < 0.14) sp = PHO.pigSprites.blink;
  drawContactShadow(ctx, px, py + 1, 7.5, 2.5);
  ctx.save();
  ctx.translate(px, py - 17 - bounce);
  if (st.facing < 0) ctx.scale(-1, 1);
  ctx.drawImage(sp, -12, 0);
  ctx.restore();
}

function syncViewport() {
  var cv = document.getElementById('phoCv');
  if (!cv) return;
  var rect = cv.getBoundingClientRect();
  if (!rect || !rect.width || !rect.height) return;
  var aspect = rect.width / rect.height;
  var baseW = 280;
  var vh = Math.max(180, Math.min(440, Math.round(baseW / Math.max(0.45, Math.min(2.2, aspect)))));
  var vw = Math.max(200, Math.min(640, Math.round(vh * aspect)));
  if (cv.width !== vw || cv.height !== vh) {
    cv.width = vw;
    cv.height = vh;
    if (window.__openRoom && window.__openRoom.resize) {
      window.__openRoom.resize(vw, vh);
    }
  }
}

function phoFrame(now) {
  var dt = Math.min(0.05, (now - PHO.last) / 1000);
  PHO.last = now;
  PHO.t += dt;

  // Cập nhật 2 nhân viên phục vụ chạy bàn
  for (var wi = 0; wi < PHO.waiters.length; wi++) {
    var w = PHO.waiters[wi];
    w.y += w.dir * w.sp * dt;
    if (w.y > w.maxY) { w.y = w.maxY; w.dir = -1; }
    if (w.y < w.minY) { w.y = w.minY; w.dir = 1; }
  }
  // Cập nhật 4 khách đi vào / đi ra cửa chính
  for (var gi = 0; gi < PHO.walkGuests.length; gi++) {
    var g = PHO.walkGuests[gi];
    g.y += g.dir * g.sp * dt;
    if (g.y > g.maxY) { g.y = g.maxY; g.dir = -1; }
    if (g.y < g.minY) { g.y = g.minY; g.dir = 1; }
  }

  var eng = window.__openRoom;
  var cv = document.getElementById('phoCv');
  if (!cv || !PHO.bg) { requestAnimationFrame(phoFrame); return; }
  var ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  if (eng) eng.step(dt, now);
  var camX = eng ? Math.round(eng.state.camX) : 180;
  var camY = eng ? Math.round(eng.state.camY) : 40;

  ctx.save();
  ctx.translate(-camX, -camY);
  ctx.drawImage(PHO.bg, 0, 0);
  drawPhoLiveEntities(
    ctx,
    PHO.t,
    PHO.waiters,
    PHO.seatedGuests,
    PHO.walkGuests,
    eng ? eng.state : null,
    function() { if (eng) drawPigInPho(ctx, eng.state, PHO.t); }
  );
  ctx.restore();

  if (eng) eng.drawOverlays(ctx, now);
  requestAnimationFrame(phoFrame);
}

function phoStart() {
  PHO.bg = mk(W, H, drawPhoStaticBg);
  PHO.pigSprites = buildPigSet();
  syncViewport();
  window.addEventListener('resize', syncViewport);
  PHO.last = performance.now();
  requestAnimationFrame(phoFrame);
}

${openRoomScript}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', phoStart);
} else {
  phoStart();
}
})();
</script>
</body>
</html>`,
    [vnKitScript, phoArtScript, openRoomScript]
  );

  return (
    <View style={styles.container}>
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
    top: 56,
    alignSelf: 'center',
    maxWidth: '86%',
    backgroundColor: '#2B2118',
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
