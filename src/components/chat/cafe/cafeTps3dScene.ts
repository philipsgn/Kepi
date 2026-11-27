/**
 * Quán Cộng Cà Phê 2 Tầng WebGL 3D — Chú Heo 24×20 Đồng Bộ Toàn App & Di Chuyển Real-Time (Quyết định 248)
 * - Chú Heo Mascot Pixel Art 24×20 4 góc nhìn (gl.NEAREST Depth-Tested Billboard) đồng bộ 100% Tab Vườn & các quán khác.
 * - Tự do di chuyển real-time 100% không cắt bỏ phân đoạn giữa Tầng 1 (Y=0), Cầu Thang Gỗ 12 Bậc, Sảnh Gạch Bông Tầng 2 (Y=3.4) và Ban Công.
 * - Ấn trực tiếp vào bất kỳ Ghế nào ➔ chú Heo tự đi real-time (leo/xuống cầu thang nếu khác tầng) tới đúng ghế & tự động ngồi xuống!
 * - Ấn trực tiếp vào Heo AI ➔ đi tới ngồi đối diện mở Chat; ấn Cửa chính ➔ bước ra Đại lộ Sài Gòn; xóa sạch mọi card viền & tấm nắng trần.
 */
export function buildCafeTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. ĐỊA HÌNH 2 TẦNG & DANH SÁCH GHẾ NGỒI TOÀN QUÁN ==================== */
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
    // Tầng 1 (Y = 0): Ghế mây Chăn Con Công quanh bàn gỗ tròn
    { id: 0, floorY: 0,   x: -0.9,  y: 0,   z: 3.25, lookX: -0.9,  lookZ: 4.3,   yaw: 0,            kind: 'rattan' },
    { id: 1, floorY: 0,   x: -0.7,  y: 0,   z: 6.45, lookX: -0.7,  lookZ: 7.4,   yaw: 0,            kind: 'rattan' },
    { id: 2, floorY: 0,   x: -1.75, y: 0,   z: 4.3,  lookX: -0.9,  lookZ: 4.3,   yaw: Math.PI*0.5,  kind: 'rattan' },
    // Tầng 2 (Y = 3.4): Ghế mây sảnh gạch bông & Ghế bàn Heo AI
    { id: 3, floorY: 3.4, x: -0.6,  y: 3.4, z: 5.2,  lookX: -1.6,  lookZ: 5.2,   yaw: -Math.PI*0.5, kind: 'rattan' },
    { id: 4, floorY: 3.4, x:  1.2,  y: 3.4, z: 3.2,  lookX:  2.2,  lookZ: 3.2,   yaw: Math.PI*0.5,  kind: 'rattan' },
    { id: 5, floorY: 3.4, x:  2.25, y: 3.4, z: 6.4,  lookX:  3.3,  lookZ: 7.25,  yaw: Math.PI*0.35, kind: 'ai', isAiSeat: true },
    // Ban Công Tầng 2 (Y = 3.4, Z < 0): Ghế đẩu gỗ thấp bên ly Cốt Dừa & Hạt Hướng Dương
    { id: 6, floorY: 3.4, x: -0.35, y: 3.4, z: -0.52, lookX: -0.35, lookZ: -1.15, yaw: Math.PI,     kind: 'balcony', isBalcony: true }
  ];
}

