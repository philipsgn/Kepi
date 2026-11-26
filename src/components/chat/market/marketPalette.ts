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
