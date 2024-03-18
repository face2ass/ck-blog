---
title: 原生js一步一步实现瀑布流
date: 2017-06-30 17:35
categories:
  - [技术, 前端]
tags:
  - JavaScript
---

瀑布流一般的常见的需求有这三种，一是每列固定宽度，这种比较常见，比如花瓣网；另一种是每行固定高度，这种少见一些，典型的例子是百度图片，bing，谷歌图片，还有一种是宽高都不确定，这种需求就比较奇葩了，我们仅讨论第一种瀑布流。

实现这类瀑布流一般的做法是维护一个包含不同列高的数组，先排列第一行，初始化这个数组以后，然后后面的图片（或者是图片的容器）通过绝对定位来排列到最短的列上，并更新数组，随后下一个元素做相同的操作。当窗口尺寸变化怎么办呢？最偷懒的是初始化时就写死容器宽度，当页面太小就出现横向滚动条，这种没啥难度；或者每次修改尺寸就刷新一下页面，可能有些人会嗤之以鼻，还真有大厂这么干，微软的bing搜索的图库就是这么做的；
<!-- more -->
另一种方式是像花瓣网一样，对所有图片进行重新定位，这也是我们接下来要使用的方式。
首先，我们要准备一系列尺寸不一的图片。一般来说我们使用瀑布流的方式，后台会返回给我们一组图片，里面会包含尺寸信息，虽然前端可以计算出来，但是出于性能优化考虑，这样显然是不提倡的。

出于简单考虑，我的数据只包括了图片地址和尺寸信息，并在页面写死了数据而不是通过后台请求，以此为基础，当滚动页面获取新数据的时候，我们回从这些数据中随机拿出几个组成新的数组来模仿后台响应。

# 准备图片数据

这里是我预先准备的数据：

```javascript
var imgInfoList = [
  { src: './img/1.jpg', width: 550, height: 452 },
  { src: './img/2.jpg', width: 720, height: 640 },
  { src: './img/3.jpg', width: 1600, height: 900 },
  { src: './img/4.jpg', width: 700, height: 560 },
  { src: './img/5.jpg', width: 700, height: 536 },
  { src: './img/6.jpg', width: 686, height: 430 },
  { src: './img/7.jpg', width: 600, height: 337 },
  { src: './img/8.jpg', width: 640, height: 332 },
  { src: './img/9.jpg', width: 700, height: 677 },
  { src: './img/10.jpg', width: 224, height: 280 },
  { src: './img/11.jpg', width: 700, height: 510 },
  { src: './img/12.jpg', width: 486, height: 558 },
  { src: './img/13.jpg', width: 224, height: 398 },
  { src: './img/14.jpg', width: 700, height: 373 },
  { src: './img/15.jpg', width: 224, height: 343 },
  { src: './img/16.jpg', width: 2000, height: 2830 },
  { src: './img/17.jpg', width: 600, height: 1066 },
  { src: './img/18.jpg', width: 600, height: 402 },
  { src: './img/19.jpg', width: 560, height: 570 },
  { src: './img/20.jpg', width: 640, height: 1331 },
  { src: './img/21.jpg', width: 640, height: 360 },
  { src: './img/22.jpg', width: 700, height: 933 },
  { src: './img/23.jpg', width: 640, height: 789 },
  { src: './img/24.jpg', width: 700, height: 990 },
  { src: './img/25.jpg', width: 1242, height: 2688 },
  { src: './img/26.jpg', width: 675, height: 900 },
  { src: './img/27.jpg', width: 700, height: 1244 },
  { src: './img/28.jpg', width: 600, height: 1700 },
  { src: './img/29.jpg', width: 658, height: 802 },
  { src: './img/30.jpg', width: 566, height: 800 },
]
```


# 构造假数据模拟后台

这是从随机获取元素组成新数组的函数：

```javascript
/**
 * 模拟后台返回数据
 * @returns {Array}
 */
function moreFakeImgInfo () {
    var createCount = 20;
    var moreImgInfoList = [];
    var imgLength = imgInfoList.length;
    // 从原数据随机获取组成新数组
    for (var i = 0; i < createCount; i++) {
        moreImgInfoList.push(imgInfoList[parseInt(Math.random() * (imgLength - 1))]);
    }
    return moreImgInfoList;
}
```


# 初始化第一行

页面载入完成后，先计算出第一行可容纳的列数，然后排练第一行数据，并初始化 包含每列高度的数组：

```javascript
window.onload = function () {
    cols = parseInt((document.documentElement.clientWidth * 0.9 + boxMarginRight) / boxWidth);
    container.style.width = (boxWidth * cols + boxMarginRight * (cols - 1)) + 'px';

    var boxHeight;
    var fragment = document.createDocumentFragment();  // 创建文档碎片
    for (var i = 0; i < imgInfoList.length; i++) {
        if (i < cols) {  // 只加载第一行

            var oImgBox = document.createElement('div');
            oImgBox.className = 'img-box';
            var oImg = document.createElement('img');
            oImg.src = imgInfoList[i].src;
            oImgBox.appendChild(oImg);

            boxHeight = parseFloat((imgInfoList[i].height * (imageWidth / imgInfoList[i].width) + boxBorder * 2 + boxPadding * 2).toFixed(2));
            oImgBox.style.top = 0;
            oImgBox.style.left = (i === 0 ? 0 : (boxWidth + boxMarginRight) * i) + 'px';
            oImgBox.style.height = boxHeight + 'px';
            fragment.appendChild(oImgBox);

            oImgBox.height = imgInfoList[i].height;
            oImgBox.width = imgInfoList[i].width;

            colHeightList.push(boxHeight);
            colLeftList.push(i === 0 ? '0px' : (boxWidth + boxMarginRight) * i + 'px');
        } else {
            break;
        }
    }
    container.appendChild(fragment);
    fallImages(imgInfoList.slice(cols));  // 排列余下的元素
};
```

