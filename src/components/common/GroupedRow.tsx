import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radii, spacing } from '../../theme/tokens';

export interface GroupedRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  isDestructive?: boolean;
  showDivider?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const GroupedRow: React.FC<GroupedRowProps> = ({
  title,
  subtitle,
  icon,
  iconBg,
  rightElement,
  showChevron = false,
  onPress,
  isDestructive = false,
  showDivider = false,
  disabled = false,
  style,
}) => {
  const { tokens } = useTheme();

  const content = (
    <View style={[styles.container, style]}>
      {icon && (
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: iconBg || tokens.surfaceAlt,
            },
          ]}
        >
          {icon}
        </View>
      )}

      <View style={styles.textContainer}>
        <Text
          numberOfLines={1}
          style={[
            styles.title,
            {
              color: isDestructive ? tokens.danger : tokens.text,
            },
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[styles.subtitle, { color: tokens.textMuted }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.rightContainer}>
        {rightElement}
        {showChevron && (
          <ChevronRight
            size={18}
            color={tokens.textMuted}
            style={styles.chevron}
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.outerWrapper}>
      {onPress ? (
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.65}
        >
          {content}
        </TouchableOpacity>
      ) : (
        content
      )}

      {showDivider && (
        <View
          style={[
            styles.divider,
            {
              backgroundColor: tokens.border,
              marginLeft: icon ? 56 : spacing.md,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 4,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chevron: {
    marginLeft: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
