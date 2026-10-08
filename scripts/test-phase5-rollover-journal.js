// Test script for Phase 5: Rollover 100% Algorithm & Locket Calendar/Gallery Aggregations
const assert = require('assert');

// 1. Test Rollover 100% pure function logic
function calculateRolloverDailyBudget(baseDailyBudget, yesterdayAllocated, yesterdaySpent) {
  const rollover = yesterdayAllocated - yesterdaySpent;
  // Dư thì cộng 100%, thiếu thì trừ bù trực tiếp
  const todayBudget = baseDailyBudget + rollover;
  // Luôn đảm bảo sàn tối thiểu 20k/ngày để người dùng không nản lòng
  return Math.max(20000, todayBudget);
}

// Case A: Dư tiền hôm qua (Được cấp 100k, chỉ tiêu 40k -> Dư 60k dồn sang hôm nay)
const surplusBudget = calculateRolloverDailyBudget(100000, 100000, 40000);
assert.strictEqual(surplusBudget, 160000);
console.log('✅ Rollover Case A (Surplus 100%): 100k base + 60k surplus = 160.000đ PASS');

// Case B: Tiêu lố hôm qua (Được cấp 100k, tiêu 150k -> Thiếu 50k trừ vào hôm nay)
const deficitBudget = calculateRolloverDailyBudget(100000, 100000, 150000);
assert.strictEqual(deficitBudget, 50000);
console.log('✅ Rollover Case B (Deficit reduction): 100k base - 50k deficit = 50.000đ PASS');

// Case C: Vỡ trận hôm qua (Được cấp 100k, tiêu 300k -> Âm 200k, nhưng phải giữ sàn 20.000đ)
const catastrophicBudget = calculateRolloverDailyBudget(100000, 100000, 300000);
assert.strictEqual(catastrophicBudget, 20000);
console.log('✅ Rollover Case C (Floor safety 20k): 100k base - 200k deficit = Floor 20.000đ PASS');

// 2. Test Calendar Day Aggregation logic
const mockTransactions = [
  {
    id: 'tx-1',
    occurred_at: '2026-10-01T08:30:00.000Z',
    type: 'EXPENSE',
    amount: 45000,
    photo_url: 'https://example.com/egg-coffee.jpg',
  },
  {
    id: 'tx-2',
    occurred_at: '2026-10-01T12:00:00.000Z',
    type: 'EXPENSE',
    amount: 65000,
    photo_url: 'https://example.com/pho.jpg',
  },
  {
    id: 'tx-3',
    occurred_at: '2026-10-02T19:00:00.000Z',
    type: 'INCOME',
    amount: 2000000,
    photo_url: null,
  },
];

function aggregateDaySummary(transactions, targetDateStr) {
  const dayTxs = transactions.filter(t => t.occurred_at.startsWith(targetDateStr));
  let totalSpent = 0;
  let totalIncome = 0;
  let thumbnailUrl = null;

  dayTxs.forEach(tx => {
    if (tx.type === 'EXPENSE') totalSpent += tx.amount;
    if (tx.type === 'INCOME') totalIncome += tx.amount;
    if (!thumbnailUrl && tx.photo_url) thumbnailUrl = tx.photo_url;
  });

  return {
    date: targetDateStr,
    itemCount: dayTxs.length,
    totalSpent,
    totalIncome,
    thumbnailUrl,
  };
}

const oct1Summary = aggregateDaySummary(mockTransactions, '2026-10-01');
assert.strictEqual(oct1Summary.itemCount, 2);
assert.strictEqual(oct1Summary.totalSpent, 110000);
assert.strictEqual(oct1Summary.thumbnailUrl, 'https://example.com/egg-coffee.jpg');
console.log('✅ Calendar Day 2026-10-01 Aggregation: 2 items, 110.000đ total spent, thumbnail captured PASS');

const oct2Summary = aggregateDaySummary(mockTransactions, '2026-10-02');
assert.strictEqual(oct2Summary.itemCount, 1);
assert.strictEqual(oct2Summary.totalIncome, 2000000);
assert.strictEqual(oct2Summary.totalSpent, 0);
console.log('✅ Calendar Day 2026-10-02 Aggregation: 1 income item, +2.000.000đ PASS');

console.log('\n🎉 ALL PHASE 5 ROLLOVER & LOCKET CALENDAR TESTS PASSED SUCCESSFULLY!');
