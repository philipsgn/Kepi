/**
 * Bộ Sinh Texture Thủ Tục Sân Vận Động Trống Đồng FIFA WebGL 3D + Fallback Canvas2D (Quyết định 250)
 * - Sinh các Texture Power-of-Two (256×256 / 512×256) trực tiếp trong RAM (<15ms, 0 CDN mạng):
 *   1. lockerFloor: Sàn gạch thể thao xám-đá phòng thay đồ ĐT Việt Nam.
 *   2. redCarpet: Thảm đỏ hoàng gia FIFA viền vàng chạy dọc Đường Hầm & Phòng Cúp Vàng.
 *   3. lockerWall: Tường gỗ-đỏ ĐT Việt Nam ấm áp.
 *   4. lockerCabinet: Dãy tủ gỗ-đỏ treo Áo Đấu Đỏ Sao Vàng (#10, #19, #22, #9) & giày đinh vàng.
 *   5. tacticsBoard: Bảng chiến thuật phát sáng "CHIẾN THUẬT 4-3-3 · ĐỘI TUYỂN VIỆT NAM".
 *   6. tunnelSign: Biển vòm Đường Hầm FIFA "⚽ RA SÂN THI ĐẤU → · TRỐNG ĐỒNG ARENA".
 *   7. pisteTrack: Đường chạy điền kinh đỏ terracotta 6 làn kẻ vạch trắng.
 *   8. fifaGrass: Thảm cỏ FIFA 2 tông xanh mượt mà.
 *   9. dongSonCenter: Phù điêu Mặt Trời Trống Đồng Đông Sơn 12 tia phát sáng giữa sân & tường VIP.
 *  10. grandstandRedGold: Khán đài Cờ Đỏ Sao Vàng cổ động viên 4 phía.
 *  11. bannerVnChamp: Đại biểu ngữ "★ VIỆT NAM VÔ ĐỊCH · TRỐNG ĐỒNG ARENA ★".
 *  12. ensureScoreboardTex: Bảng điện tử LED động "VIỆT NAM X - 0 ĐỘI KHÁCH".
 *  13. vipMarble: Sàn đá cẩm thạch kem sang trọng tầng VIP & Skybox.
 *  14. vipPressBackdrop: Phông nền "HỌP BÁO QUỐC TẾ · TRỐNG ĐỒNG ARENA".
 *  15. hallOfChampions: Tường danh vọng Hall of Champions với 3 áo đấu lịch sử #10/#19/#22.
 *  16. skyNightDome: Bầu trời đêm đại chiến rực ánh đèn pha SVĐ (Chế độ B).
 *  17. roofTrongDong: Mái vòm Trống Đồng Đông Sơn nan đồng mạ vàng.
 *  18. buildPigBillboardTextures(wgl, ['vn_kit']): Sprite chú Heo 24×20 mặc áo đấu ĐT Việt Nam (gl.NEAREST).
 */
