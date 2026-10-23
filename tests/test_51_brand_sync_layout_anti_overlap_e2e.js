/**
 * TEST 51: PIGFLY BRAND SYNC, LAYOUT ANTI-OVERLAP (5 TABS),
 * PROFILE BUDGET CLEANUP & SETTINGS ZERO-STK SECURITY AUDIT
 *
 * Requirements Source: ORIGINAL_REQUEST.md (R1, R2, R3, R4)
 * Architecture Spec: PROJECT.md (Features F1 through F14)
 * Standard: Opaque-box requirement-driven verification
 *
 * Supports progressive testing via CLI arguments:
 *   node tests/test_51_brand_sync_layout_anti_overlap_e2e.js
 *   node tests/test_51_brand_sync_layout_anti_overlap_e2e.js --milestone=M1
 *   node tests/test_51_brand_sync_layout_anti_overlap_e2e.js --milestone=M2
 *   node tests/test_51_brand_sync_layout_anti_overlap_e2e.js --milestone=M3
 *   node tests/test_51_brand_sync_layout_anti_overlap_e2e.js --milestone=M4
 *   node tests/test_51_brand_sync_layout_anti_overlap_e2e.js --feature=F5
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

function runTest51(options = {}) {
  const root = options.projectRoot || path.resolve(__dirname, '..');
  const targetMilestone = options.milestone || null; // e.g., 'M1', 'M2', 'M3', 'M4', 'M5'
  const targetFeature = options.feature || null;     // e.g., 'F1', 'F5', etc.

  console.log('\n================================================================================');
  console.log('🧪 RUNNING TEST 51: PIGFLY BRAND, ANTI-OVERLAP & ZERO-STK AUDIT');
  if (targetMilestone) console.log(`   Scope filter: Milestone ${targetMilestone}`);
  if (targetFeature) console.log(`   Scope filter: Feature ${targetFeature}`);
  console.log('================================================================================\n');

  const results = {};
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function runCheck(featureId, milestone, description, testFn) {
    if (targetMilestone && targetMilestone.toUpperCase() !== milestone.toUpperCase()) return;
    if (targetFeature && targetFeature.toUpperCase() !== featureId.toUpperCase()) return;

    totalTests++;
    try {
      testFn();
      results[featureId] = { pass: true, milestone, description };
      passedTests++;
      console.log(`  ✅ [PASS] [${milestone}] ${featureId}: ${description}`);
    } catch (err) {
      results[featureId] = { pass: false, milestone, description, error: err.message };
      failedTests++;
      console.log(`  ❌ [FAIL] [${milestone}] ${featureId}: ${description}`);
      console.log(`      Reason: ${err.message}`);
    }
  }

  // =========================================================================
  // MILESTONE M1: BRAND SYNC & DOCS BLUEPRINT (F1, F2, F3)
  // =========================================================================

  runCheck('F1', 'M1', "Brand Identity PigFly in app.json, strings.ts & login.tsx", () => {
    // 1. app.json
    const appJsonPath = path.join(root, 'app.json');
    assert.ok(fs.existsSync(appJsonPath), 'app.json must exist');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    assert.strictEqual(appJson.expo.name, 'PigFly', `app.json expo.name must be 'PigFly' (was: '${appJson.expo.name}')`);
    assert.strictEqual(appJson.expo.slug, 'pigfly', `app.json expo.slug must be 'pigfly' (was: '${appJson.expo.slug}')`);
    
    const iosCameraDesc = appJson.expo.ios?.infoPlist?.NSCameraUsageDescription || '';
    const iosPhotoDesc = appJson.expo.ios?.infoPlist?.NSPhotoLibraryUsageDescription || '';
    assert.ok(iosCameraDesc.includes('PigFly'), `iOS NSCameraUsageDescription must reference 'PigFly'`);
    assert.ok(iosPhotoDesc.includes('PigFly'), `iOS NSPhotoLibraryUsageDescription must reference 'PigFly'`);

    // 2. strings.ts
    const stringsPath = path.join(root, 'src', 'constants', 'strings.ts');
    assert.ok(fs.existsSync(stringsPath), 'src/constants/strings.ts must exist');
    const stringsCode = fs.readFileSync(stringsPath, 'utf8');
    assert.ok(stringsCode.includes("appName: 'PigFly'") || stringsCode.includes('appName: "PigFly"'), "strings.ts must define appName as 'PigFly'");
    assert.ok(stringsCode.includes('promptShouldIBuy') && stringsCode.includes('PigFly'), "strings.ts promptShouldIBuy must reference 'PigFly'");
    assert.ok(stringsCode.includes('coachSectionTitle') && stringsCode.includes('PIGFLY'), "strings.ts coachSectionTitle must reference 'PIGFLY'");

    // 3. login.tsx
    const loginPath = path.join(root, 'app', '(auth)', 'login.tsx');
    assert.ok(fs.existsSync(loginPath), 'app/(auth)/login.tsx must exist');
    const loginCode = fs.readFileSync(loginPath, 'utf8');
    assert.ok(loginCode.includes('PigFly'), "login.tsx must render brand name 'PigFly'");
    assert.ok(/PigFly\s*©\s*2026/.test(loginCode) || (loginCode.includes('PigFly') && loginCode.includes('2026')), "login.tsx must render copyright 'PigFly © 2026'");
  });

  runCheck('F2', 'M1', "Slogan 'PigFly: Tiết kiệm – Duy trì – Sinh lời bền vững' across system", () => {
    const stringsPath = path.join(root, 'src', 'constants', 'strings.ts');
    const stringsCode = fs.readFileSync(stringsPath, 'utf8');
    assert.ok(
      /Tiết kiệm\s*[–\-\•]\s*Duy trì\s*[–\-\•]\s*Sinh lời bền vững/.test(stringsCode),
      "strings.ts tagline must include 'Tiết kiệm – Duy trì – Sinh lời bền vững'"
    );
    assert.ok(
      stringsCode.includes('PigFly: Tiết kiệm') || stringsCode.includes('Sinh lời bền vững'),
      "strings.ts must define official slogan with PigFly"
    );

    const loginPath = path.join(root, 'app', '(auth)', 'login.tsx');
    const loginCode = fs.readFileSync(loginPath, 'utf8');
    assert.ok(
      /Tiết kiệm\s*[–\-\•]\s*Duy trì\s*[–\-\•]\s*Sinh lời bền vững/.test(loginCode),
      "login.tsx must display slogan 'Tiết kiệm – Duy trì – Sinh lời bền vững'"
    );
  });

  runCheck('F3', 'M1', "Squad Nuôi Heo PigFly & seamless storage migration in squadStore.ts", () => {
    const squadStorePath = path.join(root, 'src', 'store', 'squadStore.ts');
    assert.ok(fs.existsSync(squadStorePath), 'squadStore.ts must exist');
    const squadStoreCode = fs.readFileSync(squadStorePath, 'utf8');

    assert.ok(squadStoreCode.includes('Squad Nuôi Heo PigFly'), "squadStore.ts default squad name must be 'Squad Nuôi Heo PigFly'");
    assert.ok(squadStoreCode.includes('PigFly Bot'), "squadStore.ts bot sender must be 'PigFly Bot'");
    assert.ok(squadStoreCode.includes('@pigfly_squad_room_v1'), "squadStore.ts must use key '@pigfly_squad_room_v1'");
    assert.ok(squadStoreCode.includes('@pigpo_squad_room_v1'), "squadStore.ts must support migration fallback for '@pigpo_squad_room_v1'");

    // Mascot export compatibility
    const mascotPath = path.join(root, 'src', 'components', 'mascot', 'PigBoMascot.tsx');
    assert.ok(fs.existsSync(mascotPath), 'PigBoMascot.tsx must exist');
    const mascotCode = fs.readFileSync(mascotPath, 'utf8');
    assert.ok(mascotCode.includes('PigFlyMascot') || mascotCode.includes('PigBoMascot'), "PigBoMascot.tsx must export mascot component");
  });

  // =========================================================================
  // MILESTONE M2: LAYOUT ANTI-OVERLAP (5 TABS) (F5, F6, F7)
  // =========================================================================

  runCheck('F5', 'M2', "Tab Home Greeting Header separation & zero occlusion of 'ĐÃ CHI HÔM NAY'", () => {
    const journalPath = path.join(root, 'src', 'components', 'views', 'JournalView.tsx');
    assert.ok(fs.existsSync(journalPath), 'JournalView.tsx must exist');
    const journalCode = fs.readFileSync(journalPath, 'utf8');

    assert.ok(!journalCode.includes('allowanceMascotWrapper'), "JournalView.tsx must eliminate 'allowanceMascotWrapper'");
    assert.ok(!/top:\s*-16/.test(journalCode), "JournalView.tsx must eliminate 'top: -16' negative overlap");
    assert.ok(journalCode.includes('ĐÃ CHI HÔM NAY'), "JournalView.tsx must preserve 'ĐÃ CHI HÔM NAY'");

    const hasMascotInHeader = 
      (journalCode.includes('userNameRow') && (journalCode.includes('PigBoMascot') || journalCode.includes('PigFlyMascot'))) ||
      (journalCode.includes('headerLeft') && (journalCode.includes('PigBoMascot') || journalCode.includes('PigFlyMascot')));
    assert.ok(hasMascotInHeader, "JournalView.tsx must place mascot in Greeting Header beside streak");
  });

  runCheck('F6', 'M2', "Tab Camera 4:5 squircle clean viewfinder & zero hanging mascot", () => {
    const cameraPath = path.join(root, 'app', '(main)', 'index.tsx');
    assert.ok(fs.existsSync(cameraPath), 'app/(main)/index.tsx must exist');
    const cameraCode = fs.readFileSync(cameraPath, 'utf8');

    assert.ok(!cameraCode.includes('mascotCameraHeaderWrapper'), "app/(main)/index.tsx must eliminate 'mascotCameraHeaderWrapper'");
    assert.ok(!/marginBottom:\s*-16/.test(cameraCode), "app/(main)/index.tsx must eliminate 'marginBottom: -16' top intrusion on viewfinder");
    assert.ok(cameraCode.includes('viewfinderContainer') && cameraCode.includes('viewfinder'), "app/(main)/index.tsx must preserve clean squircle viewfinder");
  });

  runCheck('F7', 'M2', "Tab Stats & Chat container standardization (0% chart/text overlap)", () => {
    const statsPath = path.join(root, 'src', 'components', 'views', 'StatsView.tsx');
    const statsCode = fs.readFileSync(statsPath, 'utf8');
    assert.ok(!/top:\s*-[0-9]+/.test(statsCode), "StatsView.tsx must not use negative absolute top coordinates over charts");

    const squadViewPath = path.join(root, 'src', 'components', 'chat', 'SquadLocketView.tsx');
    const squadViewCode = fs.readFileSync(squadViewPath, 'utf8');
    assert.ok(squadViewCode.includes('emptyHero') && squadViewCode.includes('memberCard'), "SquadLocketView.tsx must place mascots inside bounded flex containers");
  });

  // =========================================================================
  // MILESTONE M3: PROFILE BUDGET CARD CLEANUP (F8)
  // =========================================================================

  runCheck('F8', 'M3', "Profile Budget Card removal of 'currentUnitObj' and '~ khoảng 1 ly trà sữa'", () => {
    const budgetCardPath = path.join(root, 'src', 'components', 'profile', 'BudgetSettingsCard.tsx');
    assert.ok(fs.existsSync(budgetCardPath), 'BudgetSettingsCard.tsx must exist');
    const budgetCardCode = fs.readFileSync(budgetCardPath, 'utf8');

    assert.ok(!budgetCardCode.includes('currentUnitObj'), "BudgetSettingsCard.tsx must remove 'currentUnitObj' logic");
    assert.ok(!budgetCardCode.includes('unitBadgePill'), "BudgetSettingsCard.tsx must remove 'unitBadgePill' element in Spotlight Card");
    assert.ok(!budgetCardCode.includes('ly trà sữa'), "BudgetSettingsCard.tsx must remove '~ khoảng 1 ly trà sữa' hardcoded badge");
    assert.ok(budgetCardCode.includes('Hôm nay tiêu được'), "BudgetSettingsCard.tsx must preserve exact title 'Hôm nay tiêu được'");
    assert.ok(budgetCardCode.includes('/ ngày') && budgetCardCode.includes('•••• đ'), "BudgetSettingsCard.tsx must display '[Số tiền] đ / ngày' and support privacy mask '•••• đ'");
  });

  // =========================================================================
  // MILESTONE M4: SETTINGS SECURITY & ANTI-JUNK (F9, F10, F11, F12)
  // =========================================================================

  runCheck('F9', 'M4', "Settings LockScreen card removal of 'Đang ghim' pill and 'Trừ ngầm' jargon", () => {
    const lockCardPath = path.join(root, 'src', 'components', 'profile', 'LockScreenSettingsCard.tsx');
    assert.ok(fs.existsSync(lockCardPath), 'LockScreenSettingsCard.tsx must exist');
    const lockCardCode = fs.readFileSync(lockCardPath, 'utf8');

    assert.ok(!lockCardCode.includes('Đang ghim'), "LockScreenSettingsCard.tsx must eliminate redundant 'Đang ghim' pill");
    assert.ok(!lockCardCode.includes('Trừ ngầm'), "LockScreenSettingsCard.tsx must eliminate toxic 'Trừ ngầm' jargon");
  });

  runCheck('F10', 'M4', "Settings LockScreen security declaration (100% Local Processing & Zero Bank Tampering)", () => {
    const lockCardPath = path.join(root, 'src', 'components', 'profile', 'LockScreenSettingsCard.tsx');
    const lockCardCode = fs.readFileSync(lockCardPath, 'utf8');

    assert.ok(lockCardCode.includes('Local Processing') || lockCardCode.includes('cục bộ'), "LockScreenSettingsCard.tsx must declare 100% Local Processing");
    assert.ok(
      lockCardCode.includes('Không Can Thiệp Tiền Thật') ||
      lockCardCode.includes('không có quyền thực hiện giao dịch trừ tiền thật') ||
      lockCardCode.includes('không liên kết tài khoản ngân hàng'),
      "LockScreenSettingsCard.tsx must declare zero bank tampering / non-custodial commitment"
    );
  });

  runCheck('F11', 'M4', "Settings Bank Notification Zero-STK Shield & 100% OTP Blocking", () => {
    const bankCardPath = path.join(root, 'src', 'components', 'profile', 'BankNotificationSettingsCard.tsx');
    const bankModalPath = path.join(root, 'src', 'components', 'profile', 'BankNotificationSettingsModal.tsx');
    assert.ok(fs.existsSync(bankCardPath), 'BankNotificationSettingsCard.tsx must exist');
    assert.ok(fs.existsSync(bankModalPath), 'BankNotificationSettingsModal.tsx must exist');

    const bankCombined = fs.readFileSync(bankCardPath, 'utf8') + '\n' + fs.readFileSync(bankModalPath, 'utf8');
    assert.ok(bankCombined.includes('Zero-STK') || bankCombined.includes('Không lưu số tài khoản'), "Bank notification must declare Zero-STK Shield");
    assert.ok(bankCombined.includes('100% OTP') || bankCombined.includes('Chặn 100% OTP'), "Bank notification must declare 100% OTP blocking");
    assert.ok(bankCombined.includes('Local Processing') || bankCombined.includes('bộ nhớ máy') || bankCombined.includes('RAM'), "Bank notification must declare in-memory / local processing");
  });

  runCheck('F12', 'M4', "Settings VietQR NAPAS/EMVCo standard & Kepi Không Giữ Tiền commitment", () => {
    const qrCardPath = path.join(root, 'src', 'components', 'profile', 'QRPaySettingsCard.tsx');
    assert.ok(fs.existsSync(qrCardPath), 'QRPaySettingsCard.tsx must exist');
    const qrCardCode = fs.readFileSync(qrCardPath, 'utf8');

    assert.ok(qrCardCode.includes('NAPAS') && qrCardCode.includes('EMVCo'), "QRPaySettingsCard.tsx must declare NAPAS & EMVCo compliance");
    assert.ok(
      qrCardCode.includes('không giữ tiền') || qrCardCode.includes('Không Giữ Tiền') || qrCardCode.includes('không phải là ví điện tử'),
      "QRPaySettingsCard.tsx must declare Kepi does not hold user money (non-custodial)"
    );
  });

  // =========================================================================
  // SUMMARY REPORT
  // =========================================================================
  console.log('\n--------------------------------------------------------------------------------');
  console.log(`📊 TEST 51 SUMMARY: ${passedTests}/${totalTests} CHECKS PASSED`);
  if (failedTests > 0) {
    console.log(`⚠️  ${failedTests} CHECKS FAILED OR PENDING IMPLEMENTATION.`);
  } else {
    console.log('🎉 100% CHECKS PASSED CLEANLY FOR TARGET SCOPE!');
  }
  console.log('--------------------------------------------------------------------------------\n');

  if (failedTests > 0) {
    const failSummary = Object.entries(results)
      .filter(([_, r]) => !r.pass)
      .map(([k, r]) => `[${k}] ${r.description} -> ${r.error}`)
      .join('\n');
    const error = new Error(`Test 51 failed with ${failedTests} failure(s):\n${failSummary}`);
    error.results = results;
    throw error;
  }

  return { success: true, results, passed: passedTests, total: totalTests };
}

// Support CLI flags: --milestone=M1, --feature=F5
if (require.main === module) {
  const args = process.argv.slice(2);
  let milestone = null;
  let feature = null;

  args.forEach(arg => {
    if (arg.startsWith('--milestone=')) milestone = arg.split('=')[1];
    if (arg.startsWith('--feature=')) feature = arg.split('=')[1];
  });

  try {
    runTest51({ milestone, feature });
    process.exit(0);
  } catch (err) {
    // If running in CLI, report cleanly and exit 1
    process.exit(1);
  }
}

module.exports = { runTest51 };
