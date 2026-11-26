/**
 * Đồ họa Quán Cà Phê Sài Gòn Mini Workshop, Thư Viện 3 Kệ Sách & Góc Boutique Quần Áo (720×176 — Quyết định 218)
 */
export function buildCafeInteriorArtScript(): string {
  return `
function drawPhinCup(c, x, y) {
  R(c, x, y + 3, 5, 5, INK);
  R(c, x + 1, y + 4, 3, 3, '#6F4E37');
  R(c, x + 1, y + 6, 3, 1, '#FFF8E7'); // sữa đặc đáy ly
  R(c, x, y, 5, 3, INK);
  R(c, x + 1, y + 1, 3, 2, '#CBD5E1'); // phin nhôm
  R(c, x - 1, y, 7, 1, '#94A3B8'); // nắp phin
}

function drawPottedPlant(c, x, y, type) {
  R(c, x + 2, y + 10, 8, 7, INK);
  R(c, x + 3, y + 11, 6, 5, '#C4603A');
  R(c, x + 1, y + 9, 10, 2, INK);
  R(c, x + 2, y + 10, 8, 1, '#D97B54');
  if (type === 'tall') {
    R(c, x + 5, y + 2, 2, 8, '#5C381E');
    E(c, x + 6, y + 2, 6, 4, INK); E(c, x + 6, y + 2, 5, 3, '#2E7D32');
    E(c, x + 3, y + 5, 4, 3, '#388E3C'); E(c, x + 9, y + 5, 4, 3, '#43A047');
    R(c, x + 4, y + 1, 2, 1, '#81C784');
  } else {
    E(c, x + 6, y + 6, 6, 4, INK); E(c, x + 6, y + 6, 5, 3, '#2E7D32');
    E(c, x + 3, y + 7, 3, 2, '#43A047'); E(c, x + 9, y + 7, 3, 2, '#66BB6A');
  }
}

function drawCafePerson(c, px, py, o) {
  o = o || {};
  var sit = !!o.sit;
  var shirt = o.shirt || '#FFFBF1';
  var pants = o.pants || '#334155';
  var hair = o.hair || '#2B2118';
  var skin = '#F6CBA2';
  E(c, px + 4, py, 5, 2, 'rgba(43,33,24,0.24)');
  var by = sit ? (py - 12) : (py - 14);
  if (!sit) {
    R(c, px + 1, py - 6, 3, 5, INK); R(c, px + 2, py - 5, 1, 4, pants);
    R(c, px + 5, py - 6, 3, 5, INK); R(c, px + 6, py - 5, 1, 4, pants);
  } else {
    R(c, px, py - 5, 8, 4, INK); R(c, px + 1, py - 4, 6, 3, pants);
  }
  R(c, px - 1, by, 10, 8, INK);
  R(c, px, by + 1, 8, 6, shirt);
  R(c, px, by + 1, 2, 5, 'rgba(255,255,255,0.2)');
  if (o.apron) {
    R(c, px + 1, by + 3, 6, 4, o.apron);
    R(c, px + 2, by + 1, 1, 2, o.apron);
    R(c, px + 5, by + 1, 1, 2, o.apron);
  }
  var armY = o.working ? (by + 2 - (o.frame ? 1 : 0)) : (by + 2);
  R(c, px - 2, armY, 2, 4, INK); R(c, px - 1, armY, 1, 3, skin);
  R(c, px + 8, by + 2 + (o.working && o.frame ? -1 : 0), 2, 4, INK); R(c, px + 8, by + 2, 1, 3, skin);
  var hy = by - 7;
  R(c, px, hy, 8, 7, INK); R(c, px + 1, hy + 1, 6, 5, skin);
  R(c, px + 2, hy + 3, 1, 1, INK); R(c, px + 5, hy + 3, 1, 1, INK);
  R(c, px + 1, hy + 4, 1, 1, '#F29AB0'); R(c, px + 6, hy + 4, 1, 1, '#F29AB0');
  if (o.hat === 'barista') {
    R(c, px, hy - 1, 8, 2, INK); R(c, px + 1, hy, 6, 1, '#5C381E');
  } else if (o.hat === 'bun') {
    R(c, px + 1, hy, 6, 2, hair); R(c, px + 2, hy - 2, 4, 2, hair);
  } else {
    R(c, px + 1, hy, 6, 2, hair); R(c, px, hy + 1, 1, 3, hair); R(c, px + 7, hy + 1, 1, 3, hair);
  }
  if (o.book) {
    R(c, px + 2, by + 3, 5, 4, INK); R(c, px + 3, by + 4, 3, 2, '#FFFBF1');
  }
}

function drawIndochineFloor(x, WORLD_W, WORLD_H) {
  for (var tx = 0; tx < WORLD_W; tx += 16) {
    for (var ty = 94; ty < WORLD_H; ty += 16) {
      R(x, tx, ty, 16, 16, '#F7EED8');
      R(x, tx, ty, 16, 1, 'rgba(92,56,30,0.18)');
      R(x, tx, ty, 1, 16, 'rgba(92,56,30,0.18)');
      var cx = tx + 8, cy = ty + 8;
      var accent = (((tx / 16) + (ty / 16)) % 2 === 0) ? '#4A8A80' : '#C4603A';
      R(x, cx - 2, cy - 2, 4, 4, accent);
      R(x, cx - 1, cy - 1, 2, 2, '#F7EED8');
      R(x, cx - 5, cy - 1, 3, 2, accent); R(x, cx + 2, cy - 1, 3, 2, accent);
      R(x, cx - 1, cy - 5, 2, 3, accent); R(x, cx - 1, cy + 2, 2, 3, accent);
      R(x, tx + 2, ty + 2, 2, 2, 'rgba(74,138,128,0.45)');
      R(x, tx + 12, ty + 2, 2, 2, 'rgba(74,138,128,0.45)');
      R(x, tx + 2, ty + 12, 2, 2, 'rgba(74,138,128,0.45)');
      R(x, tx + 12, ty + 12, 2, 2, 'rgba(74,138,128,0.45)');
    }
  }
}

function drawCafeBg(x, WORLD_W, WORLD_H, tod) {
  // 1. TRẦN GỖ ẤM & DẦM GỖ NGANG (y: 0..20)
  R(x, 0, 0, WORLD_W, 20, '#6B4226');
  for (var bx = 0; bx < WORLD_W; bx += 48) {
    R(x, bx, 0, 6, 20, '#4E2E18'); R(x, bx + 1, 0, 2, 20, '#855331');
  }
  R(x, 0, 19, WORLD_W, 2, INK);

  // 2. TƯỜNG VỮA KEM ẤM + LAMBRIS GỖ (y: 21..94)
  R(x, 0, 21, WORLD_W, 57, '#F6E8CC');
  R(x, 0, 78, WORLD_W, 16, '#A66E3E');
  R(x, 0, 78, WORLD_W, 2, INK);
  R(x, 0, 93, WORLD_W, 2, INK);
  for (var lx = 0; lx < WORLD_W; lx += 12) R(x, lx, 80, 1, 13, '#7C4D27');

  // 3. SÀN GẠCH BÔNG INDOCHINE 16x16 LIỀN MẠCH (y: 94..176)
  drawIndochineFloor(x, WORLD_W, WORLD_H);

  // =========================================================================
  // KHU 1 (x: 0..136): QUẦY BAR CÀ PHÊ PHIN & GHẾ BAR CAO
  // =========================================================================
  // Bảng phấn menu đen trên tường & kệ ly sứ + chai syrup
  R(x, 12, 28, 44, 24, INK); R(x, 13, 29, 42, 22, '#27272A');
  R(x, 17, 33, 18, 2, '#FEF08A'); R(x, 17, 38, 30, 1, '#E2E8F0'); R(x, 17, 42, 26, 1, '#E2E8F0'); R(x, 17, 46, 22, 1, '#FDBA74');
  // Kệ gỗ treo tường đựng hũ cà phê & ly sứ
  R(x, 62, 34, 62, 3, INK); R(x, 62, 48, 62, 3, INK);
  [66, 76, 86, 98, 108].forEach(function (sx, i) {
    R(x, sx, 26, 6, 8, INK); R(x, sx + 1, 27, 4, 6, ['#DC2626', '#22C55E', '#D97706', '#38BDF8', '#F59E0B'][i]);
    R(x, sx, 41, 6, 7, INK); R(x, sx + 1, 42, 4, 5, '#FFFBF1');
  });
  // Quầy pha chế gỗ chữ L + Máy Espresso + Dãy 4 Phin Cà Phê Nhôm
  R(x, 6, 72, 120, 34, INK); R(x, 7, 73, 118, 8, '#E6C28B'); R(x, 7, 81, 118, 24, '#8C5832');
  for (var wx = 18; wx < 120; wx += 14) R(x, wx, 82, 1, 22, '#5C381E');
  // Máy espresso inox
  R(x, 14, 58, 20, 16, INK); R(x, 15, 59, 18, 14, '#CBD5E1'); R(x, 17, 61, 14, 4, '#334155'); R(x, 19, 67, 10, 5, '#1E293B');
  // 4 Ly cà phê phin nhôm đang nhỏ giọt trên mặt quầy
  drawPhinCup(x, 42, 66); drawPhinCup(x, 54, 66); drawPhinCup(x, 82, 66); drawPhinCup(x, 94, 66);
  // Tủ bánh ngọt nhỏ bên phải quầy
  R(x, 106, 60, 18, 14, INK); R(x, 107, 61, 16, 12, '#E0F2FE');
  R(x, 109, 67, 5, 4, '#F59E0B'); R(x, 116, 67, 5, 4, '#EC4899');
  // 2 Ghế bar cao & 1 khách đang ngồi tận hưởng cà phê phin
  [30, 86].forEach(function (gx) {
    R(x, gx, 108, 10, 3, INK); R(x, gx + 1, 109, 8, 1, '#C4603A');
    R(x, gx + 4, 111, 2, 9, INK); R(x, gx + 2, 119, 6, 2, INK);
  });
  drawCafePerson(x, 87, 114, { shirt: '#38BDF8', pants: '#1E293B', sit: true, hair: '#5C381E' });

  // =========================================================================
  // KHU 2 (x: 136..276): BÀN TRUNG TÂM HEO & HEO AI + TRANH SÀI GÒN
  // =========================================================================
  R(x, 156, 30, 26, 20, INK); R(x, 157, 31, 24, 18, '#FFF8E7'); R(x, 161, 35, 16, 10, '#F59E0B'); R(x, 165, 39, 8, 6, '#C4603A');
  R(x, 194, 28, 36, 22, INK); R(x, 195, 29, 34, 20, '#E0F2FE'); R(x, 206, 33, 12, 14, '#D99B38'); // tranh Chợ Bến Thành
  drawPottedPlant(x, 140, 80, 'tall');
  // Bàn gỗ trung tâm Heo & Heo AI ngồi trò chuyện
  R(x, 192, 108, 34, 16, INK); R(x, 193, 109, 32, 8, '#E6C28B'); R(x, 193, 117, 32, 6, '#8C5832');
  R(x, 196, 124, 3, 6, INK); R(x, 219, 124, 3, 6, INK);
  drawPhinCup(x, 198, 104); drawPhinCup(x, 214, 104);

  // =========================================================================
  // KHU 3 (x: 276..412): THƯ VIỆN 3 KỆ SÁCH CAO KỊCH TRẦN + SOFA ẤM CÚNG
  // =========================================================================
  var bookCols = ['#DC2626', '#2563EB', '#16A34A', '#D97706', '#9333EA', '#EC4899', '#0EA5E9', '#F59E0B'];
  [278, 322, 366].forEach(function (kx, ki) {
    R(x, kx, 24, 40, 68, INK); R(x, kx + 1, 25, 38, 66, '#5C381E');
    for (var sy = 36; sy <= 78; sy += 14) {
      R(x, kx + 2, sy, 36, 2, '#A66E3E');
      for (var bx2 = kx + 3; bx2 < kx + 36; bx2 += 5) {
        var bh = 8 + ((bx2 + sy + ki) % 4);
        R(x, bx2, sy - bh, 4, bh, bookCols[(bx2 + sy) % bookCols.length]);
        R(x, bx2 + 1, sy - bh + 1, 1, bh - 2, 'rgba(255,255,255,0.22)');
      }
    }
  });
  // Chậu trầu bà rủ trên nóc tủ sách
  E(x, 342, 23, 8, 3, '#2E7D32'); R(x, 336, 24, 2, 10, '#43A047'); R(x, 346, 24, 2, 8, '#66BB6A');
  // Sofa băng dài kem ấm + bàn trà thấp + 2 khách đang đọc sách & uống cà phê
  R(x, 286, 98, 64, 18, INK); R(x, 287, 99, 62, 9, '#E8D5B5'); R(x, 287, 108, 62, 7, '#C9A87C');
  R(x, 284, 102, 5, 14, INK); R(x, 347, 102, 5, 14, INK);
  drawCafePerson(x, 298, 112, { shirt: '#F472B6', pants: '#334155', sit: true, hat: 'bun', book: true });
  drawCafePerson(x, 328, 112, { shirt: '#10B981', pants: '#1E293B', sit: true });
  // Bàn trà gỗ nhỏ trước sofa
  R(x, 300, 118, 36, 11, INK); R(x, 301, 119, 34, 6, '#E6C28B'); R(x, 301, 125, 34, 3, '#8C5832');
  drawPhinCup(x, 315, 114);
  // Ghế bành đọc sách xanh rêu bên phải thư viện
  R(x, 376, 100, 24, 18, INK); R(x, 377, 101, 22, 16, '#2D6A5B'); R(x, 379, 103, 18, 8, '#3E8A58');
  drawCafePerson(x, 384, 114, { shirt: '#FEF08A', pants: '#1F2937', sit: true, book: true });

  // =========================================================================
  // KHU 4 (x: 412..536): MINI COFFEE WORKSHOP (BÀN GỖ DÀI + PHIN + POUR-OVER)
  // =========================================================================
  // Biển gỗ WORKSHOP PHIN + kệ hũ hạt cà phê rang
  R(x, 434, 26, 78, 13, INK); R(x, 435, 27, 76, 11, '#5C381E');
  R(x, 440, 31, 66, 3, '#FEF08A'); // chữ nổi bảng gỗ workshop
  R(x, 422, 50, 100, 3, INK);
  [428, 444, 460, 476, 492, 508].forEach(function (hx, i) {
    R(x, hx, 41, 8, 9, INK); R(x, hx + 1, 42, 6, 7, '#E0F2FE'); R(x, hx + 1, 45, 6, 4, i % 2 === 0 ? '#5C381E' : '#8C5832');
  });
  drawPottedPlant(x, 414, 80, 'short');
  // Hướng dẫn viên Workshop đứng phía sau bàn dài
  drawCafePerson(x, 468, 106, { shirt: '#FFFBF1', pants: '#1E293B', apron: '#2D6A5B', hat: 'barista' });
  // Bàn gỗ dài Mini Coffee Workshop (x: 428..524, y: 104..122)
  R(x, 428, 104, 96, 18, INK); R(x, 429, 105, 94, 9, '#DFC484'); R(x, 429, 114, 94, 7, '#8C5832');
  R(x, 434, 122, 4, 8, INK); R(x, 514, 122, 4, 8, INK);
  // Dụng cụ Workshop trên bàn: 3 bộ phin nhôm, ấm cổ ngỗng pour-over & cân tiểu ly
  drawPhinCup(x, 438, 100); drawPhinCup(x, 468, 100); drawPhinCup(x, 500, 100);
  R(x, 452, 101, 8, 6, INK); R(x, 453, 102, 6, 4, '#334155'); R(x, 460, 102, 3, 2, '#94A3B8'); // ấm cổ ngỗng
  R(x, 484, 103, 9, 4, INK); R(x, 485, 104, 7, 2, '#18181B'); // cân tiểu ly
  // 2 Học viên ngồi thưởng thức & thực hành pha phin
  drawCafePerson(x, 444, 128, { shirt: '#F97316', pants: '#334155', sit: true });
  drawCafePerson(x, 496, 128, { shirt: '#6366F1', pants: '#1E293B', sit: true, hat: 'bun' });

  // =========================================================================
  // KHU 5 (x: 536..636): GÓC BOUTIQUE BÁN QUẦN ÁO + CÂY THÔNG NOEL + CÂY XANH
  // =========================================================================
  // Sào gỗ treo quần áo (áo khoác, váy, sơ mi linen, túi tote)
  R(x, 540, 44, 54, 3, INK); R(x, 540, 44, 3, 48, INK); R(x, 591, 44, 3, 48, INK);
  ['#EC4899', '#38BDF8', '#F59E0B', '#FFFBF1', '#2D6A5B'].forEach(function (col, i) {
    var gx = 545 + i * 9;
    R(x, gx, 48, 8, 22, INK); R(x, gx + 1, 49, 6, 20, col); R(x, gx + 3, 46, 2, 2, '#CBD5E1');
  });
  // Kệ gấp áo & túi tote bên dưới sào
  R(x, 542, 74, 48, 18, INK); R(x, 543, 75, 46, 16, '#C8925A');
  R(x, 546, 78, 12, 5, '#FEF08A'); R(x, 562, 78, 12, 5, '#93C5FD'); R(x, 578, 78, 8, 9, '#FFFBF1');
  // Gương soi toàn thân khung gỗ
  R(x, 596, 40, 14, 52, INK); R(x, 597, 41, 12, 50, '#DCEEFA'); R(x, 599, 45, 3, 18, '#FFFFFF');
  // 2 Khách đứng lựa quần áo Boutique
  drawCafePerson(x, 554, 108, { shirt: '#A855F7', pants: '#1E293B', hat: 'bun' });
  drawCafePerson(x, 582, 112, { shirt: '#F59E0B', pants: '#334155' });
  // Cây Thông Noel ấm cúng (x: 616..638, y: 40..98)
  R(x, 624, 88, 6, 10, '#5C381E');
  [[0, 626, 628], [4, 622, 632], [10, 618, 636], [18, 615, 639], [28, 612, 642], [38, 610, 644]].forEach(function (tr) {
    R(x, tr[1], 44 + tr[0], tr[2] - tr[1], 10, '#166534');
    R(x, tr[1] + 2, 46 + tr[0], Math.max(2, tr[2] - tr[1] - 4), 6, '#22C55E');
  });
  R(x, 625, 39, 4, 4, '#FACC15'); // ngôi sao đỉnh cây thông

  // =========================================================================
  // KHU 6 (x: 636..720): CỬA KÍNH 3 KHUNG GIỜ RA PHỐ KHÁM PHÁ & CỬA CHÍNH
  // =========================================================================
  var skyCol = tod === 'night' ? '#1E293B' : (tod === 'sunset' ? '#FDBA74' : '#93C5FD');
  // Cửa sổ kính lớn nhìn ra phố Sài Gòn
  R(x, 646, 26, 36, 46, INK); R(x, 647, 27, 34, 44, skyCol);
  R(x, 650, 52, 12, 18, '#D99B38'); R(x, 664, 46, 14, 24, '#C4603A');
  R(x, 647, 48, 34, 2, INK); R(x, 663, 27, 2, 44, INK);
  // Quầy bàn dài ngắm phố sát cửa sổ + 1 khách đang uống cà phê
  R(x, 646, 74, 36, 16, INK); R(x, 647, 75, 34, 6, '#E6C28B'); R(x, 647, 81, 34, 8, '#8C5832');
  drawPhinCup(x, 660, 70);
  drawCafePerson(x, 658, 96, { shirt: '#EF4444', pants: '#1E293B', sit: true });

  // Cửa Chính gỗ kính ra phố Khám phá (x: 688..716)
  R(x, 688, 28, 28, 66, INK); R(x, 689, 29, 26, 64, '#8C5832');
  R(x, 692, 32, 20, 34, skyCol); R(x, 694, 36, 6, 14, 'rgba(255,255,255,0.28)');
  R(x, 710, 68, 3, 5, '#FACC15'); // tay nắm đồng
  R(x, 690, 96, 24, 6, '#9E2A2B'); R(x, 694, 98, 16, 2, '#F4B93B'); // thảm chào cửa
  drawPottedPlant(x, 636, 82, 'short');
}

// LỚP BÀN GHẾ TIỀN CẢNH Y-SORTED (y: 146..172) ĐA DẠNG BÀN TRÒN, BÀN LAPTOP & CÂY XANH
function drawCafeFgTables(x) {
  // Bàn tròn mặt đá tiền cảnh trái (x: 132..172) + 2 khách ngồi tận hưởng ly cà phê
  drawCafePerson(x, 126, 158, { shirt: '#EC4899', pants: '#1E293B', sit: true, hat: 'bun' });
  drawCafePerson(x, 166, 158, { shirt: '#38BDF8', pants: '#334155', sit: true });
  E(x, 150, 152, 14, 7, INK); E(x, 150, 152, 13, 6, '#FFFBF1'); E(x, 150, 154, 11, 4, '#E2E8F0');
  R(x, 148, 159, 4, 8, INK);
  drawPhinCup(x, 143, 146); drawPhinCup(x, 153, 146);

  // Bàn đôi gỗ + Laptop tiền cảnh giữa (x: 330..378) + khách làm việc
  drawCafePerson(x, 326, 158, { shirt: '#22C55E', pants: '#1E293B', sit: true });
  R(x, 338, 146, 36, 14, INK); R(x, 339, 147, 34, 8, '#E6C28B'); R(x, 339, 155, 34, 4, '#8C5832');
  R(x, 342, 160, 3, 7, INK); R(x, 367, 160, 3, 7, INK);
  R(x, 346, 143, 10, 7, INK); R(x, 347, 144, 8, 5, '#38BDF8'); // laptop
  drawPhinCup(x, 362, 143);

  // Bàn tròn nhỏ tiền cảnh phải (x: 556..592) + chậu cây xanh
  drawCafePerson(x, 550, 158, { shirt: '#F59E0B', pants: '#1F2937', sit: true });
  E(x, 572, 152, 12, 6, INK); E(x, 572, 152, 11, 5, '#E6C28B');
  R(x, 570, 158, 4, 8, INK);
  drawPhinCup(x, 569, 146);
  drawPottedPlant(x, 608, 148, 'tall');
}

// HOẠT CẢNH SỐNG 60FPS: BARISTA ĐANG LÀM VIỆC, 3 QUẠT TRẦN QUAY, ĐÈN CÂY THÔNG & KHÓI CÀ PHÊ PHIN
function drawCafeLiveEffects(x, t, tod) {
  // 1. Barista mặc tạp dề đang làm việc sau quầy pha chế (tay nhún nhịp pha phin)
  drawCafePerson(x, 60, 78, { shirt: '#FFFBF1', pants: '#1E293B', apron: '#5C381E', hat: 'barista', working: true, frame: ((t * 3) | 0) & 1 });

  // 2. 3 Quạt trần gỗ quay mượt 60fps
  [180, 390, 580].forEach(function (fx, idx) {
    R(x, fx, 14, 2, 10, INK);
    var sp = Math.max(3, Math.round(Math.abs(Math.sin(t * 7 + idx * 1.4)) * 16));
    R(x, fx - sp, 23, sp * 2 + 2, 3, INK);
    R(x, fx - sp + 1, 24, sp * 2, 1, '#C8925A');
    R(x, fx - 2, 22, 6, 4, '#F5CA72');
  });

  // 3. Ánh sáng ấm dây đèn trần & Đèn LED Cây Thông Noel nhấp nháy
  x.save();
  x.globalAlpha = (tod === 'night' ? 0.34 : 0.18) + Math.sin(t * 3) * 0.04;
  [64, 208, 340, 474, 594].forEach(function (lx) {
    E(x, lx, 28, 14, 10, '#FFE08A');
  });
  x.restore();
  [[624, 56], [630, 64], [620, 72], [632, 78], [626, 84]].forEach(function (pt, i) {
    var on = (((t * 2.5 + i) | 0) % 2) === 0;
    R(x, pt[0], pt[1], 2, 2, on ? ['#EF4444', '#FACC15', '#38BDF8', '#EC4899', '#FEF08A'][i] : '#166534');
  });

  // 4. Khói cà phê phin bốc lên từ quầy Bar, Bàn Heo AI, Workshop & Bàn tiền cảnh
  [[44, 65], [84, 65], [200, 103], [216, 103], [440, 99], [470, 99], [145, 145], [364, 142]].forEach(function (pt) {
    for (var i = 0; i < 2; i++) {
      var p = ((t * 0.8 + i * 0.5) % 1);
      var sy = pt[1] - Math.round(p * 9);
      var sx = pt[0] + Math.round(Math.sin(t * 3.5 + i * 2) * 1.2);
      x.save(); x.globalAlpha = 0.65 * (1 - p); R(x, sx, sy, 2, 2, '#FFFBF1'); x.restore();
    }
  });
}
`;
}
