import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Delete, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { CategoryItem } from '../../types/category';
import { useCategoryStore } from '../../store/categoryStore';
import { renderCategoryMonochromeIcon } from '../../constants/categories';
import { TransactionType } from '../../types/database';

export interface MandCashierKeyboardProps {
  amount: number;
  onChangeAmount: (val: number) => void;
  category: string;
  onChangeCategory: (catId: string) => void;
  type?: TransactionType;
  onSubmit: () => void;
  submitText?: string;
  disabled?: boolean;
}

const MAX_AMOUNT = 999999999; // 999 triệu VND tối đa

export const MandCashierKeyboard: React.FC<MandCashierKeyboardProps> = ({
  amount,
  onChangeAmount,
  category,
  onChangeCategory,
  type = 'EXPENSE',
  onSubmit,
  submitText = 'Lưu ✔',
  disabled = false,
}) => {
  const { tokens, isDark, mode } = useTheme();
  const { getExpenseCategories, getIncomeCategories } = useCategoryStore();

  const [cursorVisible, setCursorVisible] = useState(true);

  // Hiệu ứng con trỏ nhấp nháy êm ái
  useEffect(() => {
    const timer = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 600);
    return () => clearInterval(timer);
  }, []);

  const currentCategories: CategoryItem[] =
    type === 'INCOME' ? getIncomeCategories() : getExpenseCategories();

  // Xử lý bấm số
  const handlePressDigit = (digit: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentStr = amount === 0 ? '' : amount.toString();
    const nextStr = currentStr + digit;
    const nextVal = parseInt(nextStr, 10);
    if (!isNaN(nextVal) && nextVal <= MAX_AMOUNT) {
      onChangeAmount(nextVal);
    }
  };

  // Xử lý phím '000' siêu tốc cho VND
  const handlePressTripleZero = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (amount === 0) return;
    const nextVal = amount * 1000;
    if (nextVal <= MAX_AMOUNT) {
      onChangeAmount(nextVal);
    }
  };

  // Xử lý xóa lùi 1 ký tự
  const handleBackspace = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const str = amount.toString();
    if (str.length <= 1) {
      onChangeAmount(0);
    } else {
      const nextVal = parseInt(str.slice(0, -1), 10);
      onChangeAmount(isNaN(nextVal) ? 0 : nextVal);
    }
  };

  // Giữ lì phím xóa để xóa sạch
  const handleClearAll = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onChangeAmount(0);
  };

  const handleCategorySelect = (catId: string) => {
    Haptics.selectionAsync();
    onChangeCategory(catId);
  };

  const handleSubmit = () => {
    if (disabled || amount <= 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit();
  };

  // Format số có dấu chấm ngăn cách hàng nghìn
  const formattedAmount = amount.toLocaleString('vi-VN');

  // Màu sắc phím bấm theo theme
  const isHeocon = mode === 'heocon' || !mode;
  const keypadBg = isHeocon ? '#FFFBF1' : tokens.surfaceAlt;
  const keyBg = isHeocon ? '#FFFBF1' : tokens.surface;
  const keyText = isHeocon ? '#2B2118' : tokens.text;
  const accentColor = isHeocon ? '#F4B93B' : tokens.primary;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: keypadBg,
          borderTopColor: isHeocon ? '#2B2118' : tokens.border,
          borderTopWidth: isHeocon ? 3 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      {/* ================= ZONE 1: MICRO CATEGORY STRIP ================= */}
      <View style={styles.categoryStripWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryStripScroll}
        >
          {currentCategories.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  isHeocon && {
                    backgroundColor: isSelected ? '#F4B93B' : '#FFFBF1',
                    borderColor: '#2B2118',
                    borderWidth: 2,
                    shadowColor: '#2B2118',
                    shadowOffset: { width: 0, height: 1.5 },
                    shadowOpacity: isSelected ? 1 : 0.4,
                    shadowRadius: 0,
                  },
                  !isHeocon && {
                    backgroundColor: isSelected
                      ? isDark
                        ? 'rgba(45, 212, 191, 0.18)'
                        : 'rgba(229, 152, 68, 0.22)'
                      : 'transparent',
                    borderColor: isSelected ? accentColor : 'transparent',
                  },
                ]}
                onPress={() => handleCategorySelect(cat.id)}
                activeOpacity={0.7}
              >
                {renderCategoryMonochromeIcon({
                  categoryId: cat.id,
                  size: 14,
                  color: isHeocon
                    ? '#2B2118'
                    : isSelected
                    ? accentColor
                    : tokens.textSub,
                  strokeWidth: 2.2,
                })}
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: isHeocon
                        ? '#2B2118'
                        : isSelected
                        ? accentColor
                        : tokens.textSub,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ================= ZONE 2: MAND FINANCIAL AMOUNT DISPLAY ================= */}
      <View style={styles.amountDisplayRow}>
        <View style={styles.amountTextGroup}>
          <Text
            style={[
              styles.amountValueText,
              { color: isHeocon ? '#2B2118' : tokens.text },
            ]}
          >
            {formattedAmount}
          </Text>
          <Text
            style={[
              styles.currencySuffix,
              { color: isHeocon ? '#2B2118' : tokens.textSub },
            ]}
          >
            đ
          </Text>
          <View
            style={[
              styles.cursorBar,
              {
                backgroundColor: isHeocon ? '#2B2118' : accentColor,
                opacity: cursorVisible ? 1 : 0,
              },
            ]}
          />
        </View>
      </View>

      {/* ================= ZONE 3: 4-COLUMN FINANCIAL KEYPAD ================= */}
      <View style={styles.keypadRow}>
        {/* 3 Cột số bên trái (75% chiều rộng) */}
        <View style={styles.leftDigitGrid}>
          {/* Hàng 1 */}
          <View style={styles.gridRow}>
            {['1', '2', '3'].map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.digitKey,
                  { backgroundColor: keyBg },
                  isHeocon && styles.neoDigitKey,
                ]}
                onPress={() => handlePressDigit(d)}
                activeOpacity={0.65}
              >
                <Text style={[styles.digitKeyText, { color: keyText }]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hàng 2 */}
          <View style={styles.gridRow}>
            {['4', '5', '6'].map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.digitKey,
                  { backgroundColor: keyBg },
                  isHeocon && styles.neoDigitKey,
                ]}
                onPress={() => handlePressDigit(d)}
                activeOpacity={0.65}
              >
                <Text style={[styles.digitKeyText, { color: keyText }]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hàng 3 */}
          <View style={styles.gridRow}>
            {['7', '8', '9'].map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.digitKey,
                  { backgroundColor: keyBg },
                  isHeocon && styles.neoDigitKey,
                ]}
                onPress={() => handlePressDigit(d)}
                activeOpacity={0.65}
              >
                <Text style={[styles.digitKeyText, { color: keyText }]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hàng 4: . | 0 | 000 */}
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[
                styles.digitKey,
                { backgroundColor: keyBg },
                isHeocon && styles.neoDigitKey,
              ]}
              onPress={() => handlePressDigit('0')}
              activeOpacity={0.65}
            >
              <Text style={[styles.digitKeyText, { color: keyText }]}>0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.digitKey,
                { backgroundColor: keyBg },
                isHeocon && styles.neoDigitKey,
              ]}
              onPress={handlePressTripleZero}
              activeOpacity={0.65}
            >
              <Text
                style={[
                  styles.digitKeySpecialText,
                  { color: isHeocon ? '#2B2118' : accentColor },
                ]}
              >
                000
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.digitKey,
                { backgroundColor: keyBg },
                isHeocon && styles.neoDigitKey,
              ]}
              onPress={handleClearAll}
              activeOpacity={0.65}
            >
              <Text
                style={[
                  styles.digitKeyText,
                  {
                    color: isHeocon ? '#E0452B' : tokens.textMuted,
                    fontSize: 16,
                    fontWeight: '800',
                  },
                ]}
              >
                C
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 1 Cột hành động bên phải (25% chiều rộng) */}
        <View style={styles.rightActionCol}>
          {/* Nút Xóa Lùi ⌫ */}
          <TouchableOpacity
            style={[
              styles.backspaceKey,
              { backgroundColor: keyBg },
              isHeocon && styles.neoBackspaceKey,
            ]}
            onPress={handleBackspace}
            onLongPress={handleClearAll}
            activeOpacity={0.65}
          >
            <Delete
              size={22}
              color={isHeocon ? '#2B2118' : tokens.text}
              strokeWidth={2.4}
            />
          </TouchableOpacity>

          {/* Nút Primary LƯU SỔ (Cao chiếm 3 hàng) */}
          <TouchableOpacity
            style={[
              styles.submitKey,
              isHeocon
                ? {
                    backgroundColor:
                      amount > 0 && !disabled ? '#F4B93B' : '#E2D8C3',
                    borderWidth: 3,
                    borderColor: '#2B2118',
                    shadowColor: '#2B2118',
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 1,
                    shadowRadius: 0,
                    elevation: 3,
                  }
                : {
                    backgroundColor:
                      amount > 0 && !disabled
                        ? accentColor
                        : isDark
                        ? '#253242'
                        : '#E2D8C3',
                  },
            ]}
            onPress={handleSubmit}
            disabled={disabled || amount <= 0}
            activeOpacity={0.85}
          >
            <Check
              size={28}
              color={isHeocon ? '#2B2118' : '#FFFFFF'}
              strokeWidth={3.2}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: 'hidden',
  },

  // 1. Category Strip
  categoryStripWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  categoryStripScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
  },

  // 2. Amount Display
  amountDisplayRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  amountTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountValueText: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  currencySuffix: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 6,
    marginRight: 4,
    opacity: 0.75,
  },
  cursorBar: {
    width: 2.5,
    height: 28,
    borderRadius: 2,
    marginLeft: 2,
  },

  // 3. Keypad Grid
  keypadRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 6,
  },
  leftDigitGrid: {
    flex: 3,
    gap: 6,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 6,
  },
  digitKey: {
    flex: 1,
    height: 52,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  digitKeyText: {
    fontSize: 22,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  digitKeySpecialText: {
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  // Cột bên phải
  rightActionCol: {
    flex: 1,
    gap: 6,
  },
  backspaceKey: {
    height: 52,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  submitKey: {
    flex: 1,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  submitKeyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  neoDigitKey: {
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 12,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  neoBackspaceKey: {
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 12,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
});
