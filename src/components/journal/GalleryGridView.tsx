import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Banknote, Coffee, Leaf } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Transaction } from '../../types/database';
import { formatVND, formatCompactVND } from '../../utils/currency';

interface GalleryGridViewProps {
  transactions: Transaction[];
  onDeleteTransaction?: (id: string) => void;
}

const { width } = Dimensions.get('window');
const GRID_GAP = 4;
const PADDING = 12;
const COLUMN_WIDTH = (width - PADDING * 2 - GRID_GAP * 2) / 3;

export const GalleryGridView: React.FC<GalleryGridViewProps> = ({
  transactions,
  onDeleteTransaction,
}) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const handleItemPress = (tx: Transaction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTx(tx);
  };

  const handleCloseModal = () => {
    setSelectedTx(null);
  };

  const formatDateTime = (isoString: string) => {
    const d = new Date(isoString);
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${hours}:${mins} • ${day}/${month}/${d.getFullYear()}`;
  };

  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Leaf size={32} strokeWidth={1.3} color={Colors.accentAutumn} style={{ marginBottom: 8 }} />
        <Text style={styles.emptyTitle}>Chưa có ảnh chi tiêu nào</Text>
        <Text style={styles.emptySubtitle}>
          Hãy chụp lại món đồ hoặc bữa ăn đầu tiên qua Viewfinder Camera!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.gridWrap}>
        {transactions.map((tx) => {
          const isIncome = tx.type === 'INCOME';

          return (
            <TouchableOpacity
              key={tx.id}
              activeOpacity={0.85}
              onPress={() => handleItemPress(tx)}
              style={styles.gridItem}
            >
              {tx.photo_url ? (
                <Image
                  source={{ uri: tx.photo_url }}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderBox}>
                  {isIncome ? (
                    <Banknote size={20} strokeWidth={1.3} color={Colors.comMint} />
                  ) : (
                    <Coffee size={20} strokeWidth={1.3} color={Colors.accentAutumn} />
                  )}
                  <Text style={styles.placeholderCategory} numberOfLines={1}>
                    {tx.category}
                  </Text>
                </View>
              )}

              {/* Floating Price Tag Overlay */}
              <View
                style={[
                  styles.priceTagPill,
                  isIncome ? styles.incomePriceTag : styles.expensePriceTag,
                ]}
              >
                <Text
                  style={[
                    styles.priceTagText,
                    isIncome && styles.incomePriceText,
                  ]}
                >
                  {isIncome ? '+' : ''}
                  {formatCompactVND(tx.amount)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Polaroid Preview Modal */}
      <Modal
        visible={Boolean(selectedTx)}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={handleCloseModal}
          />

          {selectedTx && (
            <View style={styles.polaroidCard}>
              {/* Photo Area */}
              <View style={styles.polaroidPhotoFrame}>
                {selectedTx.photo_url ? (
                  <Image
                    source={{ uri: selectedTx.photo_url }}
                    style={styles.polaroidPhoto}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.polaroidPlaceholder}>
                    <Leaf
                      size={28}
                      strokeWidth={1.3}
                      color={selectedTx.type === 'INCOME' ? Colors.comMint : Colors.warningCoral}
                      style={{ marginBottom: 6 }}
                    />
                    <Text style={styles.polaroidPlaceholderText}>
                      Khoảnh khắc mùa thu
                    </Text>
                  </View>
                )}
              </View>

              {/* Caption & Metadata */}
              <View style={styles.polaroidDetails}>
                <View style={styles.polaroidRow}>
                  <Text style={styles.polaroidTitle} numberOfLines={2}>
                    {selectedTx.description || selectedTx.category}
                  </Text>
                  <Text
                    style={[
                      styles.polaroidAmount,
                      {
                        color:
                          selectedTx.type === 'INCOME'
                            ? Colors.comMint
                            : Colors.warningCoral,
                      },
                    ]}
                  >
                    {selectedTx.type === 'INCOME' ? '+' : '-'}
                    {formatVND(selectedTx.amount)}
                  </Text>
                </View>

                <View style={styles.polaroidMetaRow}>
                  <Text style={styles.polaroidTime}>
                    {formatDateTime(selectedTx.occurred_at)}
                  </Text>
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCloseModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeButtonText}>Đóng lại</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: PADDING,
    paddingBottom: 40,
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  gridItem: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#EBE2D4',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0E8DC',
    padding: 6,
  },
  placeholderIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  placeholderCategory: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  priceTagPill: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 3,
  },
  expensePriceTag: {
    backgroundColor: 'rgba(26, 29, 26, 0.78)',
  },
  incomePriceTag: {
    backgroundColor: 'rgba(78, 128, 83, 0.88)',
  },
  priceTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FAF6F0',
    fontVariant: ['tabular-nums'],
  },
  incomePriceText: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalDismissArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  polaroidCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FAF6F0',
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  polaroidPhotoFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#2A2C2A',
    marginBottom: 14,
  },
  polaroidPhoto: {
    width: '100%',
    height: '100%',
  },
  polaroidPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDE3D2',
  },
  polaroidPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  polaroidPlaceholderText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  polaroidDetails: {
    paddingHorizontal: 4,
  },
  polaroidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  polaroidTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    flex: 1,
    marginRight: 12,
  },
  polaroidAmount: {
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  polaroidMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  polaroidTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  closeButton: {
    backgroundColor: Colors.accentAutumn,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
