const strUtil = require("../../utils/string")

Page({
  data: {
    player: {},
    files: [],
    picture: "",
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
      if (!res.fileID) {
        throw new Error(`上传文件失败！${res.errMsg}`)
      }
      const fileID = res.fileID

      this.setData({
        picture: fileID,
        message: {type: "success", text: "上传图片成功！"},
        subLoading: false
      })
      return Promise.resolve({urls: [fileID]})
    } catch(e) {
      this.setData({
        message: {type: "error", text: `上传文件失败！${e.message || JSON.stringify(e)}`},
        subLoading: false
      })
      return Promise.reject(e)
    }
  },
  async onClickSubmit() {
    if (!this.data.picture) {
      this.setData({
        message: {type: "error", text: "请选择图片上传后再参赛！"}
      })
      return Promise.reject()
    }
    this.setData({subLoading: true})

    let picURL = ""
    let picExpired = 0
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
      picURL = picInf.tempFileURL
      // 过期时间：2个小时
      picExpired = Date.now() + 2*60*60*1000
    } catch (e) {
      this.setData({
        message: {type: "error", text: `获取图片URL失败！${e.message || JSON.stringify(e)}`},
        subLoading: false
      })
      return Promise.reject(e)
    }
    
    let articleId = ""
    try {
      // 组装作品结构，保存进数据库
      const article = {
        author: this.data.player.name,
        room: this.data.player.room,
        vote: 0,
        picID: this.data.picture,
        picURL,
        picExpired
      }
      const db = wx.cloud.database()
      const _ = db.command
      let res = await db.collection("article").add({data: article})
      if (!res._id) {
        throw new Error(`保存作品失败！${res.errMsg}`)
      }
      articleId = res._id

      // 更新选手状态为参赛中
      await wx.cloud.callFunction({
        name: "joinGame",
        data: {_id: this.data.player._id}
      })
    } catch (e) {
      this.setData({
        message: {type: "error", text: `保存作品失败！${e.message || JSON.stringify(e)}`},
        subLoading: false
      })
      return Promise.reject(e)
    }

    // 成功！跳转到投票页面
    this.setData({
      message: {type: "success", text: "作品提交成功！快来为自己的作品投票吧！"},
      subDisable: true
    })
    await new Promise(resolve => setTimeout(resolve, 2000))
    const idxPage = getCurrentPages().find(page => page.route === "pages/index/index")
    wx.navigateBack()
    // 跳转到投票页面
    idxPage.setData({curIndex: 1})
    await new Promise(resolve => setTimeout(resolve, 500))
    wx.redirectTo({url: `../../pages/detail/detail?_id=${articleId}`})
    return Promise.resolve()
  }
})