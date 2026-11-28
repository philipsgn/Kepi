/**
 * Quán Cà Phê Sài Gòn 2 Tầng WebGL 3D — Chuyển Động Heo Tự Nhiên Chuẩn Quán Phở, Cửa Sổ Nhìn Ra Sông & Nội Thất Phong Phú (Quyết định 249–251)
 * - Mặt tiền Tầng 1 & 2 vàng kem #F7E7C6 đồng bộ Tab Banner (0 ban công, 3 cửa sổ vòm Tầng 2 nhìn ra Sông Bạch Đằng có thuyền chạy 60fps).
 * - Tầng 1 (14m × 16m): Cây thông Noel 3D 5 tầng + hộp quà, Xe máy cổ 3D, Tủ kệ sách gỗ nhiều tầng, Đồng hồ quả lắc 3D, Cây tán nhiều tầng, Quầy Bar & Văn hóa Việt.
 * - Tầng 2: 15 bàn đa dạng (4 bàn tròn ngắm sông, 4 Sofa Booth có gối, 2 bàn dài cộng đồng, 4 bàn thấp ghế đôn gỗ, 1 góc Heo AI), ~22 ghế tương tác + 7 khách NPC.
 * - Chuyển động Heo tự nhiên chuẩn Quán Phở: 3.6 m/s (cầu thang 2.6 m/s), lerpAngle xoay mượt, tránh vật cản AABB, camera lên cầu thang nội suy tuyến tính không giật.
 */
export function buildCafeTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. ĐỊA HÌNH 2 TẦNG (0 BAN CÔNG), 15 BÀN TẦNG 2 & 7 KHÁCH NPC ==================== */
function getCafeSurfaceY(x, z, curY) {
  if (x >= -5.45 && x <= -2.95 && z >= 9.4 && z <= 14.6) {
    if (z <= 9.6) return 0;
    if (z >= 14.4) return 3.4;
    if (curY >= 3.2 && z < 14.0 && x > -3.10) return 3.4;
    return ((z - 9.6) / 4.8) * 3.4;
  }
  return curY >= 1.9 ? 3.4 : 0;
}

function cafeNormAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function cafeLerpAngle(a, b, t) {
  return cafeNormAngle(a + cafeNormAngle(b - a) * Math.max(0, Math.min(1, t)));
}

function createCafeF1Tables() {
  return [
    { id: 0, kind: 'round',   x: -1.45, z: 4.80, rx: 0.55, rz: 0.55, chairX: -1.45, chairZ: 3.90, occupiedBy: null },
    { id: 1, kind: 'round',   x: -1.25, z: 8.20, rx: 0.55, rz: 0.55, chairX: -1.25, chairZ: 7.30, occupiedBy: null },
    { id: 2, kind: 'round',   x:  0.85, z: 11.4, rx: 0.55, rz: 0.55, chairX:  0.85, chairZ: 10.5, occupiedBy: null },
    { id: 3, kind: 'library', x: -4.85, z: 6.40, rx: 0.45, rz: 0.65, chairX: -4.05, chairZ: 6.40, occupiedBy: 'khach_thu_vien' }
  ];
}

function createCafeF2Tables() {
  return [
    // 4 Bàn tròn ngắm Sông Bạch Đằng qua 3 cửa sổ vòm Tầng 2
    { id: 0,  kind: 'round', x: -4.60, z: 1.75, rx: 0.52, rz: 0.52 },
    { id: 1,  kind: 'round', x: -1.65, z: 1.75, rx: 0.52, rz: 0.52 },
    { id: 2,  kind: 'round', x:  1.65, z: 1.75, rx: 0.52, rz: 0.52 },
    { id: 3,  kind: 'round', x:  4.60, z: 1.75, rx: 0.52, rz: 0.52 },
    // 4 Sofa Booth có nệm & gối tựa dọc 2 bên sảnh
    { id: 4,  kind: 'sofa',  x: -5.45, z: 4.30, rx: 0.65, rz: 0.90, dir: 1 },
    { id: 5,  kind: 'sofa',  x: -5.45, z: 7.30, rx: 0.65, rz: 0.90, dir: 1 },
    { id: 6,  kind: 'sofa',  x:  5.35, z: 4.30, rx: 0.65, rz: 0.90, dir: -1 },
    { id: 7,  kind: 'sofa',  x:  5.35, z: 7.30, rx: 0.65, rz: 0.90, dir: -1 },
    // 2 Bàn dài cộng đồng ở trung tâm Tầng 2
    { id: 8,  kind: 'long',  x:  0.10, z: 5.30, rx: 0.68, rz: 1.35 },
    { id: 9,  kind: 'long',  x:  0.10, z: 9.40, rx: 0.68, rz: 1.35 },
    // 4 Bàn trà thấp kèm ghế đôn gỗ mộc
    { id: 10, kind: 'stool', x: -2.25, z: 6.95, rx: 0.48, rz: 0.48 },
    { id: 11, kind: 'stool', x:  2.75, z: 6.95, rx: 0.48, rz: 0.48 },
    { id: 12, kind: 'stool', x: -1.55, z: 13.0, rx: 0.48, rz: 0.48 },
    { id: 13, kind: 'stool', x:  2.45, z: 13.1, rx: 0.48, rz: 0.48 },
    // 1 Góc Bàn Heo AI (bấm ghế đối diện -> mở Chat Heo AI)
    { id: 14, kind: 'ai',    x:  4.95, z: 11.4, rx: 0.62, rz: 0.56, isAiTable: true }
  ];
}

function createCafeChairs() {
  return [
    // Tầng 1 (Y = 0)
    { id: 0,  floorY: 0,   x: -1.45, y: 0,   z: 3.90,  lookX: -1.45, lookZ: 4.80,  kind: 'peacock' },
    { id: 1,  floorY: 0,   x: -1.45, y: 0,   z: 5.70,  lookX: -1.45, lookZ: 4.80,  kind: 'peacock' },
    { id: 2,  floorY: 0,   x: -1.25, y: 0,   z: 7.30,  lookX: -1.25, lookZ: 8.20,  kind: 'peacock' },
    { id: 3,  floorY: 0,   x:  0.85, y: 0,   z: 10.50, lookX:  0.85, lookZ: 11.40, kind: 'peacock' },
    { id: 4,  floorY: 0,   x: -4.05, y: 0,   z: 6.40,  lookX: -4.85, lookZ: 6.40,  kind: 'library' },
    { id: 5,  floorY: 0,   x: -3.20, y: 0,   z: 2.85,  lookX: -4.05, lookZ: 2.85,  kind: 'wood' },
    // Tầng 2 (Y = 3.4) — Bàn tròn cửa sổ nhìn ra sông (4), Sofa Booth (4), Bàn dài (5), Đôn gỗ (4), Heo AI (1)
    { id: 6,  floorY: 3.4, x: -4.60, y: 3.4, z: 2.65,  lookX: -4.60, lookZ: 1.75,  kind: 'wood' },
    { id: 7,  floorY: 3.4, x: -1.65, y: 3.4, z: 2.65,  lookX: -1.65, lookZ: 1.75,  kind: 'wood' },
    { id: 8,  floorY: 3.4, x:  1.65, y: 3.4, z: 2.65,  lookX:  1.65, lookZ: 1.75,  kind: 'wood' },
    { id: 9,  floorY: 3.4, x:  4.60, y: 3.4, z: 2.65,  lookX:  4.60, lookZ: 1.75,  kind: 'wood' },
    { id: 10, floorY: 3.4, x: -4.65, y: 3.4, z: 4.30,  lookX: -5.45, lookZ: 4.30,  kind: 'peacock' },
    { id: 11, floorY: 3.4, x: -4.65, y: 3.4, z: 7.30,  lookX: -5.45, lookZ: 7.30,  kind: 'peacock' },
    { id: 12, floorY: 3.4, x:  4.55, y: 3.4, z: 4.30,  lookX:  5.35, lookZ: 4.30,  kind: 'peacock' },
    { id: 13, floorY: 3.4, x:  4.55, y: 3.4, z: 7.30,  lookX:  5.35, lookZ: 7.30,  kind: 'peacock' },
    { id: 14, floorY: 3.4, x: -0.75, y: 3.4, z: 4.75,  lookX:  0.10, lookZ: 4.75,  kind: 'peacock' },
    { id: 15, floorY: 3.4, x: -0.75, y: 3.4, z: 5.95,  lookX:  0.10, lookZ: 5.95,  kind: 'peacock' },
    { id: 16, floorY: 3.4, x:  0.95, y: 3.4, z: 5.30,  lookX:  0.10, lookZ: 5.30,  kind: 'wood' },
    { id: 17, floorY: 3.4, x: -0.75, y: 3.4, z: 9.40,  lookX:  0.10, lookZ: 9.40,  kind: 'wood' },
    { id: 18, floorY: 3.4, x:  0.95, y: 3.4, z: 9.40,  lookX:  0.10, lookZ: 9.40,  kind: 'wood' },
    { id: 19, floorY: 3.4, x: -2.25, y: 3.4, z: 6.15,  lookX: -2.25, lookZ: 6.95,  kind: 'stool' },
    { id: 20, floorY: 3.4, x:  2.75, y: 3.4, z: 6.15,  lookX:  2.75, lookZ: 6.95,  kind: 'stool' },
    { id: 21, floorY: 3.4, x: -1.55, y: 3.4, z: 12.20, lookX: -1.55, lookZ: 13.00, kind: 'stool' },
    { id: 22, floorY: 3.4, x:  2.45, y: 3.4, z: 12.30, lookX:  2.45, lookZ: 13.10, kind: 'stool' },
    { id: 23, floorY: 3.4, x:  4.95, y: 3.4, z: 10.45, lookX:  4.95, lookZ: 12.35, kind: 'ai', isAiSeat: true }
  ];
}

