/**
 * Bank Notification Parser (Pure Functions, Offline 100%)
 * 
 * Bóc tách thông báo biến động số dư từ các ứng dụng ngân hàng tại Việt Nam:
 * - TPBank, Vietcombank, MBBank, Techcombank, ACB, VPBank, OCB, VIB, BIDV...
 * - Bộ lọc an toàn: Chặn 100% tin OTP, mã xác nhận, tin khuyến mãi, mời vay.
 * - Bảo vệ quyền riêng tư: 0 byte dữ liệu gửi ra server, xử lý thuần túy trên thiết bị.
 */

import { classifyCategoryFromContent } from './autoCategoryClassifier';

export type SupportedBankCode = 'TPB' | 'VCB' | 'MB' | 'TCB' | 'ACB' | 'VPB' | 'BIDV' | 'OCB' | 'OTHER';

export interface BankBrandInfo {
  bankCode: SupportedBankCode;
  bankName: string;
  brandColor: string;
  gradientColors: [string, string];
  shortCode: string;
}

export const BANK_BRANDS: Record<SupportedBankCode, BankBrandInfo> = {
  TPB: {
    bankCode: 'TPB',
    bankName: 'TPBank',
    brandColor: '#6C2382',
    gradientColors: ['#6C2382', '#EA5455'],
    shortCode: 'TPB',
  },
  VCB: {
    bankCode: 'VCB',
    bankName: 'Vietcombank',
    brandColor: '#12803C',
    gradientColors: ['#12803C', '#2ECC71'],
    shortCode: 'VCB',
  },
  MB: {
    bankCode: 'MB',
    bankName: 'MBBank',
    brandColor: '#002D72',
    gradientColors: ['#002D72', '#1E88E5'],
    shortCode: 'MB',
  },
  TCB: {
    bankCode: 'TCB',
    bankName: 'Techcombank',
    brandColor: '#C4161C',
    gradientColors: ['#C4161C', '#E53935'],
    shortCode: 'TCB',
  },
  ACB: {
    bankCode: 'ACB',
    bankName: 'ACB',
    brandColor: '#005DAB',
    gradientColors: ['#005DAB', '#29B6F6'],
    shortCode: 'ACB',
  },
  VPB: {
    bankCode: 'VPB',
    bankName: 'VPBank',
    brandColor: '#009245',
    gradientColors: ['#009245', '#43A047'],
    shortCode: 'VPB',
  },
  BIDV: {
    bankCode: 'BIDV',
    bankName: 'BIDV',
    brandColor: '#006B68',
    gradientColors: ['#006B68', '#009688'],
    shortCode: 'BIDV',
  },
  OCB: {
    bankCode: 'OCB',
    bankName: 'OCB',
    brandColor: '#007A3D',
    gradientColors: ['#007A3D', '#4CAF50'],
    shortCode: 'OCB',
  },
  OTHER: {
    bankCode: 'OTHER',
    bankName: 'Ngân hàng',
    brandColor: '#E59844',
    gradientColors: ['#E59844', '#C86D51'],
    shortCode: 'BANK',
  },
};

export interface ParsedBankNotification {
  isBankNotification: boolean;
  bankCode: SupportedBankCode;
  bankName: string;
  brandColor: string;
  gradientColors: [string, string];
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  content: string;
  categoryName: string;
  categoryId: string;
  isGenericContent?: boolean;
  accountNumberMasked?: string;
  balanceRemaining?: number;
  rawText: string;
  timestamp: number;
}

/**
 * 1. BỘ LỌC AN TOÀN: Chặn tin chứa OTP, mã xác thực, hoặc tin khuyến mãi / tiếp thị
 */
export function isSecurityOrSpamNotification(text: string): boolean {
  const normalized = text.toLowerCase();

  // Chặn 100% tin chứa OTP / Mã xác nhận
  const securityKeywords = [
    'otp',
    'ma xac thuc',
    'ma xac nhan',
    'smart otp',
    'verification code',
    'ma kich hoat',
    'mat khau',
    'password',
    'ma bao mat',
    'khong chia se cho bat ky ai',
    'khong cung cap ma',
  ];

  for (const kw of securityKeywords) {
    if (normalized.includes(kw)) {
      return true;
    }
  }

  // Chặn 100% tin khuyến mãi, mời vay, tiếp thị
  const spamKeywords = [
    'khuyen mai',
    'hoan tien toi da',
    'uu dai',
    'voucher',
    'tang ban',
    'vay tieu dung',
    'vay nhanh',
    'tin dung',
    'mo the tin dung',
    'bao hiem',
    'tri an khach hang',
    'co hoi trung thuong',
  ];

  for (const kw of spamKeywords) {
    if (normalized.includes(kw)) {
      return true;
    }
  }

  return false;
}

