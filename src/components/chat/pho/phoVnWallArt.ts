/**
 * Bộ Sưu Tập Mỹ Thuật Pixel Art Văn Hóa Việt Nam Trên 3 Bức Tường Quán Phở (Quyết định 240–241)
 * Thiết kế điệu nghệ lấy cảm hứng từ 2 bộ moodboard Văn hóa Việt Nam:
 * - Diềm hoa văn chữ Triện & viền chỉ cổ truyền chạy suốt 3 bức tường (Trái, Phải, Đối Diện Bếp).
 * - Tường Trái (X = -5.94): Bảng Thực Đơn Phở Đỏ Son Viền Gỗ Gụ Chữ Vàng Vintage 90s (0% tràn viền),
 *   Tranh Hoa Sen Hồng nhiều lớp cánh, Tranh Xe Xích Lô Đỏ-Vàng Sài Gòn, Bộ Nón Lá dây xanh + Đàn Nguyệt & Sáo Trúc.
 * - Tường Phải (X = +5.94): Tranh Áo Dài Trắng thêu Hoa Sen & Tem Bưu Chính, Tranh Cờ Đỏ Sao Vàng
 *   + Nón Lá + Cành Hoa Mai Vàng, Kệ Gỗ trưng bày Bình Gốm Bát Tràng men xanh + Chum Sành + Hộp Sơn Mài Đỏ.
 * - Tường Đối Diện Sau Bếp (Z = 14.72): 2 Câu Đối Đỏ Chữ Vàng hai bên bảng PHỞ 1990, Bích họa Quang Gánh
 *   Phở xưa, Tranh Saigon Skyline (Nhà Thờ Đức Bà, Bitexco) & Đồng Hồ Quả Lắc Vintage 90s đung đưa 60fps.
 */
