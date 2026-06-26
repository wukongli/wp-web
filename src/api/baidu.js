import request from '@/utils/request'

// Create a Baidu QR login session
export function generateBaiduLoginQR(userId) {
  return request({
    url: '/wp/baidu/qrcode',
    method: 'post',
    params: { userId },
  })
}

// Fetch QR code image as blob, return blob URL
export async function getBaiduQRImage(sessionId) {
  const blob = await request({
    url: '/wp/baidu/qrcode-image',
    method: 'get',
    params: { id: sessionId },
    responseType: 'blob',
  })
  return URL.createObjectURL(blob)
}

// Poll QR scan status
export function checkBaiduLoginStatus(sessionId) {
  return request({
    url: '/wp/baidu/poll',
    method: 'get',
    params: { id: sessionId },
  })
}
