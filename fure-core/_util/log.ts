export * from "log/mod.ts";
export type LogMethod = (msg: string, ...args: unknown[]) => void;
export type LoggerLike = {
  [method in "debug" | "info" | "warning" | "error"]: LogMethod;
};
