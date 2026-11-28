/**
 * Bộ Sinh Texture Thủ Tục WebGL 3D & Mỹ Thuật Tường Fallback Nhà Thờ Đức Bà Sài Gòn (Quyết định 250)
 * - Sinh các Texture Power-of-Two (256×256 / 512×256) 100% 0-CDN trong RAM:
 *   1. marseilleBrick: Gạch đỏ Marseille cổ 1880 + mạch vữa ấm.
 *   2. limestoneWall: Đá sa thạch vòm Gothic & vách Cung Thánh.
 *   3. naveCheckerFloor: Sàn gạch đá ca-rô Thánh Đường Chính.
 *   4. sanctuaryMarble: Đá hoa cương kem-vàng vân mây Cung Thánh.
 *   5. redCarpet: Thảm nhung đỏ viền chỉ vàng lối đi trung tâm.
 *   6. limWood: Vân gỗ lim/sồi cổ cho ghế giáo dân, sàn gác chuông & cầu thang chữ L.
 *   7. stainedGlassLancet / stainedGlassMary / roseWindow: Kính màu Gothic rực rỡ.
 *   8. cathedralDoor / heritagePlaque / maryBanner / belfryPlaque / louverShutter.
 *   9. agedBronze / missalBook / altarCloth: Đồng cổ 1880, Sách Lễ đỏ viền vàng & khăn ren bàn thờ.
 * - Gọi buildPigBillboardTextures(wgl) để đồng bộ sprite Heo 24×20 gl.NEAREST.
 * - Giữ drawCathedralWalls3D(ctx, cam, room, t, candleGlow) cho Canvas2D fallback (Test 182).
 */
