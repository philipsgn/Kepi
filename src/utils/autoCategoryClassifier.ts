/**
 * Auto Category Classifier
 * Phân loại danh mục chi tiêu / thu nhập thông minh dựa trên từ khóa nội dung giao dịch.
 * Hoạt động 100% offline không cần gọi AI bên ngoài.
 */

interface CategoryRule {
  categoryId: string;
  categoryName: string;
  keywords: string[];
}

const EXPENSE_RULES: CategoryRule[] = [
  {
    categoryId: 'food',
    categoryName: 'Ăn uống',
    keywords: [
      'highland', 'highlands', 'phuc long', 'coffee', 'cafe', 'katinat', 'starbucks', 'cheese coffee',
      'the coffee house', 'shopeefood', 'grabfood', 'baemin', 'be food', 'befood',
      'com', 'bun', 'pho', 'banh mi', 'tra sua', 'toce', 'ding tea', 'gong cha', 'mixue',
      'che', 'lau', 'bbq', 'haidilao', 'kichi', 'gogi', 'king bbq', 'pizza', 'burger',
      'kfc', 'lotteria', 'jollibee', 'mcdonald', 'nha hang', 'quan an', 'an sang', 'an trua', 'an toi'
    ],
  },
  {
    categoryId: 'transport',
    categoryName: 'Đi lại',
    keywords: [
      'grab', 'be', 'xanh sm', 'xanhsm', 'taxi', 'mai linh', 'vina sun', 'vinasun',
      'xang', 'petrolimex', 'pvoil', 'oil', 'gui xe', 've xe', 'xe buyt', 'bus',
      'sua xe', 'rua xe', 'thay nhot', 'cau duong', 'bot', 'epass', 'vetc'
    ],
  },
  {
    categoryId: 'shopping',
    categoryName: 'Mua sắm',
    keywords: [
      'shopee', 'lazada', 'tiki', 'tiktok shop', 'tiktokshop', 'sendo',
      'winmart', 'co.op', 'coop', 'bach hoa xanh', 'bhx', 'circle k', 'circlek',
      'gs25', '7-eleven', '7eleven', 'family mart', 'familymart', 'ministop',
      'uniqlo', 'zara', 'h&m', 'hm', 'canifa', 'yody', 'routine',
      'sieuthi', 'sieu thi', 'tap hoa', 'my pham', 'hasaki', 'guardian', 'watson'
    ],
  },
  {
    categoryId: 'housing',
    categoryName: 'Nhà cửa',
    keywords: [
      'tien nha', 'tien phong', 'tien dien', 'dien luc', 'evn',
      'tien nuoc', 'sawaco', 'cap nuoc', 'internet', 'fpt', 'viettel', 'vnpt',
      'chung cu', 'phi quan ly', 'gui xe thang', 've sinh'
    ],
  },
  {
    categoryId: 'health',
    categoryName: 'Sức khỏe',
    keywords: [
      'nha thuoc', 'pharmacity', 'long chau', 'longchau', 'an khang',
      'benh vien', 'phong kham', 'bac si', 'nha khoa', 'kham benh', 'xet nghiem', 'thuoc'
    ],
  },
];

const INCOME_RULES: CategoryRule[] = [
  {
    categoryId: 'salary',
    categoryName: 'Lương & Thưởng',
    keywords: ['luong', 'salary', 'thuong', 'bonus', 'tam ung', 'payroll', 'thu nhap'],
  },
  {
    categoryId: 'transfer',
    categoryName: 'Chuyển khoản đến',
    keywords: ['me chuyen', 'ba chuyen', 'tra no', 'hoan tien', 'gop tien', 'chia tien'],
  },
];

/**
 * Chuẩn hóa chuỗi tiếng Việt không dấu, chữ thường để so khớp từ khóa
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

/**
 * Phân loại danh mục tự động dựa trên nội dung giao dịch
 */
export function classifyCategoryFromContent(
  content: string,
  type: 'EXPENSE' | 'INCOME' = 'EXPENSE'
): { categoryId: string; categoryName: string } {
  const normalized = normalizeText(content);
  const rules = type === 'EXPENSE' ? EXPENSE_RULES : INCOME_RULES;

  for (const rule of rules) {
    for (const kw of rule.keywords) {
      if (normalized.includes(kw)) {
        return {
          categoryId: rule.categoryId,
          categoryName: rule.categoryName,
        };
      }
    }
  }

  return {
    categoryId: type === 'EXPENSE' ? 'other' : 'income_other',
    categoryName: type === 'EXPENSE' ? 'Chi tiêu khác' : 'Thu nhập khác',
  };
}
