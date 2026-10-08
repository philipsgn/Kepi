import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Transaction } from '../types/database';
import { formatVND } from '../utils/currency';

export interface MonthlyReportParams {
  userName: string;
  monthLabel: string; // e.g. "10/2026"
  transactions: Transaction[];
  totalSpent: number;
  totalIncome: number;
  savedMoney: number;
}

/**
 * SINH NỘI DUNG TỆP CSV VỚI BOM UTF-8 (\uFEFF)
 * Tương thích 100% với Microsoft Excel và Google Sheets tiếng Việt có dấu
 */
export function generateTransactionsCSV(
  transactions: Transaction[],
  monthFilter?: string
): string {
  // Lọc theo tháng nếu có (định dạng YYYY-MM)
  const filtered = monthFilter
    ? transactions.filter((tx) => tx.occurred_at.startsWith(monthFilter))
    : transactions;

  // BOM UTF-8 để Microsoft Excel nhận diện đúng encoding
  const BOM = '\uFEFF';
  const headers = [
    'Mã giao dịch',
    'Ngày giờ',
    'Loại',
    'Số tiền (VND)',
    'Danh mục',
    'Mô tả',
    'Phương thức',
    'Nguồn ghi',
    'Trạng thái',
  ];

  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = filtered.map((tx) => {
    const typeLabel = tx.type === 'EXPENSE' ? 'Chi tiêu' : 'Thu nhập';
    const methodLabel =
      tx.payment_method === 'BANK'
        ? 'Chuyển khoản / QR'
        : tx.payment_method === 'CASH'
        ? 'Tiền mặt'
        : 'Khác';
    const statusLabel = tx.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Chờ duyệt';
    const dateFormatted = new Date(tx.occurred_at).toLocaleString('vi-VN');

    return [
      escapeCSV(tx.id),
      escapeCSV(dateFormatted),
      escapeCSV(typeLabel),
      escapeCSV(tx.amount),
      escapeCSV(tx.category),
      escapeCSV(tx.description || ''),
      escapeCSV(methodLabel),
      escapeCSV(tx.source),
      escapeCSV(statusLabel),
    ].join(',');
  });

  return BOM + [headers.join(','), ...rows].join('\r\n');
}

/**
 * XUẤT VÀ CHIA SẺ TỆP CSV QUA NATIVE SHARE SHEET
 */
export async function exportCSVAsync(
  transactions: Transaction[],
  monthFilter?: string
): Promise<{ success: boolean; uri?: string; error?: string }> {
  try {
    const csvContent = generateTransactionsCSV(transactions, monthFilter);
    const dateSlug = monthFilter || 'all';
    const fileName = `kepi_transactions_${dateSlug}_${Date.now()}.csv`;
    const targetFile = new File(Paths.cache, fileName);

    targetFile.write(csvContent);

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(targetFile.uri, {
        mimeType: 'text/csv',
        dialogTitle: 'Lưu hoặc chia sẻ tệp CSV chi tiêu',
        UTI: 'public.comma-separated-values-text',
      });
    }

    return { success: true, uri: targetFile.uri };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi xuất tệp CSV';
    console.warn('[ExportService] Error exporting CSV:', msg);
    return { success: false, error: msg };
  }
}

/**
 * SINH MẪU HTML BÁO CÁO THÁNG CHUẨN A4 PHONG CÁCH KEPI
 */
