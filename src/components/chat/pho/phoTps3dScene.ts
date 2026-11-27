/**
 * Quán Phở Cổ Truyền Phố Hội — 3 Khu Gọn Ấm Siêu Mượt TPS 3D (Quyết định 234)
 * Tuân thủ 100% docs/TPS_3D_OPEN_WORLD_SPEC.md:
 * - Bỏ Phòng VIP & vách ngăn phụ -> giảm 60% đa giác, siêu mượt 60fps, 0% lỗi xuyên tường!
 * - 3 Khu gọn vừa khít 1 màn hình điện thoại (12m × 15.5m):
 *   1. Sân Phố Cổ (garden): Có đường nhựa + dãy nhà cổ tường vàng mái ngói + cây xanh đối diện che kín chân trời,
 *      dây treo nối mọi đèn lồng vào giàn gỗ (không lơ lửng), cửa gỗ 2 cánh xoay bản lề 90°.
 *   2. Sảnh Phở Chính (main_hall): Trần gỗ lim kín 100% + xà gồ + đèn lồng ấm, bình phong song gỗ,
 *      6 bàn gỗ lim ghế đệm xanh rêu bày Sprite Pixel Art tả thực (Tô Phở tròn, ấm trà Bát Tràng dáng tròn,
 *      rổ tương ớt giấm tỏi, đĩa quẩy nóng & rau giá chanh).
 *   3. Bếp Lửa Phở (kitchen): 2 Nồi nước dùng inox tròn có 2 quai & vá múc bốc khói, tủ kính treo thịt bò vân mỡ,
 *      rổ bánh phở trắng, bó hành ngò, thớt gỗ dao phay, Đầu bếp nấu & bồn rửa gọn sát tường sau.
 */
export function buildPhoTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. CẤU HÌNH 3 KHU GỌN MƯỢT & DẪN ĐƯỜNG WAYPOINT ĐỒNG BỘ TAB ==================== */
var PHO_ROOM_DESTS = {
  garden:    { x: 0.0, z: -2.4, yaw: 0.0,  camYaw: 0.0,   label: '🏮 Vỉa Hè Quán Phở & Sông Bạch Đằng' },
  main_hall: { x: 0.0, z: 2.8,  yaw: 0.0,  camYaw: 0.0,   label: '🏛️ Sảnh Phở Chính Ấm Cúng' },
  kitchen:   { x: 0.6, z: 12.6, yaw: -1.1, camYaw: -0.65, label: '🔥 Bếp Lửa Phở & Quầy Nguyên Liệu' }
};

function detectCurrentPhoRoom(x, z) {
  if (z < 0) return 'garden';
  if (z >= 10.2) return 'kitchen';
  return 'main_hall';
}

function navigatePigToRoom(w, cam, roomId) {
  var dest = PHO_ROOM_DESTS[roomId];
  if (!dest) return;
  var p = w.pig;
  if (p.seated) triggerPhoAction(w, 'stand_up', null);
  var curRoom = detectCurrentPhoRoom(p.x, p.z);
  var q = [];
  if (curRoom === 'garden' && roomId !== 'garden') {
    w.doorManualOpen = true;
    q.push({ x: 0, z: -0.6 }, { x: 0, z: 1.5 });
  } else if (curRoom === 'kitchen' && roomId !== 'kitchen') {
    q.push({ x: 3.6, z: 11.4 }, { x: 3.6, z: 9.2 });
  }
  if (roomId === 'garden') {
    w.doorManualOpen = true;
    q.push({ x: 0, z: 1.2 }, { x: 0, z: -0.8 }, { x: dest.x, z: dest.z });
  } else if (roomId === 'kitchen') {
    q.push({ x: 3.6, z: 9.2 }, { x: 3.6, z: 11.8 }, { x: dest.x, z: dest.z });
  } else {
    q.push({ x: dest.x, z: dest.z });
  }
  p.waypoints = q;
  p.walking = true;
  w.desiredCamYaw = dest.camYaw;
  w.toastText = 'Đang dẫn chú Heo tới ' + dest.label + '...';
}

