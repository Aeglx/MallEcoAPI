import { PartialType } from '@nestjs/swagger';
import { CreateLiveChatDto } from './create-live-chat.dto';

export class UpdateLiveChatDto extends PartialType(CreateLiveChatDto) {}