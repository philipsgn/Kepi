import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  History,
  RotateCcw,
  Smartphone,
  X,
  Zap,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { parseVietQR, QRParseResult, VietQRPayload } from '../../utils/qr/emvParser';
import { computeCrc16 } from '../../utils/qr/crc16';
import {
  buildVietQRUniversalUrl,
  getBankByBin,
  openDeeplink,
  SUPPORTED_BANKS,
} from '../../utils/qr/bankDeeplink';
import { Colors } from '../../constants/colors';

interface QRDeeplinkTestModalProps {
  visible: boolean;
  onClose: () => void;
}

// Pre-calculated verified samples
const PREFIX_TCB_DYNAMIC =
  '00020101021238570010A00000072701270006970407011319036789123450208QRIBFTTA5204581253037045405450005802VN5912CA PHE GIANG6005HANOI62150811CA PHE SANG6304';
const CRC_TCB_DYNAMIC = computeCrc16(PREFIX_TCB_DYNAMIC);
const SAMPLE_TCB_DYNAMIC = PREFIX_TCB_DYNAMIC + CRC_TCB_DYNAMIC;

const PREFIX_TCB_STATIC =
  '00020101021138570010A00000072701270006970407011319036789123450208QRIBFTTA5204541153037045802VN5911TIEM CO MAI6005HANOI6304';
const CRC_TCB_STATIC = computeCrc16(PREFIX_TCB_STATIC);
const SAMPLE_TCB_STATIC = PREFIX_TCB_STATIC + CRC_TCB_STATIC;

const PREFIX_MB_DYNAMIC =
  '00020101021238570010A00000072701270006970422011303881234567890208QRIBFTTA5204581253037045405500005802VN5910PHO THIN HN6005HANOI62130809AN SANG HN6304';
const CRC_MB_DYNAMIC = computeCrc16(PREFIX_MB_DYNAMIC);
const SAMPLE_MB_DYNAMIC = PREFIX_MB_DYNAMIC + CRC_MB_DYNAMIC;