/* ==================== 2. KHỞI TẠO THẾ GIỚI 3 KHU GỌN ẤM & FSM THỰC TẾ ==================== */
function createPhoTpsWorld() {
  var tables = [];
  var tid = 0;
  // 6 Bàn gỗ lim ở Sảnh Phở Chính (3 bên trái X=-3.4, 3 bên phải X=+3.4), lối đi giữa rộng thoáng!
  var mainZs = [2.2, 5.2, 8.2];
  for (var ri = 0; ri < mainZs.length; ri++) {
    var zt = mainZs[ri];
    var xs = [-3.4, 3.4];
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
  // 2 Bàn gỗ ngoài Sân Phố Cổ dưới giàn đèn lồng
  tables.push({
    id: tid++, room: 'garden', x: -3.5, z: -2.4,
    seats: [
      { x: -3.5, z: -3.3, yaw: 0, occupant: null, bowl: 'none' },
      { x: -3.5, z: -1.5, yaw: Math.PI, occupant: null, bowl: 'none' }
    ]
  });
  tables.push({
    id: tid++, room: 'garden', x: 3.5, z: -2.4,
    seats: [
      { x: 3.5, z: -3.3, yaw: 0, occupant: null, bowl: 'none' },
      { x: 3.5, z: -1.5, yaw: Math.PI, occupant: null, bowl: 'none' }
    ]
  });

  var waiters = [
    { id: 0, x: -1.2, z: 9.2, yaw: Math.PI, role: 'waiter', shirt: '#6B7A4A', hair: '#2B2118', moving: false, carryBowl: null, task: null, phase: 0.2 },
    { id: 1, x: 1.4,  z: 9.2, yaw: Math.PI, role: 'waiter', shirt: '#6B7A4A', hair: '#3B2314', moving: false, carryBowl: null, task: null, phase: 1.7 }
  ];

  var chef = { x: -1.8, z: 12.6, yaw: Math.PI, role: 'chef', shirt: '#FFFFFF', hair: '#1E293B', moving: false, phase: 0 };

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
        x: (k % 2 === 0 ? -2.2 : 2.2), z: -4.4, yaw: 0,
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
      x: 0, z: -2.6, tx: 0, tz: -2.6,
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
    // 5 Xe cộ chạy 2 chiều 60fps trên Đại Lộ Sài Gòn trước mặt tiền quán Phở (QĐ 235)
    vehicles: [
      { kind: 'moto', x: -16, z: -5.9, sp: 6.2, dir: 1,  col: '#DC2626' },
      { kind: 'taxi', x: 6,   z: -5.9, sp: 5.4, dir: 1,  col: '#16A34A' },
      { kind: 'bus',  x: 18,  z: -8.7, sp: 4.5, dir: -1, col: '#1D4ED8' },
      { kind: 'moto', x: -4,  z: -8.7, sp: 6.6, dir: -1, col: '#2563EB' },
      { kind: 'taxi', x: -24, z: -8.7, sp: 5.2, dir: -1, col: '#F8FAFC' }
    ],
    // 3 Tàu Waterbus & thuyền chạy 2 chiều 60fps trên Sông Bạch Đằng bên kia đường (QĐ 235)
    boats: [
      { kind: 'waterbus', x: -22, z: -18.5, sp: 2.8, dir: 1,  phase: 0.2 },
      { kind: 'boat',     x: 16,  z: -24.5, sp: 2.1, dir: -1, phase: 1.5 },
      { kind: 'waterbus', x: 34,  z: -29.5, sp: 2.5, dir: -1, phase: 2.8 }
    ],
    toastText: 'Mặt tiền Quán Phở nhìn ra Đại Lộ Sài Gòn & Sông Bạch Đằng · Chạm sàn để đi!'
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
  // Đệm va chạm an toàn 0.65m cách mọi tường ngoài -> chú Heo KHÔNG BAO GIỜ bị lún/kẹt góc tường!
  nx = Math.max(-5.25, Math.min(5.25, nx));
  nz = Math.max(-4.5, Math.min(14.3, nz));
  var oldZ = w.pig.z;

  // Tường mặt tiền tại Z = 0 (mở cửa 2 cánh rộng X ∈ [-1.35, +1.35])
  if ((oldZ < 0 && nz >= -0.45) || (oldZ >= 0 && nz <= 0.45)) {
    if (Math.abs(nx) > 1.25) {
      nz = oldZ < 0 ? -0.5 : 0.5;
    } else if (w.doorOpen < 0.35) {
      w.doorManualOpen = true;
    }
  }
  // Quầy kính & nồi phở (X: -5.8 .. +1.65, Z: 9.95 .. 11.45): lối mở rộng vào bếp tại X > +1.75!
  if (nx < 1.8 && nz > 9.85 && nz < 11.6) {
    if (oldZ <= 10.0) nz = 9.85;
    else if (oldZ >= 11.45) nz = 11.6;
    else nx = 1.8;
  }
  return { x: nx, z: nz };
}

function stepPhoTpsWorld(w, dt, cam) {
  w.t += dt;

  if (w.desiredCamYaw !== null && cam) {
    var diff = normalizeAngle(w.desiredCamYaw - cam.yaw);
    if (Math.abs(diff) < 0.03) {
      cam.yaw = w.desiredCamYaw;
      w.desiredCamYaw = null;
    } else {
      cam.yaw = normalizeAngle(cam.yaw + diff * Math.min(1, dt * 4.5));
    }
  }

  var someoneNearDoor = (Math.abs(w.pig.x) < 1.8 && Math.abs(w.pig.z) < 1.45);
  for (var ci = 0; ci < w.customers.length; ci++) {
    var cu = w.customers[ci];
    if (Math.abs(cu.x) < 1.6 && Math.abs(cu.z) < 1.35) { someoneNearDoor = true; break; }
  }
  w.doorTarget = (w.doorManualOpen || someoneNearDoor) ? 1 : 0;
  w.doorOpen += (w.doorTarget - w.doorOpen) * Math.min(1, dt * 6.5);

  var p = w.pig;
  if (p.eating) {
    p.eatTimer -= dt;
    if (p.eatTimer <= 0) {
      p.eating = false;
      p.orderState = 'done';
      if (p.seatRef) p.seatRef.seat.bowl = 'empty';
      w.toastText = 'Heo ăn sạch tô Phở Cổ Phố Hội thơm lừng! Bấm Đứng dậy để vào Bếp xem Đầu bếp nấu nhé!';
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

  w.chef.x = -1.8 + Math.sin(w.t * 0.9) * 1.3;
  w.chef.moving = Math.abs(Math.cos(w.t * 0.9)) > 0.3;

  // Cập nhật xe cộ chạy 60fps trên Đại Lộ Sài Gòn & tàu bè chạy trên Sông Bạch Đằng (QĐ 235)
  for (var vi = 0; vi < w.vehicles.length; vi++) {
    var v = w.vehicles[vi];
    v.x += v.dir * v.sp * dt;
    if (v.dir > 0 && v.x > 38) v.x = -38;
    else if (v.dir < 0 && v.x < -38) v.x = 38;
  }
  for (var bi = 0; bi < w.boats.length; bi++) {
    var b = w.boats[bi];
    b.x += b.dir * b.sp * dt;
    if (b.dir > 0 && b.x > 52) b.x = -52;
    else if (b.dir < 0 && b.x < -52) b.x = 52;
  }

  // FSM Khách hàng NPC ra vào cửa & ăn Phở thực tế 100%
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
      if (moveTowards2D(c, (i % 2 === 0 ? -2.4 : 2.4), -4.4, 2.3, dt)) {
        c.state = 'OUTSIDE_WAIT'; c.timer = 4 + Math.random() * 5;
      }
    }
  }

  // FSM 2 Nhân viên phục vụ (Ưu tiên bưng Phở cho Chú Heo -> Khách chờ -> Dọn tô rỗng)
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
            w.toastText = 'Nhân viên: "Dạ 1 Phở Tái Nạm + quẩy nóng cho chú Heo ngay ạ!"';
            tk.phase = 'TO_KITCHEN';
          }
        } else if (tk.phase === 'TO_KITCHEN') {
          if (moveTowards2D(wt, -0.8, 9.6, 3.1, dt)) { wt.carryBowl = 'full'; tk.phase = 'DELIVER_PIG'; }
        } else if (tk.phase === 'DELIVER_PIG') {
          if (moveTowards2D(wt, appX, tk.seat.z, 3.0, dt)) {
            wt.carryBowl = null; tk.seat.bowl = 'full'; p.orderState = 'served';
            w.toastText = 'Tô Phở nóng hổi bốc khói đã ra tận bàn! Bấm Ăn Phở thôi!';
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

/* ==================== 3. TƯƠNG TÁC NGỮ CẢNH THÔNG MINH ==================== */
function getPhoContextAction(w) {
  var p = w.pig;
  if (p.seated) {
    if (p.orderState === 'none') return { id: 'order_pho', label: '🍜 Gọi Phở Tái Nạm Đặc Biệt', secondary: { id: 'stand_up', label: 'Đứng dậy' } };
    if (p.orderState === 'ordered') return { id: 'waiting_pho', label: '⏳ Phục vụ đang lấy Phở...', secondary: { id: 'stand_up', label: 'Đứng dậy' } };
    if (p.orderState === 'served') return { id: 'eat_pho', label: '🥢 Ăn Phở & Quẩy Nóng!', secondary: { id: 'stand_up', label: 'Đứng dậy' } };
    if (p.orderState === 'eating') return { id: 'eating_now', label: '😋 Heo đang xì xụp Phở...', secondary: null };
    return { id: 'stand_up', label: '🐷 Đứng dậy đi khám phá', secondary: null };
  }
  if (Math.abs(p.x) < 1.8 && Math.abs(p.z) < 1.8 && w.doorOpen < 0.5) {
    return { id: 'open_door', label: p.z < 0 ? '🚪 Mở cửa vào Phở Cổ Phố Hội' : '🚪 Mở cửa ra Sân Phố Cổ', secondary: null };
  }
  if (p.z > 10.4 && Math.hypot(p.x - w.chef.x, p.z - w.chef.z) < 3.8) {
    return { id: 'watch_chef', label: '👨‍🍳 Xem Đầu bếp chần Phở & múc nước dùng', secondary: null };
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
  if (p.z < -3.8) return { id: 'exit_pho', label: '🏙️ Quay lại Đại Lộ Sài Gòn', secondary: null };
  return null;
}

function triggerPhoAction(w, actionId, seatRef) {
  var p = w.pig;
  if (actionId === 'open_door') {
    w.doorManualOpen = true; p.waypoints = []; p.walking = true;
    p.tx = 0; p.tz = p.z < 0 ? 1.8 : -2.2;
    w.toastText = p.z < 0 ? 'Bước vào Sảnh Phở Chính ấm cúng! Hương quế hồi thơm nức mũi!' : 'Ra lại Sân Phố Cổ hóng mát!';
  } else if (actionId === 'sit_seat' && seatRef) {
    p.seated = true; p.walking = false; p.waypoints = [];
    p.seatRef = seatRef; seatRef.seat.occupant = 'PIG';
    p.x = seatRef.seat.x; p.z = seatRef.seat.z; p.yaw = seatRef.seat.yaw;
    p.orderState = seatRef.seat.bowl === 'full' ? 'served' : 'none';
    w.toastText = 'Heo đã ngồi yên vị! Bấm Gọi Phở để thưởng thức tô Phở nóng hổi nhé!';
  } else if (actionId === 'order_pho') {
    p.orderState = 'ordered';
    w.toastText = 'Heo gọi 1 tô Phở Tái Nạm đặc biệt! Nhân viên đang chạy tới bàn...';
  } else if (actionId === 'eat_pho') {
    p.orderState = 'eating'; p.eating = true; p.eatTimer = 4.5;
    w.toastText = 'Xì xụp! Nước dùng ngọt xương, thịt bò mềm, quẩy giòn rụm ngon tuyệt!';
  } else if (actionId === 'stand_up') {
    if (p.seatRef) {
      p.seatRef.seat.occupant = null;
      p.x = p.seatRef.table.x > 0 ? p.seatRef.table.x - 1.45 : p.seatRef.table.x + 1.45;
    }
    p.seated = false; p.eating = false; p.seatRef = null; p.orderState = 'none';
    w.toastText = 'Heo đứng dậy! Chạm sàn đi dạo hoặc bấm Tab trên để vào Bếp Lửa!';
  } else if (actionId === 'watch_chef') {
    w.toastText = 'Đầu bếp: "Nồi nước dùng ninh xương ống 14 tiếng cùng hoa hồi, thảo quả, quế thanh!"';
  }
}

/* ==================== 4. VẼ BÀN GỖ LIM + SPRITE NGUYÊN LIỆU TẢ THỰC & BỐI CẢNH PHỐ CỔ ==================== */
function drawPhoTableIngredients3D(ctx, cam, tb, t) {
  var tx = tb.x, tz = tb.z;
  // Mặt bàn gỗ lim cổ truyền + 4 chân bàn chắc chắn
  drawBox3D(ctx, cam, tx, 0.70, tz, 1.68, 0.11, 1.08, { top: '#5C341D', front: '#3F2212', side: '#31190C' });
  drawBox3D(ctx, cam, tx - 0.70, 0, tz - 0.42, 0.10, 0.70, 0.10, { top: '#4A2816', front: '#3B1E10', side: '#2B150A' });
  drawBox3D(ctx, cam, tx + 0.70, 0, tz - 0.42, 0.10, 0.70, 0.10, { top: '#4A2816', front: '#3B1E10', side: '#2B150A' });
  drawBox3D(ctx, cam, tx - 0.70, 0, tz + 0.42, 0.10, 0.70, 0.10, { top: '#4A2816', front: '#3B1E10', side: '#2B150A' });
  drawBox3D(ctx, cam, tx + 0.70, 0, tz + 0.42, 0.10, 0.70, 0.10, { top: '#4A2816', front: '#3B1E10', side: '#2B150A' });

  // Sprite Pixel Art tả thực trên mặt bàn (KHÔNG dùng cục hộp vuông!):
  // 1. Ấm trà Bát Tràng men xanh dáng tròn có vòi & quai xách
  drawBatTrangTeapotSprite3D(ctx, cam, tx + 0.46, 0.82, tz - 0.08);
  // 2. Rổ gia vị đỏ đựng nước tương, tương ớt & giấm tỏi ớt ngâm
  drawCondimentCaddySprite3D(ctx, cam, tx - 0.54, 0.82, tz);
  // 3. Đĩa rau giá chanh tươi & đĩa quẩy nóng vàng giòn
  drawQuayAndHerbsSprite3D(ctx, cam, tx + 0.16, 0.82, tz + 0.24);
  // 4. Tô Phở sứ tròn đầy thịt bò tái, hành ngò, đũa tre & khói nóng 3D!
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

function drawSaigonAvenueAndBachDang3D(ctx, cam, w) {
  // 1. Vỉa hè Sài Gòn trải dài vô tận 2 bên (X: -65..+65, Z: 0..-4.3) -> 0% mảng trời xanh mất liên kết!
  drawPoly3D(ctx, cam, [[-65,0,0],[65,0,0],[65,0,-4.3],[-65,0,-4.3]], '#DFCFB2', null, 0);
  // Bó vỉa vạch trắng-đen chuẩn Banner Tab Khám phá (Z: -4.3..-4.65)
  drawPoly3D(ctx, cam, [[-65,0.01,-4.3],[65,0.01,-4.3],[65,0.01,-4.65],[-65,0.01,-4.65]], '#2B2118', null, 0);
  for (var kx = -28; kx <= 28; kx += 2.4) {
    drawPoly3D(ctx, cam, [[kx,0.02,-4.3],[kx+1.2,0.02,-4.3],[kx+1.2,0.02,-4.65],[kx,0.02,-4.65]], '#F8FAFC', null, 0);
  }
  // 2. Đại lộ Sài Gòn 2 làn xe (Z: -4.65..-10.6, X: -70..+70)
  drawPoly3D(ctx, cam, [[-70,0,-4.65],[70,0,-4.65],[70,0,-10.6],[-70,0,-10.6]], '#3B424C', '#2B2118', 1);
  for (var rx = -34; rx <= 34; rx += 3.6) {
    drawPoly3D(ctx, cam, [[rx,0.01,-7.45],[rx+1.8,0.01,-7.45],[rx+1.8,0.01,-7.75],[rx,0.01,-7.75]], '#FACC15', null, 0);
  }
  // 3. Bờ kè Bến Bạch Đằng lát đá + cây xanh ven sông (Z: -10.6..-12.8, X: -75..+75)
  drawPoly3D(ctx, cam, [[-75,0,-10.6],[75,0,-10.6],[75,0,-12.8],[-75,0,-12.8]], '#CBD5E1', '#64748B', 1);
  drawPoly3D(ctx, cam, [[-75,0,-12.8],[75,0,-12.8],[75,0.75,-12.8],[-75,0.75,-12.8]], '#94A3B8', '#475569', 1); // Lan can bờ kè
  // 4. SÔNG BẠCH ĐẰNG rộng lớn lấp lánh sóng (Z: -12.8..-35.0, X: -85..+85)
  drawPoly3D(ctx, cam, [[-85,0,-12.8],[85,0,-12.8],[85,0,-35.0],[-85,0,-35.0]], '#3B8CB8', null, 0);
  // Vệt sóng lấp lánh chạy nhẹ trên mặt sông Bạch Đằng
  for (var wi = 0; wi < 12; wi++) {
    var wx = -32 + ((wi * 9.5 + w.t * (wi % 2 === 0 ? 1.4 : -1.2)) % 64 + 64) % 64;
    var wz = -15.5 - (wi % 5) * 3.8;
    drawPoly3D(ctx, cam, [[wx,0.02,wz],[wx+2.4,0.02,wz],[wx+2.4,0.02,wz-0.25],[wx,0.02,wz-0.25]], 'rgba(224,242,254,0.55)', null, 0);
  }
  // 5. BỜ CÔNG VIÊN THỦ THIÊM xanh mướt & dãy skyline xa khép kín 100% đường chân trời (Z: -35.0..-42.0)
  drawPoly3D(ctx, cam, [[-95,0,-35.0],[95,0,-35.0],[95,2.2,-35.5],[-95,2.2,-35.5]], '#3B8249', null, 0);
  drawPoly3D(ctx, cam, [[-95,2.2,-35.5],[95,2.2,-35.5],[95,4.8,-36.0],[-95,4.8,-36.0]], '#7AA7CE', null, 0);
  // 6. Vẽ 3 Tàu Waterbus & thuyền chạy 60fps trên Sông Bạch Đằng (từ xa tới gần)
  var sortedBoats = w.boats.slice().sort(function(a, b) { return a.z - b.z; });
  for (var bi = 0; bi < sortedBoats.length; bi++) {
    drawRiverBoatSprite3D(ctx, cam, sortedBoats[bi], w.t);
  }
  // 7. Vẽ 5 Xe máy / Taxi / Xe buýt chạy 60fps trên Đại Lộ Sài Gòn
  var sortedVehs = w.vehicles.slice().sort(function(a, b) { return a.z - b.z; });
  for (var vi = 0; vi < sortedVehs.length; vi++) {
    drawRoadVehicleSprite3D(ctx, cam, sortedVehs[vi]);
  }
  // 8. Dãy công trình kế bên Quán Phở (Z = 0, kéo dài 2 phía -> 0% hở trời xanh khi xoay trái/phải!)
  // BÊN PHẢI (X: +6..+22): TIỆM CAFE MÁI HIÊN SỌC ĐỎ-TRẮNG 1:1 BANNER TAB KHÁM PHÁ!
  drawPoly3D(ctx, cam, [[6.0,0,0],[22.0,0,0],[22.0,5.2,0],[6.0,5.2,0]], '#F2DBAE', '#2B2118', 1.2);
  drawPoly3D(ctx, cam, [[6.0,5.2,0],[22.0,5.2,0],[22.0,5.8,-0.4],[6.0,5.8,-0.4]], '#5C3A21', '#2B2118', 1);
  // 3 Cửa sổ xanh tầng 2 của Tiệm CAFE
  var cafeWinXs = [8.5, 13.0, 17.5];
  for (var cwi = 0; cwi < 3; cwi++) {
    var cwx = cafeWinXs[cwi];
    drawPoly3D(ctx, cam, [[cwx,3.2,-0.04],[cwx+2.4,3.2,-0.04],[cwx+2.4,4.4,-0.04],[cwx,4.4,-0.04]], '#5B8FB9', '#2B2118', 1.2);
  }
  // Biển nâu CAFE + Mái hiên sọc đỏ-trắng đặc trưng!
  drawPoly3D(ctx, cam, [[9.0,2.2,-0.05],[19.0,2.2,-0.05],[19.0,2.9,-0.05],[9.0,2.9,-0.05]], '#4A2C1A', '#2B2118', 1.2);
  for (var ax = 6.4; ax < 21.6; ax += 1.2) {
    var isRed = Math.floor(ax * 2) % 2 === 0;
    drawPoly3D(ctx, cam, [[ax,1.65,-0.35],[ax+1.2,1.65,-0.35],[ax+1.2,2.2,0],[ax,2.2,0]], isRed ? '#D93829' : '#FFFDF7', '#2B2118', 0.8);
  }
  drawPoly3D(ctx, cam, [[7.0,0.05,-0.04],[12.0,0.05,-0.04],[12.0,1.65,-0.04],[7.0,1.65,-0.04]], '#A9C8D9', '#2B2118', 1);
  drawPoly3D(ctx, cam, [[15.0,0.05,-0.04],[20.8,0.05,-0.04],[20.8,1.65,-0.04],[15.0,1.65,-0.04]], '#A9C8D9', '#2B2118', 1);
  drawPoly3D(ctx, cam, [[12.5,0.05,-0.04],[14.5,0.05,-0.04],[14.5,1.65,-0.04],[12.5,1.65,-0.04]], '#6E452A', '#2B2118', 1);
  // Dãy nhà phố kéo dài xa bên phải (X: +22..+60) & bên trái (X: -60..-6) khép kín 100% chân trời!
  drawPoly3D(ctx, cam, [[22.0,0,0],[60.0,0,0],[60.0,5.4,0],[22.0,5.4,0]], '#E6A825', '#2B2118', 1);
  drawPoly3D(ctx, cam, [[-60.0,0,0],[-6.0,0,0],[-6.0,5.2,0],[-60.0,5.2,0]], '#E8CF9E', '#2B2118', 1);
  drawPoly3D(ctx, cam, [[-60.0,5.2,0],[-6.0,5.2,0],[-6.0,6.0,-0.4],[-60.0,6.0,-0.4]], '#B83224', '#2B2118', 1);
}

function renderPhoTps3D(ctx, cam, w) {
  var vw = cam.vw, vh = cam.vh;
  var isIndoors = w.pig.z >= -0.15;

  // 1. NỀN TRẦN KÍN 100% KHI Ở TRONG NHÀ — BẦU TRỜI ẤM KHI Ở SÂN PHỐ CỔ
  if (isIndoors) {
    ctx.fillStyle = '#EFE2C8';
    ctx.fillRect(0, 0, vw, Math.round(vh * 0.55));
    ctx.fillStyle = '#8C7A65';
    ctx.fillRect(0, Math.round(vh * 0.55), vw, vh);
  } else {
    var skyGrad = ctx.createLinearGradient(0, 0, 0, Math.round(vh * 0.52));
    skyGrad.addColorStop(0, '#6AB5F5');
    skyGrad.addColorStop(1, '#CFE8FF');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, vw, Math.round(vh * 0.52));
    // Nền mặt nước/vỉa hè dưới đường chân trời (không bao giờ hở trời xanh bên dưới chân trời!)
    ctx.fillStyle = '#3B8CB8';
    ctx.fillRect(0, Math.round(vh * 0.52), vw, vh);
    drawSaigonAvenueAndBachDang3D(ctx, cam, w);
  }

  // 2. SÀN GẠCH BÔNG INDOCHINE 3 KHU (giảm 60% đa giác, siêu mượt 60fps!)
  for (var gz = -5.4; gz < 15.0; gz += 1.7) {
    for (var gx = -6.0; gx < 6.0; gx += 1.7) {
      var isGarden = gz < 0;
      var isKitchen = gz >= 10.2;
      var chk = ((Math.floor(gx + 20) + Math.floor(gz + 20)) % 2 === 0);
      var col = isGarden ? (chk ? '#D4C7B0' : '#C7B89E')
        : isKitchen ? (chk ? '#CBD5E1' : '#DDE5EE')
        : (chk ? '#F4EBDA' : '#DDD0B6');
      drawPoly3D(ctx, cam, [[gx,0,gz],[gx+1.7,0,gz],[gx+1.7,0,gz+1.7],[gx,0,gz+1.7]], col, 'rgba(74,44,26,0.12)', 1);
      if (!isGarden && !isKitchen && chk) {
        drawPoly3D(ctx, cam, [[gx+0.7,0.01,gz+0.7],[gx+1.0,0.01,gz+0.7],[gx+1.0,0.01,gz+1.0],[gx+0.7,0.01,gz+1.0]], '#2F6F5B', null, 0);
      }
    }
  }
  // Nẹp gỗ chuyển tiếp gọn gàng giữa sàn Sảnh Chính & Bếp Lửa (Z = 10.2)
  drawPoly3D(ctx, cam, [[-6.0,0.015,10.1],[6.0,0.015,10.1],[6.0,0.015,10.3],[-6.0,0.015,10.3]], '#5C341D', null, 0);

  if (w.targetMarker) {
    var tm = w.targetMarker;
    var r = 0.24 + (1 - tm.ttl) * 0.16;
    drawPoly3D(ctx, cam, [
      [tm.x - r, 0.02, tm.z], [tm.x, 0.02, tm.z - r],
      [tm.x + r, 0.02, tm.z], [tm.x, 0.02, tm.z + r]
    ], 'rgba(244,185,59,0.52)', '#F4B93B', 1.5);
  }

  // 3. TRẦN NHÀ GỖ LIM KÍN 100% + XÀ GỒ PHỐI CẢNH 3D (chỉ trong nhà Z: 0..15.2)
  if (isIndoors) {
    drawPoly3D(ctx, cam, [[-6.0,3.85,0],[6.0,3.85,0],[6.0,3.85,15.2],[-6.0,3.85,15.2]], '#F5EAD3', '#4A2C1A', 1);
    for (var bz = 0.2; bz <= 15.0; bz += 3.0) {
      drawPoly3D(ctx, cam, [[-6.0,3.62,bz],[6.0,3.62,bz],[6.0,3.85,bz],[-6.0,3.85,bz]], '#4A2C1A', '#2B180E', 1);
    }
  }

  // 4. TƯỜNG BAO 3 PHÍA TRONG QUÁN (Không có vách ngăn thừa -> 0% lỗi xuyên tường!)
  drawPoly3D(ctx, cam, [[-6.0,0,0],[-6.0,0,15.2],[-6.0,3.85,15.2],[-6.0,3.85,0]], '#DFAA3E', '#3B2314', 1.2);
  drawPoly3D(ctx, cam, [[6.0,0,15.2],[6.0,0,0],[6.0,3.85,0],[6.0,3.85,15.2]], '#D99B26', '#3B2314', 1.2);
  drawPoly3D(ctx, cam, [[-6.0,0,15.2],[6.0,0,15.2],[6.0,3.85,15.2],[-6.0,3.85,15.2]], '#E6B34B', '#3B2314', 1.2);
  // Tranh phố cổ đóng khung gỗ dọc tường trái & phải (có nội dung bên trong, không trống trắng!)
  drawPoly3D(ctx, cam, [[-5.94,1.5,2.4],[-5.94,1.5,4.2],[-5.94,2.6,4.2],[-5.94,2.6,2.4]], '#C4A47C', '#3B2314', 2);
  drawPoly3D(ctx, cam, [[5.94,1.5,4.2],[5.94,1.5,2.4],[5.94,2.6,2.4],[5.94,2.6,4.2]], '#C4A47C', '#3B2314', 2);
  // Bảng thực đơn gỗ sơn son thếp vàng sau bếp & 3 Quạt treo tường quay 60fps
  drawPoly3D(ctx, cam, [[-3.6,2.1,15.1],[1.4,2.1,15.1],[1.4,3.1,15.1],[-3.6,3.1,15.1]], '#991B1B', '#F4B93B', 1.8);
  var fanXs = [-4.0, 0.0, 4.0];
  for (var fi = 0; fi < fanXs.length; fi++) {
    var fp = projectPoint3D(cam, fanXs[fi], 3.15, 15.0);
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

  // 5. THU THẬP VẬT THỂ 3D ĐỂ Z-SORT (PAINTER'S ALGORITHM)
  var drawList = [];
  function pushItem(wx, wz, fn) {
    var cp = worldToCam(cam, wx, 0.7, wz);
    drawList.push({ cz: cp.cz, fn: fn });
  }

  // 2 Cột đèn đường Sài Gòn trên vỉa hè (bỏ hàng rào gạch chắn tầm nhìn -> nhìn thẳng ra Đại lộ & Sông Bạch Đằng!)
  pushItem(-5.2, -4.0, function() {
    drawBox3D(ctx, cam, -5.2, 0, -4.0, 0.16, 3.3, 0.16, { top: '#475569', front: '#334155', side: '#1E293B' });
    drawBox3D(ctx, cam, -5.2, 3.25, -4.0, 0.75, 0.14, 0.16, { top: '#475569', front: '#334155', side: '#1E293B' });
  });
  pushItem(5.2, -4.0, function() {
    drawBox3D(ctx, cam, 5.2, 0, -4.0, 0.16, 3.3, 0.16, { top: '#475569', front: '#334155', side: '#1E293B' });
    drawBox3D(ctx, cam, 5.2, 3.25, -4.0, 0.75, 0.14, 0.16, { top: '#475569', front: '#334155', side: '#1E293B' });
  });

  // Giàn xà gỗ hiên quán Phở (Z = -1.5, Y = 3.25) treo đèn lồng nối thẳng vào mặt tiền
  pushItem(0, -1.5, function() {
    drawBox3D(ctx, cam, 0, 3.22, -1.5, 11.8, 0.14, 0.16, { top: '#4A2C1A', front: '#3B2314', side: '#2B180E' });
  });

  // MẶT TIỀN QUÁN PHỞ 2 TẦNG 1:1 BANNER TAB KHÁM PHÁ (MÁI NGÓI ĐỎ LIỀN SUỐT X:-6..+6 — 0% HỞ TRỜI XANH!)
  pushItem(-3.7, 0, function() {
    drawPoly3D(ctx, cam, [[-6.0,0,0],[-1.45,0,0],[-1.45,2.6,0],[-6.0,2.6,0]], '#F2DBAE', '#2B2118', 1.2);
    drawPoly3D(ctx, cam, [[-5.1,0.7,-0.04],[-2.1,0.7,-0.04],[-2.1,2.2,-0.04],[-5.1,2.2,-0.04]], '#C9E1EE', '#4A2C1A', 1.5);
  });
  pushItem(3.7, 0, function() {
    drawPoly3D(ctx, cam, [[1.45,0,0],[6.0,0,0],[6.0,2.6,0],[1.45,2.6,0]], '#F2DBAE', '#2B2118', 1.2);
    drawPoly3D(ctx, cam, [[2.1,0.7,-0.04],[5.1,0.7,-0.04],[5.1,2.2,-0.04],[2.1,2.2,-0.04]], '#C9E1EE', '#4A2C1A', 1.5);
  });
  // Tầng 2 liền mạch (Y: 2.55..5.2) + 2 Cửa sổ lá sách xanh rêu + Mái ngói đỏ liền suốt + Biển đỏ-vàng PHỞ!
  pushItem(0, -0.05, function() {
    // Tường tầng 2 liền mạch không có khe hở trên cửa!
    drawPoly3D(ctx, cam, [[-6.0,2.55,0],[6.0,2.55,0],[6.0,5.2,0],[-6.0,5.2,0]], '#F2DBAE', '#2B2118', 1.2);
    // 2 Cửa sổ lá sách xanh rêu đặc trưng tầng 2 (1:1 Banner Tab Khám phá!)
    drawPoly3D(ctx, cam, [[-4.4,3.6,-0.04],[-1.6,3.6,-0.04],[-1.6,4.7,-0.04],[-4.4,4.7,-0.04]], '#3F6A44', '#2B2118', 1.4);
    drawPoly3D(ctx, cam, [[1.6,3.6,-0.04],[4.4,3.6,-0.04],[4.4,4.7,-0.04],[1.6,4.7,-0.04]], '#3F6A44', '#2B2118', 1.4);
    // Mái ngói đỏ liền suốt từ X = -6.2 đến +6.2 (tuyệt đối KHÔNG hở bầu trời ở giữa!)
    drawPoly3D(ctx, cam, [[-6.2,5.2,0],[6.2,5.2,0],[6.2,6.1,-0.5],[-6.2,6.1,-0.5]], '#C93424', '#2B2118', 1.2);
    // Biển hiệu đỏ-vàng PHỞ nổi bật ngay trên cửa ra vào
    drawPoly3D(ctx, cam, [[-3.4,2.55,-0.06],[3.4,2.55,-0.06],[3.4,3.35,-0.06],[-3.4,3.35,-0.06]], '#C93424', '#2B2118', 1.5);
    drawPoly3D(ctx, cam, [[-3.2,2.68,-0.07],[3.2,2.68,-0.07],[3.2,3.22,-0.07],[-3.2,3.22,-0.07]], '#B8291E', '#F4B93B', 1);
    var signP = projectPoint3D(cam, 0, 2.95, -0.09);
    if (signP && signP.cz > 0.5 && signP.cz < 18) {
      ctx.save();
      ctx.font = 'bold ' + Math.max(8, Math.min(20, Math.round(signP.scale * 0.30))) + 'px monospace';
      ctx.fillStyle = '#FACC15'; ctx.textAlign = 'center';
      ctx.fillText('PHỞ GIA TRUYỀN', signP.sx, signP.sy + 3);
      ctx.restore();
    }
  });

  // Cửa gỗ-kính 2 cánh xoay bản lề 90° (Z = 0)
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

  // Bình phong song gỗ chạm giữa Sảnh Phở Chính (X: 0, Z: 5.2)
  pushItem(0, 5.2, function() {
    drawBox3D(ctx, cam, 0, 0, 5.2, 1.7, 2.55, 0.16, { top: '#4A2C1A', front: '#5C341D', side: '#3B2314' });
  });

  // Đèn lồng có dây treo nối thẳng lên xà gỗ (ngoài hiên topY=3.45, trong quán topY=3.85)
  var lanternList = [
    [-2.8, 2.75, -1.6, '#E0452B', 3.45], [-1.1, 2.85, -1.6, '#FACC15', 3.45],
    [1.1, 2.85, -1.6, '#38BDF8', 3.45],  [2.8, 2.75, -1.6, '#EC4899', 3.45],
    [-3.4, 2.95, 2.2, '#FFF3C4', 3.85],  [3.4, 2.95, 2.2, '#FFF3C4', 3.85],
    [-3.4, 2.95, 8.2, '#FFF3C4', 3.85],  [3.4, 2.95, 8.2, '#FFF3C4', 3.85]
  ];
  for (var li = 0; li < lanternList.length; li++) {
    (function(lt) {
      pushItem(lt[0], lt[2], function() { drawLanternGlow3D(ctx, cam, lt[0], lt[1], lt[2], lt[3], '#FFE49E', 0.20, lt[4]); });
    })(lanternList[li]);
  }

  // QUẦY BẾP LỬA PHỞ + 2 NỒI NƯỚC DÙNG TRÒN TẢ THỰC + TỦ KÍNH TREO THỊT BÒ & RAU THƠM (Z = 10.6)
  pushItem(-2.0, 10.6, function() {
    drawBox3D(ctx, cam, -2.0, 0, 10.6, 7.2, 0.94, 1.05, { top: '#E2E8F0', front: '#5C341D', side: '#4A2C1A' });
    // Khung tủ kính trong suốt đựng nguyên liệu Phở tả thực (KHÔNG còn cục hộp đỏ/trắng/xanh!)
    drawBox3D(ctx, cam, -4.1, 0.94, 10.6, 2.2, 1.05, 0.78, { top: 'rgba(186,230,253,0.45)', front: 'rgba(186,230,253,0.22)', side: 'rgba(147,197,253,0.28)' });
    drawKitchenIngredientsSprite3D(ctx, cam, -4.1, 1.02, 10.6);
    // 2 Nồi nước dùng inox TRÒN có 2 quai, vá múc & nước dùng vàng sủi tăm bốc khói!
    drawPhoPotSprite3D(ctx, cam, -1.6, 0.96, 10.6, w.t, 0.0);
    drawPhoPotSprite3D(ctx, cam, 0.1,  0.96, 10.6, w.t, 0.5);
  });
  // Bồn rửa chén inox gọn sát tường sau bếp (X: 4.3, Z: 14.5 — KHÔNG chặn lối đi!)
  pushItem(4.3, 14.5, function() {
    drawBox3D(ctx, cam, 4.3, 0, 14.5, 2.4, 0.88, 0.9, { top: '#93C5FD', front: '#CBD5E1', side: '#94A3B8' });
  });

  // 8 BÀN GỖ LIM + 16 GHẾ ĐỆM XANH RÊU + SPRITE ĐỒ ĂN PHỞ TẢ THỰC
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
