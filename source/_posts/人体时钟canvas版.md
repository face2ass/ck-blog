---
title: 人体时钟canvas版
date: 2021-01-29 11:25:00
tags:
excerpt: 不知道老网民们还记不记得这个魔性的时钟插件：<br>作为网上冲浪十数载的网虫，不久前看到这个图瞬间破防，直接梦回10年前的QQ空间，感叹一下岁月蹉跎、时光荏苒、青春不在、不胜唏嘘....
---

不知道老网民们还记不记得这个魔性的时钟插件：

![](/images/honehoneclock.gif)

作为网上冲浪十数载的网虫，不久前看到这个图瞬间破防，直接梦回10年前的QQ空间，感叹一下岁月蹉跎、时光荏苒、青春不在、不胜唏嘘....

(￣ε(#￣)☆╰╮(￣▽￣///)
<!-- more -->
十年后的今天，flash在各个浏览器都已经不再支持，现在的我也已经不再是那个只会引入别人的脚本来打扮QQ空间的小白，自然得用青春换来的技术还原一下自己的青春记忆。

首先感谢原作者提供的如此优秀好玩的插件：[http://chabudai.org/blog/?p=59](http://chabudai.org/blog/?p=59)

这次为了图方便，就直接拿pixi.js来上手做动画了，动画素材来源于油管视频，拿到PS逐帧抠图并导出，这个过程就不再详细介绍了。合成后的精灵图以及对应的json文件我会放在文章末尾。

核心的API是[PIXI.AnimatedSprite](https://pixijs.download/dev/docs/PIXI.AnimatedSprite.html)。

代码也是很短，就直接放到下面了

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>HoneHoneClock</title>
  <style>
    * {
      padding: 0;
      margin: 0;
    }
    html, body {
      width: 100%;
      height: 100%;
    }
    body {
      background-color: lightcyan;
    }
    canvas {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }
  </style>
</head>
<body>
<canvas class="canvas"></canvas>
<script src="pixi_5.3.4.min.js"></script>
<script src="Stats.min.js"></script>
<script>

  (async function () {
    const stats = new Stats()
    document.body.appendChild(stats.domElement)

    let pageWidth = 0
    let pageHeight = 0

    let clockHour1, clockHour2
    let clockMin1, clockMin2
    let clockSec1, clockSec2
    const $canvas = document.querySelector('canvas')
    const renderer = new PIXI.Renderer({
      view: $canvas,
      width: pageWidth,
      height: pageHeight,
      transparent: true,
      autoDensity: true,
      antialias: true
    })

    // 人体时钟
    class Clock extends PIXI.Container {
      constructor (name) {
        super()
        const textures = loader.resources[honeHoneClockJson].textures
        let frames = []
        let aniData = []
        if (this.frames) {
          frames = this.frames
          aniData = this.aniData
        }
        else {
          aniData = [
            {
              prefix: '0',
              count: 6,
              frameFrom: -1,
              frameTo: -1,
            },
            {
              prefix: '1',
              count: 9,
              frameFrom: -1,
              frameTo: -1,
            },
            {
              prefix: '2',
              count: 7,
              frameFrom: -1,
              frameTo: -1,
            },
            {
              prefix: '3',
              count: 6,
              frameFrom: -1,
              frameTo: -1,
            },
            {
              prefix: '4',
              count: 9,
              frameFrom: -1,
              frameTo: -1,
            },
            {
              prefix: '5',
              count: 14,
              frameFrom: -1,
              frameTo: -1,
            },
            {
              prefix: '6',
              count: 7,
              frameFrom: -1,
              frameTo: -1,
            },
            {
              prefix: '7',
              count: 10,
              frameFrom: -1,
              frameTo: -1,
            },
            {
              prefix: '8',
              count: 7,
              frameFrom: -1,
              frameTo: -1,
            },
            {
              prefix: '9',
              count: 9,
              frameFrom: -1,
              frameTo: -1,
            },
          ]
          let k = 0
          for (let i = 0; i < aniData.length; i++) {
            const data = aniData[i]
            data.frameFrom = k
            for (let j = 1; j <= data.count; j++) {
              k++
              frames.push(textures[`${data.prefix}(${j}).png`])
            }
            data.frameTo = k - 1
          }
          this.frames = frames
          this.aniData = aniData
        }
        const ani = new PIXI.AnimatedSprite(frames)
        ani.anchor.set(0.5, 1)
        ani.animationSpeed = 0.4

        this.stopAt = -1
        ani.onFrameChange = () => {
          if (ani.currentFrame === this.stopAt) {
            ani.stop()
          }
        }
        this.addChild(ani)
        this.name = name
        this.ani = ani
        this.num = -1
      }

      set number (number) {
        if (this.num !== number) {
          this.num = number
          this.stopAt = this.aniData[number].frameTo
          this.ani.gotoAndPlay(this.aniData[number].frameFrom)
        }
      }
    }

    const stage = new PIXI.Container()
    stage.name = 'stage'
    let clockWrap

    const ticker = new PIXI.Ticker()
    let now = new Date()
    let lastTime = now.getTime()
    const loop = function () {
      stats.begin()
      now = new Date()
      if (now.getTime() - lastTime >= 1000) {
        let hours = now.getHours()
        if (hours > 9) {
          clockHour1.number = Math.floor(hours / 10)
          clockHour2.number = hours % 10
        }
        else {
          clockHour1.number = 0
          clockHour2.number = hours
        }

        let minutes = now.getMinutes()
        if (minutes > 9) {
          clockMin1.number = Math.floor(minutes / 10)
          clockMin2.number = minutes % 10
        }
        else {
          clockMin1.number = 0
          clockMin2.number = minutes
        }

        let seconds = now.getSeconds()
        if (seconds > 9) {
          clockSec1.number = Math.floor(seconds / 10)
          clockSec2.number = seconds % 10
        }
        else {
          clockSec1.number = 0
          clockSec2.number = seconds
        }
        lastTime = now.getTime()
      }
      renderer.render(stage)
      stats.end()
    }

    ticker.add(loop)

    const honeHoneClockJson = 'HoneHoneClock.json'
    const loader = new PIXI.Loader()
    loader.add([honeHoneClockJson])
    loader.onComplete.add(async (res) => {
      clockWrap = new PIXI.Container()
      clockWrap.position.set((pageWidth - 630) * 0.5, (pageHeight + 150) * 0.5)

      clockHour1 = new Clock('hour')
      clockHour2 = new Clock('hour')
      clockMin1 = new Clock('min')
      clockMin2 = new Clock('min')
      clockSec1 = new Clock('sec')
      clockSec2 = new Clock('sec')
      clockHour1.position.set(0, 0)
      clockHour2.position.set(100, 0)
      clockMin1.position.set(250, 0)
      clockMin2.position.set(350, 0)
      clockSec1.position.set(500, 0)
      clockSec2.position.set(600, 0)
      clockWrap.addChild(clockHour1)
      clockWrap.addChild(clockHour2)
      clockWrap.addChild(clockMin1)
      clockWrap.addChild(clockMin2)
      clockWrap.addChild(clockSec1)
      clockWrap.addChild(clockSec2)
      stage.addChild(clockWrap)

      // 开始动画循环
      ticker.start()
    })
    loader.load()

    const onResize = (e) => {
      pageWidth = document.body.clientWidth
      pageHeight = document.body.clientHeight
      if (clockWrap) {
        clockWrap.position.set((pageWidth - 630) * 0.5, (pageHeight + 150) * 0.5)
      }
      renderer.resize(pageWidth, pageHeight)
    }

    onResize()

    window.onresize = onResize
  })()
</script>
</body>
</html>

```

![](/images/hand.webp)[完整代码戳这里](https://gitee.com/kaysama/blog-source-host/tree/master/%E4%BA%BA%E4%BD%93%E6%97%B6%E9%92%9F)

![](/images/hand.webp)[在线演示1](https://kaysama.gitee.io/blog-source-host/%E4%BA%BA%E4%BD%93%E6%97%B6%E9%92%9F)、[在线演示2](https://codepen.io/oj8kay/pen/JjbPvza)