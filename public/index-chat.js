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
var onlineList;
var curUser;

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
  if (selUser == "所有人") {//群聊
    $('#messages').append($('<li>').text(curUser + " : " + $('#cur-input').val()));
    socket.emit('chat message', $('#cur-input').val());
  } else {//私聊
    $('#messages').append($('<li>').text("(我 悄悄话 " + selUser + ") : " + $('#cur-input').val()));
    socket.emit('private message', $('#sel-user').val(), $('#cur-input').val());
  }
  $('#cur-input').val('');
  return false;
});

/*
 链接状态
 接收当前在线用户数组，
 确定当前用户
 显示链接提示
 更新‘在线用户’
 */
socket.on('connect status', function (msg, online) {
  onlineList = online;
  curUser = onlineList['/#' + socket.id];
  $("#nickname").val(curUser);
  $('#messages').append($('<li>').text(msg));
  updateOnlineUser(online);
});

socket.on('chat message', function (from, msg) {
  $('#messages li.msg').remove();
  $('#messages').append($('<li>').text(from + " : " + msg));
});

socket.on('typing', function (msg) {
  $('#messages li.msg').remove();
  if (msg != "") {
    $('#messages').append($('<li class="msg">').text(msg));
  }
});

socket.on('online refresh', function (online) {
  onlineList = online;
  updateOnlineUser(online);
});

function modifyNickname() {
  var nickname = $("#nickname").val();
  if (nickname != curUser) {
    socket.emit('modify nickname', curUser, nickname);
    curUser = nickname;
  }
  $('#alert-box').modal('hide');
}

function updateOnlineUser(online) {
  $('.online').empty();
  var html = ['<p>在线用户 共' + Object.keys(online).length + '人</p>'];
  var options = ['<option value="">所有人</option>'];
  for (key in online) {
    uname = online[key];
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

//----------------------------------------------------
/*
 message
 {
 'EVENT': EVENT_TYPE.LOGIN,
 'values': [currentUserNick]
 }
 */
socket.on("message", function (message) {
  var mData = lib.analyzeMessageData(message);

  if (mData && mData.EVENT) {
    switch (mData.EVENT) {
      case EVENT_TYPE.LOGIN: // 新用户连接
        break;
      case EVENT_TYPE.LOGOUT: // 用户退出
        break;
      case EVENT_TYPE.SPEAK: // 用户发言
        break;
      case EVENT_TYPE.ERROR: // 出错了
        appendMessage("[系统繁忙...]");
        break;
      default:
        break;
    }
  }
});

socket.on("error", function () {
  appendMessage("[网络出错啦，请稍后重试...]");
});


socket.on("close", function () {
  appendMessage("[网络连接已被关闭...]");
  close();
});