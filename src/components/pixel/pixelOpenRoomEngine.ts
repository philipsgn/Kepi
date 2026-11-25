/**
 * Engine Thế Giới Mở 2D Tương Tác Dùng Chung Cho 4 Pixel Banner (Quyết định 200 & 201)
 * Hỗ trợ:
 * 1. Thế giới 2D rộng (worldWidth > viewWidth, worldHeight > viewHeight) với Camera 2D (camX, camY).
 * 2. Deadzone Smooth Follow (~28% biên khung): chú heo đi sát mép trái/phải/trên/dưới -> camera tự lia mượt sang cảnh tiếp theo.
 * 3. Tap-to-Walk + Drag-to-Pan: chạm sàn để heo đi 2D (8 hướng); kéo tay trực tiếp để lia xem trước không gian rộng.
 * 4. Interactive Hotspots + Actions gắn dữ liệu thật từ Store + Haptics.
 * 5. Mũi tên pixel chỉ hướng biên (◄ ► ▲ ▼) báo hiệu còn cảnh mở rộng + Autonomous AI Roaming khi rảnh.
 */

export interface OpenRoomHotspot {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  standX: number;
  standY: number;
  standFace?: 1 | -1;
  actionType:
    | 'sip_coffee'
    | 'type_laptop'
    | 'look_window'
    | 'play_arcade'
    | 'jump_joy'
    | 'eat_snack'
    | 'check_ledger';
  duration?: number;
  bubbleText: string;
}

export interface OpenRoomConfig {
  canvasId: string;
  worldWidth: number;
  worldHeight: number;
  viewWidth: number;
  viewHeight: number;
  walkBounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  initialX: number;
  initialY: number;
  initialCamX?: number;
  initialCamY?: number;
  speed?: number;
  hotspots: OpenRoomHotspot[];
}

