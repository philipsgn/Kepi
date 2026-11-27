/**
 * Bộ Sưu Tập Mỹ Thuật Tường 3 Phòng Độc Bản — Sân Vận Động Trống Đồng FIFA TPS 3D (Quyết định 246)
 * - Phòng 1 ('locker_tunnel' — Phòng Thay Đồ ĐT Việt Nam & Đường Hầm FIFA):
 *   Dãy tủ gỗ-đỏ treo Áo Đấu Đỏ Sao Vàng (#10, #19, #22, #9, #4) kèm giày đinh,
 *   Bảng chiến thuật phát sáng "CHIẾN THUẬT 4-3-3 · ĐỘI TUYỂN VIỆT NAM",
 *   Vòm Đường Hầm FIFA phát sáng "RA SÂN THI ĐẤU →" & Thang máy VIP sang Phòng Cúp Vàng.
 * - Phòng 2 ('pitch_arena' — Đường Biên Sân Cỏ Trống Đồng & Trận Đấu 11v11):
 *   Khán đài Đỏ-Vàng rực lửa cổ động viên vẫy Cờ Đỏ Sao Vàng, đại biểu ngữ "VIỆT NAM VÔ ĐỊCH ★",
 *   Bảng điện tử LED "VIỆT NAM 2 - 0 ĐỘI KHÁCH", lối vào Đường Hầm & bậc thang VIP.
 * - Phòng 3 ('trophy_vip' — Phòng Cúp Vàng & Họp Báo Quốc Tế FIFA):
 *   Phông nền "HỌP BÁO QUỐC TẾ · TRỐNG ĐỒNG ARENA", phù điêu Trống Đồng Đông Sơn mạ vàng,
 *   Tường danh vọng Hall of Champions & cửa nối về Sân Cỏ / Phòng Thay Đồ.
 * - 100% bảng chữ áp dụng khóa khung 4 góc ctx.clip() + safeW (maxWidth) chống tràn chữ mọi góc 360°.
 * - Tuyệt đối không dùng ctx.roundRect.
 */
