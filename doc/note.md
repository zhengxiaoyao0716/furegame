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
> `jsx progma`[不起作用](https://github.com/denoland/deno/issues/6396)，只能先配置全局`tsconfig`了，真不爽，一个`import_map`都够让我不爽的了。
> 谨慎考虑，[我觉得`tsconfig`不是个好主意](https://github.com/denoland/deno/issues/6396#issuecomment-647102776)，那连这个一起妥协好了，最终方案：
## 解耦的声明式的视图组件
