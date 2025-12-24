import { Controller, Get, Query } from '@nestjs/common';
import { AddressService } from './address.service';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  // 传给后台citycode 获取城市街道等id
  @Get('region')
  async handleRegion(@Query() params: any) {
    return this.addressService.handleRegion(params);
  }
}