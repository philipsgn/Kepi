import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, FolderTree } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { radii } from '../../theme/tokens';
import { useCategoryStore } from '../../store/categoryStore';
import { CategoryManagementSheet } from './CategoryManagementSheet';

export const CategorySettingsCard: React.FC = () => {
  const { tokens } = useTheme();
  const { categories } = useCategoryStore();
  const [sheetVisible, setSheetVisible] = useState<boolean>(false);

  const activeExpense = categories.filter((c) => c.type === 'EXPENSE' && c.isActive !== false).length;
  const activeIncome = categories.filter((c) => c.type === 'INCOME' && c.isActive !== false).length;

  const handleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetVisible(true);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: tokens.surface,
            borderColor: tokens.border,
          },
        ]}
        onPress={handleOpen}
        activeOpacity={0.85}
      >
        <View style={styles.iconBox}>
          <FolderTree size={21} color={tokens.primary} strokeWidth={2.4} />
        </View>

        <View style={styles.contentCol}>
          <Text style={[styles.title, { color: tokens.text }]}>
            DANH MỤC THU & CHI
          </Text>
          <Text style={[styles.subtitle, { color: tokens.textMuted }]}>
            {activeExpense} mục Chi · {activeIncome} mục Thu đang hoạt động
          </Text>
        </View>

        <ChevronRight size={18} color={tokens.textMuted} />
      </TouchableOpacity>

      <CategoryManagementSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 12,
  },
  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentCol: {
    flex: 1,
  },
  title: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 11.5,
    fontWeight: '400',
    marginTop: 2,
  },
});
