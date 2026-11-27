/**
 * Sân Vận Động Trống Đồng FIFA 3 Phòng TPS 3D Độc Bản (Quyết định 246)
 * Kiến trúc 3 phòng riêng biệt 100% (1 Room = 1 Scene, Fade chuyển phòng 200ms, KHÔNG gộp chung):
 * 1. 'locker_tunnel' — Phòng Thay Đồ ĐT Việt Nam & Đường Hầm FIFA:
 *                      Sàn đỏ-vàng & thảm đỏ Đường Hầm, dãy tủ gỗ-đỏ treo Áo Đấu Đỏ Sao Vàng (#10, #19, #22, #9, #4),
 *                      Bảng chiến thuật "CHIẾN THUẬT 4-3-3 · ĐỘI TUYỂN VIỆT NAM", Bể hồi sức Cryo,
 *                      Cầu thủ khởi động, cửa mặt tiền (Z = 0, thoát về Đại Lộ), vòm "RA SÂN THI ĐẤU →" & cửa VIP.
 * 2. 'pitch_arena'   — Đường Biên Sân Cỏ Trống Đồng & Trận Đấu 11v11:
 *                      Mái vòm Trống Đồng Đông Sơn kín (Y = 3.85) + dàn đèn pha SVĐ, khán đài Đỏ-Vàng rực lửa,
 *                      Bảng điện tử LED "VIỆT NAM 2 - 0 ĐỘI KHÁCH", đường pitch điền kinh đỏ + thảm cỏ FIFA 2 tông
 *                      khắc Mặt Trời Trống Đồng, 2 khu kỹ thuật, cầu thủ Đỏ vs Trắng đá bóng 60fps + Trọng tài FIFA,
 *                      tương tác "🥅 Sút bóng ghi bàn & Cổ vũ Việt Nam!".
 * 3. 'trophy_vip'    — Phòng Cúp Vàng & Họp Báo Quốc Tế FIFA:
 *                      Sảnh đá cẩm thạch & thảm đỏ VIP, phông nền "HỌP BÁO QUỐC TẾ · TRỐNG ĐỒNG ARENA",
 *                      Bục kính-vàng trung tâm trưng bày Cúp Vàng Vô Địch & Trống Đồng Đông Sơn,
 *                      Bàn họp báo gắn micro & phóng viên, tương tác "🏆 Nâng Cúp Vàng Vô Địch Việt Nam!".
 */
