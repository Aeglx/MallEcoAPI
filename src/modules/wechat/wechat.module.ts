import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { WechatController } from './wechat.controller';
import { WechatService } from './wechat.service';
import { WechatFansService } from './services/wechat-fans.service';
import { WechatSubscribeService } from './services/wechat-subscribe.service';
import { WechatTemplateService } from './services/wechat-template.service';
import { WechatH5Service } from './services/wechat-h5.service';
import { WechatCouponService } from './services/wechat-coupon.service';
import { WechatMaterialService } from './services/wechat-material.service';
import { WechatMenuService } from './services/wechat-menu.service';
import { WechatOauthService } from './services/wechat-oauth.service';
import { WechatApiService } from './services/wechat-api.service';
import { WechatFansController } from './controllers/wechat-fans.controller';
import { WechatSubscribeController } from './controllers/wechat-subscribe.controller';
import { WechatTemplateController } from './controllers/wechat-template.controller';
import { WechatH5Controller } from './controllers/wechat-h5.controller';
import { WechatCouponController } from './controllers/wechat-coupon.controller';
import { WechatMaterialController } from './controllers/wechat-material.controller';
import { WechatMenuController } from './controllers/wechat-menu.controller';
import { WechatOauthController } from './controllers/wechat-oauth.controller';
import { WechatOauthAppController } from './controllers/wechat-oauth-app.controller';
import { WechatOauthTokenController } from './controllers/wechat-oauth-token.controller';

// 实体导入
import { WechatFans } from './entities/wechat-fans.entity';
import { WechatSubscribe } from './entities/wechat-subscribe.entity';
import { WechatTemplate } from './entities/wechat-template.entity';
import { WechatH5Page } from './entities/wechat-h5-page.entity';
import { WechatH5Template } from './entities/wechat-h5-template.entity';
import { WechatCoupon } from './entities/wechat-coupon.entity';
import { WechatCouponTemplate } from './entities/wechat-coupon-template.entity';
import { WechatCouponRecord } from './entities/wechat-coupon-record.entity';
import { WechatMaterialImage } from './entities/wechat-material-image.entity';
import { WechatMaterialVideo } from './entities/wechat-material-video.entity';
import { WechatMaterialVoice } from './entities/wechat-material-voice.entity';
import { WechatMaterialArticle } from './entities/wechat-material-article.entity';
import { WechatMenu } from './entities/wechat-menu.entity';
import { WechatMenuKeyword } from './entities/wechat-menu-keyword.entity';
import { WechatOauthUser } from './entities/wechat-oauth-user.entity';
import { WechatOauthApp } from './entities/wechat-oauth-app.entity';
import { WechatOauthToken } from './entities/wechat-oauth-token.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      WechatFans,
      WechatSubscribe,
      WechatTemplate,
      WechatH5Page,
      WechatH5Template,
      WechatCoupon,
      WechatCouponTemplate,
      WechatCouponRecord,
      WechatMaterialImage,
      WechatMaterialVideo,
      WechatMaterialVoice,
      WechatMaterialArticle,
      WechatMenu,
      WechatMenuKeyword,
      WechatOauthUser,
      WechatOauthApp,
      WechatOauthToken,
    ]),
  ],
  controllers: [
    WechatController,
    WechatFansController,
    WechatSubscribeController,
    WechatTemplateController,
    WechatH5Controller,
    WechatCouponController,
    WechatMaterialController,
    WechatMenuController,
    WechatOauthController,
    WechatOauthAppController,
    WechatOauthTokenController,
  ],
  providers: [
    WechatService,
    WechatFansService,
    WechatSubscribeService,
    WechatTemplateService,
    WechatH5Service,
    WechatCouponService,
    WechatMaterialService,
    WechatMenuService,
    WechatOauthService,
    WechatApiService,
  ],
  exports: [
    WechatService,
    WechatFansService,
    WechatSubscribeService,
    WechatTemplateService,
    WechatH5Service,
    WechatCouponService,
    WechatMaterialService,
    WechatMenuService,
    WechatOauthService,
    WechatApiService,
  ],
})
export class WechatModule {}
