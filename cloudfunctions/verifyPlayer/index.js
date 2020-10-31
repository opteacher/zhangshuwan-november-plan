// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event) => {
  const res = await db.collection("player").where(event).get()
  let result = 1
  if (!res.data || !res.data.length) {
    result = "未查找到该用户，请检查填写信息是否正确！"
  } else if (res.data[0].status === "禁赛") {
    result = "该用户已被禁赛，请联系管理员！"
  } else if (res.data[0].status === "参赛") {
    result = "该用户已参赛，不可重复报名！"
  }
  return result
}