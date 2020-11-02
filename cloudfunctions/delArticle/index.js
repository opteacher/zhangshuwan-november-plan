// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: cloud.DYNAMIC_CURRENT_ENV})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  return db.runTransaction(async transaction => {
    try {
      // 删除作品的投票记录
      await transaction.collection("vote").where(event).remove()
      // 获取作品实例，从中获得图片ID字段
      let res = await transaction.collection("article").doc(event.articleId).get()
      // 删除图片文件
      await cloud.deleteFile({fileList: [res.data.picID]})
      // 删除作品
      await transaction.collection("article").doc(event.articleId).remove()
    } catch(e) {
      (async () => {await transaction.rollback(e)})()
      return Promise.reject(e)
    }
  })
}