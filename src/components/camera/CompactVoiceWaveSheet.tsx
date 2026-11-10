import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  TextInput,
  Dimensions,
} from 'react-native';
import { Mic, MicOff, X, Sparkles, Check, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { parseVoiceExpense, ParsedVoiceExpense } from '../../utils/ai/voiceExpenseParser';
import { formatVND } from '../../utils/currency';

interface CompactVoiceWaveSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirmExpense: (result: ParsedVoiceExpense) => void;
}

const { width } = Dimensions.get('window');

const SAMPLE_VOICE_PHRASES = [
  'Vừa ăn bún bò 50 cành',
  'Uống Highlands 45k',
  'Đổ xăng 70 nghìn',
  'Đi Grab hết 32k',
  'Mua áo thun 250k',
];

export const CompactVoiceWaveSheet: React.FC<CompactVoiceWaveSheetProps> = ({
  visible,
  onClose,
  onConfirmExpense,
}) => {
  const { tokens } = useTheme();
  const [inputText, setInputText] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedVoiceExpense | null>(null);
  const [isListening, setIsListening] = useState(true);

  // Animation cho sóng âm Pop-Anime (3 cột sóng)
  const waveAnim1 = useRef(new Animated.Value(12)).current;
  const waveAnim2 = useRef(new Animated.Value(24)).current;
  const waveAnim3 = useRef(new Animated.Value(16)).current;
  const waveAnim4 = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    if (!visible) return;
    setIsListening(true);
    setInputText('');
    setParsedResult(null);

    // Chu trình sóng âm nhấp nhô vui nhộn
    const createWaveLoop = (anim: Animated.Value, minVal: number, maxVal: number, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: maxVal,
            duration,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: minVal,
            duration,
            useNativeDriver: false,
          }),
        ])
      );
    };

    const l1 = createWaveLoop(waveAnim1, 8, 32, 350);
    const l2 = createWaveLoop(waveAnim2, 12, 44, 420);
    const l3 = createWaveLoop(waveAnim3, 10, 36, 380);
    const l4 = createWaveLoop(waveAnim4, 14, 40, 450);

    l1.start();
    l2.start();
    l3.start();
    l4.start();

    return () => {
      l1.stop();
      l2.stop();
      l3.stop();
      l4.stop();
    };
  }, [visible]);

  const handleSelectPhrase = (phrase: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputText(phrase);
    const parsed = parseVoiceExpense(phrase);
    setParsedResult(parsed);
    setIsListening(false);
  };

  const handleChangeText = (text: string) => {
    setInputText(text);
    if (text.trim().length > 0) {
      const parsed = parseVoiceExpense(text);
      setParsedResult(parsed);
      setIsListening(false);
    } else {
      setParsedResult(null);
      setIsListening(true);
    }
  };

  const handleSave = () => {
    if (!parsedResult || parsedResult.amount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirmExpense(parsedResult);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <View style={[styles.micIconBox, { backgroundColor: tokens.primarySoft }]}>
                <Mic size={18} color={tokens.primary} strokeWidth={2.4} />
              </View>
              <Text style={[styles.sheetTitle, { color: tokens.text }]}>NHẬP LIỆU GIỌNG NÓI</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <X size={20} color={tokens.textMuted} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          {/* Sóng âm Pop-Anime Soundwave */}
          <View style={[styles.waveContainer, { backgroundColor: tokens.surfaceAlt }]}>
            <View style={styles.waveGroup}>
              <Animated.View style={[styles.waveBar, { height: waveAnim1, backgroundColor: tokens.primary }]} />
              <Animated.View style={[styles.waveBar, { height: waveAnim2, backgroundColor: tokens.primary }]} />
              <Animated.View style={[styles.waveBar, { height: waveAnim3, backgroundColor: tokens.primary }]} />
              <Animated.View style={[styles.waveBar, { height: waveAnim4, backgroundColor: tokens.primary }]} />
            </View>
            <Text style={[styles.waveHint, { color: tokens.textMuted }]}>
              {isListening ? 'Đang lắng nghe... Nói tự nhiên nhé!' : 'Đã nhận diện thành công!'}
            </Text>
          </View>

          {/* Input Text Box */}
          <View style={[styles.inputBox, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
            <TextInput
              style={[styles.textInput, { color: tokens.text }]}
              placeholder="Hoặc gõ nhanh: Ăn phở 45k, Grab 32k..."
              placeholderTextColor={tokens.textMuted}
              value={inputText}
              onChangeText={handleChangeText}
            />
            {inputText.length > 0 && (
              <TouchableOpacity onPress={() => handleChangeText('')}>
                <X size={16} color={tokens.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Result Card Preview */}
          {parsedResult && parsedResult.amount > 0 ? (
            <View style={[styles.resultCard, { backgroundColor: tokens.primarySoft, borderColor: tokens.primary }]}>
              <View style={styles.resultRow}>
                <Text style={styles.resultEmoji}>{parsedResult.emoji}</Text>
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultCategory, { color: tokens.primary }]}>
                    {parsedResult.category}
                  </Text>
                  <Text style={[styles.resultDesc, { color: tokens.text }]}>
                    {parsedResult.description}
                  </Text>
                </View>
                <Text style={[styles.resultAmount, { color: tokens.text }]}>
                  {formatVND(parsedResult.amount)}
                </Text>
              </View>
            </View>
          ) : (
            /* Quick Phrase Chips */
            <View style={styles.quickChipsWrapper}>
              <Text style={[styles.chipsLabel, { color: tokens.textMuted }]}>GỢI Ý MẪU TIẾNG VIỆT:</Text>
              <View style={styles.chipsRow}>
                {SAMPLE_VOICE_PHRASES.map((phrase, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.chipPill, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
                    onPress={() => handleSelectPhrase(phrase)}
                  >
                    <Text style={[styles.chipText, { color: tokens.text }]}>{phrase}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Save Action Button */}
          <TouchableOpacity
            style={[
              styles.saveBtn,
              {
                backgroundColor: parsedResult && parsedResult.amount > 0 ? tokens.primary : tokens.surfaceAlt,
              },
            ]}
            disabled={!parsedResult || parsedResult.amount <= 0}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Check size={20} color={parsedResult && parsedResult.amount > 0 ? '#FFFFFF' : tokens.textMuted} strokeWidth={2.6} />
            <Text
              style={[
                styles.saveBtnText,
                { color: parsedResult && parsedResult.amount > 0 ? '#FFFFFF' : tokens.textMuted },
              ]}
            >
              LƯU SỔ NGAY ( $\le 2$s )
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1.5,
    paddingTop: 18,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  micIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  waveContainer: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  waveGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    gap: 8,
  },
  waveBar: {
    width: 6,
    borderRadius: 3,
  },
  waveHint: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  resultCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  resultInfo: {
    flex: 1,
  },
  resultCategory: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  resultDesc: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  resultAmount: {
    fontSize: 17,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  quickChipsWrapper: {
    marginBottom: 14,
  },
  chipsLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chipPill: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 16,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
