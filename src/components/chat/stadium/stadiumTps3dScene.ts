/**
 * Sân Vận Động Trống Đồng FIFA World Cup WebGL 3D (Quyết định 261)
 * Chuẩn mô hình Lusail / Wembley kết hợp Trống Đồng Đông Sơn 135.000 chỗ — Luồng Cổ Động Viên FIFA:
 * 1. `gate_plaza` (Cổng A Soát Vé ngoài trời, Y = 0): `X ∈ [-10.0, 10.0], Z ∈ [-10.0, 0.0]`
 *    - Xuất phát tại `(0, 0, -4.5)` hướng `+Z` vào Cổng Soát Vé QR; phía sau là Đại lộ & xe cộ.
 * 2. `main_tunnel` (Trục Đường Hầm Trung Tâm, Y = 0 → 0.8): `X ∈ [-2.4, 2.4], Z ∈ [0.0, 22.0]`
 *    - `Z ∈ [0, 15.0]` phẳng `Y = 0`; `Z ∈ [15.0, 22.0]` dốc thoải `6.5°` ra đường piste `Y = 0.8`.
 * 3. Hai nhánh Phòng Thay Đồ đối xứng chuẩn FIFA (`Z ∈ [4.0, 12.6], Y = 0`):
 *    - Trái `home_locker`: `X ∈ [-14.0, -2.4]` — Phòng Thay Đồ ĐT Việt Nam (tủ `#10/#19/#22/#9`, sa bàn, Cryo).
 *    - Phải `away_locker`: `X ∈ [2.4, 14.0]` — Phòng Thay Đồ Đội Khách (tủ xanh `#1/#7/#9/#11`, sa bàn, Cryo).
 * 4. Hai Cầu Thang Vomitory 12 bậc (`left_stair` `X ∈ [-5.6, -3.4]`, `right_stair` `X ∈ [3.4, 5.6]`, `Z: 14.8 → 20.2`, `Y: 0 → 3.4`):
 *    - Dẫn thẳng từ hành lang đường hầm lên **Khán Đài Nam (`stands_south`, `Y = 3.4`)** & **Sảnh VIP (`trophy_vip`)**.
 * 5. `stands_south` (`X ∈ [-22.0, 22.0], Z ∈ [18.5, 25.2], Y = 3.4`):
 *    - 10 ghế ngồi cổ động viên sát lan can kính nhìn xuống toàn bộ **Sân Cỏ 11v11 (`X ∈ [-21, 21], Z ∈ [30, 58], Y = 0.8`)**!
 * 6. `pitchside` (`X ∈ [-18.0, 18.0], Z ∈ [22.0, 27.2], Y = 0.8`):
 *    - Đứng sát đường piste xem **2 Cabin Kỹ Thuật (HLV + Dự bị)**, **3 Trọng tài**, **Dàn An ninh** dọc rào chắn `Z = 27.5` (ngăn chạy vào cỏ).
 */
export function buildStadiumTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. ĐỒ THỊ KHÔNG GIAN SVĐ TRỐNG ĐỒNG FIFA (STADIUM_NAV_GRAPH) ==================== */
var STADIUM_NAV_GRAPH = {
  zones: [
    { id: 'gate_plaza',    minX: -10.0, maxX: 10.0, minZ: -10.0, maxZ: 0.0,  floorY: 0.0 },
    { id: 'main_tunnel',   minX: -2.4,  maxX: 2.4,  minZ: 0.0,   maxZ: 15.0, floorY: 0.0 },
    { id: 'home_locker',   minX: -14.0, maxX: -2.4, minZ: 4.0,   maxZ: 12.6, floorY: 0.0 },
    { id: 'away_locker',   minX: 2.4,   maxX: 14.0, minZ: 4.0,   maxZ: 12.6, floorY: 0.0 },
    { id: 'vom_left_f',    minX: -5.8,  maxX: -2.4, minZ: 12.8,  maxZ: 15.0, floorY: 0.0 },
    { id: 'vom_right_f',   minX: 2.4,   maxX: 5.8,  minZ: 12.8,  maxZ: 15.0, floorY: 0.0 },
    { id: 'player_tunnel', minX: -2.4,  maxX: 2.4,  minZ: 15.0,  maxZ: 22.0, floorY: 0.4 },
    { id: 'pitchside',     minX: -18.0, maxX: 18.0, minZ: 22.0,  maxZ: 27.2, floorY: 0.8 },
    { id: 'stands_south',  minX: -22.0, maxX: 22.0, minZ: 18.5,  maxZ: 25.2, floorY: 3.4 },
    { id: 'trophy_vip',    minX: 6.2,   maxX: 16.0, minZ: 6.0,   maxZ: 18.5, floorY: 3.4 }
  ],
  ramps: [
    { id: 'tunnel_ramp', axis: 'z', minX: -2.4, maxX: 2.4,  zStart: 15.0, zEnd: 22.0, yStart: 0.0, yEnd: 0.8, maxCurY: 2.1 },
    { id: 'left_stair',  axis: 'z', minX: -5.6, maxX: -3.4, zStart: 14.8, zEnd: 20.2, yStart: 0.0, yEnd: 3.4 },
    { id: 'right_stair', axis: 'z', minX: 3.4,  maxX: 5.6,  zStart: 14.8, zEnd: 20.2, yStart: 0.0, yEnd: 3.4 }
  ],
  edges: [
    {
      from: 'gate_plaza', to: 'main_tunnel',
      waypointsForward: [{ x: 0.0, y: 0.0, z: 0.8 }],
      waypointsBackward: [{ x: 0.0, y: 0.0, z: -0.9 }]
    },
    {
      from: 'main_tunnel', to: 'home_locker',
      waypointsForward: [{ x: -3.0, y: 0.0, z: 8.6 }],
      waypointsBackward: [{ x: -1.6, y: 0.0, z: 8.6 }]
    },
    {
      from: 'main_tunnel', to: 'away_locker',
      waypointsForward: [{ x: 3.0, y: 0.0, z: 8.6 }],
      waypointsBackward: [{ x: 1.6, y: 0.0, z: 8.6 }]
    },
    {
      from: 'main_tunnel', to: 'vom_left_f',
      waypointsForward: [{ x: -3.2, y: 0.0, z: 13.9 }],
      waypointsBackward: [{ x: -1.5, y: 0.0, z: 13.9 }]
    },
    {
      from: 'main_tunnel', to: 'vom_right_f',
      waypointsForward: [{ x: 3.2, y: 0.0, z: 13.9 }],
      waypointsBackward: [{ x: 1.5, y: 0.0, z: 13.9 }]
    },
    {
      from: 'vom_left_f', to: 'stands_south',
      waypointsForward: [
        { x: -4.5, y: 0.0, z: 14.6 },
        { x: -4.5, y: 3.4, z: 20.4 },
        { x: -4.5, y: 3.4, z: 22.0 }
      ],
      waypointsBackward: [
        { x: -4.5, y: 3.4, z: 22.0 },
        { x: -4.5, y: 3.4, z: 20.4 },
        { x: -4.5, y: 0.0, z: 14.6 }
      ]
    },
    {
      from: 'vom_right_f', to: 'stands_south',
      waypointsForward: [
        { x: 4.5, y: 0.0, z: 14.6 },
        { x: 4.5, y: 3.4, z: 20.4 },
        { x: 4.5, y: 3.4, z: 22.0 }
      ],
      waypointsBackward: [
        { x: 4.5, y: 3.4, z: 22.0 },
        { x: 4.5, y: 3.4, z: 20.4 },
        { x: 4.5, y: 0.0, z: 14.6 }
      ]
    },
    {
      from: 'stands_south', to: 'trophy_vip',
      waypointsForward: [{ x: 10.0, y: 3.4, z: 17.8 }],
      waypointsBackward: [{ x: 10.0, y: 3.4, z: 19.2 }]
    },
    {
      from: 'main_tunnel', to: 'player_tunnel',
      waypointsForward: [{ x: 0.0, y: 0.0, z: 14.8 }],
      waypointsBackward: [{ x: 0.0, y: 0.0, z: 15.2 }]
    },
    {
      from: 'player_tunnel', to: 'pitchside',
      waypointsForward: [{ x: 0.0, y: 0.8, z: 22.3 }],
      waypointsBackward: [{ x: 0.0, y: 0.8, z: 21.8 }]
    }
  ],
  outerBounds: { minX: -24.5, maxX: 24.5, minZ: -10.5, maxZ: 64.0, minY: 0.65, maxY: 16.0 },
  wallMargin: 0.36,
  dividerWalls: [
    // Mặt tiền Cổng A tại Z = 0: chừa cổng vào đường hầm X ∈ [-2.2, 2.2]
    { axis: 'z', pos: 0.0, minSpan: -10.0, maxSpan: 10.0, minY: 0.0, maxY: 4.2, openings: [{ a1: -2.2, a2: 2.2, y1: 0.0, y2: 3.5 }] },
    // Hai vách trục Đường Hầm (X = ±2.4, maxY = 3.25 nằm dưới sàn Khán Đài Nam Y=3.4): mở cửa 2 Phòng Thay Đồ & 2 Cầu thang Vomitory
    {
      axis: 'x', pos: -2.4, minSpan: 0.0, maxSpan: 22.0, minY: 0.0, maxY: 3.25,
      openings: [{ a1: 6.6, a2: 10.6, y1: 0.0, y2: 3.2 }, { a1: 12.8, a2: 15.0, y1: 0.0, y2: 3.2 }]
    },
    {
      axis: 'x', pos: 2.4, minSpan: 0.0, maxSpan: 22.0, minY: 0.0, maxY: 3.25,
      openings: [{ a1: 6.6, a2: 10.6, y1: 0.0, y2: 3.2 }, { a1: 12.8, a2: 15.0, y1: 0.0, y2: 3.2 }]
    },
    // Bao ngoài Phòng Thay Đồ ĐT Việt Nam (Trái: X = -14.0, Z = 4.0, Z = 12.6)
    { axis: 'x', pos: -14.0, minSpan: 4.0, maxSpan: 12.6, minY: 0.0, maxY: 3.8, openings: [] },
    { axis: 'z', pos: 4.0, minSpan: -14.0, maxSpan: -2.4, minY: 0.0, maxY: 3.8, openings: [] },
    { axis: 'z', pos: 12.6, minSpan: -14.0, maxSpan: -2.4, minY: 0.0, maxY: 3.8, openings: [] },
    // Bao ngoài Phòng Thay Đồ Đội Khách (Phải: X = 14.0, Z = 4.0, Z = 12.6)
    { axis: 'x', pos: 14.0, minSpan: 4.0, maxSpan: 12.6, minY: 0.0, maxY: 3.8, openings: [] },
    { axis: 'z', pos: 4.0, minSpan: 2.4, maxSpan: 14.0, minY: 0.0, maxY: 3.8, openings: [] },
    { axis: 'z', pos: 12.6, minSpan: 2.4, maxSpan: 14.0, minY: 0.0, maxY: 3.8, openings: [] },
    // Rào An Ninh sát đường biên Pitchside (Z = 27.2) + 2 biên piste (X = ±18.0)
    { axis: 'z', pos: 27.2, minSpan: -18.0, maxSpan: 18.0, minY: 0.8, maxY: 3.0, openings: [] },
    { axis: 'x', pos: -18.0, minSpan: 22.0, maxSpan: 27.2, minY: 0.8, maxY: 3.0, openings: [] },
    { axis: 'x', pos: 18.0, minSpan: 22.0, maxSpan: 27.2, minY: 0.8, maxY: 3.0, openings: [] },
    // Lan can Khán Đài Nam (Z = 25.2) & Sảnh VIP (Z = 6.0, X = 6.2, X = 16.0)
    { axis: 'z', pos: 25.2, minSpan: -22.0, maxSpan: 22.0, minY: 3.4, maxY: 6.5, openings: [] },
    { axis: 'z', pos: 18.5, minSpan: -22.0, maxSpan: 22.0, minY: 3.4, maxY: 6.5, openings: [{ a1: 6.4, a2: 15.8, y1: 3.4, y2: 6.5 }] },
    { axis: 'x', pos: -22.0, minSpan: 18.5, maxSpan: 25.2, minY: 3.4, maxY: 6.5, openings: [] },
    { axis: 'x', pos: 22.0, minSpan: 18.5, maxSpan: 25.2, minY: 3.4, maxY: 6.5, openings: [] }
  ],
  slabs: [
    // Trần Hậu Trường & Đường Hầm Y = 3.8 (mở lỗ 2 cầu thang Vomitory & mở thông ngoài trời Z < 0 / Z > 22)
    { minX: -14.0, maxX: 14.0, minZ: 0.0, maxZ: 15.0, yLow: 3.65, yHigh: 3.92 },
    // Sàn Khán Đài Nam Y = 3.4 (chừa 2 lỗ thang Vomitory X ∈ [-5.7, -3.3] & [3.3, 5.7], Z ∈ [14.8, 20.2])
    { minX: -22.0, maxX: -5.7, minZ: 18.5, maxZ: 25.2, yLow: 3.28, yHigh: 3.48 },
    { minX: -3.3,  maxX: 3.3,  minZ: 18.5, maxZ: 25.2, yLow: 3.28, yHigh: 3.48 },
    { minX: 5.7,   maxX: 22.0, minZ: 18.5, maxZ: 25.2, yLow: 3.28, yHigh: 3.48 },
    { minX: -5.7,  maxX: -3.3, minZ: 20.2, maxZ: 25.2, yLow: 3.28, yHigh: 3.48 },
    { minX: 3.3,   maxX: 5.7,  minZ: 20.2, maxZ: 25.2, yLow: 3.28, yHigh: 3.48 },
    // Sàn Sảnh Cúp Vàng VIP Y = 3.4
    { minX: 6.2,   maxX: 16.0, minZ: 6.0,  maxZ: 18.5, yLow: 3.28, yHigh: 3.48 }
  ],
  camBoxes: [
    { x1: 9.95, y1: 3.4, z1: 10.2, x2: 12.45, y2: 5.4, z2: 12.2 }
  ]
};

