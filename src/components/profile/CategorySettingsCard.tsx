import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, FolderTree } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme';
import { radii } from '../../theme/tokens';
import { useCategoryStore } from '../../store/categoryStore';
import { CategoryManagementSheet } from './CategoryManagementSheet';

export const CategorySettingsCard: React.FC = () => {
  const { tokens, mode } = useTheme();
  const isPink = mode === 'pink';
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
            backgroundColor: isPink ? '#FFFFFF' : '#FFFBF1',
            borderColor: isPink ? '#3B0713' : '#2B2118',
            borderWidth: 3,
            borderRadius: 22,
            shadowColor: isPink ? '#3B0713' : '#2B2118',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 4,
          },
        ]}
        onPress={handleOpen}
        activeOpacity={0.85}
      >
        <View
          style={[
            styles.iconBox,
            {
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: isPink ? '#FCE7F3' : '#FFE8D6',
              borderWidth: 2.5,
              borderColor: isPink ? '#3B0713' : '#2B2118',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
        >
          <FolderTree size={20} color={isPink ? '#F43F5E' : '#E0452B'} strokeWidth={2.6} />
        </View>

        <View style={styles.contentCol}>
          <Text style={[styles.title, { color: isPink ? '#3B0713' : '#2B2118', fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' }]}>
            DANH MỤC THU & CHI
          </Text>
          <Text style={[styles.subtitle, { color: isPink ? '#834758' : '#6E5D4F', fontFamily: 'Nunito', fontWeight: '700' }]}>
            {activeExpense} mục Chi · {activeIncome} mục Thu
          </Text>
        </View>

        <ChevronRight size={18} color={isPink ? '#3B0713' : '#2B2118'} strokeWidth={2.6} />
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
