const baseUrl = "https://hh.emmspirit.com:8088/"
// const baseUrl = "http://106.13.113.244:8080/"
// 接口文档  https://hh.emmspirit.com:8088/swagger-ui.html

module.exports = {
  
  login: baseUrl + "auth/auth",   // 微信授权

  cloudList: baseUrl + "topic/topicList",  // 云朵弹幕 keyword,city,page,size
  topicAdd: baseUrl + "topic/add",  // 发布话题 userId,title,content,type话题分类,isTrue是否为真实数据
  topicLeaderBoard  : baseUrl + "topic/leaderBoard",  // 排行榜 dayOrMonth(int)日/月排行,page分页页码,size分页大小
  topicMyList : baseUrl + "topic/topicList",  // 某用户发布的话题列表 userId,page,size
  topicList : baseUrl + "topic/topicList",  // 话题列表 keyword,city(String),page,size
  userTopicList : baseUrl + "topic/oneUserList",  // 用户发布的主题列表 userId,page,size

  like  : baseUrl + "like/like",  // 点赞 topicId,userId,num
  

  addComment: baseUrl + "comment/add", //添加评论
  commentList: baseUrl + "comment/list", //评论列表
  likeList: baseUrl + "like/list", //点赞列表
}