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
import { Cloud, Download, ShieldCheck, Upload, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { exportAppDataAsync, restoreAppDataAsync } from '../../services/dataBackupService';
import { useTheme } from '../../theme/ThemeContext';
import { radii } from '../../theme/tokens';

export const DataBackupCard: React.FC = () => {
  const { tokens, isDark } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  const handleExport = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExporting(true);
    const res = await exportAppDataAsync();
    setIsExporting(false);

    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Sao lưu thành công',
        'File dữ liệu JSON của bạn đã sẵn sàng để lưu trữ hoặc chia sẻ qua Google Drive, Zalo, Files.'
      );
    } else {
      Alert.alert('Lỗi sao lưu', res.error || 'Không thể xuất file sao lưu lúc này.');
    }
  };

  const handleConfirmRestore = async () => {
    if (!importText.trim()) {
      Alert.alert('Nhập dữ liệu', 'Vui lòng dán nội dung file JSON sao lưu.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRestoring(true);
    const res = await restoreAppDataAsync(importText.trim());
    setIsRestoring(false);

    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowImportModal(false);
      setImportText('');
      Alert.alert(
        'Khôi phục thành công',
        `Đã khôi phục hoàn tất ${res.count || 0} giao dịch và toàn bộ thiết lập ngân sách.`
      );
    } else {
      Alert.alert('Khôi phục thất bại', res.error || 'Dữ liệu sao lưu không đúng định dạng.');
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. HERO GIỚI THIỆU */}
      <View style={styles.headerRow}>
        <Cloud size={24} color="#E59844" strokeWidth={2.8} />
        <View style={styles.headerTextCol}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
            Sao Lưu & Khôi Phục Dữ Liệu
          </Text>
          <Text style={[styles.sectionSub, { color: tokens.textMuted }]}>
            Lưu trữ offline tự chủ 100%, bảo mật tuyệt đối không rò rỉ STK
          </Text>
        </View>
      </View>

      {/* 2. NÚT XUẤT SAO LƯU */}
      <TouchableOpacity
        style={[
          styles.actionCard,
          {
            backgroundColor: isDark ? '#162231' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(229, 152, 68, 0.16)',
          },
        ]}
        onPress={handleExport}
        disabled={isExporting}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeft}>
          <View style={styles.iconContainerFloating}>
            <Download size={22} color="#10B981" strokeWidth={2.6} />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={[styles.actionTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
              {isExporting ? 'Đang chuẩn bị file...' : 'Xuất file sao lưu (JSON)'}
            </Text>
            <Text style={[styles.actionDesc, { color: tokens.textMuted }]}>
              Đóng gói toàn bộ nhật ký chi tiêu và ngân sách để lưu vào máy hoặc Drive
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 3. NÚT KHÔI PHỤC DỮ LIỆU */}
      <TouchableOpacity
        style={[
          styles.actionCard,
          {
            backgroundColor: isDark ? '#162231' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(229, 152, 68, 0.16)',
            marginTop: 12,
          },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowImportModal(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.actionLeft}>
          <View style={styles.iconContainerFloating}>
            <Upload size={22} color="#E59844" strokeWidth={2.6} />
          </View>
          <View style={styles.actionTextCol}>
            <Text style={[styles.actionTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
              Khôi phục từ file sao lưu
            </Text>
            <Text style={[styles.actionDesc, { color: tokens.textMuted }]}>
              Phục hồi dữ liệu khi bạn đổi sang điện thoại mới
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 4. CHỨNG NHẬN BẢO MẬT */}
      <View
        style={[
          styles.privacyBadge,
          { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(126, 159, 128, 0.12)' },
        ]}
      >
        <ShieldCheck size={16} color="#10B981" strokeWidth={2.4} />
        <Text style={[styles.privacyText, { color: tokens.textSub }]}>
          100% dữ liệu tài chính được lưu trữ an toàn trong vùng nhớ bảo mật trên thiết bị.
        </Text>
      </View>

      {/* MODAL DÁN JSON KHÔI PHỤC */}
      <Modal
        visible={showImportModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.importModalBox,
              { backgroundColor: isDark ? '#162231' : '#FFFFFF' },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FAF6EC' : '#1B2733' }]}>
                Dán dữ liệu sao lưu
              </Text>
              <TouchableOpacity
                onPress={() => setShowImportModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={tokens.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDesc, { color: tokens.textMuted }]}>
              Mở file sao lưu `.json` của bạn, sao chép toàn bộ văn bản và dán vào khung bên dưới:
            </Text>

            <TextInput
              style={[
                styles.jsonInput,
                {
                  color: isDark ? '#FAF6EC' : '#1B2733',
                  backgroundColor: isDark ? '#0E1620' : '#FAF6EC',
                  borderColor: tokens.border,
                },
              ]}
              multiline
              numberOfLines={6}
              placeholder='Dán nội dung JSON vào đây (ví dụ: {"version": 1, ...})'
              placeholderTextColor={tokens.textMuted}
              value={importText}
              onChangeText={setImportText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: tokens.border }]}
                onPress={() => setShowImportModal(false)}
              >
                <Text style={{ color: tokens.textMuted, fontWeight: '600' }}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.restoreBtn, { backgroundColor: tokens.primary }]}
                onPress={handleConfirmRestore}
                disabled={isRestoring}
              >
                <Text style={styles.restoreBtnText}>
                  {isRestoring ? 'Đang nạp...' : 'Khôi phục ngay'}
                </Text>
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
    paddingVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  actionCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: 14,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainerFloating: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  actionDesc: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 16,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    padding: 12,
    marginTop: 16,
    gap: 8,
  },
  privacyText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  importModalBox: {
    width: '100%',
    borderRadius: radii.xl,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalDesc: {
    fontSize: 12.5,
    marginBottom: 12,
    lineHeight: 17,
  },
  jsonInput: {
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  restoreBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radii.full,
  },
  restoreBtnText: {
    color: '#0E1620',
    fontWeight: '700',
    fontSize: 13,
  },
});
