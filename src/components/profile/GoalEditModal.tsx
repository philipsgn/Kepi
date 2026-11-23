import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar, Check, Target, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Strings } from '../../constants/strings';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

const MIN_AMOUNT = 1_000_000;
const MAX_AMOUNT = 500_000_000;

function formatVNDWithDots(num: number): string {
  if (!num || num <= 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function ratioToAmount(r: number): number {
  if (r <= 0) return MIN_AMOUNT;
  if (r >= 1) return MAX_AMOUNT;
  const raw = MIN_AMOUNT + (MAX_AMOUNT - MIN_AMOUNT) * Math.pow(r, 2.2);
  return Math.round(raw / 500_000) * 500_000;
}

function amountToRatio(amount: number): number {
  if (amount <= MIN_AMOUNT) return 0;
  if (amount >= MAX_AMOUNT) return 1;
  const normalized = (amount - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT);
  return Math.pow(normalized, 1 / 2.2);
}

export interface GoalEditModalProps {
  visible: boolean;
  goalId?: string | null;
  initialGoalName: string;
  initialTargetAmount: number;
  initialDeadline?: string | null;
  initialReason?: string | null;
  monthlySavingsGoal?: number;
  existingUnfinishedAmount?: number;
  onClose: () => void;
  onSave: (goal: {
    id?: string;
    name: string;
    targetAmount: number;
    deadline?: string;
    reason?: string;
  }) => void;
}

export const GoalEditModal: React.FC<GoalEditModalProps> = ({
  visible,
  goalId,
  initialGoalName,
  initialTargetAmount,
  initialDeadline = '',
  initialReason = '',
  monthlySavingsGoal = 0,
  existingUnfinishedAmount = 0,
  onClose,
  onSave,
}) => {
  const { tokens, isDark, mode } = useTheme();
  const isPink = mode === 'pink';
  const isHeocon = true; // Cả Heo Con và Pastel Pink đều chuẩn Neo-Brutalist Pixel Art 100%
  const cardBg = isPink ? '#FFFFFF' : '#FFFBF1';
  const cardBorder = isPink ? '#3B0713' : '#2B2118';
  const inkText = isPink ? '#3B0713' : '#2B2118';
  const inkMuted = isPink ? '#834758' : '#6E5D4F';
  const pageBg = isPink ? '#FFF5F7' : '#F6EEDC';
  const chipBg = isPink ? '#FCE7F3' : '#FFF4CC';
  const accentBtn = isPink ? '#F43F5E' : '#F4B93B';
  const [name, setName] = useState(initialGoalName || '');
  const [amount, setAmount] = useState(initialTargetAmount > 0 ? initialTargetAmount : 10_000_000);
  const [amountStr, setAmountStr] = useState(
    initialTargetAmount > 0 ? formatVNDWithDots(initialTargetAmount) : '10.000.000'
  );

  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);
  const trackPageXRef = useRef(0);
  const lastHapticTimeRef = useRef(0);

  useEffect(() => {
    trackWidthRef.current = trackWidth;
  }, [trackWidth]);

  useEffect(() => {
    if (visible) {
      setName(initialGoalName || '');
      const initialAmt = initialTargetAmount > 0 ? initialTargetAmount : 10_000_000;
      setAmount(initialAmt);
      setAmountStr(formatVNDWithDots(initialAmt));
    }
  }, [visible, initialGoalName, initialTargetAmount]);

  const triggerHaptic = () => {
    const now = Date.now();
    if (now - lastHapticTimeRef.current > 40) {
      lastHapticTimeRef.current = now;
      Haptics.selectionAsync();
    }
  };

  const updateAmountFromRatio = (r: number) => {
    const newAmt = ratioToAmount(r);
    setAmount(newAmt);
    setAmountStr(formatVNDWithDots(newAmt));
    triggerHaptic();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onPanResponderGrant: (evt) => {
          const trackPageX = evt.nativeEvent.pageX - evt.nativeEvent.locationX;
          trackPageXRef.current = trackPageX;
          if (trackWidthRef.current > 0) {
            const ratio = Math.max(0, Math.min(1, evt.nativeEvent.locationX / trackWidthRef.current));
            updateAmountFromRatio(ratio);
          }
        },
        onPanResponderMove: (evt) => {
          if (trackWidthRef.current > 0) {
            const touchX = evt.nativeEvent.pageX - trackPageXRef.current;
            const ratio = Math.max(0, Math.min(1, touchX / trackWidthRef.current));
            updateAmountFromRatio(ratio);
          }
        },
      }),
    []
  );

  const handleAmountTextChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (!digits) {
      setAmount(0);
      setAmountStr('');
      return;
    }
    const parsed = parseInt(digits, 10);
    setAmount(parsed);
    setAmountStr(formatVNDWithDots(parsed));
  };

  // Auto-ETA Engine calculation
  const autoEtaInfo = useMemo(() => {
    if (amount <= 0) return null;
    if (!monthlySavingsGoal || monthlySavingsGoal <= 0) {
      return {
        hasBudget: false,
        text: 'Thiết lập Cân bằng ngân sách để tính ngày về đích.',
        deadlineStr: '',
      };
    }
    const totalToSave = amount + (existingUnfinishedAmount || 0);
    const monthsNeeded = Math.ceil(totalToSave / monthlySavingsGoal);
    const effectiveMonths = Math.max(1, monthsNeeded);

    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth() + effectiveMonths, 1);
    const m = targetDate.getMonth() + 1;
    const y = targetDate.getFullYear();
    const deadlineStr = `Tháng ${m}/${y}`;

    return {
      hasBudget: true,
      text: `Dự kiến đạt được: Tháng ${m}/${y} (~${effectiveMonths} tháng tích lũy cam kết)`,
      deadlineStr,
    };
  }, [amount, monthlySavingsGoal, existingUnfinishedAmount]);

  const handleSave = () => {
    if (!name.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave({
      id: goalId || undefined,
      name: name.trim(),
      targetAmount: amount,
      deadline: autoEtaInfo?.deadlineStr || '',
      reason: '',
    });
    onClose();
  };

  const isEditing = Boolean(goalId || initialGoalName.trim());
  const ratio = amountToRatio(amount);
  const thumbWidth = 24;
  const thumbLeft =
    trackWidth > 0 ? Math.max(0, Math.min(trackWidth - thumbWidth, ratio * (trackWidth - thumbWidth))) : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.modalSheet,
            isHeocon
              ? {
                  backgroundColor: pageBg,
                  borderColor: cardBorder,
                  borderTopWidth: 3,
                  borderLeftWidth: 3,
                  borderRightWidth: 3,
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                }
              : { backgroundColor: tokens.surface, borderColor: tokens.border },
          ]}
        >
          {/* DRAG HANDLE */}
          {isHeocon && (
            <View style={{ alignItems: 'center', paddingTop: 10 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#2B2118' }} />
            </View>
          )}

          {/* HEADER */}
          <View
            style={[
              styles.headerRow,
              {
                borderBottomColor: isHeocon ? '#2B2118' : tokens.border,
                borderBottomWidth: isHeocon ? 2 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={[
                  styles.iconBox,
                  isHeocon && {
                    backgroundColor: '#F4B93B',
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: cardBorder,
                  },
                ]}
              >
                <Target size={18} color={isHeocon ? '#2B2118' : tokens.primary} strokeWidth={2.6} />
              </View>
              <Text
                style={[
                  styles.sheetTitle,
                  { color: inkText },
                  isHeocon && { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800', fontSize: 18 },
                ]}
              >
                {isEditing ? 'Chỉnh Sửa Mục Tiêu' : 'Thêm Mục Tiêu Mới'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.closeBtn,
                isHeocon && {
                  backgroundColor: '#FFF4CC',
                  borderWidth: 2.5,
                  borderColor: cardBorder,
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                },
              ]}
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={18} color={isHeocon ? '#2B2118' : tokens.textMuted} strokeWidth={2.6} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
            {/* TRƯỜNG 1: TÊN MỤC TIÊU */}
            <Text
              style={[
                styles.label,
                { color: inkMuted },
                isHeocon && { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800', fontSize: 13.5 },
              ]}
            >
              {Strings.profile.goalNameLabel}:
            </Text>
            <TextInput
              style={[
                styles.input,
                isHeocon
                  ? {
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      borderWidth: 2.5,
                      borderRadius: 14,
                      color: inkText,
                      fontFamily: 'Nunito',
                      fontWeight: '700',
                      height: 46,
                    }
                  : { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border, color: tokens.text },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="VD: Xe máy mới, MacBook Pro, Chuyến đi Tây Bắc..."
              placeholderTextColor={isPink ? '#834758' : '#8A7A6A'}
            />

            {/* TRƯỜNG 2: SỐ TIỀN CẦN TÍCH LŨY */}
            <Text
              style={[
                styles.label,
                { color: inkMuted },
                isHeocon && { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800', fontSize: 13.5 },
              ]}
            >
              {Strings.profile.goalTargetLabel}:
            </Text>
            <View
              style={[
                styles.amountInputRow,
                isHeocon
                  ? {
                      backgroundColor: cardBg,
                      borderColor: cardBorder,
                      borderWidth: 2.5,
                      borderRadius: 14,
                      height: 48,
                    }
                  : { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
              ]}
            >
              <TextInput
                style={[
                  styles.amountTextInput,
                  { color: inkText },
                  isHeocon && { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800', fontSize: 18 },
                ]}
                keyboardType="numeric"
                value={amountStr}
                onChangeText={handleAmountTextChange}
                placeholder="0"
                placeholderTextColor={isPink ? '#834758' : '#8A7A6A'}
              />
              <Text
                style={[
                  styles.currencySuffix,
                  { color: inkMuted },
                  { fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800' },
                ]}
              >
                đ
              </Text>
            </View>

            {/* THANH TRƯỢT SỐ TIỀN */}
            <View style={styles.sliderSection}>
              <View
                style={styles.sliderTrackTouchArea}
                onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
                {...panResponder.panHandlers}
              >
                {/* Background track */}
                <View
                  style={[
                    styles.sliderTrackBg,
                    { backgroundColor: isHeocon ? '#2B2118' : tokens.border },
                    isHeocon && { height: 8, borderRadius: 4 },
                  ]}
                />
                {/* Filled track */}
                <View
                  style={[
                    styles.sliderTrackFilled,
                    {
                      width: thumbLeft + thumbWidth / 2,
                      backgroundColor: isHeocon ? '#F4B93B' : tokens.primary,
                    },
                    isHeocon && { height: 8, borderRadius: 4 },
                  ]}
                />
                {/* Thumb */}
                <View
                  style={[
                    styles.sliderThumb,
                    isHeocon
                      ? {
                          left: thumbLeft,
                          backgroundColor: '#F4B93B',
                          borderColor: cardBorder,
                          borderWidth: 2.5,
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          shadowColor: cardBorder,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 1,
                          shadowRadius: 0,
                          elevation: 3,
                        }
                      : {
                          left: thumbLeft,
                          backgroundColor: '#FFFFFF',
                          borderColor: tokens.primary,
                        },
                  ]}
                />
              </View>
              <View style={styles.sliderMinMaxRow}>
                <Text
                  style={[
                    styles.minMaxText,
                    { color: inkMuted },
                    { fontFamily: 'Nunito', fontWeight: '700' },
                  ]}
                >
                  1 triệu
                </Text>
                <Text
                  style={[
                    styles.minMaxText,
                    { color: inkMuted },
                    { fontFamily: 'Nunito', fontWeight: '700' },
                  ]}
                >
                  500 triệu
                </Text>
              </View>
            </View>

            {/* HỘP AUTO-ETA DỰ KIẾN NGÀY VỀ ĐÍCH */}
            {autoEtaInfo && (
              <View
                style={[
                  styles.etaBox,
                  isHeocon
                    ? {
                        backgroundColor: '#FFF4CC',
                        borderColor: cardBorder,
                        borderWidth: 2,
                        borderRadius: 14,
                      }
                    : {
                        backgroundColor: isDark
                          ? 'rgba(229, 152, 68, 0.08)'
                          : 'rgba(229, 152, 68, 0.06)',
                        borderColor: isDark
                          ? 'rgba(229, 152, 68, 0.25)'
                          : 'rgba(229, 152, 68, 0.2)',
                      },
                ]}
              >
                <Calendar size={15} color={isHeocon ? '#2B2118' : tokens.primary} strokeWidth={2.4} />
                <Text
                  style={[
                    styles.etaText,
                    { color: autoEtaInfo.hasBudget ? (isHeocon ? '#2B2118' : tokens.text) : (isHeocon ? '#6E5D4F' : tokens.textMuted) },
                    { fontFamily: 'Nunito', fontWeight: '700' },
                  ]}
                >
                  {autoEtaInfo.text}
                </Text>
              </View>
            )}

            {/* NÚT LƯU */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                isHeocon
                  ? {
                      backgroundColor: '#F4B93B',
                      borderWidth: 3,
                      borderColor: cardBorder,
                      borderRadius: 22,
                      shadowColor: cardBorder,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 1,
                      shadowRadius: 0,
                      elevation: 4,
                    }
                  : { backgroundColor: tokens.primary },
                (!name.trim() || amount <= 0) && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!name.trim() || amount <= 0}
              activeOpacity={0.85}
            >
              <Check size={18} color={isHeocon ? '#2B2118' : '#1B2733'} strokeWidth={2.8} />
              <Text
                style={[
                  styles.saveBtnText,
                  isHeocon && { color: '#2B2118', fontFamily: 'Baloo2_800ExtraBold', fontWeight: '800', fontSize: 16 },
                ]}
              >
                Lưu Mục Tiêu
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 1,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 24,
    height: 24,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    width: 28,
    height: 28,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
  },
  amountInputRow: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    height: '100%',
  },
  currencySuffix: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  sliderSection: {
    marginBottom: 16,
  },
  sliderTrackTouchArea: {
    height: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    borderRadius: 3,
  },
  sliderTrackFilled: {
    position: 'absolute',
    left: 0,
    height: 6,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  sliderMinMaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: -2,
  },
  minMaxText: {
    fontSize: 11,
    fontWeight: '500',
  },
  etaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 20,
  },
  etaText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: radii.md,
    gap: 6,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#1B2733',
    fontSize: 14,
    fontWeight: '700',
  },
});
