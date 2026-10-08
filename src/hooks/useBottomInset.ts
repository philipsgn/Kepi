import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  calculateBottomInset,
  CONTENT_EXTRA_BREATHING_ROOM,
  TAB_BAR_BOTTOM_MARGIN,
  TAB_BAR_HEIGHT,
} from '../utils/layoutUtils';

export {
  calculateBottomInset,
  CONTENT_EXTRA_BREATHING_ROOM,
  TAB_BAR_BOTTOM_MARGIN,
  TAB_BAR_HEIGHT,
};

/**
 * Hook tính toán khoảng đệm đáy chuẩn xác cho toàn bộ ứng dụng.
 * Giải quyết dứt điểm vấn đề nội dung hoặc nút bấm ở chân trang bị che khuất
 * bởi thanh điều hướng nổi (FloatingPillTabBar) hoặc Home Indicator.
 */
export const useBottomInset = (extraPadding: number = CONTENT_EXTRA_BREATHING_ROOM) => {
  const insets = useSafeAreaInsets();
  const calculated = calculateBottomInset(insets.bottom, extraPadding);

  return {
    insets,
    ...calculated,
  };
};
