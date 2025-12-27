/**
 * 滑块验证码图像处理工具类
 * 基于 lilishop 的 SliderImageUtil 移植
 */

import sharp from 'sharp';
import { randomInt } from 'crypto';

export interface SliderImageResult {
  slidingImage: string; // base64格式的滑块图片
  backImage: string; // base64格式的背景图片
  randomX: number; // X轴随机位置
  randomY: number; // Y轴随机位置
  originalHeight: number;
  originalWidth: number;
  sliderHeight: number;
  sliderWidth: number;
}

/**
 * 根据模板切图
 * @param sliderBuffer 滑块模板图片Buffer
 * @param originalBuffer 原始图片Buffer
 * @param interfereBuffer 干扰图片Buffer（可选）
 * @param interfereNum 干扰块数量
 * @returns 滑块验证码结果
 */
export async function pictureTemplatesCut(
  sliderBuffer: Buffer,
  originalBuffer: Buffer,
  interfereBuffer?: Buffer,
  interfereNum: number = 0,
): Promise<SliderImageResult> {
  // 获取原始图片尺寸
  const originalMeta = await sharp(originalBuffer).metadata();
  const originalWidth = originalMeta.width || 300;
  const originalHeight = originalMeta.height || 150;

  // 获取滑块模板尺寸
  const sliderMeta = await sharp(sliderBuffer).metadata();
  const sliderWidth = sliderMeta.width || 60;
  const sliderHeight = sliderMeta.height || 60;

  // 随机生成抠图坐标X,Y
  // X轴距离右端targetWidth Y轴距离底部targetHeight以上
  const randomX = randomInt(2 * sliderWidth, originalWidth - sliderWidth);
  const randomY = randomInt(0, originalHeight - sliderHeight);

  // 创建滑块图片（从原图中抠出）
  const slidingImage = await extractSliderPiece(
    originalBuffer,
    sliderBuffer,
    randomX,
    randomY,
    sliderWidth,
    sliderHeight,
  );

  // 处理背景图片（添加干扰块）
  let backImageBuffer = originalBuffer;
  if (interfereNum > 0 && interfereBuffer) {
    backImageBuffer = await addInterfereBlocks(
      originalBuffer,
      interfereBuffer,
      sliderWidth,
      sliderHeight,
      originalWidth,
      originalHeight,
      interfereNum,
    );
  }

  // 转换为base64
  const slidingImageBase64 = await bufferToBase64(slidingImage, 'png');
  const backImageBase64 = await bufferToBase64(backImageBuffer, 'jpg');

  return {
    slidingImage: `data:image/png;base64,${slidingImageBase64}`,
    backImage: `data:image/jpg;base64,${backImageBase64}`,
    randomX,
    randomY,
    originalHeight,
    originalWidth,
    sliderHeight,
    sliderWidth,
  };
}

/**
 * 从原图中提取滑块块
 */
async function extractSliderPiece(
  originalBuffer: Buffer,
  sliderTemplateBuffer: Buffer,
  x: number,
  y: number,
  width: number,
  height: number,
): Promise<Buffer> {
  // 提取原图指定区域
  const extractedRegion = await sharp(originalBuffer)
    .extract({ left: x, top: y, width, height })
    .toBuffer();

  // 将滑块模板作为遮罩应用到提取的区域
  // 这里简化处理，实际应该使用模板的alpha通道作为遮罩
  const sliderImage = await sharp(extractedRegion)
    .composite([
      {
        input: sliderTemplateBuffer,
        blend: 'dest-in', // 使用模板作为遮罩
      },
    ])
    .png()
    .toBuffer();

  return sliderImage;
}

/**
 * 添加干扰块到背景图片
 */
async function addInterfereBlocks(
  originalBuffer: Buffer,
  interfereTemplateBuffer: Buffer,
  sliderWidth: number,
  sliderHeight: number,
  originalWidth: number,
  originalHeight: number,
  interfereNum: number,
): Promise<Buffer> {
  let result = originalBuffer;

  for (let i = 0; i < interfereNum; i++) {
    const interfereX = randomInt(2 * sliderWidth, originalWidth - sliderWidth);
    const interfereY = randomInt(0, originalHeight - sliderHeight);

    result = await sharp(result)
      .composite([
        {
          input: interfereTemplateBuffer,
          left: interfereX,
          top: interfereY,
          blend: 'over',
        },
      ])
      .toBuffer();
  }

  return result;
}

/**
 * Buffer转Base64
 */
async function bufferToBase64(buffer: Buffer, format: 'png' | 'jpg'): Promise<string> {
  return buffer.toString('base64');
}

