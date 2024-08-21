import request from '@/utils/request';

// 登录方法
export function loginNoPwd(username, password, code, uuid) {
  const data = {
    username: username,
    password: password,
    code,
    uuid,
  };
  return request({
    url: '/loginNoPwd',
    headers: {
      isToken: false,
    },
    method: 'post',
    data: data,
  });
}
// admin登录方法
export function adminLogin(username, password, code, uuid) {
  const data = {
    username: username,
    password: password,
    code,
    uuid,
  };
  return request({
    url: '/login',
    headers: {
      isToken: false,
    },
    method: 'post',
    data: data,
  });
}

// 注册方法
export function register(data) {
  return request({
    url: '/register',
    headers: {
      isToken: false,
    },
    method: 'post',
    data: data,
  });
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get',
  });
}

// 退出方法
export function logout() {
  return request({
    url: '/logout',
    method: 'post',
  });
}

// 获取验证码
export function getCodeImg() {
  return request({
    url: '/captchaImage',
    headers: {
      isToken: false,
    },
    method: 'get',
    timeout: 20000,
  });
}
//获取加密解密密钥
export function querySecretKey() {
  return request({
    url: '/getSecretKey',
    headers: {
      isToken: false,
    },
    method: 'get',
    timeout: 20000,
  });
}

export function parseCopyLink(data) {
  return request({
    url: '/wp/parseCopyLink',
    method: 'post',
    timeout: 20000,
    data: data,
  });
}

export function parseLinkReq(data) {
  return request({
    // url: '/wp/dlink',
    url: '/wp/fast/pc/dlink',
    // url: '/wp/pc/dlink',
    method: 'post',
    timeout: 20000,
    data: data,
  });
}

export function getSignReq(data) {
  return request({
    url: '/wp/getSign',
    method: 'post',
    timeout: 20000,
    data: data,
  });
}

export function getVip() {
  return request({
    url: '/vip/num',
    method: 'get',
    timeout: 20000,
  });
}

export function getCode(data) {
  return request({
    url: '/wp/getPcCodeNum',
    method: 'post',
    timeout: 20000,
    data: data,
  });
}

export function getInfoByUserKey(data) {
  return request({
    url: '/wp/getInfoByUserKey',
    method: 'post',
    timeout: 20000,
    data: data,
  });
}

export function tryDownUrl(data) {
  return request({
    url: '/wp/try/down',
    method: 'post',
    timeout: 20000,
    data: data,
  });
}

export function delCode(data) {
  return request({
    url: '/wp/del/code',
    method: 'post',
    timeout: 20000,
    data: data,
  });
}

export function getCourseByType(type) {
  return request({
    url: '/course/' + type,
    method: 'get',
    timeout: 20000,
  });
}

