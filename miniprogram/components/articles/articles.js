Component({
  data: {
    message: {},
    articles: [],
    toDelArticle: "",
    toUpdArticleVote: null,
    buttons: [{text: "取消"}, {text: "确定"}]
  },
  lifetimes: {
    attached() {
      this.updArticles().catch(e => {})
    }
  },
  methods: {
    async updArticles() {
      wx.showLoading({title: "加载中"})
      try {
        let res = await wx.cloud.database().collection("article").get()
        console.log(res.data)
        this.setData({articles: res.data || []})
        wx.hideLoading()
      } catch (e) {
        wx.hideLoading()
        this.setData({
          message: {type: "error", text: `更新作品列表失败！${e.message || JSON.stringify(e)}`}
        })
      }
    },
    onDelArticleBtnClick(e) {
      this.setData({toDelArticle: e.currentTarget.dataset.target})
    },
    async onDelArticleConfirm(e) {
      if (e.detail.index === 1) {
        wx.showLoading({title: "加载中"})
        try {
          await wx.cloud.callFunction({
            name: "delArticle",
            data: {articleId: this.data.toDelArticle}
          })
          wx.hideLoading()
          this.setData({
            message: {type: "success", text: "删除作品成功！"}
          })
        } catch(e) {
          wx.hideLoading()
          this.setData({
            message: {type: "error", text: `删除作品失败！${e.message || JSON.stringify(e)}`}
          })
        }
      }
      this.updArticles().catch(e => {})
      this.setData({toDelArticle: ""})
    },
    onUpdArticleVoteBtnClick(e) {
      this.setData({toUpdArticleVote: e.currentTarget.dataset.target})
    },
    onInputVote(e) {
      this.data.toUpdArticleVote.vote = e.detail.value
    },
    async onUpdArticleVoteConfirm(e) {
      if (e.detail.index === 1) {
        wx.showLoading({title: "加载中"})
        try{
          await wx.cloud.database().collection("article").doc(this.data.toUpdArticleVote._id).update({
            data: {vote: this.data.toUpdArticleVote.vote}
          })
          wx.hideLoading()
          this.setData({
            message: {type: "success", text: "更新作品票数成功！"}
          })
        } catch(e) {
          wx.hideLoading()
          this.setData({
            message: {type: "error", text: `更新作品票数失败！${e.message || JSON.stringify(e)}`}
          })
        }
      }
      this.updArticles().catch(e => {})
      this.setData({toUpdArticleVote: null})
    }
  }
})