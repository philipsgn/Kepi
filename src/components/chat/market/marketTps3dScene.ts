/**
 * Chợ Bến Thành Sài Gòn 1914 — Đại Sảnh Ô Bàn Cờ 36m × 36m, 4 Cửa Đông–Tây–Nam–Bắc (QĐ 250–259)
 * - Kiến trúc thật 100%: Nhà lồng chữ thập ô bàn cờ, mái vòm kèo thép xanh rêu cao 7.2m + cửa gió lá sách louvers
 *   & giếng trời lấy sáng tự nhiên (Chế độ A kín 100%, 0% hở void).
 * - 4 Cửa Đông – Tây – Nam – Bắc nối thông suốt:
 *   + Cửa Nam (Cửa Số 1, Z = 0): Thời trang (Adidas 3 Sọc, Nike Swoosh, Giày Sneaker & Dép, Túi Xách/Vali/Đồng Hồ,
 *     Áo thun "I ♥ SAIGON", Vải Lụa & Áo Dài Hương Trinh 415).
 *   + Cửa Tây (X = -18): Gốm Sứ Bát Tràng & Sơn Mài, Nón Lá & Đèn Lồng, Mây Tre Đan & Tượng Gỗ.
 *   + Cửa Đông (X = +18): Đặc Sản Liên Sài Gòn 823, Cà Phê Chồn & Phin, Trái Cây Sấy/Hạt Điều, Hải Sản Khô/Nước Mắm/Tiêu.
 *   + Cửa Bắc (Z = 36) & Trung tâm Bắc: Toàn bộ món ăn VN (Phở, Hủ Tiếu, Bún Bò Huế, Bún Mắm, Cơm Tấm, Bánh Xèo,
 *     Gỏi Cuốn, Bánh Mì, Bánh Cuốn 50K, Bánh Bèo 20K, Sạp 1044, Chè 3 Miền, Sinh Tố/Nước Mía/Dừa Xiêm),
 *     Trái Cây 3D đủ loại (1029 Ngọc Hảo + Cửa Bắc: Sầu riêng, Măng cụt, Chôm chôm, Xoài, Thanh long, Vú sữa, Mít, Bưởi, Chuối),
 *     Hoa Tươi & Hải Sản/Thịt/Rau Tươi Sống.
 * - Tối ưu 60fps: 12 NPCs gọn nhẹ + distance culling 26m cho chi tiết nhỏ; di chuyển trượt cạnh chuẩn Quán Phở.
 */
export function buildMarketTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. ĐỒ THỊ KHÔNG GIAN Ô BÀN CỜ 36m × 36m (4 CỬA ĐÔNG-TÂY-NAM-BẮC) ==================== */
var MARKET_NAV_GRAPH = {
  wallMargin: 0.40,
  outerBounds: { minX: -18.0, maxX: 18.0, minZ: 0.0, maxZ: 36.0, minY: 0.45, maxY: 7.2 },
  zones: [
    { id: 'south_hall',  minX: -18.0, maxX: 18.0, minZ:  0.0, maxZ: 15.0, floorY: 0 },
    { id: 'food_court',  minX: -18.0, maxX: 18.0, minZ: 15.0, maxZ: 28.8, floorY: 0 },
    { id: 'fruit_craft', minX: -18.0, maxX: 18.0, minZ: 15.0, maxZ: 36.0, floorY: 0 }
  ],
  dividerWalls: [],
  camBoxes: [
    // Các đảo sạp trung tâm tránh camera xoay sát gây góc khuất
    { x1: -1.75, y1: 0, z1: 19.7, x2: 1.75, y2: 1.45, z2: 22.9 },  // Sạp 1044
    { x1:  9.95, y1: 0, z1: 18.8, x2: 13.25, y2: 1.45, z2: 22.0 }, // Đảo 1029 Ngọc Hảo
    { x1: -9.2,  y1: 0, z1: 3.5,  x2: -5.6, y2: 2.1, z2: 9.5 },    // Sạp Adidas
    { x1:  5.6,  y1: 0, z1: 3.5,  x2:  9.2, y2: 2.1, z2: 9.5 }     // Sạp Nike
  ],
  edges: []
};

var MARKET_ZONE_CENTERS = {
  south_hall:  { x:  0.0, y: 0, z:  6.5 },
  food_court:  { x:  0.0, y: 0, z: 18.2 },
  fruit_craft: { x: 11.6, y: 0, z: 17.6 },
  east_dry:    { x: 11.8, y: 0, z: 17.0 },
  west_craft:  { x: -11.8, y: 0, z: 17.0 }
};

function getMarketZoneAt(x, z) {
  if (z < 15.0) return 'south_hall';
  if (x >= 8.0 && z < 26.5) return 'fruit_craft';
  if (z >= 28.8) return 'fruit_craft';
  return 'food_court';
}

function createMarketStools() {
  // 6 ghế đẩu inox tương tác quanh Đảo Sạp 1044 & dãy bàn ăn khu Ẩm Thực
  return [
    { id: 0, floorY: 0, x: -1.15, y: 0, z: 19.15, lookX: -1.15, lookZ: 20.1, yaw: 0 },
    { id: 1, floorY: 0, x: -0.38, y: 0, z: 19.15, lookX: -0.38, lookZ: 20.1, yaw: 0 },
    { id: 2, floorY: 0, x:  0.38, y: 0, z: 19.15, lookX:  0.38, lookZ: 20.1, yaw: 0 },
    { id: 3, floorY: 0, x:  1.15, y: 0, z: 19.15, lookX:  1.15, lookZ: 20.1, yaw: 0 },
    { id: 4, floorY: 0, x: -2.45, y: 0, z: 26.80, lookX: -2.45, lookZ: 25.8, yaw: Math.PI },
    { id: 5, floorY: 0, x:  2.45, y: 0, z: 26.80, lookX:  2.45, lookZ: 25.8, yaw: Math.PI }
  ];
}

