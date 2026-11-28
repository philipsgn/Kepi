/**
 * Cửa Hàng Adidas Originals Hội An Hợp Nhất WebGL 3D Liên Hoàn (Quyết định 250)
 * - Không gian Chế độ A kín 100% hợp nhất 3 khu vực trên cùng 1 hệ tọa độ thế giới:
 *   1. 'hall' (Tầng 1): X ∈ [-6.0, 6.0], Z ∈ [0, 14.8], Y = 0
 *      - Kệ giày trái X ∈ [-5.95, -4.65], Z ∈ [1.8, 7.6] (thoáng >= 0.66m trước cầu thang)
 *      - Giá áo phải X ∈ [4.65, 5.95], Z ∈ [1.9, 7.4] (thoáng >= 0.66m trước vòm)
 *      - Đảo Sneaker trung tâm X ∈ [-1.35, 1.35], Z ∈ [5.15, 7.25] (hotspot inspect_island)
 *   2. 'fitting' (Cánh Phải Tầng 1): X ∈ [6.0, 15.6], Z ∈ [4.8, 13.2], Y = 0
 *      - Vòm cửa mở tại X = 6.0, Z ∈ [8.4, 11.2], Y ∈ [0, 2.8]
 *      - Gương toàn thân + bục tường Đông X ∈ [14.85, 15.55], Z ∈ [7.2, 10.8]
 *      - 2 dải Rèm Nhung Đỏ Z ∈ [5.0, 7.1] & [10.9, 13.0] tại X = 15.52
 *      - Giá Áo Khoác 3 Sọc tường Nam X ∈ [7.6, 13.8], Z ∈ [4.85, 5.95]
 *      - Ghế Băng Gỗ Thử Giày + hộp giày X ∈ [9.8, 11.4], Z ∈ [10.4, 11.4]
 *   3. 'upper' (Lầu 2 BST VN): X ∈ [-6.0, 6.0], Z ∈ [0, 14.8], Y = 3.4
 *      - Lỗ sàn Lầu 2 khớp 100% tại X ∈ [-5.1, -2.9], Z ∈ [8.55, 13.35]
 *      - Chiếu nghỉ sau Z ∈ [13.4, 14.8] (1.4m)
 *      - Kệ BST VN X ∈ [-5.95, -4.65], Z ∈ [1.8, 7.6]
 *      - Bục Samba X ∈ [-0.65, 1.05], Z ∈ [7.15, 8.45]
 *      - Thu ngân POS X ∈ [3.15, 5.95], Z ∈ [4.2, 9.6]
 *   - Cầu thang gỗ Hội An 12 bậc (hall ↔ upper): X ∈ [-5.0, -3.0], Z ∈ [8.6, 13.4] (Y: 0 → 3.4, 35.3°),
 *     dẫn đường qua ADIDAS_NAV_GRAPH (bước từng bậc liên tục, rayRampQuad bắt tia trực tiếp lên bậc).
 * - Giữ createAdidasTpsState, stepAdidasTps, renderAdidasTpsScene Canvas2D fallback an toàn cho Test 182.
 */
export function buildAdidasTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. ĐỒ THỊ KHÔNG GIAN LIÊN HOÀN ADIDAS HỘI AN (QĐ 250) ==================== */
var ADIDAS_NAV_GRAPH = {
  outerBounds: { minX: -6.0, maxX: 15.6, minZ: 0.0, maxZ: 14.8, minY: 0.45, maxY: 6.8 },
  wallMargin: 0.38,
  zones: [
    { id: 'hall',    minX: -5.65, maxX: 5.95,  minZ: 0.35, maxZ: 14.40, floorY: 0 },
    { id: 'fitting', minX: 6.00,  maxX: 15.25, minZ: 5.15, maxZ: 12.85, floorY: 0 },
    { id: 'upper',   minX: -5.65, maxX: 5.65,  minZ: 0.35, maxZ: 14.45, floorY: 3.4 }
  ],
  ramps: [
    {
      id: 'adidas_stair',
      axis: 'z',
      minX: -5.0, maxX: -3.0,
      zStart: 8.6, zEnd: 13.4,
      yStart: 0, yEnd: 3.4
    }
  ],
  dividerWalls: [
    // Vách ngăn X = 6.0 Tầng 1, mở Vòm Phòng Thay Đồ tại Z ∈ [8.4, 11.2], Y ∈ [0, 2.8]
    {
      axis: 'x', pos: 6.0, minSpan: 0.0, maxSpan: 14.8, minY: 0.0, maxY: 3.45,
      openings: [{ a1: 8.4, a2: 11.2, y1: 0.0, y2: 2.8 }]
    },
    // Tường Nam & Bắc của cánh Phòng Thay Đồ
    { axis: 'z', pos: 4.8,  minSpan: 6.0, maxSpan: 15.6, minY: 0.0, maxY: 3.45, openings: [] },
    { axis: 'z', pos: 13.2, minSpan: 6.0, maxSpan: 15.6, minY: 0.0, maxY: 3.45, openings: [] },
    // Vách X = 6.0 Lầu 2 kín 100%
    { axis: 'x', pos: 6.0,  minSpan: 0.0, maxSpan: 14.8, minY: 3.4, maxY: 6.8,  openings: [] }
  ],
  edges: [
    {
      from: 'hall',
      to: 'fitting',
      waypointsForward: [{ x: 5.15, y: 0, z: 9.8 }, { x: 6.85, y: 0, z: 9.8 }],
      waypointsBackward: [{ x: 6.85, y: 0, z: 9.8 }, { x: 5.15, y: 0, z: 9.8 }]
    },
    {
      from: 'hall',
      to: 'upper',
      waypointsForward: [
        { x: -4.0, y: 0,   z: 8.15 },
        { x: -4.0, y: 3.4, z: 13.95 },
        { x: -2.2, y: 3.4, z: 13.95 }
      ],
      waypointsBackward: [
        { x: -2.2, y: 3.4, z: 13.95 },
        { x: -4.0, y: 3.4, z: 13.95 },
        { x: -4.0, y: 0,   z: 8.15 }
      ]
    }
  ]
};

function getAdidasSurfaceY(x, z, curY) {
  if (x >= -5.05 && x <= -2.95 && z >= 8.55 && z <= 13.45) {
    if (z <= 8.6) return 0;
    if (z >= 13.4) return 3.4;
    if (curY >= 3.2 && z < 12.95 && x > -3.10) return 3.4;
    return ((z - 8.6) / 4.8) * 3.4;
  }
  if (x > 6.0) return 0;
  return curY >= 1.9 ? 3.4 : 0;
}

function createAdidasNpcs() {
  var routes = [
    {
      id: 'staff_island', role: 'adidas_staff', shirt: '#111827', hair: '#1C1917', carryProp: 'shoebox',
      state: 'SIT', timer: 3.2, stepIdx: 0,
      pts: [
        { x: -2.35, y: 0, z: 6.2, sit: false, yaw: Math.PI * 0.5 },
        { x: -2.35, y: 0, z: 4.2, sit: false, yaw: -Math.PI * 0.5 },
        { x: -3.65, y: 0, z: 4.2, sit: false, yaw: -Math.PI * 0.5 },
        { x: -2.35, y: 0, z: 6.2, sit: false, yaw: Math.PI * 0.5 }
      ]
    },
    {
      id: 'staff_fitting', role: 'adidas_staff', shirt: '#111827', hair: '#292524', carryProp: 'none',
      state: 'WALK', timer: 0, stepIdx: 0,
      pts: [
        { x: 3.6,  y: 0, z: 7.8, yaw: -Math.PI * 0.5 },
        { x: 5.2,  y: 0, z: 9.8, yaw: Math.PI * 0.5 },
        { x: 8.6,  y: 0, z: 9.2, yaw: Math.PI * 0.35 },
        { x: 8.6,  y: 0, z: 9.2, sit: false, yaw: Math.PI * 0.5 },
        { x: 5.2,  y: 0, z: 9.8, yaw: -Math.PI * 0.5 },
        { x: 3.6,  y: 0, z: 5.2, yaw: -Math.PI * 0.5 }
      ]
    },
    {
      id: 'staff_cashier', role: 'adidas_staff', shirt: '#111827', hair: '#1C1917', carryProp: 'shoebox',
      state: 'SIT', timer: 999, stepIdx: 0,
      pts: [
        { x: 4.95, y: 3.4, z: 6.8, sit: true, yaw: -Math.PI * 0.5 }
      ]
    },
    {
      id: 'customer_stairs', role: 'customer', shirt: '#DC2626', hair: '#1E1B18', carryProp: 'none',
      state: 'WALK', timer: 0, stepIdx: 0,
      pts: [
        { x: 1.8,  y: 0,   z: 3.2 },
        { x: -1.8, y: 0,   z: 7.9 },
        { x: -4.0, y: 0,   z: 8.2 },
        { x: -4.0, y: 3.4, z: 13.95 },
        { x: -2.2, y: 3.4, z: 13.95 },
        { x: -2.2, y: 3.4, z: 7.6 },
        { x: 1.8,  y: 3.4, z: 7.4 },
        { x: 1.8,  y: 3.4, z: 7.4, sit: false, yaw: Math.PI * 0.5 },
        { x: -2.2, y: 3.4, z: 13.95 },
        { x: -4.0, y: 3.4, z: 13.95 },
        { x: -4.0, y: 0,   z: 8.2 },
        { x: 0.4,  y: 0,   z: 2.8 }
      ]
    },
    {
      id: 'customer_fitting', role: 'customer', shirt: '#2563EB', hair: '#451A03', carryProp: 'none',
      state: 'WALK', timer: 0, stepIdx: 1,
      pts: [
        { x: -1.5, y: 0, z: 2.4 },
        { x: 2.6,  y: 0, z: 8.8 },
        { x: 5.2,  y: 0, z: 9.8 },
        { x: 12.6, y: 0, z: 9.0 },
        { x: 12.6, y: 0, z: 9.0, sit: false, yaw: Math.PI * 0.5 },
        { x: 10.6, y: 0, z: 9.8 },
        { x: 5.2,  y: 0, z: 9.8 },
        { x: 1.9,  y: 0, z: 4.5 }
      ]
    }
  ];
  var out = [];
  for (var i = 0; i < routes.length; i++) {
    var r = routes[i];
    var cur = r.pts[r.stepIdx % r.pts.length];
    out.push({
      id: r.id,
      role: r.role,
      shirt: r.shirt,
      hair: r.hair,
      carryProp: r.carryProp,
      x: cur.x, y: cur.y, z: cur.z,
      yaw: cur.yaw || 0,
      state: r.state,
      timer: r.timer,
      stepIdx: r.stepIdx,
      pts: r.pts,
      phase: i * 0.85,
      moving: r.state === 'WALK',
      seated: false
    });
  }
  return out;
}

