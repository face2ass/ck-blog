---
title: 油猴脚本-steam批量取消关注
date: 2021-01-17 18:30:00
categories:
  - [技术, 前端]
tags:
  - Tampermonkey
  - 脚本
---

```javascript
// ==UserScript==
// @name         steam批量取消关注
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      /^https?:\/\/steamcommunity\.com\/id\/\w+\/followedgames\/?$/
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';
  function run() {
      // return alert(666)
      var $btn = jQuery('<button>取消本页所有关注</button>');
      $btn.addClass('btn-batch');
      jQuery('#tabs_basebg').prepend($btn);
      GM_addStyle(`#tabs_basebg > .btn-batch {
          color: #67c1f5;
          background-color: #274155;
          cursor: pointer;
          border: 1px solid #67c1f5;
          margin-bottom: 10px;
      }`)
  
      $btn.click(function () {
          const btns = jQuery('.unfollow_game_btn')
          btns.each((index,ele)=>{
              setTimeout(()=>{
                  $(ele).click()
              }, index*500)
          })
      });
  }
  
  run();
})();
```