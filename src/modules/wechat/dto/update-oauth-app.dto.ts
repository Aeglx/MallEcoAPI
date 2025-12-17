import { PartialType } from '@nestjs/swagger';
import { CreateOauthAppDto } from './create-oauth-app.dto';

export class UpdateOauthAppDto extends PartialType(CreateOauthAppDto) {}