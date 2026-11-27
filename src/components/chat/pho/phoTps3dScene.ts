/**
 * Quán Phở Vintage 90s — TPS 3D Interior-Only Ấm Cúng (Quyết định 236)
 * Tuân thủ 100% docs/TPS_3D_OPEN_WORLD_SPEC.md (Interior-Only Standard):
 * - Loại bỏ hoàn toàn mặt tiền & bối cảnh ngoài trời -> giảm 50% đa giác, siêu mượt 60fps, 0% hở trời xanh!
 * - Mở màn ngay tại ngưỡng cửa 2 cánh đang mở hướng thẳng vào Sảnh Phở & Bếp Lửa (bỏ bình phong chắn giữa).
 * - Không gian Vintage thập niên 90 ấm cúng: 2 quạt trần 3 cánh quay 60fps, 6 đèn thả chụp men ánh vàng 90s,
 *   ốp gỗ chân tường, tranh ảnh Sài Gòn xưa & ánh sáng vàng mật ong dịu mắt.
 * - Đội ngũ Bếp 3 người (Bếp trưởng múc nước dùng, Phụ bếp thái thịt bò tươi sống, Phụ bếp trụng bánh phở)
 *   + 2 Nhân viên phục vụ mặc tạp dề đẹp mắt + 6 khách ra vào thực tế 100%.
 * - Mỗi bàn gỗ lim bày trọn bộ Sprite tả thực: Tô Phở thịt bò tươi có cả đũa tre & muỗng sứ,
 *   ống đũa muỗng đầy đủ, ấm trà Bát Tràng, rổ tương ớt/giấm tỏi, đĩa rau giá & quẩy nóng!
 */
export function buildPhoTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. KHỞI TẠO NỘI THẤT QUÁN PHỞ VINTAGE 90S (INTERIOR-ONLY 12m × 15m) ==================== */
function createPhoTpsWorld() {
  var tables = [];
  var tid = 0;
  // 6 Bàn gỗ lim cổ truyền (3 dãy trái X=-3.4, 3 dãy phải X=+3.4), lối giữa mở thông thoáng nhìn thẳng vào Bếp!
  var mainZs = [2.4, 5.4, 8.4];
  for (var ri = 0; ri < mainZs.length; ri++) {
    var zt = mainZs[ri];
    var xs = [-3.4, 3.4];
    for (var ci = 0; ci < 2; ci++) {
      var xt = xs[ci];
      tables.push({
        id: tid++, x: xt, z: zt,
        seats: [
          { x: xt, z: zt - 0.96, yaw: 0, occupant: null, bowl: 'none' },
          { x: xt, z: zt + 0.96, yaw: Math.PI, occupant: null, bowl: 'none' }
        ]
      });
    }
  }

  // 2 Nhân viên phục vụ mặc áo kem 90s + tạp dề đỏ đô dây đeo cổ đẹp mắt
  var waiters = [
    { id: 0, x: -1.2, z: 9.2, yaw: Math.PI, role: 'waiter', shirt: '#FFF8E6', hair: '#2B2118', moving: false, carryBowl: null, task: null, phase: 0.2 },
    { id: 1, x: 1.4,  z: 9.2, yaw: Math.PI, role: 'waiter', shirt: '#FFF8E6', hair: '#3B2314', moving: false, carryBowl: null, task: null, phase: 1.7 }
  ];

  // Đội ngũ Bếp 3 người sống động: Bếp trưởng múc nước dùng, Phụ bếp thái thịt bò tươi, Phụ bếp trụng phở!
  var chefs = [
    { id: 'chef_head',    x: -1.6, baseX: -1.6, z: 12.2, yaw: Math.PI, role: 'chef',         shirt: '#FFFFFF', hair: '#1E293B', moving: false, phase: 0.0 },
    { id: 'chef_butcher', x: -4.1, baseX: -4.1, z: 12.1, yaw: Math.PI, role: 'chef_butcher', shirt: '#FFFDF7', hair: '#2B2118', moving: false, phase: 1.3 },
    { id: 'chef_noodle',  x: 0.4,  baseX: 0.4,  z: 12.1, yaw: Math.PI, role: 'chef_noodle',  shirt: '#FFFDF7', hair: '#3B2314', moving: false, phase: 2.4 }
  ];

  // 6 Khách hàng NPC ra vào cửa & ăn Phở thực tế 100%
  var shirtCols = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#0EA5E9'];
  var hairCols = ['#2B2118', '#3B2314', '#1E293B', '#4A3222'];
  var customers = [];
  for (var k = 0; k < 6; k++) {
    var tIdx = k % 6;
    var sIdx = k % 2;
    var seat = tables[tIdx].seats[sIdx];
    if (k < 4 && !seat.occupant) {
      seat.occupant = 'npc_' + k;
      seat.bowl = (k % 2 === 0) ? 'full' : 'none';
      customers.push({
        id: 'npc_' + k, role: 'customer',
        shirt: shirtCols[k % shirtCols.length], hair: hairCols[k % hairCols.length],
        x: seat.x, z: seat.z, yaw: seat.yaw,
        seated: true, moving: false, phase: k * 0.9,
        state: (k % 2 === 0) ? 'EATING' : 'WAITING_FOOD',
        timer: 6 + k * 2.5, tableId: tIdx, seatIdx: sIdx
      });
    } else {
      customers.push({
        id: 'npc_' + k, role: 'customer',
        shirt: shirtCols[k % shirtCols.length], hair: hairCols[k % hairCols.length],
        x: 0, z: 0.4, yaw: 0,
        seated: false, moving: false, phase: k * 1.1,
        state: 'DOOR_WAIT', timer: 3 + k * 1.8, tableId: -1, seatIdx: -1
      });
    }
  }

  return {
    t: 0,
    leftDoorOpen: 0.0,   // Cánh trái luôn đóng kín cổ điển
    rightDoorOpen: 0.0,  // Cánh phải hé mở nhỏ (~35°) khi khách NPC ra/vào hoặc Heo ra cửa (QĐ 239!)
    rightDoorTarget: 0.0,
    exiting: false,
    exitFade: 0,
    pig: {
      x: 0, z: 1.75, tx: 0, tz: 1.75,
      yaw: 0, walking: false,
      seated: false, seatRef: null,
      eating: false, eatTimer: 0,
      orderState: 'none'
    },
    targetMarker: null,
    tables: tables,
    waiters: waiters,
    chefs: chefs,
    customers: customers,
    toastText: 'Chào mừng đến Phở Vintage 90s! Chạm sàn để đi · Vuốt xoay 360°'
  };
}

