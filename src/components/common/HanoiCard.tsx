import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows, Spacing } from '../../constants/layout';
import { Typography } from '../../constants/typography';

interface HanoiCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const HanoiCard: React.FC<HanoiCardProps> = ({
  title,
  subtitle,
  badge,
  children,
  style,
}) => {
  return (
    <View style={[styles.card, Shadows.paper, style]}>
      {(title || subtitle || badge) && (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {title && <Text style={[Typography.heading3, styles.title]}>{title}</Text>}
            {subtitle && <Text style={[Typography.caption, styles.subtitle]}>{subtitle}</Text>}
          </View>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
      )}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfacePaper,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderSoft,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: Colors.textCharcoal,
  },
  subtitle: {
    color: Colors.textMuted,
    marginTop: 2,
  },
  badge: {
    backgroundColor: Colors.accentGoldLight,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.accentGold,
    fontWeight: '600',
  },
  content: {
    marginTop: Spacing.xs,
  },
});
