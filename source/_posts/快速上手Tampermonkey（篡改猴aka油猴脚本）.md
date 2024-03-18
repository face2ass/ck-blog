---
title: 快速上手Tampermonkey（篡改猴aka油猴脚本）
date: 2021-01-16 14:20:00
tags:
---

首先怎么安装就不详细说了，去火狐、chrome或edge的应用商店搜索Tampermonkey安装即可。官网在此：[https://www.tampermonkey.net](https://www.tampermonkey.net/)
<!-- more -->
# 注解配置项说明

配置说明
| 配置项  (a-z ↑) | 说明 |
| --- | --- |
| @antifeature | 隐私与安全声明，如内嵌广告、收集用户数据、挖矿 |
| @author | 作者名称 |
| @connect | 配置哪些域可以被GM_xmlhttpRequest这个API访问 |
| @copyright | 版权说明 |
| @description | 功能描述 |
| @downloadURL |   |
| @exclude | 被通配符匹配上的网站不运行脚本, 即使@match和@include已匹配，允许多行声明 |
| @grant | 用来申请GM_*函数和unsafeWindow权限。默认情况下，脚本是运行在油猴创建的沙盒环境下，沙盒环境无法获取前端页面的上下文。如果声明// @grant none，油猴就会将脚本直接放在前端的上下文中执行，但是这样的话就无法使用GM_*等函数， 一般写脚本的时候是使用unsafeWindow与前端交互，而不使用//@grant none，避免恶意网页检测到并利用GM_*函数 |
| @homepage, @homepageURL, @website, @source | 作者主页，未填写则取@namespace |
| @icon, @iconURL, @defaulticon | 脚本图标，可以是图片URL或base64字符串，低分辨率 |
| @icon64, @icon64URL | 脚本图标，64x64 |
| @include | 和@match类似，允许多行声明 |
| @match | 置顶可以运行脚本的网站，可以使用通配符或正则来匹配网址，允许多行声明 |
| @name | 脚本名称 |
| @namespace | 命名空间，区分不同作者，一般都是写作者的个人网址 |
| @noframes | 禁止脚本在iframe中运行，可避免被一个页面嵌套的多个iframe执行多次 |
| @require | 脚本依赖的js地址，有多个依赖可以声明多次（若依赖的js有"use strict"可能会影响当前脚本的严格模式） |
| @resource | 定义一些需要预加载的资源文件，这些资源可以在脚本中通过GM\_getResourceURL，GM\_getResourceText访问，允许多行声明 |
| @run-at | 注入脚本的时机，可选：context-menu（默认）、document-start、document-body、document-end、document-idle |
| @sandbox | 脚本是否需要运行在沙箱中 |
| @supportURL | 定义帮助页面的地址，方便用户反馈信息和咨询 |
| @updateURL | 脚本的更新地址，必须要和 @version 搭配 |
| @unwrap | 单行的方式插入脚本（具体作用未知） |
| @version | 版本号，用于脚本的更新 |
| @webRequest | 配置GM_webRequest这个API的默认rules参数，可在脚本loaded之前生效 |

API
| 名称 | 说明 |
| --- | --- |
| none | 不需要任何API |
| GM_log | 打印日志 |
| GM_setValue | 新增/编辑缓存 |
| GM_getValue | 获取缓存 |
| GM_deleteValue | 删除缓存 |
| GM_addValueChangeListener |
监听缓存。

```javascript
// 添加一个监听器
const listener_id = GM_addValueChangeListener('hello', function(name, old_value, new_value, remote){
  if(hello == false){
    //具体的调用方法
    //....
  }
})
```

|
| GM_removeValueChangeListener | 

移除缓存监听

```javascript
GM_removeValueChangeListener(listener_id)
```

|
| GM_openInTab | 

```javascript
//active:true，新标签页获取页面焦点
//setParent :true:新标签页面关闭后，焦点重新回到源页面
GM_openInTab("https://www.baidu.com",{ active: true, setParent :true})
```

|
| GM_xmlhttpRequest | 

发送跨域请求  
第一次跨域请求时，会弹出请求对话框，需要选中允许，才能正常进行跨域请求

```javascript
GM_xmlhttpRequest({
  url: 'http://www.httpbin.org/post',
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  },
  data: '',
  onerror: function (res) {
    console.log(res)
  },
  onload: function (res) {
    console.log(res)
  }
})
```

|

# 使用本地编辑器开发

![](https://oscimg.oschina.net/oscnet/up-014826f1466b8c99feef99e8b0f965cd2d2.png)![](https://oscimg.oschina.net/oscnet/up-3a0fdbed6605cef726e091ad890dc6c4a5e.png)![](https://oscimg.oschina.net/oscnet/up-0220507eded47ce93930e39676cad5d7adb.png)![](https://oscimg.oschina.net/oscnet/up-1eb377c59adb2f202cb95579d88d2557228.png)

然后在脚本中使用require指令通过file协议引入本地的js，例如：

![](https://oscimg.oschina.net/oscnet/up-ef3f20c930d71d12d74211db91f83c40fcf.png)

最后，推荐几个非常好用的油猴脚本。

[Userscript+ : 显示当前网站所有可用的UserJS脚本 Jaeger](https://github.com/jae-jae/Userscript-Plus)

[AC-baidu-重定向优化百度搜狗谷歌必应搜索favicon双列](https://greasyfork.org/zh-CN/scripts/14178-ac-baidu-%E9%87%8D%E5%AE%9A%E5%90%91%E4%BC%98%E5%8C%96%E7%99%BE%E5%BA%A6%E6%90%9C%E7%8B%97%E8%B0%B7%E6%AD%8C%E5%BF%85%E5%BA%94%E6%90%9C%E7%B4%A2-favicon-%E5%8F%8C%E5%88%97)

[searchEngineJump：搜索引擎输入框下添加快捷菜单](https://greasyfork.org/zh-CN/scripts/27752-searchenginejump-搜索引擎快捷跳转)

[Search By Image：以图搜图](https://greasyfork.org/zh-CN/scripts/2998-search-by-image)

[网易云音乐下载歌词、封面、歌曲等](https://greasyfork.org/zh-CN/scripts/33046-%E7%BD%91%E6%98%93%E4%BA%91%E9%9F%B3%E4%B9%90%E7%9B%B4%E6%8E%A5%E4%B8%8B%E8%BD%BD)

[知乎增强](https://greasyfork.org/zh-CN/scripts/419081-%E7%9F%A5%E4%B9%8E%E5%A2%9E%E5%BC%BA)

[解除B站区域限制](https://greasyfork.org/zh-CN/scripts/25718-%E8%A7%A3%E9%99%A4b%E7%AB%99%E5%8C%BA%E5%9F%9F%E9%99%90%E5%88%B6)

[bilibili视频、字幕、弹幕下载](https://greasyfork.org/zh-CN/scripts/413228-bilibili%E8%A7%86%E9%A2%91%E4%B8%8B%E8%BD%BD)

更多脚本可以去知名的脚本分享网站 [greasyfork](https://greasyfork.org/zh-CN)。