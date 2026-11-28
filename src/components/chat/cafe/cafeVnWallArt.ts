/**
 * Bộ Sinh Texture Thủ Tục Chân Thực Quán Cà Phê Sài Gòn + Mỹ Thuật Tường Fallback (Quyết định 247–251)
 * - Sinh các Texture Power-of-Two (256×256 / 512×256) trực tiếp trong RAM (<15ms, 0 CDN mạng):
 *   1. oliveWall: Tường vôi xanh rêu loang vữa ấm & vết thời gian.
 *   2. timber: Vân gỗ gụ/lim sẫm màu nhiều thớ tự nhiên & mắt gỗ.
 *   3. gachBong: Gạch bông Đông Dương Tầng 2 họa tiết hoa 4 cánh sờn nhẹ & đường ron.
 *   4. cementFloor: Sàn xi măng mài Tầng 1 ẩm mát xám-rêu có độ sần nhẹ.
 *   5. peacockFabric: Vải Chăn Con Công đỏ thắm rực rỡ với hoa mẫu đơn hồng & lá xanh cốm.
 *   6. aoTranThu: Áo trấn thủ xanh bộ đội chần bông đường chỉ quả trám đặc trưng.
 *   7. fernLeaf: Lá cây nhiệt đới xanh mướt.
 *   8. enamelMenu: Bảng thực đơn sơn tay cổ điển trên nền xanh rêu (Cà Phê Cốt Dừa, Bạc Xỉu, Hướng Dương).
 *   9. photos1980s: Khung ảnh đen trắng Việt Nam & poster cổ động Độc Lập - Tự Do - Hạnh Phúc.
 *  10. cafeCreamWall / awningStripe / cafeWoodSign / riverWater / riverShipTex / sofaVelvet / treePine:
 *      Mặt tiền vàng kem #F7E7C6 đồng bộ Tab Banner nhìn ra Sông Bạch Đằng + nội thất Noel & Sofa.
 */
