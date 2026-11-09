/**
 * Financial Monopoly Board Engine (Pure Mechanics)
 * Động cơ bàn cờ 16 ô Cờ Tỷ Phú Đầu Tư Tài Chính cho PigFly
 */

export type TileType =
  | 'START'
  | 'DECISION'
  | 'CHANCE'
  | 'FOMO_TRAP'
  | 'INVESTMENT'
  | 'EMERGENCY'
  | 'BILL'
  | 'LUCK'
  | 'REST'
  | 'SHARED_GOAL'
  | 'TAX'
  | 'DIVIDEND';

export interface BoardTile {
  index: number;
  title: string;
  type: TileType;
  emoji: string;
  description: string;
  fepRewardDefault: number;
  hasChoice?: boolean;
  choiceResistFep?: number;
  choiceSpendFep?: number;
}

export const MONOPOLY_BOARD_TILES: BoardTile[] = [
  {
    index: 0,
    title: 'BẮT ĐẦU',
    type: 'START',
    emoji: '🏁',
    description: 'Vượt qua vạch xuất phát! Nhận thưởng năng lượng bay.',
    fepRewardDefault: 50,
  },
  {
    index: 1,
    title: 'Bữa Sáng Sinh Viên',
    type: 'DECISION',
    emoji: '🍳',
    description: 'Bún bò 45k hay tự nấu mì 15k?',
    fepRewardDefault: 20,
    hasChoice: true,
    choiceResistFep: 25,
    choiceSpendFep: 0,
  },
  {
    index: 2,
    title: 'Thẻ Cơ Hội I',
    type: 'CHANCE',
    emoji: '🎟️',
    description: 'Bạn thân bao chầu cà phê Highlands!',
    fepRewardDefault: 30,
  },
  {
    index: 3,
    title: 'Bẫy FOMO: Shopee 50%',
    type: 'FOMO_TRAP',
    emoji: '🛍️',
    description: 'Áo khoác trend TikTok giảm còn 250k. Có nên mua?',
    fepRewardDefault: 0,
    hasChoice: true,
    choiceResistFep: 40,
    choiceSpendFep: -20,
  },
  {
    index: 4,
    title: 'Đầu Tư Chứng Chỉ Quỹ',
    type: 'INVESTMENT',
    emoji: '📈',
    description: 'Tích lũy 50k vào ETF VN30. Lãi kép bắt đầu chạy!',
    fepRewardDefault: 35,
  },
  {
    index: 5,
    title: 'Quỹ Khẩn Cấp',
    type: 'EMERGENCY',
    emoji: '🛟',
    description: 'Xe thủng lốp! May mắn đã có quỹ dự phòng lo liệu.',
    fepRewardDefault: 20,
  },
  {
    index: 6,
    title: 'Hóa Đơn Tiền Trọ',
    type: 'BILL',
    emoji: '🏠',
    description: 'Trích chi phí cố định đúng hạn, không áp lực.',
    fepRewardDefault: 20,
  },
  {
    index: 7,
    title: 'Thẻ Khí Vận',
    type: 'LUCK',
    emoji: '🍀',
    description: 'Tìm thấy voucher giảm giá 30k khi đi siêu thị.',
    fepRewardDefault: 25,
  },
  {
    index: 8,
    title: 'Nghỉ Chân Công Viên',
    type: 'REST',
    emoji: '🌳',
    description: 'Heo thư giãn hít thở khí trời, hồi phục năng lượng.',
    fepRewardDefault: 15,
  },
  {
    index: 9,
    title: 'Bẫy FOMO: Trà Sữa Đêm',
    type: 'FOMO_TRAP',
    emoji: '🧋',
    description: 'Ly trà sữa full topping 65k sau 22h.',
    fepRewardDefault: 0,
    hasChoice: true,
    choiceResistFep: 30,
    choiceSpendFep: -15,
  },
  {
    index: 10,
    title: 'Góp Hũ Du Lịch Squad',
    type: 'SHARED_GOAL',
    emoji: '✈️',
    description: 'Đóng góp 50k cùng nhóm bạn đi Đà Lạt cuối năm!',
    fepRewardDefault: 40,
  },
  {
    index: 11,
    title: 'Thẻ Cơ Hội II',
    type: 'CHANCE',
    emoji: '🎁',
    description: 'Được hoàn tiền 50k từ chương trình chi tiêu xanh.',
    fepRewardDefault: 30,
  },
  {
    index: 12,
    title: 'Bẫy FOMO: Đổi Điện Thoại',
    type: 'FOMO_TRAP',
    emoji: '📱',
    description: 'Lên đời máy mới trả góp khi máy cũ vẫn mượt.',
    fepRewardDefault: 0,
    hasChoice: true,
    choiceResistFep: 50,
    choiceSpendFep: -25,
  },
  {
    index: 13,
    title: 'Đầu Tư Bản Thân',
    type: 'INVESTMENT',
    emoji: '📖',
    description: 'Mua sách tư duy tài chính. Khoản đầu tư sinh lời nhất!',
    fepRewardDefault: 35,
  },
  {
    index: 14,
    title: 'Chi Phí Bảo Trì',
    type: 'TAX',
    emoji: '⚖️',
    description: 'Bảo dưỡng xe máy định kỳ để an toàn di chuyển.',
    fepRewardDefault: 10,
  },
  {
    index: 15,
    title: 'Chia Cổ Tức Tháng',
    type: 'DIVIDEND',
    emoji: '💰',
    description: 'Nhận thưởng cổ tức nhờ kỷ luật dòng tiền vững vàng.',
    fepRewardDefault: 60,
  },
];

/**
 * Đổ xúc xắc ngẫu nhiên từ 1 đến 6
 */
export function rollMonopolyDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

/**
 * Tính toán vị trí mới sau khi di chuyển trên bàn cờ 16 ô
 */
export function calculateNewPosition(currentPos: number, steps: number): {
  newPos: number;
  passedGo: boolean;
  tile: BoardTile;
} {
  const safeCurrent = Math.max(0, currentPos);
  const rawTarget = safeCurrent + steps;
  const newPos = rawTarget % 16;
  const passedGo = rawTarget >= 16;
  const tile = MONOPOLY_BOARD_TILES[newPos];

  return {
    newPos,
    passedGo,
    tile,
  };
}

/**
 * Xử lý quyết định của người chơi tại các ô thử thách (FOMO Trap / Decision)
 */
export function resolveTileDecision(
  tile: BoardTile,
  choice: 'RESIST' | 'SPEND' | 'ACCEPT'
): { earnedFep: number; message: string } {
  if (choice === 'RESIST') {
    const fep = tile.choiceResistFep ?? 30;
    return {
      earnedFep: fep,
      message: `🎉 Tuyệt vời! Bạn vừa cứu ví trước cám dỗ "${tile.title}" (+${fep} FEP)!`,
    };
  }

  if (choice === 'SPEND') {
    const fep = tile.choiceSpendFep ?? -10;
    return {
      earnedFep: fep,
      message: `💸 Bẫy chi tiêu kích hoạt! "${tile.title}" làm chậm tiến trình bay (${fep} FEP).`,
    };
  }

  // Mặc định nhận thưởng ô đất
  return {
    earnedFep: tile.fepRewardDefault,
    message: `✨ Đặt chân đến "${tile.title}" (+${tile.fepRewardDefault} FEP)!`,
  };
}
