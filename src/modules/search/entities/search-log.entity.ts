import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('mall_search_log')
export class SearchLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'varchar', length: 32 })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  keyword: string;

  @Column({ name: 'search_depth', type: 'int', default: 1 })
  searchDepth: number;

  @Column({ name: 'create_time', type: 'datetime' })
  @CreateDateColumn()
  createTime: Date;

  @Column({ name: 'update_time', type: 'datetime' })
  @UpdateDateColumn()
  updateTime: Date;

  @Column({ name: 'delete_flag', type: 'tinyint', default: 0 })
  deleteFlag: number;
}