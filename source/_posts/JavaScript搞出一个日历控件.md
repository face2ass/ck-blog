---
title: JavaScript搞出一个日历控件
date: 2018-07-13 08:23:00
tags:
---

日历控件基本上所有的前端都会用到，而且我相信8成的JSer都是直接把开源的组件拿来用，很多设计师似乎跟开发们也有默契，对日历控件只要能用就行，样式啥的不做太多要求，但是某些设计师就是有强迫症，一定要你按着TA的设计来，保不准产品也要舔一把火，往日历里塞些稀奇古怪的业务，咋办？初级开发可能就去网上找符合要求的控件，然后拼命说服他们；普通的开发就可能直接在已有的控件上修修补补，除了问题再回炉重造；高级的开发直接怼回去：什么J8需求，不接！顶级的程序员呢？当然是一言不合直接造轮子啊（笑。
<!-- more -->
先放最终效果，审美有限，将就着看吧~

![](https://oscimg.oschina.net/oscnet/d8c659ca8f8847afac9a8a3b9bf6e236ea8.jpg)
先不管js或是jquery怎么写，咱先把日历的样子搭出来

html：

```html
<div id="application">
    <div class="date-picker-group">
        <input type="text" placeholder="点击按钮选择日期" readonly/>
        <i class="trigger"></i>
    </div>
    <div id="_date-picker" class="calendar-panel" style="left: 120px; top: 135px; display: block;">
        <div class="panel-header">
            <i class="btn-control prev-year" title="上一年"></i>
            <i class="btn-control prev-month" title="上一月"></i>
            <span class="YY-MM">2019年1月</span>
            <i class="btn-control next-year" title="下一年"></i>
            <i class="btn-control next-month" title="下一月"></i>
        </div>
        <div class="grid" tabindex="0">
            <ul class="weekdays">
                <li>周日</li>
                <li>周一</li>
                <li>周二</li>
                <li>周三</li>
                <li>周四</li>
                <li>周五</li>
                <li>周六</li>
            </ul>
            <ul class="days">
                <li class="row">
                    <ul>
                        <li class="day disabled">30</li>
                        <li class="day disabled">31</li>
                        <li class="day">1</li>
                        <li class="day">2</li>
                        <li class="day">3</li>
                        <li class="day">4</li>
                        <li class="day">5</li>
                    </ul>
                </li>
                <li class="row">
                    <ul>
                        <li class="day">6</li>
                        <li class="day today">7</li>
                        <li class="day">8</li>
                        <li class="day">9</li>
                        <li class="day">10</li>
                        <li class="day">11</li>
                        <li class="day">12</li>
                    </ul>
                </li>
                <li class="row">
                    <ul>
                        <li class="day">13</li>
                        <li class="day">14</li>
                        <li class="day">15</li>
                        <li class="day">16</li>
                        <li class="day">17</li>
                        <li class="day">18</li>
                        <li class="day">19</li>
                    </ul>
                </li>
                <li class="row">
                    <ul>
                        <li class="day">20</li>
                        <li class="day">21</li>
                        <li class="day">22</li>
                        <li class="day">23</li>
                        <li class="day">24</li>
                        <li class="day">25</li>
                        <li class="day">26</li>
                    </ul>
                </li>
                <li class="row">
                    <ul>
                        <li class="day">27</li>
                        <li class="day">28</li>
                        <li class="day">29</li>
                        <li class="day">30</li>
                        <li class="day">31</li>
                        <li class="day disabled">1</li>
                        <li class="day disabled">2</li>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</div>
```

因为层级关系较多，我这里使用scss样式，需要css的小伙伴可以使用这个[sass2css](https://www.sassmeister.com/)转换工具。

scss：

```scss
* {
  margin: 0;
  padding: 0;
  outline: none;
}

html, body {
  width: 100%;
  height: 100%;
}

ul, li {
  list-style: none;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  padding-left: 20px;
}

.date-picker-group {
  width: 220px;
  height: 30px;
  border-radius: 50px;
  position: relative;
  margin: 100px;
  & > input {
    display: block;
    width: 100%;
    height: 100%;
    line-height: 28px;
    border: 1px solid #d0d0d0;
    font-size: 14px;
  }
  & > .trigger {
    position: absolute;
    top: 0;
    right: 5px;
    height: 100%;
    width: 20px;
    background: url("./date_trigger.png") no-repeat center;
    background-size: contain;
    cursor: pointer;
  }
}

#dialog-calendar {
  display: none;
  font-size: 20px;
  position: absolute;
  background-color: #fff;
  border: 1px solid #ccc;
  user-select: none;
  border-radius: 4px;
  box-shadow: 0 0 15px -7px #000;
  & > .panel-header {
    text-align: center;
    height: 1.5em;
    line-height: 1.5em;
    position: relative;
    background-color: #ebebeb;
    border-radius: 5px 5px 0 0;
    & > .YY-MM {
      display: inline-block;
      font-size: 0.75em;
      height: 2em;
      line-height: 2em;
      vertical-align: top;
    }
    & > .btn-control {
      position: absolute;
      top: 50%;
      width: 6px;
      height: 6px;
      border: 1px solid #000;
      border-top: none;
      border-right: none;
      transform-origin: center;
      cursor: pointer;
      &.prev-year {
        border-width: 1px;
        left: 0.5em;
        transform: translateY(-30%) rotate(45deg);
        &::after {
          content: " ";
          display: block;
          width: 100%;
          height: 100%;
          border: 1px solid #000;
          border-top: none;
          border-right: none;
          transform-origin: center;
          margin: -3px 0 0 2px;
        }
      }
      &.prev-month {
        left: 1.5em;
        transform: translateY(-30%) rotate(45deg);
      }
      &.next-year {
        border-width: 1px;
        right: 0.5em;
        transform: translateY(-30%) rotate(-135deg);
        &::after {
          content: " ";
          display: block;
          width: 100%;
          height: 100%;
          border: 1px solid #000;
          border-top: none;
          border-right: none;
          transform-origin: center;
          margin: -3px 0 0 2px;
        }
      }
      &.next-month {
        right: 1.5em;
        transform: translateY(-30%) rotate(-135deg);
      }
    }
  }
  & > .grid {
    text-align: center;
    & > .weekdays {
      /* display: none; */
      padding: 0 0.1em;
      color: #808080;
      border-bottom: 1px solid #dadada;
      height: 1.25em;
      line-height: 1.25em;
      white-space: nowrap;
      & > li {
        float: left;
        width: 2em;
        margin: 0 0.2em;
        font-size: 0.75em;
        height: 1.667em;
        line-height: 1.667em;
        vertical-align: top;
      }
    }
    & > .days {
      padding: 0.1em;
      & > .row {
        margin-top: 0.1em;
        & > ul {
          height: 1.5em;
          white-space: nowrap;
          & > .day {
            float: left;
            width: 2em;
            margin: 0 0.2em;
            font-size: 0.75em;
            height: 2em;
            line-height: 2em;
            border-radius: 50%;
            text-align: center;
            box-sizing: border-box;
            cursor: pointer;
            &.today {
              background-color: #e7e7e7;
              &:hover {
                background-color: #ffa32a;
              }
            }
            &:hover,
            &.focus {
              border-radius: 5px;
              background-color: #ffa32a;
              color: #fff;
            }
            &.disabled {
              color: #d0d0d0;
              cursor: default;
              &:hover {
                background-color: transparent;
                color: #d0d0d0;
              }
            }
          }
        }
      }
    }
  }
}

```

样式用**em**来做单位，可以通过修改根元素.calendar-panel的font-size来调整面板和字体的整体尺寸

最终呈现的效果见下图

![](https://oscimg.oschina.net/oscnet/d8c659ca8f8847afac9a8a3b9bf6e236ea8.jpg)

重点来了——

首先创建一个DatePicker 类，思考一下这个类会有哪些对外开放的功能，以及哪些必须的私有变量/函数：

构造方法：传入触发元素

开放的api：进入上个月、进入下个月、进入前一年、进入后一年、显示控件、隐藏控件、设置控件位置

内部函数：设置窗体位置，更新窗体年月，更新窗体日期网格、绑定事件

于是先大概组织出这样一个结构

```javascript
function DatePicker (opts) {

  var _this = this
  this.$calendar = $('#_calendar-panel') // 日期弹窗
  this.$YYMM = this.$calendar.find('.YY-MM') // 顶部年月显示
  this.$btnControl = this.$calendar.find('.btn-control') // 头部年月跳转按钮
  this.$days = this.$calendar.find('.days') // 日期网格

  // 今天的年月日
  this.today = new Date()
  this.currentYear = this.today.getFullYear()
  this.currentMonth = this.today.getMonth()  // 月份数组的下标
  this.currentDate = this.today.getDate()

  // 日历头部显示的年月
  this.displayYear = this.currentYear
  this.displayMonth = this.currentMonth

  // 被选中的年月日
  this.selectYear = null
  this.selectMonth = null
  this.selectDate = null

  bindHandlers()

  /**
   * 进入上个月
   */
  this.prevMonth = function () {
  }

  /**
   * 进入下个月
   */
  this.nextMonth = function () {
  }

  /**
   * 进入前一年
   */
  this.prevYear = function () {
  }

  /**
   * 进入后一年
   */
  this.nextYear = function () {
  }

  /**
   * 显示控件
   */
  this.showCalendar = function () {
  }

  /**
   * 隐藏控件
   */
  this.hideCalendar = function () {
  }

  /**
   * 设置控件位置
   */
  this.setPosition = function () {
  }

  /**
   * 更新日期网格数据
   */
  function updateDays () {
  }

  /**
   * 更新日历
   */
  function update () {
    // 更新头部年月数据
    // ....
    updateDays()
  }

  /**
   * 绑定事件
   */
  function bindHandlers () {
  }

}
```

先完成前面几个简单的方法，它们只用来修改DatePicker对象的属性，具体的渲染逻辑放在私有函数update中

```javascript
/**
 * 进入上个月
 */
this.prevMonth = function () {
  if (this.displayMonth === 0) {
    this.displayMonth = 11
    this.displayYear--
  }
  else {
    this.displayMonth--
  }
  update() // 更新日历
}

/**
 * 进入下个月
 */
this.nextMonth = function () {
  if (this.displayMonth === 11) {
    this.displayMonth = 0
    this.displayYear++
  }
  else {
    this.displayMonth++
  }
  update() // 更新日历
}

/**
 * 进入前一年
 */
this.prevYear = function () {
  this.displayYear--
  update() // 更新日历
}

/**
 * 进入后一年
 */
this.nextYear = function () {
  this.displayYear++
  update() // 更新日历
}

/**
 * 显示控件
 */
this.showCalendar = function () {
  this.$calendar.css({display: 'block'})
}

/**
 * 隐藏控件
 */
this.hideCalendar = function () {
  this.$calendar.css({display: 'none'})
}

/**
 * 设置控件位置
 */
this.setPosition = function () {
  this.$calendar.css({
    left: this.$input.offset().left + 'px',
    top: (this.$input.height() + this.$input.offset().top + 5) + 'px'
  })
}  

/**
 * 更新日历
 */
function update () {
  _this.$YYMM.html(_this.currentYear + '年' + (_this.currentMonth + 1) + '月') // 更新头部年月数据
  updateDays()
}
```

updateDays是我们渲染日期面板的核心方法，先理一下逻辑：

① 首先我们要获取当前需要展示的月份的天数（dayNum）以及该月第一天是星期几（startWeekday）

② 如果不是星期日（0）则获取上个月最后一天的日期（endDateOfLastMonth），将该星期用上个月的最后 startWeekday 天填满

③ 循环填充本月的所有日期，并记录最后一天是星期几（weekday）

④ 如果不是星期六，则从1号开始填完本周剩余 7 - weekday -1 天

按照以上的逻辑，完成了updateDays函数

```javascript
/**
 * 更新日期网格数据
 */
function updateDays () {

  var weekday, displayDate
  var rowCount = 1
  var gridHtmlArray = ['<li class="row"><ul>']

  // 插入首行上个月日期
  var endDateOfLastMonth = new Date(_this.displayYear, _this.displayMonth, 0).getDate() // 当前展示的年月的上个月的最后一天的日期
  var startWeekday = new Date(_this.displayYear, _this.displayMonth, 1).getDay() // 当前展示的年月的第一天是星期几
  for (weekday = 0; weekday < startWeekday; weekday++) {
    displayDate = endDateOfLastMonth - startWeekday + weekday + 1
    gridHtmlArray.push('<li data-day="' + displayDate + '" class="day disabled">' + displayDate + '</li>')
  }

  // 继续插入后面的日期
  var dayNum = new Date(_this.displayYear, _this.displayMonth + 1, 0).getDate() // 当前展示的年月的天数
  for (displayDate = 1; displayDate <= dayNum; displayDate++) {
    if (displayDate === _this.todayDate && _this.displayMonth === _this.todayMonth && _this.displayYear === _this.todayYear) { // 如果是今天
      gridHtmlArray.push('<li data-day="' + displayDate + '" class="day today">' + displayDate + '</li>')
    }
    else if (displayDate === _this.selectDate && _this.displayMonth === _this.selectMonth && _this.displayYear === _this.selectYear) { // 如果是选中的那天
      gridHtmlArray.push('<li data-day="' + displayDate + '" class="day focus">' + displayDate + '</li>')
    }
    else {
      gridHtmlArray.push('<li data-day="' + displayDate + '" class="day">' + displayDate + '</li>')
    }

    if (weekday === 6 && displayDate < dayNum) {
      // 如果到周六还没展示完整月则继续添加行
      gridHtmlArray.push('</ul><li class="row"><ul>')
      rowCount++
      weekday = 0
    }
    else {
      weekday++
    }
  }

  // 用下个月的日期补充玩本周
  var fromDate = 1 // 1号开始
  for (weekday; weekday < 7; weekday++) {
    gridHtmlArray.push('<li class="day disabled">' + (fromDate++) + '</li>')
  }

  gridHtmlArray.push('</ul></li>')

  _this.$days.html(gridHtmlArray.join(''))
}
```

最后绑定事件：

```javascript
/**
 * 绑定事件
 */
function bindHandlers () {
  _this.$calendar.on('click', '.prev-month', function () { _this.prevMonth() })
  _this.$calendar.on('click', '.next-month', function () { _this.nextMonth() })
  _this.$calendar.on('click', '.prev-year', function () { _this.prevYear() })
  _this.$calendar.on('click', '.next-year', function () { _this.nextYear() })
}
```

后面待补充的功能还有很多，面板定位，dom元素创建，触发事件，事件格式化，jquery封装，挖个坑先~

![](https://static.oschina.net/uploads/space/2017/0630/180033_T7KY_1389094.png)[完整代码戳这里](https://gitee.com/kaysama/blog-source-host/tree/master/%E6%97%A5%E6%9C%9F%E9%80%89%E6%8B%A9%E5%99%A8)

![](https://static.oschina.net/uploads/space/2017/0630/180033_T7KY_1389094.png)[在线演示一](http://kaysama.gitee.io/blog-source-host/%E6%97%A5%E6%9C%9F%E9%80%89%E6%8B%A9%E5%99%A8/index.html)、[在线演示二](https://codepen.io/oj8kay/pen/eoMMbz)