---
title: 缓动函数（EasingFunction）介绍及背后数学原理
date: 2021-06-04 17:45:00
tags:
---

[https://aaron-bird.github.io/2019/03/30/缓动函数(easing function)/](https://aaron-bird.github.io/2019/03/30/缓动函数(easing function)/)

[https://jqueryui.com/easing/](https://jqueryui.com/easing/)

# 什么是缓动函数？

缓动函数是一类数学函数，被广泛用于动画和过渡效果，以调整动画元素的速度，使其呈现出更加自然的运动。这种自然的运动模式在模拟物体在现实世界中的移动时显得尤为重要，让用户体验更加舒适和直观。在css中的transition-timing-function和animation-timing-function定义的就是缓动函数

# 常见的缓动函数

## 1\. Linear

线性缓动函数是最简单的一种，动画元素以恒定的速度运动。其数学表示为 f(t) = t，其中 t 是时间的变化，范围在 0 到 1 之间。

```javascript
function linear(t) {
  return t;
}
```

## 2\. ease-in

ease-in 函数使动画元素在开始时缓慢，然后逐渐加速。这是通过一个二次方程实现的，具体公式为 f(t) = t^2。

```javascript
function easeIn(t) {
  return t * t;
}
```

### 3\. ease-out

ease-out 缓动函数与 ease-in 相反，开始时速度较快，然后逐渐减速。它的数学表示为 f(t) = t * (2 - t)。

```javascript
function easeOut(t) {
  return t * (2 - t);
}
```

## 4\. ease-in-out

ease-in-out 缓动函数在开始和结束时缓慢，而在中间阶段加速。它是通过一个分段函数实现的，数学上表示为：

```javascript
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
```

## 5\. ease

ease 缓动函数是一个平衡了 ease-in 和 ease-out 效果的默认值。其数学表示与 ease-in-out 函数相似。

```javascript
function ease(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
```

## 6\. cubic-bezier

cubic-bezier 缓动函数允许更高度的自定义，通过调整四个控制点来定义贝塞尔曲线。这使得开发者能够创造出各种不同的速度变化模式。

```javascript
function cubicBezier(t, p0, p1, p2, p3) {
  return (
    (1 - t) * (1 - t) * (1 - t) * p0 +
    3 * (1 - t) * (1 - t) * t * p1 +
    3 * (1 - t) * t * t * p2 +
    t * t * t * p3
  );
}
```