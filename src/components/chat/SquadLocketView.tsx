import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import {
  Copy,
  Flame,
  Heart,
  LogIn,
  LogOut,
  MessageCircle,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react-native';
import { useSquadStore, SquadFeedItem } from '../../store/squadStore';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useTheme } from '../../theme/ThemeContext';
import { PigBoMascot } from '../mascot/PigBoMascot';
import { formatVND } from '../../utils/currency';
import { useBottomInset } from '../../hooks/useBottomInset';

export const SquadLocketView: React.FC = () => {
  const { tokens, isDark } = useTheme();
  const { contentBottomPadding } = useBottomInset();
  const { profile } = useAuthStore();
  const { transactions } = useTransactionStore();

  const {
    squad,
    members,
    feedItems,
    messages,
    isLoading,
    loadSquadFromStorage,
    createSquad,
    joinSquad,
    leaveSquad,
    sendSquadMessage,
    sendNudge,
    reactToFeedItem,
    syncTransactionsToFeed,
  } = useSquadStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [squadNameInput, setSquadNameInput] = useState('');
  const [squadCodeInput, setSquadCodeInput] = useState('');
  const [chatInput, setChatInput] = useState('');

  const currentUserName = profile?.full_name || 'Tôi';

  // Khôi phục dữ liệu phòng từ storage
  useEffect(() => {
    loadSquadFromStorage();
  }, []);

  // Đồng bộ giao dịch công khai vào Locket Feed khi vào phòng
  useEffect(() => {
    if (squad && transactions.length > 0) {
      syncTransactionsToFeed(transactions, currentUserName);
    }
  }, [squad, transactions]);

  // Sao chép mã phòng
  const handleCopyCode = async () => {
    if (!squad?.code) return;
    await Clipboard.setStringAsync(squad.code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Đã sao chép!', `Mã mời phòng "${squad.code}" đã được lưu vào bộ nhớ tạm. Hãy gửi cho bạn bè nhé!`);
  };

  // Tạo hội mới
  const handleConfirmCreate = async () => {
    if (!squadNameInput.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await createSquad(squadNameInput, currentUserName);
    if (success) {
      setShowCreateModal(false);
      setSquadNameInput('');
    }
  };

  // Tham gia bằng mã
  const handleConfirmJoin = async () => {
    if (!squadCodeInput.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const success = await joinSquad(squadCodeInput, currentUserName);
    if (success) {
      setShowJoinModal(false);
      setSquadCodeInput('');
    }
  };

  // Rời hội
  const handleLeaveSquad = () => {
    Alert.alert(
      'Rời hội bạn?',
      'Bạn có chắc chắn muốn rời khỏi hội nuôi heo này không?',
      [
        { text: 'Ở lại', style: 'cancel' },
        {
          text: 'Rời hội',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            leaveSquad();
          },
        },
      ]
    );
  };

  // Gửi tin nhắn chatroom
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sendSquadMessage(chatInput, currentUserName);
    setChatInput('');
  };

  // Tương tác 1-chạm: Nhắc Heo Đói hoặc Vỗ Béo Heo
  const handleNudgeAction = (memberId: string, type: 'FEED_PIG' | 'CHEER') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const text = sendNudge(memberId, type, currentUserName);
    Alert.alert(type === 'FEED_PIG' ? '👉 Đã nhắc heo đói!' : '🎉 Đã vỗ béo heo bạn!', text);
  };

  // ================= MÀN HÌNH CHƯA VÀO PHÒNG (ONBOARDING SQUAD) =================
  if (!squad) {
    return (
      <ScrollView
        contentContainerStyle={[styles.emptyContainer, { paddingBottom: contentBottomPadding + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emptyHero}>
          <PigBoMascot pose="happy" size={96} />
          <Text style={[styles.emptyTitle, { color: tokens.text }]}>Hội Bạn Thân Pigpo (2–4 Bạn)</Text>
          <Text style={[styles.emptyDesc, { color: tokens.textMuted }]}>
            Cùng nhau nuôi heo, xem Locket Feed khoảnh khắc chi tiêu của bạn bè, nhắc nhở tiết kiệm mỗi ngày mà không sợ lộ khoản chi riêng tư.
          </Text>
        </View>

        {/* 2 NÚT HÀNH ĐỘNG CHÍNH */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: tokens.primary }]}
            activeOpacity={0.85}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={18} color="#1B2733" strokeWidth={2.6} />
            <Text style={styles.primaryActionBtnText}>Tạo Hội Mới</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryActionBtn, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
            activeOpacity={0.85}
            onPress={() => setShowJoinModal(true)}
          >
            <LogIn size={18} color={tokens.text} strokeWidth={2.4} />
            <Text style={[styles.secondaryActionBtnText, { color: tokens.text }]}>Nhập Mã Phòng</Text>
          </TouchableOpacity>
        </View>

        {/* CÁC ĐẶC QUYỀN AN TOÀN */}
        <View style={[styles.securityCard, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
          <View style={styles.secRow}>
            <ShieldCheck size={18} color={tokens.primary} strokeWidth={2.4} />
            <Text style={[styles.secText, { color: tokens.textSub }]}>
              <Text style={{ fontWeight: '700', color: tokens.text }}>0$ Cloud & Ẩn danh:</Text> Vận hành qua Room Code bí mật, không yêu cầu số điện thoại hay tài khoản mạng xã hội.
            </Text>
          </View>
          <View style={[styles.secRow, { marginTop: 10 }]}>
            <Sparkles size={18} color={tokens.primary} strokeWidth={2.4} />
            <Text style={[styles.secText, { color: tokens.textSub }]}>
              <Text style={{ fontWeight: '700', color: tokens.text }}>Quyền riêng tư tuyệt đối:</Text> Khoản nào bật công tắc [🔒 Riêng tư] sẽ không bao giờ xuất hiện trên Feed.
            </Text>
          </View>
        </View>

        {/* MODAL TẠO PHÒNG */}
        <Modal visible={showCreateModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: isDark ? '#16202C' : '#FFFFFF' }]}>
              <Text style={[styles.modalTitle, { color: tokens.text }]}>Đặt Tên Hội Nuôi Heo</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#1E2C3D' : '#F8FAF9', color: tokens.text }]}
                placeholder="Ví dụ: Hội Bánh Mì Nuôi Heo..."
                placeholderTextColor={tokens.textMuted}
                value={squadNameInput}
                onChangeText={setSquadNameInput}
                autoFocus
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowCreateModal(false)}>
                  <Text style={[styles.modalCancelText, { color: tokens.textMuted }]}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: tokens.primary }]} onPress={handleConfirmCreate}>
                  <Text style={styles.modalConfirmText}>Tạo Ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL NHẬP MÃ PHÒNG */}
        <Modal visible={showJoinModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: isDark ? '#16202C' : '#FFFFFF' }]}>
              <Text style={[styles.modalTitle, { color: tokens.text }]}>Nhập Mã 6 Ký Tự</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: isDark ? '#1E2C3D' : '#F8FAF9', color: tokens.text, textTransform: 'uppercase', letterSpacing: 2 }]}
                placeholder="Ví dụ: PIG925"
                placeholderTextColor={tokens.textMuted}
                value={squadCodeInput}
                onChangeText={setSquadCodeInput}
                maxLength={8}
                autoFocus
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowJoinModal(false)}>
                  <Text style={[styles.modalCancelText, { color: tokens.textMuted }]}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalConfirmBtn, { backgroundColor: tokens.primary }]} onPress={handleConfirmJoin}>
                  <Text style={styles.modalConfirmText}>Tham Gia</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }

  // ================= MÀN HÌNH ĐÃ VÀO PHÒNG (SQUAD ACTIVE) =================
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.activeContainer, { paddingBottom: contentBottomPadding + 30 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. HEADER PHÒNG: TÊN & MÃ MỜI */}
        <View style={[styles.squadHeaderCard, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.squadNameText, { color: tokens.text }]} numberOfLines={1}>
              {squad.name}
            </Text>
            <TouchableOpacity style={styles.codeRow} onPress={handleCopyCode} activeOpacity={0.7}>
              <Text style={[styles.codeLabel, { color: tokens.textMuted }]}>Mã phòng:</Text>
              <Text style={[styles.codeBadge, { color: tokens.primary }]}>{squad.code}</Text>
              <Copy size={13} color={tokens.primary} strokeWidth={2.4} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.leaveBtn}
            onPress={handleLeaveSquad}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Rời hội"
          >
            <LogOut size={18} color="#EF4444" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* 2. HÀNG AVATAR HỘI BẠN & TRẠNG THÁI HEO */}
        <View style={styles.membersSection}>
          <Text style={[styles.sectionTitle, { color: tokens.text }]}>Hội Nuôi Heo ({members.length}/4 Bạn)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersScroll}>
            {members.map((member) => (
              <View key={member.id} style={[styles.memberCard, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
                <PigBoMascot pose={member.avatarPose} size={48} />
                <Text style={[styles.memberName, { color: tokens.text }]} numberOfLines={1}>
                  {member.name}
                </Text>
                
                {/* Trạng thái hôm nay */}
                <View style={[styles.statusBadge, { backgroundColor: member.hasFedPigToday ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.12)' }]}>
                  <Text style={[styles.statusText, { color: member.hasFedPigToday ? '#10B981' : '#EF4444' }]}>
                    {member.hasFedPigToday ? 'Đã cho ăn' : 'Heo đang đói'}
                  </Text>
                </View>

                {/* Nút tương tác 1-chạm nếu là bạn bè */}
                {member.id !== 'my-user' && (
                  <TouchableOpacity
                    style={[styles.nudgeBtn, { backgroundColor: member.hasFedPigToday ? 'rgba(229, 152, 68, 0.18)' : 'rgba(239, 68, 68, 0.15)' }]}
                    onPress={() => handleNudgeAction(member.id, member.hasFedPigToday ? 'CHEER' : 'FEED_PIG')}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.nudgeBtnText, { color: member.hasFedPigToday ? '#D97706' : '#EF4444' }]}>
                      {member.hasFedPigToday ? '🎉 Vỗ béo' : '👉 Nhắc đói'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* 3. LOCKET FEED KHOẢNH KHẮC CHI TIÊU CỦA HỘI BẠN */}
        <View style={styles.feedSection}>
          <Text style={[styles.sectionTitle, { color: tokens.text }]}>Khoảnh Khắc Chi Tiêu (Locket Feed)</Text>
          {feedItems.length === 0 ? (
            <View style={[styles.emptyFeedBox, { backgroundColor: tokens.surfaceAlt }]}>
              <Text style={[styles.emptyFeedText, { color: tokens.textMuted }]}>
                Chưa có ảnh chi tiêu nào được chia sẻ. Khi bạn chụp ảnh ghi sổ không bật [🔒 Riêng tư], ảnh sẽ tự động hiện ở đây!
              </Text>
            </View>
          ) : (
            feedItems.map((item) => (
              <View key={item.id} style={[styles.feedCard, { backgroundColor: isDark ? '#16202C' : '#FFFFFF', borderColor: tokens.border }]}>
                <View style={styles.feedHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <PigBoMascot pose="welcome" size={32} />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={[styles.feedUserName, { color: tokens.text }]}>{item.userName}</Text>
                      <Text style={[styles.feedTime, { color: tokens.textMuted }]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.feedAmount, { color: tokens.danger }]}>
                    -{formatVND(item.amount)}
                  </Text>
                </View>

                {item.description ? (
                  <Text style={[styles.feedDesc, { color: tokens.textSub }]}>{item.description}</Text>
                ) : null}

                {/* Dải Reaction Thả Biểu Cảm */}
                <View style={styles.reactionRow}>
                  {['❤️', '🎉', '👏'].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[styles.reactionBtn, { backgroundColor: tokens.surfaceAlt }]}
                      onPress={() => reactToFeedItem(item.id, emoji)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.reactionEmoji}>{emoji}</Text>
                      {item.reactions[emoji] ? (
                        <Text style={[styles.reactionCount, { color: tokens.text }]}>{item.reactions[emoji]}</Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>

        {/* 4. CHATROOM TRÒ CHUYỆN HỘI BẠN THÂN */}
        <View style={styles.chatSection}>
          <Text style={[styles.sectionTitle, { color: tokens.text }]}>Nhắn Tin Với Hội Bạn</Text>
          <View style={[styles.chatBox, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
            {messages.slice(-5).map((m) => (
              <View key={m.id} style={styles.msgLine}>
                <Text style={[styles.msgSender, { color: tokens.primary }]}>{m.senderName}:</Text>
                <Text style={[styles.msgText, { color: tokens.text }]}> {m.text}</Text>
              </View>
            ))}

            <View style={styles.chatInputRow}>
              <TextInput
                style={[styles.chatTextInput, { color: tokens.text }]}
                placeholder="Nhắn tin với hội bạn..."
                placeholderTextColor={tokens.textMuted}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleSendChat}
              />
              <TouchableOpacity onPress={handleSendChat} style={styles.sendBtn} activeOpacity={0.7}>
                <Send size={16} color={tokens.primary} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  emptyHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13.5,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  primaryActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1B2733',
  },
  secondaryActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryActionBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  securityCard: {
    width: '100%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  secRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  secText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
  },

  /* MODALS */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  modalInput: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1B2733',
  },

  /* ACTIVE SQUAD */
  activeContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 18,
  },
  squadHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  squadNameText: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
  codeBadge: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  leaveBtn: {
    padding: 8,
  },

  /* MEMBERS */
  membersSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  membersScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  memberCard: {
    width: 105,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
  },
  memberName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  nudgeBtn: {
    width: '100%',
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  nudgeBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },

  /* FEED */
  feedSection: {
    gap: 10,
  },
  emptyFeedBox: {
    padding: 16,
    borderRadius: 16,
  },
  emptyFeedText: {
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
  },
  feedCard: {
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedUserName: {
    fontSize: 14,
    fontWeight: '700',
  },
  feedTime: {
    fontSize: 11,
  },
  feedAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  feedDesc: {
    fontSize: 13,
  },
  reactionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reactionEmoji: {
    fontSize: 13,
  },
  reactionCount: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* CHAT */
  chatSection: {
    gap: 10,
  },
  chatBox: {
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
  },
  msgLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  msgSender: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  msgText: {
    fontSize: 12.5,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  chatTextInput: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.04)',
    fontSize: 13,
  },
  sendBtn: {
    padding: 8,
  },
});
