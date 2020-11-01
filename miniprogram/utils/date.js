module.exports = {
  isTimestampBelongToday(timestamp) {
    if (new Date(timestamp).toDateString() === new Date().toDateString()) {
      return true
    } else if (new Date(timestamp) < new Date()){
      return false
    }
    return false
  }
}