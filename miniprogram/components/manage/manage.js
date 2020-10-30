Component({
  data: {
    depts: [],
    addDeptDlg: false,
    buttons: [{text: "取消"}, {text: "确定"}],
    deptData: {},
    message: {},
    deptForDel: ""
  },
  lifetimes: {
    attached() {
      this.updDeptList()
    }
  },
  methods: {
    async updDeptList() {
      let res = await getApp().globalData.db.collection("department").get()
      if (!res.data) {
        this.setData({
          message: {
            type: "error",
            text: res.errMsg
          }
        })
      } else {
        this.setData({depts: res.data})
      }
    },
    onClickAdd() {
      this.setData({addDeptDlg: true})
    },
    onDeptNameChange(e) {
      this.setData({"deptData.name": e.detail.value})
    },
    onDeptCodeChange(e) {
      this.setData({"deptData.code": e.detail.value})
    },
    async onTapAddDeptDlgBtn(e) {
      let res = null
      switch (e.detail.index) {
        case 1:
          res = await getApp().globalData.db.collection("department").add({
            data: this.data.deptData
          })
          this.setData({
            addDeptDlg: false,
            message: res._id ? {
              type: "success",
              text: `添加部门成功！ID为${res._id}`
            } : {
              type: "error",
              text: res.errMsg
            }
          })
          this.updDeptList()
          break;
        default:
          this.setData({addDeptDlg: false})
          break;
      }
    },
    onTapDelDeptLnk(e) {
      this.setData({deptForDel: e.currentTarget.dataset.target})
    },
    async onTapDelDeptDlgBtn(e) {
      let res = null
      switch (e.detail.index) {
        case 1:
          res = await getApp().globalData.db.collection("department").doc(this.data.deptForDel).remove()
          console.log(res)
          this.setData({
            deptForDel: "",
            message: res.stats && res.stats.removed === 1 ? {
              type: "success",
              text: "删除部门成功！"
            } : {
              type: "error",
              text: res.errMsg
            }
          })
          this.updDeptList()
          break;
        default:
          this.setData({deptForDel: ""})
          break;
      }
    }
  }
})