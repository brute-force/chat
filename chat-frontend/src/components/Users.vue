<template>
  <ul class="users">
    <li v-for="user in users" :key="user.email">
      <span :title="user.email">{{ user.username }}</span>
      <span v-if="user.isTyping" class="typing">typing</span>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'Users',
  props: {
    users: Array
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/users.scss";
</style>
