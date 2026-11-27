import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildTps3dEngineScript } from '../pixel/pixelTps3dEngine';
import { buildPhoTps3dSceneScript } from './pho/phoTps3dScene';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface PhoRestaurantBannerWebViewProps {
  onExitPho?: () => void;
}

/**
 * Quán Phở Cổ Truyền — Góc Nhìn Thứ 3 Nhập Vai 3D Kiểu PUBG (Quyết định 232)
 * Tuân thủ 100% docs/TPS_3D_OPEN_WORLD_SPEC.md:
 * - Camera 3D sau lưng chú Heo xoay tự do 360° (vuốt màn hình xoay, không Joystick ảo).
 * - Chạm điểm trên sàn 3D (Raycast Tap-to-Walk) để chú Heo đi lại tự do, hỗ trợ thêm phím WASD trên Web.
 * - Chu trình nhập vai thực tế: Xuất phát ngoài vỉa hè ➔ Mở cửa gỗ-kính 2 cánh xoay 90° bước vào quán
 *   ➔ Chọn ghế trống ngồi ➔ Gọi Phở Tái Nạm (Phục vụ tới nhận đơn ➔ Báo bếp ➔ Đầu bếp múc nước dùng bốc khói
 *   ➔ Phục vụ bưng ra tận bàn cho Heo ăn!) ➔ Đứng dậy tự do vào khu Bếp xem Đầu bếp nấu ăn & khách ra vào.
 */
