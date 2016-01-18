/**
 * Created by Li on 2016/1/15.
 */

/* 保持底部fixed的聊天输入框不会覆盖 聊天区域#messages 和 在线用户显示区域.online-users*/
var navbarH = $("div.bottom-bar").height();
$("#messages").css("margin-bottom", navbarH + 10);
$(".online-users").css("padding-bottom", navbarH + 10);

/* 当 #messages 聊天区域 有新增内容，将滚动条滚动到最底部 保持显示新信息*/
$("#messages").bind('DOMNodeInserted', function (e) {
  $('body').scrollTop($('#messages')[0].scrollHeight);
});

var socket = io();
var onlineList;//,onlineList2;
var curUser;
var historyMessages;
/*
 当群聊时，
 用户输入时，其他用户显示 xx is typing；
 用户清空输入，其他用户取消提示信息；
 当私聊时，清空其他提示信息。
 */
$('#cur-input').bind('input propertychange', function () {
  if ($('#sel-user :selected').text() == "所有人" && $("#cur-input").val() != "") {
    socket.emit('typing', curUser);
  } else {
    socket.emit('typing', '');
  }
});

$('form').submit(function () {
  var selUser = $('#sel-user :selected').text();
  if ($('#sel-user').val() == "") {//群聊
    appendMessage(curUser + " : " + $('#cur-input').val());
    socket.emit('chat message', $('#cur-input').val());
  } else {//私聊
    appendMessage("(我 悄悄话 " + selUser + ") : " + $('#cur-input').val());
    socket.emit('private message', $('#sel-user').val(), $('#cur-input').val());
  }
  $('#cur-input').val('');
  $('#messages li.msg').remove();
  return false;
});

/*
 链接状态
 接收当前在线用户数组，
 确定当前用户
 显示链接提示
 更新‘在线用户’
 */
socket.on('connected', function (online, uid, historyMsgs) {
  historyMessages = historyMsgs;
  onlineList = online;
  curUser = onlineList['/#' + socket.id];
  $("#nickname").val(curUser);
  if (uid == curUser && historyMessages.length > 0) {
    for (var i = 0; i < historyMessages.length; i++) {
      appendHisMessage(historyMessages[i]);
    }
    appendHisMessage("==================以上为最近的历史消息==================");
  }
  appendMessage('user ' + uid + ' connected');
  updateOnlineUser();
});

//socket.on('connected test', function (online) {
//onlineList2 = online;
//console.log(onlineList2,socket.id);
//curUser = onlineList2['/#' + socket.id].nick;
//$("#nickname").val(curUser);
//appendMessage('user ' + curUser + ' connected');
//updateOnlineUser();
//});

socket.on('disconnect', function (sid) {
  console.log(sid, onlineList);
  var user = onlineList[sid];
  delete onlineList[sid];
  appendMessage('user ' + user + ' disconnected');
  updateOnlineUser();
});

socket.on('chat message', function (from, msg) {
  $('#messages li.msg').remove();
  appendMessage(from + " : " + msg);
});

socket.on('typing', function (msg) {
  $('#messages li.msg').remove();
  if (msg != "") {
    $('#messages').append($('<li class="msg">').text(msg));
  }
});

socket.on('modify nickname', function (online, msg) {
  onlineList = online;
  updateOnlineUser();
  appendMessage(msg);
});

function appendMessage(msg) {
  $('#messages').append($('<li>').text(msg));
}

function appendHisMessage(msg) {
  $('#messages').append($('<li>').append($('<span style="color:#ccc">').text(msg)));
}

function modifyNickname() {
  var nickname = $("#nickname").val();
  if (nickname != curUser) {
    socket.emit('modify nickname', curUser, nickname);
    curUser = nickname;
  }
  $('#alert-box').modal('hide');
}

function updateOnlineUser() {
  $('.online').empty();
  var html = ['<p>在线用户 共' + Object.keys(onlineList).length + '人</p>'];
  var options = ['<option value="">所有人</option>'];
  for (var key in onlineList) {
    var uname = onlineList[key];
    if (key == '/#' + socket.id) {
      html.push('<div data-uid=' + uname +
        '> <a href="#" onclick="' +
        "$('#alert-box').modal('show')" +
        '">' + uname + '</a> 我 </div>');
    } else {
      html.push('<div data-uid=' + uname + '>' + uname + '</div>');
      options.push('<option value="' + key + '">' + uname + '</option>')
    }
    $('.online-users').html(html.join(''));
    $('#sel-user').html(options.join(''));
  }
}

