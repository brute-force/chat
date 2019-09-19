// this stores user/room info in memory only
const users = [];

const addUser = ({ id, username, email, room }) => {
  username = username.trim();
  room = room.trim();

  if (!username || !room) {
    throw new Error('username and room required.');
  } else if (username === 'admin') {
    throw new Error('change your username.');
  }

  const existingUser = users.find((user) => user.room === room && user.username === username);

  // prevent "dupes"
  if (existingUser) {
    console.log(`existing user found for ${username} ${id}`);
    console.log(existingUser);
    throw new Error(`${username} in use.`);
  }

  const user = { id, username, email, room, isTyping: false };
  users.push(user);

  return user;
};

const removeUserFromRoom = (id, room) => {
  const index = users.findIndex((user) => user.id === id && user.room === room);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

const getRooms = () => {
  return users.map((user) => user.room).filter((room, i, rooms) => rooms.indexOf(room) === i);
};

// const updateUserTypingStatus = (id, room, isTyping) => {
//   const index = users.findIndex((user) => user.id === id && user.room === room);

//   if (index !== -1) {
//     const user = users[index];
//     user.isTyping = isTyping;

//     return users.splice(index, 1, user)[0];
//   }
// };

module.exports = {
  addUser,
  removeUserFromRoom,
  getUser,
  getUsersInRoom,
  // updateUserTypingStatus,
  getRooms
};
