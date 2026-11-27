/**
 * Quán Cộng Cà Phê 2 Tầng TPS 3D Độc Bản (Quyết định 242–244)
 * Kiến trúc khác biệt hoàn toàn 100% Quán Phở, bám sát 1:1 5 ảnh thực tế Cộng Cà Phê:
 * - TẦNG 1 (Trệt): Sàn xi măng mài xám-xanh, bố cục bất đối xứng — Quầy Bar dài tủ lưới mắt cáo chạy dọc TƯỜNG PHẢI
 *   (2 Barista áo xanh lính + biển PICK UP HERE), Cửa sổ kính rèm xanh cốm & bàn dài dọc TƯỜNG TRÁI,
 *   2 bàn tròn cổ + ghế bành gỗ tay cong gối Chăn Con Công ở giữa, Tường Sách xếp chồng khổng lồ,
 *   biển tròn ĐI NHẸ NÓI KHẼ, Cầu Thang Gỗ 3D 7 Bậc lên Lầu 2 & cửa hé 1 cánh (~35°) đón tia nắng.
 * - TẦNG 2 (Lầu Trên): Sàn gỗ ván mộc, tường xanh rêu Cộng (#4F6335), trần xà gồ + Rèm vải bố nâu thắt nút rủ giữa phòng,
 *   cột bê tông thô, Bàn Gỗ Dài Cộng Đồng 6 ghế đệm Chăn Con Công, Kệ Ziczac Phích Rạng Đông,
 *   tủ khăn thổ cẩm đặt Đài Radio Đỏ + Điện Thoại Quay Số + Đồng Hồ Báo Thức, cửa sổ song gỗ & Góc Bàn Heo AI!
 */
