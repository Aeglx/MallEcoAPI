import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { DistributionStatusEnum } from '../enums/distribution-status.enum';

@Entity('li_distribution')
export class Distribution {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: '分销员ID' })
  id: string;

  @Column({ name: 'member_id', comment: '会员ID' })
  @ApiProperty({ description: '会员ID' })
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @Column({ name: 'member_name', comment: '会员名称' })
  @ApiProperty({ description: '会员名称' })
  @IsString()
  @IsNotEmpty()
  memberName: string;

  @Column({ name: 'name', comment: '会员姓名' })
  @ApiProperty({ description: '会员姓名' })
  @IsString()
  @IsOptional()
  name: string;

  @Column({ name: 'id_number', comment: '身份证号' })
  @ApiProperty({ description: '身份证号' })
  @IsString()
  @IsOptional()
  idNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '分销总额' })
  @ApiProperty({ description: '分销总额' })
  @IsNumber()
  rebateTotal: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '可提现金额' })
  @ApiProperty({ description: '可提现金额' })
  @IsNumber()
  canRebate: number = 0;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '冻结金额' })
  @ApiProperty({ description: '冻结金额' })
  @IsNumber()
  commissionFrozen: number = 0;

  @Column({ name: 'distribution_order_count', type: 'int', default: 0, comment: '分销订单数' })
  @ApiProperty({ description: '分销订单数' })
  @IsNumber()
  distributionOrderCount: number = 0;

  @Column({ 
    name: 'distribution_status', 
    type: 'enum', 
    enum: DistributionStatusEnum, 
    default: DistributionStatusEnum.APPLY,
    comment: '分销员状态' 
  })
  @ApiProperty({ 
    description: '分销员状态', 
    enum: DistributionStatusEnum,
    default: DistributionStatusEnum.APPLY 
  })
  @IsString()
  @IsNotEmpty()
  distributionStatus: DistributionStatusEnum;

  @Column({ 
    name: 'settlement_bank_account_name', 
    type: 'varchar', 
    length: 200,
    comment: '结算银行开户行名称' 
  })
  @ApiProperty({ description: '结算银行开户行名称' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: '结算银行开户行名称长度为1-200位' })
  settlementBankAccountName: string;

  @Column({ 
    name: 'settlement_bank_account_num', 
    type: 'varchar', 
    length: 200,
    comment: '结算银行开户账号' 
  })
  @ApiProperty({ description: '结算银行开户账号' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: '结算银行开户账号长度为1-200位' })
  settlementBankAccountNum: string;

  @Column({ 
    name: 'settlement_bank_branch_name', 
    type: 'varchar', 
    length: 200,
    comment: '结算银行开户支行名称' 
  })
  @ApiProperty({ description: '结算银行开户支行名称' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: '结算银行开户支行名称长度为1-200位' })
  settlementBankBranchName: string;

  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    default: 0, 
    name: 'distribution_order_price',
    comment: '分销订单金额' 
  })
  @ApiProperty({ description: '分销订单金额' })
  @IsNumber()
  distributionOrderPrice: number = 0;

  @CreateDateColumn({ 
    name: 'create_time', 
    type: 'datetime', 
    comment: '创建时间' 
  })
  @ApiProperty({ description: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ 
    name: 'update_time', 
    type: 'datetime', 
    comment: '更新时间' 
  })
  @ApiProperty({ description: '更新时间' })
  updateTime: Date;

  @Column({ name: 'create_by', comment: '创建者' })
  @ApiProperty({ description: '创建者' })
  @IsString()
  @IsOptional()
  createBy: string;

  @Column({ name: 'update_by', comment: '更新者' })
  @ApiProperty({ description: '更新者' })
  @IsString()
  @IsOptional()
  updateBy: string;

  @Column({ name: 'delete_flag', type: 'boolean', default: false, comment: '删除标志' })
  @ApiProperty({ description: '删除标志' })
  @IsOptional()
  deleteFlag: boolean = false;
}