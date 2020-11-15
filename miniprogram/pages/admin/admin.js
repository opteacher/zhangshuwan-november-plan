Page({
  data: {
    tabList: [
      {title: "作品列表"}, {title: "选手管理"}, {title: "投票纪录"}, {title: "图片文件迁移"}
    ],
    transferring: false
  },

  onLoad() {
  },

  async onTransferBtnClick() {
    this.setData({transferring: true})
    try {
      await wx.cloud.callFunction({
        name: "transferImgs",
        data: {
          callback: (step, message, progress) => {
            console.log(step, message, progress)
          }
        }
      })
    } catch(e) {
      this.setData({
        message: {type: "error", text: `迁移失败！${e.error ? e.error.message : JSON.stringify(e)}`}
      })
    }
    this.setData({transferring: false})
  }
})
