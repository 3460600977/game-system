import * as types from './mutation-types';

const mutations = {
  [types.SET_ROUTE](state, route) {
    state.route = route;
  },
  [types.SET_ROUTE_PATH](state, path) {
    state.routePath = path;
  },
  [types.SET_USER](state, user) {
    state.user = user;
  },
};

export default mutations;
