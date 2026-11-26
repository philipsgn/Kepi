import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import { buildOpenRoomEngineScript } from '../pixel/pixelOpenRoomEngine';
import { buildVnPixelKitPrimitivesScript } from '../pixel/vnPixelArtKit';
import { buildPhoInteriorArtScript } from './pho/phoInteriorArt';

const SafeWebView = WebView as unknown as React.ComponentType<any>;

interface PhoRestaurantBannerWebViewProps {
  onExitPho?: () => void;
}

/**
 * Quán Phở Cổ Truyền Việt Nam Toàn Màn Hình (640 × 460 — Quyết định 226)
 * Mô phỏng quy trình phục vụ thực tế 100% (Finite State Machine):
 *  - 14 Bàn inox san sát (28 ghế) chia 3 dãy + 2 lối đi dọc thông suốt (x = 208, x = 432)
 *  - Bỏ quạt trần, thay bằng 3 quạt treo tường cổ điển trên tường bếp
 *  - Khách vào cửa -> Ngồi chờ (WAITING_FOOD, bàn chưa có tô) -> 2 Nhân viên bưng phở từ bếp ra đặt lên bàn
 *    -> Khách ăn xì xụp (EATING) -> Ăn xong để tô rỗng (NEEDS_CLEAR) đi ra cửa -> Nhân viên dọn tô rỗng về bồn rửa bếp!
 */
