import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Spacing } from '../../constants/layout';
import { Typography } from '../../constants/typography';

interface FrostedPillProps {
  label: string;
  status?: 'safe' | 'caution' | 'over' | 'neutral';
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const FrostedPill: React.FC<FrostedPillProps> = ({
  label,
  status = 'neutral',
  icon,
  onPress,
  style,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'safe':
        return Colors.statusSafe;
      case 'caution':
        return Colors.statusCaution;
      case 'over':
        return Colors.statusOver;
      default:
        return Colors.accentGold;
    }
  };

  const statusColor = getStatusColor();

  const content = (
    <View style={[styles.container, style]}>
      {icon ? (
        <View style={styles.iconContainer}>{icon}</View>
      ) : (
        <View style={[styles.dot, { backgroundColor: statusColor }]} />
      )}
      <Text style={styles.text}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.75} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 29, 26, 0.72)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  iconContainer: {
    marginRight: Spacing.xs,
  },
  text: {
    ...Typography.pillText,
    color: '#FFFFFF',
  },
});