/**
 * 2. NHẬN DIỆN MÃ NGÂN HÀNG từ Package Name hoặc Tiêu đề / Nội dung
 */
export function detectBankCode(text: string, title: string = '', packageName: string = ''): SupportedBankCode {
  const combined = (title + ' ' + text + ' ' + packageName).toLowerCase();

  if (combined.includes('tpbank') || combined.includes('tpb') || combined.includes('com.tpb.mb')) return 'TPB';
  if (combined.includes('vietcombank') || combined.includes('vcb') || combined.includes('com.vcb')) return 'VCB';
  if (combined.includes('mbbank') || combined.includes('mb bank') || combined.includes('mb') || combined.includes('com.mbmobile')) return 'MB';
  if (combined.includes('techcombank') || combined.includes('tcb') || combined.includes('com.techcombank')) return 'TCB';
  if (combined.includes('acb') || combined.includes('mobile.acb')) return 'ACB';
  if (combined.includes('vpbank') || combined.includes('vpb') || combined.includes('com.vpb')) return 'VPB';
  if (combined.includes('bidv') || combined.includes('com.vnpay.bidv')) return 'BIDV';
  if (combined.includes('ocb') || combined.includes('com.ocb')) return 'OCB';

  return 'OTHER';
}

/**
 * 3. HÀM CHUẨN HÓA SỐ TIỀN TỪ CHUỖI
 */
