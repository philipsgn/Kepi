/**
 * Sân Vận Động Trống Đồng — Chuẩn Quốc Tế FIFA (840 × 680 — Quyết định 231)
 * - Nửa trên (y: 0..418): Chảo Lửa SVĐ Trống Đồng (Mái vòm hoa văn Mặt Trời & Chim Lạc Trống Đồng Đông Sơn,
 *   ghế khán đài 4 phía phủ Đỏ-Vàng khắc Cờ Đỏ Sao Vàng khổng lồ, 4 trụ đèn pha LED, đường pitch chạy điền kinh
 *   6 làn đỏ kẻ vạch trắng 1..6, sân cỏ FIFA 480×216 sọc 2 tông mượt mà khắc chìm Mặt Trời Trống Đồng,
 *   2 khung thành lưới trắng 3D, 2 khu kỹ thuật cabin dự bị + HLV chỉ đạo).
 * - Trận đấu trực tiếp 11v11 chuẩn FIFA (60fps AI): 22 cầu thủ (VN 4-3-3 Đỏ-Vàng vs Khách 4-4-2 Xanh-Trắng),
 *   chuyền bóng, rê bóng, sút cầu môn, thủ môn bay người cản phá, hiệu ứng GOAL! & bảng tỷ số LED live,
 *   kèm 1 Trọng tài chính + 2 Trọng tài biên phất cờ.
 * - Nửa dưới (y: 418..680): 7 Phòng Hậu Trường Chuẩn FIFA (Đường Hầm Cầu Thủ nối thẳng lên sân cỏ,
 *   Phòng Thay Đồ Đội Nhà VN, Phòng Thay Đồ Đội Khách, Phòng Hồi Sức & Y Tế Cryo,
 *   Phòng Trọng Tài & Điều Hành VAR, Phòng Họp Báo & Tủ Trống Đồng, Khu Nhà Vệ Sinh Nam/Nữ).
 */
