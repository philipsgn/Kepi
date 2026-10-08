import { useCameraPermissions } from 'expo-camera';
import * as Linking from 'expo-linking';

export function useAppPermissions() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const openAppSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (err) {
      console.warn('[Permissions] Failed to open system settings:', err);
    }
  };

  const hasAllPermissions = !!cameraPermission?.granted;

  return {
    cameraGranted: !!cameraPermission?.granted,
    canAskCameraAgain: cameraPermission?.canAskAgain ?? true,
    hasAllPermissions,
    requestCameraPermission,
    openAppSettings,
  };
}

