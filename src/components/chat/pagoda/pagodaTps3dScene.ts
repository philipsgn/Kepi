/**
 * Ngôi Chùa Cổ Kính & Vườn Chùa WebGL 3D Hợp Nhất Không Cắt Cảnh (Quyết định 250)
 * - Hợp nhất 4 khu vực chữ L liên hoàn trên 1 hệ tọa độ thế giới 3D duy nhất:
 *   1. 'garden' (Vườn Chùa Tiền Đường — Chế độ B: tường bao + Cổng Tam Quan + Sky Dome): X ∈ [-6.2, 6.2], Z ∈ [0, 14.8], Y = 0
 *   2. 'main_hall' (Chánh Điện phía Bắc — Chế độ A kín): X ∈ [-5.8, 5.8], Z ∈ [14.8, 27.6], Y = 0.48
 *      nối thẳng từ 'garden' qua 3 Bậc Đá Tam Cấp & cửa đồng trục X ∈ [-2.0, 2.0], Z ∈ [14.0, 15.4] (Y: 0 -> 0.48, 18.9°)
 *   3. 'bell_tea' (Nhà Chuông & Thiền Trà Cánh Đông — Chế độ A kín): X ∈ [6.2, 16.8], Z ∈ [5.6, 14.8], Y = 0.36
 *      nối từ 'garden' qua Cổng Vòm Tre + 2 Bậc Đá X ∈ [5.6, 7.0], Z ∈ [10.4, 13.0] (Y: 0 -> 0.36, 14.4°)
 *   4. 'east_corridor' (Hành Lang Mái Che nối thẳng main_hall <-> bell_tea — Chế độ A kín): X ∈ [5.8, 8.6], Z ∈ [14.8, 17.6]
 *      nối cửa Đông Chánh Điện (X = 5.8, Z ∈ [15.2, 17.2], Y = 0.48) <-> 1 bậc đá (X ∈ [6.2, 8.4], Z ∈ [14.6, 15.2], Y: 0.48 -> 0.36, 11.3°) <-> cửa Bắc Nhà Chuông (Z = 14.8, X ∈ [6.4, 8.4], Y = 0.36)
 * - Đi bộ liên hoàn 100% không cắt cảnh giữa 4 khu vực; bật Seated Auto-Stand tại chiếu trà TÂM AN.
 * - Bảo toàn Canvas2D fallback (renderPagodaTpsScene > 80 primitives, 0 NaN) cho Headless Smoke Test 182.
 */
export function buildPagodaTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. ĐỒ THỊ KHÔNG GIAN LIÊN HOÀN PAGODA_NAV_GRAPH (QĐ 250) ==================== */
var PAGODA_NAV_GRAPH = {
  zones: [
    { id: 'garden',        minX: -6.2, maxX:  6.2, minZ:  0.0, maxZ: 14.8, floorY: 0.00 },
    { id: 'main_hall',     minX: -5.8, maxX:  5.8, minZ: 14.8, maxZ: 27.6, floorY: 0.48 },
    { id: 'east_corridor', minX:  5.8, maxX:  8.6, minZ: 14.8, maxZ: 17.6, floorY: 0.48 },
    { id: 'bell_tea',      minX:  6.2, maxX: 16.8, minZ:  5.6, maxZ: 14.8, floorY: 0.36 }
  ],
  ramps: [
    { id: 'tam_cap',       axis: 'z', minX: -2.0, maxX: 2.0, minZ: 14.0, maxZ: 15.4, zStart: 14.0, zEnd: 15.4, yStart: 0.00, yEnd: 0.48 },
    { id: 'bamboo_steps',  axis: 'x', minX:  5.6, maxX: 7.0, minZ: 10.4, maxZ: 13.0, xStart:  5.6, xEnd:  7.0, yStart: 0.00, yEnd: 0.36 },
    { id: 'corridor_step', axis: 'z', minX:  6.2, maxX: 8.4, minZ: 14.6, maxZ: 15.2, zStart: 14.6, zEnd: 15.2, yStart: 0.36, yEnd: 0.48 }
  ],
  edges: [
    {
      from: 'garden', to: 'main_hall',
      waypointsForward:  [{ x: 0.0, y: 0.00, z: 13.5 }, { x: 0.0, y: 0.48, z: 15.8 }],
      waypointsBackward: [{ x: 0.0, y: 0.48, z: 15.8 }, { x: 0.0, y: 0.00, z: 13.5 }]
    },
    {
      from: 'garden', to: 'bell_tea',
      waypointsForward:  [{ x: 5.2, y: 0.00, z: 11.7 }, { x: 7.4, y: 0.36, z: 11.7 }],
      waypointsBackward: [{ x: 7.4, y: 0.36, z: 11.7 }, { x: 5.2, y: 0.00, z: 11.7 }]
    },
    {
      from: 'main_hall', to: 'east_corridor',
      waypointsForward:  [{ x: 5.1, y: 0.48, z: 16.2 }, { x: 7.3, y: 0.48, z: 16.2 }],
      waypointsBackward: [{ x: 7.3, y: 0.48, z: 16.2 }, { x: 5.1, y: 0.48, z: 16.2 }]
    },
    {
      from: 'east_corridor', to: 'bell_tea',
      waypointsForward:  [{ x: 7.4, y: 0.48, z: 15.7 }, { x: 7.4, y: 0.36, z: 14.0 }],
      waypointsBackward: [{ x: 7.4, y: 0.36, z: 14.0 }, { x: 7.4, y: 0.48, z: 15.7 }]
    }
  ]
};

var PAGODA_NAV_CONFIG = {
  wallMargin: 0.38,
  outerBounds: { minX: -6.2, maxX: 16.8, minZ: -1.8, maxZ: 27.6, minY: 0.45, maxY: 6.2 },
  zones: PAGODA_NAV_GRAPH.zones,
  dividerWalls: [
    // Tường ngăn Garden <-> Main Hall (cửa Chánh Điện X ∈ [-2.0, 2.0])
    { axis: 'z', pos: 14.8, minSpan: -6.2, maxSpan: 6.2, minY: 0, maxY: 4.6, openings: [{ a1: -2.0, a2: 2.0, y1: 0, y2: 3.05 }] },
    // Tường ngăn Garden <-> Bell & Tea (Cổng Vòm Tre Z ∈ [10.4, 13.0])
    { axis: 'x', pos: 6.2, minSpan: 0.0, maxSpan: 14.8, minY: 0, maxY: 4.3, openings: [{ a1: 10.4, a2: 13.0, y1: 0, y2: 2.55 }] },
    // Tường ngăn Main Hall <-> East Corridor (cửa Đông Z ∈ [15.2, 17.2])
    { axis: 'x', pos: 5.8, minSpan: 14.8, maxSpan: 27.6, minY: 0.48, maxY: 4.6, openings: [{ a1: 15.2, a2: 17.2, y1: 0.48, y2: 2.95 }] },
    // Tường ngăn Bell & Tea <-> East Corridor (cửa Bắc Nhà Chuông X ∈ [6.4, 8.4])
    { axis: 'z', pos: 14.8, minSpan: 6.2, maxSpan: 16.8, minY: 0.36, maxY: 4.3, openings: [{ a1: 6.4, a2: 8.4, y1: 0.36, y2: 2.75 }] },
    // Các tường bao chữ L bên ngoài chống camera lọt ra khoảng không
    { axis: 'z', pos: 0.0,  minSpan: -6.2, maxSpan: 6.2,  minY: 0, maxY: 3.6, openings: [{ a1: -1.75, a2: 1.75, y1: 0, y2: 2.9 }] },
    { axis: 'z', pos: 5.6,  minSpan: 6.2,  maxSpan: 16.8, minY: 0, maxY: 4.3, openings: [] },
    { axis: 'x', pos: 8.6,  minSpan: 14.8, maxSpan: 17.6, minY: 0, maxY: 4.0, openings: [] },
    { axis: 'z', pos: 17.6, minSpan: 5.8,  maxSpan: 8.6,  minY: 0, maxY: 4.0, openings: [] },
    { axis: 'x', pos: -5.8, minSpan: 14.8, maxSpan: 27.6, minY: 0, maxY: 4.6, openings: [] },
    { axis: 'x', pos: 16.8, minSpan: 5.6,  maxSpan: 14.8, minY: 0, maxY: 4.3, openings: [] },
    { axis: 'z', pos: 27.6, minSpan: -5.8, maxSpan: 5.8,  minY: 0, maxY: 4.6, openings: [] }
  ]
};

var PAGODA_ATMOSPHERE = {
  clearColor: [0.96, 0.87, 0.66, 1.0],
  hemiLow:    [0.32, 0.24, 0.16],
  hemiHigh:   [0.78, 0.68, 0.50],
  sunDir:     [0.34, 0.78, -0.52],
  sunCol:     [1.06, 0.90, 0.64],
  wrapBias:   0.48,
  lights: [
    { pos: [0.0,  3.2, 25.8], col: [1.28, 0.94, 0.38] }, // Hào quang Phật Đài Chánh Điện
    { pos: [0.0,  3.0, 19.6], col: [0.96, 0.62, 0.28] }, // Đèn lồng Chánh Điện & Hành lang
    { pos: [11.8, 3.1, 10.6], col: [1.05, 0.78, 0.42] }, // Đèn giấy Thiền Trà & Đại Hồng Chung
    { pos: [0.0,  3.6,  6.8], col: [0.68, 0.58, 0.42] }  // Ánh nắng Vườn Chùa
  ],
  outdoorRect: [1.0, 14.8, 0.0, 1.0],
  fogCol:     [0.88, 0.78, 0.58],
  fogParams:  [19.0, 36.0, 0.35]
};

