import { PartialType } from '@nestjs/swagger';
import { CreateWechatSubscribeDto } from './create-wechat-subscribe.dto';

export class UpdateWechatSubscribeDto extends PartialType(CreateWechatSubscribeDto) {}