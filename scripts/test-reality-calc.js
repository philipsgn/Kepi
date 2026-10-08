/**
 * UNIT TEST ĐỘNG CƠ QUY ĐỔI THỰC TẾ (REALITY CALCULATOR)
 */

function calculateRealityMetrics(params) {
  const { amount, dailyBudget, hourlyRate, favUnit, realBalance } = params;
  const safeDailyBudget = dailyBudget > 0 ? dailyBudget : 50_000;
  const budgetDays = parseFloat((amount / safeDailyBudget).toFixed(1));

  let unitPrice = 30_000;
  if (favUnit === 'to_pho') unitPrice = 40_000;
  const favUnitCount = parseFloat((amount / unitPrice).toFixed(1));

  let workHours = null;
  if (hourlyRate > 0) workHours = parseFloat((amount / hourlyRate).toFixed(1));

  const dailySavings = Math.max(20_000, safeDailyBudget * 0.35);
  const delayedDays = Math.max(1, Math.round(amount / dailySavings));

  return { budgetDays, favUnitCount, workHours, delayedDays };
}

console.log('--- TEST ĐỘNG CƠ QUY ĐỔI REALITY CHECK (HÀ NỘI THU ĐÔNG) ---');

// Test áo khoác 600.000đ
// Ngân sách ngày 100.000đ, Thu nhập giờ 35.000đ, Đơn vị Trà sữa (30.000đ)
const metrics = calculateRealityMetrics({
  amount: 600_000,
  dailyBudget: 100_000,
  hourlyRate: 35_000,
  favUnit: 'tra_sua',
  realBalance: 3_000_000,
});

console.log(`Món 600.000đ:`);
console.log(`- Số ngày ngân sách: ${metrics.budgetDays} ngày (Kỳ vọng: 6.0)`);
console.log(`- Số ly trà sữa: ${metrics.favUnitCount} ly (Kỳ vọng: 20.0)`);
console.log(`- Giờ làm việc: ${metrics.workHours} giờ (Kỳ vọng: 17.1)`);
console.log(`- Ngày lùi mục tiêu: ${metrics.delayedDays} ngày`);

if (metrics.budgetDays !== 6.0) throw new Error('Sai budgetDays');
if (metrics.favUnitCount !== 20.0) throw new Error('Sai favUnitCount');

console.log('=> TEST REALITY CALCULATOR ĐÃ PASS 100%!');