export function buildOpenRoomEngineScript(config: OpenRoomConfig): string {
  const cfgJson = JSON.stringify(config);
  return `
  (function(cfg){
    var cv = document.getElementById(cfg.canvasId);
    if (!cv) return;
    var maxCamX = Math.max(0, cfg.worldWidth - cfg.viewWidth);
    var maxCamY = Math.max(0, cfg.worldHeight - cfg.viewHeight);
    function clamp(v, mn, mx) {
      return Math.max(mn, Math.min(mx, v));
    }

    var startCamX = typeof cfg.initialCamX === 'number'
      ? clamp(cfg.initialCamX, 0, maxCamX)
      : clamp(cfg.initialX - cfg.viewWidth * 0.5, 0, maxCamX);
    var startCamY = typeof cfg.initialCamY === 'number'
      ? clamp(cfg.initialCamY, 0, maxCamY)
      : clamp(cfg.initialY - cfg.viewHeight * 0.55, 0, maxCamY);

    var state = {
      x: cfg.initialX,
      y: cfg.initialY,
      tx: cfg.initialX,
      ty: cfg.initialY,
      facing: 1,
      walking: false,
      action: null,
      actionEnd: 0,
      pendingHotspot: null,
      pendingUserTriggered: false,
      tapMarker: null,
      bubbleText: '',
      bubbleEnd: 0,
      lastInteractAt: performance.now(),
      nextAutoAt: performance.now() + 4500,
      camX: startCamX,
      camY: startCamY,
      targetCamX: startCamX,
      targetCamY: startCamY,
      isPanning: false,
      panHoldUntil: 0
    };

    function notifyRoom(type, extra) {
      var msg = JSON.stringify(Object.assign({ type: type }, extra || {}));
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(msg);
      } else if (window.parent && window.parent !== window) {
        window.parent.postMessage(msg, '*');
      }
    }

    function triggerAction(hs, now, userTriggered) {
      state.action = hs.actionType;
      state.actionEnd = now + (hs.duration || 2800);
      if (hs.standFace) state.facing = hs.standFace;
      state.bubbleText = hs.bubbleText || '';
      state.bubbleEnd = now + (hs.duration || 3200);
      notifyRoom('ROOM_ACTION', { id: hs.id, actionType: hs.actionType, text: hs.bubbleText, userTriggered: !!userTriggered });
    }

    function handleRoomTap(clientX, clientY) {
      var rect = cv.getBoundingClientRect();
      if (!rect || !rect.width || !rect.height) return;
      var vx = ((clientX - rect.left) / rect.width) * cfg.viewWidth;
      var vy = ((clientY - rect.top) / rect.height) * cfg.viewHeight;
      var wx = vx + state.camX;
      var wy = vy + state.camY;
      var now = performance.now();
      state.lastInteractAt = now;
      state.nextAutoAt = now + 5600;
      state.panHoldUntil = 0;

      // 1. Check hotspots in 2D world coordinates
      for (var i = 0; i < cfg.hotspots.length; i++) {
        var hs = cfg.hotspots[i];
        if (wx >= hs.x && wx <= hs.x + hs.w && wy >= hs.y && wy <= hs.y + hs.h) {
          notifyRoom('HAPTIC_LIGHT');
          state.tx = clamp(hs.standX, cfg.walkBounds.minX, cfg.walkBounds.maxX);
          state.ty = clamp(hs.standY, cfg.walkBounds.minY, cfg.walkBounds.maxY);
          state.pendingHotspot = hs;
          state.pendingUserTriggered = true;
          state.tapMarker = { x: state.tx, y: state.ty, until: now + 750 };
          state.action = null;
          return;
        }
      }

      // 2. Tap-to-Walk anywhere on the 2D floor (if tapping near viewport edge, nudge deeper into next zone)
      notifyRoom('HAPTIC_LIGHT');
      var nudgeX = 0, nudgeY = 0;
      if (vx < cfg.viewWidth * 0.14 && state.camX > 1) nudgeX = -26;
      else if (vx > cfg.viewWidth * 0.86 && state.camX < maxCamX - 1) nudgeX = 26;
      if (vy < cfg.viewHeight * 0.16 && state.camY > 1) nudgeY = -20;
      else if (vy > cfg.viewHeight * 0.84 && state.camY < maxCamY - 1) nudgeY = 20;

      state.tx = clamp(wx + nudgeX, cfg.walkBounds.minX, cfg.walkBounds.maxX);
      state.ty = clamp(wy + nudgeY, cfg.walkBounds.minY, cfg.walkBounds.maxY);
      state.pendingHotspot = null;
      state.action = null;
      state.tapMarker = { x: state.tx, y: state.ty, until: now + 750 };
    }

    // Unified Pointer + Touch Drag-to-Pan vs Tap-to-Walk
    var drag = { active: false, moved: false, startX: 0, startY: 0, camStartX: 0, camStartY: 0 };
    function getPt(e) {
      if (e.touches && e.touches.length > 0) return e.touches[0];
      if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0];
      return e;
    }

    function onDown(e) {
      var pt = getPt(e);
      if (!pt || typeof pt.clientX !== 'number') return;
      drag.active = true;
      drag.moved = false;
      drag.startX = pt.clientX;
      drag.startY = pt.clientY;
      drag.camStartX = state.camX;
      drag.camStartY = state.camY;
    }

    function onMove(e) {
      if (!drag.active) return;
      var pt = getPt(e);
      if (!pt || typeof pt.clientX !== 'number') return;
      var dxPx = pt.clientX - drag.startX;
      var dyPx = pt.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dxPx, dyPx) > 6) {
        drag.moved = true;
        state.isPanning = true;
      }
      if (drag.moved) {
        if (e.cancelable) e.preventDefault();
        var rect = cv.getBoundingClientRect();
        if (!rect || !rect.width || !rect.height) return;
        var dxWorld = (dxPx / rect.width) * cfg.viewWidth;
        var dyWorld = (dyPx / rect.height) * cfg.viewHeight;
        state.camX = clamp(drag.camStartX - dxWorld, 0, maxCamX);
        state.camY = clamp(drag.camStartY - dyWorld, 0, maxCamY);
        state.targetCamX = state.camX;
        state.targetCamY = state.camY;
        state.panHoldUntil = performance.now() + 2500;
      }
    }

    var lastTapMs = 0;
    function onUp(e) {
      if (!drag.active) return;
      var wasDrag = drag.moved;
      drag.active = false;
      drag.moved = false;
      state.isPanning = false;
      if (!wasDrag) {
        var nowMs = Date.now();
        if (nowMs - lastTapMs < 140) return;
        lastTapMs = nowMs;
        var pt = getPt(e);
        if (pt && typeof pt.clientX === 'number') {
          handleRoomTap(pt.clientX, pt.clientY);
        }
      }
    }

    cv.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    cv.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp, { passive: true });

    window.__openRoom = {
      state: state,
      setHotspots: function(nextHotspots) {
        if (Array.isArray(nextHotspots)) cfg.hotspots = nextHotspots;
      },
      walkTo: function(x, y, hs) {
        var now = performance.now();
        state.tx = clamp(x, cfg.walkBounds.minX, cfg.walkBounds.maxX);
        state.ty = clamp(y, cfg.walkBounds.minY, cfg.walkBounds.maxY);
        state.pendingHotspot = hs || null;
        state.action = null;
        state.panHoldUntil = 0;
        state.lastInteractAt = now;
        state.nextAutoAt = now + 5600;
      },
      step: function(dt, now) {
        var dx = state.tx - state.x;
        var dy = state.ty - state.y;
        var dist = Math.hypot(dx, dy);
        var spd = cfg.speed || 34;
        if (dist > 1.5) {
          state.walking = true;
          if (Math.abs(dx) > 0.5) state.facing = dx >= 0 ? 1 : -1;
          var move = Math.min(dist, spd * dt);
          state.x += (dx / dist) * move;
          state.y += (dy / dist) * move;
        } else {
          state.x = state.tx;
          state.y = state.ty;
          state.walking = false;
          if (state.pendingHotspot) {
            var hs = state.pendingHotspot;
            var wasUser = state.pendingUserTriggered;
            state.pendingHotspot = null;
            state.pendingUserTriggered = false;
            triggerAction(hs, now, wasUser);
          }
        }

        if (state.action && now > state.actionEnd) {
          state.action = null;
        }
        if (state.bubbleText && now > state.bubbleEnd) {
          state.bubbleText = '';
        }

        // Deadzone Smooth Follow 2D Camera (camX & camY)
        if (!state.isPanning && now > state.panHoldUntil) {
          var marginX = cfg.viewWidth * 0.28;
          var marginY = cfg.viewHeight * 0.28;
          var deadzone = {
            left: state.camX + marginX,
            right: state.camX + cfg.viewWidth - marginX,
            top: state.camY + marginY,
            bottom: state.camY + cfg.viewHeight - marginY
          };
          if (state.x < deadzone.left) state.targetCamX = state.x - marginX;
          else if (state.x > deadzone.right) state.targetCamX = state.x - (cfg.viewWidth - marginX);
          if (state.y < deadzone.top) state.targetCamY = state.y - marginY;
          else if (state.y > deadzone.bottom) state.targetCamY = state.y - (cfg.viewHeight - marginY);

          state.targetCamX = clamp(state.targetCamX, 0, maxCamX);
          state.targetCamY = clamp(state.targetCamY, 0, maxCamY);
          var lerpK = Math.min(1, dt * 5.5);
          state.camX += (state.targetCamX - state.camX) * lerpK;
          state.camY += (state.targetCamY - state.camY) * lerpK;
        }

        // Autonomous AI Roaming across the 2D open world when idle
        if (!state.walking && !state.action && !state.isPanning && now > state.nextAutoAt) {
          state.nextAutoAt = now + 4800 + Math.random() * 2800;
          if (cfg.hotspots.length > 0 && Math.random() < 0.5) {
            var pick = cfg.hotspots[Math.floor(Math.random() * cfg.hotspots.length)];
            state.tx = clamp(pick.standX, cfg.walkBounds.minX, cfg.walkBounds.maxX);
            state.ty = clamp(pick.standY, cfg.walkBounds.minY, cfg.walkBounds.maxY);
            state.pendingHotspot = pick;
            state.pendingUserTriggered = false;
          } else {
            state.tx = cfg.walkBounds.minX + Math.random() * (cfg.walkBounds.maxX - cfg.walkBounds.minX);
            state.ty = cfg.walkBounds.minY + Math.random() * (cfg.walkBounds.maxY - cfg.walkBounds.minY);
            state.pendingHotspot = null;
          }
        }
      },
      drawOverlays: function(ctx, now) {
        // 1. Tap target marker on 2D floor
        if (state.tapMarker && now < state.tapMarker.until) {
          var mx = Math.round(state.tapMarker.x - state.camX);
          var my = Math.round(state.tapMarker.y - state.camY);
          if (mx >= 0 && mx <= cfg.viewWidth && my >= 0 && my <= cfg.viewHeight) {
            ctx.fillStyle = '#F4B93B';
            ctx.fillRect(mx - 3, my - 1, 6, 2);
            ctx.fillRect(mx - 1, my - 2, 2, 4);
          }
        }
        // 2. Action prop badge near pig
        if (state.action) {
          var px = Math.round(state.x - state.camX);
          var py = Math.round(state.y - state.camY);
          var bob = Math.round(Math.sin(now / 150) * 1.5);
          if (state.action === 'sip_coffee') {
            ctx.fillStyle = '#FFFBF1';
            ctx.fillRect(px + (state.facing > 0 ? 11 : -15), py - 9 + bob, 4, 5);
            ctx.fillStyle = '#6F4E37';
            ctx.fillRect(px + (state.facing > 0 ? 12 : -14), py - 9 + bob, 2, 2);
          } else if (state.action === 'type_laptop' || state.action === 'check_ledger') {
            ctx.fillStyle = '#F4B93B';
            ctx.fillRect(px - 2, py - 24 + bob, 2, 2);
            ctx.fillRect(px + 2, py - 26 + bob, 2, 2);
          } else if (state.action === 'play_arcade') {
            ctx.fillStyle = '#E0452B';
            ctx.fillRect(px - 3, py - 25 + bob, 2, 2);
            ctx.fillStyle = '#53B7E8';
            ctx.fillRect(px + 2, py - 26 + bob, 2, 2);
          } else if (state.action === 'eat_snack') {
            ctx.fillStyle = '#F48C9D';
            ctx.fillRect(px - 1, py - 25 + bob, 3, 2);
          }
        }
        // 3. Subtle edge chevrons showing unexplored directions (◄ ► ▲ ▼)
        var pulse = 0.45 + 0.35 * Math.sin(now / 360);
        ctx.save();
        ctx.globalAlpha = pulse;
        ctx.fillStyle = '#FFFBF1';
        var midX = Math.floor(cfg.viewWidth / 2);
        var midY = Math.floor(cfg.viewHeight / 2);
        if (state.camX > 4) {
          ctx.fillRect(3, midY, 1, 1);
          ctx.fillRect(4, midY - 1, 1, 3);
          ctx.fillRect(5, midY - 2, 1, 5);
        }
        if (state.camX < maxCamX - 4) {
          ctx.fillRect(cfg.viewWidth - 4, midY, 1, 1);
          ctx.fillRect(cfg.viewWidth - 5, midY - 1, 1, 3);
          ctx.fillRect(cfg.viewWidth - 6, midY - 2, 1, 5);
        }
        if (state.camY > 4) {
          ctx.fillRect(midX, 3, 1, 1);
          ctx.fillRect(midX - 1, 4, 3, 1);
          ctx.fillRect(midX - 2, 5, 5, 1);
        }
        if (state.camY < maxCamY - 4) {
          ctx.fillRect(midX, cfg.viewHeight - 4, 1, 1);
          ctx.fillRect(midX - 1, cfg.viewHeight - 5, 3, 1);
          ctx.fillRect(midX - 2, cfg.viewHeight - 6, 5, 1);
        }
        ctx.restore();
      }
    };
  })(${cfgJson});
  `;
}
