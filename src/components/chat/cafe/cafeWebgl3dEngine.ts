/**
 * Động Cơ WebGL 3D Thuần Inline Phong Cách Pixar / Studio Ghibli Cho Cộng Cà Phê (Quyết định 247)
 * - 100% Zero-CDN, chạy mượt 60fps trên Web PWA, iOS Fabric WKWebView & Android.
 * - Hệ Mesh đa giác mượt (Box, Sphere, Cylinder, Cone, Torus) + Matrix4 math thuần JS.
 * - Shader Ánh Sáng Điện Ảnh: Wrap Diffuse kiểu Pixar, Rim Fresnel, 3 Nguồn Đèn Tungsten 2700K
 *   (Quầy Bartender, Đèn Tường Đồng Cầu Thang, Sảnh Tầng 2) & Nắng Chiều Vàng Óng Ban Công.
 */
export function buildCafeWebgl3dEngineScript(): string {
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
    var xx = zz, xy = 0, xz = -zx; // cross(up(0,1,0), z) = (zz, 0, -zx)
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
  mul: function(a, b) {
    var o = new Float32Array(16);
    for (var i = 0; i < 4; i++) {
      var ai0 = a[i], ai1 = a[i+4], ai2 = a[i+8], ai3 = a[i+12];
      o[i]    = ai0*b[0] + ai1*b[1] + ai2*b[2] + ai3*b[3];
      o[i+4]  = ai0*b[4] + ai1*b[5] + ai2*b[6] + ai3*b[7];
      o[i+8]  = ai0*b[8] + ai1*b[9] + ai2*b[10] + ai3*b[11];
      o[i+12] = ai0*b[12] + ai1*b[13] + ai2*b[14] + ai3*b[15];
    }
    return o;
  },
  trs: function(px, py, pz, rx, ry, rz, sx, sy, sz) {
    var cx = Math.cos(rx), sxr = Math.sin(rx);
    var cy = Math.cos(ry), syr = Math.sin(ry);
    var cz = Math.cos(rz), szr = Math.sin(rz);
    // Rotation Y * X * Z scaled
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

/* ==================== 2. TRÌNH BIÊN DỊCH SHADER PIXAR / GHIBLI ==================== */
function createCafeWebglRenderer(canvas) {
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
    'uniform vec3 uSunDir;',
    'uniform vec3 uLight0Pos;', // Tungsten Counter (Warm Amber)
    'uniform vec3 uLight1Pos;', // Staircase Sconce (Deep Amber)
    'uniform vec3 uLight2Pos;', // Floor 2 Warm Lamp
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
    '  // Ambient Pixar hemisphere: golden bounce sky vs warm olive ground shadow',
    '  float hemi = N.y * 0.5 + 0.5;',
    '  vec3 amb = mix(vec3(0.24, 0.23, 0.16), vec3(0.56, 0.52, 0.40), hemi);',
    '  // Golden late-afternoon directional sunlight',
    '  vec3 Lsun = normalize(uSunDir);',
    '  float wrapSun = clamp(dot(N, Lsun) * 0.58 + 0.42, 0.0, 1.0);',
    '  // Extra warm sunlight outdoors & near balcony windows (Z < 2.5 or Y > 2.6)',
    '  float outdoorBoost = smoothstep(4.5, -1.5, vWorldPos.z) * smoothstep(2.0, 3.6, vWorldPos.y + 1.2);',
    '  vec3 sunCol = vec3(1.05, 0.86, 0.55) * (0.42 + 0.55 * outdoorBoost);',
    '  vec3 diff = amb * 0.72 + sunCol * wrapSun;',
    '  // 3 Warm Tungsten Point Lights (2700K)',
    '  vec3 d0 = uLight0Pos - vWorldPos; float att0 = 1.0 / (1.0 + 0.09 * dot(d0, d0));',
    '  float nd0 = max(dot(N, normalize(d0)), 0.0) * 0.75 + 0.25;',
    '  diff += vec3(1.15, 0.74, 0.32) * nd0 * att0 * 0.95;',
    '  vec3 d1 = uLight1Pos - vWorldPos; float att1 = 1.0 / (1.0 + 0.12 * dot(d1, d1));',
    '  float nd1 = max(dot(N, normalize(d1)), 0.0) * 0.75 + 0.25;',
    '  diff += vec3(1.10, 0.66, 0.24) * nd1 * att1 * 0.85;',
    '  vec3 d2 = uLight2Pos - vWorldPos; float att2 = 1.0 / (1.0 + 0.09 * dot(d2, d2));',
    '  float nd2 = max(dot(N, normalize(d2)), 0.0) * 0.75 + 0.25;',
    '  diff += vec3(1.08, 0.78, 0.40) * nd2 * att2 * 0.90;',
    '  // Specular highlights + Pixar soft fresnel rim light',
    '  vec3 H = normalize(Lsun + V);',
    '  float spec = pow(max(dot(N, H), 0.0), uSpecPow) * 0.26;',
    '  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.8) * uRimStrength;',
    '  vec3 col = base * diff + vec3(1.0, 0.92, 0.72) * (spec + fresnel) + base * uEmissive;',
    '  // Atmospheric warm cinema depth haze',
    '  float camDist = length(uCamPos - vWorldPos);',
    '  float fogAmt = clamp((camDist - 8.5) / 26.0, 0.0, 0.55);',
    '  vec3 fogCol = mix(vec3(0.28, 0.26, 0.18), vec3(0.92, 0.78, 0.52), outdoorBoost);',
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

  var loc = {
    aPos: gl.getAttribLocation(prog, 'aPos'),
    aNorm: gl.getAttribLocation(prog, 'aNorm'),
    aUv: gl.getAttribLocation(prog, 'aUv'),
    uProj: gl.getUniformLocation(prog, 'uProj'),
    uView: gl.getUniformLocation(prog, 'uView'),
    uModel: gl.getUniformLocation(prog, 'uModel'),
    uTex: gl.getUniformLocation(prog, 'uTex'),
    uUvScale: gl.getUniformLocation(prog, 'uUvScale'),
    uUvOffset: gl.getUniformLocation(prog, 'uUvOffset'),
    uTint: gl.getUniformLocation(prog, 'uTint'),
    uCamPos: gl.getUniformLocation(prog, 'uCamPos'),
    uEmissive: gl.getUniformLocation(prog, 'uEmissive'),
    uSpecPow: gl.getUniformLocation(prog, 'uSpecPow'),
    uRimStrength: gl.getUniformLocation(prog, 'uRimStrength'),
    uSunDir: gl.getUniformLocation(prog, 'uSunDir'),
    uLight0Pos: gl.getUniformLocation(prog, 'uLight0Pos'),
    uLight1Pos: gl.getUniformLocation(prog, 'uLight1Pos'),
    uLight2Pos: gl.getUniformLocation(prog, 'uLight2Pos')
  };

  function uploadMesh(verts, norms, uvs, idx) {
    var vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    var nb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, nb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(norms), gl.STATIC_DRAW);
    var ub = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, ub); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
    var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    return { vb: vb, nb: nb, ub: ub, ib: ib, count: idx.length };
  }

  /* ---- 3. BỘ SINH HÌNH KHỐI 3D ĐA GIÁC MƯỢT ---- */
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
    // Top & bottom caps
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
        p.push(x, y, z);
        n.push(cp * ct, sp, cp * st);
        u.push(i / segR, j / segT);
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

  var meshes = {
    box: makeBox(),
    quad: makeQuad(),
    sphere: makeSphere(12, 16),
    cyl: makeCylinder(14, 1.0),
    cup: makeCylinder(14, 1.28),
    cone: makeCylinder(14, 0.28),
    torus: makeTorus(0.45, 0.08, 16, 8)
  };

  var textures = {};
  function registerTextureCanvas(key, cnv, repeat, nearest) {
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

  // Fallback white 2x2 texture
  var wc = document.createElement('canvas'); wc.width = 2; wc.height = 2;
  var wctx = wc.getContext('2d'); wctx.fillStyle = '#FFFFFF'; wctx.fillRect(0,0,2,2);
  registerTextureCanvas('white', wc, true);

  var currentProj = M4.ident();
  var currentView = M4.ident();
  var activeMesh = null;
  var activeTex = null;

  function beginFrame(W, H, cam) {
    gl.viewport(0, 0, W, H);
    gl.clearColor(0.55, 0.44, 0.28, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.useProgram(prog);

    currentProj = M4.perspective(0.76, W / Math.max(1, H), 0.14, 65.0);
    currentView = M4.lookAt(
      cam.pos.x, cam.pos.y, cam.pos.z,
      cam.lookX, cam.lookY, cam.lookZ
    );
    gl.uniformMatrix4fv(loc.uProj, false, currentProj);
    gl.uniformMatrix4fv(loc.uView, false, currentView);
    gl.uniform3f(loc.uCamPos, cam.pos.x, cam.pos.y, cam.pos.z);
    gl.uniform3f(loc.uSunDir, 0.36, 0.68, -0.63);
    gl.uniform3f(loc.uLight0Pos, 2.2, 2.55, 6.2);  // Counter Tungsten
    gl.uniform3f(loc.uLight1Pos, -3.5, 2.6, 12.6); // Staircase Amber Sconce
    gl.uniform3f(loc.uLight2Pos, -0.4, 5.9, 5.2);  // Floor 2 Warm Lamp
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
      gl.disable(gl.BLEND);
      gl.depthMask(true);
    } else if (mode === 'add') {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.depthMask(false);
    } else {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(false);
    }
  }

  return {
    gl: gl,
    registerTextureCanvas: registerTextureCanvas,
    beginFrame: beginFrame,
    drawMesh: drawMesh,
    setBlend: setBlend
  };
}
`;
}
