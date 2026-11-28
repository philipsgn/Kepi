import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { WebglTpsBannerShell } from './WebglTpsBannerShell';
import { buildMarketWallArtScript } from './market/marketWallArt';
import { buildMarketTps3dSceneScript } from './market/marketTps3dScene';

interface BenThanhMarketBannerWebViewProps {
  active?: boolean;
  shoppingTotalText?: string;
  foodTotalText?: string;
  visitsCount?: number;
  selectedZone?: number;
  onExitToMap?: () => void;
  onSelectZoneFromCanvas?: (zoneIdx: number) => void;
}

/**
 * Chợ Bến Thành Sài Gòn WebGL 3D Hợp Nhất Không Cắt Cảnh (Quyết định 250)
 * - Dùng khung dùng chung WebglTpsBannerShell (0-CDN, SafeWebView + iframe srcDoc, không cắt cảnh / không nút nhảy phòng).
 * - Đại sảnh chữ L kín 100% (Mái kèo thép 5.8m + ô giếng trời):
 *   1. 'south_hall'  (X ∈ [-6.0, 6.0], Z ∈ [0, 13.6]): Cửa Số 1, Hương Trinh (Áo Dài), Liên Sài Gòn 823.
 *   2. 'food_court'  (X ∈ [-6.0, 6.0], Z ∈ [13.6, 26.8]): Vòm Khu Ăn Uống, Sạp 1044 + 4 ghế inox, Bánh Cuốn 50K, Bánh Bèo 20K.
 *   3. 'fruit_craft' (X ∈ [6.0, 17.2], Z ∈ [13.6, 26.8]): Ngã tư Chợ Đông (Z ∈ [22.6, 25.8]), 1029 Ngọc Hảo, Gốm Sứ, Nón Lá, Cửa Bắc.
 * - Hỗ trợ Seated Auto-Stand, 12 NPC + Chú Heo 24×20 gl.NEAREST Billboard & 1 Context Action Pill tối giản.
 */