function createAdidasTpsState() {
  var npcs = createAdidasNpcs();
  var hallStaff = [npcs[0], npcs[1]];
  var upperCashier = npcs[2];
  var particles = [];
  for (var i = 0; i < 18; i++) {
    particles.push({
      x: -4.2 + ((i * 37) % 140) * 0.12,
      y: 1.2 + ((i * 23) % 45) * 0.10,
      z: 1.2 + ((i * 19) % 120) * 0.10,
      phase: i * 0.63
    });
  }

  return {
    room: 'hall',
    floor: 1,
    pig: {
      x: 0, y: 0, z: 2.2, yaw: 0,
      targetX: 0, targetZ: 2.2,
      waypoints: [],
      walking: false,
      seated: false,
      eating: false,
      wearingJacket: false,
      boughtSamba: false,
      outfit: 'none',
      pendingAction: null
    },
    npcs: npcs,
    hallStaff: hallStaff,
    upperCashier: upperCashier,
    particles: particles,
    leftDoorOpen: 0.0,
    rightDoorOpen: 0.0,
    exitFade: 0,
    exiting: false,
    ripples: [],
    actionFlashUntil: 0,
    actionFlashText: '',
    t: 0
  };
}

function clampAdidasWalkPos(st, x, z, floorY) {
  var fy = typeof floorY === 'number' ? floorY : (st.pig.y >= 1.9 ? 3.4 : 0);
  var nx = x, nz = z;
  var boxes = [];

  if (fy >= 1.9) {
    // Lầu 2 (upper): X ∈ [-6.0, 6.0], Z ∈ [0, 14.8]
    nx = Math.max(-5.65, Math.min(5.65, nx));
    nz = Math.max(0.55, Math.min(14.45, nz));
    boxes = [
      { x1: -5.95, z1: 1.8,  x2: -4.65, z2: 7.6 },   // Kệ BST VN
      { x1: -0.65, z1: 7.15, x2: 1.05,  z2: 8.45 },  // Bục Samba
      { x1: 3.15,  z1: 4.2,  x2: 5.95,  z2: 9.6 },   // Thu ngân POS
      // Lan can lỗ sàn Lầu 2 (X ∈ [-5.1, -2.9], Z ∈ [8.55, 13.35]), để ngỏ chiếu nghỉ sau Z ∈ [13.4, 14.8]
      { x1: -3.10, z1: 8.55, x2: -2.85, z2: 13.35 },
      { x1: -5.10, z1: 8.45, x2: -2.90, z2: 8.70 },
      { x1: -5.30, z1: 8.55, x2: -4.95, z2: 13.35 }
    ];
  } else if (nx >= 6.0) {
    // Phòng Thay Đồ (fitting): X ∈ [6.0, 15.6], Z ∈ [4.8, 13.2]
    nx = Math.min(15.25, nx);
    nz = Math.max(5.15, Math.min(12.85, nz));
    if (nx < 6.35 && (nz < 8.65 || nz > 10.95)) nx = 6.35;
    boxes = [
      { x1: 7.6,   z1: 4.85, x2: 13.8,  z2: 5.95 },  // Giá Áo Khoác 3 Sọc tường Nam
      { x1: 14.85, z1: 7.2,  x2: 15.55, z2: 10.8 },  // Bục Gương toàn thân tường Đông
      { x1: 9.8,   z1: 10.4, x2: 11.4,  z2: 11.4 }   // Ghế Băng Gỗ Thử Giày + hộp giày
    ];
  } else {
    // Sảnh Tầng 1 (hall): X ∈ [-6.0, 6.0], Z ∈ [0, 14.8]
    nx = Math.max(-5.65, nx);
    nz = Math.max(0.55, Math.min(14.40, nz));
    if (nx > 5.65 && (nz < 8.65 || nz > 10.95)) nx = 5.65;
    boxes = [
      { x1: -1.35, z1: 5.15, x2: 1.35,  z2: 7.25 },  // Đảo Sneaker trung tâm
      { x1: -5.95, z1: 1.8,  x2: -4.65, z2: 7.6 },   // Kệ giày trái thu gọn
      { x1: 4.65,  z1: 1.9,  x2: 5.95,  z2: 7.4 },   // Giá áo phải thu gọn
      // Chặn đi vòng sau gầm thang Tầng 1
      { x1: -5.95, z1: 13.45, x2: -2.90, z2: 14.8 },
      { x1: -3.05, z1: 8.85,  x2: -2.85, z2: 13.45 }
    ];
  }

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

function planAdidasRealtimePath(st, tx, targetFloorY, tz, pendingAction) {
  var p = st.pig;
  p.seated = false;
  p.eating = false;
  p.pendingAction = pendingAction || null;

  var isStairTarget = (tx >= -5.0 && tx <= -3.0 && tz >= 8.6 && tz <= 13.4 && targetFloorY > 0.05 && targetFloorY < 3.35);
  var cl = isStairTarget
    ? { x: Math.max(-4.7, Math.min(-3.3, tx)), z: Math.max(8.6, Math.min(13.4, tz)) }
    : clampAdidasWalkPos(st, tx, tz, targetFloorY);
  tx = cl.x; tz = cl.z;

  var onStairsNow = (p.x >= -5.05 && p.x <= -2.95 && p.z > 8.65 && p.z < 13.35 && p.y > 0.15 && p.y < 3.25);

  if (onStairsNow || isStairTarget) {
    var wps = [];
    if (onStairsNow) {
      if (isStairTarget) {
        wps.push({ x: tx, y: targetFloorY, z: tz });
      } else if (targetFloorY >= 3.0) {
        wps.push({ x: -4.0, y: 3.4, z: 13.95 });
        wps.push({ x: -2.2, y: 3.4, z: 13.95 });
        if (tz < 8.55 && tx < -2.6) wps.push({ x: -2.2, y: 3.4, z: 8.0 });
        wps.push({ x: tx, y: 3.4, z: tz });
      } else {
        wps.push({ x: -4.0, y: 0, z: 8.15 });
        if (tx >= 6.0) {
          wps.push({ x: 2.4, y: 0, z: 8.8 });
          wps.push({ x: 5.15, y: 0, z: 9.8 });
          wps.push({ x: 6.85, y: 0, z: 9.8 });
        }
        wps.push({ x: tx, y: 0, z: tz });
      }
    } else {
      // Điểm đến nằm ngay giữa bậc cầu thang
      if (p.y >= 1.9) {
        if (p.z < 8.55 && p.x < -2.6) wps.push({ x: -2.2, y: 3.4, z: 8.0 });
        wps.push({ x: -2.2, y: 3.4, z: 13.95 });
        wps.push({ x: -4.0, y: 3.4, z: 13.95 });
      } else {
        if (p.x >= 6.0) {
          wps.push({ x: 6.85, y: 0, z: 9.8 });
          wps.push({ x: 5.15, y: 0, z: 9.8 });
        }
        wps.push({ x: -4.0, y: 0, z: 8.15 });
      }
      wps.push({ x: tx, y: targetFloorY, z: tz });
    }
    p.waypoints = wps;
    p.targetX = wps[0].x; p.targetZ = wps[0].z;
    p.walking = true;
    return;
  }

  if (typeof planNavGraphRealtimePath === 'function') {
    planNavGraphRealtimePath(ADIDAS_NAV_GRAPH, st, tx, targetFloorY, tz, { pendingAction: pendingAction });
    // Tránh lỗ cầu thang Lầu 2 nếu đi từ chiếu nghỉ sang cánh trái Lầu 2 hoặc ngược lại
    if (targetFloorY >= 3.0 && p.waypoints && p.waypoints.length) {
      var fixed = [];
      var prevX = p.x, prevY = p.y, prevZ = p.z;
      for (var wi = 0; wi < p.waypoints.length; wi++) {
        var wp = p.waypoints[wi];
        if (prevY >= 3.0 && wp.y >= 3.0 && Math.min(prevX, wp.x) < -2.6 && Math.max(prevZ, wp.z) > 8.45 && Math.min(prevZ, wp.z) < 13.45) {
          if (prevZ > 11.0 && wp.z < 8.6) fixed.push({ x: -2.2, y: 3.4, z: 13.95 }, { x: -2.2, y: 3.4, z: 8.0 });
          else if (prevZ < 8.6 && wp.z > 11.0) fixed.push({ x: -2.2, y: 3.4, z: 8.0 }, { x: -2.2, y: 3.4, z: 13.95 });
        }
        fixed.push(wp);
        prevX = wp.x; prevY = wp.y; prevZ = wp.z;
      }
      p.waypoints = fixed;
      p.targetX = fixed[0].x; p.targetZ = fixed[0].z;
    }
    // Tránh Đảo Sneaker trung tâm khi đi ngang Sảnh Tầng 1 sang Fitting
    if (targetFloorY < 1.0 && p.x < 1.8 && tx >= 6.0 && p.z < 6.0) {
      p.waypoints.unshift({ x: 2.35, y: 0, z: 8.6 });
      p.targetX = p.waypoints[0].x; p.targetZ = p.waypoints[0].z;
    }
    if (p.waypoints && p.waypoints.length > 0) {
      var lastWp = p.waypoints[p.waypoints.length - 1];
      lastWp.x = tx; lastWp.z = tz;
    }
    return;
  }

  p.waypoints = [{ x: tx, y: targetFloorY, z: tz }];
  p.targetX = tx; p.targetZ = tz;
  p.walking = true;
}

function stepAdidasNpcs(st, dt) {
  if (!st.npcs) return;
  for (var i = 0; i < st.npcs.length; i++) {
    var n = st.npcs[i];
    if (n.state === 'SIT') {
      n.moving = false;
      n.timer -= dt;
      if (n.timer <= 0) {
        n.state = 'WALK';
        n.stepIdx = (n.stepIdx + 1) % n.pts.length;
      }
      continue;
    }
    var tgt = n.pts[(n.stepIdx + 1) % n.pts.length];
    var dx = tgt.x - n.x, dz = tgt.z - n.z;
    var d = Math.hypot(dx, dz);
    if (d < 0.10) {
      n.x = tgt.x; n.z = tgt.z;
      n.y = typeof tgt.y === 'number' ? tgt.y : getAdidasSurfaceY(n.x, n.z, n.y);
      n.stepIdx = (n.stepIdx + 1) % n.pts.length;
      if (tgt.sit || n.pts.length === 1) {
        n.state = 'SIT';
        n.moving = false;
        n.timer = n.pts.length === 1 ? 999 : (2.6 + (i % 3) * 1.1);
        if (typeof tgt.yaw === 'number') n.yaw = tgt.yaw;
      } else {
        n.state = 'SIT';
        n.moving = false;
        n.timer = 1.6 + (i % 3) * 0.9;
        if (typeof tgt.yaw === 'number') n.yaw = tgt.yaw;
      }
    } else {
      n.moving = true;
      var onStairNpc = (n.x >= -5.0 && n.x <= -3.0 && n.z >= 8.6 && n.z <= 13.4);
      var spd = Math.min(d, (onStairNpc ? 1.25 : 1.55) * dt);
      n.x += (dx / d) * spd;
      n.z += (dz / d) * spd;
      n.y = getAdidasSurfaceY(n.x, n.z, n.y);
      n.yaw = Math.atan2(dx, dz);
    }
  }
}

function stepAdidasTps(st, dt) {
  st.t += dt;
  st._lastDt = dt;
  var p = st.pig;

  for (var pi = 0; pi < (st.particles ? st.particles.length : 0); pi++) {
    var pt = st.particles[pi];
    pt.x += Math.sin(st.t * 0.8 + pt.phase) * dt * 0.08;
    pt.y += Math.cos(st.t * 0.7 + pt.phase) * dt * 0.05;
  }

  stepAdidasNpcs(st, dt);

  if (!p.seated && p.walking) {
    var curWp = (p.waypoints && p.waypoints.length > 0) ? p.waypoints[0] : { x: p.targetX, z: p.targetZ, y: p.y };
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
        if (p.pendingAction === 'inspect_island') {
          p.yaw = Math.atan2(-p.x, 6.2 - p.z);
          st.actionFlashText = '👟 SAMBA OG · PREDATOR';
          st.actionFlashUntil = st.t + 2.8;
        } else if (p.pendingAction === 'try_jacket') {
          p.wearingJacket = !p.wearingJacket;
          p.outfit = p.wearingJacket ? 'adidas_jacket' : 'none';
          p.yaw = Math.PI * 0.5;
          st.actionFlashText = p.wearingJacket ? '👕 3 SỌC VIP' : '👕 ĐÃ CỞI ÁO';
          st.actionFlashUntil = st.t + 2.8;
        } else if (p.pendingAction === 'buy_samba') {
          p.boughtSamba = true;
          p.yaw = Math.PI * 0.5;
          st.actionFlashText = '🛍️ SAMBA OG HỘI AN';
          st.actionFlashUntil = st.t + 3.2;
        } else if (p.pendingAction === 'inspect_vn_col') {
          p.yaw = -Math.PI * 0.5;
          st.actionFlashText = '🇻🇳 NÓN LÁ × 3 SỌC';
          st.actionFlashUntil = st.t + 2.8;
        } else if (p.pendingAction === 'exit_adidas') {
          st.exiting = true;
        }
        p.pendingAction = null;
      }
    } else {
      var onStairs = (p.x >= -5.05 && p.x <= -2.95 && p.z > 8.55 && p.z < 13.45);
      var spd = Math.min(dist, (onStairs ? 2.6 : 3.6) * dt);
      var nx = p.x + (dx / dist) * spd;
      var nz = p.z + (dz / dist) * spd;
      if (onStairs) {
        p.x = Math.max(-4.85, Math.min(-3.15, nx));
        p.z = nz;
      } else {
        var next = clampAdidasWalkPos(st, nx, nz, p.y);
        p.x = next.x; p.z = next.z;
      }
      var tyaw = Math.atan2(dx, dz);
      p.yaw = (typeof tpsLerpAngle === 'function') ? tpsLerpAngle(p.yaw || 0, tyaw, Math.min(1, dt * 12)) : tyaw;
    }
    p.y = getAdidasSurfaceY(p.x, p.z, p.y);
    st.floor = p.y >= 1.9 ? 2 : 1;
    st.room = p.y >= 1.9 ? 'upper' : (p.x >= 6.0 ? 'fitting' : 'hall');
  }

  p.outfit = p.wearingJacket ? 'adidas_jacket' : 'none';

  var targetDoor = (p.y < 1.9 && p.x < 6.0 && st.exiting) ? 0.92 : 0.0;
  st.rightDoorOpen += (targetDoor - st.rightDoorOpen) * Math.min(1, dt * 6.0);
  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.5);

  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== 2. CAMERA SPRING-ARM PORTAL-AWARE & RAYCAST 3D ADIDAS ==================== */
