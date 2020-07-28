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

> 包装成一个App，彻底代替`Carlo`。
## `fure-main`的最基础的东西就有了
- [App](../fure-main/App.ts)
> 在这过程中发现`deno`有实验性的支持`WebView`，本地试了一下卡在下载dll了。以后成熟了可以考虑迁移到WebView上。

***
> 下一步就视图模块了，初步设想的`React`+`rxjs`这个方向不变，但问题是`React`的`Typescript`支持太差了，`Deno`官方维护的第三方包里那个`types`折腾了半天也不管用。
> 其他像是`es-react`, `preact`这种，说的是`es`语法带`d.ts`类型声明，实测也就比`React`+`types`略强一点，函数参数类型返回类型之类的`Deno`根本无法识别。
> 重新整理了一下我折腾`React`的根本原因：看中了`React-Hooks`的解耦能力，以及`JSX`的声明式写法。好的，初步设想推翻，新的方向修正：`rxjs`+`jsx`。

> 不对啊，我这是又造`React`的轮子？我要的是`rxjs`和`jsx`，为什么会需要`vdom diff`呢？以游戏框架的刷新率来说，`vdom diff`成本太高了，组件装载卸载可以考虑手动控制。
> 艹啥玩意儿啊这，证明自己代码正确在ts里咋就辣么难呢！！！

> 我觉得我在`Typescript`上浪费太多时间了，但我又真的不想放弃`jsx`和强类型。如果是以前我可能会考虑`ReasonML`，但现在我又不想再碰`npm`打包本地那一堆东西。。。
> 好吧，如果一定要逼我选择，我选择放弃`jsx`。
