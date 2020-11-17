// 云函数入口文件
const cloud = require('wx-server-sdk')
const { Workbook } = require('exceljs')

cloud.init({env: "prod-7gyout13519352e3"})
const db = cloud.database()

async function parseExcel(fileID) {
  // 下载Excel文件（处理完毕即删除）
  let res = await cloud.downloadFile({fileID})
  if (!res.fileContent) {
    return Promise.reject(
      {error: new Error("读取Excel失败!")
    })
  }

  // 打开Excel文件
  const workbook = new Workbook()
  await workbook.xlsx.load(res.fileContent)

  // 读取Excel文件，边持久化数据
  const worksheet = workbook.getWorksheet(1)
  let players = []
  let transaction = null
  try {
    await db.runTransaction(async ta => {
      transaction = ta
      const collc = transaction.collection("player")
      worksheet.eachRow(async row => {
        const player = {
          room: row.getCell("A").value.toString(),
          name: row.getCell("B").value,
          phone: row.getCell("C").value.toString(),
          status: "未参赛"
        }
        players.push(player)
        await collc.add({data: player})
      })
    })
  } catch (e) {
    (async () => {
      if (!transaction) {
        await transaction.rollback(e)
      }
    })()
    return Promise.reject({error: e})
  }
  return Promise.resolve(players)
}

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const result = await parseExcel(event.fileID)
    // 删除Excel文件
    await cloud.deleteFile({fileList: [event.fileID]})
    return Promise.resolve(result)
  } catch (e) {
    return Promise.reject(e)
  }
}