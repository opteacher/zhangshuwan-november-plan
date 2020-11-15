// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require("axios")
const FormData = require("form-data")

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
exports.main = async () => {
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
    }

    // 罗列图片信息
    let imgInfs = []
    for (let article of articles) {
      imgInfs.push({
        articleId: article._id,
        picID: article.picID,
        destName: `${article.author}_${getLastBySeq(article.picURL)}`
      })
    }

    // 图片迁移
    const baseURL = "http://42.194.147.175:4000/zhangshuwan_november_plan"
    for (let i = 0; i < imgInfs.length; ++i) {
      const imgInf = imgInfs[i]
      res = await cloud.downloadFile({fileID: imgInf.picID})
      if (res.errMsg) {
        throw newError(`下载文件错误！错误码${res.errCode}-错误信息${res.errMsg}`)
      }
      let form = new FormData()
      form.append(imgInf.destName, res.fileContent)
      form.append("fileKey", imgInfs.destName)
      await axios.post(`${baseURL}/api/v1/files/upload`, form, {
        auth: {username: "opteacher", password: "59524148"}
      })
      // 拼接图片URL
      imgInfs[i].picURL = `${baseURL}/assets/images/${imgInf.destName}`
    }

    // 更新数据库
    return db.runTransaction(async ta => {
      try {
        for (let imgInf of imgInfs) {
          await ta.collection("article").doc(imgInf.articleId).update({
            data: {picID: imgInf.destName, picURL: imgInf.picURL}
          })
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