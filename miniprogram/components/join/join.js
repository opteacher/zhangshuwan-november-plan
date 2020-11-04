const strUtil = require("../../utils/string")

Component({
  data: {
    player: {
      room: "",
      name: "",
      phone: ""
    },
    subLoading: false,
    message: {}
  },
  methods: {
    _onInputChange(bindVar, e) {
      this.setData({[bindVar]: e.detail.value})
    },
    onInputRoom(e) {
      this._onInputChange("player.room", e)
    },
    onInputName(e) {
      this._onInputChange("player.name", e)
    },
    onInputPhone(e) {
      this._onInputChange("player.phone", e)
    },
    async onClickNext() {
      const room = this.data.player.room
      if (room === "1") {
        // 跳转到管理员页面
        wx.navigateTo({url: "../../pages/admin/admin"})
      } else {
        this.setData({subLoading: true})
        const db = wx.cloud.database()
        try {
          // 检查该用户是否已提交过作品，如果提交过，则跳转到作品详情页面
          let res = await db.collection("article").where({room}).get()
          if (!res.data) {
            throw new Error(`查询指定房号提交的作品失败！返回结构没有data字段。${res.errMsg}`)
          }
          if (res.data.length >= 1) {
            this.setData({
              message: {type: "info", text: "该房选手已提交作品，将跳转其作品详细页……"}
            })
            this.setData({subLoading: false})
            await new Promise(resolve => setTimeout(resolve, 1000))
            const article = res.data[0]
            wx.navigateTo({url: `../../pages/detail/detail?_id=${article._id}`})
            return
          }

          // 校验用户提交的基本信息
          res = await db.collection("player").where({
            room,
            name: this.data.player.name,
            phone: this.data.player.phone
          }).get()
          let msgTxt = ""
          if (!res.data || !res.data.length) {
            msgTxt = "未查找到该用户，请检查填写信息是否正确！"
          } else if (res.data[0].status === "禁赛") {
            msgTxt = "该用户已被禁赛，请联系管理员！"
          } else if (res.data[0].status === "参赛") {
            msgTxt = "该用户已参赛，不可重复报名！"
          }
          const player = res.data[0]
          
          this.setData({subLoading: false})
          if (msgTxt === "") {
            wx.navigateTo({url: `/pages/upload/upload?${strUtil.cvtObjToUriParams(player)}`})
          } else {
            throw new Error(msgTxt)
          }
        } catch(e) {
          this.setData({
            message: {type: "error", text: e.message || JSON.stringify(e)}
          })
        }
        this.setData({subLoading: false})
      }
    }
  }
})