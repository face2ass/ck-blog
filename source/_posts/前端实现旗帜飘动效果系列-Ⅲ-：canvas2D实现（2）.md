---
title: 前端实现旗帜飘动效果系列(Ⅲ)：canvas2D实现（2）
date: 2018-07-03 04:41:00
categories:
  - [技术, 前端]
tags:
  - Canvas
---

本讲我们在上一讲的基础上，给旗子添加高光，使其看起来更加有立体感。我会用两种方式来分别实现这个效果，然后比较一下优劣，还是先讲原理。

**方法一**：在原来的代码drawImage之后通过 fillRect 函数来增加一个白色蒙层，通过透明度的递增和递减来模拟。具体多少透明度？当然你可以用数学的方法来求导计算出某一点的斜率，根据其大小和正负得出其透明度大小，斜率越大，透明度越小。这里用一种更取巧也效率更高的方法，即保存某一点前一个点的y轴坐标，与该点的y坐标相减，即可得到斜率的相对大小，因为两点之间的x轴上距离都是1px，所以y轴变化越大，|斜率|则越大。
<!-- more -->
**方法二**：先通过遍历 getImageData 函数返回的元素逐像素获取原始画布每个点的rgba值，然后每一帧通过运动函数对每个点的位置进行偏移，对比原画布，获取该点在原位置的rgba值，然后直接对a分量进行修改，修改的依据仍然是斜率。

两个方法的效果图如下

![](/images/canvas_flag_1.jpg)

这是方法一的代码，我只贴出修改的部分（// +++ 之间）：

```javascript
var y = 0
// +++++++++++++++++++++
var lastY = 0
// +++++++++++++++++++++
var distance = 0
var tick = function () {
  if (stop) return false
  timeNow = Date.now()
  delta = timeNow - timeLast
  if (delta > interval) {
    timeLast = timeNow
    distance += (delta / 1000 * v)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    for (var x = 0; x < imgWidth; x++) {
      y = cftA * x * Math.sin(cftX * (x - distance)) + amplitude
      ctx.drawImage(image, x, 0, 1, imgHeight, x, y, 1, imgHeight)
      // +++++++++++++++++++++
      ctx.fillStyle = 'rgba(255,255,255,' + (x === 0 ? 0 : (y - lastY) * 0.5) + ')'
      ctx.fillRect(x, y, 1, imgHeight)
      // +++++++++++++++++++++
      lastY = y
    }
  }
  requestAnimationFrame(tick)
}
```

![](/images/hand.webp)[完整代码戳这里](https://gitee.com/kaysama/codes/g8smhrdx73fknyu5wv61l63)

![](/images/hand.webp)Demo：See the Pen [flag waving by canvas2d(rect)](https://codepen.io/oj8kay/pen/XBrmVy)  by Kay ([@oj8kay](https://codepen.io/oj8kay)) on [CodePen](https://codepen.io/).

方法二的核心代码如下：

```javascript
var tick = function () {
  if (stop) return false
  timeNow = Date.now()
  delta = timeNow - timeLast
  if (delta > interval) {
    timeLast = timeNow
    distance += (delta / 1000 * v)
    // +++++++++++++++++++++
    for (var i = 0; i < canvasHeight; i++) {
      for (var j = 0; j < canvasWidth; j++) {
        if (i === 0) {
          yBuf[j] = cftA * j * Math.sin(cftX * (j - distance))
        }
        r = (i * canvasWidth + j) * 4
        g = r + 1
        b = r + 2
        a = r + 3
        oR = r + (~~(0.5 + yBuf[j])) * canvasWidth * 4
        oG = oR + 1
        oB = oR + 2
        oA = oR + 3
        offset = j === 0 ? 0 : (yBuf[j] - lastY) * 100
        pixels[r] = oPixels[oR] + offset
        pixels[g] = oPixels[oG] + offset
        pixels[b] = oPixels[oB] + offset
        pixels[a] = oPixels[oA]
        lastY = yBuf[j]
      }
    }
    ctx.putImageData(imgData, 0, 0)
    // +++++++++++++++++++++
  }
  requestAnimationFrame(tick)
}
```

这个方法做出的另外一点修改是，由于操作是对画布逐像素进行的，包括透明元素，所以既不用clearRect，也不用对Y轴进行偏移。

![](/images/hand.webp)[完整代码戳这里](https://gitee.com/kaysama/blog-source-host/tree/master/%E5%89%8D%E7%AB%AF%E5%AE%9E%E7%8E%B0%E6%97%97%E5%B8%9C%E9%A3%98%E5%8A%A8%E6%95%88%E6%9E%9C%E7%B3%BB%E5%88%97/canvas2D%E5%AE%9E%E7%8E%B0-2)

![](/images/hand.webp)[Demo1](http://kaysama.gitee.io/blog-source-host/%E5%89%8D%E7%AB%AF%E5%AE%9E%E7%8E%B0%E6%97%97%E5%B8%9C%E9%A3%98%E5%8A%A8%E6%95%88%E6%9E%9C%E7%B3%BB%E5%88%97/canvas2D%E5%AE%9E%E7%8E%B0-2/)

![](/images/hand.webp)Demo2：See the Pen [flag waving by canvas2d(pixel)](https://codepen.io/oj8kay/pen/RBrPEp)  by Kay ([@oj8kay](https://codepen.io/oj8kay)) on [CodePen](https://codepen.io/).

通过chrome dev tool对两个方法的性能进行分析：

这是方法1的CPU占有率的变化：

![](/images/canvas_flag_2.jpg)

这是方法2的：

![](/images/canvas_flag_3.jpg)

哪个性能更好显而易见。方法二的性能虽然差，但是它的好处是灵活性更大，你甚至可以任意改变“光源”的位置。

下一讲我会通过webgl对其进行重写，使其大部分的渲染逻辑从CPU转到GPU，可以使其的性能得到成倍的提高。建议大家先学习一下webgl的一些基本用法，包括矩阵的知识，着色器等。

**目录指引：**

-   [前端实现旗帜飘动效果系列 (Ⅰ)：dom+css实现](https://my.oschina.net/codingDog/blog/1839097)
-   [前端实现旗帜飘动效果系列 (Ⅱ)：canvas2D实现（1）](https://my.oschina.net/codingDog/blog/1839098)
-   [前端实现旗帜飘动效果系列 (Ⅲ)：canvas2D实现（2）](https://my.oschina.net/codingDog/blog/1839099)
-   [前端实现旗帜飘动效果系列 (Ⅳ)：webgl实现](https://my.oschina.net/codingDog/blog/1839100)
-   [前端实现旗帜飘动效果系列 (Ⅴ)：pixi.js实现](https://my.oschina.net/codingDog/blog/4968573)