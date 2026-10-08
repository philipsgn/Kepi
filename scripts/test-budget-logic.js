/**
 * UNIT TEST THUẬT TOÁN TÍNH TOÁN NGÂN SÁCH & ROLLOVER 100%
 */

const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompactVND = (amount) => {
  if (Math.abs(amount) >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)} củ`;
  }
  if (Math.abs(amount) >= 1_000) {
    const thousands = amount / 1_000;
    return `${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(0)}k`;
  }
  return `${amount}đ`;
};

const calculateBaseDailyBudget = (
  monthlyIncome,
  monthlyFixedCosts,
  goalAmount,
  daysInMonth = 30
) => {
  const disposable = monthlyIncome - monthlyFixedCosts - goalAmount;
  if (disposable <= 0) return 30_000;
  return Math.max(30_000, Math.floor(disposable / daysInMonth));
};

const calculateRolloverDailyBudget = (
  baseDailyBudget,
  yesterdayAllocated,
  yesterdaySpent
) => {
  const rollover = yesterdayAllocated - yesterdaySpent;
  const todayBudget = baseDailyBudget + rollover;
  return Math.max(20_000, todayBudget);
};

console.log('--- TEST BỘ HÀM TÀI CHÍNH & ROLLOVER (HÀ NỘI THU ĐÔNG) ---');

// Test 1: Base Daily Budget
const income = 8_000_000;
const fixedCosts = 3_000_000;
const goal = 2_000_000;
const base = calculateBaseDailyBudget(income, fixedCosts, goal, 30);
console.log(`Thu nhập 8 củ, Cố định 3 củ, Tiết kiệm 2 củ => Ngân sách ngày cơ sở: ${formatVND(base)} (Kỳ vọng: 100.000đ)`);
if (base !== 100_000) throw new Error(`Sai kết quả cơ sở: ${base}`);

// Test 2: Rollover khi dư
// Hôm qua được phân bổ 100k, chỉ tiêu 40k => Dư 60k cộng dồn sang hôm nay
const rolloverSurplus = calculateRolloverDailyBudget(100_000, 100_000, 40_000);
console.log(`Hôm qua dư 60k => Hôm nay được tiêu: ${formatVND(rolloverSurplus)} (Kỳ vọng: 160.000đ)`);
if (rolloverSurplus !== 160_000) throw new Error(`Sai rollover dư: ${rolloverSurplus}`);

// Test 3: Rollover khi tiêu lố
// Hôm qua phân bổ 100k, tiêu tận 140k => Lố 40k trừ thẳng vào hôm nay
const rolloverDeficit = calculateRolloverDailyBudget(100_000, 100_000, 140_000);
console.log(`Hôm qua lố 40k => Hôm nay còn: ${formatVND(rolloverDeficit)} (Kỳ vọng: 60.000đ)`);
if (rolloverDeficit !== 60_000) throw new Error(`Sai rollover lố: ${rolloverDeficit}`);

// Test 4: Format compact VND
console.log(`Format 45k: ${formatCompactVND(45_000)}`);
console.log(`Format 1.2 củ: ${formatCompactVND(1_200_000)}`);

console.log('=> TẤT CẢ UNIT TESTS TÍNH TOÁN NGÂN SÁCH ĐÃ PASS 100%!');
