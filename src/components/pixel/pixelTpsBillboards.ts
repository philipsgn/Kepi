/**
 * Hệ Thống Sprite Pixel Art Billboard gl.NEAREST Dùng Chung Cho Chú Heo 24×20 & Con Người (Quyết định 248–250)
 * Tài liệu gốc: docs/TPS_3D_OPEN_WORLD_SPEC.md (§7.3) & docs/VIETNAM_PIXEL_ART_BIBLE.md (§7.2)
 * - Khóa cache rời rạc tuyệt đối (Discrete Cache Keys — Zero Float Leakage).
 * - Bảo toàn 100% tạo hình chú Heo 24×20 chuẩn Tab Vườn & con người drawHumanTps3D rõ khuôn mặt pixel.
 * - Dùng texture 64×64 gl.NEAREST (không mipmap) + uEmissive: 1.0 + alpha < 0.08 discard.
 */
export function buildPixelTpsBillboardsScript(): string {
  return String.raw`
/* ==================== 1. HELPER CHIẾT XUẤT MÀU & KHÓA RỜI RẠC ==================== */
function bbNormAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function bbColorToHex(c, fallback) {
  if (typeof c === 'string') return c;
  if (c && c.length >= 3) {
    var r = Math.max(0, Math.min(255, Math.round(c[0] * 255))).toString(16);
    var g = Math.max(0, Math.min(255, Math.round(c[1] * 255))).toString(16);
    var b = Math.max(0, Math.min(255, Math.round(c[2] * 255))).toString(16);
    return '#' + (r.length < 2 ? '0' + r : r) + (g.length < 2 ? '0' + g : g) + (b.length < 2 ? '0' + b : b);
  }
  return fallback || '#3B82F6';
}

/* ==================== 2. PIXEL PIG 24×20 BILLBOARD (GL.NEAREST, DISCRETE KEYS) ==================== */
function renderPigBillboardCanvas(view, stepPhase, seated, blink, eating, isAiCoach, outfit) {
  var c = document.createElement('canvas'); c.width = 64; c.height = 64;
  var g = c.getContext('2d');
  g.clearRect(0, 0, 64, 64);
  var u = 2, cx = 32, cy = 58;
  var bodyOffY = seated ? -2 : 0;
  function r(ox, oy, rw, rh, col) {
    g.fillStyle = col;
    g.fillRect(Math.round(cx + ox * u), Math.round(cy + (oy + bodyOffY) * u), Math.round(rw * u), Math.round(rh * u));
  }
  var st = seated ? 0 : (stepPhase || 0);
  var rawOf = outfit || 'none';
  var hasBag = rawOf.indexOf('+bag') >= 0;
  var ofName = hasBag ? rawOf.replace('+bag', '') : rawOf;
  var isJogger = ofName === 'adidas_jogger';
  var legMainCol = isJogger ? '#334155' : null;
  var shoeSamba = isJogger;

  if (view === 'back') {
    r(-6, -4 + st, 4, 4, '#2B2118'); r(-5, -4 + st, 2, 3, legMainCol || '#D96D85');
    r(2, -4 - st, 4, 4, '#2B2118');  r(3, -4 - st, 2, 3, legMainCol || '#D96D85');
    if (shoeSamba) { r(-6, -1 + st, 4, 1, '#B45309'); r(2, -1 - st, 4, 1, '#B45309'); }
    r(-8, -18, 16, 15, '#2B2118'); r(-10, -16, 20, 11, '#2B2118');
    r(-7, -17, 14, 13, '#F596A8'); r(-9, -15, 18, 9, '#F596A8');
    r(-7, -17, 14, 4, '#FDBAC7');  r(-7, -6, 14, 2, '#D96D85');
    if (ofName === 'adidas_jacket') {
      r(-8, -15, 16, 9, '#1E293B'); r(-7, -15, 1, 9, '#FFFFFF'); r(6, -15, 1, 9, '#FFFFFF');
      r(-2, -12, 4, 1, '#FFFFFF');
    } else if (ofName === 'adidas_polo') {
      r(-8, -16, 16, 9, '#1E3A8A'); r(-5, -17, 10, 2, '#FFFBF1');
      r(-7, -15, 1, 7, '#60A5FA'); r(6, -15, 1, 7, '#60A5FA');
    } else if (ofName === 'adidas_jogger') {
      r(-8, -12, 16, 7, '#334155'); r(-7, -12, 1, 7, '#FFFFFF'); r(6, -12, 1, 7, '#FFFFFF');
      r(-8, -16, 16, 4, '#F8FAFC'); r(-2, -15, 4, 2, '#111827');
    } else if (ofName === 'adidas_kit') {
      r(-8, -16, 16, 10, '#DC2626'); r(-7, -16, 1, 8, '#FACC15'); r(6, -16, 1, 8, '#FACC15');
      // Số 10 pixel sau lưng áo đấu
      r(-3, -13, 1, 5, '#FFFBF1'); r(0, -13, 3, 5, '#FFFBF1'); r(1, -12, 1, 3, '#DC2626');
    } else if (ofName === 'nike_tee') {
      r(-8, -16, 16, 9, '#0F172A'); r(-4, -13, 5, 2, '#F97316'); r(1, -14, 3, 2, '#F97316');
      r(-3, -16, 6, 1, '#FFFBF1');
    } else if (ofName === 'nike_hoodie') {
      r(-8, -16, 16, 10, '#EA580C'); r(-6, -17, 12, 3, '#1E293B');
      r(-4, -12, 5, 2, '#FFFBF1'); r(1, -13, 3, 2, '#FFFBF1');
    } else if (ofName === 'aodai') {
      r(-8, -16, 16, 11, '#DC2626'); r(-2, -14, 4, 4, '#FACC15');
    } else if (ofName === 'vn_kit') {
      r(-8, -16, 16, 10, '#DC2626'); r(-2, -14, 4, 4, '#FFFF00');
    }
    if (hasBag) {
      r(8, -12, 5, 7, '#111827'); r(9, -14, 3, 2, '#FACC15'); r(9, -10, 3, 1, '#FFFFFF'); r(9, -8, 3, 1, '#FFFFFF');
    }
    r(-8, -22, 4, 5, '#2B2118');   r(-7, -21, 2, 3, '#F596A8');
    r(4, -22, 4, 5, '#2B2118');    r(5, -21, 2, 3, '#F596A8');
    r(-3, -16, 6, 2, '#2B2118');   r(-2, -16, 4, 1, '#F4B93B');
    r(-2 + st, -11, 4, 3, '#2B2118'); r(-1 + st, -10, 2, 1, '#FDBAC7');
  } else if (view === 'front') {
    r(-6, -4 + st, 4, 4, '#2B2118'); r(-5, -4 + st, 2, 3, legMainCol || '#F596A8');
    r(2, -4 - st, 4, 4, '#2B2118');  r(3, -4 - st, 2, 3, legMainCol || '#F596A8');
    if (shoeSamba) { r(-6, -1 + st, 4, 1, '#FFFBF1'); r(2, -1 - st, 4, 1, '#FFFBF1'); }
    r(-8, -18, 16, 15, '#2B2118'); r(-10, -16, 20, 11, '#2B2118');
    r(-7, -17, 14, 13, '#F596A8'); r(-9, -15, 18, 9, '#F596A8');
    r(-7, -17, 14, 4, '#FDBAC7');
    if (ofName === 'adidas_jacket') {
      r(-8, -11, 16, 5, '#111827'); r(-1, -11, 2, 5, '#FFFFFF');
    } else if (ofName === 'adidas_polo') {
      r(-8, -11, 16, 5, '#1E3A8A'); r(-5, -11, 3, 2, '#FFFBF1'); r(2, -11, 3, 2, '#FFFBF1'); r(-1, -10, 2, 3, '#FFFFFF');
    } else if (ofName === 'adidas_jogger') {
      r(-8, -11, 16, 5, '#334155'); r(-7, -11, 1, 5, '#FFFFFF'); r(6, -11, 1, 5, '#FFFFFF'); r(-2, -10, 4, 1, '#FFFBF1');
    } else if (ofName === 'adidas_kit') {
      r(-8, -11, 16, 5, '#DC2626'); r(-7, -11, 2, 4, '#FACC15'); r(5, -11, 2, 4, '#FACC15');
    } else if (ofName === 'nike_tee') {
      r(-8, -11, 16, 5, '#0F172A'); r(-3, -10, 4, 2, '#F97316'); r(1, -11, 2, 2, '#F97316');
    } else if (ofName === 'nike_hoodie') {
      r(-8, -11, 16, 6, '#EA580C'); r(-2, -11, 4, 6, '#1E293B'); r(3, -10, 3, 1, '#FFFBF1');
    } else if (ofName === 'aodai') {
      r(-8, -11, 16, 6, '#DC2626'); r(-1, -10, 2, 2, '#FACC15');
    } else if (ofName === 'vn_kit') {
      r(-8, -11, 16, 5, '#DC2626'); r(-1, -10, 2, 2, '#FFFF00');
    }
    if (hasBag) {
      r(-12, -11, 4, 7, '#111827'); r(-11, -13, 2, 2, '#FACC15'); r(-11, -9, 2, 1, '#FFFFFF');
    }
    r(-8, -22, 4, 5, '#2B2118');   r(-7, -21, 2, 3, '#FDBAC7');
    r(4, -22, 4, 5, '#2B2118');    r(5, -21, 2, 3, '#FDBAC7');
    var eyeH = blink ? 1 : 3;
    var eyeY = blink ? -13 : -14;
    r(-6, eyeY, 3, eyeH, '#2B2118'); if (!blink) r(-5, -14, 1, 1, '#FFFFFF');
    r(3, eyeY, 3, eyeH, '#2B2118');  if (!blink) r(4, -14, 1, 1, '#FFFFFF');
    r(-4, -11, 8, 5, '#2B2118');   r(-3, -10, 6, 3, '#FBC2CE');
    r(-2, -9, 1, 2, '#2B2118');    r(1, -9, 1, 2, '#2B2118');
    r(-8, -10, 2, 2, '#F472B6');   r(6, -10, 2, 2, '#F472B6');
    if (isAiCoach) {
      r(-6, -15, 5, 4, '#2B2118'); r(-5, -14, 3, 2, '#E0F2FE');
      r(1, -15, 5, 4, '#2B2118');  r(2, -14, 3, 2, '#E0F2FE');
      r(-1, -14, 2, 1, '#2B2118');
    }
    if (eating) {
      r(6, -11, 6, 1, '#D97706'); r(6, -9, 6, 1, '#F59E0B');
    }
  } else {
    var dir = view === 'right' ? 1 : -1;
    function sr(ox, oy, rw, rh, col) {
      r(dir > 0 ? ox : -(ox + rw), oy, rw, rh, col);
    }
    sr(-7, -4 + st, 3, 4, '#2B2118'); sr(-6, -4 + st, 2, 3, legMainCol || '#D96D85');
    sr(4, -4 - st, 3, 4, '#2B2118');  sr(5, -4 - st, 2, 3, legMainCol || '#F596A8');
    if (shoeSamba) { sr(-7, -1 + st, 3, 1, '#B45309'); sr(4, -1 - st, 3, 1, '#B45309'); }
    sr(-9, -17, 17, 14, '#2B2118');   sr(-11, -15, 21, 10, '#2B2118');
    sr(-8, -16, 15, 12, '#F596A8');   sr(-10, -14, 19, 8, '#F596A8');
    sr(-8, -16, 15, 3, '#FDBAC7');
    if (ofName === 'adidas_jacket') {
      sr(-8, -12, 15, 6, '#111827'); sr(-2, -12, 3, 6, '#FFFFFF');
    } else if (ofName === 'adidas_polo') {
      sr(-8, -13, 15, 6, '#1E3A8A'); sr(3, -14, 4, 2, '#FFFBF1'); sr(-2, -12, 3, 5, '#60A5FA');
    } else if (ofName === 'adidas_jogger') {
      sr(-8, -10, 15, 5, '#334155'); sr(-1, -10, 2, 5, '#FFFFFF');
      sr(-8, -14, 15, 4, '#F8FAFC');
    } else if (ofName === 'adidas_kit') {
      sr(-8, -13, 15, 7, '#DC2626'); sr(-2, -13, 3, 6, '#FACC15');
    } else if (ofName === 'nike_tee') {
      sr(-8, -13, 15, 6, '#0F172A'); sr(-2, -11, 4, 2, '#F97316'); sr(2, -12, 2, 1, '#F97316');
    } else if (ofName === 'nike_hoodie') {
      sr(-8, -13, 15, 7, '#EA580C'); sr(-7, -15, 6, 3, '#1E293B'); sr(0, -11, 4, 2, '#FFFBF1');
    } else if (ofName === 'aodai' || ofName === 'vn_kit') {
      sr(-8, -12, 15, 7, '#DC2626'); sr(-1, -10, 2, 2, '#FACC15');
    }
    if (hasBag) {
      sr(-4, -10, 5, 6, '#111827'); sr(-3, -12, 3, 2, '#FACC15'); sr(-3, -8, 3, 1, '#FFFFFF');
    }
    sr(-2, -17, 5, 2, '#F4B93B');
    sr(2, -21, 4, 5, '#2B2118');      sr(3, -20, 2, 3, '#FDBAC7');
    sr(9, -12, 4, 5, '#2B2118');      sr(10, -11, 2, 3, '#FBC2CE');
    sr(5, -13, 2, blink ? 1 : 3, '#2B2118');
    sr(-13, -12 - st, 3, 3, '#2B2118');
    if (eating) {
      sr(9, -12, 6, 1, '#D97706'); sr(9, -10, 6, 1, '#F59E0B');
    }
  }
  return c;
}

function buildPigBillboardTextures(wgl, extraOutfits) {
  var views = ['back', 'front', 'left', 'right'];
  for (var vi = 0; vi < views.length; vi++) {
    var vw = views[vi];
    wgl.registerTextureCanvas('pig_' + vw + '_0', renderPigBillboardCanvas(vw, 0, 0, 0, 0, 0, 'none'), false, true);
    wgl.registerTextureCanvas('pig_' + vw + '_1', renderPigBillboardCanvas(vw, 1, 0, 0, 0, 0, 'none'), false, true);
  }
  wgl.registerTextureCanvas('pig_ai_front', renderPigBillboardCanvas('front', 0, 1, 0, 0, 1, 'none'), false, true);
  if (extraOutfits && extraOutfits.length) {
    for (var oi = 0; oi < extraOutfits.length; oi++) {
      var of = extraOutfits[oi];
      for (var v2 = 0; v2 < views.length; v2++) {
        var vw2 = views[v2];
        var k = 'pig_' + vw2 + '_0_' + of;
        wgl.registerTextureCanvas(k, renderPigBillboardCanvas(vw2, 0, 0, 0, 0, 0, of), false, true);
      }
    }
  }
}

function ensurePigBillboardTex(wgl, view, stepPhase, seated, blink, eating, isAiCoach, outfit) {
  var of = outfit || 'none';
  if (!blink && !eating && !seated && stepPhase >= 0 && of === 'none') {
    if (isAiCoach && view === 'front') return 'pig_ai_front';
    return 'pig_' + view + '_' + (stepPhase ? '1' : '0');
  }
  var key = 'pig_' + view + '_' + stepPhase + '_' + seated + '_' + blink + '_' + eating + '_' + isAiCoach + '_' + of;
  if (!wgl.hasTexture(key)) {
    wgl.registerTextureCanvas(key, renderPigBillboardCanvas(view, stepPhase, seated, blink, eating, isAiCoach, of), false, true);
  }
  return key;
}

function drawPigBillboardWebgl(wgl, cam, pig, t, isAiCoach) {
  var dm = wgl.drawMesh;
  var liftY = pig.seated ? 0.24 : 0;
  var bounce = pig.walking ? Math.abs(Math.sin(t * 14)) * 0.05 : (pig.eating ? Math.abs(Math.sin(t * 7)) * 0.02 : 0);
  var dxCam = cam.pos.x - pig.x, dzCam = cam.pos.z - pig.z;
  var faceCamYaw = Math.atan2(dxCam, dzCam);
  var camLookYaw = Math.atan2(-dxCam, -dzCam);

  var rel = bbNormAngle((pig.yaw || 0) - camLookYaw);
  var absRel = Math.abs(rel);
  var view = absRel < 0.78 ? 'back' : (absRel > 2.32 ? 'front' : (rel > 0 ? 'right' : 'left'));
  var stepPhase = pig.walking ? (Math.sin(t * 14) >= 0 ? 1 : -1) : 0;
  var seated = pig.seated ? 1 : 0;
  var blink = (t % 3.8) < 0.14 ? 1 : 0;
  var eating = pig.eating ? 1 : 0;
  var ai = (isAiCoach || pig.isAiCoach) ? 1 : 0;
  var baseOutfit = pig.outfit || (pig.wearingJacket ? 'adidas_jacket' : (pig.wearingAoDai ? 'aodai' : (pig.wearingKit ? 'vn_kit' : 'none')));
  var outfit = (pig.boughtSamba && baseOutfit.indexOf('+bag') < 0) ? (baseOutfit + '+bag') : baseOutfit;
  var texKey = ensurePigBillboardTex(wgl, view, stepPhase, seated, blink, eating, ai, outfit);

  wgl.setBlend('alpha');
  dm('cyl', 'white', pig.x, (pig.y || 0) + 0.012, pig.z, 0, 0, 0, 0.42, 0.01, 0.42, { tint: [0.08, 0.07, 0.05, 0.34], emissive: 1.0 });
  wgl.setBlend(null);

  dm('quad', texKey, pig.x, (pig.y || 0) + liftY + 0.33 + bounce, pig.z, 0, faceCamYaw, 0, 0.72, 0.72, 1, {
    tint: [1, 1, 1, 1],
    emissive: 1.0
  });
}

/* ==================== 3. CON NGƯỜI PIXEL ART BILLBOARD (drawHumanTps3D 1:1, GL.NEAREST) ==================== */
function renderHumanBillboardCanvas(role, angleKey, stepPhase, seated, blink, eating, shirtHex, hairHex, carryProp) {
  var c = document.createElement('canvas'); c.width = 64; c.height = 64;
  var g = c.getContext('2d');
  g.clearRect(0, 0, 64, 64);
  var u = 1.5, cx = 32, cy = 60;
  var liftOff = seated ? 2 : 0;
  function hr(ox, oy, rw, rh, col) {
    g.fillStyle = col;
    g.fillRect(Math.round(cx + ox * u), Math.round(cy + (oy + liftOff) * u), Math.max(1, Math.round(rw * u)), Math.max(1, Math.round(rh * u)));
  }

  var step = seated ? 0 : (stepPhase || 0) * 2;
  var isAnyChef = role === 'chef' || role === 'chef_butcher' || role === 'chef_noodle';
  var isBarista = role === 'barista' || role === 'cafe_waiter';
  var pantsCol = (role === 'vn_player' || role === 'vn_captain' || role === 'sub_home') ? '#991B1B' :
    ((role === 'away_player' || role === 'sub_away') ? '#1E3A8A' : (role === 'monk' ? '#78350F' : '#1E293B'));

  // 1. Chân / Quần
  if (!seated) {
    hr(-4, -9 + step * 0.4, 3, 9, pantsCol);
    hr(1, -9 - step * 0.4, 3, 9, pantsCol);
  } else {
    hr(-4, -5, 8, 5, pantsCol);
  }

  // 2. Thân áo & Đồng phục đặc trưng từng địa danh
  var bodyFill = isBarista ? '#4A5D36' :
    (role === 'adidas_staff' ? '#111827' :
    (role === 'monk' ? '#B45309' :
    (role === 'worshipper' ? '#64748B' :
    (role === 'vn_player' || role === 'vn_captain' || role === 'vn_fan' ? '#DC2626' :
    (role === 'vn_coach' ? '#1E3A8A' :
    (role === 'away_coach' ? '#0F172A' :
    (role === 'sub_home' ? '#F97316' :
    (role === 'sub_away' ? '#84CC16' :
    (role === 'steward' ? '#FACC15' :
    (role === 'away_player' ? '#2563EB' :
    (role === 'gk' ? (shirtHex || '#16A34A') :
    (role === 'referee' || role === 'linesman' ? '#0F172A' :
    (role === 'press' ? '#475569' : (shirtHex || '#3B82F6'))))))))))))));

  hr(-6, -21, 12, 13, '#2B2118');
  hr(-5, -20, 10, 11, bodyFill);

  if (isAnyChef) {
    hr(-4, -19, 8, 10, '#FFFDF7');
    hr(-5, -16, 10, 1, '#94A3B8');
    hr(-3, -18, 2, 1, '#DC2626');
  } else if (role === 'waiter') {
    hr(-3, -20, 1, 3, '#7F1D1D'); hr(2, -20, 1, 3, '#7F1D1D');
    hr(-4, -17, 8, 9, '#991B1B');
    hr(-5, -14, 10, 1, '#FACC15');
    hr(-3, -12, 6, 3, '#7F1D1D');
  } else if (isBarista) {
    hr(-2, -18, 4, 2, '#DC2626');
    hr(-1, -18, 2, 2, '#FACC15');
    hr(-4, -13, 8, 5, '#364627');
    hr(-5, -13, 10, 1, '#26331B');
  } else if (role === 'adidas_staff') {
    hr(-5, -20, 1, 8, '#FFFFFF'); hr(4, -20, 1, 8, '#FFFFFF');
    hr(-3, -18, 3, 1, '#F8FAFC');
  } else if (role === 'monk') {
    hr(-5, -20, 5, 11, '#D97706');
    hr(-2, -17, 2, 2, '#FACC15');
  } else if (role === 'vn_player' || role === 'vn_captain' || role === 'vn_fan') {
    hr(-2, -17, 4, 3, '#FFFF00');
    if (role === 'vn_captain') hr(-5, -18, 2, 2, '#FACC15');
  } else if (role === 'steward') {
    // Áo phản quang An Ninh SVĐ + sọc bạc phản quang ngang
    hr(-5, -16, 10, 2, '#E2E8F0');
    hr(-5, -12, 10, 1, '#E2E8F0');
    hr(-1, -19, 2, 2, '#1E293B');
  } else if (role === 'sub_home' || role === 'sub_away') {
    // Áo bib tập luyện cho cầu thủ dự bị
    hr(-4, -19, 8, 8, role === 'sub_home' ? '#EA580C' : '#65A30D');
    hr(-2, -16, 4, 2, '#FEF08A');
  } else if (role === 'vn_coach' || role === 'away_coach') {
    hr(-1, -20, 2, 10, '#F8FAFC');
    hr(-1, -19, 2, 7, role === 'vn_coach' ? '#DC2626' : '#3B82F6');
  } else if (role === 'referee' || role === 'linesman') {
    hr(-3, -20, 1, 11, '#F8FAFC'); hr(0, -20, 1, 11, '#F8FAFC'); hr(3, -20, 1, 11, '#F8FAFC');
  } else if (role === 'gk') {
    hr(-5, -20, 1, 10, '#FACC15'); hr(4, -20, 1, 10, '#FACC15');
    hr(-2, -17, 4, 2, '#FFFBF1');
    hr(-8, -16, 3, 4, '#FDE047'); hr(5, -16, 3, 4, '#FDE047');
  } else if (role === 'press') {
    hr(-4, -19, 8, 9, '#78716C');
    hr(-3, -14, 3, 3, '#44403C'); hr(1, -14, 3, 3, '#44403C');
  }

  // 3. Đạo cụ cầm tay rời rạc
  if (role === 'chef') {
    hr(5, -17, 4, 2, '#FCD5B5'); hr(8, -19, 2, 7, '#CBD5E1');
  } else if (role === 'chef_butcher') {
    hr(5, -18, 4, 2, '#FCD5B5'); hr(8, -21, 4, 4, '#E2E8F0');
  } else if (role === 'chef_noodle') {
    hr(5, -17, 4, 2, '#FCD5B5'); hr(8, -19, 3, 6, '#D98A36');
  } else if (role === 'barista' && carryProp === 'none') {
    hr(5, -17, 4, 2, '#FCD5B5'); hr(8, -20, 4, 5, '#94A3B8');
  } else if (carryProp === 'coffee' || carryProp === 'tray') {
    hr(4, -16, 4, 2, '#FCD5B5'); hr(5, -18, 8, 2, '#5C341D'); hr(7, -22, 3, 4, '#FFFFFF');
  } else if (carryProp === 'bowl') {
    hr(4, -16, 4, 2, '#FCD5B5'); hr(5, -19, 7, 4, '#FFFDF7'); hr(6, -19, 5, 2, '#E6A825');
  } else if (carryProp === 'shoebox') {
    hr(4, -16, 4, 2, '#FCD5B5'); hr(5, -19, 6, 4, '#1D4ED8'); hr(5, -18, 6, 1, '#FFFFFF');
  } else if (carryProp === 'camera') {
    hr(4, -17, 4, 2, '#FCD5B5'); hr(6, -19, 5, 4, '#1E293B'); hr(10, -18, 2, 2, '#94A3B8');
  } else if (carryProp === 'mic') {
    hr(4, -16, 4, 2, '#FCD5B5'); hr(8, -20, 2, 5, '#0F172A'); hr(8, -22, 2, 2, '#EF4444');
  } else if (carryProp === 'flag') {
    hr(4, -18, 4, 2, '#FCD5B5'); hr(7, -26, 1, 10, '#E2E8F0'); hr(8, -26, 5, 4, '#FACC15'); hr(8, -24, 3, 2, '#DC2626');
  } else if (carryProp === 'vn_flag') {
    hr(4, -19, 3, 2, '#FCD5B5'); hr(6, -29, 1, 12, '#F8FAFC'); hr(7, -29, 6, 5, '#DA251D'); hr(9, -27, 2, 2, '#FDE047');
  } else if (carryProp === 'board') {
    hr(4, -16, 4, 2, '#FCD5B5'); hr(6, -19, 5, 6, '#15803D'); hr(7, -18, 3, 4, '#F8FAFC');
  } else if (carryProp === 'ball') {
    hr(5, -10, 4, 4, '#FFFFFF'); hr(6, -9, 2, 2, '#1E293B');
  } else if (eating) {
    hr(4, -18, 4, 1, '#D97706');
  }

  // 4. Đầu & Khuôn mặt pixel chi tiết 1:1 drawHumanTps3D (CHỈ vẽ mặt khi angleKey === 'front'!)
  hr(-5, -31, 10, 10, '#2B2118');
  if (angleKey === 'back') {
    if (role === 'monk') hr(-4, -30, 8, 8, '#FFD8B8');
    else hr(-4, -30, 8, 8, hairHex || '#2B2118');
  } else {
    hr(-4, -30, 8, 8, '#FFD8B8');
    if (role !== 'monk') {
      hr(-4, -31, 8, 3, hairHex || '#2B2118');
    }
    if (angleKey === 'front') {
      if (blink) {
        hr(-3, -26, 2, 1, '#2B2118'); hr(1, -26, 2, 1, '#2B2118');
      } else {
        hr(-3, -27, 2, 2, '#2B2118'); hr(1, -27, 2, 2, '#2B2118'); // Đôi mắt
      }
      hr(-3, -25, 1, 1, '#F472B6'); hr(2, -25, 1, 1, '#F472B6'); // Má hồng
      hr(-1, -24, 2, 1, '#A65432'); // Miệng cười
    } else {
      // Góc nghiêng: thấy 1 bên mắt & tóc bên thái dương (không lộ mặt chính diện)
      hr(1, -27, 2, 2, '#2B2118');
      if (role !== 'monk') hr(-4, -30, 3, 6, hairHex || '#2B2118');
    }
  }

  // Mũ đặc trưng (Đầu bếp / Barista / An Ninh)
  if (isAnyChef) {
    hr(-5, -37, 10, 6, '#2B2118'); hr(-4, -36, 8, 5, '#FFFFFF');
  } else if (isBarista || role === 'steward') {
    hr(-5, -34, 10, 4, '#2B2118'); hr(-4, -33, 8, 3, role === 'steward' ? '#0F172A' : '#556B3E'); hr(-4, -31, 9, 1, role === 'steward' ? '#FACC15' : '#3B4D2B');
  }
  return c;
}

function ensureHumanBillboardTex(wgl, role, angleKey, stepPhase, seated, blink, eating, shirtHex, hairHex, carryProp) {
  var key = 'hm_' + role + '_' + angleKey + '_' + stepPhase + '_' + seated + '_' + blink + '_' + eating + '_' + shirtHex + '_' + hairHex + '_' + carryProp;
  if (!wgl.hasTexture(key)) {
    wgl.registerTextureCanvas(key, renderHumanBillboardCanvas(role, angleKey, stepPhase, seated, blink, eating, shirtHex, hairHex, carryProp), false, true);
  }
  return key;
}

function drawHumanBillboardWebgl(wgl, cam, h, t) {
  var dm = wgl.drawMesh;
  var x = h.x, y = h.y || 0, z = h.z;
  var dxCam = cam.pos.x - x, dzCam = cam.pos.z - z;
  var faceCamYaw = Math.atan2(dxCam, dzCam);
  var camLookYaw = Math.atan2(-dxCam, -dzCam);

  var rel = bbNormAngle((h.yaw || 0) - camLookYaw);
  var absRel = Math.abs(rel);
  // Khớp chính xác ngưỡng showFace = Math.abs(rel) > 1.25 của drawHumanTps3D!
  var angleKey = absRel > 1.25 ? 'front' : (absRel < 0.78 ? 'back' : 'side');
  var isMoving = !!(h.moving || h.state === 'WALK');
  var stepPhase = (isMoving && !h.seated) ? (Math.sin(t * 10 + (h.phase || 0)) > 0.3 ? 1 : (Math.sin(t * 10 + (h.phase || 0)) < -0.3 ? -1 : 0)) : 0;
  var seated = (h.seated || h.state === 'SIT') ? 1 : 0;
  var blink = ((t + (h.phase || 0)) % 4.1) < 0.14 ? 1 : 0;
  var eating = h.eating ? 1 : 0;
  var role = h.role || 'customer';
  var shirtHex = bbColorToHex(h.shirt, '#3B82F6');
  var hairHex = bbColorToHex(h.hair, '#2B2118');
  var carryProp = h.carryProp || (h.carryBowl ? 'bowl' : (h.carryCoffee ? 'coffee' : 'none'));

  var texKey = ensureHumanBillboardTex(wgl, role, angleKey, stepPhase, seated, blink, eating, shirtHex, hairHex, carryProp);
  var liftY = seated ? 0.24 : 0;
  var flipX = (angleKey === 'side' && rel < 0) ? -1 : 1;

  wgl.setBlend('alpha');
  dm('cyl', 'white', x, y + 0.012, z, 0, 0, 0, 0.44, 0.01, 0.44, { tint: [0.08, 0.07, 0.05, 0.30], emissive: 1.0 });
  wgl.setBlend(null);

  dm('quad', texKey, x, y + liftY + 0.62, z, 0, faceCamYaw, 0, 1.32, 1.32, 1, {
    tint: [1, 1, 1, 1],
    emissive: 1.0,
    us: flipX,
    uo: flipX < 0 ? 1 : 0
  });
}
`;
}
