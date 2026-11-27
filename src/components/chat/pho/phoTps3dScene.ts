/**
 * Quán Phở Cổ Truyền Phố Hội — 5 Gian Phòng Liên Hoàn TPS 3D Kiểu PUBG (Quyết định 233)
 * Tuân thủ 100% docs/TPS_3D_OPEN_WORLD_SPEC.md & 5 ảnh mẫu kiến trúc Phố Hội / Mẹt Hội An:
 * - Trần nhà gỗ lim + xà gồ kín 100% bên trong quán (tuyệt đối không lộ bầu trời xanh!).
 * - 5 Gian phòng liên hoàn (22m × 24m) đồng bộ 2 chiều với Thanh Tab tham quan:
 *   1. Sân Vườn & Mặt Tiền Phố Hội (garden): Gạch bông gió xanh, vòm hoa giấy, đèn lồng, cửa gỗ 2 cánh xoay 90°.
 *   2. Sảnh Chính Phố Hội (main_hall): Cột vàng nghệ đèn lồng, bình phong song gỗ, sàn gạch bông hoa văn xanh, 6 bàn gỗ lim ghế đệm xanh rêu.
 *   3. Gian Phòng VIP Cổ Kính (vip_room): Tường gạch nung trần, đèn mây tre, 2 bàn tiệc gỗ lim & bình hoa sen.
 *   4. Bếp Lửa Ninh Xương & Quầy Nguyên Liệu (kitchen): Tủ thịt bò tái/gầu, bánh phở, hành ngò, 2 nồi nước dùng bốc khói 3D, Đầu bếp nấu.
 *   5. Góc Trà Đạo & Phòng Vệ Sinh (tea_wc): Bàn trà Bát Tràng + quẩy nóng & khu WC sạch đẹp bồn rửa gốm sứ.
 * - Chi tiết nguyên liệu Phở Việt Nam trên từng bàn: Tô Phở đầy thịt bò-hành ngò, ấm trà Bát Tràng men xanh,
 *   rổ gia vị đỏ (tương ớt, nước tương, giấm tỏi ớt), dĩa giá đỗ-rau thơm-chanh, quẩy nóng & trứng chần.
 */
export function buildPhoTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. CẤU HÌNH 5 GIAN PHÒNG & DẪN ĐƯỜNG WAYPOINT ĐỒNG BỘ TAB ==================== */
var PHO_ROOM_DESTS = {
  garden:    { x: 0.0,  z: -2.8, yaw: 0.0,   camYaw: 0.0,   label: '🏮 Sân Vườn & Mặt Tiền Phố Hội' },
  main_hall: { x: 0.0,  z: 3.0,  yaw: 0.0,   camYaw: 0.0,   label: '🏛️ Sảnh Chính Phố Hội Ấm Cúng' },
  vip_room:  { x: -8.6, z: 5.5,  yaw: -1.57, camYaw: -1.57, label: '✨ Gian Phòng VIP Cổ Kính' },
  kitchen:   { x: 0.8,  z: 13.2, yaw: -1.2,  camYaw: -0.65, label: '🔥 Bếp Lửa Ninh Xương & Quầy Nguyên Liệu' },
  tea_wc:    { x: 8.6,  z: 4.8,  yaw: 1.57,  camYaw: 1.57,  label: '🍵 Góc Trà Đạo Bát Tràng & Phòng Vệ Sinh' }
};

function detectCurrentPhoRoom(x, z) {
  if (z < 0) return 'garden';
  if (z >= 11.0) return 'kitchen';
  if (x <= -6.4) return 'vip_room';
  if (x >= 6.4) return 'tea_wc';
  return 'main_hall';
}

function navigatePigToRoom(w, cam, roomId) {
  var dest = PHO_ROOM_DESTS[roomId];
  if (!dest) return;
  var p = w.pig;
  if (p.seated) triggerPhoAction(w, 'stand_up', null);
  var curRoom = detectCurrentPhoRoom(p.x, p.z);
  var q = [];
  // Bước 1: Thoát phòng hiện tại ra hành lang trung tâm Sảnh Chính qua đúng cửa vòm
  if (curRoom === 'garden' && roomId !== 'garden') {
    w.doorManualOpen = true;
    q.push({ x: 0, z: -0.6 }, { x: 0, z: 1.6 });
  } else if (curRoom === 'vip_room' && roomId !== 'vip_room') {
    q.push({ x: -6.4, z: 5.5 }, { x: -4.2, z: 5.5 });
  } else if (curRoom === 'tea_wc' && roomId !== 'tea_wc') {
    q.push({ x: 6.4, z: 5.5 }, { x: 4.2, z: 5.5 });
  } else if (curRoom === 'kitchen' && roomId !== 'kitchen') {
    q.push({ x: 3.6, z: 12.2 }, { x: 3.6, z: 9.8 });
  }
  // Bước 2: Đi vào gian phòng đích qua đúng cửa chính / cửa vòm / lối bếp mở
  if (roomId === 'garden') {
    w.doorManualOpen = true;
    q.push({ x: 0, z: 1.2 }, { x: 0, z: -0.8 }, { x: dest.x, z: dest.z });
  } else if (roomId === 'vip_room') {
    q.push({ x: -4.5, z: 5.5 }, { x: -6.8, z: 5.5 }, { x: dest.x, z: dest.z });
  } else if (roomId === 'tea_wc') {
    q.push({ x: 4.5, z: 5.5 }, { x: 6.8, z: 5.5 }, { x: dest.x, z: dest.z });
  } else if (roomId === 'kitchen') {
    q.push({ x: 3.6, z: 9.8 }, { x: 3.6, z: 12.4 }, { x: dest.x, z: dest.z });
  } else {
    q.push({ x: dest.x, z: dest.z });
  }
  p.waypoints = q;
  p.walking = true;
  w.desiredCamYaw = dest.camYaw;
  w.toastText = 'Đang dẫn chú Heo tới ' + dest.label + '...';
}

