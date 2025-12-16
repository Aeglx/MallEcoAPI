import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MallCaptcha } from '../entities/captcha.entity';
import { ConfigService } from '@nestjs/config';
import * as svgCaptcha from 'svg-captcha';

@Injectable()
export class CaptchaService {
  private readonly tolerance: number;
  private readonly effectiveTime: number;
  // 简单的内存存储，用于在数据库不可用时保存验证码信息
  private readonly memoryCaptchas = new Map<string, { value: string, expireTime: Date }>();

  constructor(
    @InjectRepository(MallCaptcha) private readonly captchaRepository: Repository<MallCaptcha>,
    private readonly configService: ConfigService,
  ) {
    this.tolerance = this.configService.get<number>('CAPTCHA_TOLERANCE', 5);
    this.effectiveTime = this.configService.get<number>('CAPTCHA_EFFECTIVE_TIME', 600); // 秒
  }

  async generateSliderCaptcha(ip?: string, userAgent?: string): Promise<any> {
    try {
      // 使用svg-captcha生成文字验证码作为替代方案
      const captcha = svgCaptcha.create({
        size: 4,
        noise: 3,
        color: true,
        background: '#f0f0f0',
        width: 300,
        height: 150,
      });
      
      const captchaKey = uuidv4();
      const captchaValue = captcha.text;
      const expireTime = new Date(Date.now() + this.effectiveTime * 1000);
      
      // 将SVG转换为base64格式
      const svgBase64 = Buffer.from(captcha.data).toString('base64');
      const backgroundImage = `data:image/svg+xml;base64,${svgBase64}`;
      
      // 生成简单的滑块图片（SVG格式）
      const sliderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
        <rect width="50" height="50" fill="#ffffff" stroke="#cccccc" stroke-width="2"/>
        <text x="25" y="25" text-anchor="middle" dy=".3em" fill="#333333" font-size="24">?</text>
      </svg>`;
      const sliderBase64 = Buffer.from(sliderSvg).toString('base64');
      const sliderImage = `data:image/svg+xml;base64,${sliderBase64}`;
      
      try {
        // 尝试保存验证码信息到数据库
        const mallCaptcha = this.captchaRepository.create({
          captchaType: 'slider',
          captchaKey,
          captchaValue,
          expireTime,
          ipAddress: ip,
          userAgent,
          backgroundImage,
          sliderImage,
        });
        
        await this.captchaRepository.save(mallCaptcha);
      } catch (dbError) {
        // 数据库操作失败时，将验证码信息保存到内存中
        console.error('Database error when saving captcha:', dbError);
        this.memoryCaptchas.set(captchaKey, { value: captchaValue, expireTime });
        // 设置定时清理过期的内存验证码
        setTimeout(() => {
          this.memoryCaptchas.delete(captchaKey);
        }, this.effectiveTime * 1000);
      }

      return {
        captchaKey,
        backgroundImage,
        sliderImage,
        sliderWidth: 50,
        sliderHeight: 50,
        randomY: 50,
        originalWidth: 300,
        originalHeight: 150,
      };
    } catch (error) {
      // 出错时使用模拟数据，不依赖数据库
      console.error('Error generating slider captcha with SVG:', error);
      
      const captchaKey = uuidv4();
      
      return {
        captchaKey,
        backgroundImage: `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="150" background="#f0f0f0"><text x="150" y="75" text-anchor="middle" dy=".3em" fill="#333333" font-size="24">验证码</text></svg>').toString('base64')}`,
        sliderImage: `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><rect width="50" height="50" fill="#ffffff" stroke="#cccccc" stroke-width="2"/><text x="25" y="25" text-anchor="middle" dy=".3em" fill="#333333" font-size="24">?</text></svg>').toString('base64')}`,
        sliderWidth: 50,
        sliderHeight: 50,
        randomY: 50,
        originalWidth: 300,
        originalHeight: 150,
      };
    }
  }

  // 移除基于canvas的默认生成方法，因为我们已经在generateSliderCaptcha中实现了完整的svg-based解决方案
  // 如果需要默认实现，可以从generateSliderCaptcha方法中调用失败处理逻辑


  async verifySliderCaptcha(captchaKey: string, captchaValue: number | string): Promise<boolean> {
    let isValid = false;
    let captchaFromDatabase = null;

    // 1. 尝试从数据库获取验证码
    try {
      captchaFromDatabase = await this.captchaRepository.findOne({ where: { captchaKey, isUsed: 0 } });
    } catch (dbError) {
      console.error('Database error when verifying captcha:', dbError);
    }

    if (captchaFromDatabase) {
      // 验证码存在于数据库中
      if (new Date() > captchaFromDatabase.expireTime) {
        throw new BadRequestException('验证码已过期');
      }

      // 处理文字验证码或数字验证码
      if (typeof captchaValue === 'string') {
        // 文字验证码验证（忽略大小写）
        isValid = captchaFromDatabase.captchaValue.toLowerCase() === captchaValue.toLowerCase();
      } else {
        // 数字验证码验证
        const correctValue = parseInt(captchaFromDatabase.captchaValue);
        isValid = Math.abs(captchaValue - correctValue) <= this.tolerance;
      }

      // 更新数据库中的验证码状态
      try {
        captchaFromDatabase.isUsed = 1;
        await this.captchaRepository.save(captchaFromDatabase);
      } catch (dbError) {
        console.error('Database error when updating captcha:', dbError);
        // 忽略数据库更新错误，仍然返回验证结果
      }
    } else {
      // 2. 尝试从内存存储获取验证码
      const memoryCaptcha = this.memoryCaptchas.get(captchaKey);
      if (!memoryCaptcha) {
        throw new NotFoundException('验证码不存在或已使用');
      }

      if (new Date() > memoryCaptcha.expireTime) {
        // 验证码已过期，从内存中删除
        this.memoryCaptchas.delete(captchaKey);
        throw new BadRequestException('验证码已过期');
      }

      // 处理文字验证码或数字验证码
      if (typeof captchaValue === 'string') {
        // 文字验证码验证（忽略大小写）
        isValid = memoryCaptcha.value.toLowerCase() === captchaValue.toLowerCase();
      } else {
        // 数字验证码验证
        const correctValue = parseInt(memoryCaptcha.value);
        isValid = Math.abs(captchaValue - correctValue) <= this.tolerance;
      }

      // 从内存中删除已使用的验证码
      this.memoryCaptchas.delete(captchaKey);
    }

    return isValid;
  }



  async cleanupExpiredCaptchas(): Promise<void> {
    await this.captchaRepository.delete({ expireTime: LessThan(new Date()) });
  }
}
