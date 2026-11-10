import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { X, Dices, Award, Sparkles, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { useGamificationStore } from '../../store/gamificationStore';
import {
  MONOPOLY_BOARD_TILES,
  rollMonopolyDice,
  calculateNewPosition,
  resolveTileDecision,
  BoardTile,
} from '../../utils/game/monopolyBoardEngine';

interface FinancialMonopolyModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');

export const FinancialMonopolyModal: React.FC<FinancialMonopolyModalProps> = ({
  visible,
  onClose,
}) => {
  const { tokens } = useTheme();
  const {
    fepPoints,
    diceRollsLeft,
    monopolyPosition,
    addFep,
    useDiceRoll,
    setMonopolyPosition,
  } = useGamificationStore();

  const [lastRolledNumber, setLastRolledNumber] = useState<number | null>(null);
  const [activeTileChallenge, setActiveTileChallenge] = useState<BoardTile | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const handleRollDice = () => {
    if (diceRollsLeft <= 0 || isRolling) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setFeedbackMessage('Hôm nay bạn đã hết lượt đổ! Ghi chép có ảnh để nhận thêm lượt nhé.');
      return;
    }

    setIsRolling(true);
    setFeedbackMessage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const roll = rollMonopolyDice();
    setLastRolledNumber(roll);
    useDiceRoll();

    const { newPos, passedGo, tile } = calculateNewPosition(monopolyPosition, roll);
    setMonopolyPosition(newPos);

    if (passedGo) {
      addFep(50);
    }

    setTimeout(() => {
      setIsRolling(false);
      if (tile.hasChoice) {
        setActiveTileChallenge(tile);
      } else {
        const res = resolveTileDecision(tile, 'ACCEPT');
        if (res.earnedFep > 0) {
          addFep(res.earnedFep);
        }
        setFeedbackMessage(res.message);
      }
    }, 600);
  };

  const handleResolveChoice = (choice: 'RESIST' | 'SPEND') => {
    if (!activeTileChallenge) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const res = resolveTileDecision(activeTileChallenge, choice);
    if (res.earnedFep !== 0) {
      addFep(res.earnedFep);
    }
    setFeedbackMessage(res.message);
    setActiveTileChallenge(null);
  };

  const currentTile = MONOPOLY_BOARD_TILES[monopolyPosition] || MONOPOLY_BOARD_TILES[0];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: tokens.surface }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              <Text style={[styles.gameTitle, { color: tokens.text }]}>CỜ TỶ PHÚ TÀI CHÍNH</Text>
              <Text style={[styles.gameSubtitle, { color: tokens.textMuted }]}>
                Né bẫy FOMO • Rèn luyện kỷ luật
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeBtn}
            >
              <X size={22} color={tokens.textMuted} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          {/* Stats Bar */}
          <View style={[styles.statsBar, { backgroundColor: tokens.surfaceAlt }]}>
            <View style={styles.statItem}>
              <Sparkles size={16} color={tokens.primary} strokeWidth={2.4} />
              <Text style={[styles.statText, { color: tokens.text }]}>
                Ô {monopolyPosition + 1}/16
              </Text>
            </View>
            <View style={styles.statItem}>
              <Dices size={16} color={tokens.primary} strokeWidth={2.4} />
              <Text style={[styles.statText, { color: tokens.text }]}>
                Còn {diceRollsLeft} lượt
              </Text>
            </View>
          </View>

          {/* Feedback or Challenge banner */}
          {feedbackMessage ? (
            <View style={[styles.messageBanner, { backgroundColor: tokens.primarySoft }]}>
              <Text style={[styles.messageText, { color: tokens.text }]}>{feedbackMessage}</Text>
            </View>
          ) : null}

          {/* Challenge Box if waiting for decision */}
          {activeTileChallenge ? (
            <View style={[styles.challengeBox, { borderColor: tokens.border }]}>
              <View style={styles.challengeHeader}>
                <AlertCircle size={20} color={tokens.danger} strokeWidth={2.4} />
                <Text style={[styles.challengeTitle, { color: tokens.danger }]}>
                  {activeTileChallenge.title}
                </Text>
              </View>
              <Text style={[styles.challengeDesc, { color: tokens.text }]}>
                {activeTileChallenge.description}
              </Text>
              <View style={styles.choiceRow}>
                <TouchableOpacity
                  style={[styles.choiceBtn, { backgroundColor: tokens.success }]}
                  onPress={() => handleResolveChoice('RESIST')}
                >
                  <Text style={styles.choiceBtnText}>Cứu ví (+{activeTileChallenge.choiceResistFep} FEP)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.choiceBtn, { backgroundColor: tokens.surfaceAlt }]}
                  onPress={() => handleResolveChoice('SPEND')}
                >
                  <Text style={[styles.choiceBtnText, { color: tokens.text }]}>
                    Mua ngay ({activeTileChallenge.choiceSpendFep} FEP)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Board Grid (Horizontal Scroll or Grid View) */}
          <Text style={[styles.sectionLabel, { color: tokens.textMuted }]}>
            Ô ĐANG ĐỨNG: {currentTile.emoji} {currentTile.title} (Ô {monopolyPosition}/15)
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.boardScroll}
          >
            {MONOPOLY_BOARD_TILES.map((tile) => {
              const isHere = tile.index === monopolyPosition;
              return (
                <View
                  key={tile.index}
                  style={[
                    styles.tileCard,
                    {
                      backgroundColor: isHere ? tokens.primarySoft : tokens.surfaceAlt,
                      borderColor: isHere ? tokens.primary : tokens.border,
                      borderWidth: isHere ? 2.5 : 1,
                    },
                  ]}
                >
                  <Text style={styles.tileEmoji}>{tile.emoji}</Text>
                  <Text style={[styles.tileIndex, { color: tokens.textMuted }]}>#{tile.index}</Text>
                  <Text
                    style={[styles.tileName, { color: tokens.text }]}
                    numberOfLines={2}
                  >
                    {tile.title}
                  </Text>
                  {isHere ? (
                    <View style={[styles.pigBadge, { backgroundColor: tokens.primary }]}>
                      <Text style={styles.pigBadgeText}>🐷 Bạn ở đây</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>

          {/* Action Button: Roll Dice */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={[
                styles.rollButton,
                {
                  backgroundColor: diceRollsLeft > 0 ? tokens.primary : tokens.surfaceAlt,
                },
              ]}
              onPress={handleRollDice}
              disabled={diceRollsLeft <= 0 || isRolling || activeTileChallenge !== null}
            >
              <Dices size={24} color={diceRollsLeft > 0 ? '#FFFFFF' : tokens.textMuted} strokeWidth={2.4} />
              <Text
                style={[
                  styles.rollButtonText,
                  { color: diceRollsLeft > 0 ? '#FFFFFF' : tokens.textMuted },
                ]}
              >
                {isRolling
                  ? 'Đang lắc xúc xắc...'
                  : lastRolledNumber
                  ? `Đổ được ${lastRolledNumber} nút! Lắc tiếp`
                  : 'LẮC XÚC XẮC NGAY'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    paddingBottom: 36,
    paddingHorizontal: 20,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleGroup: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  gameSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 14,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '700',
  },
  messageBanner: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  challengeBox: {
    borderWidth: 2,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  challengeTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  challengeDesc: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  choiceBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  choiceBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  boardScroll: {
    paddingVertical: 6,
    gap: 10,
    paddingRight: 10,
  },
  tileCard: {
    width: 105,
    height: 125,
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  tileIndex: {
    fontSize: 10,
    fontWeight: '600',
  },
  tileName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  pigBadge: {
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pigBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  footerContainer: {
    marginTop: 18,
  },
  rollButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    gap: 8,
  },
  rollButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
