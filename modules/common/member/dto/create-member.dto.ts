import { IsString, IsEmail, IsMobilePhone, IsOptional, IsEnum, MinLength, MaxLength, IsDateString } from 'class-validator';
import { MemberGender, MemberLevel, MemberStatus } from '../entities/member.entity';

// 会员性别枚举
export enum MemberGender {
  MALE = 'male', // 男
  FEMALE = 'female', // 女
  OTHER = 'other', // 其他
}

export class CreateMemberDto {
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  account: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  avatar: string;

  @IsOptional()
  @IsMobilePhone('zh-CN')
  phone: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(MemberGender)
  gender: MemberGender;

  @IsOptional()
  @IsDateString()
  birthday: Date;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  introduction: string;

  @IsOptional()
  @IsEnum(MemberStatus)
  status: MemberStatus;

  @IsOptional()
  @IsEnum(MemberLevel)
  level: MemberLevel;

  @IsOptional()
  @IsString()
  wechatOpenid: string;

  @IsOptional()
  @IsString()
  qqOpenid: string;

  @IsOptional()
  @IsString()
  weiboOpenid: string;

  @IsOptional()
  @IsString()
  source: string;
}
