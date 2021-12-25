import * as path from 'path';
const rootPath = path.resolve(__dirname, '..', '..');

export function dirConvert(directory: string) {
  if (!path.isAbsolute(directory)) {
    return path.resolve(rootPath, directory);
  }
  return directory;
}