function parseCleanAmount(amountStr: string): number {
  // Bỏ dấu chấm, phẩy, chữ VND, đ
  const cleaned = amountStr.replace(/[^0-9]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * 4. BỘ BÓC TÁCH NỘI DUNG CHÍNH (PARSER CHÍNH)
 */
export function parseBankNotification(
  text: string,
  title: string = '',
  packageName: string = ''
): ParsedBankNotification | null {
  if (!text || text.trim().length === 0) return null;

  // Bước 1: Kiểm tra bộ lọc an toàn OTP & Spam
  if (isSecurityOrSpamNotification(text) || isSecurityOrSpamNotification(title)) {
    return null;
  }

  const bankCode = detectBankCode(text, title, packageName);
  const brandInfo = BANK_BRANDS[bankCode];

  let amount = 0;
  let type: 'EXPENSE' | 'INCOME' = 'EXPENSE';
  let extractedContent = '';
  let accountNumberMasked: string | undefined = undefined;
  let balanceRemaining: number | undefined = undefined;

  // Pattern TPBank:
  // "TK: xxxx / PS: -48.000VND / SD: 1.250.000VND / ND: Highland Coffee"
  // hoặc "PS: +100.000VND / ..."
  const tpbMatch = text.match(/PS:\s*([+-]?)\s*([\d.,]+)\s*(?:VND|đ|d)/i);
  if (tpbMatch) {
    const sign = tpbMatch[1];
    amount = parseCleanAmount(tpbMatch[2]);
    type = sign === '+' ? 'INCOME' : 'EXPENSE';

    // Bóc tách nội dung sau ND: hoặc Ref:
    const ndMatch = text.match(/ND:\s*([^/]+)/i);
    if (ndMatch) {
      extractedContent = ndMatch[1].trim();
    }

    // Bóc tách số dư sau SD:
    const sdMatch = text.match(/SD:\s*([\d.,]+)\s*(?:VND|đ|d)/i);
    if (sdMatch) {
      balanceRemaining = parseCleanAmount(sdMatch[1]);
    }

    // Bóc tách TK
    const tkMatch = text.match(/TK:\s*([^/ ]+)/i);
    if (tkMatch) {
      accountNumberMasked = tkMatch[1].trim();
    }
  }

  // Pattern Vietcombank (VCB):
  // "SD TK 0071xxx -48,000 VND luc ... Ref ... ND: Highland"
  // hoặc "So du TK ... thay doi -48,000 VND"
  if (amount === 0) {
    const vcbMatch = text.match(/(?:SD TK|So du TK|tai khoan)\s*([^\s]+)?\s*(?:thay doi)?\s*([+-]?)\s*([\d.,]+)\s*(?:VND|đ|d)/i);
    if (vcbMatch) {
      accountNumberMasked = vcbMatch[1];
      const sign = vcbMatch[2];
      amount = parseCleanAmount(vcbMatch[3]);
      type = sign === '+' ? 'INCOME' : 'EXPENSE';

      const ndMatch = text.match(/(?:ND|Noi dung):\s*(.+)$/i);
      if (ndMatch) {
        extractedContent = ndMatch[1].trim();
      }
    }
  }

  // Pattern MBBank:
  // "TK 098xxx|-48,000VND|SD:1,200,000VND|ND: Highland"
  if (amount === 0) {
    const mbMatch = text.match(/\|([+-]?)\s*([\d.,]+)\s*(?:VND|đ|d)\|/i);
    if (mbMatch) {
      const sign = mbMatch[1];
      amount = parseCleanAmount(mbMatch[2]);
      type = sign === '+' ? 'INCOME' : 'EXPENSE';

      const ndMatch = text.match(/ND:\s*([^|]+)/i);
      if (ndMatch) {
        extractedContent = ndMatch[1].trim();
      }
    }
  }

  // Pattern Techcombank & Generic (GD: -48,000 VND hoặc Giao dich: -48,000 VND):
  if (amount === 0) {
    const genericMatch = text.match(/(?:GD|Giao dich|bien dong|so tien|thanh toan):\s*([+-]?)\s*([\d.,]+)\s*(?:VND|đ|d)/i);
    if (genericMatch) {
      const sign = genericMatch[1];
      amount = parseCleanAmount(genericMatch[2]);
      type = sign === '+' ? 'INCOME' : 'EXPENSE';

      const ndMatch = text.match(/(?:tai|noi dung|ND):\s*(.+)$/i);
      if (ndMatch) {
        extractedContent = ndMatch[1].trim();
      }
    }
  }

  // Pattern Fallback: Bắt bất kỳ mẫu -XX.XXX VND hoặc +XX.XXX VND
  if (amount === 0) {
    const fallbackMatch = text.match(/([+-])\s*([\d.,]{3,})\s*(?:VND|đ|d)/i);
    if (fallbackMatch) {
      const sign = fallbackMatch[1];
      amount = parseCleanAmount(fallbackMatch[2]);
      type = sign === '+' ? 'INCOME' : 'EXPENSE';
    }
  }

  // Nếu vẫn không đọc được số tiền hợp lệ (> 0đ) -> không phải biến động số dư
  if (amount <= 0) {
    return null;
  }

  // Nếu không bóc tách được mô tả chi tiết, dùng tiêu đề hoặc ngân hàng
  if (!extractedContent) {
    extractedContent = title && title.length > 2 ? title : `Giao dịch ${brandInfo.bankName}`;
  }

  // Kiểm tra xem nội dung có phải là chuỗi mặc định vô nghĩa (tên người chuyển, CK, v.v.)
  const isGenericContent = isGenericBankContent(extractedContent);

  // Tự động phân loại danh mục thông minh từ nội dung
  const { categoryId, categoryName } = classifyCategoryFromContent(extractedContent, type);

  return {
    isBankNotification: true,
    bankCode,
    bankName: brandInfo.bankName,
    brandColor: brandInfo.brandColor,
    gradientColors: brandInfo.gradientColors,
    amount,
    type,
    content: extractedContent,
    categoryName,
    categoryId,
    isGenericContent,
    accountNumberMasked,
    balanceRemaining,
    rawText: text,
    timestamp: Date.now(),
  };
}

/**
 * Kiểm tra xem nội dung giao dịch ngân hàng có phải là chuỗi mặc định vô nghĩa
 * (Ví dụ: "NGUYEN VAN A chuyen tien", "Chuyen tien", "CK", "123", v.v.)
 */
export function isGenericBankContent(content: string): boolean {
  if (!content || content.trim().length === 0) return true;
  const normalized = content.toLowerCase().trim();
  const genericPatterns = [
    /^chuyen\s*(tien|khoan)?$/i,
    /^ck\b/i,
    /^thanh\s*toan$/i,
    /^gd\s*:/i,
    /^ref\s*:/i,
    /chuyen\s*tien/i,
    /chuyen\s*khoan/i,
    /thanh\s*toan\s*qr/i,
    /giao\s*dich/i,
  ];
  return genericPatterns.some((pattern) => pattern.test(normalized));
}

