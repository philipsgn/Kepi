import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Strings } from '../../constants/strings';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';
import { useBottomInset } from '../../hooks/useBottomInset';

interface ChatInputBarProps {
  onSendMessage: (text: string) => void;
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
  isThinking = false,
}) => {
  const { tokens } = useTheme();
  const { bottomInset } = useBottomInset();
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
    : bottomInset + 8;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.surface,
          borderTopColor: tokens.border,
          paddingBottom: currentBottomPadding,
        },
      ]}
    >
      <View style={styles.inputRow}>
        {/* TEXT INPUT FIELD VIÊN THUỐC */}
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: tokens.surfaceAlt,
              borderColor: tokens.border,
              color: tokens.text,
            },
          ]}
          placeholder={Strings.chat.inputPlaceholder}
          placeholderTextColor={tokens.textMuted}
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
            {
              backgroundColor: hasText ? tokens.primary : tokens.surfaceAlt,
              borderColor: tokens.border,
            },
            (!hasText || isThinking) && styles.buttonDisabled,
          ]}
          onPress={handleSend}
          disabled={!hasText || isThinking}
          activeOpacity={0.8}
        >
          <Send
            size={18}
            color={hasText ? '#1B2733' : tokens.textMuted}
            strokeWidth={2.2}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
