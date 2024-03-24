---
title: css变量实现滚动条控制动画
date: 2020-07-04 21:12:00
categories:
  - [技术, 前端]
tags:
  - Css
---

原理：

① 定义一个数组，数组里面包含每张图片的引用以及它们进入、进入完成、离开、完成离开时的百分比

② 监听页面滚动，算出当前的滚动进度

③ 遍历数组，根据当前进度修改图片的状态，修改图片的--progress属性值
<!-- more -->
```javascript
for (const { ele, inEnter, inLeave, outEnter, outLeave } of animeList) {
  if (progress >= outLeave) {
    ele.className = 'out-leave'
    ele.style.setProperty('--progress', 0)
  }
  else if (progress >= outEnter) {
    ele.className = 'out-enter'
    ele.style.setProperty('--progress', (progress - outEnter) / (outLeave - outEnter))
  }
  else if (progress >= inLeave) {
    ele.className = 'in-leave'
    ele.style.setProperty('--progress', (progress - inLeave) / (outEnter - inLeave))
  }
  else if (progress >= inEnter) {
    ele.className = 'in-enter'
    ele.style.setProperty('--progress', (progress - inEnter) / (inLeave - inEnter))
  }
  else {
    ele.className = ''
    ele.style.setProperty('--progress', 1)
  }
}
```

④ 样式表里设置每张图片的在每个状态（in-enter、in-leave、out-enter、out-leave）的位置和透明度，比如：

```scss
#hair-1-1 {
  transform: translate(-86px, calc(-138px - 280px));
  opacity: 0;

  &.in-enter {
    transform: translate(-86px, calc(-138px - 280px * (1 - var(--progress))));
    opacity: calc(var(--progress) * 1.5);
  }

  &.in-leave {
    transform: translate(-86px, -138px);
    opacity: 1;
  }

  &.out-enter {
    transform: translate(-86px, -138px);
    opacity: calc(1 - var(--progress));
  }

  &.out-leave {
    transform: translate(-86px, -138px);
    opacity: 0;
  }
}
```

![](/images/scroll_anime.gif)

css变量的兼容性：[https://caniuse.com/css-variables](https://caniuse.com/css-variables)

![](/images/hand.webp)[完整代码戳这里](https://gitee.com/kaysama/blog-source-host/tree/master/css%E5%8F%98%E9%87%8F%E5%AE%9E%E7%8E%B0%E6%BB%9A%E5%8A%A8%E6%9D%A1%E6%8E%A7%E5%88%B6%E5%8A%A8%E7%94%BB)

![](/images/hand.webp)[在线演示1](https://kaysama.gitee.io/blog-source-host/css%E5%8F%98%E9%87%8F%E5%AE%9E%E7%8E%B0%E6%BB%9A%E5%8A%A8%E6%9D%A1%E6%8E%A7%E5%88%B6%E5%8A%A8%E7%94%BB/)、[在线演示2](https://codepen.io/oj8kay/pen/WNdQrWP)