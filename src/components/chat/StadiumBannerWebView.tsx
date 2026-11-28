import React, { useEffect, useMemo, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { WebglTpsBannerShell } from './WebglTpsBannerShell';
import { buildStadiumWallArtScript } from './stadium/stadiumWallArt';
import { buildStadiumTps3dSceneScript } from './stadium/stadiumTps3dScene';

interface StadiumBannerWebViewProps {
  onExitStadium?: () => void;
}

/**
 * Sân Vận Động Trống Đồng FIFA WebGL 3D Hợp Nhất 3 Cao Độ (Quyết định 250)
 * - Dùng khung dùng chung WebglTpsBannerShell (0-CDN, SafeWebView + <iframe srcDoc>, 0% cắt cảnh).
 * - Hợp nhất không gian liên hoàn: `locker_tunnel` (Y = 0) ↔ Dốc Đường Hầm FIFA (Y: 0 → 0.8) ↔ `pitch_arena` (Y = 0.8)
 *   VÀ Cầu Thang Bộ VIP 12 Bậc (32.2°, Y: 0 → 3.4) ↔ `trophy_vip` & Hành Lang Kính Skybox đúc hẫng (Y = 3.4).
 * - Giao diện sạch chuẩn TPS 3D: không thanh chuyển phòng, không cắt cảnh fade, chỉ giữ tối đa 1 Context Action Pill.
 */
export const StadiumBannerWebView: React.FC<StadiumBannerWebViewProps> = ({
  onExitStadium,
}) => {
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const wallArtScript = useMemo(() => buildStadiumWallArtScript(), []);
  const sceneScript = useMemo(() => buildStadiumTps3dSceneScript(), []);

  const initScript = useMemo(
    () => `
(function() {
  var cv = document.getElementById('tpsCv');
  var ctxBtn = document.getElementById('ctxPillBtn');
  var wgl = createPixelWebglRenderer(cv);
  var ctx = wgl ? null : cv.getContext('2d');
  if (wgl) buildStadiumProceduralTextures(wgl);

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

  var st = createStadiumTpsState();
  var cam = createTpsCamera({ yaw: 0.06, pitch: -0.30, dist: 4.85, targetHeight: 0.72 });
  var stadiumBounds = { minX: -18.5, maxX: 18.5, minZ: -0.2, maxZ: 50.0, maxY: 14.0 };
  var exitSent = false;
  var currentCtxAction = null;

  function updateContextPill() {
    if (!ctxBtn) return;
    var p = st.pig;
    var z = st.zone || 'locker_tunnel';
    var nextAct = null;

    if (z === 'locker_tunnel' && p.z <= 2.15 && Math.abs(p.x) <= 2.25) {
      nextAct = { id: 'exit_stadium', label: '🚪 Ra lại Đại Lộ Sài Gòn' };
    } else if (z === 'locker_tunnel' && p.x <= -2.1 && p.z >= 1.5 && p.z <= 11.9) {
      nextAct = {
        id: 'wear_kit',
        label: p.wearingVietnamKit ? '👕 Cất Áo Đấu ĐT Việt Nam' : '⚽ Mặc Áo Đấu ĐT Việt Nam #10'
      };
    } else if (z === 'pitch_arena') {
      nextAct = { id: 'shoot_goal', label: '🥅 Sút Bóng Ghi Bàn Cho Việt Nam!' };
    } else if ((z === 'trophy_vip' || z === 'skybox') && p.z >= 7.8 && p.z <= 14.5) {
      nextAct = { id: 'lift_trophy', label: '🏆 Nâng Cúp Vàng Vô Địch Việt Nam!' };
    }

    currentCtxAction = nextAct;
    if (nextAct) {
      if (ctxBtn.textContent !== nextAct.label) ctxBtn.textContent = nextAct.label;
      ctxBtn.hidden = false;
    } else {
      ctxBtn.hidden = true;
    }
  }

  function triggerContextAction(act) {
    if (!act) return;
    postRN({ type: 'HAPTIC_MEDIUM' });
    if (act.id === 'wear_kit') {
      executeStadiumAction(st, 'wear_kit');
    } else if (act.id === 'shoot_goal') {
      executeStadiumAction(st, 'shoot_goal');
    } else if (act.id === 'lift_trophy') {
      executeStadiumAction(st, 'lift_trophy');
    } else if (act.id === 'exit_stadium') {
      executeStadiumAction(st, 'exit_stadium');
    }
  }

  if (ctxBtn) {
    ctxBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      triggerContextAction(currentCtxAction);
    });
  }

  bindTpsCanvasGestures(cv, cam, {
    minPitch: -0.74,
    getSize: function() { return { w: W, h: H }; },
    onTap: function(sx, sy) {
      var target = wgl ? pickStadiumTarget3D(cam, st, sx, sy) : null;
      if (!wgl && !target) {
        var hit = unprojectFloorTap(cam, sx, sy);
        if (hit) target = { kind: 'floor', x: hit.x, y: 0, z: hit.z };
      }
      if (target) {
        planStadiumRealtimePath(st, target.x, target.y, target.z, {
          targetKind: target.kind,
          pendingAction: target.pendingAction || null
        });
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
      stepStadiumTps(st, dt);
      if (st.exiting && !exitSent && st.exitFade >= 0.85) {
        exitSent = true;
        postRN({ type: 'EXIT_STADIUM' });
      }
      if (wgl) {
        cam.vw = W; cam.vh = H;
        var asp = W / Math.max(1, H);
        var fovy = asp < 1 ? Math.min(1.68, 2 * Math.atan(Math.tan(0.54) / Math.max(0.42, asp))) : 0.82;
        cam.activeFovy = fovy;
        cam.focal = (H * 0.5) / Math.tan(fovy * 0.5);
        renderStadiumWebglScene(wgl, cam, st, W, H);
      } else {
        updateTpsCamera(cam, st.pig.x, st.pig.y || 0, st.pig.z, W, H, stadiumBounds);
        renderStadiumTpsScene(ctx, cam, st, W, H);
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
    if (d.type === 'EXIT_STADIUM' && onExitStadium) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => onExitStadium(), 120);
    }
  };

  return (
    <WebglTpsBannerShell
      title="Sân Vận Động Trống Đồng FIFA WebGL 3D"
      backgroundHex="#2B120C"
      wallArtScript={wallArtScript}
      sceneScript={sceneScript}
      initScript={initScript}
      onPayload={handlePayload}
    />
  );
};
