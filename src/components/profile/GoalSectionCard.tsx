import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, Edit3, MessageSquareQuote, Target } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Strings } from '../../constants/strings';
import { calculateGoalProgress, formatMaskedCurrency } from '../../utils/profileUtils';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { ProgressBar } from '../common/ProgressBar';

interface GoalSectionCardProps {
  goalName: string;
  goalTargetAmount: number;
  savedMoney: number;
  goalDeadline?: string | null;
  goalReason?: string | null;
  isMasked?: boolean;
  onPressEdit: () => void;
}

export const GoalSectionCard: React.FC<GoalSectionCardProps> = ({
  goalName,
  goalTargetAmount,
  savedMoney,
  goalDeadline = '31/12/2026',
  goalReason = 'Tự thưởng sau một năm nỗ lực cày cuốc',
  isMasked = false,
  onPressEdit,
}) => {
  const { tokens } = useTheme();
  const { percentage, isAchieved } = calculateGoalProgress(
    savedMoney,
    goalTargetAmount
  );

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPressEdit();
  };

  const hasGoal = goalTargetAmount > 0;

  return (
    <View style={[styles.container, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
      {/* 1. TIÊU ĐỀ KHỐI & NÚT SỬA */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.targetIconBox, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
            <Target size={15} color={tokens.primary} strokeWidth={2.4} />
          </View>
          <Text style={[styles.sectionTitle, { color: tokens.text }]}>{Strings.profile.goalSectionTitle}</Text>
        </View>

        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
          onPress={handleEdit}
          activeOpacity={0.8}
        >
          <Edit3 size={12} color={tokens.textSub} strokeWidth={2} />
          <Text style={[styles.editBtnText, { color: tokens.textSub }]}>
            {hasGoal ? Strings.profile.editGoalBtn : Strings.profile.createGoalBtn}
          </Text>
        </TouchableOpacity>
      </View>

      {hasGoal ? (
        <View style={styles.contentBody}>
          {/* TÊN MỤC TIÊU */}
          <Text style={[styles.goalNameText, { color: tokens.text }]}>{goalName || 'Mục tiêu cá nhân'}</Text>

          {/* TIẾN ĐỘ & SỐ TIỀN */}
          <View style={styles.progressInfoRow}>
            <Text style={[styles.progressAmounts, { color: tokens.text }]}>
              {formatMaskedCurrency(savedMoney, isMasked)}{' '}
              <Text style={[styles.targetAmount, { color: tokens.textMuted }]}>
                / {formatMaskedCurrency(goalTargetAmount, isMasked)}
              </Text>
            </Text>
            <View style={[styles.percentBadge, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
              <Text style={[styles.percentText, { color: tokens.primary }]}>{percentage}%</Text>
            </View>
          </View>

          {/* THANH TIẾN TRÌNH */}
          <View style={styles.progressBarWrapper}>
            <ProgressBar
              progress={percentage / 100}
              height={8}
              customColor={isAchieved ? tokens.success : tokens.primary}
            />
          </View>

          {/* HẠN CHÓT & LÝ DO */}
          <View style={[styles.metaRow, { borderTopColor: tokens.border }]}>
            <View style={styles.metaItem}>
              <Calendar size={13} color={tokens.textMuted} />
              <Text style={[styles.metaText, { color: tokens.textMuted }]}>
                {Strings.profile.goalDeadlineLabel}: {goalDeadline}
              </Text>
            </View>

            {goalReason ? (
              <View style={[styles.metaItem, { marginTop: 4 }]}>
                <MessageSquareQuote size={13} color={tokens.textMuted} />
                <Text style={[styles.reasonText, { color: tokens.textSub }]} numberOfLines={2}>
                  "{goalReason}"
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      ) : (
        /* TRẠNG THÁI CHƯA ĐẶT MỤC TIÊU */
        <TouchableOpacity
          style={[styles.emptyGoalBox, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
          onPress={handleEdit}
          activeOpacity={0.8}
        >
          <Text style={[styles.emptyGoalText, { color: tokens.textMuted }]}>
            {Strings.profile.goalEmptyHint}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
    borderWidth: 1,
    gap: 4,
  },
  editBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  contentBody: {
    marginTop: 2,
  },
  goalNameText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  progressInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressAmounts: {
    fontSize: 13.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  targetAmount: {
    fontSize: 12,
    fontWeight: '500',
  },
  percentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  percentText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarWrapper: {
    marginVertical: 4,
  },
  metaRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  reasonText: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  emptyGoalBox: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
  },
  emptyGoalText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
