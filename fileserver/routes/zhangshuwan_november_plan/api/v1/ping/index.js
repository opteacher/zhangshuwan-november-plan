const router = require("koa-router")()

router.get("/", async ctx => {
  ctx.body = "连接通畅！"
})

module.exports = router