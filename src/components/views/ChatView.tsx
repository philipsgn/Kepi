import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Strings } from '../../constants/strings';
import { ChatMessage } from '../../types/chat';
import { ChatTopSegmentHeader } from '../chat/ChatTopSegmentHeader';
import { FriendsComingSoonView } from '../chat/FriendsComingSoonView';
import { CoachMessageBubble } from '../chat/CoachMessageBubble';
import { UserMessageBubble } from '../chat/UserMessageBubble';
import { ChatInputBar } from '../chat/ChatInputBar';
import { UndoToastBar } from '../common/UndoToastBar';
import { useTransactionStore } from '../../store/transactionStore';
import { useBudgetStore } from '../../store/budgetStore';
import { useAuthStore } from '../../store/authStore';
import { generateLocalCoachResponse, parseQuickRecordCommand } from '../../utils/chatUtils';
import { formatVND } from '../../utils/currency';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { useBottomInset } from '../../hooks/useBottomInset';

interface ChatViewProps {
  onNavigateToStats?: () => void;
  onNavigateToCamera?: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'COACH',
    text: 'Chào bạn, anh là Minh — Cố vấn tĩnh tâm của bạn. Hôm nay bạn muốn kiểm tra ngân sách hay nhờ anh ghi nhanh khoản chi nào?',
    createdAt: new Date().toISOString(),
  },
];

const PROMPT_CHIPS = [
  Strings.chat.promptTodayRemaining,
  Strings.chat.promptCoffeeTotal,
  Strings.chat.promptShouldIBuy,
  Strings.chat.promptSetGoal,
];

/**
 * Trang 3: Chat / Bạn Bè & Coach Minh (ChatView) — Phong cách "Ấm, tĩnh, sang"
 * Tuân thủ mục 6 của PROMPT và docs/screens/CHAT.md:
 * - Hỗ trợ Sáng / Tối với tokens từ useTheme().
 * - Persona Cố vấn tĩnh tâm gần gũi, lắng đọng.
 * - Khoảng đệm bàn phím & tab bar nổi mượt mà, không va chạm.
 */
