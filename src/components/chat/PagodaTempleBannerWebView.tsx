import React, { useEffect, useMemo, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { WebglTpsBannerShell } from './WebglTpsBannerShell';
import { buildPagodaWallArtScript } from './pagoda/pagodaWallArt';
import { buildPagodaTps3dSceneScript } from './pagoda/pagodaTps3dScene';

interface PagodaTempleBannerWebViewProps {
  active?: boolean;
  onExitToHub?: () => void;
  onExitPagoda?: () => void;
}

/**
 * Ngôi Chùa Cổ Kính & Vườn Chùa WebGL 3D Hợp Nhất Không Cắt Cảnh (Quyết định 250)
 * - Hợp nhất Vườn Chùa (Chế độ B) ↔ Tam Cấp ↔ Chánh Điện ↔ Hành Lang Đông ↔ Nhà Chuông & Thiền Trà TÂM AN (Chế độ A).
 * - Dùng khung dùng chung WebglTpsBannerShell (0-CDN, SafeWebView + iframe srcDoc, không cắt cảnh).
 * - Tối đa 1 Context Action Pill (offer_incense, ring_bell, sit_tea, sip_tea, exit_pagoda) + Seated Auto-Stand.
 */
export const PagodaTempleBannerWebView: React.FC<PagodaTempleBannerWebViewProps> = ({
  active = true,
  onExitToHub,
  onExitPagoda,
}) => {
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const wallArtScript = useMemo(() => buildPagodaWallArtScript(), []);
  const sceneScript = useMemo(() => buildPagodaTps3dSceneScript(), []);

  const initScript = useMemo(
    () => `
(function() {
  var cv = document.getElementById('tpsCv');
  var pillBtn = document.getElementById('ctxPillBtn');
  var wgl = typeof createPixelWebglRenderer === 'function' ? createPixelWebglRenderer(cv) : null;
  var ctx = wgl ? null : cv.getContext('2d');
  if (wgl && typeof buildPagodaProceduralTextures === 'function') {
    buildPagodaProceduralTextures(wgl);
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

  var st = createPagodaTpsState();
  var cam = createTpsCamera({ yaw: 0.04, pitch: -0.30, dist: 4.55, targetHeight: 0.72 });
  var fallbackBounds = { minX: -6.2, maxX: 16.8, minZ: 0.0, maxZ: 27.6, maxY: 4.5 };
  var currentActionId = null;
  var exitSent = false;

  function updateContextPill() {
    if (!pillBtn) return;
    var p = st.pig;
    var actId = null;
    var label = '';
    var bg = '#F4B93B';
    var fg = '#2B2118';

    if (p.seated) {
      actId = 'sip_tea';
      label = '🍵 Nhâm nhi trà sen nóng';
    } else if (st.zone === 'main_hall' && p.z >= 21.4 && p.z <= 25.2 && Math.abs(p.x) <= 2.4) {
      actId = 'offer_incense';
      label = '🙏 Dâng hương cầu bình an';
      bg = '#991B1B';
      fg = '#FDE047';
    } else if (st.zone === 'bell_tea' && p.x >= 7.2 && p.x <= 11.4 && p.z >= 8.4 && p.z <= 13.8) {
      actId = 'ring_bell';
      label = '🔔 Thỉnh Đại Hồng Chung';
      bg = '#991B1B';
      fg = '#FDE047';
    } else if (st.zone === 'bell_tea' && p.x >= 11.2 && p.x <= 16.2 && p.z >= 7.2 && p.z <= 12.0) {
      actId = 'sit_tea';
      label = '🍵 Ngồi thưởng Thiền Trà';
    } else if (st.zone === 'garden' && p.z <= 2.3 && Math.abs(p.x) <= 2.4 && p.y < 0.25) {
      actId = 'exit_pagoda';
      label = '🚪 Ra lại Đại Lộ Sài Gòn';
    }

    currentActionId = actId;
    if (actId) {
      pillBtn.textContent = label;
      pillBtn.style.background = bg;
      pillBtn.style.color = fg;
      pillBtn.hidden = false;
    } else {
      pillBtn.hidden = true;
    }
  }

  if (pillBtn) {
    pillBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (!currentActionId) return;
      postRN({ type: 'HAPTIC_MEDIUM' });
      runPagodaContextAction(st, currentActionId);
    });
  }

  bindTpsCanvasGestures(cv, cam, {
    getSize: function() { return { w: W, h: H }; },
    onTap: function(sx, sy) {
      var target = wgl ? pickPagodaTarget3D(cam, st, sx, sy) : null;
      if (!wgl && !target) {
        var hit = unprojectFloorTap(cam, sx, sy);
        if (hit) target = { kind: 'floor', x: hit.x, y: getPagodaSurfaceY(hit.x, hit.z, st.pig.y), z: hit.z, pendingAction: null };
      }
      if (target) {
        // Seated Auto-Stand: planPagodaRealtimePath tự đặt pig.seated = false và dẫn Heo đi ngay!
        planPagodaRealtimePath(st, target.x, target.y, target.z, target.pendingAction);
        st.ripples.push({ x: target.x, y: target.y, z: target.z, t: 0 });
        postRN({ type: target.pendingAction ? 'HAPTIC_MEDIUM' : 'HAPTIC_LIGHT' });
      }
    }
  });

  var lastNow = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
    lastNow = now;
    if (window.__isActive !== false) {
      stepPagodaTps(st, dt);
      if (st.exiting && !exitSent && st.exitFade >= 0.85) {
        exitSent = true;
        postRN({ type: 'EXIT_PAGODA' });
      }
      if (wgl) {
        cam.vw = W; cam.vh = H;
        var asp = W / Math.max(1, H);
        var fovy = asp < 1 ? Math.min(1.68, 2 * Math.atan(Math.tan(0.54) / Math.max(0.42, asp))) : 0.82;
        cam.focal = (H * 0.5) / Math.tan(fovy * 0.5);
        renderPagodaWebglScene(wgl, cam, st, W, H);
      } else {
        updateTpsCamera(cam, st.pig.x, st.pig.y || 0, st.pig.z, W, H, fallbackBounds);
        renderPagodaTpsScene(ctx, cam, st, W, H);
      }
      updateContextPill();
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
    if (d.type === 'EXIT_PAGODA') {
      const exitFn = onExitPagoda || onExitToHub;
      if (exitFn) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        exitTimerRef.current = setTimeout(() => exitFn(), 120);
      }
    }
  };

  return (
    <WebglTpsBannerShell
      title="Ngôi Chùa Cổ Kính & Vườn Chùa WebGL 3D"
      backgroundHex="#4A2418"
      active={active}
      wallArtScript={wallArtScript}
      sceneScript={sceneScript}
      initScript={initScript}
      onPayload={handlePayload}
    />
  );
};
