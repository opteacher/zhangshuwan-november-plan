Component({
  data: {
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
        let res = await wx.cloud.callFunction({name: "qryVotes"})
        if (!res.result) {
          throw new Error("查询投票记录错误！返回值缺少result字段")
        }
        this.setData({records: res.result.map(record => {
          let datetime = new Date(record.timestamp)
          record.datetime = `${datetime.toLocaleDateString()} ${datetime.toLocaleTimeString()}`
          return record
        })})
      } catch(e) {
        this.setData({
          message: {type: "error", text: `刷新投票记录表失败！${e.message || JSON.stringify(e)}`}
        })
      }
      wx.hideLoading()
    },
    onToDetailBtnClick(e) {
      wx.navigateTo({url: `../../pages/detail/detail?_id=${e.currentTarget.dataset.target}&voteBtn=false`})
    }
  }
})