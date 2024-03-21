---
title: WPS二次开发之加载项（二）：表白神器
date: 2022-10-08 16:51:00
categories:
  - [技术, 前端]
tags:
  - WPS
---

这次咱们试试在一个sheet表上画画，这里的画画不是直接插入一张图片，而使修改单元格颜色，拼出一张图片。

咱们直接在[上一篇文章](https://my.oschina.net/codingDog/blog/5581257)的demo工程上修改代码。

老规矩，先说原理。
①本地选择一张图片绘制到canvas；
②把电子表格的w行h列内的单元格设置为正方形；
③获取canvas的imageData，逐像素修改单元格的背景色。
<!-- more -->
这里有几个涉及的坑：
一是单元格正方形问题，如果直接设置RowHeight等于ColumnWidth，最终打单元格不是一个正方形，需要先设置ColumnWidth，然后获取只读属性Width，赋值给RowHeight；
二是设置单元格背景颜色，Color属性接收的是一个十进制的数字，需要把rgb转化为十进制，rgb可以视为256进制，从低到高位的一组数：r + g * 256 + b * 256 * 256；
本demo直接修改了src/components/Dialog.vue 这个文件的代码，可以覆盖运行

```html
<template>
  <div class="dialog-image">
    <label>
      选择文件
      <input type="file" id="file">
    </label>
    <canvas id="cvs"></canvas>
  </div>
</template>

<script>
export default {
  name: 'Dialog',
  data() {
  },
  mounted() {
    const $cvs = document.querySelector('#cvs')
    const pageWidth = window.innerWidth
    const pageHeight = window.innerHeight
    // const maxWidth = pageWidth // 图片不能超过窗口宽度
    // const maxHeight = pageHeight // 图片不能超过窗口高度
    const maxWidth = 200
    const maxHeight = 200
    const ctx = $cvs.getContext('2d')

    // 图片选择
    document.querySelector('#file').onchange = e=>{
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = e=>{
        const $img = new Image()
        $img.onload = e=>{
          let imgWidth = $img.width
          let imgHeight = $img.height
          let ratio = 1
          if (imgWidth > maxWidth) {
            ratio = maxWidth / imgWidth
            imgWidth = maxWidth
            imgHeight *= ratio
          }
          if (imgHeight > maxHeight) {
            ratio = maxHeight / imgHeight
            imgHeight = maxHeight
            imgWidth *= ratio
          }
          $cvs.width = imgWidth
          $cvs.height = imgHeight
          ctx.drawImage($img, 0, 0, imgWidth, imgHeight)
          this.draw2wps(ctx, imgWidth, imgHeight)
        }
        $img.src = e.target.result
      }
      reader.readAsDataURL(file)
    }
  },
  methods: {
    // 绘制canvas到wps表格
    draw2wps(ctx, cvsWidth, cvsHeight) {
      const imageData = ctx.getImageData(0, 0, cvsWidth, cvsHeight)
      const imageDataContent = imageData.data
      const size = 10
      let x
      let y
      let cell
      let r
      let g
      let b
      for (x = 0; x < cvsWidth; x++) {
        cell = wps.ActiveSheet.Cells.Item(x + 1, 1)
        cell.ColumnWidth = size
        cell.RowHeight = cell.Width
      }
      for (y = 0; y < cvsHeight; y++) {
        cell = wps.ActiveSheet.Cells.Item(1, y + 1)
        cell.ColumnWidth = size
        cell.RowHeight = cell.Width
      }
      let pos
      for (y = 0; y < cvsHeight; y++) {
        for (x = 0; x < cvsWidth; x++) {
          pos = y * cvsWidth + x
          r = imageDataContent[pos * 4]
          g = imageDataContent[pos * 4 + 1]
          b = imageDataContent[pos * 4 + 2]
          // 如果透明度小于0.5，则设为白色
          if (imageDataContent[pos * 4 + 3] < 125) {
            r = g = b = 255
          }
          const color = this.getLongColor(r, g, b)
          cell = wps.ActiveSheet.Cells.Item(y + 1, x + 1)
          // 设置背景色
          cell.Interior.Color = color
        }
      }
    },
    // 获取十进制颜色
    getLongColor(r, g, b) {
      return r + g * 256 + b * 256 * 256
    },
  },
}
</script>

<style lang="scss">
.dialog-image {
  font-size: 15px;
  min-height: 95%;

  label {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
  }

  canvas {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    z-index: 1;
  }
}
</style>

```

终端执行 wps debug开启调试，随后点击“按钮Disable”，再点击“弹对话框网页”打开图片选择窗口，效果如下

![](/images/wps.png)