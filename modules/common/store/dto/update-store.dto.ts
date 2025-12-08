import { IsString, IsEnum, IsOptional, IsDecimal, IsDateString, IsEmail } from 'class-validator';
import { StoreType, StoreLevel, StoreStatus } from '../entities/store.entity';

export class UpdateStoreDto {
  @IsString({ message: '店铺名称不能为空' })
  @IsOptional()
  storeName?: string;

  @IsEnum(StoreType, { message: '店铺类型无效' })
  @IsOptional()
  storeType?: StoreType;

  @IsEnum(StoreLevel, { message: '店铺等级无效' })
  @IsOptional()
  storeLevel?: StoreLevel;

  @IsEnum(StoreStatus, { message: '店铺状态无效' })
  @IsOptional()
  storeStatus?: StoreStatus;

  @IsString({ message: '店铺Logo格式无效' })
  @IsOptional()
  storeLogo?: string;

  @IsString({ message: '店铺横幅格式无效' })
  @IsOptional()
  storeBanner?: string;

  @IsString()
  @IsOptional()
  storeDescription?: string;

  @IsString({ message: '营业执照不能为空' })
  @IsOptional()
  businessLicense?: string;

  @IsString({ message: '法人不能为空' })
  @IsOptional()
  legalPerson?: string;

  @IsString({ message: '联系人不能为空' })
  @IsOptional()
  contactPerson?: string;

  @IsString({ message: '联系电话不能为空' })
  @IsOptional()
  contactPhone?: string;

  @IsEmail({}, { message: '联系邮箱格式无效' })
  @IsOptional()
  contactEmail?: string;

  @IsString({ message: '店铺地址不能为空' })
  @IsOptional()
  address?: string;

  @IsString({ message: '省份不能为空' })
  @IsOptional()
  province?: string;

  @IsString({ message: '城市不能为空' })
  @IsOptional()
  city?: string;

  @IsString({ message: '区县不能为空' })
  @IsOptional()
  district?: string;

  @IsString({ message: '邮政编码格式无效' })
  @IsOptional()
  zipCode?: string;

  @IsString({ message: '营业时间格式无效' })
  @IsOptional()
  openingHours?: string;

  @IsString({ message: '客服电话格式无效' })
  @IsOptional()
  servicePhone?: string;

  @IsString({ message: '客服QQ格式无效' })
  @IsOptional()
  serviceQq?: string;

  @IsString({ message: '客服微信格式无效' })
  @IsOptional()
  serviceWechat?: string;

  @IsDecimal({ decimal_digits: '1,1', message: '信用评分必须是有效的数字' })
  @IsOptional()
  creditScore?: number;

  @IsString()
  @IsOptional()
  auditRemark?: string;

  @IsDateString({}, { message: '到期时间格式无效' })
  @IsOptional()
  expireTime?: string;
}
