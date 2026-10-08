// @ts-ignore
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: (actual: any) => any;
declare const beforeEach: (fn: () => void) => void;

import {
  getEffectiveBankMeta,
  setBankCapabilityConfig,
  clearBankCapabilityConfig,
  logBankHandoffEvent,
  getLoggedHandoffEvents,
  BankCapabilityConfig,
} from '../bankCapabilityService';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('bankCapabilityService - Quản lý cấu hình & Bảng năng lực Deeplink Ngân hàng', () => {
  beforeEach(async () => {
    await clearBankCapabilityConfig();
    await AsyncStorage.removeItem('@vilocket_bank_handoff_analytics');
  });

  it('trả về cấu hình mặc định khi chưa có ghi đè từ xa (Techcombank Tier 2)', async () => {
    const meta = await getEffectiveBankMeta('970407'); // Techcombank BIN
    expect(meta).not.toBeNull();
    expect(meta?.shortName).toBe('Techcombank');
    expect(meta?.tier).toBe(2);
    expect(meta?.nativeScheme).toBe('tcb://');
    expect(meta?.vietqrAutofillFlag).toBe(false);
  });

  it('xác nhận 5 ngân hàng Luồng A mặc định ở Tier 1 Autofill (MB, BIDV, ICB, ACB, OCB)', async () => {
    const mb = await getEffectiveBankMeta('mb');
    const bidv = await getEffectiveBankMeta('bidv');
    const icb = await getEffectiveBankMeta('icb');
    const acb = await getEffectiveBankMeta('acb');
    const ocb = await getEffectiveBankMeta('ocb');

    expect(mb?.tier).toBe(1);
    expect(mb?.vietqrAutofillFlag).toBe(true);

    expect(bidv?.tier).toBe(1);
    expect(bidv?.vietqrAutofillFlag).toBe(true);

    expect(icb?.tier).toBe(1);
    expect(icb?.vietqrAutofillFlag).toBe(true);

    expect(acb?.tier).toBe(1);
    expect(acb?.vietqrAutofillFlag).toBe(true);

    expect(ocb?.tier).toBe(1);
    expect(ocb?.vietqrAutofillFlag).toBe(true);
  });

  it('trả về null nếu mã ngân hàng / BIN không tồn tại', async () => {
    const meta = await getEffectiveBankMeta('999999');
    expect(meta).toBeNull();
  });

  it('áp dụng thành công Remote Override ghi đè Tier và Scheme cho từng ngân hàng', async () => {
    const testConfig: BankCapabilityConfig = {
      overrides: {
        '970407': {
          tier: 1,
          nativeScheme: 'tcb-custom://',
        },
      },
    };
    await setBankCapabilityConfig(testConfig);

    const meta = await getEffectiveBankMeta('970407');
    expect(meta).not.toBeNull();
    expect(meta?.tier).toBe(1);
    expect(meta?.nativeScheme).toBe('tcb-custom://');
  });

  it('hạ cấp xuống Tier 3 (tự mở app) nếu ngân hàng bị đánh dấu disabled', async () => {
    const testConfig: BankCapabilityConfig = {
      overrides: {
        '970407': {
          disabled: true,
        },
      },
    };
    await setBankCapabilityConfig(testConfig);

    const meta = await getEffectiveBankMeta('970407');
    expect(meta).not.toBeNull();
    expect(meta?.tier).toBe(3);
  });

  it('KÍCH HOẠT GLOBAL KILL-SWITCH: cưỡng bức toàn bộ ngân hàng về Tier 3 trong trường hợp khẩn cấp', async () => {
    const emergencyConfig: BankCapabilityConfig = {
      globalKillSwitch: true,
    };
    await setBankCapabilityConfig(emergencyConfig);

    // Kiểm tra nhiều ngân hàng khác nhau đều bị ép về Tier 3
    const tcb = await getEffectiveBankMeta('970407'); // Techcombank
    const mb = await getEffectiveBankMeta('970422');  // MBBank
    const vcb = await getEffectiveBankMeta('970436'); // Vietcombank

    expect(tcb?.tier).toBe(3);
    expect(mb?.tier).toBe(3);
    expect(vcb?.tier).toBe(3);
  });

  it('xóa cấu hình ghi đè trả về giá trị mặc định nguyên bản', async () => {
    await setBankCapabilityConfig({ globalKillSwitch: true });
    let meta = await getEffectiveBankMeta('970407');
    expect(meta?.tier).toBe(3);

    await clearBankCapabilityConfig();
    meta = await getEffectiveBankMeta('970407');
    expect(meta?.tier).toBe(2);
  });

  it('ghi log handoff analytics mà KHÔNG chứa bất kỳ thông tin nhạy cảm nào (Zero PII)', async () => {
    await logBankHandoffEvent('TCB', 2, 'OPENED');
    await logBankHandoffEvent('MB', 1, 'MANUAL');

    const events = await getLoggedHandoffEvents();
    expect(events.length).toBe(2);

    expect(events[0].bankCode).toBe('MB');
    expect(events[0].tier).toBe(1);
    expect(events[0].outcome).toBe('MANUAL');
    expect(events[0].timestamp).toBeDefined();

    // Xác nhận không có trường tài khoản, số tiền hay tên người nhận
    expect((events[0] as any).accountNo).toBeUndefined();
    expect((events[0] as any).amount).toBeUndefined();
    expect((events[0] as any).payeeName).toBeUndefined();
  });
});
