import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('mall_logistics', { comment: '物流公司设置' })
export class MallLogistics {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '物流ID' })
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 50, nullable: false, comment: '物流公司名称' })
  name: string;

  @Column({ name: 'code', type: 'varchar', length: 30, nullable: false, comment: '物流公司code' })
  code: string;

  @Column({ name: 'stand_by', type: 'varchar', length: 10, nullable: true, default: 'N', comment: '支持电子面单 Y/N' })
  standBy: string;

  @Column({ name: 'form_items', type: 'text', nullable: true, comment: '物流公司电子面单表单' })
  formItems: string;

  @Column({ name: 'disabled', type: 'varchar', length: 10, nullable: false, default: 'OPEN', comment: '禁用状态 OPEN：开启，CLOSE：禁用' })
  disabled: string;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', type: 'datetime', comment: '更新时间' })
  updateTime: Date;
}
