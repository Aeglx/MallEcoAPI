import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OtherService } from './other.service';

@ApiTags('页面数据')
@Controller('buyer/other')
export class OtherController {
  constructor(private readonly otherService: OtherService) {}

  // 获取首页楼层装修数据
  @Get('pageData/getIndex')
  async indexData(@Query() params: any) {
    return this.otherService.getIndexData(params);
  }

  // 获取专题页面数据
  @Get('pageData/get/:id')
  async getTopicData(@Param('id') id: string) {
    return this.otherService.getTopicData(id);
  }

  // 获取页面数据
  @Get('pageData')
  async pageData(@Query() params: any) {
    return this.otherService.getPageData(params);
  }

  // 分页获取文章列表
  @Get('article')
  async articleList(@Query() params: any) {
    return this.otherService.getArticleList(params);
  }

  // 获取文章详情
  @Get('article/get/:id')
  async articleDetail(@Param('id') id: string) {
    return this.otherService.getArticleDetail(id);
  }

  // 获取文章分类列表
  @Get('article/articleCategory/list')
  async articleCateList() {
    return this.otherService.getArticleCategoryList();
  }
}
