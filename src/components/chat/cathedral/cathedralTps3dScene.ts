/**
 * Nhà Thờ Đức Bà Sài Gòn — Không Gian WebGL 3D Hợp Nhất Không Cắt Cảnh (Quyết định 250)
 * - Chế độ A (Nội thất kín 100%, trần vòm Gothic cao 7.8m, thông trục nave ↔ sanctuary):
 *   1. nave: X ∈ [-6.0, 6.0], Z ∈ [0, 14.8], Y = 0, 2 dãy ghế gỗ lim trái/phải, Chậu nước phép (2.1, 0, 1.4).
 *   2. sanctuary: X ∈ [-5.5, 5.5], Z ∈ [14.8, 24.4], Y = 0.45, nối qua 3 Bậc Đá Cẩm Thạch (17.8°),
 *      2 giá nến X = ±3.2, Bàn Thờ đá hoa cương + Sách Lễ đỏ viền vàng (-0.85, 1.51, 20.65), Tượng Đức Mẹ Hòa Bình.
 *   3. belfry (Cánh Tây): X ∈ [-15.2, -6.0], Z ∈ [4.0, 14.8], Y = 4.0 (trần 7.8m), lan can Gothic mở dọc X = -6.0,
 *      nối qua Cầu thang chữ L 14 bậc (33.7°): Nhánh 1 (-X) → Chiếu nghỉ giữa → Nhánh 2 (-Z) → Chiếu nghỉ đỉnh,
 *      Pipe Organ 17 ống & Chuông Đồng 1880 (-11.6, 4.0, 6.2).
 * - Portal-Aware Spring-Arm (dividerWalls tại X = -6.0 & biên L-shape) + CATHEDRAL_NAV_GRAPH + rayRampQuad.
 * - 10 giáo dân parishioner (8 ngồi ghế + 2 đi bộ liên hoàn) dùng drawHumanBillboardWebgl gl.NEAREST rõ mặt pixel,
 *   cùng Chú Heo 24×20 drawPigBillboardWebgl & Canvas2D fallback cho Test 182.
 */
export function buildCathedralTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. ĐỒ THỊ KHÔNG GIAN HỢP NHẤT & PORTAL-AWARE SPRING-ARM (QĐ 250) ==================== */
var CATHEDRAL_NAV_GRAPH = {
  wallMargin: 0.38,
  outerBounds: { minX: -15.2, maxX: 6.0, minZ: 0.0, maxZ: 24.4, minY: 0.45, maxY: 7.8 },
  zones: [
    { id: 'nave',         minX: -6.0,  maxX:  6.0,  minZ:  0.0, maxZ: 14.8, floorY: 0.0  },
    { id: 'sanctuary',    minX: -5.5,  maxX:  5.5,  minZ: 14.8, maxZ: 24.4, floorY: 0.45 },
    { id: 'belfry_mid',   minX: -7.5,  maxX: -6.0,  minZ: 10.9, maxZ: 12.7, floorY: 2.0  },
    { id: 'belfry_top',   minX: -7.5,  maxX: -6.0,  minZ:  6.3, maxZ:  7.9, floorY: 4.0  },
    { id: 'belfry_west',  minX: -15.2, maxX: -7.55, minZ:  4.0, maxZ: 14.8, floorY: 4.0  },
    { id: 'belfry_north', minX: -7.55, maxX: -6.0,  minZ: 12.9, maxZ: 14.8, floorY: 4.0  }
  ],
  ramps: [
    { id: 'sanctuary_steps', axis: 'z', minX: -2.2, maxX:  2.2,  minZ: 14.6, maxZ: 16.0, zStart: 14.6, zEnd: 16.0, yStart: 0.0, yEnd: 0.45, maxCurY: 1.5 },
    { id: 'l_stair_1',       axis: 'x', minX: -6.0, maxX: -3.0,  minZ: 11.1, maxZ: 12.5, xStart: -3.0, xEnd: -6.0, yStart: 0.0, yEnd: 2.0,  maxCurY: 3.0 },
    { id: 'l_stair_2',       axis: 'z', minX: -7.4, maxX: -6.05, minZ:  7.9, maxZ: 10.9, zStart: 10.9, zEnd:  7.9, yStart: 2.0, yEnd: 4.0,  minCurY: 1.35 }
  ],
  edges: [
    {
      from: 'nave', to: 'sanctuary',
      waypointsForward:  [{ x: 0, y: 0, z: 14.35 }, { x: 0, y: 0.45, z: 16.2 }],
      waypointsBackward: [{ x: 0, y: 0.45, z: 16.2 }, { x: 0, y: 0, z: 14.35 }]
    },
    {
      from: 'nave', to: 'belfry_mid',
      waypointsForward:  [{ x: -2.55, y: 0, z: 11.8 }, { x: -6.75, y: 2.0, z: 11.8 }],
      waypointsBackward: [{ x: -6.75, y: 2.0, z: 11.8 }, { x: -2.55, y: 0, z: 11.8 }]
    },
    {
      from: 'belfry_mid', to: 'belfry_top',
      waypointsForward:  [{ x: -6.72, y: 2.0, z: 11.05 }, { x: -6.72, y: 4.0, z: 7.45 }],
      waypointsBackward: [{ x: -6.72, y: 4.0, z: 7.45 }, { x: -6.72, y: 2.0, z: 11.05 }]
    },
    {
      from: 'belfry_top', to: 'belfry_west',
      waypointsForward:  [{ x: -6.8, y: 4.0, z: 7.1 }, { x: -8.1, y: 4.0, z: 7.1 }],
      waypointsBackward: [{ x: -8.1, y: 4.0, z: 7.1 }, { x: -6.8, y: 4.0, z: 7.1 }]
    },
    {
      from: 'belfry_west', to: 'belfry_north',
      waypointsForward:  [{ x: -8.1, y: 4.0, z: 13.85 }, { x: -6.8, y: 4.0, z: 13.85 }],
      waypointsBackward: [{ x: -6.8, y: 4.0, z: 13.85 }, { x: -8.1, y: 4.0, z: 13.85 }]
    }
  ],
  dividerWalls: [
    // Tầng dưới X = -6.0 (Y ∈ [0, 4.0]): mở vòm Nhánh 1 tại Z ∈ [10.8, 12.8]
    { axis: 'x', pos: -6.0, minSpan: 0.0,  maxSpan: 14.8, minY: 0.0, maxY: 4.0, openings: [{ a1: 10.8, a2: 12.8, y1: 0.0, y2: 4.0 }] },
    // Tầng trên X = -6.0 (Y ∈ [4.0, 7.8]): mở lan can thông suốt Z ∈ [4.0, 7.8] & [12.9, 14.8]
    { axis: 'x', pos: -6.0, minSpan: 0.0,  maxSpan: 24.4, minY: 4.0, maxY: 7.8, openings: [{ a1: 4.0, a2: 7.8, y1: 4.0, y2: 7.8 }, { a1: 12.9, a2: 14.8, y1: 4.0, y2: 7.8 }] },
    // Bao ngoài Cánh Tây (belfry) & Cung Thánh (sanctuary)
    { axis: 'z', pos:  4.0, minSpan: -15.2, maxSpan: -6.0, minY: 0.0, maxY: 7.8, openings: [] },
    { axis: 'z', pos: 14.8, minSpan: -15.2, maxSpan: -6.0, minY: 0.0, maxY: 7.8, openings: [] },
    { axis: 'x', pos: -5.5, minSpan:  14.8, maxSpan: 24.4, minY: 0.0, maxY: 7.8, openings: [] },
    { axis: 'x', pos:  5.5, minSpan:  14.8, maxSpan: 24.4, minY: 0.0, maxY: 7.8, openings: [] }
  ]
};

var CATHEDRAL_ATMOSPHERE = {
  clearColor: [0.17, 0.11, 0.08, 1.0],
  hemiLow: [0.24, 0.18, 0.15],
  hemiHigh: [0.64, 0.56, 0.45],
  sunDir: [0.38, 0.72, 0.58],
  sunCol: [0.95, 0.80, 0.56],
  wrapBias: 0.46,
  lights: [
    { pos: [0.0,   5.4,  7.4], col: [1.18, 0.86, 0.46] },
    { pos: [0.0,   4.2, 20.6], col: [1.28, 0.92, 0.50] },
    { pos: [-11.3, 6.5,  9.8], col: [1.08, 0.78, 0.44] },
    { pos: [0.0,   2.6,  1.2], col: [0.85, 0.80, 0.72] }
  ],
  outdoorRect: [0, 0, 0, 0],
  fogCol: [0.22, 0.16, 0.13],
  fogParams: [14.0, 34.0, 0.38]
};

function getCathedralSurfaceY(x, z, curY) {
  if (typeof getNavGraphSurfaceY === 'function') {
    return getNavGraphSurfaceY(CATHEDRAL_NAV_GRAPH, x, z, curY);
  }
  // Fallback độc lập cho môi trường headless Test 182
  if (x >= -2.2 && x <= 2.2 && z >= 14.6 && z <= 16.0 && (curY || 0) < 1.5) {
    return Math.max(0, Math.min(0.45, ((z - 14.6) / 1.4) * 0.45));
  }
  if (x >= -6.0 && x <= -3.0 && z >= 11.1 && z <= 12.5 && (curY || 0) < 3.0) {
    return Math.max(0, Math.min(2.0, ((-3.0 - x) / 3.0) * 2.0));
  }
  if (x >= -7.4 && x <= -6.05 && z >= 7.9 && z <= 10.9 && (curY || 0) >= 1.35) {
    return 2.0 + Math.max(0, Math.min(2.0, ((10.9 - z) / 3.0) * 2.0));
  }
  if (x <= -6.0 && z >= 10.9 && z <= 12.7 && (curY || 0) >= 1.35 && (curY || 0) <= 2.85) return 2.0;
  if (x <= -6.0 && (curY || 0) > 2.85) return 4.0;
  if (z >= 14.8) return 0.45;
  return 0.0;
}

