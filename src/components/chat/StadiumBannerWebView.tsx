import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildTps3dEngineScript } from '../pixel/pixelTps3dEngine';
import { buildStadiumWallArtScript } from './stadium/stadiumWallArt';
import { buildStadiumTps3dSceneScript } from './stadium/stadiumTps3dScene';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface StadiumBannerWebViewProps {
  onExitStadium?: () => void;
}

/**
 * Sân Vận Động Trống Đồng FIFA 3 Phòng TPS 3D (Quyết định 246)
 * - 3 Phòng riêng biệt 100% (1 Room = 1 Scene, fade 200ms):
 *   1. 'locker_tunnel' — Phòng Thay Đồ ĐT Việt Nam & Đường Hầm FIFA (Tủ áo đỏ Sao Vàng #10/#19/#22/#9/#4,
 *                        Bảng chiến thuật 4-3-3, Bể hồi sức Cryo, "⚽ Mặc áo đấu ĐT Việt Nam & Khởi động")
 *   2. 'pitch_arena'   — Đường Biên Sân Cỏ Trống Đồng & Trận Đấu 11v11 (Mái vòm Trống Đồng, Khán đài Đỏ-Vàng,
 *                        Bảng LED "VIỆT NAM 2 - 0 ĐỘI KHÁCH", "🥅 Sút bóng ghi bàn & Cổ vũ Việt Nam!")
 *   3. 'trophy_vip'    — Phòng Cúp Vàng & Họp Báo Quốc Tế FIFA (Bục kính Cúp Vàng & Trống Đồng Đông Sơn,
 *                        Bàn họp báo gắn micro, "🏆 Nâng Cúp Vàng Vô Địch Việt Nam!")
 * - Hỗ trợ song song Expo Go (SafeWebView) & Web PWA (<iframe srcDoc>).
 */
