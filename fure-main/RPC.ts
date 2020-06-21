import { Component } from "../fure-core/mod.ts";
import { ws } from "./package.ts";

export class RPC extends Component<{}> {
  readonly wsUrl: string;
  readonly socket: ws.WebSocket;
  private constructor(
    name: string,
    wsUrl: string,
    socket: ws.WebSocket,
  ) {
    super(name);
    this.wsUrl = wsUrl;
    this.socket = socket;
    this.logger.debug(`connect ${this} websocket: ${this.wsUrl}`);

    // TODO
  }
  static async connect(name: string, wsUrl: string) {
    const socket = await ws.connectWebSocket(wsUrl);
    return new RPC(name, wsUrl, socket);
  }
}