export const PhoRestaurantBannerWebView: React.FC<PhoRestaurantBannerWebViewProps> = ({
  onExitPho,
}) => {
  const webViewRef = useRef<any>(null);
  const [roomToast, setRoomToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showRoomToast = (text: string) => {
    setRoomToast(text);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setRoomToast(null), 2600);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  const handleRoomPayload = (d: any) => {
    if (!d) return;
    if (d.type === 'HAPTIC_LIGHT') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } else if (d.type === 'ROOM_ACTION') {
      if (d.text) showRoomToast(String(d.text));
      if (d.id === 'exit_pho' && d.userTriggered && onExitPho) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
        exitTimerRef.current = setTimeout(() => onExitPho(), 140);
      }
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const onWebMsg = (ev: MessageEvent) => {
      try {
        const d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
        handleRoomPayload(d);
      } catch (_e) {}
    };
    window.addEventListener('message', onWebMsg);
    return () => window.removeEventListener('message', onWebMsg);
  }, [onExitPho]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      handleRoomPayload(data);
    } catch (_e) {}
  };

  const openRoomScript = useMemo(
    () =>
      buildOpenRoomEngineScript({
        canvasId: 'phoCv',
        worldWidth: 640,
        worldHeight: 460,
        viewWidth: 260,
        viewHeight: 380,
        walkBounds: { minX: 28, maxX: 612, minY: 154, maxY: 444 },
        initialX: 320,
        initialY: 396,
        initialCamX: 190,
        initialCamY: 60,
        speed: 58,
        obstacles: [
          { x: 20, y: 64, w: 456, h: 86 },   // Khu bếp phở + bồn rửa + 2 nồi nước dùng
          { x: 492, y: 64, w: 128, h: 86 },  // Góc trà đá, quẩy nóng & tủ lạnh
          // Cột Trái (5 bàn san sát x: 32..178)
          { x: 30, y: 168, w: 150, h: 36 },
          { x: 30, y: 214, w: 150, h: 36 },
          { x: 30, y: 260, w: 150, h: 36 },
          { x: 30, y: 306, w: 150, h: 36 },
          { x: 30, y: 352, w: 150, h: 36 },
          // Cột Giữa (4 bàn san sát x: 243..397)
          { x: 241, y: 168, w: 158, h: 36 },
          { x: 241, y: 218, w: 158, h: 36 },
          { x: 241, y: 268, w: 158, h: 36 },
          { x: 241, y: 318, w: 158, h: 36 },
          // Cột Phải (5 bàn san sát x: 462..608)
          { x: 460, y: 168, w: 150, h: 36 },
          { x: 460, y: 214, w: 150, h: 36 },
          { x: 460, y: 260, w: 150, h: 36 },
          { x: 460, y: 306, w: 150, h: 36 },
          { x: 460, y: 352, w: 150, h: 36 },
          // Quầy thu ngân & Bàn thờ Ông Địa
          { x: 20, y: 398, w: 132, h: 48 },
        ],
        hotspots: [
          {
            id: 'pho_kitchen',
            x: 24,
            y: 70,
            w: 450,
            h: 82,
            standX: 320,
            standY: 158,
            standFace: 1,
            actionType: 'look_window',
            bubbleText: 'Nồi phở sôi sùng sục thơm lừng mùi quế hồi & xương hầm!',
          },
          {
            id: 'pho_special_table',
            x: 460,
            y: 168,
            w: 150,
            h: 40,
            standX: 436,
            standY: 192,
            standFace: 1,
            actionType: 'eat_snack',
            duration: 3600,
            bubbleText: 'Tô phở tái nạm gầu nóng hổi + quẩy giòn ngon hết sảy!',
          },
          {
            id: 'iced_tea_corner',
            x: 494,
            y: 70,
            w: 124,
            h: 82,
            standX: 540,
            standY: 158,
            standFace: 1,
            actionType: 'sip_coffee',
            bubbleText: 'Làm ly trà đá mát lạnh & rổ quẩy nóng giòn rụm!',
          },
          {
            id: 'exit_pho',
            x: 262,
            y: 422,
            w: 116,
            h: 38,
            standX: 320,
            standY: 438,
            standFace: 1,
            actionType: 'jump_joy',
            fastDash: true,
            bubbleText: 'No căng bụng rồi · Ra lại Đại Lộ Sài Gòn thôi!',
          },
        ],
      }),
    []
  );

  const vnKitScript = useMemo(() => buildVnPixelKitPrimitivesScript(), []);
  const phoArtScript = useMemo(() => buildPhoInteriorArtScript(), []);

  const htmlContent = useMemo(
    () => `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: #2B2118; }
  canvas {
    display: block; width: 100%; height: 100%;
    image-rendering: pixelated;
    image-rendering: -webkit-crisp-edges;
    image-rendering: crisp-edges;
    touch-action: none;
    cursor: grab;
  }
  canvas:active { cursor: grabbing; }
</style>
</head>
<body>
<canvas id="phoCv" width="260" height="380"></canvas>
<script>
(function(){
var W = 640, H = 460;
${vnKitScript}
${phoArtScript}

/* 14 Bàn inox san sát (Trái 5, Giữa 4, Phải 5) với 2 lối đi dọc thông suốt x=208 và x=432 */
var TABLE_DEFS = [
  // Cột Trái (5 bàn, phục vụ từ lối trái x=208)
  { id: 0, x: 32, y: 174, w: 146, aisleX: 206, serveX: 194, isSpecial: false },
  { id: 1, x: 32, y: 220, w: 146, aisleX: 206, serveX: 194, isSpecial: false },
  { id: 2, x: 32, y: 266, w: 146, aisleX: 206, serveX: 194, isSpecial: false },
  { id: 3, x: 32, y: 312, w: 146, aisleX: 206, serveX: 194, isSpecial: false },
  { id: 4, x: 32, y: 358, w: 146, aisleX: 206, serveX: 194, isSpecial: false },
  // Cột Giữa (4 bàn, phục vụ từ lối trái/phải)
  { id: 5, x: 243, y: 174, w: 154, aisleX: 210, serveX: 224, isSpecial: false },
  { id: 6, x: 243, y: 224, w: 154, aisleX: 430, serveX: 416, isSpecial: false },
  { id: 7, x: 243, y: 274, w: 154, aisleX: 210, serveX: 224, isSpecial: false },
  { id: 8, x: 243, y: 324, w: 154, aisleX: 430, serveX: 416, isSpecial: false },
  // Cột Phải (5 bàn, phục vụ từ lối phải x=432)
  { id: 9,  x: 462, y: 174, w: 146, aisleX: 434, serveX: 446, isSpecial: true },
  { id: 10, x: 462, y: 220, w: 146, aisleX: 434, serveX: 446, isSpecial: false },
  { id: 11, x: 462, y: 266, w: 146, aisleX: 434, serveX: 446, isSpecial: false },
  { id: 12, x: 462, y: 312, w: 146, aisleX: 434, serveX: 446, isSpecial: false },
  { id: 13, x: 462, y: 358, w: 146, aisleX: 434, serveX: 446, isSpecial: false }
];

var SHIRT_PAL = ['#3B82F6','#EC4899','#16A34A','#F59E0B','#8B5CF6','#EF4444','#0EA5E9','#D97706','#10B981','#6366F1','#F43F5E','#14B8A6'];
var HAIR_PAL = ['#2B2118','#3B2618','#1E293B','#4A3222'];
var rng = mulberry32(22600);

function randomGuestProfile() {
  return {
    shirt: SHIRT_PAL[Math.floor(rng() * SHIRT_PAL.length)],
    hair: HAIR_PAL[Math.floor(rng() * HAIR_PAL.length)],
    hairStyle: Math.floor(rng() * 4),
    phase: rng() * 6.28
  };
}

/* Tạo 28 chỗ ngồi thực tế (2 ghế / bàn) với trạng thái FSM đầy đủ */
var SEATS = [];
for (var ti = 0; ti < TABLE_DEFS.length; ti++) {
  var tb = TABLE_DEFS[ti];
  var positions = [
    { seatX: tb.x + 30, seatY: tb.y - 3, bowlX: tb.x + 30, bowlY: tb.y + 11 },
    { seatX: tb.x + tb.w - 30, seatY: tb.y - 3, bowlX: tb.x + tb.w - 30, bowlY: tb.y + 11 }
  ];
  for (var pi = 0; pi < 2; pi++) {
    SEATS.push({
      id: SEATS.length,
      tableId: tb.id,
      seatX: positions[pi].seatX,
      seatY: positions[pi].seatY,
      bowlX: positions[pi].bowlX,
      bowlY: positions[pi].bowlY,
      aisleX: tb.aisleX,
      serveX: tb.serveX,
      serveY: tb.y + 12,
      state: 'EMPTY', // EMPTY | RESERVED | WAITING_FOOD | EATING | NEEDS_CLEAR
      eatTimer: 0,
      assignedWaiter: -1,
      guest: null
    });
  }
}

var PHO = {
  t: 0, last: 0, bg: null, pigSprites: null,
  spawnCooldown: 1.2,
  seats: SEATS,
  walkGuests: [],
  // 2 Nhân viên phục vụ chạy FSM thật (bưng tô phở đầy cho khách chờ & dọn tô rỗng về bồn rửa)
  waiters: [
    {
      id: 0, x: 224, y: 158, homeX: 230, homeY: 158, sinkX: 64, sinkY: 158,
      state: 'AT_KITCHEN', // AT_KITCHEN | SERVE_WALK | CLEAR_WALK | RETURN_DIRTY | RETURN_KITCHEN
      carrying: 'NONE',    // NONE | FULL_PHO | DIRTY_BOWL
      targetSeat: -1,
      waypoints: [],
      sp: 48, moving: false, faceX: 0, faceY: 1,
      shirt: '#38BDF8', hair: '#2B2118', hairStyle: 1, phase: 0.2
    },
    {
      id: 1, x: 416, y: 158, homeX: 410, homeY: 158, sinkX: 64, sinkY: 158,
      state: 'AT_KITCHEN',
      carrying: 'NONE',
      targetSeat: -1,
      waypoints: [],
      sp: 50, moving: false, faceX: 0, faceY: 1,
      shirt: '#FDE047', hair: '#3B2618', hairStyle: 0, phase: 2.1
    }
  ]
};

/* Khởi tạo sẵn trạng thái thực tế đa dạng ngay khi vừa mở quán */
function seedInitialRestaurantState() {
  for (var i = 0; i < PHO.seats.length; i++) {
    var r = rng();
    if (r < 0.36) {
      PHO.seats[i].state = 'EATING';
      PHO.seats[i].guest = randomGuestProfile();
      PHO.seats[i].eatTimer = 4 + rng() * 11;
    } else if (r < 0.54) {
      PHO.seats[i].state = 'WAITING_FOOD';
      PHO.seats[i].guest = randomGuestProfile();
    } else if (r < 0.64) {
      PHO.seats[i].state = 'NEEDS_CLEAR';
    }
  }
}

/* Lập lộ trình đi dọc lối đi thông suốt (KHÔNG BAO GIỜ ĐI XUYÊN BÀN!) */
function buildAislePath(fromX, fromY, toX, toY, aisleX) {
  var pts = [];
  if (Math.abs(fromY - toY) > 10) {
    pts.push({ x: aisleX, y: fromY });
    pts.push({ x: aisleX, y: toY });
  }
  pts.push({ x: toX, y: toY });
  return pts;
}

function moveAlongAisles(ent, dt) {
  if (!ent.waypoints || ent.waypoints.length === 0) {
    ent.moving = false;
    return true;
  }
  var wp = ent.waypoints[0];
  var dx = wp.x - ent.x, dy = wp.y - ent.y;
  var dist = Math.hypot(dx, dy);
  if (dist < 2.2) {
    ent.x = wp.x; ent.y = wp.y;
    ent.waypoints.shift();
    if (ent.waypoints.length === 0) {
      ent.moving = false;
      return true;
    }
    return false;
  }
  ent.moving = true;
  var step = Math.min(dist, ent.sp * dt);
  ent.x += (dx / dist) * step;
  ent.y += (dy / dist) * step;
  ent.faceX = Math.abs(dx) > 1 ? (dx > 0 ? 1 : -1) : 0;
  ent.faceY = Math.abs(dy) > 1 ? (dy > 0 ? 1 : -1) : 0;
  return false;
}

/* Máy Trạng Thái Thực Tế 100% (FSM): Khách vào -> Chờ phở -> Phục vụ bưng phở -> Ăn -> Đi ra -> Dọn tô */
function stepPhoSimulation(dt) {
  // 1. Sinh khách mới bước từ cửa chính vào ghế EMPTY định kỳ
  PHO.spawnCooldown -= dt;
  if (PHO.spawnCooldown <= 0 && PHO.walkGuests.length < 5) {
    var emptySeats = [];
    for (var i = 0; i < PHO.seats.length; i++) {
      if (PHO.seats[i].state === 'EMPTY') emptySeats.push(PHO.seats[i]);
    }
    if (emptySeats.length > 0) {
      var pick = emptySeats[Math.floor(rng() * emptySeats.length)];
      pick.state = 'RESERVED';
      var prof = randomGuestProfile();
      var startX = 310 + Math.round((rng() - 0.5) * 30);
      var startY = 446;
      PHO.walkGuests.push({
        x: startX, y: startY, sp: 34, mode: 'IN',
        seatId: pick.id,
        shirt: prof.shirt, hair: prof.hair, hairStyle: prof.hairStyle, phase: prof.phase,
        faceX: 0, faceY: -1, moving: true,
        waypoints: [
          { x: pick.aisleX, y: 416 },
          { x: pick.aisleX, y: pick.serveY },
          { x: pick.serveX, y: pick.serveY }
        ]
      });
    }
    PHO.spawnCooldown = 2.6 + rng() * 2.4;
  }

  // 2. Cập nhật khách đang đi vào ghế hoặc ăn xong đi ra cửa chính
  for (var gi = PHO.walkGuests.length - 1; gi >= 0; gi--) {
    var wg = PHO.walkGuests[gi];
    var arrived = moveAlongAisles(wg, dt);
    if (arrived) {
      if (wg.mode === 'IN') {
        var st = PHO.seats[wg.seatId];
        if (st) {
          st.state = 'WAITING_FOOD'; // Ngồi xuống ghế chờ món (chưa có tô phở!)
          st.guest = { shirt: wg.shirt, hair: wg.hair, hairStyle: wg.hairStyle, phase: wg.phase };
        }
      }
      PHO.walkGuests.splice(gi, 1);
    }
  }

  // 3. Cập nhật khách đang ăn (EATING -> ăn xong để tô rỗng NEEDS_CLEAR & đứng dậy đi ra cửa!)
  for (var si = 0; si < PHO.seats.length; si++) {
    var seat = PHO.seats[si];
    if (seat.state === 'EATING') {
      seat.eatTimer -= dt;
      if (seat.eatTimer <= 0) {
        var leaving = seat.guest;
        seat.guest = null;
        seat.state = 'NEEDS_CLEAR'; // Để lại tô phở rỗng chờ nhân viên dọn!
        if (leaving) {
          PHO.walkGuests.push({
            x: seat.serveX, y: seat.serveY, sp: 36, mode: 'OUT',
            seatId: -1,
            shirt: leaving.shirt, hair: leaving.hair, hairStyle: leaving.hairStyle, phase: leaving.phase,
            faceX: 0, faceY: 1, moving: true,
            waypoints: [
              { x: seat.aisleX, y: seat.serveY },
              { x: seat.aisleX, y: 416 },
              { x: 320, y: 448 }
            ]
          });
        }
      }
    }
  }

  // 4. AI cho 2 Nhân Viên Phục Vụ (ưu tiên bưng phở cho khách WAITING_FOOD -> rồi dọn tô rỗng NEEDS_CLEAR về bồn rửa!)
  for (var wi = 0; wi < PHO.waiters.length; wi++) {
    var w = PHO.waiters[wi];
    if (w.state === 'AT_KITCHEN') {
      // Tìm khách đang chờ món chưa có nhân viên nhận
      var waitTarget = null;
      for (var k = 0; k < PHO.seats.length; k++) {
        if (PHO.seats[k].state === 'WAITING_FOOD' && PHO.seats[k].assignedWaiter === -1) {
          waitTarget = PHO.seats[k]; break;
        }
      }
      if (waitTarget) {
        waitTarget.assignedWaiter = w.id;
        w.targetSeat = waitTarget.id;
        w.carrying = 'FULL_PHO';
        w.state = 'SERVE_WALK';
        w.waypoints = buildAislePath(w.x, w.y, waitTarget.serveX, waitTarget.serveY, waitTarget.aisleX);
      } else {
        // Nếu không có khách chờ món -> tìm bàn có tô rỗng NEEDS_CLEAR đi dọn!
        var dirtyTarget = null;
        for (var d = 0; d < PHO.seats.length; d++) {
          if (PHO.seats[d].state === 'NEEDS_CLEAR' && PHO.seats[d].assignedWaiter === -1) {
            dirtyTarget = PHO.seats[d]; break;
          }
        }
        if (dirtyTarget) {
          dirtyTarget.assignedWaiter = w.id;
          w.targetSeat = dirtyTarget.id;
          w.carrying = 'NONE';
          w.state = 'CLEAR_WALK';
          w.waypoints = buildAislePath(w.x, w.y, dirtyTarget.serveX, dirtyTarget.serveY, dirtyTarget.aisleX);
        }
      }
    } else if (w.state === 'SERVE_WALK') {
      if (moveAlongAisles(w, dt)) {
        var sServe = PHO.seats[w.targetSeat];
        if (sServe && sServe.state === 'WAITING_FOOD') {
          sServe.state = 'EATING'; // Đặt tô phở đầy lên bàn -> khách bắt đầu ăn!
          sServe.eatTimer = 11 + rng() * 6;
          sServe.assignedWaiter = -1;
        }
        w.carrying = 'NONE';
        w.targetSeat = -1;
        w.state = 'RETURN_KITCHEN';
        w.waypoints = buildAislePath(w.x, w.y, w.homeX, w.homeY, sServe ? sServe.aisleX : 208);
      }
    } else if (w.state === 'CLEAR_WALK') {
      if (moveAlongAisles(w, dt)) {
        var sDirty = PHO.seats[w.targetSeat];
        if (sDirty && sDirty.state === 'NEEDS_CLEAR') {
          sDirty.state = 'EMPTY'; // Dọn sạch tô rỗng khỏi bàn!
          sDirty.assignedWaiter = -1;
        }
        w.carrying = 'DIRTY_BOWL'; // Bưng tô rỗng mang về bồn rửa chén góc trái bếp
        w.targetSeat = -1;
        w.state = 'RETURN_DIRTY';
        w.waypoints = buildAislePath(w.x, w.y, w.sinkX, w.sinkY, sDirty ? sDirty.aisleX : 208);
      }
    } else if (w.state === 'RETURN_DIRTY') {
      if (moveAlongAisles(w, dt)) {
        w.carrying = 'NONE'; // Đã trả tô rỗng vào bồn rửa
        w.state = 'RETURN_KITCHEN';
        w.waypoints = [{ x: w.homeX, y: w.homeY }];
      }
    } else if (w.state === 'RETURN_KITCHEN') {
      if (moveAlongAisles(w, dt)) {
        w.state = 'AT_KITCHEN';
        w.faceX = 0; w.faceY = 1;
      }
    }
  }
}

function buildPigSet() {
  return {
    idle: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 0, blink: false }); }),
    step1: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 1, blink: false }); }),
    step2: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 2, blink: false }); }),
    blink: mk(24, 20, function(g) { drawPigSpriteCanonical(g, { step: 0, blink: true }); })
  };
}

function drawPigInPho(ctx, st, t) {
  if (!PHO.pigSprites) return;
  var px = Math.round(st.x), py = Math.round(st.y);
  var bounce = st.walking
    ? Math.round(Math.abs(Math.sin(t * 11)) * 1.5)
    : (st.action ? Math.round(Math.abs(Math.sin(t * 7)) * 2.2) : 0);
  var sp = PHO.pigSprites.idle;
  if (st.walking) sp = (Math.floor(t * 10) % 2 === 0) ? PHO.pigSprites.step1 : PHO.pigSprites.step2;
  else if ((t % 3.6) < 0.14) sp = PHO.pigSprites.blink;
  drawContactShadow(ctx, px, py + 1, 7.5, 2.5);
  ctx.save();
  ctx.translate(px, py - 17 - bounce);
  if (st.facing < 0) ctx.scale(-1, 1);
  ctx.drawImage(sp, -12, 0);
  ctx.restore();
}

function syncViewport() {
  var cv = document.getElementById('phoCv');
  if (!cv) return;
  var rect = cv.getBoundingClientRect();
  if (!rect || !rect.width || !rect.height) return;
  var aspect = rect.width / rect.height;
  var baseW = 280;
  var vh = Math.max(180, Math.min(460, Math.round(baseW / Math.max(0.45, Math.min(2.2, aspect)))));
  var vw = Math.max(200, Math.min(640, Math.round(vh * aspect)));
  if (cv.width !== vw || cv.height !== vh) {
    cv.width = vw;
    cv.height = vh;
    if (window.__openRoom && window.__openRoom.resize) {
      window.__openRoom.resize(vw, vh);
    }
  }
}

function phoFrame(now) {
  var dt = Math.min(0.05, (now - PHO.last) / 1000);
  PHO.last = now;
  PHO.t += dt;

  stepPhoSimulation(dt);

  var eng = window.__openRoom;
  var cv = document.getElementById('phoCv');
  if (!cv || !PHO.bg) { requestAnimationFrame(phoFrame); return; }
  var ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  if (eng) eng.step(dt, now);
  var camX = eng ? Math.round(eng.state.camX) : 180;
  var camY = eng ? Math.round(eng.state.camY) : 50;

  ctx.save();
  ctx.translate(-camX, -camY);
  ctx.drawImage(PHO.bg, 0, 0);
  drawPhoLiveEntities(
    ctx,
    PHO.t,
    PHO.seats,
    PHO.waiters,
    PHO.walkGuests,
    eng ? eng.state : null,
    function() { if (eng) drawPigInPho(ctx, eng.state, PHO.t); }
  );
  ctx.restore();

  if (eng) eng.drawOverlays(ctx, now);
  requestAnimationFrame(phoFrame);
}

function phoStart() {
  PHO.bg = mk(W, H, function(c) { drawPhoStaticBg(c, TABLE_DEFS); });
  PHO.pigSprites = buildPigSet();
  seedInitialRestaurantState();
  syncViewport();
  window.addEventListener('resize', syncViewport);
  PHO.last = performance.now();
  requestAnimationFrame(phoFrame);
}

${openRoomScript}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', phoStart);
} else {
  phoStart();
}
})();
</script>
</body>
</html>`,
    [vnKitScript, phoArtScript, openRoomScript]
  );

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          srcDoc={htmlContent}
          style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#2B2118' } as any}
        />
      ) : (
        <SafeWebView
          ref={webViewRef}
          source={{ html: htmlContent }}
          style={styles.webView}
          containerStyle={styles.webView}
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={handleMessage}
        />
      )}
      {Boolean(roomToast) && (
        <View style={styles.roomToast} pointerEvents="none">
          <Text style={styles.roomToastText} numberOfLines={2}>
            {roomToast}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#2B2118',
  },
  webView: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#2B2118',
  },
  roomToast: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    maxWidth: '86%',
    backgroundColor: '#2B2118',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#F4B93B',
  },
  roomToastText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '800',
    fontSize: 12,
    color: '#FFFBF1',
    textAlign: 'center',
  },
});
