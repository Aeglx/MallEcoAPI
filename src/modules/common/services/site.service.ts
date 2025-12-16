import { Injectable } from '@nestjs/common';

@Injectable()
export class SiteService {
  getBaseSetting() {
    // 返回与 Java 版本一致的 BaseSetting 数据结构
    return {
      success: true,
      result: {
        siteName: '商城系统',
        icp: '京ICP备12345678号',
        domainLogo: '/admin-logo.png',
        domainIcon: '/admin-icon.png',
        buyerSideLogo: '/buyer-logo.png',
        buyerSideIcon: '/buyer-icon.png',
        storeSideLogo: '/store-logo.png',
        storeSideIcon: '/store-icon.png',
        staticPageAddress: 'https://www.example.com',
        staticPageWapAddress: 'https://m.example.com'
      }
    };
  }
}