// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: "prod-7gyout13519352e3"})
const db = cloud.database()

// 云函数入口函数
exports.main = event => db.collection("player").doc(event._id).update({
  data: {status: "参赛"}
})