export function buildCafeVnWallArtScript(): string {
  return String.raw`
/* ==================== 1. BỘ SINH TEXTURE THỦ TỤC QUÁN CÀ PHÊ SÀI GÒN CHO WEBGL 3D ==================== */
function makeSeedRng(seed) {
  var s = seed | 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCafeProceduralTextures(webgl) {
  function mkCanvas(w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; return c;
  }

  // 1. Tường vôi xanh rêu loang 1980s (oliveWall)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makeSeedRng(1980);
    g.fillStyle = '#4B5B35'; g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 240; i++) {
      var x = rng()*256, y = rng()*256, r = 10 + rng()*38;
      g.fillStyle = rng() > 0.45 ? 'rgba(92,108,62,0.16)' : 'rgba(42,50,28,0.18)';
      g.beginPath(); g.arc(x, y, r, 0, Math.PI*2); g.fill();
    }
    g.strokeStyle = 'rgba(32,38,20,0.22)'; g.lineWidth = 1;
    for (var k = 0; k < 28; k++) {
      var cx = rng()*256, cy = rng()*256;
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + (rng()-0.5)*28, cy + rng()*32); g.stroke();
    }
    webgl.registerTextureCanvas('oliveWall', c, true);
  })();

  // 2. Vân gỗ gụ tối cổ kính (timber)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makeSeedRng(2471);
    g.fillStyle = '#4D2E1B'; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 256; y += 3) {
      g.fillStyle = (y % 6 === 0) ? 'rgba(32,16,8,0.34)' : 'rgba(116,74,44,0.20)';
      g.fillRect(0, y, 256, 2);
    }
    for (var p = 0; p < 256; p += 64) {
      g.fillStyle = 'rgba(20,10,4,0.45)'; g.fillRect(0, p, 256, 2);
    }
    for (var m = 0; m < 12; m++) {
      g.strokeStyle = 'rgba(28,14,6,0.25)'; g.beginPath();
      g.ellipse(rng()*256, rng()*256, 18, 4, 0, 0, Math.PI*2); g.stroke();
    }
    webgl.registerTextureCanvas('timber', c, true);
  })();

  // 3. Gạch bông Đông Dương cổ điển Tầng 2 (gachBong)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makeSeedRng(1986);
    g.fillStyle = '#CEC3AA'; g.fillRect(0, 0, 256, 256);
    for (var ty = 0; ty < 256; ty += 128) {
      for (var tx = 0; tx < 256; tx += 128) {
        var cx = tx + 64, cy = ty + 64;
        g.strokeStyle = '#737B6A'; g.lineWidth = 3; g.strokeRect(tx + 3, ty + 3, 122, 122);
        // Hoa 4 cánh Đông Dương đặc trưng gạch bông Việt Nam
        g.fillStyle = '#4F603B';
        for (var k = 0; k < 4; k++) {
          g.save(); g.translate(cx, cy); g.rotate(k * Math.PI / 2);
          g.beginPath(); g.ellipse(0, -26, 12, 24, 0, 0, Math.PI*2); g.fill();
          g.restore();
        }
        g.fillStyle = '#B87B3E';
        for (var d = 0; d < 4; d++) {
          g.save(); g.translate(cx, cy); g.rotate(d * Math.PI / 2 + Math.PI / 4);
          g.beginPath(); g.ellipse(0, -22, 8, 16, 0, 0, Math.PI*2); g.fill();
          g.restore();
        }
        g.fillStyle = '#EFE6D2'; g.beginPath(); g.arc(cx, cy, 11, 0, Math.PI*2); g.fill();
        g.fillStyle = '#4F603B'; g.beginPath(); g.arc(cx, cy, 5, 0, Math.PI*2); g.fill();
      }
    }
    // Vết sờn thời gian trên mặt gạch
    for (var s = 0; s < 140; s++) {
      g.fillStyle = 'rgba(72,64,50,0.09)';
      g.beginPath(); g.arc(rng()*256, rng()*256, 4 + rng()*14, 0, Math.PI*2); g.fill();
    }
    webgl.registerTextureCanvas('gachBong', c, true);
  })();

  // 4. Sàn xi măng mài Tầng 1 (cementFloor)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makeSeedRng(1982);
    g.fillStyle = '#6A7165'; g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 300; i++) {
      g.fillStyle = rng() > 0.5 ? 'rgba(130,138,122,0.14)' : 'rgba(54,58,50,0.16)';
      g.beginPath(); g.arc(rng()*256, rng()*256, 6 + rng()*24, 0, Math.PI*2); g.fill();
    }
    g.strokeStyle = 'rgba(38,42,36,0.22)'; g.lineWidth = 2;
    g.strokeRect(1, 1, 254, 254);
    webgl.registerTextureCanvas('cementFloor', c, true);
  })();

  // 5. Vải Chăn Con Công rực rỡ (peacockFabric)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#B91C1C'; g.fillRect(0, 0, 256, 256);
    for (var r = 0; r < 4; r++) {
      for (var col = 0; col < 4; col++) {
        var fx = 32 + col * 64 + (r % 2) * 14, fy = 32 + r * 64;
        g.fillStyle = '#15803D';
        g.beginPath(); g.ellipse(fx - 16, fy + 10, 14, 8, -0.4, 0, Math.PI*2); g.fill();
        g.beginPath(); g.ellipse(fx + 16, fy - 10, 14, 8, 0.4, 0, Math.PI*2); g.fill();
        g.fillStyle = '#F43F5E'; g.beginPath(); g.arc(fx, fy, 18, 0, Math.PI*2); g.fill();
        g.fillStyle = '#FDA4AF'; g.beginPath(); g.arc(fx - 4, fy - 4, 11, 0, Math.PI*2); g.fill();
        g.fillStyle = '#FACC15'; g.beginPath(); g.arc(fx, fy, 6, 0, Math.PI*2); g.fill();
      }
    }
    webgl.registerTextureCanvas('peacockFabric', c, true);
  })();

  // 6. Áo Trấn Thủ chần bông quả trám (aoTranThu)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#4B5E34'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#334222'; g.lineWidth = 2;
    for (var d = -256; d < 512; d += 32) {
      g.beginPath(); g.moveTo(d, 0); g.lineTo(d + 256, 256); g.stroke();
      g.beginPath(); g.moveTo(d, 256); g.lineTo(d + 256, 0); g.stroke();
    }
    g.strokeStyle = 'rgba(130,152,96,0.28)'; g.lineWidth = 1;
    for (var d2 = -254; d2 < 512; d2 += 32) {
      g.beginPath(); g.moveTo(d2, 0); g.lineTo(d2 + 256, 256); g.stroke();
    }
    webgl.registerTextureCanvas('aoTranThu', c, true);
  })();

  // 7. Lá dương xỉ xanh mướt ban công (fernLeaf)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.clearRect(0, 0, 256, 256);
    g.strokeStyle = '#1E4620'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(128, 250); g.quadraticCurveTo(132, 128, 128, 8); g.stroke();
    for (var y = 24; y <= 232; y += 15) {
      var span = Math.sin((y / 256) * Math.PI) * 96 + 18;
      g.fillStyle = y < 120 ? '#65A30D' : '#3F7D20';
      g.beginPath(); g.ellipse(128 - span * 0.5, y, span * 0.5, 6, -0.22, 0, Math.PI*2); g.fill();
      g.beginPath(); g.ellipse(128 + span * 0.5, y, span * 0.5, 6, 0.22, 0, Math.PI*2); g.fill();
    }
    webgl.registerTextureCanvas('fernLeaf', c, false);
  })();

  // 8. Bảng Thực Đơn sơn tay tráng men Cà Phê Sài Gòn (enamelMenu)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#2F3D21'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#EAB308'; g.lineWidth = 6; g.strokeRect(10, 10, 492, 236);
    g.fillStyle = '#FDE047'; g.font = 'bold 30px serif'; g.textAlign = 'center';
    g.fillText('CÀ PHÊ SÀI GÒN · THỰC ĐƠN', 256, 48);
    g.fillStyle = '#FFFDF5'; g.font = 'bold 22px monospace';
    var items = [
      ['CÀ PHÊ CỐT DỪA', '35.000Đ'],
      ['BẠC XỈU ĐÁ', '25.000Đ'],
      ['PHIN ĐEN ĐÁ', '20.000Đ'],
      ['HẠT HƯỚNG DƯƠNG', '15.000Đ']
    ];
    for (var i = 0; i < items.length; i++) {
      var ry = 95 + i * 38;
      g.fillStyle = '#FFF7DF'; g.textAlign = 'left'; g.fillText(items[i][0], 34, ry);
      g.fillStyle = '#FACC15'; g.textAlign = 'right'; g.fillText(items[i][1], 478, ry);
    }
    webgl.registerTextureCanvas('enamelMenu', c, false);
  })();

  // 9. Tường Ảnh Đen Trắng 1980s & Poster Cổ Động (photos1980s)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#4B5B35'; g.fillRect(0, 0, 512, 256);
    // 3 Khung ảnh B&W thập niên 80
    var xs = [18, 180, 342];
    for (var i = 0; i < 3; i++) {
      g.fillStyle = '#3E2414'; g.fillRect(xs[i], 22, 148, 126);
      g.fillStyle = '#D6D3D1'; g.fillRect(xs[i]+10, 32, 128, 106);
      g.fillStyle = '#44403C';
      g.beginPath(); g.arc(xs[i]+74, 68, 16, 0, Math.PI*2); g.fill();
      g.fillRect(xs[i]+52, 86, 44, 42);
    }
    // Băng rôn gỗ ĐỘC LẬP · TỰ DO · HẠNH PHÚC bên dưới
    g.fillStyle = '#5C341D'; g.fillRect(26, 164, 460, 72);
    g.strokeStyle = '#FACC15'; g.lineWidth = 3; g.strokeRect(30, 168, 452, 64);
    g.fillStyle = '#FFFBEB'; g.font = 'bold 26px serif'; g.textAlign = 'center';
    g.fillText('★ ĐỘC LẬP · TỰ DO · HẠNH PHÚC ★', 256, 209);
    webgl.registerTextureCanvas('photos1980s', c, false);
  })();

  // 10. Mặt tiền Pháp cổ vàng nắng chiều dưới phố (colonialStreet)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#D9A74A'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#B8452A'; g.fillRect(0, 0, 256, 36); // Mái ngói đỏ
    for (var wx = 28; wx <= 180; wx += 74) {
      g.fillStyle = '#3E5B38'; g.fillRect(wx, 68, 48, 86); // Cửa chớp xanh cổ
      g.fillStyle = '#FEF3C7'; g.fillRect(wx+6, 76, 36, 26);
      g.fillStyle = '#2B4026';
      for (var sl = 110; sl < 150; sl += 8) g.fillRect(wx+4, sl, 40, 3);
    }
    webgl.registerTextureCanvas('colonialStreet', c, true);
  })();

  // 11. Bộ Tranh & Mỹ Thuật Văn Hóa Việt Nam Trên Tường Quán Cà Phê (QĐ 249–251)
  // 11a. Tranh Hoa Sen Hồng nhiều tầng cánh khung gỗ gụ (vnLotusArt)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#4A2C1A'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#FFF7DF'; g.fillRect(14, 14, 228, 228);
    g.strokeStyle = '#B45309'; g.lineWidth = 3; g.strokeRect(20, 20, 216, 216);
    g.fillStyle = '#15803D';
    g.beginPath(); g.ellipse(86, 178, 42, 18, -0.25, 0, Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(170, 178, 42, 18, 0.25, 0, Math.PI*2); g.fill();
    var petals = [
      [-42, 8, -0.55, '#EC4899'], [42, 8, 0.55, '#EC4899'],
      [-24, -12, -0.32, '#F472B6'], [24, -12, 0.32, '#F472B6'],
      [0, -24, 0, '#FBCFE8']
    ];
    for (var i = 0; i < petals.length; i++) {
      g.save(); g.translate(128 + petals[i][0], 132 + petals[i][1]); g.rotate(petals[i][2]);
      g.fillStyle = petals[i][3]; g.strokeStyle = '#9D174D'; g.lineWidth = 2;
      g.beginPath(); g.ellipse(0, 0, 22, 48, 0, 0, Math.PI*2); g.fill(); g.stroke();
      g.restore();
    }
    g.fillStyle = '#FACC15'; g.beginPath(); g.arc(128, 134, 16, 0, Math.PI*2); g.fill();
    g.fillStyle = '#7C2D12'; g.font = 'bold 20px serif'; g.textAlign = 'center';
    g.fillText('QUỐC HOA SEN VIỆT', 128, 222);
    webgl.registerTextureCanvas('vnLotusArt', c, false);
  })();

  // 11b. Tranh Xe Xích Lô Đỏ-Vàng Phố Cổ Sài Gòn (vnCycloArt)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#4A2C1A'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#FDE68A'; g.fillRect(14, 14, 228, 228);
    g.strokeStyle = '#991B1B'; g.lineWidth = 3; g.strokeRect(20, 20, 216, 216);
    // Hai bánh xích lô
    g.strokeStyle = '#1E293B'; g.lineWidth = 6;
    g.beginPath(); g.arc(82, 168, 28, 0, Math.PI*2); g.stroke();
    g.beginPath(); g.arc(174, 168, 28, 0, Math.PI*2); g.stroke();
    // Mui xích lô & khoang ghế đỏ vàng
    g.fillStyle = '#5C341D';
    g.beginPath(); g.moveTo(54, 108); g.quadraticCurveTo(86, 56, 132, 92); g.lineTo(118, 120); g.closePath(); g.fill();
    g.fillStyle = '#DC2626'; g.fillRect(62, 114, 68, 42);
    g.fillStyle = '#FACC15'; g.fillRect(70, 122, 48, 26);
    g.strokeStyle = '#92400E'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(130, 146); g.lineTo(174, 168); g.lineTo(158, 112); g.lineTo(132, 106); g.stroke();
    g.fillStyle = '#7C2D12'; g.font = 'bold 20px serif'; g.textAlign = 'center';
    g.fillText('SÀI GÒN XÍCH LÔ', 128, 222);
    webgl.registerTextureCanvas('vnCycloArt', c, false);
  })();

  // 11c. Tranh Áo Dài Trắng Thêu Hoa Sen & Tem Bưu Chính (vnAoDaiArt)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#4A2C1A'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#EFE6D2'; g.fillRect(14, 14, 228, 228);
    g.strokeStyle = '#15803D'; g.lineWidth = 3; g.strokeRect(20, 20, 216, 216);
    // Quần lụa & Tà Áo Dài
    g.fillStyle = '#94A3B8'; g.fillRect(98, 148, 60, 54);
    g.fillStyle = '#FFFFFF'; g.strokeStyle = '#8F6E42'; g.lineWidth = 3;
    g.beginPath();
    g.moveTo(110, 44); g.lineTo(146, 44); g.lineTo(182, 88); g.lineTo(164, 104);
    g.lineTo(150, 82); g.lineTo(166, 194); g.lineTo(90, 194); g.lineTo(106, 82);
    g.lineTo(92, 104); g.lineTo(74, 88); g.closePath(); g.fill(); g.stroke();
    // Hoa sen thêu dọc tà áo
    g.strokeStyle = '#15803D'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(124, 84); g.quadraticCurveTo(140, 128, 122, 178); g.stroke();
    g.fillStyle = '#F472B6';
    g.beginPath(); g.arc(130, 104, 10, 0, Math.PI*2); g.arc(136, 144, 12, 0, Math.PI*2); g.fill();
    g.fillStyle = '#5C341D'; g.font = 'bold 19px serif'; g.textAlign = 'center';
    g.fillText('ÁO DÀI VIỆT NAM', 128, 224);
    webgl.registerTextureCanvas('vnAoDaiArt', c, false);
  })();

  // 11d. Tranh Cờ Đỏ Sao Vàng & Hoa Mai Vàng + Câu Đối (vnFlagMaiArt)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#3B2314'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#FEF3C7'; g.fillRect(14, 14, 228, 228);
    // Cờ Đỏ Sao Vàng
    g.fillStyle = '#DA251D'; g.fillRect(36, 36, 152, 98);
    g.fillStyle = '#FFFF00'; g.beginPath();
    for (var si = 0; si < 10; si++) {
      var r = (si % 2 === 0) ? 30 : 12;
      var ang = -Math.PI/2 + si * Math.PI/5;
      var px = 112 + Math.cos(ang)*r, py = 85 + Math.sin(ang)*r;
      if (si === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath(); g.fill();
    // Nón lá nhỏ + Nhành Hoa Mai vàng 5 cánh
    g.fillStyle = '#E8CF9E'; g.strokeStyle = '#7C4F2B'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(74, 152); g.lineTo(34, 206); g.lineTo(114, 206); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#5C341D'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(138, 218); g.quadraticCurveTo(180, 168, 222, 118); g.stroke();
    var mais = [[164,184],[190,154],[214,126],[174,142],[204,174]];
    g.fillStyle = '#FACC15';
    for (var mi = 0; mi < mais.length; mi++) {
      g.beginPath(); g.arc(mais[mi][0], mais[mi][1], 11, 0, Math.PI*2); g.fill();
    }
    webgl.registerTextureCanvas('vnFlagMaiArt', c, false);
  })();

  // 11e. Kệ Sách Thư Viện Cổ 3 Tầng Đầy Sách Đủ Màu Gáy (vnBookShelfTex)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d'), rng = makeSeedRng(1990);
    g.fillStyle = '#3B2314'; g.fillRect(0, 0, 512, 256);
    var bookCols = ['#B91C1C','#1D4ED8','#D97706','#15803D','#7C2D12','#475569','#EAB308','#A16207','#0F766E'];
    for (var row = 0; row < 3; row++) {
      var yBase = 80 + row * 82;
      g.fillStyle = '#5C341D'; g.fillRect(8, yBase - 6, 496, 12);
      var x = 16;
      while (x < 484) {
        var bw = 12 + Math.floor(rng() * 14);
        var bh = 44 + Math.floor(rng() * 24);
        g.fillStyle = bookCols[Math.floor(rng() * bookCols.length)];
        g.fillRect(x, yBase - 6 - bh, bw, bh);
        g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x + 2, yBase - bh + 2, bw - 4, 3);
        g.strokeStyle = '#1E140E'; g.lineWidth = 1; g.strokeRect(x, yBase - 6 - bh, bw, bh);
        x += bw + 1;
      }
    }
    g.strokeStyle = '#2B180E'; g.lineWidth = 8; g.strokeRect(4, 4, 504, 248);
    webgl.registerTextureCanvas('vnBookShelfTex', c, false);
  })();

  // 11f. Biển Treo Đỏ Quầy Bar "PICK UP HERE" & Biển Gỗ Tròn "ĐI NHẸ NÓI KHẼ" & Tường Vàng Bao Cấp
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#991B1B';
    g.beginPath(); g.moveTo(20, 12); g.lineTo(236, 12); g.lineTo(236, 186); g.lineTo(128, 244); g.lineTo(20, 186); g.closePath(); g.fill();
    g.strokeStyle = '#FEF3C7'; g.lineWidth = 5; g.stroke();
    g.fillStyle = '#FFFDF5'; g.font = 'bold 42px sans-serif'; g.textAlign = 'center';
    g.fillText('PICK', 128, 76); g.fillText('UP', 128, 128); g.fillText('HERE', 128, 180);
    webgl.registerTextureCanvas('vnPickUpSign', c, false);

    var q = mkCanvas(256, 256), qg = q.getContext('2d');
    qg.clearRect(0, 0, 256, 256);
    qg.fillStyle = '#A67C52'; qg.beginPath(); qg.arc(128, 128, 114, 0, Math.PI*2); qg.fill();
    qg.strokeStyle = '#5C341D'; qg.lineWidth = 10; qg.stroke();
    qg.fillStyle = '#FFFBEB'; qg.font = 'bold 34px serif'; qg.textAlign = 'center';
    qg.fillText('ĐI NHẸ', 128, 114); qg.fillText('NÓI KHẼ', 128, 158);
    webgl.registerTextureCanvas('vnQuietSign', q, false);

    var d = mkCanvas(256, 256), dg = d.getContext('2d');
    dg.fillStyle = '#5C3A21'; dg.fillRect(0, 0, 256, 256);
    dg.fillStyle = '#D9ECF2'; dg.fillRect(26, 22, 92, 110); dg.fillRect(138, 22, 92, 110);
    dg.strokeStyle = '#3B2314'; dg.lineWidth = 6;
    dg.strokeRect(26, 22, 92, 110); dg.strokeRect(138, 22, 92, 110);
    dg.fillStyle = '#4A2C1A'; dg.fillRect(26, 150, 92, 86); dg.fillRect(138, 150, 92, 86);
    dg.fillStyle = '#F4B93B'; dg.beginPath(); dg.arc(118, 146, 7, 0, Math.PI*2); dg.arc(138, 146, 7, 0, Math.PI*2); dg.fill();
    webgl.registerTextureCanvas('vnDoorWood', d, false);
  })();

  // 11f. Texture Mặt Tiền Tab Banner (#F7E7C6), Mái Hiên, Biển CÀ PHÊ, Sông Bạch Đằng & Nội Thất Mới (QĐ 251)
  (function() {
    var cw = mkCanvas(256, 256), cwg = cw.getContext('2d'), rng = makeSeedRng(2510);
    cwg.fillStyle = '#F7E7C6'; cwg.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 160; i++) {
      cwg.fillStyle = rng() > 0.5 ? 'rgba(217,191,150,0.20)' : 'rgba(255,250,238,0.22)';
      cwg.beginPath(); cwg.arc(rng()*256, rng()*256, 8 + rng()*24, 0, Math.PI*2); cwg.fill();
    }
    webgl.registerTextureCanvas('cafeCreamWall', cw, true);

    var aw = mkCanvas(256, 128), awg = aw.getContext('2d');
    for (var ax = 0; ax < 256; ax += 32) {
      awg.fillStyle = ((ax / 32) % 2 === 0) ? '#D94330' : '#FFF6E5';
      awg.fillRect(ax, 0, 32, 128);
    }
    awg.fillStyle = 'rgba(43,33,24,0.16)'; awg.fillRect(0, 108, 256, 20);
    webgl.registerTextureCanvas('awningStripe', aw, true);

    var sg = mkCanvas(512, 128), sgg = sg.getContext('2d');
    sgg.fillStyle = '#6B4226'; sgg.fillRect(0, 0, 512, 128);
    sgg.strokeStyle = '#FACC15'; sgg.lineWidth = 6; sgg.strokeRect(8, 8, 496, 112);
    sgg.fillStyle = '#FFF6E5'; sgg.font = 'bold 48px serif'; sgg.textAlign = 'center'; sgg.textBaseline = 'middle';
    sgg.fillText('★  CÀ PHÊ SÀI GÒN  ★', 256, 66);
    webgl.registerTextureCanvas('cafeWoodSign', sg, false);

    var rw = mkCanvas(256, 256), rwg = rw.getContext('2d'), rrng = makeSeedRng(2511);
    rwg.fillStyle = '#256D91'; rwg.fillRect(0, 0, 256, 256);
    for (var wy = 0; wy < 256; wy += 12) {
      rwg.fillStyle = wy % 24 === 0 ? 'rgba(94,185,222,0.28)' : 'rgba(18,62,88,0.24)';
      rwg.fillRect(0, wy, 256, 5);
    }
    for (var wi = 0; wi < 48; wi++) {
      rwg.fillStyle = 'rgba(255,248,214,0.32)';
      rwg.fillRect(rrng()*220, rrng()*248, 12 + rrng()*22, 2);
    }
    webgl.registerTextureCanvas('riverWater', rw, true);

    var sf = mkCanvas(256, 256), sfg = sf.getContext('2d');
    sfg.fillStyle = '#365842'; sfg.fillRect(0, 0, 256, 256);
    sfg.strokeStyle = 'rgba(24,42,30,0.45)'; sfg.lineWidth = 4;
    for (var sy = 32; sy < 256; sy += 64) {
      for (var sx = 32; sx < 256; sx += 64) {
        sfg.beginPath(); sfg.arc(sx, sy, 5, 0, Math.PI*2); sfg.stroke();
      }
    }
    webgl.registerTextureCanvas('sofaVelvet', sf, true);

    var tp = mkCanvas(256, 256), tpg = tp.getContext('2d'), trng = makeSeedRng(2512);
    tpg.fillStyle = '#1E5B35'; tpg.fillRect(0, 0, 256, 256);
    for (var ti = 0; ti < 180; ti++) {
      tpg.fillStyle = trng() > 0.45 ? '#2B7A46' : '#144425';
      tpg.fillRect(trng()*248, trng()*248, 10, 6);
    }
    webgl.registerTextureCanvas('treePine', tp, true);
  })();

  // 11g. Texture Mặt Đường Nhựa 2 Làn Xe Chạy, Rèm Cửa Sổ & Skyline Sài Gòn 3 Thời Điểm (QĐ 253)
  (function() {
    // Mặt đường nhựa 2 làn + vạch trắng phân làn + mép vỉa hè
    var rd = mkCanvas(256, 256), rdg = rd.getContext('2d'), rdrng = makeSeedRng(2530);
    rdg.fillStyle = '#383B42'; rdg.fillRect(0, 0, 256, 256);
    for (var ri = 0; ri < 420; ri++) {
      rdg.fillStyle = rdrng() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(15,18,24,0.14)';
      rdg.fillRect(rdrng()*254, rdrng()*254, 2, 2);
    }
    rdg.fillStyle = '#EAB308'; rdg.fillRect(0, 8, 256, 4); rdg.fillRect(0, 244, 256, 4);
    rdg.fillStyle = '#F8FAFC';
    for (var rx = 12; rx < 256; rx += 64) {
      rdg.fillRect(rx, 124, 38, 8);
    }
    webgl.registerTextureCanvas('roadAsphalt', rd, true);

    // Rèm vải lanh xếp nếp kem nhạt che cửa sổ Tầng 1 & vén hai bên vòm Tầng 2
    var ct = mkCanvas(256, 256), ctg = ct.getContext('2d');
    ctg.fillStyle = '#F7EFE0'; ctg.fillRect(0, 0, 256, 256);
    for (var fx = 0; fx < 256; fx += 32) {
      ctg.fillStyle = 'rgba(180,155,120,0.22)'; ctg.fillRect(fx, 0, 10, 256);
      ctg.fillStyle = 'rgba(255,252,245,0.35)'; ctg.fillRect(fx + 14, 0, 8, 256);
    }
    ctg.fillStyle = '#E2D0B5'; ctg.fillRect(0, 232, 256, 24);
    for (var lx = 6; lx < 256; lx += 16) {
      ctg.fillStyle = '#C7AF8D'; ctg.fillRect(lx, 240, 8, 8);
    }
    webgl.registerTextureCanvas('cafeCurtain', ct, false);

    // Skyline Sài Gòn (Bitexco + Landmark 81 + Cao ốc + Bờ Thủ Thiêm) cho Sáng / Chiều / Tối
    function buildSkylineTex(mode, texName) {
      var c = mkCanvas(512, 256), g = c.getContext('2d'), rng = makeSeedRng(mode === 'night' ? 2533 : (mode === 'sunset' ? 2532 : 2531));
      var grad = g.createLinearGradient(0, 0, 0, 224);
      if (mode === 'day') {
        grad.addColorStop(0, '#5FA8F2'); grad.addColorStop(0.55, '#9BD0FC'); grad.addColorStop(1, '#DCEFFF');
      } else if (mode === 'sunset') {
        grad.addColorStop(0, '#5C4B99'); grad.addColorStop(0.45, '#C7778E'); grad.addColorStop(1, '#FCE0A4');
      } else {
        grad.addColorStop(0, '#0F142C'); grad.addColorStop(0.55, '#1E2752'); grad.addColorStop(1, '#394378');
      }
      g.fillStyle = grad; g.fillRect(0, 0, 512, 256);

      if (mode === 'night') {
        for (var si = 0; si < 52; si++) {
          g.fillStyle = rng() > 0.3 ? 'rgba(255,248,214,0.82)' : 'rgba(186,230,253,0.70)';
          g.fillRect(rng()*508, rng()*118, 2, 2);
        }
      } else {
        g.fillStyle = mode === 'sunset' ? 'rgba(255,228,196,0.58)' : 'rgba(255,253,248,0.82)';
        var cloudXs = [48, 175, 310, 430];
        for (var ci = 0; ci < cloudXs.length; ci++) {
          g.beginPath();
          g.ellipse(cloudXs[ci], 56 + (ci % 2) * 18, 36, 12, 0, 0, Math.PI * 2);
          g.ellipse(cloudXs[ci] + 22, 52 + (ci % 2) * 18, 24, 10, 0, 0, Math.PI * 2);
          g.fill();
        }
      }

      var bCol = mode === 'night' ? '#1B254A' : (mode === 'sunset' ? '#584878' : '#7BA4CE');
      var bHi  = mode === 'night' ? '#2F4378' : (mode === 'sunset' ? '#7E6BA0' : '#9DC2E6');
      var winC = mode === 'night' ? '#FFE18A' : (mode === 'sunset' ? '#FFD699' : '#E0F2FE');
      var blds = [
        [18,128,26],[52,108,24],[86,134,30],[124,96,26],[184,116,28],[220,132,26],
        [278,104,30],[316,126,26],[372,112,28],[442,102,26],[474,124,28]
      ];
      for (var bi = 0; bi < blds.length; bi++) {
        var b = blds[bi];
        g.fillStyle = bCol; g.fillRect(b[0], b[1], b[2], 226 - b[1]);
        g.fillStyle = bHi;  g.fillRect(b[0], b[1], 5, 226 - b[1]);
        if (mode !== 'day') {
          g.fillStyle = winC;
          for (var wy = b[1] + 8; wy < 214; wy += 9) {
            for (var wx = b[0] + 6; wx < b[0] + b[2] - 4; wx += 6) {
              if (rng() > 0.36) g.fillRect(wx, wy, 3, 4);
            }
          }
        }
      }

      // Bitexco Financial Tower (x = 154)
      g.fillStyle = bCol;
      g.beginPath(); g.moveTo(154, 226); g.lineTo(159, 64); g.lineTo(171, 60); g.lineTo(178, 226); g.closePath(); g.fill();
      g.fillStyle = bHi; g.fillRect(160, 68, 5, 154);
      g.fillStyle = '#D7E5F5'; g.fillRect(171, 96, 16, 4);
      g.fillStyle = '#E0452B'; g.fillRect(164, 54, 3, 6);

      // Landmark 81 (x = 398)
      var lmTiers = [[0,118,6],[5,92,6],[10,64,7],[16,36,8],[23,66,7],[29,96,6],[34,124,5]];
      for (var li = 0; li < lmTiers.length; li++) {
        var lt = lmTiers[li];
        g.fillStyle = bCol; g.fillRect(398 + lt[0], lt[1], lt[2], 226 - lt[1]);
        g.fillStyle = bHi;  g.fillRect(398 + lt[0], lt[1], 2, 226 - lt[1]);
      }
      g.fillStyle = '#FFF6DA'; g.fillRect(417, 18, 2, 18);
      if (mode !== 'day') {
        g.fillStyle = winC;
        for (var lwy = 46; lwy < 210; lwy += 8) g.fillRect(410, lwy, 16, 2);
      }

      // Rặng cây bờ Thủ Thiêm sát đường chân trời che mép mặt sông
      g.fillStyle = mode === 'night' ? '#142921' : (mode === 'sunset' ? '#2A452A' : '#2E6A34');
      g.fillRect(0, 218, 512, 38);
      for (var tx = 6; tx < 512; tx += 22) {
        g.beginPath(); g.arc(tx, 218, 12 + (tx % 5), 0, Math.PI * 2); g.fill();
      }
      webgl.registerTextureCanvas(texName, c, false);
    }
    buildSkylineTex('day', 'skylineDay');
    buildSkylineTex('sunset', 'skylineSunset');
    buildSkylineTex('night', 'skylineNight');
  })();

  // 12. Bộ Sprite Chú Heo Mascot Pixel Art 24×20 Đồng Bộ 100% Toàn App (QĐ 248, NEAREST 1:1!)
  buildPigPixelBillboardTextures(webgl);
}

function buildPigPixelBillboardTextures(webgl) {
  if (typeof buildPigBillboardTextures === 'function') {
    buildPigBillboardTextures(webgl);
  }
}

/* ==================== 2. FALLBACK CANVAS2D CHO HEADLESS SMOKE TEST ==================== */
function drawClippedWallQuad(ctx, cam, pts, bgCol, borderCol, lineW, drawInner) {
  if (!ctx || typeof projectPoint3D !== 'function') return;
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

function drawCafeFloor1Walls3D(ctx, cam) {
  drawClippedWallQuad(
    ctx, cam,
    [[6.93, 3.18, 8.60], [6.93, 3.18, 5.20], [6.93, 1.72, 5.20], [6.93, 1.72, 8.60]],
    '#2F3D21', '#EAB308', 2.2,
    function(cx, cy, bw, bh, safeW) {
      ctx.font = 'bold ' + Math.max(5, Math.min(12, Math.round(bh * 0.15))) + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CÀ PHÊ SÀI GÒN · THỰC ĐƠN', cx, cy - bh * 0.24, safeW);
      ctx.fillStyle = '#FFF7DF';
      ctx.fillText('CÀ PHÊ CỐT DỪA 35K', cx, cy + bh * 0.08, safeW);
    }
  );
  drawClippedWallQuad(
    ctx, cam,
    [[-4.8, 2.8, 16.12], [-1.2, 2.8, 16.12], [-1.2, 1.6, 16.12], [-4.8, 1.6, 16.12]],
    '#5C341D', '#FACC15', 2.2,
    function(cx, cy, bw, bh, safeW) {
      ctx.font = 'bold ' + Math.max(5, Math.min(11, Math.round(bh * 0.22))) + 'px monospace';
      ctx.fillStyle = '#FFFBEB'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ĐỘC LẬP · TỰ DO · HẠNH PHÚC', cx, cy, safeW);
    }
  );
}

function drawCafeFloor2Walls3D(ctx, cam) {
  drawClippedWallQuad(
    ctx, cam,
    [[-6.93, 5.95, 3.6], [-6.93, 5.95, 8.0], [-6.93, 4.65, 8.0], [-6.93, 4.65, 3.6]],
    '#4F6335', '#FACC15', 2.0,
    function(cx, cy, bw, bh, safeW) {
      ctx.font = 'bold ' + Math.max(5, Math.min(11, Math.round(bh * 0.22))) + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CÀ PHÊ SÀI GÒN · LẦU 2', cx, cy, safeW);
    }
  );
}

function drawCafeVnCultureWalls3D(ctx, cam, floor) {
  if (floor === 2) drawCafeFloor2Walls3D(ctx, cam);
  else drawCafeFloor1Walls3D(ctx, cam);
}
`;
}
