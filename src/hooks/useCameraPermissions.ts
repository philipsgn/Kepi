import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCameraPermissions } from 'expo-camera';
import * as Linking from 'expo-linking';

export const STORAGE_KEY_CAMERA_APP_ENABLED = 'vi_locket_camera_app_enabled_v1';

let cachedCameraAppEnabled: boolean | null = null;
const cameraToggleListeners = new Set<(val: boolean) => void>();

export async function getCameraAppEnabled(): Promise<boolean> {
  if (cachedCameraAppEnabled !== null) return cachedCameraAppEnabled;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_CAMERA_APP_ENABLED);
    cachedCameraAppEnabled = raw === null ? true : raw === 'true';
    return cachedCameraAppEnabled;
  } catch {
    return true;
  }
}

export async function setCameraAppEnabled(enabled: boolean): Promise<void> {
  cachedCameraAppEnabled = enabled;
  cameraToggleListeners.forEach((fn) => fn(enabled));
  try {
    await AsyncStorage.setItem(STORAGE_KEY_CAMERA_APP_ENABLED, String(enabled));
  } catch {}
}

export function useAppPermissions() {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraAppEnabled, setCameraAppEnabledState] = useState<boolean>(
    cachedCameraAppEnabled !== null ? cachedCameraAppEnabled : true
  );

  useEffect(() => {
    getCameraAppEnabled().then((val) => setCameraAppEnabledState(val));
    const listener = (val: boolean) => setCameraAppEnabledState(val);
    cameraToggleListeners.add(listener);
    return () => {
      cameraToggleListeners.delete(listener);
    };
  }, []);

  const updateCameraAppEnabled = useCallback(async (enabled: boolean) => {
    setCameraAppEnabledState(enabled);
    await setCameraAppEnabled(enabled);
  }, []);

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
    cameraAppEnabled,
    setCameraAppEnabledState: updateCameraAppEnabled,
    canAskCameraAgain: cameraPermission?.canAskAgain ?? true,
    hasAllPermissions,
    requestCameraPermission,
    openAppSettings,
  };
}

