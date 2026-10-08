export const TAB_BAR_HEIGHT = 58;
export const TAB_BAR_BOTTOM_MARGIN = 10;
export const CONTENT_EXTRA_BREATHING_ROOM = 16;

/**
 * Hàm tính toán khoảng đệm đáy chuẩn xác cho toàn bộ ứng dụng (Pure Function).
 * Đảm bảo các màn hình cuộn không bao giờ bị che lấp nút bấm hoặc dòng chữ cuối cùng
 * bởi thanh điều hướng nổi (FloatingPillTabBar) hoặc thanh Home Indicator.
 *
 * @param safeBottomInset insets.bottom từ react-native-safe-area-context
 * @param extraPadding Khoảng đệm thở bổ sung (mặc định 16px)
 */
export function calculateBottomInset(
  safeBottomInset: number = 0,
  extraPadding: number = CONTENT_EXTRA_BREATHING_ROOM
) {
  const tabBarBottom = Math.max(safeBottomInset, 8) + TAB_BAR_BOTTOM_MARGIN;
  const contentBottomPadding = TAB_BAR_HEIGHT + tabBarBottom + extraPadding;

  return {
    tabBarHeight: TAB_BAR_HEIGHT,
    tabBarBottom,
    contentBottomPadding,
    bottomInset: contentBottomPadding,
  };
}
