module.exports = {
  getLastBySeq(str, seq = "/") {
    const idx = str.lastIndexOf(seq)
    if (idx === -1) {
      return ""
    }
    return str.substring(idx + 1)
  }
}