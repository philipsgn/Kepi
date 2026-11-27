import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildTps3dEngineScript } from '../pixel/pixelTps3dEngine';
import { buildMarketWallArtScript } from './market/marketWallArt';
import { buildMarketTps3dSceneScript } from './market/marketTps3dScene';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface BenThanhMarketBannerWebViewProps {
  active?: boolean;
  shoppingTotalText?: string;
  foodTotalText?: string;
  visitsCount?: number;
  selectedZone?: number;
  onExitToMap?: () => void;
  onSelectZoneFromCanvas?: (zoneIdx: number) => void;
}

/**
 * Chợ Bến Thành Sài Gòn 3 Phòng TPS 3D (Quyết định 246)
 * - 3 Phòng riêng biệt 100% (1 Room = 1 Scene, fade 200ms):
 *   1. 'south_hall'  — Sảnh Cửa Nam & Sạp Vải Áo Dài ("👘 Ướm thử Áo Dài & Lụa Bến Thành")
 *   2. 'food_court'  — Khu Ẩm Thực Trung Tâm Sạp 1044 ("🥞 Thưởng thức Bánh Cuốn & Bánh Bèo Chợ Bến Thành")
 *   3. 'fruit_craft' — Sảnh Trái Cây Nhiệt Đới & Đồ Lưu Niệm Nón Lá ("🥭 Chọn mua Xoài Cát & Quà Lưu Niệm")
 * - Hỗ trợ song song Expo Go (SafeWebView) & Web PWA (<iframe srcDoc>).
 */
