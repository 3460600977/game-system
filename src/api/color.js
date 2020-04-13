import axios from './axios';

export function getDrawingList(params) {
  return axios.get('color/list', {
    params,
  });
}

export function getFilterOptions(type) {
  return axios.get('dict/search', {
    params: {
      type,
    },
  });
}

export function getThemeOptions() {
  return axios.get('theme/all');
}

export function getChannels() {
  return axios.get('sso/channel/all');
}

export function getDrawingDetail(imgId) {
  return axios.get('color/detail', {
    params: {
      imgId,
    },
  });
}

export function deleteDrawingItem(id) {
  return axios.delete('color', {
    params: {
      imgId: id,
    },
  });
}
