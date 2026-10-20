import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Camera,
  Check,
  CheckCircle2,
  Edit2,
  HelpCircle,
  ImagePlus,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Transaction } from '../../types/database';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../theme/ThemeContext';

interface PendingReturnPromptModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onConfirm: (txId: string, updatedAmount?: number) => void;
  onCancel: (txId: string) => void;
  onPromptTakePhoto?: (txId: string) => void;
  onReportNoAutofill?: (txId: string, bankBinOrCode?: string) => void;
  onOpenUploadReceipt?: () => void;
}

export const PendingReturnPromptModal: React.FC<PendingReturnPromptModalProps> = ({
  visible,
  transaction,
  onConfirm,
  onCancel,
  onPromptTakePhoto,
  onReportNoAutofill,
  onOpenUploadReceipt,
}) => {
  const { isDark, tokens } = useTheme();

  const [showPhotoPrompt, setShowPhotoPrompt] = useState(false);
  const [reportedStep, setReportedStep] = useState(false);
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editedAmountStr, setEditedAmountStr] = useState('');
  const [confirmedTxId, setConfirmedTxId] = useState<string | null>(null);

  const isEWallet = transaction?.payment_method === 'E_WALLET';

  useEffect(() => {
    if (!visible) {
      setShowPhotoPrompt(false);
      setReportedStep(false);
      setIsEditingAmount(false);
      setEditedAmountStr('');
    } else if (transaction && transaction.amount === 0) {
      setIsEditingAmount(true);
      setEditedAmountStr('');
    }
  }, [visible, transaction]);

  if (!transaction) return null;

  const handlePressConfirm = () => {
    let finalAmount = transaction.amount;
    if (isEditingAmount && editedAmountStr) {
      const parsed = parseInt(editedAmountStr.replace(/\D/g, ''), 10);
      if (parsed > 0) finalAmount = parsed;
    }

    if (finalAmount <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setIsEditingAmount(true);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm(transaction.id, finalAmount);
    setConfirmedTxId(transaction.id);
    setShowPhotoPrompt(true);
  };

  const handlePressCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCancel(transaction.id);
    setShowPhotoPrompt(false);
    setConfirmedTxId(null);
  };

  const handleDismissPhotoPrompt = () => {
    setShowPhotoPrompt(false);
    setConfirmedTxId(null);
  };

  const handlePressReportNoAutofill = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onReportNoAutofill && transaction) {
      onReportNoAutofill(transaction.id, transaction.bank_bin || undefined);
    }
    setReportedStep(true);
  };

  const handleAcceptTakePhoto = () => {
    const txId = confirmedTxId;
    setShowPhotoPrompt(false);
    setConfirmedTxId(null);
    if (txId && onPromptTakePhoto) {
      onPromptTakePhoto(txId);
    }
  };

  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: isDark ? '#141D2A' : '#FAF6EC',
                  borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(22,34,49,0.15)',
                },
              ]}
            >
              {!showPhotoPrompt && !reportedStep ? (
                <>
                  {/* Status Icon */}
                  <View style={styles.iconCircle}>
                    <CheckCircle2 size={36} color={Colors.greenSafe} strokeWidth={2.4} />
                  </View>

                  {/* Title */}
                  <Text style={[styles.titleText, { color: isDark ? '#FAF6EC' : '#141D26' }]}>
                    {isEWallet ? 'Đã thanh toán xong chưa?' : 'Đã chuyển xong chưa?'}
                  </Text>
                  <Text style={[styles.subText, { color: isDark ? '#8C9DAC' : '#65778B' }]}>
                    {transaction.payee_name || (isEWallet ? 'Thanh toán Ví Điện Tử' : 'Điểm Chấp Nhận VietQR')}
                  </Text>

                  {/* Amount / Editable Amount */}
                  {isEditingAmount ? (
                    <View style={styles.editRow}>
                      <TextInput
                        style={[
                          styles.editInput,
                          {
                            color: isDark ? '#FAF6EC' : '#141D26',
                            borderColor: tokens.primary,
                          },
                        ]}
                        value={editedAmountStr}
                        onChangeText={(t) => setEditedAmountStr(t.replace(/\D/g, ''))}
                        keyboardType="number-pad"
                        placeholder={transaction.amount > 0 ? formatVND(transaction.amount) : 'Nhập số tiền...'}
                        placeholderTextColor="#888888"
                        autoFocus
                      />
                      <Text style={[styles.editCurrency, { color: isDark ? '#FAF6EC' : '#141D26' }]}>
                        đ
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.amountBadge}>
                      <Text
                        style={[
                          styles.amountText,
                          { color: isDark ? '#FAF6EC' : '#141D26' },
                        ]}
                      >
                        {formatVND(transaction.amount)} đ
                      </Text>
                    </View>
                  )}

                  {/* Edit Amount Toggle */}
                  {!isEditingAmount && (
                    <TouchableOpacity
                      onPress={() => {
                        setIsEditingAmount(true);
                        setEditedAmountStr(transaction.amount > 0 ? transaction.amount.toString() : '');
                      }}
                      style={styles.editBtnToggle}
                      activeOpacity={0.7}
                    >
                      <Edit2 size={12} color={tokens.primary} />
                      <Text style={[styles.editBtnText, { color: tokens.primary }]}>
                        Sửa số tiền nếu khác
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.buttonStack}>
                    <TouchableOpacity
                      style={[styles.confirmBtn, { backgroundColor: Colors.greenSafe }]}
                      onPress={handlePressConfirm}
                      activeOpacity={0.85}
                    >
                      <Check size={16} color="#000000" strokeWidth={2.6} />
                      <Text style={styles.confirmBtnText}>
                        {isEWallet ? 'Đã thanh toán' : 'Đã chuyển'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.cancelBtn,
                        {
                          backgroundColor: isDark ? '#1F2A3B' : '#E8E2D4',
                          borderColor: isDark ? '#2D3D54' : '#D6CFBF',
                        },
                      ]}
                      onPress={handlePressCancel}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.cancelBtnText,
                          { color: isDark ? '#C4D3E3' : '#4E5F72' },
                        ]}
                      >
                        {isEWallet ? 'Chưa thanh toán (Hủy)' : 'Chưa chuyển (Hủy bỏ)'}
                      </Text>
                    </TouchableOpacity>

                    {!isEWallet && (
                      <TouchableOpacity
                        style={[
                          styles.reportNoAutofillBtn,
                          {
                            backgroundColor: isDark ? 'rgba(229, 152, 68, 0.10)' : '#FAF3E7',
                            borderColor: isDark ? 'rgba(229, 152, 68, 0.35)' : '#DFD4C4',
                          },
                        ]}
                        onPress={handlePressReportNoAutofill}
                        activeOpacity={0.8}
                      >
                        <HelpCircle size={14} color={tokens.primary} strokeWidth={2.2} />
                        <Text style={[styles.reportNoAutofillText, { color: tokens.primary }]}>
                          App không tự điền sẵn?
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              ) : reportedStep ? (
                /* Step 3: Reported No Autofill Feedback */
                <View style={styles.photoPromptContainer}>
                  <View style={styles.photoIconCircle}>
                    <Sparkles size={28} color={tokens.primary} strokeWidth={2.6} />
                  </View>
                  <Text style={[styles.titleText, { color: isDark ? '#FAF6EC' : '#141D26' }]}>
                    Đã ghi nhận phản hồi!
                  </Text>
                  <Text style={[styles.subText, { color: isDark ? '#8C9DAC' : '#65778B', marginBottom: 20 }]}>
                    Kepi đã lưu lại. Lần tới, app sẽ mở dạng quét trả và gợi ý tải ảnh biên lai thay vì thử điền sẵn cho ngân hàng này.
                  </Text>

                  <View style={styles.buttonStack}>
                    {onOpenUploadReceipt && (
                      <TouchableOpacity
                        style={[styles.confirmBtn, { backgroundColor: tokens.primary }]}
                        onPress={() => {
                          setReportedStep(false);
                          onOpenUploadReceipt();
                        }}
                        activeOpacity={0.85}
                      >
                        <ImagePlus size={16} color="#000000" strokeWidth={2.4} />
                        <Text style={styles.confirmBtnText}>Tải ảnh biên lai</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[styles.confirmBtn, { backgroundColor: Colors.greenSafe }]}
                      onPress={handlePressConfirm}
                      activeOpacity={0.85}
                    >
                      <Check size={16} color="#000000" strokeWidth={2.4} />
                      <Text style={styles.confirmBtnText}>Vẫn xác nhận đã chuyển</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.cancelBtn,
                        {
                          backgroundColor: isDark ? '#1F2A3B' : '#E8E2D4',
                          borderColor: isDark ? '#2D3D54' : '#D6CFBF',
                        },
                      ]}
                      onPress={handlePressCancel}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.cancelBtnText,
                          { color: isDark ? '#C4D3E3' : '#4E5F72' },
                        ]}
                      >
                        Để lại trong Hộp chờ
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* Step 2: Post-confirmation Photo Prompt */
                <View style={styles.photoPromptContainer}>
                  <View style={styles.photoIconCircle}>
                    <Camera size={28} color={tokens.primary} strokeWidth={2.6} />
                  </View>
                  <Text style={[styles.titleText, { color: isDark ? '#FAF6EC' : '#141D26' }]}>
                    Đã ghi nhận vào sổ!
                  </Text>
                  <Text style={[styles.subText, { color: isDark ? '#8C9DAC' : '#65778B', marginBottom: 20 }]}>
                    Bạn có muốn chụp thêm ảnh món đồ hoặc hóa đơn để lưu thành khoảnh khắc không?
                  </Text>

                  <View style={styles.buttonStack}>
                    <TouchableOpacity
                      style={[styles.confirmBtn, { backgroundColor: tokens.primary }]}
                      onPress={handleAcceptTakePhoto}
                      activeOpacity={0.85}
                    >
                      <Camera size={16} color="#000000" strokeWidth={2.4} />
                      <Text style={styles.confirmBtnText}>Chụp ảnh món đồ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.cancelBtn,
                        {
                          backgroundColor: isDark ? '#1F2A3B' : '#E8E2D4',
                          borderColor: isDark ? '#2D3D54' : '#D6CFBF',
                        },
                      ]}
                      onPress={handleDismissPhotoPrompt}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.cancelBtnText,
                          { color: isDark ? '#C4D3E3' : '#4E5F72' },
                        ]}
                      >
                        Bỏ qua
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.76)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  iconCircle: {
    marginBottom: 12,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subText: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 18,
  },
  amountBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(229, 152, 68, 0.15)',
    marginBottom: 8,
  },
  amountText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  editBtnToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 18,
    paddingVertical: 4,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 6,
  },
  editInput: {
    fontSize: 22,
    fontWeight: '700',
    borderBottomWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 120,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  editCurrency: {
    fontSize: 18,
    fontWeight: '700',
  },
  buttonStack: {
    width: '100%',
    gap: 10,
    marginTop: 6,
  },
  confirmBtn: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelBtn: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  photoPromptContainer: {
    width: '100%',
    alignItems: 'center',
  },
  photoIconCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  reportNoAutofillBtn: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  reportNoAutofillText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
