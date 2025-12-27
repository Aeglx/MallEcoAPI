import { Entity, Column } from 'typeorm';
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

  @Column({ type: 'varchar', length: 36, default: '0', comment: '父菜单ID，0为一级菜单' })
  parentId: string;

  @Column({ type: 'int', comment: '菜单排序' })
  sortOrder: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @Column({ type: 'json', nullable: true, comment: '子菜单' })
  subButtons: any[];
}
