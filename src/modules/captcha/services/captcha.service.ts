import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { createCanvas, loadImage } from 'canvas';
import { v4 as uuidv4 } from 'uuid';
import { MallCaptcha } from '../entities/captcha.entity';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CaptchaService {
  private readonly backgroundImagesPath: string;
  private readonly sliderImagesPath: string;
  private readonly watermark: string;
  private readonly interfereNum: number;
  private readonly tolerance: number;
  private readonly effectiveTime: number;

  constructor(
    @InjectRepository(MallCaptcha) private readonly captchaRepository: Repository<MallCaptcha>,
    private readonly configService: ConfigService,
  ) {
    this.backgroundImagesPath = path.join(__dirname, '../resources/background');
    this.sliderImagesPath = path.join(__dirname, '../resources/slider');
    this.watermark = this.configService.get<string>('CAPTCHA_WATERMARK', '');
    this.interfereNum = this.configService.get<number>('CAPTCHA_INTERFERE_NUM', 0);
    this.tolerance = this.configService.get<number>('CAPTCHA_TOLERANCE', 5);
    this.effectiveTime = this.configService.get<number>('CAPTCHA_EFFECTIVE_TIME', 600); // 秒
  }

  async generateSliderCaptcha(ip?: string, userAgent?: string): Promise<any> {
    try {
      // 获取背景图片列表
      const backgroundImages = this.getFilesFromDirectory(this.backgroundImagesPath);
      const sliderImages = this.getFilesFromDirectory(this.sliderImagesPath);

      // 如果没有预定义图片，使用默认实现
      if (backgroundImages.length === 0 || sliderImages.length === 0) {
        return this.generateDefaultSliderCaptcha(ip, userAgent);
      }

      // 随机选择背景图片和滑块模板
      const randomBgIndex = Math.floor(Math.random() * backgroundImages.length);
      const randomSliderIndex = Math.floor(Math.random() * sliderImages.length);

      // 加载图片
      const backgroundImage = await loadImage(backgroundImages[randomBgIndex]);
      const sliderTemplate = await loadImage(sliderImages[randomSliderIndex]);

      // 获取图片尺寸
      const originalWidth = backgroundImage.width;
      const originalHeight = backgroundImage.height;
      const sliderWidth = sliderTemplate.width;
      const sliderHeight = sliderTemplate.height;

      // 创建画布
      const backgroundCanvas = createCanvas(originalWidth, originalHeight);
      const backgroundCtx = backgroundCanvas.getContext('2d');
      const sliderCanvas = createCanvas(sliderWidth, sliderHeight);
      const sliderCtx = sliderCanvas.getContext('2d');

      // 绘制背景图片
      backgroundCtx.drawImage(backgroundImage, 0, 0, originalWidth, originalHeight);

      // 随机生成滑块位置
      const randomX = Math.floor(Math.random() * (originalWidth - 3 * sliderWidth)) + 2 * sliderWidth;
      const randomY = Math.floor(Math.random() * (originalHeight - sliderHeight));

      // 添加干扰块
      if (this.interfereNum > 0 && sliderImages.length > 1) {
        for (let i = 0; i < this.interfereNum; i++) {
          const interfereIndex = randomSliderIndex === sliderImages.length - 1 ? randomSliderIndex - 1 : randomSliderIndex + 1;
          const interfereTemplate = await loadImage(sliderImages[interfereIndex]);
          const interfereX = Math.floor(Math.random() * (originalWidth - sliderWidth));
          const interfereY = Math.floor(Math.random() * (originalHeight - sliderHeight));
          this.drawInterfereBlock(backgroundCtx, interfereTemplate, interfereX, interfereY);
        }
      }

      // 绘制滑块阴影
      this.drawSliderShadow(backgroundCtx, randomX, randomY, sliderWidth, sliderHeight);

      // 绘制滑块图片
      sliderCtx.drawImage(sliderTemplate, 0, 0, sliderWidth, sliderHeight);

      // 添加水印
      if (this.watermark) {
        this.addWatermark(backgroundCtx, this.watermark, originalWidth, originalHeight);
      }

      // 转换为base64
      const backgroundBase64 = backgroundCanvas.toDataURL('image/png');
      const sliderBase64 = sliderCanvas.toDataURL('image/png');

      // 保存验证码信息
      const captchaKey = uuidv4();
      const expireTime = new Date(Date.now() + this.effectiveTime * 1000);

      const captcha = this.captchaRepository.create({
        captchaType: 'slider',
        captchaKey,
        captchaValue: randomX.toString(),
        expireTime,
        ipAddress: ip,
        userAgent,
        backgroundImage: backgroundBase64,
        sliderImage: sliderBase64,
      });

      await this.captchaRepository.save(captcha);

      return {
        captchaKey,
        backgroundImage: backgroundBase64,
        sliderImage: sliderBase64,
        randomY,
        originalWidth,
        originalHeight,
        sliderWidth,
        sliderHeight,
      };
    } catch (error) {
      // 出错时使用默认实现
      console.error('Error generating slider captcha with images:', error);
      return this.generateDefaultSliderCaptcha(ip, userAgent);
    }
  }

  private async generateDefaultSliderCaptcha(ip?: string, userAgent?: string): Promise<any> {
    const width = 300;
    const height = 150;
    const sliderWidth = 40;
    const sliderHeight = 40;

    // 创建背景画布
    const backgroundCanvas = createCanvas(width, height);
    const backgroundCtx = backgroundCanvas.getContext('2d');

    // 生成随机背景颜色
    backgroundCtx.fillStyle = `rgb(${Math.floor(Math.random() * 100) + 155}, ${Math.floor(Math.random() * 100) + 155}, ${Math.floor(Math.random() * 100) + 155})`;
    backgroundCtx.fillRect(0, 0, width, height);

    // 生成随机滑块位置
    const sliderX = Math.floor(Math.random() * (width - sliderWidth * 2)) + sliderWidth;
    const sliderY = Math.floor(Math.random() * (height - sliderHeight));

    // 创建滑块画布
    const sliderCanvas = createCanvas(sliderWidth, sliderHeight);
    const sliderCtx = sliderCanvas.getContext('2d');

    // 绘制滑块形状
    this.drawSliderShape(backgroundCtx, sliderX, sliderY, sliderWidth, sliderHeight, true);
    this.drawSliderShape(sliderCtx, 0, 0, sliderWidth, sliderHeight, false);

    // 转换为base64
    const backgroundBase64 = backgroundCanvas.toDataURL('image/png');
    const sliderBase64 = sliderCanvas.toDataURL('image/png');

    // 保存验证码信息
    const captchaKey = uuidv4();
    const expireTime = new Date(Date.now() + this.effectiveTime * 1000);

    const captcha = this.captchaRepository.create({
      captchaType: 'slider',
      captchaKey,
      captchaValue: sliderX.toString(),
      expireTime,
      ipAddress: ip,
      userAgent,
    });

    await this.captchaRepository.save(captcha);

    return {
      captchaKey,
      backgroundImage: backgroundBase64,
      sliderImage: sliderBase64,
    };
  }

  async verifySliderCaptcha(captchaKey: string, captchaValue: number): Promise<boolean> {
    const captcha = await this.captchaRepository.findOne({ where: { captchaKey, isUsed: 0 } });
    if (!captcha) {
      throw new NotFoundException('验证码不存在或已使用');
    }

    if (new Date() > captcha.expireTime) {
      throw new BadRequestException('验证码已过期');
    }

    const correctValue = parseInt(captcha.captchaValue);
    const isValid = Math.abs(captchaValue - correctValue) <= this.tolerance;

    captcha.isUsed = 1;
    await this.captchaRepository.save(captcha);

    return isValid;
  }

  private drawSliderShape(ctx: any, x: number, y: number, width: number, height: number, isBackground: boolean): void {
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.arcTo(x + width, y, x + width, y + height / 2, 10);
    ctx.arcTo(x + width, y + height, x + width / 2, y + height, 10);
    ctx.arcTo(x, y + height, x, y + height / 2, 10);
    ctx.arcTo(x, y, x + width / 2, y, 10);
    ctx.closePath();

    if (isBackground) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /**
   * 获取目录中的图片文件列表
   */
  private getFilesFromDirectory(directoryPath: string): string[] {
    try {
      const files = fs.readdirSync(directoryPath);
      return files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
        })
        .map(file => path.join(directoryPath, file));
    } catch (error) {
      console.error(`Error reading directory ${directoryPath}:`, error);
      return [];
    }
  }

  /**
   * 绘制干扰块
   */
  private drawInterfereBlock(ctx: any, interfereTemplate: any, x: number, y: number): void {
    // 设置透明度
    ctx.globalAlpha = 0.5;
    ctx.drawImage(interfereTemplate, x, y);
    ctx.globalAlpha = 1.0;
  }

  /**
   * 绘制滑块阴影
   */
  private drawSliderShadow(ctx: any, x: number, y: number, width: number, height: number): void {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(x, y, width, height);
    ctx.restore();
  }

  /**
   * 添加水印
   */
  private addWatermark(ctx: any, watermark: string, width: number, height: number): void {
    ctx.save();
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(watermark, width / 2, height - 10);
    ctx.restore();
  }

  async cleanupExpiredCaptchas(): Promise<void> {
    await this.captchaRepository.delete({ expireTime: LessThan(new Date()) });
  }
}
