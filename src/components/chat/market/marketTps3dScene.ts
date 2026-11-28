/**
 * Chợ Bến Thành Sài Gòn 1914 — Siêu Đại Sảnh Ô Bàn Cờ 48m × 108m (Gấp 4×, Quyết định 260)
 * - Chiều rộng 48m (X ∈ [-24, 24]), chiều sâu 108m (Z ∈ [0, 108]), trần mái kèo thép xanh rêu 7.6m + louvers.
 * - CHỈ 2 LỐI RA DUY NHẤT: Lối Trước (Cửa Nam Z = 0) & Lối Sau (Cửa Bắc Z = 108). Hai tường Đông–Tây đóng kín.
 * - Khuôn viên Lối Trước (Z < 0): vỉa hè cây xanh/xe máy, đại lộ 2 làn 6 xe chạy 60fps, bờ kè & dọc Sông Bạch Đằng
 *   tàu thủy + Skyline Bitexco/Landmark 81 mờ sương giống Tab Cà Phê & Adidas Shop (`drawSaigonStreetBackdrop3D`).
 * - Khuôn viên Lối Sau (Z > 108): đường phố Lê Thánh Tôn 4 xe chạy 2 chiều + hàng cây + nhà phố & Skyline 3 sắc.
 * - 56 NPCs chen chúc tấp nập (tiểu thương, đầu bếp, khách ngồi ăn & đoàn khách đi bộ) + culling 28m mượt 60fps.
 * - Đủ >= 38 cụm sạp hàng thật (Adidas, Nike, Giày, Túi, Áo Dài, Toàn Bộ Món Việt, Trái Cây 3D, Hoa, Hải Sản, Đồ Khô, Mỹ Nghệ).
 */
export function buildMarketTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. ĐỒ THỊ SIÊU ĐẠI SẢNH 48m × 108m (CHỈ 2 LỐI RA TRƯỚC & SAU — QĐ 260) ==================== */
var MARKET_NAV_GRAPH = {
  wallMargin: 0.42,
  outerBounds: { minX: -24.0, maxX: 24.0, minZ: 0.0, maxZ: 108.0, minY: 0.45, maxY: 7.6 },
  zones: [
    { id: 'south_hall',  minX: -24.0, maxX: 24.0, minZ:  0.0, maxZ:  40.0, floorY: 0 },
    { id: 'food_court',  minX: -24.0, maxX: 24.0, minZ: 40.0, maxZ:  82.0, floorY: 0 },
    { id: 'fruit_craft', minX: -24.0, maxX: 24.0, minZ: 15.0, maxZ: 108.0, floorY: 0 }
  ],
  dividerWalls: [],
  camBoxes: [
    // Các cụm đảo trung tâm tránh camera xoay sát gây góc khuất
    { x1: -1.75, y1: 0, z1: 19.7, x2: 1.75,  y2: 1.45, z2: 22.9 },  // Sạp 1044
    { x1:  9.95, y1: 0, z1: 18.8, x2: 13.25, y2: 1.45, z2: 22.0 },  // Đảo 1029 Ngọc Hảo
    { x1: -9.2,  y1: 0, z1: 3.5,  x2: -5.6,  y2: 2.1,  z2: 9.5 },   // Sạp Adidas
    { x1:  5.6,  y1: 0, z1: 3.5,  x2:  9.2,  y2: 2.1,  z2: 9.5 },   // Sạp Nike
    { x1: -2.5,  y1: 0, z1: 42.0, x2:  2.5,  y2: 1.8,  z2: 50.0 }   // Đảo Lưu Niệm Trung Tâm
  ],
  edges: []
};

var MARKET_ZONE_CENTERS = {
  south_hall:  { x:  0.0, y: 0, z:  8.5 },
  food_court:  { x:  0.0, y: 0, z: 68.0 },
  fruit_craft: { x: 11.6, y: 0, z: 88.0 }
};

function getMarketZoneAt(x, z) {
  if (z < 38.0) return 'south_hall';
  if (z >= 82.0 || (x >= 8.5 && z < 28.0)) return 'fruit_craft';
  return 'food_court';
}

function createMarketStools() {
  // 10 ghế đẩu inox tương tác (4 ghế Sạp 1044 + 6 ghế Đại Khu Ẩm Thực Z = 62..72)
  return [
    { id: 0, floorY: 0, x: -1.15, y: 0, z: 19.15, lookX: -1.15, lookZ: 20.1, yaw: 0 },
    { id: 1, floorY: 0, x: -0.38, y: 0, z: 19.15, lookX: -0.38, lookZ: 20.1, yaw: 0 },
    { id: 2, floorY: 0, x:  0.38, y: 0, z: 19.15, lookX:  0.38, lookZ: 20.1, yaw: 0 },
    { id: 3, floorY: 0, x:  1.15, y: 0, z: 19.15, lookX:  1.15, lookZ: 20.1, yaw: 0 },
    { id: 4, floorY: 0, x: -5.4,  y: 0, z: 62.5,  lookX: -7.5,  lookZ: 62.5, yaw: -Math.PI * 0.5 },
    { id: 5, floorY: 0, x: -5.4,  y: 0, z: 71.5,  lookX: -7.5,  lookZ: 71.5, yaw: -Math.PI * 0.5 },
    { id: 6, floorY: 0, x:  5.4,  y: 0, z: 62.5,  lookX:  7.5,  lookZ: 62.5, yaw:  Math.PI * 0.5 },
    { id: 7, floorY: 0, x:  5.4,  y: 0, z: 71.5,  lookX:  7.5,  lookZ: 71.5, yaw:  Math.PI * 0.5 },
    { id: 8, floorY: 0, x: -1.6,  y: 0, z: 66.5,  lookX: -1.6,  lookZ: 68.0, yaw: 0 },
    { id: 9, floorY: 0, x:  1.6,  y: 0, z: 66.5,  lookX:  1.6,  lookZ: 68.0, yaw: 0 }
  ];
}

function createMarketNpcs() {
  // 56 NPCs chen chúc tấp nập xuyên suốt 108m chiều sâu (16 tiểu thương/đầu bếp, 8 thực khách ngồi, 32 khách đi bộ)
  var npcs = [];
  var shirts = ['#E11D48', '#2563EB', '#16A34A', '#D97706', '#0EA5E9', '#9333EA', '#EA580C', '#0D9488'];
  var hairs  = ['#1C1917', '#292524', '#451A03', '#3F2E21'];

  // 1. 16 Tiểu thương & Đầu bếp đứng tại các cụm sạp suốt Z = 6..98
  var vendors = [
    [-14.8, 7.5,  Math.PI * 0.5, 'waiter', '#E11D48', 'none'],
    [-4.8,  6.5, -Math.PI * 0.5, 'waiter', '#0F172A', 'none'],
    [ 4.8,  6.5,  Math.PI * 0.5, 'waiter', '#EA580C', 'none'],
    [14.8,  7.5, -Math.PI * 0.5, 'waiter', '#15803D', 'none'],
    [-14.8, 25.0, Math.PI * 0.5, 'waiter', '#DB2777', 'none'],
    [14.8,  25.0,-Math.PI * 0.5, 'waiter', '#047857', 'none'],
    [-0.2,  23.4, Math.PI,       'chef',   '#FFFFFF', 'bowl'],
    [11.6,  18.0, 0,             'waiter', '#16A34A', 'tray'],
    [-14.8, 44.0, Math.PI * 0.5, 'waiter', '#1D4ED8', 'none'],
    [14.8,  44.0,-Math.PI * 0.5, 'waiter', '#78350F', 'none'],
    [-5.4,  63.0, Math.PI * 0.5, 'chef',   '#FFFFFF', 'bowl'],
    [-5.4,  71.0, Math.PI * 0.5, 'chef_noodle', '#FFFFFF', 'bowl'],
    [ 5.4,  63.0,-Math.PI * 0.5, 'waiter', '#B45309', 'tray'],
    [ 5.4,  71.0,-Math.PI * 0.5, 'waiter', '#065F46', 'tray'],
    [-8.5,  83.0, 0,             'waiter', '#15803D', 'none'],
    [ 8.5,  83.0, 0,             'waiter', '#0C4A6E', 'none']
  ];
  for (var vi = 0; vi < vendors.length; vi++) {
    var vd = vendors[vi];
    npcs.push({
      id: 'mk_v_' + vi, x: vd[0], y: 0, z: vd[1], yaw: vd[2],
      role: vd[3], shirt: vd[4], hair: hairs[vi % 4], carryProp: vd[5],
      moving: false, seated: false, phase: vi * 0.5
    });
  }

  // 2. 8 Thực khách ngồi ăn tấp nập tại Sạp 1044 & Đại Khu Ẩm Thực
  var eaters = [
    [-1.15, 19.15, 0], [1.15, 19.15, 0],
    [-5.4, 62.5, -Math.PI * 0.5], [-5.4, 71.5, -Math.PI * 0.5],
    [ 5.4, 62.5,  Math.PI * 0.5], [ 5.4, 71.5,  Math.PI * 0.5],
    [-1.6, 66.5, 0], [1.6, 66.5, 0]
  ];
  for (var ei = 0; ei < eaters.length; ei++) {
    npcs.push({
      id: 'mk_eat_' + ei, x: eaters[ei][0], y: 0, z: eaters[ei][1], yaw: eaters[ei][2],
      role: 'customer', shirt: shirts[(ei + 2) % shirts.length], hair: hairs[ei % 4],
      moving: false, seated: true, eating: true, phase: ei * 0.8
    });
  }

  // 3. 32 Khách đi bộ chen chúc dọc trục 108m & các ngã tư hành lang
  for (var wi = 0; wi < 32; wi++) {
    var laneX = (wi % 4 === 0) ? -2.2 : ((wi % 4 === 1) ? 2.2 : ((wi % 4 === 2) ? -12.6 : 12.6));
    var zA = 4.0 + ((wi * 13) % 72);
    var zB = Math.min(103.0, zA + 18.0 + (wi % 5) * 4.0);
    var crossX = (wi % 2 === 0) ? laneX + 3.6 : laneX - 3.6;
    npcs.push({
      id: 'mk_walk_' + wi,
      x: laneX, y: 0, z: (wi % 2 === 0) ? zA : zB, yaw: (wi % 2 === 0) ? 0 : Math.PI,
      role: 'customer', shirt: shirts[wi % shirts.length], hair: hairs[(wi + 1) % 4],
      moving: true, seated: false, phase: wi * 0.43, stepIdx: 0,
      pts: [
        { x: laneX, z: zA },
        { x: laneX, z: zB },
        { x: Math.max(-22.0, Math.min(22.0, crossX)), z: zB },
        { x: Math.max(-22.0, Math.min(22.0, crossX)), z: zA }
      ]
    });
  }
  return npcs;
}

