import Vue from 'vue';
import App from './App';
import store from './vuex-store';
import router from './vue-router';
import request from 'superagent';
import GSignInButton from 'vue-google-signin-button';

Vue.config.productionTip = false;

Vue.prototype.$http = request;

Vue.use(GSignInButton);

const vApp = new Vue({
  router,
  store,
  render: h => h(App)
});

vApp.$mount('#app');
