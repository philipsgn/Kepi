import React, { useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Edit3,
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { radii, spacing } from '../../theme/tokens';
import { useCategoryStore } from '../../store/categoryStore';
import { CategoryItem, CategoryType } from '../../types/category';
import { CATEGORY_ICON_MAP } from '../../constants/categoryDefaults';
import { CategoryFormModal } from './CategoryFormModal';

export interface CategoryManagementSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const CategoryManagementSheet: React.FC<CategoryManagementSheetProps> = ({
  visible,
  onClose,
}) => {
  const { tokens, isDark } = useTheme();
  const {
    categories,
    addCategory,
    updateCategory,
    toggleCategoryActive,
    deleteCategory,
    resetToDefaults,
  } = useCategoryStore();

  const [activeTab, setActiveTab] = useState<CategoryType>('EXPENSE');
  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryItem | null>(null);

  const displayedCategories = categories
    .filter((c) => c.type === activeTab)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const expenseCount = categories.filter((c) => c.type === 'EXPENSE').length;
  const incomeCount = categories.filter((c) => c.type === 'INCOME').length;

  const handleOpenAdd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCategoryToEdit(null);
    setFormModalVisible(true);
  };

  const handleOpenEdit = (item: CategoryItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCategoryToEdit(item);
    setFormModalVisible(true);
  };

  const handleToggle = (id: string) => {
    Haptics.selectionAsync();
    toggleCategoryActive(id);
  };

  const handleDelete = (item: CategoryItem) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa danh mục "${item.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await deleteCategory(item.id, false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleResetDefaults = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Khôi phục mặc định',
      'Bạn có muốn đặt lại danh sách danh mục về cài đặt gốc ban đầu?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Khôi phục',
          style: 'destructive',
          onPress: async () => {
            await resetToDefaults();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleSaveForm = async (data: {
    type: CategoryType;
    name: string;
    icon: string;
    color: string;
  }) => {
    if (categoryToEdit) {
      await updateCategory(categoryToEdit.id, data);
    } else {
      await addCategory(data);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: tokens.background }]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: tokens.border }]}>
          <View style={styles.headerTitleCol}>
            <Text style={[styles.title, { color: tokens.text }]}>
              Quản Lý Danh Mục
            </Text>
            <Text style={[styles.subtitle, { color: tokens.textMuted }]}>
              Tùy biến các khoản Thu và Chi theo lối sống của bạn
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleResetDefaults}
              style={[styles.iconActionBtn, { backgroundColor: tokens.surfaceAlt }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <RotateCcw size={16} color={tokens.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.iconActionBtn, { backgroundColor: tokens.surfaceAlt }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color={tokens.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Switcher: Chi Tiêu vs Thu Nhập */}
        <View style={styles.tabContainer}>
          <View
            style={[
              styles.tabTrack,
              { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'EXPENSE' && [
                  styles.tabBtnActive,
                  { backgroundColor: tokens.surface },
                ],
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab('EXPENSE');
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === 'EXPENSE' ? tokens.text : tokens.textMuted,
                    fontWeight: activeTab === 'EXPENSE' ? '700' : '500',
                  },
                ]}
              >
                🔴 Chi Tiêu ({expenseCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'INCOME' && [
                  styles.tabBtnActive,
                  { backgroundColor: tokens.surface },
                ],
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveTab('INCOME');
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === 'INCOME' ? tokens.text : tokens.textMuted,
                    fontWeight: activeTab === 'INCOME' ? '700' : '500',
                  },
                ]}
              >
                🟢 Thu Nhập ({incomeCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danh sách danh mục */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {displayedCategories.map((item) => {
            const IconComp = CATEGORY_ICON_MAP[item.icon] || Sparkles;
            const isItemActive = item.isActive !== false;

            return (
              <View
                key={item.id}
                style={[
                  styles.catCard,
                  {
                    backgroundColor: tokens.surface,
                    borderColor: tokens.border,
                    opacity: isItemActive ? 1 : 0.55,
                  },
                ]}
              >
                {/* Icon tròn có màu đại diện */}
                <View
                  style={[styles.iconCircle, { backgroundColor: item.color }]}
                >
                  <IconComp size={18} color="#FFFFFF" strokeWidth={2.2} />
                </View>

                {/* Thông tin tên & badge */}
                <View style={styles.catInfoCol}>
                  <Text
                    style={[styles.catName, { color: tokens.text }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <View style={styles.tagRow}>
                    {item.isDefault ? (
                      <Text style={[styles.defaultTag, { color: tokens.textMuted }]}>
                        Mặc định
                      </Text>
                    ) : (
                      <Text style={[styles.customTag, { color: tokens.primary }]}>
                        Tùy biến
                      </Text>
                    )}
                    {!isItemActive ? (
                      <Text style={[styles.hiddenTag, { color: tokens.danger }]}>
                        · Đã ẩn
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Các hành động */}
                <View style={styles.catActionsRow}>
                  {/* Nút Sửa */}
                  <TouchableOpacity
                    onPress={() => handleOpenEdit(item)}
                    style={[
                      styles.actionMiniBtn,
                      { backgroundColor: tokens.surfaceAlt },
                    ]}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Edit3 size={15} color={tokens.text} strokeWidth={2} />
                  </TouchableOpacity>

                  {/* Nút Ẩn/Hiện */}
                  <TouchableOpacity
                    onPress={() => handleToggle(item.id)}
                    style={[
                      styles.actionMiniBtn,
                      { backgroundColor: tokens.surfaceAlt },
                    ]}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    {isItemActive ? (
                      <Eye size={15} color={tokens.primary} strokeWidth={2} />
                    ) : (
                      <EyeOff size={15} color={tokens.textMuted} strokeWidth={2} />
                    )}
                  </TouchableOpacity>

                  {/* Nút Xóa (chỉ cho phép nếu là mục tự tạo) */}
                  {!item.isDefault ? (
                    <TouchableOpacity
                      onPress={() => handleDelete(item)}
                      style={[
                        styles.actionMiniBtn,
                        { backgroundColor: tokens.surfaceAlt },
                      ]}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Trash2 size={15} color={tokens.danger} strokeWidth={2} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Nút Thêm cố định ở chân Sheet */}
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: tokens.surface,
              borderTopColor: tokens.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.addBtn,
              {
                backgroundColor: tokens.primary,
                shadowColor: tokens.glowColor,
              },
            ]}
            onPress={handleOpenAdd}
            activeOpacity={0.85}
          >
            <Plus size={18} color={tokens.textOnPrimary} strokeWidth={2.5} />
            <Text style={[styles.addBtnText, { color: tokens.textOnPrimary }]}>
              Thêm Danh Mục {activeTab === 'EXPENSE' ? 'Chi Tiêu' : 'Thu Nhập'} Mới
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal tạo/sửa */}
        <CategoryFormModal
          visible={formModalVisible}
          initialType={activeTab}
          categoryToEdit={categoryToEdit}
          onClose={() => setFormModalVisible(false)}
          onSave={handleSaveForm}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleCol: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabTrack: {
    flexDirection: 'row',
    borderRadius: radii.full,
    borderWidth: 1,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
  },
  tabBtnActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    gap: 10,
  },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catInfoCol: {
    flex: 1,
    gap: 3,
  },
  catName: {
    fontSize: 15,
    fontWeight: '700',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  defaultTag: {
    fontSize: 11,
    fontWeight: '500',
  },
  customTag: {
    fontSize: 11,
    fontWeight: '700',
  },
  hiddenTag: {
    fontSize: 11,
    fontWeight: '600',
  },
  catActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionMiniBtn: {
    width: 30,
    height: 30,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: radii.lg,
    gap: 8,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  addBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
});
