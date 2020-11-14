const path = require("path")
const Koa = require("koa")
const bodyparser = require("koa-bodyparser")
const json = require("koa-json")
const logger = require("koa-logger")
const statc = require("koa-static")
const cors = require("koa2-cors")
const body = require("koa-body")

const router = require("./routes/index")

const app = new Koa()

// 跨域配置
app.use(cors())

// 路径解析
app.use(bodyparser())

// json解析
app.use(json())

// 日志输出
app.use(logger())

// 配置上传
app.use(body({
  multipart: true,
  formidable: {
    maxFileSize: 100*1024*1024    // 设置上传文件大小最大限制，默认2M
  }
}));

// 配置认证信息
app.use(async (ctx, next) => {
  try {
    await next() // next is now a function
  } catch (err) {
    if (err.status == 401) {
      ctx.status = 401
      ctx.set("WWW-Authenticate", "Basic")
      ctx.body = { message: "You have no right to access!" }
    } else {
      ctx.status = err.status || 500
      ctx.body = { message: err.message }
    }
  }
})

// 指定静态目录
app.use(statc(path.join(__dirname, "public")))

// 路径分配
app.use(router.routes(), router.allowedMethods())

// 错误跳转
app.use(ctx => {
  ctx.status = 404
  ctx.body = "error"
})

// 监听
app.listen(process.env.PORT || 4000)