function createCafeNpcs() {
  var routes = [
    {
      name: 'khach_tang1_sach', shirt: [0.16, 0.38, 0.62, 1], pants: [0.18, 0.20, 0.24, 1],
      state: 'SIT', timer: 5.5, stepIdx: 0,
      pts: [
        { x: 0.45, y: 0, z: 1.0 }, { x: 1.85, y: 0, z: 5.6 },
        { x: -2.4, y: 0, z: 4.8 }, { x: -2.4, y: 0, z: 4.8, sit: true, yaw: Math.PI * 0.5 },
        { x: 0.35, y: 0, z: 1.1 }
      ]
    },
    {
      name: 'khach_leo_cau_thang', shirt: [0.78, 0.22, 0.24, 1], pants: [0.15, 0.16, 0.20, 1],
      state: 'WALK', timer: 0, stepIdx: 1,
      pts: [
        { x: -0.45, y: 0, z: 1.1 }, { x: 1.9, y: 0, z: 6.4 }, { x: -4.2, y: 0, z: 9.35 },
        { x: -4.2, y: 3.4, z: 14.65 }, { x: -1.8, y: 3.4, z: 14.65 }, { x: 1.0, y: 3.4, z: 5.3 },
        { x: 1.0, y: 3.4, z: 5.3, sit: true, yaw: -Math.PI * 0.5 },
        { x: -1.8, y: 3.4, z: 14.65 }, { x: -4.2, y: 3.4, z: 14.65 }, { x: -4.2, y: 0, z: 9.35 },
        { x: 0.4, y: 0, z: 1.1 }
      ]
    },
    {
      name: 'khach_ngam_song', shirt: [0.85, 0.62, 0.16, 1], pants: [0.22, 0.20, 0.18, 1],
      state: 'WALK', timer: 0, stepIdx: 3,
      pts: [
        { x: 0.2, y: 0, z: 1.2 }, { x: -4.2, y: 0, z: 9.35 }, { x: -4.2, y: 3.4, z: 14.65 },
        { x: -1.8, y: 3.4, z: 14.65 }, { x: -1.65, y: 3.4, z: 2.65 },
        { x: -1.65, y: 3.4, z: 2.65, sit: true, yaw: Math.PI },
        { x: -1.8, y: 3.4, z: 8.2 }, { x: -1.8, y: 3.4, z: 14.65 }, { x: -4.2, y: 3.4, z: 14.65 },
        { x: -4.2, y: 0, z: 9.35 }, { x: -0.2, y: 0, z: 1.2 }
      ]
    },
    {
      name: 'khach_thu_vien', shirt: [0.20, 0.50, 0.36, 1], pants: [0.16, 0.18, 0.22, 1],
      state: 'SIT', timer: 4.0, stepIdx: 2,
      pts: [
        { x: -0.55, y: 0, z: 1.2 }, { x: -3.7, y: 0, z: 6.4 },
        { x: -4.05, y: 0, z: 6.4, sit: true, yaw: -Math.PI * 0.5 },
        { x: -3.2, y: 0, z: 3.6 }, { x: 0.45, y: 0, z: 1.1 }
      ]
    },
    {
      name: 'khach_order_bar', shirt: [0.65, 0.28, 0.48, 1], pants: [0.18, 0.18, 0.24, 1],
      state: 'WALK', timer: 0, stepIdx: 1,
      pts: [
        { x: 0.5, y: 0, z: 1.1 }, { x: 2.55, y: 0, z: 6.2 },
        { x: 2.55, y: 0, z: 6.2, sit: true, yaw: Math.PI * 0.5 },
        { x: 2.45, y: 0, z: 8.6 }, { x: 0.2, y: 0, z: 1.2 }
      ]
    },
    {
      name: 'khach_tang2_sofa', shirt: [0.28, 0.34, 0.64, 1], pants: [0.24, 0.20, 0.16, 1],
      state: 'SIT', timer: 6.5, stepIdx: 2,
      pts: [
        { x: -1.8, y: 3.4, z: 14.65 }, { x: 4.55, y: 3.4, z: 4.30 },
        { x: 4.55, y: 3.4, z: 4.30, sit: true, yaw: Math.PI * 0.5 },
        { x: -1.8, y: 3.4, z: 8.2 }, { x: -1.8, y: 3.4, z: 14.65 },
        { x: -4.2, y: 3.4, z: 14.65 }, { x: -4.2, y: 0, z: 9.35 }, { x: 0.3, y: 0, z: 1.2 }
      ]
    },
    {
      name: 'khach_ao_dai', shirt: [0.95, 0.94, 0.90, 1], pants: [0.15, 0.45, 0.42, 1],
      state: 'WALK', timer: 0, stepIdx: 0,
      pts: [
        { x: 0.35, y: 0, z: 1.1 }, { x: 1.85, y: 0, z: 4.2 },
        { x: 0.85, y: 0, z: 10.5, sit: true, yaw: 0 },
        { x: 0.45, y: 0, z: 1.2 }
      ]
    }
  ];

  var out = [];
  for (var i = 0; i < routes.length; i++) {
    var r = routes[i];
    var cur = r.pts[r.stepIdx % r.pts.length];
    out.push({
      id: r.name,
      role: 'customer',
      shirt: r.shirt,
      pants: r.pants,
      x: cur.x, y: cur.y, z: cur.z,
      yaw: cur.yaw || 0,
      state: r.state,
      timer: r.timer,
      stepIdx: r.stepIdx,
      pts: r.pts,
      phase: i * 0.95
    });
  }
  return out;
}

function createCafeTpsState() {
  var chairs = createCafeChairs();
  var npcs = createCafeNpcs();
  var f1Tables = createCafeF1Tables();
  var f2Tables = createCafeF2Tables();

  var particles = [];
  for (var i = 0; i < 28; i++) {
    particles.push({
      kind: i < 10 ? 'steam' : 'dust',
      x: i < 10 ? (4.05 + ((i * 17) % 8) * 0.05) : (-4.2 + ((i * 37) % 84) * 0.1),
      y: i < 10 ? (1.2 + (i % 6) * 0.22) : (1.6 + ((i * 23) % 38) * 0.1),
      z: i < 10 ? (7.4 + ((i * 13) % 6) * 0.06) : (0.6 + ((i * 19) % 72) * 0.1),
      phase: i * 0.71
    });
  }

  return {
    floor: 1,
    cinematicCam: false,
    tagReceived: false,
    stoolPull: 0,
    hasBalcony: false,
    riverBoats: [
      { x: -12.0, z: -11.5, dir: 1, speed: 1.65, color: [0.72, 0.18, 0.16, 1], len: 3.4 },
      { x:   4.0, z: -15.8, dir: -1, speed: 1.25, color: [0.10, 0.42, 0.62, 1], len: 4.2 },
      { x:  14.5, z: -9.4,  dir: -1, speed: 2.05, color: [0.85, 0.58, 0.14, 1], len: 2.6 }
    ],
    pig: {
      // Xuất phát giữa sảnh Tầng 1 z=5.20 -> camera đứng ~z=0.55 nhìn rộng toàn bộ quán & không bị sát tường!
      x: -0.25, y: 0.0, z: 5.20, yaw: 0.0,
      targetX: -0.25, targetZ: 5.20,
      waypoints: [],
      walking: false,
      seated: false,
      seatChairId: -1,
      pendingSeatId: -1,
      pendingAction: null,
      eating: false,
      isAiCoach: false
    },
    aiCoachPig: {
      x: 4.95, y: 3.4, z: 12.35, yaw: Math.PI,
      seated: true, walking: false, eating: false, isAiCoach: true
    },
    chairs: chairs,
    f1Tables: f1Tables,
    f2Tables: f2Tables,
    tables: f1Tables,
    baristas: [
      { x: 4.45, y: 0, z: 5.95, yaw: -Math.PI * 0.5, role: 'barista', phase: 0.2, handingTag: true },
      { x: 4.70, y: 0, z: 7.80, yaw: -Math.PI * 0.5, role: 'barista', phase: 1.7, blending: true }
    ],
    npcs: npcs,
    particles: particles,
    exitFade: 0,
    exiting: false,
    onRequestOpenChat: null,
    ripples: [],
    t: 0
  };
}

/* ==================== 2. HỆ DẪN ĐƯỜNG REAL-TIME & TRÁNH VẬT CẢN AABB ==================== */
function getCafeObstacles(floorY, f1Tables, f2Tables) {
  var obs = [];
  if (floorY < 1.9) {
    obs.push({ minX: 3.15, maxX: 6.95, minZ: 4.10, maxZ: 9.85 });   // Quầy Bar
    obs.push({ minX: -5.95, maxX: -4.35, minZ: 1.35, maxZ: 2.95 }); // Cây Noel 3D
    obs.push({ minX: 4.25, maxX: 6.10, minZ: 1.35, maxZ: 3.20 });   // Xe máy cổ 3D
    obs.push({ minX: -6.95, maxX: -6.05, minZ: 4.80, maxZ: 8.10 }); // Tủ kệ sách gỗ
    obs.push({ minX: 5.95, maxX: 6.95, minZ: 11.90, maxZ: 13.30 }); // Đồng hồ quả lắc
    var t1 = f1Tables || createCafeF1Tables();
    for (var i = 0; i < t1.length; i++) {
      obs.push({ minX: t1[i].x - t1[i].rx, maxX: t1[i].x + t1[i].rx, minZ: t1[i].z - t1[i].rz, maxZ: t1[i].z + t1[i].rz });
    }
  } else {
    obs.push({ minX: -5.50, maxX: -2.95, minZ: 9.50, maxZ: 14.35 }); // Lỗ cầu thang
    var t2 = f2Tables || createCafeF2Tables();
    for (var j = 0; j < t2.length; j++) {
      obs.push({ minX: t2[j].x - t2[j].rx, maxX: t2[j].x + t2[j].rx, minZ: t2[j].z - t2[j].rz, maxZ: t2[j].z + t2[j].rz });
    }
  }
  return obs;
}

function clampCafeWalkPos(st, x, z, floorY) {
  var fy = typeof floorY === 'number' ? floorY : (st.pig.y >= 1.9 ? 3.4 : 0);
  var nx = Math.max(-6.45, Math.min(6.45, x));
  var nz = Math.max(0.55, Math.min(15.65, z));
  var pad = 0.24;
  var obs = getCafeObstacles(fy, st.f1Tables, st.f2Tables);
  for (var i = 0; i < obs.length; i++) {
    var b = obs[i];
    if (nx > b.minX - pad && nx < b.maxX + pad && nz > b.minZ - pad && nz < b.maxZ + pad) {
      var dl = Math.abs(nx - (b.minX - pad));
      var dr = Math.abs((b.maxX + pad) - nx);
      var dt = Math.abs(nz - (b.minZ - pad));
      var db = Math.abs((b.maxZ + pad) - nz);
      var m = Math.min(dl, dr, dt, db);
      if (m === dl) nx = b.minX - pad;
      else if (m === dr) nx = b.maxX + pad;
      else if (m === dt) nz = b.minZ - pad;
      else nz = b.maxZ + pad;
    }
  }
  return { x: Math.max(-6.45, Math.min(6.45, nx)), z: Math.max(0.55, Math.min(15.65, nz)) };
}

