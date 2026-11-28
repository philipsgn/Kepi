/**
 * Sân Vận Động Trống Đồng FIFA World Cup — Senior Design Art 3D (Quyết định 262)
 * - Loại bỏ hoàn toàn khuôn viên/đường phố ngoài trời (`0` exterior street).
 * - Khởi đầu ngay bên trong Sảnh Đầu Đường Hầm dài 44m gồm 2 đoạn liên hoàn:
 *   1. `fan_concourse` (Đường Hầm Cổ Động Viên, Z ∈ [0, 20.5], Y = 0): Xuất phát `(0, 0, 2.2)` sau Cổng Kính Turnstile QR (`Z = 0`),
 *      khung vòm thép Trống Đồng lặp nhịp, Quầy Nước Stadium Bar (Trái) & Quầy Lưu Niệm Fan Shop (Phải), tranh LED hào khí VN.
 *   2. Ngã Tư Phân Luồng (`Z ∈ [16.5, 20.5]`): Rẽ Trái/Phải lên **2 Cầu Thang Vomitory 12 Bậc (`Z: 19.8 → 25.6`, `Y: 0 → 3.4`)** có tay vịn inox;
 *      hoặc đi thẳng qua Cổng An Ninh vào **Đoạn 2 — Đường Hầm Cầu Thủ (`player_tunnel`, `Z ∈ [20.5, 44.0]`)**.
 *   3. Hai Nhánh Phòng Thay Đồ 3D VIP World Cup (`Z ∈ [24.0, 35.5]`, `Y = 0`):
 *      - `home_locker` (Trái `X ∈ [-14.5, -2.4]`): 10 khoang tủ gỗ-đỏ có áo đấu 3D treo móc, hộp đèn tên, ghế da, hốc giày, đèn vòng trần Trống Đồng, Cryo & giường y tế.
 *      - `away_locker` (Phải `X ∈ [2.4, 14.5]`): Đối xứng 100% FIFA xanh-bạc cho Đội Khách.
 *   4. `stands_south` (`X ∈ [-24, 24], Z ∈ [25.6, 39.2], Y = 3.4..4.8`): 4 tầng bậc bê tông viền vàng + 64 ghế gập FIFA Ergonomic đúc khít
 *      phối màu Cờ Đỏ Sao Vàng nhìn xuống **Sân Cỏ 11v11 (`X ∈ [-22, 22], Z ∈ [52, 82], Y = 0.8`)** & Mái Vòm Giàn Thép Trống Đồng!
 *   5. `pitchside` (`X ∈ [-20, 20], Z ∈ [44.0, 49.5], Y = 0.8`): 2 Cabin Kỹ Thuật kính cong + 6 ghế Recaro mỗi bên, rào LED An Ninh `Z = 49.8`.
 */
export function buildStadiumTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. ĐỒ THỊ KHÔNG GIAN SVĐ TRỐNG ĐỒNG 44M TUNNEL & GRANDSTAND (STADIUM_NAV_GRAPH) ==================== */
var STADIUM_NAV_GRAPH = {
  zones: [
    { id: 'fan_concourse',  minX: -3.4,  maxX: 3.4,  minZ: 0.0,  maxZ: 20.5, floorY: 0.0 },
    { id: 'vom_left_f',     minX: -6.4,  maxX: -3.4, minZ: 17.0, maxZ: 19.8, floorY: 0.0 },
    { id: 'vom_right_f',    minX: 3.4,   maxX: 6.4,  minZ: 17.0, maxZ: 19.8, floorY: 0.0 },
    { id: 'player_tunnel',  minX: -2.4,  maxX: 2.4,  minZ: 20.5, maxZ: 44.0, floorY: 0.0 },
    { id: 'home_locker',    minX: -14.5, maxX: -2.4, minZ: 24.0, maxZ: 35.5, floorY: 0.0 },
    { id: 'away_locker',    minX: 2.4,   maxX: 14.5, minZ: 24.0, maxZ: 35.5, floorY: 0.0 },
    { id: 'pitchside',      minX: -20.0, maxX: 20.0, minZ: 44.0, maxZ: 49.5, floorY: 0.8 },
    { id: 'stands_south',   minX: -22.0, maxX: 22.0, minZ: 25.6, maxZ: 39.0, floorY: 3.4 },
    { id: 'trophy_vip',     minX: 7.0,   maxX: 16.5, minZ: 13.5, maxZ: 25.6, floorY: 3.4 }
  ],
  ramps: [
    { id: 'tunnel_ramp', axis: 'z', minX: -2.4, maxX: 2.4,  zStart: 37.0, zEnd: 44.0, yStart: 0.0, yEnd: 0.8, maxCurY: 2.1 },
    { id: 'left_stair',  axis: 'z', minX: -6.2, maxX: -3.8, zStart: 19.8, zEnd: 25.6, yStart: 0.0, yEnd: 3.4 },
    { id: 'right_stair', axis: 'z', minX: 3.8,  maxX: 6.2,  zStart: 19.8, zEnd: 25.6, yStart: 0.0, yEnd: 3.4 }
  ],
  edges: [
    {
      from: 'fan_concourse', to: 'vom_left_f',
      waypointsForward: [{ x: -4.2, y: 0.0, z: 18.4 }],
      waypointsBackward: [{ x: -2.2, y: 0.0, z: 18.4 }]
    },
    {
      from: 'fan_concourse', to: 'vom_right_f',
      waypointsForward: [{ x: 4.2, y: 0.0, z: 18.4 }],
      waypointsBackward: [{ x: 2.2, y: 0.0, z: 18.4 }]
    },
    {
      from: 'vom_left_f', to: 'stands_south',
      waypointsForward: [
        { x: -5.0, y: 0.0, z: 19.6 },
        { x: -5.0, y: 3.4, z: 25.8 },
        { x: -5.0, y: 3.4, z: 37.8 }
      ],
      waypointsBackward: [
        { x: -5.0, y: 3.4, z: 37.8 },
        { x: -5.0, y: 3.4, z: 25.8 },
        { x: -5.0, y: 0.0, z: 19.6 }
      ]
    },
    {
      from: 'vom_right_f', to: 'stands_south',
      waypointsForward: [
        { x: 5.0, y: 0.0, z: 19.6 },
        { x: 5.0, y: 3.4, z: 25.8 },
        { x: 5.0, y: 3.4, z: 37.8 }
      ],
      waypointsBackward: [
        { x: 5.0, y: 3.4, z: 37.8 },
        { x: 5.0, y: 3.4, z: 25.8 },
        { x: 5.0, y: 0.0, z: 19.6 }
      ]
    },
    {
      from: 'stands_south', to: 'trophy_vip',
      waypointsForward: [{ x: 11.2, y: 3.4, z: 24.8 }],
      waypointsBackward: [{ x: 11.2, y: 3.4, z: 26.8 }]
    },
    {
      from: 'fan_concourse', to: 'player_tunnel',
      waypointsForward: [{ x: 0.0, y: 0.0, z: 21.0 }],
      waypointsBackward: [{ x: 0.0, y: 0.0, z: 19.8 }]
    },
    {
      from: 'player_tunnel', to: 'home_locker',
      waypointsForward: [{ x: -3.2, y: 0.0, z: 30.0 }],
      waypointsBackward: [{ x: -1.6, y: 0.0, z: 30.0 }]
    },
    {
      from: 'player_tunnel', to: 'away_locker',
      waypointsForward: [{ x: 3.2, y: 0.0, z: 30.0 }],
      waypointsBackward: [{ x: 1.6, y: 0.0, z: 30.0 }]
    },
    {
      from: 'player_tunnel', to: 'pitchside',
      waypointsForward: [{ x: 0.0, y: 0.8, z: 44.3 }],
      waypointsBackward: [{ x: 0.0, y: 0.8, z: 43.6 }]
    }
  ],
  outerBounds: { minX: -26.0, maxX: 26.0, minZ: -0.5, maxZ: 88.0, minY: 0.65, maxY: 18.0 },
  wallMargin: 0.36,
  dividerWalls: [
    // Cửa kính Turnstile hậu đường hầm Z = 0
    { axis: 'z', pos: 0.0, minSpan: -3.4, maxSpan: 3.4, minY: 0.0, maxY: 4.0, openings: [] },
    // Vách Đoạn 1 Đường Hầm CĐV (X = ±3.4, Z = 0..20.5): mở lối rẽ 2 Cầu thang Vomitory Z ∈ [17.0, 19.8]
    { axis: 'x', pos: -3.4, minSpan: 0.0, maxSpan: 20.5, minY: 0.0, maxY: 3.8, openings: [{ a1: 17.0, a2: 19.8, y1: 0.0, y2: 3.3 }] },
    { axis: 'x', pos: 3.4,  minSpan: 0.0, maxSpan: 20.5, minY: 0.0, maxY: 3.8, openings: [{ a1: 17.0, a2: 19.8, y1: 0.0, y2: 3.3 }] },
    // Cổng An Ninh ngăn Đoạn 1 ↔ Đoạn 2 tại Z = 20.5 (mở lối giữa X ∈ [-2.2, 2.2])
    { axis: 'z', pos: 20.5, minSpan: -3.4, maxSpan: 3.4, minY: 0.0, maxY: 3.8, openings: [{ a1: -2.2, a2: 2.2, y1: 0.0, y2: 3.3 }] },
    // Vách Đoạn 2 Đường Hầm Cầu Thủ (X = ±2.4, maxY = 3.25 nằm dưới sàn Khán Đài Nam): mở 2 cửa Phòng Thay Đồ Z ∈ [27.5, 32.5]
    { axis: 'x', pos: -2.4, minSpan: 20.5, maxSpan: 44.0, minY: 0.0, maxY: 3.25, openings: [{ a1: 27.5, a2: 32.5, y1: 0.0, y2: 3.1 }] },
    { axis: 'x', pos: 2.4,  minSpan: 20.5, maxSpan: 44.0, minY: 0.0, maxY: 3.25, openings: [{ a1: 27.5, a2: 32.5, y1: 0.0, y2: 3.1 }] },
    // Bao ngoài 2 Phòng Thay Đồ (Z = 24.0..35.5, X = ±14.5)
    { axis: 'x', pos: -14.5, minSpan: 24.0, maxSpan: 35.5, minY: 0.0, maxY: 3.25, openings: [] },
    { axis: 'z', pos: 24.0,  minSpan: -14.5, maxSpan: -2.4, minY: 0.0, maxY: 3.25, openings: [] },
    { axis: 'z', pos: 35.5,  minSpan: -14.5, maxSpan: -2.4, minY: 0.0, maxY: 3.25, openings: [] },
    { axis: 'x', pos: 14.5,  minSpan: 24.0, maxSpan: 35.5, minY: 0.0, maxY: 3.25, openings: [] },
    { axis: 'z', pos: 24.0,  minSpan: 2.4,  maxSpan: 14.5, minY: 0.0, maxY: 3.25, openings: [] },
    { axis: 'z', pos: 35.5,  minSpan: 2.4,  maxSpan: 14.5, minY: 0.0, maxY: 3.25, openings: [] },
    // Rào An Ninh sát đường biên Pitchside (Z = 49.5) + 2 biên piste (X = ±20.0)
    { axis: 'z', pos: 49.5,  minSpan: -20.0, maxSpan: 20.0, minY: 0.8, maxY: 3.0, openings: [] },
    { axis: 'x', pos: -20.0, minSpan: 44.0, maxSpan: 49.5, minY: 0.8, maxY: 3.0, openings: [] },
    { axis: 'x', pos: 20.0,  minSpan: 44.0, maxSpan: 49.5, minY: 0.8, maxY: 3.0, openings: [] },
    // Lan can kính trước Khán Đài Nam (Z = 39.2) & Tường sau hành lang Nam (Z = 25.6 mở cửa VIP)
    { axis: 'z', pos: 39.2, minSpan: -22.0, maxSpan: 22.0, minY: 3.4, maxY: 6.5, openings: [] },
    { axis: 'z', pos: 25.6, minSpan: -22.0, maxSpan: 22.0, minY: 3.4, maxY: 6.5, openings: [{ a1: 7.2, a2: 16.2, y1: 3.4, y2: 6.5 }] },
    { axis: 'x', pos: -22.0, minSpan: 25.6, maxSpan: 39.2, minY: 3.4, maxY: 6.5, openings: [] },
    { axis: 'x', pos: 22.0,  minSpan: 25.6, maxSpan: 39.2, minY: 3.4, maxY: 6.5, openings: [] }
  ],
  slabs: [
    // Trần Đoạn 1 Đường Hầm CĐV Y = 3.9
    { minX: -3.5, maxX: 3.5, minZ: 0.0, maxZ: 20.5, yLow: 3.75, yHigh: 4.02 },
    // Trần Hầm Cầu Thủ & 2 Phòng Thay Đồ Y = 3.8 (mở 2 lỗ thang Vomitory & mở ra sân sau Z = 44)
    { minX: -14.5, maxX: 14.5, minZ: 24.0, maxZ: 36.5, yLow: 3.28, yHigh: 3.48 },
    // Sàn Khán Đài Nam Y = 3.4
    { minX: -22.0, maxX: 22.0, minZ: 25.6, maxZ: 39.2, yLow: 3.28, yHigh: 3.48 },
    // Sảnh Cúp Vàng VIP Y = 3.4
    { minX: 7.0,   maxX: 16.5, minZ: 13.5, maxZ: 25.6, yLow: 3.28, yHigh: 3.48 }
  ],
  camBoxes: [
    { x1: 9.95, y1: 3.4, z1: 17.6, x2: 12.45, y2: 5.4, z2: 19.6 }
  ]
};