1. toFixed会返回string，使用parseFloat可以重新转化为number
2. createDocumentFragment可以创建文档碎片，然后一次性将所有元素添加到容器中，可以提高性能
3. 给oImgBox元素添加height和width属性是为了方便后面重排列
4. colLeftList数组是为了方便后面的元素排列时使用
5. 对imgInfoList进行slice操作是为了只针对后面新加进来的元素进行排列

# 新创建新元素并排列

fallImages函数用于创建新的图片并排列，具体的做法和上面的类似，主要的操作是获取数组中的最小列高并将新元素排到该列后面，然后更新该列在数组中的高度：

```javascript
/**
 * 创建元素并排列
 * @param imgInfoList
 */
function fallImages (imgInfoList) {
    var fragment = document.createDocumentFragment();
    var minColHeight, minIndex, boxHeight;
    for (var i = 0; i < imgInfoList.length; i++) {
        // 创建img-box
        var oImgBox = document.createElement('div');
        oImgBox.className = 'img-box';
        var oImg = document.createElement('img');
        oImg.src = imgInfoList[i].src;
        oImgBox.appendChild(oImg);

        boxHeight = parseFloat((imgInfoList[i].height * (imageWidth / imgInfoList[i].width) + boxBorder * 2 + boxPadding * 2).toFixed(2));
        // 获取最短列高及对应的下标
        minColHeight = Math.min.apply(Math, colHeightList);
        minIndex = colHeightList.indexOf(minColHeight);
        oImgBox.style.top = (minColHeight + boxMarginBottom) + 'px';
        oImgBox.style.left = colLeftList[minIndex];
        oImgBox.style.height = boxHeight + 'px';

        fragment.appendChild(oImgBox);

        oImgBox.height = imgInfoList[i].height;
        oImgBox.width = imgInfoList[i].width;

        // 更新列高
        colHeightList[minIndex] += (boxMarginBottom + boxHeight);
    }

    container.appendChild(fragment);

    container.style.height = Math.max.apply(Math, colHeightList) + 'px';
}
```


ps：Math.min和Math.max方法并不接受数组参数，所以我们要求数组的最值需要使用Function.prototype.apply方法将其展开。

滚动页面“刷新”数据

接下来，需要添加滚动到底部获取“新数据”的功能：

```javascript
var end = 0;  // 没有更多数据标识
var time = 0;  // 加载次数标识
/**
 * 下拉展示“新数据”
 */
window.onscroll = function () {
    if (end) {  // 已展示完
        return;
    }
    var scrolledHeight = document.documentElement.scrollTop || document.body.scrollTop;
    if (scrolledHeight + document.documentElement.clientHeight > Math.min.apply(null, colHeightList)) {
        console.log('create more');
        // TODO 这里需要从后台获取数据
        var newImgInfoList = moreFakeImgInfo();
        fallImages(newImgInfoList);
        if (time++ > 3) {
            end = 1;
        }
    }
};
```


ps：这里的end、time、moreFakeImgInfo都是为了模仿后台响应的假数据

# 重新排列

到此为止，我们的瀑布流已经实现了，不过还有一些细节需要完善，比如说修改窗口/容器尺寸，如何对所有图片进行重新排列，如果大家看过上面的话，这一步就非常简单了，我们只需要获取页面中所有的img-box，然后对他们进行上面的操作，唯一的不同是，我们不用创建新元素，只需要对定位修改：

```javascript
/**
 * 行宽改变重新排列
 */
window.onresize = function () {
    oldCols = cols;
    cols = parseInt((document.documentElement.clientWidth * 0.9 + boxMarginRight) / boxWidth);
    container.style.width = (boxWidth * cols + boxMarginRight * (cols - 1)) + 'px';
    // 最大可容纳列数改变
    if (oldCols !== cols) {
        var imageBoxList = container.getElementsByClassName('img-box');
        colHeightList = [];
        colLeftList = [];
        var minColHeight, minIndex;
        for (var i = 0; i < imageBoxList.length; i++) {
            if (i < cols) {  // 初始化第一行

                imageBoxList[i].style.top = 0;
                imageBoxList[i].style.left = (i === 0 ? 0 : (boxWidth + boxMarginRight) * i) + 'px';

                colHeightList.push(parseFloat((imageBoxList[i].height * (imageWidth / imageBoxList[i].width) + boxBorder * 2 + boxPadding * 2).toFixed(2)));
                colLeftList.push(i === 0 ? '0px' : (boxWidth + boxMarginRight) * i + 'px');

            } else {  // 对后面的元素重新排列
                minColHeight = Math.min.apply(Math, colHeightList);
                minIndex = colHeightList.indexOf(minColHeight);
                imageBoxList[i].style.top = (minColHeight + boxMarginBottom) + 'px';
                imageBoxList[i].style.left = colLeftList[minIndex];

                colHeightList[minIndex] += parseFloat(parseFloat((boxMarginBottom + imageBoxList[i].height * (imageWidth / imageBoxList[i].width) + boxBorder * 2 + boxPadding * 2).toFixed(2)));
            }
        }
        container.style.height = Math.max.apply(Math, colHeightList) + 'px';
    }
};
```


是不是很简单，后面如果有时间我会对另外两种瀑布流的实现方式也进行讲解。

[完整代码戳这里](https://gitee.com/kaysama/blog-source-host/tree/master/原生js一步一步实现瀑布流)
[在线demo](http://kaysama.gitee.io/blog-source-host/原生js一步一步实现瀑布流/index.html)
