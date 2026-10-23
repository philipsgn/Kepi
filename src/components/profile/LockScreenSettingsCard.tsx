import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { BellRing, Camera, RotateCcw, ShieldCheck, Smartphone, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import {
  isLockScreenBudgetEnabled,
  setLockScreenBudgetEnabled,
} from '../../services/lockScreenService';

export const LockScreenSettingsCard: React.FC = () => {
  const { tokens, isDark } = useTheme();
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      const enabled = await isLockScreenBudgetEnabled();
      setIsEnabled(enabled);
      setIsLoading(false);
    })();
  }, []);

  const handleToggle = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEnabled(value);
    await setLockScreenBudgetEnabled(value);
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
      {/* 1. TIÊU ĐỀ KHỐI */}
      <View style={styles.headerRow}>
        <Smartphone size={20} color={tokens.primary} strokeWidth={2.6} />
        <View style={styles.headerTextCol}>
          <Text style={[styles.sectionTitle, { color: tokens.text }]}>Tiện Ích Màn Hình Khóa</Text>
          <Text style={[styles.sectionSub, { color: tokens.textMuted }]}>
            Truy cập số dư & ghi tiêu siêu tốc không cần mở app
          </Text>
        </View>
      </View>

      {/* 2. CÔNG TẮC BẬT/TẮT GHIM SỐ DƯ */}
      <View style={[styles.switchRow, { borderBottomColor: tokens.border }]}>
        <View style={styles.labelCol}>
          <View style={styles.inlineTitleRow}>
            <BellRing size={16} color={isEnabled ? tokens.primary : tokens.textMuted} strokeWidth={2.4} />
            <Text style={[styles.rowTitle, { color: tokens.text }]}>Ghim số dư hôm nay</Text>
          </View>
          <Text style={[styles.rowSub, { color: tokens.textMuted }]}>
            Hiển thị "Hôm nay còn [xx]k" kèm phím tắt ghi nhanh 30k, 50k trên thanh thông báo
          </Text>
        </View>

        <Switch
          value={isEnabled}
          disabled={isLoading}
          onValueChange={handleToggle}
          trackColor={{ false: tokens.surfaceAlt, true: tokens.primary }}
          thumbColor={isEnabled ? '#1B2733' : tokens.textMuted}
        />
      </View>

      {/* 3. TÍNH NĂNG TIỆN ÍCH MINH BẠCH */}
      <View style={styles.utilitySection}>
        <Text style={[styles.subSectionTitle, { color: tokens.textSub }]}>Tính năng hỗ trợ:</Text>
        <View style={styles.utilityRow}>
          <Zap size={15} color={tokens.primary} strokeWidth={2.6} />
          <Text style={[styles.utilityText, { color: tokens.text }]}>
            Ghi chép tức thì: Phím tắt ghi nhận -30k, -50k trực tiếp từ thanh thông báo
          </Text>
        </View>
        <View style={styles.utilityRow}>
          <RotateCcw size={15} color="#7E9F80" strokeWidth={2.6} />
          <Text style={[styles.utilityText, { color: tokens.text }]}>
            Hoàn tác an toàn 5s: Khôi phục số dư trong 5 giây nếu lỡ chạm nhầm
          </Text>
        </View>
        <View style={styles.utilityRow}>
          <Camera size={15} color={tokens.primary} strokeWidth={2.6} />
          <Text style={[styles.utilityText, { color: tokens.text }]}>
            Lối tắt Camera: Mở thẳng khung ngắm chụp ảnh món đồ & quét mã
          </Text>
        </View>
      </View>

      {/* 4. CAM KẾT BẢO MẬT & QUYỀN RIÊNG TƯ */}
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
            100% Local Processing & Không Can Thiệp Tiền Thật
          </Text>
        </View>
        <Text style={[styles.securityDesc, { color: isDark ? '#C5D6C6' : '#2A4034' }]}>
          • Tiện ích hoạt động hoàn toàn cục bộ trên thiết bị, không gửi dữ liệu ra máy chủ bên ngoài.{'\n'}
          • Kepi không liên kết tài khoản ngân hàng và không có quyền thực hiện giao dịch trừ tiền thật.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  headerTextCol: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'BeVietnamPro-SemiBold',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  sectionSub: {
    fontSize: 12,
    fontFamily: 'BeVietnamPro-Regular',
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  labelCol: {
    flex: 1,
    marginRight: 16,
  },
  inlineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  rowTitle: {
    fontSize: 14,
    fontFamily: 'BeVietnamPro-Medium',
    fontWeight: '500',
  },
  rowSub: {
    fontSize: 12,
    fontFamily: 'BeVietnamPro-Regular',
    lineHeight: 17,
  },
  utilitySection: {
    marginTop: 12,
    gap: 8,
  },
  subSectionTitle: {
    fontSize: 12,
    fontFamily: 'BeVietnamPro-SemiBold',
    fontWeight: '600',
    marginBottom: 2,
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  utilityText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'BeVietnamPro-Regular',
    lineHeight: 17,
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
