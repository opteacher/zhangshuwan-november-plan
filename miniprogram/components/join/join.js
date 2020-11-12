const strUtil = require("../../utils/string")

Component({
  properties: {
    mode: {
      type: String,
      value: "valid" //默认验证模式，也可设为【new】新增模式
    }
  },
  data: {
    showForm: false,
    player: {
      room: "",
      name: "",
      phone: ""
    },
    subLoading: false,
    message: {},
    community: "百合苑",
    buildings: [],
    buildingIdx: 0
  },
  lifetimes: {
    async attached() {
      const db = wx.cloud.database()
      try {
        let res = await db.collection("setting").limit(1).get()
        if (!res.data || !res.data.length) {
          throw new Error("查询配置表错误！返回值缺少data字段")
        }
        const setting = res.data[0]
        this.setData({
          showForm: setting.showForm,
          buildings: Array.from({length: 22}, (_, i)=> i + 1),
          buildingIdx: 0
        })
      } catch(e) {
        this.setData({
          message: {type: "error", text: e.message || JSON.stringify(e)}
        })
      }
    }
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
    onCommunityChange(e) {
      const community = e.currentTarget.dataset.target
      this.setData({
        community,
        buildings: Array.from({
          length: community == "百合苑" ? 22 : 17
        }, (_, i)=> i + 1),
        buildingIdx: 0
      })
    },
    onBuildingChange(e) {
      this.setData({buildingIdx: e.detail.value})
    },
    onSubmitClick() {
      // 校验填写的信息
      let msgTxt = ""
      if (!this.data.player.phone) {
        msgTxt = "未填写手机号"
      }
      if (!this.data.player.name) {
        msgTxt = "未填写姓名"
      }
      if (!this.data.player.room) {
        msgTxt = "未填写房号"
      }
      if (msgTxt.length) {
        this.setData({
          message: {type: "error", text: msgTxt}
        })
        return false
      }
      switch (this.data.mode) {
      case "new":
        this._onNewPlayer()
        break
      case "valid":
      default:
        this._onToNext()
      }
    },
    async _onToNext() {
      if (this.data.player.room === "1" && this.data.player.name === "ADMIN$" && this.data.player.phone === "10001") {
        // 跳转到管理员页面
        wx.navigateTo({url: "../../pages/admin/admin"})
      } else {
        this.setData({subLoading: true})
        // 拼接地址
        const room = this._combRoom()
        const db = wx.cloud.database()
        const _ = db.command
        try {
          // 获取当前用户的openid，用于检测该用户是否用当前微信号报过名
          let res = await wx.cloud.callFunction({name: "getOpenid"})
          if (!res.result.openid) {
            throw new Error("获取用户openid错误！返回值缺少openid字段")
          }

          // 检查该用户是否已提交过作品，如果提交过，则跳转到作品详情页面
          res = await db.collection("article").where(_.or([
            {_openid: res.result.openid}, {room}
          ])).get()
          if (!res.data) {
            throw new Error(`查询指定地址提交的作品失败！返回结构没有data字段。${res.errMsg}`)
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
      
          // // 校验用户提交的基本信息
          // res = await db.collection("player").where({
          //   room,
          //   name: this.data.player.name,
          //   phone: this.data.player.phone
          // }).get()
          // let msgTxt = ""
          // if (!res.data || !res.data.length) {
          //   msgTxt = "未查找到该用户，请检查填写信息是否正确！"
          // } else if (res.data[0].status === "禁赛") {
          //   msgTxt = "该用户已被禁赛，请联系管理员！"
          // } else if (res.data[0].status === "参赛") {
          //   msgTxt = "该用户已参赛，不可重复报名！"
          // }
          // const player = res.data[0]
          
          // this.setData({subLoading: false})
          // if (msgTxt === "") {
          //   wx.navigateTo({url: `/pages/upload/upload?${strUtil.cvtObjToUriParams(player)}`})
          // } else {
          //   throw new Error(msgTxt)
          // }

          // 直接新增用户
          let player = {
            name: this.data.player.name,
            phone: this.data.player.phone,
            room: this._combRoom(),
            status: "未参赛"
          }
          res = await wx.cloud.callFunction({
            name: "addPlayer",
            data: player
          })
          if (!res.result || !res.result._id) {
            throw new Error("新增选手错误！返回值缺少_id字段")
          }
          player = Object.assign(player, {_id: res.result._id})
          wx.navigateTo({url: `/pages/upload/upload?${strUtil.cvtObjToUriParams(player)}`})
        } catch(e) {
          console.log(e)
          this.setData({
            message: {type: "error", text: e.message || JSON.stringify(e)}
          })
        }
        this.setData({subLoading: false})
      }
    },
    async _onNewPlayer() {
      this.setData({subLoading: true})
      try {
        const player = {
          name: this.data.player.name,
          phone: this.data.player.phone,
          room: this._combRoom(),
          status: "未参赛"
        }
        let res = await wx.cloud.callFunction({
          name: "addPlayer",
          data: player
        })
        if (!res.result || !res.result._id) {
          throw new Error("新增选手错误！返回值缺少_id字段")
        }
        this.triggerEvent("newPlayerCreated", Object.assign(player, {
          _id: res.result._id
        }))
      } catch(e) {
        this.setData({
          message: {type: "error", text: e.message || JSON.stringify(e)}
        })
      }
      this.setData({subLoading: false})
    },
    _combRoom() {
      return this.data.community
        + `${this.data.buildings[this.data.buildingIdx]}栋`
        + `${this.data.player.room}号`
    }
  }
})