function getStadiumSurfaceY(x, z, curY) {
  if (typeof getNavGraphSurfaceY === 'function') {
    return getNavGraphSurfaceY(STADIUM_NAV_GRAPH, x, z, curY);
  }
  if (x >= -6.2 && x <= -3.8 && z >= 19.8 && z <= 25.6) {
    return Math.max(0, Math.min(1, (z - 19.8) / 5.8)) * 3.4;
  }
  if (x >= 3.8 && x <= 6.2 && z >= 19.8 && z <= 25.6) {
    return Math.max(0, Math.min(1, (z - 19.8) / 5.8)) * 3.4;
  }
  if (x >= -2.4 && x <= 2.4 && z >= 37.0 && z <= 44.0 && (curY || 0) <= 2.1) {
    return Math.max(0, Math.min(1, (z - 37.0) / 7.0)) * 0.8;
  }
  if ((curY || 0) >= 2.2) return 3.4;
  if (z >= 44.0) return 0.8;
  return 0.0;
}

function getStadiumZoneAt(x, y, z) {
  if ((y || 0) >= 2.2) {
    return (z < 25.6 && x >= 7.0) ? 'trophy_vip' : 'stands_south';
  }
  if (z >= 44.0) return 'pitchside';
  if (z >= 20.5) {
    if (x < -2.4 && z >= 24.0 && z <= 35.5) return 'home_locker';
    if (x > 2.4 && z >= 24.0 && z <= 35.5) return 'away_locker';
    return 'player_tunnel';
  }
  return 'fan_concourse';
}

function createStadiumStools() {
  // 6 ghế VIP trống ngay Hàng 1 Khán Đài Nam (Z = 37.2, Y = 3.4) nhìn thẳng xuống sân cỏ 11v11
  var stools = [];
  var xs = [-1.8, -1.08, -0.36, 0.36, 1.08, 1.8];
  for (var i = 0; i < xs.length; i++) {
    stools.push({ id: i, x: xs[i], y: 3.4, z: 37.2, lookX: 0.0, lookZ: 67.0 });
  }
  return stools;
}

function createStadiumNpcs() {
  var npcs = [];
  // 1. 11 Cầu Thủ ĐT Việt Nam (1 GK + 10 Cầu thủ Đỏ Sao Vàng trên sân cỏ X ∈ [-21, 21], Z ∈ [52.5, 81.5], Y = 0.8)
  npcs.push({ x: -20.6, y: 0.8, z: 67.0, vx: 0.0, vz: 1.5, minX: -20.9, maxX: -20.3, minZ: 64.0, maxZ: 70.0, yaw: Math.PI * 0.5, role: 'gk', shirt: '#16A34A', hair: '#1C1917', moving: true, seated: false, phase: 0.2, carryProp: 'none' });
  var vnForm = [
    [-15.0, 56.5], [-14.2, 63.5], [-14.2, 70.5], [-15.0, 77.5],
    [-6.5,  58.5], [-4.5,  67.0], [-6.5,  75.5],
    [4.0,   57.5], [6.8,   67.0], [4.0,   76.5]
  ];
  for (var vi = 0; vi < vnForm.length; vi++) {
    var vp = vnForm[vi];
    npcs.push({
      x: vp[0], y: 0.8, z: vp[1],
      vx: (vi % 2 === 0 ? 1.7 : -1.5), vz: (vi % 3 === 0 ? 1.3 : -1.2),
      minX: Math.max(-19.0, vp[0] - 5.2), maxX: Math.min(18.5, vp[0] + 5.8),
      minZ: Math.max(53.2, vp[1] - 4.0),  maxZ: Math.min(80.8, vp[1] + 4.0),
      yaw: Math.PI * 0.5,
      role: vi === 8 ? 'vn_captain' : 'vn_player',
      shirt: '#DC2626', hair: vi % 2 === 0 ? '#1C1917' : '#292524',
      moving: true, seated: false, phase: vi * 0.45, carryProp: 'none'
    });
  }

  // 2. 11 Cầu Thủ Đội Khách (1 GK + 10 Cầu thủ Xanh Dương)
  npcs.push({ x: 20.6, y: 0.8, z: 67.0, vx: 0.0, vz: -1.5, minX: 20.3, maxX: 20.9, minZ: 64.0, maxZ: 70.0, yaw: -Math.PI * 0.5, role: 'gk', shirt: '#EAB308', hair: '#451A03', moving: true, seated: false, phase: 0.7, carryProp: 'none' });
  var awForm = [
    [15.0, 56.5], [14.2, 63.5], [14.2, 70.5], [15.0, 77.5],
    [6.5,  58.5], [4.5,  67.0], [6.5,  75.5],
    [-4.0, 57.5], [-6.8, 67.0], [-4.0, 76.5]
  ];
  for (var ai = 0; ai < awForm.length; ai++) {
    var ap = awForm[ai];
    npcs.push({
      x: ap[0], y: 0.8, z: ap[1],
      vx: (ai % 2 === 0 ? -1.6 : 1.5), vz: (ai % 3 === 0 ? -1.3 : 1.2),
      minX: Math.max(-18.5, ap[0] - 5.8), maxX: Math.min(19.0, ap[0] + 5.2),
      minZ: Math.max(53.2, ap[1] - 4.0),  maxZ: Math.min(80.8, ap[1] + 4.0),
      yaw: -Math.PI * 0.5,
      role: 'away_player',
      shirt: '#2563EB', hair: ai % 2 === 0 ? '#451A03' : '#1E293B',
      moving: true, seated: false, phase: ai * 0.52, carryProp: 'none'
    });
  }

  // 3. Đủ 3 Trọng Tài (1 Trọng tài chính + 2 Trọng tài biên cầm cờ)
  npcs.push({ x: 0.0, y: 0.8, z: 67.0, vx: 1.1, vz: 0.8, minX: -11.0, maxX: 11.0, minZ: 56.0, maxZ: 78.0, yaw: 0.4, role: 'referee', shirt: '#0F172A', hair: '#111827', moving: true, seated: false, phase: 0.3, carryProp: 'none' });
  npcs.push({ x: -5.0, y: 0.8, z: 51.4, vx: 1.4, vz: 0.0, minX: -20.5, maxX: 0.5, minZ: 51.3, maxZ: 51.5, yaw: 0.0, role: 'linesman', shirt: '#0F172A', hair: '#1C1917', moving: true, seated: false, phase: 1.1, carryProp: 'flag' });
  npcs.push({ x: 5.0,  y: 0.8, z: 82.6, vx: -1.4, vz: 0.0, minX: -0.5, maxX: 20.5, minZ: 82.5, maxZ: 82.7, yaw: Math.PI, role: 'linesman', shirt: '#0F172A', hair: '#292524', moving: true, seated: false, phase: 1.9, carryProp: 'flag' });

  // 4. Hai Cabin Kỹ Thuật Đầy Đủ (2 HLV trưởng chỉ đạo + 8 Cầu thủ dự bị ngồi ghế Recaro ngoài đường pitch)
  npcs.push({ x: -4.2, y: 0.8, z: 47.8, yaw: 0.1,  role: 'vn_coach',   shirt: '#1E3A8A', hair: '#1C1917', moving: false, seated: false, phase: 0.4, carryProp: 'board' });
  npcs.push({ x:  4.2, y: 0.8, z: 47.8, yaw: -0.1, role: 'away_coach', shirt: '#0F172A', hair: '#451A03', moving: false, seated: false, phase: 0.9, carryProp: 'board' });
  for (var sh = 0; sh < 4; sh++) {
    npcs.push({ x: -10.8 + sh * 1.45, y: 0.8, z: 46.8, yaw: 0.0, role: 'sub_home', shirt: '#F97316', hair: '#1C1917', moving: false, seated: true, phase: sh * 0.6, carryProp: 'none' });
    npcs.push({ x:   6.4 + sh * 1.45, y: 0.8, z: 46.8, yaw: 0.0, role: 'sub_away', shirt: '#84CC16', hair: '#292524', moving: false, seated: true, phase: sh * 0.7, carryProp: 'none' });
  }

  // 5. Lực Lượng An Ninh Áo Phản Quang (Cổng Soát Vé, Cổng Hầm Cầu Thủ, 2 Phòng Thay Đồ & Dàn An Ninh Biên Sân)
  var stewards = [
    [-2.5, 0.0, 1.2, 0.0], [2.5, 0.0, 1.2, 0.0],
    [-2.5, 0.0, 20.2, Math.PI], [2.5, 0.0, 20.2, Math.PI],
    [-2.8, 0.0, 28.0, Math.PI * 0.5], [2.8, 0.0, 28.0, -Math.PI * 0.5],
    [-16.0, 0.8, 49.2, Math.PI], [-9.6, 0.8, 49.2, Math.PI], [-3.2, 0.8, 49.2, Math.PI],
    [3.2, 0.8, 49.2, Math.PI], [9.6, 0.8, 49.2, Math.PI], [16.0, 0.8, 49.2, Math.PI]
  ];
  for (var si = 0; si < stewards.length; si++) {
    var stw = stewards[si];
    npcs.push({
      x: stw[0], y: stw[1], z: stw[2], yaw: stw[3],
      role: 'steward', shirt: '#FACC15', hair: '#1E293B',
      moving: false, seated: false, phase: si * 0.35, carryProp: 'none'
    });
  }

  // 6. Nhân Viên Quầy Nước & Fan Shop + Hậu Trường 2 Phòng Thay Đồ + Báo Chí
  npcs.push({ x: -2.6, y: 0.0, z: 7.8,  yaw: Math.PI * 0.5,  role: 'barista', shirt: '#0EA5E9', hair: '#1C1917', moving: false, seated: false, phase: 0.2, carryProp: 'coffee' });
  npcs.push({ x:  2.6, y: 0.0, z: 7.8,  yaw: -Math.PI * 0.5, role: 'adidas_staff', shirt: '#DC2626', hair: '#292524', moving: false, seated: false, phase: 0.8, carryProp: 'none' });
  npcs.push({ x: -8.5, y: 0.0, z: 29.8, yaw: 0.4,  role: 'vn_player',   shirt: '#DC2626', hair: '#1C1917', moving: false, seated: false, phase: 0.3, carryProp: 'ball' });
  npcs.push({ x:  8.5, y: 0.0, z: 29.8, yaw: -0.4, role: 'away_player', shirt: '#2563EB', hair: '#451A03', moving: false, seated: false, phase: 1.1, carryProp: 'none' });
  npcs.push({ x: 11.2, y: 3.4, z: 21.8, yaw: 0.0,  role: 'press', shirt: '#475569', hair: '#1C1917', moving: false, seated: false, phase: 0.8, carryProp: 'camera' });
  npcs.push({ x: -14.5,y: 0.8, z: 48.8, yaw: 0.2,  role: 'press', shirt: '#0F766E', hair: '#292524', moving: false, seated: false, phase: 1.5, carryProp: 'camera' });

  // 7. Biển Cổ Động Viên Ngồi Đúng Trong Các Dãy Ghế Ergonomic (Hàng 1, 2, 3 Khán Đài Nam + Bắc + Tây + Đông)
  var fanCols = ['#DC2626', '#FACC15', '#E11D48', '#FFFFFF'];
  // Hàng 1 cánh Trái/Phải ngồi kín cạnh cụm 6 ghế VIP trống của chú Heo
  var r1FanXs = [-16.2, -14.8, -13.4, -12.0, -10.6, -9.2, -7.8, 7.8, 9.2, 10.6, 12.0, 13.4, 14.8, 16.2];
  for (var f1 = 0; f1 < r1FanXs.length; f1++) {
    npcs.push({
      x: r1FanXs[f1], y: 3.4, z: 37.2, yaw: 0.0,
      role: 'vn_fan', shirt: fanCols[f1 % fanCols.length], hair: '#1C1917',
      moving: false, seated: true, phase: f1 * 0.35,
      carryProp: (f1 % 3 === 0) ? 'vn_flag' : 'none'
    });
  }
  // Hàng 2 (Y = 3.85, Z = 34.8) & Hàng 3 (Y = 4.30, Z = 32.8) ngồi kín sau lưng
  for (var f2 = 0; f2 < 10; f2++) {
    var x2 = -15.6 + f2 * 3.45;
    if (Math.abs(Math.abs(x2) - 5.0) < 1.1) x2 += (x2 < 0 ? -1.1 : 1.1);
    npcs.push({
      x: x2, y: 3.85, z: 34.8, yaw: 0.0,
      role: 'vn_fan', shirt: fanCols[(f2 + 1) % fanCols.length], hair: '#292524',
      moving: false, seated: true, phase: f2 * 0.45,
      carryProp: (f2 % 2 === 0) ? 'vn_flag' : 'none'
    });
    npcs.push({
      x: x2, y: 4.30, z: 32.8, yaw: 0.0,
      role: 'vn_fan', shirt: fanCols[(f2 + 2) % fanCols.length], hair: '#1C1917',
      moving: false, seated: true, phase: f2 * 0.55,
      carryProp: (f2 % 3 === 1) ? 'vn_flag' : 'none'
    });
  }
  // Khán đài Bắc, Tây, Đông
  for (var fni = 0; fni < 8; fni++) {
    npcs.push({
      x: -18.0 + fni * 5.0, y: 3.8, z: 86.0, yaw: Math.PI,
      role: 'vn_fan', shirt: fanCols[(fni + 1) % fanCols.length], hair: '#292524',
      moving: false, seated: true, phase: fni * 0.55,
      carryProp: (fni % 2 === 1) ? 'vn_flag' : 'none'
    });
  }
  for (var fwi = 0; fwi < 4; fwi++) {
    npcs.push({ x: -25.4, y: 3.8, z: 56.0 + fwi * 7.2, yaw: Math.PI * 0.5,  role: 'vn_fan', shirt: '#DC2626', hair: '#1C1917', moving: false, seated: true, phase: fwi * 0.7, carryProp: 'vn_flag' });
    npcs.push({ x:  25.4, y: 3.8, z: 56.0 + fwi * 7.2, yaw: -Math.PI * 0.5, role: 'vn_fan', shirt: '#DC2626', hair: '#292524', moving: false, seated: true, phase: fwi * 0.8, carryProp: 'vn_flag' });
  }
  return npcs;
}

