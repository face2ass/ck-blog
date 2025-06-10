;(function ($) {
  const $highlight = $('.highlight')
  if ($highlight.length) {
    $highlight.each((index, ele) => {
      $(ele).addClass('bg-body-tertiary border rounded')
    })
  }

  const $tagToggleTrigger = $('.tag-toggle-trigger')
  const $tagItemWrap = $('.tag-list')
  if ($tagToggleTrigger.length) {
    $tagToggleTrigger.click(() => {
      console.log('$tagItemWrap:', $tagItemWrap)
      $tagItemWrap.toggleClass('expanded', (e) => {
        console.log(e)
      })
    })
  }

  // 处理展开收起
  $('.category-tree .toggle-trigger').on('click', function () {
    const $parent = $(this).parent()
    $parent.toggleClass('active')
    $parent.next('.sub-tree').toggle()
  })

  // 处理叶子节点点击跳转
  $('.category-tree .leaf, .category-tree .sub-leaf').on('click', function (e) {
    e.preventDefault()
    const path = e.target.dataset.path
    if (path) {
      window.location.href = location.origin + '/categories/' + path
    }
  })

  // 初始化Algolia搜索
  const { liteClient: algoliasearch } = window['algoliasearch/lite']
  // 初始化Algolia搜索
  const searchClient = algoliasearch('ZQSBN7LVWC', '056dd1c3b772aafea665e1573e0837a9')
  const search = instantsearch({
    indexName: 'blog_omgfaq_com_articles',
    searchClient
  })

  // 添加搜索组件
  search.addWidgets([
    // 配置每页显示10条结果
    instantsearch.widgets.configure({
      hitsPerPage: 10,
      attributesToSnippet: ['excerpt:50'],
    }),

    // 搜索框
    instantsearch.widgets.searchBox({
      container: '#searchbox',
      placeholder: '输入关键词搜索文章...',
      showReset: false,
      showSubmit: true,
      showLoadingIndicator: true,
      searchAsYouType: false, // 禁用输入时实时搜索
      templates: {
        submitIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`
      }
    }),

    // 搜索结果
    instantsearch.widgets.hits({
      container: '#hits',
      templates: {
        item (hit, { html, components, sendEvent }) {
          console.log('■hits：', html, components, sendEvent)
          return html`
            <div class="hit">
              <div class="meta-info">
                <div class="categories">
                  ${hit.categories.map(category => html`<span class="category">${category.name}</span>`)}
                </div>
                <div class="date">
                  ${new Date(hit.date).toLocaleDateString('zh-CN')}
                </div>
              </div>

              <h3>${components.Highlight({ hit, attribute: 'title' })}</h3>

              <div class="tags ${hit.tags.length ? 'show' : 'hidden'}">
                ${hit.tags.map(tag => html`<span class="tag">${tag.name}</span>`)}
              </div>

              <div class="excerpt">
                ${components.Snippet({ hit, attribute: 'excerpt', highlightedTagName: 'em', })}
              </div>

              <a class="read-more" href="${hit.permalink}">阅读全文</a>
            </div>
          `
        },
        empty (results) {
          return `
              <div class="no-results">
                  <h3>未找到相关结果</h3>
                  <p>请尝试不同的关键词</p>
              </div>
          `
        }
      }
    }),

    // 分页组件
    instantsearch.widgets.pagination({
      container: '#pagination',
      padding: 2,
      scrollTo: '#searchbox'
    })
  ])

  // 初始化搜索
  search.start()

  const openBtn = document.getElementById('algolia-search-bar')
  const closeBtn = document.getElementById('closeSearch')
  const modal = document.getElementById('searchModal')
  // const searchInput = document.getElementById('searchInput');
  // const searchButton = document.getElementById('searchButton');
  // const hitsContainer = document.getElementById('hits');
  // const paginationContainer = document.getElementById('pagination');

  openBtn.addEventListener('click', () => {
    modal.classList.add('active')
    // 延迟设置焦点以确保搜索框已渲染
    setTimeout(() => {
      document.querySelector('#searchbox input')?.focus()
    }, 100)
  })

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active')
  })

  // 点击遮罩关闭弹窗
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active')
    }
  })

  // 按ESC键关闭弹窗
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active')
    }
  })

})(jQuery)