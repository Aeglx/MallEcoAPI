import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../../common/base.entity';

@Entity('mall_brand')
@Index(['name'])
@Index(['isShow'])
export class Brand extends BaseEntity {
  @Column({ length: 50 })
  name: string;

  @Column({ length: 255, nullable: true })
  logo: string;

  @Column({ length: 255, nullable: true })
  desc: string;

  @Column()
  sort: number;

  @Column()
  isShow: number;
}
