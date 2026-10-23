import React, { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QrCode, ShieldCheck, Landmark, DollarSign, Bell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Card } from '../common/Card';
import { GroupedList } from '../common/GroupedList';
import { GroupedRow } from '../common/GroupedRow';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { Colors } from '../../constants/colors';
import { SUPPORTED_BANKS } from '../../utils/qr/bankDeeplink';

export const STORAGE_KEY_QR_DEFAULT_BANK = 'vi_locket_qr_default_bank';
export const STORAGE_KEY_QR_AUTO_OPEN = 'vi_locket_qr_auto_open';
export const STORAGE_KEY_QR_THRESHOLD = 'vi_locket_qr_threshold';
export const STORAGE_KEY_QR_REMINDER = 'vi_locket_qr_reminder';

export const QRPaySettingsCard: React.FC = () => {
  const { tokens, isDark } = useTheme();

  const [defaultBank, setDefaultBank] = useState('tcb');
  const [autoOpen, setAutoOpen] = useState(true);
  const [enableThreshold, setEnableThreshold] = useState(true);
  const [enableReminder, setEnableReminder] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const savedBank = await AsyncStorage.getItem(STORAGE_KEY_QR_DEFAULT_BANK);
        if (savedBank) setDefaultBank(savedBank);

        const savedAuto = await AsyncStorage.getItem(STORAGE_KEY_QR_AUTO_OPEN);
        if (savedAuto !== null) setAutoOpen(savedAuto === 'true');

        const savedThreshold = await AsyncStorage.getItem(STORAGE_KEY_QR_THRESHOLD);
        if (savedThreshold !== null) setEnableThreshold(savedThreshold === 'true');

        const savedReminder = await AsyncStorage.getItem(STORAGE_KEY_QR_REMINDER);
        if (savedReminder !== null) setEnableReminder(savedReminder === 'true');
      } catch {}
    })();
  }, []);

  const handleToggleAutoOpen = async (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAutoOpen(val);
    await AsyncStorage.setItem(STORAGE_KEY_QR_AUTO_OPEN, String(val));
  };

  const handleToggleThreshold = async (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEnableThreshold(val);
    await AsyncStorage.setItem(STORAGE_KEY_QR_THRESHOLD, String(val));
  };

  const handleToggleReminder = async (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEnableReminder(val);
    await AsyncStorage.setItem(STORAGE_KEY_QR_REMINDER, String(val));
  };

  const bankName = SUPPORTED_BANKS[defaultBank]?.shortName || 'Techcombank';

  return (
    <Card style={styles.container}>
      <View style={styles.headerRow}>
        <QrCode size={22} color={tokens.primary} strokeWidth={2.6} style={{ marginRight: 10 }} />
        <View style={styles.headerTextCol}>
          <Text style={[styles.title, { color: tokens.text }]}>Thanh toán VietQR</Text>
          <Text style={[styles.subtitle, { color: tokens.textMuted }]}>
            Cấu hình quét mã chuyển khoản trong Camera
          </Text>
        </View>
      </View>

      <GroupedList>
        {/* 1. Ngân hàng mặc định */}
        <GroupedRow
          icon={<Landmark size={20} color={tokens.primary} strokeWidth={2.6} />}
          title="Ngân hàng mặc định"
          subtitle="Ưu tiên mở khi quét mã QR"
          showDivider
          rightElement={
            <Text style={{ color: tokens.textMuted, fontSize: 13, fontWeight: '600' }}>
              {bankName}
            </Text>
          }
        />

        {/* 2. Tự mở app ngân hàng sau khi quét */}
        <GroupedRow
          icon={<ShieldCheck size={20} color={Colors.greenSafe} strokeWidth={2.6} />}
          title="Tự mở app khi có số tiền"
          subtitle="Tự mở ngân hàng với mã động hợp lệ"
          showDivider
          rightElement={
            <Switch
              value={autoOpen}
              onValueChange={handleToggleAutoOpen}
              trackColor={{ false: '#3A4452', true: tokens.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />

        {/* 3. Giá thật trước khi trả */}
        <GroupedRow
          icon={<DollarSign size={20} color={tokens.primary} strokeWidth={2.6} />}
          title="Hiện Giá thật từ 200.000 đ"
          subtitle="Quy đổi giờ làm ở chế độ Định mua"
          showDivider
          rightElement={
            <Switch
              value={enableThreshold}
              onValueChange={handleToggleThreshold}
              trackColor={{ false: '#3A4452', true: tokens.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />

        {/* 4. Nhắc nhở khoản chờ */}
        <GroupedRow
          icon={<Bell size={20} color={tokens.primary} strokeWidth={2.6} />}
          title="Nhắc xác nhận khoản chờ"
          subtitle="Gửi thông báo nhẹ nếu chưa bấm xác nhận"
          showDivider
          rightElement={
            <Switch
              value={enableReminder}
              onValueChange={handleToggleReminder}
              trackColor={{ false: '#3A4452', true: tokens.primary }}
              thumbColor="#FFFFFF"
            />
          }
        />
      </GroupedList>

      {/* 5. KHỐI CAM KẾT CHUẨN VIETQR & KHÔNG GIỮ TIỀN */}
      <View
        style={[
          styles.securityCard,
          {
            backgroundColor: isDark ? 'rgba(229, 152, 68, 0.08)' : 'rgba(229, 152, 68, 0.12)',
            borderColor: 'rgba(229, 152, 68, 0.25)',
          },
        ]}
      >
        <View style={styles.securityHeader}>
          <ShieldCheck size={16} color={tokens.primary} strokeWidth={2.6} />
          <Text style={[styles.securityTitle, { color: tokens.primary }]}>
            VietQR Chuẩn NAPAS / EMVCo • Kepi Không Giữ Tiền
          </Text>
        </View>
        <Text style={[styles.securityDesc, { color: isDark ? '#D9D0C1' : '#4A3E31' }]}>
          • Tuân thủ nghiêm ngặt đặc tả kỹ thuật VietQR của NAPAS và EMVCo (Tag 38 NAPAS GUID A000000727). Bộ giải mã chạy 100% Offline trên máy.{'\n'}
          • Kepi không phải là ví điện tử hay cổng thanh toán, hoàn toàn không giữ tiền của bạn.{'\n'}
          • Zero-STK Shield: STK thụ hưởng chỉ đọc tạm trong RAM để mở app ngân hàng chính chủ, tuyệt đối không lưu vào CSDL.
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: 'BeVietnamPro-Bold',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'BeVietnamPro-Regular',
    marginTop: 2,
  },
  securityCard: {
    marginTop: 16,
    padding: 12,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  securityTitle: {
    fontSize: 12.5,
    fontFamily: 'BeVietnamPro-SemiBold',
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  securityDesc: {
    fontSize: 11.5,
    fontFamily: 'BeVietnamPro-Regular',
    lineHeight: 17,
  },
});
