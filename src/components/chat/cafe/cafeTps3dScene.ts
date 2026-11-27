/**
 * Quán Cộng Cà Phê 2 Tầng Chân Thực Pixar / Studio Ghibli — WebGL 3D Engine + Fallback (Quyết định 247)
 * - Thế giới 2 tầng + ban công liền mạch thật (Y = 0 Tầng 1 ➔ Cầu thang gỗ Y: 0→3.4 ➔ Tầng 2 Gạch Bông ➔ Ban Công Dương Xỉ & Phố Cổ Vàng).
 * - Nhân vật Chú Heo 3D khớp nối mặc Áo Trấn Thủ xanh lính chần bông quả trám, Kính tròn gọng cổ, Túi vải đeo chéo & cầm Mũ Cối.
 * - 4 Hành Động Điện Ảnh Liên Hoàn (actionStep 1..4) + Tự do xoay 360° & Tap-to-Walk TPS.
 */
export function buildCafeTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. ĐỊA HÌNH CHIỀU CAO & VA CHẠM 2 TẦNG LIỀN MẠCH ==================== */
function getCafeSurfaceY(x, z, curY) {
  // Vùng Cầu Thang Gỗ (X = -3.9..-1.7, Z = 8.4..12.8): đi từ Y=0 lên Y=3.4
  if (x >= -3.95 && x <= -1.65 && z >= 8.2 && z <= 13.0) {
    if (z <= 8.4) return 0;
    if (z >= 12.8) return 3.4;
    // Nếu đang ở Tầng 2 đi ngang gần lan can ngoài (-1.65) thì giữ nguyên Y=3.4 không bị tụt hố cầu thang
    if (curY >= 3.2 && z < 12.3) return 3.4;
    return ((z - 8.4) / 4.4) * 3.4;
  }
  return curY >= 1.9 ? 3.4 : 0;
}

function createCafeTpsState() {
  var f1Tables = [
    { id: 0, x: -0.9, z: 4.3, chairX: -0.9, chairZ: 3.25, occupiedBy: null },
    { id: 1, x: -0.7, z: 7.4, chairX: -0.7, chairZ: 6.45, occupiedBy: 'npc_0' }
  ];
  var f2Tables = [
    { id: 0, x: -1.6, z: 5.2, chairX: -0.6, chairZ: 5.2, occupiedBy: 'f2_npc_0' },
    { id: 1, x:  2.2, z: 3.2, chairX:  1.2, chairZ: 3.2, occupiedBy: 'f2_npc_1' },
    { id: 2, x:  3.3, z: 6.4, chairX:  2.3, chairZ: 6.4, occupiedBy: 'ai_coach', isAiTable: true },
    { id: 3, x: -0.35, z: -0.95, chairX: -0.35, chairZ: -0.45, occupiedBy: null, isBalcony: true }
  ];

  // Hạt hơi nước Espresso & hạt bụi vàng trong tia nắng
  var particles = [];
  for (var i = 0; i < 42; i++) {
    particles.push({
      kind: i < 14 ? 'steam' : 'dust',
      x: i < 14 ? (3.4 + ((i * 17) % 10) * 0.05) : (-2.8 + ((i * 37) % 56) * 0.1),
      y: i < 14 ? (1.2 + (i % 7) * 0.22) : (3.6 + ((i * 23) % 24) * 0.1),
      z: i < 14 ? (6.6 + ((i * 13) % 8) * 0.06) : (-0.8 + ((i * 19) % 52) * 0.1),
      phase: i * 0.71
    });
  }

  return {
    floor: 1,
    actionStep: 1,       // Bắt đầu ngay Hành Động 1 (Góc máy Over-the-Shoulder Quầy Bartender!)
    actionTimer: 0,
    tagReceived: false,
    helmetOnTable: false,
    stoolPull: 0,
    blenderSpin: 0,
    cinematicCam: true,  // Bật lướt góc máy điện ảnh; chạm kéo tay sẽ tự chuyển sang tự do 360°
    pig: {
      x: 1.55, y: 0, z: 5.55, yaw: Math.PI * 0.5,
      targetX: 1.55, targetZ: 5.55,
      walking: false, seated: false, seatTableId: -1,
      reachHand: 1.0, gripRail: 0, pullStool: 0,
      eating: false, drinkReady: false, orderSent: false
    },
    aiCoachPig: {
      x: 3.3, y: 3.4, z: 7.25, yaw: Math.PI, seated: true, walking: false, eating: false,
      reachHand: 0, gripRail: 0, pullStool: 0, isAiCoach: true
    },
    f1Tables: f1Tables,
    f2Tables: f2Tables,
    tables: f1Tables,
    baristas: [
      { x: 3.35, y: 0, z: 5.55, yaw: -Math.PI * 0.5, role: 'barista', hair: '#1C1917', phase: 0.2, handingTag: true },
      { x: 3.65, y: 0, z: 7.10, yaw: -Math.PI * 0.5, role: 'barista', hair: '#292524', phase: 1.7, blending: true }
    ],
    f2Patrons: [
      { x: -1.6, y: 3.4, z: 6.1, yaw: Math.PI, shirt: '#8C3B2B', hair: '#1C1917', phase: 0.3 },
      { x: -0.6, y: 3.4, z: 5.2, yaw: -Math.PI*0.5, shirt: '#3F6212', hair: '#292524', phase: 1.1 },
      { x:  2.2, y: 3.4, z: 4.1, yaw: Math.PI, shirt: '#B45309', hair: '#1E293B', phase: 2.0 },
      { x:  1.2, y: 3.4, z: 3.2, yaw: Math.PI*0.5, shirt: '#365314', hair: '#1C1917', phase: 2.7 }
    ],
    particles: particles,
    leftDoorOpen: 0.0,
    rightDoorOpen: 0.0,
    exitFade: 0,
    exiting: false,
    ripples: [],
    toast: 'Hành động 1: Chú Heo áo trấn thủ nhận thẻ số gỗ tại Quầy Bartender Tầng 1 ☕',
    toastUntil: 5.2,
    t: 0
  };
}