var PAGODA_OBSTACLES = [
  // Garden
  { x1: -5.25, z1:  3.55, x2: -1.05, z2:  9.75 }, // Hồ Sen & Chùa Một Cột
  { x1:  3.25, z1:  5.75, x2:  5.05, z2:  7.95 }, // Cây Đa Cổ Thụ
  // Main Hall (6 cột + Lư hương + Phật Đài)
  { x1: -4.48, z1: 17.52, x2: -3.92, z2: 18.08 },
  { x1:  3.92, z1: 17.52, x2:  4.48, z2: 18.08 },
  { x1: -4.48, z1: 21.32, x2: -3.92, z2: 21.88 },
  { x1:  3.92, z1: 21.32, x2:  4.48, z2: 21.88 },
  { x1: -4.48, z1: 25.12, x2: -3.92, z2: 25.68 },
  { x1:  3.92, z1: 25.12, x2:  4.48, z2: 25.68 },
  { x1: -0.85, z1: 23.20, x2:  0.85, z2: 24.50 }, // Lư hương
  { x1: -3.20, z1: 25.40, x2:  3.20, z2: 27.30 }, // Phật Đài
  // Bell & Tea Hall
  { x1:  7.95, z1: 10.25, x2: 10.45, z2: 12.55 }, // Đại Hồng Chung
  { x1: 13.05, z1:  8.75, x2: 14.55, z2: 10.45 }  // Bàn trà TÂM AN
];

function getPagodaSurfaceY(x, z, curY) {
  // 1. 3 Bậc Đá Tam Cấp (garden <-> main_hall)
  if (x >= -2.0 && x <= 2.0 && z >= 14.0 && z <= 15.4) {
    return Math.max(0, Math.min(0.48, ((z - 14.0) / 1.4) * 0.48));
  }
  // 2. 2 Bậc Đá Cổng Vòm Tre (garden <-> bell_tea)
  if (x >= 5.6 && x <= 7.0 && z >= 10.4 && z <= 13.0) {
    return Math.max(0, Math.min(0.36, ((x - 5.6) / 1.4) * 0.36));
  }
  // 3. 1 Bậc Đá Hành Lang Đông (bell_tea <-> east_corridor)
  if (x >= 6.2 && x <= 8.4 && z >= 14.6 && z <= 15.2) {
    return 0.36 + Math.max(0, Math.min(1, (z - 14.6) / 0.6)) * 0.12;
  }
  if (x >= 6.2 && z <= 14.8) return 0.36;
  if (z >= 14.8) return 0.48;
  return 0.0;
}

function getPagodaZoneAt(x, z) {
  if (x >= 6.2 && z <= 14.8) return 'bell_tea';
  if (z >= 14.8 && x >= 5.8) return 'east_corridor';
  if (z >= 14.8) return 'main_hall';
  return 'garden';
}

function createPagodaNpcs() {
  return [
    {
      id: 'garden_monk', role: 'monk', shirt: '#D97706', hair: '#C29B70',
      x: 1.75, y: 0.0, z: 4.8, yaw: 0, state: 'WALK', timer: 0, stepIdx: 0, phase: 0.4,
      pts: [
        { x: 1.75, y: 0.0, z: 3.4 },
        { x: 1.75, y: 0.0, z: 11.4 },
        { x: 1.75, y: 0.0, z: 11.4, wait: 2.2, yaw: -Math.PI * 0.5 },
        { x: 1.75, y: 0.0, z: 3.4 }
      ]
    },
    {
      id: 'corridor_monk', role: 'monk', shirt: '#B45309', hair: '#C29B70',
      x: 7.4, y: 0.48, z: 16.2, yaw: -Math.PI * 0.5, state: 'WALK', timer: 0, stepIdx: 1, phase: 1.2,
      pts: [
        { x: 3.4, y: 0.48, z: 16.2 },
        { x: 7.4, y: 0.48, z: 16.2 },
        { x: 7.4, y: 0.36, z: 12.2 },
        { x: 9.2, y: 0.36, z: 9.4, wait: 3.0, yaw: 0 },
        { x: 7.4, y: 0.36, z: 12.2 },
        { x: 7.4, y: 0.48, z: 16.2 }
      ]
    },
    {
      id: 'hall_monk', role: 'monk', shirt: '#D97706', hair: '#C29B70',
      x: -2.0, y: 0.48, z: 21.8, yaw: 0, state: 'SIT', seated: true, moving: false, timer: 99, stepIdx: 0, phase: 0.2, pts: null
    },
    {
      id: 'hall_worshipper', role: 'worshipper', shirt: '#64748B', hair: '#1C1917',
      x: 2.0, y: 0.48, z: 21.8, yaw: 0, state: 'SIT', seated: true, moving: false, timer: 99, stepIdx: 0, phase: 1.5, pts: null
    },
    {
      id: 'garden_worshipper', role: 'worshipper', shirt: '#475569', hair: '#2B2118',
      x: -0.9, y: 0.0, z: 10.6, yaw: 0, state: 'WALK', timer: 0, stepIdx: 0, phase: 2.1,
      pts: [
        { x: -0.8, y: 0.0, z: 8.6 },
        { x:  0.0, y: 0.0, z: 13.5 },
        { x:  0.0, y: 0.48, z: 16.2 },
        { x:  0.0, y: 0.48, z: 21.8, wait: 3.8, yaw: 0 },
        { x:  0.0, y: 0.48, z: 16.2 },
        { x:  0.0, y: 0.0, z: 13.5 }
      ]
    },
    {
      id: 'tea_master', role: 'monk', shirt: '#B45309', hair: '#C29B70',
      x: 15.05, y: 0.36, z: 9.6, yaw: -Math.PI * 0.5, state: 'SIT', seated: true, moving: false, timer: 99, stepIdx: 0, phase: 0.8, pts: null
    }
  ];
}

function createPagodaTpsState() {
  var npcs = createPagodaNpcs();
  var smokeParticles = [];
  for (var i = 0; i < 12; i++) {
    smokeParticles.push({
      x: ((i % 3) - 1) * 0.12,
      y: 1.48 + (i / 12) * 1.4,
      z: 23.85 + ((i % 2) - 0.5) * 0.08,
      phase: i * 0.55
    });
  }

  return {
    zone: 'garden',
    pig: {
      x: 0.25, y: 0.0, z: 4.5, yaw: 0.0,
      targetX: 0.25, targetZ: 4.5,
      waypoints: [],
      walking: false,
      seated: false,
      seatChairId: -1,
      pendingSeatId: -1,
      pendingAction: null,
      eating: false
    },
    npcs: npcs,
    smokeParticles: smokeParticles,
    incenseGlow: 0,
    bellRingTimer: 0,
    bellSwingPhase: 0,
    exitFade: 0,
    exiting: false,
    ripples: [],
    t: 0
  };
}

function clampPagodaWalkPos(st, x, z, curY) {
  var nx = x, nz = z;
  var pad = 0.34;
  var curZone = getPagodaZoneAt(st.pig ? st.pig.x : x, st.pig ? st.pig.z : z);

  // Giữ trong biên tường khu chữ L, chỉ thông qua đúng các cửa & bậc đá
  if (nx < -6.2 + pad) nx = -6.2 + pad;
  if (nz < 0.65) nz = 0.65;
  if (nz > 27.6 - pad) nz = 27.6 - pad;
  if (nx > 16.8 - pad) nx = 16.8 - pad;

  if (nz < 5.6 + pad && nx > 6.2 - pad) {
    if (curZone === 'bell_tea') nz = 5.6 + pad;
    else nx = 6.2 - pad;
  }
  if (nz > 14.8 - pad && nx > 8.6 - pad) {
    if (curZone === 'bell_tea') nz = 14.8 - pad;
    else nx = 8.6 - pad;
  }
  if (nz > 17.6 - pad && nx > 5.8 - pad) {
    if (curZone === 'east_corridor') nz = 17.6 - pad;
    else nx = 5.8 - pad;
  }

  // Tường ngăn Garden <-> Main Hall (Z = 14.8), chỉ mở tại Cửa Chánh Điện X ∈ [-2.0, 2.0]
  if (nx < 5.8 && Math.abs(nz - 14.8) < pad && Math.abs(nx) > 2.0 - pad) {
    nz = (st.pig && st.pig.z >= 14.8) ? (14.8 + pad) : (14.8 - pad);
  }
  // Tường ngăn Garden <-> Bell & Tea (X = 6.2), chỉ mở tại Cổng Vòm Tre Z ∈ [10.4, 13.0]
  if (nz < 14.8 && Math.abs(nx - 6.2) < pad && (nz < 10.4 + pad || nz > 13.0 - pad)) {
    nx = (st.pig && st.pig.x >= 6.2) ? (6.2 + pad) : (6.2 - pad);
  }
  // Tường ngăn Main Hall <-> East Corridor (X = 5.8), chỉ mở tại Z ∈ [15.2, 17.2]
  if (nz >= 14.8 && Math.abs(nx - 5.8) < pad && (nz < 15.2 + pad || nz > 17.2 - pad)) {
    nx = (st.pig && st.pig.x >= 5.8) ? (5.8 + pad) : (5.8 - pad);
  }
  // Tường ngăn Bell & Tea <-> East Corridor (Z = 14.8), chỉ mở tại X ∈ [6.4, 8.4]
  if (nx >= 6.2 && Math.abs(nz - 14.8) < pad && (nx < 6.4 + pad || nx > 8.4 - pad)) {
    nz = (st.pig && st.pig.z >= 14.8) ? (14.8 + pad) : (14.8 - pad);
  }

  // Chặn va chạm AABB vật thể trong chùa
  for (var i = 0; i < PAGODA_OBSTACLES.length; i++) {
    var b = PAGODA_OBSTACLES[i];
    if (nx > b.x1 - pad && nx < b.x2 + pad && nz > b.z1 - pad && nz < b.z2 + pad) {
      var dl = Math.abs(nx - (b.x1 - pad)), dr = Math.abs(nx - (b.x2 + pad));
      var dt = Math.abs(nz - (b.z1 - pad)), db = Math.abs(nz - (b.z2 + pad));
      var m = Math.min(dl, dr, dt, db);
      if (m === dl) nx = b.x1 - pad;
      else if (m === dr) nx = b.x2 + pad;
      else if (m === dt) nz = b.z1 - pad;
      else nz = b.z2 + pad;
    }
  }
  return { x: nx, z: nz };
}

