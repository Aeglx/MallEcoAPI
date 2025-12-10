import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export enum DistributionCashStatusEnum {
  /** 待审核 */
  PENDING = 'PENDING',
  /** 已通过 */
  APPROVED = 'APPROVED',
  /** 已拒绝 */
  REJECTED = 'REJECTED',
  /** 已完成 */
  COMPLETED = 'COMPLETED',
  /** 已取消 */
  CANCELLED = 'CANCELLED'
}

@Entity('li_distribution_cash')
export class DistributionCash {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: '提现申请ID' })
  id: string;

  @Column({ name: 'distribution_id', comment: '分销员ID' })
  @ApiProperty({ description: '分销员ID' })
  @IsString()
  @IsNotEmpty({ message: '分销员ID不能为空' })
  distributionId: string;

  @Column({ name: 'distribution_name', comment: '分销员名称' })
  @ApiProperty({ description: '分销员名称' })
  @IsString()
  @IsNotEmpty({ message: '分销员名称不能为空' })
  distributionName: string;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    comment: '提现金额' 
  })
  @ApiProperty({ description: '提现金额' })
  @IsNumber()
  @IsNotEmpty({ message: '提现金额不能为空' })
  cashAmount: number;

  @Column({ 
    name: 'cash_serial_no', 
    unique: true,
    comment: '提现流水号' 
  })
  @ApiProperty({ description: '提现流水号' })
  @IsString()
  @IsNotEmpty({ message: '提现流水号不能为空' })
  cashSerialNo: string;

  @Column({ 
    name: 'bank_account_name', 
    comment: '银行开户名' 
  })
  @ApiProperty({ description: '银行开户名' })
  @IsString()
  @IsNotEmpty({ message: '银行开户名不能为空' })
  bankAccountName: string;

  @Column({ 
    name: 'bank_account_num', 
    comment: '银行账号' 
  })
  @ApiProperty({ description: '银行账号' })
  @IsString()
  @IsNotEmpty({ message: '银行账号不能为空' })
  bankAccountNum: string;

  @Column({ 
    name: 'bank_branch_name', 
    comment: '开户支行名称' 
  })
  @ApiProperty({ description: '开户支行名称' })
  @IsString()
  @IsNotEmpty({ message: '开户支行名称不能为空' })
  bankBranchName: string;

  @Column({ 
    name: 'cash_status', 
    type: 'enum', 
    enum: DistributionCashStatusEnum, 
    default: DistributionCashStatusEnum.PENDING,
    comment: '提现状态' 
  })
  @ApiProperty({ 
    description: '提现状态', 
    enum: DistributionCashStatusEnum 
  })
  @IsString()
  @IsNotEmpty()
  cashStatus: DistributionCashStatusEnum;

  @Column({ 
    name: 'audit_remark', 
    type: 'text',
    nullable: true,
    comment: '审核备注' 
  })
  @ApiProperty({ description: '审核备注' })
  @IsString()
  @IsOptional()
  auditRemark: string;

  @Column({ 
    name: 'audit_time', 
    type: 'datetime',
    nullable: true,
    comment: '审核时间' 
  })
  @ApiProperty({ description: '审核时间' })
  @IsOptional()
  auditTime: Date;

  @Column({ 
    name: 'audit_by', 
    nullable: true,
    comment: '审核人' 
  })
  @ApiProperty({ description: '审核人' })
  @IsString()
  @IsOptional()
  auditBy: string;

  @CreateDateColumn({ 
    name: 'create_time', 
    type: 'datetime', 
    comment: '创建时间' 
  })
  @ApiProperty({ description: '创建时间' })
  createTime: Date;

  @Column({ name: 'create_by', comment: '创建者' })
  @ApiProperty({ description: '创建者' })
  @IsString()
  @IsOptional()
  createBy: string;

  @Column({ name: 'delete_flag', type: 'boolean', default: false, comment: '删除标志' })
  @ApiProperty({ description: '删除标志' })
  @IsOptional()
  deleteFlag: boolean = false;
}