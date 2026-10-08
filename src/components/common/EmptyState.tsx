import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radii, spacing } from '../../theme/tokens';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const { tokens } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: tokens.surfaceAlt,
              borderColor: tokens.border,
            },
          ]}
        >
          {icon}
        </View>
      )}

      <Text
        style={[
          styles.title,
          {
            color: tokens.text,
          },
        ]}
      >
        {title}
      </Text>

      {description ? (
        <Text
          style={[
            styles.description,
            {
              color: tokens.textMuted,
            },
          ]}
        >
          {description}
        </Text>
      ) : null}

      {actionLabel && onAction && (
        <Button
          variant="secondary"
          size="sm"
          onPress={onAction}
          style={styles.actionButton}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 1.5,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: radii.round,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing.md,
  },
  actionButton: {
    marginTop: spacing.xs,
  },
});
