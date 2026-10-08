import React, { useState } from 'react';
import {
  Dimensions,
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
  Check,
  Download,
  Plus,
  Share2,
  Users,
  X,
  XCircle,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { Colors } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeContext';
import { radii, spacing } from '../../theme/tokens';
import { PaymentMethod, TransactionType } from '../../types/database';
import { CategoryItem } from '../../types/category';
import { useCategoryStore } from '../../store/categoryStore';
import { formatVND } from '../../utils/currency';
import {
  getCategoryConfig,
  renderCategoryMonochromeIcon,
} from '../../constants/categories';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FRAME_WIDTH = SCREEN_WIDTH - 28;

interface LocketReviewModalProps {
  visible: boolean;
  photoUri: string | null;
  initialAmount?: number;
  initialDescription?: string;
  initialCategory?: string;
  initialType?: TransactionType;
  userName?: string;
  onClose: () => void;
  onSave: (data: {
    amount: number;
    description: string;
    category: string;
    type: TransactionType;
    paymentMethod: PaymentMethod;
  }) => void;
}

const QUICK_AMOUNTS = [25000, 35000, 50000, 100000];

/**
 * Màn Hình Review Chụp Ảnh Chuẩn Dáng Locket (Post-Capture Locket Squircle Review)
 * Tái hiện 100% ý tưởng hình mẫu Locket:
 * - Khung ảnh Squircle bo tròn lớn 38px ở trung tâm
 * - Pill "Thêm tag +" bên trong đỉnh ảnh
 * - Pill "[ Chi | Thu ]" bên trong chân ảnh
 * - Số tiền cực to màu trắng (56.000 đ) + nút xóa (x)
 * - Input "Thêm mô tả"
 * - Hàng "Lưu vào" kèm avatar [CB] Của bạn
 * - Nút to bản cong vút "Lưu ✔" dưới đáy
 */
export const LocketReviewModal: React.FC<LocketReviewModalProps> = ({
  visible,
  photoUri,
  initialAmount = 50000,
  initialDescription = '',
  initialCategory = 'an_uong',
  initialType = 'EXPENSE',
  userName = 'Bạn',
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const { tokens } = useTheme();
  const { getExpenseCategories, getIncomeCategories, getCategoryById } = useCategoryStore();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amountStr, setAmountStr] = useState<string>(
    initialAmount > 0 ? initialAmount.toString() : '50000'
  );
  const [description, setDescription] = useState<string>(initialDescription);
  const [category, setCategory] = useState<string>(initialCategory);
  const [showCategoryPicker, setShowCategoryPicker] = useState<boolean>(false);
  const [isEditingAmount, setIsEditingAmount] = useState<boolean>(false);

  // Đồng bộ lại khi props đổi
  React.useEffect(() => {
    if (visible) {
      setType(initialType);
      setAmountStr(initialAmount > 0 ? initialAmount.toString() : '50000');
      setDescription(initialDescription);
      setCategory(initialCategory);
      setShowCategoryPicker(false);
      setIsEditingAmount(false);
    }
  }, [visible, initialAmount, initialDescription, initialCategory, initialType]);

  const amount = parseInt(amountStr, 10) || 0;
  const currentCategories: CategoryItem[] =
    type === 'INCOME' ? getIncomeCategories() : getExpenseCategories();

  const currentCatObj = getCategoryById(category);
  const currentCatLabel = currentCatObj?.name || getCategoryConfig(category).label || 'Thêm tag';

  const userInitial = userName.trim().slice(0, 2).toUpperCase() || 'CB';

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
    const defaultLabel = currentCatObj?.name || (type === 'INCOME' ? 'Khoản thu' : 'Chi tiêu');
    const finalDesc = description.trim() || defaultLabel;
    onSave({
      amount: amount > 0 ? amount : 50000,
      description: finalDesc,
      category,
      type,
      paymentMethod: 'BANK',
    });
  };

  if (!visible || !photoUri) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.rootContainer, { paddingTop: insets.top + 6, paddingBottom: insets.bottom + 12 }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          {/* 1. TOP HEADER: [ X ]    [ Chia tiền ]    [ Download ] */}
          <View style={styles.topHeaderBar}>
            <TouchableOpacity
              style={styles.circleHeaderBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <X size={20} color="#FFFFFF" strokeWidth={2.4} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.splitMoneyPill}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              activeOpacity={0.85}
            >
              <Users size={15} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.splitMoneyText}>Chia tiền</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleHeaderBtn}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
              activeOpacity={0.8}
            >
              <Download size={18} color="#FFFFFF" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
            {/* 2. KHUNG ẢNH SQUIRCLE BO GÓC 38PX (LOCKET FRAME) */}
            <View style={styles.locketSquircleFrame}>
              <Image
                source={{ uri: photoUri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />

              {/* PILL TRONG ẢNH Ở ĐỈNH: THÊM TAG + */}
              <TouchableOpacity
                style={styles.onPhotoTagPill}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowCategoryPicker((prev) => !prev);
                }}
                activeOpacity={0.85}
              >
                {category !== 'an_uong' && (
                  renderCategoryMonochromeIcon({
                    categoryId: category,
                    size: 13,
                    color: '#FFFFFF',
                    strokeWidth: 2,
                  })
                )}
                <Text style={styles.onPhotoTagText}>
                  {category ? currentCatLabel : 'Thêm tag +'}
                </Text>
              </TouchableOpacity>

              {/* PILL TRONG ẢNH Ở ĐÁY: [ ↗ Chi | ↘ Thu ] */}
              <View style={styles.onPhotoTypeSwitchPill}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    type === 'EXPENSE' && styles.typeBtnActiveExpense,
                  ]}
                  onPress={() => handleToggleType('EXPENSE')}
                  activeOpacity={0.85}
                >
                  <ArrowDownLeft
                    size={13}
                    color={type === 'EXPENSE' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}
                    strokeWidth={2.5}
                  />
                  <Text
                    style={[
                      styles.typeBtnText,
                      type === 'EXPENSE' && styles.typeBtnTextActive,
                    ]}
                  >
                    Chi
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    type === 'INCOME' && styles.typeBtnActiveIncome,
                  ]}
                  onPress={() => handleToggleType('INCOME')}
                  activeOpacity={0.85}
                >
                  <ArrowUpRight
                    size={13}
                    color={type === 'INCOME' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)'}
                    strokeWidth={2.5}
                  />
                  <Text
                    style={[
                      styles.typeBtnText,
                      type === 'INCOME' && styles.typeBtnTextActive,
                    ]}
                  >
                    Thu
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* DANH SÁCH TAG KHI BẬT CHỌN */}
            {showCategoryPicker && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tagPickerScroll}
              >
                {currentCategories.map((cat: CategoryItem) => {
                  const isSel = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.tagItemPill, isSel && styles.tagItemPillActive]}
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
                        color: isSel ? '#111822' : '#FFFFFF',
                        strokeWidth: 2,
                      })}
                      <Text style={[styles.tagItemText, isSel && styles.tagItemTextActive]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* 3. KHU VỰC BÊN DƯỚI KHUNG ẢNH: SỐ TIỀN TO & MÔ TẢ */}
            <View style={styles.postPhotoInfoSection}>
              {/* SỐ TIỀN TO BẢN (56.000 đ) KÈM NÚT XÓA (X) */}
              <View style={styles.bigAmountRow}>
                {isEditingAmount ? (
                  <View style={styles.amountInputInlineWrapper}>
                    <TextInput
                      style={styles.amountTextInput}
                      value={amountStr}
                      onChangeText={(t) => setAmountStr(t.replace(/[^0-9]/g, ''))}
                      keyboardType="numeric"
                      autoFocus
                      selectTextOnFocus
                      onBlur={() => setIsEditingAmount(false)}
                      placeholder="0"
                      placeholderTextColor="#777"
                    />
                    <Text style={styles.bigAmountUnit}>đ</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.amountDisplayTouch}
                    onPress={() => setIsEditingAmount(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.bigAmountText}>
                      {amount > 0 ? formatVND(amount) : '0 đ'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setAmountStr('');
                        setIsEditingAmount(true);
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <XCircle size={18} color="rgba(255, 255, 255, 0.55)" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                )}
              </View>

              {/* DÒNG INPUT "THÊM MÔ TẢ" */}
              <View style={styles.descriptionRow}>
                <TextInput
                  style={styles.descriptionInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Thêm mô tả"
                  placeholderTextColor="rgba(255, 255, 255, 0.45)"
                  returnKeyType="done"
                  textAlign="center"
                />
              </View>

              {/* HÀNG "LƯU VÀO" */}
              <View style={styles.saveToSection}>
                <Text style={styles.saveToLabel}>Lưu vào</Text>
                <View style={styles.userDestinationPill}>
                  <View style={styles.userAvatarCircle}>
                    <Text style={styles.userAvatarText}>{userInitial}</Text>
                  </View>
                  <Text style={styles.userDestinationText}>Của bạn</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* 4. NÚT TO BẢN DƯỚI CÙNG: LƯU ✔ */}
          <View style={styles.bottomCtaWrapper}>
            <TouchableOpacity
              style={styles.bigSaveButton}
              onPress={handleSave}
              activeOpacity={0.88}
            >
              <Text style={styles.bigSaveButtonText}>Lưu ✔</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#090C10', // Đen mun sang trọng chuẩn Locket
    justifyContent: 'space-between',
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // 1. Top Header
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  circleHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitMoneyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.full,
  },
  splitMoneyText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // 2. Scroll Body & Khung Squircle
  scrollBody: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  locketSquircleFrame: {
    width: FRAME_WIDTH,
    maxHeight: SCREEN_HEIGHT * 0.48,
    aspectRatio: 4 / 5,
    borderRadius: 38, // Bo cong tròn cực lớn chuẩn Locket
    overflow: 'hidden',
    backgroundColor: '#141A23',
    position: 'relative',
    marginVertical: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  onPhotoTagPill: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(24, 28, 36, 0.72)',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: radii.full,
    backdropFilter: 'blur(10px)',
  },
  onPhotoTagText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  onPhotoTypeSwitchPill: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(20, 24, 32, 0.78)',
    padding: 3,
    borderRadius: radii.full,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: radii.full,
  },
  typeBtnActiveExpense: {
    backgroundColor: '#C86D51',
  },
  typeBtnActiveIncome: {
    backgroundColor: '#7E9F80',
  },
  typeBtnText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 12.5,
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Tag picker phụ
  tagPickerScroll: {
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tagItemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
  },
  tagItemPillActive: {
    backgroundColor: Colors.primaryYellow,
  },
  tagItemText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  tagItemTextActive: {
    color: '#111822',
    fontWeight: '700',
  },

  // 3. Bên dưới khung ảnh
  postPhotoInfoSection: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 6,
    gap: 8,
  },
  bigAmountRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountDisplayTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bigAmountText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.6,
  },
  amountInputInlineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountTextInput: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.6,
    minWidth: 100,
    textAlign: 'center',
    padding: 0,
  },
  bigAmountUnit: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginLeft: 4,
  },
  descriptionRow: {
    width: '80%',
    alignItems: 'center',
  },
  descriptionInput: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 4,
    width: '100%',
  },

  // Hàng Lưu vào
  saveToSection: {
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  saveToLabel: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 12,
    fontWeight: '500',
  },
  userDestinationPill: {
    alignItems: 'center',
    gap: 4,
  },
  userAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#71E3FF', // Màu cyan rực rỡ như Locket
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userAvatarText: {
    color: '#0A131C',
    fontSize: 14,
    fontWeight: '800',
  },
  userDestinationText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },

  // 4. Nút Lưu to bản dưới đáy
  bottomCtaWrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  bigSaveButton: {
    width: '100%',
    height: 52,
    borderRadius: radii.full,
    backgroundColor: '#5CE1E6', // Màu Cyan ngọc Locket rực rỡ (hoặc Vàng theo theme)
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5CE1E6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  bigSaveButtonText: {
    color: '#09121D',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
