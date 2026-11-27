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
    [958, 28, 18], [1004, 24, 20], [1096, 26, 18], [1124, 22, 22],
    [1174, 24, 20], [1214, 18, 22], [1262, 20, 24], [1302, 16, 20], [1330, 24, 22]
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

  // ---- 3. CỬA HÀNG ADIDAS ORIGINALS HỘI AN (x: 214..314, y: 12..68) — 1:1 4 ẢNH THỰC TẾ QĐ 229 ----
  // Nhà cổ 2 tầng tường vàng nghệ Hội An rực rỡ (#E6A825 / #F4C042)
  R(c, 216, 14, 94, 54, '#E6A825');
  R(c, 216, 14, 94, 3, '#4A2C1A'); // Gờ mái cổ nâu sẫm
  R(c, 216, 17, 94, 2, '#FFFBF1'); // Phào chỉ trắng cổ điển
  R(c, 216, 14, 2, 54, '#2B2118');
  R(c, 308, 14, 2, 54, '#2B2118');
  // TẦNG 2: 3 Vòm cong viền trắng + Ban công con tiện trắng + Chùm đèn lồng nhiều màu (Ảnh 1 & 4)
  var archXs = [221, 250, 279];
  var lanCols = ['#FFFDF7', '#E0452B', '#F4B93B', '#4ADE80'];
  for (var ai2 = 0; ai2 < 3; ai2++) {
    var ax2 = archXs[ai2];
    R(c, ax2, 20, 24, 18, '#3B2314');           // Hốc hành lang tầng 2
    R(c, ax2, 19, 24, 2, '#FFFBF1');            // Viền vòm trắng trên
    R(c, ax2 + 2, 21, 20, 2, '#FFFBF1');        // Vòm cong trắng
    R(c, ax2, 21, 2, 17, '#F4C042');            // Cột vàng trái
    R(c, ax2 + 22, 21, 2, 17, '#F4C042');       // Cột vàng phải
    // Ban công con tiện trắng cổ điển chạy dọc đáy vòm
    R(c, ax2, 33, 24, 5, '#FFFBF1');
    for (var bal = ax2 + 2; bal < ax2 + 22; bal += 4) R(c, bal, 34, 2, 3, '#8F6E42');
    // Chùm đèn lồng lụa Hội An nhiều màu treo dưới 3 vòm (Ảnh 1 & 4)
    R(c, ax2 + 5, 24, 4, 4, lanCols[(ai2 * 2) % 4]);
    R(c, ax2 + 12, 25, 5, 5, lanCols[(ai2 * 2 + 1) % 4]);
    R(c, ax2 + 17, 23, 3, 4, lanCols[(ai2 + 2) % 4]);
    if (isDark) {
      c.save(); c.globalAlpha = 0.28;
      E(c, ax2 + 12, 27, 8, 6, '#FFE08A');
      c.restore();
    }
  }
  // Mái ngói âm dương Hội An nhô ra giữa Tầng 1 & Tầng 2 (y: 38..43)
  R(c, 214, 38, 98, 4, '#57463B');
  R(c, 214, 42, 98, 1, '#2B2118');
  for (var ng = 216; ng < 310; ng += 4) R(c, ng, 39, 2, 3, '#A89B91'); // Đầu ngói ống sáng

  // TẦNG 1: Bảng hiệu đen viền LED trắng gắn Logo Cỏ Ba Lá (Trefoil) + Cửa lá sách gỗ nâu (Ảnh 1 & 3)
  R(c, 251, 43, 24, 9, '#181B22');
  R(c, 252, 44, 22, 7, '#23272F');
  R(c, 251, 43, 24, 1, '#FFFFFF'); R(c, 251, 51, 24, 1, '#FFFFFF'); // Viền đèn trắng
  // Logo Cỏ Ba Lá Trefoil trắng phát sáng trên bảng hiệu (ADIDAS)
  R(c, 262, 45, 2, 4, '#FFFFFF');
  R(c, 259, 46, 2, 3, '#FFFFFF'); R(c, 265, 46, 2, 3, '#FFFFFF');
  R(c, 259, 48, 8, 1, '#181B22');
  // Cửa chính sáng đèn vàng ấm lộ mannequin bên trong + bậc tam cấp đá
  R(c, 253, 52, 20, 16, '#2B2118');
  R(c, 255, 53, 16, 15, isDark ? '#F5C469' : '#FCE7B2');
  R(c, 261, 58, 4, 7, '#181B22'); R(c, 262, 56, 2, 2, '#FFFBF1'); // Mannequin giữa cửa
  // 2 Cửa kính + Cửa lá sách gỗ nâu mở 2 bên (trái & phải)
  R(c, 224, 48, 22, 18, '#3B2314'); R(c, 228, 50, 14, 14, isDark ? '#F5C469' : '#DCE9F2');
  R(c, 230, 56, 10, 6, '#FFFFFF'); // Giá quần áo bên cửa trái
  R(c, 280, 48, 22, 18, '#3B2314'); R(c, 284, 50, 14, 14, isDark ? '#A5B4FC' : '#DCE9F2');
  // 2 Bụi cây dây leo xanh rủ 2 bên mép nhà cổ (Ảnh 1 & 3)
  R(c, 214, 44, 5, 24, '#2E7D32'); R(c, 215, 46, 2, 20, '#4CAF50');
  R(c, 307, 44, 5, 24, '#2E7D32'); R(c, 308, 46, 2, 20, '#4CAF50');
  // TƯỢNG LOGO CỎ BA LÁ (TREFOIL) ĐEN VIỀN LED TRẮNG KHỔNG LỒ GÓC PHẢI MẶT TIỀN (1:1 Ảnh 1 & 3!)
  R(c, 287, 54, 4, 12, '#FFFFFF'); R(c, 288, 55, 2, 10, '#181B22'); // Cánh lá giữa
  R(c, 280, 57, 7, 9, '#FFFFFF');  R(c, 281, 58, 5, 7, '#181B22');  // Cánh lá trái
  R(c, 291, 57, 7, 9, '#FFFFFF');  R(c, 292, 58, 5, 7, '#181B22');  // Cánh lá phải
  R(c, 281, 61, 16, 1, '#FFFFFF'); R(c, 282, 63, 14, 1, '#FFFFFF'); R(c, 284, 65, 10, 1, '#FFFFFF'); // 3 sọc LED trắng!

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

