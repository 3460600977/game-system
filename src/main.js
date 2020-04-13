import Vue from 'vue';
import iView from 'iview';
import App from './App.vue';
import router from './router';
import store from './store/index';
import './my-theme/index.less';
import axios from './api/axios';

Vue.use(iView);

// 注入axios，方便请求
Vue.prototype.$axios = axios;
Vue.config.productionTip = false;

// eslint-disable-next-line
const vue = new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
