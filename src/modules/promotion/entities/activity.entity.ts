import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

@Entity('mall_activity')
export class Activity extends BaseEntity {
  @Column({ name: 'activity_name', length: 100, nullable: false, comment: '活动名称' })
  activityName: string;

  @Column({
    name: 'activity_type',
    type: 'tinyint',
    default: 0,
    comment: '活动类型：0-满减活动，1-限时折扣，2-秒杀活动',
  })
  activityType: number;

  @Column({ name: 'description', type: 'text', nullable: true, comment: '活动描述' })
  description: string;

  @Column({ name: 'start_time', type: 'datetime', nullable: false, comment: '开始时间' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: false, comment: '结束时间' })
  endTime: Date;

  @Column({
    name: 'status',
    type: 'tinyint',
    default: 0,
    comment: '状态：0-未发布，1-进行中，2-已结束',
  })
  status: number;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true, comment: '活动图片' })
  imageUrl: string;

  @Column({ name: 'rules', type: 'json', nullable: true, comment: '活动规则' })
  rules: any;

  @Column({ name: 'is_top', type: 'tinyint', default: 0, comment: '是否置顶' })
  isTop: number;
}
