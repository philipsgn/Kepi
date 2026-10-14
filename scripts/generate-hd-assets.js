const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Simple CRC32 implementation
function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function writeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);

  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, pixelShader) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = writeChunk('IHDR', ihdrData);

  // Raw Scanlines: (1 byte filter (0) + 4 bytes per pixel) * height
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter 0 (None)
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = pixelShader(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const idatCompressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = writeChunk('IDAT', idatCompressed);
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Distance to line segment
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// Monogram K Shader (Hà Nội Thu Đông: Dark #0E1620, Amber Gold #E59844, Jade #1B4D3E, Mint Glow)
function renderKepiIcon(x, y, w, h, isTransparentBg = false) {
  const cx = w / 2;
  const cy = h / 2;
  const scale = w / 1024;

  // Background
  let r = 14, g = 22, b = 32, a = 255;
  if (isTransparentBg) {
    a = 0; r = 0; g = 0; b = 0;
  }

  const distFromCenter = Math.hypot(x - cx, y - cy);
  // Halo Glow
  const haloRadius = 380 * scale;
  if (distFromCenter < haloRadius) {
    const haloIntensity = (1 - distFromCenter / haloRadius) * 0.22;
    r = Math.min(255, Math.round(r + 229 * haloIntensity));
    g = Math.min(255, Math.round(g + 152 * haloIntensity));
    b = Math.min(255, Math.round(b + 68 * haloIntensity));
    if (isTransparentBg) a = Math.round(255 * haloIntensity);
  }

  // Vertical Bar: (cx - 140*scale, cy - 240*scale) to (cx - 140*scale, cy + 240*scale), radius 42*scale
  const barX = cx - 140 * scale;
  const barY1 = cy - 250 * scale;
  const barY2 = cy + 250 * scale;
  const barRadius = 46 * scale;
  const distBar = distToSegment(x, y, barX, barY1, barX, barY2);

  if (distBar <= barRadius) {
    // Deep Forest Green #0F2F24 -> #1B4D3E
    return [15, 47, 36, 255];
  }

  // Diagonal Arm Upper (Gold #E59844): from (barX + 20*scale, cy - 10*scale) to (cx + 170*scale, cy - 230*scale)
  const arm1Dist = distToSegment(
    x, y,
    barX + 15 * scale, cy - 15 * scale,
    cx + 175 * scale, cy - 245 * scale
  );
  if (arm1Dist <= 46 * scale) {
    return [229, 152, 68, 255]; // #E59844
  }

  // Diagonal Arm Lower (Jade #1B4D3E): from (barX + 35*scale, cy - 15*scale) to (cx + 175*scale, cy + 235*scale)
  const arm2Dist = distToSegment(
    x, y,
    barX + 30 * scale, cy - 15 * scale,
    cx + 175 * scale, cy + 235 * scale
  );
  if (arm2Dist <= 46 * scale) {
    return [27, 77, 62, 255]; // #1B4D3E
  }

  // Golden accent dot at top right ngàm vàng
  const dotX = cx + 195 * scale;
  const dotY = cy - 265 * scale;
  const distDot = Math.hypot(x - dotX, y - dotY);
  if (distDot <= 32 * scale) {
    return [229, 152, 68, 255];
  }

  return [r, g, b, a];
}

const assetsDir = path.join(__dirname, '..', 'assets');
console.log('Generating HD 1024x1024 Kepi Branding Assets in:', assetsDir);

// 1. App Icon 1024x1024
const iconBuf = createPng(1024, 1024, (x, y, w, h) => renderKepiIcon(x, y, w, h, false));
fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconBuf);
console.log('✅ Created icon.png (1024x1024, ' + iconBuf.length + ' bytes)');

// 2. Adaptive Icon 1024x1024 (Foreground)
const adaptiveBuf = createPng(1024, 1024, (x, y, w, h) => renderKepiIcon(x, y, w, h, false));
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptiveBuf);
console.log('✅ Created adaptive-icon.png (1024x1024, ' + adaptiveBuf.length + ' bytes)');

// 3. Splash Icon 512x512
const splashBuf = createPng(512, 512, (x, y, w, h) => renderKepiIcon(x, y, w, h, false));
fs.writeFileSync(path.join(assetsDir, 'splash-icon.png'), splashBuf);
console.log('✅ Created splash-icon.png (512x512, ' + splashBuf.length + ' bytes)');

// 4. Favicon 128x128
const favBuf = createPng(128, 128, (x, y, w, h) => renderKepiIcon(x, y, w, h, false));
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), favBuf);
console.log('✅ Created favicon.png (128x128, ' + favBuf.length + ' bytes)');

// 5. Notification Icon 96x96
const notifBuf = createPng(96, 96, (x, y, w, h) => renderKepiIcon(x, y, w, h, false));
fs.writeFileSync(path.join(assetsDir, 'notification-icon.png'), notifBuf);
console.log('✅ Created notification-icon.png (96x96, ' + notifBuf.length + ' bytes)');
