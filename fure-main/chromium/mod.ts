export * from "./find.ts";
export * from "./launch.ts";

import { io, log } from "../deps.ts";

const reg = /^DevTools listening on (ws:\/\/\S+:\d{2,5}\/devtools\/\S+)\s*$/;
export async function takeWsUrl(
  reader: Deno.Reader,
  logger: log.LoggerLike,
): Promise<string> {
  // https://github.com/aslushnikov/getting-started-with-cdp/blob/master/README.md#protocol-fundamentals
  const iter = io.readStringDelim(reader, "\n");
  for await (const str of iter) {
    const line = str.trimEnd();
    if (line == "") continue;
    const matched = line.match(reg);
    if (matched) return matched[1];
    else logger.error(line);
  }
  throw new Error("failed to take debugging websocket url");
}
