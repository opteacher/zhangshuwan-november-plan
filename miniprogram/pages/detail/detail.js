const {validVote, doVote} = require("../../components/vote/vote")
const {enbVoteQaul} = require("../index/index")

Page({
  data: {
    message: {},
    article: {},
    showVoteBtn: true,
    showVoteDlg: false,
    buttons: [{text: "取消"}, {text: "确定"}],
    votingUser: {},
    voteType: "",
    showSinglePgMask: false
  },
  async reload(articleId) {
    try {
      let res = await wx.cloud.database().collection("article").doc(articleId).get()
      if (!res.data) {
        throw new Error(`查询作品失败！返回值缺少data字段。${res.errMsg}`)
      }
      this.setData({article: res.data})
    } catch(e) {
      this.setData({
        message: {type: "error", text: e.message || JSON.stringify(e)}
      })
    }
  },
  async onLoad(option) {
    // 查看场景值，如果是单页模式，显示引导遮罩指引用户前往小程序
    const lOptions = wx.getLaunchOptionsSync()
    if (lOptions.scene === 1154) {
      this.setData({showSinglePgMask: true})
      return
    }

    wx.showLoading({title: "加载中"})
    this.setData({showVoteBtn: option.voteBtn === "false" ? false : true})
    await this.reload(option._id)
    wx.hideLoading()
  },
  onPicLnkClick(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: [e.currentTarget.dataset.src]
    })
  },
  async onVoteBtnClick(e) {
    const res = await validVote(e.detail.userInfo)
    if (res.message) {
      this.setData({message: res.message})
    }
    if (res.valid) {
      this.setData({
        votingUser: Object.assign(e.detail.userInfo, {
          openid: res.resp.openid
        }),
        voteType: res.resp.type
      })
      this.setData({showVoteDlg: true})
    }
  },
  async onVoteConfirm(e) {
    if (e.detail.index === 1) {
      const res = await doVote(
        this.data.article._id,
        this.data.votingUser.openid,
        this.data.voteType)
      this.setData({message: res.message})
      await this.reload(this.data.article._id)
    }
    this.setData({showVoteDlg: false})
  },
  onShareAppMessage() {
    return this.logShareAction("repost")
  },
  onShareTimeline() {
    return this.logShareAction("moments")
  },
  async logShareAction(voteType) {
    // 记录转发和发朋友圈记录
    const res = await enbVoteQaul(voteType)
    this.setData(res)    
    await new Promise(resolve => setTimeout(resolve, 2000))
    return {
      title: "“我爱我家”作品评选——请为我的作品投上你关键一票",
      path: `pages/detail/detail?_id=${this.data.article._id}`
    }
  },
  onRepostBtnClick() {
    wx.showShareMenu({
      menus: ["shareAppMessage", "shareTimeline"]
    })
  },
  onBackVoteBtnClick() {
    wx.reLaunch({url: "../../pages/index/index?pgIdx=1"})
  }
})
