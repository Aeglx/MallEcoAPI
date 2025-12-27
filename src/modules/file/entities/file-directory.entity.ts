import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('mall_file_directory', { comment: '文件目录表' })
export class FileDirectory {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '目录ID' })
  id: string;

  @Column({ name: 'parent_id', type: 'varchar', length: 36, nullable: true, comment: '父目录ID' })
  parentId: string;

  @Column({ name: 'name', type: 'varchar', length: 100, nullable: false, comment: '目录名称' })
  name: string;

  @Column({ name: 'path', type: 'varchar', length: 500, nullable: false, comment: '目录路径' })
  path: string;

  @Column({ name: 'level', type: 'tinyint', nullable: false, default: 1, comment: '目录层级' })
  level: number;

  @Column({
    name: 'status',
    type: 'tinyint',
    nullable: false,
    default: 1,
    comment: '状态: 0-禁用 1-启用',
  })
  status: number;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', nullable: false, comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({
    name: 'update_time',
    type: 'datetime',
    nullable: false,
    onUpdate: 'CURRENT_TIMESTAMP',
    comment: '更新时间',
  })
  updateTime: Date;
}
