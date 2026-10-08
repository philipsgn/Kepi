import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { ChatMessage } from '../../types/chat';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

interface UserMessageBubbleProps {
  message: ChatMessage;
}

/**
 * Bong bóng tin nhắn từ Người dùng trong trang Chat — Phong cách "Ấm, tĩnh, sang"
 * Tuân thủ mục 2.1 của đặc tả docs/screens/CHAT.md:
 * - Căn phải, nền vàng ấm tokens.primary, chữ tối tương phản cao, bo góc 16px.
 */
export const UserMessageBubble: React.FC<UserMessageBubbleProps> = ({ message }) => {
  const { tokens } = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.bubbleCol}>
        <View style={[styles.bubble, { backgroundColor: tokens.primary }]}>
          {message.photoUrl ? (
            <Image
              source={{ uri: message.photoUrl }}
              style={styles.attachedPhoto}
              contentFit="cover"
              cachePolicy="disk"
            />
          ) : null}

          {message.text ? (
            <Text style={styles.messageText}>{message.text}</Text>
          ) : null}
        </View>

        <Text style={[styles.timeText, { color: tokens.textMuted }]}>
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 5,
    paddingHorizontal: 16,
  },
  bubbleCol: {
    maxWidth: '78%',
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: radii.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  attachedPhoto: {
    width: 180,
    height: 120,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  messageText: {
    color: '#1B2733',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 3,
    marginRight: 4,
  },
});
