// import { RequestInfo, RequestInit } from "node-fetch";
const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')

// a = []
// $('img').each((i,e)=>a.push($(e).attr('src')))
// console.log(a.join('\n'))
const urls = [
]
const saveDir = path.resolve('D:\\Pictures\\Saved Pictures') // 扫描的目录
urls.map((url, index) => {
  fetch(url).then(response => {
    response.body.pipe(fs.createWriteStream(path.join(saveDir, `webgl_3d_${index + 1}${path.extname(url)}`)))
  })
})