import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Clock, Edit3, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Strings } from '../../constants/strings';
import { formatMaskedCurrency, convertAmountToWorkHours } from '../../utils/profileUtils';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { formatVND } from '../../utils/currency';

interface HourlyWageSettingsCardProps {
  hourlyRate: number;
  isMasked?: boolean;
  onOpenEditModal: () => void;
}

export const HourlyWageSettingsCard: React.FC<HourlyWageSettingsCardProps> = ({
  hourlyRate,
  isMasked = false,
  onOpenEditModal,
}) => {
  const { tokens } = useTheme();

  const handleEditPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onOpenEditModal();
  };

  const bobaConversion = convertAmountToWorkHours(35000, hourlyRate);
  const mealConversion = convertAmountToWorkHours(50000, hourlyRate);
  const dinnerConversion = convertAmountToWorkHours(150000, hourlyRate);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: tokens.surface,
          borderColor: tokens.border,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTitleWrap}>
          <Clock size={16} color={tokens.primary} style={styles.icon} />
          <Text style={[styles.sectionTitle, { color: tokens.textSub }]}>
            {Strings.profile.hourlyWageSectionTitle}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.editButton, { borderColor: tokens.border }]}
          activeOpacity={0.7}
          onPress={handleEditPress}
        >
          <Edit3 size={13} color={tokens.primary} />
          <Text style={[styles.editText, { color: tokens.primary }]}>
            {Strings.profile.editHourlyRateBtn}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Rate Display */}
      <View style={styles.rateDisplayRow}>
        <Text style={[styles.rateValue, { color: tokens.text }]}>
          {formatMaskedCurrency(hourlyRate, isMasked, false)}
        </Text>
        <Text style={[styles.rateUnit, { color: tokens.textSub }]}>
          {' '}đ / giờ lao động
        </Text>
      </View>

      <Text style={[styles.subDesc, { color: tokens.textSub }]}>
        {Strings.profile.hourlyWageDesc}
      </Text>

      {/* Conversion Pills */}
      {hourlyRate > 0 && (
        <View style={styles.conversionsWrap}>
          <View
            style={[
              styles.conversionPill,
              { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
            ]}
          >
            <Text style={styles.pillEmoji}>🧋</Text>
            <Text style={[styles.pillLabel, { color: tokens.text }]}>
              Trà sữa (35k):{' '}
              <Text style={{ color: tokens.primary, fontWeight: '700' }}>
                {bobaConversion.formatted}
              </Text>
            </Text>
          </View>

          <View
            style={[
              styles.conversionPill,
              { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
            ]}
          >
            <Text style={styles.pillEmoji}>🍜</Text>
            <Text style={[styles.pillLabel, { color: tokens.text }]}>
              Bát phở (50k):{' '}
              <Text style={{ color: tokens.primary, fontWeight: '700' }}>
                {mealConversion.formatted}
              </Text>
            </Text>
          </View>

          <View
            style={[
              styles.conversionPill,
              { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
            ]}
          >
            <Text style={styles.pillEmoji}>🍲</Text>
            <Text style={[styles.pillLabel, { color: tokens.text }]}>
              Bữa tối (150k):{' '}
              <Text style={{ color: tokens.primary, fontWeight: '700' }}>
                {dinnerConversion.formatted}
              </Text>
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 4,
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rateDisplayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  rateValue: {
    fontSize: 26,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  rateUnit: {
    fontSize: 14,
    fontWeight: '600',
  },
  subDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  conversionsWrap: {
    gap: 6,
  },
  conversionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 6,
  },
  pillEmoji: {
    fontSize: 14,
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
