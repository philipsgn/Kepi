import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildTps3dEngineScript } from '../pixel/pixelTps3dEngine';
import { buildCathedralWallArtScript } from './cathedral/cathedralWallArt';
import { buildCathedralTps3dSceneScript } from './cathedral/cathedralTps3dScene';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface NotreDameCathedralBannerWebViewProps {
  active?: boolean;
  onExitToHub?: () => void;
}

/**
 * Nhà Thờ Đức Bà Sài Gòn — 3 Phòng TPS 3D Độc Lập (Quyết định 245)
 * - 3 Phòng riêng biệt (200ms fade): Thánh Đường Chính ('nave') · Cung Thánh ('sanctuary') · Gác Đàn & Tháp Chuông ('belfry').
 * - Camera TPS 360° Spring-Arm 6 mặt phẳng chống xuyên tường, Tap-to-Walk Raycast 3D không Joystick ảo.
 * - Hỗ trợ song song React Native SafeWebView (Expo Go / iOS Fabric) & Web PWA (<iframe srcDoc>).
 */
export const NotreDameCathedralBannerWebView: React.FC<NotreDameCathedralBannerWebViewProps> = ({
  active = true,
  onExitToHub,
}) => {
  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<any>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ready] = useState(true);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ type: 'SET_ACTIVE', active }),
          '*'
        );
      } catch (_e) {}
      return;
    }
    webViewRef.current?.injectJavaScript?.(
      `window.__ndSetActive && window.__ndSetActive(${active ? 'true' : 'false'}); true;`
    );
  }, [active]);

  const handleRoomPayload = (d: any) => {
    if (!d) return;
    if (d.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (d.type === 'HAPTIC_MEDIUM') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else if (d.type === 'EXIT_CATHEDRAL' && onExitToHub) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => onExitToHub(), 120);
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
  }, [onExitToHub]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleRoomPayload(data);
    } catch (_e) {}
  };

  const tpsEngineScript = useMemo(() => buildTps3dEngineScript(), []);
  const cathedralWallArtScript = useMemo(() => buildCathedralWallArtScript(), []);
  const cathedralSceneScript = useMemo(() => buildCathedralTps3dSceneScript(), []);

  const htmlContent = useMemo(
    () => `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #3B2820; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  canvas {
    display: block; width: 100%; height: 100%;
    image-rendering: pixelated;
    image-rendering: -webkit-crisp-edges;
    image-rendering: crisp-edges;
    touch-action: none;
    cursor: grab;
  }
  canvas:active { cursor: grabbing; }
  .hud-toast {
    position: fixed; top: 16px; left: 68px; right: 132px;
    pointer-events: none; display: flex; justify-content: center; z-index: 10;
  }
  .room-pill {
    position: fixed; top: 16px; right: 12px; z-index: 16;
    background: #7F1D1D; color: #FDE047;
    border: 2.5px solid #2B2118; border-radius: 12px;
    padding: 6px 10px; font-size: 11px; font-weight: 900;
    box-shadow: 0 3px 0 #2B2118; cursor: pointer;
    white-space: nowrap;
  }
  .room-pill:active { transform: translateY(1px); }
  .hud-toast-pill {
    background: rgba(255, 251, 241, 0.95);
    border: 2.5px solid #2B2118;
    border-radius: 12px;
    padding: 6px 12px;
    font-size: 11.5px; font-weight: 800; color: #2B2118;
    box-shadow: 0 3px 0 #2B2118;
    text-align: center; max-width: 340px;
  }
  .action-bar {
    position: fixed; bottom: 26px; left: 16px; right: 16px;
    display: flex; justify-content: center; flex-wrap: wrap; gap: 10px;
    pointer-events: none; z-index: 15;
  }
  .action-btn {
    pointer-events: auto;
    background: #F4B93B; color: #2B2118;
    border: 3px solid #2B2118; border-radius: 16px;
    padding: 10px 18px; font-size: 14px; font-weight: 900;
    box-shadow: 0 4px 0 #2B2118;
    cursor: pointer; transition: transform 0.06s;
  }
  .action-btn:active { transform: translateY(2px); box-shadow: 0 2px 0 #2B2118; }
  .action-btn.sec { background: #FFFBF1; padding: 10px 14px; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<canvas id="ndCv"></canvas>
<div class="hud-toast"><div id="toastPill" class="hud-toast-pill">Thánh Đường Chính · Nhà Thờ Đức Bà</div></div>
<button id="roomPillBtn" class="room-pill">Thánh Đường ⛪</button>
<div class="action-bar">
  <button id="mainActionBtn" class="action-btn" hidden></button>
  <button id="secActionBtn" class="action-btn sec" hidden></button>
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
${cathedralWallArtScript}
${cathedralSceneScript}
(function() {
  var cv = document.getElementById('ndCv');
  var ctx = cv.getContext('2d');
  var toastPill = document.getElementById('toastPill');
  var roomPillBtn = document.getElementById('roomPillBtn');
  var mainBtn = document.getElementById('mainActionBtn');
  var secBtn = document.getElementById('secActionBtn');

  var W = 400, H = 720;
  function resizeCanvas() {
    var dw = Math.max(320, window.innerWidth || 390);
    var dh = Math.max(480, window.innerHeight || 760);
    var scale = dw > 460 ? 0.72 : 0.84;
    W = Math.round(dw * scale);
    H = Math.round(dh * scale);
    cv.width = W; cv.height = H;
    ctx.imageSmoothingEnabled = false;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  var st = createCathedralTpsState();
  var cam = createTpsCamera({ yaw: 0, pitch: -0.28, dist: 3.6, targetHeight: 0.92 });
  var cathedralBounds = { minX: -6.0, maxX: 6.0, minZ: 0.0, maxZ: 14.8, maxY: 3.85 };
  var currentAction = null;
  var secAction = null;
  var isRunning = true;

  var roomOrder = ['nave', 'sanctuary', 'belfry'];
  var roomLabels = {
    nave: 'Thánh Đường ⛪',
    sanctuary: 'Cung Thánh 🕯️',
    belfry: 'Tháp Chuông 🔔'
  };

  function updateContextButtons() {
    var p = st.pig;
    var act = null;
    var sAct = null;

    roomPillBtn.textContent = roomLabels[st.room] || 'Thánh Đường ⛪';

    if (st.room === 'nave') {
      if (Math.abs(p.x) <= 2.35 && p.z >= 10.8) {
        act = { id: 'go_room', target: 'sanctuary', label: '🕯️ Bước vào Cung Thánh' };
      } else if (p.x <= -1.75 && p.z >= 10.2) {
        act = { id: 'go_room', target: 'belfry', label: '🔔 Lên Gác Đàn & Tháp Chuông' };
      } else if (p.z <= 1.95 && Math.abs(p.x) <= 2.45) {
        act = { id: 'exit_cathedral', label: '🚪 Ra lại Đại Lộ Sài Gòn' };
      }
    } else if (st.room === 'sanctuary') {
      if (p.z >= 6.4) {
        act = { id: 'light_candle', label: '🕯️ Thắp nến cầu bình an' };
      }
      if (p.z <= 2.35 && Math.abs(p.x) <= 2.65) {
        if (!act) act = { id: 'go_room', target: 'nave', label: '⛪ Quay lại Thánh Đường' };
        else sAct = { id: 'go_room', target: 'nave', label: '⛪ Về Thánh Đường' };
      }
    } else if (st.room === 'belfry') {
      var dBell = Math.hypot(p.x - 2.0, p.z - 6.8);
      if (dBell <= 3.15) {
        act = { id: 'ring_bell', label: '🔔 Kéo chuông Nhà Thờ' };
      } else if (p.z >= 9.6 && p.x >= -1.8 && p.x <= 4.0) {
        act = { id: 'inspect_organ', label: '🎵 Ngắm Đàn Ống Pipe Organ' };
      }
      if (p.x <= -1.75 && p.z >= 10.0) {
        if (!act) act = { id: 'go_room', target: 'nave', label: '🪜 Xuống Thánh Đường Chính' };
        else sAct = { id: 'go_room', target: 'nave', label: '🪜 Xuống Thánh Đường' };
      }
    }

    currentAction = act;
    secAction = sAct;
    if (act) { mainBtn.textContent = act.label; mainBtn.hidden = false; }
    else { mainBtn.hidden = true; }
    if (sAct) { secBtn.textContent = sAct.label; secBtn.hidden = false; }
    else { secBtn.hidden = true; }
  }

  function runAction(a) {
    if (!a) return;
    postRN({ type: 'HAPTIC_MEDIUM' });
    if (a.id === 'go_room') {
      triggerCathedralRoom(st, a.target);
    } else if (a.id === 'light_candle') {
      lightCathedralCandle(st);
    } else if (a.id === 'ring_bell') {
      ringCathedralBell(st);
    } else if (a.id === 'inspect_organ') {
      st.organGlow = 1.0;
      st.toast = '🎵 Đại Phong Cầm 1880 cổ điển với hàng chục ống đồng vàng vang âm trầm ấm!';
      st.toastUntil = st.t + 4.2;
    } else if (a.id === 'exit_cathedral') {
      if (!st.exiting) {
        st.exiting = true;
        st.toast = 'Tạm biệt Nhà Thờ Đức Bà! Ra lại Đại Lộ Sài Gòn...';
        st.toastUntil = st.t + 2.0;
        setTimeout(function() { postRN({ type: 'EXIT_CATHEDRAL' }); }, 240);
      }
    }
  }

  mainBtn.addEventListener('click', function(e) { e.stopPropagation(); runAction(currentAction); });
  secBtn.addEventListener('click', function(e) { e.stopPropagation(); runAction(secAction); });
  roomPillBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    postRN({ type: 'HAPTIC_MEDIUM' });
    var idx = roomOrder.indexOf(st.room);
    var nextRoom = roomOrder[(idx + 1) % roomOrder.length];
    triggerCathedralRoom(st, nextRoom);
  });

  // Cử chỉ chạm sàn đi bộ (Tap-to-Walk Raycast 3D) & vuốt xoay camera 360° (không Joystick ảo)
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
    if (Math.hypot(pt.x - startX, pt.y - startY) > 7) moved = true;
    cam.yaw -= dx * 0.0085;
    cam.pitch = Math.max(-0.68, Math.min(-0.10, cam.pitch - dy * 0.0055));
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
      var hit = unprojectFloorTap(cam, sx, sy);
      if (hit) {
        var cpos = clampCathedralWalkPos(st, hit.x, hit.z);
        st.pig.targetX = cpos.x; st.pig.targetZ = cpos.z; st.pig.walking = true;
        st.ripples.push({ x: cpos.x, z: cpos.z, t: 0 });
        postRN({ type: 'HAPTIC_LIGHT' });
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
    if (!isRunning) return;
    var dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
    lastNow = now;
    stepCathedralTps(st, dt);
    updateTpsCamera(cam, st.pig.x, 0, st.pig.z, W, H, cathedralBounds);
    renderCathedralTpsScene(ctx, cam, st, W, H);
    updateContextButtons();
    if (st.toast && st.t < st.toastUntil) {
      toastPill.textContent = st.toast;
      toastPill.style.opacity = '1';
    } else {
      toastPill.style.opacity = '0';
    }
    requestAnimationFrame(loop);
  }

  window.__ndSetActive = function(v) {
    if (v && !isRunning) {
      isRunning = true;
      lastNow = performance.now();
      requestAnimationFrame(loop);
    } else if (!v) {
      isRunning = false;
    }
  };
  window.addEventListener('message', function(ev) {
    try {
      var d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
      if (d && d.type === 'SET_ACTIVE') window.__ndSetActive(!!d.active);
    } catch(e) {}
  });

  requestAnimationFrame(loop);
})();
</script>
</body>
</html>`,
    [tpsEngineScript, cathedralWallArtScript, cathedralSceneScript]
  );

  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  if (!ready) return null;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          ref={iframeRef}
          title="Nhà Thờ Đức Bà Sài Gòn TPS 3D"
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none', display: 'block' } as any}
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
        onContentProcessDidTerminate={() => webViewRef.current?.reload?.()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#3B2820',
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#3B2820',
  },
});
