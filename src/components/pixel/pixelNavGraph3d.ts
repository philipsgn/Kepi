/**
 * Hệ Dẫn Đường Đồ Thị Không Gian Liên Hoàn 3D Dùng Chung (SpatialNavGraph — Quyết định 248–250)
 * Tài liệu gốc: docs/TPS_3D_OPEN_WORLD_SPEC.md (§7.4)
 * - Hợp nhất toàn bộ phòng, tầng, hành lang, cầu thang & đường dốc vào 1 thế giới 3D liên thông.
 * - rayRampQuad: bắn tia 3D trực tiếp lên mặt dốc/bậc thang để chạm bậc nào đi tới đúng bậc đó.
 * - planNavGraphRealtimePath: tìm đường ngắn nhất qua các cổng/cầu thang (step từng bậc liên tục, 0% nhảy cóc)
 *   kèm Seated Pig Auto-Stand (chạm sàn/vật thể khi đang ngồi lập tức đứng dậy đi tiếp, 0% soft-lock).
 */
export function buildPixelNavGraph3dScript(): string {
  return String.raw`
/* ==================== 1. RAYCAST MẶT DỐC / BẬC CẦU THANG (rayRampQuad) ==================== */
function rayRampQuad(ox, oy, oz, dx, dy, dz, ramp) {
  var axis = ramp.axis || 'z';
  var minX = ramp.minX, maxX = ramp.maxX, minZ = ramp.minZ, maxZ = ramp.maxZ;
  var y0 = ramp.yStart, y1 = ramp.yEnd;
  var denom, num, t, hx, hy, hz;

  if (axis === 'z') {
    var z0 = ramp.zStart, z1 = ramp.zEnd;
    var slopeZ = (y1 - y0) / ((z1 - z0) || 1);
    denom = dy - slopeZ * dz;
    if (Math.abs(denom) < 0.0005) return null;
    num = (y0 + slopeZ * (oz - z0)) - oy;
    t = num / denom;
    if (t < 0.25 || t > 32) return null;
    hx = ox + dx * t; hy = oy + dy * t; hz = oz + dz * t;
    var loZ = Math.min(z0, z1) - 0.05, hiZ = Math.max(z0, z1) + 0.05;
    if (hx < minX || hx > maxX || hz < loZ || hz > hiZ) return null;
    var pz = Math.max(0, Math.min(1, (hz - z0) / ((z1 - z0) || 1)));
    return { t: t, x: hx, y: y0 + pz * (y1 - y0), z: hz };
  } else {
    var x0 = ramp.xStart, x1 = ramp.xEnd;
    var slopeX = (y1 - y0) / ((x1 - x0) || 1);
    denom = dy - slopeX * dx;
    if (Math.abs(denom) < 0.0005) return null;
    num = (y0 + slopeX * (ox - x0)) - oy;
    t = num / denom;
    if (t < 0.25 || t > 32) return null;
    hx = ox + dx * t; hy = oy + dy * t; hz = oz + dz * t;
    var loX = Math.min(x0, x1) - 0.05, hiX = Math.max(x0, x1) + 0.05;
    if (hz < minZ || hz > maxZ || hx < loX || hx > hiX) return null;
    var px = Math.max(0, Math.min(1, (hx - x0) / ((x1 - x0) || 1)));
    return { t: t, x: hx, y: y0 + px * (y1 - y0), z: hz };
  }
}

/* ==================== 2. CAO ĐỘ SÀN LIÊN TỤC & TÌM VÙNG HIỆN TẠI ==================== */
function getNavGraphSurfaceY(graph, x, z, curY) {
  if (graph && graph.ramps) {
    for (var ri = 0; ri < graph.ramps.length; ri++) {
      var r = graph.ramps[ri];
      var inX = x >= r.minX && x <= r.maxX;
      var loZ = r.axis === 'z' ? Math.min(r.zStart, r.zEnd) : r.minZ;
      var hiZ = r.axis === 'z' ? Math.max(r.zStart, r.zEnd) : r.maxZ;
      var loX = r.axis === 'x' ? Math.min(r.xStart, r.xEnd) : r.minX;
      var hiX = r.axis === 'x' ? Math.max(r.xStart, r.xEnd) : r.maxX;
      if (x >= loX && x <= hiX && z >= loZ && z <= hiZ && inX) {
        if (typeof r.minCurY === 'number' && curY < r.minCurY) continue;
        if (typeof r.maxCurY === 'number' && curY > r.maxCurY) continue;
        var pr = r.axis === 'z'
          ? (z - r.zStart) / ((r.zEnd - r.zStart) || 1)
          : (x - r.xStart) / ((r.xEnd - r.xStart) || 1);
        pr = Math.max(0, Math.min(1, pr));
        return r.yStart + pr * (r.yEnd - r.yStart);
      }
    }
  }
  if (graph && graph.zones) {
    var bestY = curY || 0, bestScore = 9999;
    for (var zi = 0; zi < graph.zones.length; zi++) {
      var zn = graph.zones[zi];
      if (x >= zn.minX - 0.15 && x <= zn.maxX + 0.15 && z >= zn.minZ - 0.15 && z <= zn.maxZ + 0.15) {
        var dy = Math.abs((curY || 0) - zn.floorY);
        if (dy < bestScore) { bestScore = dy; bestY = zn.floorY; }
      }
    }
    return bestY;
  }
  return curY || 0;
}

function findNavZoneAt(graph, x, z, floorY) {
  if (!graph || !graph.zones || !graph.zones.length) return null;
  var best = null, bestD = 99999;
  for (var i = 0; i < graph.zones.length; i++) {
    var zn = graph.zones[i];
    if (typeof floorY === 'number' && Math.abs(zn.floorY - floorY) > 1.35) continue;
    var dx = x < zn.minX ? zn.minX - x : (x > zn.maxX ? x - zn.maxX : 0);
    var dz = z < zn.minZ ? zn.minZ - z : (z > zn.maxZ ? z - zn.maxZ : 0);
    var d = Math.hypot(dx, dz);
    if (d < bestD) { bestD = d; best = zn; }
  }
  return best;
}

/* ==================== 3. ĐỒ THỊ BFS ĐI BỘ LIÊN HOÀN QUA CỔNG & CẦU THANG ==================== */
function planNavGraphRealtimePath(graph, st, tx, targetFloorY, tz, extraOpts) {
  var p = st.pig;
  // Quy tắc Seated Pig Auto-Stand (QĐ 250): chạm sàn/ghế/vật thể khi đang ngồi lập tức đứng dậy!
  p.seated = false;
  p.seatChairId = -1;
  if ('seatRef' in p) p.seatRef = null;
  p.eating = false;
  var eo = extraOpts || {};
  p.pendingSeatId = typeof eo.seatChairId === 'number' ? eo.seatChairId : -1;
  p.pendingAction = eo.pendingAction || null;

  var destZone = findNavZoneAt(graph, tx, tz, targetFloorY);
  if (destZone) {
    tx = Math.max(destZone.minX + 0.34, Math.min(destZone.maxX - 0.34, tx));
    tz = Math.max(destZone.minZ + 0.34, Math.min(destZone.maxZ - 0.34, tz));
    targetFloorY = destZone.floorY;
  }

  var srcZone = findNavZoneAt(graph, p.x, p.z, p.y || 0);
  var wps = [];

  if (srcZone && destZone && srcZone.id !== destZone.id && graph.edges) {
    // BFS ngắn nhất tìm chuỗi cổng/cầu thang vật lý nối liền giữa srcZone và destZone
    var queue = [[srcZone.id]];
    var visited = {};
    visited[srcZone.id] = true;
    var foundChain = null;
    while (queue.length > 0) {
      var chain = queue.shift();
      var curId = chain[chain.length - 1];
      if (curId === destZone.id) { foundChain = chain; break; }
      for (var ei = 0; ei < graph.edges.length; ei++) {
        var ed = graph.edges[ei];
        var nextId = ed.from === curId ? ed.to : (ed.to === curId ? ed.from : null);
        if (nextId && !visited[nextId]) {
          visited[nextId] = true;
          queue.push(chain.concat([nextId]));
        }
      }
    }
    if (foundChain && foundChain.length > 1) {
      for (var k = 0; k < foundChain.length - 1; k++) {
        var aId = foundChain[k], bId = foundChain[k + 1];
        for (var e2 = 0; e2 < graph.edges.length; e2++) {
          var edge = graph.edges[e2];
          if (edge.from === aId && edge.to === bId && edge.waypointsForward) {
            for (var wf = 0; wf < edge.waypointsForward.length; wf++) wps.push(edge.waypointsForward[wf]);
            break;
          }
          if (edge.to === aId && edge.from === bId) {
            var rev = edge.waypointsBackward || (edge.waypointsForward ? edge.waypointsForward.slice().reverse() : []);
            for (var wb = 0; wb < rev.length; wb++) wps.push(rev[wb]);
            break;
          }
        }
      }
    }
  }

  wps.push({ x: tx, y: targetFloorY, z: tz });
  p.waypoints = wps;
  p.targetX = wps[0].x;
  p.targetZ = wps[0].z;
  if ('tx' in p) p.tx = wps[0].x;
  if ('tz' in p) p.tz = wps[0].z;
  p.walking = true;
  p._stuckTimer = 0;
}

/* ==================== 4. CHUẨN HÓA DI CHUYỂN TRƯỢT CẠNH & CHỐNG KẸT NHƯ QUÁN PHỞ (QĐ 258) ==================== */
function pushPointOutOfBoxes(x, z, boxes, pad) {
  var px = x, pz = z, m = (typeof pad === 'number') ? pad : 0.06;
  if (!boxes || !boxes.length) return { x: px, z: pz };
  for (var i = 0; i < boxes.length; i++) {
    var b = boxes[i];
    if (px >= b.x1 && px <= b.x2 && pz >= b.z1 && pz <= b.z2) {
      var dl = px - b.x1, dr = b.x2 - px, df = pz - b.z1, db = b.z2 - pz;
      var mn = Math.min(dl, dr, df, db);
      if (mn === dl) px = b.x1 - m;
      else if (mn === dr) px = b.x2 + m;
      else if (mn === df) pz = b.z1 - m;
      else pz = b.z2 + m;
    }
  }
  return { x: px, z: pz };
}

function slidePigStep(p, wx, wz, speed, dt, clampFn) {
  var dx = wx - p.x, dz = wz - p.z;
  var dist = Math.hypot(dx, dz);
  if (dist < 0.001) return { x: p.x, z: p.z, dist: dist, moved: 0 };
  var step = Math.min(dist, speed * dt);
  var ux = dx / dist, uz = dz / dist;
  var best = clampFn(p.x + ux * step, p.z + uz * step);
  var bestMoved = Math.hypot(best.x - p.x, best.z - p.z);

  // Sliding collision khi va mép AABB: thử trượt dọc X hoặc Z để đi mượt như Quán Phở
  if (bestMoved < step * 0.35) {
    var tryX = clampFn(p.x + (ux >= 0 ? 1 : -1) * step, p.z);
    var tryZ = clampFn(p.x, p.z + (uz >= 0 ? 1 : -1) * step);
    var dX = Math.hypot(wx - tryX.x, wz - tryX.z);
    var dZ = Math.hypot(wx - tryZ.x, wz - tryZ.z);
    var mX = Math.hypot(tryX.x - p.x, tryX.z - p.z);
    var mZ = Math.hypot(tryZ.x - p.x, tryZ.z - p.z);
    if (mX > bestMoved * 1.15 && dX < dist) { best = tryX; bestMoved = mX; }
    if (mZ > bestMoved * 1.15 && dZ < dist && dZ <= dX) { best = tryZ; bestMoved = mZ; }
  }

  var stepYaw = (bestMoved > 0.004) ? Math.atan2(best.x - p.x, best.z - p.z) : Math.atan2(dx, dz);
  p.yaw = (typeof tpsLerpAngle === 'function')
    ? tpsLerpAngle(p.yaw || 0, stepYaw, Math.min(1, dt * 12))
    : stepYaw;

  if (bestMoved < 0.015 * step) {
    p._stuckTimer = (p._stuckTimer || 0) + dt;
  } else {
    p._stuckTimer = 0;
  }
  return { x: best.x, z: best.z, dist: dist, moved: bestMoved, stuck: (p._stuckTimer || 0) > 0.42 };
}
`;
}
