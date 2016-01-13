var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.use(express.static('public'));

var online_user = {};
var user_socket = {};
io.on('connection', function (socket) {
  var uid = Math.floor(Math.random() * 10000);
  online_user[socket.id] = uid;
  user_socket[socket.id] = socket;
  io.emit('connect status', 'user ' + online_user[socket.id] + ' connected', online_user);

  //socket.broadcast.emit('user connected');

  socket.on('disconnect', function () {
    var tmp = online_user[socket.id];
    delete online_user[socket.id];
    io.emit('connect status', 'user ' + tmp + ' disconnected', online_user);
  });

  socket.on('typing', function (from) {
    socket.broadcast.emit('typing', from + ' is typing');
  });

  socket.on('chat message', function (msg) {
    //io.emit('chat message', from +' : '+msg);
    socket.broadcast.emit('chat message', online_user[socket.id], msg);
  });

  socket.on('modify uid', function (oldname, nickname) {
    online_user[socket.id] = nickname;
    //delete online_user[socket.id];
    //online_user[socket.id]=uid;
    io.emit('chat message', online_user[socket.id], 'user ' + oldname + ' modified his nickname to ' + nickname)
    io.emit('online refresh', online_user);
  });

  socket.on('private message', function (s_id, msg) {
    user_socket[s_id].emit('chat message', "(" + online_user[socket.id] + " 悄悄话 我)", msg);
  });

});


http.listen(3000, function () {
  console.log('listening on *:3000');
});


/*
 -Broadcast a message to connected users when someone connects or disconnects
 Add support for nicknames
 -Don't send the same message to the user that sent it himself. Instead, append the message directly as soon as he presses enter.
 -Add '{user} is typing' functionality
 -Show who's online
 Add private messaging
 Share your improvements!
 */