function segIntersectsBox(ax, az, bx, bz, box, pad) {
  var minX = box.minX - pad, maxX = box.maxX + pad;
  var minZ = box.minZ - pad, maxZ = box.maxZ + pad;
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

function routeAroundCafeObstacles(st, startPt, endPt, floorY) {
  var obs = getCafeObstacles(floorY, st.f1Tables, st.f2Tables);
  var hitBox = null, pad = 0.24;
  for (var i = 0; i < obs.length; i++) {
    if (segIntersectsBox(startPt.x, startPt.z, endPt.x, endPt.z, obs[i], pad)) {
      hitBox = obs[i];
      break;
    }
  }
  if (!hitBox) return [endPt];
  var cands = [
    { x: hitBox.minX - 0.36, z: hitBox.minZ - 0.36, y: floorY },
    { x: hitBox.maxX + 0.36, z: hitBox.minZ - 0.36, y: floorY },
    { x: hitBox.minX - 0.36, z: hitBox.maxZ + 0.36, y: floorY },
    { x: hitBox.maxX + 0.36, z: hitBox.maxZ + 0.36, y: floorY }
  ];
  var best = null, bestLen = 9999;
  for (var ci = 0; ci < cands.length; ci++) {
    var cp = cands[ci];
    if (cp.x < -6.45 || cp.x > 6.45 || cp.z < 0.55 || cp.z > 15.65) continue;
    var blocked = false;
    for (var j = 0; j < obs.length; j++) {
      if (segIntersectsBox(startPt.x, startPt.z, cp.x, cp.z, obs[j], 0.16) ||
          segIntersectsBox(cp.x, cp.z, endPt.x, endPt.z, obs[j], 0.16)) {
        blocked = true;
        break;
      }
    }
    var len = Math.hypot(cp.x - startPt.x, cp.z - startPt.z) + Math.hypot(endPt.x - cp.x, endPt.z - cp.z);
    if (!blocked && len < bestLen) { bestLen = len; best = cp; }
  }
  if (!best) return [endPt];
  return [best, endPt];
}

function planCafeRealtimePath(st, tx, targetFloorY, tz, seatChairId, pendingAction) {
  var p = st.pig;
  p.seated = false;
  p.seatChairId = -1;
  p.eating = false;
  p.pendingSeatId = typeof seatChairId === 'number' ? seatChairId : -1;
  p.pendingAction = pendingAction || null;

  var cl = (typeof seatChairId === 'number' && seatChairId >= 0)
    ? { x: tx, z: tz }
    : clampCafeWalkPos(st, tx, tz, targetFloorY);
  tx = cl.x; tz = cl.z;

  var curFloorY = p.y >= 1.9 ? 3.4 : 0;
  var onStairsNow = (p.x >= -5.40 && p.x <= -3.00 && p.z > 9.65 && p.z < 14.35 && p.y > 0.15 && p.y < 3.25);
  var wps = [];

  function pushFlatSegment(fromX, fromZ, toX, toZ, fy) {
    var segs = routeAroundCafeObstacles(st, { x: fromX, z: fromZ, y: fy }, { x: toX, z: toZ, y: fy }, fy);
    for (var s = 0; s < segs.length; s++) wps.push(segs[s]);
  }

  if (curFloorY === 0 && targetFloorY >= 3.0) {
    if (!onStairsNow) {
      pushFlatSegment(p.x, p.z, -4.2, 9.45, 0);
    }
    wps.push({ x: -4.2, z: 14.65, y: 3.4 });
    wps.push({ x: -1.9, z: 14.65, y: 3.4 });
    pushFlatSegment(-1.9, 14.65, tx, tz, 3.4);
  } else if (curFloorY >= 3.0 && targetFloorY < 1.0) {
    if (!onStairsNow) {
      pushFlatSegment(p.x, p.z, -1.9, 14.65, 3.4);
      wps.push({ x: -4.2, z: 14.65, y: 3.4 });
    }
    wps.push({ x: -4.2, z: 9.45, y: 0 });
    pushFlatSegment(-4.2, 9.45, tx, tz, 0);
  } else {
    pushFlatSegment(p.x, p.z, tx, tz, targetFloorY >= 3.0 ? 3.4 : 0);
  }

  p.waypoints = wps;
  if (wps.length > 0) {
    p.targetX = wps[0].x;
    p.targetZ = wps[0].z;
    p.walking = true;
  }
}

function stepCafeNpcs(st, dt) {
  if (!st.npcs) return;
  for (var i = 0; i < st.npcs.length; i++) {
    var n = st.npcs[i];
    if (n.state === 'SIT') {
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
      n.y = typeof tgt.y === 'number' ? tgt.y : getCafeSurfaceY(n.x, n.z, n.y);
      n.stepIdx = (n.stepIdx + 1) % n.pts.length;
      if (tgt.sit) {
        n.state = 'SIT';
        n.timer = 4.2 + (i % 4) * 1.4;
        n.yaw = tgt.yaw || 0;
      }
    } else {
      var spd = Math.min(d, 1.45 * dt);
      n.x += (dx / d) * spd;
      n.z += (dz / d) * spd;
      n.y = getCafeSurfaceY(n.x, n.z, n.y);
      n.yaw = cafeLerpAngle(n.yaw || 0, Math.atan2(dx, dz), Math.min(1, dt * 10));
    }
  }
}

function stepCafeTps(st, dt) {
  st.t += dt;
  var p = st.pig;

  for (var pi = 0; pi < st.particles.length; pi++) {
    var pt = st.particles[pi];
    if (pt.kind === 'steam') {
      pt.y += dt * 0.65;
      if (pt.y > 2.65) pt.y = 1.18;
    } else {
      pt.x += Math.sin(st.t * 0.9 + pt.phase) * dt * 0.10;
      pt.y += Math.cos(st.t * 0.7 + pt.phase) * dt * 0.06;
    }
  }

  // Di chuyển tàu thuyền ngoài Sông Bạch Đằng mượt 60fps
  if (st.riverBoats) {
    for (var bi = 0; bi < st.riverBoats.length; bi++) {
      var b = st.riverBoats[bi];
      b.x += b.dir * b.speed * dt;
      if (b.dir > 0 && b.x > 20) b.x = -20;
      if (b.dir < 0 && b.x < -20) b.x = 20;
    }
  }

  stepCafeNpcs(st, dt);

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
        if (p.pendingSeatId >= 0) {
          var ch = st.chairs[p.pendingSeatId];
          if (ch) {
            p.x = ch.x; p.z = ch.z; p.y = ch.floorY;
            p.yaw = Math.atan2(ch.lookX - ch.x, ch.lookZ - ch.z);
            p.seated = true; p.seatChairId = ch.id; p.eating = true;
            if (ch.isAiSeat && typeof st.onRequestOpenChat === 'function') {
              st.onRequestOpenChat();
            }
          }
          p.pendingSeatId = -1;
        }
        if (p.pendingAction === 'order_bar') {
          p.yaw = Math.PI * 0.5;
          st.tagReceived = true;
        } else if (p.pendingAction === 'exit_cafe') {
          st.exiting = true;
        }
        p.pendingAction = null;
      }
    } else {
      var onStairs = (p.x >= -5.45 && p.x <= -2.95 && p.z > 9.5 && p.z < 14.5);
      // Tốc độ 3.6 m/s đồng bộ Quán Phở, xoay hướng mượt bằng cafeLerpAngle
      var spd = Math.min(dist, (onStairs ? 2.6 : 3.6) * dt);
      p.x += (dx / dist) * spd;
      p.z += (dz / dist) * spd;
      p.yaw = cafeLerpAngle(p.yaw || 0, Math.atan2(dx, dz), Math.min(1, dt * 12));
    }
  }

  p.y = getCafeSurfaceY(p.x, p.z, p.y);
  st.floor = p.y >= 1.9 ? 2 : 1;

  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.5);
  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== 3. CAMERA TPS NỘI SUY CẦU THANG MƯỢT & RAYCAST 3D 24 GHẾ ==================== */
function computeCafeWebglCamera(cam, st) {
  var p = st.pig;
  var dist = cam.dist || 4.85;
  var sy = Math.sin(cam.yaw), cy = Math.cos(cam.yaw);
  var sp = Math.sin(cam.pitch), cp = Math.cos(cam.pitch);
  var ex = p.x - sy * cp * dist;
  var ey = (p.y + (cam.targetHeight || 0.72)) - sp * dist;
  var ez = p.z - cy * cp * dist;

  ex = Math.max(-6.60, Math.min(6.60, ex));
  ez = Math.max(0.45, Math.min(15.75, ez));

  // Chống kẹt góc sát tường mặt tiền: nếu bị kẹp sát lưng heo (< 2.1m), đẩy nhẹ camera sang ngang/lên
  var hDist = Math.hypot(ex - p.x, ez - p.z);
  if (hDist < 2.1) {
    var pushX = ex >= 0 ? -1.4 : 1.4;
    ex = Math.max(-6.40, Math.min(6.40, ex + pushX));
    ez = Math.max(0.55, Math.min(15.65, ez + (p.z < 2.4 ? 1.8 : 0)));
  }

  // Nội suy tuyến tính chiều cao camera theo p.y -> triệt tiêu hoàn toàn bước nhảy +1.3m ở cầu thang!
  var stairT = Math.max(0, Math.min(1, p.y / 3.4));
  var eyMin = 1.15 + stairT * 3.10;
  var eyMax = 3.20 + stairT * 3.35;
  ey = Math.max(eyMin, Math.min(eyMax, ey));

  var targetLookX = p.x + sy * 1.1;
  var targetLookY = p.y + 1.05;
  var targetLookZ = p.z + cy * 1.1;
  if (!cam.cafeInited || !cam.pos || !isFinite(cam.pos.x)) {
    cam.cafeInited = true;
    cam.pos = { x: ex, y: ey, z: ez };
    cam.lookX = targetLookX; cam.lookY = targetLookY; cam.lookZ = targetLookZ;
  } else {
    cam.pos.x += (ex - cam.pos.x) * 0.24;
    cam.pos.y += (ey - cam.pos.y) * 0.24;
    cam.pos.z += (ez - cam.pos.z) * 0.24;
    cam.lookX += (targetLookX - cam.lookX) * 0.26;
    cam.lookY += (targetLookY - cam.lookY) * 0.26;
    cam.lookZ += (targetLookZ - cam.lookZ) * 0.26;
  }

  var fx = cam.lookX - cam.pos.x, fy = cam.lookY - cam.pos.y, fz = cam.lookZ - cam.pos.z;
  var fl = Math.hypot(fx, fy, fz) || 1;
  fx /= fl; fy /= fl; fz /= fl;
  var rx = -fz, rz = fx;
  var rl = Math.hypot(rx, rz) || 1;
  rx /= rl; rz /= rl;
  cam.F = { x: fx, y: fy, z: fz };
  cam.R = { x: rx, y: 0, z: rz };
  cam.U = { x: fy * rz, y: fz * rx - fx * rz, z: -fy * rx };
}

