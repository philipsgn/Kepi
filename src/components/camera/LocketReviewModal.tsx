import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Users,
  X,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { PaymentMethod, TransactionType } from '../../types/database';
import { useCategoryStore } from '../../store/categoryStore';
import { getCategoryConfig } from '../../constants/categories';
import { MandCashierKeyboard } from '../common/MandCashierKeyboard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FRAME_WIDTH = Math.min(SCREEN_WIDTH - 32, 340);

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

/**
 * Màn Hình Review Chụp Ảnh Chuẩn Dáng Locket Tích Hợp MandCashierKeyboard (DiDi Mand Mobile)
 * - Khung ảnh Squircle bo tròn lớn ở nửa trên
 * - Pill chuyển [ Chi | Thu ] sát mép đáy ảnh
 * - MandCashierKeyboard mở sẵn tức thì dưới đáy:
 *   + Dải danh mục cuộn ngang (Micro Category Strip) 1-chạm
 *   + Số tiền to bản tabular-nums
 *   + Bàn phím số 4 cột với phím 000 siêu tốc và nút Lưu ✔ to bản 3 hàng
 * - Triệt tiêu 100% bàn phím hệ điều hành nhảy giật, hoàn tất ghi sổ $\le 2$ giây
 */
export const LocketReviewModal: React.FC<LocketReviewModalProps> = ({
  visible,
  photoUri,
  initialAmount = 50000,
  initialDescription = '',
  initialCategory = 'an_uong',
  initialType = 'EXPENSE',
  onClose,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const { tokens, isDark } = useTheme();
  const { getExpenseCategories, getIncomeCategories, getCategoryById } = useCategoryStore();

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<number>(initialAmount > 0 ? initialAmount : 50000);
  const [description, setDescription] = useState<string>(initialDescription);
  const [category, setCategory] = useState<string>(initialCategory);

  // Đồng bộ lại khi props đổi
  React.useEffect(() => {
    if (visible) {
      setType(initialType);
      setAmount(initialAmount > 0 ? initialAmount : 50000);
      setDescription(initialDescription);
      setCategory(initialCategory);
    }
  }, [visible, initialAmount, initialDescription, initialCategory, initialType]);

  const currentCatObj = getCategoryById(category);

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
    const defaultLabel = currentCatObj?.name || getCategoryConfig(category).label || (type === 'INCOME' ? 'Khoản thu' : 'Chi tiêu');
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
      <View style={[styles.rootContainer, { paddingTop: insets.top + 4, paddingBottom: insets.bottom + 4 }]}>
        {/* ================= 1. TOP HEADER: [ X ]    [ Chia tiền ]    [ Download ] ================= */}
        <View style={styles.topHeaderBar}>
          <TouchableOpacity
            style={styles.circleHeaderBtn}
            onPress={onClose}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Đóng màn hình xem lại"
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
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Tải ảnh về máy"
          >
            <Download size={18} color="#FFFFFF" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* ================= 2. KHUNG ẢNH SQUIRCLE BO GÓC 28PX (LOCKET FRAME) ================= */}
        <View style={styles.photoContainer}>
          <View style={styles.locketSquircleFrame}>
            <Image
              source={{ uri: photoUri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />

            {/* PILL CHUYỂN [ ↗ Chi | ↘ Thu ] SÁT ĐÁY ẢNH */}
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
                  size={12}
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
                  size={12}
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

          {/* Ô NHẬP MÔ TẢ NGẮN MỎNG NHẸ */}
          <View style={styles.descriptionRow}>
            <TextInput
              style={[styles.descriptionInput, { color: tokens.text, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Thêm ghi chú ngắn (tùy chọn)..."
              placeholderTextColor={tokens.textMuted}
              returnKeyType="done"
              textAlign="center"
              maxLength={40}
            />
          </View>
        </View>

        {/* ================= 3. BÀN PHÍM TÀI CHÍNH MAND CASHIER KEYBOARD MỞ SẴN ================= */}
        <MandCashierKeyboard
          amount={amount}
          onChangeAmount={setAmount}
          category={category}
          onChangeCategory={setCategory}
          type={type}
          onSubmit={handleSave}
          submitText="Lưu ✔"
        />
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

  // 1. Top Header
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  circleHeaderBtn: {
    width: 36,
    height: 36,
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
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radii.full,
  },
  splitMoneyText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },

  // 2. Photo Section
  photoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  locketSquircleFrame: {
    width: FRAME_WIDTH,
    height: Math.min(SCREEN_HEIGHT * 0.32, 260),
    aspectRatio: 4 / 5,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#141A23',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  // Pill Chi / Thu ở đáy ảnh
  onPhotoTypeSwitchPill: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 20, 0.78)',
    borderRadius: radii.full,
    padding: 2.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.full,
  },
  typeBtnActiveExpense: {
    backgroundColor: '#C86D51',
  },
  typeBtnActiveIncome: {
    backgroundColor: '#7E9F80',
  },
  typeBtnText: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Mô tả ngắn
  descriptionRow: {
    width: FRAME_WIDTH,
    marginTop: 8,
    alignItems: 'center',
  },
  descriptionInput: {
    fontSize: 12.5,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    width: '100%',
  },
});
