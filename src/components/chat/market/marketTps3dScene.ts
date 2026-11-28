/**
 * Chợ Bến Thành Sài Gòn WebGL 3D Hợp Nhất Không Cắt Cảnh (Quyết định 250)
 * - Không gian Chế độ A kín 100% (Mái kèo thép cao 5.8m + ô giếng trời kính mờ):
 *   + 'south_hall'  (Sảnh Cửa Nam & Áo Dài): X ∈ [-6.0, 6.0], Z ∈ [0, 13.6], Y = 0
 *     Cửa Số 1 (X ∈ [-1.55, 1.55], Z = 0), Hương Trinh (X ∈ [-5.95, -4.15], Z ∈ [1.5, 11.5]),
 *     Liên Sài Gòn 823 (X ∈ [4.15, 5.95], Z ∈ [1.5, 8.2]).
 *   + 'food_court'  (Khu Ẩm Thực Sạp 1044): X ∈ [-6.0, 6.0], Z ∈ [13.6, 26.8], Y = 0
 *     Vòm KHU ĂN UỐNG (X ∈ [-1.8, 1.8], Z = 13.6), Sạp 1044 (X ∈ [-1.75, 1.75], Z ∈ [19.7, 22.9])
 *     + 4 ghế đẩu inox tương tác (Seated Auto-Stand), Bánh Cuốn 50K (X ∈ [-5.95, -4.15], Z ∈ [15.4, 24.8]),
 *     Bánh Bèo Huế 20K (X ∈ [4.15, 5.95], Z ∈ [15.4, 21.8]).
 *   + 'fruit_craft' (Cánh Đông Trái Cây & Lưu Niệm): X ∈ [6.0, 17.2], Z ∈ [13.6, 26.8], Y = 0
 *     Ngã tư Chợ Đông phía Bắc tại X = 6.0, Z ∈ [22.6, 25.8] (rộng 3.2m),
 *     Đảo Trái Cây 1029 Ngọc Hảo (X ∈ [9.95, 13.25], Z ∈ [18.8, 22.0]),
 *     Kệ Gốm Sứ (X ∈ [6.05, 7.80], Z ∈ [14.8, 21.6]), Kệ Nón Lá (X ∈ [15.4, 17.15], Z ∈ [15.4, 21.8]),
 *     Cửa Bắc (X ∈ [10.05, 13.15], Z = 26.8).
 * - 12 NPC (waiter, chef, chef_noodle, customer) + Chú Heo 24×20 (áo dài 'aodai') dùng gl.NEAREST Billboard.
 * - Giữ Canvas2D fallback (renderMarketTpsScene) phục vụ Test 183 và thiết bị không có WebGL.
 */
export function buildMarketTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. ĐỒ THỊ KHÔNG GIAN HỢP NHẤT & PORTAL-AWARE WALLS (QĐ 250) ==================== */
var MARKET_NAV_GRAPH = {
  wallMargin: 0.38,
  outerBounds: { minX: -6.0, maxX: 17.2, minZ: 0.0, maxZ: 26.8, minY: 0.45, maxY: 5.8 },
  zones: [
    { id: 'south_hall',  minX: -6.0, maxX:  6.0, minZ:  0.0, maxZ: 13.6, floorY: 0 },
    { id: 'food_court',  minX: -6.0, maxX:  6.0, minZ: 13.6, maxZ: 26.8, floorY: 0 },
    { id: 'fruit_craft', minX:  6.0, maxX: 17.2, minZ: 13.6, maxZ: 26.8, floorY: 0 }
  ],
  dividerWalls: [
    // Vách ngăn South Hall <-> Food Court (Z = 13.6), mở cổng vòm KHU ĂN UỐNG [-1.8, 1.8]
    { axis: 'z', pos: 13.6, minSpan: -6.0, maxSpan: 6.0, minY: 0, maxY: 5.8, openings: [{ a1: -1.8, a2: 1.8, y1: 0, y2: 3.45 }] },
    // Vách ngăn Food Court <-> Fruit Craft (X = 6.0), mở Ngã tư Chợ Đông [22.6, 25.8]
    { axis: 'x', pos: 6.0, minSpan: 13.6, maxSpan: 26.8, minY: 0, maxY: 5.8, openings: [{ a1: 22.6, a2: 25.8, y1: 0, y2: 3.45 }] },
    // Tường Đông khép kín của South Hall (X = 6.0, Z = 0..13.6) & Tường Nam của Fruit Craft (Z = 13.6, X = 6..17.2)
    { axis: 'x', pos: 6.0, minSpan: 0.0, maxSpan: 13.6, minY: 0, maxY: 5.8, openings: [] },
    { axis: 'z', pos: 13.6, minSpan: 6.0, maxSpan: 17.2, minY: 0, maxY: 5.8, openings: [] }
  ],
  edges: [
    {
      from: 'south_hall', to: 'food_court',
      waypointsForward:  [{ x: 0, y: 0, z: 12.6 }, { x: 0, y: 0, z: 14.6 }],
      waypointsBackward: [{ x: 0, y: 0, z: 14.6 }, { x: 0, y: 0, z: 12.6 }]
    },
    {
      from: 'food_court', to: 'fruit_craft',
      waypointsForward:  [{ x: 4.8, y: 0, z: 24.2 }, { x: 7.2, y: 0, z: 24.2 }],
      waypointsBackward: [{ x: 7.2, y: 0, z: 24.2 }, { x: 4.8, y: 0, z: 24.2 }]
    }
  ]
};

var MARKET_ZONE_CENTERS = {
  south_hall:  { x: 0.0,  y: 0, z: 6.2 },
  food_court:  { x: 0.0,  y: 0, z: 17.6 },
  fruit_craft: { x: 11.6, y: 0, z: 17.6 }
};

function getMarketZoneAt(x, z) {
  if (z < 13.6) return 'south_hall';
  if (x >= 6.0) return 'fruit_craft';
  return 'food_court';
}

function createMarketStools() {
  // 4 ghế đẩu inox tương tác phía trước Sạp 1044 (Z = 19.15, đối diện quầy Z = 19.7..22.9)
  return [
    { id: 0, floorY: 0, x: -1.15, y: 0, z: 19.15, lookX: -1.15, lookZ: 20.1, yaw: 0 },
    { id: 1, floorY: 0, x: -0.38, y: 0, z: 19.15, lookX: -0.38, lookZ: 20.1, yaw: 0 },
    { id: 2, floorY: 0, x:  0.38, y: 0, z: 19.15, lookX:  0.38, lookZ: 20.1, yaw: 0 },
    { id: 3, floorY: 0, x:  1.15, y: 0, z: 19.15, lookX:  1.15, lookZ: 20.1, yaw: 0 }
  ];
}

function createMarketNpcs() {
  // 12 NPC đầy đủ vai trò tiểu thương (waiter), đầu bếp (chef, chef_noodle) & khách (customer)
  return [
    // Sảnh Cửa Nam (4 NPC)
    { id: 'sh_w1', x: -3.70, y: 0, z: 4.80, yaw:  Math.PI * 0.5, role: 'waiter',      shirt: '#E11D48', hair: '#1C1917', moving: false, seated: false, phase: 0.2 },
    { id: 'sh_c1', x: -3.70, y: 0, z: 8.80, yaw:  Math.PI * 0.5, role: 'customer',    shirt: '#F59E0B', hair: '#292524', moving: false, seated: false, phase: 1.4 },
    { id: 'sh_w2', x:  3.70, y: 0, z: 5.20, yaw: -Math.PI * 0.5, role: 'waiter',      shirt: '#15803D', hair: '#1C1917', moving: false, seated: false, phase: 0.8 },
    {
      id: 'sh_c2', x: 0.90, y: 0, z: 7.40, yaw: 0, role: 'customer', shirt: '#2563EB', hair: '#451A03',
      moving: true, seated: false, phase: 2.1, stepIdx: 0,
      pts: [{ x: 0.90, z: 4.6 }, { x: 0.90, z: 12.2 }, { x: 0.90, z: 16.4 }, { x: 0.90, z: 12.2 }]
    },
    // Khu Ẩm Thực 1044 (5 NPC)
    { id: 'fc_chef',   x: -0.20, y: 0, z: 23.35, yaw: Math.PI,        role: 'chef',        shirt: '#FFFFFF', hair: '#1C1917', moving: false, seated: false, phase: 0.4, carryProp: 'bowl' },
    { id: 'fc_noodle', x: -3.80, y: 0, z: 19.80, yaw:  Math.PI * 0.5, role: 'chef_noodle', shirt: '#FFFFFF', hair: '#292524', moving: false, seated: false, phase: 1.2 },
    { id: 'fc_waiter', x:  3.75, y: 0, z: 18.60, yaw: -Math.PI * 0.5, role: 'waiter',      shirt: '#B45309', hair: '#1C1917', moving: false, seated: false, phase: 1.9, carryProp: 'tray' },
    { id: 'fc_c1',     x: -1.15, y: 0, z: 19.15, yaw: 0,              role: 'customer',    shirt: '#0284C7', hair: '#1C1917', moving: false, seated: true,  eating: true, phase: 0.7 },
    {
      id: 'fc_c2', x: 3.10, y: 0, z: 24.20, yaw: Math.PI * 0.5, role: 'customer', shirt: '#E11D48', hair: '#451A03',
      moving: true, seated: false, phase: 2.3, stepIdx: 0,
      pts: [{ x: 3.10, z: 24.2 }, { x: 8.60, z: 24.2 }, { x: 11.60, z: 24.2 }, { x: 8.60, z: 24.2 }]
    },
    // Cánh Đông Trái Cây & Lưu Niệm (3 NPC)
    { id: 'fr_w1', x: 11.60, y: 0, z: 22.55, yaw: Math.PI,        role: 'waiter',   shirt: '#16A34A', hair: '#1C1917', moving: false, seated: false, phase: 0.5 },
    { id: 'fr_w2', x:  8.25, y: 0, z: 18.20, yaw: -Math.PI * 0.5, role: 'waiter',   shirt: '#1D4ED8', hair: '#292524', moving: false, seated: false, phase: 1.6 },
    {
      id: 'fr_c1', x: 14.80, y: 0, z: 18.40, yaw: 0, role: 'customer', shirt: '#D97706', hair: '#1C1917',
      moving: true, seated: false, phase: 2.4, stepIdx: 0,
      pts: [{ x: 14.80, z: 16.4 }, { x: 14.80, z: 22.2 }, { x: 11.60, z: 24.6 }, { x: 14.80, z: 22.2 }]
    }
  ];
}

