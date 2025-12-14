import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('mall_captcha', { comment: '验证码表' })
export class MallCaptcha {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '验证码ID' })
  id: string;

  @Column({ name: 'captcha_type', type: 'varchar', length: 20, nullable: false, default: 'slider', comment: '验证码类型: slider(滑块), text(文本), math(数学)' })
  captchaType: string;

  @Column({ name: 'captcha_key', type: 'varchar', length: 100, nullable: false, comment: '验证码唯一标识' })
  captchaKey: string;

  @Column({ name: 'captcha_value', type: 'varchar', length: 100, nullable: false, comment: '验证码值(滑块位置或文本答案)' })
  captchaValue: string;

  @Column({ name: 'background_image', type: 'varchar', length: 500, nullable: true, comment: '背景图片URL(滑块验证用)' })
  backgroundImage?: string;

  @Column({ name: 'slider_image', type: 'varchar', length: 500, nullable: true, comment: '滑块图片URL(滑块验证用)' })
  sliderImage?: string;

  @Column({ name: 'expire_time', type: 'datetime', nullable: false, comment: '过期时间' })
  expireTime: Date;

  @Column({ name: 'is_used', type: 'tinyint', width: 1, nullable: false, default: 0, comment: '是否使用: 0-未使用, 1-已使用' })
  isUsed: number;

  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true, comment: 'IP地址' })
  ipAddress?: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 200, nullable: true, comment: '用户代理' })
  userAgent?: string;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', type: 'datetime', comment: '更新时间' })
  updateTime: Date;
}
