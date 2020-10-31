const strUtil = require("../../utils/string")

Page({
  data: {
    player: {},
    files: [],
    picture: "",
    picID: "",
    subLoading: false,
    subDisable: false,
    message: {}
  },
  onLoad(option) {
    this.setData({
      player: option,
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
    this.setData({subLoading: true})
  },
  async uploadFile(files) {
    console.log('upload files', files)
    // 文件上传的函数，返回一个promise
    try {
      const glb = getApp().globalData
      const tempFilePath = files.tempFilePaths[0]
      const tempFileName = strUtil.getLastBySeq(tempFilePath)
      if (tempFileName === "") {
        throw new Error(`错误的文件路径：${tempFilePath}`)
      }
      // 上传图片文件
      let res = await glb.wxp.cloud.uploadFile({
        cloudPath: tempFileName,
        filePath: tempFilePath
      })
      if (res.statusCode !== 200 || !res.fileID) {
        throw new Error(`上传文件失败！${res.errMsg}`)
      }
      const fileID = res.fileID

      // 图片保存到数据库，并附加引用次数和时间戳，如果超过一定时间图片都未被引用，系统将清除图片
      res = await glb.db.collection("picture").add({
        data: {fileid: fileID, ref: 0, timestamp: Date.now()}
      })
      if (!res._id) {
        // 如果图片持久化失败，删除文件系统中的记录
        await glb.wxp.cloud.deleteFile([fileID])
        throw new Error("图片持久化失败！未收到图片记录ID")
      } else {
        this.setData({
          picID: res._id,
          picture: fileID,
          message: {type: "success", text: "上传图片成功！"},
          subLoading: false
        })
        return Promise.resolve({urls: [fileID]})
      }
    } catch(e) {
      this.setData({
        message: {type: "error", text: `上传文件失败！${JSON.stringify(e)}`},
        subLoading: false
      })
      return Promise.reject(e)
    }
  },
  async onClickSubmit() {
    if (!this.data.picID || !this.data.picture) {
      this.setData({
        message: {type: "error", text: "请选择图片上传后再参赛！"}
      })
      return Promise.reject()
    }
    this.setData({subLoading: true})

    let picSrc = ""
    try {
      // 获取图片临时URL
      let res = await wx.cloud.getTempFileURL({
        fileList: [this.data.picture]
      })
      if (!res.fileList || res.fileList.length !== 1 || !res.fileList[0].tempFileURL) {
        throw new Error("获取图片URL失败！错误的返回结构")
      }
      const picInf = res.fileList[0]
      if (picInf.status !== 0) {
        throw new Error(`获取图片URL失败！${picInf.errMsg}`)
      }
      picSrc = picInf.tempFileURL
    } catch (e) {
      this.setData({
        message: {type: "error", text: `获取图片URL失败！${JSON.stringify(e)}`},
        subLoading: false
      })
      return Promise.reject(e)
    }
    
    try {
      // 组装作品结构，保存进数据库
      const article = {
        author: this.data.player.name,
        room: this.data.player._id,
        vote: 0,
        picSrc
      }
      const db = getApp().globalData.db
      const _ = db.command
      let res = await db.collection("article").add({data: article})
      if (!res._id) {
        throw new Error(`保存作品失败！${res.errMsg}`)
      }
      // 修改图片的引用次数
      res = await db.collection("picture").doc(this.data.picID).update({
        data: {ref: _.inc(1)}
      })
      if (res.stats.updated !== 1) {
        throw new Error(`修改图片引用数错误！${res.errMsg}`)
      }
    } catch (e) {
      this.setData({
        message: {type: "error", text: `保存作品失败！${JSON.stringify(e)}`},
        subLoading: false
      })
      return Promise.reject(e)
    }

    // 成功！跳转到投票页面
    this.setData({
      message: {type: "success", text: "作品提交成功！快来为自己的作品投票吧！"},
      subDisable: true
    })
    setTimeout(() => {
      wx.navigateTo({url: "/pages/index/index?pgIdx=1"})
    }, 2000)
    return Promise.resolve()
  }
})