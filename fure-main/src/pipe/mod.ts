import path from 'path';
import { Pipe } from '.';
import { exists } from '../async-fs';

const findMod = async (modPath: string): Promise<string> => {
  if (path.isAbsolute(modPath)) return modPath; // require absolute path must exists
  const modDirs = [process.cwd(), path.dirname(process.execPath)];
  for (const modDir of modDirs) {
    const modFile = path.join(modDir, modPath);
    if (await exists(modFile)) return modFile;
  }
  return '';
};

export const pipeMod = (modPath: string): Pipe => async app => {
  if (!modPath) return app;
  const modFile = await findMod(modPath);
  if (!modFile) return app;
  console.info(`load mod from "${modFile}"`); // eslint-disable-line no-console
  try {
    const mod = require(modFile).default;
    mod && mod instanceof Function && mod(app, require);
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
    return app;
  }
  return app;
};
