/**
 * Mỹ Thuật Tường & Hoành Phi Câu Đối 3 Phòng Ngôi Chùa Cổ Kính TPS 3D (Quyết định 245)
 * - Phòng 1 ('garden' — Vườn Chùa Thanh Tịnh):
 *   + Cổng Tam Quan mái ngói cong (Z = 0) với biển "TAM QUAN · CHÙA CỔ".
 *   + Cửa Chánh Điện cuối sân (Z = 14.72) với hoành phi "CHÁNH ĐIỆN" & bậc tam cấp.
 *   + Cổng vòm tre trúc góc phải cuối sân dẫn sang "THIỀN TRÀ · THÁP CHUÔNG".
 *   + Bích họa tường vàng đất cổ kính viền ngói đỏ & ô thông gió chữ Thọ.
 * - Phòng 2 ('main_hall' — Chánh Điện Trang Nghiêm):
 *   + Hoành phi son thếp vàng "ĐẠI HÙNG BẢO ĐIỆN" trên cao tường cuối.
 *   + Đôi câu đối đỏ chữ vàng "TÂM THANH TỊNH" / "PHƯỚC AN KHANG".
 *   + Tranh hoa sen vàng & bánh xe Pháp Luân trên hai tường bên.
 * - Phòng 3 ('bell_tea' — Tháp Chuông & Góc Thiền Trà):
 *   + Cửa sổ song gỗ nhìn ra rừng trúc xanh mướt hai bên tường.
 *   + Bức thư pháp treo tường "TÂM AN" & bức phụ "TĨNH TÂM" mực tàu giấy dó.
 * - 100% bảng chữ khóa 4 góc ctx.clip() + safeW (maxWidth), tuyệt đối không dùng ctx.roundRect().
 */
