import React, { useEffect, useMemo, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { WebglTpsBannerShell } from './WebglTpsBannerShell';
import { buildAdidasWallArtScript } from './adidas/adidasWallArt';
import { buildAdidasTps3dSceneScript } from './adidas/adidasTps3dScene';

interface AdidasStoreBannerWebViewProps {
  onExitAdidas?: () => void;
}

/**
 * Adidas Mall Flagship 1 Tầng Siêu Rộng WebGL 3D (24m × 24m, 16 Gian Hàng & Sút Bóng 3D — Quyết định 255)
 * - Sử dụng khung WebglTpsBannerShell (0-CDN, SafeWebView + iframe srcDoc, 0% card viền/switcher).
 * - Hợp nhất 1 mặt sàn duy nhất Y = 0 gồm 4 phân khu liên hoàn: hall, apparel_sports, fitting_pos, kick_zone.
 * - Hỗ trợ 4 bộ trang phục Heo 24×20 (Áo Khoác 3 Sọc, Polo Cổ Bẻ, Quần Jogger + Samba, Áo Đấu #10) + Túi POS,
 *   12 NPC mua sắm & Thủ môn pixel, cùng Mini-game Sút Bóng vào Gôn trực tiếp 3D.
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

  // HUD gọn nổi góc trên phải chỉ hiện khi vào Sân Sút Bóng hoặc vừa thử đồ
  var hudEl = document.createElement('div');
  hudEl.style.cssText = 'position:fixed;top:52px;right:14px;z-index:16;pointer-events:none;background:#FFFBF1;color:#2B2118;border:3px solid #2B2118;border-radius:14px;padding:6px 12px;font:900 13px/1.2 -apple-system,sans-serif;box-shadow:0 3px 0 #2B2118;';
  hudEl.hidden = true;
  document.body.appendChild(hudEl);

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
  var cam = createTpsCamera({ yaw: 0.04, pitch: -0.30, dist: 4.85, targetHeight: 0.72 });
  var adidasBounds = { minX: -10.0, maxX: 14.0, minZ: 0.0, maxZ: 24.0, maxY: 4.65 };
  var currentAction = null;
  var exitSent = false;

  function toggleOutfit(ofKey, toast) {
    st.pig.outfit = (st.pig.outfit === ofKey) ? 'none' : ofKey;
    st.pig.wearingJacket = (st.pig.outfit === 'adidas_jacket');
    st.actionFlashText = st.pig.outfit === ofKey ? toast : '👕 ĐÃ CỞI TRANG PHỤC';
    st.actionFlashUntil = st.t + 2.6;
  }

  function runContextAction(act) {
    if (!act) return;
    postRN({ type: 'HAPTIC_MEDIUM' });
    if (act.id === 'kick_shoot') {
      if (st.kickGame && st.kickGame.active) {
        if (typeof triggerAdidasGoalKick === 'function') triggerAdidasGoalKick(st, null);
      } else {
        planAdidasRealtimePath(st, 10.0, 0, 17.8, 'kick_spot');
        st.ripples.push({ x: 10.0, y: 0, z: 17.8, t: 0 });
      }
    } else if (act.id === 'try_jacket') {
      toggleOutfit('adidas_jacket', '🧥 MẶC ÁO KHOÁC 3 SỌC');
      planAdidasRealtimePath(st, 11.8, 0, 9.8, null);
      st.ripples.push({ x: 11.8, y: 0, z: 9.8, t: 0 });
    } else if (act.id === 'try_polo') {
      toggleOutfit('adidas_polo', '👔 MẶC ÁO POLO CỔ BẺ 3 SỌC');
      st.ripples.push({ x: st.pig.x, y: 0, z: st.pig.z, t: 0 });
    } else if (act.id === 'try_jogger') {
      toggleOutfit('adidas_jogger', '👖 MẶC QUẦN JOGGER + SAMBA');
      st.ripples.push({ x: st.pig.x, y: 0, z: st.pig.z, t: 0 });
    } else if (act.id === 'try_kit') {
      toggleOutfit('adidas_kit', '⚽ MẶC ÁO ĐẤU #10');
      st.ripples.push({ x: st.pig.x, y: 0, z: st.pig.z, t: 0 });
    } else if (act.id === 'maker_custom') {
      st.pig.customBadge = 'VIP-10';
      st.pig.outfit = 'adidas_kit';
      st.actionFlashText = '🎨 MAKER LAB · ÉP NHIỆT SỐ 10!';
      st.actionFlashUntil = st.t + 2.8;
      st.ripples.push({ x: 1.0, y: 0, z: 19.7, t: 0 });
    } else if (act.id === 'buy_bag') {
      st.pig.boughtSamba = true;
      st.actionFlashText = '🛍️ CHECKOUT POS · NHẬN TÚI 3 SỌC!';
      st.actionFlashUntil = st.t + 3.0;
      st.ripples.push({ x: 9.4, y: 0, z: 3.4, t: 0 });
    } else if (act.id === 'inspect_shoes') {
      st.actionFlashText = '👟 SAMBA OG · ADILETTE · ULTRABOOST';
      st.actionFlashUntil = st.t + 2.6;
      st.ripples.push({ x: st.pig.x, y: 0, z: st.pig.z, t: 0 });
    } else if (act.id === 'exit_adidas') {
      if (!st.exiting) st.exiting = true;
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
    var showKickHud = st.kickGame && st.kickGame.active;
    var showFlash = st.actionFlashUntil > st.t && st.actionFlashText;
    if (showKickHud) {
      var arrowPct = Math.round(((st.kickGame.aimAngle + 0.46) / 0.92) * 100);
      var txt = '⚽ BÀN THẮNG: ' + st.kickGame.goals + ' · CHUỖI: ' + st.kickGame.streak + ' | HƯỚNG: ' + arrowPct + '%';
      if (hudEl.textContent !== txt) hudEl.textContent = txt;
      hudEl.hidden = false;
    } else if (showFlash) {
      if (hudEl.textContent !== st.actionFlashText) hudEl.textContent = st.actionFlashText;
      hudEl.hidden = false;
    } else {
      hudEl.hidden = true;
    }
  }

  bindTpsCanvasGestures(cv, cam, {
    getSize: function() { return { w: W, h: H }; },
    onTap: function(sx, sy) {
      var target = wgl ? pickAdidasTarget3D(cam, st, sx, sy) : null;
      if (!wgl && !target) {
        var hit = unprojectFloorTap(cam, sx, sy);
        if (hit) target = { kind: 'floor', x: hit.x, y: 0, z: hit.z };
      }
      if (!target) return;
      if (target.kind === 'goal_shoot') {
        if (typeof triggerAdidasGoalKick === 'function') {
          triggerAdidasGoalKick(st, target.aimOffset);
          postRN({ type: 'HAPTIC_MEDIUM' });
        }
        return;
      }
      planAdidasRealtimePath(st, target.x, 0, target.z, target.action || null);
      st.ripples.push({ x: target.x, y: 0, z: target.z, t: 0 });
      postRN({ type: target.action ? 'HAPTIC_MEDIUM' : 'HAPTIC_LIGHT' });
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
        updateTpsCamera(cam, st.pig.x, 0, st.pig.z, W, H, adidasBounds);
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
      title="Adidas Mall Flagship WebGL 3D"
      backgroundHex="#2B180E"
      wallArtScript={wallArtScript}
      sceneScript={sceneScript}
      initScript={initScript}
      onPayload={handlePayload}
    />
  );
};