function createMarketTpsState() {
  var npcs = createMarketNpcs();
  var stools = createMarketStools();
  var traffic = (typeof createSaigonBackdropTraffic === 'function')
    ? createSaigonBackdropTraffic()
    : { vehicles: [], boats: [] };
  // 4 xe chạy ngoài phố Lê Thánh Tôn sau Lối Sau (Cửa Bắc Z > 108)
  var backVehicles = [
    { kind: 'bus',  x: -16.0, lane: 0, dir:  1, speed: 3.3, col: [0.10, 0.62, 0.42, 1] },
    { kind: 'taxi', x:   5.0, lane: 0, dir:  1, speed: 4.5, col: [0.96, 0.74, 0.16, 1] },
    { kind: 'car',  x:  15.0, lane: 1, dir: -1, speed: 4.1, col: [0.86, 0.20, 0.20, 1] },
    { kind: 'moto', x:  -6.0, lane: 1, dir: -1, speed: 5.2, col: [0.20, 0.48, 0.92, 1] }
  ];

  return {
    zone: 'south_hall',
    room: 'south_hall',
    pig: {
      x: 0.0, y: 0.0, z: 1.8, yaw: 0.0,
      targetX: 0.0, targetZ: 3.2,
      waypoints: [],
      walking: true, seated: false, seatChairId: -1,
      pendingSeatId: -1, pendingAction: null,
      eating: false, activeDish: 'banhcuon',
      wearingAoDai: false, outfit: 'none', boughtSamba: false,
      ateFood: false, boughtFruit: false,
      _stuckTimer: 0
    },
    stools: stools,
    npcs: npcs,
    southPeople: npcs.slice(0, 16),
    foodPeople: npcs.slice(16, 36),
    fruitPeople: npcs.slice(36, 56),
    traffic: traffic,
    backVehicles: backVehicles,
    southGateOpen: 0.0,
    northGateOpen: 0.0,
    rightDoorOpen: 0.0,
    exitFade: 0,
    exiting: false,
    onZoneChanged: null,
    ripples: [],
    toast: 'Chợ Bến Thành 48×108m · Tấp nập 56 người! Chỉ có 2 lối ra Trước (Sông Bạch Đằng) & Sau (Lê Thánh Tôn) 🏪',
    toastUntil: 5.0,
    t: 0
  };
}

var MARKET_STALL_AABBS = [
  // Dải 1 (Z: 3..18): Cửa Nam Thời Trang, Thể Thao Adidas/Nike, Giày, Túi, Vải Áo Dài
  { id: 'ao_dai_huong_trinh', x1: -21.6, z1:  3.0, x2: -16.5, z2: 12.5 },
  { id: 'saigon_tees',        x1: -21.6, z1: 13.6, x2: -16.5, z2: 18.2 },
  { id: 'adidas_stall',       x1:  -9.2, z1:  3.5, x2:  -5.6, z2:  9.5 },
  { id: 'shoes_bags_west',    x1:  -9.2, z1: 10.6, x2:  -5.6, z2: 14.2 },
  { id: 'nike_stall',         x1:   5.6, z1:  3.5, x2:   9.2, z2:  9.5 },
  { id: 'bags_watches_east',  x1:   5.6, z1: 10.6, x2:   9.2, z2: 14.2 },
  { id: 'lien_sai_gon_823',   x1:  16.5, z1:  3.0, x2:  21.6, z2: 12.5 },
  { id: 'balo_hats_east',     x1:  16.5, z1: 13.6, x2:  21.6, z2: 18.2 },
  // Dải 2 (Z: 18.8..36): Sạp 1044, Đảo 1029 Ngọc Hảo, Vải Sợi & May Sẵn
  { id: 'sap_1044',           x1: -1.75, z1: 19.7, x2:  1.75, z2: 22.9 },
  { id: 'ngoc_hao_1029',      x1:  9.95, z1: 18.8, x2: 13.25, z2: 22.0 },
  { id: 'fabric_silk_w1',     x1: -21.6, z1: 20.5, x2: -16.5, z2: 31.5 },
  { id: 'jackets_jogger_w2',  x1:  -9.5, z1: 25.5, x2:  -5.8, z2: 34.0 },
  { id: 'dresses_shirts_e2',  x1:   5.4, z1: 25.5, x2:   9.2, z2: 34.0 },
  { id: 'coffee_chon_e1',     x1:  16.5, z1: 20.5, x2:  21.6, z2: 31.5 },
  // Dải 3 (Z: 38..56): Mỹ Nghệ Tây & Đồ Khô Đông & Đảo Lưu Niệm Trung Tâm
  { id: 'gom_su_son_mai',     x1: -21.6, z1: 38.0, x2: -16.5, z2: 47.0 },
  { id: 'non_la_lantern',     x1: -21.6, z1: 48.2, x2: -16.5, z2: 56.0 },
  { id: 'rattan_wood_craft',  x1: -11.5, z1: 40.0, x2:  -6.5, z2: 51.0 },
  { id: 'central_souvenir',   x1:  -2.5, z1: 42.0, x2:   2.5, z2: 50.0 },
  { id: 'tea_spices_e',       x1:   6.5, z1: 40.0, x2:  11.5, z2: 51.0 },
  { id: 'dried_fruits_e',     x1:  16.5, z1: 38.0, x2:  21.6, z2: 47.0 },
  { id: 'seafood_dry_e',      x1:  16.5, z1: 48.2, x2:  21.6, z2: 56.0 },
  // Dải 4 (Z: 58..80): Đại Khu Ẩm Thực Toàn Bộ Món Việt Nam (12 cụm quầy + bàn ăn)
  { id: 'pho_hutieu_fc',      x1: -11.5, z1: 59.0, x2:  -6.8, z2: 65.5 },
  { id: 'bunbo_mam_fc',       x1: -11.5, z1: 68.0, x2:  -6.8, z2: 75.5 },
  { id: 'banh_cuon_50k_fc',   x1: -21.6, z1: 59.5, x2: -16.5, z2: 67.5 },
  { id: 'banh_beo_20k_fc',    x1: -21.6, z1: 69.0, x2: -16.5, z2: 77.0 },
  { id: 'com_tam_suon_fc',    x1:   6.8, z1: 59.0, x2:  11.5, z2: 65.5 },
  { id: 'banhxeo_banhmi_fc',  x1:   6.8, z1: 68.0, x2:  11.5, z2: 75.5 },
  { id: 'che_3_mien_fc',      x1:  16.5, z1: 59.5, x2:  21.6, z2: 67.5 },
  { id: 'sinhto_nuocmia_fc',  x1:  16.5, z1: 69.0, x2:  21.6, z2: 77.0 },
  { id: 'food_island_center', x1:  -2.2, z1: 67.5, x2:   2.2, z2: 74.5 },
  // Dải 5 (Z: 82..103): Khu Trái Cây Nhiệt Đới Đủ Loại, Hoa Tươi & Hải Sản Tươi Sống Cửa Bắc
  { id: 'tropical_w1',        x1: -11.5, z1: 83.5, x2:  -5.5, z2: 92.5 },
  { id: 'tropical_e1',        x1:   5.5, z1: 83.5, x2:  11.5, z2: 92.5 },
  { id: 'flowers_west_n',     x1: -21.6, z1: 83.5, x2: -16.5, z2: 93.5 },
  { id: 'seafood_east_n',     x1:  16.5, z1: 83.5, x2:  21.6, z2: 93.5 },
  { id: 'meat_veg_w2',        x1: -21.6, z1: 95.0, x2: -16.5, z2: 102.0 },
  { id: 'durian_mango_w',     x1: -11.5, z1: 95.5, x2:  -6.2, z2: 102.0 },
  { id: 'juice_coconut_e',    x1:   6.2, z1: 95.5, x2:  11.5, z2: 102.0 },
  { id: 'live_fish_e2',       x1:  16.5, z1: 95.0, x2:  21.6, z2: 102.0 }
];