export const PhoRestaurantBannerWebView: React.FC<PhoRestaurantBannerWebViewProps> = ({
  onExitPho,
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
    } else if (d.type === 'EXIT_PHO' && onExitPho) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => onExitPho(), 120);
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

  const tpsEngineScript = useMemo(() => buildTps3dEngineScript(), []);
  const phoSceneScript = useMemo(() => buildPhoTps3dSceneScript(), []);

  const htmlContent = useMemo(
    () => `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #2B2118; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
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
    position: fixed; top: 16px; left: 68px; right: 16px;
    pointer-events: none; display: flex; justify-content: center; z-index: 10;
  }
  .hud-toast-pill {
    background: rgba(255, 251, 241, 0.94);
    border: 3px solid #2B2118;
    border-radius: 14px;
    padding: 6px 12px;
    font-size: 12px; font-weight: 800; color: #2B2118;
    box-shadow: 0 3px 0 #2B2118;
    text-align: center; max-width: 340px;
  }
  .action-bar {
    position: fixed; bottom: 26px; left: 16px; right: 16px;
    display: flex; justify-content: center; gap: 10px;
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
<canvas id="phoTpsCv" width="280" height="440"></canvas>
<div class="hud-toast"><div id="toastPill" class="hud-toast-pill">Chạm sàn để đi · Vuốt để xoay góc nhìn 360°</div></div>
<div id="actionBar" class="action-bar" hidden>
  <button id="primaryActBtn" class="action-btn" type="button"></button>
  <button id="secActBtn" class="action-btn sec" type="button" hidden></button>
</div>
<script>
window.onerror = function(msg, src, line) {
  try {
    var payload = JSON.stringify({ type: 'WEBVIEW_ERROR', msg: String(msg), line: line });
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(payload);
    else if (window.parent && window.parent !== window) window.parent.postMessage(payload, '*');
  } catch(e) {}
};
(function(){
function postHost(obj) {
  try {
    var s = JSON.stringify(obj);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  } catch(e) {}
}

${tpsEngineScript}
${phoSceneScript}

var cam = createTpsCamera({ yaw: 0, pitch: -0.34, dist: 3.9, targetHeight: 0.95 });
var world = createPhoTpsWorld();
var currentAction = null;
var lastToast = '';
var lastTime = performance.now();
var keys = {};

var cv = document.getElementById('phoTpsCv');
var toastEl = document.getElementById('toastPill');
var actionBar = document.getElementById('actionBar');
var primaryBtn = document.getElementById('primaryActBtn');
var secBtn = document.getElementById('secActBtn');

function syncViewport() {
  if (!cv) return;
  var rect = cv.getBoundingClientRect();
  if (!rect || !rect.width || !rect.height) return;
  var aspect = rect.width / rect.height;
  var baseW = 280;
  var vh = Math.max(240, Math.min(540, Math.round(baseW / Math.max(0.42, Math.min(2.2, aspect)))));
  var vw = Math.max(220, Math.min(540, Math.round(vh * aspect)));
  if (cv.width !== vw || cv.height !== vh) {
    cv.width = vw;
    cv.height = vh;
  }
}

// Cảm ứng & Chuột chuẩn Zero-Joystick: Chạm (< 8px) = Raycast Tap-to-Walk; Vuốt (>= 8px) = Xoay Camera 360°!
var ptr = { down: false, id: null, sx: 0, sy: 0, lx: 0, ly: 0, moved: 0 };

function onDown(x, y, id) {
  ptr.down = true; ptr.id = id; ptr.sx = x; ptr.sy = y; ptr.lx = x; ptr.ly = y; ptr.moved = 0;
}
function onMove(x, y) {
  if (!ptr.down) return;
  var dx = x - ptr.lx, dy = y - ptr.ly;
  ptr.lx = x; ptr.ly = y;
  ptr.moved += Math.hypot(dx, dy);
  if (ptr.moved >= 6) {
    cam.yaw = normalizeAngle(cam.yaw + dx * 0.0085);
    cam.pitch = Math.max(-0.68, Math.min(-0.14, cam.pitch - dy * 0.0045));
  }
}
function onUp(x, y) {
  if (!ptr.down) return;
  ptr.down = false;
  if (ptr.moved < 9 && cv) {
    var rect = cv.getBoundingClientRect();
    var cx = ((x - rect.left) / rect.width) * cv.width;
    var cy = ((y - rect.top) / rect.height) * cv.height;
    var hit = unprojectFloorTap(cam, cx, cy);
    if (hit) {
      if (world.pig.seated) {
        world.toastText = 'Heo đang ngồi ghế! Bấm Gọi Phở hoặc Đứng dậy nhé!';
      } else {
        var clamped = clampPigWorldPos(world, hit.x, hit.z);
        world.pig.tx = clamped.x;
        world.pig.tz = clamped.z;
        world.pig.walking = true;
        world.targetMarker = { x: clamped.x, z: clamped.z, ttl: 0.9 };
        postHost({ type: 'HAPTIC_LIGHT' });
      }
    }
  }
}

cv.addEventListener('pointerdown', function(e) {
  e.preventDefault();
  onDown(e.clientX, e.clientY, e.pointerId);
});
window.addEventListener('pointermove', function(e) {
  if (ptr.down) { e.preventDefault(); onMove(e.clientX, e.clientY); }
}, { passive: false });
window.addEventListener('pointerup', function(e) {
  if (ptr.down) onUp(e.clientX, e.clientY);
});
window.addEventListener('pointercancel', function() { ptr.down = false; });

// Hỗ trợ thêm phím WASD / Mũi tên cho người dùng Web desktop
window.addEventListener('keydown', function(e) { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', function(e) { keys[e.key.toLowerCase()] = false; });

function handleActionClick(actId, seatRef) {
  postHost({ type: 'HAPTIC_MEDIUM' });
  if (actId === 'exit_pho') {
    postHost({ type: 'EXIT_PHO' });
    return;
  }
  triggerPhoAction(world, actId, seatRef);
}

primaryBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  if (currentAction) handleActionClick(currentAction.id, currentAction.seatRef);
});
secBtn.addEventListener('click', function(e) {
  e.stopPropagation();
  if (currentAction && currentAction.secondary) handleActionClick(currentAction.secondary.id, null);
});

function syncHud() {
  if (world.toastText !== lastToast) {
    lastToast = world.toastText;
    toastEl.textContent = lastToast;
  }
  var act = getPhoContextAction(world);
  currentAction = act;
  if (!act) {
    actionBar.hidden = true;
  } else {
    actionBar.hidden = false;
    primaryBtn.textContent = act.label;
    if (act.secondary) {
      secBtn.hidden = false;
      secBtn.textContent = act.secondary.label;
    } else {
      secBtn.hidden = true;
    }
  }
}

function frame(now) {
  var dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  // Hỗ trợ di chuyển bằng phím WASD theo hướng Camera TPS
  if (!world.pig.seated) {
    var fwd = (keys['w'] || keys['arrowup'] ? 1 : 0) - (keys['s'] || keys['arrowdown'] ? 1 : 0);
    var strafe = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0);
    if (fwd !== 0 || strafe !== 0) {
      var mx = Math.sin(cam.yaw) * fwd + Math.cos(cam.yaw) * strafe;
      var mz = Math.cos(cam.yaw) * fwd - Math.sin(cam.yaw) * strafe;
      var ml = Math.hypot(mx, mz) || 1;
      var nx = world.pig.x + (mx / ml) * 3.5 * dt;
      var nz = world.pig.z + (mz / ml) * 3.5 * dt;
      var cl = clampPigWorldPos(world, nx, nz);
      world.pig.x = cl.x; world.pig.z = cl.z;
      world.pig.tx = cl.x; world.pig.tz = cl.z;
      world.pig.yaw = Math.atan2(mx, mz);
      world.pig.walking = true;
    }
  }

  stepPhoTpsWorld(world, dt);
  syncViewport();

  var ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cv.width, cv.height);

  updateTpsCamera(cam, world.pig.x, world.pig.seated ? 0.35 : 0, world.pig.z, cv.width, cv.height, {
    minX: -5.85, maxX: 5.85, minZ: -6.2, maxZ: 14.2
  });
  renderPhoTps3D(ctx, cam, world);
  syncHud();

  requestAnimationFrame(frame);
}

window.addEventListener('resize', syncViewport);
syncViewport();
requestAnimationFrame(frame);
})();
</script>
</body>
</html>`,
    [tpsEngineScript, phoSceneScript]
  );

  if (!ready) return null;

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          srcDoc={htmlContent}
          title="Quán Phở Cổ Truyền — Góc Nhìn Thứ 3 TPS 3D"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
            backgroundColor: '#2B2118',
          }}
        />
      ) : (
        <SafeWebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          scrollEnabled={false}
          bounces={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          javaScriptEnabled
          domStorageEnabled
          containerStyle={styles.webview}
          style={styles.webview}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#2B2118',
  },
  webview: {
    flex: 1,
    width: '100%',
    backgroundColor: '#2B2118',
  },
});
