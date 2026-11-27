/**
 * Cửa Hàng Adidas Originals Hội An 3 Phòng TPS 3D Độc Bản (Quyết định 245)
 * Kiến trúc 3 phòng riêng biệt 100% (1 Room = 1 Scene, Fade chuyển phòng 200ms, KHÔNG gộp chung):
 * 1. 'hall'    — Sảnh Tầng 1 Hội An: Sàn gạch bông Hội An, tường vàng nghệ (#E3B857), xà gỗ tối,
 *                đèn lồng lụa Hội An, Shoe Display Wall (Samba/Superstar/Gazelle/Predator),
 *                kệ Sportswear + cửa sang Phòng Thay Đồ, Đảo Giày trung tâm, 2 Nhân viên Adidas,
 *                Cầu thang gỗ lên Lầu 2 & cửa gỗ-kính mặt tiền (Z = 0, thoát về Đại Lộ).
 * 2. 'fitting' — Phòng Thay Đồ & Gương Toàn Thân: Sàn gỗ ấm boutique, tường xanh ngọc-rêu & viền vàng,
 *                rèm nhung đỏ đô, Gương gỗ toàn thân phản chiếu chú Heo, sào áo khoác 3 Sọc,
 *                ghế băng gỗ thử giày, tương tác "👕 Thử áo khoác 3 Sọc" & cửa về Sảnh Tầng 1.
 * 3. 'upper'   — Lầu 2 Bộ Sưu Tập Việt Nam & Thu Ngân: Sàn gỗ ấm, tường vàng kem Hội An,
 *                BST Áo 3 Sọc & Nón Lá Việt Nam, tranh tường Hoa Sen × 3 Sọc,
 *                Quầy Thu Ngân gỗ + nhân viên thu ngân + "🛍️ Chọn mua giày Samba" & cầu thang xuống Tầng 1.
 */
