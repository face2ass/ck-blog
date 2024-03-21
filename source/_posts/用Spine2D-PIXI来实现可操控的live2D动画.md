---
title: 用Spine2D+PIXI来实现可操控的live2D动画
date: 2021-03-01 00:04:00
tags:
---

vTuber行业越来越火爆，看着那些形形色色的皮套，忍不住自己实现一遍的冲动，说起2D骨骼动画软件，Spine2D首当其冲。这次就用它来耍一耍。
![](https://oscimg.oschina.net/oscnet/up-0afb25259c882ad7a27e0d3b63c0d4f24b8.gif)
<!-- more -->
为啥我不用live2D？毕竟这是日本软件，英语的本地化翻译不知道靠不靠谱，与Spine价格也差不太多，看了一些教程，操作也比较复杂，感觉更倾向于给不熟悉编程的设计人员使用。
为啥不用免费的国产软件龙骨？开始确实是试用了一段时间，软件的基础功能应该满足我的需求，但是程序文档比较简陋，而且似乎已经停止维护，非常可惜。
无奈之下，忍痛花299刀买了Spine。（T_T）

![](https://oscimg.oschina.net/oscnet/up-2e47e56c5b7023ae263b4c0f9709a0491f4.JPEG)

虚拟主播用的动画不知道有没有专业一些的称呼，我暂时就叫“live2D动画”吧~live2D动画的核心是骨骼绑定与蒙皮动画，蒙皮动画的原理和我以前用canvas2D实现的图片变形效果类似：[Canvas2D实现对图片进行网格变换](https://my.oschina.net/codingDog/blog/4309436)。

首先去网上找了一个已经对角色分件完的PSD模型，为了demo制作方便我找了个比较简单、贴图较少的“人物”，然后用官方的ps插件[PhotoshopToSpine.jsx](https://github.com/EsotericSoftware/spine-scripts/tree/master/photoshop)导出图层，然后用Spine打开导出的工程即可。（psd原件我会放到文末的源码中）

接下里就是再spine里绑定骨骼，刷权重，key帧这些繁琐的工作了，三言两语也说不完，网上的教程还是挺多的，本文还是着重程序实现。我会把Spine工程也在源码中分享出来，如果大家有疑惑的地方我这个生手也许能解答一部分~

程序实现主要用到两个库，[pixi.js](https://github.com/pixijs/pixi.js)和[pixi-spine](https://github.com/pixijs/pixi-spine)，用的都是当前（2021-02-28）的最新版，因为我的spine版本是3.8，pixi-spine只有最新版才支持，所以pixi.js也必须是最新版（v5）![](https://oscimg.oschina.net/oscnet/up-1e0f56078b8368766821807c2749ec96b5d.gif)

虽然spine官方也提供了webgl版的运行时，但是自从上次用了pixi感觉还是相当好使的，pixi也提供了插件，果断就拿来用了。

本次功能主要是三个：①眼球根据鼠标移动位置；②点击角色张嘴；③根据音乐节奏跳动；

**功能①**的实现主要依赖spine动画的ik约束，具体实现见官方论坛的这篇博文：[眼睛距离限制设置](http://zh.esotericsoftware.com/blog/Distance-limit-setup-for-eyes)，我就拿来现学现卖了，然后程序上只要通过findBone方法找到约束的骨骼，然后移动位置即可。

关键代码：

```javascript
// ...
controlEye = skeleton.findBone('eye') // 获取眼球控制的骨骼
controlHead = skeleton.findBone('head') // head是eye的父级，eye在head的本地坐标系内移动
// ...
// 记录眼球相对位置
controlEyeX = controlEyeXTarget = controlEye.x
controlEyeY = controlEyeYTarget = controlEye.y
eyeBasePos.x = controlHead.worldX
eyeBasePos.y = controlHead.worldY
// ...
stage.on('pointermove', (e) => {
  pageX = e.data.global.x
  pageY = e.data.global.y
  // 修改眼球在本地坐标系中的位置
  controlEyeXTarget = pageX - (basePos.x + eyeBasePos.x)
  controlEyeYTarget = -(pageY - (basePos.y + eyeBasePos.y)) // y轴翻转
})
// ...
```

**功能②**则是先在spine中创建一段关键帧动画，然后通过setAnimation方法来进行播放，如果有多个动画可以通过设置BlendMode并控制每段动画轨道的alpha来进行混合，这一块我会以后写个新的demo专门介绍。

关键代码：

```javascript
// ...
// 加载spine数据
loader.add('monster', 'monster.json')
  .load(function (loader, resources) {
    spineMonster = new pixiSpine.Spine(resources.monster.spineData)
    // ...
    state = spineMonster.state
    // ...
})
// ...
// 点击场景播放“laugh”动画一次
stage.on('pointertap', () => {
  const entry = state.setAnimation(0, 'laugh', false)
})
// ...
```

**功能③**也是通过ik约束和修改关键骨骼的位置来实现，根据音乐节奏跳动的部分不是本文的重点，主要是对音乐的流数据进行采样归并，我也没做深入的研究，目前只是简单调用api的阶段，有兴趣详细了解的小伙伴可以看MDN的入门教程：[Using the Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API)。

关键代码：

```javascript
// ...
let analyser
let bufferLength = 0
let dataArray = []

let now = performance.now()
let last = now
const loop = function (delta) {
  stats.begin()

  if (gameRunning) {
    now = performance.now()
    if (now - last > 100) {
      last = now
    }
    if (dancing) {
      analyser.getByteFrequencyData(dataArray)
      let i
      let audioVal = 0
      for (i = 0; i < bufferLength; i++) {
        audioVal += dataArray[i]
      }
      audioVal /= bufferLength // 获取均值
      controlBodyYTarget = -bodyBasePos.y + audioVal
      controlBodyYTarget = controlBodyYTarget * 0.3
      controlBodyYTarget = Math.max(30, Math.min(240, controlBodyYTarget))
    }

    controlEyeX += (controlEyeXTarget - controlEyeX) * 0.1
    controlEyeY += (controlEyeYTarget - controlEyeY) * 0.1
    controlBodyX += (controlBodyXTarget - controlBodyX) * 0.1 // 左右移动身体
    controlBodyY += (controlBodyYTarget - controlBodyY) * 0.5 // 根据节奏上下移动身体

    controlEye.x = controlEyeX
    controlEye.y = controlEyeY
    controlBody.x = controlBodyX
    controlBody.y = controlBodyY
  }
  renderer.render(stage)

  stats.end()
}
ticker.add(loop)
// ...
const $btn = document.getElementById('play-btn')
const $file = document.getElementById('file')
let audio = null
let timer = -1
$file.onchange = function () {
  const file = $file.files[0]
  if (!file) return
  if (audio) audio.pause()
  audio = new Audio()
  audio.loop = true
  audio.addEventListener('canplay', event => {
    audio.play()
    let flag = false
    clearInterval(timer)
    // 每秒换一次水平方向
    timer = setInterval(function () {
      flag = !flag
      controlBodyXTarget = flag ? 50 : -50
    }, 1000)
    dancing = true
  })
  audio.src = URL.createObjectURL(file) // 使用本地音源

  // 创建分析器节点
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  analyser = audioCtx.createAnalyser()
  analyser.fftSize = 32 // 采样
  // 把分析器节点连接到声源
  const source = audioCtx.createMediaElementSource(audio)
  source.connect(analyser)
  // 分析器节点输出到另一个节点（不输出也可以正常使用。但前提是它必须与一个声源相连，直接或者通过其他节点间接相连都可以）
  analyser.connect(audioCtx.destination)
  bufferLength = analyser.frequencyBinCount // 值是FFT的一半
  dataArray = new Uint8Array(bufferLength)
}
```

最终效果如下：

![](https://oscimg.oschina.net/oscnet/up-ab7207ad0e874b68d6d8451bf287856f070.gif)

如果文章对你有帮助，还请点个赞  ٩( 'ω' )و 

![](https://static.oschina.net/uploads/space/2017/0630/180033_T7KY_1389094.png)[完整代码+工程资源+psd源文件](https://gitee.com/kaysama/blog-source-host/tree/master/%E7%94%A8Spine2D+PIXI%E6%9D%A5%E5%AE%9E%E7%8E%B0%E5%8F%AF%E6%93%8D%E6%8E%A7%E7%9A%84live2D%E5%8A%A8%E7%94%BB)

![](https://static.oschina.net/uploads/space/2017/0630/180033_T7KY_1389094.png)[在线演示1](http://kaysama.gitee.io/blog-source-host/%E7%94%A8Spine2D+PIXI%E6%9D%A5%E5%AE%9E%E7%8E%B0%E5%8F%AF%E6%93%8D%E6%8E%A7%E7%9A%84live2D%E5%8A%A8%E7%94%BB/)、[在线演示2](https://codepen.io/oj8kay/pen/rNWdYyE)