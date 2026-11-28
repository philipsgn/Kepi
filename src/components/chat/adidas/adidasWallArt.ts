/**
 * Bộ Sinh Texture Thủ Tục WebGL 3D & Mỹ Thuật Tường Fallback — Adidas Mall Flagship 1 Tầng (Quyết định 255)
 * - Chuẩn Adidas Mall Flagship 1 tầng hiện đại; giữ chất liệu gỗ ấm, terrazzo TTTM, kính & LED 3 Sọc trắng.
 * - 22 Texture Power-of-Two (256×256 / 512×256) sắc nét từng pixel chất liệu vải Piqué Polo, nỉ Jogger,
 *   da lộn/đế gum Samba, quai dép Adilette, áo đấu bóng đá, Maker Lab, Pickleball/Gym, sân turf & lưới gôn.
 * - Đăng ký sẵn 4 bộ trang phục chú Heo 24×20 (adidas_jacket, adidas_polo, adidas_jogger, adidas_kit) gl.NEAREST.
 */
export function buildAdidasWallArtScript(): string {
  return String.raw`
/* ==================== 1. BỘ SINH TEXTURE THỦ TỤC ADIDAS MALL FLAGSHIP (WEBGL 3D) ==================== */
function makeAdidasSeedRng(seed) {
  var s = seed | 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawAdidasTrefoil2D(g, cx, cy, r, col) {
  g.save();
  g.fillStyle = col || '#F4B93B';
  var angles = [-0.58, 0, 0.58];
  for (var i = 0; i < angles.length; i++) {
    g.save();
    g.translate(cx, cy);
    g.rotate(angles[i]);
    g.beginPath();
    g.ellipse(0, -r * 0.48, r * 0.28, r * 0.62, 0, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  g.fillStyle = '#181B22';
  for (var s = -1; s <= 1; s++) {
    g.fillRect(cx - r * 0.58, cy + s * r * 0.13 + r * 0.02, r * 1.16, Math.max(2, r * 0.07));
  }
  g.restore();
}

function drawAdidasPerfLogo2D(g, cx, cy, s, col) {
  g.fillStyle = col || '#FFFBF1';
  g.fillRect(cx - s * 1.3, cy + s * 0.2, s * 0.6, s * 0.8);
  g.fillRect(cx - s * 0.3, cy - s * 0.3, s * 0.6, s * 1.3);
  g.fillRect(cx + s * 0.7, cy - s * 0.9, s * 0.6, s * 1.9);
}

function buildAdidasProceduralTextures(wgl) {
  if (!wgl || typeof document === 'undefined') return;
  function mkCanvas(w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; return c;
  }

  // 1. Tường kem ấm hiện đại nẹp phào TTTM (mallWarmWall)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makeAdidasSeedRng(2551);
    g.fillStyle = '#E6C77D'; g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 200; i++) {
      g.fillStyle = rng() > 0.45 ? 'rgba(255,244,214,0.22)' : 'rgba(186,144,68,0.14)';
      g.beginPath(); g.arc(rng() * 256, rng() * 256, 10 + rng() * 30, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = 'rgba(92,52,29,0.22)';
    g.fillRect(0, 248, 256, 8);
    g.fillRect(0, 0, 256, 6);
    g.fillStyle = 'rgba(255,251,241,0.28)';
    g.fillRect(126, 0, 4, 256);
    wgl.registerTextureCanvas('mallWarmWall', c, true);
  })();

  // 2. Sàn Terrazzo đá mài TTTM xen dải đồng (mallTerrazzoFloor)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makeAdidasSeedRng(2552);
    g.fillStyle = '#E9E0CE'; g.fillRect(0, 0, 256, 256);
    for (var ty = 0; ty < 256; ty += 128) {
      for (var tx = 0; tx < 256; tx += 128) {
        g.fillStyle = ((tx + ty) / 128) % 2 === 0 ? '#EFE7D6' : '#E2D6BF';
        g.fillRect(tx + 2, ty + 2, 124, 124);
        g.strokeStyle = '#B8A582'; g.lineWidth = 2; g.strokeRect(tx + 2, ty + 2, 124, 124);
        // Vân đá terrazzo chi tiết
        var chips = ['#9C8A67', '#5C341D', '#334155', '#FFFBF1', '#C89B3C'];
        for (var k = 0; k < 28; k++) {
          g.fillStyle = chips[Math.floor(rng() * chips.length)];
          g.fillRect(tx + 6 + rng() * 112, ty + 6 + rng() * 112, 2 + rng() * 4, 2 + rng() * 4);
        }
      }
    }
    wgl.registerTextureCanvas('mallTerrazzoFloor', c, true);
  })();

  // 3. Gỗ sồi/lim ấm nhiều thớ cho bục trưng bày & quầy (limWood)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makeAdidasSeedRng(2553);
    g.fillStyle = '#74482A'; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 256; y += 3) {
      g.fillStyle = (y % 6 === 0) ? 'rgba(43,24,14,0.30)' : 'rgba(166,112,68,0.22)';
      g.fillRect(0, y, 256, 2);
    }
    for (var p = 0; p < 256; p += 64) {
      g.fillStyle = 'rgba(28,14,8,0.40)'; g.fillRect(0, p, 256, 2);
    }
    for (var m = 0; m < 10; m++) {
      g.strokeStyle = 'rgba(35,18,8,0.22)'; g.beginPath();
      g.ellipse(rng() * 256, rng() * 256, 18, 4, 0, 0, Math.PI * 2); g.stroke();
    }
    wgl.registerTextureCanvas('limWood', c, true);
  })();

  // 4. Bảng Hero ADIDAS ORIGINALS · MALL FLAGSHIP (trefoilOriginSign)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#141820'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 8; g.strokeRect(10, 10, 492, 236);
    g.strokeStyle = '#FFFBF1'; g.lineWidth = 2; g.strokeRect(20, 20, 472, 216);
    drawAdidasTrefoil2D(g, 256, 84, 48, '#F4B93B');
    g.fillStyle = '#FFFBF1'; g.font = 'bold 38px sans-serif'; g.textAlign = 'center';
    g.fillText('ADIDAS ORIGINALS', 256, 168);
    g.fillStyle = '#FDE047'; g.font = 'bold 22px monospace';
    g.fillText('· MALL FLAGSHIP STORE ·', 256, 210);
    wgl.registerTextureCanvas('trefoilOriginSign', c, false);
  })();

  // 5. Tranh VIỆT NAM × 3 SỌC · FLAGSHIP EDITION (vnLotusStripeArt)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#182F32'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 8; g.strokeRect(8, 8, 496, 240);
    g.fillStyle = 'rgba(244,185,59,0.28)';
    for (var st = -1; st <= 1; st++) {
      g.beginPath();
      g.moveTo(210 + st * 46, 244); g.lineTo(240 + st * 46, 244);
      g.lineTo(350 + st * 46, 12);  g.lineTo(320 + st * 46, 12);
      g.closePath(); g.fill();
    }
    g.fillStyle = '#E8C574'; g.strokeStyle = '#78350F'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(124, 62); g.lineTo(54, 158); g.lineTo(194, 158); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#DC2626'; g.fillRect(102, 114, 44, 12);
    g.fillStyle = '#FFFBF1';
    g.fillRect(110, 116, 6, 8); g.fillRect(121, 116, 6, 8); g.fillRect(132, 116, 6, 8);
    g.fillStyle = '#15803D'; g.beginPath(); g.ellipse(340, 184, 72, 20, 0, 0, Math.PI * 2); g.fill();
    var petals = [[-44, 10, -0.5], [44, 10, 0.5], [-24, -6, -0.25], [24, -6, 0.25], [0, -18, 0]];
    for (var pi = 0; pi < petals.length; pi++) {
      g.save(); g.translate(340 + petals[pi][0], 138 + petals[pi][1]); g.rotate(petals[pi][2]);
      g.fillStyle = pi === 4 ? '#FB7185' : '#F43F5E';
      g.beginPath(); g.ellipse(0, 0, 22, 46, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    g.fillStyle = '#FDE047'; g.beginPath(); g.arc(340, 146, 14, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FFFBF1'; g.font = 'bold 22px serif'; g.textAlign = 'center';
    g.fillText('VIỆT NAM × 3 SỌC · FLAGSHIP', 256, 228);
    wgl.registerTextureCanvas('vnLotusStripeArt', c, false);
  })();

  // 6. Kệ Sneaker Wall LED 12 ô chi tiết da lộn, mũi sò & 3 sọc (shoeDisplayBoard)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#1A1412'; g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#FDE047'; g.font = 'bold 21px monospace'; g.textAlign = 'center';
    g.fillText('FOOTWEAR LIBRARY · ORIGINALS', 256, 32);
    var sh = [
      { n: 'SAMBA OG',  b: '#FFFBF1', st: '#111827', so: '#B45309', toe: '#D6D3D1' },
      { n: 'SUPERSTAR', b: '#FFFFFF', st: '#0F172A', so: '#CBD5E1', toe: '#F1F5F9' },
      { n: 'GAZELLE',   b: '#DC2626', st: '#FFFBF1', so: '#F8FAFC', toe: '#B91C1C' },
      { n: 'PREDATOR',  b: '#0F172A', st: '#F97316', so: '#1E293B', toe: '#F97316' }
    ];
    for (var i = 0; i < 4; i++) {
      var bx = 18 + i * 121;
      g.fillStyle = '#2B2118'; g.fillRect(bx, 48, 113, 196);
      g.strokeStyle = '#F4B93B'; g.lineWidth = 3; g.strokeRect(bx, 48, 113, 196);
      g.fillStyle = '#FFF7DF'; g.fillRect(bx + 7, 56, 99, 146);
      g.fillStyle = '#E2E8F0'; g.fillRect(bx + 10, 58, 93, 4); // Dải đèn LED hắt tủ
      g.fillStyle = '#6B4226'; g.fillRect(bx + 7, 126, 99, 8);
      for (var row = 0; row < 2; row++) {
        var sx = bx + 56, sy = 96 + row * 72;
        g.fillStyle = sh[i].so; g.fillRect(sx - 36, sy + 6, 72, 11);
        g.fillStyle = sh[i].b;  g.fillRect(sx - 32, sy - 14, 52, 21);
        g.fillStyle = sh[i].toe; g.fillRect(sx + 18, sy - 5, 16, 12);
        // Dây giày chi tiết
        g.fillStyle = '#FFFBF1';
        g.fillRect(sx - 4, sy - 16, 18, 3);
        g.fillStyle = sh[i].st;
        for (var k = 0; k < 3; k++) g.fillRect(sx - 16 + k * 9, sy - 12, 5, 17);
        g.strokeStyle = '#1E1B18'; g.lineWidth = 2; g.strokeRect(sx - 36, sy - 14, 72, 31);
      }
      g.fillStyle = '#FDE047'; g.font = 'bold 14px monospace';
      g.fillText(sh[i].n, bx + 56, 227);
    }
    wgl.registerTextureCanvas('shoeDisplayBoard', c, false);
  })();

  // 7. Quầy Áo Polo Cổ Bẻ 3 Sọc dệt Piqué chi tiết từng pixel (poloDisplayTex)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#2B180E'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 5; g.strokeRect(6, 6, 500, 244);
    g.fillStyle = '#FFF7DF'; g.fillRect(14, 48, 484, 194);
    g.fillStyle = '#FDE047'; g.font = 'bold 21px monospace'; g.textAlign = 'center';
    g.fillText('POLO & TEES · PIQUÉ 3 SỌC', 256, 34);
    var polos = [
      { body: '#1E3A8A', collar: '#FFFBF1', stripe: '#60A5FA', label: 'POLO NAVY' },
      { body: '#F8FAFC', collar: '#0F172A', stripe: '#111827', label: 'POLO CREAM' },
      { body: '#991B1B', collar: '#FFFBF1', stripe: '#FACC15', label: 'POLO RUBY' },
      { body: '#14532D', collar: '#FFFBF1', stripe: '#86EFAC', label: 'POLO PINE' }
    ];
    for (var i = 0; i < 4; i++) {
      var px = 76 + i * 120, py = 74;
      // Móc gỗ
      g.strokeStyle = '#78350F'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(px - 34, py + 12); g.lineTo(px, py - 4); g.lineTo(px + 34, py + 12); g.stroke();
      // Vai & tay áo Polo
      g.fillStyle = polos[i].body;
      g.fillRect(px - 44, py + 12, 88, 32);
      g.fillRect(px - 28, py + 12, 56, 110);
      // Vân dệt piqué mắt chim
      g.fillStyle = 'rgba(255,255,255,0.12)';
      for (var wy = py + 24; wy < py + 116; wy += 6) {
        for (var wx = px - 24; wx < px + 24; wx += 6) g.fillRect(wx, wy, 2, 2);
      }
      // Cổ bẻ Polo & nẹp cúc 2 khuy
      g.fillStyle = polos[i].collar;
      g.fillRect(px - 16, py + 8, 32, 12);
      g.fillRect(px - 4, py + 18, 8, 28);
      g.fillStyle = '#CBD5E1'; g.fillRect(px - 1, py + 25, 2, 3); g.fillRect(px - 1, py + 36, 2, 3);
      // 3 Sọc vai & gấu tay
      g.fillStyle = polos[i].stripe;
      for (var s = 0; s < 3; s++) {
        g.fillRect(px - 40 + s * 6, py + 14, 3, 26);
        g.fillRect(px + 25 + s * 6, py + 14, 3, 26);
      }
      g.strokeStyle = '#1E1B18'; g.lineWidth = 2; g.strokeRect(px - 28, py + 12, 56, 110);
      g.fillStyle = '#2B180E'; g.font = 'bold 13px monospace';
      g.fillText(polos[i].label, px, 224);
    }
    wgl.registerTextureCanvas('poloDisplayTex', c, false);
  })();

  // 8. Giá Quần Jogger & Track Pants nỉ 3 sọc dọc chân thực từng pixel (joggerRackTex)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#1E242B'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 5; g.strokeRect(6, 6, 500, 244);
    g.fillStyle = '#FDE047'; g.font = 'bold 21px monospace'; g.textAlign = 'center';
    g.fillText('JOGGERS & TRACK PANTS · NỈ 3 SỌC', 256, 34);
    var pants = [
      { col: '#111827', st: '#FFFBF1', name: 'FIREBIRD BLK' },
      { col: '#475569', st: '#F8FAFC', name: 'FLEECE GREY' },
      { col: '#14532D', st: '#FDE047', name: 'OLIVE TRACK' },
      { col: '#1E3A8A', st: '#FFFBF1', name: 'NAVY JOGGER' }
    ];
    for (var i = 0; i < 4; i++) {
      var x = 76 + i * 120, y = 62;
      g.fillStyle = '#334155'; g.fillRect(x - 42, y - 4, 84, 152);
      g.fillStyle = pants[i].col;
      // Cạp chun + dây rút trắng
      g.fillRect(x - 28, y + 8, 56, 28);
      // Hai ống quần Jogger + gấu bo
      g.fillRect(x - 28, y + 36, 24, 90);
      g.fillRect(x + 4, y + 36, 24, 90);
      g.fillStyle = '#FFFBF1'; // Dây rút
      g.fillRect(x - 4, y + 16, 2, 16); g.fillRect(x + 2, y + 16, 2, 16);
      // 3 sọc dọc bên hông mỗi ống quần
      g.fillStyle = pants[i].st;
      for (var s = 0; s < 3; s++) {
        g.fillRect(x - 27 + s * 3, y + 12, 2, 110);
        g.fillRect(x + 20 + s * 3, y + 12, 2, 110);
      }
      // Bo thun gấu quần Jogger
      g.fillStyle = '#0F172A';
      g.fillRect(x - 26, y + 122, 20, 8); g.fillRect(x + 6, y + 122, 20, 8);
      g.fillStyle = '#F8FAFC'; g.font = 'bold 12px monospace';
      g.fillText(pants[i].name, x, 232);
    }
    wgl.registerTextureCanvas('joggerRackTex', c, false);
  })();

  // 9. Kệ Dép Adilette Slides quai sọc nổi (slidesBoardTex)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#1F2937'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#60A5FA'; g.lineWidth = 5; g.strokeRect(6, 6, 500, 244);
    g.fillStyle = '#F8FAFC'; g.font = 'bold 21px monospace'; g.textAlign = 'center';
    g.fillText('ADILETTE SLIDES · SANDALS', 256, 34);
    var slides = [
      { sole: '#0F172A', strap: '#1E293B', st: '#FFFBF1', n: 'ADILETTE OG' },
      { sole: '#1D4ED8', strap: '#2563EB', st: '#FFFBF1', n: 'AQUA COBALT' },
      { sole: '#D6C4A1', strap: '#78350F', st: '#FFF5D6', n: 'SAND COMFORT' }
    ];
    for (var i = 0; i < 3; i++) {
      var bx = 26 + i * 160;
      g.fillStyle = '#FFF7DF'; g.fillRect(bx, 52, 144, 152);
      g.strokeStyle = '#2B180E'; g.lineWidth = 2; g.strokeRect(bx, 52, 144, 152);
      for (var p = 0; p < 2; p++) {
        var sx = bx + 42 + p * 60, sy = 128;
        g.fillStyle = slides[i].sole; g.fillRect(sx - 18, sy - 54, 36, 108);
        g.fillStyle = slides[i].strap; g.fillRect(sx - 20, sy - 24, 40, 40);
        g.fillStyle = slides[i].st;
        for (var k = 0; k < 3; k++) g.fillRect(sx - 14 + k * 10, sy - 22, 6, 36);
        g.strokeStyle = '#1E1B18'; g.lineWidth = 2; g.strokeRect(sx - 18, sy - 54, 36, 108);
      }
      g.fillStyle = '#FDE047'; g.font = 'bold 14px monospace';
      g.fillText(slides[i].n, bx + 72, 232);
    }
    wgl.registerTextureCanvas('slidesBoardTex', c, false);
  })();

  // 10. Kệ Áo Đấu Bóng Đá, Tất & Bóng (footballGearTex)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#142E22'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 6; g.strokeRect(6, 6, 500, 244);
    g.fillStyle = '#FFF5D6'; g.fillRect(14, 48, 484, 194);
    g.fillStyle = '#FDE047'; g.font = 'bold 21px monospace'; g.textAlign = 'center';
    g.fillText('FOOTBALL KITS · TẤT & BÓNG THI ĐẤU', 256, 34);
    var kits = [['#DC2626', '#FACC15'], ['#FFFBF1', '#1D4ED8'], ['#0F766E', '#FFFBF1'], ['#111827', '#F97316']];
    for (var ji = 0; ji < 4; ji++) {
      var jx = 76 + ji * 120, jy = 76;
      g.fillStyle = kits[ji][0];
      g.fillRect(jx - 38, jy, 76, 24); g.fillRect(jx - 24, jy, 48, 86);
      g.strokeStyle = '#1E1B18'; g.lineWidth = 2; g.strokeRect(jx - 24, jy, 48, 86);
      g.fillStyle = kits[ji][1];
      for (var s = 0; s < 3; s++) {
        g.fillRect(jx - 34 + s * 5, jy + 2, 3, 20);
        g.fillRect(jx + 22 + s * 5, jy + 2, 3, 20);
      }
      g.font = 'bold 24px monospace'; g.fillText('10', jx, jy + 62);
      // Tất bóng đá bên dưới
      g.fillStyle = kits[ji][0]; g.fillRect(jx - 16, 178, 12, 42); g.fillRect(jx + 4, 178, 12, 42);
      g.fillStyle = kits[ji][1]; g.fillRect(jx - 16, 184, 12, 6); g.fillRect(jx + 4, 184, 12, 6);
    }
    wgl.registerTextureCanvas('footballGearTex', c, false);
  })();

  // 11. Kệ Running / Gym / Pickleball (gymPickleTex)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#17253B'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#38BDF8'; g.lineWidth = 5; g.strokeRect(6, 6, 500, 244);
    g.fillStyle = '#E0F2FE'; g.font = 'bold 20px monospace'; g.textAlign = 'center';
    g.fillText('RUNNING · GYM · PICKLEBALL STUDIO', 256, 34);
    g.fillStyle = '#F8FAFC'; g.fillRect(16, 50, 480, 190);
    // 2 Vợt Pickleball Carbon 3 sọc
    for (var p = 0; p < 2; p++) {
      var px = 96 + p * 105;
      g.fillStyle = p === 0 ? '#0F172A' : '#1E3A8A'; g.fillRect(px - 28, 72, 56, 84);
      g.fillStyle = '#38BDF8';
      for (var s = 0; s < 3; s++) g.fillRect(px - 14 + s * 11, 84, 6, 58);
      g.fillStyle = '#F4B93B'; g.fillRect(px - 7, 156, 14, 38);
    }
    // Áo Tank Gym & Quần Short chạy bộ
    g.fillStyle = '#0F172A'; g.fillRect(306, 72, 56, 86);
    g.fillStyle = '#FFFBF1'; g.fillRect(320, 72, 28, 22);
    g.fillStyle = '#EF4444'; g.fillRect(390, 74, 72, 46); // Thảm & bình nước
    g.fillStyle = '#111827'; g.fillRect(408, 134, 36, 70);
    g.fillStyle = '#0F172A'; g.font = 'bold 13px monospace';
    g.fillText('PRO PADDLE · SINGLET · HYDRATION', 256, 224);
    wgl.registerTextureCanvas('gymPickleTex', c, false);
  })();

  // 12. Maker Lab Custom Studio (makerLabTex)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#111827'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#F97316'; g.lineWidth = 6; g.strokeRect(6, 6, 500, 244);
    g.fillStyle = '#FDBA74'; g.font = 'bold 22px monospace'; g.textAlign = 'center';
    g.fillText('MAKER LAB · IN ÁO & CUSTOM GIÀY', 256, 36);
    var badges = ['07', '10', '23', 'VN'];
    for (var i = 0; i < 4; i++) {
      var bx = 30 + i * 116;
      g.fillStyle = '#1E293B'; g.fillRect(bx, 62, 98, 116);
      g.strokeStyle = '#F4B93B'; g.lineWidth = 3; g.strokeRect(bx, 62, 98, 116);
      g.fillStyle = '#FFFBF1'; g.font = 'bold 34px monospace';
      g.fillText(badges[i], bx + 49, 132);
    }
    g.fillStyle = '#FDE047'; g.font = 'bold 15px monospace';
    g.fillText('HEAT PRESS · PATCHES · LACES · SPRAY', 256, 220);
    wgl.registerTextureCanvas('makerLabTex', c, false);
  })();

  // 13. Quầy Balo, Túi Trống, Nón & Vớ Trefoil (accessoriesWallTex)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#2B180E'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 5; g.strokeRect(6, 6, 500, 244);
    g.fillStyle = '#FFF5D6'; g.fillRect(14, 48, 484, 194);
    g.fillStyle = '#FDE047'; g.font = 'bold 20px monospace'; g.textAlign = 'center';
    g.fillText('BACKPACKS · CAPS · TREFOIL SOCKS', 256, 34);
    // 4 Balo & Nón
    for (var i = 0; i < 4; i++) {
      var x = 76 + i * 120;
      g.fillStyle = ['#111827', '#1D4ED8', '#991B1B', '#065F46'][i];
      g.fillRect(x - 28, 108, 56, 80); // Balo
      g.fillStyle = '#FFFBF1';
      g.fillRect(x - 16, 128, 32, 6); g.fillRect(x - 16, 140, 32, 6); g.fillRect(x - 16, 152, 32, 6);
      // Nón Cap trên kệ
      g.fillStyle = ['#0F172A', '#FFFBF1', '#DC2626', '#1E3A8A'][i];
      g.fillRect(x - 22, 64, 44, 24);
      g.fillStyle = '#334155'; g.fillRect(x - 26, 86, 52, 7);
    }
    wgl.registerTextureCanvas('accessoriesWallTex', c, false);
  })();

  // 14. Tường 3 sọc & Rèm nhung & Tường phòng thử đồ (threeStripesWall, velvetCurtain, fittingGreenWall)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#18241C'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 6; g.strokeRect(8, 8, 240, 240);
    g.fillStyle = '#FFFBF1';
    for (var s = -1; s <= 1; s++) g.fillRect(128 + s * 36 - 10, 28, 20, 200);
    g.fillStyle = '#F4B93B'; g.fillRect(28, 204, 200, 8);
    wgl.registerTextureCanvas('threeStripesWall', c, false);

    var vc = mkCanvas(256, 256), vg = vc.getContext('2d');
    vg.fillStyle = '#7F1D1D'; vg.fillRect(0, 0, 256, 256);
    for (var f = 0; f < 8; f++) {
      vg.fillStyle = f % 2 === 0 ? '#991B1B' : '#5F1111';
      vg.fillRect(f * 32, 0, 32, 256);
      vg.fillStyle = 'rgba(255,200,200,0.08)';
      vg.fillRect(f * 32 + 6, 0, 6, 256);
    }
    vg.fillStyle = '#F4B93B'; vg.fillRect(0, 148, 256, 12);
    wgl.registerTextureCanvas('velvetCurtain', vc, false);

    var fg = mkCanvas(256, 256), gg = fg.getContext('2d'), rng = makeAdidasSeedRng(2559);
    gg.fillStyle = '#243C2B'; gg.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 160; i++) {
      gg.fillStyle = rng() > 0.5 ? 'rgba(54,88,63,0.18)' : 'rgba(24,40,28,0.20)';
      gg.beginPath(); gg.arc(rng() * 256, rng() * 256, 8 + rng() * 26, 0, Math.PI * 2); gg.fill();
    }
    gg.strokeStyle = '#C89B3C'; gg.lineWidth = 4; gg.strokeRect(2, 2, 252, 252);
    wgl.registerTextureCanvas('fittingGreenWall', fg, true);
  })();

  // 15. Quầy Thu Ngân POS & Checkout Phụ Kiện (posShelfTex)
  (function() {
    var p = mkCanvas(512, 256), pg = p.getContext('2d');
    pg.fillStyle = '#261810'; pg.fillRect(0, 0, 512, 256);
    pg.strokeStyle = '#F4B93B'; pg.lineWidth = 6; pg.strokeRect(6, 6, 500, 244);
    pg.fillStyle = '#FDE047'; pg.font = 'bold 21px monospace'; pg.textAlign = 'center';
    pg.fillText('QUẦY THU NGÂN POS · CHECKOUT', 256, 34);
    var cols = ['#1D4ED8', '#2563EB', '#EA580C', '#0F172A', '#1E40AF'];
    for (var r = 0; r < 3; r++) {
      var ry = 56 + r * 62;
      pg.fillStyle = '#18100A'; pg.fillRect(24, ry + 36, 464, 10);
      for (var col = 0; col < 5; col++) {
        var px = 34 + col * 90;
        pg.fillStyle = cols[(r + col) % cols.length]; pg.fillRect(px, ry, 76, 34);
        pg.fillStyle = '#FFFBF1'; pg.fillRect(px + 12, ry + 11, 52, 8);
      }
    }
    wgl.registerTextureCanvas('posShelfTex', p, false);
  })();

  // 16. Sân Turf Bóng Đá 2 tông màu + Chấm 11m + Vạch Vôi (turfPitchTex) & Lưới Gôn (goalNetTex) & Bảng LED Gôn (scoreboardLedTex)
  (function() {
    var tf = mkCanvas(512, 512), tg = tf.getContext('2d');
    for (var strip = 0; strip < 8; strip++) {
      tg.fillStyle = strip % 2 === 0 ? '#15803D' : '#166534';
      tg.fillRect(0, strip * 64, 512, 64);
    }
    tg.strokeStyle = '#FFFBF1'; tg.lineWidth = 10;
    tg.strokeRect(18, 18, 476, 476);
    // Vòng cấm địa trước khung thành (phía top canvas -> Z lớn)
    tg.strokeRect(104, 18, 304, 170);
    // Chấm đá phạt đền 11m
    tg.fillStyle = '#FFFBF1';
    tg.beginPath(); tg.arc(256, 260, 14, 0, Math.PI * 2); tg.fill();
    tg.strokeStyle = 'rgba(255,251,241,0.75)'; tg.lineWidth = 6;
    tg.beginPath(); tg.arc(256, 260, 42, 0, Math.PI * 2); tg.stroke();
    wgl.registerTextureCanvas('turfPitchTex', tf, false);

    var nt = mkCanvas(256, 256), ng = nt.getContext('2d');
    ng.clearRect(0, 0, 256, 256);
    ng.fillStyle = 'rgba(248,250,252,0.14)'; ng.fillRect(0, 0, 256, 256);
    ng.strokeStyle = 'rgba(255,255,255,0.82)'; ng.lineWidth = 3;
    for (var gx = 0; gx <= 256; gx += 24) {
      ng.beginPath(); ng.moveTo(gx, 0); ng.lineTo(gx, 256); ng.stroke();
    }
    for (var gy = 0; gy <= 256; gy += 24) {
      ng.beginPath(); ng.moveTo(0, gy); ng.lineTo(256, gy); ng.stroke();
    }
    wgl.registerTextureCanvas('goalNetTex', nt, false, true);

    var sb = mkCanvas(512, 256), sg = sb.getContext('2d');
    sg.fillStyle = '#0B1220'; sg.fillRect(0, 0, 512, 256);
    sg.strokeStyle = '#22C55E'; sg.lineWidth = 8; sg.strokeRect(8, 8, 496, 240);
    drawAdidasPerfLogo2D(sg, 84, 128, 30, '#FFFBF1');
    sg.fillStyle = '#4ADE80'; sg.font = 'bold 34px monospace'; sg.textAlign = 'center';
    sg.fillText('FOOTBALL KICK ZONE', 286, 108);
    sg.fillStyle = '#FACC15'; sg.font = 'bold 24px monospace';
    sg.fillText('CHẠM GÓC GÔN ĐỂ SÚT!', 286, 168);
    wgl.registerTextureCanvas('scoreboardLedTex', sb, false);
  })();

  // 17. Mặt kính gương & Cửa gỗ-kính mặt tiền (mirrorGlass, vnDoorWood)
  (function() {
    var m = mkCanvas(256, 256), mg = m.getContext('2d');
    mg.fillStyle = '#CBE7F5'; mg.fillRect(0, 0, 256, 256);
    mg.fillStyle = '#DCEFF8'; mg.fillRect(10, 10, 236, 165);
    mg.fillStyle = '#B89A74'; mg.fillRect(10, 175, 236, 71);
    mg.fillStyle = 'rgba(255,255,255,0.44)';
    mg.beginPath(); mg.moveTo(24, 30); mg.lineTo(86, 12); mg.lineTo(222, 188); mg.lineTo(156, 212); mg.closePath(); mg.fill();
    mg.strokeStyle = '#5C341D'; mg.lineWidth = 14; mg.strokeRect(7, 7, 242, 242);
    mg.strokeStyle = '#F4B93B'; mg.lineWidth = 3; mg.strokeRect(14, 14, 228, 228);
    wgl.registerTextureCanvas('mirrorGlass', m, false);

    var d = mkCanvas(256, 256), dg = d.getContext('2d');
    dg.fillStyle = '#5C341D'; dg.fillRect(0, 0, 256, 256);
    dg.fillStyle = '#FFFDF0'; dg.fillRect(22, 20, 96, 134); dg.fillRect(138, 20, 96, 134);
    dg.strokeStyle = '#2B180E'; dg.lineWidth = 6;
    dg.strokeRect(22, 20, 96, 134); dg.strokeRect(138, 20, 96, 134);
    dg.fillStyle = '#4A2C1A'; dg.fillRect(22, 166, 96, 70); dg.fillRect(138, 166, 96, 70);
    dg.fillStyle = '#F4B93B'; dg.beginPath(); dg.arc(118, 152, 7, 0, Math.PI * 2); dg.arc(138, 152, 7, 0, Math.PI * 2); dg.fill();
    wgl.registerTextureCanvas('vnDoorWood', d, false);
  })();

  // 17b. Khu SALE -50%, Kính Cửa Sổ Tầng 1-2, Lan Can Vòm, Mái Ngói, Hoa Giấy, Phố & Bầu Trời 3 Thời Điểm (QĐ 256)
  (function() {
    // Biển SALE -50% Đỏ-Vàng nổi bật
    var sb = mkCanvas(512, 256), sbg = sb.getContext('2d');
    sbg.fillStyle = '#991B1B'; sbg.fillRect(0, 0, 512, 256);
    sbg.strokeStyle = '#FACC15'; sbg.lineWidth = 10; sbg.strokeRect(8, 8, 496, 240);
    sbg.fillStyle = '#111827'; sbg.fillRect(22, 22, 468, 72);
    sbg.fillStyle = '#FDE047'; sbg.font = 'bold 40px monospace'; sbg.textAlign = 'center';
    sbg.fillText('MEGA SALE -50%', 256, 72);
    var tags = [
      { x: 96,  p: '-30%', item: 'POLO' },
      { x: 256, p: '-50%', item: 'JOGGER' },
      { x: 416, p: '-40%', item: 'SHOES' }
    ];
    for (var ti = 0; ti < tags.length; ti++) {
      var tg = tags[ti];
      sbg.fillStyle = '#FFFBF1'; sbg.fillRect(tg.x - 56, 112, 112, 118);
      sbg.strokeStyle = '#1E1B18'; sbg.lineWidth = 4; sbg.strokeRect(tg.x - 56, 112, 112, 118);
      sbg.fillStyle = '#DC2626'; sbg.fillRect(tg.x - 46, 122, 92, 46);
      sbg.fillStyle = '#FFFBF1'; sbg.font = 'bold 28px monospace'; sbg.fillText(tg.p, tg.x, 155);
      sbg.fillStyle = '#111827'; sbg.font = 'bold 20px monospace'; sbg.fillText(tg.item, tg.x, 205);
    }
    wgl.registerTextureCanvas('saleBannerTex', sb, false);

    // Kính cửa sổ trong suốt bán phản chiếu (giữ nhìn xuyên ra phố 100%)
    var gw = mkCanvas(256, 256), gwg = gw.getContext('2d');
    gwg.clearRect(0, 0, 256, 256);
    gwg.fillStyle = 'rgba(206, 234, 248, 0.22)'; gwg.fillRect(10, 10, 236, 236);
    gwg.fillStyle = 'rgba(255, 255, 255, 0.28)';
    gwg.beginPath(); gwg.moveTo(26, 20); gwg.lineTo(74, 10); gwg.lineTo(148, 240); gwg.lineTo(100, 246); gwg.closePath(); gwg.fill();
    gwg.strokeStyle = '#3B2314'; gwg.lineWidth = 14; gwg.strokeRect(7, 7, 242, 242);
    gwg.strokeStyle = '#F4B93B'; gwg.lineWidth = 2; gwg.strokeRect(15, 15, 226, 226);
    wgl.registerTextureCanvas('glassWindowFrameTex', gw, false, true);

    // Lan can con tiện trắng đáy vòm Tầng 2 bám sát Banner
    var ab = mkCanvas(256, 128), abg = ab.getContext('2d');
    abg.clearRect(0, 0, 256, 128);
    abg.fillStyle = '#FFFBF1';
    abg.fillRect(0, 0, 256, 18);
    abg.fillRect(0, 108, 256, 20);
    for (var bx = 12; bx < 252; bx += 28) {
      abg.fillStyle = '#FFFBF1'; abg.fillRect(bx, 18, 12, 90);
      abg.fillStyle = '#CBD5E1'; abg.fillRect(bx + 12, 18, 4, 90);
    }
    wgl.registerTextureCanvas('archBalustradeTex', ab, false, true);

    // Mái ngói ống xám ấm giữa Tầng 1 và Tầng 2 (giống Banner)
    var rt = mkCanvas(256, 128), rtg = rt.getContext('2d');
    rtg.fillStyle = '#57463B'; rtg.fillRect(0, 0, 256, 128);
    for (var rx = 0; rx < 256; rx += 24) {
      rtg.fillStyle = '#A89B91'; rtg.fillRect(rx + 2, 4, 12, 120);
      rtg.fillStyle = '#2B2118'; rtg.fillRect(rx + 18, 0, 4, 128);
    }
    wgl.registerTextureCanvas('roofTileTex', rt, true);

    // Giàn hoa giấy hồng rực hai bên mặt tiền (bám sát Banner)
    var bg = mkCanvas(256, 256), bgg = bg.getContext('2d'), rngB = makeAdidasSeedRng(2562);
    bgg.fillStyle = '#2E7D32'; bgg.fillRect(0, 0, 256, 256);
    for (var li = 0; li < 90; li++) {
      bgg.fillStyle = rngB() > 0.45 ? '#4CAF50' : '#1B5E20';
      bgg.fillRect(rngB() * 236, rngB() * 236, 16, 16);
    }
    var pinkCols = ['#EC4899', '#F472B6', '#FBCFE8', '#DB2777'];
    for (var fi = 0; fi < 54; fi++) {
      bgg.fillStyle = pinkCols[fi % pinkCols.length];
      bgg.fillRect(10 + rngB() * 220, 10 + rngB() * 220, 14, 14);
    }
    wgl.registerTextureCanvas('bougainvilleaTex', bg, false);

    // Đường nhựa 2 làn xe chạy (roadAsphaltTex) & Nền Trời Skyline Sài Gòn 3 Thời Điểm
    var rd = mkCanvas(256, 256), rdg = rd.getContext('2d');
    rdg.fillStyle = '#3B4252'; rdg.fillRect(0, 0, 256, 256);
    rdg.fillStyle = '#E2E8F0'; rdg.fillRect(0, 8, 256, 8); rdg.fillRect(0, 240, 256, 8);
    rdg.fillStyle = '#FACC15';
    for (var dash = 12; dash < 256; dash += 48) rdg.fillRect(dash, 124, 26, 8);
    wgl.registerTextureCanvas('roadAsphaltTex', rd, true);

    var skies = [
      { key: 'skyDayTex',    top: '#38BDF8', bot: '#BAE6FD', bld: '#64748B', win: '#E0F2FE' },
      { key: 'skySunsetTex', top: '#7C2D12', bot: '#FB923C', bld: '#475569', win: '#FDE047' },
      { key: 'skyNightTex',  top: '#0F172A', bot: '#1E293B', bld: '#0B1220', win: '#FACC15' }
    ];
    for (var si = 0; si < skies.length; si++) {
      var sk = skies[si], sc = mkCanvas(512, 256), sg = sc.getContext('2d');
      var grd = sg.createLinearGradient(0, 0, 0, 256);
      grd.addColorStop(0, sk.top); grd.addColorStop(1, sk.bot);
      sg.fillStyle = grd; sg.fillRect(0, 0, 512, 256);
      // Tòa nhà & Bitexco/Landmark 81 đường chân trời
      var blds = [[24, 105, 58], [94, 78, 52], [156, 130, 42], [220, 46, 32], [274, 88, 60], [350, 62, 48], [412, 98, 72]];
      for (var bi = 0; bi < blds.length; bi++) {
        var b = blds[bi];
        sg.fillStyle = sk.bld; sg.fillRect(b[0], b[1], b[2], 256 - b[1]);
        sg.fillStyle = sk.win;
        for (var wy = b[1] + 12; wy < 236; wy += 18) {
          for (var wx = b[0] + 8; wx < b[0] + b[2] - 10; wx += 14) sg.fillRect(wx, wy, 7, 10);
        }
      }
      wgl.registerTextureCanvas(sk.key, sc, false);
    }

    // Bảng Bộ Sưu Tập Việt Nam × 3 Sọc (Tầng 2)
    var vc2 = mkCanvas(512, 256), vcg = vc2.getContext('2d');
    vcg.fillStyle = '#5C341D'; vcg.fillRect(0, 0, 512, 256);
    vcg.fillStyle = '#FFF5D6'; vcg.fillRect(14, 52, 484, 190);
    vcg.fillStyle = '#991B1B'; vcg.fillRect(10, 10, 492, 44);
    vcg.strokeStyle = '#FDE047'; vcg.lineWidth = 4; vcg.strokeRect(10, 10, 492, 236);
    vcg.fillStyle = '#FDE047'; vcg.font = 'bold 22px monospace'; vcg.textAlign = 'center';
    vcg.fillText('★ BỘ SƯU TẬP VIỆT NAM · 3 SỌC ★', 256, 39);
    var jCols = [['#DA251D', '#FDE047'], ['#FFFBF1', '#DA251D'], ['#0F766E', '#FDE047']];
    for (var ji = 0; ji < 3; ji++) {
      var jx = 112 + ji * 144, jy = 94;
      vcg.fillStyle = jCols[ji][0]; vcg.fillRect(jx - 38, jy, 76, 22); vcg.fillRect(jx - 24, jy, 48, 88);
      vcg.strokeStyle = '#2B180E'; vcg.lineWidth = 2; vcg.strokeRect(jx - 24, jy, 48, 88);
      vcg.fillStyle = jCols[ji][1];
      for (var k = 0; k < 3; k++) {
        vcg.fillRect(jx - 34 + k * 5, jy + 2, 3, 18); vcg.fillRect(jx + 22 + k * 5, jy + 2, 3, 18);
      }
    }
    wgl.registerTextureCanvas('vnCollectionSign', vc2, false);
  })();

  // 18. Đăng ký 4 bộ trang phục Chú Heo 24×20 (gl.NEAREST)
  if (typeof buildPigBillboardTextures === 'function') {
    buildPigBillboardTextures(wgl, ['adidas_jacket', 'adidas_polo', 'adidas_jogger', 'adidas_kit']);
  }
}

/* ==================== 2. FALLBACK CANVAS2D CHO HEADLESS SMOKE TEST 182 & NON-WEBGL ==================== */
function drawAdidasClippedQuad(ctx, cam, pts, bgCol, borderCol, lineW, drawInner) {
  drawPoly3D(ctx, cam, pts, bgCol, borderCol, lineW || 2);
  var p0 = projectPoint3D(cam, pts[0][0], pts[0][1], pts[0][2]);
  var p1 = projectPoint3D(cam, pts[1][0], pts[1][1], pts[1][2]);
  var p2 = projectPoint3D(cam, pts[2][0], pts[2][1], pts[2][2]);
  var p3 = projectPoint3D(cam, pts[3][0], pts[3][1], pts[3][2]);
  if (!p0 || !p1 || !p2 || !p3) return;
  if (p0.cz < 0.5 || p1.cz < 0.5 || p2.cz < 0.5 || p3.cz < 0.5) return;
  var bw = Math.hypot(p1.sx - p0.sx, p1.sy - p0.sy);
  var bh = Math.hypot(p3.sx - p0.sx, p3.sy - p0.sy);
  if (bw < 14 || bh < 14) return;
  var cx = (p0.sx + p1.sx + p2.sx + p3.sx) * 0.25;
  var cy = (p0.sy + p1.sy + p2.sy + p3.sy) * 0.25;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p0.sx, p0.sy); ctx.lineTo(p1.sx, p1.sy);
  ctx.lineTo(p2.sx, p2.sy); ctx.lineTo(p3.sx, p3.sy);
  ctx.closePath(); ctx.clip();
  if (drawInner) drawInner(cx, cy, bw, bh, Math.max(8, bw * 0.84));
  ctx.restore();
}

function drawPixelSneakerIcon(ctx, x, y, w, h, bodyCol, stripeCol, soleCol) {
  ctx.fillStyle = soleCol || '#D9A05B';
  ctx.fillRect(x - w * 0.44, y + h * 0.14, w * 0.88, h * 0.22);
  ctx.fillStyle = bodyCol || '#FFFBF1';
  ctx.fillRect(x - w * 0.40, y - h * 0.16, w * 0.72, h * 0.32);
  ctx.fillRect(x + w * 0.22, y - h * 0.04, w * 0.20, h * 0.20);
  ctx.fillStyle = stripeCol || '#111827';
  for (var s = 0; s < 3; s++) {
    ctx.fillRect(x - w * 0.16 + s * w * 0.12, y - h * 0.12, w * 0.06, h * 0.26);
  }
  ctx.strokeStyle = '#2B180E'; ctx.lineWidth = 1;
  ctx.strokeRect(x - w * 0.44, y - h * 0.16, w * 0.88, h * 0.52);
}

function drawPixelJerseyIcon(ctx, cx, cy, w, h, mainCol, stripeCol, accentCol) {
  ctx.fillStyle = mainCol;
  ctx.fillRect(cx - w * 0.42, cy - h * 0.36, w * 0.84, h * 0.24);
  ctx.fillRect(cx - w * 0.28, cy - h * 0.36, w * 0.56, h * 0.72);
  ctx.fillStyle = stripeCol || '#FFFBF1';
  for (var s = 0; s < 3; s++) {
    ctx.fillRect(cx - w * 0.40 + s * w * 0.06, cy - h * 0.34, w * 0.03, h * 0.18);
    ctx.fillRect(cx + w * 0.22 + s * w * 0.06, cy - h * 0.34, w * 0.03, h * 0.18);
  }
  ctx.fillStyle = accentCol || '#FDE047';
  ctx.fillRect(cx - w * 0.10, cy - h * 0.36, w * 0.20, h * 0.08);
  ctx.strokeStyle = '#2B180E'; ctx.lineWidth = 1;
  ctx.strokeRect(cx - w * 0.28, cy - h * 0.36, w * 0.56, h * 0.72);
}

function drawAdidasRoomWalls3D(ctx, cam, room, pig, _t) {
  if (room === 'fitting' || room === 'fitting_pos') {
    drawAdidasClippedQuad(
      ctx, cam,
      [[-5.93, 2.62, 2.4], [-5.93, 2.62, 10.4], [-5.93, 0.92, 10.4], [-5.93, 0.92, 2.4]],
      '#3B2314', '#C89B3C', 2.0,
      function(cx, cy, bw, bh) {
        ctx.fillStyle = '#243B2B';
        ctx.fillRect(cx - bw * 0.46, cy - bh * 0.44, bw * 0.92, bh * 0.88);
        drawPixelJerseyIcon(ctx, cx - bw * 0.28, cy + bh * 0.04, bw * 0.22, bh * 0.56, '#111827', '#FFFBF1', '#FDE047');
        drawPixelJerseyIcon(ctx, cx,            cy + bh * 0.04, bw * 0.22, bh * 0.56, '#1E3A8A', '#FFFBF1', '#60A5FA');
        drawPixelJerseyIcon(ctx, cx + bw * 0.28, cy + bh * 0.04, bw * 0.22, bh * 0.56, '#991B1B', '#FFFBF1', '#FDE047');
      }
    );
    drawAdidasClippedQuad(
      ctx, cam,
      [[-1.75, 3.32, 14.70], [1.75, 3.32, 14.70], [1.75, 0.22, 14.70], [-1.75, 0.22, 14.70]],
      '#CBE7F5', '#5C341D', 3.4,
      function(cx, cy, bw, bh, safeW) {
        ctx.fillStyle = '#DCEFF8';
        ctx.fillRect(cx - bw * 0.46, cy - bh * 0.46, bw * 0.92, bh * 0.62);
        var tPx = Math.max(4, Math.min(9, Math.round(bh * 0.07)));
        ctx.font = 'bold ' + tPx + 'px monospace';
        ctx.fillStyle = '#2B180E'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(pig && pig.outfit && pig.outfit !== 'none' ? '✨ 3 SỌC CỰC CHẤT ✨' : 'GƯƠNG TOÀN THÂN', cx, cy - bh * 0.38, safeW);
      }
    );
    return;
  }
  drawAdidasClippedQuad(
    ctx, cam,
    [[-9.9, 3.42, 1.8], [-9.9, 3.42, 11.4], [-9.9, 2.86, 11.4], [-9.9, 2.86, 1.8]],
    '#2B180E', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(13, Math.round(bh * 0.42)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('FOOTWEAR LIBRARY · ORIGINALS', cx, cy, safeW);
    }
  );
  drawAdidasClippedQuad(
    ctx, cam,
    [[-3.2, 3.45, 23.85], [3.2, 3.45, 23.85], [3.2, 1.82, 23.85], [-3.2, 1.82, 23.85]],
    '#141820', '#F4B93B', 2.6,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(6, Math.min(14, Math.round(bh * 0.22)));
      var p2 = Math.max(5, Math.min(11, Math.round(bh * 0.16)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace'; ctx.fillStyle = '#FFFBF1';
      ctx.fillText('ADIDAS ORIGINALS', cx, cy + bh * 0.02, safeW);
      ctx.font = 'bold ' + p2 + 'px monospace'; ctx.fillStyle = '#FDE047';
      ctx.fillText('· MALL FLAGSHIP STORE ·', cx, cy + bh * 0.28, safeW);
    }
  );
}
`;
}
