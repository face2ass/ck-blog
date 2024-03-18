---
title: 微信开发实践（二）：使用JS-SDK实现自定义分享Ⅱ
date: 2017-09-15 17:18:00
tags:
---
为了快速帮大家理解，这次的demo就直接修改公众号官网的[示例代码](http://203.195.235.76/jssdk/)来给大家演示。如果大家不想听我啰嗦，可以直接移步官方文档——[https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115)。

由于移动设备调试起来不是特别方便，建议大家先去官网下载微信的[web开发者工具](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1455784140)，直接在PC上测试。具体用法非常简单，我就不赘述了。需要注意的是必须得先在此页面（[https://mp.weixin.qq.com/cgi-bin/safecenterstatus?action=devlist&token=711880374&lang=zh_CN](https://mp.weixin.qq.com/cgi-bin/safecenterstatus?action=devlist&token=711880374&lang=zh_CN)）绑定开发者账号才能使用工具

上一篇教程咱们已经完成JS接口安全域名的绑定，首先，在项目根目录下创建html静态页面
<!-- more -->
test.html：

```html
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>微信JS-SDK Demo</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0">
    <link rel="stylesheet" href="http://203.195.235.76/jssdk/css/style.css">
    <script src="https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js"></script>
</head>

<body ontouchstart="">
	<div class="wxapi_container">
		<div class="lbox_close wxapi_form">
			<span class="desc">获取“分享给朋友”按钮点击状态及自定义分享内容接口</span>
			<button class="btn btn_primary" id="onMenuShareAppMessage">onMenuShareAppMessage</button>
		</div>
	</div>
</body>

<script src="//res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
<script>
    // 微信配置
</script>
<script src="http://203.195.235.76/jssdk/js/zepto.min.js"></script>

</html>
```

接下来

# ① 在需要调用JS接口的页面引入如下JS文件

[http://res.wx.qq.com/open/js/jweixin-1.2.0.js](http://res.wx.qq.com/open/js/jweixin-1.2.0.js)（支持https），如果还不确定自己网站的协议将来是否支持https，可以直接省略协议（//res.wx.qq.com/open/js/jweixin-1.2.0.js）

# ② 后端实现签名生成算法

下面这段引用自官网：

> 所有需要使用JS-SDK的页面必须先注入配置信息，否则将无法调用（同一个url仅需调用一次，对于变化url的SPA的web app可在每次url变化时进行调用,目前Android微信客户端不支持pushState的H5新特性，所以使用pushState来实现web app的页面会导致签名失败，此问题会在Android6.2中修复）。
>
> ```javascript
> wx.config({
>     debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
>     appId: '', // 必填，公众号的唯一标识
>     timestamp: , // 必填，生成签名的时间戳
>     nonceStr: '', // 必填，生成签名的随机串
>     signature: '',// 必填，签名，见附录1
>     jsApiList: [] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
> });
> ```

由于这些权限验证配置都是后端生成的，所以我们需要修改express.js文件，官网提供了生成签名的算法：

> ## **附录1-JS-SDK使用权限签名算法**
>
> **_jsapi_ticket_**  
> 生成签名之前必须先了解一下jsapi\_ticket，jsapi\_ticket是公众号用于调用微信JS接口的临时票据。正常情况下，jsapi_ticket的有效期为7200秒，通过access\_token来获取。由于获取jsapi\_ticket的api调用次数非常有限，频繁刷新jsapi_ticket会导致api调用受限，影响自身业务，开发者必须在自己的服务全局缓存jsapi_ticket 。
>
> 1.  参考以下文档获取access_token（有效期7200秒，开发者必须在自己的服务全局缓存access_token）：../15/54ce45d8d30b6bf6758f68d2e95bc627.html
> 2.  用第一步拿到的access\_token 采用http GET方式请求获得jsapi\_ticket（有效期7200秒，开发者必须在自己的服务全局缓存jsapi_ticket）：https://api.weixin.qq.com/cgi-bin/ticket/getticket?access\_token=ACCESS\_TOKEN&type=jsapi
>
> 成功返回如下JSON：
>
> ```json
> {
>     "errcode": 0,
>     "errmsg": "ok",
>     "ticket": "bxLdikRXVbTPdHSM05e5u5sUoXNKd8-41ZO3MhKoyN5OfkWITDGgnr2fwJ0m9E8NYzWKVZvdVtaUgWvsdshFKA",
>     "expires_in": 7200
> }
> ```
>
> 获得jsapi_ticket之后，就可以生成JS-SDK权限验证的签名了。
>
>
> _**签名算法**_  
> 签名生成规则如下：参与签名的字段包括noncestr（随机字符串）, 有效的jsapi_ticket, timestamp（时间戳）, url（当前网页的URL，不包含#及其后面部分） 。对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1。这里需要注意的是所有参数名均为小写字符。对string1作sha1加密，字段名和字段值都采用原始值，不进行URL 转义。  
> 即signature=sha1(string1)。 示例：
>
> ```
> noncestr=Wm3WZYTPz0wzccnW
> jsapi_ticket=sM4AOVdWfPE4DxkXGEs8VMCPGGVi4C3VM0P37wVUCFvkVAy_90u5h9nbSlYy3-Sl-HhTdfl2fzFy1AOcHKP7qg
> timestamp=1414587457
> url=http://mp.weixin.qq.com?params=value
> ```
>
> 步骤1\. 对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后，使用URL键值对的格式（即key1=value1&key2=value2…）拼接成字符串string1：
>
> ```
> jsapi_ticket=sM4AOVdWfPE4DxkXGEs8VMCPGGVi4C3VM0P37wVUCFvkVAy_90u5h9nbSlYy3-Sl-HhTdfl2fzFy1AOcHKP7qg&noncestr=Wm3WZYTPz0wzccnW&timestamp=1414587457&url=http://mp.weixin.qq.com?params=value
> ```
>
> 步骤2\. 对string1进行sha1签名，得到signature：
>
> ```
> 0f9de62fce790f9a083d5c99e95740ceb90c27ed
> ```
>
> 注意事项
>
> 1.  签名用的noncestr和timestamp必须与wx.config中的nonceStr和timestamp相同。
> 2.  签名用的url必须是调用JS接口页面的完整URL。
> 3.  出于安全考虑，开发者必须在服务器端实现签名的逻辑。
>
> 如出现invalid signature 等错误详见附录5常见错误及解决办法。

_ps：我们这里使用是全局基础的access\_token，要注意其与关于网页授权access\_token的区别_

复述了一堆，下面我们用node来实现上面的算法，因为是基础入门教程，我对代码做了些精简：

① 后端代码中不会使用数据库，通过直接将获取的access\_token写到文件系统的方式作为缓存机制（当然你也可以把access\_token放到一个全局变量里，不过一旦服务器重启变量就从内存里消失了，对于测试来说咱们还是珍惜一下有限的调用次数吧）。

② 后端代码不会涉及定时任务，由于access\_token和jsapi\_ticket的时效时间都是2小时，如果生成签名失败，需要手动清空缓存（这里是指删除文件），因为我会每次生成签名前会从缓存（这里是指文件系统）中取accessToken，如果不存在就会从微信服务器重新获取并刷新缓存（重新生成文件）

修改后的express.js：

```javascript
const fs = require('fs')
const http = require('http')
const https = require('https')
const crypto = require('crypto')
const express = require('express')
const bodyParser = require('body-parser')
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

/**
 * 访问根目录下的静态文件
 */
app.get('/file/:path', function (req, res, next) {
  res.sendFile(req.params.path, { root: __dirname })
})

/**
 * 获取缓存中的accessToken
 * @returns {Promise}
 */
function getAccessToken() {
  if (fs.existsSync('./access-token.txt')) {  // 从文件系统中获取
    const accessToken = fs.readFileSync('./access-token.txt', { flag: 'r', encoding: 'utf8' })
    console.log('get cached accessToken: ', accessToken)
    return Promise.resolve(accessToken)
  } else {  // 从微信服务器中获取
    return new Promise((resolve, reject) => {
      https.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + APP_ID + '&secret=' + APP_SECRET, function (req, res) {
        let jsonStr = ''
        req.on('data', function (data) {
          jsonStr += data
        })
        req.on('end', function () {
          const accessToken = JSON.parse(jsonStr)['access_token']
          console.log('refresh access token: ', accessToken)
          fs.writeFileSync('./access-token.txt', accessToken, { flag: 'w', encoding: 'utf8' })
          resolve(accessToken)
        })
      })
    })
  }
}

/**
 * 获取缓存中的ticket
 * @param {boolean} accessToken
 * @returns {Promise}
 */
function getTicket(accessToken) {
  if (fs.existsSync('./ticket.txt')) {  // 从文件系统中获取
    const ticket = fs.readFileSync('./ticket.txt', { flag: 'r', encoding: 'utf8' })
    console.log('get cached ticket: ', ticket)
    return Promise.resolve(ticket)
  } else {  // 从微信服务器中获取
    return new Promise((resolve, reject) => {
      https.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + accessToken + '&type=jsapi', function (req, res) {
        let jsonStr = ''
        req.on('data', function (data) {
          jsonStr += data
        })
        req.on('end', function () {
          const ticket = JSON.parse(jsonStr)['ticket']
          console.log('refresh ticket: ', ticket)
          fs.writeFileSync('./ticket.txt', ticket, { flag: 'w', encoding: 'utf8' })
          resolve(ticket)
        })
      })
    })
  }
}

/**
 * H5客户端 获取分享的信息
 */
app.all('/getWXConfig', function (req, res) {
  const url = req.query.url
  // 获取jsapi_ticket
  getAccessToken()
    .then(accessToken => getTicket(accessToken))
    .then(ticket => {
      // 生成签名
      const timestamp = new Date().getTime()  // 时间戳
      const nonceStr = 'niu_bi'  // 随机字符串

      const tempString = 'jsapi_ticket=' + ticket + '&noncestr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + url
      const shasum = crypto.createHash('sha1')
      shasum.update(tempString)
      const signature = shasum.digest('hex')
      console.log('signature: ', signature)
      res.json({
        appId: APP_ID,
        timestamp: timestamp,
        nonceStr: nonceStr,
        signature: signature
      })
    })
})

// 启动服务器
const server = app.listen(3000, function () {
  const host = server.address().address
  const port = server.address().port
  console.log('server listening at %s:%s', host, port)
})
```

# ③ 通过config接口注入权限验证配置

修改我们根目录下的test.html文件：

```html
<!-- 以上省略 -->
<script>
    // 微信配置

    $.ajax({
        type: 'get',
        url: '/getWXConfig',
        data: {
            url: window.location.href.split('#')[0]
        },
        success: function (config) {
            console.log(config)
            initWechat(config)
        },
        dataType: 'json'
    })

    function initWechat(config) {
        /*
           * 注意：
           * 1. 所有的JS接口只能在公众号绑定的域名下调用，公众号开发者需要先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。
           * 2. 如果发现在 Android 不能分享自定义内容，请到官网下载最新的包覆盖安装，Android 自定义分享接口需升级至 6.0.2.58 版本及以上。
           * 3. 常见问题及完整 JS-SDK 文档地址：http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
           *
           * 开发中遇到问题详见文档“附录5-常见错误及解决办法”解决，如仍未能解决可通过以下渠道反馈：
           * 邮箱地址：weixin-open@qq.com
           * 邮件主题：【微信JS-SDK反馈】具体问题
           * 邮件内容说明：用简明的语言描述问题所在，并交代清楚遇到该问题的场景，可附上截屏图片，微信团队会尽快处理你的反馈。
           */
        wx.config({
            debug: true,
            appId: config.appId,
            timestamp: config.timestamp,
            nonceStr: config.nonceStr,
            signature: config.signature,
            jsApiList: [
                'checkJsApi',
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ',
                'onMenuShareWeibo',
                'onMenuShareQZone'
            ]
        });
    }

</script>
<script src="http://203.195.235.76/jssdk/js/zepto.min.js"></script>
</html>
```

在微信web开发者中打开地址[http://26s4ag.natappfree.cc/file/test.html](http://26s4ag.natappfree.cc/file/test.html)（该域名上一个教程通过NATAPP获取的），如果弹出 { errMsg: config:ok }，说明微信配置成功了。

# ④ 注册分享状态回调事件

> 通过ready接口处理成功验证
>
> ```javascript
> wx.ready(function () {
>     /**
>      * config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，
>      * config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把
>      * 相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以
>      * 直接调用，不需要放在ready函数中。
>      */
> });
> ```
>
> 通过error接口处理失败验证
>
> ```javascript
> wx.error(function (res) {
>     /**
>      * config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误
>      * 信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对
>      * 于SPA可以在这里更新签名。
>      */
> });
> ```

> **接口调用说明**  
> 所有接口通过wx对象(也可使用jWeixin对象)来调用，参数是一个对象，除了每个接口本身需要传的参数之外，还有以下通用参数：  
> 1.success：接口调用成功时执行的回调函数。  
> 2.fail：接口调用失败时执行的回调函数。  
> 3.complete：接口调用完成时执行的回调函数，无论成功或失败都会执行。  
> 4.cancel：用户点击取消时的回调函数，仅部分有用户取消操作的api才会用到。  
> 5.trigger: 监听Menu中的按钮点击时触发的方法，该方法仅支持Menu中的相关接口。  
> （PS：不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回）  
> 以上几个函数都带有一个参数，类型为对象，其中除了每个接口本身返回的数据之外，还有一个通用属性errMsg，其值格式如下：  
> 调用成功时："xxx:ok" ，其中xxx为调用的接口名  
> 用户取消时："xxx:cancel"，其中xxx为调用的接口名  
> 调用失败时：其值为具体错误信息

我这里只演示一个接口的使用，继续修改咱们的test.html中的 _initWechat_ 函数：

```javascript
function initWechat(config) {
    /*
        * 注意：
        * 1. 所有的JS接口只能在公众号绑定的域名下调用，公众号开发者需要先登录微信公众平台进入“公众号设置”的“功能设置”里填写“JS接口安全域名”。
        * 2. 如果发现在 Android 不能分享自定义内容，请到官网下载最新的包覆盖安装，Android 自定义分享接口需升级至 6.0.2.58 版本及以上。
        * 3. 常见问题及完整 JS-SDK 文档地址：http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
        *
        * 开发中遇到问题详见文档“附录5-常见错误及解决办法”解决，如仍未能解决可通过以下渠道反馈：
        * 邮箱地址：weixin-open@qq.com
        * 邮件主题：【微信JS-SDK反馈】具体问题
        * 邮件内容说明：用简明的语言描述问题所在，并交代清楚遇到该问题的场景，可附上截屏图片，微信团队会尽快处理你的反馈。
        */
    wx.config({
        debug: true,
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: [
            'checkJsApi',
            'onMenuShareTimeline',
            'onMenuShareAppMessage',
            'onMenuShareQQ',
            'onMenuShareWeibo',
            'onMenuShareQZone'
        ]
    })

    wx.ready(function () {

        // 监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口
        document.querySelector('#onMenuShareAppMessage').onclick = function () {
            wx.onMenuShareAppMessage({
                title: '我生平最佩服四种人',  // 分享标题
                desc: '看黄片不快进的人，看黄片不打飞机的人，看完黄片还没打出来的人，打完了还能把黄片看完的人。 因为这代表了人类最珍贵的四种品质：踏实，正直，坚持，执着',  // 分享描述
                link: window.location.origin + '/file/hentai.html',  // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                imgUrl: window.location.origin + '/file/huaji.png',  // 分享图标
                type: 'link',  // 分享类型,music、video或link，不填默认为link
                dataUrl: '',  // 如果type是music或video，则要提供数据链接，默认为空
                trigger: function (res) {
                    // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
                    alert('用户点击发送给朋友')
                },
                success: function (res) {
                    // 用户确认分享后执行的回调函数
                    alert('已分享')
                },
                cancel: function (res) {
                    // 用户取消分享后执行的回调函数
                    alert('已取消')
                },
                fail: function (res) {
                    // 分享失败时执行的回调函数
                    alert(JSON.stringify(res))
                }
            })

            alert('已注册获取“发送给朋友”状态事件')
        }
    })

    wx.error(function (res) {
        alert(res.errMsg)
    })
}
```

⑤ 测试分享接口是否成功

首先点击右上角，选择“发送给朋友”，然后再点击页面上的“onMenuShareAppMessage”按钮，再次分享给朋友，如果两次的内容不同，那么恭喜你，微信自定义分享功能已经实现啦！

这里只介绍了“发送给朋友”的功能，其他同理，更多的接口请参阅[微信JS-SDK说明文档](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115)

下一篇来讲解一下微信如何进行页面授权以及获取用户的openId。

![](https://static.oschina.net/uploads/space/2017/0630/180033_T7KY_1389094.png)[完整代码戳这里](https://gitee.com/kaysama/codes/d2j1pqbmh9ysgal5fxk7359)

**目录指引：**

-   [微信开发实践（一）：使用JS-SDK实现自定义分享 Ⅰ](https://my.oschina.net/codingDog/blog/1516659)
-   [微信开发实践（二）：使用JS-SDK实现自定义分享 Ⅱ](https://my.oschina.net/codingDog/blog/1538112)
-   [微信开发实践（三）：获取用户信息](https://my.oschina.net/codingDog/blog/1554294)