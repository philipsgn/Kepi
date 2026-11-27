/**
 * Không Gian Quán Phở Cổ Truyền — Góc Nhìn Thứ 3 Nhập Vai 3D (TPS Kiểu PUBG — Quyết định 232)
 * Tuân thủ 100% docs/TPS_3D_OPEN_WORLD_SPEC.md:
 * - Xuất phát ngoài vỉa hè trước cửa gỗ-kính 2 cánh xoay bản lề 90° & biển PHỞ BÒ GIA TRUYỀN.
 * - Mở cửa bước vào quán 3D có sàn gạch bông phối cảnh, 8 bàn inox 3D (16 ghế), 3 quạt treo tường quay,
 *   và Khu Bếp Mở cho chú Heo bước hẳn vào sau quầy đứng sát xem Đầu bếp nấu ăn!
 * - Chu trình nhập vai thực tế: Mở cửa ➔ Tìm ghế trống ngồi ➔ Gọi Phở Tái Nạm (Phục vụ tới bàn nhận đơn
 *   ➔ Báo bếp ➔ Đầu bếp múc nước dùng bốc khói ➔ Phục vụ bưng ra tận bàn cho Heo ăn!) ➔ Đứng dậy khám phá bếp.
 * - FSM Khách NPC ra vào cửa, chờ món, ăn phở & nhân viên bưng/dọn tô rỗng thực tế 100%.
 */
export function buildPhoTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. KHỞI TẠO THẾ GIỚI 3D QUÁN PHỞ & FSM ==================== */
function createPhoTpsWorld() {
  // 8 Bàn inox 3D (4 dãy trái X=-3.4, 4 dãy phải X=+3.4), hành lang giữa rộng thoáng X=-1.5..+1.5
  var tables = [];
  var zRows = [2.1, 4.5, 6.9, 9.1];
  var tid = 0;
  for (var ri = 0; ri < zRows.length; ri++) {
    var zt = zRows[ri];
    var xCols = [-3.4, 3.4];
    for (var ci = 0; ci < 2; ci++) {
      var xt = xCols[ci];
      tables.push({
        id: tid++,
        x: xt,
        z: zt,
        seats: [
          { x: xt, z: zt - 0.92, yaw: 0, occupant: null, bowl: 'none' },
          { x: xt, z: zt + 0.92, yaw: Math.PI, occupant: null, bowl: 'none' }
        ]
      });
    }
  }

  // 2 Nhân viên phục vụ bưng phở & dọn tô rỗng (hỗ trợ cả Chú Heo lẫn khách NPC)
  var waiters = [
    { id: 0, x: -1.1, z: 9.8, yaw: Math.PI, role: 'waiter', shirt: '#FFFDF7', hair: '#2B2118', moving: false, carryBowl: null, task: null, phase: 0.2 },
    { id: 1, x: 1.1, z: 9.8, yaw: Math.PI, role: 'waiter', shirt: '#FFFDF7', hair: '#3B2314', moving: false, carryBowl: null, task: null, phase: 1.7 }
  ];

  // Đầu bếp chính đứng trong bếp mở nấu phở, thái thịt bò & múc nước dùng
  var chef = { x: -1.8, z: 12.5, yaw: Math.PI, role: 'chef', shirt: '#FFFFFF', hair: '#1E293B', moving: false, phase: 0 };

  // 6 Khách hàng NPC tự đẩy cửa ra vào, ngồi chờ món, ăn xì xụp & rời quán
  var shirtCols = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#0EA5E9'];
  var hairCols = ['#2B2118', '#3B2314', '#1E293B', '#4A3222'];
  var customers = [];
  for (var k = 0; k < 6; k++) {
    var initSeated = k < 4;
    var tIdx = k % tables.length;
    var sIdx = k % 2;
    var seat = tables[tIdx].seats[sIdx];
    if (initSeated && !seat.occupant) {
      seat.occupant = 'npc_' + k;
      seat.bowl = (k % 2 === 0) ? 'full' : 'none';
      customers.push({
        id: 'npc_' + k, role: 'customer',
        shirt: shirtCols[k % shirtCols.length], hair: hairCols[k % hairCols.length],
        x: seat.x, z: seat.z, yaw: seat.yaw,
        seated: true, moving: false, phase: k * 0.9,
        state: (k % 2 === 0) ? 'EATING' : 'WAITING_FOOD',
        timer: 5 + k * 2.5,
        tableId: tIdx, seatIdx: sIdx
      });
    } else {
      customers.push({
        id: 'npc_' + k, role: 'customer',
        shirt: shirtCols[k % shirtCols.length], hair: hairCols[k % hairCols.length],
        x: (k % 2 === 0 ? -2.8 : 2.8), z: -3.2, yaw: 0,
        seated: false, moving: false, phase: k * 1.1,
        state: 'OUTSIDE_WAIT',
        timer: 2.5 + k * 1.8,
        tableId: -1, seatIdx: -1
      });
    }
  }

  return {
    t: 0,
    doorOpen: 0,        // 0 = đóng kín, 1 = mở hẳn 92 độ
    doorTarget: 0,
    doorManualOpen: false,
    pig: {
      x: 0, z: -2.4, tx: 0, tz: -2.4,
      yaw: 0, walking: false,
      seated: false, seatRef: null,
      eating: false, eatTimer: 0,
      orderState: 'none' // 'none' | 'ordered' | 'served' | 'eating' | 'done'
    },
    targetMarker: null, // { x, z, ttl }
    tables: tables,
    waiters: waiters,
    chef: chef,
    customers: customers,
    toastText: 'Chạm sàn để đi · Vuốt để xoay góc nhìn 360°'
  };
}

