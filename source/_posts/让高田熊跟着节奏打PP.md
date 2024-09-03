---
title: 让高田熊跟着节奏打PP
date: 2023-04-10 15:15:00
categories:
   - [技术, 前端]
tags:
   - PixiJS
   - Web Audio
   - Css
---

> 这篇博客的灵感源头是B站的这个魔性视频：[「 高田熊 」 跟 着 节 奏，一 起 摇 摆 ~ | takadabear](https://www.bilibili.com/video/BV1uL411g7Yg)，突然想写个高田熊打PP的音乐可视化页面

这个页面使用的软件、框架、技术主要有：录屏工具、Photoshop、[TexturePacker](https://www.codeandweb.com/texturepacker)、[PixiJS](https://pixijs.com/)、[Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
<!-- more -->
页面效果如下，说说我的实现方式：

![](/images/ketakuma.gif)

1. 下面的几个步骤主要目的是为了获得动画的序列帧，与前端技术无关，有其他办法的朋友可略过。
   - 打开视频网站，使用手头的录屏工具把几个关键动作录制下来，我用的工具是BandiCam，导出mp4；
   - 打开Photoshop，点击 文件->导入->视频帧到图层，勾选 窗口->时间轴，然后在下方的时间轴面板 移除重复关键帧，同时删除关联图层（可以让导出速度快一些），修改播放速度，移除水印；
   - 处理完以后，点击 文件->导出->将图层导出到文件；
2. 等获取序列帧后，把图片按照动作序列重新命名，便于代码导入与动作识别。打开TexturePacker，将图片序列帧导入，预览动画，没问题后发布精灵表，数据格式选择PixiJS，成功后会生成一张图集和一个json文件。然后将生成的图集重新导入ps进行抠图，没有在上面的步骤处理是因为处理图集更方便。（ps：因为原视频的分辨率不高，我在抠图前找了个网站，用AI提高了原图的分辨率）
3. 接下来在代码里使用PixiJS将json和图片引入并绘制，核心代码如下：

   ```javascript
   let curAction = 0 // 当前动作
   let nextAction = curAction // 将要执行的动作（用于确保在当前动作播放完后执行）
   // 动作列表
   const actionList = [
     {
       prefix: 'idle',
       name: '抚摸',
       count: 8,
       frameFrom: -1,
       frameTo: -1,
     },
     {
       prefix: 'spank',
       name: '拍屁屁',
       count: 8,
       frameFrom: -1,
       frameTo: -1,
     },
     {
       prefix: 'spank_hard',
       name: '大力拍屁屁',
       count: 9,
       frameFrom: -1,
       frameTo: -1,
     },
   ]
   const honeHoneClockJson = 'ketakuma.json'
   const loader = new PIXI.Loader()
   loader.add([honeHoneClockJson])
   loader.onComplete.add(async (res) => {
     const textures = loader.resources[honeHoneClockJson].textures
     let frames = []
     let k = 0
     // 更新每个动作的起止帧
     for (const action of actionList) {
       const { prefix, count } = action
       action.frameFrom = k
       action.frameTo = k + count - 1
       k = k + count
       for (let i = 1; i <= count; i++) {
         frames.push(textures[`${prefix}(${i})`])
       }
     }
     ani = new PIXI.AnimatedSprite(frames)
     ani.anchor.set(0.5, 1)
     ani.position.set(pageWidth * 0.5, pageHeight * 0.5)
     ani.animationSpeed = 0.25
   
     // 循环播放
     ani.onFrameChange = () => {
       if (ani.currentFrame === actionList[curAction].frameTo) {
         if (nextAction !== curAction) {
           curAction = nextAction
           $input.value = curAction
           $label.innerHTML = actionList[nextAction].name
         }
         ani.gotoAndPlay(actionList[curAction].frameFrom)
       }
     }
     stage.addChild(ani)
   
     // 开始动画循环
     ticker.start()
     // 播放动画
     ani.gotoAndPlay(actionList[curAction].frameFrom)
   })
   loader.load()
   ```

4. 使用分析器对音频进行解析并生成频谱
   ```javascript
   const audioCtx = new AudioContext() // 创建音频上下文
   const analyser = audioCtx.createAnalyser() // 创建分析器（AnalyserNode）节点
   const source = audioCtx.createMediaElementSource($audio) // 创建音频源节点
   analyser.fftSize = 512 // 一个无符号长整形 (unsigned long) 的值，代表了快速傅里叶变换(分析器)的窗口大小
   // 创建数组，用于接受节点分析器分析的数据
   const frequencyData = new Uint8Array(analyser.frequencyBinCount) // 这里并不是声明一个普通数组，而是需要声明一个无符号的八位整数，刚好是一个字节。并且数组长度需要刚好等于频谱图横坐标长度
   // 连接输入输出
   source.connect(analyser) // 音频输入分析器
   analyser.connect(audioCtx.destination) // 将音频输出回audio（即设备的默认输出）
   
   // 频谱dom初始化
   const bufferLength = analyser.frequencyBinCount
   const numberOfBars = Math.round(bufferLength / 2.5)
   $spectrum.innerHTML = [...new Array(numberOfBars)].map(v => `<div class="bar"></div>`).join('')
   const bars = document.querySelectorAll('.bar')
   const styleSheet = document.styleSheets[0]
   styleSheet.insertRule(`.spectrum > .bar { width: ${pageWidth / numberOfBars * 0.6}px }`, styleSheet.cssRules.length)
   
   // audio事件监听
   $audio.addEventListener('canplaythrough', e => {
     $audio.play().catch((error) => {
       if (error.name === 'NotAllowedError') {
         console.warn('自动播放失败')
       }
     })
   })
   $audio.addEventListener('play', e => {
     playing = true
     $input.disabled = true
     // 如果音频被挂起，则恢复播放状态
     if (audioCtx.state === 'suspended') {
       audioCtx.resume()
     }
   })
   $audio.addEventListener('pause', e => {
     playing = false
     $input.disabled = false
   })
   ```

这段这段代码，有几个重点需要单独拎出来分析下：

**第一个重点**是连接输入输出这段，你可以连接多个节点，如
```javascript
source = audioCtx.createMediaStreamSource(stream);
source.connect(analyser);
analyser.connect(distortion);
distortion.connect(biquadFilter);
biquadFilter.connect(convolver);
convolver.connect(gainNode);
gainNode.connect(audioCtx.destination);
```

将会创造一个如下音频节点图：

![](/images/ketakuma-2.png)

（给火狐打个广告：Firefox32 以上版本已有完整的 firefox 开发者工具包括[Web Audio Editor](https://firefox-source-docs.mozilla.org/devtools-user/web_audio_editor/index.html)—— 一个对测试 web audio 表的 bug 非常有用的东西）

**第二个重点**，AudioContext创建时会有一个内部状态（挂起-suspend、运行中-running、关闭-closed），大部分现代浏览器不允许网页自动播放非静音的音视频，所以如果你在用户动作之外创建AudioContext，它的内部状态会被设置为暂停 (suspend)， 如果想要播放，需要在用户动作时使用resume()方法来改为running。

但是如果你在用户动作时（如click）创建了AudioContext，它的内部状态则会被自动设置成running，比如下面这段代码：

```javascript
const audioCtx = new AudioContext() // 创建音频上下文
$audio.addEventListener('play', e => {
  // 如果音频被挂起，则恢复播放状态
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
})
```

如果去掉resume方法的调用，你会发现无论怎么点击播放按钮都会没声音（让我头疼了好久的大坑）

或者也可以这么写：

```javascript
let audioCtx
$audio.addEventListener('play', e => {
  audioCtx = new AudioContext() // 创建音频上下文
})
```

**第三个重点**与音频无关，不过也值得说一说。工作中我们经常会碰到给一批元素力量添加“动态样式属性”的需求，何为“动态样式属性”，就是属性值在运行期间才能计算出来，比如根据屏幕尺寸计算每个元素的宽度。一般来说有以下几种常用的方式：
①遍历元素直接设置行内样式；
②使用css变量；
③可枚举的情况下预设一些class，比如有一系列class名为size-10、size-20、size-30....，动态修改class即可；
④这里用的就是一种小众的写法，直接插入样式表规则（CSSStyleSheet: insertRule）

参考：[Using the Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API)