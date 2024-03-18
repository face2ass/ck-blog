---
title: feColorMatrix使用技巧（译）
date: 2020-08-18 23:04:00
categories:
  - [技术, 前端]
tags:
  - Svg
  - 图形
---

你们见过 Spotify 的年终活动吗？他们通过图像颜色处理创造了引人注目的视觉美感。

![Screenshot of Spotify’s end-of-year campaign](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-01-spotify1a.jpg?w=960&ssl=1)

善用图形处理可以增加我们网页的逼格——过滤器filter就能通过动态串联的方式帮我们在浏览器做到这一点。
<!-- more -->
## **CSS 与 SVG**

今年早些时候，我推出了[CSSgram](http://una.im/CSSgram)，这是一个纯 CSS 库，它使用过滤器和混合模式来创建图片过滤器。

![Image grid from Una Kravets’ CSSGram showing a variety of filters and blend modes that recreate Instagram filters](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-03-cssgram.jpg?w=960&ssl=1)

现在，这可以通过修补和混合模式来完成——但CSS过滤器有一个巨大的缺点：它无法控制RGBA通道。但是SVG的feColorMatrix弥补了这个不足。

## SVG filters

在SVG中，fe-前缀表示滤镜相关属性。它们可以产生各种各样的颜色效果，比如模糊，比如生成3D纹理。

SVG 过滤器兼容性：  
![](https://oscimg.oschina.net/oscnet/up-7b5070e3a8ccb7682e8b21f673e6e767b6e.png)

可以看到如果你不需要支持IE9以下版本，那么就可以放心地使用svg过滤器了。

## 使用SVG过滤器

这是SVG过滤器的基本结构：

```html
<svg>
  <filter id="filterName">
    // filter definition here can include
    // multiple of the above items
  </filter>
</svg>
```

在 SVG 中，您可以在defs中声明一个过滤器。并可以像这样在 CSS 中引用：

```css
.filter-me {
  filter: url('#filterName');
}
```

url里面是过滤器的路径，所以`filter: url('../img/filter.svg#filterName')`和`filter: url('http://una.im/filters.svg#filterName')`两种写法也都是可以的。

## feColorMatrix

feColorMatrix是色彩处理最核心的属性，它可以基于矩阵对通道 (RGBA)处理从而影​​响色值。类似 Photoshop 中的通道编辑功能。

这是的`feColorMatrix`写法，在原始图像中每个 RGBA 值默认是1：

```markup

<filter id="linear">
    <feColorMatrix
      type="matrix"
      values="R 0 0 0 0
              0 G 0 0 0
              0 0 B 0 0
              0 0 0 A 0 "/>
  </filter>
</feColorMatrix>


```

最后一个数字1是用来做通道值的piany。最终的 RGBA 值可以像列一​​样从上到下读取：

```css

/* R G B A 1 */
1 0 0 0 0 // R = 1*R + 0*G + 0*B + 0*A + 0
0 1 0 0 0 // G = 0*R + 1*G + 0*B + 0*A + 0
0 0 1 0 0 // B = 0*R + 0*G + 1*B + 0*A + 0
0 0 0 1 0 // A = 0*R + 0*G + 0*B + 1*A + 0


```

下图可以更直观的看出颜色矩阵和颜色向量是如何相乘的


![Hand-drawn sketch showing a schematic visualization of the fecolormatrix](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-05-color-matrix-visual.jpg?w=960&ssl=1)

## RGB值

#### 着色

可以通过像下面这样删除通道来修改图片颜色：

```xml
<!-- 移除 B 和 G 通道 (只保留R) -->
<filter id="red">
  <feColorMatrix
    type="matrix"
    values="1   0   0   0   0
            0   0   0   0   0
            0   0   0   0   0
            0   0   0   1   0 "/>
</filter>

<!-- 移除 R 和 G 通道 (只保留B) -->
<filter id="blue">
 <feColorMatrix
    type="matrix"
    values="0   0   0   0   0
            0   0   0   0   0
            0   0   1   0   0
            0   0   0   1   0 "/>
</filter>

<!-- 移除 R 和 B 通道 (只保留G) -->
<filter id="green">
  <feColorMatrix
    type="matrix"
    values="0   0   0   0   0
            0   1   0   0   0
            0   0   0   0   0
            0   0   0   1   0 "/>
</filter>
```

这就是图像添加上面“green”这个滤镜后的样子：  
![Photo showing what the addition of the “green” filter would look like](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-06-green.jpg?w=960&ssl=1)

#### 通道混合

也可以通过混合不同的通道获得其他颜色的滤镜：

```xml
<!-- 移除B通道(混合R和G通道) 红色 + 绿色 = 黄色 -->
<filter id="yellow">
  <feColorMatrix
    type="matrix"
    values="1   0   0   0   0
            0   1   0   0   0
            0   0   0   0   0
            0   0   0   1   0 "/>
</filter>

<!-- 移除G通道(混合R和B通道) 红色 + 蓝色 = 紫色 -->
<filter id="magenta">
  <feColorMatrix
    type="matrix"
    values="1   0   0   0   0
            0   0   0   0   0
            0   0   1   0   0
            0   0   0   1   0 "/>
</filter>

<!-- 移除R通道(混合G和B通道) 绿色 + 蓝色 = 青色 -->
<filter id="cyan">
  <feColorMatrix
    type="matrix"
    values="0   0   0   0   0
            0   1   0   0   0
            0   0   1   0   0
            0   0   0   1   0 "/>
</filter>
```

前面的示例中是在 CMYK 模式下混合颜色，因此删除红色通道意味着保留绿色和蓝色通道。当绿、蓝混合会产生青色，红、蓝混合产生紫色。

[Justin McDowell](https://twitter.com/revoltpuppy)写过一篇文章[《Mixing Color for the Web》](http://alistapart.com/article/mixing-color-for-the-web-with-sass)，解释了 HSL（色相、饱和度、亮度）颜色理论。对 SVG来说，需要记住 亮度值就是明度。在这里，每个通道中都保留了每个亮度级别，因此对于紫色，我们得到的图像如下：


![Photo showing how a magenta effect is produced when each luminosity level is retained in each channel](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-07-magenta.jpg?w=960&ssl=1)

为什么云中有这么多紫色和亮度？思考下这张 RGB 图表：

![RGB chart](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-08-rgb.png?w=960&ssl=1)

当一个值缺失会被另外两个值替代。所以现在，没有绿色通道，就没有白色、青色或黄色。然而，这些颜色实际上并没有消失，因为它们的亮度（或 alpha）值还未被触及。我们接下来试试操作这些 Alpha 通道时会发生什么。

### ALPHA值

我们可以通过 Alpha 通道（第四列）处理阴影和高光色调。第四行影响整个 Alpha 通道，同时也影响每个通道的亮度。

```xml
<!-- 看起来是一个透明度改为0.5的滤镜 -->
<filter id="alpha">
  <feColorMatrix
    type="matrix"
    values="1   0   0   0   0
            0   1   0   0   0
            0   0   1   0   0
            0   0   0   .5  0 "/>
</filter>

<!-- 设置G通道的透明度等于alpha通道的值 -->
<filter id="hard-green">
  <feColorMatrix
    type="matrix"
    values="1   0   0   0   0
            0   1   0   1   0
            0   0   1   0   0
            0   0   0   1   0 "/>
</filter>

<filter id="hard-yellow">
  <feColorMatrix
    type="matrix"
    values="1   0   0   1   0
            0   1   0   1   0
            0   0   1   0   0
            0   0   0   1   0 "/>
</filter>
```

In the following example, we’re reusing the matrix from the magenta example and adding a 100% alpha channel on the blue level. We retain the red values, yet override any red in the shadows so the shadow colors all become blue, while the lightest values that have red in them become a mix of blue and red (magenta).

在下面的示例中，我们重用了洋红色示例中的矩阵，并在蓝色级别上添加了 100% 的 Alpha 通道。我们保留红色值，但是覆盖了阴影中的红色，因此阴影颜色全部变为蓝色，而其中包含红色的最亮值变为蓝色和红色（洋红色）的混合。

```xml
<filter id="blue-shadow-magenta-highlight">
  <feColorMatrix
    type="matrix"
    values="1   0   0   0   0
            0   0   0   0   0
            0   0   1   1   0
            0   0   0   1   0 "/>
</filter>
```


![Image showing what happens when we reuse the matrix from the magenta example and add a 100% alpha channel on the blue level](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-09-blue-magenta.jpg?w=960&ssl=1)

如果最后一个值小于 0（最多 -1），则会发生相反的情况。阴影会变成红色而不是蓝色。在 -1 时，这些会产生相同的效果：

```xml
<filter id="red-overlay">
  <feColorMatrix
    type="matrix"
    values="1   0   0   0   0
            0   0   0   0   0
            0   0   1  -1   0
            0   0   0   1   0 "/>
</filter>

<filter id="identical-red-overlay">
  <feColorMatrix
    type="matrix"
    values="1   0   0   0   0
            0   0   0   0   0
            0   0   0   0   0
            0   0   0   1   0 "/>
</filter>
```


![Image showing a red overlay, making the shadows red instead of blue](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-10-red.jpg?w=960&ssl=1)

然而，将这个值设为 0.5 而不是 -1，可以让我们看到阴影中的颜色混合：

```xml
<filter id="blue-magenta-2">
  <feColorMatrix
    type="matrix"
    values="1   0   0   0   0
            0   0   0   0   0
            0   0   1  .5   0
            0   0   0   1   0 "/>
</filter>
```


![Image showing a mixture of colors in the shadows](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-11-blue-magenta-2.jpg?w=960&ssl=1)

#### 移出通道

我们可以通过第四行影响单个通道的整体 alpha。由于我们的示例有蓝天，我们可以通过将蓝色值转换为白色来消除天空和蓝色值，如下所示：

```xml
<filter id="elim-blue">
  <feColorMatrix
    type="matrix"
    values="1   0   0   0   0
            0   1   0   0   0
            0   0   1   0   0
            0   0   -2   1   0 "/>
</filter>
```


![Image showing an example of blowing out a channel. We can get rid of the sky and the blue values by  converting blue values to white](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-12-blue-to-white.jpg?w=960&ssl=1)

以下是更多通道混合的示例：

```xml
<!-- No G channel, Red is at 100% on the G Channel, so the G channel looks Red (luminosity of G channel lost) -->
<filter id="no-g-red">
  <feColorMatrix
    type="matrix"
    values="1   1   0   0   0
            0   0   0   0   0
            0   0   1   0   0
            0   0   0   1   0 "/>
</filter>

<!-- No G channel, Red and Green is at 100% on the G Channel, so the G Channel looks Magenta (luminosity of G channel lost) -->
<filter id="no-g-magenta">
  <feColorMatrix
    type="matrix"
    values="1   1   0   0   0
            0   0   0   0   0
            0   1   1   0   0
            0   0   0   1   0 "/>
</filter>

<!-- G channel being shared by red and blue values. This is a colorized magenta effect (luminosity maintained) -->
<filter id="yes-g-colorized-magenta">
  <feColorMatrix
    type="matrix"
    values="1   1   0   0   0
            0   1   0   0   0
            0   1   1   0   0
            0   0   0   1   0 "/>
</filter>
```

## **变亮和变暗**

您可以通过将每个通道的 RGB 值设置为小于 1 的值（这是完整的自然强度）来创建变暗效果。要变亮，请将值增加到大于 1。您可以将其视为扩大或减少前面显示的 RGB 色环。圆的半径越宽，创建的色调越亮，“吹散”的白色就越多。当半径减小时会发生相反的情况。  
![Diagram showing how you can create a darken effect by setting the RGB values at each channel to a a value less than 1; to lighten, increase the values to greater than 1](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-13-rgb-explainer.png?w=960&ssl=1)

这是对应的矩阵：

```xml
<filter id="darken">
  <feColorMatrix
    type="matrix"
    values=".5   0   0   0   0
             0  .5   0   0   0
             0   0  .5   0   0
             0   0   0   1   0 "/>
</filter>
```


![Image with a darken filter applied](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-14-darken.jpg?w=960&ssl=1)

```xml
<filter id="lighten">
  <feColorMatrix
    type="matrix"
    values="1.5   0   0   0   0
            0   1.5   0   0   0
            0   0   1.5   0   0
            0   0   0   1   0 "/>
</filter>
```


![Image with a lighten filter applied](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-15-lighten.jpg?w=960&ssl=1)

### **灰度**

您可以通过在列中仅接受一个阴影的像素值来创建灰度效果。但是，根据应用的活动级别，存在不同的灰度效果。在这里，我们正在进行通道操作，因为我们正在对图像进行灰度化。考虑这些例子：

```xml
<filter id="gray-on-light">
  <feColorMatrix
    type="matrix"
    values="1   0   0   0   0
            1   0   0   0   0
            1   0   0   0   0
            0   0   0   1   0 "/>
</filter>
```


![Image showing a 'gray on light' effect](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-16-gray-on-light.jpg?w=960&ssl=1)

```xml
<filter id="gray-on-mid">
  <feColorMatrix
    type="matrix"
    values="0   1   0   0   0
            0   1   0   0   0
            0   1   0   0   0
            0   0   0   1   0 "/>
</filter>
```


![Image showing a 'gray on mid' effect](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-17-gray-on-mid.jpg?w=960&ssl=1)

```xml
<filter id="gray-on-dark">
  <feColorMatrix
    type="matrix"
    values="0   0   1   0   0
            0   0   1   0   0
            0   0   1   0   0
            0   0   0   1   0 "/>
</filter>
```


![Image showing a 'gray on dark' effect](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-18-gray-on-dark.jpg?w=960&ssl=1)

## **将它们拉在一起**

真正的力量`feColorMatrix`在于它能够混合通道并将许多这些概念组合成新的图像效果。你能读懂这个过滤器发生了什么吗？

```xml
<filter id="peachy">
  <feColorMatrix
    type="matrix"
    values="1   0   0   0   0
            0  .5   0   0   0
            0   0   0  .5   0
            0   0   0   1   0 "/>
</filter>
```

我们在其正常的 Alpha 通道上使用红色通道，以一半强度应用绿色，并在较暗的 Alpha 通道上应用蓝色，但不在其原始颜色位置。该效果在阴影中为我们提供了深蓝色，并为高光和中间色调提供了红色和半绿色的混合。如果我们回忆一下 red + green = yellow，red + (green/2) 会更像珊瑚色：


![Image showing what happens when we use the red channel at its normal alpha channel, apply green at half strength, and apply blue on the darker alpha channels but not at its original color location](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-19-peachy.jpg?w=960&ssl=1)

这是另一个例子：

```xml
<filter id="lime">
  <feColorMatrix
    type="matrix"
    values="1   0   0   0   0
            0   2   0   0   0
            0   0   0  .5   0
            0   0   0   1   0 "/>
</filter>
```

在那个片段中，我们使用了正常的红色像素色调、过度的绿色和没有原始色调像素的蓝色，但应用在阴影中。再次，我们在阴影中看到深蓝色，并且由于红色 \+ 绿色 = 黄色，红色 \+ (green*2) 在高光中将更像是黄绿色：


![Image showing what happens when we use the normal pixel hue of red, a blown-out green, and blue devoid of its original hue pixels, but applied in the shadows. Again, we see that dark blue in the shadows, and since red + green = yellow, red + (green*2) would be more of a yellow-green in the highlights](https://i0.wp.com/alistapart.com/wp-content/uploads/2016/02/fig-20-lime.jpg?w=960&ssl=1)

通过玩这些价值观可以探索很多东西。这种探索的一个很好的例子是[Rachel Nabors](https://twitter.com/rachelnabors)的[Dev Tools Challenger](http://devtoolschallenger.com/)，她从海里的鱼中过滤掉了较长的波长（即红色和橙色通道），解释了为什么“Orange Roughy”实际上在水中看起来是黑色的。（注意：需要 Firefox。）

挺酷的！科学！和彩色滤光片！现在您对情况有了基本的了解，您也拥有创建自己的效果所需的工具。

对于一些非常受欢迎的 Spotify 双色调效果，我建议您查看[Amelia Bellamy-Royds](https://twitter.com/AmeliasBrain)[的一篇文章](https://css-tricks.com/color-filters-can-turn-your-gray-skies-blue/)，他更详细地介绍了. [Sara Soueidan](https://twitter.com/SaraSoueidan)还写[了一篇关于图像效果的出色文章](https://sarasoueidan.com/blog/compositing-and-blending-in-css/)，其中她使用 SVG 重新创建了 CSS 混合模式。`feColorMatrix`

## **滤镜效果参考**

一旦您了解了`feColorMatrix`. `fe-`以下是目前所有 \* 选项的便捷指南，供您进一步探索：

-   `feBlend`：类似于[CSS 混合模式](https://css-tricks.com/basics-css-blend-modes/)，此功能描述图像如何通过混合模式进行交互
-   `feComponentTransfer`: 改变单个 RGBA 通道的函数的总称（即 , `feFuncG`）
-   `feComposite`：定义像素级图像[交互的过滤器原语](http://apike.ca/prog_svg_filter_feComposite.html)
-   `feConvolveMatrix`：此过滤器决定像素如何与其近邻交互（即模糊或锐化）
-   `feDiffuseLighting`: 定义一个光源
-   `feDisplacementMap``in`:使用另一个输入 ( ) 的像素值置换图像 ( `in2`)
-   `feFlood`: 使用指定的颜色和 alpha 级别完成过滤器子区域的填充
-   `feGaussianBlur`：使用输入标准偏差模糊输入像素
-   `feImage`: 用于其他过滤器（如`feBlend`或`feComposite`）
-   `feMerge`：允许异步应用滤镜效果，而不是分层
-   `feMorphology`：侵蚀或扩大源图形的线条（想想文本上的笔画）
-   `feOffset`：用于创建阴影
-   `feSpecularLighting`：作为[凹凸贴图的 alpha 分量的来源，也就是](http://blog.digitaltutors.com/bump-normal-and-displacement-maps/)[Phong 反射模型](https://en.wikipedia.org/wiki/Phong_reflection_model)的“镜面反射”部分
-   `feTile`：指的是如何重复图像以填充空间
-   `feTurbulence`：允许使用[Perlin Noise创建合成纹理](http://physbam.stanford.edu/cs448x/old/Procedural_Noise(2f)Perlin_Noise.html)

## **其他资源**

-   [feColorMatrix 上的 MDN 文档](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feColorMatrix)
-   [w3c Filter 文档](http://www.w3.org/TR/SVG11/filters.html)
-   [Smarter SVG Filters](https://docs.webplatform.org/wiki/svg/tutorials/smarter_svg_filters)
-   [Web 平台上的 feColorMatrix 概述](https://docs.webplatform.org/wiki/svg/elements/feColorMatrix)

> 翻译自：[http://alistapart.com/article/finessing-fecolormatrix/](http://alistapart.com/article/finessing-fecolormatrix/)