import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createCanvas, loadImage, Image } from 'canvas';
import { v4 as uuidv4 } from 'uuid';
import { MallCaptcha } from '../entities/captcha.entity';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { Inject } from '@nestjs/common';

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
    const expireTime = new Date(Date.now() + 5 * 60 * 1000); // 5分钟过期

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
    const tolerance = 5;
    const isValid = Math.abs(captchaValue - correctValue) <= tolerance;

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

  async cleanupExpiredCaptchas(): Promise<void> {
    await this.captchaRepository.delete({ expireTime: { $lt: new Date() } });
  }
}
