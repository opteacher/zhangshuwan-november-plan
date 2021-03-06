Component({
  data: {
    showRule: false
  },
  methods: {
    onShareBtnClick() {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"]
      })
    },
    onNaviToJoinBtnClick() {
      const idxPage = getCurrentPages().find(page => page.route === "pages/index/index")
      idxPage.setData({curIndex: 3})
    },
    onPopRuleBtnClick() {
      this.setData({showRule: true})
    }
  }
})