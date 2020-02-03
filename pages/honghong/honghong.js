const api = require("../../config/api.js")
const util  = require("../../utils/util.js")
var timer = []

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {}, //用户信息
    hiddenName: true,
    isWorld:true, // 是否世界数据
    isShow: false, //控制收起展开
    showModalStatus: false,
    isShow_s:false, // 控制输入框显示隐藏
    isRuleTrue: false,
    userInput: '',  // 用户输入
    screenWidth:0,  //屏幕宽度
    screenHeight:0, // 屏幕高度
    cloudWidth: 0,  // 云宽度
    cloudList:[],
    queryInput:'',//搜索输入
    login_enabled: false, // 登录框显示状态
  },

  /**
   * 改变 世界/同城 频道
   */
  switchWorldChannel:function(){
    
    this.setData({
      isWorld: true,
      cloudList: []
    })
    this.updateCloudList()
  },
  switchCityChannel: function () {
    //判断是否存在用户信息
    if (!wx.getStorageSync("userInfo")) {
      this.showLogin();
      return;
    }
    this.setData({
      isWorld: false,
      cloudList: []
    })
    this.updateCloudList()
  },
  /**
   * 搜索
   */
  search: function(event){
    this.data.queryInput = event.detail.value;
  },
  searchbutton: function () {
    var that = this;
    //判断是否存在用户信息
    if (!wx.getStorageSync("userInfo")) {
      that.showLogin();
      return;
    }
    that.setData({
      cloudList:[]
    })
    that.updateCloudList('query');
  },
  toChange: function () {
    let that = this;
    that.setData({
      isShow: !that.data.isShow
    })
  },
  /**
   * 输入框显示隐藏
   */
  toChange_s: function () {
    let that = this;
    wx.checkSession({
      success: function(res){
        that.setData({
          attrD:'',
          attrL:'',
          isShow_s: !that.data.isShow_s,
          isRuleTrue: !that.data.isRuleTrue
        })  
      },
      fail: function(){
        that.showLogin()
      },
    })

  },

  toChanges: function () {
    let that = this;
    that.setData({
      isShows: !that.data.isShows
    })
  },
  toChangess: function () {
    let that = this;
    that.setData({
      isShowss: !that.data.isShowss
    })
  },
  
  
  /**
   * 授权通过
   */
  permitted: function(e){
    
    if( ! e.detail.enabled ){
      this.hideLogin()
    }
  },
  /**
   * 用户输入
   */
  inputWords: function(e){
    this.setData({
      userInput: e.detail.value
    })
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

  
  /**
   * 发布
   */
  say:function(){
    let that = this
    //判断是否存在用户信息
    if (!wx.getStorageSync("userInfo")) {
      that.showLogin();
      return;
    }
    
    this.setData({
      userInput: that.data.userInput.trim()
    })
    if (this.data.userInput == '' ){
      wx.showToast({
        title: '请先说点儿什么',
        icon: 'none',
        duration: 1000
      })
      return false;
    }
    
    util.request( api.topicAdd,
      {
        userId: wx.getStorageSync('userId'),
        content: this.data.userInput,
        city: wx.getStorageSync('userInfo').city,
        isTrue: true
      },
      'POST',
    ).then(res=>{
      if (res.code != 200){
        wx.showToast({
          title: '发布失败',
          icon: 'none',
        })
        return;
      }
      if (res.msg == '成功') {
        wx.showToast({
          title: '发布成功',
          content: '',
        })
        this.setData({
          userInput: ''
        })
      }
    });

  },
  
  go:function(){
    wx.redirectTo({
      url:'../paihang/paihang',
    })
  },
  xiangqing: function () {
    wx.navigateTo({
      url: '../paihang/xiangqing',
    })
  },
  show:function(){
    this.setData({
      hiddenName: !this.data.hiddenName
    })
  },
  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },

  switchChange: function (e) {
    console.log('switch2 发生 change 事件，携带值为', e.detail.value);
  },

  /**
   * 更新云朵队列
   */
  updateCloudList: function(q){
    let newList = []
    let that  = this
    let city  = this.data.isWorld ? '' : wx.getStorageSync('userInfo').city
    // console.log('city',wx.getStorageSync('userInfo'))
    // 获取云朵弹幕数据
    util.request(
     api.cloudList,
      { 'city': city},
      "POST"
    ).then(res=>{
        // console.log('cloudList', res)
        if (res.code == 200) {
          var tmpList = res.data;
          for (let i in tmpList) {
            let vo = tmpList[i]

            // 随机分配云朵的aniDelay和offX
            let aniDelay = Math.random() * 10
            let offX = Math.random() * that.data.screenWidth
            
            newList.push({
              topicId: vo.id,
              aniDelay: aniDelay,
              userName: vo.user.nickname,
              pic: vo.user.headImg,
              hits: vo.likeSum,
              date: vo.createdAt,
              content: vo.content,
              longClickSum: vo.likeSum,
              offX: offX
            })

          }

          if (that.data.cloudList.length > 150) {//最多显示150条
            that.setData({
              cloudList: []
            })
          }

          if (q == 'query') {//搜索遍历
            for (var i = newList.length - 1; i >= 0; i--) {
              if (newList[i].userName == null || newList[i].content == null) continue;//indexOf遇到null会报错
              if (newList[i].userName.indexOf(that.data.queryInput) == -1 && newList[i].content.indexOf(that.data.queryInput) == -1) {
                newList.splice(i, 1)
              }

            }

            that.setData({
              cloudList: that.data.cloudList.concat(newList)
            })
          }
          else {
            that.setData({
              cloudList: that.data.cloudList.concat(newList)
            })
          }


        }
      }
      )

    // TODO: 移除飘到顶的留言


    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    /**
    // 获取云宽度
    var clouWidth = 0
    let query = wx.createSelectorQuery()
    query.select(".honghong_content_yun").boundingClientRect(function (res) {
      console.log( 'res', res )
      cloudWidth = res.width
    }).exec()
     */

    

    this.setData({
      screenWidth: wx.getSystemInfoSync().screenWidth,
      screenHeight: wx.getSystemInfoSync().screenHeight,
      // cloudWidth: cloudWidth
    })

    // 每1秒改变云朵队列
    // var t = setInterval( this.updateCloudList, 1000 )
    this.updateCloudList()
    setInterval(function(){
      that.updateCloudList()
    }, 20 * 1000 )
  },
  onChangeShowState: function () {
    var that = this;
    that.setData({
      showView: (!that.data.showView)
    })
  },


  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 页面渲染完成

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
  
  },

  sss: function (res) {
    util.bindGetUserInfo(res);
  }
})