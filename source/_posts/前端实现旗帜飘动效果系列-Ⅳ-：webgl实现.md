---
title: 前端实现旗帜飘动效果系列(Ⅳ)：webgl实现
date: 2018-07-03 04:42:00
categories:
  - [技术, 前端]
tags:
  - WebGL
---

继续填坑，本文会稍微提一些webgl的基础，不会做过多介绍，看官们请先准备要一定的基础知识。
webgl要实现前面的例子方式有很多，比如
给一个矩形平面添加多个顶点，然后在顶点着色器中，在xy平面上移动顶点位置；
或者移动顶点的z分量，再左乘视图矩阵；
或者只使用四个顶点来创建矩形，然后在片元着色器中对uv进行偏移等等。
我这次只讲第一种，下面几个方法玩个坑以后在填吧~<!-- more -->
这里是html：

```html
<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <title>wave flag by webgl</title>
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

        #flag-canvas {
            position: absolute;
            top: 50%;
            left: 50%;
            transform-origin: center;
            transform: translate3d(-50%, -50%, 0);
        }
    </style>
</head>
<body>
<canvas id="flag-canvas">
    你的浏览器不支持html5
</canvas>
<script src="./shaders.js"></script>
<script src="./flag.js"></script>
</body>
</html>
```

flag.js是核心代码，shaders.js 是一个工具类，因为webgl是偏底层的api所以细枝末节比较多，为了核心代码的整洁，所以单独抽取出来了。下面稍微做下解释：

```javascript
/**
 * shader 相关工具方法
 */
var ShaderUtil = {
  /**
   * 创建着色器
   * @param gl
   * @param source 着色器代码
   * @param type 着色器类型
   */
  createShader: function (gl, source, type) {
    // 创建Shader对象
    var shader = gl.createShader(type)
    // 传入shader代码
    gl.shaderSource(shader, source)
    // 编译shader
    gl.compileShader(shader)
    // 获取编译结果
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      // 打印错误信息
      console.error('Compile shader source fail:\n\n' + source, '\n\n=====error log======\n\n', gl.getShaderInfoLog(shader))
      // 编译失败则删除着色器对象
      gl.deleteShader(shader)
      return null
    }

    return shader

  },

  /**
   * 创建 program
   * @param gl
   * @param vertexShader 顶点着色器对象
   * @param fragmentShader 片元着色器对象
   * @param validate 是否需要语法校验（开发时启用）
   */
  createProgram: function (gl, vertexShader, fragmentShader, validate) {

    // 创建空的 program 对象
    var program = gl.createProgram()
    // 将 顶点着色器对象 附着到 program
    gl.attachShader(program, vertexShader)
    // 将 片元着色器对象 附着到 program
    gl.attachShader(program, fragmentShader)
    // 链接 program 和已附着的 shader
    gl.linkProgram(program)

    // 获取链接状态
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      // 打印错误日志
      console.error('Creating shader program fail:\n', gl.getProgramInfoLog(program))
      // 链接失败则删除着色器对象
      gl.deleteProgram(program)
      return null
    }

    // 语法校验
    if (validate) {
      gl.validateProgram(program)
      if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('Error validating shader program:\n', gl.getProgramInfoLog(program))
        gl.deleteProgram(program)
        return null
      }
    }

    // 解除并删除shader
    gl.detachShader(program, vertexShader)
    gl.detachShader(program, fragmentShader)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)

    return program
  },

  /**
   * 通过顶点和片元着色器的源码创建program对象
   */
  createProgramFromSrc: function (gl, vertexShaderSrc, fragmentShaderSrc, validate) {
    var vShader = ShaderUtil.createShader(gl, vertexShaderSrc, gl.VERTEX_SHADER)
    var fShader = ShaderUtil.createShader(gl, fragmentShaderSrc, gl.FRAGMENT_SHADER)
    if (!vShader || !fShader) {
      // 任意一个创建失败就删除shader
      gl.deleteShader(vShader)
      gl.deleteShader(fShader)
      return null
    }
    return ShaderUtil.createProgram(
      gl,
      vShader,
      fShader,
      validate
    )
  },

  getSrcFromUrl: function (url, callback) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onreadystatechange = function () {
      //0：未初始化，还没有调用 open() 方法。
      //1：请求中，已调用 send() 方法，正在发送请求。
      //2：收到响应
      //3：正在解析响应内容。
      //4：内容解析完毕。
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          callback(xhr.responseText)
        }
      }
    }
    xhr.send()
  }
}

/**
 * 自定义shaders对象（包括顶点、片元着色器）
 * @param gl
 * @param vShaderSrc
 * @param fShaderSrc
 * @constructor
 */
var Shaders = function (gl, vShaderSrc, fShaderSrc) {
  var program = ShaderUtil.createProgramFromSrc(gl, vShaderSrc, fShaderSrc, true)

  if (program) {
    this.program = program
    this.gl = gl
    gl.useProgram(this.program)
  }

  /**
   * @return {Shaders}
   */
  this.activate = function () {
    gl.useProgram(program)
    return this
  }

  /**
   * @return {Shaders}
   */
  this.deactivate = function () {
    gl.useProgram(null)
    return this
  }

  /**
   * function helps clean up resources when shader is no longer needed.
   */
  this.dispose = function () {
    // 如果当前program激活状态则禁用
    if (gl.getParameter(gl.CURRENT_PROGRAM === program)) {
      this.deactivate()
    }
    gl.deleteProgram(program)
  }

}
```

