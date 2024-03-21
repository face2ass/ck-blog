const { htmlToText } = require('html-to-text')

// hexo.extend.generator.register('post', function (locals) {
//   const posts = locals.posts.map(function (post, index) {
//     let cover = ''
//     post.content && post.content.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/, function (match, capture) {
//       cover = capture
//     })
//     // console.log('■', index, post.title, post.thumbnail, cover)
//     return {
//       path: post.path,
//       data: { ...post, thumbnail: post.thumbnail + '?a=666', cover },
//       thumbnail: post.thumbnail + '?b=777',
//       layout: post.layout,
//     }
//   })
//   console.log(locals.posts.length, 'posts processed.')
//   return posts
// })

// hexo.extend.generator.register('post', function (locals) {
//   console.log('■post')
//   return locals.posts.map(function (post) {
//     return {
//       path: post.path,
//       data: post,
//       layout: 'post'
//     }
//   })
// })
hexo.extend.filter.register('before_post_render', function (data) {
  if (data.content) {
    const res = /!\[]\(\s*(.+.*\.\S+).*?\).*/.exec(data.content)
    if (res && res.length === 2) {
      data.cover = res[1]
    }
  }
  return data
})

hexo.extend.filter.register('after_post_render', function (data) {
  if (data.excerpt) {
    data.excerpt = htmlToText(data.excerpt, {
      baseElements: {
        selectors: ['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
      },
      selectors: [
        { selector: 'img', format: 'skip' },
        { selector: 'a', options: { ignoreHref: true } },
      ]
    })
  }
  return data
})

// function myCustomFilterFunction(args) {
//   console.log('■myCustomFilterFunction', args)
// }