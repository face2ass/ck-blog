---
title: iconfont的实现原理及如何使用？
date: 2018-02-04 16:34:00
categories:
  - [技术, 前端]
tags:
  - 图形
---
这篇文章还是秉承我的写作习惯，虽然标题是谈iconfont，但是我仍然是想到啥说啥，夹杂一些自己的私货，看官们不要介意。废话不多说，咱们先从[阿里巴巴矢量图形库](http://www.iconfont.cn/)放几个图标到项目中，然后下载项目里的图标，网站会帮你生成一些css、html、js文件以及字体文件，然后咱们看着这些代码慢慢进入本次主题：iconfont。

解压缩阿里图标库下载的文件：
<!-- more -->
![](https://oscimg.oschina.net/oscnet/4e40b0235982bc9429494de264546c61aaf.jpg)

对于前端来说，唯一觉得比较陌生的可能就是这一堆字体文件了，有些喜欢鼓捣操作系统字体的人可能会对一个ttf格式的文件有些眼熟，这不就是操作系统的字体文件么，那eot、woff、svg这些又是啥？前面两个同样也是字体文件，只是为了兼容不同的浏览器而额外引入的，svg严格来说与iconfont并无关系（既然有svg，虽然偏离主题，文章后面也会来讲一讲，因为svg能展开的东西很多我今后会专门写一篇来详细研究）。

首先，我们来了解一下到底字体是如何在浏览器里被渲染出来的。光讲原理有些枯燥，网上也能找到一堆，我们先直观地来看看字体文件里面到底是啥玩意儿。首先，如果你是win10或win8用户，打开操作系统的字体文件目录：C:\\Windows\\Fonts\或C:\\Winnt\\Fonts，点击左侧的“查找字符”：

![](https://oscimg.oschina.net/oscnet/0f680528c79b75247f36b2ea01ff9673fb9.jpg)

或者准备一个软件：[FontForge](http://fontforge.github.io/en-US/downloads/)，这是一个开源的字体编辑器，下面我就用这个软件来深入。先打开操作系统中的字体文件目录，随便找一个字体文件，如：consola.ttf，拷到其他目录（可能会变成四个文件，分别是consola.ttf、consolab.ttf、consolai.ttf、consolaz，对应的是常规、加粗、斜体、斜体加粗）。

用FontForge打开consola.ttf，无视警告，可以看到这样的一张表：

![](https://oscimg.oschina.net/oscnet/e35911d36eb737636939035b4c1cd46f15d.jpg)

可以猜得出来，字体文件其实就是一个以unicode作为索引的字形表。双击里面的某个字形，你可以对它进行编辑，也能猜得出来每个字形其实就是一个矢量图，因此ttf文件所表示的字库也叫矢量字库，说到这个再稍微提及一下另一种字库——点阵字库，两者最大的区别就是点阵字库可以在Console Mode（命令行模式）下被渲染出来，而矢量字库必须在Graphics Mode（图形模式）中被渲染。比如早期没有图形接口的dos系统或者某些linux终端，这些字体的索引需要靠固化到硬件驱动上点阵字库，因为早期的计算机只支持英文，这也是后来“汉卡”的由来。

了解了常规的字体，我们接下来试试如何自定义字体并使用它们。

# 字体定义：

打开iconfont.css，可以看到第一行有一个 @font-face 声明，其中font-family属性定义了这个字体的名称，src属性定义了该要渲染字体需要下载的字体文件。

## 为何有两个src？

>     绝大多数情况下，第一个 src 是可以去掉的，除非需要支持 IE9 下的兼容模式。在 IE9 中可以使用 IE7 和 IE8 的模式渲染页面，微软修改了在兼容模式下的 CSS 解析器，导致使用 ? 的方案失效。由于 CSS 解释器是从下往上解析的，所以在上面添加一个不带问号的 src 属性便可以解决此问题。

## #iefix有何作用？

>     IE9 之前的版本没有按照标准解析字体声明，当 src 属性包含多个 url 时，它无法正确的解析而返回 404 错误，而其他浏览器会自动采用自己适用的 url。因此把仅 IE9 之前支持的 EOT 格式放在第一位，然后在 url 后加上 ?，这样 IE9 之前的版本会把问号之后的内容当作 url 的参数。至于 #iefix 的作用，一是起到了注释的作用，二是可以将 url 参数变为锚点，减少发送给服务器的字符。

至于后面的src和一堆url主要是为了兼容不同的浏览器，format属性告诉浏览器这个字体的格式，可选的字体格式有 [woff](https://developer.mozilla.org/zh-CN/docs/WOFF)、woff2、truetype、opentype、embedded-opentype、svg。

# 字体使用：

阿里提供了Unicode、Font class、Symbol三种引用方式，

## ①Unicode

html：

```html
<i class="testfont">&#xe869;</i>
```

css：

```css
.testfont{
  font-family:"testfont" !important;
  font-size:16px;font-style:normal;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke-width: 0.2px;
  -moz-osx-font-smoothing: grayscale;
}
```

html中&#xe869;其中&表示转义，#x可以用于表示16进制转义字符（我们知道，Unicode主流的规范是UCS-2，即3个字节表示一个字符，所以unicode字符可以用一个16进制数表示）。

事实上，你也可以用“&#”对10进制的数进行转义，比如0xe869用十进制表示为59497，在html中你就可以这么写：

```html
<i class="icon testfont">&#59497;</i>
```

那么我们如何才能知道我们字体文件中每个字形对应的是哪个unicode码呢？我们可以直接从下载的demo_unicode.html文件中找到该图标对应的16进制数：

![](https://oscimg.oschina.net/oscnet/552a72dea10bc9ca4614642c78de7c5c5fd.jpg)

如果你想对这个图形做一些修改，可以用fontForge打开字体文件，接着根据16进制数或者图标名字来定位到该图标：

![](https://oscimg.oschina.net/oscnet/4eac43ca9e1448806099b49a10b657e0ddb.jpg)

当在你在FontForge中修改了字形后，点击File->Generage Fonts.. 生成字体文件（记住每种格式导出一份），然后在font-face中修改文件的引用地址即可。

## ②Font class

这种引入方式和原理第一种类似

html：

```html
<i class="testfont test-socialchrome"></i>
```

css

```css
.test-socialchrome:before {
  content: "\e869";
}
```

看到这里估计大家都明白了，这种方式只是在原来的dom上增加一个伪元素，css中正斜杠\\表示一个16进制数字。这样写的好处是可以直接通过审查dom元素就知道它引用的是哪个字形，看起来更加语义化。

## ③Symbol

iconfont事实上使用的是使用系统字体渲染引擎，而它是只支持单色的。官网称Symbol可以实现多色，如何做到的呢？以下是官网对其的描述：

> 这是一种全新的使用方式，应该说这才是未来的主流，也是平台目前推荐的用法。相关介绍可以参考这篇文章 这种用法其实是做了一个svg的集合，与另外两种相比具有如下特点：
>
> -   支持多色图标了，不再受单色限制。
> -   通过一些技巧，支持像字体那样，通过`font-size`,`color`来调整样式。
> -   兼容性较差，支持 ie9+,及现代浏览器。
> -   浏览器渲染svg的性能一般，还不如png。

我们重新来看一下下载的文件，发现里面并没有svg文件，而是多了一个iconfont.js，然后看了一下我们的html文件中引入svg的方式都是

```html
<svg class="icon" aria-hidden="true">
    <use xlink:href="#test-xxxx"></use>
</svg>
```

了解svg的童鞋应该知道这是SVG Sprite的写法，所以使用了js文件将svg嵌入了文档中而不是单独拿出来，因为SVG Sprite只能在同一个文档中使用svg的symbol。可能有些童鞋又疑惑了，svg的大小不是不支持font-size修改的吗？如何实现的呢？其实这里用了一个比较hack的方式，就是把图标元素的宽高都写为1em，而em的大小是相对于该元素的字体大小的，这样就实现了svg宽高跟着svg的字体大小一起变了。

# 总结：

上面就是本文要讲的关于iconfont的全部了，欢迎拍砖和提问。有关SVG的更多特性介绍我以后单独详细描述。