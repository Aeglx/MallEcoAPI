import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('mall_payment_method')
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 50, nullable: false, comment: '支付方式名称' })
  name: string;

  @Column({ name: 'code', type: 'varchar', length: 50, nullable: false, unique: true, comment: '支付方式编码' })
  code: string;

  @Column({ name: 'description', type: 'varchar', length: 200, nullable: true, comment: '支付方式描述' })
  description: string;

  @Column({ name: 'icon', type: 'varchar', length: 200, nullable: true, comment: '支付方式图标' })
  icon: string;

  @Column({ name: 'config', type: 'json', nullable: true, comment: '支付配置(JSON格式)' })
  config: any;

  @Column({ name: 'status', type: 'tinyint', nullable: false, default: 1, comment: '状态: 0-禁用 1-启用' })
  status: number;

  @Column({ name: 'sort_order', type: 'int', nullable: false, default: 0, comment: '排序' })
  sortOrder: number;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', nullable: false, comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'update_time', type: 'datetime', nullable: false, comment: '更新时间' })
  updatedAt: Date;
}
