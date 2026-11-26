/**
 * Đồ họa Pixel Art Quán Phở Cổ Truyền Việt Nam Toàn Màn Hình (640 × 440 — Quyết định 225)
 * Tuân thủ 100% docs/VIETNAM_PIXEL_ART_BIBLE.md & tái sử dụng vnPixelArtKit.ts:
 *  - Khóa lưới integer 1px, bảng màu vật liệu Việt Nam OKLab (VN_MAT)
 *  - Sàn gạch bông Indochine 16×16, tường vàng vôi phố cổ ốp gạch men trắng
 *  - 1 Đầu bếp nấu phở, 2 nồi nước dùng inox sôi sùng sục + khói nghi ngút, tủ kính thịt bò tươi & rổ bánh phở dai giòn
 *  - 2 Nhân viên phục vụ bưng tô phở, 8 bàn inox đầy đủ gia vị Việt Nam, ~14 khách ngồi ăn + 4 khách vào ra
 *  - 3 Quạt trần quay 60fps, góc trà đá quẩy nóng, quầy thu ngân & bàn thờ Ông Địa đèn đỏ
 */
export function buildPhoInteriorArtScript(): string {
  return `
function drawPhoTableSet(c, tx, ty, isSpecial) {
  // Bóng bàn inox dưới sàn gạch bông
  R(c, tx + 3, ty + 32, 76, 5, 'rgba(43,33,24,0.22)');
  // 4 Ghế nhựa xanh/đỏ Việt Nam xếp quanh bàn (2 trên, 2 dưới)
  var chairs = [
    [tx + 12, ty - 11, VN_MAT.plasticChair.blue],
    [tx + 52, ty - 11, VN_MAT.plasticChair.red],
    [tx + 12, ty + 33, VN_MAT.plasticChair.red],
    [tx + 52, ty + 33, VN_MAT.plasticChair.blue]
  ];
  for (var ci = 0; ci < chairs.length; ci++) {
    var ch = chairs[ci];
    R(c, ch[0], ch[1], 16, 11, VN_MAT.ink);
    R(c, ch[0] + 1, ch[1] + 1, 14, 9, ch[2]);
    R(c, ch[0] + 2, ch[1] + 2, 12, 2, 'rgba(255,255,255,0.28)');
  }
  // Mặt bàn inox sáng bóng (82 × 32)
  R(c, tx, ty, 82, 32, VN_MAT.ink);
  R(c, tx + 1, ty + 1, 80, 30, VN_MAT.inox.mid);
  R(c, tx + 2, ty + 2, 78, 4, VN_MAT.inox.hi); // Ánh phản sáng inox
  R(c, tx + 2, ty + 27, 78, 3, VN_MAT.inox.sh);
  // Chân bàn inox
  R(c, tx + 4, ty + 31, 4, 4, VN_MAT.inox.dk);
  R(c, tx + 74, ty + 31, 4, 4, VN_MAT.inox.dk);

  // Bộ gia vị Phở Việt Nam đặt giữa bàn:
  // Giỏ đũa muỗng inox
  R(c, tx + 34, ty + 6, 8, 9, VN_MAT.ink);
  R(c, tx + 35, ty + 7, 6, 7, VN_MAT.inox.hi);
  R(c, tx + 36, ty + 4, 1, 4, '#8A5634'); R(c, tx + 38, ty + 4, 1, 4, '#8A5634'); R(c, tx + 40, ty + 5, 1, 3, '#CBD5E1');
  // Chai tương ớt đỏ & tương đen
  R(c, tx + 44, ty + 7, 4, 8, VN_MAT.ink); R(c, tx + 45, ty + 8, 2, 6, '#DC2626');
  R(c, tx + 49, ty + 7, 4, 8, VN_MAT.ink); R(c, tx + 50, ty + 8, 2, 6, '#3B2314');
  // Hũ giấm tỏi ớt ngâm trắng
  R(c, tx + 27, ty + 9, 6, 6, VN_MAT.ink); R(c, tx + 28, ty + 10, 4, 4, '#FFF8E6'); R(c, tx + 29, ty + 12, 2, 1, '#EF4444');
  // Rổ rau quế, ngò gai & giá trụng xanh tươi
  E(c, tx + 41, ty + 22, 8, 5, VN_MAT.ink);
  E(c, tx + 41, ty + 22, 7, 4, '#2E7D32');
  R(c, tx + 37, ty + 20, 4, 3, '#4CAF50'); R(c, tx + 42, ty + 21, 4, 2, '#86EFAC');
  // Hộp khăn giấy xanh & đĩa chanh ớt
  R(c, tx + 55, ty + 19, 10, 7, VN_MAT.ink); R(c, tx + 56, ty + 20, 8, 5, '#38BDF8'); R(c, tx + 58, ty + 21, 4, 2, '#FFFFFF');
  E(c, tx + 28, ty + 22, 4, 3, '#FFFFFF'); R(c, tx + 27, ty + 21, 2, 2, '#84CC16'); R(c, tx + 30, ty + 22, 2, 1, '#EF4444');

  // 2 Tô phở nóng đặt 2 đầu bàn
  var bowls = [[tx + 12, ty + 14], [tx + 68, ty + 14]];
  for (var bi = 0; bi < bowls.length; bi++) {
    var bx = bowls[bi][0], by = bowls[bi][1];
    E(c, bx, by, 7, 5, VN_MAT.ink);
    E(c, bx, by, 6, 4, '#FFFFFF');
    E(c, bx, by, 5, 3, '#D9A756'); // Nước dùng vàng trong
    R(c, bx - 3, by - 1, 3, 2, '#9E3828'); // Thịt bò tái nạm
    R(c, bx + 1, by - 1, 2, 2, '#FFFDF7'); // Sợi bánh phở trắng
    R(c, bx - 1, by + 1, 3, 1, '#22C55E'); // Hành lá xanh
  }

  // Nếu là Bàn Phở Đặc Biệt dành cho chú Heo -> gắn thêm đĩa quẩy nóng & viền vàng đánh dấu nhẹ
  if (isSpecial) {
    E(c, tx + 16, ty + 25, 6, 3, '#FFFFFF');
    R(c, tx + 12, ty + 24, 8, 2, '#D97706');
    R(c, tx + 13, ty + 23, 6, 1, '#FBBF24');
  }
}

function drawPhoStaticBg(c) {
  // 1. Sàn gạch bông Indochine 16×16 phủ liền mạch toàn quán (640×440)
  drawTileFloorIndochine(c, 0, 64, 640, 376);

  // 2. Tường vàng vôi phố cổ (y: 0..64) + ốp gạch men trắng bóng nửa dưới (y: 38..64)
  R(c, 0, 0, 640, 38, VN_MAT.wallYellow.mid);
  R(c, 0, 0, 640, 5, VN_MAT.woodLim.mid); // Dầm gỗ trần
  R(c, 0, 38, 640, 26, '#F1F5F9'); // Ốp gạch men trắng sạch sẽ
  R(c, 0, 38, 640, 2, '#38BDF8');  // Đường viền gạch xanh cổ điển
  for (var wx = 0; wx < 640; wx += 16) R(c, wx, 40, 1, 24, 'rgba(148,163,184,0.35)');
  R(c, 0, 52, 640, 1, 'rgba(148,163,184,0.35)');
  R(c, 0, 64, 640, 2, VN_MAT.ink);

  // Tường bao 2 bên trái/phải
  R(c, 0, 0, 14, 440, VN_MAT.wallYellow.sh); R(c, 14, 0, 2, 440, VN_MAT.ink);
  R(c, 626, 0, 14, 440, VN_MAT.wallYellow.sh); R(c, 624, 0, 2, 440, VN_MAT.ink);

  // 3. Bảng giá đỏ viền vàng "PHO BO GIA TRUYEN" treo chính giữa tường (x: 196..444, y: 9..36)
  R(c, 196, 9, 248, 27, VN_MAT.ink);
  R(c, 198, 11, 244, 23, '#C92A22');
  R(c, 200, 13, 240, 19, '#B8221B');
  R(c, 200, 13, 240, 1, '#F4B93B'); R(c, 200, 31, 240, 1, '#F4B93B');
  // Dòng chữ vàng nổi bật (pixel typography)
  R(c, 224, 16, 192, 4, '#FFE57F');
  R(c, 244, 23, 152, 3, '#FFF8E6');
  // Lịch bloc đỏ treo tường bên trái (x: 132, y: 12) & Đồng hồ tròn (x: 82, y: 20)
  R(c, 132, 12, 22, 24, VN_MAT.ink);
  R(c, 133, 13, 20, 10, '#DC2626');
  R(c, 134, 23, 18, 12, '#FFFDF7'); R(c, 139, 26, 8, 6, '#DC2626');
  E(c, 82, 22, 11, 11, VN_MAT.ink); E(c, 82, 22, 9, 9, '#FFFDF7');
  R(c, 82, 16, 1, 6, VN_MAT.ink); R(c, 82, 22, 5, 1, '#DC2626');
  // Tranh phố cổ khung gỗ bên phải (x: 478, y: 11)
  R(c, 478, 11, 56, 24, VN_MAT.ink); R(c, 480, 13, 52, 20, '#FDE68A');
  R(c, 484, 21, 18, 10, '#C4452C'); R(c, 504, 18, 22, 13, '#D97706');

  // 4. KHU BẾP PHỞ MẶT TIỀN (x: 24..468, y: 66..148)
  // Mặt sàn khu bếp lót gạch chống trượt xám sáng
  R(c, 24, 66, 444, 80, '#E2E8F0');
  // Bàn bếp inox dài ngăn cách sảnh ăn
  R(c, 24, 120, 444, 28, VN_MAT.ink);
  R(c, 26, 122, 440, 24, VN_MAT.inox.mid);
  R(c, 26, 122, 440, 4, VN_MAT.inox.hi);
  R(c, 26, 142, 440, 4, VN_MAT.inox.sh);
  R(c, 24, 148, 444, 5, 'rgba(43,33,24,0.22)');

  // Tủ kính Phở truyền thống bên trái (x: 34..186, y: 74..136)
  R(c, 34, 74, 152, 56, VN_MAT.ink);
  R(c, 36, 76, 148, 52, '#E0F2FE'); // Kính sáng sạch sẽ
  R(c, 36, 76, 148, 5, '#C92A22');  // Viền decal đỏ đầu tủ phở
  R(c, 36, 103, 148, 3, VN_MAT.inox.dk); // Kệ ngăn giữa tủ kính
  // Thịt bò tươi mới treo móc trên kệ trên (tái đỏ tươi, nạm, gầu mỡ vàng)
  var meats = [
    [46, 84, 16, 16, '#B91C1C', '#FCA5A5'],
    [70, 84, 18, 16, '#991B1B', '#FDE68A'], // Gầu mỡ vàng
    [96, 84, 16, 15, '#DC2626', '#FECACA'], // Thịt tái đỏ tươi
    [120, 86, 16, 13, '#7C2D12', '#FDBA74'] // Nạm bò
  ];
  for (var mi = 0; mi < meats.length; mi++) {
    var mt = meats[mi];
    R(c, mt[0] + 6, 81, 2, 4, '#475569'); // Móc inox
    R(c, mt[0], mt[1], mt[2], mt[3], VN_MAT.ink);
    R(c, mt[0] + 1, mt[1] + 1, mt[2] - 2, mt[3] - 2, mt[4]);
    R(c, mt[0] + 3, mt[1] + 3, 5, 4, mt[5]); // Vân thịt/gầu tươi
  }
  // Bò viên & hành lá thái xanh ở kệ dưới
  E(c, 58, 116, 14, 7, '#FFFFFF');
  for (var bvi = 0; bvi < 5; bvi++) E(c, 50 + bvi * 4, 115 + (bvi % 2) * 2, 3, 2.5, '#78350F');
  R(c, 82, 110, 36, 13, VN_MAT.ink); R(c, 83, 111, 34, 11, '#22C55E'); R(c, 86, 113, 28, 4, '#86EFAC'); // Khay hành lá ngò rí
  // Rổ bánh phở / bún trắng muốt dai giòn (x: 126..178, y: 108..126)
  R(c, 126, 109, 50, 16, VN_MAT.ink);
  R(c, 127, 110, 48, 14, '#D97706'); // Rổ tre đan
  R(c, 130, 108, 42, 12, '#FFFFFF'); // Núi sợi bánh phở trắng muốt
  for (var ny = 110; ny <= 118; ny += 2) R(c, 132, ny, 38, 1, '#E2E8F0'); // Gân sợi phở dài dai giòn

  // Thớt gỗ tròn băm thịt bò & dao phay (x: 196..238, y: 106..134)
  E(c, 216, 122, 18, 10, VN_MAT.ink);
  E(c, 216, 121, 16, 8, '#D4A373');
  E(c, 216, 120, 13, 6, '#E6BE8A');
  R(c, 210, 118, 9, 5, '#DC2626'); // Miếng thịt bò tươi trên thớt
  R(c, 222, 115, 11, 5, '#CBD5E1'); R(c, 232, 116, 5, 2, '#6B4226'); // Dao phay inox

  // 2 NỒI NƯỚC DÙNG PHỞ INOX KHỔNG LỒ (Nồi ninh xương & Nồi chan phở — x: 318..452)
  var pots = [
    { cx: 356, cy: 112, r: 26 },
    { cx: 422, cy: 112, r: 26 }
  ];
  for (var pi = 0; pi < pots.length; pi++) {
    var pt = pots[pi];
    // Thân nồi inox tròn lớn
    R(c, pt.cx - pt.r, pt.cy, pt.r * 2, 24, VN_MAT.ink);
    R(c, pt.cx - pt.r + 2, pt.cy + 2, pt.r * 2 - 4, 20, VN_MAT.inox.mid);
    R(c, pt.cx - pt.r + 4, pt.cy + 2, 10, 20, VN_MAT.inox.hi);
    // Miệng nồi & mặt nước dùng vàng óng đậm đà
    E(c, pt.cx, pt.cy, pt.r, 14, VN_MAT.ink);
    E(c, pt.cx, pt.cy, pt.r - 2, 12, VN_MAT.inox.hi);
    E(c, pt.cx, pt.cy + 1, pt.r - 5, 9, '#C68A2B');
    E(c, pt.cx, pt.cy, pt.r - 8, 7, '#E0A842'); // Mặt nước dùng vàng óng
    // Xương ống & hoa hồi nổi nhẹ
    R(c, pt.cx - 8, pt.cy - 2, 7, 3, '#FEF3C7');
    R(c, pt.cx + 4, pt.cy + 2, 5, 2, '#92400E');
  }

  // 5. GÓC TRÀ ĐÁ, QUẨY NÓNG & TỦ LẠNH NƯỚC NGỌT (x: 496..618, y: 66..148)
  R(c, 496, 112, 120, 34, VN_MAT.ink);
  R(c, 498, 114, 116, 30, VN_MAT.woodLim.mid);
  R(c, 498, 114, 116, 4, VN_MAT.woodLim.hi);
  // Bình trà đá inox có vòi
  R(c, 506, 92, 24, 30, VN_MAT.ink);
  R(c, 508, 94, 20, 26, VN_MAT.inox.mid);
  R(c, 510, 94, 6, 26, VN_MAT.inox.hi);
  R(c, 516, 114, 4, 4, '#2563EB'); // Vòi nước trà đá
  // Rổ quẩy nóng vàng giòn
  E(c, 554, 122, 16, 9, VN_MAT.ink);
  E(c, 554, 122, 14, 7, '#B45309');
  for (var qi = 0; qi < 5; qi++) {
    R(c, 544 + qi * 4, 118 + (qi % 2) * 2, 8, 3, '#F59E0B');
    R(c, 545 + qi * 4, 118 + (qi % 2) * 2, 6, 1, '#FDE68A');
  }
  // Tủ lạnh kính nước ngọt / bia Sài Gòn (x: 580..616, y: 68..142)
  R(c, 580, 68, 36, 74, VN_MAT.ink);
  R(c, 582, 70, 32, 70, '#E0F2FE');
  R(c, 582, 70, 32, 10, '#1D4ED8'); // Header tủ nước ngọt
  for (var sy = 86; sy <= 122; sy += 12) {
    R(c, 584, sy + 8, 28, 2, '#64748B');
    R(c, 586, sy + 2, 4, 6, '#DC2626');
    R(c, 592, sy + 2, 4, 6, '#16A34A');
    R(c, 598, sy + 2, 4, 6, '#F59E0B');
    R(c, 604, sy + 2, 4, 6, '#2563EB');
  }

  // 6. 8 BỘ BÀN INOX RỘNG RÃI (4 trái, 4 phải, lối đi giữa 116px cực thoáng)
  var tables = [
    [48, 190, false], [164, 190, false],
    [48, 282, false], [164, 282, false],
    [392, 190, true], [508, 190, false], // Bàn [392, 190] là Bàn Phở Đặc Biệt cho Heo
    [392, 282, false], [508, 282, false]
  ];
  for (var ti = 0; ti < tables.length; ti++) {
    drawPhoTableSet(c, tables[ti][0], tables[ti][1], tables[ti][2]);
  }

  // 7. QUẦY THU NGÂN & BÀN THỜ ÔNG ĐỊA – THẦN TÀI GÓC TRÁI DƯỚI (x: 24..148, y: 364..424)
  // Quầy thu ngân gỗ
  R(c, 24, 372, 78, 44, VN_MAT.ink);
  R(c, 26, 374, 74, 40, VN_MAT.woodLim.mid);
  R(c, 26, 374, 74, 5, VN_MAT.woodLim.hi);
  R(c, 36, 382, 20, 12, '#334155'); R(c, 38, 384, 16, 7, '#38BDF8'); // Máy tính tiền
  R(c, 66, 384, 14, 10, '#FFF8E6'); // Sổ ghi hóa đơn
  // Bàn thờ Ông Địa – Thần Tài gỗ nâu sáng đèn đỏ ấm cúng (x: 112..148, y: 374..418)
  R(c, 112, 374, 34, 42, VN_MAT.ink);
  R(c, 114, 376, 30, 38, '#7C2D12');
  R(c, 110, 370, 38, 6, '#B91C1C'); // Mái đỏ bàn thờ
  R(c, 116, 382, 26, 26, '#451A03');
  // Tượng Ông Địa & Thần Tài nhỏ + bát hương + 2 đèn đỏ
  R(c, 121, 390, 6, 10, '#FDE68A'); R(c, 131, 390, 6, 10, '#F59E0B');
  R(c, 126, 402, 6, 5, '#D97706'); // Bát hương
  R(c, 117, 386, 3, 5, '#EF4444'); R(c, 138, 386, 3, 5, '#EF4444'); // 2 Đèn đỏ sáng ấm

  // 8. CỬA KÍNH MẶT TIỀN & CỔNG RA ĐẠI LỘ (y: 416..440)
  R(c, 16, 422, 246, 18, VN_MAT.ink); R(c, 18, 424, 242, 12, '#93C5FD'); // Kính mặt tiền trái
  R(c, 378, 422, 246, 18, VN_MAT.ink); R(c, 380, 424, 242, 12, '#93C5FD'); // Kính mặt tiền phải
  // Cổng chính rộng 116px (x: 262..378)
  R(c, 262, 412, 116, 28, '#D6C3A5');
  R(c, 276, 418, 88, 16, '#B91C1C'); // Thảm đỏ chào khách
  R(c, 278, 420, 84, 12, '#DC2626');
  R(c, 294, 424, 52, 4, '#FFE57F'); // Chữ RA PHỐ
  // 2 Chậu cây xanh 2 bên cửa chính
  R(c, 246, 404, 14, 14, '#B45309'); E(c, 253, 399, 10, 8, '#2E7D32');
  R(c, 380, 404, 14, 14, '#B45309'); E(c, 387, 399, 10, 8, '#2E7D32');
}

/* 1 Đầu bếp nấu phở bên trong bếp (chan nước dùng & nhúng vợt bánh phở 60fps) */
function drawPhoChef(c, t) {
  var cx = 278, cy = 114;
  var dip = Math.round(Math.sin(t * 4.5) * 2);
  drawContactShadow(c, cx, cy + 4, 8, 3);
  // Thân áo trắng + tạp dề bếp
  R(c, cx - 6, cy - 12, 12, 14, VN_MAT.ink);
  R(c, cx - 5, cy - 11, 10, 12, '#FFFFFF');
  R(c, cx - 4, cy - 7, 8, 8, '#334155'); // Tạp dề xám đậm
  // Đầu & Mũ đầu bếp trắng
  R(c, cx - 5, cy - 19, 10, 8, VN_MAT.ink);
  R(c, cx - 4, cy - 18, 8, 6, '#FFD5B5');
  R(c, cx - 3, cy - 16, 1, 1, VN_MAT.ink); R(c, cx + 2, cy - 16, 1, 1, VN_MAT.ink);
  R(c, cx - 6, cy - 24, 12, 6, VN_MAT.ink);
  R(c, cx - 5, cy - 23, 10, 4, '#FFFFFF');
  // Tay cầm muôi inox chan nước dùng về phía nồi phở (phải)
  R(c, cx + 6, cy - 9 + dip, 14, 3, '#CBD5E1');
  E(c, cx + 22, cy - 7 + dip, 4, 3, '#F8FAFC');
  // Tay trái cầm vợt trụng bánh phở trắng
  R(c, cx - 14, cy - 9 - dip, 8, 2, '#94A3B8');
  E(c, cx - 16, cy - 7 - dip, 4, 4, '#FFFFFF');
}

/* 2 Nhân viên phục vụ bưng tô phở bốc khói chạy bàn 60fps */
function drawPhoWaiter(c, w, t) {
  var x = Math.round(w.x), y = Math.round(w.y);
  var step = Math.floor(t * 9 + w.phase) % 2;
  drawContactShadow(c, x, y + 1, 6, 2.5);
  // Chân bước đi
  R(c, x - 3, y - 6 + step, 3, 6, '#1E293B');
  R(c, x + 1, y - 6 + (1 - step), 3, 6, '#1E293B');
  // Đồng phục nhân viên quán phở (áo xanh/vàng nhạt + tạp dề đỏ)
  R(c, x - 5, y - 15, 10, 10, VN_MAT.ink);
  R(c, x - 4, y - 14, 8, 8, w.shirt);
  R(c, x - 3, y - 10, 6, 5, '#B91C1C'); // Tạp dề đỏ
  // Đầu & tóc
  R(c, x - 4, y - 21, 8, 6, VN_MAT.ink);
  R(c, x - 3, y - 20, 6, 5, '#FFD5B5');
  R(c, x - 4, y - 22, 8, 3, '#2B2118');
  // Mâm bưng tô phở nóng hổi phía trước
  var trayX = w.dir >= 0 ? x + 4 : x - 14;
  R(c, trayX, y - 12, 11, 2, '#475569');
  E(c, trayX + 5, y - 14, 5, 3, '#FFFFFF');
  R(c, trayX + 3, y - 15, 4, 2, '#D9A756');
  // Khói nhẹ trên tô phở đang bưng
  c.save();
  c.globalAlpha = 0.55;
  R(c, trayX + 4, y - 19 - step, 2, 2, '#FFFFFF');
  c.restore();
}

/* Thực khách ngồi ăn phở xì xụp tại các bàn inox */
function drawSeatedPhoGuest(c, g, t) {
  var x = Math.round(g.x), y = Math.round(g.y);
  var eat = Math.sin(t * 4 + g.phase) > 0.35 ? 1 : 0;
  // Thân áo
  R(c, x - 5, y - 8, 10, 9, VN_MAT.ink);
  R(c, x - 4, y - 7, 8, 7, g.shirt);
  // Đầu & tóc
  R(c, x - 4, y - 14 + eat, 8, 6, VN_MAT.ink);
  R(c, x - 3, y - 13 + eat, 6, 5, '#FFD5B5');
  R(c, x - 4, y - 15 + eat, 8, 3, g.hair);
  // Đũa gắp sợi phở trắng
  if (eat) {
    R(c, x + 3, y - 8, 5, 1, '#8A5634');
    R(c, x + 6, y - 7, 2, 3, '#FFFFFF');
  }
}

/* Khách hàng đi vào / đi ra qua cửa chính 60fps */
function drawWalkingPhoGuest(c, g, t) {
  var x = Math.round(g.x), y = Math.round(g.y);
  var step = Math.floor(t * 8 + g.phase) % 2;
  drawContactShadow(c, x, y + 1, 6, 2.5);
  R(c, x - 3, y - 6 + step, 3, 6, '#334155');
  R(c, x + 1, y - 6 + (1 - step), 3, 6, '#334155');
  R(c, x - 5, y - 15, 10, 10, VN_MAT.ink);
  R(c, x - 4, y - 14, 8, 8, g.shirt);
  R(c, x - 4, y - 21, 8, 6, VN_MAT.ink);
  R(c, x - 3, y - 20, 6, 5, '#FFD5B5');
  R(c, x - 4, y - 22, 8, 3, g.hair);
}

/* 3 Quạt trần cổ điển quay mát mẻ 60fps */
function drawCeilingFan(c, cx, cy, t, phase) {
  var ang = t * 5.2 + phase;
  c.save();
  c.translate(cx, cy);
  c.globalAlpha = 0.42;
  for (var i = 0; i < 3; i++) {
    var a = ang + (i * Math.PI * 2) / 3;
    var bx = Math.round(Math.cos(a) * 22);
    var by = Math.round(Math.sin(a) * 10);
    linePx(c, 0, 0, bx, by, '#4A2C1A');
    linePx(c, 1, 0, bx + 1, by, '#6B4226');
    linePx(c, 0, 1, bx, by + 1, '#6B4226');
  }
  c.globalAlpha = 0.72;
  E(c, 0, 0, 4, 3, '#2B2118');
  E(c, 0, 0, 2.5, 2, '#F4B93B');
  c.restore();
}

function drawPhoLiveEntities(c, t, waiters, seatedGuests, walkGuests, pigState, drawPigFn) {
  // 1. Đầu bếp nấu phở trong bếp
  drawPhoChef(c, t);

  // 2. Nồi phở sôi sùng sục (bong bóng nổi 60fps + khói bốc nghi ngút dày đặc)
  var potCenters = [[356, 112], [422, 112]];
  for (var pi = 0; pi < potCenters.length; pi++) {
    var px = potCenters[pi][0], py = potCenters[pi][1];
    // Bong bóng sôi lăn tăn trên mặt nước dùng
    for (var bi = 0; bi < 4; bi++) {
      var bt = (t * 2.8 + bi * 0.25 + pi * 0.5) % 1;
      var bx = px - 12 + ((bi * 9 + pi * 5) % 24);
      var by = py - 3 + ((bi * 5) % 7);
      if (bt < 0.7) E(c, bx, by, 1.5 + bt * 1.5, 1 + bt, '#FEF9C3');
    }
    // Luồng khói bốc nghi ngút dày đặc bay cao
    drawSteamPuff(c, px - 7, py - 8, t + pi * 0.4, 4);
    drawSteamPuff(c, px + 5, py - 10, t * 1.15 + pi * 0.8, 4);
  }

  // 3. Quầng sáng ấm của 2 đèn đỏ bàn thờ Ông Địa
  c.save();
  c.globalAlpha = 0.22 + Math.sin(t * 3) * 0.05;
  E(c, 128, 392, 18, 12, '#EF4444');
  c.restore();

  // 4. Sắp xếp Y-Sorting toàn bộ nhân vật (Khách ngồi + 2 Nhân viên phục vụ + 4 Khách vào ra + Chú Heo 1:1)
  var drawList = [];
  for (var si = 0; si < seatedGuests.length; si++) {
    (function(g) { drawList.push({ y: g.y, fn: function() { drawSeatedPhoGuest(c, g, t); } }); })(seatedGuests[si]);
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

  // 5. Hiệu ứng đặc biệt khi Chú Heo thưởng thức tô phở tại Bàn Phở Đặc Biệt (tim hồng + khói bay)
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

  // 6. 3 Quạt trần cổ điển quay 60fps mát mẻ ở tầng trần
  drawCeilingFan(c, 150, 210, t, 0);
  drawCeilingFan(c, 320, 240, t, 2.1);
  drawCeilingFan(c, 490, 210, t, 4.2);
}
`;
}
