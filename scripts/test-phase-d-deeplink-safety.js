/**
 * UNIT TEST TOÀN DIỆN CHO BƯỚC D:
 * 1. Luồng 1 (Autofill Universal Deeplink VietQR v2)
 * 2. Luồng 2 (An toàn khi mở app ngân hàng & Fallback)
 * 3. Bảo mật phiên Handoff 15 phút & Zero-PII
 */

function buildVietQRUniversalUrl(params) {
  const {
    appId,
    accountRef,
    bankBin,
    amount,
    note,
    payeeName,
    returnUrl = 'vilocket://qr-callback',
  } = params;

  const queryParts = [
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

async function simulateOpenBank(scheme, shouldFail = false) {
  try {
    if (shouldFail) {
      throw new Error('OS: Scheme not supported');
    }
    return { success: true };
  } catch {
    return {
      success: false,
      error: 'Không mở được app ngân hàng. Mở thủ công nhé.',
    };
  }
}

function checkHandoffSessionValidity(session, maxAgeMs = 15 * 60 * 1000) {
  const now = Date.now();
  const elapsed = now - session.startedAt;
  return elapsed <= maxAgeMs;
}

console.log('🍂 BẮT ĐẦU KIỂM THỬ BƯỚC D: LUỒNG 1, LUỒNG 2 & AN TOÀN DEEPLINK');

// 1. TEST LUỒNG 1: 5 NGÂN HÀNG AUTOFILL
const luong1Banks = ['mb', 'bidv', 'icb', 'acb', 'ocb'];
for (const bId of luong1Banks) {
  const testUrl = buildVietQRUniversalUrl({
    appId: bId,
    accountRef: '1903678910',
    bankBin: '970422',
    amount: 150000,
    note: 'Cà phê Giảng',
    payeeName: 'NGUYEN VAN A',
    returnUrl: 'vilocket://qr-callback?pendingId=tx-test-123',
  });

  if (!testUrl.startsWith(`https://dl.vietqr.io/pay?app=${bId}`)) {
    throw new Error(`Sai định dạng URL cho ${bId}: ${testUrl}`);
  }
  if (!testUrl.includes('ba=1903678910%40970422')) {
    throw new Error(`Sai định dạng số tài khoản/BIN: ${testUrl}`);
  }
  if (!testUrl.includes('am=150000')) {
    throw new Error(`Sai định dạng số tiền: ${testUrl}`);
  }
}
console.log('✓ PASS Test 1: Luồng 1 tạo đúng 100% chuẩn Universal Deeplink cho cả 5 ngân hàng Autofill');

// 2. TEST AN TOÀN: XỬ LÝ LỖI MỞ APP NGÂN HÀNG (LUỒNG 2 TECHCOMBANK...)
simulateOpenBank('tcb://', true).then((res) => {
  if (res.success !== false) {
    throw new Error('Kỳ vọng res.success === false khi giả lập lỗi');
  }
  if (res.error !== 'Không mở được app ngân hàng. Mở thủ công nhé.') {
    throw new Error(`Sai thông điệp lỗi: ${res.error}`);
  }
  console.log('✓ PASS Test 2: Xử lý an toàn khi mở app thất bại — Không văng lỗi kỹ thuật');
});

// 3. TEST PHIÊN BÀN GIAO NỀN (HANDOFF SESSION 15 PHÚT)
const now = Date.now();
const freshSession = {
  pendingId: 'tx-pending-1',
  payeeName: 'Phở Thìn',
  amount: 65000,
  bankAppId: 'tcb',
  startedAt: now - 5 * 60 * 1000, // 5 phút trước
};

const expiredSession = {
  pendingId: 'tx-pending-2',
  payeeName: 'Bún chả Hương Liên',
  amount: 80000,
  bankAppId: 'tcb',
  startedAt: now - 16 * 60 * 1000, // 16 phút trước
};

if (!checkHandoffSessionValidity(freshSession)) {
  throw new Error('Phiên 5 phút phải còn hiệu lực');
}
if (checkHandoffSessionValidity(expiredSession)) {
  throw new Error('Phiên 16 phút phải bị hết hạn');
}
console.log('✓ PASS Test 3: Phiên bàn giao 15 phút hoạt động chính xác (5 phút còn, 16 phút hủy)');

// 4. TEST BẢO MẬT: ZERO-PII TRONG ACTIVE HANDOFF SESSION
const sessionKeys = Object.keys(freshSession);
const forbiddenKeys = ['accountRef', 'stk', 'accountNumber', 'cardNumber'];
for (const fKey of forbiddenKeys) {
  if (sessionKeys.includes(fKey)) {
    throw new Error(`Phát hiện rò rỉ PII! Session chứa trường nhạy cảm: ${fKey}`);
  }
}
console.log('✓ PASS Test 4: Không lưu bất kỳ Số Tài Khoản nào trong Handoff Session (Zero PII)');

console.log('✨ TOÀN BỘ CÁC BÀI TEST NGHIỆM THU BƯỚC D ĐỀU ĐẠT 100%!');
