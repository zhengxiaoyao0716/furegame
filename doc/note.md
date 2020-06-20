# 笔记
> [`Carlo`不维护了](https://github.com/GoogleChromeLabs/carlo/issues/163#issuecomment-592238093)，我的Furegame第一版也同时宣告失败了。

> 这次好好反思哪里出了问题，克制自己的想法膨胀，一步步稳扎稳打的推进。


***
***
# 开发记录

> 首先Node在游戏开发方面就是个坑，天坑。不能接受Electron这样集成一个浏览器的方案的话，Node真心不适合。所以第一步，换[`Deno`](https://deno.land/)（刚说要克制又折腾新玩具啦。。。）
## 首先下载并执行安装Deno的脚本：
`$v="1.1.0"; iwr https://deno.land/x/install/install.ps1 -useb | iex`
> 跑跑Hello world，嗯完美，除了那只`🦕`命令行没显示出来。。。

> 包管理这块先放弃，Deno现在的包管理我敢断言一定会改，折腾它不划算。

***
> `Electron`的包体积绝对是个没法忽视的问题，每个App带一个`Chromium`这种事情太魔幻了。`Carlo`的思路我觉得没错，所以第二步，发现本地浏览器并唤起！
## 调用本地浏览器
- [发现](../fure-main/chromium/find.ts)
- [唤起](../fure-main/chromium/launch.ts)

