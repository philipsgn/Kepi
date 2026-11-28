/**
 * Ngoại Cảnh Đại Lộ 2 Chiều + Sông Bạch Đằng + Skyline & Mây Trời 3 Sắc Dùng Chung (QĐ 258)
 * - Đồng bộ 1:1 tư liệu với Tab Banner Khám Phá (saigonPanoramaArt.ts) & Quán Cà Phê (QĐ 253).
 * - Dùng chung cho 3 quán mặt phố: Quán Cà Phê, Adidas Mall Flagship, Quán Phở Cổ Truyền.
 * - Kèm drawSaigonHorizonRing3D giúp Chùa Cổ & SVĐ Trống Đồng loại bỏ mảng trời/trần thô cũ.
 */
export function buildSaigonStreetBackdrop3dScript(): string {
  return String.raw`
/* ==================== 1. TEXTURE ĐẠI LỘ, SÔNG BẠCH ĐẰNG & SKYLINE 3 SẮC (QĐ 258) ==================== */
function registerSaigonStreetBackdropTextures(wgl) {
  if (!wgl || typeof document === 'undefined') return;
  if (wgl.hasTexture('sgRoadAsphalt') && wgl.hasTexture('sgSkylineDay')) return;
  function mkCv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  // 1. Mặt đường nhựa 2 làn xe chạy (sgRoadAsphalt)
  if (!wgl.hasTexture('sgRoadAsphalt')) {
    var rc = mkCv(256, 256), rx = rc.getContext('2d');
    rx.fillStyle = '#334155'; rx.fillRect(0, 0, 256, 256);
    for (var ri = 0; ri < 260; ri++) {
      rx.fillStyle = (ri % 3 === 0) ? '#1E293B' : '#475569';
      rx.fillRect((ri * 53) % 254, (ri * 97) % 254, 2, 2);
    }
    rx.fillStyle = '#E2E8F0'; rx.fillRect(0, 4, 256, 6); rx.fillRect(0, 246, 256, 6);
    rx.fillStyle = '#FACC15';
    for (var dash = 8; dash < 256; dash += 44) rx.fillRect(dash, 124, 26, 7);
    wgl.registerTextureCanvas('sgRoadAsphalt', rc, false);
  }

  // 2. Mặt nước Sông Bạch Đằng (sgRiverWater)
  if (!wgl.hasTexture('sgRiverWater')) {
    var wc = mkCv(256, 256), wx = wc.getContext('2d');
    wx.fillStyle = '#1D5C8C'; wx.fillRect(0, 0, 256, 256);
    for (var wy = 0; wy < 256; wy += 12) {
      wx.fillStyle = (wy % 24 === 0) ? '#2772A8' : '#184F78';
      wx.fillRect(0, wy, 256, 5);
    }
    wx.fillStyle = 'rgba(224,242,254,0.35)';
    for (var wv = 0; wv < 96; wv++) {
      wx.fillRect((wv * 71) % 236, (wv * 43) % 248, 18, 2);
    }
    wgl.registerTextureCanvas('sgRiverWater', wc, false);
  }

  // 3. Gạch vỉa hè bờ kè & cây xanh & nhà phố kề bên
  if (!wgl.hasTexture('sgCementWalk')) {
    var cc = mkCv(128, 128), cx = cc.getContext('2d');
    cx.fillStyle = '#DDD2BC'; cx.fillRect(0, 0, 128, 128);
    cx.strokeStyle = '#C4B69C'; cx.lineWidth = 2;
    for (var cg = 0; cg < 128; cg += 32) {
      cx.beginPath(); cx.moveTo(cg, 0); cx.lineTo(cg, 128); cx.stroke();
      cx.beginPath(); cx.moveTo(0, cg); cx.lineTo(128, cg); cx.stroke();
    }
    wgl.registerTextureCanvas('sgCementWalk', cc, false);
  }
  if (!wgl.hasTexture('sgLeafGreen')) {
    var lc = mkCv(128, 128), lx = lc.getContext('2d');
    lx.fillStyle = '#2E6F38'; lx.fillRect(0, 0, 128, 128);
    for (var li = 0; li < 110; li++) {
      lx.fillStyle = (li % 3 === 0) ? '#46934F' : ((li % 3 === 1) ? '#1E5126' : '#58A85E');
      lx.fillRect((li * 37) % 118, (li * 59) % 118, 10, 8);
    }
    wgl.registerTextureCanvas('sgLeafGreen', lc, false);
  }
  if (!wgl.hasTexture('sgCreamFacade')) {
    var fc = mkCv(128, 128), fx = fc.getContext('2d');
    fx.fillStyle = '#F7E7C6'; fx.fillRect(0, 0, 128, 128);
    for (var fi = 0; fi < 90; fi++) {
      fx.fillStyle = (fi % 2 === 0) ? 'rgba(222,198,154,0.35)' : 'rgba(255,248,232,0.35)';
      fx.fillRect((fi * 43) % 120, (fi * 61) % 120, 8, 6);
    }
    wgl.registerTextureCanvas('sgCreamFacade', fc, false);
  }
  if (!wgl.hasTexture('sgTimberDark')) {
    var tc = mkCv(128, 128), tx = tc.getContext('2d');
    tx.fillStyle = '#6B4226'; tx.fillRect(0, 0, 128, 128);
    for (var ty = 0; ty < 128; ty += 8) {
      tx.fillStyle = (ty % 16 === 0) ? '#54321B' : '#7D5031';
      tx.fillRect(0, ty, 128, 3);
    }
    wgl.registerTextureCanvas('sgTimberDark', tc, false);
  }

  // 4. 3 Texture Skyline Sài Gòn (Bitexco, Landmark 81, Cầu Ba Son & Mây Trời 3 Sắc) đồng bộ Tab Banner Khám Phá
  function buildSgSkyline(mode, key) {
    if (wgl.hasTexture(key)) return;
    var c = mkCv(1024, 512), g = c.getContext('2d');
    var P = mode === 'night' ? {
      sky: ['#0F152D', '#182147', '#253162', '#35427A'],
      cloud: '#384376', cloudSh: '#222A52',
      far: '#1A2244', mid: '#121833', tower: '#2A355E', win: '#FDE047', bank: '#173A2B'
    } : (mode === 'sunset' ? {
      sky: ['#5C4B99', '#996496', '#DD887E', '#F8BD82'],
      cloud: '#FFE8C8', cloudSh: '#D98E8E',
      far: '#685483', mid: '#4E3E68', tower: '#5A4A75', win: '#FEF08A', bank: '#2D5A3C'
    } : {
      sky: ['#5BA9F5', '#82C3FA', '#AFDBFE', '#E0F1FF'],
      cloud: '#FFFDF8', cloudSh: '#C8DEF2',
      far: '#8CB4D8', mid: '#6F96BD', tower: '#7EA5CA', win: '#DBEAFE', bank: '#3E8245'
    });

    for (var s = 0; s < 4; s++) {
      g.fillStyle = P.sky[s]; g.fillRect(0, s * 105, 1024, 108);
    }
    // Mặt trời / Trăng
    if (mode === 'night') {
      g.fillStyle = '#FEF3C7'; g.fillRect(820, 48, 42, 42);
      g.fillStyle = P.sky[0]; g.fillRect(836, 44, 34, 34);
      g.fillStyle = '#FFFBEB';
      for (var stIdx = 0; stIdx < 48; stIdx++) {
        g.fillRect((stIdx * 97 + 23) % 1010, (stIdx * 53 + 12) % 210, 3, 3);
      }
    } else {
      g.fillStyle = (mode === 'sunset') ? '#FFEDD5' : '#FEF08A';
      g.fillRect(mode === 'sunset' ? 740 : 140, mode === 'sunset' ? 210 : 52, 56, 56);
    }
    // Mây pixel sắc nét nhẹ nhàng như Tab Banner
    var clouds = [[90, 86, 124], [320, 62, 148], [610, 94, 136], [860, 72, 128]];
    for (var ci = 0; ci < clouds.length; ci++) {
      var cl = clouds[ci];
      g.fillStyle = P.cloudSh; g.fillRect(cl[0] + 8, cl[1] + 22, cl[2], 22);
      g.fillStyle = P.cloud;
      g.fillRect(cl[0], cl[1] + 10, cl[2], 22);
      g.fillRect(cl[0] + 18, cl[1] - 6, cl[2] * 0.62, 22);
      g.fillRect(cl[0] + 36, cl[1] - 18, cl[2] * 0.34, 18);
    }
    // Cao ốc Thủ Thiêm nền xa
    var blds = [
      [24, 244, 62, 180], [98, 220, 56, 204], [166, 250, 72, 174], [250, 212, 54, 212],
      [410, 232, 68, 192], [492, 198, 60, 226], [566, 240, 74, 184], [748, 224, 68, 200], [834, 248, 70, 176], [918, 216, 82, 208]
    ];
    for (var bi = 0; bi < blds.length; bi++) {
      var b = blds[bi];
      g.fillStyle = (bi % 2 === 0) ? P.far : P.mid;
      g.fillRect(b[0], b[1], b[2], b[3]);
      g.fillStyle = P.win;
      for (var wy = b[1] + 14; wy < 395; wy += 18) {
        for (var wx = b[0] + 10; wx < b[0] + b[2] - 12; wx += 14) {
          if (mode === 'night' && ((wx + wy) % 3 === 0)) continue;
          g.fillRect(wx, wy, 6, 8);
        }
      }
    }
    // Bitexco Financial Tower + Bãi Đáp Trực Thăng (x ~ 318..384)
    g.fillStyle = P.tower; g.fillRect(322, 134, 56, 290);
    g.fillStyle = P.mid;   g.fillRect(334, 114, 34, 26);
    g.fillStyle = '#CBD5E1'; g.fillRect(364, 176, 36, 8); // Sân trực thăng nhô ra
    g.fillStyle = P.win;
    for (var bty = 152; bty < 398; bty += 14) g.fillRect(330, bty, 40, 5);

    // Landmark 81 vươn cao (x ~ 646..726)
    g.fillStyle = P.mid;   g.fillRect(652, 138, 70, 286);
    g.fillStyle = P.tower; g.fillRect(664, 88,  46, 336);
    g.fillStyle = P.far;   g.fillRect(678, 52,  20, 42);
    g.fillStyle = '#EF4444'; g.fillRect(686, 24, 5, 28); // Anten chóp đỏ
    g.fillStyle = P.win;
    for (var lmy = 104; lmy < 398; lmy += 12) g.fillRect(670, lmy, 34, 4);

    // Cầu Ba Son dây văng trắng & hàng cây bờ Thủ Thiêm phía chân đường chân trời
    g.fillStyle = '#E2E8F0';
    g.fillRect(410, 396, 170, 7);
    g.fillRect(482, 282, 10, 120);
    g.strokeStyle = 'rgba(241,245,249,0.75)'; g.lineWidth = 2;
    for (var cb = 0; cb < 5; cb++) {
      g.beginPath(); g.moveTo(487, 292 + cb * 8); g.lineTo(424 + cb * 14, 396); g.stroke();
      g.beginPath(); g.moveTo(487, 292 + cb * 8); g.lineTo(548 - cb * 14, 396); g.stroke();
    }
    g.fillStyle = P.bank; g.fillRect(0, 412, 1024, 100);
    wgl.registerTextureCanvas(key, c, false);
  }
  buildSgSkyline('day', 'sgSkylineDay');
  buildSgSkyline('sunset', 'sgSkylineSunset');
  buildSgSkyline('night', 'sgSkylineNight');
}

/* ==================== 2. BẢNG MÀU 3 THỜI ĐIỂM & XE CỘ / TÀU SÔNG BẠCH ĐẰNG ==================== */
function getSaigonBackdropPalette(st) {
  var hr = (typeof Date !== 'undefined') ? (new Date()).getHours() : 10;
  var mode = (st && st.skyModeOverride)
    ? st.skyModeOverride
    : ((hr >= 18 || hr < 6) ? 'night' : ((hr >= 16) ? 'sunset' : 'day'));
  if (mode === 'night') {
    return {
      mode: 'night',
      skylineTex: 'sgSkylineNight',
      roadTint: [0.64, 0.68, 0.78, 1],
      waterTint: [0.46, 0.56, 0.78, 1],
      bankTint: [0.40, 0.55, 0.44, 1],
      clearColor: [0.06, 0.08, 0.16, 1.0]
    };
  }
  if (mode === 'sunset') {
    return {
      mode: 'sunset',
      skylineTex: 'sgSkylineSunset',
      roadTint: [0.95, 0.80, 0.72, 1],
      waterTint: [0.85, 0.68, 0.62, 1],
      bankTint: [0.68, 0.70, 0.54, 1],
      clearColor: [0.24, 0.16, 0.22, 1.0]
    };
  }
  return {
    mode: 'day',
    skylineTex: 'sgSkylineDay',
    roadTint: [1, 1, 1, 1],
    waterTint: [0.92, 0.98, 1.0, 1],
    bankTint: [0.76, 0.90, 0.72, 1],
    clearColor: [0.48, 0.72, 0.92, 1.0]
  };
}

function createSaigonBackdropTraffic() {
  return {
    vehicles: [
      { kind: 'bus',   x: -18.0, z: -3.25, lane: 0, dir:  1, speed: 3.1, col: [0.10, 0.62, 0.42, 1] },
      { kind: 'taxi',  x:   1.5, z: -3.25, lane: 0, dir:  1, speed: 4.5, col: [0.16, 0.72, 0.34, 1] },
      { kind: 'moto',  x:  13.5, z: -3.25, lane: 0, dir:  1, speed: 5.1, col: [0.92, 0.34, 0.18, 1] },
      { kind: 'car',   x:  17.0, z: -5.45, lane: 1, dir: -1, speed: 4.2, col: [0.86, 0.20, 0.20, 1] },
      { kind: 'taxi',  x:  -2.0, z: -5.45, lane: 1, dir: -1, speed: 4.8, col: [0.96, 0.74, 0.16, 1] },
      { kind: 'moto',  x: -14.0, z: -5.45, lane: 1, dir: -1, speed: 5.5, col: [0.20, 0.48, 0.92, 1] }
    ],
    boats: [
      { kind: 'waterbus', x: -16.0, zOffset: -12.5, dir:  1, speed: 1.45, len: 5.6, col: [0.96, 0.74, 0.16, 1] },
      { kind: 'cruise',   x:  14.0, zOffset: -18.0, dir: -1, speed: 1.05, len: 7.4, col: [0.94, 0.95, 0.98, 1] },
      { kind: 'barge',    x:  -3.5, zOffset: -22.5, dir:  1, speed: 0.78, len: 4.8, col: [0.18, 0.56, 0.62, 1] }
    ]
  };
}

function stepSaigonBackdropTraffic(tr, dt) {
  if (!tr) return;
  if (tr.vehicles) {
    for (var vi = 0; vi < tr.vehicles.length; vi++) {
      var v = tr.vehicles[vi];
      v.x += v.dir * v.speed * dt;
      if (v.dir > 0 && v.x > 27) v.x = -27;
      if (v.dir < 0 && v.x < -27) v.x = 27;
    }
  }
  if (tr.boats) {
    for (var bi = 0; bi < tr.boats.length; bi++) {
      var b = tr.boats[bi];
      b.x += b.dir * b.speed * dt;
      if (b.dir > 0 && b.x > 29) b.x = -29;
      if (b.dir < 0 && b.x < -29) b.x = 29;
    }
  }
}

/* ==================== 3. VẼ 6 LỚP NGOẠI CẢNH ĐẠI LỘ + SÔNG BẠCH ĐẰNG + SKYLINE ==================== */
function drawSaigonVehicleMesh3D(wgl, v, baseZ, isNight) {
  var dm = wgl.drawMesh;
  var z = baseZ + (v.lane === 0 ? -3.25 : -5.45);
  var isBus = v.kind === 'bus', isMoto = v.kind === 'moto';
  var L = isBus ? 3.55 : (isMoto ? 1.25 : 2.25);
  var H = isBus ? 1.32 : (isMoto ? 0.68 : 0.72);
  var D = isBus ? 1.06 : (isMoto ? 0.42 : 0.92);
  dm('box', 'white', v.x, 0.14 + H * 0.5, z, 0, 0, 0, L, H, D, { tint: v.col });
  if (!isMoto) {
    dm('box', 'white', v.x - v.dir * 0.08, 0.14 + H + 0.24, z, 0, 0, 0, L * 0.56, 0.44, D * 0.86, { tint: [0.76, 0.88, 0.98, 1] });
  } else {
    dm('box', 'white', v.x - v.dir * 0.08, 0.86, z, 0, 0, 0, 0.36, 0.44, 0.32, { tint: [0.16, 0.46, 0.84, 1] });
    dm('sphere', 'white', v.x - v.dir * 0.06, 1.18, z, 0, 0, 0, 0.20, 0.20, 0.20, { tint: [0.96, 0.78, 0.18, 1] });
  }
  // Bánh xe đen & Đèn pha
  dm('cyl', 'white', v.x - L * 0.32, 0.18, z + D * 0.48, Math.PI * 0.5, 0, 0, 0.34, 0.10, 0.34, { tint: [0.12, 0.14, 0.18, 1] });
  dm('cyl', 'white', v.x + L * 0.32, 0.18, z + D * 0.48, Math.PI * 0.5, 0, 0, 0.34, 0.10, 0.34, { tint: [0.12, 0.14, 0.18, 1] });
  dm('box', 'white', v.x + v.dir * (L * 0.5 + 0.02), 0.38, z, 0, 0, 0, 0.06, 0.16, D * 0.65, {
    tint: [1.0, 0.96, 0.72, 1], emissive: isNight ? 1.55 : 0.35
  });
}

function drawSaigonBoatMesh3D(wgl, b, baseY, isNight, t) {
  var dm = wgl.drawMesh;
  var bob = Math.sin(t * 2.2 + b.x * 0.3) * 0.04;
  var y = baseY + bob;
  dm('box', 'white', b.x, y + 0.22, b.z, 0, 0, 0, b.len, 0.42, 1.35, { tint: [0.22, 0.26, 0.34, 1] });
  dm('box', 'white', b.x - b.dir * 0.2, y + 0.70, b.z, 0, 0, 0, b.len * 0.74, 0.56, 1.10, { tint: b.col });
  dm('box', 'white', b.x - b.dir * 0.1, y + 0.76, b.z + 0.56, 0, 0, 0, b.len * 0.52, 0.20, 0.06, {
    tint: isNight ? [1.0, 0.88, 0.42, 1] : [0.68, 0.86, 0.98, 1], emissive: isNight ? 1.2 : 0.2
  });
  dm('quad', 'white', b.x - b.dir * (b.len * 0.58), y + 0.05, b.z, Math.PI * 0.5, 0, 0, 1.6, 0.75, 1, {
    tint: [0.90, 0.97, 1.0, 0.72], emissive: 0.4
  });
}

function drawSaigonTree3D(wgl, x, z, scale, t) {
  var dm = wgl.drawMesh;
  var s = scale || 1;
  var sway = Math.sin((t || 0) * 1.4 + x) * 0.04;
  dm('cyl', 'sgTimberDark', x, 0.55 * s, z, 0, 0, 0, 0.16 * s, 1.15 * s, 0.16 * s, { tint: [0.75, 0.58, 0.42, 1] });
  dm('sphere', 'sgLeafGreen', x + sway, 1.32 * s, z, 0, 0, 0, 0.82 * s, 0.62 * s, 0.82 * s, { tint: [1, 1, 1, 1] });
  dm('sphere', 'sgLeafGreen', x - sway * 0.6, 1.65 * s, z, 0, 0, 0, 0.58 * s, 0.48 * s, 0.58 * s, { tint: [1.08, 1.10, 0.96, 1] });
}

function drawSaigonNeighborFacade3D(wgl, x, zFront, w, h, pal) {
  var dm = wgl.drawMesh;
  dm('box', 'sgCreamFacade', x, h * 0.5, zFront + 2.8, 0, 0, 0, w, h, 5.6, {
    tint: pal.mode === 'night' ? [0.68, 0.72, 0.82, 1] : [0.96, 0.92, 0.86, 1], us: 2, vs: 2
  });
  dm('box', 'sgTimberDark', x, 1.9, zFront - 0.18, 0, 0, 0, w * 0.84, 0.14, 0.65, { tint: [0.85, 0.35, 0.25, 1] });
  for (var wi = -1; wi <= 1; wi += 2) {
    dm('quad', 'white', x + wi * (w * 0.22), 3.6, zFront - 0.04, 0, 0, 0, 1.15, 1.45, 1, {
      tint: pal.mode === 'night' ? [0.98, 0.84, 0.44, 1] : [0.22, 0.30, 0.40, 1],
      emissive: pal.mode === 'night' ? 0.9 : 0.1
    });
  }
}

function drawSaigonStreetBackdrop3D(wgl, st, traffic, opts) {
  if (!wgl || !wgl.drawMesh) return;
  registerSaigonStreetBackdropTextures(wgl);
  var o = opts || {};
  var dm = wgl.drawMesh;
  var cx = (typeof o.centerX === 'number') ? o.centerX : 0;
  var fz = (typeof o.frontZ === 'number') ? o.frontZ : 0;
  var wide = o.width || 60;
  var pal = getSaigonBackdropPalette(st);
  var isNight = pal.mode === 'night';
  var t = (st && st.t) || 0;

  // 1. Vỉa hè trước cửa & hai dãy nhà phố cổ kề bên che kín góc nhìn xiên qua cửa sổ
  dm('box', 'sgCementWalk', cx, -0.06, fz - 1.05, 0, 0, 0, wide, 0.12, 2.2, {
    tint: isNight ? [0.66, 0.70, 0.78, 1] : [0.92, 0.88, 0.82, 1], us: 16, vs: 1
  });
  if (o.includeNeighbors !== false) {
    var lx1 = (typeof o.leftNeighborX === 'number') ? o.leftNeighborX : (cx - 12.8);
    var rx1 = (typeof o.rightNeighborX === 'number') ? o.rightNeighborX : (cx + 12.8);
    var nh = o.neighborHeight || 7.2;
    drawSaigonNeighborFacade3D(wgl, lx1, fz, 7.6, nh, pal);
    drawSaigonNeighborFacade3D(wgl, lx1 - 8.4, fz, 7.6, nh - 0.4, pal);
    drawSaigonNeighborFacade3D(wgl, rx1, fz, 7.6, nh + 0.2, pal);
    drawSaigonNeighborFacade3D(wgl, rx1 + 8.4, fz, 7.6, nh - 0.3, pal);
  }

  // 2. Đường nhựa Đại Lộ 2 làn (Z ∈ [fz - 6.7, fz - 2.0]) + 6 xe chạy 2 chiều 60fps
  dm('box', 'sgRoadAsphalt', cx, -0.09, fz - 4.35, 0, 0, 0, wide, 0.08, 4.7, { tint: pal.roadTint, us: 14, vs: 1 });
  if (traffic && traffic.vehicles) {
    for (var vi = 0; vi < traffic.vehicles.length; vi++) {
      drawSaigonVehicleMesh3D(wgl, traffic.vehicles[vi], fz, isNight);
    }
  }

  // 3. Bờ kè đá Bạch Đằng + lan can + 4 đèn đường + hàng cây xanh bờ kè
  dm('box', 'sgCementWalk', cx, -0.02, fz - 7.15, 0, 0, 0, wide, 0.18, 0.95, {
    tint: isNight ? [0.60, 0.65, 0.75, 1] : [0.80, 0.76, 0.70, 1], us: 14, vs: 1
  });
  dm('box', 'white', cx, 0.50, fz - 7.52, 0, 0, 0, wide, 0.10, 0.10, { tint: [0.30, 0.26, 0.22, 1] });
  var lampXs = [cx - 12.0, cx - 4.0, cx + 4.0, cx + 12.0];
  for (var li = 0; li < lampXs.length; li++) {
    dm('cyl', 'white', lampXs[li], 1.65, fz - 6.95, 0, 0, 0, 0.08, 3.3, 0.08, { tint: [0.22, 0.24, 0.28, 1] });
    dm('sphere', 'white', lampXs[li], 3.35, fz - 6.95, 0, 0, 0, 0.24, 0.24, 0.24, {
      tint: [1.0, 0.94, 0.68, 1], emissive: isNight ? 1.6 : 0.4
    });
  }
  for (var ti = -14; ti <= 14; ti += 4.6) {
    drawSaigonTree3D(wgl, cx + ti, fz - 7.05, 1.55, t + ti * 0.2);
  }

  // 4. Sông Bạch Đằng 58m + 3 tàu thủy rẽ sóng 60fps
  dm('box', 'sgRiverWater', cx, -0.28, fz - 16.9, 0, 0, 0, wide, 0.08, 19.4, { tint: pal.waterTint, us: 12, vs: 5 });
  if (traffic && traffic.boats) {
    for (var bi = 0; bi < traffic.boats.length; bi++) {
      var bt = traffic.boats[bi];
      drawSaigonBoatMesh3D(wgl, { x: bt.x, z: fz + bt.zOffset, dir: bt.dir, len: bt.len, col: bt.col }, -0.24, isNight, t);
    }
  }

  // 5. Bờ Thủ Thiêm & Skyline Bitexco / Landmark 81 + Mây trời 3 sắc (đủ cao cho cửa sổ tầng 1 & tầng 2)
  dm('box', 'sgLeafGreen', cx, 0.44, fz - 26.4, 0, 0, 0, wide, 1.4, 2.8, { tint: pal.bankTint, us: 12, vs: 1 });
  dm('quad', pal.skylineTex, cx, 9.6, fz - 27.8, 0, 0, 0, wide, 22.4, 1, { tint: [1, 1, 1, 1], emissive: 1.0 });
}

/* ==================== 4. VÒNG CHÂN TRỜI SKYLINE CHO CHÙA CỔ & SVĐ (XÓA MẢNG TRỜI THÔ CŨ) ==================== */
function drawSaigonHorizonRing3D(wgl, st, cfg) {
  if (!wgl || !wgl.drawMesh) return;
  registerSaigonStreetBackdropTextures(wgl);
  var c = cfg || {};
  var dm = wgl.drawMesh;
  var pal = c.forceNight ? { skylineTex: 'sgSkylineNight' } : getSaigonBackdropPalette(st);
  var cx = c.cx || 0, cz = c.cz || 0, y = c.y || 9.0;
  var rx = c.rx || 26, rz = c.rz || 26;
  var wX = c.widthX || 62, wZ = c.widthZ || 62, h = c.height || 24;
  // Chỉ dựng 4 mặt chân trời Skyline Sài Gòn sắc nét (bỏ tấm trần vuông emissive thô lơ lửng trên đầu!)
  dm('quad', pal.skylineTex, cx,      y, cz - rz, 0, 0,            0, wX, h, 1, { tint: [1, 1, 1, 1], emissive: 0.96 });
  dm('quad', pal.skylineTex, cx,      y, cz + rz, 0, Math.PI,      0, wX, h, 1, { tint: [1, 1, 1, 1], emissive: 0.96 });
  dm('quad', pal.skylineTex, cx - rx, y, cz,      0, Math.PI * 0.5,  0, wZ, h, 1, { tint: [1, 1, 1, 1], emissive: 0.96 });
  dm('quad', pal.skylineTex, cx + rx, y, cz,      0, -Math.PI * 0.5, 0, wZ, h, 1, { tint: [1, 1, 1, 1], emissive: 0.96 });
}
`;
}
