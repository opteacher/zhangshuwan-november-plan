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
      try {
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

        console.log(res.tempFiles[0].path)
        res = await wx.cloud.callFunction({
          name: "saveExcel",
          data: {filePath: res.tempFiles[0].path}
        })
        console.log(res.result)
      } catch (e) {
        console.log(e)
      }
    }
  }
})