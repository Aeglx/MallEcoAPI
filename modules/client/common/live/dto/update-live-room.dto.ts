import { PartialType } from '@nestjs/swagger';
import { CreateLiveRoomDto } from './create-live-room.dto';

export class UpdateLiveRoomDto extends PartialType(CreateLiveRoomDto) {}