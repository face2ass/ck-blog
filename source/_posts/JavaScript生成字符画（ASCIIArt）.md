---
title: JavaScript生成字符画（ASCIIArt）
date: 2018-07-13 08:23:00
tags:
---

今天玩一些新的东西，大家都没有看过这样的视频：

[bad apple 字符版](https://www.bilibili.com/video/av27875377) 

或者 这样的图片：

![](/images/ascii_art_1.jpg)

网上有很多生成这种图片/视频的工具，但是每个程序员都有一颗造轮子的心，我们当然要玩出自己的花样啦。老规矩，还是先讲原理，建议先用自己的方式实现一遍。原理很简单首先准备一组排好序的不同 “_着色密度_ ” 的**ascii字符**（事实上你可以用任何字符），比如 **#KDGLftji+;,:.** ，接着将源图转为灰度图，然后遍历图中的像素，根据r/g/b通道的值来匹配字符串中相应 “_着色密度_ ” 的字符，值越小则颜色越深，字符的“密度”也应越大。如果需要保留颜色，只需将灰度图和原图的像素位置一一对应即可。在开始实现功能之前，我们需要先了解一下颜色矩阵（ColorMatrix）。在计算机中，每个像素的颜色可以用一个向量（有的文章也叫矢量或分量）矩阵表示：\[R, G, B, A\]。颜色变换矩阵通常是用一个5x5的矩阵来表示，和空间中一个n维向量的平移变换需要用一个n+1维的矩阵来表示一样，颜色矩阵也需要引入一个齐次坐标来进行“平移操作”。以下是一些常见的颜色变换矩阵：
<!-- more -->
亮度矩阵

|   | R | G | B | A | W |
| --- | --- | --- | --- | --- | --- |
| R | 1 | 0 | 0 | 0 | b |
| G | 0 | 1 | 0 | 0 | b |
| B | 0 | 0 | 1 | 0 | b |
| A | 0 | 0 | 0 | 1 | 0 |
| W | 0 | 0 | 0 | 0 | 1 |

反色矩阵

|   | R | G | B | A | W |
| --- | --- | --- | --- | --- | --- |
| R | -1 | 0 | 0 | 255 | 0 |
| G | 0 | -1 | 0 | 255 | 0 |
| B | 0 | 0 | -1 | 255 | 0 |
| A | 0 | 0 | 0 | 1 | 0 |
| W | 0 | 0 | 0 | 0 | 1 |

灰度矩阵

|   | R | G | B | A | W |
| --- | --- | --- | --- | --- | --- |
| R | 0.3086 | 0.6094 | 0.0820 | 0 | 0 |
| G | 0.3086 | 0.6094 | 0.0820 | 0 | 0 |
| B | 0.3086 | 0.6094 | 0.0820 | 0 | 0 |
| A | 0 | 0 | 0 | 1 | 0 |
| W | 0 | 0 | 0 | 0 | 1 |

ps：将像素去色的原理是使R＝G＝B，同时为了保持亮度不变，须使R+G+B尽量等于1 ，理论上来说要平分R、G、B通道值，应该是(R+B+G)/3，即系数应该约为0.3333才对，之所以比例不同，按照网上的解释，

> 这个比例主要是根据人眼中三种不同的感光细胞的感光强度比例分配的

还有一组比较常用的比例是0.2125，0.7154，0.0721，至于怎么来的还希望哪位大佬指点迷津。

下面是页面的html结构

```html
<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>ascii art</title>
    <style>

        * {
            margin: 0;
            padding: 0;
        }

        canvas, img, #container {
            display: block;
            margin: auto;
        }

        #container {
            line-height: 12px;
            font-size: 12px;
            font-family: 'SimHei', monospace;
            letter-spacing: 6px;
        }

    </style>
</head>
<body>
<img src="./trump.png"/>
<div id="container"></div>
<script>
  (function () {
    // 这里是js代码
  })()
</script>
</body>
</html>

```

解释一下几个关键点，首先我们输出的文字必须是等宽字体，我这里使用的是黑体：font-family: 'SimHei', monospace; 别忘了加上fallback：monospace。等宽字体是指每个字宽高都固定的字体，这里的固定宽高是指同一种文字，比如中文的黑体宽度是英文的两倍，其他字体我没有试过，大家可以自己去实验。这也是我设置了 letter-spacing: 6px; 的原因：当黑体设置了font-size=line-height时，中文是宽高相等，英文宽是高的一半。

接下来是js代码：

```javascript
var container = document.getElementById('container')
var offScreenCvs = document.createElement('canvas') // 创建离屏canvas
var offScreenCtx = offScreenCvs.getContext('2d', { alpha: false }) // 关闭透明度
var offScreenCvsWidth, offScreenCvsHeight
var samplerStep = 4 // 采样间隔

var img = new Image()
var onImgLoaded = function () {
  offScreenCvsWidth = img.width
  offScreenCvsHeight = img.height
  offScreenCvs.width = offScreenCvsWidth
  offScreenCvs.height = offScreenCvsHeight
  offScreenCtx.drawImage(img, 0, 0, offScreenCvsWidth, offScreenCvsHeight)
  imageData = offScreenCtx.getImageData(0, 0, offScreenCvsWidth, offScreenCvsHeight)
  // 采样点数 = 图片宽度 / 采样间隔；容器边长 = 采样点数 × 字体大小
  container.style.width = (offScreenCvsWidth / samplerStep * 12) + 'px'
  container.style.height = (offScreenCvsHeight / samplerStep * 12) + 'px'
  render()
}
img.src = './trump.png'
img.complete ? onImgLoaded() : (img.onload = onImgLoaded) // 确保onImgLoaded被执行

var imageData
var x, y, pos
var asciiCharArray = '#KDGLftji+;,:.'.split('') // 准备不同密度的字符数组（降序）
var durationPerChar = Math.ceil(255 / asciiCharArray.length) // 每个字符代表的密度阈值

function render () {
  var imageDataContent = imageData.data
  var strArray = []
  var part1, part2
  var letter
  var value
  for (y = 0; y < offScreenCvsHeight; y += samplerStep) {
    strArray.push('<p>') // 使用P标签换行
    for (x = 0; x < offScreenCvsWidth; x += samplerStep) {
      pos = y * offScreenCvsWidth + x
      // 获取RBG加权平均后的灰度值
      value = imageDataContent[pos * 4] * 0.3086 + imageDataContent[pos * 4 + 1] * 0.6094 + imageDataContent[pos * 4 + 2] * 0.0820
      imageDataContent[pos * 4] = imageDataContent[pos * 4 + 1] = imageDataContent[pos * 4 + 2] = value
      // 判断灰度值落在那个密度范围中，拿到对应的字符
      part1 = Math.floor(value / durationPerChar)
      part2 = value % durationPerChar
      letter = part2 ? asciiCharArray[part1] : (part1 ? asciiCharArray[part1 - 1] : 'æ')

      strArray.push(letter)
    }
    strArray.push('</p>')
  }
  container.innerHTML = strArray.join('')
}
```

先解释一下这行：img.complete ? onImgLoaded() : (img.onload = onImgLoaded)

通常来说img.onload = 必须要放在 img.src = 之前，来保证onload回调一定会执行，否则的话如果图片在执行这段代码之前已经被浏览器缓存了，则有可能不会触发onload回调。但是有时候由于业务的需要，有些操作必须要在图片载入完成后执行，可是不一定立即执行，碰到这种情况，就可以用到Image对象的complete属性，该属性会返回当前图片是否加载完成的bollean值。于是，通过上面这行代码，就可以确保onImgLoaded函数在图片载入完成后一定会被触发。（本案例该写法不必须，但是建议养成这个习惯）

上面实际上已经完成了核心的功能，接下来对我们的代码做一些优化——

如果我们需要提供改变字体大小的功能怎么办？可以先直接把字体大小相关的字面值抽出为一个变量，如fontSize ：

```javascript
...
...
var fontSize = 18 // 字体大小
...
...
var onImgLoaded = function () {
  ...
  ...
  container.style.width = (offScreenCvsWidth / samplerStep * fontSize) + 'px'
  container.style.height = (offScreenCvsHeight / samplerStep * fontSize) + 'px'
  container.style.fontSize = fontSize + 'px'
  container.style.lineHeight = fontSize + 'px'
  container.style.letterSpacing = (fontSize / 2) + 'px' // SimHei体英文宽是高的一半
  render()
}
```

但是PC浏览器不允许字体小于12px怎么办呢？我们可以用css的scale来缩放容器就行了，修改代码如下：

```javascript
...
var onImgLoaded = function () {
  ...
  ...
  imageData = offScreenCtx.getImageData(0, 0, offScreenCvsWidth, offScreenCvsHeight)
  if (fontSize < 12) {
    // 小于12px则将字体改为12px并通过 transform scale 进行缩放
    container.style.transform = 'scale(' + (fontSize / 12) + ')'
    container.style.transformOrigin = '50% 0'
    fontSize = 12
  }
  container.style.width = (offScreenCvsWidth * fontSize / samplerStep) + 'px'
  ...
  ...
}
...
```

好了，现在我们生成的是灰色的图，但是如何生成彩色的图呢，估计大家第一反应就是给每个字外面包一层标签（比如span、font），但是笔者试了之后发现一旦图片尺寸稍微大一些，性能下降非常夸张，一度把我的浏览器给弄崩溃了(╥╯^╰╥)，小伙伴们可以自行尝试。于是我打算用canvas来做渲染而不是使用开销极大的dom，上面的代码大部分可以重用，我修改了一下后的html结构：

```html
<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>ascii art</title>
    <style>

        * {
            margin: 0;
            padding: 0;
        }

        canvas, img {
            display: block;
            margin: auto;
        }

    </style>
</head>
<body>
<img src="./trump.png"/>
<canvas id="ascii-canvas"></canvas>
<script>
  (function () {
    // canvas 实现
  })()
</script>
</body>
</html>

```

这是js代码：

```javascript
var offScreenCvs = document.createElement('canvas')
var offScreenCtx = offScreenCvs.getContext('2d', { alpha: false })
var asciiCvs = document.getElementById('ascii-canvas')
var asciiCtx = asciiCvs.getContext('2d', { alpha: false })
var offScreenCvsWidth, offScreenCvsHeight, asciiCvsWidth, asciiCvsHeight
var fontSize = 8
var samplerStep = 4

var img = new Image()
var onImgLoaded = function () {
  offScreenCvsWidth = img.width
  offScreenCvsHeight = img.height
  offScreenCvs.width = offScreenCvsWidth
  offScreenCvs.height = offScreenCvsHeight
  offScreenCtx.drawImage(img, 0, 0, offScreenCvsWidth, offScreenCvsHeight)
  imageData = offScreenCtx.getImageData(0, 0, offScreenCvsWidth, offScreenCvsHeight)
  asciiCvsWidth = offScreenCvsWidth / samplerStep * fontSize
  asciiCvsHeight = (offScreenCvsHeight / samplerStep + 1) * fontSize
  asciiCvs.width = asciiCvsWidth
  asciiCvs.height = asciiCvsHeight
  render()
}
img.src = './trump.png'
img.complete ? onImgLoaded() : (img.onload = onImgLoaded)

var imageData
var x, y, _x, _y, pos
var asciiCharArray = '#KDGLftji+;,:.'.split('')
var durationPerChar = Math.ceil(255 / asciiCharArray.length)

function render () {
  var imageDataContent = imageData.data
  var part1, part2
  var letter
  var value
  asciiCtx.fillStyle = '#ffffff'
  asciiCtx.fillRect(0, 0, asciiCvsWidth, asciiCvsHeight)
  asciiCtx.fillStyle = '#000000'
  asciiCtx.font = fontSize + 'px SimHei'
  for (y = 0, _y = 0; y < offScreenCvsHeight; y += samplerStep, _y++) {
    for (x = 0, _x = 0; x < offScreenCvsWidth; x += samplerStep, _x++) {
      pos = y * offScreenCvsWidth + x
      value = imageDataContent[pos * 4] * 0.3086 + imageDataContent[pos * 4 + 1] * 0.6094 + imageDataContent[pos * 4 + 2] * 0.0820
      imageDataContent[pos * 4] = imageDataContent[pos * 4 + 1] = imageDataContent[pos * 4 + 2] = value

      part1 = Math.floor(value / durationPerChar)
      part2 = value % durationPerChar
      letter = part2 ? asciiCharArray[part1] : (part1 ? asciiCharArray[part1 - 1] : 'æ')

      asciiCtx.fillText(letter, _x * fontSize, (_y + 1) * fontSize)
    }
  }
}
```

完美，接下来给文字上色：

```javascript
...
...
var x, y, _x, _y, pos
var r, g, b
var asciiCharArray = '#KDGLftji+;,:.'.split('')
...
...
function render () {
  ...
  ...
  for (y = 0, _y = 0; y < offScreenCvsHeight; y += samplerStep, _y++) {
    for (x = 0, _x = 0; x < offScreenCvsWidth; x += samplerStep, _x++) {
      pos = y * offScreenCvsWidth + x
      r = imageDataContent[pos * 4]
      g = imageDataContent[pos * 4 + 1]
      b = imageDataContent[pos * 4 + 2]
      value = r * 0.3086 + g * 0.6094 + b * 0.0820
      imageDataContent[pos * 4] = imageDataContent[pos * 4 + 1] = imageDataContent[pos * 4 + 2] = value

      part1 = Math.floor(value / durationPerChar)
      part2 = value % durationPerChar
      letter = part2 ? asciiCharArray[part1] : (part1 ? asciiCharArray[part1 - 1] : 'æ')

      asciiCtx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'
      asciiCtx.fillText(letter, _x * fontSize, (_y + 1) * fontSize)
    }
  }
}
...
...
```

搞腚！

核心的完成了下面就简单了，只要把资源换成视频，然后逐帧截取画面即可：

html结构如下：

```html
...
...
<body>
<video id="video">
    <source src="./mov_bbb.mp4" type="video/mp4">
    <source src="./mov_bbb.ogg" type="video/ogg">
    您的浏览器不支持 HTML5 video 标签。
</video>
<canvas id="ascii-canvas"></canvas>
<script>
...
...
```

js代码如下：

```javascript
var video = document.getElementById('video')
var offScreenCvs = document.createElement('canvas')
var offScreenCtx = offScreenCvs.getContext('2d', { alpha: false })
var asciiCvs = document.getElementById('ascii-canvas')
var asciiCtx = asciiCvs.getContext('2d', { alpha: false })
var offScreenCvsWidth, offScreenCvsHeight, asciiCvsWidth, asciiCvsHeight
var fontSize = 8
var samplerStep = 4

var maxWidth = 400, maxHeight = 400

video.onloadeddata = function () {
  offScreenCvsWidth = video.videoWidth
  offScreenCvsHeight = video.videoHeight
  var ratio = offScreenCvsWidth / offScreenCvsHeight
  if (video.videoWidth > maxWidth) {
    offScreenCvsWidth = maxWidth
    offScreenCvsHeight = Math.floor(offScreenCvsWidth / ratio)
  }
  if (video.videoHeight > maxHeight) {
    offScreenCvsHeight = maxHeight
    offScreenCvsWidth = Math.floor(offScreenCvsHeight * ratio)
  }
  offScreenCvs.width = offScreenCvsWidth
  offScreenCvs.height = offScreenCvsHeight
  asciiCvsWidth = (offScreenCvsWidth / samplerStep + 1) * fontSize
  asciiCvsHeight = (offScreenCvsHeight / samplerStep + 1) * fontSize
  asciiCvs.width = asciiCvsWidth
  asciiCvs.height = asciiCvsHeight

  offScreenCtx.drawImage(video, 0, 0, offScreenCvsWidth, offScreenCvsHeight)
  imageData = offScreenCtx.getImageData(0, 0, offScreenCvsWidth, offScreenCvsHeight)
  render()

  video.onclick = function () {
    video.paused ? video.play() : video.pause()
  }

  video.onplay = function () {
    stop = false
    rendering = false
    requestAnimationFrame(tick)
  }

  video.onpause = function () {
    stop = true
  }
}

var imageData
var x, y, _x, _y, pos
var r, g, b
var asciiCharArray = '#KDGLftji+;,:.'.split('')
var durationPerChar = Math.ceil(255 / asciiCharArray.length)

function render () {
  var imageDataContent = imageData.data
  var part1, part2
  var letter
  var value
  asciiCtx.fillStyle = '#ffffff'
  asciiCtx.fillRect(0, 0, asciiCvsWidth, asciiCvsHeight)
  asciiCtx.fillStyle = '#000000'
  asciiCtx.font = fontSize + 'px SimHei'
  for (y = 0, _y = 0; y < offScreenCvsHeight; y += samplerStep, _y++) {
    for (x = 0, _x = 0; x < offScreenCvsWidth; x += samplerStep, _x++) {
      pos = y * offScreenCvsWidth + x
      r = imageDataContent[pos * 4]
      g = imageDataContent[pos * 4 + 1]
      b = imageDataContent[pos * 4 + 2]
      value = r * 0.3086 + g * 0.6094 + b * 0.0820
      imageDataContent[pos * 4] = imageDataContent[pos * 4 + 1] = imageDataContent[pos * 4 + 2] = value

      part1 = Math.floor(value / durationPerChar)
      part2 = value % durationPerChar
      letter = part2 ? asciiCharArray[part1] : (part1 ? asciiCharArray[part1 - 1] : 'æ')

      asciiCtx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'
      asciiCtx.fillText(letter, _x * fontSize, (_y + 1) * fontSize)
    }
  }
}

var stop = false // 是否停止
var timeNow = Date.now() // 当前时间戳
var timeLast = timeNow // 上一帧时间戳
var delta = 0 // 与上一帧间隔
var interval // 
var fps = 60 // 帧率

interval = 1000 / fps // 每帧耗时

var rendering = false
var tick = function () {
  if (stop) return false
  timeNow = Date.now()
  delta = timeNow - timeLast
  if (delta > interval) {
    timeLast = timeNow

    if (!rendering) {
      rendering = true
      offScreenCtx.drawImage(video, 0, 0, offScreenCvsWidth, offScreenCvsHeight)
      imageData = offScreenCtx.getImageData(0, 0, offScreenCvsWidth, offScreenCvsHeight)
      render()
      rendering = false
    }
  }
  requestAnimationFrame(tick)
}
```

除了tick，别的基本没变化，解释一下这个，事实上，只要渲染视频并不用这么一长段，下面这样即可：

```javascript
var tick = function () {
  if (!rendering) {
    rendering = true
    offScreenCtx.drawImage(video, 0, 0, offScreenCvsWidth, offScreenCvsHeight)
    imageData = offScreenCtx.getImageData(0, 0, offScreenCvsWidth, offScreenCvsHeight)
    render()
    rendering = false
  }
  requestAnimationFrame(tick)
}
```

多余的这些代码其实可以称为是一段 _动画或游戏渲染的范式 _。因为的requestAnimationFrame渲染频率是根据浏览器的刷新率来的，而电脑实时的性能会影响屏幕的刷新率，但是通常我们的动画都是固定的帧率，为了保持最终渲染出来的帧率尽可能的符合设计，所以一般会根据设计的帧率来计算出每一帧的耗时，然后根据每一帧的实际耗时来算出理想状态下的变化量，以下就是比较常规的设计范式：

```javascript
var stop = false // 是否停止渲染
var timeNow = Date.now() // 当前时间戳
var timeLast = timeNow // 上一帧时间戳
var delta = 0 // 与上一帧间隔
var fps = 60 // 帧率
var interval = 1000 / fps // 每帧耗时

var rendering = false // 是否渲染某组件
var tick = function () {
  if (stop) return false
  timeNow = Date.now()
  delta = timeNow - timeLast
  if (delta > interval) {
    timeLast = timeNow

    if (!rendering) {
      // loop 代码
    }

  }
  requestAnimationFrame(tick)
}
```

教程结束~~~~じゃない

那gif怎么搞呢？

![](/images/ascii_art_2.jpg)

emmmm，[gif-frames](https://github.com/benwiley4000/gif-frames) 可以把gif导出多张序列帧，后面的原理基本就和视频差不太多了，就给大家当课后作业吧 23333

![](/images/hand.webp)[完整代码戳这里](https://gitee.com/kaysama/blog-source-host/tree/master/%E5%AD%97%E7%AC%A6%E7%94%BB)

![](/images/hand.webp)Demo1：[Bad Apple!!（dom版）](http://kaysama.gitee.io/blog-source-host/%E5%AD%97%E7%AC%A6%E7%94%BB/ascii_art_dom_animate.html)

![](/images/hand.webp)Demo2：[Big Buck Bunny（canvas版-彩色）](http://kaysama.gitee.io/blog-source-host/%E5%AD%97%E7%AC%A6%E7%94%BB/ascii_art_canvas.html)

![](/images/hand.webp)Demo3：[t](http://kaysama.gitee.io/blog-source-host/%E5%AD%97%E7%AC%A6%E7%94%BB/ascii_art_canvas.html)[rump（dom版）](http://kaysama.gitee.io/blog-source-host/%E5%AD%97%E7%AC%A6%E7%94%BB/ascii_art_dom.html)

![](/images/hand.webp)Demo4：See the Pen [ascii\_art\_pure](https://codepen.io/oj8kay/pen/bOMLOW) by Kay ([@oj8kay](https://codepen.io/oj8kay)) on [CodePen](https://codepen.io).