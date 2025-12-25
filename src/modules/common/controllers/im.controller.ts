import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IMService } from '../services/im.service';

@ApiTags('即时通讯')
@Controller('common/common/IM')
export class IMController {
  constructor(private readonly imService: IMService) {}

  @Get()
  getUrl() {
    return { success: true, result: this.imService.getIMUrl() };
  }
}
