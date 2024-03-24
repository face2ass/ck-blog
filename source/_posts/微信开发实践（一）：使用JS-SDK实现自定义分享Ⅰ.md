---
title: 微信开发实践（一）：使用JS-SDK实现自定义分享Ⅰ
date: 2017-08-19 13:57:00
categories:
  - [技术]
tags:
  - 微信
---
刚好工作中需要在网页中对接微信的一些接口，以前没玩过，为了比较透彻地了解微信的授权流程以及各个参数的意义，就自己试着搭建了一下前后端的demo并记录下了详细的步骤。

微信测试是一个相当麻烦的事，因为他需要一个外网可以访问的服务器，如果公司里面没有专门给微信搭建一个测试服务，那么对前端来说，没有外网权限的微信调试就是一场噩梦。
<!-- more -->
# 下载和使用NATAPP

如何解决这个问题呢？可以去使用内网穿透工具，直接使自己的本机可以外网访问，我使用了一个叫NATAPP的工具，它还可以送你一个免费的备案过的二级域名。工具的用法非常简单，具体的用法参考官方文档[NATAPP1分钟快速新手图文教程](https://natapp.cn/article/natapp_newbie)。

通过运行natapp -authtoken=注册成功后获取的authtoken，就可以获得你的域名，比如26s4ag.natappfree.cc。

# 配置微信测试号

接下来就可以开始微信公众号开发了，但是没有公众号怎么办，就算有了公众号，一些高级权限的接口也需要申请审核，我只是来测试的，干嘛要那么麻烦，微信团队很体贴，为每个微信提供了我们一个公众号的测试账号，这样无需公众号就可以直接体验和测试公众平台所有高级接口了。

进入“[公众平台测试帐号](http://mp.weixin.qq.com/debug/cgi-bin/sandbox?t=sandbox/login)”绑定本人的微信来创建测试号。

① 在“接口配置信息”那一栏填入你的验证接口和token，以我为例url和token分别为 http://26s4ag.natappfree.cc/verify 和 test666 （目前无法保存配置，可以先放着，等下一步服务器和nginx配置完成）。

② 在“JS接口安全域名”填入你的域名：26s4ag.natappfree.cc。

③ 点击“体验接口权限表”下的“网页服务“ > “网页帐号” \> “修改”，填入授权回调域名：26s4ag.natappfree.cc。

# 编写node后端测试接口

我这里的node后端使用express作为框架，如果你也打算使用这个，可以按照下面的步骤走：

① 进入E盘根目录，创建名为test的node项目：

```bash
> mkdir E:\\test
> cd E:\test\
> npm init -f
> npm install express --save-dev
```

② 编写node express服务器

```javascript
const crypto = require('crypto')
const express = require('express')
const app = express()

const APP_ID = '测试号的APP_ID'
const APP_SECRET = '测试号的APP_SECRET'
const TOKEN = '手动填写的TOKEN'

/**
 * 加密/校验流程如下：
 * 1）将token、timestamp、nonce三个参数进行字典序排序
 * 2）将三个参数字符串拼接成一个字符串进行sha1加密
 * 3）开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
 */
app.get('/verify', function (req, res) {
  const timestamp = req.query.timestamp
  const nonce = req.query.nonce
  const shasum = crypto.createHash('sha1')
  shasum.update([TOKEN, timestamp, nonce].sort().join(''))
  const generatedSignature = shasum.digest('hex')
  if (generatedSignature === req.query.signature) {  // 来自微信服务器
    res.send(req.query.echostr)
  } else {
    res.send('fail')
  }
})

// 启动服务器
const server = app.listen(3000, function () {
  const host = server.address().address
  const port = server.address().port
  console.log('server listening at %s:%s', host, port)
})

```

③ 启动服务器：

```bash
> node 'E:\\test\express.js'
```

PS：express各个函数和命令具体的用法我就不赘述了，不了解的请参考[官方文档](http://www.expressjs.com.cn/)。

# 配置nginx

由于我们的服务器是跑在3000端口，而“接口配置信息”里面只能访问80端口，所以我们需要使用nginx做一次请求转发：

```nginx
server {
    listen       80;
    server_name  26s4ag.natappfree.cc;

    location / {
        proxy_pass   http://127.0.0.1:3000/verify;
    }
}
```

想要对nginx的配置有详细的了解，推荐看这篇[文档](http://www.nginx.cn/doc/index.html)。

这时候，就可以回到“接口配置信息”那里点击提交，如果提示“配置成功”就完成了所有的配置工作。

下一篇文章来说一下如何使用微信的JSSDK。

**目录指引：**

-   [微信开发实践（一）：使用JS-SDK实现自定义分享 Ⅰ](https://my.oschina.net/codingDog/blog/1516659)
-   [微信开发实践（二）：使用JS-SDK实现自定义分享 Ⅱ](https://my.oschina.net/codingDog/blog/1538112)
-   [微信开发实践（三）：获取用户信息](https://my.oschina.net/codingDog/blog/1554294)