function segHitsPagodaBox(ax, az, bx, bz, b, pad) {
  var x1 = b.x1 - pad, x2 = b.x2 + pad, z1 = b.z1 - pad, z2 = b.z2 + pad;
  var t0 = 0, t1 = 1, dx = bx - ax, dz = bz - az;
  var p = [-dx, dx, -dz, dz];
  var q = [ax - x1, x2 - ax, az - z1, z2 - az];
  for (var i = 0; i < 4; i++) {
    if (Math.abs(p[i]) < 1e-6) {
      if (q[i] < 0) return false;
    } else {
      var r = q[i] / p[i];
      if (p[i] < 0) { if (r > t1) return false; if (r > t0) t0 = r; }
      else { if (r < t0) return false; if (r < t1) t1 = r; }
    }
  }
  return t0 <= t1;
}

function insertPagodaObstacleDetours(startX, startZ, wps) {
  var out = [];
  var cx = startX, cz = startZ;
  var margin = 0.56;
  for (var wi = 0; wi < wps.length; wi++) {
    var wp = wps[wi];
    var hitBox = null;
    for (var bi = 0; bi < PAGODA_OBSTACLES.length; bi++) {
      if (segHitsPagodaBox(cx, cz, wp.x, wp.z, PAGODA_OBSTACLES[bi], 0.34)) {
        hitBox = PAGODA_OBSTACLES[bi];
        break;
      }
    }
    if (hitBox) {
      var corners = [
        { x: hitBox.x1 - margin, z: hitBox.z1 - margin },
        { x: hitBox.x2 + margin, z: hitBox.z1 - margin },
        { x: hitBox.x1 - margin, z: hitBox.z2 + margin },
        { x: hitBox.x2 + margin, z: hitBox.z2 + margin }
      ];
      var bestC = null, bestLen = 99999;
      for (var ci = 0; ci < corners.length; ci++) {
        var c = corners[ci];
        if (Math.abs(c.x - 6.2) < 0.3 && c.z < 14.8 && (c.z < 10.4 || c.z > 13.0)) continue;
        if (c.x < -5.85 || c.x > 16.45 || c.z < 0.7 || c.z > 27.2) continue;
        var len = Math.hypot(c.x - cx, c.z - cz) + Math.hypot(wp.x - c.x, wp.z - c.z);
        if (len < bestLen) { bestLen = len; bestC = c; }
      }
      if (bestC) {
        out.push({ x: bestC.x, y: getPagodaSurfaceY(bestC.x, bestC.z, wp.y || 0), z: bestC.z });
      }
    }
    out.push(wp);
    cx = wp.x; cz = wp.z;
  }
  return out;
}

function planPagodaRealtimePath(st, tx, targetFloorY, tz, pendingAction) {
  var p = st.pig;
  // Seated Auto-Stand (QĐ 250): chạm sàn/vật thể khi đang ngồi lập tức đứng dậy!
  p.seated = false;
  p.eating = false;

  if (typeof planNavGraphRealtimePath === 'function') {
    planNavGraphRealtimePath(PAGODA_NAV_GRAPH, st, tx, targetFloorY, tz, {
      seatChairId: -1,
      pendingAction: pendingAction || null
    });
    p.waypoints = insertPagodaObstacleDetours(p.x, p.z, p.waypoints || []);
    if (p.waypoints.length > 0) {
      p.targetX = p.waypoints[0].x;
      p.targetZ = p.waypoints[0].z;
    }
    return;
  }
  // Fallback cho Canvas2D / Test 182
  p.pendingAction = pendingAction || null;
  p.waypoints = insertPagodaObstacleDetours(p.x, p.z, [{ x: tx, y: targetFloorY || 0, z: tz }]);
  p.targetX = p.waypoints[0].x;
  p.targetZ = p.waypoints[0].z;
  p.walking = true;
}

function runPagodaContextAction(st, actionId) {
  if (!st || !actionId) return;
  var p = st.pig;
  if (actionId === 'offer_incense') {
    st.incenseGlow = 4.5;
    p.yaw = 0;
    p.walking = false;
  } else if (actionId === 'ring_bell') {
    st.bellRingTimer = 3.4;
    st.bellSwingPhase = 0;
    p.yaw = Math.atan2(9.2 - p.x, 11.4 - p.z);
    p.walking = false;
  } else if (actionId === 'sit_tea') {
    p.x = 12.55; p.y = 0.36; p.z = 9.6;
    p.yaw = Math.PI * 0.5;
    p.seated = true; p.walking = false; p.eating = false;
  } else if (actionId === 'sip_tea') {
    p.eating = true;
  } else if (actionId === 'exit_pagoda') {
    st.exiting = true;
  }
}

function stepPagodaNpcs(st, dt) {
  if (!st.npcs) return;
  for (var i = 0; i < st.npcs.length; i++) {
    var n = st.npcs[i];
    if (!n.pts || n.state === 'SIT') {
      n.moving = false;
      continue;
    }
    if (n.timer > 0) {
      n.timer -= dt;
      n.moving = false;
      continue;
    }
    n.moving = true;
    var tgt = n.pts[(n.stepIdx + 1) % n.pts.length];
    var dx = tgt.x - n.x, dz = tgt.z - n.z;
    var d = Math.hypot(dx, dz);
    if (d < 0.10) {
      n.x = tgt.x; n.z = tgt.z;
      n.y = typeof tgt.y === 'number' ? tgt.y : getPagodaSurfaceY(n.x, n.z, n.y);
      n.stepIdx = (n.stepIdx + 1) % n.pts.length;
      if (tgt.wait) {
        n.timer = tgt.wait;
        n.yaw = typeof tgt.yaw === 'number' ? tgt.yaw : n.yaw;
        n.moving = false;
      }
    } else {
      var spd = Math.min(d, 1.15 * dt);
      n.x += (dx / d) * spd;
      n.z += (dz / d) * spd;
      n.y = getPagodaSurfaceY(n.x, n.z, n.y);
      n.yaw = Math.atan2(dx, dz);
    }
  }
}

function stepPagodaTps(st, dt) {
  st.t += dt;
  var p = st.pig;

  stepPagodaNpcs(st, dt);

  for (var si = 0; si < st.smokeParticles.length; si++) {
    var sp = st.smokeParticles[si];
    sp.y += dt * 0.42;
    if (sp.y > 2.95) sp.y = 1.46;
  }

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
        if (p.pendingAction) {
          runPagodaContextAction(st, p.pendingAction);
          p.pendingAction = null;
        }
      }
    } else {
      var onRamp = (p.y > 0.02 && p.y < 0.46);
      var spd = Math.min(dist, (onRamp ? 2.15 : 2.95) * dt);
      var next = clampPagodaWalkPos(st, p.x + (dx / dist) * spd, p.z + (dz / dist) * spd, p.y);
      var moved = Math.hypot(next.x - p.x, next.z - p.z);
      p.x = next.x; p.z = next.z;
      p.yaw = Math.atan2(dx, dz);
      if (moved < 0.002 && p.waypoints && p.waypoints.length <= 1) {
        p.walking = false;
      }
    }
  }

  p.y = getPagodaSurfaceY(p.x, p.z, p.y);
  st.zone = getPagodaZoneAt(p.x, p.z);

  if (st.incenseGlow > 0) st.incenseGlow = Math.max(0, st.incenseGlow - dt);
  if (st.bellRingTimer > 0) {
    st.bellRingTimer = Math.max(0, st.bellRingTimer - dt);
    st.bellSwingPhase += dt * 7.5;
  }
  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.2);

  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== 2. RAYCAST 3D ĐA TẦNG + BẬC ĐÁ + ĐẠO CỤ CHÙA ==================== */
function pagodaRaySphere(ox, oy, oz, dx, dy, dz, cx, cy, cz, rad) {
  var ocx = cx - ox, ocy = cy - oy, ocz = cz - oz;
  var proj = ocx * dx + ocy * dy + ocz * dz;
  if (proj < 0.2 || proj > 28) return -1;
  var d2 = (ocx * ocx + ocy * ocy + ocz * ocz) - proj * proj;
  return d2 <= rad * rad ? proj : -1;
}

function pickPagodaTarget3D(cam, st, sx, sy) {
  var nx = (sx - cam.vw * 0.5) / (cam.focal || 400);
  var ny = (cam.vh * 0.5 - sy) / (cam.focal || 400);
  var dx = cam.F.x + cam.R.x * nx + cam.U.x * ny;
  var dy = cam.F.y + cam.R.y * nx + cam.U.y * ny;
  var dz = cam.F.z + cam.R.z * nx + cam.U.z * ny;
  var dl = Math.hypot(dx, dy, dz) || 1;
  dx /= dl; dy /= dl; dz /= dl;
  var ox = cam.pos.x, oy = cam.pos.y, oz = cam.pos.z;

  // 1. Vật thể tương tác (Lư hương, Đại Hồng Chung, Bàn trà TÂM AN, Cổng Tam Quan)
  if (pagodaRaySphere(ox, oy, oz, dx, dy, dz, 0.0, 1.15, 23.85, 0.85) > 0) {
    return { kind: 'action', x: 0.0, y: 0.48, z: 22.55, pendingAction: 'offer_incense' };
  }
  if (pagodaRaySphere(ox, oy, oz, dx, dy, dz, 9.2, 1.65, 11.4, 1.15) > 0) {
    return { kind: 'action', x: 9.2, y: 0.36, z: 9.35, pendingAction: 'ring_bell' };
  }
  if (pagodaRaySphere(ox, oy, oz, dx, dy, dz, 13.8, 0.72, 9.6, 0.85) > 0 ||
      pagodaRaySphere(ox, oy, oz, dx, dy, dz, 12.55, 0.55, 9.6, 0.65) > 0) {
    return { kind: 'action', x: 12.55, y: 0.36, z: 9.6, pendingAction: 'sit_tea' };
  }
  if (dz < -0.02) {
    var td = (0.15 - oz) / dz;
    if (td > 0.3 && td < 20) {
      var ddx = ox + dx * td, ddy = oy + dy * td;
      if (ddy >= 0 && ddy <= 2.85 && Math.abs(ddx) <= 1.75) {
        return { kind: 'exit', x: 0.0, y: 0.0, z: 1.15, pendingAction: 'exit_pagoda' };
      }
    }
  }

  // 2. Raycast 3 cụm Bậc Đá (rayRampQuad)
  if (typeof rayRampQuad === 'function') {
    var bestRamp = null;
    for (var ri = 0; ri < PAGODA_NAV_GRAPH.ramps.length; ri++) {
      var rh = rayRampQuad(ox, oy, oz, dx, dy, dz, PAGODA_NAV_GRAPH.ramps[ri]);
      if (rh && (!bestRamp || rh.t < bestRamp.t)) bestRamp = rh;
    }
    if (bestRamp) {
      return { kind: 'ramp', x: bestRamp.x, y: bestRamp.y, z: bestRamp.z, pendingAction: null };
    }
  }

  // 3. Sàn đa cao độ (Y = 0.48 -> Y = 0.36 -> Y = 0.00)
  if (dy < -0.025) {
    var tMain = (0.48 - oy) / dy;
    if (tMain > 0.2 && tMain < 32) {
      var xm = ox + dx * tMain, zm = oz + dz * tMain;
      var inMain = (xm >= -5.8 && xm <= 5.8 && zm >= 14.8 && zm <= 27.6);
      var inCorr = (xm >= 5.8 && xm <= 8.6 && zm >= 15.2 && zm <= 17.6);
      if (inMain || inCorr) return { kind: 'floor', x: xm, y: 0.48, z: zm, pendingAction: null };
    }
    var tBell = (0.36 - oy) / dy;
    if (tBell > 0.2 && tBell < 32) {
      var xb = ox + dx * tBell, zb = oz + dz * tBell;
      if (xb >= 6.2 && xb <= 16.8 && zb >= 5.6 && zb <= 14.8) {
        return { kind: 'floor', x: xb, y: 0.36, z: zb, pendingAction: null };
      }
    }
    var tGar = (0.0 - oy) / dy;
    if (tGar > 0.2 && tGar < 32) {
      var xg = ox + dx * tGar, zg = oz + dz * tGar;
      if (xg >= -6.2 && xg <= 6.2 && zg >= 0.0 && zg <= 14.8) {
        return { kind: 'floor', x: xg, y: 0.0, z: zg, pendingAction: null };
      }
    }
  }
  return null;
}

