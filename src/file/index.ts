import * as fs from 'fs';
import { dirConvert, mkdir, WriteOrCopyOpts } from '../directory';
import * as path from 'path';

export interface BytesConversionOptsType {
  decimals?: number;
  unit?: SpaceUnit;
  auto?: boolean;
}

export enum SpaceUnit {
  BYTE,
  KB,
  MB,
  GB,
  TB,
}

/***
 * @description bytes转换为指定单位
 * @param { number | string } bytes 字节数
 * @param { BytesConversionOptsType } conversionOpts 精度
 * @param { number } conversionOpts.decimals 精度
 * @param { SpaceUnit } conversionOpts.unit 转换单位
 * @param { string } conversionOpts.auto 是否自动转换，启用状态下自动忽略conversionConf.unit
 * @return { string } 指定精度的转换后结果
 */
export function bytesConversion(
  bytes: number | string,
  conversionOpts: BytesConversionOptsType = {
    decimals: 2,
    unit: SpaceUnit.BYTE,
    auto: true,
  },
) {
  const { decimals, unit, auto } = conversionOpts;
  let level: number;
  bytes = parseInt(`${bytes}`);

  if (auto) {
    // 根据对数求是1024的几次方，一次方是byte，2次方是kb，以此类推
    level = Math.floor(Math.log(bytes) / Math.log(1024));
  } else {
    level = unit || SpaceUnit.BYTE;
  }

  // 这里是求幂次方来作为基础的单位
  const basicSize = Math.pow(1024, level);
  return (bytes / basicSize).toFixed(decimals);
}

/***
 * @description 单个文件写入
 * @param { string } file 写入的文件路径
 * @param { string | NodeJS.ArrayBufferView } data 写入的信息
 * @param { WriteOrCopyOpts } options 写入选项
 * @return { Promise<void> }
 */
export async function writeFile(
  file: string,
  data: string | NodeJS.ArrayBufferView,
  options: WriteOrCopyOpts,
) {
  file = dirConvert(file);

  const { dir } = path.parse(file);
  await mkdir(dir);

  if (!options.overwrite) {
    try {
      fs.accessSync(file, fs.constants.F_OK);
      return;
    } catch (err) {}
  }
  await fs.writeFileSync(file, data, 'utf-8');
}

/***
 * @description 单个文件拷贝
 * @param { string } targetFile 拷贝目标文件路径
 * @param { string } sourceFile 拷贝的源文件路径
 * @param { WriteOrCopyOpts } options 写入选项
 * @return { Promise<void> }
 */
export async function copyFile(
  targetFile: string,
  sourceFile: string,
  options: WriteOrCopyOpts,
) {
  targetFile = dirConvert(targetFile);
  sourceFile = dirConvert(sourceFile);

  const { dir } = path.parse(targetFile);
  await mkdir(dir);

  if (!options.overwrite) {
    try {
      fs.accessSync(targetFile, fs.constants.F_OK);
      return;
    } catch (err) {}
  }

  fs.createReadStream(sourceFile).pipe(fs.createWriteStream(targetFile));
}

/***
 * @description 单个文件删除
 * @param { string } targetFile 目标文件路径
 * @return { Promise<void> }
 */
export async function delFile(targetFile: string) {
  targetFile = dirConvert(targetFile);

  try {
    fs.accessSync(targetFile, fs.constants.F_OK);
    fs.unlinkSync(targetFile);
    return;
  } catch (err) {}
}

/***
 * @description 移动单个文件
 * @param { string } targetFile 移动后目标文件路径
 * @param { string } sourceFile 拷贝的源文件路径
 * @param { WriteOrCopyOpts } options 写入选项
 * @return { Promise<void> }
 */
export async function moveFile(
  targetFile: string,
  sourceFile: string,
  options: WriteOrCopyOpts,
) {
  targetFile = dirConvert(targetFile);
  sourceFile = dirConvert(sourceFile);
  if (targetFile !== sourceFile) {
    await copyFile(targetFile, sourceFile, options);
    await delFile(targetFile);
  }
}
