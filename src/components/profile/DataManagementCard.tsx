import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AlertTriangle, Database, LogOut, Trash2, UserX, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Strings } from '../../constants/strings';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

interface DataManagementCardProps {
  onResetAllData: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
  onSignOut: () => void;
  appVersion?: string;
}

export const DataManagementCard: React.FC<DataManagementCardProps> = ({
  onResetAllData,
  onDeleteAccount,
  onSignOut,
  appVersion = '1.0.0',
}) => {
  const { tokens } = useTheme();
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');

  const handleOpenResetModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConfirmInput('');
    setShowResetModal(true);
  };

  const handleConfirmReset = async () => {
    if (confirmInput.trim().toUpperCase() !== 'XÓA') {
      Alert.alert('Chưa đúng cú pháp', 'Vui lòng gõ đúng chữ "XÓA" để xác nhận.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setShowResetModal(false);
    await onResetAllData();
  };

  const handleDeleteAccountPress = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      Strings.profile.deleteAccountConfirmTitle,
      Strings.profile.deleteAccountConfirmDesc,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa vĩnh viễn',
          style: 'destructive',
          onPress: async () => {
            await onDeleteAccount();
          },
        },
      ]
    );
  };

  const handleSignOutPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: onSignOut,
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
      {/* 1. TIÊU ĐỀ KHỐI */}
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}>
          <Database size={15} color={tokens.primary} strokeWidth={2.4} />
        </View>
        <Text style={[styles.sectionTitle, { color: tokens.text }]}>{Strings.profile.dataSectionTitle}</Text>
      </View>

      <View style={styles.actionsList}>
        {/* NÚT 1: XÓA TOÀN BỘ DỮ LIỆU */}
        <TouchableOpacity
          style={[styles.actionBtn, { borderBottomColor: tokens.border }]}
          onPress={handleOpenResetModal}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: tokens.surfaceAlt }]}>
            <Trash2 size={15} color={tokens.warning} />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={[styles.actionTitle, { color: tokens.text }]}>{Strings.profile.resetAllData}</Text>
            <Text style={[styles.actionSub, { color: tokens.textMuted }]}>
              Đặt lại toàn bộ nhật ký chi tiêu và ngân sách về ban đầu
            </Text>
          </View>
        </TouchableOpacity>

        {/* NÚT 2: XÓA TÀI KHOẢN VĨNH VIỄN */}
        <TouchableOpacity
          style={[styles.actionBtn, { borderBottomColor: tokens.border }]}
          onPress={handleDeleteAccountPress}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: tokens.surfaceAlt }]}>
            <UserX size={15} color={tokens.danger} />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={[styles.actionTitle, { color: tokens.danger }]}>
              {Strings.profile.deleteAccount}
            </Text>
            <Text style={[styles.actionSub, { color: tokens.textMuted }]}>
              Xóa hoàn toàn tài khoản và dữ liệu cá nhân theo quy định Apple
            </Text>
          </View>
        </TouchableOpacity>

        {/* NÚT 3: ĐĂNG XUẤT */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleSignOutPress}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: tokens.surfaceAlt }]}>
            <LogOut size={15} color={tokens.textMuted} />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={[styles.actionTitle, { color: tokens.text }]}>{Strings.profile.signOut}</Text>
            <Text style={[styles.actionSub, { color: tokens.textMuted }]}>
              Rời khỏi tài khoản trên thiết bị này
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={[styles.versionText, { color: tokens.textMuted }]}>
        Ví Locket v{appVersion}
      </Text>

      {/* MODAL XÁC NHẬN XÓA TOÀN BỘ DỮ LIỆU */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.warnIconBox, { backgroundColor: tokens.surfaceAlt }]}>
                <AlertTriangle size={20} color={tokens.danger} />
              </View>
              <Text style={[styles.modalTitle, { color: tokens.text }]}>Xác Nhận Đặt Lại</Text>
            </View>

            <Text style={[styles.modalDesc, { color: tokens.textSub }]}>
              Toàn bộ lịch sử chi tiêu, ảnh chụp và mục tiêu sẽ bị xóa vĩnh viễn khỏi thiết bị này.
            </Text>

            <Text style={[styles.inputGuide, { color: tokens.textMuted }]}>
              Nhập chữ <Text style={{ color: tokens.danger, fontWeight: '800' }}>XÓA</Text> để xác nhận:
            </Text>

            <TextInput
              style={[
                styles.confirmInput,
                {
                  backgroundColor: tokens.surfaceAlt,
                  borderColor: tokens.border,
                  color: tokens.text,
                },
              ]}
              value={confirmInput}
              onChangeText={setConfirmInput}
              placeholder="XÓA"
              placeholderTextColor={tokens.textMuted}
              autoCapitalize="characters"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { backgroundColor: tokens.surfaceAlt, borderColor: tokens.border }]}
                onPress={() => setShowResetModal(false)}
              >
                <Text style={[styles.cancelBtnText, { color: tokens.textSub }]}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: tokens.danger }]}
                onPress={handleConfirmReset}
              >
                <Text style={styles.confirmBtnText}>Xác nhận xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionsList: {
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  actionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  actionSub: {
    fontSize: 11.5,
    fontWeight: '400',
    marginTop: 2,
  },
  versionText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  warnIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  inputGuide: {
    fontSize: 12,
    marginBottom: 6,
  },
  confirmInput: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 16,
  },
  modalActions: {
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
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
