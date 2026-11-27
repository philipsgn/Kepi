import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildTps3dEngineScript } from '../pixel/pixelTps3dEngine';
import { buildPagodaWallArtScript } from './pagoda/pagodaWallArt';
import { buildPagodaTps3dSceneScript } from './pagoda/pagodaTps3dScene';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface PagodaTempleBannerWebViewProps {
  active?: boolean;
  onExitToHub?: () => void;
}

/**
 * Ngôi Chùa Cổ Kính & Vườn Chùa 3 Phòng TPS 3D (Quyết định 245)
 * - 3 Phòng riêng biệt hoàn toàn: Vườn Chùa Thanh Tịnh ('garden') · Chánh Điện Trang Nghiêm ('main_hall') · Tháp Chuông & Thiền Trà ('bell_tea').
 * - Camera Spring-Arm 6 mặt phẳng chống xuyên tường, Tap-to-Walk Raycast 3D, xoay camera 360°.
 * - Hỗ trợ song song Expo Go (SafeWebView) & Web PWA (<iframe srcDoc>).
 */
export const PagodaTempleBannerWebView: React.FC<PagodaTempleBannerWebViewProps> = ({
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
          JSON.stringify({ type: 'SET_ACTIVE', active: !!active }),
          '*'
        );
      } catch (_e) {}
      return;
    }
    webViewRef.current?.injectJavaScript?.(
      `window.__pgSetActive && window.__pgSetActive(${active ? 'true' : 'false'}); true;`
    );
  }, [active]);

  const handleRoomPayload = (d: any) => {
    if (!d) return;
    if (d.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (d.type === 'HAPTIC_MEDIUM') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else if (d.type === 'EXIT_PAGODA' && onExitToHub) {
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
  const pagodaWallArtScript = useMemo(() => buildPagodaWallArtScript(), []);
  const pagodaSceneScript = useMemo(() => buildPagodaTps3dSceneScript(), []);

  const htmlContent = useMemo(
    () => `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #4A2418; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
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
    position: fixed; top: 16px; left: 68px; right: 118px;
    pointer-events: none; display: flex; justify-content: center; z-index: 10;
  }
  .room-pill {
    position: fixed; top: 16px; right: 12px; z-index: 16;
    background: #7F1D1D; color: #FDE047;
    border: 2.5px solid #2B2118; border-radius: 12px;
    padding: 6px 10px; font-size: 11px; font-weight: 900;
    box-shadow: 0 3px 0 #2B2118; cursor: pointer;
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
  .action-btn.sacred { background: #991B1B; color: #FDE047; }
  .action-btn.sec { background: #FFFBF1; padding: 10px 14px; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<canvas id="pgCv"></canvas>
<div class="hud-toast"><div id="toastPill" class="hud-toast-pill">Vườn Chùa Thanh Tịnh</div></div>
<button id="roomPillBtn" class="room-pill">Vườn Chùa 🪷</button>
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
${pagodaWallArtScript}
${pagodaSceneScript}
(function() {
  var cv = document.getElementById('pgCv');
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

  var st = createPagodaTpsState();
  var cam = createTpsCamera({ yaw: 0, pitch: -0.28, dist: 3.6, targetHeight: 0.92 });
  var pagodaBounds = { minX: -6.0, maxX: 6.0, minZ: 0.0, maxZ: 14.8, maxY: 3.85 };
  var currentAction = null;
  var secAction = null;
  var isActive = true;
  var ROOM_ORDER = ['garden', 'main_hall', 'bell_tea'];

  window.__pgSetActive = function(v) {
    isActive = !!v;
    if (isActive) {
      lastNow = performance.now();
      requestAnimationFrame(loop);
    }
  };
  window.addEventListener('message', function(ev) {
    try {
      var d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
      if (d && d.type === 'SET_ACTIVE') window.__pgSetActive(d.active);
    } catch(_e) {}
  });

  function getRoomPillLabel(room) {
    if (room === 'main_hall') return 'Chánh Điện 🙏';
    if (room === 'bell_tea') return 'Thiền Trà 🔔';
    return 'Vườn Chùa 🪷';
  }

  function updateContextButtons() {
    var p = st.pig;
    var act = null;
    var sAct = null;

    roomPillBtn.textContent = getRoomPillLabel(st.room);

    if (st.room === 'garden') {
      if (p.z <= 2.1 && Math.abs(p.x) <= 2.4) {
        act = { id: 'exit_pagoda', label: '🚪 Ra lại Đại Lộ Sài Gòn' };
      } else if (p.z >= 11.3 && Math.abs(p.x) <= 2.3) {
        act = { id: 'go_room', roomId: 'main_hall', label: '🙏 Bước vào Chánh Điện', sacred: true };
      } else if (p.z >= 11.3 && p.x > 2.3) {
        act = { id: 'go_room', roomId: 'bell_tea', label: '🔔 Sang Tháp Chuông & Thiền Trà' };
      } else if (p.x <= -0.2 && p.z >= 3.2 && p.z <= 10.2) {
        act = { id: 'admire_lotus', label: '🪷 Ngắm Hồ Sen & Chùa Một Cột' };
      } else if (p.x >= 2.2 && p.z >= 4.5 && p.z <= 9.2) {
        act = { id: 'rest_banyan', label: '🌳 Đứng dưới tán Cây Đa Cổ Thụ' };
      }
    } else if (st.room === 'main_hall') {
      if (p.z >= 7.2 && Math.abs(p.x) <= 2.9) {
        act = { id: 'offer_incense', label: '🙏 Dâng hương cầu bình an', sacred: true };
      } else if (p.z <= 2.1 && Math.abs(p.x) <= 2.4) {
        act = { id: 'go_room', roomId: 'garden', label: '🪷 Ra lại Vườn Chùa' };
      }
    } else if (st.room === 'bell_tea') {
      if (p.seated) {
        act = { id: 'sip_tea', label: '🍵 Nhâm nhi trà sen nóng' };
        sAct = { id: 'stand_up', label: '🚶 Đứng dậy' };
      } else if (p.x <= -0.3 && p.z >= 7.8) {
        act = { id: 'ring_bell', label: '🔔 Thỉnh Đại Hồng Chung', sacred: true };
      } else if (p.x >= 0.3 && p.z >= 6.6 && p.z <= 10.6) {
        act = { id: 'sit_tea', label: '🍵 Ngồi thưởng Thiền Trà' };
      } else if (p.z <= 2.1 && Math.abs(p.x) <= 2.4) {
        act = { id: 'go_room', roomId: 'garden', label: '🪷 Ra lại Vườn Chùa' };
      }
    }

    currentAction = act;
    secAction = sAct;
    if (act) {
      mainBtn.textContent = act.label;
      mainBtn.className = act.sacred ? 'action-btn sacred' : 'action-btn';
      mainBtn.hidden = false;
    } else {
      mainBtn.hidden = true;
    }
    if (sAct) {
      secBtn.textContent = sAct.label;
      secBtn.hidden = false;
    } else {
      secBtn.hidden = true;
    }
  }

  function runAction(a) {
    if (!a) return;
    var p = st.pig;
    postRN({ type: 'HAPTIC_MEDIUM' });
    if (a.id === 'go_room') {
      triggerPagodaRoom(st, a.roomId);
    } else if (a.id === 'offer_incense') {
      st.incenseGlow = 4.5;
      p.yaw = 0;
      p.walking = false;
      st.toast = 'Nam Mô A Di Đà Phật 🙏 Hương trầm tỏa ngát cầu bình an & giữ ví vững vàng!';
      st.toastUntil = st.t + 4.5;
    } else if (a.id === 'ring_bell') {
      st.bellRingTimer = 3.2;
      st.bellSwingPhase = 0;
      p.yaw = Math.atan2(-2.6 - p.x, 10.5 - p.z);
      p.walking = false;
      st.toast = 'Boong... 🔔 Tiếng Đại Hồng Chung ngân vang, tâm hồn nhẹ nhõm an yên!';
      st.toastUntil = st.t + 4.5;
    } else if (a.id === 'sit_tea') {
      p.x = 1.15; p.z = 8.4; p.yaw = Math.PI / 2;
      p.seated = true; p.walking = false; p.eating = false;
      st.toast = 'Ngồi bên bộ ấm trà Bát Tràng & bức thư pháp TÂM AN thật thanh tịnh 🍵';
      st.toastUntil = st.t + 4.2;
    } else if (a.id === 'sip_tea') {
      p.eating = true;
      st.toast = 'Chén trà sen nóng ấm thơm dịu, tâm an vạn sự lành 🍵🪷';
      st.toastUntil = st.t + 3.8;
    } else if (a.id === 'stand_up') {
      p.seated = false; p.eating = false;
      p.x = 0.55; p.z = 8.4;
    } else if (a.id === 'admire_lotus') {
      st.toast = 'Chùa Một Cột uy nghi giữa Hồ Sen hồng nở rộ dưới nắng vàng 🪷';
      st.toastUntil = st.t + 4.0;
    } else if (a.id === 'rest_banyan') {
      st.toast = 'Gió mát dưới tán Cây Đa Cổ Thụ rợp bóng sân chùa thanh tịnh 🌳';
      st.toastUntil = st.t + 4.0;
    } else if (a.id === 'exit_pagoda') {
      if (!st.exiting) {
        st.exiting = true;
        st.toast = 'Bước qua Cổng Tam Quan ra lại Đại Lộ Sài Gòn...';
        st.toastUntil = st.t + 2.0;
        setTimeout(function() { postRN({ type: 'EXIT_PAGODA' }); }, 240);
      }
    }
  }

  mainBtn.addEventListener('click', function(e) { e.stopPropagation(); runAction(currentAction); });
  secBtn.addEventListener('click', function(e) { e.stopPropagation(); runAction(secAction); });
  roomPillBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    postRN({ type: 'HAPTIC_MEDIUM' });
    var idx = ROOM_ORDER.indexOf(st.room);
    var nextRoom = ROOM_ORDER[(idx + 1) % ROOM_ORDER.length];
    triggerPagodaRoom(st, nextRoom);
  });

  // Cử chỉ chạm sàn đi bộ (Tap-to-Walk Raycast 3D) & vuốt xoay camera 360°
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
        var cpos = clampPagodaWalkPos(st, hit.x, hit.z);
        if (st.pig.seated) { st.pig.seated = false; st.pig.eating = false; }
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
    if (!isActive) return;
    var dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
    lastNow = now;
    stepPagodaTps(st, dt);
    updateTpsCamera(cam, st.pig.x, 0, st.pig.z, W, H, pagodaBounds);
    renderPagodaTpsScene(ctx, cam, st, W, H);
    updateContextButtons();
    if (st.toast && st.t < st.toastUntil) {
      toastPill.textContent = st.toast;
      toastPill.style.opacity = '1';
    } else {
      toastPill.style.opacity = '0';
    }
    requestAnimationFrame(loop);
  }
  if (isActive) requestAnimationFrame(loop);
})();
</script>
</body>
</html>`,
    [tpsEngineScript, pagodaWallArtScript, pagodaSceneScript]
  );

  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  if (!ready) return null;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          ref={iframeRef}
          title="Ngôi Chùa Cổ Kính & Vườn Chùa TPS 3D"
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
    backgroundColor: '#4A2418',
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#4A2418',
  },
});
