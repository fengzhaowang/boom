const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}


const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 带token请求服务端
function request(url, data = {}, method = "GET") {
  var that = this
  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'Content-Type': method == 'GET' ? 'application/json' : 'application/x-www-form-urlencoded; charset=UTF-8',
        'Authorization': wx.getStorageSync('token')
      },
      success: function (res) {
        wx.hideLoading();
        
        if (res.statusCode == 200) {
            resolve(res.data);
        } else {
          reject(res.errMsg);
        }
      },
      fail: function (err) {
        wx.hideLoading();
        reject(err)
        console.log("failed")
      }
    })
  });
  wx.request(obj)
}

function get(url, data = {}) {
  return request(url, data, 'GET')
}

function post(url, data = {}) {
  return request(url, data, 'POST')
}

/**
 * 检查微信会话是否过期
 */
function checkSession() {
  return new Promise(function (resolve, reject) {
    wx.checkSession({
      success: function () {
        resolve(true);
      },
      fail: function () {
        reject(false);
      }
    })
  });
}
/**
 * 调用微信登录
 */
function login() {
  return new Promise(function (resolve, reject) {
    wx.login({
      success: function (res) {
        
        if (res.code) {
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail: function (err) {
        reject(err);
      }
    });
  });
}

function getUserInfo() {
  return new Promise(function (resolve, reject) {
    
    wx.getUserInfo({
      withCredentials: true,
      success: function (res) {
        
        
        if (res.errMsg === 'getUserInfo:ok') {
          resolve(res);
        } else {
          reject(res)
        }
      },
      fail: function (err) {
        reject(err);
      }
    })
  });

}



module.exports = {
  formatTime: formatTime,
  login,
  getUserInfo,
  request,
  checkSession,

}
