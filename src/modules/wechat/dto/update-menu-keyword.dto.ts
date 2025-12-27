import { PartialType } from '@nestjs/swagger';
import { CreateMenuKeywordDto } from './create-menu-keyword.dto';

export class UpdateMenuKeywordDto extends PartialType(CreateMenuKeywordDto) {}
