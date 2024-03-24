---
title: 原生js+WebGL实现3D图片效果
date: 2020-02-08 21:55:00
categories:
  - [技术, 前端]
tags:
  - WebGL
---

海外党玩F***book的时候可能有接触过这个酷炫的3d图片效果：

![](/images/webgl_3d_1.gif)

只要通过客户端的这个入口——

![](/images/webgl_3d_2.jpg)

或者网页版的这个入口——

![](/images/webgl_3d_3.png)

就能生成。不知道咋玩的请参考官方的[帮助手册](https://www.facebook.com/help/414295416095269)
。今天就教大家手撸出一个这样的功能，不要担心，所有代码加起来不超过200行并且不使用任何第三方库。虽然canvas2D也能做出这个效果，但是基于这种像素级操作的性能考虑，WebGL显然是更好的方案，我前面的有些教程也用到了WebGL，核心的API我就不做过多介绍，直接详细地注释在最终的代码里面了，代码仍然使用WebGL
1.0版本。
<!-- more -->
老规矩，还是先介绍原理，推荐有想法的读者略过教程，自己直接根据原理去撸出来，因为我还是秉持着话痨的特色，想到什么说什么，教程中掺杂一些自己的干货，对一些人来说可能过于啰嗦。夹，哈吉咩马修！（工地日语

_非死不可_客户端在上传图片的时候你有两种可选操作：

一种是上传带深度通道的图片，即图片的每个像素是RGB-D格式，如果你是苹果手机可能在相机里会有人像模式或景深模式，拍出来的照片在本地是heic格式的文件，一般这种就是带深度信息的（有兴趣的可以去维基了解下这种heif编码的图片，可以做到很多神奇的事）。通常有TOF镜头的手机都能拍出这种图片，但是不知道为啥F***book似乎只支持三星系列和自己发布的安卓机？

另一种办法就是上传两张图，一张普通的RGB像素的原图，一张灰度图，只要灰度图的文件名和原图一样，加上\_depth的后缀即可。比如666.jpg和666\_depth.jpg。这也是F***book网页版唯一支持的方式。这个灰度图的门道可就多了，也是我们后面代码实现的核心。开发过游戏的一定知道深度贴图，或者阴影贴图/光照贴图，其实都是类似的玩意，这种贴图存储了原图每个像素的深度信息，贴图的每个像素的R值就是原图的z轴偏移，因为一般深度贴图的R、G、B通道的值相同，所以表现出来的就是一张灰度图。

如何获取深度贴图呢？如果你有heic格式的带深度信息的照片，可以用PS抽取出z通道的信息（windows上的PS不支持），如果你啥都没有，我会在下个教程尝试“教”你一下如何在PS中绘制出深度贴图，或者使用谷歌提供的一个人工智能程序来生成，我也会写入下个教程，亲测匹配程度还是挺高的~

具体是怎么产生3D效果的呢？深度贴图中，颜色越浅（值越小）表示深度约低，通过深度贴图的深度值来对原图的采样位置进行偏移，比如当你把贴图往左偏移，然后使用偏移的距离乘上原图的某个坐标在贴图上的深度值得到的结果来对原图进行采样，就会得到不同的点在不同的深度偏移的大小不同的情况，距离越近的偏移越小，距离越远的偏移越大，是不是很符合我们生活中的常识？事实上，抛弃主观感知，从底层角度考虑，最终展现出来的效果其实就是一部分的像素点被压缩了，一部分的像素点被拉伸了。不知道大家有没有用过live2D或者Spine、龙骨等工具做出来的动画，就是这种：

![](/images/webgl_3d_4.gif)

刚刚所说的底层变化是不是和这种网格动画很像，其实都是对图片的变形来达到3D效果，就单张图的变化而言，他们的唯一区别就是蒙皮动画是手动key帧（或者是骨骼绑定——这个以后有机会谈谈），而3D图片是通过深度贴图自动生成。

废话终于说完，下面开始编码，先设置一下基础样式：

```css
* {
    margin: 0;
    padding: 0;
}

body {
    width: 100vw;
    height: 100vh;
    position: relative;
    background-color: #000;
}

canvas {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
}
```

然后引入glMatrix函数库用于操作矩阵（虽然，之前说好的不依赖第三方库，不过坐标换算确实挺烦~免得程序太长还有写一堆注释~
其实换算也不难，看过上一篇教程的应该自己实现问题也不大~~原谅我标题党 ಠᴗಠ）

```html
<script src="./gl-matrix-min.js"></script>
```

我已经下载好了，想要消息了解这个函数库的可以去[glMatrix官网](http://glmatrix.net/)，这个库非常小，未压缩前也就100多K。

顶点着色器（shader_vertex.vert）的代码：

```cpp
attribute vec2 a_pos;
attribute vec2 a_uv;
uniform mat4 u_proj;
varying vec2 v_uv;
void main() {
  v_uv = a_uv; // 将纹理坐标传递到片元着色器
  gl_Position = u_proj * vec4(a_pos, 0.0, 1.0);
}
```

片元着色器的代码：

```cpp
precision highp float;
uniform sampler2D u_sampler;
varying vec2 v_uv;
void main() {
  gl_FragColor = texture2D(u_sampler, v_uv);
}
```

直接贴上绘制静态图的代码：

```javascript
init()

async function init() {

  const { mat4 } = glMatrix

  const PAGE_WIDTH = document.body.clientWidth
  const PAGE_HEIGHT = document.body.clientHeight
  // 设置画布宽高
  const CANVAS_WIDTH = 900
  const CANVAS_HEIGHT = 900
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_WIDTH
  canvas.height = CANVAS_HEIGHT
  document.body.appendChild(canvas)

  const gl = canvas.getContext('webgl')

  gl.viewport(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

  // 加载图片（原图和深度图尺寸一致）
  const image = new Image()
  image.src = './sennpai.jpg'
  await new Promise(resolve => image.complete ? resolve() : (image.onload = e => resolve()))

  // 若图片宽高超出限制，以类似 background-size:contain 的方式将图片缩放居中
  let ratio = 1
  if (image.height > CANVAS_HEIGHT) {
    ratio = CANVAS_HEIGHT / image.height
  }
  if (image.width * ratio > CANVAS_WIDTH) {
    ratio = CANVAS_WIDTH / image.width
  }

  const imgWidth = image.width * ratio
  const imgHeight = image.height * ratio

  // 获取顶点着色器源码
  let res = await fetch('./shader_vertex.vert', { method: 'get', })
  let shaderSrc = await res.text()
  // 创建顶点着色器
  const vs = gl.createShader(gl.VERTEX_SHADER)
  gl.shaderSource(vs, shaderSrc)
  gl.compileShader(vs)
  // 获取着色器信息
  if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
    // 打印编译失败日志
    console.error(`Error compile shader:\n${shaderSrc}\n=====error log======\n${gl.getShaderInfoLog(vs)}`)
    gl.deleteShader(vs)
    return null
  }

  // 获取片元着色器源码
  res = await fetch('./shader_fragment.frag', { method: 'get', })
  shaderSrc = await res.text()
  // 创建片元着色器
  const fs = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(fs, shaderSrc)
  gl.compileShader(fs)
  if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
    console.error(`Error compile shader:\n${shaderSrc}\n=====error log======\n${gl.getShaderInfoLog(fs)}`)
    gl.deleteShader(fs)
    return null
  }

  // 创建program
  const prg = gl.createProgram()
  gl.attachShader(prg, vs)
  gl.attachShader(prg, fs)
  gl.linkProgram(prg)
  gl.useProgram(prg)

  // 设置投影矩阵
  const projMat4 = mat4.create()
  /**
   * ortho(out, left, right, bottom, top, near, far)
   */
  mat4.ortho(projMat4, -CANVAS_WIDTH / 2, CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2, CANVAS_HEIGHT / 2, 0, 500)
  // 获取投影矩阵的地址
  const uProj = gl.getUniformLocation(prg, 'u_proj')
  // 将投影矩阵传入
  gl.uniformMatrix4fv(uProj, false, projMat4)

  // 使用顶点数组创建vbo
  const vertexList = new Float32Array([
    //    x              y        u  v
    -imgWidth / 2, imgHeight / 2, 0, 0,
    -imgWidth / 2, -imgHeight / 2, 0, 1,
    imgWidth / 2, imgHeight / 2, 1, 0,
    imgWidth / 2, -imgHeight / 2, 1, 1,
  ])
  // 获取数组每个元素的大小（用于计算步长）
  const PER_ELEMENT_SIZE = vertexList.BYTES_PER_ELEMENT
  const buffer = gl.createBuffer()
  /**
   * 绑定缓冲区
   * @param target 数据类型
   * @param buffer 缓冲区对象
   */
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  /**
   * 向缓冲区写入数据
   * @param target 数据类型
   * @param data 数据（这里是类型化数组）
   * @param usage 绘制方式（用于帮助webgl优化）
   */
  gl.bufferData(gl.ARRAY_BUFFER, vertexList, gl.STATIC_DRAW)
  // 获取顶点坐标变量在着色器中的地址
  const aPos = gl.getAttribLocation(prg, 'a_pos')
  /**
   * 将缓冲区对象分配给attribute变量
   * @param location：变量的存储地址
   * @param size：每个顶点分量个数，若个数比变量的数量少，则按照gl.vertexAttrib[1234]f的规则来补全
   * @param type：指定数据类型
   * @param normalized：是否需要归一化
   * @param stride：相邻两个顶点之间的字节数（只有一种数据则为0）
   * @param offset：数据的偏移量（单位字节,只有一种数据则为0）
   */
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, PER_ELEMENT_SIZE * 4, 0)
  // 允许aPos访问VBO
  gl.enableVertexAttribArray(aPos)
  // 获取纹理坐标变量在着色器中的地址
  const aUV = gl.getAttribLocation(prg, 'a_uv')
  gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, PER_ELEMENT_SIZE * 4, PER_ELEMENT_SIZE * 2)
  // 允许aUV访问VBO
  gl.enableVertexAttribArray(aUV)

  // 使用完后解绑VBO
  gl.bindBuffer(gl.ARRAY_BUFFER, null)

  // 创建纹理对象
  const texture = gl.createTexture()
  // 激活0号纹理单元
  gl.activeTexture(gl.TEXTURE0)
  // 绑定并开启0号纹理单元
  gl.bindTexture(gl.TEXTURE_2D, texture)
  // 指定缩小算法
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  // 指定放大算法
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  // 指定水平方向填充算法
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  // 指定垂直方向填充算法
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  /**
   * 通过0号纹理单元将图片分配给纹理对象
   * target 指定为2D纹理
   * level 金字塔纹理
   * internalFormat 图片内部格式
   * format 纹理格式（必须与internalFormat相同）
   * type 纹理数据类型
   * image 图片
   */
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  // 获取纹理对象在着色器中的地址（使用uniform，因为每个顶点操作的都是同一个纹理）
  const uSampler = gl.getUniformLocation(prg, 'u_sampler')
  // 指定从0号纹理单元获取纹理
  gl.uniform1i(uSampler, 0)

  // 渲染循环
  function loop() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT) // 清空颜色缓冲区
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    requestAnimationFrame(loop)
  }

  loop()

}
```

都是一些常规的操作，具体api的作用写入注释里就不做多解释了。

接下来把我们的深度贴图传入着色器，主要是这几个步骤：

①获取加载完成的图片对象：

```cpp
const depthImage = new Image()
depthImage.src = './sennpai_depth.jpg'
await new Promise(resolve => depthImage.complete ? resolve() : (depthImage.onload = e => resolve()))
```

因为如果浏览器如果已经缓存了图片不一定会触发onload事件。所以我们先通过complete属性来判断图片的加载状态是否为已完成。

②修改片元着色器代码，通过深度贴图对原图来进行采样：

```cpp
precision highp float;
uniform sampler2D u_sampler;
uniform sampler2D u_sampler_depth;// 深度贴图采样器
uniform vec2 u_offset;// 深度贴图的偏移
varying vec2 v_uv;
void main() {
  float depth = texture2D(u_sampler_depth, v_uv).r;// 获取深度信息
  gl_FragColor = texture2D(u_sampler, v_uv + depth * u_offset);
}
```

获取贴图的R通道的值作为深度值

③通过另一个纹理单元（如1号纹理单元）将贴图传入片元着色器：

```javascript
// 同理，创建深度贴图的纹理
const depthTexture = gl.createTexture()
// 绑定并开启1号纹理单元
gl.activeTexture(gl.TEXTURE1)
gl.bindTexture(gl.TEXTURE_2D, depthTexture)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, depthImage)
const uSamplerDepth = gl.getUniformLocation(prg, 'u_sampler_depth')
// 指定从1号纹理单元获取纹理
gl.uniform1i(uSamplerDepth, 1)
```

这时候看到最后效果没有任何变化，因为我们还没有对贴图进行偏移，u_offset默认值是vec(0.0,0.0)。

接下来可以给页面绑定mousemove事件，我这里限定了u，v最大的偏移量为0.05，把渲染循环函数放到事件回调中：

```javascript
const uOffset = gl.getUniformLocation(prg, 'u_offset')
const scale = 0.1
document.body.onmousemove = e => {
  gl.uniform2f(uOffset, scale * (e.pageX / PAGE_WIDTH - 0.5), scale * (e.pageY / PAGE_HEIGHT - 0.5))
  loop()
}

// 绘制循环
function loop() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.clear(gl.COLOR_BUFFER_BIT) // 清空颜色缓冲区
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  // requestAnimationFrame(loop)
}
```

ok，大功告成，预览一下效果图——

![](/images/webgl_3d_5.gif)

![](/images/hand.webp) [完整代码戳这里](https://gitee.com/kaysama/blog-source-host/tree/master/3D%E7%9B%B8%E7%89%87)

![](/images/hand.webp)[在线演示1](http://kaysama.gitee.io/blog-source-host/3D%E7%9B%B8%E7%89%87/index.html)，[在线演示2](http://codepen.io/oj8kay/full/JjdoORm)