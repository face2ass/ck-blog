---
title: n级排列
date: 2020-06-07 21:52:00
tags:
---

##  n级排列

由1，2，...，n组成的一个有序数组称为一个n级排列。  
例如，2431是一个四级排列，45321是一个五级排列。  
注：n级排列的总数是 n(n-1)(n-2)...1=n!
<!-- more -->
##  逆序

在一个排列中，如果一对数的前后位置与大小顺序相反，即前面的数大于后面的数，那么它们就称为一个逆序

##  逆序数

一个排列中逆序的总数就称为这个排列的逆序数

例如2431中，21、43、41、31是逆序，2431的逆序数就是4；而45321的逆序数是9

注：排列 j1,j2,....,jn的逆序数记为 τ(j1,j2,...,jn)

##  奇/偶排列

逆序数为奇数的排列称为奇排列。逆序数为偶数的排列称为偶排列  
例如，2431是偶排列，45321是奇排列， 12.....n 的逆序数是零，因而是偶排列。

![](https://static.oschina.net/uploads/space/2017/0630/180033_T7KY_1389094.png)[完整代码戳这里](https://gitee.com/kaysama/blog-source-host/blob/master/n%E7%BA%A7%E6%8E%92%E5%88%97/index.html)

![](https://static.oschina.net/uploads/space/2017/0630/180033_T7KY_1389094.png)[在线演示1](http://kaysama.gitee.io/blog-source-host/n%E7%BA%A7%E6%8E%92%E5%88%97/)、[在线演示2](https://codepen.io/oj8kay/pen/QWybzgG)