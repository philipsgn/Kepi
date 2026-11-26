/**
 * Đồ họa Pixel Art Cửa Hàng Adidas Flagship Brand Center 2 Tầng (640 × 560 — Quyết định 227)
 * Phong cách: Architectural Minimalist Luxury (Sàn bê tông mài xám sáng, gỗ sồi ấm, thép đen mờ, đèn LED hắt kệ)
 * Tuân thủ 100% docs/VIETNAM_PIXEL_ART_BIBLE.md & tái sử dụng vnPixelArtKit.ts:
 *  - Tầng 2 (y: 0..274): Hero Wall Logo 3 Sọc LED, Tường giày Sneaker & dép Adilette 3 sọc, 4 giá quần áo 3 sọc, 4 Mannequin spotlight, Phòng thử đồ VIP + Gương LED
 *  - Cầu thang kính cường lực LED (x: 266..374, y: 248..312) nối liền Tầng 1 ↔ Tầng 2
 *  - Tầng 1 (y: 280..560): 2 Đảo đá Terrazzo quần áo & dép 3 sọc, 3 Mannequin mặt tiền, Quầy thu ngân Flagship + hộp giày/túi 3 sọc, 2 Nhân viên Adidas & 7 khách hàng
 */
export function buildAdidasInteriorArtScript(): string {
  return `
/* Khuôn mặt người pixel chi tiết chuẩn QĐ 226 (mắt sáng trắng, má hồng, miệng, 4 kiểu tóc) */
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

/* Sàn bê tông mài xám sáng Minimalist Luxury (32×32 ô giãn nở tinh tế) */
function drawPolishedConcreteFloor(c, x0, y0, w, h) {
  R(c, x0, y0, w, h, '#E6E9EE');
  for (var gy = y0; gy < y0 + h; gy += 32) {
    R(c, x0, gy, w, 1, 'rgba(30,36,46,0.07)');
  }
  for (var gx = x0; gx < x0 + w; gx += 32) {
    R(c, gx, y0, 1, h, 'rgba(30,36,46,0.07)');
  }
}

/* Logo 3 Sọc Performance chuẩn tối giản (3 thanh chéo nâng bậc) */
function drawThreeStripesLogo(c, x, y, scale, col) {
  scale = scale || 1;
  R(c, x, y + 6 * scale, 4 * scale, 5 * scale, col);
  R(c, x + 6 * scale, y + 3 * scale, 4 * scale, 8 * scale, col);
  R(c, x + 12 * scale, y, 4 * scale, 11 * scale, col);
}

/* Đôi giày Sneaker 3 sọc chi tiết (Superstar, Samba, Gazelle, Ultraboost) */
function drawMiniSneaker(c, x, y, bodyCol, stripeCol, soleCol) {
  R(c, x, y + 4, 11, 2, soleCol || '#FFFFFF'); // Đế giày
  R(c, x + 1, y + 1, 8, 3, bodyCol);           // Thân giày
  R(c, x + 8, y + 2, 3, 2, bodyCol);           // Mũi giày
  // 3 sọc mini đặc trưng trên thân giày
  R(c, x + 3, y + 2, 1, 2, stripeCol);
  R(c, x + 5, y + 2, 1, 2, stripeCol);
  R(c, x + 7, y + 2, 1, 2, stripeCol);
}

/* Đôi dép Adilette 3 sọc đặc trưng Adidas */
function drawAdiletteSlide(c, x, y, baseCol, stripeCol) {
  R(c, x, y + 3, 9, 3, baseCol);               // Đế dép
  R(c, x + 2, y + 1, 5, 3, baseCol);           // Quai ngang
  R(c, x + 3, y + 1, 1, 3, stripeCol);         // 3 sọc trên quai dép
  R(c, x + 5, y + 1, 1, 3, stripeCol);
}

/* Tường Giày Sneaker & Dép Adilette 3 Sọc có dải LED hắt từng ngăn */
function drawFootwearWall(c, wx, wy, ww, wh, mode) {
  R(c, wx, wy, ww, wh, '#181B22');             // Khung thép đen mờ
  R(c, wx + 2, wy + 2, ww - 4, wh - 4, '#D4B48C'); // Hậu gỗ sồi ấm
  var rows = 3;
  var rowH = Math.floor((wh - 6) / rows);
  var shoes = [
    ['#FFFFFF', '#181B22', '#F8FAFC'], // Superstar trắng 3 sọc đen
    ['#181B22', '#FFFFFF', '#B47B44'], // Samba đen 3 sọc trắng đế gum
    ['#DC2626', '#FFFFFF', '#FFFDF7'], // Gazelle đỏ 3 sọc trắng
    ['#2563EB', '#FFFFFF', '#F8FAFC'], // Originals xanh cobalt
    ['#E5DFD3', '#181B22', '#D4A373'], // Campus kem tối giản
    ['#16A34A', '#FFFFFF', '#F8FAFC']  // Gazelle xanh lá
  ];
  var slides = [
    ['#181B22', '#FFFFFF'],
    ['#1E3A8A', '#FFFFFF'],
    ['#F5F0E6', '#181B22'],
    ['#DC2626', '#FFFFFF']
  ];
  for (var r = 0; r < rows; r++) {
    var sy = wy + 4 + r * rowH;
    // Dải LED trắng ấm hắt sáng bên trên từng ngăn kệ
    R(c, wx + 3, sy, ww - 6, 1, '#FFF9E6');
    // Thanh kệ gỗ đen
    R(c, wx + 3, sy + rowH - 3, ww - 6, 2, '#181B22');
    for (var sx = wx + 6; sx < wx + ww - 14; sx += 15) {
      if (mode === 'slides' || r === 2) {
        var sl = slides[(r + sx) % slides.length];
        drawAdiletteSlide(c, sx, sy + rowH - 9, sl[0], sl[1]);
      } else {
        var sh = shoes[(r * 3 + Math.floor(sx / 15)) % shoes.length];
        drawMiniSneaker(c, sx, sy + rowH - 9, sh[0], sh[1], sh[2]);
      }
    }
  }
}

/* Giá treo quần & áo 3 sọc thép đen tối giản */
function drawClothingRack(c, rx, ry, rw, kind) {
  R(c, rx + 2, ry + 26, rw - 4, 4, 'rgba(24,27,34,0.18)'); // Bóng sàn
  // Khung thép đen mờ
  R(c, rx, ry, rw, 3, '#181B22');
  R(c, rx, ry, 2, 26, '#181B22');
  R(c, rx + rw - 2, ry, 2, 26, '#181B22');
  R(c, rx + 2, ry + 24, rw - 4, 2, '#475569');
  var cols = kind === 'pants'
    ? ['#181B22', '#1E3A8A', '#334155', '#181B22', '#475569']
    : ['#181B22', '#DC2626', '#FFFFFF', '#2563EB', '#E5DFD3', '#16A34A'];
  var idx = 0;
  for (var ix = rx + 5; ix < rx + rw - 11; ix += 11) {
    var col = cols[idx % cols.length];
    var stripe = (col === '#FFFFFF' || col === '#E5DFD3') ? '#181B22' : '#FFFFFF';
    idx++;
    if (kind === 'pants') {
      // Quần Jogger / Short thể thao 3 sọc dọc ống quần
      R(c, ix, ry + 4, 8, 17, '#181B22');
      R(c, ix + 1, ry + 5, 6, 15, col);
      R(c, ix + 4, ry + 11, 1, 9, '#E6E9EE'); // Khe giữa 2 ống quần
      R(c, ix + 1, ry + 6, 1, 13, stripe);    // Sọc 3 sọc chạy dọc ống
      R(c, ix + 6, ry + 6, 1, 13, stripe);
    } else {
      // Áo khoác SST Track Jacket / Hoodie 3 sọc
      R(c, ix, ry + 4, 9, 15, '#181B22');
      R(c, ix + 1, ry + 5, 7, 13, col);
      R(c, ix + 2, ry + 5, 1, 12, stripe);    // 3 sọc dọc tay/thân áo
      R(c, ix + 4, ry + 5, 1, 12, stripe);
      R(c, ix + 6, ry + 5, 1, 12, stripe);
    }
  }
}

/* Mannequin đứng bục đá Terrazzo mặc full outfit 3 sọc sang trọng */
function drawMannequin(c, mx, my, topCol, botCol, stripeCol, shoeCol) {
  // Bục đá Terrazzo tròn/vuông tối giản có viền đen
  R(c, mx - 11, my + 2, 22, 9, 'rgba(24,27,34,0.20)');
  R(c, mx - 10, my, 20, 8, '#181B22');
  R(c, mx - 9, my + 1, 18, 6, '#F1F5F9');
  R(c, mx - 9, my + 1, 18, 2, '#FFFFFF');
  // Đôi giày Sneaker 3 sọc dưới chân mannequin
  R(c, mx - 5, my - 2, 4, 3, shoeCol); R(c, mx + 1, my - 2, 4, 3, shoeCol);
  // Quần Jogger 3 sọc
  R(c, mx - 5, my - 11, 4, 9, '#181B22'); R(c, mx - 4, my - 10, 3, 8, botCol);
  R(c, mx + 1, my - 11, 4, 9, '#181B22'); R(c, mx + 1, my - 10, 3, 8, botCol);
  R(c, mx - 4, my - 10, 1, 7, stripeCol); R(c, mx + 3, my - 10, 1, 7, stripeCol);
  // Áo khoác / Hoodie 3 sọc
  R(c, mx - 6, my - 22, 12, 12, '#181B22');
  R(c, mx - 5, my - 21, 10, 10, topCol);
  R(c, mx - 5, my - 20, 1, 8, stripeCol); R(c, mx + 4, my - 20, 1, 8, stripeCol);
  // Logo 3 sọc mini trước ngực
  R(c, mx - 2, my - 17, 1, 2, stripeCol); R(c, mx, my - 18, 1, 3, stripeCol); R(c, mx + 2, my - 19, 1, 4, stripeCol);
  // Đầu mannequin trắng nhám Minimalist (không vẽ mặt người thật để phân biệt rõ với khách!)
  R(c, mx - 4, my - 29, 8, 7, '#181B22');
  R(c, mx - 3, my - 28, 6, 5, '#F8FAFC');
  R(c, mx - 2, my - 27, 2, 2, '#E2E8F0');
}

/* Đảo trưng bày đá Terrazzo Tầng 1 (gấp áo thun, quần & dép 3 sọc) */
function drawDisplayIsland(c, ix, iy, iw, ih) {
  R(c, ix + 3, iy + ih - 1, iw - 4, 5, 'rgba(24,27,34,0.18)');
  R(c, ix, iy, iw, ih, '#181B22');
  R(c, ix + 1, iy + 1, iw - 2, ih - 2, '#F1F5F9');
  R(c, ix + 2, iy + 2, iw - 4, 4, '#FFFFFF');
  // Chồng áo thun gấp gọn 3 sọc bên trái đảo
  var stacks = [
    [ix + 8, iy + 8, '#181B22', '#FFFFFF'],
    [ix + 28, iy + 8, '#FFFFFF', '#181B22'],
    [ix + 48, iy + 8, '#DC2626', '#FFFFFF'],
    [ix + 68, iy + 8, '#2563EB', '#FFFFFF']
  ];
  for (var si = 0; si < stacks.length; si++) {
    var st = stacks[si];
    R(c, st[0], st[1], 14, 12, '#181B22');
    R(c, st[0] + 1, st[1] + 1, 12, 10, st[2]);
    R(c, st[0] + 3, st[1] + 3, 2, 6, st[3]);
    R(c, st[0] + 6, st[1] + 3, 2, 6, st[3]);
    R(c, st[0] + 9, st[1] + 3, 2, 6, st[3]);
  }
  // Hàng giày & dép Adilette 3 sọc trưng bày phía dưới đảo
  drawMiniSneaker(c, ix + 10, iy + 25, '#FFFFFF', '#181B22', '#E2E8F0');
  drawMiniSneaker(c, ix + 28, iy + 25, '#181B22', '#FFFFFF', '#B47B44');
  drawAdiletteSlide(c, ix + 48, iy + 25, '#181B22', '#FFFFFF');
  drawAdiletteSlide(c, ix + 64, iy + 25, '#1E3A8A', '#FFFFFF');
}

function drawAdidasStaticBg(c) {
  // ===== TẦNG 2: PERFORMANCE GALLERY & VIP LOUNGE (y: 0..274) =====
  drawPolishedConcreteFloor(c, 14, 58, 612, 214);
  // Tường bao Tầng 2 tối giản trắng xám
  R(c, 0, 0, 640, 58, '#F8FAFC');
  R(c, 0, 0, 640, 5, '#181B22');
  R(c, 0, 56, 640, 2, '#181B22');
  // Tường dọc 2 bên trái/phải xuyên suốt 2 tầng
  R(c, 0, 0, 14, 560, '#CBD5E1'); R(c, 14, 0, 2, 560, '#181B22');
  R(c, 626, 0, 14, 560, '#CBD5E1'); R(c, 624, 0, 2, 560, '#181B22');

  // HERO BRAND WALL TẦNG 2 (x: 214..426, y: 7..54) — Logo 3 Sọc phát sáng sang trọng
  R(c, 214, 7, 212, 47, '#181B22');
  R(c, 216, 9, 208, 43, '#111419');
  R(c, 218, 10, 204, 1, '#FFF9E6'); // Dải LED hắt trần
  drawThreeStripesLogo(c, 250, 18, 2, '#FFFFFF');
  // Chữ pixel "ADIDAS" trắng tinh khiết
  R(c, 298, 24, 96, 4, '#FFFFFF');
  R(c, 306, 33, 80, 2, '#94A3B8'); // Subtitle tối giản "BRAND CENTER"

  // Tường Giày Sneaker & Dép Adilette 3 Sọc hai bên Hero Wall (Tầng 2)
  drawFootwearWall(c, 26, 10, 178, 56, 'sneakers');
  drawFootwearWall(c, 436, 10, 178, 56, 'slides');

  // Phòng Thử Đồ VIP & Gương Toàn Thân Viền LED (Góc trái Tầng 2: x: 24..140, y: 84..168)
  R(c, 24, 84, 112, 76, '#181B22');
  R(c, 26, 86, 108, 72, '#E2E8F0');
  R(c, 26, 86, 46, 72, '#475569'); // Rèm phòng thử đồ xám sang trọng
  for (var rx = 32; rx < 70; rx += 8) R(c, rx, 86, 2, 72, '#334155');
  // Gương toàn thân viền LED phát sáng
  R(c, 84, 92, 36, 56, '#181B22');
  R(c, 85, 93, 34, 54, '#FFFDF5'); // Viền đèn LED gương
  R(c, 87, 95, 30, 50, '#BAE6FD'); // Mặt gương phản chiếu
  linePx(c, 91, 104, 105, 98, '#FFFFFF');
  linePx(c, 92, 122, 112, 112, '#FFFFFF');
  // Ghế băng da đen thử giày trước gương
  R(c, 146, 134, 46, 16, '#181B22'); R(c, 148, 136, 42, 12, '#27272A');

  // 4 Giá treo quần & áo 3 sọc ở Tầng 2 (nhiều quần & nhiều áo)
  drawClothingRack(c, 210, 86, 98, 'tops');
  drawClothingRack(c, 332, 86, 98, 'pants');
  drawClothingRack(c, 456, 86, 152, 'tops');
  drawClothingRack(c, 456, 150, 152, 'pants');

  // 4 Mannequin Spotlight Tầng 2 (Set Đỏ-Trắng, Đen-Trắng, Xanh Originals, Kem Minimalist)
  drawMannequin(c, 170, 198, '#DC2626', '#181B22', '#FFFFFF', '#FFFFFF');
  drawMannequin(c, 244, 198, '#181B22', '#181B22', '#FFFFFF', '#FFFFFF');
  drawMannequin(c, 396, 198, '#2563EB', '#1E293B', '#FFFFFF', '#F8FAFC');
  drawMannequin(c, 532, 224, '#F5F0E6', '#334155', '#181B22', '#181B22');

  // ===== DẢI PHÂN TẦNG BAN CÔNG KÍNH & CẦU THANG KÍNH LED (y: 266..306) =====
  // Lan can kính cường lực 2 bên cầu thang (chặn AABB để Heo đi đúng qua cầu thang!)
  R(c, 16, 266, 250, 22, '#181B22');
  R(c, 16, 268, 250, 12, '#93C5FD'); // Kính cường lực trong xanh
  R(c, 16, 280, 250, 6, '#334155');  // Dầm sàn thép đen
  R(c, 374, 266, 250, 22, '#181B22');
  R(c, 374, 268, 250, 12, '#93C5FD');
  R(c, 374, 280, 250, 6, '#334155');

  // CẦU THANG KÍNH & BẬC GỖ SỒI HẮT LED NỐI LIỀN TẦNG 1 ↔ TẦNG 2 (x: 266..374, y: 248..314)
  R(c, 266, 248, 108, 66, '#181B22');
  for (var st = 0; st < 8; st++) {
    var sty = 250 + st * 8;
    R(c, 270, sty, 100, 7, '#D4B48C');      // Bậc gỗ sồi ấm
    R(c, 270, sty, 100, 1, '#FFF9E6');      // Đèn LED hắt cạnh bậc cầu thang
    R(c, 270, sty + 6, 100, 1, '#8A5634');  // Bóng gầm bậc
  }
  // Tay vịn kính cường lực 2 bên cầu thang
  R(c, 266, 248, 4, 66, '#38BDF8');
  R(c, 370, 248, 4, 66, '#38BDF8');

  // ===== TẦNG 1: ORIGINALS FLAGSHIP, ĐẢO TRƯNG BÀY & QUẦY CHECKOUT (y: 288..560) =====
  drawPolishedConcreteFloor(c, 14, 288, 612, 256);

  // 2 Đảo Trưng Bày Đá Terrazzo Tầng 1 (Gấp quần áo + giày dép 3 sọc)
  drawDisplayIsland(c, 42, 336, 94, 42);
  drawDisplayIsland(c, 504, 336, 94, 42);

  // Thêm 2 giá quần áo 3 sọc bên hông Tầng 1
  drawClothingRack(c, 160, 338, 86, 'tops');
  drawClothingRack(c, 394, 338, 86, 'pants');

  // 3 Mannequin Mặt Tiền Tầng 1 (rọi spotlight thu hút đại lộ)
  drawMannequin(c, 420, 444, '#181B22', '#181B22', '#FFFFFF', '#FFFFFF');
  drawMannequin(c, 488, 444, '#DC2626', '#FFFFFF', '#181B22', '#181B22');
  drawMannequin(c, 556, 444, '#16A34A', '#181B22', '#FFFFFF', '#FFFFFF');

  // QUẦY THU NGÂN FLAGSHIP MINIMALIST (Góc trái dưới Tầng 1: x: 28..194, y: 448..518)
  R(c, 28, 452, 164, 56, '#181B22');
  R(c, 30, 454, 160, 22, '#F8FAFC');          // Mặt đá trắng tối giản
  R(c, 30, 476, 160, 30, '#181B22');          // Mặt đứng đen mờ sang trọng
  drawThreeStripesLogo(c, 98, 482, 1, '#FFFFFF'); // Logo 3 sọc trắng phát sáng trước quầy
  // Máy POS tối giản + Chồng hộp giày Adidas xanh Originals & đen + Túi giấy trắng 3 sọc
  R(c, 42, 458, 20, 12, '#1E293B'); R(c, 44, 460, 16, 7, '#38BDF8');
  R(c, 134, 456, 18, 12, '#1D4ED8'); R(c, 136, 459, 14, 2, '#FFFFFF'); // Hộp giày xanh Originals
  R(c, 154, 456, 16, 12, '#181B22'); R(c, 156, 459, 12, 2, '#FFFFFF'); // Hộp giày đen
  R(c, 174, 456, 10, 14, '#FFFFFF'); R(c, 177, 460, 1, 6, '#181B22'); R(c, 179, 460, 1, 6, '#181B22'); // Túi giấy 3 sọc

  // Cây Bàng Singapore xanh tối giản 2 góc cửa & góc cầu thang
  var plants = [[224, 496], [414, 496], [244, 240], [394, 240]];
  for (var pli = 0; pli < plants.length; pli++) {
    var pl = plants[pli];
    R(c, pl[0] - 6, pl[1], 12, 12, '#181B22'); R(c, pl[0] - 5, pl[1] + 1, 10, 10, '#F8FAFC');
    E(c, pl[0], pl[1] - 5, 9, 7, '#15803D'); E(c, pl[0] - 2, pl[1] - 7, 5, 4, '#22C55E');
  }

  // CỬA KÍNH TỰ ĐỘNG MẶT TIỀN & LỐI RA ĐẠI LỘ (y: 536..560)
  R(c, 16, 542, 244, 18, '#181B22'); R(c, 18, 544, 240, 12, '#BAE6FD');
  R(c, 380, 542, 244, 18, '#181B22'); R(c, 382, 544, 240, 12, '#BAE6FD');
  // Thảm lối ra cửa kính đen-trắng tối giản (x: 260..380)
  R(c, 260, 532, 120, 28, '#CBD5E1');
  R(c, 274, 538, 92, 16, '#181B22');
  drawThreeStripesLogo(c, 310, 541, 1, '#FFFFFF');
}

/* 2 Nhân viên Adidas mặc áo Polo đen 3 sọc trắng trên vai */
function drawAdidasStaff(c, st, t) {
  var x = Math.round(st.x), y = Math.round(st.y);
  var step = st.moving ? (Math.floor(t * 9 + st.phase) % 2) : 0;
  drawContactShadow(c, x, y + 1, 6, 2.5);
  // Quần thể thao đen 3 sọc trắng
  R(c, x - 3, y - 6 + step, 3, 6, '#181B22');
  R(c, x + 1, y - 6 + (1 - step), 3, 6, '#181B22');
  R(c, x - 3, y - 5, 1, 4, '#FFFFFF'); R(c, x + 3, y - 5, 1, 4, '#FFFFFF');
  // Áo Polo Adidas đen 3 sọc trắng trên vai + bảng tên trắng
  R(c, x - 5, y - 15, 10, 10, '#111419');
  R(c, x - 4, y - 14, 8, 8, '#181B22');
  R(c, x - 4, y - 14, 1, 5, '#FFFFFF'); R(c, x + 3, y - 14, 1, 5, '#FFFFFF');
  R(c, x + 1, y - 11, 2, 2, '#F8FAFC'); // Bảng tên nhân viên
  drawAdidasHumanFace(c, x, y - 20, {
    hair: st.hair,
    hairStyle: st.hairStyle,
    faceDir: st.faceX,
    backView: st.faceY < 0
  });
}

/* Khách hàng mua sắm Adidas (có khách cầm túi giấy trắng 3 sọc!) */
function drawAdidasShopper(c, sh, t) {
  var x = Math.round(sh.x), y = Math.round(sh.y);
  var step = sh.moving ? (Math.floor(t * 8 + sh.phase) % 2) : 0;
  drawContactShadow(c, x, y + 1, 6, 2.5);
  R(c, x - 3, y - 6 + step, 3, 6, '#334155');
  R(c, x + 1, y - 6 + (1 - step), 3, 6, '#334155');
  R(c, x - 5, y - 15, 10, 10, VN_MAT.ink);
  R(c, x - 4, y - 14, 8, 8, sh.shirt);
  drawAdidasHumanFace(c, x, y - 20, {
    hair: sh.hair,
    hairStyle: sh.hairStyle,
    faceDir: sh.faceX,
    backView: sh.faceY < 0
  });
  // Túi giấy Adidas trắng 3 sọc trên tay khách đã mua đồ
  if (sh.hasBag) {
    var bx = sh.faceX >= 0 ? x + 5 : x - 11;
    R(c, bx, y - 9, 7, 8, '#181B22');
    R(c, bx + 1, y - 8, 5, 6, '#FFFFFF');
    R(c, bx + 2, y - 6, 1, 3, '#181B22'); R(c, bx + 4, y - 6, 1, 3, '#181B22');
  }
}

function drawAdidasLiveEntities(c, t, staffList, shoppers, pigState, drawPigFn) {
  // 1. Quầng đèn Spotlight sang trọng rọi nhẹ trên 7 Mannequin & Hero Wall Logo 3 Sọc
  c.save();
  c.globalAlpha = 0.14 + Math.sin(t * 2.2) * 0.03;
  var spots = [
    [170, 190], [244, 190], [396, 190], [532, 216],
    [420, 436], [488, 436], [556, 436]
  ];
  for (var sp = 0; sp < spots.length; sp++) {
    E(c, spots[sp][0], spots[sp][1], 18, 12, '#FFF9E6');
  }
  c.restore();

  // Ánh sáng lấp lánh nhẹ trên Logo 3 Sọc Hero Wall & Gương VIP
  if (Math.sin(t * 4) > 0.4) {
    R(c, 274, 16, 2, 2, '#FFFFFF');
    R(c, 102, 108, 2, 2, '#FFFFFF');
  }

  // 2. Y-Sorting toàn bộ nhân vật (2 Nhân viên Adidas + 7 Khách mua sắm + Chú Heo Mascot 1:1)
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

  // 3. Hiệu ứng lấp lánh ngôi sao khi Chú Heo đứng trước Gương Thử Đồ VIP hoặc ngắm Sneaker Wall
  if (pigState && (pigState.action === 'look_window' || pigState.action === 'jump_joy')) {
    var hx = Math.round(pigState.x), hy = Math.round(pigState.y - 26);
    var pulse = Math.round(Math.sin(t * 7) * 2);
    R(c, hx - 8, hy + pulse, 3, 1, '#F4B93B'); R(c, hx - 7, hy - 1 + pulse, 1, 3, '#F4B93B');
    R(c, hx + 6, hy - pulse, 3, 1, '#38BDF8'); R(c, hx + 7, hy - 1 - pulse, 1, 3, '#38BDF8');
  }
}
`;
}