function createCathedralTpsState() {
  var pews = [
    { x: -2.8, z: 3.6 }, { x: -2.8, z: 5.5 }, { x: -2.8, z: 7.4 }, { x: -2.8, z: 9.3 },
    { x:  2.8, z: 3.6 }, { x:  2.8, z: 5.5 }, { x:  2.8, z: 7.4 }, { x:  2.8, z: 9.3 }
  ];

  // 8 giáo dân ngồi ghế gỗ + 2 giáo dân đi bộ xuyên suốt Thánh Đường ↔ Cung Thánh ↔ Tháp Chuông
  var parishioners = [
    { id: 'p1', role: 'parishioner', x: -3.25, y: 0, z: 3.45, yaw: 0, shirt: '#334155', hair: '#1C1917', seated: true, moving: false, state: 'SIT', phase: 0.2 },
    { id: 'p2', role: 'parishioner', x: -2.35, y: 0, z: 5.35, yaw: 0, shirt: '#7C2D12', hair: '#292524', seated: true, moving: false, state: 'SIT', phase: 0.9 },
    { id: 'p3', role: 'parishioner', x: -3.10, y: 0, z: 7.25, yaw: 0, shirt: '#1E3A8A', hair: '#1C1917', seated: true, moving: false, state: 'SIT', phase: 1.6 },
    { id: 'p4', role: 'parishioner', x: -2.40, y: 0, z: 9.15, yaw: 0, shirt: '#4C1D95', hair: '#292524', seated: true, moving: false, state: 'SIT', phase: 2.3 },
    { id: 'p5', role: 'parishioner', x:  2.35, y: 0, z: 3.45, yaw: 0, shirt: '#065F46', hair: '#1C1917', seated: true, moving: false, state: 'SIT', phase: 0.5 },
    { id: 'p6', role: 'parishioner', x:  3.25, y: 0, z: 5.35, yaw: 0, shirt: '#9F1239', hair: '#292524', seated: true, moving: false, state: 'SIT', phase: 1.2 },
    { id: 'p7', role: 'parishioner', x:  2.45, y: 0, z: 7.25, yaw: 0, shirt: '#3F6212', hair: '#1C1917', seated: true, moving: false, state: 'SIT', phase: 1.9 },
    { id: 'p8', role: 'parishioner', x:  3.15, y: 0, z: 9.15, yaw: 0, shirt: '#92400E', hair: '#292524', seated: true, moving: false, state: 'SIT', phase: 2.7 },
    {
      id: 'walker_sanctuary', role: 'parishioner',
      x: 0.45, y: 0, z: 11.4, yaw: 0, shirt: '#0F766E', hair: '#1C1917',
      seated: false, moving: true, state: 'WALK', timer: 0, stepIdx: 0, phase: 0.4,
      pts: [
        { x: 0.45, y: 0, z: 11.4 },
        { x: 0.45, y: 0, z: 14.3 },
        { x: 0.45, y: 0.45, z: 16.3 },
        { x: 2.35, y: 0.45, z: 18.8, wait: 3.4, yaw: Math.PI * 0.5 },
        { x: 0.55, y: 0.45, z: 16.3 },
        { x: 0.55, y: 0, z: 14.3 },
        { x: 0.55, y: 0, z: 2.6 },
        { x: 1.45, y: 0, z: 1.4, wait: 2.4, yaw: Math.PI * 0.5 }
      ]
    },
    {
      id: 'walker_belfry', role: 'parishioner',
      x: -9.8, y: 4.0, z: 11.6, yaw: 0, shirt: '#1D4ED8', hair: '#292524',
      seated: false, moving: true, state: 'WALK', timer: 0, stepIdx: 0, phase: 1.5,
      pts: [
        { x: -9.8, y: 4.0, z: 11.6 },
        { x: -11.3, y: 4.0, z: 12.2, wait: 3.2, yaw: 0 },
        { x: -10.2, y: 4.0, z: 7.4, wait: 2.8, yaw: Math.PI },
        { x: -8.1, y: 4.0, z: 7.1 },
        { x: -6.72, y: 4.0, z: 7.45 },
        { x: -6.72, y: 2.0, z: 11.05 },
        { x: -6.75, y: 2.0, z: 11.8 },
        { x: -2.55, y: 0, z: 11.8 },
        { x: -0.45, y: 0, z: 10.6 },
        { x: -0.45, y: 0, z: 3.4, wait: 2.5, yaw: 0 },
        { x: -0.45, y: 0, z: 10.6 },
        { x: -2.55, y: 0, z: 11.8 },
        { x: -6.75, y: 2.0, z: 11.8 },
        { x: -6.72, y: 2.0, z: 11.05 },
        { x: -6.72, y: 4.0, z: 7.45 },
        { x: -8.1, y: 4.0, z: 7.1 }
      ]
    }
  ];

  return {
    room: 'nave', // Chỉ giữ làm nhãn hiển thị & Canvas2D fallback (0 cắt cảnh!)
    pig: {
      x: 0, y: 0, z: 2.2, yaw: 0,
      targetX: 0, targetZ: 2.8,
      waypoints: [],
      walking: true, seated: false, seatChairId: -1,
      pendingAction: null, eating: false
    },
    pews: pews,
    parishioners: parishioners,
    candlesLit: 0,
    candleGlow: 0,
    candleSparks: [],
    holyWaterDrops: [],
    holyWaterCount: 0,
    maryHalo: 0,
    bellAngle: 0,
    bellVel: 0,
    bellWaves: [],
    organGlow: 0,
    doorOpen: 0.25,
    exitFade: 0,
    exiting: false,
    ripples: [],
    toast: 'Nhà Thờ Đức Bà Sài Gòn · Dạo bước dưới vòm Gothic 7.8m lên Cung Thánh & Gác Chuông ⛪',
    toastUntil: 5.0,
    t: 0
  };
}

