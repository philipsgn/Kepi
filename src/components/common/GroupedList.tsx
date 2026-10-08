import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radii, spacing } from '../../theme/tokens';

export interface GroupedListProps {
  header?: string;
  footer?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const GroupedList: React.FC<GroupedListProps> = ({
  header,
  footer,
  children,
  style,
}) => {
  const { tokens } = useTheme();

  return (
    <View style={[styles.wrapper, style]}>
      {header ? (
        <Text
          style={[
            styles.headerText,
            {
              color: tokens.textMuted,
            },
          ]}
        >
          {header.toUpperCase()}
        </Text>
      ) : null}

      <View
        style={[
          styles.container,
          {
            backgroundColor: tokens.surface,
            borderColor: tokens.border,
          },
        ]}
      >
        {children}
      </View>

      {footer ? (
        <Text
          style={[
            styles.footerText,
            {
              color: tokens.textMuted,
            },
          ]}
        >
          {footer}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: spacing.md,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.6,
    marginBottom: spacing.xs + 2,
    marginLeft: spacing.sm,
  },
  container: {
    borderRadius: radii.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  footerText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: spacing.xs + 2,
    marginLeft: spacing.sm,
  },
});
