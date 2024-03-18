---
title: Windows上安装MongoDB较为详细的教程
date: 2016-02-27 11:38
categories:
- [技术, 后端, 数据库]
tags:
- MongoDB
---

> 先前写了一篇关于 MongoDB 聚合查询的博文，里面的实验一直使用的是公司搭建好的 Mongo 环境，作为一个还未入门的新手，学会自己搭建运行环境还是相当必要的，既方便测试，也能更深入的了解 Mongo。


*ps：开始教程前要先注意一下自己的 Windows 版本，MongoDB 从 2.2 版本开始就不再支持 Windows XP*
<!-- more -->

# 安装 MongoDB
1. 首先，从官网下载 [MongoDB](https://www.oschina.net/action/GoToLink?url=http%3A%2F%2Fwww.mongodb.org%2Fdownloads) ，安装包有 zip 和 msi 格式，两者没太大区别，msi 其实就是自动解压缩而已，安装目录就是解压缩目录，默认解压到 C:\mongodb。要说两者的区别就是.msi 可以用来升级已安装的旧版本。我这里选择解压 / 安装到 **D:\MongoDB**（Windows 的文件系统记录但不区分大小写）；
2. 将 MongoDB 添加到环境变量（可选）：新建系统变量 MONGODB_HOME，值为 D:\MongoDB ，在 Path 变量下添加 **%MONGODB_HOME%\Server\3.0\bin;**  ；
3. 创建数据存储目录，比如 **D:\MongoData\db**，建议不要和安装目录相同，防止以后数据库升级出现问题；
4. 启动 MongoDB 服务：**D:\MongoDB\Server\3.0\bin\mongod --dbpath D:\MongoData\db**，（如果 dbpath 存在空格，则需要加英文半角双引号，--dbpath "D:\MongoData\mongo db data"）；
5. 进入 MongoDB 的 bash：另起一个 CMD 窗口，执行 **D:\MongoDB\Server\3.0\bin\mongo** （如果设置了环境变量，直接输入 mongo 即可）；
6. 出现下图表示可以开始使用 MongoDB 了。
![](cmd.webp)


# 配置 MongoDB
以后每次要使用 MongoDB，都要重复步骤 4 ~ 6，如果嫌每次输入太麻烦，可以把上述的命令全部写到一个.bat 文件，只要双击即可运行。下面来介绍另一种方法：把 MongoDB 安装为 Windows Service。

1、以管理员身份打开 CMD：
Windows 7 / Vista / Server 2008 (或 R2) 的打开方式：先按 Win + R，输入 cmd，然后按 Ctrl + Shift + Enter
Windows 8 的打开方式：先按 Win + X，然后按 A。

2、为日志文件和配置文件创建目录：
```bash
mkdir D:\MongoData\logs
mkdir D:\MongoData\cfg
```

3、创建配置文件并添加 logpath 和 dbpath 配置项：
```bash
echo logpath=D:\MongoData\logs\mongod.log> "D:\MongoData\cfg\mongod.cfg"
echo dbpath=D:\MongoData\db>> "D:\MongoData\cfg\mongod.cfg"
echo logappend=true>> "D:\MongoData\cfg\mongod.cfg"
```
logappend=true 表示日志在 mongod.log 后追加，默认为 false，表示每次创建一个新文件，详细的配置项见官网：[http://docs.mongodb.org/v2.4/reference/configuration-options/](https://www.oschina.net/action/GoToLink?url=http%3A%2F%2Fdocs.mongodb.org%2Fv2.4%2Freference%2Fconfiguration-options%2F)
MongoDB 在 2.6 版本以后引入了使用 YAML 格式的配置文件，有兴趣的童鞋可以去研究一下：[http://docs.mongodb.org/manual/reference/configuration-options/](https://www.oschina.net/action/GoToLink?url=http%3A%2F%2Fdocs.mongodb.org%2Fmanual%2Freference%2Fconfiguration-options%2F)

4、添加名为 MongoDB，显示为 MongoDB，描述为 MongoDB Server 的 Windows 服务：
方法①
```bash
mongod --config D:\MongoData\cfg\mongod.cfg --install 或 mongod -f D:\MongoData\cfg\mongod.cfg --install
```
方法②
```bash
sc.exe create MongoDB binPath= "\"D:\MongoDB\Server\3.0\bin\mongod.exe\" --service --config=\"D:\MongoData\cfg\mongod.cfg\"" DisplayName= "MongoDB" start= "auto"
```

5、启动和停止服务：
```bash
net start MongoDB
net stop MongoDB
```

6、删除 Windows 服务：
方法①
```bash
mongod --config D:\MongoData\cfg\mongod.cfg --remove 或 mongod -f D:\MongoData\cfg\mongod.cfg --remove
```
方法②
```bash
sc.exe delete MongoDB
```

# tips：
win8 中如何让 cmd.exe 始终以管理员身份运行：
1. 先按 Win + X，然后按 A，输入 regedit，按 Enter 打开注册表编辑器；
2. 进入 Layers 项：**HKEY_CURRENT_USER\Software\Microsoft\Windows NT\CurrentVersion\AppCompatFlags\Layers**，如果 Layers 不存在可自己新建；
3. 在该项上右键 -> 新建一个字符串值，命名为 **C:\Windows\System32\cmd.exe**，双击编辑该字符串，数值数据填 RUNASADMIN，确定后退出，打开新的 CMD 窗口，左上角显示 “管理员” 表示操作成功，如果没有可以先注销系统再重新进入。