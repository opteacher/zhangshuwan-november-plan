Component({
  data: {
    message: {}
  },
  lifetimes: {
    attached() {
    }
  },
  methods: {
    search: function (value) {
      return new Promise((resolve, reject) => {
          setTimeout(() => {
              resolve([{text: '搜索结果', value: 1}, {text: '搜索结果2', value: 2}])
          }, 200)
      })
    },
    async onClickUpload() {
      const glb = getApp().globalData
      let res = await glb.wxp.chooseMessageFile({
        count: 1,
        type: "file",
        extension: ["xls", "xlsx"]
      })
      if (!res.tempFiles || !res.tempFiles.length) {
        this.setData({
          message: {type: "error", text: "请选择一个文档文件！"}
        })
        return Promise.reject()
      }
    }
  }
})