function moveTowards2D(ent, tx, tz, speed, dt) {
  var dx = tx - ent.x, dz = tz - ent.z;
  var dist = Math.hypot(dx, dz);
  if (dist < 0.1) {
    ent.x = tx; ent.z = tz;
    ent.moving = false;
    return true;
  }
  var step = Math.min(dist, speed * dt);
  ent.x += (dx / dist) * step;
  ent.z += (dz / dist) * step;
  ent.yaw = Math.atan2(dx, dz);
  ent.moving = true;
  return false;
}

function clampPigWorldPos(w, nx, nz) {
  // Đệm va chạm an toàn 0.65m trong lòng quán (Interior-Only: Z ∈ [0.7, 14.1], X ∈ [-5.25, +5.25])
  nx = Math.max(-5.25, Math.min(5.25, nx));
  nz = Math.max(0.7, Math.min(14.1, nz));
  var oldZ = w.pig.z;
  // Quầy kính & 2 nồi phở (X: -5.8 .. +1.65, Z: 9.85 .. 11.55): lối mở rộng bên phải X > +1.8 để vào Bếp!
  if (nx < 1.8 && nz > 9.85 && nz < 11.6) {
    if (oldZ <= 10.0) nz = 9.85;
    else if (oldZ >= 11.45) nz = 11.6;
    else nx = 1.8;
  }
  return { x: nx, z: nz };
}

