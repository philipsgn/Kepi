/**
 * TIỆN ÍCH PHÂN TÍCH DỮ LIỆU TÀI CHÍNH (DATA ANALYST UTILS)
 * Phong cách "Ấm, tĩnh, sang" — Kepi
 * Cung cấp các công thức tính toán KPI Sức Khỏe Tài Chính:
 * 1. Tỷ lệ Tiết kiệm (Savings Rate %)
 * 2. Tốc độ Đốt tiền/ngày (Daily Burn Rate)
 * 3. Dự báo Số ngày trụ được (Runway / Burnout Forecast)
 * 4. Lời nhận định tự động của Data Analyst
 */

export interface SavingsRateResult {
  rate: number; // Tỷ lệ % (-100 đến 100)
  tier: 'EXCELLENT' | 'STABLE' | 'WARNING' | 'DEFICIT';
  label: string;
  colorType: 'success' | 'primary' | 'warning' | 'danger';
}

export interface BurnRateResult {
  dailyBurn: number; // Số tiền đốt trung bình / ngày
  safeDailyFloor: number; // Mức sàn an toàn mỗi ngày
  comparisonPercent: number; // % cao hơn hoặc thấp hơn mức an toàn
  isOverburning: boolean;
  formattedText: string;
}

export interface RunwayResult {
  daysRemainingInMonth: number;
  projectedRunwayDays: number; // Số ngày có thể trụ được với tốc độ hiện tại
  isSafeToEndOfMonth: boolean;
  exhaustionDay?: number; // Ngày trong tháng sẽ bị cháy túi (nếu có)
  statusText: string;
}

export interface FinancialAnalyticsKPI {
  savingsRate: SavingsRateResult;
  burnRate: BurnRateResult;
  runway: RunwayResult;
  analystInsight: string;
}

/**
 * 1. TÍNH TỶ LỆ TIẾT KIỆM (SAVINGS RATE %)
 * Công thức: (Tổng Thu - Tổng Chi) / Tổng Thu * 100%
 */
export function calculateSavingsRate(totalIncome: number, totalSpent: number): SavingsRateResult {
  if (totalIncome <= 0) {
    if (totalSpent > 0) {
      return {
        rate: -100,
        tier: 'DEFICIT',
        label: 'Thâm hụt (Chưa có thu nhập)',
        colorType: 'danger',
      };
    }
    return {
      rate: 0,
      tier: 'STABLE',
      label: 'Cân bằng',
      colorType: 'primary',
    };
  }

  const netSaved = totalIncome - totalSpent;
  const rate = Math.round((netSaved / totalIncome) * 100);

  if (rate >= 40) {
    return {
      rate,
      tier: 'EXCELLENT',
      label: 'Xuất sắc (> 40%)',
      colorType: 'success',
    };
  } else if (rate >= 20) {
    return {
      rate,
      tier: 'STABLE',
      label: 'Ổn định (20% – 40%)',
      colorType: 'primary',
    };
  } else if (rate >= 0) {
    return {
      rate,
      tier: 'WARNING',
      label: 'Cần chú ý (< 20%)',
      colorType: 'warning',
    };
  } else {
    return {
      rate,
      tier: 'DEFICIT',
      label: 'Thâm hụt chi tiêu',
      colorType: 'danger',
    };
  }
}

/**
 * 2. TÍNH TỐC ĐỘ ĐỐT TIỀN TRUNG BÌNH MỖI NGÀY (DAILY BURN RATE)
 */
export function calculateDailyBurnRate(
  totalSpent: number,
  monthKey: string,
  baseDailyBudget: number = 150000
): BurnRateResult {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const now = new Date();
  const isCurrentMonth =
    now.getFullYear() === year && now.getMonth() + 1 === month;

  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const elapsedDays = isCurrentMonth
    ? Math.max(1, now.getDate())
    : totalDaysInMonth;

  const dailyBurn = Math.round(totalSpent / elapsedDays);
  const safeDailyFloor = Math.max(50000, baseDailyBudget);

  const diff = dailyBurn - safeDailyFloor;
  const comparisonPercent = Math.round((diff / safeDailyFloor) * 100);
  const isOverburning = comparisonPercent > 10;

  let formattedText = '';
  if (isOverburning) {
    formattedText = `Đốt nhanh hơn ${comparisonPercent}% so với định mức`;
  } else if (comparisonPercent < -10) {
    formattedText = `Tiết chế tốt, chậm hơn ${Math.abs(comparisonPercent)}% định mức`;
  } else {
    formattedText = `Đang duy trì đúng định mức cho phép`;
  }

  return {
    dailyBurn,
    safeDailyFloor,
    comparisonPercent,
    isOverburning,
    formattedText,
  };
}

