import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useCategoryStore } from '../../store/categoryStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useBudgetStore } from '../../store/budgetStore';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { ParsedBankNotification } from '../../utils/bankNotificationParser';
import { formatVND } from '../../utils/currency';
import { CATEGORY_ICON_MAP } from '../../constants/categoryDefaults';
import { CategoryItem } from '../../types/category';

export interface FastCategorySheetProps {
  visible: boolean;
  bankEvent: ParsedBankNotification | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FastCategorySheet: React.FC<FastCategorySheetProps> = ({
  visible,
  bankEvent,
  onClose,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const { tokens, isDark } = useTheme();
  const { getExpenseCategories, getIncomeCategories } = useCategoryStore();

  const [noteText, setNoteText] = useState('');

  if (!bankEvent) return null;

  const isExpense = bankEvent.type === 'EXPENSE';
  const categories: CategoryItem[] = isExpense
    ? getExpenseCategories()
    : getIncomeCategories();

  const handleSelectCategory = async (cat: CategoryItem) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const userId = useAuthStore.getState().user?.id || 'guest-user';
    const bankTag = bankEvent.bankCode && bankEvent.bankCode !== 'OTHER'
      ? `[${bankEvent.bankCode}]`
      : `[${bankEvent.bankName}]`;

    // Chuẩn hóa tên giao dịch: Ghim [Mã NH] ở đầu phần mô tả
    const finalDescription = noteText.trim().length > 0
      ? `${bankTag} ${noteText.trim()}`
      : `${bankTag} ${cat.name}`;

    await useTransactionStore.getState().addTransaction({
      userId,
      type: bankEvent.type,
      amount: bankEvent.amount,
      category: cat.id,
      description: finalDescription,
      photo_url: `bank_brand://${bankEvent.bankCode || 'BANK'}`,
      payment_method: 'BANK',
      source: 'MANUAL',
      status: 'CONFIRMED',
    });

    const txs = useTransactionStore.getState().transactions;
    useBudgetStore.getState().recalculateFromTransactions(txs);

    setNoteText('');
    onSuccess?.();
    onClose();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNoteText('');
    onClose();
  };

  const amountColor = isExpense ? tokens.danger : tokens.success;
  const amountPrefix = isExpense ? '-' : '+';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={handleClose} />

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: isDark ? '#0E1620' : '#FAF6F0',
              borderTopColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
              paddingBottom: Math.max(insets.bottom, 16) + 12,
            },
          ]}
        >
          {/* DRAG HANDLE */}
          <View style={styles.dragHandleWrapper}>
            <View
              style={[
                styles.dragHandle,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)' },
              ]}
            />
          </View>

          {/* HEADER */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={[styles.bankBadge, { backgroundColor: bankEvent.brandColor }]}>
                <Text style={styles.bankBadgeText}>{bankEvent.bankCode || 'NGÂN HÀNG'}</Text>
              </View>
              <Text style={[styles.sheetTitle, { color: tokens.text }]}>
                Ghi sổ nhanh
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtnBorderless}
              onPress={handleClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={20} color={tokens.text} strokeWidth={2.6} />
            </TouchableOpacity>
          </View>

          {/* SỐ TIỀN & THÔNG TIN BIẾN ĐỘNG */}
          <View
            style={[
              styles.amountCard,
              {
                backgroundColor: isDark ? '#162231' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(229, 152, 68, 0.18)',
              },
            ]}
          >
            <View style={styles.amountInfoLeft}>
              <Text style={[styles.bankNameLabel, { color: tokens.textMuted }]}>
                {bankEvent.bankName}
              </Text>
              <Text style={[styles.amountValue, { color: amountColor }]}>
                {amountPrefix}{formatVND(bankEvent.amount)}
              </Text>
            </View>

            <View style={styles.amountInfoRight}>
              <Text
                style={[styles.contentSnippet, { color: tokens.textMuted }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {bankEvent.content || 'Biến động số dư'}
              </Text>
            </View>
          </View>

          {/* SECTION LABEL */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionHeaderText, { color: tokens.textMuted }]}>
              CHẠM DANH MỤC ĐỂ LƯU SỔ NGAY
            </Text>
          </View>

          {/* LƯỚI ĐẦY ĐỦ 100% DANH MỤC */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryGridContainer}
          >
            {categories.map((cat) => {
              const IconComponent = CATEGORY_ICON_MAP[cat.icon] || Sparkles;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: isDark ? '#162231' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                    },
                  ]}
                  onPress={() => handleSelectCategory(cat)}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainerFloating}>
                    <IconComponent
                      size={24}
                      color={cat.color || tokens.primary}
                      strokeWidth={2.6}
                    />
                  </View>
                  <Text
                    style={[styles.categoryCardText, { color: tokens.text }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Ô NHẬP GHI CHÚ TÙY CHỌN */}
          <View
            style={[
              styles.noteInputWrapper,
              {
                backgroundColor: isDark ? '#162231' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
              },
            ]}
          >
            <TextInput
              style={[styles.noteInput, { color: tokens.text }]}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Thêm ghi chú cụ thể nếu muốn (ví dụ: Cơm tấm, Bàn phím...)"
              placeholderTextColor={tokens.textMuted}
              maxLength={80}
            />
            {noteText.length > 0 && (
              <TouchableOpacity
                onPress={() => setNoteText('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={16} color={tokens.textMuted} strokeWidth={2.2} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  sheetContainer: {
    borderTopLeftRadius: radii.round,
    borderTopRightRadius: radii.round,
    borderTopWidth: 1,
    maxHeight: '84%',
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 24,
  },
  dragHandleWrapper: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 4.5,
    borderRadius: 2.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  bankBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtnBorderless: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  amountInfoLeft: {
    flex: 1,
  },
  bankNameLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.3,
  },
  amountInfoRight: {
    maxWidth: '45%',
    alignItems: 'flex-end',
  },
  contentSnippet: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeaderRow: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  categoryScroll: {
    maxHeight: 280,
  },
  categoryGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 10,
  },
  categoryCard: {
    width: '31%',
    aspectRatio: 1.15,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  iconContainerFloating: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginBottom: 6,
  },
  categoryCardText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  noteInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 10,
    gap: 8,
  },
  noteInput: {
    flex: 1,
    fontSize: 13.5,
    paddingVertical: 4,
  },
});
