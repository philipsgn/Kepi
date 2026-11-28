/**
 * Adidas Mall Flagship 1 Tầng Siêu Rộng WebGL 3D (24m × 24m, 16 Gian Hàng, Sút Bóng 3D & 12 NPCs — Quyết định 255)
 * - Không gian 1 mặt sàn duy nhất Y = 0 chuẩn Adidas Mall Flagship (không cầu thang 2 tầng):
 *   1. 'hall' (Đại Sảnh Chính): X ∈ [-10.0, 6.0], Z ∈ [0, 14.0]
 *      - Gian 1 Sneaker Wall LED 12 ô, Gian 2 Đảo Ultraboost, Gian 3 Đảo Predator,
 *      - Gian 4 Quầy Áo Polo Cổ Bẻ 3 Sọc, Gian 5 Đảo Quần Jogger & Track Pants,
 *      - Gian 6 Quầy Áo Khoác & Hoodie, Gian 7 Quầy Dép Adilette Slides, Gian 8 Cụm 3 Mannequin Pods.
 *   2. 'apparel_sports' (Khu Thể Thao & Sáng Tạo): X ∈ [-10.0, 6.0], Z ∈ [14.0, 24.0]
 *      - Gian 9 Quầy Áo Đấu Bóng Đá, Gian 10 Quầy Gym/Running/Pickleball,
 *      - Gian 11 Maker Lab Custom Studio, Gian 12 Quầy Balo/Túi/Nón/Vớ Trefoil.
 *   3. 'fitting_pos' (Phòng Thay Đồ & Thu Ngân POS): X ∈ [6.0, 14.0], Z ∈ [0, 14.0]
 *      - Gian 13 Phòng Thay Đồ Gương 360° + Rèm + Ghế Băng Thử Giày, Gian 14 Quầy Thu Ngân POS Đôi + Phụ Kiện.
 *   4. 'kick_zone' (Sân Turf Sút Bóng 3D): X ∈ [6.0, 14.0], Z ∈ [14.0, 24.0]
 *      - Gian 15 Sân Cỏ & Khung Thành 3D Mini-Game Sút Bóng, Gian 16 Kệ Bóng World Cup & Ghế Cổ Động Viên.
 * - Vá triệt để lỗi di chuyển: routeAroundAdidasObstacles (né AABB 16 gian hàng) & pickAdidasTarget3D (chặn xuyên tường X=6/Z=14).
 */
export function buildAdidasTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. ĐỒ THỊ KHÔNG GIAN MEGA MALL 1 TẦNG 24×24M (QĐ 255) ==================== */
var ADIDAS_NAV_GRAPH = {
  outerBounds: { minX: -10.0, maxX: 14.0, minZ: 0.0, maxZ: 24.0, minY: 0.45, maxY: 4.65 },
  wallMargin: 0.38,
  zones: [
    { id: 'hall',           minX: -9.65, maxX: 5.95,  minZ: 0.35,  maxZ: 13.95, floorY: 0 },
    { id: 'apparel_sports', minX: -9.65, maxX: 5.95,  minZ: 13.95, maxZ: 23.65, floorY: 0 },
    { id: 'fitting_pos',    minX: 6.00,  maxX: 13.65, minZ: 0.35,  maxZ: 13.95, floorY: 0 },
    { id: 'kick_zone',      minX: 6.00,  maxX: 13.65, minZ: 13.95, maxZ: 23.65, floorY: 0 }
  ],
  ramps: [],
  dividerWalls: [
    // Vách ngăn X = 6.0 chia đôi Đông-Tây, mở 3 vòm rộng: POS [1.8..4.8], Phòng Thay Đồ [8.0..11.4], Sân Bóng [16.5..20.5]
    {
      axis: 'x', pos: 6.0, minSpan: 0.0, maxSpan: 24.0, minY: 0.0, maxY: 4.65,
      openings: [
        { a1: 1.8,  a2: 4.8,  y1: 0.0, y2: 3.3 },
        { a1: 8.0,  a2: 11.4, y1: 0.0, y2: 3.3 },
        { a1: 16.5, a2: 20.5, y1: 0.0, y2: 3.5 }
      ]
    },
    // Vách ngăn Z = 14.0 bên cánh Đông (giữa Phòng Thay Đồ và Sân Bóng), mở cửa rộng X ∈ [8.2..11.8]
    {
      axis: 'z', pos: 14.0, minSpan: 6.0, maxSpan: 14.0, minY: 0.0, maxY: 4.65,
      openings: [
        { a1: 8.2, a2: 11.8, y1: 0.0, y2: 3.4 }
      ]
    }
  ],
  edges: [
    {
      from: 'hall',
      to: 'fitting_pos',
      waypointsForward: [{ x: 5.05, y: 0, z: 9.7 }, { x: 6.95, y: 0, z: 9.7 }],
      waypointsBackward: [{ x: 6.95, y: 0, z: 9.7 }, { x: 5.05, y: 0, z: 9.7 }]
    },
    {
      from: 'hall',
      to: 'apparel_sports',
      waypointsForward: [{ x: -1.8, y: 0, z: 13.8 }],
      waypointsBackward: [{ x: -1.8, y: 0, z: 13.8 }]
    },
    {
      from: 'apparel_sports',
      to: 'kick_zone',
      waypointsForward: [{ x: 5.05, y: 0, z: 18.5 }, { x: 6.95, y: 0, z: 18.5 }],
      waypointsBackward: [{ x: 6.95, y: 0, z: 18.5 }, { x: 5.05, y: 0, z: 18.5 }]
    },
    {
      from: 'fitting_pos',
      to: 'kick_zone',
      waypointsForward: [{ x: 10.0, y: 0, z: 13.1 }, { x: 10.0, y: 0, z: 14.9 }],
      waypointsBackward: [{ x: 10.0, y: 0, z: 14.9 }, { x: 10.0, y: 0, z: 13.1 }]
    }
  ]
};

function getAdidasSurfaceY(_x, _z, _curY) {
  return 0;
}

function getAdidasObstacles() {
  return [
    // Gian 1: Sneaker Wall LED trái (Tường Tây hall)
    { id: 'sneaker_wall', x1: -9.95, z1: 1.80,  x2: -8.65, z2: 12.20 },
    // Gian 2: Đảo Running Ultraboost
    { id: 'ultra_island', x1: -6.20, z1: 4.60,  x2: -4.00, z2: 6.40  },
    // Gian 3: Đảo Predator Trung Tâm
    { id: 'pred_island',  x1: -1.40, z1: 5.20,  x2: 1.40,  z2: 7.40  },
    // Gian 4: Đảo Áo Polo Cổ Bẻ 3 Sọc + Kệ Polo tường phải giữa 2 vòm
    { id: 'polo_island',  x1: 2.20,  z1: 5.40,  x2: 4.00,  z2: 7.50  },
    { id: 'polo_wall',    x1: 4.75,  z1: 5.40,  x2: 5.95,  z2: 7.40  },
    // Gian 5: Đảo Quần Jogger & Track Pants
    { id: 'jogger_rack',  x1: -6.40, z1: 9.60,  x2: -4.00, z2: 11.60 },
    // Gian 6: Giá Áo Khoác Firebird & Hoodie
    { id: 'jacket_rack',  x1: 4.65,  z1: 11.80, x2: 5.95,  z2: 13.70 },
    // Gian 7: Kệ Dép Adilette Slides
    { id: 'slides_rack',  x1: -5.80, z1: 1.60,  x2: -3.60, z2: 3.00  },
    // Gian 8: 3 Bục Mannequin Styling Pods
    { id: 'man_polo',     x1: 1.35,  z1: 9.35,  x2: 2.25,  z2: 10.25 },
    { id: 'man_track',    x1: -2.45, z1: 9.35,  x2: -1.55, z2: 10.25 },
    { id: 'man_kit',      x1: 3.15,  z1: 14.75, x2: 4.05,  z2: 15.65 },
    // Gian 9: Quầy Áo Đấu Bóng Đá (apparel_sports Tây)
    { id: 'football_wall',x1: -9.95, z1: 15.00, x2: -8.65, z2: 21.20 },
    // Gian 10: Đảo Gym / Running / Pickleball
    { id: 'gym_island',   x1: -6.40, z1: 16.00, x2: -3.80, z2: 18.20 },
    // Gian 11: Maker Lab Custom Studio
    { id: 'maker_lab',    x1: 1.70,  z1: 18.60, x2: 4.30,  z2: 20.80 },
    // Gian 12: Tường Balo / Nón / Túi / Vớ Trefoil (Z = 22.6..23.95)
    { id: 'acc_wall',     x1: -6.20, z1: 22.65, x2: 2.20,  z2: 23.95 },
    // Gian 13: Phòng Thay Đồ VIP (Gương + Giá đồ + Ghế Băng gọn góc Tây để thông thoáng cửa X=8.2..11.8 sang Sân Bóng)
    { id: 'fit_rack',     x1: 7.80,  z1: 6.75,  x2: 12.20, z2: 7.65  },
    { id: 'fit_mirror',   x1: 13.15, z1: 7.95,  x2: 13.95, z2: 11.65 },
    { id: 'fit_bench',    x1: 6.65,  z1: 11.95, x2: 7.95,  z2: 12.95 },
    // Gian 14: Quầy Thu Ngân POS Đôi & Kệ Phụ Kiện Checkout
    { id: 'pos_desk',     x1: 10.20, z1: 1.40,  x2: 11.65, z2: 5.40  },
    { id: 'pos_shelf',    x1: 12.80, z1: 1.20,  x2: 13.95, z2: 5.80  },
    { id: 'pos_acc',      x1: 7.50,  z1: 0.90,  x2: 9.00,  z2: 1.95  },
    // Gian 15 & 16: Khung Thành Gôn 3D & Kệ Bóng World Cup / Ghế CĐV
    { id: 'goal_frame',   x1: 7.95,  z1: 22.20, x2: 12.05, z2: 23.75 },
    { id: 'ball_shelf',   x1: 12.60, z1: 15.20, x2: 13.95, z2: 21.20 }
  ];
}

