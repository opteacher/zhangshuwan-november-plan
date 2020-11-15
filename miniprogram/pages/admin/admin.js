Page({
  data: {
    tabList: [
      {title: "作品列表"}, {title: "选手管理"}, {title: "投票纪录"}, {title: "图片文件迁移"}
    ],
    transferring: false
  },

  onLoad() {
  },

  onTransferBtnClick() {
    await wx.cloud.callFunction({name: "transferImgs"})
  }
})
