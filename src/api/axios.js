import axios from 'axios';


const newAxios = axios.create({
  baseURL: window.g.baseUrl,
  withCredentials: true,
});

/**
 * 上传文件需要formData的时候使用
 * @param {*} url
 * @param {*} formData
 */
export const postFormData = (url, formData) => newAxios({
  method: 'post',
  url,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  data: formData,
});

/**
 * 设置axios实例的拦截器
 * @param {Object} vue vue实例
 */
export const setAxiosInterceptors = (vue) => {
  newAxios.interceptors.response.use(
    (res) => {
      // status为服务器连接状态，res.data.code为服务器返回的code，200为成功
      if (res.status === 200 && res.data.code === 200) {
        return Promise.resolve(res.data.data);
      }
      // 未登录
      if (res.data && res.data.code === -999) {
        window.location.href = window.g.loginPageUrl;
        return Promise.reject();
      }
      const errMsg = res.data ? res.data.message : '服务器错误';
      vue.$Message.error(errMsg);
      return Promise.reject(errMsg);
    },
    (err) => {
      console.dir(err);
      // 跨域，跳转到登录页
      if (typeof err.response === 'undefined' && err.message === 'Network Error') {
        vue.$Message.info('请登录');
        window.location.href = window.g.loginPageUrl;
        return Promise.reject(err);
      }
      const { response } = err;
      let errMsg = '服务器错误';
      if (response.data && response.data.message) {
        errMsg = response.data.message;
      }
      vue.$Message.error(errMsg);
      return Promise.reject(err);
    },
  );
};

export default newAxios;
