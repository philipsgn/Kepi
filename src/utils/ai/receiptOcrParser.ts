/**
 * AI-First Receipt OCR Parser for Vietnamese Retail Invoices
 * Bóc tách và cấu trúc hóa dữ liệu hóa đơn bán lẻ Việt Nam từ chuỗi OCR
 */

import { ReceiptItem, ReceiptData } from '../../types/database';

export interface ParsedReceiptResult extends ReceiptData {
  merchantName: string | null;
  items: ReceiptItem[];
  totalAmount: number;
  vatAmount?: number;
  suggestedCategory: string;
  detectedAmounts: number[];
  confidenceScore: number;
  rawOcrText: string;
}

/**
 * Trích xuất các số tiền tiềm năng từ một dòng văn bản
 * Hỗ trợ các định dạng: 45.000, 45,000, 45000, 1.250.000, 1,250,000
 */
export function extractAmountsFromLine(line: string): number[] {
  if (!line) return [];
  // Tìm các chuỗi số có dấu chấm/phẩy phân cách hàng nghìn hoặc số trần >= 1000
  const matches = line.match(/(?:\d{1,3}(?:[.,]\d{3})+|\b\d{4,9}\b)/g);
  if (!matches) return [];

  const results: number[] = [];
  for (const m of matches) {
    const clean = m.replace(/[.,]/g, '');
    const num = parseInt(clean, 10);
    // Bỏ qua các số quá nhỏ hoặc trông giống năm (2024, 2025, 2026) nếu đứng một mình
    if (!isNaN(num) && num >= 1_000 && num <= 500_000_000) {
      if (num !== 2024 && num !== 2025 && num !== 2026 && num !== 2027) {
        results.push(num);
      }
    }
  }
  return results;
}

/**
 * Trích xuất tên đơn vị bán lẻ từ phần đầu hóa đơn
 */
export function extractMerchantName(lines: string[]): string | null {
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Bỏ qua dòng chỉ chứa ngày tháng, số điện thoại, hoặc ký tự phân cách
    if (line.match(/^(?:ngày|date|tel|sđt|phone|mst|hóa đơn|phiếu|bill|---|=+)/i)) {
      continue;
    }
    // Nếu dòng có độ dài hợp lý và không phải thuần số
    if (line.length >= 3 && line.length <= 50 && !line.match(/^\d+$/)) {
      return line;
    }
  }
  return null;
}

/**
 * Suy đoán danh mục chi tiêu từ danh sách món hoặc tên đơn vị
 */
export function inferCategoryFromReceipt(merchant: string | null, items: ReceiptItem[]): string {
  const combined = `${merchant || ''} ${items.map((i) => i.name).join(' ')}`.toLowerCase();

  if (
    combined.match(
      /(?:cà phê|cafe|phở|bún|cơm|bánh|trà sữa|lẩu|gà|nướng|pizza|sushi|nhà hàng|quán ăn|highlands|phúc long|starbucks)/
    )
  ) {
    return 'Ăn uống';
  }

  if (
    combined.match(
      /(?:siêu thị|mart|coop|winmart|circle k|bách hóa|tiện lợi|family mart|ministop)/
    )
  ) {
    return 'Chợ / Siêu thị';
  }

  if (
    combined.match(
      /(?:quần áo|thời trang|giày|dép|áo|túi|zara|uniqlo|h&m|shopee|boutique)/
    )
  ) {
    return 'Mua sắm';
  }

  if (combined.match(/(?:xăng|petrolimex|grab|be|gửi xe|vé)/)) {
    return 'Đi lại';
  }

  if (combined.match(/(?:nhà sách|fahasa|tiền trọ|điện nước|thuốc|pharmacity|long châu)/)) {
    if (combined.match(/(?:thuốc|pharmacity|long châu)/)) return 'Y tế';
    if (combined.match(/(?:nhà sách|fahasa)/)) return 'Học tập';
    return 'Nhà cửa';
  }

  return 'Ăn uống'; // Default phổ biến nhất cho retail receipts
}

/**
 * Parse chuỗi OCR thô thành bản ghi cấu trúc
 */
export function parseReceiptOcrText(rawText: string): ParsedReceiptResult {
  if (!rawText || typeof rawText !== 'string') {
    return {
      merchantName: null,
      items: [],
      totalAmount: 0,
      suggestedCategory: 'Ăn uống',
      detectedAmounts: [],
      confidenceScore: 0,
      rawOcrText: '',
    };
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const merchantName = extractMerchantName(lines);
  const items: ReceiptItem[] = [];
  const allDetectedAmounts: number[] = [];

  let totalAmount = 0;
  let vatAmount = 0;

  // Regex nhận diện các dòng chốt thanh toán
  const totalKeywordsRegex = /(?:tổng cộng|thanh toán|tong cong|thanh toan|total|tiền mặt|tong tien|tổng tiền)\s*[:=]?\s*(.*)/i;
  const vatKeywordsRegex = /(?:vat|thuế|thue)\s*[:=]?\s*(.*)/i;

  for (const line of lines) {
    const amountsInLine = extractAmountsFromLine(line);
    allDetectedAmounts.push(...amountsInLine);

    // Kiểm tra dòng tổng tiền
    const totalMatch = line.match(totalKeywordsRegex);
    if (totalMatch) {
      const candidates = extractAmountsFromLine(totalMatch[1] || line);
      if (candidates.length > 0) {
        totalAmount = candidates[candidates.length - 1]; // Lấy số cuối dòng
      }
    }

    // Kiểm tra dòng thuế VAT
    const vatMatch = line.match(vatKeywordsRegex);
    if (vatMatch) {
      const candidates = extractAmountsFromLine(vatMatch[1] || line);
      if (candidates.length > 0) {
        vatAmount = candidates[0];
      }
    }

    // Nhận diện dòng mặt hàng (có tên chữ và số tiền ở cuối dòng)
    if (!totalMatch && !vatMatch && amountsInLine.length > 0) {
      const price = amountsInLine[amountsInLine.length - 1];
      const itemName = line.replace(/(?:\d{1,3}(?:[.,]\d{3})+|\b\d{4,9}\b).*/, '').trim();
      if (itemName.length >= 2 && price > 0 && price !== totalAmount) {
        items.push({ name: itemName, price });
      }
    }
  }

  // Nếu chưa bắt được dòng total từ keyword, lấy số lớn nhất trong các số tìm thấy
  if (totalAmount === 0 && allDetectedAmounts.length > 0) {
    totalAmount = Math.max(...allDetectedAmounts);
  }

  // Danh sách top ứng viên số tiền cho Carousel Fallback (loại trùng lặp, sắp xếp giảm dần)
  const uniqueAmounts = Array.from(new Set(allDetectedAmounts)).sort((a, b) => b - a);
  const detectedAmounts = uniqueAmounts.slice(0, 5);

  const suggestedCategory = inferCategoryFromReceipt(merchantName, items);

  // Tính điểm tin cậy
  let confidenceScore = 0.4;
  if (merchantName) confidenceScore += 0.2;
  if (totalAmount > 0) confidenceScore += 0.2;
  if (items.length > 0) confidenceScore += 0.2;

  return {
    merchantName,
    items,
    totalAmount,
    vatAmount: vatAmount > 0 ? vatAmount : undefined,
    suggestedCategory,
    detectedAmounts,
    confidenceScore: Math.min(1.0, confidenceScore),
    rawOcrText: rawText,
  };
}
