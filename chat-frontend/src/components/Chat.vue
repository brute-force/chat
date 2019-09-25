<template>
  <div class="chat">
    <div id="sidebar" class="chat__sidebar">
      <div class="chat__sidebar_room">
        <h2 class="room-title">{{ user.room }}</h2>
        <Users :users="users" />
      </div>
      <div class="chat__sidebar_rooms">
        <h2 class="rooms-title">rooms</h2>
        <Rooms :rooms="rooms" :room="user.room" v-on:join="join" />
      </div>
    </div>
    <div class="chat__main">
      <div class="youtube-width">
        <div class="video-responsive">
          <iframe ref="ahem" id="ahem" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      </div>
      <Messages :messages="messages" />
      <form class="message-form">
        <input type="text" name="message" class="message" placeholder="message" autocomplete="off" v-model="message" ref="message" />
        <button class="send" @click.prevent="sendMessage">send</button>
        <button class="location" @click.prevent="sendLocation">send location</button>
        <button class="logout" @click.prevent="logout">log out</button>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import moment from 'moment';
import Users from '@/components/Users.vue';
import Rooms from '@/components/Rooms.vue';
import Messages from '@/components/Messages.vue';
import debounce from 'lodash.debounce';

const timestampFormat = 'h:mm:ss a';

export default {
  components: {
    Users,
    Rooms,
    Messages
  },
  data () {
    return {
      isConnected: false,
      user: {
        username: '',
        email: '',
        room: ''
      },
      users: [],
      rooms: [],
      messages: [],
      message: ''
    };
  },
  beforeDestroy () {
    // disconnect before reload/logout so we don't have an orphaned user in the room
    if (this.isConnected) {
      this.$socket.disconnect();
    }
  },
  sockets: {
    connect () {
      console.log('connected!');
      this.isConnected = true;
    },
    disconnect () {
      console.log('disconnected!');
      this.isConnected = false;
    },
    // update room user list
    roomData ({ room, users }) {
      this.updateRoom(room);
      this.user.room = room;
      this.users = users;
    },
    // update rooms list
    worldData ({ rooms }) {
      // this.rooms = rooms.filter((el) => el !== this.user.room);
      this.rooms = rooms;
    },
    // auto-play the youtube
    youtube ({ username, message, createdAt }) {
      this.$refs.ahem.src = message + (/\?start=\d+$/.test(message) ? '&' : '?') + 'autoplay=1';
    },
    // display a message
    message ({ username, message, createdAt }) {
      if (username === 'admin') {
        username = `<i>${username}</i>`;
      }

      createdAt = moment(createdAt).format(timestampFormat);
      this.messages.push({ createdAt, username, message });
    },
    location ({ username, message, createdAt }) {
      createdAt = moment(createdAt).format(timestampFormat);
      message = `<a href="${message}" target="_blank">come and get me</a>`;
      this.messages.push({ createdAt, username, message });
    },
    // set user typing status and update the data model
    typist (_user) {
      this.users = this.users.map((user) => {
        if (user.username === _user.username) {
          user.isTyping = _user.isTyping;
        }

        return user;
      });
    },
    // tell user [insert third person singular subjective pronoun here] got kicked
    kicked (kicker) {
      window.alert(`${kicker.username} kicked you. (${kicker.email})`);
    }
  },
  watch: {
    // updating 'typing' status
    message: debounce(function (value) {
      const clearTypingStatus = () => {
        this.$socket.emit('updateTypingStatus', false, (err, data) => {
          if (err) {
            window.alert(err.message);

            if (err.name === 'UserNotFoundError') {
              this.logout();
            }
          }
        });
      };

      if (value && value.trim().length > 0) {
        this.$socket.emit('updateTypingStatus', true, (err, data) => {
          if (err) {
            window.alert(err.message);

            if (err.name === 'UserNotFoundError') {
              this.logout();
            }

            return;
          }

          setTimeout(clearTypingStatus, 300);
        });
      }
    }, 500, { leading: true, trailing: true })
  },
  methods: {
    join (room, username, email) {
      if (this.user.room === room && !username) {
        window.alert(`your [sic] already in ${room}.`);
      } else {
        this.$socket.emit('join', { room, username, email }, (err, user) => {
          if (err) {
            window.alert(err.message);
            return this.logout();
          }

          this.updateRoom(room);
          console.log(`${user.username} joined ${room}.`);
        });
      }
    },
    sendMessage (e) {
      if (this.message.trim().length === 0) {
        window.alert('enter a message');
        return this.$refs.message.focus();
      }

      e.target.setAttribute('disabled', 'disabled');

      if (/^\/kick /.test(this.message)) {
        // kick a user
        const username = this.message.replace(/^\/kick (.+)/, '$1').trim();

        if (this.users.find((user) => user.username === username)) {
          this.$socket.emit('kick', username, (err, data) => {
            if (err) {
              window.alert(err.message);

              if (err.name === 'UserNotFoundError') {
                return this.logout();
              }
            }
          });
        } else {
          window.alert(`${username} not found in ${this.user.room}.`);
        }
      } else if (/^\/join /.test(this.message)) {
        // join a new room
        const room = this.message.replace(/^\/join (.+)/, '$1').trim();
        this.join(room);
      } else {
        // send a message
        this.$socket.emit('message', this.message, (err, data) => {
          if (err) {
            window.alert(err.message);

            if (err.name === 'UserNotFoundError') {
              return this.logout();
            }
          }
        });
      }

      e.target.removeAttribute('disabled');

      this.message = '';
      this.$refs.message.focus();
    },
    sendLocation (e) {
      if (!window.navigator.geolocation) {
        return window.alert('geolocation not supported on your browser.');
      }

      e.target.setAttribute('disabled', 'disabled');

      window.navigator.geolocation.getCurrentPosition((position) => {
        const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };

        this.$socket.emit('location', coords, (err, data) => {
          if (err) {
            window.alert(err.message);

            if (err.name === 'UserNotFoundError') {
              return this.logout();
            }
          }

          e.target.removeAttribute('disabled');
          this.$refs.message.focus();
        });
      });
    },
    logout (e, msg) {
      // log out in vuex store then redirect to login
      this.$store.dispatch('logout')
        .then(() => {
          this.$router.push({ name: 'login' })
            .then(() => {
              if (msg) {
                window.alert(msg);
              }

              console.log(`logged out ${this.user.username}.`);
              // this.$socket.disconnect();
            })
            .catch((err) => {
              console.warn(`navigation error: ${err.message}`);
            });
        });
    },
    ...mapActions({ updateRoom: 'updateRoom' })
  },
  mounted () {
    // initial room join
    this.$socket.connect();

    this.user = this.$store.getters.user;
    const { room, username, email } = this.user;
    this.join(room, username, email);

    this.$refs.message.focus();
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/chat.scss";
</style>
