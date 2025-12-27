import { PartialType } from '@nestjs/swagger';
import { CreateWechatFansDto } from './create-wechat-fans.dto';

export class UpdateWechatFansDto extends PartialType(CreateWechatFansDto) {}
