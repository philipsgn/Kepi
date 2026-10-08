import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { BorderRadius, Shadows } from '../../constants/layout';
import { MinhExpression } from '../../store/minhCoachStore';

interface MinhAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  expression?: MinhExpression;
  style?: ViewStyle;
}

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
        return Colors.accentGold;
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
      <Image
        source={require('../../../assets/coach_minh_signature.png')}
        style={[
          styles.avatarImage,
          {
            width: dim - 4,
            height: dim - 4,
            borderRadius: (dim - 4) / 2,
          },
        ]}
        resizeMode="cover"
      />
    </View>
  );
};

// Alias tương thích ngược cho các component gọi MinhAvatar3D
export const MinhAvatar3D = MinhAvatar;

const styles = StyleSheet.create({
  avatarContainer: {
    borderWidth: 2,
    backgroundColor: '#FDBB76',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Shadows.chunky3D,
  },
  avatarImage: {
    backgroundColor: '#F89B77',
  },
});
