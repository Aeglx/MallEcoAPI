import { BaseEntity } from '../../../common/base.entity';
import { Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export abstract class BaseWechatEntity extends BaseEntity {
  @Column({ comment: '创建人ID' })
  createById: string;

  @Column({ comment: '更新人ID' })
  updateById: string;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;

  @DeleteDateColumn({ comment: '删除时间' })
  deleteTime: Date;
}