function raySphereDist(ox, oy, oz, dx, dy, dz, cx, cy, cz, rad) {
  var ocx = cx - ox, ocy = cy - oy, ocz = cz - oz;
  var proj = ocx * dx + ocy * dy + ocz * dz;
  if (proj < 0.2 || proj > 26) return -1;
  var d2 = (ocx*ocx + ocy*ocy + ocz*ocz) - proj*proj;
  return d2 <= rad*rad ? proj : -1;
}

function pickCafeTarget3D(cam, st, sx, sy) {
  var nx = (sx - cam.vw * 0.5) / (cam.focal || 400);
  var ny = (cam.vh * 0.5 - sy) / (cam.focal || 400);
  var dx = cam.F.x + cam.R.x * nx + cam.U.x * ny;
  var dy = cam.F.y + cam.R.y * nx + cam.U.y * ny;
  var dz = cam.F.z + cam.R.z * nx + cam.U.z * ny;
  var dl = Math.hypot(dx, dy, dz) || 1;
  dx /= dl; dy /= dl; dz /= dl;
  var ox = cam.pos.x, oy = cam.pos.y, oz = cam.pos.z;

  // 1. Chạm Heo AI trên Tầng 2 -> đi tới ngồi & mở Chat
  var aiHit = raySphereDist(ox, oy, oz, dx, dy, dz, st.aiCoachPig.x, st.aiCoachPig.y + 0.45, st.aiCoachPig.z, 0.72);
  if (aiHit > 0) {
    var aiChair = st.chairs[st.chairs.length - 1];
    return { kind: 'chair', chair: aiChair, x: aiChair.x, y: aiChair.floorY, z: aiChair.z };
  }

  // 2. Chạm vào BẤT KỲ Ghế nào -> đi bộ real-time tới & ngồi
  var bestChair = null, bestChairT = 999;
  for (var i = 0; i < st.chairs.length; i++) {
    var ch = st.chairs[i];
    var ht = raySphereDist(ox, oy, oz, dx, dy, dz, ch.x, ch.floorY + 0.35, ch.z, 0.62);
    if (ht > 0 && ht < bestChairT) {
      bestChairT = ht; bestChair = ch;
    }
  }
  if (bestChair) {
    return { kind: 'chair', chair: bestChair, x: bestChair.x, y: bestChair.floorY, z: bestChair.z };
  }

  // 3. Chạm Quầy Bartender Tầng 1
  if (dx > 0.02) {
    var tb = (3.25 - ox) / dx;
    if (tb > 0.3 && tb < 20) {
      var by = oy + dy * tb, bz = oz + dz * tb;
      if (by >= 0 && by <= 1.35 && bz >= 4.2 && bz <= 9.6) {
        return { kind: 'bar', x: 2.65, y: 0, z: Math.max(4.4, Math.min(9.3, bz)) };
      }
    }
  }

  // 4. Chạm Cửa Chính Tầng 1 -> bước ra Đại lộ Sài Gòn
  if (dz < -0.02) {
    var td = (0.25 - oz) / dz;
    if (td > 0.3 && td < 20) {
      var ddx = ox + dx * td, ddy = oy + dy * td;
      if (ddy >= 0 && ddy <= 2.75 && Math.abs(ddx) <= 1.25) {
        return { kind: 'exit', x: 0, y: 0, z: 0.72 };
      }
    }
  }

  // 4b. Chạm trực tiếp vào Cầu Thang Gỗ 14 Bậc (rayRampQuad)
  if (typeof rayRampQuad === 'function') {
    var stairHit = rayRampQuad(ox, oy, oz, dx, dy, dz, {
      axis: 'z', minX: -5.4, maxX: -3.0, zStart: 9.6, zEnd: 14.4, yStart: 0, yEnd: 3.4
    });
    if (stairHit) {
      return { kind: 'stair', x: stairHit.x, y: stairHit.y, z: stairHit.z };
    }
  }

  // 5. Chạm vào Sàn Tầng 2 hoặc Sàn Tầng 1 (0 Ban công)
  if (dy < -0.025) {
    var t2 = (3.4 - oy) / dy;
    if (t2 > 0.2 && t2 < 26) {
      var x2 = ox + dx * t2, z2 = oz + dz * t2;
      var inStairHole = (x2 >= -5.4 && x2 <= -3.0 && z2 >= 9.5 && z2 <= 14.35);
      if (x2 >= -6.8 && x2 <= 6.8 && z2 >= 0.4 && z2 <= 16.0 && !inStairHole) {
        return { kind: 'floor', x: x2, y: 3.4, z: z2 };
      }
    }
    var t1 = (0 - oy) / dy;
    if (t1 > 0.2 && t1 < 30) {
      var x1 = ox + dx * t1, z1 = oz + dz * t1;
      if (x1 >= -6.8 && x1 <= 6.8 && z1 >= 0.4 && z1 <= 16.0) {
        return { kind: 'floor', x: x1, y: 0, z: z1 };
      }
    }
  }
  return null;
}

/* ==================== 4. ĐỒ HỌA NỘI THẤT CHI TIẾT: CÂY NOEL 3D, XE MÁY CỔ, TỦ SÁCH, ĐỒNG HỒ, SOFA & SÔNG BẠCH ĐẰNG ==================== */
function drawCafeHumanWebgl(wgl, cam, h, t) {
  if (typeof drawHumanBillboardWebgl === 'function') {
    drawHumanBillboardWebgl(wgl, cam, h, t);
  }
}

function drawCoconutCoffee3D(wgl, x, y, z) {
  var dm = wgl.drawMesh;
  dm('cup', 'white', x, y + 0.08, z, 0, 0, 0, 0.09, 0.15, 0.09, { tint: [0.78, 0.56, 0.36, 0.94], specPow: 96, rim: 0.35 });
  dm('sphere', 'white', x, y + 0.165, z, 0, 0, 0, 0.095, 0.075, 0.095, { tint: [0.99, 0.98, 0.96, 1], rim: 0.25 });
  dm('cyl', 'white', x + 0.03, y + 0.18, z, 0.22, 0, -0.18, 0.014, 0.16, 0.014, { tint: [0.76, 0.58, 0.32, 1] });
}

function drawTeaPotSet3D(wgl, x, y, z) {
  var dm = wgl.drawMesh;
  dm('sphere', 'white', x, y + 0.08, z, 0, 0, 0, 0.17, 0.14, 0.17, { tint: [0.85, 0.92, 0.96, 1], specPow: 84 });
  dm('cyl', 'white', x, y + 0.14, z, 0, 0, 0, 0.07, 0.03, 0.07, { tint: [0.16, 0.36, 0.65, 1] });
  dm('cup', 'white', x + 0.14, y + 0.03, z + 0.06, 0, 0, 0, 0.055, 0.05, 0.055, { tint: [0.95, 0.97, 0.98, 1] });
  dm('cup', 'white', x - 0.14, y + 0.03, z + 0.06, 0, 0, 0, 0.055, 0.05, 0.055, { tint: [0.95, 0.97, 0.98, 1] });
}

function drawFlowerVase3D(wgl, x, y, z, pink) {
  var dm = wgl.drawMesh;
  dm('cyl', 'white', x, y + 0.11, z, 0, 0, 0, 0.10, 0.22, 0.10, { tint: [0.20, 0.42, 0.68, 1], specPow: 64 });
  dm('cyl', 'white', x, y + 0.25, z, 0, 0, 0, 0.025, 0.16, 0.025, { tint: [0.18, 0.52, 0.22, 1] });
  var c1 = pink ? [0.96, 0.45, 0.65, 1] : [0.98, 0.82, 0.18, 1];
  dm('sphere', 'white', x - 0.04, y + 0.34, z, 0, 0, 0, 0.09, 0.09, 0.09, { tint: c1, rim: 0.28 });
  dm('sphere', 'white', x + 0.04, y + 0.31, z + 0.03, 0, 0, 0, 0.08, 0.08, 0.08, { tint: c1, rim: 0.28 });
}

function drawSunflowerSeedsPlate3D(wgl, x, y, z) {
  var dm = wgl.drawMesh;
  dm('cyl', 'white', x, y + 0.015, z, 0, 0, 0, 0.16, 0.025, 0.16, { tint: [0.96, 0.95, 0.92, 1], specPow: 64 });
  dm('sphere', 'white', x, y + 0.03, z, 0, 0, 0, 0.11, 0.03, 0.11, { tint: [0.22, 0.20, 0.18, 1] });
}

// Chậu cây lá xòe nhiều tầng (thay thế hoàn toàn cây trụ + cầu thô)
function drawLushPlanter3D(wgl, x, y, z, scale, t) {
  var dm = wgl.drawMesh;
  var sc = scale || 1.0;
  dm('cup', 'white', x, y + 0.22 * sc, z, 0, 0, 0, 0.36 * sc, 0.44 * sc, 0.36 * sc, { tint: [0.68, 0.35, 0.20, 1] });
  dm('cyl', 'timber', x, y + 0.44 * sc, z, 0, 0, 0, 0.38 * sc, 0.06 * sc, 0.38 * sc, { tint: [0.28, 0.20, 0.14, 1] });
  dm('cyl', 'timber', x, y + 0.72 * sc, z, 0, 0.12, 0.08, 0.06 * sc, 0.62 * sc, 0.06 * sc, { tint: [0.46, 0.32, 0.20, 1] });
  for (var tier = 0; tier < 2; tier++) {
    var fy = y + (0.68 + tier * 0.36) * sc;
    var rad = (0.28 - tier * 0.07) * sc;
    for (var i = 0; i < 6; i++) {
      var a = i * (Math.PI / 3) + tier * 0.5 + Math.sin(t * 1.1 + i) * 0.03;
      dm('quad', 'fernLeaf', x + Math.cos(a) * rad, fy, z + Math.sin(a) * rad, 0.58 - tier * 0.12, a, 0, 0.46 * sc, 0.66 * sc, 0.46 * sc, { tint: [1, 1.06, 0.92, 1] });
    }
  }
}

