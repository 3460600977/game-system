import store from '@/store/index';

export function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

export function firstUpperCase(str) {
  return str.toLowerCase().replace(/( |^)[a-z]/g, L => L.toUpperCase());
}

export function getImageUrl({
  appId = '', platform = '', languageCode = '', type = '', subType = '', partCode = '', version, fileName = '',
}) {
  const { imgPrefix } = store.getters;
  if (!appId) return '';
  if (type === 'ad') {
    return `${imgPrefix}/${appId}/${platform}/${languageCode}/adc/${subType}/${partCode}/${version}/${fileName}`;
  }
  return `${imgPrefix}/${appId}/${platform}/${languageCode}/${type}/${partCode}/${version}/${fileName}`;
}

export function test() {}

// 防抖
export function debounce(fun, delay) {
  return function (args) {
    const that = this;
    const _args = args;
    clearTimeout(fun.id);
    fun.id = setTimeout(() => {
      fun.call(that, _args);
    }, delay);
  };
}

export function throttle(func, limit) {
  let inThrottle = false;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
