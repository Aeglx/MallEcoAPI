import { PartialType } from '@nestjs/swagger';
import { CreateLiveOrderDto } from './create-live-order.dto';

export class UpdateLiveOrderDto extends PartialType(CreateLiveOrderDto) {}