export function buildPagodaWallArtScript(): string {
  return String.raw`
/* ==================== 1. HELPER KHÓA KHUNG 4 GÓC CHỐNG TRÀN CHỮ 100% ==================== */
function drawPagodaClippedQuad(ctx, cam, pts, bgCol, borderCol, lineW, drawInner) {
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

function drawLotusEmblem2D(ctx, cx, cy, rad) {
  // Hoa sen 5 cánh vàng-hồng cách điệu
  ctx.fillStyle = '#F472B6';
  for (var i = -2; i <= 2; i++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(i * 0.34);
    ctx.beginPath();
    ctx.ellipse(0, -rad * 0.36, rad * 0.24, rad * 0.56, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.arc(cx, cy - rad * 0.08, rad * 0.22, 0, Math.PI * 2);
  ctx.fill();
}

function drawDharmaWheel2D(ctx, cx, cy, rad) {
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = Math.max(1.2, rad * 0.14);
  ctx.beginPath();
  ctx.arc(cx, cy, rad * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, rad * 0.22, 0, Math.PI * 2);
  ctx.stroke();
  for (var s = 0; s < 8; s++) {
    var a = s * Math.PI * 0.25;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * rad * 0.22, cy + Math.sin(a) * rad * 0.22);
    ctx.lineTo(cx + Math.cos(a) * rad * 0.88, cy + Math.sin(a) * rad * 0.88);
    ctx.stroke();
  }
}

/* ==================== 2. PHÒNG 1: VƯỜN CHÙA THANH TỊNH ('garden') ==================== */
function drawPagodaGardenWalls3D(ctx, cam) {
  // Viền ngói đỏ uốn lượn dọc đỉnh tường vàng đất hai bên & tường cuối
  drawPoly3D(ctx, cam, [[-5.96, 3.02, 0], [-5.96, 3.02, 14.8], [-5.65, 2.74, 14.8], [-5.65, 2.74, 0]], '#991B1B', '#5C1111', 1.4);
  drawPoly3D(ctx, cam, [[5.96, 3.02, 14.8], [5.96, 3.02, 0], [5.65, 2.74, 0], [5.65, 2.74, 14.8]], '#991B1B', '#5C1111', 1.4);
  drawPoly3D(ctx, cam, [[-6.0, 3.18, 14.74], [6.0, 3.18, 14.74], [6.0, 2.84, 14.42], [-6.0, 2.84, 14.42]], '#991B1B', '#5C1111', 1.5);

  // Ô thông gió hoa sen cổ dọc tường trái & phải
  var medZs = [2.6, 6.4, 10.4];
  for (var mi = 0; mi < medZs.length; mi++) {
    var mz = medZs[mi];
    drawPagodaClippedQuad(
      ctx, cam,
      [[-5.93, 2.25, mz - 0.65], [-5.93, 2.25, mz + 0.65], [-5.93, 1.15, mz + 0.65], [-5.93, 1.15, mz - 0.65]],
      '#9A3412', '#F59E0B', 1.8,
      function(cx, cy, bw, bh) {
        var r = Math.min(bw, bh) * 0.36;
        ctx.fillStyle = '#7C2D12';
        ctx.beginPath(); ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2); ctx.fill();
        drawLotusEmblem2D(ctx, cx, cy + r * 0.12, r * 0.85);
      }
    );
    drawPagodaClippedQuad(
      ctx, cam,
      [[5.93, 2.25, mz + 0.65], [5.93, 2.25, mz - 0.65], [5.93, 1.15, mz - 0.65], [5.93, 1.15, mz + 0.65]],
      '#9A3412', '#F59E0B', 1.8,
      function(cx, cy, bw, bh) {
        var r = Math.min(bw, bh) * 0.36;
        ctx.fillStyle = '#7C2D12';
        ctx.beginPath(); ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2); ctx.fill();
        drawDharmaWheel2D(ctx, cx, cy, r * 0.85);
      }
    );
  }

  // Biển hoành phi "CHÁNH ĐIỆN" trên cửa chính tường cuối (Z = 14.72, X = -1.9..1.9)
  drawPagodaClippedQuad(
    ctx, cam,
    [[-1.95, 2.98, 14.68], [1.95, 2.98, 14.68], [1.95, 2.34, 14.68], [-1.95, 2.34, 14.68]],
    '#7F1D1D', '#F59E0B', 2.4,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(14, Math.round(bh * 0.42)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦ CHÁNH ĐIỆN ✦', cx, cy, safeW);
    }
  );
  // Cửa gỗ son 2 cánh mở đón khách vào Chánh Điện
  drawPoly3D(ctx, cam, [[-1.55, 0.42, 14.70], [1.55, 0.42, 14.70], [1.55, 2.30, 14.70], [-1.55, 2.30, 14.70]], '#2D110A', '#F59E0B', 1.8);
  drawPoly3D(ctx, cam, [[-1.48, 0.46, 14.66], [-0.95, 0.46, 14.66], [-0.95, 2.24, 14.66], [-1.48, 2.24, 14.66]], '#8B1E1E', '#D97706', 1.4);
  drawPoly3D(ctx, cam, [[0.95, 0.46, 14.66], [1.48, 0.46, 14.66], [1.48, 2.24, 14.66], [0.95, 2.24, 14.66]], '#8B1E1E', '#D97706', 1.4);

  // Cổng vòm tre trúc góc phải cuối sân dẫn sang Tháp Chuông & Thiền Trà (X = 2.9..5.3)
  drawPoly3D(ctx, cam, [[3.05, 0.02, 14.70], [5.15, 0.02, 14.70], [5.15, 2.15, 14.70], [3.05, 2.15, 14.70]], '#1F2F1C', '#65A30D', 2.0);
  drawPagodaClippedQuad(
    ctx, cam,
    [[2.85, 2.86, 14.68], [5.35, 2.86, 14.68], [5.35, 2.22, 14.68], [2.85, 2.22, 14.68]],
    '#365314', '#FDE047', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.34)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FEF08A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔔 THIỀN TRÀ →', cx, cy, safeW);
    }
  );

  // Hoành phi mặt trong Cổng Tam Quan (Z = 0.06)
  drawPagodaClippedQuad(
    ctx, cam,
    [[1.95, 3.25, 0.06], [-1.95, 3.25, 0.06], [-1.95, 2.65, 0.06], [1.95, 2.65, 0.06]],
    '#7F1D1D', '#F59E0B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.38)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TAM QUAN · RA PHỐ', cx, cy, safeW);
    }
  );
}

/* ==================== 3. PHÒNG 2: CHÁNH ĐIỆN TRANG NGHIÊM ('main_hall') ==================== */
function drawPagodaMainHallWalls3D(ctx, cam) {
  // Hoành phi son thếp vàng "ĐẠI HÙNG BẢO ĐIỆN" trên tường cuối (Z = 14.70)
  drawPagodaClippedQuad(
    ctx, cam,
    [[-2.85, 3.56, 14.68], [2.85, 3.56, 14.68], [2.85, 2.82, 14.68], [-2.85, 2.82, 14.68]],
    '#7F1D1D', '#F59E0B', 2.6,
    function(cx, cy, bw, bh, safeW) {
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(cx - bw * 0.46, cy - bh * 0.40, bw * 0.92, bh * 0.80);
      var px = Math.max(6, Math.min(14, Math.round(bh * 0.38)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ĐẠI HÙNG BẢO ĐIỆN', cx, cy, safeW);
    }
  );

  // Đôi Câu Đối son thếp vàng 2 bên bàn thờ Phật
  drawPagodaClippedQuad(
    ctx, cam,
    [[-4.75, 2.95, 14.68], [-3.75, 2.95, 14.68], [-3.75, 0.85, 14.68], [-4.75, 0.85, 14.68]],
    '#991B1B', '#F59E0B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var words = ['TÂM', 'THANH', 'TỊNH'];
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.14)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (var i = 0; i < words.length; i++) {
        ctx.fillText(words[i], cx, cy - bh * 0.26 + i * bh * 0.26, safeW);
      }
    }
  );
  drawPagodaClippedQuad(
    ctx, cam,
    [[3.75, 2.95, 14.68], [4.75, 2.95, 14.68], [4.75, 0.85, 14.68], [3.75, 0.85, 14.68]],
    '#991B1B', '#F59E0B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var words = ['PHƯỚC', 'AN', 'KHANG'];
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.14)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (var i = 0; i < words.length; i++) {
        ctx.fillText(words[i], cx, cy - bh * 0.26 + i * bh * 0.26, safeW);
      }
    }
  );

  // Tranh Hoa Sen Vàng & Pháp Luân dọc tường trái & phải Chánh Điện
  var panelZs = [3.6, 7.6, 11.4];
  for (var pi = 0; pi < panelZs.length; pi++) {
    var pz = panelZs[pi];
    drawPagodaClippedQuad(
      ctx, cam,
      [[-5.93, 2.85, pz - 1.05], [-5.93, 2.85, pz + 1.05], [-5.93, 1.15, pz + 1.05], [-5.93, 1.15, pz - 1.05]],
      '#5C1D14', '#D97706', 2.0,
      function(cx, cy, bw, bh) {
        var r = Math.min(bw, bh) * 0.34;
        if (pi === 1) drawDharmaWheel2D(ctx, cx, cy, r);
        else drawLotusEmblem2D(ctx, cx, cy + r * 0.1, r);
      }
    );
    drawPagodaClippedQuad(
      ctx, cam,
      [[5.93, 2.85, pz + 1.05], [5.93, 2.85, pz - 1.05], [5.93, 1.15, pz - 1.05], [5.93, 1.15, pz + 1.05]],
      '#5C1D14', '#D97706', 2.0,
      function(cx, cy, bw, bh) {
        var r = Math.min(bw, bh) * 0.34;
        if (pi === 1) drawDharmaWheel2D(ctx, cx, cy, r);
        else drawLotusEmblem2D(ctx, cx, cy + r * 0.1, r);
      }
    );
  }

  // Biển lối ra Vườn Chùa trên tường cửa (Z = 0.06)
  drawPagodaClippedQuad(
    ctx, cam,
    [[1.85, 3.22, 0.06], [-1.85, 3.22, 0.06], [-1.85, 2.66, 0.06], [1.85, 2.66, 0.06]],
    '#7F1D1D', '#F59E0B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.38)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🪷 RA VƯỜN CHÙA', cx, cy, safeW);
    }
  );
}

/* ==================== 4. PHÒNG 3: THÁP CHUÔNG & THIỀN TRÀ ('bell_tea') ==================== */
function drawBambooWindowInner(ctx, cx, cy, bw, bh) {
  // Nền trời dịu ấm sau rặng trúc xanh thanh tịnh
  ctx.fillStyle = '#ECFCCB';
  ctx.fillRect(cx - bw * 0.5, cy - bh * 0.5, bw, bh * 0.58);
  ctx.fillStyle = '#BEF264';
  ctx.fillRect(cx - bw * 0.5, cy + bh * 0.08, bw, bh * 0.42);
  // 7 thân trúc xanh đứng thanh thoát + đốt trúc + tán lá
  var stalks = [-0.36, -0.22, -0.09, 0.04, 0.17, 0.30, 0.40];
  for (var i = 0; i < stalks.length; i++) {
    var sx = cx + stalks[i] * bw;
    ctx.fillStyle = i % 2 === 0 ? '#3F6212' : '#4D7C0F';
    ctx.fillRect(sx - bw * 0.018, cy - bh * 0.48, Math.max(2, bw * 0.036), bh * 0.96);
    ctx.fillStyle = '#65A30D';
    ctx.beginPath();
    ctx.ellipse(sx + bw * 0.04, cy - bh * 0.24 + (i % 3) * bh * 0.16, bw * 0.06, bh * 0.03, -0.35, 0, Math.PI * 2);
    ctx.ellipse(sx - bw * 0.04, cy - bh * 0.06 + (i % 2) * bh * 0.14, bw * 0.055, bh * 0.028, 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  // Song gỗ chia ô kiểu nhà gỗ cổ Việt Nam
  ctx.strokeStyle = '#4A2C1A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - bh * 0.5); ctx.lineTo(cx, cy + bh * 0.5);
  ctx.moveTo(cx - bw * 0.5, cy); ctx.lineTo(cx + bw * 0.5, cy);
  ctx.stroke();
}

function drawPagodaBellTeaWalls3D(ctx, cam) {
  // Cửa sổ trúc xanh mướt hai bên tường trái (X = -5.93) & tường phải (X = +5.93)
  var wZs = [3.6, 8.8];
  for (var wi = 0; wi < wZs.length; wi++) {
    var wz = wZs[wi];
    drawPagodaClippedQuad(
      ctx, cam,
      [[-5.93, 3.08, wz - 1.75], [-5.93, 3.08, wz + 1.75], [-5.93, 1.05, wz + 1.75], [-5.93, 1.05, wz - 1.75]],
      '#ECFCCB', '#5C341D', 2.4,
      function(cx, cy, bw, bh) { drawBambooWindowInner(ctx, cx, cy, bw, bh); }
    );
    drawPagodaClippedQuad(
      ctx, cam,
      [[5.93, 3.08, wz + 1.75], [5.93, 3.08, wz - 1.75], [5.93, 1.05, wz - 1.75], [5.93, 1.05, wz + 1.75]],
      '#ECFCCB', '#5C341D', 2.4,
      function(cx, cy, bw, bh) { drawBambooWindowInner(ctx, cx, cy, bw, bh); }
    );
  }

  // Bức Thư Pháp lớn "TÂM AN" trên tường cuối phía góc Thiền Trà (X = 0.6..4.4, Z = 14.70)
  drawPagodaClippedQuad(
    ctx, cam,
    [[0.65, 3.22, 14.68], [4.35, 3.22, 14.68], [4.35, 1.18, 14.68], [0.65, 1.18, 14.68]],
    '#F5EAD3', '#5C341D', 2.6,
    function(cx, cy, bw, bh, safeW) {
      // Trục cuộn gỗ trên & dưới giấy dó
      ctx.fillStyle = '#4A2C1A';
      ctx.fillRect(cx - bw * 0.5, cy - bh * 0.5, bw, bh * 0.08);
      ctx.fillRect(cx - bw * 0.5, cy + bh * 0.42, bw, bh * 0.08);
      // Cành sen thủy mặc nhẹ góc dưới
      drawLotusEmblem2D(ctx, cx - bw * 0.28, cy + bh * 0.22, Math.min(bw, bh) * 0.16);
      // Đại tự thư pháp "TÂM AN"
      var px = Math.max(8, Math.min(24, Math.round(bh * 0.28)));
      ctx.font = 'bold ' + px + 'px serif';
      ctx.fillStyle = '#1C1917';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TÂM AN', cx, cy - bh * 0.06, safeW);
      var subPx = Math.max(5, Math.min(10, Math.round(bh * 0.10)));
      ctx.font = 'bold ' + subPx + 'px monospace';
      ctx.fillStyle = '#991B1B';
      ctx.fillText('· THIỀN TRÀ THANH TỊNH ·', cx, cy + bh * 0.22, safeW);
      // Triện đỏ góc phải
      ctx.fillStyle = '#B91C1C';
      ctx.fillRect(cx + bw * 0.30, cy - bh * 0.28, Math.max(5, bw * 0.08), Math.max(5, bh * 0.12));
    }
  );

  // Bảng gỗ cổ phía sau Đại Hồng Chung (X = -4.6..-0.6, Z = 14.68)
  drawPagodaClippedQuad(
    ctx, cam,
    [[-4.55, 3.22, 14.68], [-0.55, 3.22, 14.68], [-0.55, 2.48, 14.68], [-4.55, 2.48, 14.68]],
    '#5C341D', '#F59E0B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔔 ĐẠI HỒNG CHUNG', cx, cy, safeW);
    }
  );

  // Biển lối ra Vườn Chùa trên tường cửa (Z = 0.06)
  drawPagodaClippedQuad(
    ctx, cam,
    [[1.85, 3.22, 0.06], [-1.85, 3.22, 0.06], [-1.85, 2.66, 0.06], [1.85, 2.66, 0.06]],
    '#365314', '#FDE047', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.38)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FEF08A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🪷 RA VƯỜN CHÙA', cx, cy, safeW);
    }
  );
}

/* ==================== 5. HÀM ĐIỀU PHỐI MỸ THUẬT TƯỜNG 3 PHÒNG CHÙA ==================== */
function drawPagodaWalls3D(ctx, cam, room) {
  if (room === 'main_hall') {
    drawPagodaMainHallWalls3D(ctx, cam);
  } else if (room === 'bell_tea') {
    drawPagodaBellTeaWalls3D(ctx, cam);
  } else {
    drawPagodaGardenWalls3D(ctx, cam);
  }
}
`;
}
