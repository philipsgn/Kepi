import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { BellRing, Camera, Check, RotateCcw, Smartphone, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import {
  isLockScreenBudgetEnabled,
  setLockScreenBudgetEnabled,
} from '../../services/lockScreenService';

export const LockScreenSettingsCard: React.FC = () => {
  const { tokens } = useTheme();
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
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isEnabled ? 'rgba(126, 159, 128, 0.16)' : tokens.surfaceAlt,
                  borderColor: isEnabled ? '#7E9F80' : tokens.border,
                },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: isEnabled ? '#7E9F80' : tokens.textMuted }]}>
                {isEnabled ? 'Đang ghim' : 'Đang tắt'}
              </Text>
            </View>
          </View>
          <Text style={[styles.rowSub, { color: tokens.textMuted }]}>
            Luôn hiện "Hôm nay còn [xx]k" kèm nút trừ nhanh 30k, 50k trên thanh thông báo
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

      {/* 3. TÍNH NĂNG TÍCH HỢP TRÊN MÀN HÌNH KHÓA */}
      <View style={styles.featureGrid}>
        <View style={[styles.featurePill, { backgroundColor: tokens.surfaceAlt }]}>
          <Zap size={14} color={tokens.primary} strokeWidth={2.6} />
          <Text style={[styles.featureText, { color: tokens.textSub }]}>Trừ ngầm -30k / -50k</Text>
        </View>

        <View style={[styles.featurePill, { backgroundColor: tokens.surfaceAlt }]}>
          <RotateCcw size={14} color="#7E9F80" strokeWidth={2.6} />
          <Text style={[styles.featureText, { color: tokens.textSub }]}>Hoàn tác 1 chạm</Text>
        </View>

        <View style={[styles.featurePill, { backgroundColor: tokens.surfaceAlt }]}>
          <Camera size={14} color={tokens.primary} strokeWidth={2.6} />
          <Text style={[styles.featureText, { color: tokens.textSub }]}>Mở camera &lt; 0.5s</Text>
        </View>
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: 'BeVietnamPro-SemiBold',
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 12,
    fontFamily: 'BeVietnamPro-Regular',
    lineHeight: 17,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  featureText: {
    fontSize: 11,
    fontFamily: 'BeVietnamPro-Medium',
  },
});