function computeAdidasWebglCamera(cam, st) {
  var p = st.pig;
  var inFitting = p.y < 1.9 && p.x >= 6.0;
  var onUpper = p.y >= 2.1;
  var navCfg = {
    wallMargin: 0.38,
    zones: ADIDAS_NAV_GRAPH.zones,
    dividerWalls: ADIDAS_NAV_GRAPH.dividerWalls,
    outerBounds: onUpper
      ? { minX: -6.0, maxX: 6.0, minZ: 0.0, maxZ: 14.8, minY: 0.45, maxY: 6.75 }
      : (inFitting
        ? { minX: -6.0, maxX: 15.6, minZ: 4.8, maxZ: 13.2, minY: 0.45, maxY: 3.35 }
        : { minX: -6.0, maxX: 15.6, minZ: 0.0, maxZ: 14.8, minY: 0.45, maxY: 3.32 })
  };
  if (typeof computeWebglTpsCamera === 'function') {
    computeWebglTpsCamera(cam, p, navCfg, st._lastDt || 0.016);
  }
}

function adidasRaySphereDist(ox, oy, oz, dx, dy, dz, cx, cy, cz, rad) {
  var ocx = cx - ox, ocy = cy - oy, ocz = cz - oz;
  var proj = ocx * dx + ocy * dy + ocz * dz;
  if (proj < 0.2 || proj > 26) return -1;
  var d2 = (ocx * ocx + ocy * ocy + ocz * ocz) - proj * proj;
  return d2 <= rad * rad ? proj : -1;
}

