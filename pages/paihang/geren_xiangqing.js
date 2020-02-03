const api = require("../../config/api.js")
const util = require("../../utils/util.js")
const app = getApp()

Page({

  isShow:function(){
    // console.log("显示所有数据")
  },

  /**
   * 页面的初始数据
   */
  data: {
    isOnFocus: false, //评论框控制器
    userInfo: {}, //用户信息
    selected: true,
    selected1: false,
    selected2: false,
    topicList: [], //用户话题列表
    commentTopicList: [],//评论话题列表
    likeTopicList:[],//点赞话题列表
  },
  selected: function (e) {
    this.setData({
      selected1: false,
      selected2: false,
      selected3: false,
      selected4: false,
      selected: true
    })
  },
  selected1: function (e) {
    this.setData({
      selected: false,
      selected2: false,
      selected3: false,
      selected4: false,
      selected1: true
    })
  },
  selected2: function (e) {
    this.setData({
      selected: false,
      selected2: true,
      selected3: false,
      selected4: false,
      selected1: false
    })
  },

  /**
   * 跳回honghong
   */
  index() {
    wx.redirectTo({
      url: '../honghong/honghong'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //获取用户信息
    that.setData({
      userInfo: wx.getStorageSync('userInfo')
    });

    //我的发布
    util.request(
      api.userTopicList,
      { userId: wx.getStorageSync('userId'), size: 9999,},
      'GET'
    ).then(res => {
      that.setData({
        topicList: res.data.content.reverse(),
      })
      // console.log('我的发布', res);

      
      //点赞
      for (var i = 0; i < that.data.topicList.length;i++) {
        util.request(
          api.likeList,
          { topicId: that.data.topicList[i].id},
          "GET"
        ).then(res => {
          // console.log('点赞列表', res);
          for (var j = 0; j < that.data.topicList.length; j++){
            if (res.data.length == 0)break;
            //点赞名字
            var userIds = [];
            for (var z = 0; z < res.data.length; z++) {
              if (userIds.indexOf(res.data[z].user.nickname) == -1){
                userIds.push(res.data[z].user.nickname);
              }
              if (that.data.topicList[j].id == res.data[z].topicId){
                that.data.topicList[j].userLikes = userIds.reverse();
              }
            }
            //end 点赞名字
            if (res.data[0].topicId == that.data.topicList[j].id){
              that.data.topicList[j].likeList = res.data.reverse();
            }
          }
          //写入点赞列表数据
          that.setData({
            likeTopicList: that.data.topicList
          })
          var tls = 0;
          for (var i = 0; i < that.data.likeTopicList.length; i++) {
            if (that.data.likeTopicList[i].likeList == undefined)
              continue;
            tls++;
          }
          that.setData({
            likeListSum : tls
          })
        })
      }
      //end 点赞


      //消息
      for (var i = 0; i < that.data.topicList.length; i++) {
        util.request(
          api.commentList,
          { topicId: that.data.topicList[i].id, size: 999},
          "GET"
        ).then(res => {
          // console.log('评论列表', res)

          for (var a = 0; a < res.data.content.length;a++){
            if (res.data.content[a].type == "REPLY"){
              for (var b = 0; b < res.data.content.length; b++) {
                if (res.data.content[b].id == res.data.content[a].ownerId){
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
              that.data.topicList[j].pinglunsum = res.data.content.length;
            }
          }
          //写入评论列表数据
          that.setData({
            commentTopicList: that.data.topicList
          })
          // console.log(that.data.commentTopicList)
          var cls = 0;
          for (var i = 0; i < that.data.commentTopicList.length;i++){
            if (that.data.commentTopicList[i].commentList == undefined)
              continue;
            cls++;
          }
          // console.log(cls);
          that.setData({
            commentListSum : cls,
          })
          // console.log(that.data.commentListSum);
        })
      }
      //end 请求消息

    });
    //end 请求发布



  },

  //添加评论
  setTopicId:function(e){
    this.setData({
      topicId: e.currentTarget.dataset.id
    })
  },
  addComment:function(e){
    this.setData({
      commentName: '输入你想说的内容',
      commentId: e.currentTarget.dataset.id
    }),
     
    this.setData({
      isOnFocus: true, 
    })
  },
  addCommentInputChenge:function(e){
    this.setData({
      commentContent: e.detail.value
    })
  },
  addCommentRequest:function(){
    var that = this;
    if (that.data.commentContent == undefined || that.data.commentContent == ""){
      wx.showToast({
        icon: 'none',
        title: '没有输入内容',
      })
      return;
    }
    util.request(
      api.addComment,
      { type: 'REPLY', topicId: that.data.topicId, ownerId: that.data.commentId, userId: wx.getStorageSync("userId"), content: that.data.commentContent},
      "POST"
    ).then(res=>{
      // console.log(res);
      if(res.msg == "成功"){
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
            console.log('评论列表', res)

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
    })
  },
  addCommentBlur: function () {
    this.setData({
      isOnFocus: false,
    })
  },

  //跳转到他人页面
  go_xiangqing: function (e) {
    //把点击头像的用户id存入userId，供详情页使用
    app.globalData.userId = e.currentTarget.id;
    wx.navigateTo({
      url: '../paihang/xiangqing',
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