/* ==================== 2. KHỞI TẠO THẾ GIỚI 5 GIAN PHÒNG & FSM THỰC TẾ ==================== */
function createPhoTpsWorld() {
  var tables = [];
  var tid = 0;
  // 6 Bàn gỗ lim ở Sảnh Chính (3 bên trái X=-3.6, 3 bên phải X=+3.6)
  var mainZs = [2.2, 5.5, 8.8];
  for (var ri = 0; ri < mainZs.length; ri++) {
    var zt = mainZs[ri];
    var xs = [-3.6, 3.6];
    for (var ci = 0; ci < 2; ci++) {
      var xt = xs[ci];
      tables.push({
        id: tid++, room: 'main_hall', x: xt, z: zt,
        seats: [
          { x: xt, z: zt - 0.96, yaw: 0, occupant: null, bowl: 'none' },
          { x: xt, z: zt + 0.96, yaw: Math.PI, occupant: null, bowl: 'none' }
        ]
      });
    }
  }
  // 2 Bàn tiệc gỗ lim trong Gian Phòng VIP Cổ Kính (X = -8.8, Z = 2.6 & 8.4)
  var vipZs = [2.6, 8.4];
  for (var vi = 0; vi < vipZs.length; vi++) {
    tables.push({
      id: tid++, room: 'vip_room', x: -8.8, z: vipZs[vi],
      seats: [
        { x: -8.8, z: vipZs[vi] - 0.96, yaw: 0, occupant: null, bowl: 'none' },
        { x: -8.8, z: vipZs[vi] + 0.96, yaw: Math.PI, occupant: null, bowl: 'none' }
      ]
    });
  }
  // 2 Bàn gỗ ngoài Sân Vườn dưới đèn lồng (X = -3.8 & +3.8, Z = -2.6)
  tables.push({
    id: tid++, room: 'garden', x: -3.8, z: -2.6,
    seats: [
      { x: -3.8, z: -3.5, yaw: 0, occupant: null, bowl: 'none' },
      { x: -3.8, z: -1.7, yaw: Math.PI, occupant: null, bowl: 'none' }
    ]
  });
  tables.push({
    id: tid++, room: 'garden', x: 3.8, z: -2.6,
    seats: [
      { x: 3.8, z: -3.5, yaw: 0, occupant: null, bowl: 'none' },
      { x: 3.8, z: -1.7, yaw: Math.PI, occupant: null, bowl: 'none' }
    ]
  });

  // 2 Nhân viên phục vụ mặc áo cổ truyền xanh ô-liu & tạp dề đỏ
  var waiters = [
    { id: 0, x: -1.2, z: 9.8, yaw: Math.PI, role: 'waiter', shirt: '#6B7A4A', hair: '#2B2118', moving: false, carryBowl: null, task: null, phase: 0.2 },
    { id: 1, x: 1.4,  z: 9.8, yaw: Math.PI, role: 'waiter', shirt: '#6B7A4A', hair: '#3B2314', moving: false, carryBowl: null, task: null, phase: 1.7 }
  ];

  // Đầu bếp chính đứng trong Bếp Lửa Ninh Xương
  var chef = { x: -1.8, z: 13.8, yaw: Math.PI, role: 'chef', shirt: '#FFFFFF', hair: '#1E293B', moving: false, phase: 0 };

  // 6 Khách hàng NPC tự đẩy cửa ra vào, ngồi ăn ở Sảnh Chính & Phòng VIP
  var shirtCols = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#0EA5E9'];
  var hairCols = ['#2B2118', '#3B2314', '#1E293B', '#4A3222'];
  var customers = [];
  for (var k = 0; k < 6; k++) {
    var tIdx = k < 4 ? k : (6 + (k % 2));
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
        x: (k % 2 === 0 ? -2.4 : 2.4), z: -4.8, yaw: 0,
        seated: false, moving: false, phase: k * 1.1,
        state: 'OUTSIDE_WAIT', timer: 3 + k * 1.6, tableId: -1, seatIdx: -1
      });
    }
  }

  return {
    t: 0,
    doorOpen: 0,
    doorTarget: 0,
    doorManualOpen: false,
    desiredCamYaw: null,
    pig: {
      x: 0, z: -2.8, tx: 0, tz: -2.8,
      waypoints: [],
      yaw: 0, walking: false,
      seated: false, seatRef: null,
      eating: false, eatTimer: 0,
      orderState: 'none'
    },
    targetMarker: null,
    tables: tables,
    waiters: waiters,
    chef: chef,
    customers: customers,
    toastText: 'Chào mừng đến Phở Cổ Phố Hội! Bấm Tab trên hoặc chạm sàn để tham quan 5 gian phòng'
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
  nx = Math.max(-10.3, Math.min(10.3, nx));
  nz = Math.max(-5.2, Math.min(16.6, nz));
  var oldX = w.pig.x, oldZ = w.pig.z;

  // Tường mặt tiền tại Z = 0 (chỉ đi qua khoảng cửa gỗ 2 cánh X ∈ [-1.45, +1.45])
  if ((oldZ < 0 && nz >= -0.25) || (oldZ >= 0 && nz <= 0.25)) {
    if (Math.abs(nx) > 1.4) {
      nz = oldZ < 0 ? -0.3 : 0.3;
    } else if (w.doorOpen < 0.35) {
      w.doorManualOpen = true;
    }
  }
  // Vách ngăn Gian Phòng VIP (X = -6.4, mở cửa vòm tại Z ∈ [3.8, 7.2])
  if (nz > 0 && nz < 11.2 && ((oldX > -6.4 && nx <= -6.15) || (oldX <= -6.4 && nx >= -6.65))) {
    if (nz < 3.8 || nz > 7.2) nx = oldX > -6.4 ? -6.1 : -6.7;
  }
  // Vách ngăn Góc Trà Đạo & WC (X = +6.4, mở cửa vòm tại Z ∈ [3.8, 7.2])
  if (nz > 0 && nz < 11.2 && ((oldX < 6.4 && nx >= 6.15) || (oldX >= 6.4 && nx <= 6.65))) {
    if (nz < 3.8 || nz > 7.2) nx = oldX < 6.4 ? 6.1 : 6.7;
  }
  // Ranh giới khu Bếp Lửa (Z = 11.0): Quầy bếp chắn X < +1.8, lối đi mở rộng vào bếp tại X ∈ [+1.8, +6.0]
  if (nz > 10.6 && (nx < -6.2 || nx > 6.2)) {
    nz = 10.6;
  }
  if (nx < 1.8 && nz > 10.75 && nz < 12.1) {
    if (oldZ <= 10.9) nz = 10.75;
    else if (oldZ >= 12.0) nz = 12.1;
    else nx = 1.8;
  }
  return { x: nx, z: nz };
}

