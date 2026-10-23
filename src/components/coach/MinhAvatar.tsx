import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { MinhExpression } from '../../store/minhCoachStore';
import { PigBoMascot } from '../mascot/PigBoMascot';

interface MinhAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  expression?: MinhExpression;
  style?: ViewStyle;
}

/**
 * AVATAR CỐ VẤN CHÚ HEO PIGFLY (3D Clay Chibi Trắng Sứ / Kính Vàng Thông Thái)
 */
export const MinhAvatar: React.FC<MinhAvatarProps> = ({
  size = 'md',
  expression = 'NEUTRAL',
  style,
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return 38;
      case 'lg':
        return 84;
      case 'hero':
        return 110;
      case 'md':
      default:
        return 56;
    }
  };

  const dim = getDimensions();

  // Xác định màu viền theo trạng thái biểu cảm
  const getBorderColor = () => {
    switch (expression) {
      case 'SMILING':
        return Colors.incomeMint;
      case 'SKEPTICAL_TREND':
      case 'SHOCKED':
        return Colors.expenseCoral;
      case 'NEUTRAL':
      default:
        return '#0D9488';
    }
  };

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          borderColor: getBorderColor(),
        },
        style,
      ]}
    >
      <PigBoMascot pose="wise" size={dim * 0.92} />
    </View>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
});
