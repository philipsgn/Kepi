/**
 * Chợ Bến Thành Sài Gòn 3 Phòng TPS 3D Độc Bản (Quyết định 246)
 * Kiến trúc 3 phòng riêng biệt 100% (1 Room = 1 Scene, Fade chuyển phòng 200ms, KHÔNG gộp chung):
 * 1. 'south_hall'  — Sảnh Cửa Nam & Sạp Vải Áo Dài: Gạch nung đỏ đất & kem lối đi Chợ Bến Thành,
 *                    trần bê tông vàng kèo thép chữ A + giếng trời nắng xiên & đèn mây tre,
 *                    Sạp Vải & Áo Dài Hương Trinh (trái), Đặc Sản Liên Sài Gòn & Ngọc Hoa (phải),
 *                    cổng xếp sắt CỬA SỐ 1 · CỬA NAM (Z = 0, thoát ra Bản Đồ), vòm cuối đi Khu Ăn Uống
 *                    & lối rẽ phải sang Sảnh Trái Cây. Tương tác: "👘 Ướm thử Áo Dài & Lụa Bến Thành".
 * 2. 'food_court'  — Khu Ẩm Thực Trung Tâm Sạp 1044: Quầy chữ L SẠP 1044 với dừa xiêm xanh,
 *                    ghế đôn inox tròn sáng bóng, nồi nước lèo nghi ngút khói (drawPhoPotSprite3D),
 *                    quầy Bánh Cuốn Nóng 50K nồi vải trắng (trái), bàn đá mài Bánh Bèo Huế 20K 12 chén sứ
 *                    & nem chua lá chuối (phải), đầu bếp & thực khách (drawHumanTps3D).
 *                    Tương tác: "🥞 Thưởng thức Bánh Cuốn & Bánh Bèo Chợ Bến Thành".
 * 3. 'fruit_craft' — Sảnh Trái Cây Nhiệt Đới & Đồ Lưu Niệm Nón Lá: Đảo Trái Cây 1029 Ngọc Hảo
 *                    xếp tầng xoài cát vàng, bưởi da xanh, thanh long đỏ, sầu riêng & cân đồng hồ cổ,
 *                    Gốm Sứ & Sơn Mài Bến Thành (trái), Nón Lá & Quà Lưu Niệm Sài Gòn (phải), vòm Cửa Bắc.
 *                    Tương tác: "🥭 Chọn mua Xoài Cát & Quà Lưu Niệm".
 */
