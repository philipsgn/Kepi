import React, { useEffect, useMemo, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { WebglTpsBannerShell } from './WebglTpsBannerShell';
import { buildAdidasWallArtScript } from './adidas/adidasWallArt';
import { buildAdidasTps3dSceneScript } from './adidas/adidasTps3dScene';

interface AdidasStoreBannerWebViewProps {
  onExitAdidas?: () => void;
}

/**
 * Cửa Hàng Adidas Originals Hội An WebGL 3D Hợp Nhất Liên Hoàn (Quyết định 250)
 * - Sử dụng khung WebglTpsBannerShell (0-CDN, SafeWebView + iframe srcDoc, 0% card viền/switcher).
 * - Hợp nhất không gian Chế độ A kín 100%: hall (Tầng 1) ↔ fitting (Phòng Thay Đồ cánh phải qua vòm X=6.0)
 *   ↔ Cầu thang gỗ Hội An 12 bậc ↔ upper (Lầu 2 BST Việt Nam & Thu ngân POS).
 * - Giữ nguyên chú Heo Pixel Art 24×20 (gl.NEAREST, mặc áo khoác 3 Sọc khi thử đồ) & 5 NPC rõ mặt.
 * - 1 Context Action Pill duy nhất ở cạnh dưới cho 5 tương tác: inspect_island, try_jacket, buy_samba,
 *   inspect_vn_col, exit_adidas.
 */
export const AdidasStoreBannerWebView: React.FC<AdidasStoreBannerWebViewProps> = ({
  onExitAdidas,
}) => {
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const wallArtScript = useMemo(() => buildAdidasWallArtScript(), []);
  const sceneScript = useMemo(() => buildAdidasTps3dSceneScript(), []);

  const initScript = useMemo(
    () => `
(function() {
  var cv = document.getElementById('tpsCv');
  var ctxPillBtn = document.getElementById('ctxPillBtn');
  var wgl = typeof createPixelWebglRenderer === 'function' ? createPixelWebglRenderer(cv) : null;
  var ctx = wgl ? null : cv.getContext('2d');
  if (wgl && typeof buildAdidasProceduralTextures === 'function') {
    buildAdidasProceduralTextures(wgl);
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

  var st = createAdidasTpsState();
  var cam = createTpsCamera({ yaw: 0.04, pitch: -0.30, dist: 4.65, targetHeight: 0.72 });
  var adidasBounds = { minX: -6.0, maxX: 15.6, minZ: 0.0, maxZ: 14.8, maxY: 6.75 };
  var currentAction = null;
  var exitSent = false;

  function runContextAction(act) {
    if (!act) return;
    postRN({ type: 'HAPTIC_MEDIUM' });
    if (act.id === 'try_jacket') {
      st.pig.wearingJacket = !st.pig.wearingJacket;
      st.pig.outfit = st.pig.wearingJacket ? 'adidas_jacket' : 'none';
      planAdidasRealtimePath(st, 13.4, 0, 9.0, null);
      st.ripples.push({ x: 13.4, y: 0, z: 9.0, t: 0 });
    } else if (act.id === 'buy_samba') {
      st.pig.boughtSamba = true;
      st.ripples.push({ x: 3.8, y: 3.4, z: 6.8, t: 0 });
    } else if (act.id === 'inspect_island') {
      st.ripples.push({ x: 0, y: 0.05, z: 6.2, t: 0 });
    } else if (act.id === 'inspect_vn_col') {
      st.ripples.push({ x: -4.2, y: 3.4, z: 4.7, t: 0 });
    } else if (act.id === 'exit_adidas') {
      if (!st.exiting) {
        st.exiting = true;
      }
    }
  }

  if (ctxPillBtn) {
    ctxPillBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      runContextAction(currentAction);
    });
  }

  function syncContextPill() {
    if (!ctxPillBtn) return;
    currentAction = getAdidasContextAction(st);
    if (currentAction && !st.exiting) {
      if (ctxPillBtn.textContent !== currentAction.label) {
        ctxPillBtn.textContent = currentAction.label;
      }
      ctxPillBtn.hidden = false;
    } else {
      ctxPillBtn.hidden = true;
    }
  }

  bindTpsCanvasGestures(cv, cam, {
    getSize: function() { return { w: W, h: H }; },
    onTap: function(sx, sy) {
      var target = wgl ? pickAdidasTarget3D(cam, st, sx, sy) : null;
      if (!wgl && !target) {
        var hit = unprojectFloorTap(cam, sx, sy);
        if (hit) target = { kind: 'floor', x: hit.x, y: st.pig.y >= 1.9 ? 3.4 : 0, z: hit.z };
      }
      if (target) {
        planAdidasRealtimePath(st, target.x, target.y, target.z, target.action || null);
        st.ripples.push({ x: target.x, y: target.y || 0, z: target.z, t: 0 });
        postRN({ type: target.action ? 'HAPTIC_MEDIUM' : 'HAPTIC_LIGHT' });
      }
    }
  });

  var lastNow = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
    lastNow = now;
    if (window.__isActive !== false) {
      stepAdidasTps(st, dt);
      if (st.exiting && !exitSent && st.exitFade >= 0.85) {
        exitSent = true;
        postRN({ type: 'EXIT_ADIDAS' });
      }
      if (wgl) {
        cam.vw = W; cam.vh = H;
        var asp = W / Math.max(1, H);
        var fovy = asp < 1 ? Math.min(1.68, 2 * Math.atan(Math.tan(0.54) / Math.max(0.42, asp))) : 0.82;
        cam.focal = (H * 0.5) / Math.tan(fovy * 0.5);
        renderAdidasWebglScene(wgl, cam, st, W, H);
      } else {
        updateTpsCamera(cam, st.pig.x, st.pig.y || 0, st.pig.z, W, H, adidasBounds);
        renderAdidasTpsScene(ctx, cam, st, W, H);
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
    if (d.type === 'EXIT_ADIDAS' && onExitAdidas) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => onExitAdidas(), 120);
    }
  };

  return (
    <WebglTpsBannerShell
      title="Adidas Originals Hội An WebGL 3D"
      backgroundHex="#2B180E"
      wallArtScript={wallArtScript}
      sceneScript={sceneScript}
      initScript={initScript}
      onPayload={handlePayload}
    />
  );
};
