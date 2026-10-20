import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
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
  Banknote,
  Camera,
  Check,
  CreditCard,
  Plus,
  Sparkles,
  Smartphone,
  X,
  XCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { radii, spacing } from '../../theme/tokens';
import { PaymentMethod, TransactionType } from '../../types/database';
import { formatVND } from '../../utils/currency';
import {
  EXPENSE_CATEGORIES,
  getCategoryConfig,
  renderCategoryMonochromeIcon,
} from '../../constants/categories';
import { useCategoryStore } from '../../store/categoryStore';
import { CATEGORY_ICON_MAP } from '../../constants/categoryDefaults';
import { CategoryFormModal } from '../profile/CategoryFormModal';

interface ConfirmationSheetProps {
  visible: boolean;
  photoUri: string | null;
  initialAmount: number;
  initialDescription: string;
  initialCategory: string;
  initialType: TransactionType;
  onClose: () => void;
  onPickPhoto?: () => void;
  onConfirmBought: (data: {
    amount: number;
    description: string;
    category: string;
    type: TransactionType;
    paymentMethod: PaymentMethod;
  }) => void;
  onAskBeforeBuy: (data: {
    amount: number;
    description: string;
    category: string;
    type: TransactionType;
    paymentMethod: PaymentMethod;
  }) => void;
}

