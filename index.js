var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
//	res.sendFile('index.html');
});
/*
 io.on('connection', function(socket){
 socket.on('chat message', function(msg){
 console.log('message: ' + msg);
 });
 });
 */
io.on('connection', function (socket) {
  var uid = Math.floor(Math.random() * 10000);
  io.emit('chat message', uid, 'user connected');

  //socket.broadcast.emit('user connected');

  socket.on('disconnect', function () {
    io.emit('chat message', uid, 'user disconnected');
  });

  socket.on('typing', function (from) {
    socket.broadcast.emit('typing', from + ' is typing');
  });

  socket.on('chat message', function (from, msg) {
    console.log(from, msg);

    //io.emit('chat message', from +' : '+msg);
    socket.broadcast.emit('chat message', from, msg);
  });

});


http.listen(3000, function () {
  console.log('listening on *:3000');
});


/*
 -Broadcast a message to connected users when someone connects or disconnects
 -Add support for nicknames
 -Don��t send the same message to the user that sent it himself. Instead, append the message directly as soon as he presses enter.
 Add ��{user} is typing�� functionality
 Show who��s online
 Add private messaging
 Share your improvements!
 */