export const ChatView: React.FC<ChatViewProps> = ({
  onNavigateToStats,
  onNavigateToCamera,
}) => {
  const insets = useSafeAreaInsets();
  const { tokens } = useTheme();
  const { bottomInset } = useBottomInset();
  const [activeTab, setActiveTab] = useState<'COACH' | 'FRIENDS'>('COACH');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [isThinking, setIsThinking] = useState(false);

  // Undo Toast state
  const [undoToast, setUndoToast] = useState<{
    visible: boolean;
    message: string;
    txId: string | null;
    amount: number;
  }>({
    visible: false,
    message: '',
    txId: null,
    amount: 0,
  });

  const flatListRef = useRef<FlatList<ChatMessage> | null>(null);

  // Store access
  const { user, profile } = useAuthStore();
  const { todayBudget, todaySpent, recordExpense } = useBudgetStore();
  const { transactions, addTransaction, deleteTransaction } = useTransactionStore();

  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    // Scroll to bottom after adding user message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Xử lý phản hồi từ Coach
    setTimeout(() => {
      // 1. Kiểm tra xem có phải lệnh ghi sổ nhanh
      const quickRecord = parseQuickRecordCommand(text);
      if (quickRecord) {
        const coachMsg: ChatMessage = {
          id: `coach-${Date.now()}`,
          sender: 'COACH',
          text: Strings.chat.saveConfirmPrompt,
          cardType: 'CONFIRMATION',
          cardData: {
            amount: quickRecord.amount,
            description: quickRecord.description,
            category: quickRecord.category,
            isSaved: false,
          },
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, coachMsg]);
        setIsThinking(false);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
        return;
      }

      // 2. Phản hồi thông minh theo số liệu thực tế (CHỈ tính khoản đã CONFIRMED)
      const confirmedExpenses = transactions.filter(
        (t) => t.type === 'EXPENSE' && (t.status === 'CONFIRMED' || !t.status)
      );
      const totalSpentThisMonth = confirmedExpenses.reduce((sum, t) => sum + t.amount, 0);

      const coffeeSpentThisMonth = confirmedExpenses
        .filter(
          (t) =>
            (t.category === 'Ăn uống' || t.category === 'Ăn vặt' || t.category === 'Ăn uống & Cà phê' || t.category === 'ca_phe') &&
            /cà phê|cafe|coffee|trà sữa|nước mía|nước/i.test(t.description || '')
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const response = generateLocalCoachResponse(text, {
        remainingToday: Math.max(0, todayBudget - todaySpent),
        totalSpentThisMonth,
        coffeeSpentThisMonth: coffeeSpentThisMonth || 45000,
        transactionsCount: transactions.length,
        nickname: profile?.full_name || undefined,
      });

      const coachMsg: ChatMessage = {
        id: `coach-${Date.now()}`,
        sender: 'COACH',
        text: response.text,
        cardType: response.cardType,
        cardData: response.cardData,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, coachMsg]);
      setIsThinking(false);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 500);
  };

  const handleConfirmRecord = async (cardData: any) => {
    if (cardData.isSaved) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const newTx = await addTransaction({
        userId: user?.id || 'guest',
        type: 'EXPENSE',
        amount: cardData.amount,
        category: cardData.category,
        description: cardData.description,
        photo_url: null,
        payment_method: 'CASH',
        source: 'MANUAL',
      });

      recordExpense(cardData.amount);

      // Cập nhật trạng thái đã lưu vào tin nhắn tương ứng
      setMessages((prev) =>
        prev.map((m) => {
          if (m.cardType === 'CONFIRMATION' && m.cardData?.amount === cardData.amount) {
            return {
              ...m,
              cardData: {
                ...m.cardData,
                isSaved: true,
              },
            };
          }
          return m;
        })
      );

      // Hiện thanh Undo Toast
      setUndoToast({
        visible: true,
        message: Strings.camera.undoToast(formatVND(cardData.amount)),
        txId: newTx.id,
        amount: cardData.amount,
      });
    } catch (err) {
      console.warn('Failed to save transaction from chat:', err);
    }
  };

  const handleUndo = async () => {
    if (undoToast.txId) {
      await deleteTransaction(undoToast.txId);
      recordExpense(-undoToast.amount);
    }
    setUndoToast({ visible: false, message: '', txId: null, amount: 0 });
  };

  const handleUndoExpire = () => {
    setUndoToast({ visible: false, message: '', txId: null, amount: 0 });
  };

  const handlePromptChipPress = (prompt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleSendMessage(prompt);
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg, paddingTop: insets.top }]}>
      {/* 1. TOP SEGMENT HEADER [Anh Minh | Bạn bè] */}
      <ChatTopSegmentHeader activeTab={activeTab} onSelectTab={setActiveTab} />

      {activeTab === 'FRIENDS' ? (
        /* 2. NGĂN BẠN BÈ: SẮP RA MẮT */
        <FriendsComingSoonView />
      ) : (
        /* 3. NGĂN ANH MINH: TRÒ CHUYỆN VỚI CỐ VẤN TĨNH TÂM */
        <KeyboardAvoidingView
          style={styles.coachContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* PROMPT CHIPS GỢI Ý NHANH */}
          <View style={[styles.chipsContainer, { backgroundColor: tokens.bg, borderBottomColor: tokens.border }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsScrollContent}
            >
              {PROMPT_CHIPS.map((chip, idx) => (
                <TouchableOpacity
                  key={`chip-${idx}`}
                  style={[
                    styles.chipButton,
                    {
                      backgroundColor: tokens.surfaceAlt,
                      borderColor: tokens.border,
                    },
                  ]}
                  onPress={() => handlePromptChipPress(chip)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.chipText, { color: tokens.text }]}>{chip}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* DANH SÁCH TIN NHẮN */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.messagesContent,
              { paddingBottom: 16 },
            ]}
            renderItem={({ item }) => {
              if (item.sender === 'USER') {
                return <UserMessageBubble message={item} />;
              }
              return (
                <CoachMessageBubble
                  message={item}
                  onNavigateToStats={onNavigateToStats}
                  onConfirmRecord={handleConfirmRecord}
                />
              );
            }}
            ListFooterComponent={
              isThinking ? (
                <View style={[styles.thinkingBubble, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
                  <View style={[styles.thinkingDot, { backgroundColor: tokens.primary }]} />
                  <View style={[styles.thinkingDot, { backgroundColor: tokens.primary, opacity: 0.7 }]} />
                  <View style={[styles.thinkingDot, { backgroundColor: tokens.primary, opacity: 0.4 }]} />
                  <Text style={[styles.thinkingText, { color: tokens.textMuted }]}>Anh Minh đang tính toán...</Text>
                </View>
              ) : null
            }
          />

          {/* THANH NHẬP LIỆU CHAT */}
          <ChatInputBar
            onSendMessage={handleSendMessage}
            isThinking={isThinking}
          />

          {/* THANH HOÀN TÁC 5 GIÂY NẾU VỪA LƯU */}
          <UndoToastBar
            visible={undoToast.visible}
            message={undoToast.message}
            onUndo={handleUndo}
            onExpire={handleUndoExpire}
            bottomOffset={bottomInset + 65}
          />
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coachContainer: {
    flex: 1,
  },
  chipsContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  chipsScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chipButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messagesContent: {
    paddingVertical: 12,
  },
  thinkingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 58,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 6,
  },
  thinkingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  thinkingText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});
