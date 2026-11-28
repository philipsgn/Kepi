/**
 * Quán Cộng Cà Phê 2 Tầng WebGL 3D — Góc Nhìn Thứ 3 Rộng Chuẩn Quán Phở, Thư Viện, Cây Xanh & Mỹ Thuật Văn Hóa Việt (Quyết định 249)
 * - Responsive Horizontal-Safe FOV (~64° HFOV chuẩn Quán Phở), chú Heo Pixel Art 24×20 (0.72m, gl.NEAREST) ở trung tâm-dưới.
 * - Nội thất Cộng 1980s + Văn hóa Việt phong phú: 11 ghế bấm vào tự đi ngồi (ghế bành Chăn Con Công, bàn máy may, bàn dài Tầng 2, ban công dương xỉ),
 *   Ấm trà Bát Tràng, lọ hoa sen/hoa mai, Kệ Sách Thư Viện, Giá treo Áo Dài 3D, Nón Lá 3D quai xanh, Tranh Hoa Sen · Xích Lô · Áo Dài · Cờ Đỏ Sao Vàng,
 *   biển "ĐI NHẸ NÓI KHẼ" & "PICK UP HERE", cây xanh nhiệt đới và 7 khách NPC ra vào 2 tầng nhộn nhịp 60fps.
 * - Tự do di chuyển real-time 100% không cắt bỏ phân đoạn, 0% card viền trên màn hình.
 */
export function buildCafeTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. ĐỊA HÌNH 2 TẦNG, 11 GHẾ TƯƠNG TÁC & 7 KHÁCH NPC NHỘN NHỊP ==================== */
function getCafeSurfaceY(x, z, curY) {
  if (x >= -3.98 && x <= -1.62 && z >= 8.2 && z <= 13.0) {
    if (z <= 8.4) return 0;
    if (z >= 12.8) return 3.4;
    if (curY >= 3.2 && z < 12.35 && x > -1.75) return 3.4;
    return ((z - 8.4) / 4.4) * 3.4;
  }
  return curY >= 1.9 ? 3.4 : 0;
}

function createCafeChairs() {
  return [
    // Tầng 1 (Y = 0): Ghế bành gỗ đệm Vải Chăn Con Công & Góc Thư Viện Sách
    { id: 0,  floorY: 0,   x: -1.15, y: 0,   z: 3.75, lookX: -1.15, lookZ: 4.55, yaw: 0,            kind: 'peacock' },
    { id: 1,  floorY: 0,   x: -1.15, y: 0,   z: 5.35, lookX: -1.15, lookZ: 4.55, yaw: Math.PI,      kind: 'peacock' },
    { id: 2,  floorY: 0,   x: -0.95, y: 0,   z: 6.75, lookX: -0.95, lookZ: 7.55, yaw: 0,            kind: 'peacock' },
    { id: 3,  floorY: 0,   x: -3.75, y: 0,   z: 4.55, lookX: -4.45, lookZ: 4.55, yaw: -Math.PI*0.5, kind: 'library' },
    { id: 4,  floorY: 0,   x: -3.75, y: 0,   z: 2.35, lookX: -4.45, lookZ: 2.35, yaw: -Math.PI*0.5, kind: 'wood' },
    // Tầng 2 (Y = 3.4): Bàn Dài Tụ Họp, Bàn Gốm & Góc Bàn Heo AI
    { id: 5,  floorY: 3.4, x:  0.10, y: 3.4, z: 4.35, lookX:  0.85, lookZ: 4.35, yaw: Math.PI*0.5,  kind: 'peacock' },
    { id: 6,  floorY: 3.4, x:  0.10, y: 3.4, z: 5.65, lookX:  0.85, lookZ: 5.65, yaw: Math.PI*0.5,  kind: 'peacock' },
    { id: 7,  floorY: 3.4, x: -1.25, y: 3.4, z: 3.15, lookX: -2.05, lookZ: 3.15, yaw: -Math.PI*0.5, kind: 'peacock' },
    { id: 8,  floorY: 3.4, x:  2.75, y: 3.4, z: 3.15, lookX:  3.55, lookZ: 3.15, yaw: Math.PI*0.5,  kind: 'wood' },
    { id: 9,  floorY: 3.4, x:  2.35, y: 3.4, z: 7.80, lookX:  3.35, lookZ: 8.65, yaw: Math.PI*0.35, kind: 'ai', isAiSeat: true },
    // Ban Công Dương Xỉ Tầng 2 (Y = 3.4, Z < 0)
    { id: 10, floorY: 3.4, x: -0.35, y: 3.4, z: -0.58, lookX: -0.35, lookZ: -1.15, yaw: Math.PI,    kind: 'balcony', isBalcony: true }
  ];
}