// Cây Thông Noel 3D 5 tầng tán + quả châu + ngôi sao phát sáng + 3 hộp quà (Tầng 1)
function drawChristmasTree3D(wgl, x, y, z, t) {
  var dm = wgl.drawMesh;
  dm('cup', 'white', x, y + 0.22, z, 0, 0, 0, 0.46, 0.44, 0.46, { tint: [0.68, 0.18, 0.14, 1] });
  dm('cyl', 'timber', x, y + 0.58, z, 0, 0, 0, 0.14, 0.48, 0.14, { tint: [0.44, 0.28, 0.16, 1] });
  for (var tier = 0; tier < 5; tier++) {
    var tw = 1.48 - tier * 0.24;
    var ty = y + 0.92 + tier * 0.38;
    dm('cone', 'treePine', x, ty, z, 0, tier * 0.45, 0, tw, 0.64, tw, { tint: [0.95, 1.02, 0.95, 1], us: 2, vs: 1.5 });
    for (var oi = 0; oi < 4; oi++) {
      var ang = oi * (Math.PI * 0.5) + tier * 0.78 + t * 0.18;
      var rad = tw * 0.39;
      var col = (oi + tier) % 3 === 0 ? [0.96, 0.20, 0.20, 1] : ((oi + tier) % 3 === 1 ? [0.98, 0.84, 0.22, 1] : [0.22, 0.72, 0.96, 1]);
      var glow = 0.75 + 0.55 * Math.sin(t * 3.5 + tier + oi);
      dm('sphere', 'white', x + Math.cos(ang) * rad, ty - 0.14, z + Math.sin(ang) * rad, 0, 0, 0, 0.10, 0.10, 0.10, { tint: col, emissive: glow });
    }
  }
  dm('sphere', 'white', x, y + 2.86, z, 0, t * 0.8, 0, 0.18, 0.22, 0.10, { tint: [1.0, 0.88, 0.25, 1], emissive: 1.6 });
  // 3 hộp quà Noel buộc nơ dưới gốc cây
  var gifts = [
    { gx: -0.45, gz: 0.42, w: 0.34, h: 0.28, c: [0.82, 0.16, 0.18, 1], r: [0.98, 0.82, 0.22, 1] },
    { gx:  0.42, gz: 0.36, w: 0.30, h: 0.24, c: [0.14, 0.52, 0.30, 1], r: [0.98, 0.94, 0.84, 1] },
    { gx:  0.02, gz: 0.56, w: 0.26, h: 0.22, c: [0.18, 0.42, 0.78, 1], r: [0.98, 0.84, 0.25, 1] }
  ];
  for (var gi = 0; gi < gifts.length; gi++) {
    var gf = gifts[gi];
    dm('box', 'white', x + gf.gx, y + gf.h * 0.5, z + gf.gz, 0, 0.25 * gi, 0, gf.w, gf.h, gf.w, { tint: gf.c });
    dm('box', 'white', x + gf.gx, y + gf.h * 0.5, z + gf.gz, 0, 0.25 * gi, 0, gf.w + 0.02, gf.h + 0.02, 0.05, { tint: gf.r });
  }
}

// Xe máy cổ 3D (Honda Cub / Vespa retro: 2 bánh nan hoa, thân đỏ kem, yên da đôi, tay lái chữ T, đèn tròn)
function drawVintageMotorbike3D(wgl, x, y, z, yaw) {
  var dm = wgl.drawMesh;
  var sy = Math.sin(yaw), cy = Math.cos(yaw);
  function wp(lx, lz) { return [x + lx * cy + lz * sy, x - (-lx) * cy + lz * sy]; } // helpers along facing
  var fX = x + sy * 0.54, fZ = z + cy * 0.54;
  var rX = x - sy * 0.52, rZ = z - cy * 0.52;
  // Bánh trước & bánh sau + vành bạc
  dm('cyl', 'white', fX, y + 0.26, fZ, 0, yaw + Math.PI * 0.5, Math.PI * 0.5, 0.48, 0.14, 0.48, { tint: [0.14, 0.14, 0.16, 1] });
  dm('cyl', 'white', fX, y + 0.26, fZ, 0, yaw + Math.PI * 0.5, Math.PI * 0.5, 0.28, 0.16, 0.28, { tint: [0.80, 0.82, 0.86, 1], specPow: 90 });
  dm('cyl', 'white', rX, y + 0.26, rZ, 0, yaw + Math.PI * 0.5, Math.PI * 0.5, 0.48, 0.15, 0.48, { tint: [0.14, 0.14, 0.16, 1] });
  dm('cyl', 'white', rX, y + 0.26, rZ, 0, yaw + Math.PI * 0.5, Math.PI * 0.5, 0.28, 0.17, 0.28, { tint: [0.80, 0.82, 0.86, 1], specPow: 90 });
  // Thân xe đỏ cổ điển + yếm kem
  dm('box', 'white', x - sy * 0.12, y + 0.52, z - cy * 0.12, 0, yaw, 0, 0.34, 0.34, 0.92, { tint: [0.76, 0.18, 0.16, 1], specPow: 64 });
  dm('box', 'white', x + sy * 0.34, y + 0.62, z + cy * 0.34, -0.24, yaw, 0, 0.44, 0.66, 0.10, { tint: [0.96, 0.93, 0.84, 1], specPow: 48 });
  // Yên da bò & Ống pô mạ crom
  dm('box', 'timber', x - sy * 0.24, y + 0.74, z - cy * 0.24, 0, yaw, 0, 0.30, 0.12, 0.68, { tint: [0.56, 0.32, 0.18, 1] });
  dm('cyl', 'white', x + cy * 0.19 - sy * 0.28, y + 0.24, z - sy * 0.19 - cy * 0.28, Math.PI * 0.5, yaw, 0, 0.08, 0.86, 0.08, { tint: [0.82, 0.84, 0.88, 1], specPow: 96 });
  // Cổ lái + Tay lái chữ T + Đèn pha tròn phát sáng ấm
  dm('cyl', 'white', x + sy * 0.44, y + 0.78, z + cy * 0.44, -0.22, yaw, 0, 0.08, 0.66, 0.08, { tint: [0.76, 0.18, 0.16, 1] });
  dm('box', 'white', x + sy * 0.38, y + 1.06, z + cy * 0.38, 0, yaw, 0, 0.62, 0.06, 0.06, { tint: [0.82, 0.84, 0.86, 1] });
  dm('sphere', 'white', x + sy * 0.52, y + 0.98, z + cy * 0.52, 0, yaw, 0, 0.18, 0.18, 0.16, { tint: [1.0, 0.92, 0.62, 1], emissive: 1.35 });
}

// Tủ Kệ Sách Gỗ Nhiều Tầng có các hàng sách 3D nhiều màu
function drawDetailedBookshelf3D(wgl, x, y, z, yaw) {
  var dm = wgl.drawMesh;
  dm('box', 'timber', x, y + 1.25, z, 0, yaw, 0, 2.75, 2.50, 0.46, { tint: [0.58, 0.38, 0.24, 1] });
  dm('quad', 'vnBookShelfTex', x + Math.sin(yaw) * 0.24, y + 1.28, z + Math.cos(yaw) * 0.24, 0, yaw, 0, 2.58, 2.26, 1, { tint: [1, 1, 1, 1] });
  var shelfYs = [0.42, 0.96, 1.50, 2.04];
  for (var si = 0; si < shelfYs.length; si++) {
    dm('box', 'timber', x + Math.sin(yaw) * 0.04, y + shelfYs[si], z + Math.cos(yaw) * 0.04, 0, yaw, 0, 2.66, 0.06, 0.50, { tint: [0.78, 0.56, 0.36, 1] });
  }
}

// Đồng hồ quả lắc gỗ cổ điển có con lắc đung đưa 60fps
function drawGrandfatherClock3D(wgl, x, y, z, yaw, t) {
  var dm = wgl.drawMesh;
  var sy = Math.sin(yaw), cy = Math.cos(yaw);
  dm('box', 'timber', x, y + 1.15, z, 0, yaw, 0, 0.68, 2.30, 0.44, { tint: [0.48, 0.28, 0.16, 1] });
  dm('box', 'timber', x, y + 2.38, z, 0, yaw, 0, 0.78, 0.18, 0.52, { tint: [0.62, 0.38, 0.22, 1] });
  dm('cyl', 'white', x + sy * 0.23, y + 1.88, z + cy * 0.23, Math.PI * 0.5, yaw, 0, 0.42, 0.04, 0.42, { tint: [0.98, 0.95, 0.85, 1] });
  var swing = Math.sin(t * 2.8) * 0.11;
  dm('cyl', 'white', x + sy * 0.24 + cy * swing, y + 1.05, z + cy * 0.24 - sy * swing, 0, yaw, 0, 0.14, 0.04, 0.14, { tint: [0.96, 0.78, 0.22, 1], specPow: 96 });
}

function drawHangingNonLa3D(wgl, x, y, z, ry) {
  var dm = wgl.drawMesh;
  dm('cone', 'white', x, y, z, 0.18, ry || 0, 0, 0.58, 0.22, 0.58, { tint: [0.92, 0.82, 0.58, 1], rim: 0.24 });
  dm('cyl', 'white', x, y - 0.12, z, 0, ry || 0, 0.2, 0.03, 0.24, 0.03, { tint: [0.12, 0.55, 0.26, 1] });
}

function drawAoDaiRack3D(wgl, x, y, z, ry) {
  var dm = wgl.drawMesh;
  dm('cyl', 'timber', x, y + 0.85, z, 0, ry, 0, 0.06, 1.7, 0.06, { tint: [0.5, 0.32, 0.2, 1] });
  dm('box', 'timber', x, y + 1.65, z, 0, ry, 0, 0.72, 0.05, 0.05, { tint: [0.6, 0.4, 0.24, 1] });
  dm('quad', 'vnAoDaiArt', x, y + 1.05, z + 0.04, 0, ry, 0, 0.68, 1.05, 1, { tint: [1, 1, 1, 1] });
}

