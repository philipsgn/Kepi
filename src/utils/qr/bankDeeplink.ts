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

export type BankHandoffTier = 1 | 2 | 3;

export interface BankAppMeta {
  appId: string;           // VietQR app code: 'tcb', 'mb', 'vcb', 'icb', 'bidv', 'vpb', 'acb', 'tpb'
  bin: string;             // 6-digit Bank BIN
  name: string;            // 'Techcombank Mobile', 'MB Bank', etc.
  shortName: string;       // 'Techcombank', 'MBBank', etc.
  nativeScheme: string;    // 'tcb://', 'mb://', 'vcb://'
  vietqrAutofillFlag: boolean; // Flag from VietQR API
  tier: BankHandoffTier;   // 1 = Verified autofill, 2 = Photos QR / Native open, 3 = Self pay
  verifiedAutofill: boolean; // Requires real-device verification before enabling Tier 1
  autofillSupported: boolean; // Backward compatibility
}

export const DEFAULT_NO_AUTOFILL_BANKS = ['tcb', 'vcb'];

export const SUPPORTED_BANKS: Record<string, BankAppMeta> = {
  // 5 Ngân hàng hỗ trợ Autofill chính thức theo chuẩn VietQR & Casso
  mb: {
    appId: 'mb',
    bin: '970422',
    name: 'MB Bank',
    shortName: 'MBBank',
    nativeScheme: 'mb://',
    vietqrAutofillFlag: true,
    tier: 1,
    verifiedAutofill: true,
    autofillSupported: true,
  },
  icb: {
    appId: 'icb',
    bin: '970415',
    name: 'VietinBank iPay',
    shortName: 'VietinBank',
    nativeScheme: 'vietinbankpay://',
    vietqrAutofillFlag: true,
    tier: 1,
    verifiedAutofill: true,
    autofillSupported: true,
  },
  bidv: {
    appId: 'bidv',
    bin: '970418',
    name: 'BIDV SmartBanking',
    shortName: 'BIDV',
    nativeScheme: 'bidvsmartbanking://',
    vietqrAutofillFlag: true,
    tier: 1,
    verifiedAutofill: true,
    autofillSupported: true,
  },
  acb: {
    appId: 'acb',
    bin: '970416',
    name: 'ACB ONE',
    shortName: 'ACB',
    nativeScheme: 'acbone://',
    vietqrAutofillFlag: true,
    tier: 1,
    verifiedAutofill: true,
    autofillSupported: true,
  },
  ocb: {
    appId: 'ocb',
    bin: '970448',
    name: 'OCB OMNI',
    shortName: 'OCB',
    nativeScheme: 'ocb://',
    vietqrAutofillFlag: true,
    tier: 1,
    verifiedAutofill: true,
    autofillSupported: true,
  },

  // 2 Ngân hàng phổ biến đã ghi nhận noAutofill mặc định
  tcb: {
    appId: 'tcb',
    bin: '970407',
    name: 'Techcombank Mobile',
    shortName: 'Techcombank',
    nativeScheme: 'tcb://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  vcb: {
    appId: 'vcb',
    bin: '970436',
    name: 'VCB Digibank',
    shortName: 'Vietcombank',
    nativeScheme: 'vcb://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },

  // Các ngân hàng còn lại trong hệ sinh thái 37 ngân hàng VietQR
  vpb: {
    appId: 'vpb',
    bin: '970432',
    name: 'VPBank NEO',
    shortName: 'VPBank',
    nativeScheme: 'vpbankneo://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  tpb: {
    appId: 'tpb',
    bin: '970423',
    name: 'TPBank Mobile',
    shortName: 'TPBank',
    nativeScheme: 'tpb://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  'vib-2': {
    appId: 'vib-2',
    bin: '970441',
    name: 'MyVIB 2.0',
    shortName: 'VIB 2.0',
    nativeScheme: 'vib://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  shb: {
    appId: 'shb',
    bin: '970443',
    name: 'SHB SAHA',
    shortName: 'SHB',
    nativeScheme: 'shb://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  lpb: {
    appId: 'lpb',
    bin: '970449',
    name: 'LPBank (Liên Việt 24h)',
    shortName: 'LPBank',
    nativeScheme: 'lienviet24h://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  seab: {
    appId: 'seab',
    bin: '970468',
    name: 'SeAMobile',
    shortName: 'SeABank',
    nativeScheme: 'seabank://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  scb: {
    appId: 'scb',
    bin: '970429',
    name: 'SCB Mobile Banking',
    shortName: 'SCB',
    nativeScheme: 'scb://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  vietbank: {
    appId: 'vietbank',
    bin: '970433',
    name: 'Vietbank Digital',
    shortName: 'Vietbank',
    nativeScheme: 'vietbank://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  cake: {
    appId: 'cake',
    bin: '546034',
    name: 'CAKE by VPBank',
    shortName: 'CAKE',
    nativeScheme: 'cake://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  hdb: {
    appId: 'hdb',
    bin: '970437',
    name: 'HDBank Mobile',
    shortName: 'HDBank',
    nativeScheme: 'hdbank://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  vba: {
    appId: 'vba',
    bin: '970405',
    name: 'Agribank E-Mobile',
    shortName: 'Agribank',
    nativeScheme: 'agribank://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  timo: {
    appId: 'timo',
    bin: '963388',
    name: 'Timo Digital Bank',
    shortName: 'Timo',
    nativeScheme: 'timo://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  vib: {
    appId: 'vib',
    bin: '970441',
    name: 'MyVIB',
    shortName: 'VIB',
    nativeScheme: 'vib://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  shbvn: {
    appId: 'shbvn',
    bin: '970424',
    name: 'Shinhan SOL Vietnam',
    shortName: 'Shinhan',
    nativeScheme: 'shinhan://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  abb: {
    appId: 'abb',
    bin: '970425',
    name: 'ABBank Ditizen',
    shortName: 'ABBank',
    nativeScheme: 'abbank://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  eib: {
    appId: 'eib',
    bin: '970431',
    name: 'Eximbank EDigi',
    shortName: 'Eximbank',
    nativeScheme: 'eximbank://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  pvcb: {
    appId: 'pvcb',
    bin: '970412',
    name: 'PVConnect',
    shortName: 'PVcomBank',
    nativeScheme: 'pvcb://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  vab: {
    appId: 'vab',
    bin: '970427',
    name: 'VietABank EzMobile',
    shortName: 'VietABank',
    nativeScheme: 'vietabank://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  coopbank: {
    appId: 'coopbank',
    bin: '970446',
    name: 'Co-opBank Mobile',
    shortName: 'Co-opBank',
    nativeScheme: 'coopbank://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  pbvn: {
    appId: 'pbvn',
    bin: '970439',
    name: 'PB engage VN',
    shortName: 'PublicBank',
    nativeScheme: 'publicbank://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  klb: {
    appId: 'klb',
    bin: '970452',
    name: 'KienlongBank Plus',
    shortName: 'KienlongBank',
    nativeScheme: 'kienlongbank://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  'acb-biz': {
    appId: 'acb-biz',
    bin: '970416',
    name: 'ACB One Biz',
    shortName: 'ACB Biz',
    nativeScheme: 'acbbiz://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  bvb: {
    appId: 'bvb',
    bin: '970438',
    name: 'BAOVIET Smart',
    shortName: 'BaoVietBank',
    nativeScheme: 'baoviet://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  sgicb: {
    appId: 'sgicb',
    bin: '970400',
    name: 'SAIGONBANK Smart',
    shortName: 'SaigonBank',
    nativeScheme: 'saigonbank://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  oceanbank: {
    appId: 'oceanbank',
    bin: '970414',
    name: 'OceanBank Mobile',
    shortName: 'OceanBank',
    nativeScheme: 'oceanbank://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  ncb: {
    appId: 'ncb',
    bin: '970419',
    name: 'NCB iziMobile',
    shortName: 'NCB',
    nativeScheme: 'ncb://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  cimb: {
    appId: 'cimb',
    bin: '422589',
    name: 'OCTO by CIMB',
    shortName: 'CIMB',
    nativeScheme: 'cimb://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  'tpb-pay': {
    appId: 'tpb-pay',
    bin: '970423',
    name: 'TPBank QuickPay',
    shortName: 'TPB QuickPay',
    nativeScheme: 'tpbquickpay://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  nab: {
    appId: 'nab',
    bin: '970428',
    name: 'Nam A Open Banking',
    shortName: 'NamABank',
    nativeScheme: 'namabank://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
  wvn: {
    appId: 'wvn',
    bin: '970457',
    name: 'Woori WON Vietnam',
    shortName: 'WooriBank',
    nativeScheme: 'wooribank://',
    vietqrAutofillFlag: false,
    tier: 2,
    verifiedAutofill: false,
    autofillSupported: false,
  },
};

/**
 * Finds bank meta by Bank BIN (e.g. '970407' -> Techcombank)
 */
export function getBankByBin(bin: string): BankAppMeta | undefined {
  return Object.values(SUPPORTED_BANKS).find((b) => b.bin === bin);
}

/**
 * Finds bank meta by appId (e.g. 'tcb')
 */
export function getBankByAppId(appId: string): BankAppMeta | undefined {
  return SUPPORTED_BANKS[appId.toLowerCase()];
}

/**
 * Checks if a bank app supports 1-tap autofill
 */
export function isBankAutofillSupported(bankAppId: string): boolean {
  const meta = SUPPORTED_BANKS[bankAppId.toLowerCase()];
  return !!(meta && meta.vietqrAutofillFlag && meta.tier === 1);
}

export interface BuildDeeplinkParams {
  appId: string;
  accountRef: string;
  bankBin: string;
  amount?: number;
  note?: string;
  payeeName?: string;
  returnUrl?: string;
}

/**
 * Constructs the official VietQR universal pay deeplink:
 * https://dl.vietqr.io/pay?app=<APP_ID>&ba=<ACCOUNT>@<BANK_BIN>&am=<AMOUNT>&tn=<NOTE>&bn=<BENEFICIARY>&url=<RETURN_URL>
 */
export function buildVietQRUniversalUrl(params: BuildDeeplinkParams): string {
  const {
    appId,
    accountRef,
    bankBin,
    amount,
    note,
    payeeName,
    returnUrl = 'vilocket://qr-callback',
  } = params;

  const queryParts: string[] = [
    `app=${encodeURIComponent(appId)}`,
    `ba=${encodeURIComponent(`${accountRef}@${bankBin}`)}`,
  ];

  if (amount && amount > 0) {
    queryParts.push(`am=${encodeURIComponent(amount.toString())}`);
  }

  if (note && note.trim().length > 0) {
    queryParts.push(`tn=${encodeURIComponent(note.trim())}`);
  }

  if (payeeName && payeeName.trim().length > 0) {
    queryParts.push(`bn=${encodeURIComponent(payeeName.trim())}`);
  }

  queryParts.push(`url=${encodeURIComponent(returnUrl)}`);

  return `https://dl.vietqr.io/pay?${queryParts.join('&')}`;
}

/**
 * Constructs minimal VietQR deeplink: Zero sensitive data transmission (No account, No amount)
 * https://dl.vietqr.io/pay?app=<APP_ID>&url=<RETURN_URL>
 */
export function buildVietQRMinimalUrl(params: { appId: string; returnUrl?: string }): string {
  const { appId, returnUrl = 'vilocket://qr-callback' } = params;
  return `https://dl.vietqr.io/pay?app=${encodeURIComponent(appId)}&url=${encodeURIComponent(returnUrl)}`;
}

/**
 * Checks if a native scheme can be opened
 */
export async function canOpenScheme(scheme: string): Promise<boolean> {
  try {
    return await getLinking().canOpenURL(scheme);
  } catch {
    return false;
  }
}

/**
 * Opens a deeplink URL with error handling
 */
export async function openDeeplink(url: string): Promise<{ success: boolean; error?: string }> {
  try {
    const linking = getLinking();
    await linking.openURL(url);
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: 'Không mở được app ngân hàng. Mở thủ công nhé.',
    };
  }
}

export interface OpenBankAppOptions {
  accountRef?: string;
  bankBin?: string;
  amount?: number;
  note?: string;
  payeeName?: string;
  pendingId?: string;
  isNoAutofill?: boolean;
  allowPrefill?: boolean;
}

/**
 * Opens bank app:
 * - If isNoAutofill is true or allowPrefill is false: Opens in minimal mode (no account / no amount transmitted)
 * - Otherwise: Opens full universal deeplink (app, ba, am, tn, bn, url) to try autofill
 */
export async function openBankAppByTier(
  bankMeta: BankAppMeta,
  params?: OpenBankAppOptions
): Promise<{ success: boolean; error?: string }> {
  const linking = getLinking();
  const returnUrl = params?.pendingId
    ? `vilocket://qr-callback?pendingId=${encodeURIComponent(params.pendingId)}`
    : 'vilocket://qr-callback';

  const shouldSendMinimal =
    params?.isNoAutofill ||
    params?.allowPrefill === false ||
    !params?.accountRef;

  // 1. Chế độ tối thiểu (Minimal Handoff): Bảo vệ quyền riêng tư, không gửi STK hay số tiền
  if (shouldSendMinimal) {
    try {
      if (bankMeta.nativeScheme) {
        const canOpen = await linking.canOpenURL(bankMeta.nativeScheme);
        if (canOpen) {
          await linking.openURL(bankMeta.nativeScheme);
          return { success: true };
        }
      }
    } catch {}

    const minimalUrl = buildVietQRMinimalUrl({ appId: bankMeta.appId, returnUrl });
    return openDeeplink(minimalUrl);
  }

  // 2. Chế độ thử điền sẵn (Full Deeplink Handoff)
  if (params && params.accountRef) {
    const fullUrl = buildVietQRUniversalUrl({
      appId: bankMeta.appId,
      accountRef: params.accountRef,
      bankBin: params.bankBin || bankMeta.bin,
      amount: params.amount,
      note: params.note,
      payeeName: params.payeeName,
      returnUrl,
    });
    return openDeeplink(fullUrl);
  }

  // 3. Fallback
  try {
    if (bankMeta.nativeScheme) {
      await linking.openURL(bankMeta.nativeScheme);
      return { success: true };
    }
  } catch {}

  const minimalUrl = buildVietQRMinimalUrl({ appId: bankMeta.appId, returnUrl });
  return openDeeplink(minimalUrl);
}

/**
 * Lấy mã viết tắt in hoa của ngân hàng từ BIN hoặc appId (VD: '970436' -> 'VCB', 'mb' -> 'MB')
 */
export function getBankShortCode(bankBin?: string, appId?: string): string {
  if (appId) {
    const lower = appId.toLowerCase();
    if (SUPPORTED_BANKS[lower]) {
      return lower.toUpperCase();
    }
  }
  if (bankBin) {
    for (const [code, meta] of Object.entries(SUPPORTED_BANKS)) {
      if (meta.bin === bankBin) {
        return code.toUpperCase();
      }
    }
  }
  return '';
}


