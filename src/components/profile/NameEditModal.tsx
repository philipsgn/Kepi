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
import { radii } from '../../theme/tokens';

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
  const { tokens } = useTheme();
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
        <View style={[styles.modalCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.iconBox, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
                <User size={15} color={tokens.primary} strokeWidth={2.4} />
              </View>
              <Text style={[styles.modalTitle, { color: tokens.text }]}>{Strings.profile.editNameTitle}</Text>
            </View>

            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
              onPress={onClose}
            >
              <X size={15} color={tokens.textMuted} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: tokens.surfaceAlt,
                borderColor: tokens.border,
                color: tokens.text,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder={Strings.profile.namePlaceholder}
            placeholderTextColor={tokens.textMuted}
            autoFocus
          />

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelText, { color: tokens.textSub }]}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                { backgroundColor: tokens.primary },
                !name.trim() && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={!name.trim()}
              activeOpacity={0.8}
            >
              <Check size={14} color="#1B2733" strokeWidth={2.6} />
              <Text style={styles.saveText}>Lưu</Text>
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
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 18,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveText: {
    color: '#1B2733',
    fontSize: 13,
    fontWeight: '700',
  },
});
