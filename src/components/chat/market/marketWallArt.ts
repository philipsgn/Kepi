/**
 * Bộ Sinh Texture Thủ Tục WebGL 3D & Mỹ Thuật Tường Chợ Bến Thành Sài Gòn (Quyết định 250)
 * - Nâng cấp đồng bộ WebGL 3D (POT 256×256 / 512×256) cho 3 phân khu hợp nhất:
 *   1. 'south_hall'  — Sảnh Cửa Nam & Sạp Vải Áo Dài (Cửa Số 1, Hương Trinh, Liên Sài Gòn 823)
 *   2. 'food_court'  — Khu Ẩm Thực Trung Tâm Sạp 1044 (Vòm Khu Ăn Uống, Bánh Cuốn 50K, Bánh Bèo Huế 20K)
 *   3. 'fruit_craft' — Cánh Đông Trái Cây & Lưu Niệm (1029 Ngọc Hảo, Gốm Sứ Bát Tràng, Nón Lá, Cửa Bắc)
 * - Gọi buildPigBillboardTextures(wgl, ['aodai']) để hỗ trợ chú Heo 24×20 mặc Áo Dài Lụa gl.NEAREST.
 * - Giữ nguyên Canvas2D fallback (drawMarketRoomWalls3D) cho Headless Smoke Test 183.
 */
