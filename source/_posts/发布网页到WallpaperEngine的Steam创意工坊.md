---
title: 发布网页到WallpaperEngine的Steam创意工坊
date: 2020-07-25 21:23:00
categories:
  - [日常]
tags:
  - Steam
---

Steam重度用户都应该知道[Wallpaper Engine](https://steamcommunity.com/app/431960)这个神器，我们可以把自己的网页发布到创意工坊，供全球网友们作为壁纸下载，是不是成就感瞬间up。那就来看看如何做到吧~
<!-- more -->
```
_______oBBBBB8o______oBBBBBBB 
_____o8BBBBBBBBBBB__BBBBBBBBB8________o88o, 
___o8BBBBBB**8BBBB__BBBBBBBBBB_____oBBBBBBBo, 
__oBBBBBBB*___***___BBBBBBBBBB_____BBBBBBBBBBo, 
_8BBBBBBBBBBooooo___*BBBBBBB8______*BB*_8BBBBBBo, 
_8BBBBBBBBBBBBBBBB8ooBBBBBBB8___________8BBBBBBB8, 
__*BBBBBBBBBBBBBBBBBBBBBBBBBB8_o88BB88BBBBBBBBBBBB, 
____*BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB8, 
______**8BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB*, 
___________*BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB8*, 
____________*BBBBBBBBBBBBBBBBBBBBBBBB8888**, 
_____________BBBBBBBBBBBBBBBBBBBBBBB*, 
_____________*BBBBBBBBBBBBBBBBBBBBB*, 
______________*BBBBBBBBBBBBBBBBBB8, 
_______________*BBBBBBBBBBBBBBBB*, 
________________8BBBBBBBBBBBBBBB8, 
_________________8BBBBBBBBBBBBBBBo, 
__________________BBBBBBBBBBBBBBB8, 
__________________BBBBBBBBBBBBBBBB,
```

开发之前要明确我们需要抽出那些自定义功能，就以上一篇文章的css字画符为例吧。

我们需要给用户提供自定义文本内容、背景颜色、内容缩放、布局方式、字体大小、字体家族，以及一些已配置好的预设，最终发布后的效果如下图。

![](/images/wallpaper_engine_1.png)

第一步，去steam购买[Wallpaper Engine](https://store.steampowered.com/app/431960/Wallpaper_Engine/)并下载安装，就十几块钱，还是很值的~

第二步，创建我们的工程。点击 编辑按钮 进入编辑器，再点击 创建壁纸 按钮，选择项目目录。这时软件会把资源拷贝到，** {软件目录}\\projects\\myprojects\\{项目目录} **，可以通过编辑器左上角的  **Edit -> Open in Explorer**  打开该目录。

![](/images/wallpaper_engine_2.png)

第三步，配置工程。点击**Edit -> Change Project Settings** ，设置标题和主题颜色（方便用户搜索），以及用户自定义配置。

点击 **Add Property** 添加项目的自定义选项，其中Type表示组件类型，有**Color**（颜色选择器）、**Slider**（滑块）、**CheckBox**（选择框）、**Combo**（下拉框）、**Text**（文本框）、**Directory**（目录选择器）、**File**（文件选择器），点击** OK **会在项目目录生成一个 **project.json** 文件，保存配置信息。比如我的工程配置如下：

![](/images/wallpaper_engine_3.png)

生成的 **project.json** 如下：

```json
{
	"contentrating" : "Everyone",
	"description" : "include 4 presets and support local image",
	"file" : "ascii_art_css.html",
	"general" : 
	{
		"properties" : 
		{
			"background_image" : 
			{
				"condition" : "preset.value=='0'",
				"order" : 106,
				"text" : "background image",
				"type" : "file",
				"value" : ""
			},
			"custom_font_family" : 
			{
				"condition" : "font_family=='0'",
				"order" : 104,
				"text" : "custom font family",
				"type" : "textinput",
				"value" : ""
			},
			"font_family" : 
			{
				"options" : 
				[
					{
						"label" : "自定义(Custom)",
						"value" : "0"
					},
					{
						"label" : "黑体(SimHei)",
						"value" : "SimHei"
					},
					{
						"label" : "微软雅黑(Microsoft Yahei)",
						"value" : "Microsoft Yahei"
					},
					{
						"label" : "微软正黑(Microsoft JhengHei)",
						"value" : "Microsoft JhengHei"
					},
					{
						"label" : "楷体(KaiTi)",
						"value" : "KaiTi"
					},
					{
						"label" : "宋体(SimSun)",
						"value" : "SimSun"
					},
					{
						"label" : "苹方(PingFang SC)",
						"value" : "PingFang SC"
					},
					{
						"label" : "华文黑体(STHeiti)",
						"value" : "STHeiti"
					},
					{
						"label" : "华文新魏(STXinwei)",
						"value" : "STXinwei"
					},
					{
						"label" : "华文楷体(STKaiti)",
						"value" : "STKaiti"
					},
					{
						"label" : "幼圆(YouYuan)",
						"value" : "YouYuan"
					}
				],
				"order" : 103,
				"text" : "font family",
				"type" : "combo",
				"value" : "Microsoft Yahei"
			},
			"font_size" : 
			{
				"order" : 102,
				"text" : "font size",
				"type" : "textinput",
				"value" : "12"
			},
			"mode" : 
			{
				"condition" : "preset.value=='0'",
				"options" : 
				[
					{
						"label" : "contain",
						"value" : "contain"
					},
					{
						"label" : "cover",
						"value" : "cover"
					},
					{
						"label" : "fill",
						"value" : "fill"
					},
					{
						"label" : "origin",
						"value" : "origin"
					}
				],
				"order" : 107,
				"text" : "mode",
				"type" : "combo",
				"value" : "contain"
			},
			"preset" : 
			{
				"options" : 
				[
					{
						"label" : "ME!ME!ME!",
						"value" : "mememe"
					},
					{
						"label" : "Rikka",
						"value" : "rikka"
					},
					{
						"label" : "Rikka2",
						"value" : "rikka2"
					},
					{
						"label" : "Mato",
						"value" : "mato"
					},
					{
						"label" : "自定义(Custom)",
						"value" : "0"
					}
				],
				"order" : 105,
				"text" : "preset",
				"type" : "combo",
				"value" : "mememe"
			},
			"scale" : 
			{
				"fraction" : true,
				"max" : 1,
				"min" : 0,
				"order" : 101,
				"precision" : 2,
				"step" : 0.05,
				"text" : "scale",
				"type" : "slider",
				"value" : 1
			},
			"schemecolor" : 
			{
				"order" : 0,
				"text" : "ui_browse_properties_scheme_color",
				"type" : "color",
				"value" : "0 0 0"
			},
			"text" : 
			{
				"order" : 100,
				"text" : "text",
				"type" : "textinput",
				"value" : "色欲壹事,乃舉世人之通病不特中下之人,被色所迷.即上根之人,若不戰兢自持,乾惕在念,則亦難免不被所迷.試觀古今來多少出格豪傑,固足為聖為賢. 祗由打不破此關,反為下愚不肖.兼復永墮惡道者,蓋難勝數.楞嚴經雲,若諸世界六道眾生,其心不淫,則不隨其生死相續.汝修三昧,本出塵勞.淫心不除,塵不可出. 學道之人,本為出離生死.茍不痛除此病,則生死斷難出離,即念佛門,雖則帶業往生.然若淫習固結,則便與佛隔,難於感應道交矣.欲絕此禍,莫如見壹切女人,皆作親想,怨想,不淨想.親想者. 見老者作母想淘寶特賣眼線潤膚乳排行榜好左旋肉堿哪個牌子好去黑頭化妝水哪個牌子好有效的哪個保健補品好,長者作姊想,少者作妹想,幼者作女想,欲心縱盛,斷不敢於母姊妹女邊起不正念. 視壹切女人,總是吾之毋姊妹女.則理制於欲,欲無由發矣.怨想者,凡見美女,便起愛心.由此愛心,便墮惡道.長劫受苦,不能出離.如是則所謂美麗嬌媚者,比劫賊虎狼、毒蛇惡蠍,砒霜鴆毒,烈百千倍. 於此極大怨家,尚猶戀戀著念,豈非迷中倍人.不淨者,美貌動人,只外面壹層薄皮耳.若揭去此皮,則不忍見矣.骨肉膿血,屎尿毛髮,淋漓狼藉,了無壹物可令人愛.但以薄皮所蒙.則妄生愛戀. 華瓶盛糞,人不把玩.今此美人之薄皮,不異華瓶.皮內所容,比糞更穢.何得愛其外皮,而忘其裏之種種穢物,漫起妄想乎哉.茍不戰兢乾惕,痛除此習.則唯見其姿質美麗,致愛箭入骨,不能自拔. 平素如此,致其沒後不入女腹,不可得也.入人女腹猶可.入畜女腹,則將奈何.試壹思及,心神驚怖. 然欲於見境不染心,須於未見境時,常作上三種想,則見境自可不隨境轉.否則縱不見境,意地仍復纏綿,終被淫欲習氣所縛.固宜認真滌除惡業習氣,方可有自由分."
			}
		}
	},
	"preview" : "mememe-ascii.gif",
	"tags" : [ "Anime" ],
	"title" : "ASCII Art",
	"type" : "web",
	"version" : 2,
	"visibility" : "public",
	"workshopid" : "2177282046"
}
```

第四步，在js中获取用户的配置内容并初始化项目。在脚本中重写监听对象 **window.wallpaperPropertyListener** ，用户每次对配置信息作出修改就会触发**window.wallpaperPropertyListener.applyUserProperties** 回调，该函数接受一个**properties** 参数，包含了所有**被修改**的对象，因为**properties**只包含当前被修改的属性，所以需要有全局变量将前面的修改缓存起来（ps：第一次初始化时properties会包含所有的配置）。

第五步，实现业务逻辑。没啥好说的，和平时开发web项目没什么区别。

第六步，发布项目。点击左上角的 **Steam -> Share Wallpaper on Workshop**，填写描述，标题，预览图以及分级（开车太狠可过不了审），点击 **Pubilsh** 即可，随后你就能在自己的创意工坊主页看到了。

![](/images/hand.webp)[本项目的创意工坊地址（~~请科学上网~~）](https://steamcommunity.com/sharedfiles/filedetails/?id=2177282046 )

![](/images/hand.webp)[完整代码戳这里](https://gitee.com/kaysama/blog-source-host/tree/master/%E5%8F%91%E5%B8%83%E7%BD%91%E9%A1%B5%E5%88%B0Wallpaper%20Engine)