function drawSofaBooth3D(wgl, x, y, z, dir) {
  var dm = wgl.drawMesh;
  var yaw = dir > 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
  // Ghế Sofa dài bọc nhung xanh ngọc + gối vải Chăn Con Công
  dm('box', 'timber', x - dir * 0.45, y + 0.20, z, 0, yaw, 0, 1.65, 0.34, 0.68, { tint: [0.62, 0.44, 0.28, 1] });
  dm('box', 'sofaVelvet', x - dir * 0.45, y + 0.40, z, 0, yaw, 0, 1.56, 0.14, 0.62, { tint: [1, 1, 1, 1], us: 2, vs: 1 });
  dm('box', 'sofaVelvet', x - dir * 0.72, y + 0.68, z, 0, yaw, 0, 1.58, 0.54, 0.16, { tint: [1, 1, 1, 1], us: 2, vs: 1 });
  dm('box', 'peacockFabric', x - dir * 0.58, y + 0.56, z - 0.44, -0.2, yaw, 0, 0.32, 0.28, 0.14, { tint: [1, 1, 1, 1] });
  dm('box', 'peacockFabric', x - dir * 0.58, y + 0.56, z + 0.44, -0.2, yaw, 0, 0.32, 0.28, 0.14, { tint: [1, 1, 1, 1] });
  // Bàn trà gỗ đi kèm + ấm trà
  dm('box', 'timber', x + dir * 0.22, y + 0.52, z, 0, 0, 0, 0.66, 0.06, 1.15, { tint: [0.95, 0.88, 0.76, 1] });
  dm('cyl', 'timber', x + dir * 0.22, y + 0.25, z - 0.36, 0, 0, 0, 0.08, 0.48, 0.08, { tint: [0.55, 0.38, 0.24, 1] });
  dm('cyl', 'timber', x + dir * 0.22, y + 0.25, z + 0.36, 0, 0, 0, 0.08, 0.48, 0.08, { tint: [0.55, 0.38, 0.24, 1] });
  drawTeaPotSet3D(wgl, x + dir * 0.22, y + 0.55, z);
}

function drawWoodenStool3D(wgl, x, y, z) {
  var dm = wgl.drawMesh;
  dm('cyl', 'timber', x, y + 0.32, z, 0, 0, 0, 0.38, 0.06, 0.38, { tint: [0.88, 0.72, 0.52, 1] });
  dm('cyl', 'timber', x - 0.12, y + 0.16, z - 0.12, 0, 0, 0, 0.05, 0.32, 0.05, { tint: [0.55, 0.36, 0.22, 1] });
  dm('cyl', 'timber', x + 0.12, y + 0.16, z - 0.12, 0, 0, 0, 0.05, 0.32, 0.05, { tint: [0.55, 0.36, 0.22, 1] });
  dm('cyl', 'timber', x - 0.12, y + 0.16, z + 0.12, 0, 0, 0, 0.05, 0.32, 0.05, { tint: [0.55, 0.36, 0.22, 1] });
  dm('cyl', 'timber', x + 0.12, y + 0.16, z + 0.12, 0, 0, 0, 0.05, 0.32, 0.05, { tint: [0.55, 0.36, 0.22, 1] });
}

function drawDetailedChair3D(wgl, x, y, z, yaw, kind) {
  if (kind === 'stool') { drawWoodenStool3D(wgl, x, y, z); return; }
  var dm = wgl.drawMesh;
  var sy = Math.sin(yaw), cy = Math.cos(yaw);
  if (kind === 'wood' || kind === 'library') {
    dm('box', 'timber', x, y + 0.38, z, 0, yaw, 0, 0.44, 0.06, 0.44, { tint: [0.85, 0.72, 0.55, 1] });
    dm('box', 'timber', x - sy*0.18, y + 0.62, z - cy*0.18, 0, yaw, 0, 0.42, 0.44, 0.06, { tint: [0.8, 0.65, 0.48, 1] });
    dm('cyl', 'timber', x - 0.16, y + 0.19, z - 0.16, 0, 0, 0, 0.05, 0.38, 0.05, { tint: [0.55, 0.38, 0.25, 1] });
    dm('cyl', 'timber', x + 0.16, y + 0.19, z - 0.16, 0, 0, 0, 0.05, 0.38, 0.05, { tint: [0.55, 0.38, 0.25, 1] });
    dm('cyl', 'timber', x - 0.16, y + 0.19, z + 0.16, 0, 0, 0, 0.05, 0.38, 0.05, { tint: [0.55, 0.38, 0.25, 1] });
    dm('cyl', 'timber', x + 0.16, y + 0.19, z + 0.16, 0, 0, 0, 0.05, 0.38, 0.05, { tint: [0.55, 0.38, 0.25, 1] });
    return;
  }
  dm('box', 'timber', x, y + 0.20, z, 0, yaw, 0, 0.54, 0.36, 0.52, { tint: [0.76, 0.56, 0.36, 1] });
  dm('box', 'peacockFabric', x, y + 0.42, z, 0, yaw, 0, 0.46, 0.10, 0.46, { tint: [1,1,1,1], us: 1.4, vs: 1.4 });
  dm('box', 'peacockFabric', x - sy*0.19, y + 0.66, z - cy*0.19, -0.14, yaw, 0, 0.44, 0.42, 0.12, { tint: [1,1,1,1], us: 1.2, vs: 1.2 });
  dm('box', 'timber', x + cy*0.26, y + 0.52, z - sy*0.26, 0, yaw, 0, 0.06, 0.24, 0.48, { tint: [0.52, 0.34, 0.20, 1] });
  dm('box', 'timber', x - cy*0.26, y + 0.52, z + sy*0.26, 0, yaw, 0, 0.06, 0.24, 0.48, { tint: [0.52, 0.34, 0.20, 1] });
}

function drawRiverBoat3D(wgl, x, y, z, dir, len, col, t) {
  var dm = wgl.drawMesh;
  var bob = Math.sin(t * 2.2 + x * 0.4) * 0.04;
  dm('box', 'timber', x, y + 0.18 + bob, z, 0, 0, 0, len, 0.34, 0.92, { tint: col });
  dm('box', 'white', x + dir * len * 0.48, y + 0.22 + bob, z, 0, Math.PI * 0.25, 0, 0.68, 0.26, 0.68, { tint: col });
  dm('box', 'white', x - dir * 0.25, y + 0.52 + bob, z, 0, 0, 0, len * 0.44, 0.42, 0.68, { tint: [0.98, 0.96, 0.90, 1] });
  dm('box', 'white', x - dir * 0.25, y + 0.56 + bob, z + 0.35, 0, 0, 0, len * 0.30, 0.16, 0.03, { tint: [0.16, 0.48, 0.72, 1], emissive: 0.4 });
}

