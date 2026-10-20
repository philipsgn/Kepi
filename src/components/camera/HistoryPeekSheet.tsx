import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronDown, X, Sparkles, Clock, Banknote, Coffee, Leaf } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Transaction } from '../../types/database';
import { formatVND, formatCompactVND } from '../../utils/currency';
import { formatRelativeTime } from '../../utils/date';

interface HistoryPeekSheetProps {
  visible: boolean;
  transactions: Transaction[];
  onClose: () => void;
  onSelectTransaction?: (tx: Transaction) => void;
}

const { width, height } = Dimensions.get('window');

export const HistoryPeekSheet: React.FC<HistoryPeekSheetProps> = ({
  visible,
  transactions,
  onClose,
  onSelectTransaction,
}) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const handleCardPress = (tx: Transaction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTx(tx);
    if (onSelectTransaction) {
      onSelectTransaction(tx);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.sheetContainer}>
        {/* Drag Handle & Top Header */}
        <View style={styles.header}>
          <View style={styles.dragBar} />

          <View style={styles.headerTitleRow}>
            <View>
              <Text style={styles.headerTitle}>Lịch Sử Ảnh</Text>
              <Text style={styles.headerSubtitle}>
                {transactions.length} khoảnh khắc chi tiêu Locket
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <ChevronDown size={20} color={Colors.textCharcoal} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danh sách ảnh cuộn dọc theo dòng thời gian */}
        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Leaf size={32} strokeWidth={1.3} color={Colors.accentGold} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>Chưa có khoảnh khắc nào</Text>
            <Text style={styles.emptySubtitle}>
              Bấm nút chụp hoặc giữ mic để lưu lại món đồ đầu tiên của bạn nhé!
            </Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isIncome = item.type === 'INCOME';

              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleCardPress(item)}
                  style={styles.feedCard}
                >
                  {/* Khung ảnh chính 1:1 */}
                  <View style={styles.photoWrapper}>
                    {item.photo_url ? (
                      <Image
                        source={{ uri: item.photo_url }}
                        style={styles.feedPhoto}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.feedPhotoFallback}>
                        {isIncome ? (
                          <Banknote size={32} strokeWidth={1.3} color={Colors.incomeMint} />
                        ) : (
                          <Coffee size={32} strokeWidth={1.3} color={Colors.accentGold} />
                        )}
                        <Text style={styles.fallbackText}>{item.category}</Text>
                      </View>
                    )}

                    {/* Gradient overlay nhẹ dưới chân ảnh */}
                    <View style={styles.photoGradientBottom} />

                    {/* Tag Giá Nổi Phong Cách Locket */}
                    <View
                      style={[
                        styles.floatingPricePill,
                        isIncome ? styles.incomePricePill : styles.expensePricePill,
                      ]}
                    >
                      <Text
                        style={[
                          styles.floatingPriceText,
                          isIncome && styles.incomePriceText,
                        ]}
                      >
                        {isIncome ? '+' : ''}
                        {formatVND(item.amount)}
                      </Text>
                    </View>

                    {/* Huy hiệu thời gian chụp đè góc trên */}
                    <View style={styles.timeTagOverlay}>
                      <Clock size={11} color="rgba(255, 255, 255, 0.85)" />
                      <Text style={styles.timeTagText}>
                        {formatRelativeTime(item.occurred_at)}
                      </Text>
                    </View>
                  </View>

                  {/* Thông tin chi tiết bên dưới ảnh */}
                  <View style={styles.cardFooter}>
                    <View style={styles.footerLeft}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.description || item.category}
                      </Text>
                      <Text style={styles.itemMeta}>
                        {item.category}
                      </Text>
                    </View>

                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {isIncome ? 'Thu nhập' : 'Chi tiêu'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    backgroundColor: '#FAF6F0', // Sữa Ngà Hà Nội
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 218, 200, 0.5)',
    backgroundColor: '#FAF6F0',
  },
  dragBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D6C8B4',
    alignSelf: 'center',
    marginBottom: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textCharcoal,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFE5D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  feedCard: {
    backgroundColor: '#F5EFE4',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAE0CF',
    shadowColor: '#2C1810',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  photoWrapper: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: '#1A1D1A',
  },
  feedPhoto: {
    width: '100%',
    height: '100%',
  },
  feedPhotoFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EADFCF',
  },
  fallbackIcon: {
    fontSize: 48,
    marginBottom: 6,
  },
  fallbackText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  photoGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  floatingPricePill: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  expensePricePill: {
    backgroundColor: 'rgba(26, 29, 26, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  incomePricePill: {
    backgroundColor: 'rgba(56, 120, 62, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  floatingPriceText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FAF6F0',
    fontVariant: ['tabular-nums'],
  },
  incomePriceText: {
    color: '#FFFFFF',
  },
  timeTagOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#FAF5ED',
  },
  footerLeft: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textCharcoal,
  },
  itemMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: '#EAE1D2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textCharcoal,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
