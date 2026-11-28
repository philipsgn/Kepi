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
 * Quán Cà Phê Sài Gòn 2 Tầng WebGL 3D — Chuẩn Tham Chiếu Toàn Hệ Thống (Quyết định 248–251)
 * - Dùng khung dùng chung WebglTpsBannerShell (0-CDN, SafeWebView + iframe srcDoc, 0% card viền).
 * - Mặt tiền vàng kem #F7E7C6 đồng bộ Tab Banner nhìn ra Sông Bạch Đằng, 0 ban công, 15 bàn Tầng 2, Cây Noel 3D & Xe máy cổ 3D Tầng 1.
 * - Góc nhìn thứ 3 rộng chuẩn Quán Phở (~64° HFOV), chú Heo 24×20 đi bộ 3.6 m/s mượt & Barista/Khách NPC Pixel Art gl.NEAREST rõ khuôn mặt.
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
  var cafeBounds = { minX: -7.0, maxX: 7.0, minZ: 0.0, maxZ: 16.2, maxY: 6.9 };
  var exitSent = false;

  bindTpsCanvasGestures(cv, cam, {
    getSize: function() { return { w: W, h: H }; },
    onTap: function(sx, sy) {
      var target = wgl ? pickCafeTarget3D(cam, st, sx, sy) : null;
      if (!wgl && !target) {
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
  });

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
      title="Quán Cà Phê Sài Gòn 2 Tầng WebGL 3D"
      backgroundHex="#2D3522"
      wallArtScript={wallArtScript}
      sceneScript={sceneScript}
      initScript={initScript}
      onPayload={handlePayload}
    />
  );
};
