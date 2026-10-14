// Production Entry Point for Kepi (Ví Locket)
// Nạp polyfill bảo vệ native runtime trước khi nạp bất kỳ module nào của Expo Router
import './src/utils/nativeSafetyPolyfill';
import 'expo-router/entry';
