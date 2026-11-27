/**
 * Quán Cà Phê Việt Nam TPS 3D — Cộng Cà Phê Bao Cấp Ấm Cúng (Quyết định 242)
 * - Kiến trúc Interior-Only chuẩn TPS 3D (12m × 14.8m, trần kín 100%, 0% cảnh ngoài trời, 0% lag).
 * - Tông màu ấm vàng mật ong (#D8B268) – xanh cốm/bộ đội (#5A6E43 / #7D9B56) – gỗ nâu (#4A2C1A) – Chăn Con Công.
 * - 6 bàn gỗ đệm Chăn Con Công, Quầy Bar đá mài với 2 Barista áo xanh lính ngôi sao vàng & mũ vải + 1 Phục vụ,
 *   món tả thực (Cà Phê Cốt Dừa kem tuyết, Ca men sắt xanh lính, Bánh Sừng Bò chấm sữa đặc),
 *   Góc Bàn Heo AI đeo kính (mở thẳng màn Trò chuyện Heo AI) và cửa hé 1 cánh (~35°) đón luồng nắng động.
 */
export function buildCafeTps3dSceneScript(): string {
  return String.raw`
function createCafeTpsState() {
  var tables = [
    { id: 0, x: -3.2, z: 3.4, chairX: -3.2, chairZ: 2.35, hasCoffee: true, hasCroissant: true, occupiedBy: null },
    { id: 1, x:  3.2, z: 3.4, chairX:  3.2, chairZ: 2.35, hasCoffee: true, hasCroissant: false, occupiedBy: 'npc_0' },
    { id: 2, x: -3.2, z: 6.4, chairX: -3.2, chairZ: 5.35, hasCoffee: true, hasCroissant: true, occupiedBy: 'npc_1' },
    { id: 3, x:  3.2, z: 6.4, chairX:  3.2, chairZ: 5.35, hasCoffee: true, hasCroissant: true, occupiedBy: null },
    { id: 4, x: -3.2, z: 9.2, chairX: -3.2, chairZ: 8.15, hasCoffee: true, hasCroissant: false, occupiedBy: null },
    // Bàn Góc Heo AI (X = +3.3, Z = 9.0): Heo AI đeo kính ngồi sẵn chờ chủ nhân!
    { id: 5, x:  3.3, z: 9.0, chairX:  2.25, chairZ: 9.0, hasCoffee: true, hasCroissant: true, occupiedBy: 'ai_coach', isAiTable: true }
  ];

  var customers = [
    { id: 'npc_0', x: 3.2, z: 2.35, yaw: 0, state: 'sitting', tableId: 1, timer: 14, shirt: '#B45309', hair: '#1C1917', seated: true, moving: false, phase: 0.4 },
    { id: 'npc_1', x: -3.2, z: 5.35, yaw: 0, state: 'sitting', tableId: 2, timer: 20, shirt: '#3F6212', hair: '#292524', seated: true, moving: false, phase: 1.5 },
    { id: 'npc_2', x: 0.55, z: 0.28, yaw: 0, state: 'entering', tableId: -1, timer: 2.0, shirt: '#991B1B', hair: '#1E293B', seated: false, moving: true, phase: 2.3 }
  ];

  // 2 Barista áo xanh bộ đội ngôi sao vàng sau Quầy Bar + 1 Phục vụ bưng Cà Phê Cốt Dừa
  var baristas = [
    { x: -1.6, z: 13.0, yaw: Math.PI, role: 'barista', hair: '#1C1917', moving: false, phase: 0.2 },
    { x:  1.6, z: 13.0, yaw: Math.PI, role: 'barista', hair: '#292524', moving: false, phase: 1.8 }
  ];
  var waiter = {
    x: 0.0, z: 10.6, yaw: Math.PI, role: 'cafe_waiter', hair: '#1C1917',
    state: 'idle', targetTable: -1, carryCoffee: false, moving: false, phase: 0.9
  };

  // Heo AI đeo kính (đồng bộ 1:1 sprite chú Heo toàn App) ngồi sẵn tại Bàn 5!
  var aiCoachPig = {
    x: 3.3, z: 9.85, yaw: Math.PI, seated: true, walking: false, eating: false, isAiCoach: true
  };

  var colliders = [
    { x1: -4.4, z1: 11.4, x2: 4.4, z2: 14.3 } // Quầy Bar đá mài
  ];
  for (var i = 0; i < tables.length; i++) {
    var tb = tables[i];
    colliders.push({ x1: tb.x - 0.72, z1: tb.z - 0.58, x2: tb.x + 0.72, z2: tb.z + 0.58 });
  }

  return {
    pig: {
      x: 0, z: 1.05, yaw: 0, targetX: 0, targetZ: 1.85,
      walking: true, seated: false, seatTableId: -1, eating: false,
      drinkReady: false, orderSent: false
    },
    aiCoachPig: aiCoachPig,
    tables: tables,
    customers: customers,
    baristas: baristas,
    waiter: waiter,
    colliders: colliders,
    leftDoorOpen: 0.0,
    rightDoorOpen: 0.0,
    exitFade: 0,
    exiting: false,
    ripples: [],
    toast: 'Chào mừng đến Cà Phê Việt Nam! Chạm sàn để đi · Vuốt xoay 360°',
    toastUntil: 4.5,
    t: 0
  };
}

function clampCafeWalkPos(st, x, z) {
  var nx = Math.max(-5.25, Math.min(5.25, x));
  var nz = Math.max(0.55, Math.min(10.85, z));
  for (var i = 0; i < st.colliders.length; i++) {
    var b = st.colliders[i];
    if (nx > b.x1 - 0.35 && nx < b.x2 + 0.35 && nz > b.z1 - 0.35 && nz < b.z2 + 0.35) {
      var dl = Math.abs(nx - (b.x1 - 0.35)), dr = Math.abs(nx - (b.x2 + 0.35));
      var dt = Math.abs(nz - (b.z1 - 0.35)), db = Math.abs(nz - (b.z2 + 0.35));
      var m = Math.min(dl, dr, dt, db);
      if (m === dl) nx = b.x1 - 0.35;
      else if (m === dr) nx = b.x2 + 0.35;
      else if (m === dt) nz = b.z1 - 0.35;
      else nz = b.z2 + 0.35;
    }
  }
  return { x: nx, z: nz };
}

function stepCafeTps(st, dt) {
  st.t += dt;
  var p = st.pig;

  // 1. Di chuyển chú Heo mượt tới điểm chạm sàn (Tap-to-Walk)
  if (!p.seated && p.walking) {
    var dx = p.targetX - p.x, dz = p.targetZ - p.z;
    var dist = Math.hypot(dx, dz);
    if (dist < 0.08) {
      p.walking = false;
    } else {
      var spd = Math.min(dist, 2.9 * dt);
      var next = clampCafeWalkPos(st, p.x + (dx / dist) * spd, p.z + (dz / dist) * spd);
      p.x = next.x; p.z = next.z;
      p.yaw = Math.atan2(dx, dz);
    }
  }

  // 2. FSM Khách NPC tự mở hé 1 cánh cửa phải (~35°) đi vào/ra & ngồi uống cà phê
  var guestNearDoor = false;
  for (var ci = 0; ci < st.customers.length; ci++) {
    var c = st.customers[ci];
    if (c.z < 1.65 && Math.abs(c.x) < 1.8) guestNearDoor = true;
    if (c.state === 'entering') {
      if (c.tableId < 0) {
        for (var ti = 0; ti < st.tables.length; ti++) {
          if (!st.tables[ti].occupiedBy && !st.tables[ti].isAiTable && p.seatTableId !== ti) {
            c.tableId = ti; st.tables[ti].occupiedBy = c.id; break;
          }
        }
      }
      if (c.tableId >= 0) {
        var tb = st.tables[c.tableId];
        var cdx = tb.chairX - c.x, cdz = tb.chairZ - c.z, cd = Math.hypot(cdx, cdz);
        if (cd < 0.14) {
          c.x = tb.chairX; c.z = tb.chairZ; c.yaw = 0; c.seated = true; c.moving = false;
          c.state = 'sitting'; c.timer = 16 + Math.random() * 12;
        } else {
          var cs = Math.min(cd, 1.85 * dt);
          c.x += (cdx / cd) * cs; c.z += (cdz / cd) * cs; c.yaw = Math.atan2(cdx, cdz); c.moving = true;
        }
      }
    } else if (c.state === 'sitting') {
      c.timer -= dt;
      if (c.timer <= 0) {
        if (c.tableId >= 0) st.tables[c.tableId].occupiedBy = null;
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

  // 3. FSM Phục vụ áo xanh lính bưng Cà Phê Cốt Dừa & Bánh Sừng Bò ra bàn chú Heo
  var w = st.waiter;
  if (w.state === 'delivering' && w.targetTable >= 0) {
    var wtb = st.tables[w.targetTable];
    var wdx = wtb.x - w.x, wdz = (wtb.z + 0.9) - w.z, wd = Math.hypot(wdx, wdz);
    if (wd < 0.25) {
      w.carryCoffee = false; w.moving = false; w.state = 'returning';
      if (p.seated && p.seatTableId === w.targetTable) {
        p.drinkReady = true; p.eating = true;
        wtb.hasCoffee = true; wtb.hasCroissant = true;
        st.toast = 'Cà Phê Cốt Dừa & Bánh Sừng Bò nóng hổi đây! Chúc Heo ngon miệng ☕🥐';
        st.toastUntil = st.t + 4.5;
      }
    } else {
      var ws = Math.min(wd, 2.3 * dt);
      w.x += (wdx / wd) * ws; w.z += (wdz / wd) * ws; w.yaw = Math.atan2(wdx, wdz); w.moving = true;
    }
  } else if (w.state === 'returning') {
    var rdx = 0.0 - w.x, rdz = 10.6 - w.z, rd = Math.hypot(rdx, rdz);
    if (rd < 0.2) { w.state = 'idle'; w.moving = false; w.yaw = Math.PI; }
    else {
      var rs = Math.min(rd, 2.1 * dt);
      w.x += (rdx / rd) * rs; w.z += (rdz / rd) * rs; w.yaw = Math.atan2(rdx, rdz); w.moving = true;
    }
  }

  // 4. Hé duy nhất 1 cánh cửa phải (~35°) khi khách NPC ra/vào hoặc Heo bấm ra cửa (QĐ 239)
  st.leftDoorOpen = 0.0;
  var targetRightOpen = st.exiting ? 0.85 : (guestNearDoor ? 0.62 : 0.0);
  st.rightDoorOpen += (targetRightOpen - st.rightDoorOpen) * Math.min(1, dt * 5.2);

  if (st.exiting) {
    st.exitFade = Math.min(1, st.exitFade + dt * 4.2);
  }
  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== VẼ KHÔNG GIAN QUÁN CÀ PHÊ VIỆT NAM TPS 3D (QĐ 242) ==================== */
function renderCafeTpsScene(ctx, cam, st, W, H) {
  // Nền trần gỗ ấm
  ctx.fillStyle = '#524432';
  ctx.fillRect(0, 0, W, H);

  // 1. Sàn gạch bông Indochine xám-kem cổ điển (12m × 14.8m)
  drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#D8CEB8', '#B7AA91', 1);
  for (var gz = 0; gz < 14.8; gz += 1.85) {
    for (var gx = -6; gx < 6; gx += 2.0) {
      var isAlt = ((Math.round(gx) + Math.round(gz)) % 2 === 0);
      drawPoly3D(ctx, cam, [[gx, 0.004, gz], [gx + 2.0, 0.004, gz], [gx + 2.0, 0.004, gz + 1.85], [gx, 0.004, gz + 1.85]], isAlt ? '#DDD3BE' : '#CFC3AA', '#B5A88F', 0.6);
      if (isAlt) {
        drawPoly3D(ctx, cam, [[gx + 0.85, 0.008, gz + 0.78], [gx + 1.15, 0.008, gz + 0.78], [gx + 1.15, 0.008, gz + 1.08], [gx + 0.85, 0.008, gz + 1.08]], '#4A5D36', null, 0);
      }
    }
  }

  // 2. Trần kín 100% (Y = 3.85) + Xà gồ gỗ nâu & Dải Rèm Vải Xanh Cốm rủ mềm trên trần!
  drawPoly3D(ctx, cam, [[-6, 3.85, 0], [6, 3.85, 0], [6, 3.85, 14.8], [-6, 3.85, 14.8]], '#E8DAB8', '#B89E72', 1);
  for (var bz = 1.6; bz <= 13.6; bz += 2.4) {
    drawPoly3D(ctx, cam, [[-6, 3.74, bz - 0.14], [6, 3.74, bz - 0.14], [6, 3.74, bz + 0.14], [-6, 3.74, bz + 0.14]], '#4A2C1A', '#2B180E', 1);
  }
  // Dải vải xanh cốm/xanh bộ đội buông võng trên trần (1:1 ảnh mẫu Cộng Cà Phê!)
  var swagZs = [2.8, 5.2, 7.6, 10.0];
  for (var si = 0; si < swagZs.length; si++) {
    var sz = swagZs[si];
    drawPoly3D(ctx, cam, [[-4.8, 3.55, sz - 0.42], [4.8, 3.55, sz - 0.42], [4.8, 3.55, sz + 0.42], [-4.8, 3.55, sz + 0.42]], si % 2 === 0 ? '#658044' : '#7D9B56', '#3F5229', 0.9);
  }

  // 3. 4 Bức Tường Vàng Đất Ấm (#D8B268) & Ốp Gỗ Chân Tường Xanh Bộ Đội/Gỗ Nâu
  drawPoly3D(ctx, cam, [[-6, 0, 0], [-6, 0, 14.8], [-6, 3.85, 14.8], [-6, 3.85, 0]], '#D8B268', '#8C6A36', 1);
  drawPoly3D(ctx, cam, [[-5.97, 0, 0], [-5.97, 0, 14.8], [-5.97, 0.96, 14.8], [-5.97, 0.96, 0]], '#4A5D36', '#2B381E', 1);

  drawPoly3D(ctx, cam, [[6, 0, 14.8], [6, 0, 0], [6, 3.85, 0], [6, 3.85, 14.8]], '#D8B268', '#8C6A36', 1);
  drawPoly3D(ctx, cam, [[5.97, 0, 14.8], [5.97, 0, 0], [5.97, 0.96, 0], [5.97, 0.96, 14.8]], '#4A5D36', '#2B381E', 1);

  drawPoly3D(ctx, cam, [[-6, 0, 14.8], [6, 0, 14.8], [6, 3.85, 14.8], [-6, 3.85, 14.8]], '#C9A155', '#8C6A36', 1);
  drawPoly3D(ctx, cam, [[-6, 0, 14.77], [6, 0, 14.77], [6, 0.96, 14.77], [-6, 0.96, 14.77]], '#3B4D2B', '#26331B', 1);

  // Tường mặt tiền phía sau lưng chú Heo (Z = 0) với khung cửa xanh lính
  drawPoly3D(ctx, cam, [[-6, 0, 0], [-1.35, 0, 0], [-1.35, 3.85, 0], [-6, 3.85, 0]], '#D8B268', '#8C6A36', 1);
  drawPoly3D(ctx, cam, [[1.35, 0, 0], [6, 0, 0], [6, 3.85, 0], [1.35, 3.85, 0]], '#D8B268', '#8C6A36', 1);
  drawPoly3D(ctx, cam, [[-1.35, 2.72, 0], [1.35, 2.72, 0], [1.35, 3.85, 0], [-1.35, 3.85, 0]], '#3B4D2B', '#26331B', 1);

  // Luồng ánh sáng ngược sáng trắng-vàng rực sau khe cửa khi cánh phải hé mở (~35°)
  drawPoly3D(ctx, cam, [[-1.35, 0, -0.04], [1.35, 0, -0.04], [1.35, 2.72, -0.04], [-1.35, 2.72, -0.04]], '#FFFDF0', '#FDE68A', 0.8);
  if (st.rightDoorOpen > 0.04) {
    var bSpread = 1.4 + st.rightDoorOpen * 2.5;
    drawPoly3D(ctx, cam, [[0.02, 0.014, 0.05], [1.32, 0.014, 0.05], [1.32 + bSpread * 0.45, 0.014, 0.05 + bSpread], [-0.15, 0.014, 0.05 + bSpread]], 'rgba(255,250,220,' + (0.28 + st.rightDoorOpen * 0.25).toFixed(2) + ')', null, 0);
  }

  // 2 Cánh Cửa Gỗ Xanh Bộ Đội Kính Mờ (Cánh trái luôn đóng kín 0°, cánh phải hé ~35° khi khách ra/vào)
  var rAng = st.rightDoorOpen * 0.92;
  drawPoly3D(ctx, cam, [[-1.35, 0, 0.02], [-0.02, 0, 0.02], [-0.02, 2.70, 0.02], [-1.35, 2.70, 0.02]], '#3B4D2B', '#1E2916', 1.6);
  drawPoly3D(ctx, cam, [[-1.18, 1.08, 0.03], [-0.18, 1.08, 0.03], [-0.18, 2.52, 0.03], [-1.18, 2.52, 0.03]], 'rgba(255,248,225,0.72)', '#D9B45A', 1);
  var rx1 = 1.35 - Math.cos(rAng) * 1.33, rz1 = 0.02 + Math.sin(rAng) * 1.33;
  drawPoly3D(ctx, cam, [[1.35, 0, 0.02], [rx1, 0, rz1], [rx1, 2.70, rz1], [1.35, 2.70, 0.02]], '#3B4D2B', '#1E2916', 1.6);

  // Thảm chùi chân & 2 chậu cây xanh nhiệt đới 2 bên cửa vào
  drawPoly3D(ctx, cam, [[-1.05, 0.012, 0.12], [1.05, 0.012, 0.12], [1.05, 0.012, 0.72], [-1.05, 0.012, 0.72]], '#7F1D1D', '#F4B93B', 1);
  drawBox3D(ctx, cam, -2.15, 0, 0.35, 0.55, 0.45, 0.55, ['#8C4A27', '#A65E34', '#6E371B']);
  drawBox3D(ctx, cam, -2.25, 0.45, 0.25, 0.75, 0.75, 0.75, ['#3F6212', '#4D7C0F', '#365314']);
  drawBox3D(ctx, cam, 1.60, 0, 0.35, 0.55, 0.45, 0.55, ['#8C4A27', '#A65E34', '#6E371B']);
  drawBox3D(ctx, cam, 1.50, 0.45, 0.25, 0.75, 0.75, 0.75, ['#3F6212', '#4D7C0F', '#365314']);

  // 4. Mỹ thuật 3 Mặt Tường Văn Hóa Việt Nam & Cộng Cà Phê Bao Cấp (cafeVnWallArt.ts)
  if (typeof drawCafeVnCultureWalls3D === 'function') {
    drawCafeVnCultureWalls3D(ctx, cam);
  }

  // 5. Quạt Trần Vintage 3 Cánh & 6 Đèn Thả Ánh Vàng Mật Ong
  drawCeilingFan3D(ctx, cam, 0, 3.25, 4.4, st.t, 0.4);
  drawCeilingFan3D(ctx, cam, 0, 3.25, 8.8, st.t, 1.9);
  var lampPos = [[-3.2, 3.4], [3.2, 3.4], [-3.2, 6.4], [3.2, 6.4], [-2.2, 11.4], [2.2, 11.4]];
  for (var li = 0; li < lampPos.length; li++) {
    drawVintageLamp3D(ctx, cam, lampPos[li][0], 2.85, lampPos[li][1], 3.85);
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

  // 7. Vẽ toàn bộ vật thể & nhân vật theo Painter's Algorithm (Z-Sort theo khoảng cách camera!)
  var items = [];
  function pushItem(wx, wz, fn) {
    var d = Math.hypot(wx - cam.pos.x, wz - cam.pos.z);
    items.push({ d: d, fn: fn });
  }

  // Quầy Bar Đá Mài (Z = 11.6..12.5) + 2 Barista áo xanh lính ngôi sao vàng
  pushItem(0, 12.0, function() {
    drawBox3D(ctx, cam, -4.2, 0, 11.6, 8.4, 1.02, 0.85, ['#4A5D36', '#5A6E43', '#364627']);
    drawBox3D(ctx, cam, -4.3, 1.02, 11.52, 8.6, 0.12, 1.0, ['#C7B8A1', '#DDD0BC', '#A3947E']); // Mặt đá mài terrazzo
    drawCoconutCoffeeSprite3D(ctx, cam, -2.5, 1.15, 11.95);
    drawEnamelMugCoffeeSprite3D(ctx, cam, 0.0, 1.15, 11.95, st.t);
    drawCroissantPlateSprite3D(ctx, cam, 2.4, 1.15, 11.95);
  });
  for (var bi = 0; bi < st.baristas.length; bi++) {
    (function(b) { pushItem(b.x, b.z, function() { drawHumanTps3D(ctx, cam, b, st.t); }); })(st.baristas[bi]);
  }
  pushItem(st.waiter.x, st.waiter.z, function() { drawHumanTps3D(ctx, cam, st.waiter, st.t); });

  // 6 Bàn Gỗ Mộc + Ghế Đệm Chăn Con Công Đỏ-Xanh + Sprite Cà Phê Cốt Dừa / Ca Men / Croissant
  for (var ti = 0; ti < st.tables.length; ti++) {
    (function(tb) {
      pushItem(tb.x, tb.z, function() {
        // Mặt bàn gỗ nâu & 4 chân
        drawBox3D(ctx, cam, tb.x - 0.62, 0.68, tb.z - 0.48, 1.24, 0.08, 0.96, ['#7C4F2B', '#966137', '#5C341D']);
        drawBox3D(ctx, cam, tb.x - 0.56, 0, tb.z - 0.42, 0.10, 0.68, 0.10, ['#4A2C1A', '#5C341D', '#2B180E']);
        drawBox3D(ctx, cam, tb.x + 0.46, 0, tb.z - 0.42, 0.10, 0.68, 0.10, ['#4A2C1A', '#5C341D', '#2B180E']);
        drawBox3D(ctx, cam, tb.x - 0.56, 0, tb.z + 0.32, 0.10, 0.68, 0.10, ['#4A2C1A', '#5C341D', '#2B180E']);
        drawBox3D(ctx, cam, tb.x + 0.46, 0, tb.z + 0.32, 0.10, 0.68, 0.10, ['#4A2C1A', '#5C341D', '#2B180E']);
        // Ghế gỗ + Đệm Chăn Con Công Đỏ-Vàng-Xanh rực rỡ!
        drawBox3D(ctx, cam, tb.chairX - 0.28, 0, tb.chairZ - 0.26, 0.56, 0.42, 0.52, ['#5C341D', '#6E3F24', '#3B2314']);
        drawBox3D(ctx, cam, tb.chairX - 0.25, 0.42, tb.chairZ - 0.23, 0.50, 0.08, 0.46, ['#DC2626', '#EF4444', '#991B1B']);
        // Đồ uống & bánh trên mặt bàn
        if (tb.hasCoffee) {
          drawCoconutCoffeeSprite3D(ctx, cam, tb.x - 0.24, 0.77, tb.z - 0.08);
          drawEnamelMugCoffeeSprite3D(ctx, cam, tb.x + 0.26, 0.77, tb.z + 0.12, st.t);
        }
        if (tb.hasCroissant) {
          drawCroissantPlateSprite3D(ctx, cam, tb.x + 0.04, 0.77, tb.z - 0.16);
        }
      });
    })(st.tables[ti]);
  }

  // Heo AI đeo kính ngồi sẵn ở Góc Bàn Heo AI (1:1 sprite chú Heo toàn App)
  pushItem(st.aiCoachPig.x, st.aiCoachPig.z, function() {
    drawPigTps3D(ctx, cam, st.aiCoachPig, st.t);
    var aiPr = projectPoint3D(cam, st.aiCoachPig.x, 1.35, st.aiCoachPig.z);
    if (aiPr && aiPr.cz > 0.5 && aiPr.cz < 14) {
      ctx.save();
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(54,70,39,0.92)';
      ctx.fillRect(aiPr.sx - 32, aiPr.sy - 10, 64, 16);
      ctx.strokeStyle = '#F4B93B'; ctx.lineWidth = 1.2;
      ctx.strokeRect(aiPr.sx - 32, aiPr.sy - 10, 64, 16);
      ctx.fillStyle = '#FDE047';
      ctx.fillText('HEO AI ☕', aiPr.sx, aiPr.sy + 2);
      ctx.restore();
    }
  });

  // Khách hàng NPC & Chú Heo Mascot
  for (var ci = 0; ci < st.customers.length; ci++) {
    (function(c) { pushItem(c.x, c.z, function() { drawHumanTps3D(ctx, cam, c, st.t); }); })(st.customers[ci]);
  }
  pushItem(st.pig.x, st.pig.z, function() { drawPigTps3D(ctx, cam, st.pig, st.t); });

  items.sort(function(a, b) { return b.d - a.d; });
  for (var ii = 0; ii < items.length; ii++) items[ii].fn();

  // 8. Lớp phủ ánh sáng vàng ấm bao cấp + Fade-Out 240ms khi rời quán
  ctx.save();
  ctx.fillStyle = 'rgba(255, 214, 130, 0.08)';
  ctx.fillRect(0, 0, W, H);
  if (st.exitFade > 0.01) {
    ctx.fillStyle = 'rgba(246, 238, 220, ' + st.exitFade.toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
`;
}
