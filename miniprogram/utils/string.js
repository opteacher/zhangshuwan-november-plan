const _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
// private method for UTF-8 encoding
function _utf8_encode(string) {
  string = string.replace(/\r\n/g, "\n");
  var utftext = "";

  for (var n = 0; n < string.length; n++) {
    var c = string.charCodeAt(n);
    if (c < 128) {
      utftext += String.fromCharCode(c);
    } else if ((c > 127) && (c < 2048)) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    } else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }
  }
  return utftext;
}

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
  },
  getFileSuffix(fname) {
    const poiIdx = fname.lastIndexOf(".")
    if (poiIdx === -1) {
      return ""
    }
    return fname.substring(poiIdx)
  },
  // public method for encoding
  encodeBase64(input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = _utf8_encode(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }
    return output;
  }
}