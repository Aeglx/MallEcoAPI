import { Controller, Get } from '@nestjs/common';
import { IMService } from '../services/im.service';

@Controller('common/common/IM')
export class IMController {
  constructor(private readonly imService: IMService) {}

  @Get()
  getUrl() {
    return { success: true, result: this.imService.getIMUrl() };
  }
}
