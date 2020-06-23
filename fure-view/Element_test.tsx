/** @jsx createElement */
import {
  createElement,
  Props,
  Element,
  Fragment,
  renderElement,
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

const App = (): Element<{}> => (
  <Parent title="parent" />
);

Deno.test("Element", (<App />).render);
if (import.meta.main) console.log(await renderElement(<App />));