export function buildMarketTps3dSceneScript(): string {
  return String.raw`
function createMarketTpsState() {
  var southPeople = [
    { x: -3.7, z: 4.8, yaw: Math.PI / 2,  role: 'waiter',   shirt: '#E11D48', hair: '#1C1917', moving: false, seated: false, phase: 0.2 },
    { x: -3.7, z: 8.8, yaw: Math.PI / 2,  role: 'customer', shirt: '#F59E0B', hair: '#292524', moving: false, seated: false, phase: 1.4 },
    { x:  3.7, z: 5.2, yaw: -Math.PI / 2, role: 'waiter',   shirt: '#15803D', hair: '#1C1917', moving: false, seated: false, phase: 0.8 },
    { x:  1.1, z: 7.4, yaw: 0.2,          role: 'customer', shirt: '#2563EB', hair: '#451A03', moving: true,  seated: false, phase: 2.1 }
  ];
  var foodPeople = [
    { x: -0.2, z: 8.2, yaw: Math.PI,      role: 'chef',         shirt: '#FFFFFF', hair: '#1C1917', moving: false, seated: false, phase: 0.4 },
    { x: -3.9, z: 6.2, yaw: Math.PI / 2,  role: 'chef_noodle',  shirt: '#FFFFFF', hair: '#292524', moving: false, seated: false, phase: 1.2 },
    { x:  3.8, z: 5.0, yaw: -Math.PI / 2, role: 'waiter',       shirt: '#B45309', hair: '#1C1917', moving: false, seated: false, phase: 1.9 },
    { x: -1.1, z: 5.5, yaw: 0,            role: 'customer',     shirt: '#0284C7', hair: '#1C1917', moving: false, seated: true,  phase: 0.7 },
    { x:  1.1, z: 5.5, yaw: 0,            role: 'customer',     shirt: '#E11D48', hair: '#451A03', moving: false, seated: true,  phase: 2.3 }
  ];
  var fruitPeople = [
    { x:  0.0, z: 7.8, yaw: Math.PI,      role: 'waiter',   shirt: '#16A34A', hair: '#1C1917', moving: false, seated: false, phase: 0.5 },
    { x: -3.8, z: 6.4, yaw: Math.PI / 2,  role: 'waiter',   shirt: '#1D4ED8', hair: '#292524', moving: false, seated: false, phase: 1.6 },
    { x:  3.8, z: 4.8, yaw: -Math.PI / 2, role: 'customer', shirt: '#D97706', hair: '#1C1917', moving: false, seated: false, phase: 2.4 }
  ];

  return {
    room: 'south_hall',
    pendingRoom: '',
    roomFade: 0,
    pig: {
      x: 0, z: 1.5, yaw: 0, targetX: 0, targetZ: 2.8,
      walking: true, seated: false, eating: false,
      wearingAoDai: false, ateFood: false, boughtFruit: false
    },
    southPeople: southPeople,
    foodPeople: foodPeople,
    fruitPeople: fruitPeople,
    leftDoorOpen: 0.0,
    rightDoorOpen: 0.0,
    exitFade: 0,
    exiting: false,
    ripples: [],
    toast: 'Chợ Bến Thành · Sảnh Cửa Nam! Khám phá Sạp Áo Dài, Khu Ẩm Thực 1044 & Trái Cây 👘',
    toastUntil: 5.2,
    t: 0
  };
}

function clampMarketWalkPos(st, x, z) {
  var nx = Math.max(-4.95, Math.min(4.95, x));
  var nz = Math.max(0.65, Math.min(13.2, z));
  var boxes = [];
  if (st.room === 'south_hall') {
    boxes = [
      { x1: -5.95, z1: 1.5, x2: -4.15, z2: 11.5 }, // Dãy sạp Vải & Áo Dài Hương Trinh trái
      { x1:  4.15, z1: 1.5, x2:  5.95, z2:  8.2 }  // Sạp Đặc Sản Liên Sài Gòn & Ngọc Hoa phải
    ];
  } else if (st.room === 'food_court') {
    boxes = [
      { x1: -1.75, z1: 6.1, x2:  1.75, z2:  9.3 }, // Quầy chữ L SẠP 1044 trung tâm
      { x1: -5.95, z1: 1.8, x2: -4.15, z2: 11.2 }, // Quầy Bánh Cuốn Nóng 50K trái
      { x1:  4.15, z1: 1.8, x2:  5.95, z2:  8.2 }  // Bàn đá mài Bánh Bèo Huế 20K phải
    ];
  } else {
    boxes = [
      { x1: -1.65, z1: 5.2, x2:  1.65, z2:  8.4 }, // Đảo Trái Cây 1029 Ngọc Hảo giữa phòng
      { x1: -5.95, z1: 1.8, x2: -4.20, z2: 11.2 }, // Sạp Gốm Sứ & Sơn Mài trái
      { x1:  4.20, z1: 1.8, x2:  5.95, z2:  8.2 }  // Sạp Nón Lá & Lưu Niệm phải
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

function triggerMarketRoom(st, roomId) {
  if (!roomId || st.pendingRoom || st.room === roomId) return;
  if (roomId !== 'south_hall' && roomId !== 'food_court' && roomId !== 'fruit_craft') return;
  st.pendingRoom = roomId;
  st.pig.walking = false;
  st.pig.seated = false;
  st.pig.eating = false;
}

function stepMarketTps(st, dt) {
  st.t += dt;
  var p = st.pig;

  // 1. Chuyển phòng mượt 200ms (1 Room = 1 Scene, zero merging)
  if (st.pendingRoom) {
    st.roomFade = Math.min(1, st.roomFade + dt * 5.2);
    if (st.roomFade >= 0.99) {
      var prev = st.room;
      st.room = st.pendingRoom;
      st.pendingRoom = '';
      p.seated = false;
      p.eating = false;
      if (st.room === 'food_court') {
        p.x = 0; p.z = 2.0; p.yaw = 0;
        p.targetX = 0; p.targetZ = 4.6; p.walking = true;
        st.toast = 'Khu Ẩm Thực Trung Tâm · Sạp 1044! Bánh Cuốn Nóng 50K, Bánh Bèo 20K & Phở Bò 🥞';
      } else if (st.room === 'fruit_craft') {
        p.x = -0.2; p.z = 2.2; p.yaw = 0;
        p.targetX = 0; p.targetZ = 4.4; p.walking = true;
        st.toast = 'Sảnh Trái Cây 1029 Ngọc Hảo · Xoài Cát Hòa Lộc, Gốm Bát Tràng & Nón Lá Sài Gòn! 🥭';
      } else {
        if (prev === 'food_court') {
          p.x = 0; p.z = 12.2; p.yaw = Math.PI;
          p.targetX = 0; p.targetZ = 9.4; p.walking = true;
        } else {
          p.x = 3.4; p.z = 9.8; p.yaw = -Math.PI / 2;
          p.targetX = 1.6; p.targetZ = 8.4; p.walking = true;
        }
        st.toast = 'Sảnh Cửa Nam · Sạp Vải Áo Dài Hương Trinh & Đặc Sản Liên Sài Gòn! 👘';
      }
      st.toastUntil = st.t + 4.4;
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
      var spd = Math.min(dist, 3.1 * dt);
      var next = clampMarketWalkPos(st, p.x + (dx / dist) * spd, p.z + (dz / dist) * spd);
      p.x = next.x; p.z = next.z;
      p.yaw = Math.atan2(dx, dz);
    }
  }

  // 3. Khách đi dạo nhẹ trong Sảnh Cửa Nam
  if (st.room === 'south_hall' && st.southPeople && st.southPeople[3]) {
    var walker = st.southPeople[3];
    walker.z = 6.2 + Math.sin(st.t * 0.85) * 2.6;
    walker.yaw = Math.cos(st.t * 0.85) >= 0 ? 0 : Math.PI;
  }

  // 4. Cổng sắt xếp Cửa Nam mở khi rời chợ
  var targetDoor = (st.room === 'south_hall' && st.exiting) ? 0.92 : 0.0;
  st.rightDoorOpen += (targetDoor - st.rightDoorOpen) * Math.min(1, dt * 6.0);
  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.2);

  // 5. Vòng sóng Tap-to-Walk
  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== HELPER VẼ MÓN NGON, TRÁI CÂY & NÓN LÁ 3D ==================== */
function drawSteamerPot3D(ctx, cam, wx, wy, wz, t) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 18 || pr.cz < 0.35) return;
  var u = Math.max(0.45, Math.min(2.8, pr.scale / 38));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  // Thân nồi tráng bánh cuốn inox
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(px - 10 * u, py - 11 * u, 20 * u, 11 * u);
  ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 1;
  ctx.strokeRect(px - 10 * u, py - 11 * u, 20 * u, 11 * u);
  // Mặt vải trắng căng tròn tráng bánh cuốn nóng
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.ellipse(px, py - 11 * u, 10.5 * u, 3.8 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Que tre gạt bánh cuốn
  ctx.strokeStyle = '#D97706'; ctx.lineWidth = Math.max(1.2, 1.8 * u);
  ctx.beginPath(); ctx.moveTo(px - 8 * u, py - 12 * u); ctx.lineTo(px + 9 * u, py - 10 * u); ctx.stroke();
  // Làn hơi nước nóng bốc lên
  for (var s = 0; s < 3; s++) {
    var st = (t * 0.85 + s * 0.33) % 1;
    ctx.globalAlpha = (1 - st) * 0.55;
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath();
    ctx.arc(px + (s - 1) * 4 * u + Math.sin(t * 4 + s) * 2 * u, py - (14 + st * 14) * u, (2 + st * 2) * u, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBanhBeoTray3D(ctx, cam, wx, wy, wz) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 18 || pr.cz < 0.35) return;
  var u = Math.max(0.45, Math.min(2.8, pr.scale / 38));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  // Mâm nhôm tròn đựng 12 chén bánh bèo Huế
  ctx.fillStyle = '#CBD5E1'; ctx.strokeStyle = '#475569'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(px, py, 14 * u, 5.5 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  var offsets = [
    [-8, -1.5], [-4, -2.5], [0, -2.8], [4, -2.5], [8, -1.5],
    [-9,  0.5], [-4.5, 0.2], [0, 0.2], [4.5, 0.2], [9, 0.5],
    [-3,  2.2], [3, 2.2]
  ];
  for (var i = 0; i < offsets.length; i++) {
    var cx = px + offsets[i][0] * u, cy = py + offsets[i][1] * u;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.ellipse(cx, cy, 2.3 * u, 1.1 * u, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#EA580C'; // Tôm cháy đỏ cam ở tâm chén bánh bèo
    ctx.fillRect(cx - 0.8 * u, cy - 0.5 * u, 1.6 * u, 1.0 * u);
  }
  ctx.restore();
}

function drawFreshCoconutsCluster3D(ctx, cam, wx, wy, wz) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 18 || pr.cz < 0.35) return;
  var u = Math.max(0.45, Math.min(2.8, pr.scale / 38));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  var pts = [[-6, 0], [0, 0.5], [6, 0], [-3, -4.5], [3, -4.5], [0, -8.5]];
  for (var i = 0; i < pts.length; i++) {
    var cx = px + pts[i][0] * u, cy = py + pts[i][1] * u;
    ctx.fillStyle = '#15803D'; ctx.strokeStyle = '#052E16'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 3.8 * u, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#4ADE80';
    ctx.fillRect(cx - 1.5 * u, cy - 2 * u, 1.5 * u, 1.5 * u);
  }
  // Ống hút cắm trên trái dừa mở nắp
  ctx.fillStyle = '#FFFBEB';
  ctx.beginPath(); ctx.ellipse(px, py - 11.5 * u, 2.4 * u, 1.0 * u, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#EF4444'; ctx.lineWidth = Math.max(1, 1.2 * u);
  ctx.beginPath(); ctx.moveTo(px, py - 11.5 * u); ctx.lineTo(px + 4 * u, py - 17 * u); ctx.stroke();
  ctx.restore();
}

function drawVintageScaleAndFruits3D(ctx, cam, wx, wy, wz) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 18 || pr.cz < 0.35) return;
  var u = Math.max(0.45, Math.min(2.8, pr.scale / 38));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  // 1. Cân đồng hồ Nhơn Hòa xanh lá cổ điển ở giữa đảo trái cây
  ctx.fillStyle = '#15803D'; ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 1;
  ctx.fillRect(px - 5 * u, py - 9 * u, 10 * u, 9 * u);
  ctx.strokeRect(px - 5 * u, py - 9 * u, 10 * u, 9 * u);
  // Mặt đồng hồ tròn trắng kim đỏ
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(px, py - 4.8 * u, 3.4 * u, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#DC2626';
  ctx.beginPath(); ctx.moveTo(px, py - 4.8 * u); ctx.lineTo(px + 2.1 * u, py - 6.2 * u); ctx.stroke();
  // Đĩa cân inox phía trên
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath(); ctx.ellipse(px, py - 10.5 * u, 7.5 * u, 2.0 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // 2. Xoài Cát Hòa Lộc vàng óng bên trái
  var mangoes = [[-16, -2], [-12, -2], [-18, -5], [-14, -5], [-15, -8]];
  for (var m = 0; m < mangoes.length; m++) {
    ctx.fillStyle = '#FACC15'; ctx.strokeStyle = '#A16207';
    ctx.beginPath(); ctx.ellipse(px + mangoes[m][0] * u, py + mangoes[m][1] * u, 3.5 * u, 2.2 * u, -0.2, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }
  // 3. Thanh Long Ruột Đỏ hồng rực bên phải
  var dragons = [[13, -2], [17, -2], [14, -5.5], [18, -5.5]];
  for (var d = 0; d < dragons.length; d++) {
    ctx.fillStyle = '#E11D48'; ctx.strokeStyle = '#881337';
    ctx.beginPath(); ctx.arc(px + dragons[d][0] * u, py + dragons[d][1] * u, 2.8 * u, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(px + (dragons[d][0] - 0.8) * u, py + (dragons[d][1] - 3.6) * u, 1.6 * u, 1.2 * u);
  }
  // 4. Sầu Riêng & Bưởi Da Xanh phía trước
  var pomelos = [[-8, 3], [8, 3], [0, 3.5]];
  for (var p = 0; p < pomelos.length; p++) {
    ctx.fillStyle = p === 2 ? '#A16207' : '#22C55E';
    ctx.strokeStyle = '#14532D';
    ctx.beginPath(); ctx.arc(px + pomelos[p][0] * u, py + pomelos[p][1] * u, 3.6 * u, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

/* ==================== VẼ KHÔNG GIAN 3 PHÒNG CHỢ BẾN THÀNH TPS 3D ==================== */
function renderMarketTpsScene(ctx, cam, st, W, H) {
  var room = st.room;
  var isSouth = room === 'south_hall';
  var isFood  = room === 'food_court';
  var isFruit = room === 'fruit_craft';

  ctx.fillStyle = isFood ? '#3B1D0E' : (isFruit ? '#2D2316' : '#3E2417');
  ctx.fillRect(0, 0, W, H);

  // 1. SÀN GẠCH CHỢ BẾN THÀNH RIÊNG BIỆT CHO TỪNG PHÒNG
  if (isSouth) {
    // Sàn gạch đất nung Terracotta & Kem với dải gạch dẫn hướng đỏ sẫm đặc trưng Cửa Nam
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#E5D3B3', '#8C6D46', 1);
    for (var tz = 0; tz < 14.4; tz += 1.6) {
      for (var tx = -6; tx < 6; tx += 1.6) {
        var even = ((Math.round(tx / 1.6) + Math.round(tz / 1.6)) % 2 === 0);
        if (even) {
          drawPoly3D(ctx, cam, [[tx, 0.004, tz], [tx + 1.6, 0.004, tz], [tx + 1.6, 0.004, tz + 1.6], [tx, 0.004, tz + 1.6]], '#C87D55', '#9C5230', 0.6);
        }
      }
    }
    // Dải gạch chỉ dẫn đỏ đô chạy dọc trục chính từ Cửa Nam vào Khu Ăn Uống
    drawPoly3D(ctx, cam, [[-1.3, 0.008, 0.3], [1.3, 0.008, 0.3], [1.3, 0.008, 14.4], [-1.3, 0.008, 14.4]], '#881337', '#F4B93B', 1.2);
  } else if (isFood) {
    // Sàn gạch đá mài Terrazzo Khu Ẩm Thực ấm sạch + viền gạch bông cổ điển
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#D8C7A8', '#786248', 1);
    for (var fz = 0; fz < 14.4; fz += 1.6) {
      for (var fx = -6; fx < 6; fx += 1.6) {
        var fEven = ((Math.round(fx / 1.6) + Math.round(fz / 1.6)) % 2 === 0);
        if (fEven) {
          drawPoly3D(ctx, cam, [[fx, 0.004, fz], [fx + 1.6, 0.004, fz], [fx + 1.6, 0.004, fz + 1.6], [fx, 0.004, fz + 1.6]], '#B45309', '#78350F', 0.6);
        }
      }
    }
    // Khung gạch hoa quanh đảo Sạp 1044
    drawPoly3D(ctx, cam, [[-2.5, 0.008, 4.6], [2.5, 0.008, 4.6], [2.5, 0.008, 10.2], [-2.5, 0.008, 10.2]], '#7F1D1D', '#F4B93B', 1.4);
  } else {
    // Sảnh Trái Cây & Lưu Niệm: Sàn gạch lục lăng vàng đất & xanh lá chợ truyền thống
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#E2D5B5', '#7C6E52', 1);
    for (var uz = 0; uz < 14.4; uz += 1.6) {
      for (var ux = -6; ux < 6; ux += 1.6) {
        var uEven = ((Math.round(ux / 1.6) + Math.round(uz / 1.6)) % 2 === 0);
        if (uEven) {
          drawPoly3D(ctx, cam, [[ux, 0.004, uz], [ux + 1.6, 0.004, uz], [ux + 1.6, 0.004, uz + 1.6], [ux, 0.004, uz + 1.6]], '#C6A468', '#8C6D3B', 0.6);
        }
      }
    }
    drawPoly3D(ctx, cam, [[-2.3, 0.008, 4.4], [2.3, 0.008, 4.4], [2.3, 0.008, 9.2], [-2.3, 0.008, 9.2]], '#14532D', '#F4B93B', 1.4);
  }

  // 2. TRẦN BÊ TÔNG VÀNG KEM CHỢ BẾN THÀNH + VÌ KÈO THÉP CHỮ A & Ô GIẾNG TRỜI (Y = 3.85)
  drawPoly3D(ctx, cam, [[-6, 3.85, 0], [6, 3.85, 0], [6, 3.85, 14.8], [-6, 3.85, 14.8]], '#6B4423', '#2B180E', 1);
  // Ô kính giếng trời chạy dọc đỉnh mái chợ
  drawPoly3D(ctx, cam, [[-1.6, 3.83, 1.2], [1.6, 3.83, 1.2], [1.6, 3.83, 13.6], [-1.6, 3.83, 13.6]], '#FEF3C7', '#D97706', 1.2);
  // Hệ xà kèo thép & dầm bê tông ngang mái chợ
  for (var bz = 1.8; bz <= 13.8; bz += 2.4) {
    drawPoly3D(ctx, cam, [[-6, 3.72, bz - 0.14], [6, 3.72, bz - 0.14], [6, 3.72, bz + 0.14], [-6, 3.72, bz + 0.14]], '#475569', '#1E293B', 1);
  }

  // 3. 4 BỨC TƯỜNG RIÊNG BIỆT CHO TỪNG PHÒNG (VÀNG NGHỆ CHỢ BẾN THÀNH CỔ ĐIỂN)
  var wLeft  = isFood ? '#E2B45A' : (isFruit ? '#E6BE6A' : '#E5B85B');
  var wRight = isFood ? '#D9A84E' : (isFruit ? '#DCB25E' : '#DBA94E');
  var wBack  = isFood ? '#D19F45' : (isFruit ? '#D4A853' : '#D29E44');
  drawPoly3D(ctx, cam, [[-6, 0, 0], [-6, 0, 14.8], [-6, 3.85, 14.8], [-6, 3.85, 0]], wLeft, '#5C341D', 1);
  drawPoly3D(ctx, cam, [[6, 0, 14.8], [6, 0, 0], [6, 3.85, 0], [6, 3.85, 14.8]], wRight, '#5C341D', 1);
  drawPoly3D(ctx, cam, [[-6, 0, 14.8], [6, 0, 14.8], [6, 3.85, 14.8], [-6, 3.85, 14.8]], wBack, '#5C341D', 1);

  if (isSouth) {
    // Tường mặt tiền CỬA SỐ 1 · CỬA NAM (Z = 0) với cổng sắt xếp xanh-vàng Chợ Bến Thành
    drawPoly3D(ctx, cam, [[-6, 0, 0], [-1.55, 0, 0], [-1.55, 3.85, 0], [-6, 3.85, 0]], '#DBA94E', '#5C341D', 1);
    drawPoly3D(ctx, cam, [[1.55, 0, 0], [6, 0, 0], [6, 3.85, 0], [1.55, 3.85, 0]], '#DBA94E', '#5C341D', 1);
    drawPoly3D(ctx, cam, [[-1.55, 2.74, 0], [1.55, 2.74, 0], [1.55, 3.85, 0], [-1.55, 3.85, 0]], '#7F1D1D', '#2B180E', 1);
    // Ánh nắng quảng trường Quách Thị Trang chiếu qua Cửa Nam
    drawPoly3D(ctx, cam, [[-1.55, 0, -0.04], [1.55, 0, -0.04], [1.55, 2.74, -0.04], [-1.55, 2.74, -0.04]], '#FFFDF0', '#FDE68A', 0.8);
    // Vệt nắng trải xuống sàn gạch khi đứng gần Cửa Nam
    drawPoly3D(ctx, cam, [[-1.45, 0.012, 0.04], [1.45, 0.012, 0.04], [1.85, 0.012, 2.4], [-1.85, 0.012, 2.4]], 'rgba(255, 248, 210, 0.32)', null, 0);
    // 2 Cánh cổng sắt xếp xanh cổ vịt ở Cửa Nam
    var rAng = st.rightDoorOpen * 0.92;
    drawPoly3D(ctx, cam, [[-1.55, 0, 0.02], [-0.85, 0, 0.02], [-0.85, 2.72, 0.02], [-1.55, 2.72, 0.02]], '#1E3A8A', '#172554', 1.6);
    var rx1 = 1.55 - Math.cos(rAng) * 0.72, rz1 = 0.02 + Math.sin(rAng) * 0.72;
    drawPoly3D(ctx, cam, [[1.55, 0, 0.02], [rx1, 0, rz1], [rx1, 2.72, rz1], [1.55, 2.72, 0.02]], '#1E3A8A', '#172554', 1.6);
  } else {
    // Tường trước cho Khu Ẩm Thực & Sảnh Trái Cây
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 3.85, 0], [-6, 3.85, 0]], wLeft, '#5C341D', 1);
  }

  // 4. MỸ THUẬT TƯỜNG 3 PHÒNG CHỢ BẾN THÀNH (marketWallArt.ts)
  if (typeof drawMarketRoomWalls3D === 'function') {
    drawMarketRoomWalls3D(ctx, cam, room, st.pig, st.t);
  }

  // 5. ĐÈN MÂY TRE ĐAN & QUẠT TRẦN CHỢ BẾN THÀNH (drawLanternGlow3D & drawCeilingFan3D)
  var lamps = [
    [-2.4, 3.6, '#F59E0B', '#FDE68A'], [2.4, 3.6, '#F59E0B', '#FDE68A'],
    [-2.4, 7.6, '#D97706', '#FEF08A'], [2.4, 7.6, '#D97706', '#FEF08A'],
    [-2.4, 11.4, '#EA580C', '#FED7AA'], [2.4, 11.4, '#EA580C', '#FED7AA']
  ];
  for (var li = 0; li < lamps.length; li++) {
    drawLanternGlow3D(ctx, cam, lamps[li][0], 3.02, lamps[li][1], lamps[li][2], lamps[li][3], 0.21, 3.85);
  }
  if (typeof drawCeilingFan3D === 'function') {
    drawCeilingFan3D(ctx, cam, 0, 3.42, 4.8, st.t, 0.2);
    drawCeilingFan3D(ctx, cam, 0, 3.42, 10.2, st.t, 1.7);
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

  // 7. PAINTER'S ALGORITHM Z-SORT CHO SẠP HÀNG, MÓN ĂN & CON NGƯỜI TỪNG PHÒNG
  var items = [];
  function pushItem(wx, wz, fn) {
    items.push({ d: Math.hypot(wx - cam.pos.x, wz - cam.pos.z), fn: fn });
  }

  if (isSouth) {
    // ---- PHÒNG 1: SẢNH CỬA NAM & SẠP VẢI ÁO DÀI ----
    // Quầy gỗ trưng bày cuộn lụa tơ tằm & nón lá dọc Sạp Hương Trinh (trái)
    pushItem(-4.85, 6.5, function() {
      drawBox3D(ctx, cam, -4.95, 0, 6.5, 1.35, 0.86, 9.4, { top: '#8C5229', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
      // Các xấp vải lụa Hà Đông xếp chồng rực rỡ trên mặt sạp
      drawBox3D(ctx, cam, -4.75, 0.86, 3.2, 0.75, 0.24, 1.1, { top: '#E11D48', front: '#BE123C', side: '#9F1239', stroke: '#2B180E' });
      drawBox3D(ctx, cam, -4.75, 0.86, 5.2, 0.75, 0.28, 1.1, { top: '#FACC15', front: '#CA8A04', side: '#A16207', stroke: '#2B180E' });
      drawBox3D(ctx, cam, -4.75, 0.86, 7.4, 0.75, 0.24, 1.1, { top: '#10B981', front: '#059669', side: '#047857', stroke: '#2B180E' });
      drawBox3D(ctx, cam, -4.75, 0.86, 9.6, 0.75, 0.26, 1.1, { top: '#2563EB', front: '#1D4ED8', side: '#1E40AF', stroke: '#2B180E' });
    });

    // Quầy Đặc Sản Liên Sài Gòn & Ngọc Hoa 823 (phải)
    pushItem(4.85, 4.9, function() {
      drawBox3D(ctx, cam, 4.95, 0, 4.9, 1.35, 0.88, 6.2, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
      // Thùng trà sen, hũ mứt nắp đỏ & hộp bánh đậu xanh trên quầy
      drawBox3D(ctx, cam, 4.75, 0.88, 3.0, 0.65, 0.28, 0.85, { top: '#DC2626', front: '#FDE68A', side: '#D97706', stroke: '#2B180E' });
      drawBox3D(ctx, cam, 4.75, 0.88, 4.9, 0.65, 0.30, 0.85, { top: '#16A34A', front: '#15803D', side: '#14532D', stroke: '#2B180E' });
      drawBox3D(ctx, cam, 4.75, 0.88, 6.8, 0.65, 0.26, 0.85, { top: '#F59E0B', front: '#B45309', side: '#78350F', stroke: '#2B180E' });
    });

    for (var si = 0; si < st.southPeople.length; si++) {
      (function(person) {
        pushItem(person.x, person.z, function() { drawHumanTps3D(ctx, cam, person, st.t); });
      })(st.southPeople[si]);
    }
  } else if (isFood) {
    // ---- PHÒNG 2: KHU ẨM THỰC TRUNG TÂM SẠP 1044 ----
    // Đảo Quầy Chữ L SẠP 1044 ở trung tâm với nồi nước lèo nghi ngút khói, dừa xiêm xanh & ghế đôn inox
    pushItem(0, 7.6, function() {
      drawBox3D(ctx, cam, 0, 0, 7.6, 3.1, 0.92, 2.2, { top: '#F8FAFC', front: '#CBD5E1', side: '#94A3B8', stroke: '#1E293B' });
      drawBox3D(ctx, cam, 0, 0.92, 7.6, 3.22, 0.08, 2.32, { top: '#E2E8F0', front: '#94A3B8', side: '#64748B', stroke: '#1E293B' });
      // Nồi nước lèo inox bốc khói, rổ nguyên liệu, tô phở nóng & cụm dừa tươi xiêm xanh
      drawPhoPotSprite3D(ctx, cam, -0.85, 1.02, 7.2, st.t, 0.2);
      drawKitchenIngredientsSprite3D(ctx, cam, 0.15, 1.02, 7.4);
      drawFreshCoconutsCluster3D(ctx, cam, 1.05, 1.04, 7.1);
      drawPhoBowlSprite3D(ctx, cam, -0.95, 1.02, 6.65, 'full', st.t, 0.5);
      drawPhoBowlSprite3D(ctx, cam,  0.85, 1.02, 6.65, 'full', st.t, 1.3);
      drawCondimentCaddySprite3D(ctx, cam, 0.0, 1.02, 6.65);
    });

    // 4 Ghế đôn inox tròn sáng bóng trước quầy Sạp 1044
    var stoolXs = [-1.15, -0.38, 0.38, 1.15];
    for (var sti = 0; sti < stoolXs.length; sti++) {
      (function(sx) {
        pushItem(sx, 5.55, function() {
          drawBox3D(ctx, cam, sx, 0, 5.55, 0.42, 0.52, 0.42, { top: '#E2E8F0', front: '#94A3B8', side: '#64748B', stroke: '#1E293B' });
        });
      })(stoolXs[sti]);
    }

    // Quầy BÁNH CUỐN NÓNG 50K ốp gạch men trắng bên trái + Nồi tráng vải trắng bốc khói
    pushItem(-4.85, 6.4, function() {
      drawBox3D(ctx, cam, -4.95, 0, 6.4, 1.35, 0.88, 8.8, { top: '#F8FAFC', front: '#E2E8F0', side: '#CBD5E1', stroke: '#1E3A8A' });
      drawSteamerPot3D(ctx, cam, -4.65, 0.90, 5.2, st.t);
      drawSteamerPot3D(ctx, cam, -4.65, 0.90, 7.6, st.t + 1.1);
      drawCondimentCaddySprite3D(ctx, cam, -4.65, 0.90, 6.4);
    });

    // Bàn đá mài Terrazzo BÁNH BÈO HUẾ 20K & CHÈ SÀI GÒN bên phải + Mâm 12 chén sứ bánh bèo
    pushItem(4.85, 5.0, function() {
      drawBox3D(ctx, cam, 4.95, 0, 5.0, 1.35, 0.86, 6.0, { top: '#FEF3C7', front: '#D97706', side: '#B45309', stroke: '#2B180E' });
      drawBanhBeoTray3D(ctx, cam, 4.65, 0.90, 3.8);
      drawBanhBeoTray3D(ctx, cam, 4.65, 0.90, 5.8);
      drawBatTrangTeapotSprite3D(ctx, cam, 4.65, 0.90, 4.8);
    });

    for (var fi = 0; fi < st.foodPeople.length; fi++) {
      (function(person) {
        pushItem(person.x, person.z, function() { drawHumanTps3D(ctx, cam, person, st.t); });
      })(st.foodPeople[fi]);
    }
  } else {
    // ---- PHÒNG 3: SẢNH TRÁI CÂY NHIỆT ĐỚI & ĐỒ LƯU NIỆM NÓN LÁ ----
    // Đảo Trái Cây Nhiệt Đới 1029 NGỌC HẢO giữa phòng (Xoài cát vàng, bưởi da xanh, thanh long, sầu riêng & cân đồng hồ)
    pushItem(0, 6.8, function() {
      drawBox3D(ctx, cam, 0, 0, 6.8, 2.8, 0.84, 2.2, { top: '#15803D', front: '#166534', side: '#14532D', stroke: '#2B180E' });
      drawBox3D(ctx, cam, 0, 0.84, 6.8, 2.5, 0.22, 1.8, { top: '#FACC15', front: '#CA8A04', side: '#A16207', stroke: '#2B180E' });
      drawVintageScaleAndFruits3D(ctx, cam, 0, 1.08, 6.6);
      drawFreshCoconutsCluster3D(ctx, cam, -0.95, 0.88, 6.1);
      drawFreshCoconutsCluster3D(ctx, cam,  0.95, 0.88, 6.1);
    });

    // Kệ Gốm Sứ Bát Tràng & Sơn Mài Bến Thành bên trái
    pushItem(-4.85, 6.4, function() {
      drawBox3D(ctx, cam, -4.95, 0, 6.4, 1.30, 0.86, 8.8, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
      drawBatTrangTeapotSprite3D(ctx, cam, -4.65, 0.88, 4.2);
      drawBatTrangTeapotSprite3D(ctx, cam, -4.65, 0.88, 6.4);
      drawBatTrangTeapotSprite3D(ctx, cam, -4.65, 0.88, 8.6);
    });

    // Kệ Nón Lá & Quà Lưu Niệm Sài Gòn bên phải
    pushItem(4.85, 5.0, function() {
      drawBox3D(ctx, cam, 4.95, 0, 5.0, 1.30, 0.86, 6.0, { top: '#8C5229', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
      drawBox3D(ctx, cam, 4.75, 0.86, 3.6, 0.65, 0.24, 0.9, { top: '#E8C574', front: '#CA8A04', side: '#A16207', stroke: '#2B180E' });
      drawBox3D(ctx, cam, 4.75, 0.86, 6.2, 0.65, 0.24, 0.9, { top: '#DC2626', front: '#991B1B', side: '#7F1D1D', stroke: '#2B180E' });
    });

    for (var fri = 0; fri < st.fruitPeople.length; fri++) {
      (function(person) {
        pushItem(person.x, person.z, function() { drawHumanTps3D(ctx, cam, person, st.t); });
      })(st.fruitPeople[fri]);
    }
  }

  // Chú Heo Mascot 1:1 toàn App
  pushItem(st.pig.x, st.pig.z, function() {
    drawPigTps3D(ctx, cam, st.pig, st.t);
    if (st.pig.wearingAoDai || st.pig.ateFood || st.pig.boughtFruit) {
      var tagPr = projectPoint3D(cam, st.pig.x, 1.32, st.pig.z);
      if (tagPr && tagPr.cz > 0.5 && tagPr.cz < 14) {
        ctx.save();
        ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        var badge = st.pig.boughtFruit ? '🥭 XOÀI CÁT' : (st.pig.ateFood ? '🥞 SẠP 1044' : '👘 ÁO DÀI LỤA');
        ctx.fillStyle = 'rgba(43,24,14,0.92)'; ctx.fillRect(tagPr.sx - 42, tagPr.sy - 9, 84, 15);
        ctx.strokeStyle = '#F4B93B'; ctx.lineWidth = 1.2; ctx.strokeRect(tagPr.sx - 42, tagPr.sy - 9, 84, 15);
        ctx.fillStyle = '#FDE047'; ctx.fillText(badge, tagPr.sx, tagPr.sy + 2);
        ctx.restore();
      }
    }
  });

  items.sort(function(a, b) { return b.d - a.d; });
  for (var ii = 0; ii < items.length; ii++) items[ii].fn();

  // 8. Ánh nắng giếng trời Chợ Bến Thành ấm áp + Fade chuyển phòng (200ms) / Fade thoát (240ms)
  ctx.save();
  ctx.fillStyle = 'rgba(255, 224, 145, 0.07)';
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
