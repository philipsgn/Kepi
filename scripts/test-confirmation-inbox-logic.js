/**
 * TEST TOÀN DIỆN LOGIC HỘP XÁC NHẬN (CONFIRMATION INBOX) & CÁCH LY SỐ LIỆU TÀI CHÍNH
 * Phục vụ nghiệm thu Bước C (Bản Cuối)
 */

function deduplicatePendingTransactions(transactions) {
  const now = Date.now();
  // Lọc pending < 24h
  const activePending = transactions.filter((t) => {
    if (t.status !== 'PENDING') return false;
    const createdTime = new Date(t.created_at).getTime();
    return now - createdTime < 24 * 3600 * 1000;
  });

  const deduplicated = [];
  for (const tx of activePending) {
    const isDuplicate = deduplicated.some((existing) => {
      const sameAmount = existing.amount === tx.amount;
      const samePayee = (existing.payee_name || existing.description) === (tx.payee_name || tx.description);
      const timeDiff = Math.abs(new Date(existing.created_at).getTime() - new Date(tx.created_at).getTime());
      return sameAmount && samePayee && timeDiff <= 5 * 60 * 1000;
    });
    if (!isDuplicate) {
      deduplicated.push(tx);
    }
  }
  return deduplicated;
}

function getDueWaitItems(waitItems) {
  const now = Date.now();
  return waitItems.filter((i) => {
    if (i.status !== 'WAITING') return false;
    const createdTime = new Date(i.created_at).getTime();
    const isOver24h = now - createdTime >= 24 * 3600 * 1000;
    const isRemindDue = i.next_remind_at ? new Date(i.next_remind_at).getTime() <= now : false;
    return isOver24h || isRemindDue;
  });
}

function calculateConfirmedExpense(transactions) {
  return transactions
    .filter((tx) => {
      const isConfirmed = tx.status === 'CONFIRMED' || !tx.status;
      return isConfirmed && tx.type === 'EXPENSE';
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
}

console.log('🍁 BẮT ĐẦU KIỂM THỬ BƯỚC C: HỘP XÁC NHẬN (CONFIRMATION INBOX)');

// TEST 1: CHỐNG TRÙNG LẶP (DEDUPLICATION TRONG 5 PHÚT)
const now = Date.now();
const testTransactions = [
  {
    id: 'tx-1',
    amount: 45000,
    payee_name: 'Cà phê Giảng',
    status: 'PENDING',
    created_at: new Date(now - 60 * 1000).toISOString(), // 1 phút trước
  },
  {
    id: 'tx-2',
    amount: 45000,
    payee_name: 'Cà phê Giảng',
    status: 'PENDING',
    created_at: new Date(now - 120 * 1000).toISOString(), // 2 phút trước (trùng!)
  },
  {
    id: 'tx-3',
    amount: 65000,
    payee_name: 'Phở Thìn Lò Đúc',
    status: 'PENDING',
    created_at: new Date(now - 180 * 1000).toISOString(), // 3 phút trước (khác món)
  },
  {
    id: 'tx-4',
    amount: 45000,
    payee_name: 'Cà phê Giảng',
    status: 'PENDING',
    created_at: new Date(now - 25 * 3600 * 1000).toISOString(), // Quá 24h!
  },
  {
    id: 'tx-5',
    amount: 30000,
    payee_name: 'Bánh mì Dân Tổ',
    status: 'CANCELLED',
    created_at: new Date(now - 300 * 1000).toISOString(),
  },
];

const deduplicated = deduplicatePendingTransactions(testTransactions);
console.log(`[Test 1 - Deduplication] 5 giao dịch đầu vào -> Sau lọc & gộp trùng: ${deduplicated.length} thẻ`);
if (deduplicated.length !== 2) {
  throw new Error(`Kỳ vọng 2 thẻ (tx-1 gộp tx-2, tx-3 riêng, loại tx-4 quá 24h & tx-5 cancelled). Thực tế: ${deduplicated.length}`);
}
console.log('✓ PASS Test 1: Deduplication trong 5 phút & loại bỏ quá 24h / cancelled chính xác 100%');

// TEST 2: GOM MÓN TỪ GIỎ CHỜ ĐÃ ĐỦ 24H
const testWaitItems = [
  {
    id: 'wait-1',
    item_name: 'Áo len cardigan mùa đông',
    amount: 350000,
    status: 'WAITING',
    created_at: new Date(now - 26 * 3600 * 1000).toISOString(), // Đã qua 26h -> Cần xác nhận
  },
  {
    id: 'wait-2',
    item_name: 'Tai nghe Bluetooth',
    amount: 450000,
    status: 'WAITING',
    created_at: new Date(now - 2 * 3600 * 1000).toISOString(), // Mới 2h -> Vẫn đang chờ
  },
  {
    id: 'wait-3',
    item_name: 'Giày sneaker',
    amount: 800000,
    status: 'BOUGHT',
    created_at: new Date(now - 30 * 3600 * 1000).toISOString(), // Đã giải quyết
  },
];

const dueWaitItems = getDueWaitItems(testWaitItems);
console.log(`[Test 2 - Wait Basket Due] 3 món giỏ chờ -> Đủ 24h: ${dueWaitItems.length} món`);
if (dueWaitItems.length !== 1 || dueWaitItems[0].id !== 'wait-1') {
  throw new Error(`Kỳ vọng 1 món (wait-1). Thực tế: ${dueWaitItems.length}`);
}
console.log('✓ PASS Test 2: Món giỏ chờ quá 24h tự động chảy vào Hộp xác nhận');

// TEST 3: CÁCH LY SỐ LIỆU TÀI CHÍNH TUYỆT ĐỐI (ZERO-IMPACT ON BUDGET)
const allTransactions = [
  { id: 'tx-c1', type: 'EXPENSE', amount: 50000, status: 'CONFIRMED' },
  { id: 'tx-c2', type: 'EXPENSE', amount: 120000, status: 'CONFIRMED' },
  { id: 'tx-p1', type: 'EXPENSE', amount: 200000, status: 'PENDING' },    // Không được cộng!
  { id: 'tx-p2', type: 'EXPENSE', amount: 500000, status: 'PENDING' },    // Không được cộng!
  { id: 'tx-x1', type: 'EXPENSE', amount: 90000, status: 'CANCELLED' },   // Không được cộng!
];

const totalExpense = calculateConfirmedExpense(allTransactions);
console.log(`[Test 3 - Calculation Isolation] Tổng chi tính toán: ${totalExpense}đ (Kỳ vọng: 170.000đ)`);
if (totalExpense !== 170000) {
  throw new Error(`Lỗi rò rỉ số liệu! PENDING hoặc CANCELLED bị tính vào tổng chi: ${totalExpense}`);
}
console.log('✓ PASS Test 3: Cách ly số liệu hoàn hảo! Khoản PENDING / CANCELLED 100% không ảnh hưởng ngân sách');

console.log('✨ TOÀN BỘ CÁC BÀI TEST NGHIỆM THU BƯỚC C ĐỀU THÀNH CÔNG VẺ VANG!');
