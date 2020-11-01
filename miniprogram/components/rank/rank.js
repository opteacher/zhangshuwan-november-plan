Component({
  data: {
    message: {},
    rankList: []
  },
  lifetimes: {
    attached() {
      this.updRankList().catch(e => {})
    }
  },
  methods: {
    async updRankList() {
      wx.showLoading({title: "加载中"})
      try {
        let res = await wx.cloud.database().collection("article").orderBy("vote", "desc").get()
        if (!res.data) {
          throw new Error(`查询作品集失败！结果没有data字段`)
        }
        this.setData({rankList: res.data})
      } catch(e) {
        this.setData({
          message: {type: "error", text: `刷新排行榜失败！${e.message || JSON.stringify(e)}`}
        })
      }
      wx.hideLoading()
    },
    onToDetialBtnClick(e) {
      wx.navigateTo({url: `../../pages/detail/detail?_id=${e.currentTarget.dataset.target}`})
    }
  }
})