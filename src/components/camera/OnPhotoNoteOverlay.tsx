import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  RotateCcw,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Colors } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeContext';
import { radii, spacing } from '../../theme/tokens';
import { PaymentMethod, TransactionType } from '../../types/database';
import { CategoryItem } from '../../types/category';
import { useCategoryStore } from '../../store/categoryStore';
import {
  getCategoryConfig,
  renderCategoryMonochromeIcon,
} from '../../constants/categories';

interface OnPhotoNoteOverlayProps {
  photoUri: string;
  initialAmount?: number;
  initialDescription?: string;
  initialCategory?: string;
  initialType?: TransactionType;
  onSave: (data: {
    amount: number;
    description: string;
    category: string;
    type: TransactionType;
    paymentMethod: PaymentMethod;
  }) => void;
  onRetake: () => void;
}

const QUICK_AMOUNTS = [20000, 35000, 50000, 100000];

/**
 * Dải Note Trực Tiếp Trên Ảnh (On-Photo Direct Note Overlay)
 * Điền thông tin ngay trên ảnh vừa chụp (góc dưới ảnh), không chuyển modal khác:
 * - Tên món ("gà rán")
 * - Mục chi tiêu ("Ăn uống")
 * - Số tiền ("50.000") kèm chip giá nhanh
 * - Nút Lưu 1 chạm tức thì
 */