function moveTowards2D(ent, tx, tz, speed, dt) {
  var dx = tx - ent.x, dz = tz - ent.z;
  var dist = Math.hypot(dx, dz);
  if (dist < 0.09) {
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
  // Giới hạn biên tường ngoài & khu bếp mở (lối vào bếp ở X: +1.7..+5.5, Z = 10.6)
  nx = Math.max(-5.6, Math.min(5.6, nx));
  nz = Math.max(-3.8, Math.min(13.6, nz));
  // Tường mặt tiền tại Z = 0: chỉ đi qua khoảng cửa X ∈ [-1.25, +1.25] khi cửa mở!
  var oldZ = w.pig.z;
  if ((oldZ < 0 && nz >= -0.25) || (oldZ >= 0 && nz <= 0.25)) {
    if (Math.abs(nx) > 1.2) {
      nz = oldZ < 0 ? -0.3 : 0.3;
    } else if (w.doorOpen < 0.35) {
      // Tự động đẩy cửa mở khi Heo bước sát ngưỡng cửa!
      w.doorManualOpen = true;
    }
  }
  // Quầy kính bếp (X: -5.8 .. +1.5, Z: 10.1 .. 11.4): đi vòng qua lối mở bên phải X > 1.6 để vào bếp!
  if (nx < 1.55 && nz > 10.05 && nz < 11.45) {
    if (oldZ <= 10.2) nz = 10.05;
    else if (oldZ >= 11.3) nz = 11.45;
    else nx = 1.55;
  }
  return { x: nx, z: nz };
}

function stepPhoTpsWorld(w, dt) {
  w.t += dt;

  // 1. Cửa gỗ-kính 2 cánh xoay bản lề mượt mà (tự mở khi có Heo hoặc khách đi qua!)
  var someoneNearDoor = (Math.abs(w.pig.x) < 1.7 && Math.abs(w.pig.z) < 1.35);
  for (var ci = 0; ci < w.customers.length; ci++) {
    var cu = w.customers[ci];
    if (Math.abs(cu.x) < 1.6 && Math.abs(cu.z) < 1.3) { someoneNearDoor = true; break; }
  }
  w.doorTarget = (w.doorManualOpen || someoneNearDoor) ? 1 : 0;
  w.doorOpen += (w.doorTarget - w.doorOpen) * Math.min(1, dt * 6.5);

  // 2. Di chuyển Chú Heo Mascot (khi không ngồi ghế)
  var p = w.pig;
  if (p.eating) {
    p.eatTimer -= dt;
    if (p.eatTimer <= 0) {
      p.eating = false;
      p.orderState = 'done';
      if (p.seatRef) {
        p.seatRef.seat.bowl = 'empty';
      }
      w.toastText = 'Heo ăn sạch tô Phở Tái Nạm thơm lừng! Bấm Đứng dậy để khám phá bếp nhé!';
    }
  } else if (!p.seated && p.walking) {
    var dx = p.tx - p.x, dz = p.tz - p.z;
    var dist = Math.hypot(dx, dz);
    if (dist < 0.12) {
      p.walking = false;
    } else {
      var step = Math.min(dist, 3.6 * dt);
      var next = clampPigWorldPos(w, p.x + (dx / dist) * step, p.z + (dz / dist) * step);
      p.x = next.x; p.z = next.z;
      p.yaw = Math.atan2(dx, dz);
    }
  }
  if (w.targetMarker) {
    w.targetMarker.ttl -= dt;
    if (w.targetMarker.ttl <= 0) w.targetMarker = null;
  }

  // 3. Đầu bếp hoạt động sống động sau quầy bếp (di chuyển qua lại giữa nồi nước dùng & thớt thịt)
  w.chef.x = -1.8 + Math.sin(w.t * 0.9) * 1.1;
  w.chef.moving = Math.abs(Math.cos(w.t * 0.9)) > 0.3;

  // 4. FSM Khách Hàng NPC ra vào cửa 100% thực tế
  for (var i = 0; i < w.customers.length; i++) {
    var c = w.customers[i];
    if (c.state === 'OUTSIDE_WAIT') {
      c.timer -= dt;
      if (c.timer <= 0) {
        // Tìm 1 ghế trống
        var freeSeat = null;
        for (var ti = 0; ti < w.tables.length && !freeSeat; ti++) {
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
          c.state = 'WALK_TO_DOOR';
        } else {
          c.timer = 3;
        }
      }
    } else if (c.state === 'WALK_TO_DOOR') {
      if (moveTowards2D(c, 0, 0.8, 2.2, dt)) c.state = 'WALK_TO_SEAT';
    } else if (c.state === 'WALK_TO_SEAT') {
      var st = w.tables[c.tableId].seats[c.seatIdx];
      if (moveTowards2D(c, st.x, st.z, 2.2, dt)) {
        c.seated = true; c.yaw = st.yaw;
        c.state = 'WAITING_FOOD';
      }
    } else if (c.state === 'EATING') {
      c.timer -= dt;
      if (c.timer <= 0) {
        var stDone = w.tables[c.tableId].seats[c.seatIdx];
        stDone.bowl = 'empty';
        stDone.occupant = null;
        c.seated = false;
        c.state = 'LEAVE_TO_DOOR';
      }
    } else if (c.state === 'LEAVE_TO_DOOR') {
      if (moveTowards2D(c, 0, 0.4, 2.3, dt)) c.state = 'LEAVE_OUTSIDE';
    } else if (c.state === 'LEAVE_OUTSIDE') {
      if (moveTowards2D(c, (i % 2 === 0 ? -3.2 : 3.2), -3.2, 2.3, dt)) {
        c.state = 'OUTSIDE_WAIT';
        c.timer = 4 + Math.random() * 5;
      }
    }
  }

  // 5. FSM 2 Nhân Viên Phục Vụ (Ưu tiên bưng phở cho Chú Heo -> Khách chờ -> Dọn tô rỗng về bồn rửa)
  for (var wi = 0; wi < w.waiters.length; wi++) {
    var wt = w.waiters[wi];
    if (!wt.task) {
      // Ưu tiên 1: Chú Heo vừa gọi Phở!
      if (p.seated && p.orderState === 'ordered' && p.seatRef) {
        var alreadyAssigned = false;
        for (var ow = 0; ow < w.waiters.length; ow++) {
          if (w.waiters[ow].task && w.waiters[ow].task.forPig) alreadyAssigned = true;
        }
        if (!alreadyAssigned) {
          wt.task = { type: 'PIG_ORDER', forPig: true, phase: 'TO_PIG', table: p.seatRef.table, seat: p.seatRef.seat };
        }
      }
      // Ưu tiên 2: Khách NPC đang chờ phở
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
      // Ưu tiên 3: Dọn tô rỗng về bồn rửa bếp
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
      if (!wt.task) {
        moveTowards2D(wt, wi === 0 ? -1.1 : 1.1, 9.6, 2.0, dt);
      }
    } else {
      var tk = wt.task;
      if (tk.type === 'PIG_ORDER') {
        if (tk.phase === 'TO_PIG') {
          var approachX = tk.table.x > 0 ? tk.table.x - 1.3 : tk.table.x + 1.3;
          if (moveTowards2D(wt, approachX, tk.seat.z, 2.9, dt)) {
            w.toastText = 'Nhân viên: "Dạ 1 Phở Tái Nạm cho chú Heo, chờ xíu nha!"';
            tk.phase = 'TO_KITCHEN';
          }
        } else if (tk.phase === 'TO_KITCHEN') {
          if (moveTowards2D(wt, -0.8, 9.8, 3.0, dt)) {
            wt.carryBowl = 'full';
            tk.phase = 'DELIVER_PIG';
          }
        } else if (tk.phase === 'DELIVER_PIG') {
          var appX2 = tk.table.x > 0 ? tk.table.x - 1.3 : tk.table.x + 1.3;
          if (moveTowards2D(wt, appX2, tk.seat.z, 2.9, dt)) {
            wt.carryBowl = null;
            tk.seat.bowl = 'full';
            p.orderState = 'served';
            w.toastText = 'Phở Tái Nạm bốc khói đã ra tận bàn! Bấm Ăn Phở thôi!';
            wt.task = null;
          }
        }
      } else if (tk.type === 'SERVE_NPC') {
        if (tk.phase === 'TO_KITCHEN') {
          if (moveTowards2D(wt, -1.2, 9.8, 2.6, dt)) {
            wt.carryBowl = 'full';
            tk.phase = 'TO_TABLE';
          }
        } else if (tk.phase === 'TO_TABLE') {
          var ax = tk.table.x > 0 ? tk.table.x - 1.3 : tk.table.x + 1.3;
          if (moveTowards2D(wt, ax, tk.seat.z, 2.6, dt)) {
            wt.carryBowl = null;
            tk.seat.bowl = 'full';
            tk.cust.state = 'EATING';
            tk.cust.timer = 9 + Math.random() * 5;
            wt.task = null;
          }
        }
      } else if (tk.type === 'CLEAR') {
        if (tk.phase === 'TO_TABLE') {
          var axc = tk.table.x > 0 ? tk.table.x - 1.3 : tk.table.x + 1.3;
          if (moveTowards2D(wt, axc, tk.seat.z, 2.5, dt)) {
            tk.seat.bowl = 'none';
            wt.carryBowl = 'empty';
            tk.phase = 'TO_SINK';
          }
        } else if (tk.phase === 'TO_SINK') {
          if (moveTowards2D(wt, 3.2, 12.2, 2.5, dt)) {
            wt.carryBowl = null;
            wt.task = null;
          }
        }
      }
    }
  }
}

/* ==================== 2. TƯƠNG TÁC NGỮ CẢNH NHẬP VAI (MỞ CỬA / NGỒI / GỌI PHỞ / VÀO BẾP) ==================== */
function getPhoContextAction(w) {
  var p = w.pig;
  if (p.seated) {
    if (p.orderState === 'none') return { id: 'order_pho', label: '🍜 Gọi Phở Tái Nạm', secondary: { id: 'stand_up', label: 'Đứng dậy' } };
    if (p.orderState === 'ordered') return { id: 'waiting_pho', label: '⏳ Phục vụ đang lấy Phở...', secondary: { id: 'stand_up', label: 'Đứng dậy' } };
    if (p.orderState === 'served') return { id: 'eat_pho', label: '🥢 Ăn Phở nóng hổi!', secondary: { id: 'stand_up', label: 'Đứng dậy' } };
    if (p.orderState === 'eating') return { id: 'eating_now', label: '😋 Heo đang xì xụp...', secondary: null };
    return { id: 'stand_up', label: '🐷 Đứng dậy đi khám phá', secondary: null };
  }
  // Gần cửa gỗ 2 cánh (Z quanh 0)
  if (Math.abs(p.x) < 1.8 && Math.abs(p.z) < 1.8 && w.doorOpen < 0.5) {
    return { id: 'open_door', label: p.z < 0 ? '🚪 Mở cửa vào Quán Phở' : '🚪 Mở cửa ra vỉa hè', secondary: null };
  }
  // Trong khu vực bếp gần Đầu bếp
  if (p.z > 10.6 && Math.hypot(p.x - w.chef.x, p.z - w.chef.z) < 3.4) {
    return { id: 'watch_chef', label: '👨‍🍳 Xem Đầu bếp múc nước dùng', secondary: null };
  }
  // Tìm ghế trống gần nhất trong bán kính 1.65m
  var bestSeat = null, bestD = 1.65;
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
  if (bestSeat) {
    return { id: 'sit_seat', label: '🪑 Ngồi xuống bàn ăn Phở', seatRef: bestSeat, secondary: null };
  }
  // Ngoài vỉa hè sát mép đường
  if (p.z < -3.0) {
    return { id: 'exit_pho', label: '🏙️ Quay lại Đại Lộ Sài Gòn', secondary: null };
  }
  return null;
}

function triggerPhoAction(w, actionId, seatRef) {
  var p = w.pig;
  if (actionId === 'open_door') {
    w.doorManualOpen = true;
    p.walking = true;
    p.tx = 0;
    p.tz = p.z < 0 ? 1.5 : -1.8;
    w.toastText = p.z < 0 ? 'Cửa mở rồi! Mùi nước dùng Phở thơm phức quá!' : 'Bước ra lại vỉa hè Sài Gòn!';
  } else if (actionId === 'sit_seat' && seatRef) {
    p.seated = true;
    p.walking = false;
    p.seatRef = seatRef;
    seatRef.seat.occupant = 'PIG';
    p.x = seatRef.seat.x;
    p.z = seatRef.seat.z;
    p.yaw = seatRef.seat.yaw;
    p.orderState = seatRef.seat.bowl === 'full' ? 'served' : 'none';
    w.toastText = 'Heo đã ngồi yên vị! Bấm Gọi Phở Tái Nạm để nhân viên phục vụ nhé!';
  } else if (actionId === 'order_pho') {
    p.orderState = 'ordered';
    w.toastText = 'Heo giơ tay gọi Phở! Nhân viên phục vụ đang chạy tới bàn...';
  } else if (actionId === 'eat_pho') {
    p.orderState = 'eating';
    p.eating = true;
    p.eatTimer = 4.5;
    w.toastText = 'Xì xụp! Tô Phở Tái Nạm nóng hổi ngon tuyệt cú mèo!';
  } else if (actionId === 'stand_up') {
    if (p.seatRef) {
      p.seatRef.seat.occupant = null;
      p.x = p.seatRef.table.x > 0 ? p.seatRef.table.x - 1.5 : p.seatRef.table.x + 1.5;
    }
    p.seated = false;
    p.eating = false;
    p.seatRef = null;
    p.orderState = 'none';
    w.toastText = 'Heo đứng dậy! Bạn có thể đi vào khu Bếp phía cuối bên phải để xem Đầu bếp nấu!';
  } else if (actionId === 'watch_chef') {
    w.toastText = 'Đầu bếp: "Nước dùng ninh xương bò 12 tiếng thơm nức mũi luôn chú Heo ơi!"';
  }
}

/* ==================== 3. VẼ THẾ GIỚI 3D QUÁN PHỞ (PAINTER'S ALGORITHM Z-SORTING) ==================== */
function renderPhoTps3D(ctx, cam, w) {
  var vw = cam.vw, vh = cam.vh;
  // Bầu trời xanh / trần nhà ấm
  ctx.fillStyle = '#8BC4F9';
  ctx.fillRect(0, 0, vw, Math.round(vh * 0.52));
  ctx.fillStyle = '#D5C3A1';
  ctx.fillRect(0, Math.round(vh * 0.52), vw, vh);

  // 1. Sàn vỉa hè ngoài quán (Z: -4.4..0) & Sàn gạch bông Indochine bên trong quán (Z: 0..14.6)
  for (var gz = -4; gz < 14; gz += 1.5) {
    for (var gx = -6.0; gx < 6.0; gx += 1.5) {
      var isOut = gz < 0;
      var checker = ((Math.floor(gx + 10) + Math.floor(gz + 10)) % 2 === 0);
      var col = isOut
        ? (checker ? '#DFCFB2' : '#D5C2A1')
        : (gz >= 10.5 ? (checker ? '#CBD5E1' : '#E2E8F0') : (checker ? '#F6EEDC' : '#E8DCC0'));
      drawPoly3D(ctx, cam, [[gx,0,gz],[gx+1.5,0,gz],[gx+1.5,0,gz+1.5],[gx,0,gz+1.5]], col, 'rgba(43,33,24,0.08)', 1);
    }
  }

  // Vòng sáng mục tiêu 3D trên sàn khi người dùng chạm Tap-to-Walk
  if (w.targetMarker) {
    var tm = w.targetMarker;
    var r = 0.25 + (1 - tm.ttl) * 0.18;
    drawPoly3D(ctx, cam, [
      [tm.x - r, 0.02, tm.z], [tm.x, 0.02, tm.z - r],
      [tm.x + r, 0.02, tm.z], [tm.x, 0.02, tm.z + r]
    ], 'rgba(244,185,59,0.45)', '#F4B93B', 1.5);
  }

  // 2. Tường bao 3D (Tường trái X=-6.2, Tường phải X=+6.2, Tường bếp sau Z=14.6, Trần quán)
  drawPoly3D(ctx, cam, [[-6.2,0,0],[-6.2,0,14.6],[-6.2,3.6,14.6],[-6.2,3.6,0]], '#E8CF9E', '#2B2118', 1);
  drawPoly3D(ctx, cam, [[6.2,0,14.6],[6.2,0,0],[6.2,3.6,0],[6.2,3.6,14.6]], '#E2C692', '#2B2118', 1);
  drawPoly3D(ctx, cam, [[-6.2,0,14.6],[6.2,0,14.6],[6.2,3.6,14.6],[-6.2,3.6,14.6]], '#F2DBAE', '#2B2118', 1);
  // Bảng giá Phở treo tường sau bếp & 3 Quạt treo tường quay 60fps
  drawPoly3D(ctx, cam, [[-3.8,2.1,14.52],[0.8,2.1,14.52],[0.8,3.0,14.52],[-3.8,3.0,14.52]], '#991B1B', '#F4B93B', 1.5);
  var fanXs = [-4.2, 0.0, 4.2];
  for (var fi = 0; fi < fanXs.length; fi++) {
    var fp = projectPoint3D(cam, fanXs[fi], 2.95, 14.4);
    if (fp && fp.cz > 0.5) {
      var fr = Math.max(4, Math.round(fp.scale * 0.28));
      ctx.save();
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(fp.sx, fp.sy, fr, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 2;
      var ang = w.t * 14 + fi;
      ctx.beginPath();
      ctx.moveTo(fp.sx - Math.cos(ang) * fr * 0.8, fp.sy - Math.sin(ang) * fr * 0.8);
      ctx.lineTo(fp.sx + Math.cos(ang) * fr * 0.8, fp.sy + Math.sin(ang) * fr * 0.8);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 3. Thu thập toàn bộ đối tượng 3D (Mặt tiền & Cửa xoay bản lề, Bàn ghế, Quầy bếp, Nhân vật & Chú Heo) để Z-Sort!
  var drawList = [];
  function pushItem(wx, wz, fn) {
    var cp = worldToCam(cam, wx, 0.6, wz);
    drawList.push({ cz: cp.cz, fn: fn });
  }

  // Tường mặt tiền trái & phải + Biển hiệu PHỞ BÒ GIA TRUYỀN (Z = 0)
  pushItem(-3.8, 0, function() {
    drawPoly3D(ctx, cam, [[-6.2,0,0],[-1.35,0,0],[-1.35,3.6,0],[-6.2,3.6,0]], '#E8CA94', '#2B2118', 1.2);
    drawPoly3D(ctx, cam, [[-5.4,0.85,-0.04],[-2.0,0.85,-0.04],[-2.0,2.2,-0.04],[-5.4,2.2,-0.04]], 'rgba(254,240,199,0.58)', '#5C3A21', 1.5);
  });
  pushItem(3.8, 0, function() {
    drawPoly3D(ctx, cam, [[1.35,0,0],[6.2,0,0],[6.2,3.6,0],[1.35,3.6,0]], '#E8CA94', '#2B2118', 1.2);
    drawPoly3D(ctx, cam, [[2.0,0.85,-0.04],[5.4,0.85,-0.04],[5.4,2.2,-0.04],[2.0,2.2,-0.04]], 'rgba(254,240,199,0.58)', '#5C3A21', 1.5);
  });
  // Biển hiệu đỏ vàng phía trên cửa ra vào
  pushItem(0, -0.05, function() {
    drawPoly3D(ctx, cam, [[-2.4,2.55,-0.06],[2.4,2.55,-0.06],[2.4,3.45,-0.06],[-2.4,3.45,-0.06]], '#B8291E', '#2B2118', 1.5);
    var signP = projectPoint3D(cam, 0, 3.0, -0.08);
    if (signP && signP.cz > 0.5 && signP.cz < 14) {
      ctx.save();
      ctx.font = 'bold ' + Math.max(7, Math.min(18, Math.round(signP.scale * 0.28))) + 'px monospace';
      ctx.fillStyle = '#FACC15';
      ctx.textAlign = 'center';
      ctx.fillText('PHỞ BÒ GIA TRUYỀN', signP.sx, signP.sy + 3);
      ctx.restore();
    }
  });

  // CỬA GỖ-KÍNH 2 CÁNH XOAY BẢN LỀ 90° (Z = 0, bản lề tại X = -1.35 và X = +1.35)
  var doorAng = w.doorOpen * 1.52; // 0 -> ~87 độ mở vào trong quán
  pushItem(-0.7, 0.1, function() {
    var lx = -1.35 + Math.cos(doorAng) * 1.32;
    var lz = Math.sin(doorAng) * 1.32;
    drawPoly3D(ctx, cam, [[-1.35,0,0],[lx,0,lz],[lx,2.42,lz],[-1.35,2.42,0]], '#7C4F2B', '#2B2118', 1.4);
    drawPoly3D(ctx, cam, [[-1.22,0.85,0.02],[lx - Math.cos(doorAng)*0.12,0.85,lz - Math.sin(doorAng)*0.12],[lx - Math.cos(doorAng)*0.12,2.22,lz - Math.sin(doorAng)*0.12],[-1.22,2.22,0.02]], 'rgba(186,230,253,0.55)', '#3B2314', 1);
  });
  pushItem(0.7, 0.1, function() {
    var rx = 1.35 - Math.cos(doorAng) * 1.32;
    var rz = Math.sin(doorAng) * 1.32;
    drawPoly3D(ctx, cam, [[1.35,0,0],[rx,0,rz],[rx,2.42,rz],[1.35,2.42,0]], '#7C4F2B', '#2B2118', 1.4);
    drawPoly3D(ctx, cam, [[1.22,0.85,0.02],[rx + Math.cos(doorAng)*0.12,0.85,rz - Math.sin(doorAng)*0.12],[rx + Math.cos(doorAng)*0.12,2.22,rz - Math.sin(doorAng)*0.12],[1.22,2.22,0.02]], 'rgba(186,230,253,0.55)', '#3B2314', 1);
  });

  // QUẦY BẾP MỞ 3D + 2 NỒI NƯỚC DÙNG PHỞ KHỔNG LỒ BỐC KHÓI + BỒN RỬA
  pushItem(-2.1, 10.7, function() {
    drawBox3D(ctx, cam, -2.1, 0, 10.7, 6.8, 0.96, 1.0, { top: '#E2E8F0', front: '#CBD5E1', side: '#94A3B8' });
    // Tủ kính treo thịt bò góc trái quầy
    drawBox3D(ctx, cam, -4.3, 0.96, 10.7, 1.6, 0.95, 0.72, { top: '#BAE6FD', front: 'rgba(186,230,253,0.45)', side: 'rgba(147,197,253,0.5)' });
    // 2 Nồi nước dùng Phở inox lớn + làn khói 3D bốc lên
    var pots = [-2.2, -0.7];
    for (var pi = 0; pi < 2; pi++) {
      drawBox3D(ctx, cam, pots[pi], 0.96, 10.7, 0.82, 0.68, 0.82, { top: '#D97706', front: '#94A3B8', side: '#64748B' });
      var sp = projectPoint3D(cam, pots[pi], 1.85 + ((w.t * 0.7 + pi * 0.5) % 0.7), 10.7);
      if (sp) {
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = '#FFFDF7';
        ctx.beginPath(); ctx.arc(sp.sx, sp.sy, Math.max(3, sp.scale * 0.14), 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
  });
  // Bồn rửa chén inox góc bếp phải sau (X: 4.5, Z: 13.5)
  pushItem(4.4, 13.5, function() {
    drawBox3D(ctx, cam, 4.4, 0, 13.5, 2.2, 0.88, 0.9, { top: '#93C5FD', front: '#CBD5E1', side: '#94A3B8' });
  });

  // 8 BÀN INOX 3D + 16 GHẾ NHỰA + TÔ PHỞ BỐC KHÓI
  for (var ti = 0; ti < w.tables.length; ti++) {
    (function(tb) {
      // 2 Ghế nhựa đỏ/xanh
      for (var si = 0; si < 2; si++) {
        (function(se, idx) {
          pushItem(se.x, se.z, function() {
            drawBox3D(ctx, cam, se.x, 0, se.z, 0.52, 0.46, 0.52, {
              top: idx === 0 ? '#E0452B' : '#2563EB',
              front: idx === 0 ? '#B91C1C' : '#1D4ED8',
              side: idx === 0 ? '#991B1B' : '#1E40AF'
            });
          });
        })(tb.seats[si], si);
      }
      // Bàn inox + Tô phở nếu có
      pushItem(tb.x, tb.z, function() {
        drawBox3D(ctx, cam, tb.x, 0.68, tb.z, 1.55, 0.1, 0.98, { top: '#F1F5F9', front: '#CBD5E1', side: '#94A3B8' });
        // 4 Chân bàn inox mảnh
        drawBox3D(ctx, cam, tb.x - 0.62, 0, tb.z - 0.36, 0.08, 0.68, 0.08, { top: '#94A3B8', front: '#64748B', side: '#475569' });
        drawBox3D(ctx, cam, tb.x + 0.62, 0, tb.z - 0.36, 0.08, 0.68, 0.08, { top: '#94A3B8', front: '#64748B', side: '#475569' });
        drawBox3D(ctx, cam, tb.x - 0.62, 0, tb.z + 0.36, 0.08, 0.68, 0.08, { top: '#94A3B8', front: '#64748B', side: '#475569' });
        drawBox3D(ctx, cam, tb.x + 0.62, 0, tb.z + 0.36, 0.08, 0.68, 0.08, { top: '#94A3B8', front: '#64748B', side: '#475569' });
        // Lọ tương ớt giữa bàn
        drawBox3D(ctx, cam, tb.x + 0.42, 0.78, tb.z, 0.14, 0.22, 0.14, { top: '#EF4444', front: '#DC2626', side: '#B91C1C' });
        // Vẽ Tô Phở cho từng ghế nếu có món!
        for (var bi = 0; bi < 2; bi++) {
          var bState = tb.seats[bi].bowl;
          if (bState !== 'none') {
            var bz = tb.z + (bi === 0 ? -0.26 : 0.26);
            drawBox3D(ctx, cam, tb.x - 0.1, 0.78, bz, 0.34, 0.16, 0.34, {
              top: bState === 'full' ? '#E6A825' : '#E2E8F0',
              front: '#FFFFFF', side: '#CBD5E1'
            });
            if (bState === 'full') {
              var stp = projectPoint3D(cam, tb.x - 0.1, 1.05 + ((w.t * 0.9 + bi) % 0.35), bz);
              if (stp) {
                ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#FFFDF7';
                ctx.fillRect(Math.round(stp.sx - 2), Math.round(stp.sy - 2), 4, 4);
                ctx.restore();
              }
            }
          }
        }
      });
    })(w.tables[ti]);
  }

  // ĐẦU BẾP, 2 PHỤC VỤ, KHÁCH HÀNG NPC & CHÚ HEO MASCOT
  pushItem(w.chef.x, w.chef.z, function() { drawHumanTps3D(ctx, cam, w.chef, w.t); });
  for (var wi = 0; wi < w.waiters.length; wi++) {
    (function(wt) {
      pushItem(wt.x, wt.z, function() { drawHumanTps3D(ctx, cam, wt, w.t); });
    })(w.waiters[wi]);
  }
  for (var ki = 0; ki < w.customers.length; ki++) {
    (function(cu) {
      pushItem(cu.x, cu.z, function() { drawHumanTps3D(ctx, cam, cu, w.t); });
    })(w.customers[ki]);
  }
  pushItem(w.pig.x, w.pig.z, function() { drawPigTps3D(ctx, cam, w.pig, w.t); });

  // SẮP XẾP TỪ XA → GẦN CAMERA (Painter's Algorithm chuẩn 3D!)
  drawList.sort(function(a, b) { return b.cz - a.cz; });
  for (var di = 0; di < drawList.length; di++) {
    if (drawList[di].cz > -1.2) drawList[di].fn();
  }
}
`;
}
