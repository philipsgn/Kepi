/**
 * Mỹ Thuật & Bộ Sinh Texture Thủ Tục WebGL 3D Hợp Nhất Ngôi Chùa Cổ Kính (Quyết định 250)
 * - 100% 0-CDN, sinh texture Power-of-Two trong RAM cho WebGL1 + bảo toàn Canvas2D fallback cho Headless Test 182.
 * - Gồm: Gạch tàu đỏ Bát Tràng, đá phiến, tường vôi vàng đất, ngói âm dương, mặt hồ sen + hoa sen hồng,
 *   gỗ lim sơn son thếp vàng, cửa sổ rặng trúc, hoành phi "TAM QUAN · CHÙA CỔ" / "CHÁNH ĐIỆN" / "ĐẠI HÙNG BẢO ĐIỆN",
 *   câu đối "TÂM THANH TỊNH" / "PHƯỚC AN KHANG", thư pháp "TÂM AN" & "TĨNH TÂM", bảng "ĐẠI HỒNG CHUNG",
 *   tranh Hoa Sen & Pháp Luân, chiếu cói Bát Tràng, bầu trời bình minh/hoàng hôn (Mode B), và buildPigBillboardTextures.
 */
export function buildPagodaWallArtScript(): string {
  return String.raw`
/* ==================== 1. BỘ SINH TEXTURE THỦ TỤC WEBGL 3D NGÔI CHÙA CỔ KÍNH ==================== */
function makePagodaSeedRng(seed) {
  var s = seed | 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPagodaProceduralTextures(wgl) {
  if (!wgl || typeof document === 'undefined') return;
  function mkCanvas(w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; return c;
  }

  // 1. Gạch tàu đỏ Bát Tràng sân Vườn Chùa (redBrickFloor)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makePagodaSeedRng(2501);
    g.fillStyle = '#A64B2A'; g.fillRect(0, 0, 256, 256);
    for (var row = 0; row < 4; row++) {
      for (var col = 0; col < 4; col++) {
        var bx = col * 64, by = row * 64;
        var shade = ((row + col) % 2 === 0) ? '#B25533' : '#9C4223';
        g.fillStyle = shade; g.fillRect(bx + 2, by + 2, 60, 60);
        g.fillStyle = 'rgba(255,224,180,0.08)'; g.fillRect(bx + 4, by + 4, 56, 6);
        g.strokeStyle = '#6E2A14'; g.lineWidth = 3; g.strokeRect(bx + 1, by + 1, 62, 62);
      }
    }
    for (var i = 0; i < 120; i++) {
      g.fillStyle = rng() > 0.5 ? 'rgba(62,24,10,0.12)' : 'rgba(224,148,96,0.10)';
      g.beginPath(); g.arc(rng() * 256, rng() * 256, 3 + rng() * 10, 0, Math.PI * 2); g.fill();
    }
    wgl.registerTextureCanvas('redBrickFloor', c, true);
  })();

  // 2. Đá phiến xanh xám & đá chạm Tam Cấp / Hồ Sen (stonePath)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makePagodaSeedRng(2502);
    g.fillStyle = '#B8B1A4'; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 256; y += 64) {
      var off = ((y / 64) % 2) * 48;
      for (var x = -48; x < 256; x += 96) {
        g.fillStyle = (Math.floor((x + y) / 32) % 2 === 0) ? '#C6BFB2' : '#ACA496';
        g.fillRect(x + off + 2, y + 2, 92, 60);
        g.strokeStyle = '#78716C'; g.lineWidth = 3; g.strokeRect(x + off + 1, y + 1, 94, 62);
      }
    }
    for (var k = 0; k < 140; k++) {
      g.fillStyle = rng() > 0.5 ? 'rgba(87,83,78,0.14)' : 'rgba(245,245,244,0.12)';
      g.beginPath(); g.arc(rng() * 256, rng() * 256, 2 + rng() * 8, 0, Math.PI * 2); g.fill();
    }
    wgl.registerTextureCanvas('stonePath', c, true);
  })();

  // 3. Tường vôi vàng đất cổ kính (ochreWall)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makePagodaSeedRng(2503);
    g.fillStyle = '#CFA054'; g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 200; i++) {
      g.fillStyle = rng() > 0.45 ? 'rgba(232,196,120,0.16)' : 'rgba(138,94,36,0.16)';
      g.beginPath(); g.arc(rng() * 256, rng() * 256, 8 + rng() * 30, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = 'rgba(104,68,24,0.20)'; g.lineWidth = 2;
    g.strokeRect(2, 2, 252, 252);
    wgl.registerTextureCanvas('ochreWall', c, true);
  })();

  // 4. Ngói âm dương đỏ nâu cổ truyền (yinYangRoof)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#7F1D1D'; g.fillRect(0, 0, 256, 256);
    for (var row = 0; row < 8; row++) {
      var ry = row * 32;
      for (var col = 0; col < 8; col++) {
        var rx = col * 32;
        g.fillStyle = '#991B1B'; g.fillRect(rx + 2, ry + 2, 28, 28);
        g.fillStyle = '#B91C1C';
        g.beginPath(); g.arc(rx + 16, ry + 26, 12, Math.PI, 0); g.fill();
        g.fillStyle = '#450A0A'; g.fillRect(rx, ry + 29, 32, 3);
      }
    }
    wgl.registerTextureCanvas('yinYangRoof', c, true);
  })();

  // 5. Mặt Hồ Sen xanh ngọc + lá sen + hoa sen hồng (lotusPondWater)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makePagodaSeedRng(2505);
    g.fillStyle = '#0D9488'; g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 90; i++) {
      g.fillStyle = rng() > 0.5 ? 'rgba(20,184,166,0.28)' : 'rgba(15,118,110,0.28)';
      g.beginPath(); g.ellipse(rng() * 256, rng() * 256, 14 + rng() * 24, 6 + rng() * 10, 0, 0, Math.PI * 2); g.fill();
    }
    var pads = [[46, 52], [198, 64], [64, 178], [186, 196], [128, 128], [218, 134]];
    for (var pi = 0; pi < pads.length; pi++) {
      var px = pads[pi][0], py = pads[pi][1];
      g.fillStyle = '#15803D';
      g.beginPath(); g.arc(px, py, 20, 0.25, Math.PI * 2 - 0.15); g.lineTo(px, py); g.closePath(); g.fill();
      g.fillStyle = '#22C55E';
      g.beginPath(); g.arc(px - 2, py - 2, 15, 0.3, Math.PI * 2 - 0.2); g.lineTo(px - 2, py - 2); g.closePath(); g.fill();
      if (pi % 2 === 0) {
        g.fillStyle = '#F472B6'; g.beginPath(); g.arc(px + 4, py - 4, 8, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#FBCFE8'; g.beginPath(); g.arc(px + 4, py - 5, 5, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#FDE047'; g.beginPath(); g.arc(px + 4, py - 4, 2.5, 0, Math.PI * 2); g.fill();
      }
    }
    wgl.registerTextureCanvas('lotusPondWater', c, true);
  })();

  // 6. Gỗ lim sơn son / gỗ gụ cổ kính (darkTimber)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makePagodaSeedRng(2506);
    g.fillStyle = '#521E14'; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 256; y += 4) {
      g.fillStyle = (y % 8 === 0) ? 'rgba(34,10,6,0.34)' : 'rgba(116,42,26,0.22)';
      g.fillRect(0, y, 256, 2);
    }
    for (var m = 0; m < 10; m++) {
      g.strokeStyle = 'rgba(28,8,4,0.28)';
      g.beginPath(); g.ellipse(rng() * 256, rng() * 256, 20, 5, 0, 0, Math.PI * 2); g.stroke();
    }
    wgl.registerTextureCanvas('darkTimber', c, true);
  })();

  // 7. Sàn gỗ gụ Chánh Điện & ván gỗ Thiền Trà (mahoganyFloor / teaWoodFloor)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#5C261B'; g.fillRect(0, 0, 256, 256);
    for (var x = 0; x < 256; x += 32) {
      g.fillStyle = (x % 64 === 0) ? '#682D20' : '#4E1F15';
      g.fillRect(x + 1, 0, 30, 256);
      g.fillStyle = '#33120B'; g.fillRect(x, 0, 2, 256);
    }
    wgl.registerTextureCanvas('mahoganyFloor', c, true);

    var tc = mkCanvas(256, 256), tg = tc.getContext('2d');
    tg.fillStyle = '#7C5230'; tg.fillRect(0, 0, 256, 256);
    for (var x2 = 0; x2 < 256; x2 += 32) {
      tg.fillStyle = (x2 % 64 === 0) ? '#885B36' : '#6F4829';
      tg.fillRect(x2 + 1, 0, 30, 256);
      tg.fillStyle = '#4A2C1A'; tg.fillRect(x2, 0, 2, 256);
    }
    wgl.registerTextureCanvas('teaWoodFloor', tc, true);
  })();

  // 8. Sơn son thếp vàng (goldLacquer)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#8B1E1E'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#F59E0B'; g.lineWidth = 10; g.strokeRect(10, 10, 236, 236);
    g.strokeStyle = '#FDE047'; g.lineWidth = 3; g.strokeRect(22, 22, 212, 212);
    wgl.registerTextureCanvas('goldLacquer', c, true);
  })();

  // 9. Cửa sổ song gỗ nhìn ra rặng trúc xanh (bambooWindow)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#ECFCCB'; g.fillRect(0, 0, 256, 148);
    g.fillStyle = '#BEF264'; g.fillRect(0, 148, 256, 108);
    var stalks = [34, 68, 102, 138, 174, 212];
    for (var i = 0; i < stalks.length; i++) {
      var sx = stalks[i];
      g.fillStyle = i % 2 === 0 ? '#3F6212' : '#4D7C0F';
      g.fillRect(sx - 5, 10, 10, 236);
      g.fillStyle = '#A3E635';
      g.fillRect(sx - 6, 70 + (i % 2) * 20, 12, 3);
      g.fillRect(sx - 6, 160 + (i % 2) * 16, 12, 3);
      g.fillStyle = '#65A30D';
      g.beginPath(); g.ellipse(sx + 14, 52 + (i % 3) * 32, 16, 6, -0.35, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(sx - 14, 112 + (i % 2) * 34, 15, 5, 0.35, 0, Math.PI * 2); g.fill();
    }
    g.strokeStyle = '#4A2C1A'; g.lineWidth = 14; g.strokeRect(7, 7, 242, 242);
    g.lineWidth = 8;
    g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 256); g.moveTo(0, 128); g.lineTo(256, 128); g.stroke();
    wgl.registerTextureCanvas('bambooWindow', c, false);
  })();

  // 10. Bộ Hoành Phi & Biển Cổng Sơn Son Thếp Vàng
  function makePlaque(key, text, bg, border, textCol, fontPx) {
    var c = mkCanvas(512, 128), g = c.getContext('2d');
    g.fillStyle = bg; g.fillRect(0, 0, 512, 128);
    g.strokeStyle = border; g.lineWidth = 8; g.strokeRect(8, 8, 496, 112);
    g.strokeStyle = '#FEF08A'; g.lineWidth = 2; g.strokeRect(18, 18, 476, 92);
    g.fillStyle = textCol; g.font = 'bold ' + (fontPx || 36) + 'px serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, 256, 66, 456);
    wgl.registerTextureCanvas(key, c, false);
  }
  makePlaque('tamQuanSign', 'TAM QUAN · CHÙA CỔ', '#7F1D1D', '#F59E0B', '#FDE047', 38);
  makePlaque('chanhDienSign', '✦ CHÁNH ĐIỆN ✦', '#7F1D1D', '#F59E0B', '#FDE047', 40);
  makePlaque('daiHungSign', 'ĐẠI HÙNG BẢO ĐIỆN', '#7F1D1D', '#F59E0B', '#FDE047', 40);
  makePlaque('bellSign', 'ĐẠI HỒNG CHUNG', '#5C341D', '#F59E0B', '#FDE047', 38);
  makePlaque('thienTraSign', 'THIỀN TRÀ · ĐẠI HỒNG CHUNG', '#365314', '#FDE047', '#FEF08A', 30);

  // 11. Đôi Câu Đối "TÂM THANH TỊNH" / "PHƯỚC AN KHANG"
  function makeCouplet(key, words) {
    var c = mkCanvas(128, 512), g = c.getContext('2d');
    g.fillStyle = '#991B1B'; g.fillRect(0, 0, 128, 512);
    g.strokeStyle = '#F59E0B'; g.lineWidth = 8; g.strokeRect(8, 8, 112, 496);
    g.fillStyle = '#FDE047'; g.font = 'bold 30px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (var i = 0; i < words.length; i++) {
      g.fillText(words[i], 64, 118 + i * 136, 100);
    }
    wgl.registerTextureCanvas(key, c, false);
  }
  makeCouplet('coupletLeft', ['TÂM', 'THANH', 'TỊNH']);
  makeCouplet('coupletRight', ['PHƯỚC', 'AN', 'KHANG']);

  // 12. Thư Pháp "TÂM AN" & "TĨNH TÂM" trên giấy dó
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#F5EAD3'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#4A2C1A'; g.fillRect(0, 0, 256, 18); g.fillRect(0, 238, 256, 18);
    g.strokeStyle = '#8C6E3B'; g.lineWidth = 4; g.strokeRect(10, 24, 236, 208);
    // Cành sen thủy mặc nhẹ
    g.fillStyle = '#F472B6'; g.beginPath(); g.arc(62, 188, 16, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#15803D'; g.beginPath(); g.ellipse(90, 202, 22, 9, -0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1C1917'; g.font = 'bold 54px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('TÂM AN', 128, 112, 220);
    g.fillStyle = '#991B1B'; g.font = 'bold 16px monospace';
    g.fillText('· THIỀN TRÀ THANH TỊNH ·', 128, 162, 220);
    g.fillStyle = '#B91C1C'; g.fillRect(198, 44, 24, 24);
    wgl.registerTextureCanvas('tamAnScroll', c, false);

    var c2 = mkCanvas(256, 256), g2 = c2.getContext('2d');
    g2.fillStyle = '#F5EAD3'; g2.fillRect(0, 0, 256, 256);
    g2.fillStyle = '#4A2C1A'; g2.fillRect(0, 0, 256, 18); g2.fillRect(0, 238, 256, 18);
    g2.strokeStyle = '#8C6E3B'; g2.lineWidth = 4; g2.strokeRect(10, 24, 236, 208);
    g2.fillStyle = '#1C1917'; g2.font = 'bold 46px serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle';
    g2.fillText('TĨNH', 128, 96, 200);
    g2.fillText('TÂM', 128, 158, 200);
    g2.fillStyle = '#B91C1C'; g2.fillRect(192, 188, 20, 20);
    wgl.registerTextureCanvas('tinhTamScroll', c2, false);
  })();

  // 13. Tranh Hoa Sen Vàng & Bánh Xe Pháp Luân trên tường Chánh Điện (lotusDharmaArt)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#5C1D14'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#D97706'; g.lineWidth = 10; g.strokeRect(8, 8, 240, 240);
    g.strokeStyle = '#F59E0B'; g.lineWidth = 5;
    g.beginPath(); g.arc(128, 118, 62, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(128, 118, 20, 0, Math.PI * 2); g.stroke();
    for (var s = 0; s < 8; s++) {
      var a = (s * Math.PI) / 4;
      g.beginPath();
      g.moveTo(128 + Math.cos(a) * 20, 118 + Math.sin(a) * 20);
      g.lineTo(128 + Math.cos(a) * 76, 118 + Math.sin(a) * 76);
      g.stroke();
    }
    g.fillStyle = '#F472B6';
    for (var p = -2; p <= 2; p++) {
      g.save(); g.translate(128, 204); g.rotate(p * 0.34);
      g.beginPath(); g.ellipse(0, -14, 11, 22, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    g.fillStyle = '#FDE047'; g.beginPath(); g.arc(128, 200, 9, 0, Math.PI * 2); g.fill();
    wgl.registerTextureCanvas('lotusDharmaArt', c, false);
  })();

  // 14. Chiếu cói Bát Tràng & Bầu trời bình minh/hoàng hôn (sedgeMat, skyBackdrop)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#D6BE8A'; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 256; y += 8) {
      g.fillStyle = (y % 16 === 0) ? 'rgba(160,126,64,0.22)' : 'rgba(245,232,196,0.22)';
      g.fillRect(0, y, 256, 4);
    }
    g.strokeStyle = '#991B1B'; g.lineWidth = 14; g.strokeRect(7, 7, 242, 242);
    wgl.registerTextureCanvas('sedgeMat', c, true);

    var sc = mkCanvas(512, 256), sg = sc.getContext('2d');
    sg.fillStyle = '#FDE68A'; sg.fillRect(0, 0, 512, 256);
    sg.fillStyle = '#FCD34D'; sg.fillRect(0, 0, 512, 92);
    sg.fillStyle = '#FBBF24'; sg.fillRect(0, 0, 512, 42);
    sg.fillStyle = '#FFFBEB'; sg.beginPath(); sg.arc(256, 138, 44, 0, Math.PI * 2); sg.fill();
    sg.fillStyle = 'rgba(255,255,255,0.48)';
    sg.beginPath(); sg.ellipse(110, 72, 62, 18, 0, 0, Math.PI * 2); sg.fill();
    sg.beginPath(); sg.ellipse(390, 90, 74, 20, 0, 0, Math.PI * 2); sg.fill();
    wgl.registerTextureCanvas('skyBackdrop', sc, false);
  })();

  // 15. Bộ Sprite Heo 24×20 Đồng Bộ Toàn App (gl.NEAREST)
  if (typeof buildPigBillboardTextures === 'function') {
    buildPigBillboardTextures(wgl);
  }
}

/* ==================== 2. FALLBACK CANVAS2D CHO HEADLESS TEST 182 ==================== */
function drawPagodaClippedQuad(ctx, cam, pts, bgCol, borderCol, lineW, drawInner) {
  if (!ctx || typeof projectPoint3D !== 'function') return;
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
  ctx.moveTo(p0.sx, p0.sy); ctx.lineTo(p1.sx, p1.sy);
  ctx.lineTo(p2.sx, p2.sy); ctx.lineTo(p3.sx, p3.sy);
  ctx.closePath(); ctx.clip();
  if (drawInner) drawInner(cx, cy, bw, bh, Math.max(8, bw * 0.84));
  ctx.restore();
}

function drawLotusEmblem2D(ctx, cx, cy, rad) {
  ctx.fillStyle = '#F472B6';
  for (var i = -2; i <= 2; i++) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(i * 0.34);
    ctx.beginPath(); ctx.ellipse(0, -rad * 0.36, rad * 0.24, rad * 0.56, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#FDE047';
  ctx.beginPath(); ctx.arc(cx, cy - rad * 0.08, rad * 0.22, 0, Math.PI * 2); ctx.fill();
}

function drawDharmaWheel2D(ctx, cx, cy, rad) {
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = Math.max(1.2, rad * 0.14);
  ctx.beginPath(); ctx.arc(cx, cy, rad * 0.72, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, rad * 0.22, 0, Math.PI * 2); ctx.stroke();
  for (var s = 0; s < 8; s++) {
    var a = s * Math.PI * 0.25;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * rad * 0.22, cy + Math.sin(a) * rad * 0.22);
    ctx.lineTo(cx + Math.cos(a) * rad * 0.88, cy + Math.sin(a) * rad * 0.88);
    ctx.stroke();
  }
}

function drawPagodaGardenWalls3D(ctx, cam) {
  drawPoly3D(ctx, cam, [[-6.2, 3.05, 0], [-6.2, 3.05, 14.8], [-5.88, 2.75, 14.8], [-5.88, 2.75, 0]], '#991B1B', '#5C1111', 1.4);
  drawPoly3D(ctx, cam, [[6.2, 3.05, 10.4], [6.2, 3.05, 0], [5.88, 2.75, 0], [5.88, 2.75, 10.4]], '#991B1B', '#5C1111', 1.4);
  drawPoly3D(ctx, cam, [[-6.2, 3.22, 14.74], [6.2, 3.22, 14.74], [6.2, 2.86, 14.42], [-6.2, 2.86, 14.42]], '#991B1B', '#5C1111', 1.5);
  var medZs = [2.6, 6.4, 10.4];
  for (var mi = 0; mi < medZs.length; mi++) {
    var mz = medZs[mi];
    drawPagodaClippedQuad(ctx, cam,
      [[-6.14, 2.25, mz - 0.65], [-6.14, 2.25, mz + 0.65], [-6.14, 1.15, mz + 0.65], [-6.14, 1.15, mz - 0.65]],
      '#9A3412', '#F59E0B', 1.8,
      function(cx, cy, bw, bh) {
        var r = Math.min(bw, bh) * 0.36;
        ctx.fillStyle = '#7C2D12'; ctx.beginPath(); ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2); ctx.fill();
        drawLotusEmblem2D(ctx, cx, cy + r * 0.12, r * 0.85);
      }
    );
  }
  drawPagodaClippedQuad(ctx, cam,
    [[-2.0, 3.35, 14.74], [2.0, 3.35, 14.74], [2.0, 2.70, 14.74], [-2.0, 2.70, 14.74]],
    '#7F1D1D', '#F59E0B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(14, Math.round(bh * 0.42)));
      ctx.font = 'bold ' + px + 'px monospace'; ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('✦ CHÁNH ĐIỆN ✦', cx, cy, safeW);
    }
  );
  drawPagodaClippedQuad(ctx, cam,
    [[1.95, 3.25, 0.06], [-1.95, 3.25, 0.06], [-1.95, 2.65, 0.06], [1.95, 2.65, 0.06]],
    '#7F1D1D', '#F59E0B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.38)));
      ctx.font = 'bold ' + px + 'px monospace'; ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('TAM QUAN · CHÙA CỔ', cx, cy, safeW);
    }
  );
}

function drawPagodaMainHallWalls3D(ctx, cam) {
  drawPagodaClippedQuad(ctx, cam,
    [[-2.85, 4.05, 27.50], [2.85, 4.05, 27.50], [2.85, 3.30, 27.50], [-2.85, 3.30, 27.50]],
    '#7F1D1D', '#F59E0B', 2.4,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(6, Math.min(14, Math.round(bh * 0.38)));
      ctx.font = 'bold ' + px + 'px monospace'; ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ĐẠI HÙNG BẢO ĐIỆN', cx, cy, safeW);
    }
  );
  drawPagodaClippedQuad(ctx, cam,
    [[-4.75, 3.45, 27.48], [-3.75, 3.45, 27.48], [-3.75, 1.35, 27.48], [-4.75, 1.35, 27.48]],
    '#991B1B', '#F59E0B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var words = ['TÂM', 'THANH', 'TỊNH'];
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.14)));
      ctx.font = 'bold ' + px + 'px monospace'; ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var i = 0; i < words.length; i++) ctx.fillText(words[i], cx, cy - bh * 0.26 + i * bh * 0.26, safeW);
    }
  );
  drawPagodaClippedQuad(ctx, cam,
    [[3.75, 3.45, 27.48], [4.75, 3.45, 27.48], [4.75, 1.35, 27.48], [3.75, 1.35, 27.48]],
    '#991B1B', '#F59E0B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var words = ['PHƯỚC', 'AN', 'KHANG'];
      var px = Math.max(5, Math.min(11, Math.round(bh * 0.14)));
      ctx.font = 'bold ' + px + 'px monospace'; ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var i = 0; i < words.length; i++) ctx.fillText(words[i], cx, cy - bh * 0.26 + i * bh * 0.26, safeW);
    }
  );
}

function drawPagodaBellTeaWalls3D(ctx, cam) {
  drawPagodaClippedQuad(ctx, cam,
    [[16.72, 3.48, 8.1], [16.72, 3.48, 11.1], [16.72, 1.38, 11.1], [16.72, 1.38, 8.1]],
    '#F5EAD3', '#5C341D', 2.4,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(8, Math.min(20, Math.round(bh * 0.28)));
      ctx.font = 'bold ' + px + 'px serif'; ctx.fillStyle = '#1C1917';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('TÂM AN', cx, cy, safeW);
    }
  );
  drawPagodaClippedQuad(ctx, cam,
    [[8.6, 3.48, 14.72], [12.4, 3.48, 14.72], [12.4, 2.78, 14.72], [8.6, 2.78, 14.72]],
    '#5C341D', '#F59E0B', 2.0,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(12, Math.round(bh * 0.36)));
      ctx.font = 'bold ' + px + 'px monospace'; ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ĐẠI HỒNG CHUNG', cx, cy, safeW);
    }
  );
}

function drawPagodaWalls3D(ctx, cam) {
  drawPagodaGardenWalls3D(ctx, cam);
  drawPagodaMainHallWalls3D(ctx, cam);
  drawPagodaBellTeaWalls3D(ctx, cam);
}
`;
}
