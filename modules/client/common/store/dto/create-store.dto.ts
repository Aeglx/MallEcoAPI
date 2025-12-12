import { IsString, IsEnum, IsOptional, IsDecimal, IsDateString, IsEmail, Matches } from 'class-validator';
import { StoreType, StoreLevel, StoreStatus } from '../entities/store.entity';

export class CreateStoreDto {
  @IsString({ message: '店铺名称不能为空' })
  storeName: string;

  @IsEnum(StoreType, { message: '店铺类型无效' })
  storeType: StoreType;

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
  businessLicense: string;

  @IsString({ message: '法人不能为空' })
  legalPerson: string;

  @IsString({ message: '联系人不能为空' })
  contactPerson: string;

  @IsString({ message: '联系电话不能为空' })
  contactPhone: string;

  @IsEmail({}, { message: '联系邮箱格式无效' })
  @IsOptional()
  contactEmail?: string;

  @IsString({ message: '店铺地址不能为空' })
  address: string;

  @IsString({ message: '省份不能为空' })
  province: string;

  @IsString({ message: '城市不能为空' })
  city: string;

  @IsString({ message: '区县不能为空' })
  district: string;

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

  @IsDecimal({ decimal_digits: '1,1' })
  @IsOptional()
  creditScore?: number;

  @IsDateString({}, { message: '到期时间格式无效' })
  @IsOptional()
  expireTime?: string;
}
