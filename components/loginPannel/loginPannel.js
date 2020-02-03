const util  = require("../../utils/util")
const api   = require("../../config/api")

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    enabled:{
      type:Boolean,
      value:true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    enabled: true
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onWechatLogin: function(e){
      
      let that  = this
      if( e.detail.errMsg !== 'getUserInfo:ok' ){
        if( e.detail.errMsg === 'getUserInfo:fail auth deny'){
          return false
        }
        wx.showToast({
          title: '登录失败',
          icon: 'none',
          duration: 1000
        })
      }
      // 授权后登录
      util.login().then(function(res){
        // console.log('用户信息',e.detail.userInfo);
        // console.log('code',res.code);
        let gender  = 'UNKNOW'
        switch( e.detail.userInfo.gender ){
          case 1:
            gender  = 'MAN'
            break
          case 2:
            gender  = 'WOMAN'
            break
          default:
            gender  = 'UNKNOW'
        }
        
        return wx.request({
          url: api.login,
          method: 'post',
          header: {
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
          },
          data: {
            nickName: e.detail.userInfo.nickName,
            avatarUrl: e.detail.userInfo.avatarUrl,
            gender: gender,
            country: e.detail.userInfo.country,
            province: e.detail.userInfo.province,
            city: e.detail.userInfo.city,
            language: e.detail.userInfo.language,
            code: res.code,
          },
          success: function(ret) {
            // console.log('服务端登录返回', ret)
            if( ret.data.code == 200 ){
              //id写入
              wx.setStorage({
                key: 'userId',
                data: ret.data.data.data.user.id,
              })
              // console.log(ret)
              // token写入
              wx.setStorage({
                key: 'token',
                data: ret.data.data.data.thirdSession,
              })
              // 获得登录信息
              wx.setStorage({
                key: 'userInfo',
                data: e.detail.userInfo,
              })
              // 修改enabled
              that.triggerEvent('permitted', { enabled: false })
              wx.showToast({
                title: '登陆成功',
              })
            }
            else{
              wx.showToast({
                title: '登录失败,请重试',
                content: '',
                icon:'none',
                showCancel: true,
              })
            }
            
            
          }
        })
      }).catch((err)=>{
        console.log( '登录异常', err )
      })
    }
  }
})
