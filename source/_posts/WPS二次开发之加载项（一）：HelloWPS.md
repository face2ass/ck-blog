---
title: WPS二次开发之加载项（一）：HelloWPS
date: 2022-09-28 17:25:00
tags:
---

官方对WPS加载项的解释：

>  WPS 加载项是一套基于 Web 技术用来扩展 WPS 应用程序的解决方案。每个 WPS 加载项都对应打开了一个网页，并通过调用网页中 JavaScript 方法来完成其功能逻辑。 WPS 加载项打开的网页可以直接与 WPS 应用程序进行交互，同时一个 WPS 加载项中的多个网页形成了一个整体， 相互之间可以进行数据共享。 开发者不必关注浏览器兼容的问题，因为 WPS 加载项的底层是以 Chromium 开源浏览器项目为基础进行的优化扩展。 WPS 加载项具备快速开发、轻量化、跨平台的特性，目前已针对Windows/Linux操作系统进行适配。 WPS 加载项功能特点如下:
>
> -   完整的功能。可通过多种不同的方法对文档、电子表格和演示文稿进行创作、格式设置和操控；通过鼠标、键盘执行的操作几乎都能通过WPS 加载项 完成；可以轻松地执行重复任务，实现自动化。
> -   三种交互方式。[自定义功能区](https://qn.cache.wpscdn.cn/encs/doc/office_v19/topics/WPS%20%E5%9F%BA%E7%A1%80%E6%8E%A5%E5%8F%A3/%E5%8A%A0%E8%BD%BD%E9%A1%B9%20API%20%E5%8F%82%E8%80%83/%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8A%9F%E8%83%BD%E5%8C%BA/%E8%87%AA%E5%AE%9A%E4%B9%89%E5%8A%9F%E8%83%BD%E5%8C%BA%E6%A6%82%E8%BF%B0.html)，采用公开的CustomUI标准，快速组织所有功能；[任务窗格](https://qn.cache.wpscdn.cn/encs/doc/office_v19/topics/WPS%20%E5%9F%BA%E7%A1%80%E6%8E%A5%E5%8F%A3/%E5%8A%A0%E8%BD%BD%E9%A1%B9%20API%20%E5%8F%82%E8%80%83/%E4%BB%BB%E5%8A%A1%E7%AA%97%E6%A0%BC/%E4%BB%BB%E5%8A%A1%E7%AA%97%E6%A0%BC%E6%A6%82%E8%BF%B0.html)，展示网页，内容更丰富；[Web 对话框](https://qn.cache.wpscdn.cn/encs/doc/office_v19/apiObjectTemplate.htm?page=topics/WPS%20%E5%9F%BA%E7%A1%80%E6%8E%A5%E5%8F%A3/%E5%8A%A0%E8%BD%BD%E9%A1%B9%20API%20%E5%8F%82%E8%80%83/Office%20%E5%85%A8%E5%B1%80%E5%AF%B9%E8%B1%A1/Application/Application%20.htm#Application.ShowDialog)，结合事件监听，实现自由交互。
> -   标准化集成。不影响 JavaScript 语言特性，网页运行效果和在浏览器中完全一致；WPS 加载项开发文档完整，接口设计符合 JavaScript 语法规范，避免不必要的学习成本，缩短开发周期。
<!-- more -->
想真正知道这所谓的“加载项”到底是是个啥，纸上谈兵不如实践一遍，跟着下面步骤来一发。首先得电脑需要安装wps（废话）、Node.js。

1、管理员权限_（如果安装的是wps个人版，不需要管理员权限）_启动命令行，通过npm全局安装wpsjs开发工具包： npm install -g wpsjs ，如果之前已经安装了，可以更新下：npm update -g wpsjs。

建议使用淘宝镜像：npm config set registry https://registry.npm.taobao.org

2、新建一个wps加载项，假设取名为"HelloWps"：wpsjs create HelloWps，会出现如下图的几个选项：

![](https://oscimg.oschina.net/oscnet/up-5003a9ce7a1af89c203452d262aee601d16.png)

3、这里我们选择“电子表格”后，会让你选择前端框架：

![](https://oscimg.oschina.net/oscnet/up-4ec8c0d7ffba9b034fca37c5ba57c41f12e.png)

4、如果你熟悉vue，选择“Vue”以后，wpsjs会在当前目录创建如下的工程结构 

![](https://oscimg.oschina.net/oscnet/up-8609524244b0e81410278da02922c7052c2.png)

5、执行调试命令：wpsjs debug

该命令会自动修改oem.ini配置，并在本地生成jsplugins.xml文件，命令执行后会自动启动wps并加载HelloWps这个加载项，同时wpsjs工具包启了一个http服务,此服务主要提供两方面的能力:

-   提供前端页的的热更新服务，wpsjs工具包检测到网页数据变化时，自动刷新页面。
-   提供wps加载项的在线服务，wpsjs生成的代码示例是一个在线模式，wps客户端程序实际上是通过http服务来请求在线的wps加载项相关代码和资源的。

6、在wps打开新标签页，选择新建空白电子表格，如果出现如下的“wps加载项实例”则表示加载项安装成功了。

![](https://oscimg.oschina.net/oscnet/up-1a165bdc73f168f13a94f08800a8c9e07b0.png)

至此，wps加载项代码可以开始编写运行。但是正式使用的时候，我们需要把加载项发布到生产环境

目前wps提供两种部署方式：jsplugins.xml模式和publish.xml模式。

-   publish模式是通过wpsjs工具包的wpsjs publish命令打包，将生成的文件夹下的所有文件部署到打包时填写服务器地址去。告知用户publish.html地址，业务系统开发商可将publish.html的功能按需整合到自己的页面中，便于做基础环境监测。也可以复用此页面给到用户，用户可自己控制启用和禁用哪些加载项。
-   jsplugins.xml模式是通过设置oem.ini配置文件的JSPluginsServer的值为加载项管理文件jsplugins.xml来控制加载项的加载（相当于WPS加载项列表文件），二次打包时，业务开发商需要告知我们JSPluginsServer的配置地址，将其配置到oem.ini文件中，业务开发商再做安装包分发。后续的加载项的控制用，业务开发商可以自由的更改jsplugins.xml文件，实现加载项的新增，修改。

### publish模式：

1、执行发布命令：wpsjs publish

![](https://oscimg.oschina.net/oscnet/up-543efd797e2118118ecb6b053fe78919602.png)

2、输入你打算部署wps加载项的服务器地址，本例是 [http://localhost/wps-host/](http://localhost/wps-host/) ，注意必须要有结尾的斜杠

![](https://oscimg.oschina.net/oscnet/up-01b8de1d2739cef562ecc606fdeed2dc4f1.png)

3、按照提示，把 wps-addon-build 目录下的文件部署到服务器目录。我本地配置了nginx代理，服务器目录是D:/static_folder/wps-addon-build/，可通过 [http://localhost/wps-host/](http://localhost/wps-host/) 访问打包出来的文件。

如果部署地址下的ribbon.xml（[http://localhost/wps-host/ribbon.xml](http://localhost/wps-host/ribbon.xml)）可以正常访问，说明代码部署成功了。

nginx关键配置如下

![](https://oscimg.oschina.net/oscnet/up-f1e42197e0fb8303dfdc22e946710dc42fe.png)

如果想学习nginx可参考另一篇博文：[如何优雅地在Windows上使用Nginx](https://my.oschina.net/codingDog/blog/1483905)

4、按照提示把 publish.html 也部署到服务器上，通过访问服务器上的publish.html 实现加载项的加载和卸载操作。当存在多个加载项时，在每一个加载项项目下都执行一次wpsjs publish，并且将每个加载项单独部署即可。本例的地址是：[http://localhost/wps-host/publish.html](http://localhost/wps-host/publish.html)

5、浏览器打开publish.html 的线上地址，点击“安装”，等页面按钮变成“卸载”，状态显示“正常”，则表示加载项安装成功，如图：

![](https://oscimg.oschina.net/oscnet/up-1ab50de2b3869fdb926072e95211b81b6d6.png)

6、这时候重启wps，打开一个空白电子表格，如果出现debug时的“wps加载项实例”则表示加载项在线安装生效了

7、如果以上步骤都没问题，但是就是没出现“wps加载项实例”，可以试着把wps安装目录/office6/cfgs/oem.ini文件的JsApiPlugin=true改为JsApiPlugin=false 。

### jsplugins.xml模式

1、执行生产环境打包命令：wpsjs build

![](https://oscimg.oschina.net/oscnet/up-e43e059bfdec11e0180394f1e82e9657222.png)

2、离线和在线的方式各有优缺点：

在线插件——

-   优点：加载比较平滑，用户首次加载或版本更新后的用户初次访问时间会比离线模式高，且每次都是使用最新的代码
-   缺点：每次执行时，都是去请求服务器上的资源，比较浪费网络资源，并且网络不好时，不能访问。
-   总结：在线模式适合在资源频繁改动，且网络稳定的情况下使用

离线插件——

-   优点：只要name_version等于加载项文件夹的名字，加载项就不会去更新加载项的包，采用本地的加载项包资源，大大的节省网络资源和用户的时间。
-   缺点：初次加载或版本变更时，都会先去下载整个加载项包，并解压，会比较耗费时间
-   总结：离线模式适合资源改动不频繁的情况

我这里选择在线插件

![](https://oscimg.oschina.net/oscnet/up-ce8c6538b61409858e42b8291e68b712e56.png)

3、按照提示，将目录wps-addon-build下的文件署到服务器，然后将加载项的地址配置到原有的jsplugins.xml文件中，如果没有，新建一个jsplugins.xml文件，将加载项的地址配置到该文件。将oem.ini文件中的JSPluginsServer的值写成jsplugins.xml文件的部署地址。

参考：

[wpsjs工具包使用](https://www.kdocs.cn/l/cASCu9B0G)

[加载项在线模式和离线模式](https://www.kdocs.cn/l/cBk8tsBIf)