/**
 * Nội Thất Nhà Thờ Đức Bà Sài Gòn — Kiến Trúc Cổ Kính Hoài Niệm Châu Âu & Đèn Vàng Lung Linh (640×520 — Quyết định 219)
 */
export function buildCathedralInteriorArtScript(): string {
  return `
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawStainedGlass(c, x, y, w, h) {
  R(c, x, y + 6, w, h - 6, INK);
  E(c, x + (w >> 1), y + 6, w >> 1, 6, INK);
  R(c, x + 2, y + 6, w - 4, h - 8, '#1E3A8A');
  E(c, x + (w >> 1), y + 6, (w >> 1) - 2, 5, '#2563EB');
  // Hoa văn kính màu xanh coban, đỏ ruby & vàng hổ phách
  for (var py = y + 6; py < y + h - 4; py += 6) {
    R(c, x + 4, py, w - 8, 3, (py % 12 === 0) ? '#DC2626' : '#F59E0B');
    R(c, x + (w >> 1) - 2, py, 4, 4, '#FEF08A');
  }
  R(c, x + (w >> 1), y + 2, 1, h - 4, INK);
}

function drawChandelier(c, cx, y) {
  R(c, cx, y - 16, 1, 16, '#8C5C18');
  R(c, cx - 10, y, 21, 2, '#D99B38');
  R(c, cx - 6, y + 3, 13, 2, '#B97A14');
  [-9, -5, 0, 5, 9].forEach(function (dx) {
    R(c, cx + dx, y - 3, 2, 3, '#FFF8D6');
    R(c, cx + dx, y - 5, 2, 2, '#FACC15');
  });
}

function drawCongregationPerson(c, px, py, o) {
  o = o || {};
  var shirt = o.shirt || '#334155';
  var hair = o.hair || '#2B2118';
  // Nhìn từ phía sau/trên xuống (đang hướng mặt về Cung Thánh)
  R(c, px, py - 9, 9, 7, INK);
  R(c, px + 1, py - 8, 7, 5, shirt);
  R(c, px + 1, py - 8, 2, 4, 'rgba(255,255,255,0.18)');
  R(c, px + 1, py - 14, 7, 6, INK);
  R(c, px + 2, py - 13, 5, 4, hair);
  R(c, px + 2, py - 10, 5, 1, '#E5C29F'); // gáy cổ
}

function drawCathedralBg(x, WORLD_W, WORLD_H) {
  // 1. NỀN TƯỜNG VỮA KEM CỔ KÍNH CHÂU ÂU (y: 0..204)
  R(x, 0, 0, WORLD_W, 204, '#EDE2CC');
  for (var gx = 0; gx < WORLD_W; gx += 16) R(x, gx, 0, 1, 204, 'rgba(130,100,65,0.10)');

  // 2. VÒM TRẦN GOTHIC-ROMANESQUE 3 TẦNG GÂN VÀNG ĐẤT (trung tâm x: 140..500, y: 0..196)
  R(x, 140, 0, 360, 196, '#F5ECD8');
  // Khung vòm lớn với các đường gân nâu vàng uốn cong cổ kính (như Ảnh 1 & 3)
  [0, 14, 28, 44].forEach(function (inset, idx) {
    var archW = 360 - inset * 2;
    var ax = 140 + inset;
    var ay = 6 + idx * 14;
    R(x, ax, ay, 4, 190 - ay, '#C98C36');
    R(x, ax + archW - 4, ay, 4, 190 - ay, '#C98C36');
    for (var k = 0; k < 24; k++) {
      var px1 = ax + Math.round((k / 24) * (archW >> 1));
      var px2 = ax + archW - Math.round((k / 24) * (archW >> 1)) - 4;
      var py = ay + Math.round(Math.pow(1 - k / 24, 1.8) * 32);
      R(x, px1, py, 5, 3, '#B97A14'); R(x, px1, py, 5, 1, '#F5CA72');
      R(x, px2, py, 5, 3, '#B97A14'); R(x, px2, py, 5, 1, '#F5CA72');
    }
  });

  // 3 Ô CỬA KÍNH MÀU STAINED-GLASS CAO VÚT (y: 26..68)
  drawStainedGlass(x, 244, 30, 26, 40);
  drawStainedGlass(x, 307, 22, 26, 44);
  drawStainedGlass(x, 370, 30, 26, 40);

  // TẦNG GIỮA: CỬA VÒM GỖ NÂU & THÁNH GIÁ TRUNG TÂM (y: 78..126)
  // 2 khung vòm gỗ hai bên
  [236, 372].forEach(function (vx) {
    R(x, vx, 82, 32, 42, INK); R(x, vx + 1, 83, 30, 40, '#B97A14');
    R(x, vx + 4, 88, 10, 32, '#E6D8BE'); R(x, vx + 18, 88, 10, 32, '#E6D8BE');
  });
  // Hốc Thánh Giá trung tâm
  R(x, 296, 78, 48, 48, INK); R(x, 297, 79, 46, 46, '#C98C36'); R(x, 301, 83, 38, 38, '#F5EBD6');
  R(x, 318, 86, 4, 32, '#5C381E'); R(x, 308, 94, 24, 4, '#5C381E'); // Thánh Giá
  R(x, 317, 94, 6, 12, '#E5C29F');

  // TẦNG DƯỚI: CUNG THÁNH, TƯỢNG ĐỨC MẸ, BÀN THỜ & 2 CHÙM ĐÈN PHA LÊ (y: 132..204)
  // 3 vòm cung thánh vàng ấm
  [226, 294, 362].forEach(function (ax, i) {
    var aw = i === 1 ? 52 : 48;
    R(x, ax, 138, aw, 58, INK);
    R(x, ax + 1, 139, aw - 2, 56, i === 1 ? '#EFE1C0' : '#D8C39A');
    E(x, ax + (aw >> 1), 144, (aw >> 1) - 2, 10, i === 1 ? '#EFE1C0' : '#D8C39A');
  });
  // Tượng Đức Mẹ trắng tinh khôi giữa vòm trung tâm
  R(x, 316, 150, 8, 22, '#FFFBF1'); R(x, 317, 146, 6, 5, '#FFFBF1'); R(x, 314, 172, 12, 4, '#D99B38');
  // 2 Chùm đèn pha lê vàng rực hai bên Cung Thánh
  drawChandelier(x, 250, 166);
  drawChandelier(x, 386, 166);

  // Bậc tam cấp Cung Thánh & Bàn Thờ phủ khăn trắng + Hoa trắng vàng + 6 Nến
  R(x, 214, 192, 212, 12, INK); R(x, 215, 193, 210, 5, '#D4C5AC'); R(x, 215, 198, 210, 5, '#B8A68B');
  // 4 Linh mục áo trắng đứng dâng lễ sau bàn thờ
  [282, 302, 330, 348].forEach(function (lx) {
    R(x, lx, 168, 9, 18, INK); R(x, lx + 1, 169, 7, 16, '#FFFBF1'); R(x, lx + 3, 170, 3, 14, '#F5CA72');
    R(x, lx + 2, 163, 5, 5, '#E5C29F');
  });
  // Bàn thờ trung tâm
  R(x, 286, 178, 68, 16, INK); R(x, 287, 179, 66, 6, '#FFFFFF'); R(x, 287, 185, 66, 8, '#C8A97E');
  // Dải hoa trắng vàng chân bàn thờ
  for (var flx = 290; flx < 350; flx += 6) {
    R(x, flx, 191, 4, 3, '#22C55E'); R(x, flx + 1, 190, 2, 2, (flx % 12 === 0) ? '#FFFBF1' : '#FEF08A');
  }

  // 3. HAI HÀNH LANG PHỤ CỘT VÒM CỔ KÍNH CHÂU ÂU (Trái x: 0..104 & Phải x: 536..640)
  [0, 540].forEach(function (sx) {
    R(x, sx, 0, 100, 204, '#E8DEC9');
    // Hốc vòm tường trắng kem + trụ cột nâu vàng dọc suốt hai bên
    R(x, sx + 16, 44, 68, 152, INK); R(x, sx + 18, 46, 64, 148, '#F7F1E3');
    E(x, sx + 50, 50, 30, 14, '#F7F1E3');
    R(x, sx + 88, 0, 10, 204, '#8C5832'); R(x, sx + 90, 0, 3, 204, '#D99B38');
    R(x, sx + 2, 0, 10, 204, '#8C5832'); R(x, sx + 4, 0, 3, 204, '#D99B38');
  });

  // 4. SÀN GẠCH BÓNG LOÁNG CỔ KÍNH (y: 204..520)
  for (var fx = 0; fx < WORLD_W; fx += 16) {
    for (var fy = 204; fy < WORLD_H; fy += 16) {
      var alt = ((fx / 16) + (fy / 16)) % 2 === 0;
      var inCenterAisle = (fx >= 272 && fx < 368);
      var col = inCenterAisle ? (alt ? '#E6DBC8' : '#D9CCB5') : (alt ? '#CFC2AC' : '#C2B39B');
      R(x, fx, fy, 16, 16, col);
      R(x, fx, fy, 16, 1, 'rgba(65,50,35,0.18)');
      R(x, fx, fy, 1, 16, 'rgba(65,50,35,0.18)');
    }
  }
  // Vệt phản chiếu ánh sáng vàng lung linh dọc lối đi trung tâm (như Ảnh 1 & 3)
  x.save();
  x.globalAlpha = 0.28;
  R(x, 294, 204, 52, 260, '#FFF8D6');
  x.globalAlpha = 0.16;
  R(x, 282, 204, 76, 260, '#FEF08A');
  x.restore();

  // Trụ cột hai bên hành lang phụ xuyên suốt chiều sâu sảnh + màn hình nhỏ gắn cột
  [240, 316, 392, 464].forEach(function (cy) {
    [82, 542].forEach(function (cx) {
      R(x, cx, cy - 12, 16, 22, INK); R(x, cx + 1, cy - 11, 14, 20, '#F5EBD6');
      R(x, cx + 3, cy - 11, 4, 20, '#C98C36');
      // Màn hình nhỏ gắn cột như ảnh thực tế
      R(x, cx + (cx < 300 ? -12 : 16), cy - 4, 10, 8, INK);
      R(x, cx + (cx < 300 ? -11 : 17), cy - 3, 8, 6, '#1E293B');
    });
  });

  // 5. CỔNG VÒM CỔ KÍNH RA PHỐ KHÁM PHÁ Ở ĐÁY SẢNH (x: 274..366, y: 472..520)
  R(x, 274, 474, 92, 46, INK);
  R(x, 276, 476, 88, 44, '#8C5832');
  R(x, 284, 482, 72, 36, '#5C381E');
  R(x, 292, 486, 56, 28, '#FDE68A'); // ánh sáng nắng phố hắt qua ngưỡng cửa
  R(x, 286, 466, 68, 8, '#9E2A2B'); R(x, 294, 469, 52, 2, '#F4B93B'); // thảm đỏ cuối sảnh
}

// 2 CÁNH 8 HÀNG GHẾ GỖ ĐÁNH BÓNG + ~60 NGƯỜI NGỒI DỰ LỄ TRANG NGHIÊM
function drawCathedralPewsLayer(x) {
  var rng = mulberry32(21900);
  var shirts = ['#FFFBF1', '#38BDF8', '#1E293B', '#475569', '#94A3B8', '#F472B6', '#10B981', '#F59E0B', '#6366F1', '#E2E8F0'];
  var hairs = ['#2B2118', '#3F2E21', '#5C4033', '#94A3B8', '#1E293B'];

  for (var row = 0; row < 8; row++) {
    var py = 228 + row * 28;
    // Cánh Trái (x: 112..268) & Cánh Phải (x: 372..528)
    [112, 372].forEach(function (px) {
      // Bóng đổ ghế gỗ
      R(x, px + 2, py + 14, 156, 3, 'rgba(43,33,24,0.26)');
      // Người ngồi dự lễ trên hàng ghế (~3-4 người mỗi bên -> ~56-62 người tổng cộng)
      for (var seat = 0; seat < 5; seat++) {
        if (rng() < 0.78) {
          var sx = px + 10 + seat * 28 + Math.round((rng() - 0.5) * 4);
          drawCongregationPerson(x, sx, py + 9, {
            shirt: shirts[(rng() * shirts.length) | 0],
            hair: hairs[(rng() * hairs.length) | 0]
          });
        }
      }
      // Ghế gỗ dài đánh bóng nâu trầm có lưng tựa & tay vịn 2 đầu
      R(x, px, py, 156, 14, INK);
      R(x, px + 1, py + 1, 154, 4, '#B87D4B'); // cạnh trên lưng ghế bắt ánh sáng vàng
      R(x, px + 1, py + 5, 154, 8, '#7A4924'); // thân gỗ nâu trầm
      R(x, px + 2, py + 2, 152, 1, '#E6B87A'); // vệt bóng gỗ
      R(x, px, py - 2, 4, 16, INK); R(x, px + 1, py - 1, 2, 14, '#5C381E');
      R(x, px + 152, py - 2, 4, 16, INK); R(x, px + 153, py - 1, 2, 14, '#5C381E');
    });
  }
}

// ÁNH SÁNG VÀNG LUNG LINH 60FPS: TIA SÁNG KÍNH MÀU, CHÙM ĐÈN PHA LÊ, NẾN, QUẠT ĐỨNG & BỤI VÀNG
function drawCathedralLiveEffects(x, t) {
  // 1. Tia sáng chéo dịu từ 3 cửa kính màu stained-glass
  x.save();
  x.globalAlpha = 0.08 + Math.sin(t * 1.4) * 0.02;
  [[248, 66, '#93C5FD'], [312, 62, '#FEF08A'], [374, 66, '#FCA5A5']].forEach(function (beam) {
    for (var dy = 0; dy < 120; dy += 4) {
      R(x, beam[0] + Math.round(dy * 0.14), beam[1] + dy, 22, 4, beam[2]);
    }
  });

  // 2. Quầng sáng vàng lung linh quanh 2 chùm đèn pha lê & đèn dọc 2 bên cột
  x.globalAlpha = 0.24 + Math.sin(t * 3.2) * 0.05;
  E(x, 250, 164, 24, 18, '#FFE08A');
  E(x, 386, 164, 24, 18, '#FFE08A');
  E(x, 320, 174, 34, 22, '#FEF08A');
  [240, 316, 392, 464].forEach(function (cy, i) {
    x.globalAlpha = 0.16 + Math.sin(t * 2.6 + i) * 0.04;
    E(x, 90, cy - 10, 16, 12, '#FFE08A');
    E(x, 550, cy - 10, 16, 12, '#FFE08A');
  });
  x.restore();

  // 3. 6 ngọn nến lung linh trên bàn thờ Cung Thánh
  [292, 302, 312, 326, 336, 346].forEach(function (nx, idx) {
    R(x, nx, 174, 2, 5, '#FFFBF1');
    var fl = ((t * 8 + idx) | 0) % 2 === 0;
    R(x, nx, fl ? 171 : 172, 2, 2, '#FACC15');
    R(x, nx, 170, 1, 1, '#FFF8D6');
  });

  // 4. Quạt đứng 2 bên cột quay êm (như Ảnh 1 & 3)
  [[104, 238], [534, 238], [104, 390], [534, 390]].forEach(function (fp, i) {
    E(x, fp[0], fp[1], 5, 5, INK); E(x, fp[0], fp[1], 4, 4, '#334155');
    var sp = Math.max(1, Math.round(Math.abs(Math.sin(t * 9 + i)) * 4));
    R(x, fp[0] - sp, fp[1] - 1, sp * 2, 2, '#CBD5E1');
  });

  // 5. 45 Hạt bụi ánh sáng vàng bay lơ lửng lung linh 60fps
  x.save();
  for (var d = 0; d < 45; d++) {
    var bx = ((d * 73 + Math.round(Math.sin(t * 0.7 + d) * 10)) % 560) + 40;
    var by = ((d * 47 + Math.round(t * (4 + (d % 4)))) % 440) + 30;
    x.globalAlpha = 0.25 + Math.abs(Math.sin(t * 2 + d)) * 0.45;
    R(x, bx, by, (d % 3 === 0) ? 2 : 1, (d % 3 === 0) ? 2 : 1, (d % 2 === 0) ? '#FEF08A' : '#FFFBF1');
  }
  x.restore();
}
`;
}
