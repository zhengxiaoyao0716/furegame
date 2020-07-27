/** @jsx Kit.c */
import { Kit, Props, Fragment } from "./Kit.ts";

function Child(props: { name: string }) {
  return;
}
function App(props: Props) {
}

// WTF?
const app = (
  // WTF
  <App>
    <Fragment>
      <Child name="a" />
    </Fragment>
  </App>
);

const _app = Kit.c(App, {});

const frag = (
  <Fragment>
    <Child name="b" />
  </Fragment>
);

// WTF
const _fragment = Kit.c(Fragment, {}, Kit.c(Child, { name: "a" }));

interface ChildProps extends Props {
  name: string;
}
const child = Kit.c(Child, { name: "a" } as ChildProps);
// WTF
const _fragment1 = Kit.c(Fragment, {}, child);
