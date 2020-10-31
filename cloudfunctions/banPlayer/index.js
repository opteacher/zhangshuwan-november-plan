// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event) => {
  const doc = db.collection("player").doc(event._id)
  const result = await doc.get()
  return doc.update({
    data: {status: result.data.status === "禁赛" ? "未参赛" : "禁赛"}
  })
}