function createMarketTpsState() {
  var npcs = createMarketNpcs();
  var stools = createMarketStools();
  return {
    zone: 'south_hall',
    room: 'south_hall',
    pig: {
      x: 0.0, y: 0.0, z: 1.8, yaw: 0.0,
      targetX: 0.0, targetZ: 3.2,
      waypoints: [],
      walking: true, seated: false, seatChairId: -1,
      pendingSeatId: -1, pendingAction: null,
      eating: false,
      wearingAoDai: false, ateFood: false, boughtFruit: false
    },
    stools: stools,
    npcs: npcs,
    // Giữ alias mảng cho các kiểm tra tương thích cũ
    southPeople: npcs.slice(0, 4),
    foodPeople: npcs.slice(4, 9),
    fruitPeople: npcs.slice(9, 12),
    southGateOpen: 0.0,
    northGateOpen: 0.0,
    rightDoorOpen: 0.0,
    exitFade: 0,
    exiting: false,
    onZoneChanged: null,
    ripples: [],
    toast: 'Chợ Bến Thành · Sảnh Cửa Nam! Đi bộ xuyên vòm Khu Ăn Uống & Ngã tư Chợ Đông 👘',
    toastUntil: 5.0,
    t: 0
  };
}

var MARKET_STALL_AABBS = [
  // South Hall
  { x1: -5.95, z1:  1.50, x2: -4.15, z2: 11.50 }, // Sạp Vải Hương Trinh
  { x1:  4.15, z1:  1.50, x2:  5.95, z2:  8.20 }, // Đặc Sản Liên Sài Gòn
  // Food Court
  { x1: -1.75, z1: 19.70, x2:  1.75, z2: 22.90 }, // Sạp 1044 trung tâm
  { x1: -5.95, z1: 15.40, x2: -4.15, z2: 24.80 }, // Bánh Cuốn Nóng 50K
  { x1:  4.15, z1: 15.40, x2:  5.95, z2: 21.80 }, // Bánh Bèo Huế 20K
  // Fruit Craft (Cánh Đông)
  { x1:  9.95, z1: 18.80, x2: 13.25, z2: 22.00 }, // Đảo Trái Cây 1029 Ngọc Hảo
  { x1:  6.05, z1: 14.80, x2:  7.80, z2: 21.60 }, // Kệ Gốm Sứ Bát Tràng
  { x1: 15.40, z1: 15.40, x2: 17.15, z2: 21.80 }  // Kệ Nón Lá & Quà Lưu Niệm
];

function clampMarketWalkPos(st, x, z) {
  var nz = Math.max(0.55, Math.min(26.25, z));
  var nx = x;
  if (nz < 13.6) {
    nx = Math.max(-5.62, Math.min(5.62, nx));
  } else {
    nx = Math.max(-5.62, Math.min(16.82, nx));
  }
  // Cấm xuyên tường ngăn Z = 13.6 ngoài vòm KHU ĂN UỐNG [-1.8, 1.8]
  if (nx < 6.0 && nz > 13.22 && nz < 13.98 && Math.abs(nx) > 1.46) {
    nz = (st && st.pig && st.pig.z >= 13.6) ? 13.98 : 13.22;
  }
  // Tường Nam của Cánh Đông (X >= 6.0, Z = 13.6)
  if (nx >= 5.66 && nz < 13.98) {
    if (st && st.pig && st.pig.z < 13.6) nx = 5.62;
    else nz = 13.98;
  }
  // Vách ngăn Food Court <-> Fruit Craft tại X = 6.0 ngoài Ngã tư Chợ Đông [22.6, 25.8]
  if (nz >= 13.6 && nx > 5.64 && nx < 6.36 && (nz < 22.92 || nz > 25.48)) {
    nx = (st && st.pig && st.pig.x >= 6.0) ? 6.36 : 5.64;
  }
  // Chặn va chạm 8 quầy sạp với đệm 0.34m
  for (var i = 0; i < MARKET_STALL_AABBS.length; i++) {
    var b = MARKET_STALL_AABBS[i];
    if (nx > b.x1 - 0.34 && nx < b.x2 + 0.34 && nz > b.z1 - 0.34 && nz < b.z2 + 0.34) {
      var dl = Math.abs(nx - (b.x1 - 0.34)), dr = Math.abs(nx - (b.x2 + 0.34));
      var dt = Math.abs(nz - (b.z1 - 0.34)), db = Math.abs(nz - (b.z2 + 0.34));
      var m = Math.min(dl, dr, dt, db);
      if (m === dl) nx = b.x1 - 0.34;
      else if (m === dr) nx = b.x2 + 0.34;
      else if (m === dt) nz = b.z1 - 0.34;
      else nz = b.z2 + 0.34;
    }
  }
  return { x: nx, z: nz };
}

function planMarketRealtimePath(st, tx, ty, tz, extraOpts) {
  var p = st.pig;
  var eo = extraOpts || {};
  // Seated Pig Auto-Stand (QĐ 250)
  p.seated = false;
  p.seatChairId = -1;
  p.eating = false;
  p.pendingSeatId = typeof eo.seatChairId === 'number' ? eo.seatChairId : -1;
  p.pendingAction = eo.pendingAction || null;

  var cl = clampMarketWalkPos(st, tx, tz);
  tx = cl.x; tz = cl.z;

  if (typeof planNavGraphRealtimePath === 'function') {
    planNavGraphRealtimePath(MARKET_NAV_GRAPH, st, tx, 0, tz, eo);
    // Vòng tránh Đảo Sạp 1044 hoặc Đảo Trái Cây 1029 nếu đi thẳng xuyên tâm đảo trong cùng zone
    if (p.waypoints && p.waypoints.length > 0) {
      var out = [];
      var prevX = p.x, prevZ = p.z;
      for (var i = 0; i < p.waypoints.length; i++) {
        var wp = p.waypoints[i];
        // Tránh xuyên qua Sạp 1044 (X ∈ [-2.0, 2.0], Z ∈ [19.4, 23.2])
        if (Math.min(prevX, wp.x) < 2.0 && Math.max(prevX, wp.x) > -2.0 &&
            Math.min(prevZ, wp.z) < 23.2 && Math.max(prevZ, wp.z) > 19.4) {
          var sideX = ((prevX + wp.x) * 0.5 >= 0) ? 2.55 : -2.55;
          out.push({ x: sideX, y: 0, z: 21.3 });
        }
        // Tránh xuyên qua Đảo Trái Cây 1029 (X ∈ [9.6, 13.6], Z ∈ [18.5, 22.3])
        if (Math.min(prevX, wp.x) < 13.5 && Math.max(prevX, wp.x) > 9.7 &&
            Math.min(prevZ, wp.z) < 22.3 && Math.max(prevZ, wp.z) > 18.5) {
          var fSideX = ((prevX + wp.x) * 0.5 >= 11.6) ? 14.05 : 9.15;
          out.push({ x: fSideX, y: 0, z: 20.4 });
        }
        out.push(wp);
        prevX = wp.x; prevZ = wp.z;
      }
      p.waypoints = out;
      p.targetX = out[0].x;
      p.targetZ = out[0].z;
    }
    return;
  }

  p.waypoints = [{ x: tx, y: 0, z: tz }];
  p.targetX = tx; p.targetZ = tz; p.walking = true;
}

