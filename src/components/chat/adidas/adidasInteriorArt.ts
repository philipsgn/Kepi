/**
 * Đồ họa Pixel Art Cửa Hàng Adidas Hội An Heritage 2 Tầng (640 × 560 — Quyết định 228)
 * Phong cách: Adidas Hội An Heritage Design Art — Dày đặc ~80% không gian, ấm áp, sắc nét từng món đồ:
 *  - Sàn gỗ lim ván dài ấm áp + Lối đi trung tâm lát Gạch Bông Hội An 16×16 + Tường vàng kem phố cổ + 8 Đèn lồng lụa vàng ấm
 *  - Khu Bóng Đá (Thảm cỏ xanh nhân tạo): Giày bóng đá có đinh tán (Predator/F50), Áo đấu có tay + số áo, Giá 6 quả bóng đá
 *  - Khu Chạy Bộ: Giày chạy bộ đế Boost cong khí động học, Áo thun thể thao & Quần Short chạy bộ
 *  - Khu Polo & Apparel: Áo Polo cổ bẻ có trụ nút & 2 tay áo xòe, Áo thun thể thao, Quần Jogger 3 sọc tách rõ 2 ống quần
 *  - Khu Originals & Phụ Kiện: Superstar/Samba/Gazelle, Dép Adilette 3 sọc, Balo 3 sọc, Mũ lưỡi trai, Chồng hộp giày & 7 Mannequin dáng đẹp
 */
