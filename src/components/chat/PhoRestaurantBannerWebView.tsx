import React, { useEffect, useMemo, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { WebglTpsBannerShell } from './WebglTpsBannerShell';
import { buildPhoTps3dSceneScript } from './pho/phoTps3dScene';
import { buildPhoVnWallArtScript } from './pho/phoVnWallArt';

interface PhoRestaurantBannerWebViewProps {
  onExitPho?: () => void;
}

/**
 * Quán Phở Cổ Truyền 1990s — WebGL 3D & TPS 3D Interior-Only (Quyết định 236 & 250)
 * - Dùng khung dùng chung WebglTpsBannerShell (0-CDN, SafeWebView + iframe srcDoc, 1 Context Action Pill #ctxPillBtn).
 * - Camera góc nhìn thứ 3 rộng (dist: 4.7, pitch: -0.32, targetHeight: 0.72), 100% nội thất kín Chế độ A.
 * - Seated Pig Auto-Stand: chạm sàn/ghế/bếp/cửa khi đang ngồi tự động đứng dậy đi ngay (0% soft-lock).
 */
export const PhoRestaurantBannerWebView: React.FC<PhoRestaurantBannerWebViewProps> = ({
  onExitPho,
}) => {
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const wallArtScript = useMemo(() => buildPhoVnWallArtScript(), []);
  const sceneScript = useMemo(() => buildPhoTps3dSceneScript(), []);

  const initScript = useMemo(
    () => `
(function() {
  var cv = document.getElementById('tpsCv');
  var pillBtn = document.getElementById('ctxPillBtn');
  var wgl = typeof createPixelWebglRenderer === 'function' ? createPixelWebglRenderer(cv) : null;
  var ctx = wgl ? null : cv.getContext('2d');
  if (wgl && typeof buildPhoProceduralTextures === 'function') buildPhoProceduralTextures(wgl);

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

  var world = createPhoTpsWorld();
  var cam = createTpsCamera({ yaw: 0.06, pitch: -0.32, dist: 4.7, targetHeight: 0.72 });
  var phoBounds = { minX: -6.0, maxX: 6.0, minZ: 0.0, maxZ: 14.8, maxY: 3.85 };
  var currentAction = null;
  var lastPillKey = '';
  var exitSent = false;
  var keys = {};

  function syncCtxPill() {
    if (!pillBtn) return;
    var act = getPhoContextAction(world);
    currentAction = act;
    var key = act ? (act.id + ':' + act.label) : '';
    if (key === lastPillKey) return;
    lastPillKey = key;
    if (!act) {
      pillBtn.hidden = true;
      pillBtn.textContent = '';
    } else {
      pillBtn.hidden = false;
      pillBtn.textContent = act.label;
    }
  }

  if (pillBtn) {
    pillBtn.addEventListener('pointerdown', function(e) { e.stopPropagation(); });
    pillBtn.addEventListener('touchstart', function(e) { e.stopPropagation(); }, { passive: true });
    pillBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (!currentAction) return;
      postRN({ type: 'HAPTIC_MEDIUM' });
      if (currentAction.id === 'exit_pho') {
        world.exiting = true;
        return;
      }
      if (currentAction.id === 'waiting_pho' || currentAction.id === 'eating_now') return;
      triggerPhoAction(world, currentAction.id, currentAction.seatRef);
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
      var sx = ((pt.x - rect.left) / Math.max(1, rect.width)) * W;
      var sy = ((pt.y - rect.top) / Math.max(1, rect.height)) * H;
      var target = wgl ? pickPhoTarget3D(cam, world, sx, sy) : null;
      if (!target) {
        var hit = unprojectFloorTap(cam, sx, sy);
        if (hit) target = { kind: 'floor', x: hit.x, z: hit.z, seatRef: null, actionTag: null };
      }
      if (target) {
        planPhoRealtimePath(world, target.x, target.z, target.seatRef || null, target.actionTag || null);
        world.ripples.push({ x: target.x, z: target.z, t: 0 });
        world.targetMarker = { x: target.x, z: target.z, ttl: 0.9 };
        postRN({ type: target.kind === 'seat' ? 'HAPTIC_MEDIUM' : 'HAPTIC_LIGHT' });
      }
    }
  }
  cv.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove, { passive: false });
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', function() { dragging = false; });
  cv.addEventListener('touchstart', onDown, { passive: false });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onUp);
  window.addEventListener('touchcancel', function() { dragging = false; });

  window.addEventListener('keydown', function(e) { keys[String(e.key || '').toLowerCase()] = true; });
  window.addEventListener('keyup', function(e) { keys[String(e.key || '').toLowerCase()] = false; });

  var lastNow = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
    lastNow = now;
    if (window.__isActive !== false) {
      var fwd = (keys['w'] || keys['arrowup'] ? 1 : 0) - (keys['s'] || keys['arrowdown'] ? 1 : 0);
      var strafe = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0);
      if (fwd !== 0 || strafe !== 0) {
        if (world.pig.seated) {
          planPhoRealtimePath(world, world.pig.x, world.pig.z, null, null);
        }
        var strafeSign = wgl ? -1 : 1;
        var mx = Math.sin(cam.yaw) * fwd + Math.cos(cam.yaw) * strafe * strafeSign;
        var mz = Math.cos(cam.yaw) * fwd - Math.sin(cam.yaw) * strafe * strafeSign;
        var ml = Math.hypot(mx, mz) || 1;
        var cl = clampPigWorldPos(world, world.pig.x + (mx / ml) * 3.5 * dt, world.pig.z + (mz / ml) * 3.5 * dt);
        world.pig.x = cl.x; world.pig.z = cl.z;
        world.pig.tx = cl.x; world.pig.tz = cl.z;
        world.pig.waypoints = [];
        world.pig.yaw = Math.atan2(mx, mz);
        world.pig.walking = true;
      }

      stepPhoTpsWorld(world, dt);
      if (world.exiting && !exitSent && world.exitFade >= 0.85) {
        exitSent = true;
        postRN({ type: 'EXIT_PHO' });
      }

      if (wgl) {
        cam.vw = W; cam.vh = H;
        var asp = W / Math.max(1, H);
        var fovy = asp < 1 ? Math.min(1.68, 2 * Math.atan(Math.tan(0.54) / Math.max(0.42, asp))) : 0.82;
        cam.focal = (H * 0.5) / Math.tan(fovy * 0.5);
        renderPhoWebglScene(wgl, cam, world, W, H);
      } else {
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, W, H);
        updateTpsCamera(cam, world.pig.x, world.pig.seated ? 0.38 : 0, world.pig.z, W, H, phoBounds);
        renderPhoTps3D(ctx, cam, world);
      }
      syncCtxPill();
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
    if (d.type === 'EXIT_PHO' && onExitPho) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => onExitPho(), 120);
    }
  };

  return (
    <WebglTpsBannerShell
      title="Quán Phở Cổ Truyền WebGL 3D"
      backgroundHex="#2B2118"
      wallArtScript={wallArtScript}
      sceneScript={sceneScript}
      initScript={initScript}
      onPayload={handlePayload}
    />
  );
};
