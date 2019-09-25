const { generateMessage, asyncReplaceYouTubeLinks } = require('./utils/messages');
const { addUser, getUser, getUsersInRoom, removeUserFromRoom, getRooms } = require('./utils/users');
const SocketError = require('./utils/SocketError');
const UserNotFoundError = require('./utils/UserNotFoundError');

module.exports = (io) => {
  // tell everyone something and update the user list
  const updateRoom = (room, message) => {
    io.to(room).emit('message', message);

    io.to(room).emit('roomData', {
      room,
      users: getUsersInRoom(room)
    });
  };

  // update everyone of room list
  const updateRoomsList = () => {
    io.emit('worldData', {
      rooms: getRooms()
    });
  };

  // promisified join room
  const joinRoom = (socket, user) => {
    return new Promise((resolve, reject) => {
      socket.join(user.room, (err) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          user = addUser(user);

          // tell everyone user joined room
          const msgJoined = `${user.username} joined ${user.room}.`;
          console.log(`${msgJoined} ${socket.id}`);
          updateRoom(user.room, generateMessage('admin', msgJoined));
          updateRoomsList();

          resolve(user);
        } catch (err) {
          reject(err);
        }
      });
    });
  };

  // promisified leave room
  const leaveRoom = (socket) => {
    return new Promise((resolve, reject) => {
      let user = getUser(socket.id);

      if (!user) {
        reject(new Error('user not found.'));
        return;
      }

      socket.leave(user.room, (err) => {
        if (err) {
          reject(err);
          return;
        }

        user = removeUserFromRoom(socket.id, user.room);

        if (getUsersInRoom(user.room).length === 0) {
          updateRoomsList();
        } else {
          const msgLeft = `${user.username} left ${user.room}.`;
          console.log(`${msgLeft} ${socket.id}`);
          updateRoom(user.room, generateMessage('admin', msgLeft));
        }

        resolve(user);
      });
    });
  };

  // promisified kick from room
  const kickFromRoom = (socket, kicker) => {
    return new Promise((resolve, reject) => {
      let user = getUser(socket.id);

      socket.leave(user.room, (err) => {
        if (err) {
          reject(err);
          return;
        }
        user = removeUserFromRoom(socket.id, user.room);

        const msgKicked = `${kicker.username} kicked ${user.username} from ${user.room}.`;
        console.log(`${msgKicked} ${socket.id}`);
        updateRoom(user.room, generateMessage('admin', msgKicked));

        resolve(user);
      });
    });
  };

  // handle the chat events
  io.on('connection', (socket) => {
    console.log(`${socket.id} connected.`);

    socket.on('join', async ({ room, username, email }, callback) => {
      try {
        if (!username) {
          const user = await leaveRoom(socket);
          user.room = room;

          return callback(null, await joinRoom(socket, user));
        }

        callback(null, await joinRoom(socket, { id: socket.id, username, email, room }));
      } catch (err) {
        callback(new SocketError(err.message));
      }
    });

    // remove user on disonnect
    socket.on('disconnect', async (reason) => {
      try {
        const user = await leaveRoom(socket);
        console.log(`${user.username} ${socket.id} disconnected. ${reason}`);
      } catch (err) {
        console.log(`error disconnecting ${socket.id}: ${err.message}`);
      }
    });

    // send a message
    socket.on('message', async (message, callback) => {
      const user = getUser(socket.id);

      if (user) {
        // catch some youtubes and send it to everyone
        var regexTubes = /https:\/\/(www\.)?(youtube.com|youtu.be)\/(watch\?v=)?.{11}((\?|&)t=\d+)?/g;
        var tubes = message.match(regexTubes);

        if (tubes && tubes.length > 0) {
          // replace youtube link w/ embeddable link
          let tube = tubes[0].replace(/(youtu\.be\/)(.{11})/, 'youtube.com/embed/$2').replace(/watch\?v=/, 'embed/');
          tube = tube.replace(/(&|\?)t=/, '?start=');
          io.to(user.room).emit('youtube', generateMessage(user.username, tube));

          message = await asyncReplaceYouTubeLinks(message);
        }

        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback(null, 'message sent');
      } else {
        callback(new UserNotFoundError('oops! you got kicked, son!'));
      }
    });

    // update the 'typing' status
    socket.on('updateTypingStatus', (isTyping, callback) => {
      // room this socket is in
      // console.log(Object.keys(socket.rooms).filter((room) => room !== socket.id));
      const user = getUser(socket.id);

      if (user) {
        user.isTyping = isTyping;
        io.to(user.room).emit('typist', user);

        callback(null, 'typing status sent');
      } else {
        callback(new UserNotFoundError('oops! you got kicked, son!'));
      }
    });

    // send user location
    socket.on('location', (coords, callback) => {
      const user = getUser(socket.id);

      if (user) {
        const location = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`;
        io.to(user.room).emit('location', generateMessage(user.username, location));

        callback(null, 'location shared');
      } else {
        callback(new UserNotFoundError('oops! you got kicked, son!'));
      }
    });

    // kick a luser
    socket.on('kick', async (username, callback) => {
      const kicker = getUser(socket.id);

      if (kicker) {
        const room = kicker.room;

        if (kicker.username === username) {
          callback(new SocketError('you cannot kick yourself!'));
        } else if (room === process.env.ROOM_TO_KICK_TO) {
          callback(new SocketError(`${room} is already the worst room! AND YOU'RE IN IT!`));
        } else {
          try {
            const usersInRoom = getUsersInRoom(room);
            let user = usersInRoom.find((user) => user.username === username);

            const socketsConnected = io.of('/').connected;
            const socketToKick = socketsConnected[user.id];
            user = await kickFromRoom(socketToKick, kicker);

            // throw user to another room
            user.room = process.env.ROOM_TO_KICK_TO;
            user = await joinRoom(socketToKick, user);

            // send got kicked message to user
            socketToKick.emit('kicked', kicker);

            callback(null, user);
          } catch (err) {
            callback(new SocketError(err.message));
          }
        }
      } else {
        // kicker is not in this room or is disconnected. do you even go to this school?
        callback(new UserNotFoundError('oops! you\'re the one who got kicked, son!'));
      }
    });
  });
};
