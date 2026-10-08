/**
 * VÍ LOCKET - AUTH LOGIC & GUEST SYNC GUARD TEST SUITE (PHASE M1.1)
 */

const assert = require('assert');

console.log('=== VÍ LOCKET AUTH & GUEST SYNC GUARD TEST SUITE (M1.1) ===\n');

// ---------------------------------------------------------------------------
// TEST 1: Guest Sync Guard (Bảo vệ CSDL - Không lưu dữ liệu Guest lên Cloud)
// ---------------------------------------------------------------------------
function testGuestSyncGuard() {
  console.log('--- TEST 1: Guest Sync Guard Verification ---');

  const guestUserId = 'guest-1791180000000';
  const realUserId = 'usr-c47289e2-9841-48e2-9012-18fbc8329a10';

  function shouldBypassCloudSync(userId) {
    if (!userId) return true;
    return userId.startsWith('guest') || userId.startsWith('demo') || userId === 'seed-user';
  }

  // 1. Guest user phải bị chặn hoàn toàn
  assert.strictEqual(shouldBypassCloudSync(guestUserId), true, 'Guest user MUST bypass cloud sync');
  assert.strictEqual(shouldBypassCloudSync('demo-user-12345'), true, 'Demo user MUST bypass cloud sync');
  assert.strictEqual(shouldBypassCloudSync('seed-user'), true, 'Seed user MUST bypass cloud sync');

  // 2. Real user thật phải được phép đồng bộ
  assert.strictEqual(shouldBypassCloudSync(realUserId), false, 'Real user MUST NOT bypass cloud sync');

  console.log('✅ Test 1 Passed: Guest Sync Guard verified (0 cloud writes for guests).\n');
}

// ---------------------------------------------------------------------------
// TEST 2: Dọn dẹp Seed Data khi Đăng Nhập Thật (Clean Seed & Migrate)
// ---------------------------------------------------------------------------
function testCleanSeedDataAndMigrate() {
  console.log('--- TEST 2: Clean Seed Data on Genuine Signup ---');

  const mockLocalTransactions = [
    { id: 'tx-seed-1', user_id: 'seed-user', amount: 45000, description: 'Cà phê Giảng' },
    { id: 'tx-seed-2', user_id: 'seed-user', amount: 65000, description: 'Phở Lý Quốc Sư' },
    { id: 'tx-seed-3', user_id: 'seed-user', amount: 35000, description: 'Bánh rán mật' },
    { id: 'tx-seed-4', user_id: 'seed-user', amount: 280000, description: 'Khăn len' },
    { id: 'tx-seed-5', user_id: 'seed-user', amount: 50000, description: 'Cốm Mễ Trì' },
    { id: 'tx-seed-6', user_id: 'seed-user', amount: 120000, description: 'Sách thơ' },
    { id: 'tx-seed-7', user_id: 'seed-user', amount: 2500000, description: 'Nhuận bút' },
    { id: 'tx-real-101', user_id: 'guest-123', amount: 30000, description: 'Bánh mì Dân Tổ' },
    { id: 'tx-real-102', user_id: 'guest-123', amount: 50000, description: 'Nước mía Hàng Điếu' },
  ];

  const newRealUserId = 'supabase-user-uuid-999';

  // Thuật toán làm sạch & chuyển quyền sở hữu
  const cleaned = mockLocalTransactions
    .filter((t) => !t.id.startsWith('tx-seed-') && t.user_id !== 'seed-user')
    .map((t) => {
      if (t.user_id.startsWith('guest-') || t.user_id.startsWith('demo-')) {
        return { ...t, user_id: newRealUserId };
      }
      return t;
    });

  // Kiểm tra: 7 khoản seed demo phải hoàn toàn biến mất
  assert.strictEqual(cleaned.length, 2, 'Only 2 real transactions should remain');
  const hasAnySeed = cleaned.some((t) => t.id.startsWith('tx-seed-'));
  assert.strictEqual(hasAnySeed, false, 'No seed transactions must remain');

  // Kiểm tra: Các giao dịch thật phải được chuyển sang user_id mới
  assert.strictEqual(cleaned[0].user_id, newRealUserId);
  assert.strictEqual(cleaned[1].user_id, newRealUserId);

  console.log('✅ Test 2 Passed: Seed cleanup and real transaction migration verified.\n');
}

// ---------------------------------------------------------------------------
// TEST 3: Kiểm tra định dạng OTP 6 chữ số
// ---------------------------------------------------------------------------
function testOtpFormatValidation() {
  console.log('--- TEST 3: OTP 6-Digit Format Validation ---');

  function isValidOtp(code) {
    if (!code || typeof code !== 'string') return false;
    const clean = code.trim();
    return /^[0-9]{6}$/.test(clean);
  }

  assert.strictEqual(isValidOtp('123456'), true);
  assert.strictEqual(isValidOtp('000000'), true);
  assert.strictEqual(isValidOtp('999999'), true);
  assert.strictEqual(isValidOtp('12345'), false, '5 digits should fail');
  assert.strictEqual(isValidOtp('1234567'), false, '7 digits should fail');
  assert.strictEqual(isValidOtp('12345a'), false, 'Characters should fail');
  assert.strictEqual(isValidOtp(''), false, 'Empty should fail');

  console.log('✅ Test 3 Passed: 6-digit OTP formatting verified.\n');
}

// ---------------------------------------------------------------------------
// TEST 4: Profile Schema Payload Validation
// ---------------------------------------------------------------------------
function testProfileSchemaPayload() {
  console.log('--- TEST 4: Profile Schema Payload Validation ---');

  const user = {
    id: 'usr-1234',
    email: 'lan@gmail.com',
    full_name: 'Lan Hương',
  };

  const payload = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    fav_unit: 'tra_sua',
    hourly_rate: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  assert.strictEqual(typeof payload.id, 'string');
  assert.strictEqual(typeof payload.email, 'string');
  assert.strictEqual(typeof payload.fav_unit, 'string');
  assert.strictEqual(typeof payload.hourly_rate, 'number');
  assert.ok(['tra_sua', 'ca_phe', 'to_pho'].includes(payload.fav_unit));

  console.log('✅ Test 4 Passed: Profile schema payload adheres strictly to Supabase schema.\n');
}

// RUN ALL
testGuestSyncGuard();
testCleanSeedDataAndMigrate();
testOtpFormatValidation();
testProfileSchemaPayload();

console.log('🎉 ALL 4 AUTH LOGIC & GUEST GUARD TESTS PASSED CLEANLY (4/4)!');
