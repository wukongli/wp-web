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