function createStadiumTpsState() {
  var npcs = createStadiumNpcs();
  var stools = createStadiumStools();
  return {
    room: 'fan_concourse',
    zone: 'fan_concourse',
    pig: {
      x: 0.0, y: 0.0, z: 2.2, yaw: 0.0,
      targetX: 0.0, targetZ: 2.2,
      waypoints: [],
      walking: false, seated: false, eating: false,
      seatChairId: -1, pendingSeatId: -1, pendingAction: null,
      wearingVietnamKit: false, wearingKit: false,
      outfit: 'none', liftedTrophy: false,
      cheering: false, _stuckTimer: 0
    },
    stools: stools,
    npcs: npcs,
    ball: { x: 0.0, y: 0.94, z: 67.0, shooting: false, shootT: 0 },
    vnScore: 2,
    goalFlashUntil: 0,
    confettiUntil: 0,
    waveUntil: 0,
    rightDoorOpen: 0.45,
    exitFade: 0,
    exiting: false,
    ripples: [],
    toast: 'Chào mừng vào Đường Hầm 44m SVĐ Trống Đồng! Ghé Quầy Fan Shop, rẽ Vomitory lên Ghế Khán Đài hoặc đi tiếp qua Hầm Cầu Thủ (2 Phòng Thay Đồ) ⚽🏟️',
    toastUntil: 5.5,
    t: 0
  };
}

function clampStadiumWalkPos(st, x, z, yArg) {
  var y = typeof yArg === 'number' ? yArg : (st && st.pig ? (st.pig.y || 0) : 0);
  var nx = x, nz = z;

  // 1. Khán Đài Nam & Sảnh Cúp Vàng VIP (Y >= 2.2)
  if (y >= 2.2) {
    if (nz < 25.6 && nx >= 7.0) {
      nx = Math.max(7.35, Math.min(16.1, nx));
      nz = Math.max(13.9, Math.min(25.6, nz));
      if (nx > 9.6 && nx < 12.8 && nz > 17.3 && nz < 19.9) {
        if (Math.abs(nx - 11.2) > Math.abs(nz - 18.6)) nx = nx < 11.2 ? 9.6 : 12.8;
        else nz = nz < 18.6 ? 17.3 : 19.9;
      }
      return { x: nx, z: nz };
    }
    if (nz < 25.6 && ((nx >= -6.4 && nx <= -3.6) || (nx >= 3.6 && nx <= 6.4))) {
      var sxMid = nx < 0 ? -5.0 : 5.0;
      nx = Math.max(sxMid - 0.95, Math.min(sxMid + 0.95, nx));
      nz = Math.max(19.8, Math.min(25.8, nz));
      return { x: nx, z: nz };
    }
    nx = Math.max(-21.5, Math.min(21.5, nx));
    nz = Math.max(25.85, Math.min(38.75, nz));
    return { x: nx, z: nz };
  }

  // 2. Đường Piste Biên Sân & 2 Cabin Kỹ Thuật Kính Cong (Z >= 44.0) — Rào An Ninh Z = 49.5
  if (nz >= 44.0) {
    nx = Math.max(-19.4, Math.min(19.4, nx));
    nz = Math.max(44.05, Math.min(49.05, nz));
    var dugouts = [
      { x1: -11.8, z1: 46.0, x2: -3.4, z2: 48.2 },
      { x1:   3.4, z1: 46.0, x2: 11.8, z2: 48.2 }
    ];
    for (var di = 0; di < dugouts.length; di++) {
      var db = dugouts[di];
      if (nx > db.x1 - 0.34 && nx < db.x2 + 0.34 && nz > db.z1 - 0.34 && nz < db.z2 + 0.34) {
        var dl = Math.abs(nx - (db.x1 - 0.34)), dr = Math.abs(nx - (db.x2 + 0.34));
        var dt = Math.abs(nz - (db.z1 - 0.34)), dbot = Math.abs(nz - (db.z2 + 0.34));
        var dmMin = Math.min(dl, dr, dt, dbot);
        if (dmMin === dl) nx = db.x1 - 0.34;
        else if (dmMin === dr) nx = db.x2 + 0.34;
        else if (dmMin === dt) nz = db.z1 - 0.34;
        else nz = db.z2 + 0.34;
      }
    }
    return { x: nx, z: nz };
  }

  // 3. Đoạn 2 — Đường Hầm Cầu Thủ & 2 Nhánh Phòng Thay Đồ (Z ∈ [20.5, 44.0], Y = 0..0.8)
  if (nz >= 20.5) {
    if (nx < -2.4 && nz >= 24.0 && nz <= 35.5) {
      nx = Math.max(-12.8, Math.min(-2.5, nx));
      nz = Math.max(24.4, Math.min(34.0, nz));
      if (nx > -9.6 && nx < -7.2 && nz > 28.9 && nz < 30.7) {
        if (Math.abs(nx + 8.4) > Math.abs(nz - 29.8)) nx = nx < -8.4 ? -9.6 : -7.2;
        else nz = nz < 29.8 ? 28.9 : 30.7;
      }
      return { x: nx, z: nz };
    }
    if (nx > 2.4 && nz >= 24.0 && nz <= 35.5) {
      nx = Math.max(2.5, Math.min(12.8, nx));
      nz = Math.max(24.4, Math.min(34.0, nz));
      if (nx > 7.2 && nx < 9.6 && nz > 28.9 && nz < 30.7) {
        if (Math.abs(nx - 8.4) > Math.abs(nz - 29.8)) nx = nx < 8.4 ? 7.2 : 9.6;
        else nz = nz < 29.8 ? 28.9 : 30.7;
      }
      return { x: nx, z: nz };
    }
    nx = Math.max(-2.05, Math.min(2.05, nx));
    nz = Math.max(20.5, Math.min(44.0, nz));
    return { x: nx, z: nz };
  }

  // 4. Đoạn 1 — Đường Hầm Cổ Động Viên & Ngã Tư Vomitory (Z ∈ [0.0, 20.5])
  if (nz >= 17.0 && (nx < -3.4 || nx > 3.4)) {
    nx = nx < 0 ? Math.max(-6.1, Math.min(-3.4, nx)) : Math.max(3.4, Math.min(6.1, nx));
    nz = Math.max(17.2, Math.min(25.2, nz));
    return { x: nx, z: nz };
  }
  nx = Math.max(-2.95, Math.min(2.95, nx));
  nz = Math.max(0.55, Math.min(20.5, nz));
  if (nz >= 5.3 && nz <= 10.2) {
    if (nx < -1.85) nx = -1.85;
    if (nx > 1.85) nx = 1.85;
  }
  return { x: nx, z: nz };
}

/* ==================== 2. ĐIỀU HƯỚNG LIÊN HOÀN QUA ĐƯỜNG HẦM 44M → KHÁN ĐÀI ==================== */
function planStadiumRealtimePath(st, tx, targetFloorY, tz, extraOpts) {
  var p = st.pig;
  var eo = extraOpts || {};
  var targetKind = eo.targetKind || 'floor';
  if (targetKind !== 'tunnel_ramp' && targetFloorY >= 0.7 && targetFloorY <= 0.9 && tz < 44.0) tz = 45.2;
  p.seated = false; p.seatChairId = -1; p.eating = false; p.cheering = false;
  p.pendingSeatId = typeof eo.seatChairId === 'number' ? eo.seatChairId : -1;
  p.pendingAction = eo.pendingAction || null;

  if (targetKind === 'left_stair' || targetKind === 'right_stair' || targetKind === 'tunnel_ramp') {
    var curY = p.y || 0;
    var wps = [];
    if (targetKind === 'left_stair' || targetKind === 'right_stair') {
      var sx = targetKind === 'left_stair' ? -5.0 : 5.0;
      if (curY >= 2.2) {
        if (p.z < 25.6 && p.x >= 7.0) wps.push({ x: 11.2, y: 3.4, z: 26.8 });
        wps.push({ x: sx, y: 3.4, z: 25.8 });
      } else {
        if (p.z >= 44.0) wps.push({ x: 0.0, y: 0.8, z: 43.6 });
        if (p.x < -2.4 && p.z >= 24.0 && p.z <= 35.5) wps.push({ x: -1.6, y: 0.0, z: 30.0 });
        if (p.x > 2.4 && p.z >= 24.0 && p.z <= 35.5) wps.push({ x: 1.6, y: 0.0, z: 30.0 });
        if (p.z > 20.5) wps.push({ x: 0.0, y: 0.0, z: 19.8 });
        var onVomNow = (Math.abs(Math.abs(p.x) - 5.0) <= 1.2 && p.z >= 19.8 && p.z <= 25.6 && curY > 0.15 && curY < 3.25);
        if (!onVomNow) {
          wps.push({ x: sx * 0.84, y: 0.0, z: 18.4 });
          wps.push({ x: sx, y: 0.0, z: 19.6 });
        }
      }
    } else {
      if (curY >= 2.2) {
        var dxExit = p.x < 0 ? -5.0 : 5.0;
        wps.push({ x: dxExit, y: 3.4, z: 25.8 });
        wps.push({ x: dxExit, y: 0.0, z: 19.6 });
        wps.push({ x: dxExit * 0.44, y: 0.0, z: 18.4 });
        wps.push({ x: 0.0, y: 0.0, z: 21.0 });
      } else if (p.z < 20.5) {
        wps.push({ x: 0.0, y: 0.0, z: 21.0 });
      }
    }
    wps.push({ x: tx, y: targetFloorY, z: tz });
    p.waypoints = wps;
    p.targetX = wps[0].x; p.targetZ = wps[0].z;
    p.walking = true;
    return;
  }

  if (typeof planNavGraphRealtimePath === 'function') {
    var onAnyStair = (Math.abs(Math.abs(p.x) - 5.0) <= 1.25 && p.z > 19.9 && p.z < 25.5 && (p.y || 0) > 0.15 && (p.y || 0) < 3.25);
    planNavGraphRealtimePath(STADIUM_NAV_GRAPH, st, tx, targetFloorY, tz, eo);
    if (onAnyStair && p.waypoints && p.waypoints.length > 1) {
      if (targetFloorY >= 2.2 && p.waypoints[0].z < 20.2) p.waypoints.shift();
      else if (targetFloorY < 1.5 && p.waypoints[0].z > 25.2) {
        while (p.waypoints.length > 1 && p.waypoints[0].y >= 3.0) p.waypoints.shift();
      }
      if (p.waypoints.length > 0) {
        p.targetX = p.waypoints[0].x;
        p.targetZ = p.waypoints[0].z;
      }
    }
    var lastWp = p.waypoints && p.waypoints.length ? p.waypoints[p.waypoints.length - 1] : null;
    if (lastWp) {
      var clampedEnd = clampStadiumWalkPos(st, lastWp.x, lastWp.z, lastWp.y);
      lastWp.x = clampedEnd.x;
      lastWp.z = clampedEnd.z;
    }
    return;
  }

  var cl = clampStadiumWalkPos(st, tx, tz, targetFloorY);
  p.waypoints = [{ x: cl.x, y: targetFloorY, z: cl.z }];
  p.targetX = cl.x; p.targetZ = cl.z; p.walking = true;
}

function executeStadiumAction(st, actionId) {
  if (!actionId) return;
  if (actionId === 'wear_kit') {
    st.pig.wearingVietnamKit = !st.pig.wearingVietnamKit;
    st.pig.wearingKit = st.pig.wearingVietnamKit;
    st.pig.outfit = st.pig.wearingVietnamKit ? 'vn_kit' : 'none';
    st.toast = st.pig.wearingVietnamKit ? 'Đã khoác Áo Đấu ĐT Việt Nam #10! Lên Ghế Khán Đài cổ vũ thôi! 🇻🇳👕' : 'Đã cất áo đấu ĐT Việt Nam!';
    st.toastUntil = st.t + 3.8;
  } else if (actionId === 'inspect_away_tactics') {
    st.toast = 'Phòng Thay Đồ Đội Khách (6 khoang tủ chuẩn FIFA): Đội hình 4-2-3-1 sẵn sàng! 📋';
    st.toastUntil = st.t + 3.8;
  } else if (actionId === 'cheer_wave' || actionId === 'shoot_goal') {
    st.pig.cheering = true;
    st.waveUntil = st.t + 5.0;
    st.confettiUntil = st.t + 4.8;
    if (actionId === 'shoot_goal') {
      st.ball.x = 12.0; st.ball.y = 0.96; st.ball.z = 67.0;
      st.ball.shooting = true; st.ball.shootT = 0;
      st.vnScore = (st.vnScore || 2) + 1;
      st.goalFlashUntil = st.t + 3.8;
    }
    st.toast = '🇻🇳 VIỆT NAM VÔ ĐỊCH! Hàng chục nghìn CĐV trên 4 mặt khán đài đang làm sóng người Mexican Wave! 🎉🔥';
    st.toastUntil = st.t + 4.2;
  } else if (actionId === 'lift_trophy') {
    st.pig.liftedTrophy = true;
    st.confettiUntil = st.t + 4.5;
    st.toast = 'Đã nâng Cúp Vàng Danh Giá & Trống Đồng Đông Sơn! 🏆✨';
    st.toastUntil = st.t + 4.0;
  } else if (actionId === 'exit_stadium') {
    if (!st.exiting) {
      st.exiting = true;
    }
  }
}

