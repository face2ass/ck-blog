---
title: 在威联通上部署Jellyfin并开启硬解
date: 2022-02-18 13:46:00
tags:
---

> 本文主要参考了文章 [威联通非官方入坑手册 篇六：3分钟部署Jellyfin开启硬解，打造最好用的家庭影音中心，免费！Emby、Plex靠边下](https://post.smzdm.com/p/ad2vzx5d/) 和 [威联通Docker教程 篇六：三种方式安装Emby和Jellyfin，家庭影院搭建保姆级教程，成功开启硬件转码！](https://post.smzdm.com/p/a7837qdg/)。没多少原创内容，基本都是对两篇文章的细节整理

## 部署Jellyfin

Jellyfin的部署有有三种方式

#### 第一种：下载qpkg文件，通过app center直接安装

#### 第二种：通过Container Station直接拉取

但是如果有些参数设错了需要重新安装才能再次设置参数（最主要的是，不能看到默认参数、之前设置的参数），所以不推荐，但是简单啊，想用这个方式快速搭建的可以参考这篇文章：[威联通Docker教程 篇六：三种方式安装Emby和Jellyfin，家庭影院搭建保姆级教程，成功开启硬件转码！](https://post.smzdm.com/p/a7837qdg/)；
<!-- more -->
#### 第三种：抄作业，使用Docker管理工具Portainer进行安装，开启硬解

如何安装Portainer请阅读这篇文章：[威联通非官方入坑手册 篇五：Nas党必学！解锁Nas高端玩法，超好用的docker管理部署工具Portainer保姆级教程](https://post.smzdm.com/p/az3k85gr/)

### 设置参数进行部署

登录Portainer，进入“Containers”→“Add container”。

![](https://oscimg.oschina.net/oscnet/up-b6ed41e3b69e08991fa2c8a3201ddb6e2f6.png)

分别设置好镜像名字“Jellyfin”→选用“aliyun”镜像加速，喝着酸酸乳的小伙伴可以直接拉docker hub，→输入镜像名称“jellyfin/jellyfin:latest"，→添加一个网络端口映射，默认端口是8096，设置为自己喜欢的端口。

![](https://oscimg.oschina.net/oscnet/up-31bbdbe167ae5df876bb5d74b71934578f9.png)

如上文所说，奶爸通常是直接按照默认参数设置先安装一下，这样就能很清楚的看到都有哪些[文件夹](https://www.smzdm.com/fenlei/wenjianjia/)、文件等需要进行映射。大多数容器需要映射的文件夹都不相同，这样就能省去先做功课的麻烦。抄作业的话只需要跟着奶爸的操作步骤来：将页面拉到最下方，点击”Volumes“→”“map additional volume”→“添加cache、config、media”三个文件夹，点击“Bind”进行物理路径映射。威联通设备的路径映射依照“/share/CACHEDEV1_DATA/”+“共享文件夹名称”+“目标文件夹的”的形式。如果不想折腾，直接按照下图抄作业就好。

![](https://oscimg.oschina.net/oscnet/up-055f692dbb25840acb10032a487767c6c64.png)

进入到“Restart policy”选择重启策略，一般都选用“Always”，设备重启后容器跟着启动，如果选择Never，设备重启容器不会自动启动。

![](https://oscimg.oschina.net/oscnet/up-da42a6d31f17e8a7b8bce124e4559bfafde.png)

**接下来添加“硬件解码”设备**

这里不得不提醒一下大家，并不是所有的NAS都支持硬件转码功能。![三种方式安装Emby和Jellyfin，家庭影院搭建保姆级教程，成功开启硬件转码！Docker](https://res.smzdm.com/images/emotions/23.png)也不是只有转码才能正常使用，**不转码一样可以在内网下流畅的进行播放**。

很多性能比较低的nas虽然不能够硬件转码，但也可以用串流的方式在客户端软解或硬解播放。![三种方式安装Emby和Jellyfin，家庭影院搭建保姆级教程，成功开启硬件转码！Docker](https://res.smzdm.com/images/emotions/22.png)

所以，关于转码的需求，看个人，一般就体验体验这个网页，也可以不开转码体验，搭建会更快一些！

不管是Jellyfin 还是 Emby，都可以将您电脑下载的影片，自动生成电影海报墙，我们把这个功能叫做刮削：

刮削电影海报，也是这些平台的亮点！![三种方式安装Emby和Jellyfin，家庭影院搭建保姆级教程，成功开启硬件转码！Docker](https://res.smzdm.com/images/emotions/33.png)

如果海报刮削不完整，很可能是影片命名有问题！可以用[TMM工具](https://post.smzdm.com/p/a4wkqw37/)手动刮削一次，一劳永逸！

先测试下你的机器是否支持硬解![三种方式安装Emby和Jellyfin，家庭影院搭建保姆级教程，成功开启硬件转码！Docker](https://res.smzdm.com/images/emotions/24.png)。

#### 检测是否支持硬解

1、打开NAS上的控制台，在下图这个地方，将SSH这个选项打勾：

![](https://oscimg.oschina.net/oscnet/up-4acd366c990aa17c3bed9b40a18d1b738d7.jpg)

2、然后下载PuTTY工具，这个工具就2MB，很小，下载地址：[链接](https://www.onlinedown.net/soft/2186.htm)

下载后，默认下一步安装即可：![三种方式安装Emby和Jellyfin，家庭影院搭建保姆级教程，成功开启硬件转码！Docker](https://res.smzdm.com/images/emotions/33.png)

![](https://oscimg.oschina.net/oscnet/up-b28d939b9f6a466cd5b4cf36f5beabbaa26.jpg)

3、我们在这里输入NAS的IP地址，然后直接点击Open：![三种方式安装Emby和Jellyfin，家庭影院搭建保姆级教程，成功开启硬件转码！Docker](https://res.smzdm.com/images/emotions/43.png)

![](https://oscimg.oschina.net/oscnet/up-600db0d183204e351ef134d26478f4b3d6a.jpg)

4、遇到这个提示，直接点击是：![三种方式安装Emby和Jellyfin，家庭影院搭建保姆级教程，成功开启硬件转码！Docker](https://res.smzdm.com/images/emotions/35.png)

![](https://oscimg.oschina.net/oscnet/up-5660f04420d2230a859b025346b76862757.jpg)

7、然后登录NAS，这里输入用户名回车，再输入密码，密码是不可见的，输入完回车：

![](https://oscimg.oschina.net/oscnet/up-190f7cd78542aafd502060f2cf66d1d7fab.jpg)

8、登录了以后，我们输入代码：ls /dev/dri

如果这里出现了 renderD128，恭喜您，您的NAS支持硬件转码，如果您的下面没有出现这个，那么可以安心的不用硬件转码功能了！![三种方式安装Emby和Jellyfin，家庭影院搭建保姆级教程，成功开启硬件转码！Docker](https://res.smzdm.com/images/emotions/111.png)

进入到“Runtime & Resources”标签→点击“add device”添加设备→两边都填“/dev/dri/renderD128”就可以。

![](https://oscimg.oschina.net/oscnet/up-76dcb4d9c7f9548224ee784879cdae09889.png)

至此参数设置完成，鼠标往上面滑一下下，点击箭头所示按钮“Deploy the container”，Jellyfin的镜像就开始拉取啦，拉取完成后自动安装，拉取时间视有没有开启加速，有没有喝酸酸乳而定。

![](https://oscimg.oschina.net/oscnet/up-acbd6146254473c9a24fdb302e90e8a2bea.png)

### 设置Jellyfin

进入到Jellyfin的初始化向导，首选语言“简体中文"。

![](https://oscimg.oschina.net/oscnet/up-2a22c064a26d2c859dfd66ee83a09bea713.png)

设置用户和密码，这个可以当作管理员账号。

![](https://oscimg.oschina.net/oscnet/up-822d4266948c2e953e05e39e886f4dcf265.png)

下一步添加媒体库：

![](https://oscimg.oschina.net/oscnet/up-179da23cf1a031869457c1327a1ec464bc3.png)

在选取文件路径的时候可能会出现默认没有你设置的文件夹的情况，只需要点击”...“，找到Jellyfin内部media文件夹即可。奶爸的media文件夹映射的是Multimedia共享文件夹，下面放了Movie、Music、Tv。

![](https://oscimg.oschina.net/oscnet/up-23ec6f05504a5d1bc2f7af25fc2824713b2.png)

Jellyfin设置国家的时候有”Hong Kong S.A.R“→”香港特别行政区“。嗯，给个好评。

![](https://oscimg.oschina.net/oscnet/up-a3dd6b748811b6db4033a1f874337848e31.png)

选择下载语言Chinese，国家”中华人民共和国“，电影源数据下载器这里不建议勾选。

![](https://oscimg.oschina.net/oscnet/up-7efb67a16cda7032c2557bb2654e4683013.png)

如果这里选择了电影源数据下载器，而你又没有美味的酸酸乳喝的话，设置好后你会发现：空空如也，折腾了个寂寞。

![](https://oscimg.oschina.net/oscnet/up-189f7cbde71632ff376960a3cddec76c6fe.png)

设置”将媒体图像保存到媒体所在文件夹“，是否提取剧集照片看个人爱好，奶爸没安好。

![](https://oscimg.oschina.net/oscnet/up-aac4424e5d23afb00099b17ae58f624b811.png)

设置”首选元数据语言“。

![](https://oscimg.oschina.net/oscnet/up-321f3fa2e3593c88ac7d6863188f1b1f9e2.png)

配置远程访问，允许远程连接，端口映射的活就交给[路由器](https://www.smzdm.com/fenlei/luyouqi/)去做就可以了。

![](https://oscimg.oschina.net/oscnet/up-75ef146368fac68904298a292450b27add7.png)

设置完成，登录。

![](https://oscimg.oschina.net/oscnet/up-82bfeb924e6b63b1b45e7d64454ae8e564f.png)

### 开启硬件解码

登陆后进入“控制台”。

![](https://oscimg.oschina.net/oscnet/up-ff94db9efd3afccb274ffa362a68de2459f.png)

进入“播放”功能标签，转码选择“VAAPI”。

![](https://oscimg.oschina.net/oscnet/up-f2162c2eef56776a5675733c2d031291137.png)

可以看到VA API设备就是我们刚刚设置的renderD128。

![](https://oscimg.oschina.net/oscnet/up-24b0bfc32c65167a1ee0e9cb83cf831a9de.png)

找一个视频来测试一下，这里选用的是《小丑》质量选择720p。

![](https://oscimg.oschina.net/oscnet/up-9ef65ebc65be6a15a124fcf5934e8b0d211.png)

在不开启硬件转码的情况下，CPU占用直冲99%，我寻思着是因为100%实在冲不破，要是能冲破早就200%了。

![](https://oscimg.oschina.net/oscnet/up-ee247bf4a27fc1372f01346aae960562876.png)

开启硬件转码后CPU占用下降至80%，Nas也能进行操作了，成功。

![](https://oscimg.oschina.net/oscnet/up-46e12c957e7ce5e31cfc49c700a0e290247.png)

### 扫描媒体库

依旧进入控制台→媒体库→添加媒体库，按照之前的扫描即可，TV、Music、movie啥的自己整。

![](https://oscimg.oschina.net/oscnet/up-6c95bd3ae3dce2d2ee19a24828ba52efb99.png)

## 关于播放器的选用

### 手机端

手机端首推nPlayer，安卓和IOS都有，安卓小伙伴们还能搜索到开心版，IOS是付费的，有兴趣的小伙伴可以找我白嫖，在内网外网都适用。支持杜比，在”网络位置“添加服务器即可，主机填写为我们的域名地址，用户名密码不用说了，加个端口就完成。外网的情况下可以使用webdav访问。如果有需要的话，之后可以专门做一期文章

![](https://oscimg.oschina.net/oscnet/up-6b2e521bcf11c7d91c0d61fa6f6b9f609d3.png)

IOS还有独享的infuse 可以使用，海报墙是亮点。

![](https://oscimg.oschina.net/oscnet/up-16ee35e77af2127ee17ae84aeb63f8b4636.png)

infuse相关教程见这篇文章：[手把手带你玩转NAS 篇十：借助FTP轻松打造移动影院——可能是最棒的串流视频播放器infuse](https://post.smzdm.com/p/a4wkmxpl/)

### PC端和TV端

推荐使用官方的[Jellyfin Media Player](https://github.com/jellyfin/jellyfin-media-player)。或者官方列出的其他客户端：[https://jellyfin.org/clients/](https://jellyfin.org/clients/)