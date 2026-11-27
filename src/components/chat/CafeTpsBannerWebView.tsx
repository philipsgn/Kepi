import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildTps3dEngineScript } from '../pixel/pixelTps3dEngine';
import { buildCafeWebgl3dEngineScript } from './cafe/cafeWebgl3dEngine';
import { buildCafeVnWallArtScript } from './cafe/cafeVnWallArt';
import { buildCafeTps3dSceneScript } from './cafe/cafeTps3dScene';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface CafeTpsBannerWebViewProps {
  onExitCafe?: () => void;
  onOpenChat?: () => void;
}

/**
 * Quán Cộng Cà Phê 2 Tầng WebGL 3D Chân Thực Pixar / Studio Ghibli (Quyết định 242–247)
 * - Động cơ WebGL 3D thuần inline (0 CDN mạng, 60fps trên Web PWA, iOS & Android) + Fallback Canvas2D.
 * - Nhân vật Chú Heo 3D khớp nối mặc Áo Trấn Thủ chần bông, Kính tròn cổ, Túi vải đeo chéo & Mũ Cối.
 * - Thế giới 2 tầng liền mạch + Ban công cây dương xỉ nhìn xuống phố cổ vàng nắng chiều.
 * - Hỗ trợ 4 Hành Động Điện Ảnh Liên Hoàn (Quầy Bartender ➔ Cầu Thang ➔ Sảnh Tầng 2 ➔ Ban Công) + Tự do 360°.
 */