export function buildCathedralWallArtScript(): string {
  return String.raw`
/* ==================== 1. BỘ SINH TEXTURE THỦ TỤC WEBGL 3D NHÀ THỜ ĐỨC BÀ (QĐ 250) ==================== */
function cathSeedRng(seed) {
  var s = seed | 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildCathedralProceduralTextures(wgl) {
  function mkCanvas(w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; return c;
  }

  // 1. Gạch đỏ Marseille cổ điển 1880 (marseilleBrick)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = cathSeedRng(1880);
    g.fillStyle = '#C9B393'; g.fillRect(0, 0, 256, 256);
    var rows = 16, cols = 8, bh = 256 / rows, bw = 256 / cols;
    var tones = ['#943E2E', '#A34836', '#863526', '#9D4332', '#7E3123'];
    for (var r = 0; r < rows; r++) {
      var off = (r % 2) * (bw * 0.5);
      for (var col = -1; col <= cols; col++) {
        g.fillStyle = tones[Math.floor(rng() * tones.length)];
        g.fillRect(col * bw + off + 1.5, r * bh + 1.5, bw - 3, bh - 3);
        g.fillStyle = 'rgba(255,230,200,0.08)';
        g.fillRect(col * bw + off + 2, r * bh + 2, bw - 4, 2);
      }
    }
    for (var d = 0; d < 120; d++) {
      g.fillStyle = 'rgba(43,24,14,0.09)';
      g.beginPath(); g.arc(rng() * 256, rng() * 256, 3 + rng() * 10, 0, Math.PI * 2); g.fill();
    }
    wgl.registerTextureCanvas('marseilleBrick', c, true);
  })();

  // 2. Đá sa thạch vòm Gothic (limestoneWall)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = cathSeedRng(1877);
    g.fillStyle = '#D5C2A5'; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 256; y += 32) {
      var shift = ((y / 32) % 2) * 32;
      for (var x = -32; x < 256; x += 64) {
        g.fillStyle = rng() > 0.5 ? '#DCCBB0' : '#CEBA9B';
        g.fillRect(x + shift + 1, y + 1, 62, 30);
        g.strokeStyle = 'rgba(110,90,68,0.32)'; g.lineWidth = 1.5;
        g.strokeRect(x + shift + 1, y + 1, 62, 30);
      }
    }
    for (var i = 0; i < 160; i++) {
      g.fillStyle = 'rgba(92,72,50,0.08)';
      g.beginPath(); g.arc(rng() * 256, rng() * 256, 4 + rng() * 14, 0, Math.PI * 2); g.fill();
    }
    wgl.registerTextureCanvas('limestoneWall', c, true);
  })();

  // 3. Sàn gạch đá ca-rô Thánh Đường Chính (naveCheckerFloor)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = cathSeedRng(1882);
    g.fillStyle = '#DFD3BE'; g.fillRect(0, 0, 256, 256);
    var sz = 64;
    for (var y = 0; y < 256; y += sz) {
      for (var x = 0; x < 256; x += sz) {
        var dark = ((x / sz) + (y / sz)) % 2 === 0;
        g.fillStyle = dark ? '#C4B196' : '#E7DCC8';
        g.fillRect(x + 1, y + 1, sz - 2, sz - 2);
        g.strokeStyle = '#8F7D65'; g.lineWidth = 1.5;
        g.strokeRect(x + 1, y + 1, sz - 2, sz - 2);
      }
    }
    for (var i = 0; i < 90; i++) {
      g.fillStyle = 'rgba(72,56,40,0.06)';
      g.beginPath(); g.arc(rng() * 256, rng() * 256, 4 + rng() * 12, 0, Math.PI * 2); g.fill();
    }
    wgl.registerTextureCanvas('naveCheckerFloor', c, true);
  })();

  // 4. Đá hoa cương kem-vàng Cung Thánh (sanctuaryMarble)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = cathSeedRng(1885);
    g.fillStyle = '#F3ECE0'; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 256; y += 64) {
      for (var x = 0; x < 256; x += 64) {
        g.fillStyle = ((x / 64 + y / 64) % 2 === 0) ? '#F7F1E7' : '#EAE0CE';
        g.fillRect(x + 1, y + 1, 62, 62);
      }
    }
    g.strokeStyle = 'rgba(180,148,108,0.28)'; g.lineWidth = 1.5;
    for (var v = 0; v < 24; v++) {
      var sx = rng() * 256, sy = rng() * 256;
      g.beginPath(); g.moveTo(sx, sy);
      g.quadraticCurveTo(sx + 24, sy + (rng() - 0.5) * 32, sx + 56, sy + (rng() - 0.5) * 40);
      g.stroke();
    }
    wgl.registerTextureCanvas('sanctuaryMarble', c, true);
  })();

  // 5. Thảm nhung đỏ viền chỉ vàng (redCarpet)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#8C1919'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#D4AF37'; g.fillRect(0, 0, 22, 256); g.fillRect(234, 0, 22, 256);
    g.fillStyle = '#6E1111'; g.fillRect(28, 0, 8, 256); g.fillRect(220, 0, 8, 256);
    g.fillStyle = 'rgba(254,240,138,0.22)';
    for (var y = 16; y < 256; y += 48) {
      g.fillRect(108, y, 40, 12);
    }
    wgl.registerTextureCanvas('redCarpet', c, true);
  })();

  // 6. Gỗ lim / gỗ sồi cổ kính (limWood)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = cathSeedRng(1889);
    g.fillStyle = '#5C341D'; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 256; y += 4) {
      g.fillStyle = (y % 8 === 0) ? 'rgba(35,17,8,0.34)' : 'rgba(130,82,48,0.22)';
      g.fillRect(0, y, 256, 2);
    }
    for (var p = 0; p < 256; p += 32) {
      g.fillStyle = 'rgba(24,12,5,0.45)'; g.fillRect(0, p, 256, 2);
    }
    for (var m = 0; m < 10; m++) {
      g.strokeStyle = 'rgba(30,14,6,0.26)'; g.lineWidth = 1.4;
      g.beginPath(); g.ellipse(rng() * 256, rng() * 256, 22, 4, 0, 0, Math.PI * 2); g.stroke();
    }
    wgl.registerTextureCanvas('limWood', c, true);
  })();

  // 7. Kính màu Lancet Gothic (stainedGlassLancet & stainedGlassMary)
  function makeLancetTex(key, pal) {
    var c = mkCanvas(256, 512), g = c.getContext('2d');
    g.fillStyle = '#2B2118'; g.fillRect(0, 0, 256, 512);
    g.save();
    g.beginPath();
    g.moveTo(20, 492);
    g.lineTo(20, 160);
    g.quadraticCurveTo(26, 36, 128, 16);
    g.quadraticCurveTo(230, 36, 236, 160);
    g.lineTo(236, 492);
    g.closePath();
    g.clip();
    var rows = 8, segs = 4, cw = 256 / segs, rh = 512 / rows;
    for (var r = 0; r < rows; r++) {
      for (var s = 0; s < segs; s++) {
        g.fillStyle = pal[(r * 3 + s) % pal.length];
        g.fillRect(s * cw, r * rh, cw + 1, rh + 1);
      }
    }
    g.fillStyle = '#FDE047';
    g.beginPath(); g.arc(128, 138, 48, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#EF4444';
    g.beginPath(); g.arc(128, 138, 22, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#1E1B18'; g.lineWidth = 6;
    for (var li = 1; li < segs; li++) {
      g.beginPath(); g.moveTo(li * cw, 0); g.lineTo(li * cw, 512); g.stroke();
    }
    for (var ri = 1; ri < rows; ri++) {
      g.beginPath(); g.moveTo(0, ri * rh); g.lineTo(256, ri * rh); g.stroke();
    }
    g.restore();
    g.strokeStyle = '#D4AF37'; g.lineWidth = 6;
    g.strokeRect(8, 8, 240, 496);
    wgl.registerTextureCanvas(key, c, false);
  }
  makeLancetTex('stainedGlassLancet', ['#1D4ED8', '#B91C1C', '#F59E0B', '#059669', '#6D28D9']);
  makeLancetTex('stainedGlassMary', ['#38BDF8', '#FDE047', '#FFFBEB', '#2563EB', '#F59E0B']);

  // 8. Kính màu Hoa Hồng Rose Window 8 cánh (roseWindow)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.clearRect(0, 0, 256, 256);
    g.fillStyle = '#2B2118';
    g.beginPath(); g.arc(128, 128, 122, 0, Math.PI * 2); g.fill();
    var pCols = ['#2563EB', '#DC2626', '#F59E0B', '#10B981'];
    for (var i = 0; i < 8; i++) {
      var a0 = (i / 8) * Math.PI * 2, a1 = ((i + 1) / 8) * Math.PI * 2;
      g.fillStyle = pCols[i % pCols.length];
      g.beginPath(); g.moveTo(128, 128); g.arc(128, 128, 108, a0, a1); g.closePath(); g.fill();
      g.strokeStyle = '#1E1B18'; g.lineWidth = 6; g.stroke();
    }
    g.fillStyle = '#FDE047';
    g.beginPath(); g.arc(128, 128, 44, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#2B2118'; g.lineWidth = 6; g.stroke();
    g.fillStyle = '#FFFBEB';
    g.beginPath(); g.arc(128, 128, 20, 0, Math.PI * 2); g.fill();
    wgl.registerTextureCanvas('roseWindow', c, false);
  })();

  // 9. Cửa gỗ lim Nhà Thờ 2 cánh (cathedralDoor)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#4A2518'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#2B180E'; g.lineWidth = 8; g.strokeRect(4, 4, 248, 248);
    g.strokeStyle = '#6B3E1E'; g.lineWidth = 4;
    g.strokeRect(22, 22, 212, 94);
    g.strokeRect(22, 134, 212, 98);
    g.fillStyle = '#F4B93B';
    g.beginPath(); g.arc(216, 128, 10, 0, Math.PI * 2); g.fill();
    wgl.registerTextureCanvas('cathedralDoor', c, false);
  })();

  // 10. Bảng đồng di sản & Hoành phi Cung Thánh & Gác Chuông
  function makePlaque(key, bg, border, line1, line2) {
    var c = mkCanvas(512, 128), g = c.getContext('2d');
    g.fillStyle = bg; g.fillRect(0, 0, 512, 128);
    g.strokeStyle = border; g.lineWidth = 8; g.strokeRect(6, 6, 500, 116);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (line2) {
      g.fillStyle = '#FDE047'; g.font = 'bold 26px monospace';
      g.fillText(line1, 256, 44, 470);
      g.fillStyle = '#FFFBF1'; g.font = 'bold 22px monospace';
      g.fillText(line2, 256, 86, 470);
    } else {
      g.fillStyle = '#FDE047'; g.font = 'bold 26px monospace';
      g.fillText(line1, 256, 64, 470);
    }
    wgl.registerTextureCanvas(key, c, false);
  }
  makePlaque('heritagePlaque', '#4A2518', '#D4AF37', '✝ VƯƠNG CUNG THÁNH ĐƯỜNG ✝', 'NHÀ THỜ ĐỨC BÀ SÀI GÒN · 1880');
  makePlaque('maryBanner', '#7F1D1D', '#F4B93B', '✝ ĐỨC MẸ HÒA BÌNH · CẦU CHO CHÚNG CON ✝', '');
  makePlaque('belfryPlaque', '#3E2212', '#F4B93B', '🎵 ĐẠI PHONG CẦM & THÁP CHUÔNG 1880', '');

  // 11. Đồng cổ Chuông & Ống Pipe Organ (agedBronze)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = cathSeedRng(1880);
    var grad = g.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, '#854D0E');
    grad.addColorStop(0.35, '#F59E0B');
    grad.addColorStop(0.65, '#FDE047');
    grad.addColorStop(1, '#78350F');
    g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 60; i++) {
      g.fillStyle = 'rgba(43,24,14,0.10)';
      g.fillRect(0, rng() * 256, 256, 2);
    }
    wgl.registerTextureCanvas('agedBronze', c, true);
  })();

  // 12. Sách Lễ đỏ viền vàng (missalBook)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#991B1B'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 14; g.strokeRect(10, 10, 236, 236);
    g.strokeStyle = '#FDE047'; g.lineWidth = 4; g.strokeRect(28, 28, 200, 200);
    g.fillStyle = '#FDE047';
    g.fillRect(116, 68, 24, 120);
    g.fillRect(84, 102, 88, 24);
    wgl.registerTextureCanvas('missalBook', c, false);
  })();

  // 13. Khăn ren trắng viền chỉ vàng Bàn Thờ (altarCloth)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#FFFDF7'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#D4AF37'; g.fillRect(0, 210, 256, 18);
    g.fillStyle = '#FDE047';
    for (var x = 8; x < 256; x += 24) {
      g.fillRect(x, 234, 12, 14);
    }
    wgl.registerTextureCanvas('altarCloth', c, true);
  })();

  // 14. Cửa chớp gỗ Tháp Chuông ngắm trời vàng Sài Gòn (louverShutter)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#FEF08A'; g.fillRect(0, 0, 256, 120);
    g.fillStyle = '#FB923C'; g.fillRect(0, 120, 256, 136);
    g.fillStyle = '#4A2518';
    g.fillRect(0, 0, 18, 256); g.fillRect(238, 0, 18, 256);
    g.fillRect(0, 0, 256, 18); g.fillRect(0, 238, 256, 18);
    for (var y = 34; y < 228; y += 28) {
      g.fillRect(18, y, 220, 12);
    }
    wgl.registerTextureCanvas('louverShutter', c, false);
  })();

  // 15. Đăng ký toàn bộ sprite Heo 24×20 gl.NEAREST dùng chung
  if (typeof buildPigBillboardTextures === 'function') {
    buildPigBillboardTextures(wgl);
  }
}

/* ==================== 2. HELPER KHÓA KHUNG 4 GÓC CANVAS2D FALLBACK (TEST 182) ==================== */
function drawCathedralClippedQuad(ctx, cam, pts, bgCol, borderCol, lineW, drawInner) {
  drawPoly3D(ctx, cam, pts, bgCol, borderCol, lineW || 2);
  var p0 = projectPoint3D(cam, pts[0][0], pts[0][1], pts[0][2]);
  var p1 = projectPoint3D(cam, pts[1][0], pts[1][1], pts[1][2]);
  var p2 = projectPoint3D(cam, pts[2][0], pts[2][1], pts[2][2]);
  var p3 = projectPoint3D(cam, pts[3][0], pts[3][1], pts[3][2]);
  if (!p0 || !p1 || !p2 || !p3) return;
  if (p0.cz < 0.45 || p1.cz < 0.45 || p2.cz < 0.45 || p3.cz < 0.45) return;
  var bw = Math.hypot(p1.sx - p0.sx, p1.sy - p0.sy);
  var bh = Math.hypot(p3.sx - p0.sx, p3.sy - p0.sy);
  if (bw < 12 || bh < 12) return;
  var cx = (p0.sx + p1.sx + p2.sx + p3.sx) * 0.25;
  var cy = (p0.sy + p1.sy + p2.sy + p3.sy) * 0.25;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p0.sx, p0.sy);
  ctx.lineTo(p1.sx, p1.sy);
  ctx.lineTo(p2.sx, p2.sy);
  ctx.lineTo(p3.sx, p3.sy);
  ctx.closePath();
  ctx.clip();
  if (drawInner) drawInner(cx, cy, bw, bh, Math.max(8, bw * 0.84));
  ctx.restore();
}

function drawStainedGlassWindow(ctx, cx, cy, bw, bh, palette, t) {
  var shimmer = 0.88 + Math.sin((t || 0) * 1.8) * 0.12;
  var left = cx - bw * 0.46;
  var top = cy - bh * 0.46;
  var w = bw * 0.92;
  var h = bh * 0.92;
  ctx.fillStyle = '#2B2118';
  ctx.fillRect(left, top, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(left + w * 0.08, top + h * 0.95);
  ctx.lineTo(left + w * 0.08, top + h * 0.32);
  ctx.quadraticCurveTo(left + w * 0.10, top + h * 0.06, cx, top + h * 0.03);
  ctx.quadraticCurveTo(left + w * 0.90, top + h * 0.06, left + w * 0.92, top + h * 0.32);
  ctx.lineTo(left + w * 0.92, top + h * 0.95);
  ctx.closePath();
  ctx.clip();
  var cols = palette || ['#1D4ED8', '#B91C1C', '#F59E0B', '#047857', '#7C3AED'];
  var rows = 5, segs = 3, cw = w / segs, rh = h / rows;
  ctx.globalAlpha = shimmer;
  for (var r = 0; r < rows; r++) {
    for (var s = 0; s < segs; s++) {
      ctx.fillStyle = cols[(r * 2 + s) % cols.length];
      ctx.fillRect(left + s * cw, top + r * rh, cw + 0.5, rh + 0.5);
    }
  }
  ctx.fillStyle = '#FDE047';
  ctx.beginPath(); ctx.arc(cx, top + h * 0.28, Math.min(w, h) * 0.17, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#1E1B18';
  ctx.lineWidth = Math.max(1, bw * 0.03);
  for (var li = 1; li < segs; li++) {
    ctx.beginPath(); ctx.moveTo(left + li * cw, top); ctx.lineTo(left + li * cw, top + h); ctx.stroke();
  }
  for (var ri = 1; ri < rows; ri++) {
    ctx.beginPath(); ctx.moveTo(left, top + ri * rh); ctx.lineTo(left + w, top + ri * rh); ctx.stroke();
  }
  ctx.restore();
}

function drawRoseWindow(ctx, cx, cy, bw, bh, t) {
  var r = Math.min(bw, bh) * 0.44;
  var glow = 0.86 + Math.sin((t || 0) * 2.1) * 0.14;
  ctx.save();
  ctx.fillStyle = '#2B2118';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = glow;
  var pCols = ['#2563EB', '#DC2626', '#F59E0B', '#10B981'];
  for (var i = 0; i < 8; i++) {
    var a0 = (i / 8) * Math.PI * 2, a1 = ((i + 1) / 8) * Math.PI * 2;
    ctx.fillStyle = pCols[i % pCols.length];
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r * 0.86, a0, a1); ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = '#FDE047';
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.34, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawCathedralWalls3D(ctx, cam, _room, t, candleGlow) {
  // Tường gạch Marseille dọc Thánh Đường Chính & Cung Thánh hợp nhất
  drawPoly3D(ctx, cam, [[-5.95, 0, 0], [-5.95, 0, 14.8], [-5.95, 1.35, 14.8], [-5.95, 1.35, 0]], '#8F3E2E', '#5A251B', 1);
  drawPoly3D(ctx, cam, [[5.95, 0, 14.8], [5.95, 0, 0], [5.95, 1.35, 0], [5.95, 1.35, 14.8]], '#8F3E2E', '#5A251B', 1);

  var zBays = [2.6, 6.4, 10.2];
  for (var i = 0; i < zBays.length; i++) {
    var zs = zBays[i], ze = zs + 2.2;
    drawCathedralClippedQuad(
      ctx, cam,
      [[5.93, 5.4, ze], [5.93, 5.4, zs], [5.93, 2.0, zs], [5.93, 2.0, ze]],
      '#1E293B', '#5C341D', 2.0,
      function(cx, cy, bw, bh) { drawStainedGlassWindow(ctx, cx, cy, bw, bh, null, t + i * 0.5); }
    );
  }
  drawCathedralClippedQuad(
    ctx, cam,
    [[5.92, 6.8, 8.6], [5.92, 6.8, 6.4], [5.92, 4.9, 6.4], [5.92, 4.9, 8.6]],
    'rgba(0,0,0,0)', null, 0,
    function(cx, cy, bw, bh) { drawRoseWindow(ctx, cx, cy, bw, bh, t); }
  );
  // 3 Ô Kính Màu Lancet tại tường hậu Cung Thánh Z = 24.35
  var lancets = [[-3.6, -1.6], [-1.05, 1.05], [1.6, 3.6]];
  for (var li = 0; li < lancets.length; li++) {
    drawCathedralClippedQuad(
      ctx, cam,
      [[lancets[li][0], 5.6, 24.35], [lancets[li][1], 5.6, 24.35], [lancets[li][1], 1.8, 24.35], [lancets[li][0], 1.8, 24.35]],
      '#1E293B', '#D4AF37', 2.0,
      function(cx, cy, bw, bh) { drawStainedGlassWindow(ctx, cx, cy, bw, bh, ['#38BDF8', '#FDE047', '#FFFFFF', '#2563EB'], t); }
    );
  }
  if (candleGlow > 0.05) {
    drawPoly3D(ctx, cam, [[-4.8, 0.45, 24.25], [4.8, 0.45, 24.25], [4.8, 5.0, 24.25], [-4.8, 5.0, 24.25]], 'rgba(253,224,71,' + (candleGlow * 0.14).toFixed(2) + ')', null, 0);
  }
}
`;
}
