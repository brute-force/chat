import Vue from 'vue';
import Router from 'vue-router';
import Login from '@/components/Login';
import Chat from '@/components/Chat';
import NotFound from '@/components/NotFound';
import store from './vuex-store';
import VueSocketIO from 'vue-socket.io';
import SocketIO from 'socket.io-client';
import jwt from 'jsonwebtoken';

const originalPush = Router.prototype.push;

// https://github.com/vuejs/vue-router/issues/2873
Router.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject);

  try {
    // swallow console errors when navigation aborts
    return originalPush.call(this, location).catch((err) => err);
  } catch (error) {
    console.warn(error);
  }
};

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '*',
      component: NotFound
    },
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/chat',
      name: 'chat',
      component: Chat,
      meta: {
        requiresAuth: true
      },
      beforeEnter (to, from, next) {
        if (!Vue.prototype.$socket) {
          Vue.use(new VueSocketIO({
            connection: SocketIO({ path: '/chatty' })
          }));
        }

        next();
      }
    }
  ]
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const token = store.getters.token;

    // verify the token, reject to login screen if failed
    jwt.verify(token, process.env.VUE_APP_JWT_SECRET, (err, data) => {
      if (err) {
        next('/');
        return;
      }

      next();
    });
  } else {
    next();
  }
});

export default router;
