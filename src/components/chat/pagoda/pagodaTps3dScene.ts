/**
 * Ngôi Chùa Cổ Kính & Vườn Chùa 3 Phòng TPS 3D Độc Bản (Quyết định 245)
 * 3 Phòng tách biệt hoàn toàn (1 Phòng = 1 Cảnh, chuyển phòng mượt 200ms fade, ZERO merging):
 * - 'garden' (Vườn Chùa Thanh Tịnh): Sân gạch tàu đỏ ấm, tường vàng đất mái ngói đỏ cong, bầu trời nắng vàng thanh tịnh,
 *   Hồ Sen & Chùa Một Cột giữa hồ bên trái, Cây Đa Cổ Thụ bên phải, Cổng Tam Quan (Z = 0), bậc tam cấp vào Chánh Điện
 *   & cổng vòm tre trúc sang Tháp Chuông - Thiền Trà.
 * - 'main_hall' (Chánh Điện Trang Nghiêm): Không gian gỗ gụ thếp vàng, 6 cột son đỏ, trần ô hoa sen vàng,
 *   Tượng Phật Vàng trên tòa sen hồng-vàng tỏa hào quang, Lư Hương Đồng nghi ngút khói trầm, đèn lồng lụa đỏ,
 *   chiếu lạy & sư thầy/Phật tử, tương tác "🙏 Dâng hương cầu bình an".
 * - 'bell_tea' (Tháp Chuông & Góc Thiền Trà): Nhà gỗ thanh tịnh có cửa sổ trúc xanh, Đại Hồng Chung đồng cổ treo trên
 *   giá gỗ son cùng chày gỗ (tương tác "🔔 Thỉnh Đại Hồng Chung" ngân vang & đung đưa), bàn trà gỗ thấp với bộ ấm trà
 *   Bát Tràng (drawBatTrangTeapotSprite3D) & bức thư pháp "TÂM AN".
 */
