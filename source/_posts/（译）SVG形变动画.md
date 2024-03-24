---
title: （译）SVG形变动画
date: 2018-09-18 21:50:00
categories:
  - [技术, 前端]
tags:
  - Svg
---
虽然使用CSS给SVG添加动画很方便，但是并非所有可以动的svg属性都能通过CSS来设置动画，就比如所有定义元素实际形状的属性，你可以通过[SMIL（Synchronized Multimedia Integration Language）](https://developer.mozilla.org/en-US/docs/Web/SVG/SVG_animation_with_SMIL)为它们设置动画，都无法通过CSS来做到。Sara Soueidan在她的[SMIL动画指南](https://css-tricks.com/guide-svg-animations-smil/)中对此进行了介绍，

> ps：这篇文章全部通过SMIL来对SVG形变。SMIL的前途未卜（译者注：chrome已经不推荐使用），如果您对形变动画很感兴趣，我建议你使用GreenSock的MorphSVG插件，它不需要用到SMIL，而且功能更强大，因为它进行任意形变而不用考虑锚点数量、位置、形状类型已经兼容性问题。
<!-- more -->
> 再ps：Chrome已开始支持通过CSS来对svg进行形变，可参考[此demo](https://codepen.io/chriscoyier/pen/NRwANp)。但是，它比SMIL限制更大，因为它目前只支持Chrome并且必须得是需要具有相同点数的path。当然和所有SVG一样，也没有硬件加速。

**重要的前提：形状需要具有相同数量的点**  
否则，动画将失效，也不会对原形状产生任何影响。

很难通过d属性（path）或points属性（polygon/polyline）看出某形状有多少个点，不过通过矢量编辑器可以比较容易地查看，如Adobe Illustrator或Inkscape。

**1. 从最复杂的形状开始**

我将在这个示例中完成 五角星 到 对勾 的形变。五角星略微复杂：

![](/images/svg_shape_morphing_1.png)

复制一份该SVG，用于绘制下一个形状。

**2. 使用相同的点制作下一个形状。**

拖曳这些点，直到获得下一个形状。

![](/images/svg_shape_morphing_2.gif)

![](/images/svg_shape_morphing_3.png)

**3. 在SVG上填入起始形状**

```xml
<svg viewBox="0 0 194.6 185.1">
  <polygon fill="#FFD41D" points=" ... shape 1 points ... ">

  </polygon>
</svg>
```

**4.  把下一个形状添加到animation属性**

```xml
<svg viewBox="0 0 194.6 185.1">
  <polygon fill="#FFD41D" points=" ... shape 1 points ... ">
    <animate attributeName="points" dur="500ms" to=" ... shape 2 points ... " />
  </polygon>
</svg>
```

该动画会立即运行，因此我们需要做些修改

**5. 根据需要触发动画**

只要所有事件都在SVG本身内发生，SMIL就有能力处理诸如单击和悬停之类的交互。例如，您可以在单击动画时开始动画，例如：

```xml
<polygon id="shape" points=" ... shape 1 points ... ">

  <animate begin="shape.click" attributeName="points" dur="500ms" to=" ... shape 2 points ..." />

</polygon>
```

但是如果我们想在svg以外控制这个动画，需要先给动画指定一个ID，然后禁止其自动运行：

```xml
<animate id="animation-to-check" begin="indefinite" ... />
```

这样就可以获取对该动画的引用，在合适的时候开始播放：

```javascript
animationToCheck = document.getElementById("animation-to-check");

// run this on a click or whenever you want
animationToCheck.beginElement();
```

你也可以据此做出酷炫的图表：

![](/images/svg_shape_morphing_4.gif)

Demo：[https://codepen.io/chriscoyier/pen/DpFfE](https://codepen.io/chriscoyier/pen/DpFfE)

> 原文地址：[https://css-tricks.com/svg-shape-morphing-works/](https://css-tricks.com/svg-shape-morphing-works/) ，作者：Chris Coyier