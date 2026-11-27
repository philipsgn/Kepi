/**
 * Bộ Sưu Tập Mỹ Thuật 3 Phòng Riêng Biệt Nhà Thờ Đức Bà Sài Gòn TPS 3D (Quyết định 245)
 * - 100% bảng chữ & kính màu trên tường khóa 4 góc ctx.clip() + safeW (maxWidth) chống tràn mọi góc xoay 360°.
 * - Tuyệt đối không dùng ctx.roundRect(...) để tương thích hoàn hảo mọi WebView iOS/Android/Web.
 * - 3 Phòng độc lập:
 *   1. 'nave'      (Thánh Đường Chính): Cửa kính màu Stained-Glass + Hoa Hồng Rose Window hai bên, vòm cung thánh.
 *   2. 'sanctuary' (Cung Thánh): 3 ô kính màu Lancet rực rỡ sau Tượng Đức Mẹ Hòa Bình + hoành phi trang nghiêm.
 *   3. 'belfry'    (Gác Đàn Ống & Tháp Chuông): Tường gạch đỏ Marseille, cửa chớp vòm ngắm trời Sài Gòn & bảng đồng cổ.
 */
export function buildCathedralWallArtScript(): string {
  return String.raw`
/* ==================== 1. HELPER KHÓA KHUNG 4 GÓC CHỐNG TRÀN CHỮ 100% ==================== */
function drawCathedralClippedQuad(ctx, cam, pts, bgCol, borderCol, lineW, drawInner) {
  drawPoly3D(ctx, cam, pts, bgCol, borderCol, lineW || 2);
  var p0 = projectPoint3D(cam, pts[0][0], pts[0][1], pts[0][2]);
  var p1 = projectPoint3D(cam, pts[1][0], pts[1][1], pts[1][2]);
  var p2 = projectPoint3D(cam, pts[2][0], pts[2][1], pts[2][2]);
  var p3 = projectPoint3D(cam, pts[3][0], pts[3][1], pts[3][2]);
  if (!p0 || !p1 || !p2 || !p3) return;
  if (p0.cz < 0.45 || p1.cz < 0.45 || p2.cz < 0.45 || p3.cz < 0.45) return;
  var bw = Math.hypot(p1.sx - p0.sx, p1.sy - p0.sy);
  var bh = Math.hypot(p3.sx - p0.sx, p3.sy - p0.sy);
  if (bw < 12 || bh < 12) return;
  var cx = (p0.sx + p1.sx + p2.sx + p3.sx) * 0.25;
  var cy = (p0.sy + p1.sy + p2.sy + p3.sy) * 0.25;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p0.sx, p0.sy);
  ctx.lineTo(p1.sx, p1.sy);
  ctx.lineTo(p2.sx, p2.sy);
  ctx.lineTo(p3.sx, p3.sy);
  ctx.closePath();
  ctx.clip();
  if (drawInner) drawInner(cx, cy, bw, bh, Math.max(8, bw * 0.84));
  ctx.restore();
}

/* ==================== 2. HỌA TIẾT KÍNH MÀU STAINED-GLASS & ROSE WINDOW ==================== */
function drawStainedGlassWindow(ctx, cx, cy, bw, bh, palette, t) {
  var shimmer = 0.88 + Math.sin((t || 0) * 1.8) * 0.12;
  var left = cx - bw * 0.46;
  var top = cy - bh * 0.46;
  var w = bw * 0.92;
  var h = bh * 0.92;

  // Khung vòm Gothic đá tối bao ngoài
  ctx.fillStyle = '#2B2118';
  ctx.fillRect(left, top, w, h);

  // Nền vòm kính màu rực rỡ (hình vòm nhọn phía trên + thân chữ nhật)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(left + w * 0.08, top + h * 0.95);
  ctx.lineTo(left + w * 0.08, top + h * 0.32);
  ctx.quadraticCurveTo(left + w * 0.10, top + h * 0.06, cx, top + h * 0.03);
  ctx.quadraticCurveTo(left + w * 0.90, top + h * 0.06, left + w * 0.92, top + h * 0.32);
  ctx.lineTo(left + w * 0.92, top + h * 0.95);
  ctx.closePath();
  ctx.clip();

  var cols = palette || ['#1D4ED8', '#B91C1C', '#F59E0B', '#047857', '#7C3AED'];
  var rows = 5;
  var segs = 3;
  var cw = w / segs;
  var rh = h / rows;
  ctx.globalAlpha = shimmer;
  for (var r = 0; r < rows; r++) {
    for (var s = 0; s < segs; s++) {
      ctx.fillStyle = cols[(r * 2 + s) % cols.length];
      ctx.fillRect(left + s * cw, top + r * rh, cw + 0.5, rh + 0.5);
    }
  }
  // Đĩa kính vàng trung tâm rực sáng
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.arc(cx, top + h * 0.28, Math.min(w, h) * 0.17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(cx, top + h * 0.28, Math.min(w, h) * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Nan chì chia ô Gothic
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#1E1B18';
  ctx.lineWidth = Math.max(1, bw * 0.03);
  for (var li = 1; li < segs; li++) {
    ctx.beginPath();
    ctx.moveTo(left + li * cw, top);
    ctx.lineTo(left + li * cw, top + h);
    ctx.stroke();
  }
  for (var ri = 1; ri < rows; ri++) {
    ctx.beginPath();
    ctx.moveTo(left, top + ri * rh);
    ctx.lineTo(left + w, top + ri * rh);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRoseWindow(ctx, cx, cy, bw, bh, t) {
  var r = Math.min(bw, bh) * 0.44;
  var glow = 0.86 + Math.sin((t || 0) * 2.1) * 0.14;
  ctx.save();
  ctx.fillStyle = '#2B2118';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  ctx.globalAlpha = glow;
  var petals = 8;
  var pCols = ['#2563EB', '#DC2626', '#F59E0B', '#10B981'];
  for (var i = 0; i < petals; i++) {
    var a0 = (i / petals) * Math.PI * 2;
    var a1 = ((i + 1) / petals) * Math.PI * 2;
    ctx.fillStyle = pCols[i % pCols.length];
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r * 0.86, a0, a1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1E1B18';
    ctx.lineWidth = Math.max(1, r * 0.07);
    ctx.stroke();
  }
  ctx.fillStyle = '#FDE047';
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.34, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2B2118';
  ctx.stroke();
  ctx.fillStyle = '#FFFBEB';
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/* ==================== 3. PHÒNG 1: THÁNH ĐƯỜNG CHÍNH ('nave') ==================== */
function drawCathedralNaveWalls3D(ctx, cam, t) {
  // Đai chân tường gạch đỏ Marseille dọc tường trái & phải (Y = 0..1.05)
  drawPoly3D(ctx, cam, [[-5.95, 0, 0], [-5.95, 0, 14.8], [-5.95, 1.05, 14.8], [-5.95, 1.05, 0]], '#8F3E2E', '#5A251B', 1);
  drawPoly3D(ctx, cam, [[5.95, 0, 14.8], [5.95, 0, 0], [5.95, 1.05, 0], [5.95, 1.05, 14.8]], '#8F3E2E', '#5A251B', 1);

  // TƯỜNG TRÁI (X = -5.93): 3 Cửa kính màu Stained-Glass vòm nhọn + Rose Window trung tâm + Biển di sản
  var zBays = [2.2, 6.2, 10.2];
  for (var i = 0; i < zBays.length; i++) {
    var zs = zBays[i], ze = zs + 2.3;
    drawCathedralClippedQuad(
      ctx, cam,
      [[-5.93, 3.45, zs], [-5.93, 3.45, ze], [-5.93, 1.32, ze], [-5.93, 1.32, zs]],
      '#1E293B', '#5C341D', 2.2,
      function(cx, cy, bw, bh) {
        drawStainedGlassWindow(ctx, cx, cy, bw, bh, ['#1D4ED8', '#B91C1C', '#F59E0B', '#059669', '#6D28D9'], t);
      }
    );
  }
  // Rose Window lớn giữa tường trái (Z = 4.65..6.05)
  drawCathedralClippedQuad(
    ctx, cam,
    [[-5.92, 3.35, 4.65], [-5.92, 3.35, 6.05], [-5.92, 1.95, 6.05], [-5.92, 1.95, 4.65]],
    'rgba(0,0,0,0)', null, 0,
    function(cx, cy, bw, bh) { drawRoseWindow(ctx, cx, cy, bw, bh, t); }
  );
  // Bảng di sản Nhà Thờ Đức Bà Sài Gòn 1880 (tường trái, khóa ctx.clip + safeW)
  drawCathedralClippedQuad(
    ctx, cam,
    [[-5.92, 1.00, 3.2], [-5.92, 1.00, 6.2], [-5.92, 0.42, 6.2], [-5.92, 0.42, 3.2]],
    '#4A2518', '#D4AF37', 1.8,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.34)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('NHÀ THỜ ĐỨC BÀ SÀI GÒN · 1880', cx, cy, safeW);
    }
  );

  // TƯỜNG PHẢI (X = +5.93): 3 Cửa kính màu Stained-Glass + Rose Window + Biển Chặng Đàng Thánh Giá
  for (var j = 0; j < zBays.length; j++) {
    var rzs = zBays[j], rze = rzs + 2.3;
    drawCathedralClippedQuad(
      ctx, cam,
      [[5.93, 3.45, rze], [5.93, 3.45, rzs], [5.93, 1.32, rzs], [5.93, 1.32, rze]],
      '#1E293B', '#5C341D', 2.2,
      function(cx, cy, bw, bh) {
        drawStainedGlassWindow(ctx, cx, cy, bw, bh, ['#B91C1C', '#2563EB', '#D97706', '#047857', '#9333EA'], t + 0.7);
      }
    );
  }
  drawCathedralClippedQuad(
    ctx, cam,
    [[5.92, 3.35, 6.05], [5.92, 3.35, 4.65], [5.92, 1.95, 4.65], [5.92, 1.95, 6.05]],
    'rgba(0,0,0,0)', null, 0,
    function(cx, cy, bw, bh) { drawRoseWindow(ctx, cx, cy, bw, bh, t + 1.1); }
  );
  drawCathedralClippedQuad(
    ctx, cam,
    [[5.92, 1.00, 6.2], [5.92, 1.00, 3.2], [5.92, 0.42, 3.2], [5.92, 0.42, 6.2]],
    '#4A2518', '#D4AF37', 1.8,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.34)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FFFBF1'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('✝ CHẶNG ĐÀNG THÁNH GIÁ ✝', cx, cy, safeW);
    }
  );

  // TƯỜNG CUỐI (Z = 14.72): Vòm Cổng Lớn vào Cung Thánh (giữa) + Biển Lên Tháp Chuông (trái) + Biển Vương Cung (phải)
  // Vòm cổng Cung Thánh sáng ấm áp (X = -1.75..+1.75, Y = 0..3.15)
  drawPoly3D(ctx, cam, [[-1.95, 0, 14.72], [1.95, 0, 14.72], [1.95, 3.25, 14.72], [-1.95, 3.25, 14.72]], '#5C341D', '#D4AF37', 2.4);
  drawPoly3D(ctx, cam, [[-1.62, 0, 14.70], [1.62, 0, 14.70], [1.62, 2.85, 14.70], [-1.62, 2.85, 14.70]], '#FDE68A', '#B45309', 1.5);
  drawPoly3D(ctx, cam, [[-1.35, 0, 14.68], [1.35, 0, 14.68], [1.35, 2.55, 14.68], [-1.35, 2.55, 14.68]], 'rgba(255,251,235,0.88)', null, 0);
  // Biển Cung Thánh trên vòm giữa
  drawCathedralClippedQuad(
    ctx, cam,
    [[-1.85, 3.68, 14.71], [1.85, 3.68, 14.71], [1.85, 3.18, 14.71], [-1.85, 3.18, 14.71]],
    '#7F1D1D', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🕯️ CUNG THÁNH ↑', cx, cy, safeW);
    }
  );
  // Biển Lên Tháp Chuông góc sau trái (trên cầu thang xoắn)
  drawCathedralClippedQuad(
    ctx, cam,
    [[-5.25, 3.45, 14.71], [-2.35, 3.45, 14.71], [-2.35, 2.82, 14.71], [-5.25, 2.82, 14.71]],
    '#4A2518', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.34)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🔔 LÊN THÁP CHUÔNG ↑', cx, cy, safeW);
    }
  );
  // Bảng di sản Vương Cung Thánh Đường góc sau phải
  drawCathedralClippedQuad(
    ctx, cam,
    [[2.35, 2.95, 14.71], [5.35, 2.95, 14.71], [5.35, 1.72, 14.71], [2.35, 1.72, 14.71]],
    '#5C341D', '#D4AF37', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(5, Math.min(11, Math.round(bh * 0.18)));
      var p2 = Math.max(4, Math.min(10, Math.round(bh * 0.16)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace'; ctx.fillStyle = '#FDE047';
      ctx.fillText('✝ VƯƠNG CUNG THÁNH ĐƯỜNG ✝', cx, cy - bh * 0.22, safeW);
      ctx.font = 'bold ' + p2 + 'px monospace'; ctx.fillStyle = '#FFFBF1';
      ctx.fillText('ĐỨC BÀ VÔ NHIỄM NGUYÊN TỘI', cx, cy + bh * 0.04, safeW);
      ctx.fillStyle = '#FCD34D';
      ctx.fillText('SÀI GÒN · 1877 – 1880', cx, cy + bh * 0.28, safeW);
    }
  );
}

/* ==================== 4. PHÒNG 2: CUNG THÁNH & BÀN THỜ ĐÁ HOA CƯƠNG ('sanctuary') ==================== */
function drawCathedralSanctuaryWalls3D(ctx, cam, t, candleGlow) {
  // 3 Ô Kính Màu Lancet Rực Rỡ Phía Sau Tượng Đức Mẹ Hòa Bình (Tường cuối Z = 14.72)
  var lancets = [[-3.85, -1.75], [-1.15, 1.15], [1.75, 3.85]];
  for (var i = 0; i < lancets.length; i++) {
    var x0 = lancets[i][0], x1 = lancets[i][1];
    var pal = i === 1
      ? ['#38BDF8', '#FDE047', '#FFFFFF', '#2563EB', '#F59E0B']
      : ['#1D4ED8', '#B91C1C', '#F59E0B', '#059669', '#7C3AED'];
    drawCathedralClippedQuad(
      ctx, cam,
      [[x0, 3.55, 14.72], [x1, 3.55, 14.72], [x1, 1.15, 14.72], [x0, 1.15, 14.72]],
      '#1E293B', '#D4AF37', 2.4,
      function(cx, cy, bw, bh) {
        drawStainedGlassWindow(ctx, cx, cy, bw, bh, pal, t + i * 0.5);
      }
    );
  }

  // Hoành phi vàng son trên cao tường cuối: ĐỨC MẸ HÒA BÌNH
  drawCathedralClippedQuad(
    ctx, cam,
    [[-3.6, 3.80, 14.70], [3.6, 3.80, 14.70], [3.6, 3.36, 14.70], [-3.6, 3.36, 14.70]],
    '#7F1D1D', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.42)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('✝ ĐỨC MẸ HÒA BÌNH · CẦU CHO CHÚNG CON ✝', cx, cy, safeW);
    }
  );

  // TƯỜNG TRÁI (X = -5.93): Hoa hồng kính màu + Biển Bình An
  drawCathedralClippedQuad(
    ctx, cam,
    [[-5.93, 3.35, 5.2], [-5.93, 3.35, 8.2], [-5.93, 1.65, 8.2], [-5.93, 1.65, 5.2]],
    'rgba(0,0,0,0)', null, 0,
    function(cx, cy, bw, bh) { drawRoseWindow(ctx, cx, cy, bw, bh, t); }
  );
  drawCathedralClippedQuad(
    ctx, cam,
    [[-5.93, 1.48, 3.0], [-5.93, 1.48, 9.8], [-5.93, 0.85, 9.8], [-5.93, 0.85, 3.0]],
    '#5C341D', '#D4AF37', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.34)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FEF08A'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🕯️ THẮP NẾN CẦU BÌNH AN & HẠNH PHÚC', cx, cy, safeW);
    }
  );

  // TƯỜNG PHẢI (X = +5.93): Hoa hồng kính màu + Biển Cung Thánh
  drawCathedralClippedQuad(
    ctx, cam,
    [[5.93, 3.35, 8.2], [5.93, 3.35, 5.2], [5.93, 1.65, 5.2], [5.93, 1.65, 8.2]],
    'rgba(0,0,0,0)', null, 0,
    function(cx, cy, bw, bh) { drawRoseWindow(ctx, cx, cy, bw, bh, t + 0.9); }
  );
  drawCathedralClippedQuad(
    ctx, cam,
    [[5.93, 1.48, 9.8], [5.93, 1.48, 3.0], [5.93, 0.85, 3.0], [5.93, 0.85, 9.8]],
    '#5C341D', '#D4AF37', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.34)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FFFBF1'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CUNG THÁNH · BÀN THỜ ĐÁ HOA CƯƠNG', cx, cy, safeW);
    }
  );

  // TƯỜNG TRƯỚC (Z = 0.04): Vòm quay lại Thánh Đường Chính
  drawPoly3D(ctx, cam, [[-1.65, 0, 0.04], [1.65, 0, 0.04], [1.65, 2.75, 0.04], [-1.65, 2.75, 0.04]], '#3B2314', '#D4AF37', 2.2);
  drawCathedralClippedQuad(
    ctx, cam,
    [[-1.85, 3.45, 0.06], [1.85, 3.45, 0.06], [1.85, 2.90, 0.06], [-1.85, 2.90, 0.06]],
    '#7F1D1D', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('⛪ ← QUAY LẠI THÁNH ĐƯỜNG', cx, cy, safeW);
    }
  );
  if (candleGlow > 0.05) {
    // Ánh hào quang vàng hắt nhẹ lên tường hậu Cung Thánh khi người chơi thắp nến
    drawPoly3D(ctx, cam, [[-4.8, 0.4, 14.65], [4.8, 0.4, 14.65], [4.8, 3.6, 14.65], [-4.8, 3.6, 14.65]], 'rgba(253,224,71,' + (candleGlow * 0.14).toFixed(2) + ')', null, 0);
  }
}

/* ==================== 5. PHÒNG 3: GÁC ĐÀN ỐNG PIPE ORGAN & THÁP CHUÔNG ('belfry') ==================== */
function drawCathedralBelfryWalls3D(ctx, cam, t) {
  // Đường mạch gạch đỏ Marseille trên tường trái & phải
  for (var y = 0.6; y < 3.6; y += 0.6) {
    drawPoly3D(ctx, cam, [[-5.94, y, 0], [-5.94, y, 14.8], [-5.94, y + 0.04, 14.8], [-5.94, y + 0.04, 0]], '#5A241A', null, 0);
    drawPoly3D(ctx, cam, [[5.94, y, 14.8], [5.94, y, 0], [5.94, y + 0.04, 0], [5.94, y + 0.04, 14.8]], '#5A241A', null, 0);
  }

  // TƯỜNG TRÁI (X = -5.93): 2 Cửa Chớp Vòm Tháp Chuông ngắm trời vàng Sài Gòn + Bảng Di Sản
  var lBays = [2.4, 7.6];
  for (var i = 0; i < lBays.length; i++) {
    var zs = lBays[i], ze = zs + 2.6;
    drawCathedralClippedQuad(
      ctx, cam,
      [[-5.92, 3.35, zs], [-5.92, 3.35, ze], [-5.92, 1.35, ze], [-5.92, 1.35, zs]],
      '#FDBA74', '#4A2518', 2.4,
      function(cx, cy, bw, bh) {
        // Trời chiều Sài Gòn vàng cam ấm + 6 nan chớp gỗ cổ
        ctx.fillStyle = '#FEF08A'; ctx.fillRect(cx - bw * 0.5, cy - bh * 0.5, bw, bh * 0.45);
        ctx.fillStyle = '#FB923C'; ctx.fillRect(cx - bw * 0.5, cy - bh * 0.05, bw, bh * 0.55);
        ctx.fillStyle = '#4A2518';
        for (var sl = 0; sl < 6; sl++) {
          ctx.fillRect(cx - bw * 0.46, cy - bh * 0.42 + sl * bh * 0.15, bw * 0.92, Math.max(2, bh * 0.06));
        }
      }
    );
  }
  drawCathedralClippedQuad(
    ctx, cam,
    [[-5.92, 1.15, 2.6], [-5.92, 1.15, 7.4], [-5.92, 0.52, 7.4], [-5.92, 0.52, 2.6]],
    '#3E2212', '#F4B93B', 1.8,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.34)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🔔 THÁP CHUÔNG 1880 · 6 QUẢ CHUÔNG ĐỒNG', cx, cy, safeW);
    }
  );

  // TƯỜNG PHẢI (X = +5.93): 2 Cửa Chớp Vòm Tháp Chuông + Bảng Gác Đàn Ống
  for (var j = 0; j < lBays.length; j++) {
    var rzs = lBays[j], rze = rzs + 2.6;
    drawCathedralClippedQuad(
      ctx, cam,
      [[5.92, 3.35, rze], [5.92, 3.35, rzs], [5.92, 1.35, rzs], [5.92, 1.35, rze]],
      '#FDBA74', '#4A2518', 2.4,
      function(cx, cy, bw, bh) {
        ctx.fillStyle = '#FEF08A'; ctx.fillRect(cx - bw * 0.5, cy - bh * 0.5, bw, bh * 0.45);
        ctx.fillStyle = '#FB923C'; ctx.fillRect(cx - bw * 0.5, cy - bh * 0.05, bw, bh * 0.55);
        ctx.fillStyle = '#4A2518';
        for (var sl = 0; sl < 6; sl++) {
          ctx.fillRect(cx - bw * 0.46, cy - bh * 0.42 + sl * bh * 0.15, bw * 0.92, Math.max(2, bh * 0.06));
        }
      }
    );
  }
  drawCathedralClippedQuad(
    ctx, cam,
    [[5.92, 1.15, 7.4], [5.92, 1.15, 2.6], [5.92, 0.52, 2.6], [5.92, 0.52, 7.4]],
    '#3E2212', '#F4B93B', 1.8,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.34)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FFFBF1'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🎵 GÁC ĐÀN ỐNG PIPE ORGAN CỔ ĐIỂN', cx, cy, safeW);
    }
  );

  // TƯỜNG CUỐI (Z = 14.72): Biển Đàn Ống Pipe Organ phía trên đàn & Biển Xuống Thánh Đường bên trái
  drawCathedralClippedQuad(
    ctx, cam,
    [[-1.85, 3.72, 14.71], [3.65, 3.72, 14.71], [3.65, 3.22, 14.71], [-1.85, 3.22, 14.71]],
    '#3E2212', '#D4AF37', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🎵 ĐẠI PHONG CẦM · PIPE ORGAN 1880', cx, cy, safeW);
    }
  );
  drawCathedralClippedQuad(
    ctx, cam,
    [[-5.35, 3.45, 14.71], [-2.35, 3.45, 14.71], [-2.35, 2.82, 14.71], [-5.35, 2.82, 14.71]],
    '#4A2518', '#F4B93B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.34)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('🪜 XUỐNG THÁNH ĐƯỜNG ↓', cx, cy, safeW);
    }
  );
}

/* ==================== 6. HÀM ĐIỀU PHỐI MỸ THUẬT TƯỜNG THEO PHÒNG ==================== */
function drawCathedralWalls3D(ctx, cam, room, t, candleGlow) {
  if (room === 'sanctuary') {
    drawCathedralSanctuaryWalls3D(ctx, cam, t, candleGlow || 0);
  } else if (room === 'belfry') {
    drawCathedralBelfryWalls3D(ctx, cam, t);
  } else {
    drawCathedralNaveWalls3D(ctx, cam, t);
  }
}
`;
}