export function buildPagodaTps3dSceneScript(): string {
  return String.raw`
function createPagodaTpsState() {
  var gardenMonk = {
    x: 1.65, z: 4.8, yaw: 0, role: 'monk', shirt: '#D97706', hair: '#C29B70',
    seated: false, moving: true, phase: 0.4, patrolDir: 1
  };
  var hallWorshippers = [
    { x: -2.25, z: 7.2, yaw: 0, role: 'monk', shirt: '#D97706', hair: '#C29B70', seated: true, moving: false, phase: 0.2 },
    { x:  2.25, z: 7.2, yaw: 0, role: 'worshipper', shirt: '#78350F', hair: '#1C1917', seated: true, moving: false, phase: 1.4 }
  ];
  var teaMaster = {
    x: 3.55, z: 8.4, yaw: -Math.PI / 2, role: 'monk', shirt: '#B45309', hair: '#C29B70',
    seated: true, moving: false, phase: 0.8
  };

  return {
    room: 'garden',
    pendingRoom: '',
    roomFade: 0,
    pig: {
      x: 0, z: 1.35, yaw: 0, targetX: 0, targetZ: 2.3,
      walking: true, seated: false, eating: false
    },
    gardenMonk: gardenMonk,
    hallWorshippers: hallWorshippers,
    teaMaster: teaMaster,
    incenseGlow: 0,
    bellRingTimer: 0,
    bellSwingPhase: 0,
    exitFade: 0,
    exiting: false,
    ripples: [],
    toast: 'Vườn Chùa Thanh Tịnh · Ngắm Chùa Một Cột, vào Chánh Điện hay sang Thiền Trà 🪷',
    toastUntil: 5.2,
    t: 0
  };
}

function clampPagodaWalkPos(st, x, z) {
  var nx = Math.max(-5.15, Math.min(5.15, x));
  var nz = Math.max(0.75, Math.min(13.6, z));
  var boxes = [];
  if (st.room === 'garden') {
    boxes = [
      { x1: -5.25, z1: 3.55, x2: -1.05, z2: 9.75 }, // Hồ Sen & Chùa Một Cột
      { x1: 3.25, z1: 5.75, x2: 5.05, z2: 7.95 }    // Gốc Cây Đa Cổ Thụ
    ];
  } else if (st.room === 'main_hall') {
    boxes = [
      { x1: -3.25, z1: 11.2, x2: 3.25, z2: 14.5 },  // Bàn thờ & Tượng Phật Vàng
      { x1: -0.95, z1: 8.85, x2: 0.95, z2: 10.15 }, // Lư Hương Đồng
      { x1: -4.65, z1: 3.05, x2: -3.75, z2: 3.85 }, // Cột son trái 1
      { x1:  3.75, z1: 3.05, x2:  4.65, z2: 3.85 }, // Cột son phải 1
      { x1: -4.65, z1: 7.25, x2: -3.75, z2: 8.05 }, // Cột son trái 2
      { x1:  3.75, z1: 7.25, x2:  4.65, z2: 8.05 }  // Cột son phải 2
    ];
  } else if (st.room === 'bell_tea') {
    boxes = [
      { x1: -4.15, z1: 9.25, x2: -1.05, z2: 11.85 }, // Giá gỗ Đại Hồng Chung
      { x1: 1.65, z1: 7.55, x2: 3.15, z2: 9.25 }     // Bàn gỗ Thiền Trà
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

function triggerPagodaRoom(st, roomId) {
  if (!roomId || st.pendingRoom || st.room === roomId) return;
  st.pendingRoom = roomId;
  st.pig.seated = false;
  st.pig.walking = false;
  st.pig.eating = false;
}

function stepPagodaTps(st, dt) {
  st.t += dt;
  var p = st.pig;

  // 1. Chuyển phòng mượt 200ms fade (ZERO merging giữa 3 phòng)
  if (st.pendingRoom) {
    st.roomFade = Math.min(1, st.roomFade + dt * 5.2);
    if (st.roomFade >= 0.99) {
      var prevRoom = st.room;
      st.room = st.pendingRoom;
      st.pendingRoom = '';
      p.seated = false;
      p.eating = false;
      if (st.room === 'garden') {
        if (prevRoom === 'main_hall') {
          p.x = 0; p.z = 11.8; p.yaw = Math.PI;
          p.targetX = 0; p.targetZ = 10.5; p.walking = true;
        } else if (prevRoom === 'bell_tea') {
          p.x = 3.8; p.z = 12.1; p.yaw = Math.PI;
          p.targetX = 3.2; p.targetZ = 10.6; p.walking = true;
        } else {
          p.x = 0; p.z = 1.6; p.yaw = 0;
          p.targetX = 0; p.targetZ = 2.6; p.walking = true;
        }
        st.toast = 'Vườn Chùa Thanh Tịnh · Hồ Sen, Chùa Một Cột & Cây Đa Cổ Thụ 🪷';
      } else if (st.room === 'main_hall') {
        p.x = 0; p.z = 1.6; p.yaw = 0;
        p.targetX = 0; p.targetZ = 3.2; p.walking = true;
        st.toast = 'Chánh Điện Trang Nghiêm · Tiến lại Lư Hương để dâng hương cầu bình an 🙏';
      } else if (st.room === 'bell_tea') {
        p.x = 0; p.z = 1.6; p.yaw = 0;
        p.targetX = 0; p.targetZ = 3.2; p.walking = true;
        st.toast = 'Tháp Chuông & Thiền Trà · Thỉnh Đại Hồng Chung hoặc thưởng trà Bát Tràng 🔔';
      }
      st.toastUntil = st.t + 4.8;
    }
  } else if (st.roomFade > 0) {
    st.roomFade = Math.max(0, st.roomFade - dt * 5.0);
  }

  // 2. Di chuyển chú Heo mượt tới điểm chạm sàn
  if (!p.seated && p.walking && !st.pendingRoom) {
    var dx = p.targetX - p.x, dz = p.targetZ - p.z;
    var dist = Math.hypot(dx, dz);
    if (dist < 0.08) {
      p.walking = false;
    } else {
      var spd = Math.min(dist, 2.85 * dt);
      var next = clampPagodaWalkPos(st, p.x + (dx / dist) * spd, p.z + (dz / dist) * spd);
      p.x = next.x; p.z = next.z;
      p.yaw = Math.atan2(dx, dz);
    }
  }

  // 3. Sư thầy đi dạo thanh tịnh trong Vườn Chùa
  if (st.room === 'garden') {
    var gm = st.gardenMonk;
    gm.z += gm.patrolDir * 0.62 * dt;
    gm.yaw = gm.patrolDir > 0 ? 0 : Math.PI;
    if (gm.z > 9.4) gm.patrolDir = -1;
    if (gm.z < 3.4) gm.patrolDir = 1;
  }

  // 4. Hiệu ứng Dâng Hương & Thỉnh Đại Hồng Chung
  if (st.incenseGlow > 0) {
    st.incenseGlow = Math.max(0, st.incenseGlow - dt);
  }
  if (st.bellRingTimer > 0) {
    st.bellRingTimer = Math.max(0, st.bellRingTimer - dt);
    st.bellSwingPhase += dt * 7.5;
  }

  if (st.exiting) {
    st.exitFade = Math.min(1, st.exitFade + dt * 4.2);
  }

  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== HELPER VẼ ĐẠO CỤ 3D NGÔI CHÙA ==================== */

function drawOnePillarPagodaAndPond3D(ctx, cam, t) {
  // 1. Thành đá Hồ Sen (X = -5.1..-1.1, Z = 3.6..9.6)
  drawBox3D(ctx, cam, -3.1, 0, 3.65, 4.1, 0.24, 0.22, { top: '#D6D3D1', front: '#A8A29E', side: '#78716C', stroke: '#44403C' });
  drawBox3D(ctx, cam, -3.1, 0, 9.55, 4.1, 0.24, 0.22, { top: '#D6D3D1', front: '#A8A29E', side: '#78716C', stroke: '#44403C' });
  drawBox3D(ctx, cam, -5.05, 0, 6.6, 0.22, 0.24, 6.0, { top: '#D6D3D1', front: '#A8A29E', side: '#78716C', stroke: '#44403C' });
  drawBox3D(ctx, cam, -1.15, 0, 6.6, 0.22, 0.24, 6.0, { top: '#D6D3D1', front: '#A8A29E', side: '#78716C', stroke: '#44403C' });

  // Mặt nước Hồ Sen xanh ngọc êm ả
  drawPoly3D(ctx, cam, [[-4.95, 0.08, 3.76], [-1.25, 0.08, 3.76], [-1.25, 0.08, 9.44], [-4.95, 0.08, 9.44]], '#0D9488', '#115E59', 1);
  drawPoly3D(ctx, cam, [[-4.75, 0.09, 4.1], [-1.45, 0.09, 4.1], [-1.45, 0.09, 9.1], [-4.75, 0.09, 9.1]], '#14B8A6', null, 0);

  // Lá sen xanh & bông sen hồng nổi trên mặt nước
  var lotuses = [
    [-4.35, 4.55], [-2.15, 4.75], [-4.45, 7.65], [-1.95, 8.25], [-3.85, 8.85], [-1.85, 6.20]
  ];
  for (var li = 0; li < lotuses.length; li++) {
    var lx = lotuses[li][0], lz = lotuses[li][1];
    var lp = projectPoint3D(cam, lx, 0.11, lz);
    if (!lp || lp.cz > 22) continue;
    var u = Math.max(0.45, Math.min(2.6, lp.scale / 40));
    var bob = Math.sin(t * 2.2 + li * 1.3) * 0.8 * u;
    ctx.save();
    ctx.fillStyle = '#15803D';
    ctx.beginPath(); ctx.ellipse(lp.sx, lp.sy + bob, 7.5 * u, 3.2 * u, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#22C55E';
    ctx.beginPath(); ctx.ellipse(lp.sx - 1 * u, lp.sy - 0.5 * u + bob, 5.5 * u, 2.2 * u, 0, 0, Math.PI * 2); ctx.fill();
    if (li % 2 === 0 || li === 3) {
      // Hoa sen hồng phấn
      ctx.fillStyle = '#F472B6';
      ctx.beginPath(); ctx.arc(lp.sx, lp.sy - 2.6 * u + bob, 3.2 * u, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FBCFE8';
      ctx.beginPath(); ctx.arc(lp.sx, lp.sy - 3.6 * u + bob, 2.0 * u, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FDE047';
      ctx.beginPath(); ctx.arc(lp.sx, lp.sy - 3.0 * u + bob, 1.0 * u, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  // 2. CHÙA MỘT CỘT vươn lên duyên dáng giữa Hồ Sen (X = -3.1, Z = 6.6)
  // Trụ đá tròn giữa hồ
  drawBox3D(ctx, cam, -3.1, 0.08, 6.6, 0.48, 1.15, 0.48, { top: '#D6D3D1', front: '#A8A29E', side: '#78716C', stroke: '#44403C' });
  // Hệ kèo gỗ son chống đỡ đài Liên Hoa
  drawPoly3D(ctx, cam, [[-3.32, 0.72, 6.6], [-3.85, 1.24, 6.6], [-3.72, 1.24, 6.6], [-3.22, 0.72, 6.6]], '#7F1D1D', '#450A0A', 1.2);
  drawPoly3D(ctx, cam, [[-2.88, 0.72, 6.6], [-2.35, 1.24, 6.6], [-2.48, 1.24, 6.6], [-2.98, 0.72, 6.6]], '#7F1D1D', '#450A0A', 1.2);
  // Sàn gỗ & lan can đài chùa
  drawBox3D(ctx, cam, -3.1, 1.22, 6.6, 1.72, 0.14, 1.72, { top: '#991B1B', front: '#7F1D1D', side: '#5C1111', stroke: '#2B180E' });
  // Thân lầu chùa gỗ son cửa vàng
  drawBox3D(ctx, cam, -3.1, 1.36, 6.6, 1.32, 0.82, 1.32, { top: '#991B1B', front: '#B91C1C', side: '#7F1D1D', stroke: '#450A0A' });
  drawBox3D(ctx, cam, -3.1, 1.46, 5.92, 0.46, 0.56, 0.06, { top: '#F59E0B', front: '#FDE047', side: '#D97706', stroke: '#78350F' });
  // Tầng mái cong 1 (ngói đỏ Việt Nam)
  drawBox3D(ctx, cam, -3.1, 2.18, 6.6, 1.98, 0.22, 1.98, { top: '#B91C1C', front: '#991B1B', side: '#7F1D1D', stroke: '#450A0A' });
  // Tầng mái cong 2 & chóp bình cam lộ vàng
  drawBox3D(ctx, cam, -3.1, 2.40, 6.6, 1.34, 0.24, 1.34, { top: '#DC2626', front: '#B91C1C', side: '#991B1B', stroke: '#450A0A' });
  drawBox3D(ctx, cam, -3.1, 2.64, 6.6, 0.66, 0.20, 0.66, { top: '#EF4444', front: '#DC2626', side: '#B91C1C', stroke: '#450A0A' });
  drawBox3D(ctx, cam, -3.1, 2.84, 6.6, 0.18, 0.34, 0.18, { top: '#FEF08A', front: '#FACC15', side: '#CA8A04', stroke: '#78350F' });
}

function drawBanyanTree3D(ctx, cam, wx, wz, t) {
  // Bồn gạch cổ quanh gốc Cây Đa
  drawBox3D(ctx, cam, wx, 0, wz, 1.75, 0.36, 1.75, { top: '#B45309', front: '#9A3412', side: '#7C2D12', stroke: '#451A03' });
  // Thân cây đa cổ thụ xù xì + rễ phụ buông rủ
  drawBox3D(ctx, cam, wx, 0.36, wz, 0.68, 1.95, 0.68, { top: '#78350F', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
  drawBox3D(ctx, cam, wx - 0.42, 0.36, wz - 0.18, 0.14, 1.55, 0.14, { top: '#5C341D', front: '#4A2C1A', side: '#3B2314' });
  drawBox3D(ctx, cam, wx + 0.44, 0.36, wz + 0.20, 0.14, 1.62, 0.14, { top: '#5C341D', front: '#4A2C1A', side: '#3B2314' });
  // Tán lá đa xanh um đa tầng đung đưa nhẹ
  var sway = Math.sin(t * 1.4) * 0.04;
  drawBox3D(ctx, cam, wx + sway, 2.08, wz, 2.55, 0.72, 2.45, { top: '#22C55E', front: '#15803D', side: '#166534', stroke: '#14532D' });
  drawBox3D(ctx, cam, wx - 0.35 + sway, 2.66, wz - 0.2, 1.85, 0.56, 1.75, { top: '#4ADE80', front: '#16A34A', side: '#15803D', stroke: '#14532D' });
  drawBox3D(ctx, cam, wx + 0.35 + sway, 2.52, wz + 0.3, 1.55, 0.48, 1.55, { top: '#4ADE80', front: '#22C55E', side: '#15803D', stroke: '#14532D' });
}

function drawBuddhaStatue3D(ctx, cam, t, incenseGlow) {
  // 1. Bàn thờ gỗ gụ 3 bậc thếp vàng (X = 0, Z = 12.8)
  drawBox3D(ctx, cam, 0, 0, 12.8, 5.4, 0.42, 2.4, { top: '#7C2D12', front: '#5C1D14', side: '#4A1810', stroke: '#2B180E' });
  drawBox3D(ctx, cam, 0, 0.42, 12.9, 4.2, 0.52, 1.8, { top: '#991B1B', front: '#7F1D1D', side: '#5C1111', stroke: '#F59E0B' });
  // Đôi bình hoa sen đồng 2 bên bàn thờ
  drawBox3D(ctx, cam, -2.05, 0.94, 12.4, 0.34, 0.52, 0.34, { top: '#F59E0B', front: '#B45309', side: '#78350F', stroke: '#451A03' });
  drawBox3D(ctx, cam,  2.05, 0.94, 12.4, 0.34, 0.52, 0.34, { top: '#F59E0B', front: '#B45309', side: '#78350F', stroke: '#451A03' });

  // 2. Tòa Sen hồng-vàng nâng đỡ Tượng Phật
  drawBox3D(ctx, cam, 0, 0.94, 12.8, 1.85, 0.30, 1.35, { top: '#F472B6', front: '#EC4899', side: '#BE185D', stroke: '#FDE047' });
  drawBox3D(ctx, cam, 0, 1.24, 12.8, 1.48, 0.16, 1.12, { top: '#FDE047', front: '#F59E0B', side: '#D97706', stroke: '#92400E' });

  // 3. Hào Quang Phật tỏa sáng rực rỡ phía sau tượng (Sprite 2D phối cảnh)
  var haloPr = projectPoint3D(cam, 0, 2.28, 13.05);
  if (haloPr && haloPr.cz > 0.5) {
    var hr = Math.max(14, Math.min(76, haloPr.scale * 0.92));
    var pulse = 1 + Math.sin(t * 2.8) * 0.05 + (incenseGlow > 0 ? 0.12 : 0);
    ctx.save();
    ctx.globalAlpha = incenseGlow > 0 ? 0.42 : 0.26;
    ctx.fillStyle = '#FDE047';
    ctx.beginPath(); ctx.arc(haloPr.sx, haloPr.sy, hr * 1.28 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.72;
    ctx.strokeStyle = '#FACC15';
    ctx.lineWidth = Math.max(1.5, hr * 0.06);
    ctx.beginPath(); ctx.arc(haloPr.sx, haloPr.sy, hr * 0.88 * pulse, 0, Math.PI * 2); ctx.stroke();
    // 12 tia hào quang xoay chậm
    for (var ray = 0; ray < 12; ray++) {
      var a = t * 0.35 + (ray * Math.PI * 2) / 12;
      ctx.beginPath();
      ctx.moveTo(haloPr.sx + Math.cos(a) * hr * 0.55, haloPr.sy + Math.sin(a) * hr * 0.55);
      ctx.lineTo(haloPr.sx + Math.cos(a) * hr * 1.18 * pulse, haloPr.sy + Math.sin(a) * hr * 1.18 * pulse);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 4. Tượng Phật Thích Ca thếp vàng ngồi kiết già trang nghiêm
  // Chân xếp kiết già
  drawBox3D(ctx, cam, 0, 1.40, 12.75, 1.18, 0.32, 0.78, { top: '#FEF08A', front: '#FACC15', side: '#CA8A04', stroke: '#92400E' });
  // Thân áo cà sa vàng óng
  drawBox3D(ctx, cam, 0, 1.72, 12.80, 0.78, 0.74, 0.54, { top: '#FEF08A', front: '#F59E0B', side: '#D97706', stroke: '#92400E' });
  // Đầu Phật & Nhục kế vàng
  drawBox3D(ctx, cam, 0, 2.46, 12.80, 0.44, 0.42, 0.42, { top: '#FEF08A', front: '#FDE047', side: '#EAB308', stroke: '#92400E' });
  drawBox3D(ctx, cam, 0, 2.88, 12.80, 0.22, 0.14, 0.22, { top: '#FEF08A', front: '#CA8A04', side: '#A16207', stroke: '#78350F' });
}

function drawIncenseBurner3D(ctx, cam, wx, wz, t, glowTimer) {
  // Đế đá & Lư Hương Đồng 3 chân cổ kính
  drawBox3D(ctx, cam, wx, 0, wz, 1.12, 0.26, 1.12, { top: '#78716C', front: '#57534E', side: '#44403C', stroke: '#292524' });
  drawBox3D(ctx, cam, wx, 0.26, wz, 0.86, 0.66, 0.86, { top: '#92400E', front: '#78350F', side: '#5C2D0C', stroke: '#F59E0B' });
  drawBox3D(ctx, cam, wx, 0.84, wz, 0.96, 0.10, 0.96, { top: '#F59E0B', front: '#D97706', side: '#B45309', stroke: '#451A03' });

  // Nén nhang đỏ rực & làn khói trầm bay lên uốn lượn
  var pr = projectPoint3D(cam, wx, 0.96, wz);
  if (!pr || pr.cz > 22) return;
  var u = Math.max(0.45, Math.min(3.0, pr.scale / 38));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  if (glowTimer > 0) {
    ctx.globalAlpha = Math.min(0.48, glowTimer * 0.15);
    ctx.fillStyle = '#FDE047';
    ctx.beginPath(); ctx.arc(px, py - 8 * u, 18 * u, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  var sticks = [-4, 0, 4];
  for (var si = 0; si < sticks.length; si++) {
    ctx.strokeStyle = '#B91C1C';
    ctx.lineWidth = Math.max(1.2, 1.4 * u);
    ctx.beginPath();
    ctx.moveTo(px + sticks[si] * u, py);
    ctx.lineTo(px + sticks[si] * 1.2 * u, py - 9 * u);
    ctx.stroke();
    ctx.fillStyle = glowTimer > 0 ? '#FEF08A' : '#FB923C';
    ctx.beginPath();
    ctx.arc(px + sticks[si] * 1.2 * u, py - 9.5 * u, (glowTimer > 0 ? 2.1 : 1.3) * u, 0, Math.PI * 2);
    ctx.fill();
  }
  // Khói trầm hương thanh tịnh bay cao
  var puffs = glowTimer > 0 ? 7 : 4;
  for (var k = 0; k < puffs; k++) {
    var prog = (t * 0.55 + k / puffs) % 1;
    ctx.globalAlpha = (1 - prog) * (glowTimer > 0 ? 0.65 : 0.42);
    ctx.fillStyle = glowTimer > 0 ? '#FEF3C7' : '#E7E5E4';
    var sx = px + Math.sin(t * 2.4 + k * 1.7) * (4 + prog * 6) * u;
    var sy = py - (11 + prog * 28) * u;
    ctx.beginPath();
    ctx.arc(sx, sy, (2.2 + prog * 4.2) * u, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawGreatBellPavilion3D(ctx, cam, wx, wz, t, ringTimer, swingPhase) {
  // Bệ gạch vuông & 4 cột gỗ son đỏ đỡ Đại Hồng Chung
  drawBox3D(ctx, cam, wx, 0, wz, 2.45, 0.24, 2.25, { top: '#A8A29E', front: '#78716C', side: '#57534E', stroke: '#292524' });
  var cols = [[-1.02, -0.92], [1.02, -0.92], [-1.02, 0.92], [1.02, 0.92]];
  for (var i = 0; i < cols.length; i++) {
    drawBox3D(ctx, cam, wx + cols[i][0], 0.24, wz + cols[i][1], 0.22, 2.65, 0.22, { top: '#991B1B', front: '#8B1E1E', side: '#5C1111', stroke: '#2B180E' });
  }
  // Xà ngang đỉnh khung treo chuông chạm rồng vàng
  drawBox3D(ctx, cam, wx, 2.86, wz, 2.55, 0.24, 0.34, { top: '#B91C1C', front: '#991B1B', side: '#7F1D1D', stroke: '#F59E0B' });

  // Đại Hồng Chung đồng cổ treo giữa khung (đung đưa khi thỉnh chuông!)
  var sway = ringTimer > 0 ? Math.sin(swingPhase) * 0.14 * Math.min(1, ringTimer / 1.5) : Math.sin(t * 0.8) * 0.012;
  drawBox3D(ctx, cam, wx + sway * 0.5, 2.42, wz, 0.22, 0.46, 0.22, { top: '#CA8A04', front: '#A16207', side: '#78350F', stroke: '#2B180E' });
  drawBox3D(ctx, cam, wx + sway, 1.72, wz, 0.96, 0.72, 0.96, { top: '#786238', front: '#5C4A2A', side: '#46381F', stroke: '#F59E0B' });
  drawBox3D(ctx, cam, wx + sway * 1.2, 0.86, wz, 1.24, 0.88, 1.24, { top: '#6B5630', front: '#4E3F22', side: '#3B2F19', stroke: '#D97706' });
  // Chày gỗ ngang treo dây đánh chuông bên phải
  var strikeOffset = ringTimer > 0 ? -Math.abs(Math.sin(swingPhase)) * 0.36 : 0;
  drawBox3D(ctx, cam, wx + 1.28 + strikeOffset, 1.26, wz, 0.92, 0.18, 0.18, { top: '#B45309', front: '#92400E', side: '#78350F', stroke: '#2B180E' });

  // Sóng âm thanh vàng lan tỏa khi thỉnh Đại Hồng Chung!
  if (ringTimer > 0) {
    var bPr = projectPoint3D(cam, wx, 1.38, wz);
    if (bPr && bPr.cz > 0.5) {
      ctx.save();
      for (var w = 0; w < 3; w++) {
        var wp = ((3.2 - ringTimer) * 1.1 + w * 0.33) % 1;
        ctx.strokeStyle = 'rgba(253,224,71,' + ((1 - wp) * 0.85).toFixed(2) + ')';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(bPr.sx, bPr.sy, (14 + wp * 58) * Math.max(0.5, Math.min(1.6, bPr.scale / 70)), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

/* ==================== RENDER CHÍNH 3 PHÒNG NGÔI CHÙA TPS 3D ==================== */
function renderPagodaTpsScene(ctx, cam, st, W, H) {
  var rm = st.room;

  // 1. NỀN TRỜI / NỀN PHÒNG + SÀN + TRẦN + 4 BỨC TƯỜNG RIÊNG BIỆT CHO TỪNG PHÒNG
  if (rm === 'garden') {
    // Bầu trời nắng vàng thanh tịnh (KHÔNG dùng khoảng xanh trống lạc lõng!)
    ctx.fillStyle = '#F5E4BE';
    ctx.fillRect(0, 0, W, H);

    // Mái vòm trời nắng ấm trên cao (Y = 3.85)
    drawPoly3D(ctx, cam, [[-6, 3.85, 0], [6, 3.85, 0], [6, 3.85, 14.8], [-6, 3.85, 14.8]], '#F7E8C8', null, 0);
    drawPoly3D(ctx, cam, [[-4.2, 3.82, 4.5], [4.2, 3.82, 4.5], [4.2, 3.82, 11.5], [-4.2, 3.82, 11.5]], '#FEF3C7', null, 0);

    // Sân gạch tàu đỏ ấm cổ kính
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#A64B2A', '#7C2D12', 1);
    for (var tz = 0; tz < 14.8; tz += 1.85) {
      drawPoly3D(ctx, cam, [[-6, 0.004, tz], [6, 0.004, tz], [6, 0.004, tz + 0.92], [-6, 0.004, tz + 0.92]], '#B55835', '#8A3B1E', 0.4);
    }
    // Lối đá phiến trung tâm dẫn từ Cổng Tam Quan tới Chánh Điện
    drawPoly3D(ctx, cam, [[-1.15, 0.01, 0], [1.15, 0.01, 0], [1.15, 0.01, 13.6], [-1.15, 0.01, 13.6]], '#D6CFC2', '#8C857B', 1);

    // Tường bao chùa vàng đất cổ kính (trái, phải, cuối)
    drawPoly3D(ctx, cam, [[-6, 0, 0], [-6, 0, 14.8], [-6, 3.02, 14.8], [-6, 3.02, 0]], '#D4A359', '#926227', 1);
    drawPoly3D(ctx, cam, [[6, 0, 14.8], [6, 0, 0], [6, 3.02, 0], [6, 3.02, 14.8]], '#C48E42', '#926227', 1);
    drawPoly3D(ctx, cam, [[-6, 0, 14.8], [6, 0, 14.8], [6, 3.18, 14.8], [-6, 3.18, 14.8]], '#C9954A', '#926227', 1);

    // Cổng Tam Quan (Z = 0) sơn son thếp vàng mái ngói đỏ
    drawPoly3D(ctx, cam, [[-6, 0, 0], [-1.55, 0, 0], [-1.55, 3.10, 0], [-6, 3.10, 0]], '#C48E42', '#78350F', 1);
    drawPoly3D(ctx, cam, [[1.55, 0, 0], [6, 0, 0], [6, 3.10, 0], [1.55, 3.10, 0]], '#C48E42', '#78350F', 1);
    drawPoly3D(ctx, cam, [[-1.55, 2.60, 0], [1.55, 2.60, 0], [1.55, 3.45, 0], [-1.55, 3.45, 0]], '#991B1B', '#F59E0B', 1.4);
    drawPoly3D(ctx, cam, [[-1.55, 0, -0.04], [1.55, 0, -0.04], [1.55, 2.60, -0.04], [-1.55, 2.60, -0.04]], '#FFFDF0', '#FDE68A', 0.8);
  } else if (rm === 'main_hall') {
    ctx.fillStyle = '#38150E';
    ctx.fillRect(0, 0, W, H);

    // Sàn gỗ gụ đỏ sẫm & thảm lễ đỏ viền vàng dọc giữa Chánh Điện
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#5C261B', '#38150E', 1);
    drawPoly3D(ctx, cam, [[-1.35, 0.01, 0.2], [1.35, 0.01, 0.2], [1.35, 0.01, 11.4], [-1.35, 0.01, 11.4]], '#991B1B', '#F59E0B', 1.4);

    // Trần gỗ gụ kẻ ô hoa sen mạ vàng (Y = 3.85)
    drawPoly3D(ctx, cam, [[-6, 3.85, 0], [6, 3.85, 0], [6, 3.85, 14.8], [-6, 3.85, 14.8]], '#4A1810', '#2B0D08', 1);
    for (var cz = 2.2; cz <= 13.0; cz += 2.7) {
      drawPoly3D(ctx, cam, [[-6, 3.74, cz - 0.14], [6, 3.74, cz - 0.14], [6, 3.74, cz + 0.14], [-6, 3.74, cz + 0.14]], '#7F1D1D', '#F59E0B', 1);
      drawPoly3D(ctx, cam, [[-0.65, 3.82, cz - 0.55], [0.65, 3.82, cz - 0.55], [0.65, 3.82, cz + 0.55], [-0.65, 3.82, cz + 0.55]], '#CA8A04', '#FEF08A', 0.9);
    }

    // 4 bức tường gỗ gụ trang nghiêm
    drawPoly3D(ctx, cam, [[-6, 0, 0], [-6, 0, 14.8], [-6, 3.85, 14.8], [-6, 3.85, 0]], '#521E14', '#2B0D08', 1);
    drawPoly3D(ctx, cam, [[6, 0, 14.8], [6, 0, 0], [6, 3.85, 0], [6, 3.85, 14.8]], '#4A1810', '#2B0D08', 1);
    drawPoly3D(ctx, cam, [[-6, 0, 14.8], [6, 0, 14.8], [6, 3.85, 14.8], [-6, 3.85, 14.8]], '#46160E', '#2B0D08', 1);
    drawPoly3D(ctx, cam, [[-6, 0, 0], [-1.45, 0, 0], [-1.45, 3.85, 0], [-6, 3.85, 0]], '#521E14', '#2B0D08', 1);
    drawPoly3D(ctx, cam, [[1.45, 0, 0], [6, 0, 0], [6, 3.85, 0], [1.45, 3.85, 0]], '#521E14', '#2B0D08', 1);
    drawPoly3D(ctx, cam, [[-1.45, 2.65, 0], [1.45, 2.65, 0], [1.45, 3.85, 0], [-1.45, 3.85, 0]], '#4A1810', '#2B0D08', 1);
    drawPoly3D(ctx, cam, [[-1.45, 0, -0.04], [1.45, 0, -0.04], [1.45, 2.65, -0.04], [-1.45, 2.65, -0.04]], '#F5E4BE', '#D4A359', 0.8);
  } else {
    // 'bell_tea' — Tháp Chuông & Góc Thiền Trà gỗ trầm thanh tịnh
    ctx.fillStyle = '#4A3423';
    ctx.fillRect(0, 0, W, H);

    // Sàn ván gỗ trầm ấm
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#7C5230', '#4A2C1A', 1);
    for (var fx = -6; fx < 6; fx += 1.2) {
      drawPoly3D(ctx, cam, [[fx, 0.004, 0], [fx + 0.6, 0.004, 0], [fx + 0.6, 0.004, 14.8], [fx, 0.004, 14.8]], '#6E4728', '#54351C', 0.4);
    }

    // Trần gỗ xà gồ mộc (Y = 3.85)
    drawPoly3D(ctx, cam, [[-6, 3.85, 0], [6, 3.85, 0], [6, 3.85, 14.8], [-6, 3.85, 14.8]], '#5C3A21', '#3B2314', 1);
    for (var bz = 2.0; bz <= 13.6; bz += 2.6) {
      drawPoly3D(ctx, cam, [[-6, 3.74, bz - 0.14], [6, 3.74, bz - 0.14], [6, 3.74, bz + 0.14], [-6, 3.74, bz + 0.14]], '#4A2C1A', '#2B180E', 1);
    }

    // 4 bức tường vôi vàng kem cổ & khung gỗ
    drawPoly3D(ctx, cam, [[-6, 0, 0], [-6, 0, 14.8], [-6, 3.85, 14.8], [-6, 3.85, 0]], '#DFCAA5', '#5C341D', 1);
    drawPoly3D(ctx, cam, [[6, 0, 14.8], [6, 0, 0], [6, 3.85, 0], [6, 3.85, 14.8]], '#D5BC93', '#5C341D', 1);
    drawPoly3D(ctx, cam, [[-6, 0, 14.8], [6, 0, 14.8], [6, 3.85, 14.8], [-6, 3.85, 14.8]], '#D9C29C', '#5C341D', 1);
    drawPoly3D(ctx, cam, [[-6, 0, 0], [-1.45, 0, 0], [-1.45, 3.85, 0], [-6, 3.85, 0]], '#DFCAA5', '#5C341D', 1);
    drawPoly3D(ctx, cam, [[1.45, 0, 0], [6, 0, 0], [6, 3.85, 0], [1.45, 3.85, 0]], '#DFCAA5', '#5C341D', 1);
    drawPoly3D(ctx, cam, [[-1.45, 2.65, 0], [1.45, 2.65, 0], [1.45, 3.85, 0], [-1.45, 3.85, 0]], '#C9B084', '#5C341D', 1);
    drawPoly3D(ctx, cam, [[-1.45, 0, -0.04], [1.45, 0, -0.04], [1.45, 2.65, -0.04], [-1.45, 2.65, -0.04]], '#F5E4BE', '#D4A359', 0.8);
  }

  // 2. Mỹ thuật 4 mặt tường theo phòng (pagodaWallArt.ts)
  if (typeof drawPagodaWalls3D === 'function') {
    drawPagodaWalls3D(ctx, cam, rm);
  }

  // 3. Đèn lồng lụa đỏ / đèn giấy ấm theo từng phòng
  if (rm === 'main_hall') {
    var hLamps = [[-2.8, 3.8], [2.8, 3.8], [-2.8, 8.2], [2.8, 8.2], [-2.2, 11.4], [2.2, 11.4]];
    for (var hi = 0; hi < hLamps.length; hi++) {
      drawLanternGlow3D(ctx, cam, hLamps[hi][0], 2.95, hLamps[hi][1], '#DC2626', '#FDE047', 0.22, 3.85);
    }
  } else if (rm === 'bell_tea') {
    var tLamps = [[-2.4, 5.2], [2.4, 5.2], [2.4, 8.8], [-2.6, 10.6]];
    for (var ti = 0; ti < tLamps.length; ti++) {
      drawLanternGlow3D(ctx, cam, tLamps[ti][0], 3.05, tLamps[ti][1], '#FEF3C7', '#FDE68A', 0.18, 3.85);
    }
  }

  // 4. Vòng sóng Tap-to-Walk trên sàn
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

  // 5. Painter's Algorithm Z-Sort cho toàn bộ kiến trúc, nội thất & nhân vật
  var items = [];
  function pushItem(wx, wz, fn) {
    items.push({ d: Math.hypot(wx - cam.pos.x, wz - cam.pos.z), fn: fn });
  }

  if (rm === 'garden') {
    // Hồ Sen & Chùa Một Cột bên trái sân
    pushItem(-3.1, 6.6, function() { drawOnePillarPagodaAndPond3D(ctx, cam, st.t); });
    // Cây Đa Cổ Thụ bên phải sân
    pushItem(4.15, 6.85, function() { drawBanyanTree3D(ctx, cam, 4.15, 6.85, st.t); });
    // Bậc Tam Cấp đá dẫn vào Chánh Điện cuối sân (X = 0, Z = 13.8)
    pushItem(0, 13.8, function() {
      drawBox3D(ctx, cam, 0, 0, 13.45, 3.4, 0.16, 0.58, { top: '#D6D3D1', front: '#A8A29E', side: '#78716C', stroke: '#44403C' });
      drawBox3D(ctx, cam, 0, 0, 14.00, 3.2, 0.32, 0.58, { top: '#E7E5E4', front: '#A8A29E', side: '#78716C', stroke: '#44403C' });
      drawBox3D(ctx, cam, 0, 0, 14.50, 3.0, 0.44, 0.48, { top: '#F5F5F4', front: '#A8A29E', side: '#78716C', stroke: '#44403C' });
    });
    // Cổng Vòm Tre Trúc góc phải cuối sân dẫn sang Thiền Trà
    pushItem(4.1, 14.2, function() {
      drawBox3D(ctx, cam, 3.05, 0, 14.2, 0.22, 2.35, 0.22, { top: '#65A30D', front: '#4D7C0F', side: '#3F6212', stroke: '#1A2E05' });
      drawBox3D(ctx, cam, 5.15, 0, 14.2, 0.22, 2.35, 0.22, { top: '#65A30D', front: '#4D7C0F', side: '#3F6212', stroke: '#1A2E05' });
      drawBox3D(ctx, cam, 4.10, 2.24, 14.2, 2.45, 0.22, 0.30, { top: '#84CC16', front: '#4D7C0F', side: '#3F6212', stroke: '#1A2E05' });
    });
    // Sư thầy đi dạo trong Vườn Chùa
    pushItem(st.gardenMonk.x, st.gardenMonk.z, function() { drawHumanTps3D(ctx, cam, st.gardenMonk, st.t); });
  } else if (rm === 'main_hall') {
    // 6 Cột son đỏ thếp vàng 2 bên Chánh Điện
    var pZs = [3.4, 7.6, 11.8];
    for (var pi = 0; pi < pZs.length; pi++) {
      (function(pz) {
        pushItem(-4.2, pz, function() {
          drawBox3D(ctx, cam, -4.2, 0, pz, 0.46, 3.85, 0.46, { top: '#991B1B', front: '#B91C1C', side: '#7F1D1D', stroke: '#450A0A' });
          drawBox3D(ctx, cam, -4.2, 0.0, pz, 0.58, 0.26, 0.58, { top: '#D6D3D1', front: '#A8A29E', side: '#78716C' });
          drawBox3D(ctx, cam, -4.2, 3.45, pz, 0.54, 0.14, 0.54, { top: '#FACC15', front: '#F59E0B', side: '#D97706' });
        });
        pushItem(4.2, pz, function() {
          drawBox3D(ctx, cam, 4.2, 0, pz, 0.46, 3.85, 0.46, { top: '#991B1B', front: '#B91C1C', side: '#7F1D1D', stroke: '#450A0A' });
          drawBox3D(ctx, cam, 4.2, 0.0, pz, 0.58, 0.26, 0.58, { top: '#D6D3D1', front: '#A8A29E', side: '#78716C' });
          drawBox3D(ctx, cam, 4.2, 3.45, pz, 0.54, 0.14, 0.54, { top: '#FACC15', front: '#F59E0B', side: '#D97706' });
        });
      })(pZs[pi]);
    }
    // Tượng Phật Vàng trên tòa sen
    pushItem(0, 12.8, function() { drawBuddhaStatue3D(ctx, cam, st.t, st.incenseGlow); });
    // Lư Hương Đồng nghi ngút khói trầm
    pushItem(0, 9.5, function() { drawIncenseBurner3D(ctx, cam, 0, 9.5, st.t, st.incenseGlow); });
    // 3 Bồ đoàn / chiếu lạy đỏ-vàng
    var mats = [-2.25, 0, 2.25];
    for (var mi = 0; mi < mats.length; mi++) {
      (function(mx) {
        pushItem(mx, 7.2, function() {
          drawBox3D(ctx, cam, mx, 0, 7.2, 0.96, 0.12, 0.96, { top: '#B91C1C', front: '#991B1B', side: '#7F1D1D', stroke: '#F59E0B' });
        });
      })(mats[mi]);
    }
    // Sư thầy & Phật tử hành lễ
    for (var wi = 0; wi < st.hallWorshippers.length; wi++) {
      (function(w) { pushItem(w.x, w.z, function() { drawHumanTps3D(ctx, cam, w, st.t); }); })(st.hallWorshippers[wi]);
    }
  } else {
    // 'bell_tea' — Đại Hồng Chung bên trái + Bàn Thiền Trà Bát Tràng bên phải
    pushItem(-2.6, 10.5, function() {
      drawGreatBellPavilion3D(ctx, cam, -2.6, 10.5, st.t, st.bellRingTimer, st.bellSwingPhase);
    });
    // Chiếu cói & Bàn Thiền Trà gỗ thấp + Ấm trà Bát Tràng
    pushItem(2.4, 8.4, function() {
      drawPoly3D(ctx, cam, [[0.55, 0.014, 6.65], [4.35, 0.014, 6.65], [4.35, 0.014, 10.15], [0.55, 0.014, 10.15]], '#D6BE8A', '#8C6E3B', 1.4);
      // Bàn trà gỗ gụ thấp
      drawBox3D(ctx, cam, 2.4, 0.38, 8.4, 1.32, 0.09, 1.56, { top: '#7C4F2B', front: '#5C341D', side: '#4A2C1A', stroke: '#2B180E' });
      drawBox3D(ctx, cam, 1.85, 0, 7.75, 0.14, 0.38, 0.14, { top: '#4A2C1A', front: '#3B2314', side: '#2B180E' });
      drawBox3D(ctx, cam, 2.95, 0, 7.75, 0.14, 0.38, 0.14, { top: '#4A2C1A', front: '#3B2314', side: '#2B180E' });
      drawBox3D(ctx, cam, 1.85, 0, 9.05, 0.14, 0.38, 0.14, { top: '#4A2C1A', front: '#3B2314', side: '#2B180E' });
      drawBox3D(ctx, cam, 2.95, 0, 9.05, 0.14, 0.38, 0.14, { top: '#4A2C1A', front: '#3B2314', side: '#2B180E' });
      // Đệm thiền cho Heo (trái bàn) & Thiền sư (phải bàn)
      drawBox3D(ctx, cam, 1.15, 0.01, 8.4, 0.72, 0.12, 0.72, { top: '#4D7C0F', front: '#3F6212', side: '#365314', stroke: '#1A2E05' });
      drawBox3D(ctx, cam, 3.55, 0.01, 8.4, 0.72, 0.12, 0.72, { top: '#4D7C0F', front: '#3F6212', side: '#365314', stroke: '#1A2E05' });
      // Bộ ấm trà Bát Tràng men xanh-trắng trên bàn trà
      drawBatTrangTeapotSprite3D(ctx, cam, 2.35, 0.49, 8.35);
      // Chén trà nhỏ & bình hoa sen nhỏ trang trí
      drawBox3D(ctx, cam, 2.02, 0.47, 8.75, 0.14, 0.09, 0.14, { top: '#ECFCCB', front: '#FFFFFF', side: '#CBD5E1', stroke: '#1D4ED8' });
      drawBox3D(ctx, cam, 2.75, 0.47, 7.98, 0.16, 0.24, 0.16, { top: '#15803D', front: '#166534', side: '#14532D', stroke: '#052E16' });
    });
    // Thiền sư ngồi thưởng trà thanh tịnh
    pushItem(st.teaMaster.x, st.teaMaster.z, function() { drawHumanTps3D(ctx, cam, st.teaMaster, st.t); });
  }

  // Chú Heo Mascot 1:1 toàn App
  pushItem(st.pig.x, st.pig.z, function() { drawPigTps3D(ctx, cam, st.pig, st.t); });

  items.sort(function(a, b) { return b.d - a.d; });
  for (var ii = 0; ii < items.length; ii++) items[ii].fn();

  // 6. Lớp phủ không khí thanh tịnh + Fade chuyển phòng (200ms) / Fade rời chùa (240ms)
  ctx.save();
  if (rm === 'garden') {
    ctx.fillStyle = 'rgba(255, 232, 165, 0.07)';
  } else if (rm === 'main_hall') {
    ctx.fillStyle = st.incenseGlow > 0 ? 'rgba(253, 215, 110, 0.14)' : 'rgba(255, 195, 105, 0.09)';
  } else {
    ctx.fillStyle = 'rgba(236, 252, 203, 0.06)';
  }
  ctx.fillRect(0, 0, W, H);

  var fAlpha = Math.max(st.exitFade, st.roomFade);
  if (fAlpha > 0.01) {
    ctx.fillStyle = st.roomFade > st.exitFade
      ? 'rgba(42, 22, 14, ' + st.roomFade.toFixed(2) + ')'
      : 'rgba(246, 238, 220, ' + st.exitFade.toFixed(2) + ')';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
`;
}
