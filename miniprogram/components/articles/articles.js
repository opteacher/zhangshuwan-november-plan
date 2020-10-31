Component({
  data: {
    message: {},
    articles: []
  },
  lifetimes: {
    attached() {
      this.updArticles().catch(e => {})
    }
  },
  methods: {
    async updArticles() {
      try {
        let res = await getApp().globalData.db.collection("article").get()
        if (!res.data) {
          throw new Error("获取的响应结构错误！")
        }
        this.setData({articles: res.data})
      } catch (e) {
        this.setData({
          message: {type: "error", text: `更新作品列表失败！${JSON.stringify(e)}`}
        })
        return Promise.reject()
      }
    }
  }
})