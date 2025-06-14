---
title: Hexo博客集成Algolia搜索的完整指南
date: 2024-03-11 16:45:00
categories:
  - [技术, 前端]
tags:
  - algolia
  - 搜索
---

如果你和我一样，使用Hexo这类纯静态博客框架来写个人站点，又想给站点添加全文搜索功能，可以使用第三方文档爬取服务来帮你实现。Algolia可以通过爬虫或官方的API对目标网站的内容创建索引, 在用户搜索时调用接口返回相关内容，让你的读者能够检索到文章。
<!-- more -->

#### Algolia的特色服务
- **极速响应：**虽然是国外网站，但是我使用下来响应速度快得出乎意料
- **智能分词：**网上看了Algolia的评价，都说中文分词支持很差，可能他们用的旧版？我使用后测试了下非常完美
- **高亮显示：**Algolia官方提供了UI组件，可以自动高亮匹配内容
- **搜索分析：**有后台看板提供搜索分析报告（付费功能）
- **跨平台支持：**支持Web、移动应用等多种平台
- **AI增强：**可以使用AI每周帮你生成一次动态同义词，提高相关性（没生成成功，不知道是不是不支持中文）

以上这些除了搜索分析都是免费的，每个月有1万次搜索的免费额度，对于个人博客来说完全够用。

#### Algolia的适用场景
- 内容丰富的技术博客
- 产品文档和知识库
- 电子商务网站
- 社区论坛


#### Algolia账号创建和配置
1. 访问[Algolia官网](https://www.algolia.com/)注册账号
2. 进入[看板](https://dashboard.algolia.com/)创建免费应用（如`MyBlog`）
3. 网页上的后续步骤可以直接点跳过，进入API Keys页面，记录以下关键信息：Application ID、Search API Key
4. 进入看板上的“Search”Tab页面，点击“Create Index”，输入名称（如`blog_omgfaq_com`）创建索引
5. 进入索引详情页的“Configuration”Tab页面，设置可搜索的属性，如果不确定可以不填，默认搜索除保留属性外的所有属性

#### 前端工程配置
1. 安装`hexo-algolia`
2. 在Hexo的`_config.yml`文件中添加以下配置

    ```yaml
    algolia:
      appId: 'YOUR_APP_ID'
      apiKey: 'YOUR_SEARCH_API_KEY'
      indexName: 'blog_omgfaq_com'
      chunkSize: 5000
    ```
3. 进入`node_modules\.bin\`目录
    如果是Windows环境，在PowerShell执行命令：
    ```bash
    $env:HEXO_ALGOLIA_INDEXING_KEY="YOUR_ADMIN_API_KEY";.\hexo clean;.\hexo algolia;
    ```
    如果是Linux环境，在终端执行命令：
    ```bash
    export HEXO_ALGOLIA_INDEXING_KEY=YOUR_ADMIN_API_KEY && hexo clean && hexo algolia
    ```
    该命令会将Hexo的本地`db.json`文件中的数据转换为符合要求的record格式，并通过Algolia API（如[batch](https://www.algolia.com/doc/libraries/swift/v9/methods/search/batch/?client=swift)）上传到指定索引中，完成record的创建（核心源码见[hexo-algolia@1.3.2的command.js文件](https://github.com/thom4parisot/hexo-algolia/blob/main/lib/command.js)）
4. 本博客使用CDN接入Algolia搜索，所以后面只介绍这个方法。
   在公共页面（如head.ejs）引入js文件：

    ```ejs
    <%- js('js/algoliasearch@5.27.0.browser.umd.js') %>
    <%- js('js/instantsearch.js@4.78.3.min.js') %>
   ```
5. 核心js代码：

    ```javascript
    const { liteClient: algoliasearch } = window['algoliasearch/lite']
    // 实例化Algolia客户端
    const searchClient = algoliasearch('ZQSBN7LVWC', '056dd1c3b772aafea665e1573e0837a9')
    const search = instantsearch({
      indexName: 'blog_omgfaq_com_articles',
      searchClient
    })
    
    // 添加搜索组件
    search.addWidgets([
      // 配置组件
      instantsearch.widgets.configure({
        hitsPerPage: 10,
        attributesToSnippet: ['excerpt:50'],  // 配置摘要字段（取前50字）
      }),
  
      // 搜索框组件
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
  
      // 搜索结果组件
      instantsearch.widgets.hits({
        container: '#hits',
        templates: {
          item (hit, { html, components, sendEvent }) {
            return html`...` // 自定义搜索结果html代码
          },
          empty (results) {
            return `...` // 无结果提示信息
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
   
   // 启动搜索
   search.start()
   ```
   
这是本文博客的最终效果：

![](/images/algolia.png)

![](/images/hand.webp)[完整代码戳这里](https://github.com/face2ass/ck-blog/blob/master/themes/kaysama/source/js/script.js)