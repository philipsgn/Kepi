import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, Check, ChevronRight, Minus, Plus, RotateCcw, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { formatVND } from '../../utils/currency';
import { DongMark, NeoButton } from '../neo';
import { useCategoryStore } from '../../store/categoryStore';
import { renderCategoryMonochromeIcon } from '../../constants/categories';
import { MandCashierKeyboard } from '../common/MandCashierKeyboard';

export interface PolaroidReviewCardProps {
  photoUri: string;
  amount: number;
  onAmountChange: (amt: number) => void;
  category: string;
  onCategoryChange: (cat: string) => void;
  description: string;
  onDescriptionChange: (desc: string) => void;
  type?: 'EXPENSE' | 'INCOME';
  onRetake: () => void;
  onSave: () => void;
  onOpenPhotoRoom?: () => void;
  isSaved?: boolean;
}

export const PolaroidReviewCard: React.FC<PolaroidReviewCardProps> = ({
  photoUri,
  amount,
  onAmountChange,
  category,
  onCategoryChange,
  description,
  onDescriptionChange,
  type = 'EXPENSE',
  onRetake,
  onSave,
  onOpenPhotoRoom,
  isSaved = false,
}) => {
  const [showKeyboardModal, setShowKeyboardModal] = useState(false);
  const { getExpenseCategories } = useCategoryStore();
  const categories = getExpenseCategories();

  const handleStepAmount = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAmt = Math.max(0, amount + delta);
    onAmountChange(newAmt);
  };

  const handleSavePress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave();
  };

  return (
    <View style={styles.overlayContainer}>
      {/* 1. THẺ POLAROID RETRO CHUẨN PROTOTYPE (NGHIÊNG -3 ĐỘ) */}
      <View style={styles.polaroidFrame}>
        {/* Khung ảnh vuông 1:1 */}
        <View style={styles.photoBox}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoImage} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={{ fontSize: 32 }}>📸</Text>
            </View>
          )}
        </View>

        {/* Thông tin & Tên món chi tiêu */}
        <View style={styles.polaroidInfo}>
          <TextInput
            style={styles.descInput}
            value={description}
            onChangeText={onDescriptionChange}
            placeholder="Tên món chi tiêu (vd: Cà phê sáng)..."
            placeholderTextColor="#85735E"
            maxLength={40}
          />

          {/* Dải chọn danh mục nhanh */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {categories.slice(0, 6).map((cat) => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catChip,
                    isSelected && styles.catChipSelected,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onCategoryChange(cat.id);
                  }}
                  activeOpacity={0.8}
                >
                  {renderCategoryMonochromeIcon({
                    categoryId: cat.id,
                    size: 14,
                    color: isSelected ? '#FFFBF1' : '#2B2118',
                  })}
                  <Text
                    style={[
                      styles.catChipText,
                      isSelected && styles.catChipTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bộ nấc tăng giảm giá nhanh [-5k] [SỐ TIỀN] [+5k] */}
          <View style={styles.stepContainer}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => handleStepAmount(-5000)}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Minus size={18} color="#2B2118" strokeWidth={3} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.amountDisplay}
              onPress={() => setShowKeyboardModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.amountText}>
                {amount > 0 ? formatVND(amount).replace(/ đ$/, '') : '0'}
              </Text>
              <DongMark size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => handleStepAmount(5000)}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Plus size={18} color="#2B2118" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 2. CỤM NÚT HÀNH ĐỘNG DƯỚI THẺ POLAROID */}
      {!isSaved ? (
        <View style={styles.actionRow}>
          <NeoButton
            variant="cream"
            onPress={onRetake}
            style={styles.actionBtn}
          >
            <RotateCcw size={18} color="#2B2118" strokeWidth={2.4} />
            <Text style={styles.btnText}>Chụp lại</Text>
          </NeoButton>

          <NeoButton
            variant="gold"
            onPress={handleSavePress}
            style={[styles.actionBtn, styles.saveBtn]}
            disabled={amount <= 0 || !category}
          >
            <Check size={20} color="#2B2118" strokeWidth={2.8} />
            <Text style={[styles.btnText, { fontWeight: '800' }]}>Lưu vào ví</Text>
          </NeoButton>
        </View>
      ) : (
        /* TRẠNG THÁI ĐÃ LƯU THÀNH CÔNG CHUẨN PROTOTYPE */
        <View style={styles.savedCard}>
          <Text style={styles.savedTitle}>🎉 Heo đã treo ảnh lên tường!</Text>
          <Text style={styles.savedSub}>
            {description || 'Khoản chi'} · −{formatVND(amount)}
          </Text>
          <View style={styles.savedActionRow}>
            <NeoButton variant="cream" onPress={onRetake} style={{ flex: 1 }}>
              <Text style={styles.btnText}>Chụp tiếp</Text>
            </NeoButton>
            {onOpenPhotoRoom && (
              <NeoButton variant="dark" onPress={onOpenPhotoRoom} style={{ flex: 1.2 }}>
                <Text style={[styles.btnText, { color: '#FFFBF1' }]}>Xem ở phòng ảnh</Text>
              </NeoButton>
            )}
          </View>
        </View>
      )}

      {/* 3. MODAL BÀN PHÍM MAND CASHIER KEYBOARD KHI CHẠM VÀO SỐ TIỀN */}
      <Modal visible={showKeyboardModal} animationType="slide" transparent>
        <View style={styles.keyboardModalOverlay}>
          <View style={styles.keyboardModalContent}>
            <View style={styles.keyboardHeader}>
              <Text style={styles.keyboardTitle}>Nhập số tiền chi tiêu</Text>
              <TouchableOpacity
                onPress={() => setShowKeyboardModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={22} color="#2B2118" strokeWidth={2.6} />
              </TouchableOpacity>
            </View>

            <MandCashierKeyboard
              amount={amount}
              onChangeAmount={onAmountChange}
              category={category}
              onChangeCategory={onCategoryChange}
              type={type}
              onSubmit={() => setShowKeyboardModal(false)}
              submitText="Xong"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(20, 26, 36, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 50,
  },
  polaroidFrame: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderWidth: 3.5,
    borderColor: '#2B2118',
    borderRadius: 14,
    padding: 10,
    paddingBottom: 16,
    transform: [{ rotate: '-3deg' }],
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  photoBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#DDEBD9',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  polaroidInfo: {
    marginTop: 12,
  },
  descInput: {
    fontFamily: 'Nunito',
    fontSize: 15,
    fontWeight: '800',
    color: '#2B2118',
    borderBottomWidth: 2,
    borderBottomColor: '#D9C9A4',
    paddingVertical: 4,
    marginBottom: 8,
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    marginRight: 6,
  },
  catChipSelected: {
    backgroundColor: '#2B2118',
  },
  catChipText: {
    fontFamily: 'Nunito',
    fontSize: 12,
    fontWeight: '700',
    color: '#2B2118',
  },
  catChipTextSelected: {
    color: '#FFFBF1',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  amountDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F6EEDC',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 12,
  },
  amountText: {
    fontFamily: 'Baloo 2',
    fontSize: 22,
    fontWeight: '800',
    color: '#2B2118',
    fontVariant: ['tabular-nums'],
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
    width: '100%',
    maxWidth: 340,
  },
  actionBtn: {
    flex: 1,
    justifyContent: 'center',
  },
  saveBtn: {
    backgroundColor: '#F4B93B',
  },
  btnText: {
    fontFamily: 'Nunito',
    fontSize: 14,
    fontWeight: '700',
    color: '#2B2118',
  },
  savedCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFBF1',
    borderWidth: 3,
    borderColor: '#2B2118',
    borderRadius: 16,
    padding: 16,
    marginTop: 18,
    alignItems: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  savedTitle: {
    fontFamily: 'Baloo 2',
    fontSize: 18,
    fontWeight: '800',
    color: '#2B2118',
    marginBottom: 4,
  },
  savedSub: {
    fontFamily: 'Nunito',
    fontSize: 14,
    color: '#85735E',
    fontWeight: '700',
    marginBottom: 14,
  },
  savedActionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  keyboardModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardModalContent: {
    backgroundColor: '#FFFBF1',
    borderTopWidth: 3.5,
    borderTopColor: '#2B2118',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  keyboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: '#D9C9A4',
    marginBottom: 10,
  },
  keyboardTitle: {
    fontFamily: 'Baloo 2',
    fontSize: 17,
    fontWeight: '800',
    color: '#2B2118',
  },
});