function clampCathedralWalkPos(st, x, z, y) {
  var cy = typeof y === 'number' ? y : (st.pig ? st.pig.y || 0 : 0);
  var nx = x, nz = z;

  // Trên Nhánh 1 cầu thang chữ L (X ∈ [-6.0, -3.0], Z ∈ [11.1, 12.5])
  if (cy >= 0.15 && cy < 1.85 && nx <= -2.9) {
    nx = Math.max(-6.75, Math.min(-2.5, nx));
    nz = Math.max(11.3, Math.min(12.3, nz));
    return { x: nx, z: nz };
  }
  // Chiếu nghỉ giữa (Y ≈ 2.0, mở thông sang Nhánh 1 tại Z ∈ [11.1, 12.5]) & Nhánh 2 (Z: 10.9 → 7.9, Y: 2.0 → 4.0)
  if (cy >= 1.85 && cy < 3.65 && nx <= -5.85) {
    if (nz >= 10.9) {
      var allowEastToArm1 = (nz >= 11.1 && nz <= 12.5 && cy < 2.35);
      nx = Math.max(-7.2, Math.min(allowEastToArm1 ? -2.5 : -6.15, nx));
      nz = Math.max(10.9, Math.min(12.45, nz));
    } else {
      nx = Math.max(-7.15, Math.min(-6.25, nx));
      nz = Math.max(7.6, Math.min(11.0, nz));
    }
    return { x: nx, z: nz };
  }

  // Tầng trên Gác Đàn Ống & Tháp Chuông (Y >= 3.65)
  if (cy >= 3.65) {
    nx = Math.max(-14.75, Math.min(-6.35, nx));
    nz = Math.max(4.45, Math.min(14.35, nz));
    // Chặn rơi xuống lỗ cầu thang X ∈ [-7.55, -6.0], Z ∈ [7.9, 12.9]:
    // Cạnh Bắc (Z=12.9) và cạnh Tây (X=-7.55) có lan can bảo vệ; cạnh Nam (Z=7.9) mở thông xuống Nhánh 2!
    var inStair2Mouth = (nx >= -7.45 && nx <= -6.05 && nz >= 7.8 && nz <= 10.95 && (st.pig ? st.pig.z <= 11.0 : true));
    if (!inStair2Mouth && nx > -7.88 && nz > 8.15 && nz < 13.22) {
      var dWest = Math.abs(nx - (-7.88));
      var dNorth = Math.abs(nz - 13.22);
      var dSouth = Math.abs(nz - 8.15);
      var mHole = Math.min(dWest, dNorth, dSouth);
      if (mHole === dWest) nx = -7.88;
      else if (mHole === dNorth) nz = 13.22;
      else nz = 8.15;
    }
    var upperBoxes = [
      { x1: -14.0, z1: 13.2, x2: -8.6, z2: 14.3 },   // Pipe Organ 17 ống
      { x1: -12.65, z1: 5.4, x2: -10.55, z2: 6.8 }   // Chuông Đồng 1880
    ];
    for (var ui = 0; ui < upperBoxes.length; ui++) {
      var ub = upperBoxes[ui];
      if (nx > ub.x1 - 0.34 && nx < ub.x2 + 0.34 && nz > ub.z1 - 0.34 && nz < ub.z2 + 0.34) {
        var udl = Math.abs(nx - (ub.x1 - 0.34)), udr = Math.abs(nx - (ub.x2 + 0.34));
        var udt = Math.abs(nz - (ub.z1 - 0.34)), udb = Math.abs(nz - (ub.z2 + 0.34));
        var um = Math.min(udl, udr, udt, udb);
        if (um === udl) nx = ub.x1 - 0.34;
        else if (um === udr) nx = ub.x2 + 0.34;
        else if (um === udt) nz = ub.z1 - 0.34;
        else nz = ub.z2 + 0.34;
      }
    }
    return { x: nx, z: nz };
  }

  // Cung Thánh (Z >= 14.8, Y ≈ 0.45) & Thánh Đường Chính (Z < 14.8, Y = 0)
  if (nz >= 14.8) {
    nx = Math.max(-5.10, Math.min(5.10, nx));
    nz = Math.max(14.8, Math.min(23.95, nz));
  } else {
    nx = Math.max(-5.55, Math.min(5.55, nx));
    nz = Math.max(0.55, Math.min(14.8, nz));
  }
  // Lan can Cung Thánh tại Z = 14.8 (chỉ mở lối 3 Bậc Đá Cẩm Thạch X ∈ [-2.2, 2.2])
  if (Math.abs(nz - 14.8) < 0.36 && (nx < -1.95 || nx > 1.95)) {
    nz = nz < 14.8 ? 14.44 : 15.16;
  }

  var boxes = [
    { x1: -4.15, z1:  3.1, x2: -1.45, z2:  9.8 },   // Dãy ghế gỗ trái
    { x1:  1.45, z1:  3.1, x2:  4.15, z2:  9.8 },   // Dãy ghế gỗ phải
    { x1:  1.80, z1:  1.1, x2:  2.40, z2:  1.7 },   // Chậu nước phép đá cẩm thạch
    { x1: -1.85, z1: 20.0, x2:  1.85, z2: 21.3 },   // Bàn Thờ đá hoa cương
    { x1: -1.05, z1: 22.5, x2:  1.05, z2: 23.75 },  // Tượng Đức Mẹ Hòa Bình
    { x1: -3.65, z1: 18.4, x2: -2.75, z2: 19.4 },   // Giá nến trái
    { x1:  2.75, z1: 18.4, x2:  3.65, z2: 19.4 }    // Giá nến phải
  ];
  for (var i = 0; i < boxes.length; i++) {
    var b = boxes[i];
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

function planCathedralRealtimePath(st, tx, targetFloorY, tz, pendingAction, extraOpts) {
  var p = st.pig;
  var eo = extraOpts || {};
  var isRampTap = !!eo.isRampTap;

  if (typeof planNavGraphRealtimePath === 'function') {
    if (isRampTap) {
      var rampZoneY = targetFloorY >= 3.2 ? 4.0 : (targetFloorY >= 1.4 ? 2.0 : 0.0);
      planNavGraphRealtimePath(CATHEDRAL_NAV_GRAPH, st, tx, rampZoneY, tz, { pendingAction: pendingAction });
      if (p.waypoints && p.waypoints.length > 0) {
        p.waypoints[p.waypoints.length - 1] = { x: tx, y: eo.exactY, z: tz };
      }
    } else {
      planNavGraphRealtimePath(CATHEDRAL_NAV_GRAPH, st, tx, targetFloorY, tz, { pendingAction: pendingAction });
    }
  } else {
    p.seated = false; p.walking = true; p.pendingAction = pendingAction || null;
    p.waypoints = [{ x: tx, y: targetFloorY, z: tz }];
  }

  // Tránh đi giật lùi nếu chú Heo đang đứng giữa cầu thang chữ L
  if (p.waypoints && p.waypoints.length > 1) {
    if (p.x < -3.05 && p.x > -6.0 && p.z >= 11.0 && p.z <= 12.6 && p.y > 0.15 && p.y < 1.85) {
      if (p.waypoints[0].x > -3.0 && p.waypoints[1].x < -6.0) p.waypoints.shift();
    } else if (p.x >= -7.45 && p.x <= -6.0 && p.z > 8.0 && p.z < 10.8 && p.y > 2.15 && p.y < 3.85) {
      if (p.waypoints[0].z > 10.8 && p.waypoints[1].z < 8.0) p.waypoints.shift();
    }
  }

  // Chèn điểm rẽ lối đi giữa trên mọi đoạn đường (tránh va vào 2 dãy ghế gỗ hoặc Bàn Thờ khi đi thẳng)
  if (p.waypoints && p.waypoints.length > 0) {
    var refined = [];
    var prevPt = { x: p.x, y: p.y || 0, z: p.z };
    for (var wi = 0; wi < p.waypoints.length; wi++) {
      var curPt = p.waypoints[wi];
      if ((prevPt.y || 0) < 0.25 && (curPt.y || 0) < 0.25) {
        var crossesLeftPews = (Math.min(prevPt.x, curPt.x) < -1.2 && Math.max(prevPt.x, curPt.x) > -4.3 && Math.max(prevPt.z, curPt.z) > 2.9 && Math.min(prevPt.z, curPt.z) < 10.0);
        var crossesRightPews = (Math.min(prevPt.x, curPt.x) < 4.3 && Math.max(prevPt.x, curPt.x) > 1.2 && Math.max(prevPt.z, curPt.z) > 2.9 && Math.min(prevPt.z, curPt.z) < 10.0);
        if ((crossesLeftPews || crossesRightPews) && Math.abs(prevPt.x) < 1.45) {
          var midZ = curPt.z > 9.9 ? 10.55 : (curPt.z < 3.0 ? 2.45 : curPt.z);
          refined.push({ x: 0, y: 0, z: midZ });
        } else if ((crossesLeftPews || crossesRightPews) && Math.abs(curPt.x) < 1.45) {
          var exitZ = prevPt.z > 9.9 ? 10.55 : 2.45;
          refined.push({ x: 0, y: 0, z: exitZ });
        }
      }
      if ((prevPt.y || 0) >= 0.3 && (prevPt.y || 0) <= 0.6 && (curPt.y || 0) >= 0.3 && (curPt.y || 0) <= 0.6) {
        if (Math.min(prevPt.z, curPt.z) < 19.9 && Math.max(prevPt.z, curPt.z) > 21.4 && Math.abs(prevPt.x) < 1.9 && Math.abs(curPt.x) < 1.9) {
          refined.push({ x: prevPt.x >= 0 ? 2.45 : -2.45, y: 0.45, z: 20.65 });
        }
      }
      refined.push(curPt);
      prevPt = curPt;
    }
    p.waypoints = refined;
    p.targetX = p.waypoints[0].x;
    p.targetZ = p.waypoints[0].z;
  }
}

/* ==================== 2. TƯƠNG TÁC ĐẶC TRƯNG NHÀ THỜ ĐỨC BÀ ==================== */
function lightCathedralCandle(st) {
  st.candlesLit = Math.min(9, st.candlesLit + 1);
  st.candleGlow = 1.0;
  for (var i = 0; i < 12; i++) {
    st.candleSparks.push({
      x: (i % 2 === 0 ? -3.2 : 3.2) + (Math.random() - 0.5) * 0.65,
      y: 1.45 + Math.random() * 0.35,
      z: 18.9 + (Math.random() - 0.5) * 0.4,
      vy: 0.45 + Math.random() * 0.45,
      t: 0,
      maxT: 1.4 + Math.random() * 0.8
    });
  }
  st.toast = '🕯️ Ngọn nến cầu bình an bừng sáng trước Cung Thánh! (' + st.candlesLit + ' nến)';
  st.toastUntil = st.t + 4.2;
}

function prayCathedralMary(st) {
  st.maryHalo = 1.0;
  st.candleGlow = Math.max(st.candleGlow, 0.75);
  for (var i = 0; i < 10; i++) {
    st.candleSparks.push({
      x: (Math.random() - 0.5) * 1.1,
      y: 1.55 + Math.random() * 0.65,
      z: 23.0 + (Math.random() - 0.5) * 0.5,
      vy: 0.40 + Math.random() * 0.40,
      t: 0,
      maxT: 1.5 + Math.random() * 0.7
    });
  }
  st.toast = '🙏 Thành tâm cầu nguyện trước Tượng Đức Mẹ Hòa Bình Sài Gòn!';
  st.toastUntil = st.t + 4.4;
}

function dipCathedralHolyWater(st) {
  st.holyWaterCount += 1;
  for (var i = 0; i < 10; i++) {
    st.holyWaterDrops.push({
      x: 2.1 + (Math.random() - 0.5) * 0.45,
      y: 0.92 + Math.random() * 0.25,
      z: 1.4 + (Math.random() - 0.5) * 0.45,
      vy: 0.55 + Math.random() * 0.45,
      t: 0,
      maxT: 0.9 + Math.random() * 0.4
    });
  }
  st.toast = '💧 Làm dấu với nước phép tại Chậu đá cẩm thạch, tâm hồn bình an!';
  st.toastUntil = st.t + 4.0;
}

function inspectCathedralOrgan(st) {
  st.organGlow = 1.0;
  st.toast = '🎵 Đại Phong Cầm 1880 với 17 ống đồng vang âm trầm hùng khắp vòm Gothic!';
  st.toastUntil = st.t + 4.2;
}

function ringCathedralBell(st) {
  st.bellVel = 4.6 * (st.bellAngle >= 0 ? -1 : 1);
  if (Math.abs(st.bellAngle) < 0.05) st.bellVel = 4.6;
  st.bellWaves.push({ t: 0, maxT: 1.6 });
  st.bellWaves.push({ t: -0.25, maxT: 1.6 });
  st.toast = '🔔 BOONG... BOONG! Tiếng Chuông Đồng 1880 vang vọng khắp Sài Gòn!';
  st.toastUntil = st.t + 4.4;
}

function getCathedralContextAction(st) {
  var p = st.pig;
  var py = p.y || 0;
  if (py < 0.25) {
    if (Math.hypot(p.x - 2.1, p.z - 1.4) <= 1.85) {
      return { id: 'dip_holy_water', label: '💧 Làm dấu nước phép' };
    }
    if (p.z <= 1.95 && Math.abs(p.x) <= 2.15) {
      return { id: 'exit_cathedral', label: '🚪 Ra lại Đại Lộ Sài Gòn' };
    }
  } else if (py >= 0.25 && py < 1.5) {
    if (p.z >= 21.35 && Math.abs(p.x) <= 2.6) {
      return { id: 'pray_mary', label: '🙏 Cầu nguyện Đức Mẹ Hòa Bình' };
    }
    if (Math.hypot(p.x + 3.2, p.z - 18.9) <= 2.2 || Math.hypot(p.x - 3.2, p.z - 18.9) <= 2.2 || (p.z >= 17.6 && p.z <= 21.35)) {
      return { id: 'light_candle', label: '🕯️ Thắp nến cầu bình an' };
    }
  } else if (py >= 3.5) {
    if (Math.hypot(p.x + 11.6, p.z - 6.2) <= 2.7) {
      return { id: 'ring_bell', label: '🔔 Kéo chuông Nhà Thờ' };
    }
    if (p.z >= 11.0 && p.x <= -7.6) {
      return { id: 'inspect_organ', label: '🎵 Ngắm Đàn Ống Pipe Organ' };
    }
  }
  return null;
}

function stepCathedralNpcs(st, dt) {
  if (!st.parishioners) return;
  for (var i = 0; i < st.parishioners.length; i++) {
    var h = st.parishioners[i];
    if (!h.pts || !h.pts.length) continue;
    if (h.state === 'WAIT') {
      h.moving = false;
      h.timer -= dt;
      if (h.timer <= 0) {
        h.state = 'WALK';
        h.stepIdx = (h.stepIdx + 1) % h.pts.length;
      }
      continue;
    }
    var tgt = h.pts[(h.stepIdx + 1) % h.pts.length];
    var dx = tgt.x - h.x, dz = tgt.z - h.z;
    var d = Math.hypot(dx, dz);
    if (d < 0.10) {
      h.x = tgt.x; h.z = tgt.z;
      h.y = typeof tgt.y === 'number' ? tgt.y : getCathedralSurfaceY(h.x, h.z, h.y);
      h.stepIdx = (h.stepIdx + 1) % h.pts.length;
      if (tgt.wait) {
        h.state = 'WAIT';
        h.moving = false;
        h.timer = tgt.wait;
        h.yaw = typeof tgt.yaw === 'number' ? tgt.yaw : h.yaw;
      }
    } else {
      h.moving = true;
      var spd = Math.min(d, 1.35 * dt);
      h.x += (dx / d) * spd;
      h.z += (dz / d) * spd;
      h.y = getCathedralSurfaceY(h.x, h.z, h.y);
      h.yaw = Math.atan2(dx, dz);
    }
  }
}

function stepCathedralTps(st, dt) {
  st.t += dt;
  st._lastDt = dt;
  var p = st.pig;

  stepCathedralNpcs(st, dt);

  // Di chuyển chú Heo liên hoàn từng bậc (0% nhảy cóc)
  if (p.walking) {
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
        var act = p.pendingAction;
        p.pendingAction = null;
        if (act === 'dip_holy_water') {
          p.yaw = Math.PI * 0.5;
          dipCathedralHolyWater(st);
        } else if (act === 'light_candle') {
          p.yaw = p.x < 0 ? -Math.PI * 0.5 : Math.PI * 0.5;
          lightCathedralCandle(st);
        } else if (act === 'pray_mary') {
          p.yaw = 0;
          prayCathedralMary(st);
        } else if (act === 'inspect_organ') {
          p.yaw = 0;
          inspectCathedralOrgan(st);
        } else if (act === 'ring_bell') {
          p.yaw = Math.PI;
          ringCathedralBell(st);
        } else if (act === 'exit_cathedral') {
          p.yaw = Math.PI;
          st.exiting = true;
          st.toast = 'Tạm biệt Nhà Thờ Đức Bà! Ra lại Đại Lộ Sài Gòn...';
          st.toastUntil = st.t + 2.0;
        }
      }
    } else {
      var onAnyRamp = (p.x >= -6.0 && p.x <= -3.0 && p.z >= 11.0 && p.z <= 12.6) ||
                      (p.x >= -7.45 && p.x <= -6.0 && p.z >= 7.8 && p.z <= 11.0) ||
                      (p.x >= -2.2 && p.x <= 2.2 && p.z >= 14.5 && p.z <= 16.1);
      var spd = Math.min(dist, (onAnyRamp ? 2.6 : 3.6) * dt);
      var next = clampCathedralWalkPos(st, p.x + (dx / dist) * spd, p.z + (dz / dist) * spd, p.y);
      p.x = next.x; p.z = next.z;
      var tyaw = Math.atan2(dx, dz);
      p.yaw = (typeof tpsLerpAngle === 'function') ? tpsLerpAngle(p.yaw || 0, tyaw, Math.min(1, dt * 12)) : tyaw;
    }
  }

  p.y = getCathedralSurfaceY(p.x, p.z, p.y);
  st.room = p.y >= 3.2 ? 'belfry' : (p.z >= 14.8 ? 'sanctuary' : 'nave');

  // Vật lý con lắc Chuông Đồng 1880
  var accel = -14.0 * st.bellAngle - 1.35 * st.bellVel;
  st.bellVel += accel * dt;
  st.bellAngle += st.bellVel * dt;
  if (Math.abs(st.bellAngle) < 0.002 && Math.abs(st.bellVel) < 0.005) {
    st.bellAngle = 0; st.bellVel = 0;
  }

  var baseGlow = Math.min(0.85, st.candlesLit * 0.14);
  if (st.candleGlow > baseGlow) st.candleGlow = Math.max(baseGlow, st.candleGlow - dt * 0.25);
  if (st.organGlow > 0) st.organGlow = Math.max(0, st.organGlow - dt * 0.6);
  if (st.maryHalo > 0) st.maryHalo = Math.max(0, st.maryHalo - dt * 0.45);

  for (var si = st.candleSparks.length - 1; si >= 0; si--) {
    var sp = st.candleSparks[si];
    sp.t += dt; sp.y += sp.vy * dt;
    sp.x += Math.sin(st.t * 4 + si) * 0.12 * dt;
    if (sp.t >= sp.maxT) st.candleSparks.splice(si, 1);
  }
  for (var hi = st.holyWaterDrops.length - 1; hi >= 0; hi--) {
    var wd = st.holyWaterDrops[hi];
    wd.t += dt; wd.y += wd.vy * dt; wd.vy -= 1.5 * dt;
    if (wd.t >= wd.maxT) st.holyWaterDrops.splice(hi, 1);
  }
  for (var wi = st.bellWaves.length - 1; wi >= 0; wi--) {
    st.bellWaves[wi].t += dt;
    if (st.bellWaves[wi].t >= st.bellWaves[wi].maxT) st.bellWaves.splice(wi, 1);
  }

  var targetDoor = st.exiting ? 0.95 : ((p.y < 0.25 && p.z < 2.2 && Math.abs(p.x) < 1.9) ? 0.42 : 0.22);
  st.doorOpen += (targetDoor - st.doorOpen) * Math.min(1, dt * 5.0);
  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.2);

  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== 3. RAYCAST 3D TOÀN THẾ GIỚI HỢP NHẤT (HOTSPOTS + RAMPS + SÀN) ==================== */
