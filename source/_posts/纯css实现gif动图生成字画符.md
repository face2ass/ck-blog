---
title: 纯css实现gif动图生成字画符
date: 2020-07-19 12:01:00
categories:
  - [技术, 前端]
tags:
  - Css
---

之前有一篇博客试过使用 [JavaScript生成字符画](https://my.oschina.net/codingDog/blog/1845658)，但是最终没有实现gif转字画符，事实上用当时说的方法：把gif每帧抽取出来，然后绘制到canvas上即可。

不过这次要说的实现方式并非js，而是纯css实现，核心的属性是background-clip 和text-fill-color ，由于这俩属性目前并没有被纳入标准，所以需要加上 -webkit-前缀。当初发现这个属性是真的像发现了个宝藏，通过它们的组合可以实现非常多有意思的效果。前者用于对背景裁剪，后者用于和背景颜色叠加。

于是就有了下图的效果（背景是一张动图，然后使用文字对背景进行裁剪。字体透明填充，与背景叠加）
<!-- more -->
![](/images/mememe.gif)

html结构：

```html
<!doctype html>
<html lang="zh-cn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>css ascii srt</title>
  <style>
    /* 样式 */
  </style>
</head>
<body>
<p>
  色欲一事，乃舉世人之通病不特中下之人，被色所迷。即上根之人，若不戰兢自持，乾惕在念，則亦難免不被所迷。試觀古今來多少出格豪傑，固足為聖為賢。
  祗由打不破此關，反為下愚不肖。兼復永墮惡道者，蓋難勝數。楞嚴經云，若諸世界六道眾生，其心不淫，則不隨其生死相續。汝修三昧，本出塵勞。淫心不除，塵不可出。
  學道之人，本為出離生死。苟不痛除此病，則生死斷難出離，即念佛門，雖則帶業往生。然若淫習固結，則便與佛隔，難於感應道交矣。欲絕此禍，莫如見一切女人，皆作親想，怨想，不淨想。親想者。
  見老者作母想，長者作姊想，少者作妹想，幼者作女想，欲心縱盛，斷不敢於母姊妹女邊起不正念。
  視一切女人，總是吾之毋姊妹女。則理制於欲，欲無由發矣。怨想者，凡見美女，便起愛心。由此愛心，便墮惡道。長劫受苦，不能出離。如是則所謂美麗嬌媚者，比劫賊虎狼、毒蛇惡蠍，砒霜鴆毒，烈百千倍。
  於此極大怨家，尚猶戀戀著念，豈非迷中倍人。不淨者，美貌動人，只外面一層薄皮耳。若揭去此皮，則不忍見矣。骨肉膿血，屎尿毛髮，淋漓狼藉，了無一物可令人愛。但以薄皮所蒙。則妄生愛戀。
  華瓶盛糞，人不把玩。今此美人之薄皮，不異華瓶。皮內所容，比糞更穢。何得愛其外皮，而忘其裏之種種穢物，漫起妄想乎哉。苟不戰兢乾惕，痛除此習。則唯見其姿質美麗，致愛箭入骨，不能自拔。
  平素如此，致其沒後不入女腹，不可得也。入人女腹猶可。入畜女腹，則將奈何。試一思及，心神驚怖。
  然欲于見境不染心，須于未見境時，常作上三種想，則見境自可不隨境轉。否則縱不見境，意地仍復纏綿，終被淫欲習氣所縛。固宜認真滌除惡業習氣，方可有自由分。
</p>
<script>
  // 脚本
</script>
</body>
</html>
```

样式：

```css
* {
  margin: 0;
  padding: 0;
}
html,
body {
  width: 100%;
  height: 100%;
}
body {
  position: relative;
  overflow: hidden;
}
p {
  font-weight: 600;
  position: absolute;
  width: 100%;
  overflow: hidden;
  left: 50%;
  top: 50%;
  transform: scale(0.9);
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transform-origin: 50% 50%;
  /*js生成*/
  /*font-size: 12px;*/
  /*line-height: 12px;*/
  /*width: 400px;*/
  /*height: 400px;*/
  /*margin-left:-200px;*/
  /*margin-top:-200px;*/
  /*background-image: url(./img/test.jpg);*/
}
```

脚本：

```javascript
const $p = document.getElementsByTagName('p')[0]
// 字体大小
const fontSize = 12
// 背景图片
const imgUrl = './mememe.gif'
$p.style.cssText = `font-size:${fontSize}px;line-height:${fontSize}px;`
const text = $p.innerHTML.replace(/(\s+)/g, '')
const textLength = text.length

const img = new Image()
img.src = imgUrl
img.complete ? onImgLoaded() : (img.onload = onImgLoaded)

function onImgLoaded () {
  const imgRatio = img.width / img.height
  let imgWidth = window.innerWidth
  let imgHeight = imgWidth / imgRatio
  if (imgHeight > window.innerHeight) {
    imgHeight = window.innerHeight
    imgWidth = imgHeight * imgRatio
  }
  const needTextLength = (imgWidth / fontSize) * (imgHeight / fontSize)
  if (needTextLength > textLength) {
    $p.innerHTML = new Array(Math.floor(needTextLength / textLength) + 1).fill(text).join('')
  }
   $p.style.cssText += `margin-left:${-imgWidth/2}px;margin-top:${-imgHeight/2}px;width:${imgWidth}px;height:${imgHeight}px;background-image:url(${imgUrl});`
}
```

![](/images/hand.webp)[完整代码戳这里](https://github.com/face2ass/blog-source-host/blob/master/%E5%AD%97%E7%AC%A6%E7%94%BB/ascii_art_css.html)

![](/images/hand.webp)[在线演示1](https://blog.omgfaq.com/example/%E5%AD%97%E7%AC%A6%E7%94%BB/ascii_art_css.html)、[在线演示2](https://codepen.io/oj8kay/pen/NWxEzgx)