---
title: 前端实现旗帜飘动效果系列(Ⅴ)：pixi.js实现
date: 2021-03-03 09:56:00
categories:
  - [技术, 前端]
tags:
  - Pixi
---

时隔两年，继续完成这个系列，现在回顾一下两年前的这篇文章 [前端实现旗帜飘动效果系列 (Ⅳ)：webgl实现](https://my.oschina.net/codingDog/blog/1839100) ，发现自己当初对webgl的理解不透彻，产生了很多纰漏，也走了不少歪路，实际上使用shader有更方便的实现方法，新的思路不再需要做复杂的仿射，只需通过简单的三角函数控制片元着色器的采样位置即可。

核心是[pixi](https://github.com/pixijs/pixi.js)过滤器PIXI.Filter以及片元着色器。

① PIXI.Filter类可以忽略顶点着色器，因为pixi.js内置了一套默认的顶点着色器，如果传入空，就是用该着色器模板（pixi v5版）：
<!-- more -->
```cpp
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
```

**aVertexPosition** 是归一化后过滤区域的坐标

**vTextureCoord** 是归一化后贴图的坐标

**aVertexPosition * outputFrame.zw** 过滤器区域的坐标，单位是像素，但是原点是区域左上角而非屏幕左上角

**vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy** 表示屏幕的坐标，单位是像素

② PIXI.Filter 如果不传入片元着色器，则使用下面的着色器模板：

```cpp
varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void){
   gl_FragColor = texture2D(uSampler, vTextureCoord);
}
```

**vTextureCoord **是从顶点着色器传入的归一化后贴图的坐标

这里我们不能使用默认，需要对它进行修改：

```cpp
varying vec2 vTextureCoord;// 区间[0,1]

uniform sampler2D uSampler;

uniform float time;
uniform float period;// 周期
uniform float velocity;// 波速
uniform float amplitude;// 最大振幅
uniform float brightness;// 高光亮度

float PI = 3.14159;

void main(void){
  float v = sin((vTextureCoord.x - time * velocity) * 2.0 * PI * period);
  vec4 color = texture2D(uSampler, vTextureCoord + vec2(0.0, v * amplitude * vTextureCoord.x));

  if (color.a > 0.0) {
    // 取x正方向+0.001，获取函数单调性
    float delta = sin((vTextureCoord.x + 0.001 - time * velocity) * 2.0 * PI * period) - v;
    if (delta < 0.0) {
      color = mix(color, vec4(1.0), -delta * brightness);
    }
  }
  gl_FragColor = color;
}
```

**v** 是根据横坐标，以及传入的周期计算出来的正弦波形

**texture2D(uSampler, vTextureCoord + vec2(0.0, v * amplitude * vTextureCoord.x))** 中乘以**vTextureCoord.x**是为了让振幅根据横坐标递增

**delta** 是取x轴正方向+0.001位置的函数值，获取函数在该位置的单调性

**mix(color, vec4(1.0), -delta * brightness)** 通过mix函数，以brightness入参把原色值与白色混合

为了调试方便，我添加了[dat.gui](https://github.com/dataarts/dat.gui)插件，最终效果如图：

![](/images/pixi_flag.gif)

如果本文对您有帮助还请点个赞😁

![](/images/hand.webp)[完整代码戳这里](https://github.com/face2ass/blog-source-host/tree/master/%E5%89%8D%E7%AB%AF%E5%AE%9E%E7%8E%B0%E6%97%97%E5%B8%9C%E9%A3%98%E5%8A%A8%E6%95%88%E6%9E%9C%E7%B3%BB%E5%88%97/pixi%E5%AE%9E%E7%8E%B0)

![](/images/hand.webp)[在线演示1](https://blog.omgfaq.com/example/%E5%89%8D%E7%AB%AF%E5%AE%9E%E7%8E%B0%E6%97%97%E5%B8%9C%E9%A3%98%E5%8A%A8%E6%95%88%E6%9E%9C%E7%B3%BB%E5%88%97/pixi%E5%AE%9E%E7%8E%B0/index.html)、[在线演示2](https://codepen.io/oj8kay/pen/vYyjwGv)

**目录指引：**

-   [前端实现旗帜飘动效果系列 (Ⅰ)：dom+css实现](https://my.oschina.net/codingDog/blog/1839097)
-   [前端实现旗帜飘动效果系列 (Ⅱ)：canvas2D实现（1）](https://my.oschina.net/codingDog/blog/1839098)
-   [前端实现旗帜飘动效果系列 (Ⅲ)：canvas2D实现（2）](https://my.oschina.net/codingDog/blog/1839099)
-   [前端实现旗帜飘动效果系列 (Ⅳ)：webgl实现](https://my.oschina.net/codingDog/blog/1839100)
-   [前端实现旗帜飘动效果系列 (Ⅴ)：pixi.js实现](https://my.oschina.net/codingDog/blog/4968573)