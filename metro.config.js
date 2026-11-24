const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Thêm định dạng 3D .glb, .gltf và bản đồ offline .pmtiles vào assetExts (Quyết định 182)
if (!config.resolver.assetExts.includes('glb')) {
  config.resolver.assetExts.push('glb');
}
if (!config.resolver.assetExts.includes('gltf')) {
  config.resolver.assetExts.push('gltf');
}
if (!config.resolver.assetExts.includes('pmtiles')) {
  config.resolver.assetExts.push('pmtiles');
}

module.exports = config;
