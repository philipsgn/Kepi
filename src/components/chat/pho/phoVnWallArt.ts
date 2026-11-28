/**
 * Bộ Sưu Tập Mỹ Thuật Pixel Art Văn Hóa Việt Nam Trên 3 Bức Tường Quán Phở (Quyết định 240–241 & 250)
 * - WebGL 3D Procedural Textures (`buildPhoProceduralTextures`): gạch bông Indochine, tường vàng 90s, gỗ lim,
 *   biển PHỞ BÒ GIA TRUYỀN 1990 + Câu Đối Đỏ, THỰC ĐƠN PHỞ Đỏ Son, Hoa Sen, Xích Lô, Áo Dài Hoa Sen,
 *   Cờ Đỏ Sao Vàng & Hoa Mai, Nón Lá & Đàn Nguyệt, Quang Gánh & Saigon Skyline, cửa kính mờ + Sprite Heo 24×20.
 * - Giữ nguyên 100% hàm Canvas2D fallback (`drawPhoVnCultureWalls3D`, `drawPhoMenuBoardArt`, ...) cho Headless Smoke Test.
 */
export function buildPhoVnWallArtScript(): string {
  return String.raw`
/* ==================== 0. BỘ SINH TEXTURE THỦ TỤC WEBGL 3D QUÁN PHỞ 1990S (QĐ 250) ==================== */
function phoSeedRng(seed) {
  var s = seed | 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPhoProceduralTextures(webgl) {
  if (!webgl || typeof document === 'undefined') return;
  function mkCanvas(w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; return c;
  }

  // 1. Sàn gạch bông Indochine (phoTile) & Sàn gạch bếp (phoKitchenTile)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = phoSeedRng(19901);
    g.fillStyle = '#E8D5B0'; g.fillRect(0, 0, 256, 256);
    for (var ty = 0; ty < 256; ty += 128) {
      for (var tx = 0; tx < 256; tx += 128) {
        var even = ((tx / 128 + ty / 128) % 2 === 0);
        g.fillStyle = even ? '#F4E6C8' : '#E0CCA6';
        g.fillRect(tx + 2, ty + 2, 124, 124);
        g.strokeStyle = 'rgba(74,44,26,0.22)'; g.lineWidth = 3;
        g.strokeRect(tx + 2, ty + 2, 124, 124);
        var cx = tx + 64, cy = ty + 64;
        if (even) {
          g.fillStyle = '#2F6F5B';
          for (var k = 0; k < 4; k++) {
            g.save(); g.translate(cx, cy); g.rotate(k * Math.PI / 2);
            g.beginPath(); g.ellipse(0, -24, 10, 20, 0, 0, Math.PI * 2); g.fill();
            g.restore();
          }
          g.fillStyle = '#B87B3E';
          for (var d = 0; d < 4; d++) {
            g.save(); g.translate(cx, cy); g.rotate(d * Math.PI / 2 + Math.PI / 4);
            g.beginPath(); g.ellipse(0, -18, 7, 14, 0, 0, Math.PI * 2); g.fill();
            g.restore();
          }
          g.fillStyle = '#F8EED8'; g.beginPath(); g.arc(cx, cy, 9, 0, Math.PI * 2); g.fill();
        } else {
          g.strokeStyle = 'rgba(47,111,91,0.35)'; g.lineWidth = 2;
          g.strokeRect(tx + 18, ty + 18, 92, 92);
        }
      }
    }
    for (var i = 0; i < 120; i++) {
      g.fillStyle = 'rgba(74,44,26,0.06)';
      g.beginPath(); g.arc(rng() * 256, rng() * 256, 3 + rng() * 10, 0, Math.PI * 2); g.fill();
    }
    webgl.registerTextureCanvas('phoTile', c, true);

    var kc = mkCanvas(256, 256), kg = kc.getContext('2d');
    kg.fillStyle = '#CBD5E1'; kg.fillRect(0, 0, 256, 256);
    for (var ky = 0; ky < 256; ky += 64) {
      for (var kx = 0; kx < 256; kx += 64) {
        kg.fillStyle = ((kx / 64 + ky / 64) % 2 === 0) ? '#DCE4EE' : '#CBD5E1';
        kg.fillRect(kx + 1, ky + 1, 62, 62);
      }
    }
    webgl.registerTextureCanvas('phoKitchenTile', kc, true);
  })();

  // 2. Tường vàng 90s (phoWall)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = phoSeedRng(19902);
    g.fillStyle = '#DFAA3E'; g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 220; i++) {
      g.fillStyle = rng() > 0.5 ? 'rgba(244,205,112,0.16)' : 'rgba(178,124,28,0.15)';
      g.beginPath(); g.arc(rng() * 256, rng() * 256, 8 + rng() * 34, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = 'rgba(92,52,29,0.14)'; g.lineWidth = 1;
    for (var k = 0; k < 22; k++) {
      var x = rng() * 256, y = rng() * 256;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rng() - 0.5) * 26, y + rng() * 26); g.stroke();
    }
    webgl.registerTextureCanvas('phoWall', c, true);
  })();

  // 3. Gỗ lim (phoTimber)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = phoSeedRng(19903);
    g.fillStyle = '#4D2E1B'; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 256; y += 3) {
      g.fillStyle = (y % 6 === 0) ? 'rgba(32,16,8,0.34)' : 'rgba(116,74,44,0.22)';
      g.fillRect(0, y, 256, 2);
    }
    for (var p = 0; p < 256; p += 64) {
      g.fillStyle = 'rgba(20,10,4,0.42)'; g.fillRect(0, p, 256, 2);
    }
    for (var m = 0; m < 10; m++) {
      g.strokeStyle = 'rgba(28,14,6,0.24)'; g.beginPath();
      g.ellipse(rng() * 256, rng() * 256, 20, 4, 0, 0, Math.PI * 2); g.stroke();
    }
    webgl.registerTextureCanvas('phoTimber', c, true);
  })();

  // 4. Biển PHỞ BÒ GIA TRUYỀN 1990 + Câu Đối Đỏ (phoSign1990, phoCouplet, phoWelcomeSign)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#4A2C1A'; g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#991B1B'; g.fillRect(10, 10, 492, 236);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 6; g.strokeRect(18, 18, 476, 220);
    // Hoa văn góc chữ Triện vàng
    g.fillStyle = '#FACC15';
    g.fillRect(26, 26, 18, 6); g.fillRect(26, 26, 6, 18);
    g.fillRect(468, 26, 18, 6); g.fillRect(480, 26, 6, 18);
    g.fillRect(26, 224, 18, 6); g.fillRect(26, 212, 6, 18);
    g.fillRect(468, 224, 18, 6); g.fillRect(480, 212, 6, 18);
    // Dải câu đối đỏ mini 2 bên & chữ chính
    g.fillStyle = '#7F1D1D'; g.fillRect(32, 42, 40, 172); g.fillRect(440, 42, 40, 172);
    g.strokeStyle = '#FACC15'; g.lineWidth = 2; g.strokeRect(32, 42, 40, 172); g.strokeRect(440, 42, 40, 172);
    g.fillStyle = '#FACC15'; g.font = 'bold 34px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('PHỞ BÒ', 256, 86);
    g.fillText('GIA TRUYỀN 1990', 256, 148);
    g.fillStyle = '#FFF7DF'; g.font = 'bold 18px serif';
    g.fillText('★ HƯƠNG VỊ CỔ TRUYỀN SÀI GÒN ★', 256, 200);
    webgl.registerTextureCanvas('phoSign1990', c, false);

    var cp = mkCanvas(128, 256), cg = cp.getContext('2d');
    cg.fillStyle = '#B91C1C'; cg.fillRect(0, 0, 128, 256);
    cg.strokeStyle = '#F4B93B'; cg.lineWidth = 5; cg.strokeRect(8, 8, 112, 240);
    cg.fillStyle = '#FACC15'; cg.font = 'bold 24px serif'; cg.textAlign = 'center';
    var chars = ['HƯƠNG', 'VỊ', 'PHỞ', 'XƯA'];
    for (var ci = 0; ci < chars.length; ci++) cg.fillText(chars[ci], 64, 54 + ci * 50);
    webgl.registerTextureCanvas('phoCouplet', cp, false);

    var w = mkCanvas(512, 128), wg = w.getContext('2d');
    wg.fillStyle = '#7F1D1D'; wg.fillRect(0, 0, 512, 128);
    wg.fillStyle = '#991B1B'; wg.fillRect(10, 10, 492, 108);
    wg.strokeStyle = '#F4B93B'; wg.lineWidth = 5; wg.strokeRect(14, 14, 484, 100);
    wg.fillStyle = '#FACC15'; wg.font = 'bold 32px serif'; wg.textAlign = 'center'; wg.textBaseline = 'middle';
    wg.fillText('KÍNH CHÀO QUÝ KHÁCH', 256, 66);
    webgl.registerTextureCanvas('phoWelcomeSign', w, false);
  })();

  // 5. THỰC ĐƠN PHỞ Đỏ Son Viền Gỗ Gụ (phoMenu90)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#4A2C1A'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#991B1B'; g.fillRect(12, 12, 232, 232);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 4; g.strokeRect(18, 18, 220, 220);
    // Bát phở mini
    g.fillStyle = '#FFFBF1'; g.strokeStyle = '#F4B93B'; g.lineWidth = 2;
    g.beginPath(); g.arc(128, 52, 18, 0, Math.PI, false); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(255,251,241,0.8)';
    g.beginPath(); g.moveTo(120, 44); g.lineTo(124, 30); g.moveTo(134, 44); g.lineTo(138, 30); g.stroke();
    g.fillStyle = '#FDE047'; g.font = 'bold 21px serif'; g.textAlign = 'center';
    g.fillText('THỰC ĐƠN PHỞ', 128, 88);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(32, 100); g.lineTo(224, 100); g.stroke();
    var items = [['TÁI', '15K'], ['NẠM', '15K'], ['GẦU', '18K'], ['ĐẶC BIỆT', '25K']];
    g.font = 'bold 19px monospace';
    for (var i = 0; i < items.length; i++) {
      var ry = 130 + i * 28;
      g.fillStyle = '#FFF7DF'; g.textAlign = 'left'; g.fillText(items[i][0], 34, ry);
      g.fillStyle = '#FACC15'; g.textAlign = 'right'; g.fillText(items[i][1], 222, ry);
    }
    webgl.registerTextureCanvas('phoMenu90', c, false);
  })();

  // 6. Tranh Hoa Sen (phoLotus)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#4A2C1A'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#FAF0D7'; g.fillRect(14, 14, 228, 228);
    g.strokeStyle = '#B45309'; g.lineWidth = 3; g.strokeRect(20, 20, 216, 216);
    g.fillStyle = '#15803D';
    g.beginPath(); g.ellipse(86, 178, 42, 18, -0.25, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(170, 178, 42, 18, 0.25, 0, Math.PI * 2); g.fill();
    var petals = [[-42, 8, -0.55, '#EC4899'], [42, 8, 0.55, '#EC4899'], [-24, -12, -0.32, '#F472B6'], [24, -12, 0.32, '#F472B6'], [0, -24, 0, '#FBCFE8']];
    for (var i = 0; i < petals.length; i++) {
      g.save(); g.translate(128 + petals[i][0], 132 + petals[i][1]); g.rotate(petals[i][2]);
      g.fillStyle = petals[i][3]; g.strokeStyle = '#9D174D'; g.lineWidth = 2;
      g.beginPath(); g.ellipse(0, 0, 22, 48, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.restore();
    }
    g.fillStyle = '#FACC15'; g.beginPath(); g.arc(128, 134, 16, 0, Math.PI * 2); g.fill();
    webgl.registerTextureCanvas('phoLotus', c, false);
  })();

  // 7. Tranh Xích Lô (phoCyclo)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#4A2C1A'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#FAF0D7'; g.fillRect(14, 14, 228, 228);
    g.strokeStyle = '#991B1B'; g.lineWidth = 3; g.strokeRect(20, 20, 216, 216);
    g.strokeStyle = '#1E293B'; g.lineWidth = 6;
    g.beginPath(); g.arc(82, 168, 28, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(174, 168, 28, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#5C341D';
    g.beginPath(); g.moveTo(54, 108); g.quadraticCurveTo(86, 56, 132, 92); g.lineTo(118, 120); g.closePath(); g.fill();
    g.fillStyle = '#DC2626'; g.fillRect(62, 114, 68, 42);
    g.fillStyle = '#FACC15'; g.fillRect(70, 122, 48, 26);
    g.strokeStyle = '#B45309'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(130, 146); g.lineTo(174, 168); g.lineTo(158, 112); g.lineTo(132, 106); g.stroke();
    webgl.registerTextureCanvas('phoCyclo', c, false);
  })();

  // 8. Tranh Áo Dài Hoa Sen (phoAoDai)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#4A2C1A'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#FAF0D7'; g.fillRect(14, 14, 228, 228);
    g.strokeStyle = '#15803D'; g.lineWidth = 3; g.strokeRect(20, 20, 216, 216);
    g.fillStyle = '#CBD5C0'; g.fillRect(98, 148, 60, 54);
    g.fillStyle = '#FFFBF1'; g.strokeStyle = '#8F6E42'; g.lineWidth = 3;
    g.beginPath();
    g.moveTo(110, 44); g.lineTo(146, 44); g.lineTo(182, 88); g.lineTo(164, 104);
    g.lineTo(150, 82); g.lineTo(166, 194); g.lineTo(90, 194); g.lineTo(106, 82);
    g.lineTo(92, 104); g.lineTo(74, 88); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#15803D'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(124, 84); g.quadraticCurveTo(140, 128, 122, 178); g.stroke();
    g.fillStyle = '#F472B6';
    g.beginPath(); g.arc(130, 104, 10, 0, Math.PI * 2); g.arc(136, 144, 12, 0, Math.PI * 2); g.fill();
    webgl.registerTextureCanvas('phoAoDai', c, false);
  })();

  // 9. Tranh Cờ Đỏ Sao Vàng & Hoa Mai (phoFlagMai)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#4A2C1A'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#FAF0D7'; g.fillRect(14, 14, 228, 228);
    g.fillStyle = '#DA251D'; g.fillRect(34, 34, 152, 98);
    g.fillStyle = '#FFFF00'; g.beginPath();
    for (var i = 0; i < 10; i++) {
      var r = (i % 2 === 0 ? 32 : 13);
      var ang = -Math.PI / 2 + i * Math.PI / 5;
      var px = 110 + Math.cos(ang) * r, py = 83 + Math.sin(ang) * r;
      if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.closePath(); g.fill();
    g.fillStyle = '#E8CF9E'; g.strokeStyle = '#7C4F2B'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(74, 152); g.lineTo(34, 206); g.lineTo(114, 206); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#5C341D'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(138, 218); g.quadraticCurveTo(180, 168, 222, 118); g.stroke();
    var mais = [[164, 184], [190, 154], [214, 126], [174, 142], [204, 174]];
    g.fillStyle = '#FACC15';
    for (var mi = 0; mi < mais.length; mi++) {
      g.beginPath(); g.arc(mais[mi][0], mais[mi][1], 11, 0, Math.PI * 2); g.fill();
    }
    webgl.registerTextureCanvas('phoFlagMai', c, false);
  })();

  // 10. Nón Lá & Đàn Nguyệt (phoNonLa) & Kệ Gốm Bát Tràng (phoPotteryArt)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#DFAA3E'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#E8CF9E'; g.strokeStyle = '#7C4F2B'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(92, 42); g.lineTo(24, 118); g.lineTo(160, 118); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#15803D'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(56, 118); g.quadraticCurveTo(92, 162, 128, 118); g.stroke();
    g.strokeStyle = '#4A2C1A'; g.lineWidth = 7;
    g.beginPath(); g.moveTo(192, 34); g.lineTo(192, 164); g.stroke();
    g.fillStyle = '#F3DFC1'; g.strokeStyle = '#5C341D'; g.lineWidth = 4;
    g.beginPath(); g.arc(192, 184, 38, 0, Math.PI * 2); g.fill(); g.stroke();
    g.strokeStyle = '#C6833C'; g.lineWidth = 9;
    g.beginPath(); g.moveTo(34, 214); g.lineTo(148, 168); g.stroke();
    webgl.registerTextureCanvas('phoNonLa', c, false);

    var p = mkCanvas(256, 256), pg = p.getContext('2d');
    pg.fillStyle = '#D99B26'; pg.fillRect(0, 0, 256, 256);
    pg.fillStyle = '#4A2C1A'; pg.fillRect(14, 184, 228, 22);
    pg.fillStyle = '#FFFFFF'; pg.strokeStyle = '#1E3A8A'; pg.lineWidth = 4;
    pg.beginPath(); pg.ellipse(64, 134, 30, 44, 0, 0, Math.PI * 2); pg.fill(); pg.stroke();
    pg.fillStyle = '#1D4ED8'; pg.beginPath(); pg.arc(64, 134, 14, 0, Math.PI * 2); pg.fill();
    pg.fillStyle = '#A65432'; pg.strokeStyle = '#5C2812';
    pg.beginPath(); pg.ellipse(134, 140, 28, 40, 0, 0, Math.PI * 2); pg.fill(); pg.stroke();
    pg.fillStyle = '#B91C1C'; pg.strokeStyle = '#7F1D1D';
    pg.beginPath(); pg.ellipse(198, 156, 26, 22, 0, 0, Math.PI * 2); pg.fill(); pg.stroke();
    pg.fillStyle = '#FACC15'; pg.beginPath(); pg.arc(198, 152, 7, 0, Math.PI * 2); pg.fill();
    webgl.registerTextureCanvas('phoPotteryArt', p, false);
  })();

  // 11. Quang Gánh & Saigon Skyline (phoSkyline, phoQuangGanh)
  (function() {
    var q = mkCanvas(256, 256), qg = q.getContext('2d');
    qg.fillStyle = '#4A2C1A'; qg.fillRect(0, 0, 256, 256);
    qg.fillStyle = '#FAF0D7'; qg.fillRect(14, 14, 228, 228);
    qg.strokeStyle = '#92400E'; qg.lineWidth = 8;
    qg.beginPath(); qg.moveTo(36, 94); qg.quadraticCurveTo(128, 66, 220, 94); qg.stroke();
    qg.strokeStyle = '#B45309'; qg.lineWidth = 3;
    qg.beginPath(); qg.moveTo(64, 86); qg.lineTo(42, 166); qg.moveTo(64, 86); qg.lineTo(86, 166); qg.stroke();
    qg.beginPath(); qg.moveTo(192, 86); qg.lineTo(170, 166); qg.moveTo(192, 86); qg.lineTo(214, 166); qg.stroke();
    qg.fillStyle = '#C6833C'; qg.strokeStyle = '#78350F'; qg.lineWidth = 3;
    qg.beginPath(); qg.ellipse(64, 178, 34, 22, 0, 0, Math.PI * 2); qg.fill(); qg.stroke();
    qg.beginPath(); qg.ellipse(192, 178, 34, 22, 0, 0, Math.PI * 2); qg.fill(); qg.stroke();
    webgl.registerTextureCanvas('phoQuangGanh', q, false);

    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#4A2C1A'; g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#FAF0D7'; g.fillRect(14, 14, 484, 228);
    // Saigon Skyline (Bitexco + Nhà Thờ Đức Bà)
    g.fillStyle = '#BAE6FD'; g.fillRect(28, 36, 260, 182);
    g.fillStyle = '#38BDF8'; g.fillRect(68, 56, 56, 142);
    g.fillStyle = '#B83224'; g.fillRect(156, 98, 92, 100);
    g.fillStyle = '#22C55E'; g.fillRect(28, 196, 260, 22);
    // Đồng hồ quả lắc Vintage 90s bên phải
    g.fillStyle = '#5C341D'; g.strokeStyle = '#2B180E'; g.lineWidth = 4;
    g.fillRect(326, 28, 144, 200); g.strokeRect(326, 28, 144, 200);
    g.fillStyle = '#FFFBF1'; g.beginPath(); g.arc(398, 86, 42, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#2B2118'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(398, 86); g.lineTo(398, 60); g.moveTo(398, 86); g.lineTo(420, 96); g.stroke();
    g.fillStyle = '#2B180E'; g.fillRect(354, 140, 88, 72);
    webgl.registerTextureCanvas('phoSkyline', c, false);
  })();

  // 12. Cửa gỗ lá sách kính mờ (phoDoorGlass)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#5C341D'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#2B180E'; g.lineWidth = 8; g.strokeRect(4, 4, 248, 248);
    // Ô kính mờ sương nửa trên có chia đố gỗ
    g.fillStyle = '#F7E7C4'; g.fillRect(24, 20, 208, 128);
    g.strokeStyle = '#4A2C1A'; g.lineWidth = 6; g.strokeRect(24, 20, 208, 128);
    g.fillStyle = '#4A2C1A'; g.fillRect(24, 80, 208, 8); g.fillRect(124, 20, 8, 128);
    // Lá sách gỗ nửa dưới
    g.fillStyle = '#4A2C1A'; g.fillRect(24, 162, 208, 76);
    g.fillStyle = '#3B2314';
    for (var y = 170; y <= 228; y += 14) g.fillRect(30, y, 196, 6);
    // Tay nắm đồng vàng
    g.fillStyle = '#F4B93B'; g.fillRect(204, 134, 12, 26);
    webgl.registerTextureCanvas('phoDoorGlass', c, false);
  })();

  // 13. Bộ Sprite Chú Heo 24×20 gl.NEAREST dùng chung
  if (typeof buildPigBillboardTextures === 'function') {
    buildPigBillboardTextures(webgl);
  }
}

/* ==================== 1. HELPER CHIẾU MỸ THUẬT TƯỜNG 3D CÓ CO GIÃN PHỐI CẢNH ==================== */
function wallArtAnchor(cam, wx, wy, wz, wallAxis) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz < 0.5 || pr.cz > 22) return null;
  var dx = cam.pos.x - wx, dz = cam.pos.z - wz;
  var d2 = Math.hypot(dx, dz) || 1;
  var cosA = wallAxis === 'x' ? Math.abs(dx) / d2 : Math.abs(dz) / d2;
  if (cosA < 0.16) return null; // Góc quá hẹp sát tường -> ẩn chi tiết bên trong để không bị bẹp
  return {
    sx: Math.round(pr.sx),
    sy: Math.round(pr.sy),
    u: Math.max(0.35, Math.min(2.6, pr.scale / 42)),
    fx: Math.max(0.26, cosA)
  };
}

function drawWallFriezeBorders3D(ctx, cam) {
  // Diềm chỉ hoa văn cổ truyền chạy dọc đầu tường (Y=3.48..3.58) & trên ốp gỗ chân tường (Y=0.95..1.03) cả 3 tường!
  var walls = [
    [[-5.95, 3.48, 0.2], [-5.95, 3.48, 14.6], [-5.95, 3.58, 14.6], [-5.95, 3.58, 0.2]],
    [[5.95, 3.48, 14.6], [5.95, 3.48, 0.2], [5.95, 3.58, 0.2], [5.95, 3.58, 14.6]],
    [[-5.95, 3.48, 14.74], [5.95, 3.48, 14.74], [5.95, 3.58, 14.74], [-5.95, 3.58, 14.74]],
    [[-5.95, 0.96, 0.2], [-5.95, 0.96, 14.6], [-5.95, 1.04, 14.6], [-5.95, 1.04, 0.2]],
    [[5.95, 0.96, 14.6], [5.95, 0.96, 0.2], [5.95, 1.04, 0.2], [5.95, 1.04, 14.6]]
  ];
  for (var i = 0; i < walls.length; i++) {
    drawPoly3D(ctx, cam, walls[i], '#991B1B', '#F4B93B', 1);
  }
}

/* ==================== 2. TÁC PHẨM TƯỜNG TRÁI (BẢNG THỰC ĐƠN PHỞ 90S, HOA SEN, XÍCH LÔ, NÓN LÁ & ĐÀN NGUYỆT) ==================== */
function drawPhoMenuBoardArt(ctx, cam) {
  // Bảng Thực Đơn Đỏ Son Viền Gỗ Gụ Chữ Vàng Vintage 90s treo dọc cân hàng với tranh Hoa Sen (Y=1.45..2.75, Z=0.50..1.62)
  drawPoly3D(ctx, cam, [[-5.93,1.45,0.50],[-5.93,1.45,1.62],[-5.93,2.75,1.62],[-5.93,2.75,0.50]], '#8B1A1A', '#4A2C1A', 2.4);
  drawPoly3D(ctx, cam, [[-5.92,1.52,0.57],[-5.92,1.52,1.55],[-5.92,2.68,1.55],[-5.92,2.68,0.57]], '#991B1B', '#F4B93B', 1.1);
  // Chiếu đúng 4 góc mặt trong để clip 100% chống tràn chữ ở mọi góc xoay 360° & khoảng cách
  var pTL = projectPoint3D(cam, -5.91, 2.66, 0.59);
  var pTR = projectPoint3D(cam, -5.91, 2.66, 1.53);
  var pBR = projectPoint3D(cam, -5.91, 1.54, 1.53);
  var pBL = projectPoint3D(cam, -5.91, 1.54, 0.59);
  if (!pTL || !pTR || !pBR || !pBL) return;
  if (pTL.cz < 0.5 || pTR.cz < 0.5 || pBR.cz < 0.5 || pBL.cz < 0.5) return;
  var bw = Math.hypot(pTR.sx - pTL.sx, pTR.sy - pTL.sy);
  var bh = Math.hypot(pBL.sx - pTL.sx, pBL.sy - pTL.sy);
  if (bw < 16 || bh < 22) return;
  var cx = (pTL.sx + pTR.sx + pBR.sx + pBL.sx) * 0.25;
  var cy = (pTL.sy + pTR.sy + pBR.sy + pBL.sy) * 0.25;
  var safeW = Math.max(10, bw * 0.82);

  ctx.save();
  // Khóa vùng vẽ tuyệt đối bên trong viền vàng của bảng
  ctx.beginPath();
  ctx.moveTo(pTL.sx, pTL.sy); ctx.lineTo(pTR.sx, pTR.sy);
  ctx.lineTo(pBR.sx, pBR.sy); ctx.lineTo(pBL.sx, pBL.sy);
  ctx.closePath(); ctx.clip();

  // Họa tiết Bát Phở mini bốc khói trên đầu bảng
  var bowlR = Math.max(2.5, Math.min(bw * 0.16, bh * 0.08));
  var bowlY = cy - bh * 0.34;
  ctx.fillStyle = '#FFFBF1'; ctx.strokeStyle = '#F4B93B'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(cx, bowlY, bowlR, 0, Math.PI, false); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,251,241,0.75)'; ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - bowlR * 0.4, bowlY - 1.5); ctx.lineTo(cx - bowlR * 0.2, bowlY - bowlR * 0.9);
  ctx.moveTo(cx + bowlR * 0.3, bowlY - 1.5); ctx.lineTo(cx + bowlR * 0.5, bowlY - bowlR * 0.9);
  ctx.stroke();

  // Tiêu đề 'THỰC ĐƠN PHỞ' chữ vàng ánh kim (khóa maxWidth = safeW -> 0% tràn viền)
  var titlePx = Math.max(5, Math.min(11, Math.round(bh * 0.115)));
  ctx.font = 'bold ' + titlePx + 'px monospace';
  ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('THỰC ĐƠN PHỞ', cx, cy - bh * 0.17, safeW);

  // Đường chỉ vàng ngăn cách tiêu đề và danh sách món
  ctx.strokeStyle = '#F4B93B'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(cx - safeW * 0.46, cy - bh * 0.08); ctx.lineTo(cx + safeW * 0.46, cy - bh * 0.08); ctx.stroke();

  // 4 món Phở kinh điển Vintage 90s căn 2 cột gọn gàng
  var items = [['TÁI', '15K'], ['NẠM', '15K'], ['GẦU', '18K'], ['ĐẶC BIỆT', '25K']];
  var rowPx = Math.max(4, Math.min(9, Math.round(bh * 0.092)));
  ctx.font = 'bold ' + rowPx + 'px monospace';
  var leftX = cx - safeW * 0.46;
  var rightX = cx + safeW * 0.46;
  for (var i = 0; i < items.length; i++) {
    var ry = cy + bh * (0.04 + i * 0.125);
    ctx.fillStyle = '#FFF7DF'; ctx.textAlign = 'left';
    ctx.fillText(items[i][0], leftX, ry, safeW * 0.62);
    ctx.fillStyle = '#FACC15'; ctx.textAlign = 'right';
    ctx.fillText(items[i][1], rightX, ry, safeW * 0.32);
  }
  ctx.restore();
}

function drawLotusArt(ctx, a) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // Lá sen xanh ngọc 2 bên
  ctx.fillStyle = '#15803D';
  ctx.beginPath(); ctx.ellipse(-10*u, 8*u, 9*u, 4*u, -0.25, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(10*u, 8*u, 9*u, 4*u, 0.25, 0, Math.PI*2); ctx.fill();
  // Đóa Hoa Sen Hồng nhiều tầng cánh điệu nghệ (1:1 Moodboard!)
  var petals = [
    [-10, 2, -0.55, '#EC4899'], [10, 2, 0.55, '#EC4899'],
    [-6, -2, -0.32, '#F472B6'], [6, -2, 0.32, '#F472B6'],
    [0, -5, 0, '#FBCFE8']
  ];
  for (var i = 0; i < petals.length; i++) {
    ctx.save(); ctx.translate(petals[i][0]*u, petals[i][1]*u); ctx.rotate(petals[i][2]);
    ctx.fillStyle = petals[i][3]; ctx.strokeStyle = '#9D174D'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(0, 0, 4.6*u, 9*u, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // Nhụy sen vàng rực rỡ
  ctx.fillStyle = '#FACC15';
  ctx.beginPath(); ctx.arc(0, 1*u, 3.6*u, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawCycloArt(ctx, a) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // 2 Bánh căm tròn xích lô Sài Gòn
  ctx.strokeStyle = '#1E293B'; ctx.lineWidth = Math.max(1.2, 1.6*u);
  ctx.beginPath(); ctx.arc(-9*u, 8*u, 5.5*u, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(10*u, 8*u, 5.5*u, 0, Math.PI*2); ctx.stroke();
  // Mui vải nâu cong cổ điển & khung ghế Xích Lô Đỏ-Vàng!
  ctx.fillStyle = '#5C341D';
  ctx.beginPath(); ctx.moveTo(-14*u, -4*u); ctx.quadraticCurveTo(-8*u, -13*u, 1*u, -7*u); ctx.lineTo(-2*u, -2*u); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#DC2626'; ctx.strokeStyle = '#7F1D1D'; ctx.lineWidth = 1;
  ctx.fillRect(-13*u, -2*u, 15*u, 9*u); ctx.strokeRect(-13*u, -2*u, 15*u, 9*u);
  ctx.fillStyle = '#FACC15'; ctx.fillRect(-11*u, -1*u, 10*u, 6*u); // Đệm vàng rực
  // Khung yên xe & tay lái phía sau
  ctx.strokeStyle = '#B45309'; ctx.lineWidth = Math.max(1.2, 1.5*u);
  ctx.beginPath(); ctx.moveTo(2*u, 5*u); ctx.lineTo(10*u, 8*u); ctx.lineTo(7*u, -3*u); ctx.lineTo(2*u, -4*u); ctx.stroke();
  ctx.restore();
}

function drawNonLaAndDanNguyetArt(ctx, a) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // Chiếc Nón Lá Việt Nam chóp nhọn có dây quai xanh lá thắt nơ (trên trái)
  ctx.fillStyle = '#E8CF9E'; ctx.strokeStyle = '#7C4F2B'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-6*u, -14*u); ctx.lineTo(-19*u, -2*u); ctx.lineTo(7*u, -2*u); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#15803D'; ctx.lineWidth = Math.max(1.2, 1.6*u);
  ctx.beginPath(); ctx.moveTo(-13*u, -2*u); ctx.quadraticCurveTo(-6*u, 5*u, 1*u, -2*u); ctx.stroke(); // Dây quai xanh
  // Cây Đàn Nguyệt mặt tròn cần dài & Sáo Trúc treo chéo (phải)
  ctx.strokeStyle = '#4A2C1A'; ctx.lineWidth = Math.max(1.4, 2*u);
  ctx.beginPath(); ctx.moveTo(10*u, -14*u); ctx.lineTo(10*u, 6*u); ctx.stroke();
  ctx.fillStyle = '#F3DFC1'; ctx.strokeStyle = '#5C341D'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(10*u, 9*u, 6.5*u, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // Sáo trúc nâu vàng treo chéo phía dưới
  ctx.strokeStyle = '#C6833C'; ctx.lineWidth = Math.max(1.5, 2.2*u);
  ctx.beginPath(); ctx.moveTo(-16*u, 12*u); ctx.lineTo(2*u, 4*u); ctx.stroke();
  ctx.restore();
}

/* ==================== 3. TÁC PHẨM TƯỜNG PHẢI (ÁO DÀI HOA SEN, CỜ ĐỎ SAO VÀNG & HOA MAI, KỆ GỐM BÁT TRÀNG) ==================== */
function drawAoDaiArt(ctx, a) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // Dáng tà Áo Dài trắng kem mềm mại + quần lụa xanh ngọc nhạt (1:1 Moodboard 2!)
  ctx.fillStyle = '#CBD5C0'; ctx.fillRect(-5*u, 4*u, 10*u, 9*u);
  ctx.fillStyle = '#FFFBF1'; ctx.strokeStyle = '#8F6E42'; ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(-3*u, -12*u); ctx.lineTo(3*u, -12*u); ctx.lineTo(9*u, -4*u); ctx.lineTo(6*u, -2*u);
  ctx.lineTo(4*u, -6*u); ctx.lineTo(6*u, 11*u); ctx.lineTo(-6*u, 11*u); ctx.lineTo(-4*u, -6*u);
  ctx.lineTo(-6*u, -2*u); ctx.lineTo(-9*u, -4*u); ctx.closePath(); ctx.fill(); ctx.stroke();
  // Nhành hoa sen hồng thêu dọc tà Áo Dài!
  ctx.strokeStyle = '#15803D'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-1*u, -6*u); ctx.quadraticCurveTo(2*u, 2*u, -1*u, 9*u); ctx.stroke();
  ctx.fillStyle = '#F472B6';
  ctx.beginPath(); ctx.arc(0, -3*u, 2*u, 0, Math.PI*2); ctx.arc(1*u, 4*u, 2.2*u, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawFlagAndApricotBlossomArt(ctx, a) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // Lá Cờ Đỏ Sao Vàng Việt Nam rực rỡ
  ctx.fillStyle = '#DA251D'; ctx.fillRect(-14*u, -11*u, 20*u, 13*u);
  ctx.fillStyle = '#FFFF00';
  ctx.beginPath();
  for (var i = 0; i < 10; i++) {
    var r = (i % 2 === 0 ? 4.5 : 1.9) * u;
    var ang = -Math.PI/2 + i * Math.PI / 5;
    var sx = -4*u + Math.cos(ang) * r, sy = -4.5*u + Math.sin(ang) * r;
    if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  }
  ctx.closePath(); ctx.fill();
  // Nón lá nhỏ đặt góc dưới trái & Cành Hoa Mai Vàng 5 cánh bên phải
  ctx.fillStyle = '#E8CF9E'; ctx.strokeStyle = '#7C4F2B'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(-8*u, 1*u); ctx.lineTo(-16*u, 9*u); ctx.lineTo(0, 9*u); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#5C341D'; ctx.lineWidth = Math.max(1.1, 1.4*u);
  ctx.beginPath(); ctx.moveTo(4*u, 11*u); ctx.quadraticCurveTo(10*u, 2*u, 14*u, -8*u); ctx.stroke();
  var maiPts = [[8, 4], [12, -1], [14, -7], [7, -2]];
  ctx.fillStyle = '#FACC15';
  for (var mi = 0; mi < maiPts.length; mi++) {
    ctx.beginPath(); ctx.arc(maiPts[mi][0]*u, maiPts[mi][1]*u, 2.5*u, 0, Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

function drawPotteryShelfArt(ctx, a) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // Thanh kệ gỗ lim trưng bày đồ thủ công mỹ nghệ Việt Nam
  ctx.fillStyle = '#4A2C1A'; ctx.fillRect(-19*u, 9*u, 38*u, 3.5*u);
  // 1. Bình Gốm Bát Tràng men xanh-trắng vẽ Hoa Sen (trái)
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#1E3A8A'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(-11*u, 1*u, 5.5*u, 7.5*u, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillRect(-13.5*u, -9*u, 5*u, 3.5*u); ctx.strokeRect(-13.5*u, -9*u, 5*u, 3.5*u);
  ctx.fillStyle = '#1D4ED8';
  ctx.beginPath(); ctx.arc(-11*u, 1*u, 2.6*u, 0, Math.PI*2); ctx.fill();
  // 2. Chum Sành nâu đất nung cổ điển (giữa)
  ctx.fillStyle = '#A65432'; ctx.strokeStyle = '#5C2812'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(1*u, 2*u, 5.2*u, 6.8*u, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#D98A36'; ctx.fillRect(-3.5*u, -2*u, 9*u, 1.6*u);
  // 3. Hộp Sơn Mài Đỏ vẽ hoa vàng (phải)
  ctx.fillStyle = '#B91C1C'; ctx.strokeStyle = '#7F1D1D';
  ctx.beginPath(); ctx.ellipse(12*u, 5*u, 5.2*u, 3.8*u, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(12*u, 4*u, 1.3*u, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/* ==================== 4. TÁC PHẨM TƯỜNG ĐỐI DIỆN BẾP (QUANG GÁNH PHỞ, SAIGON SKYLINE, ĐỒNG HỒ 90S) ==================== */
function drawQuangGanhPhoArt(ctx, a) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // Đòn gánh tre uốn cong cổ truyền & 2 quang thúng mây tre đan (1:1 Moodboard 2!)
  ctx.strokeStyle = '#92400E'; ctx.lineWidth = Math.max(1.5, 2.2*u);
  ctx.beginPath(); ctx.moveTo(-16*u, -6*u); ctx.quadraticCurveTo(0, -10*u, 16*u, -6*u); ctx.stroke();
  ctx.strokeStyle = '#B45309'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-12*u, -7*u); ctx.lineTo(-16*u, 5*u); ctx.moveTo(-12*u, -7*u); ctx.lineTo(-8*u, 5*u); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(12*u, -7*u); ctx.lineTo(8*u, 5*u); ctx.moveTo(12*u, -7*u); ctx.lineTo(16*u, 5*u); ctx.stroke();
  ctx.fillStyle = '#C6833C'; ctx.strokeStyle = '#78350F';
  ctx.beginPath(); ctx.ellipse(-12*u, 7*u, 5.5*u, 3.8*u, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(12*u, 7*u, 5.5*u, 3.8*u, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawSaigonSkylineAndClockArt(ctx, a, t) {
  var u = a.u, fx = a.fx;
  ctx.save(); ctx.translate(a.sx, a.sy); ctx.scale(fx, 1);
  // Tranh Saigon Skyline (Nhà Thờ Đức Bà đỏ & Tháp Bitexco xanh) bên trái
  ctx.fillStyle = '#BAE6FD'; ctx.fillRect(-18*u, -10*u, 22*u, 18*u);
  ctx.fillStyle = '#38BDF8'; ctx.fillRect(-15*u, -7*u, 5*u, 15*u); // Bitexco
  ctx.fillStyle = '#B83224'; ctx.fillRect(-8*u, -2*u, 8*u, 10*u);  // Nhà Thờ Đức Bà
  ctx.fillStyle = '#22C55E'; ctx.fillRect(-18*u, 6*u, 22*u, 3*u);
  // Đồng Hồ Quả Lắc Vintage 90s gỗ nâu có quả lắc vàng đung đưa 60fps bên phải!
  ctx.fillStyle = '#5C341D'; ctx.strokeStyle = '#2B180E'; ctx.lineWidth = 1;
  ctx.fillRect(8*u, -11*u, 10*u, 22*u); ctx.strokeRect(8*u, -11*u, 10*u, 22*u);
  ctx.fillStyle = '#FFFBF1'; ctx.beginPath(); ctx.arc(13*u, -5*u, 3.6*u, 0, Math.PI*2); ctx.fill();
  // Quả lắc đồng đung đưa 60fps
  var swing = Math.sin(t * 3.8) * 2.5 * u;
  ctx.strokeStyle = '#FACC15'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(13*u, -1*u); ctx.lineTo(13*u + swing, 7*u); ctx.stroke();
  ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(13*u + swing, 7.5*u, 1.8*u, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/* ==================== 5. HÀM TỔNG VẼ TOÀN BỘ MỸ THUẬT 3 BỨC TƯỜNG QUÁN PHỞ (QĐ 240) ==================== */
function drawPhoVnCultureWalls3D(ctx, cam, t) {
  drawWallFriezeBorders3D(ctx, cam);

  // ---- TƯỜNG TRÁI (X = -5.94) ----
  // 1. Bảng Thực Đơn Phở Đỏ Son Viền Gỗ Gụ Chữ Vàng Vintage 90s ngay lối vào (Z = 0.50..1.62, 0% tràn viền)
  drawPhoMenuBoardArt(ctx, cam);
  // 2. Tranh Hoa Sen Hồng Cổ Điển (Z = 2.8)
  drawPoly3D(ctx, cam, [[-5.93,1.45,2.0],[-5.93,1.45,3.6],[-5.93,2.75,3.6],[-5.93,2.75,2.0]], '#FAF0D7', '#4A2C1A', 2.2);
  var l1 = wallArtAnchor(cam, -5.91, 2.1, 2.8, 'x');
  if (l1) drawLotusArt(ctx, l1);
  // 3. Tranh Xe Xích Lô Đỏ-Vàng Sài Gòn (Z = 5.6)
  drawPoly3D(ctx, cam, [[-5.93,1.45,4.8],[-5.93,1.45,6.4],[-5.93,2.75,6.4],[-5.93,2.75,4.8]], '#FAF0D7', '#4A2C1A', 2.2);
  var l2 = wallArtAnchor(cam, -5.91, 2.1, 5.6, 'x');
  if (l2) drawCycloArt(ctx, l2);
  // 4. Bộ Nón Lá + Đàn Nguyệt & Sáo Trúc treo trực tiếp trên tường vàng (Z = 8.4)
  var l3 = wallArtAnchor(cam, -5.91, 2.15, 8.4, 'x');
  if (l3) drawNonLaAndDanNguyetArt(ctx, l3);

  // ---- TƯỜNG PHẢI (X = +5.94) ----
  // 1. Tranh Áo Dài Trắng Hoa Sen (Z = 2.8)
  drawPoly3D(ctx, cam, [[5.93,1.45,3.6],[5.93,1.45,2.0],[5.93,2.75,2.0],[5.93,2.75,3.6]], '#FAF0D7', '#4A2C1A', 2.2);
  var r1 = wallArtAnchor(cam, 5.91, 2.1, 2.8, 'x');
  if (r1) drawAoDaiArt(ctx, r1);
  // 2. Tranh Cờ Đỏ Sao Vàng + Nón Lá & Hoa Mai Vàng (Z = 5.6)
  drawPoly3D(ctx, cam, [[5.93,1.45,6.4],[5.93,1.45,4.8],[5.93,2.75,4.8],[5.93,2.75,6.4]], '#FAF0D7', '#4A2C1A', 2.2);
  var r2 = wallArtAnchor(cam, 5.91, 2.1, 5.6, 'x');
  if (r2) drawFlagAndApricotBlossomArt(ctx, r2);
  // 3. Kệ Gỗ Trưng Bày Bình Gốm Bát Tràng Men Xanh + Chum Sành + Hộp Sơn Mài Đỏ (Z = 8.4)
  var r3 = wallArtAnchor(cam, 5.91, 2.1, 8.4, 'x');
  if (r3) drawPotteryShelfArt(ctx, r3);

  // ---- TƯỜNG ĐỐI DIỆN SAU BẾP (Z = 14.72) ----
  // 1. 2 Câu Đối Đỏ Chữ Vàng treo đối xứng 2 bên bảng PHỞ BÒ GIA TRUYỀN 1990!
  drawPoly3D(ctx, cam, [[-4.15,1.45,14.73],[-3.72,1.45,14.73],[-3.72,3.25,14.73],[-4.15,3.25,14.73]], '#B91C1C', '#F4B93B', 1.4);
  drawPoly3D(ctx, cam, [[1.78,1.45,14.73],[2.21,1.45,14.73],[2.21,3.25,14.73],[1.78,3.25,14.73]], '#B91C1C', '#F4B93B', 1.4);
  // 2. Bích họa Quang Gánh Phở Xưa (góc trái tường sau bếp X = -5.0)
  drawPoly3D(ctx, cam, [[-5.75,1.65,14.73],[-4.32,1.65,14.73],[-4.32,2.85,14.73],[-5.75,2.85,14.73]], '#FAF0D7', '#4A2C1A', 2);
  var b1 = wallArtAnchor(cam, -5.03, 2.25, 14.7, 'z');
  if (b1) drawQuangGanhPhoArt(ctx, b1);
  // 3. Tranh Saigon Skyline & Đồng Hồ Quả Lắc Vintage 90s đung đưa 60fps (góc phải tường sau bếp X = +4.1)
  drawPoly3D(ctx, cam, [[2.55,1.65,14.73],[5.55,1.65,14.73],[5.55,2.95,14.73],[2.55,2.95,14.73]], '#FAF0D7', '#4A2C1A', 2);
  var b2 = wallArtAnchor(cam, 4.05, 2.3, 14.7, 'z');
  if (b2) drawSaigonSkylineAndClockArt(ctx, b2, t);
}
`;
}
