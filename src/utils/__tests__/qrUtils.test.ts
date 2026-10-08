import { computeCrc16, validateEMVCrc, stringToUtf8ByteArray } from '../qr/crc16';
import { parseVietQR, getCategoryFromMcc } from '../qr/emvParser';
import { buildVietQRUniversalUrl, getBankByBin } from '../qr/bankDeeplink';

declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: (actual: any) => any;

describe('QR Utilities - CRC16 & EMVCo VietQR Parser', () => {
  describe('CRC-16 CCITT', () => {
    it('correctly calculates CRC for a known string', () => {
      // Test string ending in 6304
      const prefix = '00020101021238570010A00000072701270006970407011319036789123450208QRIBFTTA5204581253037045405450005802VN5913CA PHE GIANG6006HANOI62160812CA PHE SANG6304';
      const crc = computeCrc16(prefix);
      expect(crc).toBeDefined();
      expect(crc.length).toBe(4);

      const fullQr = prefix + crc;
      expect(validateEMVCrc(fullQr)).toBe(true);
    });

    it('rejects tampered or corrupt CRC', () => {
      const prefix = '00020101021238570010A00000072701270006970407011319036789123450208QRIBFTTA5204581253037045405450005802VN5913CA PHE GIANG6006HANOI62160812CA PHE SANG6304';
      const tamperedQr = prefix + '0000';
      expect(validateEMVCrc(tamperedQr)).toBe(false);
    });

    it('handles UTF-8 multibyte characters accurately in length and CRC', () => {
      const accented = 'TIỆM CÔ MAI';
      const bytes = stringToUtf8ByteArray(accented);
      // 'Ệ' and 'Ô' take multiple bytes
      expect(bytes.length).toBeGreaterThan(accented.length);
    });
  });

  describe('parseVietQR', () => {
    it('parses valid dynamic Techcombank VietQR with amount and note', () => {
      const prefix = '00020101021238570010A00000072701270006970407011319036789123450208QRIBFTTA5204581253037045405450005802VN5912CA PHE GIANG6005HANOI62150811CA PHE SANG6304';
      const crc = computeCrc16(prefix);
      const sample = prefix + crc;

      const result = parseVietQR(sample);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.kind).toBe('DYNAMIC');
        expect(result.data.bankBin).toBe('970407');
        expect(result.data.accountRef).toBe('1903678912345');
        expect(result.data.amount).toBe(45000);
        expect(result.data.payeeName).toBe('CA PHE GIANG');
        expect(result.data.city).toBe('HANOI');
        expect(result.data.note).toBe('CA PHE SANG');
        expect(result.data.mcc).toBe('5812');
        expect(result.data.suggestedCategory).toBe('an_uong');
      }
    });

    it('parses valid static VietQR (no amount tag 54)', () => {
      const prefix = '00020101021138570010A00000072701270006970407011319036789123450208QRIBFTTA5204541153037045802VN5911TIEM CO MAI6005HANOI6304';
      const crc = computeCrc16(prefix);
      const sample = prefix + crc;

      const result = parseVietQR(sample);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.kind).toBe('STATIC');
        expect(result.data.amount).toBeUndefined();
        expect(result.data.bankBin).toBe('970407');
        expect(result.data.accountRef).toBe('1903678912345');
      }
    });

    it('rejects web URLs as NOT_EMV_FORMAT without opening any browser', () => {
      const url = 'https://vietqr.net/pay?amount=50000';
      const result = parseVietQR(url);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe('NOT_EMV_FORMAT');
      }
    });

    it('rejects EMV of other non-VietQR providers', () => {
      // Tag 38 with non-NAPAS GUID 'A000000999'
      const nonVietQr = '00020101021138280010A000000999011012345678905204581253037045802VN6304';
      const crc = computeCrc16(nonVietQr);
      const sample = nonVietQr + crc;

      const result = parseVietQR(sample);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe('NOT_VIETQR_NAPAS');
      }
    });
  });

  describe('MCC category mapping', () => {
    it('maps food & dining MCCs correctly', () => {
      expect(getCategoryFromMcc('5812')).toBe('an_uong');
      expect(getCategoryFromMcc('5814')).toBe('an_uong');
    });

    it('maps transport MCCs correctly', () => {
      expect(getCategoryFromMcc('5541')).toBe('di_chuyen');
      expect(getCategoryFromMcc('4121')).toBe('di_chuyen');
    });

    it('maps shopping MCCs correctly', () => {
      expect(getCategoryFromMcc('5651')).toBe('mua_sam');
    });
  });

  describe('bankDeeplink Builder', () => {
    it('maps Techcombank BIN 970407', () => {
      const bank = getBankByBin('970407');
      expect(bank).toBeDefined();
      expect(bank?.appId).toBe('tcb');
      expect(bank?.shortName).toBe('Techcombank');
    });

    it('constructs universal dl.vietqr.io deeplink properly', () => {
      const url = buildVietQRUniversalUrl({
        appId: 'mb',
        accountRef: '1903678912345',
        bankBin: '970407',
        amount: 45000,
        note: 'CA PHE SANG',
        payeeName: 'CA PHE GIANG',
      });

      expect(url).toContain('https://dl.vietqr.io/pay?');
      expect(url).toContain('app=mb');
      expect(url).toContain('ba=1903678912345%40970407');
      expect(url).toContain('am=45000');
      expect(url).toContain('url=vilocket%3A%2F%2Fqr-callback');
    });

    it('classifies non-autofill banks into Tier 2 safely', () => {
      const tcb = getBankByBin('970407');
      expect(tcb?.tier).toBe(2);
      expect(tcb?.nativeScheme).toBe('tcb://');
      expect(tcb?.vietqrAutofillFlag).toBe(false);
    });

    it('classifies autofill banks into Tier 1 with full flags', () => {
      const mb = getBankByBin('970422');
      expect(mb?.tier).toBe(1);
      expect(mb?.vietqrAutofillFlag).toBe(true);
    });

    it('preserves exact raw EMV string without character corruption for photo QR generation', () => {
      const prefix = '00020101021238570010A00000072701270006970407011319036789123450208QRIBFTTA5204581253037045405450005802VN5912CA PHE GIANG6005HANOI62150811CA PHE SANG6304';
      const crc = computeCrc16(prefix);
      const sample = prefix + crc;

      const result = parseVietQR(sample);
      expect(result.success).toBe(true);
      if (result.success) {
        // Raw string passed to QRCode generator must strictly equal original scanned string
        expect(result.data.raw).toBe(sample);
        expect(validateEMVCrc(result.data.raw)).toBe(true);
      }
    });
  });
});
