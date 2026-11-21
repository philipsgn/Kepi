import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sparkles, Users } from 'lucide-react-native';
import { Strings } from '../../constants/strings';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { PixelIconPigCoach, PixelIconSquad } from '../pixel/PixelIcons';

export type ChatTab = 'COACH' | 'FRIENDS';

interface ChatTopSegmentHeaderProps {
  activeTab: ChatTab;
  onSelectTab: (tab: ChatTab) => void;
}

/**
 * Thanh chuyển 2 ngăn [ Anh Minh ] | [ Bạn bè ] ở đầu trang Chat — Phong cách "Ấm, tĩnh, sang"
 * Tuân thủ mục 2.1 của đặc tả docs/screens/CHAT.md:
 * - Dạng viên thuốc 999px mềm mại, viền hairline 1px tokens.border.
 * - Active pill màu vàng ấm tokens.primary, chữ tối tương phản cao.
 * - Không bóng đổ đen cứng, không hiệu ứng giật cấp.
 */
export const ChatTopSegmentHeader: React.FC<ChatTopSegmentHeaderProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const { tokens, mode } = useTheme();
  const isHeocon = mode === 'heocon' || !mode;

  const handleSelect = (tab: ChatTab) => {
    if (tab !== activeTab) {
      Haptics.selectionAsync();
      onSelectTab(tab);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isHeocon ? '#F6EEDC' : tokens.bg,
          borderBottomColor: isHeocon ? '#2B2118' : tokens.border,
          borderBottomWidth: isHeocon ? 2 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.segmentTrack,
          isHeocon
            ? {
                backgroundColor: '#FFFBF1',
                borderColor: '#2B2118',
                borderWidth: 3,
                shadowColor: '#2B2118',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 3,
              }
            : { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border },
        ]}
      >
        {/* Ngăn 1: Anh Minh AI */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSelect('COACH')}
          style={[
            styles.segmentBtn,
            activeTab === 'COACH' &&
              (isHeocon
                ? {
                    backgroundColor: '#F4B93B',
                    borderWidth: 2,
                    borderColor: '#2B2118',
                    borderRadius: radii.full,
                  }
                : [styles.segmentBtnActive, { backgroundColor: tokens.primary }]),
          ]}
        >
          {isHeocon ? (
            <PixelIconPigCoach size={18} />
          ) : (
            <Sparkles
              size={14}
              color={activeTab === 'COACH' ? '#1B2733' : tokens.textMuted}
              strokeWidth={2.4}
            />
          )}
          <Text
            style={[
              styles.segmentText,
              {
                color: isHeocon ? '#2B2118' : activeTab === 'COACH' ? '#1B2733' : tokens.textMuted,
                fontWeight: activeTab === 'COACH' ? '800' : '600',
              },
            ]}
          >
            {Strings.chat.coachTab}
          </Text>
        </TouchableOpacity>

        {/* Ngăn 2: Bạn bè */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSelect('FRIENDS')}
          style={[
            styles.segmentBtn,
            activeTab === 'FRIENDS' &&
              (isHeocon
                ? {
                    backgroundColor: '#F4B93B',
                    borderWidth: 2,
                    borderColor: '#2B2118',
                    borderRadius: radii.full,
                  }
                : [styles.segmentBtnActive, { backgroundColor: tokens.primary }]),
          ]}
        >
          {isHeocon ? (
            <PixelIconSquad size={18} />
          ) : (
            <Users
              size={14}
              color={activeTab === 'FRIENDS' ? '#1B2733' : tokens.textMuted}
              strokeWidth={2.2}
            />
          )}
          <Text
            style={[
              styles.segmentText,
              {
                color: isHeocon ? '#2B2118' : activeTab === 'FRIENDS' ? '#1B2733' : tokens.textMuted,
                fontWeight: activeTab === 'FRIENDS' ? '800' : '600',
              },
            ]}
          >
            {Strings.chat.friendsTab}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: radii.full,
    borderWidth: 1,
    padding: 3,
    width: '100%',
    maxWidth: 320,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radii.full,
    gap: 6,
  },
  segmentBtnActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