function stepStadiumTps(st, dt) {
  st.t += dt;
  st._lastDt = dt;
  var p = st.pig;

  // 1. Chuyển động chú Heo dọc Đường Hầm 44m, Phòng Thay Đồ, Cầu Thang Vomitory & Ghế Khán Đài
  if (!p.seated && p.walking) {
    var curWp = (p.waypoints && p.waypoints.length > 0) ? p.waypoints[0] : { x: p.targetX, z: p.targetZ };
    var dx = curWp.x - p.x, dz = curWp.z - p.z;
    var dist = Math.hypot(dx, dz);
    if (dist < 0.14) {
      p.x = curWp.x; p.z = curWp.z;
      if (p.waypoints && p.waypoints.length > 0) p.waypoints.shift();
      if (p.waypoints && p.waypoints.length > 0) {
        p.targetX = p.waypoints[0].x;
        p.targetZ = p.waypoints[0].z;
      } else {
        p.walking = false;
        if (p.pendingSeatId >= 0 && st.stools && st.stools[p.pendingSeatId]) {
          var sl = st.stools[p.pendingSeatId];
          p.x = sl.x; p.z = sl.z; p.y = 3.4;
          p.yaw = Math.atan2(sl.lookX - sl.x, sl.lookZ - sl.z);
          p.seated = true; p.seatChairId = sl.id;
          p.pendingSeatId = -1;
          st.toast = 'Đã ngồi đúng hàng ghế VIP Khán Đài! Bấm "Hô Vang Cổ Vũ" hoặc chạm sàn đứng dậy 📣⚽';
          st.toastUntil = st.t + 4.2;
        }
        if (p.pendingAction) {
          executeStadiumAction(st, p.pendingAction);
          p.pendingAction = null;
        }
      }
    } else {
      var onStairOrRamp = (Math.abs(Math.abs(p.x) - 5.0) <= 1.25 && p.z >= 19.8 && p.z <= 25.6) ||
                          (Math.abs(p.x) <= 2.4 && p.z >= 37.0 && p.z <= 44.0);
      var speedSt = onStairOrRamp ? 3.2 : 4.2;
      if (onStairOrRamp || typeof slidePigStep !== 'function') {
        var spd = Math.min(dist, speedSt * dt);
        var nx = p.x + (dx / dist) * spd;
        var nz = p.z + (dz / dist) * spd;
        if (!p.waypoints || p.waypoints.length <= 1) {
          var cl = clampStadiumWalkPos(st, nx, nz, p.y);
          nx = cl.x; nz = cl.z;
        }
        p.x = nx; p.z = nz;
        var tyaw = Math.atan2(dx, dz);
        p.yaw = (typeof tpsLerpAngle === 'function') ? tpsLerpAngle(p.yaw || 0, tyaw, Math.min(1, dt * 12)) : tyaw;
      } else {
        var stpSt = slidePigStep(p, curWp.x, curWp.z, speedSt, dt, function(cx, cz) {
          return (p.waypoints && p.waypoints.length > 1) ? { x: cx, z: cz } : clampStadiumWalkPos(st, cx, cz, p.y);
        });
        p.x = stpSt.x; p.z = stpSt.z;
        if (stpSt.stuck) {
          if (p.waypoints && p.waypoints.length > 0) p.waypoints.shift();
          if (!p.waypoints || p.waypoints.length === 0) { p.walking = false; p.pendingAction = null; }
          p._stuckTimer = 0;
        }
      }
    }
  }

  p.y = getStadiumSurfaceY(p.x, p.z, p.y);
  st.zone = getStadiumZoneAt(p.x, p.y, p.z);
  p.wearingKit = !!p.wearingVietnamKit;
  p.outfit = p.wearingVietnamKit ? 'vn_kit' : 'none';

  // 2. Trận Đấu 11v11 Sôi Động Dưới Sân + 3 Trọng Tài + Bóng Chuyền 60fps
  var activeCarrier = null;
  for (var ni = 0; ni < st.npcs.length; ni++) {
    var pl = st.npcs[ni];
    if (typeof pl.vx === 'number' && typeof pl.vz === 'number') {
      pl.x += pl.vx * dt;
      pl.z += pl.vz * dt;
      if (pl.x < pl.minX) { pl.x = pl.minX; pl.vx = Math.abs(pl.vx); }
      if (pl.x > pl.maxX) { pl.x = pl.maxX; pl.vx = -Math.abs(pl.vx); }
      if (pl.z < pl.minZ) { pl.z = pl.minZ; pl.vz = Math.abs(pl.vz); }
      if (pl.z > pl.maxZ) { pl.z = pl.maxZ; pl.vz = -Math.abs(pl.vz); }
      pl.yaw = (pl.role === 'gk')
        ? (pl.x < 0 ? Math.PI * 0.5 : -Math.PI * 0.5)
        : Math.atan2(pl.vx, pl.vz);
      if (!activeCarrier && (pl.role === 'vn_captain' || pl.role === 'vn_player')) activeCarrier = pl;
    }
  }
  var b = st.ball;
  if (b.shooting) {
    b.shootT += dt * 1.5;
    b.x += (20.8 - b.x) * Math.min(1, dt * 5.2);
    b.z += (67.0 - b.z) * Math.min(1, dt * 5.2);
    b.y = 0.94 + Math.sin(Math.min(1, b.shootT) * Math.PI) * 1.65;
    if (b.shootT >= 1.0) {
      b.shooting = false; b.shootT = 0;
      b.x = 0.0; b.y = 0.94; b.z = 67.0;
    }
  } else {
    var passPool = [5, 7, 9, 10, 16, 19, 21];
    var cIdx = passPool[Math.floor(st.t * 0.65) % passPool.length];
    var carrier = st.npcs[cIdx] || activeCarrier;
    if (carrier) {
      b.x += (carrier.x - b.x) * Math.min(1, dt * 3.8);
      b.z += (carrier.z - b.z) * Math.min(1, dt * 3.8);
      b.y = 0.94 + Math.abs(Math.sin(st.t * 9)) * 0.16;
    }
  }

  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.2);

  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== 3. RAYCAST CHỌN ĐIỂM 3D CHUẨN SENIOR DESIGN ==================== */
function raySphereStadium(ox, oy, oz, dx, dy, dz, cx, cy, cz, rad) {
  var ocx = cx - ox, ocy = cy - oy, ocz = cz - oz;
  var proj = ocx * dx + ocy * dy + ocz * dz;
  if (proj < 0.2 || proj > 60) return -1;
  var d2 = (ocx * ocx + ocy * ocy + ocz * ocz) - proj * proj;
  return d2 <= rad * rad ? proj : -1;
}

function pickStadiumTarget3D(cam, st, sx, sy) {
  var nx = (sx - cam.vw * 0.5) / (cam.focal || 400);
  var ny = (cam.vh * 0.5 - sy) / (cam.focal || 400);
  var dx = cam.F.x + cam.R.x * nx + cam.U.x * ny;
  var dy = cam.F.y + cam.R.y * nx + cam.U.y * ny;
  var dz = cam.F.z + cam.R.z * nx + cam.U.z * ny;
  var dl = Math.hypot(dx, dy, dz) || 1;
  dx /= dl; dy /= dl; dz /= dl;
  var ox = cam.pos.x, oy = cam.pos.y, oz = cam.pos.z;

  // 1. Chạm Ghế VIP Hàng 1 Khán Đài Nam (Z = 37.2, Y = 3.4) -> Tới ngồi xem trận 11v11
  if (st.stools) {
    for (var si = 0; si < st.stools.length; si++) {
      var sl = st.stools[si];
      if (raySphereStadium(ox, oy, oz, dx, dy, dz, sl.x, sl.y + 0.52, sl.z, 0.85) > 0) {
        return { kind: 'seat', seatChairId: sl.id, x: sl.x, y: 3.4, z: sl.z };
      }
    }
  }

  // 2. Chạm Bục Cúp Vàng trên Sảnh VIP -> Tới nâng Cúp
  if (raySphereStadium(ox, oy, oz, dx, dy, dz, 11.2, 4.45, 18.6, 1.35) > 0) {
    return { kind: 'vip', x: 11.2, y: 3.4, z: 16.5, pendingAction: 'lift_trophy' };
  }

  // 3. Chạm Tủ Áo Phòng Thay Đồ ĐT Việt Nam (-X) -> Mặc/cất áo ĐT Việt Nam
  if (dx < -0.02) {
    var tLk = (-13.0 - ox) / dx;
    if (tLk > 0.3 && tLk < 18) {
      var ly = oy + dy * tLk, lz = oz + dz * tLk;
      if (ly >= 0 && ly <= 3.0 && lz >= 24.4 && lz <= 35.0) {
        return { kind: 'locker', x: -11.5, y: 0.0, z: Math.max(25.2, Math.min(33.5, lz)), pendingAction: 'wear_kit' };
      }
    }
  }

  // 4. Raycast trực tiếp lên 2 Cầu Thang Vomitory & Dốc Đường Hầm (rayRampQuad)
  if (typeof rayRampQuad === 'function') {
    var leftStHit = rayRampQuad(ox, oy, oz, dx, dy, dz, {
      axis: 'z', minX: -6.2, maxX: -3.8, zStart: 19.8, zEnd: 25.6, yStart: 0.0, yEnd: 3.4
    });
    if (leftStHit) return { kind: 'left_stair', x: leftStHit.x, y: leftStHit.y, z: leftStHit.z };

    var rightStHit = rayRampQuad(ox, oy, oz, dx, dy, dz, {
      axis: 'z', minX: 3.8, maxX: 6.2, zStart: 19.8, zEnd: 25.6, yStart: 0.0, yEnd: 3.4
    });
    if (rightStHit) return { kind: 'right_stair', x: rightStHit.x, y: rightStHit.y, z: rightStHit.z };

    var tunnelHit = rayRampQuad(ox, oy, oz, dx, dy, dz, {
      axis: 'z', minX: -2.4, maxX: 2.4, zStart: 37.0, zEnd: 44.0, yStart: 0.0, yEnd: 0.8
    });
    if (tunnelHit) return { kind: 'tunnel_ramp', x: tunnelHit.x, y: tunnelHit.y, z: tunnelHit.z };
  }

  // 5. Chạm các cao độ sàn hợp lệ: Khán Đài/VIP (Y=3.4) -> Đường Piste (Y=0.8) -> Đường Hầm 44m/Phòng Thay Đồ (Y=0.0)
  if (dy < -0.02) {
    var tStand = (3.4 - oy) / dy;
    if (tStand > 0.2 && tStand < 52) {
      var sx2 = ox + dx * tStand, sz2 = oz + dz * tStand;
      var inSouthStand = (sx2 >= -22.0 && sx2 <= 22.0 && sz2 >= 25.6 && sz2 <= 39.0);
      var inVipHall    = (sx2 >= 7.0 && sx2 <= 16.5 && sz2 >= 13.5 && sz2 < 25.6);
      if (inSouthStand || inVipHall) {
        return { kind: 'floor', x: sx2, y: 3.4, z: sz2 };
      }
    }
    var tPitchside = (0.8 - oy) / dy;
    if (tPitchside > 0.2 && tPitchside < 58) {
      var px2 = ox + dx * tPitchside, pz2 = oz + dz * tPitchside;
      if (px2 >= -20.0 && px2 <= 20.0 && pz2 >= 44.0 && pz2 <= 49.5) {
        return { kind: 'floor', x: px2, y: 0.8, z: pz2 };
      }
      if ((st.pig.y || 0) < 2.2 && px2 >= -22.0 && px2 <= 22.0 && pz2 > 49.5 && pz2 <= 82.0) {
        return { kind: 'floor', x: Math.max(-18.5, Math.min(18.5, px2)), y: 0.8, z: 48.9 };
      }
    }
    var tFloor0 = (0.0 - oy) / dy;
    if (tFloor0 > 0.2 && tFloor0 < 48) {
      var fx0 = ox + dx * tFloor0, fz0 = oz + dz * tFloor0;
      var inConc  = (fx0 >= -3.4 && fx0 <= 3.4 && fz0 >= 0.0 && fz0 <= 20.5);
      var inVomF  = (fz0 >= 17.0 && fz0 <= 19.8 && Math.abs(fx0) >= 3.4 && Math.abs(fx0) <= 6.4);
      var inPTun  = (fx0 >= -2.4 && fx0 <= 2.4 && fz0 >= 20.5 && fz0 <= 37.0);
      var inHomeL = (fx0 >= -14.5 && fx0 < -2.4 && fz0 >= 24.0 && fz0 <= 35.5);
      var inAwayL = (fx0 > 2.4 && fx0 <= 14.5 && fz0 >= 24.0 && fz0 <= 35.5);
      if (inConc || inVomF || inPTun || inHomeL || inAwayL) {
        return { kind: 'floor', x: fx0, y: 0.0, z: fz0 };
      }
    }
  }
  return null;
}

/* ==================== 4. HELPERS KIẾN TRÚC SENIOR DESIGN ART (GHẾ FIFA, KHOANG TỦ, CABIN KÍNH, MÁI VÒM) ==================== */
// 4A. Ghế Gập FIFA Ergonomic Đúc Khít (thanh dầm, chân trụ, mặt đệm cong, tựa lưng nghiêng 10°, tay vịn đen giữ cốc)
function drawFifaSeatUnitWebgl(wgl, x, y, z, seatCol, isVip) {
  var dm = wgl.drawMesh;
  // Chân khung thép
  dm('box', 'white', x, y + 0.14, z, 0, 0, 0, 0.10, 0.28, 0.26, { tint: [0.16, 0.20, 0.26, 1] });
  // Mặt đệm ngồi bo dốc nhẹ
  dm('box', 'white', x, y + 0.30, z + 0.06, 0.06, 0, 0, 0.48, 0.09, 0.44, { tint: seatCol, specPow: 64 });
  // Đệm tựa lưng vát vai nghiêng -0.18 rad
  dm('box', 'white', x, y + 0.56, z - 0.16, -0.18, 0, 0, 0.46, 0.46, 0.08, { tint: seatCol, specPow: 64 });
  // Đệm đầu nhỏ trên đỉnh lưng ghế VIP
  if (isVip) {
    dm('box', 'white', x, y + 0.80, z - 0.20, -0.18, 0, 0, 0.34, 0.09, 0.08, { tint: [0.98, 0.82, 0.18, 1] });
  }
  // Tay vịn đen phải có hốc đựng nước
  dm('box', 'white', x + 0.25, y + 0.42, z + 0.02, 0, 0, 0, 0.05, 0.06, 0.36, { tint: [0.09, 0.11, 0.15, 1] });
}