/* ==================== 3. VỈA HÈ RỘNG + ĐẠI LỘ 2 LÀN (x: 0..868, y: 68..164) ==================== */
function drawAvenueAndSidewalk(c, pal) {
  // Vỉa hè lát gạch rộng thoáng cho Chú Heo Mascot 24×20 đi dạo (y: 68..96)
  R(c, 0, 68, 868, 28, '#DFCFB2');
  R(c, 0, 68, 868, 1, '#2B2118');
  for (var gx = 0; gx < 868; gx += 12) {
    R(c, gx, 69, 1, 25, 'rgba(43,33,24,0.12)');
  }
  R(c, 0, 77, 868, 1, 'rgba(43,33,24,0.10)');
  R(c, 0, 86, 868, 1, 'rgba(43,33,24,0.10)');
  // Bó vỉa vạch trắng-đen (y: 94..96)
  for (var kx = 0; kx < 862; kx += 12) {
    R(c, kx, 94, 6, 2, '#F5F5F5');
    R(c, kx + 6, 94, 6, 2, '#2B2118');
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

  // Đại lộ nhựa 2 làn RỘNG RÃI (y: 96..164, tổng 68px chứa xe to bự)
  R(c, 0, 96, 862, 68, '#3B3C42');
  R(c, 0, 96, 862, 2, '#25262B');
  R(c, 0, 162, 862, 2, '#2B2118');
  // Đường vạch phân cách tim vàng đứt đoạn ở giữa (y: 129)
  for (var dx = 6; dx < 854; dx += 22) {
    R(c, dx, 129, 13, 2, '#F4C44E');
  }
  // Vạch ngựa vằn đi bộ lớn trước Chợ Bến Thành (x: 452..484) & SVĐ (x: 598..626)
  var zXs = [452, 598];
  for (var zi = 0; zi < zXs.length; zi++) {
    for (var zy = 100; zy < 158; zy += 7) {
      R(c, zXs[zi], zy, 28, 4, '#E8E6DF');
    }
  }
  // Bục CSGT điều tiết giao thông tại giao lộ (x: 468, y: 125)
  R(c, 456, 125, 24, 9, '#2B2118');
  R(c, 457, 126, 22, 7, '#FFFFFF');
  R(c, 460, 126, 4, 7, '#D93B30');
  R(c, 471, 126, 4, 7, '#D93B30');
}

/* ==================== 4. HAI BỜ SÔNG BẾN BẠCH ĐẰNG ↔ THỦ THIÊM (x: 856..1360, y: 50..164) ==================== */
function drawBachDangRiverStatic(c, pal) {
  var isDark = pal.mode !== 'day';

  // Mặt nước Sông Sài Gòn rộng sâu giữa 2 bờ (x: 892..1268, y: 56..164)
  R(c, 892, 56, 376, 26, pal.waterTop);
  R(c, 892, 82, 376, 40, pal.waterMid);
  R(c, 892, 122, 376, 42, pal.waterBot);
  // Bờ xa đối diện phía chân trời (y: 52..57)
  R(c, 892, 52, 376, 5, pal.mode === 'night' ? '#1B2E2A' : '#3C6E47');
  for (var tx = 898; tx < 1264; tx += 14) {
    E(c, tx, 51, 6, 3, pal.mode === 'night' ? '#243D36' : '#4D8A55');
  }

  // ---- BỜ TÂY: BẾN BẠCH ĐẰNG (x: 856..896) ----
  // Vỉa hè & kè đá công viên trên (y: 66..96) đón đầu Cầu Đi Bộ
  R(c, 856, 68, 38, 28, '#D8C7A8');
  R(c, 892, 68, 4, 28, '#8E8475');
  R(c, 895, 68, 2, 28, '#2B2118');
  // Đường dẫn nhựa 2 làn nối từ Đại lộ lên Cầu Ba Son (y: 96..138)
  R(c, 856, 96, 40, 42, '#3B3C42');
  R(c, 856, 96, 40, 2, '#E2E8F0');
  R(c, 856, 136, 40, 2, '#E2E8F0');
  R(c, 862, 116, 12, 2, '#F4C44E'); R(c, 880, 116, 12, 2, '#F4C44E');
  // Kè đá phía dưới mặt đường dẫn (y: 138..164)
  R(c, 856, 138, 38, 26, '#CBB896');
  R(c, 892, 138, 4, 26, '#8E8475');
  R(c, 895, 138, 2, 26, '#2B2118');
  // Trạm chờ Saigon Waterbus mái cong xanh-vàng (x: 858..884, y: 50..68)
  R(c, 860, 52, 24, 4, '#2563EB');
  R(c, 862, 50, 20, 2, '#F4B93B');
  R(c, 863, 56, 2, 12, '#4B5563'); R(c, 879, 56, 2, 12, '#4B5563');
  R(c, 866, 61, 12, 5, '#FFF8E6');
  // Biển báo "CHỈ ĐI BỘ" (tròn xanh dương + người đi bộ trắng) ngay đầu Cầu Đi Bộ
  R(c, 887, 63, 1, 9, '#475569');
  E(c, 887, 61, 3.5, 3.5, '#1D4ED8');
  R(c, 887, 59, 1, 3, '#FFFFFF');

  // ---- BỜ ĐÔNG: CÔNG VIÊN & QUẢNG TRƯỜNG THỦ THIÊM (x: 1266..1360) ----
  // Kè đá bờ Đông
  R(c, 1265, 66, 4, 98, '#8E8475');
  R(c, 1264, 66, 2, 98, '#2B2118');
  // Công viên cây xanh & lối dạo bộ đón đầu Cầu Đi Bộ (y: 64..96)
  R(c, 1269, 66, 91, 30, '#4E9A51');
  R(c, 1269, 70, 91, 14, '#DFCFB2'); // Đường dạo bộ Thủ Thiêm
  R(c, 1269, 70, 91, 1, '#2B2118');
  R(c, 1269, 84, 91, 1, '#2B2118');
  // Hàng cây xanh & đèn công viên Thủ Thiêm
  var ttTrees = [1284, 1314, 1344];
  for (var ti = 0; ti < ttTrees.length; ti++) {
    R(c, ttTrees[ti], 56, 3, 12, '#6E472B');
    E(c, ttTrees[ti] + 1, 52, 8, 6, '#3B8242');
    E(c, ttTrees[ti], 50, 5, 4, '#56A859');
  }
  // Đường nhựa 2 làn Thủ Thiêm nối tiếp đầu Cầu Ba Son (y: 96..138)
  R(c, 1268, 96, 92, 42, '#3B3C42');
  R(c, 1268, 96, 92, 2, '#E2E8F0');
  R(c, 1268, 136, 92, 2, '#E2E8F0');
  for (var tdx = 1274; tdx < 1354; tdx += 20) {
    R(c, tdx, 116, 12, 2, '#F4C44E');
  }
  // Thảm cỏ ven sông phía dưới bờ Đông (y: 138..164)
  R(c, 1269, 138, 91, 26, '#3F8446');
  R(c, 1269, 140, 91, 3, '#58A35C');

  // ---- CẦU ĐI BỘ QUA SÔNG SÀI GÒN (Tầng trên x: 890..1268, y: 54..76 — CHỈ ĐI BỘ) ----
  // 4 Trụ cầu cắm xuống mặt sông
  var pPiers = [948, 1028, 1130, 1210];
  for (var pi = 0; pi < pPiers.length; pi++) {
    R(c, pPiers[pi], 70, 5, 16, '#A7B5C4');
    R(c, pPiers[pi], 70, 1, 16, '#E2E8F0');
  }
  // Nhịp cầu vòm đôi uốn lượn bắt trọn từ Bến Bạch Đằng (890) sang Thủ Thiêm (1268)
  for (var pbx = 890; pbx <= 1268; pbx++) {
    var u = (pbx - 890) / 378;
    var deckY = Math.round(72 - Math.sin(u * Math.PI) * 5);
    var archWave = Math.abs(Math.sin(u * Math.PI * 2));
    var archY = Math.round(deckY - 6 - archWave * 9);
    R(c, pbx, deckY, 1, 5, '#E8EFF5');
    R(c, pbx, deckY + 5, 1, 1, '#2B2118');
    R(c, pbx, deckY + 1, 1, 2, '#CBD5E1');
    R(c, pbx, archY, 1, 2, isDark ? '#7DD3FC' : '#FFFFFF');
    if (pbx % 8 === 0) {
      R(c, pbx, archY + 2, 1, deckY - archY - 2, 'rgba(255,255,255,0.65)');
    }
    if (isDark && pbx % 10 === 0) {
      R(c, pbx, deckY - 1, 2, 1, '#FFE08A');
    }
  }

  // ---- CẦU BA SON (THỦ THIÊM 2) DÂY VĂNG TRẮNG (Tầng đường dẫn x: 888..1270, y: 98..136 — XE LƯU THÔNG) ----
  // Trụ bê tông lớn dưới gầm cầu
  R(c, 962, 136, 7, 16, '#7C8E9E');
  R(c, 1074, 136, 12, 18, '#7C8E9E');
  R(c, 1192, 136, 7, 16, '#7C8E9E');
  // Mặt cầu nhựa 2 làn rộng rãi cho xe máy, xe hơi, xe tải & Heo chạy xe máy
  R(c, 888, 98, 382, 38, '#3D3F47');
  R(c, 888, 96, 382, 3, '#E8EFF5'); // Lan can trên
  R(c, 888, 95, 382, 1, isDark ? '#FFE08A' : '#FFFFFF');
  R(c, 888, 135, 382, 3, '#CBD5E1'); // Lan can dưới
  R(c, 888, 138, 382, 2, '#475569'); // Dầm thép gầm cầu
  // Vạch phân làn vàng trên Cầu Ba Son (y: 116)
  for (var bdx = 896; bdx < 1262; bdx += 20) {
    R(c, bdx, 116, 11, 2, '#F4C44E');
  }
  // Tháp trụ nghiêng biểu tượng Cầu Ba Son vươn cao lên trời (từ y=96 nghiêng lên y=10)
  for (var py = 10; py <= 96; py++) {
    var pr = (96 - py) / 86;
    var pxMain = Math.round(1078 + pr * 18);
    var pwMain = Math.max(3, Math.round(8 - pr * 3.5));
    R(c, pxMain, py, pwMain, 1, '#FFFFFF');
    R(c, pxMain + pwMain - 1, py, 1, 1, '#9EB0C2');
  }
  // Hệ 14 dây văng trắng xòe quạt 2 bên xuống thành cầu
  var cableCol = isDark ? '#FFE8A3' : '#F4F8FC';
  var leftTargets = [916, 940, 964, 988, 1012, 1036, 1058];
  for (var cl = 0; cl < leftTargets.length; cl++) {
    var anchorY = 16 + cl * 9;
    var anchorX = Math.round(1078 + ((96 - anchorY) / 86) * 18);
    fbDrawLine(c, anchorX, anchorY, leftTargets[cl], 96, cableCol);
  }
  var rightTargets = [1106, 1130, 1154, 1178, 1202, 1226, 1250];
  for (var cr = 0; cr < rightTargets.length; cr++) {
    var rAnchorY = 16 + cr * 9;
    var rAnchorX = Math.round(1082 + ((96 - rAnchorY) / 86) * 18);
    fbDrawLine(c, rAnchorX, rAnchorY, rightTargets[cr], 96, cableCol);
  }
}

/* ==================== 5. HOẠT CẢNH ĐỘNG 60FPS: ĐỘI XE TO BỰ + CSGT 12×22 + TÀU LỚN ==================== */
function drawTrafficPolice(c, x, y, t) {
  var wave = Math.sin(t * 5.2) > 0;
  // Bóng tiếp xúc
  R(c, x - 5, y + 1, 11, 2, 'rgba(43,33,24,0.4)');
  // Giày & quần đồng phục vàng cát CSGT (to rõ 12×22)
  R(c, x - 4, y - 7, 3, 8, '#2B2118'); R(c, x - 3, y - 6, 2, 6, '#C7A23A');
  R(c, x + 1, y - 7, 3, 8, '#2B2118'); R(c, x + 1, y - 6, 2, 6, '#C7A23A');
  R(c, x - 4, y - 1, 3, 2, '#1F1A17'); R(c, x + 1, y - 1, 3, 2, '#1F1A17');
  // Áo CSGT vàng rực có viền + dây chéo nâu + thắt lưng
  R(c, x - 5, y - 15, 10, 9, '#2B2118');
  R(c, x - 4, y - 14, 8, 7, '#F4D059');
  R(c, x - 4, y - 14, 8, 2, '#FFE484');
  R(c, x - 3, y - 14, 2, 6, '#7A4B2A'); // Dây chéo
  R(c, x - 4, y - 9, 8, 2, '#5C3A21');  // Thắt lưng da
  R(c, x - 1, y - 9, 2, 2, '#F4B93B');  // Khóa thắt lưng
  // Đầu & Mũ kê-pi vàng viền đỏ to rõ
  R(c, x - 4, y - 20, 8, 5, '#2B2118');
  R(c, x - 3, y - 19, 6, 4, '#FFD5B5');
  R(c, x - 2, y - 18, 1, 1, '#2B2118'); R(c, x + 1, y - 18, 1, 1, '#2B2118');
  R(c, x - 5, y - 23, 10, 3, '#2B2118');
  R(c, x - 4, y - 22, 8, 2, '#E8C048');
  R(c, x - 3, y - 20, 6, 1, '#C92A22'); // Dải đỏ mũ kê-pi
  // Tay trái chống hông, tay phải giơ gậy chỉ huy trắng-đỏ vẫy nhịp nhàng
  R(c, x - 6, y - 13, 2, 4, '#F4D059');
  if (wave) {
    R(c, x + 5, y - 17, 3, 5, '#F4D059');
    R(c, x + 7, y - 24, 2, 8, '#FFFFFF');
    R(c, x + 7, y - 22, 2, 3, '#E0452B');
    R(c, x + 7, y - 17, 2, 2, '#2B2118');
  } else {
    R(c, x + 5, y - 13, 4, 3, '#F4D059');
    R(c, x + 9, y - 13, 7, 2, '#FFFFFF');
    R(c, x + 12, y - 13, 3, 2, '#E0452B');
  }
}

function drawWheel(c, cx, cy, r) {
  E(c, cx, cy, r, r, '#18181B');
  E(c, cx, cy, Math.max(1, r - 1.5), Math.max(1, r - 1.5), '#94A3B8');
  R(c, cx, cy, 1, 1, '#18181B');
}

function drawVehicle(c, v, t, isDark) {
  var x = Math.round(v.x), y = Math.round(v.y), dir = v.dir;
  c.save();
  if (dir < 0) {
    c.translate(x + v.w / 2, 0);
    c.scale(-1, 1);
    c.translate(-(x + v.w / 2), 0);
  }
  // Bóng gầm xe đậm
  R(c, x + 2, y + v.h - 2, v.w - 4, 3, 'rgba(18,14,10,0.45)');

  if (v.kind === 'moto') {
    // Xe máy Việt Nam to rõ (22×16) + người lái đội mũ bảo hiểm
    drawWheel(c, x + 4, y + 12, 3.2);
    drawWheel(c, x + 17, y + 12, 3.2);
    // Thân & yếm xe viền đậm
    R(c, x + 3, y + 7, 15, 5, '#2B2118');
    R(c, x + 4, y + 8, 13, 3, v.col);
    R(c, x + 14, y + 4, 4, 6, v.col); // Yếm trước
    R(c, x + 15, y + 2, 2, 3, '#3B424C'); // Tay lái
    R(c, x + 18, y + 5, 2, 2, '#FFF59D'); // Đèn pha
    R(c, x + 2, y + 8, 2, 2, '#EF4444');  // Đèn hậu
    // Người lái áo khoác & mũ bảo hiểm
    R(c, x + 7, y + 3, 6, 6, '#2B2118');
    R(c, x + 8, y + 4, 4, 4, v.riderCol);
    R(c, x + 8, y - 2, 5, 5, '#2B2118');
    R(c, x + 9, y - 1, 4, 3, v.helmCol);
    R(c, x + 11, y + 1, 2, 2, '#FFD5B5'); // Mặt
    if (isDark) R(c, x + 20, y + 4, 8, 4, 'rgba(255,232,140,0.38)');
  } else if (v.kind === 'car') {
    // Xe hơi Sedan/SUV to rõ (40×20)
    R(c, x + 1, y + 7, 38, 10, '#2B2118');
    R(c, x + 2, y + 8, 36, 8, v.col);
    R(c, x + 2, y + 8, 36, 2, 'rgba(255,255,255,0.22)'); // Viền sáng thân trên
    // Mui & kính chắn gió
    R(c, x + 8, y + 1, 21, 7, '#2B2118');
    R(c, x + 9, y + 2, 19, 6, v.col);
    R(c, x + 11, y + 3, 7, 4, '#BAE6FD'); // Kính sau
    R(c, x + 19, y + 3, 8, 4, '#E0F2FE'); // Kính trước phản sáng
    R(c, x + 18, y + 9, 3, 1, '#2B2118'); // Tay nắm cửa
    // Đèn pha & đèn hậu
    R(c, x + 36, y + 10, 3, 3, '#FEF08A');
    R(c, x + 1, y + 10, 3, 3, '#EF4444');
    // 2 Bánh xe lớn có vành bạc
    drawWheel(c, x + 9, y + 16, 4);
    drawWheel(c, x + 30, y + 16, 4);
    if (isDark) R(c, x + 39, y + 8, 12, 7, 'rgba(255,232,140,0.30)');
  } else if (v.kind === 'police') {
    // Xe Cảnh Sát Giao Thông to bự (40×20) nháy đèn Xanh-Đỏ rực rỡ
    R(c, x + 1, y + 7, 38, 10, '#2B2118');
    R(c, x + 2, y + 8, 36, 8, '#F8FAFC');
    R(c, x + 2, y + 11, 36, 3, '#1D4ED8'); // Sọc xanh CSGT nổi bật
    R(c, x + 16, y + 12, 8, 1, '#FDE047'); // Huy hiệu vàng
    R(c, x + 8, y + 1, 22, 7, '#2B2118');
    R(c, x + 9, y + 2, 20, 6, '#F8FAFC');
    R(c, x + 11, y + 3, 7, 4, '#93C5FD');
    R(c, x + 19, y + 3, 8, 4, '#BFDBFE');
    R(c, x + 36, y + 10, 3, 3, '#FEF08A');
    R(c, x + 1, y + 10, 3, 3, '#EF4444');
    drawWheel(c, x + 9, y + 16, 4);
    drawWheel(c, x + 30, y + 16, 4);
    // Thanh đèn còi ưu tiên chớp luân phiên Xanh / Đỏ
    var blink = Math.floor(t * 10) % 2 === 0;
    R(c, x + 14, y - 2, 5, 3, blink ? '#38BDF8' : '#1E3A8A');
    R(c, x + 19, y - 2, 5, 3, blink ? '#991B1B' : '#EF4444');
    c.globalAlpha = 0.42;
    E(c, blink ? x + 16 : x + 22, y - 1, 9, 6, blink ? '#38BDF8' : '#EF4444');
    c.globalAlpha = 1;
  } else if (v.kind === 'truck') {
    // Xe tải thùng lớn (52×24)
    R(c, x + 1, y + 1, 34, 18, '#2B2118');
    R(c, x + 2, y + 2, 32, 16, '#E2E8F0'); // Thùng hàng bạc lớn
    R(c, x + 2, y + 2, 32, 3, '#F8FAFC');
    for (var tx = x + 6; tx < x + 32; tx += 5) R(c, tx, y + 5, 1, 12, '#94A3B8');
    // Cabin đầu xe
    R(c, x + 35, y + 5, 16, 14, '#2B2118');
    R(c, x + 36, y + 6, 14, 12, v.col);
    R(c, x + 41, y + 7, 8, 5, '#BAE6FD'); // Kính cabin
    R(c, x + 48, y + 14, 3, 3, '#FEF08A'); // Đèn pha
    R(c, x + 1, y + 14, 2, 3, '#EF4444');
    drawWheel(c, x + 11, y + 19, 4.5);
    drawWheel(c, x + 43, y + 19, 4.5);
    if (isDark) R(c, x + 51, y + 12, 12, 7, 'rgba(255,232,140,0.30)');
  } else if (v.kind === 'bus') {
    // Xe buýt Sài Gòn to bự (66×25)
    R(c, x + 1, y + 1, 64, 20, '#2B2118');
    R(c, x + 2, y + 2, 62, 18, '#2563EB');
    R(c, x + 2, y + 2, 62, 2, '#60A5FA'); // Mái sáng
    R(c, x + 2, y + 12, 62, 4, '#FFFFFF'); // Sọc trắng biểu tượng
    R(c, x + 2, y + 16, 62, 4, '#1D4ED8');
    // 7 Cửa sổ lớn sáng đèn
    for (var bx = x + 5; bx < x + 54; bx += 7) {
      R(c, bx, y + 5, 5, 6, isDark ? '#FFE891' : '#DBEAFE');
      R(c, bx, y + 5, 5, 1, '#1E3A8A');
    }
    // Kính lái phía trước & bảng tuyến
    R(c, x + 56, y + 5, 7, 7, '#BFDBFE');
    R(c, x + 57, y + 3, 5, 2, '#FDE047'); // Đèn số tuyến 01
    R(c, x + 62, y + 15, 3, 3, '#FEF08A');
    R(c, x + 1, y + 15, 2, 3, '#EF4444');
    drawWheel(c, x + 14, y + 20, 4.8);
    drawWheel(c, x + 51, y + 20, 4.8);
    if (isDark) R(c, x + 65, y + 13, 14, 8, 'rgba(255,232,140,0.30)');
  } else if (v.kind === 'container') {
    // Xe Container đầu kéo khổng lồ (82×28)
    R(c, x + 1, y + 1, 58, 19, '#2B2118');
    R(c, x + 2, y + 2, 56, 17, v.col); // Thùng container dài
    R(c, x + 2, y + 2, 56, 2, 'rgba(255,255,255,0.22)');
    for (var cx = x + 6; cx < x + 56; cx += 5) R(c, cx, y + 4, 2, 14, 'rgba(0,0,0,0.20)');
    // Khung rơ-moóc thép
    R(c, x + 1, y + 20, 62, 3, '#334155');
    // Đầu kéo lớn màu đỏ
    R(c, x + 60, y + 5, 21, 18, '#2B2118');
    R(c, x + 61, y + 6, 19, 16, '#DC2626');
    R(c, x + 61, y + 6, 19, 2, '#F87171');
    R(c, x + 68, y + 8, 10, 6, '#BAE6FD'); // Kính đầu kéo
    R(c, x + 78, y + 17, 3, 3, '#FEF08A'); // Đèn pha lớn
    // 3 Trục bánh xe lớn
    drawWheel(c, x + 10, y + 23, 4.8);
    drawWheel(c, x + 21, y + 23, 4.8);
    drawWheel(c, x + 71, y + 23, 4.8);
    if (isDark) R(c, x + 81, y + 15, 14, 8, 'rgba(255,232,140,0.32)');
  }
  c.restore();
}

function drawRiverBoat(c, b, t, isDark) {
  var x = Math.round(b.x), y = Math.round(b.y);
  var bob = Math.round(Math.sin(t * 2.4 + b.phase) * 0.9);
  y += bob;
  c.save();
  if (b.dir < 0) {
    c.translate(x + b.w / 2, 0);
    c.scale(-1, 1);
    c.translate(-(x + b.w / 2), 0);
  }
  // Vệt sóng trắng rẽ nước phía sau đuôi tàu
  var wake = Math.floor(t * 6) % 2;
  R(c, x - 14, y + b.h - 3, 13, 2, 'rgba(255,255,255,0.65)');
  R(c, x - 9 - wake * 2, y + b.h, 9, 1, 'rgba(255,255,255,0.42)');

  if (b.kind === 'cruise') {
    // Tàu du lịch 2 tầng cỡ lớn (68×22)
    R(c, x + 2, y + 12, 58, 9, '#2B2118');
    R(c, x + 3, y + 13, 56, 7, '#F8FAFC');
    R(c, x + 59, y + 14, 7, 5, '#F8FAFC'); // Mũi tàu
    R(c, x + 2, y + 18, 63, 3, '#B91C1C'); // Đáy đỏ
    R(c, x + 9, y + 5, 44, 8, '#2B2118');
    R(c, x + 10, y + 6, 42, 7, '#FFF8E6'); // Tầng 2
    R(c, x + 7, y + 2, 48, 4, '#D97706'); // Mái vòm vàng
    for (var wx = x + 13; wx < x + 49; wx += 6) {
      R(c, wx, y + 8, 4, 4, isDark ? '#FFE066' : '#60A5FA');
      R(c, wx, y + 14, 4, 3, isDark ? '#FFE066' : '#3B82F6');
    }
  } else if (b.kind === 'waterbus') {
    // Saigon Waterbus cỡ lớn (54×20)
    R(c, x + 1, y + 9, 45, 9, '#2B2118');
    R(c, x + 2, y + 10, 43, 7, '#F4B93B');
    R(c, x + 45, y + 12, 7, 5, '#F4B93B');
    R(c, x + 6, y + 4, 34, 6, '#FFFFFF');
    for (var wbx = x + 9; wbx < x + 36; wbx += 6) {
      R(c, wbx, y + 5, 4, 4, isDark ? '#FFE891' : '#38BDF8');
    }
  } else {
    // Tàu chở hàng / Sà lan container khổng lồ (78×24)
    R(c, x + 1, y + 12, 68, 10, '#2B2118');
    R(c, x + 2, y + 13, 66, 8, '#475569');
    R(c, x + 68, y + 15, 8, 6, '#475569');
    R(c, x + 2, y + 19, 73, 3, '#991B1B');
    // Cabin lái lớn phía sau
    R(c, x + 4, y + 3, 13, 10, '#2B2118');
    R(c, x + 5, y + 4, 11, 9, '#F8FAFC');
    R(c, x + 9, y + 6, 6, 4, '#93C5FD');
    // 3 Khối container lớn trên sà lan
    R(c, x + 20, y + 5, 15, 8, '#EA580C');
    R(c, x + 36, y + 5, 15, 8, '#2563EB');
    R(c, x + 52, y + 6, 14, 7, '#16A34A');
  }
  c.restore();
}

function drawBridgePedestrians(c, pedestrians, t) {
  for (var i = 0; i < pedestrians.length; i++) {
    var p = pedestrians[i];
    var px = Math.round(p.x);
    var u = Math.max(0, Math.min(1, (px - 890) / 378));
    var deckY = Math.round(72 - Math.sin(u * Math.PI) * 5);
    var step = Math.floor(t * 7 + i) % 2;
    // Bóng & người đi bộ 2 chiều trên Cầu Đi Bộ
    R(c, px - 1, deckY - 1, 4, 1, 'rgba(43,33,24,0.3)');
    R(c, px, deckY - 4 + step, 1, 3, '#1E293B');
    R(c, px + 2, deckY - 4 + (1 - step), 1, 3, '#1E293B');
    R(c, px - 1, deckY - 8, 5, 4, p.shirt);
    R(c, px, deckY - 11, 3, 3, '#FFD5B5');
    R(c, px, deckY - 12, 3, 1, p.hair);
  }
}

function drawSaigonLiveTrafficAndRiver(c, t, pal, vehicles, boats, pedestrians, pigState, drawPigFn) {
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

  // 4. Sóng mặt sông & Người đi bộ trên Cầu Đi Bộ (CHỈ ĐI BỘ, không có xe)
  c.save();
  c.beginPath(); c.rect(892, 56, 376, 108); c.clip();
  for (var wi = 0; wi < 20; wi++) {
    var wx = 896 + ((wi * 43 + Math.floor(t * 9 * (wi % 2 ? 1 : -1))) % 364 + 364) % 364;
    var wy = 78 + (wi * 13) % 82;
    R(c, wx, wy, 8, 1, pal.waterGlint);
  }
  c.restore();
  if (pedestrians && pedestrians.length) {
    drawBridgePedestrians(c, pedestrians, t);
  }

  // 5. Nếu Heo đang đi bộ ở tầng trên (vỉa hè / Cầu Đi Bộ / Công viên Thủ Thiêm, y < 94) -> vẽ trước các làn xe
  var pigY = pigState ? pigState.y : 80;
  if (drawPigFn && pigY < 94) drawPigFn();

  // 6. Làn xe trên (Đại lộ + Cầu Ba Son, lane === 0)
  for (var vi = 0; vi < vehicles.length; vi++) {
    if (vehicles[vi].lane === 0) drawVehicle(c, vehicles[vi], t, isDark);
  }
  // Nếu Heo đang lái xe máy ở làn trên (94 <= y < 126)
  if (drawPigFn && pigY >= 94 && pigY < 126) drawPigFn();

  // 7. CSGT áo vàng 12×22 đứng bục giữa giao lộ (x: 468, y: 130)
  drawTrafficPolice(c, 468, 130, t);

  // 8. Làn xe dưới (Đại lộ + Cầu Ba Son, lane === 1)
  for (var vj = 0; vj < vehicles.length; vj++) {
    if (vehicles[vj].lane === 1) drawVehicle(c, vehicles[vj], t, isDark);
  }
  // Nếu Heo đang lái xe máy ở làn dưới (y >= 126)
  if (drawPigFn && pigY >= 126) drawPigFn();

  // 9. 3 Tàu thuyền lớn rẽ sóng chạy dưới gầm Cầu Ba Son trên Sông Sài Gòn (x: 894..1264, y: 136..164)
  c.save();
  c.beginPath(); c.rect(894, 136, 372, 28); c.clip();
  for (var bi = 0; bi < boats.length; bi++) {
    drawRiverBoat(c, boats[bi], t, isDark);
  }
  c.restore();
}
`;
}
