import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SiteService } from '../services/site.service';

@ApiTags('通用')
@Controller('common/common')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get('site')
  baseSetting() {
    return this.siteService.getBaseSetting();
  }
}