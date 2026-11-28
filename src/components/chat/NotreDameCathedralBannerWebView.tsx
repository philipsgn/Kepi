import React, { useEffect, useMemo, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { WebglTpsBannerShell } from './WebglTpsBannerShell';
import { buildCathedralWallArtScript } from './cathedral/cathedralWallArt';
import { buildCathedralTps3dSceneScript } from './cathedral/cathedralTps3dScene';

interface NotreDameCathedralBannerWebViewProps {
  active?: boolean;
  onExitCathedral?: () => void;
  onExitToHub?: () => void;
}

/**
 * Nhà Thờ Đức Bà Sài Gòn WebGL 3D Hợp Nhất Không Cắt Cảnh (Quyết định 250)
 * - Sử dụng khung WebglTpsBannerShell (0-CDN, SafeWebView + iframe srcDoc, không cắt cảnh chuyển phòng).
 * - Đại Thánh Đường 1 thế giới liên hoàn: Thánh Đường Chính (Y=0) ↔ 3 Bậc Cẩm Thạch ↔ Cung Thánh (Y=0.45)
 *   ↔ Cầu thang chữ L 14 bậc (33.7°) ↔ Gác Đàn Ống & Tháp Chuông (Y=4.0), trần vòm Gothic 7.8m.
 * - 10 giáo dân parishioner & chú Heo 24×20 gl.NEAREST, Portal-Aware Spring-Arm & 1 Context Action Pill.
 */
export const NotreDameCathedralBannerWebView: React.FC<NotreDameCathedralBannerWebViewProps> = ({
  active = true,
  onExitCathedral,
  onExitToHub,
}) => {
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const wallArtScript = useMemo(() => buildCathedralWallArtScript(), []);
  const sceneScript = useMemo(() => buildCathedralTps3dSceneScript(), []);

  const initScript = useMemo(
    () => `
(function() {
  var cv = document.getElementById('tpsCv');
  var ctxPillBtn = document.getElementById('ctxPillBtn');
  var wgl = typeof createPixelWebglRenderer === 'function' ? createPixelWebglRenderer(cv) : null;
  var ctx = wgl ? null : cv.getContext('2d');
  if (wgl && typeof buildCathedralProceduralTextures === 'function') {
    buildCathedralProceduralTextures(wgl);
  }

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

  var st = createCathedralTpsState();
  var cam = createTpsCamera({ yaw: 0.04, pitch: -0.26, dist: 4.85, targetHeight: 0.72 });
  var cathedralBounds = { minX: -15.2, maxX: 6.0, minZ: 0.0, maxZ: 24.4, maxY: 7.8 };
  var currentAction = null;
  var exitSent = false;

  function syncContextPill() {
    if (!ctxPillBtn) return;
    var act = getCathedralContextAction(st);
    currentAction = act;
    if (act) {
      if (ctxPillBtn.textContent !== act.label) ctxPillBtn.textContent = act.label;
      ctxPillBtn.hidden = false;
    } else {
      ctxPillBtn.hidden = true;
    }
  }

  function triggerContextAction(act) {
    if (!act) return;
    postRN({ type: 'HAPTIC_MEDIUM' });
    if (act.id === 'light_candle') {
      lightCathedralCandle(st);
    } else if (act.id === 'pray_mary') {
      prayCathedralMary(st);
    } else if (act.id === 'inspect_organ') {
      inspectCathedralOrgan(st);
    } else if (act.id === 'ring_bell') {
      ringCathedralBell(st);
    } else if (act.id === 'dip_holy_water') {
      dipCathedralHolyWater(st);
    } else if (act.id === 'exit_cathedral') {
      st.exiting = true;
    }
  }

  if (ctxPillBtn) {
    ctxPillBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      triggerContextAction(currentAction);
    });
  }

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
      var target = wgl ? pickCathedralTarget3D(cam, st, sx, sy) : null;
      if (!target) {
        var hit = unprojectFloorTap(cam, sx, sy);
        if (hit) target = { kind: 'floor', x: hit.x, y: st.pig.y >= 3.2 ? 4.0 : (hit.z >= 14.8 ? 0.45 : 0), z: hit.z };
      }
      if (target) {
        planCathedralRealtimePath(st, target.x, target.y, target.z, target.pendingAction || null, target);
        st.ripples.push({ x: target.x, y: target.y, z: target.z, t: 0 });
        postRN({ type: target.pendingAction ? 'HAPTIC_MEDIUM' : 'HAPTIC_LIGHT' });
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
      stepCathedralTps(st, dt);
      if (st.exiting && !exitSent && st.exitFade >= 0.85) {
        exitSent = true;
        postRN({ type: 'EXIT_CATHEDRAL' });
      }
      if (wgl) {
        cam.vw = W; cam.vh = H;
        var asp = W / Math.max(1, H);
        var fovy = asp < 1 ? Math.min(1.68, 2 * Math.atan(Math.tan(0.54) / Math.max(0.42, asp))) : 0.82;
        cam.focal = (H * 0.5) / Math.tan(fovy * 0.5);
        renderCathedralWebglScene(wgl, cam, st, W, H);
      } else {
        updateTpsCamera(cam, st.pig.x, st.pig.y || 0, st.pig.z, W, H, cathedralBounds);
        renderCathedralTpsScene(ctx, cam, st, W, H);
      }
      syncContextPill();
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
    if (d.type === 'EXIT_CATHEDRAL') {
      const exitHandler = onExitCathedral || onExitToHub;
      if (exitHandler) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        exitTimerRef.current = setTimeout(() => exitHandler(), 120);
      }
    }
  };

  return (
    <WebglTpsBannerShell
      title="Nhà Thờ Đức Bà Sài Gòn WebGL 3D"
      backgroundHex="#2C1D16"
      active={active}
      wallArtScript={wallArtScript}
      sceneScript={sceneScript}
      initScript={initScript}
      onPayload={handlePayload}
    />
  );
};
