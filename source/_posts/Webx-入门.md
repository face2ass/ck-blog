---
title: Webx 入门
date: 2016-10-12 11:24
categories:
  - [技术, 后端]
tags:
  - Webx
  - Java
---
### Webx Turbine 处理请求：

当一个 HTTP 请求到达时，首先由 WebxFrameworkFilter 接手这个请求，下图是 WebxFrameworkFilter 处理一个 WEB 请求的过程：
![](/images/webx-1.webp)

如图所示，WebxFrameworkFilter 接到请求以后，就会调用 WebxRootController。从这里开始，进入 Spring 的世界 —— 此后所有的对象：WebxRootController、WebxController、RequestContext、Pipeline 等，全部是通过 SpringExt 配置在 Spring Context 中的。
<!-- more -->
WebxRootController 对象存在于 root context 中，它被所有子应用所共享。它会创建 RequestContext 实例 —— 从而增强 request、response、session 的功能。接下来，WebxController 对象会被调用。

WebxController 对象是由每个子应用独享的，子应用 app1 和 app2 可以有不同的 WebxController 实现。默认的实现，会调用 pipeline。

Pipeline 也是由各子应用自己来配置的。假如 pipeline 碰到无法处理的请求，如静态页面、图片等，pipeline 应当执行 <exit/> valve 强制退出。然后 WebxRootController 就会 “放弃控制” —— 这意味着 request 将被返还给 / WEB-INF/web.xml 中定义的 servlet、filter 或者返还给 servlet engine 本身来处理。

Webx 框架会自动搜索 / WEB-INF 目录下的 XML 配置文件，并创建下面这种级联的 spring 容器。
![](/images/webx-2.webp)

框架会将一个 WEB 应用分解成至少一个应用模块（子容器），如 app1、app2。每个小应用模块独享一个 Spring Sub Context 子容器，且子容器之间的 beans 无法互相注入。所有小应用模块共享一个 Spring Root Context 根容器。根容器中的 bean 可被注入到子容器的 bean 中，反之不可以。

假设请求这样一个地址：[http://localhost:8081/simple/count.htm?to=10](https://www.oschina.net/action/GoToLink?url=http%3A%2F%2Flocalhost%3A8081%2Fsimple%2Fcount.htm%3Fto%3D10)，处理流程如下：

1. 找到 Context Path（simple）和 Servlet Path（count.do），web.xml 中配置的 Webx Controller Servlet 接管了该请求；————
2. Webx Controller Servlet 激活 pipeline；
3. <analyzeURL /> 节点：分析 URL，webx 默认把 /*.htm 转换成 /*.vm，得到取得 target（simple/count.vm）；
4. <performAction /> 节点：到 webx-*.xml 配置的包扫描路径（services:module-loader 节点）下查找类 xxx.action.Count，处理表单；
5. <performTemplateScreen /> 节点：根据 target 查找 screen 模板类（xxx.screen.simple.Count 或 xxx.screen.simple.Default），并执行对应的的 execute 方法；
6. <renderTemplate> 节点：根据 target 查找 screen 模板（/templates/screen/simple/count.vm）后渲染，然后试着查找 layout 模板（/templates/layout/simple/count.vm 或 /templates/layout/simple/default.vm 或 /templates/layout/default.vm），找不到就直接渲染 screen 模板，否则 Layout 模块会调用适当的 Screen 模块，并自动从 Screen 模块返回的代码替换进 $screen_placeholder 里。

ps：Layout 模板和 screen 模板中，都可以调用 control。每个页面只有一个 screen，但是可以有任意多个 controls。



### 创建 webx 测试工程：
1、Eclipse 创建 maven 工程，选择 maven-archetype-webapp 这个 artifactId；
2、修改 web.xml；
3、修改 pom.xml；
3、创建一个子应用：
> 1）在 src/main/java 目录下创建 com.webx.test.module 包，module 用来接受页面数据和渲染页面；
> 2）创建 webapp/webx_test/templates 文件夹，用来存放页面的模板 vm 文件；
> 3）创建文件子应用 test 的 webx 配置： webapp/WEB-INF/webx-test.xml，；
> 4）创建表单验证的配置文件：webapp/WEB-INF/webx_test/form.xml；
> 5）在 webapp/webx_test/templates 文件夹下创建三个目录：control（主要存放页面上的公共按钮模板）、layout（主要存放页面的布局模板）、screen（主要存放页面的主体内容模板）