export const BenThanhMarketBannerWebView: React.FC<BenThanhMarketBannerWebViewProps> = ({
  active = true,
  shoppingTotalText = '0đ',
  foodTotalText = '0đ',
  visitsCount = 0,
  selectedZone,
  onExitToMap,
  onSelectZoneFromCanvas,
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
    if (typeof selectedZone !== 'number') return;
    const roomMap = ['south_hall', 'south_hall', 'food_court', 'fruit_craft'];
    const targetRoom = roomMap[selectedZone] || 'south_hall';
    const js = `window.__mkGoRoom && window.__mkGoRoom('${targetRoom}'); true;`;
    if (Platform.OS === 'web') {
      try {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ type: 'GO_ROOM', room: targetRoom }),
          '*'
        );
      } catch (_e) {}
      return;
    }
    webViewRef.current?.injectJavaScript?.(js);
  }, [selectedZone]);

  const handleRoomPayload = (d: any) => {
    if (!d) return;
    if (d.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (d.type === 'HAPTIC_MEDIUM') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else if (d.type === 'ROOM_CHANGED' && onSelectZoneFromCanvas) {
      const zIdx = d.room === 'food_court' ? 2 : d.room === 'fruit_craft' ? 3 : 1;
      onSelectZoneFromCanvas(zIdx);
    } else if (d.type === 'EXIT_MARKET' && onExitToMap) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => onExitToMap(), 120);
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
  }, [onExitToMap, onSelectZoneFromCanvas]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleRoomPayload(data);
    } catch (_e) {}
  };

  const tpsEngineScript = useMemo(() => buildTps3dEngineScript(), []);
  const marketWallArtScript = useMemo(() => buildMarketWallArtScript(), []);
  const marketSceneScript = useMemo(() => buildMarketTps3dSceneScript(), []);

  const htmlContent = useMemo(
    () => `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #2B180E; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
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
    background: rgba(43, 24, 14, 0.92);
    border: 2.5px solid #2B180E;
    border-radius: 14px;
    padding: 3px;
    box-shadow: 0 3px 0 #1A0E08;
  }
  .room-tab {
    background: transparent; color: #F5E6C8;
    border: none; border-radius: 10px;
    padding: 5px 8px; font-size: 11px; font-weight: 900;
    cursor: pointer; white-space: nowrap;
  }
  .room-tab.active {
    background: #F4B93B; color: #2B180E;
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
<canvas id="marketCv"></canvas>
<div class="room-switcher" id="roomSwitcher">
  <button class="room-tab active" data-room="south_hall">Cửa Nam 👘</button>
  <button class="room-tab" data-room="food_court">Ẩm Thực 🥞</button>
  <button class="room-tab" data-room="fruit_craft">Trái Cây 🥭</button>
</div>
<div class="hud-toast"><div id="toastPill" class="hud-toast-pill">Chợ Bến Thành · Sài Gòn</div></div>
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
${marketWallArtScript}
${marketSceneScript}
(function() {
  var cv = document.getElementById('marketCv');
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

  var st = createMarketTpsState();
  var cam = createTpsCamera({ yaw: 0, pitch: -0.28, dist: 3.6, targetHeight: 0.92 });
  var marketBounds = { minX: -6.0, maxX: 6.0, minZ: 0.0, maxZ: 14.8, maxY: 3.85 };
  var currentAction = null;
  var secAction = null;

  window.__mkGoRoom = function(roomId) {
    if (roomId && roomId !== st.room) {
      triggerMarketRoom(st, roomId);
    }
  };
  window.addEventListener('message', function(ev) {
    try {
      var d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
      if (d && d.type === 'GO_ROOM' && d.room) window.__mkGoRoom(d.room);
    } catch(_e) {}
  });

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
          postRN({ type: 'ROOM_CHANGED', room: targetRoom });
          triggerMarketRoom(st, targetRoom);
        }
      });
    })(roomTabs[ti]);
  }

  function updateContextButtons() {
    var p = st.pig;
    var act = null;
    var sAct = null;

    syncRoomTabs();

    if (st.room === 'south_hall') {
      if (p.z > 10.6 && Math.abs(p.x) < 2.6) {
        act = { id: 'go_room', room: 'food_court', label: '🥞 Vào Khu Ăn Uống Sạp 1044' };
        sAct = { id: 'try_aodai', label: '👘 Ướm thử Áo Dài & Lụa Bến Thành' };
      } else if (p.x > 2.3 && p.z >= 7.8 && p.z <= 12.2) {
        act = { id: 'go_room', room: 'fruit_craft', label: '🥭 Sang Sảnh Trái Cây & Nón Lá' };
        sAct = { id: 'try_aodai', label: '👘 Ướm thử Áo Dài & Lụa Bến Thành' };
      } else if (p.z <= 2.15 && Math.abs(p.x) <= 2.35) {
        act = { id: 'exit_market', label: '🚪 Ra Cửa Nam về Bản Đồ' };
        sAct = { id: 'try_aodai', label: '👘 Ướm thử Áo Dài & Lụa Bến Thành' };
      } else {
        act = { id: 'try_aodai', label: '👘 Ướm thử Áo Dài & Lụa Bến Thành' };
        sAct = { id: 'go_room', room: 'food_court', label: '🥞 Khu Ăn Uống →' };
      }
    } else if (st.room === 'food_court') {
      if (p.z <= 2.3 && Math.abs(p.x) <= 2.4) {
        act = { id: 'go_room', room: 'south_hall', label: '🚪 Về Sảnh Cửa Nam' };
        sAct = { id: 'eat_banhcuon', label: '🥞 Thưởng thức Bánh Cuốn & Bánh Bèo Chợ Bến Thành' };
      } else if (p.x > 2.3 && p.z >= 7.8 && p.z <= 12.2) {
        act = { id: 'go_room', room: 'fruit_craft', label: '🥭 Sang Sảnh Trái Cây & Nón Lá' };
        sAct = { id: 'eat_banhcuon', label: '🥞 Thưởng thức Bánh Cuốn & Bánh Bèo Chợ Bến Thành' };
      } else {
        act = { id: 'eat_banhcuon', label: '🥞 Thưởng thức Bánh Cuốn & Bánh Bèo Chợ Bến Thành' };
        sAct = { id: 'go_room', room: 'fruit_craft', label: '🥭 Sảnh Trái Cây →' };
      }
    } else if (st.room === 'fruit_craft') {
      if (p.z <= 2.3 && Math.abs(p.x) <= 2.4) {
        act = { id: 'go_room', room: 'south_hall', label: '🚪 Về Sảnh Cửa Nam' };
        sAct = { id: 'buy_mango', label: '🥭 Chọn mua Xoài Cát & Quà Lưu Niệm' };
      } else if (p.x > 2.3 && p.z >= 7.8 && p.z <= 12.2) {
        act = { id: 'go_room', room: 'food_court', label: '🥞 Sang Khu Ẩm Thực 1044' };
        sAct = { id: 'buy_mango', label: '🥭 Chọn mua Xoài Cát & Quà Lưu Niệm' };
      } else {
        act = { id: 'buy_mango', label: '🥭 Chọn mua Xoài Cát & Quà Lưu Niệm' };
        sAct = { id: 'go_room', room: 'south_hall', label: '👘 Sảnh Cửa Nam →' };
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
      postRN({ type: 'ROOM_CHANGED', room: a.room });
      triggerMarketRoom(st, a.room);
    } else if (a.id === 'try_aodai') {
      st.pig.wearingAoDai = !st.pig.wearingAoDai;
      st.pig.targetX = -3.2; st.pig.targetZ = 6.2; st.pig.walking = true;
      st.toast = st.pig.wearingAoDai
        ? 'Sạp Hương Trinh: Đã ướm thử Áo Dài Lụa Hà Đông thêu Hoa Sen & Nón Lá cực duyên! 👘✨'
        : 'Đã xếp gọn Áo Dài Lụa & xem tiếp Đặc Sản Liên Sài Gòn 823!';
      st.toastUntil = st.t + 4.4;
    } else if (a.id === 'eat_banhcuon') {
      st.pig.ateFood = true;
      st.pig.eating = true;
      st.pig.targetX = -0.38; st.pig.targetZ = 5.2; st.pig.walking = true;
      st.toast = 'Sạp 1044: Bánh Cuốn Nóng tráng tay 50K, Bánh Bèo Huế tôm cháy 20K & Dừa Xiêm ngọt lịm! 🥞🥥';
      st.toastUntil = st.t + 4.6;
    } else if (a.id === 'buy_mango') {
      st.pig.boughtFruit = true;
      st.pig.targetX = 0.0; st.pig.targetZ = 4.6; st.pig.walking = true;
      st.toast = 'Sạp 1029 Ngọc Hảo: Đã chọn Xoài Cát Hòa Lộc chín vàng, Nón Lá Bài Thơ & Bình Gốm Bát Tràng! 🥭👒';
      st.toastUntil = st.t + 4.6;
    } else if (a.id === 'exit_market') {
      if (!st.exiting) {
        st.exiting = true;
        st.toast = 'Tạm biệt Chợ Bến Thành! Bước qua Cửa Số 1 · Cửa Nam ra phố...';
        st.toastUntil = st.t + 2.2;
        setTimeout(function() { postRN({ type: 'EXIT_MARKET' }); }, 240);
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
        var cpos = clampMarketWalkPos(st, hit.x, hit.z);
        st.pig.seated = false; st.pig.eating = false;
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
    stepMarketTps(st, dt);
    updateTpsCamera(cam, st.pig.x, 0, st.pig.z, W, H, marketBounds);
    renderMarketTpsScene(ctx, cam, st, W, H);
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
    [tpsEngineScript, marketWallArtScript, marketSceneScript, shoppingTotalText, foodTotalText, visitsCount]
  );

  const memoizedSource = useMemo(() => ({ html: htmlContent }), [htmlContent]);

  if (!ready || !active) return null;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          ref={iframeRef}
          title="Chợ Bến Thành Sài Gòn TPS 3D"
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
    backgroundColor: '#2B180E',
  },
  webView: {
    flex: 1,
    width: '100%',
    backgroundColor: '#2B180E',
  },
});
