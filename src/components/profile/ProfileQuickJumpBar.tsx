import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Coins, Target, FolderTree, Palette } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

export type ProfileSectionKey = 'plan' | 'goals' | 'cats' | 'theme';

interface ProfileQuickJumpBarProps {
  onJumpToSection?: (section: ProfileSectionKey) => void;
  onNavigateToHub?: () => void;
}

export const ProfileQuickJumpBar: React.FC<ProfileQuickJumpBarProps> = ({
  onJumpToSection,
}) => {
  const { tokens, mode } = useTheme();
  const isPink = mode === 'pink';

  const handleJump = (sec: ProfileSectionKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onJumpToSection?.(sec);
  };

  const borderColor = isPink ? '#3B0713' : '#2B2118';
  const cardBg = isPink ? '#FFFFFF' : '#FFFBF1';
  const textColor = isPink ? '#3B0713' : '#2B2118';

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={[
            styles.chipBtn,
            {
              backgroundColor: cardBg,
              borderColor,
              shadowColor: borderColor,
            },
          ]}
          onPress={() => handleJump('plan')}
          activeOpacity={0.8}
        >
          <Coins size={14} color={textColor} strokeWidth={2.6} />
          <Text style={[styles.chipText, { color: textColor }]}>Ngân sách</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chipBtn,
            {
              backgroundColor: cardBg,
              borderColor,
              shadowColor: borderColor,
            },
          ]}
          onPress={() => handleJump('goals')}
          activeOpacity={0.8}
        >
          <Target size={14} color={textColor} strokeWidth={2.6} />
          <Text style={[styles.chipText, { color: textColor }]}>Mục tiêu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chipBtn,
            {
              backgroundColor: cardBg,
              borderColor,
              shadowColor: borderColor,
            },
          ]}
          onPress={() => handleJump('cats')}
          activeOpacity={0.8}
        >
          <FolderTree size={14} color={textColor} strokeWidth={2.6} />
          <Text style={[styles.chipText, { color: textColor }]}>Danh mục</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chipBtn,
            {
              backgroundColor: cardBg,
              borderColor,
              shadowColor: borderColor,
            },
          ]}
          onPress={() => handleJump('theme')}
          activeOpacity={0.8}
        >
          <Palette size={14} color={textColor} strokeWidth={2.6} />
          <Text style={[styles.chipText, { color: textColor }]}>Giao diện</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  chipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5.5,
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  chipText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 12.5,
  },
});