function stepPhoTpsWorld(w, dt) {
  w.t += dt;

  // Chỉ hé mở duy nhất 1 cánh cửa phải (~35°) khi có khách NPC ra/vào sát cửa hoặc khi Heo ra cửa -> không xuyên gỗ! (QĐ 239)
  var npcNearDoor = false;
  for (var nci = 0; nci < w.customers.length; nci++) {
    var ncu = w.customers[nci];
    if (ncu.state !== 'DOOR_WAIT' && ncu.z < 1.65 && Math.abs(ncu.x - 0.55) < 1.35) {
      npcNearDoor = true;
      break;
    }
  }
  if (w.exiting) {
    w.rightDoorTarget = 0.72;
    w.exitFade = Math.min(1, w.exitFade + dt * 4.2);
  } else if (npcNearDoor) {
    w.rightDoorTarget = 0.62; // ~35 độ vừa đủ 1 người lách qua & hắt 1 luồng ánh sáng rực vào sàn!
  } else {
    w.rightDoorTarget = 0.0;
  }
  w.rightDoorOpen += (w.rightDoorTarget - w.rightDoorOpen) * Math.min(1, dt * 6.5);

  // Di chuyển Chú Heo Mascot
  var p = w.pig;
  if (p.eating) {
    p.eatTimer -= dt;
    if (p.eatTimer <= 0) {
      p.eating = false;
      p.orderState = 'done';
      if (p.seatRef) p.seatRef.seat.bowl = 'empty';
      w.toastText = 'Heo ăn sạch tô Phở thịt bò tươi thơm lừng! Bấm Đứng dậy để vào Bếp xem 3 Đầu bếp nấu!';
    }
  } else if (!p.seated && p.walking) {
    var dx = p.tx - p.x, dz = p.tz - p.z;
    var dist = Math.hypot(dx, dz);
    if (dist < 0.12) {
      p.walking = false;
    } else {
      var step = Math.min(dist, 3.8 * dt);
      var next = clampPigWorldPos(w, p.x + (dx / dist) * step, p.z + (dz / dist) * step);
      p.x = next.x; p.z = next.z;
      p.yaw = Math.atan2(dx, dz);
    }
  }
  if (w.targetMarker) {
    w.targetMarker.ttl -= dt;
    if (w.targetMarker.ttl <= 0) w.targetMarker = null;
  }

  // 3 Nhân viên Bếp chuyển động sống động theo từng vị trí (múc nước dùng / thái thịt / trụng phở)
  for (var chi = 0; chi < w.chefs.length; chi++) {
    var ch = w.chefs[chi];
    ch.x = ch.baseX + Math.sin(w.t * (0.8 + chi * 0.25) + ch.phase) * 0.45;
    ch.moving = Math.abs(Math.cos(w.t * (0.8 + chi * 0.25) + ch.phase)) > 0.4;
  }

  // FSM Khách hàng NPC ra vào cửa & ăn Phở thực tế 100%
  for (var i = 0; i < w.customers.length; i++) {
    var c = w.customers[i];
    if (c.state === 'DOOR_WAIT') {
      c.timer -= dt;
      if (c.timer <= 0) {
        var freeSeat = null;
        for (var ti = 0; ti < 6 && !freeSeat; ti++) {
          for (var si = 0; si < 2; si++) {
            if (!w.tables[ti].seats[si].occupant && w.tables[ti].seats[si].bowl === 'none') {
              freeSeat = { tId: ti, sId: si, seat: w.tables[ti].seats[si] };
              break;
            }
          }
        }
        if (freeSeat) {
          freeSeat.seat.occupant = c.id;
          c.tableId = freeSeat.tId; c.seatIdx = freeSeat.sId;
          c.x = 0.55; c.z = 0.28; // Lách đúng qua khe cánh cửa phải đang hé mở!
          c.state = 'WALK_TO_SEAT';
        } else c.timer = 3;
      }
    } else if (c.state === 'WALK_TO_SEAT') {
      var st = w.tables[c.tableId].seats[c.seatIdx];
      if (moveTowards2D(c, st.x, st.z, 2.3, dt)) {
        c.seated = true; c.yaw = st.yaw; c.state = 'WAITING_FOOD';
      }
    } else if (c.state === 'EATING') {
      c.timer -= dt;
      if (c.timer <= 0) {
        var stDone = w.tables[c.tableId].seats[c.seatIdx];
        stDone.bowl = 'empty'; stDone.occupant = null;
        c.seated = false; c.state = 'LEAVE_TO_DOOR';
      }
    } else if (c.state === 'LEAVE_TO_DOOR') {
      if (moveTowards2D(c, 0.55, 0.28, 2.3, dt)) {
        c.state = 'DOOR_WAIT';
        c.timer = 4.5 + Math.random() * 5;
      }
    }
  }

  // FSM 2 Nhân viên phục vụ tạp dề (Ưu tiên bưng Phở cho Chú Heo -> Khách chờ -> Dọn tô rỗng)
  for (var wi = 0; wi < w.waiters.length; wi++) {
    var wt = w.waiters[wi];
    if (!wt.task) {
      if (p.seated && p.orderState === 'ordered' && p.seatRef) {
        var assigned = false;
        for (var ow = 0; ow < w.waiters.length; ow++) {
          if (w.waiters[ow].task && w.waiters[ow].task.forPig) assigned = true;
        }
        if (!assigned) {
          wt.task = { type: 'PIG_ORDER', forPig: true, phase: 'TO_PIG', table: p.seatRef.table, seat: p.seatRef.seat };
        }
      }
      if (!wt.task) {
        for (var ci2 = 0; ci2 < w.customers.length; ci2++) {
          var cu2 = w.customers[ci2];
          if (cu2.state === 'WAITING_FOOD') {
            var taken = false;
            for (var ow2 = 0; ow2 < w.waiters.length; ow2++) {
              if (w.waiters[ow2].task && w.waiters[ow2].task.custId === cu2.id) taken = true;
            }
            if (!taken) {
              wt.task = { type: 'SERVE_NPC', custId: cu2.id, cust: cu2, phase: 'TO_KITCHEN', table: w.tables[cu2.tableId], seat: w.tables[cu2.tableId].seats[cu2.seatIdx] };
              break;
            }
          }
        }
      }
      if (!wt.task) {
        for (var ti3 = 0; ti3 < w.tables.length && !wt.task; ti3++) {
          for (var si3 = 0; si3 < 2; si3++) {
            var se3 = w.tables[ti3].seats[si3];
            if (se3.bowl === 'empty' && !se3.occupant) {
              var taken3 = false;
              for (var ow3 = 0; ow3 < w.waiters.length; ow3++) {
                if (w.waiters[ow3].task && w.waiters[ow3].task.seat === se3) taken3 = true;
              }
              if (!taken3) {
                wt.task = { type: 'CLEAR', phase: 'TO_TABLE', table: w.tables[ti3], seat: se3 };
                break;
              }
            }
          }
        }
      }
      if (!wt.task) moveTowards2D(wt, wi === 0 ? -1.2 : 1.4, 9.2, 2.0, dt);
    } else {
      var tk = wt.task;
      var appX = tk.table.x > 0 ? tk.table.x - 1.3 : tk.table.x + 1.3;
      if (tk.type === 'PIG_ORDER') {
        if (tk.phase === 'TO_PIG') {
          if (moveTowards2D(wt, appX, tk.seat.z, 3.0, dt)) {
            w.toastText = 'Nhân viên: "Dạ 1 Phở Tái Nạm bò tươi + quẩy nóng cho chú Heo ngay ạ!"';
            tk.phase = 'TO_KITCHEN';
          }
        } else if (tk.phase === 'TO_KITCHEN') {
          if (moveTowards2D(wt, -0.8, 9.6, 3.1, dt)) { wt.carryBowl = 'full'; tk.phase = 'DELIVER_PIG'; }
        } else if (tk.phase === 'DELIVER_PIG') {
          if (moveTowards2D(wt, appX, tk.seat.z, 3.0, dt)) {
            wt.carryBowl = null; tk.seat.bowl = 'full'; p.orderState = 'served';
            w.toastText = 'Tô Phở bò tươi đầy đủ đũa muỗng đã ra tận bàn! Bấm Ăn Phở thôi!';
            wt.task = null;
          }
        }
      } else if (tk.type === 'SERVE_NPC') {
        if (tk.phase === 'TO_KITCHEN') {
          if (moveTowards2D(wt, -1.2, 9.6, 2.7, dt)) { wt.carryBowl = 'full'; tk.phase = 'TO_TABLE'; }
        } else if (tk.phase === 'TO_TABLE') {
          if (moveTowards2D(wt, appX, tk.seat.z, 2.7, dt)) {
            wt.carryBowl = null; tk.seat.bowl = 'full';
            tk.cust.state = 'EATING'; tk.cust.timer = 9 + Math.random() * 5;
            wt.task = null;
          }
        }
      } else if (tk.type === 'CLEAR') {
        if (tk.phase === 'TO_TABLE') {
          if (moveTowards2D(wt, appX, tk.seat.z, 2.6, dt)) { tk.seat.bowl = 'none'; wt.carryBowl = 'empty'; tk.phase = 'TO_SINK'; }
        } else if (tk.phase === 'TO_SINK') {
          if (moveTowards2D(wt, 3.6, 13.0, 2.6, dt)) { wt.carryBowl = null; wt.task = null; }
        }
      }
    }
  }
}

