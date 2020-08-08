import { Setup, State, Kit, KitAny } from "./mod.ts";

interface CounterProps {
  id: string;
  $count: State<number>;
  nodes: [KitAny]; // disallow nodes
}
const Counter: Setup<CounterProps> = async function (
  { id, $count, nodes: [footer] },
) {
  const dom = await this.html`
  <div id=${id}>
    <div id="icon"></div>
    <p id="out"></p>
    <a id="dec"/>
    <a id="inc"/>
    ${footer}
  </div>
  `;
  // $count[0]((count) => dom.$("out").data(count));
  // dom.$("dec").addEventListener(
  //   "click",
  //   () => $count[1]((count) => 1 + count),
  // );
};

interface FooterProps {
  reset: () => void;
  nodes?: never;
}
const Footer: Setup<FooterProps> = function ({ reset }) {
  const dom = this.html`<small>click to reset counter</small>`;
  // TODO select the root element
};

const App: Setup<{}> = async function () {
  const $count = this.state(0);
  const [_listen, update] = $count;
  const counter = Kit.create(
    Counter,
    { id: "counter", $count },
    Kit.create(Footer, { reset: () => update(() => 0) }),
  );
  await this.html`<div>${counter}</div>`;
};

await Kit.openReactive();
await Kit.openWebDom();

const app = Kit.create(App);
Deno.test("Kit/WebDom", () => app.run());
if (import.meta.main) {
  await app.run();
  console.log("html", await app.r2s());
  await Kit.openDevtools();
  console.log(app);
}
