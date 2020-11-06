Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },
  data: {
  },
  methods: {
    handleClose() {
      this.setData({show: false})
    }
  }
})