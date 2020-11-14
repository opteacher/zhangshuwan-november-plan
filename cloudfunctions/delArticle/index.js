// 云函数入口文件
const cloud = require('wx-server-sdk')
const http = require("http")
const util = require("util")
const querystring = require("querystring")

cloud.init({env: "test-8gz67lpof2b9185f"})
const db = cloud.database()

// 云函数入口函数
exports.main = event => db.runTransaction(async transaction => {
  try {
    // 删除作品的投票记录
    await transaction.collection("vote").where({articleId: event.articleId}).remove()
    // 获取作品实例，从中获得图片ID字段
    let res = await transaction.collection("article").doc(event.articleId).get()
    if (!res.data) {
      throw new Error("查询作品错误！返回值缺少data字段")
    }
    // 删除图片文件
    await util.promisify(http.request)("http://42.194.147.175:4000", {
      method: "DELETE",
      auth: "opteacher:59524148",
      path: `/zhangshuwan_november_plan/api/v1/files/delete?${querystring.stringify({
        fname: res.data.picID
      })}`
    })
    // 修改选手状态为未参赛
    await transaction.collection("player").where({
      name: res.data.author,
      room: res.data.room
    }).update({data: {status: "未参赛"}})
    // 删除作品
    await transaction.collection("article").doc(event.articleId).remove()
  } catch(e) {
    (async () => {await transaction.rollback(e)})()
    return Promise.reject(e)
  }
})