基本上要运行一断完整的的webgl/opengl着色器代码流程主要包含这些：

glCreateShader（创建着色器） -> glShaderSource（载入着色器代码） -> glCompileShader（编译着色器） -> glCreateProgram（创建程序对象） -> glAttachShader（将着色器附着进来） -> glLinkProgram（把程序对象和所有被附着的着色器链接起来） -> glDetachShader（解除着色器） -> glDeleteShader（删除着色器）

一般来说shader在link完毕后使命就结束了，应该尽早地解除（glDetachShader）并删除（glDeleteShader）来释放内存，如果没有解除shader，即使把它删了它也仍然会附着在 program 上，直到被detach。

每一步骤的细节我都已经在代码里添加了注释，请自行阅读。

下面把 shaders.js 里的代码拆分出来讲解。

#### 首先需要载入着色器的代码

```javascript
ShaderUtil.getSrcFromUrl('vertexShader.vert', function (src) {
  vShaderSrc = src
  onAllLoaded()
})
ShaderUtil.getSrcFromUrl('fragmentShader.frag', function (src) {
  fShaderSrc = src
  onAllLoaded()
})

function onAllLoaded () {
  if (!vShaderSrc || !fShaderSrc) {
    return false
  }
  // 全部载入完后继续 ....
  
}
```

还有一种常用的方式是直接把着色器代码嵌入html或js。总之，着色器代码就是一大段字符串，用什么方式拿到都行，我使用xhr来引入主要是因为一些编辑器提供了shader语法高亮，建议使用这种方式。

下一步在onAllLoaded里创建Image对象来载入我们的纹理图像。

载入完成后，创建shander.js文件里定义的Shader对象，将gl对象和着色器代码作为参数传入，然后通过shader对象的program属性来获取我们着色器里定义的attribute和uniform变量的存储地址。

#### 接着创建顶点缓冲区：

```javascript
...

createVerticesBuffer()
// a_Position指向缓冲区对象
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, eleSize * 2, 0)
// 允许a_Position访问缓冲区
gl.enableVertexAttribArray(aPosition)

...


/**
 * 创建顶点缓冲区
 */
function createVerticesBuffer () {
  var vertices = []
  var x
  for (var i = 0; i <= imgWidth; i++) {
    x = -1 + 2 * i / imgWidth  // webgl 坐标 -1 -> 1
    vertices.push(x, -1, x, 1)  // 每列的上下顶点坐标
  }
  vertexCount = 2 * (imgWidth + 1)
  vertices = new Float32Array(vertices)
  eleSize = vertices.BYTES_PER_ELEMENT

  var buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)
  return buffer
}
```

① 创建 imageWidth + 1个顶点，由于webgl的坐标是从-1~ 1，所以需要把 0 ~ imageWidth投影到 -1 ~ 1。  
canvas坐标与webgl坐标的对应关系：

![](/images/webgl_flag_1.jpg)

② 基本上，缓冲区创建有一个固定的流程，如下：

1、创建缓冲区对象——**gl.createBuffer()**

2、绑定缓冲区对象——**gl.bindBuffer(target, buffer)**

target可以是gl.ARRAY\_BUFFER（表示缓冲区中是顶点的数据）或者是ELEMENT\_ARRAY_BUFFER（表示缓冲区中是顶点的索引）

buffer是刚刚创建的缓冲区对象的引用

