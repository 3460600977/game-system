/**
 * 用户相关接口
 * 具体文档见http://192.168.0.23:9999/swagger-ui.html#/
 */
import axios from './axios';

export function getUserInfo() {
  return axios.get('sso/user/info');
}

/**
 * 通过id查询用户信息
 */
export function getUserDetail(id) {
  const url = 'user/detail';
  return axios.get(url, {
    params: {
      id,
    },
  });
}

/**
 * 修改用户密码
 */
export function updatePwd(params) {
  const url = 'user/updatePwd';
  return axios.put(url, params);
}

export function getUserAbleSystemMenu() {
  return axios.post('user/oauth/systemMenu', {
    moduleId: 2,
  });
}

export function getUserAuthInfo(interfaceUrl, method) {
  return axios.get('sso/check/permission', {
    params: {
      url: interfaceUrl,
      method,
    },
  });
}
