/** @jsx Kit.c */
import { Kit, Props, create } from "./Kit.ts";

function Child(props: { name: string }) {
  return;
}
function App({ nodes: [child] }: { nodes: Kit<{ name: string }>[] }) {
}

const app = (
  // WTF
  <App>
    {(<Child name="a" /> as unknown as Kit<{ name: string }>)}
    {(<Child name="b" /> as Kit<any>)}
  </App>
) as Kit<{}>;

const child = Kit.c(Child, { name: "a" });

const _app = create(App, { nodes: [child] });

const fragment = (
  <>
    {null}
  </>
);