/**
 * 3. DỰ BÁO SỐ NGÀY TRỤ ĐƯỢC (RUNWAY FORECAST)
 */
export function calculateRunwayForecast(
  remainingBudget: number,
  dailyBurn: number,
  monthKey: string
): RunwayResult {
  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const now = new Date();
  const isCurrentMonth =
    now.getFullYear() === year && now.getMonth() + 1 === month;
  const totalDaysInMonth = new Date(year, month, 0).getDate();
  const currentDay = now.getDate();

  const daysRemainingInMonth = isCurrentMonth
    ? Math.max(0, totalDaysInMonth - currentDay)
    : 0;

  if (!isCurrentMonth) {
    return {
      daysRemainingInMonth: 0,
      projectedRunwayDays: 0,
      isSafeToEndOfMonth: true,
      statusText: 'Đã hoàn thành chu kỳ tháng',
    };
  }

  if (remainingBudget <= 0) {
    return {
      daysRemainingInMonth,
      projectedRunwayDays: 0,
      isSafeToEndOfMonth: false,
      exhaustionDay: currentDay,
      statusText: 'Đã vượt quá hạn mức ví',
    };
  }

  if (dailyBurn <= 0) {
    return {
      daysRemainingInMonth,
      projectedRunwayDays: 999,
      isSafeToEndOfMonth: true,
      statusText: 'Về đích an toàn đến cuối tháng',
    };
  }

  const projectedRunwayDays = Math.floor(remainingBudget / dailyBurn);
  const isSafeToEndOfMonth = projectedRunwayDays >= daysRemainingInMonth;

  if (isSafeToEndOfMonth) {
    return {
      daysRemainingInMonth,
      projectedRunwayDays,
      isSafeToEndOfMonth: true,
      statusText: `Về đích an toàn (Dự phòng thêm ${projectedRunwayDays - daysRemainingInMonth} ngày)`,
    };
  } else {
    const exhaustionDay = Math.min(totalDaysInMonth, currentDay + projectedRunwayDays);
    return {
      daysRemainingInMonth,
      projectedRunwayDays,
      isSafeToEndOfMonth: false,
      exhaustionDay,
      statusText: `Nguy cơ cạn ví vào ngày ${exhaustionDay}/${month}`,
    };
  }
}

/**
 * 4. TỔNG HỢP KPI & SINH LỜI NHẬN ĐỊNH CỦA DATA ANALYST
 */
export function computeFinancialAnalyticsKPI(params: {
  totalIncome: number;
  totalSpent: number;
  remainingBudget: number;
  monthKey: string;
  baseDailyBudget?: number;
}): FinancialAnalyticsKPI {
  const { totalIncome, totalSpent, remainingBudget, monthKey, baseDailyBudget = 150000 } = params;

  const savingsRate = calculateSavingsRate(totalIncome, totalSpent);
  const burnRate = calculateDailyBurnRate(totalSpent, monthKey, baseDailyBudget);
  const runway = calculateRunwayForecast(remainingBudget, burnRate.dailyBurn, monthKey);

  // Sinh lời nhận định Data Analyst
  let analystInsight = '';
  if (savingsRate.tier === 'EXCELLENT' && runway.isSafeToEndOfMonth) {
    analystInsight = `Phong độ tài chính tuyệt vời! Bạn đang giữ lại được ${savingsRate.rate}% thu nhập và nhịp độ chi tiêu cực kỳ bền vững đến hết tháng.`;
  } else if (burnRate.isOverburning) {
    analystInsight = `Cảnh báo tốc độ đốt: Bạn đang tiêu trung bình ${burnRate.dailyBurn.toLocaleString('vi-VN')} đ/ngày (vượt ${burnRate.comparisonPercent}% định mức). Hãy tiết chế các khoản mua sắm ngẫu hứng để ${runway.statusText.toLowerCase()}.`;
  } else if (!runway.isSafeToEndOfMonth && runway.exhaustionDay) {
    analystInsight = `Với nhịp độ hiện tại, ví sẽ chạm đáy vào ngày ${runway.exhaustionDay}. Hãy cắt giảm các khoản chi ngoài định mức ngay từ hôm nay.`;
  } else {
    analystInsight = `Bạn đang duy trì chi tiêu khá ổn định. Tỷ lệ tích lũy đạt ${savingsRate.rate}% với tốc độ đốt trong tầm kiểm soát an toàn.`;
  }

  return {
    savingsRate,
    burnRate,
    runway,
    analystInsight,
  };
}
