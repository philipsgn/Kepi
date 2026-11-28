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
  var d = (opts && typeof opts.dist === 'number') ? opts.dist : 3.9;
  return {
    yaw: (opts && typeof opts.yaw === 'number') ? opts.yaw : 0,
    pitch: (opts && typeof opts.pitch === 'number') ? opts.pitch : -0.34,
    dist: d,
    curDist: d,
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
  // Tự phòng thủ chống truyền thiếu targetY (QĐ 243): đảm bảo vw/vh luôn là số hữu hạn > 0
  if (typeof vh !== 'number' && typeof vw === 'number' && typeof targetZ === 'number') {
    bounds = vh; vh = vw; vw = targetZ; targetZ = targetY; targetY = 0;
  }
  cam.vw = (typeof vw === 'number' && isFinite(vw) && vw > 0) ? vw : (cam.vw || 360);
  cam.vh = (typeof vh === 'number' && isFinite(vh) && vh > 0) ? vh : (cam.vh || 640);
  cam.focal = Math.min(cam.vw, cam.vh) * cam.fovFactor;
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

  // SPRING-ARM RAYCAST 6 MẶT PHẲNG CHỐNG NHÌN XUYÊN TƯỜNG 100% (CHUẨN PUBG / GENSHIN — QĐ 238!)
  var tx = targetX, ty = targetY + cam.targetHeight, tz = targetZ;
  var bx = -cam.F.x, by = -cam.F.y, bz = -cam.F.z;
  var tHit = cam.dist;
  var wallMargin = 0.38; // Lớn hơn nearPlane (0.22m) -> bất khả thi cắt xuyên qua bất kỳ bức tường nào!
  if (bounds) {
    var mnX = bounds.minX + wallMargin, mxX = bounds.maxX - wallMargin;
    var mnZ = bounds.minZ + wallMargin, mxZ = bounds.maxZ - wallMargin;
    var mnY = 0.65, mxY = (typeof bounds.maxY === 'number' ? bounds.maxY : 3.85) - 0.35;
    if (bx < -0.0001) { var t1 = (mnX - tx) / bx; if (t1 >= 0 && t1 < tHit) tHit = t1; }
    else if (bx > 0.0001) { var t2 = (mxX - tx) / bx; if (t2 >= 0 && t2 < tHit) tHit = t2; }
    if (bz < -0.0001) { var t3 = (mnZ - tz) / bz; if (t3 >= 0 && t3 < tHit) tHit = t3; }
    else if (bz > 0.0001) { var t4 = (mxZ - tz) / bz; if (t4 >= 0 && t4 < tHit) tHit = t4; }
    if (by < -0.0001) { var t5 = (mnY - ty) / by; if (t5 >= 0 && t5 < tHit) tHit = t5; }
    else if (by > 0.0001) { var t6 = (mxY - ty) / by; if (t6 >= 0 && t6 < tHit) tHit = t6; }
  }
  var desiredDist = Math.max(0.75, tHit);
  // Co vào tức thì khi chạm tường (0ms không xuyên 1 frame), bung ra êm mượt khi rời xa tường!
  if (desiredDist < cam.curDist) cam.curDist = desiredDist;
  else cam.curDist += (desiredDist - cam.curDist) * 0.18;

  var px = tx + bx * cam.curDist;
  var py = ty + by * cam.curDist;
  var pz = tz + bz * cam.curDist;
  if (bounds) {
    px = Math.max(bounds.minX + wallMargin, Math.min(bounds.maxX - wallMargin, px));
    pz = Math.max(bounds.minZ + wallMargin, Math.min(bounds.maxZ - wallMargin, pz));
    py = Math.max(0.65, Math.min((typeof bounds.maxY === 'number' ? bounds.maxY : 3.85) - 0.35, py));
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

function tpsLerpAngle(a, b, t) {
  var d = normalizeAngle(b - a);
  return normalizeAngle(a + d * Math.max(0, Math.min(1, t)));
}

function bindTpsCanvasGestures(cv, cam, opts) {
  var dragging = false, moved = false, activeId = null;
  var lastX = 0, lastY = 0, startX = 0, startY = 0;
  var activePts = {};
  var pinchStartD = 0, pinchStartDist = 4.85;
  var minPitch = (opts && typeof opts.minPitch === 'number') ? opts.minPitch : -0.56;
  var maxPitch = (opts && typeof opts.maxPitch === 'number') ? opts.maxPitch : -0.10;
  var dragSlop = (opts && typeof opts.dragSlop === 'number') ? opts.dragSlop : 13;

  function getPt(e) {
    if (e.touches && e.touches.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches && e.changedTouches.length) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  }
  function activeKeys() {
    var k = [];
    for (var p in activePts) if (Object.prototype.hasOwnProperty.call(activePts, p)) k.push(p);
    return k;
  }
  function onDown(e) {
    if (typeof e.button === 'number' && e.button !== 0 && e.pointerType === 'mouse') return;
    var pid = (typeof e.pointerId === 'number') ? String(e.pointerId) : '0';
    var pt = getPt(e);
    activePts[pid] = { x: pt.x, y: pt.y };
    var ks = activeKeys();
    if (ks.length >= 2) {
      var p1 = activePts[ks[0]], p2 = activePts[ks[1]];
      pinchStartD = Math.max(20, Math.hypot(p2.x - p1.x, p2.y - p1.y));
      pinchStartDist = Math.max(2.2, Math.min(6.8, cam.dist || 4.85));
      dragging = true; moved = true; activeId = null;
      return;
    }
    dragging = true; moved = false;
    activeId = (typeof e.pointerId === 'number') ? e.pointerId : null;
    lastX = startX = pt.x; lastY = startY = pt.y;
    if (typeof e.pointerId === 'number' && cv.setPointerCapture) {
      try { cv.setPointerCapture(e.pointerId); } catch (_err) {}
    }
  }
  function onMove(e) {
    if (!dragging) return;
    var pid = (typeof e.pointerId === 'number') ? String(e.pointerId) : '0';
    var pt = getPt(e);
    if (activePts[pid]) activePts[pid] = { x: pt.x, y: pt.y };
    var ks = activeKeys();
    if (ks.length >= 2) {
      var p1 = activePts[ks[0]], p2 = activePts[ks[1]];
      var d = Math.max(20, Math.hypot(p2.x - p1.x, p2.y - p1.y));
      cam.dist = Math.max(2.2, Math.min(6.8, pinchStartDist * (pinchStartD / d)));
      cam.lastManualOrbitAt = Date.now();
      moved = true;
      if (e.cancelable) e.preventDefault();
      return;
    }
    if (typeof e.pointerId === 'number' && activeId !== null && e.pointerId !== activeId) return;
    var dx = pt.x - lastX, dy = pt.y - lastY;
    if (Math.hypot(pt.x - startX, pt.y - startY) > dragSlop) moved = true;
    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) cam.lastManualOrbitAt = Date.now();
    cam.yaw -= dx * 0.0085;
    cam.pitch = Math.max(minPitch, Math.min(maxPitch, cam.pitch - dy * 0.0055));
    lastX = pt.x; lastY = pt.y;
    if (e.cancelable) e.preventDefault();
  }
  function onUp(e) {
    var pid = (typeof e.pointerId === 'number') ? String(e.pointerId) : '0';
    delete activePts[pid];
    var ks = activeKeys();
    if (ks.length === 1) {
      var rem = activePts[ks[0]];
      activeId = ks[0] === '0' ? null : Number(ks[0]);
      lastX = rem.x; lastY = rem.y;
      moved = true;
      return;
    }
    if (!dragging) return;
    if (typeof e.pointerId === 'number' && activeId !== null && e.pointerId !== activeId) return;
    if (typeof e.pointerId === 'number' && cv.releasePointerCapture) {
      try { cv.releasePointerCapture(e.pointerId); } catch (_err) {}
    }
    dragging = false;
    activeId = null;
    if (!moved && opts && typeof opts.onTap === 'function') {
      var pt = getPt(e);
      var rect = cv.getBoundingClientRect ? cv.getBoundingClientRect() : null;
      if (!rect || rect.width < 2 || rect.height < 2) return;
      var sz = opts.getSize ? opts.getSize() : { w: cv.width, h: cv.height };
      var sx = ((pt.x - rect.left) / rect.width) * sz.w;
      var sy = ((pt.y - rect.top) / rect.height) * sz.h;
      opts.onTap(sx, sy);
    }
  }
  function onCancel(e) {
    var pid = (typeof e.pointerId === 'number') ? String(e.pointerId) : '0';
    delete activePts[pid];
    if (activeKeys().length === 0) {
      dragging = false; moved = false; activeId = null;
    }
  }
  function onWheel(e) {
    if (typeof e.deltaY !== 'number') return;
    cam.dist = Math.max(2.2, Math.min(6.8, (cam.dist || 4.85) + e.deltaY * 0.0035));
    cam.lastManualOrbitAt = Date.now();
    if (e.cancelable) e.preventDefault();
  }

  var hasPointer = typeof window !== 'undefined' && typeof window.PointerEvent !== 'undefined';
  if (hasPointer) {
    cv.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  } else {
    cv.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchcancel', onCancel);
  }
  cv.addEventListener('wheel', onWheel, { passive: false });
  if (typeof window !== 'undefined') {
    window.addEventListener('blur', function() { activePts = {}; dragging = false; moved = false; activeId = null; });
  }
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
  var isArr = Array.isArray(cols);
  var cTop = isArr ? (cols[0] || '#E2E8F0') : ((cols && cols.top) || '#E2E8F0');
  var cFront = isArr ? (cols[1] || cols[0] || '#CBD5E1') : ((cols && cols.front) || '#CBD5E1');
  var cSide = isArr ? (cols[2] || cols[1] || '#94A3B8') : ((cols && cols.side) || '#94A3B8');
  var stroke = (!isArr && cols && cols.stroke) ? cols.stroke : '#2B2118';

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

function drawLanternGlow3D(ctx, cam, wx, wy, wz, lanternCol, glowCol, radius, topY) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 24) return;
  var r = Math.max(3, Math.min(22, pr.scale * (radius || 0.18)));
  var lw = Math.max(4, Math.round(r * 1.15));
  var lh = Math.max(5, Math.round(r * 1.42));
  ctx.save();
  // Dây treo đen nối thẳng lên xà gỗ/trần nhà (không bao giờ bay lơ lửng!)
  var topPr = projectPoint3D(cam, wx, topY || 3.85, wz);
  if (topPr) {
    ctx.strokeStyle = '#2B180E';
    ctx.lineWidth = Math.max(1, Math.min(2, r * 0.12));
    ctx.beginPath();
    ctx.moveTo(Math.round(topPr.sx), Math.round(topPr.sy));
    ctx.lineTo(Math.round(pr.sx), Math.round(pr.sy - lh * 0.5));
    ctx.stroke();
  }
  // Quầng sáng vàng ấm tỏa ra quanh đèn lồng cổ truyền
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = glowCol || '#FFE49E';
  ctx.beginPath();
  ctx.arc(pr.sx, pr.sy, r * 2.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.96;
  // Thân đèn lồng bo tròn cổ điển có khung nan gỗ & tua rua đỏ
  ctx.fillStyle = '#2B2118';
  ctx.beginPath();
  ctx.ellipse(pr.sx, pr.sy, lw * 0.58, lh * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = lanternCol || '#FFF3C4';
  ctx.beginPath();
  ctx.ellipse(pr.sx, pr.sy, lw * 0.48, lh * 0.46, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nắp gỗ trên dưới & tua rua đỏ
  ctx.fillStyle = '#4A2C1A';
  ctx.fillRect(Math.round(pr.sx - lw * 0.32), Math.round(pr.sy - lh * 0.56), Math.max(2, Math.round(lw * 0.64)), 2);
  ctx.fillRect(Math.round(pr.sx - lw * 0.32), Math.round(pr.sy + lh * 0.48), Math.max(2, Math.round(lw * 0.64)), 2);
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(Math.round(pr.sx - 1), Math.round(pr.sy + lh * 0.52), 2, Math.max(2, Math.round(r * 0.45)));
  ctx.restore();
}

/* ==================== 2B. BỘ SPRITE PIXEL ART XOONG NỒI, NGUYÊN LIỆU & MÓN PHỞ TẢ THỰC (QĐ 234) ==================== */
function drawPhoPotSprite3D(ctx, cam, wx, wy, wz, t, phase) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 22) return;
  var u = Math.max(0.45, Math.min(3.4, pr.scale / 36));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  // Bóng đáy nồi trên mặt bếp
  ctx.fillStyle = 'rgba(30,41,59,0.28)';
  ctx.beginPath(); ctx.ellipse(px, py + 1 * u, 13 * u, 4 * u, 0, 0, Math.PI * 2); ctx.fill();
  // 2 Quai nồi inox cong 2 bên
  ctx.strokeStyle = '#334155'; ctx.lineWidth = Math.max(1.5, 2 * u);
  ctx.beginPath(); ctx.arc(px - 11.5 * u, py - 11 * u, 3 * u, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(px + 11.5 * u, py - 11 * u, 3 * u, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
  // Thân nồi inox hình trụ tròn có ánh kim sáng bóng
  ctx.fillStyle = '#64748B';
  ctx.fillRect(Math.round(px - 11 * u), Math.round(py - 16 * u), Math.round(22 * u), Math.round(16 * u));
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(Math.round(px - 9 * u), Math.round(py - 16 * u), Math.round(7 * u), Math.round(15 * u));
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(Math.round(px - 7 * u), Math.round(py - 16 * u), Math.round(3 * u), Math.round(15 * u));
  ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 1.2;
  ctx.strokeRect(Math.round(px - 11 * u), Math.round(py - 16 * u), Math.round(22 * u), Math.round(16 * u));
  // Miệng nồi bầu dục + Nước dùng ninh xương vàng óng sủi tăm
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath(); ctx.ellipse(px, py - 16 * u, 11.5 * u, 4.2 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#C97A16';
  ctx.beginPath(); ctx.ellipse(px, py - 16 * u, 9.5 * u, 3.1 * u, 0, 0, Math.PI * 2); ctx.fill();
  // Hành củ nướng, hoa hồi & bọt sủi tăm trong nồi nước dùng
  var bub = Math.sin(t * 7 + (phase || 0)) * 1.2 * u;
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath(); ctx.arc(px - 3 * u, py - 16 * u + bub * 0.3, 1.5 * u, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(px + 4 * u, py - 15.5 * u - bub * 0.3, 1.3 * u, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#22C55E';
  ctx.fillRect(Math.round(px - 1 * u), Math.round(py - 17 * u), Math.max(2, Math.round(3 * u)), Math.max(1, Math.round(1.5 * u)));
  // Cán vá múc nước dùng inox thò ra khỏi miệng nồi
  ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = Math.max(1.5, 2.2 * u);
  ctx.beginPath(); ctx.moveTo(px + 3 * u, py - 16 * u); ctx.lineTo(px + 9 * u, py - 24 * u); ctx.stroke();
  // 3 Làn khói nóng nghi ngút bốc lên từ nồi Phở!
  for (var si = 0; si < 3; si++) {
    var st = (t * 0.75 + si * 0.33 + (phase || 0)) % 1;
    ctx.globalAlpha = (1 - st) * 0.55;
    ctx.fillStyle = '#FFFDF7';
    var sx = px + Math.sin(t * 3 + si * 2) * 3.5 * u + (si - 1) * 4 * u;
    var sy = py - (20 + st * 18) * u;
    ctx.beginPath(); ctx.arc(sx, sy, (2.2 + st * 2.5) * u, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawKitchenIngredientsSprite3D(ctx, cam, wx, wy, wz) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 22) return;
  var u = Math.max(0.45, Math.min(3.2, pr.scale / 36));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  // 1. Móc treo 2 miếng thịt bò tái & gầu vân mỡ đỏ hồng bên trái tủ kính
  ctx.strokeStyle = '#475569'; ctx.lineWidth = Math.max(1, 1.2 * u);
  ctx.beginPath(); ctx.moveTo(px - 18 * u, py - 24 * u); ctx.lineTo(px - 18 * u, py - 18 * u); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px - 9 * u, py - 24 * u); ctx.lineTo(px - 9 * u, py - 18 * u); ctx.stroke();
  // Miếng thịt bò tái đỏ tươi + gân mỡ trắng
  ctx.fillStyle = '#B91C1C';
  ctx.beginPath(); ctx.ellipse(px - 18 * u, py - 13 * u, 3.8 * u, 6.2 * u, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FCA5A5';
  ctx.fillRect(Math.round(px - 19 * u), Math.round(py - 15 * u), Math.max(1, Math.round(2 * u)), Math.max(2, Math.round(5 * u)));
  // Miếng thịt gầu bò vàng béo
  ctx.fillStyle = '#991B1B';
  ctx.beginPath(); ctx.ellipse(px - 9 * u, py - 13 * u, 4 * u, 5.8 * u, -0.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(Math.round(px - 11 * u), Math.round(py - 12 * u), Math.max(2, Math.round(4 * u)), Math.max(1, Math.round(2 * u)));
  // 2. Rổ tre đựng Bánh Phở sợi trắng mềm ở giữa
  ctx.fillStyle = '#B47B38';
  ctx.beginPath(); ctx.ellipse(px + 2 * u, py - 3 * u, 7.5 * u, 3.6 * u, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath(); ctx.ellipse(px + 2 * u, py - 5.2 * u, 6.4 * u, 3.2 * u, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px - 2 * u, py - 5 * u); ctx.lineTo(px + 6 * u, py - 5 * u); ctx.stroke();
  // 3. Rổ hành lá & ngò gai xanh mướt bên phải
  ctx.fillStyle = '#A16207';
  ctx.beginPath(); ctx.ellipse(px + 16 * u, py - 3 * u, 6.5 * u, 3.2 * u, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#15803D';
  ctx.beginPath(); ctx.ellipse(px + 16 * u, py - 5.5 * u, 5.8 * u, 3.5 * u, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4ADE80';
  ctx.beginPath(); ctx.arc(px + 14 * u, py - 6.5 * u, 2.2 * u, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(px + 18 * u, py - 6 * u, 2.0 * u, 0, Math.PI * 2); ctx.fill();
  // 4. Thớt gỗ nghiến tròn & dao phay sắt sắc bén phía trước
  ctx.fillStyle = '#92400E';
  ctx.beginPath(); ctx.ellipse(px - 13 * u, py - 1 * u, 6.5 * u, 2.5 * u, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(Math.round(px - 16 * u), Math.round(py - 4 * u), Math.max(3, Math.round(6 * u)), Math.max(2, Math.round(3 * u)));
  ctx.restore();
}

function drawPhoBowlSprite3D(ctx, cam, wx, wy, wz, bState, t, phase) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 20) return;
  var u = Math.max(0.45, Math.min(3.2, pr.scale / 38));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  // Đế bát & thân tô sứ trắng bo cong tròn trịa (không còn cục vuông!)
  ctx.fillStyle = '#CBD5E1';
  ctx.beginPath(); ctx.ellipse(px, py + 0.5 * u, 7.5 * u, 2.5 * u, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(px, py - 3.5 * u, 7.5 * u, 0, Math.PI, false); ctx.fill();
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(px, py - 4 * u, 7.5 * u, 3 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Hoa văn viền lam xanh Bát Tràng quanh miệng tô
  ctx.strokeStyle = '#2563EB'; ctx.lineWidth = Math.max(1, 0.9 * u);
  ctx.beginPath(); ctx.arc(px, py - 3.5 * u, 6.2 * u, 0.25, Math.PI - 0.25, false); ctx.stroke();
  if (bState === 'full') {
    // Nước dùng vàng trong + sợi bánh phở trắng + lát thịt bò tái hồng + hành ngò xanh!
    ctx.fillStyle = '#D98A2B';
    ctx.beginPath(); ctx.ellipse(px, py - 4 * u, 6.2 * u, 2.2 * u, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(Math.round(px - 3.5 * u), Math.round(py - 4.5 * u), Math.max(2, Math.round(5 * u)), Math.max(1, Math.round(1.4 * u)));
    ctx.fillStyle = '#E17A7A'; // Thịt bò tái
    ctx.beginPath(); ctx.ellipse(px - 2 * u, py - 4.2 * u, 2.4 * u, 1.2 * u, 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#16A34A'; // Hành lá & ngò gai xanh
    ctx.beginPath(); ctx.arc(px + 2 * u, py - 4.2 * u, 1.8 * u, 0, Math.PI * 2); ctx.fill();
    // Đôi đũa tre + Muỗng sứ trắng đầy đủ gác trên miệng tô Phở (QĐ 236!)
    ctx.strokeStyle = '#B45309'; ctx.lineWidth = Math.max(1, 1.1 * u);
    ctx.beginPath(); ctx.moveTo(px - 8 * u, py - 6.5 * u); ctx.lineTo(px + 9 * u, py - 3.5 * u); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px - 8 * u, py - 5.2 * u); ctx.lineTo(px + 9 * u, py - 2.3 * u); ctx.stroke();
    // Chiếc muỗng sứ trắng tinh gác bên trái tô
    ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#64748B'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.ellipse(px - 5 * u, py - 4.4 * u, 2.2 * u, 1.3 * u, -0.3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = Math.max(1.2, 1.4 * u);
    ctx.beginPath(); ctx.moveTo(px - 6.5 * u, py - 5 * u); ctx.lineTo(px - 10 * u, py - 8 * u); ctx.stroke();
    // Làn khói nóng bay lên từ tô Phở
    var st = (t * 0.9 + (phase || 0)) % 1;
    ctx.globalAlpha = (1 - st) * 0.55;
    ctx.fillStyle = '#FFFDF7';
    ctx.beginPath(); ctx.arc(px + Math.sin(t * 4) * 2 * u, py - (8 + st * 9) * u, (1.5 + st * 1.5) * u, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawBatTrangTeapotSprite3D(ctx, cam, wx, wy, wz) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 18) return;
  var u = Math.max(0.4, Math.min(2.8, pr.scale / 38));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  // Quai xách vòng cong trên đỉnh ấm trà Bát Tràng (Ảnh 8)
  ctx.strokeStyle = '#475569'; ctx.lineWidth = Math.max(1, 1.3 * u);
  ctx.beginPath(); ctx.arc(px, py - 8.5 * u, 4.2 * u, Math.PI, 0, false); ctx.stroke();
  // Vòi ấm trà cong bên trái
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = Math.max(1.5, 2.2 * u);
  ctx.beginPath(); ctx.moveTo(px - 4.5 * u, py - 3 * u); ctx.lineTo(px - 8 * u, py - 6.5 * u); ctx.stroke();
  // Thân ấm sứ tròn trắng họa tiết men lam xanh Bát Tràng
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(px, py - 4.5 * u, 5.2 * u, 4.8 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1D4ED8';
  ctx.fillRect(Math.round(px - 4.4 * u), Math.round(py - 5.5 * u), Math.max(2, Math.round(8.8 * u)), Math.max(1.5, Math.round(2.4 * u)));
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(Math.round(px - 1.5 * u), Math.round(py - 5 * u), Math.max(1, Math.round(3 * u)), Math.max(1, Math.round(1.2 * u)));
  // Nắp ấm & 1 chén trà nhỏ bên cạnh
  ctx.fillStyle = '#2563EB';
  ctx.beginPath(); ctx.arc(px, py - 9.2 * u, 1.4 * u, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.ellipse(px + 8 * u, py - 1.5 * u, 2.4 * u, 1.8 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawCondimentCaddySprite3D(ctx, cam, wx, wy, wz) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 18) return;
  var u = Math.max(0.4, Math.min(2.8, pr.scale / 38));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  // Chai nước tương đen nắp vàng + Chai tương ớt đỏ nắp xanh + Hũ giấm tỏi ớt ngâm hồng (Ảnh 8)
  ctx.fillStyle = '#2B1508'; ctx.fillRect(Math.round(px - 5 * u), Math.round(py - 11 * u), Math.max(2, Math.round(3.2 * u)), Math.max(4, Math.round(8 * u)));
  ctx.fillStyle = '#FACC15'; ctx.fillRect(Math.round(px - 4.6 * u), Math.round(py - 12.5 * u), Math.max(2, Math.round(2.4 * u)), Math.max(1.5, Math.round(2 * u)));
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(Math.round(px - 1 * u), Math.round(py - 10 * u), Math.max(2, Math.round(3 * u)), Math.max(4, Math.round(7 * u)));
  ctx.fillStyle = '#16A34A'; ctx.fillRect(Math.round(px - 0.6 * u), Math.round(py - 11.5 * u), Math.max(2, Math.round(2.2 * u)), Math.max(1.5, Math.round(1.8 * u)));
  ctx.fillStyle = '#F9A8D4'; ctx.fillRect(Math.round(px + 3 * u), Math.round(py - 7.5 * u), Math.max(2, Math.round(3.8 * u)), Math.max(3, Math.round(5 * u)));
  // Rổ nhựa đỏ đựng gia vị phía trước
  ctx.fillStyle = '#DC2626'; ctx.strokeStyle = '#7F1D1D'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(px + 0.5 * u, py - 2.5 * u, 7.5 * u, 3 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // Ống đựng đũa tre & muỗng inox đầy đủ ngay bên cạnh rổ gia vị (QĐ 236)
  ctx.fillStyle = '#B45309'; ctx.strokeStyle = '#451A03';
  ctx.fillRect(Math.round(px + 9 * u), Math.round(py - 8 * u), Math.max(3, Math.round(5.5 * u)), Math.max(4, Math.round(7.5 * u)));
  ctx.strokeRect(Math.round(px + 9 * u), Math.round(py - 8 * u), Math.max(3, Math.round(5.5 * u)), Math.max(4, Math.round(7.5 * u)));
  ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = Math.max(1, 1.1 * u);
  ctx.beginPath(); ctx.moveTo(px + 10.5 * u, py - 8 * u); ctx.lineTo(px + 10 * u, py - 12.5 * u); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(px + 12.2 * u, py - 8 * u); ctx.lineTo(px + 12.5 * u, py - 12.5 * u); ctx.stroke();
  ctx.fillStyle = '#E2E8F0';
  ctx.beginPath(); ctx.arc(px + 13.8 * u, py - 11.5 * u, 1.3 * u, 0, Math.PI * 2); ctx.fill(); // Đầu muỗng inox
  ctx.restore();
}

function drawQuayAndHerbsSprite3D(ctx, cam, wx, wy, wz) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 18) return;
  var u = Math.max(0.4, Math.min(2.8, pr.scale / 38));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  // Đĩa rau giá xanh + chanh tươi bên trái
  ctx.fillStyle = '#F8FAFC'; ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(px - 6 * u, py - 1 * u, 5.5 * u, 2.2 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#22C55E'; ctx.beginPath(); ctx.arc(px - 7.5 * u, py - 2 * u, 2.3 * u, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#FEF9C3'; ctx.beginPath(); ctx.arc(px - 4 * u, py - 1.8 * u, 1.8 * u, 0, Math.PI * 2); ctx.fill();
  // Đĩa quẩy nóng vàng giòn bên phải
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath(); ctx.ellipse(px + 6 * u, py - 1 * u, 5.5 * u, 2.2 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#C67D2E';
  ctx.fillRect(Math.round(px + 2.5 * u), Math.round(py - 3.2 * u), Math.max(3, Math.round(7 * u)), Math.max(1.5, Math.round(2 * u)));
  ctx.fillStyle = '#E6A14A';
  ctx.fillRect(Math.round(px + 3 * u), Math.round(py - 4.4 * u), Math.max(3, Math.round(6 * u)), Math.max(1.5, Math.round(1.6 * u)));
  ctx.restore();
}

function drawCeilingFan3D(ctx, cam, wx, wy, wz, t, phase) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 24 || pr.cz < 0.6) return;
  var u = Math.max(0.45, Math.min(3.2, pr.scale / 36));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  var topPr = projectPoint3D(cam, wx, wy + 0.42, wz);
  ctx.save();
  // Ty treo quạt trần gắn lên xà gỗ
  if (topPr) {
    ctx.strokeStyle = '#4A2C1A'; ctx.lineWidth = Math.max(1.5, 2.2 * u);
    ctx.beginPath(); ctx.moveTo(topPr.sx, topPr.sy); ctx.lineTo(px, py); ctx.stroke();
  }
  // 3 Cánh quạt trần vintage quay 60fps theo góc nhìn phối cảnh bầu dục
  var baseAng = t * 5.2 + (phase || 0);
  for (var i = 0; i < 3; i++) {
    var a = baseAng + (i * Math.PI * 2) / 3;
    var bx = Math.cos(a) * 24 * u;
    var by = Math.sin(a) * 6.5 * u;
    ctx.strokeStyle = '#5C341D'; ctx.lineWidth = Math.max(2.5, 4.5 * u);
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + bx, py + by); ctx.stroke();
    ctx.strokeStyle = '#D99B26'; ctx.lineWidth = Math.max(1, 1.5 * u);
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + bx * 0.9, py + by * 0.9); ctx.stroke();
  }
  // Bầu động cơ quạt đồng cổ giữa
  ctx.fillStyle = '#8C5418'; ctx.strokeStyle = '#2B180E'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(px, py, 5.5 * u, 2.6 * u, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function drawVintageLamp3D(ctx, cam, wx, wy, wz, topY) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 24 || pr.cz < 0.5) return;
  var u = Math.max(0.42, Math.min(3.0, pr.scale / 36));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  var topPr = projectPoint3D(cam, wx, topY || 3.85, wz);
  ctx.save();
  if (topPr) {
    ctx.strokeStyle = '#2B180E'; ctx.lineWidth = Math.max(1, 1.4 * u);
    ctx.beginPath(); ctx.moveTo(topPr.sx, topPr.sy); ctx.lineTo(px, py - 4 * u); ctx.stroke();
  }
  // Quầng sáng vàng ấm vintage thập niên 90 lan tỏa
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#FFD97D';
  ctx.beginPath(); ctx.arc(px, py + 2 * u, 20 * u, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.98;
  // Bóng đèn sợi đốt vàng ấm bên dưới chao đèn
  ctx.fillStyle = '#FFF9C4';
  ctx.beginPath(); ctx.arc(px, py + 2 * u, 3.5 * u, 0, Math.PI * 2); ctx.fill();
  // Chao đèn chụp men xanh lá cổ điển Sài Gòn 90s viền đồng
  ctx.fillStyle = '#1E5B3A'; ctx.strokeStyle = '#2B180E'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px - 9 * u, py + 1 * u);
  ctx.quadraticCurveTo(px, py - 8 * u, px + 9 * u, py + 1 * u);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.restore();
}

/* ==================== 2C. SPRITE XE CỘ ĐẠI LỘ SÀI GÒN & TÀU THUYỀN SÔNG BẠCH ĐẰNG 60FPS (QĐ 235) ==================== */
function drawRoadVehicleSprite3D(ctx, cam, v) {
  var pr = projectPoint3D(cam, v.x, 0, v.z);
  if (!pr || pr.cz > 55 || pr.cz < 0.8) return;
  var u = Math.max(0.35, Math.min(3.2, pr.scale / 36));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  var d = v.dir || 1;
  ctx.save();
  ctx.translate(px, py);
  if (d < 0) ctx.scale(-1, 1);
  if (v.kind === 'bus') {
    // Xe buýt Sài Gòn xanh-trắng chuẩn Tab Khám phá
    ctx.fillStyle = 'rgba(15,23,42,0.35)'; ctx.fillRect(-30*u, -1*u, 60*u, 3*u);
    ctx.fillStyle = '#1D4ED8'; ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 1;
    ctx.fillRect(-28*u, -24*u, 56*u, 20*u); ctx.strokeRect(-28*u, -24*u, 56*u, 20*u);
    ctx.fillStyle = '#F8FAFC'; ctx.fillRect(-28*u, -13*u, 56*u, 5*u);
    ctx.fillStyle = '#BAE6FD';
    for (var wi = -24; wi <= 16; wi += 10) ctx.fillRect(wi*u, -21*u, 7*u, 6*u);
    ctx.fillStyle = '#111827';
    ctx.beginPath(); ctx.arc(-16*u, -3*u, 4*u, 0, Math.PI*2); ctx.arc(16*u, -3*u, 4*u, 0, Math.PI*2); ctx.fill();
  } else if (v.kind === 'taxi') {
    // Taxi Sài Gòn xanh lá / trắng
    ctx.fillStyle = 'rgba(15,23,42,0.35)'; ctx.fillRect(-20*u, -1*u, 40*u, 3*u);
    ctx.fillStyle = v.col || '#16A34A'; ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 1;
    ctx.fillRect(-18*u, -12*u, 36*u, 9*u); ctx.strokeRect(-18*u, -12*u, 36*u, 9*u);
    ctx.fillRect(-11*u, -19*u, 20*u, 7*u); ctx.strokeRect(-11*u, -19*u, 20*u, 7*u);
    ctx.fillStyle = '#BAE6FD'; ctx.fillRect(-9*u, -17*u, 7*u, 5*u); ctx.fillRect(0*u, -17*u, 7*u, 5*u);
    ctx.fillStyle = '#FACC15'; ctx.fillRect(-3*u, -21*u, 6*u, 2*u);
    ctx.fillStyle = '#111827';
    ctx.beginPath(); ctx.arc(-11*u, -3*u, 3.2*u, 0, Math.PI*2); ctx.arc(11*u, -3*u, 3.2*u, 0, Math.PI*2); ctx.fill();
  } else {
    // Xe máy Việt Nam + người đội mũ bảo hiểm
    ctx.fillStyle = 'rgba(15,23,42,0.32)'; ctx.fillRect(-10*u, -1*u, 20*u, 2.5*u);
    ctx.fillStyle = '#111827';
    ctx.beginPath(); ctx.arc(-6*u, -3*u, 2.8*u, 0, Math.PI*2); ctx.arc(6*u, -3*u, 2.8*u, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = v.col || '#DC2626'; ctx.fillRect(-7*u, -10*u, 14*u, 5*u);
    ctx.fillStyle = '#22C55E'; ctx.fillRect(-3*u, -17*u, 6*u, 7*u); // Áo người lái
    ctx.fillStyle = '#FACC15'; ctx.beginPath(); ctx.arc(0, -19.5*u, 3*u, 0, Math.PI*2); ctx.fill(); // Mũ bảo hiểm
  }
  ctx.restore();
}

function drawRiverBoatSprite3D(ctx, cam, b, t) {
  var pr = projectPoint3D(cam, b.x, 0.1, b.z);
  if (!pr || pr.cz > 85 || pr.cz < 1.2) return;
  var u = Math.max(0.32, Math.min(2.6, pr.scale / 34));
  var bob = Math.sin(t * 3.5 + (b.phase || 0)) * 1.4 * u;
  var px = Math.round(pr.sx), py = Math.round(pr.sy + bob);
  var d = b.dir || 1;
  ctx.save();
  ctx.translate(px, py);
  if (d < 0) ctx.scale(-1, 1);
  // Vệt sóng bọt trắng rẽ nước sông Bạch Đằng
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(-34*u, 0, 56*u, 2.2*u);
  if (b.kind === 'waterbus') {
    // Tàu Saigon Waterbus vàng-trắng-xanh đặc trưng Sông Bạch Đằng!
    ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#1E293B'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-24*u, -8*u); ctx.lineTo(26*u, -8*u); ctx.lineTo(31*u, -2*u); ctx.lineTo(-22*u, 1*u); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#FACC15'; ctx.fillRect(-20*u, -16*u, 38*u, 8*u); ctx.strokeRect(-20*u, -16*u, 38*u, 8*u);
    ctx.fillStyle = '#0284C7';
    for (var wi = -16; wi <= 10; wi += 8) ctx.fillRect(wi*u, -14*u, 5.5*u, 4*u);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(-22*u, -4*u, 48*u, 2*u);
  } else {
    // Thuyền gỗ / Tàu du lịch sông Sài Gòn
    ctx.fillStyle = '#7C4F2B'; ctx.strokeStyle = '#2B180E'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-18*u, -6*u); ctx.lineTo(20*u, -6*u); ctx.lineTo(24*u, 0); ctx.lineTo(-16*u, 1*u); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#F5EAD3'; ctx.fillRect(-10*u, -13*u, 20*u, 7*u);
    ctx.fillStyle = '#DC2626'; ctx.fillRect(-12*u, -15*u, 24*u, 2.5*u);
  }
  ctx.restore();
}

/* ==================== 3. CHÚ HEO MASCOT BO TRÒN 4 GÓC NHÌN TPS (1:1 TAB VƯỜN — QĐ 233) ==================== */
function drawPigTps3D(ctx, cam, pig, t) {
  var liftY = pig.seated ? 0.42 : 0;
  var pr = projectPoint3D(cam, pig.x, liftY, pig.z);
  if (!pr) return;
  var unit = Math.max(0.55, Math.min(4.0, pr.scale / 36));
  var px = Math.round(pr.sx);
  var py = Math.round(pr.sy);
  var bounce = pig.walking ? Math.round(Math.abs(Math.sin(t * 11)) * 2.1 * unit) : (pig.eating ? Math.round(Math.abs(Math.sin(t * 7)) * 1.4 * unit) : 0);
  var rel = normalizeAngle(pig.yaw - cam.yaw);
  var absRel = Math.abs(rel);
  var view = absRel < 0.78 ? 'back' : (absRel > 2.32 ? 'front' : (rel > 0 ? 'right' : 'left'));
  var blink = (t % 3.8) < 0.14;
  var step = pig.walking ? Math.round(Math.sin(t * 12) * 1.5 * unit) : 0;

  function prRect(ox, oy, rw, rh, col) {
    ctx.fillStyle = col;
    ctx.fillRect(Math.round(px + ox * unit), Math.round(py + oy * unit - bounce), Math.max(1, Math.round(rw * unit)), Math.max(1, Math.round(rh * unit)));
  }

  // Bóng tiếp xúc dưới sàn
  ctx.save();
  ctx.fillStyle = 'rgba(43,33,24,0.28)';
  ctx.beginPath();
  ctx.ellipse(px, Math.round(py + 1 * unit), Math.max(4, 9.5 * unit), Math.max(2, 3.4 * unit), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (view === 'back') {
    // GÓC SAU LƯNG BO TRÒN BẦU BĨNH KIỂU PUBG (1:1 Bảng màu Heo Con Tab Vườn!)
    prRect(-6, -4 + step * 0.4, 4, 4, '#2B2118'); prRect(-5, -4 + step * 0.4, 2, 3, '#D96D85');
    prRect(2, -4 - step * 0.4, 4, 4, '#2B2118');  prRect(3, -4 - step * 0.4, 2, 3, '#D96D85');
    // Thân tròn bo góc 4 cạnh (không vuông cứng!)
    prRect(-8, -18, 16, 15, '#2B2118');
    prRect(-10, -16, 20, 11, '#2B2118');
    prRect(-7, -17, 14, 13, '#F596A8');
    prRect(-9, -15, 18, 9, '#F596A8');
    prRect(-7, -17, 14, 4, '#FDBAC7'); // Vệt sáng hồng phấn đỉnh lưng
    prRect(-7, -6, 14, 2, '#D96D85');  // Bóng tròn dưới bụng
    // 2 Tai vểnh bo tròn dễ thương
    prRect(-8, -22, 4, 5, '#2B2118'); prRect(-7, -21, 2, 3, '#F596A8');
    prRect(4, -22, 4, 5, '#2B2118');  prRect(5, -21, 2, 3, '#F596A8');
    // Khe nhét tiền xu vàng lấp lánh trên lưng Heo Đất
    prRect(-3, -16, 6, 2, '#2B2118');
    prRect(-2, -16, 4, 1, '#F4B93B');
    // Đuôi xoắn cong lắc lư cực yêu
    var wag = Math.round(Math.sin(t * 9) * 1.2);
    prRect(-2 + wag, -11, 4, 3, '#2B2118');
    prRect(-1 + wag, -10, 2, 1, '#FDBAC7');
  } else if (view === 'front') {
    // GÓC CHÍNH DIỆN BO TRÒN DỄ THƯƠNG 1:1 TAB VƯỜN
    prRect(-6, -4 + step * 0.4, 4, 4, '#2B2118'); prRect(-5, -4 + step * 0.4, 2, 3, '#F596A8');
    prRect(2, -4 - step * 0.4, 4, 4, '#2B2118');  prRect(3, -4 - step * 0.4, 2, 3, '#F596A8');
    prRect(-8, -18, 16, 15, '#2B2118');
    prRect(-10, -16, 20, 11, '#2B2118');
    prRect(-7, -17, 14, 13, '#F596A8');
    prRect(-9, -15, 18, 9, '#F596A8');
    prRect(-7, -17, 14, 4, '#FDBAC7');
    prRect(-8, -22, 4, 5, '#2B2118'); prRect(-7, -21, 2, 3, '#FDBAC7');
    prRect(4, -22, 4, 5, '#2B2118');  prRect(5, -21, 2, 3, '#FDBAC7');
    // Đôi mắt đen long lanh chớp chớp
    if (blink) {
      prRect(-6, -12, 3, 1, '#2B2118'); prRect(3, -12, 3, 1, '#2B2118');
    } else {
      prRect(-6, -14, 3, 3, '#2B2118'); prRect(-5, -14, 1, 1, '#FFFFFF');
      prRect(3, -14, 3, 3, '#2B2118');  prRect(4, -14, 1, 1, '#FFFFFF');
    }
    // Mũi hồng bầu 2 lỗ & má ửng hồng
    prRect(-4, -11, 8, 5, '#2B2118'); prRect(-3, -10, 6, 3, '#FBC2CE');
    prRect(-2, -9, 1, 2, '#2B2118');  prRect(1, -9, 1, 2, '#2B2118');
    prRect(-8, -10, 2, 2, '#F472B6'); prRect(6, -10, 2, 2, '#F472B6');
  } else {
    // GÓC NGHIÊNG TRÁI / PHẢI BO TRÒN 1:1 TAB VƯỜN
    var dir = view === 'right' ? 1 : -1;
    function sr(ox, oy, rw, rh, col) {
      var ax = dir > 0 ? ox : -(ox + rw);
      prRect(ax, oy, rw, rh, col);
    }
    sr(-7, -4 + step * 0.4, 3, 4, '#2B2118'); sr(-6, -4 + step * 0.4, 2, 3, '#D96D85');
    sr(4, -4 - step * 0.4, 3, 4, '#2B2118');  sr(5, -4 - step * 0.4, 2, 3, '#F596A8');
    sr(-9, -17, 17, 14, '#2B2118');
    sr(-11, -15, 21, 10, '#2B2118');
    sr(-8, -16, 15, 12, '#F596A8');
    sr(-10, -14, 19, 8, '#F596A8');
    sr(-8, -16, 15, 3, '#FDBAC7');
    sr(-2, -17, 5, 2, '#F4B93B'); // Khe tiền vàng
    sr(2, -21, 4, 5, '#2B2118'); sr(3, -20, 2, 3, '#FDBAC7'); // Tai bo tròn
    sr(9, -12, 4, 5, '#2B2118'); sr(10, -11, 2, 3, '#FBC2CE'); // Mõm
    sr(5, -13, 2, blink ? 1 : 3, '#2B2118'); // Mắt
    sr(-13, -12, 3, 3, '#2B2118'); // Đuôi xoắn
  }

  // Đũa tre khi chú Heo đang ăn Phở xì xụp!
  if (pig.eating) {
    var chY = -12 + Math.round(Math.sin(t * 10) * 1.5);
    prRect(9, chY, 6, 1, '#D97706');
    prRect(9, chY + 2, 6, 1, '#F59E0B');
  }
  // Kính tròn trí thức dành riêng cho Heo AI ngồi bàn cà phê (1:1 chú Heo toàn App — QĐ 242)
  if (pig.isAiCoach && view === 'front') {
    prRect(-6, -15, 5, 4, '#2B2118'); prRect(-5, -14, 3, 2, '#E0F2FE');
    prRect(1, -15, 5, 4, '#2B2118');  prRect(2, -14, 3, 2, '#E0F2FE');
    prRect(-1, -14, 2, 1, '#2B2118');
  }
}

/* ==================== 3B. SPRITE ĐỒ UỐNG & BÁNH QUÁN CÀ PHÊ VIỆT NAM TẢ THỰC (QĐ 242) ==================== */
function drawCoconutCoffeeSprite3D(ctx, cam, wx, wy, wz) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 16 || pr.cz < 0.4) return;
  var u = Math.max(0.42, Math.min(2.6, pr.scale / 40));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  // Bóng đế ly thủy tinh
  ctx.fillStyle = 'rgba(43,33,24,0.28)';
  ctx.beginPath(); ctx.ellipse(px, py + 1*u, 4.5*u, 1.6*u, 0, 0, Math.PI*2); ctx.fill();
  // Thân ly thủy tinh cao chứa Cà Phê Cốt Dừa (lớp sữa dừa kem + dòng cà phê nâu)
  ctx.fillStyle = '#F5E6D3'; ctx.strokeStyle = '#3F2E22'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px - 4.2*u, py - 10*u); ctx.lineTo(px + 4.2*u, py - 10*u); ctx.lineTo(px + 3.2*u, py); ctx.lineTo(px - 3.2*u, py); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#9A5B2F';
  ctx.fillRect(px - 3.4*u, py - 9.5*u, 6.8*u, 3.2*u); // Lớp cà phê phin rưới trên
  // Tem CỘNG xanh-đỏ đặc trưng giữa thân ly
  ctx.fillStyle = '#3F5A36'; ctx.fillRect(px - 2*u, py - 5.5*u, 4*u, 1.2*u);
  ctx.fillStyle = '#B91C1C'; ctx.fillRect(px - 2*u, py - 4.2*u, 4*u, 1.0*u);
  // Chóp kem tuyết cốt dừa trắng muốt bồng bềnh!
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#D6D3D1'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(px, py - 11.2*u, 4.1*u, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(px - 0.5*u, py - 14.2*u, 2.4*u, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawEnamelMugCoffeeSprite3D(ctx, cam, wx, wy, wz, t) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 16 || pr.cz < 0.4) return;
  var u = Math.max(0.42, Math.min(2.6, pr.scale / 40));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  // Đĩa lót gốm mộc nâu kem
  ctx.fillStyle = '#D6C7B2'; ctx.strokeStyle = '#4A3B2C'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.ellipse(px, py + 0.5*u, 6.2*u, 2.2*u, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // Ca men sắt xanh lính (xanh cốm trầm) cổ điển thời bao cấp!
  ctx.fillStyle = '#6B7B59'; ctx.strokeStyle = '#2B3522'; ctx.lineWidth = 1;
  ctx.fillRect(px - 4.2*u, py - 7.5*u, 8.4*u, 7.5*u); ctx.strokeRect(px - 4.2*u, py - 7.5*u, 8.4*u, 7.5*u);
  // Quai ca men bên phải
  ctx.strokeStyle = '#556544'; ctx.lineWidth = Math.max(1.2, 1.5*u);
  ctx.beginPath(); ctx.arc(px + 4.4*u, py - 3.8*u, 2.2*u, -Math.PI/2, Math.PI/2); ctx.stroke();
  // Miệng ca viền trắng + nước cà phê đen sánh
  ctx.fillStyle = '#FFFBF1';
  ctx.beginPath(); ctx.ellipse(px, py - 7.5*u, 4.3*u, 1.4*u, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#3B1E0F';
  ctx.beginPath(); ctx.ellipse(px, py - 7.5*u, 3.4*u, 1.0*u, 0, 0, Math.PI*2); ctx.fill();
  // Làn khói cà phê phin nóng bay lên nhẹ nhàng
  var st = ((t || 0) * 1.4) % 1;
  ctx.strokeStyle = 'rgba(255,250,235,' + (0.65 * (1 - st)).toFixed(2) + ')';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px, py - 9*u - st*4*u); ctx.lineTo(px + Math.sin((t||0)*3)*1.5*u, py - 13*u - st*4*u); ctx.stroke();
  ctx.restore();
}

function drawCroissantPlateSprite3D(ctx, cam, wx, wy, wz) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 16 || pr.cz < 0.4) return;
  var u = Math.max(0.42, Math.min(2.6, pr.scale / 40));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  // Đĩa sứ hoa văn xanh cổ điển
  ctx.fillStyle = '#F8FAFC'; ctx.strokeStyle = '#1E3A8A'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(px, py, 8.2*u, 3.2*u, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  // Bánh Sừng Bò (Croissant) vàng ruộm cong nhiều khía bơ
  ctx.fillStyle = '#D97706'; ctx.strokeStyle = '#78350F'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.ellipse(px - 0.5*u, py - 2.2*u, 6.2*u, 2.8*u, -0.1, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath(); ctx.ellipse(px - 0.5*u, py - 2.7*u, 4.2*u, 1.7*u, -0.1, 0, Math.PI*2); ctx.fill();
  // Chén inox sữa đặc chấm bên cạnh!
  ctx.fillStyle = '#CBD5E1'; ctx.strokeStyle = '#475569'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.ellipse(px + 5.8*u, py + 1.2*u, 2.6*u, 1.4*u, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#FEF3C7';
  ctx.beginPath(); ctx.ellipse(px + 5.8*u, py + 0.8*u, 1.9*u, 0.9*u, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/* ==================== 4. NHÂN VẬT CON NGƯỜI 3D CHI TIẾT (ĐẦU BẾP / PHỤC VỤ / KHÁCH HÀNG) ==================== */
function drawHumanTps3D(ctx, cam, h, t) {
  var liftY = (h.y || 0) + (h.seated ? 0.34 : 0);
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

  // Thân áo + Tạp dề cổ điển đẹp mắt (Đầu bếp / Phục vụ / Barista Xanh Lính — QĐ 236 & QĐ 242)
  var isAnyChef = h.role === 'chef' || h.role === 'chef_butcher' || h.role === 'chef_noodle';
  var isBarista = h.role === 'barista' || h.role === 'cafe_waiter';
  var shirtCol = isBarista ? '#4A5D36' :
    (h.role === 'adidas_staff' ? '#111827' :
    (h.role === 'monk' ? '#B45309' :
    (h.role === 'worshipper' ? '#64748B' :
    (h.role === 'vn_player' || h.role === 'vn_captain' ? '#DC2626' :
    (h.role === 'vn_coach' ? '#1E3A8A' :
    (h.role === 'away_player' ? '#2563EB' :
    (h.role === 'gk' ? '#16A34A' :
    (h.role === 'referee' ? '#0F172A' : (h.shirt || '#3B82F6')))))))));
  hr(-6, -21, 12, 13, '#2B2118');
  hr(-5, -20, 10, 11, shirtCol);
  if (h.role === 'adidas_staff') { hr(-5, -20, 1, 8, '#FFFFFF'); hr(4, -20, 1, 8, '#FFFFFF'); }
  else if (h.role === 'vn_player' || h.role === 'vn_captain') { hr(-2, -17, 4, 3, '#FFFF00'); }
  else if (h.role === 'monk') { hr(-5, -20, 5, 11, '#D97706'); }
  if (isAnyChef) {
    hr(-4, -19, 8, 10, '#FFFDF7');
    hr(-5, -16, 10, 1, '#94A3B8');
    hr(-3, -18, 2, 1, '#DC2626'); // Nút áo bếp truyền thống
  } else if (h.role === 'waiter') {
    // Tạp dề vintage nâu-đỏ đẹp mắt có dây đeo cổ, nơ thắt eo & túi trước!
    hr(-3, -20, 1, 3, '#7F1D1D'); hr(2, -20, 1, 3, '#7F1D1D'); // 2 Dây đeo cổ tạp dề
    hr(-4, -17, 8, 9, '#991B1B'); // Thân tạp dề đỏ đô cổ điển
    hr(-5, -14, 10, 1, '#FACC15'); // Dây thắt eo chỉ vàng
    hr(-3, -12, 6, 3, '#7F1D1D');  // Túi tạp dề trước bụng
  } else if (isBarista) {
    // Đồng phục Barista Cộng Cà Phê: Áo xanh bộ đội + biểu tượng vạch đỏ ngôi sao vàng giữa ngực + tạp dề xanh rêu!
    hr(-2, -18, 4, 2, '#DC2626'); // Dải đỏ biểu tượng trước ngực
    hr(-1, -18, 2, 2, '#FACC15'); // Ngôi sao vàng giữa ngực
    hr(-4, -13, 8, 5, '#364627'); // Tạp dề xanh lính thắt eo
    hr(-5, -13, 10, 1, '#26331B');
  }

  // Tay cầm muôi nấu / dao thái thịt / vợt trụng phở / pha chế cà phê / bưng khay
  if (h.role === 'chef') {
    var lad = Math.round(Math.sin(t * 6) * 2);
    hr(5, -17 + lad, 4, 2, '#FCD5B5');
    hr(8, -19 + lad, 2, 7, '#CBD5E1'); // Muôi inox múc nước dùng
  } else if (h.role === 'chef_butcher') {
    var chop = Math.round(Math.abs(Math.sin(t * 8)) * 3);
    hr(5, -18 - chop, 4, 2, '#FCD5B5');
    hr(8, -21 - chop, 4, 4, '#E2E8F0'); // Dao phay thái thịt bò tươi sống!
  } else if (h.role === 'chef_noodle') {
    var dip = Math.round(Math.sin(t * 5 + 1) * 2.5);
    hr(5, -17 + dip, 4, 2, '#FCD5B5');
    hr(8, -19 + dip, 3, 6, '#D98A36'); // Vợt tre trụng bánh phở!
  } else if (h.role === 'barista') {
    var brew = Math.round(Math.sin(t * 5 + (h.phase || 0)) * 2);
    hr(5, -17 + brew, 4, 2, '#FCD5B5');
    hr(8, -20 + brew, 4, 5, '#94A3B8'); // Phin cà phê / bình lắc cốt dừa
  } else if (h.carryCoffee) {
    hr(4, -16, 4, 2, '#FCD5B5');
    hr(5, -18, 8, 2, '#5C341D'); // Khay gỗ bưng Cà Phê Cốt Dừa
    hr(7, -22, 3, 4, '#FFFFFF');
  } else if (h.carryBowl) {
    hr(4, -16, 4, 2, '#FCD5B5');
    hr(5, -19, 7, 4, '#FFFDF7'); // Tô phở bưng trên tay
    if (h.carryBowl === 'full') hr(6, -19, 5, 2, '#E6A825');
  }

  // Đầu & Khuôn mặt chi tiết (tóc, mắt, lông mày, miệng)
  hr(-5, -31, 10, 10, '#2B2118');
  hr(-4, -30, 8, 8, '#FFD8B8');
  if (h.role !== 'monk') hr(-4, -31, 8, 3, h.hair || '#2B2118');
  if (isAnyChef) {
    // Mũ đầu bếp cao trắng nổi bật
    hr(-5, -37, 10, 6, '#2B2118');
    hr(-4, -36, 8, 5, '#FFFFFF');
  } else if (isBarista) {
    // Mũ vải xanh bộ đội đồng phục Cộng Cà Phê (1:1 ảnh mẫu!)
    hr(-5, -34, 10, 4, '#2B2118');
    hr(-4, -33, 8, 3, '#556B3E');
    hr(-4, -31, 9, 1, '#3B4D2B');
  }
  if (showFace) {
    hr(-3, -27, 2, 2, '#2B2118'); hr(1, -27, 2, 2, '#2B2118'); // Đôi mắt
    hr(-3, -25, 1, 1, '#F472B6'); hr(2, -25, 1, 1, '#F472B6'); // Má hồng
    hr(-1, -24, 2, 1, '#A65432'); // Miệng cười
  }
}
`;
}
