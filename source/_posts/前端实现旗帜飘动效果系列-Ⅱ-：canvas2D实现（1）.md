---
title: 前端实现旗帜飘动效果系列(Ⅱ)：canvas2D实现（1）
date: 2018-07-03 04:40:00
tags:
---

这里是本系列的第二讲，[上一讲](https://my.oschina.net/codingDog/blog/1839097)不知道大家自己试过了没，虽然整体效果差强人意但是并不算完美。本讲我们先用那个canvas2D把上一讲的效果实现一遍。

还是先讲原理，动手能力强的童鞋可以看了原理自己去鼓捣。
设有三角函数 **y = Asin(ωx+φ)** ，

1. 第一步，我们要先利用高中的三角函数知识来计算出旗帜飘动（类似简谐运动）的第一帧 (设初相φ=0) 的曲线，
   假设我们有一张图片，宽高分别为W、H，该图片包含n个周期，最大振幅为A，可得波长 **λ = W / n ，ω = 2π / λ** ，即可得出我们的三角函数：**y = A · sin( 2π / λ · x )** ；
2. 第二步，在W次循环中（逐像素），使用drawImage函数 来画出宽度1，高度H 的图片。<!-- more -->
3. 第三步，根据x轴偏移量修改振幅的系数。据本人“观察”，现实生活中，旗子的尾部摆动幅度更大。为了做到这个效果，修改三角函数为 **y = A · ( x ÷ W ) · sin( 2π / λ · x )** ；
   （我使用的振幅变化是线性递增的，很遗憾本人的物理水平不咋地，不知道理想状况下振幅应该是怎样的变化关系，不过看的差不多就行了，）
4. 第四步，给我们的第一帧画面添加时间轴，将曲线随时间往右平移来呈现动画效果，设频率为f，t 为上一帧到这帧的间隔，波速 **v = λ · f** ，修改我们的函数： **y = A · ( x ÷ W ) · sin( 2π / λ · ( x - t · v ))** ；
5. 第五步，由于运动的坐标原点是左上角，所以超出的部分会被裁剪。我们先创建一个宽高分别为W和H+2 * A的 画布，然后将函数往下移动，是其正好被包裹，因为canvas坐标系与数学中的直角坐标系方向相反，所以要加上A，得到最终的函数： **y = A · ( x ÷ W ) · sin( 2π / λ · ( x - t · v )) + A**；

以上就是我们主要的步骤，角度需要换成弧度制。有些人可能会疑问，上一讲不是需要做一次反向平衡来防止旗帜的最左边也波动起来吗？最左边x轴坐标为0，代入我们的函数，得到y = 0，也就是振幅为0，所以就可以免去了上一讲的步骤，当然，如果你觉得我的“观察”没有啥依据，还是按照标准的三角函数（ **y = A · sin( 2π / T · ( x - t · v ))** ）来做，那么你需要在每一帧中，先计算出x=0时候的振幅，记为 **y0 =  A  · sin( 2π / T · ( -t · v ÷ T ))** ，然后将图形向上或者向下移动-y0 ，修改我们的函数： **y = A · sin( 2π / T · ( x - t · v )) + A  + y0** 。


ok，辛苦你看到现在，代码量也不大，我一次贴出来吧。

```html
<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>旗帜飘飘</title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }

        html, body {
            width: 100%;
            height: 100%;
        }

        body {
            position: relative;
            background: lightgrey;
        }

        #flagCanvas {
            position: absolute;
            top: 50%;
            left: 50%;
            transform-origin: center;
            transform: translate3d(-50%, -50%, 0);
        }
    </style>
</head>
<body>
<canvas id="flagCanvas"></canvas>
<script>
  var canvas = document.getElementById('flagCanvas')
  var ctx = canvas.getContext('2d')

  var IMG_MAX_WIDTH = 600
  var IMG_MAX_HEIGHT = 600
  var imgWidth, imgHeight

  var image = new Image()
  image.src = '../img/flag.jpg'

  var amplitude = 30  // 振幅
  var period = 2  // 周期数
  var frequency = 1  // 频率
  var wavelength // 波长
  var v // 波速
  var cftX // x系数
  var cftA // 振幅系数

  image.onload = function (ev) {

    imgWidth = Math.floor(image.width)
    imgHeight = Math.floor(image.height)

    var canvas = document.getElementById('flagCanvas')
    var scale = 1
    if (imgWidth > IMG_MAX_WIDTH) {
      scale = IMG_MAX_WIDTH / imgWidth
    }
    if (imgHeight > IMG_MAX_HEIGHT) {
      scale = scale * IMG_MAX_HEIGHT / imgHeight
    }

    canvasWidth = imgWidth
    canvasHeight = imgHeight + amplitude * 2
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    canvas.style.transform = 'translate3d(-50%,-50%,0) scale(' + scale + ')'

    wavelength = imgWidth / period
    cftX = 2 * Math.PI / wavelength
    cftA = amplitude / imgWidth
    v = wavelength * frequency

    tick()
  }

  var fps = 70  // 每秒帧数
  var interval = 1000 / fps  // 连续帧之间间隔（理论）
  var stop = false  // 停止动画
  var timeNow = Date.now()  // 当前时间
  var timeLast = timeNow  // 上一帧时间
  var delta = 0  // 连续帧之间间隔（实际）

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
        var y = cftA * x * Math.sin(cftX * (x - distance)) + amplitude
        ctx.drawImage(image, x, 0, 1, imgHeight, x, y, 1, imgHeight)
      }
    }
    requestAnimationFrame(tick)
  }

</script>
</body>
</html>
```

效果如下：

![](https://oscimg.oschina.net/oscnet/7868d44685263e3cc9b45f334f9df4b24f1.jpg)

还是熟悉的味道，不过比较一下上一讲的效果图，你会发现无论是性能还是呈现效果都有所改进

![](https://oscimg.oschina.net/oscnet/72273340eeda33b4f30713e281e09dba6e1.jpg)

说一下几个关键点：

① 第70行有一段代码 canvas.style.transform = 'translate3d(-50%,-50%,0) scale(' + scale + ')' 。因为如果图片太大需要进行缩放，但是通过canvas2D来处理会性能并不会太高，因为其并没有用到gpu来渲染，所以我选择了translate3d来强制开启硬件加速；

② drawImage方法可以传入9个参数，这是函数的原型： [void CanvasRenderingContext2D.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight); ](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage)

![](https://oscimg.oschina.net/oscnet/5ee5a8c5183522438d36147cf44f095675b.jpg)

似乎基本要主意的就这些了，这次就那么多，下一讲在这个基础上给旗帜添加高光效果。

![](https://static.oschina.net/uploads/space/2017/0630/180033_T7KY_1389094.png)[完整代码戳这里](https://gitee.com/kaysama/blog-source-host/tree/master/%E5%89%8D%E7%AB%AF%E5%AE%9E%E7%8E%B0%E6%97%97%E5%B8%9C%E9%A3%98%E5%8A%A8%E6%95%88%E6%9E%9C%E7%B3%BB%E5%88%97/canvas2D%E5%AE%9E%E7%8E%B0-1)

![](https://static.oschina.net/uploads/space/2017/0630/180033_T7KY_1389094.png)[在线演示](http://kaysama.gitee.io/blog-source-host/%E5%89%8D%E7%AB%AF%E5%AE%9E%E7%8E%B0%E6%97%97%E5%B8%9C%E9%A3%98%E5%8A%A8%E6%95%88%E6%9E%9C%E7%B3%BB%E5%88%97/canvas2D%E5%AE%9E%E7%8E%B0-1/)

**目录指引：**

-   [前端实现旗帜飘动效果系列 (Ⅰ)：dom+css实现](https://my.oschina.net/codingDog/blog/1839097)
-   [前端实现旗帜飘动效果系列 (Ⅱ)：canvas2D实现（1）](https://my.oschina.net/codingDog/blog/1839098)
-   [前端实现旗帜飘动效果系列 (Ⅲ)：canvas2D实现（2）](https://my.oschina.net/codingDog/blog/1839099)
-   [前端实现旗帜飘动效果系列 (Ⅳ)：webgl实现](https://my.oschina.net/codingDog/blog/1839100)
-   [前端实现旗帜飘动效果系列 (Ⅴ)：pixi.js实现](https://my.oschina.net/codingDog/blog/4968573)