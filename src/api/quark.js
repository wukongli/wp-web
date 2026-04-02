import request from '@/utils/request'

// Generate QR code for Quark login
export function generateQuarkLoginQR() {
  return request({
    url: '/quark/login/qr/generate',
    method: 'get'
  })
}

// Check QR code login status
export function checkQuarkLoginStatus(data) {
  return request({
    url: '/quark/check/status',
    method: 'post',
    data: data,
  })
}

// Confirm QR code login
export function confirmQuarkLogin(token) {
  return request({
    url: '/quark/login/qr/confirm',
    method: 'post',
    data: { token }
  })
}