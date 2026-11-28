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
  var cam = createTpsCamera({ yaw: 0.04, pitch: -0.22, dist: 4.85, targetHeight: 0.72 });
  var stadiumBounds = { minX: -26.0, maxX: 26.0, minZ: -0.5, maxZ: 88.0, maxY: 18.0 };
  var exitSent = false;
  var currentCtxAction = null;
  var wasSeated = false;

  function updateContextPill() {
    if (!ctxBtn) return;
    var p = st.pig;
    var z = st.zone || 'fan_concourse';
    var nextAct = null;

    if (p.seated) {
      nextAct = { id: 'cheer_wave', label: '📣 Hô Vang "Việt Nam Vô Địch!" (Sóng Người)' };
    } else if (z === 'fan_concourse' && p.z <= 1.8 && Math.abs(p.x) <= 2.6) {
      nextAct = { id: 'exit_stadium', label: '🚪 Ra khỏi SVĐ Trống Đồng' };
    } else if (z === 'fan_concourse' && p.x >= 1.2 && p.z >= 5.2 && p.z <= 10.2) {
      nextAct = {
        id: 'wear_kit',
        label: p.wearingVietnamKit ? '👕 Cất Áo Đấu ĐT Việt Nam' : '🧣 Mặc Áo & Khăn Cổ Vũ Việt Nam'
      };
    } else if (z === 'home_locker') {
      nextAct = {
        id: 'wear_kit',
        label: p.wearingVietnamKit ? '👕 Cất Áo Đấu ĐT Việt Nam' : '⚽ Mặc Áo Đấu ĐT Việt Nam #10'
      };
    } else if (z === 'away_locker') {
      nextAct = { id: 'inspect_away_tactics', label: '📋 Xem Sa Bàn Chiến Thuật Đội Khách' };
    } else if (z === 'fan_concourse' || z === 'player_tunnel' || z === 'pitchside') {
      nextAct = { id: 'go_stands_seat', label: '🪜 Lên Khán Đài Ngồi Xem Trận 11v11' };
    } else if (z === 'stands_south') {
      nextAct = { id: 'sit_nearest_seat', label: '🪑 Ngồi Ghế VIP Khán Đài Xem 11v11' };
    } else if (z === 'trophy_vip') {
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

  function findNearestSeat(px) {
    if (!st.stools || !st.stools.length) return { id: 2, x: -0.36, z: 37.2 };
    var best = st.stools[0], bestD = 999;
    for (var i = 0; i < st.stools.length; i++) {
      var d = Math.abs(st.stools[i].x - px);
      if (d < bestD) { bestD = d; best = st.stools[i]; }
    }
    return best;
  }

  function triggerContextAction(act) {
    if (!act) return;
    postRN({ type: 'HAPTIC_MEDIUM' });
    if (act.id === 'wear_kit' || act.id === 'inspect_away_tactics' || act.id === 'cheer_wave' || act.id === 'lift_trophy' || act.id === 'exit_stadium') {
      executeStadiumAction(st, act.id);
    } else if (act.id === 'go_stands_seat' || act.id === 'sit_nearest_seat') {
      var seat = findNearestSeat(st.pig.x || 0);
      planStadiumRealtimePath(st, seat.x, 3.4, seat.z, { targetKind: 'seat', seatChairId: seat.id });
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
          seatChairId: target.seatChairId,
          pendingAction: target.pendingAction || null
        });
        st.ripples.push({ x: target.x, y: target.y, z: target.z, t: 0 });
        postRN({ type: (target.pendingAction || target.kind === 'seat') ? 'HAPTIC_MEDIUM' : 'HAPTIC_LIGHT' });
      }
    }
  });

  var lastNow = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
    lastNow = now;
    if (window.__isActive !== false) {
      stepStadiumTps(st, dt);
      if (st.pig.seated && !wasSeated) {
        wasSeated = true;
        cam.yaw = 0.0; cam.pitch = -0.22; cam.dist = 4.35;
      } else if (!st.pig.seated) {
        wasSeated = false;
      }
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
