/**
 * Engine Không Gian Mở Tương Tác Dùng Chung Cho 4 Pixel Banner (Quyết định 200)
 * Hỗ trợ:
 * 1. Tap-to-Walk: Chạm bất kỳ đâu trên sàn đi lại -> hiện dấu chấm đích pixel & heo 24×20 tự bước tới.
 * 2. Interactive Hotspots + Actions: Chạm đồ vật -> heo tự bước lại standX/standY, thực hiện Action
 *    (sip_coffee, type_laptop, look_window, play_arcade, jump_joy, eat_snack, check_ledger),
 *    rung HAPTIC_LIGHT và hiện bong bóng thoại với dữ liệu thật từ Store.
 * 3. Autonomous AI Roaming: Khi rảnh (~4.5s), heo tự dạo quanh phòng hoặc ghé thăm đồ vật.
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
  speed?: number;
  hotspots: OpenRoomHotspot[];
}

export function buildOpenRoomEngineScript(config: OpenRoomConfig): string {
  const cfgJson = JSON.stringify(config);
  return `
  (function(cfg){
    var cv = document.getElementById(cfg.canvasId);
    if (!cv) return;
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
      tapMarker: null,
      bubbleText: '',
      bubbleEnd: 0,
      lastInteractAt: performance.now(),
      nextAutoAt: performance.now() + 4200,
      camX: 0
    };

    function notifyRoom(type, extra) {
      var msg = JSON.stringify(Object.assign({ type: type }, extra || {}));
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(msg);
      } else if (window.parent && window.parent !== window) {
        window.parent.postMessage(msg, '*');
      }
    }

    function clamp(v, mn, mx) {
      return Math.max(mn, Math.min(mx, v));
    }

    function triggerAction(hs, now) {
      state.action = hs.actionType;
      state.actionEnd = now + (hs.duration || 2600);
      if (hs.standFace) state.facing = hs.standFace;
      state.bubbleText = hs.bubbleText || '';
      state.bubbleEnd = now + (hs.duration || 3200);
      notifyRoom('ROOM_ACTION', { id: hs.id, actionType: hs.actionType, text: hs.bubbleText });
    }

    function handleRoomPointer(clientX, clientY) {
      var rect = cv.getBoundingClientRect();
      if (!rect || !rect.width || !rect.height) return;
      var vx = ((clientX - rect.left) / rect.width) * cfg.viewWidth;
      var vy = ((clientY - rect.top) / rect.height) * cfg.viewHeight;
      var wx = vx + state.camX;
      var wy = vy;
      var now = performance.now();
      state.lastInteractAt = now;
      state.nextAutoAt = now + 5200;

      // 1. Check hotspots first
      for (var i = 0; i < cfg.hotspots.length; i++) {
        var hs = cfg.hotspots[i];
        if (wx >= hs.x && wx <= hs.x + hs.w && wy >= hs.y && wy <= hs.y + hs.h) {
          notifyRoom('HAPTIC_LIGHT');
          state.tx = clamp(hs.standX, cfg.walkBounds.minX, cfg.walkBounds.maxX);
          state.ty = clamp(hs.standY, cfg.walkBounds.minY, cfg.walkBounds.maxY);
          state.pendingHotspot = hs;
          state.tapMarker = { x: state.tx, y: state.ty, until: now + 700 };
          state.action = null;
          return;
        }
      }

      // 2. Otherwise Tap-to-Walk on open floor
      notifyRoom('HAPTIC_LIGHT');
      state.tx = clamp(wx, cfg.walkBounds.minX, cfg.walkBounds.maxX);
      state.ty = clamp(wy, cfg.walkBounds.minY, cfg.walkBounds.maxY);
      state.pendingHotspot = null;
      state.action = null;
      state.tapMarker = { x: state.tx, y: state.ty, until: now + 700 };
    }

    var lastTapMs = 0;
    function onTapEvt(e) {
      var nowMs = Date.now();
      if (nowMs - lastTapMs < 120) return;
      lastTapMs = nowMs;
      var pt = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
      if (pt && typeof pt.clientX === 'number') {
        handleRoomPointer(pt.clientX, pt.clientY);
      }
    }
    cv.addEventListener('pointerdown', onTapEvt);
    cv.addEventListener('touchstart', onTapEvt, { passive: true });
    cv.addEventListener('click', onTapEvt);

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
        state.lastInteractAt = now;
        state.nextAutoAt = now + 5200;
      },
      step: function(dt, now) {
        var dx = state.tx - state.x;
        var dy = state.ty - state.y;
        var dist = Math.hypot(dx, dy);
        var spd = cfg.speed || 32;
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
            state.pendingHotspot = null;
            triggerAction(hs, now);
          }
        }

        if (state.action && now > state.actionEnd) {
          state.action = null;
        }
        if (state.bubbleText && now > state.bubbleEnd) {
          state.bubbleText = '';
        }

        // Camera smooth follow for wide scrolling worlds
        if (cfg.worldWidth > cfg.viewWidth) {
          var targetCam = clamp(state.x - cfg.viewWidth * 0.5, 0, cfg.worldWidth - cfg.viewWidth);
          state.camX += (targetCam - state.camX) * Math.min(1, dt * 6);
        }

        // Autonomous AI roaming when idle
        if (!state.walking && !state.action && now > state.nextAutoAt) {
          state.nextAutoAt = now + 4500 + Math.random() * 2500;
          if (cfg.hotspots.length > 0 && Math.random() < 0.45) {
            var pick = cfg.hotspots[Math.floor(Math.random() * cfg.hotspots.length)];
            state.tx = clamp(pick.standX, cfg.walkBounds.minX, cfg.walkBounds.maxX);
            state.ty = clamp(pick.standY, cfg.walkBounds.minY, cfg.walkBounds.maxY);
            state.pendingHotspot = pick;
          } else {
            state.tx = cfg.walkBounds.minX + Math.random() * (cfg.walkBounds.maxX - cfg.walkBounds.minX);
            state.ty = cfg.walkBounds.minY + Math.random() * (cfg.walkBounds.maxY - cfg.walkBounds.minY);
            state.pendingHotspot = null;
          }
        }
      },
      drawOverlays: function(ctx, now) {
        // Draw tap target marker on floor
        if (state.tapMarker && now < state.tapMarker.until) {
          var mx = Math.round(state.tapMarker.x - state.camX);
          var my = Math.round(state.tapMarker.y);
          ctx.fillStyle = '#F4B93B';
          ctx.fillRect(mx - 3, my - 1, 6, 2);
          ctx.fillRect(mx - 1, my - 2, 2, 4);
        }
        // Draw action prop badge near pig when performing an action
        if (state.action) {
          var px = Math.round(state.x - state.camX);
          var py = Math.round(state.y);
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
      }
    };
  })(${cfgJson});
  `;
}