function getStadiumSurfaceY(x, z, curY) {
  if (typeof getNavGraphSurfaceY === 'function') {
    return getNavGraphSurfaceY(STADIUM_NAV_GRAPH, x, z, curY);
  }
  if (x >= -5.6 && x <= -3.4 && z >= 14.8 && z <= 20.2) {
    return Math.max(0, Math.min(1, (z - 14.8) / 5.4)) * 3.4;
  }
  if (x >= 3.4 && x <= 5.6 && z >= 14.8 && z <= 20.2) {
    return Math.max(0, Math.min(1, (z - 14.8) / 5.4)) * 3.4;
  }
  if (x >= -2.4 && x <= 2.4 && z >= 15.0 && z <= 22.0 && (curY || 0) <= 2.1) {
    return Math.max(0, Math.min(1, (z - 15.0) / 7.0)) * 0.8;
  }
  if ((curY || 0) >= 2.2) return 3.4;
  if (z >= 22.0) return 0.8;
  return 0.0;
}

function getStadiumZoneAt(x, y, z) {
  if ((y || 0) >= 2.2) {
    return (z < 18.5 && x >= 6.0) ? 'trophy_vip' : 'stands_south';
  }
  if (z < 0.0) return 'gate_plaza';
  if (z >= 22.0) return 'pitchside';
  if (z > 15.0 && Math.abs(x) <= 2.4) return 'player_tunnel';
  if (x < -2.4 && z >= 4.0 && z <= 12.6) return 'home_locker';
  if (x > 2.4 && z >= 4.0 && z <= 12.6) return 'away_locker';
  return 'main_tunnel';
}

function createStadiumStools() {
  var stools = [];
  var xs = [-15.0, -11.5, -8.5, -5.5, -2.0, 2.0, 5.5, 8.5, 11.5, 15.0];
  for (var i = 0; i < xs.length; i++) {
    stools.push({ id: i, x: xs[i], y: 3.4, z: 23.6, lookX: 0.0, lookZ: 44.0 });
  }
  return stools;
}

