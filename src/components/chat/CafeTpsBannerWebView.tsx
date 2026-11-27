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
 * Quán Cộng Cà Phê 2 Tầng WebGL 3D — Sạch Sẽ 0% Card Viền, Chú Heo 24×20 Đồng Bộ & Di Chuyển Real-Time (Quyết định 248)
 * - Gỡ bỏ hoàn toàn mọi toast, pill, dải nút card viền và tấm nắng trần — màn hình 100% không gian 3D.
 * - Chạm sàn / ghế / Quầy Bar / Heo AI / Cửa chính để chú Heo đi bộ real-time 2 tầng không cắt đoạn.
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
  html, body { width: 100%; height: 100%; overflow: hidden; background: #2D3522; }
  canvas {
    display: block; width: 100%; height: 100%;
    touch-action: none;
    cursor: grab;
  }
  canvas:active { cursor: grabbing; }
</style>
</head>
<body>
<canvas id="cafeCv"></canvas>
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
  st.onRequestOpenChat = function() {
    postRN({ type: 'HAPTIC_MEDIUM' });
    postRN({ type: 'OPEN_AI_CHAT' });
  };
  var cam = createTpsCamera({ yaw: 0, pitch: -0.26, dist: 3.3, targetHeight: 0.92 });
  var cafeBounds = { minX: -5.5, maxX: 5.5, minZ: -2.2, maxZ: 14.0, maxY: 6.8 };
  var exitSent = false;

  // Vuốt xoay camera 360° & Chạm sàn / ghế / Heo AI / Quầy Bar / Cửa đi bộ real-time không cắt đoạn
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
      var target = wgl ? pickCafeTarget3D(cam, st, sx, sy) : null;
      if (!target) {
        var hit = unprojectFloorTap(cam, sx, sy);
        if (hit) target = { kind: 'floor', x: hit.x, y: 0, z: hit.z };
      }
      if (target) {
        if (target.kind === 'chair' && target.chair) {
          planCafeRealtimePath(st, target.x, target.y, target.z, target.chair.id, null);
          st.ripples.push({ x: target.x, y: target.y, z: target.z, t: 0 });
          postRN({ type: 'HAPTIC_MEDIUM' });
        } else if (target.kind === 'bar') {
          planCafeRealtimePath(st, target.x, 0, target.z, -1, 'order_bar');
          st.ripples.push({ x: target.x, y: 0, z: target.z, t: 0 });
          postRN({ type: 'HAPTIC_LIGHT' });
        } else if (target.kind === 'exit') {
          planCafeRealtimePath(st, target.x, 0, target.z, -1, 'exit_cafe');
          st.ripples.push({ x: target.x, y: 0, z: target.z, t: 0 });
          postRN({ type: 'HAPTIC_LIGHT' });
        } else {
          planCafeRealtimePath(st, target.x, target.y, target.z, -1, null);
          st.ripples.push({ x: target.x, y: target.y, z: target.z, t: 0 });
          postRN({ type: 'HAPTIC_LIGHT' });
        }
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
    if (st.exiting && !exitSent && st.exitFade >= 0.85) {
      exitSent = true;
      postRN({ type: 'EXIT_CAFE' });
    }
    if (wgl) {
      cam.vw = W; cam.vh = H;
      cam.focal = (H * 0.5) / Math.tan(0.76 * 0.5);
      renderCafeWebglScene(wgl, cam, st, W, H);
    } else {
      updateTpsCamera(cam, st.pig.x, 0, st.pig.z, W, H, cafeBounds);
      renderCafeTpsScene(ctx, cam, st, W, H);
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
