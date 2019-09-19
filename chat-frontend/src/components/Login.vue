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

<style lang="scss" scoped>
@import '@/styles/login.scss';
</style>