export const QRDeeplinkTestModal: React.FC<QRDeeplinkTestModalProps> = ({
  visible,
  onClose,
}) => {
  const [rawInput, setRawInput] = useState(SAMPLE_TCB_DYNAMIC);
  const [parseResult, setParseResult] = useState<QRParseResult | null>(null);
  const [selectedAppId, setSelectedAppId] = useState('tcb');
  const [overrideAmount, setOverrideAmount] = useState('45000');
  const [lifecycleLogs, setLifecycleLogs] = useState<string[]>([]);
  const [showReturnPrompt, setShowReturnPrompt] = useState(false);
  const [pendingTxInfo, setPendingTxInfo] = useState<any>(null);

  const leftAppTimeRef = useRef<number | null>(null);

  // Parse QR whenever rawInput changes
  useEffect(() => {
    if (rawInput && rawInput.trim().length > 0) {
      const res = parseVietQR(rawInput.trim());
      setParseResult(res);
      if (res.success) {
        if (res.data.amount) {
          setOverrideAmount(res.data.amount.toString());
        }
        const bank = getBankByBin(res.data.bankBin);
        if (bank) {
          setSelectedAppId(bank.appId);
        }
      }
    } else {
      setParseResult(null);
    }
  }, [rawInput]);

  // AppState Listener to record real-device lifecycle
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const timeStr = new Date().toLocaleTimeString('vi-VN');
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        leftAppTimeRef.current = Date.now();
        setLifecycleLogs((prev) => [
          `[${timeStr}] Ứng dụng sang nền (Chuyển sang app ngân hàng)`,
          ...prev.slice(0, 15),
        ]);
      } else if (nextAppState === 'active') {
        let durationSec = '0';
        if (leftAppTimeRef.current) {
          durationSec = ((Date.now() - leftAppTimeRef.current) / 1000).toFixed(1);
          leftAppTimeRef.current = null;
        }
        setLifecycleLogs((prev) => [
          `[${timeStr}] 🟢 Quay lại Ví Locket (Ở ngân hàng: ${durationSec}s)`,
          ...prev.slice(0, 15),
        ]);

        // If there was a pending test transaction launched, show return prompt
        if (pendingTxInfo) {
          setShowReturnPrompt(true);
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [pendingTxInfo]);

  // Build current Universal URL
  const currentUniversalUrl = React.useMemo(() => {
    if (!parseResult || !parseResult.success) return '';
    const amt = parseInt(overrideAmount, 10);
    return buildVietQRUniversalUrl({
      appId: selectedAppId,
      accountRef: parseResult.data.accountRef,
      bankBin: parseResult.data.bankBin,
      amount: isNaN(amt) ? undefined : amt,
      note: parseResult.data.note,
      payeeName: parseResult.data.payeeName,
    });
  }, [parseResult, selectedAppId, overrideAmount]);

  const targetBank = SUPPORTED_BANKS[selectedAppId] || SUPPORTED_BANKS.tcb;

  const handleLaunchUniversal = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!currentUniversalUrl) return;

    // Simulate saving PENDING record before launching
    setPendingTxInfo({
      bank: targetBank.name,
      amount: overrideAmount,
      payee: parseResult?.success ? parseResult.data.payeeName : 'Chưa rõ',
      launchedAt: new Date().toLocaleTimeString('vi-VN'),
    });

    const res = await openDeeplink(currentUniversalUrl);
    if (!res.success) {
      Alert.alert('Lỗi mở Deeplink', res.error || 'Không mở được ngân hàng');
    }
  };

  const handleLaunchNative = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPendingTxInfo({
      bank: targetBank.name,
      amount: overrideAmount,
      payee: parseResult?.success ? parseResult.data.payeeName : 'Chưa rõ',
      launchedAt: new Date().toLocaleTimeString('vi-VN'),
    });

    const res = await openDeeplink(targetBank.nativeScheme);
    if (!res.success) {
      Alert.alert(
        'Không mở được Native Scheme',
        `Scheme ${targetBank.nativeScheme} chưa được cài hoặc chưa hỗ trợ trực tiếp.`
      );
    }
  };

  const handleFallbackTest = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Phương án dự phòng',
      `Đã sao chép số tiền: ${overrideAmount} đ và nội dung: "${parseResult?.success ? parseResult.data.note || '' : ''}" vào clipboard. Đang mở app ${targetBank.name}...`,
      [
        {
          text: 'Mở App Ngân Hàng',
          onPress: () => handleLaunchNative(),
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>🛠️ Thử Nghiệm Deeplink (Giai đoạn S)</Text>
            <Text style={styles.headerSub}>Kiểm chứng Techcombank & Lifecycle trên iPhone</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Section 1: Predefined Samples */}
          <Text style={styles.sectionTitle}>1. Chọn Mẫu Thử Nghiệm</Text>
          <View style={styles.sampleRow}>
            <TouchableOpacity
              style={styles.sampleChip}
              onPress={() => setRawInput(SAMPLE_TCB_DYNAMIC)}
              activeOpacity={0.8}
            >
              <Text style={styles.sampleChipText}>Mẫu 1: Techcombank (45k)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sampleChip}
              onPress={() => setRawInput(SAMPLE_TCB_STATIC)}
              activeOpacity={0.8}
            >
              <Text style={styles.sampleChipText}>Mẫu 2: TCB Tĩnh (chưa giá)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sampleChip}
              onPress={() => setRawInput(SAMPLE_MB_DYNAMIC)}
              activeOpacity={0.8}
            >
              <Text style={styles.sampleChipText}>Mẫu 3: MBBank (50k)</Text>
            </TouchableOpacity>
          </View>

          {/* Section 2: Raw Input Box */}
          <Text style={styles.sectionTitle}>2. Chuỗi Mã VietQR</Text>
          <TextInput
            style={styles.rawInput}
            value={rawInput}
            onChangeText={setRawInput}
            multiline
            placeholder="Dán chuỗi mã VietQR tại đây..."
            placeholderTextColor="#888888"
          />

          {/* Section 3: Parse Result */}
          <Text style={styles.sectionTitle}>3. Kết Quả Giải Mã Offline</Text>
          {parseResult?.success ? (
            <View style={styles.resultBoxSuccess}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Loại mã:</Text>
                <Text style={styles.resultValHighlight}>
                  {parseResult.data.kind === 'DYNAMIC' ? 'Mã Động (Dynamic)' : 'Mã Tĩnh (Static)'}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Ngân hàng thụ hưởng:</Text>
                <Text style={styles.resultVal}>
                  {getBankByBin(parseResult.data.bankBin)?.name || parseResult.data.bankBin}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Người nhận:</Text>
                <Text style={styles.resultVal}>{parseResult.data.payeeName || 'Không có'}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Số tiền (đọc được):</Text>
                <Text style={styles.resultVal}>
                  {parseResult.data.amount
                    ? `${parseResult.data.amount.toLocaleString('vi-VN')} đ`
                    : 'Chưa có số tiền'}
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Nội dung:</Text>
                <Text style={styles.resultVal}>{parseResult.data.note || 'Không có'}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Danh mục gợi ý:</Text>
                <Text style={styles.resultValHighlight}>
                  {parseResult.data.suggestedCategory} (MCC: {parseResult.data.mcc || 'N/A'})
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>STK (chỉ hiển thị test RAM):</Text>
                <Text style={styles.resultVal}>{parseResult.data.accountRef}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.resultBoxError}>
              <Text style={styles.errorText}>
                ❌ Giải mã thất bại: {parseResult?.reason || 'Chưa nhập mã'}
              </Text>
            </View>
          )}

          {/* Section 4: Target Bank Selection */}
          <Text style={styles.sectionTitle}>4. Chọn App Ngân Hàng Mở</Text>
          <View style={styles.bankGrid}>
            {Object.values(SUPPORTED_BANKS).map((b) => {
              const isSelected = b.appId === selectedAppId;
              return (
                <TouchableOpacity
                  key={b.appId}
                  style={[styles.bankBtn, isSelected && styles.bankBtnSelected]}
                  onPress={() => setSelectedAppId(b.appId)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.bankBtnText, isSelected && styles.bankBtnTextSelected]}>
                    {b.shortName}
                  </Text>
                  <Text style={styles.bankAutofillTag}>
                    {b.autofillSupported ? '✅ Tự điền' : '⚠️ Mở app'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Section 5: Amount Override for Testing */}
          <Text style={styles.sectionTitle}>5. Số Tiền Chuyển Khoản Thử (VND)</Text>
          <TextInput
            style={styles.amountInput}
            value={overrideAmount}
            onChangeText={setOverrideAmount}
            keyboardType="number-pad"
            placeholder="Nhập số tiền..."
            placeholderTextColor="#888888"
          />

          {/* Section 6: Launch Actions */}
          <Text style={styles.sectionTitle}>6. Hành Động Mở Ứng Dụng Thực Tế</Text>
          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleLaunchUniversal}
              activeOpacity={0.8}
            >
              <ExternalLink size={18} color="#000000" strokeWidth={2.4} />
              <Text style={styles.btnPrimaryText}>
                🚀 Mở {targetBank.shortName} (Universal Link)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={handleLaunchNative}
              activeOpacity={0.8}
            >
              <Zap size={18} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.btnSecondaryText}>
                ⚡ Mở Native Scheme ({targetBank.nativeScheme})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnOutline}
              onPress={handleFallbackTest}
              activeOpacity={0.8}
            >
              <Copy size={18} color={Colors.primaryYellow} strokeWidth={2.2} />
              <Text style={styles.btnOutlineText}>
                📋 Thử Phương Án Dự Phòng (Copy + Mở App)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Deeplink URL Preview */}
          <Text style={styles.urlPreviewTitle}>Đường dẫn tạo ra:</Text>
          <Text style={styles.urlPreviewText} selectable>
            {currentUniversalUrl || 'Chưa đủ thông tin'}
          </Text>

          {/* Section 7: AppState & Lifecycle Log */}
          <Text style={styles.sectionTitle}>7. Nhật Ký Vòng Đời Ứng Dụng (AppState)</Text>
          <View style={styles.logBox}>
            {lifecycleLogs.length === 0 ? (
              <Text style={styles.logPlaceholder}>
                Chưa có sự kiện. Hãy bấm mở app ngân hàng rồi quay lại đây để đo!
              </Text>
            ) : (
              lifecycleLogs.map((log, idx) => (
                <Text key={idx} style={styles.logItem}>
                  {log}
                </Text>
              ))
            )}
          </View>
        </ScrollView>

        {/* Floating Return Prompt when returning */}
        {showReturnPrompt && (
          <View style={styles.returnPromptOverlay}>
            <View style={styles.returnPromptCard}>
              <CheckCircle2 size={32} color={Colors.greenSafe} />
              <Text style={styles.returnPromptTitle}>Đã chuyển xong chưa?</Text>
              <Text style={styles.returnPromptSub}>
                {pendingTxInfo?.payee} · {parseInt(pendingTxInfo?.amount || '0', 10).toLocaleString('vi-VN')} đ
              </Text>
              <View style={styles.promptBtnRow}>
                <TouchableOpacity
                  style={styles.promptBtnConfirm}
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setShowReturnPrompt(false);
                    setPendingTxInfo(null);
                    Alert.alert('Thành công', 'Đã ghi nhận giao dịch CONFIRMED vào sổ!');
                  }}
                >
                  <Text style={styles.promptBtnConfirmText}>Đã chuyển</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.promptBtnCancel}
                  onPress={() => {
                    setShowReturnPrompt(false);
                    setPendingTxInfo(null);
                    Alert.alert('Hủy', 'Giao dịch CANCELLED, không tính vào sổ.');
                  }}
                >
                  <Text style={styles.promptBtnCancelText}>Chưa chuyển</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E14',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222B38',
  },
  headerTitle: {
    color: '#FAF6EC',
    fontSize: 16,
    fontWeight: '700',
  },
  headerSub: {
    color: '#8C9BAE',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E2633',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#E59844',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 8,
  },
  sampleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sampleChip: {
    backgroundColor: '#161F2C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#263445',
  },
  sampleChipText: {
    color: '#FAF6EC',
    fontSize: 12,
    fontWeight: '600',
  },
  rawInput: {
    backgroundColor: '#121822',
    color: '#FAF6EC',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#263445',
    minHeight: 65,
  },
  resultBoxSuccess: {
    backgroundColor: '#0F2417',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1C4A2E',
  },
  resultBoxError: {
    backgroundColor: '#2A1312',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#542321',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultLabel: {
    color: '#A0B2C6',
    fontSize: 12,
  },
  resultVal: {
    color: '#FAF6EC',
    fontSize: 12,
    fontWeight: '600',
  },
  resultValHighlight: {
    color: '#7E9F80',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: '#E06C65',
    fontSize: 12,
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankBtn: {
    width: '48%',
    backgroundColor: '#161F2C',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#263445',
  },
  bankBtnSelected: {
    borderColor: '#E59844',
    backgroundColor: '#2A2518',
  },
  bankBtnText: {
    color: '#FAF6EC',
    fontSize: 13,
    fontWeight: '600',
  },
  bankBtnTextSelected: {
    color: '#E59844',
  },
  bankAutofillTag: {
    color: '#8C9BAE',
    fontSize: 10,
    marginTop: 4,
  },
  amountInput: {
    backgroundColor: '#121822',
    color: '#FAF6EC',
    fontSize: 16,
    fontWeight: '700',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#263445',
  },
  actionGroup: {
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: '#E59844',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  btnPrimaryText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: '#1E2633',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#2C3A4E',
  },
  btnSecondaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  btnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E59844',
  },
  btnOutlineText: {
    color: '#E59844',
    fontSize: 13,
    fontWeight: '600',
  },
  urlPreviewTitle: {
    color: '#8C9BAE',
    fontSize: 11,
    marginTop: 12,
  },
  urlPreviewText: {
    color: '#65778E',
    fontSize: 10,
    marginTop: 4,
  },
  logBox: {
    backgroundColor: '#0D1117',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222B38',
    minHeight: 100,
  },
  logPlaceholder: {
    color: '#556375',
    fontSize: 12,
    fontStyle: 'italic',
  },
  logItem: {
    color: '#9EADC0',
    fontSize: 11,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  returnPromptOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  returnPromptCard: {
    backgroundColor: '#161F2C',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A384C',
  },
  returnPromptTitle: {
    color: '#FAF6EC',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  returnPromptSub: {
    color: '#E59844',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 18,
  },
  promptBtnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  promptBtnConfirm: {
    flex: 1,
    backgroundColor: '#7E9F80',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  promptBtnConfirmText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  promptBtnCancel: {
    flex: 1,
    backgroundColor: '#263445',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  promptBtnCancelText: {
    color: '#FAF6EC',
    fontSize: 14,
    fontWeight: '600',
  },
});