// 4B. Khoang Tủ Cầu Thủ 3D Nổi Khối (2 vách đứng, hộp đèn tên, áo đấu + quần 3D treo móc, ghế da & đôi giày đinh)
function drawLockerCubbyBay3D(wgl, cx, cz, rotY, kitCol, trimCol, numIdx) {
  var dm = wgl.drawMesh;
  var cosR = Math.cos(rotY), sinR = Math.sin(rotY);
  function at(lx, ly, lz, sx, sy, sz, col, tex, em) {
    var wx = cx + lx * cosR + lz * sinR;
    var wz = cz - lx * sinR + lz * cosR;
    dm('box', tex || 'white', wx, ly, wz, 0, rotY, 0, sx, sy, sz, { tint: col, emissive: em || 0 });
  }
  var woodCol = trimCol[0] > 0.5 ? [0.46, 0.18, 0.14, 1] : [0.16, 0.22, 0.34, 1];
  // Vách hậu & 2 vách ngăn hốc tủ + nóc hộp đèn số áo phát sáng
  at(0.0,  1.45, -0.34, 1.38, 2.9, 0.08, woodCol, 'lockerWall');
  at(-0.68,1.45,  0.0,  0.08, 2.9, 0.72, woodCol);
  at( 0.68,1.45,  0.0,  0.08, 2.9, 0.72, woodCol);
  at(0.0,  2.72,  0.04, 1.32, 0.30, 0.66, trimCol, 'white', 0.35);
  // Thanh treo đồ thép + Áo đấu 3D nổi khối (thân áo + 2 tay áo + quần short)
  at(0.0,  2.26,  0.0,  1.26, 0.04, 0.04, [0.78, 0.82, 0.88, 1]);
  at(0.0,  1.92, -0.02, 0.48, 0.60, 0.12, kitCol);
  at(-0.31,2.08, -0.02, 0.16, 0.26, 0.12, kitCol);
  at( 0.31,2.08, -0.02, 0.16, 0.26, 0.12, kitCol);
  at(0.0,  1.42, -0.02, 0.42, 0.34, 0.12, trimCol);
  // Ghế ngồi nệm da + Đôi giày đinh vàng/trắng dưới gầm
  at(0.0,  0.48,  0.10, 1.32, 0.10, 0.68, kitCol);
  at(-0.22,0.12,  0.08, 0.18, 0.12, 0.32, numIdx % 2 === 0 ? [0.98, 0.80, 0.18, 1] : [0.95, 0.96, 0.98, 1]);
  at( 0.22,0.12,  0.08, 0.18, 0.12, 0.32, numIdx % 2 === 0 ? [0.98, 0.80, 0.18, 1] : [0.95, 0.96, 0.98, 1]);
}

// 4C. Khung Vòm Thép Đường Hầm Lặp Nhịp Tạo Chiều Sâu 44m
function drawTunnelArchRib3D(wgl, z, halfW, h) {
  var dm = wgl.drawMesh;
  dm('box', 'white', -halfW + 0.14, h * 0.5, z, 0, 0, 0, 0.24, h, 0.28, { tint: [0.22, 0.26, 0.34, 1] });
  dm('box', 'white',  halfW - 0.14, h * 0.5, z, 0, 0, 0, 0.24, h, 0.28, { tint: [0.22, 0.26, 0.34, 1] });
  dm('box', 'white',  0.0, h - 0.14, z, 0, 0, 0, halfW * 2, 0.22, 0.32, { tint: [0.76, 0.58, 0.22, 1] });
  dm('box', 'white',  0.0, h - 0.28, z, 0, 0, 0, halfW * 1.4, 0.06, 0.14, { tint: [1.0, 0.95, 0.78, 1], emissive: 1.4 });
}

// 4D. Cabin Kỹ Thuật Mái Kính Cong + 6 Ghế Recaro Cho HLV & Dự Bị
function drawTechnicalDugoutWebgl(wgl, cx, z, accentCol) {
  var dm = wgl.drawMesh;
  dm('box', 'standConcrete', cx, 0.90, z, 0, 0, 0, 8.2, 0.20, 2.1, { tint: [0.26, 0.30, 0.38, 1] });
  // Khung thép cột sau + vách bên
  dm('box', 'white', cx - 4.0, 1.75, z - 0.9, 0, 0, 0, 0.12, 1.7, 0.12, { tint: [0.16, 0.20, 0.26, 1] });
  dm('box', 'white', cx + 4.0, 1.75, z - 0.9, 0, 0, 0, 0.12, 1.7, 0.12, { tint: [0.16, 0.20, 0.26, 1] });
  dm('box', 'white', cx, 2.55, z - 0.2, 0, 0, 0, 8.2, 0.10, 0.10, { tint: accentCol });
  // 6 Ghế Recaro bọc da ngồi khít nhau
  for (var ri = 0; ri < 6; ri++) {
    drawFifaSeatUnitWebgl(wgl, cx - 3.0 + ri * 1.2, 1.0, z - 0.35, accentCol, true);
  }
  // Mái vòm kính Acrylic trong suốt
  wgl.setBlend('alpha');
  dm('box', 'white', cx, 2.58, z, -0.22, 0, 0, 8.2, 0.06, 2.1, { tint: [0.70, 0.88, 1.0, 0.30], specPow: 120 });
  dm('quad','white', cx, 1.75, z - 0.95, 0, 0, 0, 8.0, 1.6, 1, { tint: [0.72, 0.90, 1.0, 0.22] });
  wgl.setBlend(null);
}

function drawStadiumTrophyAndDrumWebgl(wgl, x, y, z, t) {
  var dm = wgl.drawMesh;
  dm('box', 'lockerWall', x, y + 0.46, z, 0, 0, 0, 2.35, 0.92, 1.85, { tint: [1.0, 0.92, 0.85, 1] });
  dm('box', 'white', x, y + 0.96, z, 0, 0, 0, 2.48, 0.10, 1.98, { tint: [0.96, 0.74, 0.24, 1], specPow: 96 });
  var cx = x - 0.52, cy = y + 1.02;
  dm('cyl', 'white', cx, cy + 0.06, z, 0, 0, 0, 0.34, 0.12, 0.34, { tint: [0.08, 0.45, 0.22, 1], specPow: 64 });
  dm('cup', 'white', cx, cy + 0.32, z, 0, 0, 0, 0.22, 0.42, 0.22, { tint: [0.98, 0.78, 0.16, 1], specPow: 120, emissive: 0.18 });
  dm('sphere', 'white', cx, cy + 0.62, z, 0, t * 0.8, 0, 0.32, 0.32, 0.32, { tint: [1.0, 0.86, 0.24, 1], specPow: 128, emissive: 0.25 + Math.sin(t * 4) * 0.08 });
  var dx = x + 0.55;
  dm('cyl', 'roofTrongDong', dx, cy + 0.22, z, 0, 0, 0, 0.54, 0.44, 0.54, { tint: [0.96, 0.78, 0.32, 1], specPow: 72 });
  dm('cyl', 'dongSonCenter', dx, cy + 0.45, z, 0, 0, 0, 0.60, 0.06, 0.60, { tint: [1.0, 0.88, 0.35, 1], emissive: 0.20 });
}

function drawStadiumGoalWebgl(wgl, xPos, dirSign) {
  var dm = wgl.drawMesh;
  var y0 = 0.8, zMid = 67.0;
  dm('cyl', 'white', xPos, y0 + 1.15, zMid - 2.8, 0, 0, 0, 0.12, 2.3, 0.12, { tint: [0.98, 0.99, 1.0, 1] });
  dm('cyl', 'white', xPos, y0 + 1.15, zMid + 2.8, 0, 0, 0, 0.12, 2.3, 0.12, { tint: [0.98, 0.99, 1.0, 1] });
  dm('box', 'white', xPos, y0 + 2.28, zMid,       0, 0, 0, 0.12, 0.12, 5.72, { tint: [0.98, 0.99, 1.0, 1] });
  // Cột chống lưới sau chữ L
  dm('box', 'white', xPos + dirSign * 0.8, y0 + 2.24, zMid - 2.8, 0, 0, 0, 1.6, 0.08, 0.08, { tint: [0.82, 0.86, 0.92, 1] });
  dm('box', 'white', xPos + dirSign * 0.8, y0 + 2.24, zMid + 2.8, 0, 0, 0, 1.6, 0.08, 0.08, { tint: [0.82, 0.86, 0.92, 1] });
  dm('cyl', 'white', xPos + dirSign * 1.55, y0 + 1.12, zMid - 2.8, 0, 0, 0, 0.06, 2.24, 0.06, { tint: [0.76, 0.80, 0.86, 1] });
  dm('cyl', 'white', xPos + dirSign * 1.55, y0 + 1.12, zMid + 2.8, 0, 0, 0, 0.06, 2.24, 0.06, { tint: [0.76, 0.80, 0.86, 1] });
  wgl.setBlend('alpha');
  dm('box', 'white', xPos + dirSign * 0.78, y0 + 1.12, zMid, 0, 0, 0, 1.50, 2.2, 5.55, { tint: [0.92, 0.96, 1.0, 0.24] });
  wgl.setBlend(null);
}

function drawFloodlightTowerWebgl(wgl, x, z, lookYaw) {
  var dm = wgl.drawMesh;
  dm('box', 'white', x, 10.6, z, 0, 0, 0, 0.82, 19.6, 0.82, { tint: [0.42, 0.48, 0.56, 1] });
  dm('box', 'white', x, 20.6, z, 0.38, lookYaw, 0, 4.4, 2.0, 0.45, { tint: [0.16, 0.20, 0.26, 1] });
  for (var li = -1; li <= 1; li++) {
    dm('quad', 'white', x + li * 0.95 * Math.cos(lookYaw), 20.55, z - li * 0.95 * Math.sin(lookYaw), 0.38, lookYaw, 0, 0.9, 1.4, 1, { tint: [1.0, 0.97, 0.80, 1], emissive: 1.7 });
  }
}

