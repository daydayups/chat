var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.use(express.static('public'));

var onlineUsers = {};
var userSockets = {};
io.on('connection', function (socket) {
  var uid = Math.floor(Math.random() * 10000);
  onlineUsers[socket.id] = uid;
  userSockets[socket.id] = socket;
  io.emit('connected', onlineUsers);

  socket.on('disconnect', function () {
    delete onlineUsers[socket.id];
    io.emit('disconnect', socket.id);
  });

  socket.on('typing', function (from) {
    socket.broadcast.emit('typing', from == '' ? '' : from + ' is typing');
  });

  socket.on('chat message', function (msg) {
    socket.broadcast.emit('chat message', onlineUsers[socket.id], msg);
  });

  socket.on('modify nickname', function (oldname, nickname) {
    onlineUsers[socket.id] = nickname;
    io.emit('modify nickname', onlineUsers, 'user ' + oldname + ' modified his nickname to ' + nickname);
  });

  socket.on('private message', function (sId, msg) {
    userSockets[sId].emit('chat message', "(" + onlineUsers[socket.id] + " 悄悄话 我)", msg);
  });

});

http.listen(3000, function () {
  console.log('listening on *:3000');
});


/*
 -Broadcast a message to connected users when someone connects or disconnects
 -Add support for nicknames
 -Don't send the same message to the user that sent it himself. Instead, append the message directly as soon as he presses enter.
 -Add '{user} is typing' functionality
 -Show who's online
 -Add private messaging
 Share your improvements!
 */