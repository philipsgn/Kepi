import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
  Flame,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  X,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';
import { Typography } from '../../constants/typography';
import { MinhAvatar } from './MinhAvatar';
import { useMinhCoachStore } from '../../store/minhCoachStore';
import { useBudgetStore } from '../../store/budgetStore';
import { formatCompactVND, formatVND } from '../../utils/currency';

interface MinhCoachModalProps {
  visible: boolean;
  onClose: () => void;
}

const QUICK_PROMPTS = [
  'Có nên mua món này không? 🤔',
  'Lỡ tiêu lố hôm nay làm sao? 🆘',
  'Lên giáo án kỷ luật tuần này 📋',
  'Mẹo săn sale không lố ví 🏷️',
];

export const MinhCoachModal: React.FC<MinhCoachModalProps> = ({
  visible,
  onClose,
}) => {
  const {
    expression,
    messages,
    isThinking,
    sendChatMessage,
    clearChatHistory,
    resistedImpulsesCount,
    totalSavedFromTrend,
  } = useMinhCoachStore();

  const {
    todayBudget,
    todaySpent,
    realBalance,
    savedMoney,
    goalName,
    goalTargetAmount,
  } = useBudgetStore();

  const [inputMessage, setInputMessage] = useState('');
  const chatScrollRef = useRef<ScrollView | null>(null);

  const remainingToday = todayBudget - todaySpent;
  const goalProgress =
    goalTargetAmount > 0
      ? Math.min(100, Math.round((savedMoney / goalTargetAmount) * 100))
      : 0;

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isThinking) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputMessage('');

    sendChatMessage(text, {
      todayBudget,
      todaySpent,
      remainingToday,
      goalName,
      goalTargetAmount,
      savedMoney,
    });

    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
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
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.modalCard}
            >
              {/* NÚT ĐÓNG GÓC TRÊN */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={18} color={Colors.textMuted} />
              </TouchableOpacity>

              {/* 1. HEADER ANH PT MINH SIGNATURE */}
              <View style={styles.header}>
                <MinhAvatar size="hero" expression={expression} />
                <View style={styles.headerInfo}>
                  <View style={styles.nameBadge}>
                    <Sparkles size={13} color={Colors.accentGold} />
                    <Text style={styles.nameBadgeText}>Minh Locket • Anh PT Giữ Ví</Text>
                  </View>
                  <Text style={styles.headerTagline}>
                    Huấn luyện viên cá nhân quản lý dòng tiền của bồ
                  </Text>
                </View>
              </View>

              {/* 2. THẺ KỶ LUẬT HÔM NAY (DISCIPLINE STATUS CARD) */}
              <View style={styles.disciplineCard}>
                <View style={styles.disciplineRow}>
                  <View style={styles.disciplineItem}>
                    <Text style={styles.disciplineLabel}>Hôm nay còn</Text>
                    <Text
                      style={[
                        styles.disciplineValue,
                        { color: remainingToday > 0 ? Colors.incomeMint : Colors.expenseCoral },
                      ]}
                    >
                      {formatCompactVND(remainingToday)}
                    </Text>
                  </View>

                  <View style={styles.disciplineDivider} />

                  <View style={styles.disciplineItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Target size={12} color={Colors.accentGold} />
                      <Text style={styles.disciplineLabel}>{goalName || 'Mục tiêu'}</Text>
                    </View>
                    <Text style={[styles.disciplineValue, { color: Colors.accentGold }]}>
                      {goalProgress}%
                    </Text>
                  </View>

                  <View style={styles.disciplineDivider} />

                  <View style={styles.disciplineItem}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <ShieldCheck size={12} color={Colors.incomeMint} />
                      <Text style={styles.disciplineLabel}>Đã Cứu Ví</Text>
                    </View>
                    <Text style={[styles.disciplineValue, { color: Colors.incomeMint }]}>
                      {resistedImpulsesCount} lần
                    </Text>
                  </View>
                </View>
              </View>

              {/* 3. CÁC NÚT CÂU HỎI NHANH 1-CHẠM (QUICK PROMPTS) */}
              <View style={styles.quickPromptsWrapper}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.quickPromptsList}
                >
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.promptPill}
                      onPress={() => handleSend(prompt)}
                      activeOpacity={0.75}
                    >
                      <Text style={styles.promptPillText}>{prompt}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* 4. KHUNG CHAT 2 CHIỀU (CHAT THREAD) */}
              <View style={styles.chatThreadWrapper}>
                <ScrollView
                  ref={chatScrollRef}
                  style={styles.chatScrollView}
                  contentContainerStyle={styles.chatScrollContent}
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
                >
                  {messages.map((msg) => {
                    const isCoach = msg.sender === 'coach';
                    return (
                      <View
                        key={msg.id}
                        style={[
                          styles.chatBubbleRow,
                          isCoach ? styles.coachRow : styles.userRow,
                        ]}
                      >
                        {isCoach && (
                          <MinhAvatar size="sm" style={styles.chatAvatarMini} />
                        )}
                        <View
                          style={[
                            styles.chatBubble,
                            isCoach ? styles.coachBubble : styles.userBubble,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chatMessageText,
                              isCoach ? styles.coachText : styles.userText,
                            ]}
                          >
                            {msg.text}
                          </Text>
                        </View>
                      </View>
                    );
                  })}

                  {isThinking && (
                    <View style={[styles.chatBubbleRow, styles.coachRow]}>
                      <MinhAvatar size="sm" style={styles.chatAvatarMini} />
                      <View style={[styles.chatBubble, styles.coachBubble, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                        <ActivityIndicator size="small" color={Colors.accentGold} />
                        <Text style={styles.thinkingText}>Minh đang lên giáo án...</Text>
                      </View>
                    </View>
                  )}
                </ScrollView>
              </View>

              {/* 5. THANH NHẬP TIN NHẮN (INPUT BAR) */}
              <View style={styles.inputBar}>
                <TextInput
                  style={styles.inputField}
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  placeholder="Hỏi Minh về khoản chi hoặc tâm sự tài chính..."
                  placeholderTextColor={Colors.textMuted}
                  onSubmitEditing={() => handleSend()}
                  returnKeyType="send"
                />

                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    (!inputMessage.trim() || isThinking) && styles.sendBtnDisabled,
                  ]}
                  onPress={() => handleSend()}
                  disabled={!inputMessage.trim() || isThinking}
                  activeOpacity={0.8}
                >
                  <Send size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* FOOTER HINT */}
              <View style={styles.footerHintRow}>
                <Text style={styles.tapOutsideHint}>
                  Chạm vào vùng tối bên ngoài để đóng
                </Text>
                {messages.length > 2 && (
                  <TouchableOpacity
                    onPress={clearChatHistory}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.clearChatText}>Xóa chat</Text>
                  </TouchableOpacity>
                )}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxHeight: '92%',
    backgroundColor: Colors.bgPrimary,
    borderRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(229, 152, 68, 0.3)',
    ...Shadows.floating,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    paddingBottom: Spacing.sm,
  },
  headerInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  nameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(229, 152, 68, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(229, 152, 68, 0.3)',
  },
  nameBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accentGold,
  },
  headerTagline: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  disciplineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(74, 92, 70, 0.12)',
    ...Shadows.soft,
  },
  disciplineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  disciplineItem: {
    alignItems: 'center',
  },
  disciplineLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  disciplineValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  disciplineDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(74, 92, 70, 0.1)',
  },
  quickPromptsWrapper: {
    marginVertical: 6,
  },
  quickPromptsList: {
    gap: 6,
    paddingHorizontal: 2,
  },
  promptPill: {
    backgroundColor: 'rgba(229, 152, 68, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(229, 152, 68, 0.25)',
  },
  promptPillText: {
    fontSize: 11,
    color: Colors.accentGold,
    fontWeight: '600',
  },
  chatThreadWrapper: {
    flex: 1,
    minHeight: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(74, 92, 70, 0.1)',
    marginVertical: 6,
    overflow: 'hidden',
  },
  chatScrollView: {
    flex: 1,
  },
  chatScrollContent: {
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  chatBubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    maxWidth: '88%',
  },
  coachRow: {
    alignSelf: 'flex-start',
  },
  userRow: {
    alignSelf: 'flex-end',
  },
  chatAvatarMini: {
    marginBottom: 2,
  },
  chatBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  coachBubble: {
    backgroundColor: Colors.bgPrimary,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: 'rgba(229, 152, 68, 0.2)',
  },
  userBubble: {
    backgroundColor: Colors.accentGold,
    borderBottomRightRadius: 2,
  },
  chatMessageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  coachText: {
    color: Colors.textCharcoal,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  thinkingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  inputField: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textCharcoal,
    borderWidth: 1,
    borderColor: 'rgba(74, 92, 70, 0.2)',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.accentGold,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.chunky3D,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  footerHintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    paddingHorizontal: 4,
  },
  tapOutsideHint: {
    fontSize: 10,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  clearChatText: {
    fontSize: 10,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});
