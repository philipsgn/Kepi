/**
 * HÀM ĐỊNH DẠNG THỜI GIAN TƯƠNG ĐỐI TIẾNG VIỆT CHO CUỘN LỊCH SỬ LOCKET
 */

export function formatRelativeTime(isoString: string): string {
  try {
    const targetDate = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - targetDate.getTime();

    if (diffMs < 0) return 'Vừa xong';

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 45) {
      return 'Vừa xong';
    }
    if (diffMins < 60) {
      return `${diffMins} phút trước`;
    }

    const hours = String(targetDate.getHours()).padStart(2, '0');
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');

    // Cùng ngày hôm nay
    const isToday =
      targetDate.getDate() === now.getDate() &&
      targetDate.getMonth() === now.getMonth() &&
      targetDate.getFullYear() === now.getFullYear();

    if (isToday) {
      return `Hôm nay ${hours}:${minutes}`;
    }

    // Hôm qua
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      targetDate.getDate() === yesterday.getDate() &&
      targetDate.getMonth() === yesterday.getMonth() &&
      targetDate.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return `Hôm qua ${hours}:${minutes}`;
    }

    if (diffDays < 7) {
      return `${diffDays} ngày trước • ${hours}:${minutes}`;
    }

    const day = String(targetDate.getDate()).padStart(2, '0');
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    return `${day}/${month} • ${hours}:${minutes}`;
  } catch {
    return 'Gần đây';
  }
}
