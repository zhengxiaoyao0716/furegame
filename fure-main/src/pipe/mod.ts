import path from 'path';
import { Pipe } from '.';
import { exists } from '../async-fs';

const findMod = async (modPath: string): Promise<string> => {
  const modDirs = [process.cwd(), path.dirname(process.execPath)];
  for (const modDir of modDirs) {
    const modFile = path.resolve(modDir, modPath);
    if (await exists(modFile)) return modFile;
  }
  return '';
};

export const pipeMod = (modPath: string): Pipe => async app => {
  const modFile = await findMod(modPath);
  if (!modFile) return app;
  console.info(`load mod from "${modFile}"`); // eslint-disable-line no-console
  try {
    require(modFile);
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
    return app;
  }
  return app;
};