function createStadiumNpcs() {
  var npcs = [];
  // 1. 11 Cầu Thủ ĐT Việt Nam (1 GK + 10 Cầu thủ sân cỏ X ∈ [-20.5, 20.5], Z ∈ [30.5, 57.5], Y = 0.8)
  npcs.push({ x: -19.8, y: 0.8, z: 44.0, vx: 0.0, vz: 1.4, minX: -20.1, maxX: -19.5, minZ: 41.2, maxZ: 46.8, yaw: Math.PI * 0.5, role: 'gk', shirt: '#16A34A', hair: '#1C1917', moving: true, seated: false, phase: 0.2, carryProp: 'none' });
  var vnForm = [
    [-14.5, 34.5], [-14.0, 41.0], [-14.0, 47.0], [-14.5, 53.5],
    [-6.5, 36.5],  [-4.5, 44.0],  [-6.5, 51.5],
    [4.0, 35.0],   [6.5, 44.0],   [4.0, 53.0]
  ];
  for (var vi = 0; vi < vnForm.length; vi++) {
    var vp = vnForm[vi];
    npcs.push({
      x: vp[0], y: 0.8, z: vp[1],
      vx: (vi % 2 === 0 ? 1.7 : -1.5), vz: (vi % 3 === 0 ? 1.3 : -1.2),
      minX: Math.max(-18.5, vp[0] - 5.2), maxX: Math.min(18.0, vp[0] + 5.8),
      minZ: Math.max(31.2, vp[1] - 4.0),  maxZ: Math.min(56.8, vp[1] + 4.0),
      yaw: Math.PI * 0.5,
      role: vi === 8 ? 'vn_captain' : 'vn_player',
      shirt: '#DC2626', hair: vi % 2 === 0 ? '#1C1917' : '#292524',
      moving: true, seated: false, phase: vi * 0.45, carryProp: 'none'
    });
  }

  // 2. 11 Cầu Thủ Đội Khách (1 GK + 10 Cầu thủ áo Xanh Dương)
  npcs.push({ x: 19.8, y: 0.8, z: 44.0, vx: 0.0, vz: -1.4, minX: 19.5, maxX: 20.1, minZ: 41.2, maxZ: 46.8, yaw: -Math.PI * 0.5, role: 'gk', shirt: '#EAB308', hair: '#451A03', moving: true, seated: false, phase: 0.7, carryProp: 'none' });
  var awForm = [
    [14.5, 34.5], [14.0, 41.0], [14.0, 47.0], [14.5, 53.5],
    [6.5, 36.5],  [4.5, 44.0],  [6.5, 51.5],
    [-4.0, 35.0], [-6.5, 44.0], [-4.0, 53.0]
  ];
  for (var ai = 0; ai < awForm.length; ai++) {
    var ap = awForm[ai];
    npcs.push({
      x: ap[0], y: 0.8, z: ap[1],
      vx: (ai % 2 === 0 ? -1.6 : 1.5), vz: (ai % 3 === 0 ? -1.3 : 1.2),
      minX: Math.max(-18.0, ap[0] - 5.8), maxX: Math.min(18.5, ap[0] + 5.2),
      minZ: Math.max(31.2, ap[1] - 4.0),  maxZ: Math.min(56.8, ap[1] + 4.0),
      yaw: -Math.PI * 0.5,
      role: 'away_player',
      shirt: '#2563EB', hair: ai % 2 === 0 ? '#451A03' : '#1E293B',
      moving: true, seated: false, phase: ai * 0.52, carryProp: 'none'
    });
  }

  // 3. Đủ 3 Trọng Tài (1 Trọng tài chính giữa sân + 2 Trọng tài biên cầm cờ dọc biên Bắc/Nam)
  npcs.push({ x: 0.0, y: 0.8, z: 44.0, vx: 1.1, vz: 0.8, minX: -11.0, maxX: 11.0, minZ: 34.0, maxZ: 54.0, yaw: 0.4, role: 'referee', shirt: '#0F172A', hair: '#111827', moving: true, seated: false, phase: 0.3, carryProp: 'none' });
  npcs.push({ x: -5.0, y: 0.8, z: 29.4, vx: 1.4, vz: 0.0, minX: -19.5, maxX: 0.5, minZ: 29.3, maxZ: 29.5, yaw: 0.0, role: 'linesman', shirt: '#0F172A', hair: '#1C1917', moving: true, seated: false, phase: 1.1, carryProp: 'flag' });
  npcs.push({ x: 5.0,  y: 0.8, z: 58.6, vx: -1.4, vz: 0.0, minX: -0.5, maxX: 19.5, minZ: 58.5, maxZ: 58.7, yaw: Math.PI, role: 'linesman', shirt: '#0F172A', hair: '#292524', moving: true, seated: false, phase: 1.9, carryProp: 'flag' });

  // 4. Hai Cabin Kỹ Thuật Đầy Đủ (2 HLV trưởng chỉ đạo + 8 Cầu thủ dự bị ngồi ghế băng ngoài đường pitch)
  npcs.push({ x: -4.2, y: 0.8, z: 25.4, yaw: 0.1, role: 'vn_coach', shirt: '#1E3A8A', hair: '#1C1917', moving: false, seated: false, phase: 0.4, carryProp: 'board' });
  npcs.push({ x:  4.2, y: 0.8, z: 25.4, yaw: -0.1, role: 'away_coach', shirt: '#0F172A', hair: '#451A03', moving: false, seated: false, phase: 0.9, carryProp: 'board' });
  for (var sh = 0; sh < 4; sh++) {
    npcs.push({ x: -9.6 + sh * 1.25, y: 0.8, z: 24.4, yaw: 0.0, role: 'sub_home', shirt: '#F97316', hair: '#1C1917', moving: false, seated: true, phase: sh * 0.6, carryProp: 'none' });
    npcs.push({ x:  5.8 + sh * 1.25, y: 0.8, z: 24.4, yaw: 0.0, role: 'sub_away', shirt: '#84CC16', hair: '#292524', moving: false, seated: true, phase: sh * 0.7, carryProp: 'none' });
  }

  // 5. Lực Lượng An Ninh Áo Phản Quang (Cổng Soát Vé, 2 Phòng Thay Đồ & Dàn An Ninh Biên Sân)
  var stewards = [
    [-2.6, 0.0, -0.5, Math.PI], [2.6, 0.0, -0.5, Math.PI],
    [-2.8, 0.0, 6.6, Math.PI * 0.5], [2.8, 0.0, 6.6, -Math.PI * 0.5],
    [-15.0, 0.8, 27.0, Math.PI], [-9.2, 0.8, 27.0, Math.PI], [-3.0, 0.8, 27.0, Math.PI],
    [3.0, 0.8, 27.0, Math.PI], [9.2, 0.8, 27.0, Math.PI], [15.0, 0.8, 27.0, Math.PI]
  ];
  for (var si = 0; si < stewards.length; si++) {
    var stw = stewards[si];
    npcs.push({
      x: stw[0], y: stw[1], z: stw[2], yaw: stw[3],
      role: 'steward', shirt: '#FACC15', hair: '#1E293B',
      moving: false, seated: false, phase: si * 0.35, carryProp: 'none'
    });
  }

  // 6. Hậu Trường 2 Nhánh Phòng Thay Đồ + Sảnh Cúp Vàng + Báo Chí Biên Sân
  npcs.push({ x: -8.2, y: 0.0, z: 6.2, yaw: 0.4, role: 'vn_player', shirt: '#DC2626', hair: '#1C1917', moving: false, seated: false, phase: 0.3, carryProp: 'ball' });
  npcs.push({ x: 8.2,  y: 0.0, z: 6.2, yaw: -0.4, role: 'away_player', shirt: '#2563EB', hair: '#451A03', moving: false, seated: false, phase: 1.1, carryProp: 'none' });
  npcs.push({ x: 11.2, y: 3.4, z: 13.6, yaw: 0.0, role: 'press', shirt: '#475569', hair: '#1C1917', moving: false, seated: false, phase: 0.8, carryProp: 'camera' });
  npcs.push({ x: -13.5, y: 0.8, z: 26.8, yaw: 0.2, role: 'press', shirt: '#0F766E', hair: '#292524', moving: false, seated: false, phase: 1.5, carryProp: 'camera' });

  // 7. Cổ Động Viên Ngồi & Vẫy Cờ Khắp Khán Đài (Hàng ghế Nam + Tây + Đông + Bắc)
  var fanCols = ['#DC2626', '#FACC15', '#E11D48', '#FFFFFF'];
  for (var fsi = 0; fsi < 8; fsi++) {
    var fx = -16.8 + fsi * 4.8;
    if (Math.abs(fx - 2.0) < 0.8 || Math.abs(fx + 2.0) < 0.8) fx += 1.2;
    npcs.push({
      x: fx, y: 3.4, z: 23.6, yaw: 0.0,
      role: 'vn_fan', shirt: fanCols[fsi % fanCols.length], hair: '#1C1917',
      moving: false, seated: true, phase: fsi * 0.4,
      carryProp: (fsi % 2 === 0) ? 'vn_flag' : 'none'
    });
  }
  for (var fni = 0; fni < 8; fni++) {
    npcs.push({
      x: -17.5 + fni * 5.0, y: 3.8, z: 62.0, yaw: Math.PI,
      role: 'vn_fan', shirt: fanCols[(fni + 1) % fanCols.length], hair: '#292524',
      moving: false, seated: true, phase: fni * 0.55,
      carryProp: (fni % 2 === 1) ? 'vn_flag' : 'none'
    });
  }
  for (var fwi = 0; fwi < 4; fwi++) {
    npcs.push({ x: -24.2, y: 3.8, z: 33.0 + fwi * 7.2, yaw: Math.PI * 0.5, role: 'vn_fan', shirt: '#DC2626', hair: '#1C1917', moving: false, seated: true, phase: fwi * 0.7, carryProp: 'vn_flag' });
    npcs.push({ x:  24.2, y: 3.8, z: 33.0 + fwi * 7.2, yaw: -Math.PI * 0.5, role: 'vn_fan', shirt: '#DC2626', hair: '#292524', moving: false, seated: true, phase: fwi * 0.8, carryProp: 'vn_flag' });
  }
  return npcs;
}

function createStadiumTpsState() {
  var npcs = createStadiumNpcs();
  var stools = createStadiumStools();
  var traffic = (typeof createSaigonBackdropTraffic === 'function')
    ? createSaigonBackdropTraffic()
    : { vehicles: [], boats: [] };

  return {
    room: 'gate_plaza',
    zone: 'gate_plaza',
    skyModeOverride: 'night',
    pig: {
      x: 0.0, y: 0.0, z: -4.5, yaw: 0.0,
      targetX: 0.0, targetZ: -4.5,
      waypoints: [],
      walking: false, seated: false, eating: false,
      seatChairId: -1, pendingSeatId: -1, pendingAction: null,
      wearingVietnamKit: false, wearingKit: false,
      outfit: 'none', liftedTrophy: false,
      cheering: false, _stuckTimer: 0
    },
    stools: stools,
    npcs: npcs,
    traffic: traffic,
    ball: { x: 0.0, y: 0.94, z: 44.0, shooting: false, shootT: 0 },
    vnScore: 2,
    goalFlashUntil: 0,
    confettiUntil: 0,
    waveUntil: 0,
    rightDoorOpen: 0.45,
    exitFade: 0,
    exiting: false,
    ripples: [],
    toast: 'Chào mừng tới SVĐ Trống Đồng FIFA! Hãy qua Cổng Soát Vé → Đường Hầm (2 Phòng Thay Đồ) → Lên Khán Đài ngồi xem trận 11v11! ⚽🏟️',
    toastUntil: 5.5,
    t: 0
  };
}

