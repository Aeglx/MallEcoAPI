import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 积分商品分类实体
 */
@Entity('points_category')
export class PointsCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, comment: '分类名称' })
  categoryName: string;

  @Column({ length: 500, nullable: true, comment: '分类图标' })
  icon: string;

  @Column({ type: 'int', default: 0, comment: '排序权重' })
  sortOrder: number;

  @Column({ default: true, comment: '是否显示' })
  isShow: boolean;

  @Column({ type: 'text', nullable: true, comment: '分类描述' })
  description: string;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;

  @Column({ default: false, comment: '是否删除' })
  deleted: boolean;
}