function pickAdidasTarget3D(cam, st, sx, sy) {
  var nx = (sx - cam.vw * 0.5) / (cam.focal || 400);
  var ny = (cam.vh * 0.5 - sy) / (cam.focal || 400);
  var dx = cam.F.x + cam.R.x * nx + cam.U.x * ny;
  var dy = cam.F.y + cam.R.y * nx + cam.U.y * ny;
  var dz = cam.F.z + cam.R.z * nx + cam.U.z * ny;
  var dl = Math.hypot(dx, dy, dz) || 1;
  dx /= dl; dy /= dl; dz /= dl;
  var ox = cam.pos.x, oy = cam.pos.y, oz = cam.pos.z;

  // 1. Hotspots tương tác trực tiếp bằng chạm 3D
  if (adidasRaySphereDist(ox, oy, oz, dx, dy, dz, 0, 0.75, 6.2, 1.35) > 0) {
    var standZ = st.pig.z >= 6.2 ? 7.85 : 4.55;
    return { kind: 'hotspot', action: 'inspect_island', x: 0, y: 0, z: standZ };
  }
  if (adidasRaySphereDist(ox, oy, oz, dx, dy, dz, 15.1, 1.4, 9.0, 1.45) > 0 ||
      adidasRaySphereDist(ox, oy, oz, dx, dy, dz, 10.7, 1.2, 5.4, 1.35) > 0 ||
      adidasRaySphereDist(ox, oy, oz, dx, dy, dz, 10.6, 0.45, 10.9, 0.95) > 0) {
    return { kind: 'hotspot', action: 'try_jacket', x: 13.4, y: 0, z: 9.0 };
  }
  if (adidasRaySphereDist(ox, oy, oz, dx, dy, dz, 4.1, 4.3, 6.8, 1.45) > 0 ||
      adidasRaySphereDist(ox, oy, oz, dx, dy, dz, 0.2, 4.1, 7.8, 0.95) > 0) {
    return { kind: 'hotspot', action: 'buy_samba', x: 2.35, y: 3.4, z: 6.8 };
  }
  if (adidasRaySphereDist(ox, oy, oz, dx, dy, dz, -5.2, 4.8, 4.7, 1.35) > 0) {
    return { kind: 'hotspot', action: 'inspect_vn_col', x: -3.75, y: 3.4, z: 4.7 };
  }

  // Cửa mặt tiền Z = 0 -> bước ra Đại lộ Sài Gòn
  if (dz < -0.02) {
    var td = (0.20 - oz) / dz;
    if (td > 0.3 && td < 18) {
      var ddx = ox + dx * td, ddy = oy + dy * td;
      if (ddy >= 0 && ddy <= 2.75 && Math.abs(ddx) <= 1.35) {
        return { kind: 'exit', action: 'exit_adidas', x: 0, y: 0, z: 0.90 };
      }
    }
  }

  // 2. Bắn tia trực tiếp lên 12 bậc cầu thang gỗ Hội An (rayRampQuad)
  if (typeof rayRampQuad === 'function') {
    var stairHit = rayRampQuad(ox, oy, oz, dx, dy, dz, {
      axis: 'z', minX: -5.0, maxX: -3.0, zStart: 8.6, zEnd: 13.4, yStart: 0, yEnd: 3.4
    });
    if (stairHit) {
      return { kind: 'stair', x: stairHit.x, y: stairHit.y, z: stairHit.z };
    }
  }

  // 3. Sàn Lầu 2 (Y = 3.4, trừ lỗ thông thang X ∈ [-5.1, -2.9], Z ∈ [8.55, 13.35]) & Sàn Tầng 1 (hall + fitting)
  if (dy < -0.025) {
    var t2 = (3.4 - oy) / dy;
    if (t2 > 0.2 && t2 < 26) {
      var x2 = ox + dx * t2, z2 = oz + dz * t2;
      var inHole = (x2 >= -5.1 && x2 <= -2.9 && z2 >= 8.55 && z2 <= 13.35);
      if (x2 >= -5.9 && x2 <= 5.9 && z2 >= 0.3 && z2 <= 14.6 && !inHole) {
        return { kind: 'floor', x: x2, y: 3.4, z: z2 };
      }
    }
    var t1 = (0 - oy) / dy;
    if (t1 > 0.2 && t1 < 30) {
      var x1 = ox + dx * t1, z1 = oz + dz * t1;
      var inHall = (x1 >= -5.9 && x1 <= 6.0 && z1 >= 0.3 && z1 <= 14.6);
      var inFit  = (x1 >= 6.0 && x1 <= 15.5 && z1 >= 4.9 && z1 <= 13.1);
      if (inHall || inFit) {
        return { kind: 'floor', x: x1, y: 0, z: z1 };
      }
    }
  }
  return null;
}

function getAdidasContextAction(st) {
  var p = st.pig;
  if (p.y >= 1.9) {
    if ((p.x > 1.35 && p.z >= 3.8 && p.z <= 10.4) || Math.hypot(p.x - 0.2, p.z - 7.8) < 1.85) {
      return { id: 'buy_samba', label: '🛍️ Chọn mua giày Samba' };
    }
    if (p.x < -2.35 && p.z >= 1.6 && p.z <= 8.2) {
      return { id: 'inspect_vn_col', label: '🇻🇳 Ngắm BST Nón Lá & Áo 3 Sọc' };
    }
    return null;
  }
  if (p.x >= 6.0) {
    return { id: 'try_jacket', label: p.wearingJacket ? '👕 Cởi áo khoác 3 Sọc' : '👕 Thử áo khoác 3 Sọc' };
  }
  if (Math.hypot(p.x, p.z - 6.2) < 2.35) {
    return { id: 'inspect_island', label: '👟 Ngắm Đảo Giày Samba & Predator' };
  }
  if (p.z <= 1.95 && Math.abs(p.x) <= 2.35) {
    return { id: 'exit_adidas', label: '🚪 Ra lại Đại Lộ Sài Gòn' };
  }
  return null;
}

/* ==================== 3. RENDER WEBGL 3D TOÀN BỘ ADIDAS ORIGINALS HỘI AN ==================== */
function drawAdidasLanternWebgl(wgl, x, y, z, colRgb, ceilY) {
  var dm = wgl.drawMesh;
  var hCord = Math.max(0.15, (ceilY || 3.4) - y - 0.22);
  dm('cyl', 'white', x, y + 0.22 + hCord * 0.5, z, 0, 0, 0, 0.025, hCord, 0.025, { tint: [0.18, 0.12, 0.08, 1] });
  dm('cyl', 'white', x, y + 0.22, z, 0, 0, 0, 0.16, 0.05, 0.16, { tint: [0.95, 0.74, 0.22, 1] });
  dm('sphere', 'white', x, y, z, 0, 0, 0, 0.42, 0.44, 0.42, { tint: [colRgb[0], colRgb[1], colRgb[2], 1], emissive: 1.15 });
  dm('cyl', 'white', x, y - 0.22, z, 0, 0, 0, 0.14, 0.05, 0.14, { tint: [0.95, 0.74, 0.22, 1] });
  dm('cyl', 'white', x, y - 0.34, z, 0, 0, 0, 0.03, 0.18, 0.03, { tint: [0.92, 0.24, 0.18, 1] });
}

function drawAdidasTrefoilLampWebgl(wgl, x, y, z, ry) {
  var dm = wgl.drawMesh;
  var c = [1.0, 0.92, 0.58, 1];
  dm('sphere', 'white', x, y + 0.14, z, 0, ry, 0, 0.22, 0.38, 0.10, { tint: c, emissive: 1.25 });
  dm('sphere', 'white', x - Math.cos(ry) * 0.16, y + 0.04, z + Math.sin(ry) * 0.16, 0, ry, 0.55, 0.20, 0.34, 0.10, { tint: c, emissive: 1.25 });
  dm('sphere', 'white', x + Math.cos(ry) * 0.16, y + 0.04, z - Math.sin(ry) * 0.16, 0, ry, -0.55, 0.20, 0.34, 0.10, { tint: c, emissive: 1.25 });
  dm('box', 'white', x, y - 0.06, z, 0, ry, 0, 0.36, 0.05, 0.08, { tint: [0.16, 0.10, 0.06, 1] });
}

function drawAdidasSneaker3D(wgl, x, y, z, bodyCol, stripeCol, soleCol) {
  var dm = wgl.drawMesh;
  dm('box', 'white', x, y + 0.045, z, 0, 0.25, 0, 0.36, 0.07, 0.16, { tint: soleCol || [0.71, 0.33, 0.04, 1] });
  dm('box', 'white', x - 0.02, y + 0.13, z, 0, 0.25, 0, 0.28, 0.12, 0.15, { tint: bodyCol || [1, 0.98, 0.94, 1], specPow: 48 });
  dm('box', 'white', x + 0.11, y + 0.10, z - 0.03, 0, 0.25, 0, 0.12, 0.07, 0.14, { tint: bodyCol || [1, 0.98, 0.94, 1] });
  for (var s = -1; s <= 1; s++) {
    dm('box', 'white', x + s * 0.045, y + 0.135, z, 0, 0.25, 0, 0.022, 0.10, 0.158, { tint: stripeCol || [0.07, 0.09, 0.15, 1] });
  }
}

function drawAdidasHangingJacket3D(wgl, x, y, z, ry, colRgb) {
  var dm = wgl.drawMesh;
  dm('box', 'white', x, y, z, 0, ry, 0, 0.44, 0.56, 0.10, { tint: colRgb });
  dm('box', 'white', x, y + 0.18, z, 0, ry, 0, 0.64, 0.18, 0.10, { tint: colRgb });
  var sx = Math.cos(ry), sz = -Math.sin(ry);
  dm('box', 'white', x - sx * 0.27, y + 0.06, z - sz * 0.27, 0, ry, 0, 0.06, 0.44, 0.11, { tint: [1, 0.98, 0.94, 1] });
  dm('box', 'white', x + sx * 0.27, y + 0.06, z + sz * 0.27, 0, ry, 0, 0.06, 0.44, 0.11, { tint: [1, 0.98, 0.94, 1] });
}

