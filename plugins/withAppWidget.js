const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo Config Plugin for Android Native AppWidget (PigFly Quick Glance)
 * Tự động cấu hình AndroidManifest.xml để đăng ký AppWidgetProvider cho màn hình chính Android.
 */
function withAppWidget(config) {
  return withAndroidManifest(config, async (manifestConfig) => {
    const androidManifest = manifestConfig.modResults;

    if (!androidManifest.manifest.application) {
      androidManifest.manifest.application = [{}];
    }
    const app = androidManifest.manifest.application[0];
    if (!app.receiver) {
      app.receiver = [];
    }

    const receiverName = '.widget.PigFlyAppWidgetProvider';
    const existing = app.receiver.find((r) => r.$?.['android:name'] === receiverName);

    if (!existing) {
      app.receiver.push({
        $: {
          'android:name': receiverName,
          'android:label': 'PigFly Quick Glance',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.appwidget.action.APPWIDGET_UPDATE',
                },
              },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'android.appwidget.provider',
              'android:resource': '@xml/pigfly_widget_info',
            },
          },
        ],
      });
    }

    return manifestConfig;
  });
}

module.exports = withAppWidget;
