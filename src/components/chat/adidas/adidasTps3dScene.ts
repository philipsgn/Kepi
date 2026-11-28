/**
 * Adidas Mall Flagship 2 Tầng Bám Sát Banner WebGL 3D (QĐ 255–256)
 * - Khôi phục Tầng 2 ('upper': X ∈ [-10.0, 6.0], Z ∈ [0.0, 14.0], Y = 3.4..7.8) nối thông qua cầu thang 14 bậc
 *   rộng 2.2m (X ∈ [-9.6, -7.4], Z ∈ [8.0, 12.8]) kèm chiếu nghỉ & lan can khóa 3 mặt lỗ thang.
 * - Mặt tiền Z = 0 bám sát 1:1 Hub Banner: Tầng 1 có 2 ô cửa sổ kính trưng bày Mannequin 3 bộ & Trefoil;
 *   Tầng 2 có 3 ô cửa sổ vòm có lan can con tiện trắng + chùm đèn nhiều màu nhìn ra vỉa hè, hoa giấy hồng,
 *   đại lộ 2 làn 4 xe chạy 60fps & bầu trời Skyline Sáng/Chiều/Tối.
 * - Giữ nguyên toàn bộ 16 gian Tầng 1 + Sân Turf Sút Bóng 3D; bổ sung 6 gian Tầng 2 (tổng 22 gian) với
 *   giá treo áo quần đa hướng (chữ A, sào kép, giá tròn 360°), Khu SALE -50%, POS Tầng 2 & 14 NPCs.
 */
export function buildAdidasTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. ĐỒ THỊ KHÔNG GIAN 2 TẦNG LIÊN HOÀN (QĐ 256) ==================== */
var ADIDAS_NAV_GRAPH = {
  outerBounds: { minX: -10.0, maxX: 14.0, minZ: 0.0, maxZ: 24.0, minY: 0.45, maxY: 7.80 },
  wallMargin: 0.38,
  zones: [
    { id: 'hall',           minX: -9.65, maxX: 5.95,  minZ: 0.35,  maxZ: 13.95, floorY: 0 },
    { id: 'apparel_sports', minX: -9.65, maxX: 5.95,  minZ: 13.95, maxZ: 23.65, floorY: 0 },
    { id: 'fitting_pos',    minX: 6.00,  maxX: 13.65, minZ: 0.35,  maxZ: 13.95, floorY: 0 },
    { id: 'kick_zone',      minX: 6.00,  maxX: 13.65, minZ: 13.95, maxZ: 23.65, floorY: 0 },
    { id: 'upper',          minX: -9.65, maxX: 5.65,  minZ: 0.45,  maxZ: 13.75, floorY: 3.4 }
  ],
  ramps: [
    {
      id: 'adidas_stair',
      axis: 'z',
      minX: -9.6, maxX: -7.4,
      zStart: 8.0, zEnd: 12.8,
      yStart: 0, yEnd: 3.4
    }
  ],
  dividerWalls: [
    // Vách ngăn X = 6.0 Tầng 1 mở 3 vòm & kín ở Tầng 2
    {
      axis: 'x', pos: 6.0, minSpan: 0.0, maxSpan: 24.0, minY: 0.0, maxY: 4.65,
      openings: [
        { a1: 1.8,  a2: 4.8,  y1: 0.0, y2: 3.3 },
        { a1: 8.0,  a2: 11.4, y1: 0.0, y2: 3.3 },
        { a1: 16.5, a2: 20.5, y1: 0.0, y2: 3.5 }
      ]
    },
    { axis: 'x', pos: 6.0, minSpan: 0.0, maxSpan: 14.0, minY: 3.4, maxY: 7.80, openings: [] },
    // Vách ngăn Z = 14.0 cánh Đông Tầng 1 (Thay Đồ ↔ Sân Bóng)
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
    },
    {
      from: 'hall',
      to: 'upper',
      waypointsForward: [
        { x: -8.5, y: 0,   z: 7.45 },
        { x: -8.5, y: 3.4, z: 13.35 },
        { x: -6.2, y: 3.4, z: 13.35 }
      ],
      waypointsBackward: [
        { x: -6.2, y: 3.4, z: 13.35 },
        { x: -8.5, y: 3.4, z: 13.35 },
        { x: -8.5, y: 0,   z: 7.45 }
      ]
    }
  ]
};

function getAdidasSurfaceY(x, z, curY) {
  if (x >= -9.65 && x <= -7.35 && z >= 7.95 && z <= 12.85) {
    if (z <= 8.0) return 0;
    if (z >= 12.8) return 3.4;
    if (curY >= 3.2 && z < 12.5 && x > -7.55) return 3.4;
    return ((z - 8.0) / 4.8) * 3.4;
  }
  if (x >= 6.0 || z >= 14.0) return 0;
  return curY >= 1.9 ? 3.4 : 0;
}

function getAdidasObstacles(floorY) {
  if (typeof floorY === 'number' && floorY >= 1.9) {
    return [
      // Khóa chặt 3 mặt lỗ cầu thang Tầng 2 (chừa chiếu nghỉ phía Bắc Z >= 12.8)
      { id: 'f2_hole_right', x1: -7.55, z1: 7.90, x2: -7.25, z2: 12.75 },
      { id: 'f2_hole_front', x1: -9.85, z1: 7.80, x2: -7.25, z2: 8.15  },
      // Gian 17: Giá chữ A Polo & Giá tròn 360° Tầng 2
      { id: 'f2_aframe_polo', x1: -4.20, z1: 2.60, x2: -2.20, z2: 4.40 },
      { id: 'f2_round_1',     x1: -0.60, z1: 3.60, x2: 1.20,  z2: 5.40 },
      // Gian 18: Sào kép Jogger & Giá tròn 360° thứ 2
      { id: 'f2_jogger_rack', x1: -6.20, z1: 5.20, x2: -4.40, z2: 7.80 },
      { id: 'f2_round_2',     x1: -4.20, z1: 10.20, x2: -2.40, z2: 12.00 },
      // Gian 19: Khu SALE OUTLET -50% Tầng 2
      { id: 'f2_sale_island', x1: -1.60, z1: 9.20, x2: 1.40,  z2: 11.20 },
      // Gian 20: Kệ BST Việt Nam × 3 Sọc (Tường Tây Tầng 2)
      { id: 'f2_vn_col',      x1: -9.95, z1: 1.60, x2: -8.65, z2: 6.80  },
      // Gian 21: Quầy Thu Ngân POS Tầng 2 & Kệ Hộp Giày Samba
      { id: 'f2_pos',         x1: 3.20,  z1: 4.20, x2: 5.95,  z2: 9.60  },
      // Gian 22: 2 Mannequin Cửa Sổ Vòm Tầng 2
      { id: 'f2_man_l',       x1: -6.60, z1: 1.20, x2: -5.70, z2: 2.10  },
      { id: 'f2_man_r',       x1: 1.80,  z1: 1.20, x2: 2.70,  z2: 2.10  }
    ];
  }
  return [
    // Gian 1: Sneaker Wall LED trái rút gọn phía trước (nhường chân thang Z=8.0)
    { id: 'sneaker_wall',   x1: -9.95, z1: 1.30,  x2: -8.65, z2: 7.05  },
    // Khối gầm cầu thang Tầng 1 (chặn đi vòng sau & cạnh hông cầu thang)
    { id: 'f1_stair_back',  x1: -9.95, z1: 12.85, x2: -7.25, z2: 14.00 },
    { id: 'f1_stair_side',  x1: -7.55, z1: 8.20,  x2: -7.25, z2: 12.85 },
    // Gian 2: Đảo Running Ultraboost
    { id: 'ultra_island',   x1: -6.20, z1: 4.60,  x2: -4.00, z2: 6.40  },
    // Gian 3: Đảo Predator Trung Tâm
    { id: 'pred_island',    x1: -1.40, z1: 5.20,  x2: 1.40,  z2: 7.40  },
    // Gian 4: Đảo & Giá Áo Polo Cổ Bẻ 3 Sọc (Tầng 1)
    { id: 'polo_island',    x1: 2.20,  z1: 5.40,  x2: 4.00,  z2: 7.50  },
    { id: 'polo_wall',      x1: 4.75,  z1: 5.40,  x2: 5.95,  z2: 7.40  },
    // Gian 5: Đảo Quần Jogger & Track Pants (cách cầu thang 1.45m)
    { id: 'jogger_rack',    x1: -5.80, z1: 10.40, x2: -3.60, z2: 12.20 },
    // Gian 6: Giá Áo Khoác Firebird & Hoodie
    { id: 'jacket_rack',    x1: 4.65,  z1: 11.80, x2: 5.95,  z2: 13.70 },
    // Gian 7: Kệ Dép Adilette Slides
    { id: 'slides_rack',    x1: -5.80, z1: 1.60,  x2: -3.60, z2: 3.00  },
    // Gian 8: 3 Bục Mannequin Styling Pods
    { id: 'man_polo',       x1: 1.35,  z1: 9.35,  x2: 2.25,  z2: 10.25 },
    { id: 'man_track',      x1: -2.45, z1: 9.35,  x2: -1.55, z2: 10.25 },
    { id: 'man_kit',        x1: 3.15,  z1: 14.75, x2: 4.05,  z2: 15.65 },
    // Kệ SALE Tầng 1 gần cửa phải
    { id: 'sale_f1',        x1: 2.20,  z1: 2.10,  x2: 4.00,  z2: 3.50  },
    // Gian 9: Quầy Áo Đấu Bóng Đá (apparel_sports Tây)
    { id: 'football_wall',  x1: -9.95, z1: 15.00, x2: -8.65, z2: 21.20 },
    // Gian 10: Đảo Gym / Running / Pickleball
    { id: 'gym_island',     x1: -6.40, z1: 16.00, x2: -3.80, z2: 18.20 },
    // Gian 11: Maker Lab Custom Studio
    { id: 'maker_lab',      x1: 1.70,  z1: 18.60, x2: 4.30,  z2: 20.80 },
    // Gian 12: Tường Balo / Nón / Túi / Vớ Trefoil
    { id: 'acc_wall',       x1: -6.20, z1: 22.65, x2: 2.20,  z2: 23.95 },
    // Gian 13: Phòng Thay Đồ VIP (Gương + Giá đồ + Ghế Băng góc Tây)
    { id: 'fit_rack',       x1: 7.80,  z1: 6.75,  x2: 12.20, z2: 7.65  },
    { id: 'fit_mirror',     x1: 13.15, z1: 7.95,  x2: 13.95, z2: 11.65 },
    { id: 'fit_bench',      x1: 6.65,  z1: 11.95, x2: 7.95,  z2: 12.95 },
    // Gian 14: Quầy Thu Ngân POS Đôi T1 & Phụ Kiện Checkout
    { id: 'pos_desk',       x1: 10.20, z1: 1.40,  x2: 11.65, z2: 5.40  },
    { id: 'pos_shelf',      x1: 12.80, z1: 1.20,  x2: 13.95, z2: 5.80  },
    { id: 'pos_acc',        x1: 7.50,  z1: 0.90,  x2: 9.00,  z2: 1.95  },
    // Gian 15 & 16: Khung Thành Gôn 3D & Kệ Bóng World Cup
    { id: 'goal_frame',     x1: 7.95,  z1: 22.20, x2: 12.05, z2: 23.75 },
    { id: 'ball_shelf',     x1: 12.60, z1: 15.20, x2: 13.95, z2: 21.20 }
  ];
}

