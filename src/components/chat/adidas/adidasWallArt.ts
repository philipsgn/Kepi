/**
 * Bộ Sinh Texture Thủ Tục WebGL 3D & Mỹ Thuật Tường Fallback — Adidas Originals Hội An (Quyết định 250)
 * - Sinh các Texture Power-of-Two (256×256 / 512×256) trực tiếp trong RAM (<15ms, 0 CDN mạng):
 *   1. hoiAnYellowWall: Vôi vàng Hội An cổ kính loang vữa ấm.
 *   2. gachBong: Gạch bông di sản Hội An 16×16 / 4 cánh cổ điển.
 *   3. limWood: Gỗ lim Hội An nhiều thớ đậm ấm cho sàn boutique, cầu thang 12 bậc & quầy.
 *   4. trefoilOriginSign: Bảng gỗ lim chữ vàng ADIDAS ORIGINALS · HỘI AN HERITAGE + logo Cỏ Ba Lá.
 *   5. vnLotusStripeArt: Tranh Nón Lá × Hoa Sen × 3 Sọc nghệ thuật.
 *   6. vnCollectionSign: Bảng ★ BỘ SƯU TẬP VIỆT NAM · 3 SỌC ★ kèm Nón Lá & Áo Đấu.
 *   7. threeStripesWall: Tường 3 sọc Adidas Originals di sản.
 *   8. velvetCurtain: Rèm nhung đỏ đô xếp nếp có dây tua vàng phòng thử đồ.
 *   9. fittingGreenWall, shoeDisplayBoard, posShelfTex, mirrorGlass, vnDoorWood.
 * - Gọi buildPigBillboardTextures(wgl, ['adidas_jacket']) để render chú Heo 24×20 gl.NEAREST.
 * - Giữ nguyên bộ hàm Canvas2D (drawAdidasRoomWalls3D) làm fallback & cho Headless Smoke Test 182.
 */
