import axios from './axios';

export function getPictureList(params) {
  return axios.get('pattern/list', { params });
}

export function deletePicture(id) {
  return axios.delete('pattern/delete', {
    params: {
      id,
    },
  });
}

export function newPicture(params) {
  const formData = new FormData();
  Object.keys(params).forEach((key) => {
    formData.append(key, params[key]);
  });
  return axios.post('pattern/add', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function updatePicture(params) {
  const formData = new FormData();
  Object.keys(params).forEach((key) => {
    formData.append(key, params[key]);
  });
  return axios.post('pattern/update', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function uploadExcelFile(file, isOverwrite) {
  const formData = new FormData();
  formData.append('file', file);
  const url = isOverwrite === '是' ? '/pattern/import/all/excel' : '/pattern/import/part/excel';
  return axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * @param {*} files 文件数组
 * @param {*} type unity或者img
 */
export function uploadMultiFiles(files, type) {
  const key = type === 'img' ? 'pictures' : 'unityFiles';
  const formData = new FormData();
  files.forEach((file) => {
    formData.append(key, file);
  });
  return axios.post(`/pattern/upload/${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export function uploadZipFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  return axios.post('/pattern/upload/zip', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
