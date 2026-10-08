/**
 * WALLET DEEPLINK & DETECTION MODULE
 * Tự động nhận diện mã QR của Ví Điện Tử (ZaloPay & MoMo),
 * thẩm định tên miền Whitelist an toàn và mở ứng dụng ví tương ứng.
 */

let LinkingModule: any = null;
function getLinking() {
  if (!LinkingModule) {
    try {
      // Lazy load to allow pure unit testing in Node/Jest without transpiling react-native
      LinkingModule = require('react-native').Linking;
    } catch {
      LinkingModule = {
        canOpenURL: async () => false,
        openURL: async () => {},
      };
    }
  }
  return LinkingModule;
}

export type EWalletType = 'ZALOPAY' | 'MOMO';

export interface EWalletDetectionResult {
  isEWallet: boolean;
  walletType?: EWalletType;
  walletName?: string;
  brandColor?: string;
  targetUrl?: string;
  detectedAmount?: number;
  payeeName?: string;
  rawString?: string;
}

export const EWALLET_CONFIGS: Record<
  EWalletType,
  {
    name: string;
    brandColor: string;
    nativeScheme: string;
    trustedDomains: string[];
  }
> = {
  ZALOPAY: {
    name: 'ZaloPay',
    brandColor: '#0068FF',
    nativeScheme: 'zalopay://',
    trustedDomains: [
      'qr.zalopay.vn',
      'social.zalopay.vn',
      'gateway.zalopay.vn',
      'zalopay.vn',
    ],
  },
  MOMO: {
    name: 'MoMo',
    brandColor: '#A50064',
    nativeScheme: 'momo://',
    trustedDomains: [
      'nhantien.momo.vn',
      'momo.vn',
      'app.momo.vn',
      'me.momo.vn',
    ],
  },
};

/**
 * Kiểm tra xem hostname có thuộc danh sách tên miền tin cậy không (hỗ trợ cả subdomain).
 */
export function isTrustedDomain(hostname: string, trustedList: string[]): boolean {
  const cleanHost = hostname.toLowerCase().trim();
  return trustedList.some(
    (trusted) => cleanHost === trusted || cleanHost.endsWith(`.${trusted}`)
  );
}

/**
 * Trích xuất tham số amount nếu có sẵn trong URL query
 */
function extractAmountFromUrl(parsedUrl: URL): number | undefined {
  const possibleKeys = ['amount', 'am', 'money', 'value'];
  for (const key of possibleKeys) {
    const val = parsedUrl.searchParams.get(key);
    if (val) {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num > 0) return num;
    }
  }
  return undefined;
}

/**
 * Trích xuất tên người nhận / ghi chú nếu có sẵn
 */
function extractPayeeFromUrl(parsedUrl: URL): string | undefined {
  const possibleKeys = ['name', 'payee', 'merchant', 'store', 'receiver', 'desc'];
  for (const key of possibleKeys) {
    const val = parsedUrl.searchParams.get(key);
    if (val && val.trim().length > 0) {
      return decodeURIComponent(val.trim());
    }
  }
  return undefined;
}

/**
 * Nhận diện chuỗi quét QR có phải là mã thanh toán của ZaloPay hoặc MoMo hay không.
 * Bảo vệ an toàn: Kiểm tra nghiêm ngặt Whitelist domain và scheme, triệt tiêu URL lạ/phishing.
 */
export function detectEWalletQR(raw: string): EWalletDetectionResult {
  if (!raw || typeof raw !== 'string') {
    return { isEWallet: false };
  }

  const trimmed = raw.trim();

  // 1. Kiểm tra Native Schemes
  if (trimmed.startsWith('zalopay://')) {
    return {
      isEWallet: true,
      walletType: 'ZALOPAY',
      walletName: 'ZaloPay',
      brandColor: EWALLET_CONFIGS.ZALOPAY.brandColor,
      targetUrl: trimmed,
      payeeName: 'Thanh toán ZaloPay',
      rawString: trimmed,
    };
  }

  if (trimmed.startsWith('momo://')) {
    return {
      isEWallet: true,
      walletType: 'MOMO',
      walletName: 'MoMo',
      brandColor: EWALLET_CONFIGS.MOMO.brandColor,
      targetUrl: trimmed,
      payeeName: 'Thanh toán MoMo',
      rawString: trimmed,
    };
  }

  // 2. Kiểm tra Web URLs (Universal Links)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      const hostname = parsed.hostname.toLowerCase();

      // Kiểm tra ZaloPay Whitelist
      if (isTrustedDomain(hostname, EWALLET_CONFIGS.ZALOPAY.trustedDomains)) {
        return {
          isEWallet: true,
          walletType: 'ZALOPAY',
          walletName: 'ZaloPay',
          brandColor: EWALLET_CONFIGS.ZALOPAY.brandColor,
          targetUrl: trimmed,
          detectedAmount: extractAmountFromUrl(parsed),
          payeeName: extractPayeeFromUrl(parsed) || 'Điểm Chấp Nhận ZaloPay',
          rawString: trimmed,
        };
      }

      // Kiểm tra MoMo Whitelist
      if (isTrustedDomain(hostname, EWALLET_CONFIGS.MOMO.trustedDomains)) {
        return {
          isEWallet: true,
          walletType: 'MOMO',
          walletName: 'MoMo',
          brandColor: EWALLET_CONFIGS.MOMO.brandColor,
          targetUrl: trimmed,
          detectedAmount: extractAmountFromUrl(parsed),
          payeeName: extractPayeeFromUrl(parsed) || 'Điểm Chấp Nhận MoMo',
          rawString: trimmed,
        };
      }
    } catch {
      // URL không hợp lệ
      return { isEWallet: false };
    }
  }

  return { isEWallet: false };
}

/**
 * Mở ứng dụng Ví Điện Tử với URL đã kiểm duyệt an toàn.
 * Ưu tiên mở Universal Link gốc, nếu không mở được thì fallback sang Native Scheme.
 */
export async function openEWalletApp(
  walletType: EWalletType,
  targetUrl: string
): Promise<{ success: boolean; error?: string }> {
  const linking = getLinking();
  const config = EWALLET_CONFIGS[walletType];

  try {
    // 1. Thử mở target URL đã qua Whitelist
    if (targetUrl) {
      const canOpen = await linking.canOpenURL(targetUrl);
      if (canOpen) {
        await linking.openURL(targetUrl);
        return { success: true };
      }
    }

    // 2. Fallback sang native scheme nếu có
    if (config?.nativeScheme) {
      const canOpenScheme = await linking.canOpenURL(config.nativeScheme);
      if (canOpenScheme) {
        await linking.openURL(config.nativeScheme);
        return { success: true };
      }
    }

    // 3. Nếu canOpenURL trả về false trong Expo Go hoặc môi trường giả lập, vẫn thử openURL
    if (targetUrl) {
      await linking.openURL(targetUrl);
      return { success: true };
    }

    return {
      success: false,
      error: `Chưa cài đặt ứng dụng ${config?.name || 'Ví'}. Vui lòng mở thủ công nhé.`,
    };
  } catch (err: any) {
    // Thử lần cuối bằng native scheme
    try {
      if (config?.nativeScheme) {
        await linking.openURL(config.nativeScheme);
        return { success: true };
      }
    } catch {}

    return {
      success: false,
      error: `Không thể mở ứng dụng ${config?.name || 'Ví'}. Bạn mở thủ công nhé.`,
    };
  }
}
