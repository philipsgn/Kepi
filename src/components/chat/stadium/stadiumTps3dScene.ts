/**
 * Sân Vận Động Trống Đồng FIFA WebGL 3D Hợp Nhất 3 Cao Độ (Quyết định 250)
 * Không gian liên hoàn không cắt cảnh và không teleport:
 * 1. `locker_tunnel` (Tầng hầm Y = 0): `X ∈ [-6.0, 6.0], Z ∈ [0, 14.0]` — Chế độ A Kín 100%
 *    - Tủ áo trái #10/#19/#22/#9 (`X ∈ [-5.95, -4.45], Z ∈ [1.7, 11.7]`), Bàn sa bàn (`X ∈ [-1.05, 1.05], Z ∈ [5.1, 6.5]`),
 *    - Bồn hồi sức Cryo tại `(4.1, 0, 3.8)` (`X ∈ [3.35, 4.85], Z ∈ [3.05, 4.55]`), Cửa ra Đại Lộ (`Z = 0`).
 * 2. `player_tunnel` (Dốc Đường Hầm FIFA `6.3°`): `X ∈ [-1.8, 1.8], Z ∈ [14.0, 21.2], Y: 0 → 0.8`.
 * 3. `pitch_arena` (Piste & Sân Cỏ Trống Đồng Y = 0.8): `X ∈ [-18.0, 18.0], Z ∈ [21.2, 49.2]` — Chế độ B
 *    - Khán đài Cờ Đỏ Sao Vàng 4 phía + Mái vòm Trống Đồng + 4 trụ đèn pha + Sky Dome + Trận bóng 60fps.
 * 4. Cầu thang bộ VIP 12 bậc dọc `+Z` (`32.2°`, `tread = 0.45m > rise = 0.283m`): `X ∈ [3.4, 5.2], Z ∈ [6.6, 12.0], Y: 0 → 3.4`
 *    -> Chiếu nghỉ `X ∈ [3.4, 6.2], Z ∈ [12.0, 13.8], Y = 3.4` qua Cửa VIP `X = 6.2, Z ∈ [12.0, 13.8]`
 *    -> `trophy_vip` (Y = 3.4 — Chế độ A + Hành Lang Kính Skybox):
 *       - Sảnh chính `X ∈ [6.2, 16.2], Z ∈ [6.0, 18.0]` (Bục Cúp `X ∈ [9.95, 12.45], Z ∈ [10.2, 12.2]`, Bàn Họp Báo `X ∈ [8.75, 13.65], Z ∈ [14.7, 16.1]`)
 *       - Hành Lang Kính Skybox đúc hẫng `X ∈ [6.2, 12.4], Z ∈ [18.0, 23.6], Y = 3.4` nhô ra `2.4m` nhìn thẳng xuống sân cỏ!
 */
