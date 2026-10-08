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
  const { tokens } = useTheme();

  const handleSelect = (tab: ChatTab) => {
    if (tab !== activeTab) {
      Haptics.selectionAsync();
      onSelectTab(tab);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg, borderBottomColor: tokens.border }]}>
      <View style={[styles.segmentTrack, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
        {/* Ngăn 1: Anh Minh AI */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleSelect('COACH')}
          style={[
            styles.segmentBtn,
            activeTab === 'COACH' && [styles.segmentBtnActive, { backgroundColor: tokens.primary }],
          ]}
        >
          <Sparkles
            size={14}
            color={activeTab === 'COACH' ? '#1B2733' : tokens.textMuted}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.segmentText,
              { color: activeTab === 'COACH' ? '#1B2733' : tokens.textMuted },
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
            activeTab === 'FRIENDS' && [styles.segmentBtnActive, { backgroundColor: tokens.primary }],
          ]}
        >
          <Users
            size={14}
            color={activeTab === 'FRIENDS' ? '#1B2733' : tokens.textMuted}
            strokeWidth={2.2}
          />
          <Text
            style={[
              styles.segmentText,
              { color: activeTab === 'FRIENDS' ? '#1B2733' : tokens.textMuted },
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
