/**
 * Bộ Sưu Tập Mỹ Thuật Pixel Art Văn Hóa Việt Nam & Cộng Cà Phê Bao Cấp Trên 3 Bức Tường (Quyết định 242)
 * Lấy cảm hứng 1:1 từ 6 ảnh mẫu Cộng Cà Phê & không gian cà phê Việt Nam ấm cúng (tông vàng ấm, xanh cốm, gỗ nâu, Chăn Con Công):
 * - Tường Trái (X = -5.94): Bảng Thực Đơn Cà Phê xanh bộ đội chữ vàng, Bảng Gỗ Khẩu Hiệu "ĐỘC LẬP · TỰ DO · HẠNH PHÚC",
 *   và Tường Khung Ảnh Sài Gòn & Việt Nam Xưa (10 khung ảnh đa kích cỡ).
 * - Tường Phải (X = +5.94): Bảng Gỗ "YÊU NƯỚC LÀ THI ĐUA", Gương Khung Gỗ Cổ & Kệ Sách Bao Cấp,
 *   và Góc Tán Dù + Gối Tựa Chăn Con Công Đỏ/Xanh.
 * - Tường Đối Diện Quầy Bar (Z = 14.72): Dải Rèm Vải Xanh Cốm rủ mềm, Biển Gỗ "CÀ PHÊ VIỆT NAM · 1975",
 *   Lá Cờ Đỏ Sao Vàng & Kệ Ca Men Sắt / Phin Cà Phê.
 * - 100% bảng chữ áp dụng khóa 4 góc ctx.clip() + safeW (maxWidth) chống tràn viền ở mọi góc xoay 360°.
 */