3、向缓冲区中写入数据——**gl.bufferData(target, data, usage)**

target同bindBuffer时的target，因为只能通过target向缓冲区写入数据，所以必须先绑定缓冲区

data是需要写入的类型化数组

usage是指缓冲类型，可以是GL\_STREAM\_DRAW , GL\_STATIC\_DRAW , GL\_DYNAMIC\_DRAW，该参数作用是帮助webgl优化操作，即使传入错误的值也不会中断程序

4、将缓冲区对象分配给attribute变量——**gl.vertexAttribPointer(location, size, type, normalized, stride, offset)**

location：变量的存储地址

size：每个顶点分量个数，若个数比变量的数量少，则按照gl.vertexAttrib\[1234\]f的规则来补全

type：指定数据类型

normalized：boolean类型，表示是否需要将非浮点类型数据归一化到\[-1, 1\] 区间

stride：相邻两个顶点之间的字节数，默认0 

offset：数据的偏移量，即变量开始存储的位置（单位字节），默认0

5、开启attribute变量——**gl.enableVertexAttribArray(location)**

#### 创建纹理对象：

```javascript
...

createTexture()
var uSampler = gl.getUniformLocation(shader.program, 'u_Sampler')
// 将0号纹理传给取色器变量
gl.uniform1i(uSampler, 0)

...

/**
 * 创建纹理
 */
function createTexture () {
  // 创建纹理对象
  var texture = gl.createTexture()

  // Y轴翻转
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  // 开启0号纹理单元
  gl.activeTexture(gl.TEXTURE0)
  // 绑定纹理对象
  gl.bindTexture(gl.TEXTURE_2D, texture)
  // 设置纹理参数
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  // 传入纹理图像
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
}
```

纹理映射比较复杂但是步骤也是比较固定：

1、将纹理坐标写入缓冲区（可选步骤，如果需要，一般是和需要绑定的顶点写入同一个缓冲区）

2、创建纹理对象——gl.createTexture

3、获取片元着色器中声明的取色器变量（uniform类型）的存储位置

4、使用Image对象加载图片

5、在图片加载完成后配置纹理——

①**对纹理对象进行Y轴反转**（原因见上图）：gl.pixelStorei(pname, param);（pname可以是gl.UNPACK\_FLIP\_Y\_WEBGL或gl.UNPACK\_PREMULTIPLY\_ALPHA\_WEBGL）

②**激活纹理单元**：gl.activeTexture(texUnit);（webGL默认至少支持8个纹理单元，可以是gl.TEXTURE0~7）

③**开启纹理对象并绑定到target上**：gl.bindTexture(target, texture);（webGL只能通过纹理单元操作纹理对象，所以必须先绑定）

④**设置纹理映射到图形上的方式**：gl.texParameteri(target, pname, param);

⑤**设置纹理图片**：gl.texImage2D(gl.TEXTURE\_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED\_BYTE, image);

⑥**将纹理图像分配给纹理对象**：gl.texImage2D(target, level, internalformat, format, type, image);（）

⑦**将纹理单元传递给着色器中的取色器变量**：gl.uniform1i(u_Sampler, 0);

#### 根据顶点绘制图形：

gl.drawArrays(mode, first, count)  
mode：绘制的方式  
first：指定从哪个顶点开始绘制  
count：指定绘制需要用到的顶点个数（着色器会执行count次，每次处理1个顶点）

#### 顶点着色器：

```cpp
uniform float u_Distance;
attribute vec2 a_Position;
varying vec2 v_UV;
varying float v_Slope;

float PI = 3.14159;
float scale = 0.8;

void main() {

  float x = a_Position.x;
  float y = a_Position.y;

  float amplitude = 1.0 - scale; // 振幅
  float period = 2.0;  // 周期
  float waveLength = 2.0 * scale;

  v_UV = (mat3(0.625,0,0, 0,0.625,0, 0.5,0.5,1) * vec3(x, y, 1.0)).xy;
  y += amplitude * ( (x - (-scale)) / waveLength) * sin(2.0 * PI * (x - u_Distance));

  float x2 = x - 0.001;
  float y2 = a_Position.y + amplitude * ( (x2 - (-scale)) / waveLength) * sin(2.0 * PI * (x2 - u_Distance));

  v_Slope = y - y2;
  gl_Position = vec4(vec2(x, y), 0.0, 1.0);
}
```

#### 片元着色器：

