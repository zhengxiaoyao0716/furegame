import { findBin } from "./find.ts";

export interface LauncOptions {
  app: string;
  bin?: string;
  userDataDir?: string;
  devtools?: boolean;
  windowSize?: [number, number];
  windowPosition?: [number, number];
  headless?: boolean;
  pipe?: boolean;
}

export async function buildLaunchCmd({
  app,
  bin,
  userDataDir,
  devtools,
  windowSize,
  windowPosition,
  headless,
}: LauncOptions): Promise<string[]> {
  const args: string[] = [bin || await findBin(), ...defaultLaunchArgs];

  const dir = userDataDir || `${Deno.cwd()}/.bin/.userdata`;
  args.push(`--user-data-dir=${dir}`);

  devtools && args.push("--auto-open-devtools-for-tabs");
  windowSize && args.push(`--window-size=${windowSize}`);
  windowPosition && args.push(`--window-position=${windowPosition}`);
  headless && args.push("--headless", "--hide-scrollbars", "--mute-audio");
  args.push("--remote-debugging-port=0");

  args.push(`--app=${app}`);
  return args;
}

// https://github.com/puppeteer/puppeteer/blob/main/src/Launcher.ts#L161
export const defaultLaunchArgs = [
  "--disable-background-networking",
  "--enable-features=NetworkService,NetworkServiceInProcess",
  "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows",
  "--disable-breakpad",
  "--disable-client-side-phishing-detection",
  "--disable-component-extensions-with-background-pages",
  "--disable-default-apps",
  "--disable-dev-shm-usage",
  "--disable-extensions",
  "--disable-features=TranslateUI",
  "--disable-hang-monitor",
  "--disable-ipc-flooding-protection",
  "--disable-popup-blocking",
  "--disable-prompt-on-repost",
  "--disable-renderer-backgrounding",
  "--disable-sync",
  "--force-color-profile=srgb",
  "--metrics-recording-only",
  "--no-first-run",
  "--enable-automation",
  "--password-store=basic",
  "--use-mock-keychain",
];
