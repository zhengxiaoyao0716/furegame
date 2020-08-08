/** @jsx Kit.create */
import { delay } from "std/async/delay.ts";
import { Kit, Props, Setup, KitAny } from "./Kit/mod.ts";

const Child: Setup<{ value?: number; nodes: KitAny[] }> = function (
  { nodes },
) {
  return nodes;
};

function Parent({ title: _ }: { title: string }) {
  return [
    Kit.create(
      Child,
      { value: 1 },
      Kit.create(Child, { value: 1.1 }),
      Kit.create(Child, { value: 1.2 }),
    ),
    Kit.create(Child, { value: 2 }),
    Kit.create(Child),
  ];
}

async function App() {
  await delay(100);
  return Kit.create(Parent, { title: "parent" });
}

const app = Kit.create(App);
Deno.test("Kit", () => app.run());
if (import.meta.main) {
  await app.run();
  await delay(100);
  await Kit.openDevtools();
  console.log(app);
}
