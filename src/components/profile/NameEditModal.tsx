import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Check, User, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Strings } from '../../constants/strings';
import { useTheme } from '../../theme/ThemeContext';

interface NameEditModalProps {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

export const NameEditModal: React.FC<NameEditModalProps> = ({
  visible,
  currentName,
  onClose,
  onSave,
}) => {
  const { mode } = useTheme();
  const isPink = mode === 'pink';
  const inkBorder = isPink ? '#3B0713' : '#2B2118';
  const cardBg = isPink ? '#FFF5F7' : '#F6EEDC';
  const badgeBg = isPink ? '#FCE7F3' : '#FFF4CC';
  const inputBg = isPink ? '#FFFFFF' : '#FFFBF1';
  const saveBtnBg = isPink ? '#F43F5E' : '#F4B93B';
  const saveBtnText = isPink ? '#FFFFFF' : '#2B2118';

  const [name, setName] = useState(currentName);

  React.useEffect(() => {
    if (visible) {
      setName(currentName);
    }
  }, [visible, currentName]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave(trimmed);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: cardBg,
              borderColor: inkBorder,
              borderWidth: 3,
              borderRadius: 22,
              shadowColor: inkBorder,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              elevation: 4,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: badgeBg,
                    borderColor: inkBorder,
                    borderWidth: 2,
                  },
                ]}
              >
                <User size={18} color={inkBorder} strokeWidth={2.6} />
              </View>
              <Text
                style={[
                  styles.modalTitle,
                  {
                    color: inkBorder,
                    fontFamily: 'Baloo2_800ExtraBold',
                    fontWeight: '800',
                  },
                ]}
              >
                {Strings.profile.editNameTitle}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.closeBtn,
                {
                  backgroundColor: badgeBg,
                  borderColor: inkBorder,
                  borderWidth: 2,
                },
              ]}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
              accessibilityLabel="Đóng modal"
            >
              <X size={16} color={inkBorder} strokeWidth={2.6} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: inputBg,
                borderColor: inkBorder,
                borderWidth: 2.5,
                borderRadius: 14,
                color: inkBorder,
                fontFamily: 'Nunito',
                fontWeight: '700',
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder={Strings.profile.namePlaceholder}
            placeholderTextColor={isPink ? '#9D7B84' : '#8C7A6B'}
            autoFocus
          />

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                {
                  backgroundColor: isPink ? '#FFFFFF' : '#FFFBF1',
                  borderColor: inkBorder,
                  borderWidth: 2,
                  borderRadius: 14,
                },
              ]}
              onPress={onClose}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.cancelText,
                  {
                    color: inkBorder,
                    fontFamily: 'Baloo2_800ExtraBold',
                    fontWeight: '800',
                  },
                ]}
              >
                Hủy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor: saveBtnBg,
                  borderColor: inkBorder,
                  borderWidth: 2.5,
                  borderRadius: 14,
                  shadowColor: inkBorder,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 1,
                  shadowRadius: 0,
                  elevation: 2,
                },
                !name.trim() && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!name.trim()}
              activeOpacity={0.8}
            >
              <Check size={16} color={saveBtnText} strokeWidth={2.8} />
              <Text
                style={[
                  styles.saveText,
                  {
                    color: saveBtnText,
                    fontFamily: 'Baloo2_800ExtraBold',
                    fontWeight: '800',
                  },
                ]}
              >
                Lưu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 48,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 18,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 14,
  },
});
