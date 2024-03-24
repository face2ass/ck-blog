---
title: 原生JS实现事件委托
date: 2018-07-11 16:50:00
categories:
  - [技术, 前端]
---

事件委托（代理）是什么，有什么好处我就不多赘述了，经过jQuery时代的朋友们一定知道 live、delegate、on这些方法，他们的核心都是利用js事件的冒泡机制。如今的前端越来越依赖Vue、React、Angular等高级框架，似乎不再需要这种远古的事件机制，但是这些重型框架不是所有的场景都使用，或者有时候即使用到了它们，也会有频繁在dom上手动绑定事件的情况，总不能为了这点小功能把更重的jQuery引入进来吧。
话不多说，HERE WE GO !
假设有一个父元素（id=parent）和一个子元素（id=child），中间可能隔了几代dom，我们想把 #child 的事件冒泡到 #parent 上，可以这么做：
<!-- more -->
```javascript
const $parent = document.getElementById('parent')
const $child = document.getElementById('child')
$parent.onclick = function (e) {
  let $p = e.target.closest('#parent')
  if (!$p) return // 没找到匹配的祖先节点
  if (!$parent.contains($p)) return // 匹配到的节点不是目标的后代节点
  // 触发委托方法
}
```

① Element.closest 方法用来获取匹配特定选择器且离当前元素最近的祖先元素（也可以是当前元素本身）。如果匹配不到，则返回 null。IE不支持改方法，需要引入polyfill：

```javascript
if (!Element.prototype.matches) Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector
if (!Element.prototype.closest)
  Element.prototype.closest = function (s) {
    var el = this
    if (!document.documentElement.contains(el)) return null
    do {
      if (el.matches(s)) return el
      el = el.parentElement
    } while (el !== null)
    return null
  }
```

② Node.contains 用来判断传入的节点是否为该节点的后代节点，IE9以上均支持该方法。

那要兼容IE8怎么办？不会吧不会吧，阿sir，都0202年了，不会还有人用这款浏览器吧~

![](/images/delegation_1.gif)

就写这些了，至于封装什么的，这种太小儿科的活我就不替大家操心了