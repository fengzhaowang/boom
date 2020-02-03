/**
 * cloud被创建后需要动态设置 x,y 坐标
 * cloud向上飘动
 * 点击时停止动画
 * 点赞时爱心动画，点住时每0.5秒显示计数+1
 * 点击松开3s后恢复动画、隐藏爱心和计数
 */
const api = require("../../config/api.js")
const app = getApp()
const util = require("../../utils/util.js")

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		aniDelay: {
			type: Number,
			value: 1
		},
    pic:{
      type: String,
      value: ''
    },
		userName: {
			type: String,
			value: '我是主题'
		},
		date: {
			type: String,
			value: '2019.8.17'
		},
		content: {
			type: String,
			value: '内容'
		},
    topicId: {//id
      type: Number,
      value: 0
    },
    longClickSum: {
      type: Number,
      value: 0
    },
		screenHeight: {
			type: Number,
			value: 0
		},
		offX: {
			type: Number,
			value: 0
		},
    hits: {
      type: Number,
      value: 0
    }
	},

	/**
	 * 组件的初始数据
	 */
	data: {
    timer : [],
		isAniPaused: false,
		isShow: false, //控制收起展开
    longClickSums: 0,//控制点赞次数
    s:'',//点赞的setintval控制
    //记录次数，避免过多执行函数
    clickNum:0,
    dianzanNum: 1,
	},
	/**
	 * 组件的方法列表
	 */
	methods: {

    topicXiangQing: function (e) {
      var that = this;
      var topicId = that.data.topicId;
      app.globalData.clickIndexId = topicId;
      util.request(
        api.cloudList,
        {},
        'POST'
      ).then(res => {
        var resDate = res.data;
        for (var i in resDate) {
          if (resDate[i].id == topicId){
            // console.log(resDate[i].user.id);
            app.globalData.clickUserId = resDate[i].user.id
            wx.navigateTo({
              url: '/pages/topicXiangQing/topicXiangQing',
            })
          }
        }
      });
    },

		/**
		 * 留言展开收起
		 */
		toChange: function() {
			let that = this;
			that.setData({
				isShow: !that.data.isShow
			})
		},
		/**
		 * 改变动画运行状态
		 */
		pause: function(e) {
      var that = this;
      
      if (that.data.timer.length){//修复云朵点击的bug
        clearTimeout(that.data.timer.pop());
      }
      that.setData({
				isAniPaused: true,
			})
      console.log(e)
		},
		play: function(){
			let that	= this
			// 3秒后恢复
			if (this.data.isAniPaused) {
				var t	= setTimeout(function(){
          that.data.timer.pop()
					that.setData({
						isAniPaused: false
					})
				}, 3000)
        that.data.timer.push(t)
			}
		},

    
		/**
		 * 动画播放结束时，
		 */
		aniEnd: function(){
			
		},

		attached: function() {
			console.log('组件加载')
		},


    // 处理长时间点赞松开后出发单击事件
    bindTouchStart: function (e) {
      this.startTime = e.timeStamp;
    },


    // 处理长时间点赞松开后出发单击事件
    bindTouchEnd: function (e) {
      var that = this;
      this.endTime = e.timeStamp;
      if (that.data.bind == "long") {
        //长时间点击按钮松开后事件
        clearInterval(that.data.interval);
        //传输到后台
        util.request(
          api.like,
          { topicId: parseInt(that.data.topicId), userId: wx.getStorageSync('userId'), num: that.data.dianzanNum },
          'POST'
        ).then(res => {
        });
      }
    },


    dianzan:function(e){
      var that = this
      if (that.data.clickNum == 0){
        //设置判断是否是单击
        that.setData({
          bind: "one",
          clickNum: 1
        })
        var userId = wx.getStorageSync('userId')
        if (this.endTime - this.startTime < 350) {
          //点赞一次，先把页面的显示增加，再向数据库发送

          //执行点赞一次，向数据库进行添加数据----------------------------------数据库
          util.request(
            api.like,
            { topicId: parseInt(that.data.topicId), userId: wx.getStorageSync('userId'), num: 1 },
            'POST'
          ).then(res => {
            that.setData({
              longClickSum: that.data.longClickSum + 1
            })
          });
        }
      }else{
        that.setData({
          clickNum: 0
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
        that.setData({ 
          dianzanNum: numVal,
          longClickSum: that.data.longClickSum + 1
        });
      }, 200)
      //设置interval为全局变量
      that.setData({
        interval: interval,
      })
    },

	},



})