function renderAdidasWebglScene(wgl, cam, st, W, H) {
  computeAdidasWebglCamera(cam, st);

  var adidasAtmo = {
    clearColor: [0.17, 0.09, 0.05, 1.0],
    hemiLow: [0.34, 0.24, 0.16],
    hemiHigh: [0.76, 0.62, 0.42],
    sunDir: [0.25, 0.72, 0.64],
    sunCol: [1.06, 0.88, 0.60],
    wrapBias: 0.46,
    lights: [
      { pos: [0.0, 2.9, 6.2],   col: [1.15, 0.80, 0.36] }, // Đèn lồng & Spotlight Đảo Sneaker
      { pos: [12.5, 2.7, 9.0],  col: [1.05, 0.76, 0.42] }, // Ánh sáng ấm Phòng Thay Đồ & Gương
      { pos: [-4.0, 2.6, 11.2], col: [1.05, 0.68, 0.28] }, // Đèn lồng cầu thang Hội An
      { pos: [1.2, 6.0, 7.2],   col: [1.12, 0.84, 0.46] }  // Ánh sáng Lầu 2 BST VN & POS
    ],
    outdoorRect: [0.0, 0.0, 0.0, 0.0],
    fogCol: [0.22, 0.14, 0.08],
    fogParams: [12.0, 28.0, 0.35]
  };
  wgl.beginFrame(W, H, cam, adidasAtmo);
  var dm = wgl.drawMesh;

  // ==================== A. KIẾN TRÚC CHẾ ĐỘ A KÍN 100% (HALL + FITTING + UPPER) ====================
  // 1. Sàn Tầng 1 'hall' (Gạch bông Hội An + thảm sọc lối vào)
  dm('box', 'gachBong', 0, -0.05, 7.4, 0, 0, 0, 12.0, 0.10, 14.8, { tint: [1, 1, 1, 1], us: 5, vs: 6 });
  dm('box', 'limWood', 0, 0.008, 2.6, 0, 0, 0, 2.2, 0.014, 4.2, { tint: [0.55, 0.34, 0.20, 1] });

  // 2. Sàn Cánh Phải 'fitting' (X ∈ [6.0, 15.6], Z ∈ [4.8, 13.2], Y = 0) + Thảm thử đồ xanh-vàng
  dm('box', 'limWood', 10.8, -0.05, 9.0, 0, 0, 0, 9.6, 0.10, 8.4, { tint: [1.15, 0.92, 0.74, 1], us: 5, vs: 4 });
  dm('box', 'fittingGreenWall', 13.3, 0.008, 9.0, 0, 0, 0, 3.0, 0.014, 4.2, { tint: [1.1, 1.15, 1.05, 1] });

  // 3. Tường bao ngoài Tầng 1 & Lầu 2 (kín 100%, 0 hở trời)
  dm('box', 'hoiAnYellowWall', -6.06, 3.4, 7.4, 0, 0, 0, 0.14, 6.8, 14.8, { tint: [1, 1, 1, 1], us: 5, vs: 2.4 });
  dm('box', 'hoiAnYellowWall',  0,    3.4, 14.86, 0, 0, 0, 12.1, 6.8, 0.14, { tint: [1, 1, 1, 1], us: 4.5, vs: 2.4 });
  // Tường mặt tiền Z = 0 với khung cửa gỗ-kính Hội An (cánh phải mở khi thoát)
  dm('box', 'hoiAnYellowWall', -3.68, 3.4, -0.06, 0, 0, 0, 4.65, 6.8, 0.14, { tint: [1, 1, 1, 1], us: 2, vs: 2.4 });
  dm('box', 'hoiAnYellowWall',  3.68, 3.4, -0.06, 0, 0, 0, 4.65, 6.8, 0.14, { tint: [1, 1, 1, 1], us: 2, vs: 2.4 });
  dm('box', 'hoiAnYellowWall',  0,    4.77, -0.06, 0, 0, 0, 2.72, 4.06, 0.14, { tint: [1, 1, 1, 1], us: 1.5, vs: 1.5 });
  // Vệt nắng ngược sáng khi cánh phải hé mở rời cửa hàng
  dm('quad', 'white', 0, 1.37, -0.04, 0, 0, 0, 2.66, 2.74, 1, { tint: [1.0, 0.96, 0.80, 1], emissive: 1.1 });
  // Cánh cửa trái đóng kín & cánh cửa phải xoay bản lề
  dm('quad', 'vnDoorWood', -0.67, 1.37, 0.04, 0, 0, 0, 1.33, 2.72, 1, { tint: [1, 1, 1, 1], us: 0.5, vs: 1 });
  var rAng = st.rightDoorOpen * 0.92;
  dm('box', 'limWood', 1.35 - Math.cos(rAng) * 0.66, 1.37, 0.04 + Math.sin(rAng) * 0.66, 0, -rAng, 0, 1.33, 2.72, 0.06, { tint: [1.05, 0.95, 0.85, 1] });
  dm('quad', 'vnDoorWood', 1.35 - Math.cos(rAng) * 0.66, 1.37, 0.08 + Math.sin(rAng) * 0.66, 0, -rAng, 0, 1.25, 2.64, 1, { tint: [1, 1, 1, 1], us: 0.5, uo: 0.5 });

  // 4. Vách ngăn X = 6.0 giữa 'hall' và 'fitting' (Vòm mở Z ∈ [8.4, 11.2], Y ∈ [0, 2.8]) + Lầu 2 kín
  dm('box', 'hoiAnYellowWall', 6.0, 1.7, 4.2,  0, 0, 0, 0.14, 3.4, 8.4, { tint: [1, 1, 1, 1], us: 3, vs: 1.2 });
  dm('box', 'hoiAnYellowWall', 6.0, 1.7, 13.0, 0, 0, 0, 0.14, 3.4, 3.6, { tint: [1, 1, 1, 1], us: 1.4, vs: 1.2 });
  dm('box', 'hoiAnYellowWall', 6.0, 3.1, 9.8,  0, 0, 0, 0.14, 0.6, 2.8, { tint: [1, 1, 1, 1], us: 1.2, vs: 0.4 });
  dm('box', 'limWood',         6.0, 2.8, 9.8,  0, 0, 0, 0.24, 0.16, 2.9, { tint: [0.9, 0.8, 0.7, 1] });
  dm('box', 'limWood',         6.0, 1.4, 8.38, 0, 0, 0, 0.24, 2.8, 0.16, { tint: [0.9, 0.8, 0.7, 1] });
  dm('box', 'limWood',         6.0, 1.4, 11.22,0, 0, 0, 0.24, 2.8, 0.16, { tint: [0.9, 0.8, 0.7, 1] });
  dm('box', 'hoiAnYellowWall', 6.0, 5.1, 7.4,  0, 0, 0, 0.14, 3.4, 14.8, { tint: [1, 1, 1, 1], us: 5, vs: 1.2 });

  // 5. Tường & Trần Phòng Thay Đồ 'fitting' (X ∈ [6.0, 15.6], Z ∈ [4.8, 13.2], Y = 0..3.4)
  dm('box', 'fittingGreenWall', 10.8, 1.7, 4.74, 0, 0, 0, 9.6, 3.4, 0.14, { tint: [1, 1, 1, 1], us: 3.5, vs: 1.2 });
  dm('box', 'fittingGreenWall', 10.8, 1.7, 13.26,0, 0, 0, 9.6, 3.4, 0.14, { tint: [1, 1, 1, 1], us: 3.5, vs: 1.2 });
  dm('box', 'fittingGreenWall', 15.66,1.7, 9.0,  0, 0, 0, 0.14, 3.4, 8.4, { tint: [1, 1, 1, 1], us: 3, vs: 1.2 });
  dm('box', 'limWood',          10.8, 3.45, 9.0, 0, 0, 0, 9.7, 0.14, 8.5, { tint: [0.85, 0.75, 0.65, 1], us: 4, vs: 3 });
  for (var fbx = 7.4; fbx <= 14.2; fbx += 2.2) {
    dm('box', 'limWood', fbx, 3.32, 9.0, 0, 0, 0, 0.18, 0.16, 8.4, { tint: [0.65, 0.50, 0.36, 1] });
  }

  // 6. Sàn Lầu 2 'upper' (Y = 3.35) CHIA 4 MẢNG KHỚP LỖ THANG X ∈ [-5.1, -2.9], Z ∈ [8.55, 13.35] & CHIẾU NGHỈ SAU Z ∈ [13.4, 14.8]
  dm('box', 'limWood',  1.55, 3.35, 7.4,   0, 0, 0, 8.9, 0.12, 14.8,  { tint: [1.15, 0.96, 0.78, 1], us: 4.5, vs: 7 });
  dm('box', 'limWood', -5.55, 3.35, 7.4,   0, 0, 0, 0.9, 0.12, 14.8,  { tint: [1.15, 0.96, 0.78, 1], us: 0.6, vs: 7 });
  dm('box', 'limWood', -4.00, 3.35, 4.275, 0, 0, 0, 2.2, 0.12, 8.55,  { tint: [1.15, 0.96, 0.78, 1], us: 1.4, vs: 4 });
  dm('box', 'limWood', -4.00, 3.35, 14.075,0, 0, 0, 2.2, 0.12, 1.45,  { tint: [1.15, 0.96, 0.78, 1], us: 1.4, vs: 1 });
  // Thảm đỏ-vàng Lầu 2 dẫn tới Tranh Hoa Sen × 3 Sọc
  dm('box', 'velvetCurtain', 0.2, 3.42, 7.2, 0, 0, 0, 2.8, 0.012, 9.6, { tint: [1.05, 0.85, 0.75, 1] });

  // 7. Trần gỗ lim chính Lầu 2 (Y = 6.8) & hệ xà gồ Hội An
  dm('box', 'limWood', 0, 6.85, 7.4, 0, 0, 0, 12.1, 0.16, 14.9, { tint: [0.85, 0.75, 0.65, 1], us: 5, vs: 6 });
  for (var bz = 2.0; bz <= 13.6; bz += 2.6) {
    dm('box', 'limWood', 0, 6.68, bz, 0, 0, 0, 12.0, 0.18, 0.22, { tint: [0.60, 0.45, 0.32, 1] });
    dm('box', 'limWood', 1.8, 3.22, bz, 0, 0, 0, 8.4, 0.14, 0.18, { tint: [0.62, 0.48, 0.34, 1] });
  }

  // ==================== B. CẦU THANG GỖ HỘI AN 12 BẬC (X ∈ [-5.0, -3.0], Z ∈ [8.6, 13.4]) ====================
  for (var s = 0; s < 12; s++) {
    var sz = 8.6 + (s + 0.5) * (4.8 / 12);
    var sy = (s + 0.5) * (3.4 / 12);
    dm('box', 'limWood', -4.0, sy * 0.5, sz, 0, 0, 0, 2.0, sy, 0.42, { tint: [1.10, 0.92, 0.76, 1], us: 1.5, vs: 1 });
  }
  // Lan can tay vịn gỗ bên phải cầu thang & lan can lỗ sàn Lầu 2 (chừa lối chiếu nghỉ sau Z ∈ [13.4, 14.8])
  dm('box', 'limWood', -2.96, 2.25, 11.0, -0.61, 0, 0, 0.10, 0.12, 5.8, { tint: [0.8, 0.65, 0.48, 1] });
  dm('box', 'limWood', -2.96, 3.85, 10.95, 0, 0, 0, 0.10, 0.85, 4.8, { tint: [0.75, 0.60, 0.45, 1] });
  dm('box', 'limWood', -4.00, 3.85, 8.55,  0, 0, 0, 2.20, 0.85, 0.10, { tint: [0.75, 0.60, 0.45, 1] });

  // ==================== C. NỘI THẤT & MỸ THUẬT TƯỜNG TẦNG 1 ('hall') ====================
  // Tường Trái Kệ giày thu gọn X ∈ [-5.95, -4.65], Z ∈ [1.8, 7.6] (thoáng >= 0.66m trước cầu thang)
  dm('box', 'limWood', -5.30, 0.42, 4.70, 0, 0, 0, 1.25, 0.84, 5.8, { tint: [1.05, 0.90, 0.76, 1] });
  dm('quad', 'shoeDisplayBoard', -5.90, 2.05, 4.70, 0, Math.PI * 0.5, 0, 5.6, 1.95, 1, { tint: [1, 1, 1, 1] });
  drawAdidasSneaker3D(wgl, -5.15, 0.85, 2.8, [1, 0.98, 0.94, 1], [0.07, 0.09, 0.15, 1], [0.71, 0.33, 0.04, 1]);
  drawAdidasSneaker3D(wgl, -5.15, 0.85, 4.7, [0.86, 0.15, 0.15, 1], [1, 0.98, 0.94, 1], [0.95, 0.96, 0.98, 1]);
  drawAdidasSneaker3D(wgl, -5.15, 0.85, 6.6, [0.12, 0.16, 0.23, 1], [0.98, 0.45, 0.09, 1], [0.06, 0.09, 0.16, 1]);

  // Tường Phải Giá áo thu gọn X ∈ [4.65, 5.95], Z ∈ [1.9, 7.4] (thoáng >= 0.66m trước vòm)
  dm('box', 'limWood', 5.30, 0.36, 4.65, 0, 0, 0, 1.20, 0.72, 5.5, { tint: [1.05, 0.90, 0.76, 1] });
  dm('quad', 'threeStripesWall', 5.90, 2.10, 4.65, 0, -Math.PI * 0.5, 0, 5.3, 1.85, 1, { tint: [1, 1, 1, 1] });
  dm('cyl', 'white', 5.35, 2.18, 4.65, Math.PI * 0.5, 0, 0, 0.05, 5.0, 0.05, { tint: [0.82, 0.64, 0.24, 1] });
  drawAdidasHangingJacket3D(wgl, 5.35, 1.72, 2.9, -Math.PI * 0.5, [0.07, 0.09, 0.15, 1]);
  drawAdidasHangingJacket3D(wgl, 5.35, 1.72, 4.65,-Math.PI * 0.5, [0.11, 0.31, 0.85, 1]);
  drawAdidasHangingJacket3D(wgl, 5.35, 1.72, 6.4, -Math.PI * 0.5, [0.72, 0.11, 0.11, 1]);

  // Tường Sau Tầng 1 (Z = 14.74): Bảng hiệu ADIDAS ORIGINALS · HỘI AN HERITAGE
  dm('quad', 'trefoilOriginSign', 1.8, 2.45, 14.74, 0, Math.PI, 0, 5.8, 1.55, 1, { tint: [1, 1, 1, 1] });

  // Đảo Sneaker Trung Tâm (X ∈ [-1.35, 1.35], Z ∈ [5.15, 7.25])
  dm('box', 'limWood', 0, 0.42, 6.2, 0, 0, 0, 2.55, 0.84, 1.95, { tint: [0.95, 0.82, 0.70, 1] });
  dm('box', 'hoiAnYellowWall', 0, 0.88, 6.2, 0, 0, 0, 2.68, 0.08, 2.08, { tint: [1.05, 0.96, 0.82, 1], specPow: 64 });
  dm('box', 'white', -0.75, 0.99, 6.2, 0, 0, 0, 0.56, 0.14, 0.56, { tint: [0.98, 0.96, 0.90, 1] });
  dm('box', 'white',  0.00, 1.03, 6.2, 0, 0, 0, 0.62, 0.22, 0.62, { tint: [0.08, 0.10, 0.16, 1], specPow: 80 });
  dm('box', 'white',  0.75, 0.99, 6.2, 0, 0, 0, 0.56, 0.14, 0.56, { tint: [0.98, 0.96, 0.90, 1] });
  drawAdidasSneaker3D(wgl, -0.75, 1.06, 6.2, [1, 0.98, 0.94, 1], [0.07, 0.09, 0.15, 1], [0.71, 0.33, 0.04, 1]);
  drawAdidasSneaker3D(wgl,  0.00, 1.14, 6.2, [0.12, 0.16, 0.23, 1], [0.98, 0.45, 0.09, 1], [0.06, 0.09, 0.16, 1]);
  drawAdidasSneaker3D(wgl,  0.75, 1.06, 6.2, [0.86, 0.15, 0.15, 1], [1, 0.98, 0.94, 1], [0.95, 0.96, 0.98, 1]);

  // ==================== D. NỘI THẤT PHÒNG THAY ĐỒ ('fitting') ====================
  // 1. Gương toàn thân + bục tường Đông (X ∈ [14.85, 15.55], Z ∈ [7.2, 10.8])
  dm('box', 'limWood', 15.20, 0.10, 9.0, 0, 0, 0, 0.70, 0.20, 3.60, { tint: [1.05, 0.88, 0.72, 1] });
  dm('quad', 'mirrorGlass', 15.50, 1.72, 9.0, 0, -Math.PI * 0.5, 0, 3.45, 3.04, 1, { tint: [1, 1, 1, 1], specPow: 96, rim: 0.25 });
  // Phản chiếu chú Heo trực tiếp trong Gương toàn thân khi bước vào Phòng Thay Đồ!
  if (st.pig.y < 1.9 && st.pig.x >= 5.5) {
    var mirrorZ = Math.max(7.85, Math.min(10.15, st.pig.z));
    var mTex = typeof ensurePigBillboardTex === 'function'
      ? ensurePigBillboardTex(wgl, 'front', st.pig.walking ? 1 : 0, 0, 0, 0, 0, st.pig.outfit || 'none')
      : 'white';
    dm('quad', mTex, 15.44, 0.62, mirrorZ, 0, -Math.PI * 0.5, 0, 0.66, 0.66, 1, {
      tint: [0.90, 0.96, 1.0, 1], emissive: 1.0
    });
  }
  // 2. Hai dải Rèm Nhung Đỏ kẹp 2 bên gương tại X = 15.52 (Z ∈ [5.0, 7.1] & [10.9, 13.0])
  dm('quad', 'velvetCurtain', 15.52, 1.70, 6.05,  0, -Math.PI * 0.5, 0, 2.1, 3.3, 1, { tint: [1, 1, 1, 1] });
  dm('quad', 'velvetCurtain', 15.52, 1.70, 11.95, 0, -Math.PI * 0.5, 0, 2.1, 3.3, 1, { tint: [1, 1, 1, 1] });

  // 3. Giá Áo Khoác 3 Sọc tường Nam (X ∈ [7.6, 13.8], Z ∈ [4.85, 5.95])
  dm('box', 'limWood', 10.7, 0.29, 5.40, 0, 0, 0, 6.2, 0.58, 1.10, { tint: [1.0, 0.85, 0.72, 1] });
  dm('cyl', 'white', 10.7, 2.28, 5.35, 0, 0, Math.PI * 0.5, 0.05, 5.8, 0.05, { tint: [0.84, 0.66, 0.24, 1] });
  dm('quad', 'threeStripesWall', 10.7, 2.75, 4.86, 0, 0, 0, 4.4, 0.95, 1, { tint: [1, 1, 1, 1] });
  drawAdidasHangingJacket3D(wgl, 8.4,  1.82, 5.35, 0, [0.07, 0.09, 0.15, 1]);
  drawAdidasHangingJacket3D(wgl, 10.0, 1.82, 5.35, 0, [0.08, 0.32, 0.18, 1]);
  drawAdidasHangingJacket3D(wgl, 11.6, 1.82, 5.35, 0, [0.60, 0.11, 0.11, 1]);
  drawAdidasHangingJacket3D(wgl, 13.1, 1.82, 5.35, 0, [0.07, 0.09, 0.15, 1]);

  // 4. Ghế Băng Gỗ Thử Giày + hộp giày (X ∈ [9.8, 11.4], Z ∈ [10.4, 11.4])
  dm('box', 'limWood', 10.6, 0.21, 10.9, 0, 0, 0, 1.58, 0.42, 0.96, { tint: [1.05, 0.88, 0.72, 1] });
  dm('box', 'fittingGreenWall', 10.6, 0.48, 10.9, 0, 0, 0, 1.48, 0.12, 0.86, { tint: [1.1, 1.25, 1.0, 1] });
  dm('box', 'white', 11.15, 0.12, 10.55, 0, 0.15, 0, 0.42, 0.22, 0.54, { tint: [0.11, 0.31, 0.85, 1] });
  drawAdidasSneaker3D(wgl, 11.15, 0.23, 10.55, [1, 0.98, 0.94, 1], [0.07, 0.09, 0.15, 1], [0.71, 0.33, 0.04, 1]);

  // ==================== E. NỘI THẤT & MỸ THUẬT LẦU 2 ('upper', Y = 3.4) ====================
  // 1. Kệ BST VN (X ∈ [-5.95, -4.65], Z ∈ [1.8, 7.6])
  dm('box', 'limWood', -5.30, 3.82, 4.70, 0, 0, 0, 1.25, 0.84, 5.8, { tint: [1.05, 0.90, 0.76, 1] });
  dm('quad', 'vnCollectionSign', -5.90, 5.45, 4.70, 0, Math.PI * 0.5, 0, 5.6, 2.05, 1, { tint: [1, 1, 1, 1] });
  dm('box', 'white', -5.20, 4.33, 3.4, 0, 0, 0, 0.46, 0.18, 0.56, { tint: [0.85, 0.15, 0.12, 1] });
  dm('box', 'white', -5.20, 4.33, 6.0, 0, 0, 0, 0.46, 0.18, 0.56, { tint: [0.06, 0.46, 0.43, 1] });

  // 2. Bục Samba trung tâm Lầu 2 (X ∈ [-0.65, 1.05], Z ∈ [7.15, 8.45])
  dm('box', 'limWood', 0.20, 3.84, 7.80, 0, 0, 0, 1.60, 0.88, 1.20, { tint: [0.95, 0.82, 0.70, 1] });
  dm('box', 'white',   0.20, 4.35, 7.80, 0, 0, 0, 0.72, 0.14, 0.62, { tint: [0.11, 0.31, 0.85, 1] });
  drawAdidasSneaker3D(wgl, 0.20, 4.42, 7.80, [1, 0.98, 0.94, 1], [0.07, 0.09, 0.15, 1], [0.71, 0.33, 0.04, 1]);

  // 3. Quầy Thu Ngân POS (X ∈ [3.15, 5.95], Z ∈ [4.2, 9.6])
  dm('box', 'limWood', 3.85, 3.92, 6.90, 0, 0, 0, 1.18, 1.04, 5.2, { tint: [1.05, 0.88, 0.72, 1] });
  dm('box', 'hoiAnYellowWall', 3.85, 4.48, 6.90, 0, 0, 0, 1.32, 0.10, 5.35, { tint: [1.05, 0.95, 0.80, 1] });
  dm('box', 'white', 3.82, 4.70, 6.10, 0, 0, 0, 0.36, 0.34, 0.44, { tint: [0.12, 0.16, 0.23, 1], specPow: 80 });
  dm('box', 'white', 3.82, 4.65, 7.65, 0, 0, 0, 0.44, 0.24, 0.62, { tint: [0.11, 0.31, 0.85, 1] });
  drawAdidasSneaker3D(wgl, 3.82, 4.77, 7.65, [1, 0.98, 0.94, 1], [0.07, 0.09, 0.15, 1], [0.71, 0.33, 0.04, 1]);
  dm('quad', 'posShelfTex', 5.90, 5.50, 6.90, 0, -Math.PI * 0.5, 0, 5.6, 2.0, 1, { tint: [1, 1, 1, 1] });

  // 4. Tường Sau Lầu 2 (Z = 14.74): Tranh Nón Lá × Hoa Sen × 3 Sọc
  dm('quad', 'vnLotusStripeArt', 1.75, 5.45, 14.74, 0, Math.PI, 0, 6.2, 2.25, 1, { tint: [1, 1, 1, 1] });

  // ==================== F. 8 ĐÈN LỒNG LỤA HỘI AN + 3 ĐÈN CỎ BA LÁ TREFOIL LED ====================
  var lanterns = [
    [-2.4, 2.82, 3.4,  [0.94, 0.27, 0.27], 3.35],
    [ 2.4, 2.82, 3.4,  [0.96, 0.62, 0.04], 3.35],
    [-2.4, 2.82, 7.6,  [0.98, 0.80, 0.08], 3.35],
    [ 2.4, 2.82, 7.6,  [0.86, 0.15, 0.15], 3.35],
    [10.8, 2.86, 7.2,  [0.96, 0.62, 0.04], 3.40],
    [10.8, 2.86, 11.0, [0.98, 0.80, 0.08], 3.40],
    [-2.0, 6.05, 5.0,  [0.94, 0.27, 0.27], 6.80],
    [ 2.2, 6.05, 9.8,  [0.96, 0.62, 0.04], 6.80]
  ];
  for (var li = 0; li < lanterns.length; li++) {
    drawAdidasLanternWebgl(wgl, lanterns[li][0], lanterns[li][1], lanterns[li][2], lanterns[li][3], lanterns[li][4]);
  }
  // 3 Đèn Cỏ Ba Lá Trefoil LED (Hall + Fitting + Upper)
  drawAdidasTrefoilLampWebgl(wgl, 0.0, 2.55, 6.2, 0);
  drawAdidasTrefoilLampWebgl(wgl, 14.8, 2.68, 9.0, -Math.PI * 0.5);
  drawAdidasTrefoilLampWebgl(wgl, 0.2, 5.95, 7.8, 0);

  // ==================== G. 5 NPC PIXEL ART (gl.NEAREST) & CHÚ HEO MASCOT 24×20 ====================
  if (st.npcs) {
    for (var ni = 0; ni < st.npcs.length; ni++) {
      if (typeof drawHumanBillboardWebgl === 'function') {
        drawHumanBillboardWebgl(wgl, cam, st.npcs[ni], st.t);
      }
    }
  }
  if (typeof drawPigBillboardWebgl === 'function') {
    drawPigBillboardWebgl(wgl, cam, st.pig, st.t, false);
  }

  // Vòng sóng chạm sàn + hạt bụi ánh vàng Hội An
  wgl.setBlend('add');
  for (var rIdx = 0; rIdx < st.ripples.length; rIdx++) {
    var rp = st.ripples[rIdx];
    var rAlpha = Math.max(0, 1 - rp.t / 0.75) * 0.72;
    dm('torus', 'white', rp.x, (rp.y || 0) + 0.03, rp.z, Math.PI * 0.5, 0, 0, 0.35 + rp.t * 0.85, 0.35 + rp.t * 0.85, 0.2, {
      tint: [0.98, 0.80, 0.32, rAlpha], emissive: 1.25
    });
  }
  for (var pIdx = 0; pIdx < (st.particles ? st.particles.length : 0); pIdx++) {
    var pt = st.particles[pIdx];
    dm('sphere', 'white', pt.x, pt.y, pt.z, 0, 0, 0, 0.024, 0.024, 0.024, { tint: [1.0, 0.88, 0.52, 0.42], emissive: 1.1 });
  }
  wgl.setBlend(null);

  // Fade thoát cửa hàng ra Đại Lộ Sài Gòn
  if (st.exitFade > 0.01) {
    wgl.setBlend('alpha');
    dm('quad', 'white', cam.pos.x + cam.F.x * 0.6, cam.pos.y + cam.F.y * 0.6, cam.pos.z + cam.F.z * 0.6, 0, cam.yaw, 0, 6, 6, 1, {
      tint: [0.96, 0.93, 0.86, Math.min(1, st.exitFade)], emissive: 1.0
    });
    wgl.setBlend(null);
  }
}

