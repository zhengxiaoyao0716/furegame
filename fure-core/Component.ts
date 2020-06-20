import { EventTarget, EventMap, log } from "./_util/mod.ts";

export class Component<EM extends EventMap> extends EventTarget<EM> {
  readonly name: string;
  get logger(): log.LoggerLike {
    return Component.getLogger(this.name);
  }

  static getLogger: (name: string) => log.LoggerLike = log.getLogger;

  constructor(name: string) {
    super();
    this.name = name;
  }
}
