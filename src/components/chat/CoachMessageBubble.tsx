import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ChatMessage } from '../../types/chat';
import { MiniMetricCard } from './MiniMetricCard';
import { InlineConfirmationCard } from './InlineConfirmationCard';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

interface CoachMessageBubbleProps {
  message: ChatMessage;
  onNavigateToStats?: () => void;
  onConfirmRecord?: (data: any) => void;
  onCancelRecord?: (data: any) => void;
}

/**
 * Bong bóng tin nhắn từ Anh Minh (Cố vấn tĩnh tâm) — Phong cách "Ấm, tĩnh, sang"
 * Tuân thủ mục 2.1 của đặc tả docs/screens/CHAT.md:
 * - Avatar tròn 32px vàng ấm chữ "M".
 * - Nền bề mặt tokens.surface, viền hairline 1px tokens.border, bo góc 16px.
 * - Nhúng thẻ số liệu mini hoặc thẻ xác nhận nếu có.
 */
export const CoachMessageBubble: React.FC<CoachMessageBubbleProps> = ({
  message,
  onNavigateToStats,
  onConfirmRecord,
  onCancelRecord,
}) => {
  const { tokens } = useTheme();

  return (
    <View style={styles.wrapper}>
      {/* 1. AVATAR TRÒN CHỮ "M" */}
      <View style={[styles.avatarBox, { backgroundColor: tokens.primary, borderColor: tokens.border }]}>
        <Text style={styles.avatarText}>M</Text>
      </View>

      <View style={styles.bubbleCol}>
        <Text style={[styles.senderName, { color: tokens.textMuted }]}>Anh Minh</Text>

        <View style={[styles.bubble, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <Text style={[styles.messageText, { color: tokens.text }]}>{message.text}</Text>

          {/* 2. THẺ SỐ LIỆU MINI */}
          {message.cardType === 'METRIC' && message.cardData && (
            <MiniMetricCard
              title={message.cardData.title}
              amount={message.cardData.amount}
              percentage={message.cardData.percentage}
              category={message.cardData.category}
              onPress={() => {
                if (onNavigateToStats) onNavigateToStats();
              }}
            />
          )}

          {/* 3. THẺ XÁC NHẬN GHI SỔ INLINE */}
          {message.cardType === 'CONFIRMATION' && message.cardData && (
            <InlineConfirmationCard
              amount={message.cardData.amount}
              description={message.cardData.description}
              category={message.cardData.category}
              isSaved={message.cardData.isSaved}
              onConfirm={() => {
                if (onConfirmRecord) onConfirmRecord(message.cardData);
              }}
              onCancel={() => {
                if (onCancelRecord) onCancelRecord(message.cardData);
              }}
            />
          )}
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
    alignItems: 'flex-start',
    marginVertical: 6,
    paddingHorizontal: 16,
  },
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  avatarText: {
    color: '#1B2733',
    fontSize: 14,
    fontWeight: '800',
  },
  bubbleCol: {
    flex: 1,
    maxWidth: '82%',
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 2,
  },
  bubble: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 13,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '400',
  },
  timeText: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 4,
  },
});
