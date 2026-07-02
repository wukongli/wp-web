export async function generateDeviceFingerprint() {
  const components = [];

  // CPU 核心数
  components.push(`cpu:${navigator.hardwareConcurrency || 'unknown'}`);

  // 内存
  components.push(`mem:${navigator.deviceMemory || 'unknown'}`);

  // 屏幕信息
  components.push(`screen:${screen.width}x${screen.height}x${screen.colorDepth}`);

  // 平台
  components.push(`platform:${navigator.platform || 'unknown'}`);

  // 时区
  components.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

  // WebGL 渲染器 (GPU 信息)
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        components.push(`gpu:${gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)}`);
        components.push(`vendor:${gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)}`);
      }
    }
  } catch (e) { /* ignore */ }

  // Canvas 指纹
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(0, 0, 100, 25);
    ctx.fillStyle = '#069';
    ctx.fillText('Device Fingerprint!', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Device Fingerprint!', 4, 17);
    components.push(`canvas:${canvas.toDataURL().slice(-64)}`);
  } catch (e) { /* ignore */ }

  // AudioContext 指纹
  try {
    const audioCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 44100, 44100);
    const oscillator = audioCtx.createOscillator();
    const analyser = audioCtx.createAnalyser();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(10000, audioCtx.currentTime);
    oscillator.connect(analyser);
    oscillator.start();
    const buffer = await audioCtx.startRendering();
    components.push(`audio:${Array.from(new Uint8Array(buffer.getChannelData(0).buffer.slice(0, 16))).join(',')}`);
  } catch (e) { /* ignore */ }

  // 语言
  components.push(`lang:${navigator.language}`);

  const raw = components.join('|');

  // 简单哈希
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0') + raw.length.toString(16).padStart(4, '0');
}
