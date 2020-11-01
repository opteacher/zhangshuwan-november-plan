const strUtil = require("../../utils/string")

Component({
  data: {
    player: {
      _id: "",
      name: "",
      phone: ""
    },
    subLoading: false,
    message: {}
  },
  lifetimes: {
    async attached() {
    }
  },
  methods: {
    _onInputChange(bindVar, e) {
      this.setData({[bindVar]: e.detail.value})
    },
    onInputID(e) {
      this._onInputChange("player._id", e)
    },
    onInputName(e) {
      this._onInputChange("player.name", e)
    },
    onInputPhone(e) {
      this._onInputChange("player.phone", e)
    },
    async onClickNext() {
      const room = this.data.player._id
      if (room === "1") {
        // 跳转到管理员页面
        wx.navigateTo({url: "../../pages/admin/admin"})
      } else {
        this.setData({subLoading: true})
        try {
          // 检查该用户是否已提交过作品，如果提交过，则跳转到作品详情页面
          let res = await wx.cloud.database().collection("article").where({room}).get()
          if (!res.data) {
            throw new Error(`查询指定房号提交的作品失败！返回结构没有data字段。${res.errMsg}`)
          }
          if (res.data.length >= 1) {
            this.setData({
              message: {type: "info", text: "该房选手已提交作品，将跳转其作品详细页……"}
            })
            this.setData({subLoading: false})
            const article = res.data[0]
            wx.navigateTo({url: `../../pages/detail/detail?_id=${article._id}`})
            return
          }

          // 校验用户提交的基本信息
          res = await wx.cloud.callFunction({
            name: "verifyPlayer",
            data: this.data.player
          })
          this.setData({subLoading: false})
          if (res.result === 1) {
            wx.navigateTo({url: `/pages/upload/upload?${strUtil.cvtObjToUriParams(this.data.player)}`})
          } else {
            this.setData({
              message: {type: "error", text: JSON.stringify(res.result)}
            })
          }
        } catch(e) {

        }
        this.setData({subLoading: false})
      }
    }
  }
})