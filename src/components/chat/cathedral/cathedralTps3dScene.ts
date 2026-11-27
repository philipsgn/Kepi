/**
 * Nhà Thờ Đức Bà Sài Gòn — 3 Phòng TPS 3D Độc Lập (Quyết định 245)
 * 1 Phòng = 1 Scene riêng biệt, chuyển phòng mượt 200ms Fade, tuyệt đối không gộp phòng:
 * 1. 'nave'      (Thánh Đường Chính): Sàn đá ca-rô cổ điển + thảm đỏ dài viền vàng, tường gạch đỏ Marseille & đá sa thạch,
 *                trần vòm gân Gothic cao, kính màu Stained-Glass + Rose Window, 2 dãy ghế gỗ sồi có giáo dân (drawHumanTps3D),
 *                chùm đèn pha lê vàng ấm, vòm vào Cung Thánh (giữa cuối), cầu thang xoắn gỗ lên Tháp Chuông (trái cuối)
 *                và cửa gỗ lớn Nhà Thờ (Z = 0, thoát về Đại Lộ Sài Gòn với 240ms fade).
 * 2. 'sanctuary' (Cung Thánh & Bàn Thờ Đá Hoa Cương): Sàn cẩm thạch kem nâng bậc, Bàn Thờ đá hoa cương phủ khăn ren trắng
 *                + Thánh Giá vàng, Tượng Đức Mẹ Hòa Bình thanh thoát trước 3 ô kính màu Lancet, giá nến vàng lung linh,
 *                tương tác "🕯️ Thắp nến cầu bình an" (tăng hào quang vàng + hạt lửa ấm + toast) & vòm về Thánh Đường.
 * 3. 'belfry'    (Gác Đàn Ống Pipe Organ & Tháp Chuông Cổ): Sàn gác gỗ ấm, tường gạch đỏ tháp chuông, Đại Phong Cầm
 *                Pipe Organ ống đồng vàng óng ánh cuối phòng, Quả Chuông Đồng Nhà Thờ treo xà gỗ kèm dây kéo,
 *                tương tác "🔔 Kéo chuông Nhà Thờ" (chuông lắc con lắc + sóng âm vàng + toast + rung) & cầu thang về Thánh Đường.
 */