function cathRaySphereDist(ox, oy, oz, dx, dy, dz, cx, cy, cz, rad) {
  var ocx = cx - ox, ocy = cy - oy, ocz = cz - oz;
  var proj = ocx * dx + ocy * dy + ocz * dz;
  if (proj < 0.2 || proj > 32) return -1;
  var d2 = (ocx * ocx + ocy * ocy + ocz * ocz) - proj * proj;
  return d2 <= rad * rad ? proj : -1;
}

function pickCathedralTarget3D(cam, st, sx, sy) {
  var nx = (sx - cam.vw * 0.5) / (cam.focal || 400);
  var ny = (cam.vh * 0.5 - sy) / (cam.focal || 400);
  var dx = cam.F.x + cam.R.x * nx + cam.U.x * ny;
  var dy = cam.F.y + cam.R.y * nx + cam.U.y * ny;
  var dz = cam.F.z + cam.R.z * nx + cam.U.z * ny;
  var dl = Math.hypot(dx, dy, dz) || 1;
  dx /= dl; dy /= dl; dz /= dl;
  var ox = cam.pos.x, oy = cam.pos.y, oz = cam.pos.z;

  // 1. Hotspots vật thể tương tác đặc trưng
  if (cathRaySphereDist(ox, oy, oz, dx, dy, dz, 2.1, 0.55, 1.4, 0.72) > 0) {
    return { kind: 'hotspot', x: 1.45, y: 0.0, z: 1.4, pendingAction: 'dip_holy_water' };
  }
  if (cathRaySphereDist(ox, oy, oz, dx, dy, dz, -3.2, 1.05, 18.9, 0.85) > 0) {
    return { kind: 'hotspot', x: -2.25, y: 0.45, z: 18.9, pendingAction: 'light_candle' };
  }
  if (cathRaySphereDist(ox, oy, oz, dx, dy, dz, 3.2, 1.05, 18.9, 0.85) > 0) {
    return { kind: 'hotspot', x: 2.25, y: 0.45, z: 18.9, pendingAction: 'light_candle' };
  }
  if (cathRaySphereDist(ox, oy, oz, dx, dy, dz, 0, 2.0, 23.12, 1.35) > 0) {
    return { kind: 'hotspot', x: 0, y: 0.45, z: 21.85, pendingAction: 'pray_mary' };
  }
  if (cathRaySphereDist(ox, oy, oz, dx, dy, dz, 0, 1.2, 20.65, 1.45) > 0) {
    return { kind: 'hotspot', x: 0, y: 0.45, z: 19.35, pendingAction: 'pray_mary' };
  }
  if (cathRaySphereDist(ox, oy, oz, dx, dy, dz, -11.3, 5.6, 13.75, 2.45) > 0) {
    return { kind: 'hotspot', x: -11.3, y: 4.0, z: 12.2, pendingAction: 'inspect_organ' };
  }
  if (cathRaySphereDist(ox, oy, oz, dx, dy, dz, -11.6, 6.1, 6.2, 1.55) > 0) {
    return { kind: 'hotspot', x: -11.6, y: 4.0, z: 7.4, pendingAction: 'ring_bell' };
  }

  // Cửa gỗ lớn lối ra (Z = 0)
  if (dz < -0.02) {
    var td = (0.20 - oz) / dz;
    if (td > 0.3 && td < 22) {
      var ddx = ox + dx * td, ddy = oy + dy * td;
      if (ddy >= 0 && ddy <= 3.15 && Math.abs(ddx) <= 1.55) {
        return { kind: 'hotspot', x: 0, y: 0, z: 0.72, pendingAction: 'exit_cathedral' };
      }
    }
  }

  // 2. Bắn tia trực tiếp lên 3 Bậc Đá Cẩm Thạch & Cầu Thang Chữ L 14 Bậc (rayRampQuad)
  if (typeof rayRampQuad === 'function') {
    var bestRamp = null;
    for (var ri = 0; ri < CATHEDRAL_NAV_GRAPH.ramps.length; ri++) {
      var rmp = CATHEDRAL_NAV_GRAPH.ramps[ri];
      var rh = rayRampQuad(ox, oy, oz, dx, dy, dz, rmp);
      if (rh && (!bestRamp || rh.t < bestRamp.t)) {
        bestRamp = rh;
      }
    }
    if (bestRamp) {
      return { kind: 'stair', x: bestRamp.x, y: bestRamp.y, z: bestRamp.z, exactY: bestRamp.y, isRampTap: true };
    }
  }

  // 3. Bắn tia xuống 3 cao độ sàn: Gác Chuông (Y=4.0) -> Cung Thánh (Y=0.45) -> Thánh Đường (Y=0)
  if (dy < -0.02) {
    var t4 = (4.0 - oy) / dy;
    if (t4 > 0.2 && t4 < 34) {
      var x4 = ox + dx * t4, z4 = oz + dz * t4;
      var inStairHole = (x4 >= -7.55 && x4 <= -6.0 && z4 >= 7.9 && z4 <= 12.9);
      if (x4 >= -15.2 && x4 <= -6.0 && z4 >= 4.0 && z4 <= 14.8 && !inStairHole) {
        return { kind: 'floor', x: x4, y: 4.0, z: z4 };
      }
    }
    var ts = (0.45 - oy) / dy;
    if (ts > 0.2 && ts < 34) {
      var xs = ox + dx * ts, zs = oz + dz * ts;
      if (xs >= -5.5 && xs <= 5.5 && zs >= 14.8 && zs <= 24.4) {
        return { kind: 'floor', x: xs, y: 0.45, z: zs };
      }
    }
    var t0 = (0.0 - oy) / dy;
    if (t0 > 0.2 && t0 < 36) {
      var x0 = ox + dx * t0, z0 = oz + dz * t0;
      if (x0 >= -6.0 && x0 <= 6.0 && z0 >= 0.0 && z0 <= 14.8) {
        return { kind: 'floor', x: x0, y: 0.0, z: z0 };
      }
    }
  }
  return null;
}

/* ==================== 4. RENDER WEBGL 3D TOÀN CẢNH NHÀ THỜ ĐỨC BÀ HỢP NHẤT (QĐ 250) ==================== */
function drawCathedralChandelierWebgl(wgl, x, y, z, t) {
  var dm = wgl.drawMesh;
  dm('cyl', 'agedBronze', x, (y + 7.8) * 0.5, z, 0, 0, 0, 0.05, 7.8 - y, 0.05, { tint: [0.65, 0.50, 0.25, 1] });
  dm('torus', 'agedBronze', x, y, z, Math.PI * 0.5, 0, 0, 1.35, 1.35, 0.65, { tint: [1.0, 0.85, 0.42, 1], specPow: 96 });
  dm('torus', 'agedBronze', x, y + 0.34, z, Math.PI * 0.5, 0, 0, 0.78, 0.78, 0.55, { tint: [1.0, 0.85, 0.42, 1], specPow: 96 });
  var pulse = 1.45 + Math.sin(t * 4.8 + z) * 0.16;
  for (var i = 0; i < 6; i++) {
    var a = (i / 6) * Math.PI * 2;
    var cx = x + Math.cos(a) * 0.62, cz = z + Math.sin(a) * 0.62;
    dm('cyl', 'white', cx, y + 0.12, cz, 0, 0, 0, 0.05, 0.18, 0.05, { tint: [1.0, 0.98, 0.90, 1] });
    dm('sphere', 'white', cx, y + 0.24, cz, 0, 0, 0, 0.10, 0.14, 0.10, { tint: [1.0, 0.88, 0.42, 1], emissive: pulse });
  }
}

