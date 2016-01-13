var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
//	res.sendFile('index.html');
});
app.use(express.static('public'));
/*
 io.on('connection', function(socket){
 socket.on('chat message', function(msg){
 console.log('message: ' + msg);
 });
 });
 */
var online = {};
io.on('connection', function (socket) {
  var uid = Math.floor(Math.random() * 10000);
  online[socket.id] = uid;
  io.emit('connect status', 'user ' + online[socket.id] + ' connected', online);

  //socket.broadcast.emit('user connected');

  socket.on('disconnect', function () {
    var tmp = online[socket.id];
    delete online[socket.id];
    io.emit('connect status', 'user ' + tmp + ' disconnected', online);
  });

  socket.on('typing', function (from) {
    socket.broadcast.emit('typing', from + ' is typing');
  });

  socket.on('chat message', function (msg) {
    //io.emit('chat message', from +' : '+msg);
    socket.broadcast.emit('chat message', online[socket.id], msg);
  });

  socket.on('modify uid', function (oldname, nickname) {
    online[socket.id] = nickname;
    //delete online[socket.id];
    //online[socket.id]=uid;
    io.emit('chat message', online[socket.id], 'user ' + oldname + ' modified his nickname to ' + nickname)
    io.emit('online refresh', online);
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