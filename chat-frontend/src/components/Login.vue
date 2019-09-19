<template>
  <div class="log-in">
    <input name="room" class="room" type="text" placeholder="room" ref="room" />
    <g-signin-button :params="googleSignInParams" @success="onSignInSuccess" @error="onSignInError">
      <img src="/img/btn_google_signin_dark_normal_web.png" />
    </g-signin-button>
  </div>
</template>

<script>
export default {
  data () {
    return {
      googleSignInParams: {
        client_id: process.env.VUE_APP_GOOGLE_OAUTH2_CLIENT_ID,
        prompt: 'consent',
        scope: 'email profile openid'
      }
    }
  },
  methods: {
    onSignInSuccess (googleUser) {
      const profile = googleUser.getBasicProfile();
      const username = profile.getName();
      const email = profile.getEmail();
      const room = this.$refs.room.value || 'ahem';

      this.$store.dispatch('login', { username, email, room }).then((data) => this.$router.push({ name: 'chat' }));
    },
    onSignInError (error) {
      console.log('error signing in:', error);
    }
  }
}
</script>

<style scoped>
.log-in {
  background-color: #333333;
  padding: 24px;
  height: 100vh;
}

.room {
  background: #333;
  color: white;
  height: 40px;
  vertical-align: middle;
  padding: 12px;
  outline: none;
}

.g-signin-button {
  cursor: pointer;
  display: inline-block;
  margin-left: 20px;
  vertical-align: middle;
  height: 46px;
  width: 191px;
}
</style>
