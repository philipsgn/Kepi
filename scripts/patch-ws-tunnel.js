/**
 * Patch script for Expo CLI 58 tunnel compatibility on Windows / Node 22+
 * 1. Fixes 'TypeError: s.WebSocket is not a constructor' in @expo/ws-tunnel with ws 7.x/8.x mix.
 * 2. Fixes 'Cannot read properties of null (reading 0)' in ManifestMiddleware for exp:// protocol.
 */

const fs = require('fs');
const path = require('path');

// 1. Patch ws/index.js
const wsIndexPath = path.join(__dirname, '..', 'node_modules', 'ws', 'index.js');
if (fs.existsSync(wsIndexPath)) {
  let wsContent = fs.readFileSync(wsIndexPath, 'utf8');
  if (!wsContent.includes('WebSocket.WebSocket = WebSocket')) {
    wsContent = wsContent.replace('module.exports = WebSocket;', 'WebSocket.WebSocket = WebSocket;\nmodule.exports = WebSocket;');
    fs.writeFileSync(wsIndexPath, wsContent, 'utf8');
    console.log('✅ Patched node_modules/ws/index.js with WebSocket.WebSocket = WebSocket');
  } else {
    console.log('ℹ️ node_modules/ws/index.js already patched');
  }
}

// 2. Patch @expo/ws-tunnel/build/index.js
const wsTunnelPath = path.join(__dirname, '..', 'node_modules', '@expo', 'ws-tunnel', 'build', 'index.js');
if (fs.existsSync(wsTunnelPath)) {
  let wsTunnelContent = fs.readFileSync(wsTunnelPath, 'utf8');
  if (wsTunnelContent.includes('new s.WebSocket(e,')) {
    wsTunnelContent = wsTunnelContent.replace('new s.WebSocket(e,', 'new (s.WebSocket || s)(e,');
    fs.writeFileSync(wsTunnelPath, wsTunnelContent, 'utf8');
    console.log('✅ Patched node_modules/@expo/ws-tunnel/build/index.js with fallback');
  } else {
    console.log('ℹ️ node_modules/@expo/ws-tunnel/build/index.js already patched or compatible');
  }
}

// 3. Patch @expo/cli ManifestMiddleware.js for exp:// and https?:// URL schemes
const manifestMiddlewarePath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'start',
  'server',
  'middleware',
  'ManifestMiddleware.js'
);
if (fs.existsSync(manifestMiddlewarePath)) {
  let mmContent = fs.readFileSync(manifestMiddlewarePath, 'utf8');
  if (mmContent.includes('bundleUrl.match(/^https?:\\/\\/.*?\\//)[0]')) {
    mmContent = mmContent.replace(
      /resolver: async \(assetPath\)=>\{[\s\S]*?const assetUrlPath = 'assets\/' \+ toAssetUrlPath\(assetPath\);[\s\S]*?return shouldUseRelativeManifestUrls \? assetUrlPath : bundleUrl\.match\(\/\^https\?:\\\/\\\/.*?\\\/\)\[0\] \+ assetUrlPath;[\s\S]*?\}/,
      `resolver: async (assetPath)=>{
                const baseMatch = bundleUrl.match(/^(?:https?|exp):\\/\\/.*?\\//);
                const baseUrl = baseMatch ? baseMatch[0] : (bundleUrl.includes('://') ? bundleUrl.substring(0, bundleUrl.indexOf('/', bundleUrl.indexOf('://') + 3) + 1) : 'http://' + bundleUrl.split('/')[0] + '/');
                if (this.options.isNativeWebpack) {
                    return shouldUseRelativeManifestUrls ? toAssetUrlPath(assetPath) : baseUrl + toAssetUrlPath(assetPath);
                }
                const assetUrlPath = 'assets/' + toAssetUrlPath(assetPath);
                return shouldUseRelativeManifestUrls ? assetUrlPath : baseUrl + assetUrlPath;
            }`
    );
    fs.writeFileSync(manifestMiddlewarePath, mmContent, 'utf8');
    console.log('✅ Patched node_modules/@expo/cli ManifestMiddleware.js');
  } else {
    console.log('ℹ️ node_modules/@expo/cli ManifestMiddleware.js already patched');
  }
}

console.log('✨ All Expo CLI patches applied successfully.');
