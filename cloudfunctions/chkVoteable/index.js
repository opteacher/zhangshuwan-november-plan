// 云函数入口文件
const cloud = require('wx-server-sdk')
const dateUtil = require("../../miniprogram/utils/date")

cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let earlyRecords = []
  try {
    let res = await db.collection("vote").where(event)
      .orderBy("timestamp", "desc").limit(3).get()
    if (!res.data) {
      throw new Error(`查询投票集失败！${res.errMsg}`)
    }
    if (res.data.length < 3) {
      return Promise.resolve(true)
    }
    earlyRecords = res.data
  } catch(e) {
    return Promise.reject(e)
  }
  let earliest = earlyRecords[2].timestamp
  return Promise.resolve(!dateUtil.isTimestampBelongToday(earliest))
}