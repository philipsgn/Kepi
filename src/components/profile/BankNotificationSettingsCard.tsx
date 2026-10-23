import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Bell, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { bankNotificationService } from '../../services/bankNotificationService';
import { BankNotificationSettingsModal } from './BankNotificationSettingsModal';

export const BankNotificationSettingsCard: React.FC = () => {
  const { tokens, isDark } = useTheme();
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      await bankNotificationService.init();
      setIsEnabled(bankNotificationService.getSettings().isEnabled);
    })();
  }, []);

  const handleToggle = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEnabled(value);
    await bankNotificationService.setEnabled(value);
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
      {/* 1. TIÊU ĐỀ KHỐI */}
      <View style={styles.headerRow}>
        <Bell size={20} color={tokens.primary} strokeWidth={2.6} style={{ marginRight: 10 }} />
        <View style={styles.headerTextCol}>
          <Text style={[styles.sectionTitle, { color: tokens.text }]}>
            Tự Động Ghi Sổ Thông Báo
          </Text>
          <Text style={[styles.sectionSub, { color: tokens.textMuted }]}>
            Android Native • Bóc tách TPBank, VCB, MB... 100% Offline
          </Text>
        </View>
      </View>

      {/* 2. CÔNG TẮC BẬT/TẮT */}
      <View style={[styles.switchRow, { borderBottomColor: tokens.border }]}>
        <View style={styles.labelCol}>
          <View style={styles.inlineTitleRow}>
            <ShieldCheck size={16} color={isEnabled ? tokens.primary : tokens.textMuted} strokeWidth={2.4} />
            <Text style={[styles.rowTitle, { color: tokens.text }]}>Tự động nhận diện biến động số dư</Text>
          </View>
          <Text style={[styles.rowDesc, { color: tokens.textMuted }]}>
            Ghi thẳng chi tiêu vào Sổ không cần mở app, chặn 100% OTP
          </Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: tokens.surfaceAlt, true: tokens.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* 3. NÚT MỞ CẤU HÌNH & THỬ NGHIỆM */}
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowModal(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeft}>
          <Sparkles size={16} color={tokens.primary} strokeWidth={2.4} />
          <Text style={[styles.actionText, { color: tokens.text }]}>
            Danh sách ngân hàng & Khu vực thử nghiệm
          </Text>
        </View>
        <ChevronRight size={16} color={tokens.textMuted} />
      </TouchableOpacity>

      {/* 4. KHỐI CAM KẾT ZERO-STK & CHẶN 100% OTP */}
      <View
        style={[
          styles.securityCard,
          {
            backgroundColor: isDark ? 'rgba(126, 159, 128, 0.08)' : 'rgba(126, 159, 128, 0.12)',
            borderColor: 'rgba(126, 159, 128, 0.25)',
          },
        ]}
      >
        <View style={styles.securityHeader}>
          <ShieldCheck size={16} color="#7E9F80" strokeWidth={2.6} />
          <Text style={[styles.securityTitle, { color: isDark ? '#7E9F80' : '#0F2F24' }]}>
            Tuyên Ngôn Bảo Mật Zero-STK & Chặn 100% OTP
          </Text>
        </View>
        <Text style={[styles.securityDesc, { color: isDark ? '#C5D6C6' : '#2A4034' }]}>
          • 100% Local Processing & Offline Regex: Thuật toán bóc tách chạy nội bộ trong RAM, không truyền dữ liệu ra ngoài.{'\n'}
          • Chặn 100% mã OTP: Loại bỏ tức thì mọi mã xác thực giao dịch, Smart OTP và tin nhắn nhạy cảm.{'\n'}
          • Không lưu số tài khoản: Tuyệt đối không bao giờ đọc, lưu trữ STK hay số dư tài khoản ngân hàng (Zero-STK Shield).
        </Text>
      </View>

      {/* MODAL CẤU HÌNH CHI TIẾT */}
      <BankNotificationSettingsModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setIsEnabled(bankNotificationService.getSettings().isEnabled);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.xl,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTextCol: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'BeVietnamPro-Bold',
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  sectionSub: {
    fontSize: 11,
    fontFamily: 'BeVietnamPro-Regular',
    marginTop: 2,
    lineHeight: 15,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  labelCol: {
    flex: 1,
    marginRight: 12,
  },
  inlineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowTitle: {
    fontSize: 13,
    fontFamily: 'BeVietnamPro-SemiBold',
    fontWeight: '600',
  },
  rowDesc: {
    fontSize: 11,
    fontFamily: 'BeVietnamPro-Regular',
    marginTop: 2,
    lineHeight: 15,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 4,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 12,
    fontFamily: 'BeVietnamPro-SemiBold',
    fontWeight: '600',
  },
  securityCard: {
    marginTop: 14,
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