function drawCathedralCandleStandWebgl(wgl, x, y, z, t, extraLit) {
  var dm = wgl.drawMesh;
  dm('cyl', 'agedBronze', x, y + 0.44, z, 0, 0, 0, 0.16, 0.88, 0.16, { tint: [0.95, 0.80, 0.52, 1], specPow: 72 });
  dm('box', 'agedBronze', x, y + 0.90, z, 0, 0, 0, 0.86, 0.09, 0.46, { tint: [1.05, 0.88, 0.55, 1], specPow: 72 });
  var nCandles = 4 + Math.min(4, extraLit || 0);
  for (var i = 0; i < nCandles; i++) {
    var ox = ((i / Math.max(1, nCandles - 1)) - 0.5) * 0.68;
    var flick = 1.55 + Math.sin(t * 11 + i * 1.7 + x) * 0.24;
    dm('cyl', 'white', x + ox, y + 1.04, z, 0, 0, 0, 0.045, 0.20, 0.045, { tint: [1.0, 0.98, 0.92, 1] });
    dm('sphere', 'white', x + ox, y + 1.18, z, 0, 0, 0, 0.065, 0.10, 0.065, { tint: [1.0, 0.72, 0.20, 1], emissive: flick });
  }
}

function drawOurLadyStatueWebgl(wgl, x, y, z, t, haloBoost) {
  var dm = wgl.drawMesh;
  // Bệ đá cẩm thạch 2 tầng nâng Tượng Đức Mẹ Hòa Bình
  dm('box', 'sanctuaryMarble', x, y + 0.18, z, 0, 0, 0, 1.55, 0.36, 1.20, { tint: [0.96, 0.94, 0.90, 1] });
  dm('box', 'sanctuaryMarble', x, y + 0.72, z, 0, 0, 0, 1.06, 0.72, 0.88, { tint: [1.02, 1.0, 0.96, 1] });
  // Tượng Đức Mẹ Hòa Bình thanh thoát
  var by = y + 1.08;
  dm('cone', 'white', x, by + 0.78, z, 0, 0, 0, 0.56, 1.56, 0.46, { tint: [0.99, 0.98, 0.95, 1], rim: 0.25 });
  dm('box', 'white', x - 0.14, by + 0.72, z - 0.14, 0, 0, 0, 0.14, 1.12, 0.14, { tint: [0.24, 0.72, 0.96, 1] });
  dm('box', 'white', x + 0.14, by + 0.72, z - 0.14, 0, 0, 0, 0.14, 1.12, 0.14, { tint: [0.24, 0.72, 0.96, 1] });
  // Quả địa cầu Hòa Bình & Thánh Giá vàng
  dm('sphere', 'white', x, by + 1.06, z - 0.24, 0, 0, 0, 0.20, 0.20, 0.20, { tint: [0.36, 0.65, 0.98, 1], specPow: 64 });
  dm('box', 'agedBronze', x, by + 1.24, z - 0.24, 0, 0, 0, 0.04, 0.18, 0.04, { tint: [1.1, 0.92, 0.32, 1], emissive: 0.4 });
  dm('box', 'agedBronze', x, by + 1.27, z - 0.24, 0, 0, 0, 0.12, 0.04, 0.04, { tint: [1.1, 0.92, 0.32, 1], emissive: 0.4 });
  // Khuôn mặt & Khăn trùm đầu + Hào quang
  dm('sphere', 'white', x, by + 1.66, z, 0, 0, 0, 0.26, 0.28, 0.26, { tint: [0.98, 0.96, 0.92, 1] });
  dm('sphere', 'white', x, by + 1.66, z - 0.06, 0, 0, 0, 0.18, 0.20, 0.18, { tint: [0.99, 0.88, 0.78, 1] });
  var haloEm = 1.15 + (haloBoost || 0) * 0.95 + Math.sin(t * 2.5) * 0.12;
  dm('torus', 'white', x, by + 1.72, z + 0.06, Math.PI * 0.5, 0, 0, 0.42, 0.42, 0.16, { tint: [1.0, 0.88, 0.35, 1], emissive: haloEm });
}

function drawPipeOrganWebgl(wgl, st) {
  var dm = wgl.drawMesh;
  // Pipe Organ 17 ống tại X ∈ [-14.0, -8.6], Z ∈ [13.2, 14.3], Y = 4.0
  dm('box', 'limWood', -11.3, 4.68, 13.85, 0, 0, 0, 5.4, 1.36, 0.96, { tint: [1.0, 0.92, 0.84, 1], us: 2, vs: 1 });
  // Bàn phím 2 tầng & ghế nhạc công
  dm('box', 'white', -11.3, 4.86, 13.24, 0, 0, 0, 1.9, 0.14, 0.42, { tint: [0.99, 0.98, 0.95, 1] });
  dm('box', 'limWood', -11.3, 4.26, 12.65, 0, 0, 0, 1.35, 0.52, 0.44, { tint: [0.95, 0.85, 0.75, 1] });

  var nPipes = 17;
  for (var i = 0; i < nPipes; i++) {
    var frac = i / (nPipes - 1);
    var px = -13.75 + frac * 4.9;
    var distCenter = Math.abs(frac - 0.5) * 2;
    var distEdge = Math.min(frac, 1 - frac) * 2;
    var pipeH = 1.25 + Math.max(1 - distCenter * 1.4, 0.9 - distEdge * 1.8) * 1.15;
    if (st.organGlow > 0.05) pipeH += Math.sin(st.t * 10 + i) * 0.08 * st.organGlow;
    dm('cyl', 'agedBronze', px, 5.36 + pipeH * 0.5, 13.75, 0, 0, 0, 0.19, pipeH, 0.19, {
      tint: i % 2 === 0 ? [1.08, 0.92, 0.46, 1] : [0.92, 0.72, 0.34, 1],
      specPow: 88,
      emissive: st.organGlow * 0.35
    });
  }
}

function drawBronzeBellWebgl(wgl, st) {
  var dm = wgl.drawMesh;
  var bx = -11.6, by = 4.0, bz = 6.2;
  // Khung gỗ chữ A đỡ Chuông Đồng 1880 tại (-11.6, 4.0, 6.2)
  dm('box', 'limWood', bx - 0.85, by + 1.85, bz, 0, 0, 0, 0.24, 3.7, 0.28, { tint: [0.92, 0.84, 0.76, 1] });
  dm('box', 'limWood', bx + 0.85, by + 1.85, bz, 0, 0, 0, 0.24, 3.7, 0.28, { tint: [0.92, 0.84, 0.76, 1] });
  dm('box', 'limWood', bx, by + 3.25, bz, 0, 0, 0, 2.05, 0.24, 0.34, { tint: [1.0, 0.90, 0.80, 1] });

  // Quả chuông đồng đung đưa quanh trục Y = 7.25
  var ang = st.bellAngle;
  var bellCx = bx + Math.sin(ang) * 0.82;
  var bellCy = (by + 3.25) - Math.cos(ang) * 0.82;
  dm('cyl', 'agedBronze', bx, by + 3.05, bz, 0, 0, -ang, 0.10, 0.48, 0.10, { tint: [0.7, 0.5, 0.25, 1] });
  dm('cone', 'agedBronze', bellCx, bellCy, bz, 0, 0, -ang, 0.88, 0.92, 0.88, { tint: [1.05, 0.86, 0.42, 1], specPow: 92 });
  dm('cyl', 'agedBronze', bellCx + Math.sin(ang) * 0.14, bellCy - Math.cos(ang) * 0.42, bz, 0, 0, -ang, 0.96, 0.14, 0.96, { tint: [0.95, 0.74, 0.30, 1], specPow: 96 });
  dm('sphere', 'agedBronze', bellCx + Math.sin(ang * 1.25) * 0.18, bellCy - Math.cos(ang) * 0.56, bz, 0, 0, 0, 0.22, 0.22, 0.22, { tint: [1.1, 0.94, 0.40, 1], emissive: 0.25 });
  // Dây thừng kéo chuông
  dm('cyl', 'white', bx + 0.45 + Math.sin(ang) * 0.12, by + 1.95, bz - 0.48, 0, 0, -ang * 0.25, 0.045, 2.45, 0.045, { tint: [0.85, 0.74, 0.56, 1] });
  dm('sphere', 'white', bx + 0.45 + Math.sin(ang) * 0.16, by + 0.72, bz - 0.48, 0, 0, 0, 0.14, 0.14, 0.14, { tint: [0.78, 0.18, 0.18, 1] });
}

