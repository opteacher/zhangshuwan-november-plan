const fs = require("fs")  
const path = require("path")
const router = require("koa-router")()
const auth = require('koa-basic-auth')
const axios = require("axios")

const config = require("../../../../../config.json")

const imagePath = "public/zhangshuwan_november_plan/assets/images"

router.post("/upload", auth(config.credentials), async ctx => {
  // 上传单个文件
  const fkey = ctx.request.body["fileKey"]
  const file = ctx.request.files[fkey] // 获取上传文件
  // 创建可读流
  const reader = fs.createReadStream(file.path)
  const filePath = path.join(imagePath, fkey)
  // 创建可写流
  const upStream = fs.createWriteStream(filePath)
  // 可读流通过管道写入可写流
  reader.pipe(upStream)
  ctx.body = "上传成功！"
})

router.get("/download", auth(config.credentials), async ctx => {
  const res = await axios.get(ctx.request.query.fileURL, {responseType: "stream"})
  const ws = fs.createWriteStream(path.join(imagePath, ctx.request.query.fileName))
  await new Promise((resolve, reject) => {
    res.data.pipe(ws)
    ws.on("finish", resolve)
    ws.on("error", reject)
  })
  ctx.body = "下载成功！"
})

router.delete("/delete", auth(config.credentials), async ctx => {
  // 删除的文件
  const fname = ctx.request.query.fname
  // 拼接文件路径
  const fpath = path.join(imagePath, fname)
  // 删除
  fs.unlinkSync(fpath)
  ctx.body = "删除成功！"
})

module.exports = router