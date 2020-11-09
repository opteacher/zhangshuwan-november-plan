// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: "prod-7gyout13519352e3"})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async event => {
  const wxContext = await cloud.getWXContext()
  return db.collection("vote").where({
    _openid: wxContext.OPENID,
    type: event.voteType,
    timestamp: _.gte(new Date(new Date().toLocaleDateString()).getTime())
  }).update({
    data: {available: true}
  })
}