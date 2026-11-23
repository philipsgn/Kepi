import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
  ArrowLeft,
  Copy,
  Dices,
  Flame,
  Heart,
  LogIn,
  LogOut,
  MessageCircle,
  Plus,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react-native';
import { useSquadStore, SquadFeedItem } from '../../store/squadStore';
import { useAuthStore } from '../../store/authStore';
import { useTransactionStore } from '../../store/transactionStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { useTheme } from '../../theme/ThemeContext';
import { PixelPigAvatar } from '../pixel/PixelPigAvatar';
import { PigFly3DFlightModal } from '../game/PigFly3DFlightModal';
import { formatVND } from '../../utils/currency';
import { useBottomInset } from '../../hooks/useBottomInset';

export interface SquadLocketViewProps {
  onBack?: () => void;
}

export const SquadLocketView: React.FC<SquadLocketViewProps> = ({ onBack }) => {
  const { tokens, isDark, mode } = useTheme();
  const isHeocon = mode === 'heocon' || !mode;
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
    activeSosAlarm,
    dismissSosAlarm,
  } = useSquadStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [squadNameInput, setSquadNameInput] = useState('');
  const [squadCodeInput, setSquadCodeInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [show3DFlightModal, setShow3DFlightModal] = useState(false);
  const { streakDays } = useGamificationStore();

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
        {onBack && (
          <View style={styles.hubBackRow}>
            <TouchableOpacity
              style={styles.hubBackButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onBack();
              }}
              activeOpacity={0.8}
              accessibilityLabel="Quay lại"
            >
              <ArrowLeft size={18} color="#2B2118" strokeWidth={2.8} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.emptyHero}>
          <PixelPigAvatar mood="happy" size={72} />
          <Text style={styles.emptyTitle}>Squad Nuôi Heo PigFly (2–4 Bạn)</Text>
          <Text style={styles.emptyDesc}>
            Cùng nhau nuôi heo, xem Locket Feed khoảnh khắc chi tiêu của bạn bè, nhắc nhở tiết kiệm mỗi ngày mà không sợ lộ khoản chi riêng tư.
          </Text>
        </View>

        {/* 2 NÚT HÀNH ĐỘNG CHÍNH */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.primaryActionBtn}
            activeOpacity={0.85}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={18} color="#2B2118" strokeWidth={2.8} />
            <Text style={styles.primaryActionBtnText}>Tạo Hội Mới</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionBtn}
            activeOpacity={0.85}
            onPress={() => setShowJoinModal(true)}
          >
            <LogIn size={18} color="#2B2118" strokeWidth={2.6} />
            <Text style={styles.secondaryActionBtnText}>Nhập Mã Phòng</Text>
          </TouchableOpacity>
        </View>

        {/* CÁC ĐẶC QUYỀN AN TOÀN */}
        <View style={styles.securityCard}>
          <View style={styles.secRow}>
            <ShieldCheck size={18} color="#F4B93B" strokeWidth={2.6} />
            <Text style={styles.secText}>
              <Text style={{ fontWeight: '800', color: '#2B2118' }}>0$ Cloud & Ẩn danh:</Text> Vận hành qua Room Code bí mật, không yêu cầu số điện thoại hay tài khoản mạng xã hội.
            </Text>
          </View>
          <View style={[styles.secRow, { marginTop: 10 }]}>
            <Sparkles size={18} color="#F4B93B" strokeWidth={2.6} />
            <Text style={styles.secText}>
              <Text style={{ fontWeight: '800', color: '#2B2118' }}>Quyền riêng tư tuyệt đối:</Text> Khoản nào bật công tắc [🔒 Riêng tư] sẽ không bao giờ xuất hiện trên Feed.
            </Text>
          </View>
        </View>

        {/* MODAL TẠO PHÒNG */}
        <Modal visible={showCreateModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Đặt Tên Hội Nuôi Heo</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ví dụ: Hội Bánh Mì Nuôi Heo..."
                placeholderTextColor="#A89A8A"
                value={squadNameInput}
                onChangeText={setSquadNameInput}
                autoFocus
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowCreateModal(false)}>
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmCreate}>
                  <Text style={styles.modalConfirmText}>Tạo Ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <PigFly3DFlightModal
          visible={show3DFlightModal}
          onClose={() => setShow3DFlightModal(false)}
          streakDays={streakDays}
          userName={currentUserName}
          onShareToSquad={(msg) => sendSquadMessage(msg, currentUserName)}
        />

        {/* MODAL NHẬP MÃ PHÒNG */}
        <Modal visible={showJoinModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Nhập Mã 6 Ký Tự</Text>
              <TextInput
                style={[styles.modalInput, { textTransform: 'uppercase', letterSpacing: 2 }]}
                placeholder="Ví dụ: PIG925"
                placeholderTextColor="#A89A8A"
                value={squadCodeInput}
                onChangeText={setSquadCodeInput}
                maxLength={8}
                autoFocus
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowJoinModal(false)}>
                  <Text style={styles.modalCancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirmJoin}>
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
        <View style={styles.squadHeaderCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.squadNameText} numberOfLines={1}>
              {squad.name}
            </Text>
            <TouchableOpacity style={styles.codeRow} onPress={handleCopyCode} activeOpacity={0.7}>
              <Text style={styles.codeLabel}>Mã phòng:</Text>
              <View style={styles.codeBadgeWrap}>
                <Text style={styles.codeBadge}>{squad.code}</Text>
                <Copy size={13} color="#2B2118" strokeWidth={2.4} style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.leaveBtn}
            onPress={handleLeaveSquad}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Rời hội"
          >
            <LogOut size={16} color="#EF4444" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* SOS OVERSPENDING ALARM BANNER */}
        {activeSosAlarm ? (
          <View style={{ backgroundColor: 'rgba(225, 29, 72, 0.1)', borderColor: '#EF4444', borderWidth: 2, borderRadius: 16, padding: 12, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 13, fontFamily: 'Baloo2_800ExtraBold', color: '#EF4444' }}>🚨 BÁO ĐỘNG CỨU VÍ SQUAD!</Text>
              <TouchableOpacity onPress={dismissSosAlarm} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={16} color="#EF4444" strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, fontFamily: 'Nunito', fontWeight: '700', color: '#2B2118', lineHeight: 16, marginBottom: 8 }}>{activeSosAlarm.message}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#EF4444', borderWidth: 2, borderColor: '#2B2118', paddingVertical: 6, borderRadius: 10, alignItems: 'center' }}
                onPress={() => sendSquadMessage(`🛡️ Cố lên ${activeSosAlarm.memberName}, hãy kiềm chế nhé!`, currentUserName)}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontFamily: 'Baloo2_800ExtraBold' }}>🛡️ Thả Meme Khuyên Can</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#FFFBF1', borderWidth: 2, borderColor: '#2B2118', paddingVertical: 6, borderRadius: 10, alignItems: 'center' }}
                onPress={() => sendSquadMessage(`☕ Đừng lo ${activeSosAlarm.memberName}, mai siết eo lại nhé!`, currentUserName)}
              >
                <Text style={{ color: '#2B2118', fontSize: 11, fontFamily: 'Baloo2_800ExtraBold' }}>☕ Động Viên</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* NÚT PHÓNG CHUYẾN BAY PIGFLY 3D FPS (MARIO-STYLE UNLOCK) */}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F4B93B',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 16,
            marginBottom: 14,
            gap: 8,
            borderWidth: 3,
            borderColor: '#2B2118',
            shadowColor: '#2B2118',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 3,
          }}
          activeOpacity={0.85}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShow3DFlightModal(true);
          }}
        >
          <Rocket size={18} color="#2B2118" strokeWidth={2.8} />
          <Text style={{ color: '#2B2118', fontSize: 13, fontFamily: 'Baloo2_800ExtraBold' }}>
            Chuyến Bay PigFly 3D FPS 🚀
          </Text>
          <View
            style={{
              backgroundColor: '#FFFBF1',
              borderWidth: 1.5,
              borderColor: '#2B2118',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#2B2118', fontSize: 10, fontFamily: 'Baloo2_800ExtraBold' }}>
              {streakDays}N
            </Text>
          </View>
        </TouchableOpacity>

        {/* 2. HÀNG AVATAR HỘI BẠN & TRẠNG THÁI HEO */}
        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Hội Nuôi Heo ({members.length}/4 Bạn)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersScroll}>
            {members.map((member) => (
              <View key={member.id} style={styles.memberCard}>
                <PixelPigAvatar mood={member.hasFedPigToday ? 'happy' : 'sad'} size={44} />
                <Text style={styles.memberName} numberOfLines={1}>
                  {member.name}
                </Text>
                
                {/* Trạng thái hôm nay */}
                <View style={[styles.statusBadge, { backgroundColor: member.hasFedPigToday ? '#D1FAE5' : '#FEE2E2' }]}>
                  <Text style={[styles.statusText, { color: member.hasFedPigToday ? '#065F46' : '#991B1B' }]}>
                    {member.hasFedPigToday ? 'Đã cho ăn' : 'Heo đang đói'}
                  </Text>
                </View>

                {/* Nút tương tác 1-chạm nếu là bạn bè */}
                {member.id !== 'my-user' && (
                  <TouchableOpacity
                    style={[styles.nudgeBtn, { backgroundColor: member.hasFedPigToday ? '#FEF3C7' : '#FEE2E2' }]}
                    onPress={() => handleNudgeAction(member.id, member.hasFedPigToday ? 'CHEER' : 'FEED_PIG')}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.nudgeBtnText, { color: member.hasFedPigToday ? '#92400E' : '#991B1B' }]}>
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
          <Text style={styles.sectionTitle}>Khoảnh Khắc Chi Tiêu (Locket Feed)</Text>
          {feedItems.length === 0 ? (
            <View style={styles.emptyFeedBox}>
              <Text style={styles.emptyFeedText}>
                Chưa có ảnh chi tiêu nào được chia sẻ. Khi bạn chụp ảnh ghi sổ không bật [🔒 Riêng tư], ảnh sẽ tự động hiện ở đây!
              </Text>
            </View>
          ) : (
            feedItems.map((item) => (
              <View key={item.id} style={styles.feedCard}>
                <View style={styles.feedHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <PixelPigAvatar mood="happy" size={28} />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={styles.feedUserName}>{item.userName}</Text>
                      <Text style={styles.feedTime}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.feedAmountBadge}>
                    <Text style={styles.feedAmount}>
                      -{formatVND(item.amount)}
                    </Text>
                  </View>
                </View>

                {item.photoUri ? (
                  <View style={styles.feedPhotoWrap}>
                    <Image source={{ uri: item.photoUri }} style={styles.feedPhoto} resizeMode="cover" />
                  </View>
                ) : null}

                {item.description ? (
                  <Text style={styles.feedDesc}>{item.description}</Text>
                ) : null}

                {/* Dải Reaction Thả Biểu Cảm */}
                <View style={styles.reactionRow}>
                  {['❤️', '🎉', '👏'].map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={styles.reactionBtn}
                      onPress={() => reactToFeedItem(item.id, emoji)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.reactionEmoji}>{emoji}</Text>
                      {item.reactions[emoji] ? (
                        <Text style={styles.reactionCount}>{item.reactions[emoji]}</Text>
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
          <Text style={styles.sectionTitle}>Nhắn Tin Với Hội Bạn</Text>
          <View style={styles.chatBox}>
            {messages.slice(-5).map((m) => (
              <View key={m.id} style={styles.msgLine}>
                <Text style={styles.msgSender}>{m.senderName}:</Text>
                <Text style={styles.msgText}> {m.text}</Text>
              </View>
            ))}

            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Nhắn tin với hội bạn..."
                placeholderTextColor="#A89A8A"
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={handleSendChat}
              />
              <TouchableOpacity onPress={handleSendChat} style={styles.sendBtn} activeOpacity={0.7}>
                <Send size={16} color="#2B2118" strokeWidth={2.6} />
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
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 20,
    color: '#2B2118',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 13.5,
    color: '#6E5D4F',
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
    borderRadius: 20,
    backgroundColor: '#F4B93B',
    borderWidth: 3,
    borderColor: '#2B2118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  primaryActionBtnText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 14.5,
    color: '#2B2118',
  },
  secondaryActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 20,
    backgroundColor: '#FFFBF1',
    borderWidth: 3,
    borderColor: '#2B2118',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  secondaryActionBtnText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 14.5,
    color: '#2B2118',
  },
  securityCard: {
    width: '100%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  secRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  secText: {
    flex: 1,
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#6E5D4F',
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
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    padding: 20,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  modalTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: '#2B2118',
    marginBottom: 12,
  },
  modalInput: {
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#FFF5F7',
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: 'Nunito',
    fontWeight: '700',
    color: '#2B2118',
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
    fontFamily: 'Nunito',
    fontSize: 14,
    fontWeight: '700',
    color: '#6E5D4F',
  },
  modalConfirmBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#F4B93B',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  modalConfirmText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 14,
    color: '#2B2118',
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
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  squadNameText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 18,
    color: '#2B2118',
    marginBottom: 4,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeLabel: {
    fontFamily: 'Nunito',
    fontSize: 12,
    fontWeight: '700',
    color: '#6E5D4F',
    marginRight: 4,
  },
  codeBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE58A',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  codeBadge: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 12,
    letterSpacing: 0.5,
    color: '#2B2118',
  },
  leaveBtn: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#FFF5F7',
  },

  /* MEMBERS */
  membersSection: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 15,
    color: '#2B2118',
  },
  membersScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  memberCard: {
    width: 105,
    padding: 10,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    alignItems: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  memberName: {
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '800',
    color: '#2B2118',
    marginTop: 4,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#2B2118',
    marginBottom: 6,
  },
  statusText: {
    fontFamily: 'Nunito',
    fontSize: 10,
    fontWeight: '800',
  },
  nudgeBtn: {
    width: '100%',
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2B2118',
    alignItems: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  nudgeBtnText: {
    fontFamily: 'Nunito',
    fontSize: 11,
    fontWeight: '800',
  },

  /* FEED */
  feedSection: {
    gap: 10,
  },
  emptyFeedBox: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
  },
  emptyFeedText: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 12.5,
    lineHeight: 18,
    textAlign: 'center',
    color: '#6E5D4F',
  },
  feedCard: {
    padding: 14,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    gap: 8,
    marginBottom: 8,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedUserName: {
    fontFamily: 'Nunito',
    fontSize: 14,
    fontWeight: '800',
    color: '#2B2118',
  },
  feedTime: {
    fontFamily: 'Nunito',
    fontSize: 11,
    fontWeight: '600',
    color: '#8C7E72',
  },
  feedAmountBadge: {
    backgroundColor: '#2B2118',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  feedAmount: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 14,
    color: '#FFE58A',
  },
  feedPhotoWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#F6EEDC',
    marginTop: 4,
    marginBottom: 4,
  },
  feedPhoto: {
    width: '100%',
    height: '100%',
  },
  feedDesc: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 13,
    color: '#4B3F35',
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
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#FFF5F7',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  reactionEmoji: {
    fontSize: 13,
  },
  reactionCount: {
    fontFamily: 'Nunito',
    fontSize: 11,
    fontWeight: '800',
    color: '#2B2118',
  },

  /* CHAT */
  chatSection: {
    gap: 10,
  },
  chatBox: {
    padding: 12,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#2B2118',
    backgroundColor: '#FFFBF1',
    gap: 8,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  msgLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  msgSender: {
    fontFamily: 'Nunito',
    fontSize: 12.5,
    fontWeight: '800',
    color: '#2B2118',
  },
  msgText: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 12.5,
    color: '#4B3F35',
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
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#FFF5F7',
    fontSize: 13,
    fontFamily: 'Nunito',
    fontWeight: '700',
    color: '#2B2118',
  },
  sendBtn: {
    padding: 8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#F4B93B',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  hubBackRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  hubBackButtonText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 12,
    color: '#2B2118',
  },
});
