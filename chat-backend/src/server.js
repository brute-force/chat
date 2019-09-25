const express = require('express');
const http = require('http');
const history = require('connect-history-api-fallback');
const socketio = require('socket.io');
const path = require('path');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const { getUser, getUsers } = require('./utils/users');

// set up server and socketio
const app = express();
const server = http.createServer(app);

const store = session({
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({ checkPeriod: 86400000 }),
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: false
});

// set up session store; 1 day
app.use(store);

// engine.io defaults for heartbeat
// https://github.com/socketio/engine.io/blob/c1448951334c7cfc5f1d1fff83c35117b6cf729f/lib/server.js#L40
const io = socketio(server, { path: '/chatty', pingTimeout: 3000, pingInterval: 12000 });
io.use((socket, next) => {
  store(socket.request, {}, next);
});

require('./sockets')(io);

// mount static files
const pathDist = path.join(__dirname, '../dist');
app.use(express.static(pathDist));

app.use(history());

// get all the rooms and users
app.get('/getAll', (req, res) => {
  const original = io.sockets.adapter.rooms;
  const rooms = [];

  Object.keys(io.sockets.adapter.rooms).map((key) => {
    const name = key;
    const sockets = Object.keys(original[name].sockets);

    const room = {
      name,
      users: []
    };

    sockets.forEach((socket) => {
      room.users.push({ socket, user: getUser(socket) });
    });

    rooms.push(room);
  });

  const users = getUsers();

  const response = {
    rooms,
    users
  };

  res.json(response);
});

app.use((req, res, next) => {
  res.status(404).send('oops! that\'s a 404, y\'all.');
});

module.exports = server;