/* ==================== 4. FALLBACK CANVAS2D CHO HEADLESS SMOKE TEST 182 & NON-WEBGL ==================== */
function drawAdidasStaircase3D(ctx, cam, isGoingUp) {
  for (var s = 0; s < 12; s++) {
    var sy = isGoingUp ? (s * 0.283) : ((11 - s) * 0.22);
    var sz = 8.6 + s * 0.40;
    drawBox3D(ctx, cam, -4.0, 0, sz, 2.0, Math.max(0.22, sy + 0.26), 0.42, {
      top: '#966137', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E'
    });
  }
  drawBox3D(ctx, cam, -2.96, 0, 8.6, 0.08, 1.05, 0.08, { top: '#4A2C1A', front: '#2B180E', side: '#2B180E' });
  drawBox3D(ctx, cam, -2.96, 0, 13.4, 0.08, 2.95, 0.08, { top: '#4A2C1A', front: '#2B180E', side: '#2B180E' });
  drawPoly3D(ctx, cam, [[-2.96, 1.02, 8.6], [-2.96, 2.92, 13.4], [-2.96, 3.00, 13.4], [-2.96, 1.10, 8.6]], '#4A2C1A', '#2B180E', 1.5);
}

function drawSneakerSprite3D(ctx, cam, wx, wy, wz, bodyCol, stripeCol, soleCol) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 16 || pr.cz < 0.35) return;
  var u = Math.max(0.45, Math.min(2.8, pr.scale / 40));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  ctx.fillStyle = 'rgba(43,24,14,0.28)';
  ctx.beginPath(); ctx.ellipse(px, py + 1 * u, 7 * u, 2.2 * u, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = soleCol || '#B45309';
  ctx.fillRect(px - 6 * u, py - 2.2 * u, 12 * u, 2.6 * u);
  ctx.fillStyle = bodyCol || '#FFFBF1';
  ctx.fillRect(px - 5.5 * u, py - 6.2 * u, 9.5 * u, 4.2 * u);
  ctx.fillRect(px + 2.8 * u, py - 4.4 * u, 3.0 * u, 2.4 * u);
  ctx.fillStyle = stripeCol || '#111827';
  ctx.fillRect(px - 2.6 * u, py - 5.6 * u, 1.1 * u, 3.2 * u);
  ctx.fillRect(px - 0.8 * u, py - 5.6 * u, 1.1 * u, 3.2 * u);
  ctx.fillRect(px + 1.0 * u, py - 5.6 * u, 1.1 * u, 3.2 * u);
  ctx.strokeStyle = '#2B180E'; ctx.lineWidth = 1;
  ctx.strokeRect(px - 6 * u, py - 6.2 * u, 12 * u, 6.6 * u);
  ctx.restore();
}

