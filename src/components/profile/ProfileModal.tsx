import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Calendar,
  Check,
  ChevronRight,
  Flame,
  LogOut,
  Medal,
  ShieldCheck,
  Sparkles,
  Target,
  User as UserIcon,
  X,
  Zap,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';
import { Typography } from '../../constants/typography';
import { useAuthStore } from '../../store/authStore';
import { useBudgetStore } from '../../store/budgetStore';
import { useLessonStore } from '../../store/lessonStore';
import { useMinhCoachStore } from '../../store/minhCoachStore';
import { formatCompactVND, formatVND } from '../../utils/currency';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenJournal?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  onOpenJournal,
}) => {
  const { user, profile, signOut } = useAuthStore();
  const {
    goalName,
    goalTargetAmount,
    todayBudget,
    savedMoney,
    updateGoalSettings,
  } = useBudgetStore();
  const { totalExp, getFinancialTier } = useLessonStore();
  const { resistedImpulsesCount, totalSavedFromTrend } = useMinhCoachStore();

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editGoalName, setEditGoalName] = useState(goalName);
  const [editTargetAmount, setEditTargetAmount] = useState(goalTargetAmount.toString());
  const [editDailyBudget, setEditDailyBudget] = useState(todayBudget.toString());

  const currentTier = getFinancialTier();

  const getTierDescription = (level: number) => {
    switch (level) {
      case 3:
        return 'Bậc thầy làm chủ dòng tiền, bảo vệ ví vững như kiềng ba chân và tích lũy thần tốc.';
      case 2:
        return 'Đã rèn được phản xạ phản biện Tiện Ích vs Đu Trend cùng Minh Coach.';
      default:
        return 'Tập thói quen dừng lại 3 giây kiểm tra ngân sách trước khi quẹt thẻ chi tiêu.';
    }
  };

  const handleSaveGoal = () => {
    const parsedAmount = parseInt(editTargetAmount.replace(/\D/g, ''), 10) || 0;
    const parsedDaily = parseInt(editDailyBudget.replace(/\D/g, ''), 10) || todayBudget;

    if (!editGoalName.trim()) {
      Alert.alert('Chưa có tên mục tiêu', 'Hãy đặt một cái tên truyền cảm hứng nhé!');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateGoalSettings(editGoalName.trim(), parsedAmount, parsedDaily);
    setIsEditingGoal(false);
  };

  const handleSignOut = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => {
          onClose();
          signOut();
        },
      },
    ]);
  };

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
            <View style={styles.container}>
              {/* HEADER */}
              <View style={styles.header}>
                <View style={styles.avatarRow}>
                  <View style={styles.avatarCircle}>
                    <UserIcon size={24} color={Colors.textCharcoal} />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[Typography.heading3, styles.userName]}>
                      {profile?.full_name || user?.email?.split('@')[0] || 'Locket Hero'}
                    </Text>
                    <View style={styles.tierPill}>
                      <Medal size={12} color={Colors.accentGold} />
                      <Text style={styles.tierPillText}>
                        {currentTier.badgeEmoji} {currentTier.tierName}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <X size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollInner}
              >
                {/* 1. THẺ CẤP ĐỘ CHI TIÊU & EXP */}
                <View style={styles.tierCard}>
                  <View style={styles.tierHeader}>
                    <View style={styles.tierIconBadge}>
                      <Sparkles size={20} color={Colors.accentGold} strokeWidth={2.6} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tierLabel}>Cấp Độ Nhận Thức Tài Chính</Text>
                      <Text style={[Typography.bodyMedium, styles.tierTitle]}>
                        {currentTier.badgeEmoji} {currentTier.tierName}
                      </Text>
                    </View>
                    <View style={styles.expBadge}>
                      <Zap size={12} color={Colors.accentGold} fill={Colors.accentGold} />
                      <Text style={styles.expText}>{totalExp} EXP</Text>
                    </View>
                  </View>

                  <Text style={styles.tierDesc}>
                    {getTierDescription(currentTier.tierLevel)}
                  </Text>

                  {/* THỐNG KÊ CHIẾN TÍCH BẢO VỆ VÍ TỪ MINH COACH */}
                  <View style={styles.coachAchievements}>
                    <View style={styles.achievementItem}>
                      <Flame size={14} color={Colors.accentGold} />
                      <Text style={styles.achievementNumber}>{resistedImpulsesCount}</Text>
                      <Text style={styles.achievementLabel}>Lần vượt bẫy trend</Text>
                    </View>
                    <View style={styles.achievementDivider} />
                    <View style={styles.achievementItem}>
                      <ShieldCheck size={14} color={Colors.incomeMint} />
                      <Text style={[styles.achievementNumber, { color: Colors.incomeMint }]}>
                        {formatCompactVND(totalSavedFromTrend + savedMoney)}
                      </Text>
                      <Text style={styles.achievementLabel}>Đã cứu thành công</Text>
                    </View>
                  </View>
                </View>

                {/* 2. MỤC TIÊU CÁ NHÂN HÓA */}
                <View style={styles.sectionHeader}>
                  <Target size={16} color={Colors.accentGold} />
                  <Text style={styles.sectionTitle}>Mục Tiêu Cá Nhân Hóa</Text>
                  {!isEditingGoal && (
                    <TouchableOpacity
                      onPress={() => {
                        setEditGoalName(goalName);
                        setEditTargetAmount(goalTargetAmount.toString());
                        setEditDailyBudget(todayBudget.toString());
                        setIsEditingGoal(true);
                      }}
                      style={styles.editBtn}
                    >
                      <Text style={styles.editBtnText}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {isEditingGoal ? (
                  <View style={styles.editGoalForm}>
                    <Text style={styles.inputLabel}>Tên mục tiêu phấn đấu:</Text>
                    <TextInput
                      style={styles.input}
                      value={editGoalName}
                      onChangeText={setEditGoalName}
                      placeholder="VD: Mua Laptop, Đi du lịch..."
                      placeholderTextColor={Colors.textMuted}
                    />

                    <Text style={styles.inputLabel}>Số tiền mục tiêu (VND):</Text>
                    <TextInput
                      style={styles.input}
                      value={editTargetAmount}
                      onChangeText={setEditTargetAmount}
                      keyboardType="numeric"
                      placeholder="VD: 15000000"
                      placeholderTextColor={Colors.textMuted}
                    />

                    <Text style={styles.inputLabel}>Hạn mức chi tiêu ngày (VND):</Text>
                    <TextInput
                      style={styles.input}
                      value={editDailyBudget}
                      onChangeText={setEditDailyBudget}
                      keyboardType="numeric"
                      placeholder="VD: 150000"
                      placeholderTextColor={Colors.textMuted}
                    />

                    <View style={styles.goalFormActions}>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => setIsEditingGoal(false)}
                      >
                        <Text style={styles.cancelBtnText}>Hủy</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.saveGoalBtn}
                        onPress={handleSaveGoal}
                      >
                        <Check size={16} color="#FFFFFF" />
                        <Text style={styles.saveGoalBtnText}>Lưu Mục Tiêu</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.goalDisplayCard}>
                    <View style={styles.goalMainRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.goalCurrentName}>{goalName}</Text>
                        <Text style={styles.goalTargetText}>
                          Mục tiêu: {formatVND(goalTargetAmount)}
                        </Text>
                      </View>
                      <View style={styles.dailyBudgetBox}>
                        <Text style={styles.dailyBudgetLabel}>Hạn mức ngày</Text>
                        <Text style={styles.dailyBudgetValue}>{formatCompactVND(todayBudget)}</Text>
                      </View>
                    </View>

                    {/* TIẾN ĐỘ TÍCH LŨY */}
                    <View style={styles.goalProgressArea}>
                      <View style={styles.goalProgressTrack}>
                        <View
                          style={[
                            styles.goalProgressFill,
                            {
                              width: `${Math.min(
                                100,
                                Math.max(
                                  5,
                                  goalTargetAmount > 0
                                    ? Math.round((savedMoney / goalTargetAmount) * 100)
                                    : 0
                                )
                              )}%`,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.goalProgressLabels}>
                        <Text style={styles.goalSavedLabel}>
                          Đã tích lũy: {formatCompactVND(savedMoney)}
                        </Text>
                        <Text style={styles.goalPercentLabel}>
                          {goalTargetAmount > 0
                            ? `${Math.round((savedMoney / goalTargetAmount) * 100)}%`
                            : '0%'}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* 3. LỐI TẮT HÀNH ĐỘNG */}
                <View style={styles.actionSection}>
                  {onOpenJournal && (
                    <TouchableOpacity
                      style={styles.menuRow}
                      onPress={() => {
                        onClose();
                        onOpenJournal();
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuIconCircle}>
                        <Calendar size={20} color={Colors.accentGold} strokeWidth={2.6} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.menuTitle}>Sổ Chi Tiêu & Lịch Ảnh</Text>
                        <Text style={styles.menuSub}>Xem dòng thời gian và album ảnh tháng</Text>
                      </View>
                      <ChevronRight size={18} color={Colors.textMuted} strokeWidth={2.6} />
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.menuRow, { borderBottomWidth: 0 }]}
                    onPress={handleSignOut}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuIconCircle}>
                      <LogOut size={20} color={Colors.expenseCoral} strokeWidth={2.6} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuTitle, { color: Colors.expenseCoral }]}>
                        Đăng xuất tài khoản
                      </Text>
                      <Text style={styles.menuSub}>Đổi người dùng hoặc đồng bộ lại</Text>
                    </View>
                    <ChevronRight size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* FOOTER DISMISS HINT */}
              <View style={styles.footer}>
                <Text style={styles.dismissHint}>Chạm vào vùng tối bên ngoài để đóng</Text>
              </View>
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
    backgroundColor: 'rgba(15, 20, 15, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  container: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: Colors.bgPrimary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(229, 152, 68, 0.25)',
    ...Shadows.floating,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 92, 70, 0.1)',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(74, 92, 70, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.accentGold,
  },
  userInfo: {
    gap: 2,
  },
  userName: {
    color: Colors.textCharcoal,
    fontWeight: '700',
    fontSize: 16,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(229, 152, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  tierPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentGold,
  },
  closeBtn: {
    padding: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  scrollContent: {
    marginTop: Spacing.md,
  },
  scrollInner: {
    gap: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  tierCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(229, 152, 68, 0.25)',
    gap: Spacing.sm,
    ...Shadows.paper,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tierIconBadge: {
    width: 24,
    height: 24,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  tierTitle: {
    color: Colors.textCharcoal,
    fontSize: 15,
    fontWeight: '700',
  },
  expBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.textCharcoal,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  expText: {
    color: Colors.accentGold,
    fontSize: 11,
    fontWeight: '800',
  },
  tierDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  coachAchievements: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.bgPrimary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    marginTop: 4,
  },
  achievementItem: {
    alignItems: 'center',
    gap: 2,
  },
  achievementNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.accentGold,
  },
  achievementLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  achievementDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(74, 92, 70, 0.15)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textCharcoal,
    flex: 1,
  },
  editBtn: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  editBtnText: {
    fontSize: 12,
    color: Colors.accentGold,
    fontWeight: '600',
  },
  goalDisplayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(74, 92, 70, 0.12)',
    gap: Spacing.sm,
    ...Shadows.paper,
  },
  goalMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalCurrentName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textCharcoal,
  },
  goalTargetText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dailyBudgetBox: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(229, 152, 68, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  dailyBudgetLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  dailyBudgetValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.accentGold,
  },
  goalProgressArea: {
    gap: 4,
    marginTop: 4,
  },
  goalProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(74, 92, 70, 0.1)',
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: Colors.incomeMint,
    borderRadius: 4,
  },
  goalProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalSavedLabel: {
    fontSize: 11,
    color: Colors.incomeMint,
    fontWeight: '600',
  },
  goalPercentLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  editGoalForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accentGold,
    gap: Spacing.xs,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textCharcoal,
    marginTop: 4,
  },
  input: {
    backgroundColor: Colors.bgPrimary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.textCharcoal,
    borderWidth: 1,
    borderColor: 'rgba(74, 92, 70, 0.15)',
  },
  goalFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  cancelBtnText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  saveGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.accentGold,
  },
  saveGoalBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(74, 92, 70, 0.12)',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(74, 92, 70, 0.08)',
  },
  menuIconCircle: {
    width: 24,
    height: 24,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textCharcoal,
  },
  menuSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  footer: {
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  dismissHint: {
    fontSize: 11,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