export function buildMarketWallArtScript(): string {
  return String.raw`
/* ==================== 1. BỘ SINH TEXTURE THỦ TỤC WEBGL 3D CHỢ BẾN THÀNH ==================== */
function makeMarketRng(seed) {
  var s = seed | 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    var t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMarketProceduralTextures(wgl) {
  function mk(w, h) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; return c;
  }

  // 1. Sàn gạch đất nung Terracotta & Kem — Sảnh Cửa Nam (marketTileSouth)
  (function() {
    var c = mk(256, 256), g = c.getContext('2d'), rng = makeMarketRng(1914);
    g.fillStyle = '#E5D3B3'; g.fillRect(0, 0, 256, 256);
    for (var ty = 0; ty < 256; ty += 64) {
      for (var tx = 0; tx < 256; tx += 64) {
        var even = ((tx / 64 + ty / 64) % 2 === 0);
        g.fillStyle = even ? '#C87D55' : '#E5D3B3';
        g.fillRect(tx + 2, ty + 2, 60, 60);
        g.strokeStyle = '#8C6D46'; g.lineWidth = 2;
        g.strokeRect(tx + 1, ty + 1, 62, 62);
      }
    }
    for (var i = 0; i < 160; i++) {
      g.fillStyle = 'rgba(72,44,24,0.08)';
      g.beginPath(); g.arc(rng() * 256, rng() * 256, 4 + rng() * 12, 0, Math.PI * 2); g.fill();
    }
    wgl.registerTextureCanvas('marketTileSouth', c, true);
  })();

  // 2. Sàn gạch Terrazzo & Vàng Đất — Khu Ẩm Thực 1044 (marketTileFood)
  (function() {
    var c = mk(256, 256), g = c.getContext('2d'), rng = makeMarketRng(1044);
    g.fillStyle = '#D8C7A8'; g.fillRect(0, 0, 256, 256);
    for (var ty = 0; ty < 256; ty += 64) {
      for (var tx = 0; tx < 256; tx += 64) {
        var even = ((tx / 64 + ty / 64) % 2 === 0);
        g.fillStyle = even ? '#B45309' : '#DFCFAF';
        g.fillRect(tx + 2, ty + 2, 60, 60);
        g.strokeStyle = '#78350F'; g.lineWidth = 2;
        g.strokeRect(tx + 1, ty + 1, 62, 62);
      }
    }
    for (var i = 0; i < 180; i++) {
      g.fillStyle = rng() > 0.5 ? 'rgba(255,245,214,0.16)' : 'rgba(67,20,7,0.10)';
      g.fillRect(rng() * 256, rng() * 256, 3, 3);
    }
    wgl.registerTextureCanvas('marketTileFood', c, true);
  })();

  // 3. Sàn gạch vàng cát & xanh chợ — Sảnh Trái Cây & Lưu Niệm (marketTileFruit)
  (function() {
    var c = mk(256, 256), g = c.getContext('2d'), rng = makeMarketRng(1029);
    g.fillStyle = '#E2D5B5'; g.fillRect(0, 0, 256, 256);
    for (var ty = 0; ty < 256; ty += 64) {
      for (var tx = 0; tx < 256; tx += 64) {
        var even = ((tx / 64 + ty / 64) % 2 === 0);
        g.fillStyle = even ? '#C6A468' : '#E8DEC3';
        g.fillRect(tx + 2, ty + 2, 60, 60);
        g.strokeStyle = '#7C6E52'; g.lineWidth = 2;
        g.strokeRect(tx + 1, ty + 1, 62, 62);
      }
    }
    for (var i = 0; i < 140; i++) {
      g.fillStyle = 'rgba(20,83,45,0.07)';
      g.beginPath(); g.arc(rng() * 256, rng() * 256, 5 + rng() * 10, 0, Math.PI * 2); g.fill();
    }
    wgl.registerTextureCanvas('marketTileFruit', c, true);
  })();

  // 4. Tường vôi vàng nghệ Chợ Bến Thành (marketWallGold)
  (function() {
    var c = mk(256, 256), g = c.getContext('2d'), rng = makeMarketRng(2501);
    g.fillStyle = '#E5B85B'; g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 200; i++) {
      g.fillStyle = rng() > 0.5 ? 'rgba(255,244,210,0.14)' : 'rgba(166,110,32,0.14)';
      g.beginPath(); g.arc(rng() * 256, rng() * 256, 8 + rng() * 26, 0, Math.PI * 2); g.fill();
    }
    // Chỉ chân tường nâu đất ấm
    g.fillStyle = '#7C4F2B'; g.fillRect(0, 224, 256, 32);
    g.fillStyle = '#F4B93B'; g.fillRect(0, 220, 256, 5);
    wgl.registerTextureCanvas('marketWallGold', c, true);
  })();

  // 5. Kính mờ giếng trời & mái tôn vòm thép vàng (marketSkylight & marketRoofPanel)
  (function() {
    var c = mk(256, 256), g = c.getContext('2d');
    g.fillStyle = '#FEF3C7'; g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#FFFBEB';
    for (var y = 0; y < 256; y += 64) g.fillRect(4, y + 4, 248, 52);
    g.strokeStyle = '#B45309'; g.lineWidth = 6;
    for (var x = 0; x <= 256; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
    for (var y2 = 0; y2 <= 256; y2 += 64) { g.beginPath(); g.moveTo(0, y2); g.lineTo(256, y2); g.stroke(); }
    wgl.registerTextureCanvas('marketSkylight', c, true);

    var r = mk(256, 256), rg = r.getContext('2d');
    rg.fillStyle = '#7C4F2B'; rg.fillRect(0, 0, 256, 256);
    for (var sx = 0; sx < 256; sx += 32) {
      rg.fillStyle = (sx % 64 === 0) ? '#6B4423' : '#8C5A32';
      rg.fillRect(sx, 0, 30, 256);
    }
    wgl.registerTextureCanvas('marketRoofPanel', r, true);
  })();

  // 6. Cửa sắt xếp xanh cổ vịt Bến Thành (marketIronGate) & Gạch men trắng Bánh Cuốn (marketCeramicTile)
  (function() {
    var c = mk(256, 256), g = c.getContext('2d');
    g.fillStyle = 'rgba(23, 37, 84, 0.25)'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = '#1E3A8A'; g.lineWidth = 8;
    for (var x = 0; x <= 256; x += 32) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke();
    }
    g.strokeStyle = '#38BDF8'; g.lineWidth = 3;
    for (var d = -256; d < 512; d += 48) {
      g.beginPath(); g.moveTo(d, 0); g.lineTo(d + 256, 256); g.stroke();
      g.beginPath(); g.moveTo(d, 256); g.lineTo(d + 256, 0); g.stroke();
    }
    g.strokeStyle = '#172554'; g.lineWidth = 10; g.strokeRect(4, 4, 248, 248);
    wgl.registerTextureCanvas('marketIronGate', c, false);

    var t = mk(256, 256), tg = t.getContext('2d');
    tg.fillStyle = '#F8FAFC'; tg.fillRect(0, 0, 256, 256);
    tg.strokeStyle = '#CBD5E1'; tg.lineWidth = 3;
    for (var ty = 0; ty < 256; ty += 32) {
      tg.beginPath(); tg.moveTo(0, ty); tg.lineTo(256, ty); tg.stroke();
    }
    for (var tx = 0; tx < 256; tx += 64) {
      tg.beginPath(); tg.moveTo(tx, 0); tg.lineTo(tx, 256); tg.stroke();
    }
    wgl.registerTextureCanvas('marketCeramicTile', t, true);
  })();

  // 7. Gỗ quầy sạp nâu sẫm (marketWood)
  (function() {
    var c = mk(256, 256), g = c.getContext('2d');
    g.fillStyle = '#6D3F21'; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 256; y += 6) {
      g.fillStyle = (y % 12 === 0) ? 'rgba(38,18,6,0.28)' : 'rgba(140,88,48,0.18)';
      g.fillRect(0, y, 256, 3);
    }
    g.strokeStyle = '#2B180E'; g.lineWidth = 4; g.strokeRect(2, 2, 252, 252);
    wgl.registerTextureCanvas('marketWood', c, true);
  })();

  // 8. Helper tạo biển hiệu Chợ Bến Thành sắc nét (512×128 / 512×256)
  function regSign(key, bgHex, borderHex, title, sub, sub2) {
    var h = sub2 ? 256 : 128;
    var c = mk(512, h), g = c.getContext('2d');
    g.fillStyle = bgHex; g.fillRect(0, 0, 512, h);
    g.strokeStyle = borderHex; g.lineWidth = 8; g.strokeRect(8, 8, 496, h - 16);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (!sub) {
      g.fillStyle = '#FDE047'; g.font = 'bold 28px monospace';
      g.fillText(title, 256, h * 0.5, 472);
    } else if (!sub2) {
      g.fillStyle = '#FDE047'; g.font = 'bold 30px monospace';
      g.fillText(title, 256, h * 0.36, 472);
      g.fillStyle = '#FFFBF1'; g.font = 'bold 20px monospace';
      g.fillText(sub, 256, h * 0.72, 472);
    } else {
      g.fillStyle = '#FDE047'; g.font = 'bold 32px monospace';
      g.fillText(title, 256, 62, 472);
      g.fillStyle = '#FFFBF1'; g.font = 'bold 22px monospace';
      g.fillText(sub, 256, 130, 472);
      g.fillStyle = '#FDBA74'; g.font = 'bold 20px monospace';
      g.fillText(sub2, 256, 196, 472);
    }
    wgl.registerTextureCanvas(key, c, false);
  }

  regSign('signCuaSo1',      '#7F1D1D', '#F4B93B', 'CỬA SỐ 1 · CỬA NAM', 'CHỢ BẾN THÀNH · SÀI GÒN');
  regSign('signCuaBac',      '#14532D', '#F4B93B', 'CỬA BẮC · TRÁI CÂY 1029 NGỌC HẢO', 'XOÀI CÁT HÒA LỘC · BƯỞI DA XANH · SẦU RIÊNG');
  regSign('signHuongTrinh',  '#881337', '#F4B93B', 'SẠP VẢI & ÁO DÀI HƯƠNG TRINH', 'LỤA TƠ TẰM HÀ ĐÔNG · ÁO DÀI HOA SEN');
  regSign('signLienSaiGon',  '#14532D', '#F4B93B', 'ĐẶC SẢN LIÊN SÀI GÒN & NGỌC HOA', 'TRÀ SEN · MỨT TẾT · CÀ PHÊ RANG XAY 823');
  regSign('signKhuAnUong',   '#991B1B', '#F4B93B', '★ KHU ĂN UỐNG · SẠP 1044 ↑', 'BÁNH CUỐN NÓNG · BÁNH BÈO · CHÈ SÀI GÒN');
  regSign('signSap1044',     '#7F1D1D', '#F4B93B', '★ SẠP 1044 · ẨM THỰC BẾN THÀNH ★', 'PHỞ BÒ · BÚN BÒ HUẾ · BÁNH CUỐN · DỪA TƯƠI', 'HƯƠNG VỊ SÀI GÒN XƯA TỪ 1914');
  regSign('signBanhCuon50k', '#991B1B', '#FDE047', 'BÁNH CUỐN NÓNG 50K · TRÁNG TAY', 'CHẢ LỤA HÀ NỘI · ĐẶC BIỆT 65K');
  regSign('signBanhBeo20k',  '#B45309', '#FDE047', 'BÁNH BÈO HUẾ 20K & CHÈ SÀI GÒN', 'BÁNH BÈO CHÉN · NEM CHUA · CHÈ BA MÀU');
  regSign('signNgocHao1029', '#14532D', '#FACC15', '1029 NGỌC HẢO · TRÁI CÂY NHIỆT ĐỚI', 'XOÀI CÁT · THANH LONG · BƯỞI DA XANH');
  regSign('signGomSu',       '#1E3A8A', '#F4B93B', 'GỐM SỨ & SƠN MÀI BẾN THÀNH', 'BÁT TRÀNG MEN LAM · MÂY TRE ĐAN');
  regSign('signNonLa',       '#991B1B', '#FDE047', 'NÓN LÁ & QUÀ LƯU NIỆM SÀI GÒN', 'NÓN LÁ BÀI THƠ · TÚI CÓI THÊU');

  // 9. Tranh Tường Áo Dài & Vải Lụa Hương Trinh (artAoDaiFabric)
  (function() {
    var c = mk(512, 256), g = c.getContext('2d');
    g.fillStyle = '#4A2511'; g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#FFF5D6'; g.fillRect(14, 14, 484, 228);
    g.strokeStyle = '#D97706'; g.lineWidth = 4; g.strokeRect(18, 18, 476, 220);
    // Hàng nón lá treo trên cao
    for (var n = 0; n < 5; n++) {
      var nx = 64 + n * 96, ny = 58;
      g.fillStyle = '#E8C574'; g.strokeStyle = '#78350F'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(nx, ny - 22); g.lineTo(nx - 30, ny + 14); g.lineTo(nx + 30, ny + 14); g.closePath();
      g.fill(); g.stroke();
      g.fillStyle = n % 2 === 0 ? '#DC2626' : '#16A34A';
      g.fillRect(nx - 12, ny + 13, 24, 5);
    }
    // 3 Bộ Áo Dài Lụa Thêu Hoa Sen rực rỡ
    var aoCols = [['#DC2626', '#FDE047'], ['#2563EB', '#F472B6'], ['#059669', '#FEF08A']];
    for (var a = 0; a < 3; a++) {
      var ax = 112 + a * 144, ay = 152;
      g.fillStyle = aoCols[a][0];
      g.fillRect(ax - 38, ay - 52, 76, 26); // tay áo
      g.fillRect(ax - 22, ay - 52, 44, 44); // thân trên
      g.fillStyle = '#FFFBEB'; g.fillRect(ax - 18, ay - 4, 36, 72); // quần lụa
      g.fillStyle = aoCols[a][0]; g.fillRect(ax - 24, ay - 8, 48, 66); // tà áo
      g.fillStyle = aoCols[a][1];
      g.beginPath(); g.arc(ax, ay - 28, 9, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#2B180E'; g.lineWidth = 2;
      g.strokeRect(ax - 24, ay - 52, 48, 118);
    }
    wgl.registerTextureCanvas('artAoDaiFabric', c, false);
  })();

  // 10. Kệ Trà Sen, Hũ Mứt Nắp Đỏ & Cà Phê Liên Sài Gòn 823 (artLienTeaShelves)
  (function() {
    var c = mk(512, 256), g = c.getContext('2d');
    g.fillStyle = '#3B2314'; g.fillRect(0, 0, 512, 256);
    g.fillStyle = '#FEF3C7'; g.fillRect(14, 14, 484, 228);
    for (var row = 0; row < 3; row++) {
      var sy = 44 + row * 70;
      g.fillStyle = '#5C341D'; g.fillRect(20, sy + 36, 472, 10);
      for (var col = 0; col < 7; col++) {
        var jx = 42 + col * 64;
        if (row === 0) {
          g.fillStyle = '#15803D'; g.fillRect(jx, sy, 42, 36);
          g.fillStyle = '#FACC15'; g.fillRect(jx, sy - 6, 42, 8);
        } else if (row === 1) {
          g.fillStyle = '#FDE68A'; g.fillRect(jx, sy + 4, 42, 32);
          g.fillStyle = '#D97706'; g.fillRect(jx + 6, sy + 10, 30, 20);
          g.fillStyle = '#DC2626'; g.fillRect(jx - 2, sy - 4, 46, 10);
        } else {
          g.fillStyle = '#78350F'; g.fillRect(jx, sy, 42, 36);
          g.fillStyle = '#F4B93B'; g.fillRect(jx + 8, sy + 10, 26, 16);
        }
      }
    }
    wgl.registerTextureCanvas('artLienTeaShelves', c, false);
  })();

  // 11. Tường Bánh Cuốn Nóng 50K & Bánh Bèo 20K (artBanhCuonWall & artBanhBeoWall)
  (function() {
    var c = mk(512, 256), g = c.getContext('2d');
    g.fillStyle = '#F8FAFC'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#CBD5E1'; g.lineWidth = 2;
    for (var x = 0; x < 512; x += 48) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
    for (var y = 0; y < 256; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
    g.fillStyle = '#7F1D1D'; g.fillRect(36, 26, 440, 74);
    g.strokeStyle = '#FDE047'; g.lineWidth = 4; g.strokeRect(40, 30, 432, 66);
    g.fillStyle = '#FDE047'; g.font = 'bold 24px monospace'; g.textAlign = 'center';
    g.fillText('BÁNH CUỐN CHẢ LỤA 50K · ĐẶC BIỆT 65K', 256, 70, 412);
    for (var di = -1; di <= 1; di++) {
      var dx = 256 + di * 130, dy = 176;
      g.fillStyle = '#E2E8F0'; g.beginPath(); g.ellipse(dx, dy, 46, 30, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#FFFFFF'; g.fillRect(dx - 28, dy - 12, 56, 20);
      g.fillStyle = '#D97706'; g.fillRect(dx - 10, dy - 6, 20, 8);
    }
    wgl.registerTextureCanvas('artBanhCuonWall', c, false);

    var b = mk(512, 256), bg = b.getContext('2d');
    bg.fillStyle = '#FFFBEB'; bg.fillRect(0, 0, 512, 256);
    bg.strokeStyle = '#B45309'; bg.lineWidth = 8; bg.strokeRect(8, 8, 496, 240);
    for (var ci = 0; ci < 5; ci++) {
      var lx = 76 + ci * 90;
      bg.fillStyle = '#15803D'; bg.fillRect(lx - 14, 34, 28, 56);
      bg.fillStyle = '#F43F5E'; bg.fillRect(lx - 14, 58, 28, 8);
      bg.fillStyle = '#991B1B'; bg.fillRect(lx - 18, 178, 36, 28);
      bg.fillStyle = '#FACC15'; bg.fillRect(lx - 18, 152, 36, 26);
      bg.fillStyle = '#22C55E'; bg.fillRect(lx - 18, 126, 36, 26);
      bg.fillStyle = '#FFFFFF'; bg.fillRect(lx - 20, 110, 40, 16);
    }
    wgl.registerTextureCanvas('artBanhBeoWall', b, false);
  })();

  // 12. Gốm Sứ Sơn Mài, Nón Lá & Mâm Trái Cây 1029 Ngọc Hảo (artGomSonMai, artNonLaRack, artFruitDisplay)
  (function() {
    var c = mk(512, 256), g = c.getContext('2d');
    g.fillStyle = '#FEF3C7'; g.fillRect(0, 0, 512, 256);
    g.strokeStyle = '#3B2314'; g.lineWidth = 8; g.strokeRect(8, 8, 496, 240);
    for (var li = -1; li <= 1; li++) {
      var lx = 256 + li * 145;
      g.fillStyle = '#1C1917'; g.fillRect(lx - 52, 28, 104, 86);
      g.strokeStyle = '#F4B93B'; g.lineWidth = 3; g.strokeRect(lx - 52, 28, 104, 86);
      g.fillStyle = '#DC2626'; g.beginPath(); g.arc(lx, 70, 22, 0, Math.PI * 2); g.fill();
    }
    for (var vi = 0; vi < 5; vi++) {
      var vx = 76 + vi * 90;
      if (vi % 2 === 0) {
        g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(vx, 182, 24, 42, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#1D4ED8'; g.fillRect(vx - 18, 170, 36, 18);
      } else {
        g.fillStyle = '#D97706'; g.fillRect(vx - 24, 152, 48, 60);
        g.strokeStyle = '#78350F'; g.lineWidth = 2; g.strokeRect(vx - 24, 152, 48, 60);
      }
    }
    wgl.registerTextureCanvas('artGomSonMai', c, false);

    var n = mk(512, 256), ng = n.getContext('2d');
    ng.fillStyle = '#FFF5D6'; ng.fillRect(0, 0, 512, 256);
    ng.strokeStyle = '#991B1B'; ng.lineWidth = 8; ng.strokeRect(8, 8, 496, 240);
    for (var r = 0; r < 2; r++) {
      for (var k = 0; k < 4; k++) {
        var nx = 86 + k * 112, ny = 76 + r * 98;
        ng.fillStyle = '#E8C574'; ng.strokeStyle = '#78350F'; ng.lineWidth = 3;
        ng.beginPath(); ng.moveTo(nx, ny - 32); ng.lineTo(nx - 42, ny + 24); ng.lineTo(nx + 42, ny + 24); ng.closePath();
        ng.fill(); ng.stroke();
        ng.fillStyle = r === 0 ? '#DC2626' : '#16A34A';
        ng.fillRect(nx - 16, ny + 22, 32, 6);
      }
    }
    wgl.registerTextureCanvas('artNonLaRack', n, false);

    var f = mk(256, 256), fg = f.getContext('2d');
    fg.fillStyle = '#15803D'; fg.fillRect(0, 0, 256, 256);
    // Mâm xoài cát vàng, thanh long hồng, bưởi xanh & sầu riêng
    var fruits = [
      [56, 64, 24, '#FACC15'], [104, 64, 24, '#FACC15'], [156, 64, 24, '#E11D48'], [204, 64, 24, '#E11D48'],
      [64, 132, 28, '#22C55E'], [128, 132, 30, '#A16207'], [192, 132, 28, '#22C55E'],
      [56, 198, 24, '#F59E0B'], [128, 198, 24, '#E11D48'], [200, 198, 24, '#FACC15']
    ];
    for (var fi = 0; fi < fruits.length; fi++) {
      fg.fillStyle = fruits[fi][3]; fg.strokeStyle = '#1E293B'; fg.lineWidth = 3;
      fg.beginPath(); fg.arc(fruits[fi][0], fruits[fi][1], fruits[fi][2], 0, Math.PI * 2); fg.fill(); fg.stroke();
    }
    wgl.registerTextureCanvas('artFruitDisplay', f, false);
  })();

  // 13. Cửa Đông / Cửa Tây & Cửa Gió Louvers Kiến Trúc Chợ Bến Thành 1914 (QĐ 259)
  regSign('signCuaDong', '#14532D', '#F4B93B', 'CỬA ĐÔNG · PHAN BỘI CHÂU', 'CÀ PHÊ · TRÀ SEN · MỨT SẤY · GIA VỊ');
  regSign('signCuaTay',  '#1E3A8A', '#F4B93B', 'CỬA TÂY · PHAN CHU TRINH', 'GIÀY DÉP · GỐM SỨ · SƠN MÀI · MỸ NGHỆ');
  regSign('signAdidasMarket', '#0F172A', '#F8FAFC', 'SẠP 208 · ADIDAS 3 SỌC', 'HOODIE · ÁO KHOÁC · POLO · JOGGER');
  regSign('signNikeMarket',   '#1E293B', '#FB923C', 'SẠP 212 · NIKE SPORTS', 'SWOOSH TEE · HOODIE · QUẦN THỂ THAO');
  regSign('signShoesBags',    '#7C2D12', '#FACC15', 'SẠP 306 · GIÀY DÉP & TÚI XÁCH', 'SNEAKER · VALI KÉO · ĐỒNG HỒ · MẮT KÍNH');
  regSign('signSaigonTees',   '#9F1239', '#FDE047', 'SẠP 224 · I ♥ SAIGON', 'ÁO THUN DU LỊCH · QUẦN VOI · NÓN');
  regSign('signPhoHuTieu',    '#7F1D1D', '#FDE047', 'PHỞ BÒ · HỦ TIẾU NAM VANG', 'NƯỚC LÈO XƯƠNG HẦM · TÁI NẠM GẦU');
  regSign('signBunBoComTam',  '#991B1B', '#FDE047', 'BÚN BÒ HUẾ · BÚN MẮM · CƠM TẤM', 'SƯỜN NƯỚNG · BÌ CHẢ · TRỨNG ỐP LA');
  regSign('signBanhXeoBanhMi','#B45309', '#FFFBEB', 'BÁNH XÈO MIỀN TÂY · GỎI CUỐN', 'BÁNH MÌ SÀI GÒN · CHẢ LỤA PA TÊ');
  regSign('signCheSinhTo',    '#065F46', '#FDE047', 'CHÈ 3 MIỀN · SINH TỐ · NƯỚC MÍA', 'CHÈ BA MÀU · CHÈ BƯỞI · DỪA XIÊM');
  regSign('signFreshFlowers', '#831843', '#FDE047', 'SẠP HOA TƯƠI CỬA BẮC', 'HOA SEN · CÚC VÀNG · HỒNG ĐỎ · HOA LY');
  regSign('signWetSeafood',   '#0C4A6E', '#38BDF8', 'HẢI SẢN TƯƠI SỐNG & THỊT RAU', 'TÔM SÚ · CUA GHẸ · CÁ THU · RAU SẠCH');
  regSign('signCoffeeSpices', '#451A03', '#F4B93B', 'CÀ PHÊ CHỒN · TIÊU PHÚ QUỐC', 'HẠT ĐIỀU · MỰC KHÔ · TÔM KHÔ · NƯỚC MẮM');

  // Cửa gió lá sách louvers thông gió 1914 (marketLouvers)
  (function() {
    var c = mk(256, 128), g = c.getContext('2d');
    g.fillStyle = '#365314'; g.fillRect(0, 0, 256, 128);
    for (var ly = 6; ly < 124; ly += 14) {
      g.fillStyle = '#FEF3C7'; g.fillRect(4, ly, 248, 5);
      g.fillStyle = '#1A2E05'; g.fillRect(4, ly + 5, 248, 4);
    }
    g.strokeStyle = '#78350F'; g.lineWidth = 6; g.strokeRect(3, 3, 250, 122);
    wgl.registerTextureCanvas('marketLouvers', c, true);
  })();

  // 14. Thời trang Adidas / Nike / Giày Túi / I Love Saigon (512×256)
  (function() {
    function drawShirtWall(key, bg, items) {
      var c = mk(512, 256), g = c.getContext('2d');
      g.fillStyle = bg; g.fillRect(0, 0, 512, 256);
      g.strokeStyle = '#F4B93B'; g.lineWidth = 6; g.strokeRect(6, 6, 500, 244);
      g.fillStyle = '#E2E8F0'; g.fillRect(24, 38, 464, 8); g.fillRect(24, 146, 464, 8);
      for (var r = 0; r < 2; r++) {
        for (var i = 0; i < 4; i++) {
          var sx = 82 + i * 114, sy = 50 + r * 108;
          var col = items[(r * 4 + i) % items.length];
          g.fillStyle = col.body;
          g.fillRect(sx - 34, sy + 4, 68, 26);
          g.fillRect(sx - 22, sy + 4, 44, 68);
          g.fillStyle = col.trim;
          if (col.kind === 'adidas') {
            g.fillRect(sx - 18, sy + 12, 4, 52); g.fillRect(sx - 10, sy + 12, 4, 52); g.fillRect(sx - 2, sy + 12, 4, 52);
          } else if (col.kind === 'nike') {
            g.beginPath(); g.moveTo(sx - 12, sy + 28); g.quadraticCurveTo(sx, sy + 44, sx + 18, sy + 20);
            g.lineWidth = 5; g.strokeStyle = col.trim; g.stroke();
          } else {
            g.fillRect(sx - 14, sy + 22, 28, 12);
          }
          g.strokeStyle = '#0F172A'; g.lineWidth = 2; g.strokeRect(sx - 22, sy + 4, 44, 68);
        }
      }
      wgl.registerTextureCanvas(key, c, false);
    }
    drawShirtWall('artAdidasMarket', '#1E293B', [
      { kind: 'adidas', body: '#111827', trim: '#FFFFFF' },
      { kind: 'adidas', body: '#1D4ED8', trim: '#F8FAFC' },
      { kind: 'adidas', body: '#DC2626', trim: '#FFFFFF' },
      { kind: 'adidas', body: '#F8FAFC', trim: '#0F172A' }
    ]);
    drawShirtWall('artNikeMarket', '#0F172A', [
      { kind: 'nike', body: '#EA580C', trim: '#FFFFFF' },
      { kind: 'nike', body: '#111827', trim: '#F97316' },
      { kind: 'nike', body: '#F8FAFC', trim: '#111827' },
      { kind: 'nike', body: '#047857', trim: '#FDE047' }
    ]);
    drawShirtWall('artSaigonTees', '#881337', [
      { kind: 'sg', body: '#FFFFFF', trim: '#EF4444' },
      { kind: 'sg', body: '#FACC15', trim: '#DC2626' },
      { kind: 'sg', body: '#0EA5E9', trim: '#FFFFFF' },
      { kind: 'sg', body: '#16A34A', trim: '#FDE047' }
    ]);

    // Kệ giày Sneaker, Vali & Túi xách (artShoesBags)
    var sb = mk(512, 256), sg = sb.getContext('2d');
    sg.fillStyle = '#FFFBEB'; sg.fillRect(0, 0, 512, 256);
    sg.strokeStyle = '#7C2D12'; sg.lineWidth = 8; sg.strokeRect(6, 6, 500, 244);
    var shCols = ['#F8FAFC', '#DC2626', '#2563EB', '#111827', '#F59E0B'];
    for (var row = 0; row < 2; row++) {
      var y0 = 96 + row * 104;
      sg.fillStyle = '#78350F'; sg.fillRect(24, y0, 464, 10);
      for (var cIdx = 0; cIdx < 5; cIdx++) {
        var x0 = 56 + cIdx * 92;
        if (row === 0) {
          sg.fillStyle = shCols[cIdx]; sg.fillRect(x0, y0 - 32, 48, 22);
          sg.fillStyle = '#E2E8F0'; sg.fillRect(x0 - 2, y0 - 10, 56, 10);
          sg.fillStyle = '#0F172A'; sg.fillRect(x0 + 16, y0 - 26, 16, 6);
        } else {
          sg.fillStyle = shCols[(cIdx + 2) % 5]; sg.fillRect(x0, y0 - 54, 46, 52);
          sg.strokeStyle = '#1E293B'; sg.lineWidth = 2; sg.strokeRect(x0, y0 - 54, 46, 52);
          sg.fillStyle = '#FACC15'; sg.fillRect(x0 + 14, y0 - 34, 18, 8);
        }
      }
    }
    wgl.registerTextureCanvas('artShoesBags', sb, false);
  })();

  // 15. Toàn Bộ Món Ăn Việt Nam: Phở/Hủ Tiếu, Bún Bò/Cơm Tấm, Bánh Xèo/Bánh Mì, Chè 3 Miền (512×256)
  (function() {
    function drawDishBoard(key, bg, title, dishes) {
      var c = mk(512, 256), g = c.getContext('2d');
      g.fillStyle = bg; g.fillRect(0, 0, 512, 256);
      g.strokeStyle = '#FDE047'; g.lineWidth = 6; g.strokeRect(6, 6, 500, 244);
      g.fillStyle = '#7F1D1D'; g.fillRect(28, 22, 456, 54);
      g.fillStyle = '#FDE047'; g.font = 'bold 24px monospace'; g.textAlign = 'center';
      g.fillText(title, 256, 56, 430);
      for (var i = 0; i < dishes.length; i++) {
        var dx = 94 + i * 162, dy = 162;
        g.fillStyle = '#F8FAFC'; g.beginPath(); g.arc(dx, dy, 48, 0, Math.PI * 2); g.fill();
        g.fillStyle = dishes[i].fill; g.beginPath(); g.arc(dx, dy, 38, 0, Math.PI * 2); g.fill();
        g.fillStyle = dishes[i].top; g.fillRect(dx - 20, dy - 10, 40, 14);
        g.fillStyle = '#16A34A'; g.fillRect(dx - 8, dy - 18, 16, 10);
      }
      wgl.registerTextureCanvas(key, c, false);
    }
    drawDishBoard('artPhoHuTieu', '#FFFBEB', 'PHỞ BÒ · HỦ TIẾU NAM VANG', [
      { fill: '#D97706', top: '#7F1D1D' }, { fill: '#FDE68A', top: '#DC2626' }, { fill: '#F59E0B', top: '#FFFBF1' }
    ]);
    drawDishBoard('artBunBoComTam', '#FEF2F2', 'BÚN BÒ HUẾ · BÚN MẮM · CƠM TẤM', [
      { fill: '#DC2626', top: '#991B1B' }, { fill: '#FFFBEB', top: '#B45309' }, { fill: '#F59E0B', top: '#EF4444' }
    ]);
    drawDishBoard('artBanhXeoBanhMi', '#FFF7ED', 'BÁNH XÈO · GỎI CUỐN · BÁNH MÌ', [
      { fill: '#FACC15', top: '#EA580C' }, { fill: '#F1F5F9', top: '#EF4444' }, { fill: '#D97706', top: '#FEF3C7' }
    ]);
    drawDishBoard('artCheSinhTo', '#ECFDF5', 'CHÈ 3 MIỀN · NƯỚC MÍA · SINH TỐ', [
      { fill: '#F43F5E', top: '#FACC15' }, { fill: '#22C55E', top: '#FFFBEB' }, { fill: '#A855F7', top: '#FDE047' }
    ]);
  })();

  // 16. Trái Cây Nhiệt Đới Đủ Loại, Hoa Tươi, Hải Sản, Cà Phê Đồ Khô & Mây Tre Đan
  (function() {
    var tf = mk(512, 256), tg = tf.getContext('2d');
    tg.fillStyle = '#14532D'; tg.fillRect(0, 0, 512, 256);
    tg.strokeStyle = '#FACC15'; tg.lineWidth = 6; tg.strokeRect(6, 6, 500, 244);
    var trop = [
      [68, 84, 30, '#A16207'], [148, 84, 24, '#7E22CE'], [228, 84, 24, '#DC2626'], [308, 84, 26, '#FACC15'], [388, 84, 26, '#E11D48'], [456, 84, 24, '#22C55E'],
      [78, 178, 26, '#15803D'], [162, 178, 28, '#EAB308'], [246, 178, 26, '#4ADE80'], [330, 178, 24, '#FB923C'], [414, 178, 26, '#FEF08A']
    ];
    for (var ti = 0; ti < trop.length; ti++) {
      tg.fillStyle = trop[ti][3]; tg.strokeStyle = '#052E16'; tg.lineWidth = 3;
      tg.beginPath(); tg.arc(trop[ti][0], trop[ti][1], trop[ti][2], 0, Math.PI * 2); tg.fill(); tg.stroke();
    }
    wgl.registerTextureCanvas('artTropicalFruits', tf, false);

    var fl = mk(512, 256), fg = fl.getContext('2d');
    fg.fillStyle = '#831843'; fg.fillRect(0, 0, 512, 256);
    var flCols = ['#F472B6', '#FACC15', '#EF4444', '#FFFFFF', '#FB923C'];
    for (var fi = 0; fi < 10; fi++) {
      var fx = 46 + (fi % 5) * 102, fy = fi < 5 ? 76 : 182;
      fg.fillStyle = '#15803D'; fg.fillRect(fx - 12, fy, 24, 48);
      fg.fillStyle = flCols[fi % 5];
      fg.beginPath(); fg.arc(fx, fy - 12, 26, 0, Math.PI * 2); fg.fill();
    }
    wgl.registerTextureCanvas('artFreshFlowers', fl, false);

    var ws = mk(512, 256), wg = ws.getContext('2d');
    wg.fillStyle = '#0C4A6E'; wg.fillRect(0, 0, 512, 256);
    wg.fillStyle = '#E0F2FE'; wg.fillRect(18, 28, 476, 200);
    for (var si = 0; si < 6; si++) {
      var sx = 64 + si * 78;
      wg.fillStyle = (si % 2 === 0) ? '#EF4444' : '#64748B';
      wg.beginPath(); wg.ellipse(sx, 128, 26, 16, 0, 0, Math.PI * 2); wg.fill();
    }
    wgl.registerTextureCanvas('artWetSeafood', ws, false);

    var cs = mk(512, 256), cg = cs.getContext('2d');
    cg.fillStyle = '#451A03'; cg.fillRect(0, 0, 512, 256);
    cg.fillStyle = '#FEF3C7'; cg.fillRect(16, 16, 480, 224);
    for (var ci = 0; ci < 6; ci++) {
      var cx = 56 + ci * 76;
      cg.fillStyle = (ci % 2 === 0) ? '#78350F' : '#B45309';
      cg.fillRect(cx - 22, 46, 44, 72);
      cg.fillStyle = '#DC2626'; cg.fillRect(cx - 22, 46, 44, 14);
      cg.fillStyle = '#D97706'; cg.fillRect(cx - 20, 144, 40, 66);
    }
    wgl.registerTextureCanvas('artCoffeeSpices', cs, false);

    var rt = mk(512, 256), rg = rt.getContext('2d');
    rg.fillStyle = '#7C2D12'; rg.fillRect(0, 0, 512, 256);
    rg.fillStyle = '#FFFBEB'; rg.fillRect(14, 14, 484, 228);
    for (var ri = 0; ri < 4; ri++) {
      var rx = 74 + ri * 116;
      rg.fillStyle = '#D97706'; rg.beginPath(); rg.arc(rx, 92, 34, 0, Math.PI * 2); rg.fill();
      rg.fillStyle = '#E11D48'; rg.fillRect(rx - 22, 144, 44, 62);
    }
    wgl.registerTextureCanvas('artHandicraftRattan', rt, false);
  })();

  // 17. Bộ Sprite Chú Heo 24×20 + Đầy Đủ Trang Phục Chợ Bến Thành (Áo Dài, Adidas & Nike) gl.NEAREST
  if (typeof buildPigBillboardTextures === 'function') {
    buildPigBillboardTextures(wgl, ['aodai', 'adidas_jacket', 'adidas_polo', 'adidas_jogger', 'nike_tee', 'nike_hoodie']);
  }
}

/* ==================== 2. FALLBACK CANVAS2D CHO HEADLESS SMOKE TEST 183 ==================== */
function drawMarketClippedQuad(ctx, cam, pts, bgCol, borderCol, lineW, drawInner) {
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

function drawPixelAoDaiIcon(ctx, cx, cy, w, h, dressCol, trimCol, lotusCol) {
  ctx.fillStyle = dressCol;
  ctx.fillRect(cx - w * 0.42, cy - h * 0.38, w * 0.84, h * 0.22);
  ctx.fillRect(cx - w * 0.24, cy - h * 0.38, w * 0.48, h * 0.34);
  ctx.fillStyle = '#FFFBEB';
  ctx.fillRect(cx - w * 0.20, cy + h * 0.02, w * 0.40, h * 0.38);
  ctx.fillStyle = dressCol;
  ctx.fillRect(cx - w * 0.27, cy - h * 0.04, w * 0.54, h * 0.38);
  ctx.fillStyle = trimCol || '#FDE047';
  ctx.fillRect(cx - w * 0.11, cy - h * 0.43, w * 0.22, h * 0.07);
  ctx.fillStyle = lotusCol || '#F43F5E';
  ctx.beginPath();
  ctx.arc(cx, cy - h * 0.18, Math.max(2, w * 0.09), 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2B180E';
  ctx.lineWidth = 1;
  ctx.strokeRect(cx - w * 0.27, cy - h * 0.38, w * 0.54, h * 0.72);
}

function drawPixelNonLaIcon(ctx, nx, ny, rw, rh, ribbonCol) {
  ctx.fillStyle = '#E8C574';
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(nx, ny - rh * 0.55);
  ctx.lineTo(nx - rw * 0.5, ny + rh * 0.35);
  ctx.lineTo(nx + rw * 0.5, ny + rh * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = ribbonCol || '#DC2626';
  ctx.fillRect(nx - rw * 0.18, ny + rh * 0.32, rw * 0.36, Math.max(1.5, rh * 0.12));
}

function drawMarketSouthHallWalls3D(ctx, cam) {
  drawMarketClippedQuad(
    ctx, cam,
    [[-2.25, 3.55, 0.04], [2.25, 3.55, 0.04], [2.25, 2.78, 0.04], [-2.25, 2.78, 0.04]],
    '#7F1D1D', '#F4B93B', 2.4,
    function(cx, cy, bw, bh, safeW) {
      var p1 = Math.max(5, Math.min(13, Math.round(bh * 0.36)));
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + p1 + 'px monospace';
      ctx.fillStyle = '#FDE047';
      ctx.fillText('CỬA SỐ 1 · CỬA NAM', cx, cy, safeW);
    }
  );
  drawMarketClippedQuad(
    ctx, cam,
    [[-5.93, 3.44, 1.6], [-5.93, 3.44, 11.4], [-5.93, 2.84, 11.4], [-5.93, 2.84, 1.6]],
    '#881337', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      ctx.font = 'bold ' + Math.max(5, Math.min(13, Math.round(bh * 0.40))) + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('SẠP VẢI & ÁO DÀI HƯƠNG TRINH', cx, cy, safeW);
    }
  );
  drawMarketClippedQuad(
    ctx, cam,
    [[5.93, 3.44, 8.2], [5.93, 3.44, 1.6], [5.93, 2.84, 1.6], [5.93, 2.84, 8.2]],
    '#14532D', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      ctx.font = 'bold ' + Math.max(5, Math.min(12, Math.round(bh * 0.38))) + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ĐẶC SẢN LIÊN SÀI GÒN & NGỌC HOA', cx, cy, safeW);
    }
  );
  drawMarketClippedQuad(
    ctx, cam,
    [[-3.0, 3.55, 13.54], [3.0, 3.55, 13.54], [3.0, 2.75, 13.54], [-3.0, 2.75, 13.54]],
    '#991B1B', '#F4B93B', 2.4,
    function(cx, cy, bw, bh, safeW) {
      ctx.font = 'bold ' + Math.max(6, Math.min(13, Math.round(bh * 0.36))) + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('KHU ĂN UỐNG · SẠP 1044 ↑', cx, cy, safeW);
    }
  );
}

function drawMarketFoodCourtWalls3D(ctx, cam) {
  drawMarketClippedQuad(
    ctx, cam,
    [[-5.93, 3.44, 1.8], [-5.93, 3.44, 11.2], [-5.93, 2.82, 11.2], [-5.93, 2.82, 1.8]],
    '#991B1B', '#FDE047', 2.4,
    function(cx, cy, bw, bh, safeW) {
      ctx.font = 'bold ' + Math.max(5, Math.min(13, Math.round(bh * 0.40))) + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('BÁNH CUỐN NÓNG 50K · TRÁNG TAY', cx, cy, safeW);
    }
  );
  drawMarketClippedQuad(
    ctx, cam,
    [[5.93, 3.44, 8.2], [5.93, 3.44, 1.8], [5.93, 2.82, 1.8], [5.93, 2.82, 8.2]],
    '#B45309', '#FDE047', 2.2,
    function(cx, cy, bw, bh, safeW) {
      ctx.font = 'bold ' + Math.max(5, Math.min(12, Math.round(bh * 0.38))) + 'px monospace';
      ctx.fillStyle = '#FFFBF1'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('BÁNH BÈO HUẾ 20K & CHÈ SÀI GÒN', cx, cy, safeW);
    }
  );
  drawMarketClippedQuad(
    ctx, cam,
    [[-4.4, 3.48, 13.1], [4.4, 3.48, 13.1], [4.4, 2.10, 13.1], [-4.4, 2.10, 13.1]],
    '#7F1D1D', '#F4B93B', 2.6,
    function(cx, cy, bw, bh, safeW) {
      ctx.font = 'bold ' + Math.max(6, Math.min(14, Math.round(bh * 0.28))) + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('★ SẠP 1044 · ẨM THỰC BẾN THÀNH ★', cx, cy, safeW);
    }
  );
}

function drawMarketFruitCraftWalls3D(ctx, cam) {
  drawMarketClippedQuad(
    ctx, cam,
    [[-5.93, 3.44, 1.8], [-5.93, 3.44, 11.2], [-5.93, 2.82, 11.2], [-5.93, 2.82, 1.8]],
    '#1E3A8A', '#F4B93B', 2.2,
    function(cx, cy, bw, bh, safeW) {
      ctx.font = 'bold ' + Math.max(5, Math.min(13, Math.round(bh * 0.38))) + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('GỐM SỨ & SƠN MÀI BẾN THÀNH', cx, cy, safeW);
    }
  );
  drawMarketClippedQuad(
    ctx, cam,
    [[5.93, 3.44, 8.2], [5.93, 3.44, 1.8], [5.93, 2.82, 1.8], [5.93, 2.82, 8.2]],
    '#991B1B', '#FDE047', 2.2,
    function(cx, cy, bw, bh, safeW) {
      ctx.font = 'bold ' + Math.max(5, Math.min(12, Math.round(bh * 0.38))) + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('NÓN LÁ & QUÀ LƯU NIỆM SÀI GÒN', cx, cy, safeW);
    }
  );
  drawMarketClippedQuad(
    ctx, cam,
    [[-4.2, 3.50, 13.1], [4.2, 3.50, 13.1], [4.2, 2.10, 13.1], [-4.2, 2.10, 13.1]],
    '#14532D', '#F4B93B', 2.6,
    function(cx, cy, bw, bh, safeW) {
      ctx.font = 'bold ' + Math.max(6, Math.min(14, Math.round(bh * 0.28))) + 'px monospace';
      ctx.fillStyle = '#FDE047'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('CỬA BẮC · TRÁI CÂY 1029 NGỌC HẢO', cx, cy, safeW);
    }
  );
}

function drawMarketRoomWalls3D(ctx, cam, room) {
  if (room === 'food_court') drawMarketFoodCourtWalls3D(ctx, cam);
  else if (room === 'fruit_craft') drawMarketFruitCraftWalls3D(ctx, cam);
  else drawMarketSouthHallWalls3D(ctx, cam);
}
`;
}