function createAdidasNpcs() {
  var routes = [
    // 1. Nhân viên tư vấn Giày Sneaker Wall
    {
      id: 'staff_sneaker', role: 'adidas_staff', shirt: '#111827', hair: '#1C1917', carryProp: 'shoebox',
      state: 'WALK', timer: 1.2, stepIdx: 0,
      pts: [
        { x: -7.5, y: 0, z: 3.4, yaw: -Math.PI * 0.5 },
        { x: -7.5, y: 0, z: 9.8, yaw: -Math.PI * 0.5 },
        { x: -2.4, y: 0, z: 6.2, yaw: Math.PI * 0.5 },
        { x: -7.5, y: 0, z: 6.4, yaw: -Math.PI * 0.5 }
      ]
    },
    // 2. Nhân viên Quầy Polo & Jogger
    {
      id: 'staff_apparel', role: 'adidas_staff', shirt: '#111827', hair: '#292524', carryProp: 'none',
      state: 'WALK', timer: 0, stepIdx: 0,
      pts: [
        { x: 1.6, y: 0, z: 6.4, yaw: Math.PI * 0.5 },
        { x: -3.2, y: 0, z: 10.6, yaw: -Math.PI * 0.5 },
        { x: 1.8, y: 0, z: 12.4, yaw: Math.PI * 0.5 },
        { x: 4.8, y: 0, z: 9.6, yaw: Math.PI * 0.5 }
      ]
    },
    // 3. Nhân viên Maker Lab Custom Studio
    {
      id: 'staff_maker', role: 'adidas_staff', shirt: '#111827', hair: '#0F172A', carryProp: 'none',
      state: 'SIT', timer: 3.0, stepIdx: 0,
      pts: [
        { x: 1.2, y: 0, z: 19.6, yaw: Math.PI * 0.5 },
        { x: 3.0, y: 0, z: 21.6, yaw: Math.PI }
      ]
    },
    // 4-5. Hai Thu Ngân Quầy POS Đôi
    {
      id: 'staff_cashier_1', role: 'adidas_staff', shirt: '#111827', hair: '#1C1917', carryProp: 'shoebox',
      state: 'SIT', timer: 999, stepIdx: 0,
      pts: [{ x: 12.15, y: 0, z: 2.5, sit: false, yaw: -Math.PI * 0.5 }]
    },
    {
      id: 'staff_cashier_2', role: 'adidas_staff', shirt: '#111827', hair: '#451A03', carryProp: 'none',
      state: 'SIT', timer: 999, stepIdx: 0,
      pts: [{ x: 12.15, y: 0, z: 4.3, sit: false, yaw: -Math.PI * 0.5 }]
    },
    // 6. Thủ môn đứng gác gôn tại Football Kick Zone (Z = 22.0)
    {
      id: 'kick_goalkeeper', role: 'gk', shirt: '#16A34A', hair: '#111827', carryProp: 'none',
      state: 'SIT', timer: 999, stepIdx: 0,
      pts: [{ x: 10.0, y: 0, z: 22.0, sit: false, yaw: Math.PI }]
    },
    // 7-12. 6 Khách hàng vào mua sắm khắp 16 gian hàng
    {
      id: 'cust_sneaker', role: 'customer', shirt: '#DC2626', hair: '#1E1B18', carryProp: 'none',
      state: 'WALK', timer: 0, stepIdx: 0,
      pts: [
        { x: -7.8, y: 0, z: 4.2 }, { x: -7.8, y: 0, z: 10.8 },
        { x: -4.8, y: 0, z: 2.6 }, { x: -1.8, y: 0, z: 4.4 }
      ]
    },
    {
      id: 'cust_polo', role: 'customer', shirt: '#2563EB', hair: '#451A03', carryProp: 'none',
      state: 'WALK', timer: 0, stepIdx: 1,
      pts: [
        { x: 1.5, y: 0, z: 4.8 }, { x: 4.3, y: 0, z: 6.4 },
        { x: 5.2, y: 0, z: 9.7 }, { x: 8.6, y: 0, z: 9.7 }, { x: 5.2, y: 0, z: 9.7 }
      ]
    },
    {
      id: 'cust_jogger', role: 'customer', shirt: '#0F766E', hair: '#292524', carryProp: 'none',
      state: 'WALK', timer: 0, stepIdx: 0,
      pts: [
        { x: -3.2, y: 0, z: 9.0 }, { x: -7.2, y: 0, z: 11.4 },
        { x: -7.8, y: 0, z: 17.5 }, { x: -3.0, y: 0, z: 19.4 }
      ]
    },
    {
      id: 'cust_fitting', role: 'customer', shirt: '#F59E0B', hair: '#111827', carryProp: 'shoebox',
      state: 'WALK', timer: 0, stepIdx: 0,
      pts: [
        { x: 11.8, y: 0, z: 9.8 }, { x: 8.4, y: 0, z: 10.2 },
        { x: 8.8, y: 0, z: 3.4 }, { x: 9.6, y: 0, z: 4.8 }, { x: 8.6, y: 0, z: 9.4 }
      ]
    },
    {
      id: 'cust_sports', role: 'customer', shirt: '#7C3AED', hair: '#1C1917', carryProp: 'none',
      state: 'WALK', timer: 0, stepIdx: 1,
      pts: [
        { x: -7.6, y: 0, z: 19.6 }, { x: -2.4, y: 0, z: 21.8 },
        { x: 2.8, y: 0, z: 21.6 },  { x: 5.0, y: 0, z: 18.6 }
      ]
    },
    {
      id: 'cust_fan', role: 'customer', shirt: '#E11D48', hair: '#451A03', carryProp: 'ball',
      state: 'WALK', timer: 0, stepIdx: 0,
      pts: [
        { x: 7.4, y: 0, z: 16.5 }, { x: 11.6, y: 0, z: 16.0 },
        { x: 11.8, y: 0, z: 19.8 }, { x: 7.4, y: 0, z: 19.8 }
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
      phase: i * 0.72,
      moving: r.state === 'WALK',
      seated: false
    });
  }
  return out;
}

