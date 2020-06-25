/** @jsx createElement */
import { delay } from "std/async/delay.ts";
import {
  createElement,
  Props,
  Element,
  Fragment,
  renderElement,
  Renderer,
  LifeEvent,
} from "./Element.ts";

const Child = ({ value, children }: Props & { value?: number }) => children;

const Parent = ({ title, children }: Props & { title: string }) => (
  // test fragment
  <Fragment>
    <Child value={1}>
      {[ // test Array
        <Child value={1.1} />, // test no-inner
        <Child />, // test no-props
      ]}
    </Child>
    <Child value={2}>
      {/* test fragment without inner */}
      <Fragment />
    </Child>
    <Child value={3}></Child>
  </Fragment>
);

const App: Renderer<{}> = async (
  _props,
  { useState },
): Promise<Element<{}>> => {
  const [count, setCount] = useState(1);
  console.log(count);
  await delay(100);
  if (count < 3) setCount(1 + count);
  else if (count < 5) setCount(delay(100).then(() => 1 + count));
  return <Parent title="parent" />;
};

const app = <App />;
Deno.test("Element", app.render);
if (import.meta.main) {
  app.addEventListener(
    "mount",
    (evt: LifeEvent<{}>) => console.log(evt.target),
  );
  app.render();
}
