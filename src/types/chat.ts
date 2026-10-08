export type ChatSender = 'USER' | 'COACH';

export type ChatCardType = 'NONE' | 'METRIC' | 'CONFIRMATION' | 'ACTUAL_PRICE';

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  photoUrl?: string | null;
  cardType?: ChatCardType;
  cardData?: any;
  createdAt: string;
}
