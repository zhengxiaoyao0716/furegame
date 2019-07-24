# [`FureGame`](https://zhengxiaoyao0716.github.io/furegame) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)
## Functional Reactive Game Framework
> Try to make game using functional-reactive-programming style.

- **NOT PREPARE FOR PUBLISH**
- **还没准备好正式发布**

- TODO `Matter` 的内部时钟需要与 `Ticker` 同步。

***
## The Design // 愿景

### `VIEW` *(Render)* // 渲染层
![view = \lambda(state)](https://latex.codecogs.com/png.latex?%5CLARGE%20view%20%3D%20%5Clambda%28state%29)
> `λ`: the `render` function of the state.
- `view` 包含游戏UI、游戏场景舞台等，自动对比状态变化重新渲染。
- 各种工具与编辑器，如配置、场景、碰撞箱、动画帧等，也算在 `Render` ，以便允许开发者采用同一套技术来拓展。
- 暂时用 `React` 包装 `PixiJS` 来实现，但我期待着 `Flutter` 的 `Web` 支持完善后换到 `Flutter` 上。

### `CORE` *(Logic)* // 逻辑层
![snap_i = \phi(snap_{i-1}, input)](https://latex.codecogs.com/png.latex?%5CLARGE%20snap_%7Bi%7D%20%3D%20%5Cphi%28snap_%7Bi-1%7D%2C%20input%29)
> `φ`: the `iterate` function of last state snapshot and user input.
- `snap` 指状态的快照，即节点某时刻的状态。
- `iterate` 迭代瞬时状态时，需要按照游戏规则，处理游戏逻辑、物理法则与相关结算等。
- 无论本地、服务端还是联机远程，都应该跑着一个 `Logic` 层各自计算逻辑，然后交给 `Server` 层去叠加决出状态后交给 `Render` 渲染。
- ~~`Logic` 层提出来了理论上以后就能很方便的用 `C/C++` 写的物理引擎了~~ 考虑到有一层RPC传输，还是仅限制在特别核心的部分吧。

### `MAIN` *(Server)* // 服务层
![state = \delta(state_{local}, state_{remote}, ...)](https://latex.codecogs.com/png.latex?%5CLARGE%20state%20%3D%20%5Cdelta%28state_%7Blocal%7D%2C%20state_%7Bremote%7D%2C%20...%29)
> `δ`: the `reduce` function of all node state.
- `state_node` 包含本地、服务器（中央服务）、联机玩家（P2P）等。
- `reduce` 叠加各个节点的状态时，负责处理本地远程状态间插值、多节点状态不一致的权重信任等。
- 理想的服务端载体需要具备完善的节点发现、远程调用、进程通信等能力，`Elixir`, `AKKA` 等 `CSP` 模型的后端比较合适。
- 考虑到单机发布、用户设备P2P服务等，还要能方便的打包到可执行二进制以便在用户设备上部署，像 `Go` 这样可能比较合适。
- 再考虑和渲染层（React等）、逻辑层（物理引擎等）的交互，需要既能方便和浏览器直接通信，又能和 `C/C++` 库直接调用。
- 结论就是，居然没有找到任何满足全部条件的，目前而言先 `All in JS` 弄个原型再说吧。。。
- 另外，对于单机游戏来说 `state = state_local`，那么服务层的作用仅仅是分离游戏状态以便建立快照之类了。