function navigateMarketToZone(st, zoneId) {
  var center = MARKET_ZONE_CENTERS[zoneId];
  if (!center) return;
  planMarketRealtimePath(st, center.x, 0, center.z, {});
}

function stepMarketNpcs(st, dt) {
  if (!st.npcs) return;
  for (var i = 0; i < st.npcs.length; i++) {
    var n = st.npcs[i];
    if (!n.pts || !n.pts.length) continue;
    var tgt = n.pts[(n.stepIdx + 1) % n.pts.length];
    var dx = tgt.x - n.x, dz = tgt.z - n.z;
    var d = Math.hypot(dx, dz);
    if (d < 0.12) {
      n.x = tgt.x; n.z = tgt.z;
      n.stepIdx = (n.stepIdx + 1) % n.pts.length;
    } else {
      var spd = Math.min(d, 1.35 * dt);
      n.x += (dx / d) * spd;
      n.z += (dz / d) * spd;
      n.yaw = Math.atan2(dx, dz);
    }
  }
}

function stepMarketTps(st, dt) {
  st.t += dt;
  st._lastDt = dt;
  var p = st.pig;

  stepMarketNpcs(st, dt);

  if (!p.seated && p.walking) {
    var curWp = (p.waypoints && p.waypoints.length > 0) ? p.waypoints[0] : { x: p.targetX, z: p.targetZ };
    var dx = curWp.x - p.x, dz = curWp.z - p.z;
    var dist = Math.hypot(dx, dz);
    if (dist < 0.10) {
      p.x = curWp.x; p.z = curWp.z;
      if (p.waypoints && p.waypoints.length > 0) p.waypoints.shift();
      if (p.waypoints && p.waypoints.length > 0) {
        p.targetX = p.waypoints[0].x;
        p.targetZ = p.waypoints[0].z;
      } else {
        p.walking = false;
        if (p.pendingSeatId >= 0 && st.stools && st.stools[p.pendingSeatId]) {
          var sl = st.stools[p.pendingSeatId];
          p.x = sl.x; p.z = sl.z; p.y = 0;
          p.yaw = Math.atan2(sl.lookX - sl.x, sl.lookZ - sl.z);
          p.seated = true; p.seatChairId = sl.id;
          p.eating = (p.pendingAction === 'eat_banhcuon');
          if (p.eating) {
            p.ateFood = true;
            st.toast = 'Sạp 1044: Bánh Cuốn Nóng 50K, Bánh Bèo Huế 20K & Dừa Xiêm ngọt lịm! 🥞🥥';
            st.toastUntil = st.t + 4.4;
          } else {
            st.toast = 'Đã ngồi ghế inox Sạp 1044! Chạm nút để ăn hoặc chạm sàn tự đứng dậy đi tiếp 🪑';
            st.toastUntil = st.t + 3.8;
          }
          p.pendingSeatId = -1;
        }
        if (p.pendingAction === 'try_aodai') {
          p.wearingAoDai = !p.wearingAoDai;
          p.yaw = -Math.PI * 0.5;
          st.toast = p.wearingAoDai
            ? 'Sạp Hương Trinh: Đã ướm thử Áo Dài Lụa Hà Đông thêu Hoa Sen cực duyên! 👘✨'
            : 'Đã xếp gọn Áo Dài Lụa & dạo tiếp Chợ Bến Thành!';
          st.toastUntil = st.t + 4.2;
        } else if (p.pendingAction === 'buy_mango') {
          p.boughtFruit = true;
          p.yaw = 0;
          st.toast = 'Sạp 1029 Ngọc Hảo: Đã chọn Xoài Cát Hòa Lộc chín vàng, Nón Lá & Gốm Bát Tràng! 🥭👒';
          st.toastUntil = st.t + 4.4;
        } else if (p.pendingAction === 'exit_market') {
          st.exiting = true;
        }
        p.pendingAction = null;
      }
    } else {
      var spd = Math.min(dist, 3.6 * dt);
      var next = clampMarketWalkPos(st, p.x + (dx / dist) * spd, p.z + (dz / dist) * spd);
      p.x = next.x; p.z = next.z;
      var tyaw = Math.atan2(dx, dz);
      p.yaw = (typeof tpsLerpAngle === 'function') ? tpsLerpAngle(p.yaw || 0, tyaw, Math.min(1, dt * 12)) : tyaw;
    }

    // Cập nhật thụ động zone khi Heo đi bộ vượt cổng (0% teleport)
    var newZone = getMarketZoneAt(p.x, p.z);
    if (newZone !== st.zone) {
      st.zone = newZone;
      st.room = newZone;
      if (newZone === 'food_court') {
        st.toast = 'Khu Ẩm Thực Trung Tâm Sạp 1044 · Bánh Cuốn 50K, Bánh Bèo Huế 20K 🥞';
      } else if (newZone === 'fruit_craft') {
        st.toast = 'Cánh Đông · Đảo Trái Cây 1029 Ngọc Hảo, Gốm Bát Tràng & Nón Lá 🥭';
      } else {
        st.toast = 'Sảnh Cửa Nam · Sạp Vải Áo Dài Hương Trinh & Đặc Sản Liên Sài Gòn 👘';
      }
      st.toastUntil = st.t + 3.8;
      if (typeof st.onZoneChanged === 'function') st.onZoneChanged(newZone);
    }
  }

  // Cổng sắt xếp Cửa Nam & Cửa Bắc mở mượt khi rời chợ
  var nearNorth = p.z > 21.0 && p.x > 6.0;
  var targetSouth = (st.exiting && !nearNorth) ? 0.92 : 0.0;
  var targetNorth = (st.exiting && nearNorth) ? 0.92 : 0.0;
  st.southGateOpen += (targetSouth - st.southGateOpen) * Math.min(1, dt * 6.0);
  st.northGateOpen += (targetNorth - st.northGateOpen) * Math.min(1, dt * 6.0);
  st.rightDoorOpen = st.southGateOpen;
  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.2);

  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== 2. RAYCAST 3D TƯƠNG TÁC (GHẾ, QUẦY, CỔNG & SÀN CHỮ L) ==================== */
function rayMarketSphere(ox, oy, oz, dx, dy, dz, cx, cy, cz, rad) {
  var ocx = cx - ox, ocy = cy - oy, ocz = cz - oz;
  var proj = ocx * dx + ocy * dy + ocz * dz;
  if (proj < 0.2 || proj > 26) return -1;
  var d2 = (ocx * ocx + ocy * ocy + ocz * ocz) - proj * proj;
  return d2 <= rad * rad ? proj : -1;
}

function pickMarketTarget3D(cam, st, sx, sy) {
  var nx = (sx - cam.vw * 0.5) / (cam.focal || 400);
  var ny = (cam.vh * 0.5 - sy) / (cam.focal || 400);
  var dx = cam.F.x + cam.R.x * nx + cam.U.x * ny;
  var dy = cam.F.y + cam.R.y * nx + cam.U.y * ny;
  var dz = cam.F.z + cam.R.z * nx + cam.U.z * ny;
  var dl = Math.hypot(dx, dy, dz) || 1;
  dx /= dl; dy /= dl; dz /= dl;
  var ox = cam.pos.x, oy = cam.pos.y, oz = cam.pos.z;

  // 1. Chạm vào bất kỳ Ghế đẩu inox nào tại Sạp 1044
  if (st.stools) {
    var bestS = null, bestT = 999;
    for (var i = 0; i < st.stools.length; i++) {
      var sl = st.stools[i];
      var ht = rayMarketSphere(ox, oy, oz, dx, dy, dz, sl.x, 0.32, sl.z, 0.52);
      if (ht > 0 && ht < bestT) { bestT = ht; bestS = sl; }
    }
    if (bestS) return { kind: 'stool', stool: bestS, x: bestS.x, y: 0, z: bestS.z };
  }

  // 2. Chạm Sạp Vải Hương Trinh (thử Áo Dài)
  if (rayMarketSphere(ox, oy, oz, dx, dy, dz, -4.9, 1.0, 6.5, 1.75) > 0) {
    return { kind: 'aodai', x: -3.4, y: 0, z: 6.5 };
  }
  // 3. Chạm Quầy Sạp 1044 / Bánh Cuốn
  if (rayMarketSphere(ox, oy, oz, dx, dy, dz, 0.0, 0.9, 21.3, 1.85) > 0) {
    return { kind: 'food', x: -0.38, y: 0, z: 19.15, stoolId: 1 };
  }
  // 4. Chạm Đảo Trái Cây 1029 Ngọc Hảo
  if (rayMarketSphere(ox, oy, oz, dx, dy, dz, 11.6, 0.9, 20.4, 1.75) > 0) {
    return { kind: 'fruit', x: 11.6, y: 0, z: 17.9 };
  }
  // 5. Chạm Cửa Số 1 (Cửa Nam) hoặc Cửa Bắc -> đi ra khỏi chợ
  if (rayMarketSphere(ox, oy, oz, dx, dy, dz, 0.0, 1.3, 0.1, 1.55) > 0) {
    return { kind: 'exit', x: 0.0, y: 0, z: 1.05 };
  }
  if (rayMarketSphere(ox, oy, oz, dx, dy, dz, 11.6, 1.3, 26.7, 1.55) > 0) {
    return { kind: 'exit', x: 11.6, y: 0, z: 25.65 };
  }

  // 6. Chạm Sàn 3D ở bất kỳ zone nào của Chợ Bến Thành chữ L
  if (dy < -0.025) {
    var tFloor = -oy / dy;
    if (tFloor > 0.2 && tFloor < 34) {
      var fx = ox + dx * tFloor, fz = oz + dz * tFloor;
      var inSouth = (fx >= -6.0 && fx <= 6.0 && fz >= 0.0 && fz <= 13.6);
      var inFood  = (fx >= -6.0 && fx <= 6.0 && fz >= 13.6 && fz <= 26.8);
      var inFruit = (fx >= 6.0 && fx <= 17.2 && fz >= 13.6 && fz <= 26.8);
      if (inSouth || inFood || inFruit) {
        var cl = clampMarketWalkPos(st, fx, fz);
        return { kind: 'floor', x: cl.x, y: 0, z: cl.z };
      }
    }
  }
  return null;
}

