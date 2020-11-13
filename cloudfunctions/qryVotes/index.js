// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: "test-8gz67lpof2b9185f"})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async event => {
  try {
    let res = await db.collection("vote").where({
      articleId: _.exists(true),
      timestamp: _.exists(true)
    }).skip(event.page || 0).get()
    if (!res.data) {
      throw new Error("查询投票记录失败！返回值缺少data字段")
    }
    let result = res.data

    const articleIds = result.map(vote => vote.articleId)
    res = await db.collection("article").field({
      _id: true, author: true, room: true
    }).where({_id: db.command.in(articleIds)}).get()
    if (!res.data) {
      throw new Error("查询作品集失败！返回值缺少data字段")
    }
    let articles = {}
    for (let article of res.data) {
      articles[article._id] = {
        name: article.author,
        room: article.room
      }
    }

    result = result.map(vote => {
      vote.articleAuthor = articles[vote.articleId]
      return vote
    })
    return Promise.resolve(result)
  } catch (e) {
    return Promise.reject(e)
  }
}