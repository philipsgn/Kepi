import React, { useState, useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowDownLeft, ArrowUpRight, Check, Mic, Minus, Plus, RotateCcw, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { formatVND } from '../../utils/currency';
import { DongMark } from '../neo';
import { useCategoryStore } from '../../store/categoryStore';
import { renderCategoryMonochromeIcon } from '../../constants/categories';
import { MandCashierKeyboard } from '../common/MandCashierKeyboard';
import { radii } from '../../theme/tokens';

export interface InFrameReviewOverlayProps {
  photoUri: string;
  amount: number;
  onAmountChange: (amount: number) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  description: string;
  onDescriptionChange: (text: string) => void;
  type?: 'EXPENSE' | 'INCOME';
  onTypeChange?: (type: 'EXPENSE' | 'INCOME') => void;
  onRetake: () => void;
  onSave: () => void;
  onOpenPhotoRoom?: () => void;
  isSaved?: boolean;
  isRecordingVoice?: boolean;
}

export const InFrameReviewOverlay: React.FC<InFrameReviewOverlayProps> = ({
  photoUri,
  amount,
  onAmountChange,
  category,
  onCategoryChange,
  description,
  onDescriptionChange,
  type = 'EXPENSE',
  onTypeChange,
  onRetake,
  onSave,
  onOpenPhotoRoom,
  isSaved = false,
  isRecordingVoice = false,
}) => {
  const [showKeyboardModal, setShowKeyboardModal] = useState(false);
  const { getExpenseCategories, getIncomeCategories } = useCategoryStore();
  const categories = type === 'INCOME' ? getIncomeCategories() : getExpenseCategories();

  // Tự động gán danh mục mặc định nếu chưa có
  useEffect(() => {
    if (!category && categories.length > 0) {
      onCategoryChange(categories[0].id);
    }
  }, [category, categories]);

  const handleStepAmount = (delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAmt = Math.max(0, amount + delta);
    onAmountChange(newAmt);
  };

  const handleSavePress = () => {
    if (amount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave();
  };

  return (
    <View style={styles.container}>
      {/* ẢNH NỀN CHỤP 100% TRONG KHUNG 4:5 */}
      <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />

      {/* LỚP PHỦ GRADIENT TỐI NHẸ Ở 2 ĐẦU ĐỂ DỄ ĐỌC CHỮ */}
      <LinearGradient
        colors={['rgba(20, 26, 36, 0.65)', 'transparent', 'rgba(20, 26, 36, 0.85)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* NẾU ĐANG GHI ÂM GIỌNG NÓI (VOICE HOLD): HIỂN THỊ SÓNG ÂM TRUNG TÂM */}
      {isRecordingVoice ? (
        <View style={styles.voiceRecordingOverlay} pointerEvents="none">
          <View style={styles.voicePulseCircle}>
            <Mic size={34} color="#FFFBF1" strokeWidth={2.6} />
          </View>
          <Text style={styles.voiceTitle}>Đang nghe bạn nói...</Text>
          <Text style={styles.voiceSub}>Thả tay ra để AI bóc tách món chi tiêu</Text>
        </View>
      ) : !isSaved ? (
        /* TRẠNG THÁI REVIEW & CHỈNH SỬA KHOẢN CHI */
        <View style={styles.contentWrapper}>
          {/* 1. TOP HEADER TRONG KHUNG: CỤM CHỌN CHI/THU */}
          <View style={styles.inFrameTopRow}>
            {onTypeChange ? (
              <View style={styles.typeSegment}>
                <TouchableOpacity
                  style={[styles.typeBtn, type === 'EXPENSE' && styles.typeBtnActiveExpense]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onTypeChange('EXPENSE');
                  }}
                  activeOpacity={0.8}
                >
                  <ArrowUpRight size={13} color={type === 'EXPENSE' ? '#FFFBF1' : '#2B2118'} strokeWidth={2.6} />
                  <Text style={[styles.typeBtnText, type === 'EXPENSE' && styles.typeBtnTextActive]}>Chi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.typeBtn, type === 'INCOME' && styles.typeBtnActiveIncome]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onTypeChange('INCOME');
                  }}
                  activeOpacity={0.8}
                >
                  <ArrowDownLeft size={13} color={type === 'INCOME' ? '#FFFBF1' : '#2B2118'} strokeWidth={2.6} />
                  <Text style={[styles.typeBtnText, type === 'INCOME' && styles.typeBtnTextActive]}>Thu</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>Khoảnh khắc chi tiêu</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.retakeMiniBtn}
              onPress={onRetake}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RotateCcw size={14} color="#2B2118" strokeWidth={2.6} />
              <Text style={styles.retakeMiniText}>Chụp lại</Text>
            </TouchableOpacity>
          </View>

          {/* 2. KHỐI HIỂN THỊ SỐ TIỀN & NÚT BẤM +-5K */}
          <View style={styles.amountSection}>
            <View style={styles.stepContainer}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleStepAmount(-5000)}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Minus size={16} color="#2B2118" strokeWidth={3} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.amountDisplay}
                onPress={() => setShowKeyboardModal(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.amountNumberText}>
                  {amount > 0 ? formatVND(amount).replace(/ đ$/, '') : '0'}
                </Text>
                <DongMark size={18} color="#2B2118" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleStepAmount(5000)}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Plus size={16} color="#2B2118" strokeWidth={3} />
              </TouchableOpacity>
            </View>
            <Text style={styles.touchHintText}>Chạm vào số tiền để gõ bàn phím</Text>
          </View>

          {/* 3. PHẦN DƯỚI: Ô NHẬP TÊN MÓN & DẢI CHIP DANH MỤC */}
          <View style={styles.bottomControlsSection}>
            {/* Ô nhập tên món */}
            <View style={styles.descInputWrapper}>
              <TextInput
                value={description}
                onChangeText={onDescriptionChange}
                placeholder="Nhập tên món chi tiêu..."
                placeholderTextColor="rgba(43, 33, 24, 0.45)"
                style={styles.descTextInput}
                maxLength={45}
                returnKeyType="done"
              />
            </View>

            {/* Dải chip danh mục cuộn ngang */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScrollContent}
              style={styles.chipsScrollView}
            >
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catChip, isSelected && styles.catChipSelected]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onCategoryChange(cat.id);
                    }}
                    activeOpacity={0.8}
                  >
                    {renderCategoryMonochromeIcon({
                      categoryId: cat.id,
                      size: 13,
                      color: isSelected ? '#FFFBF1' : '#2B2118',
                      strokeWidth: 2.6,
                    })}
                    <Text style={[styles.catChipText, isSelected && styles.catChipTextSelected]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* CẶP NÚT HÀNH ĐỘNG DƯỚI ĐÁY KHUNG 4:5 */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.btnRetake]}
                onPress={onRetake}
                activeOpacity={0.85}
              >
                <X size={16} color="#2B2118" strokeWidth={2.8} />
                <Text style={styles.btnRetakeText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  styles.btnSave,
                  amount <= 0 && { opacity: 0.5 },
                ]}
                onPress={handleSavePress}
                activeOpacity={0.85}
                disabled={amount <= 0}
              >
                <Check size={18} color="#2B2118" strokeWidth={3} />
                <Text style={styles.btnSaveText}>Lưu vào ví</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : (
        /* TRẠNG THÁI ĐÃ LƯU THÀNH CÔNG (HIỂN THỊ NÚT XEM Ở PHÒNG ẢNH) */
        <View style={styles.savedCardContainer}>
          <View style={styles.savedPill}>
            <Text style={styles.savedTitle}>🎉 Heo đã treo ảnh lên tường!</Text>
            <Text style={styles.savedSub}>
              {description || 'Khoản chi'} · −{formatVND(amount)}
            </Text>
          </View>

          <View style={styles.savedActionRow}>
            <TouchableOpacity style={styles.savedBtnAgain} onPress={onRetake} activeOpacity={0.85}>
              <Text style={styles.savedBtnAgainText}>+ Chụp tiếp</Text>
            </TouchableOpacity>

            {onOpenPhotoRoom && (
              <TouchableOpacity style={styles.savedBtnRoom} onPress={onOpenPhotoRoom} activeOpacity={0.85}>
                <Text style={styles.savedBtnRoomText}>🖼️ Xem ở phòng ảnh</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* MODAL BÀN PHÍM MAND CASHIER KEYBOARD KHI CHẠM VÀO SỐ TIỀN */}
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
              submitText="Xác nhận ✔"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
  },
  voiceRecordingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  voicePulseCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E0452B',
    borderWidth: 3.5,
    borderColor: '#FFFBF1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  voiceTitle: {
    fontFamily: 'Nunito',
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFBF1',
    textAlign: 'center',
  },
  voiceSub: {
    fontFamily: 'Nunito',
    fontSize: 13,
    color: 'rgba(255, 251, 241, 0.85)',
    marginTop: 6,
    textAlign: 'center',
  },
  inFrameTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  typeSegment: {
    flexDirection: 'row',
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 999,
    padding: 2,
    gap: 4,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    gap: 3,
  },
  typeBtnActiveExpense: {
    backgroundColor: '#E0452B',
  },
  typeBtnActiveIncome: {
    backgroundColor: '#5E9A57',
  },
  typeBtnText: {
    fontFamily: 'Nunito',
    fontSize: 12,
    fontWeight: '800',
    color: '#2B2118',
  },
  typeBtnTextActive: {
    color: '#FFFBF1',
  },
  typeBadge: {
    backgroundColor: '#FFFBF1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#2B2118',
  },
  typeBadgeText: {
    fontFamily: 'Nunito',
    fontSize: 12,
    fontWeight: '800',
    color: '#2B2118',
  },
  retakeMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#2B2118',
    gap: 4,
  },
  retakeMiniText: {
    fontFamily: 'Nunito',
    fontSize: 11,
    fontWeight: '800',
    color: '#2B2118',
  },
  amountSection: {
    alignItems: 'center',
    marginVertical: 4,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 4,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  amountNumberText: {
    fontFamily: 'Baloo2-Bold',
    fontSize: 22,
    fontWeight: '800',
    color: '#2B2118',
    fontVariant: ['tabular-nums'],
  },
  touchHintText: {
    fontFamily: 'Nunito',
    fontSize: 10,
    color: '#FFFBF1',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomControlsSection: {
    gap: 6,
  },
  descInputWrapper: {
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  descTextInput: {
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '700',
    color: '#2B2118',
    padding: 0,
  },
  chipsScrollView: {
    maxHeight: 34,
  },
  chipsScrollContent: {
    gap: 6,
    alignItems: 'center',
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF1',
    borderWidth: 1.5,
    borderColor: '#2B2118',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  catChipSelected: {
    backgroundColor: '#F4B93B',
    borderWidth: 2,
  },
  catChipText: {
    fontFamily: 'Nunito',
    fontSize: 11,
    fontWeight: '700',
    color: '#2B2118',
  },
  catChipTextSelected: {
    fontWeight: '800',
    color: '#2B2118',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    gap: 6,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  btnRetake: {
    backgroundColor: '#FFFBF1',
  },
  btnRetakeText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '800',
    color: '#2B2118',
  },
  btnSave: {
    backgroundColor: '#F4B93B',
  },
  btnSaveText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '800',
    color: '#2B2118',
  },
  savedCardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  savedPill: {
    backgroundColor: '#FFFBF1',
    borderWidth: 3,
    borderColor: '#2B2118',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  savedTitle: {
    fontFamily: 'Baloo2-Bold',
    fontSize: 16,
    fontWeight: '800',
    color: '#2B2118',
    textAlign: 'center',
  },
  savedSub: {
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '700',
    color: '#7C7F78',
    marginTop: 4,
    textAlign: 'center',
  },
  savedActionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  savedBtnAgain: {
    flex: 1,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  savedBtnAgainText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '800',
    color: '#2B2118',
  },
  savedBtnRoom: {
    flex: 1.2,
    backgroundColor: '#2B2118',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  savedBtnRoomText: {
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFBF1',
  },
  keyboardModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardModalContent: {
    backgroundColor: '#FAF6EC',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 3,
    borderColor: '#2B2118',
    paddingTop: 12,
    paddingBottom: 20,
  },
  keyboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  keyboardTitle: {
    fontFamily: 'Baloo2-Bold',
    fontSize: 16,
    fontWeight: '800',
    color: '#2B2118',
  },
});