function createAdidasTpsState() {
  var npcs = createAdidasNpcs();
  var hallStaff = [npcs[0], npcs[1], npcs[2]];
  var upperCashier = npcs[3];
  var particles = [];
  for (var i = 0; i < 24; i++) {
    particles.push({
      x: -8.5 + ((i * 37) % 210) * 0.10,
      y: 1.0 + ((i * 23) % 30) * 0.10,
      z: 1.2 + ((i * 19) % 215) * 0.10,
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
      pendingAction: null,
      customBadge: ''
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
    kickGame: {
      active: false,
      aimAngle: 0,
      aimDir: 1,
      goals: 0,
      attempts: 0,
      streak: 0,
      netRipple: 0,
      justEnteredAt: 0,
      sparks: [],
      ball: {
        x: 10.0, y: 0.22, z: 18.6,
        vx: 0, vy: 0, vz: 0,
        shooting: false,
        shootT: 0,
        goalieX: 10.0,
        goalieTargetX: 10.0,
        resultText: ''
      }
    },
    actionFlashUntil: 0,
    actionFlashText: '',
    t: 0
  };
}

function adidasSegIntersectsBox(ax, az, bx, bz, box, pad) {
  var minX = box.x1 - pad, maxX = box.x2 + pad;
  var minZ = box.z1 - pad, maxZ = box.z2 + pad;
  var t0 = 0, t1 = 1, dx = bx - ax, dz = bz - az;
  var p = [-dx, dx, -dz, dz];
  var q = [ax - minX, maxX - ax, az - minZ, maxZ - az];
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

function clampAdidasWalkPos(_st, x, z, _floorY) {
  var nx = Math.max(-9.65, Math.min(13.65, x));
  var nz = Math.max(0.45, Math.min(23.55, z));

  // Kẹp theo 2 vách ngăn X = 6.0 (mở 3 vòm) và Z = 14.0 [6..14] (mở cửa X ∈ [8.2..11.8])
  if (nx > 5.65 && nx < 6.35) {
    var inArch1 = (nz >= 1.95 && nz <= 4.65);
    var inArch2 = (nz >= 8.15 && nz <= 11.25);
    var inArch3 = (nz >= 16.65 && nz <= 20.35);
    if (!inArch1 && !inArch2 && !inArch3) {
      nx = (x < 6.0) ? 5.65 : 6.35;
    }
  }
  if (nx >= 6.0 && nz > 13.65 && nz < 14.35) {
    if (nx < 8.35 || nx > 11.65) {
      nz = (z < 14.0) ? 13.65 : 14.35;
    }
  }

  var boxes = getAdidasObstacles();
  var pad = 0.34;
  for (var i = 0; i < boxes.length; i++) {
    var b = boxes[i];
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
  return { x: Math.max(-9.65, Math.min(13.65, nx)), z: Math.max(0.45, Math.min(23.55, nz)) };
}

function routeAroundAdidasObstacles(startPt, endPt) {
  var obs = getAdidasObstacles();
  var out = [];
  var cur = { x: startPt.x, z: startPt.z, y: 0 };
  var pad = 0.30;
  for (var iter = 0; iter < 4; iter++) {
    var hitBox = null;
    for (var i = 0; i < obs.length; i++) {
      if (adidasSegIntersectsBox(cur.x, cur.z, endPt.x, endPt.z, obs[i], pad)) {
        hitBox = obs[i];
        break;
      }
    }
    if (!hitBox) break;
    var cands = [
      { x: hitBox.x1 - 0.44, z: hitBox.z1 - 0.44, y: 0 },
      { x: hitBox.x2 + 0.44, z: hitBox.z1 - 0.44, y: 0 },
      { x: hitBox.x1 - 0.44, z: hitBox.z2 + 0.44, y: 0 },
      { x: hitBox.x2 + 0.44, z: hitBox.z2 + 0.44, y: 0 }
    ];
    var best = null, bestScore = 99999;
    for (var ci = 0; ci < cands.length; ci++) {
      var cp = cands[ci];
      if (cp.x < -9.55 || cp.x > 13.55 || cp.z < 0.50 || cp.z > 23.45) continue;
      // Không chọn lại đúng góc đang đứng & không vượt ngang qua vách tường đóng X=6.0 hoặc Z=14.0
      if (Math.hypot(cp.x - cur.x, cp.z - cur.z) < 0.25) continue;
      if ((cur.x < 6.0 && cp.x > 6.0) || (cur.x > 6.0 && cp.x < 6.0)) continue;
      if (cur.x >= 6.0 && ((cur.z < 14.0 && cp.z > 14.0) || (cur.z > 14.0 && cp.z < 14.0))) continue;
      var blockedFirst = false;
      for (var j = 0; j < obs.length; j++) {
        if (adidasSegIntersectsBox(cur.x, cur.z, cp.x, cp.z, obs[j], 0.20)) {
          blockedFirst = true;
          break;
        }
      }
      if (blockedFirst) continue;
      var stillHits = adidasSegIntersectsBox(cp.x, cp.z, endPt.x, endPt.z, hitBox, pad) ? 40 : 0;
      var score = stillHits + Math.hypot(cp.x - cur.x, cp.z - cur.z) + Math.hypot(endPt.x - cp.x, endPt.z - cp.z);
      if (score < bestScore) { bestScore = score; best = cp; }
    }
    if (!best) break;
    out.push(best);
    cur = best;
  }
  out.push({ x: endPt.x, z: endPt.z, y: 0 });
  return out;
}

function planAdidasRealtimePath(st, tx, _targetFloorY, tz, pendingAction) {
  var p = st.pig;
  p.seated = false;
  p.eating = false;
  p.pendingAction = pendingAction || null;

  var cl = clampAdidasWalkPos(st, tx, tz, 0);
  tx = cl.x; tz = cl.z;

  if (typeof planNavGraphRealtimePath === 'function') {
    planNavGraphRealtimePath(ADIDAS_NAV_GRAPH, st, tx, 0, tz, { pendingAction: pendingAction });
    // Chèn điểm né vật cản AABB nội khu cho từng đoạn trong đồ thị (0% kẹt quầy/đảo)
    if (p.waypoints && p.waypoints.length > 0) {
      var routed = [];
      var prev = { x: p.x, z: p.z, y: 0 };
      for (var wi = 0; wi < p.waypoints.length; wi++) {
        var wp = p.waypoints[wi];
        var sameSide = !((prev.x < 6.0 && wp.x > 6.0) || (prev.x > 6.0 && wp.x < 6.0)) &&
                       !(prev.x >= 6.0 && ((prev.z < 14.0 && wp.z > 14.0) || (prev.z > 14.0 && wp.z < 14.0)));
        if (sameSide) {
          var segs = routeAroundAdidasObstacles(prev, wp);
          for (var si = 0; si < segs.length; si++) routed.push(segs[si]);
        } else {
          routed.push({ x: wp.x, z: wp.z, y: 0 });
        }
        prev = routed[routed.length - 1];
      }
      routed[routed.length - 1].x = tx;
      routed[routed.length - 1].z = tz;
      p.waypoints = routed;
      p.targetX = routed[0].x; p.targetZ = routed[0].z;
      p.walking = true;
    }
    return;
  }

  var segFallback = routeAroundAdidasObstacles({ x: p.x, z: p.z, y: 0 }, { x: tx, z: tz, y: 0 });
  p.waypoints = segFallback;
  p.targetX = segFallback[0].x; p.targetZ = segFallback[0].z;
  p.walking = true;
}

function triggerAdidasGoalKick(st, aimOffset) {
  if (!st || !st.kickGame) return false;
  var kg = st.kickGame;
  var b = kg.ball;
  if (b.shooting) return false;
  kg.active = true;
  var ang = (typeof aimOffset === 'number' && isFinite(aimOffset))
    ? Math.max(-0.46, Math.min(0.46, aimOffset))
    : kg.aimAngle;
  b.x = 10.0; b.y = 0.22; b.z = 18.6;
  b.vx = Math.sin(ang) * 7.8;
  b.vy = 2.45;
  b.vz = 9.2;
  b.shooting = true;
  b.shootT = 0;
  b.resultText = '';
  // Thủ môn bay ngẫu nhiên nhẹ theo phán đoán
  b.goalieTargetX = 10.0 + ((Math.sin(st.t * 4.3) > 0 ? 1 : -1) * 1.15);
  st.pig.yaw = ang * 0.7;
  kg.attempts += 1;
  return true;
}

function stepAdidasNpcs(st, dt) {
  if (!st.npcs) return;
  for (var i = 0; i < st.npcs.length; i++) {
    var n = st.npcs[i];
    if (n.id === 'kick_goalkeeper') {
      var kg = st.kickGame;
      var targetGx = (kg && kg.ball && kg.ball.shooting)
        ? kg.ball.goalieTargetX
        : (10.0 + Math.sin(st.t * 2.1) * 1.25);
      var gkSpd = (kg && kg.ball && kg.ball.shooting) ? 4.4 : 1.7;
      n.x += (targetGx - n.x) * Math.min(1, dt * gkSpd);
      n.moving = Math.abs(targetGx - n.x) > 0.08;
      n.yaw = Math.PI;
      if (kg && kg.ball) kg.ball.goalieX = n.x;
      continue;
    }
    if (n.state === 'SIT') {
      n.moving = false;
      n.timer -= dt;
      if (n.timer <= 0 && n.pts.length > 1) {
        n.state = 'WALK';
        n.stepIdx = (n.stepIdx + 1) % n.pts.length;
      }
      continue;
    }
    var tgt = n.pts[(n.stepIdx + 1) % n.pts.length];
    var dx = tgt.x - n.x, dz = tgt.z - n.z;
    var d = Math.hypot(dx, dz);
    if (d < 0.12) {
      n.x = tgt.x; n.z = tgt.z;
      n.stepIdx = (n.stepIdx + 1) % n.pts.length;
      n.state = 'SIT';
      n.moving = false;
      n.timer = n.pts.length === 1 ? 999 : (1.8 + (i % 4) * 0.7);
      if (typeof tgt.yaw === 'number') n.yaw = tgt.yaw;
    } else {
      n.moving = true;
      var spd = Math.min(d, 1.55 * dt);
      n.x += (dx / d) * spd;
      n.z += (dz / d) * spd;
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
        if (p.pendingAction === 'try_jacket') {
          p.outfit = (p.outfit === 'adidas_jacket') ? 'none' : 'adidas_jacket';
          p.wearingJacket = (p.outfit === 'adidas_jacket');
          p.yaw = Math.PI * 0.5;
          st.actionFlashText = p.wearingJacket ? '🧥 ÁO KHOÁC FIREBIRD 3 SỌC' : '👕 ĐÃ THAY ĐỒ MẶC ĐỊNH';
          st.actionFlashUntil = st.t + 2.8;
        } else if (p.pendingAction === 'try_polo') {
          p.outfit = (p.outfit === 'adidas_polo') ? 'none' : 'adidas_polo';
          p.wearingJacket = false;
          p.yaw = Math.PI * 0.5;
          st.actionFlashText = p.outfit === 'adidas_polo' ? '👔 ÁO POLO CỔ BẺ 3 SỌC NAVY' : '👕 ĐÃ CỞI ÁO POLO';
          st.actionFlashUntil = st.t + 2.8;
        } else if (p.pendingAction === 'try_jogger') {
          p.outfit = (p.outfit === 'adidas_jogger') ? 'none' : 'adidas_jogger';
          p.wearingJacket = false;
          p.yaw = -Math.PI * 0.5;
          st.actionFlashText = p.outfit === 'adidas_jogger' ? '👖 QUẦN JOGGER NỈ + GIÀY SAMBA' : '👕 ĐÃ ĐỔI TRANG PHỤC';
          st.actionFlashUntil = st.t + 2.8;
        } else if (p.pendingAction === 'try_kit') {
          p.outfit = (p.outfit === 'adidas_kit') ? 'none' : 'adidas_kit';
          p.wearingJacket = false;
          p.yaw = -Math.PI * 0.5;
          st.actionFlashText = p.outfit === 'adidas_kit' ? '⚽ ÁO ĐẤU #10 + TẤT DÀI 3 SỌC' : '👕 ĐÃ ĐỔI TRANG PHỤC';
          st.actionFlashUntil = st.t + 2.8;
        } else if (p.pendingAction === 'buy_bag') {
          p.boughtSamba = true;
          p.yaw = Math.PI * 0.5;
          st.actionFlashText = '🛍️ CHECKOUT POS · NHẬN TÚI 3 SỌC!';
          st.actionFlashUntil = st.t + 3.2;
        } else if (p.pendingAction === 'maker_custom') {
          p.customBadge = 'VIP-10';
          p.outfit = 'adidas_kit';
          st.actionFlashText = '🎨 MAKER LAB · ÉP NHIỆT SỐ 10!';
          st.actionFlashUntil = st.t + 3.0;
        } else if (p.pendingAction === 'inspect_shoes') {
          p.yaw = -Math.PI * 0.5;
          st.actionFlashText = '👟 SAMBA OG · ADILETTE SLIDES · ULTRABOOST';
          st.actionFlashUntil = st.t + 2.8;
        } else if (p.pendingAction === 'kick_spot') {
          if (st.kickGame) {
            st.kickGame.active = true;
            st.kickGame.justEnteredAt = st.t;
          }
          p.yaw = 0;
          st.actionFlashText = '⚽ CHẠM GÓC GÔN HOẶC BẤM NÚT ĐỂ SÚT!';
          st.actionFlashUntil = st.t + 3.0;
        } else if (p.pendingAction === 'exit_adidas') {
          st.exiting = true;
        }
        p.pendingAction = null;
      }
    } else {
      var spd = Math.min(dist, 3.6 * dt);
      var nx = p.x + (dx / dist) * spd;
      var nz = p.z + (dz / dist) * spd;
      var next = clampAdidasWalkPos(st, nx, nz, 0);
      p.x = next.x; p.z = next.z;
      var tyaw = Math.atan2(dx, dz);
      p.yaw = (typeof tpsLerpAngle === 'function') ? tpsLerpAngle(p.yaw || 0, tyaw, Math.min(1, dt * 12)) : tyaw;
    }
    p.y = 0;
    st.floor = 1;
    st.room = p.x >= 6.0 ? (p.z >= 14.0 ? 'kick_zone' : 'fitting') : (p.z >= 14.0 ? 'apparel_sports' : 'hall');
  }

  // Cập nhật Mini-Game Sút Bóng 3D khi ở vùng sân cỏ
  if (st.kickGame) {
    var kg = st.kickGame;
    var inSpot = (p.x >= 7.2 && p.x <= 12.8 && p.z >= 15.6 && p.z <= 21.8);
    if (!inSpot && !kg.ball.shooting) kg.active = false;
    else if (Math.hypot(p.x - 10.0, p.z - 17.8) < 1.35 && !p.walking) {
      if (!kg.active) { kg.active = true; kg.justEnteredAt = st.t; }
    }

    if (kg.active && !kg.ball.shooting) {
      kg.aimAngle += kg.aimDir * dt * 0.92;
      if (kg.aimAngle > 0.44) { kg.aimAngle = 0.44; kg.aimDir = -1; }
      if (kg.aimAngle < -0.44) { kg.aimAngle = -0.44; kg.aimDir = 1; }
    }

    var kb = kg.ball;
    if (kb.shooting) {
      kb.shootT += dt;
      kb.x += kb.vx * dt;
      kb.y = Math.max(0.22, kb.y + kb.vy * dt);
      kb.vy -= 5.8 * dt;
      kb.z += kb.vz * dt;
      // Kiểm tra chạm vạch vôi khung thành Z = 22.4
      if (kb.z >= 22.15) {
        var blocked = Math.abs(kb.x - kb.goalieX) < 0.62 && kb.y < 1.55;
        var inFrame = (kb.x >= 8.2 && kb.x <= 11.8 && kb.y <= 1.85);
        if (blocked) {
          kb.shooting = false;
          kg.streak = 0;
          kb.resultText = '🧤 THỦ MÔN CẢN PHÁ!';
          st.actionFlashText = '🧤 SUÝT VÀO! CHỈNH GÓC KHÁC SÚT LẠI!';
          st.actionFlashUntil = st.t + 2.4;
        } else if (inFrame) {
          kb.shooting = false;
          kg.goals += 1;
          kg.streak += 1;
          kg.netRipple = 1.0;
          kb.resultText = '⚽ VÀOOO! (' + kg.goals + ' BÀN)';
          st.actionFlashText = '⚽ VÀOOO! CHUỖI ' + kg.streak + ' BÀN THẮNG!';
          st.actionFlashUntil = st.t + 3.0;
          for (var sp = 0; sp < 14; sp++) {
            kg.sparks.push({
              x: kb.x, y: Math.max(0.5, kb.y), z: 22.4,
              vx: (Math.sin(sp * 1.9) * 2.4),
              vy: 1.8 + (sp % 4) * 0.65,
              vz: -0.9 + Math.cos(sp * 1.3) * 0.9,
              t: 0
            });
          }
        } else if (kb.z >= 23.4 || kb.shootT > 1.4) {
          kb.shooting = false;
          kg.streak = 0;
          kb.resultText = 'BÓNG CHỆCH CỘT DỌC!';
          st.actionFlashText = '😬 CHỆCH KHUNG THÀNH! CANH LẠI GÓC SÚT!';
          st.actionFlashUntil = st.t + 2.2;
        }
        if (!kb.shooting) {
          kb.x = 10.0; kb.y = 0.22; kb.z = 18.6;
        }
      }
    }
    if (kg.netRipple > 0) kg.netRipple = Math.max(0, kg.netRipple - dt * 1.4);
    for (var ksi = kg.sparks.length - 1; ksi >= 0; ksi--) {
      var ksp = kg.sparks[ksi];
      ksp.t += dt; ksp.x += ksp.vx * dt; ksp.y += ksp.vy * dt; ksp.z += ksp.vz * dt;
      ksp.vy -= 4.5 * dt;
      if (ksp.t > 1.1) kg.sparks.splice(ksi, 1);
    }
  }

  p.wearingJacket = (p.outfit === 'adidas_jacket');
  var targetDoor = (p.x < 6.0 && st.exiting) ? 0.92 : 0.0;
  st.rightDoorOpen += (targetDoor - st.rightDoorOpen) * Math.min(1, dt * 6.0);
  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.5);

  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== 2. CAMERA SPRING-ARM & RAYCAST 3D CHỐNG XUYÊN TƯỜNG ==================== */
function computeAdidasWebglCamera(cam, st) {
  var p = st.pig;
  var navCfg = {
    wallMargin: 0.38,
    zones: ADIDAS_NAV_GRAPH.zones,
    dividerWalls: ADIDAS_NAV_GRAPH.dividerWalls,
    outerBounds: ADIDAS_NAV_GRAPH.outerBounds
  };
  if (typeof computeWebglTpsCamera === 'function') {
    computeWebglTpsCamera(cam, p, navCfg, st._lastDt || 0.016);
  }
}

function adidasRaySphereDist(ox, oy, oz, dx, dy, dz, cx, cy, cz, rad) {
  var ocx = cx - ox, ocy = cy - oy, ocz = cz - oz;
  var proj = ocx * dx + ocy * dy + ocz * dz;
  if (proj < 0.25 || proj > 28) return -1;
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

  // Chặn tuyệt đối tia đi xuyên vách ngăn X=6.0 hoặc Z=14.0 [6..14] & tường bao ngoài
  var maxVisibleT = 32;
  if (typeof raySplitDividerWall === 'function') {
    for (var wi = 0; wi < ADIDAS_NAV_GRAPH.dividerWalls.length; wi++) {
      var wt = raySplitDividerWall(ox, oy, oz, dx, dy, dz, ADIDAS_NAV_GRAPH.dividerWalls[wi]);
      if (wt > 0) maxVisibleT = Math.min(maxVisibleT, wt + 0.36);
    }
  }
  if (dx < -0.001) { var tLx = (-10.0 - ox) / dx; if (tLx > 0.1) maxVisibleT = Math.min(maxVisibleT, tLx); }
  if (dx >  0.001) { var tRx = (14.0 - ox) / dx;  if (tRx > 0.1) maxVisibleT = Math.min(maxVisibleT, tRx); }
  if (dz >  0.001) { var tBz = (24.0 - oz) / dz;  if (tBz > 0.1) maxVisibleT = Math.min(maxVisibleT, tBz); }

  // 1. Khi đang đứng ở chấm phạt Football Kick Zone và chạm thẳng vào Gôn 3D -> sút về đúng góc chạm!
  if (st.kickGame && st.kickGame.active && !st.kickGame.ball.shooting && dz > 0.05) {
    var tGoal = (22.3 - oz) / dz;
    if (tGoal > 0.4 && tGoal <= maxVisibleT + 0.2) {
      var gx = ox + dx * tGoal, gy = oy + dy * tGoal;
      if (gx >= 7.8 && gx <= 12.2 && gy >= 0.0 && gy <= 2.35) {
        return { kind: 'goal_shoot', aimOffset: (gx - 10.0) * 0.22 };
      }
    }
  }

  // 2. Cửa mặt tiền Z = 0 -> bước ra Đại lộ Sài Gòn
  if (dz < -0.02) {
    var td = (0.20 - oz) / dz;
    if (td > 0.3 && td <= maxVisibleT + 0.2) {
      var ddx = ox + dx * td, ddy = oy + dy * td;
      if (ddy >= 0 && ddy <= 3.0 && Math.abs(ddx) <= 1.65) {
        return { kind: 'exit', action: 'exit_adidas', x: 0, y: 0, z: 0.90 };
      }
    }
  }

  // 3. Điểm chạm sàn Y = 0 hợp lệ (tFloor <= maxVisibleT)
  var tFloor = 9999, floorHit = null;
  if (dy < -0.025) {
    var tf = (0 - oy) / dy;
    if (tf > 0.2 && tf <= maxVisibleT + 0.15) {
      var x1 = ox + dx * tf, z1 = oz + dz * tf;
      if (x1 >= -9.9 && x1 <= 13.9 && z1 >= 0.3 && z1 <= 23.9) {
        tFloor = tf;
        floorHit = { kind: 'floor', x: x1, y: 0, z: z1 };
      }
    }
  }

  // 4. Chọn Hotspot gần nhất (t < maxVisibleT và gần hơn điểm sàn phía sau)
  var hotspots = [
    { cx: -9.1, cy: 1.3, cz: 6.8,  rad: 1.5, target: { kind: 'hotspot', action: 'inspect_shoes', x: -7.6, y: 0, z: 6.8 } },
    { cx:  0.0, cy: 0.8, cz: 6.3,  rad: 1.4, target: { kind: 'hotspot', action: 'inspect_shoes', x: 0.0,  y: 0, z: st.pig.z >= 6.3 ? 8.1 : 4.5 } },
    { cx: -4.7, cy: 0.6, cz: 2.3,  rad: 1.2, target: { kind: 'hotspot', action: 'inspect_shoes', x: -4.7, y: 0, z: 3.6 } },
    { cx:  3.1, cy: 1.1, cz: 6.45, rad: 1.3, target: { kind: 'hotspot', action: 'try_polo',      x: 1.6,  y: 0, z: 6.45 } },
    { cx: -5.2, cy: 1.0, cz: 10.6, rad: 1.3, target: { kind: 'hotspot', action: 'try_jogger',    x: -3.2, y: 0, z: 10.6 } },
    { cx: -9.1, cy: 1.2, cz: 18.0, rad: 1.4, target: { kind: 'hotspot', action: 'try_kit',       x: -7.6, y: 0, z: 18.0 } },
    { cx:  3.0, cy: 1.0, cz: 19.7, rad: 1.4, target: { kind: 'hotspot', action: 'maker_custom',  x: 1.0,  y: 0, z: 19.7 } },
    { cx: 13.4, cy: 1.4, cz: 9.8,  rad: 1.6, target: { kind: 'hotspot', action: 'try_jacket',    x: 11.8, y: 0, z: 9.8 } },
    { cx: 10.0, cy: 1.1, cz: 7.2,  rad: 1.3, target: { kind: 'hotspot', action: 'try_jacket',    x: 10.0, y: 0, z: 8.6 } },
    { cx: 11.0, cy: 1.1, cz: 3.4,  rad: 1.6, target: { kind: 'hotspot', action: 'buy_bag',       x: 9.4,  y: 0, z: 3.4 } },
    { cx: 10.0, cy: 1.1, cz: 22.4, rad: 2.1, target: { kind: 'hotspot', action: 'kick_spot',     x: 10.0, y: 0, z: 17.8 } }
  ];

  var bestHotT = maxVisibleT, bestHot = null;
  for (var hi = 0; hi < hotspots.length; hi++) {
    var hs = hotspots[hi];
    var th = adidasRaySphereDist(ox, oy, oz, dx, dy, dz, hs.cx, hs.cy, hs.cz, hs.rad);
    if (th > 0 && th < bestHotT && th <= tFloor + 0.55) {
      bestHotT = th;
      bestHot = hs.target;
    }
  }
  if (bestHot) return bestHot;
  return floorHit;
}

function getAdidasContextAction(st) {
  var p = st.pig;
  if (st.kickGame && st.kickGame.active) {
    return { id: 'kick_shoot', label: '⚽ Sút Bóng Vào Gôn! (' + st.kickGame.goals + ' bàn)' };
  }
  if (p.x >= 6.0 && p.z >= 14.0) {
    return { id: 'kick_shoot', label: '⚽ Vào Chấm Sút Phạt 11m' };
  }
  if (p.x >= 6.0 && p.z < 6.4) {
    return { id: 'buy_bag', label: '🛍️ Thanh Toán POS & Nhận Túi 3 Sọc' };
  }
  if (p.x >= 6.0 && p.z >= 6.4 && p.z < 14.0) {
    return { id: 'try_jacket', label: p.outfit === 'adidas_jacket' ? '🧥 Cởi Áo Khoác 3 Sọc' : '🧥 Thử Áo Khoác 3 Sọc' };
  }
  if (Math.hypot(p.x - 3.1, p.z - 6.45) < 2.2) {
    return { id: 'try_polo', label: p.outfit === 'adidas_polo' ? '👔 Cởi Áo Polo' : '👔 Thử Áo Polo Cổ Bẻ' };
  }
  if (Math.hypot(p.x + 5.2, p.z - 10.6) < 2.3) {
    return { id: 'try_jogger', label: p.outfit === 'adidas_jogger' ? '👖 Cởi Quần Jogger' : '👖 Thử Quần Jogger + Samba' };
  }
  if (p.x < -6.4 && p.z >= 14.2) {
    return { id: 'try_kit', label: p.outfit === 'adidas_kit' ? '⚽ Cởi Áo Đấu #10' : '⚽ Thử Áo Đấu Bóng Đá #10' };
  }
  if (Math.hypot(p.x - 3.0, p.z - 19.7) < 2.6) {
    return { id: 'maker_custom', label: '🎨 Custom In Số 10 · Maker Lab' };
  }
  if (p.x < -6.4 && p.z < 13.0 || Math.hypot(p.x, p.z - 6.3) < 2.3) {
    return { id: 'inspect_shoes', label: '👟 Ngắm Giày & Dép Adilette' };
  }
  if (p.z <= 2.2 && Math.abs(p.x) <= 2.6) {
    return { id: 'exit_adidas', label: '🚪 Ra lại Đại Lộ Sài Gòn' };
  }
  return null;
}

/* ==================== 3. RENDER WEBGL 3D 16 GIAN HÀNG + FOOTBALL KICK ZONE ==================== */
function drawAdidasTrefoilLampWebgl(wgl, x, y, z, ry) {
  var dm = wgl.drawMesh;
  var c = [1.0, 0.94, 0.68, 1];
  dm('sphere', 'white', x, y + 0.14, z, 0, ry, 0, 0.22, 0.38, 0.10, { tint: c, emissive: 1.25 });
  dm('sphere', 'white', x - Math.cos(ry) * 0.16, y + 0.04, z + Math.sin(ry) * 0.16, 0, ry, 0.55, 0.20, 0.34, 0.10, { tint: c, emissive: 1.25 });
  dm('sphere', 'white', x + Math.cos(ry) * 0.16, y + 0.04, z - Math.sin(ry) * 0.16, 0, ry, -0.55, 0.20, 0.34, 0.10, { tint: c, emissive: 1.25 });
  dm('box', 'white', x, y - 0.06, z, 0, ry, 0, 0.38, 0.05, 0.08, { tint: [0.10, 0.12, 0.16, 1] });
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

function drawAdidasSlide3D(wgl, x, y, z, soleCol, strapCol) {
  var dm = wgl.drawMesh;
  dm('box', 'white', x - 0.09, y + 0.03, z, 0, 0, 0, 0.13, 0.05, 0.30, { tint: soleCol });
  dm('box', 'white', x - 0.09, y + 0.07, z + 0.02, 0, 0, 0, 0.14, 0.04, 0.12, { tint: strapCol });
  dm('box', 'white', x - 0.09, y + 0.095, z + 0.02, 0, 0, 0, 0.142, 0.015, 0.02, { tint: [1, 1, 1, 1] });
  dm('box', 'white', x + 0.09, y + 0.03, z, 0, 0, 0, 0.13, 0.05, 0.30, { tint: soleCol });
  dm('box', 'white', x + 0.09, y + 0.07, z + 0.02, 0, 0, 0, 0.14, 0.04, 0.12, { tint: strapCol });
  dm('box', 'white', x + 0.09, y + 0.095, z + 0.02, 0, 0, 0, 0.142, 0.015, 0.02, { tint: [1, 1, 1, 1] });
}

function drawAdidasHangingGarment3D(wgl, x, y, z, ry, colRgb, isPolo, collarRgb) {
  var dm = wgl.drawMesh;
  dm('box', 'white', x, y, z, 0, ry, 0, 0.42, 0.56, 0.09, { tint: colRgb });
  dm('box', 'white', x, y + 0.18, z, 0, ry, 0, 0.62, 0.18, 0.09, { tint: colRgb });
  var sx = Math.cos(ry), sz = -Math.sin(ry);
  dm('box', 'white', x - sx * 0.25, y + 0.07, z - sz * 0.25, 0, ry, 0, 0.05, 0.40, 0.10, { tint: [1, 0.98, 0.94, 1] });
  dm('box', 'white', x + sx * 0.25, y + 0.07, z + sz * 0.25, 0, ry, 0, 0.05, 0.40, 0.10, { tint: [1, 0.98, 0.94, 1] });
  if (isPolo) {
    dm('box', 'white', x, y + 0.28, z, 0, ry, 0, 0.20, 0.07, 0.11, { tint: collarRgb || [1, 0.98, 0.94, 1] });
  }
}

function drawAdidasHangingJogger3D(wgl, x, y, z, ry, colRgb) {
  var dm = wgl.drawMesh;
  var sx = Math.cos(ry), sz = -Math.sin(ry);
  dm('box', 'white', x - sx * 0.10, y, z - sz * 0.10, 0, ry, 0, 0.16, 0.66, 0.09, { tint: colRgb });
  dm('box', 'white', x + sx * 0.10, y, z + sz * 0.10, 0, ry, 0, 0.16, 0.66, 0.09, { tint: colRgb });
  dm('box', 'white', x - sx * 0.17, y, z - sz * 0.17, 0, ry, 0, 0.025, 0.62, 0.10, { tint: [1, 1, 1, 1] });
  dm('box', 'white', x + sx * 0.17, y, z + sz * 0.17, 0, ry, 0, 0.025, 0.62, 0.10, { tint: [1, 1, 1, 1] });
  dm('box', 'white', x, y + 0.30, z, 0, ry, 0, 0.38, 0.08, 0.10, { tint: [0.95, 0.96, 0.98, 1] });
}

function drawAdidasMannequin3D(wgl, x, z, topCol, pantCol, stripeCol) {
  var dm = wgl.drawMesh;
  dm('box', 'limWood', x, 0.12, z, 0, 0, 0, 0.84, 0.24, 0.84, { tint: [1.05, 0.90, 0.72, 1] });
  dm('box', 'white',   x, 0.25, z, 0, 0, 0, 0.76, 0.04, 0.76, { tint: [0.95, 0.74, 0.22, 1], emissive: 0.45 });
  // Đôi chân mặc Jogger/Short + Giày
  dm('box', 'white', x - 0.10, 0.62, z, 0, 0, 0, 0.14, 0.66, 0.16, { tint: pantCol });
  dm('box', 'white', x + 0.10, 0.62, z, 0, 0, 0, 0.14, 0.66, 0.16, { tint: pantCol });
  dm('box', 'white', x - 0.10, 0.31, z + 0.04, 0, 0, 0, 0.15, 0.10, 0.26, { tint: [1, 0.98, 0.94, 1] });
  dm('box', 'white', x + 0.10, 0.31, z + 0.04, 0, 0, 0, 0.15, 0.10, 0.26, { tint: [1, 0.98, 0.94, 1] });
  // Thân áo + 3 sọc vai
  dm('box', 'white', x, 1.24, z, 0, 0, 0, 0.46, 0.58, 0.24, { tint: topCol });
  dm('box', 'white', x - 0.28, 1.22, z, 0, 0, 0, 0.11, 0.50, 0.14, { tint: topCol });
  dm('box', 'white', x + 0.28, 1.22, z, 0, 0, 0, 0.11, 0.50, 0.14, { tint: topCol });
  dm('box', 'white', x - 0.32, 1.22, z, 0, 0, 0, 0.04, 0.46, 0.15, { tint: stripeCol || [1, 1, 1, 1] });
  dm('box', 'white', x + 0.32, 1.22, z, 0, 0, 0, 0.04, 0.46, 0.15, { tint: stripeCol || [1, 1, 1, 1] });
  // Đầu Mannequin tối giản chuẩn boutique
  dm('sphere', 'white', x, 1.72, z, 0, 0, 0, 0.22, 0.24, 0.22, { tint: [0.92, 0.90, 0.86, 1], specPow: 64 });
}

function renderAdidasWebglScene(wgl, cam, st, W, H) {
  computeAdidasWebglCamera(cam, st);

  var adidasAtmo = {
    clearColor: [0.14, 0.11, 0.08, 1.0],
    hemiLow: [0.38, 0.32, 0.24],
    hemiHigh: [0.84, 0.76, 0.62],
    sunDir: [0.22, 0.80, 0.56],
    sunCol: [1.08, 0.96, 0.78],
    wrapBias: 0.48,
    lights: [
      { pos: [-2.0, 3.6, 6.2],  col: [1.12, 0.94, 0.64] },
      { pos: [-2.0, 3.6, 18.0], col: [1.06, 0.92, 0.72] },
      { pos: [10.4, 3.5, 6.8],  col: [1.10, 0.88, 0.58] },
      { pos: [10.0, 3.8, 19.5], col: [1.10, 1.12, 0.95] }
    ],
    outdoorRect: [0.0, 0.0, 0.0, 0.0],
    fogCol: [0.20, 0.16, 0.11],
    fogParams: [16.0, 38.0, 0.22]
  };
  wgl.beginFrame(W, H, cam, adidasAtmo);
  var dm = wgl.drawMesh;

  // ==================== A. KIẾN TRÚC MEGA MALL 1 TẦNG 24×24M (KÍN 100%, QĐ 255) ====================
  // 1. Sàn Terrazzo khu West ('hall' + 'apparel_sports': X ∈ [-10, 6], Z ∈ [0, 24])
  dm('box', 'mallTerrazzoFloor', -2.0, -0.05, 12.0, 0, 0, 0, 16.0, 0.10, 24.0, { tint: [1, 1, 1, 1], us: 8, vs: 12 });
  // Đường băng gỗ dẫn lối trung tâm từ Cửa Chính vào khu Thể Thao
  dm('box', 'limWood', 0.0, 0.008, 12.0, 0, 0, 0, 2.4, 0.014, 23.2, { tint: [0.85, 0.70, 0.54, 1], us: 2, vs: 12 });

  // 2. Sàn Cánh Đông: POS + Phòng Thay Đồ ('fitting_pos': X ∈ [6, 14], Z ∈ [0, 14])
  dm('box', 'limWood', 10.0, -0.05, 7.0, 0, 0, 0, 8.0, 0.10, 14.0, { tint: [1.12, 0.94, 0.76, 1], us: 5, vs: 8 });
  dm('box', 'fittingGreenWall', 11.4, 0.008, 9.8, 0, 0, 0, 3.2, 0.014, 4.4, { tint: [1.1, 1.15, 1.05, 1] });

  // 3. Sàn Cánh Đông Bắc: Sân Turf Football Kick Zone ('kick_zone': X ∈ [6, 14], Z ∈ [14, 24])
  dm('box', 'mallTerrazzoFloor', 10.0, -0.05, 19.0, 0, 0, 0, 8.0, 0.10, 10.0, { tint: [0.95, 0.95, 0.92, 1], us: 4, vs: 5 });
  dm('box', 'turfPitchTex', 10.0, 0.012, 19.2, 0, 0, 0, 6.2, 0.014, 8.2, { tint: [1, 1, 1, 1] });

  // 4. Tường Bao Ngoài Kín 100% (Y = 0..4.65) + Trần Gỗ & Hệ Đèn LED 3 Sọc TTTM
  dm('box', 'mallWarmWall', -10.08, 2.32, 12.0, 0, 0, 0, 0.16, 4.65, 24.0, { tint: [1, 1, 1, 1], us: 10, vs: 2 });
  dm('box', 'mallWarmWall',  14.08, 2.32, 12.0, 0, 0, 0, 0.16, 4.65, 24.0, { tint: [1, 1, 1, 1], us: 10, vs: 2 });
  dm('box', 'mallWarmWall',   2.0,  2.32, 24.08, 0, 0, 0, 24.2, 4.65, 0.16, { tint: [1, 1, 1, 1], us: 10, vs: 2 });
  // Tường mặt tiền Z = 0 với cửa kính-gỗ mở ra Đại Lộ
  dm('box', 'mallWarmWall', -5.75, 2.32, -0.08, 0, 0, 0, 8.5, 4.65, 0.16, { tint: [1, 1, 1, 1], us: 3.5, vs: 2 });
  dm('box', 'mallWarmWall',  7.75, 2.32, -0.08, 0, 0, 0, 12.5, 4.65, 0.16, { tint: [1, 1, 1, 1], us: 5, vs: 2 });
  dm('box', 'mallWarmWall',  0.0,  3.75, -0.08, 0, 0, 0, 3.0, 1.80, 0.16, { tint: [1, 1, 1, 1], us: 1.5, vs: 1 });
  dm('quad', 'white', 0, 1.42, -0.04, 0, 0, 0, 2.9, 2.84, 1, { tint: [1.0, 0.96, 0.82, 1], emissive: 1.1 });
  dm('quad', 'vnDoorWood', -0.72, 1.42, 0.04, 0, 0, 0, 1.44, 2.82, 1, { tint: [1, 1, 1, 1], us: 0.5, vs: 1 });
  var rAng = st.rightDoorOpen * 0.92;
  dm('box', 'limWood', 1.44 - Math.cos(rAng) * 0.72, 1.42, 0.04 + Math.sin(rAng) * 0.72, 0, -rAng, 0, 1.44, 2.82, 0.06, { tint: [1.05, 0.95, 0.85, 1] });
  dm('quad', 'vnDoorWood', 1.44 - Math.cos(rAng) * 0.72, 1.42, 0.08 + Math.sin(rAng) * 0.72, 0, -rAng, 0, 1.36, 2.74, 1, { tint: [1, 1, 1, 1], us: 0.5, uo: 0.5 });

  // Trần nhà rộng 24×24m + hệ thanh đèn LED 3 sọc trắng chạy dọc đại sảnh
  dm('box', 'limWood', 2.0, 4.70, 12.0, 0, 0, 0, 24.2, 0.14, 24.2, { tint: [0.85, 0.75, 0.64, 1], us: 10, vs: 10 });
  for (var lx = -1; lx <= 1; lx++) {
    dm('box', 'white', lx * 1.1, 4.58, 12.0, 0, 0, 0, 0.18, 0.06, 22.0, { tint: [1.0, 0.98, 0.90, 1], emissive: 1.15 });
  }
  for (var bz = 3.0; bz <= 22.0; bz += 4.5) {
    dm('box', 'limWood', 2.0, 4.54, bz, 0, 0, 0, 24.0, 0.16, 0.24, { tint: [0.55, 0.42, 0.30, 1] });
  }

  // 5. Vách Ngăn X = 6.0 với 3 Vòm Rộng (POS [1.8..4.8], Thay Đồ [8.0..11.4], Sân Bóng [16.5..20.5])
  dm('box', 'mallWarmWall', 6.0, 2.32, 0.9,  0, 0, 0, 0.16, 4.65, 1.8, { tint: [1, 1, 1, 1], us: 1, vs: 2 });
  dm('box', 'mallWarmWall', 6.0, 2.32, 6.4,  0, 0, 0, 0.16, 4.65, 3.2, { tint: [1, 1, 1, 1], us: 1.5, vs: 2 });
  dm('box', 'mallWarmWall', 6.0, 2.32, 13.95,0, 0, 0, 0.16, 4.65, 5.1, { tint: [1, 1, 1, 1], us: 2.2, vs: 2 });
  dm('box', 'mallWarmWall', 6.0, 2.32, 22.25,0, 0, 0, 0.16, 4.65, 3.5, { tint: [1, 1, 1, 1], us: 1.5, vs: 2 });
  // Dầm vòm trên 3 cổng mở
  dm('box', 'mallWarmWall', 6.0, 3.98, 3.3,  0, 0, 0, 0.16, 1.34, 3.0, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', 6.0, 3.98, 9.7,  0, 0, 0, 0.16, 1.34, 3.4, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', 6.0, 4.08, 18.5, 0, 0, 0, 0.16, 1.15, 4.0, { tint: [1, 1, 1, 1] });
  // Khung gỗ viền 3 vòm
  var arches = [[1.8, 4.8, 3.3], [8.0, 11.4, 3.3], [16.5, 20.5, 3.5]];
  for (var ai = 0; ai < arches.length; ai++) {
    var ar = arches[ai];
    dm('box', 'limWood', 6.0, ar[2], (ar[0] + ar[1]) * 0.5, 0, 0, 0, 0.24, 0.14, ar[1] - ar[0] + 0.12, { tint: [0.85, 0.72, 0.56, 1] });
    dm('box', 'limWood', 6.0, ar[2] * 0.5, ar[0], 0, 0, 0, 0.24, ar[2], 0.14, { tint: [0.85, 0.72, 0.56, 1] });
    dm('box', 'limWood', 6.0, ar[2] * 0.5, ar[1], 0, 0, 0, 0.24, ar[2], 0.14, { tint: [0.85, 0.72, 0.56, 1] });
  }
  // Vách Z = 14.0 [6..14] chia Thay Đồ và Sân Bóng (cửa thông X ∈ [8.2..11.8])
  dm('box', 'mallWarmWall', 7.1,  2.32, 14.0, 0, 0, 0, 2.2, 4.65, 0.16, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', 12.9, 2.32, 14.0, 0, 0, 0, 2.2, 4.65, 0.16, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', 10.0, 4.02, 14.0, 0, 0, 0, 3.6, 1.25, 0.16, { tint: [1, 1, 1, 1] });

  // ==================== B. 8 GIAN HÀNG ĐẠI SẢNH CHÍNH ('hall': X ∈ [-10, 6], Z ∈ [0, 14]) ====================
  // Gian 1: Sneaker Wall LED 12 ô dọc tường Tây (X = -9.30, Z ∈ [1.8..12.2])
  dm('box', 'limWood', -9.30, 0.44, 7.0, 0, 0, 0, 1.25, 0.88, 10.4, { tint: [1.05, 0.90, 0.76, 1] });
  dm('quad', 'shoeDisplayBoard', -9.88, 2.25, 4.4,  0, Math.PI * 0.5, 0, 5.0, 2.2, 1, { tint: [1, 1, 1, 1] });
  dm('quad', 'shoeDisplayBoard', -9.88, 2.25, 9.6,  0, Math.PI * 0.5, 0, 5.0, 2.2, 1, { tint: [1, 1, 1, 1] });
  drawAdidasSneaker3D(wgl, -9.15, 0.90, 2.8, [1, 0.98, 0.94, 1], [0.07, 0.09, 0.15, 1], [0.71, 0.33, 0.04, 1]);
  drawAdidasSneaker3D(wgl, -9.15, 0.90, 5.4, [0.86, 0.15, 0.15, 1], [1, 0.98, 0.94, 1], [0.95, 0.96, 0.98, 1]);
  drawAdidasSneaker3D(wgl, -9.15, 0.90, 8.2, [0.96, 0.97, 0.99, 1], [0.08, 0.50, 0.24, 1], [0.92, 0.94, 0.96, 1]);
  drawAdidasSneaker3D(wgl, -9.15, 0.90, 10.9,[0.12, 0.16, 0.23, 1], [0.98, 0.45, 0.09, 1], [0.06, 0.09, 0.16, 1]);

  // Gian 2: Đảo Giày Running Ultraboost (X = -5.1, Z = 5.5)
  dm('box', 'limWood', -5.1, 0.42, 5.5, 0, 0, 0, 2.1, 0.84, 1.7, { tint: [0.96, 0.84, 0.72, 1] });
  dm('box', 'white',   -5.1, 0.90, 5.5, 0, 0, 0, 1.6, 0.12, 1.2, { tint: [0.12, 0.16, 0.23, 1], specPow: 64 });
  drawAdidasSneaker3D(wgl, -5.5, 0.98, 5.5, [0.12, 0.16, 0.23, 1], [0.22, 0.74, 0.97, 1], [0.98, 0.98, 0.98, 1]);
  drawAdidasSneaker3D(wgl, -4.7, 0.98, 5.5, [0.98, 0.98, 0.98, 1], [0.98, 0.45, 0.09, 1], [0.94, 0.94, 0.96, 1]);

  // Gian 3: Đảo Predator & Samba OG Trung Tâm (X = 0, Z = 6.3)
  dm('box', 'limWood', 0, 0.42, 6.3, 0, 0, 0, 2.7, 0.84, 2.1, { tint: [0.95, 0.82, 0.70, 1] });
  dm('box', 'mallWarmWall', 0, 0.88, 6.3, 0, 0, 0, 2.8, 0.08, 2.2, { tint: [1.05, 0.96, 0.82, 1], specPow: 64 });
  drawAdidasSneaker3D(wgl, -0.78, 1.04, 6.3, [1, 0.98, 0.94, 1], [0.07, 0.09, 0.15, 1], [0.71, 0.33, 0.04, 1]);
  drawAdidasSneaker3D(wgl,  0.00, 1.12, 6.3, [0.12, 0.16, 0.23, 1], [0.98, 0.45, 0.09, 1], [0.06, 0.09, 0.16, 1]);
  drawAdidasSneaker3D(wgl,  0.78, 1.04, 6.3, [0.86, 0.15, 0.15, 1], [1, 0.98, 0.94, 1], [0.95, 0.96, 0.98, 1]);

  // Gian 4: Đảo & Giá Áo Polo Cổ Bẻ 3 Sọc (X = 3.1, Z = 6.45 & tường X = 5.35, Z = 6.4)
  dm('box', 'limWood', 3.1, 0.38, 6.45, 0, 0, 0, 1.7, 0.76, 2.0, { tint: [1.0, 0.86, 0.72, 1] });
  dm('cyl', 'white',   3.1, 1.54, 6.45, Math.PI * 0.5, 0, 0, 0.04, 1.9, 0.04, { tint: [0.82, 0.64, 0.24, 1] });
  drawAdidasHangingGarment3D(wgl, 3.1, 1.18, 5.85, Math.PI * 0.5, [0.12, 0.23, 0.54, 1], true, [1, 0.98, 0.94, 1]);
  drawAdidasHangingGarment3D(wgl, 3.1, 1.18, 6.45, Math.PI * 0.5, [0.97, 0.98, 0.99, 1], true, [0.06, 0.09, 0.16, 1]);
  drawAdidasHangingGarment3D(wgl, 3.1, 1.18, 7.05, Math.PI * 0.5, [0.60, 0.11, 0.11, 1], true, [1, 0.98, 0.94, 1]);
  dm('box', 'limWood', 5.35, 0.36, 6.40, 0, 0, 0, 1.15, 0.72, 1.9, { tint: [1.05, 0.90, 0.76, 1] });
  dm('quad', 'poloDisplayTex', 5.88, 2.15, 6.40, 0, -Math.PI * 0.5, 0, 2.8, 1.9, 1, { tint: [1, 1, 1, 1] });

  // Gian 5: Đảo Quần Jogger & Track Pants Nỉ 3 Sọc (X = -5.2, Z = 10.6)
  dm('box', 'limWood', -5.2, 0.36, 10.6, 0, 0, 0, 2.3, 0.72, 1.9, { tint: [0.92, 0.80, 0.68, 1] });
  dm('cyl', 'white',   -5.2, 1.62, 10.6, 0, 0, Math.PI * 0.5, 0.04, 2.1, 0.04, { tint: [0.82, 0.64, 0.24, 1] });
  drawAdidasHangingJogger3D(wgl, -5.85, 1.24, 10.6, 0, [0.07, 0.09, 0.15, 1]);
  drawAdidasHangingJogger3D(wgl, -5.20, 1.24, 10.6, 0, [0.28, 0.33, 0.41, 1]);
  drawAdidasHangingJogger3D(wgl, -4.55, 1.24, 10.6, 0, [0.08, 0.32, 0.18, 1]);
  dm('quad', 'joggerRackTex', -5.2, 1.20, 9.63, 0, Math.PI, 0, 2.2, 1.15, 1, { tint: [1, 1, 1, 1] });

  // Gian 6: Giá Áo Khoác Firebird & Hoodie (X = 5.30, Z = 12.75)
  dm('box', 'limWood', 5.30, 0.36, 12.75, 0, 0, 0, 1.2, 0.72, 1.85, { tint: [1.05, 0.90, 0.76, 1] });
  dm('quad', 'threeStripesWall', 5.88, 2.15, 12.75, 0, -Math.PI * 0.5, 0, 2.4, 1.85, 1, { tint: [1, 1, 1, 1] });
  drawAdidasHangingGarment3D(wgl, 5.20, 1.55, 12.25, -Math.PI * 0.5, [0.07, 0.09, 0.15, 1], false);
  drawAdidasHangingGarment3D(wgl, 5.20, 1.55, 13.20, -Math.PI * 0.5, [0.72, 0.11, 0.11, 1], false);

  // Gian 7: Quầy Dép Adilette Slides & Sandal Thể Thao (X = -4.7, Z = 2.3)
  dm('box', 'limWood', -4.7, 0.40, 2.3, 0, 0, 0, 2.1, 0.80, 1.3, { tint: [0.98, 0.88, 0.76, 1] });
  dm('quad', 'slidesBoardTex', -4.7, 1.65, 2.3, 0, Math.PI, 0, 2.1, 1.15, 1, { tint: [1, 1, 1, 1] });
  drawAdidasSlide3D(wgl, -5.3, 0.82, 2.3, [0.06, 0.09, 0.16, 1], [0.12, 0.16, 0.23, 1]);
  drawAdidasSlide3D(wgl, -4.7, 0.82, 2.3, [0.11, 0.31, 0.85, 1], [0.15, 0.39, 0.92, 1]);
  drawAdidasSlide3D(wgl, -4.1, 0.82, 2.3, [0.84, 0.77, 0.63, 1], [0.47, 0.21, 0.06, 1]);

  // Gian 8: Cụm 3 Mannequin Styling Pods Full Outfit (Polo+Jogger, Track Jacket, Football Kit)
  drawAdidasMannequin3D(wgl,  1.8, 9.8,  [0.12, 0.23, 0.54, 1], [0.20, 0.25, 0.33, 1], [1, 1, 1, 1]);
  drawAdidasMannequin3D(wgl, -2.0, 9.8,  [0.72, 0.11, 0.11, 1], [0.07, 0.09, 0.15, 1], [1, 1, 1, 1]);
  drawAdidasMannequin3D(wgl,  3.6, 15.2, [0.86, 0.15, 0.15, 1], [0.86, 0.15, 0.15, 1], [0.98, 0.80, 0.08, 1]);

  // ==================== C. 4 GIAN THỂ THAO & SÁNG TẠO ('apparel_sports': Z ∈ [14, 24]) ====================
  // Gian 9: Quầy Áo Đấu Bóng Đá, Tất & Bóng (Tường Tây X = -9.30, Z ∈ [15..21.2])
  dm('box', 'limWood', -9.30, 0.44, 18.1, 0, 0, 0, 1.25, 0.88, 6.2, { tint: [1.05, 0.90, 0.76, 1] });
  dm('quad', 'footballGearTex', -9.88, 2.25, 18.1, 0, Math.PI * 0.5, 0, 5.8, 2.25, 1, { tint: [1, 1, 1, 1] });
  drawAdidasHangingGarment3D(wgl, -9.0, 1.55, 16.5, Math.PI * 0.5, [0.86, 0.15, 0.15, 1], false);
  drawAdidasHangingGarment3D(wgl, -9.0, 1.55, 19.6, Math.PI * 0.5, [0.97, 0.98, 0.99, 1], false);
  dm('sphere', 'white', -9.15, 1.05, 18.1, 0, 0, 0, 0.34, 0.34, 0.34, { tint: [0.98, 0.98, 0.98, 1] });

  // Gian 10: Đảo Running, Gym & Pickleball Studio (X = -5.1, Z = 17.1)
  dm('box', 'limWood', -5.1, 0.42, 17.1, 0, 0, 0, 2.5, 0.84, 2.1, { tint: [0.95, 0.84, 0.72, 1] });
  dm('quad', 'gymPickleTex', -5.1, 1.65, 17.1, 0, Math.PI, 0, 2.4, 1.25, 1, { tint: [1, 1, 1, 1] });
  dm('box', 'white', -5.6, 0.90, 17.1, 0, 0.2, 0, 0.42, 0.06, 0.62, { tint: [0.07, 0.09, 0.15, 1] });
  dm('cyl', 'white', -4.6, 1.02, 17.1, 0, 0, 0, 0.14, 0.34, 0.14, { tint: [0.22, 0.74, 0.97, 1] });

  // Gian 11: Quầy Maker Lab Custom Studio (X = 3.0, Z = 19.7)
  dm('box', 'limWood', 3.0, 0.46, 19.7, 0, 0, 0, 2.5, 0.92, 2.1, { tint: [0.92, 0.80, 0.68, 1] });
  dm('box', 'white',   3.0, 1.04, 19.7, 0, 0, 0, 0.92, 0.24, 0.76, { tint: [0.98, 0.45, 0.09, 1], specPow: 64 }); // Máy ép nhiệt
  dm('box', 'white',   3.0, 1.22, 19.7, 0.25, 0, 0, 0.84, 0.08, 0.68, { tint: [0.12, 0.16, 0.23, 1] });
  dm('quad', 'makerLabTex', 3.0, 2.25, 20.6, 0, Math.PI, 0, 2.6, 1.35, 1, { tint: [1, 1, 1, 1] });

  // Gian 12: Tường Balo, Túi Trống, Nón & Vớ Trefoil + Tranh Hero & Việt Nam × 3 Sọc (Tường Bắc Z = 23.8)
  dm('box', 'limWood', -2.0, 0.46, 23.3, 0, 0, 0, 8.2, 0.92, 1.25, { tint: [1.0, 0.86, 0.72, 1] });
  dm('quad', 'accessoriesWallTex', -4.2, 1.95, 23.90, 0, Math.PI, 0, 4.2, 1.95, 1, { tint: [1, 1, 1, 1] });
  dm('quad', 'vnLotusStripeArt',    1.6, 2.15, 23.90, 0, Math.PI, 0, 5.4, 2.25, 1, { tint: [1, 1, 1, 1] });
  dm('quad', 'trefoilOriginSign',  -4.2, 3.65, 23.90, 0, Math.PI, 0, 5.6, 1.45, 1, { tint: [1, 1, 1, 1] });

  // ==================== D. PHÒNG THAY ĐỒ VIP & THU NGÂN POS ('fitting_pos': X ∈ [6, 14], Z ∈ [0, 14]) ====================
  // Gian 13: Phòng Thay Đồ Gương Toàn Thân 360° + Rèm + Giá Đồ + Ghế Băng Thử Giày
  dm('box', 'limWood', 13.55, 0.10, 9.8, 0, 0, 0, 0.72, 0.20, 3.60, { tint: [1.05, 0.88, 0.72, 1] });
  dm('quad', 'mirrorGlass', 13.88, 1.72, 9.8, 0, -Math.PI * 0.5, 0, 3.55, 3.04, 1, { tint: [1, 1, 1, 1], specPow: 96, rim: 0.25 });
  if (st.pig.x >= 5.6 && st.pig.z >= 6.4 && st.pig.z <= 13.8) {
    var mirrorZ = Math.max(8.35, Math.min(11.25, st.pig.z));
    var mTex = typeof ensurePigBillboardTex === 'function'
      ? ensurePigBillboardTex(wgl, 'front', st.pig.walking ? 1 : 0, 0, 0, 0, 0, st.pig.outfit || 'none')
      : 'white';
    dm('quad', mTex, 13.82, 0.62, mirrorZ, 0, -Math.PI * 0.5, 0, 0.68, 0.68, 1, { tint: [0.90, 0.96, 1.0, 1], emissive: 1.0 });
  }
  dm('quad', 'velvetCurtain', 13.90, 1.70, 7.25,  0, -Math.PI * 0.5, 0, 1.4, 3.3, 1, { tint: [1, 1, 1, 1] });
  dm('quad', 'velvetCurtain', 13.90, 1.70, 12.35, 0, -Math.PI * 0.5, 0, 1.4, 3.3, 1, { tint: [1, 1, 1, 1] });

  dm('box', 'limWood', 10.0, 0.29, 7.2, 0, 0, 0, 4.4, 0.58, 0.9, { tint: [1.0, 0.85, 0.72, 1] });
  dm('cyl', 'white',   10.0, 2.25, 7.2, 0, 0, Math.PI * 0.5, 0.04, 4.1, 0.04, { tint: [0.84, 0.66, 0.24, 1] });
  drawAdidasHangingGarment3D(wgl, 8.6,  1.80, 7.2, 0, [0.07, 0.09, 0.15, 1], false);
  drawAdidasHangingGarment3D(wgl, 10.0, 1.80, 7.2, 0, [0.12, 0.23, 0.54, 1], true, [1, 1, 1, 1]);
  drawAdidasHangingGarment3D(wgl, 11.4, 1.80, 7.2, 0, [0.72, 0.11, 0.11, 1], false);

  dm('box', 'limWood', 7.3, 0.21, 12.45, 0, 0, 0, 1.3, 0.42, 0.96, { tint: [1.05, 0.88, 0.72, 1] });
  dm('box', 'fittingGreenWall', 7.3, 0.48, 12.45, 0, 0, 0, 1.2, 0.12, 0.86, { tint: [1.1, 1.25, 1.0, 1] });
  drawAdidasSneaker3D(wgl, 7.3, 0.55, 12.45, [1, 0.98, 0.94, 1], [0.07, 0.09, 0.15, 1], [0.71, 0.33, 0.04, 1]);

  // Gian 14: Quầy Thu Ngân POS Đôi & Kệ Hộp Giày Checkout (X ∈ [6..14], Z ∈ [0.8..6.0])
  dm('box', 'limWood', 10.9, 0.52, 3.4, 0, 0, 0, 1.35, 1.04, 3.9, { tint: [1.05, 0.88, 0.72, 1] });
  dm('box', 'mallWarmWall', 10.9, 1.08, 3.4, 0, 0, 0, 1.48, 0.10, 4.05, { tint: [1.05, 0.95, 0.80, 1] });
  dm('box', 'white', 10.85, 1.32, 2.4, 0, 0, 0, 0.38, 0.36, 0.46, { tint: [0.12, 0.16, 0.23, 1], specPow: 80 });
  dm('box', 'white', 10.85, 1.32, 4.3, 0, 0, 0, 0.38, 0.36, 0.46, { tint: [0.12, 0.16, 0.23, 1], specPow: 80 });
  dm('box', 'white', 10.85, 1.24, 3.35, 0, 0, 0, 0.44, 0.22, 0.62, { tint: [0.11, 0.31, 0.85, 1] });
  dm('quad', 'posShelfTex', 13.90, 2.25, 3.5, 0, -Math.PI * 0.5, 0, 5.4, 2.2, 1, { tint: [1, 1, 1, 1] });
  dm('box', 'limWood', 8.25, 0.44, 1.4, 0, 0, 0, 1.4, 0.88, 0.95, { tint: [0.92, 0.80, 0.68, 1] });
  dm('quad', 'accessoriesWallTex', 8.25, 1.45, 0.95, 0, 0, 0, 1.4, 0.95, 1, { tint: [1, 1, 1, 1] });

  // ==================== E. GIAN 15 & 16: SÂN TURF MINI-GAME SÚT BÓNG 3D & KỆ BÓNG ====================
  // Khung thành 3D + Lưới gôn rung sóng (X ∈ [8.1..11.9], Z ∈ [22.4..23.5])
  var netShake = (st.kickGame && st.kickGame.netRipple) ? Math.sin(st.t * 28) * st.kickGame.netRipple * 0.12 : 0;
  dm('box', 'white',  8.15, 0.95, 22.4, 0, 0, 0, 0.12, 1.90, 0.12, { tint: [0.98, 0.99, 1.0, 1], specPow: 64 });
  dm('box', 'white', 11.85, 0.95, 22.4, 0, 0, 0, 0.12, 1.90, 0.12, { tint: [0.98, 0.99, 1.0, 1], specPow: 64 });
  dm('box', 'white', 10.00, 1.90, 22.4, 0, 0, 0, 3.82, 0.12, 0.12, { tint: [0.98, 0.99, 1.0, 1], specPow: 64 });
  wgl.setBlend('alpha');
  dm('quad', 'goalNetTex', 10.00, 0.95, 23.45 + netShake, 0, Math.PI, 0, 3.70, 1.90, 1, { tint: [1, 1, 1, 0.88], emissive: 0.45 });
  dm('quad', 'goalNetTex',  8.15, 0.95, 22.92, 0,  Math.PI * 0.5, 0, 1.05, 1.90, 1, { tint: [1, 1, 1, 0.82] });
  dm('quad', 'goalNetTex', 11.85, 0.95, 22.92, 0, -Math.PI * 0.5, 0, 1.05, 1.90, 1, { tint: [1, 1, 1, 0.82] });
  wgl.setBlend(null);
  // 3 Bia mục tiêu phát sáng ở 3 góc Gôn & Bảng LED tỷ số trên nóc Gôn
  dm('quad', 'scoreboardLedTex', 10.0, 2.75, 23.85, 0, Math.PI, 0, 4.6, 1.45, 1, { tint: [1, 1, 1, 1], emissive: 0.6 });
  var goalTargetsX = [8.75, 10.0, 11.25];
  for (var gi = 0; gi < 3; gi++) {
    dm('torus', 'white', goalTargetsX[gi], gi === 1 ? 1.42 : 1.32, 23.38, 0, 0, 0, 0.48, 0.48, 0.48, {
      tint: [0.98, 0.80, 0.12, 1], emissive: 1.1
    });
  }
  // Quả bóng đá 3D & Vòng Aim hướng sút trên mặt cỏ
  if (st.kickGame) {
    var kb = st.kickGame.ball;
    dm('sphere', 'white', kb.x, kb.y, kb.z, st.t * 2, 0, 0, 0.40, 0.40, 0.40, { tint: [0.98, 0.98, 0.98, 1], specPow: 72 });
    dm('box', 'white', kb.x, kb.y + 0.02, kb.z, 0, st.t * 2, 0, 0.16, 0.36, 0.36, { tint: [0.10, 0.12, 0.18, 1] });
    if (st.kickGame.active && !kb.shooting) {
      wgl.setBlend('add');
      for (var dot = 1; dot <= 4; dot++) {
        var ax = kb.x + Math.sin(st.kickGame.aimAngle) * dot * 0.75;
        var az = kb.z + Math.cos(st.kickGame.aimAngle) * dot * 0.75;
        dm('cyl', 'white', ax, 0.035, az, 0, 0, 0, 0.14, 0.02, 0.14, { tint: [0.98, 0.85, 0.15, 0.85], emissive: 1.3 });
      }
      wgl.setBlend(null);
    }
    for (var ksi = 0; ksi < st.kickGame.sparks.length; ksi++) {
      var sp = st.kickGame.sparks[ksi];
      dm('sphere', 'white', sp.x, sp.y, sp.z, 0, 0, 0, 0.10, 0.10, 0.10, { tint: [1.0, 0.85, 0.20, 1], emissive: 1.4 });
    }
  }
  // Gian 16: Kệ Bóng Thi Đấu & Ghế Cổ Động Viên (X = 13.25, Z ∈ [15.2..21.2])
  dm('box', 'limWood', 13.30, 0.46, 18.2, 0, 0, 0, 1.25, 0.92, 5.8, { tint: [1.0, 0.88, 0.74, 1] });
  dm('quad', 'footballGearTex', 13.88, 2.25, 18.2, 0, -Math.PI * 0.5, 0, 5.4, 2.1, 1, { tint: [1, 1, 1, 1] });
  for (var wb = 0; wb < 3; wb++) {
    dm('sphere', 'white', 13.15, 1.06, 16.4 + wb * 1.8, 0, 0, 0, 0.34, 0.34, 0.34, { tint: [0.98, 0.96, 0.90, 1] });
  }

  // Đèn Cỏ Ba Lá Trefoil LED nổi bật khắp Mega Mall
  drawAdidasTrefoilLampWebgl(wgl, 0.0,  3.65, 6.3,  0);
  drawAdidasTrefoilLampWebgl(wgl, 0.0,  3.65, 17.5, 0);
  drawAdidasTrefoilLampWebgl(wgl, 10.6, 3.65, 9.8,  -Math.PI * 0.5);
  drawAdidasTrefoilLampWebgl(wgl, 10.0, 3.85, 19.2, 0);

  // ==================== F. 12 NPC PIXEL ART (gl.NEAREST) & CHÚ HEO 4 OUTFIT ====================
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

  // Vòng sóng chạm sàn + hạt bụi ánh sáng
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
    dm('sphere', 'white', pt.x, pt.y, pt.z, 0, 0, 0, 0.024, 0.024, 0.024, { tint: [1.0, 0.90, 0.62, 0.40], emissive: 1.1 });
  }
  wgl.setBlend(null);

  if (st.exitFade > 0.01) {
    wgl.setBlend('alpha');
    dm('quad', 'white', cam.pos.x + cam.F.x * 0.6, cam.pos.y + cam.F.y * 0.6, cam.pos.z + cam.F.z * 0.6, 0, cam.yaw, 0, 6, 6, 1, {
      tint: [0.96, 0.93, 0.86, Math.min(1, st.exitFade)], emissive: 1.0
    });
    wgl.setBlend(null);
  }
}

/* ==================== 4. FALLBACK CANVAS2D CHO HEADLESS SMOKE TEST 182 & NON-WEBGL ==================== */
function drawSneakerSprite3D(ctx, cam, wx, wy, wz, bodyCol, stripeCol, soleCol) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 24 || pr.cz < 0.35) return;
  var u = Math.max(0.45, Math.min(2.8, pr.scale / 40));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  ctx.fillStyle = soleCol || '#B45309';
  ctx.fillRect(px - 6 * u, py - 2.2 * u, 12 * u, 2.6 * u);
  ctx.fillStyle = bodyCol || '#FFFBF1';
  ctx.fillRect(px - 5.5 * u, py - 6.2 * u, 9.5 * u, 4.2 * u);
  ctx.fillStyle = stripeCol || '#111827';
  for (var k = 0; k < 3; k++) ctx.fillRect(px + (-2.6 + k * 1.8) * u, py - 5.6 * u, 1.1 * u, 3.2 * u);
  ctx.restore();
}

function renderAdidasTpsScene(ctx, cam, st, W, H) {
  var room = st.room || (st.pig.x >= 6.0 ? (st.pig.z >= 14.0 ? 'kick_zone' : 'fitting') : 'hall');
  var isFitting = room === 'fitting' || room === 'fitting_pos';
  ctx.fillStyle = isFitting ? '#213527' : '#3B2618';
  ctx.fillRect(0, 0, W, H);

  drawPoly3D(ctx, cam, [[-10, 0, 0], [14, 0, 0], [14, 0, 24], [-10, 0, 24]], isFitting ? '#8F6038' : '#E8DEC8', '#8C7A5B', 1);
  for (var tz = 0; tz < 24; tz += 2.4) {
    for (var tx = -10; tx < 14; tx += 2.4) {
      if ((Math.round(tx / 2.4) + Math.round(tz / 2.4)) % 2 === 0) {
        drawPoly3D(ctx, cam, [[tx, 0.004, tz], [tx + 2.4, 0.004, tz], [tx + 2.4, 0.004, tz + 2.4], [tx, 0.004, tz + 2.4]], '#D6C4A1', '#B5A17D', 0.5);
      }
    }
  }
  drawPoly3D(ctx, cam, [[-10, 0, 24], [14, 0, 24], [14, 4.65, 24], [-10, 4.65, 24]], '#E6C77D', '#5C341D', 1);
  drawPoly3D(ctx, cam, [[-10, 0, 0], [-10, 0, 24], [-10, 4.65, 24], [-10, 4.65, 0]], '#DFBA66', '#5C341D', 1);
  drawPoly3D(ctx, cam, [[14, 0, 24], [14, 0, 0], [14, 4.65, 0], [14, 4.65, 24]], '#DFBA66', '#5C341D', 1);

  if (typeof drawAdidasRoomWalls3D === 'function') {
    drawAdidasRoomWalls3D(ctx, cam, room, st.pig, st.t);
  }

  var items = [];
  function pushItem(wx, wz, fn) {
    items.push({ d: Math.hypot(wx - cam.pos.x, wz - cam.pos.z), fn: fn });
  }
  pushItem(0, 6.3, function() {
    drawBox3D(ctx, cam, 0, 0, 6.3, 2.5, 0.84, 1.9, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
    drawSneakerSprite3D(ctx, cam, 0, 1.05, 6.3, '#FFFBF1', '#111827', '#B45309');
  });
  pushItem(3.1, 6.45, function() {
    drawBox3D(ctx, cam, 3.1, 0, 6.45, 1.7, 0.76, 1.9, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
  });
  pushItem(-5.2, 10.6, function() {
    drawBox3D(ctx, cam, -5.2, 0, 10.6, 2.2, 0.72, 1.8, { top: '#334155', front: '#1E293B', side: '#0F172A', stroke: '#2B180E' });
  });
  pushItem(10.0, 22.4, function() {
    drawBox3D(ctx, cam, 10.0, 0, 22.4, 3.6, 1.9, 1.1, { top: '#15803D', front: '#166534', side: '#14532D', stroke: '#FFFBF1' });
  });
  if (st.npcs) {
    for (var ni = 0; ni < st.npcs.length; ni++) {
      (function(npc) {
        pushItem(npc.x, npc.z, function() {
          drawHumanTps3D(ctx, cam, npc, st.t);
        });
      })(st.npcs[ni]);
    }
  }
  pushItem(st.pig.x, st.pig.z, function() {
    drawPigTps3D(ctx, cam, st.pig, st.t);
  });
  items.sort(function(a, b) { return b.d - a.d; });
  for (var ii = 0; ii < items.length; ii++) items[ii].fn();

  if (st.exitFade > 0.01) {
    ctx.fillStyle = 'rgba(246, 238, 220, ' + st.exitFade.toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
  }
}
`;
}
