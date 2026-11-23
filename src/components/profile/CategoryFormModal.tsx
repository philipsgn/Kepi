import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Check, Sparkles, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { radii, spacing } from '../../theme/tokens';
import { CategoryItem, CategoryType } from '../../types/category';
import {
  AVAILABLE_CATEGORY_ICONS,
  CATEGORY_ICON_MAP,
  CATEGORY_PALETTE,
} from '../../constants/categoryDefaults';

export interface CategoryFormModalProps {
  visible: boolean;
  initialType?: CategoryType;
  categoryToEdit?: CategoryItem | null;
  onClose: () => void;
  onSave: (category: {
    type: CategoryType;
    name: string;
    icon: string;
    color: string;
  }) => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  visible,
  initialType = 'EXPENSE',
  categoryToEdit,
  onClose,
  onSave,
}) => {
  const { tokens, isDark, mode } = useTheme();
  const isPink = mode === 'pink';
  const isHeocon = true; // Cả Heo Con và Pastel Pink đều chuẩn Neo-Brutalist Pixel Art 100%
  const cardBg = isPink ? '#FFFFFF' : '#FFFBF1';
  const cardBorder = isPink ? '#3B0713' : '#2B2118';
  const inkText = isPink ? '#3B0713' : '#2B2118';
  const inkMuted = isPink ? '#834758' : '#6E5D4F';
  const pageBg = isPink ? '#FFF5F7' : '#F6EEDC';
  const chipBg = isPink ? '#FCE7F3' : '#FFF4CC';
  const accentBtn = isPink ? '#F43F5E' : '#F4B93B';

  const [type, setType] = useState<CategoryType>(initialType);
  const [name, setName] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string>('Utensils');
  const [selectedColor, setSelectedColor] = useState<string>(CATEGORY_PALETTE[0]);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (visible) {
      if (categoryToEdit) {
        setType(categoryToEdit.type);
        setName(categoryToEdit.name);
        setSelectedIcon(categoryToEdit.icon);
        setSelectedColor(categoryToEdit.color);
      } else {
        setType(initialType);
        setName('');
        setSelectedIcon(initialType === 'INCOME' ? 'Wallet' : 'Utensils');
        setSelectedColor(initialType === 'INCOME' ? '#27AE60' : '#E59844');
      }
      setErrorMsg('');
    }
  }, [visible, categoryToEdit, initialType]);

  const handleSelectType = (newType: CategoryType) => {
    if (newType !== type) {
      Haptics.selectionAsync();
      setType(newType);
      if (!categoryToEdit) {
        setSelectedIcon(newType === 'INCOME' ? 'Wallet' : 'Utensils');
        setSelectedColor(newType === 'INCOME' ? '#27AE60' : '#E59844');
      }
    }
  };

  const handleSelectIcon = (iconName: string) => {
    Haptics.selectionAsync();
    setSelectedIcon(iconName);
  };

  const handleSelectColor = (colorHex: string) => {
    Haptics.selectionAsync();
    setSelectedColor(colorHex);
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setErrorMsg('Vui lòng nhập tên danh mục');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave({
      type,
      name: trimmed,
      icon: selectedIcon,
      color: selectedColor,
    });
    onClose();
  };

  const PreviewIconComp = CATEGORY_ICON_MAP[selectedIcon] || Sparkles;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            isHeocon
              ? {
                  backgroundColor: pageBg,
                  borderColor: cardBorder,
                  borderTopWidth: 3,
                  borderLeftWidth: 3,
                  borderRightWidth: 3,
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                }
              : {
                  backgroundColor: tokens.surface,
                  borderColor: tokens.border,
                },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.headerRow,
              {
                borderBottomColor: isHeocon ? '#2B2118' : tokens.border,
                borderBottomWidth: isHeocon ? 2 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.sheetTitle,
                { color: inkText },
                isHeocon && { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800', fontSize: 18 },
              ]}
            >
              {categoryToEdit ? 'Chỉnh Sửa Danh Mục' : 'Tạo Danh Mục Mới'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                isHeocon
                  ? {
                      backgroundColor: '#FFF4CC',
                      borderWidth: 2,
                      borderColor: cardBorder,
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                    }
                  : { backgroundColor: tokens.surfaceAlt },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color={isHeocon ? '#2B2118' : tokens.textMuted} strokeWidth={2.6} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 1. Chọn Luồng: Chi Tiêu / Thu Nhập */}
            <View
              style={[
                styles.typeSegment,
                isHeocon
                  ? {
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      borderWidth: 2.5,
                      borderRadius: 16,
                      padding: 4,
                    }
                  : { backgroundColor: tokens.surfaceAlt },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  type === 'EXPENSE' && [
                    styles.typeBtnActive,
                    isHeocon
                      ? {
                          backgroundColor: '#F4B93B',
                          borderWidth: 2,
                          borderColor: cardBorder,
                          borderRadius: 12,
                          shadowColor: cardBorder,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 1,
                          shadowRadius: 0,
                          elevation: 2,
                        }
                      : { backgroundColor: tokens.primary },
                  ],
                ]}
                onPress={() => handleSelectType('EXPENSE')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.typeText,
                    isHeocon
                      ? {
                          color: '#2B2118',
                          fontFamily: 'Baloo2_800ExtraBold',
                          fontWeight: '800',
                        }
                      : {
                          color:
                            type === 'EXPENSE'
                              ? tokens.textOnPrimary
                              : tokens.textMuted,
                          fontWeight: type === 'EXPENSE' ? '700' : '500',
                        },
                  ]}
                >
                  🔴 Chi Tiêu
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  type === 'INCOME' && [
                    styles.typeBtnActive,
                    isHeocon
                      ? {
                          backgroundColor: '#F4B93B',
                          borderWidth: 2,
                          borderColor: cardBorder,
                          borderRadius: 12,
                          shadowColor: cardBorder,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 1,
                          shadowRadius: 0,
                          elevation: 2,
                        }
                      : { backgroundColor: tokens.primary },
                  ],
                ]}
                onPress={() => handleSelectType('INCOME')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.typeText,
                    isHeocon
                      ? {
                          color: '#2B2118',
                          fontFamily: 'Baloo2_800ExtraBold',
                          fontWeight: '800',
                        }
                      : {
                          color:
                            type === 'INCOME'
                              ? tokens.textOnPrimary
                              : tokens.textMuted,
                          fontWeight: type === 'INCOME' ? '700' : '500',
                        },
                  ]}
                >
                  🟢 Thu Nhập
                </Text>
              </TouchableOpacity>
            </View>

            {/* 2. Live Preview Badge */}
            <View style={styles.previewBox}>
              <Text
                style={[
                  styles.sectionSubtitle,
                  { color: inkMuted },
                  { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                ]}
              >
                XEM TRƯỚC HIỂN THỊ
              </Text>
              <View
                style={[
                  styles.previewPill,
                  isHeocon
                    ? {
                        backgroundColor: cardBg,
                        borderColor: cardBorder,
                        borderWidth: 2.5,
                        borderRadius: 20,
                        shadowColor: cardBorder,
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                        elevation: 3,
                      }
                    : {
                        backgroundColor: tokens.surfaceAlt,
                        borderColor: selectedColor,
                      },
                ]}
              >
                <View
                  style={[
                    styles.previewIconCircle,
                    { backgroundColor: selectedColor },
                    isHeocon && {
                      borderWidth: 2,
                      borderColor: cardBorder,
                    },
                  ]}
                >
                  <PreviewIconComp size={16} color="#FFFFFF" strokeWidth={2.4} />
                </View>
                <Text
                  style={[
                    styles.previewName,
                    { color: inkText },
                    { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                  ]}
                  numberOfLines={1}
                >
                  {name.trim() || 'Tên danh mục'}
                </Text>
              </View>
            </View>

            {/* 3. Tên Danh Mục */}
            <View style={styles.fieldBlock}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: inkText },
                  isHeocon && { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800', fontSize: 13.5 },
                ]}
              >
                Tên Danh Mục *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  isHeocon
                    ? {
                        backgroundColor: cardBg,
                        borderColor: errorMsg ? tokens.danger : '#2B2118',
                        borderWidth: 2.5,
                        borderRadius: 14,
                        color: '#2B2118',
                        fontFamily: 'Nunito',
                        fontWeight: '700',
                        height: 46,
                      }
                    : {
                        backgroundColor: tokens.surfaceAlt,
                        borderColor: errorMsg ? tokens.danger : tokens.border,
                        color: tokens.text,
                      },
                ]}
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder={
                  type === 'INCOME'
                    ? 'Ví dụ: Tiền thưởng, Bán đồ cũ, Được cho...'
                    : 'Ví dụ: Cho mẹ, Nuôi mèo, Cà phê, Quần áo...'
                }
                placeholderTextColor={isHeocon ? '#8A7A6A' : tokens.textMuted}
                maxLength={30}
                returnKeyType="done"
              />
              {errorMsg ? (
                <Text
                  style={[
                    styles.errorText,
                    { color: tokens.danger },
                    { fontFamily: 'Nunito', fontWeight: '700' },
                  ]}
                >
                  {errorMsg}
                </Text>
              ) : null}
            </View>

            {/* 4. Chọn Màu Sắc Đại Diện */}
            <View style={styles.fieldBlock}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: inkText },
                  isHeocon && { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800', fontSize: 13.5 },
                ]}
              >
                Màu Sắc Đại Diện
              </Text>
              <View style={styles.paletteRow}>
                {CATEGORY_PALETTE.map((colorHex) => {
                  const isSelected = selectedColor === colorHex;
                  return (
                    <TouchableOpacity
                      key={colorHex}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: colorHex },
                        isHeocon && {
                          borderWidth: isSelected ? 3 : 2,
                          borderColor: cardBorder,
                        },
                        isSelected && !isHeocon && styles.colorCircleSelected,
                      ]}
                      onPress={() => handleSelectColor(colorHex)}
                      activeOpacity={0.8}
                    >
                      {isSelected ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 5. Chọn Biểu Tượng Vector */}
            <View style={styles.fieldBlock}>
              <Text
                style={[
                  styles.fieldLabel,
                  { color: inkText },
                  isHeocon && { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800', fontSize: 13.5 },
                ]}
              >
                Biểu Tượng Vector
              </Text>
              <View style={styles.iconsGrid}>
                {AVAILABLE_CATEGORY_ICONS.map((iconKey) => {
                  const IconComponent = CATEGORY_ICON_MAP[iconKey] || Sparkles;
                  const isSelected = selectedIcon === iconKey;
                  return (
                    <TouchableOpacity
                      key={iconKey}
                      style={[
                        styles.iconGridItem,
                        isHeocon
                          ? {
                              backgroundColor: isSelected ? selectedColor : '#FFFBF1',
                              borderColor: cardBorder,
                              borderWidth: 2,
                              borderRadius: 12,
                              shadowColor: cardBorder,
                              shadowOffset: { width: 0, height: isSelected ? 2 : 1 },
                              shadowOpacity: 1,
                              shadowRadius: 0,
                              elevation: isSelected ? 2 : 1,
                            }
                          : {
                              backgroundColor: isSelected
                                ? selectedColor
                                : tokens.surfaceAlt,
                              borderColor: isSelected
                                ? selectedColor
                                : tokens.border,
                            },
                      ]}
                      onPress={() => handleSelectIcon(iconKey)}
                      activeOpacity={0.7}
                    >
                      <IconComponent
                        size={20}
                        color={isSelected ? '#FFFFFF' : (isHeocon ? '#2B2118' : tokens.text)}
                        strokeWidth={2.4}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View
            style={[
              styles.footerRow,
              isHeocon
                ? {
                    backgroundColor: pageBg,
                    borderTopWidth: 2,
                    borderTopColor: cardBorder,
                  }
                : { borderTopColor: tokens.border },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                isHeocon
                  ? {
                      backgroundColor: cardBg,
                      borderWidth: 2.5,
                      borderColor: cardBorder,
                      shadowColor: cardBorder,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 2,
                    }
                  : { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
              ]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.cancelBtnText,
                  { color: inkMuted },
                  { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                ]}
              >
                Hủy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                isHeocon
                  ? {
                      backgroundColor: '#F4B93B',
                      borderWidth: 3,
                      borderColor: cardBorder,
                      borderRadius: 22,
                      shadowColor: cardBorder,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 4,
                    }
                  : { backgroundColor: tokens.primary, shadowColor: tokens.glowColor },
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.submitBtnText,
                  isHeocon
                    ? { color: '#2B2118', fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800', fontSize: 16 }
                    : { color: tokens.textOnPrimary },
                ]}
              >
                {categoryToEdit ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    flex: 1,
  },
  sheetContainer: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  typeSegment: {
    flexDirection: 'row',
    borderRadius: radii.full,
    padding: 3,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
  },
  typeBtnActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeText: {
    fontSize: 13,
  },
  previewBox: {
    alignItems: 'center',
    gap: 6,
    marginVertical: 4,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  previewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    borderWidth: 1.5,
    gap: 8,
  },
  previewIconCircle: {
    width: 26,
    height: 26,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewName: {
    fontSize: 14,
    fontWeight: '700',
  },
  fieldBlock: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  errorText: {
    fontSize: 11.5,
    marginTop: 2,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleSelected: {
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.15 }],
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  iconGridItem: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
