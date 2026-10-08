import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Strings } from '../../constants/strings';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

export type CoachTone = 'GENTLE' | 'BALANCED' | 'DIRECT';
export type CoachAddress = 'BRO_FRIEND' | 'BRO_BRO' | 'MINH_ME';

interface CoachSettingsCardProps {
  currentTone: CoachTone;
  currentAddress: CoachAddress;
  onChangeTone: (tone: CoachTone) => void;
  onChangeAddress: (address: CoachAddress) => void;
}

export const CoachSettingsCard: React.FC<CoachSettingsCardProps> = ({
  currentTone,
  currentAddress,
  onChangeTone,
  onChangeAddress,
}) => {
  const { tokens } = useTheme();

  const handleSelectTone = (tone: CoachTone) => {
    if (tone !== currentTone) {
      Haptics.selectionAsync();
      onChangeTone(tone);
    }
  };

  const handleSelectAddress = (address: CoachAddress) => {
    if (address !== currentAddress) {
      Haptics.selectionAsync();
      onChangeAddress(address);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
      {/* 1. TIÊU ĐỀ KHỐI */}
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
          <Sparkles size={15} color={tokens.primary} strokeWidth={2.4} />
        </View>
        <Text style={[styles.sectionTitle, { color: tokens.text }]}>{Strings.profile.coachSectionTitle}</Text>
      </View>

      {/* 2. MỨC ĐỘ THẲNG THẮN */}
      <View style={styles.group}>
        <Text style={[styles.groupLabel, { color: tokens.textMuted }]}>{Strings.profile.coachTone}</Text>
        <View style={[styles.segmentedControl, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              currentTone === 'GENTLE' && [styles.segmentBtnActive, { backgroundColor: tokens.primary }],
            ]}
            onPress={() => handleSelectTone('GENTLE')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                { color: currentTone === 'GENTLE' ? '#1B2733' : tokens.textMuted },
              ]}
            >
              {Strings.profile.toneGentle}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              currentTone === 'BALANCED' && [styles.segmentBtnActive, { backgroundColor: tokens.primary }],
            ]}
            onPress={() => handleSelectTone('BALANCED')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                { color: currentTone === 'BALANCED' ? '#1B2733' : tokens.textMuted },
              ]}
            >
              {Strings.profile.toneBalanced}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              currentTone === 'DIRECT' && [styles.segmentBtnActive, { backgroundColor: tokens.primary }],
            ]}
            onPress={() => handleSelectTone('DIRECT')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                { color: currentTone === 'DIRECT' ? '#1B2733' : tokens.textMuted },
              ]}
            >
              {Strings.profile.toneDirect}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. CÁCH XƯNG HÔ */}
      <View style={[styles.group, { marginTop: 14 }]}>
        <Text style={[styles.groupLabel, { color: tokens.textMuted }]}>{Strings.profile.coachAddress}</Text>
        <View style={[styles.segmentedControl, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              currentAddress === 'BRO_FRIEND' && [styles.segmentBtnActive, { backgroundColor: tokens.primary }],
            ]}
            onPress={() => handleSelectAddress('BRO_FRIEND')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                { color: currentAddress === 'BRO_FRIEND' ? '#1B2733' : tokens.textMuted },
              ]}
            >
              {Strings.profile.addressBroFriend}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              currentAddress === 'BRO_BRO' && [styles.segmentBtnActive, { backgroundColor: tokens.primary }],
            ]}
            onPress={() => handleSelectAddress('BRO_BRO')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                { color: currentAddress === 'BRO_BRO' ? '#1B2733' : tokens.textMuted },
              ]}
            >
              {Strings.profile.addressBroBro}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              currentAddress === 'MINH_ME' && [styles.segmentBtnActive, { backgroundColor: tokens.primary }],
            ]}
            onPress={() => handleSelectAddress('MINH_ME')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                { color: currentAddress === 'MINH_ME' ? '#1B2733' : tokens.textMuted },
              ]}
            >
              {Strings.profile.addressMinhMe}
            </Text>
          </TouchableOpacity>
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
  group: {},
  groupLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: radii.full,
    borderWidth: 1,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: radii.full,
  },
  segmentBtnActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
