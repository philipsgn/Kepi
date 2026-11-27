/**
 * Bộ Sưu Tập Mỹ Thuật Tường 3 Phòng Độc Bản — Chợ Bến Thành Sài Gòn TPS 3D (Quyết định 246)
 * - Phòng 1 ('south_hall' — Sảnh Cửa Nam & Sạp Vải Áo Dài):
 *   + Tường Trái (X = -5.93): SẠP VẢI & ÁO DÀI HƯƠNG TRINH (cuộn lụa tơ tằm đủ màu, Áo Dài thêu hoa sen, nón lá bài thơ).
 *   + Tường Phải (X = +5.93): ĐẶC SẢN LIÊN SÀI GÒN & NGỌC HOA 823 (hộp trà sen, hũ mứt nắp đỏ, túi cà phê rang xay) & lối rẽ sang Sảnh Trái Cây.
 *   + Tường Cuối (Z = 14.72): Cổng Vòm KHU ĂN UỐNG · SẠP 1044 dẫn thẳng vào Khu Ẩm Thực Trung Tâm.
 *   + Tường Trước (Z = 0.04): Biển CỬA SỐ 1 · CỬA NAM & hoa văn sắt xếp Bến Thành cổ điển.
 * - Phòng 2 ('food_court' — Khu Ẩm Thực Trung Tâm Sạp 1044):
 *   + Tường Trái (X = -5.93): BÁNH CUỐN NÓNG 50K (nồi tráng vải trắng nghi ngút khói, chả lụa, hành phi, bảng thực đơn).
 *   + Tường Phải (X = +5.93): BÁNH BÈO HUẾ 20K & CHÈ SÀI GÒN (khay chén sứ bánh bèo tôm cháy, ly chè ba màu, nem chua lá chuối) & lối sang Sảnh Trái Cây.
 *   + Tường Cuối (Z = 14.72): Bảng hiệu lớn KHU ĂN UỐNG CHỢ BẾN THÀNH · SẠP 1044 + kệ dừa tươi & thực đơn món ngon Sài Gòn.
 *   + Tường Trước (Z = 0.06): Lối vòm quay về SẢNH CỬA NAM.
 * - Phòng 3 ('fruit_craft' — Sảnh Trái Cây Nhiệt Đới & Đồ Lưu Niệm Nón Lá):
 *   + Tường Trái (X = -5.93): GỐM SỨ & SƠN MÀI BẾN THÀNH (bình gốm Bát Tràng men lam, tranh sơn mài cẩn trứng, giỏ mây tre đan).
 *   + Tường Phải (X = +5.93): NÓN LÁ & QUÀ LƯU NIỆM SÀI GÒN (dàn nón lá treo tầng, túi cói thêu, quạt nan) & lối sang Khu Ẩm Thực.
 *   + Tường Cuối (Z = 14.72): Vòm CỬA BẮC · TRÁI CÂY NHIỆT ĐỚI 1029 NGỌC HẢO.
 *   + Tường Trước (Z = 0.06): Lối vòm về SẢNH CỬA NAM.
 * - 100% bảng chữ áp dụng khóa khung 4 góc ctx.clip() + safeW (maxWidth) chống tràn chữ mọi góc 360°.
 * - Tuyệt đối không dùng ctx.roundRect.
 */
