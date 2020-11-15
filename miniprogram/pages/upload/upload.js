const strUtil = require("../../utils/string")

Page({
  data: {
    showForm: false,
    player: {},
    files: [],
    picture: {
      name: "",
      url: ""
    },
    decl: "",
    subLoading: false,
    subDisable: false,
    message: {}
  },
  async onLoad(option) {
    const db = wx.cloud.database()
    try {
      let res = await db.collection("setting").limit(1).get()
      if (!res.data || !res.data.length) {
        throw new Error("查询配置表错误！返回值缺少data字段")
      }
      const setting = res.data[0]
      this.setData({
        showForm: setting.showForm,
        player: option,
        selectFile: this.selectFile.bind(this),
        uploadFile: this.uploadFile.bind(this)
      })
    } catch(e) {
      this.setData({
        message: {type: "error", text: e.message || JSON.stringify(e)}
      })
    }
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
    try {
      const glb = getApp().globalData
      const tempFilePath = files.tempFilePaths[0]
      const tempFileName = strUtil.getLastBySeq(tempFilePath)
      const fileName = `${this.data.player.name}_${tempFileName}`
      const fileURL = `${glb.fileServer}/zhangshuwan_november_plan/assets/images/${fileName}`
      // 上传图片文件
      let res = await glb.wxp.uploadFile({
        url: `${glb.fileServer}/zhangshuwan_november_plan/api/v1/files/upload`,
        filePath: tempFilePath,
        name: fileName,
        formData: {"fileKey": fileName},
        header: {
          "Authorization": `Basic ${strUtil.encodeBase64("opteacher:59524148")}`
        }
      })
      if (res.statusCode != 200) {
        throw new Error(res.data || res.errMsg)
      }
      await new Promise(resolve => setTimeout(resolve, 500))
      
      this.setData({
        picture: {name: fileName, url: fileURL},
        message: {type: "success", text: "上传图片成功！"},
        subLoading: false
      })
      return Promise.resolve({urls: [fileURL]})
    } catch(e) {
      console.log(e)
      this.setData({
        message: {type: "error", text: `上传文件失败！${e.message || JSON.stringify(e)}`},
        subLoading: false
      })
      return Promise.reject(e)
    }
  },
  async onClickSubmit() {
    if (!this.data.picture.name.length) {
      this.setData({
        message: {type: "error", text: "请选择图片上传后再参赛！"}
      })
      return Promise.reject()
    }
    this.setData({subLoading: true})

    let articleId = ""
    try {
      // 组装作品结构，保存进数据库
      const article = {
        author: this.data.player.name,
        authorId: this.data.player._id,
        room: this.data.player.room,
        declaration: this.data.decl,
        vote: 0,
        picID: this.data.picture.name,
        picURL: this.data.picture.url,
        picExpired: 0
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
    wx.reLaunch({url: `../../pages/detail/detail?_id=${articleId}`})
    return Promise.resolve()
  },
  onDeclChange(e) {
    this.setData({decl: e.detail.value})
  }
})