/* ==================== 3. RENDER WEBGL 3D ĐẠI SẢNH CHỢ BẾN THÀNH LIÊN HOÀN (QĐ 250) ==================== */
var MARKET_ATMO = {
  clearColor: [0.22, 0.14, 0.08, 1.0],
  hemiLow: [0.36, 0.28, 0.18],
  hemiHigh: [0.76, 0.66, 0.48],
  sunDir: [0.26, 0.86, -0.44],
  sunCol: [1.08, 0.92, 0.66],
  wrapBias: 0.46,
  outdoorRect: [0.0, 0.0, 0.0, 0.0],
  fogCol: [0.34, 0.24, 0.14],
  fogParams: [14.0, 30.0, 0.40]
};

function drawMarketHangingLampWebgl(wgl, x, z, col) {
  var dm = wgl.drawMesh;
  dm('cyl', 'white', x, 4.90, z, 0, 0, 0, 0.03, 1.8, 0.03, { tint: [0.18, 0.14, 0.10, 1] });
  dm('cone', 'white', x, 3.92, z, 0, 0, 0, 0.42, 0.24, 0.42, { tint: col || [0.92, 0.62, 0.18, 1] });
  dm('sphere', 'white', x, 3.78, z, 0, 0, 0, 0.16, 0.16, 0.16, { tint: [1.0, 0.90, 0.54, 1], emissive: 1.45 });
}

function drawMarketCeilingFanWebgl(wgl, x, z, t, phase) {
  var dm = wgl.drawMesh;
  var rot = t * 5.2 + (phase || 0);
  dm('cyl', 'white', x, 5.10, z, 0, 0, 0, 0.05, 1.35, 0.05, { tint: [0.22, 0.42, 0.28, 1] });
  dm('cyl', 'white', x, 4.42, z, 0, rot, 0, 0.24, 0.10, 0.24, { tint: [0.24, 0.52, 0.34, 1] });
  dm('box', 'white', x, 4.42, z, 0, rot, 0, 1.45, 0.03, 0.16, { tint: [0.24, 0.52, 0.34, 1] });
  dm('box', 'white', x, 4.42, z, 0, rot + Math.PI * 0.5, 0, 1.45, 0.03, 0.16, { tint: [0.24, 0.52, 0.34, 1] });
}

function drawMarketPropPhoPotWebgl(wgl, x, y, z) {
  var dm = wgl.drawMesh;
  dm('cyl', 'white', x, y + 0.18, z, 0, 0, 0, 0.38, 0.36, 0.38, { tint: [0.80, 0.84, 0.88, 1], specPow: 96 });
  dm('cyl', 'white', x, y + 0.35, z, 0, 0, 0, 0.35, 0.03, 0.35, { tint: [0.76, 0.42, 0.12, 1] });
}

function drawMarketPropCoconutClusterWebgl(wgl, x, y, z) {
  var dm = wgl.drawMesh;
  var pts = [[-0.14, 0.10, -0.06], [0.12, 0.10, -0.06], [0, 0.10, 0.12], [0, 0.26, 0]];
  for (var i = 0; i < pts.length; i++) {
    dm('sphere', 'white', x + pts[i][0], y + pts[i][1], z + pts[i][2], 0, 0, 0, 0.22, 0.22, 0.22, { tint: [0.10, 0.54, 0.24, 1] });
  }
}

function drawMarketPropBanhBeoTrayWebgl(wgl, x, y, z) {
  var dm = wgl.drawMesh;
  dm('cyl', 'white', x, y + 0.02, z, 0, 0, 0, 0.54, 0.04, 0.54, { tint: [0.82, 0.86, 0.90, 1], specPow: 72 });
  var pts = [[-0.14, -0.10], [0.14, -0.10], [0, 0], [-0.14, 0.12], [0.14, 0.12]];
  for (var i = 0; i < pts.length; i++) {
    dm('cup', 'white', x + pts[i][0], y + 0.06, z + pts[i][1], 0, 0, 0, 0.11, 0.06, 0.11, { tint: [0.98, 0.98, 0.98, 1] });
    dm('sphere', 'white', x + pts[i][0], y + 0.09, z + pts[i][1], 0, 0, 0, 0.05, 0.03, 0.05, { tint: [0.92, 0.34, 0.08, 1] });
  }
}

