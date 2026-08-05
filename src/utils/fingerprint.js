export function generateDeviceFingerprint() {
  const components = [];

  // 屏幕信息
  components.push(`screen:${screen.width}x${screen.height}`);

  // 平台
  components.push(`platform:${navigator.platform || 'unknown'}`);

  // 时区
  components.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);

  const raw = components.join('|');

  // 简单哈希
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return (
    Math.abs(hash).toString(16).padStart(8, '0') +
    raw.length.toString(16).padStart(4, '0')
  );
}