function clampCafeWalkPos(st, x, z) {
  var nx = Math.max(-5.1, Math.min(5.1, x));
  var minZ = st.pig.y >= 1.9 ? -1.85 : 0.65;
  var maxZ = 13.6;
  var nz = Math.max(minZ, Math.min(maxZ, z));
  if (st.pig.y < 1.9) {
    // Tầng 1 tránh quầy Bar phải (X > 2.25, Z: 3.8..9.2)
    if (nx > 2.1 && nz > 3.6 && nz < 9.3) nx = 2.1;
  } else {
    // Ban công Tầng 2 giới hạn trong lan can (Z < 0.2 => X: -3.5..+3.5)
    if (nz < 0.25) nx = Math.max(-3.4, Math.min(3.4, nx));
  }
  return { x: nx, z: nz };
}

function startCafeActionSequence(st, stepIdx) {
  st.actionStep = stepIdx;
  st.actionTimer = 0;
  st.cinematicCam = true;
  var p = st.pig;
  p.seated = false; p.walking = false; p.reachHand = 0; p.gripRail = 0; p.pullStool = 0;
  st.helmetOnTable = false; st.stoolPull = 0;

  if (stepIdx === 1) {
    // Hành động 1: Quầy Bartender Tầng 1
    st.floor = 1; p.x = 1.55; p.y = 0; p.z = 5.55; p.yaw = Math.PI * 0.5;
    p.targetX = 1.55; p.targetZ = 5.55; p.reachHand = 1.0; st.tagReceived = true;
    st.toast = 'Hành động 1: Nhận thẻ số gỗ & xem Barista xay Cà Phê Cốt Dừa 🥥🧊';
  } else if (stepIdx === 2) {
    // Hành động 2: Leo Cầu Thang Gỗ từ chân thang lên gác
    st.floor = 1; p.x = -2.8; p.z = 8.6; p.y = getCafeSurfaceY(p.x, p.z, 0);
    p.targetX = -2.8; p.targetZ = 12.9; p.yaw = 0; p.walking = true; p.gripRail = 1.0;
    st.toast = 'Hành động 2: Bám tay vịn gỗ & ôm Mũ Cối bước lên Cầu Thang 1980s 🪜';
  } else if (stepIdx === 3) {
    // Hành động 3: Băng qua Sảnh Gạch Bông Tầng 2 ra Cửa Chớp Gỗ Pháp
    st.floor = 2; p.x = -0.95; p.y = 3.4; p.z = 10.2;
    p.targetX = -0.35; p.targetZ = 1.15; p.yaw = Math.PI; p.walking = true;
    st.toast = 'Hành động 3: Băng qua sàn gạch bông & ghế Chăn Con Công ra Ban Công ☀️';
  } else if (stepIdx === 4) {
    // Hành động 4: Kéo ghế đẩu gỗ & Ngồi Ban Công Phố Cổ
    st.floor = 2; p.x = -0.35; p.y = 3.4; p.z = -0.52; p.yaw = Math.PI;
    p.targetX = -0.35; p.targetZ = -0.52; p.pullStool = 1.0; p.seated = true; p.drinkReady = true;
    st.helmetOnTable = true; st.stoolPull = 0.25;
    st.toast = 'Hành động 4: Đặt Mũ Cối lên bàn, nhâm nhi Cốt Dừa & Hạt Hướng Dương ngắm phố vàng 🌿🌻';
  }
  st.toastUntil = st.t + 5.5;
}

function stepCafeTps(st, dt) {
  st.t += dt;
  st.actionTimer += dt;
  st.blenderSpin += dt * 18.0;
  var p = st.pig;

  // Cập nhật hơi nước & hạt bụi nắng
  for (var pi = 0; pi < st.particles.length; pi++) {
    var pt = st.particles[pi];
    if (pt.kind === 'steam') {
      pt.y += dt * 0.65;
      if (pt.y > 2.65) pt.y = 1.18;
    } else {
      pt.x += Math.sin(st.t * 0.9 + pt.phase) * dt * 0.12;
      pt.y += Math.cos(st.t * 0.7 + pt.phase) * dt * 0.08;
    }
  }

  if (p.walking) {
    var dx = p.targetX - p.x, dz = p.targetZ - p.z;
    var dist = Math.hypot(dx, dz);
    if (dist < 0.08) {
      p.walking = false;
      p.x = p.targetX; p.z = p.targetZ;
      if (st.actionStep === 2 && st.cinematicCam) {
        p.gripRail = 0;
      }
    } else {
      var spd = Math.min(dist, (st.actionStep === 2 ? 1.35 : 2.35) * dt);
      var next = clampCafeWalkPos(st, p.x + (dx / dist) * spd, p.z + (dz / dist) * spd);
      p.x = next.x; p.z = next.z;
      p.yaw = Math.atan2(dx, dz);
    }
  }

  p.y = getCafeSurfaceY(p.x, p.z, p.y);
  st.floor = p.y >= 1.9 ? 2 : 1;

  // Động tác kéo ghế đẩu gỗ ở Hành động 4
  if (st.actionStep === 4 && st.actionTimer < 1.1) {
    st.stoolPull = Math.sin(Math.min(1, st.actionTimer / 1.1) * Math.PI) * 0.22;
    p.pullStool = 1.0 - st.actionTimer / 1.1;
  } else if (st.actionStep === 4) {
    p.pullStool = 0;
  }

  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.2);
  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== 2. TÍNH TOÁN CAMERA ĐIỆN ẢNH 4 ACTION SHOTS / TỰ DO 360° ==================== */