export function buildPhoVnWallArtScript(): string {
  return String.raw`
/* ==================== 1. HELPER CHIẾU MỸ THUẬT TƯỜNG 3D CÓ CO GIÃN PHỐI CẢNH ==================== */
function wallArtAnchor(cam, wx, wy, wz, wallAxis) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz < 0.5 || pr.cz > 22) return null;
  var dx = cam.pos.x - wx, dz = cam.pos.z - wz;
  var d2 = Math.hypot(dx, dz) || 1;
  var cosA = wallAxis === 'x' ? Math.abs(dx) / d2 : Math.abs(dz) / d2;
  if (cosA < 0.16) return null; // Góc quá hẹp sát tường -> ẩn chi tiết bên trong để không bị bẹp
  return {
    sx: Math.round(pr.sx),
    sy: Math.round(pr.sy),
    u: Math.max(0.35, Math.min(2.6, pr.scale / 42)),
    fx: Math.max(0.26, cosA)
  };
}

function drawWallFriezeBorders3D(ctx, cam) {
  // Diềm chỉ hoa văn cổ truyền chạy dọc đầu tường (Y=3.48..3.58) & trên ốp gỗ chân tường (Y=0.95..1.03) cả 3 tường!
  var walls = [
    [[-5.95, 3.48, 0.2], [-5.95, 3.48, 14.6], [-5.95, 3.58, 14.6], [-5.95, 3.58, 0.2]],
    [[5.95, 3.48, 14.6], [5.95, 3.48, 0.2], [5.95, 3.58, 0.2], [5.95, 3.58, 14.6]],
    [[-5.95, 3.48, 14.74], [5.95, 3.48, 14.74], [5.95, 3.58, 14.74], [-5.95, 3.58, 14.74]],
    [[-5.95, 0.96, 0.2], [-5.95, 0.96, 14.6], [-5.95, 1.04, 14.6], [-5.95, 1.04, 0.2]],
    [[5.95, 0.96, 14.6], [5.95, 0.96, 0.2], [5.95, 1.04, 0.2], [5.95, 1.04, 14.6]]
  ];
  for (var i = 0; i < walls.length; i++) {
    drawPoly3D(ctx, cam, walls[i], '#991B1B', '#F4B93B', 1);
  }
}

/* ==================== 2. TÁC PHẨM TƯỜNG TRÁI (BẢNG THỰC ĐƠN PHỞ 90S, HOA SEN, XÍCH LÔ, NÓN LÁ & ĐÀN NGUYỆT) ==================== */
function drawPhoMenuBoardArt(ctx, cam) {
  // Bảng Thực Đơn Đỏ Son Viền Gỗ Gụ Chữ Vàng Vintage 90s treo dọc cân hàng với tranh Hoa Sen (Y=1.45..2.75, Z=0.50..1.62)
  drawPoly3D(ctx, cam, [[-5.93,1.45,0.50],[-5.93,1.45,1.62],[-5.93,2.75,1.62],[-5.93,2.75,0.50]], '#8B1A1A', '#4A2C1A', 2.4);
  drawPoly3D(ctx, cam, [[-5.92,1.52,0.57],[-5.92,1.52,1.55],[-5.92,2.68,1.55],[-5.92,2.68,0.57]], '#991B1B', '#F4B93B', 1.1);
  // Chiếu đúng 4 góc mặt trong để clip 100% chống tràn chữ ở mọi góc xoay 360° & khoảng cách
  var pTL = projectPoint3D(cam, -5.91, 2.66, 0.59);
  var pTR = projectPoint3D(cam, -5.91, 2.66, 1.53);
  var pBR = projectPoint3D(cam, -5.91, 1.54, 1.53);
  var pBL = projectPoint3D(cam, -5.91, 1.54, 0.59);
  if (!pTL || !pTR || !pBR || !pBL) return;
  if (pTL.cz < 0.5 || pTR.cz < 0.5 || pBR.cz < 0.5 || pBL.cz < 0.5) return;
  var bw = Math.hypot(pTR.sx - pTL.sx, pTR.sy - pTL.sy);
  var bh = Math.hypot(pBL.sx - pTL.sx, pBL.sy - pTL.sy);
  if (bw < 16 || bh < 22) return;
  var cx = (pTL.sx + pTR.sx + pBR.sx + pBL.sx) * 0.25;
  var cy = (pTL.sy + pTR.sy + pBR.sy + pBL.sy) * 0.25;
  var safeW = Math.max(10, bw * 0.82);

  ctx.save();
  // Khóa vùng vẽ tuyệt đối bên trong viền vàng của bảng
  ctx.beginPath();
  ctx.moveTo(pTL.sx, pTL.sy); ctx.lineTo(pTR.sx, pTR.sy);
  ctx.lineTo(pBR.sx, pBR.sy); ctx.lineTo(pBL.sx, pBL.sy);
  ctx.closePath(); ctx.clip();

  // Họa tiết Bát Phở mini bốc khói trên đầu bảng
  var bowlR = Math.max(2.5, Math.min(bw * 0.16, bh * 0.08));
  var bowlY = cy - bh * 0.34;
  ctx.fillStyle = '#FFFBF1'; ctx.strokeStyle = '#F4B93B'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(cx, bowlY, bowlR, 0, Math.PI, false); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,251,241,0.75)'; ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - bowlR * 0.4, bowlY - 1.5); ctx.lineTo(cx - bowlR * 0.2, bowlY - bowlR * 0.9);
  ctx.moveTo(cx + bowlR * 0.3, bowlY - 1.5); ctx.lineTo(cx + bowlR * 0.5, bowlY - bowlR * 0.9);
  ctx.stroke();

  // Tiêu đề 'THỰC ĐƠN PHỞ' chữ vàng ánh kim (khóa maxWidth = safeW -> 0% tràn viền)
  var titlePx = Math.max(5, Math.min(11, Math.round(bh * 0.115)));
  ctx.font = 'bold ' + titlePx + 'px monospace';
  ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('THỰC ĐƠN PHỞ', cx, cy - bh * 0.17, safeW);

  // Đường chỉ vàng ngăn cách tiêu đề và danh sách món
  ctx.strokeStyle = '#F4B93B'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(cx - safeW * 0.46, cy - bh * 0.08); ctx.lineTo(cx + safeW * 0.46, cy - bh * 0.08); ctx.stroke();

  // 4 món Phở kinh điển Vintage 90s căn 2 cột gọn gàng
  var items = [['TÁI', '15K'], ['NẠM', '15K'], ['GẦU', '18K'], ['ĐẶC BIỆT', '25K']];
  var rowPx = Math.max(4, Math.min(9, Math.round(bh * 0.092)));
  ctx.font = 'bold ' + rowPx + 'px monospace';
  var leftX = cx - safeW * 0.46;
  var rightX = cx + safeW * 0.46;
  for (var i = 0; i < items.length; i++) {
    var ry = cy + bh * (0.04 + i * 0.125);
    ctx.fillStyle = '#FFF7DF'; ctx.textAlign = 'left';
    ctx.fillText(items[i][0], leftX, ry, safeW * 0.62);
    ctx.fillStyle = '#FACC15'; ctx.textAlign = 'right';
    ctx.fillText(items[i][1], rightX, ry, safeW * 0.32);
  }
  ctx.restore();
}

function drawLotusArt(ctx, a) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // Lá sen xanh ngọc 2 bên
  ctx.fillStyle = '#15803D';
  ctx.beginPath(); ctx.ellipse(-10*u, 8*u, 9*u, 4*u, -0.25, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10*u, 8*u, 9*u, 4*u, 0.25, 0, Math.PI*2); ctx.fill();
  // Đóa Hoa Sen Hồng nhiều tầng cánh điệu nghệ (1:1 Moodboard!)
  var petals = [
    [-10, 2, -0.55, '#EC4899'], [10, 2, 0.55, '#EC4899'],
    [-6, -2, -0.32, '#F472B6'], [6, -2, 0.32, '#F472B6'],
    [0, -5, 0, '#FBCFE8']
  ];
  for (var i = 0; i < petals.length; i++) {
    ctx.save(); ctx.translate(petals[i][0]*u, petals[i][1]*u); ctx.rotate(petals[i][2]);
    ctx.fillStyle = petals[i][3]; ctx.strokeStyle = '#9D174D'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(0, 0, 4.6*u, 9*u, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // Nhụy sen vàng rực rỡ
  ctx.fillStyle = '#FACC15';
  ctx.beginPath(); ctx.arc(0, 1*u, 3.6*u, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawCycloArt(ctx, a) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // 2 Bánh căm tròn xích lô Sài Gòn
  ctx.strokeStyle = '#1E293B'; ctx.lineWidth = Math.max(1.2, 1.6*u);
  ctx.beginPath(); ctx.arc(-9*u, 8*u, 5.5*u, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(10*u, 8*u, 5.5*u, 0, Math.PI*2); ctx.stroke();
  // Mui vải nâu cong cổ điển & khung ghế Xích Lô Đỏ-Vàng!
  ctx.fillStyle = '#5C341D';
  ctx.beginPath(); ctx.moveTo(-14*u, -4*u); ctx.quadraticCurveTo(-8*u, -13*u, 1*u, -7*u); ctx.lineTo(-2*u, -2*u); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#DC2626'; ctx.strokeStyle = '#7F1D1D'; ctx.lineWidth = 1;
  ctx.fillRect(-13*u, -2*u, 15*u, 9*u); ctx.strokeRect(-13*u, -2*u, 15*u, 9*u);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-11*u, -1*u, 10*u, 6*u); // Đệm vàng rực
  // Khung yên xe & tay lái phía sau
  ctx.strokeStyle = '#B45309'; ctx.lineWidth = Math.max(1.2, 1.5*u);
  ctx.beginPath(); ctx.moveTo(2*u, 5*u); ctx.lineTo(10*u, 8*u); ctx.lineTo(7*u, -3*u); ctx.lineTo(2*u, -4*u); ctx.stroke();
  ctx.restore();
}

function drawNonLaAndDanNguyetArt(ctx, a) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // Chiếc Nón Lá Việt Nam chóp nhọn có dây quai xanh lá thắt nơ (trên trái)
  ctx.fillStyle = '#E8CF9E'; ctx.strokeStyle = '#7C4F2B'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-6*u, -14*u); ctx.lineTo(-19*u, -2*u); ctx.lineTo(7*u, -2*u); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#15803D'; ctx.lineWidth = Math.max(1.2, 1.6*u);
  ctx.beginPath(); ctx.moveTo(-13*u, -2*u); ctx.quadraticCurveTo(-6*u, 5*u, 1*u, -2*u); ctx.stroke(); // Dây quai xanh
  // Cây Đàn Nguyệt mặt tròn cần dài & Sáo Trúc treo chéo (phải)
  ctx.strokeStyle = '#4A2C1A'; ctx.lineWidth = Math.max(1.4, 2*u);
  ctx.beginPath(); ctx.moveTo(10*u, -14*u); ctx.lineTo(10*u, 6*u); ctx.stroke();
  ctx.fillStyle = '#F3DFC1'; ctx.strokeStyle = '#5C341D'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(10*u, 9*u, 6.5*u, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // Sáo trúc nâu vàng treo chéo phía dưới
  ctx.strokeStyle = '#C6833C'; ctx.lineWidth = Math.max(1.5, 2.2*u);
  ctx.beginPath(); ctx.moveTo(-16*u, 12*u); ctx.lineTo(2*u, 4*u); ctx.stroke();
  ctx.restore();
}

/* ==================== 3. TÁC PHẨM TƯỜNG PHẢI (ÁO DÀI HOA SEN, CỜ ĐỎ SAO VÀNG & HOA MAI, KỆ GỐM BÁT TRÀNG) ==================== */
function drawAoDaiArt(ctx, a) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // Dáng tà Áo Dài trắng kem mềm mại + quần lụa xanh ngọc nhạt (1:1 Moodboard 2!)
  ctx.fillStyle = '#CBD5C0'; ctx.fillRect(-5*u, 4*u, 10*u, 9*u);
  ctx.fillStyle = '#FFFBF1'; ctx.strokeStyle = '#8F6E42'; ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-3*u, -12*u); ctx.lineTo(3*u, -12*u); ctx.lineTo(9*u, -4*u); ctx.lineTo(6*u, -2*u);
  ctx.lineTo(4*u, -6*u); ctx.lineTo(6*u, 11*u); ctx.lineTo(-6*u, 11*u); ctx.lineTo(-4*u, -6*u);
  ctx.lineTo(-6*u, -2*u); ctx.lineTo(-9*u, -4*u); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Nhành hoa sen hồng thêu dọc tà Áo Dài!
  ctx.strokeStyle = '#15803D'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-1*u, -6*u); ctx.quadraticCurveTo(2*u, 2*u, -1*u, 9*u); ctx.stroke();
  ctx.fillStyle = '#F472B6';
  ctx.beginPath(); ctx.arc(0, -3*u, 2*u, 0, Math.PI*2); ctx.arc(1*u, 4*u, 2.2*u, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawFlagAndApricotBlossomArt(ctx, a) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // Lá Cờ Đỏ Sao Vàng Việt Nam rực rỡ
  ctx.fillStyle = '#DA251D'; ctx.fillRect(-14*u, -11*u, 20*u, 13*u);
  ctx.fillStyle = '#FFFF00';
  ctx.beginPath();
  for (var i = 0; i < 10; i++) {
    var r = (i % 2 === 0 ? 4.5 : 1.9) * u;
    var ang = -Math.PI/2 + i * Math.PI / 5;
    var sx = -4*u + Math.cos(ang) * r, sy = -4.5*u + Math.sin(ang) * r;
    if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  }
  ctx.closePath(); ctx.fill();
  // Nón lá nhỏ đặt góc dưới trái & Cành Hoa Mai Vàng 5 cánh bên phải
  ctx.fillStyle = '#E8CF9E'; ctx.strokeStyle = '#7C4F2B'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(-8*u, 1*u); ctx.lineTo(-16*u, 9*u); ctx.lineTo(0, 9*u); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#5C341D'; ctx.lineWidth = Math.max(1.1, 1.4*u);
  ctx.beginPath(); ctx.moveTo(4*u, 11*u); ctx.quadraticCurveTo(10*u, 2*u, 14*u, -8*u); ctx.stroke();
  var maiPts = [[8, 4], [12, -1], [14, -7], [7, -2]];
  ctx.fillStyle = '#FACC15';
  for (var mi = 0; mi < maiPts.length; mi++) {
    ctx.beginPath(); ctx.arc(maiPts[mi][0]*u, maiPts[mi][1]*u, 2.5*u, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

function drawPotteryShelfArt(ctx, a) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // Thanh kệ gỗ lim trưng bày đồ thủ công mỹ nghệ Việt Nam
  ctx.fillStyle = '#4A2C1A'; ctx.fillRect(-19*u, 9*u, 38*u, 3.5*u);
  // 1. Bình Gốm Bát Tràng men xanh-trắng vẽ Hoa Sen (trái)
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#1E3A8A'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(-11*u, 1*u, 5.5*u, 7.5*u, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillRect(-13.5*u, -9*u, 5*u, 3.5*u); ctx.strokeRect(-13.5*u, -9*u, 5*u, 3.5*u);
  ctx.fillStyle = '#1D4ED8';
  ctx.beginPath(); ctx.arc(-11*u, 1*u, 2.6*u, 0, Math.PI*2); ctx.fill();
  // 2. Chum Sành nâu đất nung cổ điển (giữa)
  ctx.fillStyle = '#A65432'; ctx.strokeStyle = '#5C2812'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(1*u, 2*u, 5.2*u, 6.8*u, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#D98A36'; ctx.fillRect(-3.5*u, -2*u, 9*u, 1.6*u);
  // 3. Hộp Sơn Mài Đỏ vẽ hoa vàng (phải)
  ctx.fillStyle = '#B91C1C'; ctx.strokeStyle = '#7F1D1D';
  ctx.beginPath(); ctx.ellipse(12*u, 5*u, 5.2*u, 3.8*u, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(12*u, 4*u, 1.3*u, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/* ==================== 4. TÁC PHẨM TƯỜNG ĐỐI DIỆN BẾP (QUANG GÁNH PHỞ, SAIGON SKYLINE, ĐỒNG HỒ 90S) ==================== */
function drawQuangGanhPhoArt(ctx, a) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // Đòn gánh tre uốn cong cổ truyền & 2 quang thúng mây tre đan (1:1 Moodboard 2!)
  ctx.strokeStyle = '#92400E'; ctx.lineWidth = Math.max(1.5, 2.2*u);
  ctx.beginPath(); ctx.moveTo(-16*u, -6*u); ctx.quadraticCurveTo(0, -10*u, 16*u, -6*u); ctx.stroke();
  ctx.strokeStyle = '#B45309'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-12*u, -7*u); ctx.lineTo(-16*u, 5*u); ctx.moveTo(-12*u, -7*u); ctx.lineTo(-8*u, 5*u); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12*u, -7*u); ctx.lineTo(8*u, 5*u); ctx.moveTo(12*u, -7*u); ctx.lineTo(16*u, 5*u); ctx.stroke();
  ctx.fillStyle = '#C6833C'; ctx.strokeStyle = '#78350F';
  ctx.beginPath(); ctx.ellipse(-12*u, 7*u, 5.5*u, 3.8*u, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(12*u, 7*u, 5.5*u, 3.8*u, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawSaigonSkylineAndClockArt(ctx, a, t) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // Tranh Saigon Skyline (Nhà Thờ Đức Bà đỏ & Tháp Bitexco xanh) bên trái
  ctx.fillStyle = '#BAE6FD'; ctx.fillRect(-18*u, -10*u, 22*u, 18*u);
  ctx.fillStyle = '#38BDF8'; ctx.fillRect(-15*u, -7*u, 5*u, 15*u); // Bitexco
  ctx.fillStyle = '#B83224'; ctx.fillRect(-8*u, -2*u, 8*u, 10*u);  // Nhà Thờ Đức Bà
  ctx.fillStyle = '#22C55E'; ctx.fillRect(-18*u, 6*u, 22*u, 3*u);
  // Đồng Hồ Quả Lắc Vintage 90s gỗ nâu có quả lắc vàng đung đưa 60fps bên phải!
  ctx.fillStyle = '#5C341D'; ctx.strokeStyle = '#2B180E'; ctx.lineWidth = 1;
  ctx.fillRect(8*u, -11*u, 10*u, 22*u); ctx.strokeRect(8*u, -11*u, 10*u, 22*u);
  ctx.fillStyle = '#FFFBF1'; ctx.beginPath(); ctx.arc(13*u, -5*u, 3.6*u, 0, Math.PI*2); ctx.fill();
  // Quả lắc đồng đung đưa 60fps
  var swing = Math.sin(t * 3.8) * 2.5 * u;
  ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(13*u, -1*u); ctx.lineTo(13*u + swing, 7*u); ctx.stroke();
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(13*u + swing, 7.5*u, 1.8*u, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/* ==================== 5. HÀM TỔNG VẼ TOÀN BỘ MỸ THUẬT 3 BỨC TƯỜNG QUÁN PHỞ (QĐ 240) ==================== */
function drawPhoVnCultureWalls3D(ctx, cam, t) {
  drawWallFriezeBorders3D(ctx, cam);

  // ---- TƯỜNG TRÁI (X = -5.94) ----
  // 1. Bảng Thực Đơn Phở Đỏ Son Viền Gỗ Gụ Chữ Vàng Vintage 90s ngay lối vào (Z = 0.50..1.62, 0% tràn viền)
  drawPhoMenuBoardArt(ctx, cam);
  // 2. Tranh Hoa Sen Hồng Cổ Điển (Z = 2.8)
  drawPoly3D(ctx, cam, [[-5.93,1.45,2.0],[-5.93,1.45,3.6],[-5.93,2.75,3.6],[-5.93,2.75,2.0]], '#FAF0D7', '#4A2C1A', 2.2);
  var l1 = wallArtAnchor(cam, -5.91, 2.1, 2.8, 'x');
  if (l1) drawLotusArt(ctx, l1);
  // 3. Tranh Xe Xích Lô Đỏ-Vàng Sài Gòn (Z = 5.6)
  drawPoly3D(ctx, cam, [[-5.93,1.45,4.8],[-5.93,1.45,6.4],[-5.93,2.75,6.4],[-5.93,2.75,4.8]], '#FAF0D7', '#4A2C1A', 2.2);
  var l2 = wallArtAnchor(cam, -5.91, 2.1, 5.6, 'x');
  if (l2) drawCycloArt(ctx, l2);
  // 4. Bộ Nón Lá + Đàn Nguyệt & Sáo Trúc treo trực tiếp trên tường vàng (Z = 8.4)
  var l3 = wallArtAnchor(cam, -5.91, 2.15, 8.4, 'x');
  if (l3) drawNonLaAndDanNguyetArt(ctx, l3);

  // ---- TƯỜNG PHẢI (X = +5.94) ----
  // 1. Tranh Áo Dài Trắng Hoa Sen (Z = 2.8)
  drawPoly3D(ctx, cam, [[5.93,1.45,3.6],[5.93,1.45,2.0],[5.93,2.75,2.0],[5.93,2.75,3.6]], '#FAF0D7', '#4A2C1A', 2.2);
  var r1 = wallArtAnchor(cam, 5.91, 2.1, 2.8, 'x');
  if (r1) drawAoDaiArt(ctx, r1);
  // 2. Tranh Cờ Đỏ Sao Vàng + Nón Lá & Hoa Mai Vàng (Z = 5.6)
  drawPoly3D(ctx, cam, [[5.93,1.45,6.4],[5.93,1.45,4.8],[5.93,2.75,4.8],[5.93,2.75,6.4]], '#FAF0D7', '#4A2C1A', 2.2);
  var r2 = wallArtAnchor(cam, 5.91, 2.1, 5.6, 'x');
  if (r2) drawFlagAndApricotBlossomArt(ctx, r2);
  // 3. Kệ Gỗ Trưng Bày Bình Gốm Bát Tràng Men Xanh + Chum Sành + Hộp Sơn Mài Đỏ (Z = 8.4)
  var r3 = wallArtAnchor(cam, 5.91, 2.1, 8.4, 'x');
  if (r3) drawPotteryShelfArt(ctx, r3);

  // ---- TƯỜNG ĐỐI DIỆN SAU BẾP (Z = 14.72) ----
  // 1. 2 Câu Đối Đỏ Chữ Vàng treo đối xứng 2 bên bảng PHỞ BÒ GIA TRUYỀN 1990!
  drawPoly3D(ctx, cam, [[-4.15,1.45,14.73],[-3.72,1.45,14.73],[-3.72,3.25,14.73],[-4.15,3.25,14.73]], '#B91C1C', '#F4B93B', 1.4);
  drawPoly3D(ctx, cam, [[1.78,1.45,14.73],[2.21,1.45,14.73],[2.21,3.25,14.73],[1.78,3.25,14.73]], '#B91C1C', '#F4B93B', 1.4);
  // 2. Bích họa Quang Gánh Phở Xưa (góc trái tường sau bếp X = -5.0)
  drawPoly3D(ctx, cam, [[-5.75,1.65,14.73],[-4.32,1.65,14.73],[-4.32,2.85,14.73],[-5.75,2.85,14.73]], '#FAF0D7', '#4A2C1A', 2);
  var b1 = wallArtAnchor(cam, -5.03, 2.25, 14.7, 'z');
  if (b1) drawQuangGanhPhoArt(ctx, b1);
  // 3. Tranh Saigon Skyline & Đồng Hồ Quả Lắc Vintage 90s đung đưa 60fps (góc phải tường sau bếp X = +4.1)
  drawPoly3D(ctx, cam, [[2.55,1.65,14.73],[5.55,1.65,14.73],[5.55,2.95,14.73],[2.55,2.95,14.73]], '#FAF0D7', '#4A2C1A', 2);
  var b2 = wallArtAnchor(cam, 4.05, 2.3, 14.7, 'z');
  if (b2) drawSaigonSkylineAndClockArt(ctx, b2, t);
}
`;
}