export function buildAdidasInteriorArtScript(): string {
  return `
/* Khuôn mặt người pixel chi tiết chuẩn (mắt sáng trắng, má hồng, miệng, 4 kiểu tóc) */
function drawAdidasHumanFace(c, cx, cy, opt) {
  var skin = (opt && opt.skin) || '#FFD5B5';
  var hair = (opt && opt.hair) || '#1E242E';
  var hairStyle = (opt && opt.hairStyle) || 0;
  var faceDir = (opt && opt.faceDir) || 0;
  var backView = !!(opt && opt.backView);

  R(c, cx - 5, cy - 5, 10, 9, VN_MAT.ink);
  R(c, cx - 4, cy - 4, 8, 7, skin);
  R(c, cx - 4, cy + 2, 8, 1, '#EAB38F');
  if (backView) {
    R(c, cx - 4, cy - 4, 8, 6, hair);
    if (hairStyle === 1) E(c, cx, cy - 5, 3, 2.5, hair);
    return;
  }
  var sh = faceDir < 0 ? -1 : (faceDir > 0 ? 1 : 0);
  var lx = cx - 3 + sh, rx = cx + 1 + sh;
  R(c, lx, cy - 1, 2, 2, VN_MAT.ink); R(c, lx, cy - 1, 1, 1, '#FFFFFF');
  R(c, rx, cy - 1, 2, 2, VN_MAT.ink); R(c, rx, cy - 1, 1, 1, '#FFFFFF');
  R(c, lx - 1, cy + 1, 1, 1, '#F596A8'); R(c, rx + 2, cy + 1, 1, 1, '#F596A8');
  R(c, cx - 1 + sh, cy + 1, 2, 1, '#B84E68');
  R(c, cx - 5, cy - 6, 10, 3, VN_MAT.ink);
  R(c, cx - 4, cy - 5, 8, 2, hair);
  if (hairStyle === 1) {
    E(c, cx, cy - 7, 3, 2, VN_MAT.ink); E(c, cx, cy - 7, 2, 1.5, hair);
    R(c, cx - 4, cy - 3, 1, 4, hair); R(c, cx + 3, cy - 3, 1, 4, hair);
  } else if (hairStyle === 2) {
    R(c, cx - 5, cy - 3, 2, 6, hair); R(c, cx + 3, cy - 3, 2, 6, hair);
  } else if (hairStyle === 3) {
    R(c, cx - 2, cy - 7, 4, 1, hair);
  }
}

/* Sàn gỗ lim ván dài Hội An ấm áp + Lối đi trung tâm lát Gạch Bông Hội An 16×16 */
function drawHoiAnWoodAndTileFloor(c, x0, y0, w, h) {
  R(c, x0, y0, w, h, '#C9A276');
  for (var py = y0; py < y0 + h; py += 8) {
    R(c, x0, py, w, 1, 'rgba(74,44,26,0.22)');
    if (((py - y0) / 8) % 2 === 0) R(c, x0, py + 1, w, 7, '#CFA97E');
    for (var px = x0 + ((py * 7) % 36); px < x0 + w; px += 44) {
      R(c, px, py, 1, 8, 'rgba(74,44,26,0.18)');
    }
  }
  // Dải lối đi trung tâm lát gạch bông Hội An 16×16 nối thẳng cầu thang & cửa chính
  drawTileFloorIndochine(c, 256, y0, 128, h);
  R(c, 255, y0, 2, h, '#4A2C1A');
  R(c, 383, y0, 2, h, '#4A2C1A');
}

/* Logo 3 Sọc Performance chuẩn tối giản */
function drawThreeStripesLogo(c, x, y, scale, col) {
  scale = scale || 1;
  R(c, x, y + 6 * scale, 4 * scale, 5 * scale, col);
  R(c, x + 6 * scale, y + 3 * scale, 4 * scale, 8 * scale, col);
  R(c, x + 12 * scale, y, 4 * scale, 11 * scale, col);
}

/* Đèn lồng lụa Hội An treo ấm áp (vàng, đỏ cam, kem) */
function drawHoiAnLantern(c, cx, cy, col, t) {
  R(c, cx, cy - 8, 1, 4, '#2B2118');
  R(c, cx - 2, cy - 4, 5, 2, '#2B2118');
  E(c, cx, cy + 1, 5.5, 5, '#2B2118');
  E(c, cx, cy + 1, 4.5, 4, col);
  R(c, cx - 1, cy - 2, 2, 6, 'rgba(255,255,255,0.35)');
  R(c, cx - 2, cy + 5, 5, 2, '#2B2118');
  R(c, cx, cy + 7, 1, 3, '#F4B93B'); // Tua rua vàng
  if (typeof t === 'number') {
    c.save();
    c.globalAlpha = 0.18 + Math.sin(t * 2.5 + cx) * 0.04;
    E(c, cx, cy + 1, 16, 12, '#FFE08A');
    c.restore();
  }
}

/* ==================== BỘ SPRITE SẢN PHẨM ADIDAS TO RÕ, SẮC NÉT TỪNG MÓN ==================== */

/* 1. Áo Polo Thể Thao (18×19) — Cổ bẻ, trụ nút ngực, 2 tay áo ngắn xòe rõ ràng + 3 sọc vai */
function drawPoloShirt(c, x, y, col, collarCol, stripeCol) {
  // Móc treo kim loại
  R(c, x + 8, y, 2, 2, '#64748B');
  // 2 Tay áo xòe ngang rõ ràng
  R(c, x, y + 3, 4, 7, '#181B22'); R(c, x + 1, y + 4, 3, 5, col);
  R(c, x + 14, y + 3, 4, 7, '#181B22'); R(c, x + 14, y + 4, 3, 5, col);
  // Thân áo Polo
  R(c, x + 3, y + 2, 12, 16, '#181B22');
  R(c, x + 4, y + 3, 10, 14, col);
  // Cổ bẻ Polo & trụ nút ngực đặc trưng
  R(c, x + 6, y + 2, 6, 3, collarCol);
  R(c, x + 8, y + 5, 2, 4, collarCol);
  R(c, x + 8, y + 6, 1, 1, '#181B22'); R(c, x + 8, y + 8, 1, 1, '#181B22');
  // 3 sọc chạy dọc vai & tay áo
  R(c, x + 1, y + 4, 3, 1, stripeCol); R(c, x + 14, y + 4, 3, 1, stripeCol);
  R(c, x + 1, y + 6, 3, 1, stripeCol); R(c, x + 14, y + 6, 3, 1, stripeCol);
  // Logo mini bên ngực phải
  R(c, x + 11, y + 7, 2, 2, stripeCol);
}

/* 2. Áo Thun Thể Thao / Áo Đấu Bóng Đá (18×19) — Cổ V, 2 tay xòe, 3 sọc vai & số áo */
function drawSportsTee(c, x, y, col, stripeCol, hasNumber) {
  R(c, x + 8, y, 2, 2, '#64748B');
  R(c, x, y + 3, 4, 7, '#181B22'); R(c, x + 1, y + 4, 3, 5, col);
  R(c, x + 14, y + 3, 4, 7, '#181B22'); R(c, x + 14, y + 4, 3, 5, col);
  R(c, x + 3, y + 2, 12, 16, '#181B22');
  R(c, x + 4, y + 3, 10, 14, col);
  // Cổ chữ V thể thao
  R(c, x + 7, y + 3, 4, 2, stripeCol);
  R(c, x + 8, y + 4, 2, 2, '#181B22');
  // 3 sọc vai sắc nét
  R(c, x + 1, y + 4, 4, 1, stripeCol); R(c, x + 13, y + 4, 4, 1, stripeCol);
  R(c, x + 1, y + 6, 3, 1, stripeCol); R(c, x + 14, y + 6, 3, 1, stripeCol);
  if (hasNumber) {
    // Số áo bóng đá "10" / sọc ngang ngực nổi bật
    R(c, x + 6, y + 8, 2, 6, stripeCol);
    R(c, x + 9, y + 8, 4, 6, stripeCol);
    R(c, x + 10, y + 9, 2, 4, col);
  } else {
    // Logo 3 sọc giữa ngực áo thun
    R(c, x + 6, y + 10, 1, 2, stripeCol);
    R(c, x + 8, y + 9, 1, 3, stripeCol);
    R(c, x + 10, y + 8, 1, 4, stripeCol);
  }
}

/* 3. Quần Jogger Dài / Quần Short Thể Thao 3 Sọc (14×19 hoặc 14×13) — Tách rõ 2 ống quần */
function drawTrackPants(c, x, y, col, stripeCol, isShort) {
  var h = isShort ? 12 : 18;
  // Cạp quần chun rút dây
  R(c, x + 1, y + 1, 12, 3, '#181B22');
  R(c, x + 2, y + 2, 10, 2, col);
  R(c, x + 6, y + 2, 2, 2, stripeCol); // Dây rút trắng
  // Ống quần trái & phải tách rõ khe giữa
  R(c, x + 1, y + 4, 6, h - 3, '#181B22'); R(c, x + 2, y + 4, 4, h - 4, col);
  R(c, x + 7, y + 4, 6, h - 3, '#181B22'); R(c, x + 8, y + 4, 4, h - 4, col);
  // 3 Sọc dọc chạy 2 bên hông quần
  R(c, x + 2, y + 4, 1, h - 5, stripeCol);
  R(c, x + 11, y + 4, 1, h - 5, stripeCol);
}

/* 4. Giày Bóng Đá Predator / F50 (18×10) — Có HÀNG ĐINH TÁN DƯỚI ĐẾ + 3 sọc chéo */
function drawFootballBoot(c, x, y, col, stripeCol) {
  // Cổ giày ôm & thân mũi thuôn tốc độ
  R(c, x + 1, y, 6, 4, '#181B22'); R(c, x + 2, y + 1, 4, 3, col);
  R(c, x + 1, y + 2, 14, 5, '#181B22');
  R(c, x + 2, y + 3, 12, 3, col);
  R(c, x + 13, y + 4, 4, 3, col); // Mũi giày vót nhọn
  // 3 Sọc chéo đặc trưng giày đá banh
  R(c, x + 5, y + 3, 1, 3, stripeCol);
  R(c, x + 7, y + 3, 1, 3, stripeCol);
  R(c, x + 9, y + 3, 1, 3, stripeCol);
  // Đế cứng & 4 ĐINH TÁN BÓNG ĐÁ sắc nét bên dưới!
  R(c, x + 1, y + 7, 16, 1, '#111419');
  R(c, x + 2, y + 8, 2, 2, '#E2E8F0');
  R(c, x + 6, y + 8, 2, 2, '#E2E8F0');
  R(c, x + 11, y + 8, 2, 2, '#E2E8F0');
  R(c, x + 15, y + 8, 2, 2, '#E2E8F0');
}

/* 5. Giày Chạy Bộ Ultraboost / Adizero (18×10) — Đế Boost dày cong mũi khí động học */
function drawRunningShoe(c, x, y, col, stripeCol) {
  R(c, x + 1, y + 1, 13, 5, '#181B22');
  R(c, x + 2, y + 2, 11, 3, col);
  R(c, x + 12, y + 3, 5, 3, col);
  // 3 Sọc bên thân lưới chạy bộ
  R(c, x + 5, y + 2, 1, 3, stripeCol);
  R(c, x + 7, y + 2, 1, 3, stripeCol);
  R(c, x + 9, y + 2, 1, 3, stripeCol);
  // Đế bọt Boost trắng dày cong vút lên mũi giày
  R(c, x, y + 6, 16, 3, '#FFFFFF');
  R(c, x + 15, y + 5, 3, 3, '#FFFFFF');
  R(c, x + 1, y + 9, 15, 1, '#F97316'); // Đế ngoài cao su Continental cam
}

/* 6. Giày Lifestyle Originals (Superstar / Samba / Gazelle — 18×10) */
function drawLifestyleSneaker(c, x, y, col, stripeCol, soleCol) {
  R(c, x + 1, y + 1, 14, 5, '#181B22');
  R(c, x + 2, y + 2, 12, 4, col);
  R(c, x + 13, y + 3, 4, 3, '#FFFFFF'); // Mũi vỏ sò Superstar / Samba
  R(c, x + 5, y + 2, 1, 4, stripeCol);
  R(c, x + 7, y + 2, 1, 4, stripeCol);
  R(c, x + 9, y + 2, 1, 4, stripeCol);
  R(c, x + 1, y + 6, 16, 3, soleCol || '#FFFFFF'); // Đế phẳng hoặc đế Gum
  R(c, x + 1, y + 9, 16, 1, '#181B22');
}

/* 7. Dép Adilette 3 Sọc cỡ lớn (14×8) */
function drawAdiletteSlideLarge(c, x, y, col, stripeCol) {
  R(c, x, y + 4, 14, 4, '#181B22');
  R(c, x + 1, y + 5, 12, 2, col);
  // Quai dép bản to có 3 sọc rõ ràng
  R(c, x + 3, y + 1, 8, 5, '#181B22');
  R(c, x + 4, y + 2, 6, 4, col);
  R(c, x + 5, y + 2, 1, 4, stripeCol);
  R(c, x + 7, y + 2, 1, 4, stripeCol);
  R(c, x + 9, y + 2, 1, 4, stripeCol);
}

/* 8. Giá Đựng 6 Quả Bóng Đá Adidas (Khu Bóng Đá) */
function drawFootballRack(c, rx, ry) {
  R(c, rx, ry, 52, 34, '#181B22');
  R(c, rx + 2, ry + 2, 48, 30, '#334155');
  R(c, rx + 2, ry + 16, 48, 2, '#181B22');
  var balls = [
    [rx + 10, ry + 9, '#FFFFFF', '#181B22'],
    [rx + 26, ry + 9, '#FDE047', '#DC2626'],
    [rx + 42, ry + 9, '#FFFFFF', '#2563EB'],
    [rx + 10, ry + 25, '#38BDF8', '#181B22'],
    [rx + 26, ry + 25, '#FFFFFF', '#181B22'],
    [rx + 42, ry + 25, '#FB923C', '#181B22']
  ];
  for (var bi = 0; bi < balls.length; bi++) {
    var b = balls[bi];
    E(c, b[0], b[1], 6, 6, '#181B22');
    E(c, b[0], b[1], 5, 5, b[2]);
    R(c, b[0] - 2, b[1] - 2, 3, 3, b[3]);
    R(c, b[0] + 1, b[1] + 1, 2, 2, b[3]);
  }
}

/* 9. Kệ Phụ Kiện (Balo 3 sọc, Mũ lưỡi trai 3 sọc & Chồng hộp giày xanh/đen) */
function drawAccessoryShelf(c, ax, ay, aw) {
  R(c, ax, ay, aw, 44, '#2B180E');
  R(c, ax + 2, ay + 2, aw - 4, 40, '#8A5634'); // Kệ gỗ Hội An ấm
  R(c, ax + 2, ay + 22, aw - 4, 2, '#2B180E');
  // Tầng trên: 3 Balo thể thao 3 sọc + 2 Mũ lưỡi trai
  var packs = [[ax + 8, '#181B22', '#FFFFFF'], [ax + 28, '#1D4ED8', '#FFFFFF'], [ax + 48, '#DC2626', '#FFFFFF']];
  for (var pi = 0; pi < packs.length; pi++) {
    var pk = packs[pi];
    R(c, pk[0], ay + 5, 14, 15, '#181B22');
    R(c, pk[0] + 1, ay + 6, 12, 13, pk[1]);
    R(c, pk[0] + 3, ay + 8, 2, 9, pk[2]); R(c, pk[0] + 6, ay + 8, 2, 9, pk[2]); R(c, pk[0] + 9, ay + 8, 2, 9, pk[2]);
  }
  // Mũ lưỡi trai 3 sọc
  var caps = [[ax + 70, '#181B22', '#FFFFFF'], [ax + 88, '#FFFFFF', '#181B22']];
  for (var ci = 0; ci < caps.length; ci++) {
    var cp = caps[ci];
    E(c, cp[0] + 6, ay + 14, 6, 5, '#181B22'); E(c, cp[0] + 6, ay + 14, 5, 4, cp[1]);
    R(c, cp[0] + 9, ay + 16, 6, 2, cp[1]); // Lưỡi trai
    R(c, cp[0] + 5, ay + 12, 1, 3, cp[2]); R(c, cp[0] + 7, ay + 12, 1, 3, cp[2]);
  }
  // Tầng dưới: Chồng hộp giày xanh Originals & đen 3 sọc
  for (var hx = ax + 8; hx < ax + aw - 22; hx += 22) {
    var hc = ((hx - ax) / 22) % 2 === 0 ? '#1D4ED8' : '#181B22';
    R(c, hx, ay + 27, 18, 12, '#111419');
    R(c, hx + 1, ay + 28, 16, 10, hc);
    R(c, hx + 3, ay + 31, 12, 1, '#FFFFFF');
    R(c, hx + 3, ay + 33, 12, 1, '#FFFFFF');
    R(c, hx + 3, ay + 35, 12, 1, '#FFFFFF');
  }
}

/* 10. Kệ Sào Quần Áo Đầy Ắp (dùng drawPoloShirt / drawSportsTee / drawTrackPants to sắc nét) */
function drawDenseApparelRack(c, rx, ry, rw, kind) {
  R(c, rx + 2, ry + 26, rw - 4, 4, 'rgba(43,24,14,0.25)');
  R(c, rx, ry, rw, 3, '#2B180E'); // Thanh sào gỗ-thép
  R(c, rx, ry, 2, 26, '#2B180E'); R(c, rx + rw - 2, ry, 2, 26, '#2B180E');
  R(c, rx + 2, ry + 23, rw - 4, 2, '#6B4226');
  var palettes = [
    ['#FFFFFF', '#181B22', '#181B22'],
    ['#181B22', '#FFFFFF', '#FFFFFF'],
    ['#DC2626', '#FFFFFF', '#FFFFFF'],
    ['#2563EB', '#FFFFFF', '#FFFFFF'],
    ['#16A34A', '#FFFFFF', '#FFFFFF'],
    ['#F59E0B', '#181B22', '#181B22'],
    ['#F5F0E6', '#181B22', '#181B22']
  ];
  var idx = 0;
  var stepX = kind === 'pants' || kind === 'shorts' ? 16 : 20;
  for (var ix = rx + 4; ix <= rx + rw - stepX - 2; ix += stepX) {
    var p = palettes[idx % palettes.length];
    idx++;
    if (kind === 'polo') drawPoloShirt(c, ix, ry + 4, p[0], p[1], p[2]);
    else if (kind === 'jersey') drawSportsTee(c, ix, ry + 4, p[0], p[2], true);
    else if (kind === 'tee') drawSportsTee(c, ix, ry + 4, p[0], p[2], false);
    else if (kind === 'shorts') drawTrackPants(c, ix, ry + 6, p[0], p[2], true);
    else drawTrackPants(c, ix, ry + 4, p[0], p[2], false);
  }
}

/* 11. Kệ Tường Giày & Dép Dày Đặc (Bóng đá có đinh / Chạy bộ Boost / Originals / Dép Adilette) */
function drawFootwearWall(c, wx, wy, ww, wh, category) {
  R(c, wx, wy, ww, wh, '#2B180E');
  R(c, wx + 2, wy + 2, ww - 4, wh - 4, '#6B4226'); // Gỗ lim Hội An ấm
  var rows = 3;
  var rowH = Math.floor((wh - 6) / rows);
  var cols = [
    ['#F97316', '#181B22', '#FFFFFF'], // Cam Neon Predator
    ['#181B22', '#FFFFFF', '#B47B44'], // Đen 3 sọc trắng
    ['#FFFFFF', '#181B22', '#F8FAFC'], // Trắng Superstar
    ['#2563EB', '#FFFFFF', '#FFFFFF'], // Xanh Cobalt
    ['#DC2626', '#FFFFFF', '#FFFFFF'], // Đỏ Thể Thao
    ['#22C55E', '#181B22', '#FFFFFF']  // Xanh Neon F50
  ];
  for (var r = 0; r < rows; r++) {
    var sy = wy + 4 + r * rowH;
    R(c, wx + 3, sy, ww - 6, 1, '#FFE891'); // LED vàng ấm hắt sáng từng ngăn
    R(c, wx + 3, sy + rowH - 2, ww - 6, 2, '#2B180E');
    var sxStep = category === 'slides' ? 18 : 22;
    for (var sx = wx + 5; sx <= wx + ww - sxStep - 2; sx += sxStep) {
      var cl = cols[(r * 3 + Math.floor(sx / sxStep)) % cols.length];
      var itemY = sy + rowH - 12;
      if (category === 'football') drawFootballBoot(c, sx, itemY, cl[0], cl[1]);
      else if (category === 'running') drawRunningShoe(c, sx, itemY, cl[0], cl[1]);
      else if (category === 'slides') drawAdiletteSlideLarge(c, sx, itemY + 2, cl[0], cl[1]);
      else if (r === 2) drawAdiletteSlideLarge(c, sx + 2, itemY + 2, cl[0], cl[1]);
      else drawLifestyleSneaker(c, sx, itemY, cl[0], cl[1], cl[2]);
    }
  }
}

/* 12. Mannequin Nghệ Thuật Dáng Đẹp (Vai rộng, tay xuôi, mặc full outfit 3 sọc trên bục gỗ Hội An) */
function drawDetailedMannequin(c, mx, my, topCol, botCol, stripeCol, shoeCol) {
  R(c, mx - 13, my + 2, 26, 9, 'rgba(43,24,14,0.28)');
  // Bục gỗ lim viền vàng ấm Hội An
  R(c, mx - 12, my, 24, 9, '#2B180E');
  R(c, mx - 11, my + 1, 22, 7, '#8A5634');
  R(c, mx - 11, my + 1, 22, 2, '#D4B48C');
  // Đôi giày sneaker dưới chân
  R(c, mx - 6, my - 3, 5, 4, shoeCol); R(c, mx + 1, my - 3, 5, 4, shoeCol);
  // Quần thể thao 3 sọc tách 2 ống
  R(c, mx - 6, my - 13, 5, 10, '#181B22'); R(c, mx - 5, my - 12, 3, 9, botCol);
  R(c, mx + 1, my - 13, 5, 10, '#181B22'); R(c, mx + 2, my - 12, 3, 9, botCol);
  R(c, mx - 5, my - 12, 1, 8, stripeCol); R(c, mx + 4, my - 12, 1, 8, stripeCol);
  // 2 Tay mannequin xuôi tự nhiên mặc áo có 3 sọc tay
  R(c, mx - 10, my - 23, 4, 10, '#181B22'); R(c, mx - 9, my - 22, 3, 8, topCol);
  R(c, mx + 6, my - 23, 4, 10, '#181B22'); R(c, mx + 6, my - 22, 3, 8, topCol);
  // Thân áo Polo / Track Jacket 3 sọc
  R(c, mx - 6, my - 24, 12, 12, '#181B22');
  R(c, mx - 5, my - 23, 10, 10, topCol);
  R(c, mx - 9, my - 22, 1, 7, stripeCol); R(c, mx + 8, my - 22, 1, 7, stripeCol);
  // Logo 3 sọc sắc nét trước ngực
  R(c, mx - 2, my - 19, 1, 2, stripeCol); R(c, mx, my - 20, 1, 3, stripeCol); R(c, mx + 2, my - 21, 1, 4, stripeCol);
  // Cổ & đầu mannequin trắng nhám nghệ thuật
  R(c, mx - 2, my - 26, 4, 2, '#E2E8F0');
  R(c, mx - 4, my - 33, 8, 7, '#181B22');
  R(c, mx - 3, my - 32, 6, 5, '#FFFBF1');
}

function drawAdidasStaticBg(c) {
  // ===== TẦNG 2: KHU BÓNG ĐÁ, CHẠY BỘ & POLO/ÁO THUN (y: 0..274) =====
  drawHoiAnWoodAndTileFloor(c, 14, 58, 612, 214);
  // Tường vàng kem phố cổ Hội An + Dầm gỗ lim nâu sẫm
  R(c, 0, 0, 640, 58, VN_MAT.wallYellow.mid);
  R(c, 0, 0, 640, 6, '#4A2C1A');
  R(c, 0, 56, 640, 2, '#2B180E');
  R(c, 0, 0, 14, 560, '#8A5634'); R(c, 14, 0, 2, 560, '#2B180E');
  R(c, 626, 0, 14, 560, '#8A5634'); R(c, 624, 0, 2, 560, '#2B180E');

  // HERO WALL HỘI AN × ADIDAS (x: 222..418, y: 7..54)
  R(c, 222, 7, 196, 47, '#2B180E');
  R(c, 224, 9, 192, 43, '#181B22');
  R(c, 226, 10, 188, 2, '#F4B93B'); // Viền vàng Hội An sang trọng
  drawThreeStripesLogo(c, 252, 18, 2, '#FFFFFF');
  R(c, 298, 24, 92, 4, '#FFFFFF');   // ADIDAS
  R(c, 304, 33, 80, 2, '#F4B93B');   // HOI AN HERITAGE

  // KHU BÓNG ĐÁ TRÊN THẢM CỎ NHÂN TẠO XANH (Góc trái Tầng 2: x: 20..244, y: 66..256)
  R(c, 20, 68, 222, 186, '#2E7D32');
  for (var gx = 20; gx < 242; gx += 22) R(c, gx, 68, 11, 186, '#388E3C'); // Sọc cỏ sân bóng
  R(c, 20, 68, 222, 2, '#FFFFFF'); R(c, 20, 252, 222, 2, '#FFFFFF'); // Đường biên trắng
  // Kệ Giày Bóng Đá Predator/F50 có đinh tán (tường trái trên)
  drawFootwearWall(c, 22, 10, 192, 56, 'football');
  // 2 Sào Áo Đấu Bóng Đá có tay + số áo & Quần Short đá banh + Giá 6 Quả Bóng Đá
  drawDenseApparelRack(c, 26, 78, 148, 'jersey');
  drawFootballRack(c, 182, 76);
  drawDenseApparelRack(c, 26, 138, 148, 'shorts');
  drawDetailedMannequin(c, 212, 166, '#DC2626', '#181B22', '#FFFFFF', '#F97316'); // Mannequin Bóng Đá
  drawDenseApparelRack(c, 26, 198, 148, 'polo');
  drawDetailedMannequin(c, 212, 232, '#FFFFFF', '#181B22', '#181B22', '#181B22'); // Mannequin Polo trắng

  // KHU CHẠY BỘ & POLO/ÁO THUN (Góc phải Tầng 2: x: 396..620, y: 66..256)
  // Kệ Giày Chạy Bộ Ultraboost / Adizero đế Boost cong (tường phải trên)
  drawFootwearWall(c, 426, 10, 192, 56, 'running');
  // Phòng Thử Đồ VIP & Gương LED viền vàng ấm (góc trên phải x: 526..618, y: 74..148)
  R(c, 526, 74, 92, 72, '#2B180E');
  R(c, 528, 76, 88, 68, '#F5E6C8');
  R(c, 528, 76, 38, 68, '#6B4226'); // Rèm gỗ-lụa Hội An
  R(c, 574, 82, 34, 54, '#2B180E'); R(c, 575, 83, 32, 52, '#FFF9E6'); R(c, 577, 85, 28, 48, '#BAE6FD');
  // 3 Sào Áo Thun Thể Thao, Quần Jogger 3 Sọc & Kệ Phụ Kiện Balo/Mũ
  drawDenseApparelRack(c, 398, 78, 120, 'tee');
  drawDenseApparelRack(c, 398, 138, 120, 'pants');
  drawAccessoryShelf(c, 504, 158, 114);
  drawDenseApparelRack(c, 398, 198, 98, 'polo');
  drawDetailedMannequin(c, 564, 236, '#2563EB', '#1E293B', '#FFFFFF', '#FFFFFF'); // Mannequin Chạy Bộ
  // Thêm 1 Mannequin ngay lối lên cầu thang Tầng 2
  drawDetailedMannequin(c, 320, 118, '#181B22', '#181B22', '#FFFFFF', '#FFFFFF');

  // ===== BAN CÔNG GỖ CHẠM HỘI AN & CẦU THANG GỖ ĐÈN LED (y: 266..312) =====
  R(c, 16, 266, 250, 22, '#2B180E');
  R(c, 16, 268, 250, 12, '#8A5634');
  for (var bx = 22; bx < 260; bx += 14) R(c, bx, 270, 6, 8, '#D4B48C'); // Hoa văn con tiện gỗ Hội An
  R(c, 374, 266, 250, 22, '#2B180E');
  R(c, 374, 268, 250, 12, '#8A5634');
  for (var bx2 = 380; bx2 < 618; bx2 += 14) R(c, bx2, 270, 6, 8, '#D4B48C');

  // CẦU THANG KÍNH & BẬC GỖ LIM HẮT LED NỐI TẦNG 1 ↔ TẦNG 2 (x: 266..374, y: 248..314)
  R(c, 266, 248, 108, 66, '#2B180E');
  for (var st = 0; st < 8; st++) {
    var sty = 250 + st * 8;
    R(c, 270, sty, 100, 7, '#B58A5D');
    R(c, 270, sty, 100, 1, '#FFE891'); // LED vàng ấm hắt bậc
    R(c, 270, sty + 6, 100, 1, '#4A2C1A');
  }
  R(c, 266, 248, 4, 66, '#F4B93B'); R(c, 370, 248, 4, 66, '#F4B93B');

  // ===== TẦNG 1: ORIGINALS, DÉP ADILETTE, POLO, PHỤ KIỆN & CHECKOUT (y: 288..560) =====
  drawHoiAnWoodAndTileFloor(c, 14, 288, 612, 256);

  // BÊN TRÁI TẦNG 1 (x: 22..246): Dày đặc Sào Áo Polo, Áo Thun, Quần 3 sọc & Kệ Phụ Kiện
  drawDenseApparelRack(c, 24, 304, 148, 'polo');
  drawDenseApparelRack(c, 24, 362, 148, 'tee');
  drawAccessoryShelf(c, 180, 302, 66);
  drawDenseApparelRack(c, 180, 362, 66, 'pants');
  drawDetailedMannequin(c, 214, 434, '#16A34A', '#181B22', '#FFFFFF', '#FFFFFF');

  // BÊN PHẢI TẦNG 1 (x: 394..618): Tường Giày Originals (Superstar/Samba/Gazelle) + Tường Dép Adilette + Đảo Giày Bóng Đá
  drawFootwearWall(c, 396, 298, 222, 60, 'originals');
  drawFootwearWall(c, 396, 366, 140, 56, 'slides');
  drawFootballRack(c, 546, 376); // Giá bóng đá thứ 2 ngay Tầng 1
  drawDenseApparelRack(c, 396, 432, 134, 'jersey');
  drawDetailedMannequin(c, 558, 456, '#181B22', '#FFFFFF', '#181B22', '#181B22');
  drawDetailedMannequin(c, 594, 456, '#DC2626', '#181B22', '#FFFFFF', '#FFFFFF');

  // QUẦY THU NGÂN GỖ HỘI AN × LOGO 3 SỌC (x: 24..188, y: 454..520)
  R(c, 24, 456, 164, 58, '#2B180E');
  R(c, 26, 458, 160, 22, '#F5E6C8'); // Mặt quầy gỗ sáng
  R(c, 26, 480, 160, 32, '#181B22'); // Mặt đứng đen 3 sọc
  drawThreeStripesLogo(c, 96, 486, 1, '#FFFFFF');
  R(c, 38, 462, 20, 12, '#1E293B'); R(c, 40, 464, 16, 7, '#38BDF8');
  R(c, 130, 460, 18, 12, '#1D4ED8'); R(c, 132, 463, 14, 2, '#FFFFFF');
  R(c, 150, 460, 16, 12, '#181B22'); R(c, 152, 463, 12, 2, '#FFFFFF');
  R(c, 170, 460, 10, 14, '#FFFFFF'); R(c, 173, 464, 1, 6, '#181B22'); R(c, 175, 464, 1, 6, '#181B22');

  // Kệ Hộp Giày & Dép phụ góc phải dưới (x: 420..616, y: 492..534)
  drawAccessoryShelf(c, 420, 490, 196);

  // CỬA KÍNH MẶT TIỀN & CỔNG RA ĐẠI LỘ (y: 536..560)
  R(c, 16, 542, 244, 18, '#2B180E'); R(c, 18, 544, 240, 12, '#BAE6FD');
  R(c, 380, 542, 244, 18, '#2B180E'); R(c, 382, 544, 240, 12, '#BAE6FD');
  R(c, 260, 532, 120, 28, '#D4B48C');
  R(c, 274, 538, 92, 16, '#181B22');
  drawThreeStripesLogo(c, 310, 541, 1, '#FFFFFF');
}

/* 2 Nhân viên Adidas mặc áo Polo đen 3 sọc trắng */
function drawAdidasStaff(c, st, t) {
  var x = Math.round(st.x), y = Math.round(st.y);
  var step = st.moving ? (Math.floor(t * 9 + st.phase) % 2) : 0;
  drawContactShadow(c, x, y + 1, 6, 2.5);
  R(c, x - 3, y - 6 + step, 3, 6, '#181B22'); R(c, x + 1, y - 6 + (1 - step), 3, 6, '#181B22');
  R(c, x - 3, y - 5, 1, 4, '#FFFFFF'); R(c, x + 3, y - 5, 1, 4, '#FFFFFF');
  R(c, x - 5, y - 15, 10, 10, '#111419'); R(c, x - 4, y - 14, 8, 8, '#181B22');
  R(c, x - 4, y - 14, 1, 5, '#FFFFFF'); R(c, x + 3, y - 14, 1, 5, '#FFFFFF');
  R(c, x + 1, y - 11, 2, 2, '#F8FAFC');
  drawAdidasHumanFace(c, x, y - 20, { hair: st.hair, hairStyle: st.hairStyle, faceDir: st.faceX, backView: st.faceY < 0 });
}

/* Khách hàng mua sắm Adidas (có khách cầm túi giấy trắng 3 sọc) */
function drawAdidasShopper(c, sh, t) {
  var x = Math.round(sh.x), y = Math.round(sh.y);
  var step = sh.moving ? (Math.floor(t * 8 + sh.phase) % 2) : 0;
  drawContactShadow(c, x, y + 1, 6, 2.5);
  R(c, x - 3, y - 6 + step, 3, 6, '#334155'); R(c, x + 1, y - 6 + (1 - step), 3, 6, '#334155');
  R(c, x - 5, y - 15, 10, 10, VN_MAT.ink); R(c, x - 4, y - 14, 8, 8, sh.shirt);
  drawAdidasHumanFace(c, x, y - 20, { hair: sh.hair, hairStyle: sh.hairStyle, faceDir: sh.faceX, backView: sh.faceY < 0 });
  if (sh.hasBag) {
    var bx = sh.faceX >= 0 ? x + 5 : x - 11;
    R(c, bx, y - 9, 7, 8, '#181B22'); R(c, bx + 1, y - 8, 5, 6, '#FFFFFF');
    R(c, bx + 2, y - 6, 1, 3, '#181B22'); R(c, bx + 4, y - 6, 1, 3, '#181B22');
  }
}

function drawAdidasLiveEntities(c, t, staffList, shoppers, pigState, drawPigFn) {
  // 1. 8 Đèn Lồng Lụa Hội An treo tỏa ánh sáng vàng ấm 60fps
  var lanterns = [
    [252, 64, '#F59E0B'], [388, 64, '#E0452B'],
    [252, 244, '#E0452B'], [388, 244, '#F59E0B'],
    [252, 316, '#F59E0B'], [388, 316, '#E0452B'],
    [252, 514, '#E0452B'], [388, 514, '#F59E0B']
  ];
  for (var li = 0; li < lanterns.length; li++) {
    drawHoiAnLantern(c, lanterns[li][0], lanterns[li][1], lanterns[li][2], t);
  }

  // 2. Ánh sáng lấp lánh trên Logo 3 Sọc Hero Wall & Gương VIP
  if (Math.sin(t * 4) > 0.35) {
    R(c, 274, 16, 2, 2, '#FFE891');
    R(c, 588, 98, 2, 2, '#FFFFFF');
  }

  // 3. Y-Sorting toàn bộ nhân vật (2 Nhân viên + 7 Khách mua sắm + Chú Heo 1:1)
  var drawList = [];
  for (var si = 0; si < staffList.length; si++) {
    (function(st) { drawList.push({ y: st.y, fn: function() { drawAdidasStaff(c, st, t); } }); })(staffList[si]);
  }
  for (var hi = 0; hi < shoppers.length; hi++) {
    (function(sh) { drawList.push({ y: sh.y, fn: function() { drawAdidasShopper(c, sh, t); } }); })(shoppers[hi]);
  }
  if (pigState && drawPigFn) {
    drawList.push({ y: pigState.y, fn: drawPigFn });
  }
  drawList.sort(function(a, b) { return a.y - b.y; });
  for (var di = 0; di < drawList.length; di++) drawList[di].fn();

  // 4. Hiệu ứng ngôi sao lấp lánh khi Chú Heo tương tác thử đồ / ngắm giày
  if (pigState && (pigState.action === 'look_window' || pigState.action === 'jump_joy')) {
    var hx = Math.round(pigState.x), hy = Math.round(pigState.y - 26);
    var pulse = Math.round(Math.sin(t * 7) * 2);
    R(c, hx - 8, hy + pulse, 3, 1, '#F4B93B'); R(c, hx - 7, hy - 1 + pulse, 1, 3, '#F4B93B');
    R(c, hx + 6, hy - pulse, 3, 1, '#FFFFFF'); R(c, hx + 7, hy - 1 - pulse, 1, 3, '#FFFFFF');
  }
}
`;
}
