import {
  computeCrc16,
  stringToUtf8ByteArray,
  utf8ByteArrayToString,
  validateEMVCrc,
} from './crc16';

export type QRKind = 'STATIC' | 'DYNAMIC';

export interface VietQRPayload {
  kind: QRKind;
  bankBin: string;
  payeeName?: string;
  amount?: number;
  note?: string;
  city?: string;
  mcc?: string;
  suggestedCategory?: string;
  // accountRef is transient RAM only
  accountRef: string;
  raw: string;
}

export type QRParseErrorReason =
  | 'NOT_EMV_FORMAT'
  | 'CRC_MISMATCH'
  | 'NOT_VIETQR_NAPAS'
  | 'INVALID_CURRENCY'
  | 'INVALID_AMOUNT'
  | 'MISSING_REQUIRED_TAGS';

export type QRParseResult =
  | { success: true; data: VietQRPayload }
  | { success: false; reason: QRParseErrorReason; raw?: string };

export interface TLVTag {
  tag: string;
  length: number;
  value: string;
  subtags?: Record<string, TLVTag>;
}

/**
 * Maps MCC (Merchant Category Code) to standard Category
 */
export function getCategoryFromMcc(mcc?: string): string {
  if (!mcc) return 'khac';
  const mccNum = parseInt(mcc, 10);
  if (isNaN(mccNum)) return 'khac';

  // 5811 - 5814: Restaurants, Fast food, Coffee
  if (mccNum >= 5811 && mccNum <= 5814) {
    return 'an_uong';
  }
  // 5411, 5422, 5499: Supermarket, Grocery
  if (mccNum === 5411 || mccNum === 5422 || mccNum === 5499) {
    return 'an_uong';
  }
  // 5541 - 5542: Service stations/Fuel, 4121: Taxicabs/Rideshare
  if ((mccNum >= 5541 && mccNum <= 5542) || mccNum === 4121) {
    return 'di_chuyen';
  }
  // 5311: Department stores, 5651: Family clothing, 5999: Misc retail
  if (mccNum === 5311 || mccNum === 5651 || mccNum === 5999) {
    return 'mua_sam';
  }
  // 7832: Motion pictures, 7999: Recreation services
  if (mccNum === 7832 || mccNum === 7999) {
    return 'giai_tri';
  }
  // 8011 - 8099: Medical, 5912: Drug stores/Pharmacies
  if ((mccNum >= 8011 && mccNum <= 8099) || mccNum === 5912) {
    return 'suc_khoe';
  }
  // 4900: Utilities (electric, water, gas)
  if (mccNum === 4900) {
    return 'hoa_don';
  }

  return 'khac';
}

/**
 * Parses raw TLV bytes into structured map.
 * Ensures UTF-8 multibyte character safety.
 */
export function parseTLVMap(input: string): Record<string, TLVTag> {
  const bytes = stringToUtf8ByteArray(input);
  const result: Record<string, TLVTag> = {};
  let offset = 0;

  while (offset + 4 <= bytes.length) {
    // 2 bytes tag
    const tag = String.fromCharCode(bytes[offset], bytes[offset + 1]);
    // 2 bytes length
    const lenStr = String.fromCharCode(bytes[offset + 2], bytes[offset + 3]);
    const length = parseInt(lenStr, 10);

    if (isNaN(length) || length < 0) {
      break;
    }

    offset += 4;
    if (offset + length > bytes.length) {
      // Incomplete or truncated
      break;
    }

    const valueBytes = bytes.slice(offset, offset + length);
    const value = utf8ByteArrayToString(valueBytes);

    result[tag] = {
      tag,
      length,
      value,
    };

    offset += length;
  }

  return result;
}

/**
 * Main parser: Parses and validates VietQR EMVCo string.
 */
export function parseVietQR(rawQr: string): QRParseResult {
  if (!rawQr || typeof rawQr !== 'string') {
    return { success: false, reason: 'NOT_EMV_FORMAT' };
  }

  const trimmed = rawQr.trim();

  // Basic check for EMV format (must start with 000201)
  if (!trimmed.startsWith('000201')) {
    return { success: false, reason: 'NOT_EMV_FORMAT', raw: trimmed };
  }

  // Validate CRC-16
  if (!validateEMVCrc(trimmed)) {
    return { success: false, reason: 'CRC_MISMATCH', raw: trimmed };
  }

  const tlvMap = parseTLVMap(trimmed);

  // Check required tags: 00, 01, 38, 53, 58
  if (!tlvMap['00'] || !tlvMap['01'] || !tlvMap['38'] || !tlvMap['53'] || !tlvMap['58']) {
    return { success: false, reason: 'MISSING_REQUIRED_TAGS', raw: trimmed };
  }

  // Currency must be 704 (VND)
  if (tlvMap['53'].value !== '704') {
    return { success: false, reason: 'INVALID_CURRENCY', raw: trimmed };
  }

  // Tag 01: 11 for Static, 12 for Dynamic
  const kind: QRKind = tlvMap['01'].value === '12' ? 'DYNAMIC' : 'STATIC';

  // Tag 38: Merchant Account Information (NAPAS/VietQR)
  const tag38Sub = parseTLVMap(tlvMap['38'].value);

  // Subtag 00: GUID must be A000000727
  if (!tag38Sub['00'] || tag38Sub['00'].value.toUpperCase() !== 'A000000727') {
    return { success: false, reason: 'NOT_VIETQR_NAPAS', raw: trimmed };
  }

  // Subtag 01 contains Beneficiary Info (nested TLV)
  if (!tag38Sub['01']) {
    return { success: false, reason: 'NOT_VIETQR_NAPAS', raw: trimmed };
  }

  const benInfoSub = parseTLVMap(tag38Sub['01'].value);
  const bankBin = benInfoSub['00']?.value;
  const accountRef = benInfoSub['01']?.value;

  if (!bankBin || !accountRef) {
    return { success: false, reason: 'NOT_VIETQR_NAPAS', raw: trimmed };
  }

  // Tag 54: Amount
  let amount: number | undefined;
  if (tlvMap['54']) {
    const parsedAmount = parseFloat(tlvMap['54'].value);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 500000000) {
      return { success: false, reason: 'INVALID_AMOUNT', raw: trimmed };
    }
    amount = Math.round(parsedAmount);
  }

  // Tag 59: Payee Name
  const payeeName = tlvMap['59']?.value;

  // Tag 60: City
  const city = tlvMap['60']?.value;

  // Tag 52: MCC
  const mcc = tlvMap['52']?.value;

  // Tag 62: Additional Data (Subtag 08 is note)
  let note: string | undefined;
  if (tlvMap['62']) {
    const tag62Sub = parseTLVMap(tlvMap['62'].value);
    note = tag62Sub['08']?.value;
  }

  const suggestedCategory = getCategoryFromMcc(mcc);

  return {
    success: true,
    data: {
      kind,
      bankBin,
      accountRef,
      payeeName,
      amount,
      note,
      city,
      mcc,
      suggestedCategory,
      raw: trimmed,
    },
  };
}
