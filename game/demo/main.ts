import { App, log } from "../../fure-main/mod.ts";

async function main() {
  await log.setup({
    handlers: { main: new log.handlers.ConsoleHandler("DEBUG") },
    loggers: { "main": { level: "DEBUG", handlers: ["main"] } },
  });
  await App.launch("main", { app: "data:text/html,", devtools: true });
}

if (import.meta.main) await main();
