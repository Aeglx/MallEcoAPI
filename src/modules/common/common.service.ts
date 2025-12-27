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
          siteName: 'MallEco商城系统'
        })
      }, 
      message: '获取网站配置成功' 
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
        console.error('验证码资源文件为空:', { imageFiles: imageFiles.length, sliderFiles: sliderFiles.length });
        throw new Error(`验证码资源文件不存在: 背景图片${imageFiles.length}张, 滑块模板${sliderFiles.length}张`);
      }

    // 随机选择图片
    const randomImageIndex = Math.floor(Math.random() * imageFiles.length);
    const randomSliderIndex = Math.floor(Math.random() * sliderFiles.length);
    const nextSliderIndex = randomSliderIndex === sliderFiles.length - 1 
      ? randomSliderIndex - 1 
      : randomSliderIndex + 1;

    const originalImagePath = path.join(imagesPath, imageFiles[randomImageIndex]);
    const sliderTemplatePath = path.join(sliderPath, sliderFiles[randomSliderIndex]);
    const interfereTemplatePath = path.join(sliderPath, sliderFiles[nextSliderIndex]);

      // 读取图片
      if (!fs.existsSync(originalImagePath) || !fs.existsSync(sliderTemplatePath) || !fs.existsSync(interfereTemplatePath)) {
        console.error('图片文件不存在:', { originalImagePath, sliderTemplatePath, interfereTemplatePath });
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

      // 随机生成X、Y坐标
      const randomX = Math.floor(Math.random() * (originalWidth - 3 * sliderWidth)) + 2 * sliderWidth;
      const randomY = Math.floor(Math.random() * (originalHeight - sliderHeight));

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

      // 缓存验证码的X坐标，有效时间600秒
      const cacheKey = `VERIFICATION_KEY:${verificationEnums}:${uuid}`;
      await this.cacheManager.set(cacheKey, randomX, 600000);

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
   * @param xPos X轴移动距离
   * @param uuid 用户唯一标识
   * @param verificationEnums 验证场景
   */
  async preCheckSliderCaptcha(
    xPos: number,
    uuid: string,
    verificationEnums: VerificationEnums,
  ): Promise<boolean> {
    const cacheKey = `VERIFICATION_KEY:${verificationEnums}:${uuid}`;
    const randomX = await this.cacheManager.get<number>(cacheKey);

    if (randomX === null || randomX === undefined) {
      throw new Error('验证码已失效');
    }

    // 容错范围：允许5像素的误差
    const faultTolerant = 5;
    if (Math.abs(randomX - xPos) < faultTolerant) {
      // 验证成功，删除验证码key，设置验证结果
      await this.cacheManager.del(cacheKey);
      const resultKey = `VERIFICATION_RESULT:${verificationEnums}:${uuid}`;
      await this.cacheManager.set(resultKey, true, 600000);
      return true;
    }

    throw new Error('验证失败');
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

  /**
   * 生成滑块验证码图片
   * 基于 lilishop 的 ImageUtil.cutByTemplate 和 interfereTemplate 实现
   * 关键：拼图和背景缺口必须使用相同的模板，确保形状完全匹配
   */
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
    // 获取原图和模板的像素数据
    const originalImage = await sharp(originalBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const templateImage = await sharp(sliderTemplateBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    
    // 1. 创建滑块图片（从原图中抠出，使用模板作为遮罩）
    const sliderPixels = Buffer.alloc(sliderWidth * sliderHeight * 4);
    
    // 从原图中提取指定区域的像素，应用模板遮罩
    for (let y = 0; y < sliderHeight; y++) {
      for (let x = 0; x < sliderWidth; x++) {
        const origX = randomX + x;
        const origY = randomY + y;
        const origIndex = (origY * originalWidth + origX) * 4;
        const templateIndex = (y * sliderWidth + x) * 4;
        const sliderIndex = (y * sliderWidth + x) * 4;
        
        // 获取模板的alpha值和RGB值
        // 在滑块验证码模板中，通常：
        // - 白色/不透明区域（alpha=255或接近255）表示需要抠出的区域
        // - 黑色/透明区域（alpha=0或接近0）表示不需要的区域
        // 但有些模板可能相反，我们需要检查模板的实际值
        const templateR = templateImage.data[templateIndex];
        const templateG = templateImage.data[templateIndex + 1];
        const templateB = templateImage.data[templateIndex + 2];
        const templateAlpha = templateImage.data[templateIndex + 3];
        
        // 判断模板像素是否属于需要抠出的区域
        // 通常白色区域（RGB值较大，alpha=255）表示需要抠出
        // 黑色区域（RGB值较小，alpha=0）表示不需要
        const isWhite = templateR > 200 && templateG > 200 && templateB > 200 && templateAlpha > 200;
        
        if (isWhite) {
          // 模板白色区域（需要抠出的区域），保留原图像素
          sliderPixels[sliderIndex] = originalImage.data[origIndex];         // R
          sliderPixels[sliderIndex + 1] = originalImage.data[origIndex + 1]; // G
          sliderPixels[sliderIndex + 2] = originalImage.data[origIndex + 2]; // B
          sliderPixels[sliderIndex + 3] = 255; // 完全不透明
        } else {
          // 模板黑色区域（不需要的区域），滑块图片透明
          sliderPixels[sliderIndex] = 0;
          sliderPixels[sliderIndex + 1] = 0;
          sliderPixels[sliderIndex + 2] = 0;
          sliderPixels[sliderIndex + 3] = 0;
        }
      }
    }
    
    const slidingImage = await sharp(sliderPixels, {
      raw: {
        width: sliderWidth,
        height: sliderHeight,
        channels: 4
      }
    })
      .png()
      .toBuffer();

    // 2. 处理背景图片：在滑块位置使用相同模板创建缺口
    // 关键：必须使用相同的模板在相同位置创建缺口，确保形状完全匹配
    // 先提取滑块区域，应用模板遮罩后模糊，再放回原图
    const extractedRegion = await sharp(originalBuffer)
      .extract({ left: randomX, top: randomY, width: sliderWidth, height: sliderHeight })
      .ensureAlpha()
      .toBuffer();
    
    // 使用相同模板对提取的区域进行模糊处理（只模糊模板不透明的部分）
    const regionPixels = await sharp(extractedRegion).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const blurredPixels = Buffer.from(regionPixels.data);
    
    // 对模板白色区域（需要抠出的区域）进行模糊处理
    for (let y = 0; y < sliderHeight; y++) {
      for (let x = 0; x < sliderWidth; x++) {
        const templateIndex = (y * sliderWidth + x) * 4;
        const pixelIndex = (y * sliderWidth + x) * 4;
        const templateR = templateImage.data[templateIndex];
        const templateG = templateImage.data[templateIndex + 1];
        const templateB = templateImage.data[templateIndex + 2];
        const templateAlpha = templateImage.data[templateIndex + 3];
        
        // 判断模板像素是否属于需要抠出的区域（与拼图生成逻辑完全一致）
        const isOpaque = templateAlpha > 128; // alpha > 128 表示不透明
        const isWhite = templateR > 200 && templateG > 200 && templateB > 200;
        const shouldExtract = isOpaque || isWhite; // 不透明或白色区域需要抠出
        
        if (shouldExtract) {
          // 模板白色区域（需要抠出的区域），进行模糊处理
          let r = 0, g = 0, b = 0, count = 0;
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < sliderWidth && ny >= 0 && ny < sliderHeight) {
                const nIndex = (ny * sliderWidth + nx) * 4;
                r += regionPixels.data[nIndex];
                g += regionPixels.data[nIndex + 1];
                b += regionPixels.data[nIndex + 2];
                count++;
              }
            }
          }
          if (count > 0) {
            blurredPixels[pixelIndex] = Math.floor(r / count);
            blurredPixels[pixelIndex + 1] = Math.floor(g / count);
            blurredPixels[pixelIndex + 2] = Math.floor(b / count);
          }
        }
      }
    }
    
    const blurredRegion = await sharp(blurredPixels, {
      raw: {
        width: sliderWidth,
        height: sliderHeight,
        channels: 4
      }
    })
      .toBuffer();
    
    // 将模糊后的区域放回原图
    let backImageBuffer = await sharp(originalBuffer)
      .composite([
        {
          input: blurredRegion,
          left: randomX,
          top: randomY,
          blend: 'over',
        },
      ])
      .toBuffer();

    // 3. 添加干扰块（使用不同的模板，放在不同位置）
    const interfereX = Math.floor(Math.random() * (originalWidth - 3 * sliderWidth)) + 2 * sliderWidth;
    const interfereY = Math.floor(Math.random() * (originalHeight - sliderHeight));
    
    // 确保干扰块位置不与真实滑块位置重叠
    let finalInterfereX = interfereX;
    if (Math.abs(interfereX - randomX) < sliderWidth * 2) {
      finalInterfereX = (interfereX + sliderWidth * 3) % (originalWidth - sliderWidth);
      if (finalInterfereX < sliderWidth) {
        finalInterfereX = sliderWidth * 2;
      }
    }
    
    // 在干扰位置也进行模糊处理
    const interfereBlurred = await sharp(backImageBuffer)
      .extract({ left: finalInterfereX, top: interfereY, width: sliderWidth, height: sliderHeight })
      .blur(10)
      .toBuffer();
    
    backImageBuffer = await sharp(backImageBuffer)
      .composite([
        {
          input: interfereBlurred,
          left: finalInterfereX,
          top: interfereY,
          blend: 'over',
        },
      ])
      .jpeg({ quality: 90 })
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