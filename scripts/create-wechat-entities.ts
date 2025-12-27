// 创建其余实体文件的脚本
const fs = require('fs');
const path = require('path');

const entities = [
  {
    name: 'wechat-h5-template.entity.ts',
    content: `import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_h5_template')
export class WechatH5Template extends BaseWechatEntity {
  @Column({ length: 200, comment: '模板名称' })
  name: string;

  @Column({ type: 'text', comment: '模板内容' })
  content: string;

  @Column({ length: 100, nullable: true, comment: '模板描述' })
  description: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '模板预览图' })
  preview: string;

  @Column({ type: 'json', nullable: true, comment: '模板配置' })
  config: any;

  @Column({ type: 'int', default: 0, comment: '使用次数' })
  usageCount: number;
}`,
  },
  {
    name: 'wechat-coupon.entity.ts',
    content: `import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_coupon')
export class WechatCoupon extends BaseWechatEntity {
  @Column({ length: 100, comment: '卡券ID' })
  couponId: string;

  @Column({ length: 200, comment: '卡券标题' })
  title: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-未使用，2-已使用，3-已过期' })
  status: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '面额' })
  value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '最低消费' })
  leastCost: number;

  @Column({ type: 'datetime', comment: '开始时间' })
  beginTime: Date;

  @Column({ type: 'datetime', comment: '结束时间' })
  endTime: Date;

  @Column({ length: 50, nullable: true, comment: '用户openid' })
  openid: string;

  @Column({ type: 'datetime', nullable: true, comment: '使用时间' })
  consumeTime: Date;
}`,
  },
  {
    name: 'wechat-coupon-template.entity.ts',
    content: `import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_coupon_template')
export class WechatCouponTemplate extends BaseWechatEntity {
  @Column({ length: 100, comment: '模板ID' })
  templateId: string;

  @Column({ length: 200, comment: '模板标题' })
  title: string;

  @Column({ type: 'text', comment: '使用说明' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '面额' })
  value: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '最低消费' })
  leastCost: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '发放数量' })
  quantity: number;

  @Column({ type: 'int', default: 0, comment: '已领取数量' })
  receivedCount: number;

  @Column({ type: 'int', default: 0, comment: '已使用数量' })
  usedCount: number;
}`,
  },
  {
    name: 'wechat-coupon-record.entity.ts',
    content: `import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_coupon_record')
export class WechatCouponRecord extends BaseWechatEntity {
  @Column({ length: 100, comment: '卡券ID' })
  couponId: string;

  @Column({ length: 50, comment: '用户openid' })
  openid: string;

  @Column({ type: 'tinyint', default: 1, comment: '核销状态：1-待核销，2-已核销，3-已过期' })
  status: number;

  @Column({ type: 'datetime', comment: '核销时间' })
  verifyTime: Date;

  @Column({ length: 100, nullable: true, comment: '核销门店' })
  verifyStore: string;

  @Column({ type: 'text', nullable: true, comment: '核销备注' })
  verifyRemark: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '订单金额' })
  orderAmount: number;

  @Column({ length: 100, nullable: true, comment: '订单号' })
  orderId: string;
}`,
  },
  {
    name: 'wechat-material-image.entity.ts',
    content: `import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_material_image')
export class WechatMaterialImage extends BaseWechatEntity {
  @Column({ length: 100, comment: '媒体ID' })
  mediaId: string;

  @Column({ length: 200, comment: '文件名称' })
  name: string;

  @Column({ type: 'text', comment: '文件URL' })
  url: string;

  @Column({ type: 'int', comment: '文件大小(字节)' })
  size: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '图片描述' })
  description: string;

  @Column({ type: 'int', default: 0, comment: '使用次数' })
  usageCount: number;
}`,
  },
  {
    name: 'wechat-material-video.entity.ts',
    content: `import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_material_video')
export class WechatMaterialVideo extends BaseWechatEntity {
  @Column({ length: 100, comment: '媒体ID' })
  mediaId: string;

  @Column({ length: 200, comment: '文件名称' })
  name: string;

  @Column({ type: 'text', comment: '文件URL' })
  url: string;

  @Column({ type: 'int', comment: '文件大小(字节)' })
  size: number;

  @Column({ type: 'int', comment: '播放时长(秒)' })
  duration: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '视频描述' })
  description: string;

  @Column({ type: 'int', default: 0, comment: '播放次数' })
  playCount: number;
}`,
  },
  {
    name: 'wechat-material-voice.entity.ts',
    content: `import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_material_voice')
export class WechatMaterialVoice extends BaseWechatEntity {
  @Column({ length: 100, comment: '媒体ID' })
  mediaId: string;

  @Column({ length: 200, comment: '文件名称' })
  name: string;

  @Column({ type: 'text', comment: '文件URL' })
  url: string;

  @Column({ type: 'int', comment: '文件大小(字节)' })
  size: number;

  @Column({ type: 'int', comment: '播放时长(秒)' })
  duration: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '播放次数' })
  playCount: number;
}`,
  },
  {
    name: 'wechat-material-article.entity.ts',
    content: `import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_material_article')
export class WechatMaterialArticle extends BaseWechatEntity {
  @Column({ length: 100, comment: '图文ID' })
  articleId: string;

  @Column({ length: 200, comment: '标题' })
  title: string;

  @Column({ type: 'text', comment: '内容' })
  content: string;

  @Column({ length: 500, nullable: true, comment: '封面图URL' })
  cover: string;

  @Column({ length: 500, nullable: true, comment: '原文链接' })
  sourceUrl: string;

  @Column({ type: 'text', nullable: true, comment: '摘要' })
  digest: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '阅读次数' })
  readCount: number;

  @Column({ type: 'int', default: 0, comment: '分享次数' })
  shareCount: number;
}`,
  },
  {
    name: 'wechat-menu.entity.ts',
    content: `import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_menu')
export class WechatMenu extends BaseWechatEntity {
  @Column({ length: 100, comment: '菜单ID' })
  menuId: string;

  @Column({ length: 50, comment: '菜单类型' })
  type: string;

  @Column({ length: 200, comment: '菜单名称' })
  name: string;

  @Column({ length: 500, nullable: true, comment: '菜单key' })
  menuKey: string;

  @Column({ length: 500, nullable: true, comment: '跳转URL' })
  url: string;

  @Column({ type: 'text', nullable: true, comment: '小程序信息' })
  miniprogram: string;

  @Column({ type: 'int', comment: '父菜单ID，0为一级菜单' })
  parentId: number;

  @Column({ type: 'int', comment: '菜单排序' })
  sortOrder: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ type: 'json', nullable: true, comment: '子菜单' })
  subButtons: any[];
}`,
  },
  {
    name: 'wechat-menu-keyword.entity.ts',
    content: `import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_menu_keyword')
export class WechatMenuKeyword extends BaseWechatEntity {
  @Column({ length: 100, comment: '关键词' })
  keyword: string;

  @Column({ length: 200, comment: '关键词名称' })
  name: string;

  @Column({ type: 'text', comment: '回复内容' })
  content: string;

  @Column({ length: 50, comment: '匹配模式：exact-精确匹配，fuzzy-模糊匹配' })
  matchMode: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '使用次数' })
  usageCount: number;

  @Column({ type: 'datetime', nullable: true, comment: '最后使用时间' })
  lastUsedTime: Date;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}`,
  },
  {
    name: 'wechat-oauth-user.entity.ts',
    content: `import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_oauth_user')
export class WechatOauthUser extends BaseWechatEntity {
  @Column({ length: 100, comment: '用户openid' })
  openid: string;

  @Column({ length: 100, nullable: true, comment: '用户unionid' })
  unionid: string;

  @Column({ length: 200, nullable: true, comment: '用户昵称' })
  nickname: string;

  @Column({ length: 500, nullable: true, comment: '头像URL' })
  headimgurl: string;

  @Column({ type: 'tinyint', default: 1, comment: '性别：0-未知，1-男，2-女' })
  sex: number;

  @Column({ length: 100, comment: '应用ID' })
  appId: string;

  @Column({ type: 'text', nullable: true, comment: '用户信息' })
  userInfo: string;

  @Column({ type: 'datetime', comment: '授权时间' })
  authTime: Date;

  @Column({ type: 'datetime', nullable: true, comment: '最后访问时间' })
  lastAccessTime: Date;

  @Column({ type: 'int', default: 0, comment: '访问次数' })
  accessCount: number;
}`,
  },
  {
    name: 'wechat-oauth-app.entity.ts',
    content: `import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_oauth_app')
export class WechatOauthApp extends BaseWechatEntity {
  @Column({ length: 100, comment: '应用ID' })
  appId: string;

  @Column({ length: 200, comment: '应用名称' })
  name: string;

  @Column({ length: 500, nullable: true, comment: '应用描述' })
  description: string;

  @Column({ length: 100, comment: '应用密钥' })
  appSecret: string;

  @Column({ length: 500, nullable: true, comment: '授权回调域' })
  redirectUri: string;

  @Column({ type: 'json', nullable: true, comment: '授权范围' })
  scopes: string[];

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '授权用户数' })
  userCount: number;

  @Column({ type: 'datetime', nullable: true, comment: '最后授权时间' })
  lastAuthTime: Date;
}`,
  },
  {
    name: 'wechat-oauth-token.entity.ts',
    content: `import { Entity, Column } from 'typeorm';
import { BaseWechatEntity } from './base-wechat.entity';

@Entity('wechat_oauth_token')
export class WechatOauthToken extends BaseWechatEntity {
  @Column({ length: 100, comment: '用户openid' })
  openid: string;

  @Column({ length: 100, comment: '应用ID' })
  appId: string;

  @Column({ length: 500, comment: '访问令牌' })
  accessToken: string;

  @Column({ length: 500, nullable: true, comment: '刷新令牌' })
  refreshToken: string;

  @Column({ type: 'int', comment: '令牌有效期(秒)' })
  expiresIn: number;

  @Column({ type: 'datetime', comment: '令牌创建时间' })
  createTime: Date;

  @Column({ type: 'datetime', comment: '令牌过期时间' })
  expireTime: Date;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-有效，0-无效' })
  status: number;

  @Column({ type: 'datetime', nullable: true, comment: '最后使用时间' })
  lastUsedTime: Date;

  @Column({ type: 'int', default: 0, comment: '使用次数' })
  usageCount: number;
}`,
  },
];

const entityDir = path.join(__dirname, '../src/modules/wechat/entities');

// 创建目录
if (!fs.existsSync(entityDir)) {
  fs.mkdirSync(entityDir, { recursive: true });
}

// 创建实体文件
entities.forEach(entity => {
  const filePath = path.join(entityDir, entity.name);
  fs.writeFileSync(filePath, entity.content);
  console.log(`Created: ${entity.name}`);
});

console.log('所有微信实体文件创建完成！');