export function buildCathedralTps3dSceneScript(): string {
  return String.raw`
function createCathedralTpsState() {
  // 2 dãy ghế gỗ sồi cổ kính trong Thánh Đường Chính (4 hàng mỗi bên)
  var pews = [
    { x: -2.8, z: 3.6 }, { x: -2.8, z: 5.5 }, { x: -2.8, z: 7.4 }, { x: -2.8, z: 9.3 },
    { x:  2.8, z: 3.6 }, { x:  2.8, z: 5.5 }, { x:  2.8, z: 7.4 }, { x:  2.8, z: 9.3 }
  ];

  // Giáo dân ngồi cầu nguyện trang nghiêm trên 2 dãy ghế gỗ (drawHumanTps3D)
  var parishioners = [
    { x: -3.25, z: 3.45, yaw: 0, shirt: '#334155', hair: '#1C1917', seated: true, moving: false, phase: 0.2 },
    { x: -2.35, z: 5.35, yaw: 0, shirt: '#7C2D12', hair: '#292524', seated: true, moving: false, phase: 0.9 },
    { x: -3.10, z: 7.25, yaw: 0, shirt: '#1E3A8A', hair: '#1C1917', seated: true, moving: false, phase: 1.6 },
    { x: -2.40, z: 9.15, yaw: 0, shirt: '#4C1D95', hair: '#292524', seated: true, moving: false, phase: 2.3 },
    { x:  2.35, z: 3.45, yaw: 0, shirt: '#065F46', hair: '#1C1917', seated: true, moving: false, phase: 0.5 },
    { x:  3.25, z: 5.35, yaw: 0, shirt: '#9F1239', hair: '#292524', seated: true, moving: false, phase: 1.2 },
    { x:  2.45, z: 7.25, yaw: 0, shirt: '#3F6212', hair: '#1C1917', seated: true, moving: false, phase: 1.9 },
    { x:  3.15, z: 9.15, yaw: 0, shirt: '#92400E', hair: '#292524', seated: true, moving: false, phase: 2.7 }
  ];

  return {
    room: 'nave',        // 'nave' | 'sanctuary' | 'belfry'
    pendingRoom: '',
    roomFade: 0,
    pig: {
      x: 0, z: 1.4, yaw: 0, targetX: 0, targetZ: 2.6,
      walking: true, seated: false, eating: false
    },
    pews: pews,
    parishioners: parishioners,
    candlesLit: 0,
    candleGlow: 0,
    candleSparks: [],
    bellAngle: 0,
    bellVel: 0,
    bellWaves: [],
    organGlow: 0,
    doorOpen: 0,
    exitFade: 0,
    exiting: false,
    ripples: [],
    toast: 'Nhà Thờ Đức Bà Sài Gòn · Thánh Đường Chính! Đi cuối thảm đỏ vào Cung Thánh ⛪',
    toastUntil: 5.0,
    t: 0
  };
}

function clampCathedralWalkPos(st, x, z) {
  var nx = Math.max(-5.15, Math.min(5.15, x));
  var nz = Math.max(0.65, Math.min(13.2, z));
  var boxes = [];
  if (st.room === 'nave') {
    boxes = [
      { x1: -4.15, z1: 3.1, x2: -1.45, z2: 9.8 }, // Khối ghế gỗ sồi cánh trái
      { x1:  1.45, z1: 3.1, x2:  4.15, z2: 9.8 }  // Khối ghế gỗ sồi cánh phải
    ];
  } else if (st.room === 'sanctuary') {
    boxes = [
      { x1: -1.85, z1: 9.9, x2: 1.85, z2: 11.4 },  // Bàn Thờ đá hoa cương
      { x1: -1.05, z1: 12.1, x2: 1.05, z2: 13.7 }, // Bệ Tượng Đức Mẹ Hòa Bình
      { x1: -3.65, z1: 8.9, x2: -2.75, z2: 9.9 },  // Giá nến trái
      { x1:  2.75, z1: 8.9, x2:  3.65, z2: 9.9 }   // Giá nến phải
    ];
  } else if (st.room === 'belfry') {
    boxes = [
      { x1: -2.1, z1: 12.2, x2: 3.9, z2: 14.3 },   // Đại Phong Cầm Pipe Organ
      { x1:  1.2, z1: 7.1, x2: 2.8, z2: 8.1 }      // Khung trụ gỗ treo Chuông Đồng
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

function triggerCathedralRoom(st, roomId) {
  if (!roomId || st.pendingRoom || st.room === roomId) return;
  if (roomId !== 'nave' && roomId !== 'sanctuary' && roomId !== 'belfry') return;
  st.pendingRoom = roomId;
  st.pig.walking = false;
  st.pig.seated = false;
}

function lightCathedralCandle(st) {
  st.candlesLit = Math.min(9, st.candlesLit + 1);
  st.candleGlow = 1.0;
  for (var i = 0; i < 12; i++) {
    st.candleSparks.push({
      x: (i % 2 === 0 ? -3.2 : 3.2) + (Math.random() - 0.5) * 0.7,
      y: 1.05 + Math.random() * 0.35,
      z: 9.4 + (Math.random() - 0.5) * 0.4,
      vy: 0.45 + Math.random() * 0.45,
      t: 0,
      maxT: 1.4 + Math.random() * 0.8
    });
  }
  st.toast = '🕯️ Ngọn nến cầu bình an bừng sáng ấm áp trước Tượng Đức Mẹ Hòa Bình! (' + st.candlesLit + ' nến)';
  st.toastUntil = st.t + 4.4;
}

function ringCathedralBell(st) {
  st.bellVel = 4.6 * (st.bellAngle >= 0 ? -1 : 1);
  if (Math.abs(st.bellAngle) < 0.05) st.bellVel = 4.6;
  st.bellWaves.push({ t: 0, maxT: 1.6 });
  st.bellWaves.push({ t: -0.25, maxT: 1.6 });
  st.toast = '🔔 BOONG... BOONG! Tiếng chuông đồng 1880 vang vọng khắp Sài Gòn!';
  st.toastUntil = st.t + 4.4;
}

function stepCathedralTps(st, dt) {
  st.t += dt;
  var p = st.pig;

  // 1. Chuyển phòng mượt 200ms Fade (1 Phòng = 1 Scene độc lập)
  if (st.pendingRoom) {
    st.roomFade = Math.min(1, st.roomFade + dt * 5.2);
    if (st.roomFade >= 0.99) {
      var prevRoom = st.room;
      st.room = st.pendingRoom;
      st.pendingRoom = '';
      if (st.room === 'sanctuary') {
        p.x = 0; p.z = 1.5; p.yaw = 0;
        p.targetX = 0; p.targetZ = 3.2; p.walking = true;
        st.toast = 'Cung Thánh · Bàn Thờ Đá Hoa Cương & Tượng Đức Mẹ Hòa Bình 🕯️';
      } else if (st.room === 'belfry') {
        p.x = -3.6; p.z = 10.6; p.yaw = Math.PI * 0.85;
        p.targetX = -1.6; p.targetZ = 8.4; p.walking = true;
        st.toast = 'Gác Đàn Ống Pipe Organ & Tháp Chuông Cổ 1880 🔔';
      } else {
        if (prevRoom === 'sanctuary') {
          p.x = 0; p.z = 12.2; p.yaw = Math.PI;
          p.targetX = 0; p.targetZ = 10.4; p.walking = true;
        } else if (prevRoom === 'belfry') {
          p.x = -3.4; p.z = 11.4; p.yaw = Math.PI;
          p.targetX = -1.2; p.targetZ = 10.2; p.walking = true;
        } else {
          p.x = 0; p.z = 1.6; p.yaw = 0;
          p.targetX = 0; p.targetZ = 2.6; p.walking = true;
        }
        st.toast = 'Thánh Đường Chính · Nhà Thờ Đức Bà Sài Gòn ⛪';
      }
      st.toastUntil = st.t + 4.2;
    }
  } else if (st.roomFade > 0) {
    st.roomFade = Math.max(0, st.roomFade - dt * 5.2);
  }

  // 2. Di chuyển chú Heo mượt tới điểm chạm sàn (Tap-to-Walk)
  if (p.walking && !st.pendingRoom) {
    var dx = p.targetX - p.x, dz = p.targetZ - p.z;
    var dist = Math.hypot(dx, dz);
    if (dist < 0.08) {
      p.walking = false;
    } else {
      var spd = Math.min(dist, 3.0 * dt);
      var next = clampCathedralWalkPos(st, p.x + (dx / dist) * spd, p.z + (dz / dist) * spd);
      p.x = next.x; p.z = next.z;
      p.yaw = Math.atan2(dx, dz);
    }
  }

  // 3. Vật lý con lắc Chuông Đồng Nhà Thờ
  var accel = -14.0 * st.bellAngle - 1.35 * st.bellVel;
  st.bellVel += accel * dt;
  st.bellAngle += st.bellVel * dt;
  if (Math.abs(st.bellAngle) < 0.002 && Math.abs(st.bellVel) < 0.005) {
    st.bellAngle = 0; st.bellVel = 0;
  }

  // 4. Hiệu ứng hạt nến ấm & sóng âm chuông
  var baseGlow = Math.min(0.85, st.candlesLit * 0.14);
  if (st.candleGlow > baseGlow) {
    st.candleGlow = Math.max(baseGlow, st.candleGlow - dt * 0.25);
  }
  if (st.organGlow > 0) st.organGlow = Math.max(0, st.organGlow - dt * 0.6);

  for (var si = st.candleSparks.length - 1; si >= 0; si--) {
    var sp = st.candleSparks[si];
    sp.t += dt;
    sp.y += sp.vy * dt;
    sp.x += Math.sin(st.t * 4 + si) * 0.12 * dt;
    if (sp.t >= sp.maxT) st.candleSparks.splice(si, 1);
  }
  for (var wi = st.bellWaves.length - 1; wi >= 0; wi--) {
    st.bellWaves[wi].t += dt;
    if (st.bellWaves[wi].t >= st.bellWaves[wi].maxT) st.bellWaves.splice(wi, 1);
  }

  // 5. Cửa gỗ lớn Nhà Thờ & Fade thoát về Đại Lộ Sài Gòn (240ms)
  var targetDoor = st.exiting ? 0.92 : (st.room === 'nave' && p.z < 1.8 && Math.abs(p.x) < 1.8 ? 0.22 : 0.0);
  st.doorOpen += (targetDoor - st.doorOpen) * Math.min(1, dt * 5.0);
  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.2);

  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== HELPER VẼ NỘI THẤT 3D ĐẶC TRƯNG NHÀ THỜ ĐỨC BÀ ==================== */
function drawCathedralChandelier3D(ctx, cam, wx, wy, wz, t) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 24) return;
  var u = Math.max(0.45, Math.min(3.2, pr.scale / 36));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  var topPr = projectPoint3D(cam, wx, 3.85, wz);
  ctx.save();
  // Xích đồng nối lên trần vòm
  if (topPr) {
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = Math.max(1.2, 1.8 * u);
    ctx.beginPath();
    ctx.moveTo(Math.round(topPr.sx), Math.round(topPr.sy));
    ctx.lineTo(px, py - 6 * u);
    ctx.stroke();
  }
  // Hào quang vàng ấm của chùm đèn pha lê
  var pulse = 0.20 + Math.sin(t * 4.5 + wz) * 0.04;
  ctx.fillStyle = 'rgba(253,224,71,' + pulse.toFixed(2) + ')';
  ctx.beginPath(); ctx.arc(px, py, 20 * u, 0, Math.PI * 2); ctx.fill();
  // Vòng đồng & pha lê 2 tầng
  ctx.strokeStyle = '#D97706'; ctx.lineWidth = Math.max(1.5, 2.2 * u);
  ctx.beginPath(); ctx.ellipse(px, py, 12 * u, 4 * u, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(px, py - 5 * u, 7 * u, 2.5 * u, 0, 0, Math.PI * 2); ctx.stroke();
  // 5 ngọn nến pha lê lấp lánh
  var pts = [-11, -5.5, 0, 5.5, 11];
  for (var i = 0; i < pts.length; i++) {
    var cx = px + pts[i] * u;
    var cy = py + (i % 2 === 0 ? 1 : -2) * u;
    ctx.fillStyle = '#FFFBEB';
    ctx.fillRect(Math.round(cx - 1 * u), Math.round(cy - 4 * u), Math.max(1.5, 2 * u), Math.max(3, 4 * u));
    ctx.fillStyle = '#FDE047';
    ctx.beginPath(); ctx.arc(cx, cy - 5 * u, Math.max(1.5, 2.2 * u), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawSpiralStairs3D(ctx, cam, isGoingUp) {
  // Cầu thang xoắn gỗ cổ kính ở góc sau trái (X = -3.8, Z = 11.8..14.4)
  drawBox3D(ctx, cam, -3.8, 0, 13.0, 0.34, 3.85, 0.34, {
    top: '#5C341D', front: '#4A2518', side: '#3E1F13', stroke: '#2B180E'
  });
  for (var s = 0; s < 8; s++) {
    var ang = (isGoingUp ? s : (7 - s)) * 0.58;
    var sy = s * 0.38;
    var sx = -3.8 + Math.cos(ang) * 0.85;
    var sz = 13.0 + Math.sin(ang) * 0.85;
    drawBox3D(ctx, cam, sx, sy, sz, 1.15, 0.14, 0.52, {
      top: '#966137', front: '#6B3E1E', side: '#4A2C1A', stroke: '#2B180E'
    });
  }
}

function drawOurLadyStatue3D(ctx, cam, wx, wy, wz, t, glowBoost) {
  // Bệ đá cẩm thạch 2 tầng nâng Tượng Đức Mẹ Hòa Bình
  drawBox3D(ctx, cam, wx, 0, wz, 1.45, 0.36, 1.25, { top: '#F5F0E6', front: '#E2D9C8', side: '#CFC3AF', stroke: '#78716C' });
  drawBox3D(ctx, cam, wx, 0.36, wz, 1.05, 0.72, 0.92, { top: '#FFFDF7', front: '#EDE4D3', side: '#D6CBB8', stroke: '#78716C' });

  var pr = projectPoint3D(cam, wx, wy + 1.08, wz);
  if (!pr || pr.cz > 24) return;
  var u = Math.max(0.55, Math.min(3.8, pr.scale / 34));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  // Hào quang thánh thiện tỏa sau Tượng Đức Mẹ
  var haloAlpha = 0.24 + (glowBoost || 0) * 0.26 + Math.sin(t * 2.5) * 0.05;
  ctx.fillStyle = 'rgba(254,240,138,' + haloAlpha.toFixed(2) + ')';
  ctx.beginPath(); ctx.arc(px, py - 24 * u, 16 * u, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = Math.max(1.2, 1.8 * u);
  ctx.beginPath(); ctx.arc(px, py - 27 * u, 6.5 * u, 0, Math.PI * 2); ctx.stroke();

  // Áo choàng trắng ngà & khăn choàng xanh thiên thanh dịu dàng
  ctx.fillStyle = '#FFFDF7'; ctx.strokeStyle = '#78716C'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px - 7 * u, py);
  ctx.lineTo(px - 5 * u, py - 22 * u);
  ctx.lineTo(px + 5 * u, py - 22 * u);
  ctx.lineTo(px + 7 * u, py);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  // Dải áo choàng xanh hòa bình
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(Math.round(px - 5.2 * u), Math.round(py - 21 * u), Math.max(2, Math.round(2.6 * u)), Math.round(19 * u));
  ctx.fillRect(Math.round(px + 2.6 * u), Math.round(py - 21 * u), Math.max(2, Math.round(2.6 * u)), Math.round(19 * u));

  // Quả địa cầu Hòa Bình & Thánh Giá nhỏ trên tay
  ctx.fillStyle = '#60A5FA'; ctx.strokeStyle = '#1E3A8A';
  ctx.beginPath(); ctx.arc(px, py - 14 * u, 3.0 * u, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(Math.round(px - 0.6 * u), Math.round(py - 19 * u), Math.max(1, 1.2 * u), Math.max(2, 3.2 * u));
  ctx.fillRect(Math.round(px - 1.5 * u), Math.round(py - 18 * u), Math.max(2, 3.0 * u), Math.max(1, 1.0 * u));

  // Khuôn mặt & khăn trùm đầu trắng thanh thoát
  ctx.fillStyle = '#F5F5F4';
  ctx.beginPath(); ctx.arc(px, py - 27 * u, 4.4 * u, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FDE6D2';
  ctx.beginPath(); ctx.arc(px, py - 26.5 * u, 3.0 * u, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawCandleStand3D(ctx, cam, wx, wz, t, extraLit) {
  // Giá nến đồng cổ điển
  drawBox3D(ctx, cam, wx, 0, wz, 0.22, 0.82, 0.22, { top: '#B45309', front: '#92400E', side: '#78350F', stroke: '#2B180E' });
  drawBox3D(ctx, cam, wx, 0.82, wz, 0.82, 0.08, 0.44, { top: '#F59E0B', front: '#D97706', side: '#B45309', stroke: '#451A03' });

  var pr = projectPoint3D(cam, wx, 0.96, wz);
  if (!pr || pr.cz > 22) return;
  var u = Math.max(0.45, Math.min(3.2, pr.scale / 36));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  var nCandles = 4 + Math.min(4, extraLit || 0);
  ctx.save();
  // Quầng sáng vàng lung linh tăng mạnh khi người chơi thắp thêm nến!
  var glowR = (14 + (extraLit || 0) * 3.5) * u;
  var gAlpha = Math.min(0.55, 0.22 + (extraLit || 0) * 0.05 + Math.sin(t * 7 + wx) * 0.04);
  ctx.fillStyle = 'rgba(253,224,71,' + gAlpha.toFixed(2) + ')';
  ctx.beginPath(); ctx.arc(px, py - 4 * u, glowR, 0, Math.PI * 2); ctx.fill();

  for (var i = 0; i < nCandles; i++) {
    var ox = ((i / Math.max(1, nCandles - 1)) - 0.5) * 14 * u;
    var flick = Math.sin(t * 11 + i * 1.7) * 0.8 * u;
    ctx.fillStyle = '#FFFDF7';
    ctx.fillRect(Math.round(px + ox - 1.2 * u), Math.round(py - 5 * u), Math.max(2, 2.4 * u), Math.max(4, 6 * u));
    ctx.fillStyle = '#F97316';
    ctx.beginPath(); ctx.arc(px + ox + flick * 0.4, py - 6.8 * u, Math.max(1.5, 2.0 * u), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath(); ctx.arc(px + ox, py - 7.2 * u, Math.max(1, 1.1 * u), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawPipeOrgan3D(ctx, cam, t, organGlow) {
  // Thùng đàn gỗ óc chó chạm khắc cổ điển (X = +0.9, Z = 13.4, rộng 5.4m)
  drawBox3D(ctx, cam, 0.9, 0, 13.5, 5.4, 1.35, 1.1, {
    top: '#6B3E1E', front: '#4A2518', side: '#3B1D12', stroke: '#23110B'
  });
  // Bàn phím 2 tầng ngà voi - gỗ mun + ghế nhạc công
  drawBox3D(ctx, cam, 0.9, 0.82, 12.82, 1.85, 0.14, 0.42, {
    top: '#FFFDF7', front: '#E2E8F0', side: '#CBD5E1', stroke: '#1E293B'
  });
  drawBox3D(ctx, cam, 0.9, 0, 12.15, 1.35, 0.52, 0.45, {
    top: '#7C4F2B', front: '#5C341D', side: '#4A2518', stroke: '#23110B'
  });

  // Dãy 17 ống đồng vàng óng ánh vươn cao đối xứng kiểu Gothic (chiều cao vòm nhà thờ!)
  var nPipes = 17;
  for (var i = 0; i < nPipes; i++) {
    var frac = i / (nPipes - 1);
    var px = -1.55 + frac * 4.9;
    var distCenter = Math.abs(frac - 0.5) * 2;
    var distEdge = Math.min(frac, 1 - frac) * 2;
    var pipeH = 1.15 + Math.max(1 - distCenter * 1.4, 0.9 - distEdge * 1.8) * 1.05;
    if (organGlow > 0.05) pipeH += Math.sin(t * 10 + i) * 0.06 * organGlow;
    var isGold = i % 2 === 0;
    drawBox3D(ctx, cam, px, 1.35, 13.45, 0.18, pipeH, 0.18, {
      top: '#FEF08A',
      front: isGold ? '#F4B93B' : '#D97706',
      side: isGold ? '#B45309' : '#92400E',
      stroke: '#451A03'
    });
  }
}

function drawBronzeBell3D(ctx, cam, wx, wz, bellAngle, t, bellWaves) {
  // Khung giá gỗ chữ A đỡ quả Chuông Đồng lớn (từ sàn lên xà trần Y = 3.85)
  drawBox3D(ctx, cam, wx - 0.85, 0, wz, 0.24, 3.85, 0.28, { top: '#5C341D', front: '#4A2518', side: '#3B1D12', stroke: '#23110B' });
  drawBox3D(ctx, cam, wx + 0.85, 0, wz, 0.24, 3.85, 0.28, { top: '#5C341D', front: '#4A2518', side: '#3B1D12', stroke: '#23110B' });
  drawBox3D(ctx, cam, wx, 3.25, wz, 2.05, 0.24, 0.34, { top: '#6B3E1E', front: '#5C341D', side: '#4A2518', stroke: '#23110B' });

  // Quả Chuông Đồng cổ đung đưa quanh trục Y = 3.25 theo góc bellAngle!
  var pivotPr = projectPoint3D(cam, wx, 3.25, wz);
  var bellPr = projectPoint3D(cam, wx + Math.sin(bellAngle) * 0.95, 3.25 - Math.cos(bellAngle) * 0.95, wz);
  var ropeTopPr = projectPoint3D(cam, wx + 0.45, 3.15, wz - 0.55);
  var ropeBotPr = projectPoint3D(cam, wx + 0.45 + Math.sin(bellAngle) * 0.22, 0.72, wz - 0.55);

  if (bellPr && bellPr.cz < 24) {
    var u = Math.max(0.55, Math.min(3.8, bellPr.scale / 34));
    ctx.save();
    // Dây thừng kéo chuông rủ xuống gần tầm tay chú Heo
    if (ropeTopPr && ropeBotPr) {
      ctx.strokeStyle = '#D6B88C';
      ctx.lineWidth = Math.max(2, 3.0 * u);
      ctx.beginPath();
      ctx.moveTo(ropeTopPr.sx, ropeTopPr.sy);
      ctx.lineTo(ropeBotPr.sx, ropeBotPr.sy);
      ctx.stroke();
      // Tay nắm dây kéo màu đỏ vàng
      ctx.fillStyle = '#B91C1C';
      ctx.beginPath(); ctx.arc(ropeBotPr.sx, ropeBotPr.sy, Math.max(3, 4.2 * u), 0, Math.PI * 2); ctx.fill();
    }

    // Sóng âm vàng lan tỏa khi kéo chuông
    for (var wi = 0; wi < bellWaves.length; wi++) {
      var wv = bellWaves[wi];
      if (wv.t <= 0) continue;
      var frac = wv.t / wv.maxT;
      ctx.strokeStyle = 'rgba(253,224,71,' + ((1 - frac) * 0.85).toFixed(2) + ')';
      ctx.lineWidth = Math.max(1.5, 3.0 * (1 - frac));
      ctx.beginPath();
      ctx.arc(bellPr.sx, bellPr.sy, (14 + frac * 68) * u, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Thân Chuông Đồng 1880 xoay theo góc bellAngle
    ctx.translate(bellPr.sx, bellPr.sy);
    ctx.rotate(-bellAngle * 0.85);
    // Chốt treo đồng & vai chuông
    ctx.fillStyle = '#78350F';
    ctx.fillRect(Math.round(-5 * u), Math.round(-16 * u), Math.round(10 * u), Math.round(4 * u));
    // Thân chuông hình chuông loe cổ điển
    ctx.fillStyle = '#B45309'; ctx.strokeStyle = '#451A03'; ctx.lineWidth = Math.max(1.2, 1.8 * u);
    ctx.beginPath();
    ctx.moveTo(-8 * u, -12 * u);
    ctx.quadraticCurveTo(-10 * u, 2 * u, -15 * u, 10 * u);
    ctx.lineTo(15 * u, 10 * u);
    ctx.quadraticCurveTo(10 * u, 2 * u, 8 * u, -12 * u);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // Vệt ánh kim đồng vàng sáng bên trái thân chuông
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(-5 * u, -10 * u);
    ctx.lineTo(-9 * u, 8 * u);
    ctx.lineTo(-4 * u, 8 * u);
    ctx.lineTo(-2 * u, -10 * u);
    ctx.closePath();
    ctx.fill();
    // Vành miệng chuông & quả lắc đồng bên trong
    ctx.fillStyle = '#78350F';
    ctx.beginPath(); ctx.ellipse(0, 10 * u, 15 * u, 3.8 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FDE047';
    ctx.beginPath(); ctx.arc(Math.sin(bellAngle) * 5 * u, 12 * u, 3.4 * u, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  if (pivotPr && bellPr) {
    ctx.save();
    ctx.strokeStyle = '#3B1D12';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pivotPr.sx, pivotPr.sy); ctx.lineTo(bellPr.sx, bellPr.sy); ctx.stroke();
    ctx.restore();
  }
}

/* ==================== RENDER CHÍNH 3 PHÒNG NHÀ THỜ ĐỨC BÀ TPS 3D ==================== */
function renderCathedralTpsScene(ctx, cam, st, W, H) {
  var room = st.room;
  ctx.fillStyle = room === 'belfry' ? '#4A2218' : (room === 'sanctuary' ? '#5E4B3C' : '#3B2820');
  ctx.fillRect(0, 0, W, H);

  // 1. SÀN NHÀ ĐẶC TRƯNG RIÊNG CHO TỪNG PHÒNG
  if (room === 'nave') {
    // Sàn đá ca-rô cổ điển + Thảm đỏ dài viền vàng dẫn thẳng lên Cung Thánh
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#DFD3BE', '#8C7A64', 1);
    for (var gz = 0; gz < 14.8; gz += 1.85) {
      for (var gx = -6; gx < 6; gx += 2.0) {
        if ((Math.round(gz / 1.85) + Math.round((gx + 6) / 2.0)) % 2 === 0) {
          drawPoly3D(ctx, cam, [[gx, 0.003, gz], [gx + 2.0, 0.003, gz], [gx + 2.0, 0.003, gz + 1.85], [gx, 0.003, gz + 1.85]], '#C7B69B', null, 0);
        }
      }
    }
    // Thảm nhung đỏ viền chỉ vàng ở lối đi giữa
    drawPoly3D(ctx, cam, [[-0.95, 0.008, 0.2], [0.95, 0.008, 0.2], [0.95, 0.008, 14.6], [-0.95, 0.008, 14.6]], '#D4AF37', null, 0);
    drawPoly3D(ctx, cam, [[-0.82, 0.012, 0.2], [0.82, 0.012, 0.2], [0.82, 0.012, 14.6], [-0.82, 0.012, 14.6]], '#991B1B', '#7F1D1D', 1);
    // Vệt ánh sáng kính màu hắt dịu xuống sàn đá
    drawPoly3D(ctx, cam, [[-5.2, 0.010, 3.0], [-2.0, 0.010, 3.4], [-2.0, 0.010, 5.4], [-5.2, 0.010, 5.0]], 'rgba(96,165,250,0.14)', null, 0);
    drawPoly3D(ctx, cam, [[2.0, 0.010, 7.0], [5.2, 0.010, 7.4], [5.2, 0.010, 9.4], [2.0, 0.010, 9.0]], 'rgba(251,191,36,0.15)', null, 0);
  } else if (room === 'sanctuary') {
    // Sàn đá cẩm thạch kem nâng bậc trang nghiêm + Thảm đỏ Cung Thánh
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#F2ECE1', '#B8AA96', 1);
    for (var sz = 0; sz < 14.8; sz += 2.4) {
      drawPoly3D(ctx, cam, [[-6, 0.004, sz], [6, 0.004, sz], [6, 0.004, sz + 1.2], [-6, 0.004, sz + 1.2]], '#E6DEC8', null, 0);
    }
    // Bậc thềm đá cẩm thạch hồng + thảm đỏ trải trước Bàn Thờ
    drawPoly3D(ctx, cam, [[-4.8, 0.012, 8.6], [4.8, 0.012, 8.6], [4.8, 0.012, 14.7], [-4.8, 0.012, 14.7]], '#D9CBB8', '#9C8A74', 1.4);
    drawPoly3D(ctx, cam, [[-1.35, 0.016, 0.2], [1.35, 0.016, 0.2], [1.35, 0.016, 10.6], [-1.35, 0.016, 10.6]], '#991B1B', '#D4AF37', 1.4);
  } else {
    // Sàn ván gỗ gác tháp chuông ấm áp
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#7C5332', '#4A2C1A', 1);
    for (var bx = -6; bx < 6; bx += 1.2) {
      drawPoly3D(ctx, cam, [[bx, 0.004, 0], [bx + 0.6, 0.004, 0], [bx + 0.6, 0.004, 14.8], [bx, 0.004, 14.8]], '#6B4527', '#4A2C1A', 0.6);
    }
  }

  // 2. TRẦN VÒM GÂN GOTHIC / XÀ GỖ THÁP CHUÔNG (Y = 3.85)
  var ceilCol = room === 'belfry' ? '#4A2C1A' : (room === 'sanctuary' ? '#CBB699' : '#BFA88A');
  var ribCol = room === 'belfry' ? '#2E1A0E' : '#8C6D4F';
  drawPoly3D(ctx, cam, [[-6, 3.85, 0], [6, 3.85, 0], [6, 3.85, 14.8], [-6, 3.85, 14.8]], ceilCol, ribCol, 1);
  for (var rz = 2.0; rz <= 13.8; rz += 2.6) {
    drawPoly3D(ctx, cam, [[-6, 3.72, rz - 0.16], [6, 3.72, rz - 0.16], [6, 3.72, rz + 0.16], [-6, 3.72, rz + 0.16]], ribCol, '#3B2314', 1);
  }

  // 3. 4 BỨC TƯỜNG KIẾN TRÚC GẠCH ĐỎ MARSEILLE & ĐÁ SA THẠCH
  var wallSide = room === 'belfry' ? '#8F3B2B' : (room === 'sanctuary' ? '#DCC9AF' : '#D4BEA0');
  var wallBack = room === 'belfry' ? '#7C3122' : (room === 'sanctuary' ? '#D2BC9E' : '#C7AF8E');
  drawPoly3D(ctx, cam, [[-6, 0, 0], [-6, 0, 14.8], [-6, 3.85, 14.8], [-6, 3.85, 0]], wallSide, '#5A251B', 1);
  drawPoly3D(ctx, cam, [[6, 0, 14.8], [6, 0, 0], [6, 3.85, 0], [6, 3.85, 14.8]], wallSide, '#5A251B', 1);
  drawPoly3D(ctx, cam, [[-6, 0, 14.8], [6, 0, 14.8], [6, 3.85, 14.8], [-6, 3.85, 14.8]], wallBack, '#5A251B', 1);

  if (room === 'nave') {
    // Tường mặt tiền (Z = 0) với Cửa Gỗ Lớn Nhà Thờ 2 cánh xoay bản lề
    drawPoly3D(ctx, cam, [[-6, 0, 0], [-1.45, 0, 0], [-1.45, 3.85, 0], [-6, 3.85, 0]], '#9E4735', '#5A251B', 1);
    drawPoly3D(ctx, cam, [[1.45, 0, 0], [6, 0, 0], [6, 3.85, 0], [1.45, 3.85, 0]], '#9E4735', '#5A251B', 1);
    drawPoly3D(ctx, cam, [[-1.45, 2.82, 0], [1.45, 2.82, 0], [1.45, 3.85, 0], [-1.45, 3.85, 0]], '#7C3122', '#4A1D13', 1);
    // Ánh sáng Sài Gòn bên ngoài cổng Nhà Thờ
    drawPoly3D(ctx, cam, [[-1.45, 0, -0.04], [1.45, 0, -0.04], [1.45, 2.82, -0.04], [-1.45, 2.82, -0.04]], '#FFFBEB', '#FDE68A', 0.8);
    var dAng = st.doorOpen * 0.95;
    var lx1 = -1.45 + Math.cos(dAng) * 1.42, lz1 = 0.02 + Math.sin(dAng) * 1.42;
    var rx1 =  1.45 - Math.cos(dAng) * 1.42, rz1 = 0.02 + Math.sin(dAng) * 1.42;
    drawPoly3D(ctx, cam, [[-1.45, 0, 0.02], [lx1, 0, lz1], [lx1, 2.80, lz1], [-1.45, 2.80, 0.02]], '#5C341D', '#2B180E', 1.8);
    drawPoly3D(ctx, cam, [[1.45, 0, 0.02], [rx1, 0, rz1], [rx1, 2.80, rz1], [1.45, 2.80, 0.02]], '#5C341D', '#2B180E', 1.8);
  } else {
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 3.85, 0], [-6, 3.85, 0]], wallBack, '#5A251B', 1);
  }

  // 4. MỸ THUẬT TƯỜNG RIÊNG TỪNG PHÒNG (cathedralWallArt.ts)
  if (typeof drawCathedralWalls3D === 'function') {
    drawCathedralWalls3D(ctx, cam, room, st.t, st.candleGlow);
  }

  // 5. CHÙM ĐÈN PHA LÊ VÀNG ẤM (Thánh Đường & Cung Thánh)
  if (room === 'nave') {
    drawCathedralChandelier3D(ctx, cam, 0, 2.95, 3.8, st.t);
    drawCathedralChandelier3D(ctx, cam, 0, 2.95, 7.6, st.t);
    drawCathedralChandelier3D(ctx, cam, 0, 2.95, 11.4, st.t);
  } else if (room === 'sanctuary') {
    drawCathedralChandelier3D(ctx, cam, -2.2, 3.05, 5.8, st.t);
    drawCathedralChandelier3D(ctx, cam,  2.2, 3.05, 5.8, st.t);
    drawCathedralChandelier3D(ctx, cam,  0.0, 3.12, 9.6, st.t);
  }

  // 6. VÒNG SÓNG TAP-TO-WALK TRÊN SÀN
  for (var ri = 0; ri < st.ripples.length; ri++) {
    var rp = st.ripples[ri];
    var rPr = projectPoint3D(cam, rp.x, 0.02, rp.z);
    if (rPr) {
      ctx.save();
      ctx.strokeStyle = 'rgba(244,185,59,' + (1 - rp.t / 0.75).toFixed(2) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(rPr.sx, rPr.sy, (6 + rp.t * 28), (3 + rp.t * 12), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 7. PAINTER'S ALGORITHM Z-SORT CHO NỘI THẤT & NHÂN VẬT THEO PHÒNG
  var items = [];
  function pushItem(wx, wz, fn) {
    items.push({ d: Math.hypot(wx - cam.pos.x, wz - cam.pos.z), fn: fn });
  }

  if (room === 'nave') {
    // 2 Dãy ghế gỗ sồi cầu nguyện
    for (var pi = 0; pi < st.pews.length; pi++) {
      (function(pw) {
        pushItem(pw.x, pw.z, function() {
          // Mặt ghế gỗ sồi đánh bóng
          drawBox3D(ctx, cam, pw.x, 0.36, pw.z, 2.55, 0.10, 0.52, { top: '#7C4F2B', front: '#5C341D', side: '#4A2518', stroke: '#2B180E' });
          // Tựa lưng cao phía trước & 2 chân gỗ 2 đầu
          drawBox3D(ctx, cam, pw.x, 0.46, pw.z + 0.22, 2.55, 0.44, 0.10, { top: '#6B3E1E', front: '#4A2518', side: '#3B1D12', stroke: '#2B180E' });
          drawBox3D(ctx, cam, pw.x - 1.18, 0, pw.z, 0.16, 0.86, 0.56, { top: '#5C341D', front: '#4A2518', side: '#3B1D12', stroke: '#2B180E' });
          drawBox3D(ctx, cam, pw.x + 1.18, 0, pw.z, 0.16, 0.86, 0.56, { top: '#5C341D', front: '#4A2518', side: '#3B1D12', stroke: '#2B180E' });
        });
      })(st.pews[pi]);
    }
    // Giáo dân ngồi cầu nguyện trang nghiêm
    for (var hi = 0; hi < st.parishioners.length; hi++) {
      (function(h) { pushItem(h.x, h.z, function() { drawHumanTps3D(ctx, cam, h, st.t); }); })(st.parishioners[hi]);
    }
    // Cầu thang xoắn gỗ lên Tháp Chuông (góc sau trái)
    pushItem(-3.8, 13.0, function() { drawSpiralStairs3D(ctx, cam, true); });
    // Chậu nước phép đá cẩm thạch gần cửa
    pushItem(2.1, 1.4, function() {
      drawBox3D(ctx, cam, 2.1, 0, 1.4, 0.34, 0.78, 0.34, { top: '#E7E5E4', front: '#D6D3D1', side: '#A8A29E', stroke: '#57534E' });
      drawBox3D(ctx, cam, 2.1, 0.78, 1.4, 0.58, 0.14, 0.58, { top: '#BAE6FD', front: '#E7E5E4', side: '#D6D3D1', stroke: '#57534E' });
    });
  } else if (room === 'sanctuary') {
    // Bàn Thờ Đá Hoa Cương + Khăn Ren Trắng + Thánh Giá Vàng (X = 0, Z = 10.6)
    pushItem(0, 10.6, function() {
      // Đế đá hoa cương xám đậm cổ điển
      drawBox3D(ctx, cam, 0, 0, 10.6, 3.35, 0.92, 1.12, { top: '#64748B', front: '#475569', side: '#334155', stroke: '#1E293B' });
      // Khăn ren trắng tinh khôi phủ mặt Bàn Thờ + viền chỉ vàng
      drawBox3D(ctx, cam, 0, 0.92, 10.6, 3.48, 0.14, 1.22, { top: '#FFFDF7', front: '#F8FAFC', side: '#E2E8F0', stroke: '#D4AF37' });
      // Thánh Giá Vàng uy nghiêm đặt giữa Bàn Thờ
      drawBox3D(ctx, cam, 0, 1.06, 10.65, 0.32, 0.12, 0.24, { top: '#FACC15', front: '#D97706', side: '#B45309', stroke: '#451A03' });
      drawBox3D(ctx, cam, 0, 1.18, 10.65, 0.10, 0.88, 0.08, { top: '#FEF08A', front: '#F59E0B', side: '#D97706', stroke: '#451A03' });
      drawBox3D(ctx, cam, 0, 1.66, 10.65, 0.54, 0.10, 0.08, { top: '#FEF08A', front: '#F59E0B', side: '#D97706', stroke: '#451A03' });
      // Sách Lễ đỏ viền vàng trên bàn thờ
      drawBox3D(ctx, cam, -0.85, 1.06, 10.55, 0.42, 0.09, 0.32, { top: '#B91C1C', front: '#991B1B', side: '#7F1D1D', stroke: '#F4B93B' });
    });
    // Tượng Đức Mẹ Hòa Bình thanh thoát phía sau Bàn Thờ (X = 0, Z = 12.9)
    pushItem(0, 12.9, function() { drawOurLadyStatue3D(ctx, cam, 0, 0, 12.9, st.t, st.candleGlow); });
    // 2 Giá nến vàng lung linh hai bên Cung Thánh
    pushItem(-3.2, 9.4, function() { drawCandleStand3D(ctx, cam, -3.2, 9.4, st.t, st.candlesLit); });
    pushItem( 3.2, 9.4, function() { drawCandleStand3D(ctx, cam,  3.2, 9.4, st.t, st.candlesLit); });
  } else if (room === 'belfry') {
    // Đại Phong Cầm Pipe Organ ống đồng vàng óng ánh
    pushItem(0.9, 13.4, function() { drawPipeOrgan3D(ctx, cam, st.t, st.organGlow); });
    // Quả Chuông Đồng Nhà Thờ lớn treo xà gỗ kèm dây kéo
    pushItem(2.0, 7.6, function() { drawBronzeBell3D(ctx, cam, 2.0, 7.6, st.bellAngle, st.t, st.bellWaves); });
    // Cầu thang xoắn đi xuống Thánh Đường Chính (góc sau trái)
    pushItem(-3.8, 13.0, function() { drawSpiralStairs3D(ctx, cam, false); });
  }

  // Chú Heo Mascot 1:1 toàn App
  pushItem(st.pig.x, st.pig.z, function() { drawPigTps3D(ctx, cam, st.pig, st.t); });

  items.sort(function(a, b) { return b.d - a.d; });
  for (var ii = 0; ii < items.length; ii++) items[ii].fn();

  // 8. Hạt ánh sáng nến ấm bay lên trong Cung Thánh
  if (room === 'sanctuary' && st.candleSparks.length > 0) {
    ctx.save();
    for (var ki = 0; ki < st.candleSparks.length; ki++) {
      var sp = st.candleSparks[ki];
      var sPr = projectPoint3D(cam, sp.x, sp.y, sp.z);
      if (sPr) {
        var al = Math.max(0, 1 - sp.t / sp.maxT);
        ctx.fillStyle = 'rgba(254,240,138,' + al.toFixed(2) + ')';
        ctx.beginPath(); ctx.arc(sPr.sx, sPr.sy, Math.max(1.8, sPr.scale * 0.032), 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  // 9. Lớp phủ ánh sáng ấm trang nghiêm + Fade chuyển phòng (200ms) / Fade thoát về Hub (240ms)
  ctx.save();
  if (room === 'sanctuary') {
    var warmA = 0.07 + st.candleGlow * 0.10;
    ctx.fillStyle = 'rgba(255, 224, 140, ' + warmA.toFixed(2) + ')';
  } else if (room === 'belfry') {
    ctx.fillStyle = 'rgba(255, 195, 120, 0.08)';
  } else {
    ctx.fillStyle = 'rgba(255, 220, 165, 0.06)';
  }
  ctx.fillRect(0, 0, W, H);

  var fAlpha = Math.max(st.exitFade, st.roomFade);
  if (fAlpha > 0.01) {
    ctx.fillStyle = st.roomFade > st.exitFade
      ? 'rgba(43, 27, 20, ' + st.roomFade.toFixed(2) + ')'
      : 'rgba(246, 238, 220, ' + st.exitFade.toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
`;
}
