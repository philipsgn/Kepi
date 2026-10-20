import React from 'react';
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
  Flame,
  Heart,
  PieChart,
  ShieldCheck,
  TrendingDown,
  X,
  Zap,
} from 'lucide-react-native';
import { Typography } from '../../constants/typography';
import { useBudgetStore } from '../../store/budgetStore';
import { useTransactionStore } from '../../store/transactionStore';
import { formatCompactVND } from '../../utils/currency';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

interface GamifiedStatsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenLessons?: () => void;
}

export const GamifiedStatsModal: React.FC<GamifiedStatsModalProps> = ({
  visible,
  onClose,
  onOpenLessons,
}) => {
  const { tokens } = useTheme();
  const { todayBudget, todaySpent, realBalance, savedMoney } = useBudgetStore();
  const { transactions } = useTransactionStore();

  // 1. Tính toán Thanh Sinh Lực (HP) Ngân Sách
  const remainingToday = Math.max(0, todayBudget - todaySpent);
  const hpPercent = todayBudget > 0 ? Math.min(100, Math.round((remainingToday / todayBudget) * 100)) : 100;

  const getHpStatus = () => {
    if (hpPercent >= 60) {
      return {
        color: tokens.success,
        label: 'Chi tiêu thoải mái',
        desc: 'Hạn mức dồi dào, sinh hoạt ổn định.',
        icon: <ShieldCheck size={16} color="#FFFFFF" />,
      };
    }
    if (hpPercent >= 25) {
      return {
        color: tokens.primary,
        label: 'Sắp chạm hạn mức',
        desc: 'Nên cân nhắc kỹ các món không thiết yếu.',
        icon: <Zap size={16} color="#1B2733" />,
      };
    }
    return {
      color: tokens.danger,
      label: 'Đã hết hạn mức hôm nay',
      desc: 'Mai dàn đều chi tiêu để cân bằng lại nhé.',
      icon: <Flame size={16} color="#FFFFFF" />,
    };
  };

  const hpStatus = getHpStatus();

  // 2. Phân loại 5 nhóm chi tiêu từ danh sách transactions (danh mục Ăn uống)
  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE');
  const totalSpent = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  const categoriesMap: Record<string, { label: string; color: string; amount: number }> = {
    an_uong: { label: 'Ăn uống', color: tokens.primary, amount: 0 },
    di_chuyen: { label: 'Di Chuyển', color: tokens.accent, amount: 0 },
    mua_sam: { label: 'Mua Sắm', color: tokens.textSub, amount: 0 },
    giai_tri: { label: 'Giải Trí & Chill', color: tokens.accent, amount: 0 },
    chi_tieu_khac: { label: 'Khoản Khác', color: tokens.textMuted, amount: 0 },
  };

  for (const tx of expenseTransactions) {
    const rawCat = tx.category.toLowerCase();
    let cat = 'chi_tieu_khac';
    if (rawCat.includes('ăn') || rawCat.includes('cà phê') || rawCat.includes('cafe')) {
      cat = 'an_uong';
    } else if (rawCat.includes('xe') || rawCat.includes('xăng') || rawCat.includes('di chuyển')) {
      cat = 'di_chuyen';
    } else if (rawCat.includes('mua') || rawCat.includes('sắm') || rawCat.includes('áo') || rawCat.includes('quần')) {
      cat = 'mua_sam';
    } else if (rawCat.includes('chơi') || rawCat.includes('phim') || rawCat.includes('game')) {
      cat = 'giai_tri';
    }
    categoriesMap[cat].amount += tx.amount;
  }

  // 3. Top các khoản chi lớn nhất
  const topExpenses = [...expenseTransactions].sort((a, b) => b.amount - a.amount).slice(0, 3);

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
            <View style={[styles.modalCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
              <TouchableOpacity
                style={[styles.closeBtn, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <X size={16} color={tokens.text} />
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* 1. HẠN MỨC TIÊU DÙNG HÔM NAY */}
                <View style={[styles.hpSection, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
                  <View style={styles.hpHeader}>
                    <View style={styles.hpTitleRow}>
                      <Heart size={18} color={hpStatus.color} fill={hpStatus.color} />
                      <Text style={[Typography.heading3, styles.hpTitle, { color: tokens.text }]}>
                        Hôm nay tiêu được
                      </Text>
                    </View>
                    <Text style={[styles.hpPercentText, { color: hpStatus.color }]}>
                      {hpPercent}%
                    </Text>
                  </View>

                  <View style={[styles.hpTrack, { backgroundColor: tokens.surface }]}>
                    <View
                      style={[
                        styles.hpFill,
                        {
                          width: `${hpPercent}%`,
                          backgroundColor: hpStatus.color,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.hpStatusBadge}>
                    <View style={[styles.statusDot, { backgroundColor: hpStatus.color }]} />
                    <Text style={[styles.statusLabel, { color: tokens.text }]}>{hpStatus.label}: </Text>
                    <Text style={[styles.statusDesc, { color: tokens.textMuted }]}>{hpStatus.desc}</Text>
                  </View>
                </View>

                {/* 2. CHỈ SỐ NHANH */}
                <View style={styles.quickStatsRow}>
                  <View style={[styles.statBox, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
                    <Text style={[styles.statLabel, { color: tokens.textMuted }]}>Còn Lại Hôm Nay</Text>
                    <Text style={[styles.statValue, { color: hpStatus.color }]}>
                      {formatCompactVND(remainingToday)}
                    </Text>
                  </View>

                  <View style={[styles.statBox, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
                    <Text style={[styles.statLabel, { color: tokens.textMuted }]}>Đã Giữ Lại</Text>
                    <Text style={[styles.statValue, { color: tokens.success }]}>
                      {formatCompactVND(savedMoney)}
                    </Text>
                  </View>

                  <View style={[styles.statBox, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
                    <Text style={[styles.statLabel, { color: tokens.textMuted }]}>Số Dư Thực</Text>
                    <Text style={[styles.statValue, { color: tokens.text }]}>
                      {formatCompactVND(realBalance)}
                    </Text>
                  </View>
                </View>

                {/* 3. BIỂU ĐỒ PHÂN BỔ 5 NHÓM CHI TIÊU */}
                <View style={[styles.categorySection, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
                  <View style={styles.sectionHeader}>
                    <PieChart size={16} color={tokens.primary} />
                    <Text style={[Typography.heading3, styles.sectionTitle, { color: tokens.text }]}>
                      Phân Bổ Chi Tiêu Tháng Này
                    </Text>
                  </View>

                  <View style={styles.categoryList}>
                    {Object.entries(categoriesMap).map(([key, item]) => {
                      const percent = totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;
                      return (
                        <View key={key} style={styles.categoryRow}>
                          <View style={styles.categoryInfo}>
                            <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                            <Text style={[styles.catLabel, { color: tokens.text }]}>{item.label}</Text>
                            <Text style={[styles.catPercent, { color: tokens.textMuted }]}>{percent}%</Text>
                          </View>
                          <View style={[styles.catProgressTrack, { backgroundColor: tokens.surface }]}>
                            <View
                              style={[
                                styles.catProgressFill,
                                { width: `${percent}%`, backgroundColor: item.color },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* 4. TOP CÁC KHOẢN CHI LỚN NHẤT */}
                {topExpenses.length > 0 && (
                  <View style={[styles.topExpensesSection, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
                    <View style={styles.sectionHeader}>
                      <TrendingDown size={16} color={tokens.danger} />
                      <Text style={[Typography.heading3, styles.sectionTitle, { color: tokens.text }]}>
                        Khoản Chi Lớn Nhất
                      </Text>
                    </View>

                    {topExpenses.map((tx) => (
                      <View key={tx.id} style={[styles.topItemCard, { borderBottomColor: tokens.border }]}>
                        {tx.photo_url ? (
                          <Image source={{ uri: tx.photo_url }} style={styles.topItemThumb} />
                        ) : (
                          <View style={[styles.topItemPlaceholder, { backgroundColor: tokens.surface }]}>
                            <Text style={[styles.topItemPlaceholderText, { color: tokens.textMuted }]}>Ảnh</Text>
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.topItemName, { color: tokens.text }]}>{tx.description || tx.category}</Text>
                          <Text style={[styles.topItemCategory, { color: tokens.textMuted }]}>{tx.category}</Text>
                        </View>
                        <Text style={[styles.topItemAmount, { color: tokens.text }]}>
                          {formatCompactVND(tx.amount)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <Text style={[styles.tapOutsideHint, { color: tokens.textMuted }]}>
                  Chạm vùng ngoài để đóng bảng thống kê
                </Text>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 18,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  hpSection: {
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  hpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hpTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hpTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  hpPercentText: {
    fontSize: 16,
    fontWeight: '800',
  },
  hpTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  hpFill: {
    height: '100%',
    borderRadius: 4,
  },
  hpStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusDesc: {
    fontSize: 12,
    fontWeight: '400',
    flex: 1,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: radii.md,
    padding: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  categorySection: {
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  categoryList: {
    gap: 10,
  },
  categoryRow: {},
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  catLabel: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  catPercent: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  catProgressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  catProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  topExpensesSection: {
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  topItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  topItemThumb: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  topItemPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topItemPlaceholderText: {
    fontSize: 11,
    fontWeight: '600',
  },
  topItemName: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  topItemCategory: {
    fontSize: 11,
    marginTop: 1,
  },
  topItemAmount: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  tapOutsideHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