/* ==================== 3. RENDER WEBGL 3D QUẦN THỂ TAM BẢO HỢP NHẤT (QĐ 250) ==================== */
function renderPagodaWebglScene(wgl, cam, st, W, H) {
  var maxYMap = { garden: 6.2, main_hall: 4.48, bell_tea: 4.16, east_corridor: 3.76 };
  PAGODA_NAV_CONFIG.outerBounds.maxY = maxYMap[st.zone] || 4.45;
  if (typeof computeWebglTpsCamera === 'function') {
    computeWebglTpsCamera(cam, st.pig, PAGODA_NAV_CONFIG);
  }
  wgl.beginFrame(W, H, cam, PAGODA_ATMOSPHERE);
  var dm = wgl.drawMesh;
  var t = st.t;

  // A. CHẾ ĐỘ B — BẦU TRỜI BÌNH MINH / HOÀNG HÔN & RỪNG CÂY BAO QUANH VƯỜN CHÙA (0% VOID)
  dm('quad', 'skyBackdrop', 0, 7.5, -18, 0, 0, 0, 42, 22, 1, { tint: [1,1,1,1], emissive: 1.0 });
  dm('quad', 'skyBackdrop', -18, 7.5, 6, 0, Math.PI * 0.5, 0, 36, 22, 1, { tint: [1,1,1,1], emissive: 1.0 });
  dm('quad', 'skyBackdrop', 18, 7.5, 2, 0, -Math.PI * 0.5, 0, 32, 22, 1, { tint: [1,1,1,1], emissive: 1.0 });
  dm('quad', 'white', 0, 13.5, 6, Math.PI * 0.5, 0, 0, 46, 46, 1, { tint: [0.99, 0.90, 0.62, 1], emissive: 1.0 });
  var bgTreePts = [[-8.5, 2.5], [-8.2, 8.5], [-8.4, 13.5], [-4.5, -4.5], [4.5, -4.5], [8.5, 2.2]];
  for (var bti = 0; bti < bgTreePts.length; bti++) {
    dm('cyl', 'darkTimber', bgTreePts[bti][0], 1.8, bgTreePts[bti][1], 0, 0, 0, 0.42, 3.6, 0.42, { tint: [0.46, 0.34, 0.22, 1] });
    dm('sphere', 'white', bgTreePts[bti][0], 4.0, bgTreePts[bti][1], 0, 0, 0, 3.1, 2.3, 3.1, { tint: [0.22, 0.46, 0.20, 1] });
  }

  // B. KHU 1: VƯỜN CHÙA TIỀN ĐƯỜNG (X ∈ [-6.2, 6.2], Z ∈ [0, 14.8], Y = 0)
  dm('box', 'redBrickFloor', 0, -0.06, 7.4, 0, 0, 0, 12.4, 0.12, 14.8, { tint: [1,1,1,1], us: 5, vs: 6 });
  dm('box', 'stonePath', 0, 0.008, 7.0, 0, 0, 0, 2.5, 0.02, 14.0, { tint: [1,1,1,1], us: 1.4, vs: 6 });
  dm('box', 'stonePath', 3.55, 0.008, 11.7, 0, 0, 0, 4.6, 0.02, 1.8, { tint: [1,1,1,1], us: 2.2, vs: 1 });

  // Tường bao Vườn Chùa + Ngói Âm Dương + Cổng Tam Quan (Z = 0)
  dm('box', 'ochreWall', -6.2, 1.52, 7.4, 0, 0, 0, 0.18, 3.04, 14.8, { tint: [1,1,1,1], us: 5, vs: 1.5 });
  dm('box', 'yinYangRoof', -6.2, 3.16, 7.4, 0, 0, 0.22, 0.65, 0.22, 15.0, { tint: [1,1,1,1], us: 1, vs: 6 });
  dm('box', 'ochreWall', 6.2, 1.52, 5.2, 0, 0, 0, 0.18, 3.04, 10.4, { tint: [1,1,1,1], us: 4, vs: 1.5 });
  dm('box', 'ochreWall', 6.2, 1.52, 13.9, 0, 0, 0, 0.18, 3.04, 1.8, { tint: [1,1,1,1], us: 1, vs: 1.5 });
  dm('box', 'ochreWall', 6.2, 2.95, 11.7, 0, 0, 0, 0.20, 0.85, 2.6, { tint: [1,1,1,1] });
  dm('box', 'yinYangRoof', 6.2, 3.35, 7.4, 0, 0, -0.20, 0.65, 0.22, 14.8, { tint: [1,1,1,1], us: 1, vs: 6 });

  // Cổng Tam Quan (Z = 0)
  dm('box', 'ochreWall', -3.98, 1.55, 0.0, 0, 0, 0, 4.45, 3.1, 0.28, { tint: [1,1,1,1], us: 2, vs: 1.5 });
  dm('box', 'ochreWall',  3.98, 1.55, 0.0, 0, 0, 0, 4.45, 3.1, 0.28, { tint: [1,1,1,1], us: 2, vs: 1.5 });
  dm('box', 'darkTimber', -1.82, 1.65, 0.0, 0, 0, 0, 0.28, 3.3, 0.36, { tint: [0.95, 0.35, 0.25, 1] });
  dm('box', 'darkTimber',  1.82, 1.65, 0.0, 0, 0, 0, 0.28, 3.3, 0.36, { tint: [0.95, 0.35, 0.25, 1] });
  dm('box', 'yinYangRoof', 0.0, 3.55, 0.0, 0, 0, 0, 4.4, 0.38, 1.1, { tint: [1,1,1,1], us: 2.5, vs: 1 });
  dm('box', 'yinYangRoof', 0.0, 4.02, 0.0, 0, 0, 0, 2.9, 0.36, 0.8, { tint: [1,1,1,1], us: 2, vs: 1 });
  dm('quad', 'tamQuanSign', 0.0, 3.05, 0.18, 0, 0, 0, 3.2, 0.72, 1, { tint: [1,1,1,1] });
  dm('quad', 'tamQuanSign', 0.0, 3.05, -0.18, 0, Math.PI, 0, 3.2, 0.72, 1, { tint: [1,1,1,1] });

  // Hồ Sen & Chùa Một Cột (X ∈ [-5.25, -1.05], Z ∈ [3.55, 9.75])
  dm('box', 'stonePath', -3.15, 0.12, 3.65, 0, 0, 0, 4.2, 0.24, 0.22, { tint: [1,1,1,1] });
  dm('box', 'stonePath', -3.15, 0.12, 9.65, 0, 0, 0, 4.2, 0.24, 0.22, { tint: [1,1,1,1] });
  dm('box', 'stonePath', -5.15, 0.12, 6.65, 0, 0, 0, 0.22, 0.24, 6.2, { tint: [1,1,1,1] });
  dm('box', 'stonePath', -1.15, 0.12, 6.65, 0, 0, 0, 0.22, 0.24, 6.2, { tint: [1,1,1,1] });
  dm('box', 'lotusPondWater', -3.15, 0.08, 6.65, 0, 0, 0, 3.88, 0.04, 5.88, { tint: [1,1,1,1], us: 2, vs: 3, specPow: 64 });
  var lotusPos = [[-4.35, 4.55], [-2.15, 4.75], [-4.45, 7.65], [-1.95, 8.25], [-3.85, 8.85]];
  for (var lpi = 0; lpi < lotusPos.length; lpi++) {
    var bob = Math.sin(t * 2.0 + lpi * 1.1) * 0.025;
    dm('sphere', 'white', lotusPos[lpi][0], 0.16 + bob, lotusPos[lpi][1], 0, 0, 0, 0.18, 0.16, 0.18, { tint: [0.96, 0.45, 0.72, 1] });
  }
  // Chùa Một Cột giữa hồ (-3.15, 6.65)
  dm('cyl', 'stonePath', -3.15, 0.65, 6.65, 0, 0, 0, 0.48, 1.24, 0.48, { tint: [1,1,1,1] });
  dm('box', 'darkTimber', -3.50, 1.05, 6.65, 0, 0, 0.55, 0.12, 0.78, 0.12, { tint: [1,0.3,0.2,1] });
  dm('box', 'darkTimber', -2.80, 1.05, 6.65, 0, 0, -0.55, 0.12, 0.78, 0.12, { tint: [1,0.3,0.2,1] });
  dm('box', 'goldLacquer', -3.15, 1.32, 6.65, 0, 0, 0, 1.78, 0.16, 1.78, { tint: [1,1,1,1] });
  dm('box', 'darkTimber', -3.15, 1.80, 6.65, 0, 0, 0, 1.32, 0.82, 1.32, { tint: [1.05, 0.36, 0.25, 1] });
  dm('quad', 'goldLacquer', -3.15, 1.78, 5.98, 0, 0, 0, 0.56, 0.64, 1, { tint: [1,1,1,1] });
  dm('box', 'yinYangRoof', -3.15, 2.30, 6.65, 0, 0, 0, 2.08, 0.22, 2.08, { tint: [1,1,1,1], us: 2, vs: 2 });
  dm('box', 'yinYangRoof', -3.15, 2.56, 6.65, 0, 0, 0, 1.42, 0.24, 1.42, { tint: [1,1,1,1], us: 1.5, vs: 1.5 });
  dm('cone', 'yinYangRoof', -3.15, 2.86, 6.65, 0, 0, 0, 0.92, 0.36, 0.92, { tint: [1,1,1,1] });
  dm('sphere', 'white', -3.15, 3.12, 6.65, 0, 0, 0, 0.22, 0.30, 0.22, { tint: [0.98, 0.82, 0.22, 1], emissive: 0.4 });

  // Cây Đa Cổ Thụ (X ∈ [3.25, 5.05], Z ∈ [5.75, 7.95])
  dm('box', 'redBrickFloor', 4.15, 0.18, 6.85, 0, 0, 0, 1.72, 0.36, 1.72, { tint: [1,1,1,1] });
  dm('cyl', 'darkTimber', 4.15, 1.35, 6.85, 0, 0, 0, 0.68, 2.05, 0.68, { tint: [0.85, 0.70, 0.56, 1] });
  dm('cyl', 'darkTimber', 3.68, 1.15, 6.62, 0, 0, 0.08, 0.12, 1.65, 0.12, { tint: [0.75, 0.62, 0.48, 1] });
  dm('cyl', 'darkTimber', 4.62, 1.18, 7.05, 0, 0, -0.08, 0.12, 1.70, 0.12, { tint: [0.75, 0.62, 0.48, 1] });
  var bSway = Math.sin(t * 1.4) * 0.04;
  dm('sphere', 'white', 4.15 + bSway, 2.65, 6.85, 0, 0, 0, 2.65, 1.15, 2.55, { tint: [0.14, 0.54, 0.22, 1] });
  dm('sphere', 'white', 3.75 + bSway, 3.12, 6.65, 0, 0, 0, 1.95, 0.92, 1.85, { tint: [0.22, 0.66, 0.28, 1] });
  dm('sphere', 'white', 4.55 + bSway, 2.98, 7.15, 0, 0, 0, 1.68, 0.85, 1.68, { tint: [0.26, 0.72, 0.32, 1] });

  // C. CONNECTOR 1: 3 BẬC ĐÁ TAM CẤP & MẶT TIỀN CHÁNH ĐIỆN (X ∈ [-2.0, 2.0], Z ∈ [14.0, 15.4], Y: 0 -> 0.48)
  for (var s1 = 0; s1 < 3; s1++) {
    var stH = (s1 + 1) * 0.16;
    var stZ = 14.0 + (s1 + 0.5) * (1.4 / 3);
    dm('box', 'stonePath', 0.0, stH * 0.5, stZ, 0, 0, 0, 4.0, stH, 0.47, { tint: [1,1,1,1], us: 2, vs: 1 });
  }
  // Mặt tiền ngăn Garden <-> Main Hall (Z = 14.8, mở X ∈ [-2.0, 2.0])
  dm('box', 'ochreWall', -4.0, 2.30, 14.8, 0, 0, 0, 4.0, 4.6, 0.24, { tint: [1,1,1,1], us: 2, vs: 2 });
  dm('box', 'ochreWall',  4.0, 2.30, 14.8, 0, 0, 0, 4.0, 4.6, 0.24, { tint: [1,1,1,1], us: 2, vs: 2 });
  dm('box', 'darkTimber', 0.0, 3.78, 14.8, 0, 0, 0, 4.2, 1.65, 0.28, { tint: [1,1,1,1] });
  dm('quad', 'chanhDienSign', 0.0, 3.35, 14.64, 0, Math.PI, 0, 3.6, 0.76, 1, { tint: [1,1,1,1] });
  dm('box', 'yinYangRoof', 0.0, 4.48, 14.3, 0.24, 0, 0, 12.6, 0.28, 1.6, { tint: [1,1,1,1], us: 6, vs: 1 });
  // 2 cánh cửa son mở 2 bên cửa Chánh Điện
  dm('box', 'goldLacquer', -2.02, 1.72, 15.18, 0, 0.25, 0, 0.10, 2.48, 0.78, { tint: [1,1,1,1] });
  dm('box', 'goldLacquer',  2.02, 1.72, 15.18, 0, -0.25, 0, 0.10, 2.48, 0.78, { tint: [1,1,1,1] });

  // D. KHU 2: CHÁNH ĐIỆN TRANG NGHIÊM (X ∈ [-5.8, 5.8], Z ∈ [14.8, 27.6], Y = 0.48, CHẾ ĐỘ A KÍN)
  dm('box', 'mahoganyFloor', 0.0, 0.42, 21.2, 0, 0, 0, 11.6, 0.12, 12.8, { tint: [1,1,1,1], us: 5, vs: 5 });
  dm('box', 'goldLacquer', 0.0, 0.49, 19.6, 0, 0, 0, 2.7, 0.02, 8.8, { tint: [1,1,1,1], us: 1, vs: 3 });
  // Tường & Trần Chánh Điện kín 100% (chừa cửa Đông X = 5.8, Z ∈ [15.2, 17.2])
  dm('box', 'darkTimber', -5.8, 2.53, 21.2, 0, 0, 0, 0.18, 4.10, 12.8, { tint: [1,1,1,1], us: 5, vs: 2 });
  dm('box', 'darkTimber',  5.8, 2.53, 22.4, 0, 0, 0, 0.18, 4.10, 10.4, { tint: [1,1,1,1], us: 4, vs: 2 });
  dm('box', 'darkTimber',  5.8, 3.72, 16.2, 0, 0, 0, 0.18, 1.72, 2.0, { tint: [1,1,1,1] });
  dm('box', 'darkTimber',  0.0, 2.53, 27.6, 0, 0, 0, 11.6, 4.10, 0.18, { tint: [1,1,1,1], us: 4, vs: 2 });
  dm('box', 'darkTimber',  0.0, 4.58, 21.2, 0, 0, 0, 11.8, 0.16, 13.0, { tint: [1,1,1,1], us: 5, vs: 5 });

  // 6 Cột son thếp vàng (X = ±4.2, Z = 17.8 / 21.6 / 25.4)
  var colZs = [17.8, 21.6, 25.4];
  for (var ci = 0; ci < colZs.length; ci++) {
    var cz = colZs[ci];
    dm('box', 'darkTimber', 0.0, 4.44, cz, 0, 0, 0, 11.4, 0.24, 0.24, { tint: [1, 0.36, 0.26, 1] });
    for (var sgn = -1; sgn <= 1; sgn += 2) {
      var cx = sgn * 4.2;
      dm('box', 'stonePath', cx, 0.60, cz, 0, 0, 0, 0.58, 0.24, 0.58, { tint: [1,1,1,1] });
      dm('cyl', 'darkTimber', cx, 2.55, cz, 0, 0, 0, 0.44, 3.90, 0.44, { tint: [1.18, 0.26, 0.20, 1] });
      dm('cyl', 'white', cx, 4.18, cz, 0, 0, 0, 0.52, 0.16, 0.52, { tint: [0.98, 0.78, 0.20, 1] });
    }
  }

  // Mỹ thuật tường Chánh Điện (Hoành phi, Câu đối, Tranh Sen/Pháp Luân)
  dm('quad', 'daiHungSign',  0.0, 3.95, 27.46, 0, Math.PI, 0, 4.6, 0.92, 1, { tint: [1,1,1,1] });
  dm('quad', 'coupletLeft', -4.2, 2.52, 27.46, 0, Math.PI, 0, 0.85, 2.45, 1, { tint: [1,1,1,1] });
  dm('quad', 'coupletRight', 4.2, 2.52, 27.46, 0, Math.PI, 0, 0.85, 2.45, 1, { tint: [1,1,1,1] });
  dm('quad', 'lotusDharmaArt', -5.66, 2.45, 19.6, 0, Math.PI * 0.5, 0, 1.85, 1.85, 1, { tint: [1,1,1,1] });
  dm('quad', 'lotusDharmaArt', -5.66, 2.45, 23.8, 0, Math.PI * 0.5, 0, 1.85, 1.85, 1, { tint: [1,1,1,1] });
  dm('quad', 'lotusDharmaArt',  5.66, 2.45, 21.8, 0, -Math.PI * 0.5, 0, 1.85, 1.85, 1, { tint: [1,1,1,1] });

  // 6 Đèn lồng lụa đỏ Chánh Điện
  var hLamps = [[-2.6, 17.8], [2.6, 17.8], [-2.6, 21.6], [2.6, 21.6], [-2.2, 25.0], [2.2, 25.0]];
  for (var hli = 0; hli < hLamps.length; hli++) {
    dm('cyl', 'white', hLamps[hli][0], 4.10, hLamps[hli][1], 0, 0, 0, 0.03, 0.85, 0.03, { tint: [0.18,0.12,0.08,1] });
    dm('sphere', 'white', hLamps[hli][0], 3.55, hLamps[hli][1], 0, 0, 0, 0.34, 0.42, 0.34, { tint: [0.96, 0.28, 0.16, 1], emissive: 1.25 });
  }

  // 3 Chiếu lạy / Bồ đoàn đỏ vàng
  var matsX = [-2.0, 0.0, 2.0];
  for (var mxi = 0; mxi < matsX.length; mxi++) {
    dm('box', 'goldLacquer', matsX[mxi], 0.53, 21.8, 0, 0, 0, 0.96, 0.10, 0.96, { tint: [1,1,1,1] });
  }

  // Phật Đài & Tượng Phật Vàng 12 Tia Hào Quang (Z ∈ [25.4, 27.3])
  dm('box', 'darkTimber',  0.0, 0.72, 26.35, 0, 0, 0, 5.4, 0.48, 1.85, { tint: [1,1,1,1] });
  dm('box', 'goldLacquer', 0.0, 1.18, 26.45, 0, 0, 0, 4.2, 0.46, 1.50, { tint: [1,1,1,1] });
  dm('cyl', 'white', -2.05, 1.68, 26.15, 0, 0, 0, 0.30, 0.52, 0.30, { tint: [0.85, 0.62, 0.18, 1] });
  dm('cyl', 'white',  2.05, 1.68, 26.15, 0, 0, 0, 0.30, 0.52, 0.30, { tint: [0.85, 0.62, 0.18, 1] });
  dm('sphere', 'white', -2.05, 2.02, 26.15, 0, 0, 0, 0.24, 0.20, 0.24, { tint: [0.96, 0.45, 0.72, 1] });
  dm('sphere', 'white',  2.05, 2.02, 26.15, 0, 0, 0, 0.24, 0.20, 0.24, { tint: [0.96, 0.45, 0.72, 1] });
  // Tòa sen + Tượng Phật Vàng
  dm('cyl', 'white', 0.0, 1.56, 26.40, 0, 0, 0, 1.68, 0.28, 1.32, { tint: [0.95, 0.42, 0.68, 1] });
  dm('cyl', 'white', 0.0, 1.76, 26.40, 0, 0, 0, 1.38, 0.14, 1.08, { tint: [0.99, 0.84, 0.22, 1] });
  dm('box', 'white', 0.0, 1.98, 26.35, 0, 0, 0, 1.16, 0.32, 0.78, { tint: [0.98, 0.78, 0.18, 1], specPow: 64 });
  dm('cyl', 'white', 0.0, 2.48, 26.40, 0, 0, 0, 0.74, 0.74, 0.56, { tint: [0.96, 0.72, 0.14, 1], specPow: 64 });
  dm('sphere', 'white', 0.0, 3.06, 26.40, 0, 0, 0, 0.46, 0.46, 0.46, { tint: [0.99, 0.84, 0.26, 1], specPow: 64 });
  dm('sphere', 'white', 0.0, 3.34, 26.40, 0, 0, 0, 0.20, 0.16, 0.20, { tint: [0.95, 0.72, 0.12, 1] });
  // 12 Tia Hào Quang Vàng xoay chậm phía sau tượng
  var haloPulse = 1 + Math.sin(t * 2.8) * 0.05 + (st.incenseGlow > 0 ? 0.14 : 0);
  dm('torus', 'white', 0.0, 2.95, 26.82, Math.PI * 0.5, 0, 0, 1.95 * haloPulse, 1.95 * haloPulse, 0.25, { tint: [0.99, 0.88, 0.28, 1], emissive: st.incenseGlow > 0 ? 1.55 : 1.18 });
  for (var ray = 0; ray < 12; ray++) {
    var rAng = t * 0.35 + (ray * Math.PI * 2) / 12;
    dm('box', 'white', Math.cos(rAng) * 1.15 * haloPulse, 2.95 + Math.sin(rAng) * 1.15 * haloPulse, 26.86, 0, 0, rAng, 0.72 * haloPulse, 0.07, 0.04, { tint: [0.99, 0.90, 0.32, 1], emissive: 1.3 });
  }

  // Lư Hương Đồng & Khói Trầm (Z ∈ [23.2, 24.5])
  dm('box', 'stonePath', 0.0, 0.60, 23.85, 0, 0, 0, 1.12, 0.24, 1.12, { tint: [1,1,1,1] });
  dm('cup', 'white', 0.0, 1.05, 23.85, 0, 0, 0, 0.88, 0.66, 0.88, { tint: [0.58, 0.38, 0.14, 1], specPow: 72 });
  dm('torus', 'white', 0.0, 1.38, 23.85, Math.PI * 0.5, 0, 0, 0.82, 0.82, 0.25, { tint: [0.95, 0.72, 0.18, 1] });
  for (var sk = -1; sk <= 1; sk++) {
    dm('cyl', 'white', sk * 0.12, 1.52, 23.85, 0, 0, sk * 0.08, 0.03, 0.32, 0.03, { tint: [0.76, 0.16, 0.14, 1] });
    dm('sphere', 'white', sk * 0.14, 1.68, 23.85, 0, 0, 0, 0.05, 0.05, 0.05, { tint: [1.0, 0.65, 0.20, 1], emissive: st.incenseGlow > 0 ? 1.8 : 1.2 });
  }

  // E. CONNECTOR 2: CỔNG VÒM TRE + 2 BẬC ĐÁ (X ∈ [5.6, 7.0], Z ∈ [10.4, 13.0], Y: 0 -> 0.36)
  dm('box', 'stonePath', 5.95, 0.09, 11.7, 0, 0, 0, 0.70, 0.18, 2.55, { tint: [1,1,1,1] });
  dm('box', 'stonePath', 6.65, 0.18, 11.7, 0, 0, 0, 0.70, 0.36, 2.55, { tint: [1,1,1,1] });
  dm('cyl', 'white', 6.2, 1.25, 10.48, 0, 0, 0, 0.18, 2.45, 0.18, { tint: [0.38, 0.58, 0.16, 1] });
  dm('cyl', 'white', 6.2, 1.25, 12.92, 0, 0, 0, 0.18, 2.45, 0.18, { tint: [0.38, 0.58, 0.16, 1] });
  dm('arch', 'white', 6.2, 2.38, 11.7, 0, Math.PI * 0.5, 0, 2.6, 0.65, 0.28, { tint: [0.46, 0.68, 0.18, 1] });
  dm('quad', 'thienTraSign', 6.04, 2.68, 11.7, 0, -Math.PI * 0.5, 0, 2.35, 0.52, 1, { tint: [1,1,1,1] });

  // F. KHU 3: HÀNH LANG MÁI CHE ĐÔNG (X ∈ [5.8, 8.6], Z ∈ [14.8, 17.6], CHẾ ĐỘ A KÍN)
  dm('box', 'stonePath', 7.2, 0.42, 16.4, 0, 0, 0, 2.8, 0.12, 2.4, { tint: [1,1,1,1] });
  dm('box', 'stonePath', 7.3, 0.21, 14.9, 0, 0, 0, 2.2, 0.42, 0.6, { tint: [1,1,1,1] });
  dm('box', 'ochreWall', 8.6, 2.15, 16.2, 0, 0, 0, 0.16, 3.7, 2.8, { tint: [1,1,1,1] });
  dm('quad', 'bambooWindow', 8.50, 2.15, 16.2, 0, -Math.PI * 0.5, 0, 1.8, 1.55, 1, { tint: [1,1,1,1] });
  dm('box', 'ochreWall', 7.2, 2.15, 17.6, 0, 0, 0, 2.8, 3.7, 0.16, { tint: [1,1,1,1] });
  dm('box', 'yinYangRoof', 7.2, 3.88, 16.2, 0, 0, 0, 3.0, 0.18, 3.0, { tint: [1,1,1,1], us: 2, vs: 2 });
  dm('sphere', 'white', 7.2, 3.35, 16.2, 0, 0, 0, 0.24, 0.28, 0.24, { tint: [0.99, 0.90, 0.56, 1], emissive: 1.25 });

  // G. KHU 4: NHÀ CHUÔNG & THIỀN TRÀ CÁNH ĐÔNG (X ∈ [6.2, 16.8], Z ∈ [5.6, 14.8], Y = 0.36, CHẾ ĐỘ A KÍN)
  dm('box', 'teaWoodFloor', 11.5, 0.30, 10.2, 0, 0, 0, 10.6, 0.12, 9.2, { tint: [1,1,1,1], us: 5, vs: 4 });
  dm('box', 'ochreWall', 16.8, 2.28, 10.2, 0, 0, 0, 0.18, 3.92, 9.2, { tint: [1,1,1,1], us: 4, vs: 2 });
  dm('box', 'ochreWall', 11.5, 2.28,  5.6, 0, 0, 0, 10.6, 3.92, 0.18, { tint: [1,1,1,1], us: 4, vs: 2 });
  // Tường Bắc Nhà Chuông Z = 14.8 (chừa cửa Bắc nối east_corridor X ∈ [6.4, 8.4])
  dm('box', 'ochreWall', 12.6, 2.28, 14.8, 0, 0, 0, 8.4, 3.92, 0.18, { tint: [1,1,1,1], us: 3.5, vs: 2 });
  dm('box', 'ochreWall',  7.4, 3.48, 14.8, 0, 0, 0, 2.2, 1.52, 0.18, { tint: [1,1,1,1] });
  dm('box', 'darkTimber', 11.5, 4.24, 10.2, 0, 0, 0, 10.8, 0.16, 9.4, { tint: [1,1,1,1], us: 4, vs: 4 });

  // Cửa sổ trúc & Thư pháp "TÂM AN" / "TĨNH TÂM" / Biển "ĐẠI HỒNG CHUNG"
  dm('quad', 'bambooWindow', 10.6, 2.28, 5.72, 0, 0, 0, 2.4, 1.75, 1, { tint: [1,1,1,1] });
  dm('quad', 'tinhTamScroll', 14.4, 2.38, 5.72, 0, 0, 0, 1.45, 1.75, 1, { tint: [1,1,1,1] });
  dm('quad', 'bambooWindow', 16.68, 2.28, 7.1, 0, -Math.PI * 0.5, 0, 1.85, 1.65, 1, { tint: [1,1,1,1] });
  dm('quad', 'bambooWindow', 16.68, 2.28, 12.5, 0, -Math.PI * 0.5, 0, 1.85, 1.65, 1, { tint: [1,1,1,1] });
  dm('quad', 'tamAnScroll', 16.68, 2.42, 9.6, 0, -Math.PI * 0.5, 0, 2.35, 2.05, 1, { tint: [1,1,1,1] });
  dm('quad', 'bellSign', 10.2, 3.35, 14.68, 0, Math.PI, 0, 3.2, 0.72, 1, { tint: [1,1,1,1] });

  // Đèn giấy ấm Nhà Chuông & Thiền Trà
  var tLamps = [[8.6, 8.2], [11.8, 8.2], [13.8, 11.8], [9.6, 13.0]];
  for (var tli = 0; tli < tLamps.length; tli++) {
    dm('cyl', 'white', tLamps[tli][0], 3.85, tLamps[tli][1], 0, 0, 0, 0.03, 0.68, 0.03, { tint: [0.22,0.14,0.08,1] });
    dm('sphere', 'white', tLamps[tli][0], 3.42, tLamps[tli][1], 0, 0, 0, 0.30, 0.34, 0.30, { tint: [0.99, 0.90, 0.62, 1], emissive: 1.2 });
  }

  // Đại Hồng Chung (9.2, 0.36, 11.4) AABB X ∈ [7.95, 10.45], Z ∈ [10.25, 12.55]
  dm('box', 'stonePath', 9.2, 0.48, 11.4, 0, 0, 0, 2.40, 0.24, 2.20, { tint: [1,1,1,1] });
  var bellCols = [[-1.02, -0.92], [1.02, -0.92], [-1.02, 0.92], [1.02, 0.92]];
  for (var bci = 0; bci < bellCols.length; bci++) {
    dm('box', 'darkTimber', 9.2 + bellCols[bci][0], 1.88, 11.4 + bellCols[bci][1], 0, 0, 0, 0.20, 2.65, 0.20, { tint: [1.05, 0.28, 0.20, 1] });
  }
  dm('box', 'goldLacquer', 9.2, 3.22, 11.4, 0, 0, 0, 2.48, 0.24, 0.34, { tint: [1,1,1,1] });
  var bSwing = st.bellRingTimer > 0 ? Math.sin(st.bellSwingPhase) * 0.14 * Math.min(1, st.bellRingTimer / 1.5) : Math.sin(t * 0.8) * 0.012;
  dm('cyl', 'white', 9.2 + bSwing * 0.5, 2.86, 11.4, 0, 0, bSwing, 0.22, 0.44, 0.22, { tint: [0.80, 0.58, 0.14, 1] });
  dm('cone', 'white', 9.2 + bSwing, 2.28, 11.4, 0, 0, bSwing, 0.98, 0.72, 0.98, { tint: [0.46, 0.36, 0.20, 1], specPow: 72 });
  dm('cup', 'white', 9.2 + bSwing * 1.15, 1.54, 11.4, 0, 0, bSwing, 1.18, 0.84, 1.18, { tint: [0.38, 0.30, 0.16, 1], specPow: 72 });
  var strikeOff = st.bellRingTimer > 0 ? -Math.abs(Math.sin(st.bellSwingPhase)) * 0.34 : 0;
  dm('cyl', 'darkTimber', 10.42 + strikeOff, 1.62, 11.4, 0, 0, Math.PI * 0.5, 0.16, 0.92, 0.16, { tint: [0.78, 0.48, 0.22, 1] });
  if (st.bellRingTimer > 0) {
    wgl.setBlend('add');
    for (var rw = 0; rw < 3; rw++) {
      var rp = ((3.4 - st.bellRingTimer) * 1.05 + rw * 0.33) % 1;
      dm('torus', 'white', 9.2, 1.72, 11.4, Math.PI * 0.5, 0, 0, 0.8 + rp * 2.2, 0.8 + rp * 2.2, 0.22, { tint: [0.99, 0.88, 0.32, (1 - rp) * 0.65], emissive: 1.3 });
    }
    wgl.setBlend(null);
  }

  // Bàn Trà Bát Tràng & Chiếu Thiền TÂM AN (13.8, 0.36, 9.6) AABB X ∈ [13.05, 14.55], Z ∈ [8.75, 10.45]
  dm('box', 'sedgeMat', 13.8, 0.37, 9.6, 0, 0, 0, 3.8, 0.02, 3.4, { tint: [1,1,1,1] });
  dm('box', 'darkTimber', 13.8, 0.74, 9.6, 0, 0, 0, 1.36, 0.09, 1.56, { tint: [0.72, 0.46, 0.28, 1] });
  var tLegs = [[-0.54, -0.62], [0.54, -0.62], [-0.54, 0.62], [0.54, 0.62]];
  for (var tli2 = 0; tli2 < tLegs.length; tli2++) {
    dm('box', 'darkTimber', 13.8 + tLegs[tli2][0], 0.54, 9.6 + tLegs[tli2][1], 0, 0, 0, 0.12, 0.36, 0.12, { tint: [0.46, 0.28, 0.16, 1] });
  }
  // Đệm thiền cho Heo (12.55, 0.36, 9.6) & Thiền sư (15.05, 0.36, 9.6)
  dm('box', 'white', 12.55, 0.43, 9.6, 0, 0, 0, 0.72, 0.12, 0.72, { tint: [0.30, 0.49, 0.08, 1] });
  dm('box', 'white', 15.05, 0.43, 9.6, 0, 0, 0, 0.72, 0.12, 0.72, { tint: [0.30, 0.49, 0.08, 1] });
  // Bộ ấm trà Bát Tràng trên bàn
  dm('sphere', 'white', 13.80, 0.87, 9.55, 0, 0, 0, 0.18, 0.14, 0.18, { tint: [0.85, 0.92, 0.96, 1], specPow: 84 });
  dm('cyl', 'white', 13.80, 0.93, 9.55, 0, 0, 0, 0.07, 0.03, 0.07, { tint: [0.16, 0.36, 0.65, 1] });
  dm('cup', 'white', 13.52, 0.82, 9.75, 0, 0, 0, 0.06, 0.05, 0.06, { tint: [0.96, 0.98, 0.99, 1] });
  dm('cup', 'white', 14.08, 0.82, 9.45, 0, 0, 0, 0.06, 0.05, 0.06, { tint: [0.96, 0.98, 0.99, 1] });
  dm('cyl', 'white', 13.80, 0.90, 9.15, 0, 0, 0, 0.10, 0.22, 0.10, { tint: [0.10, 0.46, 0.24, 1] });

  // H. 6 NPC PIXEL BILLBOARD (monk & worshipper) + CHÚ HEO MASCOT 24×20 (gl.NEAREST)
  if (typeof drawHumanBillboardWebgl === 'function' && st.npcs) {
    for (var ni = 0; ni < st.npcs.length; ni++) {
      drawHumanBillboardWebgl(wgl, cam, st.npcs[ni], t);
    }
  }
  if (typeof drawPigBillboardWebgl === 'function') {
    drawPigBillboardWebgl(wgl, cam, st.pig, t, false);
  }

  // I. VÒNG SÓNG CHẠM SÀN & KHÓI TRẦM BAY LÊN
  wgl.setBlend('add');
  for (var ri = 0; ri < st.ripples.length; ri++) {
    var rp = st.ripples[ri];
    var rAlpha = Math.max(0, 1 - rp.t / 0.75) * 0.65;
    dm('torus', 'white', rp.x, (rp.y || 0) + 0.03, rp.z, Math.PI * 0.5, 0, 0, 0.32 + rp.t * 0.85, 0.32 + rp.t * 0.85, 0.2, { tint: [0.98, 0.80, 0.32, rAlpha], emissive: 1.2 });
  }
  for (var spi = 0; spi < st.smokeParticles.length; spi++) {
    var sp = st.smokeParticles[spi];
    var prog = (sp.y - 1.46) / 1.5;
    var sAlpha = Math.max(0.04, (1 - prog) * (st.incenseGlow > 0 ? 0.45 : 0.24));
    dm('sphere', 'white', sp.x + Math.sin(t * 2.2 + sp.phase) * 0.09, sp.y, sp.z, 0, 0, 0, 0.09 + prog * 0.12, 0.11 + prog * 0.12, 0.09 + prog * 0.12, { tint: [0.98, 0.94, 0.84, sAlpha], emissive: 1.0 });
  }
  wgl.setBlend(null);
}

