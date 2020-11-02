const strUtil = require("../../utils/string")

Component({
  data: {
    message: {},
    players: [],
    toDelPlayerId: "",
    toBanPlayerId: "",
    buttons: [{text: "取消"}, {text: "确定"}]
  },
  lifetimes: {
    attached() {
      this.updPlayers().catch(e => {})
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
      this.updPlayers().catch(e => {})
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
      this.updPlayers().catch(e => {})
    },
    async updPlayers() {
      let res = await wx.cloud.database().collection("player").get()
      if (!res.data) {
        this.setData({
          message: {type: "error", text: `查询选手失败！${res.errMsg}`}
        })
        return Promise.reject(res.errMsg)
      }
      const players = res.data.map(player => {
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
      this.setData({players})
      return Promise.resolve(players)
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
        await this.updPlayers()
      } catch (e) {
        this.setData({
          message: {type: "error", text: `发生未知错误！${e}`}
        })
      }
    }
  }
})