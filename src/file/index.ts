export interface BytesConversionOptsType {
  decimals?: number;
  unit?: BucketOrObjectUnit;
  auto?: boolean;
}

export enum BucketOrObjectUnit {
  BYTE,
  KB,
  MB,
  GB,
  TB,
  PB,
  EB,
  ZB,
  YB,
}

/***
 * @description bytes转换为指定单位
 * @param {number} bytes 字节数
 * @param {object} conversionOpts 精度
 * @param {number} conversionOpts.decimals 精度
 * @param {BucketOrObjectUnitType} conversionOpts.unit 转换单位
 * @param {string} conversionOpts.auto 是否自动转换，启用状态下自动忽略conversionConf.unit
 * @return {float} 指定精度的
 */
export function bytesConversion(
  bytes: number,
  conversionOpts: BytesConversionOptsType = {
    decimals: 2,
    unit: BucketOrObjectUnit.BYTE,
    auto: true,
  },
) {
  const { decimals, unit, auto } = conversionOpts;
  let level: number;
  let unitStr = '';
  if (auto) {
    // 根据对数求是1024的几次方，一次方是byte，2次方是kb，以此类推
    level = Math.floor(Math.log(bytes) / Math.log(1024));
  } else {
    level = unit || BucketOrObjectUnit.BYTE;
  }
  switch (level) {
    case BucketOrObjectUnit.BYTE:
      unitStr = 'Byte';
      break;
    case BucketOrObjectUnit.KB:
      unitStr = 'KB';
      break;
    case BucketOrObjectUnit.MB:
      unitStr = 'MB';
      break;
    case BucketOrObjectUnit.GB:
      unitStr = 'GB';
      break;
    case BucketOrObjectUnit.TB:
      unitStr = 'TB';
      break;
    case BucketOrObjectUnit.PB:
      unitStr = 'PB';
      break;
    case BucketOrObjectUnit.EB:
      unitStr = 'PB';
      break;
    case BucketOrObjectUnit.ZB:
      unitStr = 'PB';
      break;
    case BucketOrObjectUnit.YB:
      unitStr = 'PB';
      break;
  }
  // 这里是求幂次方来作为基础的单位
  const basicSize = Math.pow(1024, level);
  return `${(bytes / basicSize).toFixed(decimals)} ${unitStr}`;
}
