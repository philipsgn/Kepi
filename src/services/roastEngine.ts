import { RealityMetrics } from '../utils/realityCalc';

const ROAST_TEMPLATES: Record<string, string[]> = {
  an_uong: [
    'Hôm nay làm ly thứ 2 rồi đấy bạn tôi ơi. Uống ngụm nước lọc cho thanh tao, ví đỡ hao gầy nào!',
    'Món này ngon đấy, nhưng bằng tiền ăn 2 bữa cơm trưa rồi. Ví bạn vừa giật mình thon thót kìa.',
    'Trời lạnh ăn ngon thì thích thật, nhưng ăn xong có thấy ví lạnh hơn cả gió mùa đông bắc không?',
    'Uống một ngụm trà sữa ngọt ngào, cuối tháng nhìn số dư mà đắng ngắt. Nghĩ lại xem nào!',
  ],
  mua_sam: [
    'Áo này xinh thật, nhưng trong tủ cậu có 3 chiếc màu nâu tây rồi đấy. Ngủ một đêm xem mai còn thèm không?',
    'Shopee sale 50% nhưng ví bạn hao 100% tiền thật. Cứu ví trước khi bấm chốt đơn đi bạn ơi!',
    'Đồ đẹp chỉ làm vui mắt lúc mở hộp. Tiền còn trong ví mới làm bạn ngủ ngon mỗi đêm.',
    'Mua món này là lùi ngày rước laptop thêm mấy ngày đấy. Bạn chọn áo mới hay laptop mới?',
  ],
  di_chuyen: [
    'Phí book xe giờ cao điểm bằng nửa bữa lẩu rồi. Nếu không vội thì đợi 15 phút cho hạ nhiệt nhé!',
    'Đi bộ ngắm phố mùa thu vừa khỏe người vừa giữ trọn vẹn số dư ví bạn ơi.',
  ],
  default: [
    'Món này đẹp đấy, nhưng có thực sự cần ngay lúc này không? Hay là mình đưa vào Giỏ Chờ ngẫm lại nhé?',
    'Cơn bốc đồng mua sắm thường chỉ kéo dài 20 phút. Hít thở sâu rồi tính tiếp nào!',
    'Ví của bạn đang thì thầm: "Khoan đã, đừng vội rút tớ ra lúc này!"',
    'Thử bấm "Thôi" một lần xem cảm giác giải cứu ví tiền nó sảng khoái thế nào nhé!',
  ],
};

export async function generateJudgmentRoast(params: {
  itemName: string;
  amount: number;
  category: string;
  metrics: RealityMetrics;
}): Promise<string> {
  const { category, metrics } = params;

  // Giả lập độ trễ AI 400ms để tạo cảm giác suy nghĩ
  await new Promise((resolve) => setTimeout(resolve, 400));

  const templates = ROAST_TEMPLATES[category] || ROAST_TEMPLATES.default;
  const randomIndex = Math.floor(Math.random() * templates.length);
  const baseRoast = templates[randomIndex];

  // Thêm câu số liệu thực tế phía trước
  const impactSentence = `Món này tương đương tận ${metrics.favUnitCount} ${metrics.favUnitName} và ${metrics.budgetDays} ngày ngân sách.`;

  return `${impactSentence} ${baseRoast}`;
}
