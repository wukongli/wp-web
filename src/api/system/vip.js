import request from '@/utils/request';
import { parseStrEmpty } from '@/utils/ruoyi';

// 查询用户列表
export function listVip(query) {
  return request({
    url: '/vip',
    method: 'get',
    params: query,
  });
}

export function addPost(data) {
  return request({
    url: '/vip',
    method: 'post',
    data: data,
  });
}

export function putPost(data) {
  return request({
    url: '/vip',
    method: 'put',
    data: data,
  });
}

export function deleteVip(data) {
  return request({
    url: '/vip',
    method: 'delete',
    params: data,
  });
}

export function getCommonCookie(query) {
  return request({
    url: '/wp/getCookie',
    method: 'get',
    params: query,
  });
}

export function addCommonCookie(data) {
  return request({
    url: '/wp/setCookie',
    method: 'post',
    data: data,
  });
}

export function deleteCommonCookie(data) {
  return request({
    url: '/wp/deleteCookie',
    method: 'post',
    data: data,
  });
}
export function getDownLoadNum() {
  return request({
    url: 'wp/downLoadNum',
    method: 'get',
  });
}
export function setDownLoadNum(data) {
  return request({
    url: 'wp/downLoadNum',
    method: 'post',
    data: data,
  });
}

export function setDownLoadRecord(data) {
  return request({
    url: '/downloadRecord',
    method: 'post',
    data: data,
  });
}

export function getDownLoadRecord(data) {
  return request({
    url: '/downloadRecord',
    method: 'get',
    params: data,
  });
}
export function sendMessage(data) {
  return request({
    url: '/vip/stable/down',
    method: 'post',
    data: data,
  });
}
export function pcStableDown(data) {
  return request({
    url: '/vip/pc/stable/down',
    method: 'post',
    data: data,
  });
}

export function getPcStableDown() {
  return request({
    url: '/vip/pc/stable/down',
    method: 'get',
  });
}

export function getMessage() {
  return request({
    url: '/vip/stable/down',
    method: 'get',
  });
}

export function shareUrl(data) {
  return request({
    url: '/wp/getDownLoadUrl',
    method: 'post',
    data: data,
  });
}
