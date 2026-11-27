/**
 * Bộ Sưu Tập Mỹ Thuật 2 Tầng Độc Bản Quán Cộng Cà Phê TPS 3D (Quyết định 242–244)
 * Bám sát 1:1 5 ảnh thực tế Cộng Cà Phê — khác hoàn toàn 100% Quán Phở:
 * - Tầng 1 (drawCafeFloor1Walls3D): Cửa sổ kính lớn rèm xanh cốm dọc tường trái ngắm tán cây xanh;
 *   Quầy Bar dọc tường phải + biển hồng-đỏ "PICK UP HERE" + "THỰC ĐƠN CÀ PHÊ";
 *   Tường cuối xi măng loang với Kệ Sách Xếp Chồng Khổng Lồ, Biển tròn "ĐI NHẸ NÓI KHẼ",
 *   Bảng "ĐỘC LẬP · TỰ DO · HẠNH PHÚC" & biển chỉ lối "LÊN LẦU 2 ↑".
 * - Tầng 2 (drawCafeFloor2Walls3D): Tường xanh rêu Cộng (#4F6335) với Kệ Gỗ Ziczac đựng Phích Nước Rạng Đông
 *   (tường trái); Dãy Cửa Sổ Song Gỗ Dọc rèm ren nhìn ra phố chiều (tường phải);
 *   Bảng "YÊU NƯỚC LÀ THI ĐUA", Khung vải Chăn Con Công & biển "XUỐNG TẦNG 1 ↓" (tường cuối).
 * - 100% bảng chữ áp dụng khóa 4 góc ctx.clip() + safeW (maxWidth) chống tràn viền mọi góc xoay 360°.
 */
