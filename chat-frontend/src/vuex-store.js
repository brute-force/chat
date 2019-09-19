import Vue from 'vue';
import Vuex from 'vuex';
import jwt from 'jsonwebtoken';
import createPersistedState from 'vuex-persistedstate';
// import request from 'superagent';

Vue.use(Vuex);

export default new Vuex.Store({
  plugins: [createPersistedState()],
  state: {
    token: window.localStorage.getItem('token') || '',
    user: {}
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
      window.localStorage.setItem('token', token);
      // request.defaults.headers.common.Authorization = token;
      commit('login', { token, user });

      return Promise.resolve(token);
    },
    logout ({ commit }) {
      window.localStorage.removeItem('token');
      commit('logout');
      // delete request.defaults.headers.common.Authorization;

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
