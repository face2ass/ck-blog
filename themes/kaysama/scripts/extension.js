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
  // 抽取图片作为封面图
  if (data.content) {
    const res = /!\[]\((.*?)(?=\))/.exec(data.content)
    if (res && res.length === 2) {
      data.cover = res[1]
    }
  }
  return data
})

hexo.extend.filter.register('after_post_render', function (data) {
  // if (data.excerpt) {
  //   data.excerpt = htmlToText(data.excerpt, {
  //     baseElements: {
  //       selectors: ['img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
  //     },
  //     selectors: [
  //       { selector: 'img', format: 'skip' },
  //       { selector: 'a', options: { ignoreHref: true } },
  //     ]
  //   })
  // }
  if (data.content) {
    // blockquote标签加上blockquote这个class
    data.content = data.content.replace(/<blockquote.*?>/g, function (item) {
      if (item.includes('class=')) {
        return item.replace(/class="(.*?)(?=")/, 'class="$1 blockquote')
      }
      else {
        return item.replace(/(.*?)>/, '$1 class="blockquote">')
      }
    })
    // console.log('■blockquote tag added class.')
    // table标签加上table这个class
    data.content = data.content.replace(/<table.*?>/g, function (item) {
      if (item.includes('class=')) {
        return item.replace(/class="(.*?)(?=")/, 'class="$1 table')
      }
      else {
        return item.replace(/(.*?)>/, '$1 class="table">')
      }
    })
    // console.log('■table tag added class.')
  }
  if (data.excerpt) {
    // 移除简介里的图片
    data.excerpt = data.excerpt.replace(/<img [\s\S]*?>/g, '')
    // 移除简介里的链接
    data.excerpt = data.excerpt.replace(/href="([\s\S]*?)"/g, 'href="javascript:void(0);"')
  }
  return data
})

hexo.extend.helper.register('category_breadcrumb', function (page) {
  const path = page.base
  const url_for = this.url_for
  const pathStrArr = path.split('/').filter((p, i) => {
    return i > 0 && p
  })
  const pathArr = pathStrArr.map((p, i) => {
    return {
      label: p,
      link: url_for(`categories/${pathStrArr.slice(0, i + 1).join('/')}`)
    }
  })
  return `
  <nav>
    <ol class="breadcrumb">
      <li class="breadcrumb-item">
        <a class="link-body-emphasis" href="${url_for('/')}">
          <svg class="bi" width="16" height="16"><use xlink:href="#house-door-fill"></use></svg>
        </a>
      </li>
      ${pathArr.map((p, i) => `
        <li class="breadcrumb-item ${i === pathArr.length - 1 ? 'active' : ''}">
          <a class="link-body-emphasis fw-semibold text-decoration-none" href="${p.link}">${p.label}</a>
        </li>
      `).join('')}
    </ol>
  </nav>
`
})

hexo.extend.helper.register('article_category_breadcrumb', function (post) {
  const categories = post.categories
  const url_for = this.url_for
  if (categories.length) {
    return `
    <nav style="--bs-breadcrumb-divider: '>';">
      <ol class="breadcrumb">
      ${categories.map((cat, index) => {
      return `<li class="breadcrumb-item ${index === categories.length - 1 ? 'active' : ''}"><a href="${url_for(cat.path)}">${cat.name}</a></li>`
    }).join('')}
      </ol>
    </nav>
    `
  }
  else {
    return ''
  }
})

hexo.extend.helper.register('sort_list', function (list) {
  const _list = list.map(v => ({ name: v.name, path: v.path, length: v.length }))
  // 先按文章数，再按首字母排序
  _list.sort((a, b) => {
    const delta = b.length - a.length
    if (delta === 0) {
      return (a.name).localeCompare(b.name)
    }
    else {
      return delta
    }
  })
  return _list
})