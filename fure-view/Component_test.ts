const src = `(async function () {
  const { Render, createComponent } = await import("./Component.ts");
  /** @jsx createComponent */

  interface AppProps {
    count: number;
  }
  async function App({ count }) {
    console.log(this, count);
  };
  return (<App count={1}>{[<App count={2}/>,<App count={2}/>]}</App>);
})();`; // `jsx progma` not works, https://github.com/denoland/deno/issues/6396

async function testComponent() {
  const [erros, record] = await Deno.compile(
    "app.tsx",
    { "app.tsx": src },
    { jsxFactory: "createComponent" },
  );
  const code = record["app.js"];
  const app = await eval(code);
  console.log(app.toString());
}
Deno.test("Component", testComponent);

// TODO for dev
if (import.meta.main) console.log(await testComponent());
