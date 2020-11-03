Page({
  data: {
    message: {},
    article: {},
    showVoteBtn: true
  },
  async onLoad(option) {
    wx.showLoading({title: "加载中"})
    this.setData({showVoteBtn: option.voteBtn === "false" ? false : true})
    try {
      let res = await wx.cloud.database().collection("article").doc(option._id).get()
      if (!res.data) {
        throw new Error(`查询作品失败！返回值缺少data字段。${res.errMsg}`)
      }
      this.setData({article: res.data})
    } catch(e) {
      this.setData({
        message: {type: "error", text: e.message || JSON.stringify(e)}
      })
    }
    wx.hideLoading()
  },
  onPicLnkClick(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: [e.currentTarget.dataset.src]
    })
  },
  onVoteBtnClick(e) {
    const idxPage = getCurrentPages().find(page => page.route === "pages/index/index")
    console.log(idxPage)
    const voteComp = idxPage.selectAllComponents()
    console.log(voteComp)
  }
})
  