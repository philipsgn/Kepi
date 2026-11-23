import React, { useEffect, useRef, useState } from 'react';
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
import { SquadLocketView } from '../chat/SquadLocketView';
import { CoachMessageBubble } from '../chat/CoachMessageBubble';
import { UserMessageBubble } from '../chat/UserMessageBubble';
import { ChatInputBar } from '../chat/ChatInputBar';
import { UndoToastBar } from '../common/UndoToastBar';
import { useTransactionStore } from '../../store/transactionStore';
import { useBudgetStore } from '../../store/budgetStore';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { generateLocalCoachResponse, parseQuickRecordCommand } from '../../utils/chatUtils';
import * as ImagePicker from 'expo-image-picker';
import { formatCategoryName } from '../../constants/categoryDefaults';
import { formatVND } from '../../utils/currency';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { useBottomInset } from '../../hooks/useBottomInset';
import { ArrowLeft } from 'lucide-react-native';
import { PixelHubDashboard, SubViewType } from '../chat/PixelHubDashboard';
import { PigFlightGameView } from '../chat/PigFlightGameView';
import { PigCrossRoadGameView } from '../chat/PigCrossRoadGameView';
import { PiggySpendMapView } from '../chat/PiggySpendMapView';

interface ChatViewProps {
  onNavigateToStats?: () => void;
  onNavigateToCamera?: () => void;
  onToggleTabBar?: (visible: boolean) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'COACH',
    text: 'Chào bạn! PigFly — Chú Heo Béo thông thái đã sẵn sàng đồng hành cùng bạn. Hôm nay bạn muốn kiểm tra ngân sách hay tâm sự chi tiêu gì với PigFly nè?',
    createdAt: new Date().toISOString(),
  },
];