function createMarketNpcs() {
  // 12 NPC gọn nhẹ dàn đều 4 Cửa Đông–Tây–Nam–Bắc (tiểu thương, đầu bếp, du khách)
  return [
    // Khu Thời Trang & Thể Thao (Cửa Nam)
    { id: 'sh_w1', x: -12.6, y: 0, z: 6.5, yaw: -Math.PI * 0.5, role: 'waiter',   shirt: '#E11D48', hair: '#1C1917', moving: false, seated: false, phase: 0.2 },
    { id: 'sh_w2', x: -4.8,  y: 0, z: 6.5, yaw: -Math.PI * 0.5, role: 'waiter',   shirt: '#0F172A', hair: '#1C1917', moving: false, seated: false, phase: 0.6 },
    { id: 'sh_w3', x:  4.8,  y: 0, z: 6.5, yaw:  Math.PI * 0.5, role: 'waiter',   shirt: '#EA580C', hair: '#292524', moving: false, seated: false, phase: 1.1 },
    {
      id: 'sh_c2', x: 0.8, y: 0, z: 4.5, yaw: 0, role: 'customer', shirt: '#2563EB', hair: '#451A03',
      moving: true, seated: false, phase: 2.0, stepIdx: 0,
      pts: [{ x: 0.8, z: 3.5 }, { x: 0.8, z: 16.5 }, { x: -11.0, z: 16.5 }, { x: 0.8, z: 16.5 }]
    },
    // Khu Ẩm Thực (Trung Tâm)
    { id: 'fc_chef',   x: -0.2, y: 0, z: 23.4, yaw: Math.PI,        role: 'chef',        shirt: '#FFFFFF', hair: '#1C1917', moving: false, seated: false, phase: 0.4, carryProp: 'bowl' },
    { id: 'fc_noodle', x: -3.7, y: 0, z: 21.8, yaw: -Math.PI * 0.5, role: 'chef_noodle', shirt: '#FFFFFF', hair: '#292524', moving: false, seated: false, phase: 1.2 },
    { id: 'fc_waiter', x:  3.7, y: 0, z: 21.8, yaw:  Math.PI * 0.5, role: 'waiter',      shirt: '#B45309', hair: '#1C1917', moving: false, seated: false, phase: 1.9, carryProp: 'tray' },
    { id: 'fc_c1',     x: -1.15,y: 0, z: 19.15,yaw: 0,              role: 'customer',    shirt: '#0284C7', hair: '#1C1917', moving: false, seated: true,  eating: true, phase: 0.7 },
    {
      id: 'fc_c2', x: 3.2, y: 0, z: 17.2, yaw: Math.PI * 0.5, role: 'customer', shirt: '#E11D48', hair: '#451A03',
      moving: true, seated: false, phase: 2.3, stepIdx: 0,
      pts: [{ x: 3.2, z: 17.2 }, { x: 11.4, z: 17.2 }, { x: 11.4, z: 23.8 }, { x: 3.2, z: 23.8 }]
    },
    // Khu Trái Cây (Cửa Bắc) & Đồ Khô (Cửa Đông) & Mỹ Nghệ (Cửa Tây)
    { id: 'fr_w1', x: 11.6, y: 0, z: 18.0, yaw: 0,               role: 'waiter',   shirt: '#16A34A', hair: '#1C1917', moving: false, seated: false, phase: 0.5 },
    { id: 'fr_w2', x: 12.6, y: 0, z: 6.4,  yaw: -Math.PI * 0.5,  role: 'waiter',   shirt: '#15803D', hair: '#292524', moving: false, seated: false, phase: 1.5 },
    {
      id: 'ws_c1', x: -11.2, y: 0, z: 22.4, yaw: 0, role: 'customer', shirt: '#D97706', hair: '#1C1917',
      moving: true, seated: false, phase: 2.4, stepIdx: 0,
      pts: [{ x: -11.2, z: 18.0 }, { x: -11.2, z: 29.0 }, { x: -2.0, z: 29.4 }, { x: -11.2, z: 29.0 }]
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
      eating: false, activeDish: 'banhcuon',
      wearingAoDai: false, outfit: 'none', boughtSamba: false,
      ateFood: false, boughtFruit: false,
      _stuckTimer: 0
    },
    stools: stools,
    npcs: npcs,
    southPeople: npcs.slice(0, 4),
    foodPeople: npcs.slice(4, 9),
    fruitPeople: npcs.slice(9, 12),
    southGateOpen: 0.0,
    northGateOpen: 0.0,
    eastGateOpen: 0.0,
    westGateOpen: 0.0,
    rightDoorOpen: 0.0,
    exitFade: 0,
    exiting: false,
    onZoneChanged: null,
    ripples: [],
    toast: 'Chợ Bến Thành 1914 · Ô bàn cờ 4 Cửa Đông-Tây-Nam-Bắc! Tự do dạo sạp Adidas, Nike, Món Việt & Trái Cây 🏪',
    toastUntil: 5.0,
    t: 0
  };
}

var MARKET_STALL_AABBS = [
  // Cửa Nam & Tây Nam (Thời trang, Thể thao, Giày, Túi xách, Vải Áo Dài)
  { id: 'ao_dai_huong_trinh', x1: -16.6, z1:  2.5, x2: -13.4, z2: 11.5 }, // Hương Trinh 415
  { id: 'saigon_tees',        x1: -16.6, z1: 12.4, x2: -13.4, z2: 14.8 }, // Áo "I ♥ SAIGON"
  { id: 'adidas_stall',       x1:  -9.2, z1:  3.5, x2:  -5.6, z2:  9.5 }, // Adidas 3 Sọc 208
  { id: 'shoes_bags_west',    x1:  -9.2, z1: 10.6, x2:  -5.6, z2: 13.8 }, // Giày Sneaker & Dép 306
  { id: 'nike_stall',         x1:   5.6, z1:  3.5, x2:   9.2, z2:  9.5 }, // Nike Swoosh 212
  { id: 'bags_watches_east',  x1:   5.6, z1: 10.6, x2:   9.2, z2: 13.8 }, // Túi Xách, Vali, Đồng Hồ
  // Cửa Đông (Đồ khô, Cà phê, Gia vị)
  { id: 'lien_sai_gon_823',   x1:  13.4, z1:  2.8, x2:  16.6, z2:  9.6 }, // Liên Sài Gòn 823
  { id: 'coffee_chon_stall',  x1:  13.4, z1: 10.8, x2:  16.6, z2: 14.6 }, // Cà phê & Phin
  { id: 'dried_fruits_stall', x1:  13.4, z1: 20.4, x2:  16.6, z2: 25.0 }, // Mứt dẻo & Hạt điều
  { id: 'seafood_dry_spices', x1:  13.4, z1: 26.2, x2:  16.6, z2: 30.8 }, // Mực khô, Tôm khô, Tiêu Phú Quốc
  // Khu Ẩm Thực Trung Tâm (Sạp 1044 & đủ món Việt)
  { id: 'sap_1044',           x1:  -1.75, z1: 19.7, x2:  1.75, z2: 22.9 }, // Sạp 1044 trung tâm
  { id: 'banh_cuon_50k',      x1:  -6.6,  z1: 19.8, x2: -4.4,  z2: 24.2 }, // Bánh Cuốn 50K
  { id: 'banh_beo_20k',       x1:   4.4,  z1: 19.8, x2:  6.6,  z2: 24.2 }, // Bánh Bèo 20K
  { id: 'pho_hutieu_stall',   x1: -10.0,  z1: 25.6, x2: -7.2,  z2: 28.6 }, // Phở & Hủ Tiếu
  { id: 'bunbo_comtam_stall', x1:  -4.4,  z1: 25.6, x2: -1.2,  z2: 28.6 }, // Bún Bò Huế & Cơm Tấm
  { id: 'banhxeo_banhmi',     x1:   1.2,  z1: 25.6, x2:  4.4,  z2: 28.6 }, // Bánh Xèo, Gỏi Cuốn & Bánh Mì
  { id: 'che_sinhto_stall',   x1:   5.4,  z1: 25.6, x2:  8.6,  z2: 28.6 }, // Chè 3 Miền & Sinh Tố/Nước Mía
  // Cửa Tây (Thủ công mỹ nghệ, Gốm Bát Tràng, Nón Lá, Mây tre)
  { id: 'gom_su_son_mai',     x1: -16.6, z1: 20.2, x2: -13.4, z2: 25.0 }, // Gốm Sứ & Sơn Mài
  { id: 'non_la_lantern',     x1: -16.6, z1: 26.2, x2: -13.4, z2: 31.0 }, // Nón Lá & Đèn Lồng
  { id: 'rattan_wood_craft',  x1: -10.0, z1: 20.2, x2:  -7.2, z2: 24.4 }, // Mây Tre Đan & Tượng Gỗ
  // Khu Trái Cây Nhiệt Đới, Hoa Tươi & Hải Sản Tươi Sống (Cửa Bắc + Cánh Đông)
  { id: 'ngoc_hao_1029',      x1:   9.95, z1: 18.8, x2: 13.25, z2: 22.0 }, // Đảo 1029 Ngọc Hảo
  { id: 'tropical_fruits_n',  x1:  -7.4,  z1: 30.6, x2:  -3.2, z2: 33.8 }, // Sầu riêng, Măng cụt, Chôm chôm, Vú sữa
  { id: 'fresh_flowers_n',    x1:   3.2,  z1: 30.6, x2:   7.4, z2: 33.8 }, // Hoa Tươi Cửa Bắc
  { id: 'wet_seafood_n',      x1:   8.4,  z1: 30.6, x2:  12.6, z2: 33.8 }  // Hải Sản Tươi Sống, Thịt & Rau
];