/* ==================== 5. RENDER WEBGL 3D TOÀN CẢNH QUÁN CÀ PHÊ SÀI GÒN 2 TẦNG (14M × 16M) ==================== */
function renderCafeWebglScene(wgl, cam, st, W, H) {
  computeCafeWebglCamera(cam, st);
  wgl.beginFrame(W, H, cam);
  var dm = wgl.drawMesh;

  // A. CẢNH QUAN BÊN NGOÀI CỬA SỔ: VỈA HÈ ĐẠI LỘ -> BỜ KÈ CÂY XANH -> SÔNG BẠCH ĐẰNG + THUYỀN CHẠY -> BỜ THỦ THIÊM
  dm('box', 'cementFloor', 0, -0.08, -2.1, 0, 0, 0, 32, 0.1, 4.6, { tint: [0.78, 0.74, 0.66, 1], us: 8, vs: 2 });
  dm('box', 'white',       0,  0.42, -4.4, 0, 0, 0, 32, 0.10, 0.12, { tint: [0.32, 0.28, 0.24, 1] });
  dm('box', 'riverWater',  0, -0.28, -14.5, 0, 0, 0, 48, 0.08, 20.0, { tint: [1, 1, 1, 1], us: 8, vs: 4 });
  dm('box', 'fernLeaf',    0,  0.40, -25.8, 0, 0, 0, 48, 1.4, 3.2, { tint: [0.36, 0.58, 0.26, 1], us: 8, vs: 1 });
  dm('quad', 'white',      0,  9.50, -27.5, 0, 0, 0, 52, 22, 1, { tint: [0.96, 0.85, 0.62, 1], emissive: 1.0 });
  if (st.riverBoats) {
    for (var rbi = 0; rbi < st.riverBoats.length; rbi++) {
      var rb = st.riverBoats[rbi];
      drawRiverBoat3D(wgl, rb.x, -0.24, rb.z, rb.dir, rb.len, rb.color, st.t);
    }
  }
  // Hàng cây bờ sông + 2 chậu cây ngoài cửa khớp Tab Banner
  var bankXs = [-5.8, -2.4, 2.4, 5.8];
  for (var bxi = 0; bxi < bankXs.length; bxi++) {
    drawLushPlanter3D(wgl, bankXs[bxi], 0, -3.5, 1.65, st.t + bxi);
  }
  drawLushPlanter3D(wgl, -2.05, 0, -0.55, 1.05, st.t);
  drawLushPlanter3D(wgl,  2.05, 0, -0.55, 1.05, st.t + 1.0);

  // B. KẾT CẤU QUÁN 2 TẦNG 14M × 16M & MẶT TIỀN KHỚP 1:1 TAB BANNER (#F7E7C6, 0 BAN CÔNG)
  dm('box', 'cementFloor', 0, -0.05, 8.2, 0, 0, 0, 14.2, 0.1, 16.0, { tint: [1,1,1,1], us: 5, vs: 6 });
  dm('box', 'oliveWall', -7.05, 3.45, 8.2, 0, 0, 0, 0.16, 6.9, 16.0, { tint: [1,1,1,1], us: 5, vs: 2 });
  dm('box', 'oliveWall',  7.05, 3.45, 8.2, 0, 0, 0, 0.16, 6.9, 16.0, { tint: [1,1,1,1], us: 5, vs: 2 });
  dm('box', 'oliveWall',  0,    3.45, 16.25, 0, 0, 0, 14.2, 6.9, 0.16, { tint: [1,1,1,1], us: 4.5, vs: 2 });

  // Mặt tiền Tầng 1 (Z = 0.2): 2 cửa sổ kính lớn hai bên + cửa chính + mái hiên sọc đỏ kem + biển CÀ PHÊ SÀI GÒN
  dm('box', 'cafeCreamWall', -6.30, 1.70, 0.2, 0, 0, 0, 1.40, 3.4, 0.16, { tint: [1,1,1,1] });
  dm('box', 'cafeCreamWall', -1.95, 1.70, 0.2, 0, 0, 0, 1.30, 3.4, 0.16, { tint: [1,1,1,1] });
  dm('box', 'cafeCreamWall',  1.95, 1.70, 0.2, 0, 0, 0, 1.30, 3.4, 0.16, { tint: [1,1,1,1] });
  dm('box', 'cafeCreamWall',  6.30, 1.70, 0.2, 0, 0, 0, 1.40, 3.4, 0.16, { tint: [1,1,1,1] });
  dm('box', 'cafeCreamWall', -4.10, 0.42, 0.2, 0, 0, 0, 3.00, 0.84, 0.16, { tint: [1,1,1,1] });
  dm('box', 'cafeCreamWall',  4.10, 0.42, 0.2, 0, 0, 0, 3.00, 0.84, 0.16, { tint: [1,1,1,1] });
  dm('box', 'cafeCreamWall',  0,    3.05, 0.2, 0, 0, 0, 14.0, 0.72, 0.16, { tint: [1,1,1,1] });
  dm('quad', 'vnDoorWood',    0,    1.35, 0.26, 0, 0, 0, 2.55, 2.68, 1, { tint: [1,1,1,1] });
  // 2 Khung cửa sổ kính Tầng 1 nhìn thẳng ra vỉa hè & sông
  dm('box', 'timber', -4.10, 1.76, 0.20, 0, 0, 0, 0.08, 1.84, 0.18, { tint: [0.55, 0.36, 0.22, 1] });
  dm('box', 'timber',  4.10, 1.76, 0.20, 0, 0, 0, 0.08, 1.84, 0.18, { tint: [0.55, 0.36, 0.22, 1] });
  // Mái hiên sọc đỏ kem + Biển gỗ ★ CÀ PHÊ SÀI GÒN ★ bên ngoài
  dm('box', 'awningStripe', 0, 3.12, -0.58, 0.34, 0, 0, 13.8, 0.10, 1.55, { tint: [1,1,1,1], us: 5, vs: 1 });
  dm('quad', 'cafeWoodSign', 0, 3.75, 0.05, 0, 0, 0, 4.4, 1.05, 1, { tint: [1,1,1,1] });

  // Mặt tiền Tầng 2 (Z = 0.2, Y: 3.4 → 6.8): 3 CỬA SỔ VÒM KÍNH LỚN NHÌN THẲNG RA SÔNG BẠCH ĐẰNG (0 Ban Công!)
  var winCenters = [-4.30, 0.0, 4.30];
  var pillXs = [-6.20, -2.15, 2.15, 6.20];
  var pillWs = [1.60, 2.10, 2.10, 1.60];
  for (var pxi = 0; pxi < pillXs.length; pxi++) {
    dm('box', 'cafeCreamWall', pillXs[pxi], 5.10, 0.2, 0, 0, 0, pillWs[pxi], 3.4, 0.16, { tint: [1,1,1,1] });
  }
  for (var wi = 0; wi < winCenters.length; wi++) {
    var wx = winCenters[wi];
    dm('box', 'cafeCreamWall', wx, 3.78, 0.2, 0, 0, 0, 2.24, 0.76, 0.16, { tint: [1,1,1,1] });
    dm('box', 'cafeCreamWall', wx, 6.46, 0.2, 0, 0, 0, 2.24, 0.74, 0.16, { tint: [1,1,1,1] });
    dm('box', 'timber', wx - 1.10, 5.12, 0.2, 0, 0, 0, 0.08, 1.96, 0.18, { tint: [0.55, 0.36, 0.22, 1] });
    dm('box', 'timber', wx + 1.10, 5.12, 0.2, 0, 0, 0, 0.08, 1.96, 0.18, { tint: [0.55, 0.36, 0.22, 1] });
    dm('box', 'timber', wx,        5.12, 0.2, 0, 0, 0, 0.06, 1.96, 0.14, { tint: [0.55, 0.36, 0.22, 1] });
    dm('box', 'timber', wx,        5.12, 0.2, 0, 0, 0, 2.20, 0.06, 0.14, { tint: [0.55, 0.36, 0.22, 1] });
  }
  wgl.setBlend('alpha');
  for (var gwi = 0; gwi < winCenters.length; gwi++) {
    dm('quad', 'white', winCenters[gwi], 5.12, 0.21, 0, 0, 0, 2.12, 1.88, 1, { tint: [0.80, 0.94, 1.0, 0.18], emissive: 0.4 });
  }
  dm('quad', 'white', -4.10, 1.76, 0.21, 0, 0, 0, 2.90, 1.80, 1, { tint: [0.82, 0.94, 1.0, 0.18], emissive: 0.35 });
  dm('quad', 'white',  4.10, 1.76, 0.21, 0, 0, 0, 2.90, 1.80, 1, { tint: [0.82, 0.94, 1.0, 0.18], emissive: 0.35 });
  wgl.setBlend(null);

  // Sàn Gạch Bông Tầng 2 (chừa lỗ cầu thang X ∈ [-5.4, -3.0], Z ∈ [9.6, 14.4]) & Trần Gỗ Gụ
  dm('box', 'gachBong',  2.0,  3.35, 8.2,  0, 0, 0, 10.0, 0.12, 16.0, { tint: [1,1,1,1], us: 5.5, vs: 9 });
  dm('box', 'gachBong', -6.2,  3.35, 8.2,  0, 0, 0, 1.6,  0.12, 16.0, { tint: [1,1,1,1], us: 1, vs: 9 });
  dm('box', 'gachBong', -4.2,  3.35, 4.9,  0, 0, 0, 2.4,  0.12, 9.4,  { tint: [1,1,1,1], us: 1.5, vs: 5 });
  dm('box', 'gachBong', -4.2,  3.35, 15.3, 0, 0, 0, 2.4,  0.12, 1.8,  { tint: [1,1,1,1], us: 1.5, vs: 1 });
  dm('box', 'timber',    0,    6.90, 8.2,  0, 0, 0, 14.2, 0.16, 16.0, { tint: [1,1,1,1], us: 5, vs: 6 });

  // C. TẦNG 1: CÂY NOEL 3D, XE MÁY CỔ 3D, TỦ SÁCH GỖ, ĐỒNG HỒ QUẢ LẮC, QUẦY BAR & VĂN HÓA VIỆT
  drawChristmasTree3D(wgl, -5.15, 0, 2.15, st.t);
  drawVintageMotorbike3D(wgl, 5.15, 0, 2.25, -Math.PI * 0.38);
  drawDetailedBookshelf3D(wgl, -6.55, 0, 6.40, Math.PI * 0.5);
  drawGrandfatherClock3D(wgl, 6.45, 0, 12.60, -Math.PI * 0.5, st.t);

  dm('quad', 'vnCycloArt',  -6.92, 2.05, 3.85, 0, Math.PI * 0.5, 0, 1.45, 1.35, 1, { tint: [1,1,1,1] });
  dm('quad', 'vnQuietSign', -6.92, 2.55, 4.80, 0, Math.PI * 0.5, 0, 0.85, 0.85, 1, { tint: [1,1,1,1] });
  dm('quad', 'vnLotusArt',  -6.92, 2.05, 9.10, 0, Math.PI * 0.5, 0, 1.45, 1.35, 1, { tint: [1,1,1,1] });
  drawHangingNonLa3D(wgl, -6.75, 2.35, 4.65, Math.PI * 0.5);
  drawHangingNonLa3D(wgl, -6.75, 2.35, 10.6, Math.PI * 0.5);
  drawAoDaiRack3D(wgl, -6.30, 0, 12.2, Math.PI * 0.5);

  // Tường Sau Tầng 1
  dm('quad', 'photos1980s',  0.65, 1.95, 16.12, 0, Math.PI, 0, 3.8, 1.75, 1, { tint: [1,1,1,1] });
  dm('quad', 'vnFlagMaiArt', 4.10, 2.00, 16.12, 0, Math.PI, 0, 1.65, 1.55, 1, { tint: [1,1,1,1] });

  // Quầy Bartender Tầng 1 + Enamel Menu CÀ PHÊ SÀI GÒN
  dm('box', 'timber',      3.85, 0.54, 6.95, 0, 0, 0, 1.15, 1.08, 5.5, { tint: [0.95, 0.88, 0.80, 1], us: 3, vs: 1 });
  dm('box', 'cementFloor', 3.85, 1.11, 6.95, 0, 0, 0, 1.26, 0.08, 5.6, { tint: [1.15, 1.1, 1.0, 1], specPow: 48 });
  dm('quad', 'vnPickUpSign', 3.45, 2.28, 4.60, 0, -Math.PI * 0.5, 0, 0.78, 0.92, 1, { tint: [1,1,1,1] });
  dm('quad', 'enamelMenu',   6.92, 2.30, 6.90, 0, -Math.PI * 0.5, 0, 3.2, 1.55, 1, { tint: [1,1,1,1] });
  dm('quad', 'vnAoDaiArt',   6.92, 2.05, 10.6, 0, -Math.PI * 0.5, 0, 1.55, 1.45, 1, { tint: [1,1,1,1] });
  dm('box', 'white', 4.05, 1.38, 7.8, 0, 0, 0, 0.52, 0.48, 0.62, { tint: [0.76, 0.78, 0.80, 1], specPow: 80 });
  dm('cup', 'white', 3.95, 1.38, 6.7, 0, 0, 0, 0.22, 0.42, 0.22, { tint: [0.85, 0.94, 0.98, 0.75], specPow: 96 });
  for (var ph = 0; ph < 4; ph++) {
    dm('cyl', 'white', 3.65, 1.21, 5.0 + ph * 0.35, 0, 0, 0, 0.11, 0.13, 0.11, { tint: [0.82, 0.84, 0.86, 1], specPow: 90 });
  }
  for (var li = 0; li < 3; li++) {
    dm('cyl', 'white', 3.55, 2.85, 5.1 + li * 1.8, 0, 0, 0, 0.02, 0.8, 0.02, { tint: [0.1,0.1,0.1,1] });
    dm('sphere', 'white', 3.55, 2.42, 5.1 + li * 1.8, 0, 0, 0, 0.16, 0.18, 0.16, { tint: [1.0, 0.86, 0.45, 1], emissive: 1.5 });
  }
  for (var bsi = 0; bsi < st.baristas.length; bsi++) drawCafeHumanWebgl(wgl, cam, st.baristas[bsi], st.t);

  // Bàn Tầng 1 + cây xanh Tầng 1
  for (var t1i = 0; t1i < st.f1Tables.length; t1i++) {
    var t1 = st.f1Tables[t1i];
    dm('box', 'timber', t1.x, 0.56, t1.z, 0, 0, 0, t1.rx * 1.75, 0.07, t1.rz * 1.75, { tint: [1,1,1,1] });
    dm('cyl', 'timber', t1.x, 0.28, t1.z, 0, 0, 0, 0.15, 0.52, 0.15, { tint: [0.8,0.8,0.8,1] });
    if (t1i % 2 === 0) drawCoconutCoffee3D(wgl, t1.x - 0.12, 0.60, t1.z);
    else drawFlowerVase3D(wgl, t1.x, 0.60, t1.z, t1i === 1);
  }
  drawLushPlanter3D(wgl, -2.45, 0, 1.05, 0.95, st.t);
  drawLushPlanter3D(wgl,  2.45, 0, 1.05, 0.95, st.t + 0.5);
  drawLushPlanter3D(wgl,  5.95, 0, 14.8, 1.15, st.t + 1.2);
  drawLushPlanter3D(wgl, -5.95, 0, 14.8, 1.15, st.t + 1.8);

  // D. CẦU THANG GỖ 14 BẬC (X ∈ [-5.4, -3.0], Z: 9.6 → 14.4)
  for (var s = 0; s < 14; s++) {
    var sz = 9.6 + s * (4.8 / 14);
    var sy = (s + 0.5) * (3.4 / 14);
    dm('box', 'timber', -4.2, sy * 0.5, sz + 0.17, 0, 0, 0, 2.25, sy, 0.38, { tint: [0.9, 0.82, 0.74, 1], us: 1.5, vs: 1 });
  }
  dm('box', 'timber', -3.05, 2.15, 12.0, -0.62, 0, 0, 0.10, 0.12, 5.8, { tint: [1.1, 0.9, 0.7, 1] });
  dm('box', 'oliveWall', -5.45, 2.4, 12.0, 0, 0, 0, 0.12, 4.8, 5.8, { tint: [1,1,1,1] });
  dm('quad', 'photos1980s', -5.36, 2.65, 12.0, 0, Math.PI * 0.5, 0, 3.8, 1.8, 1, { tint: [1,1,1,1] });
  dm('sphere', 'white', -5.18, 2.85, 13.8, 0, 0, 0, 0.22, 0.22, 0.22, { tint: [1.0, 0.75, 0.30, 1], emissive: 1.4 });

  // E. TẦNG 2 (Y = 3.4): 15 BÀN ĐA DẠNG (TRÒN, SOFA BOOTH, BÀN DÀI, ĐÔN GỖ, HEO AI) + KỆ SÁCH & TRANG TRÍ
  for (var t2i = 0; t2i < st.f2Tables.length; t2i++) {
    var tb = st.f2Tables[t2i];
    if (tb.kind === 'sofa') {
      drawSofaBooth3D(wgl, tb.x, 3.4, tb.z, tb.dir);
    } else if (tb.kind === 'long') {
      dm('box', 'timber', tb.x, 3.85, tb.z, 0, 0, 0, 1.15, 0.08, 2.55, { tint: [1,1,1,1] });
      dm('box', 'timber', tb.x, 3.60, tb.z - 0.90, 0, 0, 0, 0.90, 0.45, 0.14, { tint: [0.75,0.68,0.58,1] });
      dm('box', 'timber', tb.x, 3.60, tb.z + 0.90, 0, 0, 0, 0.90, 0.45, 0.14, { tint: [0.75,0.68,0.58,1] });
      drawTeaPotSet3D(wgl, tb.x, 3.89, tb.z - 0.45);
      drawFlowerVase3D(wgl, tb.x, 3.89, tb.z + 0.45, true);
    } else if (tb.kind === 'stool') {
      dm('box', 'timber', tb.x, 3.74, tb.z, 0, 0, 0, 0.84, 0.06, 0.84, { tint: [0.92,0.82,0.68,1] });
      dm('cyl', 'timber', tb.x, 3.56, tb.z, 0, 0, 0, 0.14, 0.32, 0.14, { tint: [0.6,0.44,0.3,1] });
      drawSunflowerSeedsPlate3D(wgl, tb.x, 3.77, tb.z);
    } else {
      dm('box', 'timber', tb.x, 3.85, tb.z, 0, 0, 0, 0.96, 0.08, 0.96, { tint: [1,1,1,1] });
      dm('cyl', 'timber', tb.x, 3.60, tb.z, 0, 0, 0, 0.16, 0.45, 0.16, { tint: [0.8,0.8,0.8,1] });
      drawCoconutCoffee3D(wgl, tb.x - 0.14, 3.89, tb.z - 0.05);
    }
  }

  // Tủ Sách, Áo Dài, Nón Lá, Tranh Tầng 2 & Cây xanh
  drawDetailedBookshelf3D(wgl, 1.65, 3.4, 15.88, Math.PI);
  drawAoDaiRack3D(wgl, -6.30, 3.4, 2.25, Math.PI * 0.5);
  dm('quad', 'vnLotusArt',   -6.92, 5.45, 5.20, 0, Math.PI * 0.5, 0, 1.55, 1.45, 1, { tint: [1,1,1,1] });
  dm('quad', 'vnFlagMaiArt',  6.92, 5.45, 5.40, 0, -Math.PI * 0.5, 0, 1.55, 1.45, 1, { tint: [1,1,1,1] });
  dm('quad', 'vnCycloArt',    6.92, 5.45, 9.60, 0, -Math.PI * 0.5, 0, 1.55, 1.45, 1, { tint: [1,1,1,1] });
  drawHangingNonLa3D(wgl, 6.72, 5.65, 7.50, -Math.PI * 0.5);
  drawLushPlanter3D(wgl, -6.20, 3.4, 14.8, 1.05, st.t + 0.4);
  drawLushPlanter3D(wgl,  6.20, 3.4, 14.8, 1.05, st.t + 1.1);
  drawLushPlanter3D(wgl, -3.15, 3.4, 1.35, 0.92, st.t + 1.9);
  drawLushPlanter3D(wgl,  3.15, 3.4, 1.35, 0.92, st.t + 2.4);

  // Toàn bộ 24 Ghế Tương Tác + Ghế Heo AI
  for (var ci = 0; ci < st.chairs.length; ci++) {
    var ch = st.chairs[ci];
    drawDetailedChair3D(wgl, ch.x, ch.floorY, ch.z, Math.atan2(ch.lookX - ch.x, ch.lookZ - ch.z), ch.kind);
  }
  drawDetailedChair3D(wgl, st.aiCoachPig.x, 3.4, st.aiCoachPig.z, Math.PI, 'peacock');

  // F. 7 KHÁCH NPC + HEO AI + HEO CHỦ NHÂN 24×20
  if (st.npcs) {
    for (var ni = 0; ni < st.npcs.length; ni++) drawCafeHumanWebgl(wgl, cam, st.npcs[ni], st.t);
  }
  drawPigBillboardWebgl(wgl, cam, st.aiCoachPig, st.t, true);
  drawPigBillboardWebgl(wgl, cam, st.pig, st.t, false);

  // G. Vòng sóng chạm sàn + Hơi nước & Bụi nắng
  wgl.setBlend('add');
  for (var rIdx = 0; rIdx < st.ripples.length; rIdx++) {
    var rp = st.ripples[rIdx];
    var rAlpha = Math.max(0, 1 - rp.t / 0.75) * 0.65;
    dm('torus', 'white', rp.x, (rp.y || 0) + 0.03, rp.z, Math.PI * 0.5, 0, 0, 0.35 + rp.t * 0.8, 0.35 + rp.t * 0.8, 0.2, { tint: [0.98, 0.80, 0.32, rAlpha], emissive: 1.2 });
  }
  for (var pIdx = 0; pIdx < st.particles.length; pIdx++) {
    var pt = st.particles[pIdx];
    if (pt.kind === 'steam') {
      var sa = Math.max(0.05, 0.24 * (1 - (pt.y - 1.2) / 1.5));
      dm('sphere', 'white', pt.x, pt.y, pt.z, 0, 0, 0, 0.12, 0.14, 0.12, { tint: [0.95, 0.96, 0.98, sa], emissive: 1.0 });
    } else {
      dm('sphere', 'white', pt.x, pt.y, pt.z, 0, 0, 0, 0.025, 0.025, 0.025, { tint: [1.0, 0.90, 0.58, 0.45], emissive: 1.1 });
    }
  }
  wgl.setBlend(null);
}

