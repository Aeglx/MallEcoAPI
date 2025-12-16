import { Injectable } from '@nestjs/common';

@Injectable()
export class SiteService {
  getBaseSetting() {
    // 返回模拟的网站设置数据
    return {
      success: true,
      result: {
        siteName: '商城系统',
        siteLogo: '/logo.png',
        siteDescription: '这是一个电商网站',
        siteKeywords: '电商,商城,购物',
        siteCopyright: '© 2025 商城系统',
        sitePhone: '400-123-4567',
        siteEmail: 'contact@example.com',
        siteAddress: '北京市朝阳区XX路XX号'
      }
    };
  }
}