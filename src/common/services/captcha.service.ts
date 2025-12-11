import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CaptchaUtil } from '../utils/captcha.util';

@Injectable()
export class CaptchaService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private captchaUtil: CaptchaUtil,
  ) {}

  /**
   * 生成验证码
   */
  async generateCaptcha(type: 'numeric' | 'math' | 'slider' = 'numeric'): Promise<{
    code: string;
    data: string;
    uuid: string;
    expiresIn: number;
    imageName?: string;
  }> {
    const uuid = this.captchaUtil.generateUUID();
    let captchaData;

    switch (type) {
      case 'numeric':
        captchaData = this.captchaUtil.generateNumericCaptcha();
        break;
      case 'math':
        captchaData = this.captchaUtil.generateMathCaptcha();
        break;
      case 'slider':
        const sliderData = await this.captchaUtil.generateSliderCaptcha();
        captchaData = {
          code: sliderData.xPos.toString(),
          data: JSON.stringify({
            background: sliderData.background,
            slider: sliderData.slider,
            uuid: sliderData.uuid,
            imageName: sliderData.imageName,
          }),
          imageName: sliderData.imageName,
        };
        break;
      default:
        captchaData = this.captchaUtil.generateNumericCaptcha();
    }

    // 存储验证码到缓存，有效期5分钟
    await this.cacheManager.set(`captcha:${uuid}`, captchaData.code, 300);

    return {
      code: captchaData.code,
      data: captchaData.data,
      uuid,
      expiresIn: 300,
      imageName: captchaData.imageName,
    };
  }

  /**
   * 验证验证码
   */
  async verifyCaptcha(uuid: string, userInput: string): Promise<boolean> {
    if (!uuid || !userInput) {
      return false;
    }

    const storedCode = await this.cacheManager.get<string>(`captcha:${uuid}`);
    
    if (!storedCode) {
      return false;
    }

    // 验证后删除缓存
    await this.cacheManager.del(`captcha:${uuid}`);

    return storedCode.toLowerCase() === userInput.toLowerCase();
  }

  /**
   * 验证滑块验证码
   */
  async verifySliderCaptcha(uuid: string, xPos: number): Promise<boolean> {
    if (!uuid || xPos === undefined) {
      return false;
    }

    const storedXPos = await this.cacheManager.get<string>(`captcha:${uuid}`);
    
    if (!storedXPos) {
      return false;
    }

    const expectedX = parseInt(storedXPos, 10);
    
    // 验证后删除缓存
    await this.cacheManager.del(`captcha:${uuid}`);

    return this.captchaUtil.verifySliderPosition(expectedX, xPos);
  }

  /**
   * 获取验证码状态
   */
  async getCaptchaStatus(uuid: string): Promise<{
    exists: boolean;
    expiresIn?: number;
  }> {
    if (!uuid) {
      return { exists: false };
    }

    const ttl = await this.cacheManager.store.ttl?.(`captcha:${uuid}`);
    
    if (ttl === undefined || ttl <= 0) {
      return { exists: false };
    }

    return {
      exists: true,
      expiresIn: ttl,
    };
  }

  /**
   * 清理过期验证码
   */
  async cleanupExpiredCaptchas(): Promise<void> {
    // 缓存管理器会自动处理过期数据
    // 这里可以添加额外的清理逻辑
  }
}