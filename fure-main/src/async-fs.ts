import fs from 'fs';
import util from 'util';

export const copyFile = util.promisify(fs.copyFile);
export const exists = util.promisify(fs.exists);
export const mkdir = util.promisify(fs.mkdir);
export const mkdtemp = util.promisify(fs.mkdtemp);
export const readdir = util.promisify(fs.readdir);
export const readFile = util.promisify(fs.readFile);
export const rename = util.promisify(fs.rename);
export const rmdir = util.promisify(fs.rmdir);
export const unlink = util.promisify(fs.unlink);
export const writeFile = util.promisify(fs.writeFile);
