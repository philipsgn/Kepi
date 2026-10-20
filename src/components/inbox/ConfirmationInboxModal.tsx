import React, { useState, useEffect, useMemo } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CheckCircle2,
  ImagePlus,
  Inbox,
  Receipt,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeContext';
import { formatVND } from '../../utils/currency';
import { ConfirmationInboxCard } from './ConfirmationInboxCard';
import { UploadReceiptModal } from './UploadReceiptModal';
import {
  useConfirmationInbox,
  ConfirmationInboxItem,
} from '../../hooks/useConfirmationInbox';
import { trackEvent } from '../../services/analytics';

interface ConfirmationInboxModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ConfirmationInboxModal: React.FC<ConfirmationInboxModalProps> = ({
  visible,
  onClose,
}) => {
  const { isDark } = useTheme();

  const {
    inboxItems,
    confirmItem,
    dismissItem,
    lastAction,
    undoLastAction,
    saveReceiptTransaction,
  } = useConfirmationInbox();

  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'OVERDUE'>('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState(5);

  useEffect(() => {
    if (visible) {
      trackEvent('inbox_opened', { total_items: inboxItems.length });
    }
  }, [visible, inboxItems.length]);

  const pendingCount = useMemo(() => inboxItems.filter((i) => !i.isOverdue).length, [inboxItems]);
  const overdueCount = useMemo(() => inboxItems.filter((i) => i.isOverdue).length, [inboxItems]);

  const displayedItems = useMemo(() => {
    if (activeTab === 'PENDING') return inboxItems.filter((i) => !i.isOverdue);
    if (activeTab === 'OVERDUE') return inboxItems.filter((i) => i.isOverdue);
    return inboxItems;
  }, [inboxItems, activeTab]);

  // Undo countdown timer
  useEffect(() => {
    if (!lastAction) {
      setUndoSecondsLeft(5);
      return;
    }

    setUndoSecondsLeft(5);
    const interval = setInterval(() => {
      setUndoSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lastAction]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor: isDark ? '#0E1620' : '#FAF6EC',
          },
        ]}
      >
        {/* TOP HEADER */}
        <View
          style={[
            styles.header,
            {
              borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          ]}
        >
          <View style={styles.headerLeft}>
            <View style={styles.iconBadge}>
              <Inbox size={20} color={Colors.primaryYellow} strokeWidth={2.6} />
            </View>
            <View>
              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: isDark ? '#FAF6EC' : '#141D26' }]}>
                  Hộp Xác Nhận
                </Text>
                {inboxItems.length > 0 && (
                  <View style={styles.counterBadge}>
                    <Text style={styles.counterBadgeText}>{inboxItems.length}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.subTitle, { color: isDark ? '#7E91A4' : '#8A99A8' }]}>
                Xác nhận 1-chạm hoặc bỏ qua
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            {/* NÚT TẢI ẢNH BIÊN LAI */}
            <TouchableOpacity
              style={[
                styles.uploadReceiptBtn,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(229, 152, 68, 0.35)' : 'rgba(229, 152, 68, 0.40)',
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setShowUploadModal(true);
              }}
              activeOpacity={0.8}
            >
              <Receipt size={14} color={Colors.primaryYellow} strokeWidth={2.4} />
              <Text style={[styles.uploadReceiptText, { color: isDark ? '#FAF6EC' : '#141D26' }]}>
                Tải biên lai
              </Text>
            </TouchableOpacity>

            {/* NÚT ĐÓNG */}
            <TouchableOpacity
              style={[
                styles.closeButton,
                {
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                },
              ]}
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color={isDark ? '#8C9DAC' : '#65778B'} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* TAB FILTER (TẤT CẢ / MỚI CHỜ DUYỆT / CHƯA XÁC NHẬN) */}
        {inboxItems.length > 0 && (
          <View
            style={[
              styles.tabSelectorRow,
              {
                borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                backgroundColor: isDark ? '#101925' : '#F6F0E4',
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => setActiveTab('ALL')}
              style={[
                styles.tabItem,
                activeTab === 'ALL' && [
                  styles.tabItemActive,
                  { borderBottomColor: Colors.primaryYellow },
                ],
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === 'ALL'
                        ? Colors.primaryYellow
                        : isDark
                        ? '#8C9DAC'
                        : '#65778B',
                    fontWeight: activeTab === 'ALL' ? '700' : '500',
                  },
                ]}
              >
                Tất cả ({inboxItems.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('PENDING')}
              style={[
                styles.tabItem,
                activeTab === 'PENDING' && [
                  styles.tabItemActive,
                  { borderBottomColor: Colors.primaryYellow },
                ],
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === 'PENDING'
                        ? Colors.primaryYellow
                        : isDark
                        ? '#8C9DAC'
                        : '#65778B',
                    fontWeight: activeTab === 'PENDING' ? '700' : '500',
                  },
                ]}
              >
                Mới ({pendingCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('OVERDUE')}
              style={[
                styles.tabItem,
                activeTab === 'OVERDUE' && [
                  styles.tabItemActive,
                  { borderBottomColor: '#C86D51' },
                ],
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === 'OVERDUE'
                        ? '#C86D51'
                        : isDark
                        ? '#8C9DAC'
                        : '#65778B',
                    fontWeight: activeTab === 'OVERDUE' ? '700' : '500',
                  },
                ]}
              >
                Chưa xác nhận ({overdueCount})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* BODY LIST / EMPTY STATE */}
        <View style={styles.content}>
          {displayedItems.length > 0 ? (
            <FlatList
              data={displayedItems}
              keyExtractor={(item) => `${item.itemType}-${item.id}`}
              renderItem={({ item }) => (
                <ConfirmationInboxCard
                  item={item}
                  onConfirm={confirmItem}
                  onDismiss={dismissItem}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Sparkles size={36} color={Colors.greenSafe} strokeWidth={2.6} />
              </View>
              <Text style={[styles.emptyTitle, { color: isDark ? '#FAF6EC' : '#141D26' }]}>
                Hộp xác nhận trống trơn
              </Text>
              <Text style={[styles.emptyDesc, { color: isDark ? '#7E91A4' : '#8A99A8' }]}>
                Mọi khoản chi tiêu đều đã được bạn kiểm soát chỉn chu. Thảnh thơi tận hưởng một ngày trọn vẹn nhé.
              </Text>

              <TouchableOpacity
                style={[
                  styles.emptyUploadBtn,
                  {
                    backgroundColor: isDark ? '#141D2A' : '#FFFFFF',
                    borderColor: Colors.primaryYellow,
                  },
                ]}
                onPress={() => setShowUploadModal(true)}
                activeOpacity={0.85}
              >
                <ImagePlus size={16} color={Colors.primaryYellow} strokeWidth={2.2} />
                <Text style={styles.emptyUploadBtnText}>Tải ảnh biên lai chuyển khoản</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 5-SECOND UNDO TOAST SNACKBAR */}
        {lastAction && (
          <View
            style={[
              styles.undoSnackbar,
              {
                backgroundColor: isDark ? '#141D2A' : '#1E293B',
                shadowColor: '#000000',
              },
            ]}
          >
            <View style={styles.undoTextCol}>
              <Text style={styles.undoTitleText}>
                {lastAction.type === 'CONFIRM' ? 'Đã lưu vào sổ' : 'Đã bỏ qua'}
              </Text>
              <Text style={styles.undoSubText} numberOfLines={1}>
                {formatVND(lastAction.item.amount)} • {lastAction.item.title}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.undoButton}
              onPress={undoLastAction}
              activeOpacity={0.8}
            >
              <RotateCcw size={14} color={Colors.primaryYellow} strokeWidth={2.4} />
              <Text style={styles.undoButtonText}>
                Hoàn tác ({undoSecondsLeft}s)
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* UPLOAD RECEIPT MODAL */}
        <UploadReceiptModal
          visible={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSave={async (params) => {
            await saveReceiptTransaction(params);
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  tabSelectorRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    // borderBottomColor set dynamically
  },
  tabText: {
    fontSize: 13,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    width: 26,
    height: 26,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  counterBadge: {
    backgroundColor: Colors.accentOrange,
    paddingVertical: 1,
    paddingHorizontal: 7,
    borderRadius: 10,
  },
  counterBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  subTitle: {
    fontSize: 12,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  uploadReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  uploadReceiptText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyUploadBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryYellow,
  },
  undoSnackbar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  undoTextCol: {
    flex: 1,
    marginRight: 12,
  },
  undoTitleText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  undoSubText: {
    color: '#CBD5E1',
    fontSize: 12,
    marginTop: 1,
  },
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  undoButtonText: {
    color: Colors.primaryYellow,
    fontSize: 12,
    fontWeight: '700',
  },
});
