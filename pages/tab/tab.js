// pages/tab/tab.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selected: true,
    selected1: false,
    selected2: false,
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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