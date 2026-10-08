import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Check, ChevronRight, Edit3, Wallet } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Strings } from '../../constants/strings';
import { FavoriteUnit } from '../../types/database';
import { formatMaskedCurrency } from '../../utils/profileUtils';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

interface BudgetSettingsCardProps {
  monthlyIncome: number;
  monthlyFixedCosts: number;
  baseDailyBudget: number;
  favUnit: FavoriteUnit;
  isMasked?: boolean;
  onSaveBudgetSettings: (params: {
    monthlyIncome: number;
    monthlyFixedCosts: number;
    favUnit: FavoriteUnit;
  }) => void;
  onOpenFixedCostsModal?: () => void;
}

export const BudgetSettingsCard: React.FC<BudgetSettingsCardProps> = ({
  monthlyIncome,
  monthlyFixedCosts,
  baseDailyBudget,
  favUnit,
  isMasked = false,
  onSaveBudgetSettings,
  onOpenFixedCostsModal,
}) => {
  const { tokens } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [incomeInput, setIncomeInput] = useState(monthlyIncome.toString());
  const [selectedUnit, setSelectedUnit] = useState<FavoriteUnit>(favUnit);

  const handleStartEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIncomeInput(monthlyIncome.toString());
    setSelectedUnit(favUnit);
    setIsEditing(true);
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const parsedIncome = parseInt(incomeInput.replace(/\D/g, ''), 10) || 0;

    onSaveBudgetSettings({
      monthlyIncome: parsedIncome,
      monthlyFixedCosts,
      favUnit: selectedUnit,
    });
    setIsEditing(false);
  };

  const getUnitLabel = (unit: FavoriteUnit) => {
    switch (unit) {
      case 'ca_phe':
        return Strings.profile.unitCoffee;
      case 'tra_sua':
        return Strings.profile.unitBoba;
      case 'to_pho':
        return Strings.profile.unitPho;
      default:
        return Strings.profile.unitCoffee;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
      {/* 1. TIÊU ĐỀ KHỐI */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.iconBox, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
            <Wallet size={15} color={tokens.primary} strokeWidth={2.4} />
          </View>
          <Text style={[styles.sectionTitle, { color: tokens.text }]}>{Strings.profile.budgetSectionTitle}</Text>
        </View>

        {!isEditing ? (
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
            onPress={handleStartEdit}
            activeOpacity={0.8}
          >
            <Edit3 size={12} color={tokens.textSub} strokeWidth={2} />
            <Text style={[styles.editBtnText, { color: tokens.textSub }]}>Chỉnh sửa</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: tokens.primary }]}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Check size={13} color="#1B2733" strokeWidth={2.6} />
            <Text style={styles.saveBtnText}>Lưu</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2. NỘI DUNG HIỂN THỊ HOẶC FORM CHỈNH SỬA */}
      {!isEditing ? (
        <View style={styles.displayContent}>
          {/* Hàng 1: Thu nhập */}
          <View style={[styles.infoRow, { borderBottomColor: tokens.border }]}>
            <Text style={[styles.infoLabel, { color: tokens.textMuted }]}>{Strings.profile.monthlyIncome}</Text>
            <Text style={[styles.infoValue, { color: tokens.text }]}>
              {formatMaskedCurrency(monthlyIncome, isMasked)}
            </Text>
          </View>

          {/* Hàng 2: Chi phí cố định & Nút mở Modal chi tiết */}
          <TouchableOpacity
            style={[styles.infoRowClickable, { borderBottomColor: tokens.border }]}
            onPress={() => {
              if (onOpenFixedCostsModal) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onOpenFixedCostsModal();
              }
            }}
            activeOpacity={0.7}
          >
            <View>
              <Text style={[styles.infoLabel, { color: tokens.textMuted }]}>{Strings.profile.fixedCosts}</Text>
              <Text style={[styles.infoValue, { color: tokens.text }]}>
                {formatMaskedCurrency(monthlyFixedCosts, isMasked)}
              </Text>
            </View>
            <View style={styles.detailLinkRow}>
              <Text style={[styles.detailLinkText, { color: tokens.primary }]}>Chi tiết</Text>
              <ChevronRight size={14} color={tokens.primary} />
            </View>
          </TouchableOpacity>

          {/* Hàng 3: Định mức ngày */}
          <View style={[styles.highlightRow, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
            <Text style={[styles.highlightLabel, { color: tokens.textSub }]}>{Strings.profile.baseDailyBudget}</Text>
            <Text style={[styles.highlightValue, { color: tokens.primary }]}>
              {formatMaskedCurrency(baseDailyBudget, isMasked)}
            </Text>
          </View>

          {/* Hàng 4: Đơn vị quy đổi yêu thích */}
          <View style={styles.unitDisplayRow}>
            <Text style={[styles.unitDisplayLabel, { color: tokens.textMuted }]}>{Strings.profile.favUnitLabel}:</Text>
            <View style={[styles.unitBadge, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
              <Text style={[styles.unitBadgeText, { color: tokens.text }]}>{getUnitLabel(favUnit)}</Text>
            </View>
          </View>
        </View>
      ) : (
        /* FORM CHỈNH SỬA THU NHẬP & ĐƠN VỊ */
        <View style={styles.editForm}>
          <Text style={[styles.inputLabel, { color: tokens.textSub }]}>{Strings.profile.monthlyIncome} (đ):</Text>
          <TextInput
            style={[
              styles.inputField,
              {
                backgroundColor: tokens.surfaceAlt,
                borderColor: tokens.border,
                color: tokens.text,
              },
            ]}
            keyboardType="numeric"
            value={incomeInput}
            onChangeText={setIncomeInput}
            placeholder="15000000"
            placeholderTextColor={tokens.textMuted}
          />

          <Text style={[styles.inputLabel, { marginTop: 12, color: tokens.textSub }]}>{Strings.profile.favUnitLabel}:</Text>
          <View style={styles.unitSelectorRow}>
            {(['ca_phe', 'tra_sua', 'to_pho'] as FavoriteUnit[]).map((unit) => (
              <TouchableOpacity
                key={unit}
                style={[
                  styles.unitPill,
                  { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
                  selectedUnit === unit && [styles.unitPillActive, { backgroundColor: tokens.primary }],
                ]}
                onPress={() => setSelectedUnit(unit)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.unitPillText,
                    { color: selectedUnit === unit ? '#1B2733' : tokens.textMuted },
                  ]}
                >
                  {getUnitLabel(unit)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
    gap: 4,
  },
  editBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
    gap: 4,
  },
  saveBtnText: {
    color: '#1B2733',
    fontSize: 12,
    fontWeight: '700',
  },
  displayContent: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  infoRowClickable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  detailLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoLabel: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  highlightLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  highlightValue: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  unitDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  unitDisplayLabel: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  unitBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  unitBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editForm: {
    paddingTop: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputField: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  unitSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  unitPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  unitPillActive: {},
  unitPillText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
});
