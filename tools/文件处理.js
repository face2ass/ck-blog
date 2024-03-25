const fs = require('fs')
const path = require('path')

// 重命名文件 _改为-

const scanDir = path.resolve('C:\\Users\\Tank\\OneDrive\\图片') // 扫描的目录

const targetFileList = []

let completedCount = 0

console.log('------------------- start -------------------')
fileDisplay(scanDir)

function fileDisplay(fileDir) {
  try {
    const files = fs.readdirSync(fileDir)
    let filename, newFilename
    for (let i = 0; i < files.length; i++) {
      filename = files[i]
      var filePath = path.join(fileDir, filename)
      const stats = fs.statSync(filePath)
      var isFile = stats.isFile()
      var isDir = stats.isDirectory()
      if (isFile) {
        // 下划线改为中划线
        if (filename.indexOf('_') !== -1) {
          newFilename = filename.replace(/_/g, '-')
          fs.renameSync(filePath, path.join(fileDir, newFilename))
          console.log(++completedCount, filename, '===>', newFilename)
        }

      }
      if (isDir) {
        fileDisplay(filePath)
      }
    }
  } catch (e) {
    console.error(e)
  }
}

console.log(targetFileList.join('\n'))
// fs.writeFileSync('坦克大战网络版.rdf', availableFiles.join('\r\n'));
console.log('------------------- end -------------------')