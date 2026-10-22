import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Flame, Sparkles, X, CheckCircle2, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

export interface StreakCheckinModalProps {
  visible: boolean;
  streakDays: number;
  hasCheckedInToday: boolean;
  onClose: () => void;
  onPressAction?: () => void;
}

export const StreakCheckinModal: React.FC<StreakCheckinModalProps> = ({
  visible,
  streakDays,
  hasCheckedInToday,
  onClose,
  onPressAction,
}) => {
  const { tokens, isDark } = useTheme();

  if (!visible) return null;

  const handleAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    if (onPressAction) {
      onPressAction();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.modalContent,
            {
              backgroundColor: tokens.surface,
              borderColor: tokens.border,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Nút đóng góc phải */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Đóng bảng điểm danh"
          >
            <X size={20} color={tokens.textMuted} strokeWidth={2.4} />
          </TouchableOpacity>

          {/* Icon ngọn lửa to nổi trần */}
          <View style={styles.flameIconWrapper}>
            <Flame
              size={52}
              color={streakDays > 0 ? tokens.primary : tokens.textMuted}
              strokeWidth={2.4}
            />
          </View>

          {/* Số ngày chuỗi */}
          <Text style={[styles.streakNumber, { color: tokens.text }]}>
            {streakDays} <Text style={{ fontSize: 20, fontWeight: '700' }}>ngày</Text>
          </Text>

          <Text style={[styles.streakSubTitle, { color: tokens.textMuted }]}>
            Chuỗi ngày ghi chép liên tiếp
          </Text>

          {/* Huy hiệu trạng thái hôm nay */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: hasCheckedInToday
                  ? isDark
                    ? 'rgba(45, 212, 191, 0.15)'
                    : 'rgba(126, 159, 128, 0.15)'
                  : isDark
                  ? 'rgba(229, 152, 68, 0.15)'
                  : '#FAF6EC',
              },
            ]}
          >
            {hasCheckedInToday ? (
              <CheckCircle2 size={16} color={tokens.success} strokeWidth={2.4} />
            ) : (
              <Sparkles size={16} color={tokens.primary} strokeWidth={2.4} />
            )}
            <Text
              style={[
                styles.statusPillText,
                { color: hasCheckedInToday ? tokens.success : tokens.primary },
              ]}
            >
              {hasCheckedInToday
                ? 'Đã điểm danh hôm nay'
                : 'Chưa điểm danh hôm nay'}
            </Text>
          </View>

          {/* Hộp thông điệp tĩnh tâm */}
          <View
            style={[
              styles.messageBox,
              {
                backgroundColor: tokens.surfaceAlt,
                borderColor: tokens.border,
              },
            ]}
          >
            <Text style={[styles.messageText, { color: tokens.text }]}>
              {hasCheckedInToday
                ? 'Tuyệt vời! Bạn đã giữ trọn nhịp sống tĩnh tâm và kỷ luật tài chính hôm nay. Hẹn gặp lại vào ngày mai nhé!'
                : 'Mỗi bức ảnh và khoản chi bạn ghi lại là một bước giữ chắc tương lai. Ghi ngay 1 khoản để nối dài chuỗi ngày nhé!'}
            </Text>
          </View>

          {/* Nút hành động */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: tokens.primary,
              },
            ]}
            onPress={handleAction}
            activeOpacity={0.85}
          >
            <Text style={[styles.actionButtonText, { color: tokens.textOnPrimary }]}>
              {hasCheckedInToday ? 'Tiếp tục giữ nhịp' : 'Ghi chép ngay'}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  flameIconWrapper: {
    marginTop: 8,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  streakSubTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 14,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusPillText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  messageBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 20,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionButton: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
});