/* ==================== 4. FALLBACK CANVAS2D CHO HEADLESS TEST 182 & THIẾT BỊ KHÔNG WEBGL ==================== */
function renderPagodaTpsScene(ctx, cam, st, W, H) {
  var t = st.t;
  // Bầu trời vàng ấm thanh tịnh
  ctx.fillStyle = '#F5E4BE';
  ctx.fillRect(0, 0, W, H);

  // Sân Vườn Chùa & Lối đá phiến (Y = 0)
  drawPoly3D(ctx, cam, [[-6.2, 0, 0], [6.2, 0, 0], [6.2, 0, 14.8], [-6.2, 0, 14.8]], '#A64B2A', '#7C2D12', 1);
  for (var tz = 0; tz < 14.8; tz += 2.2) {
    drawPoly3D(ctx, cam, [[-6.2, 0.004, tz], [6.2, 0.004, tz], [6.2, 0.004, tz + 1.0], [-6.2, 0.004, tz + 1.0]], '#B55835', '#8A3B1E', 0.4);
  }
  drawPoly3D(ctx, cam, [[-1.25, 0.01, 0], [1.25, 0.01, 0], [1.25, 0.01, 14.0], [-1.25, 0.01, 14.0]], '#D6CFC2', '#8C857B', 1);

  // Tường bao Vườn Chùa & Cổng Tam Quan (Z = 0)
  drawPoly3D(ctx, cam, [[-6.2, 0, 0], [-6.2, 0, 14.8], [-6.2, 3.05, 14.8], [-6.2, 3.05, 0]], '#D4A359', '#926227', 1);
  drawPoly3D(ctx, cam, [[6.2, 0, 10.4], [6.2, 0, 0], [6.2, 3.05, 0], [6.2, 3.05, 10.4]], '#C48E42', '#926227', 1);
  drawPoly3D(ctx, cam, [[-6.2, 0, 14.8], [-2.0, 0, 14.8], [-2.0, 3.2, 14.8], [-6.2, 3.2, 14.8]], '#C9954A', '#926227', 1);
  drawPoly3D(ctx, cam, [[2.0, 0, 14.8], [6.2, 0, 14.8], [6.2, 3.2, 14.8], [2.0, 3.2, 14.8]], '#C9954A', '#926227', 1);

  // Sàn Chánh Điện (Y = 0.48), Hành Lang Đông & Nhà Chuông Thiền Trà (Y = 0.36)
  drawPoly3D(ctx, cam, [[-5.8, 0.48, 14.8], [5.8, 0.48, 14.8], [5.8, 0.48, 27.6], [-5.8, 0.48, 27.6]], '#5C261B', '#38150E', 1);
  drawPoly3D(ctx, cam, [[-1.35, 0.49, 15.2], [1.35, 0.49, 15.2], [1.35, 0.49, 23.0], [-1.35, 0.49, 23.0]], '#991B1B', '#F59E0B', 1.2);
  drawPoly3D(ctx, cam, [[5.8, 0.48, 15.2], [8.6, 0.48, 15.2], [8.6, 0.48, 17.6], [5.8, 0.48, 17.6]], '#A8A29E', '#57534E', 1);
  drawPoly3D(ctx, cam, [[6.2, 0.36, 5.6], [16.8, 0.36, 5.6], [16.8, 0.36, 14.8], [6.2, 0.36, 14.8]], '#7C5230', '#4A2C1A', 1);

  if (typeof drawPagodaWalls3D === 'function') {
    drawPagodaWalls3D(ctx, cam);
  }

  for (var ri = 0; ri < st.ripples.length; ri++) {
    var rp = st.ripples[ri];
    var rPr = projectPoint3D(cam, rp.x, (rp.y || 0) + 0.02, rp.z);
    if (rPr) {
      ctx.save();
      ctx.strokeStyle = 'rgba(244,185,59,' + (1 - rp.t / 0.75).toFixed(2) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(rPr.sx, rPr.sy, (6 + rp.t * 28), (3 + rp.t * 12), 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  var items = [];
  function pushItem(wx, wz, fn) {
    items.push({ d: Math.hypot(wx - cam.pos.x, wz - cam.pos.z), fn: fn });
  }

  // Hồ Sen & Chùa Một Cột (-3.15, 6.65)
  pushItem(-3.15, 6.65, function() {
    drawBox3D(ctx, cam, -3.15, 0, 3.65, 4.1, 0.24, 0.22, { top: '#D6D3D1', front: '#A8A29E', side: '#78716C', stroke: '#44403C' });
    drawBox3D(ctx, cam, -3.15, 0, 9.65, 4.1, 0.24, 0.22, { top: '#D6D3D1', front: '#A8A29E', side: '#78716C', stroke: '#44403C' });
    drawPoly3D(ctx, cam, [[-5.05, 0.08, 3.76], [-1.25, 0.08, 3.76], [-1.25, 0.08, 9.54], [-5.05, 0.08, 9.54]], '#0D9488', '#115E59', 1);
    drawBox3D(ctx, cam, -3.15, 0.08, 6.65, 0.48, 1.15, 0.48, { top: '#D6D3D1', front: '#A8A29E', side: '#78716C', stroke: '#44403C' });
    drawBox3D(ctx, cam, -3.15, 1.22, 6.65, 1.72, 0.14, 1.72, { top: '#991B1B', front: '#7F1D1D', side: '#5C1111', stroke: '#2B180E' });
    drawBox3D(ctx, cam, -3.15, 1.36, 6.65, 1.32, 0.82, 1.32, { top: '#991B1B', front: '#B91C1C', side: '#7F1D1D', stroke: '#450A0A' });
    drawBox3D(ctx, cam, -3.15, 2.18, 6.65, 1.98, 0.22, 1.98, { top: '#B91C1C', front: '#991B1B', side: '#7F1D1D', stroke: '#450A0A' });
    drawBox3D(ctx, cam, -3.15, 2.40, 6.65, 1.34, 0.24, 1.34, { top: '#DC2626', front: '#B91C1C', side: '#991B1B', stroke: '#450A0A' });
    drawBox3D(ctx, cam, -3.15, 2.64, 6.65, 0.18, 0.34, 0.18, { top: '#FEF08A', front: '#FACC15', side: '#CA8A04', stroke: '#78350F' });
  });

  // Cây Đa Cổ Thụ (4.15, 6.85)
  pushItem(4.15, 6.85, function() {
    drawBox3D(ctx, cam, 4.15, 0, 6.85, 1.75, 0.36, 1.75, { top: '#B45309', front: '#9A3412', side: '#7C2D12', stroke: '#451A03' });
    drawBox3D(ctx, cam, 4.15, 0.36, 6.85, 0.68, 1.95, 0.68, { top: '#78350F', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
    drawBox3D(ctx, cam, 4.15, 2.08, 6.85, 2.55, 0.72, 2.45, { top: '#22C55E', front: '#15803D', side: '#166534', stroke: '#14532D' });
    drawBox3D(ctx, cam, 3.80, 2.66, 6.65, 1.85, 0.56, 1.75, { top: '#4ADE80', front: '#16A34A', side: '#15803D', stroke: '#14532D' });
  });

  // 3 Bậc Đá Tam Cấp (X ∈ [-2.0, 2.0], Z ∈ [14.0, 15.4])
  pushItem(0, 14.7, function() {
    for (var s = 0; s < 3; s++) {
      drawBox3D(ctx, cam, 0, 0, 14.23 + s * 0.47, 4.0, (s + 1) * 0.16, 0.47, { top: '#E7E5E4', front: '#A8A29E', side: '#78716C', stroke: '#44403C' });
    }
  });

  // Cổng Vòm Tre + 2 Bậc Đá (X ∈ [5.6, 7.0], Z ∈ [10.4, 13.0])
  pushItem(6.2, 11.7, function() {
    drawBox3D(ctx, cam, 6.2, 0, 10.48, 0.22, 2.35, 0.22, { top: '#65A30D', front: '#4D7C0F', side: '#3F6212', stroke: '#1A2E05' });
    drawBox3D(ctx, cam, 6.2, 0, 12.92, 0.22, 2.35, 0.22, { top: '#65A30D', front: '#4D7C0F', side: '#3F6212', stroke: '#1A2E05' });
    drawBox3D(ctx, cam, 6.2, 2.24, 11.70, 0.30, 0.22, 2.60, { top: '#84CC16', front: '#4D7C0F', side: '#3F6212', stroke: '#1A2E05' });
  });

  // 6 Cột Chánh Điện + Lư Hương + Phật Đài (Y = 0.48)
  var pZs = [17.8, 21.6, 25.4];
  for (var pi = 0; pi < pZs.length; pi++) {
    (function(pz) {
      pushItem(-4.2, pz, function() {
        drawBox3D(ctx, cam, -4.2, 0.48, pz, 0.46, 3.85, 0.46, { top: '#991B1B', front: '#B91C1C', side: '#7F1D1D', stroke: '#450A0A' });
      });
      pushItem(4.2, pz, function() {
        drawBox3D(ctx, cam,  4.2, 0.48, pz, 0.46, 3.85, 0.46, { top: '#991B1B', front: '#B91C1C', side: '#7F1D1D', stroke: '#450A0A' });
      });
    })(pZs[pi]);
  }
  pushItem(0, 23.85, function() {
    drawBox3D(ctx, cam, 0, 0.48, 23.85, 1.12, 0.26, 1.12, { top: '#78716C', front: '#57534E', side: '#44403C', stroke: '#292524' });
    drawBox3D(ctx, cam, 0, 0.74, 23.85, 0.86, 0.66, 0.86, { top: '#92400E', front: '#78350F', side: '#5C2D0C', stroke: '#F59E0B' });
  });
  pushItem(0, 26.35, function() {
    drawBox3D(ctx, cam, 0, 0.48, 26.35, 5.4, 0.48, 1.85, { top: '#7C2D12', front: '#5C1D14', side: '#4A1810', stroke: '#2B180E' });
    drawBox3D(ctx, cam, 0, 0.96, 26.40, 1.85, 0.30, 1.35, { top: '#F472B6', front: '#EC4899', side: '#BE185D', stroke: '#FDE047' });
    drawBox3D(ctx, cam, 0, 1.26, 26.40, 1.18, 0.42, 0.78, { top: '#FEF08A', front: '#FACC15', side: '#CA8A04', stroke: '#92400E' });
    drawBox3D(ctx, cam, 0, 1.68, 26.40, 0.78, 0.74, 0.54, { top: '#FEF08A', front: '#F59E0B', side: '#D97706', stroke: '#92400E' });
  });

  // Đại Hồng Chung (9.2, 0.36, 11.4) & Bàn trà TÂM AN (13.8, 0.36, 9.6)
  pushItem(9.2, 11.4, function() {
    drawBox3D(ctx, cam, 9.2, 0.36, 11.4, 2.40, 0.24, 2.20, { top: '#A8A29E', front: '#78716C', side: '#57534E', stroke: '#292524' });
    drawBox3D(ctx, cam, 9.2, 1.10, 11.4, 1.18, 1.18, 1.18, { top: '#6B5630', front: '#4E3F22', side: '#3B2F19', stroke: '#D97706' });
  });
  pushItem(13.8, 9.6, function() {
    drawBox3D(ctx, cam, 13.8, 0.68, 9.6, 1.32, 0.10, 1.56, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
    drawBatTrangTeapotSprite3D(ctx, cam, 13.8, 0.85, 9.55);
  });

  // 6 NPCs + Chú Heo Mascot
  for (var ni = 0; ni < st.npcs.length; ni++) {
    (function(npc) {
      pushItem(npc.x, npc.z, function() { drawHumanTps3D(ctx, cam, npc, t); });
    })(st.npcs[ni]);
  }
  pushItem(st.pig.x, st.pig.z, function() { drawPigTps3D(ctx, cam, st.pig, t); });

  items.sort(function(a, b) { return b.d - a.d; });
  for (var ii = 0; ii < items.length; ii++) items[ii].fn();

  if (st.exitFade > 0.01) {
    ctx.save();
    ctx.fillStyle = 'rgba(246, 238, 220, ' + st.exitFade.toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}
`;
}
