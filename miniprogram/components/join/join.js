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
      if (this.data.player._id === "1") {
        // 跳转到管理员页面
        wx.navigateTo({url: "../../pages/admin/admin"})
      } else {
        this.setData({subLoading: true})

        const res = await wx.cloud.callFunction({
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
      }
    }
  }
})