function renderStadiumWebglScene(wgl, cam, st, W, H) {
  if (typeof computeWebglTpsCamera === 'function') {
    computeWebglTpsCamera(cam, st.pig, STADIUM_NAV_GRAPH, st._lastDt || 0.016);
  }
  var dm = wgl.drawMesh;
  var p = st.pig;
  var isOutdoor = (p.y < 2.2 && p.z >= 41.5) || (p.y >= 2.2 && p.z >= 25.4);
  var isGoalFlash = !!(st.goalFlashUntil && st.t < st.goalFlashUntil);
  var isWave = !!(st.waveUntil && st.t < st.waveUntil);

  var atmo = isOutdoor ? {
    clearColor: [0.04, 0.09, 0.20, 1.0],
    hemiLow: [0.22, 0.26, 0.36],
    hemiHigh: [0.58, 0.68, 0.90],
    sunDir: [0.25, 0.88, -0.40],
    sunCol: [1.06, 0.98, 0.86],
    wrapBias: 0.48,
    lights: [
      { pos: [-24.0, 18.5, 45.0], col: [1.18, 1.10, 0.92] },
      { pos: [ 24.0, 18.5, 45.0], col: [1.18, 1.10, 0.92] },
      { pos: [-24.0, 18.5, 86.0], col: [1.18, 1.10, 0.92] },
      { pos: [ 24.0, 18.5, 86.0], col: [1.18, 1.10, 0.92] }
    ],
    outdoorRect: [-1.0, 0.0, 0.0, 0.88],
    fogCol: [0.06, 0.12, 0.26],
    fogParams: [42.0, 92.0, 0.30]
  } : {
    clearColor: [0.10, 0.08, 0.09, 1.0],
    hemiLow: [0.24, 0.20, 0.18],
    hemiHigh: [0.64, 0.60, 0.54],
    sunDir: [0.32, 0.76, 0.56],
    sunCol: [0.98, 0.88, 0.72],
    wrapBias: 0.46,
    lights: [
      { pos: [0.0, 3.4, 8.0],   col: [1.18, 0.96, 0.64] },
      { pos: [0.0, 3.4, 18.0],  col: [1.15, 0.92, 0.58] },
      { pos: [-8.5, 3.3, 30.0], col: [1.15, 0.84, 0.48] },
      { pos: [ 8.5, 3.3, 30.0], col: [0.82, 0.94, 1.18] }
    ],
    outdoorRect: [0.0, 0.0, 0.0, 0.0],
    fogCol: [0.12, 0.10, 0.11],
    fogParams: [22.0, 54.0, 0.34]
  };

  wgl.beginFrame(W, H, cam, atmo);

  // A. CHÂN TRỜI SKYLINE ĐÊM QUANH SVĐ (CHỈ PHẦN TRỜI CAO — KHÔNG CÓ ĐƯỜNG PHỐ NGOÀI CỔNG)
  if (typeof drawSaigonHorizonRing3D === 'function') {
    drawSaigonHorizonRing3D(wgl, st, { forceNight: true, cx: 0, cz: 62.0, y: 18.0, rx: 42, rz: 46, widthX: 98, widthZ: 98, height: 34 });
  } else {
    dm('quad', 'skyNightDome', 0, 20.0, 98.0, 0, Math.PI, 0, 98, 38, 1, { tint: [1, 1, 1, 1], emissive: 0.92 });
  }

  // B. ĐOẠN 1 — ĐƯỜNG HẦM CỔ ĐỘNG VIÊN (fan_concourse: X ∈ [-3.4, 3.4], Z ∈ [0, 20.5], Y = 0)
  dm('box', 'tunnelFloorTex', 0.0, -0.05, 10.25, 0, 0, 0, 6.8, 0.10, 20.5, { tint: [1, 1, 1, 1], us: 2, vs: 6 });
  dm('box', 'redCarpet',      0.0,  0.006, 10.25, 0, 0, 0, 2.8, 0.012, 20.4, { tint: [1, 1, 1, 1], us: 1, vs: 6 });
  // Tường hậu Cổng Kính Turnstile QR Z = 0
  dm('box', 'lockerWall', 0.0, 2.0, -0.08, 0, 0, 0, 7.0, 4.0, 0.16, { tint: [0.22, 0.26, 0.34, 1] });
  dm('quad', 'gateSign',  0.0, 2.65, 0.04, 0, Math.PI, 0, 5.4, 1.3, 1, { tint: [1, 1, 1, 1], emissive: 0.55 });
  for (var tsi = -2; tsi <= 2; tsi++) {
    dm('box', 'white', tsi * 1.15, 0.52, 0.55, 0, 0, 0, 0.28, 1.04, 0.95, { tint: [0.72, 0.78, 0.86, 1] });
    dm('box', 'white', tsi * 1.15, 1.06, 0.55, 0, 0, 0, 0.24, 0.06, 0.40, { tint: [0.14, 0.86, 0.45, 1], emissive: 0.9 });
  }
  // Vách tường Đoạn 1 (chừa lối rẽ 2 Cầu Thang Vomitory tại Z ∈ [17.0, 19.8]) & Trần + Hệ Vòm Thép 4m/nhịp
  dm('box', 'lockerWall', -3.48, 2.0, 8.5,  0, 0, 0, 0.16, 4.0, 17.0, { tint: [0.58, 0.44, 0.38, 1], us: 5, vs: 1.5 });
  dm('box', 'lockerWall',  3.48, 2.0, 8.5,  0, 0, 0, 0.16, 4.0, 17.0, { tint: [0.58, 0.44, 0.38, 1], us: 5, vs: 1.5 });
  dm('box', 'lockerWall', -3.48, 2.0, 20.15,0, 0, 0, 0.16, 4.0, 0.7,  { tint: [0.58, 0.44, 0.38, 1] });
  dm('box', 'lockerWall',  3.48, 2.0, 20.15,0, 0, 0, 0.16, 4.0, 0.7,  { tint: [0.58, 0.44, 0.38, 1] });
  dm('box', 'lockerWall',  0.0,  3.95, 10.25, 0, 0, 0, 7.0, 0.16, 20.5, { tint: [0.22, 0.24, 0.30, 1], us: 2, vs: 6 });
  for (var ar1 = 2.0; ar1 <= 18.0; ar1 += 4.0) drawTunnelArchRib3D(wgl, ar1, 3.4, 3.9);

  // Quầy Nước Stadium Bar (Trái X = -2.6, Z = 5.5..10.0) & Quầy Fan Shop (Phải X = 2.6, Z = 5.5..10.0) + Tranh LED
  dm('box', 'white', -2.75, 0.52, 7.75, 0, 0, 0, 1.2, 1.04, 4.4, { tint: [0.16, 0.24, 0.36, 1] });
  dm('box', 'white', -2.75, 1.06, 7.75, 0, 0, 0, 1.3, 0.08, 4.5, { tint: [0.22, 0.74, 0.96, 1] });
  dm('quad', 'stadiumBarSign', -3.36, 2.45, 7.75, 0, Math.PI * 0.5, 0, 4.0, 1.0, 1, { tint: [1, 1, 1, 1], emissive: 0.75 });
  dm('box', 'white',  2.75, 0.52, 7.75, 0, 0, 0, 1.2, 1.04, 4.4, { tint: [0.68, 0.12, 0.12, 1] });
  dm('box', 'white',  2.75, 1.06, 7.75, 0, 0, 0, 1.3, 0.08, 4.5, { tint: [0.98, 0.80, 0.18, 1] });
  dm('quad', 'fanShopSign',     3.36, 2.45, 7.75, 0, -Math.PI * 0.5, 0, 4.0, 1.0, 1, { tint: [1, 1, 1, 1], emissive: 0.75 });
  dm('quad', 'tunnelMuralVN',  -3.36, 2.1, 13.5, 0, Math.PI * 0.5, 0, 3.8, 1.9, 1, { tint: [1, 1, 1, 1], emissive: 0.45 });
  dm('quad', 'tunnelMuralVN',   3.36, 2.1, 13.5, 0, -Math.PI * 0.5,0, 3.8, 1.9, 1, { tint: [1, 1, 1, 1], emissive: 0.45 });
  dm('quad', 'vomitorySign',   -3.36, 3.3, 18.4, 0, Math.PI * 0.5, 0, 2.8, 0.7, 1, { tint: [1, 1, 1, 1], emissive: 0.75 });
  dm('quad', 'vomitorySign',    3.36, 3.3, 18.4, 0, -Math.PI * 0.5,0, 2.8, 0.7, 1, { tint: [1, 1, 1, 1], emissive: 0.75 });

  // C. NGÃ TƯ VOMITORY & ĐOẠN 2 — ĐƯỜNG HẦM CẦU THỦ FIFA (Z ∈ [20.5, 44.0])
  dm('box', 'lockerWall', -2.9, 1.9, 20.5, 0, 0, 0, 1.1, 3.8, 0.20, { tint: [0.22, 0.26, 0.34, 1] });
  dm('box', 'lockerWall',  2.9, 1.9, 20.5, 0, 0, 0, 1.1, 3.8, 0.20, { tint: [0.22, 0.26, 0.34, 1] });
  dm('quad', 'tunnelSign', 0.0, 3.3, 20.38, 0, Math.PI, 0, 4.4, 0.95, 1, { tint: [1, 1, 1, 1], emissive: 0.55 });
  dm('box',   'tunnelFloorTex', 0.0, -0.05, 28.75, 0, 0, 0, 4.8, 0.10, 16.5, { tint: [1, 1, 1, 1], us: 1.5, vs: 5 });
  dm('box',   'redCarpet',      0.0,  0.006, 28.75, 0, 0, 0, 3.0, 0.012, 16.5, { tint: [1, 1, 1, 1], us: 1, vs: 5 });
  dm('wedge', 'redCarpet',      0.0,  0.40, 40.5,  0, 0, 0, 4.8, 0.80, 7.0,  { tint: [1, 1, 1, 1], us: 1.2, vs: 3 });
  // Tường dọc Đường Hầm Cầu Thủ (chừa cửa 2 Phòng Thay Đồ Z ∈ [27.5, 32.5])
  dm('box', 'lockerWall', -2.48, 1.7, 24.0, 0, 0, 0, 0.16, 3.4, 7.0,  { tint: [1, 1, 1, 1], us: 2, vs: 1 });
  dm('box', 'lockerWall',  2.48, 1.7, 24.0, 0, 0, 0, 0.16, 3.4, 7.0,  { tint: [1, 1, 1, 1], us: 2, vs: 1 });
  dm('box', 'lockerWall', -2.48, 1.7, 38.25,0, 0, 0, 0.16, 3.4, 11.5, { tint: [1, 1, 1, 1], us: 3, vs: 1 });
  dm('box', 'lockerWall',  2.48, 1.7, 38.25,0, 0, 0, 0.16, 3.4, 11.5, { tint: [1, 1, 1, 1], us: 3, vs: 1 });
  dm('box', 'lockerWall',  0.0,  3.45, 28.75,0, 0, 0, 5.0, 0.16, 16.5, { tint: [0.24, 0.26, 0.32, 1], us: 1.5, vs: 5 });
  for (var ar2 = 22.5; ar2 <= 42.5; ar2 += 4.0) drawTunnelArchRib3D(wgl, ar2, 2.4, 3.4);

  // D. 2 NHÁNH PHÒNG THAY ĐỒ VIP WORLD CUP TẢ THỰC (0% MẢNG TƯỜNG TRƠN!)
  // D1. Nhánh Trái — Phòng Thay Đồ ĐT Việt Nam (home_locker: X ∈ [-14.5, -2.4], Z ∈ [24.0, 35.5])
  dm('box', 'lockerFloor', -8.45, -0.05, 29.75, 0, 0, 0, 12.1, 0.10, 11.5, { tint: [1, 1, 1, 1], us: 4, vs: 4 });
  dm('box', 'redCarpet',   -8.45,  0.006, 29.75, 0, 0, 0, 6.2,  0.012, 4.4, { tint: [1, 1, 1, 1], us: 2, vs: 1.5 });
  dm('box', 'lockerWall', -14.58, 1.7, 29.75, 0, 0, 0, 0.16, 3.4, 11.5, { tint: [1, 1, 1, 1], us: 4, vs: 1 });
  dm('box', 'lockerWall',  -8.45, 1.7, 23.92, 0, 0, 0, 12.1, 3.4, 0.16, { tint: [1, 1, 1, 1], us: 4, vs: 1 });
  dm('box', 'lockerWall',  -8.45, 1.7, 35.58, 0, 0, 0, 12.1, 3.4, 0.16, { tint: [1, 1, 1, 1], us: 4, vs: 1 });
  dm('box', 'lockerWall',  -8.45, 3.38, 29.75, 0, 0, 0, 12.1, 0.16, 11.5, { tint: [0.36, 0.22, 0.18, 1], us: 4, vs: 4 });
  // 6 Khoang tủ 3D dọc tường Tây + 4 Khoang tủ dọc tường Bắc
  for (var hc = 0; hc < 6; hc++) {
    drawLockerCubbyBay3D(wgl, -13.9, 25.4 + hc * 1.55, Math.PI * 0.5, [0.85, 0.14, 0.14, 1], [0.96, 0.78, 0.18, 1], hc);
  }
  for (var hcb = 0; hcb < 4; hcb++) {
    drawLockerCubbyBay3D(wgl, -11.4 + hcb * 1.65, 34.9, Math.PI, [0.85, 0.14, 0.14, 1], [0.96, 0.78, 0.18, 1], hcb + 6);
  }
  // Đèn vòng Trống Đồng trần, TV Bảng chiến thuật 4-3-3, Bàn sa bàn kính, Giường y tế & Bồn Cryo thép
  dm('cyl', 'dongSonCenter', -8.45, 3.28, 29.8, 0, 0, 0, 1.6, 0.08, 1.6, { tint: [1.0, 0.90, 0.45, 1], emissive: 0.7 });
  dm('quad', 'tacticsBoard', -7.2,  1.85, 24.06, 0, 0, 0, 4.8, 2.2, 1, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'lockerWall', -8.4, 0.42, 29.8, 0, 0, 0, 2.2, 0.76, 1.5, { tint: [0.76, 0.46, 0.22, 1] });
  dm('box', 'fifaGrass',  -8.4, 0.82, 29.8, 0, 0, 0, 2.0, 0.04, 1.3, { tint: [1, 1, 1, 1] });
  dm('box', 'white',     -11.8, 0.36, 25.0, 0, 0, 0, 1.7, 0.72, 1.4, { tint: [0.86, 0.92, 0.98, 1] });
  dm('box', 'white',     -11.8, 0.74, 25.0, 0, 0, 0, 1.45, 0.05, 1.15,{ tint: [0.22, 0.74, 0.96, 1], emissive: 0.5 });

  // D2. Nhánh Phải — Phòng Thay Đồ Đội Khách (away_locker: X ∈ [2.4, 14.5], Z ∈ [24.0, 35.5])
  dm('box', 'lockerFloor', 8.45, -0.05, 29.75, 0, 0, 0, 12.1, 0.10, 11.5, { tint: [0.86, 0.92, 1.0, 1], us: 4, vs: 4 });
  dm('box', 'lockerWall',  14.58, 1.7, 29.75, 0, 0, 0, 0.16, 3.4, 11.5, { tint: [0.28, 0.38, 0.56, 1], us: 4, vs: 1 });
  dm('box', 'lockerWall',   8.45, 1.7, 23.92, 0, 0, 0, 12.1, 3.4, 0.16, { tint: [0.28, 0.38, 0.56, 1], us: 4, vs: 1 });
  dm('box', 'lockerWall',   8.45, 1.7, 35.58, 0, 0, 0, 12.1, 3.4, 0.16, { tint: [0.28, 0.38, 0.56, 1], us: 4, vs: 1 });
  dm('box', 'lockerWall',   8.45, 3.38, 29.75, 0, 0, 0, 12.1, 0.16, 11.5, { tint: [0.18, 0.24, 0.38, 1], us: 4, vs: 4 });
  for (var ac = 0; ac < 6; ac++) {
    drawLockerCubbyBay3D(wgl, 13.9, 25.4 + ac * 1.55, -Math.PI * 0.5, [0.16, 0.42, 0.88, 1], [0.88, 0.94, 1.0, 1], ac);
  }
  for (var acb = 0; acb < 4; acb++) {
    drawLockerCubbyBay3D(wgl, 6.4 + acb * 1.65, 34.9, Math.PI, [0.16, 0.42, 0.88, 1], [0.88, 0.94, 1.0, 1], acb + 6);
  }
  dm('cyl', 'white',          8.45, 3.28, 29.8, 0, 0, 0, 1.6, 0.08, 1.6, { tint: [0.42, 0.78, 1.0, 1], emissive: 0.7 });
  dm('quad', 'awayTacticsBoard', 7.2, 1.85, 24.06, 0, 0, 0, 4.8, 2.2, 1, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'lockerWall', 8.4, 0.42, 29.8, 0, 0, 0, 2.2, 0.76, 1.5, { tint: [0.26, 0.36, 0.58, 1] });
  dm('box', 'fifaGrass',  8.4, 0.82, 29.8, 0, 0, 0, 2.0, 0.04, 1.3, { tint: [1, 1, 1, 1] });
  dm('box', 'white',     11.8, 0.36, 25.0, 0, 0, 0, 1.7, 0.72, 1.4, { tint: [0.86, 0.92, 0.98, 1] });
  dm('box', 'white',     11.8, 0.74, 25.0, 0, 0, 0, 1.45, 0.05, 1.15,{ tint: [0.22, 0.74, 0.96, 1], emissive: 0.5 });

  // E. 2 CẦU THANG VOMITORY 12 BẬC LÊN KHÁN ĐÀI NAM (Z: 19.8 → 25.6, Y: 0 → 3.4)
  dm('box', 'standConcrete', -4.8, -0.04, 18.4, 0, 0, 0, 3.2, 0.08, 2.8, { tint: [0.76, 0.78, 0.82, 1] });
  dm('box', 'standConcrete',  4.8, -0.04, 18.4, 0, 0, 0, 3.2, 0.08, 2.8, { tint: [0.76, 0.78, 0.82, 1] });
  for (var vs = 0; vs < 12; vs++) {
    var vStepZ = 19.8 + (vs + 0.5) * (5.8 / 12);
    var vStepY = (vs + 1) * (3.4 / 12);
    dm('box', 'standConcrete', -5.0, vStepY * 0.5, vStepZ, 0, 0, 0, 2.4, vStepY, 0.48, { tint: [0.86, 0.88, 0.90, 1] });
    dm('box', 'standConcrete',  5.0, vStepY * 0.5, vStepZ, 0, 0, 0, 2.4, vStepY, 0.48, { tint: [0.86, 0.88, 0.90, 1] });
    dm('box', 'white', -5.0, vStepY, vStepZ - 0.21, 0, 0, 0, 2.42, 0.04, 0.06, { tint: [0.96, 0.78, 0.22, 1] });
    dm('box', 'white',  5.0, vStepY, vStepZ - 0.21, 0, 0, 0, 2.42, 0.04, 0.06, { tint: [0.96, 0.78, 0.22, 1] });
  }
  dm('box', 'white', -3.85, 2.25, 22.7, -0.52, 0, 0, 0.08, 0.08, 6.8, { tint: [0.86, 0.90, 0.94, 1] });
  dm('box', 'white',  3.85, 2.25, 22.7, -0.52, 0, 0, 0.08, 0.08, 6.8, { tint: [0.86, 0.90, 0.94, 1] });

  // F. KHÁN ĐÀI NAM GIẬT CẤP 4 TẦNG + 60 GHẾ GẬP FIFA ERGONOMIC ĐÚC KHÍT + SẢNH CÚP VÀNG VIP
  dm('box', 'standConcrete', 0.0, 3.34, 32.4, 0, 0, 0, 44.0, 0.12, 13.6, { tint: [0.82, 0.84, 0.88, 1], us: 10, vs: 4 });
  // 2 Bậc Giật Cấp phía sau hàng VIP (Y = 3.85 tại Z = 34.8, Y = 4.30 tại Z = 32.8) để CĐV ngồi nhìn qua đầu hàng trước
  dm('box', 'standConcrete', -14.0, 3.60, 34.8, 0, 0, 0, 14.0, 0.50, 1.8, { tint: [0.76, 0.78, 0.82, 1] });
  dm('box', 'standConcrete',   0.0, 3.60, 34.8, 0, 0, 0,  6.8, 0.50, 1.8, { tint: [0.76, 0.78, 0.82, 1] });
  dm('box', 'standConcrete',  14.0, 3.60, 34.8, 0, 0, 0, 14.0, 0.50, 1.8, { tint: [0.76, 0.78, 0.82, 1] });
  dm('box', 'standConcrete', -14.0, 3.82, 32.8, 0, 0, 0, 14.0, 0.95, 1.8, { tint: [0.70, 0.72, 0.78, 1] });
  dm('box', 'standConcrete',   0.0, 3.82, 32.8, 0, 0, 0,  6.8, 0.95, 1.8, { tint: [0.70, 0.72, 0.78, 1] });
  dm('box', 'standConcrete',  14.0, 3.82, 32.8, 0, 0, 0, 14.0, 0.95, 1.8, { tint: [0.70, 0.72, 0.78, 1] });

  // Thanh dầm thép + Lắp hàng chục Ghế Gập FIFA Ergonomic khít nhau (0.72m bước ghế) trên cả 3 hàng!
  var rowDefs = [
    { z: 37.2, y: 3.40, vip: true },
    { z: 34.8, y: 3.85, vip: false },
    { z: 32.8, y: 4.30, vip: false }
  ];
  for (var ri2 = 0; ri2 < rowDefs.length; ri2++) {
    var rd = rowDefs[ri2];
    dm('box', 'white', 0.0, rd.y + 0.10, rd.z, 0, 0, 0, 36.0, 0.08, 0.12, { tint: [0.22, 0.26, 0.32, 1] });
    for (var sx = -16.8; sx <= 16.81; sx += 0.72) {
      if (Math.abs(Math.abs(sx) - 5.0) < 1.1) continue; // Chừa 2 cầu thang lối đi X = ±5.0
      var distS = Math.abs(sx - p.x) + Math.abs(rd.z - p.z);
      if (p.y >= 2.2 && distS > 28.0) continue;
      var sCol = (Math.abs(sx) < 2.2 && rd.vip) ? [0.96, 0.78, 0.14, 1] : ((Math.round((sx + 17) / 0.72 + ri2) % 5 === 0) ? [0.96, 0.76, 0.16, 1] : [0.84, 0.16, 0.14, 1]);
      drawFifaSeatUnitWebgl(wgl, sx, rd.y, rd.z, sCol, Math.abs(sx) < 2.2 && rd.vip);
    }
  }
  // Lan can kính bảo vệ Z = 39.15 nhìn thẳng xuống sân 11v11
  dm('box', 'white', 0.0, 4.42, 39.15, 0, 0, 0, 44.0, 0.08, 0.08, { tint: [0.96, 0.78, 0.28, 1] });
  wgl.setBlend('alpha');
  dm('quad', 'white', 0.0, 3.92, 39.15, 0, 0, 0, 44.0, 1.0, 1, { tint: [0.74, 0.92, 1.0, 0.24] });
  wgl.setBlend(null);

  // Sảnh Cúp Vàng VIP nối sau Khán Đài Nam (X ∈ [7.0, 16.5], Z ∈ [13.5, 25.6], Y = 3.4)
  dm('box', 'vipMarble', 11.75, 3.34, 19.55, 0, 0, 0, 9.5, 0.12, 12.1, { tint: [1, 1, 1, 1], us: 4, vs: 4 });
  dm('box', 'redCarpet', 11.2,  3.406, 20.0, 0, 0, 0, 3.4, 0.012, 10.6, { tint: [1, 1, 1, 1], us: 1, vs: 4 });
  dm('box', 'lockerWall', 11.75, 5.1, 13.5, 0, 0, 0, 9.5, 3.4, 0.16, { tint: [1, 1, 1, 1], us: 3, vs: 1 });
  dm('box', 'lockerWall', 16.5,  5.1, 19.55,0, 0, 0, 0.16, 3.4, 12.1, { tint: [1, 1, 1, 1], us: 4, vs: 1 });
  dm('box', 'lockerWall', 7.0,   5.1, 19.55,0, 0, 0, 0.16, 3.4, 12.1, { tint: [1, 1, 1, 1], us: 4, vs: 1 });
  dm('quad', 'hallOfChampions',  11.75, 5.15, 13.62, 0, 0, 0, 6.2, 2.4, 1, { tint: [1, 1, 1, 1] });
  dm('quad', 'vipPressBackdrop', 16.38, 5.15, 20.2,  0, -Math.PI * 0.5, 0, 6.4, 2.5, 1, { tint: [1, 1, 1, 1] });
  drawStadiumTrophyAndDrumWebgl(wgl, 11.2, 3.4, 18.6, st.t);

  // G. SÂN CỎ 11v11 TRỐNG ĐỒNG (X ∈ [-22, 22], Z ∈ [52, 82], Y = 0.8) + CABIN KÍNH RECARO + RÀO LED + 4 CỜ GÓC
  dm('box', 'pisteTrack', 0.0, 0.72, 66.0, 0, 0, 0, 56.0, 0.14, 44.0, { tint: [1, 1, 1, 1], us: 10, vs: 8 });
  dm('box', 'fifaGrass',  0.0, 0.804, 67.0, 0, 0, 0, 44.0, 0.016, 30.0, { tint: [1, 1, 1, 1], us: 11, vs: 7 });
  dm('box', 'white',  0.0,   0.818, 52.0, 0, 0, 0, 44.0, 0.01, 0.14, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'white',  0.0,   0.818, 82.0, 0, 0, 0, 44.0, 0.01, 0.14, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'white', -22.0,  0.818, 67.0, 0, 0, 0, 0.14, 0.01, 30.0, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'white',  22.0,  0.818, 67.0, 0, 0, 0, 0.14, 0.01, 30.0, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'white',  0.0,   0.818, 67.0, 0, 0, 0, 0.12, 0.01, 30.0, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'white', -18.5,  0.818, 60.0, 0, 0, 0, 7.0, 0.01, 0.12, { tint: [1, 1, 1, 1] });
  dm('box', 'white', -18.5,  0.818, 74.0, 0, 0, 0, 7.0, 0.01, 0.12, { tint: [1, 1, 1, 1] });
  dm('box', 'white', -15.0,  0.818, 67.0, 0, 0, 0, 0.12, 0.01, 14.1, { tint: [1, 1, 1, 1] });
  dm('box', 'white',  18.5,  0.818, 60.0, 0, 0, 0, 7.0, 0.01, 0.12, { tint: [1, 1, 1, 1] });
  dm('box', 'white',  18.5,  0.818, 74.0, 0, 0, 0, 7.0, 0.01, 0.12, { tint: [1, 1, 1, 1] });
  dm('box', 'white',  15.0,  0.818, 67.0, 0, 0, 0, 0.12, 0.01, 14.1, { tint: [1, 1, 1, 1] });
  wgl.setBlend('alpha');
  dm('quad', 'dongSonCenter', 0.0, 0.824, 67.0, -Math.PI * 0.5, 0, 0, 7.2, 7.2, 1, { tint: [1, 0.96, 0.65, 0.84], emissive: 0.42 });
  wgl.setBlend(null);

  // 4 Cột cờ phạt góc
  var cCorners = [[-22.0, 52.0], [22.0, 52.0], [-22.0, 82.0], [22.0, 82.0]];
  for (var cci = 0; cci < cCorners.length; cci++) {
    dm('cyl', 'white', cCorners[cci][0], 1.4, cCorners[cci][1], 0, 0, 0, 0.05, 1.2, 0.05, { tint: [0.98, 0.98, 0.98, 1] });
    dm('box', 'white', cCorners[cci][0] + 0.18, 1.9, cCorners[cci][1], 0, 0, 0, 0.36, 0.22, 0.04, { tint: [0.92, 0.14, 0.14, 1] });
  }
  drawStadiumGoalWebgl(wgl, -22.0, -1);
  drawStadiumGoalWebgl(wgl,  22.0,  1);
  drawTechnicalDugoutWebgl(wgl, -7.6, 47.0, [0.86, 0.16, 0.16, 1]);
  drawTechnicalDugoutWebgl(wgl,  7.6, 47.0, [0.16, 0.42, 0.86, 1]);

  // Rào LED An Ninh dọc Z = 49.8 & 84.2
  dm('box', 'ledPitchBoard', 0.0, 1.25, 49.8, 0, 0, 0, 42.0, 0.9, 0.24, { tint: [1, 1, 1, 1], us: 5, vs: 1, emissive: 0.55 });
  dm('box', 'ledPitchBoard', 0.0, 1.25, 84.2, 0, 0, 0, 46.0, 0.9, 0.24, { tint: [1, 1, 1, 1], us: 6, vs: 1, emissive: 0.55 });

  // H. 4 MẶT KHÁN ĐÀI PHÂN TẦNG 3 LỚP + DẢI LED RIBBON BOARD + GIÀN THÉP MÁI VÒM TRỐNG ĐỒNG + 4 THÁP ĐÈN PHA
  var waveBoost = isWave ? Math.sin(st.t * 8.0) * 0.16 : 0.0;
  dm('box', 'grandstandRedGold', 0.0, 3.6 + waveBoost, 88.0, -0.34, 0, 0, 56.0, 4.8, 4.8, { tint: [1, 1, 1, 1], us: 7, vs: 1.5 });
  dm('box', 'ribbonLedTex',      0.0, 6.2,             86.0,  0,    0, 0, 56.0, 0.85, 0.3, { tint: [1, 1, 1, 1], us: 6, vs: 1, emissive: 0.75 });
  dm('box', 'grandstandRedGold', 0.0, 8.8 - waveBoost, 92.8, -0.38, 0, 0, 60.0, 5.2, 5.4, { tint: [1, 1, 1, 1], us: 8, vs: 1.5 });

  dm('box', 'grandstandRedGold', -26.8, 3.6 - waveBoost, 67.0, 0, 0, -0.34, 4.8, 4.8, 46.0, { tint: [1, 1, 1, 1], us: 6, vs: 1.5 });
  dm('box', 'ribbonLedTex',      -25.2, 6.2,             67.0, 0, 0,  0,    0.3, 0.85, 46.0, { tint: [1, 1, 1, 1], us: 5, vs: 1, emissive: 0.75 });
  dm('box', 'grandstandRedGold', -31.4, 8.8 + waveBoost, 67.0, 0, 0, -0.38, 5.4, 5.2, 50.0, { tint: [1, 1, 1, 1], us: 7, vs: 1.5 });

  dm('box', 'grandstandRedGold',  26.8, 3.6 + waveBoost, 67.0, 0, 0,  0.34, 4.8, 4.8, 46.0, { tint: [1, 1, 1, 1], us: 6, vs: 1.5 });
  dm('box', 'ribbonLedTex',       25.2, 6.2,             67.0, 0, 0,  0,    0.3, 0.85, 46.0, { tint: [1, 1, 1, 1], us: 5, vs: 1, emissive: 0.75 });
  dm('box', 'grandstandRedGold',  31.4, 8.8 - waveBoost, 67.0, 0, 0,  0.38, 5.4, 5.2, 50.0, { tint: [1, 1, 1, 1], us: 7, vs: 1.5 });

  dm('box', 'grandstandRedGold', 0.0, 7.6 + waveBoost, 28.5, 0.36, 0, 0, 50.0, 4.6, 4.4, { tint: [1, 1, 1, 1], us: 7, vs: 1.5 });

  // Mái vòm Trống Đồng Đông Sơn + Giàn kèo thép không gian 4 cánh
  dm('box', 'roofTrongDong', 0.0,   13.2, 91.0,  0.14, 0, 0, 62.0, 0.42, 8.6, { tint: [1, 1, 1, 1], us: 10, vs: 1, emissive: 0.18 });
  dm('box', 'roofTrongDong', -30.5, 13.2, 67.0,  0, 0,  0.14, 8.6, 0.42, 52.0,{ tint: [1, 1, 1, 1], us: 8, vs: 1, emissive: 0.18 });
  dm('box', 'roofTrongDong',  30.5, 13.2, 67.0,  0, 0, -0.14, 8.6, 0.42, 52.0,{ tint: [1, 1, 1, 1], us: 8, vs: 1, emissive: 0.18 });
  dm('box', 'roofTrongDong', 0.0,   12.6, 28.0, -0.14, 0, 0, 54.0, 0.42, 7.2, { tint: [1, 1, 1, 1], us: 9, vs: 1, emissive: 0.18 });
  // Các thanh giàn thép trắng bạc đỡ vành mái vòm
  for (var trk = -22; trk <= 22; trk += 11) {
    dm('box', 'white', trk, 12.7, 87.2, 0.14, 0, 0, 0.28, 0.32, 7.8, { tint: [0.78, 0.84, 0.90, 1] });
  }

  var sbTex = ensureStadiumScoreboardTex(wgl, st.vnScore, isGoalFlash);
  dm('quad', sbTex,           0.0,   11.2, 85.8, 0, Math.PI, 0, 17.5, 4.4, 1, { tint: [1, 1, 1, 1], emissive: 1.0 });
  dm('quad', 'bannerVnChamp', -24.5, 10.2, 67.0, 0, Math.PI * 0.5, 0, 22.0, 2.4, 1, { tint: [1, 1, 1, 1], emissive: 0.65 });
  dm('quad', 'bannerVnChamp',  24.5, 10.2, 67.0, 0, -Math.PI * 0.5, 0, 22.0, 2.4, 1, { tint: [1, 1, 1, 1], emissive: 0.65 });

  drawFloodlightTowerWebgl(wgl, -26.0, 44.0,  Math.PI * 0.25);
  drawFloodlightTowerWebgl(wgl,  26.0, 44.0, -Math.PI * 0.25);
  drawFloodlightTowerWebgl(wgl, -26.0, 86.0,  Math.PI * 0.75);
  drawFloodlightTowerWebgl(wgl,  26.0, 86.0, -Math.PI * 0.75);

  // Quả bóng FIFA 3D trên sân cỏ
  wgl.setBlend('alpha');
  dm('cyl', 'white', st.ball.x, 0.82, st.ball.z, 0, 0, 0, 0.36, 0.01, 0.36, { tint: [0.05, 0.08, 0.05, 0.35], emissive: 1.0 });
  wgl.setBlend(null);
  dm('sphere', 'white', st.ball.x, st.ball.y + 0.14, st.ball.z, 0, st.t * 3, 0, 0.34, 0.34, 0.34, { tint: [0.99, 0.99, 0.99, 1], specPow: 96 });

  // I. TOÀN BỘ 22 CẦU THỦ + 3 TRỌNG TÀI + 2 HLV + 8 DỰ BỊ + AN NINH + CĐV NGỒI GHẾ & CHÚ HEO
  if (typeof drawHumanBillboardWebgl === 'function') {
    for (var hi = 0; hi < st.npcs.length; hi++) {
      var h = st.npcs[hi];
      if (Math.hypot(h.x - cam.pos.x, h.z - cam.pos.z) > 74.0) continue;
      drawHumanBillboardWebgl(wgl, cam, h, st.t);
    }
  }
  if (typeof drawPigBillboardWebgl === 'function') {
    drawPigBillboardWebgl(wgl, cam, st.pig, st.t, false);
  }

  // J. VÒNG SÓNG CHẠM SÀN & PHÁO GIẤY CỔ VŨ
  wgl.setBlend('add');
  for (var ri = 0; ri < st.ripples.length; ri++) {
    var rp = st.ripples[ri];
    var rAlpha = Math.max(0, 1 - rp.t / 0.75) * 0.75;
    dm('torus', 'white', rp.x, (rp.y || 0) + 0.03, rp.z, Math.PI * 0.5, 0, 0, 0.35 + rp.t * 0.9, 0.35 + rp.t * 0.9, 0.2, { tint: [0.98, 0.84, 0.28, rAlpha], emissive: 1.2 });
  }
  if (isGoalFlash || (st.confettiUntil && st.t < st.confettiUntil)) {
    for (var ci = 0; ci < 26; ci++) {
      var cAng = ci * 0.52 + st.t * 2.2;
      var cRad = 1.4 + (ci % 5) * 0.55;
      var cy = (p.y || 0) + 0.6 + ((ci * 0.37 + st.t * 1.4) % 2.8);
      dm('box', 'white', p.x + Math.cos(cAng) * cRad, cy, p.z + Math.sin(cAng) * cRad, st.t * 3, st.t * 2, 0, 0.14, 0.14, 0.04, {
        tint: ci % 2 === 0 ? [1.0, 0.88, 0.18, 0.92] : [0.92, 0.16, 0.16, 0.92],
        emissive: 1.3
      });
    }
  }
  wgl.setBlend(null);
}

