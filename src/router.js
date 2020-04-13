import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';

Vue.use(Router);

const router = new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: '/draw',
    },
    {
      path: '/draw',
      name: 'home',
      component: Home,
      meta: {
        title: '涂鸦列表',
      },
    },
    {
      path: '/draw/:id',
      name: 'drawDetail',
      component: () => import('./views/DrawDetail.vue'),
      meta: {
        title: '涂鸦详情',
        parents: [
          {
            title: '涂鸦列表',
            path: '/',
          },
        ],
      },
    },
    {
      path: '/picture',
      name: 'picture',
      component: () => import('./views/Picture.vue'),
      meta: {
        title: '图案列表',
      },
    },
  ],
});

export default router;
