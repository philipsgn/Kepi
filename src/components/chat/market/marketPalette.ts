/**
 * Bảng màu ấm 32-bit Chợ Bến Thành & các hàm vẽ Pixel Cluster chuẩn Indie Game (Quyết định 212)
 */
export function buildMarketPaletteScript(): string {
  return `
var INK = '#2B2118';
var MK_PAL = {
  beige: '#E8D8BA',
  cream: '#F3E7CE',
  creamHi: '#FFF8E7',
  woodLt: '#C8925A',
  wood: '#8C5832',
  woodDk: '#5C381E',
  terra: '#B85A3F',
  terraDk: '#8A3E29',
  red: '#9E2A2B',
  redBt: '#DC2626',
  greenDk: '#245940',
  greenMd: '#3E8A58',
  gold: '#D99B38',
  goldHi: '#F5CA72',
  indigo: '#3D5A80',
  tileA: '#CBB195',
  tileB: '#BFA183',
  tileWorn: '#B39374',
  grout: 'rgba(65,44,28,0.28)',
  ao: 'rgba(43,33,24,0.22)'
};

function R(c, x, y, w, h, col) {
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function E(c, cx, cy, rx, ry, col) {
  c.fillStyle = col;
  for (var dy = -ry; dy <= ry; dy++) {
    for (var dx = -rx; dx <= rx; dx++) {
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
        c.fillRect(Math.round(cx + dx), Math.round(cy + dy), 1, 1);
      }
    }
  }
}

function pxShadow(c, x, y, w, h) {
  R(c, x, y, w, h || 3, 'rgba(43,33,24,0.26)');
}

function pxBevelBox(c, x, y, w, h, fill, hi, sh) {
  R(c, x, y, w, h, INK);
  R(c, x + 1, y + 1, w - 2, h - 2, fill);
  if (hi) { R(c, x + 1, y + 1, w - 2, 1, hi); R(c, x + 1, y + 1, 1, h - 2, hi); }
  if (sh) { R(c, x + 1, y + h - 2, w - 2, 1, sh); R(c, x + w - 2, y + 1, 1, h - 2, sh); }
}

function pxDitherRect(c, x, y, w, h, colA, colB) {
  R(c, x, y, w, h, colA);
  c.fillStyle = colB;
  for (var py = 0; py < h; py += 2) {
    for (var px = (py % 4 === 0 ? 0 : 1); px < w; px += 2) {
      c.fillRect(Math.round(x + px), Math.round(y + py), 1, 1);
    }
  }
}

function pxTag(c, x, y, w, col) {
  R(c, x, y, w, 5, INK);
  R(c, x + 1, y + 1, w - 2, 3, col || '#FEF08A');
  R(c, x + 2, y + 2, Math.max(2, w - 4), 1, '#991B1B');
}

// Mái hiên vải sọc 3D có viền lượn sóng & bóng đổ xuống phía dưới (chuẩn Indie 32-bit)
function drawStripedAwning(c, x, y, w, h, colA, colB, stripeW) {
  stripeW = stripeW || 8;
  R(c, x + 2, y + h, w - 4, 4, 'rgba(43,33,24,0.28)');
  R(c, x, y, w, h, INK);
  for (var sx = 1; sx < w - 1; sx += stripeW) {
    var sw = Math.min(stripeW, w - 1 - sx);
    var col = (((sx - 1) / stripeW) | 0) % 2 === 0 ? colA : colB;
    R(c, x + sx, y + 1, sw, h - 4, col);
    R(c, x + sx, y + 1, sw, 2, 'rgba(255,255,255,0.24)');
    R(c, x + sx, y + h - 4, sw, 2, 'rgba(0,0,0,0.22)');
    // Viền lượn sóng dưới đáy mái hiên
    R(c, x + sx, y + h - 2, Math.max(2, sw - 1), 2, col);
    R(c, x + sx, y + h, Math.max(2, sw - 1), 1, INK);
  }
}

// Mái chóp vải sọc nhọn cho đảo trung tâm (như sạp chợ trong hình tham khảo)
function drawPitchedCanopy(c, x, y, w, h, colA, colB) {
  var mid = x + (w >> 1);
  R(c, x + 2, y + h, w - 4, 5, 'rgba(43,33,24,0.28)');
  for (var row = 0; row < h - 4; row++) {
    var halfW = Math.max(2, Math.round(((row + 2) / (h - 4)) * (w >> 1)));
    var lx = mid - halfW;
    var rw = halfW * 2;
    R(c, lx - 1, y + row, rw + 2, 1, INK);
    for (var px = 0; px < rw; px += 6) {
      var sw = Math.min(6, rw - px);
      var col = ((px / 6) | 0) % 2 === 0 ? colA : colB;
      R(c, lx + px, y + row, sw, 1, col);
    }
  }
  drawStripedAwning(c, x, y + h - 6, w, 7, colA, colB, 6);
  // Chóp gỗ đỉnh mái
  R(c, mid - 2, y - 3, 4, 4, INK);
  R(c, mid - 1, y - 2, 2, 2, MK_PAL.goldHi);
}

// Quầy gỗ có vân ván & viền nẹp nổi 3D
function drawWoodCounter(c, x, y, w, h, topCol, frontCol) {
  pxShadow(c, x, y + h - 1, w, 4);
  pxBevelBox(c, x, y, w, h, frontCol || MK_PAL.wood, MK_PAL.woodLt, MK_PAL.woodDk);
  R(c, x + 1, y + 1, w - 2, 8, topCol || MK_PAL.cream);
  R(c, x + 1, y + 9, w - 2, 1, INK);
  for (var px = x + 12; px < x + w - 4; px += 14) {
    R(c, px, y + 10, 1, h - 12, MK_PAL.woodDk);
  }
  R(c, x + 2, y + 12, w - 4, 2, MK_PAL.woodLt);
}

// Thùng gỗ nghiêng đầy ắp nông sản (xoài, cam, thanh long, rau, dưa hấu)
function drawWoodenCrate(c, x, y, w, h, fruitType) {
  pxShadow(c, x + 1, y + h - 1, w - 2, 3);
  pxBevelBox(c, x, y, w, h, MK_PAL.wood, MK_PAL.woodLt, MK_PAL.woodDk);
  R(c, x + 2, y + 2, w - 4, h - 5, '#4A2C16');
  var cols =
    fruitType === 'mango' ? ['#FACC15', '#F59E0B', '#FDE047'] :
    fruitType === 'orange' ? ['#F97316', '#EA580C', '#FDBA74'] :
    fruitType === 'dragon' ? ['#DB2777', '#EC4899', '#4ADE80'] :
    fruitType === 'melon' ? ['#15803D', '#22C55E', '#14532D'] :
    ['#22C55E', '#4ADE80', '#16A34A'];
  for (var fy = y + 2; fy < y + h - 4; fy += 4) {
    for (var fx = x + 3; fx < x + w - 5; fx += 5) {
      var ci = ((fx + fy) % cols.length);
      E(c, fx + 1, fy + 1, 3, 2, INK);
      E(c, fx + 1, fy + 1, 2, 2, cols[ci]);
      R(c, fx, fy, 1, 1, '#FFFBEB');
    }
  }
}

// Thúng tre đan đầy ắp hàng hóa đặt dưới sàn cạnh sạp
function drawBambooBasket(c, cx, cy, col) {
  pxShadow(c, cx - 7, cy + 3, 14, 3);
  E(c, cx, cy, 7, 5, INK);
  E(c, cx, cy, 6, 4, '#C89B54');
  R(c, cx - 5, cy, 10, 1, '#8C5832');
  E(c, cx, cy - 2, 5, 3, INK);
  E(c, cx, cy - 2, 4, 2, col || '#FACC15');
  R(c, cx - 2, cy - 3, 2, 1, '#FFFBEB');
}

// Đèn lồng treo vàng đỏ ấm áp
function drawHangingLantern(c, cx, y0, col) {
  R(c, cx, y0 - 6, 1, 6, INK);
  E(c, cx, y0 + 2, 4, 4, INK);
  E(c, cx, y0 + 2, 3, 3, col || '#EF4444');
  R(c, cx - 2, y0 - 1, 5, 1, '#FACC15');
  R(c, cx - 2, y0 + 5, 5, 1, '#FACC15');
  R(c, cx, y0 + 6, 1, 2, '#FACC15');
}

// Cân đồng hồ truyền thống Việt Nam
function drawScale(c, x, y) {
  R(c, x, y + 4, 8, 5, INK);
  R(c, x + 1, y + 5, 6, 3, '#16A34A');
  R(c, x + 2, y + 5, 4, 3, '#FFFBF1');
  R(c, x + 3, y + 6, 1, 2, '#DC2626');
  R(c, x + 1, y + 2, 6, 2, INK);
  R(c, x + 2, y + 2, 4, 1, '#CBD5E1');
}

// Bình gốm men xanh & chậu hoa
function drawCeramicVase(c, x, y, col) {
  R(c, x, y + 2, 7, 9, INK);
  R(c, x + 1, y + 3, 5, 7, col || '#2563EB');
  R(c, x + 2, y, 3, 2, INK);
  R(c, x + 2, y + 4, 2, 3, '#E0F2FE');
}

// =========================================================================
// CÔNG THỨC PIXEL-MASCOT-UI: mk(), mulberry32(), shape4() VIỀN 4 HƯỚNG & MÓN ĂN CHI TIẾT
// =========================================================================
function mk(w, h, fn) {
  var cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  var ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  if (fn) fn(ctx);
  return cv;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shape4(c, rows, fill, ox, oy) {
  ox = Math.round(ox || 0);
  oy = Math.round(oy || 0);
  c.fillStyle = INK;
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    var y = oy + r[0], x0 = ox + r[1], w = r[2] - r[1] + 1;
    c.fillRect(x0 - 1, y, w + 2, 1);
    c.fillRect(x0, y - 1, w, 1);
    c.fillRect(x0, y + 1, w, 1);
  }
  c.fillStyle = fill;
  for (var j = 0; j < rows.length; j++) {
    var r2 = rows[j];
    c.fillRect(ox + r2[1], oy + r2[0], r2[2] - r2[1] + 1, 1);
  }
}

// Tô Phở / Bún Bò Huế chi tiết 3 sắc độ + hành lá + lát thịt + đôi đũa
function drawPhoBowl(c, x, y) {
  shape4(c, [[0,1,9],[1,0,10],[2,0,10],[3,1,9],[4,2,8]], '#FFFBF1', x, y);
  R(c, x + 2, y + 4, 7, 1, '#CBD5E1');
  R(c, x + 1, y + 1, 9, 2, '#EA580C');
  R(c, x + 2, y + 1, 7, 1, '#FDBA74');
  R(c, x + 2, y + 1, 2, 1, '#B91C1C'); // thịt bò
  R(c, x + 6, y + 1, 2, 1, '#22C55E'); // hành lá
  R(c, x + 4, y + 2, 2, 1, '#FEF08A'); // sợi phở
  R(c, x + 7, y - 1, 6, 1, '#8C5832'); // đũa gác ngang
  R(c, x + 8, y, 5, 1, '#5C381E');
}

// Đĩa Bánh Cuốn Nóng / Bánh Bèo chén trắng rắc hành phi & chén nước mắm
function drawBanhCuonPlate(c, x, y) {
  shape4(c, [[0,1,10],[1,0,11],[2,0,11],[3,1,10]], '#E0F2FE', x, y);
  R(c, x + 2, y + 1, 3, 2, '#FFFBF1');
  R(c, x + 6, y + 1, 3, 2, '#FFFBF1');
  R(c, x + 3, y + 1, 1, 1, '#92400E'); // hành phi
  R(c, x + 7, y + 1, 1, 1, '#92400E');
  R(c, x + 5, y + 2, 2, 1, '#22C55E'); // rau thơm
  R(c, x + 10, y + 1, 2, 2, '#EA580C'); // chén nước mắm
}

// Mẹt Hải Sản Tôm Cua Mực trên đá bào 3 sắc độ
function drawSeafoodTray(c, x, y) {
  shape4(c, [[0,1,14],[1,0,15],[2,0,15],[3,0,15],[4,1,14]], '#BAE6FD', x, y);
  R(c, x + 2, y + 1, 12, 3, '#E0F2FE');
  // Tôm đỏ cong & cua
  R(c, x + 2, y + 1, 3, 2, '#EF4444'); R(c, x + 3, y + 1, 1, 1, '#FCA5A5');
  R(c, x + 6, y + 2, 4, 2, '#DC2626'); R(c, x + 7, y + 1, 2, 1, '#F97316');
  R(c, x + 11, y + 1, 3, 2, '#FFFBF1'); R(c, x + 12, y + 2, 1, 1, '#94A3B8');
}

// Tháp Trái Cây 3D (xoài, thanh long, sầu riêng) bằng shape4()
function drawFruitPyramid(c, x, y, type) {
  var c1 = type === 'dragon' ? '#DB2777' : (type === 'durian' ? '#65A30D' : '#F59E0B');
  var c2 = type === 'dragon' ? '#F472B6' : (type === 'durian' ? '#A3E635' : '#FDE047');
  var c3 = type === 'dragon' ? '#22C55E' : (type === 'durian' ? '#3F6212' : '#FFFBEB');
  shape4(c, [[0,4,7],[1,2,9],[2,1,10],[3,0,11],[4,0,11]], c1, x, y);
  R(c, x + 3, y + 1, 4, 1, c2);
  R(c, x + 1, y + 3, 3, 1, c2);
  R(c, x + 6, y + 3, 3, 1, c2);
  R(c, x + 5, y, 2, 1, c3);
  R(c, x + 2, y + 2, 1, 1, c3);
  R(c, x + 8, y + 2, 1, 1, c3);
}

// Quầy Cóc / Gánh Hàng Rong / Xe Bánh Mì / Bàn Nhựa Mini chen kín khoảng trống!
function drawStreetVendorCart(c, x, y, kind) {
  pxShadow(c, x - 1, y + 14, 24, 3);
  if (kind === 'banhmi') {
    pxBevelBox(c, x, y, 22, 15, '#E0F2FE', '#FFFFFF', '#94A3B8');
    R(c, x + 1, y + 1, 20, 4, '#DC2626');
    R(c, x + 3, y + 6, 5, 3, '#D97706'); R(c, x + 10, y + 6, 5, 3, '#F59E0B');
    R(c, x + 2, y + 11, 18, 3, '#1E3A8A');
  } else if (kind === 'ganh') {
    drawBambooBasket(c, x + 4, y + 10, '#FACC15');
    drawBambooBasket(c, x + 18, y + 10, '#22C55E');
    R(c, x + 2, y + 4, 18, 2, '#8C5832'); // đòn gánh tre
  } else if (kind === 'table') {
    pxBevelBox(c, x + 2, y + 2, 18, 10, '#93C5FD', '#DBEAFE', '#3B82F6');
    drawPhoBowl(c, x + 5, y + 3);
    drawPlasticStool(c, x - 5, y + 6, '#DC2626');
    drawPlasticStool(c, x + 21, y + 6, '#2563EB');
  } else {
    drawBambooBasket(c, x + 6, y + 9, '#EC4899');
    drawBambooBasket(c, x + 16, y + 10, '#F97316');
  }
}

var MF = {
  'A':[2,5,7,5,5],'B':[6,5,6,5,6],'C':[3,4,4,4,3],'D':[6,5,5,5,6],'E':[7,4,6,4,7],'F':[7,4,6,4,4],
  'G':[3,4,5,5,3],'H':[5,5,7,5,5],'I':[7,2,2,2,7],'K':[5,5,6,5,5],'L':[4,4,4,4,7],'M':[5,7,7,5,5],
  'N':[5,7,7,7,5],'O':[2,5,5,5,2],'P':[6,5,6,4,4],'Q':[2,5,5,3,1],'R':[6,5,6,5,5],'S':[3,4,2,1,6],
  'T':[7,2,2,2,2],'U':[5,5,5,5,7],'V':[5,5,5,2,2],'W':[5,5,7,7,5],'X':[5,2,2,2,5],'Y':[5,5,2,2,2],
  '0':[2,5,5,5,2],'1':[2,6,2,2,7],'2':[6,1,2,4,7],'3':[6,1,2,1,6],'4':[5,5,7,1,1],'5':[7,4,6,1,6],
  '8':[2,5,2,5,2],'9':[3,5,3,1,6],' ':[0,0,0,0,0],'-':[0,0,7,0,0],'.':[0,0,0,0,2]
};

function pxText(c, str, x0, y0, col, sc) {
  sc = sc || 1;
  c.fillStyle = col;
  var cx = Math.round(x0);
  for (var i = 0; i < str.length; i++) {
    var g = MF[str.charAt(i).toUpperCase()] || MF[' '];
    for (var r = 0; r < 5; r++) {
      var row = g[r];
      for (var b = 0; b < 3; b++) {
        if ((row >> (2 - b)) & 1) c.fillRect(cx + b * sc, Math.round(y0) + r * sc, sc, sc);
      }
    }
    cx += 4 * sc;
  }
}
`;
}