export function buildStadiumTps3dSceneScript(): string {
  return String.raw`
function createStadiumTpsState() {
  var lockerPlayers = [
    { x: -2.6, z: 5.2, yaw: Math.PI * 0.45, role: 'vn_player', shirt: '#DA251D', hair: '#1C1917', moving: true, seated: false, phase: 0.2 },
    { x: -2.4, z: 8.6, yaw: Math.PI * 0.35, role: 'vn_player', shirt: '#DA251D', hair: '#292524', moving: true, seated: false, phase: 1.6 },
    { x: 3.1,  z: 4.8, yaw: -Math.PI * 0.5, role: 'vn_coach',  shirt: '#1E293B', hair: '#1C1917', moving: false, seated: false, phase: 0.8 }
  ];

  var pitchPlayers = [
    { x: -1.6, z: 6.4, vx: 1.3,  vz: 0.9,  minX: -3.2, maxX: 0.4,  minZ: 4.2, maxZ: 9.8,  yaw: 0.4,  role: 'vn_player',   shirt: '#DA251D', hair: '#1C1917', moving: true, seated: false, phase: 0.0 },
    { x: 1.4,  z: 8.2, vx: -1.2, vz: 1.0,  minX: -0.6, maxX: 3.2,  minZ: 5.2, maxZ: 11.4, yaw: -0.5, role: 'vn_player',   shirt: '#DA251D', hair: '#292524', moving: true, seated: false, phase: 1.2 },
    { x: -0.8, z: 9.6, vx: 1.1,  vz: -0.8, minX: -2.8, maxX: 2.2,  minZ: 6.0, maxZ: 11.8, yaw: 1.8,  role: 'away_player', shirt: '#F8FAFC', hair: '#451A03', moving: true, seated: false, phase: 2.1 },
    { x: 1.9,  z: 5.8, vx: -1.0, vz: 1.1,  minX: -1.5, maxX: 3.3,  minZ: 4.0, maxZ: 9.6,  yaw: -1.2, role: 'away_player', shirt: '#F8FAFC', hair: '#1E293B', moving: true, seated: false, phase: 3.0 },
    { x: 0.0,  z: 12.9, vx: 0.9, vz: 0.0,  minX: -1.2, maxX: 1.2,  minZ: 12.8, maxZ: 13.0, yaw: Math.PI, role: 'gk',      shirt: '#FACC15', hair: '#1C1917', moving: true, seated: false, phase: 0.5 },
    { x: -2.8, z: 7.4, vx: 0.4,  vz: 0.7,  minX: -3.6, maxX: -1.8, minZ: 4.8, maxZ: 10.2, yaw: 1.2,  role: 'referee',     shirt: '#FDE047', hair: '#111827', moving: true, seated: false, phase: 1.5 }
  ];

  var vipStaff = [
    { x: -2.5, z: 5.8, yaw: Math.PI * 0.2,  role: 'press', shirt: '#1E293B', hair: '#1C1917', moving: false, seated: false, phase: 0.4 },
    { x: 2.5,  z: 5.8, yaw: -Math.PI * 0.2, role: 'press', shirt: '#0F766E', hair: '#292524', moving: false, seated: false, phase: 1.4 },
    { x: 0.0,  z: 13.2, yaw: Math.PI,       role: 'vn_captain', shirt: '#DA251D', hair: '#1C1917', moving: false, seated: false, phase: 2.2 }
  ];

  return {
    room: 'locker_tunnel',
    pendingRoom: '',
    roomFade: 0,
    pig: {
      x: 0, z: 1.45, yaw: 0, targetX: 0, targetZ: 2.6,
      walking: true, seated: false, eating: false,
      wearingVietnamKit: false, liftedTrophy: false
    },
    lockerPlayers: lockerPlayers,
    pitchPlayers: pitchPlayers,
    vipStaff: vipStaff,
    ball: {
      x: 0.0, y: 0.12, z: 7.4,
      tx: 1.4, tz: 8.2,
      shooting: false,
      shootT: 0
    },
    vnScore: 2,
    goalFlashUntil: 0,
    confettiUntil: 0,
    leftDoorOpen: 0.0,
    rightDoorOpen: 0.0,
    exitFade: 0,
    exiting: false,
    ripples: [],
    toast: 'SVĐ Trống Đồng FIFA · Phòng Thay Đồ ĐT Việt Nam & Đường Hầm Ra Sân! ⚽🇻🇳',
    toastUntil: 5.2,
    t: 0
  };
}

function clampStadiumWalkPos(st, x, z) {
  var nx = Math.max(-5.1, Math.min(5.1, x));
  var nz = Math.max(0.65, Math.min(13.2, z));
  var boxes = [];
  if (st.room === 'locker_tunnel') {
    boxes = [
      { x1: -5.95, z1: 1.7,  x2: -4.45, z2: 11.7 }, // Dãy ghế & tủ cầu thủ trái
      { x1: 2.75,  z1: 7.4,  x2: 4.55,  z2: 9.2 },  // Bể hồi sức Cryo
      { x1: -1.05, z1: 5.1,  x2: 1.05,  z2: 6.5 }   // Bàn chiến thuật & dụng cụ giữa phòng
    ];
  } else if (st.room === 'pitch_arena') {
    boxes = [
      { x1: -5.95, z1: 4.8,  x2: -4.25, z2: 9.2 },  // Khu kỹ thuật ĐT Việt Nam
      { x1: 4.25,  z1: 3.4,  x2: 5.95,  z2: 7.6 },  // Khu kỹ thuật Đội Khách
      { x1: -1.95, z1: 12.8, x2: 1.95,  z2: 14.6 }  // Khung thành FIFA phía Bắc
    ];
  } else {
    boxes = [
      { x1: -1.25, z1: 7.3,  x2: 1.25,  z2: 9.3 },  // Bục kính trưng bày Cúp Vàng & Trống Đồng
      { x1: -2.45, z1: 11.6, x2: 2.45,  z2: 13.0 }  // Bàn Họp Báo Quốc Tế FIFA
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

function triggerStadiumRoom(st, roomId) {
  if (!roomId || st.pendingRoom || st.room === roomId) return;
  if (roomId !== 'locker_tunnel' && roomId !== 'pitch_arena' && roomId !== 'trophy_vip') return;
  st.pendingRoom = roomId;
  st.pig.walking = false;
  st.pig.seated = false;
}

function stepStadiumTps(st, dt) {
  st.t += dt;
  var p = st.pig;

  // 1. Chuyển phòng mượt 200ms (1 Room = 1 Scene, zero merging)
  if (st.pendingRoom) {
    st.roomFade = Math.min(1, st.roomFade + dt * 5.2);
    if (st.roomFade >= 0.99) {
      var prev = st.room;
      st.room = st.pendingRoom;
      st.pendingRoom = '';
      if (st.room === 'pitch_arena') {
        p.x = 0.0; p.z = 2.1; p.yaw = 0;
        p.targetX = 0.0; p.targetZ = 3.8; p.walking = true;
        st.toast = 'Sân Cỏ Trống Đồng FIFA · Trận đấu 11v11 đang rực lửa! Sút bóng ghi bàn ngay ⚽🥅';
      } else if (st.room === 'trophy_vip') {
        p.x = 0.0; p.z = 3.2; p.yaw = 0;
        p.targetX = 0.0; p.targetZ = 5.8; p.walking = true;
        st.toast = 'Phòng Cúp Vàng & Họp Báo Quốc Tế FIFA · Chiêm ngưỡng Trống Đồng & Cúp Vàng! 🏆';
      } else {
        if (prev === 'pitch_arena') {
          p.x = 0.0; p.z = 11.8; p.yaw = Math.PI;
          p.targetX = 0.0; p.targetZ = 9.4; p.walking = true;
        } else {
          p.x = 3.6; p.z = 9.6; p.yaw = -Math.PI * 0.5;
          p.targetX = 1.6; p.targetZ = 8.4; p.walking = true;
        }
        st.toast = 'Phòng Thay Đồ ĐT Việt Nam & Đường Hầm FIFA · Mặc áo đấu Sao Vàng nhé! 👕🇻🇳';
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
      var next = clampStadiumWalkPos(st, p.x + (dx / dist) * spd, p.z + (dz / dist) * spd);
      p.x = next.x; p.z = next.z;
      p.yaw = Math.atan2(dx, dz);
    }
  }

  // 3. Chuyển động 60fps của dàn cầu thủ & quả bóng trên Sân Cỏ Trống Đồng
  if (st.room === 'pitch_arena') {
    for (var pi = 0; pi < st.pitchPlayers.length; pi++) {
      var pl = st.pitchPlayers[pi];
      pl.x += pl.vx * dt;
      pl.z += pl.vz * dt;
      if (pl.x < pl.minX) { pl.x = pl.minX; pl.vx = Math.abs(pl.vx); }
      if (pl.x > pl.maxX) { pl.x = pl.maxX; pl.vx = -Math.abs(pl.vx); }
      if (pl.z < pl.minZ) { pl.z = pl.minZ; pl.vz = Math.abs(pl.vz); }
      if (pl.z > pl.maxZ) { pl.z = pl.maxZ; pl.vz = -Math.abs(pl.vz); }
      pl.yaw = Math.atan2(pl.vx, pl.vz);
    }
    var b = st.ball;
    if (b.shooting) {
      b.shootT += dt * 1.9;
      b.x += (0.0 - b.x) * Math.min(1, dt * 7.5);
      b.z += (13.35 - b.z) * Math.min(1, dt * 7.5);
      b.y = 0.12 + Math.sin(Math.min(1, b.shootT) * Math.PI) * 0.65;
      if (b.shootT >= 1.0) {
        b.shooting = false;
        b.shootT = 0;
        b.x = 0.0; b.y = 0.12; b.z = 7.4;
      }
    } else {
      var carrier = st.pitchPlayers[Math.floor(st.t * 0.75) % 4];
      if (carrier) {
        b.x += (carrier.x - b.x) * Math.min(1, dt * 3.8);
        b.z += (carrier.z - b.z) * Math.min(1, dt * 3.8);
        b.y = 0.12 + Math.abs(Math.sin(st.t * 9)) * 0.16;
      }
    }
  }

  // 4. Cửa mặt tiền mở khi rời SVĐ về Đại Lộ
  var targetDoor = (st.room === 'locker_tunnel' && st.exiting) ? 0.90 : 0.0;
  st.rightDoorOpen += (targetDoor - st.rightDoorOpen) * Math.min(1, dt * 6.0);
  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.2);

  // 5. Vòng sóng Tap-to-Walk
  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== HELPER VẼ QUẢ BÓNG, KHUNG THÀNH, CÚP VÀNG & TRỐNG ĐỒNG 3D ==================== */
function drawFootballSprite3D(ctx, cam, wx, wy, wz) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 24 || pr.cz < 0.35) return;
  var r = Math.max(3, Math.min(14, pr.scale * 0.18));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  ctx.fillStyle = 'rgba(15,23,42,0.34)';
  ctx.beginPath(); ctx.ellipse(px, py + r * 0.75, r * 1.1, r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#111827'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#111827';
  ctx.beginPath(); ctx.arc(px, py, r * 0.36, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(px - r * 0.7, py - r * 0.15, r * 0.3, r * 0.3);
  ctx.fillRect(px + r * 0.4, py - r * 0.15, r * 0.3, r * 0.3);
  ctx.restore();
}

function drawGoldenTrophySprite3D(ctx, cam, wx, wy, wz, t) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 22 || pr.cz < 0.4) return;
  var u = Math.max(0.55, Math.min(3.4, pr.scale / 36));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  // Quầng hào quang vàng rực rỡ quanh Cúp Vàng Vô Địch
  ctx.globalAlpha = 0.26 + Math.sin(t * 4) * 0.08;
  ctx.fillStyle = '#FDE047';
  ctx.beginPath(); ctx.arc(px, py - 12 * u, 16 * u, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  // Đế cúp malachite xanh ngọc lục bảo 2 vòng chuẩn FIFA World Cup
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(px - 6 * u, py - 3 * u, 12 * u, 3 * u);
  ctx.fillStyle = '#16A34A';
  ctx.fillRect(px - 5.2 * u, py - 5 * u, 10.4 * u, 2 * u);
  // Thân cúp vàng xoắn nâng quả địa cầu vàng
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(px - 3.5 * u, py - 15 * u, 7 * u, 10 * u);
  ctx.fillStyle = '#FDE047';
  ctx.fillRect(px - 2.2 * u, py - 15 * u, 3.2 * u, 10 * u);
  // Quả cầu vàng đỉnh cúp
  ctx.fillStyle = '#FACC15'; ctx.strokeStyle = '#78350F'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(px, py - 19 * u, 6.2 * u, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FEF9C3';
  ctx.beginPath(); ctx.arc(px - 2 * u, py - 20.5 * u, 2.0 * u, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawBronzeDrumSprite3D(ctx, cam, wx, wy, wz) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 22 || pr.cz < 0.4) return;
  var u = Math.max(0.5, Math.min(3.2, pr.scale / 36));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  // Thân Trống Đồng Đông Sơn mạ vàng đồng cổ kính
  ctx.fillStyle = '#92400E'; ctx.strokeStyle = '#451A03'; ctx.lineWidth = 1.2;
  ctx.fillRect(px - 8 * u, py - 10 * u, 16 * u, 10 * u);
  ctx.strokeRect(px - 8 * u, py - 10 * u, 16 * u, 10 * u);
  ctx.fillStyle = '#D97706';
  ctx.fillRect(px - 9 * u, py - 12 * u, 18 * u, 3.5 * u);
  ctx.strokeRect(px - 9 * u, py - 12 * u, 18 * u, 3.5 * u);
  // Hoa văn Mặt Trời Đông Sơn trên tang trống
  ctx.fillStyle = '#FDE047';
  ctx.beginPath(); ctx.arc(px, py - 6 * u, 3.2 * u, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/* ==================== VẼ KHÔNG GIAN 3 PHÒNG SÂN VẬN ĐỘNG TRỐNG ĐỒNG FIFA TPS 3D ==================== */
function renderStadiumTpsScene(ctx, cam, st, W, H) {
  var room = st.room;
  var isLocker = room === 'locker_tunnel';
  var isPitch = room === 'pitch_arena';
  var isTrophy = room === 'trophy_vip';

  ctx.fillStyle = isPitch ? '#0F172A' : (isTrophy ? '#3B0D0C' : '#2B120C');
  ctx.fillRect(0, 0, W, H);

  // 1. SÀN NHÀ RIÊNG BIỆT CHO TỪNG PHÒNG
  if (isLocker) {
    // Sàn Phòng Thay Đồ ĐT Việt Nam (Gạch xám thể thao + Thảm Đỏ Sao Vàng dẫn thẳng ra Đường Hầm)
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#334155', '#1E293B', 1);
    for (var lz = 0; lz < 14.4; lz += 1.6) {
      drawPoly3D(ctx, cam, [[-6, 0.004, lz], [6, 0.004, lz], [6, 0.004, lz + 0.8], [-6, 0.004, lz + 0.8]], '#3E4C5E', null, 0);
    }
    // Thảm Đỏ Đường Hầm FIFA viền vàng chạy dọc tâm phòng tới vòm RA SÂN
    drawPoly3D(ctx, cam, [[-1.65, 0.008, 0.3], [1.65, 0.008, 0.3], [1.65, 0.008, 14.7], [-1.65, 0.008, 14.7]], '#991B1B', '#F4B93B', 1.8);
    drawPoly3D(ctx, cam, [[-1.35, 0.012, 0.5], [1.35, 0.012, 0.5], [1.35, 0.012, 14.5], [-1.35, 0.012, 14.5]], '#B91C1C', '#FDE047', 1.0);
  } else if (isPitch) {
    // Đường chạy điền kinh đỏ terracotta bao quanh + Thảm cỏ FIFA 2 tông xanh mượt mà
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#9A3412', '#7C2D12', 1);
    drawPoly3D(ctx, cam, [[-4.4, 0.005, 1.2], [4.4, 0.005, 1.2], [4.4, 0.005, 13.8], [-4.4, 0.005, 13.8]], '#15803D', '#FFFFFF', 2.0);
    for (var pz = 1.2; pz < 13.4; pz += 1.6) {
      drawPoly3D(ctx, cam, [[-4.36, 0.008, pz], [4.36, 0.008, pz], [4.36, 0.008, pz + 0.8], [-4.36, 0.008, pz + 0.8]], '#16A34A', null, 0);
    }
    // Vạch kẻ sân trắng chuẩn FIFA + Vòng tròn Mặt Trời Trống Đồng giữa sân (Z = 7.4)
    drawPoly3D(ctx, cam, [[-4.36, 0.012, 7.36], [4.36, 0.012, 7.36], [4.36, 0.012, 7.44], [-4.36, 0.012, 7.44]], '#FFFFFF', null, 0);
    drawPoly3D(ctx, cam, [[-2.4, 0.012, 11.4], [2.4, 0.012, 11.4], [2.4, 0.012, 13.78], [-2.4, 0.012, 13.78]], 'rgba(255,255,255,0.08)', '#FFFFFF', 1.6);
    drawPoly3D(ctx, cam, [[-1.3, 0.014, 6.2], [1.3, 0.014, 6.2], [1.3, 0.014, 8.6], [-1.3, 0.014, 8.6]], 'rgba(250,204,21,0.18)', '#FDE047', 1.5);
  } else {
    // Sàn đá cẩm thạch kem sang trọng & Thảm Đỏ Hoàng Gia dẫn tới Bục Cúp Vàng
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#E7E0D0', '#A89F8D', 1);
    for (var vx = -6; vx < 6; vx += 1.5) {
      for (var vz = 0; vz < 14.4; vz += 1.5) {
        if (((Math.round(vx / 1.5) + Math.round(vz / 1.5)) % 2) === 0) {
          drawPoly3D(ctx, cam, [[vx, 0.004, vz], [vx + 1.5, 0.004, vz], [vx + 1.5, 0.004, vz + 1.5], [vx, 0.004, vz + 1.5]], '#D6CCB8', null, 0);
        }
      }
    }
    drawPoly3D(ctx, cam, [[-1.95, 0.01, 1.0], [1.95, 0.01, 1.0], [1.95, 0.01, 13.6], [-1.95, 0.01, 13.6]], '#991B1B', '#F4B93B', 2.0);
  }

  // 2. TRẦN / MÁI VÒM TRỐNG ĐỒNG ĐÔNG SƠN KÍN 100% (Y = 3.85)
  var ceilCol = isPitch ? '#1E293B' : (isTrophy ? '#451A03' : '#3B1810');
  drawPoly3D(ctx, cam, [[-6, 3.85, 0], [6, 3.85, 0], [6, 3.85, 14.8], [-6, 3.85, 14.8]], ceilCol, '#F4B93B', 1.2);
  for (var bz = 2.0; bz <= 13.4; bz += 2.6) {
    drawPoly3D(ctx, cam, [[-6, 3.74, bz - 0.14], [6, 3.74, bz - 0.14], [6, 3.74, bz + 0.14], [-6, 3.74, bz + 0.14]], isPitch ? '#334155' : '#78350F', '#F4B93B', 1);
  }

  // 3. 4 BỨC TƯỜNG RIÊNG BIỆT CHO TỪNG PHÒNG
  var wLeft  = isPitch ? '#1E293B' : (isTrophy ? '#5C1916' : '#4A1812');
  var wRight = isPitch ? '#1E293B' : (isTrophy ? '#521513' : '#42140F');
  var wBack  = isPitch ? '#0F172A' : (isTrophy ? '#4A1210' : '#3B100C');
  drawPoly3D(ctx, cam, [[-6, 0, 0], [-6, 0, 14.8], [-6, 3.85, 14.8], [-6, 3.85, 0]], wLeft, '#78350F', 1);
  drawPoly3D(ctx, cam, [[6, 0, 14.8], [6, 0, 0], [6, 3.85, 0], [6, 3.85, 14.8]], wRight, '#78350F', 1);
  drawPoly3D(ctx, cam, [[-6, 0, 14.8], [6, 0, 14.8], [6, 3.85, 14.8], [-6, 3.85, 14.8]], wBack, '#78350F', 1);

  if (isLocker) {
    // Tường mặt tiền Phòng Thay Đồ (Z = 0) với cửa kính đồng Trống Đồng (thoát về Đại Lộ)
    drawPoly3D(ctx, cam, [[-6, 0, 0], [-1.35, 0, 0], [-1.35, 3.85, 0], [-6, 3.85, 0]], '#4A1812', '#F4B93B', 1);
    drawPoly3D(ctx, cam, [[1.35, 0, 0], [6, 0, 0], [6, 3.85, 0], [1.35, 3.85, 0]], '#4A1812', '#F4B93B', 1);
    drawPoly3D(ctx, cam, [[-1.35, 2.74, 0], [1.35, 2.74, 0], [1.35, 3.85, 0], [-1.35, 3.85, 0]], '#7F1D1D', '#F4B93B', 1.2);
    drawPoly3D(ctx, cam, [[-1.35, 0, -0.04], [1.35, 0, -0.04], [1.35, 2.74, -0.04], [-1.35, 2.74, -0.04]], '#FFFDF0', '#FDE68A', 0.8);
    var rAng = st.rightDoorOpen * 0.92;
    drawPoly3D(ctx, cam, [[-1.35, 0, 0.02], [-0.02, 0, 0.02], [-0.02, 2.72, 0.02], [-1.35, 2.72, 0.02]], '#78350F', '#F4B93B', 1.6);
    var rx1 = 1.35 - Math.cos(rAng) * 1.33, rz1 = 0.02 + Math.sin(rAng) * 1.33;
    drawPoly3D(ctx, cam, [[1.35, 0, 0.02], [rx1, 0, rz1], [rx1, 2.72, rz1], [1.35, 2.72, 0.02]], '#78350F', '#F4B93B', 1.6);
  } else {
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 3.85, 0], [-6, 3.85, 0]], wLeft, '#78350F', 1);
  }

  // 4. MỸ THUẬT TƯỜNG 3 PHÒNG (stadiumWallArt.ts)
  if (typeof drawStadiumRoomWalls3D === 'function') {
    drawStadiumRoomWalls3D(ctx, cam, room, st);
  }

  // 5. ĐÈN PHA SVĐ / ĐÈN LỒNG HOÀNG GIA TREO TRẦN (drawLanternGlow3D)
  var lights = isPitch
    ? [[-3.4, 3.8, '#FEF08A', '#FFFFFF'], [3.4, 3.8, '#FEF08A', '#FFFFFF'], [-3.4, 9.6, '#FEF08A', '#FFFFFF'], [3.4, 9.6, '#FEF08A', '#FFFFFF'], [0, 7.2, '#FDE047', '#FEF9C3']]
    : [[-2.4, 4.2, '#EF4444', '#FCA5A5'], [2.4, 4.2, '#F59E0B', '#FDE68A'], [-2.4, 9.4, '#FACC15', '#FEF08A'], [2.4, 9.4, '#DC2626', '#FCA5A5'], [0, 12.0, '#F59E0B', '#FDE68A']];
  for (var li = 0; li < lights.length; li++) {
    drawLanternGlow3D(ctx, cam, lights[li][0], 3.05, lights[li][1], lights[li][2], lights[li][3], 0.22, 3.85);
  }

  // 6. Vòng sóng Tap-to-Walk trên sàn
  for (var ri = 0; ri < st.ripples.length; ri++) {
    var rp = st.ripples[ri];
    var rPr = projectPoint3D(cam, rp.x, 0.02, rp.z);
    if (rPr) {
      ctx.save();
      ctx.strokeStyle = 'rgba(250,204,21,' + (1 - rp.t / 0.75).toFixed(2) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(rPr.sx, rPr.sy, (6 + rp.t * 28), (3 + rp.t * 12), 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 7. PAINTER'S ALGORITHM Z-SORT CHO NỘI THẤT, CẦU THỦ & CÚP VÀNG
  var items = [];
  function pushItem(wx, wz, fn) {
    items.push({ d: Math.hypot(wx - cam.pos.x, wz - cam.pos.z), fn: fn });
  }

  if (isLocker) {
    // Ghế băng gỗ-đỏ trước dãy tủ cầu thủ ĐT Việt Nam (trái)
    pushItem(-4.95, 6.6, function() {
      drawBox3D(ctx, cam, -5.0, 0, 6.6, 1.15, 0.48, 9.6, { top: '#991B1B', front: '#7F1D1D', side: '#450A0A', stroke: '#F4B93B' });
      drawFootballSprite3D(ctx, cam, -4.85, 0.56, 3.8);
      drawFootballSprite3D(ctx, cam, -4.85, 0.56, 8.8);
    });

    // Bàn Chiến Thuật & Bóng Thi Đấu chính giữa phòng
    pushItem(0, 5.8, function() {
      drawBox3D(ctx, cam, 0, 0, 5.8, 1.75, 0.76, 1.15, { top: '#166534', front: '#78350F', side: '#451A03', stroke: '#F4B93B' });
      drawFootballSprite3D(ctx, cam, -0.35, 0.86, 5.8);
      drawFootballSprite3D(ctx, cam,  0.35, 0.86, 5.8);
    });

    // Bể Ngâm Đá Hồi Sức Cryo (Recovery Cryo Tub — góc phải)
    pushItem(3.65, 8.3, function() {
      drawBox3D(ctx, cam, 3.65, 0, 8.3, 1.45, 0.68, 1.45, { top: '#38BDF8', front: '#CBD5E1', side: '#94A3B8', stroke: '#0284C7' });
      drawBox3D(ctx, cam, 3.65, 0.68, 8.3, 1.25, 0.06, 1.25, { top: '#BAE6FD', front: '#7DD3FC', side: '#38BDF8', stroke: '#0369A1' });
    });

    // Cầu thủ ĐT Việt Nam đang khởi động & HLV trưởng
    for (var lpi = 0; lpi < st.lockerPlayers.length; lpi++) {
      (function(pl) {
        pushItem(pl.x, pl.z, function() { drawHumanTps3D(ctx, cam, pl, st.t); });
      })(st.lockerPlayers[lpi]);
    }
  } else if (isPitch) {
    // Khung thành FIFA 3D phía Bắc (Z = 13.45)
    pushItem(0, 13.45, function() {
      // Cột dọc trái, cột dọc phải & xà ngang trắng chuẩn FIFA
      drawBox3D(ctx, cam, -1.75, 0, 13.45, 0.14, 1.85, 0.14, { top: '#FFFFFF', front: '#F8FAFC', side: '#E2E8F0', stroke: '#0F172A' });
      drawBox3D(ctx, cam,  1.75, 0, 13.45, 0.14, 1.85, 0.14, { top: '#FFFFFF', front: '#F8FAFC', side: '#E2E8F0', stroke: '#0F172A' });
      drawBox3D(ctx, cam,  0.00, 1.75, 13.45, 3.64, 0.14, 0.14, { top: '#FFFFFF', front: '#F8FAFC', side: '#E2E8F0', stroke: '#0F172A' });
      // Lưới khung thành mờ phía sau
      drawBox3D(ctx, cam,  0.00, 0, 13.85, 3.45, 1.72, 0.65, { top: 'rgba(241,245,249,0.22)', front: 'rgba(226,232,240,0.20)', side: 'rgba(203,213,225,0.22)', stroke: '#CBD5E1' });
    });

    // Khu kỹ thuật ĐT Việt Nam (Trái) & Đội Khách (Phải)
    pushItem(-5.0, 7.0, function() {
      drawBox3D(ctx, cam, -5.0, 0, 7.0, 1.1, 0.45, 3.6, { top: '#DA251D', front: '#991B1B', side: '#7F1D1D', stroke: '#FDE047' });
      drawBox3D(ctx, cam, -5.1, 0.45, 7.0, 1.2, 1.15, 3.7, { top: 'rgba(153,27,27,0.75)', front: 'rgba(127,29,29,0.45)', side: 'rgba(69,10,10,0.55)', stroke: '#F4B93B' });
    });
    pushItem(5.0, 5.5, function() {
      drawBox3D(ctx, cam, 5.0, 0, 5.5, 1.1, 0.45, 3.6, { top: '#1E40AF', front: '#1E3A8A', side: '#172554', stroke: '#93C5FD' });
    });

    // Quả bóng FIFA 3D trên sân
    pushItem(st.ball.x, st.ball.z, function() {
      drawFootballSprite3D(ctx, cam, st.ball.x, st.ball.y, st.ball.z);
    });

    // 6 Cầu thủ ĐT Việt Nam (Đỏ) + Đội Khách (Trắng) + Thủ môn + Trọng tài chạy 60fps
    for (var ppi = 0; ppi < st.pitchPlayers.length; ppi++) {
      (function(pl) {
        pushItem(pl.x, pl.z, function() { drawHumanTps3D(ctx, cam, pl, st.t); });
      })(st.pitchPlayers[ppi]);
    }
  } else {
    // PHÒNG CÚP VÀNG & HỌP BÁO QUỐC TẾ FIFA:
    // Bục Kính-Vàng Trung Tâm Trưng Bày Cúp Vàng Vô Địch & Trống Đồng Đông Sơn (Z = 8.3)
    pushItem(0, 8.3, function() {
      drawBox3D(ctx, cam, 0, 0, 8.3, 2.15, 0.92, 1.45, { top: '#7F1D1D', front: '#451A03', side: '#3B100C', stroke: '#FDE047' });
      drawBox3D(ctx, cam, 0, 0.92, 8.3, 2.28, 0.10, 1.58, { top: '#F4B93B', front: '#D97706', side: '#B45309', stroke: '#2B180E' });
      drawGoldenTrophySprite3D(ctx, cam, -0.42, 1.05, 8.3, st.t);
      drawBronzeDrumSprite3D(ctx, cam, 0.48, 1.04, 8.3);
    });

    // Bàn Họp Báo Quốc Tế FIFA gắn Micro (Z = 12.2)
    pushItem(0, 12.2, function() {
      drawBox3D(ctx, cam, 0, 0, 12.2, 4.4, 0.86, 1.15, { top: '#991B1B', front: '#7F1D1D', side: '#450A0A', stroke: '#FDE047' });
      drawBox3D(ctx, cam, -1.1, 0.86, 11.9, 0.16, 0.26, 0.16, { top: '#1E293B', front: '#0F172A', side: '#334155', stroke: '#FDE047' });
      drawBox3D(ctx, cam,  0.0, 0.86, 11.9, 0.16, 0.26, 0.16, { top: '#DC2626', front: '#991B1B', side: '#7F1D1D', stroke: '#FDE047' });
      drawBox3D(ctx, cam,  1.1, 0.86, 11.9, 0.16, 0.26, 0.16, { top: '#1E293B', front: '#0F172A', side: '#334155', stroke: '#FDE047' });
    });

    // Phóng viên quốc tế & Đội trưởng ĐT Việt Nam
    for (var vi = 0; vi < st.vipStaff.length; vi++) {
      (function(emp) {
        pushItem(emp.x, emp.z, function() { drawHumanTps3D(ctx, cam, emp, st.t); });
      })(st.vipStaff[vi]);
    }
  }

  // Chú Heo Mascot 1:1 toàn App + Huy hiệu Áo Đấu ĐT Việt Nam / Cúp Vàng Vô Địch
  pushItem(st.pig.x, st.pig.z, function() {
    drawPigTps3D(ctx, cam, st.pig, st.t);
    if (st.pig.wearingVietnamKit || st.pig.liftedTrophy) {
      var tagPr = projectPoint3D(cam, st.pig.x, 1.34, st.pig.z);
      if (tagPr && tagPr.cz > 0.5 && tagPr.cz < 15) {
        ctx.save();
        ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        var label = st.pig.liftedTrophy ? '🏆 VÔ ĐỊCH VN ★' : '🇻🇳 ĐT VIỆT NAM #10';
        ctx.fillStyle = '#991B1B'; ctx.fillRect(tagPr.sx - 46, tagPr.sy - 9, 92, 15);
        ctx.strokeStyle = '#FDE047'; ctx.lineWidth = 1.4; ctx.strokeRect(tagPr.sx - 46, tagPr.sy - 9, 92, 15);
        ctx.fillStyle = '#FDE047'; ctx.fillText(label, tagPr.sx, tagPr.sy + 2);
        ctx.restore();
      }
    }
  });

  items.sort(function(a, b) { return b.d - a.d; });
  for (var ii = 0; ii < items.length; ii++) items[ii].fn();

  // 8. Pháo giấy Vàng-Đỏ ăn mừng Bàn Thắng / Nâng Cúp Vàng + Fade chuyển phòng (200ms)
  ctx.save();
  if ((st.goalFlashUntil && st.t < st.goalFlashUntil) || (st.confettiUntil && st.t < st.confettiUntil)) {
    for (var ci = 0; ci < 26; ci++) {
      var cx = ((ci * 53 + Math.round(st.t * 90)) % W);
      var cy = ((ci * 37 + Math.round(st.t * 140)) % H);
      ctx.fillStyle = (ci % 2 === 0) ? '#FDE047' : '#DC2626';
      ctx.fillRect(cx, cy, 5, 5);
    }
  }
  var fAlpha = Math.max(st.exitFade, st.roomFade);
  if (fAlpha > 0.01) {
    ctx.fillStyle = st.roomFade > st.exitFade
      ? 'rgba(28, 12, 8, ' + st.roomFade.toFixed(2) + ')'
      : 'rgba(246, 238, 220, ' + st.exitFade.toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
`;
}
