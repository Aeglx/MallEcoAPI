import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { VerificationEnums } from './enums/verification.enum';
import { SliderCaptchaResponseDto } from './dto/verification.dto';

@Injectable()
export class CommonService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  // 通过id获取子地区
  async getChildRegion(id: string) {
    // 实现获取子地区逻辑
    return { success: true, data: [], message: '获取子地区成功' };
  }

  // 点地图获取地址信息
  async getRegion(params: any) {
    // 实现获取地址信息逻辑
    return { success: true, data: [], message: '获取地址信息成功' };
  }

  // 获取IM接口前缀
  async getIMDetail() {
    // 实现获取IM接口前缀逻辑
    return { success: true, data: { imUrl: 'ws://localhost:8080' }, message: '获取IM配置成功' };
  }

  // 获取图片logo
  async getBaseSite() {
    // 实现获取网站配置逻辑
    return {
      success: true,
      result: {
        settingValue: JSON.stringify({
          domainLogo: '/logo.png',
          domainIcon: '/favicon.ico',
          siteName: 'MallEco商城系统',
        }),
      },
      message: '获取网站配置成功',
    };
  }

  // 发送短信验证码
  async sendSms(verificationEnums: string, mobile: string, params: any) {
    // 实现发送短信验证码逻辑
    return { success: true, data: { code: '123456' }, message: '短信发送成功' };
  }

  /**
   * 创建滑块验证码
   * @param verificationEnums 验证场景
   * @param uuid 用户唯一标识
   */
  async createSliderCaptcha(
    verificationEnums: VerificationEnums,
    uuid: string,
  ): Promise<SliderCaptchaResponseDto> {
    if (!uuid) {
      throw new Error('UUID不能为空');
    }

    try {
      // 获取资源目录路径（兼容开发和生产环境）
      const resourcesPath = path.join(process.cwd(), 'resources', 'slider');
      const imagesPath = path.join(resourcesPath, 'images');
      const sliderPath = path.join(resourcesPath, 'slider');

      // 检查目录是否存在
      if (!fs.existsSync(imagesPath) || !fs.existsSync(sliderPath)) {
        console.error('验证码资源目录不存在:', { imagesPath, sliderPath, cwd: process.cwd() });
        throw new Error(`验证码资源目录不存在: ${imagesPath} 或 ${sliderPath}`);
      }

      // 获取所有可用的图片文件
      const imageFiles = fs.readdirSync(imagesPath).filter(f => f.endsWith('.jpg'));
      const sliderFiles = fs.readdirSync(sliderPath).filter(f => f.endsWith('.png'));

      if (imageFiles.length === 0 || sliderFiles.length === 0) {
        console.error('验证码资源文件为空:', {
          imageFiles: imageFiles.length,
          sliderFiles: sliderFiles.length,
        });
        throw new Error(
          `验证码资源文件不存在: 背景图片${imageFiles.length}张, 滑块模板${sliderFiles.length}张`,
        );
      }

      // 随机选择图片
      const randomImageIndex = Math.floor(Math.random() * imageFiles.length);
      const randomSliderIndex = Math.floor(Math.random() * sliderFiles.length);
      const nextSliderIndex =
        randomSliderIndex === sliderFiles.length - 1
          ? randomSliderIndex - 1
          : randomSliderIndex + 1;

      const originalImagePath = path.join(imagesPath, imageFiles[randomImageIndex]);
      const sliderTemplatePath = path.join(sliderPath, sliderFiles[randomSliderIndex]);
      const interfereTemplatePath = path.join(sliderPath, sliderFiles[nextSliderIndex]);

      // 读取图片
      if (
        !fs.existsSync(originalImagePath) ||
        !fs.existsSync(sliderTemplatePath) ||
        !fs.existsSync(interfereTemplatePath)
      ) {
        console.error('图片文件不存在:', {
          originalImagePath,
          sliderTemplatePath,
          interfereTemplatePath,
        });
        throw new Error('验证码图片文件不存在');
      }

      const originalBuffer = fs.readFileSync(originalImagePath);
      const sliderTemplateBuffer = fs.readFileSync(sliderTemplatePath);
      const interfereTemplateBuffer = fs.readFileSync(interfereTemplatePath);

      // 获取图片尺寸
      const originalMeta = await sharp(originalBuffer).metadata();
      const sliderMeta = await sharp(sliderTemplateBuffer).metadata();

      const originalWidth = originalMeta.width || 300;
      const originalHeight = originalMeta.height || 150;
      const sliderWidth = sliderMeta.width || 60;
      const sliderHeight = sliderMeta.height || 60;

      // 修复：优化坐标生成算法，确保滑块位置合理且Y坐标在水平线上
      // 限制Y坐标在图片的中部区域，避免过于靠上或靠下
      const minY = Math.floor(originalHeight * 0.2); // 至少在20%的位置
      const maxY = Math.floor(originalHeight * 0.8); // 最多在80%的位置
      const randomY = Math.floor(Math.random() * (maxY - minY)) + minY;

      // X坐标生成保持原有逻辑，但确保不与Y坐标冲突
      const randomX =
        Math.floor(Math.random() * (originalWidth - 3 * sliderWidth)) + 2 * sliderWidth;

      // 生成滑块验证码图片
      const { slidingImage, backImage } = await this.generateSliderCaptchaImages(
        originalBuffer,
        sliderTemplateBuffer,
        interfereTemplateBuffer,
        randomX,
        randomY,
        sliderWidth,
        sliderHeight,
        originalWidth,
        originalHeight,
      );

      // 修复：同时缓存X和Y坐标，以及滑块尺寸信息
      const verificationData = {
        x: randomX,
        y: randomY,
        sliderWidth,
        sliderHeight,
        originalWidth,
        originalHeight,
      };
      const cacheKey = `VERIFICATION_KEY:${verificationEnums}:${uuid}`;
      await this.cacheManager.set(cacheKey, verificationData, 600000);

      return {
        slidingImage,
        backImage,
        randomX, // 添加randomX，前端需要用它来显示滑块位置
        randomY,
        originalHeight,
        originalWidth,
        sliderHeight,
        sliderWidth,
        key: cacheKey,
        effectiveTime: 600,
      };
    } catch (error: any) {
      console.error('生成滑块验证码失败:', error);
      throw new Error(`生成滑块验证码失败: ${error.message}`);
    }
  }

  /**
   * 预校验滑块验证码
   * 修复：改进验证逻辑，支持X和Y坐标的同时验证，提高准确性
   * @param xPos X轴移动距离
   * @param uuid 用户唯一标识
   * @param verificationEnums 验证场景
   */
  async preCheckSliderCaptcha(
    xPos: number,
    uuid: string,
    verificationEnums: VerificationEnums,
    yPos?: number,
  ): Promise<boolean> {
    const cacheKey = `VERIFICATION_KEY:${verificationEnums}:${uuid}`;
    const verificationData = await this.cacheManager.get<any>(cacheKey);

    if (!verificationData) {
      throw new Error('验证码已失效');
    }

    // 修复：支持对象类型的缓存数据，包含X和Y坐标
    let expectedX: number;
    let expectedY: number;
    if (typeof verificationData === 'object' && verificationData.x !== undefined) {
      expectedX = verificationData.x;
      expectedY = verificationData.y || 0; // Y坐标可能为undefined，使用默认值0
    } else if (typeof verificationData === 'number') {
      expectedX = verificationData;
      expectedY = 0; // 旧格式只有X坐标，Y坐标默认为0
    } else {
      throw new Error('验证码数据格式错误');
    }

    // 优化容错范围：动态计算容错值
    const baseFaultTolerant = 5; // 基础容错5像素
    const dynamicFaultTolerant = Math.floor(expectedX * 0.02); // 动态容错2%
    const faultTolerant = Math.max(baseFaultTolerant, dynamicFaultTolerant);

    // Y坐标的容错范围，水平线问题需要更严格的Y坐标验证
    const yFaultTolerant = 3; // Y坐标容错3像素，确保在水平线上

    // 验证X坐标
    const xValid = Math.abs(expectedX - xPos) <= faultTolerant;

    // 验证Y坐标（如果有提供）
    const yValid = yPos === undefined || Math.abs(expectedY - yPos) <= yFaultTolerant;

    if (xValid && yValid) {
      // 验证成功，删除验证码key，设置验证结果
      await this.cacheManager.del(cacheKey);
      const resultKey = `VERIFICATION_RESULT:${verificationEnums}:${uuid}`;
      await this.cacheManager.set(resultKey, true, 600000);
      return true;
    }

    // 提供详细的错误信息，包括X和Y坐标的验证结果
    const xError = xValid
      ? ''
      : `X坐标验证失败，期望: ${expectedX}, 实际: ${xPos}, 容错: ±${faultTolerant}`;
    const yError =
      !yValid && yPos !== undefined
        ? `Y坐标验证失败，期望: ${expectedY}, 实际: ${yPos}, 容错: ±${yFaultTolerant}`
        : '';
    const errorMessage = [xError, yError].filter(Boolean).join('; ') || '未知验证错误';

    throw new Error(`验证失败: ${errorMessage}`);
  }

  /**
   * 检查验证码是否通过
   * @param uuid 用户唯一标识
   * @param verificationEnums 验证场景
   */
  async checkVerification(uuid: string, verificationEnums: VerificationEnums): Promise<boolean> {
    const resultKey = `VERIFICATION_RESULT:${verificationEnums}:${uuid}`;
    const result = await this.cacheManager.get<boolean>(resultKey);

    if (result === true) {
      await this.cacheManager.del(resultKey);
      return true;
    }

    throw new Error('验证码未通过或已失效');
  }

  private async generateSliderCaptchaImages(
    originalBuffer: Buffer,
    sliderTemplateBuffer: Buffer,
    interfereTemplateBuffer: Buffer,
    randomX: number,
    randomY: number,
    sliderWidth: number,
    sliderHeight: number,
    originalWidth: number,
    originalHeight: number,
  ): Promise<{ slidingImage: string; backImage: string }> {
    // 获取原图和模板的像素数据（RGBA格式，每个像素4字节）
    const originalImage = await sharp(originalBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const templateImage = await sharp(sliderTemplateBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // 像素级模板判断函数 - 拼图和缺口必须使用完全相同的逻辑
    // 关键：模板PNG图片中，不透明区域（alpha > 0）表示需要抠出的区域
    // 为了确保像素级完全匹配，我们只使用alpha通道判断，不依赖RGB值
    // 这样可以确保拼图和缺口使用完全相同的判断逻辑，像素级一致
    const shouldExtractPixel = (
      templateR: number,
      templateG: number,
      templateB: number,
      templateAlpha: number,
    ): boolean => {
      // 只使用alpha通道判断：alpha > 0 表示不透明，需要抠出
      // 这是最可靠的方法，确保拼图和缺口完全匹配
      return templateAlpha > 0;
    };

    // ========== 步骤1：生成拼图图片 ==========
    // 从原图的(randomX, randomY)位置提取sliderWidth×sliderHeight区域
    // 应用模板遮罩：模板不透明区域保留原图像素，透明区域设为透明
    const sliderPixels = Buffer.alloc(sliderWidth * sliderHeight * 4);

    for (let y = 0; y < sliderHeight; y++) {
      for (let x = 0; x < sliderWidth; x++) {
        // 原图中的绝对坐标
        const origX = randomX + x;
        const origY = randomY + y;

        // 边界检查：确保坐标在图片范围内
        if (origX < 0 || origX >= originalWidth || origY < 0 || origY >= originalHeight) {
          // 超出边界的像素设为透明
          const sliderIndex = (y * sliderWidth + x) * 4;
          sliderPixels[sliderIndex] = 0;
          sliderPixels[sliderIndex + 1] = 0;
          sliderPixels[sliderIndex + 2] = 0;
          sliderPixels[sliderIndex + 3] = 0;
          continue;
        }

        const origIndex = (origY * originalWidth + origX) * 4;

        // 模板中的坐标（模板大小 = sliderWidth × sliderHeight）
        const templateIndex = (y * sliderWidth + x) * 4;

        // 拼图图片中的坐标
        const sliderIndex = (y * sliderWidth + x) * 4;

        // 获取模板像素值
        const templateR = templateImage.data[templateIndex];
        const templateG = templateImage.data[templateIndex + 1];
        const templateB = templateImage.data[templateIndex + 2];
        const templateAlpha = templateImage.data[templateIndex + 3];

        // 判断该像素是否需要抠出（使用统一的判断函数）
        if (shouldExtractPixel(templateR, templateG, templateB, templateAlpha)) {
          // 需要抠出：保留原图像素
          sliderPixels[sliderIndex] = originalImage.data[origIndex]; // R
          sliderPixels[sliderIndex + 1] = originalImage.data[origIndex + 1]; // G
          sliderPixels[sliderIndex + 2] = originalImage.data[origIndex + 2]; // B
          sliderPixels[sliderIndex + 3] = 255; // A: 完全不透明
        } else {
          // 不需要抠出：设为完全透明
          sliderPixels[sliderIndex] = 0; // R
          sliderPixels[sliderIndex + 1] = 0; // G
          sliderPixels[sliderIndex + 2] = 0; // B
          sliderPixels[sliderIndex + 3] = 0; // A: 完全透明
        }
      }
    }

    // 将像素数据转换为PNG图片
    const slidingImage = await sharp(sliderPixels, {
      raw: {
        width: sliderWidth,
        height: sliderHeight,
        channels: 4,
      },
    })
      .png()
      .toBuffer();

    // ========== 步骤2：生成背景缺口 ==========
    // 在背景图的相同位置创建清晰的缺口（挖空效果），实时显示缺口位置
    // 方法：在原图的(randomX, randomY)位置，将模板不透明区域设为透明或半透明

    // 创建背景图的像素副本
    const backImagePixels = Buffer.from(originalImage.data);

    // 对滑块区域的每个像素进行处理
    // 添加边界检查，确保缺口不会超出图片范围
    for (let y = 0; y < sliderHeight; y++) {
      for (let x = 0; x < sliderWidth; x++) {
        // 原图中的绝对坐标
        const origX = randomX + x;
        const origY = randomY + y;

        // 边界检查：确保坐标在图片范围内
        if (origX < 0 || origX >= originalWidth || origY < 0 || origY >= originalHeight) {
          continue; // 跳过超出边界的像素
        }

        const origIndex = (origY * originalWidth + origX) * 4;

        // 模板中的坐标
        const templateIndex = (y * sliderWidth + x) * 4;
        const templateAlpha = templateImage.data[templateIndex + 3];

        // 使用与拼图生成完全相同的判断逻辑
        if (
          shouldExtractPixel(
            templateImage.data[templateIndex],
            templateImage.data[templateIndex + 1],
            templateImage.data[templateIndex + 2],
            templateAlpha,
          )
        ) {
          // 模板不透明区域：挖空处理（设为浅色，让缺口清晰可见）
          // 使用浅色填充，让缺口非常明显，用户能清楚看到拼图应该放在哪里
          backImagePixels[origIndex] = 240; // R: 浅灰色
          backImagePixels[origIndex + 1] = 240; // G: 浅灰色
          backImagePixels[origIndex + 2] = 240; // B: 浅灰色
          // Alpha通道保持不变
        }
        // 如果不需要挖空，保持原图像素不变
      }
    }

    // 将处理后的像素数据转换回图片（使用PNG格式以支持透明度）
    let backImageBuffer = await sharp(backImagePixels, {
      raw: {
        width: originalWidth,
        height: originalHeight,
        channels: 4,
      },
    })
      .png() // 使用PNG格式以支持透明度
      .toBuffer();

    // 3. 添加干扰块（使用不同的模板，放在不同位置）
    // 确保干扰块位置不与真实滑块位置重叠，并且不超出图片范围
    let interfereX =
      Math.floor(Math.random() * (originalWidth - 3 * sliderWidth)) + 2 * sliderWidth;
    let interfereY = Math.floor(Math.random() * (originalHeight - sliderHeight));

    // 确保干扰块位置不与真实滑块位置重叠
    if (
      Math.abs(interfereX - randomX) < sliderWidth * 2 ||
      Math.abs(interfereY - randomY) < sliderHeight
    ) {
      interfereX = (interfereX + sliderWidth * 3) % (originalWidth - sliderWidth);
      if (interfereX < sliderWidth) {
        interfereX = sliderWidth * 2;
      }
      interfereY = (interfereY + sliderHeight * 2) % (originalHeight - sliderHeight);
    }

    // 边界检查：确保干扰块不超出图片范围
    if (interfereX + sliderWidth > originalWidth) {
      interfereX = originalWidth - sliderWidth;
    }
    if (interfereY + sliderHeight > originalHeight) {
      interfereY = originalHeight - sliderHeight;
    }

    // 在干扰位置也进行挖空处理（与主缺口相同的处理方式，但不使用模糊）
    // 先获取干扰模板的像素数据（只处理一次，避免在循环中多次调用）
    let interfereTemplatePixels: any = null;
    if (interfereTemplateBuffer) {
      interfereTemplatePixels = await sharp(interfereTemplateBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
    }

    // 提取干扰区域的像素
    const interferePixels = await sharp(backImageBuffer)
      .extract({ left: interfereX, top: interfereY, width: sliderWidth, height: sliderHeight })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // 对干扰块应用相同的挖空处理
    for (let y = 0; y < sliderHeight; y++) {
      for (let x = 0; x < sliderWidth; x++) {
        const pixelIndex = (y * sliderWidth + x) * 4;

        if (interfereTemplatePixels) {
          const interfereTemplateIndex = (y * sliderWidth + x) * 4;
          const interfereTemplateAlpha = interfereTemplatePixels.data[interfereTemplateIndex + 3];

          if (interfereTemplateAlpha > 0) {
            // 干扰块也使用浅色填充
            interferePixels.data[pixelIndex] = 220; // R: 稍深的浅灰色
            interferePixels.data[pixelIndex + 1] = 220; // G: 稍深的浅灰色
            interferePixels.data[pixelIndex + 2] = 220; // B: 稍深的浅灰色
          }
        }
      }
    }

    const interfereRegion = await sharp(interferePixels.data, {
      raw: {
        width: sliderWidth,
        height: sliderHeight,
        channels: 4,
      },
    })
      .png()
      .toBuffer();

    backImageBuffer = await sharp(backImageBuffer)
      .composite([
        {
          input: interfereRegion,
          left: interfereX,
          top: interfereY,
          blend: 'over',
        },
      ])
      .png() // 保持PNG格式
      .toBuffer();

    // 4. 转换为base64
    const slidingImageBase64 = slidingImage.toString('base64');
    const backImageBase64 = backImageBuffer.toString('base64');

    return {
      slidingImage: `data:image/png;base64,${slidingImageBase64}`,
      backImage: `data:image/jpeg;base64,${backImageBase64}`,
    };
  }
}
