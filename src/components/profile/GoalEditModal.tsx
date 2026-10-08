import React, { useState } from 'react';
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
import { Check, Target, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Strings } from '../../constants/strings';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

interface GoalEditModalProps {
  visible: boolean;
  initialGoalName: string;
  initialTargetAmount: number;
  initialDeadline?: string | null;
  initialReason?: string | null;
  onClose: () => void;
  onSave: (goal: {
    name: string;
    targetAmount: number;
    deadline: string;
    reason: string;
  }) => void;
}

export const GoalEditModal: React.FC<GoalEditModalProps> = ({
  visible,
  initialGoalName,
  initialTargetAmount,
  initialDeadline = '31/12/2026',
  initialReason = 'Tự thưởng sau một năm nỗ lực cày cuốc',
  onClose,
  onSave,
}) => {
  const { tokens } = useTheme();
  const [name, setName] = useState(initialGoalName);
  const [amountStr, setAmountStr] = useState(
    initialTargetAmount > 0 ? initialTargetAmount.toString() : ''
  );
  const [deadline, setDeadline] = useState(initialDeadline || '31/12/2026');
  const [reason, setReason] = useState(initialReason || '');

  React.useEffect(() => {
    if (visible) {
      setName(initialGoalName);
      setAmountStr(initialTargetAmount > 0 ? initialTargetAmount.toString() : '');
      setDeadline(initialDeadline || '31/12/2026');
      setReason(initialReason || '');
    }
  }, [visible, initialGoalName, initialTargetAmount, initialDeadline, initialReason]);

  const handleSave = () => {
    const parsedAmount = parseInt(amountStr.replace(/\D/g, ''), 10) || 0;
    if (!name.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave({
      name: name.trim(),
      targetAmount: parsedAmount,
      deadline: deadline.trim() || '31/12/2026',
      reason: reason.trim(),
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalSheet, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          {/* HEADER */}
          <View style={[styles.headerRow, { borderBottomColor: tokens.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.iconBox, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
                <Target size={15} color={tokens.primary} strokeWidth={2.4} />
              </View>
              <Text style={[styles.sheetTitle, { color: tokens.text }]}>{Strings.profile.goalSectionTitle}</Text>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
              onPress={onClose}
            >
              <X size={15} color={tokens.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
            {/* TRƯỜNG 1: MỤC ĐÍCH */}
            <Text style={[styles.label, { color: tokens.textSub }]}>{Strings.profile.goalNameLabel}:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border, color: tokens.text }]}
              value={name}
              onChangeText={setName}
              placeholder="Chuyến đi Sa Pa mùa đông"
              placeholderTextColor={tokens.textMuted}
            />

            {/* TRƯỜNG 2: SỐ TIỀN CẦN TÍCH LŨY */}
            <Text style={[styles.label, { color: tokens.textSub }]}>{Strings.profile.goalTargetLabel} (đ):</Text>
            <TextInput
              style={[styles.input, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border, color: tokens.text }]}
              keyboardType="numeric"
              value={amountStr}
              onChangeText={setAmountStr}
              placeholder="15000000"
              placeholderTextColor={tokens.textMuted}
            />

            {/* TRƯỜNG 3: HẠN CHÓT */}
            <Text style={[styles.label, { color: tokens.textSub }]}>{Strings.profile.goalDeadlineLabel}:</Text>
            <TextInput
              style={[styles.input, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border, color: tokens.text }]}
              value={deadline}
              onChangeText={setDeadline}
              placeholder="31/12/2026"
              placeholderTextColor={tokens.textMuted}
            />

            {/* TRƯỜNG 4: LÝ DO TRUYỀN ĐỘNG LỰC */}
            <Text style={[styles.label, { color: tokens.textSub }]}>{Strings.profile.goalReasonLabel}:</Text>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border, color: tokens.text },
              ]}
              multiline
              numberOfLines={3}
              value={reason}
              onChangeText={setReason}
              placeholder="Tự thưởng sau một năm nỗ lực cày cuốc"
              placeholderTextColor={tokens.textMuted}
            />

            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: tokens.primary },
                !name.trim() && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!name.trim()}
              activeOpacity={0.85}
            >
              <Check size={16} color="#1B2733" strokeWidth={2.6} />
              <Text style={styles.saveBtnText}>Lưu Mục Tiêu</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
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
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    marginBottom: 14,
  },
  textArea: {
    height: 72,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    fontSize: 13,
    fontWeight: '500',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: radii.md,
    gap: 6,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#1B2733',
    fontSize: 14,
    fontWeight: '700',
  },
});