/* ==================== 2. TƯƠNG TÁC NGỮ CẢNH THÔNG MINH ==================== */
function getPhoContextAction(w) {
  var p = w.pig;
  if (p.seated) {
    if (p.orderState === 'none') return { id: 'order_pho', label: '🍜 Gọi Phở Tái Nạm Đặc Biệt', secondary: { id: 'stand_up', label: 'Đứng dậy' } };
    if (p.orderState === 'ordered') return { id: 'waiting_pho', label: '⏳ Phục vụ đang lấy Phở...', secondary: { id: 'stand_up', label: 'Đứng dậy' } };
    if (p.orderState === 'served') return { id: 'eat_pho', label: '🥢 Ăn Phở & Quẩy Nóng!', secondary: { id: 'stand_up', label: 'Đứng dậy' } };
    if (p.orderState === 'eating') return { id: 'eating_now', label: '😋 Heo đang xì xụp Phở...', secondary: null };
    return { id: 'stand_up', label: '🐷 Đứng dậy đi khám phá', secondary: null };
  }
  if (p.z > 10.2) {
    return { id: 'watch_chef', label: '👨‍🍳 Xem 3 Đầu bếp nấu Phở & thái thịt', secondary: null };
  }
  var bestSeat = null, bestD = 1.75;
  for (var ti = 0; ti < w.tables.length; ti++) {
    var tb = w.tables[ti];
    for (var si = 0; si < 2; si++) {
      var se = tb.seats[si];
      if (!se.occupant) {
        var d = Math.hypot(p.x - se.x, p.z - se.z);
        if (d < bestD) { bestD = d; bestSeat = { table: tb, seat: se }; }
      }
    }
  }
  if (bestSeat) return { id: 'sit_seat', label: '🪑 Ngồi xuống bàn gỗ lim', seatRef: bestSeat, secondary: null };
  if (Math.abs(p.x) < 1.8 && p.z < 1.45) {
    return { id: 'exit_pho', label: '🚪 Ra lại Đại Lộ Sài Gòn', secondary: null };
  }
  return null;
}

function triggerPhoAction(w, actionId, seatRef) {
  var p = w.pig;
  if (actionId === 'sit_seat' && seatRef) {
    p.seated = true; p.walking = false;
    p.seatRef = seatRef; seatRef.seat.occupant = 'PIG';
    p.x = seatRef.seat.x; p.z = seatRef.seat.z; p.yaw = seatRef.seat.yaw;
    p.orderState = seatRef.seat.bowl === 'full' ? 'served' : 'none';
    w.toastText = 'Heo đã ngồi yên vị! Bấm Gọi Phở để nhân viên tạp dề phục vụ ngay nhé!';
  } else if (actionId === 'order_pho') {
    p.orderState = 'ordered';
    w.toastText = 'Heo gọi 1 Phở Tái Nạm bò tươi! Nhân viên phục vụ đang chạy tới bàn...';
  } else if (actionId === 'eat_pho') {
    p.orderState = 'eating'; p.eating = true; p.eatTimer = 4.5;
    w.toastText = 'Xì xụp! Nước dùng ninh xương, thịt bò tươi mềm & quẩy giòn rụm!';
  } else if (actionId === 'stand_up') {
    if (p.seatRef) {
      p.seatRef.seat.occupant = null;
      p.x = p.seatRef.table.x > 0 ? p.seatRef.table.x - 1.45 : p.seatRef.table.x + 1.45;
    }
    p.seated = false; p.eating = false; p.seatRef = null; p.orderState = 'none';
    w.toastText = 'Heo đứng dậy! Chạm lối bên phải quầy để vào thẳng Bếp xem 3 Đầu bếp nấu nhé!';
  } else if (actionId === 'watch_chef') {
    w.toastText = 'Bếp trưởng: "3 anh em nhà bếp thái bò tươi, trụng phở, ninh xương 14 tiếng chuẩn vị 90s!"';
  }
}

/* ==================== 3. VẼ NỘI THẤT QUÁN PHỞ VINTAGE 90S (100% INTERIOR-ONLY, 0% TRỜI XANH!) ==================== */
function drawPhoTableIngredients3D(ctx, cam, tb, t) {
  var tx = tb.x, tz = tb.z;
  drawBox3D(ctx, cam, tx, 0.70, tz, 1.68, 0.11, 1.08, { top: '#5C341D', front: '#3F2212', side: '#31190C' });
  drawBox3D(ctx, cam, tx - 0.70, 0, tz - 0.42, 0.10, 0.70, 0.10, { top: '#4A2816', front: '#3B1E10', side: '#2B150A' });
  drawBox3D(ctx, cam, tx + 0.70, 0, tz - 0.42, 0.10, 0.70, 0.10, { top: '#4A2816', front: '#3B1E10', side: '#2B150A' });
  drawBox3D(ctx, cam, tx - 0.70, 0, tz + 0.42, 0.10, 0.70, 0.10, { top: '#4A2816', front: '#3B1E10', side: '#2B150A' });
  drawBox3D(ctx, cam, tx + 0.70, 0, tz + 0.42, 0.10, 0.70, 0.10, { top: '#4A2816', front: '#3B1E10', side: '#2B150A' });

  drawBatTrangTeapotSprite3D(ctx, cam, tx + 0.46, 0.82, tz - 0.08);
  drawCondimentCaddySprite3D(ctx, cam, tx - 0.54, 0.82, tz);
  drawQuayAndHerbsSprite3D(ctx, cam, tx + 0.16, 0.82, tz + 0.24);
  for (var bi = 0; bi < 2; bi++) {
    var bState = tb.seats[bi].bowl;
    if (bState !== 'none') {
      var bz = tz + (bi === 0 ? -0.30 : 0.30);
      drawPhoBowlSprite3D(ctx, cam, tx - 0.14, 0.82, bz, bState, t, bi * 0.5);
    }
  }
}