function renderMarketWebglScene(wgl, cam, st, W, H) {
  computeWebglTpsCamera(cam, st.pig, MARKET_NAV_GRAPH, st._lastDt || 0.016);
  var p = st.pig;
  var atmo = {
    clearColor: MARKET_ATMO.clearColor,
    hemiLow: MARKET_ATMO.hemiLow,
    hemiHigh: MARKET_ATMO.hemiHigh,
    sunDir: MARKET_ATMO.sunDir,
    sunCol: MARKET_ATMO.sunCol,
    wrapBias: MARKET_ATMO.wrapBias,
    outdoorRect: MARKET_ATMO.outdoorRect,
    fogCol: MARKET_ATMO.fogCol,
    fogParams: MARKET_ATMO.fogParams,
    lights: [
      { pos: [0.0, 4.4, 6.2],  col: [1.05, 0.78, 0.36] },
      { pos: [0.0, 4.4, 20.4], col: [1.15, 0.80, 0.38] },
      { pos: [11.6, 4.4, 20.4], col: [1.05, 0.84, 0.42] },
      { pos: [p.x, 3.6, p.z],  col: [0.55, 0.45, 0.25] }
    ]
  };
  wgl.beginFrame(W, H, cam, atmo);
  var dm = wgl.drawMesh;

  // Zone visibility culling giữ ~250-450 drawElements calls/frame mà không cắt tầm nhìn qua cổng!
  var showSouth = (p.z < 21.0 || cam.pos.z < 21.0);
  var showFood  = true;
  var showFruit = (p.z > 13.0 || cam.pos.z > 13.0 || p.x > 3.5);

  /* ---------------- A. SẢNH CỬA NAM & VẢI ÁO DÀI (X ∈ [-6, 6], Z ∈ [0, 13.6]) ---------------- */
  if (showSouth) {
    // Sàn gạch & Dải dẫn hướng đỏ đô + Mái kèo thép 5.8m + Giếng trời kính mờ
    dm('box', 'marketTileSouth', 0, -0.05, 6.8, 0, 0, 0, 12.0, 0.10, 13.6, { tint: [1,1,1,1], us: 4.5, vs: 5.0 });
    dm('box', 'white', 0, 0.008, 6.9, 0, 0, 0, 2.5, 0.012, 13.0, { tint: [0.55, 0.08, 0.22, 1] });
    dm('box', 'marketRoofPanel', 0, 5.88, 6.8, 0, 0, 0, 12.0, 0.16, 13.6, { tint: [1,1,1,1], us: 4, vs: 4 });
    dm('quad', 'marketSkylight', 0, 5.78, 6.8, Math.PI * 0.5, 0, 0, 3.2, 11.6, 1, { tint: [1,1,1,1], emissive: 1.05, us: 1, vs: 3 });
    for (var sz = 2.2; sz <= 12.2; sz += 2.5) {
      dm('box', 'white', 0, 5.56, sz, 0, 0, 0, 11.8, 0.22, 0.22, { tint: [0.30, 0.34, 0.40, 1] });
      dm('box', 'white', -4.2, 4.95, sz, 0, 0, 0.45, 0.14, 1.5, 0.14, { tint: [0.36, 0.40, 0.46, 1] });
      dm('box', 'white',  4.2, 4.95, sz, 0, 0, -0.45, 0.14, 1.5, 0.14, { tint: [0.36, 0.40, 0.46, 1] });
    }
    // Tường Trái, Tường Phải, Cột Chợ & Mặt tiền Cửa Số 1 (Z = 0)
    dm('box', 'marketWallGold', -6.08, 2.9, 6.8, 0, 0, 0, 0.16, 5.8, 13.6, { tint: [1,1,1,1], us: 4, vs: 2 });
    dm('box', 'marketWallGold',  6.08, 2.9, 6.8, 0, 0, 0, 0.16, 5.8, 13.6, { tint: [1,1,1,1], us: 4, vs: 2 });
    for (var pz = 2.5; pz <= 11.5; pz += 4.5) {
      dm('box', 'marketWallGold', -5.84, 2.9, pz, 0, 0, 0, 0.26, 5.8, 0.26, { tint: [0.92, 0.78, 0.48, 1] });
      dm('box', 'marketWallGold',  5.84, 2.9, pz, 0, 0, 0, 0.26, 5.8, 0.26, { tint: [0.92, 0.78, 0.48, 1] });
    }
    dm('box', 'marketWallGold', -3.78, 2.9, -0.06, 0, 0, 0, 4.45, 5.8, 0.14, { tint: [1,1,1,1], us: 1.6, vs: 2 });
    dm('box', 'marketWallGold',  3.78, 2.9, -0.06, 0, 0, 0, 4.45, 5.8, 0.14, { tint: [1,1,1,1], us: 1.6, vs: 2 });
    dm('box', 'marketWallGold',  0.0,  4.45, -0.06, 0, 0, 0, 3.12, 2.7, 0.14, { tint: [1,1,1,1], us: 1.2, vs: 1 });
    // Ánh sáng ngoài quảng trường Quách Thị Trang & 2 cánh cổng sắt xếp Cửa Số 1
    dm('quad', 'white', 0, 1.55, -0.18, 0, 0, 0, 3.2, 3.1, 1, { tint: [1.0, 0.96, 0.80, 1], emissive: 1.1 });
    dm('quad', 'marketIronGate', -1.16, 1.48, 0.04, 0, 0, 0, 0.78, 2.96, 1, { tint: [1,1,1,1] });
    var sgAng = st.southGateOpen * 1.15;
    dm('quad', 'marketIronGate', 1.55 - Math.cos(sgAng) * 0.39, 1.48, 0.04 + Math.sin(sgAng) * 0.39, 0, -sgAng, 0, 0.78, 2.96, 1, { tint: [1,1,1,1] });

    // Biển CỬA SỐ 1 · CỬA NAM & Tranh Tường Hương Trinh + Liên Sài Gòn 823
    dm('quad', 'signCuaSo1', 0, 3.35, 0.04, 0, 0, 0, 3.8, 0.92, 1, { tint: [1,1,1,1] });
    dm('quad', 'signHuongTrinh', -5.94, 3.28, 6.5, 0, Math.PI * 0.5, 0, 8.6, 0.78, 1, { tint: [1,1,1,1] });
    dm('quad', 'artAoDaiFabric', -5.94, 1.92, 3.6, 0, Math.PI * 0.5, 0, 3.4, 1.75, 1, { tint: [1,1,1,1] });
    dm('quad', 'artAoDaiFabric', -5.94, 1.92, 8.6, 0, Math.PI * 0.5, 0, 3.4, 1.75, 1, { tint: [1,1,1,1] });
    dm('quad', 'signLienSaiGon',  5.94, 3.28, 4.9, 0, -Math.PI * 0.5, 0, 6.2, 0.78, 1, { tint: [1,1,1,1] });
    dm('quad', 'artLienTeaShelves', 5.94, 1.92, 4.9, 0, -Math.PI * 0.5, 0, 5.8, 1.75, 1, { tint: [1,1,1,1] });

    // Sạp vải Hương Trinh (X ∈ [-5.95, -4.15], Z ∈ [1.5, 11.5]) + Cuộn lụa 3D & Nón lá treo
    dm('box', 'marketWood', -5.05, 0.44, 6.5, 0, 0, 0, 1.72, 0.88, 9.8, { tint: [1,1,1,1], us: 3, vs: 1 });
    var silkCols = [[0.88, 0.11, 0.28, 1], [0.98, 0.80, 0.08, 1], [0.06, 0.72, 0.50, 1], [0.15, 0.39, 0.92, 1], [0.58, 0.20, 0.92, 1], [0.96, 0.45, 0.09, 1]];
    for (var sc = 0; sc < 6; sc++) {
      var szPos = 2.2 + sc * 1.65;
      dm('box', 'white', -4.70, 0.98, szPos, 0, 0, 0, 0.68, 0.20, 0.95, { tint: silkCols[sc] });
      dm('cyl', 'white', -5.35, 1.04, szPos, Math.PI * 0.5, 0, 0, 0.22, 0.85, 0.22, { tint: silkCols[(sc + 2) % 6] });
      dm('cone', 'white', -4.45, 2.55, szPos, 0.25, Math.PI * 0.5, 0, 0.46, 0.18, 0.46, { tint: [0.92, 0.82, 0.54, 1] });
    }
    // Sạp Đặc Sản Liên Sài Gòn 823 (X ∈ [4.15, 5.95], Z ∈ [1.5, 8.2]) + Hũ mứt nắp đỏ & hộp trà
    dm('box', 'marketWood', 5.05, 0.44, 4.85, 0, 0, 0, 1.72, 0.88, 6.5, { tint: [1,1,1,1], us: 2, vs: 1 });
    var jarCols = [[0.96, 0.62, 0.04, 1], [0.09, 0.64, 0.29, 1], [0.85, 0.45, 0.12, 1], [0.18, 0.48, 0.28, 1], [0.78, 0.22, 0.18, 1]];
    for (var jc = 0; jc < 5; jc++) {
      var jzPos = 2.2 + jc * 1.32;
      dm('cyl', 'white', 4.60, 1.04, jzPos, 0, 0, 0, 0.34, 0.30, 0.34, { tint: jarCols[jc] });
      dm('cyl', 'white', 4.60, 1.21, jzPos, 0, 0, 0, 0.36, 0.06, 0.36, { tint: [0.86, 0.12, 0.12, 1] });
      dm('box', 'white', 5.25, 1.04, jzPos, 0, 0, 0, 0.42, 0.32, 0.55, { tint: [0.12, 0.46, 0.24, 1] });
    }
    // Đèn & Quạt trần Sảnh Cửa Nam
    drawMarketHangingLampWebgl(wgl, -2.5, 4.2, [0.96, 0.62, 0.08, 1]);
    drawMarketHangingLampWebgl(wgl,  2.5, 4.2, [0.96, 0.62, 0.08, 1]);
    drawMarketHangingLampWebgl(wgl, -2.5, 9.8, [0.92, 0.45, 0.08, 1]);
    drawMarketHangingLampWebgl(wgl,  2.5, 9.8, [0.92, 0.45, 0.08, 1]);
    drawMarketCeilingFanWebgl(wgl, 0, 5.2, st.t, 0.2);
    drawMarketCeilingFanWebgl(wgl, 0, 10.6, st.t, 1.4);
  }

  /* ---------------- VÁCH CỔNG VÒM Z = 13.6 (SOUTH_HALL <-> FOOD_COURT, MỞ [-1.8, 1.8]) ---------------- */
  dm('box', 'marketWallGold', -3.9, 2.9, 13.6, 0, 0, 0, 4.2, 5.8, 0.22, { tint: [1,1,1,1], us: 1.5, vs: 2 });
  dm('box', 'marketWallGold',  3.9, 2.9, 13.6, 0, 0, 0, 4.2, 5.8, 0.22, { tint: [1,1,1,1], us: 1.5, vs: 2 });
  dm('box', 'marketWallGold',  0.0, 4.6, 13.6, 0, 0, 0, 3.6, 2.4, 0.22, { tint: [1,1,1,1], us: 1.4, vs: 1 });
  dm('quad', 'signKhuAnUong', 0, 3.22, 13.47, 0, Math.PI, 0, 4.2, 0.88, 1, { tint: [1,1,1,1] });
  dm('quad', 'signKhuAnUong', 0, 3.22, 13.73, 0, 0, 0, 4.2, 0.88, 1, { tint: [1,1,1,1] });

  /* ---------------- B. KHU ẨM THỰC TRUNG TÂM SẠP 1044 (X ∈ [-6, 6], Z ∈ [13.6, 26.8]) ---------------- */
  if (showFood) {
    dm('box', 'marketTileFood', 0, -0.05, 20.2, 0, 0, 0, 12.0, 0.10, 13.2, { tint: [1,1,1,1], us: 4.5, vs: 5.0 });
    dm('box', 'white', 0, 0.008, 21.3, 0, 0, 0, 5.0, 0.012, 5.8, { tint: [0.50, 0.11, 0.11, 1] });
    dm('box', 'marketRoofPanel', 0, 5.88, 20.2, 0, 0, 0, 12.0, 0.16, 13.2, { tint: [1,1,1,1], us: 4, vs: 4 });
    dm('quad', 'marketSkylight', 0, 5.78, 20.2, Math.PI * 0.5, 0, 0, 3.2, 11.2, 1, { tint: [1,1,1,1], emissive: 1.05, us: 1, vs: 3 });
    for (var fz = 15.6; fz <= 25.4; fz += 2.6) {
      dm('box', 'white', 0, 5.56, fz, 0, 0, 0, 11.8, 0.22, 0.22, { tint: [0.30, 0.34, 0.40, 1] });
      dm('box', 'white', -4.2, 4.95, fz, 0, 0, 0.45, 0.14, 1.5, 0.14, { tint: [0.36, 0.40, 0.46, 1] });
      dm('box', 'white',  4.2, 4.95, fz, 0, 0, -0.45, 0.14, 1.5, 0.14, { tint: [0.36, 0.40, 0.46, 1] });
    }
    // Tường Tây (X = -6.0), Tường Bắc (Z = 26.8), Tường Đông có Ngã tư Chợ Đông [22.6, 25.8]
    dm('box', 'marketWallGold', -6.08, 2.9, 20.2, 0, 0, 0, 0.16, 5.8, 13.2, { tint: [1,1,1,1], us: 4, vs: 2 });
    dm('box', 'marketWallGold',  0.0,  2.9, 26.88, 0, 0, 0, 12.2, 5.8, 0.16, { tint: [1,1,1,1], us: 4, vs: 2 });
    // Vách ngăn Đông (X = 6.0): đoạn đặc Z ∈ [13.6, 22.6] & [25.8, 26.8], phần trên cổng Z ∈ [22.6, 25.8]
    dm('box', 'marketWallGold', 6.0, 2.9, 18.1, 0, 0, 0, 0.22, 5.8, 9.0, { tint: [1,1,1,1], us: 3, vs: 2 });
    dm('box', 'marketWallGold', 6.0, 2.9, 26.3, 0, 0, 0, 0.22, 5.8, 1.0, { tint: [1,1,1,1], us: 0.5, vs: 2 });
    dm('box', 'marketWallGold', 6.0, 4.6, 24.2, 0, 0, 0, 0.22, 2.4, 3.2, { tint: [1,1,1,1], us: 1, vs: 1 });

    // Biển & Mỹ thuật tường Khu Ẩm Thực
    dm('quad', 'signBanhCuon50k', -5.94, 3.28, 20.1, 0, Math.PI * 0.5, 0, 8.2, 0.78, 1, { tint: [1,1,1,1] });
    dm('quad', 'artBanhCuonWall', -5.94, 1.92, 20.1, 0, Math.PI * 0.5, 0, 7.6, 1.75, 1, { tint: [1,1,1,1] });
    dm('quad', 'signBanhBeo20k',   5.86, 3.28, 18.6, 0, -Math.PI * 0.5, 0, 5.8, 0.78, 1, { tint: [1,1,1,1] });
    dm('quad', 'artBanhBeoWall',   5.86, 1.92, 18.6, 0, -Math.PI * 0.5, 0, 5.4, 1.75, 1, { tint: [1,1,1,1] });
    dm('quad', 'signSap1044',      0.0,  2.70, 26.74, 0, Math.PI, 0, 7.2, 1.75, 1, { tint: [1,1,1,1] });
    dm('quad', 'signNgocHao1029',  5.86, 3.30, 24.2, 0, -Math.PI * 0.5, 0, 3.4, 0.72, 1, { tint: [1,1,1,1] });

    // Đảo Quầy SẠP 1044 (X ∈ [-1.75, 1.75], Z ∈ [19.7, 22.9]) + Nồi nước lèo + Dừa xiêm + Tô Phở
    dm('box', 'marketCeramicTile', 0, 0.46, 21.3, 0, 0, 0, 3.4, 0.92, 3.0, { tint: [1,1,1,1], us: 2, vs: 1 });
    dm('box', 'white', 0, 0.96, 21.3, 0, 0, 0, 3.5, 0.08, 3.1, { tint: [0.88, 0.91, 0.94, 1], specPow: 64 });
    drawMarketPropPhoPotWebgl(wgl, -0.85, 1.0, 20.9);
    drawMarketPropPhoPotWebgl(wgl, -0.15, 1.0, 21.3);
    drawMarketPropCoconutClusterWebgl(wgl, 1.05, 1.0, 20.6);
    drawMarketPropBanhBeoTrayWebgl(wgl, 0.10, 1.0, 20.1);
    for (var bi = 0; bi < 4; bi++) {
      var bx = -1.15 + bi * 0.76;
      dm('cup', 'white', bx, 1.06, 19.95, 0, 0, 0, 0.24, 0.12, 0.24, { tint: [0.98, 0.98, 0.96, 1] });
      dm('cyl', 'white', bx, 1.11, 19.95, 0, 0, 0, 0.20, 0.02, 0.20, { tint: [0.88, 0.56, 0.18, 1] });
    }

    // 4 Ghế đẩu inox tương tác tại Sạp 1044 (Z = 19.15)
    for (var si = 0; si < st.stools.length; si++) {
      var sl = st.stools[si];
      dm('cyl', 'white', sl.x, 0.24, sl.z, 0, 0, 0, 0.24, 0.48, 0.24, { tint: [0.64, 0.70, 0.78, 1], specPow: 80 });
      dm('cyl', 'white', sl.x, 0.49, sl.z, 0, 0, 0, 0.40, 0.05, 0.40, { tint: [0.90, 0.93, 0.96, 1], specPow: 96 });
    }

    // Quầy Bánh Cuốn Nóng 50K (X ∈ [-5.95, -4.15], Z ∈ [15.4, 24.8])
    dm('box', 'marketCeramicTile', -5.05, 0.44, 20.1, 0, 0, 0, 1.72, 0.88, 9.2, { tint: [1,1,1,1], us: 3, vs: 1 });
    drawMarketPropPhoPotWebgl(wgl, -4.65, 0.88, 17.6);
    drawMarketPropPhoPotWebgl(wgl, -4.65, 0.88, 20.1);
    drawMarketPropPhoPotWebgl(wgl, -4.65, 0.88, 22.6);
    for (var bci = 0; bci < 4; bci++) {
      dm('cyl', 'white', -4.55, 0.92, 16.4 + bci * 2.2, 0, 0, 0, 0.36, 0.04, 0.36, { tint: [0.96, 0.97, 0.99, 1] });
    }

    // Quầy Bánh Bèo Huế 20K (X ∈ [4.15, 5.95], Z ∈ [15.4, 21.8])
    dm('box', 'marketWood', 5.05, 0.44, 18.6, 0, 0, 0, 1.72, 0.88, 6.2, { tint: [0.95, 0.82, 0.58, 1], us: 2, vs: 1 });
    drawMarketPropBanhBeoTrayWebgl(wgl, 4.65, 0.88, 16.6);
    drawMarketPropBanhBeoTrayWebgl(wgl, 4.65, 0.88, 18.6);
    drawMarketPropBanhBeoTrayWebgl(wgl, 4.65, 0.88, 20.6);

    drawMarketHangingLampWebgl(wgl, -2.5, 17.5, [0.96, 0.55, 0.08, 1]);
    drawMarketHangingLampWebgl(wgl,  2.5, 17.5, [0.96, 0.55, 0.08, 1]);
    drawMarketHangingLampWebgl(wgl, -2.5, 23.6, [0.92, 0.45, 0.08, 1]);
    drawMarketHangingLampWebgl(wgl,  2.5, 23.6, [0.92, 0.45, 0.08, 1]);
    drawMarketCeilingFanWebgl(wgl, 0, 16.8, st.t, 0.7);
    drawMarketCeilingFanWebgl(wgl, 0, 23.8, st.t, 2.1);
  }

  /* ---------------- C. CÁNH ĐÔNG TRÁI CÂY 1029 & CỬA BẮC (X ∈ [6.0, 17.2], Z ∈ [13.6, 26.8]) ---------------- */
  if (showFruit) {
    dm('box', 'marketTileFruit', 11.6, -0.05, 20.2, 0, 0, 0, 11.2, 0.10, 13.2, { tint: [1,1,1,1], us: 4.5, vs: 5.0 });
    dm('box', 'white', 11.6, 0.008, 20.4, 0, 0, 0, 4.8, 0.012, 4.8, { tint: [0.08, 0.34, 0.18, 1] });
    dm('box', 'marketRoofPanel', 11.6, 5.88, 20.2, 0, 0, 0, 11.2, 0.16, 13.2, { tint: [1,1,1,1], us: 4, vs: 4 });
    dm('quad', 'marketSkylight', 11.6, 5.78, 20.2, Math.PI * 0.5, 0, 0, 3.0, 10.6, 1, { tint: [1,1,1,1], emissive: 1.05, us: 1, vs: 3 });
    for (var fcz = 15.6; fcz <= 25.4; fcz += 2.6) {
      dm('box', 'white', 11.6, 5.56, fcz, 0, 0, 0, 11.0, 0.22, 0.22, { tint: [0.30, 0.34, 0.40, 1] });
      dm('box', 'white',  7.8, 4.95, fcz, 0, 0, 0.45, 0.14, 1.5, 0.14, { tint: [0.36, 0.40, 0.46, 1] });
      dm('box', 'white', 15.4, 4.95, fcz, 0, 0, -0.45, 0.14, 1.5, 0.14, { tint: [0.36, 0.40, 0.46, 1] });
    }
    // Tường Nam Cánh Đông (Z = 13.6), Tường Đông (X = 17.2), Mặt tiền Cửa Bắc (Z = 26.8, mở [10.05, 13.15])
    dm('box', 'marketWallGold', 11.6, 2.9, 13.6, 0, 0, 0, 11.2, 5.8, 0.20, { tint: [1,1,1,1], us: 4, vs: 2 });
    dm('box', 'marketWallGold', 17.28, 2.9, 20.2, 0, 0, 0, 0.16, 5.8, 13.2, { tint: [1,1,1,1], us: 4, vs: 2 });
    dm('box', 'marketWallGold', 8.02, 2.9, 26.88, 0, 0, 0, 4.05, 5.8, 0.16, { tint: [1,1,1,1], us: 1.5, vs: 2 });
    dm('box', 'marketWallGold', 15.18, 2.9, 26.88, 0, 0, 0, 4.05, 5.8, 0.16, { tint: [1,1,1,1], us: 1.5, vs: 2 });
    dm('box', 'marketWallGold', 11.6, 4.45, 26.88, 0, 0, 0, 3.12, 2.7, 0.16, { tint: [1,1,1,1], us: 1.2, vs: 1 });
    // Ánh nắng & Cửa sắt xếp Cửa Bắc (X ∈ [10.05, 13.15], Z = 26.8)
    dm('quad', 'white', 11.6, 1.55, 26.96, 0, Math.PI, 0, 3.2, 3.1, 1, { tint: [1.0, 0.96, 0.80, 1], emissive: 1.1 });
    dm('quad', 'marketIronGate', 10.44, 1.48, 26.76, 0, Math.PI, 0, 0.78, 2.96, 1, { tint: [1,1,1,1] });
    var ngAng = st.northGateOpen * 1.15;
    dm('quad', 'marketIronGate', 13.15 - Math.cos(ngAng) * 0.39, 1.48, 26.76 - Math.sin(ngAng) * 0.39, 0, Math.PI + ngAng, 0, 0.78, 2.96, 1, { tint: [1,1,1,1] });

    // Biển & Mỹ thuật tường Cánh Đông
    dm('quad', 'signCuaBac', 11.6, 3.35, 26.76, 0, Math.PI, 0, 4.4, 0.94, 1, { tint: [1,1,1,1] });
    dm('quad', 'signGomSu',  6.14, 3.28, 18.2, 0, Math.PI * 0.5, 0, 6.2, 0.78, 1, { tint: [1,1,1,1] });
    dm('quad', 'artGomSonMai', 6.14, 1.92, 18.2, 0, Math.PI * 0.5, 0, 5.8, 1.75, 1, { tint: [1,1,1,1] });
    dm('quad', 'signNonLa',  17.14, 3.28, 18.6, 0, -Math.PI * 0.5, 0, 6.0, 0.78, 1, { tint: [1,1,1,1] });
    dm('quad', 'artNonLaRack', 17.14, 1.92, 18.6, 0, -Math.PI * 0.5, 0, 5.6, 1.75, 1, { tint: [1,1,1,1] });
    dm('quad', 'signKhuAnUong', 6.14, 3.30, 24.2, 0, Math.PI * 0.5, 0, 3.4, 0.72, 1, { tint: [1,1,1,1] });

    // Đảo Trái Cây 1029 NGỌC HẢO (X ∈ [9.95, 13.25], Z ∈ [18.8, 22.0]) + Mâm ngũ quả + Cân Nhơn Hòa
    dm('box', 'marketWood', 11.6, 0.42, 20.4, 0, 0, 0, 3.2, 0.84, 3.0, { tint: [0.22, 0.58, 0.28, 1], us: 2, vs: 1 });
    dm('box', 'artFruitDisplay', 11.6, 0.94, 20.4, 0, 0, 0, 2.7, 0.20, 2.4, { tint: [1,1,1,1] });
    // Tháp xoài cát, thanh long, bưởi da xanh & sầu riêng nổi khối 3D
    var fColors = [[0.98, 0.80, 0.08, 1], [0.88, 0.11, 0.28, 1], [0.13, 0.77, 0.37, 1], [0.63, 0.38, 0.05, 1]];
    for (var fi = 0; fi < 8; fi++) {
      var fx = 10.55 + (fi % 4) * 0.68, fzp = 19.65 + Math.floor(fi / 4) * 1.45;
      dm('sphere', 'white', fx, 1.14, fzp, 0, 0, 0, 0.28, 0.24, 0.28, { tint: fColors[fi % 4] });
    }
    // Cân Nhơn Hòa xanh lá + đĩa inox
    dm('box', 'white', 11.6, 1.18, 20.4, 0, 0, 0, 0.28, 0.28, 0.26, { tint: [0.08, 0.50, 0.22, 1] });
    dm('cyl', 'white', 11.6, 1.35, 20.4, 0, 0, 0, 0.36, 0.04, 0.36, { tint: [0.86, 0.90, 0.94, 1], specPow: 80 });
    drawMarketPropCoconutClusterWebgl(wgl, 10.65, 0.86, 19.25);
    drawMarketPropCoconutClusterWebgl(wgl, 12.55, 0.86, 19.25);

    // Kệ Gốm Sứ Bát Tràng (X ∈ [6.05, 7.80], Z ∈ [14.8, 21.6]) & Kệ Nón Lá (X ∈ [15.4, 17.15], Z ∈ [15.4, 21.8])
    dm('box', 'marketWood', 6.92, 0.43, 18.2, 0, 0, 0, 1.68, 0.86, 6.6, { tint: [1,1,1,1], us: 2, vs: 1 });
    for (var gi = 0; gi < 5; gi++) {
      var gz = 15.5 + gi * 1.35;
      dm('cyl', 'white', 6.95, 1.06, gz, 0, 0, 0, 0.28, 0.38, 0.28, { tint: [0.96, 0.97, 1.0, 1] });
      dm('cyl', 'white', 6.95, 1.10, gz, 0, 0, 0, 0.30, 0.12, 0.30, { tint: [0.11, 0.31, 0.85, 1] });
    }
    dm('box', 'marketWood', 16.28, 0.43, 18.6, 0, 0, 0, 1.68, 0.86, 6.2, { tint: [1,1,1,1], us: 2, vs: 1 });
    for (var ni = 0; ni < 5; ni++) {
      var nz = 16.0 + ni * 1.30;
      dm('cone', 'white', 16.15, 1.02, nz, 0, 0, 0, 0.52, 0.20, 0.52, { tint: [0.92, 0.82, 0.54, 1] });
      dm('cone', 'white', 16.35, 2.35, nz, 0.15, -Math.PI * 0.5, 0, 0.52, 0.20, 0.52, { tint: [0.94, 0.85, 0.58, 1] });
    }

    drawMarketHangingLampWebgl(wgl, 9.2, 17.5, [0.96, 0.62, 0.08, 1]);
    drawMarketHangingLampWebgl(wgl, 14.0, 17.5, [0.96, 0.62, 0.08, 1]);
    drawMarketHangingLampWebgl(wgl, 11.6, 23.6, [0.24, 0.72, 0.34, 1]);
    drawMarketCeilingFanWebgl(wgl, 11.6, 17.2, st.t, 0.9);
    drawMarketCeilingFanWebgl(wgl, 11.6, 23.8, st.t, 2.3);
  }

  /* ---------------- D. 12 NPC PIXEL BILLBOARD & CHÚ HEO 24×20 (GL.NEAREST) ---------------- */
  if (st.npcs && typeof drawHumanBillboardWebgl === 'function') {
    for (var npi = 0; npi < st.npcs.length; npi++) {
      var npc = st.npcs[npi];
      var inSouthNpc = npc.z < 13.6;
      var inFruitNpc = npc.z >= 13.6 && npc.x >= 6.0;
      if ((inSouthNpc && !showSouth) || (inFruitNpc && !showFruit)) continue;
      drawHumanBillboardWebgl(wgl, cam, npc, st.t);
    }
  }
  if (typeof drawPigBillboardWebgl === 'function') {
    drawPigBillboardWebgl(wgl, cam, st.pig, st.t, false);
  }

  /* ---------------- E. VÒNG SÓNG CHẠM SÀN TAP-TO-WALK ---------------- */
  wgl.setBlend('add');
  for (var ri = 0; ri < st.ripples.length; ri++) {
    var rp = st.ripples[ri];
    var rAlpha = Math.max(0, 1 - rp.t / 0.75) * 0.68;
    dm('torus', 'white', rp.x, 0.03, rp.z, Math.PI * 0.5, 0, 0, 0.35 + rp.t * 0.85, 0.35 + rp.t * 0.85, 0.2, {
      tint: [0.96, 0.76, 0.24, rAlpha], emissive: 1.2
    });
  }
  wgl.setBlend(null);
}

