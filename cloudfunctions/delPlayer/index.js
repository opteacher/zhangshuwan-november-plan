// 云函数入口文件
const cloud = require('wx-server-sdk')
const http = require("http")
const util = require("util")

cloud.init({env: "test-8gz67lpof2b9185f"})
const db = cloud.database()

// 云函数入口函数
exports.main = event => db.runTransaction(async transaction => {
  try {
    // 查询该选手的作品并删除
    let res = await db.collection("article").where({authorId: event._id}).get()
    if (res.data && res.data.length) {
      const article = res.data[0]
      // 删除作品的投票记录
      await transaction.collection("vote").where({articleId: article._id}).remove()
      // 删除图片文件
      await util.promisify(http.request)("http://42.194.147.175:4000", {
        method: "DELETE",
        auth: "opteacher:59524148",
        path: `/zhangshuwan_november_plan/api/v1/files/delete?${querystring.stringify({
          fname: article.picID
        })}`
      })
      // 删除作品
      await transaction.collection("article").doc(article._id).remove()
    }
    // 删除选手
    await transaction.collection("player").doc(event._id).remove()
  } catch(e) {
    (async () => {await transaction.rollback(e)})()
    return Promise.reject(e)
  }
})