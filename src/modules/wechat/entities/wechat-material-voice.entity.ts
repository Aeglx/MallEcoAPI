import { Entity, Column } from 'typeorm';
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
}