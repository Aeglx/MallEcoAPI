import { PartialType } from '@nestjs/swagger';
import { CreateLiveGoodsDto } from './create-live-goods.dto';

export class UpdateLiveGoodsDto extends PartialType(CreateLiveGoodsDto) {}