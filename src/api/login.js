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
    url: '/wp/parseLink',
    // url: '/wp/parseLinkTest',
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
    url: '/wp/getCodeNum',
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

fetch('/rest/2.0/xpan/nas?method=uinfo')
  .then((q) => q.json())
  .then((r) => {
    if (r.errno == 0) {
      const param = {
        uk: r.uk,
      };
      fetch(config.main_url + '/wp/getNum', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(param),
      })
        .then((q) => q.json())
        .then((item) => {
          if (item.code == 200 && item.data.code == 0 && item.data.num > 0) {
            console.log('账号正常可以下载');
          }
        });
    }
  });
