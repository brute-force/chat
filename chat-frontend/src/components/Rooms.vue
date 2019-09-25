<template>
  <ul class="rooms">
    <li>{{ room }}</li>
    <li v-for="room in filteredRooms" :key="room" @click="join">{{ room }}</li>
  </ul>
</template>

<script>
export default {
  name: 'Rooms',
  props: {
    rooms: Array,
    room: String
  },
  computed: {
    filteredRooms () {
      return this.rooms.filter((room) => room !== this.room);
    }
  },
  methods: {
    // call the parent component join method
    join (e) {
      this.$emit('join', e.target.innerText);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/rooms.scss";
</style>
