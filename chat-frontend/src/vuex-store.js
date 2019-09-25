import Vue from 'vue';
import Vuex from 'vuex';
import jwt from 'jsonwebtoken';
import Cookies from 'js-cookie';
// import request from 'superagent';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: Cookies.get('token') || '',
    user: JSON.parse(Cookies.get('user') || '{}')
  },
  mutations: {
    login (state, { token, user }) {
      state.token = token;
      state.user = user;
    },
    logout (state) {
      state.token = '';
      state.user = {};
    },
    updateRoom (state, room) {
      state.user.room = room;
    }
  },
  actions: {
    login ({ commit }, user) {
      const token = jwt.sign(user, process.env.VUE_APP_JWT_SECRET, { expiresIn: '1d' });

      // set secure to true when deploying to an https environment
      // const opts = { expires: 1, samesite: 'Strict', secure: true };
      const opts = { expires: 1, samesite: 'Strict' };

      Cookies.set('token', token, opts);
      Cookies.set('user', JSON.stringify(user), opts);

      commit('login', { token, user });

      return Promise.resolve(token);
    },
    logout ({ commit }) {
      Cookies.remove('token');
      Cookies.remove('user');

      commit('logout');

      return Promise.resolve('logged out');
    },
    updateRoom ({ commit }, room) {
      commit('updateRoom', room);

      return Promise.resolve(`room changed to ${room}`);
    }
  },
  getters: {
    token: state => state.token,
    user: state => state.user
  }
});