export function buildMarketWallArtScript(): string {
  return String.raw`
/* ==================== 1. HELPER KHÓA KHUNG 4 GÓC CHỐNG TRÀN CHỮ 100% ==================== */
function drawMarketClippedQuad(ctx, cam, pts, bgCol, borderCol, lineW, drawInner) {
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

/* Helper vẽ tà Áo Dài lụa Việt Nam treo trong sạp */
function drawPixelAoDaiIcon(ctx, cx, cy, w, h, dressCol, trimCol, lotusCol) {
  // Vai & tay áo dài
  ctx.fillStyle = dressCol;
  ctx.fillRect(cx - w * 0.42, cy - h * 0.38, w * 0.84, h * 0.22);
  // Thân trên ôm eo
  ctx.fillRect(cx - w * 0.24, cy - h * 0.38, w * 0.48, h * 0.34);
  // Quần lụa trắng/vàng bên trong
  ctx.fillStyle = '#FFFBEB';
  ctx.fillRect(cx - w * 0.20, cy + h * 0.02, w * 0.40, h * 0.38);
  // Tà áo dài xẻ hai bên
  ctx.fillStyle = dressCol;
  ctx.fillRect(cx - w * 0.27, cy - h * 0.04, w * 0.54, h * 0.38);
  // Cổ cao truyền thống & hoa sen thêu ngực
  ctx.fillStyle = trimCol || '#FDE047';
  ctx.fillRect(cx - w * 0.11, cy - h * 0.43, w * 0.22, h * 0.07);
  ctx.fillStyle = lotusCol || '#F43F5E';
  ctx.beginPath();
  ctx.arc(cx, cy - h * 0.18, Math.max(2, w * 0.09), 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2B180E';
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - w * 0.27, cy - h * 0.38, w * 0.54, h * 0.72);
}

/* Helper vẽ Nón Lá truyền thống */
function drawPixelNonLaIcon(ctx, nx, ny, rw, rh, ribbonCol) {
  ctx.fillStyle = '#E8C574';
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(nx, ny - rh * 0.55);
  ctx.lineTo(nx - rw * 0.5, ny + rh * 0.35);
  ctx.lineTo(nx + rw * 0.5, ny + rh * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Quai lụa dưới nón
  ctx.fillStyle = ribbonCol || '#DC2626';
  ctx.fillRect(nx - rw * 0.18, ny + rh * 0.32, rw * 0.36, Math.max(1.5, rh * 0.12));
}

/* ==================== 2. PHÒNG 1 ('south_hall'): SẢNH CỬA NAM & SẠP VẢI ÁO DÀI ==================== */
function drawMarketSouthHallWalls3D(ctx, cam) {
  // ---- TƯỜNG TRƯỚC (Z = 0.04): BIỂN CỬA SỐ 1 · CỬA NAM ----
  drawMarketClippedQuad(
    ctx, cam,
    [[-2.25, 3.55, 0.04], [2.25, 3.55, 0.04], [2.25, 2.78, 0.04], [-2.25, 2.78, 0.04]],
    '#7F1D1D', '#F4B93B', 2.4,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(5, Math.min(13, Math.round(bh * 0.36)));
      var p2 = Math.max(4, Math.min(10, Math.round(bh * 0.24)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.fillText('CỬA SỐ 1 · CỬA NAM', cx, cy - bh * 0.14, safeW);
      ctx.font = 'bold ' + p2 + 'px monospace';
      ctx.fillStyle = '#FFFBF1';
      ctx.fillText('CHỢ BẾN THÀNH · SÀI GÒN', cx, cy + bh * 0.22, safeW);
    }
  );

  // ---- TƯỜNG TRÁI (X = -5.93): SẠP VẢI & ÁO DÀI HƯƠNG TRINH ----
  drawMarketClippedQuad(
    ctx, cam,
    [[-5.93, 3.44, 1.6], [-5.93, 3.44, 11.4], [-5.93, 2.84, 11.4], [-5.93, 2.84, 1.6]],
    '#881337', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(13, Math.round(bh * 0.40)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('SẠP VẢI & ÁO DÀI HƯƠNG TRINH', cx, cy, safeW);
    }
  );

  // 3 Gian trưng bày Lụa Tơ Tằm, Áo Dài Thêu & Nón Lá dọc tường trái
  var silkBays = [
    { z1: 1.7, z2: 4.8, title: 'LỤA TƠ TẰM HÀ ĐÔNG', c1: '#E11D48', c2: '#F59E0B', c3: '#10B981' },
    { z1: 5.0, z2: 8.1, title: 'ÁO DÀI THÊU HOA SEN', c1: '#DC2626', c2: '#2563EB', c3: '#D97706' },
    { z1: 8.3, z2: 11.4, title: 'GẤM VÓC & NÓN LÁ', c1: '#9333EA', c2: '#059669', c3: '#E11D48' }
  ];
  for (var bi = 0; bi < silkBays.length; bi++) {
    (function(bay, idx) {
      drawMarketClippedQuad(
        ctx, cam,
        [[-5.93, 2.74, bay.z1], [-5.93, 2.74, bay.z2], [-5.93, 0.92, bay.z2], [-5.93, 0.92, bay.z1]],
        '#4A2511', '#D97706', 2.0,
        function(cx, cy, bw, bh, safeW) {
          ctx.fillStyle = '#FFF5D6';
          ctx.fillRect(cx - bw * 0.45, cy - bh * 0.44, bw * 0.90, bh * 0.72);
          // Hàng nón lá treo phía trên
          drawPixelNonLaIcon(ctx, cx - bw * 0.26, cy - bh * 0.28, bw * 0.18, bh * 0.16, bay.c1);
          drawPixelNonLaIcon(ctx, cx,            cy - bh * 0.28, bw * 0.18, bh * 0.16, bay.c2);
          drawPixelNonLaIcon(ctx, cx + bw * 0.26, cy - bh * 0.28, bw * 0.18, bh * 0.16, bay.c3);
          if (idx === 1) {
            // Gian giữa: 3 Bộ Áo Dài Thêu rực rỡ
            drawPixelAoDaiIcon(ctx, cx - bw * 0.27, cy + bh * 0.04, bw * 0.22, bh * 0.46, bay.c1, '#FDE047', '#FDE047');
            drawPixelAoDaiIcon(ctx, cx,            cy + bh * 0.04, bw * 0.22, bh * 0.46, bay.c2, '#FFFBF1', '#FB7185');
            drawPixelAoDaiIcon(ctx, cx + bw * 0.27, cy + bh * 0.04, bw * 0.22, bh * 0.46, bay.c3, '#7F1D1D', '#FEF08A');
          } else {
            // Cuộn vải lụa xếp tầng + Áo dài mẫu ở giữa
            var silkCols = [bay.c1, '#FACC15', bay.c2, '#EC4899', bay.c3, '#38BDF8'];
            for (var r = 0; r < 6; r++) {
              var rx = cx - bw * 0.39 + (r % 3) * bw * 0.28;
              var ry = cy - bh * 0.08 + Math.floor(r / 3) * bh * 0.18;
              ctx.fillStyle = silkCols[r];
              ctx.fillRect(rx, ry, bw * 0.20, bh * 0.13);
              ctx.fillStyle = '#FFFBF1';
              ctx.fillRect(rx + bw * 0.03, ry + bh * 0.04, bw * 0.14, bh * 0.04);
            }
          }
          var tPx = Math.max(4, Math.min(10, Math.round(bh * 0.11)));
          ctx.font = 'bold ' + tPx + 'px monospace';
          ctx.fillStyle = '#FDE047';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(bay.title, cx, cy + bh * 0.37, safeW);
        }
      );
    })(silkBays[bi], bi);
  }

  // ---- TƯỜNG PHẢI (X = +5.93): ĐẶC SẢN LIÊN SÀI GÒN & NGỌC HOA + LỐI SANG SẢNH TRÁI CÂY ----
  drawMarketClippedQuad(
    ctx, cam,
    [[5.93, 3.44, 8.2], [5.93, 3.44, 1.6], [5.93, 2.84, 1.6], [5.93, 2.84, 8.2]],
    '#14532D', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.38)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ĐẶC SẢN LIÊN SÀI GÒN & NGỌC HOA', cx, cy, safeW);
    }
  );

  // Kệ Trà Sen, Hũ Mứt Nắp Đỏ & Cà Phê Sài Gòn (Z = 1.7..8.1)
  drawMarketClippedQuad(
    ctx, cam,
    [[5.93, 2.74, 8.1], [5.93, 2.74, 1.7], [5.93, 0.92, 1.7], [5.93, 0.92, 8.1]],
    '#3B2314', '#C89B3C', 2.0,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(cx - bw * 0.46, cy - bh * 0.42, bw * 0.92, bh * 0.72);
      // 3 Tầng kệ gỗ trưng bày hũ mứt nắp đỏ, hộp trà xanh & gói cà phê vàng
      for (var row = 0; row < 3; row++) {
        var sy = cy - bh * 0.24 + row * bh * 0.22;
        ctx.fillStyle = '#5C341D';
        ctx.fillRect(cx - bw * 0.45, sy + bh * 0.12, bw * 0.90, Math.max(2, bh * 0.04));
        for (var col = 0; col < 6; col++) {
          var jx = cx - bw * 0.41 + col * bw * 0.145;
          if (row === 0) {
            // Hộp trà sen xanh ngọc nắp vàng
            ctx.fillStyle = '#15803D';
            ctx.fillRect(jx, sy, bw * 0.11, bh * 0.12);
            ctx.fillStyle = '#FACC15';
            ctx.fillRect(jx, sy - bh * 0.02, bw * 0.11, bh * 0.03);
          } else if (row === 1) {
            // Hũ mứt thủy tinh nắp đỏ đặc trưng Chợ Bến Thành
            ctx.fillStyle = '#FDE68A';
            ctx.fillRect(jx, sy + bh * 0.01, bw * 0.11, bh * 0.11);
            ctx.fillStyle = '#D97706';
            ctx.fillRect(jx + bw * 0.02, sy + bh * 0.03, bw * 0.07, bh * 0.07);
            ctx.fillStyle = '#DC2626';
            ctx.fillRect(jx - bw * 0.005, sy - bh * 0.02, bw * 0.12, bh * 0.035);
          } else {
            // Túi cà phê rang xay Sài Gòn
            ctx.fillStyle = '#78350F';
            ctx.fillRect(jx, sy, bw * 0.11, bh * 0.12);
            ctx.fillStyle = '#F4B93B';
            ctx.fillRect(jx + bw * 0.02, sy + bh * 0.03, bw * 0.07, bh * 0.05);
          }
        }
      }
      var tPx = Math.max(4, Math.min(10, Math.round(bh * 0.10)));
      ctx.font = 'bold ' + tPx + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('TRÀ SEN · MỨT TẾT · CÀ PHÊ RANG XAY 823', cx, cy + bh * 0.38, safeW);
    }
  );

  // Vòm hành lang rẽ sang SẢNH TRÁI CÂY & LƯU NIỆM (X = +5.93, Z = 8.6..11.4)
  drawMarketClippedQuad(
    ctx, cam,
    [[5.93, 2.68, 11.3], [5.93, 2.68, 8.7], [5.93, 0.02, 8.7], [5.93, 0.02, 11.3]],
    '#3F2A18', '#F4B93B', 2.8,
    function(cx, cy, bw, bh) {
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(cx - bw * 0.38, cy - bh * 0.44, bw * 0.76, bh * 0.88);
      // Hình bóng nón lá & trái cây phía xa trong hành lang
      drawPixelNonLaIcon(ctx, cx - bw * 0.16, cy - bh * 0.18, bw * 0.22, bh * 0.18, '#DC2626');
      drawPixelNonLaIcon(ctx, cx + bw * 0.16, cy - bh * 0.18, bw * 0.22, bh * 0.18, '#16A34A');
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath(); ctx.arc(cx, cy + bh * 0.16, Math.max(4, bw * 0.14), 0, Math.PI * 2); ctx.fill();
    }
  );
  drawMarketClippedQuad(
    ctx, cam,
    [[5.93, 3.40, 11.4], [5.93, 3.40, 8.6], [5.93, 2.76, 8.6], [5.93, 2.76, 11.4]],
    '#14532D', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🥭 TRÁI CÂY & NÓN LÁ →', cx, cy, safeW);
    }
  );

  // ---- TƯỜNG CUỐI (Z = 14.72): VÒM LỚN KHU ĂN UỐNG · SẠP 1044 ----
  drawMarketClippedQuad(
    ctx, cam,
    [[-3.2, 3.55, 14.72], [3.2, 3.55, 14.72], [3.2, 2.68, 14.72], [-3.2, 2.68, 14.72]],
    '#991B1B', '#F4B93B', 2.6,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(6, Math.min(14, Math.round(bh * 0.36)));
      var p2 = Math.max(5, Math.min(10, Math.round(bh * 0.24)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.fillText('🥞 KHU ĂN UỐNG · SẠP 1044 ↑', cx, cy - bh * 0.14, safeW);
      ctx.font = 'bold ' + p2 + 'px monospace';
      ctx.fillStyle = '#FFFBF1';
      ctx.fillText('BÁNH CUỐN NÓNG · BÁNH BÈO · CHÈ SÀI GÒN', cx, cy + bh * 0.22, safeW);
    }
  );
  // Cổng vòm mở nhìn xuyên vào ánh đèn ấm Khu Ẩm Thực
  drawMarketClippedQuad(
    ctx, cam,
    [[-2.2, 2.62, 14.72], [2.2, 2.62, 14.72], [2.2, 0.02, 14.72], [-2.2, 0.02, 14.72]],
    '#431407', '#D97706', 2.6,
    function(cx, cy, bw, bh) {
      ctx.fillStyle = '#7C2D12';
      ctx.fillRect(cx - bw * 0.42, cy - bh * 0.44, bw * 0.84, bh * 0.88);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.38)';
      ctx.beginPath(); ctx.arc(cx, cy - bh * 0.18, bw * 0.28, 0, Math.PI * 2); ctx.fill();
    }
  );
}

/* ==================== 3. PHÒNG 2 ('food_court'): KHU ẨM THỰC TRUNG TÂM SẠP 1044 ==================== */
function drawMarketFoodCourtWalls3D(ctx, cam, pig, t) {
  // ---- TƯỜNG TRƯỚC (Z = 0.06): LỐI VỀ SẢNH CỬA NAM ----
  drawMarketClippedQuad(
    ctx, cam,
    [[-2.2, 3.45, 0.06], [2.2, 3.45, 0.06], [2.2, 2.74, 0.06], [-2.2, 2.74, 0.06]],
    '#7F1D1D', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('← SẢNH CỬA NAM & ÁO DÀI', cx, cy, safeW);
    }
  );
  drawMarketClippedQuad(
    ctx, cam,
    [[-1.8, 2.68, 0.06], [1.8, 2.68, 0.06], [1.8, 0.02, 0.06], [-1.8, 0.02, 0.06]],
    '#3B2314', '#C89B3C', 2.4,
    function(cx, cy, bw, bh) {
      ctx.fillStyle = '#E8C987';
      ctx.fillRect(cx - bw * 0.40, cy - bh * 0.44, bw * 0.80, bh * 0.88);
    }
  );

  // ---- TƯỜNG TRÁI (X = -5.93): BÁNH CUỐN NÓNG 50K ----
  drawMarketClippedQuad(
    ctx, cam,
    [[-5.93, 3.44, 1.8], [-5.93, 3.44, 11.4], [-5.93, 2.82, 11.4], [-5.93, 2.82, 1.8]],
    '#991B1B', '#FDE047', 2.4,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(13, Math.round(bh * 0.40)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('BÁNH CUỐN NÓNG 50K · TRÁNG TAY', cx, cy, safeW);
    }
  );

  // Gian bếp gạch men trắng BÁNH CUỐN NÓNG + Thực đơn treo tường
  drawMarketClippedQuad(
    ctx, cam,
    [[-5.93, 2.72, 2.0], [-5.93, 2.72, 11.2], [-5.93, 0.96, 11.2], [-5.93, 0.96, 2.0]],
    '#1E3A8A', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      // Tường ốp gạch men trắng xanh sạch bóng của quầy Bánh Cuốn
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(cx - bw * 0.46, cy - bh * 0.42, bw * 0.92, bh * 0.72);
      // Các đường chỉ gạch men
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 0.8;
      for (var gx = -3; gx <= 3; gx++) {
        ctx.beginPath();
        ctx.moveTo(cx + gx * bw * 0.12, cy - bh * 0.42);
        ctx.lineTo(cx + gx * bw * 0.12, cy + bh * 0.30);
        ctx.stroke();
      }
      // Bảng giá món treo nổi bật
      ctx.fillStyle = '#7F1D1D';
      ctx.fillRect(cx - bw * 0.38, cy - bh * 0.32, bw * 0.76, bh * 0.32);
      var p1 = Math.max(5, Math.min(11, Math.round(bh * 0.13)));
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('BÁNH CUỐN CHẢ LỤA: 50K · ĐẶC BIỆT: 65K', cx, cy - bh * 0.16, safeW * 0.85);
      // Đĩa bánh cuốn trắng rắc hành phi & rau thơm minh họa
      for (var di = -1; di <= 1; di++) {
        var dx = cx + di * bw * 0.26, dy = cy + bh * 0.12;
        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath(); ctx.ellipse(dx, dy, bw * 0.09, bh * 0.09, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(dx - bw * 0.05, dy - bh * 0.03, bw * 0.10, bh * 0.05);
        ctx.fillStyle = '#D97706';
        ctx.fillRect(dx - bw * 0.02, dy - bh * 0.02, bw * 0.04, bh * 0.03);
      }
      ctx.font = 'bold ' + Math.max(4, Math.min(9, Math.round(bh * 0.10))) + 'px monospace';
      ctx.fillStyle = '#FEF08A';
      ctx.fillText('NƯỚC MẮM NGUYÊN CHẤT · CHẢ QUẾ HÀ NỘI', cx, cy + bh * 0.38, safeW);
    }
  );

  // ---- TƯỜNG PHẢI (X = +5.93): BÁNH BÈO HUẾ 20K & CHÈ SÀI GÒN + LỐI SANG SẢNH TRÁI CÂY ----
  drawMarketClippedQuad(
    ctx, cam,
    [[5.93, 3.44, 8.2], [5.93, 3.44, 1.8], [5.93, 2.82, 1.8], [5.93, 2.82, 8.2]],
    '#B45309', '#FDE047', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.38)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FFFBF1';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('BÁNH BÈO HUẾ 20K & CHÈ SÀI GÒN', cx, cy, safeW);
    }
  );

  drawMarketClippedQuad(
    ctx, cam,
    [[5.93, 2.72, 8.1], [5.93, 2.72, 1.9], [5.93, 0.96, 1.9], [5.93, 0.96, 8.1]],
    '#4A2511', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#FFFBEB';
      ctx.fillRect(cx - bw * 0.46, cy - bh * 0.42, bw * 0.92, bh * 0.72);
      // Dàn ly Chè Ba Màu Sài Gòn & Nem Chua Lá Chuối treo hàng trên
      for (var ci = 0; ci < 5; ci++) {
        var lx = cx - bw * 0.34 + ci * bw * 0.17;
        // Nem chua gói lá chuối xanh buộc dây hồng
        ctx.fillStyle = '#15803D';
        ctx.fillRect(lx - bw * 0.03, cy - bh * 0.34, bw * 0.06, bh * 0.18);
        ctx.fillStyle = '#F43F5E';
        ctx.fillRect(lx - bw * 0.03, cy - bh * 0.26, bw * 0.06, bh * 0.03);
        // Ly chè 3 màu (đậu đỏ, đậu xanh vàng, lá dứa xanh, cốt dừa trắng)
        var gy = cy + bh * 0.02;
        ctx.fillStyle = '#991B1B'; ctx.fillRect(lx - bw * 0.035, gy + bh * 0.10, bw * 0.07, bh * 0.06);
        ctx.fillStyle = '#FACC15'; ctx.fillRect(lx - bw * 0.035, gy + bh * 0.04, bw * 0.07, bh * 0.06);
        ctx.fillStyle = '#22C55E'; ctx.fillRect(lx - bw * 0.035, gy - bh * 0.02, bw * 0.07, bh * 0.06);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(lx - bw * 0.038, gy - bh * 0.06, bw * 0.076, bh * 0.04);
      }
      var tPx = Math.max(4, Math.min(10, Math.round(bh * 0.10)));
      ctx.font = 'bold ' + tPx + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('BÁNH BÈO CHÉN · NEM CHUA · CHÈ BA MÀU', cx, cy + bh * 0.38, safeW);
    }
  );

  // Vòm thông sang SẢNH TRÁI CÂY & LƯU NIỆM (X = +5.93, Z = 8.6..11.4)
  drawMarketClippedQuad(
    ctx, cam,
    [[5.93, 2.68, 11.3], [5.93, 2.68, 8.7], [5.93, 0.02, 8.7], [5.93, 0.02, 11.3]],
    '#14532D', '#F4B93B', 2.6,
    function(cx, cy, bw, bh) {
      ctx.fillStyle = '#FEF9C3';
      ctx.fillRect(cx - bw * 0.38, cy - bh * 0.44, bw * 0.76, bh * 0.88);
    }
  );
  drawMarketClippedQuad(
    ctx, cam,
    [[5.93, 3.40, 11.4], [5.93, 3.40, 8.6], [5.93, 2.76, 8.6], [5.93, 2.76, 11.4]],
    '#14532D', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🥭 SẢNH TRÁI CÂY →', cx, cy, safeW);
    }
  );

  // ---- TƯỜNG CUỐI (Z = 14.72): BẢNG HIỆU SẠP 1044 · KHU ẨM THỰC CHỢ BẾN THÀNH ----
  drawMarketClippedQuad(
    ctx, cam,
    [[-4.8, 3.48, 14.72], [4.8, 3.48, 14.72], [4.8, 1.55, 14.72], [-4.8, 1.55, 14.72]],
    '#7F1D1D', '#F4B93B', 2.8,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(cx - bw * 0.47, cy - bh * 0.44, bw * 0.94, bh * 0.88);
      var p1 = Math.max(6, Math.min(15, Math.round(bh * 0.22)));
      var p2 = Math.max(5, Math.min(11, Math.round(bh * 0.14)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.fillText('★ SẠP 1044 · ẨM THỰC BẾN THÀNH ★', cx, cy - bh * 0.22, safeW);
      ctx.font = 'bold ' + p2 + 'px monospace';
      ctx.fillStyle = '#FFFBF1';
      ctx.fillText('PHỞ BÒ · BÚN BÒ HUẾ · BÁNH CUỐN · DỪA TƯƠI', cx, cy + bh * 0.08, safeW);
      ctx.fillStyle = '#FDBA74';
      ctx.fillText('HƯƠNG VỊ SÀI GÒN XƯA TỪ 1914', cx, cy + bh * 0.30, safeW);
    }
  );
}

/* ==================== 4. PHÒNG 3 ('fruit_craft'): SẢNH TRÁI CÂY & ĐỒ LƯU NIỆM NÓN LÁ ==================== */
function drawMarketFruitCraftWalls3D(ctx, cam) {
  // ---- TƯỜNG TRƯỚC (Z = 0.06): LỐI VỀ SẢNH CỬA NAM ----
  drawMarketClippedQuad(
    ctx, cam,
    [[-2.2, 3.45, 0.06], [2.2, 3.45, 0.06], [2.2, 2.74, 0.06], [-2.2, 2.74, 0.06]],
    '#881337', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('← VỀ SẢNH CỬA NAM', cx, cy, safeW);
    }
  );

  // ---- TƯỜNG TRÁI (X = -5.93): GỐM SỨ & SƠN MÀI BẾN THÀNH ----
  drawMarketClippedQuad(
    ctx, cam,
    [[-5.93, 3.44, 1.8], [-5.93, 3.44, 11.4], [-5.93, 2.82, 11.4], [-5.93, 2.82, 1.8]],
    '#1E3A8A', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(13, Math.round(bh * 0.38)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('GỐM SỨ & SƠN MÀI BẾN THÀNH', cx, cy, safeW);
    }
  );

  drawMarketClippedQuad(
    ctx, cam,
    [[-5.93, 2.72, 2.0], [-5.93, 2.72, 11.2], [-5.93, 0.94, 11.2], [-5.93, 0.94, 2.0]],
    '#3B2314', '#C89B3C', 2.0,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(cx - bw * 0.46, cy - bh * 0.42, bw * 0.92, bh * 0.72);
      // Hàng trên: Tranh sơn mài đen-đỏ-vàng
      for (var li = -1; li <= 1; li++) {
        var lx = cx + li * bw * 0.28, ly = cy - bh * 0.20;
        ctx.fillStyle = '#1C1917';
        ctx.fillRect(lx - bw * 0.11, ly - bh * 0.14, bw * 0.22, bh * 0.26);
        ctx.strokeStyle = '#F4B93B'; ctx.lineWidth = 1.2;
        ctx.strokeRect(lx - bw * 0.11, ly - bh * 0.14, bw * 0.22, bh * 0.26);
        ctx.fillStyle = '#DC2626';
        ctx.beginPath(); ctx.arc(lx, ly, Math.max(3, bw * 0.05), 0, Math.PI * 2); ctx.fill();
      }
      // Hàng dưới: Bình gốm Bát Tràng men lam & giỏ mây tre đan
      for (var vi = 0; vi < 5; vi++) {
        var vx = cx - bw * 0.34 + vi * bw * 0.17, vy = cy + bh * 0.16;
        if (vi % 2 === 0) {
          // Bình gốm Bát Tràng trắng vẽ lam
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath(); ctx.ellipse(vx, vy, bw * 0.05, bh * 0.11, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#1D4ED8';
          ctx.fillRect(vx - bw * 0.04, vy - bh * 0.03, bw * 0.08, bh * 0.05);
        } else {
          // Giỏ mây tre đan vàng nâu
          ctx.fillStyle = '#D97706';
          ctx.fillRect(vx - bw * 0.05, vy - bh * 0.08, bw * 0.10, bh * 0.16);
        }
      }
      var tPx = Math.max(4, Math.min(10, Math.round(bh * 0.10)));
      ctx.font = 'bold ' + tPx + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('BÌNH GỐM BÁT TRÀNG · SƠN MÀI · MÂY TRE ĐAN', cx, cy + bh * 0.38, safeW);
    }
  );

  // ---- TƯỜNG PHẢI (X = +5.93): NÓN LÁ & QUÀ LƯU NIỆM SÀI GÒN + LỐI SANG KHU ẨM THỰC ----
  drawMarketClippedQuad(
    ctx, cam,
    [[5.93, 3.44, 8.2], [5.93, 3.44, 1.8], [5.93, 2.82, 1.8], [5.93, 2.82, 8.2]],
    '#991B1B', '#FDE047', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.38)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('NÓN LÁ & QUÀ LƯU NIỆM SÀI GÒN', cx, cy, safeW);
    }
  );

  drawMarketClippedQuad(
    ctx, cam,
    [[5.93, 2.72, 8.1], [5.93, 2.72, 1.9], [5.93, 0.94, 1.9], [5.93, 0.94, 8.1]],
    '#4A2511', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#FFF5D6';
      ctx.fillRect(cx - bw * 0.46, cy - bh * 0.42, bw * 0.92, bh * 0.72);
      // 2 Hàng Nón Lá & Túi Cói Thêu Hoa Sen
      for (var ni = -1; ni <= 1; ni++) {
        drawPixelNonLaIcon(ctx, cx + ni * bw * 0.27, cy - bh * 0.20, bw * 0.22, bh * 0.20, '#DC2626');
        drawPixelNonLaIcon(ctx, cx + ni * bw * 0.27, cy + bh * 0.08, bw * 0.22, bh * 0.20, '#16A34A');
      }
      var tPx = Math.max(4, Math.min(10, Math.round(bh * 0.10)));
      ctx.font = 'bold ' + tPx + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('NÓN LÁ BÀI THƠ · TÚI CÓI THÊU · QUẠT LỤA', cx, cy + bh * 0.38, safeW);
    }
  );

  // Vòm thông sang KHU ẨM THỰC SẠP 1044 (X = +5.93, Z = 8.6..11.4)
  drawMarketClippedQuad(
    ctx, cam,
    [[5.93, 2.68, 11.3], [5.93, 2.68, 8.7], [5.93, 0.02, 8.7], [5.93, 0.02, 11.3]],
    '#7F1D1D', '#F4B93B', 2.6,
    function(cx, cy, bw, bh) {
      ctx.fillStyle = '#FED7AA';
      ctx.fillRect(cx - bw * 0.38, cy - bh * 0.44, bw * 0.76, bh * 0.88);
    }
  );
  drawMarketClippedQuad(
    ctx, cam,
    [[5.93, 3.40, 11.4], [5.93, 3.40, 8.6], [5.93, 2.76, 8.6], [5.93, 2.76, 11.4]],
    '#7F1D1D', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🥞 KHU ẨM THỰC 1044 →', cx, cy, safeW);
    }
  );

  // ---- TƯỜNG CUỐI (Z = 14.72): VÒM CỬA BẮC · TRÁI CÂY NHIỆT ĐỚI 1029 NGỌC HẢO ----
  drawMarketClippedQuad(
    ctx, cam,
    [[-4.4, 3.50, 14.72], [4.4, 3.50, 14.72], [4.4, 2.00, 14.72], [-4.4, 2.00, 14.72]],
    '#14532D', '#F4B93B', 2.8,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(6, Math.min(14, Math.round(bh * 0.28)));
      var p2 = Math.max(5, Math.min(11, Math.round(bh * 0.18)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.fillText('CỬA BẮC · TRÁI CÂY 1029 NGỌC HẢO', cx, cy - bh * 0.16, safeW);
      ctx.font = 'bold ' + p2 + 'px monospace';
      ctx.fillStyle = '#FFFBF1';
      ctx.fillText('XOÀI CÁT HÒA LỘC · BƯỞI DA XANH · THANH LONG · SẦU RIÊNG', cx, cy + bh * 0.20, safeW);
    }
  );
}

/* ==================== 5. HÀM ĐIỀU PHỐI MỸ THUẬT TƯỜNG 3 PHÒNG CHỢ BẾN THÀNH ==================== */
function drawMarketRoomWalls3D(ctx, cam, room, pig, t) {
  if (room === 'food_court') {
    drawMarketFoodCourtWalls3D(ctx, cam, pig, t);
  } else if (room === 'fruit_craft') {
    drawMarketFruitCraftWalls3D(ctx, cam);
  } else {
    drawMarketSouthHallWalls3D(ctx, cam);
  }
}
`;
}