export const BenThanhMarketBannerWebView: React.FC<BenThanhMarketBannerWebViewProps> = ({
  active = true,
  shoppingTotalText = '0đ',
  foodTotalText = '0đ',
  visitsCount = 0,
  selectedZone,
  onExitToMap,
  onSelectZoneFromCanvas,
}) => {
  void shoppingTotalText;
  void foodTotalText;
  void visitsCount;

  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCanvasZoneRef = useRef<number | null>(null);
  const cmdSeqRef = useRef(0);
  const [commandPayload, setCommandPayload] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof selectedZone !== 'number') return;
    if (lastCanvasZoneRef.current === selectedZone) {
      lastCanvasZoneRef.current = null;
      return;
    }
    const zoneMap = ['south_hall', 'south_hall', 'food_court', 'fruit_craft'];
    const targetZone = zoneMap[selectedZone] || 'south_hall';
    cmdSeqRef.current += 1;
    setCommandPayload({ type: 'NAV_ZONE', zone: targetZone, seq: cmdSeqRef.current });
  }, [selectedZone]);

  const wallArtScript = useMemo(() => buildMarketWallArtScript(), []);
  const sceneScript = useMemo(() => buildMarketTps3dSceneScript(), []);

  const initScript = useMemo(
    () => `
(function() {
  var cv = document.getElementById('tpsCv');
  var ctxBtn = document.getElementById('ctxPillBtn');
  var wgl = createPixelWebglRenderer(cv);
  var ctx = wgl ? null : cv.getContext('2d');
  if (wgl) buildMarketProceduralTextures(wgl);

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

  var st = createMarketTpsState();
  st.onZoneChanged = function(zoneId) {
    postRN({ type: 'SELECT_ZONE', zone: zoneId });
  };
  var cam = createTpsCamera({ yaw: 0.06, pitch: -0.32, dist: 4.75, targetHeight: 0.76 });
  var marketBounds = { minX: -18.0, maxX: 18.0, minZ: 0.0, maxZ: 36.0, maxY: 7.2 };
  var currentAction = null;
  var exitSent = false;

  window.__handleVenueCmd = function(cmd) {
    if (!cmd) return;
    if (cmd.type === 'NAV_ZONE' && cmd.zone && cmd.zone !== st.zone) {
      navigateMarketToZone(st, cmd.zone);
    }
  };

  function resolveContextAction() {
    var p = st.pig;
    // 1. Thoát ở bất kỳ cửa nào trong 4 Cửa Đông – Tây – Nam – Bắc
    if ((p.z <= 2.35 && Math.abs(p.x) <= 2.8) || (p.z >= 33.6 && Math.abs(p.x) <= 2.8) ||
        (p.x >= 15.8 && Math.abs(p.z - 17.0) <= 2.8) || (p.x <= -15.8 && Math.abs(p.z - 17.0) <= 2.8)) {
      return { id: 'exit_market', label: '🚪 Ra khỏi Chợ Bến Thành' };
    }
    // 2. Sạp Adidas 208 & Nike 212 & Giày Dép 306 & Vải Áo Dài Hương Trinh 415
    if (p.x <= -3.5 && p.x >= -10.5 && p.z >= 2.5 && p.z <= 10.2) {
      return { id: 'try_adidas', label: '🧥 Thử áo Adidas 3 Sọc (Sạp 208)' };
    }
    if (p.x >= 3.5 && p.x <= 10.5 && p.z >= 2.5 && p.z <= 10.2) {
      return { id: 'try_nike', label: '👕 Thử áo Nike Swoosh (Sạp 212)' };
    }
    if (Math.abs(p.x) >= 3.5 && Math.abs(p.x) <= 10.5 && p.z >= 10.2 && p.z <= 14.6) {
      return { id: 'buy_shoes_bags', label: '👟 Xem Giày, Vali & Đồng Hồ 306' };
    }
    if (p.x <= -11.5 && p.z >= 2.0 && p.z <= 15.0) {
      return { id: 'try_aodai', label: p.wearingAoDai ? '👘 Cất Áo Dài Lụa' : '👘 Ướm Áo Dài Hương Trinh 415' };
    }
    // 3. Khu Ẩm Thực (Sạp 1044 + Phở, Bún Bò, Cơm Tấm, Bánh Xèo, Bánh Cuốn, Chè)
    if (p.seated) {
      return { id: 'eat_banhcuon', label: '🍜 Thưởng thức Món Việt & Dừa Xiêm' };
    }
    if (Math.abs(p.x) <= 2.8 && p.z >= 17.6 && p.z <= 20.5) {
      return { id: 'sit_food', label: '🪑 Ngồi ghế inox Sạp 1044' };
    }
    if (Math.abs(p.x) <= 10.5 && p.z >= 20.0 && p.z <= 29.2) {
      return { id: 'eat_banhcuon', label: '🥞 Ăn Phở, Cơm Tấm, Bánh Xèo & Chè' };
    }
    // 4. Trái Cây 1029 Ngọc Hảo & Cửa Bắc Hoa/Hải Sản
    if ((p.x >= 8.2 && p.x <= 14.5 && p.z >= 17.0 && p.z <= 23.6) || (p.x <= -2.0 && p.x >= -9.0 && p.z >= 29.0)) {
      return { id: 'buy_mango', label: '🥭 Chọn Sầu Riêng, Măng Cụt & Xoài Cát' };
    }
    if (p.x >= 2.0 && p.x <= 13.5 && p.z >= 29.0) {
      return { id: 'buy_seafood_flower', label: '🦞 Mua Hoa Tươi & Hải Sản Cửa Bắc' };
    }
    // 5. Đồ Khô, Cà Phê Cửa Đông & Mỹ Nghệ Cửa Tây
    if (p.x >= 11.5 && p.z <= 31.5) {
      return { id: 'buy_coffee_dry', label: '☕ Mua Cà Phê, Trà Sen & Mứt Cửa Đông' };
    }
    if (p.x <= -11.5 && p.z >= 19.0) {
      return { id: 'buy_craft', label: '🏺 Xem Gốm Bát Tràng & Nón Lá Cửa Tây' };
    }
    return null;
  }

  function runContextAction(act) {
    if (!act) return;
    postRN({ type: 'HAPTIC_MEDIUM' });
    if (act.id === 'try_aodai') {
      planMarketRealtimePath(st, -12.6, 0, 7.0, { pendingAction: 'try_aodai' });
    } else if (act.id === 'try_adidas') {
      planMarketRealtimePath(st, -4.8, 0, 6.5, { pendingAction: 'try_adidas' });
    } else if (act.id === 'try_nike') {
      planMarketRealtimePath(st, 4.8, 0, 6.5, { pendingAction: 'try_nike' });
    } else if (act.id === 'buy_shoes_bags') {
      planMarketRealtimePath(st, -4.8, 0, 12.2, { pendingAction: 'buy_shoes_bags' });
    } else if (act.id === 'sit_food') {
      planMarketRealtimePath(st, -0.38, 0, 19.15, { seatChairId: 1, pendingAction: 'sit_food' });
    } else if (act.id === 'eat_banhcuon') {
      if (st.pig.seated) {
        st.pig.eating = true;
        st.pig.ateFood = true;
      } else {
        planMarketRealtimePath(st, 0.38, 0, 19.15, { seatChairId: 2, pendingAction: 'eat_banhcuon' });
      }
    } else if (act.id === 'buy_mango') {
      planMarketRealtimePath(st, 11.6, 0, 18.0, { pendingAction: 'buy_mango' });
    } else if (act.id === 'buy_seafood_flower') {
      planMarketRealtimePath(st, 5.3, 0, 29.8, { pendingAction: 'buy_seafood_flower' });
    } else if (act.id === 'buy_coffee_dry') {
      planMarketRealtimePath(st, 12.6, 0, 6.2, { pendingAction: 'buy_coffee_dry' });
    } else if (act.id === 'buy_craft') {
      planMarketRealtimePath(st, -12.6, 0, 24.0, { pendingAction: 'buy_craft' });
    } else if (act.id === 'exit_market') {
      if (!st.exiting) {
        st.exiting = true;
      }
    }
  }

  if (ctxBtn) {
    ctxBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      runContextAction(currentAction);
    });
  }

  bindTpsCanvasGestures(cv, cam, {
    getSize: function() { return { w: W, h: H }; },
    onTap: function(sx, sy) {
      var target = wgl ? pickMarketTarget3D(cam, st, sx, sy) : null;
      if (!wgl && !target) {
        var hit = unprojectFloorTap(cam, sx, sy);
        if (hit) {
          var cl = clampMarketWalkPos(st, hit.x, hit.z);
          target = { kind: 'floor', x: cl.x, y: 0, z: cl.z };
        }
      }
      if (target) {
        var actionMap = {
          aodai: 'try_aodai',
          try_adidas: 'try_adidas',
          try_nike: 'try_nike',
          buy_shoes: 'buy_shoes_bags',
          fruit: 'buy_mango',
          buy_fresh: 'buy_seafood_flower',
          buy_coffee: 'buy_coffee_dry',
          buy_craft: 'buy_craft',
          exit: 'exit_market'
        };
        if (target.kind === 'stool' && target.stool) {
          planMarketRealtimePath(st, target.x, 0, target.z, { seatChairId: target.stool.id, pendingAction: 'sit_food' });
          st.ripples.push({ x: target.x, z: target.z, t: 0 });
          postRN({ type: 'HAPTIC_MEDIUM' });
        } else if (target.kind === 'food') {
          planMarketRealtimePath(st, target.x, 0, target.z, { seatChairId: target.stoolId || 1, dish: target.dish || 'banhcuon', pendingAction: 'eat_banhcuon' });
          st.ripples.push({ x: target.x, z: target.z, t: 0 });
          postRN({ type: 'HAPTIC_MEDIUM' });
        } else if (actionMap[target.kind]) {
          planMarketRealtimePath(st, target.x, 0, target.z, { pendingAction: actionMap[target.kind] });
          st.ripples.push({ x: target.x, z: target.z, t: 0 });
          postRN({ type: 'HAPTIC_MEDIUM' });
        } else {
          planMarketRealtimePath(st, target.x, 0, target.z, {});
          st.ripples.push({ x: target.x, z: target.z, t: 0 });
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
      stepMarketTps(st, dt);
      if (st.exiting && !exitSent && st.exitFade >= 0.85) {
        exitSent = true;
        postRN({ type: 'EXIT_MARKET' });
      }
      if (wgl) {
        cam.vw = W; cam.vh = H;
        var asp = W / Math.max(1, H);
        var fovy = asp < 1 ? Math.min(1.68, 2 * Math.atan(Math.tan(0.54) / Math.max(0.42, asp))) : 0.82;
        cam.focal = (H * 0.5) / Math.tan(fovy * 0.5);
        renderMarketWebglScene(wgl, cam, st, W, H);
      } else {
        updateTpsCamera(cam, st.pig.x, 0, st.pig.z, W, H, marketBounds);
        renderMarketTpsScene(ctx, cam, st, W, H);
      }
      currentAction = resolveContextAction();
      if (ctxBtn) {
        if (currentAction) {
          ctxBtn.textContent = currentAction.label;
          ctxBtn.hidden = false;
        } else {
          ctxBtn.hidden = true;
        }
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
    if (d.type === 'SELECT_ZONE' && onSelectZoneFromCanvas) {
      const zIdx = d.zone === 'food_court' ? 2 : d.zone === 'fruit_craft' ? 3 : 1;
      lastCanvasZoneRef.current = zIdx;
      onSelectZoneFromCanvas(zIdx);
    } else if (d.type === 'EXIT_MARKET' && onExitToMap) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      exitTimerRef.current = setTimeout(() => onExitToMap(), 120);
    }
  };

  return (
    <WebglTpsBannerShell
      title="Chợ Bến Thành Sài Gòn WebGL 3D"
      backgroundHex="#2B180E"
      active={active}
      wallArtScript={wallArtScript}
      sceneScript={sceneScript}
      initScript={initScript}
      commandPayload={commandPayload}
      onPayload={handlePayload}
    />
  );
};
