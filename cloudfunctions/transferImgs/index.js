// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require("axios")
const FormData = require("form-data")
const Duplex = require("stream").Duplex

cloud.init({env: "prod-7gyout13519352e3"})
const db = cloud.database()

function getLastBySeq(str, seq = "/") {
  const idx = str.lastIndexOf(seq)
  if (idx === -1) {
    return ""
  }
  return str.substring(idx + 1)
}

// 云函数入口函数
exports.main = async (event) => {
  const callback = event.callback || (() => {})
  let res = null
  try {
    // 收集所有作品
    let articles = []
    for (let i = 0; ; i += 100) {
      res = await db.collection("article").skip(i).limit(100).get()
      if (!res.data || !res.data.length) {
        break
      }
      articles = articles.concat(res.data)
      callback(1, `查询到${res.data.length}条作品记录`)
    }

    // 罗列图片信息
    let imgInfs = []
    for (let i = 0; i < articles.length; ++i) {
      const article = articles[i]
      imgInfs.push({
        articleId: article._id,
        picID: article.picID,
        picURL: article.picURL,
        destName: `${article.author}_${getLastBySeq(article.picURL)}`
      })
      callback(2, `构建作者：${article.author}的图片信息`, [i, articles.length])
    }

    // 图片迁移
    const baseURL = "https://boysenberry-ok4uhinb.pai.tcloudbase.com:5523/zhangshuwan_november_plan"
    for (let i = 0; i < imgInfs.length; ++i) {
      const imgInf = imgInfs[i]
      res = await axios.get(`${baseURL}/api/v1/files/download`, {
        params: {fileURL: imgInf.picURL, fileName: imgInf.destName},
        auth: {username: "opteacher", password: "59524148"}
      })
      // 拼接图片URL
      imgInfs[i].picURL = `${baseURL}/assets/images/${imgInf.destName}`
      await new Promise(resolve => setTimeout(resolve, 2000))
      callback(3, `迁移图片：${imgInf.destName}`, [i, imgInfs.length])
    }

    // 更新数据库
    return db.runTransaction(async ta => {
      try {
        for (let i = 0; i < imgInfs.length; ++i) {
          const imgInf = imgInfs[i]
          await ta.collection("article").doc(imgInf.articleId).update({
            data: {picID: imgInf.destName, picURL: imgInf.picURL}
          })
          callback(4, `修改数据库记录，当前作品：${imgInf.articleId}`, [i, imgInfs.length])
        }
      } catch(e) {
        await transaction.rollback(e)
        return Promise.reject({error: e})
      }
    })
  } catch(e) {
    return Promise.reject({error: e})
  }
}