function stepPhoTpsWorld(w, dt, cam) {
  w.t += dt;

  // Xoay camera mượt về góc ngắm đẹp khi người dùng bấm Tab Gian Phòng
  if (w.desiredCamYaw !== null && cam) {
    var diff = normalizeAngle(w.desiredCamYaw - cam.yaw);
    if (Math.abs(diff) < 0.03) {
      cam.yaw = w.desiredCamYaw;
      w.desiredCamYaw = null;
    } else {
      cam.yaw = normalizeAngle(cam.yaw + diff * Math.min(1, dt * 4.2));
    }
  }

  // 1. Cửa gỗ-kính 2 cánh xoay bản lề 90°
  var someoneNearDoor = (Math.abs(w.pig.x) < 1.8 && Math.abs(w.pig.z) < 1.4);
  for (var ci = 0; ci < w.customers.length; ci++) {
    var cu = w.customers[ci];
    if (Math.abs(cu.x) < 1.6 && Math.abs(cu.z) < 1.35) { someoneNearDoor = true; break; }
  }
  w.doorTarget = (w.doorManualOpen || someoneNearDoor) ? 1 : 0;
  w.doorOpen += (w.doorTarget - w.doorOpen) * Math.min(1, dt * 6.5);

  // 2. Di chuyển Chú Heo theo Waypoints (khi bấm Tab phòng) hoặc Tap-to-Walk
  var p = w.pig;
  if (p.eating) {
    p.eatTimer -= dt;
    if (p.eatTimer <= 0) {
      p.eating = false;
      p.orderState = 'done';
      if (p.seatRef) p.seatRef.seat.bowl = 'empty';
      w.toastText = 'Heo ăn sạch tô Phở Cổ Phố Hội thơm lừng! Bấm Đứng dậy để tham quan các phòng khác nhé!';
    }
  } else if (!p.seated && p.walking) {
    if (p.waypoints && p.waypoints.length > 0) {
      var wp = p.waypoints[0];
      var wdx = wp.x - p.x, wdz = wp.z - p.z;
      var wdist = Math.hypot(wdx, wdz);
      if (wdist < 0.16) {
        p.x = wp.x; p.z = wp.z;
        p.waypoints.shift();
        if (p.waypoints.length === 0) {
          p.walking = false;
          var rm = detectCurrentPhoRoom(p.x, p.z);
          if (PHO_ROOM_DESTS[rm]) w.toastText = 'Chú Heo đã tới ' + PHO_ROOM_DESTS[rm].label + '!';
        }
      } else {
        var wstep = Math.min(wdist, 4.8 * dt);
        p.x += (wdx / wdist) * wstep;
        p.z += (wdz / wdist) * wstep;
        p.yaw = Math.atan2(wdx, wdz);
      }
    } else {
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
  }
  if (w.targetMarker) {
    w.targetMarker.ttl -= dt;
    if (w.targetMarker.ttl <= 0) w.targetMarker = null;
  }

  // 3. Đầu bếp hoạt động sống động sau quầy nguyên liệu & 2 nồi nước dùng
  w.chef.x = -1.8 + Math.sin(w.t * 0.9) * 1.4;
  w.chef.moving = Math.abs(Math.cos(w.t * 0.9)) > 0.3;

  // 4. FSM Khách hàng NPC ra vào cửa & ăn Phở thực tế 100%
  for (var i = 0; i < w.customers.length; i++) {
    var c = w.customers[i];
    if (c.state === 'OUTSIDE_WAIT') {
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
          c.state = 'WALK_TO_DOOR';
        } else c.timer = 3;
      }
    } else if (c.state === 'WALK_TO_DOOR') {
      if (moveTowards2D(c, 0, 1.0, 2.3, dt)) c.state = 'WALK_TO_SEAT';
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
      if (moveTowards2D(c, 0, 0.4, 2.3, dt)) c.state = 'LEAVE_OUTSIDE';
    } else if (c.state === 'LEAVE_OUTSIDE') {
      if (moveTowards2D(c, (i % 2 === 0 ? -2.8 : 2.8), -4.8, 2.3, dt)) {
        c.state = 'OUTSIDE_WAIT'; c.timer = 4 + Math.random() * 5;
      }
    }
  }

  // 5. FSM 2 Nhân viên phục vụ (Ưu tiên phục vụ Chú Heo -> Khách NPC -> Dọn tô rỗng)
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
      if (!wt.task) moveTowards2D(wt, wi === 0 ? -1.4 : 1.4, 9.8, 2.0, dt);
    } else {
      var tk = wt.task;
      var appX = tk.table.x > 0 ? tk.table.x - 1.3 : tk.table.x + 1.3;
      if (tk.type === 'PIG_ORDER') {
        if (tk.phase === 'TO_PIG') {
          if (moveTowards2D(wt, appX, tk.seat.z, 3.0, dt)) {
            w.toastText = 'Nhân viên: "Dạ 1 Phở Tái Nạm + trứng chần + quẩy nóng cho chú Heo ngay ạ!"';
            tk.phase = 'TO_KITCHEN';
          }
        } else if (tk.phase === 'TO_KITCHEN') {
          if (moveTowards2D(wt, -0.8, 10.4, 3.1, dt)) { wt.carryBowl = 'full'; tk.phase = 'DELIVER_PIG'; }
        } else if (tk.phase === 'DELIVER_PIG') {
          if (moveTowards2D(wt, appX, tk.seat.z, 3.0, dt)) {
            wt.carryBowl = null; tk.seat.bowl = 'full'; p.orderState = 'served';
            w.toastText = 'Tô Phở đầy thịt bò, hành ngò bốc khói đã ra bàn! Bấm Ăn Phở thôi!';
            wt.task = null;
          }
        }
      } else if (tk.type === 'SERVE_NPC') {
        if (tk.phase === 'TO_KITCHEN') {
          if (moveTowards2D(wt, -1.2, 10.4, 2.7, dt)) { wt.carryBowl = 'full'; tk.phase = 'TO_TABLE'; }
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
          if (moveTowards2D(wt, 3.6, 13.8, 2.6, dt)) { wt.carryBowl = null; wt.task = null; }
        }
      }
    }
  }
}

/* ==================== 3. TƯƠNG TÁC NGỮ CẢNH THÔNG MINH ==================== */
function getPhoContextAction(w) {
  var p = w.pig;
  if (p.seated) {
    if (p.orderState === 'none') return { id: 'order_pho', label: '🍜 Gọi Phở Tái Nạm Đặc Biệt', secondary: { id: 'stand_up', label: 'Đứng dậy' } };
    if (p.orderState === 'ordered') return { id: 'waiting_pho', label: '⏳ Phục vụ đang lấy Phở...', secondary: { id: 'stand_up', label: 'Đứng dậy' } };
    if (p.orderState === 'served') return { id: 'eat_pho', label: '🥢 Ăn Phở & Quẩy Nóng!', secondary: { id: 'stand_up', label: 'Đứng dậy' } };
    if (p.orderState === 'eating') return { id: 'eating_now', label: '😋 Heo đang xì xụp Phở...', secondary: null };
    return { id: 'stand_up', label: '🐷 Đứng dậy tham quan quán', secondary: null };
  }
  if (Math.abs(p.x) < 1.8 && Math.abs(p.z) < 1.8 && w.doorOpen < 0.5) {
    return { id: 'open_door', label: p.z < 0 ? '🚪 Mở cửa vào Phở Cổ Phố Hội' : '🚪 Mở cửa ra Sân Vườn', secondary: null };
  }
  if (p.z > 11.2 && Math.hypot(p.x - w.chef.x, p.z - w.chef.z) < 3.6) {
    return { id: 'watch_chef', label: '👨‍🍳 Xem Đầu bếp chần Phở & múc nước dùng', secondary: null };
  }
  if (p.x > 6.5 && p.z < 5.5) {
    return { id: 'sip_tea', label: '🍵 Rót trà ấm Bát Tràng & ăn Quẩy', secondary: null };
  }
  var bestSeat = null, bestD = 1.7;
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
  if (p.z < -4.2) return { id: 'exit_pho', label: '🏙️ Quay lại Đại Lộ Sài Gòn', secondary: null };
  return null;
}

