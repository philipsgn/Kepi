import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { AlertCircle, Check, Coins, Edit3, Landmark, ShieldCheck, Wallet, X } from 'lucide-react-native';
import { formatVND } from '../../utils/currency';
import { DongMark } from './DongMark';

interface NeoWalletPillProps {
  amount: number;
  isPrivacyHidden?: boolean;
  onAdjustBalance: (newAmount: number, reason: string) => Promise<void>;
}

export const NeoWalletPill: React.FC<NeoWalletPillProps> = ({
  amount,
  isPrivacyHidden = false,
  onAdjustBalance,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [newAmountStr, setNewAmountStr] = useState('');
  const [reasonStr, setReasonStr] = useState('');

  const handleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsAdjusting(false);
    setNewAmountStr('');
    setReasonStr('');
    setModalVisible(true);
  };

  const handleStartAdjust = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setNewAmountStr(amount.toString());
    setReasonStr('');
    setIsAdjusting(true);
  };

  const handleConfirmAdjust = () => {
    const parsed = parseInt(newAmountStr.replace(/\D/g, ''), 10);
    if (isNaN(parsed) || parsed < 0) {
      Alert.alert('Số tiền không hợp lệ', 'Vui lòng nhập số tiền lớn hơn hoặc bằng 0.');
      return;
    }
    if (!reasonStr.trim()) {
      Alert.alert('Cần có lý do', 'Vui lòng nhập lý do cụ thể để xác nhận thay đổi hũ tiền ban đầu.');
      return;
    }

    Alert.alert(
      'Xác nhận điều chỉnh Hũ tiền',
      `Bạn có chắc chắn muốn đổi số dư Hũ tiền thành ${formatVND(parsed)}?\nLý do: "${reasonStr.trim()}"`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'default',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await onAdjustBalance(parsed, reasonStr.trim());
            setModalVisible(false);
          },
        },
      ]
    );
  };

  const displayAmount = isPrivacyHidden ? '••••••' : formatVND(amount).replace(/ đ$/, '');

  return (
    <>
      <TouchableOpacity
        style={styles.pillContainer}
        onPress={handleOpen}
        activeOpacity={0.8}
        accessibilityLabel="Hũ tiền tổng"
      >
        <Text style={styles.jarEmoji}>🏺</Text>
        <Text style={styles.amountText}>{displayAmount}</Text>
        {!isPrivacyHidden && <DongMark size={14} color="#2B2118" />}
      </TouchableOpacity>

      {/* Modal Chi tiết & Điều chỉnh Hũ tiền */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalEmoji}>🏺</Text>
                <Text style={styles.modalTitle}>HŨ TIỀN (VÍ TỔNG)</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={20} color="#2B2118" strokeWidth={2.6} />
              </TouchableOpacity>
            </View>

            {/* Nội dung thông tin */}
            {!isAdjusting ? (
              <View style={styles.infoContent}>
                <View style={styles.balanceHighlightBox}>
                  <Text style={styles.balanceHighlightLabel}>Tổng tiền trong ví hiện có</Text>
                  <Text style={styles.balanceHighlightAmount}>
                    {formatVND(amount)}
                  </Text>
                </View>

                <View style={styles.ruleNoticeBox}>
                  <ShieldCheck size={18} color="#2B2118" strokeWidth={2.4} />
                  <Text style={styles.ruleNoticeText}>
                    Hũ tiền được thiết lập cố định từ đầu để mô phỏng chính xác số tiền thực tế bạn có. Ứng dụng gom toàn bộ vào 1 ví duy nhất để giữ kỷ luật chi tiêu.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.adjustTriggerBtn}
                  onPress={handleStartAdjust}
                  activeOpacity={0.8}
                >
                  <Edit3 size={16} color="#2B2118" strokeWidth={2.4} />
                  <Text style={styles.adjustTriggerText}>Điều chỉnh số dư ví</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Form Điều chỉnh có lý do bắt buộc */
              <View style={styles.adjustForm}>
                <View style={styles.warningBox}>
                  <AlertCircle size={16} color="#E0452B" strokeWidth={2.4} />
                  <Text style={styles.warningText}>
                    Việc sửa hũ tiền cần có lý do rõ ràng để bảo toàn tính trung thực của báo cáo tài chính.
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Số tiền mới (VND):</Text>
                  <TextInput
                    style={styles.inputBox}
                    keyboardType="numeric"
                    placeholder="Ví dụ: 5000000"
                    placeholderTextColor="#9E9484"
                    value={newAmountStr}
                    onChangeText={setNewAmountStr}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Lý do điều chỉnh (*):</Text>
                  <TextInput
                    style={[styles.inputBox, { height: 60, textAlignVertical: 'top' }]}
                    multiline
                    placeholder="Ví dụ: Rút thêm tiền tiết kiệm, Thưởng đột xuất..."
                    placeholderTextColor="#9E9484"
                    value={reasonStr}
                    onChangeText={setReasonStr}
                  />
                </View>

                <View style={styles.formActionRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setIsAdjusting(false)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelBtnText}>Quay lại</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={handleConfirmAdjust}
                    activeOpacity={0.8}
                  >
                    <Check size={16} color="#2B2118" strokeWidth={2.6} />
                    <Text style={styles.confirmBtnText}>Xác nhận</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  jarEmoji: {
    fontSize: 14,
  },
  amountText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 13.5,
    color: '#2B2118',
    fontVariant: ['tabular-nums'],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(43, 33, 24, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFBF1',
    borderWidth: 3,
    borderColor: '#2B2118',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalEmoji: {
    fontSize: 20,
  },
  modalTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 16,
    color: '#2B2118',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  infoContent: {
    gap: 14,
  },
  balanceHighlightBox: {
    backgroundColor: '#F6EEDC',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  balanceHighlightLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: '#6E5D4F',
  },
  balanceHighlightAmount: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontSize: 26,
    color: '#2B2118',
    fontVariant: ['tabular-nums'],
  },
  ruleNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(244, 185, 59, 0.18)',
    borderWidth: 1.5,
    borderColor: '#2B2118',
    borderRadius: 14,
    padding: 12,
  },
  ruleNoticeText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: '#2B2118',
    lineHeight: 17,
  },
  adjustTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFBF1',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 4,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  adjustTriggerText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: '#2B2118',
  },
  adjustForm: {
    gap: 12,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(224, 69, 43, 0.12)',
    borderWidth: 1.5,
    borderColor: '#E0452B',
    borderRadius: 12,
    padding: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: 'Nunito_600SemiBold',
    color: '#E0452B',
    lineHeight: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_700Bold',
    color: '#2B2118',
  },
  inputBox: {
    backgroundColor: '#F6EEDC',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#2B2118',
  },
  formActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F6EEDC',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#2B2118',
  },
  confirmBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F4B93B',
    borderWidth: 2,
    borderColor: '#2B2118',
    borderRadius: 12,
    paddingVertical: 10,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  confirmBtnText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: '#2B2118',
  },
});
