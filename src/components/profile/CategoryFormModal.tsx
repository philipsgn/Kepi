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
  const { tokens, isDark } = useTheme();

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
            {
              backgroundColor: tokens.surface,
              borderColor: tokens.border,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.headerRow, { borderBottomColor: tokens.border }]}>
            <Text style={[styles.sheetTitle, { color: tokens.text }]}>
              {categoryToEdit ? 'Chỉnh Sửa Danh Mục' : 'Tạo Danh Mục Mới'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: tokens.surfaceAlt }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color={tokens.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 1. Chọn Luồng: Chi Tiêu / Thu Nhập */}
            <View style={[styles.typeSegment, { backgroundColor: tokens.surfaceAlt }]}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  type === 'EXPENSE' && [
                    styles.typeBtnActive,
                    { backgroundColor: tokens.primary },
                  ],
                ]}
                onPress={() => handleSelectType('EXPENSE')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.typeText,
                    {
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
                    { backgroundColor: tokens.primary },
                  ],
                ]}
                onPress={() => handleSelectType('INCOME')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.typeText,
                    {
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
              <Text style={[styles.sectionSubtitle, { color: tokens.textMuted }]}>
                XEM TRƯỚC HIỂN THỊ
              </Text>
              <View
                style={[
                  styles.previewPill,
                  {
                    backgroundColor: tokens.surfaceAlt,
                    borderColor: selectedColor,
                  },
                ]}
              >
                <View
                  style={[
                    styles.previewIconCircle,
                    { backgroundColor: selectedColor },
                  ]}
                >
                  <PreviewIconComp size={16} color="#FFFFFF" strokeWidth={2.2} />
                </View>
                <Text
                  style={[styles.previewName, { color: tokens.text }]}
                  numberOfLines={1}
                >
                  {name.trim() || 'Tên danh mục'}
                </Text>
              </View>
            </View>

            {/* 3. Tên Danh Mục */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: tokens.text }]}>
                Tên Danh Mục *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
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
                placeholderTextColor={tokens.textMuted}
                maxLength={30}
                returnKeyType="done"
              />
              {errorMsg ? (
                <Text style={[styles.errorText, { color: tokens.danger }]}>
                  {errorMsg}
                </Text>
              ) : null}
            </View>

            {/* 4. Chọn Màu Sắc Đại Diện */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: tokens.text }]}>
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
                        isSelected && styles.colorCircleSelected,
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
              <Text style={[styles.fieldLabel, { color: tokens.text }]}>
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
                        {
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
                        color={isSelected ? '#FFFFFF' : tokens.text}
                        strokeWidth={2}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footerRow, { borderTopColor: tokens.border }]}>
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
              ]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelBtnText, { color: tokens.textMuted }]}>
                Hủy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: tokens.primary, shadowColor: tokens.glowColor },
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={[styles.submitBtnText, { color: tokens.textOnPrimary }]}>
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
