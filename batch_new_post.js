const Hexo = require('hexo')
const hexo = new Hexo(process.cwd(), {})

// 从osc抓取博客目录
// arr = []
// $('.blog-item').each((i,n)=>{
//   const header = $(n).find('.header').eq(0)[0]
//   const $date = $(n).find('.ui.horizontal.small.list>.item:nth-child(2)').eq(0)
//   arr.push([header.childNodes[header.childNodes.length-1].textContent.replace(/\s/g, ''), $date.text()])
// })
// console.log(JSON.stringify(arr))

const list = []
hexo.init().then(function () {
  console.log('init')
  try {
    list.forEach(([title, date]) => {
      hexo.post.create({
        title,
        date,
      }, true)
    })
  } catch (e) {
    console.log('出错')
  }
})