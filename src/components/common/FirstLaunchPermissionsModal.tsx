import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Camera, MapPin } from 'lucide-react-native';
import { PixelIconCameraMini, PixelIconMapPin, PixelIconPigCoach } from '../pixel/PixelIcons';
import {
  requestLocationPermissionAsync,
  setLocationPinEnabled,
} from '../../services/locationService';

export const STORAGE_KEY_FIRST_PERMISSIONS_PROMPTED = 'vi_locket_first_permissions_prompted_v1';

export interface FirstLaunchPermissionsModalProps {
  visible: boolean;
  onRequestCameraPermission: () => Promise<any>;
  onComplete: () => void;
}

/**
 * Hộp thoại xin quyền Camera & Vị trí lần đầu vào App chuẩn Production (Quyết định 186).
 * - Phong cách Neo-Brutalist Heo Con (viền 3px nâu mực, bóng cứng 0-blur).
 * - Giải thích rõ lý do xin từng quyền trước khi bật hộp thoại hệ điều hành (iOS/Android).
 */
export const FirstLaunchPermissionsModal: React.FC<FirstLaunchPermissionsModalProps> = ({
  visible,
  onRequestCameraPermission,
  onComplete,
}) => {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleGrantPermissions = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await onRequestCameraPermission();
      const locStatus = await requestLocationPermissionAsync();
      await setLocationPinEnabled(locStatus.granted);
    } catch (_e) {
      // ignore OS prompt errors
    } finally {
      setIsRequesting(false);
      onComplete();
    }
  };

  const handleSkipForNow = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onComplete();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.headerBadge}>
            <PixelIconPigCoach size={28} />
            <Text style={styles.title}>Cho phép quyền truy cập</Text>
          </View>

          <Text style={styles.subtitle}>
            Để Ví Heo Con hoạt động đầy đủ ngay từ lần đầu, bạn có thể bật sẵn 2 quyền sau (luôn thay đổi được trong Cài đặt):
          </Text>

          <View style={styles.permList}>
            <View style={styles.permRow}>
              <View style={[styles.permIconBox, { backgroundColor: '#F9B8C4' }]}>
                <Camera size={20} color="#2B2118" strokeWidth={2.0} />
              </View>
              <View style={styles.permTextCol}>
                <Text style={styles.permTitle}>Máy ảnh (Camera)</Text>
                <Text style={styles.permDesc}>
                  Chụp ảnh món ăn, hóa đơn và quét mã VietQR tức thì.
                </Text>
              </View>
            </View>

            <View style={styles.permRow}>
              <View style={[styles.permIconBox, { backgroundColor: '#CDE6C4' }]}>
                <MapPin size={20} color="#2B2118" strokeWidth={2.0} />
              </View>
              <View style={styles.permTextCol}>
                <Text style={styles.permTitle}>Vị trí hiện tại (GPS)</Text>
                <Text style={styles.permDesc}>
                  Tự gắn tên đường, quận nơi bạn chi tiêu vào Quán Quen (không theo dõi nền).
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, isRequesting && styles.btnDisabled]}
            activeOpacity={0.85}
            onPress={handleGrantPermissions}
            disabled={isRequesting}
          >
            <Text style={styles.primaryBtnText}>
              {isRequesting ? 'Đang mở hộp thoại...' : 'Cho phép ngay'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.75}
            onPress={handleSkipForNow}
            disabled={isRequesting}
          >
            <Text style={styles.secondaryBtnText}>Để sau (chỉnh trong Cài đặt)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(43, 33, 24, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFBF1',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#2B2118',
    padding: 18,
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    gap: 12,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    flex: 1,
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 20,
    color: '#2B2118',
  },
  subtitle: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 18,
    color: '#6E5D4F',
  },
  permList: {
    gap: 10,
    marginVertical: 2,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2B2118',
    backgroundColor: '#F6EEDC',
  },
  permIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2B2118',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permTextCol: {
    flex: 1,
    gap: 2,
  },
  permTitle: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 14,
    color: '#2B2118',
  },
  permDesc: {
    fontFamily: 'Nunito_600SemiBold',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    color: '#6E5D4F',
  },
  primaryBtn: {
    height: 48,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#2B2118',
    backgroundColor: '#F4B93B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2B2118',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    fontFamily: 'Baloo2_800ExtraBold',
    fontWeight: '800',
    fontSize: 15,
    color: '#2B2118',
  },
  secondaryBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontWeight: '700',
    fontSize: 13,
    color: '#6E5D4F',
  },
});
