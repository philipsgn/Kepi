import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Camera, Send } from 'lucide-react-native';
import { PixelIconCameraMini, PixelIconSend } from '../pixel/PixelIcons';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { useBottomInset } from '../../hooks/useBottomInset';

interface ChatInputBarProps {
  onSendMessage: (text: string) => void;
  onPickImage?: () => void;
  isThinking?: boolean;
}

/**
 * Thanh nhập liệu trang Chat — Phong cách "Ấm, tĩnh, sang"
 * - Dạng viên thuốc thanh thoát tokens.surfaceAlt, viền hairline 1px tokens.border.
 * - Nút Gửi tròn mềm mại màu vàng ấm tokens.primary.
 * - Đã loại bỏ hoàn toàn tính năng Voice để tối ưu tốc độ & không cần quyền Micro.
 */
export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  onPickImage,
  isThinking = false,
}) => {
  const { tokens, mode } = useTheme();
  // Quyết định 144: Cố định 100% Neo-Brutalist Pixel Art cho Tab Giải Trí độc lập với Theme máy
  const isHeocon = true;
  const { bottomInset, insets } = useBottomInset();
  const [inputText, setInputText] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isThinking) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSendMessage(trimmed);
    setInputText('');
    Keyboard.dismiss();
  };

  const hasText = inputText.trim().length > 0;
  const currentBottomPadding = isKeyboardVisible
    ? (Platform.OS === 'ios' ? 10 : 8)
    : Math.max(insets.bottom, 10);

  return (
    <View
      style={[
        styles.container,
        isHeocon
          ? {
              backgroundColor: mode === 'pink' ? '#FFF5F7' : '#F6EEDC',
              borderTopWidth: 0,
              paddingBottom: currentBottomPadding,
            }
          : {
              backgroundColor: tokens.bg || tokens.surface,
              borderTopWidth: 0,
              paddingBottom: currentBottomPadding,
            },
      ]}
    >
      <View style={styles.inputRow}>
        {/* NÚT ĐÍNH KÈM ẢNH HÓA ĐƠN / MÓN ĐỒ */}
        {onPickImage && (
          <TouchableOpacity
            style={[
              styles.attachButton,
              isHeocon && {
                backgroundColor: '#FFFBF1',
                borderWidth: 2,
                borderColor: '#2B2118',
                borderRadius: 999,
                width: 42,
                height: 42,
                shadowColor: '#2B2118',
                shadowOffset: { width: 0, height: 1.5 },
                shadowOpacity: 1,
                shadowRadius: 0,
                elevation: 2,
              },
            ]}
            onPress={onPickImage}
            activeOpacity={0.75}
            disabled={isThinking}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <PixelIconCameraMini size={18} />
          </TouchableOpacity>
        )}

        {/* TEXT INPUT FIELD VIÊN THUỐC */}
        <TextInput
          style={[
            styles.textInput,
            isHeocon
              ? {
                  backgroundColor: '#FFFBF1',
                  borderColor: '#2B2118',
                  borderWidth: 2.5,
                  color: '#2B2118',
                  fontFamily: 'Nunito',
                  fontWeight: '700',
                }
              : {
                  backgroundColor: tokens.surfaceAlt,
                  borderColor: tokens.border,
                  color: tokens.text,
                },
          ]}
          placeholder="Nói chuyện với Heo AI"
          placeholderTextColor={isHeocon ? '#85735E' : tokens.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline={false}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          editable={!isThinking}
        />

        {/* NÚT GỬI */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            isHeocon
              ? {
                  backgroundColor: hasText ? '#F4B93B' : '#EADFC7',
                  borderColor: '#2B2118',
                  borderWidth: 2.5,
                  shadowColor: '#2B2118',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: hasText ? 1 : 0,
                  shadowRadius: 0,
                  elevation: hasText ? 2 : 0,
                }
              : {
                  backgroundColor: hasText ? tokens.primary : tokens.surfaceAlt,
                  borderColor: tokens.border,
                },
            (!hasText || isThinking) && styles.buttonDisabled,
          ]}
          onPress={handleSend}
          disabled={!hasText || isThinking}
          activeOpacity={0.8}
        >
          <Send size={18} color="#2B2118" strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attachButton: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: 18,
    fontSize: 14.5,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
