// 返回值：valid{是否具有投票资格}, resp{查询投票资格产生的额外数据}, message{错误或提示信息}
async function validVote(votingUser) {
  try {
    // 检查是否超过投票上限
    let res = await wx.cloud.callFunction({
      name: "chkVoteable",
      data: {votingUser}
    })
    if (!res.result || res.error) {
      throw res.error || new Error("检车投票资格错误！返回值缺少result字段")
    }
    if (!res.result.votable) {
      let message = {}
      if (!res.result.type) {
        message = {type: "error", text: "对不起，你今天已经超过投票上限！请等到明天再投票"}
      } else {
        message = {type: "info", text: "对不起，你每日投票资格已用！你可通过右上角菜单中的转发朋友群或者发朋友圈获得投票资格"}
      }
      return Promise.resolve({valid: false, message})
    }
    return Promise.resolve({valid: true, resp: res.result})
  } catch(e) {
    return Promise.resolve({
      message: {type: "error", text: `查询投票资质失败！${e.message || JSON.stringify(e)}`}
    })
  }
}

// 参数：articleId{投票的作品ID}, _openid{投票者的openid}, type{投票类型（每日、转发、朋友圈）}
async function doVote(articleId, _openid, type) {
  try {
    // 更新投票数
    const db = wx.cloud.database()
    const _ = db.command
    await wx.cloud.database().collection("article").doc(articleId).update({
      data: {vote: _.inc(1)}
    })

    // 记录投票
    await wx.cloud.callFunction({
      name: "logVote",
      data: {_openid, articleId, type}
    })
  } catch (e) {
    return Promise.resolve({
      message: {type: "error", text: `投票失败！${e.message || JSON.stringify(e)}`}
    })
  }
  return Promise.resolve({
    message: {type: "success", text: "投票成功！"}
  })
}

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
      const res = await validVote(e.detail.userInfo)
      if (res.message) {
        this.setData({message: res.message})
      }
      if (res.valid) {
        this.setData({
          toVoteArticleId,
          votingUser: Object.assign(e.detail.userInfo, {
            openid: res.resp.openid
          }),
          voteType: res.resp.type
        })
      }
      this.setData({voteLoadingArticle: ""})
    },
    async onVoteConfirm(e) {
      if (e.detail.index === 1) {
        const res = await doVote(
          this.data.toVoteArticleId,
          this.data.votingUser.openid,
          this.data.voteType)
        this.setData({message: res.message})
      }
      this.setData({toVoteArticleId: ""})
      return this.updArticles()
    },
    onPicLnkClick(e) {
      wx.navigateTo({url: `../../pages/detail/detail?_id=${e.currentTarget.dataset.target}`})
    }
  }
})

module.exports = {validVote, doVote}