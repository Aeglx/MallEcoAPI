import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../../common/base.entity';
import { Spec } from './spec.entity';

@Entity('mall_spec_value')
@Index(['specId'])
@Index(['value'])
export class SpecValue extends BaseEntity {
  @Column({ length: 32, name: 'spec_id' })
  specId: string;

  @Column({ length: 50 })
  value: string;

  @Column({ length: 255, nullable: true, name: 'image_url' })
  imageUrl: string;

  @Column()
  sort: number;

  // 鍏宠仈瑙勬牸
  @ManyToOne(() => Spec, (spec) => spec.values, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'spec_id' })
  spec: Spec;
}