function createAdidasNpcs() {
  var routes = [
    // 1. Nhân viên Sneaker Wall
    {
      id: 'staff_sneaker', role: 'adidas_staff', shirt: '#111827', hair: '#1C1917', carryProp: 'shoebox',
      state: 'WALK', timer: 1.2, stepIdx: 0,
      pts: [
        { x: -7.5, y: 0, z: 3.4, yaw: -Math.PI * 0.5 },
        { x: -7.5, y: 0, z: 6.6, yaw: -Math.PI * 0.5 },
        { x: -2.4, y: 0, z: 6.2, yaw: Math.PI * 0.5 },
        { x: -7.5, y: 0, z: 4.5, yaw: -Math.PI * 0.5 }
      ]
    },
    // 2. Nhân viên Polo & Jogger T1
    {
      id: 'staff_apparel', role: 'adidas_staff', shirt: '#111827', hair: '#292524', carryProp: 'none',
      state: 'WALK', timer: 0, stepIdx: 0,
      pts: [
        { x: 1.6, y: 0, z: 6.4 }, { x: -2.6, y: 0, z: 11.4 },
        { x: 1.8, y: 0, z: 12.4 }, { x: 4.8, y: 0, z: 9.6 }
      ]
    },
    // 3. Nhân viên Maker Lab
    {
      id: 'staff_maker', role: 'adidas_staff', shirt: '#111827', hair: '#0F172A', carryProp: 'none',
      state: 'SIT', timer: 3.0, stepIdx: 0,
      pts: [{ x: 1.1, y: 0, z: 19.6 }, { x: 3.0, y: 0, z: 21.6 }]
    },
    // 4-5. Hai Thu Ngân POS Tầng 1
    {
      id: 'staff_cashier_1', role: 'adidas_staff', shirt: '#111827', hair: '#1C1917', carryProp: 'shoebox',
      state: 'SIT', timer: 999, stepIdx: 0,
      pts: [{ x: 12.15, y: 0, z: 2.5, yaw: -Math.PI * 0.5 }]
    },
    {
      id: 'staff_cashier_2', role: 'adidas_staff', shirt: '#111827', hair: '#451A03', carryProp: 'none',
      state: 'SIT', timer: 999, stepIdx: 0,
      pts: [{ x: 12.15, y: 0, z: 4.3, yaw: -Math.PI * 0.5 }]
    },
    // 6. Thủ môn Football Kick Zone
    {
      id: 'kick_goalkeeper', role: 'gk', shirt: '#16A34A', hair: '#111827', carryProp: 'none',
      state: 'SIT', timer: 999, stepIdx: 0,
      pts: [{ x: 10.0, y: 0, z: 22.0, yaw: Math.PI }]
    },
    // 7-12. 6 Khách hàng Tầng 1 (bao gồm khách đi lên xuống thang)
    {
      id: 'cust_sneaker', role: 'customer', shirt: '#DC2626', hair: '#1E1B18', carryProp: 'none',
      state: 'WALK', timer: 0, stepIdx: 0,
      pts: [
        { x: -7.8, y: 0, z: 4.2 }, { x: -7.8, y: 0, z: 6.4 },
        { x: -4.8, y: 0, z: 3.8 }, { x: -1.8, y: 0, z: 4.4 }
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
      id: 'cust_stairs', role: 'customer', shirt: '#0F766E', hair: '#292524', carryProp: 'none',
      state: 'WALK', timer: 0, stepIdx: 0,
      pts: [
        { x: -6.8, y: 0,   z: 6.8 }, { x: -8.5, y: 0,   z: 7.45 },
        { x: -8.5, y: 3.4, z: 13.35 }, { x: -6.2, y: 3.4, z: 13.35 },
        { x: -2.6, y: 3.4, z: 8.0 }, { x: 1.8, y: 3.4, z: 7.0 },
        { x: -6.2, y: 3.4, z: 13.35 }, { x: -8.5, y: 3.4, z: 13.35 },
        { x: -8.5, y: 0,   z: 7.45 }, { x: -2.8, y: 0,   z: 4.0 }
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
    },
    // 13-14. Thu ngân POS Tầng 2 & Khách ngắm đồ vòm Tầng 2
    {
      id: 'staff_pos_f2', role: 'adidas_staff', shirt: '#111827', hair: '#1C1917', carryProp: 'shoebox',
      state: 'SIT', timer: 999, stepIdx: 0,
      pts: [{ x: 4.95, y: 3.4, z: 6.8, yaw: -Math.PI * 0.5 }]
    },
    {
      id: 'cust_f2_upper', role: 'customer', shirt: '#0284C7', hair: '#1E1B18', carryProp: 'none',
      state: 'WALK', timer: 0, stepIdx: 0,
      pts: [
        { x: -1.8, y: 3.4, z: 2.2 }, { x: 2.2, y: 3.4, z: 6.8 },
        { x: -2.0, y: 3.4, z: 7.4 }, { x: -7.6, y: 3.4, z: 4.2 }
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
  var upperCashier = npcs[12];
  var particles = [];
  for (var i = 0; i < 24; i++) {
    particles.push({
      x: -8.5 + ((i * 37) % 210) * 0.10,
      y: 1.0 + ((i * 23) % 45) * 0.10,
      z: 1.2 + ((i * 19) % 215) * 0.10,
      phase: i * 0.63
    });
  }

  // 4 xe chạy 2 làn trên đại lộ phía trước cửa sổ mặt tiền (Z < 0)
  var streetVehicles = [
    { kind: 'taxi', x: -12.0, z: -4.1, dir:  1, speed: 3.8, col: [0.98, 0.78, 0.14, 1] },
    { kind: 'moto', x:  6.0,  z: -3.4, dir:  1, speed: 4.6, col: [0.85, 0.16, 0.16, 1] },
    { kind: 'car',  x:  13.0, z: -6.2, dir: -1, speed: 3.4, col: [0.15, 0.38, 0.85, 1] },
    { kind: 'moto', x: -4.0,  z: -6.8, dir: -1, speed: 4.9, col: [0.06, 0.58, 0.45, 1] }
  ];

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
    streetVehicles: streetVehicles,
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

function clampAdidasWalkPos(st, x, z, floorY) {
  var fy = typeof floorY === 'number' ? floorY : (st.pig.y >= 1.9 ? 3.4 : 0);
  var maxX = fy >= 1.9 ? 5.65 : 13.65;
  var maxZ = fy >= 1.9 ? 13.75 : 23.55;
  var nx = Math.max(-9.65, Math.min(maxX, x));
  var nz = Math.max(0.45, Math.min(maxZ, z));

  if (fy < 1.9) {
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
  }

  var boxes = getAdidasObstacles(fy);
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
  return { x: Math.max(-9.65, Math.min(maxX, nx)), z: Math.max(0.45, Math.min(maxZ, nz)) };
}

function routeAroundAdidasObstacles(startPt, endPt, floorY) {
  var fy = typeof floorY === 'number' ? floorY : 0;
  var obs = getAdidasObstacles(fy);
  var out = [];
  var cur = { x: startPt.x, z: startPt.z, y: fy };
  var pad = 0.28;
  var maxX = fy >= 1.9 ? 5.55 : 13.55;
  var maxZ = fy >= 1.9 ? 13.65 : 23.45;
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
      { x: hitBox.x1 - 0.44, z: hitBox.z1 - 0.44, y: fy },
      { x: hitBox.x2 + 0.44, z: hitBox.z1 - 0.44, y: fy },
      { x: hitBox.x1 - 0.44, z: hitBox.z2 + 0.44, y: fy },
      { x: hitBox.x2 + 0.44, z: hitBox.z2 + 0.44, y: fy }
    ];
    var best = null, bestScore = 99999;
    for (var ci = 0; ci < cands.length; ci++) {
      var cp = cands[ci];
      if (cp.x < -9.55 || cp.x > maxX || cp.z < 0.50 || cp.z > maxZ) continue;
      if (Math.hypot(cp.x - cur.x, cp.z - cur.z) < 0.25) continue;
      if (fy < 1.9) {
        if ((cur.x < 6.0 && cp.x > 6.0) || (cur.x > 6.0 && cp.x < 6.0)) continue;
        if (cur.x >= 6.0 && ((cur.z < 14.0 && cp.z > 14.0) || (cur.z > 14.0 && cp.z < 14.0))) continue;
      }
      var blockedFirst = false;
      for (var j = 0; j < obs.length; j++) {
        if (adidasSegIntersectsBox(cur.x, cur.z, cp.x, cp.z, obs[j], 0.18)) {
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
  out.push({ x: endPt.x, z: endPt.z, y: fy });
  return out;
}

function planAdidasRealtimePath(st, tx, targetFloorY, tz, pendingAction) {
  var p = st.pig;
  p.seated = false;
  p.eating = false;
  p.pendingAction = pendingAction || null;

  var fyTarget = (typeof targetFloorY === 'number' && targetFloorY >= 1.9) ? 3.4 : 0;
  var isStairTarget = (tx >= -9.6 && tx <= -7.4 && tz >= 8.0 && tz <= 12.8 && targetFloorY > 0.05 && targetFloorY < 3.35);
  var cl = isStairTarget
    ? { x: Math.max(-9.3, Math.min(-7.7, tx)), z: Math.max(8.05, Math.min(12.75, tz)) }
    : clampAdidasWalkPos(st, tx, tz, fyTarget);
  tx = cl.x; tz = cl.z;

  var onStairsNow = (p.x >= -9.65 && p.x <= -7.35 && p.z > 8.05 && p.z < 12.75 && p.y > 0.15 && p.y < 3.25);
  if (onStairsNow || isStairTarget) {
    var wps = [];
    if (onStairsNow) {
      if (isStairTarget) {
        wps.push({ x: tx, y: targetFloorY, z: tz });
      } else if (fyTarget >= 3.0) {
        wps.push({ x: -8.5, y: 3.4, z: 13.35 });
        wps.push({ x: -6.2, y: 3.4, z: 13.35 });
        var segU = routeAroundAdidasObstacles({ x: -6.2, z: 13.35, y: 3.4 }, { x: tx, z: tz, y: 3.4 }, 3.4);
        for (var ui = 0; ui < segU.length; ui++) wps.push(segU[ui]);
      } else {
        wps.push({ x: -8.5, y: 0, z: 7.45 });
        if (tx >= 6.0 || tz >= 14.0) {
          wps.push({ x: -2.0, y: 0, z: 7.8 });
          if (tx >= 6.0 && tz < 14.0) { wps.push({ x: 5.05, y: 0, z: 9.7 }); wps.push({ x: 6.95, y: 0, z: 9.7 }); }
          else if (tz >= 14.0) { wps.push({ x: -1.8, y: 0, z: 13.8 }); }
        }
        wps.push({ x: tx, y: 0, z: tz });
      }
    } else {
      if (p.y >= 1.9) {
        var preDown = routeAroundAdidasObstacles({ x: p.x, z: p.z, y: 3.4 }, { x: -6.2, z: 13.35, y: 3.4 }, 3.4);
        for (var di = 0; di < preDown.length; di++) wps.push(preDown[di]);
        wps.push({ x: -8.5, y: 3.4, z: 13.35 });
      } else {
        var preUp = routeAroundAdidasObstacles({ x: p.x, z: p.z, y: 0 }, { x: -8.5, z: 7.45, y: 0 }, 0);
        for (var pi2 = 0; pi2 < preUp.length; pi2++) wps.push(preUp[pi2]);
      }
      wps.push({ x: tx, y: targetFloorY, z: tz });
    }
    p.waypoints = wps;
    p.targetX = wps[0].x; p.targetZ = wps[0].z;
    p.walking = true;
    return;
  }

  if (typeof planNavGraphRealtimePath === 'function') {
    planNavGraphRealtimePath(ADIDAS_NAV_GRAPH, st, tx, fyTarget, tz, { pendingAction: pendingAction });
    if (p.waypoints && p.waypoints.length > 0) {
      var routed = [];
      var prev = { x: p.x, z: p.z, y: p.y >= 1.9 ? 3.4 : 0 };
      for (var wi = 0; wi < p.waypoints.length; wi++) {
        var wp = p.waypoints[wi];
        var wpFy = (typeof wp.y === 'number' && wp.y >= 1.9) ? 3.4 : 0;
        var sameFloor = Math.abs(prev.y - wpFy) < 0.5;
        var sameWing = wpFy >= 1.9 || (
          !((prev.x < 6.0 && wp.x > 6.0) || (prev.x > 6.0 && wp.x < 6.0)) &&
          !(prev.x >= 6.0 && ((prev.z < 14.0 && wp.z > 14.0) || (prev.z > 14.0 && wp.z < 14.0)))
        );
        if (sameFloor && sameWing) {
          var segs = routeAroundAdidasObstacles(prev, wp, wpFy);
          for (var si = 0; si < segs.length; si++) routed.push(segs[si]);
        } else {
          routed.push({ x: wp.x, z: wp.z, y: wpFy });
        }
        prev = routed[routed.length - 1];
      }
      routed[routed.length - 1].x = tx;
      routed[routed.length - 1].z = tz;
      routed[routed.length - 1].y = fyTarget;
      p.waypoints = routed;
      p.targetX = routed[0].x; p.targetZ = routed[0].z;
      p.walking = true;
    }
    return;
  }

  var segFallback = routeAroundAdidasObstacles({ x: p.x, z: p.z, y: p.y || 0 }, { x: tx, z: tz, y: fyTarget }, fyTarget);
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
      n.y = typeof tgt.y === 'number' ? tgt.y : getAdidasSurfaceY(n.x, n.z, n.y);
      n.stepIdx = (n.stepIdx + 1) % n.pts.length;
      n.state = 'SIT';
      n.moving = false;
      n.timer = n.pts.length === 1 ? 999 : (1.8 + (i % 4) * 0.7);
      if (typeof tgt.yaw === 'number') n.yaw = tgt.yaw;
    } else {
      n.moving = true;
      var onStNpc = (n.x >= -9.6 && n.x <= -7.4 && n.z >= 8.0 && n.z <= 12.8);
      var spd = Math.min(d, (onStNpc ? 1.30 : 1.55) * dt);
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

  // Xe chạy 2 làn ngoài cửa sổ mặt tiền Z < 0
  if (st.streetVehicles) {
    for (var svi = 0; svi < st.streetVehicles.length; svi++) {
      var vh = st.streetVehicles[svi];
      vh.x += vh.dir * vh.speed * dt;
      if (vh.dir > 0 && vh.x > 22) vh.x = -20;
      if (vh.dir < 0 && vh.x < -20) vh.x = 22;
    }
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
        } else if (p.pendingAction === 'sale_deal') {
          p.boughtSamba = true;
          p.outfit = p.y >= 1.9 ? 'adidas_polo' : 'adidas_jacket';
          p.yaw = 0;
          st.actionFlashText = '🏷️ SĂN DEAL SALE -50% · NHẬN TÚI 3 SỌC!';
          st.actionFlashUntil = st.t + 3.2;
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
          st.actionFlashText = '👟 SAMBA OG · ADILETTE · ULTRABOOST';
          st.actionFlashUntil = st.t + 2.8;
        } else if (p.pendingAction === 'kick_spot') {
          if (st.kickGame) { st.kickGame.active = true; st.kickGame.justEnteredAt = st.t; }
          p.yaw = 0;
          st.actionFlashText = '⚽ CHẠM GÓC GÔN HOẶC BẤM NÚT ĐỂ SÚT!';
          st.actionFlashUntil = st.t + 3.0;
        } else if (p.pendingAction === 'exit_adidas') {
          st.exiting = true;
        }
        p.pendingAction = null;
      }
    } else {
      var onStairs = (p.x >= -9.65 && p.x <= -7.35 && p.z > 7.95 && p.z < 12.85);
      var spd = Math.min(dist, (onStairs ? 2.6 : 3.6) * dt);
      var nx = p.x + (dx / dist) * spd;
      var nz = p.z + (dz / dist) * spd;
      if (onStairs) {
        p.x = Math.max(-9.45, Math.min(-7.55, nx));
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
    st.room = p.y >= 1.9 ? 'upper' : (p.x >= 6.0 ? (p.z >= 14.0 ? 'kick_zone' : 'fitting') : (p.z >= 14.0 ? 'apparel_sports' : 'hall'));
  }

  // Mini-Game Sút Bóng 3D
  if (st.kickGame) {
    var kg = st.kickGame;
    var inSpot = (p.y < 1.0 && p.x >= 7.2 && p.x <= 12.8 && p.z >= 15.6 && p.z <= 21.8);
    if (!inSpot && !kg.ball.shooting) kg.active = false;
    else if (p.y < 1.0 && Math.hypot(p.x - 10.0, p.z - 17.8) < 1.35 && !p.walking) {
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
      if (kb.z >= 22.15) {
        var blocked = Math.abs(kb.x - kb.goalieX) < 0.62 && kb.y < 1.55;
        var inFrame = (kb.x >= 8.2 && kb.x <= 11.8 && kb.y <= 1.85);
        if (blocked) {
          kb.shooting = false; kg.streak = 0; kb.resultText = '🧤 THỦ MÔN CẢN PHÁ!';
          st.actionFlashText = '🧤 SUÝT VÀO! CHỈNH GÓC KHÁC SÚT LẠI!'; st.actionFlashUntil = st.t + 2.4;
        } else if (inFrame) {
          kb.shooting = false; kg.goals += 1; kg.streak += 1; kg.netRipple = 1.0;
          kb.resultText = '⚽ VÀOOO! (' + kg.goals + ' BÀN)';
          st.actionFlashText = '⚽ VÀOOO! CHUỖI ' + kg.streak + ' BÀN THẮNG!'; st.actionFlashUntil = st.t + 3.0;
          for (var sp = 0; sp < 14; sp++) {
            kg.sparks.push({ x: kb.x, y: Math.max(0.5, kb.y), z: 22.4, vx: Math.sin(sp * 1.9) * 2.4, vy: 1.8 + (sp % 4) * 0.65, vz: -0.9 + Math.cos(sp * 1.3) * 0.9, t: 0 });
          }
        } else if (kb.z >= 23.4 || kb.shootT > 1.4) {
          kb.shooting = false; kg.streak = 0; kb.resultText = 'BÓNG CHỆCH CỘT DỌC!';
          st.actionFlashText = '😬 CHỆCH KHUNG THÀNH! CANH LẠI GÓC SÚT!'; st.actionFlashUntil = st.t + 2.2;
        }
        if (!kb.shooting) { kb.x = 10.0; kb.y = 0.22; kb.z = 18.6; }
      }
    }
    if (kg.netRipple > 0) kg.netRipple = Math.max(0, kg.netRipple - dt * 1.4);
    for (var ksi = kg.sparks.length - 1; ksi >= 0; ksi--) {
      var ksp = kg.sparks[ksi];
      ksp.t += dt; ksp.x += ksp.vx * dt; ksp.y += ksp.vy * dt; ksp.z += ksp.vz * dt; ksp.vy -= 4.5 * dt;
      if (ksp.t > 1.1) kg.sparks.splice(ksi, 1);
    }
  }

  p.wearingJacket = (p.outfit === 'adidas_jacket');
  var targetDoor = (p.y < 1.9 && p.x < 6.0 && st.exiting) ? 0.92 : 0.0;
  st.rightDoorOpen += (targetDoor - st.rightDoorOpen) * Math.min(1, dt * 6.0);
  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.5);

  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== 2. CAMERA SPRING-ARM NỘI SUY 2 TẦNG & RAYCAST 3D CHỐNG XUYÊN TƯỜNG ==================== */
function computeAdidasWebglCamera(cam, st) {
  var p = st.pig;
  var stairT = Math.max(0, Math.min(1, (p.y || 0) / 3.4));
  var underUpperSlab = (p.x < 6.0 && p.z < 14.0);
  var maxCamY = underUpperSlab ? (3.34 + stairT * 4.46) : 4.65;
  var navCfg = {
    wallMargin: 0.38,
    zones: ADIDAS_NAV_GRAPH.zones,
    dividerWalls: ADIDAS_NAV_GRAPH.dividerWalls,
    outerBounds: { minX: -10.0, maxX: 14.0, minZ: 0.0, maxZ: 24.0, minY: 0.45, maxY: maxCamY }
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
  // Trần tầng 2 / sàn tầng 2 chặn tia nhìn từ tầng 1 xuyên qua
  if (Math.abs(dy) > 0.02) {
    var tSlab = (3.35 - oy) / dy;
    if (tSlab > 0.25 && tSlab < maxVisibleT) {
      var sx2 = ox + dx * tSlab, sz2 = oz + dz * tSlab;
      var inStairHole = (sx2 >= -9.65 && sx2 <= -7.35 && sz2 >= 7.95 && sz2 <= 12.85);
      if (sx2 >= -10.0 && sx2 <= 6.0 && sz2 >= 0.0 && sz2 <= 14.0 && !inStairHole) {
        maxVisibleT = Math.min(maxVisibleT, tSlab + 0.12);
      }
    }
  }

  // 1. Sút bóng trực tiếp vào Gôn 3D khi ở kick_zone
  if (st.kickGame && st.kickGame.active && !st.kickGame.ball.shooting && dz > 0.05) {
    var tGoal = (22.3 - oz) / dz;
    if (tGoal > 0.4 && tGoal <= maxVisibleT + 0.2) {
      var gx = ox + dx * tGoal, gy = oy + dy * tGoal;
      if (gx >= 7.8 && gx <= 12.2 && gy >= 0.0 && gy <= 2.35) {
        return { kind: 'goal_shoot', aimOffset: (gx - 10.0) * 0.22 };
      }
    }
  }

  // 2. Cầu thang 14 bậc (rayRampQuad)
  if (typeof rayRampQuad === 'function') {
    var stairHit = rayRampQuad(ox, oy, oz, dx, dy, dz, ADIDAS_NAV_GRAPH.ramps[0]);
    if (stairHit && stairHit.t <= maxVisibleT + 0.2) {
      return { kind: 'stair', x: stairHit.x, y: stairHit.y, z: stairHit.z };
    }
  }

  // 3. Cửa mặt tiền Z = 0 -> bước ra Đại lộ Sài Gòn
  if (dz < -0.02 && oy < 3.4) {
    var td = (0.20 - oz) / dz;
    if (td > 0.3 && td <= maxVisibleT + 0.2) {
      var ddx = ox + dx * td, ddy = oy + dy * td;
      if (ddy >= 0 && ddy <= 3.0 && Math.abs(ddx) <= 1.65) {
        return { kind: 'exit', action: 'exit_adidas', x: 0, y: 0, z: 0.90 };
      }
    }
  }

  // 4. Sàn Lầu 2 (Y = 3.4, trừ lỗ thang) & Sàn Tầng 1 (Y = 0)
  var tFloor = 9999, floorHit = null;
  if (dy < -0.025) {
    var tf2 = (3.4 - oy) / dy;
    if (oy >= 2.2 && tf2 > 0.2 && tf2 <= maxVisibleT + 0.15) {
      var fx2 = ox + dx * tf2, fz2 = oz + dz * tf2;
      var inHole = (fx2 >= -9.65 && fx2 <= -7.35 && fz2 >= 7.95 && fz2 <= 12.85);
      if (fx2 >= -9.9 && fx2 <= 5.9 && fz2 >= 0.3 && fz2 <= 13.9 && !inHole) {
        tFloor = tf2;
        floorHit = { kind: 'floor', x: fx2, y: 3.4, z: fz2 };
      }
    }
    if (!floorHit) {
      var tf = (0 - oy) / dy;
      if (tf > 0.2 && tf <= maxVisibleT + 0.2) {
        var x1 = ox + dx * tf, z1 = oz + dz * tf;
        if (x1 >= -9.9 && x1 <= 13.9 && z1 >= 0.3 && z1 <= 23.9) {
          tFloor = tf;
          floorHit = { kind: 'floor', x: x1, y: 0, z: z1 };
        }
      }
    }
  }

  // 5. Hotspots Tầng 1 & Tầng 2 (theo tia gần nhất & không xuyên tường/trần)
  var hotspots = [
    // Tầng 1
    { cx: -9.1, cy: 1.3, cz: 4.2,  rad: 1.5, target: { kind: 'hotspot', action: 'inspect_shoes', x: -7.6, y: 0, z: 4.2 } },
    { cx:  0.0, cy: 0.8, cz: 6.3,  rad: 1.4, target: { kind: 'hotspot', action: 'inspect_shoes', x: 0.0,  y: 0, z: st.pig.z >= 6.3 ? 8.1 : 4.5 } },
    { cx: -4.7, cy: 0.6, cz: 2.3,  rad: 1.2, target: { kind: 'hotspot', action: 'inspect_shoes', x: -4.7, y: 0, z: 3.6 } },
    { cx:  3.1, cy: 1.1, cz: 6.45, rad: 1.3, target: { kind: 'hotspot', action: 'try_polo',      x: 1.6,  y: 0, z: 6.45 } },
    { cx:  3.1, cy: 1.1, cz: 2.8,  rad: 1.3, target: { kind: 'hotspot', action: 'sale_deal',     x: 1.6,  y: 0, z: 2.8 } },
    { cx: -4.7, cy: 1.0, cz: 11.3, rad: 1.3, target: { kind: 'hotspot', action: 'try_jogger',    x: -3.0, y: 0, z: 11.3 } },
    { cx: -9.1, cy: 1.2, cz: 18.0, rad: 1.4, target: { kind: 'hotspot', action: 'try_kit',       x: -7.6, y: 0, z: 18.0 } },
    { cx:  3.0, cy: 1.0, cz: 19.7, rad: 1.4, target: { kind: 'hotspot', action: 'maker_custom',  x: 1.0,  y: 0, z: 19.7 } },
    { cx: 13.4, cy: 1.4, cz: 9.8,  rad: 1.6, target: { kind: 'hotspot', action: 'try_jacket',    x: 11.8, y: 0, z: 9.8 } },
    { cx: 10.0, cy: 1.1, cz: 7.2,  rad: 1.3, target: { kind: 'hotspot', action: 'try_jacket',    x: 10.0, y: 0, z: 8.6 } },
    { cx: 11.0, cy: 1.1, cz: 3.4,  rad: 1.6, target: { kind: 'hotspot', action: 'buy_bag',       x: 9.4,  y: 0, z: 3.4 } },
    { cx: 10.0, cy: 1.1, cz: 22.4, rad: 2.1, target: { kind: 'hotspot', action: 'kick_spot',     x: 10.0, y: 0, z: 17.8 } },
    // Tầng 2 (Y = 3.4)
    { cx: -3.2, cy: 4.4, cz: 3.5,  rad: 1.3, target: { kind: 'hotspot', action: 'try_polo',      x: -1.6, y: 3.4, z: 3.5 } },
    { cx: -5.3, cy: 4.5, cz: 6.5,  rad: 1.3, target: { kind: 'hotspot', action: 'try_jogger',    x: -3.6, y: 3.4, z: 6.5 } },
    { cx: -0.1, cy: 4.5, cz: 10.2, rad: 1.5, target: { kind: 'hotspot', action: 'sale_deal',     x: 2.0,  y: 3.4, z: 10.2 } },
    { cx:  4.5, cy: 4.5, cz: 6.9,  rad: 1.5, target: { kind: 'hotspot', action: 'buy_bag',       x: 2.5,  y: 3.4, z: 6.9 } }
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
  if (p.y >= 1.9) {
    if (Math.hypot(p.x + 0.1, p.z - 10.2) < 2.6) {
      return { id: 'sale_deal', label: '🏷️ Săn Deal Sale -50% & Nhận Túi!' };
    }
    if (p.x > 1.8 && p.z >= 3.8 && p.z <= 10.2) {
      return { id: 'buy_bag', label: '🛍️ Thanh Toán POS Lầu 2' };
    }
    if (Math.hypot(p.x + 3.2, p.z - 3.5) < 2.4 || Math.hypot(p.x - 0.3, p.z - 4.5) < 2.0) {
      return { id: 'try_polo', label: p.outfit === 'adidas_polo' ? '👔 Cởi Áo Polo' : '👔 Thử Áo Polo 3 Sọc' };
    }
    if (Math.hypot(p.x + 5.3, p.z - 6.5) < 2.2) {
      return { id: 'try_jogger', label: p.outfit === 'adidas_jogger' ? '👖 Cởi Quần Jogger' : '👖 Thử Quần Jogger Nỉ' };
    }
    return null;
  }
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
  if (Math.hypot(p.x - 3.1, p.z - 2.8) < 2.2) {
    return { id: 'sale_deal', label: '🏷️ Săn Deal Sale -50% Tầng 1!' };
  }
  if (Math.hypot(p.x - 3.1, p.z - 6.45) < 2.2) {
    return { id: 'try_polo', label: p.outfit === 'adidas_polo' ? '👔 Cởi Áo Polo' : '👔 Thử Áo Polo Cổ Bẻ' };
  }
  if (Math.hypot(p.x + 4.7, p.z - 11.3) < 2.3) {
    return { id: 'try_jogger', label: p.outfit === 'adidas_jogger' ? '👖 Cởi Quần Jogger' : '👖 Thử Quần Jogger + Samba' };
  }
  if (p.x < -6.4 && p.z >= 14.2) {
    return { id: 'try_kit', label: p.outfit === 'adidas_kit' ? '⚽ Cởi Áo Đấu #10' : '⚽ Thử Áo Đấu Bóng Đá #10' };
  }
  if (Math.hypot(p.x - 3.0, p.z - 19.7) < 2.6) {
    return { id: 'maker_custom', label: '🎨 Custom In Số 10 · Maker Lab' };
  }
  if ((p.x < -6.4 && p.z < 7.8) || Math.hypot(p.x, p.z - 6.3) < 2.3) {
    return { id: 'inspect_shoes', label: '👟 Ngắm Giày & Dép Adilette' };
  }
  if (p.z <= 2.2 && Math.abs(p.x) <= 2.6) {
    return { id: 'exit_adidas', label: '🚪 Ra lại Đại Lộ Sài Gòn' };
  }
  return null;
}

/* ==================== 3. HELPERS DỰNG GIÁ TREO ĐA HƯỚNG, KHU SALE, XE CỘ & CỬA SỔ BANNER ==================== */
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
  dm('box', 'white', x, y + 0.32, z, 0, ry, 0, 0.04, 0.10, 0.04, { tint: [0.85, 0.72, 0.32, 1] });
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

// Giá treo chữ A 2 mặt quay nhiều hướng
function drawAdidasAFrameRack3D(wgl, x, baseY, z, ry, colA, colB, colC) {
  var dm = wgl.drawMesh;
  var sx = Math.cos(ry), sz = -Math.sin(ry);
  dm('box', 'limWood', x, baseY + 0.08, z, 0, ry, 0, 1.9, 0.16, 0.95, { tint: [0.95, 0.82, 0.68, 1] });
  dm('box', 'white', x - sx * 0.85, baseY + 0.88, z - sz * 0.85, 0, ry, 0, 0.06, 1.56, 0.06, { tint: [0.16, 0.18, 0.22, 1] });
  dm('box', 'white', x + sx * 0.85, baseY + 0.88, z + sz * 0.85, 0, ry, 0, 0.06, 1.56, 0.06, { tint: [0.16, 0.18, 0.22, 1] });
  dm('cyl', 'white', x, baseY + 1.62, z, Math.PI * 0.5, 0, ry + Math.PI * 0.5, 0.035, 1.76, 0.035, { tint: [0.85, 0.72, 0.32, 1] });
  drawAdidasHangingGarment3D(wgl, x - sx * 0.52, baseY + 1.24, z - sz * 0.52, ry, colA, true, [1, 1, 1, 1]);
  drawAdidasHangingGarment3D(wgl, x,              baseY + 1.24, z,              ry, colB, false);
  drawAdidasHangingGarment3D(wgl, x + sx * 0.52, baseY + 1.24, z + sz * 0.52, ry, colC, true, [0.06, 0.09, 0.16, 1]);
}

// Giá tròn xoay 360° treo 8 móc áo đủ các hướng
function drawAdidasRoundCarouselRack3D(wgl, x, baseY, z) {
  var dm = wgl.drawMesh;
  dm('cyl', 'limWood', x, baseY + 0.08, z, 0, 0, 0, 1.35, 0.16, 1.35, { tint: [0.98, 0.86, 0.70, 1] });
  dm('cyl', 'white', x, baseY + 0.88, z, 0, 0, 0, 0.08, 1.60, 0.08, { tint: [0.18, 0.20, 0.24, 1], specPow: 64 });
  dm('torus', 'white', x, baseY + 1.54, z, Math.PI * 0.5, 0, 0, 1.24, 1.24, 0.25, { tint: [0.88, 0.76, 0.38, 1], specPow: 80 });
  var cols = [[0.12, 0.23, 0.54, 1], [0.86, 0.15, 0.15, 1], [0.97, 0.98, 0.99, 1], [0.07, 0.09, 0.15, 1], [0.06, 0.46, 0.43, 1], [0.96, 0.62, 0.04, 1]];
  for (var k = 0; k < 6; k++) {
    var ang = k * (Math.PI / 3);
    var gx = x + Math.sin(ang) * 0.58, gz = z + Math.cos(ang) * 0.58;
    drawAdidasHangingGarment3D(wgl, gx, baseY + 1.18, gz, ang, cols[k], k % 2 === 0, [1, 1, 1, 1]);
  }
}

// Gian SALE OUTLET -50% Đỏ-Vàng
function drawAdidasSaleRack3D(wgl, x, baseY, z, ry) {
  var dm = wgl.drawMesh;
  dm('box', 'white', x, baseY + 0.42, z, 0, ry, 0, 1.75, 0.84, 1.15, { tint: [0.60, 0.11, 0.11, 1] });
  dm('box', 'white', x, baseY + 0.86, z, 0, ry, 0, 1.85, 0.08, 1.25, { tint: [0.98, 0.80, 0.08, 1] });
  dm('quad', 'saleBannerTex', x, baseY + 1.62, z, 0, ry, 0, 1.68, 0.88, 1, { tint: [1, 1, 1, 1], emissive: 0.45 });
  drawAdidasHangingGarment3D(wgl, x - 0.52, baseY + 1.15, z + 0.35, ry, [0.86, 0.15, 0.15, 1], true, [1, 1, 1, 1]);
  drawAdidasHangingJogger3D(wgl,  x + 0.52, baseY + 1.15, z + 0.35, ry, [0.07, 0.09, 0.15, 1]);
}

function drawAdidasMannequin3D(wgl, x, baseY, z, topCol, pantCol, stripeCol) {
  var dm = wgl.drawMesh;
  dm('box', 'limWood', x, baseY + 0.12, z, 0, 0, 0, 0.84, 0.24, 0.84, { tint: [1.05, 0.90, 0.72, 1] });
  dm('box', 'white',   x, baseY + 0.25, z, 0, 0, 0, 0.76, 0.04, 0.76, { tint: [0.95, 0.74, 0.22, 1], emissive: 0.45 });
  dm('box', 'white', x - 0.10, baseY + 0.62, z, 0, 0, 0, 0.14, 0.66, 0.16, { tint: pantCol });
  dm('box', 'white', x + 0.10, baseY + 0.62, z, 0, 0, 0, 0.14, 0.66, 0.16, { tint: pantCol });
  dm('box', 'white', x - 0.10, baseY + 0.31, z + 0.04, 0, 0, 0, 0.15, 0.10, 0.26, { tint: [1, 0.98, 0.94, 1] });
  dm('box', 'white', x + 0.10, baseY + 0.31, z + 0.04, 0, 0, 0, 0.15, 0.10, 0.26, { tint: [1, 0.98, 0.94, 1] });
  dm('box', 'white', x, baseY + 1.24, z, 0, 0, 0, 0.46, 0.58, 0.24, { tint: topCol });
  dm('box', 'white', x - 0.28, baseY + 1.22, z, 0, 0, 0, 0.11, 0.50, 0.14, { tint: topCol });
  dm('box', 'white', x + 0.28, baseY + 1.22, z, 0, 0, 0, 0.11, 0.50, 0.14, { tint: topCol });
  dm('box', 'white', x - 0.32, baseY + 1.22, z, 0, 0, 0, 0.04, 0.46, 0.15, { tint: stripeCol || [1, 1, 1, 1] });
  dm('box', 'white', x + 0.32, baseY + 1.22, z, 0, 0, 0, 0.04, 0.46, 0.15, { tint: stripeCol || [1, 1, 1, 1] });
  dm('sphere', 'white', x, baseY + 1.72, z, 0, 0, 0, 0.22, 0.24, 0.22, { tint: [0.92, 0.90, 0.86, 1], specPow: 64 });
}

function drawAdidasStreetVehicle3D(wgl, vh) {
  var dm = wgl.drawMesh;
  var ry = vh.dir > 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
  if (vh.kind === 'moto') {
    dm('box', 'white', vh.x, 0.36, vh.z, 0, ry, 0, 0.38, 0.44, 0.95, { tint: vh.col });
    dm('cyl', 'white', vh.x - vh.dir * 0.35, 0.20, vh.z, 0, 0, Math.PI * 0.5, 0.18, 0.12, 0.18, { tint: [0.08, 0.08, 0.10, 1] });
    dm('cyl', 'white', vh.x + vh.dir * 0.35, 0.20, vh.z, 0, 0, Math.PI * 0.5, 0.18, 0.12, 0.18, { tint: [0.08, 0.08, 0.10, 1] });
  } else {
    dm('box', 'white', vh.x, 0.45, vh.z, 0, ry, 0, 1.35, 0.58, 2.75, { tint: vh.col, specPow: 48 });
    dm('box', 'white', vh.x - vh.dir * 0.1, 0.92, vh.z, 0, ry, 0, 1.15, 0.42, 1.45, { tint: [0.88, 0.94, 0.99, 1] });
    dm('cyl', 'white', vh.x - 0.8, 0.22, vh.z + 0.55, Math.PI * 0.5, 0, 0, 0.22, 0.18, 0.22, { tint: [0.08, 0.08, 0.10, 1] });
    dm('cyl', 'white', vh.x + 0.8, 0.22, vh.z + 0.55, Math.PI * 0.5, 0, 0, 0.22, 0.18, 0.22, { tint: [0.08, 0.08, 0.10, 1] });
  }
}

function getAdidasSkyKey() {
  var hr = (typeof Date !== 'undefined') ? new Date().getHours() : 10;
  if (hr >= 16 && hr < 19) return 'skySunsetTex';
  if (hr >= 19 || hr < 6) return 'skyNightTex';
  return 'skyDayTex';
}

function renderAdidasWebglScene(wgl, cam, st, W, H) {
  computeAdidasWebglCamera(cam, st);

  var adidasAtmo = {
    clearColor: [0.18, 0.22, 0.28, 1.0],
    hemiLow: [0.38, 0.32, 0.24],
    hemiHigh: [0.86, 0.78, 0.64],
    sunDir: [0.22, 0.80, 0.56],
    sunCol: [1.08, 0.96, 0.78],
    wrapBias: 0.48,
    lights: [
      { pos: [-2.0, 3.2, 6.2],  col: [1.12, 0.94, 0.64] },
      { pos: [-2.0, 6.6, 7.0],  col: [1.10, 0.94, 0.68] },
      { pos: [10.4, 3.2, 6.8],  col: [1.10, 0.88, 0.58] },
      { pos: [10.0, 3.6, 19.5], col: [1.10, 1.12, 0.95] }
    ],
    outdoorRect: [0.0, 0.0, 0.0, 0.0],
    fogCol: [0.22, 0.18, 0.14],
    fogParams: [22.0, 46.0, 0.18]
  };
  wgl.beginFrame(W, H, cam, adidasAtmo);
  var dm = wgl.drawMesh;

  // ==================== A. NGOẠI CẢNH ĐẠI LỘ SÀI GÒN & BẦU TRỜI NGOÀI CỬA SỔ (Z < 0) ====================
  var skyKey = getAdidasSkyKey();
  dm('quad', skyKey, -2.0, 5.2, -20.5, 0, 0, 0, 48.0, 14.0, 1, { tint: [1, 1, 1, 1], emissive: 0.95 });
  // Vỉa hè đá & Bậc tam cấp trước cửa chính + Đường nhựa 2 làn + dải cây xa
  dm('box', 'mallTerrazzoFloor', 2.0, -0.06, -1.45, 0, 0, 0, 42.0, 0.12, 2.9, { tint: [0.95, 0.90, 0.82, 1], us: 16, vs: 2 });
  dm('box', 'white', 0.0, 0.02, -0.45, 0, 0, 0, 3.4, 0.08, 0.8, { tint: [0.85, 0.87, 0.90, 1] });
  dm('box', 'roadAsphaltTex', 2.0, -0.08, -5.5, 0, 0, 0, 46.0, 0.10, 5.4, { tint: [1, 1, 1, 1], us: 10, vs: 1 });
  dm('box', 'turfPitchTex',   2.0, -0.08, -14.2, 0, 0, 0, 48.0, 0.10, 12.0, { tint: [0.85, 0.90, 0.82, 1], us: 8, vs: 3 });
  // 2 dãy nhà phố cánh hông & hàng cây bờ kè che kín góc nhìn xiên qua cửa sổ
  dm('box', 'mallWarmWall', -14.5, 3.6, -7.5, 0, 0, 0, 8.5, 7.6, 15.0, { tint: [0.92, 0.88, 0.80, 1], us: 3, vs: 3 });
  dm('box', 'mallWarmWall',  17.5, 3.6, -7.5, 0, 0, 0, 8.5, 7.6, 15.0, { tint: [0.88, 0.84, 0.78, 1], us: 3, vs: 3 });
  for (var tx = -12; tx <= 14; tx += 5.5) {
    dm('cyl', 'limWood', tx, 1.3, -9.2, 0, 0, 0, 0.25, 2.6, 0.25, { tint: [0.45, 0.28, 0.16, 1] });
    dm('sphere', 'turfPitchTex', tx, 3.0, -9.2, 0, 0, 0, 2.2, 1.9, 2.2, { tint: [0.32, 0.74, 0.36, 1] });
  }
  if (st.streetVehicles) {
    for (var vi = 0; vi < st.streetVehicles.length; vi++) drawAdidasStreetVehicle3D(wgl, st.streetVehicles[vi]);
  }
  // 2 Giàn hoa giấy hồng rực 2 bên mặt tiền (bám sát Hub Banner)
  dm('box', 'bougainvilleaTex', -9.45, 1.6, -0.35, 0, 0, 0, 1.1, 3.2, 0.55, { tint: [1, 1, 1, 1] });
  dm('box', 'bougainvilleaTex',  5.65, 1.6, -0.35, 0, 0, 0, 0.8, 3.2, 0.55, { tint: [1, 1, 1, 1] });

  // ==================== B. KIẾN TRÚC 2 TẦNG MEGA MALL & MẶT TIỀN CỬA SỔ BANNER ====================
  // 1. Sàn Tầng 1
  dm('box', 'mallTerrazzoFloor', -2.0, -0.05, 12.0, 0, 0, 0, 16.0, 0.10, 24.0, { tint: [1, 1, 1, 1], us: 8, vs: 12 });
  dm('box', 'limWood', 0.0, 0.008, 12.0, 0, 0, 0, 2.4, 0.014, 23.2, { tint: [0.85, 0.70, 0.54, 1], us: 2, vs: 12 });
  dm('box', 'limWood', 10.0, -0.05, 7.0, 0, 0, 0, 8.0, 0.10, 14.0, { tint: [1.12, 0.94, 0.76, 1], us: 5, vs: 8 });
  dm('box', 'fittingGreenWall', 11.4, 0.008, 9.8, 0, 0, 0, 3.2, 0.014, 4.4, { tint: [1.1, 1.15, 1.05, 1] });
  dm('box', 'mallTerrazzoFloor', 10.0, -0.05, 19.0, 0, 0, 0, 8.0, 0.10, 10.0, { tint: [0.95, 0.95, 0.92, 1], us: 4, vs: 5 });
  dm('box', 'turfPitchTex', 10.0, 0.012, 19.2, 0, 0, 0, 6.2, 0.014, 8.2, { tint: [1, 1, 1, 1] });

  // 2. Sàn Tầng 2 ('upper': X ∈ [-10.0, 6.0], Z ∈ [0, 14.0], Y = 3.35) CHIA 4 MẢNG KHỚP LỖ THANG X ∈ [-9.65, -7.35], Z ∈ [7.95, 12.85]
  dm('box', 'limWood', -0.675, 3.35, 7.0,   0, 0, 0, 13.35, 0.12, 14.0,  { tint: [1.12, 0.96, 0.78, 1], us: 6, vs: 6 });
  dm('box', 'limWood', -9.825, 3.35, 7.0,   0, 0, 0, 0.35,  0.12, 14.0,  { tint: [1.12, 0.96, 0.78, 1], us: 0.5, vs: 6 });
  dm('box', 'limWood', -8.50,  3.35, 3.975, 0, 0, 0, 2.30,  0.12, 7.95,  { tint: [1.12, 0.96, 0.78, 1], us: 1.5, vs: 4 });
  dm('box', 'limWood', -8.50,  3.35, 13.425,0, 0, 0, 2.30,  0.12, 1.15,  { tint: [1.12, 0.96, 0.78, 1], us: 1.5, vs: 1 });
  dm('box', 'velvetCurtain', 0.2, 3.42, 7.0, 0, 0, 0, 2.6, 0.014, 9.6, { tint: [1.05, 0.86, 0.76, 1] });

  // 3. Tường Bao Ngoài & Trần 2 Cao Độ
  dm('box', 'mallWarmWall', -10.08, 3.9, 7.0,   0, 0, 0, 0.16, 7.8,  14.0, { tint: [1, 1, 1, 1], us: 6, vs: 3 });
  dm('box', 'mallWarmWall', -10.08, 2.32, 19.0, 0, 0, 0, 0.16, 4.65, 10.0, { tint: [1, 1, 1, 1], us: 4, vs: 2 });
  dm('box', 'mallWarmWall',  14.08, 2.32, 12.0, 0, 0, 0, 0.16, 4.65, 24.0, { tint: [1, 1, 1, 1], us: 10, vs: 2 });
  dm('box', 'mallWarmWall',   2.0,  2.32, 24.08,0, 0, 0, 24.2, 4.65, 0.16, { tint: [1, 1, 1, 1], us: 10, vs: 2 });
  // Vách lửng mặt Bắc phía trên giếng trời Tầng 2 (Z = 14.0, Y = 4.55..7.8) + lan can kính giếng trời nhìn xuống Tầng 1!
  dm('box', 'mallWarmWall', -2.0, 6.22, 14.0, 0, 0, 0, 16.0, 3.16, 0.16, { tint: [1, 1, 1, 1], us: 6, vs: 1.4 });
  dm('box', 'limWood',      -2.0, 3.46, 13.86,0, 0, 0, 16.0, 0.14, 0.12, { tint: [0.75, 0.56, 0.38, 1] });
  dm('box', 'limWood',      -2.0, 4.26, 13.86,0, 0, 0, 16.0, 0.08, 0.10, { tint: [0.75, 0.56, 0.38, 1] });

  // 4. MẶT TIỀN Z = 0 BÁM SÁT HUB BANNER: 2 Ô CỬA SỔ KÍNH TẦNG 1 & 3 Ô VÒM LAN CAN TẦNG 2
  // 4a. Tầng 1 Z = 0: Cột tường giữa cửa chính [-1.45..1.45], Cửa sổ Trái [-7.6..-3.2], Cửa sổ Phải [2.4..5.4]
  dm('box', 'mallWarmWall', -8.8,  1.70, -0.06, 0, 0, 0, 2.4, 3.4, 0.16, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', -2.32, 1.70, -0.06, 0, 0, 0, 1.75, 3.4, 0.16, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall',  1.92, 1.70, -0.06, 0, 0, 0, 0.95, 3.4, 0.16, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall',  5.70, 1.70, -0.06, 0, 0, 0, 0.60, 3.4, 0.16, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', -5.40, 0.32, -0.06, 0, 0, 0, 4.4, 0.65, 0.16, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', -5.40, 3.08, -0.06, 0, 0, 0, 4.4, 0.65, 0.16, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall',  3.90, 0.32, -0.06, 0, 0, 0, 3.0, 0.65, 0.16, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall',  3.90, 3.08, -0.06, 0, 0, 0, 3.0, 0.65, 0.16, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall',  0.00, 3.12, -0.06, 0, 0, 0, 2.9, 0.58, 0.16, { tint: [1, 1, 1, 1] });
  // Kính trong suốt 2 cửa sổ Tầng 1 + đồ trưng bày ngay bệ cửa sổ (3 bộ đồ bên trái + Trefoil bên phải giống Banner!)
  dm('box', 'limWood', -5.4, 0.35, 0.25, 0, 0, 0, 4.0, 0.68, 0.65, { tint: [0.95, 0.80, 0.65, 1] });
  dm('box', 'white',   -6.6, 1.02, 0.25, 0, 0, 0, 0.48, 0.68, 0.22, { tint: [0.09, 0.11, 0.15, 1] });
  dm('box', 'white',   -5.4, 1.02, 0.25, 0, 0, 0, 0.48, 0.68, 0.22, { tint: [0.88, 0.27, 0.17, 1] });
  dm('box', 'white',   -4.2, 1.02, 0.25, 0, 0, 0, 0.48, 0.68, 0.22, { tint: [0.98, 0.98, 0.98, 1] });
  dm('box', 'limWood',  3.9, 0.35, 0.25, 0, 0, 0, 2.6, 0.68, 0.65, { tint: [0.95, 0.80, 0.65, 1] });
  drawAdidasTrefoilLampWebgl(wgl, 3.9, 1.05, 0.25, 0);
  // Mái ngói ngăn Tầng 1 & Tầng 2 + Biển ADIDAS đen viền trắng ngoài mặt tiền
  dm('box', 'roofTileTex', -2.0, 3.30, -0.45, 0.24, 0, 0, 16.4, 0.12, 1.05, { tint: [1, 1, 1, 1], us: 8, vs: 1 });
  dm('quad', 'trefoilOriginSign', 0.0, 3.12, -0.22, 0, Math.PI, 0, 4.2, 0.95, 1, { tint: [1, 1, 1, 1] });

  // Cửa chính Tầng 1 giữa (Z = 0)
  dm('quad', 'vnDoorWood', -0.72, 1.42, 0.04, 0, 0, 0, 1.44, 2.82, 1, { tint: [1, 1, 1, 1], us: 0.5, vs: 1 });
  var rAng = st.rightDoorOpen * 0.92;
  dm('box', 'limWood', 1.44 - Math.cos(rAng) * 0.72, 1.42, 0.04 + Math.sin(rAng) * 0.72, 0, -rAng, 0, 1.44, 2.82, 0.06, { tint: [1.05, 0.95, 0.85, 1] });
  dm('quad', 'vnDoorWood', 1.44 - Math.cos(rAng) * 0.72, 1.42, 0.08 + Math.sin(rAng) * 0.72, 0, -rAng, 0, 1.36, 2.74, 1, { tint: [1, 1, 1, 1], us: 0.5, uo: 0.5 });

  // Cánh phải Tầng 1 (Z = 0, X ∈ [6..14])
  dm('box', 'mallWarmWall', 10.0, 2.32, -0.06, 0, 0, 0, 8.1, 4.65, 0.16, { tint: [1, 1, 1, 1], us: 3.5, vs: 2 });

  // 4b. Tầng 2 Z = 0: 3 Ô CỬA SỔ VÒM LỚN ([-8.8..-5.2], [-3.8..0.2], [1.2..5.2]) + Trụ + Mái + Chùm Đèn
  var pillarsF2 = [[-9.4, 1.2], [-4.5, 1.4], [0.7, 1.0], [5.6, 0.8]];
  for (var p2i = 0; p2i < pillarsF2.length; p2i++) {
    dm('box', 'mallWarmWall', pillarsF2[p2i][0], 5.6, -0.06, 0, 0, 0, pillarsF2[p2i][1], 4.4, 0.16, { tint: [1, 1, 1, 1] });
  }
  dm('box', 'mallWarmWall', -2.0, 7.02, -0.06, 0, 0, 0, 16.0, 1.55, 0.16, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', -2.0, 3.68, -0.06, 0, 0, 0, 16.0, 0.56, 0.16, { tint: [1, 1, 1, 1] });
  var archXsF2 = [-7.0, -1.8, 3.2];
  var bulbCols = [[0.98, 0.96, 0.90, 1], [0.88, 0.27, 0.17, 1], [0.96, 0.72, 0.23, 1], [0.29, 0.87, 0.50, 1]];
  for (var a2 = 0; a2 < 3; a2++) {
    var ax = archXsF2[a2];
    dm('sphere', 'white', ax - 0.8, 5.75, 0.15, 0, 0, 0, 0.24, 0.26, 0.24, { tint: bulbCols[a2], emissive: 1.2 });
    dm('sphere', 'white', ax,       5.70, 0.15, 0, 0, 0, 0.28, 0.30, 0.28, { tint: bulbCols[(a2 + 1) % 4], emissive: 1.2 });
    dm('sphere', 'white', ax + 0.8, 5.75, 0.15, 0, 0, 0, 0.24, 0.26, 0.24, { tint: bulbCols[(a2 + 2) % 4], emissive: 1.2 });
  }

  // Trần Tầng 2 (Y = 7.8) & Trần cánh Đông/Khu Thể Thao T1 (Y = 4.65)
  dm('box', 'limWood', -2.0, 7.86, 7.0,  0, 0, 0, 16.2, 0.16, 14.2, { tint: [0.85, 0.75, 0.64, 1], us: 6, vs: 6 });
  dm('box', 'limWood',  2.0, 4.70, 19.0, 0, 0, 0, 24.2, 0.14, 10.2, { tint: [0.85, 0.75, 0.64, 1], us: 10, vs: 5 });
  dm('box', 'limWood', 10.0, 4.70, 7.0,  0, 0, 0, 8.2,  0.14, 14.2, { tint: [0.85, 0.75, 0.64, 1], us: 4, vs: 6 });
  for (var lx = -1; lx <= 1; lx++) {
    dm('box', 'white', lx * 1.1, 7.74, 7.0, 0, 0, 0, 0.18, 0.06, 12.6, { tint: [1.0, 0.98, 0.90, 1], emissive: 1.15 });
    dm('box', 'white', lx * 1.1, 3.22, 7.0, 0, 0, 0, 0.16, 0.05, 12.6, { tint: [1.0, 0.98, 0.90, 1], emissive: 1.1 });
  }

  // 5. Vách Ngăn X = 6.0 (T1 3 vòm & T2 kín) + Vách Z = 14.0 [6..14]
  dm('box', 'mallWarmWall', 6.0, 2.32, 0.9,  0, 0, 0, 0.16, 4.65, 1.8, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', 6.0, 2.32, 6.4,  0, 0, 0, 0.16, 4.65, 3.2, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', 6.0, 2.32, 13.95,0, 0, 0, 0.16, 4.65, 5.1, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', 6.0, 2.32, 22.25,0, 0, 0, 0.16, 4.65, 3.5, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', 6.0, 3.98, 3.3,  0, 0, 0, 0.16, 1.34, 3.0, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', 6.0, 3.98, 9.7,  0, 0, 0, 0.16, 1.34, 3.4, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', 6.0, 4.08, 18.5, 0, 0, 0, 0.16, 1.15, 4.0, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', 6.0, 5.60, 7.0,  0, 0, 0, 0.16, 4.40, 14.0,{ tint: [1, 1, 1, 1], us: 5, vs: 1.8 });
  dm('box', 'mallWarmWall', 7.1, 2.32, 14.0, 0, 0, 0, 2.2, 4.65, 0.16, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', 12.9,2.32, 14.0, 0, 0, 0, 2.2, 4.65, 0.16, { tint: [1, 1, 1, 1] });
  dm('box', 'mallWarmWall', 10.0,4.02, 14.0, 0, 0, 0, 3.6, 1.25, 0.16, { tint: [1, 1, 1, 1] });

  // ==================== C. CẦU THANG 14 BẬC & LAN CAN LỖ THANG (X ∈ [-9.6, -7.4], Z ∈ [8.0, 12.8]) ====================
  for (var s = 0; s < 14; s++) {
    var sz = 8.0 + (s + 0.5) * (4.8 / 14);
    var sy = (s + 0.5) * (3.4 / 14);
    dm('box', 'limWood', -8.5, sy * 0.5, sz, 0, 0, 0, 2.2, sy, 0.36, { tint: [1.10, 0.92, 0.76, 1], us: 1.5, vs: 1 });
  }
  dm('box', 'limWood', -7.38, 2.25, 10.4, -0.61, 0, 0, 0.10, 0.12, 5.8, { tint: [0.8, 0.65, 0.48, 1] });
  dm('box', 'limWood', -7.38, 3.85, 10.4, 0, 0, 0, 0.10, 0.85, 4.8, { tint: [0.75, 0.60, 0.45, 1] });
  dm('box', 'limWood', -8.50, 3.85, 7.95, 0, 0, 0, 2.35, 0.85, 0.10, { tint: [0.75, 0.60, 0.45, 1] });

  // ==================== D. 16 GIAN TẦNG 1 + KỆ SALE & GIÁ TREO ĐA HƯỚNG ====================
  // Gian 1: Sneaker Wall LED (Tường Tây Z = 1.3..7.05)
  dm('box', 'limWood', -9.30, 0.44, 4.18, 0, 0, 0, 1.25, 0.88, 5.7, { tint: [1.05, 0.90, 0.76, 1] });
  dm('quad', 'shoeDisplayBoard', -9.88, 2.15, 4.18, 0, Math.PI * 0.5, 0, 5.4, 2.1, 1, { tint: [1, 1, 1, 1] });
  drawAdidasSneaker3D(wgl, -9.15, 0.90, 2.2, [1, 0.98, 0.94, 1], [0.07, 0.09, 0.15, 1], [0.71, 0.33, 0.04, 1]);
  drawAdidasSneaker3D(wgl, -9.15, 0.90, 4.2, [0.86, 0.15, 0.15, 1], [1, 0.98, 0.94, 1], [0.95, 0.96, 0.98, 1]);
  drawAdidasSneaker3D(wgl, -9.15, 0.90, 6.1, [0.12, 0.16, 0.23, 1], [0.98, 0.45, 0.09, 1], [0.06, 0.09, 0.16, 1]);

  // Gian 2: Đảo Running Ultraboost (X = -5.1, Z = 5.5)
  dm('box', 'limWood', -5.1, 0.42, 5.5, 0, 0, 0, 2.1, 0.84, 1.7, { tint: [0.96, 0.84, 0.72, 1] });
  dm('box', 'white',   -5.1, 0.90, 5.5, 0, 0, 0, 1.6, 0.12, 1.2, { tint: [0.12, 0.16, 0.23, 1] });
  drawAdidasSneaker3D(wgl, -5.5, 0.98, 5.5, [0.12, 0.16, 0.23, 1], [0.22, 0.74, 0.97, 1], [0.98, 0.98, 0.98, 1]);
  drawAdidasSneaker3D(wgl, -4.7, 0.98, 5.5, [0.98, 0.98, 0.98, 1], [0.98, 0.45, 0.09, 1], [0.94, 0.94, 0.96, 1]);

  // Gian 3: Đảo Predator Trung Tâm (X = 0, Z = 6.3)
  dm('box', 'limWood', 0, 0.42, 6.3, 0, 0, 0, 2.7, 0.84, 2.1, { tint: [0.95, 0.82, 0.70, 1] });
  dm('box', 'mallWarmWall', 0, 0.88, 6.3, 0, 0, 0, 2.8, 0.08, 2.2, { tint: [1.05, 0.96, 0.82, 1], specPow: 64 });
  drawAdidasSneaker3D(wgl, -0.78, 1.04, 6.3, [1, 0.98, 0.94, 1], [0.07, 0.09, 0.15, 1], [0.71, 0.33, 0.04, 1]);
  drawAdidasSneaker3D(wgl,  0.00, 1.12, 6.3, [0.12, 0.16, 0.23, 1], [0.98, 0.45, 0.09, 1], [0.06, 0.09, 0.16, 1]);
  drawAdidasSneaker3D(wgl,  0.78, 1.04, 6.3, [0.86, 0.15, 0.15, 1], [1, 0.98, 0.94, 1], [0.95, 0.96, 0.98, 1]);

  // Gian 4: Đảo Áo Polo treo hướng dọc + Giá Polo tường phải + Kệ SALE Tầng 1
  drawAdidasAFrameRack3D(wgl, 3.1, 0, 6.45, Math.PI * 0.5, [0.12, 0.23, 0.54, 1], [0.97, 0.98, 0.99, 1], [0.60, 0.11, 0.11, 1]);
  dm('box', 'limWood', 5.35, 0.36, 6.40, 0, 0, 0, 1.15, 0.72, 1.9, { tint: [1.05, 0.90, 0.76, 1] });
  dm('quad', 'poloDisplayTex', 5.88, 2.05, 6.40, 0, -Math.PI * 0.5, 0, 2.6, 1.8, 1, { tint: [1, 1, 1, 1] });
  drawAdidasSaleRack3D(wgl, 3.1, 0, 2.8, Math.PI);

  // Gian 5: Đảo Quần Jogger & Track Pants (X = -4.7, Z = 11.3)
  dm('box', 'limWood', -4.7, 0.36, 11.3, 0, 0, 0, 2.1, 0.72, 1.7, { tint: [0.92, 0.80, 0.68, 1] });
  dm('cyl', 'white',   -4.7, 1.62, 11.3, 0, 0, Math.PI * 0.5, 0.04, 1.9, 0.04, { tint: [0.82, 0.64, 0.24, 1] });
  drawAdidasHangingJogger3D(wgl, -5.25, 1.24, 11.3, 0, [0.07, 0.09, 0.15, 1]);
  drawAdidasHangingJogger3D(wgl, -4.70, 1.24, 11.3, 0, [0.28, 0.33, 0.41, 1]);
  drawAdidasHangingJogger3D(wgl, -4.15, 1.24, 11.3, 0, [0.08, 0.32, 0.18, 1]);
  dm('quad', 'joggerRackTex', -4.7, 1.20, 10.43, 0, Math.PI, 0, 2.0, 1.1, 1, { tint: [1, 1, 1, 1] });

  // Gian 6-8: Khoác tường phải, Dép Adilette & 3 Mannequin T1
  dm('box', 'limWood', 5.30, 0.36, 12.75, 0, 0, 0, 1.2, 0.72, 1.85, { tint: [1.05, 0.90, 0.76, 1] });
  dm('quad', 'threeStripesWall', 5.88, 2.05, 12.75, 0, -Math.PI * 0.5, 0, 2.4, 1.8, 1, { tint: [1, 1, 1, 1] });
  drawAdidasHangingGarment3D(wgl, 5.20, 1.55, 12.25, -Math.PI * 0.5, [0.07, 0.09, 0.15, 1], false);
  drawAdidasHangingGarment3D(wgl, 5.20, 1.55, 13.20, -Math.PI * 0.5, [0.72, 0.11, 0.11, 1], false);
  dm('box', 'limWood', -4.7, 0.40, 2.3, 0, 0, 0, 2.1, 0.80, 1.3, { tint: [0.98, 0.88, 0.76, 1] });
  dm('quad', 'slidesBoardTex', -4.7, 1.65, 2.3, 0, Math.PI, 0, 2.1, 1.15, 1, { tint: [1, 1, 1, 1] });
  drawAdidasSlide3D(wgl, -5.3, 0.82, 2.3, [0.06, 0.09, 0.16, 1], [0.12, 0.16, 0.23, 1]);
  drawAdidasSlide3D(wgl, -4.7, 0.82, 2.3, [0.11, 0.31, 0.85, 1], [0.15, 0.39, 0.92, 1]);
  drawAdidasSlide3D(wgl, -4.1, 0.82, 2.3, [0.84, 0.77, 0.63, 1], [0.47, 0.21, 0.06, 1]);
  drawAdidasMannequin3D(wgl,  1.8, 0, 9.8,  [0.12, 0.23, 0.54, 1], [0.20, 0.25, 0.33, 1], [1, 1, 1, 1]);
  drawAdidasMannequin3D(wgl, -2.0, 0, 9.8,  [0.72, 0.11, 0.11, 1], [0.07, 0.09, 0.15, 1], [1, 1, 1, 1]);
  drawAdidasMannequin3D(wgl,  3.6, 0, 15.2, [0.86, 0.15, 0.15, 1], [0.86, 0.15, 0.15, 1], [0.98, 0.80, 0.08, 1]);

  // Gian 9-12: Khu Thể Thao & Maker Lab T1 (Z ∈ [14..24])
  dm('box', 'limWood', -9.30, 0.44, 18.1, 0, 0, 0, 1.25, 0.88, 6.2, { tint: [1.05, 0.90, 0.76, 1] });
  dm('quad', 'footballGearTex', -9.88, 2.25, 18.1, 0, Math.PI * 0.5, 0, 5.8, 2.25, 1, { tint: [1, 1, 1, 1] });
  drawAdidasHangingGarment3D(wgl, -9.0, 1.55, 16.5, Math.PI * 0.5, [0.86, 0.15, 0.15, 1], false);
  drawAdidasHangingGarment3D(wgl, -9.0, 1.55, 19.6, Math.PI * 0.5, [0.97, 0.98, 0.99, 1], false);
  dm('box', 'limWood', -5.1, 0.42, 17.1, 0, 0, 0, 2.5, 0.84, 2.1, { tint: [0.95, 0.84, 0.72, 1] });
  dm('quad', 'gymPickleTex', -5.1, 1.65, 17.1, 0, Math.PI, 0, 2.4, 1.25, 1, { tint: [1, 1, 1, 1] });
  dm('box', 'limWood', 3.0, 0.46, 19.7, 0, 0, 0, 2.5, 0.92, 2.1, { tint: [0.92, 0.80, 0.68, 1] });
  dm('box', 'white',   3.0, 1.04, 19.7, 0, 0, 0, 0.92, 0.24, 0.76, { tint: [0.98, 0.45, 0.09, 1], specPow: 64 });
  dm('quad', 'makerLabTex', 3.0, 2.25, 20.6, 0, Math.PI, 0, 2.6, 1.35, 1, { tint: [1, 1, 1, 1] });
  dm('box', 'limWood', -2.0, 0.46, 23.3, 0, 0, 0, 8.2, 0.92, 1.25, { tint: [1.0, 0.86, 0.72, 1] });
  dm('quad', 'accessoriesWallTex', -4.2, 1.95, 23.90, 0, Math.PI, 0, 4.2, 1.95, 1, { tint: [1, 1, 1, 1] });
  dm('quad', 'vnLotusStripeArt',    1.6, 2.15, 23.90, 0, Math.PI, 0, 5.4, 2.25, 1, { tint: [1, 1, 1, 1] });

  // Gian 13-14: Phòng Thay Đồ & POS Tầng 1 (X ∈ [6..14], Z ∈ [0..14])
  dm('box', 'limWood', 13.55, 0.10, 9.8, 0, 0, 0, 0.72, 0.20, 3.60, { tint: [1.05, 0.88, 0.72, 1] });
  dm('quad', 'mirrorGlass', 13.88, 1.72, 9.8, 0, -Math.PI * 0.5, 0, 3.55, 3.04, 1, { tint: [1, 1, 1, 1], specPow: 96, rim: 0.25 });
  if (st.pig.y < 1.9 && st.pig.x >= 5.6 && st.pig.z >= 6.4 && st.pig.z <= 13.8) {
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

  dm('box', 'limWood', 10.9, 0.52, 3.4, 0, 0, 0, 1.35, 1.04, 3.9, { tint: [1.05, 0.88, 0.72, 1] });
  dm('box', 'mallWarmWall', 10.9, 1.08, 3.4, 0, 0, 0, 1.48, 0.10, 4.05, { tint: [1.05, 0.95, 0.80, 1] });
  dm('box', 'white', 10.85, 1.32, 2.4, 0, 0, 0, 0.38, 0.36, 0.46, { tint: [0.12, 0.16, 0.23, 1] });
  dm('box', 'white', 10.85, 1.32, 4.3, 0, 0, 0, 0.38, 0.36, 0.46, { tint: [0.12, 0.16, 0.23, 1] });
  dm('quad', 'posShelfTex', 13.90, 2.25, 3.5, 0, -Math.PI * 0.5, 0, 5.4, 2.2, 1, { tint: [1, 1, 1, 1] });
  dm('box', 'limWood', 8.25, 0.44, 1.4, 0, 0, 0, 1.4, 0.88, 0.95, { tint: [0.92, 0.80, 0.68, 1] });
  dm('quad', 'accessoriesWallTex', 8.25, 1.45, 0.95, 0, 0, 0, 1.4, 0.95, 1, { tint: [1, 1, 1, 1] });

  // Gian 15-16: Sân Turf Sút Bóng 3D & Kệ Bóng
  var netShake = (st.kickGame && st.kickGame.netRipple) ? Math.sin(st.t * 28) * st.kickGame.netRipple * 0.12 : 0;
  dm('box', 'white',  8.15, 0.95, 22.4, 0, 0, 0, 0.12, 1.90, 0.12, { tint: [0.98, 0.99, 1.0, 1] });
  dm('box', 'white', 11.85, 0.95, 22.4, 0, 0, 0, 0.12, 1.90, 0.12, { tint: [0.98, 0.99, 1.0, 1] });
  dm('box', 'white', 10.00, 1.90, 22.4, 0, 0, 0, 3.82, 0.12, 0.12, { tint: [0.98, 0.99, 1.0, 1] });
  dm('quad', 'scoreboardLedTex', 10.0, 2.75, 23.85, 0, Math.PI, 0, 4.6, 1.45, 1, { tint: [1, 1, 1, 1], emissive: 0.6 });
  var goalTargetsX = [8.75, 10.0, 11.25];
  for (var gi = 0; gi < 3; gi++) {
    dm('torus', 'white', goalTargetsX[gi], gi === 1 ? 1.42 : 1.32, 23.38, 0, 0, 0, 0.48, 0.48, 0.48, { tint: [0.98, 0.80, 0.12, 1], emissive: 1.1 });
  }
  if (st.kickGame) {
    var kb = st.kickGame.ball;
    dm('sphere', 'white', kb.x, kb.y, kb.z, st.t * 2, 0, 0, 0.40, 0.40, 0.40, { tint: [0.98, 0.98, 0.98, 1] });
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
  dm('box', 'limWood', 13.30, 0.46, 18.2, 0, 0, 0, 1.25, 0.92, 5.8, { tint: [1.0, 0.88, 0.74, 1] });
  dm('quad', 'footballGearTex', 13.88, 2.25, 18.2, 0, -Math.PI * 0.5, 0, 5.4, 2.1, 1, { tint: [1, 1, 1, 1] });

  // ==================== E. 6 GIAN TẦNG 2 ('upper', Y = 3.4) TREO ĐỦ HƯỚNG, KHU SALE -50% & POS LẦU 2 ====================
  // Gian 17: Giá chữ A Polo (Đông-Tây) & Giá tròn 360° (8 móc tỏa tròn)
  drawAdidasAFrameRack3D(wgl, -3.2, 3.4, 3.5, 0, [0.12, 0.23, 0.54, 1], [0.97, 0.98, 0.99, 1], [0.60, 0.11, 0.11, 1]);
  drawAdidasRoundCarouselRack3D(wgl, 0.3, 3.4, 4.5);

  // Gian 18: Sào kép Quần Jogger & Giá tròn 360° thứ 2
  dm('box', 'limWood', -5.3, 3.76, 6.5, 0, 0, 0, 1.7, 0.72, 2.4, { tint: [0.92, 0.80, 0.68, 1] });
  dm('cyl', 'white',   -5.3, 5.02, 6.5, Math.PI * 0.5, 0, 0, 0.04, 2.3, 0.04, { tint: [0.82, 0.64, 0.24, 1] });
  drawAdidasHangingJogger3D(wgl, -5.3, 4.64, 5.7, Math.PI * 0.5, [0.07, 0.09, 0.15, 1]);
  drawAdidasHangingJogger3D(wgl, -5.3, 4.64, 6.5, Math.PI * 0.5, [0.28, 0.33, 0.41, 1]);
  drawAdidasHangingJogger3D(wgl, -5.3, 4.64, 7.3, Math.PI * 0.5, [0.08, 0.32, 0.18, 1]);
  dm('quad', 'joggerRackTex', -5.9, 5.3, 6.5, 0, Math.PI * 0.5, 0, 2.2, 1.15, 1, { tint: [1, 1, 1, 1] });
  drawAdidasRoundCarouselRack3D(wgl, -3.3, 3.4, 11.1);

  // Gian 19: Đảo SALE OUTLET -50% Tầng 2 Đỏ-Vàng
  drawAdidasSaleRack3D(wgl, -0.1, 3.4, 10.2, Math.PI);

  // Gian 20: Kệ Bộ Sưu Tập Việt Nam × 3 Sọc (Tường Tây Tầng 2)
  dm('box', 'limWood', -9.30, 3.82, 4.2, 0, 0, 0, 1.25, 0.84, 5.1, { tint: [1.05, 0.90, 0.76, 1] });
  dm('quad', 'vnCollectionSign', -9.88, 5.45, 4.2, 0, Math.PI * 0.5, 0, 5.0, 2.0, 1, { tint: [1, 1, 1, 1] });

  // Gian 21: Quầy Thu Ngân POS Tầng 2 & Kệ Hộp Giày Samba OG (Tường Đông Tầng 2)
  dm('box', 'limWood', 3.9, 3.92, 6.9, 0, 0, 0, 1.18, 1.04, 5.2, { tint: [1.05, 0.88, 0.72, 1] });
  dm('box', 'mallWarmWall', 3.9, 4.48, 6.9, 0, 0, 0, 1.32, 0.10, 5.35, { tint: [1.05, 0.95, 0.80, 1] });
  dm('box', 'white', 3.85, 4.70, 6.1, 0, 0, 0, 0.36, 0.34, 0.44, { tint: [0.12, 0.16, 0.23, 1] });
  dm('box', 'white', 3.85, 4.65, 7.65, 0, 0, 0, 0.44, 0.24, 0.62, { tint: [0.11, 0.31, 0.85, 1] });
  drawAdidasSneaker3D(wgl, 3.85, 4.77, 7.65, [1, 0.98, 0.94, 1], [0.07, 0.09, 0.15, 1], [0.71, 0.33, 0.04, 1]);
  dm('quad', 'posShelfTex', 5.88, 5.50, 6.9, 0, -Math.PI * 0.5, 0, 5.4, 2.0, 1, { tint: [1, 1, 1, 1] });
  dm('quad', 'vnLotusStripeArt', -2.0, 6.20, 13.90, 0, Math.PI, 0, 6.0, 2.15, 1, { tint: [1, 1, 1, 1] });

  // Gian 22: 2 Mannequin trước Cửa Sổ Vòm Tầng 2
  drawAdidasMannequin3D(wgl, -6.15, 3.4, 1.65, [0.12, 0.23, 0.54, 1], [0.20, 0.25, 0.33, 1], [1, 1, 1, 1]);
  drawAdidasMannequin3D(wgl,  2.25, 3.4, 1.65, [0.86, 0.15, 0.15, 1], [0.07, 0.09, 0.15, 1], [0.98, 0.80, 0.08, 1]);

  // Đèn Cỏ Ba Lá Trefoil LED
  drawAdidasTrefoilLampWebgl(wgl, 0.0,  2.65, 6.3,  0);
  drawAdidasTrefoilLampWebgl(wgl, 0.0,  6.15, 6.3,  0);
  drawAdidasTrefoilLampWebgl(wgl, 10.6, 3.45, 9.8,  -Math.PI * 0.5);
  drawAdidasTrefoilLampWebgl(wgl, 10.0, 3.65, 19.2, 0);

  // ==================== F. 14 NPCs & CHÚ HEO 4 OUTFITS (gl.NEAREST) ====================
  if (st.npcs) {
    for (var ni = 0; ni < st.npcs.length; ni++) {
      if (typeof drawHumanBillboardWebgl === 'function') drawHumanBillboardWebgl(wgl, cam, st.npcs[ni], st.t);
    }
  }
  if (typeof drawPigBillboardWebgl === 'function') {
    drawPigBillboardWebgl(wgl, cam, st.pig, st.t, false);
  }

  // Kính cửa sổ Tầng 1-2, Lan can vòm Tầng 2 & Lưới Gôn bán trong suốt vẽ SAU cùng với alpha blend
  wgl.setBlend('alpha');
  // 2 ô kính cửa sổ Tầng 1
  dm('quad', 'glassWindowFrameTex', -5.4, 1.70, -0.02, 0, 0, 0, 4.4, 2.1, 1, { tint: [1, 1, 1, 0.92] });
  dm('quad', 'glassWindowFrameTex',  3.9, 1.70, -0.02, 0, 0, 0, 3.0, 2.1, 1, { tint: [1, 1, 1, 0.92] });
  // 3 ô cửa sổ vòm Tầng 2 (kính + lan can con tiện trắng đáy vòm bám sát Banner!)
  for (var aw = 0; aw < 3; aw++) {
    var awx = archXsF2[aw];
    dm('quad', 'glassWindowFrameTex', awx, 5.10, -0.02, 0, 0, 0, 3.8, 2.35, 1, { tint: [1, 1, 1, 0.88] });
    dm('quad', 'archBalustradeTex',   awx, 3.92, -0.10, 0, 0, 0, 3.8, 0.95, 1, { tint: [1, 1, 1, 1] });
  }
  // Lưới khung thành Gôn
  dm('quad', 'goalNetTex', 10.00, 0.95, 23.45 + netShake, 0, Math.PI, 0, 3.70, 1.90, 1, { tint: [1, 1, 1, 0.88], emissive: 0.45 });
  dm('quad', 'goalNetTex',  8.15, 0.95, 22.92, 0,  Math.PI * 0.5, 0, 1.05, 1.90, 1, { tint: [1, 1, 1, 0.82] });
  dm('quad', 'goalNetTex', 11.85, 0.95, 22.92, 0, -Math.PI * 0.5, 0, 1.05, 1.90, 1, { tint: [1, 1, 1, 0.82] });
  wgl.setBlend(null);

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
  ctx.fillStyle = soleCol || '#B45309'; ctx.fillRect(px - 6 * u, py - 2.2 * u, 12 * u, 2.6 * u);
  ctx.fillStyle = bodyCol || '#FFFBF1'; ctx.fillRect(px - 5.5 * u, py - 6.2 * u, 9.5 * u, 4.2 * u);
  ctx.fillStyle = stripeCol || '#111827';
  for (var k = 0; k < 3; k++) ctx.fillRect(px + (-2.6 + k * 1.8) * u, py - 5.6 * u, 1.1 * u, 3.2 * u);
  ctx.restore();
}

function renderAdidasTpsScene(ctx, cam, st, W, H) {
  var room = st.room || (st.pig.y >= 1.9 ? 'upper' : (st.pig.x >= 6.0 ? (st.pig.z >= 14.0 ? 'kick_zone' : 'fitting') : 'hall'));
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
  if (typeof drawAdidasRoomWalls3D === 'function') drawAdidasRoomWalls3D(ctx, cam, room, st.pig, st.t);

  var items = [];
  function pushItem(wx, wz, fn) { items.push({ d: Math.hypot(wx - cam.pos.x, wz - cam.pos.z), fn: fn }); }
  pushItem(0, 6.3, function() {
    drawBox3D(ctx, cam, 0, 0, 6.3, 2.5, 0.84, 1.9, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
    drawSneakerSprite3D(ctx, cam, 0, 1.05, 6.3, '#FFFBF1', '#111827', '#B45309');
  });
  pushItem(3.1, 6.45, function() {
    drawBox3D(ctx, cam, 3.1, 0, 6.45, 1.7, 0.76, 1.9, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
  });
  pushItem(-4.7, 11.3, function() {
    drawBox3D(ctx, cam, -4.7, 0, 11.3, 2.1, 0.72, 1.7, { top: '#334155', front: '#1E293B', side: '#0F172A', stroke: '#2B180E' });
  });
  pushItem(10.0, 22.4, function() {
    drawBox3D(ctx, cam, 10.0, 0, 22.4, 3.6, 1.9, 1.1, { top: '#15803D', front: '#166534', side: '#14532D', stroke: '#FFFBF1' });
  });
  if (st.npcs) {
    for (var ni = 0; ni < st.npcs.length; ni++) {
      (function(npc) { pushItem(npc.x, npc.z, function() { drawHumanTps3D(ctx, cam, npc, st.t); }); })(st.npcs[ni]);
    }
  }
  pushItem(st.pig.x, st.pig.z, function() { drawPigTps3D(ctx, cam, st.pig, st.t); });
  items.sort(function(a, b) { return b.d - a.d; });
  for (var ii = 0; ii < items.length; ii++) items[ii].fn();
  if (st.exitFade > 0.01) {
    ctx.fillStyle = 'rgba(246, 238, 220, ' + st.exitFade.toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
  }
}
`;
}
