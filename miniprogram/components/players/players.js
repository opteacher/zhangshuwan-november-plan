const strUtil = require("../../utils/string")

Component({
  data: {
    showForm: false,
    message: {},
    begIdx: 0,
    players: [],
    toDelPlayerId: "",
    toBanPlayerId: "",
    buttons: [{text: "取消"}, {text: "确定"}],
    showAddPlayer: false
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
        this.setData({showForm: setting.showForm})
        await this.updPlayers()
      } catch(e) {
        this.setData({
          message: {type: "error", text: e.message || JSON.stringify(e)}
        })
      }
    }
  },
  methods: {
    onBanPlayerBtnClick(e) {
      this.setData({toBanPlayerId: e.currentTarget.dataset.target})
    },
    async onBanPlayerConfirm(e) {
      if (e.detail.index === 1) {
        try {
          await wx.cloud.callFunction({
            name: "banPlayer",
            data: {_id: this.data.toBanPlayerId}
          })
        } catch (e) {
          console.log(e)
          this.setData({
            message: {type: "error", text: `选手禁赛失败！${e}`}
          })
          return false
        }
        this.setData({
          message: {type: "success", text: "禁赛成功！"}
        })
      }
      this.setData({toBanPlayerId: ""})
      this.updPlayers(true).catch(e => {})
    },
    onDelPlayerBtnClick(e) {
      this.setData({toDelPlayerId: e.currentTarget.dataset.target})
    },
    async onDelPlayerConfirm(e) {
      if (e.detail.index === 1) {
        try {
          await wx.cloud.callFunction({
            name: "delPlayer",
            data: {_id: this.data.toDelPlayerId}
          })
        } catch (e) {
          this.setData({
            message: {type: "error", text: `删除选手失败！${e}`}
          })
          return false
        }
        this.setData({
          message: {type: "success", text: "删除成功！"}
        })
      }
      this.setData({toDelPlayerId: ""})
      this.updPlayers(true).catch(e => {})
    },
    async updPlayers(refresh = false) {
      if (refresh) {
        this.setData({begIdx: 0})
      }
      let res = await wx.cloud.database().collection("player").skip(this.data.begIdx).get()
      if (!res.data) {
        this.setData({
          message: {type: "error", text: `查询选手失败！${res.errMsg}`}
        })
        return Promise.reject(res.errMsg)
      }
      const newPlayers = res.data.map(player => {
        let statColor = "black"
        switch (player.status) {
          case "参赛":
            statColor = "var(--primary-color)"
            break
          case "禁赛":
            statColor = "var(--danger-color)"
            break
        }
        return Object.assign(player, {statColor})
      })
      this.setData({
        players: refresh ? newPlayers : this.data.players.concat(newPlayers)
      })
      return Promise.resolve(this.data.players)
    },
    search: function (value) {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              resolve([{text: '搜索结果', value: 1}, {text: '搜索结果2', value: 2}])
          }, 200)
      })
    },
    async onClickUpload() {
      try {
        // 选择一个文件
        let res = await getApp().globalData.wxp.chooseMessageFile({
          count: 1,
          type: "file",
          extension: ["xls", "xlsx"]
        })
        if (!res.tempFiles || !res.tempFiles.length) {
          this.setData({
            message: {type: "error", text: "请选择一个文档文件！"}
          })
          return Promise.reject()
        }

        // 上传到云空间
        const filePath = res.tempFiles[0].path
        const fileName = strUtil.getLastBySeq(filePath)
        if (fileName === "") {
          this.setData({
            message: {type: "error", text: "错误的文档路径！"}
          })
          return Promise.reject()
        }
        res = await wx.cloud.uploadFile({
          cloudPath: fileName,
          filePath: filePath
        })
        if (!res.fileID) {
          this.setData({
            message: {type: "error", text: `上传文件失败！${res.errMsg}`}
          })
          return Promise.reject(new Error(res.errMsg))
        }
        
        // 解析Excel文件，并持久化到数据库
        res = await wx.cloud.callFunction({
          name: "saveExcel",
          data: {fileID: res.fileID}
        })
        if (res.error) {
          this.setData({
            message: {type: "error", text: `解析Excel文件失败！${res.error}`}
          })
          return Promise.reject(res.error)
        } else {
          this.setData({
            message: {type: "success", text: "批量上传成功"}
          })
        }
        
        // 再次刷新列表
        await this.updPlayers(true)
      } catch (e) {
        if (e.errMsg === "chooseMessageFile:fail cancel") {
          return Promise.resolve()
        }
        this.setData({
          message: {type: "error", text: `发生未知错误！${e}`}
        })
      }
    },
    onAddPlayerBtnClick() {
      this.setData({showAddPlayer: true})
    },
    onSwchToListBtnClick() {
      this.setData({showAddPlayer: false})
    },
    onNewPlayerCreated(newPlayer) {
      if (newPlayer.detail._id) {
        this.setData({
          message: {type: "success", text: "新用户已被创建！"},
          showAddPlayer: false
        })
        this.updPlayers(true).catch(e => {})
      }
    },
    async onScrollBtm() {
      this.setData({
        begIdx: this.data.begIdx + 20
      })
      await this.updPlayers()
    }
  }
})