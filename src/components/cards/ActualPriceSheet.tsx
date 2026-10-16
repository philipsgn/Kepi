import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Coffee,
  ShieldCheck,
  Target,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { BlockLayout, Spacing } from '../../constants/layout';
import { Strings } from '../../constants/strings';
import { Block } from '../common/Block';
import { BlockButton } from '../common/BlockButton';
import { formatCompactVND, formatVND } from '../../utils/currency';

interface ActualPriceSheetProps {
  visible: boolean;
  itemName?: string;
  description?: string;
  amount: number;
  category?: string;
  photoUri?: string | null;
  dailyBudget?: number;
  realBalance?: number;
  hourlyRate?: number;
  hourlyWage?: number;
  goalName?: string;
  onClose: () => void;
  onBuyAnyway?: () => void;
  onConfirmBuy?: () => void;
  onAddToWaitBasket?: () => void;
  onSaveLater?: () => void;
  onSkipAndSaveMoney?: () => void;
  onSkipSave?: () => void;
  onAskMinhCoach?: () => void;
}

export const ActualPriceSheet: React.FC<ActualPriceSheetProps> = ({
  visible,
  itemName,
  description,
  amount,
  photoUri,
  dailyBudget = 100000,
  realBalance = 0,
  hourlyRate,
  hourlyWage,
  goalName = 'Tiết kiệm',
  onClose,
  onBuyAnyway,
  onConfirmBuy,
  onAddToWaitBasket,
  onSaveLater,
  onSkipAndSaveMoney,
  onSkipSave,
  onAskMinhCoach,
}) => {
  const [stepVisible, setStepVisible] = useState(0);

  const displayItemName = itemName || description || 'Món đồ cân nhắc';
  const handleBuy = onConfirmBuy || onBuyAnyway || onClose;
  const handleWait = onSaveLater || onAddToWaitBasket || onClose;
  const handleSkip = onSkipSave || onSkipAndSaveMoney || onClose;

  // Tính các chỉ số quy đổi thực tế
  const daysOfBudget = dailyBudget > 0 ? (amount / dailyBudget).toFixed(1) : '1.0';
  const coffeeCups = Math.round(amount / 35_000);

  // Hiệu ứng hiện lần lượt các dòng quy đổi kèm rung haptic từng nấc
  useEffect(() => {
    if (visible) {
      setStepVisible(0);
      const timer1 = setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setStepVisible(1);
      }, 150);

      const timer2 = setTimeout(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setStepVisible(2);
      }, 350);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } else {
      setStepVisible(0);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetWrapper}>
              <Block variant="dark" style={styles.mainBlock} contentStyle={styles.content}>
                {/* HEADER */}
                <View style={styles.headerRow}>
                  <View style={styles.titleBadge}>
                    <Text style={styles.headerTitle}>{Strings.actualPrice.title}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* THÔNG TIN MÓN ĐỒ */}
                <View style={styles.itemCard}>
                  {photoUri && (
                    <Image source={{ uri: photoUri }} style={styles.itemPhoto} resizeMode="cover" />
                  )}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {displayItemName}
                    </Text>
                    <Text style={styles.itemAmount}>{formatVND(amount)}</Text>
                  </View>
                </View>

                {/* CÁC DÒNG QUY ĐỔI GIÁ THẬT (HIỆN LẦN LƯỢT KÈM RUNG) */}
                <View style={styles.metricsList}>
                  {stepVisible >= 1 && (
                    <View style={styles.metricRow}>
                      <Target size={16} color={Colors.greenSafe} />
                      <Text style={styles.metricText}>
                        {Strings.actualPrice.dailyConversion(Number(daysOfBudget))}
                      </Text>
                    </View>
                  )}

                  {stepVisible >= 2 && (
                    <View style={styles.metricRow}>
                      <Coffee size={16} color={Colors.blueInfo} />
                      <Text style={styles.metricText}>
                        {Strings.actualPrice.coffeeConversion(coffeeCups)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* 3 NÚT HÀNH ĐỘNG KHỐI VUÔNG */}
                <View style={styles.actionsColumn}>
                  {/* Nút 1: Không mua (Hành động giữ tiền tốt nhất) */}
                  <BlockButton
                    title={Strings.actualPrice.skipBuy}
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={<ShieldCheck size={18} color="#000000" />}
                    onPress={() => {
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      handleSkip();
                    }}
                  />

                  {/* Nút 2: Để sau (Đưa vào giỏ suy ngẫm) */}
                  <BlockButton
                    title={Strings.actualPrice.saveForLater}
                    variant="cream"
                    size="md"
                    fullWidth
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      handleWait();
                    }}
                  />

                  {/* Nút 3: Vẫn mua (Chấp nhận chi) */}
                  <BlockButton
                    title={Strings.actualPrice.buyAnyway}
                    variant="secondary"
                    size="md"
                    fullWidth
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      handleBuy();
                    }}
                  />

                  {/* Nút 4: Hỏi ý kiến Anh Minh kỹ hơn */}
                  {onAskMinhCoach && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onAskMinhCoach();
                      }}
                      style={styles.askCoachBtn}
                    >
                      <Text style={styles.askCoachBtnText}>💬 Hỏi ý kiến Anh Minh</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Block>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Alias tương thích ngược cho JudgmentCard
export const JudgmentCard = ActualPriceSheet;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  sheetWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  mainBlock: {
    width: '100%',
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleBadge: {
    backgroundColor: Colors.primaryYellow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.2,
  },
  closeBtn: {
    padding: 6,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#26262B',
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: '#000000',
  },
  itemPhoto: {
    width: 60,
    height: 60,
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itemAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryYellow,
    fontVariant: ['tabular-nums'],
  },
  metricsList: {
    gap: 8,
    paddingVertical: 4,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E1E22',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  metricText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionsColumn: {
    gap: 8,
    marginTop: 4,
  },
  askCoachBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#383842',
    backgroundColor: '#1E1E24',
    marginTop: 4,
  },
  askCoachBtnText: {
    color: Colors.primaryYellow,
    fontSize: 12.5,
    fontWeight: '800',
  },
});