export const ConfirmationSheet: React.FC<ConfirmationSheetProps> = ({
  visible,
  photoUri,
  initialAmount,
  initialDescription,
  initialCategory,
  initialType,
  onClose,
  onPickPhoto,
  onConfirmBought,
  onAskBeforeBuy,
}) => {
  const { tokens, isDark } = useTheme();
  const { getExpenseCategories, getIncomeCategories, addCategory, getCategoryById } = useCategoryStore();
  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState(initialAmount > 0 ? initialAmount.toString() : '');
  const [description, setDescription] = useState(initialDescription);
  const [category, setCategory] = useState<string>(initialCategory || 'an_uong');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK');
  const [showQuickAddCat, setShowQuickAddCat] = useState<boolean>(false);

  // Cập nhật khi props đổi
  React.useEffect(() => {
    setType(initialType);
    setAmountStr(initialAmount > 0 ? initialAmount.toString() : '');
    setDescription(initialDescription);
    setCategory(initialCategory || (initialType === 'INCOME' ? 'luong' : 'an_uong'));
  }, [initialAmount, initialDescription, initialType, initialCategory]);

  const amount = parseInt(amountStr, 10) || 0;

  const handleToggleType = async (newType: TransactionType) => {
    setType(newType);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (newType === 'INCOME') {
      const incList = getIncomeCategories();
      if (incList.length > 0) setCategory(incList[0].id);
    } else {
      const expList = getExpenseCategories();
      if (expList.length > 0) setCategory(expList[0].id);
    }
  };

  const handleBought = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const catObj = getCategoryById(category);
    const defaultLabel = catObj?.name || (type === 'INCOME' ? 'Khoản thu nhập' : getCategoryConfig(category).label);
    onConfirmBought({
      amount: amount > 0 ? amount : 45000,
      description: description.trim() || defaultLabel,
      category,
      type,
      paymentMethod,
    });
  };

  const handleAsk = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAskBeforeBuy({
      amount: amount > 0 ? amount : 45000,
      description: description.trim() || 'Món đồ cân nhắc',
      category,
      type,
      paymentMethod,
    });
  };

  const handleQuickAddCategory = async (catData: any) => {
    const created = await addCategory(catData);
    setCategory(created.id);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <View
            style={[
              styles.sheetContainer,
              {
                backgroundColor: tokens.surface,
                borderColor: tokens.border,
              },
            ]}
          >
            {/* HEADER THANH LỊCH */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
                activeOpacity={0.8}
              >
                <X size={16} color={tokens.textMuted} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: tokens.text }]}>
                {type === 'INCOME' ? 'Ghi Nhận Thu Nhập' : 'Ghi Chép Chi Tiêu'}
              </Text>
              <View style={{ width: 32 }} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* KHUNG ẢNH THU GỌN KHI CÓ ẢNH */}
              {photoUri && (
                <View style={[styles.compactPhotoFrame, { borderColor: tokens.border }]}>
                  <Image source={{ uri: photoUri }} style={styles.compactPhoto} resizeMode="cover" />
                  {onPickPhoto && (
                    <TouchableOpacity
                      style={[styles.changePhotoBadge, { backgroundColor: 'rgba(0,0,0,0.65)' }]}
                      onPress={onPickPhoto}
                      activeOpacity={0.8}
                    >
                      <Camera size={12} color="#FFFFFF" strokeWidth={2} />
                      <Text style={styles.changePhotoText}>Đổi ảnh</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* PILL GẠT CHI / THU TRỰC QUAN */}
              <View style={[styles.typeToggleWrapper, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.typePillHalf,
                    type === 'EXPENSE' && [styles.typePillActive, { backgroundColor: tokens.danger }],
                  ]}
                  onPress={() => handleToggleType('EXPENSE')}
                >
                  <ArrowUpRight
                    size={13}
                    color={type === 'EXPENSE' ? '#FFFFFF' : tokens.textMuted}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      { color: type === 'EXPENSE' ? '#FFFFFF' : tokens.textMuted },
                    ]}
                  >
                    Chi tiêu
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.typePillHalf,
                    type === 'INCOME' && [styles.typePillActive, { backgroundColor: tokens.success }],
                  ]}
                  onPress={() => handleToggleType('INCOME')}
                >
                  <ArrowDownLeft
                    size={13}
                    color={type === 'INCOME' ? '#FFFFFF' : tokens.textMuted}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.typeText,
                      { color: type === 'INCOME' ? '#FFFFFF' : tokens.textMuted },
                    ]}
                  >
                    Thu nhập
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Ô NHẬP SỐ TIỀN VỪA VẶN TABULAR-NUMS */}
              <View style={styles.amountInputRow}>
                <TextInput
                  style={[styles.amountInput, { color: tokens.text }]}
                  keyboardType="numeric"
                  value={amountStr}
                  onChangeText={(val) => setAmountStr(val.replace(/\D/g, ''))}
                  placeholder="0"
                  placeholderTextColor={tokens.textMuted}
                  autoFocus={!photoUri}
                />
                <Text style={[styles.currencySymbol, { color: tokens.primary }]}>đ</Text>
                {amountStr.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setAmountStr('')}
                    style={styles.clearBtn}
                    activeOpacity={0.7}
                  >
                    <XCircle size={16} color={tokens.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.formattedSubtitle, { color: tokens.textMuted }]}>
                {amount > 0 ? `Tương đương: ${formatVND(amount)}` : 'Chạm để nhập số tiền'}
              </Text>

              {/* CHỌN MỤC THU / CHI TÙY BIẾN */}
              <View style={styles.sectionBlock}>
                <Text style={[styles.sectionLabel, { color: tokens.textMuted }]}>
                  {type === 'INCOME' ? 'MỤC THU NHẬP:' : 'MỤC CHI TIÊU:'}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryPillsScroll}
                >
                  {(type === 'INCOME' ? getIncomeCategories() : getExpenseCategories()).map((cat) => {
                    const isSelected = category === cat.id;
                    const IconComp = CATEGORY_ICON_MAP[cat.icon] || Sparkles;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryPill,
                          {
                            backgroundColor: isSelected ? tokens.primary : tokens.surfaceAlt,
                            borderColor: isSelected ? tokens.primary : tokens.border,
                          },
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setCategory(cat.id);
                        }}
                        activeOpacity={0.8}
                      >
                        <IconComp
                          size={13}
                          strokeWidth={2}
                          color={isSelected ? tokens.textOnPrimary : tokens.textMuted}
                        />
                        <Text
                          style={[
                            styles.categoryPillText,
                            { color: isSelected ? tokens.textOnPrimary : tokens.text },
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}

                  {/* Nút + Mới để tạo nhanh danh mục */}
                  <TouchableOpacity
                    style={[
                      styles.categoryPill,
                      {
                        backgroundColor: tokens.surfaceAlt,
                        borderColor: tokens.border,
                        borderStyle: 'dashed',
                      },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowQuickAddCat(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Plus size={13} strokeWidth={2.5} color={tokens.primary} />
                    <Text
                      style={[
                        styles.categoryPillText,
                        { color: tokens.primary, fontWeight: '700' },
                      ]}
                    >
                      + Mới
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* MÔ TẢ MÓN ĐỒ */}
              <View style={[styles.inputWrapper, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
                <TextInput
                  style={[styles.descInput, { color: tokens.text }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Thêm mô tả hoặc cảm xúc (ví dụ: Cà phê sáng)..."
                  placeholderTextColor={tokens.textMuted}
                />
              </View>


              {/* NÚT THAO TÁC Ở ĐÁY (ZERO-SCROLL) */}
              <View style={styles.bottomActionsCol}>
                <TouchableOpacity
                  style={[styles.heroBoughtBtn, { backgroundColor: tokens.primary }]}
                  onPress={handleBought}
                  activeOpacity={0.85}
                >
                  <Check size={17} color="#1B2733" strokeWidth={2.6} />
                  <Text style={styles.heroBoughtBtnText}>
                    {type === 'INCOME' ? 'Lưu Thu Nhập Vào Sổ' : 'Đã Mua — Lưu Vào Sổ'}
                  </Text>
                </TouchableOpacity>

                {type === 'EXPENSE' && (
                  <TouchableOpacity
                    style={styles.secondaryAskBtn}
                    onPress={handleAsk}
                    activeOpacity={0.75}
                  >
                    <Sparkles size={13} color={tokens.primary} strokeWidth={2} />
                    <Text style={[styles.secondaryAskBtnText, { color: tokens.textMuted }]}>
                      Hỏi Trước (Xem Phán Quyết Minh Coach)
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>

      <CategoryFormModal
        visible={showQuickAddCat}
        initialType={type === 'INCOME' ? 'INCOME' : 'EXPENSE'}
        onClose={() => setShowQuickAddCat(false)}
        onSave={handleQuickAddCategory}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
  },
  sheetContainer: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
    borderWidth: 1,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingBottom: spacing.sm,
  },
  compactPhotoFrame: {
    width: '100%',
    height: 120,
    borderRadius: radii.md,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: spacing.xs,
    borderWidth: 1,
  },
  compactPhoto: {
    width: '100%',
    height: '100%',
  },
  changePhotoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  typeToggleWrapper: {
    flexDirection: 'row',
    borderRadius: radii.full,
    padding: 3,
    borderWidth: 1,
    marginVertical: spacing.xs,
  },
  typePillHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  typePillActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  amountInput: {
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 4,
  },
  clearBtn: {
    padding: 6,
    marginLeft: 4,
  },
  formattedSubtitle: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  sectionBlock: {
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 5,
  },
  categoryPillsScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  inputWrapper: {
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 9 : 6,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  descInput: {
    fontSize: 13,
  },
  paymentPillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  paymentPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  paymentPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomActionsCol: {
    marginTop: spacing.xs,
    gap: 6,
    alignItems: 'center',
  },
  heroBoughtBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: radii.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  heroBoughtBtnText: {
    color: '#1B2733',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  secondaryAskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  secondaryAskBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
