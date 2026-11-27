/**
 * Bộ Sưu Tập Mỹ Thuật Tường 3 Phòng Độc Bản — Adidas Originals Hội An TPS 3D (Quyết định 245)
 * - Phòng 1 ('hall' — Sảnh Tầng 1 Hội An): Tường Shoe Display Wall (Samba, Superstar, Gazelle, Predator),
 *   kệ áo thể thao & cửa vòm sang Phòng Thay Đồ (tường phải), bảng ADIDAS ORIGINALS · HỘI AN & biển LÊN LẦU 2 (tường cuối).
 * - Phòng 2 ('fitting' — Phòng Thay Đồ & Gương Toàn Thân): Gương gỗ toàn thân phản chiếu chú Heo trực tiếp,
 *   rèm nhung đỏ đô 2 bên, sào áo khoác 3 Sọc (tường trái) & cửa về Sảnh Tầng 1 (tường phải).
 * - Phòng 3 ('upper' — Lầu 2 Bộ Sưu Tập Việt Nam & Thu Ngân): Tường BST Áo 3 Sọc & Nón Lá Việt Nam (tường trái),
 *   tranh tường Hoa Sen × 3 Sọc nghệ thuật & biển XUỐNG TẦNG 1 (tường cuối), kệ hộp giày sau Quầy Thu Ngân (tường phải).
 * - 100% bảng chữ áp dụng khóa khung 4 góc ctx.clip() + safeW (maxWidth) chống tràn chữ mọi góc 360°.
 * - Tuyệt đối không dùng ctx.roundRect.
 */
