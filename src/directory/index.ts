import * as path from 'path';
import * as fs from 'fs';
import { versions } from 'process';
import { copyFile } from '../file';
const rootPath = path.resolve(__dirname, '..', '..');

export interface WriteOrCopyOpts {
  overwrite: boolean;
}

/***
 * @description 获取绝对路径
 * @param {string} directory 传入的目录，如果是绝对路径，则直接返回，如果是相对目录，则会从安装此包的工程根目录开始算绝对路径
 * @return {string} 绝对路径字符串
 */

export function dirConvert(directory: string) {
  if (!path.isAbsolute(directory)) {
    return path.resolve(rootPath, directory);
  }
  return directory;
}

/***
 * @description 递归创建目录
 * @param {string} targetPath 指定目录，绝对路径或相对路径都可，如为相对路径，则会从项目根目录开始计算
 * @return {boolean} 是否创建成功
 */
export async function mkdir(targetPath: string) {
  targetPath = dirConvert(targetPath);
  if (!fs.existsSync(targetPath)) {
    if (parseInt(`${versions.node}`.split('.').join('')) >= 10120) {
      fs.mkdirSync(targetPath, { recursive: true });
    } else {
      if (!(await mkdir(path.dirname(targetPath)))) {
        return false;
      }
      fs.mkdirSync(targetPath);
    }
  }
  return true;
}

/***
 * @description 直接拷贝整个目录
 * @param {string} targetPath 指定目录，绝对路径或相对路径都可，如为相对路径，则会从项目根目录开始计算
 * @param {string} sourcePath 指定目录，绝对路径或相对路径都可，如为相对路径，则会从项目根目录开始计算
 * @param {WriteOrCopyOpts} options 指定目录，绝对路径或相对路径都可，如为相对路径，则会从项目根目录开始计算
 * @param {boolean} options.overwrite 指定目录，绝对路径或相对路径都可，如为相对路径，则会从项目根目录开始计算
 * @return {boolean} 是否创建成功
 */
export async function copyDir(
  targetPath: string,
  sourcePath: string,
  options: WriteOrCopyOpts,
) {
  targetPath = dirConvert(targetPath);
  sourcePath = dirConvert(sourcePath);
  const stat = await fs.statSync(sourcePath);
  if (stat.isFile()) {
    await copyFile(targetPath, sourcePath, options);
  } else {
    await mkdir(targetPath);
    await Promise.all(
      fs.readdirSync(sourcePath, 'utf8').map(async (filePath: string) => {
        await copyFile(
          path.join(targetPath, filePath),
          path.join(sourcePath, filePath),
          options,
        );
      }),
    );
  }
}

/***
 * @description 直接删除整个目录
 * @param {string} targetPath 指定目录，绝对路径或相对路径都可，如为相对路径，则会从项目根目录开始计算
 * @return {boolean} 是否删除成功
 */
export async function delDir(targetPath: string) {
  targetPath = dirConvert(targetPath);

  if (fs.existsSync(targetPath)) {
    if (parseInt(`${versions.node}`.split('.').join('')) >= 14140) {
      try {
        await fs.rmSync(targetPath, { recursive: true });
      } catch (e) {
        return false;
      }
    } else {
      const nameArray: string[] = fs.readdirSync(targetPath);
      for (const name of nameArray) {
        const newPath: string = path.join(targetPath, name);
        const stat = await fs.statSync(newPath);
        if (stat.isFile()) {
          await fs.unlinkSync(newPath);
        } else if (!(await delDir(newPath))) {
          return false;
        }
      }
      await fs.rmdirSync(targetPath);
    }
  }

  return true;
}

/***
 * @description 移动整个目录
 * @param { string } targetFile 移动后路径
 * @param { string } sourceFile 移动前路径
 * @param { WriteOrCopyOpts } options 移动选项
 * @return { Promise<void> }
 */
export async function moveDir(
  targetFile: string,
  sourceFile: string,
  options: WriteOrCopyOpts,
) {
  targetFile = dirConvert(targetFile);
  sourceFile = dirConvert(sourceFile);
  if (targetFile !== sourceFile) {
    await copyDir(targetFile, sourceFile, options);
    await delDir(targetFile);
  }
}
