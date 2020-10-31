// 云函数入口文件
const cloud = require('wx-server-sdk')
const { Workbook } = require('exceljs')

cloud.init({
  env: "dev-2g7sraj390eaa0cd"
})

// 云函数入口函数
exports.main = async (event, context) => {
  // 打开Excel文件
  const filePath = event.filePath
  const workbook = new Workbook()
  await workbook.xlsx.readFile(filePath)

  worksheet.eachRow(row => {
    let _id = row.getCell("A").value
    let name = row.getCell("B").value
    let phone = row.getCell("C").value
    players.push({_id, name, phone})
  })

  // // 读取Excel文件，边持久化数据
  // const worksheet = workbook.getWorksheet(0)
  // const db = cloud.database()
  // let players = []
  // await db.runTransaction(transaction => {
  //   try {
  //     const collc = transaction.collection("player")
  //     worksheet.eachRow(async row => {
  //       let _id = row.getCell("A").value
  //       let name = row.getCell("B").value
  //       let phone = row.getCell("C").value
  //       players.push({_id, name, phone})
  //       await collc.add({_id, name, phone})
  //     })
  //   } catch (e) {
  //     (async () => {await transaction.rollback(e)})()
  //     return {error: e}
  //   }
  // })
  return players
}