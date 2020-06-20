import { fs, path } from "../package.ts";

export async function findBin(): Promise<string> {
  const os = "win"; // TODO where is `os` lib in Deno???
  const binRoot = path.join(Deno.cwd(), ".bin");
  const binPath = await find(os, binRoot);
  return await link(binRoot, binPath);
}

const configs = {
  win: {
    binFile: [
      "launch.exe",
      "chrome.exe",
      "msedge.exe",
    ],
    binPath: [
      "\\Google\\Chrome\\Application\\chrome.exe",
      "\\Microsoft\\Edge\\Application\\msedge.exe",
    ],
    binRoot: () => [
      Deno.env.get("CHROMIUM_HOME"),
      Deno.env.get("PROGRAMFILES"),
      Deno.env.get("PROGRAMFILES(X86)"),
      Deno.env.get("APPDATA"),
    ],
  },
};
type OS = keyof typeof configs;

async function find(os: OS, binRoot: string): Promise<string> {
  const config = configs[os];
  let result;
  for (const bin of config.binFile) {
    result = await test(binRoot, bin);
    if (result[0]) return result[1];
    result = await test(Deno.cwd(), bin);
    if (result[0]) return result[1];

    const home = Deno.env.get("CHROMIUM_HOME");
    if (!home) continue;
    result = await test(home, bin);
    if (result[0]) return result[1];
  }

  for (const bin of config.binPath) {
    for (const dir of config.binRoot()) {
      if (!dir) continue;
      result = await test(dir, bin);
      if (result[0]) return result[1];
    }
  }
  throw new Deno.errors.NotFound("chromium not found");
}

async function link(dir: string, src: string): Promise<string> {
  const name = path.basename(src);
  const [exists, bin] = await test(dir, name);
  if (exists) {
    if (bin == src) return Deno.realPath(bin);
    else await Deno.remove(bin);
  }
  await fs.ensureSymlink(src, bin);
  return src;
}

async function test(dir: string, bin: string): Promise<[boolean, string]> {
  const file = path.join(dir, bin);
  return await fs.exists(file) ? [true, file] : [false, file];
}