/* ==================== 4. FALLBACK CANVAS2D CHO HEADLESS SMOKE TEST 183 ==================== */
function drawSteamerPot3D(ctx, cam, wx, wy, wz, t) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 22 || pr.cz < 0.35) return;
  var u = Math.max(0.45, Math.min(2.8, pr.scale / 38));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  ctx.fillStyle = '#94A3B8'; ctx.fillRect(px - 10 * u, py - 11 * u, 20 * u, 11 * u);
  ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 1; ctx.strokeRect(px - 10 * u, py - 11 * u, 20 * u, 11 * u);
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.ellipse(px, py - 11 * u, 10.5 * u, 3.8 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawBanhBeoTray3D(ctx, cam, wx, wy, wz) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 22 || pr.cz < 0.35) return;
  var u = Math.max(0.45, Math.min(2.8, pr.scale / 38));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  ctx.fillStyle = '#CBD5E1'; ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(px, py, 14 * u, 5.5 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawFreshCoconutsCluster3D(ctx, cam, wx, wy, wz) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 22 || pr.cz < 0.35) return;
  var u = Math.max(0.45, Math.min(2.8, pr.scale / 38));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  var pts = [[-6, 0], [0, 0.5], [6, 0], [-3, -4.5], [3, -4.5]];
  for (var i = 0; i < pts.length; i++) {
    ctx.fillStyle = '#15803D'; ctx.strokeStyle = '#052E16'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(px + pts[i][0] * u, py + pts[i][1] * u, 3.6 * u, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawVintageScaleAndFruits3D(ctx, cam, wx, wy, wz) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 22 || pr.cz < 0.35) return;
  var u = Math.max(0.45, Math.min(2.8, pr.scale / 38));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  ctx.fillStyle = '#15803D'; ctx.fillRect(px - 5 * u, py - 9 * u, 10 * u, 9 * u);
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.ellipse(px - 14 * u, py - 3 * u, 3.5 * u, 2.2 * u, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E11D48'; ctx.beginPath(); ctx.arc(px + 14 * u, py - 3 * u, 2.8 * u, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function renderMarketTpsScene(ctx, cam, st, W, H) {
  var room = st.room || st.zone || 'south_hall';
  var isSouth = room === 'south_hall';
  var isFood  = room === 'food_court';

  ctx.fillStyle = isFood ? '#3B1D0E' : (isSouth ? '#3E2417' : '#2D2316');
  ctx.fillRect(0, 0, W, H);

  var floorBase = isFood ? '#D8C7A8' : (isSouth ? '#E5D3B3' : '#E2D5B5');
  var tileAlt   = isFood ? '#B45309' : (isSouth ? '#C87D55' : '#C6A468');
  drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], floorBase, '#8C6D46', 1);
  for (var tz = 0; tz < 14.4; tz += 1.6) {
    for (var tx = -6; tx < 6; tx += 1.6) {
      if ((Math.round(tx / 1.6) + Math.round(tz / 1.6)) % 2 === 0) {
        drawPoly3D(ctx, cam, [[tx, 0.004, tz], [tx + 1.6, 0.004, tz], [tx + 1.6, 0.004, tz + 1.6], [tx, 0.004, tz + 1.6]], tileAlt, '#78350F', 0.6);
      }
    }
  }
  // Trần kèo thép & giếng trời
  drawPoly3D(ctx, cam, [[-6, 3.85, 0], [6, 3.85, 0], [6, 3.85, 14.8], [-6, 3.85, 14.8]], '#6B4423', '#2B180E', 1);
  drawPoly3D(ctx, cam, [[-1.6, 3.83, 1.2], [1.6, 3.83, 1.2], [1.6, 3.83, 13.6], [-1.6, 3.83, 13.6]], '#FEF3C7', '#D97706', 1.2);
  // 4 Bức tường
  drawPoly3D(ctx, cam, [[-6, 0, 0], [-6, 0, 14.8], [-6, 3.85, 14.8], [-6, 3.85, 0]], '#E5B85B', '#5C341D', 1);
  drawPoly3D(ctx, cam, [[6, 0, 14.8], [6, 0, 0], [6, 3.85, 0], [6, 3.85, 14.8]], '#DBA94E', '#5C341D', 1);
  drawPoly3D(ctx, cam, [[-6, 0, 14.8], [6, 0, 14.8], [6, 3.85, 14.8], [-6, 3.85, 14.8]], '#D29E44', '#5C341D', 1);
  drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 3.85, 0], [-6, 3.85, 0]], '#DBA94E', '#5C341D', 1);

  if (typeof drawMarketRoomWalls3D === 'function') {
    drawMarketRoomWalls3D(ctx, cam, room);
  }
  if (typeof drawLanternGlow3D === 'function') {
    drawLanternGlow3D(ctx, cam, -2.4, 3.02, 4.2, '#F59E0B', '#FDE68A', 0.21, 3.85);
    drawLanternGlow3D(ctx, cam,  2.4, 3.02, 4.2, '#F59E0B', '#FDE68A', 0.21, 3.85);
  }
  if (typeof drawCeilingFan3D === 'function') {
    drawCeilingFan3D(ctx, cam, 0, 3.42, 5.2, st.t, 0.2);
  }

  var items = [];
  function pushItem(wx, wz, fn) {
    items.push({ d: Math.hypot(wx - cam.pos.x, wz - cam.pos.z), fn: fn });
  }
  if (isSouth) {
    pushItem(-4.95, 6.5, function() {
      drawBox3D(ctx, cam, -4.95, 0, 6.5, 1.35, 0.86, 9.4, { top: '#8C5229', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
      drawBox3D(ctx, cam, -4.75, 0.86, 3.2, 0.75, 0.24, 1.1, { top: '#E11D48', front: '#BE123C', side: '#9F1239', stroke: '#2B180E' });
    });
    pushItem(4.95, 4.9, function() {
      drawBox3D(ctx, cam, 4.95, 0, 4.9, 1.35, 0.88, 6.2, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
    });
  } else if (isFood) {
    pushItem(0, 7.6, function() {
      drawBox3D(ctx, cam, 0, 0, 7.6, 3.1, 0.92, 2.2, { top: '#F8FAFC', front: '#CBD5E1', side: '#94A3B8', stroke: '#1E293B' });
      drawSteamerPot3D(ctx, cam, -0.8, 0.96, 7.2, st.t);
      drawFreshCoconutsCluster3D(ctx, cam, 0.9, 0.98, 7.1);
    });
    pushItem(-4.95, 6.4, function() {
      drawBox3D(ctx, cam, -4.95, 0, 6.4, 1.35, 0.88, 8.8, { top: '#F8FAFC', front: '#E2E8F0', side: '#CBD5E1', stroke: '#1E3A8A' });
    });
    pushItem(4.95, 5.0, function() {
      drawBox3D(ctx, cam, 4.95, 0, 5.0, 1.35, 0.86, 6.0, { top: '#FEF3C7', front: '#D97706', side: '#B45309', stroke: '#2B180E' });
      drawBanhBeoTray3D(ctx, cam, 4.65, 0.90, 4.6);
    });
  } else {
    pushItem(0, 6.8, function() {
      drawBox3D(ctx, cam, 0, 0, 6.8, 2.8, 0.84, 2.2, { top: '#15803D', front: '#166534', side: '#14532D', stroke: '#2B180E' });
      drawVintageScaleAndFruits3D(ctx, cam, 0, 1.02, 6.5);
    });
    pushItem(-4.95, 6.4, function() {
      drawBox3D(ctx, cam, -4.95, 0, 6.4, 1.30, 0.86, 8.8, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
    });
    pushItem(4.95, 5.0, function() {
      drawBox3D(ctx, cam, 4.95, 0, 5.0, 1.30, 0.86, 6.0, { top: '#8C5229', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
    });
  }
  pushItem(st.pig.x, st.pig.z, function() {
    if (typeof drawPigTps3D === 'function') drawPigTps3D(ctx, cam, st.pig, st.t);
  });
  items.sort(function(a, b) { return b.d - a.d; });
  for (var ii = 0; ii < items.length; ii++) items[ii].fn();
}
`;
}
