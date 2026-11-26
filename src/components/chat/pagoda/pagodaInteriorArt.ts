/**
 * Ngôi Chùa Việt Nam Cổ Kính 2 Tầng: Chánh Điện Tượng Phật Thếp Vàng & Sân Chùa Bảo Tháp, Lư Hương (640×560 — Quyết định 220)
 */
export function buildPagodaInteriorArtScript(): string {
  return `
function drawBonsaiPot(c, x, y) {
  R(c, x + 2, y + 12, 16, 8, INK);
  R(c, x + 3, y + 13, 14, 6, '#B97A14');
  R(c, x + 4, y + 14, 12, 2, '#F5CA72');
  R(c, x + 8, y + 6, 4, 7, '#5C381E');
  E(c, x + 10, y + 4, 8, 4, INK); E(c, x + 10, y + 4, 7, 3, '#2E7D32');
  E(c, x + 5, y + 7, 5, 3, '#388E3C'); E(c, x + 15, y + 7, 5, 3, '#43A047');
}

function drawWorshipper(c, px, py, bowAmt, shirt, isMonk) {
  // Phật tử / sư thầy quỳ lạy trên bồ đoàn (quay mặt lên tượng Phật)
  // Bồ đoàn đỏ viền vàng
  R(c, px - 3, py - 2, 16, 7, INK);
  R(c, px - 2, py - 1, 14, 5, '#9E2A2B');
  R(c, px - 1, py, 12, 3, '#DC2626');
  R(c, px - 2, py + 3, 14, 1, '#F4B93B');

  var bow = Math.round(bowAmt * 4);
  var bodyCol = isMonk ? '#D97706' : (shirt || '#64748B');
  var hairCol = isMonk ? '#E5C29F' : '#2B2118';
  // Thân áo tràng / áo lam cúi lạy
  R(c, px, py - 11 + bow, 10, 10 - (bow >> 1), INK);
  R(c, px + 1, py - 10 + bow, 8, 8 - (bow >> 1), bodyCol);
  R(c, px + 2, py - 10 + bow, 2, 6 - (bow >> 1), 'rgba(255,255,255,0.2)');
  // Đầu cúi nhẹ khi lạy Phật
  R(c, px + 1, py - 16 + bow, 8, 6, INK);
  R(c, px + 2, py - 15 + bow, 6, 4, hairCol);
  R(c, px + 2, py - 12 + bow, 6, 1, '#E5C29F');
}

function drawPagodaBg(x, WORLD_W, WORLD_H) {
  // =========================================================================
  // TẦNG 1 (y: 0..314): CHÁNH ĐIỆN UY NGHIÊM (THEO ẢNH 1 — VIỆT NAM QUỐC TỰ)
  // =========================================================================
  // 1. TRẦN GỖ Ô VUÔNG CHẠM HOA SEN MẠ VÀNG LỘNG LẪY (y: 0..44)
  R(x, 0, 0, WORLD_W, 44, '#4A2511');
  for (var cx = 8; cx < WORLD_W - 8; cx += 48) {
    R(x, cx, 4, 42, 34, '#7C3F19');
    R(x, cx + 2, 6, 38, 30, '#D99B38');
    R(x, cx + 4, 8, 34, 26, '#8C521A');
    E(x, cx + 21, 21, 13, 10, '#F5CA72');
    E(x, cx + 21, 21, 9, 7, '#B97A14');
    E(x, cx + 21, 21, 4, 3, '#FEF08A'); // tâm hoa sen mạ vàng
  }
  R(x, 0, 42, WORLD_W, 3, INK);

  // 2. TƯỜNG CHÁNH ĐIỆN, CỬA LÁ SÁCH & TỦ TƯỢNG LA HÁN (y: 45..204)
  R(x, 0, 45, WORLD_W, 159, '#F3E5C8');
  // Hàng cửa sổ kính trên cao lấy ánh sáng thanh tịnh
  for (var wx = 12; wx < 188; wx += 28) {
    R(x, wx, 52, 22, 24, INK); R(x, wx + 1, 53, 20, 22, '#DCEEFA');
    R(x, wx + 11, 53, 1, 22, '#5C381E'); R(x, wx + 1, 64, 20, 1, '#5C381E');
  }
  for (var wx2 = 452; wx2 < 620; wx2 += 28) {
    R(x, wx2, 52, 22, 24, INK); R(x, wx2 + 1, 53, 20, 22, '#DCEEFA');
    R(x, wx2 + 11, 53, 1, 22, '#5C381E'); R(x, wx2 + 1, 64, 20, 1, '#5C381E');
  }
  // Tủ kính trưng bày tượng La Hán hai bên tường (như Ảnh 1)
  [18, 106, 466, 550].forEach(function (tx) {
    R(x, tx, 104, 72, 44, INK); R(x, tx + 1, 105, 70, 42, '#FFF8E7');
    for (var lx = tx + 8; lx < tx + 64; lx += 16) {
      R(x, lx, 118, 9, 22, '#D99B38'); R(x, lx + 2, 112, 5, 6, '#F5CA72');
      R(x, lx + 1, 124, 7, 14, (lx % 32 === 0) ? '#DC2626' : '#EAB308');
    }
  });

  // Hàng cột gỗ lim sơn nâu đỏ cao vút
  [92, 188, 448, 538].forEach(function (px) {
    R(x, px, 44, 14, 162, INK); R(x, px + 1, 44, 12, 160, '#5C2C1D');
    R(x, px + 3, 44, 3, 160, '#7F3F2B');
    R(x, px - 2, 184, 18, 22, INK); R(x, px - 1, 185, 16, 20, '#3D1E14'); // chân cột gỗ
  });

  // 3. TƯỢNG ĐỨC PHẬT THÍCH CA MÂU NI THẾP VÀNG & HÀO QUANG CHẠM LỘNG (x: 214..426, y: 46..168)
  // Khung vách chạm trổ mạ vàng rực rỡ phía sau tượng Phật
  R(x, 214, 48, 212, 118, INK); R(x, 215, 49, 210, 116, '#8C521A');
  for (var gx = 222; gx < 420; gx += 16) {
    for (var gy = 54; gy < 158; gy += 16) {
      R(x, gx, gy, 12, 12, '#B97A14'); R(x, gx + 2, gy + 2, 8, 8, '#D99B38'); R(x, gx + 4, gy + 4, 4, 4, '#F5CA72');
    }
  }
  // Vòng hào quang tròn lớn mạ vàng chạm hoa văn quanh Đức Phật
  E(x, 320, 112, 56, 52, INK); E(x, 320, 112, 54, 50, '#D99B38');
  E(x, 320, 112, 46, 42, '#F5CA72'); E(x, 320, 112, 38, 34, '#FEF08A');
  // Tượng Đức Phật Thích Ca tọa thiền trên đài sen (thếp vàng uy nghiêm)
  // Đài sen vàng rực
  E(x, 320, 152, 44, 12, INK); E(x, 320, 152, 42, 10, '#D99B38');
  for (var sp = -32; sp <= 32; sp += 8) { E(x, 320 + sp, 148, 5, 4, '#F5CA72'); }
  // Thân & chân xếp bằng kiết già thếp vàng
  E(x, 320, 138, 30, 12, INK); E(x, 320, 138, 28, 10, '#EAB308');
  R(x, 300, 108, 40, 28, INK); R(x, 301, 109, 38, 26, '#FACC15');
  R(x, 304, 112, 14, 20, '#FEF08A'); // ánh vàng vai trái
  R(x, 314, 126, 12, 6, '#D99B38'); // hai tay thủ ấn thiền định
  // Đầu & nhục kế Đức Phật
  E(x, 320, 92, 13, 14, INK); E(x, 320, 92, 12, 13, '#FACC15');
  E(x, 320, 82, 12, 6, '#3B2516'); E(x, 320, 75, 5, 4, '#3B2516'); // tóc xoắn ốc & nhục kế
  R(x, 319, 89, 2, 2, '#DC2626'); // bạch hào giữa trán
  R(x, 314, 92, 3, 1, '#5C381E'); R(x, 323, 92, 3, 1, '#5C381E'); // đôi mắt từ bi khép nhẹ

  // 4. BÀN THỜ GỖ CHẠM LỘNG, HOA LAN TRẮNG, LƯ HƯƠNG & NẾN (x: 204..436, y: 162..204)
  R(x, 204, 166, 232, 38, INK); R(x, 205, 167, 230, 8, '#8C521A'); R(x, 205, 175, 230, 28, '#5C2C1D');
  R(x, 210, 180, 220, 18, '#7F3F2B');
  for (var bx = 216; bx < 424; bx += 22) R(x, bx, 184, 14, 10, '#D99B38'); // hoa văn chạm lộng
  // 2 Bình hoa lan trắng lớn hai bên bàn thờ (như Ảnh 1)
  [222, 406].forEach(function (fx) {
    R(x, fx, 156, 12, 12, INK); R(x, fx + 1, 157, 10, 10, '#1E3A8A');
    E(x, fx + 6, 150, 14, 8, '#E0F2FE'); E(x, fx + 6, 148, 11, 6, '#FFFFFF');
  });
  // Lư hương đồng trung tâm bàn thờ
  R(x, 306, 154, 28, 14, INK); R(x, 307, 155, 26, 12, '#B97A14'); R(x, 310, 157, 20, 4, '#F5CA72');
  [314, 319, 324].forEach(function (ix) { R(x, ix, 146, 1, 8, '#DC2626'); R(x, ix, 145, 1, 1, '#F97316'); });

  // 5. TRỐNG BÁT NHÃ ĐỎ LỚN (TRÁI) & ĐẠI HỒNG CHUNG (PHẢI)
  // Trống Bát Nhã (x: 34..78, y: 146..204)
  R(x, 42, 184, 28, 20, '#3D1E14');
  E(x, 56, 168, 22, 18, INK); E(x, 56, 168, 20, 16, '#9E2A2B');
  E(x, 46, 168, 10, 15, '#F5E6C8'); E(x, 46, 168, 7, 11, '#E6D2A8'); // mặt trống da bò
  // Đại Hồng Chung đồng cổ (x: 560..606, y: 140..204)
  R(x, 560, 140, 46, 5, '#5C2C1D'); R(x, 562, 145, 4, 58, '#5C2C1D'); R(x, 600, 145, 4, 58, '#5C2C1D');
  E(x, 583, 174, 14, 18, INK); E(x, 583, 174, 12, 16, '#9A6B2F');
  R(x, 571, 182, 24, 10, '#784F1E'); R(x, 575, 168, 5, 14, '#D99B38'); // ánh đồng chuông

  // 6. SÀN ĐÁ HOA CƯƠNG BÓNG LOÁNG CHÁNH ĐIỆN (y: 204..314)
  for (var sx = 0; sx < WORLD_W; sx += 20) {
    for (var sy = 204; sy < 314; sy += 20) {
      var alt = ((sx / 20) + (sy / 20)) % 2 === 0;
      R(x, sx, sy, 20, 20, alt ? '#9E93A6' : '#8E8296');
      R(x, sx, sy, 20, 1, 'rgba(255,255,255,0.12)');
      R(x, sx, sy, 1, 20, 'rgba(43,33,24,0.16)');
    }
  }
  // Phản chiếu ánh vàng ấm của Tượng Phật & đèn trên nền đá bóng (như Ảnh 1)
  x.save();
  x.globalAlpha = 0.22;
  E(x, 320, 236, 92, 28, '#F5CA72');
  x.globalAlpha = 0.14;
  E(x, 320, 272, 68, 22, '#FEF08A');
  x.restore();

  // =========================================================================
  // TẦNG 2 (y: 314..560): BẬC TAM CẤP, SÂN CHÙA, LƯ HƯƠNG LỚN & BẢO THÁP (ẢNH 2, 3, 4)
  // =========================================================================
  // Lan can đá chạm trổ ngăn Chánh Điện & Sân Chùa + Bậc tam cấp ở giữa (x: 264..376)
  R(x, 0, 312, 264, 16, INK); R(x, 1, 313, 262, 14, '#B85A3F'); R(x, 1, 313, 262, 4, '#F5CA72');
  R(x, 376, 312, 264, 16, INK); R(x, 377, 313, 262, 14, '#B85A3F'); R(x, 377, 313, 262, 4, '#F5CA72');
  // Bậc thang đá cổ kính bước từ sân lên Chánh Điện
  [312, 318, 324, 330].forEach(function (by, i) {
    R(x, 264, by, 112, 6, INK); R(x, 265, by + 1, 110, 4, i % 2 === 0 ? '#D8D2C5' : '#C7C0B2');
  });

  // Nền gạch đá sân chùa rộng thoáng (y: 328..560)
  for (var cx2 = 0; cx2 < WORLD_W; cx2 += 16) {
    for (var cy2 = 328; cy2 < WORLD_H; cy2 += 16) {
      var a2 = ((cx2 / 16) + (cy2 / 16)) % 2 === 0;
      R(x, cx2, cy2, 16, 16, a2 ? '#D6CFC2' : '#C9C1B2');
      R(x, cx2, cy2, 16, 1, 'rgba(65,52,40,0.16)');
      R(x, cx2, cy2, 1, 16, 'rgba(65,52,40,0.16)');
    }
  }
  // Lối đi gạch đỏ dẫn từ Cổng Tam Quan lên Bậc Tam Cấp (x: 280..360)
  R(x, 280, 336, 80, 174, '#C88A70');
  R(x, 280, 336, 2, 174, '#8A4E38'); R(x, 358, 336, 2, 174, '#8A4E38');

  // BẢO THÁP 7 TẦNG MÁI ĐAO CONG ĐỎ RỰC BÊN TRÁI SÂN (Ảnh 2 & 4 — x: 42..154, y: 334..490)
  R(x, 48, 466, 98, 22, INK); R(x, 49, 467, 96, 20, '#E8D8BA'); // bệ đá bảo tháp
  for (var tier = 0; tier < 6; tier++) {
    var tw = 74 - tier * 8;
    var tx2 = 97 - (tw >> 1);
    var ty2 = 450 - tier * 18;
    R(x, tx2 + 6, ty2, tw - 12, 16, INK); R(x, tx2 + 7, ty2 + 1, tw - 14, 14, '#F5B076');
    R(x, 95, ty2 + 4, 4, 8, '#5C2C1D'); // ô cửa tháp
    // Mái đao cong đỏ rực hai bên
    R(x, tx2 - 4, ty2 - 4, tw + 8, 6, INK); R(x, tx2 - 3, ty2 - 3, tw + 6, 4, '#C94B38');
    R(x, tx2 - 6, ty2 - 6, 5, 3, '#E0452B'); R(x, tx2 + tw + 1, ty2 - 6, 5, 3, '#E0452B');
  }
  R(x, 95, 332, 4, 18, '#D99B38'); // đỉnh tháp vàng

  // LẦU TRỐNG MÁI CONG & CHẬU BONSAI BÊN PHẢI SÂN (x: 486..600, y: 356..490)
  R(x, 492, 456, 96, 30, INK); R(x, 493, 457, 94, 28, '#D8CFC0');
  R(x, 502, 404, 6, 54, '#7F1D1D'); R(x, 572, 404, 6, 54, '#7F1D1D');
  E(x, 540, 434, 18, 12, INK); E(x, 540, 434, 16, 10, '#9E2A2B'); // trống lớn trong lầu
  // Mái lầu trống đỏ rực
  R(x, 488, 388, 104, 18, INK); R(x, 489, 389, 102, 16, '#C94B38');
  R(x, 496, 378, 88, 12, '#DC2626'); R(x, 512, 370, 56, 8, '#F5CA72');
  // 4 Chậu Bonsai xanh mướt dọc sân chùa (Ảnh 4)
  drawBonsaiPot(x, 178, 344); drawBonsaiPot(x, 224, 344);
  drawBonsaiPot(x, 402, 344); drawBonsaiPot(x, 448, 344);

  // LƯ HƯƠNG ĐỒNG KHỔNG LỒ GIỮA SÂN CHÙA (Ảnh 4 — x: 298..342, y: 392..434)
  R(x, 298, 424, 44, 10, INK); R(x, 299, 425, 42, 8, '#8C521A');
  R(x, 304, 402, 32, 22, INK); R(x, 305, 403, 30, 20, '#B97A14');
  R(x, 308, 406, 24, 6, '#F5CA72'); R(x, 308, 415, 24, 4, '#DC2626');
  R(x, 300, 396, 40, 6, INK); R(x, 301, 397, 38, 4, '#D99B38');
  [310, 316, 320, 325, 330].forEach(function (ix) { R(x, ix, 388, 1, 9, '#DC2626'); R(x, ix, 387, 1, 1, '#F97316'); });

  // CỔNG TAM QUAN NGÓI ĐỎ ĐÁY SÂN RA PHỐ KHÁM PHÁ (Ảnh 3 — x: 256..384, y: 506..560)
  R(x, 256, 514, 128, 46, INK); R(x, 257, 515, 126, 44, '#E8D8BA');
  R(x, 286, 522, 68, 36, '#5C2C1D'); R(x, 294, 526, 52, 28, '#FDE68A'); // lối ra sáng ấm
  R(x, 250, 504, 140, 12, INK); R(x, 251, 505, 138, 10, '#C94B38');
  R(x, 266, 496, 108, 10, '#DC2626'); R(x, 294, 492, 52, 5, '#F5CA72'); // mái ngói đỏ Tam Quan
}

// HOẠT CẢNH SỐNG 60FPS: PHẬT TỬ CÚI LẠY, KHÓI TRẦM HƯƠNG BAY, HÀO QUANG PHẬT & HẠT SÁNG THANH TỊNH
function drawPagodaLiveEffects(x, t) {
  // 1. Hào quang vàng tỏa sáng dịu nhẹ sau tượng Đức Phật
  x.save();
  x.globalAlpha = 0.16 + Math.sin(t * 1.8) * 0.05;
  E(x, 320, 112, 68, 60, '#FEF08A');
  x.globalAlpha = 0.10 + Math.sin(t * 2.5) * 0.03;
  E(x, 320, 158, 44, 18, '#FFE08A');
  x.restore();

  // 2. Nến vàng rung rinh trên bàn thờ Chánh Điện
  [254, 270, 368, 384].forEach(function (nx, i) {
    R(x, nx, 158, 3, 8, '#FFFBF1');
    var fl = ((t * 7 + i) | 0) % 2 === 0;
    R(x, nx, fl ? 154 : 155, 3, 3, '#FACC15');
    R(x, nx + 1, 153, 1, 2, '#FFF8D6');
  });

  // 3. Phật tử & Sư thầy quỳ lạy thành kính trong Chánh Điện (hoạt ảnh cúi lạy chậm rãi, thanh tịnh!)
  var worshippers = [
    { x: 256, y: 244, phase: 0.0, shirt: '#64748B', monk: false },
    { x: 374, y: 244, phase: 1.8, shirt: '#D97706', monk: true },
    { x: 214, y: 274, phase: 3.1, shirt: '#EC4899', monk: false },
    { x: 278, y: 278, phase: 0.9, shirt: '#475569', monk: false },
    { x: 354, y: 278, phase: 2.4, shirt: '#64748B', monk: false },
    { x: 416, y: 274, phase: 4.0, shirt: '#3B82F6', monk: false }
  ];
  worshippers.forEach(function (w) {
    var cycle = (t * 0.55 + w.phase) % 4;
    var bow = (cycle < 1.2) ? Math.sin((cycle / 1.2) * Math.PI) : 0;
    drawWorshipper(x, w.x, w.y, bow, w.shirt, w.monk);
  });

  // 2 Phật tử đứng vái hương trước Lư Hương Lớn ngoài sân chùa
  drawWorshipper(x, 274, 434, 0.2, '#475569', false);
  drawWorshipper(x, 356, 434, 0.2, '#D97706', true);

  // 4. Khói trầm hương uốn lượn bay lên từ Lư Hương Chánh Điện & Lư Hương Sân Chùa
  [[316, 144], [322, 144], [314, 386], [320, 385], [326, 386]].forEach(function (pt, idx) {
    for (var i = 0; i < 4; i++) {
      var p = ((t * 0.55 + i * 0.25 + idx * 0.13) % 1);
      var sy = pt[1] - Math.round(p * 26);
      var sx = pt[0] + Math.round(Math.sin(t * 2.2 + i * 1.7 + p * 5) * 3);
      x.save(); x.globalAlpha = 0.55 * (1 - p); R(x, sx, sy, 2, 2, '#E2E8F0'); x.restore();
    }
  });

  // 5. Hạt sáng vàng & cánh hoa sen rơi nhẹ thanh tịnh 60fps
  x.save();
  for (var k = 0; k < 28; k++) {
    var hx = ((k * 67 + Math.round(Math.sin(t * 0.6 + k) * 12)) % 580) + 30;
    var hy = ((k * 53 + Math.round(t * (3 + (k % 3)))) % 500) + 20;
    x.globalAlpha = 0.22 + Math.abs(Math.sin(t * 1.8 + k)) * 0.42;
    R(x, hx, hy, 2, 2, (k % 4 === 0) ? '#F9B8C4' : '#FEF08A');
  }
  x.restore();
}
`;
}
