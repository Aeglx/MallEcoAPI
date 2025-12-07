import { Entity, Column, Index, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../../common/base.entity';
import { SpecValue } from './spec-value.entity';

@Entity('mall_spec')
@Index(['name'])
@Index(['isShow'])
export class Spec extends BaseEntity {
  @Column({ length: 50 })
  name: string;

  @Column()
  sort: number;

  @Column({ name: 'is_show' })
  isShow: number;

  // 关联规格值
  @OneToMany(() => SpecValue, (specValue) => specValue.spec)
  @JoinColumn({ name: 'spec_id' })
  values: SpecValue[];
}
