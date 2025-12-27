import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('mall_file', { comment: '文件表' })
export class MallFile {
  @PrimaryGeneratedColumn('uuid', { name: 'id', comment: '文件ID' })
  id: string;

  @Column({ name: 'file_name', type: 'varchar', length: 200, nullable: false, comment: '文件名称' })
  fileName: string;

  @Column({ name: 'file_path', type: 'varchar', length: 500, nullable: false, comment: '文件路径' })
  filePath: string;

  @Column({ name: 'file_url', type: 'varchar', length: 500, nullable: false, comment: '文件URL' })
  fileUrl: string;

  @Column({ name: 'file_size', type: 'bigint', nullable: false, comment: '文件大小(字节)' })
  fileSize: number;

  @Column({ name: 'file_type', type: 'varchar', length: 50, nullable: true, comment: '文件类型' })
  fileType: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100, nullable: true, comment: 'MIME类型' })
  mimeType: string;

  @Column({
    name: 'storage_type',
    type: 'varchar',
    length: 50,
    nullable: false,
    default: 'local',
    comment: '存储类型: local-本地 oss-阿里云OSS',
  })
  storageType: string;

  @Column({
    name: 'business_type',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '业务类型',
  })
  businessType: string;

  @Column({ name: 'business_id', type: 'varchar', length: 36, nullable: true, comment: '业务ID' })
  businessId: string;

  @Column({ name: 'uploader_id', type: 'varchar', length: 36, nullable: true, comment: '上传人ID' })
  uploaderId: string;

  @Column({
    name: 'uploader_name',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '上传人名称',
  })
  uploaderName: string;

  @Column({
    name: 'status',
    type: 'tinyint',
    nullable: false,
    default: 1,
    comment: '状态: 0-禁用 1-启用',
  })
  status: number;

  @Column({ name: 'md5', type: 'varchar', length: 100, nullable: true, comment: '文件MD5' })
  md5: string;

  @Column({ name: 'sha1', type: 'varchar', length: 100, nullable: true, comment: '文件SHA1' })
  sha1: string;

  @Column({
    name: 'upload_time',
    type: 'datetime',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    comment: '上传时间',
  })
  uploadTime: Date;

  @CreateDateColumn({ name: 'create_time', type: 'datetime', nullable: false, comment: '创建时间' })
  createTime: Date;
}