function drawHeritageChair3D(ctx, cam, se) {
  drawBox3D(ctx, cam, se.x, 0, se.z, 0.54, 0.46, 0.54, { top: '#6B7A4A', front: '#4A2C1A', side: '#3B2314' });
  var backZ = se.z + (se.yaw === 0 ? -0.23 : 0.23);
  drawBox3D(ctx, cam, se.x, 0.46, backZ, 0.54, 0.50, 0.08, { top: '#5C341D', front: '#4A2C1A', side: '#3B2314' });
}

function renderPhoTps3D(ctx, cam, w) {
  var vw = cam.vw, vh = cam.vh;

  // 1. NỀN NỘI THẤT VINTAGE 90S KÍN 100% — TUYỆT ĐỐI 0% TRỜI XANH Ở MỌI GÓC XOAY 360°!
  ctx.fillStyle = '#E8D3A8';
  ctx.fillRect(0, 0, vw, Math.round(vh * 0.55));
  ctx.fillStyle = '#8C7456';
  ctx.fillRect(0, Math.round(vh * 0.55), vw, vh);

  // 2. SÀN GẠCH BÔNG INDOCHINE 90S PHỐI CẢNH 3D (Z: 0..14.8, X: -6..+6)
  for (var gz = 0.0; gz < 14.8; gz += 1.65) {
    for (var gx = -6.0; gx < 6.0; gx += 1.65) {
      var isKitchen = gz >= 10.0;
      var chk = ((Math.floor(gx + 20) + Math.floor(gz + 20)) % 2 === 0);
      var col = isKitchen ? (chk ? '#CBD5E1' : '#DCE4EE') : (chk ? '#F4E6C8' : '#E0CCA6');
      drawPoly3D(ctx, cam, [[gx,0,gz],[gx+1.65,0,gz],[gx+1.65,0,gz+1.65],[gx,0,gz+1.65]], col, 'rgba(74,44,26,0.12)', 1);
      if (!isKitchen && chk) {
        drawPoly3D(ctx, cam, [[gx+0.68,0.01,gz+0.68],[gx+0.98,0.01,gz+0.68],[gx+0.98,0.01,gz+0.98],[gx+0.68,0.01,gz+0.98]], '#2F6F5B', null, 0);
      }
    }
  }
  drawPoly3D(ctx, cam, [[-6.0,0.015,9.9],[6.0,0.015,9.9],[6.0,0.015,10.1],[-6.0,0.015,10.1]], '#5C341D', null, 0);

  if (w.targetMarker) {
    var tm = w.targetMarker;
    var r = 0.24 + (1 - tm.ttl) * 0.16;
    drawPoly3D(ctx, cam, [
      [tm.x - r, 0.02, tm.z], [tm.x, 0.02, tm.z - r],
      [tm.x + r, 0.02, tm.z], [tm.x, 0.02, tm.z + r]
    ], 'rgba(244,185,59,0.52)', '#F4B93B', 1.5);
  }

  // 3. TRẦN GỖ LIM VINTAGE 90S KÍN 100% + XÀ GỒ NÂU SẪM (Y = 3.85)
  drawPoly3D(ctx, cam, [[-6.0,3.85,0],[6.0,3.85,0],[6.0,3.85,14.8],[-6.0,3.85,14.8]], '#F0DFBC', '#4A2C1A', 1);
  for (var bz = 0.4; bz <= 14.6; bz += 2.8) {
    drawPoly3D(ctx, cam, [[-6.0,3.62,bz],[6.0,3.62,bz],[6.0,3.85,bz],[-6.0,3.85,bz]], '#4A2C1A', '#2B180E', 1);
  }

  // 4. 4 BỨC TƯỜNG NỘI THẤT VINTAGE 90S KHÉP KÍN 360° + ỐP GỖ CHÂN TƯỜNG + TRANH SÀI GÒN XƯA
  // Tường trái (X = -6.0) & Tường phải (X = +6.0)
  drawPoly3D(ctx, cam, [[-6.0,0,0],[-6.0,0,14.8],[-6.0,3.85,14.8],[-6.0,3.85,0]], '#DFAA3E', '#3B2314', 1.2);
  drawPoly3D(ctx, cam, [[-5.96,0,0],[-5.96,0,14.8],[-5.96,0.95,14.8],[-5.96,0.95,0]], '#6E452A', '#3B2314', 1);
  drawPoly3D(ctx, cam, [[6.0,0,14.8],[6.0,0,0],[6.0,3.85,0],[6.0,3.85,14.8]], '#D99B26', '#3B2314', 1.2);
  drawPoly3D(ctx, cam, [[5.96,0,14.8],[5.96,0,0],[5.96,0.95,0],[5.96,0.95,14.8]], '#6E452A', '#3B2314', 1);
  // Tường hậu bếp (Z = 14.8) + Bảng thực đơn sơn son thếp vàng PHỞ BÒ GIA TRUYỀN 1990
  drawPoly3D(ctx, cam, [[-6.0,0,14.8],[6.0,0,14.8],[6.0,3.85,14.8],[-6.0,3.85,14.8]], '#E2AE42', '#3B2314', 1.2);
  drawPoly3D(ctx, cam, [[-3.6,2.15,14.72],[1.6,2.15,14.72],[1.6,3.15,14.72],[-3.6,3.15,14.72]], '#991B1B', '#F4B93B', 1.8);
  var menuP = projectPoint3D(cam, -1.0, 2.65, 14.68);
  if (menuP && menuP.cz > 0.6 && menuP.cz < 20) {
    ctx.save();
    ctx.font = 'bold ' + Math.max(7, Math.min(16, Math.round(menuP.scale * 0.24))) + 'px monospace';
    ctx.fillStyle = '#FACC15'; ctx.textAlign = 'center';
    ctx.fillText('PHỞ BÒ GIA TRUYỀN 1990', menuP.sx, menuP.sy + 3);
    ctx.restore();
  }
  // Bộ sưu tập Mỹ thuật Pixel Art Văn Hóa Việt Nam điệu nghệ trên 3 bức tường (Trái, Phải & Đối Diện Bếp — QĐ 240!)
  if (typeof drawPhoVnCultureWalls3D === 'function') {
    drawPhoVnCultureWalls3D(ctx, cam, w.t);
  }

  // Tường cửa ra vào phía sau lưng (Z = 0) — CHUẨN RPG AAA: CỬA GỖ LÁ SÁCH KÍNH MỜ ĐÓNG KÍN + VỆT NẮNG ĐỔ SÀN (QĐ 238!)
  drawPoly3D(ctx, cam, [[-6.0,0,0],[-1.45,0,0],[-1.45,3.85,0],[-6.0,3.85,0]], '#E0B04C', '#3B2314', 1.2);
  drawPoly3D(ctx, cam, [[-6.0,0,0.03],[-1.45,0,0.03],[-1.45,0.95,0.03],[-6.0,0.95,0.03]], '#6E452A', '#3B2314', 1);
  drawPoly3D(ctx, cam, [[1.45,0,0],[6.0,0,0],[6.0,3.85,0],[1.45,3.85,0]], '#E0B04C', '#3B2314', 1.2);
  drawPoly3D(ctx, cam, [[1.45,0,0.03],[6.0,0,0.03],[6.0,0.95,0.03],[1.45,0.95,0.03]], '#6E452A', '#3B2314', 1);
  // Khung biển gỗ đỏ đô phía trên cửa ra vào + chữ KÍNH CHÀO QUÝ KHÁCH
  drawPoly3D(ctx, cam, [[-1.45,2.55,0],[1.45,2.55,0],[1.45,3.85,0],[-1.45,3.85,0]], '#7F1D1D', '#3B2314', 1.4);
  drawPoly3D(ctx, cam, [[-1.25,2.75,0.03],[1.25,2.75,0.03],[1.25,3.45,0.03],[-1.25,3.45,0.03]], '#991B1B', '#F4B93B', 1.2);
  var byeP = projectPoint3D(cam, 0, 3.1, 0.05);
  if (byeP && byeP.cz > 0.4 && byeP.cz < 16) {
    ctx.save();
    ctx.font = 'bold ' + Math.max(6, Math.min(14, Math.round(byeP.scale * 0.18))) + 'px monospace';
    ctx.fillStyle = '#FACC15'; ctx.textAlign = 'center';
    ctx.fillText('KÍNH CHÀO QUÝ KHÁCH', byeP.sx, byeP.sy + 3);
    ctx.restore();
  }
  // Luồng ánh sáng ngược sáng trắng-vàng rực rỡ phía sau khe cửa (chỉ thấy luồng sáng, không lộ toàn cảnh ngoài — QĐ 239!)
  drawPoly3D(ctx, cam, [[-1.45,0,-0.04],[1.45,0,-0.04],[1.45,2.55,-0.04],[-1.45,2.55,-0.04]], '#FFFDF0', null, 0);
  drawPoly3D(ctx, cam, [[0.0,0,-0.03],[1.45,0,-0.03],[1.45,2.55,-0.03],[0.0,2.55,-0.03]], '#FFFFFF', null, 0);
  // Thảm chùi chân nâu đỏ & 2 Vệt nắng chiều xiên ấm áp đổ qua kính mờ xuống nền gạch bông!
  drawPoly3D(ctx, cam, [[-1.15,0.015,0.12],[1.15,0.015,0.12],[1.15,0.015,0.88],[-1.15,0.015,0.88]], '#8B3A2B', '#4A2C1A', 1.2);
  drawPoly3D(ctx, cam, [[-1.1,0.02,0.92],[-0.15,0.02,0.92],[-0.35,0.02,2.25],[-1.3,0.02,2.25]], 'rgba(255,232,168,0.28)', null, 0);
  drawPoly3D(ctx, cam, [[0.15,0.02,0.92],[1.1,0.02,0.92],[0.9,0.02,2.25],[-0.05,0.02,2.25]], 'rgba(255,232,168,0.28)', null, 0);
  // Dải tia nắng mặt trời động bùng sáng hắt qua khe cánh cửa phải khi khách hé cửa đi ra/vào!
  if (w.rightDoorOpen > 0.04) {
    var sl = w.rightDoorOpen;
    var beamAlpha = Math.min(0.58, 0.16 + sl * 0.52).toFixed(2);
    var beamFarZ = 1.6 + sl * 2.4;
    drawPoly3D(ctx, cam, [
      [0.02, 0.025, 0.05],
      [0.05 + sl * 1.15, 0.025, 0.05],
      [-0.35 + sl * 1.35, 0.025, beamFarZ],
      [-0.45, 0.025, beamFarZ]
    ], 'rgba(255, 250, 224, ' + beamAlpha + ')', null, 0);
    // Quầng sáng ngược sáng (bloom) ngay khe cửa hé mở
    var slitP = projectPoint3D(cam, 0.45, 1.35, 0.12);
    if (slitP && slitP.cz > 0.4) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.45, sl * 0.55);
      ctx.fillStyle = '#FFFCE8';
      ctx.beginPath();
      ctx.ellipse(slitP.sx, slitP.sy, Math.max(10, slitP.scale * 0.42 * sl), Math.max(24, slitP.scale * 1.05), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 5. THU THẬP VẬT THỂ 3D ĐỂ Z-SORT (PAINTER'S ALGORITHM)
  var drawList = [];
  function pushItem(wx, wz, fn) {
    var cp = worldToCam(cam, wx, 0.7, wz);
    drawList.push({ cz: cp.cz, fn: fn });
  }

  // 2 Chậu cây xanh trầu bà đặt 2 bên khung cửa ra vào
  pushItem(-1.95, 0.45, function() {
    drawBox3D(ctx, cam, -1.95, 0, 0.45, 0.48, 0.52, 0.48, { top: '#7C4F2B', front: '#A65432', side: '#8A4223' });
    drawBox3D(ctx, cam, -1.95, 0.52, 0.45, 0.62, 0.55, 0.62, { top: '#4CAF50', front: '#2E7D32', side: '#1B5E20' });
  });
  pushItem(1.95, 0.45, function() {
    drawBox3D(ctx, cam, 1.95, 0, 0.45, 0.48, 0.52, 0.48, { top: '#7C4F2B', front: '#A65432', side: '#8A4223' });
    drawBox3D(ctx, cam, 1.95, 0.52, 0.45, 0.62, 0.55, 0.62, { top: '#4CAF50', front: '#2E7D32', side: '#1B5E20' });
  });

  // 2 Cánh cửa gỗ lim lá sách có ô kính mờ sương: Cánh trái luôn đóng kín, chỉ Cánh phải hé ~35° khi khách ra/vào! (QĐ 239)
  var leftAng = w.leftDoorOpen * 1.0;
  var rightAng = w.rightDoorOpen * 0.98;
  pushItem(-0.75, 0.08, function() {
    var lx = -1.45 + Math.cos(leftAng) * 1.43;
    var lz = Math.sin(leftAng) * 1.43;
    drawPoly3D(ctx, cam, [[-1.45,0,0],[lx,0,lz],[lx,2.54,lz],[-1.45,2.54,0]], '#5C341D', '#2B180E', 1.4);
    var gx0 = -1.30, gx1 = lx - Math.cos(leftAng) * 0.14;
    var gz0 = 0.02, gz1 = lz - Math.sin(leftAng) * 0.14;
    drawPoly3D(ctx, cam, [[gx0,1.02,gz0],[gx1,1.02,gz1],[gx1,2.34,gz1],[gx0,2.34,gz0]], '#F7E7C4', '#3B2314', 1.2);
    drawPoly3D(ctx, cam, [[gx0,1.65,gz0+0.01],[gx1,1.65,gz1+0.01],[gx1,1.71,gz1+0.01],[gx0,1.71,gz0+0.01]], '#4A2C1A', null, 0);
    for (var ly = 0.22; ly <= 0.82; ly += 0.2) {
      drawPoly3D(ctx, cam, [[gx0,ly,gz0+0.01],[gx1,ly,gz1+0.01],[gx1,ly+0.06,gz1+0.01],[gx0,ly+0.06,gz0+0.01]], '#3B2314', null, 0);
    }
    var hx1 = -1.45 + Math.cos(leftAng) * 1.26, hz1 = Math.sin(leftAng) * 1.26;
    var hp1 = projectPoint3D(cam, hx1, 1.15, hz1 + 0.04);
    if (hp1 && hp1.cz > 0.35) { ctx.fillStyle = '#F4B93B'; ctx.fillRect(Math.round(hp1.sx - 2), Math.round(hp1.sy - 6), 4, 12); }
  });
  pushItem(0.75, 0.08, function() {
    var rx = 1.45 - Math.cos(rightAng) * 1.43;
    var rz = Math.sin(rightAng) * 1.43;
    drawPoly3D(ctx, cam, [[1.45,0,0],[rx,0,rz],[rx,2.54,rz],[1.45,2.54,0]], '#5C341D', '#2B180E', 1.4);
    var gx0 = 1.30, gx1 = rx + Math.cos(rightAng) * 0.14;
    var gz0 = 0.02, gz1 = rz - Math.sin(rightAng) * 0.14;
    drawPoly3D(ctx, cam, [[gx0,1.02,gz0],[gx1,1.02,gz1],[gx1,2.34,gz1],[gx0,2.34,gz0]], '#F7E7C4', '#3B2314', 1.2);
    drawPoly3D(ctx, cam, [[gx0,1.65,gz0+0.01],[gx1,1.65,gz1+0.01],[gx1,1.71,gz1+0.01],[gx0,1.71,gz0+0.01]], '#4A2C1A', null, 0);
    for (var ly2 = 0.22; ly2 <= 0.82; ly2 += 0.2) {
      drawPoly3D(ctx, cam, [[gx0,ly2,gz0+0.01],[gx1,ly2,gz1+0.01],[gx1,ly2+0.06,gz1+0.01],[gx0,ly2+0.06,gz0+0.01]], '#3B2314', null, 0);
    }
    var hx2 = 1.45 - Math.cos(rightAng) * 1.26, hz2 = Math.sin(rightAng) * 1.26;
    var hp2 = projectPoint3D(cam, hx2, 1.15, hz2 + 0.04);
    if (hp2 && hp2.cz > 0.35) { ctx.fillStyle = '#F4B93B'; ctx.fillRect(Math.round(hp2.sx - 2), Math.round(hp2.sy - 6), 4, 12); }
  });

  // 2 Quạt trần Vintage 3 cánh quay 60fps & 6 Đèn thả chụp men ánh vàng 90s!
  pushItem(0, 3.8, function() { drawCeilingFan3D(ctx, cam, 0, 3.42, 3.8, w.t, 0.0); });
  pushItem(0, 7.6, function() { drawCeilingFan3D(ctx, cam, 0, 3.42, 7.6, w.t, 1.8); });
  var lampPts = [[-3.4, 2.4], [3.4, 2.4], [-3.4, 5.4], [3.4, 5.4], [-3.4, 8.4], [3.4, 8.4], [-1.6, 11.4]];
  for (var li = 0; li < lampPts.length; li++) {
    (function(lp) {
      pushItem(lp[0], lp[1], function() { drawVintageLamp3D(ctx, cam, lp[0], 2.95, lp[1], 3.85); });
    })(lampPts[li]);
  }

  // QUẦY BẾP LỬA 3 ĐẦU BẾP + 2 NỒI NƯỚC DÙNG TRÒN BỐC KHÓI + TỦ THỊT BÒ TƯƠI SỐNG (Z = 10.6)
  pushItem(-2.0, 10.6, function() {
    drawBox3D(ctx, cam, -2.0, 0, 10.6, 7.2, 0.94, 1.05, { top: '#E2E8F0', front: '#5C341D', side: '#4A2C1A' });
    drawBox3D(ctx, cam, -4.1, 0.94, 10.6, 2.2, 1.05, 0.78, { top: 'rgba(255,243,196,0.45)', front: 'rgba(255,243,196,0.22)', side: 'rgba(255,235,175,0.28)' });
    drawKitchenIngredientsSprite3D(ctx, cam, -4.1, 1.02, 10.6);
    drawPhoPotSprite3D(ctx, cam, -1.6, 0.96, 10.6, w.t, 0.0);
    drawPhoPotSprite3D(ctx, cam, 0.1,  0.96, 10.6, w.t, 0.5);
  });
  pushItem(4.3, 14.1, function() {
    drawBox3D(ctx, cam, 4.3, 0, 14.1, 2.4, 0.88, 0.9, { top: '#93C5FD', front: '#CBD5E1', side: '#94A3B8' });
  });

  // 6 BÀN GỖ LIM + 12 GHẾ ĐỆM XANH RÊU + SPRITE ĐỒ ĂN PHỞ TẢ THỰC ĐẦY ĐỦ ĐŨA MUỖNG
  for (var ti = 0; ti < w.tables.length; ti++) {
    (function(tb) {
      for (var si = 0; si < 2; si++) {
        (function(se) { pushItem(se.x, se.z, function() { drawHeritageChair3D(ctx, cam, se); }); })(tb.seats[si]);
      }
      pushItem(tb.x, tb.z, function() { drawPhoTableIngredients3D(ctx, cam, tb, w.t); });
    })(w.tables[ti]);
  }

  // 3 NHÂN VIÊN BẾP, 2 PHỤC VỤ TẠP DỀ ĐẸP MẮT, 6 KHÁCH HÀNG NPC & CHÚ HEO MASCOT BO TRÒN
  for (var chi = 0; chi < w.chefs.length; chi++) {
    (function(ch) { pushItem(ch.x, ch.z, function() { drawHumanTps3D(ctx, cam, ch, w.t); }); })(w.chefs[chi]);
  }
  for (var wi = 0; wi < w.waiters.length; wi++) {
    (function(wt) { pushItem(wt.x, wt.z, function() { drawHumanTps3D(ctx, cam, wt, w.t); }); })(w.waiters[wi]);
  }
  for (var ki = 0; ki < w.customers.length; ki++) {
    (function(cu) {
      if (cu.state !== 'DOOR_WAIT') {
        pushItem(cu.x, cu.z, function() { drawHumanTps3D(ctx, cam, cu, w.t); });
      }
    })(w.customers[ki]);
  }
  pushItem(w.pig.x, w.pig.z, function() { drawPigTps3D(ctx, cam, w.pig, w.t); });

  drawList.sort(function(a, b) { return b.cz - a.cz; });
  for (var di = 0; di < drawList.length; di++) {
    if (drawList[di].cz > -1.2) drawList[di].fn();
  }

  // 6. LỚP PHỦ ÁNH ĐÈN VÀNG VINTAGE 90S ẤM CÚNG & CHUYỂN CẢNH FADE-OUT KHI RA CỬA
  ctx.save();
  ctx.fillStyle = 'rgba(255, 198, 92, 0.09)';
  ctx.fillRect(0, 0, vw, vh);
  if (w.exitFade > 0) {
    ctx.fillStyle = 'rgba(43, 33, 24, ' + Math.min(1, w.exitFade).toFixed(2) + ')';
    ctx.fillRect(0, 0, vw, vh);
  }
  ctx.restore();
}
`;
}