export function buildAdidasTps3dSceneScript(): string {
  return String.raw`
function createAdidasTpsState() {
  var hallStaff = [
    { x: -2.4, z: 6.2, yaw: Math.PI / 2, role: 'adidas_staff', shirt: '#111827', hair: '#1C1917', moving: false, seated: false, phase: 0.3 },
    { x: 2.9,  z: 4.9, yaw: -Math.PI / 2, role: 'adidas_staff', shirt: '#111827', hair: '#292524', moving: false, seated: false, phase: 1.7 }
  ];
  var upperCashier = {
    x: 4.95, z: 6.8, yaw: -Math.PI / 2, role: 'adidas_staff', shirt: '#111827', hair: '#1C1917', moving: false, seated: false, phase: 0.9
  };

  return {
    room: 'hall',
    pendingRoom: '',
    roomFade: 0,
    pig: {
      x: 0, z: 1.35, yaw: 0, targetX: 0, targetZ: 2.4,
      walking: true, seated: false, eating: false,
      wearingJacket: false, boughtSamba: false
    },
    hallStaff: hallStaff,
    upperCashier: upperCashier,
    leftDoorOpen: 0.0,
    rightDoorOpen: 0.0,
    exitFade: 0,
    exiting: false,
    ripples: [],
    toast: 'Adidas Originals Hội An · Sảnh Tầng 1! Khám phá Đảo Giày, Phòng Thay Đồ & Lầu 2 👟',
    toastUntil: 5.0,
    t: 0
  };
}

function clampAdidasWalkPos(st, x, z) {
  var nx = Math.max(-5.1, Math.min(5.1, x));
  var nz = Math.max(0.65, Math.min(11.3, z));
  var boxes = [];
  if (st.room === 'hall') {
    boxes = [
      { x1: -1.35, z1: 5.15, x2: 1.35, z2: 7.25 },  // Đảo giày trung tâm
      { x1: -5.95, z1: 1.8,  x2: -4.65, z2: 11.4 }, // Kệ Shoe Display Wall trái
      { x1: 4.65,  z1: 1.9,  x2: 5.95,  z2: 7.7 }   // Kệ Sportswear phải
    ];
  } else if (st.room === 'fitting') {
    boxes = [
      { x1: -5.95, z1: 2.2,  x2: -4.25, z2: 10.4 }, // Sào treo áo khoác 3 Sọc trái
      { x1: -3.25, z1: 6.65, x2: -1.45, z2: 8.15 }  // Ghế băng gỗ thử giày
    ];
  } else {
    boxes = [
      { x1: 3.15,  z1: 4.2,  x2: 5.95,  z2: 9.6 },  // Quầy Thu Ngân gỗ phải
      { x1: -5.95, z1: 1.9,  x2: -4.65, z2: 11.1 }, // Kệ trưng bày BST Việt Nam trái
      { x1: -0.65, z1: 7.15, x2: 1.05,  z2: 8.45 }  // Bục trưng bày Samba Hội An giữa phòng
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

function triggerAdidasRoom(st, roomId) {
  if (!roomId || st.pendingRoom || st.room === roomId) return;
  if (roomId !== 'hall' && roomId !== 'fitting' && roomId !== 'upper') return;
  st.pendingRoom = roomId;
  st.pig.walking = false;
  st.pig.seated = false;
}

function stepAdidasTps(st, dt) {
  st.t += dt;
  var p = st.pig;

  // 1. Chuyển phòng mượt 200ms (1 Room = 1 Scene, zero merging)
  if (st.pendingRoom) {
    st.roomFade = Math.min(1, st.roomFade + dt * 5.2);
    if (st.roomFade >= 0.99) {
      var prev = st.room;
      st.room = st.pendingRoom;
      st.pendingRoom = '';
      if (st.room === 'fitting') {
        p.x = 3.6; p.z = 9.6; p.yaw = -Math.PI * 0.72;
        p.targetX = 0.2; p.targetZ = 10.6; p.walking = true;
        st.toast = 'Phòng Thay Đồ VIP · Soi gương toàn thân & thử áo khoác 3 Sọc nhé! 🪞👕';
      } else if (st.room === 'upper') {
        p.x = -3.4; p.z = 10.3; p.yaw = Math.PI;
        p.targetX = -1.6; p.targetZ = 8.8; p.walking = true;
        st.toast = 'Lầu 2 · Bộ Sưu Tập Việt Nam Hoa Sen × 3 Sọc & Quầy Thu Ngân! 🛍️';
      } else {
        if (prev === 'fitting') {
          p.x = 3.8; p.z = 9.6; p.yaw = -Math.PI / 2;
          p.targetX = 2.4; p.targetZ = 8.6; p.walking = true;
        } else {
          p.x = -3.4; p.z = 10.3; p.yaw = Math.PI;
          p.targetX = -1.8; p.targetZ = 8.8; p.walking = true;
        }
        st.toast = 'Sảnh Tầng 1 · Adidas Originals Hội An Heritage! 👟';
      }
      st.toastUntil = st.t + 4.2;
    }
  } else if (st.roomFade > 0) {
    st.roomFade = Math.max(0, st.roomFade - dt * 5.2);
  }

  // 2. Di chuyển chú Heo tới điểm chạm sàn
  if (!p.seated && p.walking && !st.pendingRoom) {
    var dx = p.targetX - p.x, dz = p.targetZ - p.z;
    var dist = Math.hypot(dx, dz);
    if (dist < 0.08) {
      p.walking = false;
    } else {
      var spd = Math.min(dist, 3.0 * dt);
      var next = clampAdidasWalkPos(st, p.x + (dx / dist) * spd, p.z + (dz / dist) * spd);
      p.x = next.x; p.z = next.z;
      p.yaw = Math.atan2(dx, dz);
    }
  }

  // 3. Cửa mặt tiền Tầng 1 mở khi rời cửa hàng
  var targetDoor = (st.room === 'hall' && st.exiting) ? 0.90 : 0.0;
  st.rightDoorOpen += (targetDoor - st.rightDoorOpen) * Math.min(1, dt * 6.0);
  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.2);

  // 4. Vòng sóng Tap-to-Walk
  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== HELPER VẼ CẦU THANG GỖ HỘI AN & GIÀY SNEAKER 3D ==================== */
function drawAdidasStaircase3D(ctx, cam, isGoingUp) {
  for (var s = 0; s < 7; s++) {
    var sy = isGoingUp ? (s * 0.34) : ((6 - s) * 0.22);
    var sz = 11.6 + s * 0.42;
    drawBox3D(ctx, cam, -3.65, 0, sz, 2.25, Math.max(0.22, sy + 0.28), 0.44, {
      top: '#966137', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E'
    });
  }
  drawBox3D(ctx, cam, -2.52, 0, 11.6, 0.08, 1.05, 0.08, { top: '#4A2C1A', front: '#2B180E', side: '#2B180E' });
  drawBox3D(ctx, cam, -2.52, 0, 14.2, 0.08, 2.95, 0.08, { top: '#4A2C1A', front: '#2B180E', side: '#2B180E' });
  drawPoly3D(ctx, cam, [[-2.52, 1.02, 11.6], [-2.52, 2.92, 14.2], [-2.52, 3.00, 14.2], [-2.52, 1.10, 11.6]], '#4A2C1A', '#2B180E', 1.5);
}

function drawSneakerSprite3D(ctx, cam, wx, wy, wz, bodyCol, stripeCol, soleCol) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 16 || pr.cz < 0.35) return;
  var u = Math.max(0.45, Math.min(2.8, pr.scale / 40));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  ctx.fillStyle = 'rgba(43,24,14,0.28)';
  ctx.beginPath(); ctx.ellipse(px, py + 1 * u, 7 * u, 2.2 * u, 0, 0, Math.PI * 2); ctx.fill();
  // Đế giày
  ctx.fillStyle = soleCol || '#B45309';
  ctx.fillRect(px - 6 * u, py - 2.2 * u, 12 * u, 2.6 * u);
  // Thân giày
  ctx.fillStyle = bodyCol || '#FFFBF1';
  ctx.fillRect(px - 5.5 * u, py - 6.2 * u, 9.5 * u, 4.2 * u);
  ctx.fillRect(px + 2.8 * u, py - 4.4 * u, 3.0 * u, 2.4 * u);
  // 3 Sọc Adidas
  ctx.fillStyle = stripeCol || '#111827';
  ctx.fillRect(px - 2.6 * u, py - 5.6 * u, 1.1 * u, 3.2 * u);
  ctx.fillRect(px - 0.8 * u, py - 5.6 * u, 1.1 * u, 3.2 * u);
  ctx.fillRect(px + 1.0 * u, py - 5.6 * u, 1.1 * u, 3.2 * u);
  ctx.strokeStyle = '#2B180E'; ctx.lineWidth = 1;
  ctx.strokeRect(px - 6 * u, py - 6.2 * u, 12 * u, 6.6 * u);
  ctx.restore();
}

/* ==================== VẼ KHÔNG GIAN 3 PHÒNG ADIDAS ORIGINALS HỘI AN TPS 3D ==================== */
function renderAdidasTpsScene(ctx, cam, st, W, H) {
  var room = st.room;
  var isHall = room === 'hall';
  var isFitting = room === 'fitting';
  var isUpper = room === 'upper';

  ctx.fillStyle = isFitting ? '#213527' : (isUpper ? '#5C341D' : '#4A2C1A');
  ctx.fillRect(0, 0, W, H);

  // 1. SÀN NHÀ RIÊNG BIỆT CHO TỪNG PHÒNG
  if (isHall) {
    // Sàn Gạch Bông Hội An cổ điển (ô vuông xen kẽ kem & vàng đất)
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#E8DEC8', '#8C7A5B', 1);
    for (var tz = 0; tz < 14.4; tz += 1.6) {
      for (var tx = -6; tx < 6; tx += 1.6) {
        var even = ((Math.round(tx / 1.6) + Math.round(tz / 1.6)) % 2 === 0);
        if (even) {
          drawPoly3D(ctx, cam, [[tx, 0.004, tz], [tx + 1.6, 0.004, tz], [tx + 1.6, 0.004, tz + 1.6], [tx, 0.004, tz + 1.6]], '#D6C4A1', '#B5A17D', 0.6);
        }
      }
    }
    // Thảm sọc 3 sọc vàng-nâu chạy giữa lối đi Sảnh Tầng 1
    drawPoly3D(ctx, cam, [[-1.1, 0.008, 0.4], [1.1, 0.008, 0.4], [1.1, 0.008, 4.8], [-1.1, 0.008, 4.8]], '#3B2314', '#F4B93B', 1.2);
  } else if (isFitting) {
    // Sàn gỗ boutique ấm áp + thảm thử đồ xanh-vàng trước gương toàn thân
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#8F6038', '#4A2C1A', 1);
    for (var fx = -6; fx < 6; fx += 1.2) {
      drawPoly3D(ctx, cam, [[fx, 0.004, 0], [fx + 0.6, 0.004, 0], [fx + 0.6, 0.004, 14.8], [fx, 0.004, 14.8]], '#7D512D', '#5C341D', 0.5);
    }
    drawPoly3D(ctx, cam, [[-2.0, 0.01, 9.6], [2.0, 0.01, 9.6], [2.0, 0.01, 13.6], [-2.0, 0.01, 13.6]], '#1F3D2B', '#F4B93B', 1.8);
  } else {
    // Lầu 2: Sàn gỗ ván ấm Hội An + thảm đỏ-vàng dẫn tới tranh tường Hoa Sen
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#9C6D44', '#5C341D', 1);
    for (var ux = -6; ux < 6; ux += 1.2) {
      drawPoly3D(ctx, cam, [[ux, 0.004, 0], [ux + 0.6, 0.004, 0], [ux + 0.6, 0.004, 14.8], [ux, 0.004, 14.8]], '#8B5E38', '#6B4226', 0.5);
    }
    drawPoly3D(ctx, cam, [[-1.6, 0.01, 2.0], [1.8, 0.01, 2.0], [1.8, 0.01, 13.2], [-1.6, 0.01, 13.2]], '#7F1D1D', '#F4B93B', 1.4);
  }

  // 2. TRẦN GỖ TỐI & HỆ XÀ GỒ HỘI AN KÍN 100% (Y = 3.85)
  drawPoly3D(ctx, cam, [[-6, 3.85, 0], [6, 3.85, 0], [6, 3.85, 14.8], [-6, 3.85, 14.8]], isFitting ? '#3B2314' : '#5C341D', '#2B180E', 1);
  for (var bz = 2.0; bz <= 13.6; bz += 2.6) {
    drawPoly3D(ctx, cam, [[-6, 3.74, bz - 0.14], [6, 3.74, bz - 0.14], [6, 3.74, bz + 0.14], [-6, 3.74, bz + 0.14]], '#3B2314', '#2B180E', 1);
  }

  // 3. 4 BỨC TƯỜNG RIÊNG BIỆT CHO TỪNG PHÒNG
  var wLeft  = isFitting ? '#2F4A36' : (isUpper ? '#F1D27A' : '#E3B857');
  var wRight = isFitting ? '#28402F' : (isUpper ? '#E8C468' : '#D9AE4E');
  var wBack  = isFitting ? '#243A2A' : (isUpper ? '#E3BE5E' : '#D4A745');
  drawPoly3D(ctx, cam, [[-6, 0, 0], [-6, 0, 14.8], [-6, 3.85, 14.8], [-6, 3.85, 0]], wLeft, '#5C341D', 1);
  drawPoly3D(ctx, cam, [[6, 0, 14.8], [6, 0, 0], [6, 3.85, 0], [6, 3.85, 14.8]], wRight, '#5C341D', 1);
  drawPoly3D(ctx, cam, [[-6, 0, 14.8], [6, 0, 14.8], [6, 3.85, 14.8], [-6, 3.85, 14.8]], wBack, '#5C341D', 1);

  if (isHall) {
    // Tường mặt tiền Sảnh Tầng 1 (Z = 0) với cửa gỗ-kính Hội An (thoát về Đại Lộ)
    drawPoly3D(ctx, cam, [[-6, 0, 0], [-1.35, 0, 0], [-1.35, 3.85, 0], [-6, 3.85, 0]], '#D9AE4E', '#5C341D', 1);
    drawPoly3D(ctx, cam, [[1.35, 0, 0], [6, 0, 0], [6, 3.85, 0], [1.35, 3.85, 0]], '#D9AE4E', '#5C341D', 1);
    drawPoly3D(ctx, cam, [[-1.35, 2.74, 0], [1.35, 2.74, 0], [1.35, 3.85, 0], [-1.35, 3.85, 0]], '#4A2C1A', '#2B180E', 1);
    drawPoly3D(ctx, cam, [[-1.35, 0, -0.04], [1.35, 0, -0.04], [1.35, 2.74, -0.04], [-1.35, 2.74, -0.04]], '#FFFDF0', '#FDE68A', 0.8);
    if (st.rightDoorOpen > 0.04) {
      var bSpread = 1.4 + st.rightDoorOpen * 2.4;
      drawPoly3D(ctx, cam, [[0.02, 0.014, 0.05], [1.32, 0.014, 0.05], [1.32 + bSpread * 0.4, 0.014, 0.05 + bSpread], [-0.15, 0.014, 0.05 + bSpread]], 'rgba(255,248,215,0.34)', null, 0);
    }
    var rAng = st.rightDoorOpen * 0.92;
    drawPoly3D(ctx, cam, [[-1.35, 0, 0.02], [-0.02, 0, 0.02], [-0.02, 2.72, 0.02], [-1.35, 2.72, 0.02]], '#5C341D', '#2B180E', 1.6);
    drawPoly3D(ctx, cam, [[-1.18, 0.95, 0.03], [-0.18, 0.95, 0.03], [-0.18, 2.52, 0.03], [-1.18, 2.52, 0.03]], 'rgba(255,248,225,0.74)', '#F4B93B', 1);
    var rx1 = 1.35 - Math.cos(rAng) * 1.33, rz1 = 0.02 + Math.sin(rAng) * 1.33;
    drawPoly3D(ctx, cam, [[1.35, 0, 0.02], [rx1, 0, rz1], [rx1, 2.72, rz1], [1.35, 2.72, 0.02]], '#5C341D', '#2B180E', 1.6);
  } else {
    // Tường trước kín cho Phòng Thay Đồ & Lầu 2
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 3.85, 0], [-6, 3.85, 0]], wLeft, '#5C341D', 1);
  }

  // 4. MỸ THUẬT TƯỜNG 3 PHÒNG (adidasWallArt.ts)
  if (typeof drawAdidasRoomWalls3D === 'function') {
    drawAdidasRoomWalls3D(ctx, cam, room, st.pig, st.t);
  }

  // 5. ĐÈN LỒNG LỤA HỘI AN TREO TRẦN (drawLanternGlow3D)
  var lanterns = isHall
    ? [[-2.4, 3.6, '#EF4444', '#FCA5A5'], [2.4, 3.6, '#F59E0B', '#FDE68A'], [-2.6, 7.8, '#FACC15', '#FEF08A'], [2.6, 7.8, '#DC2626', '#FCA5A5'], [0, 11.2, '#10B981', '#A7F3D0'], [0, 5.2, '#F59E0B', '#FDE68A']]
    : (isFitting
      ? [[-2.0, 5.4, '#F59E0B', '#FDE68A'], [2.0, 5.4, '#FACC15', '#FEF08A'], [0, 11.8, '#FFF3C4', '#FDE68A']]
      : [[-2.2, 4.2, '#EF4444', '#FCA5A5'], [2.2, 4.2, '#FACC15', '#FEF08A'], [-2.2, 8.6, '#F59E0B', '#FDE68A'], [2.2, 8.6, '#DC2626', '#FCA5A5'], [0.4, 12.2, '#F43F5E', '#FDA4AF']]);
  for (var li = 0; li < lanterns.length; li++) {
    drawLanternGlow3D(ctx, cam, lanterns[li][0], 2.95, lanterns[li][1], lanterns[li][2], lanterns[li][3], 0.22, 3.85);
  }

  // 6. Vòng sóng Tap-to-Walk trên sàn
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

  // 7. PAINTER'S ALGORITHM Z-SORT CHO NỘI THẤT & NHÂN VẬT TỪNG PHÒNG
  var items = [];
  function pushItem(wx, wz, fn) {
    items.push({ d: Math.hypot(wx - cam.pos.x, wz - cam.pos.z), fn: fn });
  }

  if (isHall) {
    // Cầu thang gỗ lên Lầu 2 (góc sau trái)
    pushItem(-3.65, 13.0, function() { drawAdidasStaircase3D(ctx, cam, true); });

    // Đảo Giày Trung Tâm (Center Sneaker Island — Samba, Superstar, Predator)
    pushItem(0, 6.2, function() {
      drawBox3D(ctx, cam, 0, 0, 6.2, 2.4, 0.84, 1.8, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
      drawBox3D(ctx, cam, 0, 0.84, 6.2, 2.52, 0.08, 1.92, { top: '#E3B857', front: '#C89B3C', side: '#A67C2E', stroke: '#2B180E' });
      // 3 bục giày nổi bật trên đảo
      drawBox3D(ctx, cam, -0.72, 0.92, 6.2, 0.56, 0.14, 0.56, { top: '#FFFBF1', front: '#E2E8F0', side: '#CBD5E1', stroke: '#2B180E' });
      drawBox3D(ctx, cam,  0.00, 0.92, 6.2, 0.62, 0.22, 0.62, { top: '#111827', front: '#1E293B', side: '#0F172A', stroke: '#F4B93B' });
      drawBox3D(ctx, cam,  0.72, 0.92, 6.2, 0.56, 0.14, 0.56, { top: '#FFFBF1', front: '#E2E8F0', side: '#CBD5E1', stroke: '#2B180E' });
      drawSneakerSprite3D(ctx, cam, -0.72, 1.07, 6.2, '#FFFBF1', '#111827', '#B45309'); // Samba OG
      drawSneakerSprite3D(ctx, cam,  0.00, 1.15, 6.2, '#1E293B', '#F97316', '#0F172A'); // Predator
      drawSneakerSprite3D(ctx, cam,  0.72, 1.07, 6.2, '#DC2626', '#FFFBF1', '#F8FAFC'); // Gazelle
    });

    // Kệ thấp dọc Tường Shoe Display Wall (trái)
    pushItem(-5.2, 6.6, function() {
      drawBox3D(ctx, cam, -5.3, 0, 6.6, 1.1, 0.82, 9.2, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
      drawBox3D(ctx, cam, -5.2, 0.82, 3.6, 0.42, 0.22, 0.62, { top: '#1D4ED8', front: '#1E40AF', side: '#1E3A8A' });
      drawBox3D(ctx, cam, -5.2, 0.82, 9.2, 0.42, 0.22, 0.62, { top: '#1D4ED8', front: '#1E40AF', side: '#1E3A8A' });
    });

    // Kệ thấp dưới giá áo Sportswear (phải)
    pushItem(5.2, 4.8, function() {
      drawBox3D(ctx, cam, 5.3, 0, 4.8, 1.0, 0.72, 5.4, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
    });

    // 2 Nhân viên Adidas
    for (var si = 0; si < st.hallStaff.length; si++) {
      (function(emp) {
        pushItem(emp.x, emp.z, function() { drawHumanTps3D(ctx, cam, emp, st.t); });
      })(st.hallStaff[si]);
    }
  } else if (isFitting) {
    // Ghế băng gỗ thử giày bọc đệm nhung xanh-vàng (Wooden Shoe Bench)
    pushItem(-2.35, 7.4, function() {
      drawBox3D(ctx, cam, -2.35, 0, 7.4, 1.55, 0.42, 0.92, { top: '#5C341D', front: '#4A2C1A', side: '#3B2314', stroke: '#2B180E' });
      drawBox3D(ctx, cam, -2.35, 0.42, 7.4, 1.45, 0.12, 0.82, { top: '#14532D', front: '#166534', side: '#052E16', stroke: '#F4B93B' });
      // Hộp giày Samba đặt cạnh ghế thử đồ
      drawBox3D(ctx, cam, -1.25, 0, 7.75, 0.42, 0.22, 0.56, { top: '#1D4ED8', front: '#1E40AF', side: '#1E3A8A', stroke: '#2B180E' });
      drawSneakerSprite3D(ctx, cam, -1.25, 0.24, 7.75, '#FFFBF1', '#111827', '#B45309');
    });

    // Giá treo áo khoác 3 Sọc bằng gỗ & thanh đồng (trái)
    pushItem(-5.0, 6.4, function() {
      drawBox3D(ctx, cam, -5.1, 0, 6.4, 1.2, 0.58, 7.8, { top: '#6B4226', front: '#4A2C1A', side: '#3B2314', stroke: '#2B180E' });
      drawBox3D(ctx, cam, -4.9, 0.58, 4.2, 0.48, 0.18, 0.48, { top: '#111827', front: '#1E293B', side: '#0F172A' });
      drawBox3D(ctx, cam, -4.9, 0.58, 8.4, 0.48, 0.18, 0.48, { top: '#991B1B', front: '#7F1D1D', side: '#450A0A' });
    });

    // Bục gỗ đèn hắt chân Gương Toàn Thân
    pushItem(0, 14.2, function() {
      drawBox3D(ctx, cam, 0, 0, 14.3, 3.6, 0.20, 0.65, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#F4B93B' });
    });
  } else {
    // LẦU 2: Cầu thang gỗ xuống Tầng 1
    pushItem(-3.65, 13.0, function() { drawAdidasStaircase3D(ctx, cam, false); });

    // Kệ trưng bày Bộ Sưu Tập Việt Nam (trái)
    pushItem(-5.2, 6.5, function() {
      drawBox3D(ctx, cam, -5.3, 0, 6.5, 1.1, 0.84, 8.8, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
      drawBox3D(ctx, cam, -5.2, 0.84, 4.4, 0.45, 0.18, 0.55, { top: '#DA251D', front: '#991B1B', side: '#7F1D1D' });
      drawBox3D(ctx, cam, -5.2, 0.84, 8.6, 0.45, 0.18, 0.55, { top: '#0F766E', front: '#115E59', side: '#134E4A' });
    });

    // Bục Trưng Bày Phiên Bản Giới Hạn Samba Hội An (giữa phòng)
    pushItem(0.2, 7.8, function() {
      drawBox3D(ctx, cam, 0.2, 0, 7.8, 1.35, 0.88, 1.05, { top: '#5C341D', front: '#4A2C1A', side: '#3B2314', stroke: '#F4B93B' });
      drawBox3D(ctx, cam, 0.2, 0.88, 7.8, 0.68, 0.14, 0.56, { top: '#1D4ED8', front: '#1E40AF', side: '#1E3A8A', stroke: '#FFFBF1' });
      drawSneakerSprite3D(ctx, cam, 0.2, 1.04, 7.8, '#FFFBF1', '#111827', '#B45309');
    });

    // Quầy Thu Ngân Gỗ Hội An (phải) + Máy POS + Hộp Giày Samba + Thu ngân Adidas
    pushItem(3.95, 6.8, function() {
      drawBox3D(ctx, cam, 3.95, 0, 6.8, 1.15, 1.04, 5.2, { top: '#8C5229', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
      drawBox3D(ctx, cam, 3.92, 1.04, 6.8, 1.32, 0.10, 5.4, { top: '#E3B857', front: '#C89B3C', side: '#A67C2E', stroke: '#2B180E' });
      // Màn hình POS & chồng hộp giày xanh Originals trên quầy
      drawBox3D(ctx, cam, 3.85, 1.14, 6.3, 0.36, 0.34, 0.44, { top: '#1E293B', front: '#0F172A', side: '#334155', stroke: '#F4B93B' });
      drawBox3D(ctx, cam, 3.85, 1.14, 7.6, 0.44, 0.24, 0.62, { top: '#1D4ED8', front: '#1E40AF', side: '#1E3A8A', stroke: '#FFFBF1' });
      drawSneakerSprite3D(ctx, cam, 3.85, 1.40, 7.6, '#FFFBF1', '#111827', '#B45309');
    });
    pushItem(st.upperCashier.x, st.upperCashier.z, function() {
      drawHumanTps3D(ctx, cam, st.upperCashier, st.t);
    });
  }

  // Chú Heo Mascot 1:1 toàn App
  pushItem(st.pig.x, st.pig.z, function() {
    drawPigTps3D(ctx, cam, st.pig, st.t);
    // Huy hiệu nhỏ trên đầu khi chú Heo đã mặc áo khoác 3 Sọc hoặc mua giày Samba!
    if (st.pig.wearingJacket || st.pig.boughtSamba) {
      var tagPr = projectPoint3D(cam, st.pig.x, 1.32, st.pig.z);
      if (tagPr && tagPr.cz > 0.5 && tagPr.cz < 14) {
        ctx.save();
        ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        var label = st.pig.boughtSamba ? '🛍️ SAMBA OG' : '👕 3 SỌC VIP';
        ctx.fillStyle = 'rgba(43,24,14,0.92)'; ctx.fillRect(tagPr.sx - 38, tagPr.sy - 9, 76, 15);
        ctx.strokeStyle = '#F4B93B'; ctx.lineWidth = 1.2; ctx.strokeRect(tagPr.sx - 38, tagPr.sy - 9, 76, 15);
        ctx.fillStyle = '#FDE047'; ctx.fillText(label, tagPr.sx, tagPr.sy + 2);
        ctx.restore();
      }
    }
  });

  items.sort(function(a, b) { return b.d - a.d; });
  for (var ii = 0; ii < items.length; ii++) items[ii].fn();

  // 8. Lớp phủ ánh sáng đèn lồng Hội An ấm áp + Fade chuyển phòng (200ms) / Fade thoát (240ms)
  ctx.save();
  ctx.fillStyle = isFitting ? 'rgba(255, 214, 130, 0.08)' : 'rgba(255, 220, 140, 0.07)';
  ctx.fillRect(0, 0, W, H);
  var fAlpha = Math.max(st.exitFade, st.roomFade);
  if (fAlpha > 0.01) {
    ctx.fillStyle = st.roomFade > st.exitFade
      ? 'rgba(43, 24, 14, ' + st.roomFade.toFixed(2) + ')'
      : 'rgba(246, 238, 220, ' + st.exitFade.toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
`;
}
