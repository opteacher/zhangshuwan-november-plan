async function enbVoteQaul(voteType) {
  try {
    let res = await wx.cloud.callFunction({
      name: "enbVoteQaul",
      data: {voteType}
    })
    if (res.result.updated > 0) {
      return Promise.resolve({
        message: {type: "success", text: "已获得投票资格，马上前往投票页面投票吧！"}
      })
    } else {
      return Promise.resolve({
        message: {type: "info", text: "今日的获奖资格已获得，请耐心等待明日！"}
      })
    }
  } catch(e) {
    return Promise.resolve({
      message: {type: "error", text: `增加用户投票资格失败！${err.message || JSON.stringify(err)}`}
    })
  }
}

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
      this.setData({curIndex: parseInt(option.pgIdx)})
    }
  },
  onTabChange (e) {
    this.setData({curIndex: e.detail.index})
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
      title: "我爱我家——定格韶山温馨家园 城发承载幸福启航",
      query: "pages/index/index",
      path: "pages/index/index",
      imageUrl: "/images/home_background.jpeg"
    }
  },
  options: {
    addGlobalClass: true
  }
})

module.exports = {enbVoteQaul}