function triggerPhoAction(w, actionId, seatRef) {
  var p = w.pig;
  if (actionId === 'open_door') {
    w.doorManualOpen = true; p.waypoints = []; p.walking = true;
    p.tx = 0; p.tz = p.z < 0 ? 1.8 : -2.2;
    w.toastText = p.z < 0 ? 'Bước vào Phở Cổ Phố Hội ấm cúng! Hương quế hồi thơm lừng!' : 'Ra lại Sân Vườn đèn lồng Phố Hội!';
  } else if (actionId === 'sit_seat' && seatRef) {
    p.seated = true; p.walking = false; p.waypoints = [];
    p.seatRef = seatRef; seatRef.seat.occupant = 'PIG';
    p.x = seatRef.seat.x; p.z = seatRef.seat.z; p.yaw = seatRef.seat.yaw;
    p.orderState = seatRef.seat.bowl === 'full' ? 'served' : 'none';
    w.toastText = 'Heo đã ngồi ghế gỗ đệm xanh rêu! Bấm Gọi Phở để thưởng thức nhé!';
  } else if (actionId === 'order_pho') {
    p.orderState = 'ordered';
    w.toastText = 'Heo gọi 1 tô Phở Tái Nạm đặc biệt! Nhân viên đang chạy tới bàn...';
  } else if (actionId === 'eat_pho') {
    p.orderState = 'eating'; p.eating = true; p.eatTimer = 4.5;
    w.toastText = 'Xì xụp! Nước dùng ngọt xương, thịt bò mềm, quẩy giòn rụm ngon tuyệt!';
  } else if (actionId === 'stand_up') {
    if (p.seatRef) {
      p.seatRef.seat.occupant = null;
      p.x = p.seatRef.table.x > 0 ? p.seatRef.table.x - 1.55 : p.seatRef.table.x + 1.55;
    }
    p.seated = false; p.eating = false; p.seatRef = null; p.orderState = 'none';
    w.toastText = 'Heo đứng dậy! Chọn 1 trong 5 Tab gian phòng ở trên để đi tham quan nhé!';
  } else if (actionId === 'watch_chef') {
    w.toastText = 'Đầu bếp: "Nồi nước dùng ninh xương ống 14 tiếng cùng hoa hồi, thảo quả, quế thanh!"';
  } else if (actionId === 'sip_tea') {
    w.toastText = 'Trà sen nóng rót từ ấm Bát Tràng men xanh thơm thanh mát quá!';
  }
}

/* ==================== 4. CHI TIẾT NGUYÊN LIỆU PHỞ VIỆT NAM & KIẾN TRÚC PHỐ HỘI 3D ==================== */
function drawPhoTableIngredients3D(ctx, cam, tb, t) {
  var tx = tb.x, tz = tb.z;
  // Mặt bàn gỗ lim nâu sẫm cổ truyền (dày dặn sang trọng giống Ảnh 4 & 5)
  drawBox3D(ctx, cam, tx, 0.70, tz, 1.72, 0.11, 1.12, { top: '#5C341D', front: '#3F2212', side: '#31190C' });
  // 4 Chân bàn gỗ chạm chắc chắn
  drawBox3D(ctx, cam, tx - 0.72, 0, tz - 0.44, 0.11, 0.70, 0.11, { top: '#4A2816', front: '#3B1E10', side: '#2B150A' });
  drawBox3D(ctx, cam, tx + 0.72, 0, tz - 0.44, 0.11, 0.70, 0.11, { top: '#4A2816', front: '#3B1E10', side: '#2B150A' });
  drawBox3D(ctx, cam, tx - 0.72, 0, tz + 0.44, 0.11, 0.70, 0.11, { top: '#4A2816', front: '#3B1E10', side: '#2B150A' });
  drawBox3D(ctx, cam, tx + 0.72, 0, tz + 0.44, 0.11, 0.70, 0.11, { top: '#4A2816', front: '#3B1E10', side: '#2B150A' });

  // 1. Ấm trà sứ Bát Tràng men xanh-trắng đặt giữa bàn (Ảnh 8)
  drawBox3D(ctx, cam, tx + 0.48, 0.81, tz - 0.08, 0.22, 0.22, 0.22, { top: '#FFFFFF', front: '#DBEAFE', side: '#1D4ED8' });
  drawBox3D(ctx, cam, tx + 0.48, 1.02, tz - 0.08, 0.12, 0.05, 0.12, { top: '#1D4ED8', front: '#1E40AF', side: '#1E3A8A' });
  // 2. Rổ gia vị nhựa đỏ đựng tương ớt + nước tương nắp vàng + giấm tỏi ớt ngâm hồng (Ảnh 8)
  drawBox3D(ctx, cam, tx - 0.56, 0.81, tz, 0.30, 0.11, 0.28, { top: '#EF4444', front: '#DC2626', side: '#B91C1C' });
  drawBox3D(ctx, cam, tx - 0.62, 0.90, tz - 0.05, 0.09, 0.22, 0.09, { top: '#FACC15', front: '#3B1D0A', side: '#2B1508' }); // Chai nước tương
  drawBox3D(ctx, cam, tx - 0.50, 0.90, tz + 0.05, 0.11, 0.14, 0.11, { top: '#FBCFE8', front: '#F472B6', side: '#EC4899' }); // Hũ giấm tỏi ớt
  // 3. Dĩa giá đỗ + rau thơm + chanh & Dĩa quẩy nóng vàng giòn
  drawBox3D(ctx, cam, tx + 0.05, 0.81, tz, 0.28, 0.05, 0.24, { top: '#4ADE80', front: '#F8FAFC', side: '#CBD5E1' }); // Dĩa rau giá xanh
  drawBox3D(ctx, cam, tx + 0.46, 0.81, tz + 0.28, 0.26, 0.07, 0.20, { top: '#D98A36', front: '#F8FAFC', side: '#CBD5E1' }); // Dĩa quẩy nóng

  // 4. Tô Phở đầy thịt bò tái-hành ngò & chén trứng chần cho từng ghế!
  for (var bi = 0; bi < 2; bi++) {
    var bState = tb.seats[bi].bowl;
    if (bState !== 'none') {
      var bz = tz + (bi === 0 ? -0.32 : 0.32);
      drawBox3D(ctx, cam, tx - 0.14, 0.81, bz, 0.38, 0.17, 0.38, {
        top: bState === 'full' ? '#E6A825' : '#E2E8F0',
        front: '#FFFFFF', side: '#CBD5E1'
      });
      if (bState === 'full') {
        // Lát thịt bò tái hồng & hành ngò xanh rắc nổi trên mặt tô Phở!
        drawBox3D(ctx, cam, tx - 0.19, 0.98, bz, 0.14, 0.03, 0.12, { top: '#D47C7C', front: '#B85D5D', side: '#994747', stroke: '#994747' });
        drawBox3D(ctx, cam, tx - 0.08, 0.98, bz, 0.14, 0.03, 0.12, { top: '#2E7D32', front: '#1B5E20', side: '#1B5E20', stroke: '#1B5E20' });
        // Chén trứng chần nhỏ bên cạnh tô Phở
        drawBox3D(ctx, cam, tx + 0.18, 0.81, bz, 0.16, 0.10, 0.16, { top: '#FEF3C7', front: '#FFFFFF', side: '#E2E8F0' });
        // Khói nóng 3D bốc lên từ tô Phở
        var stp = projectPoint3D(cam, tx - 0.14, 1.12 + ((t * 0.9 + bi * 0.5) % 0.4), bz);
        if (stp) {
          ctx.save(); ctx.globalAlpha = 0.52; ctx.fillStyle = '#FFFDF7';
          ctx.fillRect(Math.round(stp.sx - 2), Math.round(stp.sy - 2), 4, 4);
          ctx.restore();
        }
      }
    }
  }
}