function createCafeTpsState() {
  var chairs = createCafeChairs();
  var f1Tables = [
    { id: 0, x: -0.9, z: 4.3, chairX: -0.9, chairZ: 3.25, occupiedBy: null },
    { id: 1, x: -0.7, z: 7.4, chairX: -0.7, chairZ: 6.45, occupiedBy: null }
  ];
  var f2Tables = [
    { id: 0, x: -1.6, z: 5.2, chairX: -0.6, chairZ: 5.2, occupiedBy: 'f2_npc_0' },
    { id: 1, x:  2.2, z: 3.2, chairX:  1.2, chairZ: 3.2, occupiedBy: 'f2_npc_1' },
    { id: 2, x:  3.3, z: 6.4, chairX:  2.25, chairZ: 6.4, occupiedBy: 'ai_coach', isAiTable: true }
  ];

  // Hơi nước Espresso & vài hạt bụi vàng nhẹ
  var particles = [];
  for (var i = 0; i < 24; i++) {
    particles.push({
      kind: i < 10 ? 'steam' : 'dust',
      x: i < 10 ? (3.3 + ((i * 17) % 8) * 0.05) : (-2.5 + ((i * 37) % 50) * 0.1),
      y: i < 10 ? (1.2 + (i % 6) * 0.22) : (3.8 + ((i * 23) % 20) * 0.1),
      z: i < 10 ? (6.9 + ((i * 13) % 6) * 0.06) : (-0.6 + ((i * 19) % 48) * 0.1),
      phase: i * 0.71
    });
  }

  return {
    floor: 1,
    cinematicCam: false,
    tagReceived: false,
    stoolPull: 0,
    pig: {
      x: 0.0, y: 0.0, z: 1.85, yaw: 0.0,
      targetX: 0.0, targetZ: 1.85,
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
      x: 3.3, y: 3.4, z: 7.25, yaw: Math.PI,
      seated: true, walking: false, eating: false, isAiCoach: true
    },
    chairs: chairs,
    f1Tables: f1Tables,
    f2Tables: f2Tables,
    tables: f1Tables,
    baristas: [
      { x: 3.35, y: 0, z: 5.55, yaw: -Math.PI * 0.5, role: 'barista', phase: 0.2, handingTag: true },
      { x: 3.65, y: 0, z: 7.10, yaw: -Math.PI * 0.5, role: 'barista', phase: 1.7, blending: true }
    ],
    f2Patrons: [
      { x: -1.6, y: 3.4, z: 6.1, yaw: Math.PI, phase: 0.3 },
      { x:  2.2, y: 3.4, z: 4.1, yaw: Math.PI, phase: 2.0 }
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

/* ==================== 2. HỆ DẪN ĐƯỜNG REAL-TIME LIÊN TẦNG (0 CẮT ĐOẠN) ==================== */
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
    // Tầng 1 ➔ Bước lên Cầu Thang Gỗ ➔ Tầng 2 / Ban Công (Real-time!)
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
    // Tầng 2 / Ban Công ➔ Xuống Cầu Thang Gỗ ➔ Tầng 1 (Real-time!)
    if (!onStairsNow) {
      if (p.z < 8.2 && p.x < -1.2) wps.push({ x: -0.95, z: 7.8, y: 3.4 });
      wps.push({ x: -0.95, z: 12.95, y: 3.4 });
      wps.push({ x: -2.8, z: 12.95, y: 3.4 });
    }
    wps.push({ x: -2.8, z: 8.2, y: 0 });
    wps.push({ x: tx, z: tz, y: 0 });
  } else if (targetFloorY >= 3.0) {
    // Cùng ở Tầng 2 / Ban Công: tránh lọt hố cầu thang
    var crossesHole = (Math.min(p.x, tx) < -1.55 && Math.max(p.z, tz) > 8.15 && Math.min(p.z, tz) < 12.75);
    if (crossesHole) {
      wps.push({ x: -0.95, z: p.z > 10.5 ? 12.95 : 7.8, y: 3.4 });
    }
    if (p.z < 0.25 && tz >= 0.25 && Math.abs(p.x) > 1.25) wps.push({ x: 0, z: -0.1, y: 3.4 });
    if (p.z >= 0.25 && tz < 0.25 && Math.abs(tx) > 1.25) wps.push({ x: 0, z: 0.45, y: 3.4 });
    wps.push({ x: tx, z: tz, y: 3.4 });
  } else {
    // Cùng ở Tầng 1: tránh quầy Bar phải
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
        // Đã tới đích real-time -> tự động ngồi ghế / mở Chat Heo AI / ra cửa!
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

/* ==================== 3. CAMERA TPS 360° & RAYCAST 3D CHẠM GHẾ / HEO AI / SÀN ==================== */
function computeCafeWebglCamera(cam, st) {
  var p = st.pig;
  var dist = cam.dist || 3.4;
  var sy = Math.sin(cam.yaw), cy = Math.cos(cam.yaw);
  var sp = Math.sin(cam.pitch), cp = Math.cos(cam.pitch);
  var ex = p.x - sy * cp * dist;
  var ey = (p.y + 0.92) - sp * dist;
  var ez = p.z - cy * cp * dist;

  if (p.y < 1.9) {
    ex = Math.max(-5.15, Math.min(5.15, ex));
    ez = Math.max(0.45, Math.min(13.6, ez));
    ey = Math.max(0.65, Math.min(3.15, ey));
  } else {
    ex = Math.max(-5.15, Math.min(5.15, ex));
    ez = Math.max(-2.15, Math.min(13.6, ez));
    ey = Math.max(3.85, Math.min(6.55, ey));
  }
  var targetLookX = p.x, targetLookY = p.y + 0.78, targetLookZ = p.z;
  if (!cam.pos || !isFinite(cam.pos.x)) cam.pos = { x: ex, y: ey, z: ez };
  cam.pos.x += (ex - cam.pos.x) * 0.22;
  cam.pos.y += (ey - cam.pos.y) * 0.22;
  cam.pos.z += (ez - cam.pos.z) * 0.22;
  if (!isFinite(cam.lookX)) { cam.lookX = targetLookX; cam.lookY = targetLookY; cam.lookZ = targetLookZ; }
  cam.lookX += (targetLookX - cam.lookX) * 0.25;
  cam.lookY += (targetLookY - cam.lookY) * 0.25;
  cam.lookZ += (targetLookZ - cam.lookZ) * 0.25;

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

function unprojectCafePlane3D(cam, sx, sy, planeY) {
  var nx = (sx - cam.vw * 0.5) / (cam.focal || 400);
  var ny = (cam.vh * 0.5 - sy) / (cam.focal || 400);
  var dx = cam.F.x + cam.R.x * nx + cam.U.x * ny;
  var dy = cam.F.y + cam.R.y * nx + cam.U.y * ny;
  var dz = cam.F.z + cam.R.z * nx + cam.U.z * ny;
  if (dy >= -0.025) return null;
  var t = (planeY - cam.pos.y) / dy;
  if (t < 0.2 || t > 34) return null;
  return { x: cam.pos.x + dx * t, z: cam.pos.z + dz * t };
}

function raySphereDist(ox, oy, oz, dx, dy, dz, cx, cy, cz, rad) {
  var ocx = cx - ox, ocy = cy - oy, ocz = cz - oz;
  var proj = ocx * dx + ocy * dy + ocz * dz;
  if (proj < 0.2 || proj > 22) return -1;
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

  // 1. Kiểm tra chạm vào Heo AI trên Tầng 2 -> tự đi tới ngồi đối diện & mở Chat
  var aiHit = raySphereDist(ox, oy, oz, dx, dy, dz, st.aiCoachPig.x, st.aiCoachPig.y + 0.55, st.aiCoachPig.z, 0.72);
  if (aiHit > 0) {
    var aiChair = st.chairs[5];
    return { kind: 'chair', chair: aiChair, x: aiChair.x, y: aiChair.floorY, z: aiChair.z };
  }

  // 2. Kiểm tra chạm vào BẤT KỲ Ghế nào (Tầng 1, Tầng 2, Ban Công) -> tự đi tới & ngồi!
  var bestChair = null, bestChairT = 999;
  for (var i = 0; i < st.chairs.length; i++) {
    var ch = st.chairs[i];
    var ht = raySphereDist(ox, oy, oz, dx, dy, dz, ch.x, ch.floorY + 0.38, ch.z, 0.62);
    if (ht > 0 && ht < bestChairT) {
      bestChairT = ht; bestChair = ch;
    }
  }
  if (bestChair) {
    return { kind: 'chair', chair: bestChair, x: bestChair.x, y: bestChair.floorY, z: bestChair.z };
  }

  // 3. Kiểm tra chạm Quầy Bartender Tầng 1
  if (dx > 0.02) {
    var tb = (2.25 - ox) / dx;
    if (tb > 0.3 && tb < 16) {
      var by = oy + dy * tb, bz = oz + dz * tb;
      if (by >= 0 && by <= 1.35 && bz >= 3.8 && bz <= 8.8) {
        return { kind: 'bar', x: 1.65, y: 0, z: Math.max(4.0, Math.min(8.5, bz)) };
      }
    }
  }

  // 4. Kiểm tra chạm Cửa Chính Tầng 1 (Z = 0.2) -> bước ra Đại Lộ Sài Gòn
  if (dz < -0.02) {
    var td = (0.25 - oz) / dz;
    if (td > 0.3 && td < 16) {
      var ddx = ox + dx * td, ddy = oy + dy * td;
      if (ddy >= 0 && ddy <= 2.75 && Math.abs(ddx) <= 1.25) {
        return { kind: 'exit', x: 0, y: 0, z: 0.72 };
      }
    }
  }

  // 5. Chạm vào Sàn Tầng 2 / Ban Công (Y = 3.4) hoặc Sàn Tầng 1 (Y = 0)
  if (dy < -0.025) {
    var t2 = (3.4 - oy) / dy;
    if (t2 > 0.2 && t2 < 24) {
      var x2 = ox + dx * t2, z2 = oz + dz * t2;
      var inStairHole = (x2 >= -3.98 && x2 <= -1.62 && z2 >= 8.2 && z2 <= 12.75);
      var onF2Deck = (x2 >= -5.2 && x2 <= 5.2 && z2 >= 0.2 && z2 <= 13.8 && !inStairHole);
      var onBalcony = (x2 >= -3.6 && x2 <= 3.6 && z2 >= -2.1 && z2 < 0.25);
      if (onF2Deck || onBalcony) {
        return { kind: 'floor', x: x2, y: 3.4, z: z2 };
      }
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

/* ==================== 4. CHÚ HEO PIXEL ART 24×20 ĐỒNG BỘ 100% TOÀN APP TRONG WEBGL 3D ==================== */
function drawPigBillboardWebgl(wgl, cam, pig, t, isAiCoach) {
  var dm = wgl.drawMesh;
  var liftY = pig.seated ? 0.30 : 0;
  var bounce = pig.walking ? Math.abs(Math.sin(t * 11)) * 0.055 : 0;
  var dxCam = cam.pos.x - pig.x, dzCam = cam.pos.z - pig.z;
  var faceCamYaw = Math.atan2(dxCam, dzCam);
  var camLookYaw = Math.atan2(-dxCam, -dzCam);

  var rel = (pig.yaw || 0) - camLookYaw;
  while (rel > Math.PI) rel -= Math.PI * 2;
  while (rel < -Math.PI) rel += Math.PI * 2;
  var absRel = Math.abs(rel);
  var view = absRel < 0.78 ? 'back' : (absRel > 2.32 ? 'front' : (rel > 0 ? 'right' : 'left'));
  var frame = (pig.walking && Math.sin(t * 12) > 0) ? '1' : '0';
  var texKey = (isAiCoach && view === 'front') ? 'pig_ai_front' : ('pig_' + view + '_' + frame);

  // Bóng tiếp xúc dưới sàn
  wgl.setBlend('alpha');
  dm('cyl', 'white', pig.x, pig.y + 0.012, pig.z, 0, 0, 0, 0.56, 0.01, 0.56, { tint: [0.08, 0.07, 0.05, 0.34], emissive: 1.0 });
  wgl.setBlend(null);

  // Vẽ đúng Sprite 24×20 sắc nét trong WebGL Depth Buffer (emissive=1 giữ nguyên màu #F9B8C4 & #2B2118 chuẩn App!)
  dm('quad', texKey, pig.x, pig.y + liftY + 0.46 + bounce, pig.z, 0, faceCamYaw, 0, 1.06, 1.06, 1, {
    tint: [1, 1, 1, 1],
    emissive: 1.0
  });
}

/* ==================== 5. NHÂN VẬT CON NGƯỜI & VẬT THỂ CỘNG CÀ PHÊ 1980S ==================== */
function drawHuman3DWebgl(wgl, h, t) {
  var dm = wgl.drawMesh;
  var x = h.x, y = h.y || 0, z = h.z, yaw = h.yaw || 0;
  var shirtCol = h.role === 'barista' ? [0.29, 0.37, 0.21, 1] : [0.55, 0.28, 0.20, 1];
  var skin = [0.98, 0.80, 0.66, 1];
  var sy = Math.sin(yaw), cy = Math.cos(yaw);

  dm('cyl', 'white', x, y + 0.55, z, 0, yaw, 0, 0.42, 0.68, 0.26, { tint: shirtCol, rim: 0.18 });
  dm('sphere', 'white', x, y + 1.05, z, 0, yaw, 0, 0.32, 0.34, 0.32, { tint: skin, rim: 0.22 });
  dm('sphere', 'white', x, y + 1.15, z, 0, yaw, 0, 0.33, 0.18, 0.33, { tint: h.role === 'barista' ? shirtCol : [0.15,0.12,0.1,1] });

  if (h.handingTag) {
    dm('cyl', 'white', x + sy*0.32, y + 0.84, z + cy*0.32, 0.9, yaw, 0, 0.09, 0.36, 0.09, { tint: shirtCol });
    dm('box', 'timber', x + sy*0.52, y + 0.86, z + cy*0.52, 0.1, yaw, 0, 0.12, 0.18, 0.02, { tint: [0.95, 0.78, 0.45, 1] });
  } else if (h.blending) {
    var bBob = Math.sin(t * 14) * 0.03;
    dm('cyl', 'white', x + sy*0.26, y + 0.80 + bBob, z + cy*0.26, 0.7, yaw, 0, 0.09, 0.30, 0.09, { tint: shirtCol });
  }
}

function drawCoconutCoffee3D(wgl, x, y, z) {
  var dm = wgl.drawMesh;
  dm('cup', 'white', x, y + 0.08, z, 0, 0, 0, 0.09, 0.15, 0.09, { tint: [0.78, 0.56, 0.36, 0.92], specPow: 96, rim: 0.35 });
  dm('sphere', 'white', x, y + 0.165, z, 0, 0, 0, 0.095, 0.075, 0.095, { tint: [0.99, 0.98, 0.96, 1], rim: 0.25 });
  dm('sphere', 'white', x, y + 0.205, z, 0, 0, 0, 0.055, 0.055, 0.055, { tint: [1, 1, 1, 1] });
  dm('cyl', 'white', x + 0.03, y + 0.18, z, 0.22, 0, -0.18, 0.014, 0.16, 0.014, { tint: [0.76, 0.58, 0.32, 1] });
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

function drawRattanPeacockChair3D(wgl, x, y, z, yaw) {
  var dm = wgl.drawMesh;
  dm('box', 'timber', x, y + 0.20, z, 0, yaw, 0, 0.52, 0.40, 0.52, { tint: [0.75, 0.58, 0.38, 1] });
  dm('box', 'peacockFabric', x, y + 0.43, z, 0, yaw, 0, 0.46, 0.09, 0.46, { tint: [1,1,1,1], us: 1.4, vs: 1.4 });
  var sy = Math.sin(yaw), cy = Math.cos(yaw);
  dm('box', 'peacockFabric', x - sy*0.18, y + 0.62, z - cy*0.18, -0.15, yaw, 0, 0.42, 0.36, 0.12, { tint: [1,1,1,1], us: 1.2, vs: 1.2 });
}

/* ==================== 6. RENDER WEBGL 3D TOÀN CẢNH CỘNG CÀ PHÊ (SẠCH SẼ 0% TẤM NẮNG TRẦN) ==================== */
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

  // B. Kết Cấu Quán 2 Tầng (Sàn Xi Măng Tầng 1, Tường Xanh Rêu 1980s, Sàn Gạch Bông Tầng 2)
  dm('box', 'cementFloor', 0, -0.05, 7.1, 0, 0, 0, 10.8, 0.1, 13.8, { tint: [1,1,1,1], us: 4, vs: 5 });
  dm('box', 'oliveWall', -5.45, 3.4, 7.1, 0, 0, 0, 0.14, 6.8, 13.8, { tint: [1,1,1,1], us: 4, vs: 2 });
  dm('box', 'oliveWall',  5.45, 3.4, 7.1, 0, 0, 0, 0.14, 6.8, 13.8, { tint: [1,1,1,1], us: 4, vs: 2 });
  dm('box', 'oliveWall',  0,    3.4, 14.0, 0, 0, 0, 10.9, 6.8, 0.14, { tint: [1,1,1,1], us: 3.5, vs: 2 });
  // Tường trước Tầng 1 với khung Cửa Gỗ Ra Phố ở giữa (X = -1.2..+1.2)
  dm('box', 'oliveWall', -3.35, 1.7, 0.2, 0, 0, 0, 4.1, 3.4, 0.14, { tint: [1,1,1,1], us: 1.5, vs: 1 });
  dm('box', 'oliveWall',  3.35, 1.7, 0.2, 0, 0, 0, 4.1, 3.4, 0.14, { tint: [1,1,1,1], us: 1.5, vs: 1 });
  dm('box', 'oliveWall',  0,    3.05, 0.2, 0, 0, 0, 2.6, 0.7, 0.14, { tint: [1,1,1,1] });
  dm('box', 'timber',     0,    1.35, 0.22, 0, 0, 0, 2.4, 2.7, 0.08, { tint: [0.46, 0.56, 0.36, 1] }); // Cửa ra phố

  // Trần Tầng 1 / Sàn Gạch Bông Tầng 2 chừa hố cầu thang
  dm('box', 'gachBong',  1.85, 3.35, 7.1, 0, 0, 0, 7.2, 0.12, 13.8, { tint: [1,1,1,1], us: 4.5, vs: 8 });
  dm('box', 'gachBong', -4.65, 3.35, 7.1, 0, 0, 0, 1.5, 0.12, 13.8, { tint: [1,1,1,1], us: 1, vs: 8 });
  dm('box', 'gachBong', -2.8,  3.35, 4.2, 0, 0, 0, 2.2, 0.12, 8.0,  { tint: [1,1,1,1], us: 1.5, vs: 4.5 });
  dm('box', 'gachBong', -2.8,  3.35, 13.4, 0, 0, 0, 2.2, 0.12, 1.2, { tint: [1,1,1,1], us: 1.5, vs: 1 });
  dm('box', 'timber',    0,    6.8,  7.1, 0, 0, 0, 11.0, 0.16, 14.0, { tint: [1,1,1,1], us: 4, vs: 5 });

  // C. Tầng 1: Quầy Bartender + Bàn Gỗ Tròn + Ghế Mây Chăn Con Công Có Thể Ngồi!
  dm('box', 'timber', 2.65, 0.54, 6.3, 0, 0, 0, 0.85, 1.08, 5.0, { tint: [0.95, 0.88, 0.80, 1], us: 3, vs: 1 });
  dm('box', 'cementFloor', 2.65, 1.11, 6.3, 0, 0, 0, 0.96, 0.08, 5.1, { tint: [1.15, 1.1, 1.0, 1], specPow: 48 });
  dm('quad', 'enamelMenu', 5.36, 2.30, 6.1, 0, -Math.PI*0.5, 0, 2.9, 1.45, 1, { tint: [1,1,1,1] });
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
  for (var bi = 0; bi < st.baristas.length; bi++) drawHuman3DWebgl(wgl, st.baristas[bi], st.t);

  // 2 Cụm bàn gỗ tròn + 3 ghế mây Chăn Con Công Tầng 1 (ấn vào là ngồi được!)
  dm('box', 'timber', -0.9, 0.56, 4.3, 0, 0, 0, 0.88, 0.07, 0.88, { tint: [1,1,1,1] });
  dm('cyl', 'timber', -0.9, 0.28, 4.3, 0, 0, 0, 0.16, 0.52, 0.16, { tint: [0.8,0.8,0.8,1] });
  drawCoconutCoffee3D(wgl, -0.9, 0.60, 4.3);
  dm('box', 'timber', -0.7, 0.56, 7.4, 0, 0, 0, 0.88, 0.07, 0.88, { tint: [1,1,1,1] });
  dm('cyl', 'timber', -0.7, 0.28, 7.4, 0, 0, 0, 0.16, 0.52, 0.16, { tint: [0.8,0.8,0.8,1] });
  drawSunflowerSeedsPlate3D(wgl, -0.7, 0.60, 7.4);

  // D. Cầu Thang Gỗ 12 Bậc + Tường Ảnh Đen Trắng 1980s + Đèn Đồng Hổ Phách
  for (var s = 0; s < 12; s++) {
    var sz = 8.4 + s * (4.4 / 12);
    var sy = (s + 0.5) * (3.4 / 12);
    dm('box', 'timber', -2.8, sy * 0.5, sz + 0.18, 0, 0, 0, 2.1, sy, 0.40, { tint: [0.9, 0.82, 0.74, 1], us: 1.5, vs: 1 });
  }
  dm('box', 'timber', -1.82, 2.15, 10.6, -0.65, 0, 0, 0.10, 0.12, 5.4, { tint: [1.1, 0.9, 0.7, 1] });
  dm('box', 'oliveWall', -3.95, 2.4, 10.6, 0, 0, 0, 0.12, 4.8, 5.4, { tint: [1,1,1,1] });
  dm('quad', 'photos1980s', -3.86, 2.65, 10.6, 0, Math.PI * 0.5, 0, 3.6, 1.8, 1, { tint: [1,1,1,1] });
  dm('sphere', 'white', -3.72, 2.85, 12.2, 0, 0, 0, 0.22, 0.22, 0.22, { tint: [1.0, 0.75, 0.30, 1], emissive: 1.4 });

  // E. Tầng 2 Gạch Bông + Ghế Mây Chăn Con Công + Heo AI + Cửa Chớp Mở Ra Ban Công
  dm('box', 'timber', -1.6, 3.85, 5.2, 0, 0, 0, 0.95, 0.08, 1.15, { tint: [1,1,1,1] });
  dm('box', 'timber', -1.6, 3.60, 5.2, 0, 0, 0, 0.22, 0.45, 0.22, { tint: [0.8,0.8,0.8,1] });
  dm('box', 'timber',  2.2, 3.85, 3.2, 0, 0, 0, 0.9,  0.08, 0.9,  { tint: [1,1,1,1] });
  dm('box', 'timber',  3.3, 3.85, 6.4, 0, 0, 0, 1.05, 0.08, 0.95, { tint: [1,1,1,1] });
  drawCoconutCoffee3D(wgl, 3.15, 3.89, 6.35);
  for (var pi2 = 0; pi2 < st.f2Patrons.length; pi2++) drawHuman3DWebgl(wgl, st.f2Patrons[pi2], st.t);

  // Vẽ toàn bộ 7 Ghế (chạm bất kỳ ghế nào là chú Heo đi real-time tới ngồi!)
  for (var ci = 0; ci < st.chairs.length; ci++) {
    var ch = st.chairs[ci];
    if (ch.isBalcony) {
      dm('box', 'timber', ch.x, ch.floorY + 0.26, ch.z - st.stoolPull, 0, 0, 0, 0.44, 0.07, 0.44, { tint: [1.0, 0.9, 0.8, 1] });
      dm('cyl', 'timber', ch.x - 0.14, ch.floorY + 0.12, ch.z - 0.12 - st.stoolPull, 0, 0, 0, 0.06, 0.26, 0.06, { tint: [0.7,0.6,0.5,1] });
      dm('cyl', 'timber', ch.x + 0.14, ch.floorY + 0.12, ch.z - 0.12 - st.stoolPull, 0, 0, 0, 0.06, 0.26, 0.06, { tint: [0.7,0.6,0.5,1] });
    } else {
      drawRattanPeacockChair3D(wgl, ch.x, ch.floorY, ch.z, ch.yaw);
    }
  }
  drawRattanPeacockChair3D(wgl, 3.3, 3.4, 7.25, Math.PI); // Ghế của Heo AI

  // Cửa chớp gỗ Pháp Tầng 2 mở ra Ban Công
  dm('box', 'oliveWall', -3.45, 5.1, 0.2, 0, 0, 0, 4.0, 3.4, 0.14, { tint: [1,1,1,1], us: 1.5, vs: 1 });
  dm('box', 'oliveWall',  3.45, 5.1, 0.2, 0, 0, 0, 4.0, 3.4, 0.14, { tint: [1,1,1,1], us: 1.5, vs: 1 });
  dm('box', 'oliveWall',  0,    6.35, 0.2, 0, 0, 0, 2.9, 0.9, 0.14, { tint: [1,1,1,1] });
  dm('box', 'timber', -1.48, 4.65, -0.35, 0, 0.35, 0, 0.08, 2.5, 1.15, { tint: [0.42, 0.50, 0.32, 1] });
  dm('box', 'timber',  1.48, 4.65, -0.35, 0, -0.35, 0, 0.08, 2.5, 1.15, { tint: [0.42, 0.50, 0.32, 1] });

  // F. Ban Công Dương Xỉ & Bàn Cà Phê Cốt Dừa + Hạt Hướng Dương
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

  // G. Chú Heo AI & Chú Heo Chủ Nhân 24×20 Đồng Bộ 100% Toàn App (Depth-Tested WebGL Billboard)
  drawPigBillboardWebgl(wgl, cam, st.aiCoachPig, st.t, true);
  drawPigBillboardWebgl(wgl, cam, st.pig, st.t, false);

  // H. Vòng sóng chạm sàn + Hơi nước Espresso & Bụi nắng nhẹ nhàng (0 tấm banner phẳng trên trần!)
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
