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
var historyMsgs = [];
var KEEP_MSGS_LENGTH = 5; // 保持历史信息条数
//var onlineUsers2={};
io.on('connection', function (socket) {
  var uid = Math.floor(Math.random() * 10000);
  onlineUsers[socket.id] = uid;
  userSockets[socket.id] = socket;
  io.emit('connected', onlineUsers, uid, historyMsgs);
  //var newUser = {'uid': socket.id, 'nick': uid};
  //onlineUsers2[socket.id] = newUser;

  //io.emit('connected test', onlineUsers2);

  socket.on('disconnect', function () {
    delete onlineUsers[socket.id];
    io.emit('disconnect', socket.id);
  });

  socket.on('typing', function (from) {
    socket.broadcast.emit('typing', from == '' ? '' : from + ' is typing');
  });

  socket.on('chat message', function (msg) {
    historyMsgs.push(onlineUsers[socket.id] + " : " + msg);
    if (historyMsgs.length > KEEP_MSGS_LENGTH) {
      historyMsgs.shift();
    }
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