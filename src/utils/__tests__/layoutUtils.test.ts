/**
 * UNIT TESTS CHO HÀM TÍNH TOÁN KHOẢNG ĐỆM ĐÁY (layoutUtils)
 */

declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void) => void;
declare const expect: (actual: any) => any;

import {
  CONTENT_EXTRA_BREATHING_ROOM,
  TAB_BAR_BOTTOM_MARGIN,
  TAB_BAR_HEIGHT,
  calculateBottomInset,
} from '../layoutUtils';

describe('calculateBottomInset layout calculations', () => {
  test('calculates correct bottom inset for modern iPhone with 34px bottom inset', () => {
    const result = calculateBottomInset(34);

    expect(result.tabBarHeight).toBe(TAB_BAR_HEIGHT); // 58
    expect(result.tabBarBottom).toBe(34 + TAB_BAR_BOTTOM_MARGIN); // 44
    expect(result.contentBottomPadding).toBe(
      TAB_BAR_HEIGHT + (34 + TAB_BAR_BOTTOM_MARGIN) + CONTENT_EXTRA_BREATHING_ROOM
    ); // 58 + 44 + 16 = 118
    expect(result.bottomInset).toBe(result.contentBottomPadding);
  });

  test('handles zero bottom inset safely with fallback 8px', () => {
    const result = calculateBottomInset(0);

    expect(result.tabBarBottom).toBe(8 + TAB_BAR_BOTTOM_MARGIN); // 18
    expect(result.contentBottomPadding).toBe(58 + 18 + 16); // 92
  });

  test('allows custom extraPadding', () => {
    const result = calculateBottomInset(34, 24);

    expect(result.contentBottomPadding).toBe(58 + 44 + 24); // 126
  });
});