/* ==================== 5. FALLBACK CANVAS2D CHO HEADLESS SMOKE TEST (TEST 183) ==================== */
function drawFootballSprite3D(ctx, cam, wx, wy, wz) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 34 || pr.cz < 0.35) return;
  var r = Math.max(3, Math.min(14, pr.scale * 0.18));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  ctx.fillStyle = '#FFFFFF'; ctx.strokeStyle = '#111827'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#111827';
  ctx.beginPath(); ctx.arc(px, py, r * 0.36, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawGoldenTrophySprite3D(ctx, cam, wx, wy, wz, t) {
  var pr = projectPoint3D(cam, wx, wy, wz);
  if (!pr || pr.cz > 28 || pr.cz < 0.4) return;
  var u = Math.max(0.55, Math.min(3.4, pr.scale / 36));
  var px = Math.round(pr.sx), py = Math.round(pr.sy);
  ctx.save();
  ctx.globalAlpha = 0.26 + Math.sin(t * 4) * 0.08;
  ctx.fillStyle = '#FDE047';
  ctx.beginPath(); ctx.arc(px, py - 12 * u, 16 * u, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#16A34A';
  ctx.fillRect(px - 5.2 * u, py - 5 * u, 10.4 * u, 2 * u);
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(px - 3.5 * u, py - 15 * u, 7 * u, 10 * u);
  ctx.fillStyle = '#FACC15'; ctx.strokeStyle = '#78350F'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(px, py - 19 * u, 6.2 * u, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function renderStadiumTpsScene(ctx, cam, st, W, H) {
  var room = st.room || st.zone || 'fan_concourse';
  var isPitch = room === 'pitch_arena' || room === 'pitchside' || room === 'stands_south';
  var isTrophy = room === 'trophy_vip';

  ctx.fillStyle = isPitch ? '#0F172A' : (isTrophy ? '#3B0D0C' : '#2B120C');
  ctx.fillRect(0, 0, W, H);

  if (isPitch) {
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#9A3412', '#7C2D12', 1);
    drawPoly3D(ctx, cam, [[-4.4, 0.005, 1.2], [4.4, 0.005, 1.2], [4.4, 0.005, 13.8], [-4.4, 0.005, 13.8]], '#15803D', '#FFFFFF', 2.0);
    for (var pz = 1.2; pz < 13.4; pz += 1.6) {
      drawPoly3D(ctx, cam, [[-4.36, 0.008, pz], [4.36, 0.008, pz], [4.36, 0.008, pz + 0.8], [-4.36, 0.008, pz + 0.8]], '#16A34A', null, 0);
    }
    drawPoly3D(ctx, cam, [[-4.36, 0.012, 7.36], [4.36, 0.012, 7.36], [4.36, 0.012, 7.44], [-4.36, 0.012, 7.44]], '#FFFFFF', null, 0);
    drawPoly3D(ctx, cam, [[-1.3, 0.014, 6.2], [1.3, 0.014, 6.2], [1.3, 0.014, 8.6], [-1.3, 0.014, 8.6]], 'rgba(250,204,21,0.18)', '#FDE047', 1.5);
  } else if (isTrophy) {
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.8], [-6, 0, 14.8]], '#E7E0D0', '#A89F8D', 1);
    drawPoly3D(ctx, cam, [[-1.95, 0.01, 1.0], [1.95, 0.01, 1.0], [1.95, 0.01, 13.6], [-1.95, 0.01, 13.6]], '#991B1B', '#F4B93B', 2.0);
  } else {
    drawPoly3D(ctx, cam, [[-6, 0, 0], [6, 0, 0], [6, 0, 14.0], [-6, 0, 14.0]], '#334155', '#1E293B', 1);
    for (var lz = 0; lz < 13.6; lz += 1.6) {
      drawPoly3D(ctx, cam, [[-6, 0.004, lz], [6, 0.004, lz], [6, 0.004, lz + 0.8], [-6, 0.004, lz + 0.8]], '#3E4C5E', null, 0);
    }
    drawPoly3D(ctx, cam, [[-1.65, 0.008, 0.3], [1.65, 0.008, 0.3], [1.65, 0.008, 14.0], [-1.65, 0.008, 14.0]], '#991B1B', '#F4B93B', 1.8);
  }

  drawPoly3D(ctx, cam, [[-6, 3.85, 0], [6, 3.85, 0], [6, 3.85, 14.8], [-6, 3.85, 14.8]], isPitch ? '#1E293B' : '#3B1810', '#F4B93B', 1.2);
  drawPoly3D(ctx, cam, [[-6, 0, 0], [-6, 0, 14.8], [-6, 3.85, 14.8], [-6, 3.85, 0]], '#4A1812', '#78350F', 1);
  drawPoly3D(ctx, cam, [[6, 0, 14.8], [6, 0, 0], [6, 3.85, 0], [6, 3.85, 14.8]], '#42140F', '#78350F', 1);
  drawPoly3D(ctx, cam, [[-6, 0, 14.8], [6, 0, 14.8], [6, 3.85, 14.8], [-6, 3.85, 14.8]], '#3B100C', '#78350F', 1);

  if (typeof drawStadiumRoomWalls3D === 'function') {
    drawStadiumRoomWalls3D(ctx, cam, room, st);
  }

  if (isPitch) {
    drawBox3D(ctx, cam, -1.75, 0, 13.45, 0.14, 1.85, 0.14, { top: '#FFFFFF', front: '#F8FAFC', side: '#E2E8F0', stroke: '#0F172A' });
    drawBox3D(ctx, cam,  1.75, 0, 13.45, 0.14, 1.85, 0.14, { top: '#FFFFFF', front: '#F8FAFC', side: '#E2E8F0', stroke: '#0F172A' });
    drawBox3D(ctx, cam,  0.00, 1.75, 13.45, 3.64, 0.14, 0.14, { top: '#FFFFFF', front: '#F8FAFC', side: '#E2E8F0', stroke: '#0F172A' });
    drawBox3D(ctx, cam, -5.0, 0, 7.0, 1.1, 0.45, 3.6, { top: '#DA251D', front: '#991B1B', side: '#7F1D1D', stroke: '#FDE047' });
    drawBox3D(ctx, cam,  5.0, 0, 5.5, 1.1, 0.45, 3.6, { top: '#1E40AF', front: '#1E3A8A', side: '#172554', stroke: '#93C5FD' });
    drawFootballSprite3D(ctx, cam, 0.0, 0.14, 7.4);
  } else if (isTrophy) {
    drawBox3D(ctx, cam, 0, 0, 8.3, 2.15, 0.92, 1.45, { top: '#7F1D1D', front: '#451A03', side: '#3B100C', stroke: '#FDE047' });
    drawGoldenTrophySprite3D(ctx, cam, -0.42, 1.05, 8.3, st.t);
    drawBox3D(ctx, cam, 0, 0, 12.2, 4.4, 0.86, 1.15, { top: '#991B1B', front: '#7F1D1D', side: '#450A0A', stroke: '#FDE047' });
    for (var ti = 0; ti < 3; ti++) {
      drawBox3D(ctx, cam, -1.1 + ti * 1.1, 0.86, 11.9, 0.16, 0.26, 0.16, { top: '#1E293B', front: '#0F172A', side: '#334155', stroke: '#FDE047' });
    }
  } else {
    drawBox3D(ctx, cam, -5.0, 0, 6.6, 1.15, 0.48, 9.6, { top: '#991B1B', front: '#7F1D1D', side: '#450A0A', stroke: '#F4B93B' });
    drawBox3D(ctx, cam, 0, 0, 5.8, 1.75, 0.76, 1.15, { top: '#166534', front: '#78350F', side: '#451A03', stroke: '#F4B93B' });
    drawBox3D(ctx, cam, 4.1, 0, 3.8, 1.45, 0.68, 1.45, { top: '#38BDF8', front: '#CBD5E1', side: '#94A3B8', stroke: '#0284C7' });
    for (var s2 = 0; s2 < 6; s2++) {
      drawBox3D(ctx, cam, 4.3, 0, 7.0 + s2 * 0.85, 1.7, 0.28 * (s2 + 1), 0.75, { top: '#991B1B', front: '#7F1D1D', side: '#450A0A', stroke: '#F4B93B' });
    }
  }

  for (var hIdx = 0; hIdx < 3; hIdx++) {
    var npc = st.npcs[hIdx];
    if (npc) drawHumanTps3D(ctx, cam, npc, st.t);
  }
  drawPigTps3D(ctx, cam, st.pig, st.t);
}
`;
}
