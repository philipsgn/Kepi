/**
 * Đồ họa Pixel Art Quán Phở Cổ Truyền Việt Nam Toàn Màn Hình (640 × 460 — Quyết định 226)
 * Nâng cấp toàn diện theo docs/VIETNAM_PIXEL_ART_BIBLE.md & vnPixelArtKit.ts:
 *  - Bỏ hoàn toàn quạt trần (không hợp góc cam top-down 2.5D), thay bằng 3 quạt treo tường cổ điển trên tường bếp
 *  - 14 Bàn inox san sát (28 ghế ngồi) xếp 3 dãy + 2 lối đi dọc thông suốt (x = 208, x = 432)
 *  - Bàn tĩnh KHÔNG vẽ sẵn tô phở giả; drawDynamicPhoBowl vẽ tô đầy bốc khói (EATING) & tô rỗng (NEEDS_CLEAR)
 *  - drawDetailedHumanFace: Khuôn mặt pixel sắc nét (mắt đen 2×2 + chấm trắng sáng, má hồng, miệng, 4 kiểu tóc)
 *  - Bồn rửa chén inox góc trái bếp để 2 nhân viên mang tô rỗng về dọn rửa
 */
export function buildPhoInteriorArtScript(): string {
  return `
/* Khuôn mặt người pixel chi tiết chuẩn (mắt sáng trắng, má hồng, miệng, 4 kiểu tóc đa dạng) */
function drawDetailedHumanFace(c, cx, cy, opt) {
  var skin = (opt && opt.skin) || '#FFD5B5';
  var skinSh = '#EAB38F';
  var hair = (opt && opt.hair) || '#2B2118';
  var hairStyle = (opt && opt.hairStyle) || 0;
  var faceDir = (opt && opt.faceDir) || 0; // -1: nhìn trái, 0: nhìn thẳng/xuống, 1: nhìn phải
  var eating = !!(opt && opt.eating);
  var waiting = !!(opt && opt.waiting);
  var backView = !!(opt && opt.backView);

  // Viền đầu & khuôn mặt 10×9 sắc nét
  R(c, cx - 5, cy - 5, 10, 9, VN_MAT.ink);
  R(c, cx - 4, cy - 4, 8, 7, skin);
  R(c, cx - 4, cy + 2, 8, 1, skinSh); // Bóng cằm nhẹ

  if (backView) {
    // Nhìn từ phía sau (khách quay lưng đi lên)
    R(c, cx - 4, cy - 4, 8, 6, hair);
    if (hairStyle === 1) { E(c, cx, cy - 5, 3, 2.5, hair); } // Tóc búi nữ
    return;
  }

  // Mắt đen 2×2 có chấm sáng trắng + má hồng + miệng biểu cảm
  var eyeShift = faceDir < 0 ? -1 : (faceDir > 0 ? 1 : 0);
  var lx = cx - 3 + eyeShift, rx = cx + 1 + eyeShift;
  // Mắt trái & mắt phải
  R(c, lx, cy - 1, 2, 2, VN_MAT.ink); R(c, lx, cy - 1, 1, 1, '#FFFFFF');
  R(c, rx, cy - 1, 2, 2, VN_MAT.ink); R(c, rx, cy - 1, 1, 1, '#FFFFFF');
  // Má hồng nhẹ
  R(c, lx - 1, cy + 1, 1, 1, '#F596A8');
  R(c, rx + 2, cy + 1, 1, 1, '#F596A8');
  // Miệng (há tròn khi ăn phở, cười nhẹ khi bình thường, nhíu nhẹ khi chờ món)
  if (eating) {
    R(c, cx - 1 + eyeShift, cy + 1, 2, 2, '#9E3828');
  } else if (waiting) {
    R(c, cx - 1 + eyeShift, cy + 1, 2, 1, '#7A4B2A');
  } else {
    R(c, cx - 1 + eyeShift, cy + 1, 2, 1, '#B84E68');
  }

  // 4 Kiểu tóc Việt Nam đa dạng
  if (hairStyle === 0) {
    // Tóc ngắn nam rẽ ngôi
    R(c, cx - 5, cy - 6, 10, 3, VN_MAT.ink);
    R(c, cx - 4, cy - 5, 8, 2, hair);
    R(c, cx - 4, cy - 3, 2, 2, hair);
    R(c, cx + 3, cy - 3, 1, 1, hair);
  } else if (hairStyle === 1) {
    // Tóc búi cao nữ
    R(c, cx - 5, cy - 6, 10, 3, VN_MAT.ink);
    R(c, cx - 4, cy - 5, 8, 2, hair);
    E(c, cx, cy - 7, 3, 2, VN_MAT.ink);
    E(c, cx, cy - 7, 2, 1.5, hair);
    R(c, cx - 4, cy - 3, 1, 4, hair); R(c, cx + 3, cy - 3, 1, 4, hair);
  } else if (hairStyle === 2) {
    // Tóc mái ngang dài vai
    R(c, cx - 5, cy - 6, 10, 3, VN_MAT.ink);
    R(c, cx - 4, cy - 5, 8, 2, hair);
    R(c, cx - 5, cy - 3, 2, 6, hair); R(c, cx + 3, cy - 3, 2, 6, hair);
  } else {
    // Tóc vuốt dựng trẻ trung
    R(c, cx - 5, cy - 6, 10, 3, VN_MAT.ink);
    R(c, cx - 4, cy - 6, 8, 3, hair);
    R(c, cx - 2, cy - 7, 4, 1, hair);
  }
}

/* 3 Quạt treo tường xanh cổ điển gắn trên tường bếp (thay quạt trần — chuẩn góc cam top-down) */
function drawWallFan(c, cx, cy, t, phase) {
  var osc = Math.round(Math.sin(t * 1.4 + phase) * 2);
  // Đế gắn tường
  R(c, cx - 3, cy + 6, 6, 4, '#334155');
  // Lồng quạt sắt tròn
  E(c, cx + osc, cy, 8, 8, VN_MAT.ink);
  E(c, cx + osc, cy, 7, 7, '#CBD5E1');
  E(c, cx + osc, cy, 6, 6, '#E0F2FE');
  // 3 Cánh quạt xanh dương xoay 60fps
  var ang = t * 14 + phase;
  for (var i = 0; i < 3; i++) {
    var a = ang + (i * Math.PI * 2) / 3;
    var bx = cx + osc + Math.round(Math.cos(a) * 5);
    var by = cy + Math.round(Math.sin(a) * 5);
    linePx(c, cx + osc, cy, bx, by, '#0284C7');
  }
  E(c, cx + osc, cy, 2, 2, '#1E3A8A');
}

/* Bàn inox san sát (KHÔNG vẽ sẵn tô phở giả — chỉ có bộ gia vị cố định) */
function drawPhoTableStatic(c, tx, ty, tw, isSpecial) {
  // Bóng bàn dưới sàn gạch bông
  R(c, tx + 2, ty + 25, tw - 4, 4, 'rgba(43,33,24,0.22)');
  // 2 Ghế nhựa xanh/đỏ phía trên bàn (mỗi bàn 2 chỗ ngồi rõ ràng)
  var seat1X = tx + 22, seat2X = tx + tw - 38;
  var chairs = [
    [seat1X, ty - 11, VN_MAT.plasticChair.blue],
    [seat2X, ty - 11, VN_MAT.plasticChair.red]
  ];
  for (var ci = 0; ci < chairs.length; ci++) {
    var ch = chairs[ci];
    R(c, ch[0], ch[1], 16, 10, VN_MAT.ink);
    R(c, ch[0] + 1, ch[1] + 1, 14, 8, ch[2]);
    R(c, ch[0] + 2, ch[1] + 2, 12, 2, 'rgba(255,255,255,0.26)');
  }
  // Mặt bàn inox sáng bóng (tw × 26)
  R(c, tx, ty, tw, 26, VN_MAT.ink);
  R(c, tx + 1, ty + 1, tw - 2, 24, VN_MAT.inox.mid);
  R(c, tx + 2, ty + 2, tw - 4, 3, VN_MAT.inox.hi);
  R(c, tx + 2, ty + 22, tw - 4, 3, VN_MAT.inox.sh);
  // Chân bàn inox
  R(c, tx + 4, ty + 25, 4, 3, VN_MAT.inox.dk);
  R(c, tx + tw - 8, ty + 25, 4, 3, VN_MAT.inox.dk);

  // Bộ gia vị Phở đặt giữa bàn (cố định)
  var mx = tx + Math.floor(tw / 2);
  // Giỏ đũa muỗng inox
  R(c, mx - 12, ty + 6, 7, 8, VN_MAT.ink);
  R(c, mx - 11, ty + 7, 5, 6, VN_MAT.inox.hi);
  R(c, mx - 10, ty + 4, 1, 3, '#8A5634'); R(c, mx - 8, ty + 4, 1, 3, '#8A5634');
  // Chai tương ớt đỏ & tương đen
  R(c, mx - 3, ty + 6, 4, 8, VN_MAT.ink); R(c, mx - 2, ty + 7, 2, 6, '#DC2626');
  R(c, mx + 2, ty + 6, 4, 8, VN_MAT.ink); R(c, mx + 3, ty + 7, 2, 6, '#3B2314');
  // Hũ giấm tỏi trắng
  R(c, mx + 8, ty + 8, 6, 6, VN_MAT.ink); R(c, mx + 9, ty + 9, 4, 4, '#FFF8E6');
  // Rổ rau thơm xanh & hộp khăn giấy ở nửa dưới giữa bàn
  E(c, mx - 4, ty + 19, 7, 4, VN_MAT.ink); E(c, mx - 4, ty + 19, 6, 3, '#2E7D32');
  R(c, mx - 7, ty + 18, 4, 2, '#4CAF50');
  R(c, mx + 5, ty + 16, 9, 6, VN_MAT.ink); R(c, mx + 6, ty + 17, 7, 4, '#38BDF8');

  if (isSpecial) {
    // Đĩa quẩy nóng dành riêng tại Bàn Phở Đặc Biệt của Heo
    E(c, tx + tw - 16, ty + 19, 6, 3, '#FFFFFF');
    R(c, tx + tw - 20, ty + 18, 8, 2, '#D97706');
  }
}

/* Vẽ tô phở ĐỘNG trên bàn theo đúng trạng thái thực sự của ghế (EATING vs NEEDS_CLEAR) */
function drawDynamicPhoBowl(c, bx, by, bowlState, t) {
  if (bowlState === 'FULL') {
    E(c, bx, by, 7, 5, VN_MAT.ink);
    E(c, bx, by, 6, 4, '#FFFFFF');
    E(c, bx, by, 5, 3, '#D9A756'); // Nước dùng đầy vàng óng
    R(c, bx - 3, by - 1, 3, 2, '#9E3828'); // Thịt bò tái nạm
    R(c, bx + 1, by - 1, 2, 2, '#FFFDF7'); // Sợi bánh phở trắng
    R(c, bx - 1, by + 1, 3, 1, '#22C55E'); // Hành lá xanh
    // Hơi khói nóng bốc nhẹ từ tô phở đang ăn
    drawSteamPuff(c, bx - 1, by - 4, t * 1.1 + bx * 0.05, 2);
  } else if (bowlState === 'EMPTY_DIRTY') {
    // Tô phở đã ăn xong (nước cạn màu xám nhạt + đôi đũa gác ngang chờ nhân viên dọn)
    E(c, bx, by, 7, 5, VN_MAT.ink);
    E(c, bx, by, 6, 4, '#F1F5F9');
    E(c, bx, by, 4, 2.5, '#CBD5E1'); // Lòng tô trống
    R(c, bx - 2, by, 2, 1, '#86EFAC'); // Sót cọng hành
    linePx(c, bx - 6, by - 2, bx + 6, by + 2, '#6B4226'); // Đũa gác ngang tô bẩn
  }
}

function drawPhoStaticBg(c, tableDefs) {
  // 1. Sàn gạch bông Indochine 16×16 phủ liền mạch (640×460)
  drawTileFloorIndochine(c, 0, 64, 640, 396);

  // 2. Tường vàng vôi phố cổ (y: 0..64) + ốp gạch men trắng bóng nửa dưới (y: 38..64)
  R(c, 0, 0, 640, 38, VN_MAT.wallYellow.mid);
  R(c, 0, 0, 640, 5, VN_MAT.woodLim.mid);
  R(c, 0, 38, 640, 26, '#F1F5F9');
  R(c, 0, 38, 640, 2, '#38BDF8');
  for (var wx = 0; wx < 640; wx += 16) R(c, wx, 40, 1, 24, 'rgba(148,163,184,0.35)');
  R(c, 0, 52, 640, 1, 'rgba(148,163,184,0.35)');
  R(c, 0, 64, 640, 2, VN_MAT.ink);
  R(c, 0, 0, 14, 460, VN_MAT.wallYellow.sh); R(c, 14, 0, 2, 460, VN_MAT.ink);
  R(c, 626, 0, 14, 460, VN_MAT.wallYellow.sh); R(c, 624, 0, 2, 460, VN_MAT.ink);

  // 3. Bảng giá đỏ viền vàng "PHO BO GIA TRUYEN" & Lịch bloc đỏ & Đồng hồ
  R(c, 200, 9, 240, 27, VN_MAT.ink);
  R(c, 202, 11, 236, 23, '#C92A22');
  R(c, 204, 13, 232, 19, '#B8221B');
  R(c, 204, 13, 232, 1, '#F4B93B'); R(c, 204, 31, 232, 1, '#F4B93B');
  R(c, 226, 16, 188, 4, '#FFE57F');
  R(c, 246, 23, 148, 3, '#FFF8E6');
  // Lịch bloc đỏ
  R(c, 144, 12, 22, 24, VN_MAT.ink);
  R(c, 145, 13, 20, 10, '#DC2626');
  R(c, 146, 23, 18, 12, '#FFFDF7'); R(c, 151, 26, 8, 6, '#DC2626');
  // Đồng hồ tròn
  E(c, 480, 22, 11, 11, VN_MAT.ink); E(c, 480, 22, 9, 9, '#FFFDF7');
  R(c, 480, 16, 1, 6, VN_MAT.ink); R(c, 480, 22, 5, 1, '#DC2626');

  // 4. KHU BẾP PHỞ MẶT TIỀN + BỒN RỬA CHÉN INOX (x: 22..474, y: 66..148)
  R(c, 22, 66, 452, 80, '#E2E8F0');
  R(c, 22, 120, 452, 28, VN_MAT.ink);
  R(c, 24, 122, 448, 24, VN_MAT.inox.mid);
  R(c, 24, 122, 448, 4, VN_MAT.inox.hi);
  R(c, 24, 142, 448, 4, VN_MAT.inox.sh);
  R(c, 22, 148, 452, 5, 'rgba(43,33,24,0.22)');

  // Bồn rửa chén inox góc trái bếp (x: 28..76, y: 124..144) — Nơi nhân viên mang tô rỗng về rửa
  R(c, 28, 124, 46, 19, VN_MAT.ink);
  R(c, 30, 126, 42, 15, '#93C5FD'); // Nước rửa chén xanh nhạt
  R(c, 32, 127, 16, 4, '#E0F2FE'); // Bọt xà phòng
  R(c, 48, 120, 4, 8, '#64748B');  // Vòi nước inox

  // Tủ kính Phở truyền thống (x: 82..224, y: 74..134) — Thịt bò tươi & Rổ bánh phở dai giòn
  R(c, 82, 74, 142, 56, VN_MAT.ink);
  R(c, 84, 76, 138, 52, '#E0F2FE');
  R(c, 84, 76, 138, 5, '#C92A22');
  R(c, 84, 103, 138, 3, VN_MAT.inox.dk);
  var meats = [
    [92, 84, 15, 16, '#B91C1C', '#FCA5A5'],
    [114, 84, 16, 16, '#991B1B', '#FDE68A'],
    [138, 84, 15, 15, '#DC2626', '#FECACA'],
    [160, 86, 15, 13, '#7C2D12', '#FDBA74']
  ];
  for (var mi = 0; mi < meats.length; mi++) {
    var mt = meats[mi];
    R(c, mt[0] + 6, 81, 2, 4, '#475569');
    R(c, mt[0], mt[1], mt[2], mt[3], VN_MAT.ink);
    R(c, mt[0] + 1, mt[1] + 1, mt[2] - 2, mt[3] - 2, mt[4]);
    R(c, mt[0] + 3, mt[1] + 3, 5, 4, mt[5]);
  }
  // Bò viên, hành lá & Rổ bánh phở trắng muốt dai giòn
  E(c, 104, 116, 13, 7, '#FFFFFF');
  for (var bvi = 0; bvi < 4; bvi++) E(c, 97 + bvi * 4, 115 + (bvi % 2) * 2, 3, 2.5, '#78350F');
  R(c, 126, 110, 32, 13, VN_MAT.ink); R(c, 127, 111, 30, 11, '#22C55E'); R(c, 130, 113, 24, 4, '#86EFAC');
  R(c, 166, 109, 50, 16, VN_MAT.ink);
  R(c, 167, 110, 48, 14, '#D97706');
  R(c, 170, 108, 42, 12, '#FFFFFF');
  for (var ny = 110; ny <= 118; ny += 2) R(c, 172, ny, 38, 1, '#E2E8F0');

  // Thớt gỗ tròn băm thịt bò & dao phay (x: 234..268)
  E(c, 250, 122, 16, 9, VN_MAT.ink); E(c, 250, 121, 14, 7, '#D4A373');
  R(c, 244, 118, 8, 5, '#DC2626');
  R(c, 255, 115, 10, 5, '#CBD5E1'); R(c, 264, 116, 4, 2, '#6B4226');

  // 2 NỒI NƯỚC DÙNG PHỞ INOX KHỔNG LỒ (x: 336..464)
  var pots = [{ cx: 368, cy: 112, r: 25 }, { cx: 432, cy: 112, r: 25 }];
  for (var pi = 0; pi < pots.length; pi++) {
    var pt = pots[pi];
    R(c, pt.cx - pt.r, pt.cy, pt.r * 2, 24, VN_MAT.ink);
    R(c, pt.cx - pt.r + 2, pt.cy + 2, pt.r * 2 - 4, 20, VN_MAT.inox.mid);
    R(c, pt.cx - pt.r + 4, pt.cy + 2, 10, 20, VN_MAT.inox.hi);
    E(c, pt.cx, pt.cy, pt.r, 14, VN_MAT.ink);
    E(c, pt.cx, pt.cy, pt.r - 2, 12, VN_MAT.inox.hi);
    E(c, pt.cx, pt.cy + 1, pt.r - 5, 9, '#C68A2B');
    E(c, pt.cx, pt.cy, pt.r - 8, 7, '#E0A842');
    R(c, pt.cx - 8, pt.cy - 2, 7, 3, '#FEF3C7');
    R(c, pt.cx + 4, pt.cy + 2, 5, 2, '#92400E');
  }

  // 5. GÓC TRÀ ĐÁ, QUẨY NÓNG & TỦ LẠNH (x: 496..618, y: 66..148)
  R(c, 496, 112, 120, 34, VN_MAT.ink);
  R(c, 498, 114, 116, 30, VN_MAT.woodLim.mid);
  R(c, 498, 114, 116, 4, VN_MAT.woodLim.hi);
  R(c, 506, 92, 24, 30, VN_MAT.ink); R(c, 508, 94, 20, 26, VN_MAT.inox.mid); R(c, 510, 94, 6, 26, VN_MAT.inox.hi);
  R(c, 516, 114, 4, 4, '#2563EB');
  E(c, 554, 122, 16, 9, VN_MAT.ink); E(c, 554, 122, 14, 7, '#B45309');
  for (var qi = 0; qi < 5; qi++) {
    R(c, 544 + qi * 4, 118 + (qi % 2) * 2, 8, 3, '#F59E0B');
    R(c, 545 + qi * 4, 118 + (qi % 2) * 2, 6, 1, '#FDE68A');
  }
  R(c, 580, 68, 36, 74, VN_MAT.ink); R(c, 582, 70, 32, 70, '#E0F2FE'); R(c, 582, 70, 32, 10, '#1D4ED8');
  for (var sy = 86; sy <= 122; sy += 12) {
    R(c, 584, sy + 8, 28, 2, '#64748B');
    R(c, 586, sy + 2, 4, 6, '#DC2626'); R(c, 592, sy + 2, 4, 6, '#16A34A');
    R(c, 598, sy + 2, 4, 6, '#F59E0B'); R(c, 604, sy + 2, 4, 6, '#2563EB');
  }

  // 6. 14 BÀN INOX SAN SÁT (3 DÃY: TRÁI 5, GIỮA 4, PHẢI 5)
  for (var ti = 0; ti < tableDefs.length; ti++) {
    var tb = tableDefs[ti];
    drawPhoTableStatic(c, tb.x, tb.y, tb.w, !!tb.isSpecial);
  }

  // 7. QUẦY THU NGÂN & BÀN THỜ ÔNG ĐỊA – THẦN TÀI GÓC TRÁI DƯỚI (x: 24..152, y: 400..448)
  R(c, 24, 404, 78, 38, VN_MAT.ink);
  R(c, 26, 406, 74, 34, VN_MAT.woodLim.mid); R(c, 26, 406, 74, 4, VN_MAT.woodLim.hi);
  R(c, 36, 412, 20, 12, '#334155'); R(c, 38, 414, 16, 7, '#38BDF8');
  R(c, 66, 414, 14, 10, '#FFF8E6');
  // Bàn thờ Ông Địa đèn đỏ
  R(c, 112, 404, 34, 38, VN_MAT.ink); R(c, 114, 406, 30, 34, '#7C2D12');
  R(c, 110, 400, 38, 5, '#B91C1C'); R(c, 116, 410, 26, 24, '#451A03');
  R(c, 121, 416, 6, 9, '#FDE68A'); R(c, 131, 416, 6, 9, '#F59E0B');
  R(c, 126, 426, 6, 5, '#D97706');
  R(c, 117, 413, 3, 5, '#EF4444'); R(c, 138, 413, 3, 5, '#EF4444');

  // 8. CỬA KÍNH MẶT TIỀN & CỔNG RA ĐẠI LỘ (y: 438..460)
  R(c, 16, 444, 246, 16, VN_MAT.ink); R(c, 18, 446, 242, 10, '#93C5FD');
  R(c, 378, 444, 246, 16, VN_MAT.ink); R(c, 380, 446, 242, 10, '#93C5FD');
  R(c, 262, 434, 116, 26, '#D6C3A5');
  R(c, 276, 440, 88, 14, '#B91C1C'); R(c, 278, 442, 84, 10, '#DC2626');
  R(c, 294, 445, 52, 4, '#FFE57F');
  R(c, 246, 426, 14, 14, '#B45309'); E(c, 253, 421, 10, 8, '#2E7D32');
  R(c, 380, 426, 14, 14, '#B45309'); E(c, 387, 421, 10, 8, '#2E7D32');
}

/* Đầu bếp nấu phở bên trong bếp với khuôn mặt chi tiết sắc nét */
function drawPhoChef(c, t, hasWaiting) {
  var cx = 296, cy = 116;
  var dip = Math.round(Math.sin(t * (hasWaiting ? 6.5 : 3.5)) * 2);
  drawContactShadow(c, cx, cy + 4, 8, 3);
  R(c, cx - 6, cy - 11, 12, 13, VN_MAT.ink);
  R(c, cx - 5, cy - 10, 10, 11, '#FFFFFF');
  R(c, cx - 4, cy - 6, 8, 7, '#334155');
  drawDetailedHumanFace(c, cx, cy - 16, { hair: '#2B2118', hairStyle: 0, faceDir: 1 });
  // Mũ đầu bếp trắng
  R(c, cx - 6, cy - 25, 12, 6, VN_MAT.ink);
  R(c, cx - 5, cy - 24, 10, 4, '#FFFFFF');
  // Tay cầm muôi inox chan nước dùng vào nồi
  R(c, cx + 6, cy - 8 + dip, 14, 3, '#CBD5E1');
  E(c, cx + 22, cy - 6 + dip, 4, 3, '#F8FAFC');
  // Tay trái nhấc vợt trụng bánh phở
  R(c, cx - 14, cy - 8 - dip, 8, 2, '#94A3B8');
  E(c, cx - 16, cy - 6 - dip, 4, 4, '#FFFFFF');
}

/* 2 Nhân viên phục vụ chạy FSM (tay không / bưng tô phở đầy bốc khói / bưng tô rỗng về bồn rửa) */
function drawPhoWaiter(c, w, t) {
  var x = Math.round(w.x), y = Math.round(w.y);
  var moving = !!(w.moving);
  var step = moving ? (Math.floor(t * 10 + w.phase) % 2) : 0;
  drawContactShadow(c, x, y + 1, 6, 2.5);
  R(c, x - 3, y - 6 + step, 3, 6, '#1E293B');
  R(c, x + 1, y - 6 + (1 - step), 3, 6, '#1E293B');
  R(c, x - 5, y - 15, 10, 10, VN_MAT.ink);
  R(c, x - 4, y - 14, 8, 8, w.shirt);
  R(c, x - 3, y - 10, 6, 5, '#B91C1C'); // Tạp dề đỏ nhân viên
  drawDetailedHumanFace(c, x, y - 20, {
    hair: w.hair,
    hairStyle: w.hairStyle,
    faceDir: w.faceX,
    backView: w.faceY < 0
  });

  // Hiển thị mâm theo đúng trạng thái thực tế của nhân viên
  var trayX = w.faceX >= 0 ? x + 5 : x - 16;
  if (w.carrying === 'FULL_PHO') {
    R(c, trayX, y - 12, 12, 2, '#475569');
    E(c, trayX + 6, y - 14, 5, 3, '#FFFFFF');
    R(c, trayX + 4, y - 15, 4, 2, '#D9A756');
    c.save(); c.globalAlpha = 0.6;
    R(c, trayX + 5, y - 19 - step, 2, 2, '#FFFFFF');
    c.restore();
  } else if (w.carrying === 'DIRTY_BOWL') {
    R(c, trayX, y - 12, 12, 2, '#475569');
    E(c, trayX + 6, y - 14, 5, 3, '#E2E8F0');
    R(c, trayX + 3, y - 15, 6, 1, '#6B4226'); // Đũa trên tô bẩn mang đi rửa
  }
}

/* Thực khách ngồi tại bàn (WAITING_FOOD chưa có tô / EATING đang gắp phở ăn xì xụp) */
function drawSeatedPhoGuest(c, seat, t) {
  var g = seat.guest;
  if (!g) return;
  var x = Math.round(seat.seatX), y = Math.round(seat.seatY);
  var isEating = seat.state === 'EATING';
  var isWaiting = seat.state === 'WAITING_FOOD';
  var eatBob = isEating && Math.sin(t * 4.5 + g.phase) > 0.3 ? 1 : 0;

  // Thân áo cổ tròn
  R(c, x - 5, y - 8, 10, 9, VN_MAT.ink);
  R(c, x - 4, y - 7, 8, 7, g.shirt);
  R(c, x - 2, y - 7, 4, 1, '#FFFFFF'); // Cổ áo
  drawDetailedHumanFace(c, x, y - 13 + eatBob, {
    hair: g.hair,
    hairStyle: g.hairStyle,
    faceDir: 0,
    eating: eatBob > 0,
    waiting: isWaiting
  });

  if (isEating && eatBob > 0) {
    // Đũa gắp sợi bánh phở trắng đưa lên miệng
    R(c, x + 3, y - 7, 5, 1, '#8A5634');
    R(c, x + 6, y - 6, 2, 4, '#FFFFFF');
  } else if (isWaiting) {
    // Biểu tượng nhỏ "..." chờ gọi phở phía trên đầu khách chưa có đồ ăn
    var dot = Math.floor(t * 3 + g.phase) % 3;
    R(c, x - 6, y - 27, 13, 6, VN_MAT.ink);
    R(c, x - 5, y - 26, 11, 4, '#FFFDF7');
    R(c, x - 3, y - 25, 2, 2, dot === 0 ? '#E0452B' : '#94A3B8');
    R(c, x, y - 25, 2, 2, dot === 1 ? '#E0452B' : '#94A3B8');
    R(c, x + 3, y - 25, 2, 2, dot === 2 ? '#E0452B' : '#94A3B8');
  }
}

/* Khách đang đi vào ghế trống hoặc ăn xong đi ra cửa chính */
function drawWalkingPhoGuest(c, g, t) {
  var x = Math.round(g.x), y = Math.round(g.y);
  var step = Math.floor(t * 9 + g.phase) % 2;
  drawContactShadow(c, x, y + 1, 6, 2.5);
  R(c, x - 3, y - 6 + step, 3, 6, '#334155');
  R(c, x + 1, y - 6 + (1 - step), 3, 6, '#334155');
  R(c, x - 5, y - 15, 10, 10, VN_MAT.ink);
  R(c, x - 4, y - 14, 8, 8, g.shirt);
  drawDetailedHumanFace(c, x, y - 20, {
    hair: g.hair,
    hairStyle: g.hairStyle,
    faceDir: g.faceX,
    backView: g.faceY < 0
  });
}

function drawPhoLiveEntities(c, t, seats, waiters, walkGuests, pigState, drawPigFn) {
  // 1. 3 Quạt treo tường xanh cổ điển trên tường bếp (chuẩn góc cam top-down)
  drawWallFan(c, 82, 22, t, 0);
  drawWallFan(c, 536, 22, t, 1.8);
  drawWallFan(c, 594, 22, t, 3.6);

  // 2. Kiểm tra xem có khách đang chờ món không để đầu bếp chan phở nhanh hơn
  var hasWaiting = false;
  for (var ci = 0; ci < seats.length; ci++) {
    if (seats[ci].state === 'WAITING_FOOD') { hasWaiting = true; break; }
  }
  drawPhoChef(c, t, hasWaiting);

  // 3. 2 Nồi phở inox sôi sùng sục (bong bóng 60fps + khói bốc nghi ngút)
  var potCenters = [[368, 112], [432, 112]];
  for (var pi = 0; pi < potCenters.length; pi++) {
    var px = potCenters[pi][0], py = potCenters[pi][1];
    for (var bi = 0; bi < 4; bi++) {
      var bt = (t * 2.8 + bi * 0.25 + pi * 0.5) % 1;
      var bx = px - 12 + ((bi * 9 + pi * 5) % 24);
      var by = py - 3 + ((bi * 5) % 7);
      if (bt < 0.7) E(c, bx, by, 1.5 + bt * 1.5, 1 + bt, '#FEF9C3');
    }
    drawSteamPuff(c, px - 7, py - 8, t + pi * 0.4, 4);
    drawSteamPuff(c, px + 5, py - 10, t * 1.15 + pi * 0.8, 4);
  }

  // 4. Quầng sáng ấm của 2 đèn đỏ bàn thờ Ông Địa
  c.save();
  c.globalAlpha = 0.22 + Math.sin(t * 3) * 0.05;
  E(c, 128, 420, 18, 12, '#EF4444');
  c.restore();

  // 5. Vẽ tô phở ĐỘNG trên mặt 14 bàn (chỉ hiện tô đầy khi EATING, tô rỗng khi NEEDS_CLEAR!)
  for (var si = 0; si < seats.length; si++) {
    var s = seats[si];
    if (s.state === 'EATING') {
      drawDynamicPhoBowl(c, s.bowlX, s.bowlY, 'FULL', t);
    } else if (s.state === 'NEEDS_CLEAR') {
      drawDynamicPhoBowl(c, s.bowlX, s.bowlY, 'EMPTY_DIRTY', t);
    }
  }

  // 6. Y-Sorting toàn bộ nhân vật (Khách ngồi + 2 Nhân viên phục vụ + Khách vào/ra + Chú Heo 1:1)
  var drawList = [];
  for (var sj = 0; sj < seats.length; sj++) {
    if (seats[sj].state === 'WAITING_FOOD' || seats[sj].state === 'EATING') {
      (function(st) { drawList.push({ y: st.seatY, fn: function() { drawSeatedPhoGuest(c, st, t); } }); })(seats[sj]);
    }
  }
  for (var wi = 0; wi < waiters.length; wi++) {
    (function(w) { drawList.push({ y: w.y, fn: function() { drawPhoWaiter(c, w, t); } }); })(waiters[wi]);
  }
  for (var gi = 0; gi < walkGuests.length; gi++) {
    (function(wg) { drawList.push({ y: wg.y, fn: function() { drawWalkingPhoGuest(c, wg, t); } }); })(walkGuests[gi]);
  }
  if (pigState && drawPigFn) {
    drawList.push({ y: pigState.y, fn: drawPigFn });
  }
  drawList.sort(function(a, b) { return a.y - b.y; });
  for (var di = 0; di < drawList.length; di++) drawList[di].fn();

  // 7. Hiệu ứng đặc biệt khi Chú Heo thưởng thức phở tại Bàn Phở Đặc Biệt (tim hồng + khói bay)
  if (pigState && pigState.action === 'eat_snack') {
    var hx = Math.round(pigState.x), hy = Math.round(pigState.y - 26);
    var lift = Math.round(((t * 14) % 12));
    c.save();
    c.globalAlpha = Math.max(0.2, 1 - lift / 14);
    R(c, hx - 2, hy - lift, 2, 2, '#F43F5E');
    R(c, hx + 1, hy - lift, 2, 2, '#F43F5E');
    R(c, hx - 1, hy + 1 - lift, 3, 2, '#F43F5E');
    R(c, hx, hy + 3 - lift, 1, 1, '#F43F5E');
    c.restore();
    drawSteamPuff(c, hx + 10, hy + 8, t * 1.4, 2);
  }
}
`;
}
