---
title: 如何获取一张普通图片的深度贴图（DepthMap）
date: 2020-02-09 18:35:00
tags:
---

> 文章里面的东西虽然涉及了人工智能，但是还是选择投在了前端的版块，一来延续上一遍的内容，二来自己对AI这块连入门都算不上，避免被众大佬嗤笑，但是也欢迎大佬们说出里面的纰漏和不严谨的地方，3Q   (〃'▽'〃)

上个教程讲了深度贴图的其中一个应用——生成3D效果的图片。这篇文章称热打铁，说下如何获取深度贴图吧。
<!-- more -->
如果你用过Unity、UE等游戏引擎或者Blender、Maya等三维制作软件，获取一个场景的深度贴图应该不是问题，鄙人没玩过这些，这里只说一下只有一张图片如何获取深度贴图。

假设你用支持拍摄出带深度信息的设备获取了一张文件后缀是heic的图片，可以在mac电脑中用PS打开，然后切换套通道标签，就能看到除RGB外的另一个通道，这个就是D通道（也有叫景深通道的）。因为ps打开heic文件需要硬件解码，所以得系统支持，windows应该是暂时没有这类驱动。

如果你是windows系统的电脑，可以使用一个叫[StereoPhoto Maker](http://stereo.jpn.org/eng/stphmkr/index.html)的工具来解压出heic文件中的隐藏数据。就是这个工具：![](/images/depth_map_1.png)

如果你只有一张普通的图片，可以使用ps手动绘制出深度贴图，网上有很多教程，直接去油管搜“3d photo ps”这几个关键字就有一堆视频教你如何制作。

重头戏来了，毕竟咱们是程序员不是设计师，总得想个“程序化”的办法来做到，我自己是不会写啦，不过咱们可以谷歌AI来帮我们做到。

1. 首先下载安装Python3.x版本，如果你的电脑已经装了2.x版本，建议用pyenv库来切换版本。
2. 接下来，下载安装VS2015运行时环境，如果你已经装了2015的开发环境或者更高版本的运行时环境就不用再次下载了，这里提供一个下载地址：[Microsoft Visual C++ 2015 Redistributable Update 3](https://www.microsoft.com/en-US/download/details.aspx?id=53587)。
3. 安装Python的深度学习框架Pytorch和torchvision。管理员方式打开终端，输入：

   ```bash
   pip3 install https://download.pytorch.org/whl/cu90/torch-1.1.0-cp37-cp37m-win_amd64.whl
   pip3 install https://download.pytorch.org/whl/cu90/torchvision-0.3.0-cp37-cp37m-win_amd64.whl
   ```

   网络不好的话，你也可以下载两个离线文件手动安装

4. 安装另外三个库：scikit-image，h5py，scipy。有兴趣的可以去github上了解下
5. 下载深度学习程序：[2dtodepth.zip](http://stereo.jpn.org/jpn/stphmkr/google/2dtodepth.zip)。解压出来的内容全都放到C盘根目录：**C:\\2dtodepth
   **
6. 把你需要转换的图片文件放到**C:\\2dtodepth\\infile**目录下
7. 执行**C:\\2dtodepth\\prog\\2dtodepth.bat**脚本文件
8. 执行完后，你就能在**C:\\2dtodepth\\outfile**文件夹下看到包含原图和深度图的图片了

还没完呢，如果是电脑没有安装python，也懒得搞这一堆东西，那还有更简单的方式，不过请自带梯子（不得不说谷歌真是一个宝库，国内一刀切全封了对爱折腾的程序员来说真是一大损失）。

咱们可以把程序上传到谷歌云盘（Google Drive），然后使用谷歌的python程序在线编辑器Colaboratory直接调用里面的代码，然后把生成好的文件下载下来就行了！简单说下改怎么做，Colaboratory是个宝库，非常建议一玩。

1. 当然要先创建一个谷歌账号详细不说了
2. 下载并解压这个文件[2dtodepth_colab.zip](http://stereo.jpn.org/jpn/stphmkr/google/2dtodepth_colab.zip)
   ，把文件夹上传到[Google Drive](https://drive.google.com/)的根目录
3. 和前面本地一样，把要转化的图片上传到**“我的云端硬盘 / 2dtodepth / infile”**目录
4. 打开 [Google Colab](https://colab.research.google.com/) 页面, 选择 **“文件 -\> 新建 Python 3 记事本”**。
5. 在新页面点击上面的文件名可以修改名称
6. 点击 编辑 -\> 笔记本设置，修改参数如图：

   ![](/images/depth_map_2.png)

7. 保存后装载谷歌云盘

   ![](/images/depth_map_3.png)

8. 输入以下代码并运行：

   ```python
   %cd /content/drive/My Drive/2dtodepth
   !python 2dtodepth.py --input=single_view
   ```

   第一行进入工程目录，第二行执行脚本

   ![](/images/depth_map_4.png)

出现这个字样表示执行完毕，这时候就可以去谷歌云盘，到**“我的云端硬盘 / 2dtodepth / outfile”**目录下把文件下载下来啦

![](/images/depth_map_5.png)

这个程序的成功率要具体看你的图片，大部分图还是会有一些瑕疵，可以自己去PS修一修。

人工智能相关的部分内容翻译自这两篇博文，算半个翻译文吧~感谢那位博主。

[Depth Map generation from 2D image by Google AI](http://stereo.jpn.org/jpn/stphmkr/google/indexe.html)

[Creating depth maps from 2D images using Google Colab](http://stereo.jpn.org/jpn/stphmkr/google/colabe.html)