export function buildAdidasWallArtScript(): string {
  return String.raw`
/* ==================== 1. HELPER KHÓA KHUNG 4 GÓC CHỐNG TRÀN CHỮ 100% ==================== */
function drawAdidasClippedQuad(ctx, cam, pts, bgCol, borderCol, lineW, drawInner) {
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

/* Helper vẽ đôi giày sneaker pixel thu nhỏ bên trong ô trưng bày */
function drawPixelSneakerIcon(ctx, x, y, w, h, bodyCol, stripeCol, soleCol) {
  // Đế giày cao su
  ctx.fillStyle = soleCol || '#D9A05B';
  ctx.fillRect(x - w * 0.44, y + h * 0.14, w * 0.88, h * 0.22);
  // Thân giày trên
  ctx.fillStyle = bodyCol || '#FFFBF1';
  ctx.fillRect(x - w * 0.40, y - h * 0.16, w * 0.72, h * 0.32);
  ctx.fillRect(x + w * 0.22, y - h * 0.04, w * 0.20, h * 0.20);
  // 3 Sọc chéo đặc trưng Adidas
  ctx.fillStyle = stripeCol || '#111827';
  for (var s = 0; s < 3; s++) {
    ctx.fillRect(x - w * 0.16 + s * w * 0.12, y - h * 0.12, w * 0.06, h * 0.26);
  }
  // Viền đen pixel sắc nét
  ctx.strokeStyle = '#2B180E';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - w * 0.44, y - h * 0.16, w * 0.88, h * 0.52);
}

/* Helper vẽ chiếc áo khoác / áo đấu 3 Sọc trên tường */
function drawPixelJerseyIcon(ctx, cx, cy, w, h, mainCol, stripeCol, accentCol) {
  // Vai & tay áo
  ctx.fillStyle = mainCol;
  ctx.fillRect(cx - w * 0.42, cy - h * 0.36, w * 0.84, h * 0.24);
  // Thân áo
  ctx.fillRect(cx - w * 0.28, cy - h * 0.36, w * 0.56, h * 0.72);
  // 3 Sọc trắng/vàng chạy dọc vai & hông
  ctx.fillStyle = stripeCol || '#FFFBF1';
  for (var s = 0; s < 3; s++) {
    ctx.fillRect(cx - w * 0.40 + s * w * 0.06, cy - h * 0.34, w * 0.03, h * 0.18);
    ctx.fillRect(cx + w * 0.22 + s * w * 0.06, cy - h * 0.34, w * 0.03, h * 0.18);
  }
  // Cổ áo & logo ngực
  ctx.fillStyle = accentCol || '#FDE047';
  ctx.fillRect(cx - w * 0.10, cy - h * 0.36, w * 0.20, h * 0.08);
  ctx.fillRect(cx + w * 0.05, cy - h * 0.14, w * 0.12, h * 0.10);
  // Viền
  ctx.strokeStyle = '#2B180E';
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - w * 0.28, cy - h * 0.36, w * 0.56, h * 0.72);
}

/* ==================== 2. PHÒNG 1 ('hall'): SẢNH TẦNG 1 HỘI AN ==================== */
function drawAdidasHallWalls3D(ctx, cam) {
  // ---- TƯỜNG TRÁI (X = -5.93): SHOE DISPLAY WALL (SAMBA, SUPERSTAR, GAZELLE, PREDATOR) ----
  drawAdidasClippedQuad(
    ctx, cam,
    [[-5.93, 3.42, 2.0], [-5.93, 3.42, 11.4], [-5.93, 2.86, 11.4], [-5.93, 2.86, 2.0]],
    '#2B180E', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(13, Math.round(bh * 0.42)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('SHOE WALL · ADIDAS ORIGINALS', cx, cy, safeW);
    }
  );

  var shoes = [
    { z1: 2.1, z2: 4.2, name: 'SAMBA OG', body: '#FFFBF1', stripe: '#111827', sole: '#B45309' },
    { z1: 4.5, z2: 6.6, name: 'SUPERSTAR', body: '#FFFFFF', stripe: '#0F172A', sole: '#E2E8F0' },
    { z1: 6.9, z2: 9.0, name: 'GAZELLE', body: '#DC2626', stripe: '#FFFBF1', sole: '#F8FAFC' },
    { z1: 9.3, z2: 11.4, name: 'PREDATOR', body: '#1E293B', stripe: '#F97316', sole: '#0F172A' }
  ];
  for (var si = 0; si < shoes.length; si++) {
    (function(sh) {
      drawAdidasClippedQuad(
        ctx, cam,
        [[-5.93, 2.74, sh.z1], [-5.93, 2.74, sh.z2], [-5.93, 1.05, sh.z2], [-5.93, 1.05, sh.z1]],
        '#3D2616', '#C89B3C', 2.0,
        function(cx, cy, bw, bh, safeW) {
          // Ánh đèn LED hắt ấm bên trong hộc tủ gỗ
          ctx.fillStyle = '#FFF5D6';
          ctx.fillRect(cx - bw * 0.44, cy - bh * 0.42, bw * 0.88, bh * 0.62);
          // Kệ gỗ đặt giày
          ctx.fillStyle = '#7C4F2B';
          ctx.fillRect(cx - bw * 0.44, cy + bh * 0.14, bw * 0.88, bh * 0.08);
          // 2 đôi giày xếp tầng
          drawPixelSneakerIcon(ctx, cx, cy - bh * 0.22, bw * 0.66, bh * 0.28, sh.body, sh.stripe, sh.sole);
          drawPixelSneakerIcon(ctx, cx, cy + bh * 0.02, bw * 0.66, bh * 0.28, sh.body, sh.stripe, sh.sole);
          // Bảng tên mẫu giày
          var tPx = Math.max(4, Math.min(10, Math.round(bh * 0.13)));
          ctx.font = 'bold ' + tPx + 'px monospace';
          ctx.fillStyle = '#FDE047';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(sh.name, cx, cy + bh * 0.34, safeW);
        }
      );
    })(shoes[si]);
  }

  // ---- TƯỜNG PHẢI (X = +5.93): SPORTSWEAR RACK + CỬA VÒM SANG PHÒNG THAY ĐỒ ----
  drawAdidasClippedQuad(
    ctx, cam,
    [[5.93, 3.30, 7.6], [5.93, 3.30, 2.1], [5.93, 1.05, 2.1], [5.93, 1.05, 7.6]],
    '#4A2C1A', '#C89B3C', 2.2,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#F3DFAC';
      ctx.fillRect(cx - bw * 0.46, cy - bh * 0.34, bw * 0.92, bh * 0.78);
      var tPx = Math.max(5, Math.min(11, Math.round(bh * 0.12)));
      ctx.font = 'bold ' + tPx + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('SPORTSWEAR · 3 SỌC', cx, cy - bh * 0.42, safeW);
      // Thanh treo ngang bằng đồng
      ctx.fillStyle = '#B45309';
      ctx.fillRect(cx - bw * 0.44, cy - bh * 0.22, bw * 0.88, Math.max(2, bh * 0.04));
      // 3 áo khoác & áo đấu 3 Sọc treo ngay ngắn
      drawPixelJerseyIcon(ctx, cx - bw * 0.28, cy + bh * 0.08, bw * 0.24, bh * 0.50, '#111827', '#FFFBF1', '#FDE047');
      drawPixelJerseyIcon(ctx, cx,            cy + bh * 0.08, bw * 0.24, bh * 0.50, '#1D4ED8', '#FFFBF1', '#93C5FD');
      drawPixelJerseyIcon(ctx, cx + bw * 0.28, cy + bh * 0.08, bw * 0.24, bh * 0.50, '#B91C1C', '#FDE047', '#FDE047');
    }
  );

  // Cửa vòm gỗ mở sang PHÒNG THAY ĐỒ (X = +5.93, Z = 8.4..11.2)
  drawAdidasClippedQuad(
    ctx, cam,
    [[5.93, 2.68, 11.1], [5.93, 2.68, 8.5], [5.93, 0.02, 8.5], [5.93, 0.02, 11.1]],
    '#1F3526', '#4A2C1A', 3.0,
    function(cx, cy, bw, bh) {
      // Ánh sáng ấm từ Phòng Thay Đồ & 2 dải rèm nhung đỏ đô vén 2 bên
      ctx.fillStyle = '#2F4A36';
      ctx.fillRect(cx - bw * 0.36, cy - bh * 0.46, bw * 0.72, bh * 0.92);
      ctx.fillStyle = '#7F1D1D';
      ctx.fillRect(cx - bw * 0.50, cy - bh * 0.50, bw * 0.18, bh);
      ctx.fillRect(cx + bw * 0.32, cy - bh * 0.50, bw * 0.18, bh);
      // Gương mờ phía trong phòng thay đồ
      ctx.fillStyle = 'rgba(224,242,254,0.45)';
      ctx.fillRect(cx - bw * 0.16, cy - bh * 0.28, bw * 0.32, bh * 0.62);
    }
  );
  // Biển chỉ lối PHÒNG THAY ĐỒ phía trên cửa
  drawAdidasClippedQuad(
    ctx, cam,
    [[5.93, 3.38, 11.2], [5.93, 3.38, 8.4], [5.93, 2.76, 8.4], [5.93, 2.76, 11.2]],
    '#2B180E', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🪞 PHÒNG THAY ĐỒ →', cx, cy, safeW);
    }
  );

  // ---- TƯỜNG CUỐI SẢNH TẦNG 1 (Z = 14.72): ADIDAS ORIGINALS · HỘI AN + BIỂN LÊN LẦU 2 ----
  drawAdidasClippedQuad(
    ctx, cam,
    [[-4.95, 3.40, 14.72], [-2.35, 3.40, 14.72], [-2.35, 2.76, 14.72], [-4.95, 2.76, 14.72]],
    '#2B180E', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.34)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🪜 LÊN LẦU 2 ↑', cx, cy, safeW);
    }
  );

  // Bảng hiệu chính ADIDAS ORIGINALS · HỘI AN bằng gỗ lim chữ vàng
  drawAdidasClippedQuad(
    ctx, cam,
    [[-1.35, 3.32, 14.72], [4.95, 3.32, 14.72], [4.95, 1.82, 14.72], [-1.35, 1.82, 14.72]],
    '#2B180E', '#F4B93B', 2.6,
    function(cx, cy, bw, bh, safeW) {
      // 3 Sọc vàng biểu tượng phía trên
      ctx.fillStyle = '#F4B93B';
      for (var k = -1; k <= 1; k++) {
        ctx.fillRect(cx + k * bw * 0.055 - bw * 0.015, cy - bh * 0.38, bw * 0.03, bh * 0.16);
      }
      var p1 = Math.max(6, Math.min(14, Math.round(bh * 0.22)));
      var p2 = Math.max(5, Math.min(11, Math.round(bh * 0.16)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FFFBF1';
      ctx.fillText('ADIDAS ORIGINALS', cx, cy + bh * 0.02, safeW);
      ctx.font = 'bold ' + p2 + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.fillText('· HỘI AN HERITAGE ·', cx, cy + bh * 0.28, safeW);
    }
  );
}

/* ==================== 3. PHÒNG 2 ('fitting'): PHÒNG THAY ĐỒ & GƯƠNG TOÀN THÂN ==================== */
function drawAdidasFittingWalls3D(ctx, cam, pig, t) {
  // ---- TƯỜNG TRÁI (X = -5.93): GIÁ TREO ÁO KHOÁC 3 SỌC & BIỂN PHÒNG THAY ĐỒ ----
  drawAdidasClippedQuad(
    ctx, cam,
    [[-5.93, 3.34, 2.2], [-5.93, 3.34, 10.6], [-5.93, 2.74, 10.6], [-5.93, 2.74, 2.2]],
    '#2B180E', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('👕 ÁO KHOÁC 3 SỌC · VIP FITTING', cx, cy, safeW);
    }
  );
  drawAdidasClippedQuad(
    ctx, cam,
    [[-5.93, 2.62, 2.4], [-5.93, 2.62, 10.4], [-5.93, 0.92, 10.4], [-5.93, 0.92, 2.4]],
    '#3B2314', '#C89B3C', 2.0,
    function(cx, cy, bw, bh) {
      ctx.fillStyle = '#243B2B';
      ctx.fillRect(cx - bw * 0.46, cy - bh * 0.44, bw * 0.92, bh * 0.88);
      ctx.fillStyle = '#D9A05B';
      ctx.fillRect(cx - bw * 0.44, cy - bh * 0.30, bw * 0.88, Math.max(2, bh * 0.04));
      drawPixelJerseyIcon(ctx, cx - bw * 0.28, cy + bh * 0.04, bw * 0.22, bh * 0.56, '#111827', '#FFFBF1', '#FDE047');
      drawPixelJerseyIcon(ctx, cx,            cy + bh * 0.04, bw * 0.22, bh * 0.56, '#14532D', '#FDE047', '#FDE047');
      drawPixelJerseyIcon(ctx, cx + bw * 0.28, cy + bh * 0.04, bw * 0.22, bh * 0.56, '#991B1B', '#FFFBF1', '#FDE047');
    }
  );

  // ---- TƯỜNG CUỐI (Z = 14.72): RÈM NHUNG ĐỎ ĐÔ 2 BÊN & GƯƠNG GỖ TOÀN THÂN PHẢN CHIẾU HEO ----
  // Rèm nhung trái
  drawAdidasClippedQuad(
    ctx, cam,
    [[-5.55, 3.45, 14.72], [-2.05, 3.45, 14.72], [-2.05, 0.05, 14.72], [-5.55, 0.05, 14.72]],
    '#7F1D1D', '#450A0A', 2.0,
    function(cx, cy, bw, bh) {
      for (var f = 0; f < 6; f++) {
        ctx.fillStyle = f % 2 === 0 ? '#991B1B' : '#6B1414';
        ctx.fillRect(cx - bw * 0.5 + f * (bw / 6), cy - bh * 0.5, bw / 6, bh);
      }
      ctx.fillStyle = '#F4B93B';
      ctx.fillRect(cx - bw * 0.5, cy + bh * 0.08, bw, Math.max(2, bh * 0.03));
    }
  );
  // Rèm nhung phải
  drawAdidasClippedQuad(
    ctx, cam,
    [[2.05, 3.45, 14.72], [5.55, 3.45, 14.72], [5.55, 0.05, 14.72], [2.05, 0.05, 14.72]],
    '#7F1D1D', '#450A0A', 2.0,
    function(cx, cy, bw, bh) {
      for (var f = 0; f < 6; f++) {
        ctx.fillStyle = f % 2 === 0 ? '#991B1B' : '#6B1414';
        ctx.fillRect(cx - bw * 0.5 + f * (bw / 6), cy - bh * 0.5, bw / 6, bh);
      }
      ctx.fillStyle = '#F4B93B';
      ctx.fillRect(cx - bw * 0.5, cy + bh * 0.08, bw, Math.max(2, bh * 0.03));
    }
  );

  // GƯƠNG TOÀN THÂN KHUNG GỖ HỘI AN (X = -1.75..+1.75, Y = 0.22..3.32) — PHẢN CHIẾU CHÚ HEO!
  drawAdidasClippedQuad(
    ctx, cam,
    [[-1.75, 3.32, 14.70], [1.75, 3.32, 14.70], [1.75, 0.22, 14.70], [-1.75, 0.22, 14.70]],
    '#CBE7F5', '#5C341D', 3.4,
    function(cx, cy, bw, bh, safeW) {
      // Nền phản chiếu phòng thay đồ mờ nhẹ trong gương
      ctx.fillStyle = '#DCEFF8';
      ctx.fillRect(cx - bw * 0.46, cy - bh * 0.46, bw * 0.92, bh * 0.62);
      ctx.fillStyle = '#B89A74';
      ctx.fillRect(cx - bw * 0.46, cy + bh * 0.16, bw * 0.92, bh * 0.30);
      // Ánh sáng lóe chéo mặt kính gương
      ctx.fillStyle = 'rgba(255,255,255,0.42)';
      ctx.beginPath();
      ctx.moveTo(cx - bw * 0.45, cy - bh * 0.35);
      ctx.lineTo(cx - bw * 0.15, cy - bh * 0.46);
      ctx.lineTo(cx + bw * 0.35, cy + bh * 0.25);
      ctx.lineTo(cx + bw * 0.05, cy + bh * 0.36);
      ctx.closePath();
      ctx.fill();

      // Hình phản chiếu chú Heo Mascot trong gương (dịch chuyển theo pig.x!)
      var rx = cx + Math.max(-0.28, Math.min(0.28, (pig ? pig.x : 0) * 0.07)) * bw;
      var ry = cy + bh * 0.20;
      var u = Math.max(1.2, Math.min(bw, bh) * 0.022);
      var bob = (pig && pig.walking) ? Math.sin((t || 0) * 10) * u : 0;
      // Bóng trong gương
      ctx.fillStyle = 'rgba(43,33,24,0.22)';
      ctx.beginPath(); ctx.ellipse(rx, ry + 2 * u, 9 * u, 3 * u, 0, 0, Math.PI * 2); ctx.fill();
      // Thân chú heo hồng
      ctx.fillStyle = '#2B2118';
      ctx.fillRect(rx - 9 * u, ry - 15 * u + bob, 18 * u, 13 * u);
      ctx.fillStyle = '#F48CA4';
      ctx.fillRect(rx - 8 * u, ry - 14 * u + bob, 16 * u, 11 * u);
      // 2 Tai vểnh
      ctx.fillStyle = '#E06784';
      ctx.fillRect(rx - 8 * u, ry - 17 * u + bob, 4 * u, 3 * u);
      ctx.fillRect(rx + 4 * u, ry - 17 * u + bob, 4 * u, 3 * u);
      // Áo khoác 3 Sọc đen khi chú Heo đã thử áo!
      if (pig && pig.wearingJacket) {
        ctx.fillStyle = '#111827';
        ctx.fillRect(rx - 8 * u, ry - 8 * u + bob, 16 * u, 6 * u);
        ctx.fillStyle = '#FFFBF1';
        ctx.fillRect(rx - 6 * u, ry - 7 * u + bob, 1.5 * u, 4 * u);
        ctx.fillRect(rx - 3.5 * u, ry - 7 * u + bob, 1.5 * u, 4 * u);
        ctx.fillRect(rx + 4.5 * u, ry - 7 * u + bob, 1.5 * u, 4 * u);
      }
      // Mắt & Mõm heo chính diện trong gương
      ctx.fillStyle = '#2B2118';
      ctx.fillRect(rx - 4 * u, ry - 12 * u + bob, 2 * u, 2.5 * u);
      ctx.fillRect(rx + 2 * u, ry - 12 * u + bob, 2 * u, 2.5 * u);
      ctx.fillStyle = '#FBC2CE';
      ctx.fillRect(rx - 3 * u, ry - 9.5 * u + bob, 6 * u, 3.5 * u);
      ctx.fillStyle = '#2B2118';
      ctx.fillRect(rx - 1.5 * u, ry - 8.5 * u + bob, 1 * u, 1.5 * u);
      ctx.fillRect(rx + 0.5 * u, ry - 8.5 * u + bob, 1 * u, 1.5 * u);
      // Chân
      ctx.fillStyle = '#E06784';
      ctx.fillRect(rx - 6 * u, ry - 2 * u, 3 * u, 3 * u);
      ctx.fillRect(rx + 3 * u, ry - 2 * u, 3 * u, 3 * u);

      // Nhãn nhỏ góc trên gương
      var tPx = Math.max(4, Math.min(9, Math.round(bh * 0.07)));
      ctx.font = 'bold ' + tPx + 'px monospace';
      ctx.fillStyle = '#2B180E';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(pig && pig.wearingJacket ? '✨ 3 SỌC CỰC CHẤT ✨' : 'GƯƠNG TOÀN THÂN', cx, cy - bh * 0.38, safeW);
    }
  );

  // ---- TƯỜNG PHẢI (X = +5.93): CỬA VỀ SẢNH TẦNG 1 ----
  drawAdidasClippedQuad(
    ctx, cam,
    [[5.93, 2.68, 11.1], [5.93, 2.68, 8.5], [5.93, 0.02, 8.5], [5.93, 0.02, 11.1]],
    '#E3B857', '#4A2C1A', 3.0,
    function(cx, cy, bw, bh) {
      ctx.fillStyle = '#F3D689';
      ctx.fillRect(cx - bw * 0.38, cy - bh * 0.44, bw * 0.76, bh * 0.88);
      ctx.fillStyle = '#7C4F2B';
      ctx.fillRect(cx - bw * 0.50, cy - bh * 0.50, bw * 0.14, bh);
      ctx.fillRect(cx + bw * 0.36, cy - bh * 0.50, bw * 0.14, bh);
    }
  );
  drawAdidasClippedQuad(
    ctx, cam,
    [[5.93, 3.38, 11.2], [5.93, 3.38, 8.4], [5.93, 2.76, 8.4], [5.93, 2.76, 11.2]],
    '#2B180E', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('← VỀ SẢNH TẦNG 1', cx, cy, safeW);
    }
  );
}

/* ==================== 4. PHÒNG 3 ('upper'): LẦU 2 BST VIỆT NAM & THU NGÂN ==================== */
function drawAdidasUpperWalls3D(ctx, cam) {
  // ---- TƯỜNG TRÁI (X = -5.93): BỘ SƯU TẬP ÁO 3 SỌC & NÓN LÁ VIỆT NAM ----
  drawAdidasClippedQuad(
    ctx, cam,
    [[-5.93, 3.40, 1.8], [-5.93, 3.40, 11.2], [-5.93, 2.82, 11.2], [-5.93, 2.82, 1.8]],
    '#991B1B', '#FDE047', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.38)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('★ BỘ SƯU TẬP VIỆT NAM · 3 SỌC ★', cx, cy, safeW);
    }
  );
  drawAdidasClippedQuad(
    ctx, cam,
    [[-5.93, 2.70, 2.0], [-5.93, 2.70, 11.0], [-5.93, 1.00, 11.0], [-5.93, 1.00, 2.0]],
    '#5C341D', '#C89B3C', 2.2,
    function(cx, cy, bw, bh) {
      ctx.fillStyle = '#FFF5D6';
      ctx.fillRect(cx - bw * 0.46, cy - bh * 0.44, bw * 0.92, bh * 0.88);
      // 3 Nón Lá Việt Nam treo hàng trên có dải lụa 3 sọc
      for (var ni = -1; ni <= 1; ni++) {
        var nx = cx + ni * bw * 0.28, ny = cy - bh * 0.22;
        ctx.fillStyle = '#E8C574'; ctx.strokeStyle = '#78350F'; ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(nx, ny - bh * 0.16);
        ctx.lineTo(nx - bw * 0.10, ny + bh * 0.06);
        ctx.lineTo(nx + bw * 0.10, ny + bh * 0.06);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(nx - bw * 0.04, ny - bh * 0.02, bw * 0.08, bh * 0.04);
      }
      // 3 Áo Đấu Bộ Sưu Tập Việt Nam hàng dưới
      drawPixelJerseyIcon(ctx, cx - bw * 0.28, cy + bh * 0.18, bw * 0.22, bh * 0.44, '#DA251D', '#FDE047', '#FDE047');
      drawPixelJerseyIcon(ctx, cx,            cy + bh * 0.18, bw * 0.22, bh * 0.44, '#FFFBF1', '#DA251D', '#F43F5E');
      drawPixelJerseyIcon(ctx, cx + bw * 0.28, cy + bh * 0.18, bw * 0.22, bh * 0.44, '#0F766E', '#FDE047', '#FFFBF1');
    }
  );

  // ---- TƯỜNG CUỐI LẦU 2 (Z = 14.72): TRANH TƯỜNG HOA SEN × 3 SỌC + BIỂN XUỐNG TẦNG 1 ----
  drawAdidasClippedQuad(
    ctx, cam,
    [[-4.95, 3.40, 14.72], [-2.35, 3.40, 14.72], [-2.35, 2.76, 14.72], [-4.95, 2.76, 14.72]],
    '#2B180E', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.34)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🪜 XUỐNG TẦNG 1 ↓', cx, cy, safeW);
    }
  );

  // Tranh Tường Nghệ Thuật HOA SEN × 3 SỌC (Lotus × 3-Stripe Mural)
  drawAdidasClippedQuad(
    ctx, cam,
    [[-1.45, 3.36, 14.72], [5.10, 3.36, 14.72], [5.10, 1.15, 14.72], [-1.45, 1.15, 14.72]],
    '#1F3A3D', '#F4B93B', 2.6,
    function(cx, cy, bw, bh, safeW) {
      // 3 Dải sọc chéo vàng-kem chạy xuyên tranh
      ctx.fillStyle = 'rgba(244,185,59,0.28)';
      for (var st = -1; st <= 1; st++) {
        ctx.beginPath();
        ctx.moveTo(cx + st * bw * 0.14 - bw * 0.18, cy + bh * 0.5);
        ctx.lineTo(cx + st * bw * 0.14 - bw * 0.10, cy + bh * 0.5);
        ctx.lineTo(cx + st * bw * 0.14 + bw * 0.18, cy - bh * 0.5);
        ctx.lineTo(cx + st * bw * 0.14 + bw * 0.10, cy - bh * 0.5);
        ctx.closePath();
        ctx.fill();
      }
      // Lá sen xanh ngọc & Đóa Hoa Sen Hồng rực rỡ ở tâm
      var r = Math.min(bw, bh) * 0.26;
      ctx.fillStyle = '#15803D';
      ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.65, r * 1.4, r * 0.35, 0, 0, Math.PI * 2); ctx.fill();
      var petals = [[-0.75, 0.1, -0.45], [0.75, 0.1, 0.45], [-0.4, -0.1, -0.22], [0.4, -0.1, 0.22], [0, -0.22, 0]];
      for (var pi = 0; pi < petals.length; pi++) {
        ctx.save();
        ctx.translate(cx + petals[pi][0] * r, cy + petals[pi][1] * r);
        ctx.rotate(petals[pi][2]);
        ctx.fillStyle = pi === 4 ? '#FB7185' : '#F43F5E';
        ctx.beginPath(); ctx.ellipse(0, 0, r * 0.38, r * 0.72, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#FDE047';
      ctx.beginPath(); ctx.arc(cx, cy + r * 0.12, r * 0.22, 0, Math.PI * 2); ctx.fill();
      // Chữ tiêu đề tranh tường
      var p1 = Math.max(5, Math.min(11, Math.round(bh * 0.12)));
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FFFBF1';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('HOA SEN × 3 SỌC · HỘI AN', cx, cy - bh * 0.36, safeW);
    }
  );

  // ---- TƯỜNG PHẢI LẦU 2 (X = +5.93): KỆ HỘP GIÀY ORIGINALS SAU QUẦY THU NGÂN ----
  drawAdidasClippedQuad(
    ctx, cam,
    [[5.93, 3.30, 10.6], [5.93, 3.30, 3.6], [5.93, 1.25, 3.6], [5.93, 1.25, 10.6]],
    '#3B2314', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(5, Math.min(11, Math.round(bh * 0.12)));
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('QUẦY THU NGÂN · SAMBA OG', cx, cy - bh * 0.38, safeW);
      // 3 tầng hộp giày xanh dương Originals & vàng Hội An
      var cols = ['#1D4ED8', '#2563EB', '#D97706', '#1E40AF'];
      for (var row = 0; row < 3; row++) {
        var ry = cy - bh * 0.18 + row * bh * 0.24;
        ctx.fillStyle = '#2B180E';
        ctx.fillRect(cx - bw * 0.45, ry + bh * 0.15, bw * 0.90, Math.max(2, bh * 0.04));
        for (var col = 0; col < 5; col++) {
          var bx = cx - bw * 0.42 + col * bw * 0.175;
          ctx.fillStyle = cols[(row + col) % cols.length];
          ctx.fillRect(bx, ry, bw * 0.145, bh * 0.14);
          ctx.fillStyle = '#FFFBF1';
          ctx.fillRect(bx + bw * 0.02, ry + bh * 0.04, bw * 0.10, bh * 0.03);
        }
      }
    }
  );
}

/* ==================== 5. HÀM ĐIỀU PHỐI MỸ THUẬT TƯỜNG 3 PHÒNG ==================== */
function drawAdidasRoomWalls3D(ctx, cam, room, pig, t) {
  if (room === 'fitting') {
    drawAdidasFittingWalls3D(ctx, cam, pig, t);
  } else if (room === 'upper') {
    drawAdidasUpperWalls3D(ctx, cam);
  } else {
    drawAdidasHallWalls3D(ctx, cam);
  }
}
`;
}
