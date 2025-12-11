import { Module } from '@nestjs/common';
import { CaptchaController } from './controllers/captcha.controller';
import { CaptchaService } from './services/captcha.service';
import { CaptchaUtil } from './utils/captcha.util';

@Module({
  controllers: [CaptchaController],
  providers: [CaptchaService, CaptchaUtil],
  exports: [CaptchaService],
})
export class CaptchaModule {}