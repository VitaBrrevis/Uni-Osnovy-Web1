const path = require('path');
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const users = new Map();
const rooms = new Map();

function normRoom(s) {
  return String(s || '').trim().toLowerCase();
}

function normName(s) {
  return String(s || '').trim();
}

function roomUsersDisplay(roomId) {
  const list = [];
  for (const [, u] of users) if (u.roomId === roomId) list.push(u.username);
  return list.sort((a, b) => a.localeCompare(b));
}

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const roomId = normRoom(room);
    const displayRoom = String(room || '').trim();
    const uname = normName(username);
    const unameKey = uname.toLowerCase();
    if (!uname || !roomId) {
      socket.emit('joinError', { error: 'Username and room are required' });
      return;
    }
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { namesLower: new Set() });
    }
    const r = rooms.get(roomId);
    if (r.namesLower.has(unameKey)) {
      socket.emit('joinError', { error: 'Цей нік вже зайнятий у кімнаті' });
      return;
    }
    users.set(socket.id, { username: uname, roomId, roomLabel: displayRoom });
    r.namesLower.add(unameKey);
    socket.join(roomId);
    socket.emit('message', { from: 'Admin', text: `Welcome, ${uname}!`, ts: Date.now() });
    socket.to(roomId).emit('message', { from: 'Admin', text: `${uname} has joined!`, ts: Date.now() });
    io.to(roomId).emit('roomData', { room: displayRoom, username: uname, users: roomUsersDisplay(roomId) });
  });

  socket.on('chatMessage', (text) => {
    const u = users.get(socket.id);
    if (!u) return;
    const t = String(text || '').trim();
    if (!t) return;
    io.to(u.roomId).emit('message', { from: u.username, text: t, ts: Date.now() });
  });

  socket.on('disconnect', () => {
    const u = users.get(socket.id);
    if (!u) return;
    users.delete(socket.id);
    const r = rooms.get(u.roomId);
    if (r) {
      r.namesLower.delete(u.username.toLowerCase());
      if (r.namesLower.size === 0) rooms.delete(u.roomId);
    }
    socket.to(u.roomId).emit('message', { from: 'Admin', text: `${u.username} has left!`, ts: Date.now() });
    io.to(u.roomId).emit('roomData', { room: u.roomLabel, username: u.username, users: roomUsersDisplay(u.roomId) });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {});
