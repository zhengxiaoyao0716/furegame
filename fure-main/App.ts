import { Component } from "../fure-core/mod.ts";
import { EventMap } from "../fure-core/_util/mod.ts";
import { log, io } from "./package.ts";
import { LauncOptions, buildLaunchCmd, takeWsUrl } from "./chromium/mod.ts";
import { RPC } from "./RPC.ts";

export interface AppEventMap extends EventMap {
  "exit": ExitEvent<string>;
}

export class App extends Component<AppEventMap> {
  readonly process: Process;
  readonly rpc: RPC;

  //#region constructors

  private constructor(name: string, process: Process, rpc: RPC) {
    super(name);
    this.process = process;
    this.rpc = rpc;
    this.logger.debug(`launch ${this}, pid: ${this.pid}`);

    //#region listen exit
    this.addEventListener(
      "exit",
      ({ code, detail }) => {
        if (code == 0) return;
        this.logger.error(
          `${this} exit unexpectedly, code: ${code}, detail: ${detail}`,
        );
      },
    );
    process.status().then(({ code }) => {
      if (code == 0) {
        this.running = false;
        return;
      }
      const message = "browser exit unexpectedly";
      this.exit(1, new Deno.errors.Interrupted(message));
    });
    // Deno.signal(Deno.Signal.SIGINT).then(() => {
    //   this.exit(Deno.Signal.SIGINT, "interrupted");
    // }); TODO It said "Uncaught Error: not implemented!", WTF
    //#endregion

    // log output
    this.logOutput(process.stdout, "info");
    this.logOutput(process.stderr, "error");
  }

  static async launch(
    name: string,
    options: LauncOptions | string[],
  ): Promise<App> {
    const logger = App.getLogger(name);
    // build cmd
    const cmd = Array.isArray(options)
      ? options
      : await buildLaunchCmd(options);
    logger.debug(`launch browser, cmd: ${cmd}`);

    // launch browser
    const process = Deno.run({
      cmd: cmd,
      cwd: Deno.cwd(),
      env: Deno.env.toObject(),
      stdout: "piped",
      stderr: "piped",
    });
    // connect socket
    const wsUrl = await takeWsUrl(process.stderr, logger);
    const rpc = await RPC.connect(name, wsUrl);

    return new App(name, process, rpc);
  }
  //#endregion

  //#region events
  exit<T>(code: number, detail?: T): void {
    if (this.running) {
      this.logger.warning(`${this} not running`);
    }
    this.running = false;
    const event = new ExitEvent(code, detail);
    this.dispatchEvent(event);
    this.process.close();
    Deno.exit(code);
  }
  private running: boolean = true;
  //#endregion

  //#region utils
  get pid(): number {
    return this.process.pid;
  }

  private async logOutput(out: Deno.Reader, method: keyof log.LoggerLike) {
    const iter = io.readStringDelim(out, "\n");
    for await (const str of iter) {
      const line = str.trimEnd();
      if (!this.running) break; // already stopped
      this.logger[method](line);
    }
  }
  //#endregion
}

export class ExitEvent<T> extends Event {
  constructor(
    readonly code: number,
    readonly detail: T,
  ) {
    super("exit");
  }
}

export type Process = Deno.Process<{
  cmd: string[];
  cwd: string;
  env: { [index: string]: string };
  stdout: "piped";
  stderr: "piped";
}>;
