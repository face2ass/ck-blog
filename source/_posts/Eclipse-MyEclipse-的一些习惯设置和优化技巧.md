---
title: Eclipse / MyEclipse 的一些习惯设置和优化技巧
date: 2016-10-12 10:47
categories:
- [技术, 工具]
tags:
- Eclipse
- Java
---
1、**修改当前工作区下所有项目编码**：Window->Preferences->General->Workspace->Text File Encoding 改为 UTF-8

2、**隐藏工具栏图标**：Window->Customize Perspective ->Tool Bar Visibility

3、**修改字体**：Window->Preferences->General->Appearance->Colors and Fonts
<!-- more -->
4、**修改默认打开视图**： Window->Preferences->General->Editor->File Associations->（修改视图）

5、**将 tab 替换为 4 个空格**：Window -> Preferences -> General -> Editors -> Text Editors，选中 “Inserts spaces for tabs”

6、**修改打开 / 关闭 Eclipse 时加载的插件和提示**（解决卡顿）：Window->Preferences->General->Startup and Shutdown

7、**修改 Java 文件换行宽度**：Window->Preferences->Java->Code Style->Formatter->new（内嵌样式无法编辑，必须新建）-> 选择 Line Wrapping 的 Tab->Maximum line width；同时修改注释的最大行宽，选择 Comments 的 Tab->Maximum line width for comments;

8、**修改 Jp 文件换行宽度**：Window->Preferences->Web->HTML Files->Editor-> 修改 Formatting 下的 Line width

9、**修改 MyEclipse 中 Jsp 默认编码**：Window->Preferences->Myeclipse->Files and Editors->Jsp 的 Encoding 改为 UTF-8

10、**修改 Eclipse 中 Jsp 默认编码**：Window–>Preferences–>Web–>JSP Files->JSP-> Encoding

11、**恢复 Eclipse 默认设置**：进入 Eclipse 工作路径（通过 File->Switch Workspace->Other... 可知）-> 删除.metadata 文件夹

12、**MyEclipse 监视内存状态**：Myeclipse->Utilities->Show Heap Status

13、**Eclipse 监视内存状态**：Window->Preferences->General-> 勾选 Show heap status

14、**代码补全自动提示**：Window->Preferences->Java->Editor->Content Assist->Auto activation triggers for java

15、**MyEclipse 使用外部 maven**：Window–>Preferences–>MyEclipse–>Maven4MyEclipse–>Installations；同时修改用户配置：Window–>Preferences–>MyEclipse–>Maven4MyEclipse–>User Settings

16、**Eclipse 使用外部 maven**：Window–>Preferences–>Maven–>Installations；同时修改用户配置：Window–>Preferences–>Maven–>User Settings

17、**将 JRE 版本改为默认**：Configure Build Path->Edit JRE Library-> 选 Workspace Default JRE（以防别人机子上的 jdk 版本不同）

18、**JDK 不使用 MyEclipse 自带的 JRE**：Window->Preferences->Java->Installed JREs->Search

19、**Myeclipse 2013 中去除 derby**：安装目录 \configuration\org.eclipse.equinox.simpleconfigurator\bundles.info，搜索 derby 注释整行

20、**加大 Myeclipse 中 Console 的显示行数**：Window->Preferences->Run/Debug->Console，去掉对 Limit console output 的选择，或者选择后设置 buffer size 值

21、**禁止 Myeclipse 自动弹出控制台**：Window->Preferences->Run/Debug->Console，取消勾选 Show when program writes to standard out（当 console 中有输出时弹出）前的选项和 Show when program writes to standard error（当 console 中有错误时弹出） 前的选项

22、**Eclipse 中查看当前工程的 JDK（编译）版本**：项目 -> 右键 ->properties->Java Complier

23、**Eclipse 中查看 / 修改当前工程的 JRE 版本**：项目 -> 右键 ->Run As->Run Configurations->Java Application-> 项目名 ->JRE

24、**Eclipse 中查看 / 修改代码模板**：Window->Preferences->Java->Editor->Templates

25、**删除 Server 视图下的 Myeclipse Tomcat**：Myeclipse Tomcat-> 右键 ->Configure Server Connector-> 勾选 Disable

