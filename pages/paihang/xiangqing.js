// pages/paihang/xiangqing.js
const app = getApp();
const api = require("../../config/api.js");
const util = require("../../utils/util.js")
Page({

  /**
 * 授权通过
 */
  permitted: function (e) {
    if (!e.detail.enabled) {
      this.hideLogin()
    }
  },

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    topicList: [], //用户话题列表
    login_enabled: false, // 登录框显示状态
    dianzanNum: 1, //计算点赞次数
  },


  /**
  * 显示登录授权框
  */
  showLogin: function () {
    wx.showToast({
      title: '请先登录',
      icon: "none"
    })
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


  //跳转到主页面
  go_honghong:function () {
    wx.reLaunch({
      url: '../honghong/honghong',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var userId = app.globalData.userId
    //查询用户信息与此条数据
    util.request(
      api.userTopicList,
      { userId: userId, size: 9999,},
      'GET'
    ).then(res => {
      // console.log(res)
      that.setData({
        userInfo: res.data.content[0],
        topicList: res.data.content.reverse(),
      })
      
      

      //消息
      for (var i = 0; i < that.data.topicList.length; i++) {
        util.request(
          api.commentList,
          { topicId: that.data.topicList[i].id, size: 999 },
          "GET"
        ).then(res => {
          // console.log('评论列表', res)

          for (var a = 0; a < res.data.content.length; a++) {
            if (res.data.content[a].type == "REPLY") {
              for (var b = 0; b < res.data.content.length; b++) {
                if (res.data.content[b].id == res.data.content[a].ownerId) {
                  res.data.content[a].thisReplyCommentUserList = res.data.content[b];
                  res.data.content[a].thisReplyCommentUserName = res.data.content[b].user.nickname;
                }
              }
            }
          }

          for (var j = 0; j < that.data.topicList.length; j++) {
            if (res.data.content.length == 0) break;
            if (res.data.content[0].topicId == that.data.topicList[j].id) {
              that.data.topicList[j].commentList = res.data.content.reverse();
              // that.data.topicList[j].commentSum = res.data.content.length;
            }
          }
          //写入评论列表数据
          that.setData({
            commentTopicList: that.data.topicList
          })
        })
      }
      //end 请求消息

    });
  },//end onload





  //添加评论
  addCommentTopic: function (e){
    this.setData({
      commentType: "TOPIC_COMMENT",
      commentName: '输入你想说的内容',
      commentId: e.currentTarget.dataset.id,
      isOnFocus: true,
    })
  },
  setTopicId: function (e) {
    this.setData({
      topicId: e.currentTarget.dataset.id
    })
  },
  addComment: function (e) {
    this.setData({
      commentType: 'REPLY',
      commentName: '输入你想说的内容',
      commentId: e.currentTarget.dataset.id,
      isOnFocus: true,
    })

  },
  addCommentInputChenge: function (e) {
    this.setData({
      commentContent: e.detail.value
    })
  },
  addCommentRequest: function () {
    //判断是否存在用户信息
    if (!wx.getStorageSync("userInfo")) {
      this.showLogin();
      return;
    }
    var that = this;
    if (that.data.commentContent == undefined || that.data.commentContent == "") {
      wx.showToast({
        icon: 'none',
        title: '没有输入内容',
      })
      return;
    }
    util.request(
      api.addComment,
      { type: that.data.commentType, topicId: that.data.topicId, ownerId: that.data.commentId, userId: wx.getStorageSync("userId"), content: that.data.commentContent },
      "POST"
    ).then(res => {
      if (res.msg == "成功") {
        wx.showToast({
          title: '评论成功',
        })

        that.data.commentContent = "";
        //消息
        for (var i = 0; i < that.data.topicList.length; i++) {
          util.request(
            api.commentList,
            { topicId: that.data.topicList[i].id, size: 999 },
            "GET"
          ).then(res => {
            // console.log('评论列表', res)

            for (var a = 0; a < res.data.content.length; a++) {
              if (res.data.content[a].type == "REPLY") {
                for (var b = 0; b < res.data.content.length; b++) {
                  if (res.data.content[b].id == res.data.content[a].ownerId) {
                    res.data.content[a].thisReplyCommentUserList = res.data.content[b];
                    res.data.content[a].thisReplyCommentUserName = res.data.content[b].user.nickname;
                  }
                }
              }
            }

            for (var j = 0; j < that.data.topicList.length; j++) {
              if (res.data.content.length == 0) break;
              if (res.data.content[0].topicId == that.data.topicList[j].id) {
                that.data.topicList[j].commentList = res.data.content.reverse();
                // that.data.topicList[j].commentSum = res.data.content.length;
              }
            }
            //写入评论列表数据
            that.setData({
              commentTopicList: that.data.topicList
            })
            var cls = 0;
            for (var i = 0; i < that.data.commentTopicList.length; i++) {
              if (that.data.commentTopicList[i].commentList == undefined)
                continue;
              cls++;
            }
            // console.log(cls);
            that.setData({
              commentListSum: cls,
            })
            // console.log(that.data.commentListSum);
          })
        }
        //end 请求消息
      }
      else{
        wx.showToast({
          title: '评论失败,请重试',
        })
      }
    })
  },
  addCommentBlur: function () {
    this.setData({
      isOnFocus: false,
    })
  },


  //点赞
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
      var list = that.data.commentTopicList;
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
      ).then(res => {
        // console.log(res);
      })
      //把连续点赞的次数归零
      that.setData({ dianzanNum: 1 });
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
      var list = that.data.commentTopicList;
      for (var i in list) {
        if (id == list[i].id) {
          var listOver = list[i];
        }
      } 
      listOver.likeSum = listOver.likeSum - 0 + 1;
      list[e.currentTarget.dataset.alphabeta] = listOver;
      that.setData({
        commentTopicList: list,
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
        // console.log(res)
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
      // console.log(that.data.dianzanNum)
      var id = e.currentTarget.id;
      var list = that.data.commentTopicList;
      for (var i in list) {
        if (id == list[i].id) {
          var listOver = list[i];
        }
      }
      listOver.likeSum = listOver.likeSum - 0 + 1;
      list[e.currentTarget.dataset.alphabeta] = listOver;
      that.setData({
        commentTopicList: list,
        btn: listOver
      })
    }, 200)
    //设置interval为全局变量
    that.setData({
      interval: interval,
    })
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