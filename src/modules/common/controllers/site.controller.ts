import { Controller, Get } from '@nestjs/common';
import { SiteService } from '../services/site.service';

@Controller('common/common')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Get('site')
  baseSetting() {
    return this.siteService.getBaseSetting();
  }
}