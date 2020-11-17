// 云函数入口文件
const cloud = require("wx-server-sdk")

cloud.init({env: "prod-7gyout13519352e3"})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = await cloud.getWXContext()

  return Promise.resolve({
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  })
}