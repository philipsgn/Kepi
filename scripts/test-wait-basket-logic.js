// Test script for Phase 4: Wait Basket & Cooling Notification Logic
const assert = require('assert');

// 1. Test Aggressive Reminder Milestones
const REMINDER_STAGES = [
  { hours: 1, title: '🍂 Cơn thèm mua đã nguội bớt chưa bạn?' },
  { hours: 3, title: '⏳ 3 tiếng trôi qua rồi...' },
  { hours: 6, title: '✨ Đã nửa ngày trôi qua, vẫn ổn chứ?' },
  { hours: 24, title: '🏆 Chúc mừng 24 giờ kiên định!' },
];

function calculateReminders(baseDate) {
  return REMINDER_STAGES.map(stage => ({
    triggerAt: new Date(baseDate.getTime() + stage.hours * 3600 * 1000),
    hours: stage.hours,
    title: stage.title
  }));
}

const now = new Date();
const reminders = calculateReminders(now);
assert.strictEqual(reminders.length, 4);
assert.strictEqual(reminders[0].hours, 1);
assert.strictEqual(reminders[1].hours, 3);
assert.strictEqual(reminders[2].hours, 6);
assert.strictEqual(reminders[3].hours, 24);
console.log('✅ Aggressive reminder stages passed (4 stages: 1h, 3h, 6h, 24h)');

// 2. Test Time Left formatting logic
function formatTimeLeft(expiresAtStr) {
  const diffMs = new Date(expiresAtStr).getTime() - Date.now();
  if (diffMs <= 0) return 'Đã hết giờ chờ';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `Còn ${hours}h ${minutes}p`;
  return `Còn ${minutes} phút`;
}

function formatTimeLeftWithNow(expiresAtStr, mockNow) {
  const diffMs = new Date(expiresAtStr).getTime() - mockNow;
  if (diffMs <= 0) return 'Đã hết giờ chờ';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `Còn ${hours}h ${minutes}p`;
  return `Còn ${minutes} phút`;
}

const testNow = 1700000000000;
const inTwoHours = new Date(testNow + 2 * 3600 * 1000 + 15 * 60 * 1000).toISOString();
const inTwentyMins = new Date(testNow + 20 * 60 * 1000).toISOString();
const expired = new Date(testNow - 1000).toISOString();

assert.strictEqual(formatTimeLeftWithNow(inTwoHours, testNow), 'Còn 2h 15p');
assert.strictEqual(formatTimeLeftWithNow(inTwentyMins, testNow), 'Còn 20 phút');
assert.strictEqual(formatTimeLeftWithNow(expired, testNow), 'Đã hết giờ chờ');
console.log('✅ Time left formatting passed');

// 3. Test Basket Total Pending calculation
const mockItems = [
  { id: '1', amount: 350000, status: 'cooling' },
  { id: '2', amount: 150000, status: 'cooling' },
  { id: '3', amount: 2000000, status: 'skipped' },
  { id: '4', amount: 80000, status: 'bought' },
];

const pendingItems = mockItems.filter(i => i.status === 'cooling');
const totalPending = pendingItems.reduce((sum, i) => sum + i.amount, 0);
assert.strictEqual(pendingItems.length, 2);
assert.strictEqual(totalPending, 500000);
console.log('✅ Pending items count and sum passed');

console.log('\n🎉 ALL PHASE 4 LOGIC TESTS PASSED SUCCESSFULLY!');