export function buildCafeTps3dSceneScript(): string {
  return String.raw`
function createCafeTpsState() {
  // Bàn Tầng 1 (Bất đối xứng: 2 bàn tròn ghế bành cong giữa phòng + 2 chỗ bàn dài cửa sổ trái)
  var f1Tables = [
    { id: 0, x: -0.9, z: 4.3, chairX: -0.9, chairZ: 3.25, kind: 'round', hasCoffee: true, hasCroissant: true, occupiedBy: null },
    { id: 1, x: -0.7, z: 8.1, chairX: -0.7, chairZ: 7.05, kind: 'round', hasCoffee: true, hasCroissant: false, occupiedBy: 'npc_0' },
    { id: 2, x: -4.9, z: 4.5, chairX: -3.95, chairZ: 4.5, kind: 'window', hasCoffee: true, hasCroissant: true, occupiedBy: 'npc_1' },
    { id: 3, x: -4.9, z: 8.0, chairX: -3.95, chairZ: 8.0, kind: 'window', hasCoffee: true, hasCroissant: false, occupiedBy: null }
  ];

  // Bàn Tầng 2 (Bàn dài cộng đồng 6 ghế ở trung tâm-trái + Bàn bar cửa sổ phải + Góc Bàn Heo AI)
  var f2Tables = [
    { id: 0, x: -1.6, z: 5.4, chairX: -0.55, chairZ: 5.4, kind: 'communal', hasCoffee: true, hasCroissant: true, occupiedBy: null },
    { id: 1, x: -1.6, z: 7.4, chairX: -0.55, chairZ: 7.4, kind: 'communal', hasCoffee: true, hasCroissant: true, occupiedBy: 'f2_npc_0' },
    { id: 2, x:  4.8, z: 4.6, chairX:  3.95, chairZ: 4.6, kind: 'bar_win', hasCoffee: true, hasCroissant: false, occupiedBy: null },
    { id: 3, x:  3.3, z: 9.0, chairX:  2.25, chairZ: 9.0, kind: 'ai', hasCoffee: true, hasCroissant: true, occupiedBy: 'ai_coach', isAiTable: true }
  ];

  var f1Customers = [
    { id: 'npc_0', x: -0.7, z: 7.05, yaw: 0, state: 'sitting', tableId: 1, timer: 16, shirt: '#B45309', hair: '#1C1917', seated: true, moving: false, phase: 0.4 },
    { id: 'npc_1', x: -3.95, z: 4.5, yaw: -Math.PI/2, state: 'sitting', tableId: 2, timer: 22, shirt: '#3F6212', hair: '#292524', seated: true, moving: false, phase: 1.5 },
    { id: 'npc_2', x: 0.55, z: 0.28, yaw: 0, state: 'entering', tableId: -1, timer: 2.0, shirt: '#991B1B', hair: '#1E293B', seated: false, moving: true, phase: 2.3 }
  ];

  var f2Customers = [
    { id: 'f2_npc_0', x: -0.55, z: 7.4, yaw: -Math.PI/2, state: 'sitting', tableId: 1, timer: 99, shirt: '#7C2D12', hair: '#1C1917', seated: true, moving: false, phase: 0.8 },
    { id: 'f2_npc_1', x: -2.65, z: 6.4, yaw: Math.PI/2, state: 'sitting', tableId: 0, timer: 99, shirt: '#365314', hair: '#292524', seated: true, moving: false, phase: 2.1 }
  ];

  // 2 Barista áo xanh bộ đội ngôi sao vàng đứng sau Quầy Bar DÀI dọc TƯỜNG PHẢI!
  var baristas = [
    { x: 5.15, z: 5.2, yaw: -Math.PI/2, role: 'barista', hair: '#1C1917', moving: false, phase: 0.2 },
    { x: 5.15, z: 8.6, yaw: -Math.PI/2, role: 'barista', hair: '#292524', moving: false, phase: 1.8 }
  ];
  var waiter = {
    x: 2.5, z: 6.4, yaw: -Math.PI/2, role: 'cafe_waiter', hair: '#1C1917',
    state: 'idle', targetTable: -1, carryCoffee: false, moving: false, phase: 0.9
  };

  // Heo AI đeo kính ngồi chill trên Tầng 2 (1:1 sprite chú Heo toàn App)
  var aiCoachPig = {
    x: 3.3, z: 9.85, yaw: Math.PI, seated: true, walking: false, eating: false, isAiCoach: true
  };

  return {
    floor: 1,
    pendingFloor: 0,
    floorFade: 0,
    pig: {
      x: 0, z: 1.1, yaw: 0, targetX: 0, targetZ: 2.1,
      walking: true, seated: false, seatTableId: -1, eating: false,
      drinkReady: false, orderSent: false
    },
    aiCoachPig: aiCoachPig,
    f1Tables: f1Tables,
    f2Tables: f2Tables,
    f1Customers: f1Customers,
    f2Customers: f2Customers,
    baristas: baristas,
    waiter: waiter,
    leftDoorOpen: 0.0,
    rightDoorOpen: 0.0,
    exitFade: 0,
    exiting: false,
    ripples: [],
    toast: 'Cộng Cà Phê · Tầng 1! Đi cuối góc trái leo Cầu Thang lên Lầu 2 nhé 🪜',
    toastUntil: 5.0,
    t: 0
  };
}

function getActiveCafeTables(st) {
  return st.floor === 2 ? st.f2Tables : st.f1Tables;
}

function clampCafeWalkPos(st, x, z) {
  var nx = Math.max(-5.15, Math.min(5.15, x));
  var nz = Math.max(0.65, Math.min(11.1, z));
  var boxes = st.floor === 1
    ? [
        { x1: 3.35, z1: 2.4, x2: 5.95, z2: 11.1 },  // Quầy Bar dài dọc TƯỜNG PHẢI
        { x1: -5.95, z1: 1.8, x2: -4.45, z2: 10.2 }, // Bàn dài cửa sổ TƯỜNG TRÁI
        { x1: -1.55, z1: 3.7, x2: -0.25, z2: 4.9 },  // Bàn tròn 1
        { x1: -1.35, z1: 7.5, x2: -0.05, z2: 8.7 }   // Bàn tròn 2
      ]
    : [
        { x1: -2.45, z1: 4.3, x2: -0.75, z2: 8.5 },  // Bàn gỗ dài cộng đồng
        { x1: 1.45, z1: 4.95, x2: 3.35, z2: 5.95 },  // Cột bê tông thô + Tủ Đài Đỏ
        { x1: 4.45, z1: 2.0, x2: 5.95, z2: 10.2 },   // Bàn bar cửa sổ song gỗ
        { x1: 2.65, z1: 8.4, x2: 3.95, z2: 9.6 }     // Góc bàn Heo AI
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

function triggerCafeFloorSwitch(st, targetFloor) {
  if (st.pendingFloor || st.floor === targetFloor) return;
  st.pendingFloor = targetFloor;
  st.pig.seated = false; st.pig.walking = false; st.pig.seatTableId = -1;
  st.pig.eating = false; st.pig.orderSent = false; st.pig.drinkReady = false;
}

function stepCafeTps(st, dt) {
  st.t += dt;
  var p = st.pig;

  // 1. Chuyển tầng mượt 200ms khi bước lên/xuống Cầu Thang Gỗ 3D
  if (st.pendingFloor) {
    st.floorFade = Math.min(1, st.floorFade + dt * 5.5);
    if (st.floorFade >= 0.99) {
      st.floor = st.pendingFloor;
      st.pendingFloor = 0;
      p.x = -3.55; p.z = 10.35; p.yaw = Math.PI;
      p.targetX = -2.2; p.targetZ = 9.2; p.walking = true;
      st.toast = st.floor === 2
        ? 'Lầu 2 · Gác Xanh Cộng Cà Phê! Rèm vải bố, Bàn dài & Heo AI đang chờ ☕'
        : 'Tầng 1 · Quầy Bar Tủ Lưới & Tường Sách Bao Cấp! ☕';
      st.toastUntil = st.t + 4.5;
    }
  } else if (st.floorFade > 0) {
    st.floorFade = Math.max(0, st.floorFade - dt * 5.0);
  }

  // 2. Di chuyển chú Heo mượt tới điểm chạm sàn
  if (!p.seated && p.walking && !st.pendingFloor) {
    var dx = p.targetX - p.x, dz = p.targetZ - p.z;
    var dist = Math.hypot(dx, dz);
    if (dist < 0.08) {
      p.walking = false;
    } else {
      var spd = Math.min(dist, 2.95 * dt);
      var next = clampCafeWalkPos(st, p.x + (dx / dist) * spd, p.z + (dz / dist) * spd);
      p.x = next.x; p.z = next.z;
      p.yaw = Math.atan2(dx, dz);
    }
  }

  // 3. FSM Khách NPC Tầng 1 ra/vào cửa (hé nhẹ 1 cánh phải ~35°)
  var guestNearDoor = false;
  if (st.floor === 1) {
    for (var ci = 0; ci < st.f1Customers.length; ci++) {
      var c = st.f1Customers[ci];
      if (c.z < 1.65 && Math.abs(c.x) < 1.8) guestNearDoor = true;
      if (c.state === 'entering') {
        if (c.tableId < 0) {
          for (var ti = 0; ti < st.f1Tables.length; ti++) {
            if (!st.f1Tables[ti].occupiedBy && p.seatTableId !== ti) {
              c.tableId = ti; st.f1Tables[ti].occupiedBy = c.id; break;
            }
          }
        }
        if (c.tableId >= 0) {
          var tb = st.f1Tables[c.tableId];
          var cdx = tb.chairX - c.x, cdz = tb.chairZ - c.z, cd = Math.hypot(cdx, cdz);
          if (cd < 0.14) {
            c.x = tb.chairX; c.z = tb.chairZ; c.yaw = tb.kind === 'window' ? -Math.PI/2 : 0;
            c.seated = true; c.moving = false; c.state = 'sitting'; c.timer = 16 + Math.random() * 10;
          } else {
            var cs = Math.min(cd, 1.85 * dt);
            c.x += (cdx / cd) * cs; c.z += (cdz / cd) * cs; c.yaw = Math.atan2(cdx, cdz); c.moving = true;
          }
        }
      } else if (c.state === 'sitting') {
        c.timer -= dt;
        if (c.timer <= 0) {
          if (c.tableId >= 0) st.f1Tables[c.tableId].occupiedBy = null;
          c.tableId = -1; c.seated = false; c.state = 'leaving'; c.moving = true;
        }
      } else if (c.state === 'leaving') {
        var ldx = 0.55 - c.x, ldz = 0.25 - c.z, ld = Math.hypot(ldx, ldz);
        if (ld < 0.16) {
          c.x = 0.55; c.z = 0.28; c.state = 'entering'; c.timer = 2.0;
        } else {
          var ls = Math.min(ld, 1.85 * dt);
          c.x += (ldx / ld) * ls; c.z += (ldz / ld) * ls; c.yaw = Math.atan2(ldx, ldz); c.moving = true;
        }
      }
    }
  }

  // 4. FSM Phục vụ bưng Cà Phê Cốt Dừa & Bánh Sừng Bò ra bàn chú Heo
  var w = st.waiter;
  if (w.state === 'delivering' && w.targetTable >= 0) {
    var tbs = getActiveCafeTables(st);
    var wtb = tbs[w.targetTable];
    if (wtb) {
      var wdx = (wtb.x + 0.7) - w.x, wdz = wtb.z - w.z, wd = Math.hypot(wdx, wdz);
      if (wd < 0.35) {
        w.carryCoffee = false; w.moving = false; w.state = 'returning';
        if (p.seated && p.seatTableId === w.targetTable) {
          p.drinkReady = true; p.eating = true;
          wtb.hasCoffee = true; wtb.hasCroissant = true;
          st.toast = 'Cà Phê Cốt Dừa kem tuyết & Bánh Sừng Bò nóng hổi đây! ☕🥐';
          st.toastUntil = st.t + 4.5;
        }
      } else {
        var ws = Math.min(wd, 2.35 * dt);
        w.x += (wdx / wd) * ws; w.z += (wdz / wd) * ws; w.yaw = Math.atan2(wdx, wdz); w.moving = true;
      }
    }
  } else if (w.state === 'returning') {
    var rdx = 2.5 - w.x, rdz = 6.4 - w.z, rd = Math.hypot(rdx, rdz);
    if (rd < 0.2) { w.state = 'idle'; w.moving = false; w.yaw = -Math.PI/2; }
    else {
      var rs = Math.min(rd, 2.1 * dt);
      w.x += (rdx / rd) * rs; w.z += (rdz / rd) * rs; w.yaw = Math.atan2(rdx, rdz); w.moving = true;
    }
  }

  // 5. Cánh cửa phải hé nhẹ ~35° khi khách NPC ra/vào hoặc Heo rời quán
  st.leftDoorOpen = 0.0;
  var targetRightOpen = st.exiting ? 0.85 : (guestNearDoor ? 0.62 : 0.0);
  st.rightDoorOpen += (targetRightOpen - st.rightDoorOpen) * Math.min(1, dt * 5.2);
  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.2);

  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== HELPER VẼ CẦU THANG GỖ 3D 7 BẬC & RÈM VẢI BỐ THẮT NÚT ==================== */
function drawCafeStaircase3D(ctx, cam, isGoingUp) {
  // 7 bậc thang gỗ mộc tay vịn sắt đen ở góc sau trái (X = -4.85..-2.45, Z = 11.4..14.4)
  for (var s = 0; s < 7; s++) {
    var sy = isGoingUp ? (s * 0.34) : ((6 - s) * 0.22);
    var sz = 11.6 + s * 0.42;
    drawBox3D(ctx, cam, -3.65, 0, sz, 2.25, Math.max(0.22, sy + 0.28), 0.44, {
      top: '#966137', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E'
    });
  }
  // Tay vịn sắt đen bao cấp bên phải cầu thang
  drawBox3D(ctx, cam, -2.52, 0, 11.6, 0.08, 1.05, 0.08, { top: '#1E293B', front: '#0F172A', side: '#0F172A' });
  drawBox3D(ctx, cam, -2.52, 0, 14.2, 0.08, 2.95, 0.08, { top: '#1E293B', front: '#0F172A', side: '#0F172A' });
  drawPoly3D(ctx, cam, [[-2.52, 1.02, 11.6], [-2.52, 2.92, 14.2], [-2.52, 3.00, 14.2], [-2.52, 1.10, 11.6]], '#1E293B', '#0F172A', 1.5);
}

function drawBurlapCanopy3D(ctx, cam) {
  // Rèm vải bố nâu thắt nút rủ mềm từ trần xuống giữa Tầng 2 (1:1 ảnh mẫu 4!)
  drawPoly3D(ctx, cam, [[-3.4, 3.82, 5.4], [-0.4, 3.82, 5.4], [-1.55, 2.45, 6.4], [-1.85, 2.45, 6.4]], 'rgba(180,130,82,0.82)', '#784F2A', 1.2);
  drawPoly3D(ctx, cam, [[-3.4, 3.82, 7.4], [-0.4, 3.82, 7.4], [-1.55, 2.45, 6.4], [-1.85, 2.45, 6.4]], 'rgba(166,116,70,0.82)', '#784F2A', 1.2);
  // Nút thắt rèm & đuôi vải thả xuống
  drawBox3D(ctx, cam, -1.70, 2.22, 6.4, 0.36, 0.32, 0.36, { top: '#C68B53', front: '#A66E38', side: '#8A5628', stroke: '#5C341D' });
  drawPoly3D(ctx, cam, [[-1.82, 2.22, 6.4], [-1.58, 2.22, 6.4], [-1.62, 1.65, 6.4], [-1.78, 1.65, 6.4]], 'rgba(180,130,82,0.85)', '#784F2A', 1);
}

/* ==================== VẼ KHÔNG GIAN CỘNG CÀ PHÊ 2 TẦNG TPS 3D (QĐ 244) ==================== */
function renderCafeTpsScene(ctx, cam, st, W, H) {
  var isF2 = st.floor === 2;
  ctx.fillStyle = isF2 ? '#3A4A28' : '#4E554B';
  ctx.fillRect(0, 0, W, H);

  // 1. SÀN NHÀ KHÁC BIỆT HOÀN TOÀN: Tầng 1 = Xi măng mài xám-xanh · Tầng 2 = Sàn gỗ ván mộc
  if (!isF2) {
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#6E756B', '#52584F', 1);
    for (var gz = 0; gz < 14.8; gz += 2.4) {
      drawPoly3D(ctx, cam, [[-6, 0.004, gz], [6, 0.004, gz], [6, 0.004, gz + 1.2], [-6, 0.004, gz + 1.2]], '#777F74', null, 0);
    }
  } else {
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#8A7963', '#5C4E3C', 1);
    for (var gx = -6; gx < 6; gx += 1.2) {
      drawPoly3D(ctx, cam, [[gx, 0.004, 0], [gx + 0.6, 0.004, 0], [gx + 0.6, 0.004, 14.8], [gx, 0.004, 14.8]], '#7D6D58', '#615342', 0.5);
    }
  }

  // 2. TRẦN KÍN 100% (Y = 3.85): Tầng 1 = Trần bê tông rọi ray · Tầng 2 = Mái gỗ xà gồ ấm
  drawPoly3D(ctx, cam, [[-6, 3.85, 0], [6, 3.85, 0], [6, 3.85, 14.8], [-6, 3.85, 14.8]], isF2 ? '#6E4B2E' : '#5E645B', '#3E423C', 1);
  for (var bz = 2.0; bz <= 13.6; bz += 2.6) {
    drawPoly3D(ctx, cam, [[-6, 3.74, bz - 0.14], [6, 3.74, bz - 0.14], [6, 3.74, bz + 0.14], [-6, 3.74, bz + 0.14]], isF2 ? '#4A2C1A' : '#3F453D', '#262925', 1);
  }

  // 3. 4 BỨC TƯỜNG ĐẶC TRƯNG CỘNG CÀ PHÊ: Tầng 1 = Xi măng loang/Olive · Tầng 2 = Xanh Rêu Cộng (#4F6335)
  var wCol = isF2 ? '#4F6335' : '#858B7D';
  var wBack = isF2 ? '#45572E' : '#7A8073';
  drawPoly3D(ctx, cam, [[-6, 0, 0], [-6, 0, 14.8], [-6, 3.85, 14.8], [-6, 3.85, 0]], wCol, '#3A4235', 1);
  drawPoly3D(ctx, cam, [[6, 0, 14.8], [6, 0, 0], [6, 3.85, 0], [6, 3.85, 14.8]], isF2 ? '#45572E' : '#4A5D36', '#2B3522', 1);
  drawPoly3D(ctx, cam, [[-6, 0, 14.8], [6, 0, 14.8], [6, 3.85, 14.8], [-6, 3.85, 14.8]], wBack, '#3A4235', 1);

  if (!isF2) {
    // Tường mặt tiền Tầng 1 (Z = 0) với cửa gỗ xanh bộ đội kính mờ hé 1 cánh phải (~35°)
    drawPoly3D(ctx, cam, [[-6, 0, 0], [-1.35, 0, 0], [-1.35, 3.85, 0], [-6, 3.85, 0]], '#3B4D2B', '#26331B', 1);
    drawPoly3D(ctx, cam, [[1.35, 0, 0], [6, 0, 0], [6, 3.85, 0], [1.35, 3.85, 0]], '#3B4D2B', '#26331B', 1);
    drawPoly3D(ctx, cam, [[-1.35, 2.72, 0], [1.35, 2.72, 0], [1.35, 3.85, 0], [-1.35, 3.85, 0]], '#2D3D20', '#1B2613', 1);
    drawPoly3D(ctx, cam, [[-1.35, 0, -0.04], [1.35, 0, -0.04], [1.35, 2.72, -0.04], [-1.35, 2.72, -0.04]], '#FFFDF0', '#FDE68A', 0.8);
    if (st.rightDoorOpen > 0.04) {
      var bSpread = 1.4 + st.rightDoorOpen * 2.5;
      drawPoly3D(ctx, cam, [[0.02, 0.014, 0.05], [1.32, 0.014, 0.05], [1.32 + bSpread * 0.45, 0.014, 0.05 + bSpread], [-0.15, 0.014, 0.05 + bSpread]], 'rgba(255,250,220,' + (0.28 + st.rightDoorOpen * 0.25).toFixed(2) + ')', null, 0);
    }
    var rAng = st.rightDoorOpen * 0.92;
    drawPoly3D(ctx, cam, [[-1.35, 0, 0.02], [-0.02, 0, 0.02], [-0.02, 2.70, 0.02], [-1.35, 2.70, 0.02]], '#3B4D2B', '#1E2916', 1.6);
    drawPoly3D(ctx, cam, [[-1.18, 1.08, 0.03], [-0.18, 1.08, 0.03], [-0.18, 2.52, 0.03], [-1.18, 2.52, 0.03]], 'rgba(255,248,225,0.72)', '#D9B45A', 1);
    var rx1 = 1.35 - Math.cos(rAng) * 1.33, rz1 = 0.02 + Math.sin(rAng) * 1.33;
    drawPoly3D(ctx, cam, [[1.35, 0, 0.02], [rx1, 0, rz1], [rx1, 2.70, rz1], [1.35, 2.70, 0.02]], '#3B4D2B', '#1E2916', 1.6);
    drawPoly3D(ctx, cam, [[-1.05, 0.012, 0.12], [1.05, 0.012, 0.12], [1.05, 0.012, 0.72], [-1.05, 0.012, 0.72]], '#7F1D1D', '#F4B93B', 1);
  } else {
    // Tường trước Tầng 2 (Z = 0) kín ấm áp màu xanh rêu Cộng + khung tranh cổ
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 3.85, 0], [-6, 3.85, 0]], '#4F6335', '#2B381E', 1);
  }

  // 4. Mỹ thuật 3 Mặt Tường Riêng Biệt Cho Từng Tầng (cafeVnWallArt.ts)
  if (typeof drawCafeVnCultureWalls3D === 'function') {
    drawCafeVnCultureWalls3D(ctx, cam, st.floor);
  }

  // 5. Đèn Thả Sứ Vàng Ấm & Rèm Vải Bố Thắt Nút (Tầng 2)
  var lamps = isF2
    ? [[-1.6, 5.2], [-1.6, 7.6], [3.2, 4.8], [3.3, 9.0]]
    : [[-0.9, 4.3], [-0.7, 8.1], [3.6, 4.5], [3.6, 8.5], [-4.4, 6.2]];
  for (var li = 0; li < lamps.length; li++) {
    drawVintageLamp3D(ctx, cam, lamps[li][0], 2.95, lamps[li][1], 3.85);
  }
  if (isF2) drawBurlapCanopy3D(ctx, cam);

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

  // 7. Painter's Algorithm Z-Sort cho toàn bộ nội thất & nhân vật theo từng tầng!
  var items = [];
  function pushItem(wx, wz, fn) {
    items.push({ d: Math.hypot(wx - cam.pos.x, wz - cam.pos.z), fn: fn });
  }

  // Cầu Thang Gỗ 3D 7 Bậc (cả 2 tầng đều ở góc sau trái)
  pushItem(-3.65, 13.0, function() { drawCafeStaircase3D(ctx, cam, !isF2); });

  if (!isF2) {
    // ---- NỘI THẤT TẦNG 1 (BẤT ĐỐI XỨNG 1:1 ẢNH 2, 3 & 5) ----
    // 1. Quầy Bar DÀI Tủ Lưới Mắt Cáo chạy dọc TƯỜNG PHẢI (X = +4.1, Z = 6.7)
    pushItem(4.1, 6.7, function() {
      drawBox3D(ctx, cam, 4.1, 0, 6.7, 1.05, 1.02, 8.2, { top: '#5A6E43', front: '#4A5D36', side: '#657A4B', stroke: '#2B3522' });
      // Các ô tủ khung gỗ lưới mắt cáo dọc mặt quầy (X = 3.56)
      for (var cz = 3.2; cz <= 9.8; cz += 1.55) {
        drawPoly3D(ctx, cam, [[3.56, 0.14, cz - 0.58], [3.56, 0.14, cz + 0.58], [3.56, 0.88, cz + 0.58], [3.56, 0.88, cz - 0.58]], '#8F8267', '#4A2C1A', 1.6);
      }
      drawBox3D(ctx, cam, 4.05, 1.02, 6.7, 1.25, 0.12, 8.4, { top: '#C7B8A1', front: '#A3947E', side: '#B8A894', stroke: '#4A3B2C' });
      drawCoconutCoffeeSprite3D(ctx, cam, 3.85, 1.15, 4.4);
      drawEnamelMugCoffeeSprite3D(ctx, cam, 3.85, 1.15, 6.6, st.t);
      drawCroissantPlateSprite3D(ctx, cam, 3.85, 1.15, 8.8);
    });
    for (var bi = 0; bi < st.baristas.length; bi++) {
      (function(b) { pushItem(b.x, b.z, function() { drawHumanTps3D(ctx, cam, b, st.t); }); })(st.baristas[bi]);
    }
    pushItem(st.waiter.x, st.waiter.z, function() { drawHumanTps3D(ctx, cam, st.waiter, st.t); });

    // 2. Dãy Bàn Dài Ngắm Cây Xanh dọc TƯỜNG TRÁI (X = -5.1, Z = 6.0)
    pushItem(-5.1, 6.0, function() {
      drawBox3D(ctx, cam, -5.2, 0.72, 6.0, 0.78, 0.08, 8.0, { top: '#966137', front: '#7C4F2B', side: '#5C341D', stroke: '#2B180E' });
      drawBox3D(ctx, cam, -5.2, 0, 2.4, 0.12, 0.72, 0.12, { top: '#4A2C1A', front: '#3B2314', side: '#2B180E' });
      drawBox3D(ctx, cam, -5.2, 0, 9.6, 0.12, 0.72, 0.12, { top: '#4A2C1A', front: '#3B2314', side: '#2B180E' });
    });

    // 3. Tủ Gỗ Cổ Đựng Đài Cassette & Điện Thoại Quay Số (cuối phòng bên phải cầu thang)
    pushItem(1.2, 13.9, function() {
      drawBox3D(ctx, cam, 1.2, 0, 14.0, 1.35, 1.45, 0.58, { top: '#6B4226', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
      drawBox3D(ctx, cam, 1.2, 0.85, 13.78, 0.42, 0.24, 0.24, { top: '#B91C1C', front: '#991B1B', side: '#7F1D1D' }); // Đài Cassette đỏ
      drawBox3D(ctx, cam, 1.2, 1.45, 13.95, 0.34, 0.22, 0.28, { top: '#FACC15', front: '#CA8A04', side: '#A16207' }); // Điện thoại cổ
    });

    // 4. Bàn Tròn Cổ & Ghế Bành Tay Cong Gối Chăn Con Công + Ghế Cửa Sổ
    for (var ti = 0; ti < st.f1Tables.length; ti++) {
      (function(tb) {
        pushItem(tb.x, tb.z, function() {
          if (tb.kind === 'round') {
            drawBox3D(ctx, cam, tb.x, 0.62, tb.z, 1.05, 0.08, 1.05, { top: '#8C5229', front: '#6B3E1E', side: '#5C341D', stroke: '#2B180E' });
            drawBox3D(ctx, cam, tb.x, 0, tb.z, 0.22, 0.62, 0.22, { top: '#4A2C1A', front: '#3B2314', side: '#2B180E' });
            // Ghế Bành Gỗ Tay Cong có Đệm & Gối Tựa Chăn Con Công Đỏ Rực (1:1 ảnh 2!)
            drawBox3D(ctx, cam, tb.chairX, 0, tb.chairZ, 0.72, 0.40, 0.66, { top: '#5C341D', front: '#4A2C1A', side: '#3B2314', stroke: '#2B180E' });
            drawBox3D(ctx, cam, tb.chairX, 0.40, tb.chairZ, 0.62, 0.10, 0.56, { top: '#DC2626', front: '#B91C1C', side: '#991B1B' });
            drawBox3D(ctx, cam, tb.chairX, 0.48, tb.chairZ - 0.24, 0.56, 0.42, 0.14, { top: '#EF4444', front: '#DC2626', side: '#991B1B' });
          } else {
            drawBox3D(ctx, cam, tb.chairX, 0, tb.chairZ, 0.50, 0.44, 0.50, { top: '#5C341D', front: '#4A2C1A', side: '#3B2314' });
            drawBox3D(ctx, cam, tb.chairX, 0.44, tb.chairZ, 0.44, 0.07, 0.44, { top: '#DC2626', front: '#B91C1C', side: '#991B1B' });
          }
          var ty = tb.kind === 'round' ? 0.71 : 0.81;
          if (tb.hasCoffee) drawCoconutCoffeeSprite3D(ctx, cam, tb.x - 0.16, ty, tb.z);
          if (tb.hasCroissant) drawCroissantPlateSprite3D(ctx, cam, tb.x + 0.18, ty, tb.z + 0.06);
        });
      })(st.f1Tables[ti]);
    }
    for (var ci = 0; ci < st.f1Customers.length; ci++) {
      (function(c) { pushItem(c.x, c.z, function() { drawHumanTps3D(ctx, cam, c, st.t); }); })(st.f1Customers[ci]);
    }
  } else {
    // ---- NỘI THẤT TẦNG 2 (PHÒNG XANH RÊU CỘNG, CỘT BÊ TÔNG, BÀN DÀI CỘNG ĐỒNG & GÓC HEO AI — 1:1 ẢNH 4!) ----
    // 1. Bàn Gỗ Dài Cộng Đồng 6 Ghế Đệm Chăn Con Công (X = -1.6, Z = 6.4)
    pushItem(-1.6, 6.4, function() {
      drawBox3D(ctx, cam, -1.6, 0.70, 6.4, 1.38, 0.09, 3.85, { top: '#9C6B3B', front: '#7C4F2B', side: '#5C341D', stroke: '#2B180E' });
      drawBox3D(ctx, cam, -2.1, 0, 4.8, 0.12, 0.70, 0.12, { top: '#4A2C1A', front: '#3B2314', side: '#2B180E' });
      drawBox3D(ctx, cam, -1.1, 0, 4.8, 0.12, 0.70, 0.12, { top: '#4A2C1A', front: '#3B2314', side: '#2B180E' });
      drawBox3D(ctx, cam, -2.1, 0, 8.0, 0.12, 0.70, 0.12, { top: '#4A2C1A', front: '#3B2314', side: '#2B180E' });
      drawBox3D(ctx, cam, -1.1, 0, 8.0, 0.12, 0.70, 0.12, { top: '#4A2C1A', front: '#3B2314', side: '#2B180E' });
      // 6 Ghế gỗ tựa cao đệm Chăn Con Công 2 bên bàn dài
      var cZs = [5.2, 6.4, 7.6];
      for (var k = 0; k < cZs.length; k++) {
        drawBox3D(ctx, cam, -0.58, 0, cZs[k], 0.48, 0.42, 0.48, { top: '#5C341D', front: '#4A2C1A', side: '#3B2314' });
        drawBox3D(ctx, cam, -0.58, 0.42, cZs[k], 0.44, 0.08, 0.44, { top: '#EF4444', front: '#DC2626', side: '#991B1B' });
        drawBox3D(ctx, cam, -2.62, 0, cZs[k], 0.48, 0.42, 0.48, { top: '#5C341D', front: '#4A2C1A', side: '#3B2314' });
        drawBox3D(ctx, cam, -2.62, 0.42, cZs[k], 0.44, 0.08, 0.44, { top: '#EF4444', front: '#DC2626', side: '#991B1B' });
      }
      drawCoconutCoffeeSprite3D(ctx, cam, -1.45, 0.80, 5.4);
      drawEnamelMugCoffeeSprite3D(ctx, cam, -1.75, 0.80, 6.4, st.t);
      drawCroissantPlateSprite3D(ctx, cam, -1.50, 0.80, 7.4);
    });

    // 2. Cột Bê Tông Thô Nhám + Kệ Khăn Thổ Cẩm Đặt Đài Radio Đỏ + Điện Thoại Quay Số + Đồng Hồ (1:1 ảnh 4!)
    pushItem(2.2, 5.4, function() {
      drawBox3D(ctx, cam, 1.8, 0, 5.4, 0.56, 3.85, 0.56, { top: '#9CA3AF', front: '#B5AC9B', side: '#8F8777', stroke: '#4A463E' });
      // Tủ gỗ trải khăn thổ cẩm đỏ-vàng ngay cạnh cột
      drawBox3D(ctx, cam, 2.75, 0, 5.4, 1.15, 0.78, 0.66, { top: '#DC2626', front: '#7C4F2B', side: '#5C341D', stroke: '#2B180E' });
      // Điện thoại quay số màu đen + Đài Radio màu đỏ + Đồng hồ báo thức vàng!
      drawBox3D(ctx, cam, 2.45, 0.78, 5.4, 0.30, 0.18, 0.24, { top: '#1E293B', front: '#0F172A', side: '#0F172A' });
      drawBox3D(ctx, cam, 2.95, 0.78, 5.4, 0.42, 0.26, 0.22, { top: '#EF4444', front: '#B91C1C', side: '#991B1B' });
      drawBox3D(ctx, cam, 2.95, 1.04, 5.4, 0.18, 0.18, 0.14, { top: '#F59E0B', front: '#D97706', side: '#B45309' });
    });

    // 3. Bàn Bar Cửa Sổ Song Gỗ Dọc Tường Phải (X = +5.1, Z = 5.4)
    pushItem(5.1, 5.4, function() {
      drawBox3D(ctx, cam, 5.2, 0.74, 5.4, 0.76, 0.08, 6.4, { top: '#966137', front: '#7C4F2B', side: '#5C341D', stroke: '#2B180E' });
      drawEnamelMugCoffeeSprite3D(ctx, cam, 5.1, 0.83, 4.6, st.t);
    });

    // 4. Góc Bàn Heo AI Đeo Kính Trên Tầng 2 (X = +3.3, Z = 9.0)
    pushItem(3.3, 9.0, function() {
      drawBox3D(ctx, cam, 3.3, 0.68, 9.0, 1.18, 0.08, 0.96, { top: '#966137', front: '#7C4F2B', side: '#5C341D', stroke: '#2B180E' });
      drawBox3D(ctx, cam, 3.3, 0, 9.0, 0.20, 0.68, 0.20, { top: '#4A2C1A', front: '#3B2314', side: '#2B180E' });
      drawBox3D(ctx, cam, 2.25, 0, 9.0, 0.50, 0.42, 0.50, { top: '#5C341D', front: '#4A2C1A', side: '#3B2314' });
      drawBox3D(ctx, cam, 2.25, 0.42, 9.0, 0.44, 0.08, 0.44, { top: '#EF4444', front: '#DC2626', side: '#991B1B' });
      drawCoconutCoffeeSprite3D(ctx, cam, 3.12, 0.77, 8.95);
      drawCroissantPlateSprite3D(ctx, cam, 3.48, 0.77, 9.05);
    });
    pushItem(st.aiCoachPig.x, st.aiCoachPig.z, function() {
      drawPigTps3D(ctx, cam, st.aiCoachPig, st.t);
      var aiPr = projectPoint3D(cam, st.aiCoachPig.x, 1.35, st.aiCoachPig.z);
      if (aiPr && aiPr.cz > 0.5 && aiPr.cz < 14) {
        ctx.save();
        ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(54,70,39,0.92)'; ctx.fillRect(aiPr.sx - 34, aiPr.sy - 10, 68, 16);
        ctx.strokeStyle = '#F4B93B'; ctx.lineWidth = 1.2; ctx.strokeRect(aiPr.sx - 34, aiPr.sy - 10, 68, 16);
        ctx.fillStyle = '#FDE047'; ctx.fillText('HEO AI ☕', aiPr.sx, aiPr.sy + 2);
        ctx.restore();
      }
    });
    for (var f2i = 0; f2i < st.f2Customers.length; f2i++) {
      (function(c) { pushItem(c.x, c.z, function() { drawHumanTps3D(ctx, cam, c, st.t); }); })(st.f2Customers[f2i]);
    }
  }

  // Chú Heo Mascot 1:1 toàn App
  pushItem(st.pig.x, st.pig.z, function() { drawPigTps3D(ctx, cam, st.pig, st.t); });

  items.sort(function(a, b) { return b.d - a.d; });
  for (var ii = 0; ii < items.length; ii++) items[ii].fn();

  // 8. Lớp phủ ánh sáng vàng mật ong ấm áp + Fade chuyển tầng (200ms) / Fade rời quán (240ms)
  ctx.save();
  ctx.fillStyle = isF2 ? 'rgba(255, 200, 105, 0.11)' : 'rgba(255, 224, 155, 0.06)';
  ctx.fillRect(0, 0, W, H);
  var fAlpha = Math.max(st.exitFade, st.floorFade);
  if (fAlpha > 0.01) {
    ctx.fillStyle = st.floorFade > st.exitFade
      ? 'rgba(30, 38, 22, ' + st.floorFade.toFixed(2) + ')'
      : 'rgba(246, 238, 220, ' + st.exitFade.toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
`;
}
