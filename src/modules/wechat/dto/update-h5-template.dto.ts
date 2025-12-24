import { PartialType } from '@nestjs/swagger';
import { CreateH5TemplateDto } from './create-h5-template.dto';

export class UpdateH5TemplateDto extends PartialType(CreateH5TemplateDto) {}