function createCafeNpcs() {
  var routes = [
    {
      name: 'khach_tang1_sach', shirt: [0.16, 0.38, 0.62, 1], pants: [0.18, 0.20, 0.24, 1],
      state: 'SIT', timer: 5.5, stepIdx: 0,
      pts: [
        { x: 0.45, y: 0, z: 0.9 }, { x: 1.45, y: 0, z: 5.4 },
        { x: -1.9, y: 0, z: 4.55 }, { x: -1.9, y: 0, z: 4.55, sit: true, yaw: Math.PI * 0.5 },
        { x: 0.35, y: 0, z: 1.0 }
      ]
    },
    {
      name: 'khach_leo_cau_thang', shirt: [0.78, 0.22, 0.24, 1], pants: [0.15, 0.16, 0.20, 1],
      state: 'WALK', timer: 0, stepIdx: 1,
      pts: [
        { x: -0.45, y: 0, z: 1.0 }, { x: 1.5, y: 0, z: 6.2 }, { x: -2.8, y: 0, z: 8.2 },
        { x: -2.8, y: 3.4, z: 12.95 }, { x: -0.95, y: 3.4, z: 12.95 }, { x: 1.6, y: 3.4, z: 5.0 },
        { x: 1.6, y: 3.4, z: 5.0, sit: true, yaw: -Math.PI * 0.5 },
        { x: -0.95, y: 3.4, z: 12.95 }, { x: -2.8, y: 3.4, z: 12.95 }, { x: -2.8, y: 0, z: 8.2 },
        { x: 0.4, y: 0, z: 0.9 }
      ]
    },
    {
      name: 'khach_tang2_bancong', shirt: [0.85, 0.62, 0.16, 1], pants: [0.22, 0.20, 0.18, 1],
      state: 'WALK', timer: 0, stepIdx: 3,
      pts: [
        { x: 0.2, y: 0, z: 1.1 }, { x: -2.8, y: 0, z: 8.2 }, { x: -2.8, y: 3.4, z: 12.95 },
        { x: -0.95, y: 3.4, z: 12.95 }, { x: 0.6, y: 3.4, z: 0.45 }, { x: 1.35, y: 3.4, z: -1.1 },
        { x: 1.35, y: 3.4, z: -1.1, sit: true, yaw: Math.PI },
        { x: 0.2, y: 3.4, z: 0.5 }, { x: -0.95, y: 3.4, z: 12.95 }, { x: -2.8, y: 3.4, z: 12.95 },
        { x: -2.8, y: 0, z: 8.2 }, { x: -0.2, y: 0, z: 1.0 }
      ]
    },
    {
      name: 'khach_thu_vien', shirt: [0.20, 0.50, 0.36, 1], pants: [0.16, 0.18, 0.22, 1],
      state: 'SIT', timer: 4.0, stepIdx: 2,
      pts: [
        { x: -0.55, y: 0, z: 1.1 }, { x: -4.15, y: 0, z: 6.2 },
        { x: -4.35, y: 0, z: 6.4, sit: true, yaw: -Math.PI * 0.5 },
        { x: -3.2, y: 0, z: 3.4 }, { x: 0.45, y: 0, z: 1.0 }
      ]
    },
    {
      name: 'khach_order_bar', shirt: [0.65, 0.28, 0.48, 1], pants: [0.18, 0.18, 0.24, 1],
      state: 'WALK', timer: 0, stepIdx: 1,
      pts: [
        { x: 0.5, y: 0, z: 0.9 }, { x: 1.65, y: 0, z: 5.3 },
        { x: 1.65, y: 0, z: 5.3, sit: true, yaw: Math.PI * 0.5 },
        { x: 1.55, y: 0, z: 7.5 }, { x: 0.2, y: 0, z: 1.1 }
      ]
    },
    {
      name: 'khach_tang2_gom', shirt: [0.28, 0.34, 0.64, 1], pants: [0.24, 0.20, 0.16, 1],
      state: 'SIT', timer: 6.5, stepIdx: 2,
      pts: [
        { x: -0.95, y: 3.4, z: 12.95 }, { x: 3.55, y: 3.4, z: 4.1 },
        { x: 3.55, y: 3.4, z: 4.1, sit: true, yaw: Math.PI },
        { x: -0.95, y: 3.4, z: 7.8 }, { x: -0.95, y: 3.4, z: 12.95 },
        { x: -2.8, y: 3.4, z: 12.95 }, { x: -2.8, y: 0, z: 8.2 }, { x: 0.3, y: 0, z: 1.0 }
      ]
    },
    {
      name: 'khach_ao_dai', shirt: [0.95, 0.94, 0.90, 1], pants: [0.15, 0.45, 0.42, 1],
      state: 'WALK', timer: 0, stepIdx: 0,
      pts: [
        { x: 0.35, y: 0, z: 0.9 }, { x: 1.25, y: 0, z: 3.5 },
        { x: -0.2, y: 0, z: 7.55, sit: true, yaw: -Math.PI * 0.5 },
        { x: 0.45, y: 0, z: 1.0 }
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
  var f1Tables = [
    { id: 0, x: -1.15, z: 4.55, chairX: -1.15, chairZ: 3.75, occupiedBy: null },
    { id: 1, x: -0.95, z: 7.55, chairX: -0.95, chairZ: 6.75, occupiedBy: null }
  ];
  var f2Tables = [
    { id: 0, x:  0.85, z: 5.00, chairX:  0.10, chairZ: 4.35, occupiedBy: 'khach_leo_cau_thang' },
    { id: 1, x: -2.05, z: 3.15, chairX: -1.25, chairZ: 3.15, occupiedBy: null },
    { id: 2, x:  3.35, z: 7.80, chairX:  2.35, chairZ: 7.80, occupiedBy: 'ai_coach', isAiTable: true }
  ];

  var particles = [];
  for (var i = 0; i < 26; i++) {
    particles.push({
      kind: i < 10 ? 'steam' : 'dust',
      x: i < 10 ? (3.3 + ((i * 17) % 8) * 0.05) : (-2.8 + ((i * 37) % 56) * 0.1),
      y: i < 10 ? (1.2 + (i % 6) * 0.22) : (1.6 + ((i * 23) % 36) * 0.1),
      z: i < 10 ? (6.9 + ((i * 13) % 6) * 0.06) : (0.5 + ((i * 19) % 64) * 0.1),
      phase: i * 0.71
    });
  }

  return {
    floor: 1,
    cinematicCam: false,
    tagReceived: false,
    stoolPull: 0,
    pig: {
      // Xuất phát giữa sảnh Tầng 1 để Camera góc rộng ~64° nhìn trọn toàn quán từ khung hình đầu!
      x: -0.15, y: 0.0, z: 3.20, yaw: 0.0,
      targetX: -0.15, targetZ: 3.20,
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
      x: 3.35, y: 3.4, z: 8.65, yaw: Math.PI,
      seated: true, walking: false, eating: false, isAiCoach: true
    },
    chairs: chairs,
    f1Tables: f1Tables,
    f2Tables: f2Tables,
    tables: f1Tables,
    baristas: [
      { x: 3.45, y: 0, z: 5.55, yaw: -Math.PI * 0.5, role: 'barista', phase: 0.2, handingTag: true },
      { x: 3.70, y: 0, z: 7.20, yaw: -Math.PI * 0.5, role: 'barista', phase: 1.7, blending: true }
    ],
    npcs: npcs,
    f2Patrons: [
      { x: 1.6, y: 3.4, z: 5.0, yaw: -Math.PI * 0.5, phase: 0.3 },
      { x: 3.55, y: 3.4, z: 3.15, yaw: -Math.PI * 0.5, phase: 2.0 }
    ],
    particles: particles,
    exitFade: 0,
    exiting: false,
    onRequestOpenChat: null,
    ripples: [],
    t: 0
  };
}

function clampCafeWalkPos(st, x, z, floorY) {
  var fy = typeof floorY === 'number' ? floorY : (st.pig.y >= 1.9 ? 3.4 : 0);
  var nx = Math.max(-5.05, Math.min(5.05, x));
  var minZ = fy >= 1.9 ? -1.85 : 0.65;
  var nz = Math.max(minZ, Math.min(13.5, z));
  if (fy < 1.9) {
    if (nx > 2.05 && nz > 3.55 && nz < 9.15) nx = 2.05;
  } else {
    if (nz < 0.25) nx = Math.max(-3.4, Math.min(3.4, nx));
  }
  return { x: nx, z: nz };
}

/* ==================== 2. HỆ DẪN ĐƯỜNG REAL-TIME LIÊN TẦNG & FSM 7 KHÁCH NPC ==================== */
function planCafeRealtimePath(st, tx, targetFloorY, tz, seatChairId, pendingAction) {
  var p = st.pig;
  p.seated = false;
  p.seatChairId = -1;
  p.eating = false;
  p.pendingSeatId = typeof seatChairId === 'number' ? seatChairId : -1;
  p.pendingAction = pendingAction || null;

  var cl = clampCafeWalkPos(st, tx, tz, targetFloorY);
  tx = cl.x; tz = cl.z;

  var curFloorY = p.y >= 1.9 ? 3.4 : 0;
  var onStairsNow = (p.x >= -3.95 && p.x <= -1.65 && p.z > 8.45 && p.z < 12.75 && p.y > 0.15 && p.y < 3.25);
  var wps = [];

  if (curFloorY === 0 && targetFloorY >= 3.0) {
    if (!onStairsNow) {
      if (p.x > 1.8 && p.z < 8.4) wps.push({ x: 1.6, z: Math.max(p.z, 3.2), y: 0 });
      wps.push({ x: -2.8, z: 8.2, y: 0 });
    }
    wps.push({ x: -2.8, z: 12.95, y: 3.4 });
    wps.push({ x: -0.95, z: 12.95, y: 3.4 });
    if (tz < 8.2 && tx < -1.2) {
      wps.push({ x: -0.95, z: 7.8, y: 3.4 });
    }
    wps.push({ x: tx, z: tz, y: 3.4 });
  } else if (curFloorY >= 3.0 && targetFloorY < 1.0) {
    if (!onStairsNow) {
      if (p.z < 8.2 && p.x < -1.2) wps.push({ x: -0.95, z: 7.8, y: 3.4 });
      wps.push({ x: -0.95, z: 12.95, y: 3.4 });
      wps.push({ x: -2.8, z: 12.95, y: 3.4 });
    }
    wps.push({ x: -2.8, z: 8.2, y: 0 });
    wps.push({ x: tx, z: tz, y: 0 });
  } else if (targetFloorY >= 3.0) {
    var crossesHole = (Math.min(p.x, tx) < -1.55 && Math.max(p.z, tz) > 8.15 && Math.min(p.z, tz) < 12.75);
    if (crossesHole) {
      wps.push({ x: -0.95, z: p.z > 10.5 ? 12.95 : 7.8, y: 3.4 });
    }
    if (p.z < 0.25 && tz >= 0.25 && Math.abs(p.x) > 1.25) wps.push({ x: 0, z: -0.1, y: 3.4 });
    if (p.z >= 0.25 && tz < 0.25 && Math.abs(tx) > 1.25) wps.push({ x: 0, z: 0.45, y: 3.4 });
    wps.push({ x: tx, z: tz, y: 3.4 });
  } else {
    if ((p.x > 1.9 || tx > 1.9) && ((p.z < 3.6 && tz > 3.6) || (p.z > 9.1 && tz < 9.1))) {
      wps.push({ x: 1.85, z: p.z, y: 0 });
    }
    wps.push({ x: tx, z: tz, y: 0 });
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
      var spd = Math.min(d, 1.35 * dt);
      n.x += (dx / d) * spd;
      n.z += (dz / d) * spd;
      n.y = getCafeSurfaceY(n.x, n.z, n.y);
      n.yaw = Math.atan2(dx, dz);
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
            if (ch.isBalcony) st.stoolPull = 0.16;
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
      var onStairs = (p.x >= -3.95 && p.x <= -1.65 && p.z > 8.3 && p.z < 12.9);
      var spd = Math.min(dist, (onStairs ? 2.15 : 2.95) * dt);
      p.x += (dx / dist) * spd;
      p.z += (dz / dist) * spd;
      p.yaw = Math.atan2(dx, dz);
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

/* ==================== 3. CAMERA TPS RỘNG CHUẨN QUÁN PHỞ & RAYCAST 3D 11 GHẾ / HEO AI ==================== */
function computeCafeWebglCamera(cam, st) {
  var p = st.pig;
  var dist = cam.dist || 4.85;
  var sy = Math.sin(cam.yaw), cy = Math.cos(cam.yaw);
  var sp = Math.sin(cam.pitch), cp = Math.cos(cam.pitch);
  var ex = p.x - sy * cp * dist;
  var ey = (p.y + (cam.targetHeight || 0.72)) - sp * dist;
  var ez = p.z - cy * cp * dist;

  if (p.y < 1.9) {
    ex = Math.max(-5.15, Math.min(5.15, ex));
    ez = Math.max(0.42, Math.min(13.6, ez));
    ey = Math.max(1.15, Math.min(3.15, ey));
  } else {
    ex = Math.max(-5.15, Math.min(5.15, ex));
    ez = Math.max(-2.15, Math.min(13.6, ez));
    ey = Math.max(4.45, Math.min(6.55, ey));
  }
  // Nhìn chếch lên phía trước sảnh thay vì cúi sát xuống đất -> thấy toàn bộ tầng 1 & tầng 2!
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
  if (proj < 0.2 || proj > 24) return -1;
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
    var aiChair = st.chairs[9];
    return { kind: 'chair', chair: aiChair, x: aiChair.x, y: aiChair.floorY, z: aiChair.z };
  }

  // 2. Chạm vào BẤT KỲ Ghế nào trong 11 ghế -> đi bộ real-time tới & ngồi!
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
    var tb = (2.25 - ox) / dx;
    if (tb > 0.3 && tb < 18) {
      var by = oy + dy * tb, bz = oz + dz * tb;
      if (by >= 0 && by <= 1.35 && bz >= 3.8 && bz <= 8.8) {
        return { kind: 'bar', x: 1.65, y: 0, z: Math.max(4.0, Math.min(8.5, bz)) };
      }
    }
  }

  // 4. Chạm Cửa Chính Tầng 1 -> bước ra Đại lộ Sài Gòn
  if (dz < -0.02) {
    var td = (0.25 - oz) / dz;
    if (td > 0.3 && td < 18) {
      var ddx = ox + dx * td, ddy = oy + dy * td;
      if (ddy >= 0 && ddy <= 2.75 && Math.abs(ddx) <= 1.25) {
        return { kind: 'exit', x: 0, y: 0, z: 0.72 };
      }
    }
  }

  // 4b. Chạm trực tiếp vào Cầu Thang Gỗ 12 Bậc (rayRampQuad) -> đi bộ từng bậc tới đúng bậc đó!
  if (typeof rayRampQuad === 'function') {
    var stairHit = rayRampQuad(ox, oy, oz, dx, dy, dz, {
      axis: 'z', minX: -3.98, maxX: -1.62, zStart: 8.4, zEnd: 12.8, yStart: 0, yEnd: 3.4
    });
    if (stairHit) {
      return { kind: 'stair', x: stairHit.x, y: stairHit.y, z: stairHit.z };
    }
  }

  // 5. Chạm vào Sàn Tầng 2 / Ban Công hoặc Sàn Tầng 1
  if (dy < -0.025) {
    var t2 = (3.4 - oy) / dy;
    if (t2 > 0.2 && t2 < 24) {
      var x2 = ox + dx * t2, z2 = oz + dz * t2;
      var inStairHole = (x2 >= -3.98 && x2 <= -1.62 && z2 >= 8.2 && z2 <= 12.75);
      var onF2Deck = (x2 >= -5.2 && x2 <= 5.2 && z2 >= 0.2 && z2 <= 13.8 && !inStairHole);
      var onBalcony = (x2 >= -3.6 && x2 <= 3.6 && z2 >= -2.1 && z2 < 0.25);
      if (onF2Deck || onBalcony) return { kind: 'floor', x: x2, y: 3.4, z: z2 };
    }
    var t1 = (0 - oy) / dy;
    if (t1 > 0.2 && t1 < 28) {
      var x1 = ox + dx * t1, z1 = oz + dz * t1;
      if (x1 >= -5.2 && x1 <= 5.2 && z1 >= 0.4 && z1 <= 13.8) {
        return { kind: 'floor', x: x1, y: 0, z: z1 };
      }
    }
  }
  return null;
}

/* ==================== 4. CON NGƯỜI & CHÚ HEO PIXEL BILLBOARD (ĐỒNG BỘ QĐ 250) ==================== */
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

function drawFernPot3D(wgl, x, y, z, t) {
  var dm = wgl.drawMesh;
  dm('cup', 'white', x, y + 0.11, z, 0, 0, 0, 0.22, 0.22, 0.22, { tint: [0.68, 0.34, 0.20, 1] });
  for (var i = 0; i < 6; i++) {
    var ang = i * Math.PI / 3 + t * 0.001;
    var sway = Math.sin(t * 1.8 + i) * 0.06;
    dm('quad', 'fernLeaf', x + Math.cos(ang)*0.18, y + 0.18, z + Math.sin(ang)*0.18, 0.72 + sway, ang, 0, 0.38, 0.52, 0.38, { tint: [1,1,1,1], rim: 0.25 });
  }
}

function drawIndoorPlant3D(wgl, x, y, z, hScale, t) {
  var dm = wgl.drawMesh;
  var hs = hScale || 1.0;
  dm('cup', 'white', x, y + 0.18 * hs, z, 0, 0, 0, 0.32 * hs, 0.36 * hs, 0.32 * hs, { tint: [0.64, 0.32, 0.18, 1] });
  dm('cyl', 'timber', x, y + 0.52 * hs, z, 0, 0, 0, 0.07 * hs, 0.45 * hs, 0.07 * hs, { tint: [0.46, 0.32, 0.20, 1] });
  for (var i = 0; i < 5; i++) {
    var a = i * (Math.PI * 2 / 5) + Math.sin(t * 1.2 + i) * 0.04;
    dm('quad', 'fernLeaf', x + Math.cos(a)*0.22*hs, y + (0.68 + (i%2)*0.14)*hs, z + Math.sin(a)*0.22*hs, 0.55, a, 0, 0.46*hs, 0.62*hs, 0.46*hs, { tint: [0.95, 1.05, 0.90, 1] });
  }
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

function drawDetailedPeacockArmchair3D(wgl, x, y, z, yaw, kind) {
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
  // Ghế bành gỗ cổ điển Cộng + Đệm Vải Chăn Con Công rực rỡ
  dm('box', 'timber', x, y + 0.20, z, 0, yaw, 0, 0.54, 0.36, 0.52, { tint: [0.76, 0.56, 0.36, 1] });
  dm('box', 'peacockFabric', x, y + 0.42, z, 0, yaw, 0, 0.46, 0.10, 0.46, { tint: [1,1,1,1], us: 1.4, vs: 1.4 });
  dm('box', 'peacockFabric', x - sy*0.19, y + 0.66, z - cy*0.19, -0.14, yaw, 0, 0.44, 0.42, 0.12, { tint: [1,1,1,1], us: 1.2, vs: 1.2 });
  // Tay vịn gỗ 2 bên
  dm('box', 'timber', x + cy*0.26, y + 0.52, z - sy*0.26, 0, yaw, 0, 0.06, 0.24, 0.48, { tint: [0.52, 0.34, 0.20, 1] });
  dm('box', 'timber', x - cy*0.26, y + 0.52, z + sy*0.26, 0, yaw, 0, 0.06, 0.24, 0.48, { tint: [0.52, 0.34, 0.20, 1] });
}

/* ==================== 6. RENDER WEBGL 3D TOÀN CẢNH CỘNG CÀ PHÊ 2 TẦNG (VĂN HÓA VIỆT + THƯ VIỆN + CÂY XANH) ==================== */
function renderCafeWebglScene(wgl, cam, st, W, H) {
  computeCafeWebglCamera(cam, st);
  wgl.beginFrame(W, H, cam);
  var dm = wgl.drawMesh;

  // A. Phố Cổ Nắng Chiều Vàng Óng Ngoài Ban Công
  dm('box', 'cementFloor', 0, -0.10, -8.5, 0, 0, 0, 26, 0.1, 14, { tint: [0.65, 0.60, 0.50, 1], us: 6, vs: 4 });
  dm('box', 'colonialStreet', -4.2, 3.2, -13.5, 0, 0, 0, 7.5, 6.6, 2.0, { tint: [1.05, 0.96, 0.80, 1], us: 2, vs: 1.5 });
  dm('box', 'colonialStreet',  4.4, 3.6, -13.5, 0, 0, 0, 8.0, 7.4, 2.0, { tint: [1.08, 0.98, 0.82, 1], us: 2, vs: 1.5 });
  var treeXs = [-5.2, -1.6, 2.4, 5.8];
  for (var ti = 0; ti < treeXs.length; ti++) {
    dm('cyl', 'timber', treeXs[ti], 1.6, -7.2, 0, 0, 0, 0.36, 3.2, 0.36, { tint: [0.45, 0.32, 0.22, 1] });
    dm('sphere', 'white', treeXs[ti], 3.7, -7.2, 0, 0, 0, 2.6, 2.1, 2.5, { tint: [0.34, 0.56, 0.22, 1], rim: 0.30 });
  }
  dm('quad', 'white', 0, 8.5, -22, 0, 0, 0, 44, 20, 1, { tint: [0.98, 0.84, 0.58, 1], emissive: 1.0 });

  // B. Kết Cấu Quán 2 Tầng
  dm('box', 'cementFloor', 0, -0.05, 7.1, 0, 0, 0, 10.8, 0.1, 13.8, { tint: [1,1,1,1], us: 4, vs: 5 });
  dm('box', 'oliveWall', -5.45, 3.4, 7.1, 0, 0, 0, 0.14, 6.8, 13.8, { tint: [1,1,1,1], us: 4, vs: 2 });
  dm('box', 'oliveWall',  5.45, 3.4, 7.1, 0, 0, 0, 0.14, 6.8, 13.8, { tint: [1,1,1,1], us: 4, vs: 2 });
  dm('box', 'oliveWall',  0,    3.4, 14.0, 0, 0, 0, 10.9, 6.8, 0.14, { tint: [1,1,1,1], us: 3.5, vs: 2 });
  // Tường trước Tầng 1 + Cửa gỗ kính cổ truyền
  dm('box', 'oliveWall', -3.35, 1.7, 0.2, 0, 0, 0, 4.1, 3.4, 0.14, { tint: [1,1,1,1], us: 1.5, vs: 1 });
  dm('box', 'oliveWall',  3.35, 1.7, 0.2, 0, 0, 0, 4.1, 3.4, 0.14, { tint: [1,1,1,1], us: 1.5, vs: 1 });
  dm('box', 'oliveWall',  0,    3.05, 0.2, 0, 0, 0, 2.6, 0.7, 0.14, { tint: [1,1,1,1] });
  dm('quad', 'vnDoorWood', 0,   1.35, 0.28, 0, 0, 0, 2.35, 2.65, 1, { tint: [1,1,1,1] });

  // Sàn Gạch Bông Tầng 2 (chừa hố cầu thang) & Trần Gỗ Gụ
  dm('box', 'gachBong',  1.85, 3.35, 7.1, 0, 0, 0, 7.2, 0.12, 13.8, { tint: [1,1,1,1], us: 4.5, vs: 8 });
  dm('box', 'gachBong', -4.65, 3.35, 7.1, 0, 0, 0, 1.5, 0.12, 13.8, { tint: [1,1,1,1], us: 1, vs: 8 });
  dm('box', 'gachBong', -2.8,  3.35, 4.2, 0, 0, 0, 2.2, 0.12, 8.0,  { tint: [1,1,1,1], us: 1.5, vs: 4.5 });
  dm('box', 'gachBong', -2.8,  3.35, 13.4, 0, 0, 0, 2.2, 0.12, 1.2, { tint: [1,1,1,1], us: 1.5, vs: 1 });
  dm('box', 'timber',    0,    6.8,  7.1, 0, 0, 0, 11.0, 0.16, 14.0, { tint: [1,1,1,1], us: 4, vs: 5 });

  // C. MỸ THUẬT TƯỜNG VĂN HÓA VIỆT & KỆ SÁCH THƯ VIỆN TẦNG 1
  // Tường Trái (X = -5.36): Tranh Xích Lô -> Kệ Sách Thư Viện Cổ + Biển Đi Nhẹ Nói Khẽ + Bàn Máy May -> Tranh Hoa Sen -> Nón Lá 3D
  dm('quad', 'vnCycloArt',     -5.36, 2.05, 2.35, 0, Math.PI * 0.5, 0, 1.45, 1.35, 1, { tint: [1,1,1,1] });
  dm('box', 'timber',          -5.12, 1.25, 5.20, 0, 0, 0, 0.52, 2.40, 2.55, { tint: [0.8,0.72,0.62,1] });
  dm('quad', 'vnBookShelfTex', -4.84, 1.32, 5.20, 0, Math.PI * 0.5, 0, 2.45, 2.18, 1, { tint: [1,1,1,1] });
  dm('quad', 'vnQuietSign',    -5.35, 2.48, 3.60, 0, Math.PI * 0.5, 0, 0.85, 0.85, 1, { tint: [1,1,1,1] });
  dm('quad', 'vnLotusArt',     -5.36, 2.05, 7.35, 0, Math.PI * 0.5, 0, 1.45, 1.35, 1, { tint: [1,1,1,1] });
  drawHangingNonLa3D(wgl, -5.22, 2.35, 3.65, Math.PI * 0.5);
  drawHangingNonLa3D(wgl, -5.22, 2.35, 8.45, Math.PI * 0.5);

  // Tường Sau Tầng 1 (Z = 13.88): Tác phẩm ảnh B&W 1980s + ĐỘC LẬP TỰ DO HẠNH PHÚC + Tranh Cờ Đỏ Sao Vàng & Hoa Mai
  dm('quad', 'photos1980s',  0.65, 1.95, 13.88, 0, Math.PI, 0, 3.4, 1.65, 1, { tint: [1,1,1,1] });
  dm('quad', 'vnFlagMaiArt', 3.45, 2.00, 13.88, 0, Math.PI, 0, 1.55, 1.45, 1, { tint: [1,1,1,1] });

  // Quầy Bartender Tầng 1 (Tường Phải) + Biển "PICK UP HERE" + Tranh Áo Dài Hoa Sen + Enamel Menu
  dm('box', 'timber', 2.65, 0.54, 6.3, 0, 0, 0, 0.85, 1.08, 5.0, { tint: [0.95, 0.88, 0.80, 1], us: 3, vs: 1 });
  dm('box', 'cementFloor', 2.65, 1.11, 6.3, 0, 0, 0, 0.96, 0.08, 5.1, { tint: [1.15, 1.1, 1.0, 1], specPow: 48 });
  dm('quad', 'vnPickUpSign', 2.32, 2.28, 4.15, 0, -Math.PI * 0.5, 0, 0.78, 0.92, 1, { tint: [1,1,1,1] });
  dm('quad', 'enamelMenu',   5.36, 2.30, 6.10, 0, -Math.PI * 0.5, 0, 2.9, 1.45, 1, { tint: [1,1,1,1] });
  dm('quad', 'vnAoDaiArt',   5.36, 2.05, 9.65, 0, -Math.PI * 0.5, 0, 1.55, 1.45, 1, { tint: [1,1,1,1] });
  dm('box', 'white', 2.85, 1.38, 7.2, 0, 0, 0, 0.52, 0.48, 0.62, { tint: [0.76, 0.78, 0.80, 1], specPow: 80 });
  dm('cup', 'white', 2.75, 1.38, 6.1, 0, 0, 0, 0.22, 0.42, 0.22, { tint: [0.85, 0.94, 0.98, 0.75], specPow: 96 });
  for (var ph = 0; ph < 4; ph++) {
    dm('cyl', 'white', 2.52, 1.21, 4.4 + ph * 0.35, 0, 0, 0, 0.11, 0.13, 0.11, { tint: [0.82, 0.84, 0.86, 1], specPow: 90 });
    dm('cyl', 'white', 4.95, 1.65, 4.5 + ph * 0.45, 0, 0, 0, 0.16, 0.34, 0.16, { tint: ph % 2 === 0 ? [0.80,0.18,0.16,1] : [0.22,0.52,0.28,1] });
  }
  for (var li = 0; li < 3; li++) {
    dm('cyl', 'white', 2.4, 2.85, 4.6 + li*1.7, 0, 0, 0, 0.02, 0.8, 0.02, { tint: [0.1,0.1,0.1,1] });
    dm('sphere', 'white', 2.4, 2.42, 4.6 + li*1.7, 0, 0, 0, 0.16, 0.18, 0.16, { tint: [1.0, 0.86, 0.45, 1], emissive: 1.5 });
  }
  for (var bi = 0; bi < st.baristas.length; bi++) drawCafeHumanWebgl(wgl, cam, st.baristas[bi], st.t);

  // D. CỤM BÀN GHẾ VĂN HÓA VIỆT TẦNG 1 (BÀN TRÒN, BÀN MÁY MAY THƯ VIỆN, ẤM TRÀ BÁT TRÀNG, LỌ HOA SEN)
  // Bàn tròn 1 + Bàn tròn 2 giữa sảnh
  dm('box', 'timber', -1.15, 0.56, 4.55, 0, 0, 0, 0.95, 0.07, 0.95, { tint: [1,1,1,1] });
  dm('cyl', 'timber', -1.15, 0.28, 4.55, 0, 0, 0, 0.16, 0.52, 0.16, { tint: [0.8,0.8,0.8,1] });
  drawCoconutCoffee3D(wgl, -1.28, 0.60, 4.48);
  drawTeaPotSet3D(wgl, -0.95, 0.60, 4.62);

  dm('box', 'timber', -0.95, 0.56, 7.55, 0, 0, 0, 0.95, 0.07, 0.95, { tint: [1,1,1,1] });
  dm('cyl', 'timber', -0.95, 0.28, 7.55, 0, 0, 0, 0.16, 0.52, 0.16, { tint: [0.8,0.8,0.8,1] });
  drawFlowerVase3D(wgl, -0.95, 0.60, 7.55, true);
  drawSunflowerSeedsPlate3D(wgl, -0.72, 0.60, 7.45);

  // Bàn đọc sách góc Thư Viện & Bàn cạnh cửa sổ
  dm('box', 'timber', -4.45, 0.58, 4.55, 0, 0, 0, 0.68, 0.06, 0.98, { tint: [0.9,0.82,0.72,1] });
  dm('box', 'timber', -4.45, 0.29, 4.55, 0, 0, 0, 0.56, 0.54, 0.10, { tint: [0.22,0.22,0.24,1] });
  drawFlowerVase3D(wgl, -4.45, 0.61, 4.75, false);
  dm('box', 'timber', -4.45, 0.58, 2.35, 0, 0, 0, 0.68, 0.06, 0.88, { tint: [0.9,0.82,0.72,1] });
  dm('cyl', 'timber', -4.45, 0.29, 2.35, 0, 0, 0, 0.12, 0.54, 0.12, { tint: [0.7,0.6,0.5,1] });
  drawCoconutCoffee3D(wgl, -4.42, 0.61, 2.32);

  // Cây xanh nhiệt đới Tầng 1 (Cửa ra vào, Góc Thư Viện, Chân Cầu Thang)
  drawIndoorPlant3D(wgl, -1.95, 0, 0.85, 1.05, st.t);
  drawIndoorPlant3D(wgl,  1.95, 0, 0.85, 1.05, st.t);
  drawIndoorPlant3D(wgl, -4.85, 0, 1.15, 1.15, st.t);
  drawIndoorPlant3D(wgl, -4.85, 0, 7.45, 1.20, st.t);
  drawIndoorPlant3D(wgl,  4.85, 0, 11.4, 1.15, st.t);

  // E. CẦU THANG GỖ 12 BẬC + TƯỜNG ẢNH B&W 1980S + ĐÈN ĐỒNG HỔ PHÁCH
  for (var s = 0; s < 12; s++) {
    var sz = 8.4 + s * (4.4 / 12);
    var sy = (s + 0.5) * (3.4 / 12);
    dm('box', 'timber', -2.8, sy * 0.5, sz + 0.18, 0, 0, 0, 2.1, sy, 0.40, { tint: [0.9, 0.82, 0.74, 1], us: 1.5, vs: 1 });
  }
  dm('box', 'timber', -1.82, 2.15, 10.6, -0.65, 0, 0, 0.10, 0.12, 5.4, { tint: [1.1, 0.9, 0.7, 1] });
  dm('box', 'oliveWall', -3.95, 2.4, 10.6, 0, 0, 0, 0.12, 4.8, 5.4, { tint: [1,1,1,1] });
  dm('quad', 'photos1980s', -3.86, 2.65, 10.6, 0, Math.PI * 0.5, 0, 3.6, 1.8, 1, { tint: [1,1,1,1] });
  dm('sphere', 'white', -3.72, 2.85, 12.2, 0, 0, 0, 0.22, 0.22, 0.22, { tint: [1.0, 0.75, 0.30, 1], emissive: 1.4 });

  // F. TẦNG 2: BÀN DÀI TỤ HỌP + KỆ SÁCH THƯ VIỆN + GIÁ TREO ÁO DÀI 3D + GỐM BÁT TRÀNG + CÂY XANH + HEO AI
  // Bàn dài tụ họp Tầng 2 + Góc Gốm Bát Tràng + Bàn Heo AI
  dm('box', 'timber',  0.85, 3.85, 5.00, 0, 0, 0, 1.15, 0.08, 2.55, { tint: [1,1,1,1] });
  dm('box', 'timber',  0.85, 3.60, 4.10, 0, 0, 0, 0.90, 0.45, 0.14, { tint: [0.75,0.68,0.58,1] });
  dm('box', 'timber',  0.85, 3.60, 5.90, 0, 0, 0, 0.90, 0.45, 0.14, { tint: [0.75,0.68,0.58,1] });
  drawTeaPotSet3D(wgl, 0.85, 3.89, 4.55);
  drawFlowerVase3D(wgl, 0.85, 3.89, 5.35, true);

  dm('box', 'timber', -2.05, 3.85, 3.15, 0, 0, 0, 0.95, 0.08, 0.95, { tint: [1,1,1,1] });
  dm('cyl', 'timber', -2.05, 3.60, 3.15, 0, 0, 0, 0.18, 0.45, 0.18, { tint: [0.8,0.8,0.8,1] });
  drawCoconutCoffee3D(wgl, -2.05, 3.89, 3.15);

  dm('box', 'timber',  3.55, 3.85, 3.15, 0, 0, 0, 0.95, 0.08, 0.95, { tint: [1,1,1,1] });
  dm('cyl', 'timber',  3.55, 3.60, 3.15, 0, 0, 0, 0.18, 0.45, 0.18, { tint: [0.8,0.8,0.8,1] });

  dm('box', 'timber',  3.35, 3.85, 7.80, 0, 0, 0, 1.10, 0.08, 0.95, { tint: [1,1,1,1] });
  drawCoconutCoffee3D(wgl, 3.18, 3.89, 7.75);

  // Kệ Sách Thư Viện Tầng 2 + Giá Áo Dài 3D + Tranh Tường Tầng 2 + Nón Lá 3D
  dm('box', 'timber',          1.55, 4.65, 13.68, 0, 0, 0, 3.20, 2.40, 0.48, { tint: [0.8,0.72,0.62,1] });
  dm('quad', 'vnBookShelfTex', 1.55, 4.68, 13.42, 0, Math.PI, 0, 3.05, 2.18, 1, { tint: [1,1,1,1] });
  drawAoDaiRack3D(wgl, -4.65, 3.4, 2.25, Math.PI * 0.5);
  dm('quad', 'vnLotusArt',   -5.36, 5.45, 5.20, 0, Math.PI * 0.5, 0, 1.55, 1.45, 1, { tint: [1,1,1,1] });
  dm('quad', 'vnFlagMaiArt',  5.36, 5.45, 5.40, 0, -Math.PI * 0.5, 0, 1.55, 1.45, 1, { tint: [1,1,1,1] });
  dm('quad', 'vnCycloArt',    5.36, 5.45, 9.20, 0, -Math.PI * 0.5, 0, 1.55, 1.45, 1, { tint: [1,1,1,1] });
  drawHangingNonLa3D(wgl, 5.18, 5.65, 7.20, -Math.PI * 0.5);

  // Cây xanh Tầng 2
  drawIndoorPlant3D(wgl, -4.85, 3.4, 6.95, 1.10, st.t);
  drawIndoorPlant3D(wgl,  4.85, 3.4, 1.35, 1.15, st.t);
  drawIndoorPlant3D(wgl,  4.85, 3.4, 12.6, 1.10, st.t);

  // Toàn bộ 11 Ghế (chạm bất kỳ ghế nào -> Heo đi real-time tới ngồi!)
  for (var ci = 0; ci < st.chairs.length; ci++) {
    var ch = st.chairs[ci];
    if (ch.isBalcony) {
      dm('box', 'timber', ch.x, ch.floorY + 0.26, ch.z - st.stoolPull, 0, 0, 0, 0.44, 0.07, 0.44, { tint: [1.0, 0.9, 0.8, 1] });
      dm('cyl', 'timber', ch.x - 0.14, ch.floorY + 0.12, ch.z - 0.12 - st.stoolPull, 0, 0, 0, 0.06, 0.26, 0.06, { tint: [0.7,0.6,0.5,1] });
      dm('cyl', 'timber', ch.x + 0.14, ch.floorY + 0.12, ch.z - 0.12 - st.stoolPull, 0, 0, 0, 0.06, 0.26, 0.06, { tint: [0.7,0.6,0.5,1] });
    } else {
      drawDetailedPeacockArmchair3D(wgl, ch.x, ch.floorY, ch.z, ch.yaw, ch.kind);
    }
  }
  drawDetailedPeacockArmchair3D(wgl, 3.35, 3.4, 8.65, Math.PI, 'peacock'); // Ghế của Heo AI

  // Cửa chớp gỗ Pháp Tầng 2 mở ra Ban Công
  dm('box', 'oliveWall', -3.45, 5.1, 0.2, 0, 0, 0, 4.0, 3.4, 0.14, { tint: [1,1,1,1], us: 1.5, vs: 1 });
  dm('box', 'oliveWall',  3.45, 5.1, 0.2, 0, 0, 0, 4.0, 3.4, 0.14, { tint: [1,1,1,1], us: 1.5, vs: 1 });
  dm('box', 'oliveWall',  0,    6.35, 0.2, 0, 0, 0, 2.9, 0.9, 0.14, { tint: [1,1,1,1] });
  dm('box', 'timber', -1.48, 4.65, -0.35, 0, 0.35, 0, 0.08, 2.5, 1.15, { tint: [0.42, 0.50, 0.32, 1] });
  dm('box', 'timber',  1.48, 4.65, -0.35, 0, -0.35, 0, 0.08, 2.5, 1.15, { tint: [0.42, 0.50, 0.32, 1] });

  // G. Ban Công Dương Xỉ & Bàn Cà Phê Cốt Dừa + Hạt Hướng Dương
  dm('box', 'timber', 0, 3.36, -1.05, 0, 0, 0, 7.4, 0.12, 2.4, { tint: [1,1,1,1], us: 4, vs: 1.5 });
  dm('box', 'white', 0, 4.25, -2.2, 0, 0, 0, 7.4, 0.07, 0.07, { tint: [0.36, 0.24, 0.16, 1] });
  for (var rx = -3.6; rx <= 3.6; rx += 0.36) {
    dm('cyl', 'white', rx, 3.82, -2.2, 0, 0, 0, 0.035, 0.88, 0.035, { tint: [0.32, 0.22, 0.15, 1] });
  }
  var fernXs = [-3.1, -1.7, 0.7, 2.1, 3.2];
  for (var fi = 0; fi < fernXs.length; fi++) drawFernPot3D(wgl, fernXs[fi], 3.42, -1.95, st.t);
  dm('box', 'timber', -0.35, 3.85, -1.10, 0, 0, 0, 0.78, 0.07, 0.78, { tint: [1.05, 0.96, 0.84, 1] });
  dm('cyl', 'timber', -0.35, 3.62, -1.10, 0, 0, 0, 0.14, 0.44, 0.14, { tint: [0.85, 0.75, 0.65, 1] });
  drawCoconutCoffee3D(wgl, -0.48, 3.89, -1.18);
  drawSunflowerSeedsPlate3D(wgl, -0.18, 3.89, -1.14);

  // H. 7 Khách NPC Nhộn Nhịp + Chú Heo AI & Chú Heo Chủ Nhân 24×20 Đồng Bộ Toàn App
  if (st.npcs) {
    for (var ni = 0; ni < st.npcs.length; ni++) drawCafeHumanWebgl(wgl, cam, st.npcs[ni], st.t);
  }
  drawPigBillboardWebgl(wgl, cam, st.aiCoachPig, st.t, true);
  drawPigBillboardWebgl(wgl, cam, st.pig, st.t, false);

  // I. Vòng sóng chạm sàn + Hơi nước Espresso & Bụi nắng nhẹ
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

/* ==================== 7. CANVAS2D FALLBACK RENDER ==================== */
function renderCafeTpsScene(ctx, cam, st, W, H) {
  var isF2 = st.floor === 2;
  ctx.fillStyle = isF2 ? '#3A4A28' : '#4E554B';
  ctx.fillRect(0, 0, W, H);
  drawPoly3D(ctx, cam, [[-5.4, 0, 0.2], [5.4, 0, 0.2], [5.4, 0, 14.0], [-5.4, 0, 14.0]], '#6A7165', '#4E554B', 1);
  drawPoly3D(ctx, cam, [[-5.4, 3.4, 0.2], [5.4, 3.4, 0.2], [5.4, 3.4, 14.0], [-5.4, 3.4, 14.0]], '#CEC3AA', '#8C6A36', 1);
  if (typeof drawCafeVnCultureWalls3D === 'function') drawCafeVnCultureWalls3D(ctx, cam, st.floor);
  for (var s = 0; s < 10; s++) {
    drawBox3D(ctx, cam, -2.8, s * 0.16, 8.5 + s * 0.44, 2.0, 0.32, 0.44, { top: '#7C4F2B', front: '#4D2E1B', side: '#3B2314', stroke: '#2B180E' });
  }
  drawBox3D(ctx, cam, 2.65, 0, 6.3, 0.85, 1.08, 5.0, { top: '#7C4F2B', front: '#4D2E1B', side: '#3B2314', stroke: '#2B180E' });
  drawCoconutCoffeeSprite3D(ctx, cam, -0.48, 3.89, -1.18);
  drawPigTps3D(ctx, cam, st.pig, st.t);
}
`;
}
