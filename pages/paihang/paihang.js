const app = getApp()
const api = require("../../config/api.js")
const util = require("../../utils/util.js")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    showModal: false,
    dayOrMonth: 1,  // 0:日 1:月
    list: [],// 排行榜
    btn: {},
    dianzanNum: 1,
    login_enabled: false, // 登录框显示状态
  },
  go_xiangqing: function (e) {
    //把点击头像的用户id存入userId，供详情页使用
    //把点击头像的indexId存入indexId，供详情页使用
    app.globalData.userId = e.currentTarget.id
    app.globalData.indexId = e.currentTarget.dataset.alphabeta
    wx.navigateTo({
      url: '../paihang/xiangqing',
    })
  },
  index: function () {
    wx.reLaunch({
      url: '../honghong/honghong',
    })
  },
  go: function () {
    wx.navigateTo({
      url: '../paihang/paihang',
    })
  },
  btn: function (e) {
    var that = this
    // console.log(e)
    var id = e.currentTarget.id;
    var list = that.data.list[id]
    this.setData({
      showModal: true,
      btn: list
    })
  },
  geren: function () {
    if (wx.getStorageSync("userInfo")) {
      wx.navigateTo({
        url: '../paihang/geren_xiangqing',
      })
    } else {
      this.showLogin()
    }
  },

  /**
   * 授权通过
   */
  permitted: function (e) {
    // console.log('子组件传值', e.detail)
    if (!e.detail.enabled) {
      this.hideLogin()
      // wx.redirectTo({
      //   url: 'geren_xiangqing'
      // })
    }
  },

  /**
   * 显示登录授权框
   */
  showLogin: function () {
    this.setData({
      login_enabled: true
    })
  },

  /**
   * 隐藏登录授权框
   */
  hideLogin: function () {
    this.setData({
      login_enabled: false
    })
  },

  // 处理长时间点赞松开后出发单击事件
  bindTouchStart: function (e) {
    //查看是否登录
    if (!wx.getStorageSync("userInfo")) {
      wx.showToast({
        title: '请登录',
        icon: 'none',
      })
      this.showLogin()
    }
    this.startTime = e.timeStamp;
  },
  // 处理长时间点赞松开后出发单击事件
  bindTouchEnd: function (e) {
    var that = this;
    this.endTime = e.timeStamp;
    if (that.data.bind == "long") {
      //长时间点击按钮松开后事件
      clearInterval(that.data.interval);
      //执行已经连续点赞的次数添加到数据库----------------------------------数据库
      var id = e.currentTarget.id;
      var list = that.data.list;
      for (var i in list) {
        if (id == list[i].id) {
          var listOver = list[i];
        }
      }
      
      util.request(
        api.like,
        {
          topicId: id,
          userId: wx.getStorageSync('userId'),
          num: that.data.dianzanNum
        },
        "post"
      ).then(res=>{
        console.log(res);
      })
      //把连续点赞的次数归零
      that.setData({ dianzanNum: 1});
    }
  },
  //单击赞按钮
  dianzan: function (e) {
    //查看是否登录
    if (!wx.getStorageSync("userInfo")) {
      wx.showToast({
        title: '请登录',
        icon: 'none',
      })
      this.showLogin()
    }
    var that = this
    //设置判断是否是单击
    that.setData({
      bind: "one"
    })
    if (this.endTime - this.startTime < 350) {
      //点赞一次，先把页面的显示增加，再向数据库发送
      var id = e.currentTarget.id;
      var list = that.data.list;
      for (var i in list) {
        if (id == list[i].id) {
          var listOver = list[i];
        }
      }
      listOver.likeSum = listOver.likeSum - 0 + 1;
      list[e.currentTarget.dataset.alphabeta] = listOver;
      that.setData({
        list: list,
        btn: listOver
      })
      //执行点赞一次，向数据库进行添加数据----------------------------------数据库
      util.request(
        api.like,
        {
          topicId: parseInt(id),
          userId: wx.getStorageSync('userId'),
          num: 1
        },
        'POST'
      ).then(res => {
        console.log(res)
      })
    }
  },

  changdianzan: function (e) {
    var that = this
    //设置判断是否是长时间按
    that.setData({
      bind: "long"
    })
    //长时间点赞增加赞数
    var interval = setInterval(function () {
      var numVal = that.data.dianzanNum + 1;
      that.setData({ dianzanNum: numVal });
      var id = e.currentTarget.id;
      var list = that.data.list;
      for (var i in list) {
        if (id == list[i].id) {
          var listOver = list[i];
        }
      }
      listOver.likeSum = listOver.likeSum - 0 + 1;
      list[e.currentTarget.dataset.alphabeta] = listOver;
      that.setData({
        list: list,
        btn: listOver
      })
    }, 200)
    //设置interval为全局变量
    that.setData({
      interval: interval,
    })
  },


  getLeaderBoard: function () {
    let that = this
    // 请求日排行数据
    wx.request({
      url: api.topicLeaderBoard,
      data: {
        userId: 11,
        dayOrMonth: this.data.dayOrMonth
      },
      success: function (res) {
        // console.log('排行榜', res)
        if (res.data.code == 200) {
          that.setData({
            list: res.data.data.all.content
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            duration: 1500
          })
        }
      }
    })
  },

  getDayList: function () {
    this.setData({
      dayOrMonth: 0
    })
    this.getLeaderBoard()
  },

  getMonthList: function () {
    this.setData({
      dayOrMonth: 1
    })
    this.getLeaderBoard()
  },

  // 弹出层里面的弹窗
  ok: function () {
    this.setData({
      showModal: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getLeaderBoard();
    var that = this;
    setTimeout(function(){
      console.log(that.data.list)
      
    },200)
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})