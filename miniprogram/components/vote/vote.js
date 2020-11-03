Component({
  data: {
    message: {},
    articlesOdd: [],
    articlesEven: [],
    pictureList: [],
    toVoteArticleId: "",
    buttons: [{text: "取消"}, {text: "确定"}],
    voteLoadingArticle: "",
    votingUser: {},
    voteType: ""
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
          if (i % 2 === 0) {
            articlesOdd.push(articles[i])
          } else {
            articlesEven.push(articles[i])
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
        // 检查是否超过投票上限
        let res = await wx.cloud.callFunction({
          name: "chkVoteable",
          data: {
            votingUser: e.detail.userInfo,
            votingArticleId: toVoteArticleId
          }
        })
        if (!res.result || res.error) {
          throw res.error || new Error("检车投票资格错误！返回值缺少result字段")
        }
        if (!res.result.votable) {
          if (!res.result.type) {
            this.setData({
              message: {type: "error", text: "对不起，你今天已经超过投票上限！请等到明天再投票"},
              voteLoadingArticle: ""
            })
          } else {
            this.setData({
              message: {type: "info", text: "对不起，你每日投票资格已用！你可通过右上角菜单中的转发朋友群或者发朋友圈获得投票资格"},
              voteLoadingArticle: ""
            })
          }
          return false
        }
        this.setData({
          votingUser: Object.assign(e.detail.userInfo, {
            openid: res.result.openid
          }),
          voteType: res.result.type
        })
      } catch(e) {
        this.setData({
          message: {type: "error", text: `查询投票资质失败！${e.message || JSON.stringify(e)}`}
        })
      }
      this.setData({toVoteArticleId, voteLoadingArticle: ""})
    },
    async onVoteConfirm(e) {
      if (e.detail.index === 1) {
        try {
          // 更新投票数
          const db = wx.cloud.database()
          const _ = db.command
          await wx.cloud.database().collection("article").doc(this.data.toVoteArticleId).update({
            data: {vote: _.inc(1)}
          })

          // 记录投票
          await wx.cloud.callFunction({
            name: "logVote",
            data: {
              _openid: this.data.votingUser.openid,
              articleId: this.data.toVoteArticleId,
              type: this.data.voteType,
              available: true
            }
          })
        } catch (e) {
          this.setData({
            message: {type: "error", text: `投票失败！${e.message || JSON.stringify(e)}`},
            toVoteArticleId: ""
          })
          return Promise.reject(e)
        }
        this.setData({
          message: {type: "success", text: "投票成功！"}
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