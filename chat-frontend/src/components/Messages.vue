<template>
  <div id="messages" class="chat__messages" ref="messages">
    <div class="message" v-for="message in messages" :key="message.id">
      <p>
        <span class="message__name" v-html="message.username"></span>
        <span class="message__meta">{{ message.createdAt }}</span>
      </p>
      <p v-html="message.message"></p>
    </div>
  </div>

</template>

<script>
export default {
  name: 'Messages',
  props: {
    messages: Array
  },
  updated () {
    this.$refs.messages.scrollTop = this.$refs.messages.lastElementChild.offsetTop;
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/messages.scss";
</style>
