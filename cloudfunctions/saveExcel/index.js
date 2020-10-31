// 云函数入口文件
const cloud = require('wx-server-sdk')
const { Workbook } = require('exceljs')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  // 打开Excel文件
  const filePath = res.tempFiles[0].filePath
  const workbook = new Workbook()
  await workbook.xlsx.readFile(filePath)

  // 读取Excel文件
  const worksheet = workbook.getWorksheet(0)
  worksheet.eachRow(row => {
    let id = row.getCell("A").value
    let name = row.getCell("B").value
    let phone = row.getCell("C").value
    console.log(`${id}-${name}-${phone}`)
  })

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}