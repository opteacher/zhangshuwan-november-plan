// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: "test-8gz67lpof2b9185f"})
const db = cloud.database()

// 云函数入口函数
exports.main = event => db.collection("player").doc(event._id).update({
  data: {status: "参赛"}
})