/* ==================== 6. CANVAS2D FALLBACK RENDER ==================== */
function renderCafeTpsScene(ctx, cam, st, W, H) {
  var isF2 = st.floor === 2;
  ctx.fillStyle = isF2 ? '#3A4A28' : '#4E554B';
  ctx.fillRect(0, 0, W, H);
  drawPoly3D(ctx, cam, [[-7.0, 0, 0.2], [7.0, 0, 0.2], [7.0, 0, 16.2], [-7.0, 0, 16.2]], '#6A7165', '#4E554B', 1);
  drawPoly3D(ctx, cam, [[-7.0, 3.4, 0.2], [7.0, 3.4, 0.2], [7.0, 3.4, 16.2], [-7.0, 3.4, 16.2]], '#CEC3AA', '#8C6A36', 1);
  if (typeof drawCafeVnCultureWalls3D === 'function') drawCafeVnCultureWalls3D(ctx, cam, st.floor);
  for (var s = 0; s < 12; s++) {
    drawBox3D(ctx, cam, -4.2, s * 0.14, 9.6 + s * 0.40, 2.2, 0.28, 0.40, { top: '#7C4F2B', front: '#4D2E1B', side: '#3B2314', stroke: '#2B180E' });
  }
  drawBox3D(ctx, cam, 3.85, 0, 6.95, 1.15, 1.08, 5.5, { top: '#7C4F2B', front: '#4D2E1B', side: '#3B2314', stroke: '#2B180E' });
  drawCoconutCoffeeSprite3D(ctx, cam, -1.45, 0.62, 4.80);
  drawPigTps3D(ctx, cam, st.pig, st.t);
}
`;
}
