Page({
  data: {
    files: [],
    picture: "",
    subLoading: false,
    message: {}
  },
  onLoad() {
    this.setData({
      selectFile: this.selectFile.bind(this),
      uploadFile: this.uploadFile.bind(this)
    })
  },
  selectFile(files) {
    console.log('files', files)
    // 返回false可以阻止某次文件上传
    if (!files.tempFilePaths || !files.tempFilePaths.length) {
      this.setData({
        message: {type: "error", text: "请选择要上传的图片！"}
      })
      return false
    }
  },
  async uploadFile(files) {
    console.log('upload files', files)
    // 文件上传的函数，返回一个promise
    try {
      const glb = getApp().globalData
      const tempFilePath = files.tempFilePaths[0]
      const lastSepIdx = tempFilePath.lastIndexOf("/")
      if (lastSepIdx === -1) {
        throw new Error(`错误的文件路径：${tempFilePath}`)
      }
      const tempFileName = tempFilePath.substring(lastSepIdx + 1)
      // 上传图片文件
      let res = await glb.wxp.cloud.uploadFile({
        cloudPath: tempFileName,
        filePath: tempFilePath
      })
      if (res.statusCode !== 200 || !res.fileID) {
        this.setData({
          message: {type: "error", text: `上传文件失败！${res.errMsg}`}
        })
        return Promise.reject(new Error(res.errMsg))
      }
      const fileID = res.fileID

      // 保存到数据库
      res = await glb.db.collection("picture").add({
        data: {fileid: fileID, ref: 0, timestamp: Date.now()}
      })
      if (!res._id) {
        // 如果图片持久化失败，删除文件系统中的记录
        await glb.wxp.cloud.deleteFile([fileID])
        this.setData({
          message: {type: "error", text: "图片持久化失败！"}
        })
        return Promise.reject(new Error("图片持久化失败！"))
      } else {
        this.setData({
          picture: fileID,
          message: {type: "success", text: "上传图片成功！"}
        })
        return Promise.resolve({urls: [fileID]})
      }
    } catch(e) {
      console.log(e)
      return Promise.reject(e)
    }
  }
})