Component({
  data: {
    depts: [],
    author: "",
    deptIdx: 0,
    subLoading: false,
    message: {}
  },
  lifetimes: {
    async attached() {
      let res = await getApp().globalData.db.collection("department").get()
      if (!res.data) {
        this.setData({
          message: {
            type: "error",
            text: res.errMsg
          }
        })
      } else {
        this.setData({depts: res.data.map(dept => dept.name)})
      }
    }
  },
  methods: {
    onInputAuthor(e) {
      this.setData({author: e.detail.value})
    },
    onClickNext() {
      this.setData({subLoading: true})
      if (this.data.author === "1") {
        // 跳转到管理员页面
        wx.navigateTo({
          url: "../../pages/admin/admin"
        })
        this.setData({subLoading: false})
      } else {
        setTimeout(() => {
          this.setData({subLoading: false})
          wx.navigateTo({url: "/pages/upload/upload"})
        }, 1000)
      }
    },
    onDeptChange(e) {
      this.setData({deptIdx: e.detail.value})
    }
  }
})