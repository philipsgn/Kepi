import React from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Strings } from '../../constants/strings';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

interface PrivacySecurityCardProps {
  isMasked: boolean;
  onToggleMask: (val: boolean) => void;
}

export const PrivacySecurityCard: React.FC<PrivacySecurityCardProps> = ({
  isMasked,
  onToggleMask,
}) => {
  const { tokens } = useTheme();

  const handleToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleMask(value);
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
      {/* 1. TIÊU ĐỀ KHỐI */}
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
          <Shield size={15} color={tokens.primary} strokeWidth={2.4} />
        </View>
        <Text style={[styles.sectionTitle, { color: tokens.text }]}>{Strings.profile.privacySectionTitle}</Text>
      </View>

      {/* 2. CÔNG TẮC ẨN TIỀN TOÀN APP */}
      <View style={[styles.switchRow, { borderBottomColor: tokens.border }]}>
        <View style={styles.labelCol}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {isMasked ? (
              <EyeOff size={15} color={tokens.primary} />
            ) : (
              <Eye size={15} color={tokens.textMuted} />
            )}
            <Text style={[styles.rowTitle, { color: tokens.text }]}>{Strings.profile.maskMoney}</Text>
          </View>
          <Text style={[styles.rowSub, { color: tokens.textMuted }]}>
            Hiển thị "•••• đ" cho mọi con số trên toàn bộ các trang
          </Text>
        </View>

        <Switch
          value={isMasked}
          onValueChange={handleToggle}
          trackColor={{ false: tokens.surfaceAlt, true: tokens.primary }}
          thumbColor={isMasked ? '#1B2733' : tokens.textMuted}
        />
      </View>

      {/* 3. KHÓA FACE ID / PIN (M1 SẮP RA MẮT) */}
      <View style={styles.lockedRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Lock size={15} color={tokens.textMuted} />
          <Text style={[styles.lockedTitle, { color: tokens.textSub }]}>{Strings.profile.faceIdPin}</Text>
        </View>

        <View style={[styles.comingSoonBadge, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
          <Text style={[styles.comingSoonText, { color: tokens.textMuted }]}>{Strings.profile.comingSoonM1}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
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
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 11.5,
    fontWeight: '400',
    marginTop: 2,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  lockedTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
