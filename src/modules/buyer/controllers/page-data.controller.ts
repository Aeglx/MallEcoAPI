import { Controller, Get, Query, Param } from '@nestjs/common';
import { PageDataService } from '../services/page-data.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('页面数据')
@Controller('buyer/other/pageData')
export class PageDataController {
  constructor(private readonly pageDataService: PageDataService) {}

  @Get('getIndex')
  getIndex(@Query('clientType') clientType: string) {
    return this.pageDataService.getIndexData(clientType);
  }

  @Get()
  get(@Query() pageDataDTO: any) {
    return this.pageDataService.getPageData(pageDataDTO);
  }

  @Get('getStore')
  getShopPage(@Query('clientType') clientType: string, @Query('storeId') storeId: string) {
    return this.pageDataService.getStorePage(clientType, storeId);
  }

  @Get('get/:id')
  getPage(@Param('id') id: string) {
    return this.pageDataService.getSpecial(id);
  }

  @Get('getSpecial')
  getSpecial(@Query('body') body: string) {
    return this.pageDataService.getSpecialByBody(body);
  }
}