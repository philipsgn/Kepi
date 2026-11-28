/**
 * Động Cơ WebGL 3D Thuần Inline Dùng Chung Cho Toàn Bộ 7 Địa Danh TPS 3D (Quyết định 247–250)
 * Tài liệu gốc: docs/TPS_3D_OPEN_WORLD_SPEC.md (§7.1)
 * - 100% Zero-CDN, chạy 60fps trên Web PWA, iOS Fabric WKWebView & Android, kèm Canvas2D fallback.
 * - Hệ Mesh đa giác mượt: box, quad, sphere, cyl, cup, cone, torus, arch, wedge.
 * - Shader tham số hóa WebglSceneAtmosphere: Hemisphere + Wrap Diffuse Sun + 4 đèn điểm + Haze +
 *   Alpha Cutout (alpha < 0.08) + Unlit Emissive Bypass (uEmissive > 0.99) giữ chuẩn màu Pixel Art.
 * - Responsive Horizontal-Safe FOV (~58–64° trên màn hình dọc) & Portal-Aware Multi-AABB +
 *   Divider-Wall Segment Spring-Arm Raycast chống giật camera qua cổng chữ L/T.
 */
export function buildPixelWebgl3dEngineScript(): string {
  return String.raw`
/* ==================== 1. TOÁN HỌC MA TRẬN 3D (MAT4) ==================== */
var M4 = {
  ident: function() {
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  },
  perspective: function(fovRad, aspect, near, far) {
    var f = 1.0 / Math.tan(fovRad * 0.5);
    var nf = 1.0 / (near - far);
    return new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, (2 * far * near) * nf, 0
    ]);
  },
  lookAt: function(ex, ey, ez, tx, ty, tz) {
    var zx = ex - tx, zy = ey - ty, zz = ez - tz;
    var zl = Math.hypot(zx, zy, zz) || 1;
    zx /= zl; zy /= zl; zz /= zl;
    var xx = zz, xy = 0, xz = -zx;
    var xl = Math.hypot(xx, xy, xz) || 1;
    xx /= xl; xy /= xl; xz /= xl;
    var yx = zy * xz - zz * xy;
    var yy = zz * xx - zx * xz;
    var yz = zx * xy - zy * xx;
    return new Float32Array([
      xx, yx, zx, 0,
      xy, yy, zy, 0,
      xz, yz, zz, 0,
      -(xx*ex + xy*ey + xz*ez),
      -(yx*ex + yy*ey + yz*ez),
      -(zx*ex + zy*ey + zz*ez),
      1
    ]);
  },
  trs: function(px, py, pz, rx, ry, rz, sx, sy, sz) {
    var cx = Math.cos(rx), sxr = Math.sin(rx);
    var cy = Math.cos(ry), syr = Math.sin(ry);
    var cz = Math.cos(rz), szr = Math.sin(rz);
    var m00 = (cy*cz + syr*sxr*szr) * sx;
    var m01 = (cx*szr) * sx;
    var m02 = (-syr*cz + cy*sxr*szr) * sx;
    var m10 = (-cy*szr + syr*sxr*cz) * sy;
    var m11 = (cx*cz) * sy;
    var m12 = (syr*szr + cy*sxr*cz) * sy;
    var m20 = (syr*cx) * sz;
    var m21 = (-sxr) * sz;
    var m22 = (cy*cx) * sz;
    return new Float32Array([
      m00, m01, m02, 0,
      m10, m11, m12, 0,
      m20, m21, m22, 0,
      px,  py,  pz,  1
    ]);
  }
};

/* ==================== 2. TRÌNH BIÊN DỊCH SHADER & BỘ DỰNG WEBGL 1 DÙNG CHUNG ==================== */
function createPixelWebglRenderer(canvas) {
  var gl = null;
  try {
    gl = canvas.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'high-performance' }) ||
         canvas.getContext('experimental-webgl', { antialias: true, alpha: false });
  } catch (e) { gl = null; }
  if (!gl) return null;

  var vsSrc = [
    'attribute vec3 aPos;',
    'attribute vec3 aNorm;',
    'attribute vec2 aUv;',
    'uniform mat4 uProj;',
    'uniform mat4 uView;',
    'uniform mat4 uModel;',
    'varying vec3 vWorldPos;',
    'varying vec3 vWorldNorm;',
    'varying vec2 vUv;',
    'void main() {',
    '  vec4 wp = uModel * vec4(aPos, 1.0);',
    '  vWorldPos = wp.xyz;',
    '  vWorldNorm = normalize(mat3(uModel[0].xyz, uModel[1].xyz, uModel[2].xyz) * aNorm);',
    '  vUv = aUv;',
    '  gl_Position = uProj * uView * wp;',
    '}'
  ].join('\n');

  var fsSrc = [
    'precision mediump float;',
    'varying vec3 vWorldPos;',
    'varying vec3 vWorldNorm;',
    'varying vec2 vUv;',
    'uniform sampler2D uTex;',
    'uniform vec2 uUvScale;',
    'uniform vec2 uUvOffset;',
    'uniform vec4 uTint;',
    'uniform vec3 uCamPos;',
    'uniform float uEmissive;',
    'uniform float uSpecPow;',
    'uniform float uRimStrength;',
    'uniform vec3 uHemiLow;',
    'uniform vec3 uHemiHigh;',
    'uniform vec3 uSunDir;',
    'uniform vec3 uSunCol;',
    'uniform float uWrapBias;',
    'uniform vec3 uL0Pos; uniform vec3 uL0Col;',
    'uniform vec3 uL1Pos; uniform vec3 uL1Col;',
    'uniform vec3 uL2Pos; uniform vec3 uL2Col;',
    'uniform vec3 uL3Pos; uniform vec3 uL3Col;',
    'uniform vec4 uOutdoorRect;', // [enabled, zCut, yMin, strength]
    'uniform vec3 uFogCol;',
    'uniform vec3 uFogParams;',  // [near, span, maxFactor]
    'void main() {',
    '  vec4 texCol = texture2D(uTex, vUv * uUvScale + uUvOffset);',
    '  vec3 base = texCol.rgb * uTint.rgb;',
    '  float alpha = texCol.a * uTint.a;',
    '  if (alpha < 0.08) discard;',
    '  if (uEmissive > 0.99) {',
    '    gl_FragColor = vec4(base * uEmissive, alpha);',
    '    return;',
    '  }',
    '  vec3 N = normalize(vWorldNorm);',
    '  vec3 V = normalize(uCamPos - vWorldPos);',
    '  float hemi = N.y * 0.5 + 0.5;',
    '  vec3 amb = mix(uHemiLow, uHemiHigh, hemi);',
    '  vec3 Lsun = normalize(uSunDir);',
    '  float wrapSun = clamp(dot(N, Lsun) * (1.0 - uWrapBias) + uWrapBias, 0.0, 1.0);',
    '  float outdoorBoost = 0.0;',
    '  if (uOutdoorRect.x > 0.5) {',
    '    outdoorBoost = smoothstep(uOutdoorRect.y + 3.0, uOutdoorRect.y - 2.0, vWorldPos.z) * smoothstep(uOutdoorRect.z - 1.4, uOutdoorRect.z + 0.4, vWorldPos.y + 1.2);',
    '  } else if (uOutdoorRect.x < -0.5) {',
    '    outdoorBoost = uOutdoorRect.w;',
    '  }',
    '  vec3 sunCol = uSunCol * (0.42 + 0.55 * outdoorBoost);',
    '  vec3 diff = amb * 0.72 + sunCol * wrapSun;',
    '  vec3 d0 = uL0Pos - vWorldPos; float att0 = 1.0 / (1.0 + 0.085 * dot(d0, d0));',
    '  diff += uL0Col * (max(dot(N, normalize(d0)), 0.0) * 0.75 + 0.25) * att0;',
    '  vec3 d1 = uL1Pos - vWorldPos; float att1 = 1.0 / (1.0 + 0.11 * dot(d1, d1));',
    '  diff += uL1Col * (max(dot(N, normalize(d1)), 0.0) * 0.75 + 0.25) * att1;',
    '  vec3 d2 = uL2Pos - vWorldPos; float att2 = 1.0 / (1.0 + 0.085 * dot(d2, d2));',
    '  diff += uL2Col * (max(dot(N, normalize(d2)), 0.0) * 0.75 + 0.25) * att2;',
    '  vec3 d3 = uL3Pos - vWorldPos; float att3 = 1.0 / (1.0 + 0.075 * dot(d3, d3));',
    '  diff += uL3Col * (max(dot(N, normalize(d3)), 0.0) * 0.75 + 0.25) * att3;',
    '  vec3 H = normalize(Lsun + V);',
    '  float spec = pow(max(dot(N, H), 0.0), uSpecPow) * 0.26;',
    '  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.8) * uRimStrength;',
    '  vec3 col = base * diff + vec3(1.0, 0.94, 0.80) * (spec + fresnel) + base * uEmissive;',
    '  float camDist = length(uCamPos - vWorldPos);',
    '  float fogAmt = clamp((camDist - uFogParams.x) / max(1.0, uFogParams.y), 0.0, uFogParams.z);',
    '  vec3 fogCol = mix(uFogCol, vec3(0.92, 0.82, 0.62), clamp(outdoorBoost * 0.65, 0.0, 1.0));',
    '  col = mix(col, fogCol, fogAmt);',
    '  gl_FragColor = vec4(col, alpha);',
    '}'
  ].join('\n');

  function compileShader(type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  }

  var prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vsSrc));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fsSrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  var uNames = [
    'uProj','uView','uModel','uTex','uUvScale','uUvOffset','uTint','uCamPos',
    'uEmissive','uSpecPow','uRimStrength','uHemiLow','uHemiHigh','uSunDir','uSunCol','uWrapBias',
    'uL0Pos','uL0Col','uL1Pos','uL1Col','uL2Pos','uL2Col','uL3Pos','uL3Col',
    'uOutdoorRect','uFogCol','uFogParams'
  ];
  var loc = {
    aPos: gl.getAttribLocation(prog, 'aPos'),
    aNorm: gl.getAttribLocation(prog, 'aNorm'),
    aUv: gl.getAttribLocation(prog, 'aUv')
  };
  for (var ui = 0; ui < uNames.length; ui++) {
    loc[uNames[ui]] = gl.getUniformLocation(prog, uNames[ui]);
  }

  function uploadMesh(verts, norms, uvs, idx) {
    var vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    var nb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, nb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(norms), gl.STATIC_DRAW);
    var ub = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ub); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    return { vb: vb, nb: nb, ub: ub, ib: ib, count: idx.length };
  }

  function makeBox() {
    var p = [
      -0.5,-0.5, 0.5,  0.5,-0.5, 0.5,  0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
       0.5,-0.5,-0.5, -0.5,-0.5,-0.5, -0.5, 0.5,-0.5,  0.5, 0.5,-0.5,
      -0.5, 0.5, 0.5,  0.5, 0.5, 0.5,  0.5, 0.5,-0.5, -0.5, 0.5,-0.5,
      -0.5,-0.5,-0.5,  0.5,-0.5,-0.5,  0.5,-0.5, 0.5, -0.5,-0.5, 0.5,
       0.5,-0.5, 0.5,  0.5,-0.5,-0.5,  0.5, 0.5,-0.5,  0.5, 0.5, 0.5,
      -0.5,-0.5,-0.5, -0.5,-0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5,-0.5
    ];
    var n = [
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
      0,1,0, 0,1,0, 0,1,0, 0,1,0,
      0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
      1,0,0, 1,0,0, 1,0,0, 1,0,0,
      -1,0,0, -1,0,0, -1,0,0, -1,0,0
    ];
    var u = [];
    for (var i = 0; i < 6; i++) u.push(0,1, 1,1, 1,0, 0,0);
    var ix = [];
    for (var f = 0; f < 6; f++) { var b = f * 4; ix.push(b,b+1,b+2, b,b+2,b+3); }
    return uploadMesh(p, n, u, ix);
  }

  function makeQuad() {
    return uploadMesh(
      [-0.5,-0.5,0, 0.5,-0.5,0, 0.5,0.5,0, -0.5,0.5,0],
      [0,0,1, 0,0,1, 0,0,1, 0,0,1],
      [0,1, 1,1, 1,0, 0,0],
      [0,1,2, 0,2,3]
    );
  }

  function makeSphere(latN, lonN) {
    var p = [], n = [], u = [], ix = [];
    for (var lat = 0; lat <= latN; lat++) {
      var th = lat * Math.PI / latN, st = Math.sin(th), ct = Math.cos(th);
      for (var lon = 0; lon <= lonN; lon++) {
        var ph = lon * 2 * Math.PI / lonN, sp = Math.sin(ph), cp = Math.cos(ph);
        var x = cp * st, y = ct, z = sp * st;
        p.push(x * 0.5, y * 0.5, z * 0.5);
        n.push(x, y, z);
        u.push(lon / lonN, lat / latN);
      }
    }
    for (var la = 0; la < latN; la++) {
      for (var lo = 0; lo < lonN; lo++) {
        var a = la * (lonN + 1) + lo, b = a + lonN + 1;
        ix.push(a, b, a+1, b, b+1, a+1);
      }
    }
    return uploadMesh(p, n, u, ix);
  }

  function makeCylinder(segN, topRatio) {
    var p = [], n = [], u = [], ix = [];
    var tr = typeof topRatio === 'number' ? topRatio : 1.0;
    for (var yStep = 0; yStep <= 1; yStep++) {
      var y = yStep === 0 ? -0.5 : 0.5;
      var rad = (yStep === 0 ? 0.5 : 0.5 * tr);
      for (var s = 0; s <= segN; s++) {
        var ang = (s / segN) * Math.PI * 2;
        var cx = Math.cos(ang), cz = Math.sin(ang);
        p.push(cx * rad, y, cz * rad);
        n.push(cx, 0.25 * (1 - tr), cz);
        u.push(s / segN, yStep === 0 ? 1 : 0);
      }
    }
    var stride = segN + 1;
    for (var s2 = 0; s2 < segN; s2++) {
      ix.push(s2, s2 + stride, s2 + 1, s2 + stride, s2 + stride + 1, s2 + 1);
    }
    var topCenterIdx = p.length / 3;
    p.push(0, 0.5, 0); n.push(0, 1, 0); u.push(0.5, 0.5);
    for (var st = 0; st <= segN; st++) {
      var at = (st / segN) * Math.PI * 2;
      p.push(Math.cos(at)*0.5*tr, 0.5, Math.sin(at)*0.5*tr); n.push(0, 1, 0); u.push(0.5+Math.cos(at)*0.5, 0.5+Math.sin(at)*0.5);
    }
    for (var st2 = 0; st2 < segN; st2++) ix.push(topCenterIdx, topCenterIdx + 1 + st2 + 1, topCenterIdx + 1 + st2);
    var botCenterIdx = p.length / 3;
    p.push(0, -0.5, 0); n.push(0, -1, 0); u.push(0.5, 0.5);
    for (var sb = 0; sb <= segN; sb++) {
      var ab = (sb / segN) * Math.PI * 2;
      p.push(Math.cos(ab)*0.5, -0.5, Math.sin(ab)*0.5); n.push(0, -1, 0); u.push(0.5+Math.cos(ab)*0.5, 0.5+Math.sin(ab)*0.5);
    }
    for (var sb2 = 0; sb2 < segN; sb2++) ix.push(botCenterIdx, botCenterIdx + 1 + sb2, botCenterIdx + 1 + sb2 + 1);
    return uploadMesh(p, n, u, ix);
  }

  function makeTorus(rad, tube, segR, segT) {
    var p = [], n = [], u = [], ix = [];
    for (var i = 0; i <= segR; i++) {
      var th = (i / segR) * Math.PI * 2, ct = Math.cos(th), st = Math.sin(th);
      for (var j = 0; j <= segT; j++) {
        var ph = (j / segT) * Math.PI * 2, cp = Math.cos(ph), sp = Math.sin(ph);
        var x = (rad + tube * cp) * ct, y = tube * sp, z = (rad + tube * cp) * st;
        p.push(x, y, z); n.push(cp * ct, sp, cp * st); u.push(i / segR, j / segT);
      }
    }
    for (var i2 = 0; i2 < segR; i2++) {
      for (var j2 = 0; j2 < segT; j2++) {
        var a = i2 * (segT + 1) + j2, b = a + segT + 1;
        ix.push(a, b, a+1, b, b+1, a+1);
      }
    }
    return uploadMesh(p, n, u, ix);
  }

  function makeWedge() {
    // Khối nêm/dốc chuẩn đơn vị [-0.5..+0.5] dốc tăng theo +Z
    var p = [
      -0.5,-0.5,-0.5,  0.5,-0.5,-0.5,  0.5, 0.5, 0.5, -0.5, 0.5, 0.5, // mặt dốc
      -0.5,-0.5, 0.5,  0.5,-0.5, 0.5,  0.5, 0.5, 0.5, -0.5, 0.5, 0.5, // mặt sau +Z
      -0.5,-0.5,-0.5,  0.5,-0.5,-0.5,  0.5,-0.5, 0.5, -0.5,-0.5, 0.5, // đáy
      -0.5,-0.5,-0.5, -0.5,-0.5, 0.5, -0.5, 0.5, 0.5,
       0.5,-0.5,-0.5,  0.5, 0.5, 0.5,  0.5,-0.5, 0.5
    ];
    var s2 = 0.7071;
    var n = [
      0,s2,-s2, 0,s2,-s2, 0,s2,-s2, 0,s2,-s2,
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
      -1,0,0, -1,0,0, -1,0,0,
      1,0,0, 1,0,0, 1,0,0
    ];
    var u = [0,1, 1,1, 1,0, 0,0,  0,1, 1,1, 1,0, 0,0,  0,1, 1,1, 1,0, 0,0,  0,1, 1,1, 1,0,  0,1, 1,0, 1,1];
    var ix = [0,1,2, 0,2,3,  4,5,6, 4,6,7,  8,9,10, 8,10,11,  12,13,14,  15,16,17];
    return uploadMesh(p, n, u, ix);
  }

  function makeArch(seg) {
    // Khung vòm 3D cong cho Gothic Nhà Thờ / Mái Đao Chùa / Khung Chợ
    var p = [], n = [], u = [], ix = [];
    for (var i = 0; i < seg; i++) {
      var t0 = i / seg, t1 = (i + 1) / seg;
      var a0 = Math.PI * (1 - t0), a1 = Math.PI * (1 - t1);
      var ix0 = Math.cos(a0) * 0.34, iy0 = Math.sin(a0) * 0.42;
      var ix1 = Math.cos(a1) * 0.34, iy1 = Math.sin(a1) * 0.42;
      var ox0 = Math.cos(a0) * 0.50, oy0 = 0.50;
      var ox1 = Math.cos(a1) * 0.50, oy1 = 0.50;
      var base = p.length / 3;
      p.push(ix0,iy0,0.5, ox0,oy0,0.5, ox1,oy1,0.5, ix1,iy1,0.5);
      p.push(ix1,iy1,-0.5, ox1,oy1,-0.5, ox0,oy0,-0.5, ix0,iy0,-0.5);
      for (var k = 0; k < 4; k++) n.push(0,0,1);
      for (var k2 = 0; k2 < 4; k2++) n.push(0,0,-1);
      u.push(t0,1, t0,0, t1,0, t1,1, t1,1, t1,0, t0,0, t0,1);
      ix.push(base,base+1,base+2, base,base+2,base+3, base+4,base+5,base+6, base+4,base+6,base+7);
    }
    return uploadMesh(p, n, u, ix);
  }

  var meshes = {
    box: makeBox(),
    quad: makeQuad(),
    sphere: makeSphere(12, 16),
    cyl: makeCylinder(14, 1.0),
    cup: makeCylinder(14, 1.28),
    cone: makeCylinder(14, 0.28),
    torus: makeTorus(0.45, 0.08, 16, 8),
    wedge: makeWedge(),
    arch: makeArch(10)
  };

  var textures = {};
  function registerTextureCanvas(key, cnv, repeat, nearest) {
    if (textures[key]) return;
    var t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cnv);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
    if (nearest) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D);
    }
    textures[key] = t;
  }

  var wc = document.createElement('canvas'); wc.width = 2; wc.height = 2;
  var wctx = wc.getContext('2d'); wctx.fillStyle = '#FFFFFF'; wctx.fillRect(0,0,2,2);
  registerTextureCanvas('white', wc, true);

  var activeMesh = null;
  var activeTex = null;

  var defaultAtmo = {
    clearColor: [0.55, 0.44, 0.28, 1.0],
    hemiLow: [0.24, 0.23, 0.16],
    hemiHigh: [0.56, 0.52, 0.40],
    sunDir: [0.36, 0.68, -0.63],
    sunCol: [1.05, 0.86, 0.55],
    wrapBias: 0.42,
    lights: [
      { pos: [2.2, 2.55, 6.2], col: [1.15, 0.74, 0.32] },
      { pos: [-3.5, 2.6, 12.6], col: [1.10, 0.66, 0.24] },
      { pos: [-0.4, 5.9, 5.2], col: [1.08, 0.78, 0.40] },
      { pos: [0, 3.0, 2.0], col: [0.25, 0.20, 0.12] }
    ],
    outdoorRect: [1.0, 1.5, 2.0, 1.0],
    fogCol: [0.28, 0.26, 0.18],
    fogParams: [8.5, 26.0, 0.55]
  };

  function beginFrame(W, H, cam, atmosphere) {
    var at = atmosphere || defaultAtmo;
    var cc = at.clearColor || defaultAtmo.clearColor;
    gl.viewport(0, 0, W, H);
    gl.clearColor(cc[0], cc[1], cc[2], typeof cc[3] === 'number' ? cc[3] : 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.useProgram(prog);

    var aspect = W / Math.max(1, H);
    var fovy = aspect < 1 ? Math.min(1.68, 2 * Math.atan(Math.tan(0.54) / Math.max(0.42, aspect))) : 0.82;
    if (cam) {
      cam.activeFovy = fovy;
      cam.vw = W; cam.vh = H;
      cam.focal = (H * 0.5) / Math.tan(fovy * 0.5);
    }
    var currentProj = M4.perspective(fovy, aspect, 0.14, 78.0);
    var currentView = M4.lookAt(cam.pos.x, cam.pos.y, cam.pos.z, cam.lookX, cam.lookY, cam.lookZ);
    gl.uniformMatrix4fv(loc.uProj, false, currentProj);
    gl.uniformMatrix4fv(loc.uView, false, currentView);
    gl.uniform3f(loc.uCamPos, cam.pos.x, cam.pos.y, cam.pos.z);

    var hl = at.hemiLow || defaultAtmo.hemiLow, hh = at.hemiHigh || defaultAtmo.hemiHigh;
    var sd = at.sunDir || defaultAtmo.sunDir, sc = at.sunCol || defaultAtmo.sunCol;
    gl.uniform3f(loc.uHemiLow, hl[0], hl[1], hl[2]);
    gl.uniform3f(loc.uHemiHigh, hh[0], hh[1], hh[2]);
    gl.uniform3f(loc.uSunDir, sd[0], sd[1], sd[2]);
    gl.uniform3f(loc.uSunCol, sc[0], sc[1], sc[2]);
    gl.uniform1f(loc.uWrapBias, typeof at.wrapBias === 'number' ? at.wrapBias : 0.42);

    var ls = at.lights || defaultAtmo.lights;
    for (var li = 0; li < 4; li++) {
      var l = ls[li] || { pos: [0, 99, 0], col: [0, 0, 0] };
      gl.uniform3f(loc['uL' + li + 'Pos'], l.pos[0], l.pos[1], l.pos[2]);
      gl.uniform3f(loc['uL' + li + 'Col'], l.col[0], l.col[1], l.col[2]);
    }
    var or = at.outdoorRect || defaultAtmo.outdoorRect;
    var fc = at.fogCol || defaultAtmo.fogCol;
    var fp = at.fogParams || defaultAtmo.fogParams;
    gl.uniform4f(loc.uOutdoorRect, or[0], or[1], or[2], or[3]);
    gl.uniform3f(loc.uFogCol, fc[0], fc[1], fc[2]);
    gl.uniform3f(loc.uFogParams, fp[0], fp[1], fp[2]);

    activeMesh = null;
    activeTex = null;
  }

  function drawMesh(meshName, texName, px, py, pz, rx, ry, rz, sx, sy, sz, opts) {
    var m = meshes[meshName] || meshes.box;
    if (activeMesh !== m) {
      activeMesh = m;
      gl.bindBuffer(gl.ARRAY_BUFFER, m.vb); gl.enableVertexAttribArray(loc.aPos); gl.vertexAttribPointer(loc.aPos, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, m.nb); gl.enableVertexAttribArray(loc.aNorm); gl.vertexAttribPointer(loc.aNorm, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, m.ub); gl.enableVertexAttribArray(loc.aUv); gl.vertexAttribPointer(loc.aUv, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ib);
    }
    var tex = textures[texName] || textures.white;
    if (activeTex !== tex) {
      activeTex = tex;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(loc.uTex, 0);
    }
    var o = opts || {};
    var model = M4.trs(px, py, pz, rx || 0, ry || 0, rz || 0, sx, sy, sz);
    gl.uniformMatrix4fv(loc.uModel, false, model);
    gl.uniform2f(loc.uUvScale, o.us || 1, o.vs || 1);
    gl.uniform2f(loc.uUvOffset, o.uo || 0, o.vo || 0);
    var t = o.tint || [1, 1, 1, 1];
    gl.uniform4f(loc.uTint, t[0], t[1], t[2], typeof t[3] === 'number' ? t[3] : 1);
    gl.uniform1f(loc.uEmissive, o.emissive || 0);
    gl.uniform1f(loc.uSpecPow, o.specPow || 24.0);
    gl.uniform1f(loc.uRimStrength, typeof o.rim === 'number' ? o.rim : 0.14);
    gl.drawElements(gl.TRIANGLES, m.count, gl.UNSIGNED_SHORT, 0);
  }

  function setBlend(mode) {
    if (!mode) {
      gl.disable(gl.BLEND); gl.depthMask(true);
    } else if (mode === 'add') {
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE); gl.depthMask(false);
    } else {
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    }
  }

  return {
    gl: gl,
    hasTexture: function(k) { return !!textures[k]; },
    registerTextureCanvas: registerTextureCanvas,
    beginFrame: beginFrame,
    drawMesh: drawMesh,
    setBlend: setBlend
  };
}

function createCafeWebglRenderer(canvas) {
  return createPixelWebglRenderer(canvas);
}

/* ==================== 3. CAMERA SPRING-ARM PORTAL-AWARE ĐA PHÒNG / ĐA TẦNG ==================== */
function raySplitDividerWall(ox, oy, oz, bx, by, bz, dw) {
  var t = -1, hitX = 0, hitY = 0, hitZ = 0, spanCoord = 0;
  if (dw.axis === 'x') {
    if (Math.abs(bx) < 0.0001) return -1;
    t = (dw.pos - ox) / bx;
    if (t <= 0.05) return -1;
    hitY = oy + by * t; hitZ = oz + bz * t;
    if (hitY < dw.minY || hitY > dw.maxY || hitZ < dw.minSpan || hitZ > dw.maxSpan) return -1;
    spanCoord = hitZ;
  } else {
    if (Math.abs(bz) < 0.0001) return -1;
    t = (dw.pos - oz) / bz;
    if (t <= 0.05) return -1;
    hitX = ox + bx * t; hitY = oy + by * t;
    if (hitY < dw.minY || hitY > dw.maxY || hitX < dw.minSpan || hitX > dw.maxSpan) return -1;
    spanCoord = hitX;
  }
  if (dw.openings) {
    for (var i = 0; i < dw.openings.length; i++) {
      var op = dw.openings[i];
      if (spanCoord >= op.a1 && spanCoord <= op.a2 && hitY >= op.y1 && hitY <= op.y2) {
        return -1; // Lọt qua vòm/cổng/lan can mở -> camera nhìn xuyên thông thoáng không giật!
      }
    }
  }
  return Math.max(0.55, t - 0.36);
}

function computeWebglTpsCamera(cam, pig, navConfig) {
  var dist = cam.dist || 4.85;
  var sy = Math.sin(cam.yaw), cy = Math.cos(cam.yaw);
  var sp = Math.sin(cam.pitch), cp = Math.cos(cam.pitch);
  var tx = pig.x, ty = (pig.y || 0) + (cam.targetHeight || 0.72), tz = pig.z;
  var bx = -sy * cp, by = -sp, bz = -cy * cp;
  var tHit = dist;
  var wm = (navConfig && typeof navConfig.wallMargin === 'number') ? navConfig.wallMargin : 0.38;

  // Tìm zone AABB chứa (pig.x, pig.y, pig.z) hoặc bao ngoại vi
  var outer = navConfig && navConfig.outerBounds ? navConfig.outerBounds : { minX: -5.8, maxX: 5.8, minZ: 0.1, maxZ: 14.6, minY: 0.45, maxY: 6.5 };
  if (navConfig && navConfig.zones && navConfig.zones.length) {
    // Raycast trên vùng biên ngoài trước, rồi raycast các vách ngăn đặc ngoài openings[]
    var mnX = outer.minX + wm, mxX = outer.maxX - wm;
    var mnZ = outer.minZ + wm, mxZ = outer.maxZ - wm;
    var mnY = (typeof outer.minY === 'number' ? outer.minY : 0.65) + (pig.y || 0) * 0.85;
    var mxY = outer.maxY - 0.35;
    if (bx < -0.0001) { var t1 = (mnX - tx) / bx; if (t1 >= 0 && t1 < tHit) tHit = t1; }
    else if (bx > 0.0001) { var t2 = (mxX - tx) / bx; if (t2 >= 0 && t2 < tHit) tHit = t2; }
    if (bz < -0.0001) { var t3 = (mnZ - tz) / bz; if (t3 >= 0 && t3 < tHit) tHit = t3; }
    else if (bz > 0.0001) { var t4 = (mxZ - tz) / bz; if (t4 >= 0 && t4 < tHit) tHit = t4; }
    if (by < -0.0001) { var t5 = (mnY - ty) / by; if (t5 >= 0 && t5 < tHit) tHit = t5; }
    else if (by > 0.0001) { var t6 = (mxY - ty) / by; if (t6 >= 0 && t6 < tHit) tHit = t6; }
  }
  if (navConfig && navConfig.dividerWalls) {
    for (var di = 0; di < navConfig.dividerWalls.length; di++) {
      var td = raySplitDividerWall(tx, ty, tz, bx, by, bz, navConfig.dividerWalls[di]);
      if (td > 0 && td < tHit) tHit = td;
    }
  }

  var desiredDist = Math.max(0.85, tHit);
  if (typeof cam.curDist !== 'number') cam.curDist = desiredDist;
  if (desiredDist < cam.curDist) cam.curDist = desiredDist;
  else cam.curDist += (desiredDist - cam.curDist) * 0.18;

  var ex = tx + bx * cam.curDist;
  var ey = ty + by * cam.curDist;
  var ez = tz + bz * cam.curDist;
  var floorBase = pig.y || 0;
  ey = Math.max(floorBase + 0.85, Math.min(outer.maxY - 0.30, ey));

  var targetLookX = pig.x + sy * 1.1;
  var targetLookY = floorBase + 1.05;
  var targetLookZ = pig.z + cy * 1.1;

  if (!cam.cafeInited || !cam.pos || !isFinite(cam.pos.x)) {
    cam.cafeInited = true;
    cam.pos = { x: ex, y: ey, z: ez };
    cam.lookX = targetLookX; cam.lookY = targetLookY; cam.lookZ = targetLookZ;
  } else {
    cam.pos.x += (ex - cam.pos.x) * 0.24;
    cam.pos.y += (ey - cam.pos.y) * 0.24;
    cam.pos.z += (ez - cam.pos.z) * 0.24;
    cam.lookX += (targetLookX - cam.lookX) * 0.26;
    cam.lookY += (targetLookY - cam.lookY) * 0.26;
    cam.lookZ += (targetLookZ - cam.lookZ) * 0.26;
  }

  var fx = cam.lookX - cam.pos.x, fy = cam.lookY - cam.pos.y, fz = cam.lookZ - cam.pos.z;
  var fl = Math.hypot(fx, fy, fz) || 1;
  fx /= fl; fy /= fl; fz /= fl;
  var rx = -fz, rz = fx;
  var rl = Math.hypot(rx, rz) || 1;
  rx /= rl; rz /= rl;
  cam.F = { x: fx, y: fy, z: fz };
  cam.R = { x: rx, y: 0, z: rz };
  cam.U = { x: fy * rz, y: fz * rx - fx * rz, z: -fy * rx };
}
`;
}
