/**
 * Created by Li on 2016/1/15.
 */
(function (exports) {
  // 事件类型
  exports.EVENT_TYPE = {
    'LOGIN': 'LOGIN',
    'LOGOUT': 'LOGOUT',
    'SPEAK': 'SPEAK',
    'LIST_USER': 'LIST_USER',
    'ERROR': 'ERROR',
    'LIST_HISTORY': 'LIST_HISTORY'
  };

  var analyzeMessageData = exports.analyzeMessageData = function (message) {
    try {
      return JSON.parse(message);
    } catch (error) {
      // 收到了非正常格式的数据
      console.log('method:analyzeMsgData,error:' + error);
    }

    return null;
  }

  var getMsgFirstDataValue = exports.getMsgFirstDataValue = function (mData) {
    if (mData && mData.values && mData.values[0]) {
      return mData.values[0];
    }

    return '';
  }

})((function () {
  if (typeof exports === 'undefined') {
    window.lib = {};
    return window.lib;
  } else {
    return exports;
  }
})());