function clampStadiumWalkPos(st, x, z, yArg) {
  var y = typeof yArg === 'number' ? yArg : (st && st.pig ? (st.pig.y || 0) : 0);
  var nx = x, nz = z;

  // 1. Khán Đài Nam & Sảnh Cúp Vàng VIP (Y >= 2.2)
  if (y >= 2.2) {
    if (nz < 18.5 && nx >= 6.0) {
      nx = Math.max(6.45, Math.min(15.65, nx));
      nz = Math.max(6.35, Math.min(18.5, nz));
      if (nx > 9.6 && nx < 12.8 && nz > 9.9 && nz < 12.5) {
        if (Math.abs(nx - 11.2) > Math.abs(nz - 11.2)) nx = nx < 11.2 ? 9.6 : 12.8;
        else nz = nz < 11.2 ? 9.9 : 12.5;
      }
      return { x: nx, z: nz };
    }
    if (nz < 20.2 && ((nx >= -5.7 && nx <= -3.3) || (nx >= 3.3 && nx <= 5.7))) {
      var sxMid = nx < 0 ? -4.5 : 4.5;
      nx = Math.max(sxMid - 0.95, Math.min(sxMid + 0.95, nx));
      nz = Math.max(14.8, Math.min(20.4, nz));
      return { x: nx, z: nz };
    }
    nx = Math.max(-21.5, Math.min(21.5, nx));
    nz = Math.max(18.85, Math.min(24.75, nz));
    return { x: nx, z: nz };
  }

  // 2. Đường Dốc Hầm Cầu Thủ (Z ∈ [15.0, 22.0] trong hành lang trung tâm)
  if (nz > 14.95 && nz < 22.05 && Math.abs(nx) <= 2.45) {
    nx = Math.max(-2.05, Math.min(2.05, nx));
    nz = Math.max(14.95, Math.min(22.05, nz));
    return { x: nx, z: nz };
  }

  // 3. Đường Piste Biên Sân & 2 Cabin Kỹ Thuật (Z >= 22.0) — Rào An Ninh Z = 27.2 chặn xâm nhập sân cỏ 11v11!
  if (nz >= 22.0) {
    nx = Math.max(-17.5, Math.min(17.5, nx));
    nz = Math.max(22.05, Math.min(26.85, nz));
    var dugouts = [
      { x1: -10.5, z1: 23.8, x2: -3.5, z2: 25.8 },
      { x1:   3.5, z1: 23.8, x2: 10.5, z2: 25.8 }
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

  // 4. Quảng Trường Cổng A Ngoài Trời (Z < 0)
  if (nz < 0.0) {
    nx = Math.max(-9.4, Math.min(9.4, nx));
    nz = Math.max(-9.2, Math.min(-0.15, nz));
    return { x: nx, z: nz };
  }

  // 5. Trục Đường Hầm + 2 Nhánh Phòng Thay Đồ + 2 Chân Thang Vomitory (Y = 0, Z ∈ [0, 15.0])
  if (nx < -2.4 && nz >= 4.0 && nz <= 12.6) {
    nx = Math.max(-13.6, Math.min(-2.5, nx));
    nz = Math.max(4.35, Math.min(12.25, nz));
    var homeBoxes = [
      { x1: -13.95, z1: 4.5, x2: -12.4, z2: 12.1 },
      { x1: -9.3,   z1: 7.6, x2: -7.1,  z2: 9.2 },
      { x1: -12.2,  z1: 4.2, x2: -10.5, z2: 5.7 }
    ];
    for (var hi = 0; hi < homeBoxes.length; hi++) {
      var hb = homeBoxes[hi];
      if (nx > hb.x1 - 0.34 && nx < hb.x2 + 0.34 && nz > hb.z1 - 0.34 && nz < hb.z2 + 0.34) {
        if (Math.abs(nx - (hb.x1 + hb.x2) * 0.5) > Math.abs(nz - (hb.z1 + hb.z2) * 0.5)) {
          nx = nx < (hb.x1 + hb.x2) * 0.5 ? hb.x1 - 0.34 : hb.x2 + 0.34;
        } else {
          nz = nz < (hb.z1 + hb.z2) * 0.5 ? hb.z1 - 0.34 : hb.z2 + 0.34;
        }
      }
    }
    return { x: nx, z: nz };
  }
  if (nx > 2.4 && nz >= 4.0 && nz <= 12.6) {
    nx = Math.max(2.5, Math.min(13.6, nx));
    nz = Math.max(4.35, Math.min(12.25, nz));
    var awayBoxes = [
      { x1: 12.4, z1: 4.5, x2: 13.95, z2: 12.1 },
      { x1: 7.1,  z1: 7.6, x2: 9.3,   z2: 9.2 },
      { x1: 10.5, z1: 4.2, x2: 12.2,  z2: 5.7 }
    ];
    for (var ai2 = 0; ai2 < awayBoxes.length; ai2++) {
      var ab = awayBoxes[ai2];
      if (nx > ab.x1 - 0.34 && nx < ab.x2 + 0.34 && nz > ab.z1 - 0.34 && nz < ab.z2 + 0.34) {
        if (Math.abs(nx - (ab.x1 + ab.x2) * 0.5) > Math.abs(nz - (ab.z1 + ab.z2) * 0.5)) {
          nx = nx < (ab.x1 + ab.x2) * 0.5 ? ab.x1 - 0.34 : ab.x2 + 0.34;
        } else {
          nz = nz < (ab.z1 + ab.z2) * 0.5 ? ab.z1 - 0.34 : ab.z2 + 0.34;
        }
      }
    }
    return { x: nx, z: nz };
  }
  if (nz >= 12.8 && (nx < -2.4 || nx > 2.4)) {
    nx = nx < 0 ? Math.max(-5.5, Math.min(-2.4, nx)) : Math.max(2.4, Math.min(5.5, nx));
    nz = Math.max(13.0, Math.min(19.8, nz));
    return { x: nx, z: nz };
  }
  nx = Math.max(-2.05, Math.min(2.05, nx));
  nz = Math.max(0.25, Math.min(15.0, nz));
  return { x: nx, z: nz };
}

/* ==================== 2. ĐIỀU HƯỚNG LIÊN HOÀN CHUẨN CỔ ĐỘNG VIÊN FIFA ==================== */
function planStadiumRealtimePath(st, tx, targetFloorY, tz, extraOpts) {
  var p = st.pig;
  var eo = extraOpts || {};
  var targetKind = eo.targetKind || 'floor';
  p.seated = false; p.seatChairId = -1; p.eating = false; p.cheering = false;
  p.pendingSeatId = typeof eo.seatChairId === 'number' ? eo.seatChairId : -1;
  p.pendingAction = eo.pendingAction || null;

  if (targetKind === 'left_stair' || targetKind === 'right_stair' || targetKind === 'tunnel_ramp') {
    var curY = p.y || 0;
    var wps = [];
    if (targetKind === 'left_stair' || targetKind === 'right_stair') {
      var sx = targetKind === 'left_stair' ? -4.5 : 4.5;
      if (curY >= 2.2) {
        if (p.z < 18.5 && p.x >= 6.0) wps.push({ x: 10.0, y: 3.4, z: 19.2 });
        wps.push({ x: sx, y: 3.4, z: 22.0 });
        wps.push({ x: sx, y: 3.4, z: 20.4 });
      } else {
        if (p.z < 0.0) wps.push({ x: 0.0, y: 0.0, z: 0.8 });
        if (p.x < -2.4 && p.z < 12.8) wps.push({ x: -1.6, y: 0.0, z: 8.6 });
        if (p.x > 2.4 && p.z < 12.8) wps.push({ x: 1.6, y: 0.0, z: 8.6 });
        if (p.z >= 22.0) wps.push({ x: 0.0, y: 0.8, z: 22.3 });
        if (p.z > 15.0 && Math.abs(p.x) <= 2.4) wps.push({ x: 0.0, y: 0.0, z: 14.8 });
        var onVomStairNow = (Math.abs(Math.abs(p.x) - 4.5) <= 1.15 && p.z >= 14.8 && p.z <= 20.2 && curY > 0.15 && curY < 3.25);
        if (!onVomStairNow) {
          wps.push({ x: sx * 0.72, y: 0.0, z: 13.9 });
          wps.push({ x: sx, y: 0.0, z: 14.6 });
        }
      }
    } else {
      if (curY >= 2.2) {
        wps.push({ x: p.x < 0 ? -4.5 : 4.5, y: 3.4, z: 22.0 });
        wps.push({ x: p.x < 0 ? -4.5 : 4.5, y: 3.4, z: 20.4 });
        wps.push({ x: p.x < 0 ? -4.5 : 4.5, y: 0.0, z: 14.6 });
        wps.push({ x: 0.0, y: 0.0, z: 14.8 });
      } else if (p.z < 0.0) {
        wps.push({ x: 0.0, y: 0.0, z: 0.8 });
      }
    }
    wps.push({ x: tx, y: targetFloorY, z: tz });
    p.waypoints = wps;
    p.targetX = wps[0].x; p.targetZ = wps[0].z;
    p.walking = true;
    return;
  }

  if (typeof planNavGraphRealtimePath === 'function') {
    var onAnyStair = (Math.abs(Math.abs(p.x) - 4.5) <= 1.2 && p.z > 14.9 && p.z < 20.1 && (p.y || 0) > 0.15 && (p.y || 0) < 3.25);
    planNavGraphRealtimePath(STADIUM_NAV_GRAPH, st, tx, targetFloorY, tz, eo);
    if (onAnyStair && p.waypoints && p.waypoints.length > 1) {
      if (targetFloorY >= 2.2 && p.waypoints[0].z < 15.2) p.waypoints.shift();
      else if (targetFloorY < 1.5 && p.waypoints[0].z > 20.0) {
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
    st.toast = st.pig.wearingVietnamKit ? 'Đã khoác Áo Đấu ĐT Việt Nam #10! Cùng lên Khán Đài cổ vũ thôi! 🇻🇳👕' : 'Đã cất áo đấu ĐT Việt Nam!';
    st.toastUntil = st.t + 3.8;
  } else if (actionId === 'inspect_away_tactics') {
    st.toast = 'Phòng Thay Đồ Đội Khách (đối xứng chuẩn FIFA): Đội hình 4-2-3-1 sẵn sàng đối đầu! 📋';
    st.toastUntil = st.t + 3.8;
  } else if (actionId === 'cheer_wave' || actionId === 'shoot_goal') {
    st.pig.cheering = true;
    st.waveUntil = st.t + 5.0;
    st.confettiUntil = st.t + 4.8;
    if (actionId === 'shoot_goal') {
      st.ball.x = 12.0; st.ball.y = 0.96; st.ball.z = 44.0;
      st.ball.shooting = true; st.ball.shootT = 0;
      st.vnScore = (st.vnScore || 2) + 1;
      st.goalFlashUntil = st.t + 3.8;
    }
    st.toast = '🇻🇳 VIỆT NAM VÔ ĐỊCH! Cả 4 mặt khán đài 135.000 chỗ đang làm sóng người Mexican Wave! 🎉🔥';
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

  if (typeof stepSaigonBackdropTraffic === 'function' && st.traffic) {
    stepSaigonBackdropTraffic(st.traffic, dt);
  }

  // 1. Chuyển động chú Heo Cổ Động Viên qua Cổng → Đường Hầm → 2 Phòng Thay Đồ / Thang Vomitory → Ghế Khán Đài
  if (!p.seated && p.walking) {
    var curWp = (p.waypoints && p.waypoints.length > 0) ? p.waypoints[0] : { x: p.targetX, z: p.targetZ };
    var dx = curWp.x - p.x, dz = curWp.z - p.z;
    var dist = Math.hypot(dx, dz);
    if (dist < 0.12) {
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
          st.toast = 'Đã lên Khán Đài ngồi xem trận 11v11! Bấm "Hô Vang Cổ Vũ" hoặc chạm sàn đứng dậy 📣⚽';
          st.toastUntil = st.t + 4.2;
        }
        if (p.pendingAction) {
          executeStadiumAction(st, p.pendingAction);
          p.pendingAction = null;
        }
      }
    } else {
      var onStairOrRamp = (Math.abs(Math.abs(p.x) - 4.5) <= 1.25 && p.z >= 14.8 && p.z <= 20.2) ||
                          (Math.abs(p.x) <= 2.4 && p.z >= 15.0 && p.z <= 22.0);
      var speedSt = onStairOrRamp ? 2.8 : 3.8;
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
    b.x += (20.2 - b.x) * Math.min(1, dt * 5.2);
    b.z += (44.0 - b.z) * Math.min(1, dt * 5.2);
    b.y = 0.94 + Math.sin(Math.min(1, b.shootT) * Math.PI) * 1.65;
    if (b.shootT >= 1.0) {
      b.shooting = false; b.shootT = 0;
      b.x = 0.0; b.y = 0.94; b.z = 44.0;
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

  // 3. Cửa cổng mở & Hiệu ứng thoát
  var targetDoor = st.exiting ? 0.95 : 0.45;
  st.rightDoorOpen += (targetDoor - st.rightDoorOpen) * Math.min(1, dt * 6.0);
  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.2);

  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== 3. RAYCAST CHỌN ĐIỂM 3D CHUẨN CỔ ĐỘNG VIÊN ==================== */
function raySphereStadium(ox, oy, oz, dx, dy, dz, cx, cy, cz, rad) {
  var ocx = cx - ox, ocy = cy - oy, ocz = cz - oz;
  var proj = ocx * dx + ocy * dy + ocz * dz;
  if (proj < 0.2 || proj > 56) return -1;
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

  // 1. Chạm Ghế Ngồi Khán Đài Nam (Y = 3.4, Z = 23.6) -> Leo Vomitory lên ngồi xem 11v11
  if (st.stools) {
    for (var si = 0; si < st.stools.length; si++) {
      var sl = st.stools[si];
      var hitS = raySphereStadium(ox, oy, oz, dx, dy, dz, sl.x, sl.y + 0.52, sl.z, 0.95);
      if (hitS > 0) {
        return { kind: 'seat', seatChairId: sl.id, x: sl.x, y: 3.4, z: sl.z };
      }
    }
  }

  // 2. Chạm Bục Cúp Vàng trên Sảnh VIP -> Tới nâng Cúp
  var cupHit = raySphereStadium(ox, oy, oz, dx, dy, dz, 11.2, 4.45, 11.2, 1.35);
  if (cupHit > 0) {
    return { kind: 'vip', x: 11.2, y: 3.4, z: 9.2, pendingAction: 'lift_trophy' };
  }

  // 3. Chạm Tủ Áo Phòng Thay Đồ ĐT Việt Nam (-X) -> Mặc/cất áo ĐT Việt Nam
  if (dx < -0.02) {
    var tLk = (-12.5 - ox) / dx;
    if (tLk > 0.3 && tLk < 20) {
      var ly = oy + dy * tLk, lz = oz + dz * tLk;
      if (ly >= 0 && ly <= 3.0 && lz >= 4.2 && lz <= 12.2) {
        return { kind: 'locker', x: -11.4, y: 0.0, z: Math.max(5.5, Math.min(11.4, lz)), pendingAction: 'wear_kit' };
      }
    }
  }

  // 4. Raycast trực tiếp lên 2 Cầu Thang Vomitory & Dốc Đường Hầm FIFA (rayRampQuad)
  if (typeof rayRampQuad === 'function') {
    var leftStHit = rayRampQuad(ox, oy, oz, dx, dy, dz, {
      axis: 'z', minX: -5.6, maxX: -3.4, zStart: 14.8, zEnd: 20.2, yStart: 0.0, yEnd: 3.4
    });
    if (leftStHit) return { kind: 'left_stair', x: leftStHit.x, y: leftStHit.y, z: leftStHit.z };

    var rightStHit = rayRampQuad(ox, oy, oz, dx, dy, dz, {
      axis: 'z', minX: 3.4, maxX: 5.6, zStart: 14.8, zEnd: 20.2, yStart: 0.0, yEnd: 3.4
    });
    if (rightStHit) return { kind: 'right_stair', x: rightStHit.x, y: rightStHit.y, z: rightStHit.z };

    var tunnelHit = rayRampQuad(ox, oy, oz, dx, dy, dz, {
      axis: 'z', minX: -2.4, maxX: 2.4, zStart: 15.0, zEnd: 22.0, yStart: 0.0, yEnd: 0.8
    });
    if (tunnelHit) return { kind: 'tunnel_ramp', x: tunnelHit.x, y: tunnelHit.y, z: tunnelHit.z };
  }

  // 5. Chạm các cao độ sàn hợp lệ: Khán Đài/VIP (Y=3.4) -> Piste Đường Biên (Y=0.8) -> Đường Hầm/Phòng Thay Đồ/Cổng A (Y=0.0)
  if (dy < -0.02) {
    var tStand = (3.4 - oy) / dy;
    if (tStand > 0.2 && tStand < 48) {
      var sx2 = ox + dx * tStand, sz2 = oz + dz * tStand;
      var inSouthStand = (sx2 >= -22.0 && sx2 <= 22.0 && sz2 >= 18.5 && sz2 <= 25.2);
      var inVipHall    = (sx2 >= 6.2 && sx2 <= 16.0 && sz2 >= 6.0 && sz2 < 18.5);
      if (inSouthStand || inVipHall) {
        return { kind: 'floor', x: sx2, y: 3.4, z: sz2 };
      }
    }
    var tPitchside = (0.8 - oy) / dy;
    if (tPitchside > 0.2 && tPitchside < 54) {
      var px2 = ox + dx * tPitchside, pz2 = oz + dz * tPitchside;
      if (px2 >= -18.0 && px2 <= 18.0 && pz2 >= 22.0 && pz2 <= 27.2) {
        return { kind: 'floor', x: px2, y: 0.8, z: pz2 };
      }
      // Chạm vào sân cỏ 11v11 -> cổ động viên tiến tới sát hàng rào an ninh gần nhất (hoặc nếu đang trên khán đài thì giữ nguyên)
      if ((st.pig.y || 0) < 2.2 && px2 >= -22.0 && px2 <= 22.0 && pz2 > 27.2 && pz2 <= 58.0) {
        return { kind: 'floor', x: Math.max(-17.2, Math.min(17.2, px2)), y: 0.8, z: 26.8 };
      }
    }
    var tFloor0 = (0.0 - oy) / dy;
    if (tFloor0 > 0.2 && tFloor0 < 38) {
      var fx0 = ox + dx * tFloor0, fz0 = oz + dz * tFloor0;
      var inPlaza = (fx0 >= -10.0 && fx0 <= 10.0 && fz0 >= -10.0 && fz0 <= 0.0);
      var inMainT = (fx0 >= -2.4 && fx0 <= 2.4 && fz0 >= 0.0 && fz0 <= 15.0);
      var inHomeL = (fx0 >= -14.0 && fx0 < -2.4 && fz0 >= 4.0 && fz0 <= 12.6);
      var inAwayL = (fx0 > 2.4 && fx0 <= 14.0 && fz0 >= 4.0 && fz0 <= 12.6);
      var inVomF  = (fz0 >= 12.8 && fz0 <= 15.0 && (Math.abs(fx0) >= 2.4 && Math.abs(fx0) <= 5.8));
      if (inPlaza || inMainT || inHomeL || inAwayL || inVomF) {
        return { kind: 'floor', x: fx0, y: 0.0, z: fz0 };
      }
    }
  }
  return null;
}

/* ==================== 4. RENDER WEBGL 3D SVĐ TRỐNG ĐỒNG FIFA 11v11 (60FPS) ==================== */
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
  var y0 = 0.8, zMid = 44.0;
  dm('cyl', 'white', xPos, y0 + 1.1, zMid - 2.6, 0, 0, 0, 0.12, 2.2, 0.12, { tint: [0.98, 0.99, 1.0, 1] });
  dm('cyl', 'white', xPos, y0 + 1.1, zMid + 2.6, 0, 0, 0, 0.12, 2.2, 0.12, { tint: [0.98, 0.99, 1.0, 1] });
  dm('box', 'white', xPos, y0 + 2.18, zMid,       0, 0, 0, 0.12, 0.12, 5.32, { tint: [0.98, 0.99, 1.0, 1] });
  wgl.setBlend('alpha');
  dm('box', 'white', xPos + dirSign * 0.65, y0 + 1.06, zMid, 0, 0, 0, 1.25, 2.1, 5.15, { tint: [0.92, 0.96, 1.0, 0.24] });
  wgl.setBlend(null);
}

function drawFloodlightTowerWebgl(wgl, x, z, lookYaw) {
  var dm = wgl.drawMesh;
  dm('box', 'white', x, 9.6, z, 0, 0, 0, 0.75, 17.6, 0.75, { tint: [0.42, 0.48, 0.56, 1] });
  dm('box', 'white', x, 18.6, z, 0.35, lookYaw, 0, 3.8, 1.6, 0.4, { tint: [0.20, 0.24, 0.30, 1] });
  dm('quad', 'white', x, 18.55, z, 0.35, lookYaw, 0, 3.4, 1.3, 1, { tint: [1.0, 0.96, 0.78, 1], emissive: 1.6 });
}

function drawSpectatorSeatWebgl(wgl, x, y, z, col) {
  var dm = wgl.drawMesh;
  dm('box', 'white', x, y + 0.18, z, 0, 0, 0, 0.52, 0.36, 0.46, { tint: col });
  dm('box', 'white', x, y + 0.52, z - 0.18, 0, 0, 0, 0.52, 0.48, 0.10, { tint: col });
}

function renderStadiumWebglScene(wgl, cam, st, W, H) {
  if (typeof computeWebglTpsCamera === 'function') {
    computeWebglTpsCamera(cam, st.pig, STADIUM_NAV_GRAPH, st._lastDt || 0.016);
  }
  var dm = wgl.drawMesh;
  var p = st.pig;
  var isOutdoor = (p.z < 0.0) || (p.y < 2.2 && p.z >= 19.5) || (p.y >= 2.2 && p.z >= 17.5);
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
      { pos: [-22.0, 16.5, 24.0], col: [1.18, 1.10, 0.92] },
      { pos: [ 22.0, 16.5, 24.0], col: [1.18, 1.10, 0.92] },
      { pos: [-22.0, 16.5, 62.0], col: [1.18, 1.10, 0.92] },
      { pos: [ 22.0, 16.5, 62.0], col: [1.18, 1.10, 0.92] }
    ],
    outdoorRect: [-1.0, 0.0, 0.0, 0.88],
    fogCol: [0.06, 0.12, 0.26],
    fogParams: [36.0, 74.0, 0.34]
  } : {
    clearColor: [0.14, 0.06, 0.05, 1.0],
    hemiLow: [0.26, 0.18, 0.14],
    hemiHigh: [0.64, 0.56, 0.46],
    sunDir: [0.35, 0.72, 0.58],
    sunCol: [0.98, 0.84, 0.62],
    wrapBias: 0.44,
    lights: [
      { pos: [0.0, 3.3, 6.0],  col: [1.15, 0.84, 0.46] },
      { pos: [-8.0, 3.2, 8.5], col: [1.12, 0.80, 0.42] },
      { pos: [ 8.0, 3.2, 8.5], col: [0.76, 0.90, 1.16] },
      { pos: [0.0, 3.3, 14.5], col: [1.08, 0.78, 0.38] }
    ],
    outdoorRect: [0.0, 0.0, 0.0, 0.0],
    fogCol: [0.16, 0.08, 0.06],
    fogParams: [16.0, 42.0, 0.38]
  };

  wgl.beginFrame(W, H, cam, atmo);

  // A. CHÂN TRỜI SKYLINE ĐÊM SÀI GÒN & ĐẠI LỘ NGOÀI CỔNG SVĐ
  if (typeof drawSaigonHorizonRing3D === 'function') {
    drawSaigonHorizonRing3D(wgl, st, { forceNight: true, cx: 0, cz: 32.0, y: 15.0, rx: 36, rz: 44, widthX: 88, widthZ: 96, height: 32 });
  } else {
    dm('quad', 'skyNightDome', 0, 18.0, 72.0, 0, Math.PI, 0, 92, 36, 1, { tint: [1, 1, 1, 1], emissive: 0.92 });
  }

  // B. QUẢNG TRƯỜNG CỔNG A SOÁT VÉ (gate_plaza: X ∈ [-10, 10], Z ∈ [-10, 0], Y = 0)
  dm('box', 'standConcrete', 0.0, -0.06, -5.0, 0, 0, 0, 20.0, 0.12, 10.0, { tint: [0.82, 0.80, 0.76, 1], us: 5, vs: 3 });
  dm('box', 'redCarpet',     0.0, 0.006, -5.0, 0, 0, 0, 4.4,  0.012, 10.0, { tint: [1, 1, 1, 1], us: 1, vs: 3 });
  // Ngoại cảnh đường phố & xe cộ phía trước Cổng A (Z < -10)
  if (typeof drawSaigonStreetBackdrop3D === 'function') {
    drawSaigonStreetBackdrop3D(wgl, st, { frontZ: -10.2, mirrorZ: true, widthX: 54.0, forceNight: true });
  }
  // Cổng Vòm Trống Đồng A & Trạm Soát Vé QR (X = ±2.4, Z = 0)
  dm('box', 'lockerWall', -6.2, 2.1, 0.0, 0, 0, 0, 7.6, 4.2, 0.32, { tint: [0.85, 0.76, 0.68, 1], us: 2.5, vs: 1.4 });
  dm('box', 'lockerWall',  6.2, 2.1, 0.0, 0, 0, 0, 7.6, 4.2, 0.32, { tint: [0.85, 0.76, 0.68, 1], us: 2.5, vs: 1.4 });
  dm('box', 'lockerWall',  0.0, 3.85, 0.0, 0, 0, 0, 5.2, 1.1, 0.36, { tint: [0.90, 0.78, 0.62, 1] });
  dm('quad', 'gateSign',   0.0, 3.85, -0.20, 0, 0, 0, 5.4, 1.25, 1, { tint: [1, 1, 1, 1], emissive: 0.55 });
  dm('box', 'white', -2.35, 0.55, -0.6, 0, 0, 0, 0.42, 1.1, 1.2, { tint: [0.16, 0.22, 0.32, 1] });
  dm('box', 'white',  2.35, 0.55, -0.6, 0, 0, 0, 0.42, 1.1, 1.2, { tint: [0.16, 0.22, 0.32, 1] });

  // C. TRỤC ĐƯỜNG HẦM TRUNG TÂM & 2 NHÁNH PHÒNG THAY ĐỒ ĐỐI XỨNG FIFA
  // Sàn Đường Hầm (Z = 0..15) + Dốc Hầm (Z = 15..22, Y: 0 → 0.8)
  dm('box',   'lockerFloor', 0.0, -0.05, 7.5, 0, 0, 0, 4.8, 0.1, 15.0, { tint: [1, 1, 1, 1], us: 2, vs: 5 });
  dm('box',   'redCarpet',   0.0, 0.006, 7.5, 0, 0, 0, 3.2, 0.012, 15.0, { tint: [1, 1, 1, 1], us: 1, vs: 5 });
  dm('wedge', 'redCarpet',   0.0, 0.40, 18.5, 0, 0, 0, 4.8, 0.80, 7.0, { tint: [1, 1, 1, 1], us: 1.2, vs: 3 });
  // Tường dọc Đường Hầm (chừa cổng 2 Phòng Thay Đồ Z ∈ [6.6, 10.6] & lối rẽ 2 Cầu thang Vomitory Z ∈ [12.8, 15.0])
  dm('box', 'lockerWall', -2.48, 1.8, 3.3,  0, 0, 0, 0.16, 3.6, 6.6, { tint: [1, 1, 1, 1], us: 2, vs: 1 });
  dm('box', 'lockerWall',  2.48, 1.8, 3.3,  0, 0, 0, 0.16, 3.6, 6.6, { tint: [1, 1, 1, 1], us: 2, vs: 1 });
  dm('box', 'lockerWall', -2.48, 1.8, 11.7, 0, 0, 0, 0.16, 3.6, 2.2, { tint: [1, 1, 1, 1] });
  dm('box', 'lockerWall',  2.48, 1.8, 11.7, 0, 0, 0, 0.16, 3.6, 2.2, { tint: [1, 1, 1, 1] });
  dm('box', 'lockerWall', -2.48, 1.8, 18.5, 0, 0, 0, 0.16, 3.6, 7.0, { tint: [1, 1, 1, 1], us: 2, vs: 1 });
  dm('box', 'lockerWall',  2.48, 1.8, 18.5, 0, 0, 0, 0.16, 3.6, 7.0, { tint: [1, 1, 1, 1], us: 2, vs: 1 });
  dm('quad', 'tunnelSign', 0.0,  3.15, 14.9, 0, Math.PI, 0, 4.6, 1.1, 1, { tint: [1, 1, 1, 1], emissive: 0.45 });

  // Nhánh Trái: Phòng Thay Đồ ĐT Việt Nam (home_locker: X ∈ [-14.0, -2.4], Z ∈ [4.0, 12.6])
  dm('box', 'lockerFloor', -8.2, -0.05, 8.3, 0, 0, 0, 11.6, 0.1, 8.6, { tint: [1, 1, 1, 1], us: 4, vs: 3 });
  dm('box', 'redCarpet',   -8.2, 0.006, 8.3, 0, 0, 0, 5.4, 0.012, 3.2, { tint: [1, 1, 1, 1], us: 2, vs: 1 });
  dm('box', 'lockerWall', -14.08, 1.9, 8.3, 0, 0, 0, 0.16, 3.8, 8.6, { tint: [1, 1, 1, 1], us: 3, vs: 1 });
  dm('box', 'lockerWall',  -8.2, 1.9, 3.92, 0, 0, 0, 11.6, 3.8, 0.16, { tint: [1, 1, 1, 1], us: 4, vs: 1 });
  dm('box', 'lockerWall',  -8.2, 1.9, 12.68,0, 0, 0, 11.6, 3.8, 0.16, { tint: [1, 1, 1, 1], us: 4, vs: 1 });
  dm('box', 'lockerWall',  -8.2, 3.8, 8.3,  0, 0, 0, 11.6, 0.16, 8.6, { tint: [0.8, 0.7, 0.65, 1], us: 4, vs: 3 });
  dm('quad', 'lockerCabinet', -13.94, 1.85, 8.3, 0, Math.PI * 0.5, 0, 7.6, 2.25, 1, { tint: [1, 1, 1, 1] });
  dm('quad', 'tacticsBoard',   -8.2, 2.05, 4.05, 0, 0, 0, 4.2, 2.05, 1, { tint: [1, 1, 1, 1] });
  dm('box', 'lockerWall', -8.2, 0.38, 8.4, 0, 0, 0, 2.1, 0.76, 1.4, { tint: [0.85, 0.55, 0.30, 1] });
  dm('box', 'fifaGrass',  -8.2, 0.78, 8.4, 0, 0, 0, 1.95, 0.04, 1.25, { tint: [1, 1, 1, 1] });
  dm('box', 'white', -11.35, 0.34, 4.95, 0, 0, 0, 1.5, 0.68, 1.3, { tint: [0.86, 0.92, 0.98, 1] });
  dm('box', 'white', -11.35, 0.69, 4.95, 0, 0, 0, 1.3, 0.05, 1.1, { tint: [0.22, 0.74, 0.96, 1], emissive: 0.4 });

  // Nhánh Phải: Phòng Thay Đồ Đội Khách (away_locker: X ∈ [2.4, 14.0], Z ∈ [4.0, 12.6])
  dm('box', 'lockerFloor', 8.2, -0.05, 8.3, 0, 0, 0, 11.6, 0.1, 8.6, { tint: [0.86, 0.92, 1.0, 1], us: 4, vs: 3 });
  dm('box', 'lockerWall',  14.08, 1.9, 8.3, 0, 0, 0, 0.16, 3.8, 8.6, { tint: [0.42, 0.54, 0.74, 1], us: 3, vs: 1 });
  dm('box', 'lockerWall',   8.2, 1.9, 3.92, 0, 0, 0, 11.6, 3.8, 0.16, { tint: [0.42, 0.54, 0.74, 1], us: 4, vs: 1 });
  dm('box', 'lockerWall',   8.2, 1.9, 12.68,0, 0, 0, 11.6, 3.8, 0.16, { tint: [0.42, 0.54, 0.74, 1], us: 4, vs: 1 });
  dm('box', 'lockerWall',   8.2, 3.8, 8.3,  0, 0, 0, 11.6, 0.16, 8.6, { tint: [0.35, 0.45, 0.62, 1], us: 4, vs: 3 });
  dm('quad', 'awayLockerCabinet', 13.94, 1.85, 8.3, 0, -Math.PI * 0.5, 0, 7.6, 2.25, 1, { tint: [1, 1, 1, 1] });
  dm('quad', 'awayTacticsBoard',   8.2, 2.05, 4.05, 0, 0, 0, 4.2, 2.05, 1, { tint: [1, 1, 1, 1] });
  dm('box', 'lockerWall', 8.2, 0.38, 8.4, 0, 0, 0, 2.1, 0.76, 1.4, { tint: [0.32, 0.44, 0.68, 1] });
  dm('box', 'fifaGrass',  8.2, 0.78, 8.4, 0, 0, 0, 1.95, 0.04, 1.25, { tint: [1, 1, 1, 1] });
  dm('box', 'white', 11.35, 0.34, 4.95, 0, 0, 0, 1.5, 0.68, 1.3, { tint: [0.86, 0.92, 0.98, 1] });
  dm('box', 'white', 11.35, 0.69, 4.95, 0, 0, 0, 1.3, 0.05, 1.1, { tint: [0.22, 0.74, 0.96, 1], emissive: 0.4 });

  // Trần Đường Hầm Trung Tâm & Hành Lang Vomitory (Z = 0..15)
  dm('box', 'lockerWall', 0.0, 3.72, 7.5, 0, 0, 0, 5.0, 0.16, 15.0, { tint: [0.78, 0.68, 0.62, 1], us: 1.5, vs: 5 });
  for (var tr = 2.5; tr <= 20.5; tr += 3.0) {
    dm('sphere', 'white', 0.0, 3.48, tr, 0, 0, 0, 0.28, 0.14, 0.28, { tint: [1.0, 0.92, 0.65, 1], emissive: 1.5 });
  }

  // D. 2 CẦU THANG VOMITORY 12 BẬC LÊN KHÁN ĐÀI NAM (left_stair X=-4.5 & right_stair X=+4.5, Z: 14.8 → 20.2, Y: 0 → 3.4)
  dm('box', 'standConcrete', -4.1, -0.04, 13.9, 0, 0, 0, 3.4, 0.08, 2.2, { tint: [0.75, 0.78, 0.82, 1] });
  dm('box', 'standConcrete',  4.1, -0.04, 13.9, 0, 0, 0, 3.4, 0.08, 2.2, { tint: [0.75, 0.78, 0.82, 1] });
  for (var vs = 0; vs < 12; vs++) {
    var vStepZ = 14.8 + (vs + 0.5) * (5.4 / 12);
    var vStepY = (vs + 1) * (3.4 / 12);
    dm('box', 'standConcrete', -4.5, vStepY * 0.5, vStepZ, 0, 0, 0, 2.2, vStepY, 0.46, { tint: [0.85, 0.86, 0.88, 1] });
    dm('box', 'standConcrete',  4.5, vStepY * 0.5, vStepZ, 0, 0, 0, 2.2, vStepY, 0.46, { tint: [0.85, 0.86, 0.88, 1] });
    dm('box', 'white', -4.5, vStepY, vStepZ - 0.19, 0, 0, 0, 2.22, 0.04, 0.06, { tint: [0.96, 0.74, 0.24, 1] });
    dm('box', 'white',  4.5, vStepY, vStepZ - 0.19, 0, 0, 0, 2.22, 0.04, 0.06, { tint: [0.96, 0.74, 0.24, 1] });
  }

  // E. KHÁN ĐÀI NAM (stands_south: Y = 3.4, 10 Ghế Cổ Động Viên) & SẢNH CÚP VÀNG VIP (trophy_vip)
  dm('box', 'standConcrete', -14.0, 3.34, 21.85, 0, 0, 0, 16.0, 0.12, 6.7, { tint: [0.86, 0.86, 0.88, 1], us: 5, vs: 2 });
  dm('box', 'standConcrete',   0.0, 3.34, 21.85, 0, 0, 0, 6.6,  0.12, 6.7, { tint: [0.86, 0.86, 0.88, 1], us: 2, vs: 2 });
  dm('box', 'standConcrete',  14.0, 3.34, 21.85, 0, 0, 0, 16.0, 0.12, 6.7, { tint: [0.86, 0.86, 0.88, 1], us: 5, vs: 2 });
  dm('box', 'standConcrete',  -4.5, 3.34, 22.7,  0, 0, 0, 2.4,  0.12, 5.0, { tint: [0.86, 0.86, 0.88, 1] });
  dm('box', 'standConcrete',   4.5, 3.34, 22.7,  0, 0, 0, 2.4,  0.12, 5.0, { tint: [0.86, 0.86, 0.88, 1] });
  // 10 Ghế Ngồi Cổ Động Viên trên Khán Đài Nam + Lan Can Kính Z = 25.1
  if (st.stools) {
    for (var sIdx = 0; sIdx < st.stools.length; sIdx++) {
      var seat = st.stools[sIdx];
      drawSpectatorSeatWebgl(wgl, seat.x, 3.4, seat.z, (sIdx % 3 === 1) ? [0.96, 0.78, 0.14, 1] : [0.84, 0.16, 0.14, 1]);
    }
  }
  dm('box', 'white', 0.0, 4.42, 25.15, 0, 0, 0, 44.0, 0.08, 0.08, { tint: [0.96, 0.78, 0.28, 1] });
  wgl.setBlend('alpha');
  dm('quad', 'white', 0.0, 3.92, 25.15, 0, 0, 0, 44.0, 1.0, 1, { tint: [0.74, 0.92, 1.0, 0.24] });
  wgl.setBlend(null);

  // Sảnh Cúp Vàng VIP bên cạnh Khán Đài Nam (X ∈ [6.2, 16.0], Z ∈ [6.0, 18.5], Y = 3.4)
  dm('box', 'vipMarble', 11.1, 3.34, 12.25, 0, 0, 0, 9.8, 0.12, 12.5, { tint: [1, 1, 1, 1], us: 4, vs: 4 });
  dm('box', 'redCarpet', 11.1, 3.406, 12.5, 0, 0, 0, 3.4, 0.012, 11.0, { tint: [1, 1, 1, 1], us: 1, vs: 4 });
  dm('box', 'lockerWall', 11.1, 5.1, 6.0,   0, 0, 0, 9.8, 3.4, 0.16, { tint: [1, 1, 1, 1], us: 3, vs: 1 });
  dm('box', 'lockerWall', 16.0, 5.1, 12.25, 0, 0, 0, 0.16, 3.4, 12.5, { tint: [1, 1, 1, 1], us: 4, vs: 1 });
  dm('box', 'lockerWall', 6.2,  5.1, 12.25, 0, 0, 0, 0.16, 3.4, 12.5, { tint: [1, 1, 1, 1], us: 4, vs: 1 });
  dm('quad', 'hallOfChampions',  11.1, 5.15, 6.12, 0, 0, 0, 6.2, 2.4, 1, { tint: [1, 1, 1, 1] });
  dm('quad', 'vipPressBackdrop', 15.88, 5.15, 12.8, 0, -Math.PI * 0.5, 0, 6.4, 2.5, 1, { tint: [1, 1, 1, 1] });
  drawStadiumTrophyAndDrumWebgl(wgl, 11.2, 3.4, 11.2, st.t);

  // F. SÂN CỎ 11v11 TRỐNG ĐỒNG (X ∈ [-21, 21], Z ∈ [30, 58], Y = 0.8) + ĐƯỜNG PISTE + 2 CABIN KỸ THUẬT + RÀO AN NINH
  dm('box', 'pisteTrack', 0.0, 0.72, 43.0, 0, 0, 0, 52.0, 0.14, 42.0, { tint: [1, 1, 1, 1], us: 10, vs: 8 });
  dm('box', 'fifaGrass',  0.0, 0.804, 44.0, 0, 0, 0, 42.0, 0.016, 28.0, { tint: [1, 1, 1, 1], us: 10, vs: 7 });
  // Vạch kẻ sân FIFA chuẩn + Vòng cấm địa Tây & Đông + Mặt Trời Trống Đồng giữa sân (0, 44.0)
  dm('box', 'white',  0.0,   0.818, 30.0, 0, 0, 0, 42.0, 0.01, 0.14, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'white',  0.0,   0.818, 58.0, 0, 0, 0, 42.0, 0.01, 0.14, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'white', -21.0,  0.818, 44.0, 0, 0, 0, 0.14, 0.01, 28.0, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'white',  21.0,  0.818, 44.0, 0, 0, 0, 0.14, 0.01, 28.0, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'white',  0.0,   0.818, 44.0, 0, 0, 0, 0.12, 0.01, 28.0, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'white', -18.0,  0.818, 38.0, 0, 0, 0, 6.0, 0.01, 0.12, { tint: [1, 1, 1, 1] });
  dm('box', 'white', -18.0,  0.818, 50.0, 0, 0, 0, 6.0, 0.01, 0.12, { tint: [1, 1, 1, 1] });
  dm('box', 'white', -15.0,  0.818, 44.0, 0, 0, 0, 0.12, 0.01, 12.1, { tint: [1, 1, 1, 1] });
  dm('box', 'white',  18.0,  0.818, 38.0, 0, 0, 0, 6.0, 0.01, 0.12, { tint: [1, 1, 1, 1] });
  dm('box', 'white',  18.0,  0.818, 50.0, 0, 0, 0, 6.0, 0.01, 0.12, { tint: [1, 1, 1, 1] });
  dm('box', 'white',  15.0,  0.818, 44.0, 0, 0, 0, 0.12, 0.01, 12.1, { tint: [1, 1, 1, 1] });
  wgl.setBlend('alpha');
  dm('quad', 'dongSonCenter', 0.0, 0.824, 44.0, -Math.PI * 0.5, 0, 0, 6.8, 6.8, 1, { tint: [1, 0.96, 0.65, 0.84], emissive: 0.40 });
  wgl.setBlend(null);

  drawStadiumGoalWebgl(wgl, -21.0, -1);
  drawStadiumGoalWebgl(wgl,  21.0,  1);

  // 2 Cabin Kỹ Thuật có mái kính + Ghế băng HLV & Dự bị dọc Z = 24.4..25.6
  dm('box', 'redCarpet', -7.0, 1.05, 24.4, 0, 0, 0, 6.8, 0.5, 1.4, { tint: [1, 1, 1, 1] });
  dm('box', 'white',     -7.0, 2.35, 24.5, -0.18, 0, 0, 7.0, 0.08, 1.8, { tint: [0.85, 0.16, 0.16, 1] });
  dm('box', 'white',      7.0, 1.05, 24.4, 0, 0, 0, 6.8, 0.5, 1.4, { tint: [0.14, 0.34, 0.72, 1] });
  dm('box', 'white',      7.0, 2.35, 24.5, -0.18, 0, 0, 7.0, 0.08, 1.8, { tint: [0.16, 0.42, 0.86, 1] });

  // Rào Chắn LED An Ninh dọc Z = 27.5 bảo vệ sân cỏ 11v11
  dm('box', 'ledPitchBoard', 0.0, 1.25, 27.5, 0, 0, 0, 38.0, 0.9, 0.24, { tint: [1, 1, 1, 1], us: 5, vs: 1, emissive: 0.55 });
  dm('box', 'ledPitchBoard', 0.0, 1.25, 60.5, 0, 0, 0, 44.0, 0.9, 0.24, { tint: [1, 1, 1, 1], us: 6, vs: 1, emissive: 0.55 });

  // G. KHÁN ĐÀI 3 TẦNG TRÀN NGẬP CỔ ĐỘNG VIÊN 4 PHÍA + MÁI VÒM TRỐNG ĐỒNG + JUMBOTRON LED + 4 TRỤ ĐÈN PHA
  var waveBoost = isWave ? Math.sin(st.t * 8.0) * 0.16 : 0.0;
  // Khán đài Bắc (3 tầng giật cấp)
  dm('box', 'grandstandRedGold', 0.0, 3.6 + waveBoost, 63.8, -0.34, 0, 0, 52.0, 4.8, 4.6, { tint: [1, 1, 1, 1], us: 7, vs: 1.5 });
  dm('box', 'grandstandRedGold', 0.0, 7.2 - waveBoost, 68.2, -0.38, 0, 0, 56.0, 5.2, 5.2, { tint: [1, 1, 1, 1], us: 8, vs: 1.5 });
  // Khán đài Tây & Đông (3 tầng giật cấp)
  dm('box', 'grandstandRedGold', -25.4, 3.6 - waveBoost, 44.0, 0, 0, -0.34, 4.6, 4.8, 42.0, { tint: [1, 1, 1, 1], us: 6, vs: 1.5 });
  dm('box', 'grandstandRedGold', -29.8, 7.2 + waveBoost, 44.0, 0, 0, -0.38, 5.2, 5.2, 46.0, { tint: [1, 1, 1, 1], us: 7, vs: 1.5 });
  dm('box', 'grandstandRedGold',  25.4, 3.6 + waveBoost, 44.0, 0, 0,  0.34, 4.6, 4.8, 42.0, { tint: [1, 1, 1, 1], us: 6, vs: 1.5 });
  dm('box', 'grandstandRedGold',  29.8, 7.2 - waveBoost, 44.0, 0, 0,  0.38, 5.2, 5.2, 46.0, { tint: [1, 1, 1, 1], us: 7, vs: 1.5 });
  // Khán đài Nam tầng trên (phía sau lưng khán giả Nam Y = 6.2..9.6)
  dm('box', 'grandstandRedGold', 0.0, 6.8 + waveBoost, 17.5, 0.36, 0, 0, 48.0, 4.8, 4.4, { tint: [1, 1, 1, 1], us: 7, vs: 1.5 });

  // Mái vòm Trống Đồng Đông Sơn 4 cánh
  dm('box', 'roofTrongDong', 0.0,   11.2, 67.0, 0.14, 0, 0, 58.0, 0.4, 8.0, { tint: [1, 1, 1, 1], us: 10, vs: 1, emissive: 0.16 });
  dm('box', 'roofTrongDong', -29.0, 11.2, 44.0, 0, 0,  0.14, 8.0, 0.4, 48.0, { tint: [1, 1, 1, 1], us: 8, vs: 1, emissive: 0.16 });
  dm('box', 'roofTrongDong',  29.0, 11.2, 44.0, 0, 0, -0.14, 8.0, 0.4, 48.0, { tint: [1, 1, 1, 1], us: 8, vs: 1, emissive: 0.16 });
  dm('box', 'roofTrongDong', 0.0,   10.6, 17.2,-0.14, 0, 0, 52.0, 0.4, 7.0, { tint: [1, 1, 1, 1], us: 9, vs: 1, emissive: 0.16 });

  var sbTex = ensureStadiumScoreboardTex(wgl, st.vnScore, isGoalFlash);
  dm('quad', sbTex,           0.0,   9.6, 62.0, 0, Math.PI, 0, 16.5, 4.1, 1, { tint: [1, 1, 1, 1], emissive: 1.0 });
  dm('quad', 'bannerVnChamp', -23.0, 8.4, 44.0, 0, Math.PI * 0.5, 0, 20.0, 2.2, 1, { tint: [1, 1, 1, 1], emissive: 0.65 });
  dm('quad', 'bannerVnChamp',  23.0, 8.4, 44.0, 0, -Math.PI * 0.5, 0, 20.0, 2.2, 1, { tint: [1, 1, 1, 1], emissive: 0.65 });

  drawFloodlightTowerWebgl(wgl, -24.0, 22.0,  Math.PI * 0.25);
  drawFloodlightTowerWebgl(wgl,  24.0, 22.0, -Math.PI * 0.25);
  drawFloodlightTowerWebgl(wgl, -24.0, 62.0,  Math.PI * 0.75);
  drawFloodlightTowerWebgl(wgl,  24.0, 62.0, -Math.PI * 0.75);

  // Quả bóng FIFA 3D trên sân cỏ
  wgl.setBlend('alpha');
  dm('cyl', 'white', st.ball.x, 0.82, st.ball.z, 0, 0, 0, 0.36, 0.01, 0.36, { tint: [0.05, 0.08, 0.05, 0.35], emissive: 1.0 });
  wgl.setBlend(null);
  dm('sphere', 'white', st.ball.x, st.ball.y + 0.14, st.ball.z, 0, st.t * 3, 0, 0.34, 0.34, 0.34, { tint: [0.99, 0.99, 0.99, 1], specPow: 96 });

  // H. TOÀN BỘ 22 CẦU THỦ + 3 TRỌNG TÀI + 2 HLV + 8 DỰ BỊ + 10 AN NINH + CỔ ĐỘNG VIÊN & CHÚ HEO
  if (typeof drawHumanBillboardWebgl === 'function') {
    for (var hi = 0; hi < st.npcs.length; hi++) {
      var h = st.npcs[hi];
      if (Math.hypot(h.x - cam.pos.x, h.z - cam.pos.z) > 68.0) continue;
      drawHumanBillboardWebgl(wgl, cam, h, st.t);
    }
  }
  if (typeof drawPigBillboardWebgl === 'function') {
    drawPigBillboardWebgl(wgl, cam, st.pig, st.t, false);
  }

  // I. VÒNG SÓNG CHẠM SÀN & PHÁO GIẤY CỔ VŨ
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
  var room = st.room || st.zone || 'gate_plaza';
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