export const StadiumBannerWebView: React.FC<StadiumBannerWebViewProps> = ({
  onExitStadium,
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
    } else if (d.type === 'EXIT_STADIUM' && onExitStadium) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => onExitStadium(), 120);
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
  }, [onExitStadium]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleRoomPayload(data);
    } catch (_e) {}
  };

  const tpsEngineScript = useMemo(() => buildTps3dEngineScript(), []);
  const stadiumWallArtScript = useMemo(() => buildStadiumWallArtScript(), []);
  const stadiumSceneScript = useMemo(() => buildStadiumTps3dSceneScript(), []);

  const htmlContent = useMemo(
    () => `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #2B120C; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  canvas {
    display: block; width: 100%; height: 100%;
    image-rendering: pixelated;
    image-rendering: -webkit-crisp-edges;
    image-rendering: crisp-edges;
    touch-action: none;
    cursor: grab;
  }
  canvas:active { cursor: grabbing; }
  .room-switcher {
    position: fixed; top: 14px; right: 12px; z-index: 16;
    display: flex; gap: 4px;
    background: rgba(43, 18, 12, 0.94);
    border: 2.5px solid #F4B93B;
    border-radius: 14px;
    padding: 3px;
    box-shadow: 0 3px 0 #1A0A06;
  }
  .room-tab {
    background: transparent; color: #FDE68A;
    border: none; border-radius: 10px;
    padding: 5px 8px; font-size: 11px; font-weight: 900;
    cursor: pointer; white-space: nowrap;
  }
  .room-tab.active {
    background: #DA251D; color: #FDE047;
  }
  .hud-toast {
    position: fixed; top: 56px; left: 16px; right: 16px;
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
    transition: opacity 0.18s;
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
    padding: 10px 18px; font-size: 13.5px; font-weight: 900;
    box-shadow: 0 4px 0 #2B2118;
    cursor: pointer; transition: transform 0.06s;
  }
  .action-btn:active { transform: translateY(2px); box-shadow: 0 2px 0 #2B2118; }
  .action-btn.sec { background: #FFFBF1; padding: 10px 14px; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<canvas id="stadiumCv"></canvas>
<div class="room-switcher" id="roomSwitcher">
  <button class="room-tab active" data-room="locker_tunnel">Hậu Trường 👕</button>
  <button class="room-tab" data-room="pitch_arena">Sân Cỏ ⚽</button>
  <button class="room-tab" data-room="trophy_vip">Cúp Vàng 🏆</button>
</div>
<div class="hud-toast"><div id="toastPill" class="hud-toast-pill">SVĐ Trống Đồng FIFA · Đội Tuyển Việt Nam</div></div>
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
${stadiumWallArtScript}
${stadiumSceneScript}
(function() {
  var cv = document.getElementById('stadiumCv');
  var ctx = cv.getContext('2d');
  var toastPill = document.getElementById('toastPill');
  var mainBtn = document.getElementById('mainActionBtn');
  var secBtn = document.getElementById('secActionBtn');
  var roomTabs = document.querySelectorAll('.room-tab');

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

  var st = createStadiumTpsState();
  var cam = createTpsCamera({ yaw: 0, pitch: -0.28, dist: 3.6, targetHeight: 0.92 });
  var stadiumBounds = { minX: -6.0, maxX: 6.0, minZ: 0.0, maxZ: 14.8, maxY: 3.85 };
  var currentAction = null;
  var secAction = null;

  function syncRoomTabs() {
    for (var i = 0; i < roomTabs.length; i++) {
      var r = roomTabs[i].getAttribute('data-room');
      if (r === st.room) roomTabs[i].classList.add('active');
      else roomTabs[i].classList.remove('active');
    }
  }

  for (var ti = 0; ti < roomTabs.length; ti++) {
    (function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var targetRoom = btn.getAttribute('data-room');
        if (targetRoom && targetRoom !== st.room) {
          postRN({ type: 'HAPTIC_MEDIUM' });
          triggerStadiumRoom(st, targetRoom);
        }
      });
    })(roomTabs[ti]);
  }

  function updateContextButtons() {
    var p = st.pig;
    var act = null;
    var sAct = null;

    syncRoomTabs();

    if (st.room === 'locker_tunnel') {
      if (p.z > 9.4 && Math.abs(p.x) < 2.8) {
        act = { id: 'go_room', room: 'pitch_arena', label: '⚽ Ra Sân Thi Đấu (Đường Hầm FIFA)' };
        sAct = { id: 'wear_kit', label: '⚽ Mặc áo đấu ĐT Việt Nam & Khởi động' };
      } else if (p.x > 2.5 && p.z >= 7.6 && p.z <= 11.8) {
        act = { id: 'go_room', room: 'trophy_vip', label: '🏆 Lên Phòng Cúp Vàng & Họp Báo VIP' };
        sAct = { id: 'wear_kit', label: '⚽ Mặc áo đấu ĐT Việt Nam & Khởi động' };
      } else if (p.z <= 2.15 && Math.abs(p.x) <= 2.35) {
        act = { id: 'exit_stadium', label: '🚪 Ra lại Đại Lộ Sài Gòn' };
        sAct = { id: 'wear_kit', label: '⚽ Mặc áo đấu ĐT Việt Nam & Khởi động' };
      } else {
        act = { id: 'wear_kit', label: '⚽ Mặc áo đấu ĐT Việt Nam & Khởi động' };
        sAct = { id: 'go_room', room: 'pitch_arena', label: '⚽ Ra Sân Thi Đấu →' };
      }
    } else if (st.room === 'pitch_arena') {
      if (p.z <= 2.6 && Math.abs(p.x) <= 2.6) {
        act = { id: 'go_room', room: 'locker_tunnel', label: '👕 Về Phòng Thay Đồ & Đường Hầm' };
        sAct = { id: 'shoot_goal', label: '🥅 Sút bóng ghi bàn & Cổ vũ Việt Nam!' };
      } else if (p.x > 2.5 && p.z >= 7.6 && p.z <= 11.8) {
        act = { id: 'go_room', room: 'trophy_vip', label: '🏆 Lên Phòng Cúp Vàng & Họp Báo VIP' };
        sAct = { id: 'shoot_goal', label: '🥅 Sút bóng ghi bàn & Cổ vũ Việt Nam!' };
      } else {
        act = { id: 'shoot_goal', label: '🥅 Sút bóng ghi bàn & Cổ vũ Việt Nam!' };
        sAct = { id: 'go_room', room: 'trophy_vip', label: '🏆 Lên Phòng Cúp Vàng VIP →' };
      }
    } else if (st.room === 'trophy_vip') {
      if (p.x < -2.4 && p.z >= 7.6 && p.z <= 11.8) {
        act = { id: 'go_room', room: 'pitch_arena', label: '⚽ Ra Sân Cỏ Trống Đồng' };
        sAct = { id: 'lift_trophy', label: '🏆 Nâng Cúp Vàng Vô Địch Việt Nam!' };
      } else if (p.x > 2.4 && p.z >= 7.6 && p.z <= 11.8) {
        act = { id: 'go_room', room: 'locker_tunnel', label: '👕 Về Phòng Thay Đồ ĐT Việt Nam' };
        sAct = { id: 'lift_trophy', label: '🏆 Nâng Cúp Vàng Vô Địch Việt Nam!' };
      } else {
        act = { id: 'lift_trophy', label: '🏆 Nâng Cúp Vàng Vô Địch Việt Nam!' };
        sAct = { id: 'go_room', room: 'pitch_arena', label: '⚽ Ra Sân Cỏ Trống Đồng' };
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
      triggerStadiumRoom(st, a.room);
    } else if (a.id === 'wear_kit') {
      st.pig.wearingVietnamKit = !st.pig.wearingVietnamKit;
      st.pig.targetX = 0.0; st.pig.targetZ = 9.8; st.pig.walking = true;
      st.toast = st.pig.wearingVietnamKit
        ? 'Đã khoác Áo Đấu Đỏ Sao Vàng #10 ĐT Việt Nam & khởi động sẵn sàng ra sân! 🇻🇳⚽'
        : 'Đã treo lại Áo Đấu ĐT Việt Nam ngay ngắn vào tủ gỗ!';
      st.toastUntil = st.t + 4.4;
    } else if (a.id === 'shoot_goal') {
      st.ball.x = st.pig.x; st.ball.z = st.pig.z + 0.5;
      st.ball.shooting = true; st.ball.shootT = 0;
      st.vnScore = (st.vnScore || 2) + 1;
      st.goalFlashUntil = st.t + 3.8;
      st.toast = 'VÀOOOOO! Cú sút cháy lưới! VIỆT NAM ' + st.vnScore + ' - 0 ĐỘI KHÁCH! Khán đài Trống Đồng nổ tung! ⚽🔥🇻🇳';
      st.toastUntil = st.t + 4.5;
    } else if (a.id === 'lift_trophy') {
      st.pig.liftedTrophy = true;
      st.pig.targetX = 0.0; st.pig.targetZ = 6.6; st.pig.walking = true;
      st.confettiUntil = st.t + 4.5;
      st.toast = 'VIỆT NAM VÔ ĐỊCH! Nâng cao Cúp Vàng FIFA & Trống Đồng Đông Sơn rực rỡ! 🏆🇻🇳✨';
      st.toastUntil = st.t + 4.8;
    } else if (a.id === 'exit_stadium') {
      if (!st.exiting) {
        st.exiting = true;
        st.toast = 'Tạm biệt Sân Vận Động Trống Đồng FIFA! Ra lại Đại Lộ Sài Gòn...';
        st.toastUntil = st.t + 2.0;
        setTimeout(function() { postRN({ type: 'EXIT_STADIUM' }); }, 240);
      }
    }
  }

  mainBtn.addEventListener('click', function(e) { e.stopPropagation(); runAction(currentAction); });
  secBtn.addEventListener('click', function(e) { e.stopPropagation(); runAction(secAction); });

  // Tap-to-Walk Raycast 3D & vuốt xoay camera 360° (không Joystick ảo)
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
        var cpos = clampStadiumWalkPos(st, hit.x, hit.z);
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
    stepStadiumTps(st, dt);
    updateTpsCamera(cam, st.pig.x, 0, st.pig.z, W, H, stadiumBounds);
    renderStadiumTpsScene(ctx, cam, st, W, H);
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
    [tpsEngineScript, stadiumWallArtScript, stadiumSceneScript]
  );

  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  if (!ready) return null;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          title="Sân Vận Động Trống Đồng FIFA TPS 3D"
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
    backgroundColor: '#2B120C',
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#2B120C',
  },
});