export const OnPhotoNoteOverlay: React.FC<OnPhotoNoteOverlayProps> = ({
  photoUri,
  initialAmount = 50000,
  initialDescription = '',
  initialCategory = 'an_uong',
  initialType = 'EXPENSE',
  onSave,
  onRetake,
}) => {
  const { tokens, isDark } = useTheme();
  const { getExpenseCategories, getIncomeCategories, getCategoryById } = useCategoryStore();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState<string>(
    initialAmount > 0 ? initialAmount.toString() : '50000'
  );
  const [description, setDescription] = useState<string>(initialDescription);
  const [category, setCategory] = useState<string>(initialCategory);
  const [showCategoryPicker, setShowCategoryPicker] = useState<boolean>(false);

  const amount = parseInt(amountStr, 10) || 0;

  const currentCategories: CategoryItem[] =
    type === 'INCOME' ? getIncomeCategories() : getExpenseCategories();

  const handleQuickAmount = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmountStr(val.toString());
  };

  const handleToggleType = (newType: TransactionType) => {
    Haptics.selectionAsync();
    setType(newType);
    if (newType === 'INCOME') {
      const incList = getIncomeCategories();
      setCategory(incList[0]?.id || 'luong');
    } else {
      const expList = getExpenseCategories();
      setCategory(expList[0]?.id || 'an_uong');
    }
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const catObj = getCategoryById(category);
    const defaultLabel = catObj?.name || getCategoryConfig(category).label || (type === 'INCOME' ? 'Khoản thu' : 'Chi tiêu');
    const desc = description.trim() || defaultLabel;
    onSave({
      amount: amount > 0 ? amount : 50000,
      description: desc,
      category,
      type,
      paymentMethod: 'BANK',
    });
  };

  const currentCategoryObj = getCategoryById(category);
  const currentCategoryLabel = currentCategoryObj?.name || getCategoryConfig(category).label || 'Mục';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.overlayContainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      {/* 1. HÀNG ĐỈNH ẢNH: NÚT CHỤP LẠI & NÚT GẠT CHI / THU */}
      <View style={styles.topActionRow}>
        <TouchableOpacity
          style={styles.frostedTopButton}
          onPress={onRetake}
          activeOpacity={0.8}
        >
          <RotateCcw size={14} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.frostedTopButtonText}>Chụp lại</Text>
        </TouchableOpacity>

        {/* Nút gạt Chi / Thu nhỏ trên ảnh */}
        <View style={styles.frostedTypeSwitch}>
          <TouchableOpacity
            style={[
              styles.typeSwitchBtn,
              type === 'EXPENSE' && styles.typeSwitchBtnActiveExpense,
            ]}
            onPress={() => handleToggleType('EXPENSE')}
            activeOpacity={0.8}
          >
            <ArrowDownLeft
              size={12}
              color={type === 'EXPENSE' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)'}
              strokeWidth={2.5}
            />
            <Text
              style={[
                styles.typeSwitchText,
                type === 'EXPENSE' && styles.typeSwitchTextActive,
              ]}
            >
              Chi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeSwitchBtn,
              type === 'INCOME' && styles.typeSwitchBtnActiveIncome,
            ]}
            onPress={() => handleToggleType('INCOME')}
            activeOpacity={0.8}
          >
            <ArrowUpRight
              size={12}
              color={type === 'INCOME' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)'}
              strokeWidth={2.5}
            />
            <Text
              style={[
                styles.typeSwitchText,
                type === 'INCOME' && styles.typeSwitchTextActive,
              ]}
            >
              Thu
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.frostedCloseButton}
          onPress={onRetake}
          activeOpacity={0.8}
        >
          <X size={16} color="#FFFFFF" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* 2. DẢI NOTE CHÂN ẢNH: BÁN TRONG SUỐT CỰC NGHỆ */}
      <View style={styles.bottomNoteCard}>
        {/* HÀNG CHIP GIÁ NHANH */}
        <View style={styles.quickAmountRow}>
          {QUICK_AMOUNTS.map((val) => {
            const isSelected = amount === val;
            return (
              <TouchableOpacity
                key={val}
                style={[
                  styles.quickAmountChip,
                  isSelected && styles.quickAmountChipActive,
                ]}
                onPress={() => handleQuickAmount(val)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    isSelected && styles.quickAmountTextActive,
                  ]}
                >
                  {val >= 1000000 ? `${val / 1000000}tr` : `${val / 1000}k`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* HÀNG NHẬP TIỀN CHÍNH */}
        <View style={styles.amountInputRow}>
          <Text style={styles.amountCurrencySymbol}>₫</Text>
          <TextInput
            style={styles.amountInput}
            value={amountStr}
            onChangeText={(txt) => setAmountStr(txt.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            selectTextOnFocus
          />
        </View>

        {/* HÀNG DANH MỤC ICON KHI BẬT CHỌN */}
        {showCategoryPicker && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {currentCategories.map((cat: CategoryItem) => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryItemPill,
                    isSelected && styles.categoryItemPillActive,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setCategory(cat.id);
                    setShowCategoryPicker(false);
                  }}
                  activeOpacity={0.8}
                >
                  {renderCategoryMonochromeIcon({
                    categoryId: cat.id,
                    size: 13,
                    color: isSelected ? '#1B2733' : '#FFFFFF',
                    strokeWidth: 2,
                  })}
                  <Text
                    style={[
                      styles.categoryItemText,
                      isSelected && styles.categoryItemTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* HÀNG NHẬP NOTE VÀ NÚT LƯU */}
        <View style={styles.inputAndActionRow}>
          {/* Nút chọn danh mục nhanh */}
          <TouchableOpacity
            style={styles.categorySelectBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowCategoryPicker((prev) => !prev);
            }}
            activeOpacity={0.8}
          >
            {renderCategoryMonochromeIcon({
              categoryId: category,
              size: 15,
              color: Colors.primaryYellow,
              strokeWidth: 2.2,
            })}
            <Text style={styles.categorySelectLabel} numberOfLines={1}>
              {currentCategoryLabel}
            </Text>
          </TouchableOpacity>

          {/* Ô nhập tên món (ví dụ: gà rán, cà phê) */}
          <View style={styles.descInputWrapper}>
            <TextInput
              style={styles.descInput}
              value={description}
              onChangeText={setDescription}
              placeholder={type === 'INCOME' ? 'Ví dụ: Lương, Thưởng...' : 'Ví dụ: Gà rán, Cà phê...'}
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>

          {/* Nút Lưu màu vàng rực rỡ */}
          <TouchableOpacity
            style={styles.saveSubmitBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Check size={20} color="#1B2733" strokeWidth={3} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },

  // Hàng đỉnh
  topActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  frostedTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(20, 26, 36, 0.65)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
  },
  frostedTopButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  frostedTypeSwitch: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 26, 36, 0.65)',
    padding: 3,
    borderRadius: radii.full,
    gap: 3,
  },
  typeSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.full,
  },
  typeSwitchBtnActiveExpense: {
    backgroundColor: '#C86D51', // Ngói rêu phố cổ
  },
  typeSwitchBtnActiveIncome: {
    backgroundColor: '#7E9F80', // Cốm non làng Vòng
  },
  typeSwitchText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '600',
  },
  typeSwitchTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  frostedCloseButton: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: 'rgba(20, 26, 36, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Dải Note chân ảnh
  bottomNoteCard: {
    backgroundColor: 'rgba(16, 22, 32, 0.88)',
    borderRadius: 20,
    padding: spacing.sm + 2,
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },

  // Chip giá nhanh
  quickAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  quickAmountChip: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAmountChipActive: {
    backgroundColor: Colors.primaryYellow,
  },
  quickAmountText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11.5,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  quickAmountTextActive: {
    color: '#1B2733',
    fontWeight: '700',
  },

  // Ô nhập tiền
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  amountCurrencySymbol: {
    color: Colors.primaryYellow,
    fontSize: 22,
    fontWeight: '700',
    marginRight: 4,
  },
  amountInput: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
    minWidth: 80,
    textAlign: 'center',
    paddingVertical: 0,
  },

  // Danh mục ngang khi bật
  categoryScroll: {
    gap: 6,
    paddingVertical: 4,
  },
  categoryItemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  categoryItemPillActive: {
    backgroundColor: Colors.primaryYellow,
  },
  categoryItemText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },
  categoryItemTextActive: {
    color: '#1B2733',
    fontWeight: '700',
  },

  // Hàng nhập Note & Lưu
  inputAndActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categorySelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: radii.full,
    maxWidth: 100,
  },
  categorySelectLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  descInputWrapper: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radii.full,
    paddingHorizontal: 12,
    justifyContent: 'center',
    height: 38,
  },
  descInput: {
    color: '#FFFFFF',
    fontSize: 13,
    paddingVertical: 0,
  },
  saveSubmitBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: Colors.primaryYellow,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryYellow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
});