export function buildStadiumWallArtScript(): string {
  return String.raw`
/* ==================== 1. HELPER KHÓA KHUNG 4 GÓC CHỐNG TRÀN CHỮ 100% ==================== */
function drawStadiumClippedQuad(ctx, cam, pts, bgCol, borderCol, lineW, drawInner) {
  drawPoly3D(ctx, cam, pts, bgCol, borderCol, lineW || 2);
  var p0 = projectPoint3D(cam, pts[0][0], pts[0][1], pts[0][2]);
  var p1 = projectPoint3D(cam, pts[1][0], pts[1][1], pts[1][2]);
  var p2 = projectPoint3D(cam, pts[2][0], pts[2][1], pts[2][2]);
  var p3 = projectPoint3D(cam, pts[3][0], pts[3][1], pts[3][2]);
  if (!p0 || !p1 || !p2 || !p3) return;
  if (p0.cz < 0.5 || p1.cz < 0.5 || p2.cz < 0.5 || p3.cz < 0.5) return;
  var bw = Math.hypot(p1.sx - p0.sx, p1.sy - p0.sy);
  var bh = Math.hypot(p3.sx - p0.sx, p3.sy - p0.sy);
  if (bw < 14 || bh < 14) return;
  var cx = (p0.sx + p1.sx + p2.sx + p3.sx) * 0.25;
  var cy = (p0.sy + p1.sy + p2.sy + p3.sy) * 0.25;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p0.sx, p0.sy); ctx.lineTo(p1.sx, p1.sy);
  ctx.lineTo(p2.sx, p2.sy); ctx.lineTo(p3.sx, p3.sy);
  ctx.closePath(); ctx.clip();
  if (drawInner) drawInner(cx, cy, bw, bh, Math.max(8, bw * 0.84));
  ctx.restore();
}

/* Helper vẽ Áo Đấu Đội Tuyển Việt Nam Đỏ Sao Vàng + Số Áo & Giày Đinh trong tủ */
function drawVietnamLockerJersey2D(ctx, cx, cy, w, h, numStr) {
  // Vai & tay áo đỏ cờ
  ctx.fillStyle = '#DA251D';
  ctx.fillRect(cx - w * 0.42, cy - h * 0.38, w * 0.84, h * 0.22);
  // Thân áo đỏ
  ctx.fillRect(cx - w * 0.28, cy - h * 0.38, w * 0.56, h * 0.58);
  // Viền cổ áo & cầu vai vàng sao
  ctx.fillStyle = '#FDE047';
  ctx.fillRect(cx - w * 0.12, cy - h * 0.38, w * 0.24, h * 0.06);
  ctx.fillRect(cx - w * 0.40, cy - h * 0.38, w * 0.10, h * 0.04);
  ctx.fillRect(cx + w * 0.30, cy - h * 0.38, w * 0.10, h * 0.04);
  // Ngôi sao vàng bên ngực trái & số áo vàng giữa ngực
  var sPx = Math.max(4, Math.min(11, Math.round(h * 0.18)));
  ctx.font = 'bold ' + sPx + 'px monospace';
  ctx.fillStyle = '#FDE047';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(numStr || '10', cx, cy - h * 0.08, Math.max(8, w * 0.5));
  // Viền áo
  ctx.strokeStyle = '#450A0A';
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - w * 0.28, cy - h * 0.38, w * 0.56, h * 0.58);
  // Kệ dưới đặt đôi giày đinh bóng đá
  ctx.fillStyle = '#5C341D';
  ctx.fillRect(cx - w * 0.44, cy + h * 0.24, w * 0.88, h * 0.07);
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(cx - w * 0.28, cy + h * 0.15, w * 0.22, h * 0.09);
  ctx.fillRect(cx + w * 0.06, cy + h * 0.15, w * 0.22, h * 0.09);
}

/* Helper vẽ Hoa Văn Mặt Trời Trống Đồng Đông Sơn 2D trong phù điêu tường */
function drawDongSonSunMotif2D(ctx, cx, cy, r, ringCol, coreCol) {
  ctx.save();
  ctx.strokeStyle = ringCol || '#F4B93B';
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.68, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = coreCol || '#FDE047';
  for (var i = 0; i < 12; i++) {
    var a = (i * Math.PI * 2) / 12;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a - 0.12) * r * 0.28, cy + Math.sin(a - 0.12) * r * 0.28);
    ctx.lineTo(cx + Math.cos(a) * r * 0.64, cy + Math.sin(a) * r * 0.64);
    ctx.lineTo(cx + Math.cos(a + 0.12) * r * 0.28, cy + Math.sin(a + 0.12) * r * 0.28);
    ctx.closePath();
    ctx.fill();
  }
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.24, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/* ==================== 2. PHÒNG 1 ('locker_tunnel'): PHÒNG THAY ĐỒ ĐT VIỆT NAM & ĐƯỜNG HẦM ==================== */
function drawStadiumLockerWalls3D(ctx, cam, st) {
  // ---- TƯỜNG TRÁI (X = -5.93): DÃY TỦ ÁO ĐẤU ĐỘI TUYỂN VIỆT NAM (#10, #19, #22, #9) ----
  drawStadiumClippedQuad(
    ctx, cam,
    [[-5.93, 3.44, 1.8], [-5.93, 3.44, 11.6], [-5.93, 2.86, 11.6], [-5.93, 2.86, 1.8]],
    '#7F1D1D', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(13, Math.round(bh * 0.40)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('★ PHÒNG THAY ĐỒ ĐỘI TUYỂN VIỆT NAM ★', cx, cy, safeW);
    }
  );

  var lockers = [
    { z1: 1.9, z2: 4.1, num: '#10', name: 'SỐ 10 · TIỀN ĐẠO' },
    { z1: 4.4, z2: 6.6, num: '#19', name: 'SỐ 19 · TIỀN VỆ' },
    { z1: 6.9, z2: 9.1, num: '#22', name: 'SỐ 22 · TRUNG PHONG' },
    { z1: 9.4, z2: 11.6, num: '#9',  name: 'SỐ 9 · CÁNH PHẢI' }
  ];
  for (var li = 0; li < lockers.length; li++) {
    (function(lk) {
      drawStadiumClippedQuad(
        ctx, cam,
        [[-5.93, 2.74, lk.z1], [-5.93, 2.74, lk.z2], [-5.93, 0.96, lk.z2], [-5.93, 0.96, lk.z1]],
        '#3B1810', '#F4B93B', 2.0,
        function(cx, cy, bw, bh, safeW) {
          // Hộc tủ gỗ lim đỏ hắt đèn LED vàng ấm
          ctx.fillStyle = '#FFF5D6';
          ctx.fillRect(cx - bw * 0.44, cy - bh * 0.42, bw * 0.88, bh * 0.68);
          drawVietnamLockerJersey2D(ctx, cx, cy - bh * 0.04, bw * 0.72, bh * 0.62, lk.num);
          var tPx = Math.max(4, Math.min(10, Math.round(bh * 0.12)));
          ctx.font = 'bold ' + tPx + 'px monospace';
          ctx.fillStyle = '#FDE047';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(lk.name, cx, cy + bh * 0.36, safeW);
        }
      );
    })(lockers[li]);
  }

  // ---- TƯỜNG PHẢI (X = +5.93): BẢNG CHIẾN THUẬT 4-3-3 + TỦ SỐ #4 + THANG MÁY VIP ----
  drawStadiumClippedQuad(
    ctx, cam,
    [[5.93, 3.32, 7.6], [5.93, 3.32, 2.0], [5.93, 1.15, 2.0], [5.93, 1.15, 7.6]],
    '#14532D', '#F4B93B', 2.4,
    function(cx, cy, bw, bh, safeW) {
      // Mặt bảng sa bàn cỏ xanh kẻ vạch chiến thuật 4-3-3
      ctx.fillStyle = '#166534';
      ctx.fillRect(cx - bw * 0.45, cy - bh * 0.30, bw * 0.90, bh * 0.68);
      ctx.strokeStyle = '#DCFCE7';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(cx - bw * 0.43, cy - bh * 0.26, bw * 0.86, bh * 0.60);
      ctx.beginPath();
      ctx.moveTo(cx, cy - bh * 0.26); ctx.lineTo(cx, cy + bh * 0.34);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy + bh * 0.04, Math.min(bw, bh) * 0.14, 0, Math.PI * 2); ctx.stroke();
      // Các quân cờ nam châm đỏ-vàng sơ đồ 4-3-3
      var pts433 = [
        [-0.36, 0.04], [-0.20, -0.16], [-0.20, -0.03], [-0.20, 0.11], [-0.20, 0.24],
        [0.0, -0.12], [0.0, 0.04], [0.0, 0.20],
        [0.24, -0.15], [0.28, 0.04], [0.24, 0.22]
      ];
      for (var pi = 0; pi < pts433.length; pi++) {
        ctx.fillStyle = pi === 0 ? '#FACC15' : '#DC2626';
        ctx.beginPath();
        ctx.arc(cx + pts433[pi][0] * bw, cy + pts433[pi][1] * bh, Math.max(2, bh * 0.045), 0, Math.PI * 2);
        ctx.fill();
      }
      var tPx = Math.max(5, Math.min(11, Math.round(bh * 0.12)));
      ctx.font = 'bold ' + tPx + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CHIẾN THUẬT 4-3-3 · ĐỘI TUYỂN VIỆT NAM', cx, cy - bh * 0.39, safeW);
    }
  );

  // Cửa Thang Máy VIP sang Phòng Cúp Vàng & Họp Báo (X = +5.93, Z = 8.4..11.2)
  drawStadiumClippedQuad(
    ctx, cam,
    [[5.93, 2.68, 11.1], [5.93, 2.68, 8.5], [5.93, 0.02, 8.5], [5.93, 0.02, 11.1]],
    '#451A03', '#F4B93B', 3.0,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#78350F';
      ctx.fillRect(cx - bw * 0.42, cy - bh * 0.46, bw * 0.84, bh * 0.92);
      ctx.fillStyle = '#D97706';
      ctx.fillRect(cx - bw * 0.36, cy - bh * 0.42, bw * 0.34, bh * 0.84);
      ctx.fillRect(cx + bw * 0.02, cy - bh * 0.42, bw * 0.34, bh * 0.84);
      drawDongSonSunMotif2D(ctx, cx, cy - bh * 0.06, Math.min(bw, bh) * 0.22, '#FDE047', '#FEF08A');
      var px = Math.max(4, Math.min(9, Math.round(bh * 0.08)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FFFBF1';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('VIP LOUNGE', cx, cy + bh * 0.32, safeW);
    }
  );
  drawStadiumClippedQuad(
    ctx, cam,
    [[5.93, 3.38, 11.3], [5.93, 3.38, 8.3], [5.93, 2.76, 8.3], [5.93, 2.76, 11.3]],
    '#7F1D1D', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🏆 PHÒNG CÚP VÀNG VIP →', cx, cy, safeW);
    }
  );

  // ---- TƯỜNG CUỐI (Z = 14.72): VÒM ĐƯỜNG HẦM CẦU THỦ FIFA "RA SÂN THI ĐẤU →" ----
  // Biển chỉ dẫn lớn phía trên vòm đường hầm
  drawStadiumClippedQuad(
    ctx, cam,
    [[-3.6, 3.55, 14.72], [3.6, 3.55, 14.72], [3.6, 2.86, 14.72], [-3.6, 2.86, 14.72]],
    '#991B1B', '#F4B93B', 2.5,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(6, Math.min(14, Math.round(bh * 0.38)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('⚽ RA SÂN THI ĐẤU → · FIFA TUNNEL', cx, cy, safeW);
    }
  );

  // Cửa vòm Đường Hầm FIFA phát sáng nhìn ra thảm cỏ xanh rực rỡ
  drawStadiumClippedQuad(
    ctx, cam,
    [[-2.25, 2.78, 14.72], [2.25, 2.78, 14.72], [2.25, 0.02, 14.72], [-2.25, 0.02, 14.72]],
    '#0F172A', '#F4B93B', 3.0,
    function(cx, cy, bw, bh, safeW) {
      // Ánh sáng sân vận động & thảm cỏ xanh phía cuối đường hầm
      ctx.fillStyle = '#1E3A8A';
      ctx.fillRect(cx - bw * 0.42, cy - bh * 0.42, bw * 0.84, bh * 0.48);
      ctx.fillStyle = '#16A34A';
      ctx.fillRect(cx - bw * 0.42, cy + bh * 0.04, bw * 0.84, bh * 0.42);
      // Thảm đỏ dẫn thẳng ra sân
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(cx - bw * 0.16, cy + bh * 0.04, bw * 0.32, bh * 0.46);
      // Dàn đèn pha stadium lấp lánh
      ctx.fillStyle = '#FEF08A';
      for (var fi = -2; fi <= 2; fi++) {
        ctx.beginPath();
        ctx.arc(cx + fi * bw * 0.15, cy - bh * 0.26, Math.max(2, bw * 0.03), 0, Math.PI * 2);
        ctx.fill();
      }
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.09)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FFFBF1';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('TRỐNG ĐỒNG ARENA', cx, cy - bh * 0.06, safeW);
    }
  );

  // 2 Huy hiệu Cờ Đỏ Sao Vàng & Tủ Áo #4 hai bên vòm đường hầm
  drawStadiumClippedQuad(
    ctx, cam,
    [[-5.55, 2.72, 14.72], [-2.55, 2.72, 14.72], [-2.55, 1.10, 14.72], [-5.55, 1.10, 14.72]],
    '#DA251D', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      drawDongSonSunMotif2D(ctx, cx, cy - bh * 0.08, Math.min(bw, bh) * 0.28, '#FDE047', '#FDE047');
      var px = Math.max(5, Math.min(10, Math.round(bh * 0.13)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CHIẾN BINH SAO VÀNG', cx, cy + bh * 0.34, safeW);
    }
  );
  drawStadiumClippedQuad(
    ctx, cam,
    [[2.55, 2.72, 14.72], [5.55, 2.72, 14.72], [5.55, 1.10, 14.72], [2.55, 1.10, 14.72]],
    '#3B1810', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#FFF5D6';
      ctx.fillRect(cx - bw * 0.42, cy - bh * 0.40, bw * 0.84, bh * 0.64);
      drawVietnamLockerJersey2D(ctx, cx, cy - bh * 0.04, bw * 0.64, bh * 0.58, '#4');
      var px = Math.max(4, Math.min(9, Math.round(bh * 0.12)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('SỐ 4 · TRUNG VỆ', cx, cy + bh * 0.34, safeW);
    }
  );
}

/* ==================== 3. PHÒNG 2 ('pitch_arena'): SÂN CỎ TRỐNG ĐỒNG & KHÁN ĐÀI 11V11 ==================== */
function drawStadiumPitchWalls3D(ctx, cam, st) {
  var vnScore = (st && typeof st.vnScore === 'number') ? st.vnScore : 2;
  var flash = (st && st.goalFlashUntil && st.t < st.goalFlashUntil);

  // Helper vẽ khán đài cổ động viên Đỏ-Vàng rực lửa
  function drawGrandstandCrowd2D(cx, cy, bw, bh) {
    var rows = 4;
    for (var r = 0; r < rows; r++) {
      var ry = cy - bh * 0.44 + r * (bh * 0.22);
      ctx.fillStyle = r % 2 === 0 ? '#991B1B' : '#7F1D1D';
      ctx.fillRect(cx - bw * 0.48, ry, bw * 0.96, bh * 0.18);
      for (var c = 0; c < 14; c++) {
        var fx = cx - bw * 0.44 + c * (bw * 0.066);
        var bounce = ((r + c) % 2 === 0) ? -1.5 : 1.0;
        ctx.fillStyle = ((c + r) % 3 === 0) ? '#FACC15' : '#DC2626';
        ctx.fillRect(fx, ry + bh * 0.04 + bounce, bw * 0.042, bh * 0.11);
        ctx.fillStyle = '#FDE68A';
        ctx.fillRect(fx + bw * 0.008, ry + bounce, bw * 0.026, bh * 0.05);
      }
    }
  }

  // ---- TƯỜNG TRÁI (X = -5.93): KHÁN ĐÀI BẮC-TÂY & ĐẠI BIỂU NGỮ "VIỆT NAM VÔ ĐỊCH ★" ----
  drawStadiumClippedQuad(
    ctx, cam,
    [[-5.93, 3.48, 0.8], [-5.93, 3.48, 14.0], [-5.93, 2.84, 14.0], [-5.93, 2.84, 0.8]],
    '#DA251D', '#FDE047', 2.4,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(6, Math.min(14, Math.round(bh * 0.42)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('★ VIỆT NAM VÔ ĐỊCH · TRỐNG ĐỒNG ARENA ★', cx, cy, safeW);
    }
  );
  drawStadiumClippedQuad(
    ctx, cam,
    [[-5.93, 2.74, 0.8], [-5.93, 2.74, 14.0], [-5.93, 0.92, 14.0], [-5.93, 0.92, 0.8]],
    '#450A0A', '#F4B93B', 2.0,
    function(cx, cy, bw, bh) {
      drawGrandstandCrowd2D(cx, cy, bw, bh);
    }
  );

  // ---- TƯỜNG PHẢI (X = +5.93): KHÁN ĐÀI ĐÔNG-NAM & CỬA LÊN PHÒNG CÚP VÀNG VIP ----
  drawStadiumClippedQuad(
    ctx, cam,
    [[5.93, 3.48, 14.0], [5.93, 3.48, 0.8], [5.93, 2.84, 0.8], [5.93, 2.84, 14.0]],
    '#991B1B', '#FDE047', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(6, Math.min(13, Math.round(bh * 0.40)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('★ CỔ ĐỘNG VIÊN SAO VÀNG · FIFA FAIR PLAY ★', cx, cy, safeW);
    }
  );
  drawStadiumClippedQuad(
    ctx, cam,
    [[5.93, 2.74, 8.0], [5.93, 2.74, 0.8], [5.93, 0.92, 0.8], [5.93, 0.92, 8.0]],
    '#450A0A', '#F4B93B', 2.0,
    function(cx, cy, bw, bh) {
      drawGrandstandCrowd2D(cx, cy, bw, bh);
    }
  );
  // Lối VIP lên Phòng Cúp Vàng & Họp Báo (X = +5.93, Z = 8.4..11.4)
  drawStadiumClippedQuad(
    ctx, cam,
    [[5.93, 2.68, 11.4], [5.93, 2.68, 8.4], [5.93, 0.02, 8.4], [5.93, 0.02, 11.4]],
    '#78350F', '#FDE047', 2.8,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(cx - bw * 0.38, cy - bh * 0.44, bw * 0.76, bh * 0.88);
      drawDongSonSunMotif2D(ctx, cx, cy - bh * 0.05, Math.min(bw, bh) * 0.24, '#FDE047', '#FDE047');
      var px = Math.max(4, Math.min(10, Math.round(bh * 0.09)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🏆 CÚP VÀNG VIP →', cx, cy + bh * 0.32, safeW);
    }
  );

  // ---- TƯỜNG CUỐI (Z = 14.72): BẢNG ĐIỆN TỬ LED SCOREBOARD & KHÁN ĐÀI SAU KHUNG THÀNH ----
  drawStadiumClippedQuad(
    ctx, cam,
    [[-4.4, 3.58, 14.72], [4.4, 3.58, 14.72], [4.4, 2.42, 14.72], [-4.4, 2.42, 14.72]],
    flash ? '#991B1B' : '#0F172A', '#FDE047', 2.8,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(6, Math.min(15, Math.round(bh * 0.30)));
      var p2 = Math.max(4, Math.min(10, Math.round(bh * 0.18)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.fillText('VIỆT NAM ' + vnScore + ' - 0 ĐỘI KHÁCH', cx, cy - bh * 0.10, safeW);
      ctx.font = 'bold ' + p2 + 'px monospace';
      ctx.fillStyle = flash ? '#FEF08A' : '#4ADE80';
      ctx.fillText(flash ? '⚽ VÀOOOOO! SIÊU PHẨM TRỐNG ĐỒNG! ⚽' : '⏱ 89:45 · SÂN VẬN ĐỘNG TRỐNG ĐỒNG FIFA', cx, cy + bh * 0.24, safeW);
    }
  );
  drawStadiumClippedQuad(
    ctx, cam,
    [[-5.6, 2.32, 14.72], [5.6, 2.32, 14.72], [5.6, 0.90, 14.72], [-5.6, 0.90, 14.72]],
    '#7F1D1D', '#F4B93B', 2.0,
    function(cx, cy, bw, bh) {
      drawGrandstandCrowd2D(cx, cy, bw, bh);
    }
  );

  // ---- TƯỜNG TRƯỚC (Z = 0.06): CỬA ĐƯỜNG HẦM VỀ PHÒNG THAY ĐỒ ----
  drawStadiumClippedQuad(
    ctx, cam,
    [[2.4, 3.40, 0.06], [-2.4, 3.40, 0.06], [-2.4, 2.74, 0.06], [2.4, 2.74, 0.06]],
    '#7F1D1D', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('← VỀ PHÒNG THAY ĐỒ & HẬU TRƯỜNG', cx, cy, safeW);
    }
  );
}

/* ==================== 4. PHÒNG 3 ('trophy_vip'): PHÒNG CÚP VÀNG & HỌP BÁO QUỐC TẾ FIFA ==================== */
function drawStadiumTrophyWalls3D(ctx, cam) {
  // ---- TƯỜNG CUỐI (Z = 14.72): PHÔNG NỀN HỌP BÁO QUỐC TẾ & PHÙ ĐIÊU TRỐNG ĐỒNG ----
  drawStadiumClippedQuad(
    ctx, cam,
    [[-4.95, 3.48, 14.72], [4.95, 3.48, 14.72], [4.95, 1.05, 14.72], [-4.95, 1.05, 14.72]],
    '#7F1D1D', '#FDE047', 2.8,
    function(cx, cy, bw, bh, safeW) {
      // Nền đỏ-vàng hoàng gia + Mặt trời Trống Đồng Đông Sơn ở tâm
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(cx - bw * 0.46, cy - bh * 0.44, bw * 0.92, bh * 0.88);
      drawDongSonSunMotif2D(ctx, cx, cy + bh * 0.05, Math.min(bw, bh) * 0.28, '#FDE047', '#FEF08A');
      var p1 = Math.max(6, Math.min(14, Math.round(bh * 0.14)));
      var p2 = Math.max(5, Math.min(11, Math.round(bh * 0.10)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.fillText('HỌP BÁO QUỐC TẾ · TRỐNG ĐỒNG ARENA', cx, cy - bh * 0.31, safeW);
      ctx.font = 'bold ' + p2 + 'px monospace';
      ctx.fillStyle = '#FFFBF1';
      ctx.fillText('★ FIFA WORLD CHAMPIONS · ĐỘI TUYỂN VIỆT NAM ★', cx, cy + bh * 0.36, safeW);
    }
  );

  // ---- TƯỜNG TRÁI (X = -5.93): PHÙ ĐIÊU DI SẢN ĐÔNG SƠN & CỬA RA SÂN CỎ ----
  drawStadiumClippedQuad(
    ctx, cam,
    [[-5.93, 3.36, 1.8], [-5.93, 3.36, 7.8], [-5.93, 1.15, 7.8], [-5.93, 1.15, 1.8]],
    '#451A03', '#F4B93B', 2.4,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#78350F';
      ctx.fillRect(cx - bw * 0.45, cy - bh * 0.42, bw * 0.90, bh * 0.84);
      drawDongSonSunMotif2D(ctx, cx, cy + bh * 0.04, Math.min(bw, bh) * 0.28, '#F4B93B', '#FDE047');
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.12)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('DI SẢN TRỐNG ĐỒNG ĐÔNG SƠN', cx, cy - bh * 0.32, safeW);
    }
  );
  // Cửa vòm sang Sân Cỏ Trống Đồng (X = -5.93, Z = 8.4..11.2)
  drawStadiumClippedQuad(
    ctx, cam,
    [[-5.93, 2.68, 8.4], [-5.93, 2.68, 11.2], [-5.93, 0.02, 11.2], [-5.93, 0.02, 8.4]],
    '#14532D', '#F4B93B', 2.8,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#16A34A';
      ctx.fillRect(cx - bw * 0.38, cy - bh * 0.42, bw * 0.76, bh * 0.84);
      var px = Math.max(5, Math.min(10, Math.round(bh * 0.10)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FFFBF1';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('⚽ RA SÂN CỎ', cx, cy, safeW);
    }
  );
  drawStadiumClippedQuad(
    ctx, cam,
    [[-5.93, 3.38, 8.3], [-5.93, 3.38, 11.3], [-5.93, 2.76, 11.3], [-5.93, 2.76, 8.3]],
    '#7F1D1D', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('← RA SÂN CỎ TRỐNG ĐỒNG', cx, cy, safeW);
    }
  );

  // ---- TƯỜNG PHẢI (X = +5.93): BẢNG VÀNG LỊCH SỬ & CỬA VỀ PHÒNG THAY ĐỒ ----
  drawStadiumClippedQuad(
    ctx, cam,
    [[5.93, 3.36, 7.8], [5.93, 3.36, 1.8], [5.93, 1.15, 1.8], [5.93, 1.15, 7.8]],
    '#7F1D1D', '#F4B93B', 2.4,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(5, Math.min(12, Math.round(bh * 0.14)));
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('★ HALL OF CHAMPIONS · VIỆT NAM ★', cx, cy - bh * 0.28, safeW);
      drawVietnamLockerJersey2D(ctx, cx - bw * 0.24, cy + bh * 0.08, bw * 0.22, bh * 0.50, '10');
      drawVietnamLockerJersey2D(ctx, cx,            cy + bh * 0.08, bw * 0.22, bh * 0.50, '19');
      drawVietnamLockerJersey2D(ctx, cx + bw * 0.24, cy + bh * 0.08, bw * 0.22, bh * 0.50, '22');
    }
  );
  // Cửa về Phòng Thay Đồ (X = +5.93, Z = 8.4..11.2)
  drawStadiumClippedQuad(
    ctx, cam,
    [[5.93, 2.68, 11.2], [5.93, 2.68, 8.4], [5.93, 0.02, 8.4], [5.93, 0.02, 11.2]],
    '#451A03', '#F4B93B', 2.8,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#78350F';
      ctx.fillRect(cx - bw * 0.38, cy - bh * 0.42, bw * 0.76, bh * 0.84);
      var px = Math.max(5, Math.min(10, Math.round(bh * 0.10)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('👕 HẬU TRƯỜNG', cx, cy, safeW);
    }
  );
  drawStadiumClippedQuad(
    ctx, cam,
    [[5.93, 3.38, 11.3], [5.93, 3.38, 8.3], [5.93, 2.76, 8.3], [5.93, 2.76, 11.3]],
    '#7F1D1D', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('👕 VỀ PHÒNG THAY ĐỒ →', cx, cy, safeW);
    }
  );
}

/* ==================== 5. HÀM ĐIỀU PHỐI MỸ THUẬT TƯỜNG 3 PHÒNG ==================== */
function drawStadiumRoomWalls3D(ctx, cam, room, st) {
  if (room === 'pitch_arena') {
    drawStadiumPitchWalls3D(ctx, cam, st);
  } else if (room === 'trophy_vip') {
    drawStadiumTrophyWalls3D(ctx, cam);
  } else {
    drawStadiumLockerWalls3D(ctx, cam, st);
  }
}
`;
}
