import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MallCaptcha } from './entities/captcha.entity';
import { CaptchaController } from './controllers/captcha.controller';
import { CaptchaService } from './services/captcha.service';

@Module({
  imports: [TypeOrmModule.forFeature([MallCaptcha])],
  controllers: [CaptchaController],
  providers: [CaptchaService],
  exports: [CaptchaService],
})
export class CaptchaModule {}
