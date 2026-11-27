import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildTps3dEngineScript } from '../pixel/pixelTps3dEngine';
import { buildCafeVnWallArtScript } from './cafe/cafeVnWallArt';
import { buildCafeTps3dSceneScript } from './cafe/cafeTps3dScene';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface CafeTpsBannerWebViewProps {
  onExitCafe?: () => void;
  onOpenChat?: () => void;
}

/**
 * Quán Cà Phê Việt Nam TPS 3D — Cộng Cà Phê Bao Cấp Ấm Cúng (Quyết định 242)
 * - Interior-Only 100%, không thanh Tab card, Camera Spring-Arm 6 mặt phẳng chống xuyên tường.
 * - Hỗ trợ song song Expo Go (SafeWebView) & Web PWA (<iframe srcDoc>).
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
  html, body { width: 100%; height: 100%; overflow: hidden; background: #364627; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
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
    position: fixed; top: 16px; left: 68px; right: 14px;
    pointer-events: none; display: flex; justify-content: center; z-index: 10;
  }
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
  .action-btn.ai { background: #658044; color: #FFFBF1; }
  .action-btn.sec { background: #FFFBF1; padding: 10px 14px; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<canvas id="cafeCv"></canvas>
<div class="hud-toast"><div id="toastPill" class="hud-toast-pill">Chào mừng đến Cà Phê Việt Nam!</div></div>
<div class="action-bar">
  <button id="mainActionBtn" class="action-btn" hidden></button>
  <button id="aiChatBtn" class="action-btn ai" hidden>💬 Trò chuyện cùng Heo AI</button>
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
${cafeWallArtScript}
${cafeSceneScript}
(function() {
  var cv = document.getElementById('cafeCv');
  var ctx = cv.getContext('2d');
  var toastPill = document.getElementById('toastPill');
  var mainBtn = document.getElementById('mainActionBtn');
  var aiBtn = document.getElementById('aiChatBtn');
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

  var st = createCafeTpsState();
  var cam = createTpsCamera(0, 0.34, 3.6);
  var cafeBounds = { minX: -6.0, maxX: 6.0, minZ: 0.0, maxZ: 14.8, maxY: 3.85 };
  var currentAction = null;
  var secAction = null;

  function updateContextButtons() {
    var p = st.pig;
    var act = null;
    var sAct = null;
    var showAi = false;

    // Kiểm tra gần Góc Bàn Heo AI (Bàn 5: X=3.3, Z=9.0)
    var dAi = Math.hypot(p.x - st.aiCoachPig.x, p.z - st.aiCoachPig.z);
    if (dAi < 2.6 || (p.seated && p.seatTableId === 5)) {
      showAi = true;
    }

    if (p.seated) {
      if (!p.orderSent && !p.drinkReady) {
        act = { id: 'order_coffee', label: '☕ Gọi Cà Phê Cốt Dừa & Sừng Bò' };
      } else if (p.drinkReady) {
        act = { id: 'sip_coffee', label: '🥐 Nhâm nhi Cà Phê Cốt Dừa' };
      }
      sAct = { id: 'stand_up', label: '🚶 Đứng dậy' };
    } else {
      // Kiểm tra gần bàn trống
      var nearTb = null, bestD = 1.95;
      for (var i = 0; i < st.tables.length; i++) {
        var tb = st.tables[i];
        var d = Math.hypot(p.x - tb.chairX, p.z - tb.chairZ);
        if (d < bestD && (!tb.occupiedBy || tb.isAiTable)) {
          bestD = d; nearTb = tb;
        }
      }
      if (nearTb) {
        act = {
          id: 'sit_table',
          tableId: nearTb.id,
          label: nearTb.isAiTable ? '🪑 Ngồi chung bàn Heo AI' : '☕ Ngồi uống Cà Phê'
        };
      } else if (p.z >= 9.6) {
        act = { id: 'watch_barista', label: '👀 Xem Barista pha Cà Phê Phin' };
      } else if (p.z <= 1.85 && Math.abs(p.x) <= 2.35) {
        act = { id: 'exit_cafe', label: '🚪 Ra lại Đại Lộ Sài Gòn' };
      }
    }

    currentAction = act;
    secAction = sAct;
    if (act) { mainBtn.textContent = act.label; mainBtn.hidden = false; }
    else { mainBtn.hidden = true; }
    aiBtn.hidden = !showAi;
    if (sAct) { secBtn.textContent = sAct.label; secBtn.hidden = false; }
    else { secBtn.hidden = true; }
  }

  function runAction(a) {
    if (!a) return;
    var p = st.pig;
    postRN({ type: 'HAPTIC_MEDIUM' });
    if (a.id === 'sit_table') {
      var tb = st.tables[a.tableId];
      p.x = tb.chairX; p.z = tb.chairZ;
      p.yaw = Math.atan2(tb.x - tb.chairX, tb.z - tb.chairZ);
      p.seated = true; p.walking = false; p.seatTableId = tb.id;
      p.drinkReady = !!tb.isAiTable; p.orderSent = false; p.eating = false;
      st.toast = tb.isAiTable
        ? 'Heo AI chào bạn! Bấm nút xanh để trò chuyện về chi tiêu nhé 💬'
        : 'Đệm Chăn Con Công êm quá! Gọi ngay ly Cà Phê Cốt Dừa nhé ☕';
      st.toastUntil = st.t + 4.0;
    } else if (a.id === 'order_coffee') {
      p.orderSent = true;
      st.waiter.state = 'delivering';
      st.waiter.targetTable = p.seatTableId;
      st.waiter.carryCoffee = true;
      st.toast = 'Barista áo xanh lính đang pha Cà Phê Cốt Dừa & nướng Bánh Sừng Bò...';
      st.toastUntil = st.t + 4.0;
    } else if (a.id === 'sip_coffee') {
      p.eating = true;
      st.toast = 'Vị cốt dừa béo thơm hòa quyện cà phê phin đậm đà quá đã! 🇻🇳☕';
      st.toastUntil = st.t + 3.8;
    } else if (a.id === 'stand_up') {
      p.seated = false; p.eating = false; p.orderSent = false; p.drinkReady = false;
      p.seatTableId = -1;
      p.z = Math.max(0.8, p.z - 0.5);
    } else if (a.id === 'watch_barista') {
      p.targetX = 0; p.targetZ = 10.6; p.walking = true;
      st.toast = '2 Barista áo xanh bộ đội đang đánh kem cốt dừa & châm phin thơm lừng!';
      st.toastUntil = st.t + 4.0;
    } else if (a.id === 'exit_cafe') {
      if (!st.exiting) {
        st.exiting = true;
        st.toast = 'Tạm biệt Quán Cà Phê Việt Nam! Ra lại Đại Lộ Sài Gòn...';
        st.toastUntil = st.t + 2.0;
        setTimeout(function() { postRN({ type: 'EXIT_CAFE' }); }, 240);
      }
    }
  }

  mainBtn.addEventListener('click', function(e) { e.stopPropagation(); runAction(currentAction); });
  secBtn.addEventListener('click', function(e) { e.stopPropagation(); runAction(secAction); });
  aiBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    postRN({ type: 'OPEN_AI_CHAT' });
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
    cam.pitch = Math.max(0.14, Math.min(0.68, cam.pitch + dy * 0.0055));
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
      var hit = screenToFloor3D(cam, sx, sy);
      if (hit) {
        var cpos = clampCafeWalkPos(st, hit.x, hit.z);
        if (st.pig.seated) { st.pig.seated = false; st.pig.seatTableId = -1; st.pig.eating = false; }
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
    var dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
    lastNow = now;
    stepCafeTps(st, dt);
    updateTpsCamera(cam, st.pig.x, st.pig.z, W, H, cafeBounds);
    renderCafeTpsScene(ctx, cam, st, W, H);
    updateContextButtons();
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
    [tpsEngineScript, cafeWallArtScript, cafeSceneScript]
  );

  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  if (!ready) return null;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          title="Quán Cà Phê Việt Nam TPS 3D"
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
    backgroundColor: '#364627',
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#364627',
  },
});