export function buildCafeVnWallArtScript(): string {
  return String.raw`
/* ==================== 1. HELPER KHÓA KHUNG 4 GÓC CHỐNG TRÀN CHỮ 100% (QĐ 242) ==================== */
function drawClippedWallQuad(ctx, cam, pts, bgCol, borderCol, lineW, drawInner) {
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

/* ==================== 2. HỌA TIẾT CHĂN CON CÔNG (HOA ĐỎ-XANH-VÀNG BAO CẤP) ==================== */
function drawPeacockFloralPattern(ctx, cx, cy, w, h) {
  ctx.fillStyle = '#B91C1C';
  ctx.fillRect(cx - w * 0.5, cy - h * 0.5, w, h);
  var cols = 4, rows = 3;
  var cw = w / cols, ch = h / rows;
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var fx = cx - w * 0.5 + (c + 0.5) * cw;
      var fy = cy - h * 0.5 + (r + 0.5) * ch;
      var rad = Math.max(1.5, Math.min(cw, ch) * 0.34);
      // Lá xanh cốm
      ctx.fillStyle = '#4D7C0F';
      ctx.beginPath(); ctx.arc(fx - rad * 0.6, fy + rad * 0.4, rad * 0.65, 0, Math.PI * 2); ctx.fill();
      // Hoa mẫu đơn hồng-đỏ rực rỡ
      ctx.fillStyle = (r + c) % 2 === 0 ? '#F43F5E' : '#FB7185';
      ctx.beginPath(); ctx.arc(fx, fy, rad, 0, Math.PI * 2); ctx.fill();
      // Nhụy vàng chanh
      ctx.fillStyle = '#FACC15';
      ctx.beginPath(); ctx.arc(fx, fy, rad * 0.38, 0, Math.PI * 2); ctx.fill();
    }
  }
}

/* ==================== 3. TƯỜNG TRÁI: THỰC ĐƠN, ĐỘC LẬP TỰ DO HẠNH PHÚC & KHUNG ẢNH XƯA ==================== */
function drawCafeLeftWallArt(ctx, cam) {
  // 1. Bảng Thực Đơn Cà Phê xanh bộ đội chữ vàng (ngay lối vào Z=0.55..1.65)
  drawClippedWallQuad(
    ctx, cam,
    [[-5.93, 2.75, 0.55], [-5.93, 2.75, 1.65], [-5.93, 1.45, 1.65], [-5.93, 1.45, 0.55]],
    '#364627', '#4A2C1A', 2.4,
    function(cx, cy, bw, bh, safeW) {
      ctx.strokeStyle = '#D9B45A'; ctx.lineWidth = 1;
      ctx.strokeRect(cx - bw * 0.44, cy - bh * 0.44, bw * 0.88, bh * 0.88);
      var tPx = Math.max(5, Math.min(11, Math.round(bh * 0.115)));
      ctx.font = 'bold ' + tPx + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('THỰC ĐƠN CÀ PHÊ', cx, cy - bh * 0.28, safeW);
      ctx.strokeStyle = '#D9B45A';
      ctx.beginPath(); ctx.moveTo(cx - safeW * 0.45, cy - bh * 0.18); ctx.lineTo(cx + safeW * 0.45, cy - bh * 0.18); ctx.stroke();
      var rows = [['CỐT DỪA', '35K'], ['BẠC XỈU', '25K'], ['PHIN ĐEN', '20K'], ['SỪNG BÒ', '28K']];
      var rPx = Math.max(4, Math.min(9, Math.round(bh * 0.092)));
      ctx.font = 'bold ' + rPx + 'px monospace';
      for (var i = 0; i < rows.length; i++) {
        var ry = cy - bh * 0.05 + i * bh * 0.135;
        ctx.fillStyle = '#FFFBF1'; ctx.textAlign = 'left';
        ctx.fillText(rows[i][0], cx - safeW * 0.45, ry, safeW * 0.62);
        ctx.fillStyle = '#FACC15'; ctx.textAlign = 'right';
        ctx.fillText(rows[i][1], cx + safeW * 0.45, ry, safeW * 0.32);
      }
    }
  );

  // 2. Bảng Gỗ Khẩu Hiệu Văn Hóa Việt Nam: "VIỆT NAM - ĐỘC LẬP · TỰ DO · HẠNH PHÚC" (Z=2.1..4.2)
  drawClippedWallQuad(
    ctx, cam,
    [[-5.93, 2.78, 2.10], [-5.93, 2.78, 4.20], [-5.93, 1.58, 4.20], [-5.93, 1.58, 2.10]],
    '#6B4226', '#3B2314', 2.4,
    function(cx, cy, bw, bh, safeW) {
      // Vệt vân ván gỗ ngang mộc mạc (giống ảnh mẫu 1 & 3)
      ctx.strokeStyle = 'rgba(43,24,14,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - bw * 0.5, cy - bh * 0.15); ctx.lineTo(cx + bw * 0.5, cy - bh * 0.15);
      ctx.moveTo(cx - bw * 0.5, cy + bh * 0.18); ctx.lineTo(cx + bw * 0.5, cy + bh * 0.18);
      ctx.stroke();
      // Ngôi sao vàng nhỏ trên đầu bảng
      ctx.fillStyle = '#FACC15';
      ctx.beginPath(); ctx.arc(cx, cy - bh * 0.33, Math.max(2, bh * 0.06), 0, Math.PI * 2); ctx.fill();
      var p1 = Math.max(5, Math.min(11, Math.round(bh * 0.14)));
      var p2 = Math.max(5, Math.min(13, Math.round(bh * 0.17)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.fillText('VIỆT NAM', cx, cy - bh * 0.16, safeW);
      ctx.font = 'bold ' + p2 + 'px monospace';
      ctx.fillStyle = '#FFF8E7';
      ctx.fillText('ĐỘC LẬP · TỰ DO', cx, cy + bh * 0.06, safeW);
      ctx.fillStyle = '#FDE047';
      ctx.fillText('HẠNH PHÚC', cx, cy + bh * 0.28, safeW);
    }
  );

  // 3. Tường Khung Ảnh Sài Gòn & Việt Nam Xưa (10 khung ảnh đa kích cỡ giống ảnh mẫu 1!)
  var frames = [
    [4.7, 2.25, 5.55, 2.95, '#D6C7B2', '#4A2C1A', 'sepia'],
    [5.7, 2.35, 6.45, 2.92, '#E2D5C1', '#2B180E', 'bw'],
    [6.6, 2.20, 7.55, 2.98, '#D9C5A0', '#7C4F2B', 'street'],
    [7.7, 2.30, 8.55, 2.90, '#CBD5C0', '#3B2314', 'bw'],
    [8.7, 2.25, 9.55, 2.95, '#E8D8B9', '#5C341D', 'sepia'],
    [4.75, 1.35, 5.75, 2.10, '#E2D5C1', '#2B180E', 'street'],
    [5.9, 1.40, 6.75, 2.18, '#D6C7B2', '#5C341D', 'sepia'],
    [6.9, 1.35, 7.80, 2.08, '#F5E6D3', '#4A2C1A', 'bw'],
    [7.95, 1.42, 8.80, 2.15, '#D9C5A0', '#7C4F2B', 'street'],
    [8.95, 1.38, 9.65, 2.12, '#E8D8B9', '#2B180E', 'sepia']
  ];
  for (var fi = 0; fi < frames.length; fi++) {
    var fr = frames[fi];
    (function(f) {
      drawClippedWallQuad(
        ctx, cam,
        [[-5.93, f[3], f[0]], [-5.93, f[3], f[2]], [-5.93, f[1], f[2]], [-5.93, f[1], f[0]]],
        f[4], f[5], 1.8,
        function(cx, cy, bw, bh) {
          if (f[6] === 'street') {
            ctx.fillStyle = '#94A3B8'; ctx.fillRect(cx - bw*0.42, cy - bh*0.42, bw*0.84, bh*0.45);
            ctx.fillStyle = '#57534E'; ctx.fillRect(cx - bw*0.42, cy + bh*0.03, bw*0.84, bh*0.39);
            ctx.fillStyle = '#FFFBF1'; ctx.fillRect(cx - bw*0.18, cy - bh*0.18, bw*0.36, bh*0.26);
          } else if (f[6] === 'sepia') {
            ctx.fillStyle = '#8C6239'; ctx.beginPath(); ctx.arc(cx, cy - bh*0.1, Math.min(bw, bh)*0.18, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#5C3A21'; ctx.fillRect(cx - bw*0.22, cy + bh*0.08, bw*0.44, bh*0.32);
          } else {
            ctx.fillStyle = '#334155'; ctx.fillRect(cx - bw*0.35, cy - bh*0.25, bw*0.28, bh*0.55);
            ctx.fillStyle = '#475569'; ctx.fillRect(cx + bw*0.05, cy - bh*0.32, bw*0.30, bh*0.62);
          }
        }
      );
    })(fr);
  }
}

/* ==================== 4. TƯỜNG PHẢI: BẢNG CỔ ĐỘNG, GƯƠNG CỔ, KỆ SÁCH & GÓC CHĂN CON CÔNG ==================== */
function drawCafeRightWallArt(ctx, cam) {
  // 1. Bảng Gỗ Cổ Động "YÊU NƯỚC LÀ THI ĐUA · THI ĐUA LÀ YÊU NƯỚC" (1:1 ảnh mẫu 6!)
  drawClippedWallQuad(
    ctx, cam,
    [[5.93, 2.75, 3.00], [5.93, 2.75, 1.15], [5.93, 1.68, 1.15], [5.93, 1.68, 3.00]],
    '#5C341D', '#2B180E', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.16)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#F5EAD3'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('YÊU NƯỚC LÀ THI ĐUA', cx, cy - bh * 0.14, safeW);
      ctx.fillStyle = '#FDE047';
      ctx.fillText('THI ĐUA LÀ YÊU NƯỚC', cx, cy + bh * 0.16, safeW);
    }
  );

  // 2. Gương Khung Gỗ Cổ & Kệ Sách Bao Cấp (Z=3.5..6.1)
  drawClippedWallQuad(
    ctx, cam,
    [[5.93, 2.82, 4.75], [5.93, 2.82, 3.60], [5.93, 1.50, 3.60], [5.93, 1.50, 4.75]],
    '#C7B28E', '#5C341D', 2.4,
    function(cx, cy, bw, bh) {
      // Ánh phản chiếu chéo mềm trên gương cổ
      ctx.fillStyle = 'rgba(255,248,220,0.45)';
      ctx.beginPath(); ctx.moveTo(cx - bw*0.35, cy - bh*0.45); ctx.lineTo(cx + bw*0.05, cy - bh*0.45);
      ctx.lineTo(cx - bw*0.25, cy + bh*0.45); ctx.lineTo(cx - bw*0.45, cy + bh*0.45); ctx.closePath(); ctx.fill();
    }
  );
  // Kệ sách bao cấp 2 tầng kế gương (Z=5.0..6.3)
  drawClippedWallQuad(
    ctx, cam,
    [[5.93, 2.75, 6.30], [5.93, 2.75, 5.05], [5.93, 1.55, 5.05], [5.93, 1.55, 6.30]],
    '#4A2C1A', '#2B180E', 2.0,
    function(cx, cy, bw, bh) {
      var bookCols = ['#B91C1C', '#4D7C0F', '#D97706', '#1D4ED8', '#7C2D12', '#3F6212'];
      for (var row = 0; row < 2; row++) {
        var by = cy - bh * 0.34 + row * bh * 0.44;
        ctx.fillStyle = '#2B180E'; ctx.fillRect(cx - bw*0.44, by + bh*0.28, bw*0.88, Math.max(2, bh*0.06));
        for (var bi = 0; bi < 6; bi++) {
          ctx.fillStyle = bookCols[(bi + row * 2) % bookCols.length];
          ctx.fillRect(cx - bw*0.40 + bi * bw*0.135, by, bw*0.105, bh*0.27);
        }
      }
    }
  );

  // 3. Khung Vải Chăn Con Công & Gối Tựa Đỏ/Xanh Góc Sofa (Z=6.8..9.6)
  drawClippedWallQuad(
    ctx, cam,
    [[5.93, 2.78, 9.45], [5.93, 2.78, 7.05], [5.93, 1.55, 7.05], [5.93, 1.55, 9.45]],
    '#B91C1C', '#4A2C1A', 2.4,
    function(cx, cy, bw, bh) {
      drawPeacockFloralPattern(ctx, cx, cy, bw, bh);
    }
  );
}

/* ==================== 5. TƯỜNG QUẦY BAR ĐỐI DIỆN: RÈM XANH CỐM, BIỂN CÀ PHÊ VIỆT NAM & CỜ ĐỎ SAO VÀNG ==================== */
function drawCafeBackBarWallArt(ctx, cam) {
  // 1. Dải Rèm Vải Xanh Cốm / Xanh Bộ Đội rủ dọc phía trên quầy Bar (1:1 ảnh mẫu 2!)
  var drapes = [-5.4, -4.1, -2.8, 2.8, 4.1, 5.4];
  for (var di = 0; di < drapes.length; di++) {
    var dx = drapes[di];
    var col = di % 2 === 0 ? '#658044' : '#7D9B56';
    drawPoly3D(ctx, cam, [[dx - 0.55, 2.68, 14.70], [dx + 0.55, 2.68, 14.70], [dx + 0.55, 3.82, 14.70], [dx - 0.55, 3.82, 14.70]], col, '#3F5229', 1.2);
  }

  // 2. Biển Gỗ Lớn "CÀ PHÊ VIỆT NAM · 1975" trung tâm trên quầy Bar (0% tràn chữ)
  drawClippedWallQuad(
    ctx, cam,
    [[-2.35, 3.45, 14.72], [2.35, 3.45, 14.72], [2.35, 2.55, 14.72], [-2.35, 2.55, 14.72]],
    '#3B4D2B', '#F4B93B', 2.4,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(6, Math.min(14, Math.round(bh * 0.30)));
      var p2 = Math.max(4, Math.min(9, Math.round(bh * 0.17)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.fillText('CÀ PHÊ VIỆT NAM', cx, cy - bh * 0.14, safeW);
      ctx.font = 'bold ' + p2 + 'px monospace';
      ctx.fillStyle = '#FFFBF1';
      ctx.fillText('★ ĐỘC LẬP · TỰ DO · HẠNH PHÚC ★', cx, cy + bh * 0.22, safeW);
    }
  );

  // 3. Lá Cờ Đỏ Sao Vàng trang trọng bên trái quầy Bar (X=-4.6..-3.0, Y=1.55..2.45)
  drawClippedWallQuad(
    ctx, cam,
    [[-4.75, 2.45, 14.72], [-3.15, 2.45, 14.72], [-3.15, 1.55, 14.72], [-4.75, 1.55, 14.72]],
    '#DA251D', '#7F1D1D', 1.6,
    function(cx, cy, bw, bh) {
      ctx.fillStyle = '#FFFF00';
      var rOut = Math.min(bw, bh) * 0.30, rIn = rOut * 0.42;
      ctx.beginPath();
      for (var si = 0; si < 10; si++) {
        var r = si % 2 === 0 ? rOut : rIn;
        var ang = -Math.PI / 2 + si * Math.PI / 5;
        var sx = cx + Math.cos(ang) * r, sy = cy + Math.sin(ang) * r;
        if (si === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.closePath(); ctx.fill();
    }
  );

  // 4. Kệ Trưng Bày Ca Men Sắt Xanh Lính & Hũ Hạt Cà Phê bên phải quầy Bar (X=3.1..4.9)
  drawClippedWallQuad(
    ctx, cam,
    [[3.15, 2.45, 14.72], [4.95, 2.45, 14.72], [4.95, 1.55, 14.72], [3.15, 1.55, 14.72]],
    '#4A2C1A', '#2B180E', 1.8,
    function(cx, cy, bw, bh) {
      ctx.fillStyle = '#2B180E'; ctx.fillRect(cx - bw*0.46, cy + bh*0.02, bw*0.92, Math.max(2, bh*0.07));
      // 4 Ca men sắt xanh lính hàng trên
      for (var mi = 0; mi < 4; mi++) {
        ctx.fillStyle = '#6B7B59';
        ctx.fillRect(cx - bw*0.40 + mi * bw*0.22, cy - bh*0.32, bw*0.14, bh*0.30);
      }
      // 3 Hũ cà phê rang xay & phin inox hàng dưới
      for (var ji = 0; ji < 3; ji++) {
        ctx.fillStyle = ji === 1 ? '#D97706' : '#94A3B8';
        ctx.fillRect(cx - bw*0.36 + ji * bw*0.28, cy + bh*0.12, bw*0.18, bh*0.30);
      }
    }
  );
}

/* ==================== 6. HÀM TỔNG VẼ TOÀN BỘ MỸ THUẬT 3 TƯỜNG QUÁN CÀ PHÊ (QĐ 242) ==================== */
function drawCafeVnCultureWalls3D(ctx, cam) {
  // Diềm chỉ xanh cốm cổ điển chạy dọc đầu tường & len gỗ 3 bức tường
  var friezes = [
    [[-5.95, 3.48, 0.2], [-5.95, 3.48, 14.6], [-5.95, 3.58, 14.6], [-5.95, 3.58, 0.2]],
    [[5.95, 3.48, 14.6], [5.95, 3.48, 0.2], [5.95, 3.58, 0.2], [5.95, 3.58, 14.6]],
    [[-5.95, 3.48, 14.74], [5.95, 3.48, 14.74], [5.95, 3.58, 14.74], [-5.95, 3.58, 14.74]],
    [[-5.95, 0.96, 0.2], [-5.95, 0.96, 14.6], [-5.95, 1.04, 14.6], [-5.95, 1.04, 0.2]],
    [[5.95, 0.96, 14.6], [5.95, 0.96, 0.2], [5.95, 1.04, 0.2], [5.95, 1.04, 14.6]]
  ];
  for (var i = 0; i < friezes.length; i++) {
    drawPoly3D(ctx, cam, friezes[i], '#4A5D36', '#D9B45A', 1);
  }
  drawCafeLeftWallArt(ctx, cam);
  drawCafeRightWallArt(ctx, cam);
  drawCafeBackBarWallArt(ctx, cam);
}
`;
}
