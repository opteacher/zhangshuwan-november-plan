Component({
  data: {
    message: {},
    articlesOdd: [],
    articlesEven: [],
    pictureList: [],
    toVoteArticleId: "",
    buttons: [{text: "取消"}, {text: "确定"}],
    voteLoadingArticle: ""
  },
  lifetimes: {
    attached() {
      this.updArticles().catch(e => {})
    }
  },
  methods: {
    async updArticles() {
      wx.showLoading({title: "加载中"})
      const db = wx.cloud.database()
      try {
        let res = await db.collection("article").get()
        if (!res.data) {
          throw new Error("作品列表结构错误！")
        }
        const articles = res.data

        // 将列表按索引的奇偶分割成两个
        let articlesOdd = []
        let articlesEven = []
        let pictureList = []
        for (let i = 0; i < articles.length; ++i) {
          if (i % 2 === 0 && i !== 0) {
            articlesEven.push(articles[i])
          } else {
            articlesOdd.push(articles[i])
          }
          pictureList.push(articles[i].picURL)
        }
        this.setData({articlesOdd, articlesEven, pictureList})
      } catch(e) {
        this.setData({
          message: {type: "error", text: `获取作品列表失败！${e.message || JSON.stringify(e)}`}
        })
      }
      wx.hideLoading()
    },
    async onVoteBtnClick(e) {
      const toVoteArticleId = e.currentTarget.dataset.target
      this.setData({voteLoadingArticle: toVoteArticleId})
      try {
        // 获取登录者的openid
        let res = await wx.cloud.callFunction({name: "getOpenid"})
        if (!res.result || !res.result.openid) {
          throw new Error(`获取投票者openid失败！${res.errMsg}`)
        }
        const _openid = res.result.openid

        // 检查是否超过三次投票
        res = await wx.cloud.callFunction({
          name: "chkVoteable",
          data: {_openid}
        })
        if (!res.result) {
          this.setData({
            message: {type: "error", text: "对不起，你今天已经超过三次投票！请等到明天再投票"},
            voteLoadingArticle: ""
          })
          return false
        }
      } catch(e) {
        this.setData({
          message: {type: "error", text: `查询投票资质失败！${e.message || JSON.stringify(e)}`}
        })
      }
      this.setData({toVoteArticleId, voteLoadingArticle: ""})
    },
    async onVoteConfirm(e) {
      if (e.detail.index === 1) {
        const db = wx.cloud.database()
        const _ = db.command
        try {
          // 更新投票数
          let res = await db.collection("article").doc(this.data.toVoteArticleId).update({
            data: {vote: _.inc(1)}
          })
          if (res.stats.updated !== 1) {
            throw new Error(`更新投票数错误！${res.errMsg}`)
          }

          // 插入投票记录
          res = await db.collection("vote").add({
            data: {
              articleId: this.data.toVoteArticleId,
              timestamp: Date.now()
            }
          })
          if (!res._id) {
            throw new Error(`保存投票记录失败！${res.errMsg}`)
          }
        } catch (e) {
          this.setData({
            message: {type: "error", text: `投票失败！${e}`},
            toVoteArticleId: ""
          })
          return Promise.reject(e)
        }
        this.setData({
          message: {type: "success", text: "投票成功！"},
          toVoteArticleId: ""
        })
      }
      this.setData({toVoteArticleId: ""})
      return this.updArticles()
    },
    onPicLnkClick(e) {
      wx.previewImage({
        current: e.currentTarget.dataset.src,
        urls: this.data.pictureList
      })
    }
  }
})