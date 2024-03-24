---
title: PixiJS+自定义Shader实现不规则图片扫光效果
date: 2021-05-12 18:01:00
categories:
  - [技术, 前端]
tags:
  - PixiJS
---

> 本来打算用原生WebGL来实现，但是水平有限，关于WebGL能讲的干货并不多，而且繁琐的准备工作对没有了解过的小伙伴也过于枯燥乏味，于是干脆用已经封装好大部分底层细节的PixiJS来实现了。

相信很多前端在做一些活动页面的时候都碰到过扫光效果的需求，有很多dom+css的奇技淫巧可以做到，比如
<!-- more -->
①直接用一个光照图片从原图上飞过，用加了overflow:hidden 的元素限制显示区域。
②把一张已经渲染出光照的图片盖在原图上，通过css的clip方法来裁剪出光照区域。
③简单粗暴地使用 序列帧/gif/视频 来完成动画。
④使用css的filter滤镜来添加高光。

当然基于①、②、③的原理，在canvas2D上也能方便地实现个功能。

虽然，但是，精zuan益niu求jiao精jian的我肯定不能满足于这些小打小闹的实现方式，图像处理自然shader就可以排上用场了。

js相关逻辑很简单：

```javascript
const stats = new Stats()
document.body.appendChild(stats.domElement)

let pageWidth = 0
let pageHeight = 0

const $canvas = document.querySelector('canvas')
const renderer = new PIXI.Renderer({
  view: $canvas,
  width: pageWidth,
  height: pageHeight,
  transparent: true,
  autoDensity: true,
  antialias: true
})

let uniforms = null
const stage = new PIXI.Container()
stage.name = 'stage'
const sprite = new PIXI.Sprite()
sprite.name = 'sprite'
sprite.anchor.set(0.5, 0.5)
sprite.position.set(0, 0)
stage.addChild(sprite)

let pauseAt = 0
const ticker = new PIXI.Ticker()
const loop = function () {
  stats.begin() // 性能监控
  // 移动光线
  if (uniforms) {
    if (uniforms.offsetX >= 2.3) {
      uniforms.offsetX = 0
      pauseAt = performance.now()
    }
    else if (!pauseAt || performance.now() - pauseAt > 1000) {
      uniforms.offsetX += 0.01
      pauseAt = 0
    }
  }
  renderer.render(stage)
  stats.end()
}

ticker.add(loop)

const img = 'pyro.png'
const loader = new PIXI.Loader()
loader.add([img])
loader.onComplete.add(async () => {
  // 获取材质
  sprite.texture = loader.resources[img].texture
  // 获取片元着色器代码
  const res = await fetch('./fragmentShader.frag')
  const fragStr = await res.text()
  // 添加 uniforms 变量
  uniforms = { offsetX: 0.0, size: [sprite.width, sprite.height] }
  // 使用默认顶点着色器来创建过滤器
  const filter = new PIXI.Filter(null, fragStr, uniforms)
  sprite.filters = [filter]
  // 开始动画循环
  ticker.start()
})
loader.load()

const onResize = (e) => {
  pageWidth = document.body.clientWidth
  pageHeight = document.body.clientHeight
  sprite.position.set(pageWidth * 0.5, pageHeight * 0.5)
  renderer.resize(pageWidth, pageHeight)
}

onResize()

window.onresize = onResize
```

需要提到的几点：

① pauseAt是为了让两次扫光的周期间隔一段时间，我这里是1秒

② 传入Filter的 uniforms.size 属性是为了获取正确的采样坐标。PixiJS在片元着色器中提供的内置varying变量vTextureCoord 使用的是 input coords，而不是 filter coords。即Filter的贴图尺寸是2的幂，比原贴图要大。 这里是默认顶点着色器的[源码](https://github.com/pixijs/pixi.js/blob/dev/packages/core/src/filters/defaultFilter.vert)，可以看到它传递vTextureCoord前是如何计算出来的。

这是片元着色器的代码：

```cpp
varying vec2 vTextureCoord;
uniform vec2 inputPixel;
uniform sampler2D uSampler;
uniform vec2 size;
uniform float offsetX; // 光束偏移距离（归一化）

void main(void)
{
  vec2 uv = vTextureCoord.xy * inputPixel.xy / size.xy;
  vec4 color = texture2D(uSampler, vTextureCoord);
  float y = uv.y;
  float x = uv.x - offsetX;
  if (color.a >= 1.0) {
    // 一粗一细两束光线
    if ((y < -x && y > -x - 0.1) || (y < -x - 0.2 && y > -x - 0.25)){
      color = mix(color, vec4(1.0), 0.5);
    }
  }
  gl_FragColor = color;
}
```

① **vec2 normalizedCoords = vTextureCoord.xy * inputPixel.xy / size.xy;** 用于把过滤器贴图缩放到原贴图的尺寸内；

② 这里画了一粗一细两束光线，分别是 **y=-x** 与 **y=-x-0.1** 两个函数图围起来的区域，和 **y=-x-0.3** 与 **y=-x-0.25** 两个函数图围起来的区域；

③ mix函数的原型是 **genType mix (genType x, genType y, genType a)**，返回的结果是线性混合的x和y，即 x*(1−a)+y*a，这里我以0.5的比例混合

最终效果如下：

![](/images/pixi_shader_1.gif)

![](/images/hand.webp)[完整代码戳这里](https://gitee.com/kaysama/blog-source-host/tree/master/PixiJS+%E8%87%AA%E5%AE%9A%E4%B9%89Shader%E5%AE%9E%E7%8E%B0%E5%9B%BE%E7%89%87%E6%89%AB%E5%85%89%E6%95%88%E6%9E%9C)

![](/images/hand.webp)[在线演示1](http://kaysama.gitee.io/blog-source-host/PixiJS+%E8%87%AA%E5%AE%9A%E4%B9%89Shader%E5%AE%9E%E7%8E%B0%E5%9B%BE%E7%89%87%E6%89%AB%E5%85%89%E6%95%88%E6%9E%9C/) 、[在线演示2](https://codepen.io/oj8kay/pen/ZEeQOQb)