function clampMarketWalkPos(st, x, z) {
  var nx = Math.max(-17.45, Math.min(17.45, x));
  var nz = Math.max(0.65, Math.min(35.35, z));
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
  for (var iter = 0; iter < 6; iter++) {
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
      if (cp.x < -17.3 || cp.x > 17.3 || cp.z < 0.8 || cp.z > 35.2) continue;
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

  // Bước 1: giữ hành vi rẽ ngang Sạp 1044 / 1029 Ngọc Hảo; Bước 2: vòng tránh mọi quầy sạp 36m × 36m
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
            st.toast = 'Sạp 1044: Đủ Phở, Bún Bò Huế, Cơm Tấm, Bánh Xèo, Bánh Cuốn 50K, Chè & Dừa Xiêm! 🍜🥞';
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
          st.toast = 'Cửa Đông · Liên Sài Gòn 823: Cà phê Chồn, Trà Sen, Hạt Điều, Tiêu & Nước Mắm Phú Quốc! ☕📦';
          st.toastUntil = st.t + 4.2;
        } else if (p.pendingAction === 'buy_craft') {
          p.boughtSamba = true;
          st.toast = 'Cửa Tây Mỹ Nghệ: Gốm Bát Tràng, Sơn Mài, Nón Lá Bài Thơ & Mây Tre Đan! 🏺👒';
          st.toastUntil = st.t + 4.2;
        } else if (p.pendingAction === 'buy_seafood_flower') {
          p.boughtSamba = true;
          st.toast = 'Cửa Bắc Tươi Sống: Tôm Sú, Cua Ghẹ, Hoa Sen & Hoa Cúc Tươi Rực Rỡ! 🦞💐';
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

  // Cổng sắt xếp cả 4 Cửa Đông – Tây – Nam – Bắc mở mượt khi rời chợ
  st.southGateOpen += (((st.exiting && p.z < 5.0) ? 0.92 : 0.0) - st.southGateOpen) * Math.min(1, dt * 6.0);
  st.northGateOpen += (((st.exiting && p.z > 31.0) ? 0.92 : 0.0) - st.northGateOpen) * Math.min(1, dt * 6.0);
  st.eastGateOpen  += (((st.exiting && p.x > 13.0) ? 0.92 : 0.0) - st.eastGateOpen)  * Math.min(1, dt * 6.0);
  st.westGateOpen  += (((st.exiting && p.x < -13.0) ? 0.92 : 0.0) - st.westGateOpen) * Math.min(1, dt * 6.0);
  st.rightDoorOpen = st.southGateOpen;
  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.2);

  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== 2. RAYCAST 3D TƯƠNG TÁC MỌI SẠP HÀNG & 4 CỬA (QĐ 259) ==================== */
function rayMarketSphere(ox, oy, oz, dx, dy, dz, cx, cy, cz, rad) {
  var ocx = cx - ox, ocy = cy - oy, ocz = cz - oz;
  var proj = ocx * dx + ocy * dy + ocz * dz;
  if (proj < 0.2 || proj > 38) return -1;
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

  // 1. Ghế đẩu inox tại Food Court
  if (st.stools) {
    var bestS = null, bestT = 999;
    for (var i = 0; i < st.stools.length; i++) {
      var sl = st.stools[i];
      var ht = rayMarketSphere(ox, oy, oz, dx, dy, dz, sl.x, 0.32, sl.z, 0.55);
      if (ht > 0 && ht < bestT) { bestT = ht; bestS = sl; }
    }
    if (bestS) return { kind: 'stool', stool: bestS, x: bestS.x, y: 0, z: bestS.z };
  }

  // 2. Các sạp hàng tương tác toàn Chợ (tìm theo khoảng cách tia gần nhất!)
  var spots = [
    // Cửa Nam Thời Trang & Thể Thao
    { cx: -15.0, cy: 1.0, cz: 7.0,  r: 2.2, tgt: { kind: 'aodai',         x: -12.6, y: 0, z: 7.0 } },
    { cx:  -7.4, cy: 1.0, cz: 6.5,  r: 2.0, tgt: { kind: 'try_adidas',    x:  -4.8, y: 0, z: 6.5 } },
    { cx:   7.4, cy: 1.0, cz: 6.5,  r: 2.0, tgt: { kind: 'try_nike',      x:   4.8, y: 0, z: 6.5 } },
    { cx:  -7.4, cy: 0.9, cz: 12.2, r: 1.8, tgt: { kind: 'buy_shoes',     x:  -4.8, y: 0, z: 12.2 } },
    { cx:   7.4, cy: 0.9, cz: 12.2, r: 1.8, tgt: { kind: 'buy_shoes',     x:   4.8, y: 0, z: 12.2 } },
    // Ẩm Thực VN & Sạp 1044
    { cx:   0.0, cy: 0.9, cz: 21.3, r: 2.0, tgt: { kind: 'food',          x: -0.38, y: 0, z: 19.15, stoolId: 1, dish: 'banhcuon' } },
    { cx:  -5.5, cy: 0.9, cz: 22.0, r: 1.9, tgt: { kind: 'food',          x: -2.45, y: 0, z: 26.80, stoolId: 4, dish: 'pho' } },
    { cx:  -2.8, cy: 0.9, cz: 27.1, r: 1.8, tgt: { kind: 'food',          x: -2.45, y: 0, z: 26.80, stoolId: 4, dish: 'bunbo' } },
    { cx:   2.8, cy: 0.9, cz: 27.1, r: 1.8, tgt: { kind: 'food',          x:  2.45, y: 0, z: 26.80, stoolId: 5, dish: 'banhxeo' } },
    { cx:   7.0, cy: 0.9, cz: 27.1, r: 1.8, tgt: { kind: 'food',          x:  2.45, y: 0, z: 26.80, stoolId: 5, dish: 'che' } },
    // Trái Cây, Hoa, Hải Sản, Đồ Khô, Mỹ Nghệ
    { cx:  11.6, cy: 0.9, cz: 20.4, r: 2.0, tgt: { kind: 'fruit',         x: 11.6,  y: 0, z: 18.0 } },
    { cx:  -5.3, cy: 1.0, cz: 32.2, r: 2.0, tgt: { kind: 'fruit',         x: -5.3,  y: 0, z: 29.8 } },
    { cx:   5.3, cy: 1.0, cz: 32.2, r: 1.9, tgt: { kind: 'buy_fresh',     x:  5.3,  y: 0, z: 29.8 } },
    { cx:  10.5, cy: 1.0, cz: 32.2, r: 1.9, tgt: { kind: 'buy_fresh',     x: 10.5,  y: 0, z: 29.8 } },
    { cx:  15.0, cy: 1.0, cz: 6.2,  r: 2.2, tgt: { kind: 'buy_coffee',    x: 12.6,  y: 0, z: 6.2 } },
    { cx:  15.0, cy: 1.0, cz: 24.0, r: 2.2, tgt: { kind: 'buy_coffee',    x: 12.6,  y: 0, z: 24.0 } },
    { cx: -15.0, cy: 1.0, cz: 24.0, r: 2.2, tgt: { kind: 'buy_craft',     x: -12.6, y: 0, z: 24.0 } },
    // 4 Cửa Đông – Tây – Nam – Bắc (rời Chợ)
    { cx:   0.0, cy: 1.4, cz:  0.1, r: 1.8, tgt: { kind: 'exit',          x:  0.0,  y: 0, z: 1.2 } },
    { cx:   0.0, cy: 1.4, cz: 35.9, r: 1.8, tgt: { kind: 'exit',          x:  0.0,  y: 0, z: 34.8 } },
    { cx:  17.9, cy: 1.4, cz: 17.0, r: 1.8, tgt: { kind: 'exit',          x: 16.8,  y: 0, z: 17.0 } },
    { cx: -17.9, cy: 1.4, cz: 17.0, r: 1.8, tgt: { kind: 'exit',          x: -16.8, y: 0, z: 17.0 } }
  ];
  var bestSpot = null, bestSpotT = 999;
  for (var si = 0; si < spots.length; si++) {
    var sp = spots[si];
    var ts = rayMarketSphere(ox, oy, oz, dx, dy, dz, sp.cx, sp.cy, sp.cz, sp.r);
    if (ts > 0 && ts < bestSpotT) { bestSpotT = ts; bestSpot = sp.tgt; }
  }
  if (bestSpot) return bestSpot;

  // 3. Chạm Sàn 3D ở bất kỳ ô nào trong Chợ 36m × 36m
  if (dy < -0.025) {
    var tFloor = -oy / dy;
    if (tFloor > 0.2 && tFloor < 42) {
      var fx = ox + dx * tFloor, fz = oz + dz * tFloor;
      if (fx >= -18.0 && fx <= 18.0 && fz >= 0.0 && fz <= 36.0) {
        var cl = clampMarketWalkPos(st, fx, fz);
        return { kind: 'floor', x: cl.x, y: 0, z: cl.z };
      }
    }
  }
  return null;
}

/* ==================== 3. RENDER WEBGL 3D CHỢ BẾN THÀNH 1914 (36m × 36m, 4 CỬA, ĐỦ MỌI MẶT HÀNG) ==================== */
var MARKET_ATMO = {
  clearColor: [0.22, 0.14, 0.08, 1.0],
  hemiLow: [0.38, 0.30, 0.20],
  hemiHigh: [0.80, 0.72, 0.54],
  sunDir: [0.24, 0.88, -0.40],
  sunCol: [1.10, 0.94, 0.68],
  wrapBias: 0.48,
  outdoorRect: [0.0, 0.0, 0.0, 0.0],
  fogCol: [0.34, 0.25, 0.16],
  fogParams: [22.0, 48.0, 0.34]
};

function drawMarketHangingLampWebgl(wgl, x, z, col) {
  var dm = wgl.drawMesh;
  dm('cyl', 'white', x, 5.4, z, 0, 0, 0, 0.03, 3.4, 0.03, { tint: [0.16, 0.12, 0.08, 1] });
  dm('cone', 'white', x, 3.75, z, 0, 0, 0, 0.56, 0.22, 0.56, { tint: col });
  dm('sphere', 'white', x, 3.62, z, 0, 0, 0, 0.16, 0.16, 0.16, { tint: [1.0, 0.90, 0.50, 1], emissive: 1.5 });
}

function drawMarketCeilingFanWebgl(wgl, x, z, t, phase) {
  var dm = wgl.drawMesh;
  dm('cyl', 'white', x, 5.9, z, 0, 0, 0, 0.06, 2.2, 0.06, { tint: [0.20, 0.22, 0.26, 1] });
  dm('cyl', 'white', x, 4.82, z, 0, 0, 0, 0.32, 0.10, 0.32, { tint: [0.28, 0.32, 0.38, 1] });
  var base = t * 5.6 + (phase || 0);
  for (var i = 0; i < 3; i++) {
    var a = base + (i * Math.PI * 2) / 3;
    dm('box', 'white', x + Math.sin(a) * 0.62, 4.80, z + Math.cos(a) * 0.62, 0, a, 0, 0.18, 0.025, 1.12, { tint: [0.46, 0.52, 0.60, 1] });
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
      { pos: [0.0,  5.5,  8.0],  col: [1.08, 0.86, 0.52] },
      { pos: [0.0,  5.5, 22.0],  col: [1.14, 0.88, 0.50] },
      { pos: [-11.0,5.5, 18.0],  col: [1.05, 0.86, 0.50] },
      { pos: [11.0, 5.5, 18.0],  col: [1.05, 0.86, 0.50] }
    ]
  };
  wgl.beginFrame(W, H, cam, atmo);
  var dm = wgl.drawMesh;

  // Distance Culling 26m giữ mượt 60fps cho props nhỏ trong đại sảnh 36m × 36m
  function nearCam(wx, wz, rad) {
    return Math.hypot(wx - cam.pos.x, wz - cam.pos.z) <= (rad || 26.0);
  }

  /* ---------------- A. NỀN Ô BÀN CỜ, ĐẠI SẢNH CHỮ THẬP & MÁI VÒM KÈO THÉP + LOUVERS 1914 ---------------- */
  dm('box', 'marketTileSouth',  -9.0, -0.05,  9.0, 0, 0, 0, 18.0, 0.10, 18.0, { tint: [1,1,1,1], us: 6, vs: 6 });
  dm('box', 'marketTileSouth',   9.0, -0.05,  9.0, 0, 0, 0, 18.0, 0.10, 18.0, { tint: [1,1,1,1], us: 6, vs: 6 });
  dm('box', 'marketTileFood',   -9.0, -0.05, 27.0, 0, 0, 0, 18.0, 0.10, 18.0, { tint: [1,1,1,1], us: 6, vs: 6 });
  dm('box', 'marketTileFruit',   9.0, -0.05, 27.0, 0, 0, 0, 18.0, 0.10, 18.0, { tint: [1,1,1,1], us: 6, vs: 6 });
  // Trục hành lang chữ thập đỏ đất dẫn lối thẳng giữa 4 Cửa Đông–Tây–Nam–Bắc
  dm('box', 'white', 0.0, 0.008, 18.0, 0, 0, 0, 4.2, 0.012, 35.6, { tint: [0.56, 0.11, 0.15, 1] });
  dm('box', 'white', 0.0, 0.009, 17.0, 0, 0, 0, 35.6, 0.012, 4.0, { tint: [0.56, 0.11, 0.15, 1] });

  // Mái lồng chợ 1914 cao 7.2m + 2 trục giếng trời & hàng cửa gió lá sách louvers trên cao
  dm('box', 'marketRoofPanel', 0.0, 7.28, 18.0, 0, 0, 0, 36.2, 0.18, 36.2, { tint: [1,1,1,1], us: 10, vs: 10 });
  dm('quad', 'marketSkylight', 0.0, 7.16, 18.0, Math.PI * 0.5, 0, 0, 4.2, 34.4, 1, { tint: [1,1,1,1], emissive: 1.0, us: 1, vs: 8 });
  dm('quad', 'marketSkylight', 0.0, 7.14, 17.0, Math.PI * 0.5, 0, Math.PI * 0.5, 4.0, 34.4, 1, { tint: [1,1,1,1], emissive: 1.0, us: 1, vs: 8 });
  for (var tr = 4.0; tr <= 32.0; tr += 5.6) {
    dm('box', 'white', 0.0, 6.72, tr, 0, 0, 0, 35.6, 0.22, 0.24, { tint: [0.22, 0.34, 0.26, 1] });
    dm('quad', 'marketLouvers', -9.0, 6.45, tr, 0, 0, 0, 8.0, 0.72, 1, { tint: [1,1,1,1], emissive: 0.55 });
    dm('quad', 'marketLouvers',  9.0, 6.45, tr, 0, 0, 0, 8.0, 0.72, 1, { tint: [1,1,1,1], emissive: 0.55 });
  }
  // Cột thép xanh rêu nâng kèo dọc 2 bên trục hành lang trung tâm
  var colXs = [-11.5, -3.5, 3.5, 11.5];
  var colZs = [3.5, 14.2, 19.6, 29.2];
  for (var cxi = 0; cxi < colXs.length; cxi++) {
    for (var czi = 0; czi < colZs.length; czi++) {
      dm('box', 'white', colXs[cxi], 3.45, colZs[czi], 0, 0, 0, 0.32, 6.9, 0.32, { tint: [0.20, 0.32, 0.24, 1] });
    }
  }

  /* ---------------- B. 4 BỨC TƯỜNG BAO & 4 CỬA ĐÔNG–TÂY–NAM–BẮC (KÈM BIỂN TÊN & CỔNG SẮT) ---------------- */
  // Tường Nam (Z = 0, mở Cửa Số 1 X ∈ [-2.2, 2.2])
  dm('box', 'marketWallGold', -10.1, 3.6, -0.08, 0, 0, 0, 15.8, 7.2, 0.16, { tint: [1,1,1,1], us: 5, vs: 2.5 });
  dm('box', 'marketWallGold',  10.1, 3.6, -0.08, 0, 0, 0, 15.8, 7.2, 0.16, { tint: [1,1,1,1], us: 5, vs: 2.5 });
  dm('box', 'marketWallGold',   0.0, 5.4, -0.08, 0, 0, 0,  4.4, 3.6, 0.16, { tint: [1,1,1,1], us: 1.5, vs: 1.5 });
  dm('quad', 'white', 0.0, 1.8, -0.18, 0, 0, 0, 4.4, 3.6, 1, { tint: [0.96, 0.88, 0.68, 1], emissive: 0.72 });
  dm('quad', 'marketIronGate', -1.65, 1.75, 0.04, 0, 0, 0, 1.1, 3.5, 1, { tint: [1,1,1,1] });
  var sgA = st.southGateOpen * 1.15;
  dm('quad', 'marketIronGate', 2.2 - Math.cos(sgA) * 0.55, 1.75, 0.04 + Math.sin(sgA) * 0.55, 0, -sgA, 0, 1.1, 3.5, 1, { tint: [1,1,1,1] });
  dm('quad', 'signCuaSo1', 0.0, 4.05, 0.06, 0, 0, 0, 4.8, 1.05, 1, { tint: [1,1,1,1] });

  // Tường Bắc (Z = 36, mở Cửa Bắc X ∈ [-2.2, 2.2])
  dm('box', 'marketWallGold', -10.1, 3.6, 36.08, 0, 0, 0, 15.8, 7.2, 0.16, { tint: [1,1,1,1], us: 5, vs: 2.5 });
  dm('box', 'marketWallGold',  10.1, 3.6, 36.08, 0, 0, 0, 15.8, 7.2, 0.16, { tint: [1,1,1,1], us: 5, vs: 2.5 });
  dm('box', 'marketWallGold',   0.0, 5.4, 36.08, 0, 0, 0,  4.4, 3.6, 0.16, { tint: [1,1,1,1], us: 1.5, vs: 1.5 });
  dm('quad', 'white', 0.0, 1.8, 36.18, 0, Math.PI, 0, 4.4, 3.6, 1, { tint: [0.96, 0.88, 0.68, 1], emissive: 0.72 });
  dm('quad', 'marketIronGate', -1.65, 1.75, 35.96, 0, Math.PI, 0, 1.1, 3.5, 1, { tint: [1,1,1,1] });
  var ngA = st.northGateOpen * 1.15;
  dm('quad', 'marketIronGate', 2.2 - Math.cos(ngA) * 0.55, 1.75, 35.96 - Math.sin(ngA) * 0.55, 0, Math.PI + ngA, 0, 1.1, 3.5, 1, { tint: [1,1,1,1] });
  dm('quad', 'signCuaBac', 0.0, 4.05, 35.94, 0, Math.PI, 0, 5.2, 1.05, 1, { tint: [1,1,1,1] });

  // Tường Tây (X = -18, mở Cửa Tây Z ∈ [15.0, 19.0])
  dm('box', 'marketWallGold', -18.08, 3.6,  7.5, 0, 0, 0, 0.16, 7.2, 15.0, { tint: [1,1,1,1], us: 5, vs: 2.5 });
  dm('box', 'marketWallGold', -18.08, 3.6, 27.5, 0, 0, 0, 0.16, 7.2, 17.0, { tint: [1,1,1,1], us: 5, vs: 2.5 });
  dm('box', 'marketWallGold', -18.08, 5.4, 17.0, 0, 0, 0, 0.16, 3.6,  4.0, { tint: [1,1,1,1], us: 1.5, vs: 1.5 });
  dm('quad', 'white', -18.18, 1.8, 17.0, 0, Math.PI * 0.5, 0, 4.0, 3.6, 1, { tint: [0.96, 0.88, 0.68, 1], emissive: 0.72 });
  dm('quad', 'marketIronGate', -17.94, 1.75, 15.5, 0, Math.PI * 0.5, 0, 1.0, 3.5, 1, { tint: [1,1,1,1] });
  dm('quad', 'signCuaTay', -17.94, 4.05, 17.0, 0, Math.PI * 0.5, 0, 4.6, 1.05, 1, { tint: [1,1,1,1] });

  // Tường Đông (X = +18, mở Cửa Đông Z ∈ [15.0, 19.0])
  dm('box', 'marketWallGold',  18.08, 3.6,  7.5, 0, 0, 0, 0.16, 7.2, 15.0, { tint: [1,1,1,1], us: 5, vs: 2.5 });
  dm('box', 'marketWallGold',  18.08, 3.6, 27.5, 0, 0, 0, 0.16, 7.2, 17.0, { tint: [1,1,1,1], us: 5, vs: 2.5 });
  dm('box', 'marketWallGold',  18.08, 5.4, 17.0, 0, 0, 0, 0.16, 3.6,  4.0, { tint: [1,1,1,1], us: 1.5, vs: 1.5 });
  dm('quad', 'white',  18.18, 1.8, 17.0, 0, -Math.PI * 0.5, 0, 4.0, 3.6, 1, { tint: [0.96, 0.88, 0.68, 1], emissive: 0.72 });
  dm('quad', 'marketIronGate',  17.94, 1.75, 15.5, 0, -Math.PI * 0.5, 0, 1.0, 3.5, 1, { tint: [1,1,1,1] });
  dm('quad', 'signCuaDong', 17.94, 4.05, 17.0, 0, -Math.PI * 0.5, 0, 4.6, 1.05, 1, { tint: [1,1,1,1] });

  /* ---------------- C. KHU THỜI TRANG, THỂ THAO (ADIDAS, NIKE, GIÀY DÉP, TÚI) & ÁO DÀI (CỬA NAM) ---------------- */
  // 1. Sạp Vải Lụa Áo Dài Hương Trinh 415 ([-16.6..-13.4, 2.5..11.5]) & Áo "I ♥ SAIGON"
  dm('box', 'marketWood', -15.0, 0.44, 7.0, 0, 0, 0, 3.1, 0.88, 8.8, { tint: [1,1,1,1], us: 3, vs: 1 });
  dm('quad', 'signHuongTrinh', -15.0, 3.25, 7.0, 0, Math.PI * 0.5, 0, 7.2, 0.85, 1, { tint: [1,1,1,1] });
  dm('quad', 'artAoDaiFabric', -13.42, 1.75, 7.0, 0, Math.PI * 0.5, 0, 6.2, 1.75, 1, { tint: [1,1,1,1] });
  if (nearCam(-15.0, 7.0)) {
    var silkCols = [[0.88, 0.11, 0.28, 1], [0.98, 0.80, 0.08, 1], [0.06, 0.72, 0.50, 1], [0.15, 0.39, 0.92, 1]];
    for (var sc = 0; sc < 4; sc++) {
      dm('box', 'white', -14.1, 0.98, 3.8 + sc * 2.0, 0, 0, 0, 0.8, 0.22, 1.1, { tint: silkCols[sc] });
    }
  }
  dm('box', 'marketWood', -15.0, 0.44, 13.6, 0, 0, 0, 3.0, 0.88, 2.2, { tint: [0.75, 0.22, 0.32, 1] });
  dm('quad', 'signSaigonTees', -13.45, 2.8, 13.6, 0, Math.PI * 0.5, 0, 2.4, 0.65, 1, { tint: [1,1,1,1] });
  dm('quad', 'artSaigonTees',  -13.45, 1.55, 13.6, 0, Math.PI * 0.5, 0, 2.2, 1.45, 1, { tint: [1,1,1,1] });

  // 2. Sạp Quần Áo Adidas 3 Sọc 208 ([-9.2..-5.6, 3.5..9.5]) & Sạp Giày Sneaker/Dép 306 ([-9.2..-5.6, 10.6..13.8])
  dm('box', 'marketWood', -7.4, 0.44, 6.5, 0, 0, 0, 3.4, 0.88, 5.8, { tint: [0.18, 0.22, 0.28, 1] });
  dm('quad', 'signAdidasMarket', -5.66, 2.95, 6.5, 0, Math.PI * 0.5, 0, 5.2, 0.78, 1, { tint: [1,1,1,1] });
  dm('quad', 'artAdidasMarket',  -5.66, 1.72, 6.5, 0, Math.PI * 0.5, 0, 5.0, 1.60, 1, { tint: [1,1,1,1] });
  dm('quad', 'artAdidasMarket',  -9.14, 1.72, 6.5, 0, -Math.PI * 0.5, 0, 5.0, 1.60, 1, { tint: [1,1,1,1] });
  if (nearCam(-7.4, 6.5)) {
    dm('box', 'white', -6.8, 1.05, 4.8, 0, 0, 0, 0.6, 0.3, 0.8, { tint: [0.08, 0.10, 0.14, 1] });
    dm('box', 'white', -6.8, 1.05, 6.5, 0, 0, 0, 0.6, 0.3, 0.8, { tint: [0.15, 0.38, 0.86, 1] });
    dm('box', 'white', -6.8, 1.05, 8.2, 0, 0, 0, 0.6, 0.3, 0.8, { tint: [0.88, 0.16, 0.18, 1] });
  }
  dm('box', 'marketWood', -7.4, 0.44, 12.2, 0, 0, 0, 3.4, 0.88, 3.0, { tint: [0.55, 0.34, 0.20, 1] });
  dm('quad', 'signShoesBags', -5.66, 2.85, 12.2, 0, Math.PI * 0.5, 0, 2.8, 0.68, 1, { tint: [1,1,1,1] });
  dm('quad', 'artShoesBags',  -5.66, 1.62, 12.2, 0, Math.PI * 0.5, 0, 2.8, 1.50, 1, { tint: [1,1,1,1] });

  // 3. Sạp Quần Áo Nike Swoosh 212 ([5.6..9.2, 3.5..9.5]) & Sạp Túi Xách / Vali / Đồng Hồ ([5.6..9.2, 10.6..13.8])
  dm('box', 'marketWood', 7.4, 0.44, 6.5, 0, 0, 0, 3.4, 0.88, 5.8, { tint: [0.16, 0.18, 0.24, 1] });
  dm('quad', 'signNikeMarket', 5.56, 2.95, 6.5, 0, -Math.PI * 0.5, 0, 5.2, 0.78, 1, { tint: [1,1,1,1] });
  dm('quad', 'artNikeMarket',  5.56, 1.72, 6.5, 0, -Math.PI * 0.5, 0, 5.0, 1.60, 1, { tint: [1,1,1,1] });
  dm('quad', 'artNikeMarket',  9.24, 1.72, 6.5, 0,  Math.PI * 0.5, 0, 5.0, 1.60, 1, { tint: [1,1,1,1] });
  if (nearCam(7.4, 6.5)) {
    dm('box', 'white', 6.8, 1.05, 4.8, 0, 0, 0, 0.6, 0.3, 0.8, { tint: [0.92, 0.36, 0.08, 1] });
    dm('box', 'white', 6.8, 1.05, 6.5, 0, 0, 0, 0.6, 0.3, 0.8, { tint: [0.09, 0.11, 0.16, 1] });
    dm('box', 'white', 6.8, 1.05, 8.2, 0, 0, 0, 0.6, 0.3, 0.8, { tint: [0.96, 0.96, 0.98, 1] });
  }
  dm('box', 'marketWood', 7.4, 0.44, 12.2, 0, 0, 0, 3.4, 0.88, 3.0, { tint: [0.55, 0.34, 0.20, 1] });
  dm('quad', 'signShoesBags', 5.56, 2.85, 12.2, 0, -Math.PI * 0.5, 0, 2.8, 0.68, 1, { tint: [1,1,1,1] });
  dm('quad', 'artShoesBags',  5.56, 1.62, 12.2, 0, -Math.PI * 0.5, 0, 2.8, 1.50, 1, { tint: [1,1,1,1] });

  /* ---------------- D. KHU ĐỒ KHÔ, CÀ PHÊ, TRÀ & GIA VỊ (CỬA ĐÔNG: X = 13.4..16.6) ---------------- */
  dm('box', 'marketWood', 15.0, 0.44, 6.2, 0, 0, 0, 3.1, 0.88, 6.6, { tint: [1,1,1,1], us: 2, vs: 1 });
  dm('quad', 'signLienSaiGon',   13.42, 3.05, 6.2, 0, -Math.PI * 0.5, 0, 6.0, 0.78, 1, { tint: [1,1,1,1] });
  dm('quad', 'artLienTeaShelves',13.42, 1.75, 6.2, 0, -Math.PI * 0.5, 0, 5.6, 1.65, 1, { tint: [1,1,1,1] });
  dm('box', 'marketWood', 15.0, 0.44, 12.7, 0, 0, 0, 3.1, 0.88, 3.6, { tint: [0.45, 0.24, 0.12, 1] });
  dm('quad', 'signCoffeeSpices', 13.42, 2.95, 12.7, 0, -Math.PI * 0.5, 0, 3.4, 0.74, 1, { tint: [1,1,1,1] });
  dm('quad', 'artCoffeeSpices',  13.42, 1.72, 12.7, 0, -Math.PI * 0.5, 0, 3.2, 1.50, 1, { tint: [1,1,1,1] });
  dm('box', 'marketWood', 15.0, 0.44, 22.7, 0, 0, 0, 3.1, 0.88, 4.4, { tint: [0.65, 0.38, 0.16, 1] });
  dm('quad', 'artLienTeaShelves',13.42, 1.72, 22.7, 0, -Math.PI * 0.5, 0, 4.0, 1.50, 1, { tint: [1,1,1,1] });
  dm('box', 'marketWood', 15.0, 0.44, 28.5, 0, 0, 0, 3.1, 0.88, 4.4, { tint: [0.50, 0.28, 0.14, 1] });
  dm('quad', 'signCoffeeSpices', 13.42, 2.95, 28.5, 0, -Math.PI * 0.5, 0, 4.0, 0.74, 1, { tint: [1,1,1,1] });
  dm('quad', 'artCoffeeSpices',  13.42, 1.72, 28.5, 0, -Math.PI * 0.5, 0, 4.0, 1.50, 1, { tint: [1,1,1,1] });

  /* ---------------- E. KHU THỦ CÔNG MỸ NGHỆ, GỐM SỨ, NÓN LÁ & MÂY TRE (CỬA TÂY: X = -16.6..-7.2) ---------------- */
  dm('box', 'marketWood', -15.0, 0.44, 22.6, 0, 0, 0, 3.1, 0.88, 4.6, { tint: [1,1,1,1], us: 2, vs: 1 });
  dm('quad', 'signGomSu',    -13.42, 3.05, 22.6, 0, Math.PI * 0.5, 0, 4.4, 0.78, 1, { tint: [1,1,1,1] });
  dm('quad', 'artGomSonMai', -13.42, 1.72, 22.6, 0, Math.PI * 0.5, 0, 4.2, 1.55, 1, { tint: [1,1,1,1] });
  dm('box', 'marketWood', -15.0, 0.44, 28.6, 0, 0, 0, 3.1, 0.88, 4.6, { tint: [1,1,1,1], us: 2, vs: 1 });
  dm('quad', 'signNonLa',    -13.42, 3.05, 28.6, 0, Math.PI * 0.5, 0, 4.4, 0.78, 1, { tint: [1,1,1,1] });
  dm('quad', 'artNonLaRack', -13.42, 1.72, 28.6, 0, Math.PI * 0.5, 0, 4.2, 1.55, 1, { tint: [1,1,1,1] });
  dm('box', 'marketWood',  -8.6, 0.44, 22.3, 0, 0, 0, 2.6, 0.88, 4.0, { tint: [0.78, 0.52, 0.24, 1] });
  dm('quad', 'artHandicraftRattan', -7.25, 1.65, 22.3, 0, Math.PI * 0.5, 0, 3.6, 1.45, 1, { tint: [1,1,1,1] });

  /* ---------------- F. KHU ẨM THỰC TOÀN BỘ MÓN ĂN VIỆT NAM (SẠP 1044 + PHỞ, BÚN BÒ, CƠM TẤM, BÁNH XÈO, CHÈ...) ---------------- */
  // Đảo Sạp 1044 (X ∈ [-1.75, 1.75], Z ∈ [19.7, 22.9]) + Cổng vòm KHU ĂN UỐNG
  dm('quad', 'signKhuAnUong', 0.0, 3.85, 19.2, 0, 0, 0, 4.6, 0.92, 1, { tint: [1,1,1,1] });
  dm('box', 'marketCeramicTile', 0, 0.46, 21.3, 0, 0, 0, 3.4, 0.92, 3.0, { tint: [1,1,1,1], us: 2, vs: 1 });
  dm('box', 'white', 0, 0.96, 21.3, 0, 0, 0, 3.5, 0.08, 3.1, { tint: [0.88, 0.91, 0.94, 1], specPow: 64 });
  dm('quad', 'signSap1044', 0, 2.45, 22.95, 0, Math.PI, 0, 3.6, 1.10, 1, { tint: [1,1,1,1] });
  if (nearCam(0, 21.3)) {
    drawMarketPropPhoPotWebgl(wgl, -0.85, 1.0, 20.9);
    drawMarketPropPhoPotWebgl(wgl, -0.15, 1.0, 21.3);
    drawMarketPropCoconutClusterWebgl(wgl, 1.05, 1.0, 20.6);
    drawMarketPropBanhBeoTrayWebgl(wgl, 0.10, 1.0, 20.1);
    for (var bi = 0; bi < 4; bi++) {
      var bx = -1.15 + bi * 0.76;
      dm('cup', 'white', bx, 1.06, 19.95, 0, 0, 0, 0.24, 0.12, 0.24, { tint: [0.98, 0.98, 0.96, 1] });
      dm('cyl', 'white', bx, 1.11, 19.95, 0, 0, 0, 0.20, 0.02, 0.20, { tint: [0.88, 0.56, 0.18, 1] });
    }
  }
  // 6 Ghế đẩu inox tương tác
  for (var si = 0; si < st.stools.length; si++) {
    var sl = st.stools[si];
    dm('cyl', 'white', sl.x, 0.24, sl.z, 0, 0, 0, 0.24, 0.48, 0.24, { tint: [0.64, 0.70, 0.78, 1], specPow: 80 });
    dm('cyl', 'white', sl.x, 0.49, sl.z, 0, 0, 0, 0.40, 0.05, 0.40, { tint: [0.90, 0.93, 0.96, 1], specPow: 96 });
  }
  // Món ăn hiện trước mặt chú Heo khi ngồi ăn tại bất kỳ bàn inox nào
  if (st.pig.seated && st.pig.eating) {
    var dCol = st.pig.activeDish === 'che' ? [0.96, 0.35, 0.58, 1] : (st.pig.activeDish === 'bunbo' ? [0.86, 0.16, 0.14, 1] : [0.92, 0.62, 0.18, 1]);
    var dZ = st.pig.z < 23.0 ? 19.85 : 26.05;
    dm('cup', 'white', st.pig.x, 1.06, dZ, 0, 0, 0, 0.26, 0.14, 0.26, { tint: [0.99, 0.99, 0.98, 1] });
    dm('cyl', 'white', st.pig.x, 1.12, dZ, 0, 0, 0, 0.22, 0.02, 0.22, { tint: dCol });
  }

  // Bánh Cuốn Nóng 50K & Bánh Bèo Huế 20K
  dm('box', 'marketCeramicTile', -5.5, 0.44, 22.0, 0, 0, 0, 2.1, 0.88, 4.2, { tint: [1,1,1,1], us: 2, vs: 1 });
  dm('quad', 'signBanhCuon50k', -4.42, 2.75, 22.0, 0, Math.PI * 0.5, 0, 3.8, 0.68, 1, { tint: [1,1,1,1] });
  dm('quad', 'artBanhCuonWall', -4.42, 1.55, 22.0, 0, Math.PI * 0.5, 0, 3.6, 1.35, 1, { tint: [1,1,1,1] });
  dm('box', 'marketWood', 5.5, 0.44, 22.0, 0, 0, 0, 2.1, 0.88, 4.2, { tint: [0.95, 0.82, 0.58, 1] });
  dm('quad', 'signBanhBeo20k',  4.42, 2.75, 22.0, 0, -Math.PI * 0.5, 0, 3.8, 0.68, 1, { tint: [1,1,1,1] });
  dm('quad', 'artBanhBeoWall',  4.42, 1.55, 22.0, 0, -Math.PI * 0.5, 0, 3.6, 1.35, 1, { tint: [1,1,1,1] });

  // 4 Quầy Món Việt Nam đầy đủ (Phở/Hủ Tiếu, Bún Bò/Cơm Tấm, Bánh Xèo/Gỏi Cuốn/Bánh Mì, Chè 3 Miền/Sinh Tố)
  var foodStalls = [
    { x: -8.6, z: 27.1, w: 2.6, d: 2.8, sign: 'signPhoHuTieu',    art: 'artPhoHuTieu',    pot: true },
    { x: -2.8, z: 27.1, w: 3.0, d: 2.8, sign: 'signBunBoComTam',  art: 'artBunBoComTam',  pot: true },
    { x:  2.8, z: 27.1, w: 3.0, d: 2.8, sign: 'signBanhXeoBanhMi',art: 'artBanhXeoBanhMi',pot: false },
    { x:  7.0, z: 27.1, w: 3.0, d: 2.8, sign: 'signCheSinhTo',    art: 'artCheSinhTo',    pot: false }
  ];
  for (var fsi = 0; fsi < foodStalls.length; fsi++) {
    var fs = foodStalls[fsi];
    dm('box', 'marketCeramicTile', fs.x, 0.44, fs.z, 0, 0, 0, fs.w, 0.88, fs.d, { tint: [1,1,1,1], us: 2, vs: 1 });
    dm('quad', fs.sign, fs.x, 2.85, fs.z - fs.d * 0.5, 0, 0, 0, fs.w * 0.96, 0.68, 1, { tint: [1,1,1,1] });
    dm('quad', fs.art,  fs.x, 1.62, fs.z - fs.d * 0.5, 0, 0, 0, fs.w * 0.92, 1.32, 1, { tint: [1,1,1,1] });
    if (fs.pot && nearCam(fs.x, fs.z)) drawMarketPropPhoPotWebgl(wgl, fs.x, 0.88, fs.z);
  }

  /* ---------------- G. KHU TRÁI CÂY NHIỆT ĐỚI 3D, HOA TƯƠI & HẢI SẢN TƯƠI SỐNG (1029 NGỌC HẢO + CỬA BẮC) ---------------- */
  // Đảo Trái Cây 1029 Ngọc Hảo (giữ tọa độ [9.95..13.25, 18.8..22.0] tương thích Test 186 & 190)
  dm('box', 'marketWood', 11.6, 0.42, 20.4, 0, 0, 0, 3.2, 0.84, 3.0, { tint: [0.22, 0.58, 0.28, 1], us: 2, vs: 1 });
  dm('box', 'artFruitDisplay', 11.6, 0.94, 20.4, 0, 0, 0, 2.7, 0.20, 2.4, { tint: [1,1,1,1] });
  dm('quad', 'signNgocHao1029', 11.6, 2.65, 20.4, 0, 0, 0, 3.4, 0.72, 1, { tint: [1,1,1,1] });
  if (nearCam(11.6, 20.4)) {
    var fColors = [[0.98, 0.80, 0.08, 1], [0.88, 0.11, 0.28, 1], [0.13, 0.77, 0.37, 1], [0.63, 0.38, 0.05, 1]];
    for (var fi = 0; fi < 8; fi++) {
      dm('sphere', 'white', 10.55 + (fi % 4) * 0.68, 1.14, 19.65 + Math.floor(fi / 4) * 1.45, 0, 0, 0, 0.28, 0.24, 0.28, { tint: fColors[fi % 4] });
    }
    dm('box', 'white', 11.6, 1.18, 20.4, 0, 0, 0, 0.28, 0.28, 0.26, { tint: [0.08, 0.50, 0.22, 1] });
    dm('cyl', 'white', 11.6, 1.35, 20.4, 0, 0, 0, 0.36, 0.04, 0.36, { tint: [0.86, 0.90, 0.94, 1], specPow: 80 });
    drawMarketPropCoconutClusterWebgl(wgl, 10.65, 0.86, 19.25);
  }

  // Cụm Sạp Cửa Bắc: Trái Cây Nhiệt Đới Đủ Loại, Hoa Tươi & Hải Sản Tươi Sống
  dm('box', 'marketWood', -5.3, 0.44, 32.2, 0, 0, 0, 4.0, 0.88, 3.0, { tint: [0.22, 0.58, 0.28, 1] });
  dm('quad', 'signNgocHao1029', -5.3, 2.90, 30.68, 0, 0, 0, 3.8, 0.72, 1, { tint: [1,1,1,1] });
  dm('quad', 'artTropicalFruits', -5.3, 1.65, 30.68, 0, 0, 0, 3.8, 1.45, 1, { tint: [1,1,1,1] });
  if (nearCam(-5.3, 32.2)) {
    var tCols = [[0.65, 0.42, 0.06, 1], [0.50, 0.14, 0.68, 1], [0.88, 0.12, 0.18, 1], [0.98, 0.80, 0.08, 1], [0.16, 0.72, 0.32, 1]];
    for (var tfi = 0; tfi < 5; tfi++) {
      dm('sphere', 'white', -6.6 + tfi * 0.65, 1.08, 31.8, 0, 0, 0, 0.30, 0.26, 0.30, { tint: tCols[tfi] });
    }
  }
  dm('box', 'marketWood', 5.3, 0.44, 32.2, 0, 0, 0, 4.0, 0.88, 3.0, { tint: [0.55, 0.16, 0.36, 1] });
  dm('quad', 'signFreshFlowers', 5.3, 2.90, 30.68, 0, 0, 0, 3.8, 0.72, 1, { tint: [1,1,1,1] });
  dm('quad', 'artFreshFlowers',  5.3, 1.65, 30.68, 0, 0, 0, 3.8, 1.45, 1, { tint: [1,1,1,1] });

  dm('box', 'marketCeramicTile', 10.5, 0.44, 32.2, 0, 0, 0, 4.0, 0.88, 3.0, { tint: [0.82, 0.92, 0.98, 1] });
  dm('quad', 'signWetSeafood', 10.5, 2.90, 30.68, 0, 0, 0, 3.8, 0.72, 1, { tint: [1,1,1,1] });
  dm('quad', 'artWetSeafood',  10.5, 1.65, 30.68, 0, 0, 0, 3.8, 1.45, 1, { tint: [1,1,1,1] });

  // Đèn & Quạt Trần Lồng Chợ
  var lampPts = [[-3.2, 6.5], [3.2, 6.5], [-10.0, 17.0], [10.0, 17.0], [-3.2, 24.5], [3.2, 24.5]];
  for (var li = 0; li < lampPts.length; li++) {
    drawMarketHangingLampWebgl(wgl, lampPts[li][0], lampPts[li][1], [0.96, 0.62, 0.08, 1]);
  }
  drawMarketCeilingFanWebgl(wgl, 0, 8.0, st.t, 0.2);
  drawMarketCeilingFanWebgl(wgl, 0, 17.0, st.t, 1.2);
  drawMarketCeilingFanWebgl(wgl, 0, 26.5, st.t, 2.2);

  /* ---------------- H. 12 NPC PIXEL BILLBOARD & CHÚ HEO 24×20 (GL.NEAREST) ---------------- */
  if (st.npcs && typeof drawHumanBillboardWebgl === 'function') {
    for (var npi = 0; npi < st.npcs.length; npi++) {
      drawHumanBillboardWebgl(wgl, cam, st.npcs[npi], st.t);
    }
  }
  if (typeof drawPigBillboardWebgl === 'function') {
    drawPigBillboardWebgl(wgl, cam, st.pig, st.t, false);
  }

  /* ---------------- I. VÒNG SÓNG CHẠM SÀN TAP-TO-WALK ---------------- */
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
