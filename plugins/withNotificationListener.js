const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo Config Plugin for Android NotificationListenerService
 * Tự động cấu hình AndroidManifest.xml để khai báo quyền và dịch vụ lắng nghe thông báo ngân hàng.
 * Hoạt động 100% on-device, opt-in minh bạch, bảo vệ quyền riêng tư tuyệt đối.
 */
function withNotificationListener(config) {
  return withAndroidManifest(config, async (manifestConfig) => {
    const androidManifest = manifestConfig.modResults;

    // 1. Đảm bảo quyền BIND_NOTIFICATION_LISTENER_SERVICE trong manifest
    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }
    const permissions = androidManifest.manifest['uses-permission'];
    const bindPerm = 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE';
    if (!permissions.some((p) => p.$?.['android:name'] === bindPerm)) {
      permissions.push({
        $: {
          'android:name': bindPerm,
        },
      });
    }

    // 2. Khai báo service trong thẻ application
    if (!androidManifest.manifest.application) {
      androidManifest.manifest.application = [{}];
    }
    const app = androidManifest.manifest.application[0];
    if (!app.service) {
      app.service = [];
    }

    const serviceName = '.services.KepiNotificationListenerService';
    const existing = app.service.find((s) => s.$?.['android:name'] === serviceName);
    if (!existing) {
      app.service.push({
        $: {
          'android:name': serviceName,
          'android:label': 'Kepi Notification Listener',
          'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.service.notification.NotificationListenerService',
                },
              },
            ],
          },
        ],
      });
    }

    return manifestConfig;
  });
}

module.exports = withNotificationListener;
