/**
 * On-Device Computer Vision Classifier Helper
 * Phân loại đối tượng hình ảnh và tự động gắn thẻ danh mục ngoại tuyến
 */

export interface VisionClassificationResult {
  label: string;
  category: string;
  emoji: string;
  confidence: number;
}

const VISION_CATEGORY_MAP: Record<string, { category: string; emoji: string }> = {
  food: { category: 'Ăn uống', emoji: '🍜' },
  beverage: { category: 'Ăn uống', emoji: '☕' },
  coffee: { category: 'Ăn uống', emoji: '☕' },
  dish: { category: 'Ăn uống', emoji: '🍛' },
  noodle: { category: 'Ăn uống', emoji: '🍜' },
  clothing: { category: 'Mua sắm', emoji: '👕' },
  shoes: { category: 'Mua sắm', emoji: '👟' },
  bag: { category: 'Mua sắm', emoji: '👜' },
  vehicle: { category: 'Đi lại', emoji: '🚗' },
  gas_station: { category: 'Đi lại', emoji: '⛽' },
  grocery: { category: 'Chợ / Siêu thị', emoji: '🛒' },
  book: { category: 'Học tập', emoji: '📚' },
  receipt: { category: 'Hóa đơn', emoji: '🧾' },
};

/**
 * Phân loại nhãn thành danh mục chi tiêu chuẩn
 */
export function mapVisionLabelToCategory(label: string): { category: string; emoji: string } {
  const cleanLabel = (label || '').toLowerCase().trim();

  for (const [key, val] of Object.entries(VISION_CATEGORY_MAP)) {
    if (cleanLabel.includes(key)) {
      return val;
    }
  }

  return { category: 'Ăn uống', emoji: '🍜' }; // Default fallback phổ biến
}

/**
 * Hàm phân loại đối tượng từ hình ảnh (mô phỏng On-Device inference)
 */
export async function classifyImageCategory(imageUri: string): Promise<VisionClassificationResult> {
  if (!imageUri) {
    return {
      label: 'unknown',
      category: 'Ăn uống',
      emoji: '🍜',
      confidence: 0.5,
    };
  }

  const lower = imageUri.toLowerCase();

  let detectedLabel = 'food';
  if (lower.includes('receipt') || lower.includes('bill') || lower.includes('hoadon')) {
    detectedLabel = 'receipt';
  } else if (lower.includes('coffee') || lower.includes('cafe') || lower.includes('tea')) {
    detectedLabel = 'coffee';
  } else if (lower.includes('cloth') || lower.includes('shoe') || lower.includes('ao') || lower.includes('quan')) {
    detectedLabel = 'clothing';
  } else if (lower.includes('gas') || lower.includes('xang') || lower.includes('grab')) {
    detectedLabel = 'gas_station';
  }

  const mapped = mapVisionLabelToCategory(detectedLabel);

  return {
    label: detectedLabel,
    category: mapped.category,
    emoji: mapped.emoji,
    confidence: 0.88,
  };
}
