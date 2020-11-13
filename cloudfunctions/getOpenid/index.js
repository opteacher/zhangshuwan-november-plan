// 云函数入口文件
const cloud = require("wx-server-sdk")

cloud.init({env: "test-8gz67lpof2b9185f"})

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