function renderAdidasTpsScene(ctx, cam, st, W, H) {
  var room = st.room || (st.pig.y >= 1.9 ? 'upper' : (st.pig.x >= 6.0 ? 'fitting' : 'hall'));
  var isHall = room === 'hall';
  var isFitting = room === 'fitting';

  ctx.fillStyle = isFitting ? '#213527' : (!isHall ? '#5C341D' : '#4A2C1A');
  ctx.fillRect(0, 0, W, H);

  if (isHall) {
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#E8DEC8', '#8C7A5B', 1);
    for (var tz = 0; tz < 14.4; tz += 1.6) {
      for (var tx = -6; tx < 6; tx += 1.6) {
        if ((Math.round(tx / 1.6) + Math.round(tz / 1.6)) % 2 === 0) {
          drawPoly3D(ctx, cam, [[tx, 0.004, tz], [tx + 1.6, 0.004, tz], [tx + 1.6, 0.004, tz + 1.6], [tx, 0.004, tz + 1.6]], '#D6C4A1', '#B5A17D', 0.6);
        }
      }
    }
    drawPoly3D(ctx, cam, [[-1.1, 0.008, 0.4], [1.1, 0.008, 0.4], [1.1, 0.008, 4.8], [-1.1, 0.008, 4.8]], '#3B2314', '#F4B93B', 1.2);
  } else if (isFitting) {
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#8F6038', '#4A2C1A', 1);
    for (var fx = -6; fx < 6; fx += 1.2) {
      drawPoly3D(ctx, cam, [[fx, 0.004, 0], [fx + 0.6, 0.004, 0], [fx + 0.6, 0.004, 14.8], [fx, 0.004, 14.8]], '#7D512D', '#5C341D', 0.5);
    }
    drawPoly3D(ctx, cam, [[-2.0, 0.01, 9.6], [2.0, 0.01, 9.6], [2.0, 0.01, 13.6], [-2.0, 0.01, 13.6]], '#1F3D2B', '#F4B93B', 1.8);
  } else {
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#9C6D44', '#5C341D', 1);
    for (var ux = -6; ux < 6; ux += 1.2) {
      drawPoly3D(ctx, cam, [[ux, 0.004, 0], [ux + 0.6, 0.004, 0], [ux + 0.6, 0.004, 14.8], [ux, 0.004, 14.8]], '#8B5E38', '#6B4226', 0.5);
    }
    drawPoly3D(ctx, cam, [[-1.6, 0.01, 2.0], [1.8, 0.01, 2.0], [1.8, 0.01, 13.2], [-1.6, 0.01, 13.2]], '#7F1D1D', '#F4B93B', 1.4);
  }

  drawPoly3D(ctx, cam, [[-6, 3.85, 0], [6, 3.85, 0], [6, 3.85, 14.8], [-6, 3.85, 14.8]], isFitting ? '#3B2314' : '#5C341D', '#2B180E', 1);
  for (var bz = 2.0; bz <= 13.6; bz += 2.6) {
    drawPoly3D(ctx, cam, [[-6, 3.74, bz - 0.14], [6, 3.74, bz - 0.14], [6, 3.74, bz + 0.14], [-6, 3.74, bz + 0.14]], '#3B2314', '#2B180E', 1);
  }

  var wLeft  = isFitting ? '#2F4A36' : (!isHall ? '#F1D27A' : '#E3B857');
  var wRight = isFitting ? '#28402F' : (!isHall ? '#E8C468' : '#D9AE4E');
  var wBack  = isFitting ? '#243A2A' : (!isHall ? '#E3BE5E' : '#D4A745');
  drawPoly3D(ctx, cam, [[-6, 0, 0], [-6, 0, 14.8], [-6, 3.85, 14.8], [-6, 3.85, 0]], wLeft, '#5C341D', 1);
  drawPoly3D(ctx, cam, [[6, 0, 14.8], [6, 0, 0], [6, 3.85, 0], [6, 3.85, 14.8]], wRight, '#5C341D', 1);
  drawPoly3D(ctx, cam, [[-6, 0, 14.8], [6, 0, 14.8], [6, 3.85, 14.8], [-6, 3.85, 14.8]], wBack, '#5C341D', 1);
  drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 3.85, 0], [-6, 3.85, 0]], wLeft, '#5C341D', 1);

  if (typeof drawAdidasRoomWalls3D === 'function') {
    drawAdidasRoomWalls3D(ctx, cam, room, st.pig, st.t);
  }

  var lanterns = isHall
    ? [[-2.4, 3.6, '#EF4444', '#FCA5A5'], [2.4, 3.6, '#F59E0B', '#FDE68A'], [-2.6, 7.8, '#FACC15', '#FEF08A'], [2.6, 7.8, '#DC2626', '#FCA5A5'], [0, 11.2, '#10B981', '#A7F3D0'], [0, 5.2, '#F59E0B', '#FDE68A']]
    : (isFitting
      ? [[-2.0, 5.4, '#F59E0B', '#FDE68A'], [2.0, 5.4, '#FACC15', '#FEF08A'], [0, 11.8, '#FFF3C4', '#FDE68A']]
      : [[-2.2, 4.2, '#EF4444', '#FCA5A5'], [2.2, 4.2, '#FACC15', '#FEF08A'], [-2.2, 8.6, '#F59E0B', '#FDE68A'], [2.2, 8.6, '#DC2626', '#FCA5A5'], [0.4, 12.2, '#F43F5E', '#FDA4AF']]);
  for (var li = 0; li < lanterns.length; li++) {
    drawLanternGlow3D(ctx, cam, lanterns[li][0], 2.95, lanterns[li][1], lanterns[li][2], lanterns[li][3], 0.22, 3.85);
  }

  var items = [];
  function pushItem(wx, wz, fn) {
    items.push({ d: Math.hypot(wx - cam.pos.x, wz - cam.pos.z), fn: fn });
  }

  if (isHall) {
    pushItem(-4.0, 11.0, function() { drawAdidasStaircase3D(ctx, cam, true); });
    pushItem(0, 6.2, function() {
      drawBox3D(ctx, cam, 0, 0, 6.2, 2.4, 0.84, 1.8, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
      drawBox3D(ctx, cam, 0, 0.84, 6.2, 2.52, 0.08, 1.92, { top: '#E3B857', front: '#C89B3C', side: '#A67C2E', stroke: '#2B180E' });
      drawSneakerSprite3D(ctx, cam, -0.72, 1.07, 6.2, '#FFFBF1', '#111827', '#B45309');
      drawSneakerSprite3D(ctx, cam,  0.00, 1.15, 6.2, '#1E293B', '#F97316', '#0F172A');
      drawSneakerSprite3D(ctx, cam,  0.72, 1.07, 6.2, '#DC2626', '#FFFBF1', '#F8FAFC');
    });
    pushItem(-5.2, 4.7, function() {
      drawBox3D(ctx, cam, -5.3, 0, 4.7, 1.1, 0.82, 5.6, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
    });
    pushItem(5.2, 4.65, function() {
      drawBox3D(ctx, cam, 5.3, 0, 4.65, 1.0, 0.72, 5.4, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
    });
    for (var si = 0; si < st.hallStaff.length; si++) {
      (function(emp) {
        pushItem(emp.x, emp.z, function() {
          drawHumanTps3D(ctx, cam, { x: emp.x, z: emp.z, yaw: emp.yaw, role: 'adidas_staff', shirt: '#111827', hair: '#1C1917' }, st.t);
        });
      })(st.hallStaff[si]);
    }
  } else if (isFitting) {
    pushItem(-2.35, 7.4, function() {
      drawBox3D(ctx, cam, -2.35, 0, 7.4, 1.55, 0.42, 0.92, { top: '#5C341D', front: '#4A2C1A', side: '#3B2314', stroke: '#2B180E' });
      drawBox3D(ctx, cam, -2.35, 0.42, 7.4, 1.45, 0.12, 0.82, { top: '#14532D', front: '#166534', side: '#052E16', stroke: '#F4B93B' });
      drawBox3D(ctx, cam, -1.25, 0, 7.75, 0.42, 0.22, 0.56, { top: '#1D4ED8', front: '#1E40AF', side: '#1E3A8A', stroke: '#2B180E' });
      drawSneakerSprite3D(ctx, cam, -1.25, 0.24, 7.75, '#FFFBF1', '#111827', '#B45309');
    });
    pushItem(-5.0, 6.4, function() {
      drawBox3D(ctx, cam, -5.1, 0, 6.4, 1.2, 0.58, 7.8, { top: '#6B4226', front: '#4A2C1A', side: '#3B2314', stroke: '#2B180E' });
    });
    pushItem(0, 14.2, function() {
      drawBox3D(ctx, cam, 0, 0, 14.3, 3.6, 0.20, 0.65, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#F4B93B' });
    });
  } else {
    pushItem(-4.0, 11.0, function() { drawAdidasStaircase3D(ctx, cam, false); });
    pushItem(-5.2, 4.7, function() {
      drawBox3D(ctx, cam, -5.3, 0, 4.7, 1.1, 0.84, 5.6, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
    });
    pushItem(0.2, 7.8, function() {
      drawBox3D(ctx, cam, 0.2, 0, 7.8, 1.35, 0.88, 1.05, { top: '#5C341D', front: '#4A2C1A', side: '#3B2314', stroke: '#F4B93B' });
      drawSneakerSprite3D(ctx, cam, 0.2, 1.04, 7.8, '#FFFBF1', '#111827', '#B45309');
    });
    pushItem(3.95, 6.8, function() {
      drawBox3D(ctx, cam, 3.95, 0, 6.8, 1.15, 1.04, 5.2, { top: '#8C5229', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
      drawBox3D(ctx, cam, 3.92, 1.04, 6.8, 1.32, 0.10, 5.4, { top: '#E3B857', front: '#C89B3C', side: '#A67C2E', stroke: '#2B180E' });
      drawSneakerSprite3D(ctx, cam, 3.85, 1.40, 7.6, '#FFFBF1', '#111827', '#B45309');
    });
    pushItem(st.upperCashier.x, st.upperCashier.z, function() {
      drawHumanTps3D(ctx, cam, { x: st.upperCashier.x, z: st.upperCashier.z, yaw: st.upperCashier.yaw, role: 'adidas_staff', shirt: '#111827', hair: '#1C1917' }, st.t);
    });
  }

  pushItem(st.pig.x, st.pig.z, function() {
    drawPigTps3D(ctx, cam, st.pig, st.t);
  });

  items.sort(function(a, b) { return b.d - a.d; });
  for (var ii = 0; ii < items.length; ii++) items[ii].fn();

  ctx.save();
  ctx.fillStyle = isFitting ? 'rgba(255, 214, 130, 0.08)' : 'rgba(255, 220, 140, 0.07)';
  ctx.fillRect(0, 0, W, H);
  if (st.exitFade > 0.01) {
    ctx.fillStyle = 'rgba(246, 238, 220, ' + st.exitFade.toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
`;
}
