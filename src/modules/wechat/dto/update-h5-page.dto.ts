import { PartialType } from '@nestjs/swagger';
import { CreateH5PageDto } from './create-h5-page.dto';

export class UpdateH5PageDto extends PartialType(CreateH5PageDto) {}