function renderCathedralWebglScene(wgl, cam, st, W, H) {
  if (typeof computeWebglTpsCamera === 'function') {
    computeWebglTpsCamera(cam, st.pig, CATHEDRAL_NAV_GRAPH, st._lastDt || 0.016);
  }
  CATHEDRAL_ATMOSPHERE.lights[1].col[0] = 1.22 + st.candleGlow * 0.45 + st.maryHalo * 0.35;
  CATHEDRAL_ATMOSPHERE.lights[1].col[1] = 0.88 + st.candleGlow * 0.28 + st.maryHalo * 0.24;
  wgl.beginFrame(W, H, cam, CATHEDRAL_ATMOSPHERE);
  var dm = wgl.drawMesh;

  // 1. SÀN NHÀ HỢP NHẤT (THÁNH ĐƯỜNG Y=0 + 3 BẬC CẨM THẠCH + CUNG THÁNH Y=0.45 + GÁC CHUÔNG Y=4.0)
  // Sàn nave Y = 0
  dm('box', 'naveCheckerFloor', 0, -0.06, 7.4, 0, 0, 0, 12.0, 0.12, 14.8, { tint: [1, 1, 1, 1], us: 5, vs: 6 });
  // Thảm nhung đỏ viền chỉ vàng trục giữa nave (Z: 0.2..14.6)
  dm('box', 'redCarpet', 0, 0.008, 7.4, 0, 0, 0, 1.82, 0.016, 14.4, { tint: [1, 1, 1, 1], us: 1, vs: 8 });

  // 3 Bậc Đá Cẩm Thạch (nave ↔ sanctuary: X ∈ [-2.2, 2.2], Z ∈ [14.6, 16.0], Y: 0 → 0.45)
  for (var ms = 0; ms < 3; ms++) {
    var mStepY = (ms + 1) * 0.15;
    var mStepZ = 14.6 + (ms + 0.5) * (1.4 / 3);
    dm('box', 'sanctuaryMarble', 0, mStepY * 0.5, mStepZ, 0, 0, 0, 4.4, mStepY, 1.4 / 3 + 0.04, { tint: [1.02, 0.99, 0.95, 1], us: 2, vs: 1 });
    dm('box', 'redCarpet', 0, mStepY + 0.005, mStepZ, 0, 0, 0, 1.82, 0.012, 1.4 / 3 + 0.04, { tint: [1, 1, 1, 1], us: 1, vs: 0.5 });
  }
  // Lan can đá cẩm thạch ngăn Cung Thánh hai bên (X ∈ [-5.5, -2.2] & [2.2, 5.5], Z = 14.8)
  dm('box', 'sanctuaryMarble', -3.85, 0.56, 14.8, 0, 0, 0, 3.3, 0.68, 0.22, { tint: [0.96, 0.93, 0.88, 1], us: 2, vs: 1 });
  dm('box', 'sanctuaryMarble',  3.85, 0.56, 14.8, 0, 0, 0, 3.3, 0.68, 0.22, { tint: [0.96, 0.93, 0.88, 1], us: 2, vs: 1 });

  // Sàn sanctuary Y = 0.45 (X ∈ [-5.5, 5.5], Z ∈ [14.8, 24.4])
  dm('box', 'sanctuaryMarble', 0, 0.225, 19.6, 0, 0, 0, 11.0, 0.45, 9.6, { tint: [1, 1, 1, 1], us: 4.5, vs: 4 });
  dm('box', 'redCarpet', 0, 0.458, 18.0, 0, 0, 0, 2.1, 0.016, 4.2, { tint: [1, 1, 1, 1], us: 1, vs: 3 });

  // Sàn belfry Cánh Tây Y = 4.0 (X ∈ [-15.2, -6.0], Z ∈ [4.0, 14.8], chừa lỗ thang X ∈ [-7.55, -6.0], Z ∈ [7.9, 12.9])
  dm('box', 'limWood', -11.375, 3.92, 9.4,   0, 0, 0, 7.65, 0.16, 10.8, { tint: [1.05, 0.96, 0.88, 1], us: 4, vs: 6 });
  dm('box', 'limWood', -6.775,  3.92, 5.95,  0, 0, 0, 1.55, 0.16,  3.9, { tint: [1.05, 0.96, 0.88, 1], us: 1, vs: 2.5 });
  dm('box', 'limWood', -6.775,  3.92, 13.85, 0, 0, 0, 1.55, 0.16,  1.9, { tint: [1.05, 0.96, 0.88, 1], us: 1, vs: 1.2 });

  // Lan can gỗ Gothic dọc X = -6.0 (Z ∈ [4.0, 7.8] & [12.9, 14.8]) & bảo vệ quanh lỗ thang
  dm('box', 'limWood', -6.04, 4.86, 5.9,   0, 0, 0, 0.12, 0.10, 3.8, { tint: [1.1, 0.95, 0.82, 1] });
  dm('box', 'limWood', -6.04, 4.86, 13.85, 0, 0, 0, 0.12, 0.10, 1.9, { tint: [1.1, 0.95, 0.82, 1] });
  for (var gz1 = 4.1; gz1 <= 7.7; gz1 += 0.45) {
    dm('cyl', 'limWood', -6.04, 4.42, gz1, 0, 0, 0, 0.06, 0.84, 0.06, { tint: [0.9, 0.78, 0.66, 1] });
  }
  for (var gz2 = 13.0; gz2 <= 14.7; gz2 += 0.42) {
    dm('cyl', 'limWood', -6.04, 4.42, gz2, 0, 0, 0, 0.06, 0.84, 0.06, { tint: [0.9, 0.78, 0.66, 1] });
  }
  dm('box', 'limWood', -7.56, 4.84, 10.4, 0, 0, 0, 0.10, 0.09, 5.0, { tint: [1.1, 0.95, 0.82, 1] });
  for (var hzb = 8.0; hzb <= 12.8; hzb += 0.48) {
    dm('cyl', 'limWood', -7.56, 4.42, hzb, 0, 0, 0, 0.055, 0.84, 0.055, { tint: [0.9, 0.78, 0.66, 1] });
  }
  dm('box', 'limWood', -6.78, 4.84, 12.9, 0, 0, 0, 1.55, 0.09, 0.10, { tint: [1.1, 0.95, 0.82, 1] });

  // 2. CẦU THANG CHỮ L 14 BẬC (33.7°, NHÁNH 1 + CHIẾU NGHỈ GIỮA + NHÁNH 2)
  // Nhánh 1 (7 bậc dọc -X): X: -3.0 → -6.0, Z ∈ [11.1, 12.5], Y: 0 → 2.0
  for (var s1 = 0; s1 < 7; s1++) {
    var s1x = -3.0 - (s1 + 0.5) * (3.0 / 7);
    var s1h = (s1 + 1) * (2.0 / 7);
    dm('box', 'limWood', s1x, s1h * 0.5, 11.8, 0, 0, 0, 3.0 / 7 + 0.03, s1h, 1.4, { tint: [1.05, 0.94, 0.84, 1], us: 1, vs: 1 });
  }
  dm('box', 'limWood', -4.5, 1.78, 11.12, 0, 0, -0.588, 3.6, 0.08, 0.08, { tint: [1.15, 0.98, 0.84, 1] });
  // Chiếu nghỉ giữa: X ∈ [-7.5, -6.0], Z ∈ [10.9, 12.7], Y = 2.0
  dm('box', 'limWood', -6.75, 1.0, 11.8, 0, 0, 0, 1.5, 2.0, 1.8, { tint: [0.92, 0.82, 0.72, 1], us: 1.5, vs: 1.5 });
  // Nhánh 2 (7 bậc dọc -Z): X ∈ [-7.4, -6.05], Z: 10.9 → 7.9, Y: 2.0 → 4.0
  for (var s2 = 0; s2 < 7; s2++) {
    var s2z = 10.9 - (s2 + 0.5) * (3.0 / 7);
    var s2y = 2.0 + (s2 + 1) * (2.0 / 7);
    dm('box', 'limWood', -6.725, s2y * 0.5, s2z, 0, 0, 0, 1.35, s2y, 3.0 / 7 + 0.03, { tint: [1.05, 0.94, 0.84, 1], us: 1, vs: 1 });
  }
  dm('box', 'limWood', -6.12, 3.78, 9.4, 0.588, 0, 0, 0.08, 0.08, 3.6, { tint: [1.15, 0.98, 0.84, 1] });

  // 3. TƯỜNG, VÒM GOTHIC CAO 7.8M & CỬA SỔ KÍNH MÀU (CHẾ ĐỘ A KÍN 100%)
  // Trần vòm nave & sanctuary (Y = 7.8m)
  dm('box', 'limestoneWall', 0, 7.88, 12.2, 0, 0, 0, 12.2, 0.16, 24.6, { tint: [0.85, 0.80, 0.72, 1], us: 5, vs: 9 });
  // Gân vòm Gothic transverse arches dọc nave ↔ sanctuary
  var archZs = [2.0, 5.5, 9.0, 12.5, 14.8, 18.2, 21.6];
  for (var ai = 0; ai < archZs.length; ai++) {
    var az = archZs[ai];
    var span = az >= 14.8 ? 11.0 : 12.0;
    dm('arch', 'limestoneWall', 0, 6.4, az, 0, 0, 0, span, 2.8, 0.36, { tint: [0.92, 0.86, 0.78, 1] });
    dm('box', 'limestoneWall', -span * 0.5 + 0.18, 3.9, az, 0, 0, 0, 0.36, 7.8, 0.42, { tint: [0.96, 0.90, 0.82, 1] });
    dm('box', 'limestoneWall',  span * 0.5 - 0.18, 3.9, az, 0, 0, 0, 0.36, 7.8, 0.42, { tint: [0.96, 0.90, 0.82, 1] });
  }

  // Tường Đông nave (X = 6.0, Z: 0..14.8) & Cung Thánh (X = 5.5, Z: 14.8..24.4)
  dm('box', 'marseilleBrick', 6.08, 0.75, 7.4,  0, 0, 0, 0.16, 1.5, 14.8, { tint: [1, 1, 1, 1], us: 6, vs: 1 });
  dm('box', 'limestoneWall',  6.08, 4.65, 7.4,  0, 0, 0, 0.16, 6.3, 14.8, { tint: [1, 1, 1, 1], us: 5, vs: 2.5 });
  dm('box', 'marseilleBrick', 5.58, 0.75, 19.6, 0, 0, 0, 0.16, 1.5, 9.6,  { tint: [1, 1, 1, 1], us: 4, vs: 1 });
  dm('box', 'limestoneWall',  5.58, 4.65, 19.6, 0, 0, 0, 0.16, 6.3, 9.6,  { tint: [1, 1, 1, 1], us: 3.5, vs: 2.5 });
  // Tường Tây Cung Thánh (X = -5.5, Z: 14.8..24.4) + mép nối Z = 14.8
  dm('box', 'marseilleBrick', -5.58, 0.75, 19.6, 0, 0, 0, 0.16, 1.5, 9.6, { tint: [1, 1, 1, 1], us: 4, vs: 1 });
  dm('box', 'limestoneWall',  -5.58, 4.65, 19.6, 0, 0, 0, 0.16, 6.3, 9.6, { tint: [1, 1, 1, 1], us: 3.5, vs: 2.5 });
  dm('box', 'limestoneWall',  -5.75, 3.9, 14.8,  0, 0, 0, 0.55, 7.8, 0.3, { tint: [1, 1, 1, 1] });
  dm('box', 'limestoneWall',   5.75, 3.9, 14.8,  0, 0, 0, 0.55, 7.8, 0.3, { tint: [1, 1, 1, 1] });

  // Tường Tây nave (X = -6.0): tầng dưới Z ∈ [0, 10.8] & [12.8, 14.8] (mở vòm Nhánh 1 Z ∈ [10.8, 12.8]);
  // tầng trên Y ∈ [4.0, 7.8] đóng ở Z ∈ [0, 4.0] & [7.8, 12.9], mở thông lan can Z ∈ [4.0, 7.8] & [12.9, 14.8]!
  dm('box', 'marseilleBrick', -6.06, 0.75, 5.4,  0, 0, 0, 0.14, 1.5, 10.8, { tint: [1, 1, 1, 1], us: 4, vs: 1 });
  dm('box', 'limestoneWall',  -6.06, 2.75, 5.4,  0, 0, 0, 0.14, 2.5, 10.8, { tint: [1, 1, 1, 1], us: 4, vs: 1.5 });
  dm('box', 'marseilleBrick', -6.06, 0.75, 13.8, 0, 0, 0, 0.14, 1.5, 2.0,  { tint: [1, 1, 1, 1], us: 1, vs: 1 });
  dm('box', 'limestoneWall',  -6.06, 2.75, 13.8, 0, 0, 0, 0.14, 2.5, 2.0,  { tint: [1, 1, 1, 1], us: 1, vs: 1.5 });
  dm('arch', 'limestoneWall', -6.06, 3.55, 11.8, 0, Math.PI * 0.5, 0, 2.0, 0.9, 0.16, { tint: [0.95, 0.88, 0.78, 1] });
  dm('box', 'limestoneWall',  -6.06, 5.9,  2.0,  0, 0, 0, 0.14, 3.8, 4.0,  { tint: [1, 1, 1, 1], us: 2, vs: 1.5 });
  dm('box', 'limestoneWall',  -6.06, 5.9, 10.35, 0, 0, 0, 0.14, 3.8, 5.1,  { tint: [1, 1, 1, 1], us: 2, vs: 1.5 });

  // Bao kín Cánh Tây belfry (X = -15.2, Z = 4.0, Z = 14.8, trần Y = 7.8m)
  dm('box', 'marseilleBrick', -15.28, 3.9, 9.4,  0, 0, 0, 0.16, 7.8, 10.8, { tint: [1, 1, 1, 1], us: 4, vs: 3 });
  dm('box', 'marseilleBrick', -10.6,  3.9, 3.92, 0, 0, 0, 9.2,  7.8, 0.16, { tint: [1, 1, 1, 1], us: 4, vs: 3 });
  dm('box', 'marseilleBrick', -10.6,  3.9, 14.88,0, 0, 0, 9.2,  7.8, 0.16, { tint: [1, 1, 1, 1], us: 4, vs: 3 });
  dm('box', 'limWood',        -10.6,  7.88, 9.4, 0, 0, 0, 9.3,  0.16, 10.9, { tint: [0.88, 0.80, 0.72, 1], us: 4, vs: 4 });
  dm('quad', 'louverShutter', -15.16, 5.85, 6.6, 0, Math.PI * 0.5, 0, 2.2, 2.3, 1, { tint: [1, 1, 1, 1], emissive: 0.45 });
  dm('quad', 'louverShutter', -15.16, 5.85, 11.2,0, Math.PI * 0.5, 0, 2.2, 2.3, 1, { tint: [1, 1, 1, 1], emissive: 0.45 });
  dm('quad', 'belfryPlaque',  -11.3,  7.05, 14.76, 0, Math.PI, 0, 3.6, 0.85, 1, { tint: [1, 1, 1, 1] });

  // Tường mặt tiền Nam (Z = 0) + Cửa gỗ lớn 2 cánh + Grand Rose Window
  dm('box', 'marseilleBrick', -3.725, 3.9, 0, 0, 0, 0, 4.55, 7.8, 0.16, { tint: [1, 1, 1, 1], us: 2, vs: 3 });
  dm('box', 'marseilleBrick',  3.725, 3.9, 0, 0, 0, 0, 4.55, 7.8, 0.16, { tint: [1, 1, 1, 1], us: 2, vs: 3 });
  dm('box', 'marseilleBrick',  0.0,   5.5, 0, 0, 0, 0, 2.90, 4.6, 0.16, { tint: [1, 1, 1, 1], us: 1.5, vs: 2 });
  // Ánh nắng hắt sau cửa chính
  dm('quad', 'white', 0, 1.6, -0.04, 0, 0, 0, 2.9, 3.2, 1, { tint: [1.0, 0.94, 0.78, 1], emissive: 1.25 });
  var dAng = st.doorOpen * 0.92;
  dm('box', 'cathedralDoor', -1.45 + Math.cos(0.18) * 0.72, 1.6, 0.04 + Math.sin(0.18) * 0.72, 0, -0.18, 0, 1.44, 3.2, 0.08, { tint: [1, 1, 1, 1] });
  dm('box', 'cathedralDoor',  1.45 - Math.cos(dAng) * 0.72, 1.6, 0.04 + Math.sin(dAng) * 0.72, 0,  dAng, 0, 1.44, 3.2, 0.08, { tint: [1, 1, 1, 1] });
  dm('quad', 'roseWindow', 0, 5.4, 0.12, 0, 0, 0, 2.5, 2.5, 1, { tint: [1, 1, 1, 1], emissive: 0.72 });

  // Tường hậu Bắc Cung Thánh (Z = 24.4) + 3 Ô Kính Màu Lancet + Hoành phi
  dm('box', 'limestoneWall', 0, 3.9, 24.48, 0, 0, 0, 11.2, 7.8, 0.16, { tint: [1, 1, 1, 1], us: 4, vs: 3 });
  dm('quad', 'stainedGlassLancet', -2.75, 4.15, 24.36, 0, Math.PI, 0, 1.85, 3.7, 1, { tint: [1, 1, 1, 1], emissive: 0.78 });
  dm('quad', 'stainedGlassMary',    0.0,  4.25, 24.36, 0, Math.PI, 0, 2.10, 4.0, 1, { tint: [1, 1, 1, 1], emissive: 0.85 });
  dm('quad', 'stainedGlassLancet',  2.75, 4.15, 24.36, 0, Math.PI, 0, 1.85, 3.7, 1, { tint: [1, 1, 1, 1], emissive: 0.78 });
  dm('quad', 'maryBanner',          0.0,  6.65, 24.34, 0, Math.PI, 0, 5.8,  0.85, 1, { tint: [1, 1, 1, 1] });

  // Kính màu Lancet & Rose Window dọc 2 bên Thánh Đường
  var glassZs = [3.7, 7.5, 11.3];
  for (var gi = 0; gi < glassZs.length; gi++) {
    dm('quad', 'stainedGlassLancet', 5.96, 3.7, glassZs[gi], 0, -Math.PI * 0.5, 0, 1.9, 3.3, 1, { tint: [1, 1, 1, 1], emissive: 0.72 });
  }
  dm('quad', 'stainedGlassLancet', -5.96, 2.75, 4.2, 0, Math.PI * 0.5, 0, 1.8, 2.5, 1, { tint: [1, 1, 1, 1], emissive: 0.72 });
  dm('quad', 'stainedGlassLancet', -5.96, 2.75, 8.2, 0, Math.PI * 0.5, 0, 1.8, 2.5, 1, { tint: [1, 1, 1, 1], emissive: 0.72 });
  dm('quad', 'roseWindow',  5.94, 6.05, 7.5, 0, -Math.PI * 0.5, 0, 1.65, 1.65, 1, { tint: [1, 1, 1, 1], emissive: 0.75 });
  dm('quad', 'roseWindow',  5.45, 5.45, 19.6, 0, -Math.PI * 0.5, 0, 1.9, 1.9, 1, { tint: [1, 1, 1, 1], emissive: 0.75 });
  dm('quad', 'roseWindow', -5.45, 5.45, 19.6, 0,  Math.PI * 0.5, 0, 1.9, 1.9, 1, { tint: [1, 1, 1, 1], emissive: 0.75 });
  dm('quad', 'heritagePlaque', -5.95, 1.05, 6.2, 0, Math.PI * 0.5, 0, 3.2, 0.75, 1, { tint: [1, 1, 1, 1] });
  dm('quad', 'heritagePlaque',  5.95, 1.05, 6.2, 0, -Math.PI * 0.5, 0, 3.2, 0.75, 1, { tint: [1, 1, 1, 1] });

  // 4. NỘI THẤT THÁNH ĐƯỜNG, CUNG THÁNH & GÁC CHUÔNG
  // 2 Dãy ghế gỗ sồi/lim trái & phải
  for (var pi = 0; pi < st.pews.length; pi++) {
    var pw = st.pews[pi];
    dm('box', 'limWood', pw.x, 0.41, pw.z, 0, 0, 0, 2.55, 0.09, 0.50, { tint: [1.1, 0.98, 0.88, 1] });
    dm('box', 'limWood', pw.x, 0.68, pw.z + 0.21, 0, 0, 0, 2.55, 0.46, 0.09, { tint: [1.0, 0.90, 0.80, 1] });
    dm('box', 'limWood', pw.x - 1.18, 0.43, pw.z, 0, 0, 0, 0.14, 0.86, 0.54, { tint: [0.95, 0.84, 0.74, 1] });
    dm('box', 'limWood', pw.x + 1.18, 0.43, pw.z, 0, 0, 0, 0.14, 0.86, 0.54, { tint: [0.95, 0.84, 0.74, 1] });
  }

  // Chậu nước phép đá cẩm thạch tại (2.1, 0, 1.4)
  dm('cyl', 'sanctuaryMarble', 2.1, 0.39, 1.4, 0, 0, 0, 0.30, 0.78, 0.30, { tint: [0.96, 0.94, 0.90, 1] });
  dm('cup', 'sanctuaryMarble', 2.1, 0.84, 1.4, 0, 0, 0, 0.54, 0.16, 0.54, { tint: [1.0, 0.98, 0.94, 1] });
  dm('cyl', 'white', 2.1, 0.91, 1.4, 0, 0, 0, 0.44, 0.03, 0.44, { tint: [0.56, 0.84, 0.98, 0.92], specPow: 96, emissive: 0.25 });

  // Bàn Thờ đá hoa cương (X ∈ [-1.85, 1.85], Z ∈ [20.0, 21.3], Y = 0.45..1.51) + Khăn ren + Thánh Giá + Sách Lễ
  dm('box', 'sanctuaryMarble', 0, 0.91, 20.65, 0, 0, 0, 3.45, 0.92, 1.16, { tint: [0.58, 0.62, 0.68, 1], specPow: 48 });
  dm('box', 'altarCloth',      0, 1.44, 20.65, 0, 0, 0, 3.58, 0.14, 1.26, { tint: [1, 1, 1, 1] });
  // Thánh Giá Vàng giữa Bàn Thờ
  dm('box', 'agedBronze', 0, 1.57, 20.72, 0, 0, 0, 0.34, 0.12, 0.24, { tint: [1.05, 0.90, 0.40, 1], specPow: 90 });
  dm('box', 'agedBronze', 0, 2.02, 20.72, 0, 0, 0, 0.10, 0.88, 0.08, { tint: [1.1, 0.95, 0.45, 1], specPow: 90 });
  dm('box', 'agedBronze', 0, 2.14, 20.72, 0, 0, 0, 0.56, 0.10, 0.08, { tint: [1.1, 0.95, 0.45, 1], specPow: 90 });
  // Sách Lễ đỏ viền vàng tại (-0.85, 1.51, 20.65)
  dm('box', 'missalBook', -0.85, 1.56, 20.65, 0, 0.12, 0, 0.44, 0.10, 0.34, { tint: [1, 1, 1, 1] });

  // Tượng Đức Mẹ Hòa Bình tại (0, 0.45, 23.12) & 2 Giá nến X = ±3.2, Z = 18.9
  drawOurLadyStatueWebgl(wgl, 0, 0.45, 23.12, st.t, st.maryHalo);
  drawCathedralCandleStandWebgl(wgl, -3.2, 0.45, 18.9, st.t, st.candlesLit);
  drawCathedralCandleStandWebgl(wgl,  3.2, 0.45, 18.9, st.t, st.candlesLit);

  // Chùm đèn pha lê dọc Thánh Đường & Cung Thánh
  drawCathedralChandelierWebgl(wgl, 0, 4.9, 3.8, st.t);
  drawCathedralChandelierWebgl(wgl, 0, 4.9, 7.6, st.t);
  drawCathedralChandelierWebgl(wgl, 0, 4.9, 11.4, st.t);
  drawCathedralChandelierWebgl(wgl, 0, 5.2, 19.2, st.t);

  // Pipe Organ 17 ống & Chuông Đồng 1880 tại Gác Đàn Cánh Tây
  drawPipeOrganWebgl(wgl, st);
  drawBronzeBellWebgl(wgl, st);

  // 5. 10 GIÁO DÂN (parishioner) & CHÚ HEO 24×20 BILLBOARD GL.NEAREST
  if (typeof drawHumanBillboardWebgl === 'function' && st.parishioners) {
    for (var hi = 0; hi < st.parishioners.length; hi++) {
      drawHumanBillboardWebgl(wgl, cam, st.parishioners[hi], st.t);
    }
  }
  if (typeof drawPigBillboardWebgl === 'function') {
    drawPigBillboardWebgl(wgl, cam, st.pig, st.t, false);
  }

  // 6. TIA NẮNG KÍNH MÀU, SÓNG ÂM CHUÔNG, HẠT NẾN & VÒNG CHẠM SÀN
  wgl.setBlend('add');
  // 3 Dải tia nắng màu rọi từ kính màu Gothic
  dm('quad', 'white', 3.4, 2.35, 3.7, 0.45, -Math.PI * 0.5, 0.42, 1.4, 5.4, 1, { tint: [0.35, 0.62, 0.98, 0.14], emissive: 1.0 });
  dm('quad', 'white', 3.4, 2.35, 7.5, 0.45, -Math.PI * 0.5, 0.42, 1.4, 5.4, 1, { tint: [0.98, 0.74, 0.25, 0.15], emissive: 1.0 });
  dm('quad', 'white', 0.0, 2.45, 22.0, -0.52, 0, 0, 1.9, 4.4, 1, { tint: [0.55, 0.85, 1.0, 0.12 + st.maryHalo * 0.15], emissive: 1.0 });

  for (var si = 0; si < st.candleSparks.length; si++) {
    var sp = st.candleSparks[si];
    var al = Math.max(0.05, 1 - sp.t / sp.maxT) * 0.85;
    dm('sphere', 'white', sp.x, sp.y, sp.z, 0, 0, 0, 0.07, 0.07, 0.07, { tint: [1.0, 0.88, 0.35, al], emissive: 1.5 });
  }
  for (var hwi = 0; hwi < st.holyWaterDrops.length; hwi++) {
    var wd = st.holyWaterDrops[hwi];
    var wal = Math.max(0.05, 1 - wd.t / wd.maxT) * 0.85;
    dm('sphere', 'white', wd.x, wd.y, wd.z, 0, 0, 0, 0.055, 0.055, 0.055, { tint: [0.65, 0.90, 1.0, wal], emissive: 1.4 });
  }
  for (var wi = 0; wi < st.bellWaves.length; wi++) {
    var wv = st.bellWaves[wi];
    if (wv.t <= 0) continue;
    var wf = wv.t / wv.maxT;
    var wa = Math.max(0.05, (1 - wf) * 0.75);
    var ws = 0.7 + wf * 2.8;
    dm('torus', 'white', -11.6, 6.2, 6.2, 0, 0, 0, ws, ws, 0.4, { tint: [1.0, 0.88, 0.35, wa], emissive: 1.4 });
  }
  for (var ri = 0; ri < st.ripples.length; ri++) {
    var rp = st.ripples[ri];
    var rAlpha = Math.max(0, 1 - rp.t / 0.75) * 0.65;
    dm('torus', 'white', rp.x, (rp.y || 0) + 0.03, rp.z, Math.PI * 0.5, 0, 0, 0.35 + rp.t * 0.8, 0.35 + rp.t * 0.8, 0.2, { tint: [0.98, 0.80, 0.32, rAlpha], emissive: 1.2 });
  }
  wgl.setBlend(null);
}