export function buildStadiumInteriorArtScript(): string {
  return String.raw`
/* ==================== 1. HỌA TIẾT TRỐNG ĐỒNG ĐÔNG SƠN & KHÁN ĐÀI CỜ ĐỎ SAO VÀNG ==================== */
function drawDongSonSun(c, cx, cy, r, col, alpha) {
  c.save();
  if (alpha !== undefined) c.globalAlpha = alpha;
  c.strokeStyle = col;
  c.fillStyle = col;
  c.lineWidth = 1;
  // Tâm mặt trời
  c.beginPath(); c.arc(cx, cy, Math.max(2, Math.round(r * 0.28)), 0, Math.PI * 2); c.fill();
  // Vòng tròn hoa văn đồng tâm
  c.beginPath(); c.arc(cx, cy, Math.round(r * 0.65), 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.stroke();
  // 12 tia mặt trời Trống Đồng
  for (var i = 0; i < 12; i++) {
    var a = (i * Math.PI * 2) / 12;
    c.beginPath();
    c.moveTo(Math.round(cx + Math.cos(a) * r * 0.34), Math.round(cy + Math.sin(a) * r * 0.34));
    c.lineTo(Math.round(cx + Math.cos(a) * r * 0.94), Math.round(cy + Math.sin(a) * r * 0.94));
    c.stroke();
  }
  c.restore();
}

function drawChimLacMotif(c, x, y, flip, col) {
  var d = flip ? -1 : 1;
  // Thân & mỏ dài đặc trưng Chim Lạc Trống Đồng
  R(c, x, y, 7, 2, col);
  R(c, x + (flip ? -4 : 7), y - 1, 4, 1, col);
  // Cánh sải cong trên & dưới
  R(c, x + 2, y - 3, 3, 2, col);
  R(c, x + 2, y + 2, 3, 2, col);
  // Đuôi dài uốn
  R(c, x + (flip ? 7 : -3), y + 1, 3, 1, col);
  if (d === 0) return;
}

function drawFloodlightTower(c, x, y) {
  R(c, x, y + 8, 4, 18, '#64748B');
  R(c, x + 1, y + 8, 1, 18, '#CBD5E1');
  R(c, x - 6, y, 16, 9, '#1E293B');
  R(c, x - 5, y + 1, 14, 7, '#FEF08A');
  for (var lx = x - 4; lx <= x + 6; lx += 3) {
    R(c, lx, y + 2, 2, 2, '#FFFFFF');
    R(c, lx, y + 5, 2, 2, '#FFFFFF');
  }
}

function drawNorthStandAndTrongDongRoof(c) {
  // Mái vòm Trống Đồng Đông Sơn phía Bắc (x: 34..806, y: 4..26)
  R(c, 34, 4, 772, 22, '#8C5418');
  R(c, 34, 4, 772, 3, '#B8291E');     // Gờ đỏ son uy nghi
  R(c, 34, 7, 772, 2, '#F3C969');     // Chỉ vàng đồng ánh kim
  R(c, 34, 24, 772, 2, '#2B2118');
  // Các múi vòm Trống Đồng chạy dọc mái
  for (var rx = 44; rx < 796; rx += 26) {
    R(c, rx, 9, 2, 15, '#B07428');
    R(c, rx + 2, 9, 1, 15, '#5C370E');
  }
  // Họa tiết Mặt Trời Trống Đồng & dải Chim Lạc đối xứng 2 bên mái
  drawDongSonSun(c, 220, 16, 7, '#F3C969', 0.9);
  drawDongSonSun(c, 620, 16, 7, '#F3C969', 0.9);
  for (var ci = 0; ci < 5; ci++) {
    drawChimLacMotif(c, 68 + ci * 26, 16, false, '#FDE68A');
    drawChimLacMotif(c, 252 + ci * 20, 16, false, '#FDE68A');
    drawChimLacMotif(c, 500 + ci * 20, 16, true, '#FDE68A');
    drawChimLacMotif(c, 654 + ci * 26, 16, true, '#FDE68A');
  }

  // Khán đài Bắc phủ ghế Đỏ-Vàng khắc Cờ Đỏ Sao Vàng khổng lồ (x: 68..772, y: 26..74)
  R(c, 68, 26, 704, 48, '#7F1D1D');
  for (var row = 0; row < 6; row++) {
    var ry = 27 + row * 8;
    // Bậc bê tông & hàng ghế đỏ rực rỡ
    R(c, 70, ry, 700, 2, '#450A0A');
    for (var sx = 72; sx < 768; sx += 5) {
      // Lối cầu thang bê tông chia block khán đài
      if ((sx >= 198 && sx <= 206) || (sx >= 324 && sx <= 332) || (sx >= 508 && sx <= 516) || (sx >= 634 && sx <= 642)) {
        R(c, sx, ry + 2, 4, 6, '#CBD5E1');
        continue;
      }
      R(c, sx, ry + 2, 4, 5, row % 2 === 0 ? '#DC2626' : '#EF4444');
      R(c, sx, ry + 2, 4, 1, '#FCA5A5');
    }
  }
  // Ghế vàng ghép hình NGÔI SAO VÀNG 5 CÁNH khổng lồ chính giữa Khán đài Bắc (cx: 420, cy: 50)
  c.save();
  c.fillStyle = '#FACC15';
  c.beginPath();
  for (var spi = 0; spi < 10; spi++) {
    var rad = spi % 2 === 0 ? 21 : 8.5;
    var ang = -Math.PI / 2 + (spi * Math.PI) / 5;
    var px = Math.round(420 + Math.cos(ang) * rad);
    var py = Math.round(50 + Math.sin(ang) * rad);
    if (spi === 0) c.moveTo(px, py); else c.lineTo(px, py);
  }
  c.closePath();
  c.fill();
  // Đường kẻ phân bậc ghế xuyên qua ngôi sao vàng cho chân thực
  for (var sr = 0; sr < 6; sr++) {
    R(c, 396, 27 + sr * 8, 48, 1, 'rgba(127,29,29,0.55)');
  }
  c.restore();

  // Viền phân cách & Dải biển quảng cáo LED dọc biên Bắc (y: 74..82)
  R(c, 68, 74, 704, 8, '#111827');
  var ledCols = ['#DC2626', '#FACC15', '#1D4ED8', '#16A34A', '#DC2626', '#FACC15'];
  for (var li = 0; li < 12; li++) {
    R(c, 74 + li * 58, 76, 52, 4, ledCols[li % ledCols.length]);
    R(c, 78 + li * 58, 77, 26, 2, '#FFFFFF');
  }
}

function drawSideStands(c) {
  // Khán đài Tây (x: 8..68, y: 80..378) & Khán đài Đông (x: 772..832, y: 80..378)
  var sides = [8, 772];
  for (var si = 0; si < 2; si++) {
    var bx = sides[si];
    R(c, bx, 80, 60, 298, '#7F1D1D');
    R(c, bx, 80, 2, 298, '#2B2118');
    R(c, bx + 58, 80, 2, 298, '#2B2118');
    for (var col = 0; col < 5; col++) {
      var cx = bx + 4 + col * 11;
      for (var sy = 86; sy < 372; sy += 6) {
        if (sy >= 220 && sy <= 236) {
          R(c, cx, sy, 9, 5, '#CBD5E1'); // Lối cầu thang giữa khán đài Đông/Tây
          continue;
        }
        // Dải ghế vàng tạo điểm nhấn cờ đỏ sao vàng ở giữa 2 khán đài cánh
        var isGoldBand = (sy >= 196 && sy <= 214) || (sy >= 242 && sy <= 260);
        R(c, cx, sy, 8, 4, isGoldBand ? '#FACC15' : (col % 2 === 0 ? '#DC2626' : '#EF4444'));
      }
    }
  }
  // 4 Trụ đèn pha LED 4 góc SVĐ
  drawFloodlightTower(c, 16, 12);
  drawFloodlightTower(c, 816, 12);
  drawFloodlightTower(c, 16, 382);
  drawFloodlightTower(c, 816, 382);
}

/* ==================== 2. ĐƯỜNG PITCH 6 LÀN ĐỎ + SÂN CỎ FIFA + 2 KHUNG THÀNH + KHU KỸ THUẬT ==================== */
function traceRoundedRect(c, x, y, w, h, r) {
  var rr = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + rr, y);
  c.lineTo(x + w - rr, y);
  c.quadraticCurveTo(x + w, y, x + w, y + rr);
  c.lineTo(x + w, y + h - rr);
  c.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  c.lineTo(x + rr, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - rr);
  c.lineTo(x, y + rr);
  c.quadraticCurveTo(x, y, x + rr, y);
  c.closePath();
}

function drawRunningTrackAndFifaPitch(c) {
  // Nền bê tông bao quanh sân
  R(c, 68, 82, 704, 332, '#94A3B8');

  // Đường pitch chạy điền kinh chuẩn quốc tế 6 làn đỏ gạch (x: 74..766, y: 86..374)
  c.save();
  c.fillStyle = '#C2412D';
  traceRoundedRect(c, 74, 86, 692, 288, 72);
  c.fill();
  c.lineWidth = 2;
  c.strokeStyle = '#7F1D1D';
  c.stroke();
  // 6 làn chạy kẻ vạch trắng sắc nét
  c.lineWidth = 1;
  c.strokeStyle = 'rgba(255,255,255,0.68)';
  for (var lane = 1; lane <= 5; lane++) {
    var pad = lane * 5;
    traceRoundedRect(c, 74 + pad, 86 + pad, 692 - pad * 2, 288 - pad * 2, Math.max(12, 72 - pad));
    c.stroke();
  }
  c.restore();

  // Vạch xuất phát & vạch đích trên đường pitch (bám sát ảnh thực tế đường pitch 1..6)
  R(c, 224, 344, 2, 29, '#FFFFFF');
  R(c, 614, 344, 2, 29, '#FFFFFF');
  for (var ln = 0; ln < 6; ln++) {
    R(c, 218, 346 + ln * 5, 3, 2, '#FFFDF7'); // Đánh số làn 1..6 pixel
  }

  // Viền cỏ bảo vệ ngoài biên sân cỏ FIFA (x: 158..682, y: 112..344)
  R(c, 158, 112, 524, 232, '#256F31');
  R(c, 158, 112, 524, 2, '#1B4D21');

  // SÂN CỎ FIFA CHUẨN QUỐC TẾ (x: 180..660, y: 120..336 — 480 × 216 px)
  // 12 dải cỏ sọc đứng mượt mà êm ái 2 tông xanh
  var stripeW = 40;
  for (var si = 0; si < 12; si++) {
    R(c, 180 + si * stripeW, 120, stripeW, 216, si % 2 === 0 ? '#2F8F3D' : '#3BA64B');
  }
  // Họa tiết Mặt Trời Trống Đồng Đông Sơn khắc chìm cực tinh tế tại tâm sân cỏ!
  drawDongSonSun(c, 420, 228, 30, '#FFFDF7', 0.16);

  // Kẻ vạch vôi trắng chuẩn FIFA sắc nét
  c.save();
  c.strokeStyle = '#F8FAFC';
  c.fillStyle = '#F8FAFC';
  c.lineWidth = 2;
  // Biên ngoài sân cỏ
  c.strokeRect(180, 120, 480, 216);
  // Vạch giữa sân
  c.beginPath(); c.moveTo(420, 120); c.lineTo(420, 336); c.stroke();
  // Vòng tròn trung tâm & chấm giao bóng
  c.beginPath(); c.arc(420, 228, 34, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.arc(420, 228, 3, 0, Math.PI * 2); c.fill();
  // Vòng cấm địa 16m50 Trái & Phải
  c.strokeRect(180, 166, 68, 124);
  c.strokeRect(592, 166, 68, 124);
  // Vòng 5m50 Trái & Phải
  c.strokeRect(180, 197, 24, 62);
  c.strokeRect(636, 197, 24, 62);
  // Chấm phạt đền 11m
  c.beginPath(); c.arc(226, 228, 2.5, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.arc(614, 228, 2.5, 0, Math.PI * 2); c.fill();
  // Cung tròn chữ D ngoài vòng cấm
  c.beginPath(); c.arc(226, 228, 30, -0.72, 0.72); c.stroke();
  c.beginPath(); c.arc(614, 228, 30, Math.PI - 0.72, Math.PI + 0.72); c.stroke();
  // 4 Cung phạt góc
  c.beginPath(); c.arc(180, 120, 8, 0, Math.PI / 2); c.stroke();
  c.beginPath(); c.arc(660, 120, 8, Math.PI / 2, Math.PI); c.stroke();
  c.beginPath(); c.arc(180, 336, 8, -Math.PI / 2, 0); c.stroke();
  c.beginPath(); c.arc(660, 336, 8, Math.PI, Math.PI * 1.5); c.stroke();
  c.restore();

  // 2 KHUNG THÀNH LƯỚI TRẮNG 3D CHUẨN QUỐC TẾ (Trái & Phải)
  // Khung thành trái (x: 164..180, y: 204..252)
  R(c, 164, 204, 16, 48, 'rgba(248,250,252,0.22)');
  for (var gy = 206; gy < 252; gy += 5) R(c, 165, gy, 15, 1, 'rgba(255,255,255,0.55)');
  for (var gx = 166; gx < 180; gx += 4) R(c, gx, 205, 1, 46, 'rgba(255,255,255,0.55)');
  R(c, 164, 203, 17, 2, '#FFFFFF'); R(c, 164, 251, 17, 2, '#FFFFFF');
  R(c, 164, 203, 2, 50, '#CBD5E1'); R(c, 179, 203, 2, 50, '#FFFFFF');
  // Khung thành phải (x: 660..676, y: 204..252)
  R(c, 660, 204, 16, 48, 'rgba(248,250,252,0.22)');
  for (var gy2 = 206; gy2 < 252; gy2 += 5) R(c, 660, gy2, 15, 1, 'rgba(255,255,255,0.55)');
  for (var gx2 = 662; gx2 < 676; gx2 += 4) R(c, gx2, 205, 1, 46, 'rgba(255,255,255,0.55)');
  R(c, 659, 203, 17, 2, '#FFFFFF'); R(c, 659, 251, 17, 2, '#FFFFFF');
  R(c, 674, 203, 2, 50, '#CBD5E1'); R(c, 659, 203, 2, 50, '#FFFFFF');
}

function drawTechnicalBenchesAndDugouts(c) {
  // 2 KHU KỸ THUẬT HLV & DỰ BỊ ĐẦY ĐỦ TIỆN NGHI (Trái: Đội Nhà VN, Phải: Đội Khách)
  var benches = [
    { x: 206, seatCol: '#DC2626', accent: '#FACC15', bib: '#FACC15', label: 'VN' },
    { x: 486, seatCol: '#2563EB', accent: '#F8FAFC', bib: '#FB923C', label: 'AW' }
  ];
  for (var bi = 0; bi < 2; bi++) {
    var b = benches[bi];
    // Vạch trắng khu kỹ thuật sát đường biên dưới
    c.save();
    c.strokeStyle = 'rgba(255,255,255,0.78)';
    c.lineWidth = 1;
    c.strokeRect(b.x - 4, 344, 156, 48);
    c.restore();
    // Cabin mái vòm kính cong che nắng mưa
    R(c, b.x, 360, 148, 28, '#1E293B');
    R(c, b.x + 2, 362, 144, 10, '#93C5FD'); // Mái kính trong xanh
    R(c, b.x + 2, 372, 144, 14, '#334155');
    // 6 Ghế bọc da thể thao & 5 Cầu thủ dự bị mặc áo bib ngồi theo dõi
    for (var si = 0; si < 6; si++) {
      var sx = b.x + 12 + si * 21;
      R(c, sx, 373, 14, 11, b.seatCol);
      R(c, sx + 2, 374, 10, 2, b.accent);
      if (si < 5) {
        // Cầu thủ dự bị ngồi ghế
        R(c, sx + 4, 371, 6, 5, '#FCD5B5'); // Mặt
        R(c, sx + 4, 370, 6, 2, '#2B2118'); // Tóc
        R(c, sx + 3, 376, 8, 6, b.bib);    // Áo bib dự bị
      }
    }
    // Thùng đá nước giải khát & bảng sa bàn mini
    R(c, b.x + 136, 376, 9, 8, '#38BDF8'); R(c, b.x + 136, 375, 9, 2, '#FFFFFF');
  }
  // CỔNG VÒM LỐI RA ĐƯỜNG HẦM TRỐNG ĐỒNG (chính giữa x: 374..466, y: 376..418)
  R(c, 374, 376, 92, 42, '#2B2118');
  R(c, 378, 380, 84, 38, '#2E8B3C'); // Thảm cỏ nhân tạo lối ra sân
  R(c, 374, 376, 92, 6, '#9A631B');  // Vòm đồng Trống Đồng
  R(c, 376, 377, 88, 2, '#F3C969');
  drawDongSonSun(c, 420, 380, 5, '#FDE68A', 0.95);
}

/* ==================== 3. KHU HẬU TRƯỜNG CHUẨN FIFA — 7 PHÒNG CHỨC NĂNG (y: 418..680) ==================== */
function drawRoomPlate(c, x, y, w, bg, fg, bars) {
  R(c, x, y, w, 10, '#2B2118');
  R(c, x + 1, y + 1, w - 2, 8, bg);
  for (var i = 0; i < bars; i++) {
    R(c, x + 5 + i * 7, y + 4, 5, 2, fg);
  }
}

function drawFifaBackstageRooms(c) {
  // Nền bê tông tổng thể khu hậu trường (y: 416..680)
  R(c, 0, 416, 840, 264, '#1F242D');
  R(c, 0, 416, 840, 4, '#2B2118');

  // --- HÀNH LANG HẬU TRƯỜNG LÁT ĐÁ SÁNG THÔNG SUỐT (x: 16..824, y: 540..566) ---
  R(c, 16, 540, 808, 26, '#E2E8F0');
  for (var hx = 16; hx < 824; hx += 16) R(c, hx, 540, 1, 26, 'rgba(30,41,59,0.12)');
  R(c, 16, 552, 808, 2, 'rgba(30,41,59,0.08)');

  // --- PHÒNG 1: ĐƯỜNG HẦM CẦU THỦ (PLAYER TUNNEL — x: 374..466, y: 416..542) ---
  R(c, 374, 416, 92, 126, '#273142');
  R(c, 384, 416, 72, 126, '#2E8B3C'); // Thảm xanh cầu thủ bước ra sân
  R(c, 388, 416, 64, 126, '#389E47');
  // 2 Dải đèn LED dẫn đường dọc tường hầm
  for (var ty = 424; ty < 536; ty += 16) {
    R(c, 378, ty, 3, 8, '#FACC15');
    R(c, 459, ty, 3, 8, '#FACC15');
  }
  drawDongSonSun(c, 420, 478, 16, '#FDE68A', 0.35);

  // --- PHÒNG 2: PHÒNG THAY ĐỒ ĐỘI TUYỂN VIỆT NAM (HOME LOCKER ROOM — x: 16..368, y: 422..540) ---
  R(c, 16, 422, 352, 118, '#E7D5B8');
  R(c, 16, 422, 352, 14, '#991B1B'); // Tường đỏ tự hào ĐT Việt Nam
  R(c, 16, 434, 352, 2, '#FACC15');
  // Khu phòng tắm vòi sen riêng góc trái (x: 20..92, y: 438..534)
  R(c, 20, 438, 72, 96, '#DBEAFE');
  R(c, 92, 438, 3, 96, '#475569');
  for (var shy = 448; shy <= 512; shy += 28) {
    R(c, 24, shy, 64, 2, '#93C5FD');
    R(c, 26, shy + 6, 8, 8, '#60A5FA'); // Vòi sen tắm
    R(c, 34, shy + 9, 4, 2, '#FFFFFF');
  }
  // 11 Tủ đồ gỗ cá nhân treo sẵn áo đấu Đỏ-Vàng ĐT Việt Nam (x: 102..356)
  for (var li = 0; li < 11; li++) {
    var lx = 102 + li * 23;
    R(c, lx, 438, 20, 26, '#6E452A');
    R(c, lx + 2, 440, 16, 22, '#3B2314');
    // Áo đấu Đỏ-Vàng treo trong tủ
    R(c, lx + 5, 444, 10, 11, '#DC2626');
    R(c, lx + 8, 447, 4, 3, '#FACC15');
    R(c, lx + 6, 456, 8, 4, '#DC2626');
  }
  // Ghế băng gỗ dài giữa phòng + Bảng sa bàn chiến thuật 4-3-3
  R(c, 134, 486, 172, 14, '#8C5428'); R(c, 134, 486, 172, 3, '#C48A55');
  R(c, 320, 474, 40, 28, '#166534'); R(c, 322, 476, 36, 24, '#22C55E'); // Sa bàn chiến thuật
  R(c, 339, 476, 1, 24, '#FFFFFF');
  // Tủ lạnh nước điện giải
  R(c, 104, 476, 18, 26, '#CBD5E1'); R(c, 107, 480, 12, 16, '#38BDF8');
  // Cửa mở xuống hành lang
  R(c, 204, 536, 44, 6, '#E2E8F0');
  drawRoomPlate(c, 186, 424, 78, '#7F1D1D', '#FACC15', 9);

  // --- PHÒNG 3: PHÒNG THAY ĐỒ ĐỘI KHÁCH (AWAY LOCKER ROOM — x: 472..824, y: 422..540) ---
  R(c, 472, 422, 352, 118, '#E2E8F0');
  R(c, 472, 422, 352, 14, '#1E3A8A'); // Tường xanh dương chuẩn công bằng FIFA
  R(c, 472, 434, 352, 2, '#93C5FD');
  // Khu phòng tắm vòi sen góc phải (x: 748..820)
  R(c, 748, 438, 72, 96, '#DBEAFE');
  R(c, 745, 438, 3, 96, '#475569');
  for (var shy2 = 448; shy2 <= 512; shy2 += 28) {
    R(c, 752, shy2, 64, 2, '#93C5FD');
    R(c, 804, shy2 + 6, 8, 8, '#60A5FA');
  }
  // 11 Tủ đồ treo áo đấu Xanh-Trắng Đội Khách
  for (var li2 = 0; li2 < 11; li2++) {
    var lx2 = 482 + li2 * 23;
    R(c, lx2, 438, 20, 26, '#475569');
    R(c, lx2 + 2, 440, 16, 22, '#1E293B');
    R(c, lx2 + 5, 444, 10, 11, '#2563EB');
    R(c, lx2 + 8, 447, 4, 3, '#FFFFFF');
    R(c, lx2 + 6, 456, 8, 4, '#F8FAFC');
  }
  // Ghế băng dài & Sa bàn 4-4-2 & Tủ nước
  R(c, 534, 486, 172, 14, '#475569'); R(c, 534, 486, 172, 3, '#94A3B8');
  R(c, 480, 474, 40, 28, '#166534'); R(c, 482, 476, 36, 24, '#22C55E');
  R(c, 718, 476, 18, 26, '#CBD5E1'); R(c, 721, 480, 12, 16, '#38BDF8');
  R(c, 592, 536, 44, 6, '#E2E8F0');
  drawRoomPlate(c, 576, 424, 78, '#1E3A8A', '#FFFFFF', 9);

  // --- PHÒNG 4: PHÒNG HỒI SỨC & Y TẾ THỂ THAO CRYO (MEDICAL & RECOVERY — x: 16..224, y: 566..672) ---
  R(c, 16, 566, 208, 106, '#F8FAFC');
  R(c, 16, 566, 208, 12, '#0284C7');
  // Biểu tượng chữ thập đỏ y tế nổi bật
  R(c, 26, 568, 8, 8, '#FFFFFF'); R(c, 29, 569, 2, 6, '#EF4444'); R(c, 27, 571, 6, 2, '#EF4444');
  // 2 Bể ngâm nước đá phục hồi Cryo Ice Baths (x: 26..106, y: 586..622)
  for (var ib = 0; ib < 2; ib++) {
    var ix = 26 + ib * 44;
    R(c, ix, 586, 38, 30, '#475569');
    R(c, ix + 3, 589, 32, 24, '#38BDF8');
    R(c, ix + 6, 593, 8, 4, '#E0F2FE'); // Viên đá lạnh nổi lấp lánh
    R(c, ix + 20, 602, 7, 4, '#E0F2FE');
  }
  // 2 Giường vật lý trị liệu hồi sức (x: 122..214)
  for (var mb = 0; mb < 2; mb++) {
    var my = 588 + mb * 34;
    R(c, 134, my, 76, 24, '#CBD5E1');
    R(c, 136, my + 2, 72, 20, '#FFFFFF');
    R(c, 194, my + 4, 12, 16, '#BAE6FD'); // Gối đầu
  }
  // Tủ thuốc cấp cứu + Máy khử rung tim AED + Cáng cứu thương
  R(c, 26, 632, 34, 28, '#FFFFFF'); R(c, 26, 632, 34, 2, '#94A3B8');
  R(c, 40, 638, 6, 14, '#EF4444'); R(c, 36, 642, 14, 6, '#EF4444');
  R(c, 70, 638, 44, 18, '#F97316'); R(c, 74, 642, 36, 10, '#FED7AA'); // Cáng cứu thương
  R(c, 100, 564, 34, 6, '#E2E8F0'); // Cửa mở thông hành lang

  // --- PHÒNG 5: PHÒNG TRỌNG TÀI & ĐIỀU HÀNH VAR (REFEREE & VAR ROOM — x: 232..432, y: 566..672) ---
  R(c, 232, 566, 200, 106, '#334155');
  R(c, 232, 566, 200, 12, '#0F172A');
  // Nửa trái: Khu nghỉ Trọng Tài (tủ treo áo đen-vàng + bàn biên bản)
  R(c, 236, 580, 76, 86, '#E2E8F0');
  R(c, 244, 586, 18, 22, '#1E293B'); R(c, 248, 590, 10, 12, '#FACC15'); // Áo trọng tài
  R(c, 268, 586, 18, 22, '#1E293B'); R(c, 272, 590, 10, 12, '#111827');
  R(c, 244, 628, 54, 24, '#8C5428'); R(c, 254, 634, 16, 12, '#FFFFFF'); // Biên bản trận đấu
  // Nửa phải: Trạm VAR Operations Room với 4 Màn Hình Sáng Đèn
  R(c, 316, 580, 112, 86, '#1E293B');
  for (var vm = 0; vm < 4; vm++) {
    var vx = 322 + vm * 26;
    R(c, vx, 586, 22, 18, '#020617');
    R(c, vx + 2, 588, 18, 14, '#22C55E'); // Màn hình quay góc sân cỏ VAR
    R(c, vx + 10, 588, 1, 14, '#FFFFFF');
    R(c, vx + 6, 594, 4, 4, '#EF4444');   // Đường kẻ việt vị VAR
  }
  R(c, 322, 610, 100, 18, '#475569'); // Bàn điều khiển kỹ thuật VAR
  // 2 Kỹ thuật viên VAR ngồi giám sát
  R(c, 344, 634, 14, 14, '#0EA5E9'); R(c, 347, 628, 8, 7, '#FCD5B5');
  R(c, 386, 634, 14, 14, '#0EA5E9'); R(c, 389, 628, 8, 7, '#FCD5B5');
  R(c, 310, 564, 34, 6, '#E2E8F0');

  // --- PHÒNG 6: PHÒNG HỌP BÁO & TRUYỀN THỐNG TRỐNG ĐỒNG (PRESS & HERITAGE — x: 440..664, y: 566..672) ---
  R(c, 440, 566, 224, 106, '#F1F5F9');
  R(c, 440, 566, 224, 12, '#991B1B');
  // Bục họp báo & Phông nền Đỏ-Vàng FIFA Trống Đồng
  R(c, 452, 582, 134, 14, '#B91C1C'); R(c, 456, 585, 126, 8, '#FACC15');
  R(c, 466, 598, 106, 16, '#1E293B'); // Bàn họp báo + 3 micro
  R(c, 486, 596, 2, 6, '#CBD5E1'); R(c, 518, 596, 2, 6, '#CBD5E1'); R(c, 550, 596, 2, 6, '#CBD5E1');
  // 2 Hàng ghế phóng viên
  for (var pr = 0; pr < 2; pr++) {
    for (var pc = 0; pc < 6; pc++) {
      R(c, 462 + pc * 20, 626 + pr * 20, 14, 12, '#334155');
      R(c, 464 + pc * 20, 628 + pr * 20, 10, 4, '#64748B');
    }
  }
  // Tủ kính trưng bày TRỐNG ĐỒNG ĐÔNG SƠN & CÚP VÀNG VÔ ĐỊCH phát sáng (x: 598..656, y: 584..662)
  R(c, 598, 584, 58, 78, '#1E293B');
  R(c, 602, 588, 50, 70, '#451A03');
  drawDongSonSun(c, 627, 612, 15, '#FACC15', 0.95); // Mặt Trống Đồng trưng bày
  R(c, 621, 636, 12, 14, '#FACC15'); R(c, 618, 636, 18, 4, '#FEF08A'); // Cúp Vàng Vô Địch
  R(c, 536, 564, 34, 6, '#E2E8F0');

  // --- PHÒNG 7: KHU NHÀ VỆ SINH HIỆN ĐẠI NAM / NỮ (RESTROOMS — x: 672..824, y: 566..672) ---
  R(c, 672, 566, 152, 106, '#F8FAFC');
  R(c, 672, 566, 76, 12, '#2563EB');  // Biển Khu Nam (Xanh)
  R(c, 748, 566, 76, 12, '#EC4899');  // Biển Khu Nữ (Hồng)
  R(c, 747, 578, 3, 94, '#475569');   // Vách ngăn giữa Nam & Nữ
  // Khu Nam (trái): 3 buồng vệ sinh + bồn rửa tay gương soi
  for (var wcm = 0; wcm < 3; wcm++) {
    R(c, 676 + wcm * 23, 634, 21, 34, '#CBD5E1');
    R(c, 678 + wcm * 23, 636, 17, 30, '#FFFFFF');
    R(c, 683 + wcm * 23, 648, 7, 10, '#E2E8F0');
  }
  R(c, 678, 586, 62, 14, '#E0F2FE'); // Bồn rửa tay + gương
  R(c, 686, 590, 12, 7, '#FFFFFF'); R(c, 718, 590, 12, 7, '#FFFFFF');
  // Khu Nữ (phải): 3 buồng vệ sinh + bồn rửa tay gương soi
  for (var wcf = 0; wcf < 3; wcf++) {
    R(c, 754 + wcf * 23, 634, 21, 34, '#FBCFE8');
    R(c, 756 + wcf * 23, 636, 17, 30, '#FFFFFF');
    R(c, 761 + wcf * 23, 648, 7, 10, '#FCE7F3');
  }
  R(c, 756, 586, 62, 14, '#FCE7F3');
  R(c, 764, 590, 12, 7, '#FFFFFF'); R(c, 796, 590, 12, 7, '#FFFFFF');
  R(c, 700, 564, 24, 6, '#E2E8F0'); R(c, 774, 564, 24, 6, '#E2E8F0');
}

function buildStadiumBackgroundCanvas() {
  return mk(840, 680, function(c) {
    R(c, 0, 0, 840, 680, '#1E293B');
    drawNorthStandAndTrongDongRoof(c);
    drawSideStands(c);
    drawRunningTrackAndFifaPitch(c);
    drawTechnicalBenchesAndDugouts(c);
    drawFifaBackstageRooms(c);
  });
}

/* ==================== 4. ĐỘNG CƠ TRẬN ĐẤU BÓNG ĐÁ 11v11 CHUẨN FIFA + 3 TRỌNG TÀI (60FPS) ==================== */
function createFootballMatchState() {
  // Đội Tuyển Việt Nam (team 0 — Đỏ-Vàng, sơ đồ 4-3-3 tấn công sang phải)
  var vnForm = [
    [194, 228, 'GK'],
    [248, 152, 'DF'], [244, 202, 'DF'], [244, 254, 'DF'], [248, 304, 'DF'],
    [328, 168, 'MF'], [320, 228, 'MF'], [328, 288, 'MF'],
    [402, 154, 'FW'], [414, 228, 'FW'], [402, 302, 'FW']
  ];
  // Đội Khách Quốc Tế (team 1 — Xanh-Trắng, sơ đồ 4-4-2 tấn công sang trái)
  var awayForm = [
    [646, 228, 'GK'],
    [592, 152, 'DF'], [596, 202, 'DF'], [596, 254, 'DF'], [592, 304, 'DF'],
    [512, 146, 'MF'], [520, 202, 'MF'], [520, 254, 'MF'], [512, 310, 'MF'],
    [438, 194, 'FW'], [438, 262, 'FW']
  ];
  var players = [];
  for (var i = 0; i < vnForm.length; i++) {
    players.push({
      id: i, team: 0, role: vnForm[i][2],
      hx: vnForm[i][0], hy: vnForm[i][1],
      x: vnForm[i][0], y: vnForm[i][1],
      phase: i * 0.7, face: 1, dive: 0
    });
  }
  for (var j = 0; j < awayForm.length; j++) {
    players.push({
      id: 11 + j, team: 1, role: awayForm[j][2],
      hx: awayForm[j][0], hy: awayForm[j][1],
      x: awayForm[j][0], y: awayForm[j][1],
      phase: j * 0.8 + 1.2, face: -1, dive: 0
    });
  }
  // Khán giả cổ vũ sống động trên khán đài Bắc
  var fans = [];
  for (var f = 0; f < 46; f++) {
    var fx = 82 + (f * 15) % 676;
    var fy = 31 + (f % 5) * 8;
    if ((fx >= 196 && fx <= 208) || (fx >= 322 && fx <= 334) || (fx >= 506 && fx <= 518) || (fx >= 632 && fx <= 644)) continue;
    fans.push({
      x: fx, y: fy,
      shirt: (f % 3 === 0) ? '#FACC15' : '#DC2626',
      phase: f * 0.45
    });
  }
  return {
    players: players,
    fans: fans,
    ball: { x: 420, y: 228, vx: 58, vy: -22, z: 0, vz: 0, owner: -1, passCd: 0.4 },
    referee: { x: 420, y: 204, phase: 0 },
    linesmen: [
      { x: 420, y: 115, flagUp: 0 },
      { x: 420, y: 341, flagUp: 0 }
    ],
    scoreVN: 2,
    scoreAway: 1,
    goalFlash: 0,
    matchMin: 68
  };
}

function stepFootballMatch(m, dt, t) {
  if (m.goalFlash > 0) m.goalFlash = Math.max(0, m.goalFlash - dt);
  var b = m.ball;
  if (b.passCd > 0) b.passCd -= dt;

  // Vật lý bóng bay & ma sát mặt cỏ mượt mà
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  b.vx *= Math.pow(0.28, dt);
  b.vy *= Math.pow(0.28, dt);
  if (b.z > 0 || b.vz !== 0) {
    b.z += b.vz * dt;
    b.vz -= 180 * dt;
    if (b.z <= 0) { b.z = 0; b.vz = -b.vz * 0.35; if (Math.abs(b.vz) < 10) b.vz = 0; }
  }

  // Kiểm tra ghi bàn vào 2 khung thành (y: 205..251)
  if (b.x < 180 && b.y > 205 && b.y < 251) {
    m.scoreAway = (m.scoreAway + 1) % 10;
    m.goalFlash = 2.6;
    b.x = 420; b.y = 228; b.vx = 65; b.vy = 18; b.z = 12; b.vz = 30; b.passCd = 0.7;
  } else if (b.x > 660 && b.y > 205 && b.y < 251) {
    m.scoreVN = (m.scoreVN + 1) % 10;
    m.goalFlash = 2.6;
    b.x = 420; b.y = 228; b.vx = -65; b.vy = -18; b.z = 12; b.vz = 30; b.passCd = 0.7;
  } else {
    // Bật nhẹ khi chạm biên ngang/dọc để trận đấu luôn sôi nổi
    if (b.x < 184) { b.x = 184; b.vx = Math.abs(b.vx) * 0.75 + 24; }
    if (b.x > 656) { b.x = 656; b.vx = -Math.abs(b.vx) * 0.75 - 24; }
    if (b.y < 124) { b.y = 124; b.vy = Math.abs(b.vy) * 0.75 + 16; }
    if (b.y > 332) { b.y = 332; b.vy = -Math.abs(b.vy) * 0.75 - 16; }
  }

  // Tìm cầu thủ gần bóng nhất của mỗi đội để áp sát tranh bóng
  var nearest = [-1, -1], minD = [9999, 9999];
  for (var i = 0; i < m.players.length; i++) {
    var p = m.players[i];
    if (p.role === 'GK') continue;
    var d = Math.hypot(b.x - p.x, b.y - p.y);
    if (d < minD[p.team]) { minD[p.team] = d; nearest[p.team] = i; }
  }

  // Di chuyển 22 cầu thủ theo chiến thuật 4-3-3 vs 4-4-2
  var shiftX = (b.x - 420) * 0.42;
  var shiftY = (b.y - 228) * 0.28;
  for (var k = 0; k < m.players.length; k++) {
    var pl = m.players[k];
    var tx, ty, sp = 42;
    if (pl.role === 'GK') {
      tx = pl.hx + (pl.team === 0 ? 4 : -4) * Math.sin(t * 2);
      ty = Math.max(206, Math.min(250, b.y));
      sp = 54;
    } else if (k === nearest[pl.team]) {
      tx = b.x; ty = b.y; sp = 62;
    } else {
      tx = Math.max(200, Math.min(640, pl.hx + shiftX + Math.sin(t * 1.4 + pl.phase) * 14));
      ty = Math.max(132, Math.min(324, pl.hy + shiftY + Math.cos(t * 1.2 + pl.phase) * 10));
    }
    var dx = tx - pl.x, dy = ty - pl.y;
    var dist = Math.hypot(dx, dy);
    if (dist > 1.5) {
      var step = Math.min(dist, sp * dt);
      pl.x += (dx / dist) * step;
      pl.y += (dy / dist) * step;
      pl.face = dx >= 0 ? 1 : -1;
    }
    // Xử lý chạm bóng: Chuyền đồng đội hoặc Sút cầu môn!
    if (b.passCd <= 0 && Math.hypot(b.x - pl.x, b.y - pl.y) < 10) {
      var goalX = pl.team === 0 ? 664 : 176;
      var distGoal = Math.hypot(goalX - pl.x, 228 - pl.y);
      if (pl.role === 'GK') {
        // Thủ môn phát bóng dài lên trên
        b.vx = (pl.team === 0 ? 1 : -1) * (135 + Math.random() * 45);
        b.vy = (Math.random() - 0.5) * 90;
        b.vz = 55;
      } else if (distGoal < 145 && Math.random() < 0.55) {
        // Sút căng về phía khung thành!
        var ang = Math.atan2(228 + (Math.random() - 0.5) * 34 - pl.y, goalX - pl.x);
        b.vx = Math.cos(ang) * 195;
        b.vy = Math.sin(ang) * 195;
        b.vz = 32;
      } else {
        // Chuyền bóng thông minh cho đồng đội phía trước
        var mate = null;
        for (var mi = 0; mi < 6; mi++) {
          var cand = m.players[pl.team * 11 + 1 + Math.floor(Math.random() * 10)];
          if (cand && cand.id !== pl.id) { mate = cand; break; }
        }
        var tgtX = mate ? mate.x + (pl.team === 0 ? 22 : -22) : goalX;
        var tgtY = mate ? mate.y : 228;
        var pa = Math.atan2(tgtY - pl.y, tgtX - pl.x);
        var pwr = 115 + Math.random() * 50;
        b.vx = Math.cos(pa) * pwr;
        b.vy = Math.sin(pa) * pwr;
        b.vz = 14;
      }
      b.passCd = 0.42;
    }
  }

  // Di chuyển Trọng tài chính FIFA & 2 Trọng tài biên
  var ref = m.referee;
  var rtx = Math.max(220, Math.min(620, b.x - 16));
  var rty = Math.max(140, Math.min(316, b.y - 22));
  ref.x += (rtx - ref.x) * Math.min(1, dt * 2.2);
  ref.y += (rty - ref.y) * Math.min(1, dt * 2.2);
  m.linesmen[0].x += (Math.max(200, Math.min(640, b.x)) - m.linesmen[0].x) * Math.min(1, dt * 3.0);
  m.linesmen[1].x += (Math.max(200, Math.min(640, b.x)) - m.linesmen[1].x) * Math.min(1, dt * 3.0);
}

function drawTinyPlayer(c, x, y, jersey, shorts, hair, t, phase, isRef, flagSide) {
  var px = Math.round(x), py = Math.round(y);
  var leg = Math.round(Math.sin(t * 11 + phase) * 1.4);
  R(c, px - 3, py + 1, 6, 2, 'rgba(20,40,20,0.34)'); // Bóng cỏ
  // Chân chạy
  R(c, px - 2, py - 2 + leg, 2, 3, '#FCD5B5');
  R(c, px + 1, py - 2 - leg, 2, 3, '#FCD5B5');
  // Quần & Áo đấu
  R(c, px - 3, py - 5, 6, 3, shorts);
  R(c, px - 3, py - 10, 6, 5, jersey);
  if (!isRef) R(c, px - 1, py - 9, 2, 2, jersey === '#DC2626' ? '#FACC15' : '#FFFFFF');
  // Đầu & Tóc
  R(c, px - 2, py - 14, 4, 4, '#FCD5B5');
  R(c, px - 2, py - 15, 4, 2, hair);
  // Cờ trọng tài biên phất lên xuống
  if (flagSide) {
    var wave = Math.sin(t * 7 + phase) > 0 ? -1 : 0;
    R(c, px + 3, py - 12 + wave, 1, 6, '#F8FAFC');
    R(c, px + 4, py - 12 + wave, 4, 3, '#FACC15');
    R(c, px + 4, py - 12 + wave, 2, 2, '#DC2626');
  }
}

function drawFootballMatchLive(c, m, t) {
  // 1. Bảng tỷ số LED điện tử đỉnh Khán đài Bắc (x: 354..486, y: 5..22)
  R(c, 354, 5, 132, 17, '#0F172A');
  R(c, 354, 5, 132, 1, '#F4B93B'); R(c, 354, 21, 132, 1, '#F4B93B');
  c.save();
  c.font = 'bold 9px monospace';
  c.textAlign = 'center';
  if (m.goalFlash > 0 && Math.floor(t * 8) % 2 === 0) {
    c.fillStyle = '#FACC15';
    c.fillText('★ GOAL! VIỆT NAM ★', 420, 17);
  } else {
    c.fillStyle = '#EF4444'; c.fillText('VN', 376, 17);
    c.fillStyle = '#FACC15'; c.fillText(String(m.scoreVN) + ' - ' + String(m.scoreAway), 420, 17);
    c.fillStyle = '#60A5FA'; c.fillText('AW', 464, 17);
  }
  c.restore();

  // 2. Khán giả nhún nhảy cổ vũ nhịp sóng Mexican Wave trên Khán đài Bắc
  for (var fi = 0; fi < m.fans.length; fi++) {
    var fan = m.fans[fi];
    var hop = (m.goalFlash > 0 ? 2 : 1) * (Math.sin(t * (m.goalFlash > 0 ? 12 : 4) + fan.phase) > 0.35 ? 1 : 0);
    R(c, fan.x, fan.y - hop, 3, 3, fan.shirt);
    R(c, fan.x, fan.y - 2 - hop, 3, 2, '#FCD5B5');
  }

  // 3. 4 Cờ phạt góc bay phấp phới
  var corners = [[180, 120], [660, 120], [180, 336], [660, 336]];
  var cw = Math.sin(t * 7) > 0 ? 1 : 0;
  for (var ci = 0; ci < 4; ci++) {
    var cx = corners[ci][0], cy = corners[ci][1];
    R(c, cx, cy - 8, 1, 8, '#FFFFFF');
    R(c, cx + 1, cy - 8 + cw, 4, 3, '#DC2626');
    R(c, cx + 2, cy - 7 + cw, 2, 1, '#FACC15');
  }

  // 4. 2 HLV đứng chỉ đạo vung tay ở 2 khu kỹ thuật + Bác sĩ phòng y tế
  var coachWave = Math.sin(t * 5) > 0 ? 1 : 0;
  drawTinyPlayer(c, 224, 358, '#111827', '#1E293B', '#2B2118', t * 0.3, 0, true, false);
  R(c, 227, 349 - coachWave, 2, 3, '#FCD5B5'); // Tay HLV VN ra hiệu chiến thuật
  drawTinyPlayer(c, 616, 358, '#334155', '#1E293B', '#4A3222', t * 0.3, 1.4, true, false);
  // Bác sĩ áo blouse trắng trong Phòng Hồi Sức & Y tế
  drawTinyPlayer(c, 120, 622, '#FFFFFF', '#0284C7', '#1E293B', t * 0.2, 2.2, true, false);

  // 5. Vẽ 22 Cầu thủ + 3 Trọng tài theo thứ tự Y-sorting mượt mà
  var actors = [];
  for (var pi = 0; pi < m.players.length; pi++) {
    var p = m.players[pi];
    var jersey = p.role === 'GK' ? (p.team === 0 ? '#FACC15' : '#22C55E') : (p.team === 0 ? '#DC2626' : '#2563EB');
    var shorts = p.team === 0 ? '#DC2626' : '#F8FAFC';
    actors.push({ x: p.x, y: p.y, jersey: jersey, shorts: shorts, hair: p.team === 0 ? '#1E242E' : '#4A3222', phase: p.phase, isRef: false, flag: false });
  }
  actors.push({ x: m.referee.x, y: m.referee.y, jersey: '#111827', shorts: '#111827', hair: '#2B2118', phase: 0.5, isRef: true, flag: false });
  actors.push({ x: m.linesmen[0].x, y: m.linesmen[0].y, jersey: '#FACC15', shorts: '#111827', hair: '#2B2118', phase: 1.1, isRef: true, flag: true });
  actors.push({ x: m.linesmen[1].x, y: m.linesmen[1].y, jersey: '#FACC15', shorts: '#111827', hair: '#2B2118', phase: 2.3, isRef: true, flag: true });
  actors.sort(function(a, b) { return a.y - b.y; });
  for (var ai = 0; ai < actors.length; ai++) {
    var ac = actors[ai];
    drawTinyPlayer(c, ac.x, ac.y, ac.jersey, ac.shorts, ac.hair, t, ac.phase, ac.isRef, ac.flag);
  }

  // 6. Quả bóng FIFA trắng-đen + bóng đổ mặt cỏ
  var bx = Math.round(m.ball.x), by = Math.round(m.ball.y), bz = Math.round(m.ball.z);
  R(c, bx - 2, by, 5, 2, 'rgba(15,35,15,0.38)');
  R(c, bx - 2, by - 3 - bz, 4, 4, '#FFFFFF');
  R(c, bx - 1, by - 2 - bz, 2, 2, '#111827');
}
`;
}