export function generateMonthlyReportHTML(params: MonthlyReportParams): string {
  const { userName, monthLabel, transactions, totalSpent, totalIncome, savedMoney } = params;

  // Tính cơ cấu danh mục
  const categoryMap: { [cat: string]: number } = {};
  transactions
    .filter((t) => t.type === 'EXPENSE' && t.status === 'CONFIRMED')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const categoryRows = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amount]) => {
      const percentage = totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : '0';
      return `
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #EAEAEA; font-weight: 500;">${cat}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #EAEAEA; text-align: right; font-weight: 600; color: #1E231E;">${formatVND(amount)}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #EAEAEA; text-align: right; color: #7A847A;">${percentage}%</td>
        </tr>
      `;
    })
    .join('');

  const transactionRows = transactions
    .slice(0, 80) // Giới hạn 80 giao dịch cho độ dài trang chuẩn
    .map((tx) => {
      const dateStr = new Date(tx.occurred_at).toLocaleDateString('vi-VN');
      const isExpense = tx.type === 'EXPENSE';
      const amountColor = isExpense ? '#C86D51' : '#2BD05B';
      const amountPrefix = isExpense ? '-' : '+';

      return `
        <tr>
          <td style="padding: 8px 10px; border-bottom: 1px solid #F0F0F0; font-size: 13px; color: #666;">${dateStr}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #F0F0F0; font-size: 13px; font-weight: 500;">${tx.description || tx.category}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #F0F0F0; font-size: 12px; color: #888;">${tx.category}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #F0F0F0; font-size: 13px; font-weight: 600; text-align: right; color: ${amountColor};">
            ${amountPrefix}${formatVND(tx.amount)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Báo Cáo Chi Tiêu Kepi — ${monthLabel}</title>
  <style>
    @page { margin: 20mm; size: A4 portrait; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1E231E; line-height: 1.5; margin: 0; padding: 24px; background: #FFF; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #E59844; padding-bottom: 16px; margin-bottom: 24px; }
    .brand-title { font-size: 26px; font-weight: 800; color: #0E1620; margin: 0; letter-spacing: -0.5px; }
    .brand-tagline { font-size: 11px; font-weight: 700; color: #E59844; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
    .report-info { text-align: right; font-size: 13px; color: #7A847A; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 28px; }
    .summary-card { background: #FAF6EC; border-radius: 12px; padding: 14px 16px; border: 1px solid rgba(229,152,68,0.25); }
    .card-label { font-size: 12px; font-weight: 600; color: #7A847A; text-transform: uppercase; margin-bottom: 6px; }
    .card-value { font-size: 20px; font-weight: 700; color: #1E231E; margin: 0; font-variant-numeric: tabular-nums; }
    .section-title { font-size: 15px; font-weight: 700; color: #0E1620; margin-top: 24px; margin-bottom: 12px; border-left: 4px solid #E59844; padding-left: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
    th { background: #F8F9FA; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; color: #555; border-bottom: 2px solid #EAEAEA; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #EEE; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="brand-title">Kepi</h1>
      <div class="brand-tagline">Keep What Matters</div>
    </div>
    <div class="report-info">
      <div><strong>Báo Cáo Chi Tiêu Tháng ${monthLabel}</strong></div>
      <div>Người dùng: <strong>${userName}</strong></div>
      <div>Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</div>
    </div>
  </div>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="card-label">Tổng Chi Tiêu</div>
      <div class="card-value" style="color: #C86D51;">${formatVND(totalSpent)}</div>
    </div>
    <div class="summary-card">
      <div class="card-label">Tổng Thu Nhập</div>
      <div class="card-value" style="color: #2BD05B;">${formatVND(totalIncome)}</div>
    </div>
    <div class="summary-card">
      <div class="card-label">Tiền Đã Cứu (Không Mua)</div>
      <div class="card-value" style="color: #E59844;">${formatVND(savedMoney)}</div>
    </div>
  </div>

  <div class="section-title">CƠ CẤU CHI TIÊU THEO DANH MỤC</div>
  <table>
    <thead>
      <tr>
        <th>Danh mục</th>
        <th style="text-align: right;">Số tiền</th>
        <th style="text-align: right;">Tỷ trọng</th>
      </tr>
    </thead>
    <tbody>
      ${categoryRows || '<tr><td colspan="3" style="text-align: center; padding: 14px; color: #999;">Chưa có dữ liệu chi tiêu</td></tr>'}
    </tbody>
  </table>

  <div class="section-title">DANH SÁCH GIAO DỊCH CHI TIẾT</div>
  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Ngày</th>
        <th>Nội dung</th>
        <th style="width: 22%;">Danh mục</th>
        <th style="width: 25%; text-align: right;">Số tiền</th>
      </tr>
    </thead>
    <tbody>
      ${transactionRows || '<tr><td colspan="4" style="text-align: center; padding: 14px; color: #999;">Chưa có giao dịch nào</td></tr>'}
    </tbody>
  </table>

  <div class="footer">
    Báo cáo tài chính tự động xuất từ Ứng dụng Kepi — Keep What Matters · Dữ liệu bảo mật cục bộ
  </div>
</body>
</html>
  `;
}

/**
 * XUẤT VÀ CHIA SẺ BÁO CÁO THÁNG DƯỚI DẠNG PDF A4
 */
export async function exportMonthlyReportPDFAsync(
  params: MonthlyReportParams
): Promise<{ success: boolean; uri?: string; error?: string }> {
  try {
    const html = generateMonthlyReportHTML(params);
    const pdf = await Print.printToFileAsync({ html, base64: false });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(pdf.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Xuất Báo cáo Kepi Tháng ${params.monthLabel}`,
        UTI: 'com.adobe.pdf',
      });
    }

    return { success: true, uri: pdf.uri };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Lỗi xuất tệp PDF';
    console.warn('[ExportService] Error exporting PDF:', msg);
    return { success: false, error: msg };
  }
}