26、**修改 JVM 最大可用内存**：eclipse 安装目录 -> 打开 eclipse.ini-> 修改 - Xmx 值

27、**查看 Myeclipse 启动时默认的 JVM（JRE）**：Window->Preferences->Help->about Myeclipse->Installation Details->-vm 下的参数

28、**修改 Myeclipse 启动时默认的 JVM（JRE）**：

①直接把要使用的 JRE 文件夹拷贝到 Eclipse 目录下；

②修改 eclipse.ini 文件，添加 - vm 参数，指定要运行的虚拟机的地址，使用 - vm 命令行自变量例子：-vm c:\jre\bin\javaw.exe

③修改 MyEclipse 或者 Eclipse 启动的快捷方式。在快捷方式上 “右键”---->“属性” 例如：

默认情况下，我的 MyEclipse 的快捷方式属性是：
- 目标：`"D:\Program Files\MyEclipse 6.0\eclipse\eclipse.exe" -vm "d:\Program Files\MyEclipse 6.0\jre\bin\javaw.exe"`
- 启始位置：`"d:\Program Files\MyEclipse 6.0\eclipse"`

只需要把目标的内容进行修改，例如我修改为`"D:\Program Files\MyEclipse 6.0\eclipse\eclipse.exe" -vm "D:\Program Files\jdk1.6.0_24\bin\javaw.exe"`

29、**修改 Copy 来的项目 web 路径名**：项目 -> 右键 ->properties->MyEclipse–>Project Facets-> Web->Web Context-root

30、**添加 User Libraries**：Window->Preferences->Java->Build Path->User Libraries

31、**Myeclipse 验证 jquery 错误的问题**：jquery-1.8.0.min.js-> 鼠标右键 -> MyEclipse -> manage validation -> 左面点击 -> Excluded resources -> 找到 jquery.js -> 打上钩 -> apply

32、**重新提示工作路径**：Myeclipse 安装目录 \configuration\.settings\org.eclipse.ui.ide.prefs ，修改 SHOW_WORKSPACE_SELECTION_DIALOG=true 或者 Window->Preferences->General->Startup and Shutdown->Workspaces

或 Window->Preferences->Java->Java dialogs->Clear 按钮

33、**查看 MyEclipse 包含的 Eclipse 的版本号**：打开安装目录下 readme 文件夹里的 readme_eclipse.html 文件或在控制台输入 java -version

34、**将 Myeclipse 自带类库中的某个 jar 包移除**：项目 -> 右键 ->Build Path->Configure Build Path-> 选中需要修改的类库 ->Edit-> 勾选 Enable project specific advanced configuration

35、**在 package 视图下用树形结构查看库**：点击左侧浏览视图的箭头 ->Package Presentation->Hierarchical

36、**隐藏当前工作环境中关闭的工程**：点击左侧浏览视图的箭头 ->Filters...-> 勾选 Closed projects

37、**修改 xml 文件格式化时的最大行宽**：Window–>Preferences–>MyEclipse–>Files and Editors->XML-> XML Source->Line width

38、**关闭拼写检查**：Window->Preferences->General->Editor->Text Editors->Spelling-> 取消勾选 Enable spell checking 前的复选框

39、**关闭 Maven4Myeclipse 插件在 Myeclipse 启动时 updating indexes**：Window => Preferences => Myeclipse=> Maven4Myeclipse 取消勾选的 Enable Maven4MyEclipse features

40、**Eclipse 设置 new 菜单的内容**：Window->Customize Perspective->Menu Visibility->File->New

41、**xml 自动提示**：Window–>Preferences–>MyEclipse–>Files and Editors->XML-> XML Files-> XML Catalog，选择 Key type 为 URI，其他类似下面 ——

key: http://struts.apache.org/dtds/struts-2.0.dtd

location: 对应的 dtd 文件，位于 struts-core 包中，解压开，指定相应位置，如：D:\share\0750_Struts2.1.6\soft\struts-2.1.6\lib\struts2-core-2.1.6\struts-2.0.dtd

42、**在本源文件中高亮显示相同的字符串**：Java->Editor->Mark Occurrences-> 勾选 Mark occurrences of the selected element in the current file