function computeCafeWebglCamera(cam, st) {
  var p = st.pig;
  var targetLookX = p.x, targetLookY = p.y + 0.88, targetLookZ = p.z;
  var ex, ey, ez;

  if (st.cinematicCam && st.actionStep === 1) {
    // Action 1: Over-the-shoulder từ sau vai chú Heo hướng vào quầy Bartender & Barista xay cốt dừa
    ex = 0.25; ey = 1.62; ez = 4.65;
    targetLookX = 3.1; targetLookY = 1.35; targetLookZ = 6.2;
  } else if (st.cinematicCam && st.actionStep === 2) {
    // Action 2: Low-angle tracking shot phía sau chân cầu thang nhìn chếch lên 2 tầng
    ex = p.x + 0.35; ey = Math.max(0.75, p.y + 0.58); ez = p.z - 2.15;
    targetLookX = p.x; targetLookY = p.y + 1.45; targetLookZ = p.z + 2.0;
  } else if (st.cinematicCam && st.actionStep === 3) {
    // Action 3: Medium 3/4 back-tracking dọc sảnh gạch bông hướng ra cửa chớp & ban công sáng
    ex = p.x + 1.55; ey = p.y + 1.48; ez = p.z + 2.35;
    targetLookX = p.x - 0.15; targetLookY = p.y + 0.92; targetLookZ = p.z - 2.4;
  } else if (st.cinematicCam && st.actionStep === 4) {
    // Action 4: Medium-wide từ góc chéo ban công dương xỉ nhìn vào chú Heo & phố cổ bên dưới
    ex = 2.05; ey = 4.68; ez = -1.98;
    targetLookX = -0.35; targetLookY = 4.02; targetLookZ = -0.75;
  } else {
    // Free TPS 360° Spring-Arm Orbit Camera
    var dist = cam.dist || 3.4;
    var sy = Math.sin(cam.yaw), cy = Math.cos(cam.yaw);
    var sp = Math.sin(cam.pitch), cp = Math.cos(cam.pitch);
    ex = p.x - sy * cp * dist;
    ey = (p.y + 0.95) - sp * dist;
    ez = p.z - cy * cp * dist;
    if (p.y < 1.9) {
      ex = Math.max(-5.2, Math.min(5.2, ex));
      ez = Math.max(0.45, Math.min(13.5, ez));
      ey = Math.max(0.65, Math.min(3.15, ey));
    } else {
      ex = Math.max(-5.2, Math.min(5.2, ex));
      ez = Math.max(-2.15, Math.min(13.5, ez));
      ey = Math.max(3.85, Math.min(6.7, ey));
    }
  }

  // Smooth exponential damping giúp chuyển góc máy điện ảnh êm như phim Pixar
  if (!cam.pos || !isFinite(cam.pos.x)) cam.pos = { x: ex, y: ey, z: ez };
  cam.pos.x += (ex - cam.pos.x) * 0.14;
  cam.pos.y += (ey - cam.pos.y) * 0.14;
  cam.pos.z += (ez - cam.pos.z) * 0.14;
  if (!isFinite(cam.lookX)) { cam.lookX = targetLookX; cam.lookY = targetLookY; cam.lookZ = targetLookZ; }
  cam.lookX += (targetLookX - cam.lookX) * 0.16;
  cam.lookY += (targetLookY - cam.lookY) * 0.16;
  cam.lookZ += (targetLookZ - cam.lookZ) * 0.16;

  // Đồng bộ vector F/R/U & focal để unprojectFloorTap Raycast 3D chuẩn trên cả WebGL Tầng 1 & Tầng 2!
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

/* ==================== 3. NHÂN VẬT CHÚ HEO 3D PIXAR (ÁO TRẤN THỦ + KÍNH TRÒN + TÚI + MŨ CỐI) ==================== */
function drawPig3DWebgl(wgl, pig, st, t, isAiCoach) {
  var dm = wgl.drawMesh;
  var x = pig.x, z = pig.z, yaw = pig.yaw;
  var y = pig.y + (pig.seated ? 0.34 : 0);
  var bob = pig.walking ? Math.abs(Math.sin(t * 10)) * 0.05 : Math.sin(t * 2.2) * 0.012;
  var legSw = pig.walking ? Math.sin(t * 10) * 0.45 : 0;
  var reachH = pig.reachHand || 0, gripR = pig.gripRail || 0, pullS = pig.pullStool || 0;
  var lean = (st.actionStep === 2 && pig.walking) ? 0.18 : (reachH > 0.2 ? 0.12 : 0);
  var cy = Math.cos(yaw), sy = Math.sin(yaw);

  function partPos(lx, ly, lz) {
    // Áp dụng độ nghiêng người lean + xoay quanh trục Y
    var lz2 = lz * Math.cos(lean) - ly * Math.sin(lean);
    var ly2 = lz * Math.sin(lean) + ly * Math.cos(lean);
    return [x + lx * cy + lz2 * sy, y + bob + ly2, z - lx * sy + lz2 * cy];
  }

  var pink = [0.99, 0.72, 0.79, 1];
  var snoutPink = [0.95, 0.54, 0.64, 1];
  var ink = [0.14, 0.10, 0.08, 1];
  var gold = [0.96, 0.74, 0.22, 1];

  // Bóng tiếp xúc mềm dưới chân
  wgl.setBlend('alpha');
  dm('cyl', 'white', x, pig.y + 0.01, z, 0, 0, 0, 0.56, 0.01, 0.56, { tint: [0.08, 0.07, 0.05, 0.35], emissive: 1.0 });
  wgl.setBlend(null);

  // 4 Chân hồng tròn bước so le
  var lp1 = partPos(-0.14, 0.15, 0.06), lp2 = partPos(0.14, 0.15, 0.06);
  dm('cyl', 'white', lp1[0], lp1[1], lp1[2], legSw, yaw, 0, 0.12, 0.30, 0.12, { tint: pink, rim: 0.22 });
  dm('cyl', 'white', lp2[0], lp2[1], lp2[2], -legSw, yaw, 0, 0.12, 0.30, 0.12, { tint: pink, rim: 0.22 });

  // Thân heo mũm mĩm hồng + Áo Trấn Thủ chần bông xanh lính quả trám trùm thân!
  var tp = partPos(0, 0.48, 0);
  dm('sphere', 'white', tp[0], tp[1], tp[2], lean, yaw, 0, 0.52, 0.46, 0.46, { tint: pink, rim: 0.24 });
  if (!isAiCoach) {
    // Áo Trấn Thủ xanh bộ đội chần bông quả trám (aoTranThu)
    dm('cyl', 'aoTranThu', tp[0], tp[1] + 0.01, tp[2], lean, yaw, 0, 0.55, 0.40, 0.48, { tint: [1,1,1,1], us: 2.2, vs: 1.6, rim: 0.18 });
    // Cổ áo trấn thủ
    var colP = partPos(0, 0.68, 0);
    dm('torus', 'aoTranThu', colP[0], colP[1], colP[2], lean, yaw, 0, 0.26, 0.16, 0.24, { tint: [0.85,0.92,0.8,1] });
    // Dây túi vải bố đeo chéo qua vai + Túi vải đeo chéo bên hông (nếu chưa đặt lên bàn ban công)
    if (!st.helmetOnTable) {
      var strP = partPos(0.02, 0.50, 0.02);
      dm('box', 'white', strP[0], strP[1], strP[2], lean, yaw, 0.62, 0.06, 0.54, 0.48, { tint: [0.76, 0.69, 0.54, 1] });
      var bagP = partPos(-0.29, 0.38, 0.04);
      dm('box', 'white', bagP[0], bagP[1], bagP[2], lean, yaw, 0, 0.12, 0.24, 0.24, { tint: [0.72, 0.65, 0.49, 1], rim: 0.15 });
    }
  }
  // Khe xu vàng PigFly đặc trưng App đồng bộ trên lưng áo
  var slotP = partPos(0, 0.66, -0.22);
  dm('box', 'white', slotP[0], slotP[1], slotP[2], lean, yaw, 0, 0.14, 0.05, 0.05, { tint: gold, specPow: 64 });

  // Hai tay chú Heo (vươn tay nhận thẻ ở Action 1 / bám tay vịn Action 2 / kéo ghế Action 4 / cầm Mũ Cối)
  var rArmP = partPos(0.29, 0.52 + (reachH * 0.12), 0.12 + reachH * 0.18 + pullS * 0.15);
  var lArmP = partPos(-0.29, 0.52 + (gripR * 0.14), 0.08 + gripR * 0.16 + pullS * 0.15);
  dm('cyl', 'aoTranThu', rArmP[0], rArmP[1], rArmP[2], -0.6 - reachH * 0.8, yaw, 0, 0.11, 0.26, 0.11, { tint: [1,1,1,1] });
  dm('cyl', 'aoTranThu', lArmP[0], lArmP[1], lArmP[2], -0.5 - gripR * 0.8, yaw, 0, 0.11, 0.26, 0.11, { tint: [1,1,1,1] });
  // Bàn tay hồng
  dm('sphere', 'white', rArmP[0] + sy*0.12, rArmP[1] - 0.04, rArmP[2] + cy*0.12, 0, yaw, 0, 0.11, 0.11, 0.11, { tint: pink });
  dm('sphere', 'white', lArmP[0] + sy*0.10, lArmP[1] - 0.04, lArmP[2] + cy*0.10, 0, yaw, 0, 0.11, 0.11, 0.11, { tint: pink });

  // Mũ Cối xanh bộ đội cầm trên tay phải (nếu chưa đặt lên bàn ban công!)
  if (!isAiCoach && !st.helmetOnTable) {
    var hp = partPos(0.36, 0.42, 0.22);
    dm('sphere', 'white', hp[0], hp[1], hp[2], 0.4, yaw, 0.3, 0.28, 0.18, 0.28, { tint: [0.36, 0.44, 0.24, 1], specPow: 30 });
    dm('cyl', 'white', hp[0], hp[1] - 0.03, hp[2], 0.4, yaw, 0.3, 0.36, 0.03, 0.36, { tint: [0.32, 0.40, 0.21, 1] });
  }

  // Đầu tròn Pixar + Mõm hồng + Đôi mắt lấp lánh + Tai vểnh + KÍNH TRÒN GỌNG CỔ!
  var headP = partPos(0, 0.86, 0.04);
  dm('sphere', 'white', headP[0], headP[1], headP[2], lean*0.5, yaw, 0, 0.46, 0.42, 0.44, { tint: pink, rim: 0.28, specPow: 32 });
  // Tai trái & phải
  var earL = partPos(-0.18, 1.06, 0.02), earR = partPos(0.18, 1.06, 0.02);
  dm('cone', 'white', earL[0], earL[1], earL[2], 0.2, yaw, 0.35, 0.13, 0.16, 0.10, { tint: pink });
  dm('cone', 'white', earR[0], earR[1], earR[2], 0.2, yaw, -0.35, 0.13, 0.16, 0.10, { tint: pink });
  // Mõm heo hồng
  var snoutP = partPos(0, 0.81, 0.24);
  dm('cyl', 'white', snoutP[0], snoutP[1], snoutP[2], Math.PI * 0.5, yaw, 0, 0.19, 0.11, 0.14, { tint: snoutPink });
  // Mắt + Kính tròn gọng cổ (cả Heo Chủ Nhân lẫn Heo AI đều đeo kính tròn vintage!)
  var eyeL = partPos(-0.10, 0.90, 0.20), eyeR = partPos(0.10, 0.90, 0.20);
  dm('sphere', 'white', eyeL[0], eyeL[1], eyeL[2], 0, yaw, 0, 0.055, 0.055, 0.055, { tint: ink, specPow: 96 });
  dm('sphere', 'white', eyeR[0], eyeR[1], eyeR[2], 0, yaw, 0, 0.055, 0.055, 0.055, { tint: ink, specPow: 96 });
  var glL = partPos(-0.10, 0.90, 0.24), glR = partPos(0.10, 0.90, 0.24);
  dm('torus', 'white', glL[0], glL[1], glL[2], Math.PI * 0.5, yaw, 0, 0.13, 0.04, 0.13, { tint: [0.18, 0.14, 0.10, 1], specPow: 80 });
  dm('torus', 'white', glR[0], glR[1], glR[2], Math.PI * 0.5, yaw, 0, 0.13, 0.04, 0.13, { tint: [0.18, 0.14, 0.10, 1], specPow: 80 });
}

/* ==================== 4. CON NGƯỜI 3D (BARISTA ÁO XANH LÍNH & KHÁCH TẦNG 2) ==================== */
function drawHuman3DWebgl(wgl, h, t) {
  var dm = wgl.drawMesh;
  var x = h.x, y = h.y || 0, z = h.z, yaw = h.yaw || 0;
  var shirtCol = h.role === 'barista' ? [0.29, 0.37, 0.21, 1] : [0.55, 0.28, 0.20, 1];
  var skin = [0.98, 0.80, 0.66, 1];
  var sy = Math.sin(yaw), cy = Math.cos(yaw);

  // Thân & vai bo tròn
  dm('cyl', 'white', x, y + 0.55, z, 0, yaw, 0, 0.42, 0.68, 0.26, { tint: shirtCol, rim: 0.18 });
  // Đầu + tóc + mũ vải Barista
  dm('sphere', 'white', x, y + 1.05, z, 0, yaw, 0, 0.32, 0.34, 0.32, { tint: skin, rim: 0.22 });
  dm('sphere', 'white', x, y + 1.15, z, 0, yaw, 0, 0.33, 0.18, 0.33, { tint: h.role === 'barista' ? shirtCol : [0.15,0.12,0.1,1] });

  if (h.handingTag) {
    // Barista 1 đưa thẻ số bàn gỗ về phía chú Heo!
    dm('cyl', 'white', x + sy*0.32, y + 0.84, z + cy*0.32, 0.9, yaw, 0, 0.09, 0.36, 0.09, { tint: shirtCol });
    dm('box', 'timber', x + sy*0.52, y + 0.86, z + cy*0.52, 0.1, yaw, 0, 0.12, 0.18, 0.02, { tint: [0.95, 0.78, 0.45, 1] });
  } else if (h.blending) {
    // Barista 2 thao tác máy xay Cà Phê Cốt Dừa!
    var bBob = Math.sin(t * 14) * 0.03;
    dm('cyl', 'white', x + sy*0.26, y + 0.80 + bBob, z + cy*0.26, 0.7, yaw, 0, 0.09, 0.30, 0.09, { tint: shirtCol });
  }
}

/* ==================== 5. VẬT THỂ TẢ THỰC: LY CỐT DỪA, ĐĨA HƯỚNG DƯƠNG, DƯƠNG XỈ & GHẾ MÂY CHĂN CON CÔNG ==================== */
function drawCoconutCoffee3D(wgl, x, y, z) {
  var dm = wgl.drawMesh;
  // Ly thủy tinh cao + lớp cà phê cốt dừa + chóp kem tuyết trắng muốt + ống hút tre
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
  // Khung mây gỗ & tựa lưng cong + Đệm Vải Chăn Con Công rực rỡ!
  dm('box', 'timber', x, y + 0.20, z, 0, yaw, 0, 0.52, 0.40, 0.52, { tint: [0.75, 0.58, 0.38, 1] });
  dm('box', 'peacockFabric', x, y + 0.43, z, 0, yaw, 0, 0.46, 0.09, 0.46, { tint: [1,1,1,1], us: 1.4, vs: 1.4 });
  var sy = Math.sin(yaw), cy = Math.cos(yaw);
  dm('box', 'peacockFabric', x - sy*0.18, y + 0.62, z - cy*0.18, -0.15, yaw, 0, 0.42, 0.36, 0.12, { tint: [1,1,1,1], us: 1.2, vs: 1.2 });
}

/* ==================== 6. HÀM RENDER WEBGL 3D CHÍNH TOÀN CẢNH CỘNG CÀ PHÊ ==================== */
function renderCafeWebglScene(wgl, cam, st, W, H) {
  computeCafeWebglCamera(cam, st);
  wgl.beginFrame(W, H, cam);
  var dm = wgl.drawMesh;

  // ---- A. PHỐ VIỆT NAM NẮNG CHIỀU BÊN NGOÀI BAN CÔNG (NỀN TRỜI VÀNG ÓNG + NHÀ PHÁP CỔ + CÂY XANH) ----
  // Mặt đường phố bên dưới (Y = -0.05) & Tòa nhà Pháp vàng bên kia đường (Z = -13)
  dm('box', 'cementFloor', 0, -0.10, -8.5, 0, 0, 0, 26, 0.1, 14, { tint: [0.65, 0.60, 0.50, 1], us: 6, vs: 4 });
  dm('box', 'colonialStreet', -4.2, 3.2, -13.5, 0, 0, 0, 7.5, 6.6, 2.0, { tint: [1.05, 0.96, 0.80, 1], us: 2, vs: 1.5 });
  dm('box', 'colonialStreet',  4.4, 3.6, -13.5, 0, 0, 0, 8.0, 7.4, 2.0, { tint: [1.08, 0.98, 0.82, 1], us: 2, vs: 1.5 });
  // Cây xanh vỉa hè phố cổ lá xum xuê nắng chiều
  var treeXs = [-5.2, -1.6, 2.4, 5.8];
  for (var ti = 0; ti < treeXs.length; ti++) {
    dm('cyl', 'timber', treeXs[ti], 1.6, -7.2, 0, 0, 0, 0.36, 3.2, 0.36, { tint: [0.45, 0.32, 0.22, 1] });
    dm('sphere', 'white', treeXs[ti], 3.7, -7.2, 0, 0, 0, 2.6, 2.1, 2.5, { tint: [0.34, 0.56, 0.22, 1], rim: 0.30 });
  }
  // Bầu trời nắng chiều vàng mật ong phía sau phố cổ
  dm('quad', 'white', 0, 8.5, -22, 0, 0, 0, 44, 20, 1, { tint: [0.98, 0.84, 0.58, 1], emissive: 1.0 });

  // ---- B. KIẾN TRÚC TẦNG 1 (Y = 0..3.4, X = -5.4..+5.4, Z = 0.2..14.0) ----
  // Sàn xi măng mài Tầng 1 & Tường vôi xanh rêu 1980s
  dm('box', 'cementFloor', 0, -0.05, 7.1, 0, 0, 0, 10.8, 0.1, 13.8, { tint: [1,1,1,1], us: 4, vs: 5 });
  dm('box', 'oliveWall', -5.45, 3.4, 7.1, 0, 0, 0, 0.14, 6.8, 13.8, { tint: [1,1,1,1], us: 4, vs: 2 });
  dm('box', 'oliveWall',  5.45, 3.4, 7.1, 0, 0, 0, 0.14, 6.8, 13.8, { tint: [1,1,1,1], us: 4, vs: 2 });
  dm('box', 'oliveWall',  0,    3.4, 14.0, 0, 0, 0, 10.9, 6.8, 0.14, { tint: [1,1,1,1], us: 3.5, vs: 2 });
  // Tường mặt tiền Tầng 1 (Z = 0.2)
  dm('box', 'oliveWall',  0,    1.7, 0.2,  0, 0, 0, 10.8, 3.4, 0.14, { tint: [1,1,1,1], us: 3.5, vs: 1 });

  // Trần Tầng 1 / Sàn Tầng 2 (Y = 3.4) chừa ô thông cầu thang tại X = -3.9..-1.7, Z = 8.2..12.8!
  dm('box', 'gachBong',  1.85, 3.35, 7.1, 0, 0, 0, 7.2, 0.12, 13.8, { tint: [1,1,1,1], us: 4.5, vs: 8 });
  dm('box', 'gachBong', -4.65, 3.35, 7.1, 0, 0, 0, 1.5, 0.12, 13.8, { tint: [1,1,1,1], us: 1, vs: 8 });
  dm('box', 'gachBong', -2.8,  3.35, 4.2, 0, 0, 0, 2.2, 0.12, 8.0,  { tint: [1,1,1,1], us: 1.5, vs: 4.5 });
  dm('box', 'gachBong', -2.8,  3.35, 13.4, 0, 0, 0, 2.2, 0.12, 1.2, { tint: [1,1,1,1], us: 1.5, vs: 1 });
  // Mái dầm gỗ Tầng 2 (Y = 6.8)
  dm('box', 'timber', 0, 6.8, 7.1, 0, 0, 0, 11.0, 0.16, 14.0, { tint: [1,1,1,1], us: 4, vs: 5 });

  // ---- C. HÀNH ĐỘNG 1: QUẦY BARTENDER TẦNG 1 + BARISTAS + ESPRESSO + BLENDER + THỰC ĐƠN ----
  // Quầy gỗ sẫm tuổi đời (X = 2.65, Z = 3.8..8.8)
  dm('box', 'timber', 2.65, 0.54, 6.3, 0, 0, 0, 0.85, 1.08, 5.0, { tint: [0.95, 0.88, 0.80, 1], us: 3, vs: 1 });
  dm('box', 'cementFloor', 2.65, 1.11, 6.3, 0, 0, 0, 0.96, 0.08, 5.1, { tint: [1.15, 1.1, 1.0, 1], specPow: 48 });
  // Bảng thực đơn sơn tay trên tường phải sau quầy
  dm('quad', 'enamelMenu', 5.36, 2.30, 6.1, 0, -Math.PI*0.5, 0, 2.9, 1.45, 1, { tint: [1,1,1,1] });
  // Máy pha Espresso inox + Bình xay sinh tố Cốt dừa + hàng Phin nhôm + Lon sữa đặc + Phích Rạng Đông
  dm('box', 'white', 2.85, 1.38, 7.2, 0, 0, 0, 0.52, 0.48, 0.62, { tint: [0.76, 0.78, 0.80, 1], specPow: 80 }); // Espresso machine
  dm('cup', 'white', 2.75, 1.38, 6.1, 0, 0, 0, 0.22, 0.42, 0.22, { tint: [0.85, 0.94, 0.98, 0.75], specPow: 96 }); // Blender cốt dừa!
  for (var ph = 0; ph < 4; ph++) {
    dm('cyl', 'white', 2.52, 1.21, 4.4 + ph * 0.35, 0, 0, 0, 0.11, 0.13, 0.11, { tint: [0.82, 0.84, 0.86, 1], specPow: 90 }); // Hàng phin nhôm
    dm('cyl', 'white', 4.95, 1.65, 4.5 + ph * 0.45, 0, 0, 0, 0.16, 0.34, 0.16, { tint: ph % 2 === 0 ? [0.80,0.18,0.16,1] : [0.22,0.52,0.28,1] }); // Phích Rạng Đông & sữa đặc
  }
  // Đèn dây tóc Tungsten treo trên quầy Bar + Quầng sáng Glow
  for (var li = 0; li < 3; li++) {
    dm('cyl', 'white', 2.4, 2.85, 4.6 + li*1.7, 0, 0, 0, 0.02, 0.8, 0.02, { tint: [0.1,0.1,0.1,1] });
    dm('sphere', 'white', 2.4, 2.42, 4.6 + li*1.7, 0, 0, 0, 0.16, 0.18, 0.16, { tint: [1.0, 0.86, 0.45, 1], emissive: 1.5 });
  }
  // 2 Barista áo xanh lính & mũ vải
  for (var bi = 0; bi < st.baristas.length; bi++) drawHuman3DWebgl(wgl, st.baristas[bi], st.t);

  // ---- D. HÀNH ĐỘNG 2: CẦU THANG GỖ TỐI MÀU HẸP + ẢNH 1980S + ĐÈN ĐỒNG HỔ PHÁCH ----
  // 12 bậc thang gỗ tối màu thật (Z = 8.4 -> 12.8, Y = 0 -> 3.4)
  for (var s = 0; s < 12; s++) {
    var sz = 8.4 + s * (4.4 / 12);
    var sy = (s + 0.5) * (3.4 / 12);
    dm('box', 'timber', -2.8, sy * 0.5, sz + 0.18, 0, 0, 0, 2.1, sy, 0.40, { tint: [0.9, 0.82, 0.74, 1], us: 1.5, vs: 1 });
  }
  // Tay vịn gỗ bên phải cầu thang
  dm('box', 'timber', -1.82, 2.15, 10.6, -0.65, 0, 0, 0.10, 0.12, 5.4, { tint: [1.1, 0.9, 0.7, 1] });
  // Tường cầu thang trái (X = -3.9) treo khung ảnh đen trắng 1980s & đèn đồng hổ phách
  dm('box', 'oliveWall', -3.95, 2.4, 10.6, 0, 0, 0, 0.12, 4.8, 5.4, { tint: [1,1,1,1] });
  dm('quad', 'photos1980s', -3.86, 2.65, 10.6, 0, Math.PI * 0.5, 0, 3.6, 1.8, 1, { tint: [1,1,1,1] });
  // Đèn tường đồng cổ ánh hổ phách
  dm('sphere', 'white', -3.72, 2.85, 12.2, 0, 0, 0, 0.22, 0.22, 0.22, { tint: [1.0, 0.75, 0.30, 1], emissive: 1.4 });

  // ---- E. HÀNH ĐỘNG 3: SẢNH TẦNG 2 (GẠCH BÔNG + GHẾ MÂY CHĂN CON CÔNG + KHÁCH + HEO AI + CỬA CHỚP GỖ MỞ RA BAN CÔNG) ----
  // Bàn gỗ thấp & Ghế mây đệm Chăn Con Công Tầng 2
  dm('box', 'timber', -1.6, 3.85, 5.2, 0, 0, 0, 0.95, 0.08, 1.15, { tint: [1,1,1,1] });
  dm('box', 'timber', -1.6, 3.60, 5.2, 0, 0, 0, 0.22, 0.45, 0.22, { tint: [0.8,0.8,0.8,1] });
  drawRattanPeacockChair3D(wgl, -1.6, 3.4, 6.1, Math.PI);
  drawRattanPeacockChair3D(wgl, -0.6, 3.4, 5.2, -Math.PI*0.5);
  dm('box', 'timber', 2.2, 3.85, 3.2, 0, 0, 0, 0.9, 0.08, 0.9, { tint: [1,1,1,1] });
  drawRattanPeacockChair3D(wgl, 2.2, 3.4, 4.1, Math.PI);
  drawRattanPeacockChair3D(wgl, 1.2, 3.4, 3.2, Math.PI*0.5);
  for (var pi2 = 0; pi2 < st.f2Patrons.length; pi2++) drawHuman3DWebgl(wgl, st.f2Patrons[pi2], st.t);

  // Góc Bàn Heo AI ngồi sẵn (X = 3.3, Y = 3.4, Z = 6.4..7.25)
  dm('box', 'timber', 3.3, 3.85, 6.4, 0, 0, 0, 1.05, 0.08, 0.95, { tint: [1,1,1,1] });
  drawRattanPeacockChair3D(wgl, 3.3, 3.4, 7.25, Math.PI);
  drawCoconutCoffee3D(wgl, 3.15, 3.89, 6.35);
  drawPig3DWebgl(wgl, st.aiCoachPig, st, st.t, true);

  // Tường trước Tầng 2 (Z = 0.2) chừa khung CỬA CHỚP GỖ PHÁP RỘNG (X = -1.4..+1.4) mở toang ra Ban Công!
  dm('box', 'oliveWall', -3.45, 5.1, 0.2, 0, 0, 0, 4.0, 3.4, 0.14, { tint: [1,1,1,1], us: 1.5, vs: 1 });
  dm('box', 'oliveWall',  3.45, 5.1, 0.2, 0, 0, 0, 4.0, 3.4, 0.14, { tint: [1,1,1,1], us: 1.5, vs: 1 });
  dm('box', 'oliveWall',  0,    6.35, 0.2, 0, 0, 0, 2.9, 0.9, 0.14, { tint: [1,1,1,1] });
  // Hai cánh cửa chớp gỗ Pháp mở rộng sang 2 bên ban công
  dm('box', 'timber', -1.48, 4.65, -0.35, 0, 0.35, 0, 0.08, 2.5, 1.15, { tint: [0.42, 0.50, 0.32, 1] });
  dm('box', 'timber',  1.48, 4.65, -0.35, 0, -0.35, 0, 0.08, 2.5, 1.15, { tint: [0.42, 0.50, 0.32, 1] });

  // ---- F. HÀNH ĐỘNG 4: BAN CÔNG GỖ TẦNG 2 + LAN CAN SẮT RỈ + DƯƠNG XỈ RỦ + BÀN CỐT DỪA & MŨ CỐI ----
  dm('box', 'timber', 0, 3.36, -1.05, 0, 0, 0, 7.4, 0.12, 2.4, { tint: [1,1,1,1], us: 4, vs: 1.5 });
  // Lan can sắt rỉ cổ điển (Z = -2.2)
  dm('box', 'white', 0, 4.25, -2.2, 0, 0, 0, 7.4, 0.07, 0.07, { tint: [0.36, 0.24, 0.16, 1] });
  for (var rx = -3.6; rx <= 3.6; rx += 0.36) {
    dm('cyl', 'white', rx, 3.82, -2.2, 0, 0, 0, 0.035, 0.88, 0.035, { tint: [0.32, 0.22, 0.15, 1] });
  }
  // 5 Chậu Dương Xỉ xanh rủ mướt dọc ban công
  var fernXs = [-3.1, -1.7, 0.7, 2.1, 3.2];
  for (var fi = 0; fi < fernXs.length; fi++) drawFernPot3D(wgl, fernXs[fi], 3.42, -1.95, st.t);

  // Bàn gỗ nhỏ & Ghế đẩu gỗ kéo ra ở Ban Công (Action 4)
  dm('box', 'timber', -0.35, 3.85, -1.10, 0, 0, 0, 0.78, 0.07, 0.78, { tint: [1.05, 0.96, 0.84, 1] });
  dm('cyl', 'timber', -0.35, 3.62, -1.10, 0, 0, 0, 0.14, 0.44, 0.14, { tint: [0.85, 0.75, 0.65, 1] });
  // Ghế đẩu gỗ thấp (dịch chuyển mượt khi chú Heo kéo ghế!)
  dm('box', 'timber', -0.35, 3.66, -0.52 - st.stoolPull, 0, 0, 0, 0.44, 0.07, 0.44, { tint: [1.0, 0.9, 0.8, 1] });
  dm('cyl', 'timber', -0.50, 3.52, -0.65 - st.stoolPull, 0, 0, 0, 0.06, 0.28, 0.06, { tint: [0.7,0.6,0.5,1] });
  dm('cyl', 'timber', -0.20, 3.52, -0.65 - st.stoolPull, 0, 0, 0, 0.06, 0.28, 0.06, { tint: [0.7,0.6,0.5,1] });

  // Ly Cà Phê Cốt Dừa & Đĩa Hạt Hướng Dương đặt sẵn trên bàn ban công + Mũ Cối & Túi Vải khi ngồi!
  drawCoconutCoffee3D(wgl, -0.48, 3.89, -1.18);
  drawSunflowerSeedsPlate3D(wgl, -0.18, 3.89, -1.14);
  if (st.helmetOnTable) {
    dm('sphere', 'white', -0.45, 3.95, -0.92, 0, 0.2, 0, 0.26, 0.16, 0.26, { tint: [0.36, 0.44, 0.24, 1] });
    dm('cyl', 'white', -0.45, 3.92, -0.92, 0, 0.2, 0, 0.34, 0.03, 0.34, { tint: [0.32, 0.40, 0.21, 1] });
    dm('box', 'white', -0.14, 3.94, -0.88, 0, -0.3, 0, 0.20, 0.11, 0.22, { tint: [0.72, 0.65, 0.49, 1] });
  }

  // ---- G. CHÚ HEO MASCOT 3D KHỚP NỐI CHÍNH ----
  drawPig3DWebgl(wgl, st.pig, st, st.t, false);

  // ---- H. TIA NẮNG CHIỀU, HƠI NƯỚC ESPRESSO & HẠT BỤI BAY (ALPHA/ADD BLEND) ----
  wgl.setBlend('add');
  // 2 luồng nắng chiều xiên qua cửa chớp gỗ Tầng 2
  dm('quad', 'white', -0.3, 4.75, 1.35, -0.58, 0.18, 0.1, 1.8, 3.6, 1, { tint: [1.0, 0.85, 0.52, 0.11], emissive: 1.0 });
  dm('quad', 'white',  0.5, 4.75, 1.95, -0.58, 0.18, 0.1, 1.6, 3.6, 1, { tint: [1.0, 0.85, 0.52, 0.09], emissive: 1.0 });
  for (var pIdx = 0; pIdx < st.particles.length; pIdx++) {
    var pt = st.particles[pIdx];
    if (pt.kind === 'steam') {
      var sa = Math.max(0.05, 0.25 * (1 - (pt.y - 1.2) / 1.5));
      dm('sphere', 'white', pt.x, pt.y, pt.z, 0, 0, 0, 0.14, 0.16, 0.14, { tint: [0.95, 0.96, 0.98, sa], emissive: 1.0 });
    } else {
      dm('sphere', 'white', pt.x, pt.y, pt.z, 0, 0, 0, 0.035, 0.035, 0.035, { tint: [1.0, 0.90, 0.58, 0.55], emissive: 1.2 });
    }
  }
  wgl.setBlend(null);
}

/* ==================== 7. CANVAS2D FALLBACK RENDER (CHO HEADLESS SMOKE TEST & MÁY KHÔNG WEBGL) ==================== */
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
