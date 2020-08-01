import { Setup, State, Kit } from "./mod.ts";

interface CounterProps {
  id: string;
  $count: State<number>;
  nodes?: never; // disallow nodes
}
const Counter: Setup<CounterProps> = function ({ id, $count }) {
  this.html`
  <div id=${id}>
    <div id="icon"></div>
    <p id="out"></p>
    <a id="dec"/>
    <a id="inc"/>
  </div>
  `;
  $count[0]((count) => this.$("out").data(count));
  this.$("dec").addEventListener(
    "click",
    () => $count[1]((count) => 1 + count),
  );
};

const App: Setup<{}> = function () {
  const $count = this.state(0);
  return Kit.create(Counter, { id: "counter", $count });
};

await Kit.openReactive();
await Kit.openWebDom();

const app = Kit.create(App);
Deno.test("Kit/WebDom", () => app.run());
if (import.meta.main) {
  await app.run();
  console.log("html", await app.r2s());
}
