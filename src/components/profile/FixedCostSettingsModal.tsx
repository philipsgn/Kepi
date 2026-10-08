import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BookOpen,
  Check,
  CreditCard,
  Home,
  MoreHorizontal,
  Wifi,
  X,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { formatVND } from '../../utils/currency';
import {
  FixedCostCategory,
  FixedCostItem,
  calculateTotalFixedCosts,
} from '../../utils/profileUtils';

export const STORAGE_KEY_FIXED_COST_ITEMS = 'vi_locket_fixed_cost_items';

interface FixedCostSettingsModalProps {
  visible: boolean;
  currentMonthlyFixedCosts: number;
  onClose: () => void;
  onSaveTotal: (total: number) => void;
}

const DEFAULT_FIXED_ITEMS: FixedCostItem[] = [
  { id: 'rent', name: 'Tiền thuê nhà / Phòng trọ', amount: 0, category: 'rent' },
  { id: 'utilities', name: 'Điện, nước & Phí dịch vụ', amount: 0, category: 'utilities' },
  { id: 'internet', name: 'Internet, 4G & Điện thoại', amount: 0, category: 'internet' },
  { id: 'debt', name: 'Trả góp, vay nợ & Bảo hiểm', amount: 0, category: 'debt' },
  { id: 'education', name: 'Học phí & Khóa học định kỳ', amount: 0, category: 'education' },
  { id: 'other', name: 'Chi phí định kỳ khác', amount: 0, category: 'other' },
];

export const FixedCostSettingsModal: React.FC<FixedCostSettingsModalProps> = ({
  visible,
  currentMonthlyFixedCosts,
  onClose,
  onSaveTotal,
}) => {
  const { tokens } = useTheme();
  const [items, setItems] = useState<FixedCostItem[]>(DEFAULT_FIXED_ITEMS);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Load from storage or initialize from currentMonthlyFixedCosts
  useEffect(() => {
    if (!visible) return;

    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY_FIXED_COST_ITEMS);
        if (saved) {
          const parsed: FixedCostItem[] = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed);
            const valMap: Record<string, string> = {};
            parsed.forEach((it) => {
              valMap[it.id] = it.amount > 0 ? it.amount.toString() : '';
            });
            setInputValues(valMap);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load fixed cost items:', err);
      }

      // Default fallback
      const initialItems = [...DEFAULT_FIXED_ITEMS];
      if (currentMonthlyFixedCosts > 0) {
        // Gán khoản hiện tại vào mục tiền nhà
        initialItems[0].amount = currentMonthlyFixedCosts;
      }
      setItems(initialItems);
      const valMap: Record<string, string> = {};
      initialItems.forEach((it) => {
        valMap[it.id] = it.amount > 0 ? it.amount.toString() : '';
      });
      setInputValues(valMap);
    })();
  }, [visible, currentMonthlyFixedCosts]);

  const handleAmountChange = (id: string, text: string) => {
    const rawNumber = text.replace(/\D/g, '');
    setInputValues((prev) => ({ ...prev, [id]: rawNumber }));

    const parsed = parseInt(rawNumber, 10) || 0;
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, amount: parsed } : it))
    );
  };

  const totalAmount = calculateTotalFixedCosts(items);

  const handleSave = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY_FIXED_COST_ITEMS,
        JSON.stringify(items)
      );
    } catch (err) {
      console.warn('Failed to persist fixed cost items:', err);
    }

    onSaveTotal(totalAmount);
    onClose();
  };

  const getCategoryIcon = (category: FixedCostCategory) => {
    const iconSize = 16;
    const iconColor = tokens.primary;
    switch (category) {
      case 'rent':
        return <Home size={iconSize} color={iconColor} />;
      case 'utilities':
        return <Zap size={iconSize} color={iconColor} />;
      case 'internet':
        return <Wifi size={iconSize} color={iconColor} />;
      case 'debt':
        return <CreditCard size={iconSize} color={iconColor} />;
      case 'education':
        return <BookOpen size={iconSize} color={iconColor} />;
      case 'other':
      default:
        return <MoreHorizontal size={iconSize} color={iconColor} />;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.sheet, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          {/* HEADER */}
          <View style={[styles.header, { borderBottomColor: tokens.border }]}>
            <View>
              <Text style={[styles.title, { color: tokens.text }]}>Chi Phí Cố Định</Text>
              <Text style={[styles.subtitle, { color: tokens.textMuted }]}>
                Các khoản chi định kỳ hàng tháng
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
              activeOpacity={0.7}
            >
              <X size={16} color={tokens.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollList}
          >
            {/* THÔNG ĐIỆP GIẢI THÍCH */}
            <View style={[styles.infoBanner, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
              <Text style={[styles.infoText, { color: tokens.textSub }]}>
                Các khoản chi cố định sẽ được tự động trừ thẳng vào thu nhập mỗi tháng trước khi tính ngân sách ngày "Hôm nay tiêu được".
              </Text>
            </View>

            {/* DANH SÁCH TỪNG KHOẢN CHI CỐ ĐỊNH */}
            {items.map((item) => {
              const currentVal = inputValues[item.id] || '';
              const numVal = parseInt(currentVal, 10) || 0;

              return (
                <View
                  key={item.id}
                  style={[styles.itemCard, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
                >
                  <View style={styles.itemHeader}>
                    <View style={[styles.iconBox, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
                      {getCategoryIcon(item.category)}
                    </View>
                    <View style={styles.itemTitleCol}>
                      <Text style={[styles.itemName, { color: tokens.text }]}>{item.name}</Text>
                      {numVal > 0 && (
                        <Text style={[styles.itemFormatted, { color: tokens.primary }]}>
                          {formatVND(numVal)}
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[
                        styles.inputField,
                        {
                          backgroundColor: tokens.surface,
                          borderColor: tokens.border,
                          color: tokens.text,
                        },
                      ]}
                      keyboardType="numeric"
                      value={currentVal}
                      onChangeText={(t) => handleAmountChange(item.id, t)}
                      placeholder="0"
                      placeholderTextColor={tokens.textMuted}
                    />
                    <Text style={[styles.currencySuffix, { color: tokens.textMuted }]}>đ</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* FOOTER TỔNG & NÚT LƯU */}
          <View style={[styles.footer, { borderTopColor: tokens.border, backgroundColor: tokens.surface }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: tokens.textMuted }]}>Tổng chi cố định:</Text>
              <Text style={[styles.totalValue, { color: tokens.primary }]}>
                {formatVND(totalAmount)}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: tokens.primary }]}
              onPress={handleSave}
              activeOpacity={0.85}
            >
              <Check size={18} color="#1B2733" strokeWidth={2.4} />
              <Text style={styles.saveBtnText}>Lưu Chi Phí Cố Định</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollList: {
    padding: 16,
    gap: 10,
  },
  infoBanner: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 12,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '400',
  },
  itemCard: {
    borderRadius: radii.md,
    borderWidth: 1,
    padding: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitleCol: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemFormatted: {
    fontSize: 11.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputField: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingRight: 28,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  currencySuffix: {
    position: 'absolute',
    right: 10,
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: radii.md,
    gap: 6,
  },
  saveBtnText: {
    color: '#1B2733',
    fontSize: 14,
    fontWeight: '700',
  },
});
