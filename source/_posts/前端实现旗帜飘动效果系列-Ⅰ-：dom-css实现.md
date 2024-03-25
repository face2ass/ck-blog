---
title: 前端实现旗帜飘动效果系列(Ⅰ)：dom+css实现
date: 2018-07-03 04:39:00
categories:
  - [技术, 前端]
tags:
  - Css
---

hello，民娜桑~~我又来开新坑了(￣ε(#￣)☆╰╮o(￣皿￣///)，这次尽量保证把这个坑填完~

本系列我会分四篇来完成主题，分别是① DIV+CSS的实现，② canvas2D的简单实现，③ canvas2D的进阶实现，④ webgl+着色器的实现 以及 ⑤ 包装成jquery插件并发布为npm模块 。
<!-- more -->
开始阅读之前请确保您对高中的三角函数还有一定的印象以及了解基本的canvas绘图操作——当然如果你确实不了解也没事，这篇文章是使用div和css的实现，暂时没有用到以上的知识。

首先讲一下实现的原理，拿到一张图片后，获取其宽度，然后在性能允许的情况下，切成尽可能细的竖直切片，每个切片都用同一张背景图片并将背景图片的位置移动到切片的对应位置，然后通过css3关键帧动画使切片元素以不同的时间轴来进行上下移动。很简单是吧，如果你觉得so easy或者想根据原理自己试着实现一遍，那本文的后面你就可以直接跳过了。

html结构很简单：

```html
<!doctype html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>飘动的旗帜~</title>
    <style>


        * {
            margin: 0;
            padding: 0;
        }

        html, body {
            height: 100%;
            width: 100%;
            background-color: lightgrey;
        }

        body {
            text-align: center;
            position: relative;
        }

        ul, li {
            list-style: none;
        }

        #flag {
            position: absolute;
            left: 50%;
            top: 50%;
        }
        
        /* 这里是核心css样式 */

    </style>
</head>
<body>
<ul id="flag"></ul>
<script>
  (function () {
    // 这里是js代码
  })();
</script>
</body>
</html>
```

然后，准备一张图片，比如这张艹猫海贼团的旗帜，哎呀手滑~是草帽海贼团 (๑•̀ㅂ•́)و✧

![](/images/css_flag_2.jpg)

接下来添加核心css代码：

```cpp
/* 这里是核心css样式 */

#flag > li {
    height: 100%;
    float: left;
    background-image: url("./img/flag.jpg");
    background-size: auto 100%;
    animation: flag ease-in-out infinite;
}
```

是的，你没看错，就是这么点~~事实上并非如此，为了实现代码的灵活性，比如自定义周期数、周期长度、振幅、切片数量等，我使用js代码动态创建了style标签，并将属性计算后写入。

下面是js代码，图片地址我暂时是写死的，通过上传图片自动生成动画我会在最后一节封装插件时作为补充来说明。

```javascript
// 这里是js代码
var flagEle = document.getElementById('flag')
var image = new Image()
image.src = './img/flag.jpg'

var IMG_MAX_WIDTH = 600
var IMG_MAX_HEIGHT = 600
var imgHeight
var imgWidth
image.onload = function () {
    imgWidth = image.width
    imgHeight = image.height
    var ratio = image.width / image.height
    if (imgWidth > IMG_MAX_WIDTH) {
      imgWidth = IMG_MAX_WIDTH
      imgHeight = imgWidth / ratio
    }
    if (imgHeight > IMG_MAX_HEIGHT) {
      imgHeight = IMG_MAX_HEIGHT
      imgWidth = imgHeight * ratio
    }
    
    flagEle.style.width = imgWidth + 'px'
    flagEle.style.height = imgHeight + 'px'
    flagEle.style.marginLeft = -imgWidth / 2 + 'px'
    flagEle.style.marginTop = -imgHeight / 2 + 'px'
    
    splitImg(100, 20, 2, 2)
}
```

虽然在图片加载后有一堆代码，但是除了 splitImg(100, 20, 2, 2) ，事实上其他都无关紧要，前面那段代码的主要作用是定义一个容器的最大宽高，如果超过将会被等比例缩放。（不过并不推荐使用大图，性能会是一个大问题）

下面使这段程序的核心方法——splitImg：

```javascript
  /**
   * 分割图片
   * @param sliceCount 切片数量
   * @param amplitude 振幅
   * @param period 固定周期个数
   * @param duration 一个周期的时长
   */
  function splitImg (sliceCount, amplitude, period, duration) {
    var styleEle = document.createElement('style')
    // styleEle.innerHTML = 'body{background: red}'
    var styleHtmlAry = []
    var sliceCountPerPeriod = Math.floor(sliceCount / period)
    var sliceWidth = imgWidth / sliceCount
    var formula = sliceCountPerPeriod + 'n+'
    var interval = duration * period / sliceCount

    // 添加动画延时
    for (var i = 0; i < sliceCount; i++) {
      if (i < sliceCountPerPeriod) {
        styleHtmlAry.push('#flag > li:nth-child(' + formula + i + ') { ')
        styleHtmlAry.push('animation-delay: -' + (interval * (sliceCountPerPeriod - i)) + 's;')
        styleHtmlAry.push('}')
      }
      styleHtmlAry.push('#flag > li:nth-child(' + i + ') { background-position: -' + (i * sliceWidth) + 'px 0; }') // 设置切片背景
    }

    // 添加关键帧动画
    styleHtmlAry.push('@keyframes flag {')
    styleHtmlAry.push('0% { transform: translate3d(0, ' + amplitude + 'px, 0); }')
    styleHtmlAry.push('50% { transform: translate3d(0, -' + amplitude + 'px, 0); }')
    styleHtmlAry.push('100% { transform: translate3d(0, ' + amplitude + 'px, 0); }')
    styleHtmlAry.push('}')

    // 切片样式
    styleHtmlAry.push('#flag > li {')
    styleHtmlAry.push('animation-duration: ' + duration + 's;') // 添加周期时长
    styleHtmlAry.push('width: ' + (imgWidth / sliceCount) + 'px;') // 设置切片宽度
    styleHtmlAry.push('}')

    styleEle.innerHTML = styleHtmlAry.join('')

    // 创建切片元素
    flagEle.innerHTML = new Array(sliceCount + 1).join('<li></li>')

    document.documentElement.appendChild(styleEle)
  }
```

① 这里的波形图是使用的cos函数的表示形式，添加了三个关键帧：从波峰到波谷，再回到波峰。

② 因为使用了ease-in-out的动画曲线，所以可以模拟出三角函数的波形图

③ 原理和代码都比较简单，可能比较需要注意的是这句 styleHtmlAry.push('#flag > li:nth-child(' + formula + i + ') { ')，对css3了解的朋友应该知道:nth-child的用法，括号里面的是一个等差数列表达式，项数规定用n表示，那么公差是多少呢，由于我们的动画是周期性的，所以公差应该是每个周期包含的切片数量（正整数），即 var sliceCountPerPeriod = Math.floor(sliceCount / period)。

写完以上代码，我们的基本雏形就出来了，这是切片数为80份，振幅20单位，2个周期，周期时长为2秒 时的效果图：

![](/images/css_flag_3.jpg)

是不是看着有点不对劲？旗子不是应该一边固定的么？怎么两边一起动了？

办法也简单，只要我们在容器上加一个反方向的运动不就好了？

修改#flag样式，添加如下样式：animation: flag-reverse ease-in-out infinite;

```css
#flag {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%,-50%,0);
    animation: flag-reverse ease-in-out infinite;
}
```

如下位置添加js代码：

```javascript
// 添加关键帧动画
...

// 添加反向关键帧动画
styleHtmlAry.push('@keyframes flag-reverse {')
styleHtmlAry.push('0% { transform: translate3d(0, ' + (-amplitude) + 'px, 0); }')
styleHtmlAry.push('50% { transform: translate3d(0, ' + amplitude + 'px, 0); }')
styleHtmlAry.push('100% { transform: translate3d(0, ' + (-amplitude) + 'px, 0); }')
styleHtmlAry.push('}')

// 容器应用flag-reverse动画
styleHtmlAry.push('#flag {')
styleHtmlAry.push('animation-duration: ' + duration + 's;') // 添加周期时长
styleHtmlAry.push('animation-delay: -' + (interval * sliceCountPerPeriod) + 's;')
styleHtmlAry.push('}')

// 切片样式
...
```

似乎没问题了，看看效果：

![](/images/css_flag_4.jpg)

纳尼？怎么两边都固定了？原来是因为我们指定2个周期，只要不是周期的整数倍就行了，在原来的基础上改为1.5个周期试试：

![](/images/css_flag_5.jpg)

到这里我们的dom+css的实现方式就结束啦，这种方式的优点很明显，就是实现简单；缺点也不少，比如无法添加高光效果，整体振幅一致不符合常理，切片过多容易造成的页面阻塞与内存泄露，下一节 我会用canvas2D像素级的操作实现该效果，可以很大程度上避免这些问题。

![](/images/hand.webp)[完整代码戳这里](https://gitee.com/kaysama/blog-source-host/tree/master/%E5%89%8D%E7%AB%AF%E5%AE%9E%E7%8E%B0%E6%97%97%E5%B8%9C%E9%A3%98%E5%8A%A8%E6%95%88%E6%9E%9C%E7%B3%BB%E5%88%97/dom+css%E5%AE%9E%E7%8E%B0)

![](/images/hand.webp)[Demo1](http://kaysama.gitee.io/blog-source-host/%E5%89%8D%E7%AB%AF%E5%AE%9E%E7%8E%B0%E6%97%97%E5%B8%9C%E9%A3%98%E5%8A%A8%E6%95%88%E6%9E%9C%E7%B3%BB%E5%88%97/dom+css%E5%AE%9E%E7%8E%B0/)

![](/images/hand.webp)Demo2：See the Pen [flag waving by dom+css](https://codepen.io/oj8kay/pen/oMvjeK) by Kay ([@oj8kay](https://codepen.io/oj8kay)) on [CodePen](https://codepen.io/).

**目录指引：**

-   [前端实现旗帜飘动效果系列 (Ⅰ)：dom+css实现](https://my.oschina.net/codingDog/blog/1839097)
-   [前端实现旗帜飘动效果系列 (Ⅱ)：canvas2D实现（1）](https://my.oschina.net/codingDog/blog/1839098)
-   [前端实现旗帜飘动效果系列 (Ⅲ)：canvas2D实现（2）](https://my.oschina.net/codingDog/blog/1839099)
-   [前端实现旗帜飘动效果系列 (Ⅳ)：webgl实现](https://my.oschina.net/codingDog/blog/1839100)
-   [前端实现旗帜飘动效果系列 (Ⅴ)：pixi.js实现](https://my.oschina.net/codingDog/blog/4968573)