export const CafeTpsBannerWebView: React.FC<CafeTpsBannerWebViewProps> = ({
  onExitCafe,
  onOpenChat,
}) => {
  const webViewRef = useRef<any>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready] = useState(true);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const handleRoomPayload = (d: any) => {
    if (!d) return;
    if (d.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (d.type === 'HAPTIC_MEDIUM') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else if (d.type === 'EXIT_CAFE' && onExitCafe) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => onExitCafe(), 120);
    } else if (d.type === 'OPEN_AI_CHAT' && onOpenChat) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      onOpenChat();
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
  }, [onExitCafe, onOpenChat]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleRoomPayload(data);
    } catch (_e) {}
  };

  const tpsEngineScript = useMemo(() => buildTps3dEngineScript(), []);
  const webglEngineScript = useMemo(() => buildCafeWebgl3dEngineScript(), []);
  const cafeWallArtScript = useMemo(() => buildCafeVnWallArtScript(), []);
  const cafeSceneScript = useMemo(() => buildCafeTps3dSceneScript(), []);

  const htmlContent = useMemo(
    () => `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #2D3522; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  canvas {
    display: block; width: 100%; height: 100%;
    touch-action: none;
    cursor: grab;
  }
  canvas:active { cursor: grabbing; }
  .hud-toast {
    position: fixed; top: 14px; left: 66px; right: 106px;
    pointer-events: none; display: flex; justify-content: center; z-index: 10;
  }
  .hud-toast-pill {
    background: rgba(255, 251, 241, 0.94);
    border: 2.5px solid #2B2118;
    border-radius: 12px;
    padding: 6px 11px;
    font-size: 11px; font-weight: 800; color: #2B2118;
    box-shadow: 0 3px 0 #2B2118;
    text-align: center; max-width: 340px;
  }
  .floor-pill {
    position: fixed; top: 14px; right: 12px; z-index: 16;
    background: #3B4D2B; color: #FDE047;
    border: 2.5px solid #2B2118; border-radius: 12px;
    padding: 6px 10px; font-size: 11px; font-weight: 900;
    box-shadow: 0 3px 0 #2B2118; cursor: pointer;
  }
  .floor-pill:active { transform: translateY(1px); }
  .seq-bar {
    position: fixed; bottom: 76px; left: 10px; right: 10px;
    display: flex; justify-content: center; flex-wrap: nowrap; gap: 6px;
    z-index: 16; pointer-events: none;
  }
  .seq-btn {
    pointer-events: auto;
    background: rgba(255, 251, 241, 0.92); color: #2B2118;
    border: 2px solid #2B2118; border-radius: 11px;
    padding: 6px 9px; font-size: 10.5px; font-weight: 800;
    box-shadow: 0 2.5px 0 #2B2118; cursor: pointer; white-space: nowrap;
  }
  .seq-btn.active {
    background: #F4B93B; color: #2B2118;
  }
  .seq-btn:active { transform: translateY(1px); }
  .action-bar {
    position: fixed; bottom: 20px; left: 14px; right: 14px;
    display: flex; justify-content: center; flex-wrap: wrap; gap: 8px;
    pointer-events: none; z-index: 15;
  }
  .action-btn {
    pointer-events: auto;
    background: #F4B93B; color: #2B2118;
    border: 3px solid #2B2118; border-radius: 15px;
    padding: 9px 15px; font-size: 13px; font-weight: 900;
    box-shadow: 0 3.5px 0 #2B2118;
    cursor: pointer; transition: transform 0.06s;
  }
  .action-btn:active { transform: translateY(2px); box-shadow: 0 1.5px 0 #2B2118; }
  .action-btn.ai { background: #4F6335; color: #FFFBF1; }
  .action-btn.sec { background: #FFFBF1; padding: 9px 13px; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<canvas id="cafeCv"></canvas>
<div class="hud-toast"><div id="toastPill" class="hud-toast-pill">Cộng Cà Phê 3D · Chế độ Pixar/Ghibli</div></div>
<button id="floorPillBtn" class="floor-pill">Tầng 1 ☕</button>
<div class="seq-bar">
  <button id="act1Btn" class="seq-btn active">1. Quầy Bar</button>
  <button id="act2Btn" class="seq-btn">2. Cầu Thang</button>
  <button id="act3Btn" class="seq-btn">3. Tầng 2</button>
  <button id="act4Btn" class="seq-btn">4. Ban Công</button>
</div>
<div class="action-bar">
  <button id="aiChatBtn" class="action-btn ai">💬 Trò chuyện Heo AI</button>
  <button id="freeBtn" class="action-btn sec" hidden>🧭 Tự do 360°</button>
  <button id="exitBtn" class="action-btn sec">🚪 Ra Phố</button>
</div>
<script>
window.onerror = function(msg, src, line, col) {
  try {
    var payload = JSON.stringify({ type: 'JS_ERROR', message: String(msg), line: line, col: col });
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(payload);
    else if (window.parent && window.parent !== window) window.parent.postMessage(payload, '*');
  } catch(e) {}
};
function postRN(obj) {
  try {
    var s = JSON.stringify(obj);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  } catch(e) {}
}
${tpsEngineScript}
${webglEngineScript}
${cafeWallArtScript}
${cafeSceneScript}
(function() {
  var cv = document.getElementById('cafeCv');
  var wgl = createCafeWebglRenderer(cv);
  var ctx = wgl ? null : cv.getContext('2d');
  if (wgl) buildCafeProceduralTextures(wgl);

  var toastPill = document.getElementById('toastPill');
  var floorPillBtn = document.getElementById('floorPillBtn');
  var aiBtn = document.getElementById('aiChatBtn');
  var freeBtn = document.getElementById('freeBtn');
  var exitBtn = document.getElementById('exitBtn');
  var actBtns = [
    document.getElementById('act1Btn'),
    document.getElementById('act2Btn'),
    document.getElementById('act3Btn'),
    document.getElementById('act4Btn')
  ];

  var W = 400, H = 720;
  function resizeCanvas() {
    var dw = Math.max(320, window.innerWidth || 390);
    var dh = Math.max(480, window.innerHeight || 760);
    var dpr = wgl ? Math.min(2, window.devicePixelRatio || 1) : (dw > 460 ? 0.72 : 0.84);
    W = Math.round(dw * dpr);
    H = Math.round(dh * dpr);
    cv.width = W; cv.height = H;
    if (ctx) ctx.imageSmoothingEnabled = false;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  var st = createCafeTpsState();
  var cam = createTpsCamera({ yaw: 0, pitch: -0.28, dist: 3.6, targetHeight: 0.92 });
  var cafeBounds = { minX: -5.5, maxX: 5.5, minZ: -2.2, maxZ: 14.0, maxY: 6.8 };

  function syncUi() {
    floorPillBtn.textContent = st.floor === 1 ? 'Tầng 1 ☕' : (st.pig.z < 0.2 ? 'Ban Công 🌿' : 'Tầng 2 🪜');
    for (var i = 0; i < 4; i++) {
      if (st.actionStep === i + 1) actBtns[i].classList.add('active');
      else actBtns[i].classList.remove('active');
    }
    freeBtn.hidden = !st.cinematicCam;
  }

  for (var bIdx = 0; bIdx < 4; bIdx++) {
    (function(stepIdx) {
      actBtns[stepIdx - 1].addEventListener('click', function(e) {
        e.stopPropagation();
        postRN({ type: 'HAPTIC_MEDIUM' });
        startCafeActionSequence(st, stepIdx);
        syncUi();
      });
    })(bIdx + 1);
  }

  floorPillBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    postRN({ type: 'HAPTIC_MEDIUM' });
    startCafeActionSequence(st, st.floor === 1 ? 3 : 1);
    syncUi();
  });

  freeBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    postRN({ type: 'HAPTIC_LIGHT' });
    st.cinematicCam = false;
    st.toast = 'Chế độ Tự do 360°! Chạm sàn để đi & vuốt xoay mọi góc nhìn 🧭';
    st.toastUntil = st.t + 3.5;
    syncUi();
  });

  aiBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    postRN({ type: 'OPEN_AI_CHAT' });
  });

  exitBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    if (!st.exiting) {
      st.exiting = true;
      postRN({ type: 'HAPTIC_MEDIUM' });
      setTimeout(function() { postRN({ type: 'EXIT_CAFE' }); }, 180);
    }
  });

  // Vuốt xoay camera 360° (tự động nhả góc máy điện ảnh) & Chạm sàn đi bộ Raycast 3D
  var dragging = false, moved = false, lastX = 0, lastY = 0, startX = 0, startY = 0;
  function getPt(e) {
    if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }
  function onDown(e) {
    var pt = getPt(e);
    dragging = true; moved = false; lastX = startX = pt.x; lastY = startY = pt.y;
  }
  function onMove(e) {
    if (!dragging) return;
    var pt = getPt(e);
    var dx = pt.x - lastX, dy = pt.y - lastY;
    if (Math.hypot(pt.x - startX, pt.y - startY) > 7) {
      moved = true;
      st.cinematicCam = false;
    }
    cam.yaw -= dx * 0.0085;
    cam.pitch = Math.max(-0.68, Math.min(-0.08, cam.pitch - dy * 0.0055));
    lastX = pt.x; lastY = pt.y;
    if (e.cancelable) e.preventDefault();
  }
  function onUp(e) {
    if (!dragging) return;
    dragging = false;
    if (!moved) {
      var pt = getPt(e);
      var rect = cv.getBoundingClientRect();
      var sx = ((pt.x - rect.left) / rect.width) * W;
      var sy = ((pt.y - rect.top) / rect.height) * H;
      var hit = st.pig.y >= 1.9
        ? unprojectCafePlane3D(cam, sx, sy, 3.4)
        : unprojectFloorTap(cam, sx, sy);
      if (hit) {
        st.cinematicCam = false;
        var cpos = clampCafeWalkPos(st, hit.x, hit.z);
        st.pig.seated = false; st.pig.reachHand = 0; st.helmetOnTable = false;
        st.pig.targetX = cpos.x; st.pig.targetZ = cpos.z; st.pig.walking = true;
        st.ripples.push({ x: cpos.x, z: cpos.z, t: 0 });
        postRN({ type: 'HAPTIC_LIGHT' });
        syncUi();
      }
    }
  }
  cv.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: false });
  window.addEventListener('pointerup', onUp);
  cv.addEventListener('touchstart', onDown, { passive: false });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onUp);

  var lastNow = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
    lastNow = now;
    stepCafeTps(st, dt);
    if (wgl) {
      cam.vw = W; cam.vh = H;
      cam.focal = (H * 0.5) / Math.tan(0.76 * 0.5);
      renderCafeWebglScene(wgl, cam, st, W, H);
    } else {
      updateTpsCamera(cam, st.pig.x, 0, st.pig.z, W, H, cafeBounds);
      renderCafeTpsScene(ctx, cam, st, W, H);
    }
    syncUi();
    if (st.toast && st.t < st.toastUntil) {
      toastPill.textContent = st.toast;
      toastPill.style.opacity = '1';
    } else {
      toastPill.style.opacity = '0';
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`,
    [tpsEngineScript, webglEngineScript, cafeWallArtScript, cafeSceneScript]
  );

  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  if (!ready) return null;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          title="Cộng Cà Phê 2 Tầng WebGL 3D"
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeWebView
        ref={webViewRef}
        source={memoizedSource}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        bounces={false}
        onMessage={handleMessage}
        containerStyle={styles.webView}
        style={styles.webView}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#2D3522',
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#2D3522',
  },
});
