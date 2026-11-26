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
