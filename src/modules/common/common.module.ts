import { Module } from '@nestjs/common';
import { SiteController } from './controllers/site.controller';
import { SiteService } from './services/site.service';
import { RegionController } from './controllers/region.controller';
import { RegionService } from './services/region.service';
import { IMController } from './controllers/im.controller';
import { IMService } from './services/im.service';
import { VerifyController } from './controllers/verify.controller';
import { CaptchaModule } from '../captcha/captcha.module';
import { SmsModule } from '../sms/sms.module';

@Module({
  imports: [CaptchaModule, SmsModule],
  controllers: [SiteController, RegionController, IMController, VerifyController],
  providers: [SiteService, RegionService, IMService],
})
export class CommonModule {}