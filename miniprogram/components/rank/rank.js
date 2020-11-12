Component({
  data: {
    begIdx: 0,
    message: {},
    rankList: [],
    rankColor: ""
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
        let res = await wx.cloud.database().collection("article").orderBy("vote", "desc").skip(this.data.begIdx).get()
        if (!res.data) {
          throw new Error(`查询作品集失败！结果没有data字段`)
        }
        const newItems = res.data.length ? res.data : []
        this.setData({
          rankList: this.data.rankList.concat(newItems)
        })
      } catch(e) {
        this.setData({
          message: {type: "error", text: `刷新排行榜失败！${e.message || JSON.stringify(e)}`}
        })
      }
      wx.hideLoading()
    },
    onToDetialBtnClick(e) {
      wx.navigateTo({url: `../../pages/detail/detail?_id=${e.currentTarget.dataset.target}`})
    },
    async onScrollBtm() {
      this.setData({
        begIdx: this.data.begIdx + 20
      })
      wx.showLoading({title: "加载中"})
      await this.updRankList()
      wx.hideLoading()
    }
  }
})