function clampMarketWalkPos(st, x, z) {
  var nx = Math.max(-23.4, Math.min(23.4, x));
  var nz = Math.max(0.65, Math.min(107.35, z));
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

function marketSegHitsBox(ax, az, bx, bz, b, pad) {
  var x1 = b.x1 - pad, x2 = b.x2 + pad, z1 = b.z1 - pad, z2 = b.z2 + pad;
  var dx = bx - ax, dz = bz - az;
  var t0 = 0, t1 = 1;
  var p = [-dx, dx, -dz, dz];
  var q = [ax - x1, x2 - ax, az - z1, z2 - az];
  for (var i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-6) {
      if (q[i] < 0) return false;
    } else {
      var t = q[i] / p[i];
      if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  return t0 < t1;
}

function routeAroundMarketObstacles(startPt, endPt) {
  var out = [];
  var cur = startPt;
  var obs = MARKET_STALL_AABBS;
  for (var iter = 0; iter < 8; iter++) {
    var hitBox = null, pad = 0.28;
    for (var i = 0; i < obs.length; i++) {
      if (marketSegHitsBox(cur.x, cur.z, endPt.x, endPt.z, obs[i], pad)) {
        hitBox = obs[i];
        break;
      }
    }
    if (!hitBox) break;
    var cands = [
      { x: hitBox.x1 - 0.52, z: hitBox.z1 - 0.52, y: 0 },
      { x: hitBox.x2 + 0.52, z: hitBox.z1 - 0.52, y: 0 },
      { x: hitBox.x1 - 0.52, z: hitBox.z2 + 0.52, y: 0 },
      { x: hitBox.x2 + 0.52, z: hitBox.z2 + 0.52, y: 0 }
    ];
    var best = null, bestScore = 99999;
    for (var ci = 0; ci < cands.length; ci++) {
      var cp = cands[ci];
      if (cp.x < -23.2 || cp.x > 23.2 || cp.z < 0.8 || cp.z > 107.2) continue;
      if (Math.hypot(cp.x - cur.x, cp.z - cur.z) < 0.20) continue;
      var blocked = false;
      for (var j = 0; j < obs.length; j++) {
        if (marketSegHitsBox(cur.x, cur.z, cp.x, cp.z, obs[j], 0.16)) { blocked = true; break; }
      }
      if (blocked) continue;
      var stillHits = marketSegHitsBox(cp.x, cp.z, endPt.x, endPt.z, hitBox, pad) ? 40 : 0;
      var score = stillHits + Math.hypot(cp.x - cur.x, cp.z - cur.z) + Math.hypot(endPt.x - cp.x, endPt.z - cp.z);
      if (score < bestScore) { bestScore = score; best = cp; }
    }
    if (!best) break;
    out.push(best);
    cur = best;
  }
  out.push(endPt);
  return out;
}

function planMarketRealtimePath(st, tx, targetFloorY, tz, extraOpts) {
  var p = st.pig;
  var eo = extraOpts || {};
  p.seated = false;
  p.seatChairId = -1;
  p.eating = false;
  p.pendingSeatId = typeof eo.seatChairId === 'number' ? eo.seatChairId : -1;
  p.pendingAction = eo.pendingAction || null;
  if (eo.dish) p.activeDish = eo.dish;
  p._stuckTimer = 0;

  var pushed = (typeof pushPointOutOfBoxes === 'function')
    ? pushPointOutOfBoxes(tx, tz, MARKET_STALL_AABBS, 0.38)
    : { x: tx, z: tz };
  var cl = clampMarketWalkPos(st, pushed.x, pushed.z);
  tx = cl.x; tz = cl.z;

  var rawWps = [{ x: tx, y: 0, z: tz }];
  if (typeof planNavGraphRealtimePath === 'function') {
    planNavGraphRealtimePath(MARKET_NAV_GRAPH, st, tx, 0, tz, eo);
    rawWps = p.waypoints || rawWps;
  }

  var pre = [];
  var prevX = p.x, prevZ = p.z;
  for (var i = 0; i < rawWps.length; i++) {
    var wp = rawWps[i];
    if (Math.min(prevX, wp.x) < 2.0 && Math.max(prevX, wp.x) > -2.0 &&
        Math.min(prevZ, wp.z) < 23.2 && Math.max(prevZ, wp.z) > 19.4) {
      var sideX = ((prevX + wp.x) * 0.5 >= 0) ? 2.55 : -2.55;
      pre.push({ x: sideX, y: 0, z: 21.3 });
    }
    if (Math.min(prevX, wp.x) < 13.5 && Math.max(prevX, wp.x) > 9.7 &&
        Math.min(prevZ, wp.z) < 22.3 && Math.max(prevZ, wp.z) > 18.5) {
      var fSideX = ((prevX + wp.x) * 0.5 >= 11.6) ? 14.05 : 9.15;
      pre.push({ x: fSideX, y: 0, z: 20.4 });
    }
    pre.push(wp);
    prevX = wp.x; prevZ = wp.z;
  }
  var out = [];
  var curPt = { x: p.x, y: 0, z: p.z };
  for (var pi = 0; pi < pre.length; pi++) {
    var segs = routeAroundMarketObstacles(curPt, pre[pi]);
    for (var si = 0; si < segs.length; si++) out.push(segs[si]);
    curPt = pre[pi];
  }
  p.waypoints = out;
  p.targetX = out[0].x;
  p.targetZ = out[0].z;
  p.walking = true;
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
    if (d < 0.14) {
      n.x = tgt.x; n.z = tgt.z;
      n.stepIdx = (n.stepIdx + 1) % n.pts.length;
    } else {
      var spd = Math.min(d, (1.25 + (i % 3) * 0.18) * dt);
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

  if (typeof stepSaigonBackdropTraffic === 'function' && st.traffic) {
    stepSaigonBackdropTraffic(st.traffic, dt);
  }
  if (st.backVehicles) {
    for (var bi = 0; bi < st.backVehicles.length; bi++) {
      var bv = st.backVehicles[bi];
      bv.x += bv.dir * bv.speed * dt;
      if (bv.dir > 0 && bv.x > 30) bv.x = -30;
      if (bv.dir < 0 && bv.x < -30) bv.x = 30;
    }
  }

  stepMarketNpcs(st, dt);

  if (!p.seated && p.walking) {
    var curWp = (p.waypoints && p.waypoints.length > 0) ? p.waypoints[0] : { x: p.targetX, z: p.targetZ };
    var dx = curWp.x - p.x, dz = curWp.z - p.z;
    var dist = Math.hypot(dx, dz);
    if (dist < 0.12) {
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
          p.eating = (p.pendingAction === 'eat_banhcuon' || p.pendingAction === 'eat_dish');
          if (p.eating) {
            p.ateFood = true;
            st.toast = 'Đại Khu Ẩm Thực: Phở, Bún Bò Huế, Cơm Tấm, Bánh Xèo, Bánh Cuốn 50K, Chè & Dừa Xiêm! 🍜🥞';
            st.toastUntil = st.t + 4.4;
          } else {
            st.toast = 'Đã ngồi ghế inox Chợ Bến Thành! Bấm gọi món Việt hoặc chạm sàn tự đứng dậy 🪑';
            st.toastUntil = st.t + 3.8;
          }
          p.pendingSeatId = -1;
        }
        if (p.pendingAction === 'try_aodai') {
          p.wearingAoDai = !p.wearingAoDai;
          p.outfit = p.wearingAoDai ? 'aodai' : 'none';
          p.yaw = -Math.PI * 0.5;
          st.toast = p.wearingAoDai ? 'Sạp Hương Trinh 415: Đã ướm thử Áo Dài Lụa Hà Đông! 👘✨' : 'Đã xếp gọn Áo Dài Lụa!';
          st.toastUntil = st.t + 4.0;
        } else if (p.pendingAction === 'try_adidas') {
          var adSeq = ['adidas_jacket', 'adidas_polo', 'adidas_jogger', 'none'];
          var ai = adSeq.indexOf(p.outfit);
          p.outfit = adSeq[(ai + 1) % adSeq.length];
          p.wearingAoDai = false; p.boughtSamba = true;
          st.toast = p.outfit === 'none' ? 'Đã cởi đồ Adidas!' : 'Sạp Adidas 208: Đang thử bộ Adidas 3 Sọc + Giày & Túi! 🧥👟';
          st.toastUntil = st.t + 4.0;
        } else if (p.pendingAction === 'try_nike') {
          var nkSeq = ['nike_tee', 'nike_hoodie', 'none'];
          var ni = nkSeq.indexOf(p.outfit);
          p.outfit = nkSeq[(ni + 1) % nkSeq.length];
          p.wearingAoDai = false; p.boughtSamba = true;
          st.toast = p.outfit === 'none' ? 'Đã cởi đồ Nike!' : 'Sạp Nike 212: Đang thử áo Nike Swoosh thể thao cực ngầu! ✔️👕';
          st.toastUntil = st.t + 4.0;
        } else if (p.pendingAction === 'buy_shoes_bags') {
          p.boughtSamba = true;
          st.toast = 'Sạp 306: Đã chọn Giày Sneaker, Dép Da, Túi Xách & Đồng Hồ Bến Thành! 👟🎒';
          st.toastUntil = st.t + 4.0;
        } else if (p.pendingAction === 'buy_mango' || p.pendingAction === 'buy_tropical') {
          p.boughtFruit = true; p.boughtSamba = true;
          st.toast = 'Trái Cây 1029 Ngọc Hảo & Cửa Bắc: Sầu riêng Ri6, Măng cụt, Chôm chôm, Xoài cát & Dừa xiêm! 🥭🍈';
          st.toastUntil = st.t + 4.4;
        } else if (p.pendingAction === 'buy_coffee_dry') {
          p.boughtSamba = true;
          st.toast = 'Đồ Khô & Đặc Sản 823: Cà phê Chồn, Trà Sen, Hạt Điều, Tiêu & Nước Mắm Phú Quốc! ☕📦';
          st.toastUntil = st.t + 4.2;
        } else if (p.pendingAction === 'buy_craft') {
          p.boughtSamba = true;
          st.toast = 'Mỹ Nghệ Bến Thành: Gốm Bát Tràng, Sơn Mài, Nón Lá Bài Thơ & Mây Tre Đan! 🏺👒';
          st.toastUntil = st.t + 4.2;
        } else if (p.pendingAction === 'buy_seafood_flower') {
          p.boughtSamba = true;
          st.toast = 'Khu Tươi Sống Cửa Bắc: Tôm Sú, Cua Ghẹ, Hoa Sen & Hoa Cúc Tươi Rực Rỡ! 🦞💐';
          st.toastUntil = st.t + 4.2;
        } else if (p.pendingAction === 'exit_market') {
          st.exiting = true;
        }
        p.pendingAction = null;
      }
    } else {
      if (typeof slidePigStep === 'function') {
        var stpMk = slidePigStep(p, curWp.x, curWp.z, 3.6, dt, function(cx, cz) {
          return clampMarketWalkPos(st, cx, cz);
        });
        p.x = stpMk.x; p.z = stpMk.z;
        if (stpMk.stuck) {
          if (p.waypoints && p.waypoints.length > 0) p.waypoints.shift();
          if (!p.waypoints || p.waypoints.length === 0) { p.walking = false; p.pendingAction = null; }
          p._stuckTimer = 0;
        }
      } else {
        var spd = Math.min(dist, 3.6 * dt);
        var next = clampMarketWalkPos(st, p.x + (dx / dist) * spd, p.z + (dz / dist) * spd);
        p.x = next.x; p.z = next.z;
        var tyaw = Math.atan2(dx, dz);
        p.yaw = (typeof tpsLerpAngle === 'function') ? tpsLerpAngle(p.yaw || 0, tyaw, Math.min(1, dt * 12)) : tyaw;
      }
    }

    var newZone = getMarketZoneAt(p.x, p.z);
    if (newZone !== st.zone) {
      st.zone = newZone;
      st.room = newZone;
      if (typeof st.onZoneChanged === 'function') st.onZoneChanged(newZone);
    }
  }

  // CHỈ 2 LỐI RA DUY NHẤT: Lối Trước (Cửa Nam Z=0) & Lối Sau (Cửa Bắc Z=108)
  st.southGateOpen += (((st.exiting && p.z < 54.0) ? 0.92 : 0.0) - st.southGateOpen) * Math.min(1, dt * 6.0);
  st.northGateOpen += (((st.exiting && p.z >= 54.0) ? 0.92 : 0.0) - st.northGateOpen) * Math.min(1, dt * 6.0);
  st.rightDoorOpen = st.southGateOpen;
  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.2);

  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== 2. RAYCAST 3D TƯƠNG TÁC MỌI SẠP & CHỈ 2 LỐI RA TRƯỚC/SAU ==================== */
function rayMarketSphere(ox, oy, oz, dx, dy, dz, cx, cy, cz, rad) {
  var ocx = cx - ox, ocy = cy - oy, ocz = cz - oz;
  var proj = ocx * dx + ocy * dy + ocz * dz;
  if (proj < 0.2 || proj > 44) return -1;
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

  // 1. Ghế đẩu inox
  if (st.stools) {
    var bestS = null, bestT = 999;
    for (var i = 0; i < st.stools.length; i++) {
      var sl = st.stools[i];
      var ht = rayMarketSphere(ox, oy, oz, dx, dy, dz, sl.x, 0.32, sl.z, 0.55);
      if (ht > 0 && ht < bestT) { bestT = ht; bestS = sl; }
    }
    if (bestS) return { kind: 'stool', stool: bestS, x: bestS.x, y: 0, z: bestS.z };
  }

  // 2. Các cụm sạp suốt 108m + ĐÚNG 2 LỐI RA (Z=0 & Z=108)
  var spots = [
    { cx: -19.0, cy: 1.0, cz:  7.8, r: 2.5, tgt: { kind: 'aodai',      x: -14.8, y: 0, z:  7.8 } },
    { cx:  -7.4, cy: 1.0, cz:  6.5, r: 2.0, tgt: { kind: 'try_adidas', x:  -4.8, y: 0, z:  6.5 } },
    { cx:   7.4, cy: 1.0, cz:  6.5, r: 2.0, tgt: { kind: 'try_nike',   x:   4.8, y: 0, z:  6.5 } },
    { cx:  -7.4, cy: 0.9, cz: 12.4, r: 1.8, tgt: { kind: 'buy_shoes',  x:  -4.8, y: 0, z: 12.4 } },
    { cx:   7.4, cy: 0.9, cz: 12.4, r: 1.8, tgt: { kind: 'buy_shoes',  x:   4.8, y: 0, z: 12.4 } },
    { cx:  19.0, cy: 1.0, cz:  7.8, r: 2.5, tgt: { kind: 'buy_coffee', x:  14.8, y: 0, z:  7.8 } },
    { cx:   0.0, cy: 0.9, cz: 21.3, r: 2.0, tgt: { kind: 'food',       x: -0.38, y: 0, z: 19.15, stoolId: 1, dish: 'banhcuon' } },
    { cx:  11.6, cy: 0.9, cz: 20.4, r: 2.0, tgt: { kind: 'fruit',      x:  11.6, y: 0, z: 18.0 } },
    { cx: -19.0, cy: 1.0, cz: 42.5, r: 2.5, tgt: { kind: 'buy_craft',  x: -14.8, y: 0, z: 42.5 } },
    { cx:  19.0, cy: 1.0, cz: 42.5, r: 2.5, tgt: { kind: 'buy_coffee', x:  14.8, y: 0, z: 42.5 } },
    { cx:  -9.0, cy: 0.9, cz: 62.5, r: 2.2, tgt: { kind: 'food',       x:  -5.4, y: 0, z: 62.5, stoolId: 4, dish: 'pho' } },
    { cx:  -9.0, cy: 0.9, cz: 71.5, r: 2.2, tgt: { kind: 'food',       x:  -5.4, y: 0, z: 71.5, stoolId: 5, dish: 'bunbo' } },
    { cx:   9.0, cy: 0.9, cz: 62.5, r: 2.2, tgt: { kind: 'food',       x:   5.4, y: 0, z: 62.5, stoolId: 6, dish: 'banhxeo' } },
    { cx:   9.0, cy: 0.9, cz: 71.5, r: 2.2, tgt: { kind: 'food',       x:   5.4, y: 0, z: 71.5, stoolId: 7, dish: 'che' } },
    { cx:  -8.5, cy: 1.0, cz: 88.0, r: 2.6, tgt: { kind: 'fruit',      x:  -8.5, y: 0, z: 82.5 } },
    { cx:   8.5, cy: 1.0, cz: 88.0, r: 2.6, tgt: { kind: 'fruit',      x:   8.5, y: 0, z: 82.5 } },
    { cx: -19.0, cy: 1.0, cz: 88.0, r: 2.4, tgt: { kind: 'buy_fresh',  x: -14.8, y: 0, z: 88.0 } },
    { cx:  19.0, cy: 1.0, cz: 88.0, r: 2.4, tgt: { kind: 'buy_fresh',  x:  14.8, y: 0, z: 88.0 } },
    // Chỉ 2 lối ra duy nhất: Lối Trước (Z = 0) & Lối Sau (Z = 108)
    { cx:   0.0, cy: 1.6, cz:   0.1, r: 2.4, tgt: { kind: 'exit',      x:  0.0,  y: 0, z:   1.2 } },
    { cx:   0.0, cy: 1.6, cz: 107.9, r: 2.4, tgt: { kind: 'exit',      x:  0.0,  y: 0, z: 106.8 } }
  ];
  var bestSpot = null, bestSpotT = 999;
  for (var si = 0; si < spots.length; si++) {
    var sp = spots[si];
    var ts = rayMarketSphere(ox, oy, oz, dx, dy, dz, sp.cx, sp.cy, sp.cz, sp.r);
    if (ts > 0 && ts < bestSpotT) { bestSpotT = ts; bestSpot = sp.tgt; }
  }
  if (bestSpot) return bestSpot;

  // 3. Chạm sàn trong toàn đại sảnh 48m × 108m
  if (dy < -0.025) {
    var tFloor = -oy / dy;
    if (tFloor > 0.2 && tFloor < 48) {
      var fx = ox + dx * tFloor, fz = oz + dz * tFloor;
      if (fx >= -24.0 && fx <= 24.0 && fz >= 0.0 && fz <= 108.0) {
        var cl = clampMarketWalkPos(st, fx, fz);
        return { kind: 'floor', x: cl.x, y: 0, z: cl.z };
      }
    }
  }
  return null;
}

/* ==================== 3. RENDER WEBGL 3D CHỢ 48×108M + KHUÔN VIÊN XE CỘ DỌC SÔNG BẠCH ĐẰNG MỜ SƯƠNG ==================== */
var MARKET_ATMO = {
  clearColor: [0.24, 0.20, 0.18, 1.0],
  hemiLow: [0.38, 0.30, 0.22],
  hemiHigh: [0.84, 0.76, 0.62],
  sunDir: [0.24, 0.88, -0.40],
  sunCol: [1.10, 0.96, 0.72],
  wrapBias: 0.48,
  outdoorRect: [1.0, 0.2, 0.0, 0.40],
  // Sương mờ nhẹ giúp Sông Bạch Đằng & Skyline ngoài cửa hiện lên bảng lảng đầy chiều sâu!
  fogCol: [0.66, 0.74, 0.84],
  fogParams: [22.0, 62.0, 0.44]
};

function drawMarketHangingLampWebgl(wgl, x, z, col) {
  var dm = wgl.drawMesh;
  dm('cyl', 'white', x, 5.7, z, 0, 0, 0, 0.03, 3.6, 0.03, { tint: [0.16, 0.12, 0.08, 1] });
  dm('cone', 'white', x, 3.95, z, 0, 0, 0, 0.56, 0.22, 0.56, { tint: col });
  dm('sphere', 'white', x, 3.82, z, 0, 0, 0, 0.16, 0.16, 0.16, { tint: [1.0, 0.90, 0.50, 1], emissive: 1.5 });
}

function drawMarketCeilingFanWebgl(wgl, x, z, t, phase) {
  var dm = wgl.drawMesh;
  dm('cyl', 'white', x, 6.2, z, 0, 0, 0, 0.06, 2.4, 0.06, { tint: [0.20, 0.22, 0.26, 1] });
  dm('cyl', 'white', x, 5.02, z, 0, 0, 0, 0.32, 0.10, 0.32, { tint: [0.28, 0.32, 0.38, 1] });
  var base = t * 5.6 + (phase || 0);
  for (var i = 0; i < 3; i++) {
    var a = base + (i * Math.PI * 2) / 3;
    dm('box', 'white', x + Math.sin(a) * 0.62, 5.00, z + Math.cos(a) * 0.62, 0, a, 0, 0.18, 0.025, 1.12, { tint: [0.46, 0.52, 0.60, 1] });
  }
}

function drawMarketPropPhoPotWebgl(wgl, x, y, z) {
  var dm = wgl.drawMesh;
  dm('cyl', 'white', x, y + 0.26, z, 0, 0, 0, 0.66, 0.52, 0.66, { tint: [0.80, 0.84, 0.88, 1], specPow: 96, rim: 0.28 });
  dm('cyl', 'white', x, y + 0.53, z, 0, 0, 0, 0.56, 0.02, 0.56, { tint: [0.88, 0.56, 0.14, 1] });
}

function drawMarketPropCoconutClusterWebgl(wgl, x, y, z) {
  var dm = wgl.drawMesh;
  var pts = [[-0.18, 0, 0], [0.18, 0, 0], [0, 0, 0.20], [-0.08, 0.24, 0.08], [0.10, 0.24, 0.10]];
  for (var i = 0; i < pts.length; i++) {
    dm('sphere', 'white', x + pts[i][0], y + 0.14 + pts[i][1], z + pts[i][2], 0, 0, 0, 0.28, 0.26, 0.28, { tint: [0.12, 0.56, 0.22, 1], specPow: 48 });
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
      { pos: [0.0, 5.8, Math.max(8, Math.min(98, p.z - 8))], col: [1.10, 0.88, 0.52] },
      { pos: [0.0, 5.8, Math.max(12, Math.min(102, p.z + 8))], col: [1.14, 0.88, 0.50] },
      { pos: [-12.0, 5.6, p.z], col: [1.05, 0.86, 0.50] },
      { pos: [ 12.0, 5.6, p.z], col: [1.05, 0.86, 0.50] }
    ]
  };
  wgl.beginFrame(W, H, cam, atmo);
  var dm = wgl.drawMesh;

  // Distance culling 30m theo camera (hiệu năng ổn định 60fps ngay cả khi sảnh dài 108m & 56 NPC)
  function inRangeZ(z1, z2, margin) {
    var m = margin || 32.0;
    return z2 >= cam.pos.z - m && z1 <= cam.pos.z + m;
  }
  function nearCam(wx, wz, rad) {
    return Math.hypot(wx - cam.pos.x, wz - cam.pos.z) <= (rad || 28.0);
  }

  /* ---------------- A. KHUÔN VIÊN 2 LỐI RA: TRƯỚC (XE CỘ + DỌC SÔNG BẠCH ĐẰNG MỜ SƯƠNG) & SAU (PHỐ XE CHẠY) ---------------- */
  if (cam.pos.z < 40.0 || p.z < 36.0) {
    // Khuôn viên hiên Cửa Nam (Z ∈ [-2.0, 0.0]): Sân gạch rộng + bồn cây + xe máy dựng trước cửa
    dm('box', 'marketTileSouth', 0, -0.06, -1.0, 0, 0, 0, 52.0, 0.12, 2.2, { tint: [0.92, 0.88, 0.82, 1], us: 18, vs: 1 });
    if (typeof drawSaigonStreetBackdrop3D === 'function') {
      drawSaigonStreetBackdrop3D(wgl, st, st.traffic, {
        centerX: 0.0,
        frontZ: -1.8,
        width: 72,
        leftNeighborX: -29.0,
        rightNeighborX: 29.0,
        neighborHeight: 8.2
      });
      // Lớp sương mờ bảng lảng dọc Sông Bạch Đằng giống hiệu ứng chiều sâu Cafe/Adidas
      wgl.setBlend('alpha');
      dm('quad', 'white', 0, 4.5, -14.0, 0, 0, 0, 72, 10.0, 1, { tint: [0.76, 0.84, 0.92, 0.24], emissive: 1.0 });
      wgl.setBlend(null);
    } else {
      dm('quad', 'white', 0, 2.2, -0.22, 0, 0, 0, 6.4, 4.4, 1, { tint: [0.85, 0.90, 0.96, 1], emissive: 0.72 });
    }
  }
  if (cam.pos.z > 68.0 || p.z > 72.0) {
    // Khuôn viên Lối Sau Cửa Bắc (Z = 108..126): Vỉa hè cây xanh, đường Lê Thánh Tôn 2 làn xe chạy & nhà phố
    dm('box', 'marketTileFruit', 0, -0.06, 109.2, 0, 0, 0, 54.0, 0.12, 2.6, { tint: [0.90, 0.88, 0.82, 1], us: 18, vs: 1 });
    dm('box', 'white', 0, -0.09, 113.0, 0, 0, 0, 58.0, 0.08, 5.2, { tint: [0.22, 0.26, 0.34, 1] });
    dm('box', 'white', 0, -0.04, 113.0, 0, 0, 0, 54.0, 0.02, 0.14, { tint: [0.98, 0.84, 0.20, 1] });
    dm('box', 'marketWallGold', 0, 4.2, 121.0, 0, Math.PI, 0, 56.0, 8.6, 5.0, { tint: [0.88, 0.84, 0.76, 1], us: 8, vs: 2 });
    if (st.backVehicles) {
      for (var bvi = 0; bvi < st.backVehicles.length; bvi++) {
        var bv = st.backVehicles[bvi];
        var bvz = bv.lane === 0 ? 111.7 : 114.2;
        dm('box', 'white', bv.x, 0.56, bvz, 0, 0, 0, bv.kind === 'bus' ? 3.4 : (bv.kind === 'moto' ? 1.2 : 2.2), 0.78, 0.95, { tint: bv.col });
      }
    }
  }

  /* ---------------- B. SÀN Ô BÀN CỜ 48m × 108m, MÁI VÒM 7.6M & CỬA GIÓ LOUVERS ---------------- */
  for (var seg = 0; seg < 6; seg++) {
    var sz0 = seg * 18.0, sz1 = sz0 + 18.0, szc = sz0 + 9.0;
    if (!inRangeZ(sz0, sz1, 36.0)) continue;
    var fTex = seg < 2 ? 'marketTileSouth' : (seg < 4 ? 'marketTileFood' : 'marketTileFruit');
    dm('box', fTex, -12.0, -0.05, szc, 0, 0, 0, 24.0, 0.10, 18.0, { tint: [1,1,1,1], us: 8, vs: 6 });
    dm('box', fTex,  12.0, -0.05, szc, 0, 0, 0, 24.0, 0.10, 18.0, { tint: [1,1,1,1], us: 8, vs: 6 });
    dm('box', 'white', 0.0, 0.008, szc, 0, 0, 0, 5.2, 0.012, 17.9, { tint: [0.56, 0.11, 0.15, 1] });
    // Mái kèo thép & giếng trời & louvers
    dm('box', 'marketRoofPanel', 0.0, 7.68, szc, 0, 0, 0, 48.2, 0.18, 18.0, { tint: [1,1,1,1], us: 12, vs: 6 });
    dm('quad', 'marketSkylight', 0.0, 7.56, szc, Math.PI * 0.5, 0, 0, 5.2, 17.6, 1, { tint: [1,1,1,1], emissive: 1.0, us: 1, vs: 4 });
    dm('box', 'white', 0.0, 7.12, szc, 0, 0, 0, 47.6, 0.24, 0.26, { tint: [0.22, 0.34, 0.26, 1] });
    dm('quad', 'marketLouvers', -12.0, 6.82, szc, 0, 0, 0, 10.0, 0.78, 1, { tint: [1,1,1,1], emissive: 0.55 });
    dm('quad', 'marketLouvers',  12.0, 6.82, szc, 0, 0, 0, 10.0, 0.78, 1, { tint: [1,1,1,1], emissive: 0.55 });
    // Cột thép dọc đại sảnh
    var cxs = [-15.2, -4.4, 4.4, 15.2];
    for (var ci = 0; ci < cxs.length; ci++) {
      dm('box', 'white', cxs[ci], 3.65, szc, 0, 0, 0, 0.34, 7.3, 0.34, { tint: [0.20, 0.32, 0.24, 1] });
    }
    // Tường Đông & Tây đóng kín 100% (KHÔNG làm cửa thoát ở Đông/Tây!)
    dm('box', 'marketWallGold', -24.08, 3.8, szc, 0, 0, 0, 0.16, 7.6, 18.0, { tint: [1,1,1,1], us: 6, vs: 2.5 });
    dm('box', 'marketWallGold',  24.08, 3.8, szc, 0, 0, 0, 0.16, 7.6, 18.0, { tint: [1,1,1,1], us: 6, vs: 2.5 });
    dm('quad', 'marketLouvers', -23.94, 6.2, szc, 0,  Math.PI * 0.5, 0, 14.0, 0.85, 1, { tint: [1,1,1,1], emissive: 0.55 });
    dm('quad', 'marketLouvers',  23.94, 6.2, szc, 0, -Math.PI * 0.5, 0, 14.0, 0.85, 1, { tint: [1,1,1,1], emissive: 0.55 });
  }

  // Mặt tiền Cửa Nam (Z = 0, mở cổng chính [-3.2, 3.2] + 2 cửa sổ vòm [-16..-7] & [7..16] ngắm xe cộ & Sông Bạch Đằng!)
  if (inRangeZ(0, 4, 42)) {
    dm('box', 'marketWallGold', -20.0, 3.8, -0.08, 0, 0, 0, 8.0, 7.6, 0.16, { tint: [1,1,1,1], us: 3, vs: 2.5 });
    dm('box', 'marketWallGold',  20.0, 3.8, -0.08, 0, 0, 0, 8.0, 7.6, 0.16, { tint: [1,1,1,1], us: 3, vs: 2.5 });
    dm('box', 'marketWallGold',  -5.1, 3.8, -0.08, 0, 0, 0, 3.8, 7.6, 0.16, { tint: [1,1,1,1], us: 1.5, vs: 2.5 });
    dm('box', 'marketWallGold',   5.1, 3.8, -0.08, 0, 0, 0, 3.8, 7.6, 0.16, { tint: [1,1,1,1], us: 1.5, vs: 2.5 });
    dm('box', 'marketWallGold',   0.0, 5.7, -0.08, 0, 0, 0, 6.4, 3.8, 0.16, { tint: [1,1,1,1], us: 2.5, vs: 1.5 });
    dm('box', 'marketWallGold', -11.5, 0.65,-0.08, 0, 0, 0, 9.0, 1.3, 0.16, { tint: [1,1,1,1], us: 3, vs: 0.5 });
    dm('box', 'marketWallGold', -11.5, 6.3, -0.08, 0, 0, 0, 9.0, 2.6, 0.16, { tint: [1,1,1,1], us: 3, vs: 1 });
    dm('box', 'marketWallGold',  11.5, 0.65,-0.08, 0, 0, 0, 9.0, 1.3, 0.16, { tint: [1,1,1,1], us: 3, vs: 0.5 });
    dm('box', 'marketWallGold',  11.5, 6.3, -0.08, 0, 0, 0, 9.0, 2.6, 0.16, { tint: [1,1,1,1], us: 3, vs: 1 });
    dm('quad', 'marketIronGate', -2.4, 1.85, 0.04, 0, 0, 0, 1.6, 3.7, 1, { tint: [1,1,1,1] });
    var sgA = st.southGateOpen * 1.15;
    dm('quad', 'marketIronGate', 3.2 - Math.cos(sgA) * 0.8, 1.85, 0.04 + Math.sin(sgA) * 0.8, 0, -sgA, 0, 1.6, 3.7, 1, { tint: [1,1,1,1] });
    dm('quad', 'signCuaSo1', 0.0, 4.35, 0.06, 0, 0, 0, 5.8, 1.15, 1, { tint: [1,1,1,1] });
  }

  // Mặt hậu Lối Sau Cửa Bắc (Z = 108, mở cổng [-3.2, 3.2] + 2 cửa sổ vòm [-16..-7] & [7..16])
  if (inRangeZ(104, 108, 42)) {
    dm('box', 'marketWallGold', -20.0, 3.8, 108.08, 0, 0, 0, 8.0, 7.6, 0.16, { tint: [1,1,1,1], us: 3, vs: 2.5 });
    dm('box', 'marketWallGold',  20.0, 3.8, 108.08, 0, 0, 0, 8.0, 7.6, 0.16, { tint: [1,1,1,1], us: 3, vs: 2.5 });
    dm('box', 'marketWallGold',  -5.1, 3.8, 108.08, 0, 0, 0, 3.8, 7.6, 0.16, { tint: [1,1,1,1], us: 1.5, vs: 2.5 });
    dm('box', 'marketWallGold',   5.1, 3.8, 108.08, 0, 0, 0, 3.8, 7.6, 0.16, { tint: [1,1,1,1], us: 1.5, vs: 2.5 });
    dm('box', 'marketWallGold',   0.0, 5.7, 108.08, 0, 0, 0, 6.4, 3.8, 0.16, { tint: [1,1,1,1], us: 2.5, vs: 1.5 });
    dm('box', 'marketWallGold', -11.5, 0.65,108.08, 0, 0, 0, 9.0, 1.3, 0.16, { tint: [1,1,1,1], us: 3, vs: 0.5 });
    dm('box', 'marketWallGold', -11.5, 6.3, 108.08, 0, 0, 0, 9.0, 2.6, 0.16, { tint: [1,1,1,1], us: 3, vs: 1 });
    dm('box', 'marketWallGold',  11.5, 0.65,108.08, 0, 0, 0, 9.0, 1.3, 0.16, { tint: [1,1,1,1], us: 3, vs: 0.5 });
    dm('box', 'marketWallGold',  11.5, 6.3, 108.08, 0, 0, 0, 9.0, 2.6, 0.16, { tint: [1,1,1,1], us: 3, vs: 1 });
    dm('quad', 'marketIronGate', -2.4, 1.85, 107.96, 0, Math.PI, 0, 1.6, 3.7, 1, { tint: [1,1,1,1] });
    var ngA = st.northGateOpen * 1.15;
    dm('quad', 'marketIronGate', 3.2 - Math.cos(ngA) * 0.8, 1.85, 107.96 - Math.sin(ngA) * 0.8, 0, Math.PI + ngA, 0, 1.6, 3.7, 1, { tint: [1,1,1,1] });
    dm('quad', 'signCuaBac', 0.0, 4.35, 107.94, 0, Math.PI, 0, 6.2, 1.15, 1, { tint: [1,1,1,1] });
  }

  /* ---------------- C. CÁC CỤM SẠP HÀNG SUỐT 108M (DISTANCE CULLED 32M GIỮ 60FPS) ---------------- */
  function drawStallBlock(x, z, w, d, wallTex, signTex, bodyTex, faceSide) {
    if (!inRangeZ(z - d * 0.5, z + d * 0.5, 32)) return;
    dm('box', bodyTex || 'marketWood', x, 0.44, z, 0, 0, 0, w, 0.88, d, { tint: [1,1,1,1], us: 2, vs: 1 });
    var ry = faceSide === 'left' ? -Math.PI * 0.5 : (faceSide === 'right' ? Math.PI * 0.5 : (faceSide === 'back' ? Math.PI : 0));
    var ox = faceSide === 'left' ? -w * 0.52 : (faceSide === 'right' ? w * 0.52 : 0);
    var oz = faceSide === 'front' ? -d * 0.52 : (faceSide === 'back' ? d * 0.52 : 0);
    var span = (faceSide === 'left' || faceSide === 'right') ? d * 0.92 : w * 0.92;
    if (signTex) dm('quad', signTex, x + ox, 2.95, z + oz, 0, ry, 0, span, 0.72, 1, { tint: [1,1,1,1] });
    if (wallTex) dm('quad', wallTex, x + ox, 1.68, z + oz, 0, ry, 0, span * 0.96, 1.48, 1, { tint: [1,1,1,1] });
  }

  // Dải 1 & 2 (Z: 3..36): Thời Trang, Adidas, Nike, Giày, Túi, Hương Trinh 415, Liên Sài Gòn 823, Sạp 1044, Đảo 1029
  drawStallBlock(-19.05, 7.75, 5.0, 9.4, 'artAoDaiFabric',  'signHuongTrinh', 'marketWood', 'right');
  drawStallBlock(-19.05, 15.9, 5.0, 4.4, 'artSaigonTees',   'signSaigonTees', 'marketWood', 'right');
  drawStallBlock(-7.4,   6.5,  3.5, 5.8, 'artAdidasMarket', 'signAdidasMarket', 'marketWood', 'right');
  drawStallBlock(-7.4,  12.4,  3.5, 3.4, 'artShoesBags',    'signShoesBags',  'marketWood', 'right');
  drawStallBlock( 7.4,   6.5,  3.5, 5.8, 'artNikeMarket',   'signNikeMarket', 'marketWood', 'left');
  drawStallBlock( 7.4,  12.4,  3.5, 3.4, 'artShoesBags',    'signShoesBags',  'marketWood', 'left');
  drawStallBlock( 19.05, 7.75, 5.0, 9.4, 'artLienTeaShelves','signLienSaiGon','marketWood', 'left');
  drawStallBlock( 19.05, 15.9, 5.0, 4.4, 'artCoffeeSpices', 'signCoffeeSpices','marketWood','left');

  // Dải 2 (Z: 18..36): Sạp 1044 trung tâm + Đảo 1029 Ngọc Hảo + Dãy vải sợi
  if (inRangeZ(18, 36, 32)) {
    dm('quad', 'signKhuAnUong', 0.0, 4.05, 19.0, 0, 0, 0, 5.0, 0.95, 1, { tint: [1,1,1,1] });
    dm('box', 'marketCeramicTile', 0, 0.46, 21.3, 0, 0, 0, 3.4, 0.92, 3.0, { tint: [1,1,1,1], us: 2, vs: 1 });
    dm('box', 'white', 0, 0.96, 21.3, 0, 0, 0, 3.5, 0.08, 3.1, { tint: [0.88, 0.91, 0.94, 1], specPow: 64 });
    dm('quad', 'signSap1044', 0, 2.45, 22.95, 0, Math.PI, 0, 3.6, 1.10, 1, { tint: [1,1,1,1] });
    if (nearCam(0, 21.3)) {
      drawMarketPropPhoPotWebgl(wgl, -0.85, 1.0, 20.9);
      drawMarketPropPhoPotWebgl(wgl, -0.15, 1.0, 21.3);
      drawMarketPropCoconutClusterWebgl(wgl, 1.05, 1.0, 20.6);
      drawMarketPropBanhBeoTrayWebgl(wgl, 0.10, 1.0, 20.1);
    }
    dm('box', 'marketWood', 11.6, 0.42, 20.4, 0, 0, 0, 3.2, 0.84, 3.0, { tint: [0.22, 0.58, 0.28, 1] });
    dm('box', 'artFruitDisplay', 11.6, 0.94, 20.4, 0, 0, 0, 2.7, 0.20, 2.4, { tint: [1,1,1,1] });
    dm('quad', 'signNgocHao1029', 11.6, 2.65, 20.4, 0, 0, 0, 3.4, 0.72, 1, { tint: [1,1,1,1] });
    drawStallBlock(-19.05, 26.0, 5.0, 10.6, 'artAoDaiFabric',  'signHuongTrinh',  'marketWood', 'right');
    drawStallBlock(-7.65,  29.8, 3.6,  8.2, 'artAdidasMarket', 'signAdidasMarket','marketWood', 'right');
    drawStallBlock( 7.3,   29.8, 3.6,  8.2, 'artNikeMarket',   'signNikeMarket',  'marketWood', 'left');
    drawStallBlock( 19.05, 26.0, 5.0, 10.6, 'artCoffeeSpices', 'signCoffeeSpices','marketWood', 'left');
  }

  // Dải 3 (Z: 38..56): Khu Mỹ Nghệ Tây, Đảo Lưu Niệm Trung Tâm & Đồ Khô Đông
  drawStallBlock(-19.05, 42.5, 5.0, 8.8, 'artGomSonMai',        'signGomSu',       'marketWood', 'right');
  drawStallBlock(-19.05, 52.1, 5.0, 7.6, 'artNonLaRack',        'signNonLa',       'marketWood', 'right');
  drawStallBlock(-9.0,   45.5, 4.8, 10.6,'artHandicraftRattan', 'signCuaTay',      'marketWood', 'right');
  drawStallBlock( 0.0,   46.0, 4.8, 7.8, 'artSaigonTees',       'signSaigonTees',  'marketWood', 'front');
  drawStallBlock( 9.0,   45.5, 4.8, 10.6,'artLienTeaShelves',   'signLienSaiGon',  'marketWood', 'left');
  drawStallBlock( 19.05, 42.5, 5.0, 8.8, 'artCoffeeSpices',     'signCuaDong',     'marketWood', 'left');
  drawStallBlock( 19.05, 52.1, 5.0, 7.6, 'artCoffeeSpices',     'signCoffeeSpices','marketWood', 'left');

  // Dải 4 (Z: 58..80): Đại Khu Ẩm Thực Toàn Bộ Món Ăn Việt Nam 2 Dãy Sầm Uất
  drawStallBlock(-9.15,  62.2, 4.5, 6.2, 'artPhoHuTieu',    'signPhoHuTieu',    'marketCeramicTile', 'right');
  drawStallBlock(-9.15,  71.7, 4.5, 7.2, 'artBunBoComTam',  'signBunBoComTam',  'marketCeramicTile', 'right');
  drawStallBlock(-19.05, 63.5, 5.0, 7.8, 'artBanhCuonWall', 'signBanhCuon50k',  'marketCeramicTile', 'right');
  drawStallBlock(-19.05, 73.0, 5.0, 7.8, 'artBanhBeoWall',  'signBanhBeo20k',   'marketWood',        'right');
  drawStallBlock( 9.15,  62.2, 4.5, 6.2, 'artBanhXeoBanhMi','signBanhXeoBanhMi','marketCeramicTile', 'left');
  drawStallBlock( 9.15,  71.7, 4.5, 7.2, 'artCheSinhTo',    'signCheSinhTo',    'marketCeramicTile', 'left');
  drawStallBlock( 19.05, 63.5, 5.0, 7.8, 'artCheSinhTo',    'signCheSinhTo',    'marketWood',        'left');
  drawStallBlock( 19.05, 73.0, 5.0, 7.8, 'artPhoHuTieu',    'signPhoHuTieu',    'marketCeramicTile', 'left');
  drawStallBlock( 0.0,   71.0, 4.2, 6.8, 'artBunBoComTam',  'signSap1044',      'marketCeramicTile', 'front');

  // Dải 5 (Z: 82..103): Khu Trái Cây Nhiệt Đới 3D Khổng Lồ, Hoa Tươi & Hải Sản Tươi Sống Cửa Bắc
  drawStallBlock(-8.5,   88.0, 5.8, 8.8, 'artTropicalFruits','signNgocHao1029',  'marketWood', 'right');
  drawStallBlock( 8.5,   88.0, 5.8, 8.8, 'artTropicalFruits','signNgocHao1029',  'marketWood', 'left');
  drawStallBlock(-19.05, 88.5, 5.0, 9.6, 'artFreshFlowers',  'signFreshFlowers', 'marketWood', 'right');
  drawStallBlock( 19.05, 88.5, 5.0, 9.6, 'artWetSeafood',    'signWetSeafood',   'marketCeramicTile', 'left');
  drawStallBlock(-19.05, 98.5, 5.0, 6.8, 'artWetSeafood',    'signWetSeafood',   'marketCeramicTile', 'right');
  drawStallBlock(-8.85,  98.7, 5.2, 6.2, 'artFruitDisplay',  'signNgocHao1029',  'marketWood', 'right');
  drawStallBlock( 8.85,  98.7, 5.2, 6.2, 'artCheSinhTo',     'signCheSinhTo',    'marketWood', 'left');
  drawStallBlock( 19.05, 98.5, 5.0, 6.8, 'artFreshFlowers',  'signFreshFlowers', 'marketWood', 'left');

  if (nearCam(-8.5, 88.0)) {
    var tCols = [[0.65, 0.42, 0.06, 1], [0.50, 0.14, 0.68, 1], [0.88, 0.12, 0.18, 1], [0.98, 0.80, 0.08, 1], [0.16, 0.72, 0.32, 1]];
    for (var tfi = 0; tfi < 5; tfi++) {
      dm('sphere', 'white', -9.8 + tfi * 0.65, 1.08, 87.5, 0, 0, 0, 0.30, 0.26, 0.30, { tint: tCols[tfi] });
    }
  }

  // 10 Ghế đẩu inox & món ăn khi ngồi
  for (var si = 0; si < st.stools.length; si++) {
    var sl = st.stools[si];
    if (!nearCam(sl.x, sl.z, 28)) continue;
    dm('cyl', 'white', sl.x, 0.24, sl.z, 0, 0, 0, 0.24, 0.48, 0.24, { tint: [0.64, 0.70, 0.78, 1], specPow: 80 });
    dm('cyl', 'white', sl.x, 0.49, sl.z, 0, 0, 0, 0.40, 0.05, 0.40, { tint: [0.90, 0.93, 0.96, 1], specPow: 96 });
  }
  if (st.pig.seated && st.pig.eating) {
    var dCol = st.pig.activeDish === 'che' ? [0.96, 0.35, 0.58, 1] : [0.92, 0.62, 0.18, 1];
    dm('cup', 'white', st.pig.x, 1.06, st.pig.z + (st.pig.z < 24 ? 0.65 : 0), 0, 0, 0, 0.26, 0.14, 0.26, { tint: [0.99, 0.99, 0.98, 1] });
    dm('cyl', 'white', st.pig.x, 1.12, st.pig.z + (st.pig.z < 24 ? 0.65 : 0), 0, 0, 0, 0.22, 0.02, 0.22, { tint: dCol });
  }

  // Đèn & Quạt Trần (distance culled 34m)
  for (var zL = 8.0; zL <= 100.0; zL += 16.0) {
    if (!inRangeZ(zL - 6, zL + 6, 34)) continue;
    drawMarketHangingLampWebgl(wgl, -3.5, zL, [0.96, 0.62, 0.08, 1]);
    drawMarketHangingLampWebgl(wgl,  3.5, zL, [0.96, 0.62, 0.08, 1]);
    drawMarketCeilingFanWebgl(wgl, 0, zL, st.t, zL * 0.1);
  }

  /* ---------------- D. 56 NPC CHEN CHÚC TẤP NẬP (DISTANCE CULLING 30M) & CHÚ HEO 24×20 ---------------- */
  if (st.npcs && typeof drawHumanBillboardWebgl === 'function') {
    for (var npi = 0; npi < st.npcs.length; npi++) {
      var npc = st.npcs[npi];
      if (!nearCam(npc.x, npc.z, 30.0)) continue;
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
  drawPoly3D(ctx, cam, [[-6, 3.85, 0], [6, 3.85, 0], [6, 3.85, 14.8], [-6, 3.85, 14.8]], '#6B4423', '#2B180E', 1);
  drawPoly3D(ctx, cam, [[-1.6, 3.83, 1.2], [1.6, 3.83, 1.2], [1.6, 3.83, 13.6], [-1.6, 3.83, 13.6]], '#FEF3C7', '#D97706', 1.2);
  drawPoly3D(ctx, cam, [[-6, 0, 0], [-6, 0, 14.8], [-6, 3.85, 14.8], [-6, 3.85, 0]], '#E5B85B', '#5C341D', 1);
  drawPoly3D(ctx, cam, [[6, 0, 14.8], [6, 0, 0], [6, 3.85, 0], [6, 3.85, 14.8]], '#DBA94E', '#5C341D', 1);
  drawPoly3D(ctx, cam, [[-6, 0, 14.8], [6, 0, 14.8], [6, 3.85, 14.8], [-6, 3.85, 14.8]], '#D29E44', '#5C341D', 1);
  drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 3.85, 0], [-6, 3.85, 0]], '#DBA94E', '#5C341D', 1);

  if (typeof drawMarketRoomWalls3D === 'function') drawMarketRoomWalls3D(ctx, cam, room);
  if (typeof drawLanternGlow3D === 'function') {
    drawLanternGlow3D(ctx, cam, -2.4, 3.02, 4.2, '#F59E0B', '#FDE68A', 0.21, 3.85);
    drawLanternGlow3D(ctx, cam,  2.4, 3.02, 4.2, '#F59E0B', '#FDE68A', 0.21, 3.85);
  }
  if (typeof drawCeilingFan3D === 'function') drawCeilingFan3D(ctx, cam, 0, 3.42, 5.2, st.t, 0.2);

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