/* ==================== 5. CANVAS2D FALLBACK (ĐẢM BẢO HEADLESS TEST 182 > 80 PRIMITIVES & 0 NaN) ==================== */
function renderCathedralTpsScene(ctx, cam, st, W, H) {
  ctx.fillStyle = '#3B2820';
  ctx.fillRect(0, 0, W, H);

  // Sàn nave Y = 0 + thảm đỏ + 3 bậc đá + sàn sanctuary Y = 0.45 + sàn belfry Y = 4.0
  drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#DFD3BE', '#8C7A64', 1);
  for (var gz = 0; gz < 14.8; gz += 1.85) {
    for (var gx = -6; gx < 6; gx += 2.0) {
      if ((Math.round(gz / 1.85) + Math.round((gx + 6) / 2.0)) % 2 === 0) {
        drawPoly3D(ctx, cam, [[gx, 0.003, gz], [gx + 2.0, 0.003, gz], [gx + 2.0, 0.003, gz + 1.85], [gx, 0.003, gz + 1.85]], '#C7B69B', null, 0);
      }
    }
  }
  drawPoly3D(ctx, cam, [[-0.9, 0.008, 0.2], [0.9, 0.008, 0.2], [0.9, 0.008, 14.6], [-0.9, 0.008, 14.6]], '#991B1B', '#D4AF37', 1);
  drawPoly3D(ctx, cam, [[-5.5, 0.45, 14.8], [5.5, 0.45, 14.8], [5.5, 0.45, 24.4], [-5.5, 0.45, 24.4]], '#F2ECE1', '#B8AA96', 1);
  drawPoly3D(ctx, cam, [[-15.2, 4.0, 4.0], [-6.0, 4.0, 4.0], [-6.0, 4.0, 14.8], [-15.2, 4.0, 14.8]], '#7C5332', '#4A2C1A', 1);

  // Trần vòm Gothic 7.8m + tường
  drawPoly3D(ctx, cam, [[-6, 7.8, 0], [6, 7.8, 0], [6, 7.8, 24.4], [-6, 7.8, 24.4]], '#BFA88A', '#8C6D4F', 1);
  drawPoly3D(ctx, cam, [[-6, 0, 0], [-6, 0, 14.8], [-6, 7.8, 14.8], [-6, 7.8, 0]], '#D4BEA0', '#5A251B', 1);
  drawPoly3D(ctx, cam, [[6, 0, 14.8], [6, 0, 0], [6, 7.8, 0], [6, 7.8, 14.8]], '#D4BEA0', '#5A251B', 1);
  drawPoly3D(ctx, cam, [[-5.5, 0.45, 24.4], [5.5, 0.45, 24.4], [5.5, 7.8, 24.4], [-5.5, 7.8, 24.4]], '#D2BC9E', '#5A251B', 1);

  if (typeof drawCathedralWalls3D === 'function') {
    drawCathedralWalls3D(ctx, cam, st.room || 'nave', st.t, st.candleGlow);
  }

  // 3 Bậc đá cẩm thạch + Cầu thang chữ L 14 bậc
  for (var ms = 0; ms < 3; ms++) {
    drawBox3D(ctx, cam, 0, 0, 14.8 + ms * 0.45, 4.4, (ms + 1) * 0.15, 0.45, { top: '#F5F0E6', front: '#DFD3BE', side: '#C7B69B', stroke: '#78716C' });
  }
  for (var s1 = 0; s1 < 7; s1++) {
    drawBox3D(ctx, cam, -3.2 - s1 * 0.42, 0, 11.8, 0.42, (s1 + 1) * 0.28, 1.4, { top: '#966137', front: '#6B3E1E', side: '#4A2C1A', stroke: '#2B180E' });
  }
  for (var s2 = 0; s2 < 7; s2++) {
    drawBox3D(ctx, cam, -6.72, 2.0, 10.7 - s2 * 0.42, 1.35, (s2 + 1) * 0.28, 0.42, { top: '#966137', front: '#6B3E1E', side: '#4A2C1A', stroke: '#2B180E' });
  }

  // 2 Dãy ghế gỗ + Chậu nước phép + Bàn Thờ + Sách Lễ + Pipe Organ + Chuông Đồng
  for (var pi = 0; pi < st.pews.length; pi++) {
    var pw = st.pews[pi];
    drawBox3D(ctx, cam, pw.x, 0.36, pw.z, 2.55, 0.10, 0.52, { top: '#7C4F2B', front: '#5C341D', side: '#4A2518', stroke: '#2B180E' });
    drawBox3D(ctx, cam, pw.x, 0.46, pw.z + 0.22, 2.55, 0.44, 0.10, { top: '#6B3E1E', front: '#4A2518', side: '#3B1D12', stroke: '#2B180E' });
  }
  drawBox3D(ctx, cam, 2.1, 0, 1.4, 0.34, 0.78, 0.34, { top: '#E7E5E4', front: '#D6D3D1', side: '#A8A29E', stroke: '#57534E' });
  drawBox3D(ctx, cam, 0, 0.45, 20.65, 3.45, 0.96, 1.16, { top: '#FFFDF7', front: '#475569', side: '#334155', stroke: '#D4AF37' });
  drawBox3D(ctx, cam, -0.85, 1.51, 20.65, 0.44, 0.10, 0.34, { top: '#B91C1C', front: '#991B1B', side: '#7F1D1D', stroke: '#F4B93B' });
  drawBox3D(ctx, cam, -11.3, 4.0, 13.85, 5.4, 1.36, 0.96, { top: '#6B3E1E', front: '#4A2518', side: '#3B1D12', stroke: '#23110B' });
  drawBox3D(ctx, cam, -11.6, 4.0, 6.2, 1.8, 3.2, 0.4, { top: '#5C341D', front: '#4A2518', side: '#3B1D12', stroke: '#23110B' });

  // Giáo dân + Chú Heo Mascot
  if (typeof drawHumanTps3D === 'function' && st.parishioners) {
    for (var hi = 0; hi < st.parishioners.length; hi++) {
      drawHumanTps3D(ctx, cam, st.parishioners[hi], st.t);
    }
  }
  if (typeof drawPigTps3D === 'function') {
    drawPigTps3D(ctx, cam, st.pig, st.t);
  }
}
`;
}
