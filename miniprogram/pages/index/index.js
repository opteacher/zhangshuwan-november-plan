Page({
  data: {
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
  onTabChange (e) {
    this.setData({
      curIndex: e.detail.index
    })
  },
  options: {
    addGlobalClass: true
  }
})