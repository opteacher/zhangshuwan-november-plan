Component({
  data: {},
  methods: {
    onShareBtnClick() {
      wx.showShareMenu({
        withShareTicket: true,
        menus: ["shareAppMessage", "shareTimeline"]
      })
    }
  }
})