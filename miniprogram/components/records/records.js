Component({
  data: {
    begIdx: 0,
    records: []
  },
  lifetimes: {
    attached() {
      this.updVoteRecords().catch(e => {})
    }
  },
  methods: {
    async updVoteRecords() {
      wx.showLoading({title: "加载中"})
      try {
        let res = await wx.cloud.callFunction({
          name: "qryVotes", data: {page: this.data.begIdx}
        })
        if (!res.result) {
          throw new Error("查询投票记录错误！返回值缺少result字段")
        }
        const newRecords = !res.result.length ? [] : res.result.map(record => {
          let datetime = new Date(record.timestamp)
          record.datetime = `${datetime.toLocaleDateString()} ${datetime.toLocaleTimeString()}`
          return record
        })
        this.setData({records: this.data.records.concat(newRecords)})
      } catch(e) {
        this.setData({
          message: {type: "error", text: `刷新投票记录表失败！${e.message || JSON.stringify(e)}`}
        })
      }
      wx.hideLoading()
    },
    onToDetailBtnClick(e) {
      wx.navigateTo({url: `../../pages/detail/detail?_id=${e.currentTarget.dataset.target}&voteBtn=false`})
    },
    async onScrollBtm() {
      this.setData({
        begIdx: this.data.begIdx + 100
      })
      wx.showLoading({title: "加载中"})
      await this.updVoteRecords()
      wx.hideLoading()
    }
  }
})