```cpp
precision mediump float;
uniform sampler2D u_Sampler;
varying vec2 v_UV;
varying float v_Slope;

void main() {
  vec4 color = texture2D( u_Sampler, v_UV );
  if( v_Slope > 0.0 ) {
    color = mix( color, vec4(0.0, 0.0, 0.0, 1.0), v_Slope * 300.0 );
  }
  if( v_Slope < 0.0 ) {
    color = mix( color, vec4(1.0), abs(v_Slope) * 300.0 );
  }
  if(v_UV.x < 0.0 || v_UV.x > 1.0 || v_UV.y < 0.0 || v_UV.y > 1.0) {
    color.a = 0.0;
  }
  gl_FragColor = color;
}
```

着色器的语法类似c，我简单讲一下里面的逻辑，原理基本上和上一讲canvas2D的实现思路类似，而且逐“像素”的手段更是webgl拿手绝活。

① 由于webgl的缓冲区在每一次玩后都会清空，所以不能像之前那样保留lastY，我的做法是取获取0.001个单位前的x坐标，然后算出斜率v_Slope，传给片元着色器。

② 坐标系统问题：目前我们的代码里面已经涉及了好几套坐标系统，如

窗口、canvas、图片的坐标系统的原点都在左上角且y轴方向向下；

webgl、纹理（也叫uv或st）的坐标系统y轴向上，其中webgl的原点在中间，范围是\[-1,1\]，纹理的原点在左下角，范围是\[0, 1\]。

各个顶点坐标在创建缓冲区的时候是占满canvas的，假设纹理坐标中有点 P(u, v)，经过仿射变换后在webgl坐标中为点Q(x, y)，则有

Q = mat3(2,0,0,  0,2,0,   0,0,1) * mat3(1,0,0,  0,1,0,   -0.5,-0.5,1) * P

= mat3(2,0,0,  0,2,0,  -1,-1,1) * P

可得：

P = (mat3(2,0,0,  0,2,0,  -1,-1,1)^-1) * Q

= mat3(0.5,0,0,  0,0.5,0,   0.5,0.5,1) * Q

由于我们需要移动顶点但是不能超出canvas的可视区，所以需要对顶点位置缩放。

假设缩放比率为n，则有

Q = mat3(2n,0,0,  0,2n,0,   0,0,1) * mat3(1,0,0,  0,1,0,   -0.5,-0.5,1) * P

可以得到顶点到纹理的变化矩阵为mat3(2n,0,-n,  0,2n,-n,   0,0,1)的逆矩阵，然后去掉齐次坐标。

![](/images/hand.webp)[完整代码戳这里](https://gitee.com/kaysama/blog-source-host/tree/master/%E5%89%8D%E7%AB%AF%E5%AE%9E%E7%8E%B0%E6%97%97%E5%B8%9C%E9%A3%98%E5%8A%A8%E6%95%88%E6%9E%9C%E7%B3%BB%E5%88%97/webgl%E5%AE%9E%E7%8E%B0)

![](/images/hand.webp)[Demo1](http://kaysama.gitee.io/blog-source-host/%E5%89%8D%E7%AB%AF%E5%AE%9E%E7%8E%B0%E6%97%97%E5%B8%9C%E9%A3%98%E5%8A%A8%E6%95%88%E6%9E%9C%E7%B3%BB%E5%88%97/webgl%E5%AE%9E%E7%8E%B0/)

![](/images/hand.webp)Demo2：See the Pen [flag waving by webgl](https://codepen.io/oj8kay/pen/PBZjpe/) by Kay ([@oj8kay](https://codepen.io/oj8kay)) on [CodePen](https://codepen.io).

**目录指引：**

-   [前端实现旗帜飘动效果系列 (Ⅰ)：dom+css实现](https://my.oschina.net/codingDog/blog/1839097)
-   [前端实现旗帜飘动效果系列 (Ⅱ)：canvas2D实现（1）](https://my.oschina.net/codingDog/blog/1839098)
-   [前端实现旗帜飘动效果系列 (Ⅲ)：canvas2D实现（2）](https://my.oschina.net/codingDog/blog/1839099)
-   [前端实现旗帜飘动效果系列 (Ⅳ)：webgl实现](https://my.oschina.net/codingDog/blog/1839100)
-   [前端实现旗帜飘动效果系列 (Ⅴ)：pixi.js实现](https://my.oschina.net/codingDog/blog/4968573)