const PROMPT_CHIPS = [
  'Hôm nay còn chi được bao nhiêu?',
  'Tháng này chi nhiều nhất gì?',
  'Phản biện khoản vừa ghi',
  'Heo nhà đói chưa?',
  'Mẹo kiếm vé chơi',
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
  onToggleTabBar,
}) => {
  const insets = useSafeAreaInsets();
  const { tokens, mode } = useTheme();
  const isPink = mode === 'pink';
  const isHeocon = mode === 'heocon' || !mode;
  const screenBg = isHeocon ? '#F6EEDC' : (tokens.bg || '#FFF5F7');
  const { bottomInset } = useBottomInset();
  const [activeSubView, setActiveSubView] = useState<SubViewType>('hub');

  // Quyết định 144 & 166: Tự động ẩn Bottom Tab Bar khi vào Fullscreen Game Mode
  useEffect(() => {
    if (activeSubView === 'fly' || activeSubView === 'cross') {
      onToggleTabBar?.(false);
    } else {
      onToggleTabBar?.(true);
    }
  }, [activeSubView, onToggleTabBar]);
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
  const {
    gameTickets,
    pigFood,
    pigHunger,
    feedPig,
    updateGameStats,
    addPigFood,
    useGameTicket,
    buyTicketWithFood,
  } = useGamificationStore();

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

      // 2. Phản hồi thông minh theo số liệu thực tế RAG (CHỈ tính khoản đã CONFIRMED)
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

      // Tính danh mục chi nhiều nhất tháng này
      const catSpendMap: { [key: string]: number } = {};
      confirmedExpenses.forEach((t) => {
        catSpendMap[t.category] = (catSpendMap[t.category] || 0) + t.amount;
      });
      let topCategoryName = '';
      let topCategoryAmount = 0;
      Object.entries(catSpendMap).forEach(([cat, amt]) => {
        if (amt > topCategoryAmount) {
          topCategoryAmount = amt;
          topCategoryName = formatCategoryName(cat);
        }
      });

      const sortedExpenses = [...confirmedExpenses].sort(
        (a, b) => new Date(b.occurred_at || b.created_at).getTime() - new Date(a.occurred_at || a.created_at).getTime()
      );
      const recentExpense = sortedExpenses[0];

      const response = generateLocalCoachResponse(text, {
        todaySpent,
        remainingToday: Math.max(0, todayBudget - todaySpent),
        totalSpentThisMonth,
        topCategoryName: topCategoryName || undefined,
        topCategoryAmount: topCategoryAmount || undefined,
        coffeeSpentThisMonth: coffeeSpentThisMonth || 45000,
        transactionsCount: transactions.length,
        savingsGoalText: 'Tích lũy ngân sách an toàn cho quỹ dự phòng',
        nickname: profile?.full_name || undefined,
        recentExpenseName: recentExpense?.description || recentExpense?.category,
        recentExpenseAmount: recentExpense?.amount,
        pigHunger,
        gameTickets,
        pigFood,
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

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Tin nhắn từ người dùng kèm ảnh
        const userMsg: ChatMessage = {
          id: `user-${Date.now()}`,
          sender: 'USER',
          text: 'Gửi anh Minh xem món này',
          photoUrl: photoUri,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setIsThinking(true);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);

        // Phản hồi từ anh Minh bồ kèm thẻ xác nhận 1 chạm
        setTimeout(() => {
          const coachMsg: ChatMessage = {
            id: `coach-${Date.now()}`,
            sender: 'COACH',
            text: 'Ảnh nét lắm bồ ơi! Anh chuẩn bị sẵn thẻ ghi chi tiêu cho món này, bồ bấm Lưu vào sổ là xong ngay nhé!',
            cardType: 'CONFIRMATION',
            cardData: {
              amount: 50000,
              description: 'Khoản chi bằng ảnh',
              category: 'an_uong',
              photoUrl: photoUri,
              isSaved: false,
            },
            createdAt: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, coachMsg]);
          setIsThinking(false);

          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }, 800);
      }
    } catch (err) {
      console.warn('Lỗi chọn ảnh trong chat:', err);
    }
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
        photo_url: cardData.photoUrl || null,
        payment_method: 'CASH',
        source: cardData.photoUrl ? 'PHOTO' : 'MANUAL',
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

  if (activeSubView === 'hub') {
    return (
      <View style={[styles.container, { backgroundColor: screenBg, paddingTop: insets.top }]}>
        <PixelHubDashboard onSelectSubView={setActiveSubView} />
      </View>
    );
  }

  // Single-Active Game WebView Engine (Quyết định 170): Chỉ render 1 WebView đang chơi để 0 lag, 60FPS tuyệt đối
  if (activeSubView === 'fly') {
    return (
      <View style={[styles.container, { backgroundColor: screenBg, paddingTop: insets.top }]}>
        <PigFlightGameView
          onBack={() => setActiveSubView('hub')}
          onSwitchGame={(game) => setActiveSubView(game)}
          tickets={gameTickets}
          food={pigFood}
          hunger={pigHunger}
          onFeedPig={feedPig}
          onUseTicket={useGameTicket}
          onBuyTicket={buyTicketWithFood}
          onSaveStats={(stats) => {
            if (stats.foodEarned) addPigFood(stats.foodEarned);
            updateGameStats({ flyBestScore: stats.flyBestScore });
          }}
        />
      </View>
    );
  }

  if (activeSubView === 'cross') {
    return (
      <View style={[styles.container, { backgroundColor: screenBg, paddingTop: insets.top }]}>
        <PigCrossRoadGameView
          onBack={() => setActiveSubView('hub')}
          onSwitchGame={(game) => setActiveSubView(game)}
          tickets={gameTickets}
          food={pigFood}
          hunger={pigHunger}
          todayBudget={todayBudget}
          todaySpent={todaySpent}
          onFeedPig={feedPig}
          onUseTicket={useGameTicket}
          onBuyTicket={buyTicketWithFood}
          onSaveStats={(stats) => {
            if (stats.foodEarned) addPigFood(stats.foodEarned);
            updateGameStats({
              crossRoadStars: stats.crossRoadStars,
              crossRoadMaxLevel: stats.crossRoadMaxLevel,
            });
          }}
        />
      </View>
    );
  }

  if (activeSubView === 'map') {
    return (
      <View style={[styles.container, { backgroundColor: screenBg, paddingTop: insets.top }]}>
        <PiggySpendMapView onBack={() => setActiveSubView('hub')} />
      </View>
    );
  }

  if (activeSubView === 'squad') {
    return (
      <View style={[styles.container, { backgroundColor: screenBg, paddingTop: insets.top }]}>
        <SquadLocketView onBack={() => setActiveSubView('hub')} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: screenBg, paddingTop: insets.top }]}>
      {/* 0. HEADER NEO-BRUTALIST CHUẨN PROTOTYPE */}
      <View style={styles.chatHeaderRow}>
        <TouchableOpacity
          style={styles.hubBackButton}
          accessibilityLabel="Quay lại"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveSubView('hub');
          }}
          activeOpacity={0.8}
        >
          <ArrowLeft size={18} color="#2B2118" strokeWidth={2.8} />
        </TouchableOpacity>

        <View style={styles.chatTitleCol}>
          <Text style={styles.chatTitleText}>
            {activeTab === 'COACH' ? 'Heo-Coach Anh Minh' : 'Hội Bạn Thân (Squad)'}
          </Text>
          <Text style={styles.chatSubtitleText}>
            {activeTab === 'COACH' ? 'Gợi ý theo số liệu sổ chi' : 'Nuôi heo & chia sẻ chi tiêu'}
          </Text>
        </View>
      </View>

      {/* SEGMENT SWITCHER: HEO-COACH & HỘI BẠN THÂN */}
      <View style={styles.chatSegmentRow}>
        <TouchableOpacity
          style={[
            styles.chatSegmentBtn,
            activeTab === 'COACH' && styles.chatSegmentBtnActive,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('COACH');
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.chatSegmentBtnText,
              activeTab === 'COACH' && styles.chatSegmentBtnTextActive,
            ]}
          >
            🐷 Heo-Coach
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chatSegmentBtn,
            activeTab === 'FRIENDS' && styles.chatSegmentBtnActive,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('FRIENDS');
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.chatSegmentBtnText,
              activeTab === 'FRIENDS' && styles.chatSegmentBtnTextActive,
            ]}
          >
            👥 Hội Bạn Thân
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'FRIENDS' ? (
        <SquadLocketView />
      ) : (
        <KeyboardAvoidingView
          style={styles.coachContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* PROMPT CHIPS GỢI Ý NHANH */}
          <View
            style={[
              styles.chipsContainer,
              { backgroundColor: tokens.bg, borderBottomColor: tokens.border, borderBottomWidth: 2 },
            ]}
          >
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
                      backgroundColor: tokens.surface,
                      borderColor: tokens.border,
                      borderWidth: 2,
                      shadowColor: tokens.shadowColor,
                      shadowOffset: { width: 0, height: 1.5 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 1,
                    },
                  ]}
                  onPress={() => handlePromptChipPress(chip)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: tokens.text, fontFamily: 'Nunito', fontWeight: '800' },
                    ]}
                  >
                    {chip}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* DANH SÁCH TIN NHẮN TRONG KHUNG .CHATLOG */}
          <View
            style={[
              styles.chatlogWrapper,
              styles.chatlogWrapperHeocon,
            ]}
          >
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
                  <View
                    style={[
                      styles.thinkingBubble,
                      {
                        backgroundColor: tokens.surface,
                        borderColor: tokens.border,
                        borderWidth: 2.5,
                        borderRadius: 16,
                        shadowColor: tokens.shadowColor,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 1,
                        shadowRadius: 0,
                        elevation: 2,
                      },
                    ]}
                  >
                    <View style={[styles.thinkingDot, { backgroundColor: tokens.primary }]} />
                    <View style={[styles.thinkingDot, { backgroundColor: tokens.primary, opacity: 0.7 }]} />
                    <View style={[styles.thinkingDot, { backgroundColor: tokens.primary, opacity: 0.4 }]} />
                    <Text
                      style={[
                        styles.thinkingText,
                        { color: tokens.textMuted, fontFamily: 'Nunito', fontWeight: '700' },
                      ]}
                    >
                      Anh Minh đang tính toán...
                    </Text>
                  </View>
                ) : undefined
              }
            />
          </View>

          {/* THANH NHẬP LIỆU CHAT */}
          <ChatInputBar
            onSendMessage={handleSendMessage}
            onPickImage={handlePickImage}
            isThinking={isThinking}
          />

          {/* DÒNG CAM KẾT RIÊNG TƯ .PRIVACY */}
          {isHeocon && (
            <Text style={styles.privacyNote}>
              Heo-Coach đọc số liệu tổng hợp trong app. Ảnh và vị trí không được gửi đi.
            </Text>
          )}

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
  chatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  chatTitleCol: {
    flex: 1,
  },
  chatTitleText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: '#2B2118',
    lineHeight: 22,
  },
  chatSubtitleText: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 11.5,
    color: '#85735E',
  },
  chatSegmentRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    borderRadius: 999,
    padding: 3,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  chatSegmentBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  chatSegmentBtnActive: {
    backgroundColor: '#F4B93B',
    borderWidth: 2,
    borderColor: '#2B2118',
  },
  chatSegmentBtnText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 13,
    color: '#85735E',
  },
  chatSegmentBtnTextActive: {
    color: '#2B2118',
  },
  gameSlot: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gameSlotActive: {
    opacity: 1,
    zIndex: 10,
  },
  gameSlotInactive: {
    opacity: 0,
    zIndex: -1,
  },
  hubBackRow: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
  },
  hubBackButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBF1',
    borderWidth: 2.5,
    borderColor: '#2B2118',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  coachContainer: {
    flex: 1,
  },
  chatlogWrapper: {
    flex: 1,
  },
  chatlogWrapperHeocon: {
    marginHorizontal: 14,
    marginVertical: 6,
    backgroundColor: '#FFFBF1',
    borderWidth: 3,
    borderColor: '#2B2118',
    borderRadius: 22,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    overflow: 'hidden',
  },
  privacyNote: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 11.5,
    color: '#85735E',
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 6,
    backgroundColor: '#F6EEDC',
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