export function buildAdidasWallArtScript(): string {
  return String.raw`
/* ==================== 1. BỘ SINH TEXTURE THỦ TỤC ADIDAS ORIGINALS HỘI AN (WEBGL 3D) ==================== */
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
  g.fillStyle = '#2B180E';
  for (var s = -1; s <= 1; s++) {
    g.fillRect(cx - r * 0.58, cy + s * r * 0.13 + r * 0.02, r * 1.16, Math.max(2, r * 0.07));
  }
  g.restore();
}

function buildAdidasProceduralTextures(wgl) {
  if (!wgl || typeof document === 'undefined') return;
  function mkCanvas(w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; return c;
  }

  // 1. Vôi vàng Hội An cổ kính (hoiAnYellowWall)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makeAdidasSeedRng(2501);
    g.fillStyle = '#E0B452'; g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 240; i++) {
      g.fillStyle = rng() > 0.45 ? 'rgba(244,205,112,0.18)' : 'rgba(176,126,38,0.16)';
      g.beginPath(); g.arc(rng() * 256, rng() * 256, 10 + rng() * 34, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = 'rgba(116,74,24,0.16)'; g.lineWidth = 1;
    for (var k = 0; k < 24; k++) {
      var cx = rng() * 256, cy = rng() * 256;
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + (rng() - 0.5) * 24, cy + rng() * 28); g.stroke();
    }
    wgl.registerTextureCanvas('hoiAnYellowWall', c, true);
  })();

  // 2. Gạch bông di sản Hội An (gachBong)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makeAdidasSeedRng(2502);
    g.fillStyle = '#E6DBC2'; g.fillRect(0, 0, 256, 256);
    for (var ty = 0; ty < 256; ty += 128) {
      for (var tx = 0; tx < 256; tx += 128) {
        var cx = tx + 64, cy = ty + 64;
        g.fillStyle = ((tx + ty) / 128) % 2 === 0 ? '#EAE0CA' : '#DDD0B4';
        g.fillRect(tx + 2, ty + 2, 124, 124);
        g.strokeStyle = '#9C8A67'; g.lineWidth = 3; g.strokeRect(tx + 3, ty + 3, 122, 122);
        g.fillStyle = '#8C5E28';
        for (var k = 0; k < 4; k++) {
          g.save(); g.translate(cx, cy); g.rotate(k * Math.PI / 2);
          g.beginPath(); g.ellipse(0, -26, 11, 22, 0, 0, Math.PI * 2); g.fill();
          g.restore();
        }
        g.fillStyle = '#2F5241';
        for (var d = 0; d < 4; d++) {
          g.save(); g.translate(cx, cy); g.rotate(d * Math.PI / 2 + Math.PI / 4);
          g.beginPath(); g.ellipse(0, -20, 7, 15, 0, 0, Math.PI * 2); g.fill();
          g.restore();
        }
        g.fillStyle = '#F7EED8'; g.beginPath(); g.arc(cx, cy, 11, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#C88A2E'; g.beginPath(); g.arc(cx, cy, 5, 0, Math.PI * 2); g.fill();
      }
    }
    for (var s = 0; s < 100; s++) {
      g.fillStyle = 'rgba(92,74,48,0.08)';
      g.beginPath(); g.arc(rng() * 256, rng() * 256, 4 + rng() * 12, 0, Math.PI * 2); g.fill();
    }
    wgl.registerTextureCanvas('gachBong', c, true);
  })();

  // 3. Gỗ lim Hội An (limWood)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makeAdidasSeedRng(2503);
    g.fillStyle = '#6B4226'; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 256; y += 3) {
      g.fillStyle = (y % 6 === 0) ? 'rgba(43,24,14,0.34)' : 'rgba(150,97,55,0.22)';
      g.fillRect(0, y, 256, 2);
    }
    for (var p = 0; p < 256; p += 64) {
      g.fillStyle = 'rgba(28,14,8,0.45)'; g.fillRect(0, p, 256, 2);
    }
    for (var m = 0; m < 10; m++) {
      g.strokeStyle = 'rgba(35,18,8,0.25)'; g.beginPath();
      g.ellipse(rng() * 256, rng() * 256, 18, 4, 0, 0, Math.PI * 2); g.stroke();
    }
    wgl.registerTextureCanvas('limWood', c, true);
  })();

  // 4. Bảng Trefoil Origin Hội An (trefoilOriginSign)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#2B180E'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 8; g.strokeRect(10, 10, 492, 236);
    g.strokeStyle = '#7C4F2B'; g.lineWidth = 3; g.strokeRect(20, 20, 472, 216);
    drawAdidasTrefoil2D(g, 256, 86, 50, '#F4B93B');
    g.fillStyle = '#FFFBF1'; g.font = 'bold 38px sans-serif'; g.textAlign = 'center';
    g.fillText('ADIDAS ORIGINALS', 256, 168);
    g.fillStyle = '#FDE047'; g.font = 'bold 24px monospace';
    g.fillText('· HỘI AN HERITAGE ·', 256, 212);
    wgl.registerTextureCanvas('trefoilOriginSign', c, false);
  })();

  // 5. Tranh Nón Lá × Hoa Sen × 3 Sọc (vnLotusStripeArt)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#1E3A3D'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 8; g.strokeRect(8, 8, 496, 240);
    // 3 Dải sọc vàng di sản chéo
    g.fillStyle = 'rgba(244,185,59,0.28)';
    for (var st = -1; st <= 1; st++) {
      g.beginPath();
      g.moveTo(210 + st * 46, 244); g.lineTo(240 + st * 46, 244);
      g.lineTo(350 + st * 46, 12);  g.lineTo(320 + st * 46, 12);
      g.closePath(); g.fill();
    }
    // Nón Lá Việt Nam trái
    g.fillStyle = '#E8C574'; g.strokeStyle = '#78350F'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(124, 62); g.lineTo(54, 158); g.lineTo(194, 158); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#DC2626'; g.fillRect(102, 114, 44, 12);
    g.fillStyle = '#FFFBF1';
    g.fillRect(110, 116, 6, 8); g.fillRect(121, 116, 6, 8); g.fillRect(132, 116, 6, 8);
    // Đóa Hoa Sen Hồng & Lá Sen phải
    g.fillStyle = '#15803D'; g.beginPath(); g.ellipse(340, 184, 72, 20, 0, 0, Math.PI * 2); g.fill();
    var petals = [[-44, 10, -0.5], [44, 10, 0.5], [-24, -6, -0.25], [24, -6, 0.25], [0, -18, 0]];
    for (var pi = 0; pi < petals.length; pi++) {
      g.save(); g.translate(340 + petals[pi][0], 138 + petals[pi][1]); g.rotate(petals[pi][2]);
      g.fillStyle = pi === 4 ? '#FB7185' : '#F43F5E';
      g.beginPath(); g.ellipse(0, 0, 22, 46, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    g.fillStyle = '#FDE047'; g.beginPath(); g.arc(340, 146, 14, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#FFFBF1'; g.font = 'bold 24px serif'; g.textAlign = 'center';
    g.fillText('NÓN LÁ × HOA SEN × 3 SỌC · HỘI AN', 256, 228);
    wgl.registerTextureCanvas('vnLotusStripeArt', c, false);
  })();

  // 6. Bảng BST Việt Nam (vnCollectionSign)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#5C341D'; g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#FFF5D6'; g.fillRect(14, 52, 484, 190);
    g.fillStyle = '#991B1B'; g.fillRect(10, 10, 492, 44);
    g.strokeStyle = '#FDE047'; g.lineWidth = 4; g.strokeRect(10, 10, 492, 236);
    g.fillStyle = '#FDE047'; g.font = 'bold 22px monospace'; g.textAlign = 'center';
    g.fillText('★ BỘ SƯU TẬP VIỆT NAM · 3 SỌC ★', 256, 39);
    // 3 Nón Lá hàng trên
    for (var ni = -1; ni <= 1; ni++) {
      var nx = 256 + ni * 144, ny = 92;
      g.fillStyle = '#E8C574'; g.strokeStyle = '#78350F'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(nx, ny - 26); g.lineTo(nx - 42, ny + 18); g.lineTo(nx + 42, ny + 18); g.closePath();
      g.fill(); g.stroke();
      g.fillStyle = '#DA251D'; g.fillRect(nx - 18, ny, 36, 8);
    }
    // 3 Áo Đấu Việt Nam 3 Sọc hàng dưới
    var jCols = [['#DA251D', '#FDE047'], ['#FFFBF1', '#DA251D'], ['#0F766E', '#FDE047']];
    for (var ji = 0; ji < 3; ji++) {
      var jx = 112 + ji * 144, jy = 140;
      g.fillStyle = jCols[ji][0]; g.fillRect(jx - 38, jy, 76, 22); g.fillRect(jx - 24, jy, 48, 86);
      g.strokeStyle = '#2B180E'; g.lineWidth = 2; g.strokeRect(jx - 24, jy, 48, 86);
      g.fillStyle = jCols[ji][1];
      for (var s = 0; s < 3; s++) {
        g.fillRect(jx - 34 + s * 5, jy + 2, 3, 18);
        g.fillRect(jx + 22 + s * 5, jy + 2, 3, 18);
      }
      g.fillRect(jx - 7, jy + 24, 14, 14);
    }
    wgl.registerTextureCanvas('vnCollectionSign', c, false);
  })();

  // 7. Tường 3 sọc Adidas (threeStripesWall)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#18241C'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 6; g.strokeRect(8, 8, 240, 240);
    g.fillStyle = '#FFFBF1';
    for (var s = -1; s <= 1; s++) {
      g.fillRect(128 + s * 36 - 10, 28, 20, 200);
    }
    g.fillStyle = '#F4B93B'; g.fillRect(28, 204, 200, 8);
    wgl.registerTextureCanvas('threeStripesWall', c, false);
  })();

  // 8. Rèm nhung đỏ đô (velvetCurtain)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#7F1D1D'; g.fillRect(0, 0, 256, 256);
    for (var f = 0; f < 8; f++) {
      g.fillStyle = f % 2 === 0 ? '#991B1B' : '#5F1111';
      g.fillRect(f * 32, 0, 32, 256);
      g.fillStyle = 'rgba(255,200,200,0.08)';
      g.fillRect(f * 32 + 6, 0, 6, 256);
    }
    g.fillStyle = '#F4B93B'; g.fillRect(0, 148, 256, 12);
    g.strokeStyle = '#450A0A'; g.lineWidth = 4; g.strokeRect(2, 2, 252, 252);
    wgl.registerTextureCanvas('velvetCurtain', c, false);
  })();

  // 9. Tường xanh ngọc-rêu boutique Phòng Thay Đồ (fittingGreenWall)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makeAdidasSeedRng(2509);
    g.fillStyle = '#253C2B'; g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 180; i++) {
      g.fillStyle = rng() > 0.5 ? 'rgba(54,88,63,0.18)' : 'rgba(24,40,28,0.20)';
      g.beginPath(); g.arc(rng() * 256, rng() * 256, 8 + rng() * 28, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = '#C89B3C'; g.lineWidth = 4; g.strokeRect(2, 2, 252, 252);
    wgl.registerTextureCanvas('fittingGreenWall', c, true);
  })();

  // 10. Kệ Trưng Bày Giày Shoe Wall (shoeDisplayBoard) & Quầy Thu Ngân Hộp Giày (posShelfTex)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#2B180E'; g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#FDE047'; g.font = 'bold 24px monospace'; g.textAlign = 'center';
    g.fillText('SHOE WALL · ADIDAS ORIGINALS', 256, 34);
    var sh = [
      { n: 'SAMBA OG', b: '#FFFBF1', st: '#111827', so: '#B45309' },
      { n: 'SUPERSTAR', b: '#FFFFFF', st: '#0F172A', so: '#CBD5E1' },
      { n: 'GAZELLE', b: '#DC2626', st: '#FFFBF1', so: '#F8FAFC' },
      { n: 'PREDATOR', b: '#1E293B', st: '#F97316', so: '#0F172A' }
    ];
    for (var i = 0; i < 4; i++) {
      var bx = 20 + i * 120;
      g.fillStyle = '#3D2616'; g.fillRect(bx, 50, 112, 192);
      g.strokeStyle = '#C89B3C'; g.lineWidth = 3; g.strokeRect(bx, 50, 112, 192);
      g.fillStyle = '#FFF5D6'; g.fillRect(bx + 8, 60, 96, 134);
      g.fillStyle = '#7C4F2B'; g.fillRect(bx + 8, 124, 96, 10);
      for (var row = 0; row < 2; row++) {
        var sx = bx + 56, sy = 96 + row * 66;
        g.fillStyle = sh[i].so; g.fillRect(sx - 34, sy + 6, 68, 12);
        g.fillStyle = sh[i].b; g.fillRect(sx - 30, sy - 14, 52, 22); g.fillRect(sx + 16, sy - 6, 16, 14);
        g.fillStyle = sh[i].st;
        for (var k = 0; k < 3; k++) g.fillRect(sx - 12 + k * 9, sy - 12, 5, 18);
        g.strokeStyle = '#2B180E'; g.lineWidth = 2; g.strokeRect(sx - 34, sy - 14, 68, 32);
      }
      g.fillStyle = '#FDE047'; g.font = 'bold 15px monospace';
      g.fillText(sh[i].n, bx + 56, 224);
    }
    wgl.registerTextureCanvas('shoeDisplayBoard', c, false);

    var p = mkCanvas(512, 256), pg = p.getContext('2d');
    pg.fillStyle = '#3B2314'; pg.fillRect(0, 0, 512, 256);
    pg.strokeStyle = '#F4B93B'; pg.lineWidth = 6; pg.strokeRect(6, 6, 500, 244);
    pg.fillStyle = '#FDE047'; pg.font = 'bold 22px monospace'; pg.textAlign = 'center';
    pg.fillText('QUẦY THU NGÂN · SAMBA OG', 256, 36);
    var cols = ['#1D4ED8', '#2563EB', '#D97706', '#1E40AF'];
    for (var r = 0; r < 3; r++) {
      var ry = 60 + r * 62;
      pg.fillStyle = '#2B180E'; pg.fillRect(24, ry + 36, 464, 10);
      for (var col = 0; col < 5; col++) {
        var px = 34 + col * 90;
        pg.fillStyle = cols[(r + col) % cols.length]; pg.fillRect(px, ry, 76, 34);
        pg.fillStyle = '#FFFBF1'; pg.fillRect(px + 12, ry + 11, 52, 8);
      }
    }
    wgl.registerTextureCanvas('posShelfTex', p, false);
  })();

  // 11. Mặt kính gương & Cửa gỗ-kính Hội An (mirrorGlass, vnDoorWood)
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

  // 12. Bộ Sprite Chú Heo Mascot 24×20 (gl.NEAREST) kèm outfit áo khoác 3 Sọc Adidas
  if (typeof buildPigBillboardTextures === 'function') {
    buildPigBillboardTextures(wgl, ['adidas_jacket']);
  }
}

/* ==================== 2. FALLBACK CANVAS2D CHO HEADLESS SMOKE TEST 182 ==================== */
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
  ctx.strokeStyle = '#2B180E';
  ctx.lineWidth = 1;
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
  ctx.fillRect(cx + w * 0.05, cy - h * 0.14, w * 0.12, h * 0.10);
  ctx.strokeStyle = '#2B180E';
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - w * 0.28, cy - h * 0.36, w * 0.56, h * 0.72);
}

function drawAdidasHallWalls3D(ctx, cam) {
  drawAdidasClippedQuad(
    ctx, cam,
    [[-5.93, 3.42, 1.8], [-5.93, 3.42, 7.6], [-5.93, 2.86, 7.6], [-5.93, 2.86, 1.8]],
    '#2B180E', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(13, Math.round(bh * 0.42)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('SHOE WALL · ADIDAS ORIGINALS', cx, cy, safeW);
    }
  );
  var shoes = [
    { z1: 1.9, z2: 3.6, name: 'SAMBA OG', body: '#FFFBF1', stripe: '#111827', sole: '#B45309' },
    { z1: 3.9, z2: 5.6, name: 'SUPERSTAR', body: '#FFFFFF', stripe: '#0F172A', sole: '#E2E8F0' },
    { z1: 5.9, z2: 7.5, name: 'GAZELLE', body: '#DC2626', stripe: '#FFFBF1', sole: '#F8FAFC' }
  ];
  for (var si = 0; si < shoes.length; si++) {
    (function(sh) {
      drawAdidasClippedQuad(
        ctx, cam,
        [[-5.93, 2.74, sh.z1], [-5.93, 2.74, sh.z2], [-5.93, 1.05, sh.z2], [-5.93, 1.05, sh.z1]],
        '#3D2616', '#C89B3C', 2.0,
        function(cx, cy, bw, bh, safeW) {
          ctx.fillStyle = '#FFF5D6';
          ctx.fillRect(cx - bw * 0.44, cy - bh * 0.42, bw * 0.88, bh * 0.62);
          ctx.fillStyle = '#7C4F2B';
          ctx.fillRect(cx - bw * 0.44, cy + bh * 0.14, bw * 0.88, bh * 0.08);
          drawPixelSneakerIcon(ctx, cx, cy - bh * 0.22, bw * 0.66, bh * 0.28, sh.body, sh.stripe, sh.sole);
          drawPixelSneakerIcon(ctx, cx, cy + bh * 0.02, bw * 0.66, bh * 0.28, sh.body, sh.stripe, sh.sole);
          var tPx = Math.max(4, Math.min(10, Math.round(bh * 0.13)));
          ctx.font = 'bold ' + tPx + 'px monospace';
          ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(sh.name, cx, cy + bh * 0.34, safeW);
        }
      );
    })(shoes[si]);
  }
  drawAdidasClippedQuad(
    ctx, cam,
    [[5.93, 3.30, 7.4], [5.93, 3.30, 1.9], [5.93, 1.05, 1.9], [5.93, 1.05, 7.4]],
    '#4A2C1A', '#C89B3C', 2.2,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#F3DFAC';
      ctx.fillRect(cx - bw * 0.46, cy - bh * 0.34, bw * 0.92, bh * 0.78);
      var tPx = Math.max(5, Math.min(11, Math.round(bh * 0.12)));
      ctx.font = 'bold ' + tPx + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('SPORTSWEAR · 3 SỌC', cx, cy - bh * 0.42, safeW);
      ctx.fillStyle = '#B45309';
      ctx.fillRect(cx - bw * 0.44, cy - bh * 0.22, bw * 0.88, Math.max(2, bh * 0.04));
      drawPixelJerseyIcon(ctx, cx - bw * 0.28, cy + bh * 0.08, bw * 0.24, bh * 0.50, '#111827', '#FFFBF1', '#FDE047');
      drawPixelJerseyIcon(ctx, cx,            cy + bh * 0.08, bw * 0.24, bh * 0.50, '#1D4ED8', '#FFFBF1', '#93C5FD');
      drawPixelJerseyIcon(ctx, cx + bw * 0.28, cy + bh * 0.08, bw * 0.24, bh * 0.50, '#B91C1C', '#FDE047', '#FDE047');
    }
  );
  drawAdidasClippedQuad(
    ctx, cam,
    [[-1.35, 3.32, 14.72], [4.95, 3.32, 14.72], [4.95, 1.82, 14.72], [-1.35, 1.82, 14.72]],
    '#2B180E', '#F4B93B', 2.6,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#F4B93B';
      for (var k = -1; k <= 1; k++) {
        ctx.fillRect(cx + k * bw * 0.055 - bw * 0.015, cy - bh * 0.38, bw * 0.03, bh * 0.16);
      }
      var p1 = Math.max(6, Math.min(14, Math.round(bh * 0.22)));
      var p2 = Math.max(5, Math.min(11, Math.round(bh * 0.16)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace'; ctx.fillStyle = '#FFFBF1';
      ctx.fillText('ADIDAS ORIGINALS', cx, cy + bh * 0.02, safeW);
      ctx.font = 'bold ' + p2 + 'px monospace'; ctx.fillStyle = '#FDE047';
      ctx.fillText('· HỘI AN HERITAGE ·', cx, cy + bh * 0.28, safeW);
    }
  );
}

function drawAdidasFittingWalls3D(ctx, cam, pig, t) {
  drawAdidasClippedQuad(
    ctx, cam,
    [[-5.93, 2.62, 2.4], [-5.93, 2.62, 10.4], [-5.93, 0.92, 10.4], [-5.93, 0.92, 2.4]],
    '#3B2314', '#C89B3C', 2.0,
    function(cx, cy, bw, bh) {
      ctx.fillStyle = '#243B2B';
      ctx.fillRect(cx - bw * 0.46, cy - bh * 0.44, bw * 0.92, bh * 0.88);
      drawPixelJerseyIcon(ctx, cx - bw * 0.28, cy + bh * 0.04, bw * 0.22, bh * 0.56, '#111827', '#FFFBF1', '#FDE047');
      drawPixelJerseyIcon(ctx, cx,            cy + bh * 0.04, bw * 0.22, bh * 0.56, '#14532D', '#FDE047', '#FDE047');
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
      ctx.fillText(pig && pig.wearingJacket ? '✨ 3 SỌC CỰC CHẤT ✨' : 'GƯƠNG TOÀN THÂN', cx, cy - bh * 0.38, safeW);
    }
  );
}

function drawAdidasUpperWalls3D(ctx, cam) {
  drawAdidasClippedQuad(
    ctx, cam,
    [[-5.93, 2.70, 1.8], [-5.93, 2.70, 7.6], [-5.93, 1.00, 7.6], [-5.93, 1.00, 1.8]],
    '#5C341D', '#C89B3C', 2.2,
    function(cx, cy, bw, bh) {
      ctx.fillStyle = '#FFF5D6';
      ctx.fillRect(cx - bw * 0.46, cy - bh * 0.44, bw * 0.92, bh * 0.88);
      drawPixelJerseyIcon(ctx, cx - bw * 0.28, cy + bh * 0.18, bw * 0.22, bh * 0.44, '#DA251D', '#FDE047', '#FDE047');
      drawPixelJerseyIcon(ctx, cx,            cy + bh * 0.18, bw * 0.22, bh * 0.44, '#FFFBF1', '#DA251D', '#F43F5E');
      drawPixelJerseyIcon(ctx, cx + bw * 0.28, cy + bh * 0.18, bw * 0.22, bh * 0.44, '#0F766E', '#FDE047', '#FFFBF1');
    }
  );
  drawAdidasClippedQuad(
    ctx, cam,
    [[-1.45, 3.36, 14.72], [5.10, 3.36, 14.72], [5.10, 1.15, 14.72], [-1.45, 1.15, 14.72]],
    '#1F3A3D', '#F4B93B', 2.6,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(5, Math.min(11, Math.round(bh * 0.12)));
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FFFBF1'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('HOA SEN × 3 SỌC · HỘI AN', cx, cy - bh * 0.36, safeW);
    }
  );
  drawAdidasClippedQuad(
    ctx, cam,
    [[5.93, 3.30, 10.6], [5.93, 3.30, 3.6], [5.93, 1.25, 3.6], [5.93, 1.25, 10.6]],
    '#3B2314', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(5, Math.min(11, Math.round(bh * 0.12)));
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('QUẦY THU NGÂN · SAMBA OG', cx, cy - bh * 0.38, safeW);
    }
  );
}

function drawAdidasRoomWalls3D(ctx, cam, room, pig, t) {
  if (room === 'fitting') {
    drawAdidasFittingWalls3D(ctx, cam, pig, t);
  } else if (room === 'upper') {
    drawAdidasUpperWalls3D(ctx, cam);
  } else {
    drawAdidasHallWalls3D(ctx, cam);
  }
}
`;
}