export function buildStadiumWallArtScript(): string {
  return String.raw`
/* ==================== 1. BỘ SINH TEXTURE THỦ TỤC WEBGL 3D CHO SVĐ TRỐNG ĐỒNG FIFA ==================== */
function makeStadiumSeedRng(seed) {
  var s = seed | 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawDongSonStarAndRays2D(g, cx, cy, r, ringCol, coreCol) {
  g.save();
  g.strokeStyle = ringCol || '#F4B93B';
  g.lineWidth = Math.max(2, r * 0.07);
  g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(cx, cy, r * 0.72, 0, Math.PI * 2); g.stroke();
  g.fillStyle = coreCol || '#FDE047';
  for (var i = 0; i < 12; i++) {
    var a = (i * Math.PI * 2) / 12;
    g.beginPath();
    g.moveTo(cx + Math.cos(a - 0.13) * r * 0.28, cy + Math.sin(a - 0.13) * r * 0.28);
    g.lineTo(cx + Math.cos(a) * r * 0.68, cy + Math.sin(a) * r * 0.68);
    g.lineTo(cx + Math.cos(a + 0.13) * r * 0.28, cy + Math.sin(a + 0.13) * r * 0.28);
    g.closePath();
    g.fill();
  }
  g.beginPath(); g.arc(cx, cy, r * 0.25, 0, Math.PI * 2); g.fill();
  g.restore();
}

function drawJerseyPanel2D(g, cx, cy, w, h, numStr) {
  g.fillStyle = '#DA251D';
  g.fillRect(cx - w * 0.42, cy - h * 0.36, w * 0.84, h * 0.22);
  g.fillRect(cx - w * 0.28, cy - h * 0.36, w * 0.56, h * 0.56);
  g.fillStyle = '#FDE047';
  g.fillRect(cx - w * 0.12, cy - h * 0.36, w * 0.24, h * 0.06);
  g.fillRect(cx - w * 0.40, cy - h * 0.36, w * 0.10, h * 0.04);
  g.fillRect(cx + w * 0.30, cy - h * 0.36, w * 0.10, h * 0.04);
  g.font = 'bold ' + Math.max(12, Math.round(h * 0.20)) + 'px monospace';
  g.fillStyle = '#FDE047';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(numStr || '10', cx, cy - h * 0.07);
  g.strokeStyle = '#450A0A'; g.lineWidth = 2;
  g.strokeRect(cx - w * 0.28, cy - h * 0.36, w * 0.56, h * 0.56);
  g.fillStyle = '#5C341D';
  g.fillRect(cx - w * 0.44, cy + h * 0.24, w * 0.88, h * 0.07);
  g.fillStyle = '#FACC15';
  g.fillRect(cx - w * 0.28, cy + h * 0.15, w * 0.22, h * 0.09);
  g.fillRect(cx + w * 0.06, cy + h * 0.15, w * 0.22, h * 0.09);
}

function ensureStadiumScoreboardTex(wgl, vnScore, flash) {
  var sc = typeof vnScore === 'number' ? vnScore : 2;
  var fl = flash ? 1 : 0;
  var key = 'sbLed_' + sc + '_' + fl;
  if (wgl.hasTexture(key)) return key;
  var c = document.createElement('canvas'); c.width = 512; c.height = 128;
  var g = c.getContext('2d');
  g.fillStyle = fl ? '#7F1D1D' : '#0F172A';
  g.fillRect(0, 0, 512, 128);
  g.strokeStyle = '#FDE047'; g.lineWidth = 6;
  g.strokeRect(5, 5, 502, 118);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = '#FDE047'; g.font = 'bold 34px monospace';
  g.fillText('VIỆT NAM ' + sc + ' - 0 ĐỘI KHÁCH', 256, 46);
  g.fillStyle = fl ? '#FEF08A' : '#4ADE80'; g.font = 'bold 20px monospace';
  g.fillText(fl ? '⚽ VÀOOOOO! SIÊU PHẨM TRỐNG ĐỒNG! ⚽' : '⏱ 89:45 · SÂN VẬN ĐỘNG TRỐNG ĐỒNG FIFA', 256, 92);
  wgl.registerTextureCanvas(key, c, false);
  return key;
}

function buildStadiumProceduralTextures(wgl) {
  function mkCanvas(w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; return c;
  }

  // 1. Sàn phòng thay đồ xám đá thể thao (lockerFloor)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makeStadiumSeedRng(2501);
    g.fillStyle = '#334155'; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 256; y += 64) {
      for (var x = 0; x < 256; x += 64) {
        g.fillStyle = ((x / 64 + y / 64) % 2 === 0) ? '#3B4A5E' : '#2E3C4E';
        g.fillRect(x + 2, y + 2, 60, 60);
      }
    }
    for (var i = 0; i < 160; i++) {
      g.fillStyle = rng() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.12)';
      g.fillRect(rng() * 256, rng() * 256, 6, 6);
    }
    wgl.registerTextureCanvas('lockerFloor', c, true);
  })();

  // 2. Thảm đỏ FIFA viền vàng (redCarpet)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#991B1B'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#B91C1C'; g.fillRect(20, 0, 216, 256);
    g.fillStyle = '#F4B93B'; g.fillRect(6, 0, 10, 256); g.fillRect(240, 0, 10, 256);
    g.fillStyle = '#FDE047'; g.fillRect(24, 0, 4, 256); g.fillRect(228, 0, 4, 256);
    wgl.registerTextureCanvas('redCarpet', c, true);
  })();

  // 3. Tường gỗ-đỏ ĐT Việt Nam (lockerWall)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#4A1812'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#5C1E16';
    for (var x = 0; x < 256; x += 64) {
      g.fillRect(x + 4, 8, 56, 240);
      g.strokeStyle = '#36100B'; g.lineWidth = 3; g.strokeRect(x + 4, 8, 56, 240);
    }
    g.fillStyle = '#F4B93B'; g.fillRect(0, 232, 256, 8);
    wgl.registerTextureCanvas('lockerWall', c, true);
  })();

  // 4. Dãy 4 tủ gỗ-đỏ treo Áo Đấu ĐT Việt Nam #10, #19, #22, #9 (lockerCabinet)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#3B1810'; g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#7F1D1D'; g.fillRect(6, 6, 500, 38);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 4; g.strokeRect(6, 6, 500, 244);
    g.fillStyle = '#FDE047'; g.font = 'bold 20px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('★ PHÒNG THAY ĐỒ ĐỘI TUYỂN VIỆT NAM ★', 256, 25);
    var nums = ['#10', '#19', '#22', '#9'];
    var roles = ['TIỀN ĐẠO', 'TIỀN VỆ', 'TRUNG PHONG', 'CÁNH PHẢI'];
    for (var i = 0; i < 4; i++) {
      var lx = 14 + i * 122;
      g.fillStyle = '#FFF5D6'; g.fillRect(lx, 54, 114, 152);
      g.strokeStyle = '#F4B93B'; g.lineWidth = 3; g.strokeRect(lx, 54, 114, 186);
      drawJerseyPanel2D(g, lx + 57, 130, 96, 128, nums[i]);
      g.fillStyle = '#FDE047'; g.font = 'bold 12px monospace';
      g.fillText(roles[i], lx + 57, 224);
    }
    wgl.registerTextureCanvas('lockerCabinet', c, false);
  })();

  // 5. Bảng chiến thuật 4-3-3 (tacticsBoard)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#14532D'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 6; g.strokeRect(6, 6, 500, 244);
    g.fillStyle = '#FDE047'; g.font = 'bold 20px monospace'; g.textAlign = 'center';
    g.fillText('CHIẾN THUẬT 4-3-3 · ĐỘI TUYỂN VIỆT NAM', 256, 32);
    g.fillStyle = '#166534'; g.fillRect(28, 48, 456, 186);
    g.strokeStyle = '#DCFCE7'; g.lineWidth = 3; g.strokeRect(34, 54, 444, 174);
    g.beginPath(); g.moveTo(256, 54); g.lineTo(256, 228); g.stroke();
    g.beginPath(); g.arc(256, 141, 34, 0, Math.PI * 2); g.stroke();
    var pts = [
      [68, 141], [138, 78], [138, 118], [138, 164], [138, 204],
      [256, 88], [256, 141], [256, 194],
      [386, 82], [412, 141], [386, 200]
    ];
    for (var i = 0; i < pts.length; i++) {
      g.fillStyle = i === 0 ? '#FACC15' : '#DC2626';
      g.beginPath(); g.arc(pts[i][0], pts[i][1], 11, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#FEF08A'; g.lineWidth = 2; g.stroke();
    }
    wgl.registerTextureCanvas('tacticsBoard', c, false);
  })();

  // 6. Biển vòm Đường Hầm FIFA (tunnelSign)
  (function() {
    var c = mkCanvas(512, 128), g = c.getContext('2d');
    g.fillStyle = '#991B1B'; g.fillRect(0, 0, 512, 128);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 6; g.strokeRect(6, 6, 500, 116);
    g.fillStyle = '#FDE047'; g.font = 'bold 28px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('⚽ RA SÂN THI ĐẤU → · FIFA TUNNEL', 256, 48);
    g.fillStyle = '#FFFBF1'; g.font = 'bold 18px monospace';
    g.fillText('TRỐNG ĐỒNG ARENA · ĐỘI TUYỂN VIỆT NAM', 256, 92);
    wgl.registerTextureCanvas('tunnelSign', c, false);
  })();

  // 7. Đường chạy piste điền kinh đỏ terracotta (pisteTrack)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#9A3412'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#B45309';
    for (var x = 0; x < 256; x += 64) {
      g.fillRect(x, 0, 3, 256);
      g.fillStyle = 'rgba(255,255,255,0.65)';
      g.fillRect(x, 0, 2, 256);
      g.fillStyle = '#B45309';
    }
    wgl.registerTextureCanvas('pisteTrack', c, true);
  })();

  // 8. Thảm cỏ FIFA 2 tông xanh (fifaGrass)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d'), rng = makeStadiumSeedRng(2508);
    g.fillStyle = '#15803D'; g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#16A34A'; g.fillRect(0, 128, 256, 128);
    for (var i = 0; i < 220; i++) {
      g.fillStyle = rng() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(5,46,22,0.08)';
      g.fillRect(rng() * 256, rng() * 256, 4, 8);
    }
    wgl.registerTextureCanvas('fifaGrass', c, true);
  })();

  // 9. Hoa văn Mặt Trời Trống Đồng Đông Sơn 12 tia (dongSonCenter)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.clearRect(0, 0, 256, 256);
    drawDongSonStarAndRays2D(g, 128, 128, 114, '#FDE047', '#FEF08A');
    wgl.registerTextureCanvas('dongSonCenter', c, false);
  })();

  // 10. Khán đài Cờ Đỏ Sao Vàng cổ động viên 4 phía (grandstandRedGold)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d'), rng = makeStadiumSeedRng(2510);
    g.fillStyle = '#450A0A'; g.fillRect(0, 0, 512, 256);
    for (var r = 0; r < 5; r++) {
      var ry = 10 + r * 48;
      g.fillStyle = r % 2 === 0 ? '#7F1D1D' : '#991B1B';
      g.fillRect(0, ry + 26, 512, 16);
      for (var cx = 12; cx < 504; cx += 24) {
        var j = (rng() - 0.5) * 4;
        g.fillStyle = ((cx + r) % 3 === 0) ? '#FACC15' : '#DC2626';
        g.fillRect(cx - 7, ry + 10 + j, 14, 18);
        g.fillStyle = '#FDE68A';
        g.fillRect(cx - 4, ry + 2 + j, 8, 8);
        if ((cx / 24 + r) % 4 === 0) {
          g.fillStyle = '#DA251D'; g.fillRect(cx + 5, ry - 4 + j, 16, 11);
          g.fillStyle = '#FFFF00'; g.fillRect(cx + 11, ry - 1 + j, 4, 4);
        }
      }
    }
    wgl.registerTextureCanvas('grandstandRedGold', c, true);
  })();

  // 11. Đại biểu ngữ khán đài (bannerVnChamp)
  (function() {
    var c = mkCanvas(512, 128), g = c.getContext('2d');
    g.fillStyle = '#DA251D'; g.fillRect(0, 0, 512, 128);
    g.strokeStyle = '#FDE047'; g.lineWidth = 6; g.strokeRect(5, 5, 502, 118);
    g.fillStyle = '#FDE047'; g.font = 'bold 26px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('★ VIỆT NAM VÔ ĐỊCH · TRỐNG ĐỒNG ARENA ★', 256, 64);
    wgl.registerTextureCanvas('bannerVnChamp', c, false);
  })();

  // 12. LED Scoreboard ban đầu
  ensureStadiumScoreboardTex(wgl, 2, false);

  // 13. Sàn đá cẩm thạch VIP (vipMarble)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#E7E0D0'; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 256; y += 64) {
      for (var x = 0; x < 256; x += 64) {
        g.fillStyle = ((x / 64 + y / 64) % 2 === 0) ? '#EDE6D6' : '#D6CCB8';
        g.fillRect(x + 1, y + 1, 62, 62);
      }
    }
    wgl.registerTextureCanvas('vipMarble', c, true);
  })();

  // 14. Phông nền Họp Báo Quốc Tế (vipPressBackdrop)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#7F1D1D'; g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#991B1B'; g.fillRect(14, 14, 484, 228);
    g.strokeStyle = '#FDE047'; g.lineWidth = 6; g.strokeRect(10, 10, 492, 236);
    drawDongSonStarAndRays2D(g, 256, 138, 68, '#FDE047', '#FEF08A');
    g.fillStyle = '#FDE047'; g.font = 'bold 24px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('HỌP BÁO QUỐC TẾ · TRỐNG ĐỒNG ARENA', 256, 44);
    g.fillStyle = '#FFFBF1'; g.font = 'bold 17px monospace';
    g.fillText('★ FIFA WORLD CHAMPIONS · ĐỘI TUYỂN VIỆT NAM ★', 256, 224);
    wgl.registerTextureCanvas('vipPressBackdrop', c, false);
  })();

  // 15. Tường Danh Vọng Hall of Champions (hallOfChampions)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d');
    g.fillStyle = '#451A03'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#F4B93B'; g.lineWidth = 6; g.strokeRect(8, 8, 496, 240);
    g.fillStyle = '#FDE047'; g.font = 'bold 22px monospace'; g.textAlign = 'center';
    g.fillText('★ HALL OF CHAMPIONS · VIỆT NAM ★', 256, 40);
    var xs = [110, 256, 402];
    var ns = ['10', '19', '22'];
    for (var i = 0; i < 3; i++) {
      g.fillStyle = '#7F1D1D'; g.fillRect(xs[i] - 58, 62, 116, 166);
      g.strokeStyle = '#FDE047'; g.lineWidth = 3; g.strokeRect(xs[i] - 58, 62, 116, 166);
      drawJerseyPanel2D(g, xs[i], 144, 88, 120, ns[i]);
    }
    wgl.registerTextureCanvas('hallOfChampions', c, false);
  })();

  // 16. Bầu trời đêm đại chiến rực ánh đèn pha SVĐ (skyNightDome)
  (function() {
    var c = mkCanvas(512, 256), g = c.getContext('2d'), rng = makeStadiumSeedRng(2516);
    var grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, '#071026');
    grd.addColorStop(0.55, '#0F224A');
    grd.addColorStop(1, '#1E3A8A');
    g.fillStyle = grd; g.fillRect(0, 0, 512, 256);
    for (var i = 0; i < 80; i++) {
      g.fillStyle = rng() > 0.3 ? 'rgba(255,255,255,0.65)' : 'rgba(254,240,138,0.85)';
      g.fillRect(rng() * 512, rng() * 145, 2, 2);
    }
    wgl.registerTextureCanvas('skyNightDome', c, true);
  })();

  // 17. Mái vòm Trống Đồng Đông Sơn mạ đồng vàng (roofTrongDong)
  (function() {
    var c = mkCanvas(256, 256), g = c.getContext('2d');
    g.fillStyle = '#78350F'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#92400E';
    for (var x = 0; x < 256; x += 32) {
      g.fillRect(x + 2, 0, 28, 256);
      g.fillStyle = '#F4B93B'; g.fillRect(x + 14, 0, 4, 256);
      g.fillStyle = '#92400E';
    }
    g.strokeStyle = '#FDE047'; g.lineWidth = 4; g.strokeRect(2, 2, 252, 252);
    wgl.registerTextureCanvas('roofTrongDong', c, true);
  })();

  // 18. Sprite chú Heo Mascot 24×20 (bao gồm bộ trang phục Áo Đấu ĐT Việt Nam 'vn_kit')
  if (typeof buildPigBillboardTextures === 'function') {
    buildPigBillboardTextures(wgl, ['vn_kit']);
  }
}

/* ==================== 2. FALLBACK CANVAS2D MỸ THUẬT TƯỜNG 3 KHU VỰC (TEST 183) ==================== */
function drawStadiumClippedQuad(ctx, cam, pts, bgCol, borderCol, lineW, drawInner) {
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

function drawVietnamLockerJersey2D(ctx, cx, cy, w, h, numStr) {
  ctx.fillStyle = '#DA251D';
  ctx.fillRect(cx - w * 0.42, cy - h * 0.38, w * 0.84, h * 0.22);
  ctx.fillRect(cx - w * 0.28, cy - h * 0.38, w * 0.56, h * 0.58);
  ctx.fillStyle = '#FDE047';
  ctx.fillRect(cx - w * 0.12, cy - h * 0.38, w * 0.24, h * 0.06);
  ctx.fillRect(cx - w * 0.40, cy - h * 0.38, w * 0.10, h * 0.04);
  ctx.fillRect(cx + w * 0.30, cy - h * 0.38, w * 0.10, h * 0.04);
  var sPx = Math.max(4, Math.min(11, Math.round(h * 0.18)));
  ctx.font = 'bold ' + sPx + 'px monospace';
  ctx.fillStyle = '#FDE047';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(numStr || '10', cx, cy - h * 0.08, Math.max(8, w * 0.5));
  ctx.strokeStyle = '#450A0A'; ctx.lineWidth = 1;
  ctx.strokeRect(cx - w * 0.28, cy - h * 0.38, w * 0.56, h * 0.58);
  ctx.fillStyle = '#5C341D';
  ctx.fillRect(cx - w * 0.44, cy + h * 0.24, w * 0.88, h * 0.07);
  ctx.fillStyle = '#FACC15';
  ctx.fillRect(cx - w * 0.28, cy + h * 0.15, w * 0.22, h * 0.09);
  ctx.fillRect(cx + w * 0.06, cy + h * 0.15, w * 0.22, h * 0.09);
}

function drawDongSonSunMotif2D(ctx, cx, cy, r, ringCol, coreCol) {
  ctx.save();
  ctx.strokeStyle = ringCol || '#F4B93B';
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.68, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = coreCol || '#FDE047';
  for (var i = 0; i < 12; i++) {
    var a = (i * Math.PI * 2) / 12;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a - 0.12) * r * 0.28, cy + Math.sin(a - 0.12) * r * 0.28);
    ctx.lineTo(cx + Math.cos(a) * r * 0.64, cy + Math.sin(a) * r * 0.64);
    ctx.lineTo(cx + Math.cos(a + 0.12) * r * 0.28, cy + Math.sin(a + 0.12) * r * 0.28);
    ctx.closePath();
    ctx.fill();
  }
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.24, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawStadiumLockerWalls3D(ctx, cam) {
  drawStadiumClippedQuad(
    ctx, cam,
    [[-5.93, 3.44, 1.8], [-5.93, 3.44, 11.6], [-5.93, 2.86, 11.6], [-5.93, 2.86, 1.8]],
    '#7F1D1D', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(5, Math.min(13, Math.round(bh * 0.40)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('★ PHÒNG THAY ĐỒ ĐỘI TUYỂN VIỆT NAM ★', cx, cy, safeW);
    }
  );
  var lockers = [
    { z1: 1.9, z2: 4.1, num: '#10', name: 'SỐ 10 · TIỀN ĐẠO' },
    { z1: 4.4, z2: 6.6, num: '#19', name: 'SỐ 19 · TIỀN VỆ' },
    { z1: 6.9, z2: 9.1, num: '#22', name: 'SỐ 22 · TRUNG PHONG' },
    { z1: 9.4, z2: 11.6, num: '#9',  name: 'SỐ 9 · CÁNH PHẢI' }
  ];
  for (var li = 0; li < lockers.length; li++) {
    (function(lk) {
      drawStadiumClippedQuad(
        ctx, cam,
        [[-5.93, 2.74, lk.z1], [-5.93, 2.74, lk.z2], [-5.93, 0.96, lk.z2], [-5.93, 0.96, lk.z1]],
        '#3B1810', '#F4B93B', 2.0,
        function(cx, cy, bw, bh, safeW) {
          ctx.fillStyle = '#FFF5D6';
          ctx.fillRect(cx - bw * 0.44, cy - bh * 0.42, bw * 0.88, bh * 0.68);
          drawVietnamLockerJersey2D(ctx, cx, cy - bh * 0.04, bw * 0.72, bh * 0.62, lk.num);
          var tPx = Math.max(4, Math.min(10, Math.round(bh * 0.12)));
          ctx.font = 'bold ' + tPx + 'px monospace';
          ctx.fillStyle = '#FDE047';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(lk.name, cx, cy + bh * 0.36, safeW);
        }
      );
    })(lockers[li]);
  }
  drawStadiumClippedQuad(
    ctx, cam,
    [[5.93, 3.32, 6.2], [5.93, 3.32, 1.4], [5.93, 1.15, 1.4], [5.93, 1.15, 6.2]],
    '#14532D', '#F4B93B', 2.4,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#166534';
      ctx.fillRect(cx - bw * 0.45, cy - bh * 0.30, bw * 0.90, bh * 0.68);
      ctx.strokeStyle = '#DCFCE7'; ctx.lineWidth = 1.2;
      ctx.strokeRect(cx - bw * 0.43, cy - bh * 0.26, bw * 0.86, bh * 0.60);
      var tPx = Math.max(5, Math.min(11, Math.round(bh * 0.12)));
      ctx.font = 'bold ' + tPx + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CHIẾN THUẬT 4-3-3 · ĐỘI TUYỂN VIỆT NAM', cx, cy - bh * 0.39, safeW);
    }
  );
  drawStadiumClippedQuad(
    ctx, cam,
    [[-3.6, 3.55, 13.95], [3.6, 3.55, 13.95], [3.6, 2.86, 13.95], [-3.6, 2.86, 13.95]],
    '#991B1B', '#F4B93B', 2.5,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(6, Math.min(14, Math.round(bh * 0.38)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('⚽ RA SÂN THI ĐẤU → · FIFA TUNNEL', cx, cy, safeW);
    }
  );
}

function drawStadiumPitchWalls3D(ctx, cam, st) {
  var vnScore = (st && typeof st.vnScore === 'number') ? st.vnScore : 2;
  var flash = (st && st.goalFlashUntil && st.t < st.goalFlashUntil);
  drawStadiumClippedQuad(
    ctx, cam,
    [[-5.93, 3.48, 0.8], [-5.93, 3.48, 14.0], [-5.93, 2.84, 14.0], [-5.93, 2.84, 0.8]],
    '#DA251D', '#FDE047', 2.4,
    function(cx, cy, bw, bh, safeW) {
      var px = Math.max(6, Math.min(14, Math.round(bh * 0.42)));
      ctx.font = 'bold ' + px + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('★ VIỆT NAM VÔ ĐỊCH · TRỐNG ĐỒNG ARENA ★', cx, cy, safeW);
    }
  );
  drawStadiumClippedQuad(
    ctx, cam,
    [[-4.4, 3.58, 14.72], [4.4, 3.58, 14.72], [4.4, 2.42, 14.72], [-4.4, 2.42, 14.72]],
    flash ? '#991B1B' : '#0F172A', '#FDE047', 2.8,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(6, Math.min(15, Math.round(bh * 0.30)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.fillText('VIỆT NAM ' + vnScore + ' - 0 ĐỘI KHÁCH', cx, cy, safeW);
    }
  );
}

function drawStadiumTrophyWalls3D(ctx, cam) {
  drawStadiumClippedQuad(
    ctx, cam,
    [[-4.95, 3.48, 14.72], [4.95, 3.48, 14.72], [4.95, 1.05, 14.72], [-4.95, 1.05, 14.72]],
    '#7F1D1D', '#FDE047', 2.8,
    function(cx, cy, bw, bh, safeW) {
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(cx - bw * 0.46, cy - bh * 0.44, bw * 0.92, bh * 0.88);
      drawDongSonSunMotif2D(ctx, cx, cy + bh * 0.05, Math.min(bw, bh) * 0.28, '#FDE047', '#FEF08A');
      var p1 = Math.max(6, Math.min(14, Math.round(bh * 0.14)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.fillText('HỌP BÁO QUỐC TẾ · TRỐNG ĐỒNG ARENA', cx, cy - bh * 0.31, safeW);
    }
  );
  drawStadiumClippedQuad(
    ctx, cam,
    [[5.93, 3.36, 7.8], [5.93, 3.36, 1.8], [5.93, 1.15, 1.8], [5.93, 1.15, 7.8]],
    '#7F1D1D', '#F4B93B', 2.4,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(5, Math.min(12, Math.round(bh * 0.14)));
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('★ HALL OF CHAMPIONS · VIỆT NAM ★', cx, cy - bh * 0.28, safeW);
      drawVietnamLockerJersey2D(ctx, cx - bw * 0.24, cy + bh * 0.08, bw * 0.22, bh * 0.50, '10');
      drawVietnamLockerJersey2D(ctx, cx,            cy + bh * 0.08, bw * 0.22, bh * 0.50, '19');
      drawVietnamLockerJersey2D(ctx, cx + bw * 0.24, cy + bh * 0.08, bw * 0.22, bh * 0.50, '22');
    }
  );
}

function drawStadiumRoomWalls3D(ctx, cam, room, st) {
  if (room === 'pitch_arena') {
    drawStadiumPitchWalls3D(ctx, cam, st);
  } else if (room === 'trophy_vip') {
    drawStadiumTrophyWalls3D(ctx, cam);
  } else {
    drawStadiumLockerWalls3D(ctx, cam);
  }
}
`;
}
