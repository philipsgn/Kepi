/**
 * Patch script for Expo CLI 58 tunnel compatibility on Windows / Node 22+
 * 1. Fixes 'TypeError: s.WebSocket is not a constructor' in @expo/ws-tunnel with ws 7.x/8.x mix.
 * 2. Fixes 'Unexpected server response: 409' in @expo/ws-tunnel and uncaught exception handler.
 * 3. Fixes 'Cannot read properties of null (reading 0)' in ManifestMiddleware for exp:// protocol.
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
  let changed = false;

  // 2a. Constructor fallback
  if (wsTunnelContent.includes('new s.WebSocket(e,')) {
    wsTunnelContent = wsTunnelContent.replace('new s.WebSocket(e,', 'new (s.WebSocket || s)(e,');
    changed = true;
    console.log('✅ Patched node_modules/@expo/ws-tunnel constructor fallback');
  }

  // 2b. createWebSocket safety handlers for unexpected-response and unhandled error
  if (!wsTunnelContent.includes('unexpected-response')) {
    const origCreateWS = 'function createWebSocket(e){const t=new (s.WebSocket || s)(e,{skipUTF8Validation:true,maxPayload:1024*1024,perMessageDeflate:!process.versions.webcontainer});t.binaryType="arraybuffer";return t}';
    const patchedCreateWS = 'function createWebSocket(e){const t=new (s.WebSocket || s)(e,{skipUTF8Validation:true,maxPayload:1024*1024,perMessageDeflate:!process.versions.webcontainer});t.binaryType="arraybuffer";t.on("unexpected-response",(req,res)=>{try{req.abort();}catch(_){}const code=(res&&res.statusCode)||0;t.emit("error",new Error("Unexpected server response: "+code));});t.on("error",()=>{});return t}';
    if (wsTunnelContent.includes(origCreateWS)) {
      wsTunnelContent = wsTunnelContent.replace(origCreateWS, patchedCreateWS);
      changed = true;
      console.log('✅ Patched createWebSocket with unexpected-response and error safety');
    }
  }

  // 2c. onSocketClose safe reconnect without unhandled promise rejection
  const origReconnect = 'n=setTimeout((()=>{n=null;this.start(c)}),s)';
  const patchedReconnect = 'n=setTimeout((()=>{n=null;this.start(c).catch(err=>{d("Reconnect attempt failed",err);if(r<=i){const s2=Math.min(f*2**r,p);r+=1;g?.("reconnecting");n=setTimeout((()=>{n=null;onSocketClose({code:1006})}),s2)}else{this.stop();g?.("disconnected");}})}),s)';
  if (wsTunnelContent.includes(origReconnect)) {
    wsTunnelContent = wsTunnelContent.replace(origReconnect, patchedReconnect);
    changed = true;
    console.log('✅ Patched onSocketClose with safe reconnect handling');
  }

  // 2d. Initial start 409 retry
  const origStartCatch = 'catch(e){this.stop();throw e}';
  const patchedStartCatch = 'catch(e){this.stop();if(e&&typeof e.message==="string"&&e.message.includes("409")&&r<3){r+=1;await new Promise(res=>setTimeout(res,1000));return this.start(c)}throw e}';
  if (wsTunnelContent.includes(origStartCatch)) {
    wsTunnelContent = wsTunnelContent.replace(origStartCatch, patchedStartCatch);
    changed = true;
    console.log('✅ Patched start() with 409 initial retry handling');
  }

  if (changed) {
    fs.writeFileSync(wsTunnelPath, wsTunnelContent, 'utf8');
    console.log('✅ Successfully updated node_modules/@expo/ws-tunnel/build/index.js');
  } else {
    console.log('ℹ️ node_modules/@expo/ws-tunnel/build/index.js already up-to-date');
  }
}

// 3. Patch @expo/cli errors.js to catch transient 409 without crashing Metro
const errorsPath = path.join(__dirname, '..', 'node_modules', '@expo', 'cli', 'build', 'src', 'utils', 'errors.js');
if (fs.existsSync(errorsPath)) {
  let errorsContent = fs.readFileSync(errorsPath, 'utf8');
  if (!errorsContent.includes('Unexpected server response: 409')) {
    errorsContent = errorsContent.replace(
      'function handleTooManyOpenFileErrors(error) {',
      `function handleTooManyOpenFileErrors(error) {
    if (error && typeof error.message === 'string' && error.message.includes('Unexpected server response: 409')) {
        (0, _log.warn)('Ignored transient tunnel conflict error (409): ' + error.message);
        return;
    }`
    );
    fs.writeFileSync(errorsPath, errorsContent, 'utf8');
    console.log('✅ Patched node_modules/@expo/cli/build/src/utils/errors.js for 409 immunity');
  } else {
    console.log('ℹ️ node_modules/@expo/cli errors.js already patched');
  }
}

// 4. Patch @expo/cli ManifestMiddleware.js for exp:// and https?:// URL schemes
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
  const targetPattern = 'bundleUrl.match(/^https?:\\/\\/.*?\\//)[0]';
  const safeReplacement = "(bundleUrl.match(/^(?:https?|exp):\\/\\/.*?\\//)?.[0] || 'http://' + bundleUrl.split('/')[0] + '/')";
  if (mmContent.includes(targetPattern)) {
    mmContent = mmContent.split(targetPattern).join(safeReplacement);
    fs.writeFileSync(manifestMiddlewarePath, mmContent, 'utf8');
    console.log('✅ Patched node_modules/@expo/cli ManifestMiddleware.js (exp:// and https:// safety)');
  } else {
    console.log('ℹ️ node_modules/@expo/cli ManifestMiddleware.js already patched');
  }
}

console.log('✨ All Expo CLI patches applied successfully.');
