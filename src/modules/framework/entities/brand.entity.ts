import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('brand')
export class Brand {
  @ApiProperty({ description: '品牌ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '品牌名称' })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({ description: '品牌Logo' })
  @Column({ length: 200, nullable: true })
  logo: string;

  @ApiProperty({ description: '品牌描述' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: '品牌官网' })
  @Column({ length: 100, nullable: true })
  website: string;

  @ApiProperty({ description: '排序' })
  @Column('int', { default: 0 })
  sortOrder: number;

  @ApiProperty({ description: '状态' })
  @Column({ default: true })
  status: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createTime: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updateTime: Date;

  @ApiProperty({ description: '是否删除' })
  @Column({ default: false })
  deleted: boolean;
}