export function buildCafeVnWallArtScript(): string {
  return String.raw`
/* ==================== 1. HELPER KHÓA KHUNG 4 GÓC CHỐNG TRÀN CHỮ 100% ==================== */
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
      ctx.fillStyle = '#4D7C0F';
      ctx.beginPath(); ctx.arc(fx - rad * 0.6, fy + rad * 0.4, rad * 0.65, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = (r + c) % 2 === 0 ? '#F43F5E' : '#FB7185';
      ctx.beginPath(); ctx.arc(fx, fy, rad, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FACC15';
      ctx.beginPath(); ctx.arc(fx, fy, rad * 0.38, 0, Math.PI * 2); ctx.fill();
    }
  }
}

/* ==================== 2. TẦNG 1: CỬA SỔ RÈM XANH (TRÁI) · QUẦY BAR PICK UP HERE (PHẢI) · TƯỜNG SÁCH KHỔNG LỒ (CUỐI) ==================== */
function drawCafeFloor1Walls3D(ctx, cam) {
  // ---- TƯỜNG TRÁI (X = -5.94): Dãy Cửa Sổ Kính Lớn Rèm Xanh Cốm ngắm tán cây xanh (1:1 ảnh 3!) ----
  var winStarts = [1.6, 4.7, 7.8];
  for (var wi = 0; wi < winStarts.length; wi++) {
    var zs = winStarts[wi], ze = zs + 2.75;
    drawClippedWallQuad(
      ctx, cam,
      [[-5.93, 3.25, zs], [-5.93, 3.25, ze], [-5.93, 1.05, ze], [-5.93, 1.05, zs]],
      '#93C5FD', '#4A2C1A', 2.4,
      function(cx, cy, bw, bh) {
        // Bầu trời sáng dịu + tán lá cây xanh mướt bên ngoài cửa kính Cộng
        ctx.fillStyle = '#BFDBFE'; ctx.fillRect(cx - bw*0.5, cy - bh*0.5, bw, bh*0.48);
        ctx.fillStyle = '#4D7C0F'; ctx.fillRect(cx - bw*0.5, cy - bh*0.02, bw, bh*0.52);
        ctx.fillStyle = '#65A30D';
        ctx.beginPath();
        ctx.arc(cx - bw*0.25, cy + bh*0.05, Math.min(bw, bh)*0.24, 0, Math.PI*2);
        ctx.arc(cx + bw*0.18, cy - bh*0.04, Math.min(bw, bh)*0.28, 0, Math.PI*2);
        ctx.fill();
        // Đố cửa gỗ chia ô & ánh phản chiếu kính chéo
        ctx.strokeStyle = '#5C341D'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - bh*0.5); ctx.lineTo(cx, cy + bh*0.5);
        ctx.moveTo(cx - bw*0.5, cy); ctx.lineTo(cx + bw*0.5, cy);
        ctx.stroke();
        // Rèm vải xanh cốm rủ 2 bên mép cửa sổ
        ctx.fillStyle = '#4F6335';
        ctx.fillRect(cx - bw*0.5, cy - bh*0.5, bw*0.14, bh);
        ctx.fillRect(cx + bw*0.36, cy - bh*0.5, bw*0.14, bh);
      }
    );
  }

  // ---- TƯỜNG PHẢI (X = +5.94 — Sau Quầy Bar Dài): Biển PICK UP HERE + THỰC ĐƠN CÀ PHÊ + Kệ Phin ----
  drawClippedWallQuad(
    ctx, cam,
    [[5.93, 3.15, 4.10], [5.93, 3.15, 2.75], [5.93, 1.70, 2.75], [5.93, 1.70, 4.10]],
    '#9F1239', '#4C0519', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(5, Math.min(12, Math.round(bh * 0.16)));
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FFF1F2'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('PICK', cx, cy - bh * 0.24, safeW);
      ctx.fillText('UP', cx, cy, safeW);
      ctx.fillStyle = '#FDE047';
      ctx.fillText('HERE', cx, cy + bh * 0.24, safeW);
    }
  );
  drawClippedWallQuad(
    ctx, cam,
    [[5.93, 3.18, 7.60], [5.93, 3.18, 4.55], [5.93, 1.72, 4.55], [5.93, 1.72, 7.60]],
    '#364627', '#D9B45A', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var tPx = Math.max(5, Math.min(12, Math.round(bh * 0.15)));
      ctx.font = 'bold ' + tPx + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CỘNG CÀ PHÊ · THỰC ĐƠN', cx, cy - bh * 0.30, safeW);
      var rows = [['CÀ PHÊ CỐT DỪA', '35K'], ['BẠC XỈU', '25K'], ['PHIN ĐEN ĐÁ', '20K'], ['BÁNH SỪNG BÒ', '28K']];
      var rPx = Math.max(4, Math.min(9, Math.round(bh * 0.11)));
      ctx.font = 'bold ' + rPx + 'px monospace';
      for (var ri = 0; ri < rows.length; ri++) {
        var ry = cy - bh * 0.08 + ri * bh * 0.145;
        ctx.fillStyle = '#FFFBF1'; ctx.textAlign = 'left';
        ctx.fillText(rows[ri][0], cx - safeW * 0.46, ry, safeW * 0.68);
        ctx.fillStyle = '#FACC15'; ctx.textAlign = 'right';
        ctx.fillText(rows[ri][1], cx + safeW * 0.46, ry, safeW * 0.28);
      }
    }
  );
  // Kệ ca men sắt xanh lính & phin cà phê sau quầy Bar (Z = 8.0..10.6)
  drawClippedWallQuad(
    ctx, cam,
    [[5.93, 3.12, 10.60], [5.93, 3.12, 8.05], [5.93, 1.78, 8.05], [5.93, 1.78, 10.60]],
    '#4A2C1A', '#2B180E', 2.0,
    function(cx, cy, bw, bh) {
      ctx.fillStyle = '#2B180E'; ctx.fillRect(cx - bw*0.46, cy + bh*0.02, bw*0.92, Math.max(2, bh*0.07));
      for (var mi = 0; mi < 5; mi++) {
        ctx.fillStyle = '#6B7B59';
        ctx.fillRect(cx - bw*0.42 + mi * bw*0.18, cy - bh*0.30, bw*0.12, bh*0.28);
      }
      for (var ji = 0; ji < 4; ji++) {
        ctx.fillStyle = ji % 2 === 0 ? '#94A3B8' : '#D97706';
        ctx.fillRect(cx - bw*0.40 + ji * bw*0.22, cy + bh*0.14, bw*0.14, bh*0.28);
      }
    }
  );

  // ---- TƯỜNG CUỐI TẦNG 1 (Z = 14.72): Tường Sách Xếp Chồng Khổng Lồ + ĐI NHẸ NÓI KHẼ + LÊN LẦU 2 (1:1 ảnh 5!) ----
  // 1. Kệ Sách Xếp Chồng Khổng Lồ (X = -1.8..+5.1, Y = 2.38..3.35)
  drawClippedWallQuad(
    ctx, cam,
    [[-1.85, 3.35, 14.72], [5.15, 3.35, 14.72], [5.15, 2.38, 14.72], [-1.85, 2.38, 14.72]],
    '#7D8276', '#3B2314', 1.6,
    function(cx, cy, bw, bh) {
      // Thanh kệ gỗ đỡ đáy
      ctx.fillStyle = '#4A2C1A'; ctx.fillRect(cx - bw*0.5, cy + bh*0.36, bw, bh*0.14);
      // 14 chồng sách cổ xếp cao thấp khác nhau màu giấy cũ nâu-kem-be!
      var stackCols = ['#D6C1A3', '#C4A882', '#E5D5BC', '#B5966D', '#DFCBB0'];
      var nStacks = 14, sw = (bw * 0.94) / nStacks;
      for (var si = 0; si < nStacks; si++) {
        var sx = cx - bw*0.47 + si * sw;
        var layers = 5 + ((si * 3) % 4);
        var lh = (bh * 0.78) / 8;
        for (var li = 0; li < layers; li++) {
          ctx.fillStyle = stackCols[(si + li) % stackCols.length];
          ctx.strokeStyle = '#5C4632'; ctx.lineWidth = 0.6;
          var by = cy + bh*0.36 - (li + 1) * lh;
          ctx.fillRect(sx + 0.5, by, sw - 1.5, lh - 0.5);
          ctx.strokeRect(sx + 0.5, by, sw - 1.5, lh - 0.5);
        }
      }
    }
  );

  // 2. Biển Gỗ Tròn "ĐI NHẸ NÓI KHẼ" (1:1 ảnh 5! X = -0.9, Y = 1.65)
  drawClippedWallQuad(
    ctx, cam,
    [[-1.55, 2.08, 14.72], [-0.35, 2.08, 14.72], [-0.35, 1.18, 14.72], [-1.55, 1.18, 14.72]],
    'rgba(0,0,0,0)', null, 0,
    function(cx, cy, bw, bh, safeW) {
      var r = Math.min(bw, bh) * 0.44;
      ctx.fillStyle = '#8F6A42'; ctx.strokeStyle = '#4A2C1A'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      var px = Math.max(4, Math.min(9, Math.round(r * 0.34)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FFFBF1'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ĐI NHẸ', cx, cy - r * 0.22, safeW * 0.75);
      ctx.fillText('NÓI KHẼ', cx, cy + r * 0.22, safeW * 0.75);
    }
  );

  // 3. Khung Ảnh Gia Đình Xưa (X = 0.6..2.0, Y = 1.18..2.22)
  drawClippedWallQuad(
    ctx, cam,
    [[0.45, 2.22, 14.72], [1.85, 2.22, 14.72], [1.85, 1.15, 14.72], [0.45, 1.15, 14.72]],
    '#E5D8C0', '#4A2C1A', 2.2,
    function(cx, cy, bw, bh) {
      for (var p = -1; p <= 1; p++) {
        ctx.fillStyle = '#44403C';
        ctx.beginPath(); ctx.arc(cx + p * bw * 0.22, cy - bh * 0.08, Math.min(bw, bh) * 0.10, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(cx + p * bw * 0.22 - bw * 0.09, cy + bh * 0.04, bw * 0.18, bh * 0.34);
      }
    }
  );

  // 4. Bảng Gỗ Văn Hóa "VIỆT NAM · ĐỘC LẬP · TỰ DO · HẠNH PHÚC" (X = 2.4..5.1, Y = 1.20..2.22)
  drawClippedWallQuad(
    ctx, cam,
    [[2.35, 2.22, 14.72], [5.15, 2.22, 14.72], [5.15, 1.20, 14.72], [2.35, 1.20, 14.72]],
    '#5C341D', '#2B180E', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(5, Math.min(11, Math.round(bh * 0.18)));
      var p2 = Math.max(5, Math.min(12, Math.round(bh * 0.21)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace'; ctx.fillStyle = '#FDE047';
      ctx.fillText('★ VIỆT NAM ★', cx, cy - bh * 0.24, safeW);
      ctx.font = 'bold ' + p2 + 'px monospace'; ctx.fillStyle = '#FFFBF1';
      ctx.fillText('ĐỘC LẬP · TỰ DO', cx, cy + bh * 0.02, safeW);
      ctx.fillStyle = '#FDE047';
      ctx.fillText('HẠNH PHÚC', cx, cy + bh * 0.28, safeW);
    }
  );

  // 5. Biển Chỉ Lối "LÊN LẦU 2 ↑" trên đầu cầu thang gỗ (X = -4.9..-2.4, Y = 2.75..3.35)
  drawClippedWallQuad(
    ctx, cam,
    [[-4.95, 3.38, 14.72], [-2.35, 3.38, 14.72], [-2.35, 2.76, 14.72], [-4.95, 2.76, 14.72]],
    '#3B4D2B', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.34)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🪜 LÊN LẦU 2 ↑', cx, cy, safeW);
    }
  );
}

/* ==================== 3. TẦNG 2: KỆ ZICZAC PHÍCH RẠNG ĐÔNG (TRÁI) · SONG GỖ DỌC (PHẢI) · CHĂN CON CÔNG (CUỐI) ==================== */
function drawCafeFloor2Walls3D(ctx, cam) {
  // ---- TƯỜNG TRÁI (X = -5.94 — Tường Xanh Rêu Cộng): Bảng CỘNG + Kệ Gỗ Ziczac Phích Nước Rạng Đông (1:1 ảnh 4!) ----
  drawClippedWallQuad(
    ctx, cam,
    [[-5.93, 2.95, 0.85], [-5.93, 2.95, 2.75], [-5.93, 1.80, 2.75], [-5.93, 1.80, 0.85]],
    '#6B4226', '#2B180E', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(5, Math.min(11, Math.round(bh * 0.20)));
      var p2 = Math.max(4, Math.min(9, Math.round(bh * 0.16)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace'; ctx.fillStyle = '#FDE047';
      ctx.fillText('CỘNG CÀ PHÊ', cx, cy - bh * 0.18, safeW);
      ctx.font = 'bold ' + p2 + 'px monospace'; ctx.fillStyle = '#FFFBF1';
      ctx.fillText('ĐỘC LẬP · TỰ DO', cx, cy + bh * 0.08, safeW);
      ctx.fillStyle = '#FDE047';
      ctx.fillText('HẠNH PHÚC', cx, cy + bh * 0.30, safeW);
    }
  );

  // Kệ Gỗ Ziczac Nghệ Thuật đựng Phích Nước Rạng Đông, sách & đèn bão (Z = 3.2..7.5, Y = 1.65..3.15 — 1:1 ảnh 4!)
  drawClippedWallQuad(
    ctx, cam,
    [[-5.93, 3.15, 3.20], [-5.93, 3.15, 7.50], [-5.93, 1.62, 7.50], [-5.93, 1.62, 3.20]],
    'rgba(43,24,14,0.18)', '#4A2C1A', 1.8,
    function(cx, cy, bw, bh) {
      // Các thanh gỗ ngang-dọc Ziczac bất đối xứng
      ctx.fillStyle = '#5C341D';
      ctx.fillRect(cx - bw*0.46, cy - bh*0.18, bw*0.62, bh*0.06);
      ctx.fillRect(cx - bw*0.12, cy + bh*0.12, bw*0.58, bh*0.06);
      ctx.fillRect(cx - bw*0.46, cy + bh*0.40, bw*0.92, bh*0.07);
      ctx.fillRect(cx - bw*0.24, cy - bh*0.44, bw*0.04, bh*0.86);
      ctx.fillRect(cx + bw*0.18, cy - bh*0.44, bw*0.04, bh*0.86);
      // Phích Nước Rạng Đông hoa đỏ (trái trên!)
      ctx.fillStyle = '#DC2626'; ctx.fillRect(cx - bw*0.40, cy - bh*0.42, bw*0.11, bh*0.24);
      ctx.fillStyle = '#FACC15'; ctx.fillRect(cx - bw*0.38, cy - bh*0.34, bw*0.07, bh*0.08);
      // Sách cổ xếp nghiêng & Ca men sắt & Đèn bão
      var bCols = ['#D97706', '#FFFBF1', '#B91C1C', '#65A30D'];
      for (var bi = 0; bi < 4; bi++) {
        ctx.fillStyle = bCols[bi];
        ctx.fillRect(cx + bw*0.24 + bi * bw*0.055, cy - bh*0.08, bw*0.045, bh*0.20);
      }
      ctx.fillStyle = '#6B7B59'; ctx.fillRect(cx - bw*0.16, cy + bh*0.18, bw*0.09, bh*0.22);
      ctx.fillStyle = '#F59E0B'; ctx.beginPath(); ctx.arc(cx + bw*0.34, cy + bh*0.28, Math.min(bw, bh)*0.08, 0, Math.PI*2); ctx.fill();
    }
  );

  // Lá Cờ Đỏ Sao Vàng trang trọng góc tường trái Tầng 2 (Z = 8.1..9.9)
  drawClippedWallQuad(
    ctx, cam,
    [[-5.93, 2.92, 8.10], [-5.93, 2.92, 9.90], [-5.93, 1.88, 9.90], [-5.93, 1.88, 8.10]],
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

  // ---- TƯỜNG PHẢI (X = +5.94): Dãy Cửa Sổ Song Gỗ Dọc rèm ren nhìn ra phố chiều (1:1 ảnh 4!) ----
  drawClippedWallQuad(
    ctx, cam,
    [[5.93, 3.30, 10.60], [5.93, 3.30, 1.80], [5.93, 1.05, 1.80], [5.93, 1.05, 10.60]],
    '#1E293B', '#4A2C1A', 2.4,
    function(cx, cy, bw, bh) {
      // Ánh phố chiều tà lung linh vàng-xanh dịu ngoài song gỗ
      ctx.fillStyle = '#334155'; ctx.fillRect(cx - bw*0.5, cy - bh*0.5, bw, bh*0.55);
      ctx.fillStyle = '#1E293B'; ctx.fillRect(cx - bw*0.5, cy + bh*0.05, bw, bh*0.45);
      var lights = [[-0.35, -0.05, '#FDE047'], [-0.15, 0.12, '#FB923C'], [0.08, -0.08, '#FDE047'], [0.28, 0.08, '#38BDF8'], [0.38, -0.02, '#FACC15']];
      for (var li = 0; li < lights.length; li++) {
        ctx.fillStyle = lights[li][2];
        ctx.beginPath(); ctx.arc(cx + lights[li][0]*bw, cy + lights[li][1]*bh, Math.max(2, bh*0.06), 0, Math.PI*2); ctx.fill();
      }
      // 12 song gỗ dọc đều tăm tắp kiểu nhà cổ Hà Nội/Sài Gòn
      ctx.fillStyle = '#3B2314';
      for (var bi = 0; bi < 12; bi++) {
        ctx.fillRect(cx - bw*0.46 + bi * (bw*0.92 / 11), cy - bh*0.5, Math.max(1.5, bw*0.018), bh);
      }
      // Rèm ren mỏng kem rủ phía trên
      ctx.fillStyle = 'rgba(255,248,225,0.36)';
      ctx.fillRect(cx - bw*0.5, cy - bh*0.5, bw, bh*0.24);
    }
  );

  // ---- TƯỜNG CUỐI TẦNG 2 (Z = 14.72): YÊU NƯỚC LÀ THI ĐUA · CHĂN CON CÔNG · XUỐNG TẦNG 1 ↓ ----
  drawClippedWallQuad(
    ctx, cam,
    [[-4.95, 3.38, 14.72], [-2.35, 3.38, 14.72], [-2.35, 2.76, 14.72], [-4.95, 2.76, 14.72]],
    '#3B4D2B', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.34)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🪜 XUỐNG TẦNG 1 ↓', cx, cy, safeW);
    }
  );
  drawClippedWallQuad(
    ctx, cam,
    [[-1.65, 2.95, 14.72], [1.85, 2.95, 14.72], [1.85, 1.75, 14.72], [-1.65, 1.75, 14.72]],
    '#5C341D', '#2B180E', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.17)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFBF1'; ctx.fillText('YÊU NƯỚC LÀ THI ĐUA', cx, cy - bh * 0.15, safeW);
      ctx.fillStyle = '#FDE047'; ctx.fillText('THI ĐUA LÀ YÊU NƯỚC', cx, cy + bh * 0.17, safeW);
    }
  );
  drawClippedWallQuad(
    ctx, cam,
    [[2.45, 2.95, 14.72], [5.15, 2.95, 14.72], [5.15, 1.65, 14.72], [2.45, 1.65, 14.72]],
    '#B91C1C', '#4A2C1A', 2.4,
    function(cx, cy, bw, bh) {
      drawPeacockFloralPattern(ctx, cx, cy, bw, bh);
    }
  );
}

/* ==================== 4. HÀM ĐIỀU PHỐI MỸ THUẬT TƯỜNG THEO TẦNG (1 HOẶC 2) ==================== */
function drawCafeVnCultureWalls3D(ctx, cam, floor) {
  if (floor === 2) {
    drawCafeFloor2Walls3D(ctx, cam);
  } else {
    drawCafeFloor1Walls3D(ctx, cam);
  }
}
`;
}
