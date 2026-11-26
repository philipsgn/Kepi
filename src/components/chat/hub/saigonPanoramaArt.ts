/**
 * Đồ họa Pixel Art Đại Lộ Sài Gòn & Bến Bạch Đằng Panorama (1160 × 128 — Quyết định 221)
 * Chuẩn công thức pixel-mascot-ui: 1 offscreen canvas liền mạch, viền nâu mực #2B2118,
 * bóng tiếp xúc, tự động đổi 3 sắc trời (Sáng/Chiều/Tối), skyline xa Bitexco & Landmark 81,
 * 7 công trình mặt tiền, đại lộ 2 làn 6 loại xe + CSGT áo vàng, và sông Bạch Đằng (Cầu đi bộ, Cầu Ba Son, tàu thuyền lớn).
 */
export function buildSaigonPanoramaArtScript(): string {
  return `
function fbTimePalette(h) {
  if (h >= 6 && h < 16) {
    return {
      mode: 'day',
      sky: ['#69B1F6','#85C2FA','#A2D3FD','#BEE2FF','#D8EEFF','#EAF5FF'],
      cloud: '#FFFDF8', cloudSh: '#C8DEF2',
      skylineFar: '#8BB2D6', skylineMid: '#6E95BC',
      waterTop: '#3B95C9', waterMid: '#2D7FB3', waterBot: '#1F6494',
      waterGlint: '#BEE9FF',
      nightGlow: 0, warmGlow: 0.14
    };
  }
  if (h >= 16 && h < 19) {
    return {
      mode: 'sunset',
      sky: ['#5C4B99','#8C5E9C','#C7778E','#EE9C7C','#F8BD82','#FCE0A4'],
      cloud: '#FFE8C8', cloudSh: '#D98E8E',
      skylineFar: '#6C5986', skylineMid: '#4F4269',
      waterTop: '#6A6596', waterMid: '#554E7F', waterBot: '#39335C',
      waterGlint: '#FFD39A',
      nightGlow: 0.6, warmGlow: 0.65
    };
  }
  return {
    mode: 'night',
    sky: ['#131730','#1A2044','#252C5A','#313970','#3E4682','#4D5490'],
    cloud: '#3B4478', cloudSh: '#22284F',
    skylineFar: '#1E2547', skylineMid: '#151B36',
    waterTop: '#162547', waterMid: '#111D3A', waterBot: '#0B1328',
    waterGlint: '#F4C668',
    nightGlow: 1.0, warmGlow: 0.95
  };
}

function fbDrawLine(c, x0, y0, x1, y1, col) {
  x0 = x0 | 0; y0 = y0 | 0; x1 = x1 | 0; y1 = y1 | 0;
  var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  var err = dx - dy;
  c.fillStyle = col;
  while (true) {
    c.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    var e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}

/* ==================== 1. SKYLINE NỀN XA (BITEXCO + LANDMARK 81) ==================== */
function drawFarSkyline(c, pal, W) {
  var farC = pal.skylineFar;
  var midC = pal.skylineMid;
  var winC = pal.mode === 'night' ? '#FFE18A' : (pal.mode === 'sunset' ? '#FFD699' : '#DDF0FF');
  var winA = pal.mode === 'night' ? 0.78 : (pal.mode === 'sunset' ? 0.55 : 0.42);

  // Dãy cao ốc xa mờ tạo chiều sâu dọc toàn tuyến
  var farBlocks = [
    [18, 28, 16], [42, 22, 14], [74, 30, 18], [116, 20, 16], [148, 26, 18],
    [184, 18, 16], [286, 22, 20], [312, 28, 16], [362, 24, 18], [410, 20, 16],
    [468, 18, 22], [500, 24, 18], [552, 22, 20], [608, 18, 22], [652, 26, 18],
    [714, 22, 20], [746, 26, 16], [834, 20, 22], [866, 26, 18], [912, 22, 20],
    [958, 28, 18], [1004, 24, 20], [1096, 26, 18], [1124, 22, 22]
  ];
  for (var i = 0; i < farBlocks.length; i++) {
    var b = farBlocks[i];
    R(c, b[0], b[1], b[2], 66 - b[1], farC);
    R(c, b[0], b[1], b[2], 1, midC);
    if (pal.mode !== 'day') {
      c.save();
      c.globalAlpha = winA * 0.55;
      for (var wy = b[1] + 3; wy < 56; wy += 4) {
        for (var wx = b[0] + 2; wx < b[0] + b[2] - 2; wx += 3) {
          if (((wx * 7 + wy * 13) % 5) !== 0) R(c, wx, wy, 1, 2, winC);
        }
      }
      c.restore();
    }
  }

  // ---- BITEXCO FINANCIAL TOWER (Nền xa x = 242..266, vươn cao lên trời) ----
  var bx = 246;
  var bitBody = pal.mode === 'night' ? '#24345C' : (pal.mode === 'sunset' ? '#584B78' : '#5E88B4');
  var bitHi = pal.mode === 'night' ? '#3B568E' : (pal.mode === 'sunset' ? '#7E6BA0' : '#89B5DF');
  var bitDk = pal.mode === 'night' ? '#172240' : '#3C5878';
  // Thân tháp thuôn hình búp sen
  for (var ty = 6; ty < 64; ty++) {
    var tNorm = (ty - 6) / 58;
    var wT = Math.round(7 + tNorm * 10);
    var xT = bx + Math.round((17 - wT) * 0.45);
    R(c, xT, ty, wT, 1, bitBody);
    R(c, xT + 1, ty, Math.max(1, Math.floor(wT * 0.35)), 1, bitHi);
    R(c, xT + wT - 2, ty, 2, 1, bitDk);
  }
  // Đỉnh vát chéo Bitexco
  R(c, bx + 4, 4, 4, 2, bitHi);
  R(c, bx + 5, 2, 1, 2, '#E0452B'); // Đèn hàng không đỉnh tháp
  // Sân đáp trực thăng (Helipad) vươn ngang đặc trưng
  R(c, bx + 12, 18, 12, 2, '#D7E5F5');
  R(c, bx + 11, 20, 11, 2, bitDk);
  R(c, bx + 15, 17, 6, 1, '#FFE18A');
  // Cửa kính sọc ngang Bitexco
  c.save();
  c.globalAlpha = winA;
  for (var by = 10; by < 56; by += 3) {
    R(c, bx + 4, by, 7, 1, winC);
  }
  c.restore();

  // ---- LANDMARK 81 (Nền xa x = 776..816, tháp bó tre cao nhất Sài Gòn) ----
  var lx = 784;
  var lmBody = pal.mode === 'night' ? '#223359' : (pal.mode === 'sunset' ? '#5B4C7C' : '#5D89B8');
  var lmHi = pal.mode === 'night' ? '#496DAA' : (pal.mode === 'sunset' ? '#927AB8' : '#96C2EB');
  var lmDk = pal.mode === 'night' ? '#15203C' : '#3A587A';
  // Các khối bó tre giật cấp từ thấp tới cao
  var tiers = [
    { dx: 0, w: 4, top: 34 },
    { dx: 3, w: 5, top: 24 },
    { dx: 7, w: 5, top: 14 },
    { dx: 11, w: 5, top: 6 },
    { dx: 15, w: 4, top: 15 },
    { dx: 18, w: 4, top: 26 },
    { dx: 21, w: 4, top: 36 }
  ];
  for (var ti = 0; ti < tiers.length; ti++) {
    var tr = tiers[ti];
    R(c, lx + tr.dx, tr.top, tr.w, 64 - tr.top, lmBody);
    R(c, lx + tr.dx, tr.top, 2, 64 - tr.top, lmHi);
    R(c, lx + tr.dx + tr.w - 1, tr.top, 1, 64 - tr.top, lmDk);
    R(c, lx + tr.dx, tr.top, tr.w, 1, '#EAF4FF');
  }
  // Ăng-ten đỉnh Landmark 81
  R(c, lx + 13, 1, 1, 5, '#FFF6DA');
  // Đèn kính LED Landmark 81
  c.save();
  c.globalAlpha = winA;
  for (var ly = 9; ly < 56; ly += 3) {
    var spanL = ly < 16 ? 4 : (ly < 26 ? 12 : 18);
    var startL = ly < 16 ? 11 : (ly < 26 ? 7 : 4);
    for (var lxi = startL; lxi < startL + spanL; lxi += 3) {
      R(c, lx + lxi, ly, 2, 1, winC);
    }
  }
  c.restore();
}

/* ==================== 2. 7 CÔNG TRÌNH MẶT TIỀN (x: 0..856) ==================== */
function drawSaigonLandmarks(c, pal) {
  var isDark = pal.mode !== 'day';

  // ---- 1. QUÁN PHỞ CỔ TRUYỀN (x: 8..96, y: 24..68) ----
  R(c, 10, 26, 82, 42, '#F2DBAE'); // Tường vàng phố cổ
  R(c, 10, 26, 82, 2, '#2B2118');
  R(c, 10, 26, 2, 42, '#2B2118');
  R(c, 90, 26, 2, 42, '#2B2118');
  // Mái ngói đỏ âm dương
  R(c, 7, 20, 88, 7, '#B8422A');
  R(c, 9, 18, 84, 3, '#D65A3E');
  R(c, 7, 26, 88, 2, '#2B2118');
  for (var rx = 11; rx < 91; rx += 5) R(c, rx, 20, 1, 6, '#8F2E1C');
  // Cửa sổ tầng 2 chớp gỗ xanh
  R(c, 22, 30, 16, 12, '#2B2118'); R(c, 23, 31, 14, 10, '#3C7A52');
  R(c, 29, 31, 2, 10, '#2B2118');
  R(c, 58, 30, 16, 12, '#2B2118'); R(c, 59, 31, 14, 10, '#3C7A52');
  R(c, 65, 31, 2, 10, '#2B2118');
  // Biển hiệu đỏ chữ vàng "PHO"
  R(c, 18, 43, 66, 9, '#2B2118');
  R(c, 19, 44, 64, 7, '#C92A22');
  R(c, 20, 45, 62, 1, '#F4B93B');
  // Chữ pixel P H O
  R(c, 37, 46, 2, 4, '#FFE57F'); R(c, 39, 46, 2, 2, '#FFE57F');
  R(c, 43, 46, 1, 4, '#FFE57F'); R(c, 46, 46, 1, 4, '#FFE57F'); R(c, 44, 48, 2, 1, '#FFE57F');
  R(c, 49, 46, 4, 4, '#FFE57F'); R(c, 50, 47, 2, 2, '#C92A22');
  R(c, 50, 45, 2, 1, '#FFE57F');
  // Cửa vào quán ấm sáng + Tủ kính thịt bò + Nồi phở inox
  R(c, 15, 53, 72, 15, isDark ? '#543522' : '#4A3123');
  R(c, 17, 55, 26, 13, isDark ? '#F5C469' : '#D9B98A'); // Ánh đèn trong quán
  // Tủ kính phở
  R(c, 46, 54, 18, 14, '#2B2118');
  R(c, 47, 55, 16, 12, '#CBEBF7');
  R(c, 49, 57, 4, 5, '#B84A39'); // Thịt bò treo
  R(c, 55, 58, 5, 4, '#54A34A'); // Hành rau
  // Nồi nước dùng inox lớn bốc khói
  R(c, 68, 57, 13, 11, '#2B2118');
  R(c, 69, 58, 11, 9, '#B8C4CE');
  R(c, 70, 58, 3, 8, '#EAF2F8');
  R(c, 69, 57, 11, 2, '#6C7A86');
  // Bàn ghế nhựa vỉa hè trước quán phở
  R(c, 16, 65, 12, 4, '#C8D4DC'); R(c, 18, 69, 1, 3, '#2B2118'); R(c, 25, 69, 1, 3, '#2B2118');
  R(c, 13, 67, 3, 4, '#2563EB'); R(c, 29, 67, 3, 4, '#E0452B');

  // ---- 2. TIỆM CÀ PHÊ SÀI GÒN (x: 106..204, y: 20..68) — Cổng vào Cafe QĐ 218 ----
  R(c, 108, 22, 92, 46, '#F7E7C6');
  R(c, 108, 22, 92, 2, '#2B2118');
  R(c, 108, 22, 2, 46, '#2B2118');
  R(c, 198, 22, 2, 46, '#2B2118');
  // Mái ngói nâu sẫm & cửa sổ vòm tầng 2
  R(c, 105, 18, 98, 5, '#6B4226');
  R(c, 105, 22, 98, 2, '#2B2118');
  for (var cx = 116; cx <= 180; cx += 24) {
    R(c, cx, 27, 14, 11, '#2B2118');
    R(c, cx + 1, 28, 12, 9, isDark ? '#F5C469' : '#6F98B8');
    R(c, cx + 6, 28, 2, 9, '#5C3A22');
  }
  // Bảng hiệu gỗ "CAFE"
  R(c, 124, 40, 60, 8, '#2B2118');
  R(c, 125, 41, 58, 6, '#3B2618');
  // Chữ CAFE sáng vàng
  R(c, 140, 42, 3, 4, '#FFE08A'); R(c, 141, 43, 2, 2, '#3B2618');
  R(c, 145, 42, 3, 4, '#FFE08A'); R(c, 146, 43, 1, 1, '#3B2618'); R(c, 146, 45, 1, 1, '#3B2618');
  R(c, 150, 42, 3, 4, '#FFE08A'); R(c, 151, 43, 2, 1, '#3B2618'); R(c, 151, 45, 2, 1, '#3B2618');
  R(c, 155, 42, 3, 4, '#FFE08A'); R(c, 156, 43, 2, 1, '#3B2618'); R(c, 156, 45, 2, 1, '#3B2118');
  // Mái hiên sọc đỏ - kem
  for (var ax = 109; ax < 199; ax += 6) {
    R(c, ax, 48, 3, 6, '#D94330');
    R(c, ax + 3, 48, 3, 6, '#FFF6E5');
  }
  R(c, 108, 54, 92, 1, '#2B2118');
  // Cửa kính ấm & cửa ra vào
  R(c, 114, 55, 28, 13, '#2B2118'); R(c, 115, 56, 26, 12, isDark ? '#F5C469' : '#A9C8D9');
  R(c, 146, 55, 18, 13, '#2B2118'); R(c, 147, 56, 16, 12, '#6E452A'); // Cửa gỗ vào quán
  R(c, 150, 58, 10, 7, isDark ? '#FFE291' : '#C9E1EE');
  R(c, 168, 55, 26, 13, '#2B2118'); R(c, 169, 56, 24, 12, isDark ? '#F5C469' : '#A9C8D9');
  // Chậu cây & bảng phấn trước tiệm cafe
  R(c, 109, 62, 5, 6, '#A65432'); R(c, 108, 58, 7, 5, '#4A8C3F');
  R(c, 194, 62, 5, 6, '#A65432'); R(c, 193, 58, 7, 5, '#4A8C3F');

  // ---- 3. CỬA HÀNG QUẦN ÁO ADIDAS (x: 214..314, y: 18..68) — MỚI ----
  R(c, 215, 20, 96, 48, '#23272F'); // Mặt tiền hiện đại đen-xám
  R(c, 215, 20, 96, 2, '#111419');
  R(c, 215, 20, 2, 48, '#111419');
  R(c, 309, 20, 2, 48, '#111419');
  // Khung nhôm xám bạc kiến trúc flagship
  R(c, 217, 22, 92, 14, '#181B22');
  R(c, 217, 36, 92, 2, '#C8D2DE');
  // Logo 3 sọc chéo Adidas trắng (Performance Mountains) sắc nét
  R(c, 232, 31, 3, 3, '#FFFFFF');
  R(c, 236, 28, 3, 6, '#FFFFFF');
  R(c, 240, 25, 3, 9, '#FFFFFF');
  // Chữ pixel "ADIDAS" màu trắng
  R(c, 249, 28, 3, 5, '#FFFFFF'); R(c, 250, 29, 1, 1, '#181B22'); R(c, 250, 31, 1, 2, '#181B22');
  R(c, 254, 28, 3, 5, '#FFFFFF'); R(c, 255, 29, 1, 3, '#181B22');
  R(c, 259, 28, 2, 5, '#FFFFFF');
  R(c, 263, 28, 3, 5, '#FFFFFF'); R(c, 264, 29, 1, 3, '#181B22');
  R(c, 268, 28, 3, 5, '#FFFFFF'); R(c, 269, 29, 1, 1, '#181B22'); R(c, 269, 31, 1, 2, '#181B22');
  R(c, 273, 28, 3, 5, '#FFFFFF'); R(c, 274, 29, 2, 1, '#181B22'); R(c, 273, 31, 2, 1, '#181B22');
  // 3 sọc trắng trang trí chạy dọc mép phải cửa hàng
  R(c, 295, 23, 2, 12, '#FFFFFF');
  R(c, 299, 23, 2, 12, '#FFFFFF');
  R(c, 303, 23, 2, 12, '#FFFFFF');
  // Tủ kính trưng bày lớn sáng đèn spotlight
  R(c, 219, 39, 32, 27, '#D7E7F2'); // Kính trái
  R(c, 220, 40, 30, 25, isDark ? '#F5E9C8' : '#E5F0F7');
  // Đèn spotlight trần
  R(c, 225, 40, 4, 2, '#FFF8D6'); R(c, 239, 40, 4, 2, '#FFF8D6');
  // 2 Ma-nơ-canh mặc áo khoác thể thao 3 sọc
  // Ma-nơ-canh 1 (áo đỏ 3 sọc trắng)
  R(c, 225, 46, 4, 4, '#E8DCC8'); // Đầu
  R(c, 223, 50, 8, 9, '#D93B30'); // Áo khoác đỏ
  R(c, 225, 51, 1, 7, '#FFFFFF'); R(c, 228, 51, 1, 7, '#FFFFFF');
  R(c, 225, 59, 4, 6, '#1E242E'); // Quần thể thao đen
  // Ma-nơ-canh 2 (áo đen 3 sọc trắng)
  R(c, 238, 46, 4, 4, '#E8DCC8');
  R(c, 236, 50, 8, 9, '#1F242D');
  R(c, 238, 51, 1, 7, '#FFFFFF'); R(c, 241, 51, 1, 7, '#FFFFFF');
  R(c, 238, 59, 4, 6, '#3B639C');
  // Cửa kính tự động chính giữa
  R(c, 254, 41, 20, 27, '#111419');
  R(c, 255, 42, 18, 26, isDark ? '#E8D8A8' : '#95B5CE');
  R(c, 263, 42, 2, 26, '#23272F');
  R(c, 261, 53, 1, 5, '#FFFFFF'); R(c, 266, 53, 1, 5, '#FFFFFF');
  // Kính phải: Kệ giày sneaker nhiều màu
  R(c, 277, 39, 30, 27, '#D7E7F2');
  R(c, 278, 40, 28, 25, isDark ? '#F5E9C8' : '#E5F0F7');
  R(c, 280, 47, 24, 2, '#2B2118'); // Kệ trên
  R(c, 282, 44, 5, 3, '#FFFFFF'); R(c, 289, 44, 5, 3, '#E0452B'); R(c, 296, 44, 5, 3, '#2563EB');
  R(c, 280, 55, 24, 2, '#2B2118'); // Kệ giữa
  R(c, 282, 52, 5, 3, '#1E242E'); R(c, 289, 52, 5, 3, '#F4B93B'); R(c, 296, 52, 5, 3, '#22C55E');
  R(c, 280, 62, 24, 2, '#2B2118'); // Kệ dưới
  R(c, 284, 59, 6, 3, '#FFFFFF'); R(c, 293, 59, 6, 3, '#D93B30');

  // ---- 4. NHÀ THỜ ĐỨC BÀ SÀI GÒN (x: 324..404, y: 6..68) — Cổng vào Cathedral QĐ 219 ----
  var ndBrick = '#B54B34', ndHi = '#CE6046', ndDk = '#873321', ndCream = '#EFE2C8';
  // Hai tháp chuông gạch đỏ cổ kính
  var towers = [328, 376];
  for (var nti = 0; nti < 2; nti++) {
    var tx = towers[nti];
    // Chóp sắt nhọn + thánh giá
    R(c, tx + 9, 5, 2, 4, '#F4C44E'); R(c, tx + 8, 6, 4, 1, '#F4C44E');
    for (var sy = 9; sy < 22; sy++) {
      var sw = Math.max(2, Math.round(((sy - 8) / 13) * 16));
      R(c, tx + 10 - Math.floor(sw / 2), sy, sw, 1, '#4C5866');
    }
    R(c, tx, 22, 20, 46, ndBrick);
    R(c, tx, 22, 2, 46, ndHi);
    R(c, tx + 18, 22, 2, 46, ndDk);
    R(c, tx - 1, 22, 22, 2, ndCream);
    R(c, tx - 1, 38, 22, 2, ndCream);
    R(c, tx - 1, 52, 22, 2, ndCream);
    // Ô cửa vòm tháp chuông
    R(c, tx + 6, 26, 8, 10, '#2B2118'); R(c, tx + 7, 27, 6, 8, isDark ? '#F5C469' : '#4E2A20');
    R(c, tx + 7, 42, 6, 8, '#2B2118'); R(c, tx + 8, 43, 4, 6, isDark ? '#F5C469' : '#4E2A20');
  }
  // Khối thân chính giữa & cửa sổ hoa hồng
  R(c, 348, 30, 28, 38, ndBrick);
  R(c, 348, 30, 28, 2, ndCream);
  // Đồng hồ / Hoa hồng tròn
  E(c, 362, 40, 5, 5, '#2B2118');
  E(c, 362, 40, 4, 4, isDark ? '#FFE08A' : '#EFE2C8');
  E(c, 362, 40, 2, 2, '#D9534F');
  // Vòm cổng chính
  R(c, 353, 52, 18, 16, '#2B2118');
  R(c, 355, 54, 14, 14, isDark ? '#F2B857' : '#4A2C1D');
  R(c, 358, 58, 8, 10, '#2B1B12');

  // ---- 5. CHỢ BẾN THÀNH — CỬA NAM (x: 414..526, y: 12..68) — Cổng vào Market QĐ 217 ----
  // Hai cánh mái ngói đỏ
  R(c, 416, 36, 108, 32, '#F2DFC0');
  R(c, 414, 30, 112, 7, '#C4452C');
  R(c, 416, 28, 108, 3, '#DE5D40');
  R(c, 414, 36, 112, 2, '#2B2118');
  R(c, 416, 36, 2, 32, '#2B2118');
  R(c, 522, 36, 2, 32, '#2B2118');
  // Tháp đồng hồ trung tâm
  R(c, 452, 16, 36, 52, '#F7E7CA');
  R(c, 452, 16, 2, 52, '#2B2118'); R(c, 486, 16, 2, 52, '#2B2118');
  R(c, 449, 13, 42, 5, '#C4452C');
  R(c, 455, 9, 30, 4, '#DE5D40');
  R(c, 464, 6, 12, 3, '#C4452C');
  // Mặt đồng hồ tròn Cửa Nam
  E(c, 470, 26, 7, 7, '#2B2118');
  E(c, 470, 26, 6, 6, '#FFFDF5');
  R(c, 470, 22, 1, 4, '#2B2118'); R(c, 470, 26, 4, 1, '#C4452C');
  // Bảng chữ xanh "CHỢ BẾN THÀNH"
  R(c, 454, 36, 32, 6, '#1E5B3A');
  R(c, 456, 38, 28, 2, '#FFF9E6');
  // 3 Cửa vòm chợ sâu hút
  var arches = [424, 458, 496];
  for (var ai = 0; ai < 3; ai++) {
    var axx = arches[ai];
    var aw = ai === 1 ? 24 : 18;
    var ay = ai === 1 ? 45 : 48;
    R(c, axx, ay, aw, 68 - ay, '#2B2118');
    R(c, axx + 2, ay + 2, aw - 4, 66 - ay, isDark ? '#E8A94E' : '#573624');
    R(c, axx + 4, ay + 5, aw - 8, 63 - ay, '#2B1B12');
  }
  // 2 Chậu bonsai trước cổng
  R(c, 448, 62, 6, 6, '#B55B34'); E(c, 451, 59, 4, 3, '#3D8C40');
  R(c, 486, 62, 6, 6, '#B55B34'); E(c, 489, 59, 4, 3, '#3D8C40');

  // ---- 6. SÂN VẬN ĐỘNG BÓNG ĐÁ THỐNG NHẤT (x: 536..686, y: 10..68) — MỚI ----
  // 4 Trụ đèn pha cao vút
  var floodXs = [544, 576, 646, 678];
  for (var fi = 0; fi < floodXs.length; fi++) {
    var fx = floodXs[fi];
    R(c, fx, 14, 3, 36, '#7C8B99');
    R(c, fx, 14, 1, 36, '#B5C4D1');
    // Giàn đèn pha lớn trên đỉnh
    R(c, fx - 5, 9, 13, 6, '#2B2118');
    R(c, fx - 4, 10, 11, 4, '#FFF9C4');
    R(c, fx - 3, 11, 2, 2, '#FFFFFF'); R(c, fx + 1, 11, 2, 2, '#FFFFFF'); R(c, fx + 4, 11, 2, 2, '#FFFFFF');
  }
  // Sân cỏ xanh & hàng khán đài lộ phía trên
  R(c, 542, 26, 138, 16, '#2E7D32');
  R(c, 542, 32, 138, 1, '#FFFFFF'); // Đường biên sân cỏ
  R(c, 560, 27, 102, 5, '#455A64'); // Khán đài đối diện
  // Khán giả chấm sắc màu trên khán đài
  var fanCols = ['#E0452B','#F4B93B','#FFFFFF','#38BDF8','#EF4444'];
  for (var fxi = 562; fxi < 660; fxi += 3) {
    R(c, fxi, 28 + (fxi % 2), 2, 2, fanCols[fxi % fanCols.length]);
  }
  // Mái vòm khán đài A trắng-xanh dương cong mềm
  R(c, 538, 34, 146, 8, '#E6EEF5');
  R(c, 542, 31, 138, 4, '#FFFFFF');
  R(c, 538, 34, 146, 2, '#1D5AA6'); // Viền xanh biểu tượng SVĐ
  R(c, 538, 41, 146, 2, '#2B2118');
  // Khối mặt tiền khán đài A & cổng chính
  R(c, 540, 43, 142, 25, '#EEF2F5');
  R(c, 540, 43, 2, 25, '#2B2118'); R(c, 680, 43, 2, 25, '#2B2118');
  // Các trụ vòm xanh-trắng
  for (var sx = 548; sx <= 668; sx += 15) {
    R(c, sx, 43, 4, 25, '#2563EB');
    R(c, sx + 1, 43, 1, 25, '#60A5FA');
  }
  // Bảng hiệu lớn "SVD THONG NHAT" chính giữa
  R(c, 578, 44, 66, 9, '#1B3B73');
  R(c, 579, 45, 64, 7, '#1D4ED8');
  R(c, 581, 47, 60, 2, '#FFE066'); // Chữ vàng nổi bật
  // Cổng vào sân cỏ & bảng tỷ số
  R(c, 594, 54, 34, 14, '#2B2118');
  R(c, 596, 56, 30, 12, '#2E7D32');
  R(c, 606, 59, 10, 9, '#1B4D21');
  // Quả bóng pixel trang trí trên cổng
  E(c, 611, 56, 3, 3, '#FFFFFF'); R(c, 611, 56, 1, 1, '#2B2118');

  // ---- 7. CHÙA VIỆT NAM CỔ KÍNH (x: 696..840, y: 12..68) — Cổng vào Pagoda QĐ 220 ----
  // Bảo Tháp 5 tầng mái đao cong đỏ-vàng phía sau bên trái
  var px = 716;
  R(c, px + 14, 6, 2, 6, '#F4B93B'); // Đỉnh tháp vàng
  for (var pt = 0; pt < 5; pt++) {
    var py = 12 + pt * 9;
    var pw = 14 + pt * 4;
    var pLeft = px + 15 - Math.floor(pw / 2);
    // Mái đao cong đỏ
    R(c, pLeft - 3, py + 2, pw + 6, 3, '#C93424');
    R(c, pLeft - 4, py + 1, 3, 2, '#F4B93B'); // Đầu đao cong trái
    R(c, pLeft + pw + 1, py + 1, 3, 2, '#F4B93B'); // Đầu đao cong phải
    R(c, pLeft, py + 5, pw, 5, '#F0C778'); // Thân tầng vàng
    R(c, pLeft + Math.floor(pw / 2) - 1, py + 6, 3, 3, '#3B2116');
  }
  // Cổng Tam Quan mái ngói đỏ-vàng (x: 758..834)
  R(c, 760, 42, 72, 26, '#F5E1B8');
  R(c, 756, 35, 80, 7, '#B83224');
  R(c, 764, 29, 64, 6, '#D13E2C');
  R(c, 755, 34, 4, 2, '#F4B93B'); R(c, 833, 34, 4, 2, '#F4B93B'); // Đầu đao cong
  R(c, 762, 28, 4, 2, '#F4B93B'); R(c, 826, 28, 4, 2, '#F4B93B');
  // 4 Cột gỗ đỏ sơn son thếp vàng
  var pCols = [764, 782, 808, 826];
  for (var ci = 0; ci < pCols.length; ci++) {
    R(c, pCols[ci], 42, 4, 26, '#9E261B');
    R(c, pCols[ci] + 1, 42, 1, 26, '#D64535');
  }
  // Cổng chính giữa & 2 cổng phụ
  R(c, 786, 48, 22, 20, '#2B2118');
  R(c, 788, 50, 18, 18, isDark ? '#F5C469' : '#4E2C1B');
  R(c, 793, 55, 8, 13, '#2B1910');
  // Bảng hoành phi vàng
  R(c, 788, 43, 18, 4, '#2B2118'); R(c, 789, 44, 16, 2, '#F4B93B');
  // Lư hương nhỏ & 2 cây bonsai
  R(c, 745, 60, 8, 8, '#8C5E3C'); R(c, 746, 59, 6, 2, '#F4B93B');
  R(c, 700, 61, 6, 7, '#A65432'); E(c, 703, 56, 6, 5, '#3A7D3C');
  R(c, 834, 61, 6, 7, '#A65432'); E(c, 837, 56, 6, 5, '#3A7D3C');
}

/* ==================== 3. VỈA HÈ + ĐẠI LỘ 2 LÀN (x: 0..864) ==================== */
function drawAvenueAndSidewalk(c, pal) {
  // Vỉa hè lát gạch (y: 68..86)
  R(c, 0, 68, 868, 18, '#DFCFB2');
  R(c, 0, 68, 868, 1, '#2B2118');
  for (var gx = 0; gx < 868; gx += 12) {
    R(c, gx, 69, 1, 15, 'rgba(43,33,24,0.12)');
  }
  R(c, 0, 76, 868, 1, 'rgba(43,33,24,0.10)');
  // Bó vỉa vạch trắng-đen
  for (var kx = 0; kx < 862; kx += 12) {
    R(c, kx, 84, 6, 2, '#F5F5F5');
    R(c, kx + 6, 84, 6, 2, '#2B2118');
  }
  // Hàng cây xanh & đèn đường dọc vỉa hè (đặt khe giữa các công trình)
  var lampXs = [100, 208, 318, 408, 530, 690, 846];
  for (var li = 0; li < lampXs.length; li++) {
    var lx = lampXs[li];
    // Trụ đèn cổ điển
    R(c, lx, 44, 2, 26, '#3B424C');
    R(c, lx - 2, 44, 6, 2, '#3B424C');
    R(c, lx - 3, 46, 3, 3, pal.mode !== 'day' ? '#FFE891' : '#EAF2F8');
    R(c, lx + 2, 46, 3, 3, pal.mode !== 'day' ? '#FFE891' : '#EAF2F8');
    if (pal.mode !== 'day') {
      c.save();
      c.globalAlpha = 0.24;
      E(c, lx + 1, 48, 10, 8, '#FFE08A');
      c.restore();
    }
  }

  // Đại lộ nhựa 2 làn (y: 86..128)
  R(c, 0, 86, 862, 42, '#3E3E44');
  R(c, 0, 86, 862, 1, '#26262B');
  R(c, 0, 126, 862, 2, '#2B2118');
  // Đường vạch phân cách tim vàng đứt đoạn ở giữa (y: 106)
  for (var dx = 6; dx < 854; dx += 18) {
    R(c, dx, 106, 10, 2, '#F4C44E');
  }
  // Vạch ngựa vằn đi bộ trước Chợ Bến Thành (x: 454..482) & SVĐ (x: 600..622)
  var zXs = [454, 600];
  for (var zi = 0; zi < zXs.length; zi++) {
    for (var zy = 89; zy < 124; zy += 5) {
      R(c, zXs[zi], zy, 22, 3, '#E8E6DF');
    }
  }
  // Bục CSGT điều tiết giao thông tại giao lộ (x: 468, y: 104)
  R(c, 460, 104, 16, 6, '#2B2118');
  R(c, 461, 105, 14, 4, '#FFFFFF');
  R(c, 463, 105, 3, 4, '#D93B30');
  R(c, 470, 105, 3, 4, '#D93B30');
}

/* ==================== 4. BẾN BẠCH ĐẰNG & SÔNG SÀI GÒN (x: 860..1160) ==================== */
function drawBachDangRiverStatic(c, pal) {
  var isDark = pal.mode !== 'day';

  // Mặt nước Sông Sài Gòn rộng (x: 874..1160, y: 60..128)
  R(c, 874, 60, 286, 18, pal.waterTop);
  R(c, 874, 78, 286, 24, pal.waterMid);
  R(c, 874, 102, 286, 26, pal.waterBot);
  // Bờ Thủ Thiêm cây xanh xa phía đối diện (y: 54..61)
  R(c, 880, 56, 280, 5, pal.mode === 'night' ? '#1B2E2A' : '#3C6E47');
  for (var tx = 886; tx < 1154; tx += 14) {
    E(c, tx, 55, 6, 3, pal.mode === 'night' ? '#243D36' : '#4D8A55');
  }

  // Bờ kè Bến Bạch Đằng nối từ vỉa hè (x: 856..896, y: 68..128)
  R(c, 856, 68, 36, 60, '#D8C7A8');
  R(c, 890, 68, 5, 60, '#8E8475'); // Mép kè đá
  R(c, 894, 68, 2, 60, '#2B2118');
  // Lan can trắng Bến Bạch Đằng dọc bờ sông
  for (var ry = 70; ry < 124; ry += 8) {
    R(c, 888, ry, 2, 6, '#FFFFFF');
  }
  R(c, 887, 70, 4, 56, 'rgba(255,255,255,0.45)');
  // Trạm chờ Saigon Waterbus mái cong xanh-vàng (x: 858..884, y: 50..68)
  R(c, 860, 52, 26, 4, '#2563EB');
  R(c, 862, 50, 22, 2, '#F4B93B');
  R(c, 863, 56, 2, 12, '#4B5563'); R(c, 881, 56, 2, 12, '#4B5563');
  R(c, 866, 61, 14, 5, '#FFF8E6'); // Bảng Waterbus

  // ---- CẦU ĐI BỘ QUA SÔNG SÀI GÒN (x: 892..998, y: 48..76) ----
  // Trụ cầu xuống nước
  R(c, 916, 68, 4, 12, '#A7B5C4'); R(c, 968, 68, 4, 12, '#A7B5C4');
  // Nhịp cầu uốn lượn hiện đại
  for (var pbx = 892; pbx <= 996; pbx++) {
    var u = (pbx - 892) / 104;
    var deckY = Math.round(68 - Math.sin(u * Math.PI) * 10);
    var archY = Math.round(deckY - 6 - Math.sin(u * Math.PI) * 7);
    R(c, pbx, deckY, 1, 4, '#E8EFF5');
    R(c, pbx, deckY + 4, 1, 1, '#2B2118');
    R(c, pbx, archY, 1, 2, isDark ? '#7DD3FC' : '#FFFFFF');
    if (pbx % 6 === 0) {
      R(c, pbx, archY + 2, 1, deckY - archY - 2, 'rgba(255,255,255,0.65)');
    }
    if (isDark && pbx % 8 === 0) {
      R(c, pbx, deckY - 1, 2, 1, '#FFE08A');
    }
  }
  // Người đi bộ dạo trên Cầu Đi Bộ
  var walkers = [918, 936, 950, 966];
  var wCols = ['#E0452B','#F4B93B','#38BDF8','#EC4899'];
  for (var wi = 0; wi < walkers.length; wi++) {
    var wx = walkers[wi];
    var wu = (wx - 892) / 104;
    var wy = Math.round(68 - Math.sin(wu * Math.PI) * 10);
    R(c, wx, wy - 4, 2, 2, '#FFD2B3');
    R(c, wx, wy - 2, 2, 3, wCols[wi]);
  }

  // ---- CẦU BA SON (THỦ THIÊM 2) DÂY VĂNG TRẮNG (x: 1002..1156, y: 12..78) ----
  // Mặt cầu bắc ngang sông
  R(c, 1002, 65, 154, 4, '#D9E2EC');
  R(c, 1002, 69, 154, 2, '#627385');
  R(c, 1002, 64, 154, 1, isDark ? '#FFE08A' : '#FFFFFF');
  // Trụ bê tông dưới mặt nước
  R(c, 1018, 70, 5, 10, '#8596A6');
  R(c, 1072, 70, 8, 12, '#8596A6');
  R(c, 1134, 70, 5, 10, '#8596A6');
  // Tháp trụ nghiêng biểu tượng Cầu Ba Son (vươn từ (1076,65) nghiêng về (1088,12))
  for (var py = 12; py <= 65; py++) {
    var pr = (65 - py) / 53;
    var pxMain = Math.round(1075 + pr * 13);
    var pwMain = Math.max(3, Math.round(6 - pr * 2.5));
    R(c, pxMain, py, pwMain, 1, '#FFFFFF');
    R(c, pxMain + pwMain - 1, py, 1, 1, '#9EB0C2');
  }
  // Hệ dây văng xòe quạt 2 bên đặc trưng Cầu Ba Son
  var cableCol = isDark ? '#FFE8A3' : '#F4F8FC';
  var leftTargets = [1008, 1018, 1028, 1038, 1048, 1058];
  for (var cl = 0; cl < leftTargets.length; cl++) {
    var anchorY = 16 + cl * 5;
    var anchorX = Math.round(1075 + ((65 - anchorY) / 53) * 13);
    fbDrawLine(c, anchorX, anchorY, leftTargets[cl], 64, cableCol);
  }
  var rightTargets = [1102, 1112, 1122, 1132, 1142, 1150];
  for (var cr = 0; cr < rightTargets.length; cr++) {
    var rAnchorY = 16 + cr * 5;
    var rAnchorX = Math.round(1078 + ((65 - rAnchorY) / 53) * 13);
    fbDrawLine(c, rAnchorX, rAnchorY, rightTargets[cr], 64, cableCol);
  }
}

/* ==================== 5. HOẠT CẢNH ĐỘNG 60FPS: 6 LOẠI XE + CSGT + TÀU THUYỀN ==================== */
function drawTrafficPolice(c, x, y, t) {
  var wave = Math.sin(t * 5.2) > 0;
  // Bóng tiếp xúc
  R(c, x - 3, y + 1, 7, 2, 'rgba(43,33,24,0.35)');
  // Ủng & quần đồng phục vàng cát CSGT
  R(c, x - 2, y - 4, 2, 5, '#C7A23A');
  R(c, x + 1, y - 4, 2, 5, '#C7A23A');
  R(c, x - 2, y, 2, 1, '#2B2118');
  R(c, x + 1, y, 2, 1, '#2B2118');
  // Áo CSGT vàng rực + dây chéo nâu
  R(c, x - 3, y - 9, 7, 5, '#F2CE5E');
  R(c, x - 2, y - 9, 5, 1, '#D9A72E');
  R(c, x - 2, y - 8, 1, 4, '#7A4B2A'); // Dây chéo
  R(c, x - 3, y - 5, 7, 1, '#5C3A21'); // Thắt lưng
  // Đầu & Mũ kê-pi vàng viền đỏ
  R(c, x - 2, y - 13, 5, 4, '#FFD5B5');
  R(c, x - 3, y - 15, 7, 2, '#E8C048');
  R(c, x - 2, y - 13, 5, 1, '#C92A22'); // Dải đỏ mũ CSGT
  // Tay giơ gậy chỉ huy trắng-đỏ vẫy nhịp nhàng
  if (wave) {
    R(c, x + 4, y - 11, 2, 3, '#F2CE5E');
    R(c, x + 5, y - 15, 1, 5, '#FFFFFF');
    R(c, x + 5, y - 14, 1, 2, '#E0452B');
  } else {
    R(c, x + 4, y - 8, 3, 2, '#F2CE5E');
    R(c, x + 7, y - 8, 4, 1, '#FFFFFF');
    R(c, x + 9, y - 8, 2, 1, '#E0452B');
  }
}

function drawVehicle(c, v, t, isDark) {
  var x = Math.round(v.x), y = Math.round(v.y), dir = v.dir;
  c.save();
  if (dir < 0) {
    c.translate(x + v.w / 2, 0);
    c.scale(-1, 1);
    c.translate(-(x + v.w / 2), 0);
  }
  // Bóng gầm xe
  R(c, x + 1, y + v.h - 1, v.w - 2, 2, 'rgba(20,16,12,0.38)');

  if (v.kind === 'moto') {
    // Xe máy Việt Nam + người đội mũ bảo hiểm
    R(c, x + 1, y + 6, 3, 3, '#1C1C20'); R(c, x + 9, y + 6, 3, 3, '#1C1C20');
    R(c, x + 2, y + 4, 9, 3, v.col);
    R(c, x + 9, y + 2, 2, 4, '#3B424C'); // Tay lái
    R(c, x + 5, y + 1, 3, 4, v.riderCol); // Áo người lái
    R(c, x + 5, y - 2, 3, 3, v.helmCol); // Mũ bảo hiểm
    if (isDark) R(c, x + 12, y + 3, 4, 2, 'rgba(255,232,140,0.45)');
  } else if (v.kind === 'car') {
    // Xe hơi sedan/SUV
    R(c, x + 2, y + 4, 20, 6, v.col);
    R(c, x + 5, y + 1, 12, 4, v.col);
    R(c, x + 7, y + 2, 8, 2, '#BEE3F8'); // Kính
    R(c, x + 4, y + 9, 4, 3, '#1C1C20'); R(c, x + 16, y + 9, 4, 3, '#1C1C20');
    R(c, x + 21, y + 6, 2, 2, '#FFF59D'); // Đèn pha
    R(c, x + 1, y + 6, 2, 2, '#EF4444'); // Đèn hậu
    if (isDark) R(c, x + 23, y + 5, 7, 4, 'rgba(255,232,140,0.32)');
  } else if (v.kind === 'police') {
    // Xe Cảnh Sát Giao Thông nháy đèn Xanh-Đỏ
    R(c, x + 1, y + 4, 22, 6, '#F8FAFC');
    R(c, x + 1, y + 7, 22, 2, '#1D4ED8'); // Sọc xanh dương CSGT
    R(c, x + 5, y + 1, 13, 4, '#F8FAFC');
    R(c, x + 7, y + 2, 9, 2, '#93C5FD');
    R(c, x + 4, y + 9, 4, 3, '#1C1C20'); R(c, x + 17, y + 9, 4, 3, '#1C1C20');
    // Thanh đèn ưu tiên chớp luân phiên Xanh / Đỏ
    var blink = Math.floor(t * 10) % 2 === 0;
    R(c, x + 9, y - 1, 3, 2, blink ? '#38BDF8' : '#1E3A8A');
    R(c, x + 12, y - 1, 3, 2, blink ? '#991B1B' : '#EF4444');
    c.globalAlpha = 0.35;
    E(c, blink ? x + 10 : x + 13, y, 5, 4, blink ? '#38BDF8' : '#EF4444');
    c.globalAlpha = 1;
  } else if (v.kind === 'truck') {
    // Xe tải thùng
    R(c, x + 1, y + 1, 20, 10, '#E2E8F0'); // Thùng hàng bạc
    R(c, x + 1, y + 1, 20, 2, '#CBD5E1');
    for (var tx = x + 4; tx < x + 19; tx += 4) R(c, tx, y + 3, 1, 7, '#94A3B8');
    R(c, x + 21, y + 3, 8, 8, v.col); // Cabin
    R(c, x + 24, y + 4, 4, 3, '#BEE3F8');
    R(c, x + 5, y + 10, 4, 3, '#1C1C20'); R(c, x + 23, y + 10, 4, 3, '#1C1C20');
  } else if (v.kind === 'bus') {
    // Xe buýt Sài Gòn tuyến 01 thân dài
    R(c, x + 1, y + 1, 36, 11, '#2563EB');
    R(c, x + 1, y + 7, 36, 2, '#FFFFFF');
    for (var bx = x + 3; bx < x + 33; bx += 5) {
      R(c, bx, y + 3, 4, 3, isDark ? '#FFE891' : '#DBEAFE');
    }
    R(c, x + 6, y + 11, 4, 3, '#1C1C20'); R(c, x + 28, y + 11, 4, 3, '#1C1C20');
  } else if (v.kind === 'container') {
    // Xe Container cỡ lớn
    R(c, x + 1, y, 32, 11, v.col); // Thùng container
    for (var cx = x + 4; cx < x + 31; cx += 3) R(c, cx, y + 1, 1, 9, 'rgba(0,0,0,0.22)');
    R(c, x + 1, y + 11, 33, 2, '#334155'); // Khung rơ-moóc
    R(c, x + 34, y + 3, 10, 9, '#DC2626'); // Đầu kéo đỏ
    R(c, x + 38, y + 4, 5, 3, '#BAE6FD');
    R(c, x + 5, y + 12, 4, 3, '#1C1C20');
    R(c, x + 11, y + 12, 4, 3, '#1C1C20');
    R(c, x + 37, y + 12, 4, 3, '#1C1C20');
  }
  c.restore();
}

function drawRiverBoat(c, b, t, isDark) {
  var x = Math.round(b.x), y = Math.round(b.y);
  var bob = Math.round(Math.sin(t * 2.4 + b.phase) * 0.8);
  y += bob;
  c.save();
  if (b.dir < 0) {
    c.translate(x + b.w / 2, 0);
    c.scale(-1, 1);
    c.translate(-(x + b.w / 2), 0);
  }
  // Vệt sóng trắng rẽ nước phía sau đuôi tàu
  var wake = Math.floor(t * 6) % 2;
  R(c, x - 9, y + b.h - 2, 8, 1, 'rgba(255,255,255,0.65)');
  R(c, x - 6 - wake, y + b.h, 6, 1, 'rgba(255,255,255,0.4)');

  if (b.kind === 'cruise') {
    // Tàu du lịch 2 tầng sáng đèn trên sông Sài Gòn
    R(c, x + 2, y + 9, 40, 6, '#F8FAFC'); // Thân tàu trắng
    R(c, x + 42, y + 10, 4, 4, '#F8FAFC'); // Mũi tàu
    R(c, x + 1, y + 13, 44, 2, '#B91C1C'); // Đáy đỏ
    R(c, x + 6, y + 4, 30, 5, '#FFF8E6'); // Tầng 2
    R(c, x + 4, y + 2, 34, 2, '#D97706'); // Mái vòm vàng
    for (var wx = x + 8; wx < x + 34; wx += 4) {
      R(c, wx, y + 5, 3, 3, isDark ? '#FFE066' : '#60A5FA');
      R(c, wx, y + 10, 3, 2, isDark ? '#FFE066' : '#3B82F6');
    }
  } else if (b.kind === 'waterbus') {
    // Saigon Waterbus vàng-trắng
    R(c, x + 1, y + 6, 28, 6, '#F4B93B');
    R(c, x + 29, y + 8, 4, 4, '#F4B93B');
    R(c, x + 4, y + 3, 22, 4, '#FFFFFF');
    for (var wbx = x + 6; wbx < x + 24; wbx += 4) {
      R(c, wbx, y + 4, 3, 2, isDark ? '#FFE891' : '#38BDF8');
    }
  } else {
    // Tàu chở hàng / Sà lan container lớn
    R(c, x + 1, y + 8, 46, 6, '#475569');
    R(c, x + 47, y + 9, 4, 4, '#475569');
    R(c, x + 1, y + 12, 49, 2, '#991B1B');
    // Cabin lái phía sau
    R(c, x + 3, y + 2, 8, 6, '#F8FAFC');
    R(c, x + 6, y + 3, 4, 2, '#93C5FD');
    // Các khối container trên sà lan
    R(c, x + 14, y + 3, 10, 5, '#EA580C');
    R(c, x + 25, y + 3, 10, 5, '#2563EB');
    R(c, x + 36, y + 4, 9, 4, '#16A34A');
  }
  c.restore();
}

function drawSaigonLiveTrafficAndRiver(c, t, pal, vehicles, boats) {
  var isDark = pal.mode !== 'day';

  // 1. Khói nồi Phở bốc lên (x: 74, y: 55)
  for (var si = 0; si < 3; si++) {
    var st = (t * 0.9 + si * 0.33) % 1;
    c.save();
    c.globalAlpha = (1 - st) * 0.55;
    R(c, 73 + Math.round(Math.sin(t * 2.5 + si) * 2), Math.round(55 - st * 14), 3, 2, '#FFFDF7');
    c.restore();
  }

  // 2. Cờ đỏ sao vàng bay phấp phới trên SVĐ Thống Nhất (x: 611, y: 18)
  R(c, 610, 17, 1, 14, '#CBD5E1');
  var fWave = Math.sin(t * 6) > 0 ? 1 : 0;
  R(c, 611, 17, 9, 6, '#DA251D');
  R(c, 615, 19 + fWave, 2, 2, '#FFFF00');

  // 3. Quầng đèn pha SVĐ Thống Nhất lấp lánh
  if (isDark) {
    c.save();
    c.globalAlpha = 0.22 + Math.sin(t * 2) * 0.04;
    var fls = [545, 577, 647, 679];
    for (var fli = 0; fli < fls.length; fli++) {
      E(c, fls[fli], 12, 10, 7, '#FFF9C4');
    }
    c.restore();
  }

  // 4. Làn trên (đi sang trái, y ~ 88..98)
  c.save();
  c.beginPath(); c.rect(0, 84, 860, 44); c.clip();
  for (var vi = 0; vi < vehicles.length; vi++) {
    if (vehicles[vi].lane === 0) drawVehicle(c, vehicles[vi], t, isDark);
  }
  // 5. CSGT áo vàng đứng bục giữa giao lộ (x: 468, y: 105)
  drawTrafficPolice(c, 468, 106, t);
  // 6. Làn dưới (đi sang phải, y ~ 108..119)
  for (var vj = 0; vj < vehicles.length; vj++) {
    if (vehicles[vj].lane === 1) drawVehicle(c, vehicles[vj], t, isDark);
  }
  c.restore();

  // 7. Sóng lăn tăn & Tàu thuyền lớn trên Sông Bạch Đằng (clip x: 874..1160)
  c.save();
  c.beginPath(); c.rect(874, 58, 286, 70); c.clip();
  for (var wi = 0; wi < 14; wi++) {
    var wx = 880 + ((wi * 37 + Math.floor(t * 9 * (wi % 2 ? 1 : -1))) % 276 + 276) % 276;
    var wy = 68 + (wi * 11) % 54;
    R(c, wx, wy, 7, 1, pal.waterGlint);
  }
  for (var bi = 0; bi < boats.length; bi++) {
    drawRiverBoat(c, boats[bi], t, isDark);
  }
  c.restore();
}
`;
}
