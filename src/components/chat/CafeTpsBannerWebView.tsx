import React, { useEffect, useMemo, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { WebglTpsBannerShell } from './WebglTpsBannerShell';
import { buildCafeWebgl3dEngineScript } from './cafe/cafeWebgl3dEngine';
import { buildCafeVnWallArtScript } from './cafe/cafeVnWallArt';
import { buildCafeTps3dSceneScript } from './cafe/cafeTps3dScene';

interface CafeTpsBannerWebViewProps {
  onExitCafe?: () => void;
  onOpenChat?: () => void;
}

/**
 * Quán Cộng Cà Phê 2 Tầng WebGL 3D — Chuẩn Tham Chiếu Toàn Hệ Thống (Quyết định 248–250)
 * - Dùng khung dùng chung WebglTpsBannerShell (0-CDN, SafeWebView + iframe srcDoc, 0% card viền).
 * - Góc nhìn thứ 3 rộng chuẩn Quán Phở (~64° HFOV), chú Heo 24×20 & Barista/Khách NPC Pixel Art gl.NEAREST rõ khuôn mặt.
 * - Chạm sàn / bậc cầu thang (rayRampQuad) / 11 ghế / Quầy Bar / Heo AI / Cửa chính để đi bộ real-time 2 tầng không cắt đoạn.
 */
export const CafeTpsBannerWebView: React.FC<CafeTpsBannerWebViewProps> = ({
  onExitCafe,
  onOpenChat,
}) => {
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const wallArtScript = useMemo(() => {
    // Giữ tham chiếu buildCafeWebgl3dEngineScript() đồng bộ shim với WebglTpsBannerShell
    void buildCafeWebgl3dEngineScript;
    return buildCafeVnWallArtScript();
  }, []);

  const sceneScript = useMemo(() => buildCafeTps3dSceneScript(), []);

  const initScript = useMemo(
    () => `
(function() {
  var cv = document.getElementById('tpsCv');
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
  var cam = createTpsCamera({ yaw: 0.08, pitch: -0.32, dist: 4.85, targetHeight: 0.72 });
  var cafeBounds = { minX: -5.5, maxX: 5.5, minZ: -2.2, maxZ: 14.0, maxY: 6.8 };
  var exitSent = false;

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
    if (window.__isActive !== false) {
      stepCafeTps(st, dt);
      if (st.exiting && !exitSent && st.exitFade >= 0.85) {
        exitSent = true;
        postRN({ type: 'EXIT_CAFE' });
      }
      if (wgl) {
        cam.vw = W; cam.vh = H;
        var asp = W / Math.max(1, H);
        var fovy = asp < 1 ? Math.min(1.68, 2 * Math.atan(Math.tan(0.54) / Math.max(0.42, asp))) : 0.82;
        cam.focal = (H * 0.5) / Math.tan(fovy * 0.5);
        renderCafeWebglScene(wgl, cam, st, W, H);
      } else {
        updateTpsCamera(cam, st.pig.x, 0, st.pig.z, W, H, cafeBounds);
        renderCafeTpsScene(ctx, cam, st, W, H);
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
`,
    []
  );

  const handlePayload = (d: any) => {
    if (!d) return;
    if (d.type === 'EXIT_CAFE' && onExitCafe) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => onExitCafe(), 120);
    } else if (d.type === 'OPEN_AI_CHAT' && onOpenChat) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      onOpenChat();
    }
  };

  return (
    <WebglTpsBannerShell
      title="Cộng Cà Phê 2 Tầng WebGL 3D"
      backgroundHex="#2D3522"
      wallArtScript={wallArtScript}
      sceneScript={sceneScript}
      initScript={initScript}
      onPayload={handlePayload}
    />
  );
};
