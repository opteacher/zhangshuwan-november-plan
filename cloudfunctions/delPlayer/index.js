// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require("axios")

cloud.init({env: "prod-7gyout13519352e3"})
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
      await axios.delete("https://boysenberry-ok4uhinb.pai.tcloudbase.com:5523/zhangshuwan_november_plan/api/v1/files/delete", {
        params: {fname: article.picID},
        auth: {username: "opteacher", password: "59524148"}
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