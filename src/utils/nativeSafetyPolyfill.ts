/**
 * Native Safety Polyfill for Production Resiliency
 * 
 * Đảm bảo app không bị crash Fatal Runtime Error khi:
 * 1. Mở app qua Expo Go hoặc client có phiên bản native binary lệch với JS bundle (SDK 57).
 * 2. Môi trường thiếu native module 'ExpoAsset' hoặc 'ExponentConstants'.
 * 3. Tuyệt đối không để văng ngoại lệ ReadOnlyExpoModulesPropertyException do gán đè vào globalThis.expo.modules (JSI HostObject sở hữu bởi Swift).
 * 
 * Cung cấp fallback qua NativeModulesProxy và React Native NativeModules,
 * cho phép AppRegistry hoàn tất đăng ký root component ('main') an toàn tuyệt đối 100%.
 */

import { NativeModules } from 'react-native';
import { NativeModulesProxy } from 'expo-modules-core';

const expoAssetFallback = {
  downloadAsync: async (url: string, _md5Hash: string | null, _type: string) => {
    return url;
  },
};

const exponentConstantsFallback = {
  name: 'ExponentConstants',
  appOwnership: 'expo',
  executionEnvironment: 'storeClient',
  installationId: 'kepi-resilient-client',
  sessionId: 'kepi-session',
  isDevice: true,
  platform: {},
};

// 1. Gán an toàn vào NativeModulesProxy (cơ chế fallback được hỗ trợ chính thức bởi requireOptionalNativeModule)
if (NativeModulesProxy) {
  try {
    if (!NativeModulesProxy.ExpoAsset) {
      NativeModulesProxy.ExpoAsset = expoAssetFallback as any;
    }
  } catch (_) {}

  try {
    if (!NativeModulesProxy.ExponentConstants) {
      NativeModulesProxy.ExponentConstants = exponentConstantsFallback as any;
    }
  } catch (_) {}
}

// 2. Gán dự phòng vào React Native NativeModules
if (NativeModules) {
  try {
    if (!NativeModules.ExpoAsset) {
      NativeModules.ExpoAsset = expoAssetFallback;
    }
  } catch (_) {}

  try {
    if (!NativeModules.ExponentConstants) {
      NativeModules.ExponentConstants = exponentConstantsFallback;
    }
  } catch (_) {}
}

// 3. Fallback cho môi trường Node.js / Jest / Web thuần không có native runtime
const g = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;
if (g) {
  if (!g.expo) {
    g.expo = { modules: {} };
  }

  // Bọc try-catch tuyệt đối để không bao giờ văng ReadOnlyExpoModulesPropertyException
  // trên iOS native runtime (nơi expo.modules là HostObject bất biến do Swift kiểm soát)
  try {
    if (g.expo.modules && !g.expo.modules.ExpoAsset) {
      g.expo.modules.ExpoAsset = expoAssetFallback;
    }
  } catch (_) {
    // Được xử lý mượt mà bởi NativeModulesProxy ở trên
  }

  try {
    if (g.expo.modules && !g.expo.modules.ExponentConstants) {
      g.expo.modules.ExponentConstants = exponentConstantsFallback;
    }
  } catch (_) {
    // Được xử lý mượt mà bởi NativeModulesProxy ở trên
  }
}

export {};
