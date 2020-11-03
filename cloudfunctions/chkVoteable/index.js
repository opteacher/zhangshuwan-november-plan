// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: "test-8gz67lpof2b9185f"})
const db = cloud.database()
const _ = db.command

function isTimestampBelongToday(timestamp) {
  if (new Date(timestamp).toDateString() === new Date().toDateString()) {
    return true
  } else if (new Date(timestamp) < new Date()){
    return false
  }
  return false
}

// 云函数入口函数
exports.main = async event => {
  const wxContext = await cloud.getWXContext()
  const openid = wxContext.OPENID

  let res = null
  try {
    // 获取大于等于今天零点的所有记录
    const todayTimestamp = new Date(new Date().toLocaleDateString()).getTime()
    res = await db.collection("vote").where({
      _openid: openid,
      timestamp: _.gte(todayTimestamp).or(_.exists(false))
    }).get()
  } catch(e) {
    return Promise.reject({error: e})
  }
  if (!res.data || !res.data.length) {
    // 插入三条记录并将每日投票记录设为可用
    const voteBase = {
      _openid: openid,
      voteUser: {
        nickName: event.votingUser.nickName,
        avatarUrl: event.votingUser.avatarUrl
      },
      articleId: event.votingArticleId
    }
    let transaction = null
    try {
      await db.runTransaction(async ta => {
        transaction = ta
        await ta.collection("vote").add({
          data: Object.assign(voteBase, {type: "daily", available: true})
        })
        await ta.collection("vote").add({
          data: Object.assign(voteBase, {type: "repost", available: false})
        })
        await ta.collection("vote").add({
          data: Object.assign(voteBase, {type: "moments", available: false})
        })
      })
    } catch(e) {
      await transaction.rollback(e)
      return Promise.reject({error: e})
    }
    return Promise.resolve({openid, type: "daily", votable: true})
  }
  // 检查有可用的投票记录
  let avaType = undefined
  for (let vtRcd of res.data) {
    console.log(vtRcd)
    if (vtRcd.available) {
      return Promise.resolve({openid, type: vtRcd.type, votable: true})
    } else if (!vtRcd.timestamp) {
      // 如果还存在时间戳为空但不可用的记录，表示投票者可通过转发或者发朋友圈获得投票机会
      avaType = vtRcd.type
    }
  }
  // 没有可用投票记录，无投票资格
  return Promise.resolve({type: avaType, votable: false})
}