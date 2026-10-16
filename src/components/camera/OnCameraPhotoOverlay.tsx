import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Tag, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { EXPENSE_CATEGORIES, getCategoryConfig } from '../../constants/categories';
import { useCategoryStore } from '../../store/categoryStore';
import { CATEGORY_ICON_MAP } from '../../constants/categoryDefaults';

interface OnCameraPhotoOverlayProps {
  photoUri: string;
  amount: number;
  onAmountChange: (amount: number) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  description: string;
  onDescriptionChange: (text: string) => void;
  onCancel: () => void;
  showCategoryPicker?: boolean;
  onToggleCategoryPicker?: () => void;
}

/**
 * Định dạng chuỗi số thành các cụm có dấu chấm phân cách hàng nghìn (VD: 200000 -> 200.000)
 */
function formatThousandsString(rawDigits: string): string {
  if (!rawDigits) return '';
  const sanitized = rawDigits.replace(/^0+(?=\d)/, '');
  return sanitized.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export const OnCameraPhotoOverlay: React.FC<OnCameraPhotoOverlayProps> = ({
  photoUri,
  amount,
  onAmountChange,
  category,
  onCategoryChange,
  description,
  onDescriptionChange,
  onCancel,
  showCategoryPicker: externalShowPicker,
  onToggleCategoryPicker,
}) => {
  const [internalShowPicker, setInternalShowPicker] = useState(false);
  const isPickerOpen = externalShowPicker !== undefined ? externalShowPicker : internalShowPicker;

  const hasSelectedCategory = Boolean(category && category.trim().length > 0);

  // Logic nhập nghìn: không hardcore số 56 hay 50k, mặc định trống nếu amount <= 0
  const initialThousands =
    amount > 0 ? formatThousandsString(String(Math.floor(amount / 1000))) : '';
  const [thousandsInput, setThousandsInput] = useState(initialThousands);

  const activeCategory = hasSelectedCategory ? getCategoryConfig(category) : null;
  const { getExpenseCategories, getCategoryById } = useCategoryStore();
  const allExpenseCategories = getExpenseCategories();
  const customCat = hasSelectedCategory ? getCategoryById(category) : null;
  const activeLabel = customCat?.name || (activeCategory ? activeCategory.shortLabel : 'Chọn danh mục');

  useEffect(() => {
    if (amount > 0) {
      setThousandsInput(formatThousandsString(String(Math.floor(amount / 1000))));
    } else {
      setThousandsInput('');
    }
  }, [amount]);

  const handleThousandsChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (!cleaned) {
      setThousandsInput('');
      onAmountChange(0);
      return;
    }

    const sanitized = cleaned.replace(/^0+(?=\d)/, '');
    const formatted = formatThousandsString(sanitized);
    setThousandsInput(formatted);

    const parsed = parseInt(sanitized, 10);
    onAmountChange(isNaN(parsed) ? 0 : parsed * 1000);
  };

  const handleClearAmount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setThousandsInput('');
    onAmountChange(0);
  };

  const toggleCategoryPicker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onToggleCategoryPicker) {
      onToggleCategoryPicker();
    } else {
      setInternalShowPicker((prev) => !prev);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Captured Image (Trọn vẹn, không bị che khuất) */}
      <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />

      {/* Lớp phủ chuyển mờ siêu nhẹ ở đỉnh (70px) để đọc rõ icon */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.45)', 'transparent']}
        style={styles.topGradient}
        pointerEvents="none"
      />

      {/* Lớp phủ chuyển mờ nhẹ ở đáy (120px) cho 2 dòng thông tin */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.65)']}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* ================= TOP CONTROLS (CÂN ĐỐI TRUNG TÂM) ================= */}
      <View style={styles.topBar}>
        {/* Nút Hủy / Chụp lại ✕ bên trái */}
        <TouchableOpacity
          style={styles.circleIconButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onCancel();
          }}
          activeOpacity={0.8}
        >
          <X size={18} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>

        {/* Nút Danh Mục Ở CHÍNH GIỮA: 'Danh mục ▾' -> '[Icon] Tên mục ▾' */}
        <TouchableOpacity
          style={[
            styles.tagButtonCenter,
            !hasSelectedCategory && styles.tagButtonHighlight,
          ]}
          onPress={toggleCategoryPicker}
          activeOpacity={0.8}
        >
          {hasSelectedCategory ? (
            <>
              {customCat && customCat.icon && CATEGORY_ICON_MAP[customCat.icon] ? (
                React.createElement(CATEGORY_ICON_MAP[customCat.icon], {
                  size: 13,
                  color: '#FFFFFF',
                  strokeWidth: 2.2,
                })
              ) : activeCategory ? (
                <activeCategory.Icon size={13} color="#FFFFFF" strokeWidth={2.2} />
              ) : (
                <Tag size={13} color="#FFFFFF" strokeWidth={2.2} />
              )}
              <Text style={styles.tagButtonText}>
                {activeLabel} ▾
              </Text>
            </>
          ) : (
            <>
              <Tag size={13} color="#E59844" strokeWidth={2.4} />
              <Text style={[styles.tagButtonText, { color: '#FAF6EC', fontWeight: '700' }]}>
                Chọn danh mục ▾
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Spacer vô hình bên phải để nút ở giữa luôn cân đối đối xứng */}
        <View style={styles.rightSpacer} />
      </View>

      {/* DẢI CHỌN ĐẦY ĐỦ 100% DANH MỤC KHI BẤM NÚT TAG */}
      {isPickerOpen && (
        <View style={styles.categoryPickerContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPickerList}
          >
            {allExpenseCategories.map((cat) => {
              const isSelected = hasSelectedCategory && cat.id === category;
              const IconComp = CATEGORY_ICON_MAP[cat.icon] || Sparkles;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryPickerChip,
                    isSelected && styles.categoryPickerChipActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onCategoryChange(cat.id);
                    if (onToggleCategoryPicker) {
                      onToggleCategoryPicker();
                    } else {
                      setInternalShowPicker(false);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <IconComp
                    size={12}
                    color={isSelected ? '#0E1620' : '#FFFFFF'}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.categoryPickerChipText,
                      isSelected && styles.categoryPickerChipTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ================= BOTTOM CONTROLS (SÁT ĐÁY TRONG KHUNG ẢNH) ================= */}
      <View style={styles.bottomOverlayContent}>
        {/* DÒNG 1: SỐ TIỀN TỰ TÁCH CHẤM HÀNG NGHÌN KÈM ĐUÔI CỐ ĐỊNH .000 đ (SIZE CHỮ BẰNG NHAU) */}
        <View style={styles.amountDisplayRow}>
          <View style={styles.amountInputGroup}>
            <TextInput
              style={styles.thousandsInput}
              keyboardType="numeric"
              value={thousandsInput}
              onChangeText={handleThousandsChange}
              placeholder="0"
              placeholderTextColor="rgba(255, 255, 255, 0.45)"
            />
            <Text style={styles.fixedSuffix}>.000 đ</Text>
          </View>

          {thousandsInput.length > 0 && (
            <TouchableOpacity onPress={handleClearAmount} style={styles.clearIconButton}>
              <X size={13} color="rgba(255, 255, 255, 0.85)" strokeWidth={2.2} />
            </TouchableOpacity>
          )}
        </View>

        {/* DÒNG 2: Ô NHẬP GHI CHÚ MÔ TẢ TRONG SUỐT SÁT ĐÁY KHUNG */}
        <View style={styles.noteInputContainer}>
          <TextInput
            style={styles.noteTextInput}
            placeholder="Thêm mô tả (gà rán, cà phê...)"
            placeholderTextColor="rgba(255, 255, 255, 0.55)"
            value={description}
            onChangeText={onDescriptionChange}
            maxLength={100}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 38,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 70,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 10,
  },
  circleIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagButtonCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tagButtonHighlight: {
    borderColor: 'rgba(229, 152, 68, 0.7)',
    backgroundColor: 'rgba(20, 26, 36, 0.65)',
  },
  tagButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  rightSpacer: {
    width: 34,
  },
  categoryPickerContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  categoryPickerList: {
    gap: 8,
    paddingVertical: 4,
  },
  categoryPickerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  categoryPickerChipActive: {
    backgroundColor: '#FAF6EC',
    borderColor: '#FAF6EC',
  },
  categoryPickerChipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryPickerChipTextActive: {
    color: '#0E1620',
    fontWeight: '700',
  },
  bottomOverlayContent: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
    zIndex: 10,
  },
  amountDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  amountInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  thousandsInput: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    minWidth: 20,
    padding: 0,
    includeFontPadding: false,
  },
  fixedSuffix: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginLeft: 1,
    includeFontPadding: false,
  },
  clearIconButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteInputContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 7 : 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  noteTextInput: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
