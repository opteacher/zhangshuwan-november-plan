module.exports = {
  getLastBySeq(str, seq = "/") {
    const idx = str.lastIndexOf(seq)
    if (idx === -1) {
      return ""
    }
    return str.substring(idx + 1)
  },
  cvtObjToUriParams(obj) {
    let query_str = JSON.stringify(obj)
    // console.log(query_str)
    // {"news_id":"144","scorce":"seo"}
    let query_str_a = query_str.replace(/:/g,"=")
    // console.log(query_str_a)
    //{"news_id"="144","scorce"="seo"}
    let query_str_b = query_str_a.replace(/"/g, '')
    // console.log(quert_str_b)
    //{news_id=144,scorce=seo}
    let query_str_c = query_str_b.replace(/,/g, '&')
    // console.log(quert_str_c)
    //{news_id=144&scorce=seo}
    //去掉{}
    let query_str_d = query_str_c.match(/\{([^)]*)\}/)
    // console.log(query_str_d[1])
    //news_id=144&scorce=seo
    return query_str_d[1]
  }
}