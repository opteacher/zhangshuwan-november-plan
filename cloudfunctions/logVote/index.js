// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: "test-8gz67lpof2b9185f"})
const db = cloud.database()

// 云函数入口函数
exports.main = event => db.collection("vote").where({
  _openid: event._openid,
  type: event.type,
  available: event.available
}).update({
  data: {articleId: event.articleId, timestamp: Date.now(), available: false}
})