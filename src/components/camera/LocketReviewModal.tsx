import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  Image,
  Modal,
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
  Download,
  Sparkles,
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
import { parseReceiptOcrText } from '../../utils/ai/receiptOcrParser';
import { classifyImageCategory } from '../../utils/ai/visionClassifier';
import { formatVND } from '../../utils/currency';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FRAME_WIDTH = Math.min(SCREEN_WIDTH - 32, 340);

export interface LocketReviewModalProps {
  visible: boolean;
  photoUri: string | null;
  initialAmount?: number;
  initialDescription?: string;
  initialCategory?: string;
  initialType?: TransactionType;
  ocrCandidates?: number[];
  ocrRawText?: string;
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
 * Màn Hình Review Chụp Ảnh Chuẩn Dáng Locket Tích Hợp MandCashierKeyboard & OCR Carousel Fallback
 * - Khung ảnh Squircle bo tròn lớn ở nửa trên
 * - Pill chuyển [ Chi | Thu ] sát mép đáy ảnh
 * - Dải Carousel Fallback Selector (Top 3 số tiền OCR phát hiện ngầm sau khi chụp ảnh)
 * - MandCashierKeyboard mở sẵn tức thì dưới đáy:
 *   + Dải danh mục cuộn ngang (Micro Category Strip) 1-chạm
 *   + Số tiền to bản tabular-nums
 *   + Bàn phím số 4 cột với phím 000 siêu tốc và nút Lưu ✔ to bản 3 hàng
 * - Triệt tiêu 100% bàn phím hệ điều hành nhảy giật, hoàn tất ghi sổ <= 2 giây
 */
export const LocketReviewModal: React.FC<LocketReviewModalProps> = ({
  visible,
  photoUri,
  initialAmount = 50000,
  initialDescription = '',
  initialCategory = 'an_uong',
  initialType = 'EXPENSE',
  ocrCandidates,
  ocrRawText,
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
  const [ocrDetectedAmounts, setOcrDetectedAmounts] = useState<number[]>([]);

  // Đồng bộ lại khi props đổi và trích xuất OCR ngầm
  useEffect(() => {
    if (visible) {
      setType(initialType);
      setAmount(initialAmount > 0 ? initialAmount : 50000);
      setDescription(initialDescription);
      setCategory(initialCategory);

      // 1. Trích xuất ứng viên số tiền từ OCR
      if (ocrCandidates && ocrCandidates.length > 0) {
        setOcrDetectedAmounts(ocrCandidates.slice(0, 3));
      } else if (ocrRawText) {
        const parsed = parseReceiptOcrText(ocrRawText);
        if (parsed.detectedAmounts.length > 0) {
          setOcrDetectedAmounts(parsed.detectedAmounts.slice(0, 3));
          if (initialAmount <= 0 && parsed.totalAmount > 0) {
            setAmount(parsed.totalAmount);
          }
        }
      } else {
        setOcrDetectedAmounts([]);
      }

      // 2. Vision Classifier phân loại ảnh ngoại tuyến tự động
      if (photoUri && (!initialCategory || initialCategory === 'an_uong')) {
        classifyImageCategory(photoUri).then((res) => {
          if (res && res.category) {
            const expList = getExpenseCategories();
            const matched = expList.find((c) =>
              c.name.toLowerCase().includes(res.category.toLowerCase())
            );
            if (matched) {
              setCategory(matched.id);
            }
          }
        }).catch(() => {});
      }
    }
  }, [visible, photoUri, initialAmount, initialDescription, initialCategory, initialType, ocrCandidates, ocrRawText]);

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
    const defaultLabel =
      currentCatObj?.name ||
      getCategoryConfig(category).label ||
      (type === 'INCOME' ? 'Khoản thu' : 'Chi tiêu');
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
              style={[
                styles.descriptionInput,
                { color: tokens.text, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
              ]}
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

        {/* ================= 2.5. CAROUSEL FALLBACK SELECTOR (OCR TOP 3) ================= */}
        {ocrDetectedAmounts.length > 0 && (
          <View style={styles.ocrCarouselContainer}>
            <View style={styles.ocrHeaderRow}>
              <Sparkles size={12} color="#E59844" strokeWidth={2.4} />
              <Text style={styles.ocrLabel}>GỢI Ý OCR (CHẠM ĐỂ CHỌN NHANH):</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ocrScrollContent}
            >
              {ocrDetectedAmounts.map((candidateAmt, idx) => {
                const isSelected = amount === candidateAmt;
                return (
                  <TouchableOpacity
                    key={`${candidateAmt}-${idx}`}
                    style={[
                      styles.ocrChip,
                      isSelected && styles.ocrChipActive,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setAmount(candidateAmt);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.ocrChipText,
                        isSelected && styles.ocrChipTextActive,
                      ]}
                    >
                      {formatVND(candidateAmt)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

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

  // 2.5. OCR Carousel Fallback
  ocrCarouselContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ocrHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  ocrLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E59844',
    letterSpacing: 0.5,
  },
  ocrScrollContent: {
    gap: 8,
  },
  ocrChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  ocrChipActive: {
    backgroundColor: '#E59844',
    borderColor: '#E59844',
  },
  ocrChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  ocrChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
