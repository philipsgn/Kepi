import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FileSpreadsheet, FileText, Download, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Strings } from '../../constants/strings';
import { exportCSVAsync, exportMonthlyReportPDFAsync } from '../../services/exportService';
import { Transaction } from '../../types/database';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

interface ExportReportCardProps {
  transactions: Transaction[];
  userName: string;
  totalSpent: number;
  totalIncome: number;
  savedMoney: number;
}

export const ExportReportCard: React.FC<ExportReportCardProps> = ({
  transactions,
  userName,
  totalSpent,
  totalIncome,
  savedMoney,
}) => {
  const { tokens } = useTheme();
  const [selectedRange, setSelectedRange] = useState<'CURRENT_MONTH' | 'ALL'>('CURRENT_MONTH');
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Month string YYYY-MM
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthLabel = `${now.getMonth() + 1}/${now.getFullYear()}`;

  const handleExportCSV = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExportingCSV(true);

    try {
      const monthFilter = selectedRange === 'CURRENT_MONTH' ? currentMonthKey : undefined;
      const res = await exportCSVAsync(transactions, monthFilter);

      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(Strings.profile.exportErrorTitle, res.error || 'Vui lòng thử lại sau.');
      }
    } catch (err) {
      Alert.alert(Strings.profile.exportErrorTitle, 'Không thể tạo tệp CSV lúc này.');
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleExportPDF = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExportingPDF(true);

    try {
      const monthFilter = selectedRange === 'CURRENT_MONTH' ? currentMonthKey : undefined;
      const filteredTxs = monthFilter
        ? transactions.filter((t) => t.occurred_at.startsWith(monthFilter))
        : transactions;

      const res = await exportMonthlyReportPDFAsync({
        userName: userName || 'Người thương phố cổ',
        monthLabel: selectedRange === 'CURRENT_MONTH' ? currentMonthLabel : 'Toàn Bộ Lịch Sử',
        transactions: filteredTxs,
        totalSpent,
        totalIncome,
        savedMoney,
      });

      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(Strings.profile.exportErrorTitle, res.error || 'Vui lòng thử lại sau.');
      }
    } catch (err) {
      Alert.alert(Strings.profile.exportErrorTitle, 'Không thể tạo báo cáo PDF lúc này.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: tokens.surface,
          borderColor: tokens.border,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <Download size={16} color={tokens.primary} style={styles.icon} />
        <Text style={[styles.sectionTitle, { color: tokens.textSub }]}>
          {Strings.profile.exportSectionTitle}
        </Text>
      </View>

      <Text style={[styles.subDesc, { color: tokens.textSub }]}>
        {Strings.profile.exportDesc}
      </Text>

      {/* Range Selector */}
      <View
        style={[
          styles.rangeToggleContainer,
          { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.rangeToggleBtn,
            selectedRange === 'CURRENT_MONTH' && {
              backgroundColor: tokens.surface,
              borderColor: tokens.primary,
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedRange('CURRENT_MONTH');
          }}
        >
          <Text
            style={[
              styles.rangeToggleText,
              {
                color:
                  selectedRange === 'CURRENT_MONTH'
                    ? tokens.primary
                    : tokens.textSub,
                fontWeight: selectedRange === 'CURRENT_MONTH' ? '700' : '500',
              },
            ]}
          >
            {Strings.profile.exportCurrentMonth} ({currentMonthLabel})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.rangeToggleBtn,
            selectedRange === 'ALL' && {
              backgroundColor: tokens.surface,
              borderColor: tokens.primary,
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedRange('ALL');
          }}
        >
          <Text
            style={[
              styles.rangeToggleText,
              {
                color: selectedRange === 'ALL' ? tokens.primary : tokens.textSub,
                fontWeight: selectedRange === 'ALL' ? '700' : '500',
              },
            ]}
          >
            {Strings.profile.exportAllHistory}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Export Buttons */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[
            styles.exportButton,
            { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
          ]}
          activeOpacity={0.75}
          onPress={handleExportCSV}
          disabled={isExportingCSV || isExportingPDF}
        >
          {isExportingCSV ? (
            <ActivityIndicator size="small" color={tokens.primary} />
          ) : (
            <>
              <FileSpreadsheet size={16} color={tokens.primary} />
              <Text style={[styles.exportButtonText, { color: tokens.text }]}>
                {Strings.profile.exportCSVBtn}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.exportButton,
            { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
          ]}
          activeOpacity={0.75}
          onPress={handleExportPDF}
          disabled={isExportingCSV || isExportingPDF}
        >
          {isExportingPDF ? (
            <ActivityIndicator size="small" color={tokens.primary} />
          ) : (
            <>
              <FileText size={16} color={tokens.primary} />
              <Text style={[styles.exportButtonText, { color: tokens.text }]}>
                {Strings.profile.exportPDFBtn}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  subDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  rangeToggleContainer: {
    flexDirection: 'row',
    borderRadius: radii.lg,
    padding: 3,
    marginBottom: 12,
    borderWidth: 1,
  },
  rangeToggleBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rangeToggleText: {
    fontSize: 12,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 6,
  },
  exportButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