function drawHeritageChair3D(ctx, cam, se) {
  // Ghế gỗ lim tựa mây đệm xanh rêu cổ truyền (Ảnh 4)
  drawBox3D(ctx, cam, se.x, 0, se.z, 0.56, 0.46, 0.56, { top: '#6B7A4A', front: '#4A2C1A', side: '#3B2314' });
  // Tựa lưng ghế gỗ lim phía sau
  var backZ = se.z + (se.yaw === 0 ? -0.24 : 0.24);
  drawBox3D(ctx, cam, se.x, 0.46, backZ, 0.56, 0.52, 0.08, { top: '#5C341D', front: '#4A2C1A', side: '#3B2314' });
}

function renderPhoTps3D(ctx, cam, w) {
  var vw = cam.vw, vh = cam.vh;
  var isIndoors = w.pig.z >= -0.15;

  // 1. NỀN TRẦN KÍN 100% KHI Ở TRONG NHÀ (CHỮA DỨT ĐIỂM LỘ BẦU TRỜI!) — CHỈ HIỆN TRỜI KHI Ở SÂN VƯỜN
  if (isIndoors) {
    ctx.fillStyle = '#E8D8B8'; // Trần kem ấm Phố Hội (tuyệt đối không lộ bầu trời xanh!)
    ctx.fillRect(0, 0, vw, Math.round(vh * 0.55));
    ctx.fillStyle = '#6E655B';
    ctx.fillRect(0, Math.round(vh * 0.55), vw, vh);
  } else {
    var skyGrad = ctx.createLinearGradient(0, 0, 0, Math.round(vh * 0.55));
    skyGrad.addColorStop(0, '#6BB6F4');
    skyGrad.addColorStop(1, '#CFE8FF');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, vw, Math.round(vh * 0.55));
    ctx.fillStyle = '#C9B89A';
    ctx.fillRect(0, Math.round(vh * 0.55), vw, vh);
  }

  // 2. SÀN GẠCH BÔNG INDOCHINE 5 GIAN PHÒNG PHỐI CẢNH 3D (Ảnh 4: Ô kem + xám trầm + hoa văn xanh ngọc)
  for (var gz = -5.5; gz < 17.0; gz += 1.6) {
    for (var gx = -10.8; gx < 10.8; gx += 1.6) {
      var isGarden = gz < 0;
      var isKitchen = gz >= 11.0;
      var isVip = !isGarden && !isKitchen && gx < -6.4;
      var isTeaWc = !isGarden && !isKitchen && gx >= 6.4;
      var chk = ((Math.floor(gx + 20) + Math.floor(gz + 20)) % 2 === 0);
      var col = isGarden ? (chk ? '#CFC3AF' : '#C2B49D')
        : isKitchen ? (chk ? '#CBD5E1' : '#DCE4EE')
        : isVip ? (chk ? '#E6D6BC' : '#D4BF9E')
        : isTeaWc ? (gz > 6.0 ? (chk ? '#E2E8F0' : '#F1F5F9') : (chk ? '#E5D3B3' : '#D6C09B'))
        : (chk ? '#F4EBDA' : '#DDD0B6');
      drawPoly3D(ctx, cam, [[gx,0,gz],[gx+1.6,0,gz],[gx+1.6,0,gz+1.6],[gx,0,gz+1.6]], col, 'rgba(74,44,26,0.12)', 1);
      // Ô hoa văn men xanh ngọc ở giao điểm sàn Sảnh Chính (Ảnh 4)
      if (!isGarden && !isKitchen && !isTeaWc && chk) {
        drawPoly3D(ctx, cam, [[gx+0.65,0.01,gz+0.65],[gx+0.95,0.01,gz+0.65],[gx+0.95,0.01,gz+0.95],[gx+0.65,0.01,gz+0.95]], '#2F6F5B', null, 0);
      }
    }
  }

  // Vòng sáng mục tiêu 3D khi Tap-to-Walk
  if (w.targetMarker) {
    var tm = w.targetMarker;
    var r = 0.25 + (1 - tm.ttl) * 0.18;
    drawPoly3D(ctx, cam, [
      [tm.x - r, 0.02, tm.z], [tm.x, 0.02, tm.z - r],
      [tm.x + r, 0.02, tm.z], [tm.x, 0.02, tm.z + r]
    ], 'rgba(244,185,59,0.52)', '#F4B93B', 1.5);
  }

  // 3. TRẦN NHÀ GỖ LIM KÍN 100% + HỆ XÀ GỒ NÂU SẪM PHỐI CẢNH 3D (Y = 3.85m, Z: 0..17.2)
  if (isIndoors) {
    drawPoly3D(ctx, cam, [[-11,3.85,0],[11,3.85,0],[11,3.85,17.2],[-11,3.85,17.2]], '#F5EAD3', '#4A2C1A', 1);
    // Xà gồ gỗ lim chạy ngang theo chiều sâu Z
    for (var bz = 0.2; bz <= 17.0; bz += 2.8) {
      drawPoly3D(ctx, cam, [[-11,3.62,bz],[11,3.62,bz],[11,3.85,bz],[-11,3.85,bz]], '#4A2C1A', '#2B180E', 1);
    }
    // Xà gồ dọc 2 hàng cột Sảnh Chính
    drawPoly3D(ctx, cam, [[-6.4,3.55,0],[-6.4,3.55,11],[-6.4,3.85,11],[-6.4,3.85,0]], '#3B2314', '#2B180E', 1);
    drawPoly3D(ctx, cam, [[6.4,3.55,11],[6.4,3.55,0],[6.4,3.85,0],[6.4,3.85,11]], '#3B2314', '#2B180E', 1);
  }

  // 4. TƯỜNG BAO NGOÀI 5 GIAN PHÒNG (Tường gạch nung trần VIP & Trà Đạo + Tường vàng Hội An Sảnh Chính & Bếp)
  // Tường ngoài trái Phòng VIP (X = -11, tường gạch nung trần ấm áp)
  drawPoly3D(ctx, cam, [[-11,0,0],[-11,0,11.2],[-11,3.85,11.2],[-11,3.85,0]], '#A65432', '#3B2314', 1);
  // Tường ngoài phải Góc Trà Đạo & WC (X = +11)
  drawPoly3D(ctx, cam, [[11,0,11.2],[11,0,0],[11,3.85,0],[11,3.85,11.2]], '#B55B34', '#3B2314', 1);
  // Tường hậu Phòng VIP & WC (Z = 11.2)
  drawPoly3D(ctx, cam, [[-11,0,11.2],[-6.4,0,11.2],[-6.4,3.85,11.2],[-11,3.85,11.2]], '#D99B26', '#3B2314', 1);
  drawPoly3D(ctx, cam, [[6.4,0,11.2],[11,0,11.2],[11,3.85,11.2],[6.4,3.85,11.2]], '#E2E8F0', '#3B2314', 1);
  // Tường bao khu Bếp Lửa (X = -6.4 & +6.4, Z: 11.2..17.2) + Tường hậu Bếp (Z = 17.2)
  drawPoly3D(ctx, cam, [[-6.4,0,11.2],[-6.4,0,17.2],[-6.4,3.85,17.2],[-6.4,3.85,11.2]], '#E6B34B', '#3B2314', 1);
  drawPoly3D(ctx, cam, [[6.4,0,17.2],[6.4,0,11.2],[6.4,3.85,11.2],[6.4,3.85,17.2]], '#E6B34B', '#3B2314', 1);
  drawPoly3D(ctx, cam, [[-6.4,0,17.2],[6.4,0,17.2],[6.4,3.85,17.2],[-6.4,3.85,17.2]], '#DFAA3E', '#3B2314', 1);
  // Bảng thực đơn gỗ sơn son thếp vàng sau bếp & 3 Quạt treo tường quay 60fps
  drawPoly3D(ctx, cam, [[-3.8,2.1,17.1],[1.4,2.1,17.1],[1.4,3.1,17.1],[-3.8,3.1,17.1]], '#991B1B', '#F4B93B', 1.8);
  var fanXs = [-4.2, 0.0, 4.2];
  for (var fi = 0; fi < fanXs.length; fi++) {
    var fp = projectPoint3D(cam, fanXs[fi], 3.15, 17.0);
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
  // Tranh phố cổ đen-trắng đóng khung gỗ trên tường VIP & Sảnh Chính (Ảnh 5)
  drawPoly3D(ctx, cam, [[-10.92,1.5,3.2],[-10.92,1.5,5.0],[-10.92,2.7,5.0],[-10.92,2.7,3.2]], '#F8FAFC', '#3B2314', 2);
  drawPoly3D(ctx, cam, [[-10.92,1.5,6.4],[-10.92,1.5,8.2],[-10.92,2.7,8.2],[-10.92,2.7,6.4]], '#F8FAFC', '#3B2314', 2);

  // 5. THU THẬP TOÀN BỘ VẬT THỂ 3D ĐỂ Z-SORT (PAINTER'S ALGORITHM CHUẨN 3D!)
  var drawList = [];
  function pushItem(wx, wz, fn) {
    var cp = worldToCam(cam, wx, 0.7, wz);
    drawList.push({ cz: cp.cz, fn: fn });
  }

  // Hàng rào gạch nung + Gạch bông gió xanh ngọc mặt tiền Sân Vườn (Ảnh 6, Z = -5.4)
  pushItem(-4.0, -5.4, function() {
    drawBox3D(ctx, cam, -5.2, 0, -5.4, 6.2, 0.95, 0.35, { top: '#C45B37', front: '#A64626', side: '#8A361A' });
    drawBox3D(ctx, cam, -4.0, 0.35, -5.4, 0.65, 0.42, 0.38, { top: '#3B7A57', front: '#2F6F5B', side: '#1E4D3B' });
    drawBox3D(ctx, cam, -6.4, 0.35, -5.4, 0.65, 0.42, 0.38, { top: '#3B7A57', front: '#2F6F5B', side: '#1E4D3B' });
  });
  pushItem(4.0, -5.4, function() {
    drawBox3D(ctx, cam, 5.2, 0, -5.4, 6.2, 0.95, 0.35, { top: '#C45B37', front: '#A64626', side: '#8A361A' });
    drawBox3D(ctx, cam, 4.0, 0.35, -5.4, 0.65, 0.42, 0.38, { top: '#3B7A57', front: '#2F6F5B', side: '#1E4D3B' });
    drawBox3D(ctx, cam, 6.4, 0.35, -5.4, 0.65, 0.42, 0.38, { top: '#3B7A57', front: '#2F6F5B', side: '#1E4D3B' });
  });

  // Mặt tiền Phố Hội vàng nghệ + Mái ngói đỏ + Vòm hoa giấy hồng + Biển PHỞ CỔ PHỐ HỘI (Z = 0)
  pushItem(-5.6, 0, function() {
    drawPoly3D(ctx, cam, [[-11,0,0],[-1.5,0,0],[-1.5,3.85,0],[-11,3.85,0]], '#D99B26', '#3B2314', 1.2);
    drawPoly3D(ctx, cam, [[-11,3.85,0],[-1.5,3.85,0],[-1.5,4.65,-0.5],[-11,4.65,-0.5]], '#B83224', '#3B2314', 1); // Mái ngói đỏ
    drawPoly3D(ctx, cam, [[-5.2,0.85,-0.04],[-2.2,0.85,-0.04],[-2.2,2.4,-0.04],[-5.2,2.4,-0.04]], 'rgba(255,243,196,0.65)', '#4A2C1A', 1.6);
  });
  pushItem(5.6, 0, function() {
    drawPoly3D(ctx, cam, [[1.5,0,0],[11,0,0],[11,3.85,0],[1.5,3.85,0]], '#D99B26', '#3B2314', 1.2);
    drawPoly3D(ctx, cam, [[1.5,3.85,0],[11,3.85,0],[11,4.65,-0.5],[1.5,4.65,-0.5]], '#B83224', '#3B2314', 1);
    drawPoly3D(ctx, cam, [[2.2,0.85,-0.04],[5.2,0.85,-0.04],[5.2,2.4,-0.04],[2.2,2.4,-0.04]], 'rgba(255,243,196,0.65)', '#4A2C1A', 1.6);
  });
  // Biển gỗ cổ điển PHỞ CỔ PHỐ HỘI + Giàn dây leo hoa giấy hồng phủ vòm cửa (Ảnh 6 & 7)
  pushItem(0, -0.06, function() {
    drawPoly3D(ctx, cam, [[-2.7,2.6,-0.06],[2.7,2.6,-0.06],[2.7,3.55,-0.06],[-2.7,3.55,-0.06]], '#4A2C1A', '#F4B93B', 1.6);
    drawBox3D(ctx, cam, 0, 3.5, -0.15, 5.2, 0.42, 0.35, { top: '#2E7D32', front: '#388E3C', side: '#1B5E20' }); // Giàn dây leo xanh
    drawBox3D(ctx, cam, -1.6, 3.65, -0.22, 0.6, 0.25, 0.25, { top: '#EC4899', front: '#F472B6', side: '#DB2777' }); // Hoa giấy hồng
    drawBox3D(ctx, cam, 1.5, 3.65, -0.22, 0.6, 0.25, 0.25, { top: '#EC4899', front: '#F472B6', side: '#DB2777' });
    var signP = projectPoint3D(cam, 0, 3.08, -0.09);
    if (signP && signP.cz > 0.5 && signP.cz < 16) {
      ctx.save();
      ctx.font = 'bold ' + Math.max(7, Math.min(18, Math.round(signP.scale * 0.26))) + 'px monospace';
      ctx.fillStyle = '#FACC15'; ctx.textAlign = 'center';
      ctx.fillText('PHỞ CỔ PHỐ HỘI', signP.sx, signP.sy + 3);
      ctx.restore();
    }
  });

  // Cửa gỗ-kính 2 cánh xoay bản lề 90° (Z = 0, X: -1.45..+1.45)
  var doorAng = w.doorOpen * 1.52;
  pushItem(-0.75, 0.1, function() {
    var lx = -1.45 + Math.cos(doorAng) * 1.42;
    var lz = Math.sin(doorAng) * 1.42;
    drawPoly3D(ctx, cam, [[-1.45,0,0],[lx,0,lz],[lx,2.52,lz],[-1.45,2.52,0]], '#5C341D', '#2B180E', 1.4);
    drawPoly3D(ctx, cam, [[-1.30,0.85,0.02],[lx - Math.cos(doorAng)*0.12,0.85,lz - Math.sin(doorAng)*0.12],[lx - Math.cos(doorAng)*0.12,2.30,lz - Math.sin(doorAng)*0.12],[-1.30,2.30,0.02]], 'rgba(255,243,196,0.52)', '#3B2314', 1);
  });
  pushItem(0.75, 0.1, function() {
    var rx = 1.45 - Math.cos(doorAng) * 1.42;
    var rz = Math.sin(doorAng) * 1.42;
    drawPoly3D(ctx, cam, [[1.45,0,0],[rx,0,rz],[rx,2.52,rz],[1.45,2.52,0]], '#5C341D', '#2B180E', 1.4);
    drawPoly3D(ctx, cam, [[1.30,0.85,0.02],[rx + Math.cos(doorAng)*0.12,0.85,rz - Math.sin(doorAng)*0.12],[rx + Math.cos(doorAng)*0.12,2.30,rz - Math.sin(doorAng)*0.12],[1.30,2.30,0.02]], 'rgba(255,243,196,0.52)', '#3B2314', 1);
  });

  // Vách ngăn & Cửa vòm gỗ chạm ngăn cách Sảnh Chính <-> Phòng VIP (X=-6.4) & Sảnh Chính <-> Trà Đạo/WC (X=+6.4)
  var divXs = [-6.4, 6.4];
  for (var di2 = 0; di2 < 2; di2++) {
    (function(dxWall) {
      pushItem(dxWall, 1.9, function() {
        drawBox3D(ctx, cam, dxWall, 0, 1.9, 0.28, 3.85, 3.8, { top: '#4A2C1A', front: '#D99B26', side: '#C98C1E' });
        drawLanternGlow3D(ctx, cam, dxWall + (dxWall < 0 ? 0.35 : -0.35), 2.55, 3.4, '#FFF3C4', '#FFE08A', 0.22);
      });
      pushItem(dxWall, 9.1, function() {
        drawBox3D(ctx, cam, dxWall, 0, 9.1, 0.28, 3.85, 3.8, { top: '#4A2C1A', front: '#D99B26', side: '#C98C1E' });
        drawLanternGlow3D(ctx, cam, dxWall + (dxWall < 0 ? 0.35 : -0.35), 2.55, 7.6, '#FFF3C4', '#FFE08A', 0.22);
      });
      // Khung vòm gỗ lim con tiện bắc ngang trên cửa vòm thông phòng (Z: 3.8..7.2, Y: 2.85..3.85)
      pushItem(dxWall, 5.5, function() {
        drawBox3D(ctx, cam, dxWall, 2.85, 5.5, 0.34, 0.95, 3.4, { top: '#4A2C1A', front: '#5C341D', side: '#3B2314' });
      });
    })(divXs[di2]);
  }

  // BÌNH PHONG SONG GỖ CHẠM GIỮA SẢNH CHÍNH (Ảnh 4 — X: 0, Z: 5.5) + Chậu cây xanh
  pushItem(0, 5.5, function() {
    drawBox3D(ctx, cam, 0, 0, 5.5, 1.9, 2.75, 0.16, { top: '#4A2C1A', front: '#5C341D', side: '#3B2314' });
    for (var bx = -0.75; bx <= 0.75; bx += 0.3) {
      drawBox3D(ctx, cam, bx, 0.2, 5.5, 0.08, 2.35, 0.18, { top: '#2B180E', front: '#3B2314', side: '#2B180E' });
    }
  });
  // Dây đèn lồng lụa nhiều màu ngoài Sân Vườn + Đèn thả mây tre trong Phòng VIP & Sảnh Chính
  var lanternList = [
    [-2.6, 2.9, -1.6, '#E0452B'], [-1.2, 3.0, -1.9, '#FACC15'], [1.2, 3.0, -1.9, '#38BDF8'], [2.6, 2.9, -1.6, '#EC4899'],
    [-3.6, 3.0, 2.2, '#FFF3C4'], [3.6, 3.0, 2.2, '#FFF3C4'], [-3.6, 3.0, 8.8, '#FFF3C4'], [3.6, 3.0, 8.8, '#FFF3C4'],
    [-8.8, 2.9, 2.6, '#D9A05B'], [-8.8, 2.9, 8.4, '#D9A05B'], [8.8, 2.9, 2.8, '#FFF3C4']
  ];
  for (var li = 0; li < lanternList.length; li++) {
    (function(lt) {
      pushItem(lt[0], lt[2], function() { drawLanternGlow3D(ctx, cam, lt[0], lt[1], lt[2], lt[3], '#FFE49E', 0.22); });
    })(lanternList[li]);
  }

  // GÓC TRÀ ĐẠO BÁT TRÀNG (X: +8.8, Z: 2.8) & PHÒNG VỆ SINH CỔ TRUYỀN (X: +8.8, Z: 8.8)
  pushItem(8.8, 2.8, function() {
    drawBox3D(ctx, cam, 8.8, 0, 2.8, 1.8, 0.58, 1.3, { top: '#5C341D', front: '#3B2314', side: '#2B180E' }); // Sập trà gỗ lim
    drawBox3D(ctx, cam, 8.8, 0.58, 2.8, 0.30, 0.26, 0.30, { top: '#FFFFFF', front: '#DBEAFE', side: '#1D4ED8' }); // Ấm trà Bát Tràng lớn
    drawBox3D(ctx, cam, 8.3, 0.58, 2.6, 0.32, 0.08, 0.24, { top: '#D98A36', front: '#F8FAFC', side: '#CBD5E1' }); // Đĩa quẩy nóng
  });
  pushItem(8.8, 8.6, function() {
    // Vách ngăn WC + 2 buồng gỗ lam + bồn rửa tay gốm sứ & gương gỗ
    drawBox3D(ctx, cam, 8.8, 0, 6.4, 4.2, 2.6, 0.16, { top: '#4A2C1A', front: '#E2E8F0', side: '#CBD5E1' });
    drawBox3D(ctx, cam, 10.1, 0, 8.8, 1.4, 2.4, 1.3, { top: '#4A2C1A', front: '#6E452A', side: '#4A2C1A' }); // Buồng WC 1
    drawBox3D(ctx, cam, 10.1, 0, 10.2, 1.4, 2.4, 1.2, { top: '#4A2C1A', front: '#6E452A', side: '#4A2C1A' }); // Buồng WC 2
    drawBox3D(ctx, cam, 7.6, 0, 9.4, 0.85, 0.85, 1.6, { top: '#FFFFFF', front: '#CBD5E1', side: '#94A3B8' }); // Bồn rửa tay gốm sứ
  });

  // QUẦY BẾP LỬA NINH XƯƠNG & TỦ KÍNH NGUYÊN LIỆU CHI TIẾT (Z: 11.4, X: -6.0..+1.7)
  pushItem(-2.1, 11.4, function() {
    drawBox3D(ctx, cam, -2.1, 0, 11.4, 7.6, 0.96, 1.1, { top: '#E2E8F0', front: '#5C341D', side: '#4A2C1A' });
    // Tủ kính trưng bày nguyên liệu Phở: Thịt bò tái đỏ, gầu vàng, bánh phở trắng, rổ hành ngò xanh!
    drawBox3D(ctx, cam, -4.4, 0.96, 11.4, 2.1, 1.05, 0.82, { top: '#BAE6FD', front: 'rgba(186,230,253,0.42)', side: 'rgba(147,197,253,0.48)' });
    drawBox3D(ctx, cam, -5.0, 1.04, 11.4, 0.45, 0.35, 0.45, { top: '#DC2626', front: '#B91C1C', side: '#991B1B' }); // Thịt bò tái đỏ tươi
    drawBox3D(ctx, cam, -4.4, 1.04, 11.4, 0.45, 0.30, 0.45, { top: '#FFFDF7', front: '#F1F5F9', side: '#CBD5E1' }); // Bánh phở trắng mềm
    drawBox3D(ctx, cam, -3.8, 1.04, 11.4, 0.45, 0.28, 0.45, { top: '#22C55E', front: '#16A34A', side: '#15803D' }); // Hành lá & ngò gai
    // 2 Nồi nước dùng Phở inox khổng lồ sôi sùng sục bốc khói 3D!
    var pots = [-1.8, -0.2];
    for (var pi = 0; pi < 2; pi++) {
      drawBox3D(ctx, cam, pots[pi], 0.96, 11.4, 0.92, 0.74, 0.92, { top: '#D97706', front: '#94A3B8', side: '#64748B' });
      var sp = projectPoint3D(cam, pots[pi], 1.95 + ((w.t * 0.75 + pi * 0.5) % 0.75), 11.4);
      if (sp) {
        ctx.save(); ctx.globalAlpha = 0.48; ctx.fillStyle = '#FFFDF7';
        ctx.beginPath(); ctx.arc(sp.sx, sp.sy, Math.max(3, sp.scale * 0.16), 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
  });
  // Bồn rửa chén inox hậu trường bếp (X: 4.4, Z: 15.8)
  pushItem(4.4, 15.8, function() {
    drawBox3D(ctx, cam, 4.4, 0, 15.8, 2.4, 0.88, 0.95, { top: '#93C5FD', front: '#CBD5E1', side: '#94A3B8' });
  });

  // 10 BÀN GỖ LIM + 20 GHẾ ĐỆM XANH RÊU + NGUYÊN LIỆU PHỞ CHI TIẾT
  for (var ti = 0; ti < w.tables.length; ti++) {
    (function(tb) {
      for (var si = 0; si < 2; si++) {
        (function(se) {
          pushItem(se.x, se.z, function() { drawHeritageChair3D(ctx, cam, se); });
        })(tb.seats[si]);
      }
      pushItem(tb.x, tb.z, function() { drawPhoTableIngredients3D(ctx, cam, tb, w.t); });
    })(w.tables[ti]);
  }

  // ĐẦU BẾP, 2 NHÂN VIÊN PHỤC VỤ, 6 KHÁCH HÀNG NPC & CHÚ HEO MASCOT BO TRÒN
  pushItem(w.chef.x, w.chef.z, function() { drawHumanTps3D(ctx, cam, w.chef, w.t); });
  for (var wi = 0; wi < w.waiters.length; wi++) {
    (function(wt) { pushItem(wt.x, wt.z, function() { drawHumanTps3D(ctx, cam, wt, w.t); }); })(w.waiters[wi]);
  }
  for (var ki = 0; ki < w.customers.length; ki++) {
    (function(cu) { pushItem(cu.x, cu.z, function() { drawHumanTps3D(ctx, cam, cu, w.t); }); })(w.customers[ki]);
  }
  pushItem(w.pig.x, w.pig.z, function() { drawPigTps3D(ctx, cam, w.pig, w.t); });

  drawList.sort(function(a, b) { return b.cz - a.cz; });
  for (var di = 0; di < drawList.length; di++) {
    if (drawList[di].cz > -1.2) drawList[di].fn();
  }
}
`;
}
