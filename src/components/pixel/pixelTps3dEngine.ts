/**
 * Engine Góc Nhìn Thứ 3 Nhập Vai 3D Pixel-Art Dùng Chung (TPS Kiểu PUBG — Quyết định 232)
 * Tài liệu gốc: docs/TPS_3D_OPEN_WORLD_SPEC.md
 * - 100% Canvas2D thuần JS, 0 phụ thuộc mạng/WebGL, 60fps trên iOS Fabric WKWebView, Android & Web PWA.
 * - Chiếu phối cảnh 3D thật (Perspective Projection + Near-Plane Clipping) giúp sàn, tường, cửa 2 cánh
 *   xoay bản lề, bàn ghế 3D và nhân vật có chiều sâu chân thực tuyệt đối.
 * - Camera đặt sau lưng & hơi cao trên vai chú Heo, vuốt màn hình xoay tự do 360° (không Joystick ảo).
 * - Chạm điểm trên màn hình bắn tia Raycast 3D xuống mặt sàn Y = 0 (Tap-to-Walk chính xác từng pixel).
 * - Sprite chú Heo Mascot 4 góc nhìn (Sau lưng kiểu PUBG / Nghiêng trái / Nghiêng phải / Chính diện / Ngồi ăn).
 */
export function buildTps3dEngineScript(): string {
  return String.raw`
/* ==================== 1. HỆ CHIẾU PHỐI CẢNH 3D & CAMERA TPS 360° ==================== */
function createTpsCamera(opts) {
  return {
    yaw: (opts && typeof opts.yaw === 'number') ? opts.yaw : 0,
    pitch: (opts && typeof opts.pitch === 'number') ? opts.pitch : -0.34,
    dist: (opts && typeof opts.dist === 'number') ? opts.dist : 3.9,
    targetHeight: (opts && typeof opts.targetHeight === 'number') ? opts.targetHeight : 0.95,
    fovFactor: 0.86,
    pos: { x: 0, y: 2.4, z: -4 },
    F: { x: 0, y: 0, z: 1 },
    R: { x: 1, y: 0, z: 0 },
    U: { x: 0, y: 1, z: 0 },
    vw: 300,
    vh: 460,
    focal: 258
  };
}

function normalizeAngle(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function updateTpsCamera(cam, targetX, targetY, targetZ, vw, vh, bounds) {
  cam.vw = vw;
  cam.vh = vh;
  cam.focal = Math.min(vw, vh) * cam.fovFactor;
  var sy = Math.sin(cam.yaw), cy = Math.cos(cam.yaw);
  var sp = Math.sin(cam.pitch), cp = Math.cos(cam.pitch);
  cam.F.x = sy * cp;
  cam.F.y = sp;
  cam.F.z = cy * cp;
  cam.R.x = cy;
  cam.R.y = 0;
  cam.R.z = -sy;
  cam.U.x = -sy * sp;
  cam.U.y = cp;
  cam.U.z = -cy * sp;

  var tx = targetX, ty = targetY + cam.targetHeight, tz = targetZ;
  var d = cam.dist;
  var px = tx - cam.F.x * d;
  var py = ty - cam.F.y * d;
  var pz = tz - cam.F.z * d;
  if (bounds) {
    if (px < bounds.minX) px = bounds.minX;
    if (px > bounds.maxX) px = bounds.maxX;
    if (pz < bounds.minZ) pz = bounds.minZ;
    if (pz > bounds.maxZ) pz = bounds.maxZ;
    if (py < 0.7) py = 0.7;
    if (py > 4.6) py = 4.6;
  }
  cam.pos.x = px;
  cam.pos.y = py;
  cam.pos.z = pz;
}

function worldToCam(cam, wx, wy, wz) {
  var dx = wx - cam.pos.x;
  var dy = wy - cam.pos.y;
  var dz = wz - cam.pos.z;
  return {
    cx: dx * cam.R.x + dy * cam.R.y + dz * cam.R.z,
    cy: dx * cam.U.x + dy * cam.U.y + dz * cam.U.z,
    cz: dx * cam.F.x + dy * cam.F.y + dz * cam.F.z
  };
}

function projectPoint3D(cam, wx, wy, wz) {
  var p = worldToCam(cam, wx, wy, wz);
  if (p.cz <= 0.18) return null;
  var sc = cam.focal / p.cz;
  return {
    sx: cam.vw * 0.5 + p.cx * sc,
    sy: cam.vh * 0.5 - p.cy * sc,
    cz: p.cz,
    scale: sc
  };
}

function unprojectFloorTap(cam, sx, sy) {
  var nx = (sx - cam.vw * 0.5) / cam.focal;
  var ny = (cam.vh * 0.5 - sy) / cam.focal;
  var dx = cam.F.x + cam.R.x * nx + cam.U.x * ny;
  var dy = cam.F.y + cam.R.y * nx + cam.U.y * ny;
  var dz = cam.F.z + cam.R.z * nx + cam.U.z * ny;
  if (dy >= -0.025) return null;
  var t = -cam.pos.y / dy;
  if (t < 0.2 || t > 34) return null;
  return { x: cam.pos.x + dx * t, z: cam.pos.z + dz * t };
}

/* ==================== 2. DỰNG HÌNH ĐA GIÁC & KHỐI HỘP 3D (NEAR-PLANE CLIPPING) ==================== */
function clipPolyNear(camPts, nearZ) {
  var out = [];
  var n = camPts.length;
  for (var i = 0; i < n; i++) {
    var a = camPts[i];
    var b = camPts[(i + 1) % n];
    var aIn = a.cz >= nearZ;
    var bIn = b.cz >= nearZ;
    if (aIn) out.push(a);
    if (aIn !== bIn) {
      var t = (nearZ - a.cz) / (b.cz - a.cz);
      out.push({
        cx: a.cx + (b.cx - a.cx) * t,
        cy: a.cy + (b.cy - a.cy) * t,
        cz: nearZ
      });
    }
  }
  return out;
}

function drawPoly3D(ctx, cam, worldPts, fillCol, strokeCol, lineW) {
  var cPts = [];
  var allBehind = true;
  for (var i = 0; i < worldPts.length; i++) {
    var wp = worldPts[i];
    var cp = worldToCam(cam, wp[0], wp[1], wp[2]);
    if (cp.cz > 0.22) allBehind = false;
    cPts.push(cp);
  }
  if (allBehind) return;
  var clipped = clipPolyNear(cPts, 0.22);
  if (clipped.length < 3) return;
  ctx.beginPath();
  for (var j = 0; j < clipped.length; j++) {
    var pt = clipped[j];
    var sc = cam.focal / pt.cz;
    var sx = cam.vw * 0.5 + pt.cx * sc;
    var sy = cam.vh * 0.5 - pt.cy * sc;
    if (j === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  if (fillCol) {
    ctx.fillStyle = fillCol;
    ctx.fill();
  }
  if (strokeCol) {
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = lineW || 1;
    ctx.stroke();
  }
}

function drawBox3D(ctx, cam, cx, y0, cz, w, h, d, cols) {
  var x0 = cx - w * 0.5, x1 = cx + w * 0.5;
  var y1 = y0 + h;
  var z0 = cz - d * 0.5, z1 = cz + d * 0.5;
  var cTop = cols.top || '#E2E8F0';
  var cFront = cols.front || '#CBD5E1';
  var cSide = cols.side || '#94A3B8';
  var stroke = cols.stroke || '#2B2118';

  // Vẽ các mặt hướng về phía camera (back-face culling chuẩn 3D)
  if (cam.pos.z < z0) {
    drawPoly3D(ctx, cam, [[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0]], cFront, stroke, 1);
  } else if (cam.pos.z > z1) {
    drawPoly3D(ctx, cam, [[x1,y0,z1],[x0,y0,z1],[x0,y1,z1],[x1,y1,z1]], cFront, stroke, 1);
  }
  if (cam.pos.x < x0) {
    drawPoly3D(ctx, cam, [[x0,y0,z1],[x0,y0,z0],[x0,y1,z0],[x0,y1,z1]], cSide, stroke, 1);
  } else if (cam.pos.x > x1) {
    drawPoly3D(ctx, cam, [[x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0]], cSide, stroke, 1);
  }
  if (cam.pos.y > y1) {
    drawPoly3D(ctx, cam, [[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]], cTop, stroke, 1);
  }
}

/* ==================== 3. CHÚ HEO MASCOT 4 GÓC NHÌN TPS (SAU LƯNG PUBG / NGHIÊNG / CHÍNH DIỆN / NGỒI) ==================== */
function drawPigTps3D(ctx, cam, pig, t) {
  var liftY = pig.seated ? 0.36 : 0;
  var pr = projectPoint3D(cam, pig.x, liftY, pig.z);
  if (!pr) return;
  var unit = Math.max(0.55, Math.min(4.2, pr.scale / 36));
  var px = Math.round(pr.sx);
  var py = Math.round(pr.sy);
  var bounce = pig.walking ? Math.round(Math.abs(Math.sin(t * 11)) * 2.2 * unit) : (pig.eating ? Math.round(Math.abs(Math.sin(t * 7)) * 1.4 * unit) : 0);
  var rel = normalizeAngle(pig.yaw - cam.yaw);
  var absRel = Math.abs(rel);
  var view = absRel < 0.78 ? 'back' : (absRel > 2.32 ? 'front' : (rel > 0 ? 'right' : 'left'));
  var blink = (t % 3.8) < 0.14;
  var step = pig.walking ? Math.round(Math.sin(t * 12) * 1.6 * unit) : 0;

  function prRect(ox, oy, rw, rh, col) {
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(px + ox * unit), Math.round(py + oy * unit - bounce), Math.max(1, Math.round(rw * unit)), Math.max(1, Math.round(rh * unit)));
  }

  // Bóng tiếp xúc dưới sàn
  ctx.save();
  ctx.fillStyle = 'rgba(43,33,24,0.28)';
  ctx.beginPath();
  ctx.ellipse(px, Math.round(py + 1 * unit), Math.max(4, 10 * unit), Math.max(2, 3.6 * unit), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (view === 'back') {
    // GÓC NHÌN SAU LƯNG ĐẶC TRƯNG KIỂU PUBG: 2 tai vểnh, lưng hồng, khe nhét tiền vàng & đuôi xoắn!
    prRect(-7, -4 + step * 0.4, 4, 4, '#2B2118'); prRect(-6, -4 + step * 0.4, 2, 3, '#D96D85');
    prRect(3, -4 - step * 0.4, 4, 4, '#2B2118');  prRect(4, -4 - step * 0.4, 2, 3, '#D96D85');
    // Thân sau tròn bầu bĩnh
    prRect(-10, -17, 20, 14, '#2B2118');
    prRect(-9, -16, 18, 12, '#F596A8');
    prRect(-8, -16, 16, 4, '#FDBAC7'); // Ánh sáng trên lưng
    prRect(-8, -6, 16, 2, '#D96D85');  // Bóng bụng dưới
    // 2 Tai vểnh 2 bên đầu
    prRect(-9, -21, 5, 5, '#2B2118'); prRect(-8, -20, 3, 3, '#F596A8');
    prRect(4, -21, 5, 5, '#2B2118');  prRect(5, -20, 3, 3, '#F596A8');
    // Khe nhét tiền vàng đặc trưng trên đỉnh lưng Heo Đất!
    prRect(-3, -15, 6, 2, '#2B2118');
    prRect(-2, -16, 4, 2, '#F4B93B');
    // Đuôi xoắn lắc lư dễ thương phía sau
    var wag = Math.round(Math.sin(t * 9) * 1.2);
    prRect(-2 + wag, -10, 4, 3, '#2B2118');
    prRect(-1 + wag, -9, 2, 1, '#FDBAC7');
  } else if (view === 'front') {
    // GÓC CHÍNH DIỆN (khi người dùng xoay camera ra trước mặt ngắm chú Heo!)
    prRect(-7, -4 + step * 0.4, 4, 4, '#2B2118'); prRect(-6, -4 + step * 0.4, 2, 3, '#F596A8');
    prRect(3, -4 - step * 0.4, 4, 4, '#2B2118');  prRect(4, -4 - step * 0.4, 2, 3, '#F596A8');
    prRect(-10, -17, 20, 14, '#2B2118');
    prRect(-9, -16, 18, 12, '#F596A8');
    prRect(-8, -16, 16, 4, '#FDBAC7');
    prRect(-9, -21, 5, 5, '#2B2118'); prRect(-8, -20, 3, 3, '#FDBAC7');
    prRect(4, -21, 5, 5, '#2B2118');  prRect(5, -20, 3, 3, '#FDBAC7');
    // Đôi mắt đen chớp chớp
    if (blink) {
      prRect(-6, -12, 3, 1, '#2B2118'); prRect(3, -12, 3, 1, '#2B2118');
    } else {
      prRect(-6, -13, 3, 3, '#2B2118'); prRect(-5, -13, 1, 1, '#FFFFFF');
      prRect(3, -13, 3, 3, '#2B2118');  prRect(4, -13, 1, 1, '#FFFFFF');
    }
    // Mũi hồng 2 lỗ & má hồng
    prRect(-4, -10, 8, 5, '#2B2118'); prRect(-3, -9, 6, 3, '#FBC2CE');
    prRect(-2, -8, 1, 2, '#2B2118');  prRect(1, -8, 1, 2, '#2B2118');
    prRect(-8, -9, 2, 2, '#F472B6');  prRect(6, -9, 2, 2, '#F472B6');
  } else {
    // GÓC NGHIÊNG TRÁI / PHẢI (bám dáng Heo 24×20 chuẩn Tab Vườn!)
    var dir = view === 'right' ? 1 : -1;
    function sr(ox, oy, rw, rh, col) {
      var ax = dir > 0 ? ox : -(ox + rw);
      prRect(ax, oy, rw, rh, col);
    }
    sr(-8, -4 + step * 0.4, 3, 4, '#2B2118'); sr(-7, -4 + step * 0.4, 2, 3, '#D96D85');
    sr(4, -4 - step * 0.4, 3, 4, '#2B2118');  sr(5, -4 - step * 0.4, 2, 3, '#F596A8');
    sr(-11, -16, 21, 13, '#2B2118');
    sr(-10, -15, 19, 11, '#F596A8');
    sr(-9, -15, 17, 3, '#FDBAC7');
    sr(-2, -16, 5, 2, '#F4B93B'); // Khe tiền vàng
    sr(2, -20, 5, 5, '#2B2118'); sr(3, -19, 3, 3, '#FDBAC7'); // Tai
    sr(9, -12, 4, 6, '#2B2118'); sr(10, -11, 2, 4, '#FBC2CE'); // Mõm
    sr(5, -13, 2, blink ? 1 : 3, '#2B2118'); // Mắt
    sr(-13, -11, 3, 3, '#2B2118'); // Đuôi
  }

  // Hiệu ứng đũa & bọt niềm vui khi chú Heo đang ăn phở!
  if (pig.eating) {
    var chY = -12 + Math.round(Math.sin(t * 10) * 1.5);
    prRect(9, chY, 6, 1, '#D97706');
    prRect(9, chY + 2, 6, 1, '#F59E0B');
  }
}

/* ==================== 4. NHÂN VẬT CON NGƯỜI 3D CHI TIẾT (ĐẦU BẾP / PHỤC VỤ / KHÁCH HÀNG) ==================== */
function drawHumanTps3D(ctx, cam, h, t) {
  var liftY = h.seated ? 0.34 : 0;
  var pr = projectPoint3D(cam, h.x, liftY, h.z);
  if (!pr) return;
  var u = Math.max(0.45, Math.min(3.8, pr.scale / 34));
  var px = Math.round(pr.sx);
  var py = Math.round(pr.sy);
  var step = h.moving ? Math.round(Math.sin(t * 10 + (h.phase || 0)) * 2 * u) : 0;
  var rel = normalizeAngle((h.yaw || 0) - cam.yaw);
  var showFace = Math.abs(rel) > 1.25;

  function hr(ox, oy, rw, rh, col) {
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(px + ox * u), Math.round(py + oy * u), Math.max(1, Math.round(rw * u)), Math.max(1, Math.round(rh * u)));
  }

  // Bóng chân
  ctx.save();
  ctx.fillStyle = 'rgba(43,33,24,0.26)';
  ctx.beginPath();
  ctx.ellipse(px, Math.round(py + 1 * u), Math.max(3, 7 * u), Math.max(1.5, 2.5 * u), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Chân / Quần
  if (!h.seated) {
    hr(-4, -9 + step * 0.35, 3, 9, '#1E293B');
    hr(1, -9 - step * 0.35, 3, 9, '#1E293B');
  } else {
    hr(-4, -5, 8, 5, '#1E293B');
  }

  // Thân áo + Tạp dề (Đầu bếp / Phục vụ)
  hr(-6, -21, 12, 13, '#2B2118');
  hr(-5, -20, 10, 11, h.shirt || '#3B82F6');
  if (h.role === 'chef') {
    hr(-4, -19, 8, 10, '#FFFDF7');
    hr(-5, -16, 10, 1, '#94A3B8');
  } else if (h.role === 'waiter') {
    hr(-4, -17, 8, 8, '#B91C1C'); // Tạp dề đỏ nhân viên quán Phở
  }

  // Tay cầm muôi nấu / bưng tô phở
  if (h.role === 'chef') {
    var lad = Math.round(Math.sin(t * 6) * 2);
    hr(5, -17 + lad, 4, 2, '#FCD5B5');
    hr(8, -19 + lad, 2, 7, '#CBD5E1'); // Muôi inox múc nước dùng
  } else if (h.carryBowl) {
    hr(4, -16, 4, 2, '#FCD5B5');
    hr(5, -19, 7, 4, '#FFFDF7'); // Tô phở bưng trên tay
    if (h.carryBowl === 'full') hr(6, -19, 5, 2, '#E6A825');
  }

  // Đầu & Khuôn mặt chi tiết (tóc, mắt, lông mày, miệng)
  hr(-5, -31, 10, 10, '#2B2118');
  hr(-4, -30, 8, 8, '#FFD8B8');
  hr(-4, -31, 8, 3, h.hair || '#2B2118');
  if (h.role === 'chef') {
    // Mũ đầu bếp cao trắng nổi bật
    hr(-5, -37, 10, 6, '#2B2118');
    hr(-4, -36, 8, 5, '#FFFFFF');
  }
  if (showFace) {
    hr(-3, -27, 2, 2, '#2B2118'); hr(1, -27, 2, 2, '#2B2118'); // Đôi mắt
    hr(-3, -25, 1, 1, '#F472B6'); hr(2, -25, 1, 1, '#F472B6'); // Má hồng
    hr(-1, -24, 2, 1, '#A65432'); // Miệng cười
  }
}
`;
}