export function buildStadiumTps3dSceneScript(): string {
  return String.raw`
/* ==================== 1. ĐỒ THỊ KHÔNG GIAN LIÊN HOÀN SVĐ TRỐNG ĐỒNG FIFA (STADIUM_NAV_GRAPH) ==================== */
var STADIUM_NAV_GRAPH = {
  zones: [
    { id: 'locker_tunnel', minX: -6.0,  maxX: 6.0,  minZ: 0.0,  maxZ: 14.0, floorY: 0.0 },
    { id: 'player_tunnel', minX: -1.8,  maxX: 1.8,  minZ: 14.0, maxZ: 21.2, floorY: 0.4 },
    { id: 'pitch_arena',   minX: -18.0, maxX: 18.0, minZ: 21.2, maxZ: 49.2, floorY: 0.8 },
    { id: 'vip_landing',   minX: 3.4,   maxX: 6.2,  minZ: 12.0, maxZ: 13.8, floorY: 3.4 },
    { id: 'trophy_vip',    minX: 6.2,   maxX: 16.2, minZ: 6.0,  maxZ: 18.0, floorY: 3.4 },
    { id: 'skybox',        minX: 6.2,   maxX: 12.4, minZ: 18.0, maxZ: 23.6, floorY: 3.4 }
  ],
  ramps: [
    { id: 'tunnel_ramp', axis: 'z', minX: -1.8, maxX: 1.8, zStart: 14.0, zEnd: 21.2, yStart: 0.0, yEnd: 0.8, maxCurY: 2.1 },
    { id: 'vip_stairs',  axis: 'z', minX: 3.4,  maxX: 5.2, zStart: 6.6,  zEnd: 12.0, yStart: 0.0, yEnd: 3.4 }
  ],
  edges: [
    {
      from: 'locker_tunnel', to: 'player_tunnel',
      waypointsForward: [{ x: 0.0, y: 0.0, z: 13.7 }],
      waypointsBackward: [{ x: 0.0, y: 0.0, z: 14.2 }]
    },
    {
      from: 'player_tunnel', to: 'pitch_arena',
      waypointsForward: [{ x: 0.0, y: 0.8, z: 21.4 }],
      waypointsBackward: [{ x: 0.0, y: 0.8, z: 21.0 }]
    },
    {
      from: 'locker_tunnel', to: 'vip_landing',
      waypointsForward: [
        { x: 4.3, y: 0.0, z: 6.45 },
        { x: 4.3, y: 3.4, z: 12.2 },
        { x: 4.8, y: 3.4, z: 12.9 }
      ],
      waypointsBackward: [
        { x: 4.8, y: 3.4, z: 12.9 },
        { x: 4.3, y: 3.4, z: 12.2 },
        { x: 4.3, y: 0.0, z: 6.45 }
      ]
    },
    {
      from: 'vip_landing', to: 'trophy_vip',
      waypointsForward: [{ x: 6.7, y: 3.4, z: 12.9 }],
      waypointsBackward: [{ x: 5.7, y: 3.4, z: 12.9 }]
    },
    {
      from: 'trophy_vip', to: 'skybox',
      waypointsForward: [{ x: 9.3, y: 3.4, z: 17.7 }],
      waypointsBackward: [{ x: 9.3, y: 3.4, z: 18.3 }]
    }
  ],
  outerBounds: { minX: -18.5, maxX: 18.5, minZ: -0.2, maxZ: 50.0, minY: 0.65, maxY: 14.0 },
  wallMargin: 0.38,
  dividerWalls: [
    // Phòng Thay Đồ (locker_tunnel) & Lồng Cầu Thang VIP
    { axis: 'z', pos: 0.0,  minSpan: -6.0, maxSpan: 6.0,  minY: 0.0, maxY: 4.4, openings: [] },
    { axis: 'x', pos: -6.0, minSpan: 0.0,  maxSpan: 14.0, minY: 0.0, maxY: 4.4, openings: [] },
    // Vách ngăn locker_tunnel ↔ trophy_vip tại X = 6.0..6.2: mở thông đúng Cửa VIP (Z ∈ [12.0, 13.8], Y ∈ [3.4, 6.4])
    { axis: 'x', pos: 6.0,  minSpan: 0.0,  maxSpan: 14.0, minY: 0.0, maxY: 6.8, openings: [{ a1: 12.0, a2: 13.8, y1: 3.4, y2: 6.4 }] },
    { axis: 'x', pos: 6.2,  minSpan: 6.0,  maxSpan: 18.0, minY: 3.4, maxY: 6.8, openings: [{ a1: 12.0, a2: 13.8, y1: 3.4, y2: 6.4 }] },
    // Tường Bắc locker_tunnel tại Z = 14.0: mở thông đúng Cửa Hầm Cầu Thủ (X ∈ [-1.8, 1.8])
    { axis: 'z', pos: 14.0, minSpan: -6.0, maxSpan: 6.0,  minY: 0.0, maxY: 4.4, openings: [{ a1: -1.8, a2: 1.8, y1: 0.0, y2: 3.6 }] },
    // Hai vách Đường Hầm FIFA (player_tunnel)
    { axis: 'x', pos: -1.8, minSpan: 14.0, maxSpan: 21.2, minY: 0.0, maxY: 4.2, openings: [] },
    { axis: 'x', pos: 1.8,  minSpan: 14.0, maxSpan: 21.2, minY: 0.0, maxY: 4.2, openings: [] },
    // Tường Nam sân cỏ (Z = 21.2): mở thông Cửa Hầm & không gian dưới/trên Hành Lang Kính Skybox
    { axis: 'z', pos: 21.2, minSpan: -18.0, maxSpan: 18.0, minY: 0.8, maxY: 5.2, openings: [{ a1: -1.8, a2: 1.8, y1: 0.8, y2: 3.6 }, { a1: 6.2, a2: 12.4, y1: 3.4, y2: 6.8 }] },
    // 3 biên khán đài Sân Cỏ Trống Đồng (pitch_arena)
    { axis: 'x', pos: -18.0, minSpan: 21.2, maxSpan: 49.2, minY: 0.8, maxY: 11.0, openings: [] },
    { axis: 'x', pos: 18.0,  minSpan: 21.2, maxSpan: 49.2, minY: 0.8, maxY: 11.0, openings: [] },
    { axis: 'z', pos: 49.2,  minSpan: -18.0, maxSpan: 18.0, minY: 0.8, maxY: 11.0, openings: [] },
    // Tường Sảnh Cúp Vàng VIP (trophy_vip) — Hành Lang Kính Skybox X ∈ [6.2, 12.4], Z ∈ [18.0, 23.6] để mở tầm nhìn ra sân!
    { axis: 'z', pos: 6.0,  minSpan: 6.2,  maxSpan: 16.2, minY: 3.4, maxY: 6.8, openings: [] },
    { axis: 'x', pos: 16.2, minSpan: 6.0,  maxSpan: 18.0, minY: 3.4, maxY: 6.8, openings: [] },
    { axis: 'z', pos: 18.0, minSpan: 12.4, maxSpan: 16.2, minY: 3.4, maxY: 6.8, openings: [] }
  ]
};

function getStadiumSurfaceY(x, z, curY) {
  if (typeof getNavGraphSurfaceY === 'function') {
    return getNavGraphSurfaceY(STADIUM_NAV_GRAPH, x, z, curY);
  }
  if (x >= -1.8 && x <= 1.8 && z >= 14.0 && z <= 21.2 && (curY || 0) <= 2.1) {
    return Math.max(0, Math.min(1, (z - 14.0) / 7.2)) * 0.8;
  }
  if (x >= 3.4 && x <= 5.2 && z >= 6.6 && z <= 12.0) {
    return Math.max(0, Math.min(1, (z - 6.6) / 5.4)) * 3.4;
  }
  if ((curY || 0) >= 2.2) return 3.4;
  if (z >= 21.2) return 0.8;
  return 0.0;
}

function getStadiumZoneAt(x, y, z) {
  if ((y || 0) >= 2.2) {
    return z >= 18.0 ? 'skybox' : 'trophy_vip';
  }
  if (z >= 21.2) return 'pitch_arena';
  if (z > 14.0) return 'player_tunnel';
  return 'locker_tunnel';
}

function createStadiumTpsState() {
  var npcs = [
    // Hậu Trường ĐT Việt Nam (3 NPC)
    { x: -2.6, y: 0.0, z: 4.6,  yaw: Math.PI * 0.45, role: 'vn_player',  shirt: '#DC2626', hair: '#1C1917', moving: true,  seated: false, phase: 0.2, carryProp: 'ball' },
    { x: -2.4, y: 0.0, z: 8.8,  yaw: Math.PI * 0.35, role: 'vn_player',  shirt: '#DC2626', hair: '#292524', moving: true,  seated: false, phase: 1.6, carryProp: 'none' },
    { x:  1.9, y: 0.0, z: 5.8,  yaw: -Math.PI * 0.5, role: 'vn_coach',   shirt: '#1E3A8A', hair: '#1C1917', moving: false, seated: false, phase: 0.8, carryProp: 'none' },
    // Sân Cỏ Trống Đồng 60fps (7 NPC: vn_captain, vn_player, away_player, gk, referee) — sân ngang Đông-Tây chuẩn FIFA
    { x: -3.2, y: 0.8, z: 33.4, vx: 1.8,  vz: 1.3,  minX: -10.5, maxX: 6.5,   minZ: 27.5, maxZ: 42.5, yaw: 0.4,          role: 'vn_captain',  shirt: '#DC2626', hair: '#1C1917', moving: true, seated: false, phase: 0.0, carryProp: 'none' },
    { x:  4.2, y: 0.8, z: 36.8, vx: 1.6,  vz: -1.5, minX: -2.0,  maxX: 11.5,  minZ: 28.0, maxZ: 42.2, yaw: 1.1,          role: 'vn_player',   shirt: '#DC2626', hair: '#292524', moving: true, seated: false, phase: 1.2, carryProp: 'none' },
    { x: -1.5, y: 0.8, z: 30.5, vx: 1.4,  vz: 1.2,  minX: -8.5,  maxX: 8.5,   minZ: 26.8, maxZ: 38.5, yaw: 0.7,          role: 'vn_player',   shirt: '#DC2626', hair: '#1C1917', moving: true, seated: false, phase: 2.4, carryProp: 'none' },
    { x:  6.2, y: 0.8, z: 38.2, vx: -1.5, vz: -1.2, minX: -4.5,  maxX: 11.2,  minZ: 28.5, maxZ: 42.8, yaw: -1.8,         role: 'away_player', shirt: '#2563EB', hair: '#451A03', moving: true, seated: false, phase: 2.1, carryProp: 'none' },
    { x:  4.2, y: 0.8, z: 32.2, vx: -1.4, vz: 1.4,  minX: -6.5,  maxX: 10.8,  minZ: 27.5, maxZ: 40.5, yaw: -1.2,         role: 'away_player', shirt: '#2563EB', hair: '#1E293B', moving: true, seated: false, phase: 3.0, carryProp: 'none' },
    { x: 12.7, y: 0.8, z: 35.2, vx: 0.0,  vz: 1.3,  minX: 12.6,  maxX: 12.8,  minZ: 33.1, maxZ: 37.3, yaw: -Math.PI*0.5, role: 'gk',          shirt: '#16A34A', hair: '#1C1917', moving: true, seated: false, phase: 0.5, carryProp: 'none' },
    { x: -2.4, y: 0.8, z: 35.2, vx: 0.9,  vz: 0.7,  minX: -6.5,  maxX: 6.5,   minZ: 29.0, maxZ: 41.5, yaw: 1.2,          role: 'referee',     shirt: '#0F172A', hair: '#111827', moving: true, seated: false, phase: 1.5, carryProp: 'none' },
    // Sảnh Cúp Vàng & Hành Lang Kính Skybox VIP (3 NPC)
    { x:  9.1, y: 3.4, z: 13.6, yaw: 0.25,          role: 'press',      shirt: '#475569', hair: '#1C1917', moving: false, seated: false, phase: 0.4, carryProp: 'camera' },
    { x: 13.1, y: 3.4, z: 13.6, yaw: -0.25,         role: 'press',      shirt: '#0F766E', hair: '#292524', moving: false, seated: false, phase: 1.4, carryProp: 'mic' },
    { x:  9.4, y: 3.4, z: 22.3, yaw: 0.0,           role: 'vn_captain', shirt: '#DC2626', hair: '#1C1917', moving: false, seated: false, phase: 2.2, carryProp: 'none' }
  ];

  return {
    room: 'locker_tunnel',
    zone: 'locker_tunnel',
    pig: {
      x: 0.0, y: 0.0, z: 2.6, yaw: 0.0,
      targetX: 0.0, targetZ: 2.6,
      waypoints: [],
      walking: false, seated: false, eating: false,
      seatChairId: -1, pendingSeatId: -1, pendingAction: null,
      wearingVietnamKit: false, wearingKit: false,
      outfit: 'none', liftedTrophy: false
    },
    npcs: npcs,
    ball: {
      x: 0.0, y: 0.96, z: 35.2,
      shooting: false, shootT: 0
    },
    vnScore: 2,
    goalFlashUntil: 0,
    confettiUntil: 0,
    rightDoorOpen: 0.35,
    exitFade: 0,
    exiting: false,
    ripples: [],
    t: 0
  };
}

function clampStadiumWalkPos(st, x, z, yArg) {
  var y = typeof yArg === 'number' ? yArg : (st && st.pig ? (st.pig.y || 0) : 0);
  var nx = x, nz = z;

  // 1. Tầng VIP & Hành Lang Kính Skybox (Y >= 2.2)
  if (y >= 2.2) {
    if (nx < 6.2) {
      // Chiếu nghỉ đỉnh thang & Cầu thang VIP
      if (nz < 12.0 && nx >= 3.4 && nx <= 5.2) {
        nx = Math.max(3.55, Math.min(5.05, nx));
        nz = Math.max(6.5, Math.min(12.2, nz));
      } else {
        nx = Math.max(3.65, Math.min(6.35, nx));
        nz = Math.max(12.15, Math.min(13.55, nz));
      }
      return { x: nx, z: nz };
    }
    if (nz > 18.0) {
      nx = Math.max(6.55, Math.min(12.05, nx));
      nz = Math.max(18.0, Math.min(23.25, nz));
      return { x: nx, z: nz };
    }
    nx = Math.max(6.45, Math.min(15.85, nx));
    nz = Math.max(6.35, Math.min(18.1, nz));
    var vipBoxes = [
      { x1: 9.95, z1: 10.2, x2: 12.45, z2: 12.2 }, // Bục Cúp Vàng & Trống Đồng
      { x1: 8.75, z1: 14.7, x2: 13.65, z2: 16.1 }  // Bàn Họp Báo Quốc Tế
    ];
    for (var vi = 0; vi < vipBoxes.length; vi++) {
      var vb = vipBoxes[vi];
      if (nx > vb.x1 - 0.34 && nx < vb.x2 + 0.34 && nz > vb.z1 - 0.34 && nz < vb.z2 + 0.34) {
        var vdl = Math.abs(nx - (vb.x1 - 0.34)), vdr = Math.abs(nx - (vb.x2 + 0.34));
        var vdt = Math.abs(nz - (vb.z1 - 0.34)), vdb = Math.abs(nz - (vb.z2 + 0.34));
        var vm = Math.min(vdl, vdr, vdt, vdb);
        if (vm === vdl) nx = vb.x1 - 0.34;
        else if (vm === vdr) nx = vb.x2 + 0.34;
        else if (vm === vdt) nz = vb.z1 - 0.34;
        else nz = vb.z2 + 0.34;
      }
    }
    return { x: nx, z: nz };
  }

  // 2. Đang trên Dốc Đường Hầm FIFA (Z ∈ [14.0, 21.2])
  if (nz > 13.85 && nz < 21.25) {
    nx = Math.max(-1.45, Math.min(1.45, nx));
    nz = Math.max(13.85, Math.min(21.25, nz));
    return { x: nx, z: nz };
  }

  // 3. Đang trên Sân Cỏ & Piste (Z >= 21.25)
  if (nz >= 21.25) {
    nx = Math.max(-17.4, Math.min(17.4, nx));
    nz = Math.max(21.25, Math.min(48.6, nz));
    var pitchBoxes = [
      { x1: -8.8,  z1: 22.3, x2: -3.4,  z2: 24.0 }, // Khu kỹ thuật ĐT Việt Nam (cạnh hầm cầu thủ)
      { x1:  3.4,  z1: 22.3, x2:  8.8,  z2: 24.0 }, // Khu kỹ thuật Đội Khách
      { x1:  13.2, z1: 32.7, x2: 14.9,  z2: 37.7 }, // Khung thành Đông (Đội Khách)
      { x1: -14.9, z1: 32.7, x2: -13.2, z2: 37.7 }  // Khung thành Tây (ĐT Việt Nam)
    ];
    for (var pi = 0; pi < pitchBoxes.length; pi++) {
      var pb = pitchBoxes[pi];
      if (nx > pb.x1 - 0.34 && nx < pb.x2 + 0.34 && nz > pb.z1 - 0.34 && nz < pb.z2 + 0.34) {
        var pdl = Math.abs(nx - (pb.x1 - 0.34)), pdr = Math.abs(nx - (pb.x2 + 0.34));
        var pdt = Math.abs(nz - (pb.z1 - 0.34)), pdb = Math.abs(nz - (pb.z2 + 0.34));
        var pm = Math.min(pdl, pdr, pdt, pdb);
        if (pm === pdl) nx = pb.x1 - 0.34;
        else if (pm === pdr) nx = pb.x2 + 0.34;
        else if (pm === pdt) nz = pb.z1 - 0.34;
        else nz = pb.z2 + 0.34;
      }
    }
    return { x: nx, z: nz };
  }

  // 4. Phòng Thay Đồ (locker_tunnel, Z <= 13.85)
  nx = Math.max(-5.65, Math.min(5.65, nx));
  nz = Math.max(0.65, Math.min(13.75, nz));
  var lockerBoxes = [
    { x1: -5.95, z1: 1.7,  x2: -4.45, z2: 11.7 }, // Tủ áo & ghế cầu thủ trái
    { x1: -1.05, z1: 5.1,  x2: 1.05,  z2: 6.5 },  // Bàn sa bàn chiến thuật giữa phòng
    { x1: 3.35,  z1: 3.05, x2: 4.85,  z2: 4.55 }  // Bồn hồi sức Cryo (4.1, 0, 3.8)
  ];
  if (y < 0.35) {
    // Chặn đi xuyên hông gầm cầu thang khi đang đứng dưới đất
    lockerBoxes.push({ x1: 3.35, z1: 7.05, x2: 5.3, z2: 13.8 });
  }
  for (var li = 0; li < lockerBoxes.length; li++) {
    var lb = lockerBoxes[li];
    if (nx > lb.x1 - 0.34 && nx < lb.x2 + 0.34 && nz > lb.z1 - 0.34 && nz < lb.z2 + 0.34) {
      var ldl = Math.abs(nx - (lb.x1 - 0.34)), ldr = Math.abs(nx - (lb.x2 + 0.34));
      var ldt = Math.abs(nz - (lb.z1 - 0.34)), ldb = Math.abs(nz - (lb.z2 + 0.34));
      var lm = Math.min(ldl, ldr, ldt, ldb);
      if (lm === ldl) nx = lb.x1 - 0.34;
      else if (lm === ldr) nx = lb.x2 + 0.34;
      else if (lm === ldt) nz = lb.z1 - 0.34;
      else nz = lb.z2 + 0.34;
    }
  }
  return { x: nx, z: nz };
}

/* ==================== 2. ĐIỀU HƯỚNG LIÊN HOÀN BFS + BƯỚC TỪNG BẬC CẦU THANG ==================== */
function planStadiumRealtimePath(st, tx, targetFloorY, tz, extraOpts) {
  var p = st.pig;
  var eo = extraOpts || {};
  var targetKind = eo.targetKind || 'floor';

  if (targetKind === 'vip_stair' || targetKind === 'tunnel_ramp') {
    p.seated = false; p.seatChairId = -1; p.eating = false;
    p.pendingSeatId = -1;
    p.pendingAction = eo.pendingAction || null;
    var wpsRamp = [];
    if (targetKind === 'vip_stair') {
      var curY = p.y || 0;
      if (curY >= 2.2) {
        if (p.z > 18.0) wpsRamp.push({ x: 9.3, y: 3.4, z: 17.7 });
        wpsRamp.push({ x: 6.7, y: 3.4, z: 12.9 });
        wpsRamp.push({ x: 4.8, y: 3.4, z: 12.9 });
        wpsRamp.push({ x: 4.3, y: 3.4, z: 12.2 });
      } else {
        if (p.z >= 21.2) {
          wpsRamp.push({ x: 0.0, y: 0.8, z: 21.4 });
          wpsRamp.push({ x: 0.0, y: 0.0, z: 13.7 });
        } else if (p.z > 14.0) {
          wpsRamp.push({ x: 0.0, y: 0.0, z: 13.7 });
        }
        var onSt = (p.x >= 3.4 && p.x <= 5.2 && p.z >= 6.6 && p.z <= 12.0 && curY > 0.15 && curY < 3.25);
        if (!onSt) wpsRamp.push({ x: 4.3, y: 0.0, z: 6.45 });
      }
    } else {
      if ((p.y || 0) >= 2.2) {
        if (p.z > 18.0) wpsRamp.push({ x: 9.3, y: 3.4, z: 17.7 });
        wpsRamp.push({ x: 6.7, y: 3.4, z: 12.9 });
        wpsRamp.push({ x: 4.8, y: 3.4, z: 12.9 });
        wpsRamp.push({ x: 4.3, y: 3.4, z: 12.2 });
        wpsRamp.push({ x: 4.3, y: 0.0, z: 6.45 });
        wpsRamp.push({ x: 0.0, y: 0.0, z: 13.7 });
      } else if (p.z >= 21.2) {
        wpsRamp.push({ x: 0.0, y: 0.8, z: 21.4 });
      } else if (p.z <= 14.0) {
        wpsRamp.push({ x: 0.0, y: 0.0, z: 13.7 });
      }
    }
    wpsRamp.push({ x: tx, y: targetFloorY, z: tz });
    p.waypoints = wpsRamp;
    p.targetX = wpsRamp[0].x; p.targetZ = wpsRamp[0].z;
    p.walking = true;
    return;
  }

  if (typeof planNavGraphRealtimePath === 'function') {
    var onVipStairNow = (p.x >= 3.4 && p.x <= 5.2 && p.z > 6.7 && p.z < 11.9 && (p.y || 0) > 0.15 && (p.y || 0) < 3.25);
    planNavGraphRealtimePath(STADIUM_NAV_GRAPH, st, tx, targetFloorY, tz, eo);
    if (onVipStairNow && p.waypoints && p.waypoints.length > 1) {
      if (targetFloorY >= 2.2 && p.waypoints[0].z < 7.0) {
        p.waypoints.shift();
      } else if (targetFloorY < 1.5 && p.waypoints[0].z > 11.8) {
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
  } else if (actionId === 'shoot_goal') {
    st.ball.x = st.pig.x; st.ball.y = 0.96; st.ball.z = st.pig.z + 0.5;
    st.ball.shooting = true; st.ball.shootT = 0;
    st.vnScore = (st.vnScore || 2) + 1;
    st.goalFlashUntil = st.t + 3.8;
  } else if (actionId === 'lift_trophy') {
    st.pig.liftedTrophy = true;
    st.confettiUntil = st.t + 4.5;
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

  // 1. Chuyển động chú Heo liên hoàn qua Waypoints (từng bước, từng bậc cầu thang/dốc)
  if (!p.seated && p.walking) {
    var curWp = (p.waypoints && p.waypoints.length > 0) ? p.waypoints[0] : { x: p.targetX, z: p.targetZ };
    var dx = curWp.x - p.x, dz = curWp.z - p.z;
    var dist = Math.hypot(dx, dz);
    if (dist < 0.11) {
      p.x = curWp.x; p.z = curWp.z;
      if (p.waypoints && p.waypoints.length > 0) p.waypoints.shift();
      if (p.waypoints && p.waypoints.length > 0) {
        p.targetX = p.waypoints[0].x;
        p.targetZ = p.waypoints[0].z;
      } else {
        p.walking = false;
        if (p.pendingAction) {
          executeStadiumAction(st, p.pendingAction);
          p.pendingAction = null;
        }
      }
    } else {
      var onStairOrRamp = (p.x >= 3.4 && p.x <= 5.2 && p.z >= 6.5 && p.z <= 12.1) ||
                          (p.x >= -1.8 && p.x <= 1.8 && p.z >= 14.0 && p.z <= 21.2);
      var spd = Math.min(dist, (onStairOrRamp ? 2.6 : 3.6) * dt);
      var nx = p.x + (dx / dist) * spd;
      var nz = p.z + (dz / dist) * spd;
      if (!p.waypoints || p.waypoints.length <= 1) {
        var cl = clampStadiumWalkPos(st, nx, nz, p.y);
        nx = cl.x; nz = cl.z;
      }
      p.x = nx; p.z = nz;
      var tyaw = Math.atan2(dx, dz);
      p.yaw = (typeof tpsLerpAngle === 'function') ? tpsLerpAngle(p.yaw || 0, tyaw, Math.min(1, dt * 12)) : tyaw;
    }
  }

  p.y = getStadiumSurfaceY(p.x, p.z, p.y);
  st.zone = getStadiumZoneAt(p.x, p.y, p.z);
  p.wearingKit = !!p.wearingVietnamKit;
  p.outfit = p.wearingVietnamKit ? 'vn_kit' : 'none';

  // 2. Chuyển động 60fps của trận bóng đá trên sân cỏ pitch_arena
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
      pl.yaw = Math.atan2(pl.vx, pl.vz);
      if (!activeCarrier && (pl.role === 'vn_captain' || pl.role === 'vn_player')) activeCarrier = pl;
    }
  }
  var b = st.ball;
  if (b.shooting) {
    b.shootT += dt * 1.6;
    b.x += (13.6 - b.x) * Math.min(1, dt * 6.0);
    b.z += (35.2 - b.z) * Math.min(1, dt * 6.0);
    b.y = 0.94 + Math.sin(Math.min(1, b.shootT) * Math.PI) * 1.35;
    if (b.shootT >= 1.0) {
      b.shooting = false; b.shootT = 0;
      b.x = 0.0; b.y = 0.94; b.z = 35.2;
    }
  } else {
    var carrierIdx = 3 + (Math.floor(st.t * 0.7) % 5);
    var carrier = st.npcs[carrierIdx] || activeCarrier;
    if (carrier) {
      b.x += (carrier.x - b.x) * Math.min(1, dt * 3.6);
      b.z += (carrier.z - b.z) * Math.min(1, dt * 3.6);
      b.y = 0.94 + Math.abs(Math.sin(st.t * 9)) * 0.14;
    }
  }

  // 3. Cửa mặt tiền mở hé đón ánh sáng / mở hẳn khi rời SVĐ
  var targetDoor = st.exiting ? 0.95 : 0.35;
  st.rightDoorOpen += (targetDoor - st.rightDoorOpen) * Math.min(1, dt * 6.0);
  if (st.exiting) st.exitFade = Math.min(1, st.exitFade + dt * 4.2);

  // 4. Vòng sóng Tap-to-Walk
  for (var ri = st.ripples.length - 1; ri >= 0; ri--) {
    st.ripples[ri].t += dt;
    if (st.ripples[ri].t > 0.75) st.ripples.splice(ri, 1);
  }
}

/* ==================== 3. RAYCAST CHỌN ĐIỂM 3D (SÀN / DỐC HẦM / 12 BẬC VIP / SKYBOX / ĐỐI TƯỢNG) ==================== */
function raySphereStadium(ox, oy, oz, dx, dy, dz, cx, cy, cz, rad) {
  var ocx = cx - ox, ocy = cy - oy, ocz = cz - oz;
  var proj = ocx * dx + ocy * dy + ocz * dz;
  if (proj < 0.2 || proj > 48) return -1;
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

  // 1. Chạm Quả Bóng / Khung Thành Đông trên sân -> chạy tới sút bóng
  var ballHit = raySphereStadium(ox, oy, oz, dx, dy, dz, st.ball.x, st.ball.y + 0.15, st.ball.z, 0.95);
  if (ballHit > 0) {
    return { kind: 'pitch', x: Math.max(-11, Math.min(11, st.ball.x)), y: 0.8, z: Math.max(25, Math.min(44, st.ball.z - 0.8)), pendingAction: 'shoot_goal' };
  }
  if (dx > 0.02) {
    var tGoal = (13.4 - ox) / dx;
    if (tGoal > 0.4 && tGoal < 42) {
      var gz = oz + dz * tGoal, gy = oy + dy * tGoal;
      if (Math.abs(gz - 35.2) <= 2.6 && gy >= 0.8 && gy <= 3.1) {
        return { kind: 'pitch', x: 8.5, y: 0.8, z: 35.2, pendingAction: 'shoot_goal' };
      }
    }
  }

  // 2. Chạm Bục Cúp Vàng trên tầng VIP -> tới nâng Cúp
  var cupHit = raySphereStadium(ox, oy, oz, dx, dy, dz, 11.2, 4.45, 11.2, 1.35);
  if (cupHit > 0) {
    return { kind: 'vip', x: 11.2, y: 3.4, z: 9.4, pendingAction: 'lift_trophy' };
  }

  // 3. Chạm Dãy Tủ Áo Đấu ĐT Việt Nam bên trái phòng thay đồ -> mặc/cất áo #10
  if (dx < -0.02) {
    var tLk = (-4.55 - ox) / dx;
    if (tLk > 0.3 && tLk < 18) {
      var ly = oy + dy * tLk, lz = oz + dz * tLk;
      if (ly >= 0 && ly <= 2.9 && lz >= 1.7 && lz <= 11.7) {
        return { kind: 'locker', x: -3.75, y: 0.0, z: Math.max(2.2, Math.min(11.2, lz)), pendingAction: 'wear_kit' };
      }
    }
  }

  // 4. Chạm Cửa Mặt Tiền (Z = 0) -> bước ra Đại Lộ Sài Gòn
  if (dz < -0.02) {
    var tEx = (0.25 - oz) / dz;
    if (tEx > 0.3 && tEx < 18) {
      var ex = ox + dx * tEx, ey = oy + dy * tEx;
      if (ey >= 0 && ey <= 2.9 && Math.abs(ex) <= 1.35) {
        return { kind: 'exit', x: 0.0, y: 0.0, z: 0.72, pendingAction: 'exit_stadium' };
      }
    }
  }

  // 5. Raycast trực tiếp lên Cầu Thang Bộ VIP 12 Bậc & Dốc Đường Hầm FIFA (rayRampQuad)
  if (typeof rayRampQuad === 'function') {
    var vipStairHit = rayRampQuad(ox, oy, oz, dx, dy, dz, {
      axis: 'z', minX: 3.4, maxX: 5.2, zStart: 6.6, zEnd: 12.0, yStart: 0.0, yEnd: 3.4
    });
    if (vipStairHit) {
      return { kind: 'vip_stair', x: vipStairHit.x, y: vipStairHit.y, z: vipStairHit.z };
    }
    var tunnelHit = rayRampQuad(ox, oy, oz, dx, dy, dz, {
      axis: 'z', minX: -1.8, maxX: 1.8, zStart: 14.0, zEnd: 21.2, yStart: 0.0, yEnd: 0.8
    });
    if (tunnelHit) {
      return { kind: 'tunnel_ramp', x: tunnelHit.x, y: tunnelHit.y, z: tunnelHit.z };
    }
  }

  // 6. Chạm Sàn 3 Cao Độ (ưu tiên từ cao xuống thấp: Tầng VIP/Skybox Y=3.4 -> Sân Cỏ Y=0.8 -> Hậu Trường Y=0)
  if (dy < -0.02) {
    var tVip = (3.4 - oy) / dy;
    if (tVip > 0.2 && tVip < 34) {
      var vx = ox + dx * tVip, vz = oz + dz * tVip;
      var inVipMain = (vx >= 6.2 && vx <= 16.2 && vz >= 6.0 && vz <= 18.0);
      var inSkybox  = (vx >= 6.2 && vx <= 12.4 && vz > 18.0 && vz <= 23.6);
      var inLanding = (vx >= 3.4 && vx <= 6.2 && vz >= 12.0 && vz <= 13.8);
      if (inVipMain || inSkybox || inLanding) {
        return { kind: 'floor', x: vx, y: 3.4, z: vz };
      }
    }
    var tPitch = (0.8 - oy) / dy;
    if (tPitch > 0.2 && tPitch < 48) {
      var px = ox + dx * tPitch, pz = oz + dz * tPitch;
      if (px >= -18.0 && px <= 18.0 && pz >= 21.2 && pz <= 49.2) {
        return { kind: 'floor', x: px, y: 0.8, z: pz };
      }
    }
    var tLock = (0.0 - oy) / dy;
    if (tLock > 0.2 && tLock < 28) {
      var lx = ox + dx * tLock, lz2 = oz + dz * tLock;
      if (lx >= -6.0 && lx <= 6.0 && lz2 >= 0.0 && lz2 <= 14.0) {
        return { kind: 'floor', x: lx, y: 0.0, z: lz2 };
      }
    }
  }
  return null;
}

/* ==================== 4. RENDER WEBGL 3D HỢP NHẤT SVĐ TRỐNG ĐỒNG FIFA (60FPS) ==================== */
function drawStadiumTrophyAndDrumWebgl(wgl, x, y, z, t) {
  var dm = wgl.drawMesh;
  // Bục kính-vàng trung tâm
  dm('box', 'lockerWall', x, y + 0.46, z, 0, 0, 0, 2.35, 0.92, 1.85, { tint: [1.0, 0.92, 0.85, 1] });
  dm('box', 'white', x, y + 0.96, z, 0, 0, 0, 2.48, 0.10, 1.98, { tint: [0.96, 0.74, 0.24, 1], specPow: 96 });
  // Cúp Vàng FIFA bên trái bục
  var cx = x - 0.52, cy = y + 1.02;
  dm('cyl', 'white', cx, cy + 0.06, z, 0, 0, 0, 0.34, 0.12, 0.34, { tint: [0.08, 0.45, 0.22, 1], specPow: 64 });
  dm('cup', 'white', cx, cy + 0.32, z, 0, 0, 0, 0.22, 0.42, 0.22, { tint: [0.98, 0.78, 0.16, 1], specPow: 120, emissive: 0.18 });
  dm('sphere', 'white', cx, cy + 0.62, z, 0, t * 0.8, 0, 0.32, 0.32, 0.32, { tint: [1.0, 0.86, 0.24, 1], specPow: 128, emissive: 0.25 + Math.sin(t * 4) * 0.08 });
  // Trống Đồng Đông Sơn mạ vàng cổ kính bên phải bục
  var dx = x + 0.55;
  dm('cyl', 'roofTrongDong', dx, cy + 0.22, z, 0, 0, 0, 0.54, 0.44, 0.54, { tint: [0.96, 0.78, 0.32, 1], specPow: 72 });
  dm('cyl', 'dongSonCenter', dx, cy + 0.45, z, 0, 0, 0, 0.60, 0.06, 0.60, { tint: [1.0, 0.88, 0.35, 1], emissive: 0.20 });
}

function drawStadiumGoalWebgl(wgl, xPos, dirSign) {
  var dm = wgl.drawMesh;
  var y0 = 0.8, zMid = 35.2;
  dm('cyl', 'white', xPos, y0 + 1.05, zMid - 2.35, 0, 0, 0, 0.12, 2.1, 0.12, { tint: [0.98, 0.99, 1.0, 1] });
  dm('cyl', 'white', xPos, y0 + 1.05, zMid + 2.35, 0, 0, 0, 0.12, 2.1, 0.12, { tint: [0.98, 0.99, 1.0, 1] });
  dm('box', 'white', xPos, y0 + 2.08, zMid,        0, 0, 0, 0.12, 0.12, 4.82, { tint: [0.98, 0.99, 1.0, 1] });
  wgl.setBlend('alpha');
  dm('box', 'white', xPos + dirSign * 0.55, y0 + 1.02, zMid, 0, 0, 0, 1.05, 2.0, 4.66, { tint: [0.92, 0.96, 1.0, 0.22] });
  wgl.setBlend(null);
}

function drawFloodlightTowerWebgl(wgl, x, z, lookYaw) {
  var dm = wgl.drawMesh;
  dm('box', 'white', x, 7.6, z, 0, 0, 0, 0.65, 13.6, 0.65, { tint: [0.42, 0.48, 0.56, 1] });
  dm('box', 'white', x, 14.6, z, 0.35, lookYaw, 0, 3.2, 1.4, 0.35, { tint: [0.20, 0.24, 0.30, 1] });
  dm('quad', 'white', x, 14.55, z, 0.35, lookYaw, 0, 2.8, 1.1, 1, { tint: [1.0, 0.96, 0.78, 1], emissive: 1.6 });
}

function renderStadiumWebglScene(wgl, cam, st, W, H) {
  if (typeof computeWebglTpsCamera === 'function') {
    computeWebglTpsCamera(cam, st.pig, STADIUM_NAV_GRAPH, st._lastDt || 0.016);
  }
  var dm = wgl.drawMesh;
  var p = st.pig;
  var isOutdoor = (p.y < 2.2 && p.z >= 19.5) || (p.y >= 2.2 && p.z >= 17.5);
  var isGoalFlash = !!(st.goalFlashUntil && st.t < st.goalFlashUntil);

  var atmo = isOutdoor ? {
    clearColor: [0.04, 0.09, 0.20, 1.0],
    hemiLow: [0.22, 0.26, 0.34],
    hemiHigh: [0.58, 0.68, 0.88],
    sunDir: [0.25, 0.88, -0.40],
    sunCol: [1.05, 0.98, 0.84],
    wrapBias: 0.46,
    lights: [
      { pos: [-14.0, 12.5, 24.0], col: [1.15, 1.08, 0.88] },
      { pos: [ 14.0, 12.5, 24.0], col: [1.15, 1.08, 0.88] },
      { pos: [-14.0, 12.5, 46.0], col: [1.15, 1.08, 0.88] },
      { pos: [ 14.0, 12.5, 46.0], col: [1.15, 1.08, 0.88] }
    ],
    outdoorRect: [-1.0, 0.0, 0.0, 0.88],
    fogCol: [0.06, 0.12, 0.26],
    fogParams: [26.0, 52.0, 0.36]
  } : {
    clearColor: [0.16, 0.07, 0.05, 1.0],
    hemiLow: [0.26, 0.18, 0.14],
    hemiHigh: [0.64, 0.56, 0.46],
    sunDir: [0.35, 0.72, 0.58],
    sunCol: [0.98, 0.84, 0.62],
    wrapBias: 0.44,
    lights: [
      { pos: [0.0, 3.6, 5.8],  col: [1.15, 0.82, 0.44] },
      { pos: [0.0, 3.6, 12.5], col: [1.08, 0.76, 0.36] },
      { pos: [11.2, 6.2, 11.5], col: [1.18, 0.88, 0.48] },
      { pos: [4.5, 5.6, 12.5], col: [0.95, 0.72, 0.38] }
    ],
    outdoorRect: [0.0, 0.0, 0.0, 0.0],
    fogCol: [0.18, 0.09, 0.06],
    fogParams: [12.0, 34.0, 0.40]
  };

  wgl.beginFrame(W, H, cam, atmo);

  // A. BẦU TRỜI ĐÊM SVĐ (CHẾ ĐỘ B — 0% VOID Ở PITCH ARENA & SKYBOX)
  dm('quad', 'skyNightDome', 0, 16.0, 60.0, 0, Math.PI, 0, 74, 34, 1, { tint: [1, 1, 1, 1], emissive: 1.0 });
  dm('quad', 'skyNightDome', -28.0, 16.0, 35.0, 0, Math.PI * 0.5, 0, 58, 34, 1, { tint: [1, 1, 1, 1], emissive: 1.0 });
  dm('quad', 'skyNightDome',  28.0, 16.0, 35.0, 0, -Math.PI * 0.5, 0, 58, 34, 1, { tint: [1, 1, 1, 1], emissive: 1.0 });
  dm('quad', 'skyNightDome', 0, 16.0, 10.0, 0, 0, 0, 74, 34, 1, { tint: [1, 1, 1, 1], emissive: 1.0 });

  // B. PHÒNG THAY ĐỒ ĐT VIỆT NAM (locker_tunnel: X ∈ [-6, 6], Z ∈ [0, 14], Y = 0)
  dm('box', 'lockerFloor', 0, -0.05, 7.0, 0, 0, 0, 12.0, 0.1, 14.0, { tint: [1, 1, 1, 1], us: 4, vs: 5 });
  dm('box', 'redCarpet',   0, 0.006, 7.2, 0, 0, 0, 3.3, 0.012, 13.6, { tint: [1, 1, 1, 1], us: 1, vs: 4 });
  // Tường Trái (-6), Tường Sau VIP/Stair (+6), Tường Mặt Tiền (Z = 0) & Cổng Hầm (Z = 14)
  dm('box', 'lockerWall', -6.08, 2.2, 7.0, 0, 0, 0, 0.16, 4.4, 14.0, { tint: [1, 1, 1, 1], us: 4, vs: 1.5 });
  dm('box', 'lockerWall',  6.08, 1.7, 7.0, 0, 0, 0, 0.16, 3.4, 14.0, { tint: [1, 1, 1, 1], us: 4, vs: 1.2 });
  dm('box', 'lockerWall',  6.08, 5.1, 6.0, 0, 0, 0, 0.16, 3.4, 12.0, { tint: [1, 1, 1, 1], us: 3.5, vs: 1.2 });
  dm('box', 'lockerWall', -3.68, 2.2, 0.0, 0, 0, 0, 4.65, 4.4, 0.16, { tint: [1, 1, 1, 1], us: 1.5, vs: 1.5 });
  dm('box', 'lockerWall',  3.68, 2.2, 0.0, 0, 0, 0, 4.65, 4.4, 0.16, { tint: [1, 1, 1, 1], us: 1.5, vs: 1.5 });
  dm('box', 'lockerWall',  0.0,  3.6, 0.0, 0, 0, 0, 2.75, 1.6, 0.16, { tint: [1, 1, 1, 1] });
  // Hai cánh cửa ra Đại Lộ Sài Gòn tại Z = 0
  dm('box', 'lockerWall', -0.68, 1.4, 0.06, 0, 0, 0, 1.32, 2.8, 0.08, { tint: [0.85, 0.55, 0.25, 1] });
  var dAng = st.rightDoorOpen || 0.35;
  dm('box', 'lockerWall', 0.68 + Math.sin(dAng) * 0.35, 1.4, 0.06 + Math.sin(dAng) * 0.55, 0, -dAng, 0, 1.32, 2.8, 0.08, { tint: [0.92, 0.65, 0.30, 1] });
  // Tường Bắc Phòng Thay Đồ (Z = 14.0) chừa cổng Đường Hầm FIFA X ∈ [-1.8, 1.8]
  dm('box', 'lockerWall', -3.9, 2.2, 14.0, 0, 0, 0, 4.2, 4.4, 0.16, { tint: [1, 1, 1, 1], us: 1.4, vs: 1.4 });
  dm('box', 'lockerWall',  3.9, 2.2, 14.0, 0, 0, 0, 4.2, 4.4, 0.16, { tint: [1, 1, 1, 1], us: 1.4, vs: 1.4 });
  dm('box', 'lockerWall',  0.0, 3.9, 14.0, 0, 0, 0, 3.6, 1.0, 0.16, { tint: [1, 1, 1, 1] });
  // Trần Phòng Thay Đồ (Y = 4.4) chừa lỗ lồng cầu thang VIP (X ∈ [3.3, 6.0], Z ∈ [6.6, 14.0]) + mái lồng cầu thang (Y = 6.8)
  dm('box', 'lockerWall', -1.35, 4.4, 7.0, 0, 0, 0, 9.3, 0.16, 14.0, { tint: [0.75, 0.65, 0.60, 1], us: 3, vs: 4 });
  dm('box', 'lockerWall',  4.65, 4.4, 3.3, 0, 0, 0, 2.7, 0.16, 6.6,  { tint: [0.75, 0.65, 0.60, 1], us: 1, vs: 2 });
  dm('box', 'lockerWall',  4.65, 6.8, 10.3, 0, 0, 0, 2.8, 0.16, 7.4, { tint: [0.75, 0.65, 0.60, 1], us: 1, vs: 2 });
  dm('box', 'lockerWall',  3.30, 5.6, 10.3, 0, 0, 0, 0.14, 2.4, 7.4, { tint: [0.85, 0.75, 0.70, 1], us: 2, vs: 1 });
  dm('box', 'lockerWall',  4.65, 5.6, 6.6,  0, 0, 0, 2.7, 2.4, 0.14, { tint: [0.85, 0.75, 0.70, 1], us: 1, vs: 1 });

  // Mỹ thuật tường Phòng Thay Đồ + Nội Thất: Tủ áo #10/#19/#22/#9, Sa Bàn 4-3-3, Bồn Cryo (4.1, 0, 3.8), Cầu thang VIP 12 bậc
  dm('quad', 'lockerCabinet', -5.96, 1.98, 6.7, 0, Math.PI * 0.5, 0, 9.6, 2.35, 1, { tint: [1, 1, 1, 1] });
  dm('box',  'lockerWall',    -5.05, 0.24, 6.7, 0, 0, 0, 1.15, 0.48, 9.6, { tint: [0.9, 0.35, 0.30, 1] });
  dm('quad', 'tacticsBoard',   5.96, 2.25, 3.6, 0, -Math.PI * 0.5, 0, 4.2, 2.1, 1, { tint: [1, 1, 1, 1] });
  dm('quad', 'tunnelSign',     0.0,  3.25, 13.88, 0, Math.PI, 0, 4.2, 1.05, 1, { tint: [1, 1, 1, 1], emissive: 0.45 });

  // Bàn Sa Bàn Chiến Thuật giữa phòng (0, 0, 5.8) + 2 quả bóng
  dm('box', 'lockerWall', 0.0, 0.38, 5.8, 0, 0, 0, 1.85, 0.76, 1.20, { tint: [0.85, 0.55, 0.30, 1] });
  dm('box', 'fifaGrass',  0.0, 0.78, 5.8, 0, 0, 0, 1.75, 0.04, 1.10, { tint: [1, 1, 1, 1] });
  dm('sphere', 'white', -0.4, 0.90, 5.8, 0, 0, 0, 0.22, 0.22, 0.22, { tint: [0.98, 0.98, 0.98, 1] });
  dm('sphere', 'white',  0.4, 0.90, 5.8, 0, 0, 0, 0.22, 0.22, 0.22, { tint: [0.98, 0.98, 0.98, 1] });

  // Bồn Hồi Sức Cryo tại (4.1, 0, 3.8) — QĐ 250
  dm('box', 'white', 4.1, 0.34, 3.8, 0, 0, 0, 1.48, 0.68, 1.48, { tint: [0.86, 0.92, 0.98, 1], specPow: 64 });
  dm('box', 'white', 4.1, 0.68, 3.8, 0, 0, 0, 1.28, 0.06, 1.28, { tint: [0.22, 0.74, 0.96, 1], emissive: 0.45, specPow: 120 });

  // Cầu thang bộ VIP 12 bậc dọc +Z (X ∈ [3.4, 5.2], Z ∈ [6.6, 12.0], Y: 0 → 3.4) + Chiếu nghỉ (Z ∈ [12.0, 13.8])
  for (var vs = 0; vs < 12; vs++) {
    var vStepZ = 6.6 + (vs + 0.5) * (5.4 / 12);
    var vStepY = (vs + 1) * (3.4 / 12);
    dm('box', 'redCarpet', 4.3, vStepY * 0.5, vStepZ, 0, 0, 0, 1.80, vStepY, 0.46, { tint: [1.0, 0.94, 0.88, 1] });
    dm('box', 'white',     4.3, vStepY,       vStepZ - 0.19, 0, 0, 0, 1.82, 0.04, 0.06, { tint: [0.96, 0.74, 0.24, 1] });
  }
  // Tay vịn vàng cầu thang VIP & Chiếu nghỉ trên Y = 3.4
  dm('box', 'white', 3.46, 2.25, 9.3, -0.56, 0, 0, 0.08, 0.08, 6.4, { tint: [0.96, 0.74, 0.24, 1], specPow: 80 });
  dm('box', 'vipMarble', 4.8, 3.34, 12.9, 0, 0, 0, 2.8, 0.12, 1.8, { tint: [1, 1, 1, 1], us: 1.5, vs: 1 });
  dm('box', 'white', 3.46, 3.90, 12.9, 0, 0, 0, 0.08, 1.0, 1.8, { tint: [0.96, 0.74, 0.24, 1] });
  dm('box', 'white', 4.80, 3.90, 13.76, 0, 0, 0, 2.8, 1.0, 0.08, { tint: [0.96, 0.74, 0.24, 1] });

  // C. ĐƯỜNG HẦM CẦU THỦ FIFA (player_tunnel: X ∈ [-1.8, 1.8], Z ∈ [14.0, 21.2], Y: 0 → 0.8)
  dm('wedge', 'redCarpet', 0.0, 0.40, 17.6, 0, 0, 0, 3.6, 0.80, 7.2, { tint: [1, 1, 1, 1], us: 1, vs: 3 });
  dm('box', 'lockerWall', -1.88, 1.9, 17.6, 0, 0, 0, 0.16, 3.8, 7.2, { tint: [1, 1, 1, 1], us: 2.5, vs: 1 });
  dm('box', 'lockerWall',  1.88, 1.9, 17.6, 0, 0, 0, 0.16, 3.8, 7.2, { tint: [1, 1, 1, 1], us: 2.5, vs: 1 });
  dm('box', 'lockerWall',  0.0,  3.8, 17.6, 0, 0, 0, 3.8, 0.16, 7.2, { tint: [0.85, 0.75, 0.65, 1], us: 1.5, vs: 3 });
  for (var tr = 15.2; tr <= 20.2; tr += 2.5) {
    dm('sphere', 'white', 0.0, 3.55, tr, 0, 0, 0, 0.28, 0.16, 0.28, { tint: [1.0, 0.92, 0.65, 1], emissive: 1.5 });
  }

  // D. SÂN CỎ TRỐNG ĐỒNG & KHÁN ĐÀI 4 PHÍA (pitch_arena: X ∈ [-18, 18], Z ∈ [21.2, 49.2], Y = 0.8)
  dm('box', 'pisteTrack', 0.0, 0.74, 35.2, 0, 0, 0, 36.0, 0.12, 28.0, { tint: [1, 1, 1, 1], us: 8, vs: 6 });
  dm('box', 'fifaGrass',  0.0, 0.804, 35.2, 0, 0, 0, 26.8, 0.016, 20.0, { tint: [1, 1, 1, 1], us: 7, vs: 5 });
  // Vạch kẻ sân FIFA trắng (Đông-Tây) + Mặt Trời Trống Đồng giữa sân (Z = 35.2)
  dm('box', 'white',  0.0,   0.816, 25.2, 0, 0, 0, 26.8, 0.01, 0.12, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'white',  0.0,   0.816, 45.2, 0, 0, 0, 26.8, 0.01, 0.12, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'white', -13.4,  0.816, 35.2, 0, 0, 0, 0.12, 0.01, 20.0, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'white',  13.4,  0.816, 35.2, 0, 0, 0, 0.12, 0.01, 20.0, { tint: [1, 1, 1, 1], emissive: 0.25 });
  dm('box', 'white',  0.0,   0.816, 35.2, 0, 0, 0, 0.10, 0.01, 20.0, { tint: [1, 1, 1, 1], emissive: 0.25 });
  // Vòng cấm địa Đông & Tây
  dm('box', 'white',  11.4, 0.816, 30.7, 0, 0, 0, 4.0, 0.01, 0.10, { tint: [1, 1, 1, 1] });
  dm('box', 'white',  11.4, 0.816, 39.7, 0, 0, 0, 4.0, 0.01, 0.10, { tint: [1, 1, 1, 1] });
  dm('box', 'white',   9.4, 0.816, 35.2, 0, 0, 0, 0.10, 0.01, 9.1, { tint: [1, 1, 1, 1] });
  dm('box', 'white', -11.4, 0.816, 30.7, 0, 0, 0, 4.0, 0.01, 0.10, { tint: [1, 1, 1, 1] });
  dm('box', 'white', -11.4, 0.816, 39.7, 0, 0, 0, 4.0, 0.01, 0.10, { tint: [1, 1, 1, 1] });
  dm('box', 'white',  -9.4, 0.816, 35.2, 0, 0, 0, 0.10, 0.01, 9.1, { tint: [1, 1, 1, 1] });
  wgl.setBlend('alpha');
  dm('quad', 'dongSonCenter', 0.0, 0.822, 35.2, -Math.PI * 0.5, 0, 0, 5.2, 5.2, 1, { tint: [1, 0.96, 0.65, 0.82], emissive: 0.38 });
  wgl.setBlend(null);

  // Khung thành Đông & Tây + Khu kỹ thuật ĐT Việt Nam / Đội Khách dọc đường biên Nam
  drawStadiumGoalWebgl(wgl,  13.4,  1);
  drawStadiumGoalWebgl(wgl, -13.4, -1);
  dm('box', 'redCarpet', -6.1, 1.05, 23.1, 0, 0, 0, 5.0, 0.5, 1.5, { tint: [1, 1, 1, 1] });
  dm('box', 'white',      6.1, 1.05, 23.1, 0, 0, 0, 5.0, 0.5, 1.5, { tint: [0.14, 0.34, 0.72, 1] });

  // Khán đài Cờ Đỏ Sao Vàng 4 phía + Mái Vòm Trống Đồng + LED Scoreboard + 4 Trụ Đèn Pha
  dm('box', 'grandstandRedGold', 0.0,   3.0, 51.4, -0.32, 0, 0, 38.0, 4.8, 3.8, { tint: [1, 1, 1, 1], us: 5, vs: 1 });
  dm('box', 'grandstandRedGold', -20.2, 3.0, 35.2, 0, 0, -0.32, 3.8, 4.8, 29.0, { tint: [1, 1, 1, 1], us: 4, vs: 1 });
  dm('box', 'grandstandRedGold',  20.2, 3.0, 35.2, 0, 0,  0.32, 3.8, 4.8, 29.0, { tint: [1, 1, 1, 1], us: 4, vs: 1 });
  // Khán đài Nam chừa lối hầm cầu thủ (X ∈ [-2.0, 2.0]) & chừa tầm nhìn Hành Lang Kính Skybox (X ∈ [6.0, 12.6])
  dm('box', 'grandstandRedGold', -10.2, 2.6, 19.6, 0.30, 0, 0, 16.0, 3.8, 2.8, { tint: [1, 1, 1, 1], us: 2.5, vs: 1 });
  dm('box', 'grandstandRedGold',  4.0,  2.6, 19.6, 0.30, 0, 0, 3.8,  3.8, 2.8, { tint: [1, 1, 1, 1], us: 1, vs: 1 });
  dm('box', 'grandstandRedGold',  15.6, 2.6, 19.6, 0.30, 0, 0, 5.6,  3.8, 2.8, { tint: [1, 1, 1, 1], us: 1, vs: 1 });

  // Mái vòm Trống Đồng Đông Sơn trên khán đài Bắc / Tây / Đông + Biểu ngữ + LED Scoreboard
  dm('box', 'roofTrongDong', 0.0,   7.2, 50.8, 0.14, 0, 0, 40.0, 0.35, 6.2, { tint: [1, 1, 1, 1], us: 8, vs: 1, emissive: 0.15 });
  dm('box', 'roofTrongDong', -20.0, 7.2, 35.2, 0, 0, 0.14, 6.2, 0.35, 32.0, { tint: [1, 1, 1, 1], us: 6, vs: 1, emissive: 0.15 });
  dm('box', 'roofTrongDong',  20.0, 7.2, 35.2, 0, 0, -0.14, 6.2, 0.35, 32.0, { tint: [1, 1, 1, 1], us: 6, vs: 1, emissive: 0.15 });

  var sbTex = ensureStadiumScoreboardTex(wgl, st.vnScore, isGoalFlash);
  dm('quad', sbTex,           0.0,   6.0, 49.4, 0, Math.PI, 0, 12.8, 3.2, 1, { tint: [1, 1, 1, 1], emissive: 1.0 });
  dm('quad', 'bannerVnChamp', -18.2, 5.8, 35.2, 0, Math.PI * 0.5, 0, 16.0, 1.8, 1, { tint: [1, 1, 1, 1], emissive: 0.65 });
  dm('quad', 'bannerVnChamp',  18.2, 5.8, 35.2, 0, -Math.PI * 0.5, 0, 16.0, 1.8, 1, { tint: [1, 1, 1, 1], emissive: 0.65 });

  // 4 Trụ đèn pha SVĐ ở 4 góc sân
  drawFloodlightTowerWebgl(wgl, -18.5, 21.5,  Math.PI * 0.25);
  drawFloodlightTowerWebgl(wgl,  18.5, 21.5, -Math.PI * 0.25);
  drawFloodlightTowerWebgl(wgl, -18.5, 49.0,  Math.PI * 0.75);
  drawFloodlightTowerWebgl(wgl,  18.5, 49.0, -Math.PI * 0.75);

  // Quả bóng FIFA 3D trên sân cỏ
  wgl.setBlend('alpha');
  dm('cyl', 'white', st.ball.x, 0.82, st.ball.z, 0, 0, 0, 0.36, 0.01, 0.36, { tint: [0.05, 0.08, 0.05, 0.35], emissive: 1.0 });
  wgl.setBlend(null);
  dm('sphere', 'white', st.ball.x, st.ball.y + 0.14, st.ball.z, 0, st.t * 3, 0, 0.34, 0.34, 0.34, { tint: [0.99, 0.99, 0.99, 1], specPow: 96 });

  // E. SẢNH CÚP VÀNG & HÀNH LANG KÍNH SKYBOX ĐÚC HẪNG (trophy_vip: Y = 3.4)
  dm('box', 'vipMarble', 11.2, 3.34, 12.0, 0, 0, 0, 10.0, 0.12, 12.0, { tint: [1, 1, 1, 1], us: 4, vs: 4 });
  dm('box', 'redCarpet', 11.2, 3.406, 12.6, 0, 0, 0, 3.6, 0.012, 10.4, { tint: [1, 1, 1, 1], us: 1, vs: 4 });
  // Tường & Trần phòng Cúp Vàng (Z=6, X=16.2, X=6.2 chừa cửa VIP Z ∈ [12.0, 13.8], Z=18 phần Đông X ∈ [12.4, 16.2])
  dm('box', 'lockerWall', 11.2, 5.1, 6.0,  0, 0, 0, 10.0, 3.4, 0.16, { tint: [1, 1, 1, 1], us: 3, vs: 1 });
  dm('box', 'lockerWall', 16.2, 5.1, 12.0, 0, 0, 0, 0.16, 3.4, 12.0, { tint: [1, 1, 1, 1], us: 4, vs: 1 });
  dm('box', 'lockerWall', 6.2,  5.1, 9.0,  0, 0, 0, 0.16, 3.4, 6.0,  { tint: [1, 1, 1, 1], us: 2, vs: 1 });
  dm('box', 'lockerWall', 6.2,  5.1, 15.9, 0, 0, 0, 0.16, 3.4, 4.2,  { tint: [1, 1, 1, 1], us: 1.5, vs: 1 });
  dm('box', 'lockerWall', 6.2,  6.4, 12.9, 0, 0, 0, 0.16, 0.8, 1.8,  { tint: [1, 1, 1, 1] });
  dm('box', 'lockerWall', 14.3, 5.1, 18.0, 0, 0, 0, 3.8, 3.4, 0.16,  { tint: [1, 1, 1, 1], us: 1.5, vs: 1 });
  dm('box', 'lockerWall', 11.2, 6.8, 12.0, 0, 0, 0, 10.0, 0.16, 12.0, { tint: [0.85, 0.72, 0.62, 1], us: 4, vs: 4 });

  // Tranh Tường Hall of Champions (Z = 6.1) & Phông Nền Họp Báo Quốc Tế (X = 16.1)
  dm('quad', 'hallOfChampions',  11.2, 5.15, 6.10, 0, 0, 0, 6.2, 2.4, 1, { tint: [1, 1, 1, 1] });
  dm('quad', 'vipPressBackdrop', 16.08, 5.15, 13.8, 0, -Math.PI * 0.5, 0, 6.4, 2.5, 1, { tint: [1, 1, 1, 1] });

  // Bục Cúp Vàng & Trống Đồng tại (11.2, 3.4, 11.2)
  drawStadiumTrophyAndDrumWebgl(wgl, 11.2, 3.4, 11.2, st.t);

  // Bàn Họp Báo Quốc Tế FIFA gắn 3 Micro (X ∈ [8.75, 13.65], Z ∈ [14.7, 16.1])
  dm('box', 'redCarpet', 11.2, 3.84, 15.4, 0, 0, 0, 4.9, 0.88, 1.4, { tint: [1, 1, 1, 1], us: 2, vs: 1 });
  dm('box', 'white',     11.2, 4.30, 15.4, 0, 0, 0, 5.0, 0.06, 1.5, { tint: [0.96, 0.74, 0.24, 1] });
  var micXs = [9.8, 11.2, 12.6];
  for (var mi = 0; mi < micXs.length; mi++) {
    dm('cyl', 'white', micXs[mi], 4.44, 15.1, 0, 0, 0, 0.06, 0.22, 0.06, { tint: [0.12, 0.16, 0.22, 1] });
    dm('sphere', 'white', micXs[mi], 4.56, 15.1, 0, 0, 0, 0.11, 0.11, 0.11, { tint: mi === 1 ? [0.86, 0.15, 0.15, 1] : [0.15, 0.20, 0.28, 1] });
  }

  // Hành Lang Kính Skybox Đúc Hẫng (X ∈ [6.2, 12.4], Z ∈ [18.0, 23.6], Y = 3.4) nhô ra 2.4m nhìn thẳng xuống sân cỏ!
  // Dầm vàng chịu lực dưới sàn Skybox & Viền khung vàng
  dm('box', 'white', 6.28,  3.28, 20.8, 0, 0, 0, 0.22, 0.24, 5.6, { tint: [0.92, 0.70, 0.22, 1] });
  dm('box', 'white', 12.32, 3.28, 20.8, 0, 0, 0, 0.22, 0.24, 5.6, { tint: [0.92, 0.70, 0.22, 1] });
  dm('box', 'white', 9.30,  3.28, 23.52, 0, 0, 0, 6.2, 0.24, 0.22, { tint: [0.92, 0.70, 0.22, 1] });
  dm('box', 'white', 9.30,  4.45, 23.54, 0, 0, 0, 6.2, 0.08, 0.08, { tint: [0.96, 0.78, 0.28, 1] }); // Tay vịn kính Skybox
  dm('box', 'white', 6.24,  4.45, 20.8,  0, 0, 0, 0.08, 0.08, 5.6, { tint: [0.96, 0.78, 0.28, 1] });
  dm('box', 'white', 12.36, 4.45, 20.8,  0, 0, 0, 0.08, 0.08, 5.6, { tint: [0.96, 0.78, 0.28, 1] });
  dm('box', 'roofTrongDong', 9.30, 6.8, 20.8, 0, 0, 0, 6.4, 0.16, 5.6, { tint: [1, 1, 1, 1], us: 2, vs: 2 });

  // Sàn Kính & Lan Can Kính Skybox Bán Trong Suốt nhìn xuyên xuống đường piste & sân cỏ!
  wgl.setBlend('alpha');
  dm('box',  'white', 9.30, 3.36, 20.8, 0, 0, 0, 6.0, 0.08, 5.5, { tint: [0.68, 0.90, 0.98, 0.42], specPow: 120 });
  dm('quad', 'white', 9.30, 3.92, 23.54, 0, 0, 0, 6.1, 1.02, 1, { tint: [0.74, 0.92, 1.0, 0.24] });
  dm('quad', 'white', 6.24, 3.92, 20.8,  0, Math.PI * 0.5, 0, 5.5, 1.02, 1, { tint: [0.74, 0.92, 1.0, 0.24] });
  dm('quad', 'white', 12.36, 3.92, 20.8, 0, Math.PI * 0.5, 0, 5.5, 1.02, 1, { tint: [0.74, 0.92, 1.0, 0.24] });
  wgl.setBlend(null);

  // F. 13 NPC PIXEL ART (drawHumanBillboardWebgl) & CHÚ HEO MASCOT 24×20 (drawPigBillboardWebgl)
  if (typeof drawHumanBillboardWebgl === 'function') {
    for (var hi = 0; hi < st.npcs.length; hi++) {
      drawHumanBillboardWebgl(wgl, cam, st.npcs[hi], st.t);
    }
  }
  if (typeof drawPigBillboardWebgl === 'function') {
    drawPigBillboardWebgl(wgl, cam, st.pig, st.t, false);
  }

  // G. VÒNG SÓNG CHẠM SÀN & PHÁO GIẤY VÀNG-ĐỎ ĂN MỪNG
  wgl.setBlend('add');
  for (var ri = 0; ri < st.ripples.length; ri++) {
    var rp = st.ripples[ri];
    var rAlpha = Math.max(0, 1 - rp.t / 0.75) * 0.75;
    dm('torus', 'white', rp.x, (rp.y || 0) + 0.03, rp.z, Math.PI * 0.5, 0, 0, 0.35 + rp.t * 0.9, 0.35 + rp.t * 0.9, 0.2, { tint: [0.98, 0.84, 0.28, rAlpha], emissive: 1.2 });
  }
  if (isGoalFlash || (st.confettiUntil && st.t < st.confettiUntil)) {
    for (var ci = 0; ci < 24; ci++) {
      var cAng = ci * 0.52 + st.t * 2.2;
      var cRad = 1.2 + (ci % 5) * 0.45;
      var cy = (p.y || 0) + 0.5 + ((ci * 0.37 + st.t * 1.4) % 2.6);
      dm('box', 'white', p.x + Math.cos(cAng) * cRad, cy, p.z + Math.sin(cAng) * cRad, st.t * 3, st.t * 2, 0, 0.12, 0.12, 0.04, {
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
  var room = st.room || st.zone || 'locker_tunnel';
  var isPitch = room === 'pitch_arena';
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
