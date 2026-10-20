import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  StyleSheet,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import {
  Bell,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Smartphone,
  Send,
  X,
  CreditCard,
  Ban,
  Check,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import {
  bankNotificationService,
  BankSyncSettings,
} from '../../services/bankNotificationService';
import {
  BANK_BRANDS,
  SupportedBankCode,
  ParsedBankNotification,
} from '../../utils/bankNotificationParser';

const COLORS = {
  warmAmber: '#E59844',
  comGreen: '#7E9F80',
  deepOlive: '#0F2F24',
  inkMuted: '#8C827A',
  tileRed: '#C86D51',
};

interface Props {
  visible: boolean;
  onClose: () => void;
}

const SAMPLE_NOTIFICATIONS = [
  {
    label: 'TPBank (48k Highlands)',
    text: 'TK: 0284xxxx01 / PS: -48.000VND / SD: 1.250.000VND / ND: Highland Coffee Dinh Tien Hoang',
    title: 'TPBank',
    pkg: 'com.tpb.mb.gprsandroid',
  },
  {
    label: 'Vietcombank (35k Grab)',
    text: 'SD TK 0071000xxx -35,000 VND luc 14:20 12/10/2026. So du 2,450,000 VND. ND: Grab Rides chuyen tien',
    title: 'Vietcombank',
    pkg: 'com.vcb',
  },
  {
    label: 'MBBank (500k Siêu thị)',
    text: 'TK 0984xxx|-500,000VND|SD:3,100,000VND|ND: WinMart Thang Long mua sam',
    title: 'MBBank',
    pkg: 'com.mbmobile',
  },
  {
    label: 'Tin nhắn OTP (Test chặn)',
    text: 'Ma OTP xac thuc giao dich cua ban la 849201. Khong chia se ma nay cho bat ky ai de bao ve tai khoan.',
    title: 'Ngan hang',
    pkg: 'com.bank.otp',
  },
];

export const BankNotificationSettingsModal: React.FC<Props> = ({ visible, onClose }) => {
  const [settings, setSettings] = useState<BankSyncSettings>({
    isEnabled: true,
    allowedBanks: ['TPB', 'VCB', 'MB', 'TCB', 'ACB', 'VPB', 'BIDV', 'OCB', 'OTHER'],
  });

  const [customInputText, setCustomInputText] = useState('');
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    parsed?: ParsedBankNotification;
  } | null>(null);

  useEffect(() => {
    if (visible) {
      loadSettings();
      setTestResult(null);
    }
  }, [visible]);

  const loadSettings = async () => {
    await bankNotificationService.init();
    setSettings(bankNotificationService.getSettings());
  };

  const handleToggleGlobal = async (val: boolean) => {
    await bankNotificationService.setEnabled(val);
    setSettings((prev) => ({ ...prev, isEnabled: val }));
  };

  const handleToggleBank = async (bankCode: SupportedBankCode, val: boolean) => {
    await bankNotificationService.toggleBank(bankCode, val);
    setSettings(bankNotificationService.getSettings());
  };

  const openAndroidNotificationAccess = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings().catch(() => {
        Alert.alert('Cài đặt', 'Vui lòng mở Cài đặt thiết bị -> Quyền truy cập thông báo để cấp quyền cho Kepi.');
      });
    } else {
      Alert.alert(
        'Thông báo hệ điều hành',
        'Tính năng lắng nghe trực tiếp thông báo hoạt động tối ưu trên Android. Trên iOS, bạn có thể dùng khu vực thử nghiệm bên dưới.'
      );
    }
  };

  const runTestSimulation = async (sampleText: string, title: string = '', pkg: string = '') => {
    setCustomInputText(sampleText);
    const res = await bankNotificationService.processIncomingNotification(sampleText, title, pkg);

    if (res) {
      setTestResult({
        success: true,
        message: `Đã tự động ghi nhận ${res.parsed.type === 'EXPENSE' ? 'Chi tiêu' : 'Thu nhập'} ${res.parsed.amount.toLocaleString('vi-VN')}đ (${res.parsed.categoryName}) vào Sổ!`,
        parsed: res.parsed,
      });
    } else {
      setTestResult({
        success: false,
        message: 'Thông báo đã bị chặn an toàn (Chứa mã OTP / Tin nhắn rác / Hoặc tính năng đã tắt).',
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconWrap}>
                <Bell size={20} color={COLORS.warmAmber} strokeWidth={2.6} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Tự Động Ghi Sổ Qua Thông Báo</Text>
                <Text style={styles.headerSubtitle}>Dành riêng cho Android • 100% Offline</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={20} color={COLORS.inkMuted} strokeWidth={2.6} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Banner Quyền Riêng Tư & An Toàn */}
            <View style={styles.securityBanner}>
              <ShieldCheck size={20} color={COLORS.comGreen} style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.securityBannerTitle}>Bảo Vệ Quyền Riêng Tư Tuyệt Đối</Text>
                <Text style={styles.securityBannerDesc}>
                  Xử lý 100% trong bộ nhớ máy. Không gửi dữ liệu ra máy chủ, tự động chặn 100% mã OTP và tin nhắn quảng cáo.
                </Text>
              </View>
            </View>

            {/* Toggle Tính Năng Toàn Cục */}
            <View style={styles.settingRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={styles.settingLabel}>Bật tự động bóc tách & ghi sổ</Text>
                <Text style={styles.settingSubLabel}>Tự động nhận diện biến động số dư khi có thông báo ngân hàng</Text>
              </View>
              <Switch
                value={settings.isEnabled}
                onValueChange={handleToggleGlobal}
                trackColor={{ false: '#E2DCD2', true: COLORS.warmAmber }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Trạng thái Quyền Android */}
            <View style={styles.permissionCard}>
              <View style={styles.permissionHeader}>
                <Smartphone size={18} color={COLORS.deepOlive} />
                <Text style={styles.permissionTitle}>Quyền Truy Cập Thông Báo Android</Text>
              </View>
              <Text style={styles.permissionDesc}>
                Để Kepi có thể đọc thông báo biến động số dư ngầm, bạn cần cấp quyền "Truy cập thông báo" (Notification Access) trong Cài đặt hệ điều hành.
              </Text>
              <TouchableOpacity style={styles.openSettingsBtn} onPress={openAndroidNotificationAccess}>
                <Text style={styles.openSettingsText}>Cấp Quyền Trong Cài Đặt Android</Text>
              </TouchableOpacity>
            </View>

            {/* Danh Sách Ngân Hàng Hỗ Trợ */}
            <Text style={styles.sectionTitle}>Ngân Hàng Được Hỗ Trợ</Text>
            <View style={styles.bankGrid}>
              {(['TPB', 'VCB', 'MB', 'TCB', 'ACB', 'VPB', 'BIDV', 'OCB'] as SupportedBankCode[]).map((bCode) => {
                const info = BANK_BRANDS[bCode];
                const isAllowed = settings.allowedBanks.includes(bCode);

                return (
                  <TouchableOpacity
                    key={bCode}
                    style={[styles.bankItem, isAllowed && styles.bankItemActive]}
                    onPress={() => handleToggleBank(bCode, !isAllowed)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.bankBadge, { backgroundColor: info.brandColor }]}>
                      <Text style={styles.bankBadgeText}>{info.shortCode}</Text>
                    </View>
                    <Text style={styles.bankNameText} numberOfLines={1}>
                      {info.bankName}
                    </Text>
                    <View style={[styles.checkCircle, isAllowed && styles.checkCircleActive]}>
                      {isAllowed && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sandbox Thử Nghiệm Trực Tiếp */}
            <View style={styles.sandboxCard}>
              <View style={styles.sandboxHeader}>
                <Sparkles size={18} color={COLORS.warmAmber} />
                <Text style={styles.sandboxTitle}>Khu Vực Thử Nghiệm (Test Sandbox)</Text>
              </View>
              <Text style={styles.sandboxDesc}>
                Nhấn vào các mẫu thông báo thực tế dưới đây để kiểm tra khả năng bóc tách và ghi sổ tự động:
              </Text>

              {/* Danh sách nút bấm mẫu */}
              <View style={styles.sampleBtnGroup}>
                {SAMPLE_NOTIFICATIONS.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.sampleBtn}
                    onPress={() => runTestSimulation(item.text, item.title, item.pkg)}
                  >
                    <Text style={styles.sampleBtnText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Ô Dán Tự Do */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Hoặc dán nội dung tin nhắn ngân hàng của bạn vào đây..."
                  placeholderTextColor={COLORS.inkMuted}
                  value={customInputText}
                  onChangeText={setCustomInputText}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.sendTestBtn, !customInputText.trim() && { opacity: 0.5 }]}
                  disabled={!customInputText.trim()}
                  onPress={() => runTestSimulation(customInputText, 'Test Ngân Hàng')}
                >
                  <Send size={16} color="#FFFFFF" />
                  <Text style={styles.sendTestText}>Thử ngay</Text>
                </TouchableOpacity>
              </View>

              {/* Kết Quả Bóc Tách */}
              {testResult && (
                <View
                  style={[
                    styles.resultCard,
                    testResult.success ? styles.resultCardSuccess : styles.resultCardFail,
                  ]}
                >
                  {testResult.success ? (
                    <CheckCircle2 size={18} color={COLORS.comGreen} />
                  ) : (
                    <AlertCircle size={18} color={COLORS.tileRed} />
                  )}
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text
                      style={[
                        styles.resultMessage,
                        { color: testResult.success ? COLORS.deepOlive : COLORS.tileRed },
                      ]}
                    >
                      {testResult.message}
                    </Text>

                    {testResult.parsed && (
                      <View style={styles.resultDetails}>
                        <Text style={styles.resultDetailItem}>
                          • Ngân hàng: <Text style={{ fontWeight: '700' }}>{testResult.parsed.bankName}</Text>
                        </Text>
                        <Text style={styles.resultDetailItem}>
                          • Số tiền:{' '}
                          <Text style={{ fontWeight: '700', color: COLORS.warmAmber }}>
                            {testResult.parsed.amount.toLocaleString('vi-VN')}đ
                          </Text>
                        </Text>
                        <Text style={styles.resultDetailItem}>
                          • Danh mục: <Text style={{ fontWeight: '700' }}>{testResult.parsed.categoryName}</Text>
                        </Text>
                        <Text style={styles.resultDetailItem}>
                          • Nội dung: <Text style={{ fontStyle: 'italic' }}>{testResult.parsed.content}</Text>
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 22, 32, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FAF6F0',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44, 34, 30, 0.08)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrap: {
    width: 26,
    height: 26,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C221E',
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.inkMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(44, 34, 30, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  securityBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(126, 159, 128, 0.12)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(126, 159, 128, 0.25)',
  },
  securityBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.deepOlive,
  },
  securityBannerDesc: {
    fontSize: 12,
    color: COLORS.deepOlive,
    lineHeight: 17,
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(44, 34, 30, 0.06)',
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C221E',
  },
  settingSubLabel: {
    fontSize: 12,
    color: COLORS.inkMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  permissionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(44, 34, 30, 0.06)',
  },
  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  permissionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C221E',
    marginLeft: 8,
  },
  permissionDesc: {
    fontSize: 12,
    color: COLORS.inkMuted,
    lineHeight: 17,
    marginBottom: 12,
  },
  openSettingsBtn: {
    backgroundColor: '#2C221E',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  openSettingsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FAF6F0',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C221E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: '48.5%',
    borderWidth: 1,
    borderColor: 'rgba(44, 34, 30, 0.08)',
  },
  bankItemActive: {
    borderColor: COLORS.warmAmber,
    backgroundColor: 'rgba(229, 152, 68, 0.05)',
  },
  bankBadge: {
    width: 28,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  bankBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  bankNameText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#2C221E',
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(44, 34, 30, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleActive: {
    backgroundColor: COLORS.warmAmber,
    borderColor: COLORS.warmAmber,
  },
  sandboxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(44, 34, 30, 0.06)',
  },
  sandboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sandboxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2C221E',
    marginLeft: 8,
  },
  sandboxDesc: {
    fontSize: 12,
    color: COLORS.inkMuted,
    lineHeight: 17,
    marginBottom: 12,
  },
  sampleBtnGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  sampleBtn: {
    backgroundColor: 'rgba(44, 34, 30, 0.06)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sampleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2C221E',
  },
  inputContainer: {
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#FAF6F0',
    borderRadius: 12,
    padding: 10,
    fontSize: 12,
    color: '#2C221E',
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(44, 34, 30, 0.08)',
  },
  sendTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.warmAmber,
    borderRadius: 10,
    paddingVertical: 8,
    marginTop: 8,
  },
  sendTestText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  resultCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
  },
  resultCardSuccess: {
    backgroundColor: 'rgba(126, 159, 128, 0.1)',
    borderColor: 'rgba(126, 159, 128, 0.3)',
  },
  resultCardFail: {
    backgroundColor: 'rgba(200, 109, 81, 0.1)',
    borderColor: 'rgba(200, 109, 81, 0.3)',
  },
  resultMessage: {
    fontSize: 12,
    fontWeight: '700',
  },
  resultDetails: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  resultDetailItem: {
    fontSize: 11,
    color: '#2C221E',
    marginTop: 2,
  },
});
