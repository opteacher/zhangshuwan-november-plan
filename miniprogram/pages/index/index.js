Page({
  data: {
    message: {},
    curIndex: 0,
    list: [{
      text: "活动说明",
      iconPath: "/images/home.png",
      selectedIconPath: "/images/home_act.png"
    }, {
      text: "投票",
      iconPath: "/images/upvote.png",
      selectedIconPath: "/images/upvote_act.png"
    }, {
      text: "排行榜",
      iconPath: "/images/rank.png",
      selectedIconPath: "/images/rank_act.png"
    }, {
      text: "报名参赛",
      iconPath: "/images/join.png",
      selectedIconPath: "/images/join_act.png"
    }]
  },
  onLoad(option) {
    if (option && option.pgIdx) {
      this.setData({curIndex: option.pgIdx})
    }
  },
  onTabChange (e) {
    this.setData({
      curIndex: e.detail.index
    })
  },
  onShareAppMessage() {
    return this.logShareAction("repost")
  },
  onShareTimeline() {
    return this.logShareAction("moments")
  },
  async logShareAction(voteType) {
    // 记录转发和发朋友圈记录
    await wx.cloud.callFunction({
      name: "enbVoteQaul",
      data: {voteType}
    }).catch(err => {
      this.setData({
        message: {type: "error", text: `增加用户投票资格失败！${err.message || JSON.stringify(err)}`}
      })
    })
    return {
      title: "我爱我家——定格韶山温馨家园 城发承载幸福启航"
    }
  },
  options: {
    addGlobalClass: true
  }
})