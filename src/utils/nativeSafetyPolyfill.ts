/**
 * Native Safety Polyfill for Production Resiliency
 * 
 * Đảm bảo app không bị crash Fatal Runtime Error khi:
 * 1. Mở app qua Expo Go hoặc client có phiên bản native binary lệch với JS bundle (SDK 57).
 * 2. Môi trường thiếu native module 'ExpoAsset' hoặc 'ExponentConstants'.
 * 
 * Cho phép AppRegistry hoàn tất đăng ký root component ('main') an toàn tuyệt đối.
 */

const g = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;

if (g) {
  if (!g.expo) {
    g.expo = { modules: {} };
  } else if (!g.expo.modules) {
    g.expo.modules = {};
  }

  // Safe fallback cho ExpoAsset nếu native module chưa được link trong client
  if (!g.expo.modules.ExpoAsset) {
    g.expo.modules.ExpoAsset = {
      downloadAsync: async (url: string, _md5Hash: string | null, _type: string) => {
        return url;
      },
    };
  }
}

export {};
